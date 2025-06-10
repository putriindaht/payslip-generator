
const { HttpError } = require("../helpers/error")
const { generateRequestId } = require("../helpers/generateRequestId")
const { findEmployee } = require("../helpers/services/employeeHelpers");
const { countWorkingDays } = require("../helpers/services/payrollAndPayslipHelpers");
const { Admin, Payroll, Employee, Attendance, sequelize, Payslip } = require("../models/");
const { Op } = require("sequelize");

function isValidDateFormat(dateStr) {
    const regex = /^\d{2}-\d{2}-\d{4}$/;
    return regex.test(dateStr);
}

function parseDdMmYyyyToDate(dateStr) {
    const [dd, mm, yyyy] = dateStr.split('-');
    return new Date(`${yyyy}-${mm}-${dd}`); // Converts to ISO format yyyy-mm-dd
}


class PayrollController {
    static async submitPeriodPayroll(req, res, next) {
        try {
            const { id: admin_id, username } = req.user
            const { period_start, period_end} = req.body // dd-mm-yyyy
            const { request_ip } = req

            if (!period_start || !period_end) {
                throw new HttpError(400, "period_start and period_end are required");
            }

            if (!isValidDateFormat(period_start)) {
                throw new HttpError(400, "period_start must be in format dd-mm-yyyy");
            }

            if (!isValidDateFormat(period_end)) {
                throw new HttpError(400, "period_end must be in format dd-mm-yyyy");
            }

            const startDate = parseDdMmYyyyToDate(period_start);
            const endDate = parseDdMmYyyyToDate(period_end);
            if (endDate <= startDate) throw new HttpError(400, "period_end must be after period_start");

            // check admin
            const adminFound = await Admin.findOne({ where: {id: admin_id, username} });
            if (!adminFound) throw new HttpError(404, "Admin not found")
            
            // check existing payroll period
            const payrollPeriodFound = await Payroll.findOne({
                where: {
                    [Op.and]: [
                        { period_start: { [Op.lte]: endDate } },
                        { period_end:   { [Op.gte]: startDate } },
                    ],
                }
            })

            if (payrollPeriodFound) {
                throw new HttpError(400, "Payroll period overlaps with an existing one")
            }
            
            const data = await Payroll.create({
                period_start: startDate,
                period_end: endDate,
                created_by: adminFound.id,
                updated_by: adminFound.id,
                request_ip,
                request_id: generateRequestId()
            });
            
            res.status(201).json({
                status_code: 201,
                data,
            })

        } catch (error) {
            console.error("error in submitPeriodPayroll", error)
            next(error)
        }
    }

