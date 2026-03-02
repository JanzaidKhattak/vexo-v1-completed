'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'
import { useRouter } from 'next/navigation'

export default function NotificationBell() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user])

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
    setOpen(!open)
    if (!open && unread > 0) markAllRead()
  }

  if (!user) return null

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={handleOpen} style={{
        position: 'relative', background: 'none', border: 'none',
        cursor: 'pointer', padding: '8px', borderRadius: '8px',
        fontSize: '20px',
      }}>
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: 'var(--brand-primary)', color: 'white',
            fontSize: '10px', fontWeight: '700', fontFamily: 'Inter, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
          <div style={{
            position: 'absolute', top: '44px', right: 0,
            width: '320px', background: 'white',
            borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: '1px solid var(--border-default)',
            zIndex: 100, overflow: 'hidden',
          }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Notifications</span>
              {unread > 0 && (
                <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: '12px', fontFamily: 'Inter, sans-serif', cursor: 'pointer', fontWeight: '600' }}>
                  Mark all read
                </button>
              )}
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {loading ? (
                <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>Loading...</p>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</div>
                  <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n._id} style={{
                    padding: '14px 16px',
                    background: n.isRead ? 'white' : '#fff8f8',
                    borderBottom: '1px solid var(--border-light)',
                    cursor: 'pointer',
                  }}>
                    <p style={{ fontWeight: n.isRead ? '400' : '600', fontFamily: 'Inter, sans-serif', fontSize: '13px', marginBottom: '4px' }}>
                      {n.title}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                      {n.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}