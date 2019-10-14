const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/database");
const passport = require("passport");

const transporter = require("../config/mailer");

// Example of db request
// db.any('SELECT * FROM users').then((data) => {
//     console.log(data)
// }).catch((err) => { console.log(err) })

// Route to go to user dashboard
router.get("/dashboard", async (req, res) => {
  res.render("userDashboard", { title: `${req.user.username} - Dashboard` });
});

// Route to log out
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
