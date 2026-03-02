'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { CATEGORIES } from '../../constants/categories'
import NotificationBell from '../notifications/NotificationBell'

export default function Navbar() {
  const router = useRouter()
  const { user } = useAuth()
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid var(--border-default)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="page-container" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        height: '64px',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'var(--brand-primary)', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '800', fontSize: '14px', fontFamily: 'Inter, sans-serif',
          }}>V</div>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontWeight: '800',
            fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '-0.03em',
          }}>VEXO</span>
        </Link>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px', background: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)', borderRadius: '8px',
          cursor: 'pointer', flexShrink: 0,
        }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
            Attock
          </span>
        </div>

        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', maxWidth: '480px' }}>
          <div style={{
            display: 'flex', width: '100%',
            border: '1.5px solid var(--border-default)',
            borderRadius: '8px', overflow: 'hidden',
            background: 'white', transition: 'border-color 0.15s',
          }}>
            <input
              type="text" value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search in Attock..."
              style={{
                flex: 1, border: 'none', outline: 'none',
                padding: '10px 14px', fontSize: '14px',
                fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)',
                background: 'transparent',
              }}
            />
            <button type="submit" style={{
              padding: '0 16px', background: 'var(--brand-primary)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>
        </form>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <Link href="/post-ad" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '9px 18px', background: 'var(--brand-primary)',
            color: 'white', borderRadius: '8px', textDecoration: 'none',
            fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif',
          }}>
            + Post Ad
          </Link>

          <NotificationBell />

          {user ? (
            <Link href="/profile" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'var(--brand-primary)', color: 'white',
              fontWeight: '700', fontSize: '14px',
              fontFamily: 'Inter, sans-serif', textDecoration: 'none',
            }}>
              {user.name?.charAt(0) || 'U'}
            </Link>
          ) : (
            <Link href="/login" style={{
              padding: '9px 18px', border: '1.5px solid var(--border-default)',
              borderRadius: '8px', color: 'var(--text-secondary)',
              textDecoration: 'none', fontSize: '14px',
              fontWeight: '600', fontFamily: 'Inter, sans-serif', background: 'white',
            }}>
              Login
            </Link>
          )}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-light)' }}>
        <div className="page-container">
          <nav style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
            {CATEGORIES.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.id}`}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '12px 16px', fontSize: '13px', fontWeight: '500',
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
                  borderBottom: '2px solid transparent', transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--brand-primary)'
                  e.currentTarget.style.borderBottomColor = 'var(--brand-primary)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.borderBottomColor = 'transparent'
                }}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}