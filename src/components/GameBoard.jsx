import GuessRow from "@/src/components/GuessRow";

const HEADERS = ["Player", "Team", "League", "B", "T", "Born", "Age", "Pos"];

export default function GameBoard({
  boardDate,
  guesses,
  maxGuesses,
  mysteryPlayer,
}) {
  const emptyRows = Math.max(maxGuesses - guesses.length, 0);

  return (
    <section className="board-shell" aria-label="Guess results">
      <div className="board-scroll">
        <div className="board-grid">
          <div className="board-header">
            {HEADERS.map((header) => (
              <div
                key={header}
                className={`header-cell${header === "Player" ? " header-sticky" : ""}`}
              >
                {header}
              </div>
            ))}
          </div>

          {guesses.map((guess) => (
            <GuessRow
              key={guess.id}
              boardDate={boardDate}
              guess={guess}
              mysteryPlayer={mysteryPlayer}
            />
          ))}

          {Array.from({ length: emptyRows }).map((_, index) => (
            <div className="guess-row" key={`empty-${index}`}>
              <div className="cell-placeholder placeholder-label sticky-cell">
                Guess {guesses.length + index + 1}
              </div>
              {Array.from({ length: 7 }).map((__, cellIndex) => (
                <div className="cell-placeholder" key={`empty-${index}-${cellIndex}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
