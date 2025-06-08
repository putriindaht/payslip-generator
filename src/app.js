require("dotenv").config();
const express = require("express");
const cors = require("cors")
const app = express()

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get("/", (req, res) => {
    console.log("Hello world!")
    res.status(200).json({
        success: true
    })
})

module.exports = { app };