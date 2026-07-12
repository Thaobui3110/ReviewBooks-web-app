const express = require('express');
const requireLogin = require('../../middleware/auth');
const { validateContact, validateComment, validateProfileUpdate, validatePasswordChange } = require('../../utils/validation');
const { safeNextUrl } = require('../../utils/safeUrl');
const { buildPageUrl } = require('../../utils/pagination');
const { setFlash } = require('../../middleware/flash');
const bookService = require('../../services/bookService');
const categoryService = require('../../services/categoryService');
const commentService = require('../../services/commentService');
const contactService = require('../../services/contactService');
const userService = require('../../services/userService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const books = await bookService.listNewest(6);
    res.render('pages/index', { title: 'Trang đánh giá sách', books });
  } catch (err) {
    next(err);
  }
});

router.get('/books', async (req, res, next) => {
  try {
    const search = (req.query.search || '').trim();
    const category = (req.query.category || '').trim();
    const sort = req.query.sort || 'newest';

    const { books, pagination } = await bookService.searchBooks({
      search, category, sort, page: req.query.page, perPage: 12
    });
    const categories = await categoryService.listWithBookCounts();

    res.render('pages/books', {
      title: 'Khám phá',
      books,
      categories,
      search,
      category,
      sort,
      pagination,
      buildPageUrl: (page) => buildPageUrl(req, page),
      currentListUrl: req.originalUrl,
      buildCategoryUrl: (categoryName) => {
        const params = { ...req.query, page: 1 };
        if (categoryName) params.category = categoryName;
        else delete params.category;
        const parts = [];
        for (const key in params) {
          if (params[key] !== undefined && params[key] !== '') {
            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
          }
        }
        const qs = parts.join('&');
        return `/books${qs ? `?${qs}` : ''}`;
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/reviews', async (req, res, next) => {
  try {
    const search = (req.query.search || '').trim();
    const sort = req.query.sort || 'newest';
    const { reviews, pagination } = await commentService.listReviewsFeed({ search, sort, page: req.query.page, perPage: 8 });
    res.render('pages/reviews', {
      title: 'Tất cả bình luận',
      reviews,
      pagination,
      search,
      sort,
      buildPageUrl: (page) => buildPageUrl(req, page)
    });
  } catch (err) {
    next(err);
  }
});

router.get('/books/:id', async (req, res, next) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    if (!book) {
      return res.status(404).render('pages/error', {
        title: 'Không tìm thấy sách',
        message: 'Mã sách không tồn tại.'
      });
    }

    const comments = await commentService.listForBook(req.params.id);
    const rating = await commentService.getRatingStats(req.params.id);
    const relatedBooks = await bookService.getRelatedBooks(req.params.id, 6);
    const backUrl = safeNextUrl(req.query.back) || '/books';

    res.render('pages/book-detail', {
      title: book.title,
      book,
      comments,
      rating,
      relatedBooks,
      error: null,
      backUrl
    });
  } catch (err) {
    next(err);
  }
});

router.post('/books/:id/comments', requireLogin, async (req, res, next) => {
  try {
    const { errors, values } = validateComment(req.body);
    const backQs = safeNextUrl(req.body.back) ? `?back=${encodeURIComponent(safeNextUrl(req.body.back))}` : '';

    const book = await bookService.getBookById(req.params.id);
    if (!book) {
      return res.status(404).render('pages/error', {
        title: 'Không tìm thấy sách',
        message: 'Không thể bình luận vì sách không tồn tại.'
      });
    }

    if (errors.length) {
      setFlash(req, 'error', errors.join(' '));
      return res.redirect(`/books/${req.params.id}${backQs}#reviews`);
    }

    await commentService.createComment({
      bookId: req.params.id,
      userId: req.session.user.id,
      name: req.session.user.username,
      email: req.session.user.email,
      content: values.content,
      rating: values.rating
    });

    setFlash(req, 'success', 'Đã gửi bình luận thành công.');
    res.redirect(`/books/${req.params.id}${backQs}#reviews`);
  } catch (err) {
    next(err);
  }
});

router.post('/books/:id/comments/:commentId/edit', requireLogin, async (req, res, next) => {
  try {
    const backQs = safeNextUrl(req.body.back) ? `?back=${encodeURIComponent(safeNextUrl(req.body.back))}` : '';
    const comment = await commentService.getCommentById(req.params.commentId);

    if (!comment || String(comment.book_id) !== String(req.params.id) || String(comment.user_id) !== String(req.session.user.id)) {
      setFlash(req, 'error', 'Bạn không có quyền sửa bình luận này.');
      return res.redirect(`/books/${req.params.id}${backQs}#reviews`);
    }

    const { errors, values } = validateComment(req.body);
    if (errors.length) {
      setFlash(req, 'error', errors.join(' '));
      return res.redirect(`/books/${req.params.id}${backQs}#reviews`);
    }

    await commentService.updateComment({ id: comment.id, content: values.content, rating: values.rating });
    setFlash(req, 'success', 'Đã cập nhật bình luận.');
    res.redirect(`/books/${req.params.id}${backQs}#reviews`);
  } catch (err) {
    next(err);
  }
});

router.post('/books/:id/comments/:commentId/delete', requireLogin, async (req, res, next) => {
  try {
    const backQs = safeNextUrl(req.body.back) ? `?back=${encodeURIComponent(safeNextUrl(req.body.back))}` : '';
    const comment = await commentService.getCommentById(req.params.commentId);

    if (!comment || String(comment.book_id) !== String(req.params.id) || String(comment.user_id) !== String(req.session.user.id)) {
      setFlash(req, 'error', 'Bạn không có quyền xóa bình luận này.');
      return res.redirect(`/books/${req.params.id}${backQs}#reviews`);
    }

    await commentService.deleteComment(comment.id);
    setFlash(req, 'success', 'Đã xóa bình luận.');
    res.redirect(`/books/${req.params.id}${backQs}#reviews`);
  } catch (err) {
    next(err);
  }
});

router.get('/account', requireLogin, (req, res) => {
  res.render('pages/account', {
    title: 'Tài khoản'
  });
});

router.post('/account/profile', requireLogin, async (req, res, next) => {
  try {
    const { errors, values } = validateProfileUpdate(req.body);
    if (errors.length) {
      setFlash(req, 'error', errors.join(' '));
      return res.redirect('/account');
    }

    await userService.updateUsername(req.session.user.id, values.username, req.session.user);
    setFlash(req, 'success', 'Đã cập nhật tên hiển thị.');
    res.redirect('/account');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      setFlash(req, 'error', 'Tên đăng nhập đã được sử dụng.');
      return res.redirect('/account');
    }
    next(err);
  }
});

router.post('/account/password', requireLogin, async (req, res, next) => {
  try {
    const { errors, values } = validatePasswordChange(req.body);
    if (errors.length) {
      setFlash(req, 'error', errors.join(' '));
      return res.redirect('/account');
    }

    const ok = await userService.changePassword(req.session.user.id, values.currentPassword, values.newPassword);
    if (!ok) {
      setFlash(req, 'error', 'Mật khẩu hiện tại không đúng.');
      return res.redirect('/account');
    }

    setFlash(req, 'success', 'Đã đổi mật khẩu thành công.');
    res.redirect('/account');
  } catch (err) {
    next(err);
  }
});

router.get('/contact', (req, res) => {
  res.render('pages/contact', {
    title: 'Giới thiệu và liên hệ',
    sent: false,
    error: null,
    formData: {
      name: req.session.user ? req.session.user.username : '',
      email: req.session.user ? req.session.user.email : ''
    }
  });
});

router.post('/contact', async (req, res, next) => {
  try {
    const { errors, values } = validateContact(req.body, req.session.user);

    if (errors.length) {
      return res.status(400).render('pages/contact', {
        title: 'Giới thiệu và liên hệ',
        sent: false,
        error: errors.join(' '),
        formData: values
      });
    }

    await contactService.create(values);

    res.render('pages/contact', {
      title: 'Giới thiệu và liên hệ',
      sent: true,
      error: null,
      formData: {
        name: req.session.user ? req.session.user.username : '',
        email: req.session.user ? req.session.user.email : ''
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
