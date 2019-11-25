const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/database");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const { registerValidation } = require("./validations/registrationValidation");

const transporter = require("../config/mailer");

// Example of db request
// db.any('SELECT * FROM users').then((data) => {
//     console.log(data)
// }).catch((err) => { console.log(err) })

const sendEmailVerfication = async (user, transporter) => {
  jwt.sign(
    { id: newUser.id },
    process.env.EMAIL_SECRET,
    {
      expiresIn: "1d"
    },
    (err, emailToken) => {
      if (err) {
        console.error(err);
        return next(err);
      } else {
        const url = `http://gamestegy.com/verifications/email/${emailToken}`;
        // NEED TO IMPLEMENT TRANSPORT OF EMAIL

        transporter.sendMail({
          from: '"GameStegy support" <account@gamestegy.com>', // sender address
          to: user.email, // list of receivers
          subject: "Verify your email address", // Subject line
          html: `<body>Hello, please verify your email at: ${url}</body>` // html body
        });
      }
    }
  );
};

const registerValidationMiddleware = async (req, res, next) => {
  // validate req.body, which contains form inputs
  // if something is amiss create error
  const { error } = registerValidation(req.body);

  // If error is created return an html render
  if (error) {
    const { username, email, password1, password2 } = req.body;
    const errorMessage = error.message;
    return res.render("register", {
      errorMessage,
      username,
      email,
      password1,
      password2,
      title: "Sign Up"
    });
  }

  // Get from database the entered email address
  const emailExists = await db.one(
    "SELECT EXISTS (SELECT * FROM users WHERE email = $1)",
    [req.body.email]
  );

  // If email already exists also return html render
  if (emailExists.exists) {
    const { username, email, password1, password2 } = req.body;
    const errorMessage = "Email already in use";
    return res.render("register", {
      errorMessage,
      username,
      email,
      password1,
      password2,
      title: "Sign Up"
    });
  }

  // Check if user exists in database

  next();
};

const createAndLoginUserMiddleware = async (req, res, next) => {};

// Route to get to the register page
router.get("/", (req, res) => res.render("register", { title: "Sign Up" }));

// Route to register an user
router.post("/", registerValidationMiddleware, async (req, res, next) => {
  try {
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(req.body.password1, saltRounds);
    const newUsername = req.body.username;
    const newUserEmail = req.body.email;

    newUser = await db.one(
      "INSERT INTO users(username, password, email) VALUES ($1, $2, $3) RETURNING *",
      [newUsername, hashedPassword, newUserEmail]
    );
    console.log(newUser);

    // If newuser has been created send a verification mail to him
    if (newUser) {
      sendEmailVerfication(newUser, transporter);
      req.flash("info", "Verification email has been sent out");
      return res.redirect("/");
    }

    // Login the new User using Passport Js method
  } catch (error) {
    // Database error checks
    const { username, email, password1, password2 } = req.body;
    const errorCode = error.code;
    switch (errorCode) {
      case "23505":
        const errorMessage = "Email or username is already in use";
        return res.render("register", {
          errorMessage,
          username,
          email,
          password1,
          password2,
          title: "Sign Up"
        });
        break;
      default:
        break;
    }

    next(error);
  }
});

module.exports = router;
