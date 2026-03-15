'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { AdminAuthProvider, useAdminAuth } from '../../context/AdminAuthContext'
import { SiteSettingsProvider } from '../../context/SiteSettingsContext'
// using fetch directly for admin notifications (avoid user token interceptor)

// ── Admin Notification Bell ───────────────────────────────────────────────────
function AdminNotificationBell() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [unread,  setUnread]  = useState(0)
  const [open,    setOpen]    = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('vexo_admin_token')
      if (!token) return
      const res = await fetch(`${BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnread(data.unreadCount || 0)
    } catch (e) { console.error('Notif fetch error:', e) }
  }

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('vexo_admin_token')
      if (!token) return
      await fetch(`${BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      setUnread(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (e) { console.error('Mark read error:', e) }
  }

  const handleOpen = () => {
    const next = !open
    setOpen(next)
    if (next && unread > 0) markAllRead()
  }

  const handleClick = (n) => {
    setOpen(false)
    if (n.link) router.push(n.link)
  }

  const timeAgo = (d) => {
    const m = Math.floor((Date.now() - new Date(d)) / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  const typeIcon = (type) => ({ report: '🚩', ad_status: '📋', general: '🔔', warning: '⚠️' }[type] || '🔔')

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <style>{`
        @keyframes bellRing { 0%,100%{transform:rotate(0)} 20%{transform:rotate(15deg)} 40%{transform:rotate(-15deg)} 60%{transform:rotate(8deg)} 80%{transform:rotate(-8deg)} }
        @keyframes badgePop { 0%{transform:scale(0)} 70%{transform:scale(1.3)} 100%{transform:scale(1)} }
        @keyframes dropIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .adm-bell-btn:hover { background: rgba(255,255,255,0.08) !important; }
        .adm-bell-btn:hover .adm-bell-svg { animation: bellRing 0.5s ease; }
        .adm-notif-item:hover { background: rgba(255,255,255,0.05) !important; }
      `}</style>

      {/* Bell button */}
      <button onClick={handleOpen} className="adm-bell-btn" style={{
        position: 'relative', background: 'transparent', border: 'none',
        cursor: 'pointer', padding: '7px', borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s', width: '34px', height: '34px',
      }}>
        <svg className="adm-bell-svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px',
            minWidth: '16px', height: '16px', borderRadius: '8px',
            background: '#EF4444', color: 'white',
            fontSize: '9px', fontWeight: '800', fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px', border: '2px solid #0f172a',
            animation: 'badgePop 0.3s ease',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '80px', left: '16px',
          width: '300px', background: '#1E293B',
          borderRadius: '16px', zIndex: 999, overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.08)',
          animation: 'dropIn 0.2s ease',
        }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <p style={{ fontWeight: '700', fontSize: '14px', color: 'white', fontFamily: "'DM Sans', sans-serif" }}>Notifications</p>
              {unread > 0 && <p style={{ fontSize: '11px', color: '#64748B', fontFamily: "'DM Sans', sans-serif" }}>{unread} new</p>}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ background: 'rgba(108,58,245,0.2)', border: 'none', color: '#A78BFA', fontSize: '11px', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontWeight: '600', padding: '4px 10px', borderRadius: '6px' }}>
                Mark read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center' }}>
                <p style={{ fontSize: '26px', marginBottom: '8px' }}>🔔</p>
                <p style={{ color: '#64748B', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}>No notifications yet</p>
              </div>
            ) : notifications.map(n => (
              <div key={n._id} className="adm-notif-item" onClick={() => handleClick(n)}
                style={{
                  padding: '12px 16px', cursor: n.link ? 'pointer' : 'default',
                  background: n.isRead ? 'transparent' : 'rgba(108,58,245,0.08)',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  transition: 'background 0.15s',
                }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: n.isRead ? 'rgba(255,255,255,0.05)' : 'rgba(108,58,245,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>
                  {typeIcon(n.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: n.isRead ? '400' : '700', fontSize: '13px', color: n.isRead ? '#94A3B8' : 'white', fontFamily: "'DM Sans', sans-serif", marginBottom: '2px' }}>{n.title}</p>
                  <p style={{ fontSize: '11px', color: '#64748B', fontFamily: "'DM Sans', sans-serif", lineHeight: '1.4', marginBottom: '3px' }}>{n.message}</p>
                  <p style={{ fontSize: '10px', color: '#475569', fontFamily: "'DM Sans', sans-serif" }}>{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6C3AF5', flexShrink: 0, marginTop: '5px' }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Layout Inner ──────────────────────────────────────────────────────────────
function AdminLayoutInner({ children }) {
  const { admin, loading, adminLogout } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isLoginPage = pathname === '/vexo-admin'

  useEffect(() => {
    if (!loading && !admin && !isLoginPage) router.push('/vexo-admin')
  }, [admin, loading, isLoginPage])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #6C3AF5', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (isLoginPage) return <>{children}</>
  if (!admin) return null

  const navLinks = [
    { href: '/vexo-admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/vexo-admin/ads',       label: 'Ads',       icon: '📋' },
    { href: '/vexo-admin/users',     label: 'Users',     icon: '👥' },
    { href: '/vexo-admin/reports',   label: 'Reports',   icon: '🚩' },
    { href: '/vexo-admin/pages',     label: 'Pages',     icon: '📄' },
    { href: '/vexo-admin/settings',  label: 'Settings',  icon: '⚙️' },
    ...(admin?.role === 'super-admin' ? [{ href: '/vexo-admin/admins', label: 'Admins', icon: '👑' }] : []),
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Sidebar */}
      <div style={{ width: '240px', background: '#0f172a', flexShrink: 0, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 }}>

        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6C3AF5, #9B6DFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '16px' }}>V</div>
            <div>
              <p style={{ color: 'white', fontWeight: '700', fontSize: '15px', fontFamily: 'Inter, sans-serif' }}>VEXO</p>
              <p style={{ color: '#64748B', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {navLinks.map(link => {
            const isActive = pathname === link.href || (link.href !== '/vexo-admin/dashboard' && pathname?.startsWith(link.href))
            return (
              <Link key={link.href} href={link.href} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px', marginBottom: '4px',
                textDecoration: 'none',
                background: isActive ? 'rgba(108,58,245,0.2)' : 'transparent',
                color: isActive ? '#A78BFA' : '#94A3B8',
                fontSize: '14px', fontWeight: isActive ? '700' : '500',
                fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8' } }}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Admin info + bell + logout */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Admin name + bell on same row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6C3AF5, #9B6DFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '700', flexShrink: 0, overflow: 'hidden' }}>
              {admin?.avatar ? <img src={admin.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (admin?.firstName?.charAt(0) || 'A')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'white', fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {admin?.firstName} {admin?.lastName}
              </p>
              <p style={{ color: '#64748B', fontSize: '10px', fontFamily: 'Inter, sans-serif' }}>
                {admin?.role === 'super-admin' ? '👑 Super Admin' : '🔧 Admin'}
              </p>
            </div>
            {/* Bell icon here! */}
            <AdminNotificationBell />
          </div>

          <button onClick={() => { adminLogout(); router.push('/vexo-admin') }} style={{
            width: '100%', padding: '8px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px', color: '#F87171', fontSize: '13px',
            fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
          }}>
            Logout
          </button>
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
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </SiteSettingsProvider>
    </AdminAuthProvider>
  )
}