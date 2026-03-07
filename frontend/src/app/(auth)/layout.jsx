import { AuthProvider } from '../../context/AuthContext'
import { LocationProvider } from '../../context/LocationContext'
import { SiteSettingsProvider } from '../../context/SiteSettingsContext'

export default function AuthLayout({ children }) {
  return (
    <AuthProvider>
      <LocationProvider>
        <SiteSettingsProvider>
          {children}
        </SiteSettingsProvider>
      </LocationProvider>
    </AuthProvider>
  )
}