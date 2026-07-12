function toPositiveInt(value, fallback = 1) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function paginate({ page, totalItems, perPage = 6 }) {
  const requestedPage = toPositiveInt(page, 1);
  const totalPages = Math.ceil(totalItems / perPage);
  const currentPage = totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);
  const offset = totalPages === 0 ? 0 : (currentPage - 1) * perPage;

  return {
    requestedPage,
    currentPage,
    totalPages,
    totalItems,
    perPage,
    offset,
    hasPagination: totalPages > 1,
    hasPrevious: totalPages > 1 && currentPage > 1,
    hasNext: totalPages > 1 && currentPage < totalPages,
    isOutOfRange: totalPages > 0 && requestedPage > totalPages
  };
}

function buildPageUrl(req, page) {
  const query = new URLSearchParams(req.query || {});
  query.set('page', String(page));
  const qs = query.toString();
  // req.baseUrl là phần tiền tố router được mount (vd. "/admin"), req.path là phần
  // còn lại sau tiền tố đó — phải ghép cả 2 mới ra đúng đường dẫn đầy đủ. Nếu chỉ
  // dùng req.path, route được mount qua app.use('/admin', ...) sẽ mất tiền tố
  // "/admin" (Express tự bỏ nó khi router con đọc req.path).
  return `${req.baseUrl}${req.path}${qs ? `?${qs}` : ''}`;
}

module.exports = {
  paginate,
  buildPageUrl
};
