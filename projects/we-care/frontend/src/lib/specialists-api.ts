import { api } from './axios'

export interface SpecialistsDirectoryItem {
  id: string
  full_name: string
  specialty: string
  hospital: string
  phone: string | null
  clinician_type: 'doctor' | 'specialist'
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export async function getSpecialistsDirectory(page = 1, pageSize = 10) {
  const response = await api.get<PaginatedResponse<SpecialistsDirectoryItem>>('/api/specialists', {
    params: { page, pageSize },
  })
  return response.data
}
