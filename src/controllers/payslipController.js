
const { HttpError } = require("../helpers/error")
const { findEmployee } = require("../helpers/services/employeeHelpers")
const { Admin, sequelize } = require("../models/")

class PayslipController {
    static async employeePayslip(req, res, next) {
        try {
            const { id: employee_id, username } = req.user
            const { payroll_id } = req.query
            
            // check employee
            const employeeFound = await findEmployee(employee_id, username)
            if (!employeeFound) {
                throw new HttpError(404, "Employee not found")
            }

           const [data] = await sequelize.query(
                `
                SELECT
                    p.employee_id,
                    p.payroll_id,
                    e.username AS employee_username,
                    p.take_home_pay,
                    p.base_salary,
                    p.attendance_adjustment,
                    p.attendance_days,
                    p.overtime_hours,
                    p.overtime_rate,
                    p.overtime_pay,
                    p.reimbursement_total,
                    p.reimbursement_detail
                    
                FROM payslips p
                JOIN employees e ON p.employee_id = e.id
                WHERE p.payroll_id = :payroll_id AND employee_id = :employee_id
                `,
                {
                    replacements: { payroll_id, employee_id },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            if (!data) {
                throw new HttpError(404, "Payroll not found")
            }
            
            res.status(200).json({
                status_code: 200,
                data
            })

        } catch (error) {
            console.error("error in employeeCheckIn", error)
            next(error)
        }
    }

     static async summaryPayslip(req, res, next) {
        try {
            const { id: admin_id, username } = req.user
            const { id: payroll_id } = req.params

            // check admin
            const adminFound = await Admin.findOne({ where: {id: admin_id, username} });
            if (!adminFound) throw new HttpError(404, "Admin not found")

            // get all takehomepay in payslip
            const dataAllEmployee = await sequelize.query(
                `
                SELECT
                p.employee_id,
                e.username AS employee_username,
                p.take_home_pay
                FROM payslips p
                JOIN employees e ON p.employee_id = e.id
                WHERE p.payroll_id = :payroll_id
                `,
                {
                    replacements: { payroll_id },
                    type: sequelize.QueryTypes.SELECT
                }
            );
            
            // get total take home pay
            const [total_take_home_pay] = await sequelize.query(
                `
                SELECT SUM(take_home_pay) AS total_take_home_pay
                FROM payslips
                WHERE payroll_id = :payroll_id
                `,
                {
                    replacements: { payroll_id },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            
            res.status(200).json({
                status_code: 200,
                total_take_home_pay: total_take_home_pay.total_take_home_pay,
                data: dataAllEmployee,
            })

        } catch (error) {
            console.error("error in employeeCheckIn", error)
            next(error)
        }
    }


}

module.exports = { PayslipController }