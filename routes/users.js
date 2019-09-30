const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/database");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const {
  registerValidation,
  loginValidation
} = require("../config/validations");

// Example of db request
// db.any('SELECT * FROM users').then((data) => {
//     console.log(data)
// }).catch((err) => { console.log(err) })

const createUserMiddleware = async (req, res, next) => {
  try {
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(req.body.password1, saltRounds);
    const newUsername = req.body.username;
    const newUserEmail = req.body.email;

    newUser = await db.one(
      "INSERT INTO users(username, password, email) VALUES ($1, $2, $3) RETURNING id",
      [newUsername, hashedPassword, newUserEmail]
    );
    console.log(newUser);
    next();
  } catch (error) {
    console.log(error);
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
};

const userSingIn = async (req, res, next) => {};

router.get("/posts", (req, res) => res.render("posts", { title: "Posts" }));

router.get("/login", (req, res) => res.render("login", { title: "Sign In" }));

router.post("/login", (req, res, next) => {
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
  passport.authenticate("login", (err, user, info) => {
    console.log("sudas");
  })(req, res, next);
});

router.get("/register", (req, res) =>
  res.render("register", { title: "Sign Up" })
);

router.post(
  "/register",
  async (req, res, next) => {
    const { error } = registerValidation(req.body);
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

    const emailExists = await db.one(
      "SELECT EXISTS (SELECT * FROM users WHERE email = $1)",
      [req.body.email]
    );
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
  },
  createUserMiddleware,
  userSingIn
);

module.exports = router;

// CUSTOM LOGIN

// router.post("/login", async (req, res) => {

//     const { error } = loginValidation(req.body)
//     if (error) {
//         const { email, password } = req.body;
//         const errorMessage = error.message
//         return res.render("login", { errorMessage, email, password, title: "Sign In" })
//     }
//     //  check if user exists
//     const user = await db.any("SELECT * FROM users WHERE email = $1", [req.body.email])
//     console.log(user)
//     // if no user return login screen
//     if (user.length === 0) {
//         const { email, password } = req.body;
//         const errorMessage = "Email or password is wrong"
//         return res.render("login", { errorMessage, email, password, title: "Sign In" })
//     }
// })
