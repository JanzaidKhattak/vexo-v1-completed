import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../context/AuthContext'
import { LocationProvider } from '../context/LocationContext'
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
            {children}
            <Toaster position="top-right" />
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}