
const { HttpError } = require("../helpers/error")
const { findEmployee } = require("../helpers/services/employeeHelpers")
const { Employee, Attendance, Overtime } = require("../models/")

class OvertimeController {
    static async submitOvertime(req, res, next) {
        try {
            const { id: employee_id, username } = req.user
            const { hours_number } = req.body
            const request_ip = req.request_ip

            if (hours_number > 3) {
                throw new HttpError(400, "Overtime maximum 3 hours")
            }

            const employeeFound = await findEmployee(employee_id, username)

        
            res.status(200).json({
                status_code: 200,
                message: `${username} Check-in Success`,
            })

        } catch (error) {
            console.error("error in employeeCheckIn", error)
            next(error)
        }
    }

}

module.exports = { OvertimeController }