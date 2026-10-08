const express = require("express");
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");
const { renderSignupForm } = require("../controllers/users.js");
const router = express.Router();
  router.get("/signup",userController.renderSignupForm);

  router.post("/signup",wrapAsync(userController.signup));

  router.get("/login",userController.renderLoginForm);

  router.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}), userController.login);
  router.get("/logout",userController.logout);
module.exports = router;