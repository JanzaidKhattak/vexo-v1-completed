'use client'

import { useRef, useState, useEffect } from 'react'
import AdCard from '../ads/AdCard'

export default function RecentAds({ ads = [], loading = false }) {
  const scrollRef = useRef(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(true)
  const [cardW,    setCardW]    = useState(260)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 480)      setCardW(160)
      else if (w < 768) setCardW(190)
      else              setCardW(260)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const CARD_W = cardW + 12

  const updateArrows = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 2)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }

  const scrollLeft  = () => scrollRef.current?.scrollBy({ left: -CARD_W, behavior: 'smooth' })
  const scrollRight = () => scrollRef.current?.scrollBy({ left:  CARD_W, behavior: 'smooth' })

  if (loading) return (
    <div style={{ display: 'flex', gap: '12px', overflow: 'hidden' }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{
          minWidth: `${cardW}px`, height: '300px', borderRadius: '14px', flexShrink: 0,
          background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
          backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
        }} />
      ))}
    </div>
  )

  if (!ads.length) return (
    <div style={{ textAlign: 'center', padding: '48px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>
      No ads in this category yet
    </div>
  )

  return (
    <div style={{ position: 'relative' }}>
      <style>{`.rc-scroll::-webkit-scrollbar{display:none}`}</style>

      {canLeft && (
        <button onClick={scrollLeft} style={arrowStyle('left')}
          onMouseEnter={e => arrowHover(e, true)} onMouseLeave={e => arrowHover(e, false)}>‹</button>
      )}

      <div ref={scrollRef} className="rc-scroll" onScroll={updateArrows}
        style={{
          display: 'flex', gap: '12px',
          overflowX: 'auto', scrollBehavior: 'smooth',
          scrollbarWidth: 'none', padding: '8px 4px',
        }}
      >
        {ads.map(ad => (
          <div key={ad._id} style={{ minWidth: `${cardW}px`, maxWidth: `${cardW}px`, flexShrink: 0 }}>
            <AdCard ad={ad} />
          </div>
        ))}
      </div>

      {canRight && ads.length > 3 && (
        <button onClick={scrollRight} style={arrowStyle('right')}
          onMouseEnter={e => arrowHover(e, true)} onMouseLeave={e => arrowHover(e, false)}>›</button>
      )}
    </div>
  )
}

const arrowStyle = (dir) => ({
  position: 'absolute',
  [dir === 'left' ? 'left' : 'right']: '-16px',
  top: '50%', transform: 'translateY(-50%)', zIndex: 10,
  width: '36px', height: '36px', borderRadius: '50%',
  background: 'white', border: '1.5px solid #E2E8F0',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  fontSize: '20px', fontWeight: '300', color: '#64748B',
  lineHeight: 1, transition: 'all 0.18s ease',
})

const arrowHover = (e, entering) => {
  e.currentTarget.style.background  = entering ? 'var(--brand-primary)' : 'white'
  e.currentTarget.style.color       = entering ? 'white' : '#64748B'
  e.currentTarget.style.borderColor = entering ? 'var(--brand-primary)' : '#E2E8F0'
}