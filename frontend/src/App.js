// src/App.js
import React, { useState, useEffect, createContext } from "react";
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Certifications from './components/Certifications';
import About from './components/About';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import './App.css';

export const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {}
});

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
      <div className="app-root">
        <Navbar />
        <section id="hero"><Hero /></section>
        <section id="projects"><Projects /></section>
        <section id="certifications"><Certifications /></section>
        <section id="about"><About /></section>
        <section id="contact"><ContactForm /></section>
        <Footer />
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
