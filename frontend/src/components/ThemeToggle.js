// src/components/ThemeToggle.js
import React, { useContext } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { ThemeContext } from "../App";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle theme"
      className={`theme-toggle ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px",
        borderRadius: "8px",
        border: "2px solid transparent",
        cursor: "pointer",
        transition: "all .18s ease"
      }}
    >
      {isDark ? <FaSun color="#FFB86B" size={18} /> : <FaMoon color="#121212" size={18} />}
    </button>
  );
}
