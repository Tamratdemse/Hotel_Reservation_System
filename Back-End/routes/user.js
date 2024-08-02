const express = require("express");
const mysql = require("mysql2/promise");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // Replace with your actual password
  database: "HOTEL_RESERVATION_SYSTEM", // Replace with your actual database name
});

// End point to get number of users, hotels, and rooms
router.get("/", async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [[{ userCount }]] = await connection.query(
      "SELECT COUNT(*) AS userCount FROM users"
    );
    const [[{ hotelCount }]] = await connection.query(
      "SELECT COUNT(*) AS hotelCount FROM Hotel"
    );
    const [[{ roomCount }]] = await connection.query(
      "SELECT COUNT(*) AS roomCount FROM Rooms"
    );

    connection.release();
    res.json({ userCount, hotelCount, roomCount });
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to get all hotels
router.get("/hotel", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query("SELECT * FROM Hotel");
    connection.release();
    res.json(results);
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to get categories by hotel ID
router.get("/hotel/:id", async (req, res) => {
  const hotelId = req.params.id;

  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query(
      `SELECT 
          c.category_id, 
          c.category_name, 
          c.price,
          COUNT(r.room_id) AS total_rooms,
          SUM(r.is_available) AS available_rooms
      FROM Category c
      JOIN Rooms r ON c.category_id = r.category_id
      WHERE c.hotel_id = ?
      GROUP BY c.category_id`,
      [hotelId]
    );
    connection.release();
    res.json(results);
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/login-2", (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  // Create a JWT token
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Token Validation Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Protected Reservation Endpoint
router.post("/reservation", authenticateToken, (req, res) => {
  const { duration } = req.body;
  if (!duration) {
    return res.status(400).send("Duration is required");
  }

  console.log("Duration:", duration);
  console.log("User Info from Token:", req.user);

  res.status(200).send("Reservation request received -tame new man");
});

module.exports = router;
