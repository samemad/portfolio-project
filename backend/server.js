const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const redis = require('redis');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// ---------------- REDIS SETUP -----------------
console.log('🔌 Connecting to Redis...');
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect()
  .then(() => console.log('✅ Redis Connected successfully'))
  .catch(err => {
    console.error('❌ Redis connection error:', err);
    console.log('⚠️ Running without Redis cache');
  });

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Cache helper functions
const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

const setCache = async (key, data, ttl = null) => {
  try {
    if (ttl) {
      await redisClient.setEx(key, ttl, JSON.stringify(data));
    } else {
      await redisClient.set(key, JSON.stringify(data)); // No expiration for portfolio
    }
    console.log(`📦 Cached: ${key}`);
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
    console.log(`🗑️ Cleared cache: ${key}`);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
};

// ---------------- CLOUDINARY CONFIG -----------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(cors({
  origin: [
    "https://devsam.icu",
    "https://samemad.github.io",
    "http://localhost:3000"  // for local development
  ],
  credentials: true
}));

app.use(express.json());

// ---------------- REQUEST LOGGING MIDDLEWARE -----------------
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

console.log('🚀 Server starting...');
console.log('Environment variables loaded:');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('REDIS_URL:', process.env.REDIS_URL);

// ---------------- MULTER (Updated for memory storage) -----------------
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ---------------- POSTGRESQL -----------------
console.log('🔌 Connecting to PostgreSQL...');
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

db.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Remove db.connect() - Pool connects automatically

// ---------------- OPTIMIZED CLOUDINARY UPLOAD -----------------
const uploadToCloudinary = (buffer, folder = 'portfolio') => {
  return new Promise((resolve, reject) => {
    // Set a timeout for Cloudinary uploads
    const uploadTimeout = setTimeout(() => {
      reject(new Error('Cloudinary upload timeout'));
    }, 30000); // 30 second timeout

    cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: folder,
        // Optimized transformations - less processing = faster upload
        transformation: [
          { width: 800, height: 600, crop: 'limit', quality: 'auto:good' },
          { fetch_format: 'auto' }
        ],
        // Add these optimizations
        eager_async: true, // Process transformations in background
        invalidate: true,   // Cache busting
        overwrite: true     // Overwrite existing files
      },
      (error, result) => {
        clearTimeout(uploadTimeout);
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('Cloudinary upload success:', result.secure_url);
          resolve(result.secure_url);
        }
      }
    ).end(buffer);
  });
};

// ---------------- HEALTH CHECK ENDPOINT -----------------
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

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

