const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

const users = require("./routes/user");
const super_admin = require("./routes/super_admin");
const admin = require("./routes/admin");

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

app.use("/user", users);
app.use("/super_admin", super_admin);
app.use("/admin", admin);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
