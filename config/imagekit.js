var ImageKit = require("imagekit");

var imagekit = new ImageKit({
  publicKey: "public_rMxVmgKZHjgiuKIADeeCaoOBsXU=",
  privateKey: process.env.IMAGEKIT,
  urlEndpoint: "https://ik.imagekit.io/0xnsagmlp/"
});

module.exports = imagekit;
