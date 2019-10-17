const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/database");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// Account email verifications

router.get("/email/:token", async (req, res) => {
  try {
    const user = await jwt.verify(req.params.token, process.env.EMAIL_SECRET);
    console.log(user);
    const updatedUser = await db.none(
      "UPDATE users SET confirmed = 'true' WHERE id = $1",
      [user.id]
    );
    req.flash("info", "Your email has been verified, you can login");
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

// Password reset verification

module.exports = router;
