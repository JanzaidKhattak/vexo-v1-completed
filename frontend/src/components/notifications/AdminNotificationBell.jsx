'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../../lib/axios'

const gT = () => localStorage.getItem('vexo_admin_token')

export default function AdminNotificationBell() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [unread,  setUnread]  = useState(0)
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications', { headers: { Authorization: `Bearer ${gT()}` } })
      setNotifications(res.data.notifications || [])
      setUnread(res.data.unreadCount || 0)
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all', {}, { headers: { Authorization: `Bearer ${gT()}` } })
      setUnread(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch {}
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
    return `${Math.floor(h/24)}d ago`
  }

  const typeIcon = (type) => {
    const icons = { report: '🚩', ad_status: '📋', general: '🔔', warning: '⚠️' }
    return icons[type] || '🔔'
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <style>{`
        @keyframes bellRing { 0%,100%{transform:rotate(0)} 20%{transform:rotate(15deg)} 40%{transform:rotate(-15deg)} 60%{transform:rotate(8deg)} 80%{transform:rotate(-8deg)} }
        @keyframes badgePop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
        .admin-bell:hover { background: #1F2937 !important; }
        .admin-bell:hover .bell-svg { animation: bellRing 0.5s ease; }
        .notif-item-admin { transition: background 0.15s; cursor: pointer; }
        .notif-item-admin:hover { background: #F1F5F9 !important; }
      `}</style>

      <button onClick={handleOpen} className="admin-bell" style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', transition: 'background 0.15s' }}>
        <svg className="bell-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{ position: 'absolute', top: '3px', right: '3px', minWidth: '16px', height: '16px', borderRadius: '8px', background: '#EF4444', color: 'white', fontSize: '9px', fontWeight: '800', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid #111827', animation: 'badgePop 0.3s ease' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: '46px', right: 0, width: 'min(320px, calc(100vw - 32px))', background: 'white', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', border: '1px solid #F1F5F9', zIndex: 300, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
            <div>
              <p style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a', fontFamily: "'DM Sans', sans-serif" }}>Notifications</p>
              {unread > 0 && <p style={{ fontSize: '11px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>{unread} unread</p>}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ background: '#EDE9FE', border: 'none', color: '#6C3AF5', fontSize: '11px', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontWeight: '600', padding: '4px 10px', borderRadius: '6px' }}>
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', marginBottom: '8px' }}>🔔</p>
                <p style={{ color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: '600' }}>No notifications</p>
              </div>
            ) : notifications.map(n => (
              <div key={n._id} className="notif-item-admin" onClick={() => handleClick(n)}
                style={{ padding: '12px 16px', background: n.isRead ? 'white' : '#FAFAF9', borderBottom: '1px solid #F8FAFC', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: n.isRead ? '#F1F5F9' : '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>
                  {typeIcon(n.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: n.isRead ? '500' : '700', fontSize: '13px', color: '#0f172a', fontFamily: "'DM Sans', sans-serif", marginBottom: '2px' }}>{n.title}</p>
                  <p style={{ fontSize: '12px', color: '#64748B', fontFamily: "'DM Sans', sans-serif", lineHeight: '1.4', marginBottom: '3px' }}>{n.message}</p>
                  <p style={{ fontSize: '10px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#6C3AF5', flexShrink: 0, marginTop: '6px' }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}