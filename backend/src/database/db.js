const mysql = require('mysql2/promise');

require('dotenv').config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT || '3306', 10),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'employee_management_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
});

async function testConnection() {
  const conn = await pool.getConnection();
  console.log('✅  MySQL connected');
  conn.release();
}

module.exports = { pool, testConnection };
