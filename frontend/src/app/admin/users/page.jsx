'use client'

import { useState, useEffect } from 'react'
import api from '../../../lib/axios'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data.users)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (id, isActive) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { isActive: !isActive })
      toast.success(`User ${!isActive ? 'unblocked' : 'blocked'}!`)
      fetchUsers()
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '24px' }}>
        Manage Users
      </h1>

      {loading ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)' }}>Loading...</p>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-default)' }}>
                {['User', 'Phone', 'Role', 'Ads', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                        {u.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span style={{ fontWeight: '500', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>{u.name || 'No Name'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: 'var(--text-secondary)' }}>{u.phone}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', fontFamily: 'Inter, sans-serif', background: u.role === 'admin' ? '#dbeafe' : '#f3f4f6', color: u.role === 'admin' ? '#1d4ed8' : '#374151' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: 'var(--text-secondary)' }}>{u.totalAds}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', fontFamily: 'Inter, sans-serif', background: u.isActive ? '#d1fae5' : '#fee2e2', color: u.isActive ? '#065f46' : '#991b1b' }}>
                      {u.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {u.role !== 'admin' && (
                      <button onClick={() => handleToggleStatus(u._id, u.isActive)} style={{
                        padding: '6px 12px', borderRadius: '6px', fontSize: '12px',
                        fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                        border: 'none',
                        background: u.isActive ? '#fee2e2' : '#d1fae5',
                        color: u.isActive ? '#991b1b' : '#065f46',
                      }}>
                        {u.isActive ? 'Block' : 'Unblock'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}