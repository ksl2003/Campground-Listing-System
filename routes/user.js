const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const { storeReturnTo } = require("../middleware");
const users = require("../controllers/users");

router
  .route("/register")
  .get(users.getRegisterForm)
  .post(catchAsync(users.createRegistration));

router
  .route("/login")
  .get(users.getLoginForm)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/users/login",
    }),
    users.loginUser
  );

router.get("/logout", users.logOutUser);
module.exports = router;
