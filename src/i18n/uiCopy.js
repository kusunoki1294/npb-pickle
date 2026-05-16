const TEAM_NAME_BY_LOCALE = {
  ja: {
    "Yomiuri Giants": "読売ジャイアンツ",
    Giants: "巨人",
    "Hanshin Tigers": "阪神タイガース",
    Tigers: "阪神",
    "Chunichi Dragons": "中日ドラゴンズ",
    Dragons: "中日",
    "Yokohama DeNA BayStars": "横浜DeNAベイスターズ",
    BayStars: "DeNA",
    "Hiroshima Toyo Carp": "広島東洋カープ",
    Carp: "広島",
    "Tokyo Yakult Swallows": "東京ヤクルトスワローズ",
    Swallows: "ヤクルト",
    "Fukuoka SoftBank Hawks": "福岡ソフトバンクホークス",
    Hawks: "ソフトバンク",
    "Hokkaido Nippon-Ham Fighters": "北海道日本ハムファイターズ",
    Fighters: "日本ハム",
    "Chiba Lotte Marines": "千葉ロッテマリーンズ",
    Marines: "ロッテ",
    "Tohoku Rakuten Golden Eagles": "東北楽天ゴールデンイーグルス",
    Eagles: "楽天",
    "Orix Buffaloes": "オリックス・バファローズ",
    Buffaloes: "オリックス",
    "Saitama Seibu Lions": "埼玉西武ライオンズ",
    Lions: "西武",
  },
};

const LEAGUE_LABELS = {
  en: {
    Central: "Central League",
    Pacific: "Pacific League",
  },
  ja: {
    Central: "セ・リーグ",
    Pacific: "パ・リーグ",
  },
};

const HANDEDNESS_LABELS = {
  ja: {
    L: "左",
    R: "右",
    S: "両",
  },
};

const POSITION_LABELS = {
  ja: {
    P: "投手",
    C: "捕手",
    "1B": "一塁手",
    "2B": "二塁手",
    "3B": "三塁手",
    SS: "遊撃手",
    LF: "左翼手",
    CF: "中堅手",
    RF: "右翼手",
    INF: "内野手",
    OF: "外野手",
    DH: "指名打者",
  },
};

const POSITION_FAMILY_LABELS = {
  en: {
    INF: "1B/2B/3B/SS",
    OF: "LF/CF/RF",
  },
  ja: {
    INF: "一/二/三/遊",
    OF: "左/中/右",
  },
};

const POSITION_FAMILY_MEMBERS = {
  INF: ["1B", "2B", "3B", "SS"],
  OF: ["LF", "CF", "RF"],
};

export function getLocalizedTeamName(name, locale = "en") {
  return TEAM_NAME_BY_LOCALE[locale]?.[name] ?? name;
}

export function getLocalizedLeagueName(league, locale = "en") {
  return LEAGUE_LABELS[locale]?.[league] ?? league;
}

export function getLocalizedHandednessLabel(value, locale = "en") {
  return HANDEDNESS_LABELS[locale]?.[value] ?? value;
}

export function isBroadPosition(position) {
  return position === "INF" || position === "OF";
}

export function expandComparablePositions(positions = []) {
  return [...new Set(
    positions.flatMap((position) => POSITION_FAMILY_MEMBERS[position] ?? [position]),
  )];
}

export function getLocalizedPositionName(position, locale = "en") {
  if (isBroadPosition(position)) {
    return POSITION_FAMILY_LABELS[locale]?.[position] ?? position;
  }

  return POSITION_LABELS[locale]?.[position] ?? position;
}

export function getLocalizedPositionList(positions = [], locale = "en") {
  const uniquePositions = [...new Set(positions)];
  const specificPositions = uniquePositions.filter((position) => !isBroadPosition(position));
  const displayPositions = specificPositions.length > 0 ? specificPositions : uniquePositions;

  return displayPositions.map((position) => getLocalizedPositionName(position, locale));
}

export function getPlayerDisplay(player, locale = "en") {
  if (locale === "ja" && player?.japaneseName) {
    return {
      primary: player.japaneseName,
      secondary: player.englishName ?? "",
    };
  }

  return {
    primary: player?.englishName ?? "",
    secondary: player?.japaneseName ?? "",
  };
}

