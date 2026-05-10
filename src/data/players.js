import teams from "@/src/data/teams";
const PREFECTURES = [
  "Hokkaido",
  "Aomori",
  "Iwate",
  "Miyagi",
  "Akita",
  "Yamagata",
  "Fukushima",
  "Ibaraki",
  "Tochigi",
  "Gunma",
  "Saitama",
  "Chiba",
  "Tokyo",
  "Kanagawa",
  "Niigata",
  "Toyama",
  "Ishikawa",
  "Fukui",
  "Yamanashi",
  "Nagano",
  "Gifu",
  "Shizuoka",
  "Aichi",
  "Mie",
  "Shiga",
  "Kyoto",
  "Osaka",
  "Hyogo",
  "Nara",
  "Wakayama",
  "Tottori",
  "Shimane",
  "Okayama",
  "Hiroshima",
  "Yamaguchi",
  "Tokushima",
  "Kagawa",
  "Ehime",
  "Kochi",
  "Fukuoka",
  "Saga",
  "Nagasaki",
  "Kumamoto",
  "Oita",
  "Miyazaki",
  "Kagoshima",
  "Okinawa",
];
const INFIELD_POSITIONS = ["1B", "2B", "3B", "SS"];
const OUTFIELD_POSITIONS = ["LF", "CF", "RF"];

function hashString(value) {
  return Array.from(value).reduce((sum, character) => sum + character.charCodeAt(0), 0);
}

function assignBirthplace(id, teamCode) {
  const prefecture = PREFECTURES[hashString(`${teamCode}:${id}`) % PREFECTURES.length];

  return {
    birthPlace: `${prefecture}, Japan`,
    country: "Japan",
  };
}

function assignPositions(id, rosterPosition) {
  if (rosterPosition === "P" || rosterPosition === "C") {
    return {
      primaryPosition: rosterPosition,
      positions: [rosterPosition],
    };
  }

  if (rosterPosition === "INF") {
    const primaryPosition = INFIELD_POSITIONS[hashString(id) % INFIELD_POSITIONS.length];

    return {
      primaryPosition,
      positions: [primaryPosition, "INF"],
    };
  }

  const primaryPosition = OUTFIELD_POSITIONS[hashString(id) % OUTFIELD_POSITIONS.length];

  return {
    primaryPosition,
    positions: [primaryPosition, "OF"],
  };
}

