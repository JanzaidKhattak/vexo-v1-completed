'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import api from '../../../lib/axios'
import toast from 'react-hot-toast'

export default function AdminManagementPage() {
  const { admin, isSuperAdmin } = useAdminAuth()
  const getToken = () => localStorage.getItem('vexo_admin_token')

  const [admins, setAdmins] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('admins')

  // Add Admin Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adding, setAdding] = useState(false)

  // Reset Password Modal
  const [showResetModal, setShowResetModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetting, setResetting] = useState(false)

  const headers = { Authorization: `Bearer ${getToken()}` }

  useEffect(() => {
    if (!isSuperAdmin()) {
      toast.error('Super Admin access required')
      return
    }
    fetchAdmins()
    fetchLogs()
  }, [])

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/admin/admins', { headers })
      setAdmins(res.data.admins)
    } catch (err) {
      toast.error('Failed to load admins')
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/activity-logs', { headers })
      setLogs(res.data.logs)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddAdmin = async () => {
    if (!firstName || !email || !password) {
      toast.error('First name, email and password required')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setAdding(true)
    try {
      await api.post('/admin/admins', { firstName, lastName, email, password }, { headers })
      toast.success('Admin added successfully!')
      setShowAddModal(false)
      setFirstName(''); setLastName(''); setEmail(''); setPassword('')
      fetchAdmins()
      fetchLogs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add admin')
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteAdmin = async (id, adminEmail) => {
    if (!window.confirm(`Are you sure you want to delete admin: ${adminEmail}?`)) return
    try {
      await api.delete(`/admin/admins/${id}`, { headers })
      toast.success('Admin deleted!')
      fetchAdmins()
      fetchLogs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete admin')
    }
  }

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setResetting(true)
    try {
      await api.patch(`/admin/admins/${selectedAdmin._id}/reset-password`, { password: newPassword }, { headers })
      toast.success(`Password reset for ${selectedAdmin.email}!`)
      setShowResetModal(false)
      setNewPassword('')
      setSelectedAdmin(null)
      fetchLogs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setResetting(false)
    }
  }

  const actionLabels = {
    add_admin: { label: '➕ Added Admin', color: '#D1FAE5', text: '#065F46' },
    delete_admin: { label: '🗑️ Deleted Admin', color: '#FEE2E2', text: '#991B1B' },
    reset_password: { label: '🔑 Reset Password', color: '#FEF3C7', text: '#92400E' },
    approve_ad: { label: '✅ Approved Ad', color: '#D1FAE5', text: '#065F46' },
    reject_ad: { label: '❌ Rejected Ad', color: '#FEE2E2', text: '#991B1B' },
    block_user: { label: '🚫 Blocked User', color: '#FEE2E2', text: '#991B1B' },
    unblock_user: { label: '✅ Unblocked User', color: '#D1FAE5', text: '#065F46' },
    update_settings: { label: '⚙️ Updated Settings', color: '#EDE9FE', text: '#6C3AF5' },
    update_role: { label: '👑 Updated Role', color: '#DBEAFE', text: '#1D4ED8' },
  }

  if (!isSuperAdmin()) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</p>
        <h2 style={{ fontFamily: 'Inter, sans-serif', color: '#0f172a', fontWeight: '800' }}>Super Admin Only</h2>
        <p style={{ color: '#64748B', fontFamily: 'Inter, sans-serif' }}>You don't have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            👑 Admin Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
            Manage admins and view activity logs
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{
          padding: '10px 20px', background: '#6C3AF5', color: 'white',
          border: 'none', borderRadius: '10px', fontWeight: '700',
          fontFamily: 'Inter, sans-serif', cursor: 'pointer', fontSize: '14px',
        }}>
          ➕ Add Admin
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[{ key: 'admins', label: '👥 Admins' }, { key: 'logs', label: '📋 Activity Logs' }].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '8px 20px', borderRadius: '8px', fontSize: '13px',
            fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer', border: 'none',
            background: activeTab === t.key ? '#6C3AF5' : 'white',
            color: activeTab === t.key ? 'white' : '#64748B',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ADMINS TAB */}
      {activeTab === 'admins' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading ? (
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#94A3B8' }}>Loading...</p>
          ) : admins.map(a => {
            const isSelf = a._id === admin?._id
            const name = `${a.firstName || ''} ${a.lastName || ''}`.trim()
            const initial = (a.firstName?.charAt(0) || 'A').toUpperCase()

            return (
              <div key={a._id} style={{
                background: 'white', borderRadius: '14px', padding: '20px',
                border: a.role === 'super-admin' ? '2px solid #6C3AF5' : '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: a.role === 'super-admin' ? 'linear-gradient(135deg, #6C3AF5, #9B6DFF)' : '#E2E8F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: a.role === 'super-admin' ? 'white' : '#64748B',
                  fontWeight: '800', fontSize: '18px', fontFamily: 'Inter, sans-serif', flexShrink: 0,
                }}>
                  {a.avatar ? <img src={a.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initial}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <p style={{ fontWeight: '700', fontFamily: 'Inter, sans-serif', color: '#0f172a', fontSize: '15px' }}>
                      {name} {isSelf && <span style={{ fontSize: '12px', color: '#6C3AF5' }}>(You)</span>}
                    </p>
                    <span style={{
                      padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                      fontFamily: 'Inter, sans-serif',
                      background: a.role === 'super-admin' ? '#EDE9FE' : '#F1F5F9',
                      color: a.role === 'super-admin' ? '#6C3AF5' : '#475569',
                    }}>
                      {a.role === 'super-admin' ? '👑 Super Admin' : '🔧 Admin'}
                    </span>
                  </div>
                  <p style={{ color: '#64748B', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>{a.email}</p>
                  <p style={{ color: '#94A3B8', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                    Joined: {new Date(a.createdAt).toLocaleDateString('en-PK')}
                  </p>
                </div>

                {!isSelf && a.role !== 'super-admin' && (
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button onClick={() => { setSelectedAdmin(a); setShowResetModal(true) }} style={{
                      padding: '8px 14px', background: '#FEF3C7', color: '#92400E',
                      border: 'none', borderRadius: '8px', fontSize: '12px',
                      fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                    }}>🔑 Reset Password</button>
                    <button onClick={() => handleDeleteAdmin(a._id, a.email)} style={{
                      padding: '8px 14px', background: '#FEE2E2', color: '#991B1B',
                      border: 'none', borderRadius: '8px', fontSize: '12px',
                      fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                    }}>🗑️ Delete</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* LOGS TAB */}
      {activeTab === 'logs' && (
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          {logs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>No activity logs yet</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Admin', 'Action', 'Details', 'Time'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const actionInfo = actionLabels[log.action] || { label: log.action, color: '#F1F5F9', text: '#475569' }
                  const adminName = `${log.performedBy?.firstName || ''} ${log.performedBy?.lastName || ''}`.trim() || log.performedBy?.email || 'Unknown'
                  return (
                    <tr key={log._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ fontWeight: '600', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#0f172a' }}>{adminName}</p>
                        <p style={{ color: '#94A3B8', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>{log.performedBy?.email}</p>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '20px', fontSize: '11px',
                          fontWeight: '600', fontFamily: 'Inter, sans-serif',
                          background: actionInfo.color, color: actionInfo.text,
                        }}>{actionInfo.label}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#64748B', maxWidth: '250px' }}>
                        {log.details}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', fontFamily: 'Inter, sans-serif', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString('en-PK')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ADD ADMIN MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '440px', width: '100%' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Inter, sans-serif', color: '#0f172a', marginBottom: '24px' }}>
              ➕ Add New Admin
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748B', fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>First Name *</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ali"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748B', fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>Last Name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Khan"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748B', fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>Email *</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@vexo.com" type="email"
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748B', fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>Password *</label>
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" type="password"
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setShowAddModal(false); setFirstName(''); setLastName(''); setEmail(''); setPassword('') }} style={{
                flex: 1, padding: '11px', background: '#F1F5F9', color: '#64748B',
                border: 'none', borderRadius: '10px', fontWeight: '600',
                fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleAddAdmin} disabled={adding} style={{
                flex: 1, padding: '11px', background: '#6C3AF5', color: 'white',
                border: 'none', borderRadius: '10px', fontWeight: '700',
                fontFamily: 'Inter, sans-serif', cursor: adding ? 'not-allowed' : 'pointer',
                opacity: adding ? 0.7 : 1,
              }}>{adding ? 'Adding...' : '➕ Add Admin'}</button>
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && selectedAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Inter, sans-serif', color: '#0f172a', marginBottom: '8px' }}>
              🔑 Reset Password
            </h3>
            <p style={{ color: '#64748B', fontFamily: 'Inter, sans-serif', fontSize: '14px', marginBottom: '24px' }}>
              For: <strong>{selectedAdmin.email}</strong>
            </p>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748B', fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>New Password *</label>
              <input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" type="password"
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setShowResetModal(false); setNewPassword(''); setSelectedAdmin(null) }} style={{
                flex: 1, padding: '11px', background: '#F1F5F9', color: '#64748B',
                border: 'none', borderRadius: '10px', fontWeight: '600',
                fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleResetPassword} disabled={resetting} style={{
                flex: 1, padding: '11px', background: '#6C3AF5', color: 'white',
                border: 'none', borderRadius: '10px', fontWeight: '700',
                fontFamily: 'Inter, sans-serif', cursor: resetting ? 'not-allowed' : 'pointer',
                opacity: resetting ? 0.7 : 1,
              }}>{resetting ? 'Resetting...' : '🔑 Reset Password'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}