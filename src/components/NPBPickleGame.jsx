"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import GameBoard from "@/src/components/GameBoard";
import HowToPlayModal from "@/src/components/HowToPlayModal";
import ResultModal from "@/src/components/ResultModal";
import SearchBar from "@/src/components/SearchBar";
import StatsModal from "@/src/components/StatsModal";
import { UI_COPY, getPlayerDisplay } from "@/src/i18n/uiCopy";
import players from "@/src/data/players";
import {
  clearDailyGame,
  createInitialGameState,
  hasSeenHowToPlay,
  loadDailyGame,
  loadLocale,
  loadStats,
  markHowToPlaySeen,
  recordCompletedGame,
  removeGameFromStats,
  saveLocale,
  saveDailyGame,
} from "@/src/utils/localStorage";
import { getDailyPlayer, getDateKey } from "@/src/utils/getDailyPlayer";
import { buildShareResults } from "@/src/utils/shareResults";

const MAX_GUESSES = 9;

function sanitizeGameState(savedState, mysteryPlayerId, boardNumber, playerMap) {
  const guessIds = Array.isArray(savedState?.guessIds)
    ? savedState.guessIds.filter((guessId) => playerMap.has(guessId))
    : [];
  const status =
    savedState?.status === "won" || savedState?.status === "lost"
      ? savedState.status
      : "playing";

  return {
    dateKey: savedState?.dateKey,
    boardNumber,
    mysteryPlayerId,
    guessIds,
    status,
    statsRecorded: Boolean(savedState?.statsRecorded),
  };
}

