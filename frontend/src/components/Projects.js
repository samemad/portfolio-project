// Projects.js - Updated with react-spinners
import React, { useEffect, useState } from "react";
import { PulseLoader } from 'react-spinners'; // Changed from react-bits
import API, { BACKEND_URL } from "../api";
import "./Projects.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true); // Start loading
        const data = await API.getProjects();
        setProjects(data);
        setError(null);
      } catch (err) {
        console.error("Projects fetch error:", err);
        setError("Failed to load projects. Server might be starting up...");
      } finally {
        setLoading(false); // End loading regardless of success/error
      }
    };
    fetchProjects();
  }, []);

  // Helper function to handle image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('https://') || imagePath.startsWith('http://')) {
      return imagePath;
    }
    return `${BACKEND_URL}${imagePath}`;
  };

  // Loading state JSX
  if (loading) {
    return (
      <section className="projects-section">
        <h2 className="section-title" id="projects">Projects</h2>
        <div className="loading-container" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '300px',
          gap: '1rem'
        }}>
          <PulseLoader color="#36d7b7" size={15} />
          <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading projects...</p>
          <p style={{ fontSize: '0.9rem', opacity: '0.7' }}>
            Server might be waking up (first load ~30s)
          </p>
        </div>
      </section>
    );
  }

  // Error state JSX
  if (error) {
    return (
      <section className="projects-section">
        <h2 className="section-title" id="projects">Projects</h2>
        <div className="error-container" style={{ 
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

  // Normal render when data is loaded
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