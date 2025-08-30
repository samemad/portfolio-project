import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
});

// Interceptor to add token from localStorage automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper for image URLs (removes '/api' to get server base, as images are likely served from root)
export const getImageUrl = (path) => {
  const base = API_BASE.replace("/api", "");
  return `${base}${path}`;
};

export const login = async (username, password) => {
  const res = await api.post("/login", { username, password });
  return res.data;
};

export const getProjects = async () => {
  const res = await api.get("/projects");
  return res.data;
};

export const addProject = async (formData) => {
  const res = await api.post("/projects", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteProject = async (id) => {
  const res = await api.delete(`/projects/${id}`);
  return res.data;
};

export const getCertifications = async () => {
  const res = await api.get("/certifications");
  return res.data;
};

export const addCertification = async (formData) => {
  const res = await api.post("/certifications", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteCertification = async (id) => {
  const res = await api.delete(`/certifications/${id}`);
  return res.data;
};

export const updateProject = async (id, formData) => {
  const res = await api.put(`/projects/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateCertification = async (id, formData) => {
  const res = await api.put(`/certifications/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};