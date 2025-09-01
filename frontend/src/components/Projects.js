
// Projects.js
import React, { useEffect, useState } from "react";
import API, { BACKEND_URL } from "../api";
import "./Projects.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await API.getProjects();
        setProjects(data);
      } catch (err) {
        console.error("Projects fetch error:", err);
      }
    };
    fetchProjects();
  }, []);

  // Helper function to handle image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    // If it's already a full URL (Cloudinary), use as-is
    if (imagePath.startsWith('https://') || imagePath.startsWith('http://')) {
      return imagePath;
    }
    // If it's a local path, add backend URL
    return `${BACKEND_URL}${imagePath}`;
  };

  return (
    <section id="projects" className="projects-section">
      <h2 className="section-title">Projects</h2>
      <div className="projects-scroll-container">
        {projects.map((p) => (
          <div key={p.id} className="project-card">
            {p.image && (
              <img
                src={getImageUrl(p.image)}
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
