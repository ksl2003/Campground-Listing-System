if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// console.log(process.env.SECRET);
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const helmet = require("helmet");
const mongoSanitizer = require("express-mongo-sanitize");
const ejsMate = require("ejs-mate");
const path = require("path");
const methodOverride = require("method-override");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/expressError");
const campgroundRoute = require("./routes/campground.js");
const reviewRoute = require("./routes/reviews.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const passportLocal = require("passport-local");
const User = require("./models/user.js");
const userRoute = require("./routes/user.js");
const { isLoggedIn, storeReturnTo } = require("./middleware.js");
const dbUrl = process.env.DB_URL;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const dbUrl = "mongodb://127.0.0.1:27017/yelpCampProj";
// Mongoose Connection Open
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Connection Succeeded...");
  })
  .catch((err) => {
    console.error("Database Connection Error:", err);
  });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database Connected");
});

// MongoStore for session storage
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: "thisshouldbeabettersecret!",
  },
});

store.on("error", function (e) {
  console.log("Store Error", e);
});

//Session Middleware
const sessionSetup = {
  store,
  name: "session",
  secret: "thisshouldbeasecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionSetup));

// Middlewares
// app.use(
//   helmet({
//     contentSecurityPolicy: false,
//   })
// );

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.maptiler.com/",
  "https://cdn.jsdelivr.net/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.maptiler.com/",
  "https://cdn.jsdelivr.net/",
  "https://api.maptiler.com/",
];
const connectSrcUrls = ["https://api.maptiler.com/"];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dsrzwtd4v/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
        "https://api.maptiler.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(flash());
app.use(
  mongoSanitizer({
    replaceWith: "_",
  })
);

// Use static Files from below path.
app.use(express.static(path.join(__dirname, "public")));
//Passport Usage
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "https://campground-listing-system.onrender.com/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        // Check if a user with the same Google ID already exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // If no user with the Google ID exists, check if a user with the same email exists
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // If a user with the same email exists, associate the Google ID with the user
            user.googleId = profile.id;
            await user.save();
          } else {
            // If no user with the same email exists, create a new user
            user = await User.create({
              email: profile.emails[0].value,
              googleId: profile.id,
              username: profile.emails[0].value, // Optional: Use email as username
            });
          }
        }

        // Log the user in
        return cb(null, user);
      } catch (err) {
        console.error("Error during Google login:", err);
        return cb(err, null);
      }
    }
  )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // Setting global variables
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});
//Routers
app.use("/campgrounds", campgroundRoute);
app.use("/campgrounds/:id/reviews", reviewRoute);
app.use("/users", userRoute);

// Requests
app.get("/", (req, res) => {
  res.render("campgrounds/homePage", { title: "Home Page" });
});

app.get(
  "/auth/google",
  storeReturnTo,
  passport.authenticate("google", {
    scope: ["profile", "email"],
    failureRedirect: "/users/login",
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/users/login",
    failureFlash: true,
  }),
  (req, res) => {
    // console.log("Google OAuth callback triggered");
    // console.log("Authenticated user:", req.user);
    req.flash("success", "Welcome back!");
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

// TOTAL ERROR HANDLING

// Triggers when we doesn't have the page for the request made.
app.all(/(.*)/, (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

//Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res
    .status(statusCode)
    .render("errorHandle", { message, title: "Error Handling" });
});

// Starting the APP.

app.listen(3000, () => {
  // console.log(typeof Campground.schema.obj.price());
  console.log("Serving from Port 3000...");
});
