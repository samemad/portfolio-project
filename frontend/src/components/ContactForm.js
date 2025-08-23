// src/components/ContactForm.js
import React, { useState, useContext } from "react";
import emailjs from "@emailjs/browser";
import { FaLinkedin, FaFacebookF, FaGithub, FaWhatsapp } from "react-icons/fa";
import { ThemeContext } from "../App";

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

  // classes (Tailwind + dynamic)
  const cardClass = `rounded-xl shadow-xl max-w-2xl w-full p-10 flex flex-col items-center space-y-8
    ${isDark ? "bg-black text-white" : "bg-white text-gray-900"}`;

  const titleClass = `${isDark ? "text-orange-500" : "text-orange-600"} text-3xl font-bold`;
  const descClass = `${isDark ? "text-gray-300" : "text-gray-600"} text-center`;

  const inputBase = "w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2";
  const inputClass = isDark
    ? `${inputBase} border border-orange-500 bg-black text-white placeholder-gray-400 focus:ring-orange-500`
    : `${inputBase} border border-orange-500 bg-white text-gray-900 placeholder-gray-500 focus:ring-orange-500`;

  const btnClass = isDark
    ? "bg-orange-500 text-black font-semibold py-3 rounded-lg hover:bg-orange-600 transition w-full"
    : "bg-orange-500 text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition w-full";

  const iconBase = "text-3xl transition";
  const iconClass = isDark ? `${iconBase} text-orange-500 hover:text-orange-600` : `${iconBase} text-orange-600 hover:text-orange-700`;

  return (
    <section id="contact" className={`px-6 py-20 flex justify-center`}>
      <div className={cardClass}>
        <h2 className={titleClass}>Contact Me</h2>
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
          />
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={inputClass}
          />
          <textarea
            placeholder="Your Message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows="4"
            className={inputClass}
          />
          <button type="submit" className={btnClass}>Send Message</button>
        </form>

        {success && <p className="text-green-500">{success}</p>}

        {/* Social Icons */}
        <div className="flex space-x-6 mt-4">
          <a href="https://www.linkedin.com/in/samal-athwary" target="_blank" rel="noopener noreferrer" className={iconClass} aria-label="LinkedIn">
            <FaLinkedin />
          </a>
          <a href="https://www.facebook.com/Al-athwarySam" target="_blank" rel="noopener noreferrer" className={iconClass} aria-label="Facebook">
            <FaFacebookF />
          </a>
          <a href="https://wa.me/967779809248" target="_blank" rel="noopener noreferrer" className={iconClass} aria-label="WhatsApp">
            <FaWhatsapp />
          </a>
          <a href="https://www.github.com/samemad" target="_blank" rel="noopener noreferrer" className={iconClass} aria-label="Github">
            <FaGithub />
          </a>
        </div>
      </div>
    </section>
  );
}

export default ContactForm;
