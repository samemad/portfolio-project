const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  connectionString: "postgresql://portfolio_db_nve3_user:6kE88e2gtxiP0XvKdwnilat5pKHLj3Dn@dpg-d2pan756ubrc73c4d8dg-a.oregon-postgres.render.com/portfolio_db_nve3",
  ssl: { rejectUnauthorized: false }
});

async function createAdminUser() {
  const username = 'admin';
  const password = '775194119saM'; // Your password
  const hash = bcrypt.hashSync(password, 10);
  
  await client.connect();
  
  try {
    await client.query('INSERT INTO users (username, passwordhash) VALUES ($1, $2)', [username, hash]);
    console.log('Admin user created successfully');
  } catch (err) {
    if (err.code === '23505') {
      console.log('Admin user already exists');
    } else {
      throw err;
    }
  }
  
  await client.end();
}

createAdminUser().catch(console.error);
