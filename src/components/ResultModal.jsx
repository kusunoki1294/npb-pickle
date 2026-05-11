"use client";

import { useEffect } from "react";
import {
  getLocalizedLeagueName,
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
  const { primary, secondary } = getPlayerDisplay(mysteryPlayer, locale);
  const teamLabel = getLocalizedTeamName(mysteryPlayer.team, locale);
  const leagueLabel = getLocalizedLeagueName(mysteryPlayer.league, locale);

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
            <span className="modal-tag">{copy.tag(boardNumber)}</span>
            <h2 id="result-title">{isWin ? copy.winTitle : copy.lossTitle}</h2>
          </div>
          <button className="icon-close" type="button" onClick={onClose}>
            {copy.close}
          </button>
        </div>

        <div className="modal-body">
          <div className="result-highlight">
            <strong>{primary}</strong>
            {secondary ? <span>{secondary}</span> : null}
            <p>
              {teamLabel} • {leagueLabel} • {mysteryPlayer.positions.join(" / ")}
            </p>
          </div>

          <p>{isWin ? copy.winBody(guessCount) : copy.lossBody}</p>

          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onShare}>
              {copy.share}
            </button>
            <button className="primary-button" type="button" onClick={onClose}>
              {copy.close}
            </button>
          </div>

          {shareMessage ? <p className="share-toast modal-share">{shareMessage}</p> : null}
        </div>
      </section>
    </div>
  );
}
