import { apiRequest } from './client';
import { Review, Pagination } from '../types';

export function listReviewsFeed(page?: number) {
  const qs = page ? `?page=${page}` : '';
  return apiRequest<{ reviews: Review[]; pagination: Pagination }>(`/api/reviews${qs}`);
}
