const poetry = require("../../models/poetry.js");
const User = require("../../models/user.js");
const mongoose = require("mongoose");

const locals = {
    title: "Dashboard",
    description: "Meethi Supari"
};

exports.dashboard = async (req, res) => {
    try {
        const notes = await poetry.find({});
        res.render("./dashboard/index.ejs", {
            userName: req.user.firstName,
            locals,
            notes
        });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};
