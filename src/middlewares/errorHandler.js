const { HttpError } = require("../helpers/error");

function errorHandler (err, req, res, next) {
    if (err instanceof HttpError) {
        return res.status(err.code).json(err.toJSON());
    }

    res.status(500).json({
        status_code: 500,
        error: {
            message: "Internal Server Error"
        }
    });
}

module.exports = { errorHandler }