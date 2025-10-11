// api.js - Optimized version with timeouts and better error handling



const API_BASE = 'https://portfolio-project-production-a32d.up.railway.app/api';

// Add timeout wrapper for all requests
const fetchWithTimeout = async (url, options = {}, timeout = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
};

export const getProjects = async () => {
  const res = await fetchWithTimeout(`${API_BASE}/projects`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
};

export const addProject = async (formData, token, onProgress) => {
  // Optional progress callback for UI updates
  if (onProgress) onProgress({ status: 'uploading', message: 'Uploading image...' });
  
  const res = await fetchWithTimeout(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }, 45000); // Longer timeout for file uploads
  
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  
  if (onProgress) onProgress({ status: 'success', message: 'Upload complete!' });
  return res.json();
};

export const updateProject = async (id, formData, token, onProgress) => {
  if (onProgress) onProgress({ status: 'uploading', message: 'Updating project...' });
  
  const res = await fetchWithTimeout(`${API_BASE}/projects/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }, 45000);
  
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  
  if (onProgress) onProgress({ status: 'success', message: 'Update complete!' });
  return res.json();
};

export const deleteProject = async (id, token) => {
  const res = await fetchWithTimeout(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  return res.json();
};

export const getCertifications = async () => {
  const res = await fetchWithTimeout(`${API_BASE}/certifications`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
};

export const addCertification = async (formData, token, onProgress) => {
  if (onProgress) onProgress({ status: 'uploading', message: 'Uploading certification...' });
  
  const res = await fetchWithTimeout(`${API_BASE}/certifications`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }, 45000);
  
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  
  if (onProgress) onProgress({ status: 'success', message: 'Upload complete!' });
  return res.json();
};

export const updateCertification = async (id, formData, token, onProgress) => {
  if (onProgress) onProgress({ status: 'uploading', message: 'Updating certification...' });
  
  const res = await fetchWithTimeout(`${API_BASE}/certifications/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }, 45000);
  
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  
  if (onProgress) onProgress({ status: 'success', message: 'Update complete!' });
  return res.json();
};

export const deleteCertification = async (id, token) => {
  const res = await fetchWithTimeout(`${API_BASE}/certifications/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  return res.json();
};

export const login = async (username, password) => {
  const res = await fetchWithTimeout(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return res.json();
};

// Helper for image URLs
export const BACKEND_URL = API_BASE.replace(/\/api\/?$/, "");

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${BACKEND_URL}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
};

const API = {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  getCertifications,
  addCertification,
  updateCertification,
  deleteCertification,
  login,
  getImageUrl,
  BACKEND_URL
};

export default API;