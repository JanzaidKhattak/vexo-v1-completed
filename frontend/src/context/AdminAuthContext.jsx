'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/axios'

const AdminAuthContext = createContext(null)

const ADMIN_ROLES = ['admin', 'super-admin']

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
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
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const user = res.data.user
      if (!ADMIN_ROLES.includes(user.role)) {
        adminLogout()
        return
      }
      setAdmin(user)
      localStorage.setItem('vexo_admin', JSON.stringify(user))
    } catch {
      adminLogout()
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