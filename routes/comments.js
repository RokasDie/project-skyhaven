const express = require("express");
const router = express.Router();
const util = require("util");
const fs = require("fs");
const { db } = require("../config/database");
const slugify = require("slugify");
const ejs = require("ejs");
const moment = require("moment");
const { CommentServices } = require("../services/comment");
const { ensureAuthenticated } = require("../config/ensureAuthenticated");
const { handleError, ErrorHandler } = require("../helpers/error");
const { selectAllGames } = require("../models/posts");
const multer = require("multer");
const uploadNoFile = multer();
const readFileAsync = util.promisify(fs.readFile);
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }).single(
  "postCover"
);
const imagekit = require("../config/imagekit");
const services = new CommentServices();

const uploadImage = options => {
  return new Promise((resolve, reject) => {
    imagekit.upload(options, function(error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

router.post("/newComment", uploadNoFile.none(), async (req, res, next) => {
  // NEED JOI VALIDATION
  // Business logic
  try {
    const commentObject = req.body;
    // Attach user ID
    commentObject.userId = req.user.id;
    const comment = await services.newComment(commentObject);
    const ejsPartial = await readFileAsync("./views/partials/comment.ejs", {
      encoding: "utf-8"
    });
    const templateCompiled = ejs.compile(ejsPartial, { client: true });
    const html = templateCompiled({ comment, moment });

    console.log(comment);
    res.status(200).send({ html });
  } catch (err) {
    console.log(err);
    next(new ErrorHandler(500, "Internal server error"));
  }
});
module.exports = router;
