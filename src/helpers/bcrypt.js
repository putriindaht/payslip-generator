const bcrypt = require("bcryptjs")

function hashPassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}

function validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword)
}

module.exports = {
    hashPassword,
    validatePassword
}