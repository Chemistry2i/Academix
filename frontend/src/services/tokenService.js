const ACCESS_TOKEN_KEY = 'academix_access_token'
const REFRESH_TOKEN_KEY = 'academix_refresh_token'

class TokenService {
  getStoredUser() {
    try {
      const value = localStorage.getItem('academix_user')
      return value ? JSON.parse(value) : null
    } catch (error) {
      return null
    }
  }

  setStoredUser(user) {
    if (!user) {
      localStorage.removeItem('academix_user')
      return
    }

    localStorage.setItem('academix_user', JSON.stringify(user))
  }

  getStoredUserEmail() {
    return this.getStoredUser()?.email || ''
  }

  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  }

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  setTokens(accessToken, refreshToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
  }

  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  isTokenExpired(token) {
    if (!token) return true
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch (error) {
      return true
    }
  }

  getTokenClaims(token) {
    if (!token) return null
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload
    } catch (error) {
      return null
    }
  }
}

export const tokenService = new TokenService()