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
    const root = document.documentElement

    // Colors
    if (s.primaryColor) root.style.setProperty('--brand-primary', s.primaryColor)
    if (s.secondaryColor) root.style.setProperty('--warning', s.secondaryColor)

    // Font
    if (s.fontFamily) {
      root.style.setProperty('--font-family', s.fontFamily)
      document.body.style.fontFamily = `'${s.fontFamily}', sans-serif`
    }

    // Favicon
    if (s.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']")
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = s.faviconUrl
    }

    // Site title
    if (s.siteName) {
      document.title = `${s.siteName} - Buy & Sell in Attock`
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