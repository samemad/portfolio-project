import React, { useState } from "react";
import axios from "axios";

export default function AddCert({ token, refresh }) {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [year, setYear] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("provider", provider);
    formData.append("year", year);
    if (image) formData.append("image", image);

    await axios.post("http://localhost:5000/api/certifications", formData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
    });
    setName(""); setProvider(""); setYear(""); setImage(null);
    refresh();
  };

  return (
    <div className="action-container">
      <h3>Add Certification</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input placeholder="Provider" value={provider} onChange={e => setProvider(e.target.value)} />
        <input placeholder="Year" value={year} onChange={e => setYear(e.target.value)} />
        <input type="file" onChange={e => setImage(e.target.files[0])} />
        <button type="submit" className="action-btn">Add Certification</button>
      </form>
    </div>
  );
}
