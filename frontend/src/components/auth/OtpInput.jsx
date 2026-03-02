'use client'

import { useState, useRef, useEffect } from 'react'

export default function OtpInput({ phone, onSubmit, onResend, loading = false }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputs = useRef([])

  useEffect(() => {
    inputs.current[0]?.focus()
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval)
          setCanResend(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      inputs.current[index + 1]?.focus()
    }
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      onSubmit(newOtp.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      onSubmit(pasted)
    }
  }

  const handleResend = () => {
    setOtp(['', '', '', '', '', ''])
    setTimer(60)
    setCanResend(false)
    inputs.current[0]?.focus()
    onResend()
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(interval); setCanResend(true); return 0 }
        return t - 1
      })
    }, 1000)
  }

  const maskedPhone = phone
    ? phone.slice(0, 6) + '****' + phone.slice(-2)
    : ''

  return (
    <div>
      <p style={{
        fontSize: '14px',
        color: 'var(--text-secondary)',
        fontFamily: 'DM Sans, sans-serif',
        marginBottom: '24px',
        textAlign: 'center',
        lineHeight: '1.6',
      }}>
        6-digit OTP bheja gaya hai<br />
        <strong style={{ color: 'var(--text-primary)' }}>{maskedPhone}</strong> pe
      </p>

      {/* OTP Boxes */}
      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        marginBottom: '24px',
      }} onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => inputs.current[i] = el}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            style={{
              width: '48px',
              height: '56px',
              textAlign: 'center',
              fontSize: '22px',
              fontWeight: '700',
              fontFamily: 'Syne, sans-serif',
              border: `2px solid ${digit ? 'var(--brand-primary)' : 'var(--border-default)'}`,
              borderRadius: '12px',
              outline: 'none',
              background: digit ? 'var(--brand-light)' : 'white',
              color: 'var(--brand-primary)',
              transition: 'all 0.15s',
              caretColor: 'var(--brand-primary)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
            onBlur={e => {
              if (!e.target.value) e.target.style.borderColor = 'var(--border-default)'
            }}
          />
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={() => onSubmit(otp.join(''))}
        disabled={loading || otp.join('').length < 6}
        className="btn-primary"
        style={{
          width: '100%',
          justifyContent: 'center',
          padding: '14px',
          fontSize: '15px',
          marginBottom: '16px',
          opacity: loading || otp.join('').length < 6 ? 0.7 : 1,
          cursor: loading || otp.join('').length < 6 ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '⏳ Verifying...' : '✅ Verify OTP'}
      </button>

      {/* Resend */}
      <div style={{ textAlign: 'center' }}>
        {canResend ? (
          <button
            onClick={handleResend}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand-primary)',
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: 'DM Sans, sans-serif',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            🔄 Resend OTP
          </button>
        ) : (
          <p style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            fontFamily: 'DM Sans, sans-serif',
          }}>
            Resend OTP in{' '}
            <span style={{ color: 'var(--brand-primary)', fontWeight: '600' }}>
              {timer}s
            </span>
          </p>
        )}
      </div>
    </div>
  )
}