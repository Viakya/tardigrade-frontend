import apiClient from './api'
import type { ApiResponse } from '@/types'

export interface Salary {
  id: number
  teacher_id: number
  amount: number
  payment_date: string
  payment_method: string
  reference_no: string | null
  paid_by: number | null
  payer_name: string | null
  remarks: string | null
  created_at: string
  updated_at: string
  teacher?: {
    id: number
    user: {
      id: number
      full_name: string
      email: string
    }
  }
}

export interface CreateSalaryPayload {
  teacher_id: number
  amount: number
  payment_date?: string
  payment_method?: string
  reference_no?: string
  remarks?: string
}

export interface UpdateSalaryPayload {
  amount?: number
  payment_date?: string
  payment_method?: string
  reference_no?: string
  remarks?: string
}

export interface SalaryListResponse {
  salaries: Salary[]
  pagination: {
    page: number
    per_page: number
    total: number
    pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export const salaryService = {
  /**
   * List salary payments with optional teacher filter
   */
  list(page = 1, perPage = 50, teacherId?: number): Promise<ApiResponse<SalaryListResponse>> {
    const params: any = { page, per_page: perPage }
    if (teacherId) {
      params.teacher_id = teacherId
    }
    return apiClient.get('/salaries', { params })
  },

  /**
   * Create a new salary payment
   */
  create(payload: CreateSalaryPayload): Promise<ApiResponse<{ salary: Salary }>> {
    return apiClient.post('/salaries', payload)
  },

  /**
   * Update a salary payment
   */
  update(id: number, payload: UpdateSalaryPayload): Promise<ApiResponse<{ salary: Salary }>> {
    return apiClient.put(`/salaries/${id}`, payload)
  },

  /**
   * Delete a salary payment
   */
  delete(id: number): Promise<ApiResponse<{}>> {
    return apiClient.delete(`/salaries/${id}`)
  },

  /**
   * Get salary summary for a teacher
   */
  summary(teacherId?: number): Promise<ApiResponse<{ teacher_id: number | null; total_records: number; total_paid: number }>> {
    const params: any = {}
    if (teacherId) {
      params.teacher_id = teacherId
    }
    return apiClient.get('/salaries/summary', { params })
  },
}
