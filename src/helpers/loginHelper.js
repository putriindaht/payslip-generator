const { HttpError } = require("./error");
const { validatePassword } = require("./bcrypt");
const { generateToken } = require("./jwt");

// The generic login handler
async function handleLogin({ username, password, finder, role }) {
    // Find the user with the provided finder function
    const user = await finder(username);
    if (!user) {
        throw new HttpError(400, "Invalid username or password.");
    }

    // Validate password
    const isValid = validatePassword(password, user.dataValues.password);
    if (!isValid) {
        throw new HttpError(400, "Invalid username or password.");
    }

    // Generate token
    const token = generateToken({
        id: user.id,
        username: user.username,
        role
    });

    // Return essential user data and the token
    return {
        id: user.id,
        username: user.username,
        role,
        access_token: token
    };
}

module.exports = { handleLogin };
