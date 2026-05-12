import { getPlayerDisplay } from "@/src/i18n/uiCopy";
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

export default function GuessRow({ boardDate, guess, locale, mysteryPlayer }) {
  const result = compareGuess(guess, mysteryPlayer, boardDate, locale);
  const { primary, secondary } = getPlayerDisplay(guess, locale);

  return (
    <div className="guess-row">
      <div className="cell player-cell sticky-cell">
        <div className="player-copy">
          <strong>{primary}</strong>
          {secondary ? <span>{secondary}</span> : null}
        </div>
      </div>

      <DataCell cell={result.team} />
      <DataCell cell={result.bats} />
      <DataCell cell={result.throws} />
      <DataCell cell={result.height} />
      <DataCell cell={result.age} />
      <DataCell cell={result.position} />
    </div>
  );
}
