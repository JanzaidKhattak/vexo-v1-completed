import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../context/AuthContext'
import { LocationProvider } from '../context/LocationContext'
import { SiteSettingsProvider } from '../context/SiteSettingsContext'
import './globals.css'

export const metadata = {
  title: 'VEXO - Buy & Sell in Pakistan',
  description: 'Pakistan\'s growing local marketplace',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Orbitron:wght@400;500;600;700;800;900&family=Afacad:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <LocationProvider>
            <SiteSettingsProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#1F2833',
                    color: '#C5C6C7',
                    border: '1px solid rgba(102,252,241,0.2)',
                    fontFamily: "'Afacad', sans-serif",
                    fontSize: '14px',
                  },
                  success: {
                    iconTheme: { primary: '#66FCF1', secondary: '#0B0C10' },
                  },
                  error: {
                    iconTheme: { primary: '#ff4757', secondary: '#0B0C10' },
                  },
                }}
              />
            </SiteSettingsProvider>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}