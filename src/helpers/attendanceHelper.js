function isWeekendInJakarta(dateInput = new Date()) {
    const jakartaDate = new Date(
        dateInput.toLocaleString("en-US", {timeZone: "Asia/Jakarta"})
    );

    const day = jakartaDate.getDay()
    return day === 0 || day === 6
}

module.exports = isWeekendInJakarta