import { useAuthContext } from '@/context/AuthContext'
// import { login, logout } from '@/services/client/auth'

// Thin hook over AuthContext — add service calls here when auth is implemented.
export const useAuth = () => {
  const { user, login, logout } = useAuthContext()

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  }
}
