import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials } from '@/types'
import { authService } from '@/services/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const isInitializing = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || null)

  async function login(credentials: LoginCredentials) {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.login(credentials)
      if (response.success && response.data) {
        token.value = response.data.access_token
        user.value = response.data.user
        localStorage.setItem('access_token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loginWithGoogle(credential: string) {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.googleLogin(credential)
      if (response.success && response.data) {
        token.value = response.data.access_token
        user.value = response.data.user
        localStorage.setItem('access_token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Google login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(data: any) {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.register(data)
      if (response.success) {
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUser() {
    if (!token.value) return
    isInitializing.value = true
    try {
      const response = await authService.getMe()
      if (response.success && response.data) {
        user.value = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
      }
    } catch (err) {
      logout()
    } finally {
      isInitializing.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }

  function initializeAuth() {
    const storedToken = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')
    if (!storedToken || !storedUser) return
    try {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
      // Optionally verify token is still valid
      fetchUser()
    } catch {
      logout()
    }
  }

  return {
    token,
    user,
    isLoading,
  isInitializing,
    error,
    isAuthenticated,
    userRole,
    login,
    loginWithGoogle,
    register,
    logout,
    fetchUser,
    initializeAuth
  }
})
