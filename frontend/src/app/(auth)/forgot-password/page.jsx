 
'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useSiteSettings } from '../../../context/SiteSettingsContext'
import api from '../../../lib/axios'

export default function ForgotPasswordPage() {
  const { settings } = useSiteSettings()
  const router = useRouter()

  const [step, setStep] = useState('email') // email → otp → newpass
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)

  // Timer
  const startTimer = () => {
    setOtpTimer(600) // 10 min
    const interval = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email) { toast.error('Please enter your email'); return }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('If this email exists, a reset code has been sent!')
      setStep('otp')
      startTimer()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) { toast.error('Please enter 6-digit code'); return }
    setStep('newpass')
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!newPassword || !confirmPassword) { toast.error('Please fill all fields'); return }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword })
      toast.success('Password reset successfully!')
      router.push('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed')
      setStep('otp') // OTP step pe wapis
    } finally {
      setLoading(false)
    }
  }

  const steps = ['email', 'otp', 'newpass']
  const stepIndex = steps.indexOf(step)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-120px', right: '-120px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,58,245,0.15) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-100px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(230,57,70,0.1) 0%, transparent 70%)',
      }} />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-input:focus {
          border-color: #6C3AF5 !important;
          box-shadow: 0 0 0 3px rgba(108,58,245,0.1) !important;
        }
        .auth-input { transition: all 0.2s ease !important; }
      `}</style>

      <div style={{
        background: 'white', borderRadius: '24px',
        padding: '44px 40px', width: '100%', maxWidth: '440px',
        boxShadow: '0 32px 100px rgba(0,0,0,0.4)',
        position: 'relative', zIndex: 1,
        animation: 'fadeInUp 0.5s ease forwards',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="logo" style={{ height: '36px', width: 'auto' }} />
            ) : (
              <div style={{
                width: '40px', height: '40px', background: '#6C3AF5',
                borderRadius: '10px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '18px',
              }}>
                {settings?.siteName?.charAt(0) || 'V'}
              </div>
            )}
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#111827', fontFamily: 'Inter, sans-serif' }}>
              {settings?.siteName || 'VEXO'}
            </span>
          </Link>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
          {['Email', 'Code', 'Password'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: i <= stepIndex ? '#6C3AF5' : '#F3F4F6',
                color: i <= stepIndex ? 'white' : '#9CA3AF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '700', fontFamily: 'Inter, sans-serif',
                transition: 'all 0.3s ease',
              }}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: '12px', fontFamily: 'Inter, sans-serif',
                color: i === stepIndex ? '#111827' : '#9CA3AF',
                fontWeight: i === stepIndex ? '600' : '400',
              }}>{s}</span>
              {i < 2 && <div style={{ width: '24px', height: '2px', background: i < stepIndex ? '#6C3AF5' : '#E5E7EB', borderRadius: '2px', transition: 'all 0.3s ease' }} />}
            </div>
          ))}
        </div>

        {/* Step 1: Email */}
        {step === 'email' && (
          <>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                Forgot Password? 🔐
              </h1>
              <p style={{ fontSize: '14px', color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
                Enter your email and we'll send a reset code
              </p>
            </div>
            <form onSubmit={handleSendOtp}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="auth-input"
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px',
                background: '#6C3AF5', color: 'white', border: 'none',
                borderRadius: '10px', fontSize: '15px', fontWeight: '700',
                fontFamily: 'Inter, sans-serif', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Sending...' : 'Send Reset Code →'}
              </button>
            </form>
          </>
        )}

        {/* Step 2: OTP */}
        {step === 'otp' && (
          <>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                Enter Reset Code 📩
              </h1>
              <p style={{ fontSize: '14px', color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
                6-digit code sent to <strong>{email}</strong>
              </p>
            </div>
            <form onSubmit={handleVerifyOtp}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>
                  Reset Code
                </label>
                <input
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="auth-input"
                  style={{
                    width: '100%', padding: '14px', border: '1.5px solid #E5E7EB',
                    borderRadius: '10px', fontSize: '24px', fontFamily: 'Inter, sans-serif',
                    outline: 'none', boxSizing: 'border-box',
                    letterSpacing: '10px', fontWeight: '800', textAlign: 'center',
                  }}
                />
                {otpTimer > 0 && (
                  <p style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Inter, sans-serif', marginTop: '6px', textAlign: 'center' }}>
                    Code expires in <strong style={{ color: '#6C3AF5' }}>{formatTimer(otpTimer)}</strong>
                  </p>
                )}
                {otpTimer === 0 && (
                  <p style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif', marginTop: '6px', textAlign: 'center' }}>
                    Code expired?{' '}
                    <button type="button" onClick={handleSendOtp} style={{ background: 'none', border: 'none', color: '#6C3AF5', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                      Resend
                    </button>
                  </p>
                )}
              </div>
              <button type="submit" style={{
                width: '100%', padding: '13px',
                background: '#6C3AF5', color: 'white', border: 'none',
                borderRadius: '10px', fontSize: '15px', fontWeight: '700',
                fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              }}>
                Verify Code →
              </button>
            </form>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 'newpass' && (
          <>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                Set New Password 🔑
              </h1>
              <p style={{ fontSize: '14px', color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
                Choose a strong password for your account
              </p>
            </div>
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="auth-input"
                    style={{ width: '100%', padding: '11px 44px 11px 14px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>
                  Confirm Password
                </label>
                <input
                  type="password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="auth-input"
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                />
                {confirmPassword && (
                  <p style={{ fontSize: '12px', marginTop: '4px', fontFamily: 'Inter, sans-serif', color: newPassword === confirmPassword ? '#10B981' : '#EF4444' }}>
                    {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px',
                background: '#6C3AF5', color: 'white', border: 'none',
                borderRadius: '10px', fontSize: '15px', fontWeight: '700',
                fontFamily: 'Inter, sans-serif', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Resetting...' : '🔐 Reset Password'}
              </button>
            </form>
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
          Remember your password?{' '}
          <Link href="/login" style={{ color: '#6C3AF5', fontWeight: '700', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}