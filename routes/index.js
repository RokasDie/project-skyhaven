var express = require("express");
var router = express.Router();
const db = require("../config/database");

/* GET home page. */
router.get("/", async (req, res, next) => {
  const allPosts = await db
    .any("SELECT * FROM posts ORDER BY created DESC LIMIT 5")
    .catch(error => {});
  console.log(allPosts);
  res.render("index", { title: "Main page" });
});

module.exports = router;
