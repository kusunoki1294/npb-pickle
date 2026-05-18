"use client";

import { useEffect } from "react";
import {
  getLocalizedLeagueName,
  getLocalizedPositionList,
  getLocalizedTeamName,
  getPlayerDisplay,
} from "@/src/i18n/uiCopy";

export default function ResultModal({
  boardNumber,
  copy,
  guessCount,
  isOpen,
  locale,
  mysteryPlayer,
  onClose,
  shareText,
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
  const { primary, secondary } = getPlayerDisplay(mysteryPlayer, locale);
  const teamLabel = getLocalizedTeamName(mysteryPlayer.team, locale);
  const leagueLabel = getLocalizedLeagueName(mysteryPlayer.league, locale);
  const positionLabel = getLocalizedPositionList(mysteryPlayer.positions, locale).join(" / ");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal-card modal-wide result-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="modal-tag">{copy.tag(boardNumber)}</span>
            <h2 id="result-title">{isWin ? copy.winTitle : copy.lossTitle}</h2>
          </div>
          <button className="icon-close" type="button" onClick={onClose}>
            {copy.close}
          </button>
        </div>

        <div className="modal-body">
          <div className="result-stack">
            <div className={`result-highlight${isWin ? " result-highlight-win" : ""}`}>
              <strong>{primary}</strong>
              {secondary ? <span>{secondary}</span> : null}
              <p>
                {teamLabel} • {leagueLabel} • {positionLabel}
              </p>
            </div>

            <div className="result-summary-card">
              <p>{isWin ? copy.winBody(guessCount) : copy.lossBody}</p>
            </div>

            {shareText ? (
              <div className="result-share-card">
                <pre className="result-share-block">{shareText}</pre>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
