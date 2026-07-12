// Nghiệp vụ CRUD thể loại
const db = require('../config/db');

async function listNames() {
  const [rows] = await db.query('SELECT name FROM categories ORDER BY name ASC');
  return rows.map((row) => row.name);
}

async function listAll() {
  const [rows] = await db.query('SELECT id, name FROM categories ORDER BY name ASC');
  return rows;
}

async function listWithBookCounts() {
  const [rows] = await db.query(`
    SELECT cat.*, COUNT(DISTINCT bc.book_id) AS book_count
    FROM categories cat
    LEFT JOIN book_categories bc ON bc.category_id = cat.id
    GROUP BY cat.id
    ORDER BY cat.name ASC
  `);
  return rows;
}

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create(name) {
  await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
}

async function rename(id, newName) {
  const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
  const category = rows[0];
  if (!category) return { ok: false, error: 'not_found' };

  await db.query('UPDATE categories SET name = ? WHERE id = ?', [newName, id]);
  return { ok: true, previousName: category.name };
}

async function remove(id) {
  const [rows] = await db.query('SELECT name FROM categories WHERE id = ?', [id]);
  const category = rows[0];
  if (!category) return { ok: false, error: 'not_found' };

  // book_categories rows tự động bị xóa theo (ON DELETE CASCADE) — sách chỉ mất tag này,
  // không cần chuyển sách sang thể loại khác như trước vì 1 sách có thể còn tag khác.
  await db.query('DELETE FROM categories WHERE id = ?', [id]);
  return { ok: true, categoryName: category.name };
}

module.exports = {
  listNames,
  listAll,
  listWithBookCounts,
  getById,
  create,
  rename,
  remove
};
