import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Input({
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  prefix,
  suffix,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label style={{
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          fontFamily: 'DM Sans, sans-serif',
        }}>
          {label}
          {required && <span style={{ color: 'var(--brand-primary)', marginLeft: '3px' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <div style={{
            position: 'absolute',
            left: '14px',
            color: 'var(--text-muted)',
            fontSize: '14px',
            pointerEvents: 'none',
          }}>
            {prefix}
          </div>
        )}

        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="input-field"
          style={{
            paddingLeft: prefix ? '40px' : '16px',
            paddingRight: (suffix || isPassword) ? '44px' : '16px',
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
            borderColor: error ? 'var(--danger)' : undefined,
          }}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '14px',
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              display: 'flex',
            }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {suffix && !isPassword && (
          <div style={{
            position: 'absolute',
            right: '14px',
            color: 'var(--text-muted)',
            fontSize: '14px',
          }}>
            {suffix}
          </div>
        )}
      </div>

      {error && (
        <p style={{ fontSize: '12px', color: 'var(--danger)', fontFamily: 'DM Sans, sans-serif' }}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
          {hint}
        </p>
      )}
    </div>
  )
}