export default function NPBPickleGame() {
  const aboutRef = useRef(null);
  const menuRef = useRef(null);
  const [dateKey, setDateKey] = useState("");
  const [boardNumber, setBoardNumber] = useState(1);
  const [gameState, setGameState] = useState(null);
  const [hasLoadedLocale, setHasLoadedLocale] = useState(false);
  const [locale, setLocale] = useState("en");
  const [stats, setStats] = useState(loadStats());
  const [notice, setNotice] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);

  const playerMap = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [],
  );
  const copy = UI_COPY[locale];

  useEffect(() => {
    setLocale(loadLocale());
    setHasLoadedLocale(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedLocale) {
      return;
    }

    saveLocale(locale);
    setNotice("");
    setShareMessage("");
  }, [hasLoadedLocale, locale]);

  useEffect(() => {
    const todayKey = getDateKey();
    const dailySelection = getDailyPlayer(players, todayKey);
    const savedGame = loadDailyGame(todayKey);

    setDateKey(todayKey);
    setBoardNumber(dailySelection.boardNumber);
    setStats(loadStats());

    if (!hasSeenHowToPlay()) {
      setIsHowToPlayOpen(true);
    }

    if (savedGame) {
      const nextState = sanitizeGameState(
        savedGame,
        dailySelection.player.id,
        dailySelection.boardNumber,
        playerMap,
      );

      setGameState(nextState);
      setIsResultOpen(nextState.status !== "playing");
      return;
    }

    setGameState(
      createInitialGameState({
        dateKey: todayKey,
        boardNumber: dailySelection.boardNumber,
        mysteryPlayerId: dailySelection.player.id,
      }),
    );
  }, [playerMap]);

  useEffect(() => {
    if (!gameState || !dateKey) {
      return;
    }

    saveDailyGame(dateKey, gameState);
  }, [dateKey, gameState]);

  useEffect(() => {
    if (!gameState || gameState.status === "playing" || gameState.statsRecorded) {
      return;
    }

    const nextStats = recordCompletedGame({
      dateKey: gameState.dateKey,
      status: gameState.status,
      guessCount: gameState.guessIds.length,
    });

    setStats(nextStats);
    setGameState((currentState) =>
      currentState
        ? {
            ...currentState,
            statsRecorded: true,
          }
        : currentState,
    );
    setIsResultOpen(true);
  }, [gameState]);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!shareMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setShareMessage("");
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [shareMessage]);

  const mysteryPlayer = gameState ? playerMap.get(gameState.mysteryPlayerId) : null;
  const guessedPlayers = useMemo(() => {
    if (!gameState) {
      return [];
    }

    return gameState.guessIds
      .map((guessId) => playerMap.get(guessId))
      .filter(Boolean);
  }, [gameState, playerMap]);
  const guessedIds = useMemo(
    () => new Set(gameState?.guessIds ?? []),
    [gameState],
  );
  const isGameOver = gameState?.status === "won" || gameState?.status === "lost";
  const remainingGuesses = Math.max(MAX_GUESSES - guessedPlayers.length, 0);
  const scoreCaption = isGameOver
    ? gameState.status === "won"
      ? copy.solvedToday
      : copy.noGuesses
    : copy.guessesRemaining(remainingGuesses);

  function handleGuess(player) {
    if (!gameState || isGameOver) {
      return;
    }

    if (guessedIds.has(player.id)) {
      setNotice(copy.notices.alreadyGuessed(getPlayerDisplay(player, locale).primary));
      return;
    }

    const nextGuessIds = [...gameState.guessIds, player.id];
    const hasWon = player.id === gameState.mysteryPlayerId;
    const hasLost = !hasWon && nextGuessIds.length >= MAX_GUESSES;
    const nextStatus = hasWon ? "won" : hasLost ? "lost" : "playing";

    setGameState((currentState) =>
      currentState
        ? {
            ...currentState,
            guessIds: nextGuessIds,
            status: nextStatus,
          }
        : currentState,
    );
    setNotice("");

    if (nextStatus !== "playing") {
      setIsResultOpen(true);
    }
  }

  async function handleShareResults() {
    if (!mysteryPlayer) {
      return;
    }

    const shareText = buildShareResults({
      boardNumber,
      boardDate: dateKey,
      guesses: guessedPlayers,
      mysteryPlayer,
      maxGuesses: MAX_GUESSES,
    });

    try {
      await navigator.clipboard.writeText(shareText);
      setShareMessage(copy.notices.shareCopied);
    } catch {
      setShareMessage(copy.notices.shareFailed);
    }
  }

  function handleResetToday() {
    if (!gameState || !mysteryPlayer) {
      return;
    }

    const nextStats = removeGameFromStats(dateKey);
    const freshGameState = createInitialGameState({
      dateKey,
      boardNumber,
      mysteryPlayerId: mysteryPlayer.id,
    });

    clearDailyGame(dateKey);
    setStats(nextStats);
    setGameState(freshGameState);
    setNotice(copy.notices.reset);
    setIsMenuOpen(false);
    setIsResultOpen(false);
    setShareMessage("");
  }

  function handleOpenAbout() {
    aboutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsMenuOpen(false);
  }

  function closeHowToPlay() {
    markHowToPlaySeen();
    setIsHowToPlayOpen(false);
  }

  if (!gameState || !mysteryPlayer) {
    return (
      <main className={`page-shell locale-${locale}`}>
        <section className="loading-state">
          <p>{copy.loading}</p>
        </section>
      </main>
    );
  }

  return (
    <>
      <main className={`page-shell locale-${locale}`}>
        <section className="game-shell">
          <div className="page-tools">
            <div className="locale-switch" role="tablist" aria-label={copy.localeSwitchAria}>
              <button
                className={`locale-tab${locale === "ja" ? " locale-tab-active" : ""}`}
                type="button"
                role="tab"
                aria-selected={locale === "ja"}
                onClick={() => setLocale("ja")}
              >
                {copy.localeTabs.ja}
              </button>
              <button
                className={`locale-tab${locale === "en" ? " locale-tab-active" : ""}`}
                type="button"
                role="tab"
                aria-selected={locale === "en"}
                onClick={() => setLocale("en")}
              >
                {copy.localeTabs.en}
              </button>
            </div>
          </div>

          <header className="topbar-card">
            <div className="topbar-main">
              <span className="eyebrow">{copy.eyebrow}</span>
              <h1>NPB Pickle</h1>
              <p className="topbar-description">{copy.mastheadDescription}</p>
            </div>

            <div className="topbar-side">
              <div className="topbar-controls">
                <div className="board-meta" aria-label={copy.boardDetailsAria}>
                  <div className="meta-item">
                    <span>{copy.boardLabel}</span>
                    <strong>#{String(boardNumber).padStart(3, "0")}</strong>
                  </div>
                  <div className="meta-item">
                    <span>{copy.dateLabel}</span>
                    <strong>{dateKey}</strong>
                  </div>
                </div>

                <div className="menu-shell" ref={menuRef}>
                  <button
                    className="menu-button"
                    type="button"
                    onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
                    aria-label={copy.menuAria}
                    aria-expanded={isMenuOpen}
                  >
                    <span />
                    <span />
                    <span />
                  </button>

                  {isMenuOpen ? (
                    <div className="menu-panel">
                      <button
                        type="button"
                        onClick={() => {
                          setIsHowToPlayOpen(true);
                          setIsMenuOpen(false);
                        }}
                      >
                        {copy.menuHowTo}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsStatsOpen(true);
                          setIsMenuOpen(false);
                        }}
                      >
                        {copy.menuStats}
                      </button>
                      <button type="button" onClick={handleResetToday}>
                        {copy.menuReset}
                      </button>
                      <button type="button" onClick={handleOpenAbout}>
                        {copy.menuAbout}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          <section className="control-card">
            <div className="control-head">
              <div className="section-heading">
                <h2>{copy.searchTitle}</h2>
                <p>{copy.searchDescription}</p>
              </div>

              <div className="score-inline">
                <span>{copy.scoreLabel}</span>
                <strong>
                  {guessedPlayers.length} / {MAX_GUESSES}
                </strong>
                <p>{scoreCaption}</p>
              </div>
            </div>

            <SearchBar
              copy={copy.search}
              players={players}
              guessedIds={guessedIds}
              disabled={isGameOver}
              locale={locale}
              notice={notice}
              onGuess={handleGuess}
              setNotice={setNotice}
            />

            {shareMessage ? <p className="share-toast">{shareMessage}</p> : null}

            <div className="mini-stats" aria-label={copy.progressSummaryAria}>
              <article className="mini-stat">
                <span>{copy.winRate}</span>
                <strong>{stats.winPercentage}%</strong>
              </article>
              <article className="mini-stat">
                <span>{copy.streakLabel}</span>
                <strong>{copy.streakValue(stats.currentStreak)}</strong>
              </article>
              <article className="mini-stat">
                <span>{copy.bestStreakLabel}</span>
                <strong>{copy.bestStreakValue(stats.maxStreak)}</strong>
              </article>
              <article className="mini-stat">
                <span>{copy.completedBoardsLabel}</span>
                <strong>{stats.gamesPlayed}</strong>
              </article>
            </div>

            <div className="action-row">
              <button
                className="toolbar-chip"
                type="button"
                onClick={() => setIsHowToPlayOpen(true)}
              >
                {copy.actionHowTo}
              </button>
              <button
                className="toolbar-chip"
                type="button"
                onClick={() => setIsStatsOpen(true)}
              >
                {copy.actionStats}
              </button>
              {isGameOver && !isResultOpen ? (
                <button
                  className="toolbar-chip"
                  type="button"
                  onClick={() => setIsResultOpen(true)}
                >
                  {copy.actionViewResult}
                </button>
              ) : (
                <button
                  className="toolbar-chip"
                  type="button"
                  onClick={handleShareResults}
                >
                  {copy.actionShare}
                </button>
              )}
              <button className="toolbar-chip" type="button" onClick={handleOpenAbout}>
                {copy.actionAbout}
              </button>
            </div>
          </section>

          <section className="board-card">
            <div className="section-heading">
              <h2>{copy.boardTitle}</h2>
              <p>{copy.boardDescription}</p>
            </div>

            <GameBoard
              boardDate={dateKey}
              copy={copy.board}
              guesses={guessedPlayers}
              locale={locale}
              maxGuesses={MAX_GUESSES}
              mysteryPlayer={mysteryPlayer}
            />
          </section>

          <section className="about-strip" id="about-section" ref={aboutRef}>
            <p>{copy.aboutDescription}</p>
          </section>
        </section>
      </main>

      <HowToPlayModal copy={copy.howTo} isOpen={isHowToPlayOpen} onClose={closeHowToPlay} />
      <StatsModal
        copy={copy.statsModal}
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
      />
      <ResultModal
        boardNumber={boardNumber}
        copy={copy.resultModal}
        guessCount={guessedPlayers.length}
        isOpen={isResultOpen}
        locale={locale}
        mysteryPlayer={mysteryPlayer}
        onClose={() => setIsResultOpen(false)}
        onShare={handleShareResults}
        shareMessage={shareMessage}
        status={gameState.status}
      />
    </>
  );
}
