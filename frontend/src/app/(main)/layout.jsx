'use client'

import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { AuthProvider, useAuth } from '../../context/AuthContext'
import { LocationProvider } from '../../context/LocationContext'

function MainLayoutInner({ children }) {
  const { user } = useAuth()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar user={user} />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default function MainLayout({ children }) {
  return (
    <AuthProvider>
      <LocationProvider>
        <MainLayoutInner>
          {children}
        </MainLayoutInner>
      </LocationProvider>
    </AuthProvider>
  )
}