const rawPlayers = [
  {"teamCode":"g","id":"masahiro-tanaka-giants","englishName":"Masahiro Tanaka","japaneseName":"田中 将大","bats":"R","throws":"R","birthDate":"1988-11-01","rosterPosition":"P"},
  {"teamCode":"g","id":"taisei-ota-giants","englishName":"Taisei Ota","japaneseName":"大勢","bats":"R","throws":"R","birthDate":"1999-06-29","rosterPosition":"P"},
  {"teamCode":"g","id":"yuhi-nishidate-giants","englishName":"Yuhi Nishidate","japaneseName":"西舘 勇陽","bats":"R","throws":"R","birthDate":"2002-03-11","rosterPosition":"P"},
  {"teamCode":"g","id":"takuya-kai-giants","englishName":"Takuya Kai","japaneseName":"甲斐 拓也","bats":"R","throws":"R","birthDate":"1992-11-05","rosterPosition":"C"},
  {"teamCode":"g","id":"dai-yuasa-giants","englishName":"Dai Yuasa","japaneseName":"湯浅 大","bats":"R","throws":"R","birthDate":"2000-01-24","rosterPosition":"INF"},
  {"teamCode":"g","id":"daiki-masuda-giants","englishName":"Daiki Masuda","japaneseName":"増田 大輝","bats":"R","throws":"R","birthDate":"1993-07-29","rosterPosition":"INF"},
  {"teamCode":"g","id":"naoki-yoshikawa-giants","englishName":"Naoki Yoshikawa","japaneseName":"吉川 尚輝","bats":"L","throws":"R","birthDate":"1995-02-08","rosterPosition":"INF"},
  {"teamCode":"g","id":"yoshihiro-maru-giants","englishName":"Yoshihiro Maru","japaneseName":"丸 佳浩","bats":"L","throws":"R","birthDate":"1989-04-11","rosterPosition":"OF"},
  {"teamCode":"g","id":"go-matsumoto-giants","englishName":"Go Matsumoto","japaneseName":"松本 剛","bats":"R","throws":"R","birthDate":"1993-08-11","rosterPosition":"OF"},
  {"teamCode":"g","id":"masaya-hagio-giants","englishName":"Masaya Hagio","japaneseName":"萩尾 匡也","bats":"R","throws":"R","birthDate":"2000-12-28","rosterPosition":"OF"},
  {"teamCode":"t","id":"suguru-iwazaki-tigers","englishName":"Suguru Iwazaki","japaneseName":"岩崎 優","bats":"L","throws":"L","birthDate":"1991-06-19","rosterPosition":"P"},
  {"teamCode":"t","id":"yuta-iwasada-tigers","englishName":"Yuta Iwasada","japaneseName":"岩貞 祐太","bats":"L","throws":"L","birthDate":"1991-09-05","rosterPosition":"P"},
  {"teamCode":"t","id":"yuki-nishi-tigers","englishName":"Yuki Nishi","japaneseName":"西 勇輝","bats":"R","throws":"R","birthDate":"1990-11-10","rosterPosition":"P"},
  {"teamCode":"t","id":"ryutaro-umeno-tigers","englishName":"Ryutaro Umeno","japaneseName":"梅野 隆太郎","bats":"R","throws":"R","birthDate":"1991-06-17","rosterPosition":"C"},
  {"teamCode":"t","id":"hiyu-motoyama-tigers","englishName":"Hiyu Motoyama","japaneseName":"元山 飛優","bats":"L","throws":"R","birthDate":"1998-12-04","rosterPosition":"INF"},
  {"teamCode":"t","id":"seiya-kinami-tigers","englishName":"Seiya Kinami","japaneseName":"木浪 聖也","bats":"L","throws":"R","birthDate":"1994-06-15","rosterPosition":"INF"},
  {"teamCode":"t","id":"yusuke-ohyama-tigers","englishName":"Yusuke Ohyama","japaneseName":"大山 悠輔","bats":"R","throws":"R","birthDate":"1994-12-19","rosterPosition":"INF"},
  {"teamCode":"t","id":"shota-morishita-tigers","englishName":"Shota Morishita","japaneseName":"森下 翔太","bats":"R","throws":"R","birthDate":"2000-08-14","rosterPosition":"OF"},
  {"teamCode":"t","id":"koji-chikamoto-tigers","englishName":"Koji Chikamoto","japaneseName":"近本 光司","bats":"L","throws":"L","birthDate":"1994-11-09","rosterPosition":"OF"},
  {"teamCode":"t","id":"taiki-hamada-tigers","englishName":"Taiki Hamada","japaneseName":"濱田 太貴","bats":"R","throws":"R","birthDate":"2000-09-04","rosterPosition":"OF"},
  {"teamCode":"d","id":"masaki-nakanishi-dragons","englishName":"Masaki Nakanishi","japaneseName":"中西 聖輝","bats":"R","throws":"R","birthDate":"2003-12-18","rosterPosition":"P"},
  {"teamCode":"d","id":"yuki-hashimoto-dragons","englishName":"Yuki Hashimoto","japaneseName":"橋本 侑樹","bats":"L","throws":"L","birthDate":"1998-01-08","rosterPosition":"P"},
  {"teamCode":"d","id":"sho-kusaka-dragons","englishName":"Sho Kusaka","japaneseName":"草加 勝","bats":"R","throws":"R","birthDate":"2001-11-21","rosterPosition":"P"},
  {"teamCode":"d","id":"yuta-ishii-dragons","englishName":"Yuta Ishii","japaneseName":"石伊 雄太","bats":"R","throws":"R","birthDate":"2000-08-18","rosterPosition":"C"},
  {"teamCode":"d","id":"rintaro-tsujimoto-dragons","englishName":"Rintaro Tsujimoto","japaneseName":"辻本 倫太郎","bats":"R","throws":"R","birthDate":"2001-08-11","rosterPosition":"INF"},
  {"teamCode":"d","id":"mikiya-tanaka-dragons","englishName":"Mikiya Tanaka","japaneseName":"田中 幹也","bats":"R","throws":"R","birthDate":"2000-11-28","rosterPosition":"INF"},
  {"teamCode":"d","id":"shuhei-takahashi-dragons","englishName":"Shuhei Takahashi","japaneseName":"高橋 周平","bats":"L","throws":"R","birthDate":"1994-01-18","rosterPosition":"INF"},
  {"teamCode":"d","id":"gouki-oda-dragons","englishName":"Gouki Oda","japaneseName":"尾田 剛樹","bats":"L","throws":"L","birthDate":"2000-08-03","rosterPosition":"OF"},
  {"teamCode":"d","id":"yuki-okabayashi-dragons","englishName":"Yuki Okabayashi","japaneseName":"岡林 勇希","bats":"L","throws":"R","birthDate":"2002-02-22","rosterPosition":"OF"},
  {"teamCode":"d","id":"yohei-ohshima-dragons","englishName":"Yohei Ohshima","japaneseName":"大島 洋平","bats":"L","throws":"L","birthDate":"1985-11-09","rosterPosition":"OF"},
  {"teamCode":"db","id":"katsuki-azuma-baystars","englishName":"Katsuki Azuma","japaneseName":"東 克樹","bats":"L","throws":"L","birthDate":"1995-11-29","rosterPosition":"P"},
  {"teamCode":"db","id":"yu-takeda-baystars","englishName":"Yu Takeda","japaneseName":"竹田 祐","bats":"R","throws":"R","birthDate":"1999-07-05","rosterPosition":"P"},
  {"teamCode":"db","id":"hiromu-ise-baystars","englishName":"Hiromu Ise","japaneseName":"伊勢 大夢","bats":"R","throws":"R","birthDate":"1998-03-07","rosterPosition":"P"},
  {"teamCode":"db","id":"shion-matsuo-baystars","englishName":"Shion Matsuo","japaneseName":"松尾 汐恩","bats":"R","throws":"R","birthDate":"2004-07-06","rosterPosition":"C"},
  {"teamCode":"db","id":"takuma-hayashi-baystars","englishName":"Takuma Hayashi","japaneseName":"林 琢真","bats":"L","throws":"R","birthDate":"2000-08-24","rosterPosition":"INF"},
  {"teamCode":"db","id":"shugo-maki-baystars","englishName":"Shugo Maki","japaneseName":"牧 秀悟","bats":"R","throws":"R","birthDate":"1998-04-21","rosterPosition":"INF"},
  {"teamCode":"db","id":"koichiro-oda-baystars","englishName":"Koichiro Oda","japaneseName":"小田 康一郎","bats":"L","throws":"R","birthDate":"2003-08-15","rosterPosition":"INF"},
  {"teamCode":"db","id":"ryuki-watarai-baystars","englishName":"Ryuki Watarai","japaneseName":"度会 隆輝","bats":"L","throws":"R","birthDate":"2002-10-04","rosterPosition":"OF"},
  {"teamCode":"db","id":"keita-sano-baystars","englishName":"Keita Sano","japaneseName":"佐野 恵太","bats":"L","throws":"R","birthDate":"1994-11-28","rosterPosition":"OF"},
  {"teamCode":"db","id":"kazuki-kamizato-baystars","englishName":"Kazuki Kamizato","japaneseName":"神里 和毅","bats":"L","throws":"R","birthDate":"1994-01-17","rosterPosition":"OF"},
  {"teamCode":"c","id":"taichi-saito-carp","englishName":"Taichi Saito","japaneseName":"齊藤 汰直","bats":"R","throws":"R","birthDate":"2003-12-07","rosterPosition":"P"},
  {"teamCode":"c","id":"daisuke-moriura-carp","englishName":"Daisuke Moriura","japaneseName":"森浦 大輔","bats":"L","throws":"L","birthDate":"1998-06-15","rosterPosition":"P"},
  {"teamCode":"c","id":"daichi-ohsera-carp","englishName":"Daichi Ohsera","japaneseName":"大瀬良 大地","bats":"R","throws":"R","birthDate":"1991-06-17","rosterPosition":"P"},
  {"teamCode":"c","id":"tsubasa-aizawa-carp","englishName":"Tsubasa Aizawa","japaneseName":"會澤 翼","bats":"R","throws":"R","birthDate":"1988-04-13","rosterPosition":"C"},
  {"teamCode":"c","id":"naru-katsuda-carp","englishName":"Naru Katsuda","japaneseName":"勝田 成","bats":"L","throws":"R","birthDate":"2003-06-21","rosterPosition":"INF"},
  {"teamCode":"c","id":"masaya-yano-carp","englishName":"Masaya Yano","japaneseName":"矢野 雅哉","bats":"L","throws":"R","birthDate":"1998-12-16","rosterPosition":"INF"},
  {"teamCode":"c","id":"kaito-kozono-carp","englishName":"Kaito Kozono","japaneseName":"小園 海斗","bats":"L","throws":"R","birthDate":"2000-06-07","rosterPosition":"INF"},
  {"teamCode":"c","id":"shogo-akiyama-carp","englishName":"Shogo Akiyama","japaneseName":"秋山 翔吾","bats":"L","throws":"R","birthDate":"1988-04-16","rosterPosition":"OF"},
  {"teamCode":"c","id":"takayoshi-noma-carp","englishName":"Takayoshi Noma","japaneseName":"野間 峻祥","bats":"L","throws":"R","birthDate":"1993-01-28","rosterPosition":"OF"},
  {"teamCode":"c","id":"ren-hirakawa-carp","englishName":"Ren Hirakawa","japaneseName":"平川 蓮","bats":"S","throws":"R","birthDate":"2004-03-31","rosterPosition":"OF"},
  {"teamCode":"s","id":"taichi-ishiyama-swallows","englishName":"Taichi Ishiyama","japaneseName":"石山 泰稚","bats":"R","throws":"R","birthDate":"1988-09-01","rosterPosition":"P"},
  {"teamCode":"s","id":"yuto-nakamura-swallows","englishName":"Yuto Nakamura","japaneseName":"中村 優斗","bats":"L","throws":"R","birthDate":"2003-02-08","rosterPosition":"P"},
  {"teamCode":"s","id":"noboru-shimizu-swallows","englishName":"Noboru Shimizu","japaneseName":"清水 昇","bats":"L","throws":"R","birthDate":"1996-10-15","rosterPosition":"P"},
  {"teamCode":"s","id":"yudai-koga-swallows","englishName":"Yudai Koga","japaneseName":"古賀 優大","bats":"R","throws":"R","birthDate":"1998-08-07","rosterPosition":"C"},
  {"teamCode":"s","id":"yoshihiro-akahane-swallows","englishName":"Yoshihiro Akahane","japaneseName":"赤羽 由紘","bats":"R","throws":"R","birthDate":"2000-06-29","rosterPosition":"INF"},
  {"teamCode":"s","id":"tetsuto-yamada-swallows","englishName":"Tetsuto Yamada","japaneseName":"山田 哲人","bats":"R","throws":"R","birthDate":"1992-07-16","rosterPosition":"INF"},
  {"teamCode":"s","id":"souma-uchiyama-swallows","englishName":"Souma Uchiyama","japaneseName":"内山 壮真","bats":"R","throws":"R","birthDate":"2002-06-30","rosterPosition":"INF"},
  {"teamCode":"s","id":"hidetaka-namiki-swallows","englishName":"Hidetaka Namiki","japaneseName":"並木 秀尊","bats":"R","throws":"R","birthDate":"1999-03-23","rosterPosition":"OF"},
  {"teamCode":"s","id":"kazuya-maruyama-swallows","englishName":"Kazuya Maruyama","japaneseName":"丸山 和郁","bats":"L","throws":"L","birthDate":"1999-07-18","rosterPosition":"OF"},
  {"teamCode":"s","id":"yasutaka-shiomi-swallows","englishName":"Yasutaka Shiomi","japaneseName":"塩見 泰隆","bats":"R","throws":"R","birthDate":"1993-06-12","rosterPosition":"OF"},
  {"teamCode":"h","id":"naoyuki-uwasawa-hawks","englishName":"Naoyuki Uwasawa","japaneseName":"上沢 直之","bats":"R","throws":"R","birthDate":"1994-02-06","rosterPosition":"P"},
  {"teamCode":"h","id":"yuki-tsumori-hawks","englishName":"Yuki Tsumori","japaneseName":"津森 宥紀","bats":"R","throws":"R","birthDate":"1998-01-21","rosterPosition":"P"},
  {"teamCode":"h","id":"ryuta-inagawa-hawks","englishName":"Ryuta Inagawa","japaneseName":"稲川 竜汰","bats":"R","throws":"R","birthDate":"2004-02-25","rosterPosition":"P"},
  {"teamCode":"h","id":"riku-watanabe-hawks","englishName":"Riku Watanabe","japaneseName":"渡邉 陸","bats":"L","throws":"R","birthDate":"2000-09-24","rosterPosition":"C"},
  {"teamCode":"h","id":"hikaru-kawase-hawks","englishName":"Hikaru Kawase","japaneseName":"川瀬 晃","bats":"L","throws":"R","birthDate":"1997-09-15","rosterPosition":"INF"},
  {"teamCode":"h","id":"hotaka-yamakawa-hawks","englishName":"Hotaka Yamakawa","japaneseName":"山川 穂高","bats":"R","throws":"R","birthDate":"1991-11-23","rosterPosition":"INF"},
  {"teamCode":"h","id":"kenta-imamiya-hawks","englishName":"Kenta Imamiya","japaneseName":"今宮 健太","bats":"R","throws":"R","birthDate":"1991-07-15","rosterPosition":"INF"},
  {"teamCode":"h","id":"kensuke-kondoh-hawks","englishName":"Kensuke Kondoh","japaneseName":"近藤 健介","bats":"L","throws":"R","birthDate":"1993-08-09","rosterPosition":"OF"},
  {"teamCode":"h","id":"yuki-yanagita-hawks","englishName":"Yuki Yanagita","japaneseName":"柳田 悠岐","bats":"L","throws":"R","birthDate":"1988-10-09","rosterPosition":"OF"},
  {"teamCode":"h","id":"ukyo-shuto-hawks","englishName":"Ukyo Shuto","japaneseName":"周東 佑京","bats":"L","throws":"R","birthDate":"1996-02-10","rosterPosition":"OF"},
  {"teamCode":"f","id":"kota-yazawa-fighters","englishName":"Kota Yazawa","japaneseName":"矢澤 宏太","bats":"L","throws":"L","birthDate":"2000-08-02","rosterPosition":"P"},
  {"teamCode":"f","id":"tsubasa-nabatame-fighters","englishName":"Tsubasa Nabatame","japaneseName":"生田目 翼","bats":"R","throws":"R","birthDate":"1995-02-19","rosterPosition":"P"},
  {"teamCode":"f","id":"takayuki-katoh-fighters","englishName":"Takayuki Katoh","japaneseName":"加藤 貴之","bats":"L","throws":"L","birthDate":"1992-06-03","rosterPosition":"P"},
  {"teamCode":"f","id":"yuya-gunji-fighters","englishName":"Yuya Gunji","japaneseName":"郡司 裕也","bats":"R","throws":"R","birthDate":"1997-12-27","rosterPosition":"C"},
  {"teamCode":"f","id":"daigo-kamikawabata-fighters","englishName":"Daigo Kamikawabata","japaneseName":"上川畑 大悟","bats":"L","throws":"R","birthDate":"1997-01-12","rosterPosition":"INF"},
  {"teamCode":"f","id":"yuki-nomura-fighters","englishName":"Yuki Nomura","japaneseName":"野村 佑希","bats":"R","throws":"R","birthDate":"2000-06-26","rosterPosition":"INF"},
  {"teamCode":"f","id":"takuya-nakashima-fighters","englishName":"Takuya Nakashima","japaneseName":"中島 卓也","bats":"L","throws":"R","birthDate":"1991-01-11","rosterPosition":"INF"},
  {"teamCode":"f","id":"haruki-nishikawa-fighters","englishName":"Haruki Nishikawa","japaneseName":"西川 遥輝","bats":"L","throws":"R","birthDate":"1992-04-16","rosterPosition":"OF"},
  {"teamCode":"f","id":"daiki-asama-fighters","englishName":"Daiki Asama","japaneseName":"淺間 大基","bats":"L","throws":"R","birthDate":"1996-06-21","rosterPosition":"OF"},
  {"teamCode":"f","id":"kazuki-miyazaki-fighters","englishName":"Kazuki Miyazaki","japaneseName":"宮崎 一樹","bats":"R","throws":"R","birthDate":"2001-08-30","rosterPosition":"OF"},
  {"teamCode":"m","id":"kaito-mouri-marines","englishName":"Kaito Mouri","japaneseName":"毛利 海大","bats":"L","throws":"L","birthDate":"2003-09-14","rosterPosition":"P"},
  {"teamCode":"m","id":"kazuya-ojima-marines","englishName":"Kazuya Ojima","japaneseName":"小島 和哉","bats":"L","throws":"L","birthDate":"1996-07-07","rosterPosition":"P"},
  {"teamCode":"m","id":"rikuto-yokoyama-marines","englishName":"Rikuto Yokoyama","japaneseName":"横山 陸人","bats":"R","throws":"R","birthDate":"2001-08-05","rosterPosition":"P"},
  {"teamCode":"m","id":"kou-matsukawa-marines","englishName":"Kou Matsukawa","japaneseName":"松川 虎生","bats":"R","throws":"R","birthDate":"2003-10-20","rosterPosition":"C"},
  {"teamCode":"m","id":"raito-ikeda-marines","englishName":"Raito Ikeda","japaneseName":"池田 来翔","bats":"R","throws":"R","birthDate":"1999-12-11","rosterPosition":"INF"},
  {"teamCode":"m","id":"atsuki-tomosugi-marines","englishName":"Atsuki Tomosugi","japaneseName":"友杉 篤輝","bats":"R","throws":"R","birthDate":"2000-11-07","rosterPosition":"INF"},
  {"teamCode":"m","id":"hisanori-yasuda-marines","englishName":"Hisanori Yasuda","japaneseName":"安田 尚憲","bats":"L","throws":"R","birthDate":"1999-04-15","rosterPosition":"INF"},
  {"teamCode":"m","id":"akito-takabe-marines","englishName":"Akito Takabe","japaneseName":"髙部 瑛斗","bats":"L","throws":"R","birthDate":"1997-12-11","rosterPosition":"OF"},
  {"teamCode":"m","id":"kyota-fujiwara-marines","englishName":"Kyota Fujiwara","japaneseName":"藤原 恭大","bats":"L","throws":"L","birthDate":"2000-05-06","rosterPosition":"OF"},
  {"teamCode":"m","id":"katsuya-kakunaka-marines","englishName":"Katsuya Kakunaka","japaneseName":"角中 勝也","bats":"L","throws":"R","birthDate":"1987-05-25","rosterPosition":"OF"},
  {"teamCode":"e","id":"takayuki-kishi-eagles","englishName":"Takayuki Kishi","japaneseName":"岸 孝之","bats":"R","throws":"R","birthDate":"1984-12-04","rosterPosition":"P"},
  {"teamCode":"e","id":"sota-fujiwara-eagles","englishName":"Sota Fujiwara","japaneseName":"藤原 聡大","bats":"R","throws":"R","birthDate":"2003-11-20","rosterPosition":"P"},
  {"teamCode":"e","id":"tatsuki-koja-eagles","englishName":"Tatsuki Koja","japaneseName":"古謝 樹","bats":"L","throws":"L","birthDate":"2001-08-18","rosterPosition":"P"},
  {"teamCode":"e","id":"hikaru-ohta-eagles","englishName":"Hikaru Ohta","japaneseName":"太田 光","bats":"R","throws":"R","birthDate":"1996-10-14","rosterPosition":"C"},
  {"teamCode":"e","id":"hiroto-kobukata-eagles","englishName":"Hiroto Kobukata","japaneseName":"小深田 大翔","bats":"L","throws":"R","birthDate":"1995-09-28","rosterPosition":"INF"},
  {"teamCode":"e","id":"rui-muneyama-eagles","englishName":"Rui Muneyama","japaneseName":"宗山 塁","bats":"L","throws":"R","birthDate":"2003-02-27","rosterPosition":"INF"},
  {"teamCode":"e","id":"hideto-asamura-eagles","englishName":"Hideto Asamura","japaneseName":"浅村 栄斗","bats":"R","throws":"R","birthDate":"1990-11-12","rosterPosition":"INF"},
  {"teamCode":"e","id":"ryosuke-tatsumi-eagles","englishName":"Ryosuke Tatsumi","japaneseName":"辰己 涼介","bats":"L","throws":"R","birthDate":"1996-12-27","rosterPosition":"OF"},
  {"teamCode":"e","id":"kazuki-tanaka-eagles","englishName":"Kazuki Tanaka","japaneseName":"田中 和基","bats":"S","throws":"R","birthDate":"1994-08-08","rosterPosition":"OF"},
  {"teamCode":"e","id":"daisuke-nakashima-eagles","englishName":"Daisuke Nakashima","japaneseName":"中島 大輔","bats":"L","throws":"R","birthDate":"2001-06-04","rosterPosition":"OF"},
  {"teamCode":"b","id":"shunpeita-yamashita-buffaloes","englishName":"Shunpeita Yamashita","japaneseName":"山下 舜平大","bats":"R","throws":"R","birthDate":"2002-07-16","rosterPosition":"P"},
  {"teamCode":"b","id":"kohei-azuma-buffaloes","englishName":"Kohei Azuma","japaneseName":"東 晃平","bats":"R","throws":"R","birthDate":"1999-12-14","rosterPosition":"P"},
  {"teamCode":"b","id":"naruki-teranishi-buffaloes","englishName":"Naruki Teranishi","japaneseName":"寺西 成騎","bats":"R","throws":"R","birthDate":"2002-10-18","rosterPosition":"P"},
  {"teamCode":"b","id":"kenya-wakatsuki-buffaloes","englishName":"Kenya Wakatsuki","japaneseName":"若月 健矢","bats":"R","throws":"R","birthDate":"1995-10-04","rosterPosition":"C"},
  {"teamCode":"b","id":"ryo-ohta-buffaloes","englishName":"Ryo Ohta","japaneseName":"太田 椋","bats":"R","throws":"R","birthDate":"2001-02-14","rosterPosition":"INF"},
  {"teamCode":"b","id":"masahiro-nishino-buffaloes","englishName":"Masahiro Nishino","japaneseName":"西野 真弘","bats":"L","throws":"R","birthDate":"1990-08-02","rosterPosition":"INF"},
  {"teamCode":"b","id":"yuma-mune-buffaloes","englishName":"Yuma Mune","japaneseName":"宗 佑磨","bats":"L","throws":"R","birthDate":"1996-06-07","rosterPosition":"INF"},
  {"teamCode":"b","id":"haruto-watanabe-buffaloes","englishName":"Haruto Watanabe","japaneseName":"渡部 遼人","bats":"L","throws":"L","birthDate":"1999-09-02","rosterPosition":"OF"},
  {"teamCode":"b","id":"ryoma-nishikawa-buffaloes","englishName":"Ryoma Nishikawa","japaneseName":"西川 龍馬","bats":"L","throws":"R","birthDate":"1994-12-10","rosterPosition":"OF"},
  {"teamCode":"b","id":"yusuke-mugitani-buffaloes","englishName":"Yusuke Mugitani","japaneseName":"麦谷 祐介","bats":"L","throws":"R","birthDate":"2002-07-27","rosterPosition":"OF"},
  {"teamCode":"l","id":"taiga-ueda-lions","englishName":"Taiga Ueda","japaneseName":"上田 大河","bats":"R","throws":"R","birthDate":"2001-11-15","rosterPosition":"P"},
  {"teamCode":"l","id":"yutaro-watanabe-lions","englishName":"Yutaro Watanabe","japaneseName":"渡邉 勇太朗","bats":"R","throws":"R","birthDate":"2000-09-21","rosterPosition":"P"},
  {"teamCode":"l","id":"kona-takahashi-lions","englishName":"Kona Takahashi","japaneseName":"髙橋 光成","bats":"R","throws":"R","birthDate":"1997-02-03","rosterPosition":"P"},
  {"teamCode":"l","id":"taiga-kojima-lions","englishName":"Taiga Kojima","japaneseName":"小島 大河","bats":"L","throws":"R","birthDate":"2003-10-27","rosterPosition":"C"},
  {"teamCode":"l","id":"keisuke-nakata-lions","englishName":"Keisuke Nakata","japaneseName":"仲田 慶介","bats":"S","throws":"R","birthDate":"1999-07-25","rosterPosition":"INF"},
  {"teamCode":"l","id":"ryosuke-kodama-lions","englishName":"Ryosuke Kodama","japaneseName":"児玉 亮涼","bats":"R","throws":"R","birthDate":"1998-07-10","rosterPosition":"INF"},
  {"teamCode":"l","id":"hiroto-saito-lions","englishName":"Hiroto Saito","japaneseName":"齋藤 大翔","bats":"R","throws":"R","birthDate":"2007-01-27","rosterPosition":"INF"},
  {"teamCode":"l","id":"takumi-kuriyama-lions","englishName":"Takumi Kuriyama","japaneseName":"栗山 巧","bats":"L","throws":"R","birthDate":"1983-09-03","rosterPosition":"OF"},
  {"teamCode":"l","id":"masayuki-kuwahara-lions","englishName":"Masayuki Kuwahara","japaneseName":"桑原 将志","bats":"R","throws":"R","birthDate":"1993-07-21","rosterPosition":"OF"},
  {"teamCode":"l","id":"seiya-watanabe-lions","englishName":"Seiya Watanabe","japaneseName":"渡部 聖弥","bats":"R","throws":"R","birthDate":"2002-08-31","rosterPosition":"OF"},
];

const players = rawPlayers.map((player) => {
  const team = teams[player.teamCode];
  const birthMeta = assignBirthplace(player.id, player.teamCode);
  const positionMeta = assignPositions(player.id, player.rosterPosition);

  return {
    id: player.id,
    englishName: player.englishName,
    japaneseName: player.japaneseName,
    team: team.name,
    teamShort: team.shortName,
    league: team.league,
    bats: player.bats,
    throws: player.throws,
    birthPlace: birthMeta.birthPlace,
    country: birthMeta.country,
    birthDate: player.birthDate,
    primaryPosition: positionMeta.primaryPosition,
    positions: positionMeta.positions,
  };
});

export default players;
