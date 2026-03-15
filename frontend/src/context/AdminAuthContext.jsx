'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AdminAuthContext = createContext(null)
const ADMIN_ROLES = ['admin', 'super-admin']
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export function AdminAuthProvider({ children }) {
  const [admin,   setAdmin]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vexo_admin')
      if (stored) {
        setAdmin(JSON.parse(stored))
        refreshAdmin()
      }
    } catch (e) {
      localStorage.removeItem('vexo_admin')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshAdmin = async () => {
    try {
      const token = localStorage.getItem('vexo_admin_token')
      if (!token) return

      // Use fetch directly — bypass axios interceptor which adds vexo_token
      const res = await fetch(`${BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        adminLogout()
        return
      }

      const data = await res.json()
      const user = data.user

      if (!user || !ADMIN_ROLES.includes(user.role)) {
        adminLogout()
        return
      }

      setAdmin(user)
      localStorage.setItem('vexo_admin', JSON.stringify(user))
    } catch {
      // Network error — don't logout, just keep existing admin data
      console.error('Admin refresh failed — keeping existing session')
    }
  }

  const adminLogin = (userData, token) => {
    if (!ADMIN_ROLES.includes(userData.role)) return false
    setAdmin(userData)
    localStorage.setItem('vexo_admin', JSON.stringify(userData))
    localStorage.setItem('vexo_admin_token', token)
    return true
  }

  const adminLogout = () => {
    setAdmin(null)
    localStorage.removeItem('vexo_admin')
    localStorage.removeItem('vexo_admin_token')
  }

  const isSuperAdmin = () => admin?.role === 'super-admin'

  return (
    <AdminAuthContext.Provider value={{ admin, loading, adminLogin, adminLogout, refreshAdmin, isSuperAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  return ctx
}