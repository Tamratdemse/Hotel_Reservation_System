import React from "react";

const specialOffers = [
  {
    image: "img/fenet-bed-room.JPG",
    type: "Row House",
    address: "123 Anywhere ST. any city",
    details: "2 Bed | 1 Bath | 1 Car",
  },
  {
    image: "img/dark-bed-room.JPG",
    type: "Row House",
    address: "123 Anywhere ST. any city",
    details: "2 Bed | 1 Bath | 1 Car",
  },
  {
    image: "img/bedroom.JPG",
    type: "Row House",
    address: "123 Anywhere ST. any city",
    details: "2 Bed | 1 Bath | 1 Car",
  },
];
const SpecialOfferCard = ({ special }) => {
  return (
    <section>
      <div className="property-card">
        <img
          className="property-image"
          src={special.image}
          alt={special.type}
        />
        <hr className="divider" />
        <div className="property-details">
          <span>{special.type}</span>
          <span>{special.address}</span>
          <span>{special.details}</span>
        </div>
        <hr className="divider" />
      </div>
    </section>
  );
};
const SpecialOffers = () => {
  return (
    <section id="hot-deals" className="section">
      <h1 className="title">Special Offers</h1>
      <div className="grid-container ">
        {specialOffers.map((special, index) => (
          <SpecialOfferCard key={index} special={special} />
        ))}
      </div>
    </section>
  );
};

export default SpecialOffers;
