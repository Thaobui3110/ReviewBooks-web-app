export function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.toLocaleTimeString('vi-VN')} · ${date.toLocaleDateString('vi-VN')}`;
}
