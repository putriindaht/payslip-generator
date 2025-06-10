
function countWorkingDays(startDate, endDate) {
  let count = 0;
  let current = new Date(startDate);

  // Normalize time to midnight
  current.setHours(0, 0, 0, 0);
  endDate = new Date(endDate);
  endDate.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const day = current.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
    if (day >= 1 && day <= 5) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

module.exports = { countWorkingDays };