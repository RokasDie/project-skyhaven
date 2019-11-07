var express = require("express");
var router = express.Router();
const moment = require("moment");
const db = require("../config/database");
const multer = require("multer");
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
const editorImageUpload = upload.single("image");

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

router.post("/upload", async (req, res) => {
  editorImageUpload(req, res, async function(error) {
    if (error instanceof multer.MulterError) {
      return console.log(error);
    } else if (error) {
      return console.error(error);
    }

    const imageToBase64 = await Buffer.from(req.file.buffer).toString("base64");

    uploadImage({
      file: imageToBase64, //required
      fileName: "my_file_name.jpg" //required
    }).then(results => {
      //   console.log(results);
      res.send({ data: results.url });
    });
  });

  //   upload(req, res, async function(error) {
  //     if (error instanceof multer.MulterError) {
  //       console.log(Error);
  //       //   RETURN ERROR TO FRONT END
  //     } else if (error) {
  //       console.error(error);
  //       //   RETURN ERROR TO FRONT END
  //       // An unknown error occurred when uploading.
  //     }
  //   });
});

module.exports = router;
