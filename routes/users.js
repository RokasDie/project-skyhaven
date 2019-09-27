const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require("../config/database")

// Example of db request
// db.any('SELECT * FROM "Users"').then((data) => {
//     console.log(data)
// }).catch((err) => { console.log(err) })
const passwordCheckRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/

const createUserMiddleware = async (req, res, next) => {
    try {
        const saltRounds = 10;

        const hashPassword = await bcrypt.hash(req.body.password1, saltRounds)
        console.log(hashPassword)
    }
    catch (error) {
        console.error(error)
        next(error)
    }


}


router.get("/posts", (req, res) => res.render("posts", { title: "Posts" }));

router.get("/login", (req, res) => res.render("login", { title: "Sign In" }));

router.get("/register", (req, res) => res.render("register", { title: "Sign Up" }));

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

    //  check how many errors
    if (errors.length > 0) {
        return res.render("register", { errors, username, email, password1, password2, title: "Sign Up" })
    } else { next() }

}, createUserMiddleware)

module.exports = router;
