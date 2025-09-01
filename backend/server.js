const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// ---------------- CLOUDINARY CONFIG -----------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(cors({
  origin: ["https://devsam.icu", "https://portfolio-project-p04q.onrender.com"],
  credentials: true
}));

app.use(express.json());

console.log('🚀 Server starting...');
console.log('Environment variables loaded:');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);

// ---------------- MULTER (Updated for memory storage) -----------------
const storage = multer.memoryStorage(); // Changed from diskStorage to memoryStorage
const upload = multer({ storage });

// ---------------- POSTGRESQL -----------------
console.log('🔌 Connecting to PostgreSQL...');
const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

db.connect()
  .then(() => console.log('✅ PostgreSQL Connected successfully'))
  .catch(err => {
    console.error('❌ PostgreSQL connection error:', err);
    console.error('Make sure PostgreSQL is running and database exists!');
    process.exit(1);
  });

// ---------------- HELPER FUNCTION FOR CLOUDINARY UPLOAD -----------------
const uploadToCloudinary = (buffer, folder = 'portfolio') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: folder,
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
};

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
  
  let image = '';
  if (req.file) {
    try {
      image = await uploadToCloudinary(req.file.buffer, 'projects');
      console.log('Image uploaded to Cloudinary:', image);
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return res.status(500).json({ message: 'Image upload failed', error: error.message });
    }
  }
  
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
  
  try {
    const result = await db.query('SELECT image FROM projects WHERE id = $1', [req.params.id]);
    let newImage = result.rows[0]?.image; // Keep old image by default
    
    if (req.file) {
      try {
        newImage = await uploadToCloudinary(req.file.buffer, 'projects');
        console.log('New image uploaded to Cloudinary:', newImage);
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ message: 'Image upload failed', error: error.message });
      }
    }
    
    const updateFields = [title || null, description || null, newImage || null, link || null, req.params.id];
    
    await db.query(
      'UPDATE projects SET title = $1, description = $2, image = $3, link = $4 WHERE id = $5',
      updateFields
    );
    
    res.json({ message: 'Project updated' });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.delete('/api/projects/:id', verifyToken, async (req, res) => {
  console.log('Deleting project with ID:', req.params.id);
  try {
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
  
  let image = '';
  if (req.file) {
    try {
      image = await uploadToCloudinary(req.file.buffer, 'certifications');
      console.log('Image uploaded to Cloudinary:', image);
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return res.status(500).json({ message: 'Image upload failed', error: error.message });
    }
  }
  
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
  
  try {
    const result = await db.query('SELECT image FROM certifications WHERE id = $1', [req.params.id]);
    let newImage = result.rows[0]?.image; // Keep old image by default
    
    if (req.file) {
      try {
        newImage = await uploadToCloudinary(req.file.buffer, 'certifications');
        console.log('New image uploaded to Cloudinary:', newImage);
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ message: 'Image upload failed', error: error.message });
      }
    }
    
    const updateFields = [name || null, provider || null, year || null, newImage || null, req.params.id];
    
    await db.query(
      'UPDATE certifications SET name = $1, provider = $2, year = $3, image = $4 WHERE id = $5',
      updateFields
    );
    
    res.json({ message: 'Certification updated' });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.delete('/api/certifications/:id', verifyToken, async (req, res) => {
  console.log('Deleting certification with ID:', req.params.id);
  try {
    await db.query('DELETE FROM certifications WHERE id = $1', [req.params.id]);
    res.json({ message: 'Certification deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ---------------- SERVE FRONTEND & ADMIN -----------------
const frontendBuildPath = path.join(__dirname, '../frontend/build');

console.log('📁 Build paths:');
console.log('Frontend build path:', frontendBuildPath);
console.log('Frontend build exists:', fs.existsSync(frontendBuildPath));

if (fs.existsSync(frontendBuildPath)) {
  console.log('✅ Serving frontend static files');
  app.use(express.static(frontendBuildPath));
} else {
  console.log('❌ Frontend build folder not found!');
}

app.get('*', (req, res) => {
  const indexFile = path.join(frontendBuildPath, 'index.html');
  console.log('🌐 Serving frontend index.html for route:', req.path);
  return fs.existsSync(indexFile) ? res.sendFile(indexFile) : res.status(404).send('Frontend not found');
});

// ---------------- START SERVER -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Frontend: http://localhost:${PORT}/`);
  console.log(`⚡ Admin: http://localhost:${PORT}/admin/`);
});