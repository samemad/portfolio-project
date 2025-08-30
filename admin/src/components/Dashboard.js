import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AddProject from "./AddProject";
import AddCert from "./AddCert";

export default function Dashboard({ token }) {
  const [projects, setProjects] = useState([]);
  const [certs, setCerts] = useState([]);
  const [currentPage, setCurrentPage] = useState("welcome");
  const [editItem, setEditItem] = useState(null); // State for editing

  const fetchData = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      console.log("Fetching data with token:", token);
      const projRes = await axios.get("http://localhost:5000/api/projects", { headers });
      const certRes = await axios.get("http://localhost:5000/api/certifications", { headers });
      setProjects(projRes.data);
      setCerts(certRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteProject = async (id) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      console.log("Deleting project with token:", token, "ID:", id);
      await axios.delete(`http://localhost:5000/api/projects/${id}`, { headers });
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const deleteCert = async (id) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      console.log("Deleting certification with token:", token, "ID:", id);
      await axios.delete(`http://localhost:5000/api/certifications/${id}`, { headers });
      setCerts(certs.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error deleting certification:", err);
    }
  };

  const startEdit = (item, type) => {
    setEditItem({ ...item, type });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    const headers = { Authorization: `Bearer ${token}` };
    const formData = new FormData(e.target);
    try {
      if (editItem.type === "project") {
        await axios.put(`http://localhost:5000/api/projects/${editItem.id}`, formData, { headers });
      } else {
        await axios.put(`http://localhost:5000/api/certifications/${editItem.id}`, formData, { headers });
      }
      fetchData(); // Refresh data
      setEditItem(null); // Close edit form
    } catch (err) {
      console.error("Error updating item:", err);
      alert(`Failed to update: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#121212", color: "#fff" }}>
      <div className="sidebar" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", minWidth: "200px" }}>
        <button onClick={() => setCurrentPage("welcome")}>Welcome</button>
        <button onClick={() => setCurrentPage("projects")}>Projects</button>
        <button onClick={() => setCurrentPage("certifications")}>Certifications</button>
      </div>
      <div className="page-container" style={{ flex: 1, padding: "40px" }}>
        {currentPage === "welcome" && (
          <h1 style={{ textAlign: "center", marginTop: "100px", fontSize: "2rem" }}>
            Welcome My Uncle 😎
          </h1>
        )}
        {currentPage === "projects" && (
          <>
            <h2 style={{ marginBottom: "20px" }}>Projects</h2>
            <AddProject token={token} refresh={fetchData} />
            <div className="list-container" style={{ marginTop: "20px" }}>
              {projects.map(p => (
                <div key={p.id} className="list-card" style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px",
                  marginBottom: "10px", border: "2px solid #FF6600", borderRadius: "12px", backgroundColor: "#1c1c1c"
                }}>
                  <span>{p.title}</span>
                  <div>
                    <button onClick={() => startEdit(p, "project")} style={{
                      padding: "8px 15px", border: "2px solid #32CD32", borderRadius: "10px", background: "transparent",
                      color: "#32CD32", cursor: "pointer", marginRight: "10px", transition: "all 0.3s ease"
                    }}
                    onMouseEnter={e => { e.target.style.backgroundColor = "#32CD32"; e.target.style.color = "#121212"; }}
                    onMouseLeave={e => { e.target.style.backgroundColor = "transparent"; e.target.style.color = "#32CD32"; }}>
                      Edit
                    </button>
                    <button onClick={() => deleteProject(p.id)} style={{
                      padding: "8px 15px", border: "2px solid #FF6600", borderRadius: "10px", background: "transparent",
                      color: "#FF6600", cursor: "pointer", transition: "all 0.3s ease"
                    }}
                    onMouseEnter={e => { e.target.style.backgroundColor = "#FF6600"; e.target.style.color = "#121212"; }}
                    onMouseLeave={e => { e.target.style.backgroundColor = "transparent"; e.target.style.color = "#FF6600"; }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {editItem && editItem.type === "project" && (
  <div style={{ marginTop: "20px", padding: "20px", border: "2px solid #32CD32", borderRadius: "10px" }}>
    <h3>Edit Project</h3>
    {/* Show current image if exists */}
    {editItem.image && (
      <div style={{ marginBottom: "10px" }}>
        <img
          src={`http://localhost:5000${editItem.image}`}
          alt="Project preview"
          style={{ maxWidth: "200px", borderRadius: "8px" }}
        />
      </div>
    )}
    <form onSubmit={saveEdit}>
      <input name="title" defaultValue={editItem.title} placeholder="Title" required />
      <input name="description" defaultValue={editItem.description} placeholder="Description" />
      <input name="link" defaultValue={editItem.link} placeholder="Link" />
      <input type="file" name="image" />
      <button type="submit">Save</button>
      <button type="button" onClick={() => setEditItem(null)}>Cancel</button>
    </form>
  </div>
)}

