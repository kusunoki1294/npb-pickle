const GAME_PREFIX = "npb-pickle:game:";
const HOW_TO_PLAY_KEY = "npb-pickle:how-to-play-seen:v2";
const LOCALE_KEY = "npb-pickle:locale:v1";
const LEGACY_STATS_KEY = "npb-pickle:stats:v2";
const STATS_PREFIX = "npb-pickle:stats:v3:";

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

function getStorageScope(userId) {
  return userId ?? "guest";
}

function getDailyGameKey(dateKey, userId) {
  return `${GAME_PREFIX}${dateKey}:${getStorageScope(userId)}`;
}

function getLegacyDailyGameKey(dateKey) {
  return `${GAME_PREFIX}${dateKey}`;
}

function getStatsKey(userId) {
  return `${STATS_PREFIX}${getStorageScope(userId)}`;
}

function readStoredJson(key) {
  return safeParse(window.localStorage.getItem(key));
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

export function loadDailyGame(dateKey, userId = null) {
  if (!canUseStorage()) {
    return null;
  }

  const scopedGame = readStoredJson(getDailyGameKey(dateKey, userId));

  if (scopedGame) {
    return scopedGame;
  }

  if (userId) {
    return null;
  }

  const legacyGuestGame = readStoredJson(getLegacyDailyGameKey(dateKey));

  if (legacyGuestGame) {
    window.localStorage.setItem(
      getDailyGameKey(dateKey, null),
      JSON.stringify(legacyGuestGame),
    );
  }

  return legacyGuestGame;
}

export function saveDailyGame(dateKey, gameState, userId = null) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    getDailyGameKey(dateKey, userId),
    JSON.stringify(gameState),
  );
}

export function clearDailyGame(dateKey, userId = null) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(getDailyGameKey(dateKey, userId));

  if (!userId) {
    window.localStorage.removeItem(getLegacyDailyGameKey(dateKey));
  }
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

export function loadStats(userId = null) {
  if (!canUseStorage()) {
    return buildStatsFromHistory({});
  }

  const scopedStats = readStoredJson(getStatsKey(userId));
  const scopedHistory =
    scopedStats?.history && typeof scopedStats.history === "object"
      ? scopedStats.history
      : {};

  if (Object.keys(scopedHistory).length > 0 || userId) {
    return buildStatsFromHistory(scopedHistory);
  }

  const legacyStats = readStoredJson(LEGACY_STATS_KEY);
  const legacyHistory =
    legacyStats?.history && typeof legacyStats.history === "object"
      ? legacyStats.history
      : {};

  if (Object.keys(legacyHistory).length > 0) {
    window.localStorage.setItem(
      getStatsKey(null),
      JSON.stringify({ history: legacyHistory }),
    );
  }

  return buildStatsFromHistory(legacyHistory);
}

function saveStatsHistory(history, userId = null) {
  if (!canUseStorage()) {
    return buildStatsFromHistory(history);
  }

  const nextStats = buildStatsFromHistory(history);
  window.localStorage.setItem(getStatsKey(userId), JSON.stringify({ history }));
  return nextStats;
}

export function recordCompletedGame({ dateKey, status, guessCount }, userId = null) {
  const currentStats = loadStats(userId);

  if (currentStats.history[dateKey]) {
    return currentStats;
  }

  return saveStatsHistory(
    {
      ...currentStats.history,
      [dateKey]: {
        status,
        guessCount,
      },
    },
    userId,
  );
}

export function removeGameFromStats(dateKey, userId = null) {
  const currentStats = loadStats(userId);

  if (!currentStats.history[dateKey]) {
    return currentStats;
  }

  const nextHistory = { ...currentStats.history };
  delete nextHistory[dateKey];

  return saveStatsHistory(nextHistory, userId);
}

function listGuestDateKeys() {
  if (!canUseStorage()) {
    return [];
  }

  const guestSuffix = ":guest";
  const dateKeys = new Set();

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (!key?.startsWith(GAME_PREFIX)) {
      continue;
    }

    const remainder = key.slice(GAME_PREFIX.length);

    if (/^\d{4}-\d{2}-\d{2}$/.test(remainder)) {
      dateKeys.add(remainder);
      continue;
    }

    if (remainder.endsWith(guestSuffix)) {
      const dateKey = remainder.slice(0, -guestSuffix.length);

      if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
        dateKeys.add(dateKey);
      }
    }
  }

  return [...dateKeys];
}

export function migrateGuestDataToUser(userId) {
  if (!canUseStorage() || !userId) {
    return;
  }

  const guestStats = loadStats();
  const userStats = loadStats(userId);
  const mergedHistory = {
    ...guestStats.history,
    ...userStats.history,
  };

  if (JSON.stringify(mergedHistory) !== JSON.stringify(userStats.history)) {
    saveStatsHistory(mergedHistory, userId);
  }

  for (const dateKey of listGuestDateKeys()) {
    const guestGame = loadDailyGame(dateKey);

    if (!guestGame || loadDailyGame(dateKey, userId)) {
      continue;
    }

    saveDailyGame(dateKey, guestGame, userId);
  }
}
