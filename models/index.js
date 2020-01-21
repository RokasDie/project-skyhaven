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

module.exports = { selectAllGamesLimit, selectUserNotFollowedGames };
