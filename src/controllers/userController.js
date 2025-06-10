const { Employee, Admin } = require("../models/")
const { validatePassword } = require("../helpers/bcrypt")
const { generateToken } = require("../helpers/jwt")
const { HttpError } = require("../helpers/error")

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
                throw new HttpError(400, "Invalid username or password")
            }

            const isValidPassword = validatePassword(password, employeeFound.dataValues.password)
            if (!isValidPassword) {
               throw new HttpError(400, "Invalid username or password")
            }

            const token = generateToken({
                id: employeeFound.id,
                username: employeeFound.username,
                role: "employee"
            })

            res.status(200).json({
                status_code: 200,
                message: "Empployee Login Success",
                access_token: token
            })

        } catch (error) {
            next(error)
        }
    }

    static async adminLogin(req, res, next) {
        try {
             const { username, password } = req.body
             console.log({username, password})

            // check admin
            const adminFound = await Admin.findOne({
                where: {
                    username
                }
            })

            if (!adminFound) {
                throw new HttpError(400, "Invalid username or password")
            }

            const isValidPassword = validatePassword(password, adminFound.dataValues.password)
            if (!isValidPassword) {
               throw new HttpError(400, "Invalid username or password")
            }

            const token = generateToken({
                id: adminFound.id,
                username: adminFound.username,
                role: "admin"
            })

            res.status(200).json({
                status_code: 200,
                message: "Empployee Login Success",
                access_token: token
            })

        } catch (error) {
            next(error)
        }
    }
}

module.exports = { UserController }