     static async runPeriodPayroll(req, res, next) {
        try {
            const { id: admin_id, username } = req.user
            const { id: payroll_id } = req.params
            const { request_ip } = req

            // check admin
            const adminFound = await Admin.findOne({ where: {id: admin_id, username} });
            if (!adminFound) throw new HttpError(404, "Admin not found")

            // check payroll
            const payrollFound = await Payroll.findByPk(payroll_id)
            if (!payrollFound) throw new HttpError(404, "Payroll not found")
            
            if (payrollFound.run_at || payrollFound.completed_at) {
                console.log("masuuk isini")
                throw new HttpError(400, "Payroll in that period only can run once")
            }

            const run_at = new Date()

            const working_days = countWorkingDays(payrollFound.period_start, payrollFound.period_end)
            console.log({working_days})

            const employees = await Employee.findAll()
            // console.log(employees)

            const payslips = []

            for (let i = 0; i < employees.length; i++ ) {
                const monthly_salary = employees[i].salary
                const salary_per_day = Math.floor(monthly_salary / working_days)
                const salary_per_hour = Math.floor(salary_per_day / 8)
                const overtime_rate = salary_per_hour * 2
                // console.log({monthly_salary, salary_per_day, salary_per_hour, overtime_rate})

                // check attendace
               const [attendaceResult] = await sequelize.query(
                `
                    SELECT COUNT(DISTINCT DATE_TRUNC('day', check_in_time)) AS attendance_days
                    FROM attendances
                    WHERE employee_id = :employee_id
                    AND check_in_time >= :period_start
                    AND check_in_time <= :period_end
                `,
                {
                    replacements: {
                        employee_id: employees[i].id,
                        period_start: payrollFound.period_start,
                        period_end: payrollFound.period_end,
                    },
                    type: sequelize.QueryTypes.SELECT,
                }
                );

                
                const attendance_days = attendaceResult.attendance_days
                const attendance_pay = working_days * attendance_days

                // check overtime 
                const [overtimeResult] = await sequelize.query(
                    `
                        SELECT COALESCE(SUM(hours_number), 0) AS overtime_hours
                        FROM overtimes
                        WHERE employee_id = :employee_id
                        AND created_at >= :period_start
                        AND created_at <= :period_end
                    `,
                    {
                        replacements: {
                        employee_id: employees[i].id,
                        period_start: payrollFound.period_start,
                        period_end: payrollFound.period_end,
                        },
                        type: sequelize.QueryTypes.SELECT,
                    }
                    );

                    // console.log(overtimeResult.overtime_hours);
                const overtime_hours = +overtimeResult.overtime_hours
                const overtime_pay = +overtime_hours * +salary_per_hour

                // check reimbursement
               const [total] = await sequelize.query(
                `
                    SELECT COALESCE(SUM(amount), 0) AS reimbursement_total
                    FROM reimbursements
                    WHERE employee_id = :employee_id
                    AND created_at >= :period_start
                    AND created_at <= :period_end
                `,
                { replacements: {  employee_id: employees[i].id,
                        period_start: payrollFound.period_start,
                        period_end: payrollFound.period_end, }, type: sequelize.QueryTypes.SELECT }
                );

                const [detail] = await sequelize.query(
                `
                    SELECT COALESCE(
                    json_agg(
                        json_build_object(
                        'amount', amount,
                        'description', description
                        )
                    ) FILTER (WHERE id IS NOT NULL),
                    '[]'
                    ) AS reimbursement_detail
                    FROM reimbursements
                    WHERE employee_id = :employee_id
                    AND created_at >= :period_start
                    AND created_at <= :period_end
                `,
                { replacements: { employee_id: employees[i].id,
                        period_start: payrollFound.period_start,
                        period_end: payrollFound.period_end, }, type: sequelize.QueryTypes.SELECT }
                );

                const reimbursement_total = total.reimbursement_total
                const reimbursement_detail = detail.reimbursement_detail

                // console.log(total.reimbursement_total);
                // console.log(detail.reimbursement_detail); // will be a JSON array

                const take_home_pay = attendance_pay + overtime_pay + Number(reimbursement_total)

                const employee_payslip = {
                    employee_id: employees[i].id,
                    payroll_id,
                    base_salary: monthly_salary,
                    attendance_days: Number(attendance_days),
                    attendance_adjustment: working_days - attendance_days,
                    attendance_pay:
                    overtime_hours,
                    overtime_rate,
                    overtime_pay,
                    reimbursement_total: Number(reimbursement_total),
                    reimbursement_detail,
                    take_home_pay,
                    request_ip,
                    request_id: generateRequestId(),
                    created_by: admin_id,
                    updated_by: admin_id,
                    created_at: new Date(),
                    updated_at: new Date(),
                }

                // if (employees[i].id == 'c2422b77-5fc8-4c1b-9a84-1d2f1a26c963') {
                //     console.log("ha")
                //     console.log(employee_payslip, "jjj")
                // }
                payslips.push(employee_payslip)
    
            }

            // console.log(payslips, "pay")

            payslips.forEach((el) => {
                if (el.employee_id == "c2422b77-5fc8-4c1b-9a84-1d2f1a26c963") {
                    console.log("jouo", el)
                }
            })

            // - add bulk to payslips table
            const payslips_data = await Payslip.bulkCreate(payslips)

            const completed_at = new Date()

            await Payroll.update(
                {
                    run_at,
                    completed_at,
                    request_ip,
                    request_id: generateRequestId(),
                    updated_by: admin_id,
                    updated_at: new Date()
                },
                {
                    where: {
                        id: payroll_id
                    }
                }
            );

            
            res.status(200).json({
                status_code: 200,
                // data,
            })

        } catch (error) {
            console.error("error in employeeCheckIn", error)
            next(error)
        }
    }


}

module.exports = { PayrollController }