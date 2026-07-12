// Hash và so khớp mật khẩu bằng PBKDF2-SHA512
const crypto = require('crypto');

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string' || !storedHash.includes(':')) return false;

  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !/^[a-f0-9]+$/i.test(originalHash || '')) return false;

  const testHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  const originalBuffer = Buffer.from(originalHash, 'hex');
  const testBuffer = Buffer.from(testHash, 'hex');

  if (originalBuffer.length !== testBuffer.length) return false;
  return crypto.timingSafeEqual(originalBuffer, testBuffer);
}

module.exports = {
  hashPassword,
  verifyPassword
};
