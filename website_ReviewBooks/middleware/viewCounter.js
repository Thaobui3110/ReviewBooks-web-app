const statsService = require('../services/statsService');

async function viewCounter(req, res, next) {
  try {
    if (req.method === 'GET' && !req.path.startsWith('/css') && !req.path.startsWith('/js') && !req.path.startsWith('/images') && !req.path.startsWith('/fonts')) {
      await statsService.incrementViewCount();
    }
  } catch (err) {
    console.error('View counter error:', err.message);
  }
  next();
}

module.exports = viewCounter;
