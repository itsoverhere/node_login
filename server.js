const express = require("express")
const hbs = require("hbs")
const bodyparser = require("body-parser")
const session = require("express-session")
const path = require("path")
const cookieparser = require("cookie-parser")
// const mongoose = require("mongoose")
// const mongostore = require("connect-mongo")(session)

const app = express()
const urlencoder = bodyparser.urlencoded({
    extended: false
})
//
// mongoose.connect("mongodb://localhost:27017/logindb", {
//   useNewUrlParser:true
// })

var users = []

app.set("view engine", "hbs")
app.use(express.static(__dirname+"/public"))

app.use(session({
    secret: "super secret",
    name: "super secret",
    resave: true,
    saveUninitialized: true,
    // store: new mongostore({
    //   mongooseConnection:mongoose.connection,
    //   ttl : 60*60*24
    // })
    cookie: {
      maxAge: 1000*60*60*24*7*3
    }
}))

app.use(cookieparser())

app.use("/", urlencoder, (req, res, next)=>{

    // res.locals.<variable_name> is a variable that
    // we can use later on in other routes
    // and immediately use it in our views (hbs files)
    res.locals.fontsize = 12;
    if(req.cookies.fontsize){
        res.locals.fontsize=req.cookies.fontsize
    }

    console.log("Fontsize to ", res.locals.fontsize)
    next()
})

app.get("/", (req, res, next) => {
    console.log("GET /")

    var username = req.session.username

    if (req.session.username) {
        res.render("home.hbs", {
            username
        })
    } else {
        res.render("index.hbs")
    }
})

app.post("/register", urlencoder, (req, res) => {
    console.log("POST /register")
    var username = req.body.username
    var password = req.body.password
    if (username && password) {
        if (checkAvailability({username, password})) {
            req.session.username = username
            res.render("home.hbs", {
                username
            })
        } else {
            res.render("index.hbs", {
                error: "username has already been taken"
            })
        }
    } else {

        res.render("index.hbs", {
            error: "incomplete credentials, please try again"
        })
    }

    console.log(users)
})

app.get("/preferences", (req, res) => {
    var fontsize = req.query.fontsize

    res.cookie("fontsize", fontsize, {
        maxAge : 1000*60*60*24*7*3
    })

    res.redirect("/")
})

app.post("/login", urlencoder, (req, res) => {
    console.log("POST /login")

    var username = req.body.username
    var password = req.body.password

    if (validate({
            username, password
        })) {
        console.log("correct credentials")

        // create session
        req.session.username = username

        res.render("home.hbs", {
            username
        })
    } else {
        res.render("index.hbs", {
            error: "wrong credentials"
        })
    }
})

app.get("/logout", (req, res) => {
    console.log("GET /logout")
    console.log("User " + req.session.username + " logged out")

    req.session.destroy((err) => {
        if (err) {
            console.log(err)
        } else {
            console.log("Succesfully destroyed session")
        }
    });
    res.render("index.hbs")
})

function validate(user) {
    var match = users.filter((u) => {
        return (u.username === user.username && u.password === user.password)
    })
    if (match.length == 1) {
        return true
    } else {
        return false
    }
}

function checkAvailability(user) {
    var match = users.filter((u) => {
        return (u.username === user.username)
    })
    if (match.length == 0) {
        users.push(user)
        return true
    } else {
        return false
    }
}

app.use("*", (req, res) => {
        console.log("USE * ")
        res.sendFile(path.join(__dirname, "error.html"))
    })

app.use(express.static(path.join(__dirname, "public")))


app.listen(3000, () => {
    console.log("listening")
})
