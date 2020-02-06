var express = require("express");
const ejs = require("ejs");
var router = express.Router();
const util = require("util");
const fs = require("fs");
const moment = require("moment");
const { db } = require("../config/database");
const multer = require("multer");
const upload = multer();
const { handleError, ErrorHandler } = require("../helpers/error");
const readFileAsync = util.promisify(fs.readFile);

router.get("/", async (req, res, next) => {
  res.render("contact", { title: "Contact gamestegy" });
});
module.exports = router;
