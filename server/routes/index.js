const express = require("express")
const router = express.Router();
const mainController = require("../controllers/mainController");

// app.get("/", (req, res) => {
//     res.render("home.ejs");
// });
router.get("/", mainController.homepage);
router.get("/about", mainController.about);
router.get("/login", mainController.login);
router.get("/signup", mainController.signup);
router.get("/poems", mainController.poems);
router.get("/diary", mainController.diary);
module.exports = router;