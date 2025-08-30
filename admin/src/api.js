const API_BASE = process.env.REACT_APP_API_URL || 'https://portfolio-project-p04q.onrender.com/api';

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

