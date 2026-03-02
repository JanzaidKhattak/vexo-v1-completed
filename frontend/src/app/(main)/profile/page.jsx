'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../lib/axios'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const router = useRouter()
  const [myAds, setMyAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    setName(user.name || '')
    setEmail(user.email || '')
    fetchMyAds()
  }, [user])

  const fetchMyAds = async () => {
    try {
      const res = await api.get('/users/my-ads')
      setMyAds(res.data.ads)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      const res = await api.put('/users/profile', { name, email })
      updateUser(res.data.user)
      toast.success('Profile updated!')
      setEditing(false)
    } catch {
      toast.error('Update failed')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
    toast.success('Logged out!')
  }

  if (!user) return null

  return (
    <div className="page-container" style={{ padding: '32px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Profile Card */}
        <div style={{
          background: 'white', borderRadius: '16px',
          padding: '32px', marginBottom: '24px',
          border: '1px solid var(--border-default)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'var(--brand-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '28px', fontWeight: '700',
              fontFamily: 'Inter, sans-serif',
            }}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'Inter, sans-serif' }}>
                {user.name || 'No Name'}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                {user.phone}
              </p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
              <button onClick={() => setEditing(!editing)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
              <button onClick={handleLogout} style={{
                padding: '8px 16px', fontSize: '13px',
                background: 'none', border: '1.5px solid var(--danger)',
                color: 'var(--danger)', borderRadius: '8px',
                cursor: 'pointer', fontWeight: '600', fontFamily: 'Inter, sans-serif',
              }}>
                Logout
              </button>
            </div>
          </div>

          {editing && (
            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    width: '100%', padding: '10px 14px',
                    border: '1.5px solid var(--border-default)',
                    borderRadius: '8px', fontSize: '14px',
                    fontFamily: 'Inter, sans-serif', outline: 'none',
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>Email</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email"
                  style={{
                    width: '100%', padding: '10px 14px',
                    border: '1.5px solid var(--border-default)',
                    borderRadius: '8px', fontSize: '14px',
                    fontFamily: 'Inter, sans-serif', outline: 'none',
                  }}
                />
              </div>
              <button onClick={handleUpdate} className="btn-primary" style={{ padding: '10px 24px' }}>
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* My Ads */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-default)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '20px' }}>
            My Ads ({myAds.length})
          </h2>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>Loading...</p>
          ) : myAds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>No ads yet</p>
              <button onClick={() => router.push('/post-ad')} className="btn-primary">Post Your First Ad</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myAds.map(ad => (
                <div key={ad._id} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px', border: '1px solid var(--border-default)',
                  borderRadius: '10px',
                }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '8px',
                    background: 'var(--bg-tertiary)', overflow: 'hidden', flexShrink: 0,
                  }}>
                    {ad.images?.[0] ? (
                      <img src={ad.images[0]} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📷</div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>{ad.title}</p>
                    <p style={{ color: 'var(--brand-primary)', fontWeight: '700', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
                      Rs {ad.price?.toLocaleString()}
                    </p>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
                    fontWeight: '600', fontFamily: 'Inter, sans-serif',
                    background: ad.status === 'active' ? '#d1fae5' : ad.status === 'pending' ? '#fef3c7' : '#fee2e2',
                    color: ad.status === 'active' ? '#065f46' : ad.status === 'pending' ? '#92400e' : '#991b1b',
                  }}>
                    {ad.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}