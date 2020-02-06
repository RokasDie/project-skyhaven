const { db } = require("../config/database");

module.exports = {
  newComment: async parameters => {
    const comment = await db.one(
      "INSERT INTO comments (user_id, post_id, comment) VALUES ($1, $2, $3) RETURNING *",
      [parameters.userId, parameters.postId, parameters["comment-text"]]
    );
    return comment;
  }
};
