import apiClient from './api'
import type { ApiResponse } from '@/types'

export interface AiInsightsPayload {
  focus?: string
}

export interface OpsSummaryPayload extends AiInsightsPayload {
  year?: number
  batch_id?: number
}

export const aiService = {
  async getOperationsSummary(payload: OpsSummaryPayload): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>('/ai/ops-summary', payload)
    return response.data
  },

  async getCoachBatchInsights(batchId: number, payload: AiInsightsPayload = {}): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/ai/coach/batches/${batchId}/insights`,
      payload
    )
    return response.data
  },

  async getParentChildSummary(studentId: number, payload: AiInsightsPayload = {}): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/ai/parent/children/${studentId}/summary`,
      payload
    )
    return response.data
  },

  async getParentWeeklyDigest(studentId: number, payload: AiInsightsPayload = {}): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/ai/parent/children/${studentId}/weekly-digest`,
      payload
    )
    return response.data
  },

  async getFeeRiskPrediction(payload: OpsSummaryPayload = {}): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>('/ai/fee-risk-prediction', payload)
    return response.data
  }
}
