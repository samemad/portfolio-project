import React from 'react';

function Footer() {
  return (
    <footer className="py-6 bg-gray-800 text-white text-center">
      <p>&copy; {new Date().getFullYear()} Sam Emad. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
