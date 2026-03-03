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
  const [mobileSearch, setMobileSearch] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setMobileSearch(false)
    }
  }

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid var(--border-default)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
    }}>
      {/* Main Row */}
      <div className="page-container" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        height: '64px',
      }}>

        {/* Logo */}
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

        {/* Attock badge — desktop only */}
        <div className="hide-mobile" style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px', background: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)', borderRadius: '8px',
          cursor: 'pointer', flexShrink: 0,
        }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
            Attock
          </span>
        </div>

        {/* Search — desktop only */}
        <form onSubmit={handleSearch} className="hide-mobile" style={{ flex: 1, display: 'flex', maxWidth: '480px' }}>
          <div style={{
            display: 'flex', width: '100%',
            border: '1.5px solid var(--border-default)',
            borderRadius: '8px', overflow: 'hidden',
            background: 'white',
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

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

          {/* Mobile search icon */}
          <button
            className="show-mobile"
            onClick={() => setMobileSearch(!mobileSearch)}
            style={{
              display: 'none', background: 'none', border: 'none',
              cursor: 'pointer', padding: '8px',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>

          {/* Post Ad */}
          <Link href="/post-ad" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '9px 18px', background: 'var(--brand-primary)',
            color: 'white', borderRadius: '8px', textDecoration: 'none',
            fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap',
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
              flexShrink: 0,
            }}>
              {user.name?.charAt(0) || 'U'}
            </Link>
          ) : (
            <Link href="/login" className="hide-mobile" style={{
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

      {/* Mobile Search Bar */}
      {mobileSearch && (
        <div className="show-mobile" style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
        }}>
          <form onSubmit={handleSearch} style={{ width: '100%', display: 'flex' }}>
            <div style={{
              display: 'flex', width: '100%',
              border: '1.5px solid var(--border-default)',
              borderRadius: '8px', overflow: 'hidden',
            }}>
              <input
                autoFocus
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
        </div>
      )}

      {/* Categories */}
      <div style={{ borderTop: '1px solid var(--border-light)' }}>
        <div className="page-container">
          <nav style={{ display: 'flex', gap: '0', overflowX: 'auto', scrollbarWidth: 'none' }}>
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