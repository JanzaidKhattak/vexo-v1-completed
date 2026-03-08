'use client'

import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import { CATEGORIES } from '../../constants/categories'

export default function CategoryGrid() {
  const { settings } = useSiteSettings()
  const scrollRef = useRef(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(true)

  // Build category list from settings (active ones), fallback to CATEGORIES constant
  const categories = (() => {
    const cats = settings?.categories?.filter(c => c.isActive)
    if (cats && cats.length > 0) return cats
    return CATEGORIES
  })()

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) el.addEventListener('scroll', checkScroll, { passive: true })
    return () => el?.removeEventListener('scroll', checkScroll)
  }, [categories])

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    // scroll by ~3 cards
    el.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' })
  }

  return (
    <section style={{ padding: '40px 0 24px' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cat-card {
          transition: all 0.18s ease !important;
        }
        .cat-card:hover {
          transform: translateY(-4px) scale(1.04) !important;
          box-shadow: 0 8px 24px rgba(108,58,245,0.13) !important;
          border-color: #6C3AF5 !important;
        }
        .cat-card:hover .cat-label {
          color: #6C3AF5 !important;
        }
        .arr-btn {
          transition: all 0.15s ease !important;
        }
        .arr-btn:hover {
          background: #6C3AF5 !important;
          border-color: #6C3AF5 !important;
          box-shadow: 0 4px 14px rgba(108,58,245,0.25) !important;
        }
        .arr-btn:hover svg {
          stroke: white !important;
        }
        /* hide scrollbar */
        .cat-scroll::-webkit-scrollbar { display: none; }
        .cat-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="page-container">
        {/* Header row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '20px',
          animation: 'fadeUp 0.4s ease',
        }}>
          <div>
            <h2 style={{
              fontSize: '20px', fontWeight: '800', color: '#0f172a',
              fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em',
              marginBottom: '2px',
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

          {/* Arrow buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => scroll('left')}
              className="arr-btn"
              disabled={!canLeft}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: '1.5px solid #E2E8F0', background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: canLeft ? 'pointer' : 'not-allowed',
                opacity: canLeft ? 1 : 0.35,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="arr-btn"
              disabled={!canRight}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: '1.5px solid #E2E8F0', background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: canRight ? 'pointer' : 'not-allowed',
                opacity: canRight ? 1 : 0.35,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="cat-scroll"
          style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '6px',
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
                className="cat-card"
                style={{
                  width: '100px',
                  background: 'white',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '18px 10px 14px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  animation: `fadeUp 0.35s ease ${i * 0.04}s both`,
                }}
              >
                {/* Icon — image or emoji */}
                <div style={{
                  width: '52px', height: '52px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 10px',
                  overflow: 'hidden',
                }}>
                  {cat.iconUrl ? (
                    <img
                      src={cat.iconUrl}
                      alt={cat.name}
                      style={{
                        width: `${cat.iconSize || 28}px`,
                        height: `${cat.iconSize || 28}px`,
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '24px', lineHeight: 1 }}>{cat.icon || '📦'}</span>
                  )}
                </div>

                {/* Label */}
                <p
                  className="cat-label"
                  style={{
                    fontSize: '12px', fontWeight: '700',
                    color: '#334155',
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: '1.3',
                    transition: 'color 0.15s',
                  }}
                >
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