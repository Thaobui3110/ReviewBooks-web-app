const authService = require('../services/authService');

module.exports = async function userActivity(req, res, next) {
  if (!req.session.user) return next();

  try {
    const stillExists = await authService.touchLastSeen(req.session.user.id);
    if (!stillExists) {
      return req.session.destroy(() => {
        res.locals.currentUser = null;
        next();
      });
    }
  } catch (err) {
    return next(err);
  }

  next();
};
