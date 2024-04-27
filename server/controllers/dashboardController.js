const e = require("express");
const poetry = require("../../models/poetry.js");
const User = require("../../models/user.js");
const mongoose = require("mongoose");



exports.dashboard = async (req, res) => {
    let perPage = 12;
    let page = req.query.page || 1;

    const locals = {
    title: "Dashboard",
    description: "Meethi Supari"
    };

    try {
        const countPromise = poetry.countDocuments({user: new mongoose.Types.ObjectId(req.user.id)});
        const notesPromise = poetry.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
            {
                $project: {
                    tittle: { $substr: ["$title", 0, 30] },
                    body: { $substr: ["$body", 0, 100] },
                },
            },
            {
                $sort: {
                    createdAt: -1,
                }
            },
            {
                $skip: perPage * page - perPage
            },
            {
                $limit: perPage
            }
        ]).exec();

        const [count, notes] = await Promise.all([countPromise, notesPromise]);
        
        res.render("./dashboard/index.ejs", {
                    userName: req.user.firstName,
                    notes,
                    locals,
                    current: page,
                    pages: Math.ceil(count / perPage),
        });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};


exports.dashboardViewNote = async (req, res) => {
    const locals = {
        title: "Dashboard",
        description: "Meethi Supari"
    };
    try {
        const note = await poetry.findById({
            _id: req.params.id,
        }).where({
            user: req.user.id,
        }).lean()
        .exec();
        if (!note) {
            return res.status(404).send("Note not found");
        }
        res.render("./dashboard/view-notes", {
            noteID: req.params.id, // pass noteID along with note
            note,
            locals
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

// PUT / Update specific note
exports.dashboardUpdateNote = async (req, res) => {
    try {

        await poetry.findOneAndUpdate(
            { _id: req.params.id },
            { title: req.body.title, body: req.body.body}
        ).where({user: req.user.id});
        res.redirect("/dashboard");

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

// Delete note
exports.dashboardDeleteNote = async (req, res) => {
    try {
        await poetry.deleteOne({ _id: req.params.id }).where({user: req.user.id});
        res.redirect("/dashboard");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

/* 
* GET /
* Add notes
 */

exports.dashboardAddNote = async (req, res) => {
    res.render("./dashboard/add", {})
};

exports.dashboardAddNoteSubmit = async(req, res) => {
    try {
        req.body.user = req.user.id;
        await poetry.create(req.body);
        res.redirect("/dashboard");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

// get / search
exports.dashboardSearch = async (req, res) => {
    try {
        res.render("./dashboard/search", {
            searchResults: ""
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

// post search for notes
exports.dashboardSearchSubmit = async (req, res) => {
    try {
        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9]/g, " ");

        const searchResults = await poetry.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChars, "i") } },
                { body: { $regex: new RegExp(searchNoSpecialChars, "i") } }
            ]
        }).where({ user: req.user.id });

        // Render dropdown instead of a separate page
        res.render("./dashboard/index.ejs", {
            userName: req.user.firstName,
            notes: searchResults, // Pass search results to the notes variable
            locals: {
                title: "Dashboard",
                description: "Meethi Supari"
            },
            current: 1, // Reset pagination to the first page
            pages: 1, // Since it's a dropdown, there's only one page
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}
