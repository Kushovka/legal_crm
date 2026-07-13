import { apiClient } from './client'
import type { AuthPayload, AuthResponse, User } from '../types/auth'

export const authApi = {
  async register(payload: AuthPayload) {
    const response = await apiClient.post<AuthResponse>('/auth/register', payload)
    return response.data
  },

  async login(payload: AuthPayload) {
    const response = await apiClient.post<AuthResponse>('/auth/login', payload)
    return response.data
  },

  async me() {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },
}
