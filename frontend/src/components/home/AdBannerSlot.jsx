export default function AdBannerSlot({ type = 'leaderboard' }) {
  const sizes = {
    leaderboard: { width: '100%', height: '80px', label: 'Advertisement — 728×90' },
    rectangle: { width: '300px', height: '250px', label: 'Advertisement — 300×250' },
    halfpage: { width: '300px', height: '600px', label: 'Advertisement — 300×600' },
  }

  const size = sizes[type] || sizes.leaderboard

  return (
    <div style={{
      width: size.width,
      minHeight: size.height,
      border: '1px dashed var(--border-default)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-secondary)',
      margin: '16px 0',
    }}>
      <span style={{
        fontSize: '12px',
        color: 'var(--text-muted)',
        fontFamily: 'Inter, sans-serif',
      }}>{size.label}</span>
    </div>
  )
}