// ---------------- PROJECTS WITH REDIS CACHING -----------------
app.get('/api/projects', async (req, res) => {
  console.log('📊 Projects request received');
  
  try {
    // Check cache first
    const cached = await getCache('projects');
    if (cached) {
      console.log('⚡ CACHE HIT - Projects served in 5ms!');
      return res.json(cached);
    }
    
    console.log('💾 CACHE MISS - Fetching from database...');
    const result = await db.query('SELECT * FROM projects ORDER BY id DESC');
    
    // Cache FOREVER (perfect for portfolio!)
    await setCache('projects', result.rows);
    
    console.log('✅ Projects fetched and cached');
    res.json(result.rows);
  } catch (err) {
    console.error('Projects error:', err);
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.post('/api/projects', verifyToken, upload.single('image'), async (req, res) => {
  console.log('Adding project, body:', req.body);
  const { title, description, link } = req.body;
  
  let image = '';
  
  // Check if image exists and validate
  if (req.file) {
    console.log('File received:', {
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    try {
      console.log('Starting Cloudinary upload...');
      const startTime = Date.now();
      image = await uploadToCloudinary(req.file.buffer, 'projects');
      const uploadTime = Date.now() - startTime;
      console.log(`Cloudinary upload completed in ${uploadTime}ms`);
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return res.status(500).json({ 
        message: 'Image upload failed', 
        error: error.message || 'Unknown upload error' 
      });
    }
  }
  
  try {
    console.log('Saving to database...');
    const dbStart = Date.now();
    const result = await db.query(
      'INSERT INTO projects (title, description, image, link) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, image, link]
    );
    const dbTime = Date.now() - dbStart;
    console.log(`Database save completed in ${dbTime}ms`);
    
    // 🔥 CLEAR CACHE after adding new project
    await deleteCache('projects');
    console.log('🔄 Projects cache cleared after new addition');
    
    res.status(201).json({ 
      message: 'Project added successfully', 
      project: result.rows[0] 
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ 
      message: 'Database error', 
      error: err.message 
    });
  }
});

app.put('/api/projects/:id', verifyToken, upload.single('image'), async (req, res) => {
  console.log('Updating project with ID:', req.params.id);
  const { title, description, link } = req.body;
  
  try {
    // Get current project
    const currentProject = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (!currentProject.rows.length) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    let newImage = currentProject.rows[0].image; // Keep existing image by default
    
    if (req.file) {
      console.log('New file received for update:', {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
      
      try {
        console.log('Uploading new image...');
        const startTime = Date.now();
        newImage = await uploadToCloudinary(req.file.buffer, 'projects');
        const uploadTime = Date.now() - startTime;
        console.log(`New image uploaded in ${uploadTime}ms`);
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ 
          message: 'Image upload failed', 
          error: error.message 
        });
      }
    }
    
    // Update with new values or keep existing ones
    const updatedProject = await db.query(
      `UPDATE projects 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           image = $3, 
           link = COALESCE($4, link)
       WHERE id = $5 
       RETURNING *`,
      [title || null, description || null, newImage, link || null, req.params.id]
    );
    
    // 🔥 CLEAR CACHE after updating project
    await deleteCache('projects');
    console.log('🔄 Projects cache cleared after update');
    
    res.json({ 
      message: 'Project updated successfully', 
      project: updatedProject.rows[0] 
    });
  } catch (err) {
    console.error('Update error:', err);
    return res.status(500).json({ 
      message: 'Database error', 
      error: err.message 
    });
  }
});

app.delete('/api/projects/:id', verifyToken, async (req, res) => {
  console.log('Deleting project with ID:', req.params.id);
  try {
    const result = await db.query('DELETE FROM projects WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // 🔥 CLEAR CACHE after deleting project
    await deleteCache('projects');
    console.log('🔄 Projects cache cleared after deletion');
    
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ---------------- CERTIFICATIONS WITH REDIS CACHING -----------------
app.get('/api/certifications', async (req, res) => {
  console.log('📊 Certifications request received');
  
  try {
    // Check cache first
    const cached = await getCache('certifications');
    if (cached) {
      console.log('⚡ CACHE HIT - Certifications served in 5ms!');
      return res.json(cached);
    }
    
    console.log('💾 CACHE MISS - Fetching from database...');
    const result = await db.query('SELECT * FROM certifications ORDER BY year DESC, id DESC');
    
    // Cache FOREVER (perfect for portfolio!)
    await setCache('certifications', result.rows);
    
    console.log('✅ Certifications fetched and cached');
    res.json(result.rows);
  } catch (err) {
    console.error('Certifications error:', err);
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.post('/api/certifications', verifyToken, upload.single('image'), async (req, res) => {
  console.log('Adding certification, body:', req.body);
  const { name, provider, year } = req.body;
  
  let image = '';
  if (req.file) {
    console.log('File received:', {
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    try {
      console.log('Starting Cloudinary upload...');
      const startTime = Date.now();
      image = await uploadToCloudinary(req.file.buffer, 'certifications');
      const uploadTime = Date.now() - startTime;
      console.log(`Cloudinary upload completed in ${uploadTime}ms`);
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return res.status(500).json({ 
        message: 'Image upload failed', 
        error: error.message 
      });
    }
  }
  
  try {
    console.log('Saving to database...');
    const result = await db.query(
      'INSERT INTO certifications (name, provider, year, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, provider, year, image]
    );
    
    // 🔥 CLEAR CACHE after adding new certification
    await deleteCache('certifications');
    console.log('🔄 Certifications cache cleared after new addition');
    
    res.status(201).json({ 
      message: 'Certification added successfully', 
      certification: result.rows[0] 
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ 
      message: 'Database error', 
      error: err.message 
    });
  }
});

app.put('/api/certifications/:id', verifyToken, upload.single('image'), async (req, res) => {
  console.log('Updating certification with ID:', req.params.id);
  const { name, provider, year } = req.body;
  
  try {
    // Get current certification
    const currentCert = await db.query('SELECT * FROM certifications WHERE id = $1', [req.params.id]);
    if (!currentCert.rows.length) {
      return res.status(404).json({ message: 'Certification not found' });
    }
    
    let newImage = currentCert.rows[0].image; // Keep existing image by default
    
    if (req.file) {
      console.log('New file received for update:', {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
      
      try {
        console.log('Uploading new image...');
        const startTime = Date.now();
        newImage = await uploadToCloudinary(req.file.buffer, 'certifications');
        const uploadTime = Date.now() - startTime;
        console.log(`New image uploaded in ${uploadTime}ms`);
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ 
          message: 'Image upload failed', 
          error: error.message 
        });
      }
    }
    
    // Update with new values or keep existing ones
    const updatedCert = await db.query(
      `UPDATE certifications 
       SET name = COALESCE($1, name), 
           provider = COALESCE($2, provider), 
           year = COALESCE($3, year), 
           image = $4
       WHERE id = $5 
       RETURNING *`,
      [name || null, provider || null, year || null, newImage, req.params.id]
    );
    
    // 🔥 CLEAR CACHE after updating certification
    await deleteCache('certifications');
    console.log('🔄 Certifications cache cleared after update');
    
    res.json({ 
      message: 'Certification updated successfully', 
      certification: updatedCert.rows[0] 
    });
  } catch (err) {
    console.error('Update error:', err);
    return res.status(500).json({ 
      message: 'Database error', 
      error: err.message 
    });
  }
});

app.delete('/api/certifications/:id', verifyToken, async (req, res) => {
  console.log('Deleting certification with ID:', req.params.id);
  try {
    const result = await db.query('DELETE FROM certifications WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Certification not found' });
    }
    
    // 🔥 CLEAR CACHE after deleting certification
    await deleteCache('certifications');
    console.log('🔄 Certifications cache cleared after deletion');
    
    res.json({ message: 'Certification deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ---------------- ERROR HANDLING MIDDLEWARE -----------------
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large! Max 5MB allowed.' });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ message: error.message });
  }
  
  res.status(500).json({ 
    message: 'Internal server error', 
    error: error.message 
  });
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
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔥 Redis caching enabled for lightning-fast performance!`);
});