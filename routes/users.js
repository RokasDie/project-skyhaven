const express = require("express");
const router = express.Router();
const db = require("../config/database")

// Example of db request
// db.any('SELECT * FROM "Users"').then((data) => {
//     console.log(data)
// }).catch((err) => { console.log(err) })
const passwordCheckRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/


/* GET users listing. */
router.get("/login", (req, res) => res.render("login"));

router.get("/register", (req, res) => res.render("register"));

router.post("/register", (req, res, next) => {

    const { username, email, password1, password2 } = req.body;

    let errors = [];

    // Check required fields

    if (!username || !email || !password1 || !password2) {
        errors.push({ msg: "Please fill in all fields" });
    }
    // Check if passwords match
    if (password1 !== password2) {
        errors.push({ msg: "Passwords don't match" });
    }
    // check password correctness
    if (!passwordCheckRegex.test(password1)) {
        errors.push({ msg: "Password minimum length eight characters, at least one uppercase letter, one lowercase letter and one number" });
    }
    console.log(errors)
    //  check how many errors
    if (errors.length > 0) {
        res.render("register", { errors, username, email, password1, password2 })
    } else {
        console.log("sudas")
        next()
    }
}, (req, res, next) => { console.log(req) })

module.exports = router;
