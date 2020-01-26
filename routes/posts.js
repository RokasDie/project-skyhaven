const express = require("express");
const router = express.Router();
const { db } = require("../config/database");
const slugify = require("slugify");
const moment = require("moment");
const { newPostValidation } = require("./validations/postValidation");
const { ensureAuthenticated } = require("../config/ensureAuthenticated");
const { handleError, ErrorHandler } = require("../helpers/error");
const { selectAllGames } = require("../models/posts");
const multer = require("multer");
const uploadNoFile = multer();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }).single(
  "postCover"
);
const imagekit = require("../config/imagekit");

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

router.get("/newPost", ensureAuthenticated(), async (req, res) => {
  const gameList = await selectAllGames();
  res.render("newPost", { title: "Create a post", games: gameList });
});

// Route to create a new post
router.post(
  "/newPost",
  ensureAuthenticated(),
  async (req, res, next) => {
    upload(req, res, async function(error) {
      // Check if uploaded file is not too big
      try {
        if (error instanceof multer.MulterError) {
          throw new ErrorHandler(413, error.message);
        } else if (error) {
          throw new ErrorHandler(404, error.message);
        }
        next();
      } catch (error) {
        console.error(error);
        next(error);
      }
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
      const gameList = await selectAllGames();
      return res.render("newPost", {
        title: "Create a post",
        newPostErrorTitle: error.message,
        postTitle: postTitle,
        postSubtitle: postSubtitle,
        games: gameList
      });
    }
    let uploadedPostCoverImage;
    if (req.file !== undefined) {
      // Upload the main picture
      const imageToBase64 = await Buffer.from(req.file.buffer).toString(
        "base64"
      );

      uploadedPostCoverImage = await uploadImage({
        file: imageToBase64, //required
        fileName: "post_cover.jpg" //required
      });

      console.log(uploadedPostCoverImage);
    } else {
      uploadedPostCoverImage = { name: null };
    }

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
        "INSERT INTO posts (title, text, user_id, subtitle, slug, game_id, post_cover_picture) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [
          postTitle,
          postText,
          req.user.id,
          postSubtitle,
          postSlug,
          postGame,
          uploadedPostCoverImage.name
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
      res.status(200).send({});
    }
  }
);

router.post(
  "/updatePost",
  ensureAuthenticated(),
  async (req, res, next) => {
    upload(req, res, async function(error) {
      // Check if uploaded file is not too big
      try {
        if (error instanceof multer.MulterError) {
          throw new ErrorHandler(413, error.message);
        } else if (error) {
          throw new ErrorHandler(404, error.message);
        }
        next();
      } catch (error) {
        next(error);
      }
    });
  },
  async (req, res, next) => {
    // Validation with hapi
    console.log(req.body);
    try {
      const updatePost = await db.one(
        `UPDATE posts SET text = $1 WHERE id = $2 RETURNING *`,
        [req.body.postText, req.body.postId]
      );

      res.status(200).json({ postText: updatePost.text });
    } catch (error) {
      console.log(error);
      next(new ErrorHandler(500, error.message));
    }
  }
);

// Route to get a post from database
router.get("/read/:slug/:id", async (req, res, next) => {
  try {
    let post;
    if (typeof req.user == "undefined") {
      post = await db.one(
        `SELECT posts.id, 
              (select sum(CAST(vouches.increm AS integer)) from vouches where vouches.post_id = $1) as total_vouches,
              posts.title,
              posts.user_id,
              posts.created,
              posts.subtitle,
              posts.text,
              games.name AS game_name,
              users.username        
        FROM posts
        INNER JOIN games ON posts.game_id = games.id
        INNER JOIN users ON posts.user_id = users.id
        WHERE posts.id = $1`,
        [req.params.id]
      );
    } else {
      post = await db.one(
        `SELECT posts.id, 
              (select sum(CAST(vouches.increm AS integer)) from vouches where vouches.post_id = $1) as total_vouches,
              posts.title,
              posts.user_id,
              posts.created,
              posts.subtitle,
              posts.text,
              games.name AS game_name,
              users.username,
              (select vouches.increm from vouches where vouches.user_id = $2 and vouches.post_id = $1) as vouch       
        FROM posts
        INNER JOIN games ON posts.game_id = games.id
        INNER JOIN users ON posts.user_id = users.id
        WHERE posts.id = $1`,
        [req.params.id, req.user.id]
      );
    }
    console.log(post);
    res.render("readPost", { title: post.title, post: post, moment: moment });
  } catch (err) {
    console.error(err);
    next(new ErrorHandler(500, "Internal server error"));
  }
});

router.post("/vouchPost", uploadNoFile.none(), async (req, res, next) => {
  console.log(req.body);
  try {
    const vouch = await db.one(
      `INSERT INTO
          vouches (user_id, post_id, increm) 
      VALUES
          (
            $1, $2, '1'
          )
          ON conflict 
          ON CONSTRAINT vouches_un DO 
          UPDATE
          set
              increm = not vouches.increm
              returning *`,
      [req.user.id, req.body.postId]
    );
    res.status(200).json({ statusCode: 200 });
    console.log(vouch);
  } catch (err) {
    console.error(err);
    next(new ErrorHandler(500, "Internal server error"));
  }
});
module.exports = router;
