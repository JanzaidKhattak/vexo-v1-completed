'use client'

import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import { CATEGORIES } from '../../constants/categories'

export default function CategoryGrid() {
  const { settings } = useSiteSettings()
  const scrollRef    = useRef(null)
  const containerRef = useRef(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(false)
  const [cardW,    setCardW]    = useState(100)
  const [cols,     setCols]     = useState(6)

  const categories = (() => {
    const cats = settings?.categories?.filter(c => c.isActive)
    return (cats && cats.length > 0) ? cats : CATEGORIES
  })()

  const GAP = 16

  const calcLayout = () => {
    const w = window.innerWidth
    let numCols
    if (w < 480)       numCols = 4
    else if (w < 640)  numCols = 4
    else if (w < 768)  numCols = 5
    else if (w < 1024) numCols = 5
    else               numCols = 6
    setCols(numCols)

    if (!containerRef.current) return
    const containerW = containerRef.current.clientWidth
    const cw = Math.floor((containerW - GAP * (numCols - 1)) / numCols)
    setCardW(Math.max(cw, 60))
  }

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    calcLayout()
    checkScroll()
    const el = scrollRef.current
    if (el) el.addEventListener('scroll', checkScroll, { passive: true })
    const ro = new ResizeObserver(() => { calcLayout(); checkScroll() })
    if (containerRef.current) ro.observe(containerRef.current)
    return () => { el?.removeEventListener('scroll', checkScroll); ro.disconnect() }
  }, [categories])

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    const pageW = (cardW + GAP) * cols
    el.scrollBy({ left: dir === 'right' ? pageW : -pageW, behavior: 'smooth' })
  }

  const showArrows = categories.length > cols

  return (
    <section style={{ padding: '28px 0 16px' }}>
      <style>{`
        @keyframes catFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .arr-btn { transition: all 0.18s ease !important; }
        .arr-btn:not(:disabled):hover {
          background: var(--brand-primary) !important;
          border-color: var(--brand-primary) !important;
          box-shadow: 0 4px 14px rgba(108,58,245,0.22) !important;
        }
        .arr-btn:not(:disabled):hover .arr-icon { stroke: white !important; }
        .cat-item:hover .cat-circle {
          background: linear-gradient(145deg, #E0D7FF 0%, #EDE9FE 100%) !important;
          border-color: #C4B5FD !important;
          transform: translateY(-3px);
        }
        .cat-item:hover .cat-label { color: var(--brand-primary) !important; }
        .cat-circle { transition: all 0.2s ease; }
        .cat-label  { transition: color 0.2s ease; }
        .cat-scroll::-webkit-scrollbar { display: none; }
        .cat-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="page-container" ref={containerRef}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '20px',
          animation: 'catFadeUp 0.4s ease both',
        }}>
          <div>
            <h2 style={{
              fontSize: '20px', fontWeight: '800', color: '#0f172a',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '-0.02em', marginBottom: '2px',
            }}>Browse Categories</h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>
              What are you looking for?
            </p>
          </div>

          {showArrows && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {['left', 'right'].map(dir => {
                const active = dir === 'left' ? canLeft : canRight
                return (
                  <button key={dir} onClick={() => scroll(dir)} disabled={!active} className="arr-btn" style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    border: '1.5px solid #E2E8F0', background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: active ? 'pointer' : 'default',
                    opacity: active ? 1 : 0.28, flexShrink: 0,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline className="arr-icon" stroke="#64748B" points={dir === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
                    </svg>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Scroll row */}
        <div ref={scrollRef} className="cat-scroll" style={{
          display: 'flex', gap: `${GAP}px`,
          overflowX: showArrows ? 'auto' : 'visible',
          paddingBottom: '8px', paddingTop: '4px',
        }}>
          {categories.map((cat, i) => (
            <Link key={cat.id || cat.slug || i} href={`/category/${cat.slug || cat.id}`}
              style={{ textDecoration: 'none', flexShrink: 0 }} className="cat-item">
              <div style={{
                width: `${cardW}px`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '10px',
                animation: `catFadeUp 0.38s ease ${Math.min(i, cols - 1) * 0.06}s both`,
              }}>
                <div className="cat-circle" style={{
                  width: `${cardW}px`, height: `${cardW}px`,
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, #F0EBFF 0%, #F8F5FF 100%)',
                  border: '1.5px solid #E9E2FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  {cat.iconUrl ? (
                    <img src={cat.iconUrl} alt={cat.name} style={{
                      width: `${Math.round(cardW * 0.52)}px`,
                      height: `${Math.round(cardW * 0.52)}px`,
                      objectFit: 'contain',
                    }} />
                  ) : (
                    <span style={{ fontSize: `${Math.round(cardW * 0.38)}px`, lineHeight: 1, userSelect: 'none' }}>
                      {cat.icon || '📦'}
                    </span>
                  )}
                </div>
                <p className="cat-label" style={{
                  fontSize: cardW < 72 ? '11px' : '13px',
                  fontWeight: '600', color: '#374151',
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