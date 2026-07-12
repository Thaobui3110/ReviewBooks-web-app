const express = require('express');
const bookService = require('../../services/bookService');
const commentService = require('../../services/commentService');
const { validateComment } = require('../../utils/validation');
const { requireLoginApi } = require('../../middleware/apiAuth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { search = '', category = '', sort = 'newest', page } = req.query;
    const { books, pagination } = await bookService.searchBooks({ search, category, sort, page, perPage: 6 });
    res.json({ success: true, data: { books, pagination } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy sách.' });
    const rating = await commentService.getRatingStats(req.params.id);
    res.json({ success: true, data: { book, rating } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/comments', async (req, res, next) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy sách.' });
    const comments = await commentService.listForBook(req.params.id);
    res.json({ success: true, data: { comments } });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/comments', requireLoginApi, async (req, res, next) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy sách.' });

    const { errors, values } = validateComment(req.body);
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(' ') });

    await commentService.createComment({
      bookId: req.params.id,
      userId: req.session.user.id,
      name: req.session.user.username,
      email: req.session.user.email,
      content: values.content,
      rating: values.rating
    });

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/comments/:commentId', requireLoginApi, async (req, res, next) => {
  try {
    const comment = await commentService.getCommentById(req.params.commentId);
    if (!comment || String(comment.book_id) !== String(req.params.id) || String(comment.user_id) !== String(req.session.user.id)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa bình luận này.' });
    }

    const { errors, values } = validateComment(req.body);
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(' ') });

    await commentService.updateComment({ id: comment.id, content: values.content, rating: values.rating });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/comments/:commentId', requireLoginApi, async (req, res, next) => {
  try {
    const comment = await commentService.getCommentById(req.params.commentId);
    if (!comment || String(comment.book_id) !== String(req.params.id) || String(comment.user_id) !== String(req.session.user.id)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bình luận này.' });
    }

    await commentService.deleteComment(comment.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
