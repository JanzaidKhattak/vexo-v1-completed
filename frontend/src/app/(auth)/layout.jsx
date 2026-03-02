import { AuthProvider } from '../../context/AuthContext'
import { LocationProvider } from '../../context/LocationContext'

export default function AuthLayout({ children }) {
  return (
    <AuthProvider>
      <LocationProvider>
        {children}
      </LocationProvider>
    </AuthProvider>
  )
}