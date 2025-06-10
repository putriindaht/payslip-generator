class HttpError extends Error {
    constructor(code, message) {
        super(message);
        this.name = "HttpError";
        this.code = code;
        Error.captureStackTrace(this, HttpError);
    }

    toJSON() {
        return {
            status_code: this.code,
            error: {
                message: this.message
            }
        };
    }
}

module.exports = { HttpError }