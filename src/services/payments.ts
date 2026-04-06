import apiClient from './api'
import type { ApiResponse } from '@/types'

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  receipt?: string
}

export const paymentsService = {
  createRazorpayOrder(studentId: number, amount: number): Promise<ApiResponse<{ order: RazorpayOrder }>> {
    return apiClient.post('/payments/razorpay/order', {
      student_id: studentId,
      amount,
    })
  },

  verifyRazorpayPayment(payload: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
    student_id: number
    amount: number
  }): Promise<ApiResponse<{ fee_payment: any }>> {
    return apiClient.post('/payments/razorpay/verify', payload)
  },
}
