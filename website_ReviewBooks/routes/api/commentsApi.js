// API feed toàn bộ bình luận (trang "Tất cả bình luận"), hỗ trợ tìm kiếm + sắp xếp
const express = require('express');
const commentService = require('../../services/commentService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { search = '', sort = 'newest', page } = req.query;
    const { reviews, pagination } = await commentService.listReviewsFeed({ search, sort, page, perPage: 8 });
    res.json({ success: true, data: { reviews, pagination } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
