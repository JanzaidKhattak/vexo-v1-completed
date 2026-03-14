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

  useEffect(() => { fetchAds() }, [filter])

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
    const confirmMsg = status === 'active' ? 'Approve this ad?' : 'Reject this ad?'
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
    { key: 'pending', label: 'Pending' },
    { key: 'active',  label: 'Active'  },
    { key: 'rejected',label: 'Rejected'},
    { key: 'sold',    label: 'Sold'    },
    { key: 'deleted', label: 'Deleted' },
  ]

  return (
    <div style={{ padding: '32px', background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .ad-row:hover { border-color: #C4B5FD !important; box-shadow: 0 4px 16px rgba(108,58,245,0.07) !important; }
        .tab-btn:hover { border-color: #6C3AF5 !important; color: #6C3AF5 !important; }
      `}</style>

      <div style={{ marginBottom: '28px', animation: 'fadeUp 0.4s ease' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Manage Ads
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>
          Review, approve and manage all listings
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap', overflowX: 'auto', animation: 'fadeUp 0.4s ease 0.05s both' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} className="tab-btn" style={{
            padding: '8px 18px', borderRadius: '10px', fontSize: '13px',
            fontWeight: '600', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
            transition: 'all 0.15s',
            border: `1.5px solid ${filter === t.key ? '#6C3AF5' : '#E2E8F0'}`,
            background: filter === t.key ? '#6C3AF5' : 'white',
            color: filter === t.key ? 'white' : '#64748B',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Diff Modal */}
      {showDiff && selectedAd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '18px', padding: '28px', maxWidth: '520px', width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', fontFamily: "'DM Sans', sans-serif", color: '#0f172a', marginBottom: '16px' }}>
              Update History — {selectedAd.title}
            </h3>
            {selectedAd.updateHistory?.length > 0 ? (
              selectedAd.updateHistory.map((entry, i) => (
                <div key={i} style={{ marginBottom: '16px', padding: '14px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", marginBottom: '10px' }}>
                    {new Date(entry.updatedAt).toLocaleString('en-PK')}
                  </p>
                  {Object.entries(entry.changes || {}).map(([field, val]) =>
                    val?.old !== undefined && (
                      <div key={field} style={{ marginBottom: '8px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", textTransform: 'capitalize', marginBottom: '4px', color: '#374151' }}>{field}</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ flex: 1, padding: '8px', background: '#fee2e2', borderRadius: '8px', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>
                            <span style={{ fontWeight: '700', color: '#991b1b' }}>Old: </span>{String(val.old)}
                          </div>
                          <div style={{ flex: 1, padding: '8px', background: '#d1fae5', borderRadius: '8px', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>
                            <span style={{ fontWeight: '700', color: '#065f46' }}>New: </span>{String(val.new)}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>No changes found.</p>
            )}
            <button onClick={() => { setShowDiff(false); setSelectedAd(null) }} style={{ marginTop: '16px', padding: '10px 24px', background: '#6C3AF5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>Loading...</div>
      ) : ads.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '14px', padding: '48px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
          <p style={{ color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", fontWeight: '600' }}>No {filter} ads found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeUp 0.4s ease 0.1s both' }}>
          {ads.map(ad => (
            <div key={ad._id} className="ad-row" style={{
              background: 'white', borderRadius: '14px', padding: '20px 24px',
              border: ad.hasUpdate ? '2px solid #F59E0B' : '1.5px solid #E2E8F0',
              display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap',
              transition: 'all 0.2s',
            }}>
              {/* Image */}
              <div style={{ width: '76px', height: '76px', borderRadius: '10px', background: '#F1F5F9', overflow: 'hidden', flexShrink: 0 }}>
                {ad.images?.[0] ? (
                  <img src={ad.images[0]} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: '160px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                  <p style={{ fontWeight: '700', fontFamily: "'DM Sans', sans-serif", color: '#0f172a', fontSize: '15px' }}>{ad.title}</p>
                  {ad.hasUpdate && (
                    <span style={{ padding: '2px 8px', background: '#FEF3C7', color: '#92400E', borderRadius: '20px', fontSize: '10px', fontWeight: '800', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.04em' }}>
                      UPDATED
                    </span>
                  )}
                </div>
                <p style={{ color: '#6C3AF5', fontWeight: '800', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', marginBottom: '4px' }}>
                  Rs {ad.price?.toLocaleString()}
                </p>
                <p style={{ color: '#94A3B8', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", marginBottom: '2px' }}>
                  {ad.category} · {ad.area || 'N/A'} · {ad.seller?.phone || ad.seller?.email || 'N/A'}
                </p>
                <p style={{ color: '#CBD5E1', fontSize: '11px', fontFamily: "'DM Sans', sans-serif", fontWeight: '700' }}>
                  Ad ID: #{String(ad._id).slice(-8).toUpperCase()}
                </p>
                {filter === 'sold' && ad.soldAt && (
                  <p style={{ color: '#94A3B8', fontSize: '11px', fontFamily: "'DM Sans', sans-serif", marginTop: '2px' }}>
                    Sold: {new Date(ad.soldAt).toLocaleDateString('en-PK')}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                <button onClick={() => window.open(`/ads/${ad._id}`, '_blank')} style={{ padding: '8px 14px', background: '#EFF6FF', color: '#1D4ED8', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
                  View
                </button>
                {ad.hasUpdate && (
                  <button onClick={() => { setSelectedAd(ad); setShowDiff(true) }} style={{ padding: '8px 14px', background: '#FFFBEB', color: '#92400E', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
                    See Changes
                  </button>
                )}
                {filter === 'pending' && (
                  <>
                    <button onClick={() => handleStatus(ad._id, 'active')} style={{ padding: '8px 16px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
                      Approve
                    </button>
                    <button onClick={() => handleStatus(ad._id, 'rejected')} style={{ padding: '8px 16px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
                      Reject
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