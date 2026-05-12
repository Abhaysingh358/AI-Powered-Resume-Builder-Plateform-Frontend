import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser, selectIsPremium } from '../features/auth/authSlice'

export function ProtectedRoute() {
  const user     = useSelector(selectCurrentUser)
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}

export function PremiumRoute() {
  const user      = useSelector(selectCurrentUser)
  const isPremium = useSelector(selectIsPremium)
  const location  = useLocation()
  if (!user)      return <Navigate to="/login"   state={{ from: location }} replace />
  if (!isPremium) return <Navigate to="/upgrade" state={{ from: location }} replace />
  return <Outlet />
}

export function GuestRoute() {
  const user = useSelector(selectCurrentUser)
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
