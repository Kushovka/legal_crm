import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001/api',
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('law_crm_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg).join(', ')
    }
    if (typeof detail === 'string') {
      return detail
    }
    return error.message
  }

  return 'Произошла неизвестная ошибка'
}
