
const { where } = require("sequelize")
const isWeekendInJakarta = require("../helpers/attendanceHelper")
const { HttpError } = require("../helpers/error")
const { generateRequestId } = require("../helpers/generateRequestId")
const { Employee, Attendance } = require("../models/")
const { findEmployeeOrThrow } = require("../helpers/services/employeeHelpers")

class AttendaceController {
    static async employeeCheckIn(req, res, next) {
        try {
            const {id: employee_id, username} = req.user
            const request_ip = req.request_ip

            const employeeFound = await findEmployeeOrThrow(employee_id, username)

            // add the record to the attendance
            const check_in_time = new Date()
            const isWeekEnd = isWeekendInJakarta(check_in_time)
            if (isWeekEnd) throw new HttpError(400, "Employee can be check-in in weekdays")

            // add to the attendance table
            const data = await Attendance.create({
                employee_id: employeeFound.id,
                check_in_time,
                created_by: employeeFound.id,
                updated_by: employeeFound.id,
                request_ip,
                request_id: generateRequestId()
            });

            res.status(200).json({
                status_code: 200,
                message: `${username} Check-in Success`,
                check_in_time
            })

        } catch (error) {
            console.error("error in employeeCheckIn", error)
            next(error)
        }
    }

    static async employeeCheckOut(req, res, next) {
        try {
            const { id: attendance_id } = req.params
            const { id: employee_id, username } = req.user
            const request_ip = req.request_ip

            // check employee
            const attendance = await Attendance.findOne({
                where: {
                    id: attendance_id,
                    employee_id
                }
            })

            if (!attendance) {
                throw new HttpError(404, "attendance record not found")
            }

            // add the record to the attendance
            const check_out_time = new Date()

            const data = await Attendance.update(
                {
                    check_out_time,
                    request_ip,
                    request_id: generateRequestId(),
                    updated_by: employee_id,
                    updated_at: new Date()
                },
                {
                    where: {
                        id: attendance.id
                    }
                }
            );

         res.status(200).json({
                status_code: 200,
                message: `${username} Check-out Success`,
                check_out_time
            })

        } catch (error) {
            console.error("error in employeeCheckOut", error)
            next(error)
        }
    }
}

module.exports = { AttendaceController }