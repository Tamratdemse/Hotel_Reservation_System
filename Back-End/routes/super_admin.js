const express = require("express");
const mysql = require("mysql2/promise");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// MySQL connection pool setup
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "HOTEL_RESERVE",
});

const JWT_SECRET = process.env.JWT_SECRET;

// Token Validation Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, JWT_SECRET, (err, admin) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.admin = admin;
    next();
  });
}

// Apply the middleware to all routes below this line
router.use(authenticateToken);

// Endpoint to get hotel statistics and all hotels
router.get("/statistics", async (req, res) => {
  try {
    // Fetch hotel count
    const countQuery = "SELECT COUNT(*) AS hotelCount FROM hotels";
    const [countResults] = await pool.query(countQuery);
    const hotelCount = countResults[0].hotelCount;

    // Fetch all hotels
    const hotelsQuery = "SELECT * FROM hotels";
    const [hotelsResults] = await pool.query(hotelsQuery);

    // Return both hotel count and list of hotels
    res.status(200).json({
      hotelCount,
      hotels: hotelsResults,
    });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Database query failed" });
  }
});

// Endpoint to add a hotel
router.post("/add_hotels", async (req, res) => {
  const { hotel_name, location, photo, rating, subaccount_id } = req.body;

  const query = `
    INSERT INTO hotel (hotel_name, location, rating, subaccount_id,photo)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await pool.query(query, [
      hotel_name,
      location,
      rating,
      subaccount_id,
      photo,
    ]);

    const hotelId = result.insertId;
    const [hotelDetails] = await pool.query(
      "SELECT * FROM hotel WHERE hotel_id = ?",
      [hotelId]
    );

    res.status(201).json({
      message: "Hotel added successfully",
      hotel: hotelDetails[0].hotel_id,
    });
  } catch (error) {
    console.error("Error adding hotel:", error);
    return res.status(500).json({ error: "Failed to add hotel" });
  }
});

// Endpoint to add an admin
router.post("/add_admin", async (req, res) => {
  const { hotel_id, admin_name, email, admin_type, phone_no, password } =
    req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO admins (hotel_id, admin_name, admin_type, phone_no, email, password)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await pool.query(query, [
      hotel_id,
      admin_name,
      admin_type,
      phone_no,
      email,
      hashedPassword,
    ]);

    res.status(201).json({
      message: "Admin added successfully",
      adminId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding admin:", error);
    return res.status(500).json({ error: "Failed to add admin" });
  }
});

// Endpoint to delete a hotel
router.delete("/delete_hotel/:id", async (req, res) => {
  const hotelId = req.params.id;

  const query = "DELETE FROM hotels WHERE hotel_id = ?";

  try {
    const [result] = await pool.query(query, [hotelId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    res.status(200).json({ message: "Hotel deleted successfully" });
  } catch (error) {
    console.error("Error deleting hotel:", error);
    return res.status(500).json({ error: "Failed to delete hotel" });
  }
});

module.exports = router;
