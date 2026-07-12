// Đăng ký, đăng nhập, đăng xuất, xem/sửa tài khoản, đổi mật khẩu
import { apiRequest } from './client';
import { LoginData, MeData, RegisterPayload, PasswordChangePayload } from '../types';

export function login(username: string, password: string) {
  return apiRequest<LoginData>('/api/auth/login', { method: 'POST', body: { username, password } });
}

export function register(payload: RegisterPayload) {
  return apiRequest<undefined>('/api/auth/register', { method: 'POST', body: payload });
}

export function logout() {
  return apiRequest<undefined>('/api/auth/logout', { method: 'POST' });
}

export function me() {
  return apiRequest<MeData>('/api/auth/me');
}

export function updateProfile(username: string) {
  return apiRequest<LoginData>('/api/auth/me', { method: 'PATCH', body: { username } });
}

export function changePassword(payload: PasswordChangePayload) {
  return apiRequest<undefined>('/api/auth/password', { method: 'POST', body: payload });
}
