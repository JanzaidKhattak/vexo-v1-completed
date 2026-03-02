'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '../../../../lib/axios'
import { useAuth } from '../../../../context/AuthContext'
import { formatPrice } from '../../../../utils/formatPrice'
import { timeAgo } from '../../../../utils/formatDate'
import toast from 'react-hot-toast'

export default function AdDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [ad, setAd] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [reporting, setReporting] = useState(false)
  const [reportReason, setReportReason] = useState('')

  useEffect(() => {
    fetchAd()
  }, [id])

  const fetchAd = async () => {
    try {
      const res = await api.get(`/ads/${id}`)
      setAd(res.data.ad)
    } catch {
      toast.error('Ad not found')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleReport = async () => {
    if (!user) { router.push('/login'); return }
    if (!reportReason) { toast.error('Select a reason'); return }
    try {
      await api.post(`/reports/${id}`, { reason: reportReason })
      toast.success('Report submitted!')
      setReporting(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report')
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)' }}>
      Loading...
    </div>
  )

  if (!ad) return null

  return (
    <div className="page-container" style={{ padding: '32px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Back */}
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '14px',
          fontFamily: 'Inter, sans-serif', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>← Back</button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

          {/* Left — Images + Details */}
          <div>
            {/* Main Image */}
            <div style={{ borderRadius: '16px', overflow: 'hidden', background: 'var(--bg-tertiary)', marginBottom: '12px', aspectRatio: '16/10' }}>
              {ad.images?.length > 0 ? (
                <img src={ad.images[selectedImage]} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px' }}>📷</div>
              )}
            </div>

            {/* Thumbnails */}
            {ad.images?.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {ad.images.map((img, i) => (
                  <div key={i} onClick={() => setSelectedImage(i)} style={{
                    width: '72px', height: '72px', borderRadius: '8px',
                    overflow: 'hidden', cursor: 'pointer',
                    border: `2px solid ${selectedImage === i ? 'var(--brand-primary)' : 'transparent'}`,
                  }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-default)', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '12px' }}>Description</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
                {ad.description || 'No description provided.'}
              </p>
            </div>

            {/* Details */}
            {ad.details && Object.keys(ad.details).length > 0 && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-default)', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>Details</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {Object.entries(ad.details).map(([key, val]) => val && (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{key}</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Inter, sans-serif' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-default)' }}>
              {!reporting ? (
                <button onClick={() => setReporting(true)} style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  fontSize: '13px', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                }}>🚨 Report this ad</button>
              ) : (
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif', marginBottom: '12px' }}>Report Reason</p>
                  <select value={reportReason} onChange={e => setReportReason(e.target.value)} className="input-field" style={{ marginBottom: '12px' }}>
                    <option value="">Select reason</option>
                    <option value="spam">Spam</option>
                    <option value="fake">Fake Ad</option>
                    <option value="inappropriate">Inappropriate</option>
                    <option value="wrong_category">Wrong Category</option>
                    <option value="other">Other</option>
                  </select>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleReport} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>Submit</button>
                    <button onClick={() => setReporting(false)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right — Price + Seller */}
          <div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-default)', position: 'sticky', top: '80px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--brand-primary)', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>
                  {formatPrice(ad.price)}
                </div>
                <h1 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'Inter, sans-serif', lineHeight: '1.4', marginBottom: '8px' }}>
                  {ad.title}
                </h1>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>📍 {ad.area}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>🕐 {timeAgo(ad.createdAt)}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>👁 {ad.views} views</span>
                </div>
              </div>

              {/* Call Button */}
              <a href={`tel:${ad.seller?.phone}`} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '14px',
                background: 'var(--brand-primary)', color: 'white',
                borderRadius: '10px', textDecoration: 'none',
                fontSize: '15px', fontWeight: '700', fontFamily: 'Inter, sans-serif',
                marginBottom: '10px',
              }}>
                📞 Call Seller
              </a>

              <button onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast.success('Link copied!')
              }} style={{
                width: '100%', padding: '12px',
                border: '1.5px solid var(--border-default)',
                borderRadius: '10px', background: 'white',
                fontSize: '14px', fontWeight: '600',
                fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              }}>
                🔗 Share Ad
              </button>

              {/* Seller Info */}
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-default)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: '10px' }}>SELLER</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontFamily: 'Inter, sans-serif' }}>
                    {ad.seller?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>{ad.seller?.name || 'Anonymous'}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>{ad.seller?.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}