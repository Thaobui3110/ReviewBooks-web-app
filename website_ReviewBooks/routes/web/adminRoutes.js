// Route EJS cho khu vực quản trị /admin/*
const express = require('express');
const adminOnly = require('../../middleware/adminOnly');
const { buildPageUrl } = require('../../utils/pagination');
const { validateBook, validateAuthor, validateUser, validateCategoryName } = require('../../utils/validation');
const { setFlash } = require('../../middleware/flash');
const bookService = require('../../services/bookService');
const categoryService = require('../../services/categoryService');
const authorService = require('../../services/authorService');
const userService = require('../../services/userService');
const commentService = require('../../services/commentService');
const contactService = require('../../services/contactService');
const statsService = require('../../services/statsService');

const router = express.Router();
router.use(adminOnly);

router.get('/dashboard', async (req, res, next) => {
  try {
    const data = await statsService.getDashboardStats();
    res.render('admin/dashboard', { title: 'Tổng quan quản trị', ...data });
  } catch (err) {
    next(err);
  }
});

// ---- Books ----
router.get('/books', async (req, res, next) => {
  try {
    const search = (req.query.search || '').trim();
    const category = (req.query.category || '').trim();
    const sort = req.query.sort || 'updated';
    const { books, pagination } = await bookService.listAllForAdmin({ search, category, sort, page: req.query.page, perPage: 10 });

    res.render('admin/books', {
      title: 'Quản lý sách',
      books,
      pagination,
      search,
      category,
      sort,
      categories: await categoryService.listAll(),
      buildPageUrl: (page) => buildPageUrl(req, page)
    });
  } catch (err) {
    next(err);
  }
});

router.get('/books/create', async (req, res, next) => {
  try {
    res.render('admin/book-form', {
      title: 'Thêm sách',
      mode: 'create',
      book: { tags: [] },
      categories: await categoryService.listAll(),
      authors: await authorService.listAll(),
      error: null
    });
  } catch (err) {
    next(err);
  }
});

router.post('/books/create', async (req, res, next) => {
  try {
    const categories = await categoryService.listAll();
    const authors = await authorService.listAll();
    const { errors, values } = validateBook(req.body, categories, authors);

    if (errors.length) {
      return res.status(400).render('admin/book-form', {
        title: 'Thêm sách',
        mode: 'create',
        book: { ...values, tags: values.categoryIds.map((id) => ({ id })) },
        categories,
        authors,
        error: errors.join(' ')
      });
    }

    await bookService.createBook(values);
    setFlash(req, 'success', `Đã thêm sách "${values.title}".`);
    res.redirect('/admin/books');
  } catch (err) {
    next(err);
  }
});

router.get('/books/:id/edit', async (req, res, next) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    if (!book) {
      setFlash(req, 'error', 'Không tìm thấy sách cần sửa.');
      return res.redirect('/admin/books');
    }
    res.render('admin/book-form', {
      title: 'Sửa sách',
      mode: 'edit',
      book,
      categories: await categoryService.listAll(),
      authors: await authorService.listAll(),
      error: null
    });
  } catch (err) {
    next(err);
  }
});

router.post('/books/:id/edit', async (req, res, next) => {
  try {
    const categories = await categoryService.listAll();
    const authors = await authorService.listAll();
    const { errors, values } = validateBook(req.body, categories, authors);

    if (errors.length) {
      return res.status(400).render('admin/book-form', {
        title: 'Sửa sách',
        mode: 'edit',
        book: { id: req.params.id, ...values, tags: values.categoryIds.map((id) => ({ id })) },
        categories,
        authors,
        error: errors.join(' ')
      });
    }

    const ok = await bookService.updateBook(req.params.id, values);
    setFlash(req, ok ? 'success' : 'error', ok ? 'Đã cập nhật sách.' : 'Không tìm thấy sách cần cập nhật.');
    res.redirect('/admin/books');
  } catch (err) {
    next(err);
  }
});

router.post('/books/:id/delete', async (req, res, next) => {
  try {
    const ok = await bookService.deleteBook(req.params.id);
    setFlash(req, ok ? 'success' : 'error', ok ? 'Đã xóa sách và các bình luận liên quan.' : 'Không tìm thấy sách cần xóa.');
    res.redirect('/admin/books');
  } catch (err) {
    next(err);
  }
});

// ---- Authors ----
router.get('/authors', async (req, res, next) => {
  try {
    const search = (req.query.search || '').trim();
    const { authors, pagination } = await authorService.listPaginated({ search, page: req.query.page, perPage: 10 });

    res.render('admin/authors', {
      title: 'Quản lý tác giả',
      authors,
      pagination,
      search,
      buildPageUrl: (page) => buildPageUrl(req, page)
    });
  } catch (err) {
    next(err);
  }
});

