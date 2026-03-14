'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user])

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.notifications)
      setUnread(res.data.unreadCount)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setUnread(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const handleOpen = () => {
    const next = !open
    setOpen(next)
    if (next && unread > 0) markAllRead()
  }

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  if (!user) return null

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <style>{`
        @keyframes bellRing {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-15deg); }
          60% { transform: rotate(8deg); }
          80% { transform: rotate(-8deg); }
        }
        @keyframes notifDropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes badgePop {
          0% { transform: scale(0); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .bell-btn:hover .bell-icon {
          animation: bellRing 0.5s ease;
        }
        .bell-btn:hover {
          background: #F8FAFC !important;
        }
        .notif-item:hover {
          background: #F8FAFC !important;
        }
      `}</style>

      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="bell-btn"
        style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer', padding: '8px', borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
          width: '38px', height: '38px',
        }}
      >
        {/* Bell SVG */}
        <svg
          className="bell-icon"
          width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="#374151" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ display: 'block' }}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Badge */}
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '4px', right: '4px',
            minWidth: '16px', height: '16px', borderRadius: '8px',
            background: '#EF4444', color: 'white',
            fontSize: '9px', fontWeight: '800',
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px', border: '2px solid white',
            animation: 'badgePop 0.3s ease',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '48px', right: 0, maxWidth: 'calc(100vw - 16px)',
          width: 'min(340px, calc(100vw - 32px))', background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
          border: '1px solid #F1F5F9',
          zIndex: 200, overflow: 'hidden',
          animation: 'notifDropIn 0.2s ease forwards',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 18px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid #F1F5F9',
          }}>
            <div>
              <p style={{
                fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px', color: '#0f172a',
              }}>Notifications</p>
              {unread > 0 && (
                <p style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>
                  {unread} unread
                </p>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: '#EDE9FE', border: 'none',
                  color: '#6C3AF5', fontSize: '12px',
                  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                  fontWeight: '600', padding: '5px 10px', borderRadius: '6px',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <p style={{ color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}>
                  Loading...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: '#F8FAFC', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 12px',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <p style={{ fontWeight: '600', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
                  All caught up
                </p>
                <p style={{ color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", fontSize: '12px' }}>
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  className="notif-item"
                  style={{
                    padding: '14px 18px',
                    background: n.isRead ? 'white' : '#FAFAF9',
                    borderBottom: '1px solid #F8FAFC',
                    cursor: 'pointer', transition: 'background 0.15s',
                    display: 'flex', gap: '12px', alignItems: 'flex-start',
                  }}
                >
                  {/* Dot */}
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: n.isRead ? '#E2E8F0' : '#6C3AF5',
                    flexShrink: 0, marginTop: '5px',
                    transition: 'background 0.3s',
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontWeight: n.isRead ? '500' : '700',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '13px', color: '#0f172a', marginBottom: '3px',
                    }}>
                      {n.title}
                    </p>
                    <p style={{
                      color: '#64748B', fontFamily: "'DM Sans', sans-serif",
                      fontSize: '12px', lineHeight: '1.5',
                    }}>
                      {n.message}
                    </p>
                    <p style={{
                      color: '#94A3B8', fontFamily: "'DM Sans', sans-serif",
                      fontSize: '11px', marginTop: '4px',
                    }}>
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}