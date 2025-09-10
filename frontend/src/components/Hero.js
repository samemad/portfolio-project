// src/components/Hero.js - Updated with TextType
import React from 'react';
import { HashLink } from 'react-router-hash-link';
import TextType from './TextType'; // Import your TextType component
import heroImage from '../assets/images/hero.jpg';
import SplitText from './SplitText';

function Hero() {

  return (
    <section id="hero" className="flex flex-col md:flex-row items-center md:items-center justify-between px-6 pt-20 md:pt-28 pb-20 bg-gradient-to-r from-purple-500 to-indigo-600 text-white min-h-screen">
      {/* Left Side - Text */}
      
      <div className="md:w-1/2 flex flex-col justify-center space-y-6 md:space-y-8">
              <SplitText
                  text="Hi, I'm Sam Emad"
                  className="text-5xl font-bold leading-tight"
                  delay={100}
                  duration={0.6}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-100px"
                  textAlign="left"  // Changed from "center" since your text is left-aligned
                  onLetterAnimationComplete={() => console.log('Name animated!')}
               />
        {/* Animated typing text */}
        <div className="text-2xl max-w-lg min-h-[60px]"> {/* Fixed height to prevent layout shift */}
          <TextType 
            text={[
              "Turning ideas into clean apps", 
              "Building modern web solutions", 
              "Creating scalable full-stack apps"
            ]}
            typingSpeed={90}
            pauseDuration={1500}
            deletingSpeed={50}
            showCursor={true}
            cursorCharacter="|"
            cursorClassName="text-white opacity-80"
            textColors={['#ffffff', '#f0f0f0', '#e0e0e0']} // Subtle color variations
            className="text-2xl"
            loop={true}
            initialDelay={500} // Start typing after 500ms
          />
        </div>
        
        {/* Buttons */}
        <div className="flex space-x-4">     
          <HashLink 
            smooth 
            to="#projects"
            className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            View Projects
          </HashLink>
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