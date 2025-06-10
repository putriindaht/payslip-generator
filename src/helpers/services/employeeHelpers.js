const { Employee } = require("../../models");
const { HttpError } = require("../error");

async function findEmployee(id = null, username = null) {
    try {
        const where = {};
        if (id) where.id = id;
        if (username) where.username = username;

        const employee = await Employee.findOne({ where });
        if (!employee) return null
        return employee;
    } catch (error) {
        console.error("error in findEmployee: ", error)
        return null
    }
}

module.exports = { findEmployee };