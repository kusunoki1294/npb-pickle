"use client";

import { useEffect } from "react";

export default function ResultModal({
  boardNumber,
  guessCount,
  isOpen,
  mysteryPlayer,
  onClose,
  onShare,
  shareMessage,
  status,
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mysteryPlayer) {
    return null;
  }

  const isWin = status === "won";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="modal-tag">Board #{String(boardNumber).padStart(3, "0")}</span>
            <h2 id="result-title">{isWin ? "You got it!" : "Better luck tomorrow"}</h2>
          </div>
          <button className="icon-close" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="modal-body">
          <div className="result-highlight">
            <strong>{mysteryPlayer.englishName}</strong>
            {mysteryPlayer.japaneseName ? <span>{mysteryPlayer.japaneseName}</span> : null}
            <p>
              {mysteryPlayer.team} • {mysteryPlayer.league} League •{" "}
              {mysteryPlayer.positions.join(" / ")}
            </p>
          </div>

          {isWin ? (
            <p>
              You found the mystery player in {guessCount}{" "}
              {guessCount === 1 ? "guess" : "guesses"}.
            </p>
          ) : (
            <p>The mystery player is revealed above. A new board arrives tomorrow.</p>
          )}

          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onShare}>
              Share Results
            </button>
            <button className="primary-button" type="button" onClick={onClose}>
              Close
            </button>
          </div>

          {shareMessage ? <p className="share-toast modal-share">{shareMessage}</p> : null}
        </div>
      </section>
    </div>
  );
}
