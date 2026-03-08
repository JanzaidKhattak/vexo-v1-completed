'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '../../../../lib/axios'
import { useAuth } from '../../../../context/AuthContext'
import { formatPrice } from '../../../../utils/formatPrice'
import { timeAgo } from '../../../../utils/formatDate'
import toast from 'react-hot-toast'

// ─── Report Modal ──────────────────────────────────────────────────────────────
function ReportModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState('')
  const [comment, setComment] = useState('')
  const reasons = [
    'Offensive content', 'Fraud', 'Duplicate ad',
    'Product already sold', 'Wrong category', 'Product unavailable',
    'Fake product', 'Indecent', 'Other',
  ]
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', width: '100%',
        maxWidth: '460px', margin: '20px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        animation: 'slideUp 0.25s ease', overflow: 'hidden',
      }}>
        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', fontFamily: "'DM Sans', sans-serif" }}>Report Item</h3>
          </div>
          <button onClick={onClose} style={{ background: '#F8FAFC', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '16px', fontWeight: '700' }}>✕</button>
        </div>
        <div style={{ padding: '20px 28px', maxHeight: '70vh', overflowY: 'auto' }}>
          <p style={{ fontSize: '13px', color: '#64748B', fontFamily: "'DM Sans', sans-serif", marginBottom: '14px' }}>
            Select the reason for reporting this ad
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '16px' }}>
            {reasons.map(r => (
              <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '10px', cursor: 'pointer', border: `1.5px solid ${reason === r ? '#6C3AF5' : '#E2E8F0'}`, background: reason === r ? '#FAF5FF' : 'white', transition: 'all 0.15s' }}>
                <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} style={{ accentColor: '#6C3AF5', width: '16px', height: '16px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: reason === r ? '600' : '500', color: reason === r ? '#6C3AF5' : '#374151', fontFamily: "'DM Sans', sans-serif" }}>{r}</span>
              </label>
            ))}
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Additional comments (optional)" rows={3}
            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", outline: 'none', resize: 'none', boxSizing: 'border-box', color: '#374151', marginBottom: '16px' }}
            onFocus={e => e.target.style.borderColor = '#6C3AF5'}
            onBlur={e => e.target.style.borderColor = '#E2E8F0'}
          />
          <button onClick={() => { if (reason) onSubmit(reason, comment) }} disabled={!reason} style={{ width: '100%', padding: '13px', background: reason ? '#6C3AF5' : '#E2E8F0', color: reason ? 'white' : '#94A3B8', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", cursor: reason ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
            Send Complaint
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Related Card ──────────────────────────────────────────────────────────────
function RelatedCard({ ad }) {
  const router = useRouter()
  return (
    <div onClick={() => router.push(`/ads/${ad._id}`)} style={{ minWidth: '195px', width: '195px', borderRadius: '14px', background: 'white', border: '1.5px solid #E2E8F0', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s ease', flexShrink: 0 }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(108,58,245,0.1)'; e.currentTarget.style.borderColor = '#C4B5FD' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E2E8F0' }}
    >
      <div style={{ height: '136px', background: '#F8FAFC', overflow: 'hidden' }}>
        {ad.images?.[0] ? (
          <img src={ad.images[0]} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
        )}
      </div>
      <div style={{ padding: '11px' }}>
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', fontFamily: "'DM Sans', sans-serif", marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>{ad.title}</p>
        <p style={{ fontSize: '13px', fontWeight: '800', color: '#6C3AF5', fontFamily: "'DM Sans', sans-serif" }}>{formatPrice(ad.price)}</p>
        <p style={{ fontSize: '11px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", marginTop: '3px' }}>{ad.area || 'Attock'}</p>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [ad, setAd] = useState(null)
  const [sellerAdCount, setSellerAdCount] = useState(0)
  const [relatedAds, setRelatedAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const relatedRef = useRef(null)

  useEffect(() => { fetchAd() }, [id])

  const fetchAd = async () => {
    try {
      const [adRes, relRes] = await Promise.all([
        api.get(`/ads/${id}`),
        api.get(`/ads/${id}/related`).catch(() => ({ data: { ads: [] } })),
      ])
      setAd(adRes.data.ad)
      setSellerAdCount(adRes.data.sellerAdCount || 0)
      setRelatedAds(relRes.data.ads || [])
    } catch {
      toast.error('Ad not found')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleReport = async (reason, comment) => {
    if (!user) { router.push('/login'); return }
    try {
      await api.post(`/reports/${id}`, { reason, comment })
      toast.success('Report submitted!')
      setShowReport(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report')
    }
  }

  const handleImageNav = (dir) => {
    if (!ad?.images?.length) return
    setImgLoaded(false)
    setSelectedImage(prev => dir === 'next' ? (prev + 1) % ad.images.length : (prev - 1 + ad.images.length) % ad.images.length)
  }

  const scrollRelated = (dir) => {
    relatedRef.current?.scrollBy({ left: dir === 'next' ? 430 : -430, behavior: 'smooth' })
  }

  if (loading) return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#6C3AF5', animation: 'spin 0.75s linear infinite' }} />
    </div>
  )

  if (!ad) return null

  const sellerFullName = [ad.seller?.firstName, ad.seller?.lastName].filter(Boolean).join(' ').trim() || ad.seller?.name || 'Anonymous'
  const sellerInitial = sellerFullName !== 'Anonymous' ? sellerFullName.charAt(0).toUpperCase() : 'A'
  const memberSince = ad.seller?.createdAt ? new Date(ad.seller.createdAt).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' }) : 'Unknown'

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .img-nav-btn:hover { background: rgba(255,255,255,1) !important; }
        .call-btn:hover { background: #5428C8 !important; transform: translateY(-2px) !important; box-shadow: 0 10px 28px rgba(108,58,245,0.42) !important; }
        .share-btn:hover { border-color: #6C3AF5 !important; color: #6C3AF5 !important; background: #FAF5FF !important; }
        .report-trigger:hover { color: #EF4444 !important; }
        .back-btn:hover { background: #EDE9FE !important; color: #6C3AF5 !important; }
        .thumb-item:hover { border-color: #6C3AF5 !important; }
        .arrow-btn:hover { border-color: #6C3AF5 !important; background: #FAF5FF !important; }
        .safety-row:hover { background: #FAF5FF !important; }
      `}</style>

      <div className="page-container" style={{ padding: '24px 20px 64px' }}>
        <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

          {/* Back */}
          <button onClick={() => router.back()} className="back-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '13px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", marginBottom: '20px', padding: '6px 12px', borderRadius: '8px', transition: 'all 0.15s' }}>
            ← Back
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', alignItems: 'flex-start' }}>

            {/* ── LEFT ─────────────────────────────────────────────── */}
            <div style={{ animation: 'fadeUp 0.45s ease' }}>

              {/* Main Image */}
              <div style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative', background: '#0f172a', marginBottom: '10px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', aspectRatio: '4/3' }}>
                {!imgLoaded && ad.images?.length > 0 && (
                  <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(90deg,#1e293b 25%,#334155 50%,#1e293b 75%)', backgroundSize: '800px 100%', animation: 'shimmer 1.5s infinite linear' }} />
                )}
                {ad.images?.length > 0 ? (
                  <img src={ad.images[selectedImage]} alt={ad.title} onLoad={() => setImgLoaded(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.35s ease' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: '#475569' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}>No image</span>
                  </div>
                )}
                {/* Counter */}
                {ad.images?.length > 1 && (
                  <div style={{ position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', color: 'white', fontSize: '12px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", padding: '4px 12px', borderRadius: '20px' }}>
                    {selectedImage + 1} / {ad.images.length}
                  </div>
                )}
                {/* Nav arrows */}
                {ad.images?.length > 1 && ['prev', 'next'].map(dir => (
                  <button key={dir} onClick={() => handleImageNav(dir)} className="img-nav-btn" style={{ position: 'absolute', [dir === 'prev' ? 'left' : 'right']: '12px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.82)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', transition: 'background 0.15s', zIndex: 2 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {dir === 'prev' ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
                    </svg>
                  </button>
                ))}
              </div>

              {/* Thumbnails */}
              {ad.images?.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
                  {ad.images.map((img, i) => (
                    <div key={i} onClick={() => { setImgLoaded(false); setSelectedImage(i) }} className="thumb-item" style={{ width: '70px', height: '70px', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', border: `2.5px solid ${selectedImage === i ? '#6C3AF5' : '#E2E8F0'}`, transition: 'all 0.15s', boxShadow: selectedImage === i ? '0 0 0 3px rgba(108,58,245,0.18)' : 'none' }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              <div style={{ background: 'white', borderRadius: '18px', padding: '26px', border: '1px solid #E2E8F0', marginBottom: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                <h2 style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", marginBottom: '14px' }}>Description</h2>
                <p style={{ fontSize: '15px', color: '#334155', fontFamily: "'DM Sans', sans-serif", lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  {ad.description || 'No description provided.'}
                </p>
              </div>

              {/* Specs */}
              {ad.details && Object.keys(ad.details).filter(k => ad.details[k]).length > 0 && (
                <div style={{ background: 'white', borderRadius: '18px', padding: '26px', border: '1px solid #E2E8F0', marginBottom: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                  <h2 style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", marginBottom: '16px' }}>Specifications</h2>
                  {Object.entries(ad.details).filter(([, v]) => v).map(([key, val], i, arr) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 10px', borderRadius: '8px', borderBottom: i < arr.length - 1 ? '1px solid #F8FAFC' : 'none', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: '13px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", fontWeight: '500', textTransform: 'capitalize' }}>{key}</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', fontFamily: "'DM Sans', sans-serif" }}>{val}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Related Ads */}
              {relatedAds.length > 0 && (
                <div style={{ background: 'white', borderRadius: '18px', padding: '26px', border: '1px solid #E2E8F0', marginBottom: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <h2 style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>Related Ads</h2>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['prev', 'next'].map(dir => (
                        <button key={dir} onClick={() => scrollRelated(dir)} className="arrow-btn" style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #E2E8F0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {dir === 'prev' ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div ref={relatedRef} style={{ display: 'flex', gap: '12px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
                    {relatedAds.map(r => <RelatedCard key={r._id} ad={r} />)}
                  </div>
                </div>
              )}

              {/* Safety */}
              <div style={{ background: 'white', borderRadius: '18px', padding: '26px', border: '1px solid #E2E8F0', marginBottom: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                <h2 style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", marginBottom: '16px' }}>Your Safety Matters</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    'Meet in a safe, public location when exchanging items or money.',
                    'Never send advance payments without physically verifying the product.',
                    'Inspect the item carefully before making any payment.',
                    'Report suspicious ads or unusual seller behavior immediately.',
                  ].map((tip, i) => (
                    <div key={i} className="safety-row" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', borderRadius: '10px', border: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6C3AF5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                      </div>
                      <p style={{ fontSize: '13px', color: '#475569', fontFamily: "'DM Sans', sans-serif", lineHeight: '1.55', fontWeight: '500' }}>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Report */}
              <div style={{ background: 'white', borderRadius: '18px', padding: '16px 26px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                <button onClick={() => setShowReport(true)} className="report-trigger" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', fontSize: '13px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
                  </svg>
                  Report this ad
                </button>
              </div>
            </div>

            {/* ── RIGHT ────────────────────────────────────────────── */}
            <div style={{ position: 'sticky', top: '88px', animation: 'fadeUp 0.45s ease 0.12s both' }}>
              <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

                {/* Price + Title */}
                <div style={{ padding: '24px 24px 0' }}>
                  <div style={{ fontSize: '30px', fontWeight: '900', color: '#6C3AF5', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: '10px', lineHeight: 1 }}>
                    {formatPrice(ad.price)}
                  </div>
                  <h1 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', fontFamily: "'DM Sans', sans-serif", lineHeight: '1.45', marginBottom: '16px', letterSpacing: '-0.01em' }}>
                    {ad.title}
                  </h1>

                  {/* Meta */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '18px', borderBottom: '1px solid #F1F5F9', marginBottom: '18px' }}>
                    {[
                      { label: 'Location', value: ad.area || 'Attock' },
                      { label: 'Posted', value: timeAgo(ad.createdAt) },
                      { label: 'Views', value: `${ad.views || 0}` },
                      { label: 'Ad ID', value: `#${String(ad._id).slice(-8).toUpperCase()}` },
                    ].map(m => (
                      <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", fontWeight: '500' }}>{m.label}</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155', fontFamily: "'DM Sans', sans-serif" }}>{m.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Buttons */}
                  <a href={`tel:${ad.seller?.phone}`} className="call-btn" style={{ display: 'block', textAlign: 'center', padding: '14px', background: '#6C3AF5', color: 'white', borderRadius: '12px', textDecoration: 'none', fontSize: '15px', fontWeight: '800', fontFamily: "'DM Sans', sans-serif", marginBottom: '10px', transition: 'all 0.2s ease', boxShadow: '0 4px 16px rgba(108,58,245,0.28)' }}>
                    Call Seller
                  </a>
                  <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }} className="share-btn" style={{ width: '100%', padding: '12px', border: '1.5px solid #E2E8F0', borderRadius: '12px', background: 'white', color: '#64748B', fontSize: '13px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 0.15s', marginBottom: '20px' }}>
                    Share Ad
                  </button>
                </div>

                {/* Seller */}
                <div style={{ borderTop: '1px solid #F1F5F9', padding: '18px 24px', background: '#FAFAFA' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", marginBottom: '14px' }}>
                    Posted by
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,#6C3AF5,#9B6DFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {ad.seller?.avatar ? (
                        <img src={ad.seller.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: 'white', fontSize: '17px', fontWeight: '800', fontFamily: "'DM Sans', sans-serif" }}>{sellerInitial}</span>
                      )}
                    </div>
                    <div>
                      <p style={{ fontWeight: '800', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#0f172a', marginBottom: '3px' }}>{sellerFullName}</p>
                      {ad.seller?.isEmailVerified && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#EFF6FF', padding: '2px 7px', borderRadius: '20px' }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="#3B82F6"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: '#3B82F6', fontFamily: "'DM Sans', sans-serif" }}>Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { label: 'Member since', value: memberSince },
                      { label: 'Active ads', value: sellerAdCount },
                    ].map(m => (
                      <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", fontWeight: '500' }}>{m.label}</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155', fontFamily: "'DM Sans', sans-serif" }}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReport && <ReportModal onClose={() => setShowReport(false)} onSubmit={handleReport} />}
    </div>
  )
}