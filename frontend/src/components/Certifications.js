
// Certifications.js - Updated with loading state
import React, { useEffect, useState } from "react";
import { Pulse } from 'react-bits'; // Add this import
import API, { BACKEND_URL } from "../api";
import "./Certifications.css";

export default function Certifications() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        setLoading(true); // Start loading
        const data = await API.getCertifications();
        setCerts(data);
        setError(null);
      } catch (err) {
        console.error("Certifications fetch error:", err);
        setError("Failed to load certifications. Server might be starting up...");
      } finally {
        setLoading(false); // End loading regardless of success/error
      }
    };
    fetchCerts();
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
      <section className="certs-section">
        <h2 className="section-title">Certifications</h2>
        <div className="loading-container" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '300px',
          gap: '1rem'
        }}>
          <Pulse size="lg" color="green" />
          <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading certifications...</p>
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
      <section className="certs-section">
        <h2 className="section-title">Certifications</h2>
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
    <section className="certs-section">
      <h2 className="section-title">Certifications</h2>
      <div className="certs-scroll-container">
        {certs.map((c) => (
          <div key={c.id} className="cert-card">
            {c.image && (
              <img
                src={getImageUrl(c.image)}
                alt={c.name}
                className="cert-image"
              />
            )}
            <div className="cert-content">
              <h4>{c.name}</h4>
              <p>
                {c.provider} {c.year && `- ${c.year}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}