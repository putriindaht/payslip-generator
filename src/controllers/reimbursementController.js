
const { HttpError } = require("../helpers/error")
const { generateRequestId } = require("../helpers/generateRequestId")
const { findEmployee } = require("../helpers/services/employeeHelpers")
const { Reimbursement } = require("../models/")

class ReimbursementController {
    static async submitReimbursement(req, res, next) {
        try {
            const { id: employee_id, username } = req.user
            const { amount, description} = req.body
            const { request_ip } = req

            if (!amount || !description) {
                throw new HttpError(400, "Amount and description must be provided")
            }
            
            if (typeof amount !== "number") {
                throw new HttpError(400, "Amount must be integer")
            }

            const employeeFound = await findEmployee(employee_id, username)
            if (!employeeFound) throw new HttpError(404, "Employee not found")
            
            const data = await Reimbursement.create({
                employee_id: employeeFound.id,
                amount,
                description,
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
            console.error("error in submitReimbursement", error)
            next(error)
        }
    }

}

module.exports = { ReimbursementController }