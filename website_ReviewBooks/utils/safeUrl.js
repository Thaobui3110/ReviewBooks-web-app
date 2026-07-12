// Chặn open-redirect khi dùng tham số ?next=/?back=
function safeNextUrl(value) {
  if (typeof value !== 'string') return '';
  const nextUrl = value.trim();
  if (!nextUrl || !nextUrl.startsWith('/') || nextUrl.startsWith('//')) return '';
  if (nextUrl.includes('\\') || /[\r\n]/.test(nextUrl)) return '';

  try {
    const parsed = new URL(nextUrl, 'http://local.invalid');
    return parsed.origin === 'http://local.invalid' ? `${parsed.pathname}${parsed.search}${parsed.hash}` : '';
  } catch (err) {
    return '';
  }
}

module.exports = { safeNextUrl };
