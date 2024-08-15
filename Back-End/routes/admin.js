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
  database: "HOTEL_RESERVATION_SYSTE",
});

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "your_default_jwt_secret";

// Admin Login Endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const connection = await pool.getConnection();

    const [admins] = await connection.query(
      "SELECT * FROM admins WHERE email = ?",
      [email]
    );

    if (admins.length === 0) {
      connection.release();
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const admin = admins[0];

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      connection.release();
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        admin_id: admin.admin_id,
        name: admin.admin_name,
        admin_type: admin.admin_type,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    connection.release();
    res.json({ token });
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Token Validation Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Handle Bearer token

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, admin) => {
    if (err) return res.sendStatus(403);
    req.admin = admin;
    next();
  });
}

module.exports = router;
