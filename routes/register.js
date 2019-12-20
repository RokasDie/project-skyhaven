const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/database");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { handleError, ErrorHandler } = require("../helpers/error");
const multer = require("multer");
var upload = multer();

const { registerValidation } = require("./validations/registrationValidation");

const transporter = require("../config/mailer");

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
  console.log(req.body);
  try {
    // validate req.body, which contains form inputs
    // if something is amiss create error
    const { error } = await registerValidation(req.body);

    // If error create error
    if (error) {
      throw new ErrorHandler(404, error.message);
    }

    // Get from database the entered email address
    // If email already exists return error
    const emailExists = await db.one(
      "SELECT EXISTS (SELECT * FROM users WHERE email = $1)",
      [req.body.email]
    );
    console.log(emailExists);
    if (emailExists.exists) {
      throw new ErrorHandler(
        404,
        "User with the specified email already exists"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Route to get to the register page
router.get("/", (req, res) => res.render("register", { title: "Sign Up" }));

// Route to register an user
router.post(
  "/",
  upload.none(),
  registerValidationMiddleware,
  async (req, res, next) => {
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
        res.status(201).send({});
      }

      // Login the new User using Passport Js method
    } catch (error) {
      // Database error checks

      const errorCode = error.code;
      switch (errorCode) {
        case "23505":
          const errorMessage = "Email or username is already in use";
          throw new ErrorHandler(404, errorMessage);
          break;
        default:
          break;
      }

      next(error);
    }
  }
);

module.exports = router;
