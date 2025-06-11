
const { HttpError } = require("../helpers/error")
const { generateRequestId } = require("../helpers/generateRequestId")
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

            // Validate inputs
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

            // Validate admin
            const adminFound = await Admin.findOne({ where: {id: admin_id, username} });
            if (!adminFound) throw new HttpError(404, "Admin not found")
            
            // Check overlapping payroll periods
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
        const t = await sequelize.transaction();
        try {
            const { id: admin_id, username } = req.user
            const { id: payroll_id } = req.params
            const { request_ip } = req

            // validate admin
            const adminFound = await Admin.findOne({ where: {id: admin_id, username} });
            if (!adminFound) throw new HttpError(404, "Admin not found")

            // validate payroll
            const payrollFound = await Payroll.findByPk(payroll_id)
            if (!payrollFound) throw new HttpError(404, "Payroll not found")
            
            if (payrollFound.run_at || payrollFound.completed_at) {
                throw new HttpError(400, "Payroll in that period can only run once")
            }

            const run_at = new Date()
            const working_days = countWorkingDays(payrollFound.period_start, payrollFound.period_end)
            const employees = await Employee.findAll()

            // Build payslips in parallel
            const payslips = await Promise.all(employees.map(async (employee) => {
                const { id: employee_id, salary: monthly_salary } = employee;
                const salary_per_day = Math.floor(monthly_salary / working_days);
                const salary_per_hour = Math.floor(salary_per_day / 8);

                // Attendance
                const [attendanceResult] = await sequelize.query(
                    `SELECT COUNT(DISTINCT DATE_TRUNC('day', check_in_time)) AS attendance_days
                     FROM attendances WHERE employee_id = :employee_id
                     AND check_in_time >= :period_start AND check_in_time <= :period_end`,
                    {
                        replacements: {
                            employee_id,
                            period_start: payrollFound.period_start,
                            period_end: payrollFound.period_end,
                        },
                        type: sequelize.QueryTypes.SELECT,
                        transaction: t,
                    }
                );
                const attendance_days = Number(attendanceResult.attendance_days || 0);
                const attendance_pay = salary_per_day * attendance_days;

                // Overtime
                const [overtimeResult] = await sequelize.query(
                    `SELECT COALESCE(SUM(hours_number), 0) AS overtime_hours
                     FROM overtimes WHERE employee_id = :employee_id
                     AND created_at >= :period_start AND created_at <= :period_end`,
                    {
                        replacements: { employee_id, period_start: payrollFound.period_start, period_end: payrollFound.period_end },
                        type: sequelize.QueryTypes.SELECT,
                        transaction: t,
                    }
                );
                const overtime_hours = Number(overtimeResult.overtime_hours || 0);
                const overtime_rate = salary_per_hour * 2;
                const overtime_pay = overtime_hours * overtime_rate;

                // Reimbursement total
                const [total] = await sequelize.query(
                    `SELECT COALESCE(SUM(amount), 0) AS reimbursement_total
                     FROM reimbursements WHERE employee_id = :employee_id
                     AND created_at >= :period_start AND created_at <= :period_end`,
                    {
                        replacements: { employee_id, period_start: payrollFound.period_start, period_end: payrollFound.period_end },
                        type: sequelize.QueryTypes.SELECT,
                        transaction: t,
                    }
                );
                const reimbursement_total = Number(total.reimbursement_total || 0);

                // Reimbursement details
                const [detail] = await sequelize.query(
                    `SELECT COALESCE(json_agg(json_build_object('amount', amount, 'description', description))
                        FILTER (WHERE id IS NOT NULL), '[]') AS reimbursement_detail
                     FROM reimbursements WHERE employee_id = :employee_id
                     AND created_at >= :period_start AND created_at <= :period_end`,
                    {
                        replacements: { employee_id, period_start: payrollFound.period_start, period_end: payrollFound.period_end },
                        type: sequelize.QueryTypes.SELECT,
                        transaction: t,
                    }
                );
                const reimbursement_detail = detail.reimbursement_detail;

                const take_home_pay = attendance_pay + overtime_pay + reimbursement_total;

                return {
                    employee_id,
                    payroll_id,
                    base_salary: monthly_salary,
                    attendance_days,
                    attendance_adjustment: working_days - attendance_days,
                    attendance_pay,
                    overtime_hours,
                    overtime_rate,
                    overtime_pay,
                    reimbursement_total,
                    reimbursement_detail,
                    take_home_pay,
                    request_ip,
                    request_id: generateRequestId(),
                    created_by: admin_id,
                    updated_by: admin_id,
                    created_at: new Date(),
                    updated_at: new Date(),
                };
            }));

            // Bulk insert payslip
            await Payslip.bulkCreate(payslips, { transaction: t })

            const completed_at = new Date()

            // Update Payroll
            const payroll = await Payroll.update(
                {
                    run_at,
                    completed_at,
                    request_ip,
                    request_id: generateRequestId(),
                    updated_by: admin_id,
                    updated_at: new Date()
                },
                {
                    where: { id: payroll_id },
                    transaction: t
                }
            );

             await t.commit();

            res.status(200).json({
                status_code: 200,
                message: "Payroll completed",
                payroll_id: payrollFound.id,
            })

        } catch (error) {
            if (t.finished !== "commit") await t.rollback();
            console.error("error in runPeriodPayroll", error)
            next(error)
        }
    }


}

module.exports = { PayrollController }