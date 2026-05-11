import calculateAge from "@/src/utils/calculateAge";

const REGION_BY_PREFECTURE = {
  Hokkaido: "Hokkaido",
  Aomori: "Tohoku",
  Iwate: "Tohoku",
  Miyagi: "Tohoku",
  Akita: "Tohoku",
  Yamagata: "Tohoku",
  Fukushima: "Tohoku",
  Ibaraki: "Kanto",
  Tochigi: "Kanto",
  Gunma: "Kanto",
  Saitama: "Kanto",
  Chiba: "Kanto",
  Tokyo: "Kanto",
  Kanagawa: "Kanto",
  Niigata: "Chubu",
  Toyama: "Chubu",
  Ishikawa: "Chubu",
  Fukui: "Chubu",
  Yamanashi: "Chubu",
  Nagano: "Chubu",
  Gifu: "Chubu",
  Shizuoka: "Chubu",
  Aichi: "Chubu",
  Mie: "Kansai",
  Shiga: "Kansai",
  Kyoto: "Kansai",
  Osaka: "Kansai",
  Hyogo: "Kansai",
  Nara: "Kansai",
  Wakayama: "Kansai",
  Tottori: "Chugoku",
  Shimane: "Chugoku",
  Okayama: "Chugoku",
  Hiroshima: "Chugoku",
  Yamaguchi: "Chugoku",
  Tokushima: "Shikoku",
  Kagawa: "Shikoku",
  Ehime: "Shikoku",
  Kochi: "Shikoku",
  Fukuoka: "Kyushu",
  Saga: "Kyushu",
  Nagasaki: "Kyushu",
  Kumamoto: "Kyushu",
  Oita: "Kyushu",
  Miyazaki: "Kyushu",
  Kagoshima: "Kyushu",
  Okinawa: "Kyushu",
};

const REGION_LABELS = {
  ja: {
    Hokkaido: "北海道",
    Tohoku: "東北",
    Kanto: "関東",
    Chubu: "中部",
    Kansai: "関西",
    Chugoku: "中国",
    Shikoku: "四国",
    Kyushu: "九州",
    Japan: "日本",
  },
};

function getHintCopy(locale) {
  if (locale === "ja") {
    return {
      exactAge: "同年齢",
      targetOlder: "正解は年上",
      targetYounger: "正解は年下",
      primaryPositionMatch: "主ポジション一致",
      alternatePositionMatch: "サブポジション一致",
      noPositionMatch: "守備位置不一致",
      sameTeam: "同球団",
      sameLeague: "同リーグ",
      differentLeague: "別リーグ",
      leagueMatch: "リーグ一致",
      leagueMiss: "リーグ不一致",
      batsMatch: "打席一致",
      batsMiss: "打席不一致",
      throwsMatch: "利き腕一致",
      throwsMiss: "利き腕不一致",
      sameBirthplace: "出身地一致",
      sameCountryPrefix: "同じ国: ",
      sameRegionPrefix: "同地域: ",
      differentBirthplace: "出身地不一致",
    };
  }

  return {
    exactAge: "Exact age",
    targetOlder: "Target older",
    targetYounger: "Target younger",
    primaryPositionMatch: "Primary position match",
    alternatePositionMatch: "Alternate position match",
    noPositionMatch: "No position match",
    sameTeam: "Same team",
    sameLeague: "Same league",
    differentLeague: "Different league",
    leagueMatch: "League match",
    leagueMiss: "League miss",
    batsMatch: "Bats match",
    batsMiss: "Bats miss",
    throwsMatch: "Throws match",
    throwsMiss: "Throws miss",
    sameBirthplace: "Same birthplace",
    sameCountryPrefix: "Same country: ",
    sameRegionPrefix: "Same region: ",
    differentBirthplace: "Different birthplace",
  };
}

function formatRegion(region, locale) {
  return REGION_LABELS[locale]?.[region] ?? region;
}

