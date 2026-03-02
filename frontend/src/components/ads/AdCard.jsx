'use client'

import { useRouter } from 'next/navigation'
import { formatPrice } from '../../utils/formatPrice'
import { timeAgo } from '../../utils/formatDate'

export default function AdCard({ ad }) {
  if (!ad) return null
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/ads/${ad._id || ad.id}`)}
      style={{
        background: 'white',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.15s ease',
        cursor: 'pointer',
        height: '100%',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = 'var(--border-strong)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--border-default)'
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', paddingTop: '68%', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
        {ad.images?.[0] || ad.image ? (
          <img
            src={ad.images?.[0] || ad.image}
            alt={ad.title}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', transition: 'transform 0.3s ease',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', fontSize: '32px',
          }}>📷</div>
        )}
        {ad.condition && (
          <span style={{
            position: 'absolute', top: '10px', right: '10px',
            padding: '3px 8px',
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            color: 'white', fontSize: '11px', fontWeight: '500',
            fontFamily: 'Inter, sans-serif', borderRadius: '5px',
          }}>{ad.condition}</span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '14px' }}>
        <div style={{
          fontSize: '16px', fontWeight: '700',
          color: 'var(--brand-primary)', fontFamily: 'Inter, sans-serif',
          marginBottom: '5px', letterSpacing: '-0.01em',
        }}>
          {formatPrice(ad.price)}
          {ad.isNegotiable && (
            <span style={{
              fontSize: '11px', fontWeight: '500',
              color: 'var(--text-muted)', marginLeft: '5px',
              fontFamily: 'Inter, sans-serif',
            }}>Negotiable</span>
          )}
        </div>

        <p style={{
          fontSize: '13px', fontWeight: '500',
          color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif',
          marginBottom: '10px', lineHeight: '1.4',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{ad.title}</p>

        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px', color: 'var(--text-muted)',
          fontFamily: 'Inter, sans-serif', marginBottom: '12px',
        }}>
          <span>{ad.area}</span>
          <span>{timeAgo(ad.createdAt)}</span>
        </div>

        <button
          onClick={e => {
            e.stopPropagation()
            window.location.href = `tel:${ad.seller?.phone || ad.sellerPhone}`
          }}
          style={{
            display: 'block', width: '100%',
            textAlign: 'center', padding: '8px',
            border: '1.5px solid var(--border-default)',
            borderRadius: '8px', color: 'var(--brand-primary)',
            fontSize: '12px', fontWeight: '600',
            fontFamily: 'Inter, sans-serif',
            background: 'transparent', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--brand-primary)'
            e.currentTarget.style.color = 'white'
            e.currentTarget.style.borderColor = 'var(--brand-primary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--brand-primary)'
            e.currentTarget.style.borderColor = 'var(--border-default)'
          }}
        >
          Call Seller
        </button>
      </div>
    </div>
  )
}