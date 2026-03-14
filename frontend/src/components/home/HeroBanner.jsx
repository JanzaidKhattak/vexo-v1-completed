'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import { CATEGORIES } from '../../constants/categories'

export default function HeroBanner() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const { settings } = useSiteSettings()

  const heading    = settings?.heroHeading    || 'Buy & Sell Anything in Attock'
  const subheading = settings?.heroSubheading || "Attock's trusted local marketplace. Post your ad for free."
  const buttonText = settings?.heroButtonText || 'Search'
  const bannerImage = settings?.heroBannerImage || ''
  const categories = settings?.categories?.filter(c => c.isActive) || CATEGORIES

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <section className="hero-section" style={{
      background: bannerImage
        ? `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('${bannerImage}') center/cover no-repeat`
        : '#111827',
      padding: '72px 0 64px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        .hero-section { padding: 72px 0 64px; }
        .hero-h1 { font-size: 52px; }
        .hero-sub { font-size: 15px; }
        .hero-form { max-width: 520px; border-radius: 10px; }
        .hero-search-input { padding: 14px 18px; font-size: 14px; }
        .hero-search-btn { padding: 14px 24px; font-size: 14px; }
        .hero-cats { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
        .hero-stats { gap: 40px; }
        .hero-stat-val { font-size: 22px; }

        @media (max-width: 768px) {
          .hero-section { padding: 40px 0 36px !important; }
          .hero-h1 { font-size: 24px !important; letter-spacing: -0.01em !important; }
          .hero-sub { font-size: 13px !important; margin-bottom: 24px !important; }
          .hero-form { max-width: 100% !important; border-radius: 8px !important; }
          .hero-search-input { padding: 12px 14px !important; font-size: 13px !important; }
          .hero-search-btn { padding: 12px 16px !important; font-size: 13px !important; }
          .hero-badge { margin-bottom: 16px !important; }
          .hero-cats a { padding: 5px 11px !important; font-size: 12px !important; }
          .hero-stats { gap: 20px !important; margin-top: 28px !important; flex-wrap: wrap !important; }
          .hero-stat-val { font-size: 18px !important; }
        }
        @media (max-width: 480px) {
          .hero-section { padding: 28px 0 28px !important; }
          .hero-h1 { font-size: 20px !important; }
          .hero-cats { gap: 6px !important; }
          .hero-cats a { padding: 4px 10px !important; font-size: 11px !important; }
          .hero-stats { gap: 16px !important; }
        }
      `}</style>

      <div style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(108,58,245,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="page-container" style={{ position: 'relative', textAlign: 'center' }}>

        <div className="hero-badge" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px',
          background: 'rgba(108,58,245,0.15)',
          border: '1px solid rgba(108,58,245,0.3)',
          borderRadius: '20px', marginBottom: '24px',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-primary)' }} />
          <span style={{ fontSize: '12px', fontWeight: '500', color: 'rgba(255,255,255,0.85)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.02em' }}>
            Serving Attock, Punjab
          </span>
        </div>

        <h1 className="hero-h1" style={{
          fontWeight: '800', color: 'white',
          marginBottom: '16px', fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '-0.03em', lineHeight: '1.1',
        }}>
          {heading}
        </h1>

        <p className="hero-sub" style={{
          color: 'rgba(255,255,255,0.55)',
          fontFamily: "'DM Sans', sans-serif", marginBottom: '36px', fontWeight: '400',
        }}>
          {subheading}
        </p>

        <form onSubmit={handleSearch} className="hero-form" style={{
          margin: '0 auto 32px',
          display: 'flex', background: 'white',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <input
            type="text" value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Search iPhone, Corolla, AC...'
            className="hero-search-input"
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)',
            }}
          />
          <button type="submit" className="hero-search-btn" style={{
            background: 'var(--brand-primary)',
            border: 'none', color: 'white',
            fontWeight: '700', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>{buttonText}</button>
        </form>

        <div className="hero-cats">
          {categories.slice(0, 8).map(cat => (
            <a key={cat.id} href={`/category/${cat.slug || cat.id}`} style={{
              padding: '7px 16px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px', color: 'rgba(255,255,255,0.75)',
              fontSize: '13px', fontWeight: '500',
              fontFamily: "'DM Sans', sans-serif", textDecoration: 'none', transition: 'all 0.15s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(108,58,245,0.25)'
                e.currentTarget.style.borderColor = 'rgba(108,58,245,0.5)'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
              }}
            >
              {cat.icon} {cat.name}
            </a>
          ))}
        </div>

        <div className="hero-stats" style={{ display: 'flex', justifyContent: 'center', marginTop: '48px' }}>
          {[
            { value: '500+',   label: 'Active Ads' },
            { value: '1,200+', label: 'Happy Users' },
            { value: `${categories.length}`, label: 'Categories' },
            { value: 'Attock', label: 'Only' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div className="hero-stat-val" style={{ fontWeight: '800', color: 'white', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans', sans-serif", marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}