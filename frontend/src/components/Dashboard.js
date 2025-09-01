import React, { useState, useEffect, useCallback } from "react";
import '../AdminDashboard.css'; // Combined new CSS
import {
  getProjects,
  getCertifications,
  deleteProject,
  deleteCertification,
  updateProject,
  updateCertification,
  getImageUrl,
} from "../api.js";
import AddProject from "./AddProject";
import AddCert from "./AddCert";

export default function Dashboard({ token }) {
  const [projects, setProjects] = useState([]);
  const [certs, setCerts] = useState([]);
  const [currentPage, setCurrentPage] = useState("welcome");
  const [editItem, setEditItem] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const projData = await getProjects();
      const certData = await getCertifications();
      setProjects(projData);
      setCerts(certData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteProject = async (id) => {
    try {
      await deleteProject(id, token);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      alert(`Failed to delete project: ${err.message}`);
    }
  };

  const handleDeleteCert = async (id) => {
    try {
      await deleteCertification(id, token);
      setCerts(certs.filter((c) => c.id !== id));
    } catch (err) {
      alert(`Failed to delete certification: ${err.message}`);
    }
  };

  const startEdit = (item, type) => setEditItem({ ...item, type });

  const saveEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (!formData.get("image") && editItem.image) formData.append("image", editItem.image);

    try {
      if (editItem.type === "project") await updateProject(editItem.id, formData, token);
      else await updateCertification(editItem.id, formData, token);
      fetchData();
      setEditItem(null);
    } catch (err) {
      alert(`Failed to update: ${err.message}`);
    }
  };

  return (
    <div className="App">
      {/* Sidebar */}
      <div className="sidebar">
        <button onClick={() => setCurrentPage("welcome")}>Welcome</button>
        <button onClick={() => setCurrentPage("projects")}>Add Projects</button>
        <button onClick={() => setCurrentPage("certifications")}>Add Certifications</button>
      </div>

      {/* Main Page */}
      <div className="page-container">
        {currentPage === "welcome" && (
          <h1 className="welcome-title">Welcome My Uncle 😎</h1>
        )}

        {currentPage === "projects" && (
          <>
            <h2 className="section-title">Projects</h2>
            <AddProject refresh={fetchData} token={token} />
            <div className="list-container">
              {projects.map((p) => (
                <div key={p.id} className="list-card">
                  <div className="card-left">
                    {p.image && <img src={getImageUrl(p.image)} alt={p.title} />}
                    <span>{p.title}</span>
                  </div>
                  <div className="card-right">
                    <button className="edit-btn" onClick={() => startEdit(p, "project")}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteProject(p.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {editItem && editItem.type === "project" && (
              <div className="edit-box">
                <h3>Edit Project</h3>
                {editItem.image && <img src={getImageUrl(editItem.image)} alt="Project preview" />}
                <form onSubmit={saveEdit}>
                  <input name="title" defaultValue={editItem.title} placeholder="Title" required />
                  <input name="description" defaultValue={editItem.description} placeholder="Description" />
                  <input name="link" defaultValue={editItem.link} placeholder="Link" />
                  <input type="file" name="image" />
                  <button type="submit" className="action-btn">Save</button>
                  <button type="button" className="action-btn" onClick={() => setEditItem(null)}>Cancel</button>
                </form>
              </div>
            )}
          </>
        )}

        {currentPage === "certifications" && (
          <>
            <h2 className="section-title">Certifications</h2>
            <AddCert refresh={fetchData} token={token} />
            <div className="list-container">
              {certs.map((c) => (
                <div key={c.id} className="list-card">
                  <div className="card-left">
                    {c.image && <img src={getImageUrl(c.image)} alt={c.name} />}
                    <span>{c.name} ({c.provider})</span>
                  </div>
                  <div className="card-right">
                    <button className="edit-btn" onClick={() => startEdit(c, "certification")}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteCert(c.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {editItem && editItem.type === "certification" && (
              <div className="edit-box">
                <h3>Edit Certification</h3>
                {editItem.image && <img src={getImageUrl(editItem.image)} alt="Certification preview" />}
                <form onSubmit={saveEdit}>
                  <input name="name" defaultValue={editItem.name} placeholder="Name" required />
                  <input name="provider" defaultValue={editItem.provider} placeholder="Provider" />
                  <input name="year" defaultValue={editItem.year} placeholder="Year" />
                  <input type="file" name="image" />
                  <button type="submit" className="action-btn">Save</button>
                  <button type="button" className="action-btn" onClick={() => setEditItem(null)}>Cancel</button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
