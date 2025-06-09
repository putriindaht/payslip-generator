require("dotenv").config();
const express = require("express");
const cors = require("cors")
const app = express()
const router = require("./routers")

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(router)

app.get("/", (req, res) => {
    console.log("Hello world!")
    res.status(200).json({
        success: true
    })
})

module.exports = { app };