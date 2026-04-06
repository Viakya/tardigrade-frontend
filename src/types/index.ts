export interface User {
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  full_name: string
  password: string
  role?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
}

export interface LoginResponse {
  access_token: string
  user: User
}

export interface TableColumnSchema {
  name: string
  type: string
  nullable: boolean
  primary_key: boolean
  autoincrement: boolean
  has_default: boolean
}

export interface TableSchema {
  name: string
  label: string
  primary_key: string[]
  columns: TableColumnSchema[]
}

export interface TableRowsResponse {
  rows: Record<string, any>[]
  total: number
  page: number
  per_page: number
}

export type UserRole = 'admin' | 'director' | 'manager' | 'coach' | 'student' | 'parent'
