const db = require('../config/db');
const { hashPassword, verifyPassword } = require('../utils/password');

function sanitizeSessionUser(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role
  };
}

async function login(username, password) {
  const [rows] = await db.query(
    'SELECT id, username, email, password, role FROM users WHERE username = ?',
    [username]
  );
  const user = rows[0];
  if (!user || !verifyPassword(password, user.password)) return null;

  await db.query('UPDATE users SET last_seen_at = NOW() WHERE id = ?', [user.id]);
  return sanitizeSessionUser(user);
}

async function register({ username, email, password }) {
  await db.query(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username, email, hashPassword(password), 'user']
  );
}

async function touchLastSeen(userId) {
  const [result] = await db.query('UPDATE users SET last_seen_at = NOW() WHERE id = ?', [userId]);
  return result.affectedRows > 0;
}

module.exports = {
  login,
  register,
  touchLastSeen
};
