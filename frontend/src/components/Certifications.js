import React, { useEffect, useState } from "react";
import API from "../api";
import "./Certifications.css";

export default function Certifications() {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await API.get("/certifications");
        setCerts(res.data);
      } catch (err) {
        console.error(err);
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
                src={`http://localhost:5000${c.image}`}
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
