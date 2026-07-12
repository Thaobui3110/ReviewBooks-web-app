// Kiểu dữ liệu cho payload đăng nhập/đăng ký và response kèm token
import { User } from './User';

export interface LoginData {
  user: User;
  token: string;
}

export interface MeData {
  user: User;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface PasswordChangePayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
