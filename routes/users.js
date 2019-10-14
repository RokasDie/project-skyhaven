const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/database");
const passport = require("passport");
const {
  registerValidation,
  loginValidation
} = require("../config/validations");

const transporter = require("../config/mailer");

// Example of db request
// db.any('SELECT * FROM users').then((data) => {
//     console.log(data)
// }).catch((err) => { console.log(err) })

const createAndLoginUserMiddleware = async (req, res, next) => {
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
    }

    // Login the new User using Passport Js method
    req.login(newUser, err => {
      if (err) {
        return next(err);
      }

      // Then redirect the user after logging in to the index page
      return res.redirect("/");
    });
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
};

// Route to get to login page
router.get("/login", (req, res) => {
  // let verificationMail = transporter.sendMail(
  //   {
  //     from: "account@gamestegy.com", // sender address
  //     to: "r.diedonis@gmail.com", // list of receivers
  //     subject: "Hello ✔", // Subject line
  //     text: "Hello world?", // plain text body
  //     html: "<b>Hello world?</b>" // html body
  //   },
  //   err => {
  //     console.log(err);
  //   }
  // );
  res.render("login", { title: "Sign In" });
});

// Login to the account
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

// Route to get to the register page
router.get("/register", (req, res) =>
  res.render("register", { title: "Sign Up" })
);

// Route to register an user
router.post(
  "/register",
  async (req, res, next) => {
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
  },
  createAndLoginUserMiddleware
);

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
