const express = require("express");
const { UserController } = require("../controllers/userController");
const { AttendaceController } = require("../controllers/attendaceController");
const { authentication } = require("../middlewares/authentication");
const { employeeAuthorization } = require("../middlewares/authorization");
const router = express.Router();

router.post("/login/employee", UserController.employeeLogin);
router.post("/login/admin", UserController.adminLogin);

router.use(authentication)
router.post("/check-ins", AttendaceController.employeeCheckIn);

module.exports = router