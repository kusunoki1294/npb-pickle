import calculateAge from "@/src/utils/calculateAge";
import {
  expandComparablePositions,
  getLocalizedHandednessLabel,
  getLocalizedPositionName,
  getLocalizedTeamName,
  isBroadPosition,
} from "@/src/i18n/uiCopy";

function getHintCopy(locale) {
  if (locale === "ja") {
    return {
      exactAge: "同年齢",
      targetOlder: "正解は年上",
      targetYounger: "正解は年下",
      exactHeight: "同じ身長",
      targetTaller: "正解はより高い",
      targetShorter: "正解はより低い",
      primaryPositionMatch: "主ポジション一致",
      alternatePositionMatch: "サブポジション一致",
      noPositionMatch: "守備位置不一致",
      sameTeam: "同球団",
      sameLeague: "同リーグ",
      differentLeague: "別リーグ",
      batsMatch: "打席一致",
      batsMiss: "打席不一致",
      throwsMatch: "利き腕一致",
      throwsMiss: "利き腕不一致",
    };
  }

  return {
    exactAge: "Exact age",
    targetOlder: "Target older",
    targetYounger: "Target younger",
    exactHeight: "Exact height",
    targetTaller: "Target taller",
    targetShorter: "Target shorter",
    primaryPositionMatch: "Primary position match",
    alternatePositionMatch: "Alternate position match",
    noPositionMatch: "No position match",
    sameTeam: "Same team",
    sameLeague: "Same league",
    differentLeague: "Different league",
    batsMatch: "Bats match",
    batsMiss: "Bats miss",
    throwsMatch: "Throws match",
    throwsMiss: "Throws miss",
  };
}

function getAgeHint(guessAge, targetAge, locale) {
  const copy = getHintCopy(locale);

  if (guessAge === targetAge) {
    return copy.exactAge;
  }

  return guessAge < targetAge ? copy.targetOlder : copy.targetYounger;
}

function getHeightHint(guessHeight, targetHeight, locale) {
  const copy = getHintCopy(locale);

  if (guessHeight === targetHeight) {
    return copy.exactHeight;
  }

  return guessHeight < targetHeight ? copy.targetTaller : copy.targetShorter;
}

function getPositionHint(guess, mysteryPlayer, locale) {
  const copy = getHintCopy(locale);
  const guessComparablePositions = expandComparablePositions(guess.positions);
  const mysteryComparablePositions = expandComparablePositions(mysteryPlayer.positions);
  const hasComparablePositionMatch = guessComparablePositions.some((position) =>
    mysteryComparablePositions.includes(position),
  );
  const isExactSolvedPlayer = guess.id === mysteryPlayer.id;

  if (
    isExactSolvedPlayer ||
    (guess.primaryPosition === mysteryPlayer.primaryPosition &&
      !isBroadPosition(guess.primaryPosition))
  ) {
    return copy.primaryPositionMatch;
  }

  if (hasComparablePositionMatch) {
    return copy.alternatePositionMatch;
  }

  return copy.noPositionMatch;
}

export function compareGuess(guess, mysteryPlayer, boardDate, locale = "en") {
  const copy = getHintCopy(locale);
  const guessAge = calculateAge(guess.birthDate, boardDate);
  const mysteryAge = calculateAge(mysteryPlayer.birthDate, boardDate);
  const ageDifference = Math.abs(guessAge - mysteryAge);
  const heightDifference = Math.abs(guess.heightCm - mysteryPlayer.heightCm);
  const guessComparablePositions = expandComparablePositions(guess.positions);
  const mysteryComparablePositions = expandComparablePositions(mysteryPlayer.positions);
  const hasComparablePositionMatch = guessComparablePositions.some((position) =>
    mysteryComparablePositions.includes(position),
  );
  const isExactSolvedPlayer = guess.id === mysteryPlayer.id;
  const hasExactPrimaryPositionMatch =
    isExactSolvedPlayer ||
    (guess.primaryPosition === mysteryPlayer.primaryPosition &&
      !isBroadPosition(guess.primaryPosition));

  return {
    team: {
      value: getLocalizedTeamName(guess.teamShort, locale),
      status:
        guess.team === mysteryPlayer.team
          ? "exact"
          : guess.league === mysteryPlayer.league
            ? "close"
            : "miss",
      hint:
        guess.team === mysteryPlayer.team
          ? copy.sameTeam
          : guess.league === mysteryPlayer.league
            ? copy.sameLeague
            : copy.differentLeague,
    },
    bats: {
      value: getLocalizedHandednessLabel(guess.bats, locale),
      status: guess.bats === mysteryPlayer.bats ? "exact" : "miss",
      hint: guess.bats === mysteryPlayer.bats ? copy.batsMatch : copy.batsMiss,
    },
    throws: {
      value: getLocalizedHandednessLabel(guess.throws, locale),
      status: guess.throws === mysteryPlayer.throws ? "exact" : "miss",
      hint: guess.throws === mysteryPlayer.throws ? copy.throwsMatch : copy.throwsMiss,
    },
    height: {
      value: `${guess.heightCm} cm`,
      status:
        heightDifference === 0 ? "exact" : heightDifference <= 3 ? "close" : "miss",
      hint: getHeightHint(guess.heightCm, mysteryPlayer.heightCm, locale),
    },
    age: {
      value: guessAge,
      status: ageDifference === 0 ? "exact" : ageDifference <= 2 ? "close" : "miss",
      hint: getAgeHint(guessAge, mysteryAge, locale),
    },
    position: {
      value: getLocalizedPositionName(guess.primaryPosition, locale),
      status:
        hasExactPrimaryPositionMatch
          ? "exact"
          : hasComparablePositionMatch
            ? "close"
            : "miss",
      hint: getPositionHint(guess, mysteryPlayer, locale),
    },
  };
}
