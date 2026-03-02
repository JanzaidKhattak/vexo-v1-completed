'use client'

import { useState, useEffect } from 'react'
import api from '../../lib/axios'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard')
      console.log('Dashboard data:', res.data)
      setStats(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p style={{ fontFamily: 'Inter, sans-serif' }}>Loading...</p>

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: '#3B82F6' },
    { label: 'Total Ads', value: stats?.totalAds || 0, icon: '📋', color: '#10B981' },
    { label: 'Pending Ads', value: stats?.pendingAds || 0, icon: '⏳', color: '#F59E0B' },
    { label: 'Active Ads', value: stats?.activeAds || 0, icon: '✅', color: '#6366F1' },
    { label: 'Total Reports', value: stats?.totalReports || 0, icon: '🚨', color: '#EF4444' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>
        Dashboard
      </h1>
      <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: '32px' }}>
        Welcome back, Admin!
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {cards.map(card => (
          <div key={card.label} style={{
            background: 'white', borderRadius: '12px',
            padding: '24px', border: '1px solid var(--border-default)',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{card.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'Inter, sans-serif', color: card.color }}>
              {card.value}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginTop: '4px' }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {stats?.recentPending?.length > 0 && (
        <div style={{ marginTop: '32px', background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-default)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>
            ⏳ Pending Approval
          </h2>
          {stats.recentPending.map(ad => (
            <div key={ad._id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 0', borderBottom: '1px solid var(--border-light)',
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>{ad.title}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                  Rs {ad.price?.toLocaleString()} • {ad.category}
                </p>
              </div>
              <a href="/admin/ads" style={{
                padding: '6px 14px', background: 'var(--brand-primary)',
                color: 'white', borderRadius: '6px', fontSize: '12px',
                fontWeight: '600', fontFamily: 'Inter, sans-serif', textDecoration: 'none',
              }}>Review</a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}