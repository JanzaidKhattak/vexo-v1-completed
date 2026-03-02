import Link from 'next/link'
import { CATEGORIES } from '../../constants/categories'

export default function CategoryGrid() {
  return (
    <section style={{ padding: '48px 0 32px' }}>
      <div className="page-container">
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '-0.02em',
          }}>Browse Categories</h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            fontFamily: 'Inter, sans-serif',
            marginTop: '4px',
          }}>What are you looking for?</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '12px',
        }}>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: 'white',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                padding: '20px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--brand-primary)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(230,57,70,0.1)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-default)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{cat.icon}</div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  fontFamily: 'Inter, sans-serif',
                }}>{cat.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}