function getJakartaNow() {
    // Get current time in Jakarta (UTC+7)
    return new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );
}

module.exports = getJakartaNow