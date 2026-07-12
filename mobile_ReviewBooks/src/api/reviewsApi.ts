import { apiRequest } from './client';
import { Review, Pagination } from '../types';

export type ReviewsSortOption = 'newest' | 'oldest' | 'rating_high' | 'rating_low';

interface ListReviewsParams {
  search?: string;
  sort?: ReviewsSortOption;
  page?: number;
}

export function listReviewsFeed(params: ListReviewsParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.sort) query.set('sort', params.sort);
  if (params.page) query.set('page', String(params.page));
  const qs = query.toString();
  return apiRequest<{ reviews: Review[]; pagination: Pagination }>(`/api/reviews${qs ? `?${qs}` : ''}`);
}
