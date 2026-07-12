// Nghiệp vụ CRUD người dùng, đổi tên hiển thị/đổi mật khẩu
const db = require('../config/db');
const { hashPassword, verifyPassword } = require('../utils/password');
const { paginate } = require('../utils/pagination');

async function listPaginated({ search = '', role = '', page, perPage = 10 }) {
  let whereSql = 'WHERE 1 = 1';
  const params = [];

  if (search) {
    whereSql += ' AND (username LIKE ? OR email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (role) {
    whereSql += ' AND role = ?';
    params.push(role);
  }

  const [[countRow]] = await db.query(`SELECT COUNT(*) AS total FROM users ${whereSql}`, params);
  const pagination = paginate({ page, totalItems: countRow.total, perPage });

  const [rows] = await db.query(
    `SELECT id, username, email, role, last_seen_at, created_at,
      CASE WHEN last_seen_at IS NOT NULL AND last_seen_at >= (NOW() - INTERVAL 5 MINUTE) THEN 1 ELSE 0 END AS is_online
     FROM users
     ${whereSql}
     ORDER BY created_at DESC, id ASC
     LIMIT ? OFFSET ?`,
    [...params, pagination.perPage, pagination.offset]
  );

  return { users: rows, pagination };
}

async function getById(id) {
  const [rows] = await db.query(
    'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function create(values) {
  await db.query(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [values.username, values.email, hashPassword(values.password), values.role]
  );
}

async function update(id, values, sessionUser) {
  if (values.password) {
    await db.query(
      'UPDATE users SET username = ?, email = ?, password = ?, role = ? WHERE id = ?',
      [values.username, values.email, hashPassword(values.password), values.role, id]
    );
  } else {
    await db.query(
      'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?',
      [values.username, values.email, values.role, id]
    );
  }

  if (sessionUser && Number(sessionUser.id) === Number(id)) {
    sessionUser.username = values.username;
    sessionUser.email = values.email;
    sessionUser.role = values.role;
  }
}

async function updateUsername(id, username, sessionUser) {
  await db.query('UPDATE users SET username = ? WHERE id = ?', [username, id]);

  if (sessionUser && Number(sessionUser.id) === Number(id)) {
    sessionUser.username = username;
  }
}

async function changePassword(id, currentPassword, newPassword) {
  const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [id]);
  const user = rows[0];
  if (!user || !verifyPassword(currentPassword, user.password)) return false;

  await db.query('UPDATE users SET password = ? WHERE id = ?', [hashPassword(newPassword), id]);
  return true;
}

async function remove(id, requesterId) {
  const [rows] = await db.query('SELECT id, username, role FROM users WHERE id = ?', [id]);
  const user = rows[0];
  if (!user) return { ok: false, error: 'Không tìm thấy người dùng cần xóa.' };

  if (user.role === 'admin') {
    const [[adminCount]] = await db.query('SELECT COUNT(*) AS total FROM users WHERE role = ?', ['admin']);
    if (adminCount.total <= 1) {
      return { ok: false, error: 'Không thể xóa tài khoản admin cuối cùng.' };
    }
  }

  await db.query('DELETE FROM users WHERE id = ?', [id]);

  const selfDeleted = Number(requesterId) === Number(id);
  return { ok: true, user, selfDeleted };
}

module.exports = {
  listPaginated,
  getById,
  create,
  update,
  updateUsername,
  changePassword,
  remove
};
