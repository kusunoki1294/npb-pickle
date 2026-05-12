"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import calculateAge from "@/src/utils/calculateAge";
import {
  getLocalizedHandednessLabel,
  getLocalizedPositionName,
  getLocalizedTeamName,
  getPlayerDisplay,
} from "@/src/i18n/uiCopy";

function normalizeSearchValue(value) {
  return value
    .toLowerCase()
    .replace(/[\s,'’.-]/g, "")
    .replace(/　/g, "");
}

function matchesPlayer(player, normalizedQuery) {
  const englishName = normalizeSearchValue(player.englishName);
  const japaneseName = normalizeSearchValue(player.japaneseName || "");

  return (
    englishName.includes(normalizedQuery) || japaneseName.includes(normalizedQuery)
  );
}

export default function SearchBar({
  boardDate,
  copy,
  players,
  guessedIds,
  disabled,
  locale,
  notice,
  onGuess,
  setNotice,
}) {
  const searchRef = useRef(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = normalizeSearchValue(deferredQuery.trim());

  const allMatches = useMemo(() => {
    if (normalizedQuery.length < 2) {
      return [];
    }

    return players.filter((player) => matchesPlayer(player, normalizedQuery));
  }, [normalizedQuery, players]);

  const availableMatches = useMemo(
    () => allMatches.filter((player) => !guessedIds.has(player.id)).slice(0, 8),
    [allMatches, guessedIds],
  );

  const helperMessage = useMemo(() => {
    if (disabled) {
      return copy.disabled;
    }

    if (notice) {
      return notice;
    }

    if (normalizedQuery.length >= 2 && allMatches.length > 0 && availableMatches.length === 0) {
      return copy.allMatchedGuessed;
    }

    if (normalizedQuery.length >= 2 && allMatches.length === 0) {
      return copy.noPlayersFound(deferredQuery.trim());
    }

    return copy.typeHint;
  }, [
    allMatches.length,
    availableMatches.length,
    copy,
    deferredQuery,
    disabled,
    normalizedQuery.length,
    notice,
  ]);

  useEffect(() => {
    if (normalizedQuery.length < 2) {
      setIsOpen(false);
      return;
    }

    if (selectedPlayerId) {
      setIsOpen(false);
      return;
    }

    setIsOpen(availableMatches.length > 0);
  }, [availableMatches.length, normalizedQuery.length, selectedPlayerId]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!searchRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!selectedPlayerId) {
      return;
    }

    const selectedPlayer = players.find((player) => player.id === selectedPlayerId);

    if (!selectedPlayer) {
      setSelectedPlayerId(null);
      return;
    }

    setQuery(getPlayerDisplay(selectedPlayer, locale).primary);
  }, [locale, players, selectedPlayerId]);

  function submitGuess(player) {
    onGuess(player);
    setQuery("");
    setIsOpen(false);
    setSelectedPlayerId(null);
  }

  function selectPlayer(player) {
    setSelectedPlayerId(player.id);
    setQuery(getPlayerDisplay(player, locale).primary);
    setIsOpen(false);
    setNotice("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const normalizedInput = normalizeSearchValue(query.trim());
    const selectedPlayer = selectedPlayerId
      ? players.find((player) => player.id === selectedPlayerId)
      : null;

    if (normalizedInput.length < 2) {
      setNotice(copy.typeTooShort);
      return;
    }

    if (selectedPlayer) {
      if (guessedIds.has(selectedPlayer.id)) {
        setNotice(copy.alreadyGuessed(getPlayerDisplay(selectedPlayer, locale).primary));
        return;
      }

      submitGuess(selectedPlayer);
      return;
    }

    const duplicateExact = players.find(
      (player) =>
        guessedIds.has(player.id) &&
        (normalizeSearchValue(player.englishName) === normalizedInput ||
          normalizeSearchValue(player.japaneseName || "") === normalizedInput),
    );

    if (duplicateExact) {
      setNotice(copy.alreadyGuessed(getPlayerDisplay(duplicateExact, locale).primary));
      return;
    }

    const exactMatch = players.find(
      (player) =>
        !guessedIds.has(player.id) &&
        (normalizeSearchValue(player.englishName) === normalizedInput ||
          normalizeSearchValue(player.japaneseName || "") === normalizedInput),
    );

    if (exactMatch) {
      submitGuess(exactMatch);
      return;
    }

    if (availableMatches.length === 1) {
      submitGuess(availableMatches[0]);
      return;
    }

    if (availableMatches.length === 0) {
      setNotice(copy.noMatchingPlayer);
      return;
    }

    setNotice(copy.chooseDropdown);
    setIsOpen(true);
  }

  function handleChange(event) {
    setQuery(event.target.value);
    setSelectedPlayerId(null);

    if (notice) {
      setNotice("");
    }
  }

  return (
    <section className="search-panel" ref={searchRef}>
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-row">
          <input
            className="search-input"
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => {
              if (!selectedPlayerId && availableMatches.length > 0) {
                setIsOpen(true);
              }
            }}
            placeholder={copy.placeholder}
            autoComplete="off"
            aria-label={copy.ariaLabel}
            disabled={disabled}
          />
          <button className="guess-button" type="submit" disabled={disabled}>
            {disabled ? copy.roundComplete : copy.submitGuess}
          </button>
        </div>

        {isOpen && availableMatches.length > 0 ? (
          <ul className="suggestion-list">
            {availableMatches.map((player) => {
              const { primary, secondary } = getPlayerDisplay(player, locale);

              return (
                <li key={player.id}>
                  <button
                    className="suggestion-item"
                    type="button"
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => selectPlayer(player)}
                  >
                    <div className="suggestion-copy">
                      <span className="suggestion-name">{primary}</span>
                      {secondary ? <span className="suggestion-alt">{secondary}</span> : null}
                    </div>
                    <div className="suggestion-stats">
                      <span className="suggestion-stat">
                        {getLocalizedTeamName(player.teamShort, locale)}
                      </span>
                      <span className="suggestion-stat">
                        {getLocalizedHandednessLabel(player.bats, locale)}
                        /
                        {getLocalizedHandednessLabel(player.throws, locale)}
                      </span>
                      <span className="suggestion-stat">{player.heightCm} cm</span>
                      <span className="suggestion-stat">
                        {calculateAge(player.birthDate, boardDate)}
                      </span>
                      <span className="suggestion-stat">
                        {getLocalizedPositionName(player.primaryPosition, locale)}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </form>

      <p
        className={`search-note${
          notice ||
          (normalizedQuery.length >= 2 &&
            (allMatches.length === 0 || availableMatches.length === 0))
            ? " error"
            : ""
        }`}
      >
        {helperMessage}
      </p>
    </section>
  );
}
