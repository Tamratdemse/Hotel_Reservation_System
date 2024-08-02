import React from "react";

const AboutUs = () => {
  return (
    <section id="about-us" className="section">
      <div className="about-us-container">
        <div className="img-container">
          <img className="image" src="img/dark-bed-room.JPG" alt="room" />
        </div>
        <div className="texts-container">
          <h1 className="title">About Us</h1>
          <p className="text">
            Our website offers a convenient and user-friendly platform for
            booking hotels across various destinations. With a vast selection of
            accommodations to choose from, we provide travelers with the
            flexibility to find the perfect hotel that suits their preferences
            and budget. The features detailed descriptions and images of each
            hotel, along with reviews from previous guests to help you make an
            informed decision.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
