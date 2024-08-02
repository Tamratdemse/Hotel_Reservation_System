import React from "react";

const hotDeals = [
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

const HotDeals = () => {
  return (
    <section id="hot-deals" className="section">
      <h1 className="title">Hot Deals</h1>
      <div className="grid-container ">
        {hotDeals.map((deals, index) => (
          <HotDealCard key={index} deal={deals} />
        ))}
      </div>
    </section>
  );
};
function HotDealCard({ deal }) {
  return (
    <section>
      <div className="property-card">
        <img className="property-image" src={`${deal.image}`} alt={deal.type} />
        <hr className="divider" />
        <div className="property-details">
          <span>{deal.type}</span>
          <span>{deal.address}</span>
          <span>{deal.details}</span>
        </div>
        <hr className="divider" />
      </div>
    </section>
  );
}
export default HotDeals;
