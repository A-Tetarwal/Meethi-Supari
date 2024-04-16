require('dotenv').config();

const express = require("express");
const expressLayout = require('express-ejs-layouts')

const mysql = require("mysql2");
const bcrypt = require('bcryptjs');
const app = express();
const path = require("path");

const mongoose = require('mongoose');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));


// database here

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/about", (req, res) => {
    res.render("about.ejs");
});

// for signup
app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});
const User = require('./models/user.js'); // Import the User model

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
      // Check if a user with the same email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          // If user already exists, redirect back to the signup page with an error message
          return res.render("signup", { error: "User with this email already exists" });
      }

      // Hash the password before saving it to the database
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

      // Create a new user instance with the provided data
      const newUser = new User({
          username,
          email,
          password: hashedPassword // Save the hashed password
      });

      // Save the new user to the database
      await newUser.save();

      // Redirect to the login page or any other page as needed
      res.redirect("/login");
  } catch (error) {
      // If an error occurs, render the signup page with an error message
      console.error("Error signing up user:", error);
      res.render("signup", { error: "An error occurred while signing up. Please try again later." });
  }
});

// for login
app.get("/login", (req, res) => {
  res.render("login");
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // If user doesn't exist, render the login page with an error message
    if (!user) {
      return res.render("login", { error: "Invalid email or password" });
    }

    // Compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If passwords don't match, render the login page with an error message
    if (!isPasswordValid) {
      return res.render("login", { error: "Invalid email or password" });
    }

    // If the credentials are valid, you can set a session variable to indicate the user is logged in
    // req.session.userId = user._id;

    // Redirect to the home page or any other authenticated page
    res.redirect("/");
  } catch (error) {
    // If an error occurs, render the login page with an error message
    console.error("Error logging in user:", error);
    res.render("login", { error: "An error occurred while logging in. Please try again later." });
  }
});

app.get("/poems", (req, res) => {
  res.render("poems.ejs");
});

app.get("/diary", (req, res) => {
  res.render("diary.ejs");
});


// Connect to MongoDB Atlas
// mongoose.connect('mongodb+srv://A-Tetarwal:koWexXCQvx7O7Eqi@cluster0.km9ovrx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  mongoose.connect('mongodb+srv://A-Tetarwal:koWexXCQvx7O7Eqi@cluster0.km9ovrx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // other options
}).then(() => {
    console.log('Connected to MongoDB Atlas');
}).catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err.message);
});

// Start the server
const PORT = 5000 || process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});