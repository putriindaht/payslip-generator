
const isWeekendInJakarta = require("../helpers/attendanceHelper");
const { HttpError } = require("../helpers/error");
const { generateRequestId } = require("../helpers/generateRequestId");
const { findEmployee } = require("../helpers/services/employeeHelpers")
const { Employee, Attendance, Overtime } = require("../models/")
const { Op } = require("sequelize");

function getJakartaNow() {
  // Get current time in Jakarta (UTC+7)
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
  );
}

class OvertimeController {
    static async submitOvertime(req, res, next) {
        try {
            const { id: employee_id, username } = req.user
            const { hours_number } = req.body
            const request_ip = req.request_ip

             if (hours_number > 3) {
                throw new HttpError(400, "Overtime maximum 3 hours per submission");
            }

            const employeeFound = await findEmployee(employee_id, username)
            if (!employeeFound) throw new HttpError(404, "Employee not found")

            const jakartaNow = getJakartaNow()
            const isWeekend = isWeekendInJakarta(jakartaNow);

            // For today boundaries (Jakarta time)
            const todayStart = new Date(jakartaNow);
            todayStart.setHours(0, 0, 0, 0);

            const todayEnd = new Date(jakartaNow);
            todayEnd.setHours(23, 59, 59, 999);

            // On **weekdays** must validate checkout or after 5pm
            if (!isWeekend) {
                const attendanceToday = await Attendance.findOne({
                where: {
                    employee_id: employeeFound.id,
                    check_in_time: { [Op.gte]: todayStart, [Op.lte]: todayEnd }
                },
                order: [['check_in_time', 'DESC']]
                });

                const isAfter5PM = jakartaNow.getHours() >= 17;
                const isCheckedOut = attendanceToday && attendanceToday.check_out_time;
                if (!isCheckedOut && !isAfter5PM) {
                throw new HttpError(400,"You can only submit overtime after checking out or after 5pm Jakarta time");
                }
            }

            // In both cases (weekend/weekday): check total overtime per day
            const overtimeToday = await Overtime.findAll({
                where: {
                    employee_id: employeeFound.id,
                    created_at: { [Op.gte]: todayStart, [Op.lte]: todayEnd }
                }
            });

            const totalHoursToday =
                overtimeToday.reduce((sum, ot) => sum + ot.hours_number, 0) +
                hours_number;

            if (totalHoursToday > 3) {
                throw new HttpError(400, "Overtime maximum is 3 hours per day");
            }
            
            // add to the overtime table
            const data = await Overtime.create({
                employee_id: employeeFound.id,
                hours_number,
                created_by: employeeFound.id,
                updated_by: employeeFound.id,
                request_ip,
                request_id: generateRequestId()
            });
            

            res.status(200).json({
                status_code: 200,
                data,
            })

        } catch (error) {
            console.error("error in submitOvertime", error)
            next(error)
        }
    }

}

module.exports = { OvertimeController }