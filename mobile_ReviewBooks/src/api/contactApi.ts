// Gửi ý kiến liên hệ
import { apiRequest } from './client';
import { ContactPayload } from '../types';

export function submitContact(payload: ContactPayload) {
  return apiRequest<undefined>('/api/contact', { method: 'POST', body: payload });
}
