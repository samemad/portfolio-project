import React from 'react';
import heroImage from '../assets/images/hero.JPG';

function Hero() {
  return (
    // in Hero.js, replace section class line with:
<section id="hero" className="flex flex-col md:flex-row items-center md:items-center justify-between px-6 pt-20 md:pt-28 pb-20 bg-gradient-to-r from-purple-500 to-indigo-600 text-white min-h-screen">

      {/* Left Side - Text */}
      <div className="md:w-1/2 flex flex-col justify-center space-y-6 md:space-y-8">
              <h1 className="text-5xl font-bold leading-tight">
        Hi, I'm <span className="text-white">Sam Emad</span>

      </h1>

        <p className="text-xl max-w-lg">
         Turning ideas into clean, modern, and scalable apps.
        </p>
        
        {/* Buttons */}
        <div className="flex space-x-4">
          <a
            href="#projects"
            className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            View Projects
          </a>
          <a
            href="/cv.pdf"
            download="MyCV.pdf"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Download CV
          </a>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
        <img src={heroImage} alt="Hero" className="rounded-lg shadow-lg" />
      </div>
    </section>
  );
}

export default Hero;
