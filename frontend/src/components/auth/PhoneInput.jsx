'use client'

import { useState } from 'react'
import { validatePakistaniPhone, formatToE164 } from '../../utils/validatePhone'

export default function PhoneInput({ onSubmit, loading = false }) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const val = e.target.value.replace(/[^0-9+]/g, '')
    setPhone(val)
    if (error) setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validatePakistaniPhone(phone)) {
      setError('Please enter a valid Pakistani number (e.g. 03001234567)')
      return
    }
    const formatted = formatToE164(phone)
    onSubmit(formatted)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          fontFamily: 'DM Sans, sans-serif',
          marginBottom: '8px',
        }}>
          Mobile Number <span style={{ color: 'var(--brand-primary)' }}>*</span>
        </label>

        <div style={{
          display: 'flex',
          border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border-default)'}`,
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'white',
          transition: 'border-color 0.2s',
        }}>
          {/* Country Code */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '12px 14px',
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-default)',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '16px' }}>🇵🇰</span>
            <span style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              fontFamily: 'DM Sans, sans-serif',
            }}>+92</span>
          </div>

          <input
            type="tel"
            value={phone}
            onChange={handleChange}
            placeholder="03001234567"
            maxLength={11}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '12px 16px',
              fontSize: '15px',
              fontFamily: 'DM Sans, sans-serif',
              color: 'var(--text-primary)',
              background: 'transparent',
              letterSpacing: '0.5px',
            }}
          />
        </div>

        {error && (
          <p style={{
            fontSize: '12px',
            color: 'var(--danger)',
            marginTop: '6px',
            fontFamily: 'DM Sans, sans-serif',
          }}>{error}</p>
        )}

        <p style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginTop: '6px',
          fontFamily: 'DM Sans, sans-serif',
        }}>
          📍 Sirf Pakistani numbers (+92) allowed hain
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !phone}
        className="btn-primary"
        style={{
          width: '100%',
          justifyContent: 'center',
          padding: '14px',
          fontSize: '15px',
          opacity: loading || !phone ? 0.7 : 1,
          cursor: loading || !phone ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '⏳ Sending OTP...' : '📱 Get OTP'}
      </button>
    </form>
  )
}