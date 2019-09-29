const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require("../config/database")
const jwt = require('jsonwebtoken');
const Joi = require("@hapi/joi")

// function which stores different error codes from validation
// then transforms them to messages which can be sent to front end
const validationErrorHandling = (error) => {
    const errorCode = error[0].code
    console.log(errorCode)
    switch (errorCode) {
        case "string.empty":
            return new Error("Please provide username")
            break
        case "string.min":
            return new Error(`Username should be at least ${error[0].local.limit} characters`)
            break
        case "string.max":
            return new Error(`Username should be less than ${error[0].local.limit} characters`)
            break
        case "any.only":
            return new Error("Passwords need to match")
            break
        default:
            break
    }
}

const passwordCheckRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
// Login validation schema
const schema = Joi.object({
    username: Joi.string().min(3).max(40).required().error((error) => {
        return validationErrorHandling(error)
    }),
    email: Joi.string().min(6).required().email().error((error) => {
        return validationErrorHandling(error)
    }),
    password1: Joi.string().pattern(passwordCheckRegex).error((error) => {
        return validationErrorHandling(error)
    }),
    password2: Joi.valid(Joi.ref("password1")).error((error) => {
        return validationErrorHandling(error)
    })
})

// Example of db request
// db.any('SELECT * FROM users').then((data) => {
//     console.log(data)
// }).catch((err) => { console.log(err) })


const createUserMiddleware = async (req, res, next) => {
    try {
        const saltRounds = 10;

        const hashPassword = await bcrypt.hash(req.body.password1, saltRounds)
        const newUsername = req.body.username
        const newUserEmail = req.body.email

        newUser = await db.one("INSERT INTO users(username, password, email) VALUES ($1, $2, $3) RETURNING id", [newUsername, hashPassword, newUserEmail])
        console.log(newUser)
        next()

    }
    catch (error) {
        console.error(error)
        next(error)
    }
}

const userSingIn = async (req, res, next) => {

}

router.get("/posts", (req, res) => res.render("posts", { title: "Posts" }));

router.get("/login", (req, res) => res.render("login", { title: "Sign In" }));

router.get("/register", (req, res) => res.render("register", { title: "Sign Up" }));

router.post("/register", async (req, res, next) => {
    const { error, value } = await schema.validate(req.body)
    const errorMessage = error.message

    const { username, email, password1, password2 } = req.body;

    if (errorMessage) {
        return res.render("register", { errorMessage, username, email, password1, password2, title: "Sign Up" })
    } else {
        next()
    }
},
    // createUserMiddleware,
    //  userSingIn
)

module.exports = router;

// username: Joi.string().required().error(new Error("Username is required")).min(3).error((err) => {
//     return new Error(`Should be at least ${err[0].local.limit} characters long`)
// }).max(40).error((err) => {
//     return new Error(`Should be less than ${err[0].local.limit} characters`)
// })
