exports.isLoggedIn = function (req, res, next){
    console.log("User:", req.user); // Log the user object
    if (req.user) {
        next();
    }else{
        return res.status(401).send("Access Denied");
    }
}