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

function getBirthRegion(player) {
  if (player.country && player.country !== "Japan") {
    return player.country;
  }

  const prefecture = player.birthPlace.split(",")[0]?.trim();
  return REGION_BY_PREFECTURE[prefecture] || "Japan";
}

function getAgeHint(guessAge, targetAge) {
  if (guessAge === targetAge) {
    return "Exact age";
  }

  return guessAge < targetAge ? "Target older" : "Target younger";
}

function getPositionHint(guess, mysteryPlayer) {
  if (guess.primaryPosition === mysteryPlayer.primaryPosition) {
    return "Primary position match";
  }

  if (
    guess.positions.includes(mysteryPlayer.primaryPosition) ||
    mysteryPlayer.positions.includes(guess.primaryPosition) ||
    guess.positions.some((position) => mysteryPlayer.positions.includes(position))
  ) {
    return "Alternate position match";
  }

  return "No position match";
}

export function compareGuess(guess, mysteryPlayer, boardDate) {
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
          ? "Same team"
          : guess.league === mysteryPlayer.league
            ? "Same league"
            : "Different league",
    },
    league: {
      value: guess.league,
      status: guess.league === mysteryPlayer.league ? "exact" : "miss",
      hint:
        guess.league === mysteryPlayer.league
          ? "League match"
          : "League miss",
    },
    bats: {
      value: guess.bats,
      status: guess.bats === mysteryPlayer.bats ? "exact" : "miss",
      hint: guess.bats === mysteryPlayer.bats ? "Bats match" : "Bats miss",
    },
    throws: {
      value: guess.throws,
      status: guess.throws === mysteryPlayer.throws ? "exact" : "miss",
      hint:
        guess.throws === mysteryPlayer.throws ? "Throws match" : "Throws miss",
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
          ? "Same birthplace"
          : sameCountry && guess.country !== "Japan"
            ? `Same country: ${guess.country}`
            : sameRegion
              ? `Same region: ${getBirthRegion(guess)}`
              : "Different birthplace",
    },
    age: {
      value: guessAge,
      status: ageDifference === 0 ? "exact" : ageDifference <= 2 ? "close" : "miss",
      hint: getAgeHint(guessAge, mysteryAge),
    },
    position: {
      value: guess.primaryPosition,
      status:
        guess.primaryPosition === mysteryPlayer.primaryPosition
          ? "exact"
          : hasAlternatePositionMatch
            ? "close"
            : "miss",
      hint: getPositionHint(guess, mysteryPlayer),
    },
  };
}
