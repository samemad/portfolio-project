import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://portfolio-project-p04q.onrender.com/api"
});

// Projects
export const getProjects = () => API.get("/projects");
export const addProject = (data, token) => API.post("/projects", data, {
  headers: { Authorization: `Bearer ${token}` }
});
export const deleteProject = (id) => API.delete(`/projects/${id}`);

// Certifications
export const getCertifications = () => API.get("/certifications");
export const addCertification = (data, token) => API.post("/certifications", data, {
  headers: { Authorization: `Bearer ${token}` }
});
export const deleteCertification = (id) => API.delete(`/certifications/${id}`);

// Login
export const login = (data) => API.post("/login", data);

export default API;

// Helper for image URLs (remove trailing "/api")
export const BACKEND_URL = (process.env.REACT_APP_API_URL || "https://portfolio-project-p04q.onrender.com/api").replace(/\/api\/?$/, "");