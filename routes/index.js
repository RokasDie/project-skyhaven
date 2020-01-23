var express = require("express");
const ejs = require("ejs");
var router = express.Router();
const util = require("util");
const fs = require("fs");
const moment = require("moment");
const { db } = require("../config/database");
const multer = require("multer");
const upload = multer();
const {
  selectAllGamesLimit,
  selectUserNotFollowedGames,
  selectAllGamesAscending,
  getPostsByTop,
  getPostsByLatest
} = require("../models/index");
const { handleError, ErrorHandler } = require("../helpers/error");

const readFileAsync = util.promisify(fs.readFile);

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
  const games = await selectAllGamesAscending();
  // console.log(games);
  res.render("allGames", { title: "All Games", games: games });
});

router.get("/getTopPosts", upload.none(), async (req, res, next) => {
  const allPosts = await getPostsByTop();

  const ejsPartial = await readFileAsync("./views/partials/topPosts.ejs", {
    encoding: "utf-8"
  });
  const templateCompiled = ejs.compile(ejsPartial, { client: true });
  const html = templateCompiled({ posts: allPosts, moment: moment });

  res.status(200).send({ html: html });
});

router.get("/getLatestPosts", upload.none(), async (req, res, next) => {
  const allPosts = await getPostsByLatest();
  const ejsPartial = await readFileAsync("./views/partials/topPosts.ejs", {
    encoding: "utf-8"
  });
  const templateCompiled = ejs.compile(ejsPartial, { client: true });
  const html = templateCompiled({ posts: allPosts, moment: moment });
  res.status(200).send({ html: html });
});

module.exports = router;
