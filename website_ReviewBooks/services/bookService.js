// Nghiệp vụ CRUD sách: tìm kiếm, lọc, sắp xếp, phân trang, sách liên quan
const db = require('../config/db');
const { paginate } = require('../utils/pagination');

const RATING_SELECT = `
  b.*,
  a.name AS author,
  a.avatar AS author_avatar,
  a.bio AS author_bio,
  COALESCE(ROUND(AVG(c.rating), 1), 0) AS average_rating,
  COUNT(c.id) AS comment_count
`;
const AUTHOR_JOIN = 'JOIN authors a ON a.id = b.author_id';

async function attachTags(books) {
  if (books.length === 0) return books;

  const ids = books.map((b) => b.id);
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await db.query(
    `SELECT bc.book_id, cat.id, cat.name
     FROM book_categories bc
     JOIN categories cat ON cat.id = bc.category_id
     WHERE bc.book_id IN (${placeholders})
     ORDER BY cat.name ASC`,
    ids
  );

  const tagsByBook = {};
  rows.forEach((row) => {
    if (!tagsByBook[row.book_id]) tagsByBook[row.book_id] = [];
    tagsByBook[row.book_id].push({ id: row.id, name: row.name });
  });

  books.forEach((book) => {
    book.tags = tagsByBook[book.id] || [];
  });

  return books;
}

async function setBookCategories(bookId, categoryIds) {
  await db.query('DELETE FROM book_categories WHERE book_id = ?', [bookId]);
  if (categoryIds.length === 0) return;

  const values = categoryIds.map((categoryId) => [bookId, categoryId]);
  await db.query('INSERT INTO book_categories (book_id, category_id) VALUES ?', [values]);
}

async function listNewest(limit = 6) {
  const [books] = await db.query(`
    SELECT ${RATING_SELECT}
    FROM books b
    ${AUTHOR_JOIN}
    LEFT JOIN comments c ON c.book_id = b.id
    GROUP BY b.id
    ORDER BY b.created_at DESC, b.id ASC
    LIMIT ?
  `, [limit]);
  return attachTags(books);
}

async function searchBooks({ search = '', category = '', sort = 'newest', page, perPage = 6 }) {
  let whereSql = 'WHERE 1 = 1';
  const params = [];

  if (search) {
    whereSql += ' AND (b.title LIKE ? OR a.name LIKE ? OR b.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (category) {
    whereSql += ` AND EXISTS (
      SELECT 1 FROM book_categories bc
      JOIN categories cat ON cat.id = bc.category_id
      WHERE bc.book_id = b.id AND cat.name = ?
    )`;
    params.push(category);
  }

  const [[countRow]] = await db.query(`SELECT COUNT(*) AS total FROM books b ${AUTHOR_JOIN} ${whereSql}`, params);
  const pagination = paginate({ page, totalItems: countRow.total, perPage });

  // Luôn thêm b.id làm tiêu chí phân biệt cuối cùng — nhiều sách có thể trùng
  // created_at/rating (vd. seed cùng lúc), nếu không có id, MySQL không đảm bảo
  // thứ tự ổn định giữa các lần LIMIT/OFFSET riêng biệt (đổi trang), gây trùng/sót dòng.
  let orderSql = 'ORDER BY b.created_at DESC, b.id ASC';
  if (sort === 'rating') orderSql = 'ORDER BY average_rating DESC, b.created_at DESC, b.id ASC';
  else if (sort === 'title') orderSql = 'ORDER BY b.title ASC, b.id ASC';

  const [books] = await db.query(`
    SELECT ${RATING_SELECT}
    FROM books b
    ${AUTHOR_JOIN}
    LEFT JOIN comments c ON c.book_id = b.id
    ${whereSql}
    GROUP BY b.id
    ${orderSql}
    LIMIT ? OFFSET ?
  `, [...params, pagination.perPage, pagination.offset]);

  await attachTags(books);

  return { books, pagination };
}

async function getBookById(id) {
  const [rows] = await db.query(
    `SELECT b.*, a.name AS author, a.avatar AS author_avatar, a.bio AS author_bio
     FROM books b
     ${AUTHOR_JOIN}
     WHERE b.id = ?`,
    [id]
  );
  const book = rows[0];
  if (!book) return null;
  await attachTags([book]);
  return book;
}

