const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // Restrict to admin frontend origin
  credentials: true
}));
app.use(express.json());

console.log('🔧 Server starting...');
console.log('Environment variables loaded:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET); // Verify secret is loaded

// ---------------- UPLOADS -----------------
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath);
app.use('/uploads', express.static(uploadsPath)); // Completed the static serving configuration

// ---------------- MYSQL -----------------
console.log('🔄 Connecting to MySQL...');
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('❌ MySQL connection error:', err);
    console.error('Make sure MySQL is running and database exists!');
    process.exit(1);
  }
  console.log('✅ MySQL Connected successfully');
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
  console.log('Login attempt for username:', username);
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (!result.length) return res.status(401).json({ message: 'User not found' });

    const user = result[0];
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log('Login successful, token generated:', token);
    res.json({ token });
  });
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Received Authorization header:', authHeader);
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  console.log('Extracted token for verification:', token);
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid token', error: err.message });
    }
    console.log('Token verified, userId:', decoded.id);
    req.userId = decoded.id;
    next();
  });
};

// ---------------- PROJECTS -----------------
app.get('/api/projects', (req, res) => {
  console.log('Fetching all projects');
  db.query('SELECT * FROM projects', (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json(result);
  });
});

app.post('/api/projects', verifyToken, upload.single('image'), (req, res) => {
  console.log('Adding project, body:', req.body, 'file:', req.file);
  const { title, description, link } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';
  db.query(
    'INSERT INTO projects (title, description, image, link) VALUES (?, ?, ?, ?)',
    [title, description, image, link],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json({ message: 'Project added', id: result.insertId });
    }
  );
});

app.put('/api/projects/:id', verifyToken, upload.single('image'), (req, res) => {
  console.log('Updating project with ID:', req.params.id, 'body:', req.body, 'file:', req.file);
  const { title, description, link } = req.body;
  const newImage = req.file ? `/uploads/${req.file.filename}` : undefined;
  db.query('SELECT image FROM projects WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    const oldImage = result[0]?.image;
    const updateFields = [title || null, description || null, newImage || oldImage || null, link || null, req.params.id];
    db.query(
      'UPDATE projects SET title = ?, description = ?, image = ?, link = ? WHERE id = ?',
      updateFields,
      (err) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        if (newImage && oldImage && fs.existsSync(path.join(__dirname, 'uploads', path.basename(oldImage)))) {
          fs.unlink(path.join(__dirname, 'uploads', path.basename(oldImage)), (err) => {
            if (err) console.error('Failed to delete old image:', err);
            else console.log('Old image deleted:', oldImage);
          });
        }
        res.json({ message: 'Project updated' });
      }
    );
  });
});

app.delete('/api/projects/:id', verifyToken, (req, res) => {
  console.log('Deleting project with ID:', req.params.id);
  db.query('SELECT image FROM projects WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (result.length && result[0].image) {
      const imagePath = path.join(__dirname, 'uploads', path.basename(result[0].image));
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error('Failed to delete image:', err);
          else console.log('Image deleted:', imagePath);
        });
      }
    }
    db.query('DELETE FROM projects WHERE id = ?', [req.params.id], (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json({ message: 'Project deleted' });
    });
  });
});

// ---------------- CERTIFICATIONS -----------------
app.get('/api/certifications', (req, res) => {
  console.log('Fetching all certifications');
  db.query('SELECT * FROM certifications', (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json(result);
  });
});

app.post('/api/certifications', verifyToken, upload.single('image'), (req, res) => {
  console.log('Adding certification, body:', req.body, 'file:', req.file);
  const { name, provider, year } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';
  db.query(
    'INSERT INTO certifications (name, provider, year, image) VALUES (?, ?, ?, ?)',
    [name, provider, year, image],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json({ message: 'Certification added', id: result.insertId });
    }
  );
});

app.put('/api/certifications/:id', verifyToken, upload.single('image'), (req, res) => {
  console.log('Updating certification with ID:', req.params.id, 'body:', req.body, 'file:', req.file);
  const { name, provider, year } = req.body;
  const newImage = req.file ? `/uploads/${req.file.filename}` : undefined;
  db.query('SELECT image FROM certifications WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    const oldImage = result[0]?.image;
    const updateFields = [name || null, provider || null, year || null, newImage || oldImage || null, req.params.id];
    db.query(
      'UPDATE certifications SET name = ?, provider = ?, year = ?, image = ? WHERE id = ?',
      updateFields,
      (err) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        if (newImage && oldImage && fs.existsSync(path.join(__dirname, 'uploads', path.basename(oldImage)))) {
          fs.unlink(path.join(__dirname, 'uploads', path.basename(oldImage)), (err) => {
            if (err) console.error('Failed to delete old image:', err);
            else console.log('Old image deleted:', oldImage);
          });
        }
        res.json({ message: 'Certification updated' });
      }
    );
  });
});

app.delete('/api/certifications/:id', verifyToken, (req, res) => {
  console.log('Deleting certification with ID:', req.params.id);
  db.query('SELECT image FROM certifications WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (result.length && result[0].image) {
      const imagePath = path.join(__dirname, 'uploads', path.basename(result[0].image));
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error('Failed to delete image:', err);
          else console.log('Image deleted:', imagePath);
        });
      }
    }
    db.query('DELETE FROM certifications WHERE id = ?', [req.params.id], (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json({ message: 'Certification deleted' });
    });
  });
});

// ---------------- SERVE FRONTEND & ADMIN -----------------
const frontendBuildPath = path.join(__dirname, '../frontend/build');
const adminBuildPath = path.join(__dirname, '../admin/build');

console.log('📁 Build paths:');
console.log('Frontend build path:', frontendBuildPath);
console.log('Admin build path:', adminBuildPath);
console.log('Frontend build exists:', fs.existsSync(frontendBuildPath));
console.log('Admin build exists:', fs.existsSync(adminBuildPath));

if (fs.existsSync(frontendBuildPath)) {
  console.log('✅ Serving frontend static files');
  app.use(express.static(frontendBuildPath));
} else {
  console.log('❌ Frontend build folder not found!');
}

if (fs.existsSync(adminBuildPath)) {
  console.log('✅ Serving admin static files at /admin');
  app.use('/admin', express.static(adminBuildPath));
} else {
  console.log('❌ Admin build folder not found!');
}

// ---------------- REACT ROUTER FALLBACK -----------------
app.get('/admin/*', (req, res) => {
  const indexFile = path.join(adminBuildPath, 'index.html');
  console.log('📄 Serving admin index.html for route:', req.path);
  return fs.existsSync(indexFile) ? res.sendFile(indexFile) : res.status(404).send('Admin not found');
});

app.get('*', (req, res) => {
  const indexFile = path.join(frontendBuildPath, 'index.html');
  console.log('📄 Serving frontend index.html for route:', req.path);
  return fs.existsSync(indexFile) ? res.sendFile(indexFile) : res.status(404).send('Frontend not found');
});

// ---------------- START SERVER -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}/`);
  console.log(`🔧 Admin: http://localhost:${PORT}/admin/`);
});