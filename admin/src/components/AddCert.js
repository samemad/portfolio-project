import React, { useState } from "react";
import axios from "axios";
import { ClipLoader } from 'react-spinners'; // Import the spinner

export default function AddCert({ token, refresh }) {
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

    setLoading(true); // Start loading
    try {
      console.log("Attempting to add certification with token:", token);
      const response = await axios.post("http://localhost:5000/api/certifications", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      console.log("Certification added successfully:", response.data);
      setName(""); setProvider(""); setYear(""); setImage(null);
      refresh();
    } catch (error) {
      console.error("Error adding certification:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      if (error.response?.status === 403 && error.response?.data?.message === 'Invalid token') {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/admin";
      } else {
        alert(`Failed to add certification: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false); // Stop loading whether success or failure
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