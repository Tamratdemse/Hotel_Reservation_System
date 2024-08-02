import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./registration.css";

const Registration = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [user, setUser] = useState("user");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsSignup(!isSignup);
    setErrorMessage(
      ""
    ); /* Reset error message when toggling if the user choose 
    or change his/her idea to log but previuos encounter signup error */
  };

  const handleSubmit = async (e, url) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const response = await axios.post(`http://localhost:5000${url}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response.data);
      setErrorMessage(""); // Reset error message
      e.target.reset(); // Reset form fields after successful submission

      // Redirect based on user role
      if (user === "admin") {
        navigate("/adminDashboard");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message); // Set error state if encounter error from the backend
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div>
      <Link to="/">
        <div className="registration-logo">
          <img src="img/nafLogo.png" alt="Logo" />
        </div>
      </Link>
      <div className="registration-container">
        <div className={`wrapper ${isSignup ? "active" : ""}`}>
          <div className="form signup">
            <header className="signup-header" onClick={toggleForm}>
              Signup
            </header>
            <form onSubmit={(e) => handleSubmit(e, "/signup")}>
              <select value={user} onChange={(e) => setUser(e.target.value)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="text"
                placeholder="Full name"
                name="fullname"
                required
              />
              <input
                type="email"
                placeholder="Email address"
                name="email"
                required
              />
              <input
                type="text"
                name="phone_number"
                placeholder="Phone number"
                required
              />
              <input
                type="text"
                name="username"
                placeholder="User name"
                required
              />
              <input
                type="password"
                placeholder="Password"
                name="password"
                required
              />
              {user === "admin" ? (
                <input type="number" placeholder="ID" name="id" required />
              ) : null}
              <input
                className="btn"
                type="submit"
                name="submit"
                value="Signup"
              />
            </form>
          </div>

          <div className="form login">
            <header className="login-header" onClick={toggleForm}>
              Login
            </header>
            <form onSubmit={(e) => handleSubmit(e, "/login")}>
              <input
                type="text"
                name="username"
                placeholder="User name"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
              />
              <input type="submit" value="Login" />
            </form>
          </div>
          {errorMessage && <div className="error">{errorMessage}</div>}
        </div>
      </div>
    </div>
  );
};

export default Registration;
