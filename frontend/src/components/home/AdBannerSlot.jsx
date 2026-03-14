export default function AdBannerSlot({ type = 'leaderboard' }) {
  const sizes = {
    leaderboard: { width: '100%', height: '90px',  mobileHeight: '60px',  label: 'Advertisement — 728×90'  },
    banner:      { width: '100%', height: '90px',  mobileHeight: '60px',  label: 'Advertisement — 728×90'  },
    rectangle:   { width: '300px', height: '250px', mobileHeight: '200px', label: 'Advertisement — 300×250' },
    halfpage:    { width: '300px', height: '600px', mobileHeight: '300px', label: 'Advertisement — 300×600' },
  }

  const size = sizes[type] || sizes.leaderboard

  return (
    <>
      <style>{`
        .ad-slot-${type} {
          width: ${size.width};
          min-height: ${size.height};
        }
        @media (max-width: 768px) {
          .ad-slot-${type} {
            width: 100% !important;
            min-height: ${size.mobileHeight} !important;
          }
        }
      `}</style>
      <div
        className={`ad-slot-${type}`}
        style={{
          border: '1px dashed var(--border-default)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-secondary)',
          margin: '12px 0',
        }}
      >
        <span style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          fontFamily: "'DM Sans', sans-serif",
        }}>{size.label}</span>
      </div>
    </>
  )
}