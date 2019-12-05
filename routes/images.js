var express = require("express");
var router = express.Router();
const moment = require("moment");
const db = require("../config/database");
const multer = require("multer");
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
const editorImageUpload = upload.single("image");
const { handleError, ErrorHandler } = require("../helpers/error");

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

router.post(
  "/upload",
  async (req, res, next) => {
    editorImageUpload(req, res, async function(error) {
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
  async (req, res) => {
    const imageToBase64 = await Buffer.from(req.file.buffer).toString("base64");

    uploadImage({
      file: imageToBase64, //required
      fileName: "my_file_name.jpg" //required
    })
      .then(results => {
        console.log(results);
        res.send({ data: results.url });
      })
      .catch(err => {
        console.log(err);
      });
  }
);

module.exports = router;
