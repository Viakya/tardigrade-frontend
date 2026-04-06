import apiClient from './api'
import type { ApiResponse } from '@/types'

export interface FeePayment {
  id: number
  student_id: number
  amount: number
  payment_date: string
  payment_method: string
  reference_no: string | null
  received_by: number
  remarks: string | null
  created_at: string
  updated_at: string
  student?: {
    id: number
    user: {
      full_name: string
      email: string
    }
  }
  receiver_name?: string
}

export interface CreateFeePaymentPayload {
  student_id: number
  amount: number
  payment_date?: string
  payment_method?: string
  reference_no?: string
  remarks?: string
}

export interface UpdateFeePaymentPayload {
  amount?: number
  payment_date?: string
  payment_method?: string
  reference_no?: string
  remarks?: string
}

export interface FeePaymentListResponse {
  fee_payments: FeePayment[]
  pagination: {
    page: number
    per_page: number
    total: number
    pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export const feeService = {
  /**
   * List all fee payments with optional filters
   */
  list(page = 1, perPage = 50, studentId?: number): Promise<ApiResponse<FeePaymentListResponse>> {
    const params: any = { page, per_page: perPage }
    if (studentId) {
      params.student_id = studentId
    }
    return apiClient.get('/fee-payments', { params })
  },

  /**
   * Get a single fee payment by ID
   */
  getById(id: number): Promise<ApiResponse<{ fee_payment: FeePayment }>> {
    return apiClient.get(`/fee-payments/${id}`)
  },

  /**
   * Create a new fee payment
   */
  create(payload: CreateFeePaymentPayload): Promise<ApiResponse<{ fee_payment: FeePayment }>> {
    return apiClient.post('/fee-payments', payload)
  },

  /**
   * Delete a fee payment
   */
  delete(id: number): Promise<ApiResponse<{}>> {
    return apiClient.delete(`/fee-payments/${id}`)
  },

  /**
   * Update a fee payment
   */
  update(id: number, payload: UpdateFeePaymentPayload): Promise<ApiResponse<{ fee_payment: FeePayment }>> {
    return apiClient.put(`/fee-payments/${id}`, payload)
  },
}
