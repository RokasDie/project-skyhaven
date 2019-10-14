const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/database");
const passport = require("passport");
const { loginValidation } = require("./validations/loginValidation");
const { registerValidation } = require("./validations/registrationValidation");

const transporter = require("../config/mailer");

router.get("/", (req, res) => {
  res.render("login", { title: "Sign In" });
});

router.post("/", (req, res, next) => {
  console.log("login sudas");
  // pre login validation to confirm that correct values are entered
  const { error } = loginValidation(req.body);
  if (error) {
    const { email, password } = req.body;
    const errorMessage = error.message;
    return res.render("login", {
      errorMessage,
      email,
      password,
      title: "Sign In"
    });
  }
  // go through passport login authentication
  passport.authenticate("login", (err, user, info) => {
    if (!user) {
      const { email, password } = req.body;
      const errorMessage = info.message;
      return res.render("login", {
        errorMessage,
        email,
        password,
        title: "Sign In"
      });
    }
    req.login(user, err => {
      if (err) {
        return next(err);
      }
      // If succesful login redirect
      console.log(req.user);
      res.redirect("/");
    });
  })(req, res, next);
});

module.exports = router;
