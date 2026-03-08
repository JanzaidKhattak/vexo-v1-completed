'use client'

import { useRef, useEffect, useState } from 'react'
import AdCard from '../ads/AdCard'

export default function TrendingAds({ ads = [], loading = false }) {
  const scrollRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const intervalRef = useRef(null)

  const CARD_WIDTH = 260 + 16 // card + gap

  const updateArrows = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -CARD_WIDTH, behavior: 'smooth' })
  }

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: CARD_WIDTH, behavior: 'smooth' })
  }

  // Auto scroll
  useEffect(() => {
    if (isPaused || loading || ads.length === 0) return
    intervalRef.current = setInterval(() => {
      const el = scrollRef.current
      if (!el) return
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: CARD_WIDTH, behavior: 'smooth' })
      }
    }, 3000)
    return () => clearInterval(intervalRef.current)
  }, [isPaused, loading, ads.length])

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: '16px', overflow: 'hidden' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            minWidth: '260px', height: '320px', background: 'white',
            borderRadius: '14px', border: '1px solid var(--border-default)',
            flexShrink: 0,
          }} />
        ))}
      </div>
    )
  }

  if (!ads.length) return (
    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
      No trending ads yet
    </div>
  )

  return (
    <div style={{ position: 'relative' }}>
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          style={{
            position: 'absolute', left: '-16px', top: '50%',
            transform: 'translateY(-50%)', zIndex: 10,
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'white', border: '1.5px solid var(--border-default)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '16px', color: '#374151',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-primary)'; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#374151' }}
        >
          ‹
        </button>
      )}

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onScroll={updateArrows}
        style={{
          display: 'flex', gap: '16px',
          overflowX: 'auto', scrollBehavior: 'smooth',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
          padding: '8px 4px',
        }}
      >
        <style>{`.trending-scroll::-webkit-scrollbar { display: none; }`}</style>
        {ads.slice(0, 8).map(ad => (
          <div key={ad._id} style={{ minWidth: '260px', maxWidth: '260px', flexShrink: 0 }}>
            <AdCard ad={ad} />
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          style={{
            position: 'absolute', right: '-16px', top: '50%',
            transform: 'translateY(-50%)', zIndex: 10,
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'white', border: '1.5px solid var(--border-default)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '16px', color: '#374151',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-primary)'; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#374151' }}
        >
          ›
        </button>
      )}
    </div>
  )
}