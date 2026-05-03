import React from 'react';

function Footer() {
  return (
    <footer className="py-10 text-center text-gray-300">
      <p className="tracking-[0.2em] uppercase text-xs mb-2">DEVSAM.ICU</p>
      <p>&copy; {new Date().getFullYear()} Sam Emad — Creative Developer</p>
    </footer>
  );
}

export default Footer;
