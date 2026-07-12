// Bản JSON của middleware xác thực, dùng cho routes/api
function requireLoginApi(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để thực hiện thao tác này.' });
  }
  next();
}

function adminOnlyApi(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập.' });
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Chỉ quản trị viên mới có quyền truy cập.' });
  }
  next();
}

module.exports = { requireLoginApi, adminOnlyApi };
