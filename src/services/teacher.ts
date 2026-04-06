import apiClient from './api'
import type { ApiResponse } from '@/types'

export interface Teacher {
  id: number
  user_id: number
  specialization: string | null
  phone_number: string | null
  hire_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  user: {
    id: number
    email: string
    full_name: string
    role: string
  }
  batches: Array<{
    id: number
    batch_name: string
    year: number
  }>
}

export interface CreateTeacherPayload {
  user_id: number
  specialization?: string
  phone_number?: string
  hire_date?: string
  is_active?: boolean
}

export interface UpdateTeacherPayload {
  specialization?: string
  phone_number?: string
  hire_date?: string
  is_active?: boolean
}

export interface TeacherListResponse {
  teachers: Teacher[]
  pagination: {
    page: number
    per_page: number
    total: number
    pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export const teacherService = {
  async list(page = 1, perPage = 20): Promise<ApiResponse<TeacherListResponse>> {
    const response = await apiClient.get<ApiResponse<TeacherListResponse>>(
      `/teachers?page=${page}&per_page=${perPage}`
    )
    return response.data
  },

  async getById(id: number): Promise<ApiResponse<{ teacher: Teacher }>> {
    const response = await apiClient.get<ApiResponse<{ teacher: Teacher }>>(`/teachers/${id}`)
    return response.data
  },

  async create(payload: CreateTeacherPayload): Promise<ApiResponse<{ teacher: Teacher }>> {
    const response = await apiClient.post<ApiResponse<{ teacher: Teacher }>>('/teachers', payload)
    return response.data
  },

  async update(
    id: number,
    payload: UpdateTeacherPayload
  ): Promise<ApiResponse<{ teacher: Teacher }>> {
    const response = await apiClient.put<ApiResponse<{ teacher: Teacher }>>(
      `/teachers/${id}`,
      payload
    )
    return response.data
  },

  async delete(id: number): Promise<ApiResponse<{}>> {
    const response = await apiClient.delete<ApiResponse<{}>>(`/teachers/${id}`)
    return response.data
  }
}
