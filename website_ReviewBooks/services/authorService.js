// Nghiệp vụ CRUD tác giả
const db = require('../config/db');
const { paginate } = require('../utils/pagination');

async function listAll() {
  const [rows] = await db.query('SELECT id, name FROM authors ORDER BY name ASC');
  return rows;
}

async function listPaginated({ search = '', page, perPage = 10 }) {
  const whereSql = search ? 'WHERE a.name LIKE ?' : '';
  const params = search ? [`%${search}%`] : [];

  const [[countRow]] = await db.query(`SELECT COUNT(*) AS total FROM authors a ${whereSql}`, params);
  const pagination = paginate({ page, totalItems: countRow.total, perPage });

  const [authors] = await db.query(
    `SELECT a.*, COUNT(b.id) AS book_count
     FROM authors a
     LEFT JOIN books b ON b.author_id = a.id
     ${whereSql}
     GROUP BY a.id
     ORDER BY a.name ASC, a.id ASC
     LIMIT ? OFFSET ?`,
    [...params, pagination.perPage, pagination.offset]
  );

  return { authors, pagination };
}

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM authors WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create(values) {
  await db.query(
    'INSERT INTO authors (name, avatar, bio) VALUES (?, ?, ?)',
    [values.name, values.avatar, values.bio]
  );
}

async function update(id, values) {
  const [result] = await db.query(
    'UPDATE authors SET name = ?, avatar = ?, bio = ?, updated_at = NOW() WHERE id = ?',
    [values.name, values.avatar, values.bio, id]
  );
  return result.affectedRows > 0;
}

async function remove(id) {
  const [rows] = await db.query('SELECT name FROM authors WHERE id = ?', [id]);
  const author = rows[0];
  if (!author) return { ok: false, error: 'not_found' };

  const [[bookCount]] = await db.query('SELECT COUNT(*) AS total FROM books WHERE author_id = ?', [id]);
  if (bookCount.total > 0) {
    return { ok: false, error: 'has_books', authorName: author.name, bookCount: bookCount.total };
  }

  await db.query('DELETE FROM authors WHERE id = ?', [id]);
  return { ok: true, authorName: author.name };
}

module.exports = {
  listAll,
  listPaginated,
  getById,
  create,
  update,
  remove
};
