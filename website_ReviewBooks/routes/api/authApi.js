const express = require('express');
const { validateUser, validateProfileUpdate, validatePasswordChange } = require('../../utils/validation');
const { requireLoginApi } = require('../../middleware/apiAuth');
const authService = require('../../services/authService');
const userService = require('../../services/userService');
const { signToken } = require('../../utils/token');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { confirmPassword } = req.body;
    const { errors, values } = validateUser(req.body, 'create');
    if (values.password !== confirmPassword) errors.push('Mật khẩu xác nhận không khớp.');
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(' ') });

    await authService.register(values);
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Tên đăng nhập hoặc email đã tồn tại.' });
    }
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    }

    const user = await authService.login(username, password);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    req.session.user = user;
    res.json({ success: true, data: { user, token: signToken(user) } });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get('/me', requireLoginApi, (req, res) => {
  res.json({ success: true, data: { user: req.session.user } });
});

router.patch('/me', requireLoginApi, async (req, res, next) => {
  try {
    const { errors, values } = validateProfileUpdate(req.body);
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(' ') });

    await userService.updateUsername(req.session.user.id, values.username, req.session.user);
    // Token cũ mang username cũ — ký lại để mobile cập nhật, không thì phải chờ token hết hạn.
    res.json({ success: true, data: { user: req.session.user, token: signToken(req.session.user) } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Tên đăng nhập đã được sử dụng.' });
    }
    next(err);
  }
});

router.post('/password', requireLoginApi, async (req, res, next) => {
  try {
    const { errors, values } = validatePasswordChange(req.body);
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(' ') });

    const ok = await userService.changePassword(req.session.user.id, values.currentPassword, values.newPassword);
    if (!ok) return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
