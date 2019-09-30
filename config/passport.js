const bcrypt = require("bcrypt");
const db = require("../config/database");

const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;

module.exports = function(passport) {
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email", passwordField: "password", session: false },
      async (username, password, done) => {
        try {
          //  check if user exists
          const user = await db.any("SELECT * FROM users WHERE email = $1", [
            username
          ]);

          console.log(user);
        } catch (error) {}
      }
    )
  );
};
