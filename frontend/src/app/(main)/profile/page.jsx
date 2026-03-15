'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../lib/axios'
import toast from 'react-hot-toast'
import { Suspense } from 'react'

function ProfilePageInner() {
  const { user, logout, updateUser, refreshUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileRef = useRef(null)

  const initialTab = searchParams.get('tab') || 'overview'
  const highlightId = searchParams.get('highlight')
  const [activeTab, setActiveTab] = useState(initialTab)
  const [adsTab, setAdsTab] = useState('active')
  const adRefs = useRef({})

  const [myAds, setMyAds] = useState([])
  const [soldAds, setSoldAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  // OTP
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
      const active = activeRes.data.ads.filter(a => a.status !== 'sold')
      const sold = soldRes.data.ads.filter(a => a.status === 'sold')
      setMyAds(active)
      setSoldAds(sold)

      // If came from notification with highlight — switch to ads tab + correct sub-tab
      if (highlightId) {
        setActiveTab('ads')
        const allAds = [...active, ...sold]
        const found = allAds.find(a => String(a._id) === highlightId)
        if (found) {
          if (found.status === 'sold') setAdsTab('sold')
          else if (found.status === 'pending') setAdsTab('pending')
          else if (found.status === 'rejected') setAdsTab('rejected')
          else setAdsTab('active')
        }
        // Scroll after render
        setTimeout(() => {
          const el = adRefs.current[highlightId]
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 700)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)) }
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
      const res = await api.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      updateUser(res.data.user)
      toast.success('Profile updated!')
      setAvatarFile(null)
      setActiveTab('overview')
    } catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  const handleSendOtp = async () => {
    setOtpLoading(true)
    try {
      await api.post('/auth/send-verify-otp')
      toast.success('Verification code sent!')
      setShowOtpInput(true)
      setOtpTimer(120)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send code') }
    finally { setOtpLoading(false) }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) { toast.error('Enter 6-digit code'); return }
    setOtpLoading(true)
    try {
      await api.post('/auth/verify-email', { otp })
      toast.success('Email verified!')
      setShowOtpInput(false)
      setOtp('')
      await refreshUser()
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid code') }
    finally { setOtpLoading(false) }
  }

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to sign out?')) return
    logout()
    router.push('/')
    toast.success('Signed out successfully!')
  }

  const handleDelete = async (ad) => {
    if (!window.confirm(`Delete "${ad.title}"? This cannot be undone.`)) return
    try {
      await api.delete(`/ads/${ad._id}`)
      toast.success('Ad deleted!')
      fetchMyAds()
    } catch { toast.error('Delete failed') }
  }

  const handleMarkSold = async (ad) => {
    if (!window.confirm(`Mark "${ad.title}" as sold?`)) return
    try {
      await api.patch(`/ads/${ad._id}/sold`)
      toast.success('Marked as sold!')
      fetchMyAds()
    } catch { toast.error('Failed') }
  }

  const handleEdit = (adId) => {
    if (window.confirm('Edit this ad? It will go back to review.')) router.push(`/post-ad?edit=${adId}`)
  }

  if (!user) return null

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
  const initials = (user.firstName?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()

  const activeAds = myAds.filter(a => a.status === 'active')
  const pendingAds = myAds.filter(a => a.status === 'pending')
  const rejectedAds = myAds.filter(a => a.status === 'rejected')

  const displayAds = adsTab === 'sold' ? soldAds
    : adsTab === 'active' ? activeAds
    : adsTab === 'pending' ? pendingAds
    : rejectedAds

  const statusBadge = (status) => {
    const map = {
      active: { bg: '#DCFCE7', color: '#15803D', label: 'Active' },
      pending: { bg: '#FEF9C3', color: '#A16207', label: 'Pending' },
      rejected: { bg: '#FEE2E2', color: '#B91C1C', label: 'Rejected' },
      sold: { bg: '#EDE9FE', color: '#6D28D9', label: 'Sold' },
    }
    const s = map[status] || { bg: '#F1F5F9', color: '#475569', label: status }
    return (
      <span style={{
        padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
        fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
        background: s.bg, color: s.color, letterSpacing: '0.02em',
      }}>{s.label}</span>
    )
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .profile-tab:hover { color: #6C3AF5 !important; }
        .action-btn:hover { opacity: 0.85 !important; transform: translateY(-1px) !important; }
        .ad-row:hover { border-color: #C4B5FD !important; box-shadow: 0 4px 16px rgba(108,58,245,0.08) !important; }
      `}</style>

      <div className="page-container" style={{ padding: '32px 20px', maxWidth: '860px', margin: '0 auto' }}>

        {/* Email Verify Banner */}
        {!user.isEmailVerified && (
          <div style={{
            background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
            border: '1px solid #FCD34D', borderRadius: '14px',
            padding: '16px 20px', marginBottom: '24px',
            animation: 'fadeUp 0.4s ease',
            display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#FCD34D', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '700', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#92400E', marginBottom: '2px' }}>
                Verify your email address to build customer trust
              </p>
              <p style={{ fontSize: '12px', color: '#B45309', fontFamily: "'DM Sans', sans-serif" }}>
                Verified accounts get more responses from buyers
              </p>
            </div>
            {!showOtpInput ? (
              <button onClick={handleSendOtp} disabled={otpLoading} style={{
                padding: '9px 18px', background: '#F59E0B', color: 'white',
                border: 'none', borderRadius: '8px', fontWeight: '700',
                fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                cursor: otpLoading ? 'not-allowed' : 'pointer',
                flexShrink: 0,
              }}>
                {otpLoading ? 'Sending...' : 'Verify Now'}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  style={{
                    width: '120px', padding: '9px 12px',
                    border: '2px solid #FCD34D', borderRadius: '8px',
                    fontSize: '18px', fontFamily: "'DM Sans', sans-serif",
                    outline: 'none', letterSpacing: '6px', fontWeight: '800',
                    textAlign: 'center', background: 'white',
                  }}
                />
                <button onClick={handleVerifyOtp} disabled={otpLoading} style={{
                  padding: '9px 16px', background: '#10B981', color: 'white',
                  border: 'none', borderRadius: '8px', fontWeight: '700',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '13px', cursor: 'pointer',
                }}>
                  {otpLoading ? '...' : 'Confirm'}
                </button>
                {otpTimer > 0 ? (
                  <span style={{ fontSize: '12px', color: '#B45309', fontFamily: "'DM Sans', sans-serif", fontWeight: '600' }}>
                    {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}
                  </span>
                ) : (
                  <button onClick={handleSendOtp} style={{
                    background: 'none', border: 'none', color: '#B45309',
                    fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    fontWeight: '600', textDecoration: 'underline',
                  }}>Resend</button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Profile Header Card */}
        <div style={{
          background: 'white', borderRadius: '20px',
          border: '1px solid #E2E8F0', overflow: 'hidden',
          marginBottom: '20px', animation: 'fadeUp 0.4s ease',
        }}>
          {/* Cover */}
          <div style={{
            height: '80px',
            background: 'linear-gradient(135deg, #6C3AF5 0%, #9B6DFF 50%, #C084FC 100%)',
          }} />

          <div style={{ padding: '0 28px 28px' }}>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ position: 'relative', marginTop: '-36px' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '18px',
                  background: 'var(--brand-primary)', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '4px solid white',
                  boxShadow: '0 4px 16px rgba(108,58,245,0.2)',
                }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: 'white', fontSize: '28px', fontWeight: '800', fontFamily: "'DM Sans', sans-serif" }}>
                      {initials}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
                <button
                  onClick={() => setActiveTab(activeTab === 'edit' ? 'overview' : 'edit')}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
                    fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
                    cursor: 'pointer', border: '1.5px solid #E2E8F0',
                    background: activeTab === 'edit' ? '#6C3AF5' : 'white',
                    color: activeTab === 'edit' ? 'white' : '#374151',
                    transition: 'all 0.15s',
                  }}
                >
                  {activeTab === 'edit' ? 'Cancel' : 'Edit Profile'}
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
                    fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
                    cursor: 'pointer', border: '1.5px solid #FEE2E2',
                    background: 'white', color: '#DC2626', transition: 'all 0.15s',
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Name & Info */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h1 style={{
                  fontSize: '22px', fontWeight: '800', color: '#0f172a',
                  fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em',
                }}>{fullName}</h1>
                {user.isEmailVerified && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: '#EFF6FF', padding: '3px 8px', borderRadius: '20px',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#3B82F6">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#3B82F6', fontFamily: "'DM Sans', sans-serif" }}>
                      Verified
                    </span>
                  </div>
                )}
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', fontFamily: "'DM Sans', sans-serif", marginBottom: '4px' }}>
                {user.email}
              </p>
              {user.phone && (
                <p style={{ fontSize: '13px', color: '#64748B', fontFamily: "'DM Sans', sans-serif", marginBottom: '4px' }}>
                  {user.phone}
                </p>
              )}
              {user.address && (
                <p style={{ fontSize: '13px', color: '#64748B', fontFamily: "'DM Sans', sans-serif" }}>
                  {user.address}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className='profile-stats-row' style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {[
                { label: 'Active Ads', value: activeAds.length },
                { label: 'Sold', value: soldAds.length },
                { label: 'Pending', value: pendingAds.length },
              ].map(stat => (
                <div key={stat.label}>
                  <p style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em' }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", fontWeight: '500' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', background: 'white',
          borderRadius: '12px', padding: '4px',
          border: '1px solid #E2E8F0', marginBottom: '20px',
          animation: 'fadeUp 0.5s ease',
        }}>
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'edit', label: 'Edit Profile' },
            { key: 'ads', label: `My Ads (${myAds.length + soldAds.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="profile-tab"
              style={{
                flex: 1, padding: '9px', borderRadius: '8px',
                fontSize: '13px', fontWeight: '600',
                fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                border: 'none', transition: 'all 0.2s',
                background: activeTab === tab.key ? '#6C3AF5' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#64748B',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ animation: 'fadeIn 0.3s ease' }}>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div style={{
              background: 'white', borderRadius: '16px',
              border: '1px solid #E2E8F0', padding: '28px',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", color: '#0f172a', marginBottom: '20px' }}>
                Account Information
              </h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                {[
                  { label: 'Full Name', value: fullName },
                  { label: 'Email', value: user.email },
                  { label: 'Phone', value: user.phone || 'Not added' },
                  { label: 'Address', value: user.address || 'Not added' },
                  { label: 'Email Status', value: user.isEmailVerified ? 'Verified' : 'Not verified' },
                ].map(row => (
                  <div key={row.label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 0', borderBottom: '1px solid #F8FAFC',
                  }}>
                    <span style={{ fontSize: '13px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", fontWeight: '500' }}>
                      {row.label}
                    </span>
                    <span style={{
                      fontSize: '14px', color: '#0f172a', fontFamily: "'DM Sans', sans-serif",
                      fontWeight: '600',
                      color: row.label === 'Email Status' ? (user.isEmailVerified ? '#15803D' : '#B45309') : '#0f172a',
                    }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Edit Profile Tab */}
          {activeTab === 'edit' && (
            <div style={{
              background: 'white', borderRadius: '16px',
              border: '1px solid #E2E8F0', padding: '28px',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", color: '#0f172a', marginBottom: '24px' }}>
                Edit Profile
              </h2>

              {/* Avatar Upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '16px',
                  background: 'var(--brand-primary)', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, border: '3px solid #E2E8F0',
                }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: 'white', fontSize: '24px', fontWeight: '800', fontFamily: "'DM Sans', sans-serif" }}>
                      {initials}
                    </span>
                  )}
                </div>
                <div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    style={{
                      padding: '8px 16px', border: '1.5px solid #E2E8F0',
                      borderRadius: '8px', background: 'white', cursor: 'pointer',
                      fontSize: '13px', fontWeight: '600',
                      fontFamily: "'DM Sans', sans-serif", color: '#374151',
                      display: 'block', marginBottom: '6px',
                    }}
                  >
                    Change Photo
                  </button>
                  <p style={{ fontSize: '11px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>
                    JPG or PNG, max 5MB
                  </p>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </div>
              </div>

              {/* Fields */}
              <div className='form-grid-2' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', fontFamily: "'DM Sans', sans-serif", marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    First Name
                  </label>
                  <input
                    value={firstName} onChange={e => setFirstName(e.target.value)}
                    placeholder="First name"
                    style={{
                      width: '100%', padding: '11px 14px',
                      border: '1.5px solid #E2E8F0', borderRadius: '10px',
                      fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
                      outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.15s', color: '#0f172a',
                    }}
                    onFocus={e => e.target.style.borderColor = '#6C3AF5'}
                    onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', fontFamily: "'DM Sans', sans-serif", marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Last Name
                  </label>
                  <input
                    value={lastName} onChange={e => setLastName(e.target.value)}
                    placeholder="Last name"
                    style={{
                      width: '100%', padding: '11px 14px',
                      border: '1.5px solid #E2E8F0', borderRadius: '10px',
                      fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
                      outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.15s', color: '#0f172a',
                    }}
                    onFocus={e => e.target.style.borderColor = '#6C3AF5'}
                    onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', fontFamily: "'DM Sans', sans-serif", marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Phone Number <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="03001234567"
                  style={{
                    width: '100%', padding: '11px 14px',
                    border: '1.5px solid #E2E8F0', borderRadius: '10px',
                    fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s', color: '#0f172a',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6C3AF5'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', fontFamily: "'DM Sans', sans-serif", marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Address
                </label>
                <input
                  value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Attock City"
                  style={{
                    width: '100%', padding: '11px 14px',
                    border: '1.5px solid #E2E8F0', borderRadius: '10px',
                    fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s', color: '#0f172a',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6C3AF5'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>

              <button
                onClick={handleUpdate}
                disabled={saving}
                style={{
                  padding: '12px 28px', background: '#6C3AF5',
                  color: 'white', border: 'none', borderRadius: '10px',
                  fontSize: '14px', fontWeight: '700',
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1, transition: 'all 0.15s',
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* My Ads Tab */}
          {activeTab === 'ads' && (
            <div>
              {/* Ads Sub Tabs */}
              <div style={{
                display: 'flex', gap: '8px', marginBottom: '16px',
                flexWrap: 'wrap',
              }}>
                {[
                  { key: 'active', label: 'Active', count: activeAds.length, color: '#15803D', bg: '#DCFCE7' },
                  { key: 'pending', label: 'Pending', count: pendingAds.length, color: '#A16207', bg: '#FEF9C3' },
                  { key: 'rejected', label: 'Rejected', count: rejectedAds.length, color: '#B91C1C', bg: '#FEE2E2' },
                  { key: 'sold', label: 'Sold', count: soldAds.length, color: '#6D28D9', bg: '#EDE9FE' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setAdsTab(tab.key)}
                    style={{
                      padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
                      fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
                      cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                      background: adsTab === tab.key ? tab.bg : 'white',
                      color: adsTab === tab.key ? tab.color : '#64748B',
                      border: adsTab === tab.key ? `1.5px solid ${tab.color}30` : '1.5px solid #E2E8F0',
                    }}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={{ background: 'white', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                  <p style={{ color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>Loading...</p>
                </div>
              ) : displayAds.length === 0 ? (
                <div style={{
                  background: 'white', borderRadius: '16px', padding: '60px',
                  textAlign: 'center', border: '1px solid #E2E8F0',
                }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: '#F8FAFC', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 16px',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <p style={{ fontWeight: '700', fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: '#374151', marginBottom: '8px' }}>
                    No {adsTab} ads
                  </p>
                  {adsTab === 'active' && (
                    <button
                      onClick={() => router.push('/post-ad')}
                      style={{
                        marginTop: '8px', padding: '10px 20px',
                        background: '#6C3AF5', color: 'white', border: 'none',
                        borderRadius: '8px', fontWeight: '600',
                        fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Post Your First Ad
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {displayAds.map(ad => (
                    <div
                      key={ad._id}
                      ref={el => { if (el) adRefs.current[String(ad._id)] = el }}
                      className="ad-row"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '16px',
                        padding: '16px 20px',
                        background: highlightId === String(ad._id) ? '#EDE9FE' : 'white',
                        borderRadius: '14px',
                        border: highlightId === String(ad._id) ? '2px solid #6C3AF5' : '1.5px solid #E2E8F0',
                        transition: 'all 0.2s', flexWrap: 'wrap',
                      }}
                    >
                      {/* Image */}
                      <div style={{
                        width: '68px', height: '68px', borderRadius: '10px',
                        background: '#F8FAFC', overflow: 'hidden', flexShrink: 0,
                      }}>
                        {ad.images?.[0] ? (
                          <img src={ad.images[0]} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21 15 16 10 5 21"/>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: '140px' }}>
                        <p style={{
                          fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
                          fontSize: '14px', color: '#0f172a', marginBottom: '4px',
                          display: '-webkit-box', WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>{ad.title}</p>
                        <p style={{
                          color: '#6C3AF5', fontWeight: '800',
                          fontFamily: "'DM Sans', sans-serif", fontSize: '15px',
                          letterSpacing: '-0.01em',
                        }}>
                          Rs {ad.price?.toLocaleString()}
                        </p>
                      </div>

                      {/* Status */}
                      {statusBadge(ad.status)}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {ad.status === 'active' && (
                          <>
                            <button
                              onClick={() => window.open(`/ads/${ad._id}`, '_blank')}
                              className="action-btn"
                              style={{
                                padding: '7px 14px', borderRadius: '8px', fontSize: '12px',
                                fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
                                cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                                background: '#EFF6FF', color: '#1D4ED8',
                              }}
                            >View</button>
                            <button
                              onClick={() => handleEdit(ad._id)}
                              className="action-btn"
                              style={{
                                padding: '7px 14px', borderRadius: '8px', fontSize: '12px',
                                fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
                                cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                                background: '#FFFBEB', color: '#B45309',
                              }}
                            >Edit</button>
                            <button
                              onClick={() => handleMarkSold(ad)}
                              className="action-btn"
                              style={{
                                padding: '7px 14px', borderRadius: '8px', fontSize: '12px',
                                fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
                                cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                                background: '#F0FDF4', color: '#15803D',
                              }}
                            >Mark Sold</button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(ad)}
                          className="action-btn"
                          style={{
                            padding: '7px 14px', borderRadius: '8px', fontSize: '12px',
                            fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
                            cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                            background: '#FEF2F2', color: '#B91C1C',
                          }}
                        >Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center' }}>Loading...</div>}>
      <ProfilePageInner />
    </Suspense>
  )
}