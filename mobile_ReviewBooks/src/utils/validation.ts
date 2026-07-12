// Mirror các luật validate phía server ở utils/validation.js của website_ReviewBooks
// để báo lỗi ngay trên app, không cần chờ round-trip API.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,50}$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidUsername(value: string): boolean {
  return USERNAME_RE.test(value.trim());
}

export function validateLogin(username: string, password: string): string | null {
  if (!username.trim() || !password) return 'Vui lòng nhập tên đăng nhập và mật khẩu.';
  return null;
}

export function validateRegister(
  username: string,
  email: string,
  password: string,
  confirmPassword: string
): string | null {
  if (!isValidUsername(username)) {
    return 'Tên đăng nhập phải dài 3-50 ký tự và chỉ gồm chữ, số hoặc dấu gạch dưới.';
  }
  if (!isEmail(email)) return 'Email không hợp lệ.';
  if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
  if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp.';
  return null;
}

export function validateCommentInput(content: string, rating: number): string | null {
  const trimmed = content.trim();
  if (trimmed.length < 5 || trimmed.length > 2000) return 'Bình luận phải có từ 5 đến 2000 ký tự.';
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return 'Điểm đánh giá phải nằm trong khoảng 1 đến 5.';
  return null;
}

export function validateContactInput(name: string, email: string, message: string): string | null {
  const trimmedName = name.trim();
  const trimmedMessage = message.trim();
  if (trimmedName.length < 2 || trimmedName.length > 100) return 'Họ tên phải có từ 2 đến 100 ký tự.';
  if (!isEmail(email)) return 'Email không hợp lệ.';
  if (trimmedMessage.length < 5 || trimmedMessage.length > 3000) return 'Nội dung phải có từ 5 đến 3000 ký tự.';
  return null;
}

export function validateProfileUsername(username: string): string | null {
  if (!isValidUsername(username)) {
    return 'Tên đăng nhập phải dài 3-50 ký tự và chỉ gồm chữ, số hoặc dấu gạch dưới.';
  }
  return null;
}

export function validatePasswordChangeInput(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): string | null {
  if (!currentPassword) return 'Vui lòng nhập mật khẩu hiện tại.';
  if (newPassword.length < 6) return 'Mật khẩu mới phải có ít nhất 6 ký tự.';
  if (newPassword !== confirmPassword) return 'Xác nhận mật khẩu mới không khớp.';
  return null;
}
