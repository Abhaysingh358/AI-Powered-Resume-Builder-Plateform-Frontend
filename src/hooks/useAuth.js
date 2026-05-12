import { useSelector } from 'react-redux'
import {
  selectCurrentUser,
  selectIsPremium,
  selectIsAdmin,
} from '../features/auth/authSlice'

export function useAuth() {
  const user      = useSelector(selectCurrentUser)
  const isPremium = useSelector(selectIsPremium)
  const isAdmin   = useSelector(selectIsAdmin)

  return {
    user,
    isPremium,
    isAdmin,
    isAuthenticated: !!user,
  }
}
