import Navbar from "./Navbar.jsx";
import HeroComponent from "./HeroComponent.jsx";
import HotDeals from "./HotDeals.jsx";
import SpecialOffers from "./SpecialOffers.jsx";
import AboutUs from "./AboutUs.jsx";
import ContactUs from "./ContactUs.jsx";
import "./index.css";
import "./responsive.css";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroComponent />
      <HotDeals />
      <SpecialOffers />
      <AboutUs />
      <ContactUs />
    </>
  );
}
