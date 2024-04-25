const express = require("express");
const router = express.Router();
const session = require("express-session");
const passport = require("passport");
const google_user = require("../../models/google_user");
const MongoStore = require("connect-mongo");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Add express-session middleware
router.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);

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
        let user = await google_user.findOne({ googleId: profile.id });

        if (user) {
          done(null, user);
        } else {
          user = await google_user.create(newUser);
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

// Destroy User session
router.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.log(error);
      res.send("Error loggin out");
    } else {
      res.redirect("/");
    }
  });
});

// persist user data from authentication
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// retrieve
passport.deserializeUser(async (id, done) => {
  try {
    const user = await google_user.findById(id).exec();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = router;
