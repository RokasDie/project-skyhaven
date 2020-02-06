const { db } = require("../config/database");

module.exports = {
  selectAllGames: async () => {
    return db.any("SELECT * FROM games ORDER BY name ASC");
  },

  getPostNotLoggedIn: async parameters => {
    const post = await db.one(
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
      [parameters.id]
    );
    return post;
  },

  getPostLoggedIn: async parameterObject => {
    console.log(parameterObject);
    const post = await db.one(
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
      [parameterObject.id, parameterObject.userId]
    );
    return post;
  },

  getPost: async parameterObject => {
    const post = await db.one(
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
      [parameterObject.id]
    );
    return post;
  },

  getVoted: async parameterObject => {
    console.log(parameterObject);
    const vouch = await db.one(
      `select
      coalesce((
      select
        1
      from
        vouches
      where
        user_id = $1
        and post_id = $2),
      0)`,
      [parameterObject.userId, parameterObject.id]
    );
    return vouch;
  },
  getComments: async parameterObject => {
    const comments = await db.any(
      "SELECT * FROM comments INNER JOIN users ON comments.user_id = users.id WHERE post_id = $1 ORDER BY created DESC",
      [parameterObject.id]
    );

    console.log(comments);

    return comments;
  }
};
