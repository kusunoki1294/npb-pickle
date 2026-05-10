function getDateParts(dateValue) {
  if (typeof dateValue === "string") {
    const [year, month, day] = dateValue.split("-").map(Number);
    return { year, month, day };
  }

  return {
    year: dateValue.getFullYear(),
    month: dateValue.getMonth() + 1,
    day: dateValue.getDate(),
  };
}

export default function calculateAge(birthDate, boardDate = new Date()) {
  const birth = getDateParts(birthDate);
  const board = getDateParts(boardDate);

  let age = board.year - birth.year;

  if (
    board.month < birth.month ||
    (board.month === birth.month && board.day < birth.day)
  ) {
    age -= 1;
  }

  return age;
}
