import React from "react";

export default function ContactUs({ allSectionsRef }) {
  return (
    <section id="contact-us" className="contact-section">
      <div className="contact-us-container">
        <span className="brand-name">NAF SMMA.</span>
        <div className="contact-content">
          <div className="contact-info">
            <h1>Let's Talk</h1>
            <div className="info-item">Hawassa, Ethiopia</div>
            <div className="info-item">+251-915-67-7200</div>
            <div className="info-item">NAFdigital@gmail.com</div>
          </div>
          <form id="contact-form" className="contact-form">
            <input
              type="text"
              placeholder="Full Name"
              required
              className="input-field"
            />
            <input
              type="email"
              placeholder="Email"
              required
              className="input-field"
            />
            <textarea
              placeholder="Message"
              cols="30"
              rows="6"
              required
              className="textarea-field"
            ></textarea>
            <div className="button-container">
              <button type="submit" className="submit-button">
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
