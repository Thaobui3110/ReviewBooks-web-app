const express = require('express');
const { verifyToken } = require('../../utils/token');

const router = express.Router();

// Mobile app dùng JWT thay cho cookie session: đọc header Authorization nếu
// session cookie chưa có sẵn (web dùng cookie, mobile dùng token), gán vào
// req.session.user để toàn bộ route/middleware bên dưới không cần đổi gì.
router.use((req, res, next) => {
  if (!req.session.user) {
    const match = /^Bearer (.+)$/.exec(req.headers.authorization || '');
    if (match) {
      const user = verifyToken(match[1]);
      if (user) req.session.user = user;
    }
  }
  next();
});

router.use('/books', require('./booksApi'));
router.use('/categories', require('./categoriesApi'));
router.use('/reviews', require('./commentsApi'));
router.use('/contact', require('./contactApi'));
router.use('/auth', require('./authApi'));

router.use((req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint không tồn tại.' });
});

router.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Có lỗi xảy ra ở máy chủ.' });
});

module.exports = router;