export const UI_COPY = {
  en: {
    localeSwitchAria: "Language",
    localeTabs: {
      en: "English",
      ja: "日本語",
    },
    signIn: "Sign up",
    logIn: "Log in",
    authClose: "Close",
    authName: "Display name",
    authEmail: "Email address",
    authPassword: "Password",
    authConfirmPassword: "Confirm password",
    authNamePlaceholder: "",
    authEmailPlaceholder: "you@example.com",
    authPasswordPlaceholder: "Enter your password",
    authConfirmPasswordPlaceholder: "Confirm your password",
    authLoginHeading: "Log in to your account",
    authLoginBlurb: "Use the same account as NPB Grid to keep your silhouette progress tied to you on this browser.",
    authSignupHeading: "Create your account",
    authSignupBlurb: "Create one account and use it across NPB Silhouette and NPB Grid.",
    authLoginSubmit: "Log in",
    authSignupSubmit: "Create account",
    authSwitchToSignup: "Need an account? Sign up",
    authSwitchToLogin: "Already have an account? Log in",
    authConfigMissing:
      "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to connect real accounts.",
    authPasswordMismatch: "Passwords do not match.",
    authLoginSuccess: "Logged in successfully.",
    authSignupSuccess: "Account created. Check your email if confirmation is enabled.",
    authLogout: "Log out",
    authLoggedInAs: "Signed in as",
    authRestoring: "Restoring session...",
    authWorking: "Working...",
    guestMigrationTitle: "Import guest progress?",
    guestMigrationBody:
      "This browser already has saved guest progress. Import it into this account or keep it separate.",
    guestMigrationImport: "Import progress",
    guestMigrationSkip: "Keep separate",
    guestMigrationImported: "Guest progress imported into this account.",
    loading: "Loading current board...",
    eyebrow: "NPB Player Guessing Game",
    pageTitle: "NPB Silhouette",
    mastheadDescription:
      "The mystery player is always active. Guess them in 9 tries. Each row checks team, batting and throwing hand, height, age, and position.",
    boardDetailsAria: "Board details",
    progressSummaryAria: "Progress summary",
    boardLabel: "Board",
    dateLabel: "Date",
    menuAria: "Open game menu",
    menuHowTo: "How to Play",
    menuStats: "Stats",
    menuOtherGame: "NPB Grid",
    menuAbout: "About",
    randomPickLabel: "Pick for me",
    scoreLabel: "Score",
    scoreValue: (count) => `Guess ${count}`,
    winRate: "Win rate",
    boardsLabel: "Boards",
    solvedToday: "Solved today.",
    noGuesses: "No guesses remaining.",
    guessesRemaining: (count) => `${count} guesses remaining.`,
    searchKicker: "Search the roster",
    searchTitle: "Make a guess",
    searchDescription:
      "Search by English or Japanese name, then submit a full match or choose from the suggestion list.",
    actionHowTo: "How to Play",
    actionStats: "Stats",
    actionViewResult: "View Result",
    actionOtherGame: "NPB Grid",
    actionAbout: "About",
    streakLabel: "Streak",
    streakValue: (count) => `${count} days`,
    streakDescription: "Keep solving boards on the first try to build momentum.",
    bestStreakLabel: "Best streak",
    bestStreakValue: (count) => `${count} days`,
    bestStreakDescription: "Your longest run across saved local results.",
    completedBoardsLabel: "Completed boards",
    completedBoardsDescription: "Wins and losses are tracked locally on this browser.",
    boardKicker: "Clue board",
    boardTitle: "Track how close each guess gets",
    boardDescription: "Green is exact, gold is close, and slate is a miss.",
    aboutKicker: "About",
    aboutTitle: "Unofficial fan project",
    aboutDescription:
      "NPB Silhouette is an unofficial fan-made guessing game. It is not affiliated with NPB, its teams, or any official baseball organization.",
    databaseCreditLabel: "Player database credit:",
    databaseCreditLink: "ProEyeKyuu player registry",
    notices: {
      shareCopied: "Results copied to your clipboard.",
      shareFailed: "Clipboard access failed.",
      reset: "Current board reset.",
      alreadyGuessed: (name) => `${name} has already been guessed.`,
    },
    search: {
      disabled:
        "The current round is complete. Open the result or come back tomorrow.",
      allMatchedGuessed: "Those matching players have already been guessed.",
      noPlayersFound: (query) =>
        `No players found for "${query}". Try an English or Japanese name.`,
      typeHint: "Type at least 2 letters or characters to search the player pool.",
      typeTooShort: "Type at least 2 letters or characters to search.",
      alreadyGuessed: (name) => `${name} has already been guessed.`,
      noMatchingPlayer:
        "No matching player was found. Try a full English or Japanese name.",
      chooseDropdown: "Choose one of the matching players from the dropdown.",
      placeholder: "Search by English or Japanese player name...",
      ariaLabel: "Search player names",
      roundComplete: "Round Complete",
      submitGuess: "Submit Guess",
    },
    board: {
      ariaLabel: "Guess results",
      headers: ["Player", "Team", "B", "T", "Height", "Age", "Pos"],
      guessLabel: (count) => `Guess ${count}`,
    },
    howTo: {
      tag: "First Visit Guide",
      title: "How to Play",
      close: "Close",
      intro:
        "Guess the mystery NPB player in 9 tries. Each guess is checked across the board and every cell gives you a clue.",
      legend: [
        { label: "Green", description: "Exact match." },
        { label: "Yellow", description: "Close or partial match." },
        { label: "Gray", description: "No match." },
      ],
      rulesTitle: "Category Rules",
      rules: [
        "Team: green for the same team, yellow for the same league.",
        "B/T: green for the same bats or throws hand.",
        "Height: green for the exact height, yellow if it is within 3 cm.",
        "Age: green for the exact age, yellow if it is within 2 years.",
        "Position: green for the same primary position, yellow for an alternate match.",
      ],
    },
    statsModal: {
      tag: "Local Stats",
      title: "Stats",
      close: "Close",
      gamesPlayed: "Games Played",
      wins: "Wins",
      losses: "Losses",
      winPercentage: "Win Percentage",
      currentStreak: "Current Streak",
      maxStreak: "Max Streak",
      guessDistribution: "Guess Distribution",
    },
    resultModal: {
      tag: (boardNumber) => `Board #${String(boardNumber).padStart(3, "0")}`,
      winTitle: "You got it!",
      lossTitle: "Better luck tomorrow",
      close: "Close",
      share: "Share Results",
      winBody: (guessCount) =>
        `You found the mystery player in ${guessCount} ${
          guessCount === 1 ? "guess" : "guesses"
        }.`,
      lossBody:
        "The mystery player is revealed above. A new board arrives tomorrow.",
    },
  },
  ja: {
    localeSwitchAria: "言語",
    localeTabs: {
      en: "English",
      ja: "日本語",
    },
    signIn: "新規登録",
    logIn: "ログイン",
    authClose: "閉じる",
    authName: "表示名",
    authEmail: "メールアドレス",
    authPassword: "パスワード",
    authConfirmPassword: "パスワード確認",
    authNamePlaceholder: "",
    authEmailPlaceholder: "you@example.com",
    authPasswordPlaceholder: "パスワードを入力",
    authConfirmPasswordPlaceholder: "もう一度パスワードを入力",
    authLoginHeading: "アカウントにログイン",
    authLoginBlurb:
      "プロ野球グリッドと同じアカウントでログインできます。このブラウザでは成績をユーザーごとに保存します。",
    authSignupHeading: "アカウントを作成",
    authSignupBlurb:
      "一度作成したアカウントを、プロ野球シルエットとプロ野球グリッドの両方で使えます。",
    authLoginSubmit: "ログイン",
    authSignupSubmit: "登録する",
    authSwitchToSignup: "アカウント作成はこちら",
    authSwitchToLogin: "ログインはこちら",
    authConfigMissing:
      "アカウント機能はまだ設定されていません。NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を追加してください。",
    authPasswordMismatch: "パスワードが一致していません。",
    authLoginSuccess: "ログインしました。",
    authSignupSuccess:
      "アカウントを作成しました。確認メールが有効な場合はメールを確認してください。",
    authLogout: "ログアウト",
    authLoggedInAs: "ログイン中",
    authRestoring: "ログイン状態を復元しています...",
    authWorking: "処理中...",
    guestMigrationTitle: "ゲストの進捗を取り込みますか？",
    guestMigrationBody:
      "このブラウザにはゲストとして保存された進捗があります。このアカウントに取り込むか、分けたままにできます。",
    guestMigrationImport: "進捗を取り込む",
    guestMigrationSkip: "分けたままにする",
    guestMigrationImported: "ゲストの進捗をこのアカウントに取り込みました。",
    loading: "現在のボードを読み込み中...",
    eyebrow: "プロ野球選手当てゲーム",
    pageTitle: "プロ野球シルエット",
    mastheadDescription:
      "ミステリー選手は現役選手です。9回以内で当てます。各行では球団、打投、身長、年齢、守備位置を比較します。",
    boardDetailsAria: "ボード情報",
    progressSummaryAria: "進行状況",
    boardLabel: "ボード",
    dateLabel: "日付",
    menuAria: "ゲームメニューを開く",
    menuHowTo: "遊び方",
    menuStats: "成績",
    menuOtherGame: "プロ野球グリッド",
    menuAbout: "このゲームについて",
    randomPickLabel: "ランダムで一人選ぶ",
    scoreLabel: "スコア",
    scoreValue: (count) => `予想 #${count}`,
    winRate: "勝率",
    boardsLabel: "プレイ数",
    solvedToday: "クリア済み",
    noGuesses: "残り予想はありません。",
    guessesRemaining: (count) => `残り ${count} 回`,
    searchKicker: "選手を検索",
    searchTitle: "予想する",
    searchDescription: "英語名または日本語名で検索してください",
    actionHowTo: "遊び方",
    actionStats: "成績",
    actionViewResult: "結果を見る",
    actionOtherGame: "プロ野球グリッド",
    actionAbout: "このゲームについて",
    streakLabel: "連勝",
    streakValue: (count) => `${count}日`,
    streakDescription: "連続で正解して記録を伸ばしましょう。",
    bestStreakLabel: "最長連勝",
    bestStreakValue: (count) => `${count}日`,
    bestStreakDescription: "このブラウザに保存された最長記録です。",
    completedBoardsLabel: "完了ボード",
    completedBoardsDescription: "勝敗はこのブラウザにローカル保存されます。",
    boardKicker: "ヒントボード",
    boardTitle: "各予想がどれだけ近いか確認",
    boardDescription: "緑は一致、金色は近い、灰色は不一致です。",
    aboutKicker: "概要",
    aboutTitle: "非公式ファン制作",
    aboutDescription:
      "プロ野球シルエットはファンが制作した非公式ゲームです。NPBおよび各球団、その他の公式団体とは関係ありません。",
    databaseCreditLabel: "選手データベース提供:",
    databaseCreditLink: "ProEyeKyuu player registry",
    notices: {
      shareCopied: "結果をクリップボードにコピーしました。",
      shareFailed: "クリップボードへのコピーに失敗しました。",
      reset: "現在のボードをリセットしました。",
      alreadyGuessed: (name) => `${name} はすでに予想済みです。`,
    },
    search: {
      disabled: "このラウンドは終了しました。結果を見るか、明日のボードを待ってください。",
      allMatchedGuessed: "該当する選手はすでに予想済みです。",
      noPlayersFound: (query) =>
        `「${query}」に一致する選手が見つかりません。英語名または日本語名で試してください。`,
      typeHint: "検索するには2文字以上入力してください。",
      typeTooShort: "検索するには2文字以上入力してください。",
      alreadyGuessed: (name) => `${name} はすでに予想済みです。`,
      noMatchingPlayer:
        "一致する選手が見つかりませんでした。英語名または日本語名をフルネームで試してください。",
      chooseDropdown: "候補リストから選手を選んでください。",
      placeholder: "英語名または日本語名で検索...",
      ariaLabel: "選手名を検索",
      roundComplete: "終了",
      submitGuess: "予想する",
    },
    board: {
      ariaLabel: "予想結果",
      headers: ["選手", "球団", "打", "投", "身長", "年齢", "守"],
      guessLabel: (count) => `予想 ${count}`,
    },
    howTo: {
      tag: "はじめに",
      title: "遊び方",
      close: "閉じる",
      intro:
        "9回以内にミステリーNPB選手を当ててください。各予想は盤面全体で判定され、各セルがヒントになります。",
      legend: [
        { label: "緑", description: "完全一致。" },
        { label: "黄", description: "近い、または部分一致。" },
        { label: "灰", description: "不一致。" },
      ],
      rulesTitle: "判定ルール",
      rules: [
        "球団: 同じ球団なら緑、同じリーグなら黄。",
        "打投: 同じ打席または利き腕なら緑。",
        "身長: 同じ身長なら緑、3cm差以内なら黄。",
        "年齢: 同年齢なら緑、2歳差以内なら黄。",
        "守備位置: 同じ主ポジションなら緑、サブポジション一致なら黄。",
      ],
    },
    statsModal: {
      tag: "ローカル成績",
      title: "成績",
      close: "閉じる",
      gamesPlayed: "プレイ数",
      wins: "勝利",
      losses: "敗北",
      winPercentage: "勝率",
      currentStreak: "現在の連勝",
      maxStreak: "最長連勝",
      guessDistribution: "予想分布",
    },
    resultModal: {
      tag: (boardNumber) => `ボード #${String(boardNumber).padStart(3, "0")}`,
      winTitle: "正解！",
      lossTitle: "また明日",
      close: "閉じる",
      share: "結果を共有",
      winBody: (guessCount) => `${guessCount}回でミステリー選手を当てました。`,
      lossBody:
        "ミステリー選手は上に表示されています。新しいボードは明日更新されます。",
    },
  },
};
