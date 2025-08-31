const API_BASE = 'https://portfolio-project-p04q.onrender.com/api';

export const getProjects = async () => {
  const res = await fetch(`${API_BASE}/projects`);
  return res.json();
};

export const addProject = async (formData, token) => {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData, // use directly
  });
  return res.json();
};


export const updateProject = async (id, formData, token) => {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.json();
};

export const deleteProject = async (id, token) => {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getCertifications = async () => {
  const res = await fetch(`${API_BASE}/certifications`);
  return res.json();
};

// api.js
export const addCertification = async (formData, token) => {
  const res = await fetch(`${API_BASE}/certifications`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }, // do NOT set Content-Type, browser sets it automatically
    body: formData, // send FormData directly
  });
  return res.json();
};


export const updateCertification = async (id, formData, token) => {
  const res = await fetch(`${API_BASE}/certifications/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.json();
};

export const deleteCertification = async (id, token) => {
  const res = await fetch(`${API_BASE}/certifications/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const login = async (username, password) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
};

// Helper for image URLs
export const BACKEND_URL = API_BASE.replace(/\/api\/?$/, "");

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If imagePath already includes the full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  // Otherwise, prepend the backend URL
  return `${BACKEND_URL}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
};

// Default export for components that import API as default
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