'use client'

import { useRouter } from 'next/navigation'

const TRENDING = [
  'iPhone 13', 'Honda CD 70', 'Toyota Corolla', 'Samsung TV',
  'Suzuki Mehran', 'AC for sale', 'Laptop', 'Sofa set',
  'iPhone 14', 'Honda CG 125', 'Fridge', 'Washing Machine',
]

export default function TrendingSearches() {
  const router = useRouter()

  return (
    <section style={{ padding: '8px 0 32px' }}>
      <div className="page-container">
        <h2 style={{
          fontSize: '20px', fontWeight: '800', color: '#0f172a',
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '-0.02em', marginBottom: '4px',
        }}>Trending Searches</h2>
        <p style={{
          fontSize: '13px', color: '#94A3B8',
          fontFamily: "'DM Sans', sans-serif", marginBottom: '14px',
        }}>What people are looking for in Attock</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {TRENDING.map(term => (
            <button key={term} onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
              style={{
                padding: '7px 14px', background: 'white',
                border: '1px solid var(--border-default)',
                borderRadius: '20px', fontSize: '13px', fontWeight: '500',
                color: 'var(--text-secondary)', fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--brand-primary)'
                e.currentTarget.style.color = 'var(--brand-primary)'
                e.currentTarget.style.background = 'var(--brand-light)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-default)'
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.background = 'white'
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              {term}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}