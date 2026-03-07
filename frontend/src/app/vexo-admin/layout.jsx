'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { AdminAuthProvider, useAdminAuth } from '../../context/AdminAuthContext'
import { SiteSettingsProvider } from '../../context/SiteSettingsContext'

function AdminLayoutInner({ children }) {
  const { admin, loading, adminLogout } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isLoginPage = pathname === '/vexo-admin'

  useEffect(() => {
    if (!loading && !admin && !isLoginPage) {
      router.push('/vexo-admin')
    }
  }, [admin, loading, isLoginPage])

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#0f172a',
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        border: '3px solid #6C3AF5', borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  // Login page — no sidebar
  if (isLoginPage) return <>{children}</>

  // Not admin — redirect
  if (!admin) return null

  const navLinks = [
    { href: '/vexo-admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/vexo-admin/ads', label: 'Ads', icon: '📋' },
    { href: '/vexo-admin/users', label: 'Users', icon: '👥' },
    { href: '/vexo-admin/reports', label: 'Reports', icon: '🚩' },
    { href: '/vexo-admin/pages', label: 'Pages', icon: '📄' },
    { href: '/vexo-admin/settings', label: 'Settings', icon: '⚙️' },
    ...(admin?.role === 'super-admin' ? [{ href: '/vexo-admin/admins', label: 'Admins', icon: '👑' }] : []),
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Sidebar */}
      <div style={{
        width: '240px', background: '#0f172a', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh',
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #6C3AF5, #9B6DFF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '800', fontSize: '16px',
            }}>V</div>
            <div>
              <p style={{ color: 'white', fontWeight: '700', fontSize: '15px', fontFamily: 'Inter, sans-serif' }}>VEXO</p>
              <p style={{ color: '#64748B', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '8px', marginBottom: '4px',
              textDecoration: 'none',
              background: pathname === link.href ? 'rgba(108,58,245,0.2)' : 'transparent',
              color: pathname === link.href ? '#A78BFA' : '#94A3B8',
              fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif',
              transition: 'all 0.15s',
            }}>
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6C3AF5, #9B6DFF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '13px', fontWeight: '700',
            }}>
              {admin?.firstName?.charAt(0) || 'A'}
            </div>
            <div>
              <p style={{ color: 'white', fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
                {admin?.firstName} {admin?.lastName}
              </p>
            </div>
          </div>
          <button onClick={() => { adminLogout(); router.push('/vexo-admin') }} style={{
            width: '100%', padding: '8px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px', color: '#F87171', fontSize: '13px',
            fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
          }}>
            Logout
          </button>
          <p style={{ color: '#64748B', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>
  {admin?.role === 'super-admin' ? '👑 Super Admin' : '🔧 Admin'}
</p>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: '240px', flex: 1, minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  )
}

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <SiteSettingsProvider>
        <AdminLayoutInner>
          {children}
        </AdminLayoutInner>
      </SiteSettingsProvider>
    </AdminAuthProvider>
  )
}