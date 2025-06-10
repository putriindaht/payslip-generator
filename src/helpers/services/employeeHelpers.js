const { Employee } = require("../../models");
const { HttpError } = require("../error");

async function findEmployeeOrThrow(id = null, username = null) {
    try {
        const where = {};
        if (id) where.id = id;
        if (username) where.username = username;

        const employee = await Employee.findOne({ where });
        if (!employee) throw new HttpError(404, "Employee not found");
        return employee;
    } catch (error) {
        console.error("error in findEmployeeOrThrow: ", error)
        throw error
    }
}

module.exports = { findEmployeeOrThrow };