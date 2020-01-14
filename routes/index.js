var express = require("express");
var router = express.Router();
const moment = require("moment");
const db = require("../config/database");

/* GET home page. */
router.get("/", async (req, res, next) => {
  // console.log(req.user);
  const allPosts = await db
    .any(
      `SELECT users.username AS username,
            coalesce (sum(CAST(vouches.increm AS integer)), 0) as vouches_total,
            posts.id AS post_id,
            title, 
            text,
            created,
            subtitle,
            slug,
            post_cover_picture,
            games.name AS game_name
      FROM users
      RIGHT JOIN posts ON users.id = posts.user_id
      LEFT JOIN games ON posts.game_id = games.id
      LEFT join vouches on posts.id = vouches.post_id
      group by posts.id, users.username, games."name"
      ORDER  BY vouches_total DESC
      LIMIT 20`
    )
    .catch(error => {
      console.error(error);
    });
  console.log(allPosts[0]);
  res.render("index", { title: "Main page", posts: allPosts, moment: moment });
});

module.exports = router;
