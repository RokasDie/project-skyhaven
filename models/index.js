const { db } = require("../config/database");

const selectAllGamesLimit = async numberOfGames => {
  return db.any("SELECT * FROM games limit $1", [numberOfGames]);
};

const selectUserNotFollowedGames = async userId => {
  return db.any(
    "select games.id, games.name from games left join game_follows on games.id = game_follows.game_id and (game_follows.user_id = $1) where user_id is null",
    [userId]
  );
};

const selectAllGamesAscending = async () => {
  return db.any("SELECT * FROM games ORDER BY name ASC");
};

const getPostsByTop = async () => {
  return db.any(`SELECT users.username AS username,
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
                ORDER  BY vouches_total DESC`);
};

const getPostsByLatest = async () => {
  return db.any(`SELECT users.username AS username,
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
                ORDER BY created DESC`);
};

module.exports = {
  selectAllGamesLimit,
  selectUserNotFollowedGames,
  selectAllGamesAscending,
  getPostsByTop,
  getPostsByLatest
};
