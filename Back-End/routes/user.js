const express = require("express");

const mysql = require("mysql2/promise");
const router = express.Router();

const dbConfig = {
    host: "localhost",
    user: "root",
    password: "", // Replace with your actual password
    database: "HOTEL_RESERVATION_SYSTEM", // Replace with your actual database name
  };

//End point to get number of user , hotels and rooms
router.get("/", async (req, res) => {
  try {
    const db = await mysql.createConnection(dbConfig);

    const [[{ userCount }]] = await db.query(
      "SELECT COUNT(*) AS userCount FROM users"
    );
    const [[{ hotelCount }]] = await db.query(
      "SELECT COUNT(*) AS hotelCount FROM Hotel"
    );
    const [[{ roomCount }]] = await db.query(
      "SELECT COUNT(*) AS roomCount FROM Rooms"
    );

    res.json({ userCount, hotelCount, roomCount });
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to get all hotels
router.get("/hotel", async (req, res) => {
  try {
    const db = await mysql.createConnection(dbConfig);
    const [results] = await db.query("SELECT * FROM Hotel");
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
    const db = await mysql.createConnection(dbConfig);
    const [results] = await db.query(
      "SELECT * FROM Category WHERE hotel_id = ?",
      [hotelId]
    );
    res.json(results);
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
