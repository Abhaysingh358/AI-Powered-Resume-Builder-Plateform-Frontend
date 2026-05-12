import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logout } from '../features/auth/authSlice'
import { getAccessToken, getRefreshToken, setTokens } from './token'
import { API_URLS } from './constants'

// Factory: creates an authenticated baseQuery for any microservice base URL
export const createAuthBaseQuery = (baseUrl) => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = getAccessToken()
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  })

  // Wrapper that auto-refreshes token on 401
  return async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions)

    if (result?.error?.status === 401) {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        api.dispatch(logout())
        return result
      }

      // Attempt token refresh
      const refreshResult = await fetch(`${API_URLS.auth}/auth/refresh`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ refreshToken }),
      })

      if (refreshResult.ok) {
        const data = await refreshResult.json()
        const { accessToken, refreshToken: newRefresh } = data.data
        setTokens(accessToken, newRefresh)
        api.dispatch(setCredentials({ accessToken, refreshToken: newRefresh }))

        // Retry original request with new token
        result = await rawBaseQuery(args, api, extraOptions)
      } else {
        api.dispatch(logout())
      }
    }

    return result
  }
}
