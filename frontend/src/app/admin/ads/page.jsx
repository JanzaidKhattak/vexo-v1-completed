'use client'

import { useState, useEffect } from 'react'
import api from '../../../lib/axios'
import toast from 'react-hot-toast'

export default function AdminAdsPage() {
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    fetchAds()
  }, [filter])

  const fetchAds = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/admin/ads?status=${filter}`)
      setAds(res.data.ads)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/admin/ads/${id}/status`, { status })
      toast.success(`Ad ${status}!`)
      fetchAds()
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '24px' }}>
        Manage Ads
      </h1>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['pending', 'active', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
            fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
            border: 'none',
            background: filter === s ? 'var(--brand-primary)' : 'white',
            color: filter === s ? 'white' : 'var(--text-secondary)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)' }}>Loading...</p>
      ) : ads.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px solid var(--border-default)' }}>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>No {filter} ads</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ads.map(ad => (
            <div key={ad._id} style={{
              background: 'white', borderRadius: '12px', padding: '20px',
              border: '1px solid var(--border-default)',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              {/* Image */}
              <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: 'var(--bg-tertiary)', overflow: 'hidden', flexShrink: 0 }}>
                {ad.images?.[0] ? (
                  <img src={ad.images[0]} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📷</div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>{ad.title}</p>
                <p style={{ color: 'var(--brand-primary)', fontWeight: '700', fontFamily: 'Inter, sans-serif', fontSize: '14px', marginBottom: '4px' }}>
                  Rs {ad.price?.toLocaleString()}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                  {ad.category} • {ad.area} • {ad.seller?.phone || 'N/A'}
                </p>
              </div>

              {/* Actions */}
              {filter === 'pending' && (
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => handleStatus(ad._id, 'active')} style={{
                    padding: '8px 16px', background: '#10B981', color: 'white',
                    border: 'none', borderRadius: '8px', fontSize: '13px',
                    fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                  }}>✅ Approve</button>
                  <button onClick={() => handleStatus(ad._id, 'rejected')} style={{
                    padding: '8px 16px', background: '#EF4444', color: 'white',
                    border: 'none', borderRadius: '8px', fontSize: '13px',
                    fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                  }}>❌ Reject</button>
                </div>
              )}
              {filter !== 'pending' && (
                <span style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '12px',
                  fontWeight: '600', fontFamily: 'Inter, sans-serif',
                  background: filter === 'active' ? '#d1fae5' : '#fee2e2',
                  color: filter === 'active' ? '#065f46' : '#991b1b',
                }}>
                  {filter}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}