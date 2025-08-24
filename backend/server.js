// backend/server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Only load local .env when NOT in Railway
if (process.env.RAILWAY_ENV !== "production") {
  require('dotenv').config();
}


const app = express();
app.use(cors());
app.use(express.json());

// ---------------- UPLOADS -----------------
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// ---------------- MYSQL -----------------
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err);
    process.exit(1);
  }
  console.log('✅ MySQL Connected');
});

// ---------------- MULTER -----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// ---------------- AUTH -----------------
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) return res.status(500).send(err);
    if (!result.length) return res.status(401).json({ message: 'User not found' });

    const user = result[0];
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  });
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.userId = decoded.id;
    next();
  });
};

// ---------------- PROJECTS -----------------
app.get('/api/projects', (req, res) => {
  db.query('SELECT * FROM projects', (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

app.post('/api/projects', verifyToken, upload.single('image'), (req, res) => {
  const { title, description, link } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';
  db.query(
    'INSERT INTO projects (title, description, image, link) VALUES (?, ?, ?, ?)',
    [title, description, image, link],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Project added', id: result.insertId });
    }
  );
});

app.delete('/api/projects/:id', verifyToken, (req, res) => {
  db.query('DELETE FROM projects WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Project deleted' });
  });
});

// ---------------- CERTIFICATIONS -----------------
app.get('/api/certifications', (req, res) => {
  db.query('SELECT * FROM certifications', (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

app.post('/api/certifications', verifyToken, upload.single('image'), (req, res) => {
  const { name, provider, year } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';
  db.query(
    'INSERT INTO certifications (name, provider, year, image) VALUES (?, ?, ?, ?)',
    [name, provider, year, image],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Certification added', id: result.insertId });
    }
  );
});

app.delete('/api/certifications/:id', verifyToken, (req, res) => {
  db.query('DELETE FROM certifications WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Certification deleted' });
  });
});

// ---------------- SERVE FRONTEND & ADMIN -----------------
const frontendBuildPath = path.join(__dirname, '../frontend/build');
const adminBuildPath = path.join(__dirname, '../admin/build');

if (fs.existsSync(frontendBuildPath)) app.use(express.static(frontendBuildPath));
if (fs.existsSync(adminBuildPath)) app.use('/admin', express.static(adminBuildPath));

// ---------------- REACT ROUTER FALLBACK -----------------
app.get('/admin/*', (req, res) => {
  const indexFile = path.join(adminBuildPath, 'index.html');
  return fs.existsSync(indexFile) ? res.sendFile(indexFile) : res.status(404).send('Admin not found');
});

app.get('*', (req, res) => {
  const indexFile = path.join(frontendBuildPath, 'index.html');
  return fs.existsSync(indexFile) ? res.sendFile(indexFile) : res.status(404).send('Frontend not found');
});

// ---------------- START SERVER -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
