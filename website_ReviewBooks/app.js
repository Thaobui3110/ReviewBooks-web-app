require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const viewCounter = require('./middleware/viewCounter');
const flashMiddleware = require('./middleware/flash');
const userActivity = require('./middleware/userActivity');

const webPublicRoutes = require('./routes/web/publicRoutes');
const webAuthRoutes = require('./routes/web/authRoutes');
const webAdminRoutes = require('./routes/web/adminRoutes');
const apiRoutes = require('./routes/api/index');

const app = express();
const PORT = process.env.PORT || 3000;
const sessionSecret = process.env.SESSION_SECRET || 'dev-only-change-me';

if (!process.env.SESSION_SECRET) {
  console.warn('SESSION_SECRET is not set. Using a development-only fallback secret.');
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2,
    sameSite: 'lax'
  }
}));

app.use(flashMiddleware);
app.use(userActivity);
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.currentPath = req.path;
  next();
});

app.use(viewCounter);

// CORS tối giản cho /api/* — chỉ để "npm run web" của mobile app (chạy trong
// trình duyệt thật, khác cổng) gọi được API; Android emulator/Expo Go không
// bị same-origin policy nên không cần phần này.
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use('/api', apiRoutes);
app.use('/', webPublicRoutes);
app.use('/', webAuthRoutes);
app.use('/admin', webAdminRoutes);

app.use((req, res) => {
  res.status(404).render('pages/error', {
    title: 'Không tìm thấy trang',
    message: 'Trang bạn yêu cầu không tồn tại.'
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('pages/error', {
    title: 'Lỗi hệ thống',
    message: 'Có lỗi xảy ra. Vui lòng kiểm tra cấu hình cơ sở dữ liệu hoặc máy chủ cục bộ.'
  });
});

app.listen(PORT, () => {
  console.log(`ReviewBooks v2 running at http://localhost:${PORT}`);
});
