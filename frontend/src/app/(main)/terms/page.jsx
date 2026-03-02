'use client'

import { useState, useEffect } from 'react'
import api from '../../../lib/axios'

export default function TermsPage() {
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/pages/terms')
      .then(res => setPage(res.data.page))
      .catch(() => setPage(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '80px', textAlign: 'center', fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)' }}>Loading...</div>

  if (!page) return <div style={{ padding: '80px', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>Page not found</div>

  return (
    <div>
      <div style={{ background: 'var(--brand-secondary)', padding: '48px 20px' }}>
        <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>{page.badge}</p>
          <h1 style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'Inter, sans-serif', color: 'white', marginBottom: '12px' }}>{page.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif', fontSize: '15px' }}>{page.subtitle}</p>
        </div>
      </div>
      <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        {page.sections?.map((section, i) => (
          <div key={i} style={{ display: 'flex', gap: '20px', padding: '24px', marginBottom: '16px', background: 'white', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: '24px', width: '48px', height: '48px', background: 'var(--bg-secondary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{section.icon}</div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>{section.title}</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}>{section.content}</p>
            </div>
          </div>
        ))}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', textAlign: 'center', border: '1px solid var(--border-default)', marginTop: '8px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Have questions about our terms?</p>
          <a href="/help" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'var(--brand-primary)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>Visit Help Center →</a>
        </div>
      </div>
    </div>
  )
}