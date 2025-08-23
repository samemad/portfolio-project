import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AddProject from "./AddProject";
import AddCert from "./AddCert";

export default function Dashboard({ token }) {
  const [projects, setProjects] = useState([]);
  const [certs, setCerts] = useState([]);
  const [currentPage, setCurrentPage] = useState("welcome"); // track current page

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
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

  // Delete functions
  const deleteProject = async (id) => {
    const headers = { Authorization: `Bearer ${token}` };
    await axios.delete(`http://localhost:5000/api/projects/${id}`, { headers });
    setProjects(projects.filter(p => p.id !== id));
  };

  const deleteCert = async (id) => {
    const headers = { Authorization: `Bearer ${token}` };
    await axios.delete(`http://localhost:5000/api/certifications/${id}`, { headers });
    setCerts(certs.filter(c => c.id !== id));
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#121212", color: "#fff" }}>
      
      {/* Sidebar */}
      <div className="sidebar" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", minWidth: "200px" }}>
        <button onClick={() => setCurrentPage("welcome")}>Welcome</button>
        <button onClick={() => setCurrentPage("projects")}>Projects</button>
        <button onClick={() => setCurrentPage("certifications")}>Certifications</button>
      </div>

      {/* Page Content */}
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
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px",
                  marginBottom: "10px",
                  border: "2px solid #FF6600",
                  borderRadius: "12px",
                  backgroundColor: "#1c1c1c"
                }}>
                  <span>{p.title}</span>
                  <button onClick={() => deleteProject(p.id)} style={{
                    padding: "8px 15px",
                    border: "2px solid #FF6600",
                    borderRadius: "10px",
                    background: "transparent",
                    color: "#FF6600",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={e => {e.target.style.backgroundColor="#FF6600"; e.target.style.color="#121212";}}
                  onMouseLeave={e => {e.target.style.backgroundColor="transparent"; e.target.style.color="#FF6600";}}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {currentPage === "certifications" && (
          <>
            <h2 style={{ marginBottom: "20px" }}>Certifications</h2>
            <AddCert token={token} refresh={fetchData} />
            <div className="list-container" style={{ marginTop: "20px" }}>
              {certs.map(c => (
                <div key={c.id} className="list-card" style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px",
                  marginBottom: "10px",
                  border: "2px solid #FF6600",
                  borderRadius: "12px",
                  backgroundColor: "#1c1c1c"
                }}>
                  <span>{c.name} ({c.provider})</span>
                  <button onClick={() => deleteCert(c.id)} style={{
                    padding: "8px 15px",
                    border: "2px solid #FF6600",
                    borderRadius: "10px",
                    background: "transparent",
                    color: "#FF6600",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={e => {e.target.style.backgroundColor="#FF6600"; e.target.style.color="#121212";}}
                  onMouseLeave={e => {e.target.style.backgroundColor="transparent"; e.target.style.color="#FF6600";}}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
