const rateLimit = require("express-rate-limit");

const createPostLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1,
  message: "You can only create one post per 15 minutes"
});

module.exports.createPostLimit = createPostLimit;