function formatCountry(country, locale) {
  if (locale === "ja" && country === "Japan") {
    return "日本";
  }

  return country;
}

function getBirthRegion(player) {
  if (player.country && player.country !== "Japan") {
    return player.country;
  }

  const prefecture = player.birthPlace.split(",")[0]?.trim();
  return REGION_BY_PREFECTURE[prefecture] || "Japan";
}

function getAgeHint(guessAge, targetAge, locale) {
  const copy = getHintCopy(locale);

  if (guessAge === targetAge) {
    return copy.exactAge;
  }

  return guessAge < targetAge ? copy.targetOlder : copy.targetYounger;
}

function getPositionHint(guess, mysteryPlayer, locale) {
  const copy = getHintCopy(locale);

  if (guess.primaryPosition === mysteryPlayer.primaryPosition) {
    return copy.primaryPositionMatch;
  }

  if (
    guess.positions.includes(mysteryPlayer.primaryPosition) ||
    mysteryPlayer.positions.includes(guess.primaryPosition) ||
    guess.positions.some((position) => mysteryPlayer.positions.includes(position))
  ) {
    return copy.alternatePositionMatch;
  }

  return copy.noPositionMatch;
}

export function compareGuess(guess, mysteryPlayer, boardDate, locale = "en") {
  const copy = getHintCopy(locale);
  const guessAge = calculateAge(guess.birthDate, boardDate);
  const mysteryAge = calculateAge(mysteryPlayer.birthDate, boardDate);
  const ageDifference = Math.abs(guessAge - mysteryAge);
  const sameRegion = getBirthRegion(guess) === getBirthRegion(mysteryPlayer);
  const sameCountry = guess.country === mysteryPlayer.country;
  const hasAlternatePositionMatch =
    guess.positions.includes(mysteryPlayer.primaryPosition) ||
    mysteryPlayer.positions.includes(guess.primaryPosition) ||
    guess.positions.some((position) => mysteryPlayer.positions.includes(position));

  return {
    team: {
      value: guess.teamShort,
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
    league: {
      value: guess.league,
      status: guess.league === mysteryPlayer.league ? "exact" : "miss",
      hint: guess.league === mysteryPlayer.league ? copy.leagueMatch : copy.leagueMiss,
    },
    bats: {
      value: guess.bats,
      status: guess.bats === mysteryPlayer.bats ? "exact" : "miss",
      hint: guess.bats === mysteryPlayer.bats ? copy.batsMatch : copy.batsMiss,
    },
    throws: {
      value: guess.throws,
      status: guess.throws === mysteryPlayer.throws ? "exact" : "miss",
      hint: guess.throws === mysteryPlayer.throws ? copy.throwsMatch : copy.throwsMiss,
    },
    birthPlace: {
      value: guess.birthPlace,
      status:
        guess.birthPlace === mysteryPlayer.birthPlace
          ? "exact"
          : sameRegion || (sameCountry && guess.country !== "Japan")
            ? "close"
            : "miss",
      hint:
        guess.birthPlace === mysteryPlayer.birthPlace
          ? copy.sameBirthplace
          : sameCountry && guess.country !== "Japan"
            ? `${copy.sameCountryPrefix}${formatCountry(guess.country, locale)}`
            : sameRegion
              ? `${copy.sameRegionPrefix}${formatRegion(getBirthRegion(guess), locale)}`
              : copy.differentBirthplace,
    },
    age: {
      value: guessAge,
      status: ageDifference === 0 ? "exact" : ageDifference <= 2 ? "close" : "miss",
      hint: getAgeHint(guessAge, mysteryAge, locale),
    },
    position: {
      value: guess.primaryPosition,
      status:
        guess.primaryPosition === mysteryPlayer.primaryPosition
          ? "exact"
          : hasAlternatePositionMatch
            ? "close"
            : "miss",
      hint: getPositionHint(guess, mysteryPlayer, locale),
    },
  };
}
