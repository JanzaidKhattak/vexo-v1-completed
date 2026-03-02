'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { ATTOCK_BOUNDS } from '../constants/attockAreas'

const LocationContext = createContext(null)

export function LocationProvider({ children }) {
  const [locationStatus, setLocationStatus] = useState('checking')
  const [userLocation, setUserLocation] = useState(null)
  const [canAct, setCanAct] = useState(false)

  useEffect(() => {
    // Pehle localStorage check karo
    const cached = localStorage.getItem('vexo_location')
    if (cached) {
      const { status, canAct: ca } = JSON.parse(cached)
      setLocationStatus(status)
      setCanAct(ca)
      return
    }
    checkLocation()
  }, [])

  const isInAttockBounds = (lat, lng) => {
    return (
      lat >= ATTOCK_BOUNDS.south &&
      lat <= ATTOCK_BOUNDS.north &&
      lng >= ATTOCK_BOUNDS.west &&
      lng <= ATTOCK_BOUNDS.east
    )
  }

  const saveToCache = (status, ca) => {
    localStorage.setItem('vexo_location', JSON.stringify({ status, canAct: ca }))
  }

  const checkLocation = () => {
    setLocationStatus('checking')

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setUserLocation({ lat: latitude, lng: longitude })
          if (isInAttockBounds(latitude, longitude)) {
            setLocationStatus('attock')
            setCanAct(true)
            saveToCache('attock', true)
          } else {
            setLocationStatus('outside')
            setCanAct(false)
            saveToCache('outside', false)
          }
        },
        () => {
          checkByIP()
        }
      )
    } else {
      checkByIP()
    }
  }

  const checkByIP = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/')
      const data = await res.json()
      if (
        data.city?.toLowerCase().includes('attock') ||
        data.region?.toLowerCase().includes('attock') ||
        (data.latitude && data.longitude &&
          isInAttockBounds(data.latitude, data.longitude))
      ) {
        setLocationStatus('attock')
        setCanAct(true)
        saveToCache('attock', true)
      } else {
        setLocationStatus('outside')
        setCanAct(false)
        saveToCache('outside', false)
      }
    } catch {
      setLocationStatus('attock')
      setCanAct(true)
      saveToCache('attock', true)
    }
  }

  return (
    <LocationContext.Provider value={{
      locationStatus,
      userLocation,
      canAct,
      checkLocation,
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