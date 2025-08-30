const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const cors = require("cors");

app.use(cors({
  origin: ["https://devsam.icu", "https://portfolio-project-p04q.onrender.com"],
  credentials: true
}));

app.use(express.json());

console.log('ًں”§ Server starting...');
console.log('Environment variables loaded:');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET); // Verify secret is loaded

// ---------------- UPLOADS -----------------
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath);
app.use('/uploads', express.static(uploadsPath)); // Completed the static serving configuration

// ---------------- POSTGRESQL -----------------
console.log('ًں”„ Connecting to PostgreSQL...');
const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

db.connect()
  .then(() => console.log('âœ… PostgreSQL Connected successfully'))
  .catch(err => {
    console.error('â‌Œ PostgreSQL connection error:', err);
    console.error('Make sure PostgreSQL is running and database exists!');
    process.exit(1);
  });

// ---------------- MULTER -----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// ---------------- AUTH -----------------
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt for username:', username);
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (!result.rows.length) return res.status(401).json({ message: 'User not found' });

    const user = result.rows[0];
    if (!bcrypt.compareSync(password, user.passwordhash)) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log('Login successful, token generated:', token);
    res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
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
app.get('/api/projects', async (req, res) => {
  console.log('Fetching all projects');
  try {
    const result = await db.query('SELECT * FROM projects');
    res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.post('/api/projects', verifyToken, upload.single('image'), async (req, res) => {
  console.log('Adding project, body:', req.body, 'file:', req.file);
  const { title, description, link } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';
  try {
    const result = await db.query(
      'INSERT INTO projects (title, description, image, link) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, description, image, link]
    );
    res.json({ message: 'Project added', id: result.rows[0].id });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.put('/api/projects/:id', verifyToken, upload.single('image'), async (req, res) => {
  console.log('Updating project with ID:', req.params.id, 'body:', req.body, 'file:', req.file);
  const { title, description, link } = req.body;
  const newImage = req.file ? `/uploads/${req.file.filename}` : undefined;
  try {
    const result = await db.query('SELECT image FROM projects WHERE id = $1', [req.params.id]);
    const oldImage = result.rows[0]?.image;
    const updateFields = [title || null, description || null, newImage || oldImage || null, link || null, req.params.id];
    
    await db.query(
      'UPDATE projects SET title = $1, description = $2, image = $3, link = $4 WHERE id = $5',
      updateFields
    );
    
    if (newImage && oldImage && fs.existsSync(path.join(__dirname, 'uploads', path.basename(oldImage)))) {
      fs.unlink(path.join(__dirname, 'uploads', path.basename(oldImage)), (err) => {
        if (err) console.error('Failed to delete old image:', err);
        else console.log('Old image deleted:', oldImage);
      });
    }
    res.json({ message: 'Project updated' });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.delete('/api/projects/:id', verifyToken, async (req, res) => {
  console.log('Deleting project with ID:', req.params.id);
  try {
    const result = await db.query('SELECT image FROM projects WHERE id = $1', [req.params.id]);
    if (result.rows.length && result.rows[0].image) {
      const imagePath = path.join(__dirname, 'uploads', path.basename(result.rows[0].image));
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error('Failed to delete image:', err);
          else console.log('Image deleted:', imagePath);
        });
      }
    }
    await db.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ---------------- CERTIFICATIONS -----------------
app.get('/api/certifications', async (req, res) => {
  console.log('Fetching all certifications');
  try {
    const result = await db.query('SELECT * FROM certifications');
    res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.post('/api/certifications', verifyToken, upload.single('image'), async (req, res) => {
  console.log('Adding certification, body:', req.body, 'file:', req.file);
  const { name, provider, year } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';
  try {
    const result = await db.query(
      'INSERT INTO certifications (name, provider, year, image) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, provider, year, image]
    );
    res.json({ message: 'Certification added', id: result.rows[0].id });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.put('/api/certifications/:id', verifyToken, upload.single('image'), async (req, res) => {
  console.log('Updating certification with ID:', req.params.id, 'body:', req.body, 'file:', req.file);
  const { name, provider, year } = req.body;
  const newImage = req.file ? `/uploads/${req.file.filename}` : undefined;
  try {
    const result = await db.query('SELECT image FROM certifications WHERE id = $1', [req.params.id]);
    const oldImage = result.rows[0]?.image;
    const updateFields = [name || null, provider || null, year || null, newImage || oldImage || null, req.params.id];
    
    await db.query(
      'UPDATE certifications SET name = $1, provider = $2, year = $3, image = $4 WHERE id = $5',
      updateFields
    );
    
    if (newImage && oldImage && fs.existsSync(path.join(__dirname, 'uploads', path.basename(oldImage)))) {
      fs.unlink(path.join(__dirname, 'uploads', path.basename(oldImage)), (err) => {
        if (err) console.error('Failed to delete old image:', err);
        else console.log('Old image deleted:', oldImage);
      });
    }
    res.json({ message: 'Certification updated' });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.delete('/api/certifications/:id', verifyToken, async (req, res) => {
  console.log('Deleting certification with ID:', req.params.id);
  try {
    const result = await db.query('SELECT image FROM certifications WHERE id = $1', [req.params.id]);
    if (result.rows.length && result.rows[0].image) {
      const imagePath = path.join(__dirname, 'uploads', path.basename(result.rows[0].image));
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error('Failed to delete image:', err);
          else console.log('Image deleted:', imagePath);
        });
      }
    }
    await db.query('DELETE FROM certifications WHERE id = $1', [req.params.id]);
    res.json({ message: 'Certification deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ---------------- SERVE FRONTEND & ADMIN -----------------
const frontendBuildPath = path.join(__dirname, '../frontend/build');
const adminBuildPath = path.join(__dirname, '../admin/build');

console.log('ًں“پ Build paths:');
console.log('Frontend build path:', frontendBuildPath);
console.log('Admin build path:', adminBuildPath);
console.log('Frontend build exists:', fs.existsSync(frontendBuildPath));
console.log('Admin build exists:', fs.existsSync(adminBuildPath));

if (fs.existsSync(frontendBuildPath)) {
  console.log('âœ… Serving frontend static files');
  app.use(express.static(frontendBuildPath));
} else {
  console.log('â‌Œ Frontend build folder not found!');
}

if (fs.existsSync(adminBuildPath)) {
  console.log('âœ… Serving admin static files at /admin');
  app.use('/admin', express.static(adminBuildPath));
} else {
  console.log('â‌Œ Admin build folder not found!');
}

// ---------------- REACT ROUTER FALLBACK -----------------
app.get('/admin/*', (req, res) => {
  const indexFile = path.join(adminBuildPath, 'index.html');
  console.log('ًں“„ Serving admin index.html for route:', req.path);
  return fs.existsSync(indexFile) ? res.sendFile(indexFile) : res.status(404).send('Admin not found');
});

app.get('*', (req, res) => {
  const indexFile = path.join(frontendBuildPath, 'index.html');
  console.log('ًں“„ Serving frontend index.html for route:', req.path);
  return fs.existsSync(indexFile) ? res.sendFile(indexFile) : res.status(404).send('Frontend not found');
});

// ---------------- START SERVER -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ًںڑ€ Server running on port ${PORT}`);
  console.log(`ًںŒگ Frontend: http://localhost:${PORT}/`);
  console.log(`ًں”§ Admin: http://localhost:${PORT}/admin/`);
});
