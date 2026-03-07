'use client'

import { Suspense } from 'react'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../../../context/AuthContext'
import toast from 'react-hot-toast'

function GoogleSuccessInner() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const userStr = searchParams.get('user')

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr))
        login(user, token)
        toast.success('Welcome to VEXO!')
        router.push('/')
      } catch (err) {
        console.error(err)
        toast.error('Google login failed')
        router.push('/login')
      }
    } else {
      toast.error('Google login failed')
      router.push('/login')
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'white', borderRadius: '16px',
        padding: '40px', textAlign: 'center',
        boxShadow: '0 32px 100px rgba(0,0,0,0.4)',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '3px solid #6C3AF5',
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600', color: '#111827' }}>
          Signing you in...
        </p>
      </div>
    </div>
  )
}

export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748B' }}>Loading...</p>
      </div>
    }>
      <GoogleSuccessInner />
    </Suspense>
  )
}