router.get('/authors/create', (req, res) => {
  res.render('admin/author-form', {
    title: 'Thêm tác giả',
    mode: 'create',
    author: {},
    error: null
  });
});

router.post('/authors/create', async (req, res, next) => {
  try {
    const { errors, values } = validateAuthor(req.body);
    if (errors.length) {
      return res.status(400).render('admin/author-form', {
        title: 'Thêm tác giả',
        mode: 'create',
        author: values,
        error: errors.join(' ')
      });
    }

    await authorService.create(values);
    setFlash(req, 'success', `Đã thêm tác giả "${values.name}".`);
    res.redirect('/admin/authors');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).render('admin/author-form', {
        title: 'Thêm tác giả',
        mode: 'create',
        author: req.body,
        error: 'Tác giả này đã tồn tại.'
      });
    }
    next(err);
  }
});

router.get('/authors/:id/edit', async (req, res, next) => {
  try {
    const author = await authorService.getById(req.params.id);
    if (!author) {
      setFlash(req, 'error', 'Không tìm thấy tác giả cần sửa.');
      return res.redirect('/admin/authors');
    }
    res.render('admin/author-form', { title: 'Sửa tác giả', mode: 'edit', author, error: null });
  } catch (err) {
    next(err);
  }
});

router.post('/authors/:id/edit', async (req, res, next) => {
  try {
    const { errors, values } = validateAuthor(req.body);
    if (errors.length) {
      return res.status(400).render('admin/author-form', {
        title: 'Sửa tác giả',
        mode: 'edit',
        author: { id: req.params.id, ...values },
        error: errors.join(' ')
      });
    }

    const ok = await authorService.update(req.params.id, values);
    setFlash(req, ok ? 'success' : 'error', ok ? 'Đã cập nhật tác giả.' : 'Không tìm thấy tác giả cần cập nhật.');
    res.redirect('/admin/authors');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).render('admin/author-form', {
        title: 'Sửa tác giả',
        mode: 'edit',
        author: { id: req.params.id, ...req.body },
        error: 'Tác giả này đã tồn tại.'
      });
    }
    next(err);
  }
});

router.post('/authors/:id/delete', async (req, res, next) => {
  try {
    const result = await authorService.remove(req.params.id);
    if (!result.ok) {
      const message = result.error === 'has_books'
        ? `Không thể xóa "${result.authorName}" vì còn ${result.bookCount} sách đang gắn với tác giả này. Hãy đổi tác giả cho các sách đó trước.`
        : 'Không tìm thấy tác giả cần xóa.';
      setFlash(req, 'error', message);
      return res.redirect('/admin/authors');
    }

    setFlash(req, 'success', `Đã xóa tác giả "${result.authorName}".`);
    res.redirect('/admin/authors');
  } catch (err) {
    next(err);
  }
});

// ---- Categories ----
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await categoryService.listWithBookCounts();
    res.render('admin/categories', { title: 'Quản lý thể loại', categories, error: null });
  } catch (err) {
    next(err);
  }
});

router.post('/categories/create', async (req, res, next) => {
  try {
    const { errors, name } = validateCategoryName(req.body.name);
    if (errors.length) {
      const categories = await categoryService.listWithBookCounts();
      return res.status(400).render('admin/categories', { title: 'Quản lý thể loại', categories, error: errors.join(' ') });
    }

    await categoryService.create(name);
    setFlash(req, 'success', `Đã thêm thể loại "${name}".`);
    res.redirect('/admin/categories');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      setFlash(req, 'error', 'Thể loại này đã tồn tại.');
      return res.redirect('/admin/categories');
    }
    next(err);
  }
});

router.get('/categories/:id/edit', async (req, res, next) => {
  try {
    const category = await categoryService.getById(req.params.id);
    if (!category) {
      setFlash(req, 'error', 'Không tìm thấy thể loại cần sửa.');
      return res.redirect('/admin/categories');
    }
    res.render('admin/category-form', { title: 'Sửa thể loại', category, error: null });
  } catch (err) {
    next(err);
  }
});

router.post('/categories/:id/edit', async (req, res, next) => {
  try {
    const { errors, name } = validateCategoryName(req.body.name);
    if (errors.length) {
      return res.status(400).render('admin/category-form', {
        title: 'Sửa thể loại',
        category: { id: req.params.id, name },
        error: errors.join(' ')
      });
    }

    const result = await categoryService.rename(req.params.id, name);
    if (!result.ok) {
      setFlash(req, 'error', 'Không tìm thấy thể loại cần sửa.');
      return res.redirect('/admin/categories');
    }

    setFlash(req, 'success', `Đã đổi thể loại "${result.previousName}" thành "${name}" và cập nhật các sách liên quan.`);
    res.redirect('/admin/categories');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).render('admin/category-form', {
        title: 'Sửa thể loại',
        category: { id: req.params.id, name: req.body.name },
        error: 'Thể loại này đã tồn tại.'
      });
    }
    next(err);
  }
});

