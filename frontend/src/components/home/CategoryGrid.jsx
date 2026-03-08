'use client'

import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import { CATEGORIES } from '../../constants/categories'

export default function CategoryGrid() {
  const { settings } = useSiteSettings()
  const scrollRef       = useRef(null)
  const containerRef    = useRef(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(false)
  const [cardW,    setCardW]    = useState(100)

  const categories = (() => {
    const cats = settings?.categories?.filter(c => c.isActive)
    if (cats && cats.length > 0) return cats
    return CATEGORIES
  })()

  const GAP = 24

  // Calculate card width so exactly 6 fit in container
  const calcCardW = () => {
    if (!containerRef.current) return
    const w = containerRef.current.clientWidth
    // 6 cards + 5 gaps fit exactly
    const cw = Math.floor((w - GAP * 5) / 6)
    setCardW(Math.max(cw, 80))
  }

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    calcCardW()
    checkScroll()
    const el = scrollRef.current
    if (el) el.addEventListener('scroll', checkScroll, { passive: true })
    const ro = new ResizeObserver(() => { calcCardW(); checkScroll() })
    if (containerRef.current) ro.observe(containerRef.current)
    return () => { el?.removeEventListener('scroll', checkScroll); ro.disconnect() }
  }, [categories])

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    // scroll by exactly 6 cards (one "page")
    const pageW = (cardW + GAP) * 6
    el.scrollBy({ left: dir === 'right' ? pageW : -pageW, behavior: 'smooth' })
  }

  const showArrows = categories.length > 6

  return (
    <section style={{ padding: '36px 0 24px' }}>
      <style>{`
        @keyframes catFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .arr-btn { transition: all 0.18s ease !important; }
        .arr-btn:not(:disabled):hover {
          background: #6C3AF5 !important;
          border-color: #6C3AF5 !important;
          box-shadow: 0 4px 14px rgba(108,58,245,0.22) !important;
        }
        .arr-btn:not(:disabled):hover .arr-icon { stroke: white !important; }
        .cat-scroll::-webkit-scrollbar { display: none; }
        .cat-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="page-container" ref={containerRef}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '24px',
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
            <p style={{ fontSize: '13px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>
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

        {/* Scroll row — exactly 6 visible, rest hidden until scroll */}
        <div
          ref={scrollRef}
          className="cat-scroll"
          style={{
            display: 'flex',
            gap: `${GAP}px`,
            overflowX: showArrows ? 'auto' : 'visible',
            paddingBottom: '4px',
            paddingTop: '4px',
          }}
        >
          {categories.map((cat, i) => (
            <Link
              key={cat.id || cat.slug || i}
              href={`/category/${cat.slug || cat.id}`}
              style={{ textDecoration: 'none', flexShrink: 0 }}
            >
              <div
                style={{
                  width: `${cardW}px`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '12px',
                  cursor: 'pointer',
                  animation: `catFadeUp 0.38s ease ${Math.min(i, 5) * 0.06}s both`,
                }}
              >
                {/* Circle */}
                <div style={{
                  width: `${cardW}px`,
                  height: `${cardW}px`,
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, #F0EBFF 0%, #F8F5FF 100%)',
                  border: '1.5px solid #E9E2FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  {cat.iconUrl ? (
                    <img
                      src={cat.iconUrl}
                      alt={cat.name}
                      style={{
                        width: `${Math.round(cardW * 0.52)}px`,
                        height: `${Math.round(cardW * 0.52)}px`,
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <span style={{
                      fontSize: `${Math.round(cardW * 0.38)}px`,
                      lineHeight: 1, userSelect: 'none',
                    }}>
                      {cat.icon || '📦'}
                    </span>
                  )}
                </div>

                {/* Label */}
                <p style={{
                  fontSize: '13px', fontWeight: '600',
                  color: '#374151',
                  fontFamily: "'DM Sans', sans-serif",
                  textAlign: 'center', lineHeight: '1.3',
                  maxWidth: `${cardW}px`,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {cat.name}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}