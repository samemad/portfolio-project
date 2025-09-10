// src/components/ContactForm.js
import React, { useState, useContext } from "react";
import emailjs from "@emailjs/browser";
import { FaLinkedin, FaFacebookF, FaGithub, FaWhatsapp } from "react-icons/fa";
import { ThemeContext } from "../App";
import ThemedGradientText from './ThemedGradientText';

function ContactForm() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.send(
      "service_b45xjy4",    // your EmailJS Service ID
      "template_96gduzn",  // your EmailJS Template ID
      { name, email, message },
      "dKFtNZkVLu4WTgbZ1"  // your EmailJS Public Key (user id)
    ).then(
      () => {
        setSuccess("Message sent successfully!");
        setName(""); setEmail(""); setMessage("");
        setTimeout(() => setSuccess(""), 4500);
      },
      (err) => {
        console.error("EmailJS error:", err);
        setSuccess("Failed to send message. Please try again.");
        setTimeout(() => setSuccess(""), 4500);
      }
    );
  };

  // Hero gradient colors
  const heroColors = {
    dark: {
      primary: '#71718d',
      secondary: '#1f1f2a',
      hover: '#3a3a4a'
    },
    light: {
      primary: '#ff6a00',
      secondary: '#ff8a1c', 
      hover: '#e55a00'
    }
  };

  const colors = heroColors[theme];

  // classes (Tailwind + dynamic)
  const cardClass = `rounded-xl shadow-xl max-w-2xl w-full p-10 flex flex-col items-center space-y-8
    ${isDark ? "bg-black text-white" : "bg-white text-gray-900"}`;

  const descClass = `${isDark ? "text-gray-300" : "text-gray-600"} text-center`;

  const inputBase = "w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition-all duration-300";
  const inputClass = isDark
    ? `${inputBase} bg-black text-white placeholder-gray-400`
    : `${inputBase} bg-white text-gray-900 placeholder-gray-500`;

  const btnClass = isDark
    ? "text-white font-semibold py-3 rounded-lg transition-all duration-300 w-full"
    : "text-white font-semibold py-3 rounded-lg transition-all duration-300 w-full";

  const iconBase = "text-3xl transition-all duration-300";

  return (
    <section id="contact" className={`px-6 py-20 flex justify-center`}>
      <div className={cardClass}>
        <ThemedGradientText className="text-5xl font-bold mb-8 text-center">
          Contact Me
        </ThemedGradientText>
        <p className={descClass}>Feel free to reach out to me via email or social media!</p>

        {/* Form */}
        <form onSubmit={sendEmail} className="w-full flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className={inputClass}
            style={{
              border: `2px solid ${colors.primary}`,
              focusRing: colors.primary
            }}
            onFocus={(e) => e.target.style.boxShadow = `0 0 0 3px ${colors.primary}40`}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
          />
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={inputClass}
            style={{
              border: `2px solid ${colors.primary}`,
            }}
            onFocus={(e) => e.target.style.boxShadow = `0 0 0 3px ${colors.primary}40`}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
          />
          <textarea
            placeholder="Your Message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows="4"
            className={inputClass}
            style={{
              border: `2px solid ${colors.primary}`,
            }}
            onFocus={(e) => e.target.style.boxShadow = `0 0 0 3px ${colors.primary}40`}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
          />
          <button 
            type="submit" 
            className={btnClass}
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            }}
            onMouseEnter={(e) => e.target.style.background = `linear-gradient(135deg, ${colors.hover}, ${colors.primary})`}
            onMouseLeave={(e) => e.target.style.background = `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`}
          >
            Send Message
          </button>
        </form>

        {success && <p className="text-green-500">{success}</p>}

        {/* Social Icons */}
        <div className="flex space-x-6 mt-4">
          <a 
            href="https://www.linkedin.com/in/samal-athwary" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={iconBase} 
            aria-label="LinkedIn"
            style={{ color: colors.primary }}
            onMouseEnter={(e) => e.target.style.color = colors.hover}
            onMouseLeave={(e) => e.target.style.color = colors.primary}
          >
            <FaLinkedin />
          </a>
          <a 
            href="https://www.facebook.com/Al-athwarySam" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={iconBase} 
            aria-label="Facebook"
            style={{ color: colors.primary }}
            onMouseEnter={(e) => e.target.style.color = colors.hover}
            onMouseLeave={(e) => e.target.style.color = colors.primary}
          >
            <FaFacebookF />
          </a>
          <a 
            href="https://wa.me/967779809248" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={iconBase} 
            aria-label="WhatsApp"
            style={{ color: colors.primary }}
            onMouseEnter={(e) => e.target.style.color = colors.hover}
            onMouseLeave={(e) => e.target.style.color = colors.primary}
          >
            <FaWhatsapp />
          </a>
          <a 
            href="https://www.github.com/samemad" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={iconBase} 
            aria-label="Github"
            style={{ color: colors.primary }}
            onMouseEnter={(e) => e.target.style.color = colors.hover}
            onMouseLeave={(e) => e.target.style.color = colors.primary}
          >
            <FaGithub />
          </a>
        </div>
      </div>
    </section>
  );
}

export default ContactForm;