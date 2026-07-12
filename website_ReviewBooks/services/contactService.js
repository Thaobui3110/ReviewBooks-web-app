const db = require('../config/db');
const { paginate } = require('../utils/pagination');

async function create(values) {
  await db.query(
    'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
    [values.name, values.email, values.subject, values.message]
  );
}

async function listPaginated({ page, perPage = 10 }) {
  const [[countRow]] = await db.query('SELECT COUNT(*) AS total FROM contacts');
  const pagination = paginate({ page, totalItems: countRow.total, perPage });
  const [contacts] = await db.query(
    'SELECT * FROM contacts ORDER BY created_at DESC, id ASC LIMIT ? OFFSET ?',
    [pagination.perPage, pagination.offset]
  );
  return { contacts, pagination };
}

module.exports = { create, listPaginated };
