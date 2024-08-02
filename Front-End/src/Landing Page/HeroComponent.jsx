import React from "react";
import { Link } from "react-router-dom";

const HeroComponent = () => {
  return (
    <section>
      <div className="hero-container">
        <div className="text-container">
          <h1>Let us help you find your ideal hotel.</h1>
          <div className="buttons">
            <Link to="/list-of-hotels" className="book-btn">
              List of Hotels
            </Link>
          </div>
        </div>
        <div className="image-container">
          <img src="img/envy-bar.JPG" alt="Hotel pictures" />
        </div>
      </div>
    </section>
  );
};

export default HeroComponent;
