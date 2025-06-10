
const isWeekendInJakarta = require("../helpers/attendanceHelper")
const { HttpError } = require("../helpers/error")
const { Employee, Attendance } = require("../models/")

class AttendaceController {
    static async employeeCheckIn(req, res, next) {
        try {
            const {id: employee_id, username} = req.user

            // check employee
            const employeeFound = await Employee.findOne({
                where: {
                    id: employee_id,
                    username
                }
            })

            if (!employeeFound) {
                throw new HttpError(404, "Employee not found")
            }

            // add the record to the attendance
            const check_in_time = new Date()
            console.log(check_in_time)
            const isWeekEnd = isWeekendInJakarta(check_in_time)
            console.log({isWeekEnd})
            if (isWeekEnd) throw new HttpError(400, "Employee can be check-in in weekdays")


            res.status(200).json({
                status_code: 200,
                message: `${username} Check-in Success`,
            })

        } catch (error) {
            next(error)
        }
    }
}

module.exports = { AttendaceController }