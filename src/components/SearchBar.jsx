"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";

function normalizeSearchValue(value) {
  return value
    .toLowerCase()
    .replace(/[\s'’.-]/g, "")
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
  players,
  guessedIds,
  disabled,
  notice,
  onGuess,
  setNotice,
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
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
      return "The daily round is complete. Open the result or come back tomorrow.";
    }

    if (notice) {
      return notice;
    }

    if (normalizedQuery.length >= 2 && allMatches.length > 0 && availableMatches.length === 0) {
      return "Those matching players have already been guessed.";
    }

    if (normalizedQuery.length >= 2 && allMatches.length === 0) {
      return `No players found for “${deferredQuery.trim()}”. Try an English or Japanese name.`;
    }

    return "Type at least 2 letters or characters to search the player pool.";
  }, [
    allMatches.length,
    availableMatches.length,
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

    setIsOpen(availableMatches.length > 0);
  }, [availableMatches.length, normalizedQuery.length]);

  function submitGuess(player) {
    onGuess(player);
    setQuery("");
    setIsOpen(false);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const normalizedInput = normalizeSearchValue(query.trim());

    if (normalizedInput.length < 2) {
      setNotice("Type at least 2 letters or characters to search.");
      return;
    }

    const duplicateExact = players.find(
      (player) =>
        guessedIds.has(player.id) &&
        (normalizeSearchValue(player.englishName) === normalizedInput ||
          normalizeSearchValue(player.japaneseName || "") === normalizedInput),
    );

    if (duplicateExact) {
      setNotice(`${duplicateExact.englishName} has already been guessed.`);
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
      setNotice("No matching player was found. Try a full English or Japanese name.");
      return;
    }

    setNotice("Choose one of the matching players from the dropdown.");
    setIsOpen(true);
  }

  function handleChange(event) {
    setQuery(event.target.value);

    if (notice) {
      setNotice("");
    }
  }

  return (
    <section className="search-panel">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-row">
          <input
            className="search-input"
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => {
              if (availableMatches.length > 0) {
                setIsOpen(true);
              }
            }}
            onBlur={() => {
              window.setTimeout(() => setIsOpen(false), 110);
            }}
            placeholder="Search by English or Japanese player name..."
            autoComplete="off"
            aria-label="Search player names"
            disabled={disabled}
          />
          <button className="guess-button" type="submit" disabled={disabled}>
            {disabled ? "Round Complete" : "Submit Guess"}
          </button>
        </div>

        {isOpen && availableMatches.length > 0 ? (
          <ul className="suggestion-list">
            {availableMatches.map((player) => (
              <li key={player.id}>
                <button
                  className="suggestion-item"
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => submitGuess(player)}
                >
                  <div>
                    <span className="suggestion-name">{player.englishName}</span>
                    {player.japaneseName ? (
                      <span className="suggestion-alt">{player.japaneseName}</span>
                    ) : null}
                  </div>
                  <span className="suggestion-meta">
                    {player.teamShort} • {player.primaryPosition}
                  </span>
                </button>
              </li>
            ))}
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
