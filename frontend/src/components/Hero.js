import React from 'react';
import { HashLink } from 'react-router-hash-link';
import TextType from './TextType';
import heroImage from '../assets/images/hero.JPG';
import SplitText from './SplitText';

function Hero() {
  return (
    <section id="hero" className="flex flex-col md:flex-row items-center justify-between px-6 pt-24 md:pt-32 pb-16 md:pb-20 text-white min-h-screen gap-12">
      <div className="md:w-1/2 flex flex-col justify-center space-y-6 md:space-y-8 relative z-10">
        <p className="hero-kicker">Creative Developer • Cinematic Interfaces</p>
        <SplitText
          text="DEVSAM"
          className="text-6xl md:text-8xl font-bold leading-[0.9] tracking-tight"
          delay={80}
          duration={0.7}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 50 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="left"
        />
        <div className="text-xl md:text-2xl max-w-xl min-h-[80px] text-gray-200">
          <TextType
            text={[
              'Crafting digital experiences that feel alive',
              'Building modern interfaces with cinematic motion',
              'Creative development for premium web brands'
            ]}
            typingSpeed={80}
            pauseDuration={1600}
            deletingSpeed={45}
            showCursor={true}
            cursorCharacter="|"
            cursorClassName="text-white opacity-80"
            textColors={['#ffffff', '#e7efff', '#dbe7ff']}
            className="text-xl md:text-2xl"
            loop={true}
            initialDelay={500}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <HashLink smooth to="#projects" className="px-7 py-3 bg-white/95 text-black font-semibold rounded-full hover:bg-white transition">
            View Projects
          </HashLink>
          <a href="/cv.pdf" download="Sam-Emad-CV.pdf" className="px-7 py-3 border border-white/40 text-white font-semibold rounded-full hover:bg-white/10 transition">
            Download CV
          </a>
        </div>
      </div>

      <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center relative z-10">
        <img src={heroImage} alt="Sam Emad portrait" className="w-full max-w-2xl object-cover shadow-2xl" />
      </div>
    </section>
  );
}

export default Hero;
