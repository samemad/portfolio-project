import React, { useEffect, useState } from "react";
import { getCertifications, BACKEND_URL } from "../api"; // Use named export getCertifications
import "./Certifications.css";

export default function Certifications() {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const data = await getCertifications(); // Use getCertifications directly
        setCerts(data);
      } catch (err) {
        console.error("Certifications fetch error:", err);
      }
    };
    fetchCerts();
  }, []);

  return (
    <section className="certs-section">
      <h2 className="section-title">Certifications</h2>
      <div className="certs-scroll-container">
        {certs.map((c) => (
          <div key={c.id} className="cert-card">
            {c.image && (
              <img
                src={`${BACKEND_URL}${c.image}`}
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