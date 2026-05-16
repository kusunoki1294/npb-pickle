const GAME_PREFIX = "npb-pickle:game:";
const HOW_TO_PLAY_KEY = "npb-pickle:how-to-play-seen:v2";
const LOCALE_KEY = "npb-pickle:locale:v1";
const LEGACY_STATS_KEY = "npb-pickle:stats:v2";
const STATS_PREFIX = "npb-pickle:stats:v3:";
const GUEST_MIGRATION_DECISION_PREFIX = "npb-pickle:guest-migration:v1:";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function canUseStorage() {
  return Boolean(getStorage());
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

function getGuestMigrationDecisionKey(userId) {
  return `${GUEST_MIGRATION_DECISION_PREFIX}${userId}`;
}

function readStoredJson(key) {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  try {
    return safeParse(storage.getItem(key));
  } catch {
    return null;
  }
}

function readStoredText(key) {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStoredText(key, value) {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function removeStoredKey(key) {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
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
    writeStoredText(getDailyGameKey(dateKey, null), JSON.stringify(legacyGuestGame));
  }

  return legacyGuestGame;
}

export function saveDailyGame(dateKey, gameState, userId = null) {
  if (!canUseStorage()) {
    return;
  }

  writeStoredText(getDailyGameKey(dateKey, userId), JSON.stringify(gameState));
}

export function clearDailyGame(dateKey, userId = null) {
  if (!canUseStorage()) {
    return;
  }

  removeStoredKey(getDailyGameKey(dateKey, userId));

  if (!userId) {
    removeStoredKey(getLegacyDailyGameKey(dateKey));
  }
}

export function hasSeenHowToPlay() {
  if (!canUseStorage()) {
    return false;
  }

  return readStoredText(HOW_TO_PLAY_KEY) === "true";
}

export function markHowToPlaySeen() {
  if (!canUseStorage()) {
    return;
  }

  writeStoredText(HOW_TO_PLAY_KEY, "true");
}

export function loadLocale() {
  if (!canUseStorage()) {
    return "en";
  }

  return readStoredText(LOCALE_KEY) === "ja" ? "ja" : "en";
}

export function saveLocale(locale) {
  if (!canUseStorage()) {
    return;
  }

  writeStoredText(LOCALE_KEY, locale === "ja" ? "ja" : "en");
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
    writeStoredText(getStatsKey(null), JSON.stringify({ history: legacyHistory }));
  }

  return buildStatsFromHistory(legacyHistory);
}

function saveStatsHistory(history, userId = null) {
  if (!canUseStorage()) {
    return buildStatsFromHistory(history);
  }

  const nextStats = buildStatsFromHistory(history);
  writeStoredText(getStatsKey(userId), JSON.stringify({ history }));
  return nextStats;
}

function isInitialScopedGame(gameState) {
  return Boolean(
    gameState &&
      gameState.status === "playing" &&
      !gameState.statsRecorded &&
      Array.isArray(gameState.guessIds) &&
      gameState.guessIds.length === 0,
  );
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

  const storage = getStorage();

  if (!storage) {
    return [];
  }

  const guestSuffix = ":guest";
  const dateKeys = new Set();

  for (let index = 0; index < storage.length; index += 1) {
    let key = null;

    try {
      key = storage.key(index);
    } catch {
      continue;
    }

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

function clearGuestScopedData() {
  if (!canUseStorage()) {
    return;
  }

  removeStoredKey(getStatsKey(null));
  removeStoredKey(LEGACY_STATS_KEY);

  for (const dateKey of listGuestDateKeys()) {
    clearDailyGame(dateKey, null);
  }
}

export function hasGuestDataToMigrate(userId) {
  if (!canUseStorage() || !userId) {
    return false;
  }

  if (readStoredText(getGuestMigrationDecisionKey(userId))) {
    return false;
  }

  return Object.keys(loadStats().history).length > 0 || listGuestDateKeys().length > 0;
}

export function dismissGuestMigrationPrompt(userId) {
  if (!canUseStorage() || !userId) {
    return;
  }

  writeStoredText(getGuestMigrationDecisionKey(userId), "dismissed");
}

export function migrateGuestDataToUser(userId, { clearGuestData = false } = {}) {
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
    const userGame = loadDailyGame(dateKey, userId);

    if (!guestGame || (userGame && !isInitialScopedGame(userGame))) {
      continue;
    }

    saveDailyGame(dateKey, guestGame, userId);
  }

  writeStoredText(getGuestMigrationDecisionKey(userId), "imported");

  if (clearGuestData) {
    clearGuestScopedData();
  }
}
