"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import GameBoard from "@/src/components/GameBoard";
import HowToPlayModal from "@/src/components/HowToPlayModal";
import ResultModal from "@/src/components/ResultModal";
import SearchBar from "@/src/components/SearchBar";
import StatsModal from "@/src/components/StatsModal";
import players from "@/src/data/players";
import { UI_COPY, getPlayerDisplay } from "@/src/i18n/uiCopy";
import { hasSupabaseConfig, supabase } from "@/src/lib/supabase";
import {
  createInitialGameState,
  dismissGuestMigrationPrompt,
  hasSeenHowToPlay,
  hasGuestDataToMigrate,
  loadDailyGame,
  loadLocale,
  loadStats,
  markHowToPlaySeen,
  migrateGuestDataToUser,
  recordCompletedGame,
  saveDailyGame,
  saveLocale,
} from "@/src/utils/localStorage";
import { getDailyPlayer, getDateKey } from "@/src/utils/getDailyPlayer";
import { buildShareResults } from "@/src/utils/shareResults";

const MAX_GUESSES = 9;
const DATABASE_CREDIT_URLS = {
  en: "https://proeyekyuu.com/player-registry/",
  ja: "https://proeyekyuu.com/ja/player-registry-jp/",
};
const OTHER_GAME_URLS = {
  en: "https://npb-grid.vercel.app/?lang=en",
  ja: "https://npb-grid.vercel.app/",
};
const INITIAL_AUTH_FORMS = {
  login: {
    email: "",
    password: "",
  },
  signup: {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
};

function AuthModal({
  copy,
  form,
  loading,
  mode,
  notice,
  onChange,
  onClose,
  onSubmit,
  onSwitchMode,
}) {
  if (!mode || !form) {
    return null;
  }

  const isSignup = mode === "signup";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal-card auth-modal-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="modal-tag">{isSignup ? copy.signIn : copy.logIn}</span>
            <h2>{isSignup ? copy.authSignupHeading : copy.authLoginHeading}</h2>
            <p className="auth-description">
              {isSignup ? copy.authSignupBlurb : copy.authLoginBlurb}
            </p>
          </div>

          <button className="icon-close" type="button" onClick={onClose}>
            {copy.authClose}
          </button>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          {isSignup ? (
            <label className="auth-field">
              <span>{copy.authName}</span>
              <input
                autoFocus
                autoComplete="nickname"
                className="auth-input"
                onChange={(event) => onChange("name", event.target.value)}
                placeholder={copy.authNamePlaceholder}
                type="text"
                value={form.name}
              />
            </label>
          ) : null}

          <label className="auth-field">
            <span>{copy.authEmail}</span>
            <input
              autoComplete="email"
              autoFocus={!isSignup}
              className="auth-input"
              onChange={(event) => onChange("email", event.target.value)}
              placeholder={copy.authEmailPlaceholder}
              type="email"
              value={form.email}
            />
          </label>

          <label className="auth-field">
            <span>{copy.authPassword}</span>
            <input
              autoComplete={isSignup ? "new-password" : "current-password"}
              className="auth-input"
              onChange={(event) => onChange("password", event.target.value)}
              placeholder={copy.authPasswordPlaceholder}
              type="password"
              value={form.password}
            />
          </label>

          {isSignup ? (
            <label className="auth-field">
              <span>{copy.authConfirmPassword}</span>
              <input
                autoComplete="new-password"
                className="auth-input"
                onChange={(event) => onChange("confirmPassword", event.target.value)}
                placeholder={copy.authConfirmPasswordPlaceholder}
                type="password"
                value={form.confirmPassword}
              />
            </label>
          ) : null}

          {notice ? <p className="auth-notice">{notice}</p> : null}

          <div className="modal-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => onSwitchMode(isSignup ? "login" : "signup")}
            >
              {isSignup ? copy.authSwitchToLogin : copy.authSwitchToSignup}
            </button>
            <button className="primary-button" type="submit" disabled={loading}>
              {loading
                ? copy.authWorking
                : isSignup
                  ? copy.authSignupSubmit
                  : copy.authLoginSubmit}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

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
  const latestGuessRowRef = useRef(null);
  const menuRef = useRef(null);
  const shouldScrollToLatestGuessRef = useRef(false);
  const [dateKey, setDateKey] = useState("");
  const [boardNumber, setBoardNumber] = useState(1);
  const [gameState, setGameState] = useState(null);
  const [hasLoadedLocale, setHasLoadedLocale] = useState(false);
  const [locale, setLocale] = useState("en");
  const [stats, setStats] = useState(() => loadStats());
  const [notice, setNotice] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [authNotice, setAuthNotice] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authSession, setAuthSession] = useState(null);
  const [authReady, setAuthReady] = useState(!supabase);
  const [authForms, setAuthForms] = useState(INITIAL_AUTH_FORMS);
  const [isGuestMigrationPromptOpen, setIsGuestMigrationPromptOpen] = useState(false);
  const [guestMigrationLoading, setGuestMigrationLoading] = useState(false);
  const [hasScopedGameInStorage, setHasScopedGameInStorage] = useState(false);

  const playerMap = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [],
  );
  const copy = UI_COPY[locale];
  const otherGameUrl = OTHER_GAME_URLS[locale] ?? OTHER_GAME_URLS.en;
  const activeUser = authSession?.user ?? null;
  const activeUserId = activeUser?.id ?? null;
  const activeAccountLabel =
    activeUser?.user_metadata?.display_name || activeUser?.email || "";

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
  }, [hasLoadedLocale, locale]);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) {
          return;
        }

        setAuthSession(data.session ?? null);
        setAuthReady(true);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setAuthSession(null);
        setAuthReady(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (!isMounted) {
        return;
      }

      setAuthSession(session ?? null);
      setAuthReady(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (hasSupabaseConfig && !authReady) {
      return;
    }

    const todayKey = getDateKey();
    const dailySelection = getDailyPlayer(players, todayKey);
    const savedGame = loadDailyGame(todayKey, activeUserId);
    const shouldPromptGuestMigration = hasGuestDataToMigrate(activeUserId);

    setDateKey(todayKey);
    setBoardNumber(dailySelection.boardNumber);
    setStats(loadStats(activeUserId));
    setHasScopedGameInStorage(Boolean(savedGame));
    setIsGuestMigrationPromptOpen(shouldPromptGuestMigration);
    setNotice("");

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
    setIsResultOpen(false);
  }, [activeUserId, authReady, playerMap]);

  useEffect(() => {
    if (!gameState || !dateKey) {
      return;
    }

    if (activeUserId && isGuestMigrationPromptOpen && !hasScopedGameInStorage) {
      return;
    }

    saveDailyGame(dateKey, gameState, activeUserId);
  }, [activeUserId, dateKey, gameState, hasScopedGameInStorage, isGuestMigrationPromptOpen]);

  useEffect(() => {
    if (!gameState || gameState.status === "playing" || gameState.statsRecorded) {
      return;
    }

    const nextStats = recordCompletedGame(
      {
        dateKey: gameState.dateKey,
        status: gameState.status,
        guessCount: gameState.guessIds.length,
      },
      activeUserId,
    );

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
  }, [activeUserId, gameState]);

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
  const remainingPlayers = useMemo(
    () => players.filter((player) => !guessedIds.has(player.id)),
    [guessedIds],
  );
  const resultShareText = useMemo(() => {
    if (!mysteryPlayer) {
      return "";
    }

    return buildShareResults({
      boardNumber,
      boardDate: dateKey,
      guesses: guessedPlayers,
      maxGuesses: MAX_GUESSES,
      mysteryPlayer,
    });
  }, [boardNumber, dateKey, guessedPlayers, mysteryPlayer]);
  const isGameOver = gameState?.status === "won" || gameState?.status === "lost";
  const remainingGuesses = Math.max(MAX_GUESSES - guessedPlayers.length, 0);
  const scoreCaption = isGameOver
    ? gameState.status === "won"
      ? copy.solvedToday
      : copy.noGuesses
    : copy.guessesRemaining(remainingGuesses);

  useEffect(() => {
    if (!shouldScrollToLatestGuessRef.current || guessedPlayers.length === 0) {
      return undefined;
    }

    shouldScrollToLatestGuessRef.current = false;

    const frameId = window.requestAnimationFrame(() => {
      latestGuessRowRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [guessedPlayers.length]);

  function handleAuthFieldChange(field, value) {
    if (!authMode) {
      return;
    }

    setAuthNotice("");
    setAuthForms((currentForms) => ({
      ...currentForms,
      [authMode]: {
        ...currentForms[authMode],
        [field]: value,
      },
    }));
  }

  function resetAuthForm(mode) {
    setAuthForms((currentForms) => ({
      ...currentForms,
      [mode]: INITIAL_AUTH_FORMS[mode],
    }));
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();

    if (!authMode) {
      return;
    }

    if (!hasSupabaseConfig || !supabase) {
      setAuthNotice(copy.authConfigMissing);
      return;
    }

    const activeForm = authForms[authMode];

    if (authMode === "signup" && activeForm.password !== activeForm.confirmPassword) {
      setAuthNotice(copy.authPasswordMismatch);
      return;
    }

    setAuthLoading(true);
    setAuthNotice("");

    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: activeForm.email,
          password: activeForm.password,
        });

        if (error) {
          throw error;
        }

        resetAuthForm("login");
        setAuthMode(null);
      } else {
        const emailRedirectTo =
          typeof window !== "undefined" ? window.location.origin : undefined;

        const { data, error } = await supabase.auth.signUp({
          email: activeForm.email,
          password: activeForm.password,
          options: {
            emailRedirectTo,
            data: {
              display_name: activeForm.name,
            },
          },
        });

        if (error) {
          throw error;
        }

        resetAuthForm("signup");
        setAuthNotice(copy.authSignupSuccess);

        if (data.session) {
          setAuthMode(null);
        }
      }
    } catch (error) {
      setAuthNotice(error.message);
      return;
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
  }

  function openAuthModal(nextMode) {
    setAuthNotice("");
    setAuthMode(nextMode);
  }

  function closeAuthModal() {
    setAuthNotice("");
    setAuthMode(null);
  }

  function switchAuthMode(nextMode) {
    setAuthNotice("");
    setAuthMode(nextMode);
  }

  function handleImportGuestProgress() {
    if (!activeUserId || !dateKey) {
      return;
    }

    setGuestMigrationLoading(true);
    migrateGuestDataToUser(activeUserId, { clearGuestData: true });

    const importedStats = loadStats(activeUserId);
    const importedGame = loadDailyGame(dateKey, activeUserId);

    setStats(importedStats);
    setHasScopedGameInStorage(true);
    setIsGuestMigrationPromptOpen(false);
    setNotice(copy.guestMigrationImported);

    if (importedGame) {
      const nextState = sanitizeGameState(
        importedGame,
        gameState?.mysteryPlayerId,
        boardNumber,
        playerMap,
      );

      setGameState(nextState);
      setIsResultOpen(nextState.status !== "playing");
    }

    setGuestMigrationLoading(false);
  }

  function handleDismissGuestMigration() {
    if (!activeUserId) {
      return;
    }

    dismissGuestMigrationPrompt(activeUserId);
    setHasScopedGameInStorage(true);
    setIsGuestMigrationPromptOpen(false);
  }

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

    shouldScrollToLatestGuessRef.current = true;
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

  function handleRandomPick() {
    if (isGameOver || remainingPlayers.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * remainingPlayers.length);
    handleGuess(remainingPlayers[randomIndex]);
  }

  function handleOpenAbout() {
    aboutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsMenuOpen(false);
  }

  function closeHowToPlay() {
    setIsHowToPlayOpen(false);
    markHowToPlaySeen();
  }

  if ((!authReady && hasSupabaseConfig) || !gameState || !mysteryPlayer) {
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

            <div className="account-actions">
              {!authReady && hasSupabaseConfig ? (
                <div className="account-badge">
                  <span>{copy.authRestoring}</span>
                </div>
              ) : activeUser ? (
                <>
                  <div className="account-badge">
                    <span>{copy.authLoggedInAs}</span>
                    <strong>{activeAccountLabel}</strong>
                  </div>
                  <button className="secondary-button account-button" type="button" onClick={handleLogout}>
                    {copy.authLogout}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="secondary-button account-button"
                    type="button"
                    onClick={() => openAuthModal("login")}
                  >
                    {copy.logIn}
                  </button>
                  <button
                    className="primary-button account-button"
                    type="button"
                    onClick={() => openAuthModal("signup")}
                  >
                    {copy.signIn}
                  </button>
                </>
              )}
            </div>
          </div>

          {isGuestMigrationPromptOpen ? (
            <section className="migration-banner">
              <div>
                <strong>{copy.guestMigrationTitle}</strong>
                <p>{copy.guestMigrationBody}</p>
              </div>
              <div className="migration-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={handleDismissGuestMigration}
                  disabled={guestMigrationLoading}
                >
                  {copy.guestMigrationSkip}
                </button>
                <button
                  className="primary-button"
                  type="button"
                  onClick={handleImportGuestProgress}
                  disabled={guestMigrationLoading}
                >
                  {copy.guestMigrationImport}
                </button>
              </div>
            </section>
          ) : null}

          <header className="topbar-card">
            <div className="topbar-main">
              <span className="eyebrow">{copy.eyebrow}</span>
              <h1>{copy.pageTitle}</h1>
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
                      <a
                        href={otherGameUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {copy.menuOtherGame}
                      </a>
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

              <div className="control-side">
                <div className="random-inline">
                  <button
                    className="secondary-button random-pick-button"
                    type="button"
                    onClick={handleRandomPick}
                    disabled={isGameOver || remainingPlayers.length === 0}
                  >
                    {copy.randomPickLabel}
                  </button>
                </div>

                <div className="score-inline">
                  <strong>{copy.scoreValue(guessedPlayers.length)}</strong>
                  <p>{scoreCaption}</p>
                </div>
              </div>
            </div>

            <SearchBar
              boardDate={dateKey}
              copy={copy.search}
              guesses={guessedPlayers}
              players={players}
              guessedIds={guessedIds}
              disabled={isGameOver}
              locale={locale}
              mysteryPlayer={mysteryPlayer}
              notice={notice}
              onGuess={handleGuess}
              setNotice={setNotice}
            />

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
              latestGuessRowRef={latestGuessRowRef}
              locale={locale}
              maxGuesses={MAX_GUESSES}
              mysteryPlayer={mysteryPlayer}
            />
          </section>

          <section className="about-strip" id="about-section" ref={aboutRef}>
            <p>{copy.aboutDescription}</p>
            <p>
              {copy.databaseCreditLabel}{" "}
              <a
                href={DATABASE_CREDIT_URLS[locale] ?? DATABASE_CREDIT_URLS.en}
                target="_blank"
                rel="noreferrer"
              >
                {copy.databaseCreditLink}
              </a>
              .
            </p>
          </section>
        </section>
      </main>

      <AuthModal
        copy={copy}
        form={authMode ? authForms[authMode] : null}
        loading={authLoading}
        mode={authMode}
        notice={authNotice}
        onChange={handleAuthFieldChange}
        onClose={closeAuthModal}
        onSubmit={handleAuthSubmit}
        onSwitchMode={switchAuthMode}
      />
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
        shareText={resultShareText}
        status={gameState.status}
      />
    </>
  );
}
