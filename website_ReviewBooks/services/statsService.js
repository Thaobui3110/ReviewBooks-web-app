const db = require('../config/db');

async function incrementViewCount() {
  await db.query('UPDATE site_stats SET total_views = total_views + 1, updated_at = NOW() WHERE id = 1');
}

async function getDashboardStats() {
  const [[stats]] = await db.query('SELECT total_views FROM site_stats WHERE id = 1');
  const [[bookCount]] = await db.query('SELECT COUNT(*) AS total FROM books');
  const [[authorCount]] = await db.query('SELECT COUNT(*) AS total FROM authors');
  const [[userCount]] = await db.query('SELECT COUNT(*) AS total FROM users');
  const [[commentCount]] = await db.query('SELECT COUNT(*) AS total FROM comments');
  const [[contactCount]] = await db.query('SELECT COUNT(*) AS total FROM contacts');
  const [[categoryCount]] = await db.query('SELECT COUNT(*) AS total FROM categories');

  return { stats, bookCount, authorCount, userCount, commentCount, contactCount, categoryCount };
}

module.exports = { incrementViewCount, getDashboardStats };
