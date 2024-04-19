const express = require("express");
const router = express.Router();
const session = require("express-session");
const passport = require("passport");
const User = require("../../models/user");
const GoogleAuth = require("../../models/googleAuth"); 
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Add express-session middleware
router.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  }));
  
  // Initialize passport middleware
  router.use(passport.initialize());
  router.use(passport.session());
  

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async function (accessToken, refreshToken, profile, done) {
      const newUser = {
        googleId: profile.id,
        displayName: profile.displayName,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        profileImage: profile.photos[0].value,
      };

      try {
        let user = await GoogleAuth.findOne({ googleId: profile.id });

        if (user) {
          done(null, user);
        } else {
          user = await GoogleAuth.create(newUser);
          done(null, user);
        }
      } catch (error) {
        console.log(error);
        done(error, null);
      }
    }
  )
);


// Google login route
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// Retrieve user data
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login-failure",
    successRedirect: "/dashboard",
  })
);

// login-failure route
router.get("/login-failure", (req, res) => {
  res.send("something went wrong");
});

// persist user data from authentication
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// retrieve
// passport.deserializeUser((id, done) => {
//   GoogleAuth.findById(id, function (err, user) {
//     done(err, user);
//   });
// });
passport.deserializeUser(async (id, done) => {
    try {
      const user = await GoogleAuth.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  
module.exports = router;
