const { HttpError } = require("../helpers/error");
const jwt = require("jsonwebtoken")
const SECRET = process.env.JWT_SECRET || "sosecret"
const { Admin, Employee } = require("../models")

function getRequestIp(req) {
    // Try x-forwarded-for first (for proxies)
    let ip = req.headers['x-forwarded-for']?.split(',')[0].trim()
            || req.ip
            || req.connection?.remoteAddress
            || req.socket?.remoteAddress
            || req.connection?.socket?.remoteAddress
            || null;

    // Normalize IPv6 localhost to IPv4
    if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '127.0.0.1';
    return ip;
}

async function authentication(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        throw new HttpError(401, "Missing Authorization header")
    };

    // Bearer <token>
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        throw new HttpError(401, "Invalid Authorization format")
    };

    const access_token = parts[1];

    try {
        const payload = jwt.verify(access_token, SECRET);
        if (!payload) throw new HttpError(401, "Request not authenticated")
        
        const { id, username, role } = payload
        let user = null

        if (role === "admin") {
            user = await Admin.findOne({
                where: {
                    id,
                    username
                },
                attributes: {
                    exclude: ['password']
                }
            })
        }

        if (role === "employee") {
            user = await Employee.findOne({
                where: {
                    id,
                    username
                },
                attributes: {
                    exclude: ['password']
                }
            })
        }

        if (!user) return next(new HttpError(401, "User not found"));

        req.request_ip = getRequestIp(req);

        req.user = {
            id: user.id,
            username: user.username,
            role: role
        }
        next();
    } catch (error) {
        throw new HttpError(401, "Invalid or expired access token");
    }
}

module.exports = { authentication }