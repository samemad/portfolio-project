import React from 'react';
import profileImg from '../assets/Sam.png'; // <-- put your image in src/assets

function About() {
  return (
    <section id="about" className="px-6 py-20 max-w-6xl mx-auto">
      <h2 className="section-title text-4xl font-bold text-center mb-12">
        About Me
      </h2>

      <div className="flex flex-col md:flex-row items-center gap-10">
        {/* Image */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0"> {/* Adjusted width classes */}
          <img
            src={profileImg}
            alt="Profile"
            className="w-full h-auto object-cover rounded-2xl shadow-lg mx-auto" // Added mx-auto for centering on small screens
          />
        </div>

        {/* Text */}
        <div className="text-lg leading-relaxed text-center md:text-left md:w-2/3 lg:w-3/4"> {/* Adjusted width classes */}
          <p>
            I’m a passionate full-stack developer with strong experience in
            Flutter, Dart, Node.js, JavaScript, and React. I love transforming
            ideas into intuitive, high-performance applications and websites
            that solve real problems and deliver meaningful user experiences.
          </p>
          <p className="mt-4">
            Always curious, I continuously explore new technologies to sharpen
            my craft and bring innovative solutions to every project I work on.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;