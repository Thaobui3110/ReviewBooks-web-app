// Chặn route cần đăng nhập, redirect về /login nếu chưa
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

module.exports = requireLogin;
