const { db } = require("../config/database");

const selectAllGames = async () => {
  return db.any("SELECT * FROM games ORDER BY name ASC");
};

module.exports = { selectAllGames };
