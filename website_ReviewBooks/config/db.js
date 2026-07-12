const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'review_books',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Mặc định mysql2 trả cột DECIMAL/kết quả ROUND() dưới dạng chuỗi (vd. "5.0")
  // để tránh mất độ chính xác — bật cờ này để nhận về number JS thật (average_rating,
  // comments.rating...), cần cho mobile app tính toán/gọi .toFixed() trực tiếp.
  decimalNumbers: true
});

module.exports = pool;
