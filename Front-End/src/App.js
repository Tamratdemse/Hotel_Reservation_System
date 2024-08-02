import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Registration from "./components/Registration";
import Home from "./Landing Page/Home.jsx";
import AdminDashboard from "./components/adminDashboard";
import HotelListing from "./components/Hotel Listing/HotelListing.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/list-of-hotels" element={<HotelListing />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
