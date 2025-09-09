// Projects.js - Updated with CSS spinner (no external dependencies)
import React, { useEffect, useState } from "react";
import API, { BACKEND_URL } from "../api";
import "./Projects.css";
import ThemedGradientText from './ThemedGradientText';



export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await API.getProjects();
        setProjects(data);
        setError(null);
      } catch (err) {
        console.error("Projects fetch error:", err);
        setError("Failed to load projects. Server might be starting up...");
      } finally {
        setLoading(false);
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
        <ThemedGradientText className="text-4xl font-bold mb-8 text-center">
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
            Server might be waking up (first load ~30s)
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="projects-section">
        <h2 className="section-title" id="projects">Projects</h2>
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <p style={{ color: '#ff6b6b', marginBottom: '1rem' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="projects-section">
      <h2 className="section-title" id="projects">Projects</h2>
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
