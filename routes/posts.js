const express = require("express");
const router = express.Router();
const db = require("../config/database");
const passport = require("passport");
const slugify = require("slugify");
const moment = require("moment");
const { newPostValidation } = require("./validations/postValidation");
const { ensureAuthenticated } = require("../config/ensureAuthenticated");
const multer = require("multer");
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }).single(
  "postCover"
);
const imagekit = require("../config/imagekit");

const uploadImage = options => {
  return new Promise((resolve, reject) => {
    imagekit.upload(options, function(error, result) {
      if (error) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

router.get("/newPost", ensureAuthenticated(), async (req, res) => {
  const gameList = await db.any("SELECT * FROM games ORDER BY name ASC");
  res.render("newPost", { title: "Create a post", games: gameList });
});

// Route to create a new post
router.post(
  "/newPost",
  ensureAuthenticated(),
  // upload.single("postCover"),
  async (req, res, next) => {
    // Get form fields from the body

    upload(req, res, async function(error) {
      if (error instanceof multer.MulterError) {
        console.log(error);
        const errorMessage = error.message;
        const gameList = await db.any("SELECT * FROM games ORDER BY name ASC");
        return res.render("newPost", {
          title: "Create a post",
          errorMessage,
          postTitle,
          postSubtitle,
          games: gameList
        });
      } else if (error) {
        console.error(error);
        const errorMessage = error.message;
        const gameList = await db.any("SELECT * FROM games ORDER BY name ASC");
        return res.render("newPost", {
          title: "Create a post",
          errorMessage,
          postTitle,
          postSubtitle,
          games: gameList
        });
        // An unknown error occurred when uploading.
      }

      next();
    });
  },
  async (req, res, next) => {
    const { postTitle, postText, postSubtitle, postGame } = req.body;
    // Check when the last post was created by the user
    const lastUserPostTime = req.user.last_post_at;
    // check if post was created in last 15 minutes
    const postCreatedRecently = moment().isBefore(
      moment(lastUserPostTime).add(15, "minute")
    );

    // if (postCreatedRecently) {
    //   const gameList = await db.any("SELECT * FROM games ORDER BY name ASC");
    //   return res.render("newPost", {
    //     title: "Create a post",
    //     postCreatedRecently: "Post can only be created once every 15 minutes",
    //     postTitle: postTitle,
    //     postSubtitle: postSubtitle,
    //     games: gameList
    //   });
    // }

    // Need to check if correct values were provided
    const { error } = newPostValidation(req.body);

    if (error) {
      console.error(error);
      const gameList = await db.any("SELECT * FROM games ORDER BY name ASC");
      return res.render("newPost", {
        title: "Create a post",
        newPostErrorTitle: error.message,
        postTitle: postTitle,
        postSubtitle: postSubtitle,
        games: gameList
      });
    }
    // Upload the main picture
    const imageToBase64 = await Buffer.from(req.file.buffer).toString("base64");

    const uploadedPostImage = await uploadImage({
      file: imageToBase64, //required
      fileName: "my_file_name.jpg" //required
    });

    // Create a link for main picture
    var postImage = imagekit.url({
      src: uploadedPostImage.url,
      transformation: [
        {
          height: "200",
          width: "200"
        }
      ]
    });

    console.log(postImage);

    // Create slug link for post
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
        "INSERT INTO posts (title, text, user_id, subtitle, slug, game_id, post_picture) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [
          postTitle,
          postText,
          req.user.id,
          postSubtitle,
          postSlug,
          postGame,
          postImage
        ]
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
  }
);

// Route to get a post from database
router.get("/:slug/:id", async (req, res, next) => {
  console.log("slug ", req.params.slug, " id ", req.params.id);

  const post = await db
    .one(
      `SELECT posts.title,
              posts.user_id,
              posts.created,
              posts.subtitle,
              posts.text,
              games.name game_name,
              users.username
      FROM posts
      INNER JOIN games ON posts.game_id = games.id
      INNER JOIN users ON posts.user_id = users.id
      WHERE posts.id = $1`,
      req.params.id
    )
    .catch(err => {
      console.log(err);
    });
  res.render("readPost", { title: post.title, post: post, moment: moment });
});

module.exports = router;
