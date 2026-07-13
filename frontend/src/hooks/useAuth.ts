import { useEffect, useState } from 'react'
import { authApi } from '../api/auth'
import type { AuthPayload, User } from '../types/auth'

const TOKEN_KEY = 'law_crm_token'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(() => Boolean(window.localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY)
    if (!token) {
      return
    }

    authApi
      .me()
      .then(setUser)
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY)
        setUser(null)
      })
      .finally(() => setIsAuthLoading(false))
  }, [])

  const applyAuth = (token: string, nextUser: User) => {
    window.localStorage.setItem(TOKEN_KEY, token)
    setUser(nextUser)
  }

  const login = async (payload: AuthPayload) => {
    const response = await authApi.login(payload)
    applyAuth(response.access_token, response.user)
  }

  const register = async (payload: AuthPayload) => {
    const response = await authApi.register(payload)
    applyAuth(response.access_token, response.user)
  }

  const logout = () => {
    window.localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  return {
    user,
    isAuthLoading,
    login,
    register,
    logout,
  }
}
