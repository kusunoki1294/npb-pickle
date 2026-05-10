export const BOARD_ONE_DATE = "2026-05-08";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toDayNumber(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_IN_MS);
}

export function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getBoardNumber(dateValue = new Date()) {
  const dateKey = typeof dateValue === "string" ? dateValue : getDateKey(dateValue);
  const boardNumber = toDayNumber(dateKey) - toDayNumber(BOARD_ONE_DATE) + 1;

  return Math.max(boardNumber, 1);
}

export function getDailyPlayer(players, dateValue = new Date()) {
  const dateKey = typeof dateValue === "string" ? dateValue : getDateKey(dateValue);
  const boardNumber = getBoardNumber(dateKey);
  const pool = [...players].sort((left, right) => left.id.localeCompare(right.id));
  const index = ((boardNumber - 1) % pool.length + pool.length) % pool.length;

  return {
    boardNumber,
    dateKey,
    player: pool[index],
  };
}
