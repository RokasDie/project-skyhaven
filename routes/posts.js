const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/database");
const passport = require("passport");
const { newPostValidation } = require("../config/validations");
const { ensureAuthenticated } = require("../config/ensureAuthenticated");

router.use(ensureAuthenticated());
router.get("/", (req, res) => {
  res.render("createPost", { title: "Create a post" });
});

router.post("/newPost", async (req, res, next) => {
  const { postTitle, postText } = req.body;
  console.log(req.body);
  // Need to check if correct values were provided
  const { error } = newPostValidation(req.body);
  if (error) {
    return res.render("createPost", {
      title: "Create a post",
      newPostErrorTitle: error.message,
      postTitle: postTitle
    });
  }

  const newPost = await db
    .one(
      "INSERT INTO posts (title, text, user_id) VALUES ($1, $2, $3) RETURNING *",
      [postTitle, postText, req.user[0].id]
    )
    .catch(error => {
      console.error(error);
      return res.render("createPost", {
        title: "Create a post",
        newPostError: "Internal error, please try again later",
        postTitle: postTitle
      });
    });

  if (newPost) {
    res.redirect("/");
  }
});
module.exports = router;
