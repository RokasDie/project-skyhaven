var express = require("express");
var router = express.Router();
const moment = require("moment");
const db = require("../config/database");

/* GET home page. */
router.get("/", async (req, res, next) => {
  // console.log(req.user);
  const allPosts = await db
    .any(
      "SELECT users.username AS username, posts.id AS post_id, title, text, created, subtitle, slug FROM users RIGHT JOIN posts ON users.id = posts.user_id ORDER BY created DESC LIMIT 5"
    )
    .catch(error => {
      console.error(error);
    });
  // console.log(allPosts[0]);
  res.render("index", { title: "Main page", posts: allPosts, moment: moment });
});

module.exports = router;
