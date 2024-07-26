const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

// MySQL Database Connection
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "", // Replace with your actual password
  database: "userdb", // Replace with your actual database name
};

// Signup Endpoint
app.post("/signup", async (req, res) => {
  const { username, password, fullname, email, phone_number, role } = req.body;

  if (!username || !password || !fullname || !email || !phone_number) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const db = await mysql.createConnection(dbConfig);

    // Check if username already exists
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (username, password, fullname, email, phone_number, role) VALUES (?, ?, ?, ?, ?, ?)",
      [username, hashedPassword, fullname, email, phone_number, role || "user"]
    );
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
    const db = await mysql.createConnection(dbConfig);

    const [user] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
