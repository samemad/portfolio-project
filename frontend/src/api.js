const API_BASE = 'https://portfolio-project-p04q.onrender.com/api';

export const getProjects = async () => {
  const res = await fetch(`${API_BASE}/projects`);
  return res.json();
};

export const addProject = async (data, token) => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('link', data.link);
  if (data.image) formData.append('image', data.image);

  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.json();
};

export const updateProject = async (id, data, token) => {
  const formData = new FormData();
   if (data.title) formData.append('title', data.title);
   if (data.description) formData.append('description', data.description);
   if (data.link) formData.append('link', data.link);
   if (data.image) formData.append('image', data.image);

  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
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

export const addCertification = async (data, token) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('provider', data.provider);
  formData.append('year', data.year);
  if (data.image) formData.append('image', data.image);

  const res = await fetch(`${API_BASE}/certifications`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.json();
};

export const updateCertification = async (id, data, token) => {
  const formData = new FormData();
  if (data.title) formData.append('name', data.name);
  if (data.description) formData.append('provider', data.provider);
  if (data.link) formData.append('year', data.year);
  if (data.image) formData.append('image', data.image);

  const res = await fetch(`${API_BASE}/certifications/${id}`, {
    method: 'PUT',
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