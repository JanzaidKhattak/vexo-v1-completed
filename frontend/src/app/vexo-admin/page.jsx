'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '../../context/AdminAuthContext'
import api from '../../lib/axios'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const { adminLogin, admin } = useAdminAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (admin) router.push('/vexo-admin/dashboard')
  }, [admin])

  const handleLogin = async (e) => {
  e.preventDefault()
  if (!email || !password) { toast.error('Please fill all fields'); return }

  setLoading(true)
  try {
    const res = await api.post('/auth/login', { email, password, recaptchaToken: 'admin-bypass' })

    if (!['admin', 'super-admin'].includes(res.data.user.role)) {
      toast.error('Access denied. Admin only.')
      return
    }

    const success = adminLogin(res.data.user, res.data.token)
    if (success) {
      toast.success(`Welcome back, ${res.data.user.firstName}!`)
      router.push('/vexo-admin/dashboard')
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Login failed')
  } finally {
    setLoading(false)
  }
}

  if (!mounted) return null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background effects */}
      <div style={{
        position: 'absolute', top: '20%', left: '10%',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,58,245,0.12) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '10%',
        width: '250px', height: '250px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
      }} />

      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(108,58,245,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(108,58,245,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .admin-input:focus {
          border-color: #6C3AF5 !important;
          box-shadow: 0 0 0 3px rgba(108,58,245,0.15) !important;
        }
        .admin-input { transition: all 0.2s ease !important; }
        .login-btn:hover { opacity: 0.92 !important; transform: translateY(-1px) !important; }
        .login-btn { transition: all 0.2s ease !important; }
      `}</style>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px', padding: '48px 40px',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 32px 100px rgba(0,0,0,0.5)',
        position: 'relative', zIndex: 1,
        animation: 'fadeInUp 0.5s ease forwards',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #6C3AF5, #9B6DFF)',
            marginBottom: '16px',
            boxShadow: '0 8px 32px rgba(108,58,245,0.4)',
          }}>
            <span style={{ color: 'white', fontWeight: '800', fontSize: '28px', fontFamily: 'Inter, sans-serif' }}>V</span>
          </div>
          <h1 style={{
            color: 'white', fontSize: '22px', fontWeight: '800',
            fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em', marginBottom: '4px',
          }}>VEXO Admin</h1>
          <p style={{ color: '#64748B', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
            Restricted access — Authorized personnel only
          </p>
        </div>

        {/* Warning badge */}
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: '10px', padding: '10px 14px', marginBottom: '28px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '14px' }}>🔒</span>
          <p style={{ color: '#FCA5A5', fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
            This area is restricted to administrators only
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '13px', fontWeight: '600',
              color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginBottom: '8px',
            }}>
              Admin Email
            </label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@vexo.com"
              className="admin-input"
              style={{
                width: '100%', padding: '12px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1.5px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', fontSize: '14px',
                fontFamily: 'Inter, sans-serif', outline: 'none',
                color: 'white', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block', fontSize: '13px', fontWeight: '600',
              color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginBottom: '8px',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="admin-input"
                style={{
                  width: '100%', padding: '12px 44px 12px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1.5px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', fontSize: '14px',
                  fontFamily: 'Inter, sans-serif', outline: 'none',
                  color: 'white', boxSizing: 'border-box',
                }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                position: 'absolute', right: '12px', top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', cursor: 'pointer', color: '#64748B', fontSize: '16px',
              }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="login-btn" style={{
            width: '100%', padding: '13px',
            background: 'linear-gradient(135deg, #6C3AF5, #9B6DFF)',
            border: 'none', borderRadius: '10px', color: 'white',
            fontSize: '15px', fontWeight: '700', fontFamily: 'Inter, sans-serif',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 20px rgba(108,58,245,0.4)',
          }}>
            {loading ? 'Verifying...' : '🔐 Access Admin Panel'}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: '20px',
          fontSize: '12px', color: '#334155',
          fontFamily: 'Inter, sans-serif',
        }}>
          Unauthorized access attempts are logged
        </p>
      </div>
    </div>
  )
}