import React, { useState } from "react";
import axios from "axios";

export default function AddProject({ token, refresh }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("link", link);
    if (image) formData.append("image", image);

    await axios.post("http://localhost:5000/api/projects", formData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
    });
    setTitle(""); setDescription(""); setLink(""); setImage(null);
    refresh();
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
      </form>
    </div>
  );
}
