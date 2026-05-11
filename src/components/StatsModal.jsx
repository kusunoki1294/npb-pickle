"use client";

const GUESS_SLOTS = Array.from({ length: 9 }, (_, index) => String(index + 1));

export default function StatsModal({ copy, isOpen, onClose, stats }) {
  if (!isOpen) {
    return null;
  }

  const maxDistributionCount = Math.max(
    ...GUESS_SLOTS.map((guessSlot) => stats.guessDistribution[guessSlot] || 0),
    1,
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal-card modal-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="modal-tag">{copy.tag}</span>
            <h2 id="stats-title">{copy.title}</h2>
          </div>
          <button className="icon-close" type="button" onClick={onClose}>
            {copy.close}
          </button>
        </div>

        <div className="modal-body">
          <div className="stats-grid">
            <div className="stats-card">
              <span>{copy.gamesPlayed}</span>
              <strong>{stats.gamesPlayed}</strong>
            </div>
            <div className="stats-card">
              <span>{copy.wins}</span>
              <strong>{stats.wins}</strong>
            </div>
            <div className="stats-card">
              <span>{copy.losses}</span>
              <strong>{stats.losses}</strong>
            </div>
            <div className="stats-card">
              <span>{copy.winPercentage}</span>
              <strong>{stats.winPercentage}%</strong>
            </div>
            <div className="stats-card">
              <span>{copy.currentStreak}</span>
              <strong>{stats.currentStreak}</strong>
            </div>
            <div className="stats-card">
              <span>{copy.maxStreak}</span>
              <strong>{stats.maxStreak}</strong>
            </div>
          </div>

          <div className="distribution-card">
            <strong>{copy.guessDistribution}</strong>
            <div className="distribution-list">
              {GUESS_SLOTS.map((guessSlot) => {
                const count = stats.guessDistribution[guessSlot] || 0;
                const width = `${Math.max((count / maxDistributionCount) * 100, 8)}%`;

                return (
                  <div className="distribution-row" key={guessSlot}>
                    <span className="distribution-label">{guessSlot}</span>
                    <div className="distribution-bar-shell">
                      <div className="distribution-bar" style={{ width }}>
                        {count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
