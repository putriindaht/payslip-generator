const { HttpError } = require("../helpers/error")

async function adminAuthorization(req, res, next) {
    try {
        const { role } = req.user

        if (role === "admin") {
            next()
        } else {
            throw new HttpError(401, "Request not authorized")
        }
    } catch (error) {
        next(error)
    }
}

async function employeeAuthorization(req, res, next) {
    try {
        const { role } = req.user

        if (role === "employee") {
            next()
        } else {
            throw new HttpError(401, "Request not authorized")
        }
    } catch (error) {
        next(error)
    }
}

module.exports = { adminAuthorization, employeeAuthorization }