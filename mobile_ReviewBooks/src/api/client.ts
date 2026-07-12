// Fetch wrapper trung tâm: gắn header Authorization, parse JSON, ném lỗi có message
import { API_BASE_URL } from './config';
import { ApiResponse } from '../types';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: object;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error('Không kết nối được tới máy chủ. Kiểm tra lại địa chỉ API và mạng Wi-Fi.');
  }

  const json: ApiResponse<T> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}
