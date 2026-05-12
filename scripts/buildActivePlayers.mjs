import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const DEFAULT_SOURCE_PATHS = [
  path.join(projectRoot, "data", "registry", "proeyekyuu-player-registry.csv"),
  path.resolve(projectRoot, "..", "npb-grid", "data", "raw", "registry", "proeyekyuu-player-registry.csv"),
];

const OUTPUT_PATH = path.join(projectRoot, "src", "data", "players.js");

const TEAM_INFO_BY_REGISTRY_NAME = {
  Giants: {
    code: "g",
    name: "Yomiuri Giants",
    shortName: "Giants",
    league: "Central",
  },
  Tigers: {
    code: "t",
    name: "Hanshin Tigers",
    shortName: "Tigers",
    league: "Central",
  },
  Dragons: {
    code: "d",
    name: "Chunichi Dragons",
    shortName: "Dragons",
    league: "Central",
  },
  Baystars: {
    code: "db",
    name: "Yokohama DeNA BayStars",
    shortName: "BayStars",
    league: "Central",
  },
  Carp: {
    code: "c",
    name: "Hiroshima Toyo Carp",
    shortName: "Carp",
    league: "Central",
  },
  Swallows: {
    code: "s",
    name: "Tokyo Yakult Swallows",
    shortName: "Swallows",
    league: "Central",
  },
  Hawks: {
    code: "h",
    name: "Fukuoka SoftBank Hawks",
    shortName: "Hawks",
    league: "Pacific",
  },
  Fighters: {
    code: "f",
    name: "Hokkaido Nippon-Ham Fighters",
    shortName: "Fighters",
    league: "Pacific",
  },
  Marines: {
    code: "m",
    name: "Chiba Lotte Marines",
    shortName: "Marines",
    league: "Pacific",
  },
  Eagles: {
    code: "e",
    name: "Tohoku Rakuten Golden Eagles",
    shortName: "Eagles",
    league: "Pacific",
  },
  Buffaloes: {
    code: "b",
    name: "Orix Buffaloes",
    shortName: "Buffaloes",
    league: "Pacific",
  },
  Lions: {
    code: "l",
    name: "Saitama Seibu Lions",
    shortName: "Lions",
    league: "Pacific",
  },
};

const BATS_MAP = {
  Right: "R",
  Left: "L",
  Both: "S",
};

const THROWS_MAP = {
  Right: "R",
  Left: "L",
};

const POSITION_TOKEN_MAP = {
  P: "P",
  C: "C",
  "1B": "1B",
  "2B": "2B",
  "3B": "3B",
  SS: "SS",
  LF: "LF",
  CF: "CF",
  RF: "RF",
  OF: "OF",
  IF: "INF",
  DH: "DH",
};

const SPECIFIC_PRIMARY_POSITIONS = new Set([
  "P",
  "C",
  "1B",
  "2B",
  "3B",
  "SS",
  "LF",
  "CF",
  "RF",
]);

function parseCsv(text) {
  const rows = [];
  let value = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      row.push(value);
      value = "";

      if (row.some((cell) => cell !== "")) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    value += character;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    if (row.some((cell) => cell !== "")) {
      rows.push(row);
    }
  }

  if (rows.length === 0) {
    return [];
  }

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((header) => header.trim().replace(/\uFEFF/g, ""));

  return dataRows.map((dataRow) =>
    Object.fromEntries(headers.map((header, index) => [header, (dataRow[index] ?? "").trim()])),
  );
}

function formatEnglishName(value) {
  const normalized = String(value ?? "").trim();

  if (!normalized.includes(",")) {
    return normalized;
  }

  const [lastName, firstName] = normalized.split(",").map((part) => part.trim());
  return [firstName, lastName].filter(Boolean).join(" ");
}

function normalizePositions(rawValue) {
  const rawTokens = String(rawValue ?? "")
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  const mappedTokens = rawTokens
    .map((token) => POSITION_TOKEN_MAP[token] ?? null)
    .filter(Boolean);

  const specificPrimary = mappedTokens.find((token) => SPECIFIC_PRIMARY_POSITIONS.has(token));
  const broadPrimary = mappedTokens.find((token) => token !== "DH");
  const primaryPosition = specificPrimary ?? broadPrimary ?? mappedTokens[0] ?? "OF";

  const positions = [];

  function pushPosition(position) {
    if (!positions.includes(position)) {
      positions.push(position);
    }
  }

  function addPositionFamily(position) {
    pushPosition(position);

    if (["1B", "2B", "3B", "SS", "INF"].includes(position)) {
      pushPosition("INF");
    }

    if (["LF", "CF", "RF", "OF"].includes(position)) {
      pushPosition("OF");
    }
  }

  addPositionFamily(primaryPosition);

  mappedTokens.forEach((token) => {
    if (token !== "DH") {
      addPositionFamily(token);
    }
  });

  if (positions.length === 0) {
    addPositionFamily(primaryPosition);
  }

  return {
    primaryPosition,
    positions,
  };
}

async function findSourcePath(explicitPath) {
  const candidatePaths = explicitPath
    ? [path.resolve(projectRoot, explicitPath)]
    : DEFAULT_SOURCE_PATHS;

  for (const candidatePath of candidatePaths) {
    try {
      await fs.access(candidatePath);
      return candidatePath;
    } catch {
      continue;
    }
  }

  throw new Error(
    `Could not find a registry CSV. Tried: ${candidatePaths.join(", ")}`,
  );
}

function sortPlayers(left, right) {
  const teamOrder = left.team.localeCompare(right.team);

  if (teamOrder !== 0) {
    return teamOrder;
  }

  return left.englishName.localeCompare(right.englishName);
}

async function main() {
  const sourcePath = await findSourcePath(process.argv[2]);
  const csvText = await fs.readFile(sourcePath, "utf8");
  const rows = parseCsv(csvText);

  const players = rows
    .filter((row) => row.status === "Active")
    .map((row) => {
      const team = TEAM_INFO_BY_REGISTRY_NAME[row.current_last_team];

      if (!team) {
        return null;
      }

      const positionMeta = normalizePositions(row.most_common_positions);

      return {
        id: row.player_id,
        englishName: formatEnglishName(row.name),
        japaneseName: row.name_japanese,
        team: team.name,
        teamShort: team.shortName,
        league: team.league,
        bats: BATS_MAP[row.bats] ?? "R",
        throws: THROWS_MAP[row.throws] ?? "R",
        birthDate: row.birthdate,
        heightCm: Number(row.height_cm),
        primaryPosition: positionMeta.primaryPosition,
        positions: positionMeta.positions,
      };
    })
    .filter(Boolean)
    .sort(sortPlayers);

  const fileContents = `// Generated by scripts/buildActivePlayers.mjs\nconst players = ${JSON.stringify(players, null, 2)};\n\nexport default players;\n`;

  await fs.writeFile(OUTPUT_PATH, fileContents, "utf8");
  console.log(`Wrote ${players.length} active players to ${path.relative(projectRoot, OUTPUT_PATH)} from ${sourcePath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
