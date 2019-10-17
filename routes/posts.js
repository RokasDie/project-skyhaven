const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/database");
const passport = require("passport");
const slugify = require("slugify");
const moment = require("moment");
const { newPostValidation } = require("./validations/postValidation");
const { ensureAuthenticated } = require("../config/ensureAuthenticated");
const postCreationLimit = require("./limiters/limits");
const rateLimit = require("express-rate-limit");

router.get("/newPost", ensureAuthenticated(), (req, res) => {
  res.render("newPost", { title: "Create a post" });
});

// Route to create a new post
router.post("/newPost", ensureAuthenticated(), async (req, res, next) => {
  // Get form fields from the body
  const { postTitle, postText, postSubtitle } = req.body;

  // Check when the last post was created by the user
  const lastUserPostTime = req.user.last_post_at;
  // check if post was created in last 15 minutes
  const postCreatedRecently = moment().isBefore(
    moment(lastUserPostTime).add(15, "minute")
  );

  if (postCreatedRecently) {
    return res.render("newPost", {
      title: "Create a post",
      postCreatedRecently: "Post can only be created once every 15 minutes",
      postTitle: postTitle,
      postSubtitle: postSubtitle
    });
  }

  // Need to check if correct values were provided
  const { error } = newPostValidation(req.body);

  if (error) {
    console.error(error);
    return res.render("newPost", {
      title: "Create a post",
      newPostErrorTitle: error.message,
      postTitle: postTitle,
      postSubtitle: postSubtitle
    });
  }

  const postSlug = await slugify(postTitle, {
    replacement: "-", // replace spaces with replacement
    remove: null, // regex to remove characters
    lower: true // result in lower case
  });

  // update user table for when the user last created a post
  db.any("UPDATE users SET last_post_at = $1 WHERE id = $2", [
    moment(),
    req.user.id
  ]).catch(err => {
    console.error(err);
  });

  // Create a post in posts table
  const newPost = await db
    .one(
      "INSERT INTO posts (title, text, user_id, subtitle, slug) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [postTitle, postText, req.user.id, postSubtitle, postSlug]
    )
    .catch(error => {
      console.error(error);
      return res.render("newPost", {
        title: "Create a post",
        newPostError: "Internal error, please try again later",
        postTitle: postTitle
      });
    });
  // redirect to the main page if the post was created
  if (newPost) {
    res.redirect("/");
  }
});

// Route to get a post from database
router.get("/:slug/:id", async (req, res, next) => {
  console.log("slug ", req.params.slug, " id ", req.params.id);
  const post = await db.one("SELECT * FROM posts WHERE id = $1", req.params.id);
  res.render("readPost", { title: post.title, post: post, moment: moment });
});

module.exports = router;
