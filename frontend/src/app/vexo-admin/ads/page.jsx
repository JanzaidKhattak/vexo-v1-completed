'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import api from '../../../lib/axios'
import toast from 'react-hot-toast'

export default function AdminAdsPage() {
  const { admin } = useAdminAuth()
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [selectedAd, setSelectedAd] = useState(null)
  const [showDiff, setShowDiff] = useState(false)

  useEffect(() => {
    fetchAds()
  }, [filter])

  const getToken = () => localStorage.getItem('vexo_admin_token')

  const fetchAds = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/admin/ads?status=${filter}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setAds(res.data.ads)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatus = async (id, status) => {
    const confirmMsg =
      status === 'active' ? 'Approve this ad?' :
      status === 'rejected' ? 'Reject this ad?' : ''
    if (!window.confirm(confirmMsg)) return
    try {
      await api.patch(`/admin/ads/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      toast.success(`Ad ${status === 'active' ? 'approved' : 'rejected'}!`)
      fetchAds()
    } catch {
      toast.error('Failed to update')
    }
  }

  const tabs = [
    { key: 'pending', label: '⏳ Pending' },
    { key: 'active', label: '✅ Active' },
    { key: 'rejected', label: '❌ Rejected' },
    { key: 'sold', label: '🏷️ Sold' },
    { key: 'deleted', label: '🗑️ Deleted' },
  ]

  const tabStyle = (key) => ({
    padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
    fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
    border: 'none',
    background: filter === key ? '#6C3AF5' : 'white',
    color: filter === key ? 'white' : '#64748B',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  })

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', fontFamily: 'Inter, sans-serif', marginBottom: '24px', letterSpacing: '-0.02em' }}>
        Manage Ads
      </h1>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={tabStyle(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Diff Modal */}
      {showDiff && selectedAd && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '28px',
            maxWidth: '520px', width: '100%', maxHeight: '80vh', overflowY: 'auto',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>
              ✏️ Update History — {selectedAd.title}
            </h3>
            {selectedAd.updateHistory?.length > 0 ? (
              selectedAd.updateHistory.map((entry, i) => (
                <div key={i} style={{ marginBottom: '16px', padding: '14px', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                  <p style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginBottom: '10px' }}>
                    🕐 {new Date(entry.updatedAt).toLocaleString('en-PK')}
                  </p>
                  {Object.entries(entry.changes || {}).map(([field, val]) => (
                    val?.old !== undefined && (
                      <div key={field} style={{ marginBottom: '8px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize', marginBottom: '4px' }}>{field}</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ flex: 1, padding: '8px', background: '#fee2e2', borderRadius: '6px', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                            <span style={{ fontWeight: '600', color: '#991b1b' }}>Old: </span>{String(val.old)}
                          </div>
                          <div style={{ flex: 1, padding: '8px', background: '#d1fae5', borderRadius: '6px', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                            <span style={{ fontWeight: '600', color: '#065f46' }}>New: </span>{String(val.new)}
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              ))
            ) : (
              <p style={{ color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>No changes found.</p>
            )}
            <button onClick={() => { setShowDiff(false); setSelectedAd(null) }} style={{
              marginTop: '16px', padding: '10px 24px', background: '#6C3AF5',
              color: 'white', border: 'none', borderRadius: '8px',
              fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
            }}>Close</button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#94A3B8' }}>Loading...</p>
      ) : ads.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
          <p style={{ color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>No {filter} ads found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ads.map(ad => (
            <div key={ad._id} style={{
              background: 'white', borderRadius: '12px', padding: '20px',
              border: ad.hasUpdate ? '2px solid #f59e0b' : '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
            }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: '#F1F5F9', overflow: 'hidden', flexShrink: 0 }}>
                {ad.images?.[0] ? (
                  <img src={ad.images[0]} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📷</div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <p style={{ fontWeight: '600', fontFamily: 'Inter, sans-serif', color: '#0f172a' }}>{ad.title}</p>
                  {ad.hasUpdate && (
                    <span style={{ padding: '2px 8px', background: '#fef3c7', color: '#92400e', borderRadius: '20px', fontSize: '11px', fontWeight: '700', fontFamily: 'Inter, sans-serif' }}>✏️ UPDATED</span>
                  )}
                </div>
                <p style={{ color: '#6C3AF5', fontWeight: '700', fontFamily: 'Inter, sans-serif', fontSize: '14px', marginBottom: '4px' }}>
                  Rs {ad.price?.toLocaleString()}
                </p>
                <p style={{ color: '#94A3B8', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                  {ad.category} • {ad.area || 'N/A'} • {ad.seller?.phone || ad.seller?.email || 'N/A'}
                </p>
                {filter === 'sold' && ad.soldAt && (
                  <p style={{ color: '#94A3B8', fontSize: '11px', fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
                    Sold: {new Date(ad.soldAt).toLocaleDateString('en-PK')}
                  </p>
                )}
                {filter === 'deleted' && ad.deletedAt && (
                  <p style={{ color: '#94A3B8', fontSize: '11px', fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
                    Deleted: {new Date(ad.deletedAt).toLocaleDateString('en-PK')}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                <button onClick={() => window.open(`/ads/${ad._id}`, '_blank')} style={{ padding: '8px 12px', background: '#EFF6FF', color: '#1D4ED8', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>
                  👁️ View
                </button>
                {ad.hasUpdate && (
                  <button onClick={() => { setSelectedAd(ad); setShowDiff(true) }} style={{ padding: '8px 12px', background: '#fef3c7', color: '#92400e', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>
                    📋 See Changes
                  </button>
                )}
                {filter === 'pending' && (
                  <>
                    <button onClick={() => handleStatus(ad._id, 'active')} style={{ padding: '8px 16px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>
                      ✅ Approve
                    </button>
                    <button onClick={() => handleStatus(ad._id, 'rejected')} style={{ padding: '8px 16px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>
                      ❌ Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}