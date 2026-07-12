const jwt = require('jsonwebtoken');

const SECRET = process.env.SESSION_SECRET;
const EXPIRES_IN = '7d';

function signToken(user) {
  const payload = { id: user.id, username: user.username, email: user.email, role: user.role };
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

module.exports = { signToken, verifyToken };
