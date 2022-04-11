const express = require("express")
const app = express()
const mor = require("morgan")
const bParser = require("body-parser")
const cors = require("cors");
const path = require("path");
app.use(cors());

//Routes to handle requests
const apiRoute = require("./routes/apiRoute");

app.use(mor("dev"))
app.use(bParser.urlencoded({extended: false}))
app.use(bParser.json())
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "views")));


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    next()
})

//Transferring Requests to Respective Routes
app.use("/api/", apiRoute)


app.use((req, res, next) => {
    const error = new Error("Incorrect API Point")
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        "error": error.message
    })
})

module.exports = app;