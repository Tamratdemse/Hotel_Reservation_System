const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

// MySQL Database Connection Pool
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "", // Replace with your actual password
  database: "HOTEL_RESERVATION_SYSTEM", // Replace with your actual database name
};

const pool = mysql.createPool(dbConfig);

// Signup Endpoint
app.post("/signup", async (req, res) => {
  const { username, password, fullname, email, phone_number, role } = req.body;

  if (!username || !password || !fullname || !email || !phone_number) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const db = await pool.getConnection();

    // Check if username already exists
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (existingUser.length > 0) {
      db.release();
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (username, password, fullname, email, phone_number, role) VALUES (?, ?, ?, ?, ?, ?)",
      [username, hashedPassword, fullname, email, phone_number, role || "user"]
    );
    db.release();
    console.log("User registered successfully");
    res.json({ message: "Signup successful" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Login Endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const db = await pool.getConnection();

    const [user] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    db.release();
    if (user.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    console.log("User logged in successfully");
    res.json({ message: "Login successful", role: user[0].role }); // Include role for redirection
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

app.get("/hotel/:id", async (req, res) => {
  const hotelId = req.params.id;

  const query = `
      SELECT 
          h.hotel_name, 
          h.location, 
          h.rating, 
          c.category_name, 
          c.price,
          COUNT(r.room_id) AS total_rooms,
          SUM(r.is_available) AS available_rooms
      FROM Hotels h
      JOIN Category c ON h.hotel_id = c.hotel_id
      JOIN Rooms r ON c.category_id = r.category_id
      WHERE h.hotel_id = ?
      GROUP BY c.category_id;
  `;

  try {
    const db = await pool.getConnection();
    const [results] = await db.query(query, [hotelId]);
    db.release();

    if (results.length > 0) {
      const hotelDetails = {
        hotel_name: results[0].hotel_name,
        location: results[0].location,
        rating: results[0].rating,
        categories: results.map((row) => ({
          category_name: row.category_name,
          price: row.price,
          available_rooms: row.available_rooms,
          total_rooms: row.total_rooms,
        })),
      };
      res.json(hotelDetails);
    } else {
      res.status(404).json({ message: "Hotel not found" });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
