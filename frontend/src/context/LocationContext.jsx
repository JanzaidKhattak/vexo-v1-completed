'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { ALL_CITIES, DEFAULT_LOCATION } from '../constants/pakistanLocations'

const LocationContext = createContext(null)

export function LocationProvider({ children }) {
  const [location, setLocation]       = useState(DEFAULT_LOCATION) // { city, province, isDefault }
  const [detecting, setDetecting]     = useState(false)
  const [detected,  setDetected]      = useState(false)

  useEffect(() => {
    // Load saved location from localStorage
    try {
      const saved = localStorage.getItem('vexo_location_v2')
      if (saved) {
        const parsed = JSON.parse(saved)
        setLocation(parsed)
        setDetected(true)
        return
      }
    } catch {}
    // First visit — auto detect
    autoDetect()
  }, [])

  const saveLocation = (loc) => {
    setLocation(loc)
    try { localStorage.setItem('vexo_location_v2', JSON.stringify(loc)) } catch {}
  }

  const autoDetect = () => {
    setDetecting(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => reverseGeocode(pos.coords.latitude, pos.coords.longitude),
        () => detectByIP()
      )
    } else {
      detectByIP()
    }
  }

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      )
      const data = await res.json()
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county
      if (city) {
        // Try to match with our city list
        const matched = ALL_CITIES.find(c =>
          c.city.toLowerCase() === city.toLowerCase() ||
          city.toLowerCase().includes(c.city.toLowerCase())
        )
        if (matched) {
          saveLocation({ city: matched.city, province: matched.province, isDefault: false })
          setDetected(true)
          setDetecting(false)
          return
        }
      }
      // City not in list — just save what we got
      if (city) {
        saveLocation({ city, province: data.address?.state || null, isDefault: false })
        setDetected(true)
      } else {
        saveLocation(DEFAULT_LOCATION)
      }
    } catch {
      detectByIP()
    } finally {
      setDetecting(false)
    }
  }

  const detectByIP = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/')
      const data = await res.json()
      const city = data.city
      if (city) {
        const matched = ALL_CITIES.find(c =>
          c.city.toLowerCase() === city.toLowerCase() ||
          city.toLowerCase().includes(c.city.toLowerCase())
        )
        if (matched) {
          saveLocation({ city: matched.city, province: matched.province, isDefault: false })
          setDetected(true)
          setDetecting(false)
          return
        }
        saveLocation({ city, province: data.region || null, isDefault: false })
        setDetected(true)
      } else {
        saveLocation(DEFAULT_LOCATION)
      }
    } catch {
      saveLocation(DEFAULT_LOCATION)
    } finally {
      setDetecting(false)
    }
  }

  const changeLocation = (city, province) => {
    if (!city || city === 'Pakistan') {
      saveLocation(DEFAULT_LOCATION)
    } else {
      saveLocation({ city, province: province || null, isDefault: false })
    }
  }

  const resetLocation = () => {
    saveLocation(DEFAULT_LOCATION)
    try { localStorage.removeItem('vexo_location_v2') } catch {}
  }

  return (
    <LocationContext.Provider value={{
      location,
      detecting,
      detected,
      autoDetect,
      changeLocation,
      resetLocation,
    }}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useLocation must be used inside LocationProvider')
  return ctx
}