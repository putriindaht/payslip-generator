const { where } = require("sequelize")
const { Employee } = require("../models/employee")

class UserController {
    static async employeeLogin(req, res, next) {
        try {
            const { username, password } = req.body
            const employeeFound = await Employee.findOne({
                where: {
                    username
                }
            })

            console.log(employeeFound)
            
            res.status(200).json({
                success: true,
                access_token: "ac"
            })

        } catch (error) {
            next(error)
        }
    }

    static async adminLogin(req, res, next) {
        try {
            const { username, password } = req.body


        } catch (error) {
            next(error)
        }
    }
}