{editItem && editItem.type === "certification" && (
  <div style={{ marginTop: "20px", padding: "20px", border: "2px solid #32CD32", borderRadius: "10px" }}>
    <h3>Edit Certification</h3>
    {/* Show current image if exists */}
    {editItem.image && (
      <div style={{ marginBottom: "10px" }}>
        <img
          src={`http://localhost:5000${editItem.image}`}
          alt="Certification preview"
          style={{ maxWidth: "200px", borderRadius: "8px" }}
        />
      </div>
    )}
    <form onSubmit={saveEdit}>
      <input name="name" defaultValue={editItem.name} placeholder="Name" required />
      <input name="provider" defaultValue={editItem.provider} placeholder="Provider" />
      <input name="year" defaultValue={editItem.year} placeholder="Year" />
      <input type="file" name="image" />
      <button type="submit">Save</button>
      <button type="button" onClick={() => setEditItem(null)}>Cancel</button>
    </form>
  </div>
)}

          </>
        )}
        {currentPage === "certifications" && (
          <>
            <h2 style={{ marginBottom: "20px" }}>Certifications</h2>
            <AddCert token={token} refresh={fetchData} />
            <div className="list-container" style={{ marginTop: "20px" }}>
              {certs.map(c => (
                <div key={c.id} className="list-card" style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px",
                  marginBottom: "10px", border: "2px solid #FF6600", borderRadius: "12px", backgroundColor: "#1c1c1c"
                }}>
                  <span>{c.name} ({c.provider})</span>
                  <div>
                    <button onClick={() => startEdit(c, "certification")} style={{
                      padding: "8px 15px", border: "2px solid #32CD32", borderRadius: "10px", background: "transparent",
                      color: "#32CD32", cursor: "pointer", marginRight: "10px", transition: "all 0.3s ease"
                    }}
                    onMouseEnter={e => { e.target.style.backgroundColor = "#32CD32"; e.target.style.color = "#121212"; }}
                    onMouseLeave={e => { e.target.style.backgroundColor = "transparent"; e.target.style.color = "#32CD32"; }}>
                      Edit
                    </button>
                    <button onClick={() => deleteCert(c.id)} style={{
                      padding: "8px 15px", border: "2px solid #FF6600", borderRadius: "10px", background: "transparent",
                      color: "#FF6600", cursor: "pointer", transition: "all 0.3s ease"
                    }}
                    onMouseEnter={e => { e.target.style.backgroundColor = "#FF6600"; e.target.style.color = "#121212"; }}
                    onMouseLeave={e => { e.target.style.backgroundColor = "transparent"; e.target.style.color = "#FF6600"; }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {editItem && editItem.type === "project" && (
  <div style={{ marginTop: "20px", padding: "20px", border: "2px solid #32CD32", borderRadius: "10px" }}>
    <h3>Edit Project</h3>
    {/* Show current image if exists */}
    {editItem.image && (
      <div style={{ marginBottom: "10px" }}>
        <img
          src={`http://localhost:5000${editItem.image}`}
          alt="Project preview"
          style={{ maxWidth: "200px", borderRadius: "8px" }}
        />
      </div>
    )}
    <form onSubmit={saveEdit}>
      <input name="title" defaultValue={editItem.title} placeholder="Title" required />
      <input name="description" defaultValue={editItem.description} placeholder="Description" />
      <input name="link" defaultValue={editItem.link} placeholder="Link" />
      <input type="file" name="image" />
      <button type="submit">Save</button>
      <button type="button" onClick={() => setEditItem(null)}>Cancel</button>
    </form>
  </div>
)}

{editItem && editItem.type === "certification" && (
  <div style={{ marginTop: "20px", padding: "20px", border: "2px solid #32CD32", borderRadius: "10px" }}>
    <h3>Edit Certification</h3>
    {/* Show current image if exists */}
    {editItem.image && (
      <div style={{ marginBottom: "10px" }}>
        <img
          src={`http://localhost:5000${editItem.image}`}
          alt="Certification preview"
          style={{ maxWidth: "200px", borderRadius: "8px" }}
        />
      </div>
    )}
    <form onSubmit={saveEdit}>
      <input name="name" defaultValue={editItem.name} placeholder="Name" required />
      <input name="provider" defaultValue={editItem.provider} placeholder="Provider" />
      <input name="year" defaultValue={editItem.year} placeholder="Year" />
      <input type="file" name="image" />
      <button type="submit">Save</button>
      <button type="button" onClick={() => setEditItem(null)}>Cancel</button>
    </form>
  </div>
)}

          </>
        )}
      </div>
    </div>
  );
}