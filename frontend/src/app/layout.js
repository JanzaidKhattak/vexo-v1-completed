import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../context/AuthContext'
import { LocationProvider } from '../context/LocationContext'
import { SiteSettingsProvider } from '../context/SiteSettingsContext'
import './globals.css'

export const metadata = {
  title: 'VEXO - Buy & Sell in Attock',
  description: 'Attock local marketplace',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LocationProvider>
            <SiteSettingsProvider>
              {children}
              <Toaster position="top-right" />
            </SiteSettingsProvider>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}