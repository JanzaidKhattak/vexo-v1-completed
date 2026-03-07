'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../lib/axios'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, logout, updateUser, refreshUser } = useAuth()
  const router = useRouter()
  const fileRef = useRef(null)

  const [myAds, setMyAds] = useState([])
  const [soldAds, setSoldAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('active')
  const [saving, setSaving] = useState(false)

  // Profile fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  // Email verification
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    setFirstName(user.firstName || '')
    setLastName(user.lastName || '')
    setPhone(user.phone || '')
    setAddress(user.address || '')
    setAvatarPreview(user.avatar || '')
    fetchMyAds()
  }, [user])

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer > 0) {
      const t = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [otpTimer])

  const fetchMyAds = async () => {
    try {
      const [activeRes, soldRes] = await Promise.all([
        api.get('/users/my-ads'),
        api.get('/users/my-ads?status=sold'),
      ])
      setMyAds(activeRes.data.ads.filter(a => a.status !== 'sold'))
      setSoldAds(soldRes.data.ads.filter(a => a.status === 'sold'))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleUpdate = async () => {
    if (!phone) { toast.error('Phone number is required'); return }
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('firstName', firstName)
      formData.append('lastName', lastName)
      formData.append('phone', phone)
      formData.append('address', address)
      if (avatarFile) formData.append('avatar', avatarFile)

      const res = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      updateUser(res.data.user)
      toast.success('Profile updated successfully!')
      setEditing(false)
      setAvatarFile(null)
    } catch {
      toast.error('Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleSendOtp = async () => {
    setOtpLoading(true)
    try {
      await api.post('/auth/send-verify-otp')
      toast.success('Verification code sent to your email!')
      setShowOtpInput(true)
      setOtpTimer(120)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send code')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) { toast.error('Please enter 6-digit code'); return }
    setOtpLoading(true)
    try {
      await api.post('/auth/verify-email', { otp })
      toast.success('🎉 Email verified successfully!')
      setShowOtpInput(false)
      setOtp('')
      await refreshUser()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
    toast.success('Logged out successfully!')
  }

  const handleView = (adId) => window.open(`/ads/${adId}`, '_blank')

  const handleEdit = (adId) => {
    if (window.confirm('Are you sure you want to edit this ad? It will go back to review after editing.'))
      router.push(`/post-ad?edit=${adId}`)
  }

  const handleDelete = async (ad) => {
    if (!window.confirm(`Are you sure you want to delete "${ad.title}"? This action cannot be undone.`)) return
    try {
      await api.delete(`/ads/${ad._id}`)
      toast.success('Ad deleted successfully!')
      fetchMyAds()
    } catch { toast.error('Delete failed') }
  }

  const handleMarkSold = async (ad) => {
    if (!window.confirm(`Has "${ad.title}" been sold? It will be removed from public listing.`)) return
    try {
      await api.patch(`/ads/${ad._id}/sold`)
      toast.success('Ad marked as sold!')
      fetchMyAds()
    } catch { toast.error('Failed to mark as sold') }
  }

  const statusColor = (status) => {
    if (status === 'active') return { bg: '#d1fae5', color: '#065f46' }
    if (status === 'pending') return { bg: '#fef3c7', color: '#92400e' }
    if (status === 'rejected') return { bg: '#fee2e2', color: '#991b1b' }
    if (status === 'sold') return { bg: '#e0e7ff', color: '#3730a3' }
    return { bg: '#f3f4f6', color: '#374151' }
  }

  const btnStyle = (bg, color) => ({
    padding: '6px 12px', fontSize: '12px', fontWeight: '600',
    fontFamily: 'Inter, sans-serif', border: 'none', borderRadius: '7px',
    cursor: 'pointer', background: bg, color: color,
  })

  if (!user) return null

  const displayAds = activeTab === 'sold' ? soldAds : myAds.filter(ad => {
    if (activeTab === 'active') return ad.status === 'active'
    if (activeTab === 'pending') return ad.status === 'pending'
    if (activeTab === 'rejected') return ad.status === 'rejected'
    return true
  })

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
  const initials = (user.firstName?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()

  return (
    <div className="page-container" style={{ padding: '32px 20px' }}>
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Email Verification Banner */}
        {!user.isEmailVerified && (
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '1px solid #f59e0b',
            borderRadius: '12px', padding: '16px 20px',
            marginBottom: '20px', animation: 'fadeInDown 0.4s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '20px' }}>✉️</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '700', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#92400e' }}>
                  Verify your email address
                </p>
                <p style={{ fontSize: '12px', color: '#b45309', fontFamily: 'Inter, sans-serif' }}>
                  Get a blue verified badge on your profile
                </p>
              </div>
              {!showOtpInput ? (
                <button onClick={handleSendOtp} disabled={otpLoading} style={{
                  padding: '8px 16px', background: '#f59e0b', color: 'white',
                  border: 'none', borderRadius: '8px', fontWeight: '700',
                  fontFamily: 'Inter, sans-serif', fontSize: '13px', cursor: 'pointer',
                }}>
                  {otpLoading ? 'Sending...' : 'Click to Verify'}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    style={{
                      padding: '8px 12px', border: '1.5px solid #f59e0b',
                      borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif',
                      outline: 'none', width: '160px', letterSpacing: '4px',
                      fontWeight: '700', textAlign: 'center',
                    }}
                  />
                  <button onClick={handleVerifyOtp} disabled={otpLoading} style={{
                    padding: '8px 14px', background: '#10B981', color: 'white',
                    border: 'none', borderRadius: '8px', fontWeight: '700',
                    fontFamily: 'Inter, sans-serif', fontSize: '13px', cursor: 'pointer',
                  }}>
                    {otpLoading ? '...' : 'Verify'}
                  </button>
                  {otpTimer > 0 ? (
                    <span style={{ fontSize: '12px', color: '#b45309', fontFamily: 'Inter, sans-serif' }}>
                      {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}
                    </span>
                  ) : (
                    <button onClick={handleSendOtp} style={{
                      background: 'none', border: 'none', color: '#b45309',
                      fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      textDecoration: 'underline',
                    }}>Resend</button>
                  )}
                </div>
              )}
            </div>
            {showOtpInput && (
              <p style={{ fontSize: '12px', color: '#b45309', fontFamily: 'Inter, sans-serif', marginTop: '8px' }}>
                Check your email <strong>{user.email}</strong> — code expires in 2 minutes
              </p>
            )}
          </div>
        )}

        {/* Profile Card */}
        <div style={{
          background: 'white', borderRadius: '16px',
          padding: '32px', marginBottom: '24px',
          border: '1px solid var(--border-default)',
          animation: 'fadeIn 0.4s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'var(--brand-primary)', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid var(--border-default)',
              }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: 'white', fontSize: '28px', fontWeight: '700', fontFamily: 'Inter, sans-serif' }}>
                    {initials}
                  </span>
                )}
              </div>
              {editing && (
                <>
                  <button onClick={() => fileRef.current?.click()} style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: 'var(--brand-primary)', border: '2px solid white',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '12px',
                  }}>✏️</button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'Inter, sans-serif' }}>
                  {fullName}
                </h1>
                {user.isEmailVerified ? (
                  <span title="Verified" style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: '#3B82F6', color: 'white', fontSize: '11px',
                    fontWeight: '700',
                  }}>✓</span>
                ) : (
                  <span style={{
                    fontSize: '11px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif',
                    background: '#F3F4F6', padding: '2px 8px', borderRadius: '20px',
                  }}>Unverified</span>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
                {user.email}
              </p>
              {user.phone && (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
                  📞 {user.phone}
                </p>
              )}
              {user.address && (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
                  📍 {user.address}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => setEditing(!editing)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
              <button onClick={handleLogout} style={{
                padding: '8px 16px', fontSize: '13px', background: 'none',
                border: '1.5px solid var(--danger)', color: 'var(--danger)',
                borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
              }}>Logout</button>
            </div>
          </div>

          {/* Edit Form */}
          {editing && (
            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '20px', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>First Name</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name"
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border-default)', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name"
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border-default)', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>
                  Phone Number <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 03001234567"
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border-default)', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>Address</label>
                <input value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. Attock City"
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border-default)', borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <button onClick={handleUpdate} disabled={saving} className="btn-primary" style={{ padding: '10px 24px', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* My Ads */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-default)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>My Ads</h2>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {[
              { key: 'active', label: `✅ Active (${myAds.filter(a => a.status === 'active').length})` },
              { key: 'pending', label: `⏳ Pending (${myAds.filter(a => a.status === 'pending').length})` },
              { key: 'rejected', label: `❌ Rejected (${myAds.filter(a => a.status === 'rejected').length})` },
              { key: 'sold', label: `🏷️ Sold (${soldAds.length})` },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding: '7px 14px', borderRadius: '8px', fontSize: '12px',
                fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer', border: 'none',
                background: activeTab === tab.key ? 'var(--brand-primary)' : '#f3f4f6',
                color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
              }}>{tab.label}</button>
            ))}
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>Loading...</p>
          ) : displayAds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>
                No ads in this category
              </p>
              {activeTab !== 'sold' && (
                <button onClick={() => router.push('/post-ad')} className="btn-primary">Post New Ad</button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {displayAds.map(ad => {
                const sc = statusColor(ad.status)
                const isActive = ad.status === 'active'
                const isSold = ad.status === 'sold'
                return (
                  <div key={ad._id} style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px', border: '1px solid var(--border-default)',
                    borderRadius: '10px', flexWrap: 'wrap',
                  }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: 'var(--bg-tertiary)', overflow: 'hidden', flexShrink: 0 }}>
                      {ad.images?.[0] ? (
                        <img src={ad.images[0]} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📷</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <p style={{ fontWeight: '600', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>{ad.title}</p>
                      <p style={{ color: 'var(--brand-primary)', fontWeight: '700', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
                        Rs {ad.price?.toLocaleString()}
                      </p>
                      {isSold && ad.soldAt && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
                          Sold: {new Date(ad.soldAt).toLocaleDateString('en-PK')}
                        </p>
                      )}
                    </div>
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
                      fontWeight: '600', fontFamily: 'Inter, sans-serif',
                      background: sc.bg, color: sc.color, flexShrink: 0,
                    }}>{ad.status}</span>
                    {isActive && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button onClick={() => handleView(ad._id)} style={btnStyle('#eff6ff', '#1d4ed8')}>👁️ View</button>
                        <button onClick={() => handleEdit(ad._id)} style={btnStyle('#fefce8', '#854d0e')}>✏️ Edit</button>
                        <button onClick={() => handleMarkSold(ad)} style={btnStyle('#f0fdf4', '#15803d')}>🏷️ Sold</button>
                        <button onClick={() => handleDelete(ad)} style={btnStyle('#fef2f2', '#b91c1c')}>🗑️ Delete</button>
                      </div>
                    )}
                    {(ad.status === 'pending' || ad.status === 'rejected') && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleDelete(ad)} style={btnStyle('#fef2f2', '#b91c1c')}>🗑️ Delete</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}