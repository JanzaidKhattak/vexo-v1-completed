'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES } from '../../constants/categories'

export default function HeroBanner() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <section style={{
      background: '#111827',
      padding: '72px 0 64px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: '-80px',
        right: '-80px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(230,57,70,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="page-container" style={{ position: 'relative', textAlign: 'center' }}>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          background: 'rgba(230,57,70,0.12)',
          border: '1px solid rgba(230,57,70,0.25)',
          borderRadius: '20px',
          marginBottom: '24px',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-primary)' }} />
          <span style={{
            fontSize: '12px',
            fontWeight: '500',
            color: 'rgba(255,255,255,0.8)',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.02em',
          }}>Serving Attock, Punjab</span>
        </div>

        <h1 style={{
          fontSize: '52px',
          fontWeight: '800',
          color: 'white',
          marginBottom: '8px',
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '-0.03em',
          lineHeight: '1.1',
        }}>
          Buy &amp; Sell Anything
        </h1>
        <h1 style={{
          fontSize: '52px',
          fontWeight: '800',
          color: 'var(--brand-primary)',
          marginBottom: '20px',
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '-0.03em',
          lineHeight: '1.1',
        }}>
          in Attock
        </h1>

        <p style={{
          fontSize: '15px',
          color: 'rgba(255,255,255,0.55)',
          fontFamily: 'Inter, sans-serif',
          marginBottom: '36px',
          fontWeight: '400',
        }}>
          Attock's trusted local marketplace. Post your ad for free.
        </p>

        <form onSubmit={handleSearch} style={{
          maxWidth: '520px',
          margin: '0 auto 36px',
          display: 'flex',
          background: 'white',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Search iPhone, Corolla, AC...'
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '14px 18px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              color: 'var(--text-primary)',
            }}
          />
          <button type="submit" style={{
            padding: '14px 24px',
            background: 'var(--brand-primary)',
            border: 'none',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
          }}>Search</button>
        </form>

        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {CATEGORIES.map(cat => (
            <a
              key={cat.id}
              href={`/category/${cat.id}`}
              style={{
                padding: '7px 16px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '20px',
                color: 'rgba(255,255,255,0.75)',
                fontSize: '13px',
                fontWeight: '500',
                fontFamily: 'Inter, sans-serif',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(230,57,70,0.2)'
                e.currentTarget.style.borderColor = 'rgba(230,57,70,0.4)'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
              }}
            >
              {cat.name}
            </a>
          ))}
        </div>

        <div style={{
          display: 'flex',
          gap: '40px',
          justifyContent: 'center',
          marginTop: '48px',
          flexWrap: 'wrap',
        }}>
          {[
            { value: '500+', label: 'Active Ads' },
            { value: '1,200+', label: 'Happy Users' },
            { value: '7', label: 'Categories' },
            { value: 'Attock', label: 'Only' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '22px',
                fontWeight: '800',
                color: 'white',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.02em',
              }}>{stat.value}</div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.45)',
                fontFamily: 'Inter, sans-serif',
                marginTop: '2px',
              }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}