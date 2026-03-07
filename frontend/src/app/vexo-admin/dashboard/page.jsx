'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import api from '../../../lib/axios'
import Link from 'next/link'

export default function AdminDashboard() {
  const { admin, adminLogout } = useAdminAuth()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('vexo_admin_token')
      const res = await api.get('/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#6C3AF5', bg: 'rgba(108,58,245,0.1)', link: '/vexo-admin/users' },
    { label: 'Total Ads', value: stats.totalAds, icon: '📋', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', link: '/vexo-admin/ads' },
    { label: 'Pending Review', value: stats.pendingAds, icon: '⏳', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', link: '/vexo-admin/ads?status=pending' },
    { label: 'Active Ads', value: stats.activeAds, icon: '✅', color: '#10B981', bg: 'rgba(16,185,129,0.1)', link: '/vexo-admin/ads?status=active' },
    { label: 'Sold Ads', value: stats.soldAds || 0, icon: '🏷️', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', link: '/vexo-admin/ads?status=sold' },
    { label: 'Pending Reports', value: stats.totalReports, icon: '🚩', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', link: '/vexo-admin/reports' },
  ] : []

  return (
    <div style={{ padding: '32px', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginBottom: '4px', letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
        <p style={{ color: '#64748B', fontSize: '14px' }}>
          Welcome back, {admin?.firstName}! Here's what's happening on VEXO.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #E2E8F0', height: '100px', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {statCards.map(card => (
              <Link key={card.label} href={card.link} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'white', borderRadius: '14px', padding: '24px',
                  border: '1px solid #E2E8F0', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                      {card.icon}
                    </div>
                  </div>
                  <p style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{card.value}</p>
                  <p style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>{card.label}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Pending Ads */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>⏳ Recent Pending Ads</h2>
              <Link href="/vexo-admin/ads?status=pending" style={{ fontSize: '13px', color: '#6C3AF5', fontWeight: '600', textDecoration: 'none' }}>
                View All →
              </Link>
            </div>

            {stats?.recentPending?.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                No pending ads 🎉
              </div>
            ) : (
              <div>
                {stats?.recentPending?.map(ad => (
                  <div key={ad._id} style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px 24px', borderBottom: '1px solid #F8FAFC',
                  }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#F1F5F9', overflow: 'hidden', flexShrink: 0 }}>
                      {ad.images?.[0] ? (
                        <img src={ad.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📷</div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px', marginBottom: '2px' }}>{ad.title}</p>
                      <p style={{ color: '#64748B', fontSize: '12px' }}>
                        {ad.seller?.name || ad.seller?.firstName || 'Unknown'} • Rs {ad.price?.toLocaleString()}
                      </p>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: '#FEF3C7', color: '#92400E' }}>
                      Pending
                    </span>
                    <Link href={`/vexo-admin/ads?status=pending`} style={{
                      padding: '6px 12px', background: '#6C3AF5', color: 'white',
                      borderRadius: '7px', fontSize: '12px', fontWeight: '600',
                      textDecoration: 'none',
                    }}>
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}