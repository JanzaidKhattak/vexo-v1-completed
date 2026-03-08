'use client'

import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import { CATEGORIES } from '../../constants/categories'

export default function CategoryGrid() {
  const { settings } = useSiteSettings()
  const scrollRef = useRef(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(false)

  const categories = (() => {
    const cats = settings?.categories?.filter(c => c.isActive)
    if (cats && cats.length > 0) return cats
    return CATEGORIES
  })()

  const CARD_W = 96
  const GAP    = 18

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect() }
  }, [categories])

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'right' ? (CARD_W + GAP) * 3 : -(CARD_W + GAP) * 3, behavior: 'smooth' })
  }

  const showArrows = categories.length > 6

  return (
    <section style={{ padding: '36px 0 20px' }}>
      <style>{`
        @keyframes catFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .cat-item {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
        .cat-item:hover {
          transform: translateY(-4px) !important;
        }
        .cat-circle {
          transition: background 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease !important;
        }
        .cat-item:hover .cat-circle {
          background: linear-gradient(145deg, #6C3AF5 0%, #9B6FF5 100%) !important;
          box-shadow: 0 8px 24px rgba(108,58,245,0.20) !important;
          border-color: transparent !important;
        }
        .cat-item:hover .cat-emoji {
          filter: brightness(0) invert(1) !important;
          transform: scale(1.08) !important;
        }
        .cat-item:hover .cat-img {
          filter: brightness(0) invert(1) !important;
          transform: scale(1.08) !important;
        }
        .cat-emoji {
          transition: filter 0.22s ease, transform 0.22s ease !important;
        }
        .cat-img {
          transition: filter 0.22s ease, transform 0.22s ease !important;
        }
        .cat-label {
          transition: color 0.22s ease !important;
        }
        .cat-item:hover .cat-label {
          color: #6C3AF5 !important;
        }

        .arr-btn {
          transition: all 0.18s ease !important;
        }
        .arr-btn:not(:disabled):hover {
          background: #6C3AF5 !important;
          border-color: #6C3AF5 !important;
          box-shadow: 0 4px 14px rgba(108,58,245,0.25) !important;
        }
        .arr-btn:not(:disabled):hover .arr-icon {
          stroke: white !important;
        }

        .cat-scroll::-webkit-scrollbar { display: none; }
        .cat-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="page-container">

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '22px',
          animation: 'catFadeUp 0.4s ease both',
        }}>
          <div>
            <h2 style={{
              fontSize: '20px', fontWeight: '800', color: '#0f172a',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '-0.02em', marginBottom: '2px',
            }}>
              Browse Categories
            </h2>
            <p style={{
              fontSize: '13px', color: '#94A3B8',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              What are you looking for?
            </p>
          </div>

          {showArrows && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {['left', 'right'].map(dir => {
                const active = dir === 'left' ? canLeft : canRight
                return (
                  <button
                    key={dir}
                    onClick={() => scroll(dir)}
                    disabled={!active}
                    className="arr-btn"
                    style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      border: '1.5px solid #E2E8F0', background: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: active ? 'pointer' : 'default',
                      opacity: active ? 1 : 0.28, flexShrink: 0,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline
                        className="arr-icon"
                        stroke="#64748B"
                        points={dir === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}
                      />
                    </svg>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Scrollable row — max 6 visible */}
        <div
          ref={scrollRef}
          className="cat-scroll"
          style={{
            display: 'flex',
            gap: `${GAP}px`,
            overflowX: 'auto',
            paddingBottom: '10px',
            paddingTop: '4px',
            // Clip to exactly 6 items. 6 * 96 + 5 * 18 = 576 + 90 = 666px
            // But let container be fluid — items just overflow and scroll
          }}
        >
          {categories.map((cat, i) => (
            <Link
              key={cat.id || cat.slug || i}
              href={`/category/${cat.slug || cat.id}`}
              style={{ textDecoration: 'none', flexShrink: 0 }}
            >
              <div
                className="cat-item"
                style={{
                  width: `${CARD_W}px`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '10px',
                  cursor: 'pointer',
                  animation: `catFadeUp 0.35s ease ${Math.min(i, 5) * 0.055}s both`,
                }}
              >
                {/* Circle */}
                <div
                  className="cat-circle"
                  style={{
                    width: '76px', height: '76px',
                    borderRadius: '50%',
                    background: 'linear-gradient(145deg, #F3EEFF 0%, #FAF7FF 100%)',
                    border: '1.5px solid #E9E2FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {cat.iconUrl ? (
                    <img
                      src={cat.iconUrl}
                      alt={cat.name}
                      className="cat-img"
                      style={{
                        width: `${Math.min(cat.iconSize || 38, 46)}px`,
                        height: `${Math.min(cat.iconSize || 38, 46)}px`,
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <span
                      className="cat-emoji"
                      style={{ fontSize: '32px', lineHeight: 1, userSelect: 'none' }}
                    >
                      {cat.icon || '📦'}
                    </span>
                  )}
                </div>

                {/* Label */}
                <p
                  className="cat-label"
                  style={{
                    fontSize: '12px', fontWeight: '700',
                    color: '#475569',
                    fontFamily: "'DM Sans', sans-serif",
                    textAlign: 'center', lineHeight: '1.3',
                    maxWidth: `${CARD_W}px`,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}
                >
                  {cat.name}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Scroll dots */}
        {showArrows && (
          <div style={{
            display: 'flex', justifyContent: 'center',
            gap: '5px', marginTop: '14px',
          }}>
            {Array.from({ length: Math.ceil(categories.length / 6) }).map((_, i) => (
              <span key={i} style={{
                display: 'inline-block',
                width: i === 0 ? '18px' : '6px', height: '6px',
                borderRadius: '3px',
                background: i === 0 ? '#6C3AF5' : '#DDD6FE',
                transition: 'all 0.2s',
              }} />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}