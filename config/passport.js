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

          if (user.length === 0) {
            // User does not exist
            // Return ambigous error so that user could not know what was precisely wrong
            return done(null, false, {
              message: "Incorrect email or password"
            });
          }

          const validPassword = await bcrypt.compare(
            password,
            user[0].password
          );

          // Passwords don't match
          // Return ambigous error so that user could not know what was precisely wrong

          if (!validPassword) {
            return done(null, false, {
              message: "Incorrect email or password"
            });
          }

          return done(null, user);
        } catch (error) {}
      }
    )
  );

  // const opts = {
  //   jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("JWT"),
  //   secretOrKey: "secret"
  // };

  // passport.use("jwt", new JwtStrategy(opts, (jwt_payload, done) => {}));
};
