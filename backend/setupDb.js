const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://portfolio_db_nve3_user:6kE88e2gtxiP0XvKdwnilat5pKHLj3Dn@dpg-d2pan756ubrc73c4d8dg-a.oregon-postgres.render.com/portfolio_db_nve3",
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  await client.connect();
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      passwordhash VARCHAR(255) NOT NULL
    )
  `);
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image VARCHAR(255),
      link VARCHAR(255)
    )
  `);
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS certifications (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      provider VARCHAR(255),
      year INTEGER,
      image VARCHAR(255)
    )
  `);
  
  console.log("Tables created successfully!");
  await client.end();
}

setupDatabase().catch(console.error);
