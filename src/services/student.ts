import apiClient from './api'
import type { ApiResponse } from '@/types'

export interface Student {
  id: number
  user_id: number
  batch_id: number | null
  phone_number: string | null
  address: string | null
  date_of_birth: string | null
  enrollment_date: string | null
  discount_percent: number
  is_active: boolean
  created_at: string
  updated_at: string
  user: {
    id: number
    email: string
    full_name: string
    role: string
  }
  batch: {
    id: number
    batch_name: string
    year: number
    batch_cost?: number
  } | null
  parent_user_ids: number[]
  parents: {
    id: number
    email: string
    full_name: string
    role: string
  }[]
}

export interface CreateStudentPayload {
  user_id: number
  batch_id?: number | null
  phone_number?: string
  address?: string
  date_of_birth?: string
  enrollment_date?: string
  discount_percent?: number
  is_active?: boolean
  parent_user_ids?: number[]
}

export interface UpdateStudentPayload {
  batch_id?: number | null
  phone_number?: string
  address?: string
  date_of_birth?: string
  enrollment_date?: string
  discount_percent?: number
  is_active?: boolean
  parent_user_ids?: number[]
}

export interface StudentListResponse {
  students: Student[]
  pagination: {
    page: number
    per_page: number
    total: number
    pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export const studentService = {
  async list(page = 1, perPage = 20): Promise<ApiResponse<StudentListResponse>> {
    const response = await apiClient.get<ApiResponse<StudentListResponse>>(
      `/students?page=${page}&per_page=${perPage}`
    )
    return response.data
  },

  async getMe(): Promise<ApiResponse<{ student: Student }>> {
    const response = await apiClient.get<ApiResponse<{ student: Student }>>('/students/me')
    return response.data
  },

  async getById(id: number): Promise<ApiResponse<{ student: Student }>> {
    const response = await apiClient.get<ApiResponse<{ student: Student }>>(`/students/${id}`)
    return response.data
  },

  async create(payload: CreateStudentPayload): Promise<ApiResponse<{ student: Student }>> {
    const response = await apiClient.post<ApiResponse<{ student: Student }>>('/students', payload)
    return response.data
  },

  async bulkUpload(file: File): Promise<ApiResponse<any>> {
    const form = new FormData()
    form.append('file', file)
    const response = await apiClient.post<ApiResponse<any>>('/students/bulk', form, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async update(
    id: number,
    payload: UpdateStudentPayload
  ): Promise<ApiResponse<{ student: Student }>> {
    const response = await apiClient.put<ApiResponse<{ student: Student }>>(
      `/students/${id}`,
      payload
    )
    return response.data
  },

  async delete(id: number): Promise<ApiResponse<{}>> {
    const response = await apiClient.delete<ApiResponse<{}>>(`/students/${id}`)
    return response.data
  },

  async connectParent(studentId: number, parentUserId: number): Promise<ApiResponse<{ student: Student }>> {
    const response = await apiClient.post<ApiResponse<{ student: Student }>>(
      `/students/${studentId}/parents`,
      { parent_user_id: parentUserId }
    )
    return response.data
  },

  async disconnectParent(studentId: number, parentUserId: number): Promise<ApiResponse<{ student: Student }>> {
    const response = await apiClient.delete<ApiResponse<{ student: Student }>>(
      `/students/${studentId}/parents/${parentUserId}`
    )
    return response.data
  }
}
