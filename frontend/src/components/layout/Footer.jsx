'use client'

import Link from 'next/link'

const FOOTER_LINKS = {
  Categories: [
    { label: 'Mobiles', href: '/category/mobiles' },
    { label: 'Cars', href: '/category/cars' },
    { label: 'Motorcycles', href: '/category/motorcycles' },
    { label: 'Electronics', href: '/category/electronics' },
    { label: 'Furniture & Home', href: '/category/furniture-home' },
    { label: 'Fashion & Beauty', href: '/category/fashion-beauty' },
    { label: 'Others', href: '/category/others' },
  ],
  'Quick Links': [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Help & Support', href: '/help' },
    { label: 'Post an Ad', href: '/post-ad' },
  ],
  Support: null,
}

export default function Footer() {
  return (
    <footer style={{
      background: '#111827',
      color: 'white',
      marginTop: '64px',
    }}>
      <div className="page-container" style={{ padding: '48px 24px 32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '40px',
          marginBottom: '40px',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{
                width: '30px',
                height: '30px',
                background: 'var(--brand-primary)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '800',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
              }}>V</div>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: '800',
                fontSize: '16px',
                color: 'white',
                letterSpacing: '-0.02em',
              }}>VEXO</span>
            </div>
            <p style={{
              fontSize: '13px',
              color: '#9CA3AF',
              fontFamily: 'Inter, sans-serif',
              lineHeight: '1.7',
              marginBottom: '16px',
            }}>
              Verified Exchange Online — Attock's trusted local marketplace.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['facebook.com', 'instagram.com', 'twitter.com', 'wa.me'].map((social, i) => {
                const labels = ['f', 'in', 'x', 'w']
                return (
                  <a key={social} href={`https://${social}`} target="_blank" rel="noreferrer" style={{
                    width: '32px',
                    height: '32px',
                    background: '#1F2937',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9CA3AF',
                    textDecoration: 'none',
                    fontSize: '12px',
                    fontWeight: '600',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-primary)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#1F2937'}
                  >{labels[i]}</a>
                )
              })}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '14px',
            }}>Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {FOOTER_LINKS.Categories.map(link => (
                <Link key={link.label} href={link.href} style={{
                  fontSize: '13px',
                  color: '#9CA3AF',
                  textDecoration: 'none',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
                >{link.label}</Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '14px',
            }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {FOOTER_LINKS['Quick Links'].map(link => (
                <Link key={link.label} href={link.href} style={{
                  fontSize: '13px',
                  color: '#9CA3AF',
                  textDecoration: 'none',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
                >{link.label}</Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '14px',
            }}>Support</h4>
            <p style={{
              fontSize: '13px',
              color: '#9CA3AF',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '12px',
              lineHeight: '1.6',
            }}>
              Any issue? Reach us on WhatsApp.
            </p>
            <a href="https://wa.me/923000000000" target="_blank" rel="noreferrer" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#25D366',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
            }}>
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid #1F2937',
          paddingTop: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <p style={{
            fontSize: '12px',
            color: '#6B7280',
            fontFamily: 'Inter, sans-serif',
          }}>
            © 2025 VEXO — Verified Exchange Online. All rights reserved.
          </p>
          <p style={{
            fontSize: '12px',
            color: '#6B7280',
            fontFamily: 'Inter, sans-serif',
          }}>
            Serving Attock, Punjab, Pakistan
          </p>
        </div>
      </div>
    </footer>
  )
}