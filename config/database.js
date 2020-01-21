const initOptions = {
  /* initialization options */
};
const pgp = require("pg-promise")(initOptions);

const connection = {};

const db = pgp(connection);

module.exports = { pgp, db };
