"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import GameBoard from "@/src/components/GameBoard";
import HowToPlayModal from "@/src/components/HowToPlayModal";
import ResultModal from "@/src/components/ResultModal";
import SearchBar from "@/src/components/SearchBar";
import StatsModal from "@/src/components/StatsModal";
import players from "@/src/data/players";
import {
  clearDailyGame,
  createInitialGameState,
  hasSeenHowToPlay,
  loadDailyGame,
  loadStats,
  markHowToPlaySeen,
  recordCompletedGame,
  removeGameFromStats,
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
      ? "Solved today."
      : "No guesses remaining."
    : `${remainingGuesses} guesses remaining.`;

  function handleGuess(player) {
    if (!gameState || isGameOver) {
      return;
    }

    if (guessedIds.has(player.id)) {
      setNotice(`${player.englishName} has already been guessed.`);
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
      setShareMessage("Results copied to your clipboard.");
    } catch {
      setShareMessage("Clipboard access failed.");
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
    setNotice("Today’s board was reset for development.");
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
      <main className="page-shell">
        <section className="game-card loading-state">
          <p>Loading today&apos;s board...</p>
        </section>
      </main>
    );
  }

  return (
    <>
      <main className="page-shell">
        <section className="game-card">
          <header className="hero">
            <div className="top-utility-bar">
              <div className="locale-toggle" aria-label="Language choices">
                <button className="locale-pill" type="button" aria-pressed="false">
                  日本語
                </button>
                <button
                  className="locale-pill locale-pill-active"
                  type="button"
                  aria-pressed="true"
                >
                  English
                </button>
              </div>

              <div className="utility-right">
                <div className="utility-status">
                  <span>Today&apos;s Board</span>
                  <strong>{dateKey}</strong>
                </div>

                <div className="menu-shell" ref={menuRef}>
                  <button
                    className="menu-button"
                    type="button"
                    onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
                    aria-label="Open menu"
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
                        How to Play
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsStatsOpen(true);
                          setIsMenuOpen(false);
                        }}
                      >
                        Stats
                      </button>
                      <button type="button" onClick={handleResetToday}>
                        Reset Today&apos;s Game
                      </button>
                      <button type="button" onClick={handleOpenAbout}>
                        About
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mode-rail" aria-label="Game modes">
              <button className="mode-tab mode-tab-active" type="button">
                Daily
              </button>
              <button className="mode-tab" type="button">
                Practice
              </button>
              <button className="mode-tab" type="button">
                Super easy mode
              </button>
              <button className="mode-tab" type="button">
                Super hard mode
              </button>
            </div>

            <div className="overview-card">
              <div className="overview-main">
                <div className="overview-copy">
                  <span className="eyebrow">Daily Mystery NPB Player</span>
                  <h1>NPB Pickle</h1>

                  <div className="toolbar-row">
                    <button
                      className="toolbar-chip"
                      type="button"
                      onClick={() => setIsHowToPlayOpen(true)}
                    >
                      How it works
                    </button>
                    <button
                      className="toolbar-chip toolbar-chip-active"
                      type="button"
                      onClick={() => setIsStatsOpen(true)}
                    >
                      Stats
                    </button>
                    {isGameOver && !isResultOpen ? (
                      <button
                        className="toolbar-chip"
                        type="button"
                        onClick={() => setIsResultOpen(true)}
                      >
                        View Result
                      </button>
                    ) : (
                      <button
                        className="toolbar-chip"
                        type="button"
                        onClick={handleShareResults}
                      >
                        Share
                      </button>
                    )}
                    <button className="toolbar-chip" type="button" onClick={handleOpenAbout}>
                      About
                    </button>
                  </div>

                  <p className="board-meta">
                    Daily board: {dateKey} · Board #{String(boardNumber).padStart(3, "0")}
                  </p>
                  <p className="overview-description">
                    Guess the mystery NPB player in 9 tries. Green means exact,
                    yellow means close, and gray means a miss.
                  </p>
                </div>

                <div className="overview-stats">
                  <div className="hero-stat-card">
                    <span>Streak</span>
                    <strong>{stats.currentStreak} days</strong>
                  </div>
                  <div className="hero-stat-card">
                    <span>Best Streak</span>
                    <strong>{stats.maxStreak} days</strong>
                  </div>
                  <div className="hero-stat-card">
                    <span>Completed Boards</span>
                    <strong>{stats.gamesPlayed}</strong>
                  </div>
                </div>
              </div>

              <aside className="score-panel">
                <span>Score</span>
                <strong>
                  {guessedPlayers.length} / {MAX_GUESSES}
                </strong>
                <p>{scoreCaption}</p>
                <div className="score-substats">
                  <div>
                    <span>Win rate</span>
                    <strong>{stats.winPercentage}%</strong>
                  </div>
                </div>
              </aside>
            </div>
          </header>

          <section className="game-section">
            <div className="section-heading">
              <h2>Make a Guess</h2>
              <p>Search by English or Japanese name to compare a player against today&apos;s answer.</p>
            </div>

            <SearchBar
              players={players}
              guessedIds={guessedIds}
              disabled={isGameOver}
              notice={notice}
              onGuess={handleGuess}
              setNotice={setNotice}
            />

            {shareMessage ? <p className="share-toast">{shareMessage}</p> : null}
          </section>

          <section className="game-section board-section">
            <div className="section-heading">
              <h2>Daily Results Board</h2>
              <p>Every row reveals how close that guess was to the mystery player.</p>
            </div>

            <GameBoard
              boardDate={dateKey}
              guesses={guessedPlayers}
              maxGuesses={MAX_GUESSES}
              mysteryPlayer={mysteryPlayer}
            />
          </section>

          <section className="about-card" id="about-section" ref={aboutRef}>
            <h2>About</h2>
            <p>
              NPB Pickle is an unofficial fan-made guessing game. It is not
              affiliated with NPB, its teams, or any official baseball
              organization.
            </p>
          </section>
        </section>
      </main>

      <HowToPlayModal isOpen={isHowToPlayOpen} onClose={closeHowToPlay} />
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
      />
      <ResultModal
        boardNumber={boardNumber}
        guessCount={guessedPlayers.length}
        isOpen={isResultOpen}
        mysteryPlayer={mysteryPlayer}
        onClose={() => setIsResultOpen(false)}
        onShare={handleShareResults}
        shareMessage={shareMessage}
        status={gameState.status}
      />
    </>
  );
}
