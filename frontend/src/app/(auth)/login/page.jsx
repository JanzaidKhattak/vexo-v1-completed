'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import PhoneInput from '../../../components/auth/PhoneInput'
import OtpInput from '../../../components/auth/OtpInput'
import { useAuth } from '../../../context/AuthContext'
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../../../lib/firebase'
import api from '../../../lib/axios'

export default function LoginPage() {
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState(null)
  const recaptchaRef = useRef(null)
  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
    }
  }, [])

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      })
    }
    return window.recaptchaVerifier
  }

  const handlePhoneSubmit = async (formattedPhone) => {
    setLoading(true)
    try {
      const appVerifier = setupRecaptcha()
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier)
      setConfirmationResult(result)
      setPhone(formattedPhone)
      setStep('otp')
      toast.success('OTP sent successfully!')
    } catch (err) {
      console.error(err)
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
      toast.error('Failed to send OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (otp) => {
    if (otp.length < 6) {
      toast.error('Please enter complete 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      const result = await confirmationResult.confirm(otp)
      const idToken = await result.user.getIdToken()

      const res = await api.post('/auth/verify-otp', {
        idToken,
        phone,
      })

      login(res.data.user, res.data.token)
      toast.success('Login successful! Welcome to VEXO 🎉')
      router.push('/')
    } catch (err) {
      console.error(err)
      toast.error('Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
      const appVerifier = setupRecaptcha()
      const result = await signInWithPhoneNumber(auth, phone, appVerifier)
      setConfirmationResult(result)
      toast.success('OTP resent!')
    } catch {
      toast.error('Failed to resend OTP')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--brand-secondary) 0%, #16213E 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-100px', right: '-100px',
        width: '400px', height: '400px',
        background: 'rgba(255,75,38,0.06)', borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', left: '-80px',
        width: '300px', height: '300px',
        background: 'rgba(255,184,0,0.05)', borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div id="recaptcha-container" ref={recaptchaRef} />

      <div style={{
        background: 'white', borderRadius: '24px', padding: '40px',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              width: '42px', height: '42px',
              background: 'var(--brand-primary)', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Syne, sans-serif', fontWeight: '800', color: 'white', fontSize: '20px',
            }}>V</div>
            <span style={{
              fontFamily: 'Syne, sans-serif', fontWeight: '800',
              fontSize: '26px', color: 'var(--brand-secondary)',
            }}>VEXO</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
            Verified Exchange Online • Attock
          </p>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '28px', justifyContent: 'center',
        }}>
          {['phone', 'otp'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: step === s || (s === 'phone' && step === 'otp') ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                color: step === s || (s === 'phone' && step === 'otp') ? 'white' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '700', fontFamily: 'DM Sans, sans-serif',
              }}>
                {s === 'phone' && step === 'otp' ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: '12px',
                color: step === s ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: step === s ? '600' : '400',
              }}>
                {s === 'phone' ? 'Phone Number' : 'Verify OTP'}
              </span>
              {i === 0 && (
                <div style={{
                  width: '32px', height: '2px',
                  background: step === 'otp' ? 'var(--brand-primary)' : 'var(--border-default)',
                  borderRadius: '2px',
                }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontSize: '22px',
            fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px',
          }}>
            {step === 'phone' ? 'Welcome Back 👋' : 'Enter OTP 🔐'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
            {step === 'phone'
              ? 'Apna Pakistani mobile number enter karein'
              : 'Apke number pe bheja gaya OTP enter karein'}
          </p>
        </div>

        {step === 'phone' ? (
          <PhoneInput onSubmit={handlePhoneSubmit} loading={loading} />
        ) : (
          <>
            <OtpInput phone={phone} onSubmit={handleOtpSubmit} onResend={handleResend} loading={loading} />
            <button
              onClick={() => setStep('phone')}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
                cursor: 'pointer', marginTop: '12px', display: 'block',
                width: '100%', textAlign: 'center',
              }}
            >
              ← Change number
            </button>
          </>
        )}

        <p style={{
          fontSize: '11px', color: 'var(--text-muted)',
          textAlign: 'center', marginTop: '20px',
          fontFamily: 'DM Sans, sans-serif', lineHeight: '1.6',
        }}>
          Login karke aap VEXO ki{' '}
          <a href="/terms" style={{ color: 'var(--brand-primary)' }}>Terms</a>
          {' '}aur{' '}
          <a href="/privacy-policy" style={{ color: 'var(--brand-primary)' }}>Privacy Policy</a>
          {' '}se agree karte hain
        </p>
      </div>
    </div>
  )
}