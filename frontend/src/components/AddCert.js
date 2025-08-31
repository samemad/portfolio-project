import React, { useState } from "react";
import '../AdminApp.css';
import '../AdminStyle.css';
import { ClipLoader } from 'react-spinners'; // Import the spinner
import { addCertification } from "../api.js"; // Adjust path if needed

export default function AddCert({ refresh, token }) { // Accept token prop
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [year, setYear] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false); // State for loading

 const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append("name", name);
  formData.append("provider", provider);
  formData.append("year", year);
  if (image) formData.append("image", image);

  setLoading(true);
  try {
    await addCertification(formData, token); // FormData directly
    setName(""); setProvider(""); setYear(""); setImage(null);
    refresh();
  } catch (err) {
    console.error("Failed to add certification:", err);
  } finally {
    setLoading(false);
  }
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
        {loading && <ClipLoader color="#1E90FF" size={50} />} {/* Spinner */}
      </form>
    </div>
  );
}