import AdCard from './AdCard'

export default function AdGrid({ ads = [], cols = 4, loading = false }) {
  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '16px',
      }}>
        {Array.from({ length: cols * 2 }).map((_, i) => (
          <div key={i} style={{
            background: 'white',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            overflow: 'hidden',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            <div style={{ paddingTop: '68%', background: 'var(--bg-tertiary)' }} />
            <div style={{ padding: '14px' }}>
              <div style={{ height: '14px', background: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '8px' }} />
              <div style={{ height: '12px', background: 'var(--bg-tertiary)', borderRadius: '4px', width: '70%' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!ads.length) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '64px 24px',
        color: 'var(--text-muted)',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
        <p style={{
          fontSize: '15px',
          fontWeight: '500',
          fontFamily: 'Inter, sans-serif',
          color: 'var(--text-secondary)',
          marginBottom: '4px',
        }}>No ads found</p>
        <p style={{
          fontSize: '13px',
          fontFamily: 'Inter, sans-serif',
          color: 'var(--text-muted)',
        }}>Try a different search or category</p>
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fill, minmax(${cols <= 2 ? '280px' : '220px'}, 1fr))`,
      gap: '16px',
    }}>
      {ads.map(ad => (
        <AdCard key={ad._id || ad.id} ad={ad} />
      ))}
    </div>
  )
}