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
          console.log("passport sudas");
          //  check if user exists
          const user = await db.one("SELECT * FROM users WHERE email = $1", [
            username
          ]);
          console.log(user);

          if (user.length === 0) {
            // User does not exist
            // Return ambigous error so that user could not know what was precisely wrong
            return done(null, false, {
              message: "Incorrect email or password"
            });
          }

          const validPassword = await bcrypt.compare(password, user.password);

          // Passwords don't match
          // Return ambigous error so that user could not know what was precisely wrong

          if (!validPassword) {
            return done(null, false, {
              message: "Incorrect email or password"
            });
          }

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
      console.log(user);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
