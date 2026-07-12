import { apiRequest } from './client';

export function listCategories() {
  return apiRequest<{ categories: string[] }>('/api/categories');
}
