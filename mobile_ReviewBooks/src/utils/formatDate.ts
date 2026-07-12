// Định dạng ngày giờ ISO từ API thành chuỗi hiển thị trên UI
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.toLocaleTimeString('vi-VN')} · ${date.toLocaleDateString('vi-VN')}`;
}
