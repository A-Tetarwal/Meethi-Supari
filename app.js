const express = require("express");
const mysql = require("mysql2");
// const bcrypt = require('bcryptjs');
const app = express();
const path = require("path");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));


// database here

app.get("/", (req, res) => {
    res.render("home.ejs");
  });

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});