const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const reviews = require("../controllers/reviews.js");
const {
  reviewValidate,
  isLoggedIn,
  isReviewAuthorValid,
} = require("../middleware.js");

router.post(
  "/new",
  isLoggedIn,
  reviewValidate,
  catchAsync(reviews.newReviewCreate)
);

router.delete(
  "/:reviewID",
  isLoggedIn,
  isReviewAuthorValid, // This is added to remove delete access for whom make this requests in Postman,etc.
  catchAsync(reviews.deleteReview)
);

module.exports = router;
