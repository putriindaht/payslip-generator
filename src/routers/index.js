const express = require("express");
const { UserController } = require("../controllers/userController");
const router = express.Router();

router.post("/login/employee", UserController.employeeLogin);

module.exports = router