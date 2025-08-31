// src/components/Navbar.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Only show navbar on main website, not on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Compute simple class names / styles that will be overridden by theme CSS
  const baseNavClasses = "fixed top-0 left-0 w-full z-50 transition-all duration-300";
  const scrolledClass = scrolled ? "nav-scrolled" : "nav-top";

  return (
    <nav className={`${baseNavClasses} ${scrolledClass}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => scrollToSection('hero')} 
          className="text-2xl font-bold logo cursor-pointer border-none bg-transparent"
        >
          DevSam
        </button>

        <div className="hidden md:flex space-x-8 text-lg font-medium nav-links">
          <button 
            onClick={() => scrollToSection('projects')} 
            className="nav-link cursor-pointer border-none bg-transparent"
          >
            Projects
          </button>
          <button 
            onClick={() => scrollToSection('certifications')} 
            className="nav-link cursor-pointer border-none bg-transparent"
          >
            Certifications
          </button>
          <button 
            onClick={() => scrollToSection('about')} 
            className="nav-link cursor-pointer border-none bg-transparent"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('contact')} 
            className="nav-link cursor-pointer border-none bg-transparent"
          >
            Contact
          </button>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {/* <div className="md:hidden">
            <button className="text-xl">☰</button>
          </div> */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;