// src/components/Sidebar.js
import React from "react";

export default function Sidebar({ setPage }) {
  return (
    <div className="sidebar">
      <button onClick={() => setPage("welcome")}>Welcome</button>
      <button onClick={() => setPage("addProject")}>Add Project</button>
      <button onClick={() => setPage("addCert")}>Add Certification</button>
    </div>
  );
}
