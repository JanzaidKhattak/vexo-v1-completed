'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vexo_user')
      if (stored) {
        setUser(JSON.parse(stored))
        // Backend se fresh user data lo
        refreshUser()
      }
    } catch (e) {
      localStorage.removeItem('vexo_user')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('vexo_token')
      if (!token) return
      const res = await api.get('/auth/me')
      const freshUser = res.data.user
      setUser(freshUser)
      localStorage.setItem('vexo_user', JSON.stringify(freshUser))
    } catch (err) {
      // Token expired ya invalid
      logout()
    }
  }

  const login = (userData, token) => {
    setUser(userData)
    localStorage.setItem('vexo_user', JSON.stringify(userData))
    localStorage.setItem('vexo_token', token)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('vexo_user')
    localStorage.removeItem('vexo_token')
  }

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData }
    setUser(newUser)
    localStorage.setItem('vexo_user', JSON.stringify(newUser))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}