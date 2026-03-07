'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import api from '../../../lib/axios'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const { admin } = useAdminAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Block Modal
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [blockReason, setBlockReason] = useState('')
  const [blocking, setBlocking] = useState(false)

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')
  const [deleting, setDeleting] = useState(false)

  const getToken = () => localStorage.getItem('vexo_admin_token')
  const headers = { Authorization: `Bearer ${getToken()}` }

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', { headers })
      setUsers(res.data.users)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBlock = async () => {
    if (!blockReason.trim()) { toast.error('Please provide a reason'); return }
    setBlocking(true)
    try {
      await api.patch(`/admin/users/${selectedUser._id}/status`, 
        { isActive: false, reason: blockReason }, 
        { headers }
      )
      toast.success('User blocked!')
      setShowBlockModal(false)
      setBlockReason('')
      setSelectedUser(null)
      fetchUsers()
    } catch {
      toast.error('Failed to block user')
    } finally {
      setBlocking(false)
    }
  }

  const handleUnblock = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { isActive: true }, { headers })
      toast.success('User unblocked!')
      fetchUsers()
    } catch {
      toast.error('Failed to unblock user')
    }
  }

  const handleDelete = async () => {
    if (!deleteReason.trim()) { toast.error('Please provide a reason'); return }
    setDeleting(true)
    try {
      await api.delete(`/admin/users/${selectedUser._id}`, { 
        headers, 
        data: { reason: deleteReason } 
      })
      toast.success('User deleted!')
      setShowDeleteModal(false)
      setDeleteReason('')
      setSelectedUser(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #E2E8F0', borderRadius: '8px',
    fontSize: '14px', fontFamily: 'Inter, sans-serif',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Manage Users
        </h1>
        <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
          {users.length} total users
        </p>
      </div>

      {loading ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#94A3B8' }}>Loading...</p>
      ) : (
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['User', 'Email', 'Phone', 'Role', 'Verified', 'Ads', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'No Name'
                const initial = (u.firstName?.charAt(0) || u.email?.charAt(0) || 'U').toUpperCase()
                const isSelf = u._id === admin?._id
                const isAdminUser = ['admin', 'super-admin'].includes(u.role)

                return (
                  <tr key={u._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    {/* User */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: u.avatar ? 'transparent' : '#6C3AF5',
                          overflow: 'hidden', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', color: 'white', fontWeight: '700',
                          fontSize: '14px', fontFamily: 'Inter, sans-serif', flexShrink: 0,
                        }}>
                          {u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
                        </div>
                        <div>
                          <p style={{ fontWeight: '600', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#0f172a' }}>
                            {name} {isSelf && <span style={{ fontSize: '11px', color: '#6C3AF5' }}>(You)</span>}
                          </p>
                          {u.blockReason && !u.isActive && (
                            <p style={{ fontSize: '11px', color: '#EF4444', fontFamily: 'Inter, sans-serif' }}>
                              🚫 {u.blockReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#64748B' }}>{u.email || 'N/A'}</td>

                    {/* Phone */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#64748B' }}>{u.phone || 'N/A'}</td>

                    {/* Role */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '12px', fontSize: '11px',
                        fontWeight: '600', fontFamily: 'Inter, sans-serif',
                        background: u.role === 'super-admin' ? '#EDE9FE' : u.role === 'admin' ? '#DBEAFE' : '#F1F5F9',
                        color: u.role === 'super-admin' ? '#6C3AF5' : u.role === 'admin' ? '#1D4ED8' : '#475569',
                      }}>
                        {u.role === 'super-admin' ? '👑 Super' : u.role === 'admin' ? '🔧 Admin' : '👤 User'}
                      </span>
                    </td>

                    {/* Verified */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '12px', fontSize: '11px',
                        fontWeight: '600', fontFamily: 'Inter, sans-serif',
                        background: u.isEmailVerified ? '#D1FAE5' : '#F1F5F9',
                        color: u.isEmailVerified ? '#065F46' : '#94A3B8',
                      }}>
                        {u.isEmailVerified ? '✓ Yes' : 'No'}
                      </span>
                    </td>

                    {/* Ads */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#64748B' }}>{u.totalAds}</td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '12px', fontSize: '11px',
                        fontWeight: '600', fontFamily: 'Inter, sans-serif',
                        background: u.isActive ? '#D1FAE5' : '#FEE2E2',
                        color: u.isActive ? '#065F46' : '#991B1B',
                      }}>
                        {u.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      {!isSelf && !isAdminUser && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {u.isActive ? (
                            <button onClick={() => { setSelectedUser(u); setShowBlockModal(true) }} style={{
                              padding: '5px 10px', borderRadius: '6px', fontSize: '11px',
                              fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer', border: 'none',
                              background: '#FEE2E2', color: '#991B1B',
                            }}>🚫 Block</button>
                          ) : (
                            <button onClick={() => handleUnblock(u._id)} style={{
                              padding: '5px 10px', borderRadius: '6px', fontSize: '11px',
                              fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer', border: 'none',
                              background: '#D1FAE5', color: '#065F46',
                            }}>✅ Unblock</button>
                          )}
                          <button onClick={() => { setSelectedUser(u); setShowDeleteModal(true) }} style={{
                            padding: '5px 10px', borderRadius: '6px', fontSize: '11px',
                            fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer', border: 'none',
                            background: '#F1F5F9', color: '#EF4444',
                          }}>🗑️ Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* BLOCK MODAL */}
      {showBlockModal && selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Inter, sans-serif', color: '#0f172a', marginBottom: '8px' }}>🚫 Block User</h3>
            <p style={{ color: '#64748B', fontFamily: 'Inter, sans-serif', fontSize: '14px', marginBottom: '20px' }}>
              Blocking: <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> ({selectedUser.email})
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748B', fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>
                Reason for blocking *
              </label>
              <textarea
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                placeholder="e.g. Posting spam ads, Fake listings, Abusive behavior..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
              <p style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginTop: '4px' }}>
                This reason will be shown to the user when they try to login.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setShowBlockModal(false); setBlockReason(''); setSelectedUser(null) }} style={{
                flex: 1, padding: '11px', background: '#F1F5F9', color: '#64748B',
                border: 'none', borderRadius: '10px', fontWeight: '600',
                fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleBlock} disabled={blocking} style={{
                flex: 1, padding: '11px', background: '#EF4444', color: 'white',
                border: 'none', borderRadius: '10px', fontWeight: '700',
                fontFamily: 'Inter, sans-serif', cursor: blocking ? 'not-allowed' : 'pointer',
                opacity: blocking ? 0.7 : 1,
              }}>{blocking ? 'Blocking...' : '🚫 Block User'}</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Inter, sans-serif', color: '#0f172a', marginBottom: '8px' }}>🗑️ Delete User</h3>
            <p style={{ color: '#64748B', fontFamily: 'Inter, sans-serif', fontSize: '14px', marginBottom: '4px' }}>
              Deleting: <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> ({selectedUser.email})
            </p>
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px' }}>
              <p style={{ color: '#EF4444', fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: '600' }}>
                ⚠️ This action is permanent. All user ads will also be deleted.
              </p>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748B', fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>
                Reason for deletion *
              </label>
              <textarea
                value={deleteReason}
                onChange={e => setDeleteReason(e.target.value)}
                placeholder="e.g. Multiple policy violations, Fraudulent activity..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setShowDeleteModal(false); setDeleteReason(''); setSelectedUser(null) }} style={{
                flex: 1, padding: '11px', background: '#F1F5F9', color: '#64748B',
                border: 'none', borderRadius: '10px', fontWeight: '600',
                fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} style={{
                flex: 1, padding: '11px', background: '#EF4444', color: 'white',
                border: 'none', borderRadius: '10px', fontWeight: '700',
                fontFamily: 'Inter, sans-serif', cursor: deleting ? 'not-allowed' : 'pointer',
                opacity: deleting ? 0.7 : 1,
              }}>{deleting ? 'Deleting...' : '🗑️ Delete Permanently'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}