const {
  campGroundSchema,
  reviewSchema,
} = require("./models/joiValidationSchema.js");
const ExpressError = require("./utils/expressError.js");
const Campground = require("./models/campground.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // Store the url to be redirected to..
    // console.log(req.originalUrl);
    req.session.returnTo = req.originalUrl;
    // console.log(req.method);
    // I can access the req.params.id here because all POST requests are inside the campgrounds/:id
    if (req.method != "GET") {
      req.session.returnTo = `/campgrounds/${req.params.id}`;
    }
    // console.log(req.session.returnTo);
    req.flash("error", "You should Log-in First");
    return res.redirect("/users/login");
  } else {
    next();
  }
};

module.exports.storeReturnTo = (req, res, next) => {
  // console.log(req.session);
  if (req.session.returnTo) {
    res.locals.redirectUrl = req.session.returnTo;
    // console.log(req.session.returnTo);
    // console.log(res.locals.redirectUrl);
  }
  next();
};

module.exports.campGroundValidate = (req, res, next) => {
  const { error } = campGroundSchema.validate(req.body);
  if (error) {
    let message = error.details[0].message;
    throw new ExpressError(message, 400);
  }
  console.log("Successfully processed data in JOI.");
  next();
};

module.exports.isAuthorValid = async (req, res, next) => {
  const { id } = req.params;
  const findElement = await Campground.findById(id);
  if (findElement && !findElement.author.equals(res.locals.currentUser._id)) {
    req.flash("error", "You not have the access to this Page... 404 ERROR");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.isReviewAuthorValid = async (req, res, next) => {
  const { reviewID } = req.params;
  const review = await Review.findById(reviewID);
  if (review && !review.author.equals(res.locals.currentUser._id)) {
    req.flash("error", "You not have the access to this Page... 404 ERROR");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.reviewValidate = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    let message = error.details[0].message;
    throw new ExpressError(message, 400);
  }
  console.log("Successfully processed Review in JOI");
  next();
};
