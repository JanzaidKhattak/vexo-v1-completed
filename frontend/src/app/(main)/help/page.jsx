'use client'

import { useState, useEffect } from 'react'
import api from '../../../lib/axios'

export default function HelpPage() {
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/pages/help')
      .then(res => setPage(res.data.page))
      .catch(() => setPage(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '80px', textAlign: 'center', fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)' }}>Loading...</div>

  if (!page) return <div style={{ padding: '80px', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>Page not found</div>

  return (
    <div>
      <div style={{ background: 'var(--brand-secondary)', padding: '48px 20px' }}>
        <div className="page-container" style={{ maxWidth: '860px', margin: '0 auto' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>{page.badge}</p>
          <h1 style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'Inter, sans-serif', color: 'white', marginBottom: '12px' }}>{page.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif', fontSize: '15px' }}>{page.subtitle}</p>
        </div>
      </div>

      <div className="page-container" style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 20px' }}>
        {page.sections?.map((section, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '12px', border: '1px solid var(--border-default)', display: 'flex', gap: '16px' }}>
            <div style={{ fontSize: '24px', width: '48px', height: '48px', background: 'var(--bg-secondary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{section.icon}</div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>{section.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', lineHeight: '1.7', margin: 0 }}>{section.content}</p>
            </div>
          </div>
        ))}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '24px' }}>
          <div style={{ background: '#25D366', borderRadius: '16px', padding: '28px', textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>💬</div>
            <h3 style={{ fontSize: '17px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>WhatsApp Support</h3>
            <p style={{ fontSize: '13px', opacity: 0.9, fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>Chat with us directly for quick help.</p>
            <a href="https://wa.me/923331370006" target="_blank" style={{ display: 'inline-block', padding: '10px 20px', background: 'white', color: '#25D366', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '700', fontFamily: 'Inter, sans-serif' }}>
              Chat Now
            </a>
          </div>
          <div style={{ background: 'var(--brand-secondary)', borderRadius: '16px', padding: '28px', textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📧</div>
            <h3 style={{ fontSize: '17px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>Report an Issue</h3>
            <p style={{ fontSize: '13px', opacity: 0.7, fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>Found a bug or fake ad? Let us know.</p>
            <a href="mailto:support@vexo.pk" style={{ display: 'inline-block', padding: '10px 20px', background: 'var(--brand-primary)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '700', fontFamily: 'Inter, sans-serif' }}>
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}