
// Certifications.js - Updated with CSS spinner
import React, { useEffect, useState } from "react";
import API, { BACKEND_URL } from "../api";
import "./Certifications.css";
import ThemedGradientText from './ThemedGradientText';

export default function Certifications() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        setLoading(true);
        const data = await API.getCertifications();
        setCerts(data);
        setError(null);
      } catch (err) {
        console.error("Certifications fetch error:", err);
        setError("Failed to load certifications. Server might be starting up...");
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('https://') || imagePath.startsWith('http://')) {
      return imagePath;
    }
    return `${BACKEND_URL}${imagePath}`;
  };

  // CSS Spinner Component (green version)
  const Spinner = () => (
    <div style={{
      width: '50px',
      height: '50px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #27ae60',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
  );

  // Add keyframe animation
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
      <section className="certs-section">
       <ThemedGradientText className="text-4xl font-bold mb-8 text-center">
        Certifications  
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
          <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading certifications...</p>
          <p style={{ fontSize: '0.9rem', opacity: '0.7' }}>
            Server might be waking up (first load ~30s)
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="certs-section">
        <h2 className="section-title">Certifications</h2>
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