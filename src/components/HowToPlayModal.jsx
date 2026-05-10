"use client";

const CATEGORY_RULES = [
  "Team: green for the same team, yellow for the same league.",
  "League: green for the same league.",
  "B/T: green for the same bats or throws hand.",
  "Born: green for the same birthplace, yellow for the same country or region.",
  "Age: green for the exact age, yellow if it is within 2 years.",
  "Position: green for the same primary position, yellow for an alternate match.",
];

export default function HowToPlayModal({ isOpen, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal-card modal-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-to-play-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="modal-tag">First Visit Guide</span>
            <h2 id="how-to-play-title">How to Play</h2>
          </div>
          <button className="icon-close" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="modal-body">
          <p>
            Guess the mystery NPB player in 9 tries. Each guess is checked
            across the board and every cell gives you a clue.
          </p>

          <div className="legend-grid">
            <div className="legend-card">
              <span className="legend-swatch exact" />
              <strong>Green</strong>
              <p>Exact match.</p>
            </div>
            <div className="legend-card">
              <span className="legend-swatch close" />
              <strong>Yellow</strong>
              <p>Close or partial match.</p>
            </div>
            <div className="legend-card">
              <span className="legend-swatch miss" />
              <strong>Gray</strong>
              <p>No match.</p>
            </div>
          </div>

          <div className="rules-card">
            <strong>Category Rules</strong>
            <ul className="modal-list">
              {CATEGORY_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
