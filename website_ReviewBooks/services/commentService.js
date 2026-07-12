const db = require('../config/db');
const { paginate } = require('../utils/pagination');

async function listForBook(bookId) {
  const [comments] = await db.query(`
    SELECT c.*, u.username
    FROM comments c
    LEFT JOIN users u ON u.id = c.user_id
    WHERE c.book_id = ?
    ORDER BY c.created_at DESC
  `, [bookId]);
  return comments;
}

async function getRatingStats(bookId) {
  const [rows] = await db.query(
    'SELECT COALESCE(ROUND(AVG(rating), 1), 0) AS average_rating, COUNT(*) AS total FROM comments WHERE book_id = ?',
    [bookId]
  );
  return rows[0];
}

async function createComment({ bookId, userId, name, email, content, rating }) {
  await db.query(
    'INSERT INTO comments (book_id, user_id, name, email, content, rating) VALUES (?, ?, ?, ?, ?, ?)',
    [bookId, userId || null, name, email, content, rating]
  );
}

async function getCommentById(id) {
  const [rows] = await db.query('SELECT * FROM comments WHERE id = ?', [id]);
  return rows[0];
}

async function updateComment({ id, content, rating }) {
  await db.query('UPDATE comments SET content = ?, rating = ? WHERE id = ?', [content, rating, id]);
}

async function listAllPaginated({ search = '', sort = 'newest', page, perPage = 10 }) {
  let whereSql = 'WHERE 1 = 1';
  const params = [];

  if (search) {
    whereSql += ' AND (b.title LIKE ? OR c.name LIKE ? OR c.email LIKE ? OR u.username LIKE ? OR c.content LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  const [[countRow]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM comments c
    JOIN books b ON b.id = c.book_id
    LEFT JOIN users u ON u.id = c.user_id
    ${whereSql}
  `, params);
  const pagination = paginate({ page, totalItems: countRow.total, perPage });

  let orderSql = 'ORDER BY c.created_at DESC, c.id ASC';
  if (sort === 'oldest') orderSql = 'ORDER BY c.created_at ASC, c.id ASC';
  else if (sort === 'rating_high') orderSql = 'ORDER BY c.rating DESC, c.created_at DESC, c.id ASC';
  else if (sort === 'rating_low') orderSql = 'ORDER BY c.rating ASC, c.created_at DESC, c.id ASC';

  const [comments] = await db.query(`
    SELECT c.*, b.title AS book_title, u.username
    FROM comments c
    JOIN books b ON b.id = c.book_id
    LEFT JOIN users u ON u.id = c.user_id
    ${whereSql}
    ${orderSql}
    LIMIT ? OFFSET ?
  `, [...params, pagination.perPage, pagination.offset]);
  return { comments, pagination };
}

async function listReviewsFeed({ search = '', sort = 'newest', page, perPage = 8 }) {
  let whereSql = 'WHERE 1 = 1';
  const params = [];

  if (search) {
    whereSql += ' AND (b.title LIKE ? OR c.name LIKE ? OR u.username LIKE ? OR c.content LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  const [[countRow]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM comments c
    INNER JOIN books b ON b.id = c.book_id
    LEFT JOIN users u ON u.id = c.user_id
    ${whereSql}
  `, params);
  const pagination = paginate({ page, totalItems: countRow.total, perPage });

  let orderSql = 'ORDER BY c.created_at DESC, c.id ASC';
  if (sort === 'oldest') orderSql = 'ORDER BY c.created_at ASC, c.id ASC';
  else if (sort === 'rating_high') orderSql = 'ORDER BY c.rating DESC, c.created_at DESC, c.id ASC';
  else if (sort === 'rating_low') orderSql = 'ORDER BY c.rating ASC, c.created_at DESC, c.id ASC';

  const [reviews] = await db.query(`
    SELECT
      c.id, c.book_id, c.user_id, c.name, c.email, c.content, c.rating, c.created_at,
      u.username,
      b.title AS book_title, a.name AS book_author, b.cover_image AS book_cover_image
    FROM comments c
    INNER JOIN books b ON b.id = c.book_id
    JOIN authors a ON a.id = b.author_id
    LEFT JOIN users u ON u.id = c.user_id
    ${whereSql}
    ${orderSql}
    LIMIT ? OFFSET ?
  `, [...params, pagination.perPage, pagination.offset]);

  return { reviews, pagination };
}

async function deleteComment(id) {
  const [result] = await db.query('DELETE FROM comments WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  listForBook,
  getRatingStats,
  createComment,
  getCommentById,
  updateComment,
  listAllPaginated,
  listReviewsFeed,
  deleteComment
};
