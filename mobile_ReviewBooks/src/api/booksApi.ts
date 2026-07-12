import { apiRequest } from './client';
import { Book, Comment, Pagination, RatingStats } from '../types';

interface ListBooksParams {
  search?: string;
  category?: string;
  sort?: 'newest' | 'rating' | 'title';
  page?: number;
}

export function listBooks(params: ListBooksParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  if (params.sort) query.set('sort', params.sort);
  if (params.page) query.set('page', String(params.page));
  const qs = query.toString();
  return apiRequest<{ books: Book[]; pagination: Pagination }>(`/api/books${qs ? `?${qs}` : ''}`);
}

export function getBook(id: number) {
  return apiRequest<{ book: Book; rating: RatingStats }>(`/api/books/${id}`);
}

export function listComments(bookId: number) {
  return apiRequest<{ comments: Comment[] }>(`/api/books/${bookId}/comments`);
}

export function createComment(bookId: number, content: string, rating: number) {
  return apiRequest<undefined>(`/api/books/${bookId}/comments`, {
    method: 'POST',
    body: { content, rating },
  });
}

export function updateComment(bookId: number, commentId: number, content: string, rating: number) {
  return apiRequest<undefined>(`/api/books/${bookId}/comments/${commentId}`, {
    method: 'PUT',
    body: { content, rating },
  });
}

export function deleteComment(bookId: number, commentId: number) {
  return apiRequest<undefined>(`/api/books/${bookId}/comments/${commentId}`, { method: 'DELETE' });
}
