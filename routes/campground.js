const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const campground = require("../controllers/campgrounds.js");
const multer = require("multer");
const { storage } = require("../cloudinary/config.js");
const upload = multer({ storage });
const {
  isLoggedIn,
  campGroundValidate,
  isAuthorValid,
} = require("../middleware.js");

router.get("/", catchAsync(campground.allCampgrounds));

// Create New Campground

router
  .route("/new")
  .get(isLoggedIn, campground.renderNewForm)
  .post(
    isLoggedIn,
    upload.array("images"),
    campGroundValidate,
    catchAsync(campground.newFormPost)
  );

router.delete(
  "/:id/delete",
  isLoggedIn,
  isAuthorValid,
  catchAsync(campground.deleteCampground)
);

//Editing Mode

router
  .route("/:id/edit")
  .get(isLoggedIn, isAuthorValid, catchAsync(campground.getEditForm))
  .put(
    isLoggedIn,
    isAuthorValid,
    upload.array("images"),
    campGroundValidate,
    catchAsync(campground.editCampground)
  );

router.get("/:id", catchAsync(campground.getSingleCampground));

module.exports = router;
