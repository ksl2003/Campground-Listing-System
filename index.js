if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

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
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const dbUrl = process.env.DB_URL;

mongoose
  .connect(dbUrl)
  .then(() => console.log("Connection Succeeded..."))
  .catch((err) => console.error("Database Connection Error:", err));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("Database Connected"));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: process.env.SESSION_SECRET || "thisshouldbeaset",
  },
});

store.on("error", (e) => console.log("Session Store Error:", e));

const sessionSetup = {
  store,
  name: "session",
  secret: process.env.SESSION_SECRET || "thisshouldbeaset",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionSetup));

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com",
  "https://kit.fontawesome.com",
  "https://cdnjs.cloudflare.com",
  "https://cdn.maptiler.com",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com",
  "https://stackpath.bootstrapcdn.com",
  "https://fonts.googleapis.com",
  "https://use.fontawesome.com",
  "https://cdn.maptiler.com",
  "https://cdn.jsdelivr.net",
  "https://api.maptiler.com",
];
const connectSrcUrls = ["https://api.maptiler.com"];

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
        "https://res.cloudinary.com/dsrzwtd4v/",
        "https://images.unsplash.com/",
        "https://api.maptiler.com",
      ],
      fontSrc: ["'self'"],
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
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "https://campground-listing-system-1.onrender.com/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            user.googleId = profile.id;
            await user.save();
          } else {
            user = await User.create({
              email: profile.emails[0].value,
              googleId: profile.id,
              username: profile.emails[0].value,
            });
          }
        }

        return cb(null, user);
      } catch (err) {
        console.error("Error during Google login:", err);
        return cb(err);
      }
    }
  )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.mapTilerApiKey = process.env.MAPTILER_API_KEY;
  next();
});

app.use("/campgrounds", campgroundRoute);
app.use("/campgrounds/:id/reviews", reviewRoute);
app.use("/users", userRoute);

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
    req.flash("success", "Welcome back!");
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

app.all(/(.*)/, (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("errorHandle", { message, title: "Error Handling" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serving from Port ${port}...`);
});
