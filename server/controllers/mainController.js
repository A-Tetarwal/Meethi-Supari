// get home page

// app.get("/", (req, res) => {
//     res.render("home.ejs");
// });

exports.homepage = async(req, res) => {
    res.render("home.ejs");    
}

// get about
exports.about = async(req, res) => {
    res.render("about.ejs");    
}

// get login
exports.login = async(req, res) => {
    res.render("login.ejs");    
}

// get signup
exports.signup = async(req, res) => {
    res.render("signup.ejs");    
}

// get poems
exports.poems = async(req, res) => {
    res.render("poems.ejs");    
}

// get diary
exports.diary = async(req, res) => {
    res.render("diary.ejs");    
}