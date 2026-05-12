import { compareGuess } from "@/src/utils/compareGuess";

const SQUARES = {
  exact: "🟩",
  close: "🟨",
  miss: "⬛",
};

function getRowStatuses(result) {
  return [
    result.team.status,
    result.bats.status,
    result.throws.status,
    result.height.status,
    result.age.status,
    result.position.status,
  ];
}

export function buildShareResults({
  boardNumber,
  boardDate,
  guesses,
  maxGuesses,
  mysteryPlayer,
}) {
  const didWin = guesses.at(-1)?.id === mysteryPlayer.id;
  const rows = guesses.map((guess) => {
    const comparison = compareGuess(guess, mysteryPlayer, boardDate);
    return getRowStatuses(comparison)
      .map((status) => SQUARES[status])
      .join("");
  });

  return [
    `NPB Pickle #${String(boardNumber).padStart(3, "0")}`,
    didWin ? `${guesses.length}/${maxGuesses}` : `X/${maxGuesses}`,
    "",
    ...rows,
  ].join("\n");
}
