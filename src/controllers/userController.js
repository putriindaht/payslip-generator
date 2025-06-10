const { Admin } = require("../models/")
const { findEmployee } = require("../helpers/services/employeeHelpers")
const { handleLogin } = require("../helpers/loginHelper")

class UserController {
    static async employeeLogin(req, res, next) {
        try {
            const { username, password } = req.body

            const data = await handleLogin({
                username,
                password,
                finder: async (username) => await findEmployee(null, username),
                role: "employee"
            });

            res.status(200).json({
                status_code: 200,
                id: data.id,
                username: data.username,
                message: `Employee ${data.username} login successfull`,
                access_token: data.access_token
            })

        } catch (error) {
            next(error)
        }
    }

    static async adminLogin(req, res, next) {
        try {
            const { username, password } = req.body

            const data = await handleLogin({
                username,
                password,
                finder: async (username) => await Admin.findOne({ where: { username } }),
                role: "admin"
            });

            res.status(200).json({
                status_code: 200,
                id: data.id,
                username: data.username,
                message: `Admin ${data.username} login successfull`,
                access_token: data.access_token
            })

        } catch (error) {
            next(error)
        }
    }
}

module.exports = { UserController }