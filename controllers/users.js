const User = require("../models/user");
const passport = require("passport");

module.exports.getRegisterForm = (req, res) => {
  res.render("users/register.ejs", { title: "New Registration" });
};

module.exports.createRegistration = async (req, res, next) => {
  //   res.send(req.body);
  try {
    const { email, username, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash(
        "success",
        `Successfully Registered!!! Welcome to YelpCamp..${username}`
      );
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/users/register");
  }
};

module.exports.loginUser = (req, res) => {
  req.flash("success", `Welcome back ${req.user.username}`);
  // console.log("Redirecting to:", res.locals.redirectUrl); // Debugging
  const redirectUrl = res.locals.redirectUrl || "/campgrounds";
  delete res.locals.redirectUrl; // Clear the redirect URL after using it
  res.redirect(redirectUrl);
};

module.exports.getLoginForm = (req, res) => {
  res.render("users/login.ejs", { title: "Login Page" });
};

module.exports.logOutUser = (req, res) => {
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "GoodBYE!!!");
    res.redirect("/campgrounds");
  });
};
