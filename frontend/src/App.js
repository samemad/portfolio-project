// src/App.js
import React, { useState, useEffect, createContext } from "react";

import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Main website components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Certifications from './components/Certifications';
import About from './components/About';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

// Admin components (copy these from admin folder)
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './AdminApp.css'; // Import admin styles

import './App.css';

export const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {}
});

// Main website component
function MainWebsite() {
  return (
    <>
      <Navbar />
      <section id="hero"><Hero /></section>
      <section id="projects"><Projects /></section>
      <section id="certifications"><Certifications /></section>
      <section id="about"><About /></section>
      <section id="contact"><ContactForm /></section>
      <Footer />
    </>
  );
}

// Admin app component
function AdminApp() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const saveToken = (t) => {
    console.log("Saving token to localStorage:", t);
    localStorage.setItem("token", t);
    setToken(t);
  };

  return (
    <div className="admin-app">
      {token ? <Dashboard token={token} /> : <Login setToken={saveToken} />}
    </div>
  );
}

function App() {
  // theme: default to dark unless user previously chose light
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    // add theme class on <html> (documentElement) so CSS can target it
    document.documentElement.classList.remove("theme-light", "theme-dark");
    document.documentElement.classList.add(`theme-${theme}`);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Router>
        <div className="app-root">
          <Routes>
            {/* Main website route */}
            <Route path="/" element={<MainWebsite />} />
                     
            {/* Admin routes */}
            <Route path="/admin/*" element={<AdminApp />} />
          </Routes>
        </div>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;