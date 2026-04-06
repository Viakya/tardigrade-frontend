import apiClient from './api'
import type { ApiResponse } from '@/types'

export interface User {
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateUserPayload {
  email: string
  full_name: string
  role: string
  password: string
}

export interface UpdateUserPayload {
  full_name?: string
  role?: string
  is_active?: boolean
  password?: string
}

export const userService = {
  async list(): Promise<ApiResponse<{ users: User[] }>> {
    const response = await apiClient.get<ApiResponse<{ users: User[] }>>('/auth/registered-users')
    return response.data
  },

  async create(payload: CreateUserPayload): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.post<ApiResponse<{ user: User }>>('/auth/register', payload)
    return response.data
  },

  async update(id: number, payload: UpdateUserPayload): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.put<ApiResponse<{ user: User }>>(
      `/auth/users/${id}`,
      payload
    )
    return response.data
  },

  async delete(id: number): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.delete<ApiResponse<{ user: User }>>(`/auth/users/${id}`)
    return response.data
  }
}
