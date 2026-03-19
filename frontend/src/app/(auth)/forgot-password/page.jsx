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

  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [errors, setErrors] = useState({})

  const startTimer = () => {
    setOtpTimer(600)
    const interval = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }
  const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const handleSendOtp = async (e) => {
    e?.preventDefault()
    if (!email) { setErrors({ email: 'Email is required' }); return }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('Reset code sent!')
      setStep('otp')
      startTimer()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send code')
    } finally { setLoading(false) }
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) { setErrors({ otp: 'Enter 6-digit code' }); return }
    setStep('newpass')
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!newPassword) errs.newPassword = 'Required'
    else if (newPassword.length < 6) errs.newPassword = 'Min. 6 characters'
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword })
      toast.success('Password reset successfully!')
      router.push('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed')
      setStep('otp')
    } finally { setLoading(false) }
  }

  const steps = ['email', 'otp', 'newpass']
  const stepIndex = steps.indexOf(step)

  return (
    <div style={{ minHeight: '100vh', background: '#0B0C10', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes floatGlow { 0%, 100% { opacity: 0.12; } 50% { opacity: 0.25; } }
        @keyframes stepPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(102,252,241,0.3); } 50% { box-shadow: 0 0 0 6px rgba(102,252,241,0); } }
        .vx-input { width: 100%; padding: 12px 16px; background: rgba(31,40,51,0.6); border: 1.5px solid rgba(102,252,241,0.15); border-radius: 6px; font-size: 15px; font-family: 'Afacad', sans-serif; color: #C5C6C7; outline: none; transition: all 0.2s ease; box-sizing: border-box; }
        .vx-input:focus { border-color: #66FCF1; box-shadow: 0 0 0 3px rgba(102,252,241,0.08); background: rgba(31,40,51,0.9); }
        .vx-input::placeholder { color: rgba(197,198,199,0.35); }
        .vx-input.err { border-color: #ff4757 !important; }
        .vx-btn { width: 100%; padding: 13px; background: transparent; color: #66FCF1; border: 1.5px solid #66FCF1; border-radius: 6px; font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.12em; cursor: pointer; position: relative; overflow: hidden; transition: color 0.25s ease; }
        .vx-btn::before { content: ''; position: absolute; inset: 0; background: #66FCF1; transform: scaleX(0); transform-origin: left; transition: transform 0.25s ease; }
        .vx-btn:hover::before { transform: scaleX(1); }
        .vx-btn:hover { color: #0B0C10; }
        .vx-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .vx-btn span { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .field-err { font-family: 'Afacad', sans-serif; font-size: 12px; color: #ff4757; margin-top: 4px; animation: fadeInUp 0.2s ease; }
        .lbl { display: block; font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 600; color: rgba(197,198,199,0.6); letter-spacing: 0.1em; margin-bottom: 7px; }
      `}</style>

      <div style={{ position: 'absolute', top: '-200px', right: '-200px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(102,252,241,0.07) 0%, transparent 70%)', animation: 'floatGlow 6s ease-in-out infinite' }} />

      <div style={{ background: 'rgba(31,40,51,0.7)', backdropFilter: 'blur(20px)', borderRadius: '12px', padding: '44px 40px', width: '100%', maxWidth: '420px', border: '1px solid rgba(102,252,241,0.12)', boxShadow: '0 0 60px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1, animation: 'fadeInUp 0.5s ease forwards' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', border: '2px solid #66FCF1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#66FCF1', fontFamily: "'Orbitron', sans-serif", fontWeight: '900', fontSize: '15px' }}>V</span>
            </div>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '26px', color: '#66FCF1', letterSpacing: '0.1em' }}>{settings?.siteName || 'VEXO'}</span>
          </Link>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '32px' }}>
          {['EMAIL', 'CODE', 'NEW PASS'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: i < stepIndex ? '#66FCF1' : i === stepIndex ? 'transparent' : 'transparent', border: `2px solid ${i <= stepIndex ? '#66FCF1' : 'rgba(197,198,199,0.2)'}`, color: i < stepIndex ? '#0B0C10' : i === stepIndex ? '#66FCF1' : 'rgba(197,198,199,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Orbitron', sans-serif", fontSize: '11px', fontWeight: '700', margin: '0 auto 6px', animation: i === stepIndex ? 'stepPulse 2s ease infinite' : 'none', transition: 'all 0.3s ease' }}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: i === stepIndex ? '#66FCF1' : 'rgba(197,198,199,0.3)', letterSpacing: '0.06em' }}>{s}</span>
              </div>
              {i < 2 && <div style={{ width: '32px', height: '2px', background: i < stepIndex ? '#66FCF1' : 'rgba(197,198,199,0.1)', margin: '0 4px 16px', transition: 'all 0.3s ease' }} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 'email' && (
          <>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '30px', color: '#C5C6C7', letterSpacing: '0.06em', marginBottom: '6px' }}>FORGOT PASSWORD</h1>
            <p style={{ fontFamily: "'Afacad', sans-serif", fontSize: '14px', color: 'rgba(197,198,199,0.5)', marginBottom: '28px' }}>Enter your email to receive a reset code</p>
            <form onSubmit={handleSendOtp}>
              <div style={{ marginBottom: '20px' }}>
                <label className="lbl">EMAIL ADDRESS</label>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors({}); }} placeholder="you@example.com" className={`vx-input${errors.email ? ' err' : ''}`} />
                {errors.email && <p className="field-err">{errors.email}</p>}
              </div>
              <button type="submit" disabled={loading} className="vx-btn">
                <span>{loading ? <><span className="vexo-spinner vexo-spinner-sm" style={{ borderTopColor: '#0B0C10' }} /> SENDING...</> : 'SEND RESET CODE'}</span>
              </button>
            </form>
          </>
        )}

        {/* Step 2 */}
        {step === 'otp' && (
          <>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '30px', color: '#C5C6C7', letterSpacing: '0.06em', marginBottom: '6px' }}>ENTER CODE</h1>
            <p style={{ fontFamily: "'Afacad', sans-serif", fontSize: '14px', color: 'rgba(197,198,199,0.5)', marginBottom: '28px' }}>6-digit code sent to <span style={{ color: '#66FCF1' }}>{email}</span></p>
            <form onSubmit={handleVerifyOtp}>
              <div style={{ marginBottom: '20px' }}>
                <label className="lbl">RESET CODE</label>
                <input value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setErrors({}); }} placeholder="000000" maxLength={6} className={`vx-input${errors.otp ? ' err' : ''}`} style={{ textAlign: 'center', fontSize: '28px', fontFamily: "'Orbitron', sans-serif", fontWeight: '700', letterSpacing: '10px', color: '#66FCF1' }} />
                {errors.otp && <p className="field-err">{errors.otp}</p>}
                {otpTimer > 0 && <p style={{ fontFamily: "'Afacad', sans-serif", fontSize: '12px', color: 'rgba(197,198,199,0.4)', textAlign: 'center', marginTop: '8px' }}>Expires in <span style={{ color: '#66FCF1' }}>{formatTimer(otpTimer)}</span></p>}
                {otpTimer === 0 && <p style={{ fontFamily: "'Afacad', sans-serif", fontSize: '12px', textAlign: 'center', marginTop: '8px', color: 'rgba(197,198,199,0.4)' }}>Expired? <button type="button" onClick={handleSendOtp} style={{ background: 'none', border: 'none', color: '#66FCF1', cursor: 'pointer', fontFamily: "'Afacad', sans-serif", fontSize: '12px', fontWeight: '600' }}>Resend</button></p>}
              </div>
              <button type="submit" className="vx-btn"><span>VERIFY CODE</span></button>
            </form>
          </>
        )}

        {/* Step 3 */}
        {step === 'newpass' && (
          <>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '30px', color: '#C5C6C7', letterSpacing: '0.06em', marginBottom: '6px' }}>NEW PASSWORD</h1>
            <p style={{ fontFamily: "'Afacad', sans-serif", fontSize: '14px', color: 'rgba(197,198,199,0.5)', marginBottom: '28px' }}>Choose a strong password</p>
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '14px' }}>
                <label className="lbl">NEW PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => { setNewPassword(e.target.value); setErrors(p => ({...p, newPassword: ''})); }} placeholder="Min. 6 characters" className={`vx-input${errors.newPassword ? ' err' : ''}`} style={{ paddingRight: '44px' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(197,198,199,0.4)' }}>{showPassword ? '✕' : '○'}</button>
                </div>
                {errors.newPassword && <p className="field-err">{errors.newPassword}</p>}
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label className="lbl">CONFIRM PASSWORD</label>
                <input type="password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({...p, confirmPassword: ''})); }} placeholder="Re-enter password" className={`vx-input${errors.confirmPassword ? ' err' : confirmPassword && newPassword === confirmPassword ? ' ok' : ''}`} />
                {errors.confirmPassword && <p className="field-err">{errors.confirmPassword}</p>}
                {confirmPassword && newPassword === confirmPassword && !errors.confirmPassword && <p style={{ fontFamily: "'Afacad', sans-serif", fontSize: '12px', color: '#66FCF1', marginTop: '4px' }}>Passwords match</p>}
              </div>
              <button type="submit" disabled={loading} className="vx-btn">
                <span>{loading ? <><span className="vexo-spinner vexo-spinner-sm" style={{ borderTopColor: '#0B0C10' }} /> RESETTING...</> : 'RESET PASSWORD'}</span>
              </button>
            </form>
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontFamily: "'Afacad', sans-serif", fontSize: '14px', color: 'rgba(197,198,199,0.5)' }}>
          Remember it? <Link href="/login" style={{ color: '#66FCF1', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}