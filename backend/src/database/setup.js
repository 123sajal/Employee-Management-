const fs   = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function setup() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    console.log('⏳  Running database setup...');
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await conn.query(sql);
    console.log('✅  Database setup complete!');
    console.log('👤  Default admin credentials:');
    console.log('    Email:    admin@ems.com');
    console.log('    Password: Admin@123');
  } catch (err) {
    console.error('❌  Setup failed:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

setup();
