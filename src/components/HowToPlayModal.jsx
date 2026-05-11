"use client";

export default function HowToPlayModal({ copy, isOpen, onClose }) {
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
            <span className="modal-tag">{copy.tag}</span>
            <h2 id="how-to-play-title">{copy.title}</h2>
          </div>
          <button className="icon-close" type="button" onClick={onClose}>
            {copy.close}
          </button>
        </div>

        <div className="modal-body">
          <p>{copy.intro}</p>

          <div className="legend-grid">
            <div className="legend-card">
              <span className="legend-swatch exact" />
              <strong>{copy.legend[0].label}</strong>
              <p>{copy.legend[0].description}</p>
            </div>
            <div className="legend-card">
              <span className="legend-swatch close" />
              <strong>{copy.legend[1].label}</strong>
              <p>{copy.legend[1].description}</p>
            </div>
            <div className="legend-card">
              <span className="legend-swatch miss" />
              <strong>{copy.legend[2].label}</strong>
              <p>{copy.legend[2].description}</p>
            </div>
          </div>

          <div className="rules-card">
            <strong>{copy.rulesTitle}</strong>
            <ul className="modal-list">
              {copy.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
