// Projects.js - Updated with CSS spinner (no external dependencies)
import React, { useEffect, useState } from "react";
import API, { BACKEND_URL } from "../api";
import "./Projects.css";
import ThemedGradientText from './ThemedGradientText';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await API.getProjects();
        setProjects(data);
        setLoading(false); // Only set false on success
      } catch (err) {
        console.error("Projects fetch error:", err);
        // Keep loading = true, so spinner continues
      }
    };
    fetchProjects();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('https://') || imagePath.startsWith('http://')) {
      return imagePath;
    }
    return `${BACKEND_URL}${imagePath}`;
  };

  // CSS Spinner Component
  const Spinner = () => (
    <div style={{
      width: '50px',
      height: '50px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
  );

  // Add keyframe animation to your CSS or inline
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (loading) {
    return (
      <section className="projects-section">
        <ThemedGradientText className="text-5xl font-bold mb-8 text-center">
          Projects
        </ThemedGradientText>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '300px',
          gap: '1rem'
        }}>
          <Spinner />
          <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading projects...</p>
          <p style={{ fontSize: '0.9rem', opacity: '0.7' }}>
            Server waking up (first lazy load ~30s)
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="projects-section">
      <ThemedGradientText className="text-5xl font-bold mb-8 text-center">
          Projects
        </ThemedGradientText>
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