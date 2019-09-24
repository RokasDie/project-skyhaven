const express = require("express");
const router = express.Router();
const db = require("../config/database")

// Example of db request
// db.any('SELECT * FROM "Users"').then((data) => {
//     console.log(data)
// }).catch((err) => { console.log(err) })



/* GET users listing. */
router.get("/login", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));

module.exports = router;
