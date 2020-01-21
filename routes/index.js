var express = require("express");
var router = express.Router();
const moment = require("moment");
const { db } = require("../config/database");
const multer = require("multer");
const upload = multer();
const {
  selectAllGamesLimit,
  selectUserNotFollowedGames
} = require("../models/index");
const { handleError, ErrorHandler } = require("../helpers/error");

/* GET home page. */
router.get("/", async (req, res, next) => {
  console.log(typeof req.user === "undefined");
  let followedGames = null;
  let notFollowedGames = null;
  const indexPage = Promise.all([]);
  if (typeof req.user === "undefined") {
    notFollowedGames = await selectAllGamesLimit(30);
  } else {
    notFollowedGames = await selectUserNotFollowedGames(req.user.id);

    followedGames = await db.any(
      `SELECT * FROM game_follows INNER JOIN games ON games.id = game_follows.game_id WHERE user_id = $1`,
      [req.user.id]
    );
  }

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
  res.render("index", {
    title: "Main page",
    posts: allPosts,
    games: notFollowedGames,
    followedGames: followedGames,
    moment: moment
  });
});

router.post("/toggleGameFollow", upload.none(), async (req, res, next) => {
  try {
    console.log("followed game id: ", req.body);
    const gameId = req.body.gameId;
    const followGameToggle = await db.one("select toggle_game_follow($1, $2)", [
      req.user.id,
      gameId
    ]);
    console.log(followGameToggle);
    res.status(200).send({
      followToggle: followGameToggle.toggle_game_follow,
      gameId: gameId,
      gameName: req.body.gameName
    });
  } catch (error) {
    console.error(error);
    next(new ErrorHandler(404, error.message));
  }
});

router.get("/allGames", async (req, res, next) => {
  const games = await db.any("SELECT * FROM games ORDER BY name ASC");
  console.log(games);
  res.render("allGames", { title: "All Games", games: games });
});

module.exports = router;
