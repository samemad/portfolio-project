import React, { useEffect, useState } from "react";
import API from "../api";
import "./Projects.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get("/projects");
        setProjects(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProjects();
  }, []);

  return (
    <section id="projects" className="projects-section">
      <h2 className="section-title">Projects</h2>
      <div className="projects-scroll-container">
        {projects.map((p) => (
          <div key={p.id} className="project-card">
            {p.image && (
              <img
                src={`http://localhost:5000${p.image}`}
                alt={p.title}
                className="project-image"
              />
            )}
            <div className="project-content">
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              {p.link && (
                <a
                  href={p.link}
                  target="_blank"
                  rel="noreferrer"
                  className="project-link"
                >
                  View Project
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
