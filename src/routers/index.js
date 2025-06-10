const express = require("express");
const { UserController } = require("../controllers/userController");
const { AttendaceController } = require("../controllers/attendaceController");
const { authentication } = require("../middlewares/authentication");
const { employeeAuthorization, adminAuthorization } = require("../middlewares/authorization");
const { ReimbursementController } = require("../controllers/reimbursementController");
const { OvertimeController } = require("../controllers/overtimeController");
const { PayrollController } = require("../controllers/payrollController");
const { PayslipController } = require("../controllers/payslipController");
const router = express.Router();

router.post("/login/employee", UserController.employeeLogin);
router.post("/login/admin", UserController.adminLogin);

router.use(authentication)
router.post("/check-in", employeeAuthorization, AttendaceController.employeeCheckIn);
router.patch("/check-out/:id", employeeAuthorization, AttendaceController.employeeCheckOut);
router.post("/reimbursements", employeeAuthorization, ReimbursementController.submitReimbursement);
router.post("/overtimes", employeeAuthorization, OvertimeController.submitOvertime);
router.post("/payroll-periods", adminAuthorization, PayrollController.submitPeriodPayroll);
router.patch("/payroll-runs/:id", adminAuthorization, PayrollController.runPeriodPayroll);
router.get("/payroll-summaries/:id", adminAuthorization, PayslipController.summaryPayslip);
router.get("/payslip-details", employeeAuthorization, PayslipController.employeePayslip);


module.exports = router