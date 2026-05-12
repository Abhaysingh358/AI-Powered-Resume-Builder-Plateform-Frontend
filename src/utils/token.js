import { TOKEN_KEYS } from './constants'

export const getAccessToken  = () => localStorage.getItem(TOKEN_KEYS.access)
export const getRefreshToken = () => localStorage.getItem(TOKEN_KEYS.refresh)

export const setTokens = (access, refresh) => {
  localStorage.setItem(TOKEN_KEYS.access,  access)
  localStorage.setItem(TOKEN_KEYS.refresh, refresh)
}

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEYS.access)
  localStorage.removeItem(TOKEN_KEYS.refresh)
}

export const isTokenExpired = (token) => {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export const parseJwt = (token) => {
  if (!token) return null
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}
