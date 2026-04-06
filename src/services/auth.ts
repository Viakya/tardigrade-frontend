import apiClient from './api'
import type { ApiResponse, LoginCredentials, LoginResponse, RegisterData, User } from '@/types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials
    )
    return response.data
  },

  async googleLogin(credential: string): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/google', {
      credential
    })
    return response.data
  },

  async register(data: RegisterData): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/auth/register', data)
    return response.data
  },

  async getMe(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me')
    return response.data
  },

  async getRegisteredUsers(): Promise<ApiResponse<{ users: User[] }>> {
    const response = await apiClient.get<ApiResponse<{ users: User[] }>>('/auth/registered-users')
    return response.data
  },

  async getUsersSummary(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>('/auth/users-summary')
    return response.data
  }
}
