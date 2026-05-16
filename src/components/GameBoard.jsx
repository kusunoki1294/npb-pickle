import GuessRow from "@/src/components/GuessRow";

export default function GameBoard({
  boardDate,
  copy,
  guesses,
  latestGuessRowRef = null,
  locale,
  maxGuesses,
  mysteryPlayer,
}) {
  const emptyRows = Math.max(maxGuesses - guesses.length, 0);

  return (
    <section className="board-shell" aria-label={copy.ariaLabel}>
      <div className="board-scroll">
        <div className="board-grid">
          <div className="board-header">
            {copy.headers.map((header, index) => (
              <div
                key={header}
                className={`header-cell${index === 0 ? " header-sticky" : ""}`}
              >
                {header}
              </div>
            ))}
          </div>

          {guesses.map((guess, index) => (
            <GuessRow
              key={guess.id}
              boardDate={boardDate}
              guess={guess}
              locale={locale}
              mysteryPlayer={mysteryPlayer}
              rowRef={index === guesses.length - 1 ? latestGuessRowRef : null}
            />
          ))}

          {Array.from({ length: emptyRows }).map((_, index) => (
            <div className="guess-row" key={`empty-${index}`}>
              <div className="cell-placeholder placeholder-label sticky-cell">
                {copy.guessLabel(guesses.length + index + 1)}
              </div>
              {Array.from({ length: 6 }).map((__, cellIndex) => (
                <div className="cell-placeholder" key={`empty-${index}-${cellIndex}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
