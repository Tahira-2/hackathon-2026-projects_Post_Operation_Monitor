import { apiFetch } from './api-client';
import { API_ENDPOINTS, medicineDetailEndpoint } from './endpoints';
import type { Medicine } from './models';

export async function listMedicines(params?: { search?: string; category?: string }): Promise<Medicine[]> {
  const queryParams: Record<string, string> = {};
  if (params?.search) queryParams.search = params.search;
  if (params?.category && params.category !== 'All') queryParams.category = params.category;

  return apiFetch<Medicine[]>(API_ENDPOINTS.medicines.list, {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });
}

export async function getMedicineDetail(id: number): Promise<Medicine> {
  return apiFetch<Medicine>(medicineDetailEndpoint(id));
}
