const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const request = require("request");
const { Chapa } = require("chapa-nodejs");
require("dotenv").config();

const router = express.Router();
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "HOTEL_RESERVATION_SYSTE",
});

const JWT_SECRET = process.env.JWT_SECRET;
const chapa = new Chapa({
  secretKey: process.env.secret_Key,
});

// Endpoint to get number of users, hotels, and rooms
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

// User registration endpoint
router.post("/register", async (req, res) => {
  const { name, email, phone_number, id_card_front, id_card_back, password } =
    req.body;

  try {
    const connection = await pool.getConnection();

    // Check if the user already exists
    const [existingUser] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    await connection.query(
      "INSERT INTO users (name, email, phone_number, id_card_photo_front, id_card_photo_back, password, user_type) VALUES (?, ?, ?, ?, ?, ?, 'user')",
      [name, email, phone_number, id_card_front, id_card_back, hashedPassword]
    );

    // Fetch the user ID of the newly inserted user by email
    const [newUser] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    const newUserId = newUser[0].user_id; // Assuming 'id' is the column name for user ID

    // Create a JWT token with the actual user ID from the database
    const token = jwt.sign(
      { id: newUserId, name: name, user_type: "user" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    connection.release();
    res.status(201).json({ token });
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// User login endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      connection.release();
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.user_id, name: user.name, user_type: user.user_type },
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
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    console.log("Decoded user from token:", user); // Log the user object
    req.user = user;
    next();
  });
}

// Protected Reservation Endpoint
router.post("/reservation", authenticateToken, async (req, res) => {
  const { hotel_id, category_id, duration } = req.body;
  console.log(req.user.id);

  try {
    const connection = await pool.getConnection();

    const [rooms] = await connection.query(
      "SELECT room_number FROM Rooms WHERE hotel_id = ? AND category_id = ? AND is_available = 1 LIMIT 1",
      [hotel_id, category_id]
    );

    if (rooms.length === 0) {
      connection.release();
      return res.status(400).json({ error: "No available rooms" });
    }

    const room_number = rooms[0].room_number;
    const [categories] = await connection.query(
      "SELECT price FROM Category WHERE category_id = ?",
      [category_id]
    );

    if (categories.length === 0) {
      connection.release();
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const price = categories[0].price;
    const total_price = price * duration;
    const reservation_date = new Date();

    await connection.query(
      "INSERT INTO Reservation (user_id, hotel_id, category_id, room_number, reservation_date, duration, total_price, reservation_status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid')",
      [
        req.user.id,
        hotel_id,
        category_id,
        room_number,
        reservation_date,
        duration,
        total_price,
      ]
    );

    await connection.query(
      "UPDATE Rooms SET is_available = 0 WHERE room_number = ?",
      [room_number]
    );

    connection.release();
    res.status(201).json({ message: "Reservation created successfully" });
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// User status endpoint to get reservations
router.post("/status", authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [reservations] = await connection.query(
      "SELECT * FROM Reservation WHERE user_id = ?",
      [req.user.id]
    );
    connection.release();
    res.json(reservations);
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Payment implementation
// Endpoint to initialize a split payment
router.get("/initialize", async (req, res) => {
  const { hotel_id, amount, email, first_name, last_name } = req.query;

  const query = "SELECT subaccount_id FROM hotels WHERE hotel_id = ?";
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query(query, [hotel_id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    const subaccountId = results[0].subaccount_id;
    const tx_ref = await chapa.generateTransactionReference();
    const payload = {
      amount: amount,
      currency: "ETB",
      email: email,
      first_name: first_name,
      last_name: last_name,
      tx_ref: tx_ref,
      callback_url: "http://www.google.com",
      return_url: "http://www.google.com",
      customization: {
        title: "Hotel Payment",
        description: `Payment for hotel`,
      },
      subaccounts: {
        id: subaccountId,
      },
    };

    const options = {
      method: "POST",
      url: "https://api.chapa.co/v1/transaction/initialize",
      headers: {
        Authorization: `Bearer ${process.env.secret_Key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    request(options, (error, response) => {
      if (error) {
        console.error("Request Error:", error.message);
        return res.status(500).json({ error: error.message });
      }

      const data = JSON.parse(response.body);
      if (data.status === "failed" || !data.data || !data.data.checkout_url) {
        return res.status(400).json({
          error:
            data.message && data.message["subaccounts.id"]
              ? data.message["subaccounts.id"][0]
              : "Failed to initialize transaction.",
          response: data,
        });
      }

      res.redirect(data.data.checkout_url);
    });

    connection.release();
  } catch (error) {
    console.error("Database query error:", error.message);
    res.status(500).json({ error: "Database query error" });
  }
});

// Payment completion endpoint
router.get("/payment-complete", async (req, res) => {
  const { tx_ref, status } = req.query;
  console.log(
    `Payment complete. Transaction reference: ${tx_ref}, Status: ${status}`
  );

  try {
    const response = await chapa.verify({ tx_ref });
    res.send(
      `Payment complete! Transaction reference: ${tx_ref}, Status: ${status}, Verification: ${JSON.stringify(
        response.data,
        null,
        2
      )}`
    );
  } catch (error) {
    console.error("Verification Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/*-callback_url=
	Function that runs when payment is successful. This should
   ideally be a script that uses the verify endpoint
   on the Chapa API to check the status of the transaction.

 -return_url=
 	Web address to redirect the user after payment is successful
   */

/* Endpoint to handle the return  from Chapa but now this end point is not assign in callback_url
rather it's "http://www.google.com" b/c the return_url url must be actual url 
same thing for callback_url...
 */

router.get("/callback", (req, res) => {
  const { tx_ref, status } = req.query;
  res.status(200).send("OK");
});

module.exports = router;
