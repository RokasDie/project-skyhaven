require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const expressLayouts = require("express-ejs-layouts");
const flash = require("connect-flash");
const passport = require("passport");
const helmet = require("helmet");
const db = require("./config/database");
var cors = require("cors");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const pgSession = require("connect-pg-simple")(session);
const { handleError } = require("./helpers/error");

// Error functions
function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: "Something failed!" });
  } else {
    next(err);
  }
}

const limiter = rateLimit({
  windowMs: 5 * 1000, // 5 seconds
  max: 20 // limit each IP to 5 requests per windowMs
});

require("./config/passport")(passport);

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const registerRouter = require("./routes/register");
const loginRouter = require("./routes/login");
const postsRouter = require("./routes/posts");
const verificationsRouter = require("./routes/verifications");
const imagesRouter = require("./routes/images");

const app = express();
app.use(helmet());

// view engine setup

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "dist")));
// Initiate request limiter
app.use(limiter);
app.use(
  session({
    store: new pgSession({
      pgPromise: db, // Connection pool
      tableName: "session_users" // Use another table-name than the default "session" one
    }),
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Global variables accessible in templates
app.use(function(req, res, next) {
  res.locals.user = req.user;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.info = req.flash("info");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", indexRouter);
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/verifications", verificationsRouter);
app.use("/images", imagesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use((err, req, res, next) => {
  handleError(err, res);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message =
    req.app.get("env") === "development"
      ? err.message
      : { message: "Internal server error" };
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error", { title: "Internal Server Error" });
});

// Good error handler example, investigate later
// Main errorHandler
// app.use((err, req, res, next) => {
//   // treat as 404
//   if (err.message && (~err.message.indexOf('not found') || (~err.message.indexOf(
//       'Cast to ObjectId failed')))) {
//     return next();
//   }

//  if (config.environment === 'development') {
//    console.error(err.stack);
//  }

//  // error as json
//  return res.status(err.status || 500)
//    .json({
//      error: err.message,
//    });
//  });

//    // assume 404 since no middleware responded
//  app.use((req, res, next) => {
//     res.status(404)
//      .json({
//      url: req.originalUrl,
//      error: 'Not found',
//    });
//   });

module.exports = app;
