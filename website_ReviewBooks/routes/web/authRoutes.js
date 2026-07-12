// Route đăng nhập/đăng ký/đăng xuất (render EJS)
const express = require('express');
const { validateUser } = require('../../utils/validation');
const { safeNextUrl } = require('../../utils/safeUrl');
const { setFlash } = require('../../middleware/flash');
const authService = require('../../services/authService');

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('pages/login', {
    title: 'Đăng nhập',
    error: null,
    next: safeNextUrl(req.query.next)
  });
});

router.post('/login', async (req, res, next) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';
    const nextUrl = safeNextUrl(req.body.next);

    if (!username || !password) {
      return res.status(400).render('pages/login', {
        title: 'Đăng nhập',
        error: 'Vui lòng nhập tên đăng nhập và mật khẩu.',
        next: nextUrl
      });
    }

    const user = await authService.login(username, password);
    if (!user) {
      return res.status(401).render('pages/login', {
        title: 'Đăng nhập',
        error: 'Tên đăng nhập hoặc mật khẩu không đúng.',
        next: nextUrl || ''
      });
    }

    req.session.user = user;
    if (nextUrl) return res.redirect(nextUrl);
    if (user.role === 'admin') return res.redirect('/admin/dashboard');
    return res.redirect('/');
  } catch (err) {
    next(err);
  }
});

router.get('/register', (req, res) => {
  res.render('pages/register', {
    title: 'Đăng ký',
    error: null
  });
});

router.post('/register', async (req, res, next) => {
  try {
    const { confirmPassword } = req.body;
    const { errors, values } = validateUser(req.body, 'create');

    if (values.password !== confirmPassword) {
      errors.push('Mật khẩu xác nhận không khớp.');
    }

    if (errors.length) {
      return res.status(400).render('pages/register', {
        title: 'Đăng ký',
        error: errors.join(' ')
      });
    }

    await authService.register(values);

    setFlash(req, 'success', 'Đăng ký thành công. Bạn có thể đăng nhập ngay.');
    res.redirect('/login');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).render('pages/register', {
        title: 'Đăng ký',
        error: 'Tên đăng nhập hoặc email đã tồn tại.'
      });
    }
    next(err);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
