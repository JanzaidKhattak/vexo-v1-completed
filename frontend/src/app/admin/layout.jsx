'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import Link from 'next/link'
import api from '../../lib/axios'

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
    if (user?.role === 'admin') fetchPending()
  }, [user, loading])

  const fetchPending = async () => {
    try {
      const res = await api.get('/admin/dashboard')
      setPendingCount(res.data.pendingAds || 0)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return null
  if (!user || user.role !== 'admin') return null

  const navLinks = [
    { href: '/admin', label: '📊 Dashboard', badge: 0 },
    { href: '/admin/ads', label: '📋 Manage Ads', badge: pendingCount },
    { href: '/admin/users', label: '👥 Users', badge: 0 },
    { href: '/admin/reports', label: '🚨 Reports', badge: 0 },
    { href: '/admin/pages', label: '📄 Pages', badge: 0 },
    { href: '/admin/settings', label: '⚙️ Settings', badge: 0 },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <div style={{
        width: '240px', background: 'var(--brand-secondary)',
        padding: '24px 0', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', background: 'var(--brand-primary)',
              borderRadius: '8px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '14px',
            }}>V</div>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>
              Admin Panel
            </span>
          </div>
        </div>

        <nav style={{ padding: '16px 12px' }}>
          {navLinks.map(item => (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px',
              color: 'rgba(255,255,255,0.8)', textDecoration: 'none',
              borderRadius: '8px', fontSize: '14px',
              fontFamily: 'Inter, sans-serif', fontWeight: '500',
              marginBottom: '4px', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
            >
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span style={{
                  background: 'var(--brand-primary)', color: 'white',
                  borderRadius: '12px', fontSize: '11px', fontWeight: '700',
                  padding: '2px 7px', fontFamily: 'Inter, sans-serif',
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '16px', paddingTop: '16px' }}>
            <Link href="/" style={{
              display: 'block', padding: '10px 12px',
              color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
              borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif',
            }}>
              ← Back to Site
            </Link>
          </div>
        </nav>
      </div>

      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}