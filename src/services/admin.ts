import apiClient from './api'
import type { ApiResponse, TableSchema, TableRowsResponse } from '@/types'

export const adminService = {
  async getTables(): Promise<ApiResponse<{ tables: TableSchema[] }>> {
    const response = await apiClient.get<ApiResponse<{ tables: TableSchema[] }>>('/admin/tables')
    return response.data
  },

  async getTableRows(
    tableName: string,
    page = 1,
    perPage = 25
  ): Promise<ApiResponse<TableRowsResponse>> {
    const response = await apiClient.get<ApiResponse<TableRowsResponse>>(
      `/admin/tables/${tableName}/rows`,
      {
        params: { page, per_page: perPage }
      }
    )
    return response.data
  },

  async createRow(tableName: string, data: Record<string, any>): Promise<ApiResponse<{ row: any }>> {
    const response = await apiClient.post<ApiResponse<{ row: any }>>(
      `/admin/tables/${tableName}/rows`,
      data
    )
    return response.data
  },

  async updateRow(
    tableName: string,
    key: Record<string, any>,
    data: Record<string, any>
  ): Promise<ApiResponse<{ row: any }>> {
    const response = await apiClient.put<ApiResponse<{ row: any }>>(
      `/admin/tables/${tableName}/rows`,
      {
        key,
        data
      }
    )
    return response.data
  },

  async deleteRow(tableName: string, key: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await apiClient.delete<ApiResponse<any>>(`/admin/tables/${tableName}/rows`, {
      data: { key }
    })
    return response.data
  }
}
