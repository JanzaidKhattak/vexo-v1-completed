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
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => { fetchAd() }, [id])

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

  const handleImageSelect = (i) => {
    setImgLoaded(false)
    setSelectedImage(i)
  }

  if (loading) return (
    <div style={{
      minHeight: '60vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#F8FAFC',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid #E2E8F0', borderTopColor: '#6C3AF5',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#94A3B8', fontSize: '14px' }}>
          Loading...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )

  if (!ad) return null

  const sellerName = ad.seller?.name || ad.seller?.firstName
    ? `${ad.seller?.firstName || ''} ${ad.seller?.lastName || ''}`.trim()
    : 'Anonymous'
  const sellerInitial = sellerName !== 'Anonymous'
    ? sellerName.charAt(0).toUpperCase()
    : 'A'

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .back-btn:hover {
          color: #6C3AF5 !important;
          background: #EDE9FE !important;
        }
        .thumb:hover {
          border-color: #6C3AF5 !important;
          transform: scale(1.04) !important;
        }
        .call-btn:hover {
          background: #5B2FD4 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 24px rgba(108,58,245,0.35) !important;
        }
        .share-btn:hover {
          border-color: #6C3AF5 !important;
          color: #6C3AF5 !important;
          background: #FAF5FF !important;
        }
        .detail-row:hover {
          background: #F8FAFC !important;
        }
        .report-link:hover {
          color: #EF4444 !important;
        }
      `}</style>

      <div className="page-container" style={{ padding: '28px 20px 60px' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>

          {/* Back */}
          <button
            onClick={() => router.back()}
            className="back-btn"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#94A3B8', fontSize: '13px', fontWeight: '600',
              fontFamily: "'DM Sans', sans-serif", marginBottom: '24px',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '8px',
              transition: 'all 0.15s',
            }}
          >
            ← Back
          </button>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: '28px',
            alignItems: 'flex-start',
          }}>

            {/* LEFT */}
            <div style={{ animation: 'fadeUp 0.5s ease' }}>

              {/* Main Image */}
              <div style={{
                borderRadius: '20px', overflow: 'hidden',
                background: '#E2E8F0', marginBottom: '12px',
                position: 'relative',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                aspectRatio: '4/3',
              }}>
                {!imgLoaded && ad.images?.length > 0 && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
                    backgroundSize: '800px 100%',
                    animation: 'shimmer 1.4s infinite linear',
                  }} />
                )}
                {ad.images?.length > 0 ? (
                  <img
                    src={ad.images[selectedImage]}
                    alt={ad.title}
                    onLoad={() => setImgLoaded(true)}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'contain',
                      background: '#0f172a',
                      opacity: imgLoaded ? 1 : 0,
                      transition: 'opacity 0.4s ease',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#CBD5E1', flexDirection: 'column', gap: '12px',
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}>No image</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {ad.images?.length > 1 && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
                  {ad.images.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => handleImageSelect(i)}
                      className="thumb"
                      style={{
                        width: '76px', height: '76px', borderRadius: '12px',
                        overflow: 'hidden', cursor: 'pointer',
                        border: `2.5px solid ${selectedImage === i ? '#6C3AF5' : '#E2E8F0'}`,
                        transition: 'all 0.15s',
                        boxShadow: selectedImage === i ? '0 0 0 3px rgba(108,58,245,0.15)' : 'none',
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              <div style={{
                background: 'white', borderRadius: '18px',
                padding: '28px', border: '1px solid #E2E8F0',
                marginBottom: '16px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <h2 style={{
                  fontSize: '13px', fontWeight: '700', letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: '#94A3B8',
                  fontFamily: "'DM Sans', sans-serif", marginBottom: '14px',
                }}>Description</h2>
                <p style={{
                  fontSize: '15px', color: '#334155',
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: '1.75', whiteSpace: 'pre-wrap',
                }}>
                  {ad.description || 'No description provided.'}
                </p>
              </div>

              {/* Details */}
              {ad.details && Object.keys(ad.details).filter(k => ad.details[k]).length > 0 && (
                <div style={{
                  background: 'white', borderRadius: '18px',
                  padding: '28px', border: '1px solid #E2E8F0',
                  marginBottom: '16px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                  <h2 style={{
                    fontSize: '13px', fontWeight: '700', letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: '#94A3B8',
                    fontFamily: "'DM Sans', sans-serif", marginBottom: '18px',
                  }}>Specifications</h2>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {Object.entries(ad.details).filter(([, v]) => v).map(([key, val], i, arr) => (
                      <div
                        key={key}
                        className="detail-row"
                        style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '13px 10px',
                          borderBottom: i < arr.length - 1 ? '1px solid #F1F5F9' : 'none',
                          borderRadius: '8px',
                          transition: 'background 0.15s',
                        }}
                      >
                        <span style={{
                          fontSize: '13px', color: '#94A3B8',
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: '500', textTransform: 'capitalize',
                        }}>{key}</span>
                        <span style={{
                          fontSize: '14px', fontWeight: '700',
                          color: '#0f172a', fontFamily: "'DM Sans', sans-serif",
                        }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Report */}
              <div style={{
                background: 'white', borderRadius: '18px',
                padding: '20px 28px', border: '1px solid #E2E8F0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                {!reporting ? (
                  <button
                    onClick={() => setReporting(true)}
                    className="report-link"
                    style={{
                      background: 'none', border: 'none', color: '#CBD5E1',
                      fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
                      cursor: 'pointer', fontWeight: '500',
                      transition: 'color 0.15s',
                    }}
                  >
                    Report this ad
                  </button>
                ) : (
                  <div style={{ animation: 'fadeIn 0.2s ease' }}>
                    <p style={{
                      fontSize: '14px', fontWeight: '700',
                      fontFamily: "'DM Sans', sans-serif",
                      color: '#0f172a', marginBottom: '12px',
                    }}>Why are you reporting this ad?</p>
                    <select
                      value={reportReason}
                      onChange={e => setReportReason(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 14px', marginBottom: '12px',
                        border: '1.5px solid #E2E8F0', borderRadius: '10px',
                        fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
                        outline: 'none', background: 'white', color: '#374151',
                      }}
                    >
                      <option value="">Select a reason</option>
                      <option value="spam">Spam</option>
                      <option value="fake">Fake Ad</option>
                      <option value="inappropriate">Inappropriate Content</option>
                      <option value="wrong_category">Wrong Category</option>
                      <option value="other">Other</option>
                    </select>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleReport}
                        style={{
                          padding: '9px 20px', background: '#EF4444', color: 'white',
                          border: 'none', borderRadius: '8px', fontWeight: '700',
                          fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >Submit Report</button>
                      <button
                        onClick={() => setReporting(false)}
                        style={{
                          padding: '9px 20px', background: '#F1F5F9', color: '#64748B',
                          border: 'none', borderRadius: '8px', fontWeight: '600',
                          fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Sticky Sidebar */}
            <div style={{
              position: 'sticky', top: '88px',
              animation: 'fadeUp 0.5s ease 0.1s both',
            }}>
              <div style={{
                background: 'white', borderRadius: '20px',
                border: '1px solid #E2E8F0', overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              }}>
                {/* Price Block */}
                <div style={{ padding: '28px 28px 20px' }}>
                  <div style={{
                    fontSize: '32px', fontWeight: '900', color: '#6C3AF5',
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: '-0.03em', marginBottom: '10px',
                    lineHeight: 1,
                  }}>
                    {formatPrice(ad.price)}
                  </div>
                  <h1 style={{
                    fontSize: '17px', fontWeight: '700', color: '#0f172a',
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: '1.4', marginBottom: '16px',
                    letterSpacing: '-0.01em',
                  }}>
                    {ad.title}
                  </h1>

                  {/* Meta */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
                    {[
                      { label: 'Location', value: ad.area || 'Attock' },
                      { label: 'Posted', value: timeAgo(ad.createdAt) },
                      { label: 'Views', value: `${ad.views || 0}` },
                      ...(ad.category ? [{ label: 'Category', value: ad.category }] : []),
                    ].map(m => (
                      <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", fontWeight: '500' }}>
                          {m.label}
                        </span>
                        <span style={{
                          fontSize: '13px', fontWeight: '600', color: '#334155',
                          fontFamily: "'DM Sans', sans-serif", textTransform: 'capitalize',
                        }}>
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Call Button */}
                  <a
                    href={`tel:${ad.seller?.phone}`}
                    className="call-btn"
                    style={{
                      display: 'block', width: '100%', textAlign: 'center',
                      padding: '15px', background: '#6C3AF5', color: 'white',
                      borderRadius: '12px', textDecoration: 'none',
                      fontSize: '15px', fontWeight: '800',
                      fontFamily: "'DM Sans', sans-serif",
                      marginBottom: '10px', letterSpacing: '-0.01em',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 16px rgba(108,58,245,0.25)',
                    }}
                  >
                    Call Seller
                  </a>

                  {/* Share Button */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      toast.success('Link copied!')
                    }}
                    className="share-btn"
                    style={{
                      width: '100%', padding: '13px',
                      border: '1.5px solid #E2E8F0', borderRadius: '12px',
                      background: 'white', color: '#64748B',
                      fontSize: '14px', fontWeight: '600',
                      fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    Share Ad
                  </button>
                </div>

                {/* Seller Block */}
                <div style={{
                  borderTop: '1px solid #F1F5F9',
                  padding: '20px 28px',
                  background: '#FAFAFA',
                }}>
                  <p style={{
                    fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: '#94A3B8',
                    fontFamily: "'DM Sans', sans-serif", marginBottom: '14px',
                  }}>Seller</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '46px', height: '46px', borderRadius: '12px',
                      background: 'linear-gradient(135deg, #6C3AF5, #9B6DFF)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, overflow: 'hidden',
                    }}>
                      {ad.seller?.avatar ? (
                        <img src={ad.seller.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{
                          color: 'white', fontSize: '18px', fontWeight: '800',
                          fontFamily: "'DM Sans', sans-serif",
                        }}>
                          {sellerInitial}
                        </span>
                      )}
                    </div>
                    <div>
                      <p style={{
                        fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
                        fontSize: '15px', color: '#0f172a', marginBottom: '2px',
                      }}>
                        {sellerName}
                      </p>
                      {ad.seller?.isEmailVerified && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: '#EFF6FF', padding: '2px 7px', borderRadius: '20px',
                        }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="#3B82F6">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span style={{
                            fontSize: '10px', fontWeight: '700', color: '#3B82F6',
                            fontFamily: "'DM Sans', sans-serif",
                          }}>Verified</span>
                        </div>
                      )}
                    </div>
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