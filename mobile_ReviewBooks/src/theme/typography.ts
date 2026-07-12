// Định nghĩa cỡ chữ dùng chung toàn app
import { colors } from './colors';

export const typography = {
  h1: { fontSize: 26, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 16, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 14, color: colors.text },
  bodyMuted: { fontSize: 14, color: colors.textMuted },
};
