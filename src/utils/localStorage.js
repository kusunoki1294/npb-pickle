const GAME_PREFIX = "npb-pickle:game:";
const HOW_TO_PLAY_KEY = "npb-pickle:how-to-play-seen:v2";
const LOCALE_KEY = "npb-pickle:locale:v1";
const STATS_KEY = "npb-pickle:stats:v2";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function safeParse(rawValue) {
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

function createEmptyGuessDistribution() {
  return {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
  };
}

function buildStatsFromHistory(history) {
  const emptyStats = {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    maxStreak: 0,
    winPercentage: 0,
    guessDistribution: createEmptyGuessDistribution(),
    history,
  };
  const sortedEntries = Object.entries(history).sort(([leftDate], [rightDate]) =>
    leftDate.localeCompare(rightDate),
  );

  if (sortedEntries.length === 0) {
    return emptyStats;
  }

  let currentStreak = 0;
  let maxStreak = 0;
  let wins = 0;
  let losses = 0;

  for (const [, result] of sortedEntries) {
    if (result.status === "won") {
      wins += 1;
      currentStreak += 1;
      maxStreak = Math.max(maxStreak, currentStreak);

      if (
        Number.isInteger(result.guessCount) &&
        result.guessCount >= 1 &&
        result.guessCount <= 9
      ) {
        emptyStats.guessDistribution[result.guessCount] += 1;
      }
    } else {
      losses += 1;
      currentStreak = 0;
    }
  }

  return {
    ...emptyStats,
    gamesPlayed: sortedEntries.length,
    wins,
    losses,
    currentStreak,
    maxStreak,
    winPercentage: sortedEntries.length
      ? Math.round((wins / sortedEntries.length) * 100)
      : 0,
  };
}

export function createInitialGameState({ dateKey, boardNumber, mysteryPlayerId }) {
  return {
    dateKey,
    boardNumber,
    mysteryPlayerId,
    guessIds: [],
    status: "playing",
    statsRecorded: false,
  };
}

export function loadDailyGame(dateKey) {
  if (!canUseStorage()) {
    return null;
  }

  return safeParse(window.localStorage.getItem(`${GAME_PREFIX}${dateKey}`));
}

export function saveDailyGame(dateKey, gameState) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(`${GAME_PREFIX}${dateKey}`, JSON.stringify(gameState));
}

export function clearDailyGame(dateKey) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(`${GAME_PREFIX}${dateKey}`);
}

export function hasSeenHowToPlay() {
  if (!canUseStorage()) {
    return false;
  }

  return window.localStorage.getItem(HOW_TO_PLAY_KEY) === "true";
}

export function markHowToPlaySeen() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(HOW_TO_PLAY_KEY, "true");
}

export function loadLocale() {
  if (!canUseStorage()) {
    return "en";
  }

  return window.localStorage.getItem(LOCALE_KEY) === "ja" ? "ja" : "en";
}

export function saveLocale(locale) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(LOCALE_KEY, locale === "ja" ? "ja" : "en");
}

export function loadStats() {
  if (!canUseStorage()) {
    return buildStatsFromHistory({});
  }

  const parsed = safeParse(window.localStorage.getItem(STATS_KEY));
  const history = parsed?.history && typeof parsed.history === "object" ? parsed.history : {};

  return buildStatsFromHistory(history);
}

function saveStatsHistory(history) {
  if (!canUseStorage()) {
    return buildStatsFromHistory(history);
  }

  const nextStats = buildStatsFromHistory(history);
  window.localStorage.setItem(STATS_KEY, JSON.stringify({ history }));
  return nextStats;
}

export function recordCompletedGame({ dateKey, status, guessCount }) {
  const currentStats = loadStats();

  if (currentStats.history[dateKey]) {
    return currentStats;
  }

  return saveStatsHistory({
    ...currentStats.history,
    [dateKey]: {
      status,
      guessCount,
    },
  });
}

export function removeGameFromStats(dateKey) {
  const currentStats = loadStats();

  if (!currentStats.history[dateKey]) {
    return currentStats;
  }

  const nextHistory = { ...currentStats.history };
  delete nextHistory[dateKey];

  return saveStatsHistory(nextHistory);
}