router.post('/categories/:id/delete', async (req, res, next) => {
  try {
    const result = await categoryService.remove(req.params.id);
    if (!result.ok) {
      setFlash(req, 'error', 'Không tìm thấy thể loại cần xóa.');
      return res.redirect('/admin/categories');
    }

    setFlash(req, 'success', `Đã xóa thể loại "${result.categoryName}". Các sách gắn tag này chỉ mất tag đó, vẫn giữ các tag còn lại (nếu có).`);
    res.redirect('/admin/categories');
  } catch (err) {
    next(err);
  }
});

// ---- Users ----
router.get('/users', async (req, res, next) => {
  try {
    const search = (req.query.search || '').trim();
    const role = (req.query.role || '').trim();
    const { users, pagination } = await userService.listPaginated({ search, role, page: req.query.page, perPage: 10 });

    res.render('admin/users', {
      title: 'Người dùng',
      users,
      pagination,
      search,
      role,
      buildPageUrl: (page) => buildPageUrl(req, page)
    });
  } catch (err) {
    next(err);
  }
});

router.post('/users/create', async (req, res, next) => {
  try {
    const { errors, values } = validateUser(req.body, 'create');
    if (errors.length) {
      setFlash(req, 'error', errors.join(' '));
      return res.redirect('/admin/users');
    }

    await userService.create(values);
    setFlash(req, 'success', `Đã thêm người dùng "${values.username}".`);
    res.redirect('/admin/users');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      setFlash(req, 'error', 'Tên đăng nhập hoặc email đã tồn tại.');
      return res.redirect('/admin/users');
    }
    next(err);
  }
});

router.get('/users/:id/edit', async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);
    if (!user) {
      setFlash(req, 'error', 'Không tìm thấy người dùng cần sửa.');
      return res.redirect('/admin/users');
    }
    res.render('admin/user-form', { title: 'Sửa người dùng', mode: 'edit', user, error: null });
  } catch (err) {
    next(err);
  }
});

router.post('/users/:id/edit', async (req, res, next) => {
  try {
    const { errors, values } = validateUser(req.body, 'edit');
    if (errors.length) {
      return res.status(400).render('admin/user-form', {
        title: 'Sửa người dùng',
        mode: 'edit',
        user: { id: req.params.id, ...values },
        error: errors.join(' ')
      });
    }

    await userService.update(req.params.id, values, req.session.user);
    setFlash(req, 'success', 'Đã cập nhật người dùng.');
    res.redirect('/admin/users');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).render('admin/user-form', {
        title: 'Sửa người dùng',
        mode: 'edit',
        user: { id: req.params.id, ...req.body },
        error: 'Tên đăng nhập hoặc email đã tồn tại.'
      });
    }
    next(err);
  }
});

router.post('/users/:id/delete', async (req, res, next) => {
  try {
    const result = await userService.remove(req.params.id, req.session.user && req.session.user.id);
    if (!result.ok) {
      setFlash(req, 'error', result.error);
      return res.redirect('/admin/users');
    }

    if (result.selfDeleted) {
      return req.session.destroy(() => res.redirect('/login'));
    }

    setFlash(req, 'success', `Đã xóa tài khoản "${result.user.username}" (${result.user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}). Các bình luận cũ vẫn được giữ lại.`);
    res.redirect('/admin/users');
  } catch (err) {
    next(err);
  }
});

// ---- Comments ----
router.get('/comments', async (req, res, next) => {
  try {
    const search = (req.query.search || '').trim();
    const sort = req.query.sort || 'newest';
    const { comments, pagination } = await commentService.listAllPaginated({ search, sort, page: req.query.page, perPage: 10 });

    res.render('admin/comments', {
      title: 'Bình luận',
      comments,
      pagination,
      search,
      sort,
      buildPageUrl: (page) => buildPageUrl(req, page)
    });
  } catch (err) {
    next(err);
  }
});

router.post('/comments/:id/delete', async (req, res, next) => {
  try {
    const ok = await commentService.deleteComment(req.params.id);
    setFlash(req, ok ? 'success' : 'error', ok ? 'Đã xóa bình luận.' : 'Không tìm thấy bình luận cần xóa.');
    res.redirect('/admin/comments');
  } catch (err) {
    next(err);
  }
});

// ---- Contacts ----
router.get('/contacts', async (req, res, next) => {
  try {
    const { contacts, pagination } = await contactService.listPaginated({ page: req.query.page, perPage: 10 });

    res.render('admin/contacts', {
      title: 'Liên hệ',
      contacts,
      pagination,
      buildPageUrl: (page) => buildPageUrl(req, page)
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
