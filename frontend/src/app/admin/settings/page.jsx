'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('VEXO')
  const [city, setCity] = useState('Attock')
  const [requireApproval, setRequireApproval] = useState(true)
  const [maxImages, setMaxImages] = useState(5)
  const [adExpiry, setAdExpiry] = useState(30)

  const handleSave = () => {
    toast.success('Settings saved!')
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>
        Settings
      </h1>
      <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: '32px' }}>
        Manage site settings
      </p>

      <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* General */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-default)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '20px' }}>
            🌐 General
          </h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>Site Name</label>
            <input value={siteName} onChange={e => setSiteName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>City</label>
            <input value={city} onChange={e => setCity(e.target.value)} className="input-field" />
          </div>
        </div>

        {/* Ad Settings */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-default)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '20px' }}>
            📋 Ad Settings
          </h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>Max Images per Ad</label>
            <input type="number" value={maxImages} onChange={e => setMaxImages(e.target.value)} className="input-field" min={1} max={10} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>Ad Expiry (days)</label>
            <input type="number" value={adExpiry} onChange={e => setAdExpiry(e.target.value)} className="input-field" min={1} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
            <div>
              <p style={{ fontWeight: '600', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Require Approval</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>New ads need admin approval before going live</p>
            </div>
            <button onClick={() => setRequireApproval(!requireApproval)} style={{
              width: '48px', height: '26px', borderRadius: '13px',
              background: requireApproval ? 'var(--brand-primary)' : 'var(--border-default)',
              border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
            }}>
              <span style={{
                position: 'absolute', top: '3px',
                left: requireApproval ? '25px' : '3px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'white', transition: 'left 0.2s',
              }} />
            </button>
          </div>
        </div>

        {/* Admin Info */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-default)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '20px' }}>
            👤 Admin Info
          </h2>
          <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>Logged in as</p>
            <p style={{ fontWeight: '600', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Admin</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>Role: Administrator</p>
          </div>
        </div>

        <button onClick={handleSave} className="btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }}>
          💾 Save Settings
        </button>

      </div>
    </div>
  )
}