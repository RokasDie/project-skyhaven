const bcrypt = require("bcrypt");
const db = require("../config/database");

const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;

module.exports = function(passport) {
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (username, password, done) => {
        try {
          // Check if user exists
          // Return ambigous error so that user could not know what was precisely wrong
          const user = await db.one("SELECT * FROM users WHERE email = $1", [
            username
          ]);

          if (user.length === 0) {
            return done(null, false, {
              message: "Incorrect email or password"
            });
          }

          // Check that user has confirmed his email
          if (!user.confirmed) {
            return done(null, false, {
              message: "Please verify your email"
            });
          }

          // Check if passwords match
          // Return ambigous error so that user could not know what was precisely wrong
          const validPassword = await bcrypt.compare(password, user.password);
          if (!validPassword) {
            return done(null, false, {
              message: "Incorrect email or password"
            });
          }

          // If no errors are returned return user
          return done(null, user);
        } catch (error) {
          console.log(error);
          return done(null, false, { message: "Incorrect email or password" });
          // Need to create error handler for missing user
        }
      }
    )
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.one("SELECT * FROM users WHERE id = $1", [id]);
      // console.log(user);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
