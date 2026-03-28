'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/axios'

const SiteSettingsContext = createContext(null)

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const applySettings = (s) => {
    if (!s) return
    // Favicon only
    if (s.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']")
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = s.faviconUrl
    }
    // Site title only
    if (s.siteName) {
      document.title = `${s.siteName} - Buy & Sell in Pakistan`
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings')
      setSettings(res.data.settings)
      applySettings(res.data.settings)
    } catch (err) {
      console.error('Settings fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshSettings = async () => {
    await fetchSettings()
  }

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export const useSiteSettings = () => {
  const ctx = useContext(SiteSettingsContext)
  if (!ctx) throw new Error('useSiteSettings must be used inside SiteSettingsProvider')
  return ctx
}