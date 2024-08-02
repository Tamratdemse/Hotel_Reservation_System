import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMobileMenuActive, setIsMobileMenuActive] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuActive((prev) => !prev);
  };

  const handleLinkClick = () => {
    if (isMobileMenuActive) {
      setIsMobileMenuActive(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src="img/nafLogo.png" alt="Logo" />
      </div>
      <p
        className={`fa-solid fas menu-icon  ${
          isMobileMenuActive ? "active" : ""
        }`}
        onClick={handleMenuToggle}
      >
        X
      </p>
      <div className="nav-links">
        <Link to="/" className="nav-link" onClick={handleLinkClick}>
          Home
        </Link>
        <Link className="nav-link" onClick={handleLinkClick}>
          About
        </Link>
        <Link className="nav-link" onClick={handleLinkClick}>
          Hot Deals
        </Link>
        <Link className="nav-link" onClick={handleLinkClick}>
          Contact Us
        </Link>
      </div>
      <div className="nav-buttons">
        <Link
          to="/registration"
          className="nav-button"
          onClick={handleLinkClick}
        >
          Sign Up / Login
        </Link>
      </div>
      <div className={`mobile-menu ${isMobileMenuActive ? "active" : ""}`}>
        <Link to="/" className="nav-link" onClick={handleLinkClick}>
          Home
        </Link>
        <Link className="nav-link" onClick={handleLinkClick}>
          About
        </Link>
        <Link className="nav-link" onClick={handleLinkClick}>
          Hot Deals
        </Link>
        <Link className="nav-link" onClick={handleLinkClick}>
          Contact Us
        </Link>
        <Link
          to="/registration"
          className="nav-button"
          onClick={handleLinkClick}
        >
          Sign Up / Login
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
