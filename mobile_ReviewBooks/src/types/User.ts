// Kiểu dữ liệu người dùng
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
}
