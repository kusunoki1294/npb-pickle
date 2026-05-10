import { compareGuess } from "@/src/utils/compareGuess";

function DataCell({ cell }) {
  return (
    <div className={`cell ${cell.status}`}>
      <div className="value-stack">
        <span className="value-main">{cell.value}</span>
        {cell.hint ? <span className="value-sub">{cell.hint}</span> : null}
      </div>
    </div>
  );
}

export default function GuessRow({ boardDate, guess, mysteryPlayer }) {
  const result = compareGuess(guess, mysteryPlayer, boardDate);

  return (
    <div className="guess-row">
      <div className="cell player-cell sticky-cell">
        <div className="player-copy">
          <strong>{guess.englishName}</strong>
          {guess.japaneseName ? <span>{guess.japaneseName}</span> : null}
        </div>
      </div>

      <DataCell cell={result.team} />
      <DataCell cell={result.league} />
      <DataCell cell={result.bats} />
      <DataCell cell={result.throws} />
      <DataCell cell={result.birthPlace} />
      <DataCell cell={result.age} />
      <DataCell cell={result.position} />
    </div>
  );
}
