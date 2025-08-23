import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

// Existing functions
export const getProjects = () => API.get("/projects");
export const getCertifications = () => API.get("/certifications");
export const addProject = (data) => API.post("/projects", data);
export const addCertification = (data) => API.post("/certifications", data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);
export const deleteCertification = (id) => API.delete(`/certifications/${id}`);
export const login = (data) => API.post("/login", data);

// Keep the default export for backwards compatibility
export default API;
