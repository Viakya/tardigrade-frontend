import apiClient from './api'
import type { ApiResponse } from '@/types'

export interface BatchResource {
  id: number
  batch_id: number
  title: string
  description: string | null
  url: string
  resource_type: string
  created_by: number
  visible_to_students: boolean
  created_at: string
  updated_at: string
  creator?: {
    id: number
    full_name: string
    email: string
    role: string
  } | null
}

export interface BatchResourceListResponse {
  batch: {
    id: number
    batch_name: string
    year: number
  }
  resources: BatchResource[]
}

export interface CreateBatchResourcePayload {
  title: string
  description?: string
  url: string
  resource_type?: string
  visible_to_students?: boolean
}

export interface UpdateBatchResourcePayload {
  title?: string
  description?: string
  url?: string
  resource_type?: string
  visible_to_students?: boolean
}

export const batchResourcesService = {
  list(batchId: number, includeHidden = false): Promise<ApiResponse<BatchResourceListResponse>> {
    return apiClient.get(`/batches/${batchId}/resources`, {
      params: includeHidden ? { include_hidden: true } : undefined,
    })
  },

  create(batchId: number, payload: CreateBatchResourcePayload): Promise<ApiResponse<{ resource: BatchResource }>> {
    return apiClient.post(`/batches/${batchId}/resources`, payload)
  },

  update(resourceId: number, payload: UpdateBatchResourcePayload): Promise<ApiResponse<{ resource: BatchResource }>> {
    return apiClient.put(`/batch-resources/${resourceId}`, payload)
  },

  remove(resourceId: number): Promise<ApiResponse<{}>> {
    return apiClient.delete(`/batch-resources/${resourceId}`)
  },
}
