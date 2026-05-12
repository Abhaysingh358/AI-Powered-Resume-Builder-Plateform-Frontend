import { createSlice } from '@reduxjs/toolkit'
import { getAccessToken, getRefreshToken, setTokens, clearTokens, parseJwt } from '../../utils/token'

const token   = getAccessToken()
const payload = parseJwt(token)

const initialState = {
  user:         payload ? {
    userId:           payload.sub || payload.nameid,
    email:            payload.email,
    fullName:         payload.name,
    subscriptionPlan: payload.SubscriptionPlan || payload.subscriptionPlan || 'FREE',
    role:             payload.role,
  } : null,
  accessToken:  token,
  refreshToken: getRefreshToken(),
  isLoading:    false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      const { accessToken, refreshToken } = payload
      const decoded = parseJwt(accessToken)
      state.accessToken  = accessToken
      state.refreshToken = refreshToken
      state.user = {
        userId:           decoded?.sub || decoded?.nameid,
        email:            decoded?.email,
        fullName:         decoded?.name,
        subscriptionPlan: decoded?.SubscriptionPlan || decoded?.subscriptionPlan || 'FREE',
        role:             decoded?.role,
      }
      setTokens(accessToken, refreshToken)
    },
    setUser: (state, { payload }) => {
      state.user = { ...state.user, ...payload }
    },
    logout: (state) => {
      state.user         = null
      state.accessToken  = null
      state.refreshToken = null
      clearTokens()
    },
  },
})

export const { setCredentials, setUser, logout } = authSlice.actions
export default authSlice.reducer

// Selectors
export const selectCurrentUser  = (state) => state.auth.user
export const selectAccessToken  = (state) => state.auth.accessToken
export const selectIsPremium    = (state) => state.auth.user?.subscriptionPlan === 'PREMIUM'
export const selectIsAdmin      = (state) => state.auth.user?.role === 'ADMIN'
