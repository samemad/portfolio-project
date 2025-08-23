const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const username = 'admin';
const password = 'yourpassword'; // CHANGE THIS
const hash = bcrypt.hashSync(password, 10);

db.query('INSERT INTO users (username, passwordHash) VALUES (?, ?)', [username, hash], (err) => {
  if (err) throw err;
  console.log('✅ Admin user created');
  db.end();
});
