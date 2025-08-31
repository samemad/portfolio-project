// src/components/Navbar.js
import React, { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Compute simple class names / styles that will be overridden by theme CSS
  const baseNavClasses = "fixed top-0 left-0 w-full z-50 transition-all duration-300";
  const scrolledClass = scrolled ? "nav-scrolled" : "nav-top";

  return (
    <nav className={`${baseNavClasses} ${scrolledClass}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#hero" className="text-2xl font-bold logo">DevSam</a>

        <div className="hidden md:flex space-x-8 text-lg font-medium nav-links">
          <a href="#projects" className="nav-link">Projects</a>
          <a href="#certifications" className="nav-link">Certifications</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#contact" className="nav-link">Contact</a>
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