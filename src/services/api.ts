import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api/v1'
console.log('[API] Using baseURL:', BASE_URL)

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
    } else if (error.response?.status === 403) {
      // Forbidden - show permission error
      alert('You don\'t have permission to access this resource')
    }
    return Promise.reject(error)
  }
)

export default apiClient
