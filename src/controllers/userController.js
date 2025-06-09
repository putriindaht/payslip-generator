const { where } = require("sequelize")
const { Employee, Admin } = require("../models/")
const { validatePassword } = require("../helpers/bcrypt")
const { generateToken } = require("../helpers/jwt")

class UserController {
    static async employeeLogin(req, res, next) {
        try {
            const { username, password } = req.body

            // check employee
            const employeeFound = await Employee.findOne({
                where: {
                    username
                }
            })

            if (!employeeFound) {
                res.status(400).json({
                    success: false,
                    message: "Invalid username or password"
                })
            }

            const isValidPassword = validatePassword(password, employeeFound.dataValues.password)
            if (!isValidPassword) {
                 res.status(400).json({
                    success: false,
                    message: "Invalid username or password"
                })
            }

            const token = generateToken({
                id: employeeFound.dataValues.id,
                username: employeeFound.dataValues.username,
                role: "employee"
            })

            res.status(200).json({
                success: true,
                message: "Login Success",
                access_token: token
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

module.exports = { UserController }