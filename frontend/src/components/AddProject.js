import React, { useState } from "react";
import { ClipLoader } from 'react-spinners'; // Import the spinner
import { addProject } from "../api.js"; // Adjust path if needed

export default function AddProject({ refresh }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false); // State for loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("link", link);
    if (image) formData.append("image", image);

    setLoading(true); // Start loading
    try {
      console.log("Attempting to add project");
      const data = await addProject(formData);
      console.log("Project added successfully:", data);
      setTitle(""); setDescription(""); setLink(""); setImage(null);
      refresh();
    } catch (error) {
      console.error("Error adding project:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      if (error.response?.status === 403 && error.response?.data?.message === 'Invalid token') {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/admin";
      } else {
        alert(`Failed to add project: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false); // Stop loading whether success or failure
    }
  };

  return (
    <div className="action-container">
      <h3>Add Project</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <input placeholder="Link" value={link} onChange={e => setLink(e.target.value)} />
        <input type="file" onChange={e => setImage(e.target.files[0])} />
        <button type="submit" className="action-btn">Add Project</button>
        {loading && <ClipLoader color="#1E90FF" size={50} />} {/* Spinner */}
      </form>
    </div>
  );
}