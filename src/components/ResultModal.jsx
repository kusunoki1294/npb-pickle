"use client";

import { useEffect } from "react";
import {
  getLocalizedLeagueName,
  getLocalizedPositionList,
  getLocalizedTeamName,
  getPlayerDisplay,
} from "@/src/i18n/uiCopy";

const CONFETTI_PIECES = Array.from({ length: 52 }, (_, index) => ({
  id: index,
  color: `hsl(${(index * 43) % 360} 80% 58%)`,
  colorEnd: `hsl(${(index * 43 + 28) % 360} 92% 70%)`,
  x: `${(index % 2 === 0 ? -1 : 1) * (60 + ((index * 29) % 520))}px`,
  xEnd: `${(index % 2 === 0 ? -1 : 1) * (110 + ((index * 37) % 700))}px`,
  lift: `${300 + ((index * 31) % 340)}px`,
  fall: `${150 + ((index * 23) % 160)}px`,
  size: `${14 + ((index * 11) % 14)}px`,
  delay: `${((index * 9) % 28) / 100}s`,
  duration: `${2.45 + ((index * 13) % 55) / 100}s`,
  rotate: `${140 + ((index * 47) % 260)}deg`,
  rotateEnd: `${220 + ((index * 61) % 320)}deg`,
  radius: index % 5 === 0 ? "999px" : index % 3 === 0 ? "2px" : "1px",
  shape: index % 6 === 0 ? "star" : index % 4 === 0 ? "diamond" : "streamer",
}));

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
        className={`modal-card result-modal-card${isWin ? " result-modal-card-win" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-title"
        onClick={(event) => event.stopPropagation()}
      >
        {isWin ? (
          <div className="confetti-layer" aria-hidden="true">
            {CONFETTI_PIECES.map((piece) => (
              <span
                key={piece.id}
                className="confetti-piece"
                data-shape={piece.shape}
                style={{
                  "--confetti-color": piece.color,
                  "--confetti-color-end": piece.colorEnd,
                  "--confetti-delay": piece.delay,
                  "--confetti-duration": piece.duration,
                  "--confetti-fall": piece.fall,
                  "--confetti-lift": piece.lift,
                  "--confetti-radius": piece.radius,
                  "--confetti-rotate": piece.rotate,
                  "--confetti-rotate-end": piece.rotateEnd,
                  "--confetti-size": piece.size,
                  "--confetti-x": piece.x,
                  "--confetti-x-end": piece.xEnd,
                }}
              />
            ))}
          </div>
        ) : null}

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
              {teamLabel} • {leagueLabel} • {positionLabel}
            </p>
          </div>

          <p>{isWin ? copy.winBody(guessCount) : copy.lossBody}</p>

          {shareText ? (
            <div className="result-share-card">
              <pre className="result-share-block">{shareText}</pre>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