async function getRelatedBooks(bookId, limit = 6) {
  const [related] = await db.query(`
    SELECT b.id, b.title, b.cover_image, MAX(b.created_at) AS created_at
    FROM books b
    JOIN book_categories bc ON bc.book_id = b.id
    WHERE b.id != ?
      AND bc.category_id IN (SELECT category_id FROM book_categories WHERE book_id = ?)
    GROUP BY b.id, b.title, b.cover_image
    ORDER BY created_at DESC, b.id ASC
    LIMIT ?
  `, [bookId, bookId, limit]);

  if (related.length >= limit) return related;

  const excludeIds = [bookId, ...related.map((b) => b.id)];
  const placeholders = excludeIds.map(() => '?').join(',');
  const [fallback] = await db.query(`
    SELECT id, title, cover_image
    FROM books
    WHERE id NOT IN (${placeholders})
    ORDER BY created_at DESC, id ASC
    LIMIT ?
  `, [...excludeIds, limit - related.length]);

  return [...related, ...fallback];
}

async function listAllForAdmin({ search = '', category = '', sort = 'updated', page, perPage = 10 }) {
  let whereSql = 'WHERE 1 = 1';
  const params = [];

  if (search) {
    whereSql += ' AND (b.title LIKE ? OR a.name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    whereSql += ` AND EXISTS (
      SELECT 1 FROM book_categories bc
      JOIN categories cat ON cat.id = bc.category_id
      WHERE bc.book_id = b.id AND cat.name = ?
    )`;
    params.push(category);
  }

  const [[countRow]] = await db.query(`SELECT COUNT(*) AS total FROM books b ${AUTHOR_JOIN} ${whereSql}`, params);
  const pagination = paginate({ page, totalItems: countRow.total, perPage });

  // Thêm b.id làm tiêu chí phân biệt cuối cùng ở mọi kiểu sắp xếp — bắt buộc để
  // phân trang không bị trùng/sót dòng khi nhiều sách trùng giá trị sắp xếp
  // (vd. 28/30 sách seed cùng lúc nên trùng hệt updated_at).
  let orderSql = 'ORDER BY b.updated_at DESC, b.created_at DESC, b.id ASC';
  if (sort === 'title') orderSql = 'ORDER BY b.title ASC, b.id ASC';
  else if (sort === 'newest') orderSql = 'ORDER BY b.created_at DESC, b.id ASC';
  else if (sort === 'author') orderSql = 'ORDER BY a.name ASC, b.title ASC, b.id ASC';

  const [books] = await db.query(
    `SELECT b.*, a.name AS author
     FROM books b
     ${AUTHOR_JOIN}
     ${whereSql}
     ${orderSql}
     LIMIT ? OFFSET ?`,
    [...params, pagination.perPage, pagination.offset]
  );
  await attachTags(books);
  return { books, pagination };
}

async function createBook(values) {
  const [result] = await db.query(
    `INSERT INTO books
      (title, author_id, cover_image, description, review_content, language, publish_year, page_count, publisher, translator)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      values.title, values.authorId, values.cover_image, values.description, values.review_content,
      values.language, values.publish_year, values.page_count, values.publisher, values.translator
    ]
  );
  await setBookCategories(result.insertId, values.categoryIds);
  return result.insertId;
}

async function updateBook(id, values) {
  const [result] = await db.query(
    `UPDATE books
     SET title = ?, author_id = ?, cover_image = ?, description = ?, review_content = ?,
         language = ?, publish_year = ?, page_count = ?, publisher = ?, translator = ?, updated_at = NOW()
     WHERE id = ?`,
    [
      values.title, values.authorId, values.cover_image, values.description, values.review_content,
      values.language, values.publish_year, values.page_count, values.publisher, values.translator, id
    ]
  );
  if (result.affectedRows > 0) {
    await setBookCategories(id, values.categoryIds);
  }
  return result.affectedRows > 0;
}

async function deleteBook(id) {
  const [result] = await db.query('DELETE FROM books WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  listNewest,
  searchBooks,
  getBookById,
  getRelatedBooks,
  listAllForAdmin,
  createBook,
  updateBook,
  deleteBook
};
