const commentModel = require("../models/comment");

class CommentServices {
  async newComment(commentData) {
    const createdComment = await commentModel.newComment(commentData);
    return createdComment;
  }
}

module.exports = { CommentServices };
