#!/usr/bin/env node
// Build news-words.js from news-data.js: every headline and sentence of every
// news story, at every level, split into words (each linked to a dictionary
// entry) plus the grammar it uses, so tapping a sentence on the News page can
// explain it word by word — the same as the Phrases pages.
//
// Words come from jp_words.mjs, with news_extra_words.json for names and
// news vocabulary the site's lists don't have. Grammar comes from the rules
// in jp_grammar.mjs plus NEWS_RULES below, for the written expressions news
// is full of (〜によると, 〜おそれがある, 〜とみられる…).
//
// Names (people, places, companies and other groups) are coloured on the
// story pages, like NHK News Web Easy: NEWS_WORDS.names[key] is 'person',
// 'place' or 'org', from scripts/news_names.json, checked by hand. Every word
// kuromoji or the word list calls a name must be in one of its lists (or in
// 'not'); the run lists the ones that aren't and exits with an error (and
// test_news.js fails on any word the word list calls a name).
//
// Usage (kuromoji isn't a site dependency, so install it just for this):
//   npm install --no-save kuromoji
//   node scripts/tokenize_news.mjs [--misses]
// test_news.js fails when the news and this file drift apart.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, createWordFinder, loadSiteData } from './jp_words.mjs';
import { GRAMMAR_EXTRA, detectGrammar } from './jp_grammar.mjs';

const { NEWS_ITEMS, STORY_GRAMMAR } = loadSiteData(['news-data.js', 'stories-data.js', 'mystery-words.js', 'memes-data.js', 'memes-data-2.js']);

const readJson = f => JSON.parse(readFileSync(path.join(ROOT, 'scripts', f), 'utf8'));
// Dates, percentages and names kuromoji splits apart; keep them whole.
const NEWS_WHOLE = ['約1兆8400億円','200億円','2社','仲よく','ANA','JSR','ASEAN','APEC','習近平','トー・ラム','書記長','議決権','優先株','首脳','ゼロエミッション','脱炭素','10周年','日越','二酸化炭素','日本政策投資銀行','三井化学','共産党','ベトナム航空','来週','ハッカー','100億円','相次ぐ','既存','充てる','対抗','弱点','入り込む','アステラス','製薬','アステラス製薬','北京','3年半','服役','釈放','60代','帰国','懲役','日本経済新聞','ロイター','駐在','起訴','刑期','退去','懸案','日中','1日','5万7000','約5万7400円','5万7400円台','4000円','2020年','新型','コロナ','銘柄','幅広い','大勝','鈍化','最高値','2割','可決','約10兆円','10兆円','1989年','2016年','2016年度','4期','18日','3号機','4号機','中部電力','浜岡原発','田嶋幸三','田嶋','インファンティーノ','JFA','FIFA','9月','引き下げ','導入','届け出る','届け出','取り下げる','出馬','全会','各国','欧州','現職','再選','意向','望ましい','有力','耐震','御前崎','同省','社内','体制','通報','法令','順守','解消','稼働','失墜','理事','協会','連盟','安井','チェック','無形文化遺産','中間選挙','評価機関','政府間委員会','11月','12月','はんこ','連邦議会','最終的','国連教育科学文化機関','上下両院','31号','小笠原','伊豆諸島','父島','五日ごろ','採決','29歳','300円','2時間','1回','国対委員長','財務金融委員会','浴場組合','二次元コード','小笠原諸島','警報級','再発達','最接近','352人','220人','約220人','三日分','一週間分','119万円','約6000億円','二年間','厚生労働省','三十日','2.4パーセント','0.1ポイント','0.01ポイント','0.13ポイント','169万人','6896万人','33万人','15万人','1.19倍','2.19倍','二か月ぶり','三か月ぶり','前月','求人','就業','求職','康弘','匿名','秘匿','申し込み','件数','三十一日','ドットコムデスクトップ','64個','186個','5000円','二十三日','1か月','1か月間','GMO','アジアパラ','パラスポーツ','指針案','二十四日','松井秀喜','東シナ海','温帯低気圧','皇室典範', '市場', '人工知能', '出場枠', 'とみられる', '16.7%', '49.4%', '43.9%', '15.1%', '18.9%', '51.1%', '22.9%', '8.6%', '5360億円', '13か月', '二人目', '45.56%', '41.64%', '39.5%', '千島列島', '約3.8%', '3.8%', '7.0%', '6月', '6月末', '7%', '0.7%', '10月', '4月', '1%案', '1%分', '8%', '1%', '0%', 'クラウド', '10以上', '弱さ', 'ゲーム差', '3試合制', '硤合', '憲三', 'JR九州', '日本シリーズ', '日本ハム', 'セ・リーグ', 'パ・リーグ', 'アンリ・カガン', '金融庁', '探査機', '保険金', '幹事長', '統一地方選', '党大会', '存在感', '世界初', '参院選', '実仁', '49.8パーセント', '88.6パーセント', '49.7パーセント', '84.2パーセント', '74.4パーセント', '69.7パーセント', '50.1パーセント', '0.3ポイント', '39ポイント', '3.1パーセント', '5.2パーセント', '1.4パーセント', '0.1パーセント', '0.5パーセント', '50パーセント', '4.0度', '3.6度', '4度', '八回目', '世界一', '十一日', '18億3000万円', '2027年度', '80か所', '6か所', '134台', '計134台', '約3700か所', '10年', '二人', '1月', '西アフリカ', 'アンダーパス', '国土交通省', '金メダル', '来年度', '農林水産大臣', '農林水産相', '農林水産', '副大臣', '記者団', '支持者', '情報機関', 'スパイ罪', '特派員', '日本初', 'クルーズ船', '造船所', '船名', '茂木敏充', '武部新', '十五日', '約5パーセント', '6万4426円', '3318円', '3318円安', '4.9％', '4.90％', '3番目', '15％', '約8％', '3600円', '約531万件', '531万件', '十六日', '二十八日', '約14億8000万', 'G20', 'G7', 'ヤマト運輸', '埼玉工業大学', '佐川急便', '九州大学', '香川大学', '九州大', '香川大', 'コアウィーブ', 'アドバンテスト', '祐介', '秋田祐介', 'クロネコ', '後払い', '前日比', '100億ドル', '13年ぶり', '2013年', '2015年', '2023年', '30個', '30号', '3年間', '3時', '3時ごろ', '8年ぶり', 'チャンパー', '三日間', '九段北', '十九日', '米ドル', '靖国神社', '助け合える', 'マーシャル諸島', 'マリアナ諸島', 'トラック諸島', '片山', 'さつき', '秋季', '春季', '第二次', '1383人', '約12万5000人', '約12万5000人分', '1万8000件', '約1万3000人分', 'ドローン', '1万8000件超', 'により', '約16億5000万円', '3回目', '約31億円', '16億5000万円', '3件目', 'バングラデシュ', 'タリク・ラーマン', '二十七日', '約5300平方キロ', 'KDDI', 'モビコム','2.1パーセント','1.7パーセント','2パーセント','2.1％','2％','1.7％','2.9％','20.6％','2.4％','ちばてつや','八十七歳','二十二日','高森朝雄','九か月ぶり','第一戦','第二戦','第三戦','福岡','山川穂高','川村友斗','松本晴','東克樹','九回','二勝','一本目','値上がり','日銀','据え置く','押し上げる','死去','講談社','32号','32個','1994年','32年ぶり','西北西','九日ごろ','母島','五日先','チャンパカ','7時','39分ごろ','宮城','福島','茨城','震度','大熊','日立','双葉','浪江','東海','東方','日頃','総裁','和男','植田','植田和男','行事','節目','基調','保つ','推移','賃金','規範','おおむね','整合','目ざす','利子','リスク','インフレ','準備','調節','1時','4分ごろ','21人','18人','5強','5弱','50代','約41キロ','約8500人','二日目','約10倍','約125キロ','125キロ','55キロ','100選','2001年','2021年','北海道電力','海上保安庁','沖ノ鳥島','ゴジラ・メガムリオン','メガムリオン','市町村','見通せる','差し止め','名付ける','手がかり','大陸棚','知多','碧南','恵那','瀬戸','ゴジラ','原発','3号機','泊原発','泊村','札幌高裁','国際地質科学連合','つながり','10時','34分','SA','SMS','データ通信','設定','再起動','約14時間','一週間足らず','絞り込む','形跡','十か月','十カ月','約29万円','28万9536円','6.8パーセント','23.7パーセント','37.3パーセント','10パーセント','0.9パーセント','10.0パーセント','6.8パーセント減','23.7パーセント減','37.3パーセント減','3.1パーセント減','パック旅行','6年ぶり','品目','多雨','不順','天候不順','勤労者','裏付ける','至宝','8人','和食','野崎洋光','脇屋友詞','中華','一皿','鰹節','職人','賞状','創設','名店','普及','大皿','主流','担い手','危ぶむ','向上','狙う','経歴','国宝','人間国宝','認定','総料理長','大きさ','料理人','受賞者','文部科学大臣','日本茶','食文化','契約者','利用者','専門家','実収入','約4万羽','4万羽','養鶏場','今シーズン','2例目','1例目','H5型','殺処分','10キロ','49農場','約562万羽','562万羽','渡り鳥','鳥インフルエンザ','重さ','高病原性','採卵鶏','3.13倍','4.77倍','3倍台','やり直す','違憲状態','最高裁','最高裁判所','大法廷','1票','15人','10人','合区','台湾','京都府','旭市','3本','アジアプロ野球チャンピオンシップ','正木智也','金丸夢斗','宗山塁','3点','1点','7回','井口ジャパン','快勝','24歳','3年目','若手','初戦','初陣','白星','先頭打者','適時打','3安打','2安打','3打点','無失点','1次リーグ','1次','3連覇','2チーム','4チーム','自衛官','25万300円','1万800円','1万800円増','20万円','約20万円','30代','40代','3億円','二士','転居手当','給与法','人事院','25万円超','ワタミ','1株','1284円','約320億円','渡辺美樹','約24%','3.4%','約3.4%','株主優待','自社買収','資産管理会社','株式公開買い付け','東証','プライム市場','日本サブウェイ','非上場化','3月期','東京大学','プラニマル細胞','150回','150世代','チャイニーズハムスター','二日後','有用物質','30歳','40歳','染色体','光合成','上場廃止','サブウェイ','にわたって','3兆円','米政府','米軍','約3倍','在日米軍','駐留経費','思いやり予算','2022年度','2026年度','5年間','約1兆550億円','1兆550億円','難色を示す','約1兆5000億円程度','特別協定','中井亜美','1位','5位','フィギュアスケート','トリプルアクセル','82.20点','グランプリシリーズ','グランプリファイナル','第4戦','ワシントン州','スケートアメリカ','自己ベスト','7.96点','7.96点差','首位発進','3回転','トーループ','松生理乃','2連勝','18歳','2位以内','天皇陛下','両陛下','岸和田市','泉佐野市','1981年','45回目','第45回','キジハタ','りんくう公園','大阪公立大学','伊丹空港','海づくり','持ち回り','0.02%','0.6ポイント','4四半期','2四半期','3四半期','前期比','年率換算','打ち消し合う','琉球王国','坂元達裕','久保建英','中村敬斗','佐野航大','親善試合','終了間際','ビデオ判定','退場処分','約120億円','約62億円','4分後','1年ぶり','首里城','2対2','3対2','7月','7～9月期','9月末','0.1%','0.2%','0.3%','1.6%','決勝点','決勝ゴール','初ゴール','完成式','総事業費','戦闘機','軍用機','宗像市','与那国島','築城基地','小泉進次郎','官房長官','神戸市','4時ごろ','12分ごろ','約3分間','4597人','236.81点','154.61点','211.63点','22.91点','2年ぶり','理化学研究所','スーパーコンピューター','沖ノ島','礼文島','対馬海峡','防衛省','文部科学省','13人','4分の1','稲富修二','高島宗一郎','23.23％','23％','13万7667票','45.58％','11.27ポイント','11ポイント','2003年','札幌市','法定得票数','力不足','2週間','異議申し立て','五日間','60周年','60年','ターマン・シャンムガラトナム','チャンギ空港','上皇ご夫妻','表敬訪問','羽田空港','51％','49％','フリマアプリ','合弁会社','エンタメ・ホビー','デラウェア州','真贋鑑定','駿河屋','再選挙','二十一日','大統領府','メルカリ','政令市','戦後','6か月','11兆7688億円','12兆2453億円','4765億円','1979年','14か月','61％','1.6倍','約1.6倍','1兆1206億円','輸出入','単月','21.6％','森保一','85分','福田師王','2018年','大岩剛','8年あまり','8年余り','40分','21歳','391万2500人','103万5800人','37万9500人','47％','47.0％','391万人','0.4％','390万9128人','63万4600人','3464万3000人','2.5％','19.4％','6.5％','客数','追い風','2500人','日本政府観光局','円安','高止まり','追加点','デビュー戦','最終戦','前年同月比','前年同期比','地域別','新体制','アジアカップ','訪日客','0.4％増','21.6％増','19.4％増','6.5％増','47.0％減','47％減','2.5％減','2割増','3007円','5万6436円','約631円','約7か月ぶり','三日ぶり','56銭安','65銭','419円','83ドル','十一勝','一敗','二敗','三敗','八勝','12日目','13日目','10勝目','若元春','若隆景','熱海富士','義ノ富士','金峰山','大相撲','磁気圏','スイングバイ','ベピコロンボ','アンソロピック','ナスダック','約8年','約5％','1社','1差','4人','33歳','日経平均','大の里','ESA','九州場所','日欧','今週末','全面安','大幅安','史上初','初優勝','本格的','からあげ','1つ','3つ','4つ','速さ','10時間前','積み上がり','約10時間前','記者会見','宇宙航空研究開発機構','2.2％','29.7％','1.6％','2.3％','10％','0.7ポイント','102.9','2か月','1971年','はやぶさ2','小惑星','リュウグウ','2014年','イオンエンジン','17メートル','74メートル','約6キロ','数百メートル','28年','フライバイ','4基','3基','1基','難易度','国枝慎吾','国枝','殿堂','殿堂入り','国際テニス殿堂','パラリンピック','28回','42','ゴールデンスラム','アシュリー・バーティ','8月','ロードアイランド州','ニューポート','3個','1個','28度','全制覇','車いす','四大大会','国民栄誉賞', '藤井聡太', '服部慎一郎', '渡辺明', '筒井岳彦', '第4局', '第39期', '94手', '8421トン', '1万526トン', '4407トン', '4147トン', '509トン', '大型魚', '小型魚', '漁獲枠', '中西部太平洋まぐろ類委員会', '日本たばこ産業', '7240億円', '約1兆3770億円', '1兆3860億円', '下方修正', '現地法人', '売上収益', '所有権', '都城市', '宮崎県', '竜王戦', '二十四歳', '1時間近く', '1時間近い', '角換わり', '12月期', '大統領令', '経営権', '永世竜王', '通れる', '会津地方', '北塩原', '北塩原村', '千四百人', '二千軒', '459号', '国道459号', '通行止め', '514世帯', '948人', '1400人', '約1400人', '6時', '6時半', '10時', '猪苗代', '猪苗代町', '2000軒', '約2000軒', '東北電力', '災害救助法', 'ペルー', 'ケイコ・フジモリ', 'フジモリ', 'アルベルト・フジモリ', 'アルベルト', '首相官邸', '3世', '日系3世', 'ダンプカー', 'サプライチェーン', '供給網', '強靱化', '恣意的', '無償資金協力', '在任中', 'エルニーニョ現象', '島田麻央', 'フィンランド', '15点', '第5戦', 'ヘルシンキ', '150.43点', '229.49点', '15.43点', 'エストニア', 'シニア', '1年目', 'カナダ', 'スケートカナダ', '思い切り', '紀平梨花', '2人目', '5大会', '15点以上', '着氷', '4回転', '来日中', '観光客', '避難所', '7万5000円', '5万5000円', '6万8000円', '2万3000円', '6万2000円', '7000円', '1億個', '30周年', '7度目', '7回目', '十三勝', '十四勝', '七回目', '第1号', '第2号', '第3号', '69歳', '64歳', '59歳', '1996年', '2004年', '2025年', '30年', '33％', 'レトロブーム', '突き落とす', '渡し込み', '千秋楽', '殊勲賞', '敢闘賞', '技能賞', '三賞', '自営業者', '国民年金基金', '老齢基礎年金', '基礎年金', '企業年金', '国民年金', '確定拠出年金', '個人型', '限度額', '掛け金', 'たまごっち', 'バンダイ', 'イデコ', '羽黒山', '豊昇龍', '玉鷲', '本割', '優勝決定戦', '決定戦', '先場所', '南北アメリカ', '知的財産', '携帯型', '7月末', '福岡国際センター', '日本中', '2場所', '被保険者', '売り出す', '大人気', '遊び方', 'ICC', '赤根智子', '分担金', '15パーセント', '15パーセント程度', '我が国', '締約国', '楽天証券', '441万件', '119万件', '約441万件', '約322万件', '約119万件', '約1198万', '約168万件', '約1125万', '暗証番号', '第2報', '第1報', '申込者', '報告徴求命令', '暖冬', '西日本', '東日本', '北日本', '今冬', '関東甲信', '降雪量', '少なめ', 'おかしな', '3か月予報', '強さ', '寒さ', '首都圏', '米政権', '一方で', '一時的', '最大級', '全国的', '平年並み', '日本海側', '欠かせない', '平均', '拠出国', '活動費', '保有者', '商品別', '関税', 'EU', '通商', '通商代表部', 'USTR', '20パーセント', '公聴会', '過剰', '過剰生産', '課す', '悪影響', '301条', '通商法', '不十分', '申し入れる', 'NPO', 'NPO法人', '1万3879か所', '1200か所', '1403か所', '1700か所', '43パーセント', '68パーセント', '68.1パーセント', '約40パーセント', '4割', '約8割', '公立', '区域', '通学区域', '鳥取', '鳥取県', '緩やか', '市区町村', '高齢者', '居場所', '大河ドラマ', '大河', '神木', '神木隆之介', '隆之介', '戦国', '戦国時代', '武将', '石田', '石田三成', '主演', '豊臣', '豊臣秀吉', '秀吉', '5回目', '脚本', '黒岩', '黒岩勉', '好奇心', '好奇心旺盛', '29年', '第68作', '出演', '5作目', 'らんまん', '連続テレビ小説', '会見', '冷徹', '旺盛', '滋賀', '滋賀県', '長浜', '長浜市', '明かす', '出身地', '木原稔', '欧州連合', 'むすびえ', 'こども食堂', '速報値', '構造的', '非市場的', '措置案'];
const { segment } = await createWordFinder({
  extra: { ...readJson('phrase_extra_words.json'), ...readJson('news_extra_words.json') },
  whole: [...readJson('phrase_whole_words.json'), ...NEWS_WHOLE],
});

// Written-style grammar the Stories notes don't cover, in the same shape.
const GRAMMAR_NEWS = {
  'to-iu-report': { level: 'N3', title: '〜という — "reportedly"', pattern: 'Plain form + という。', note: 'Ending a news sentence with という passes on what someone else said: 可能性は低いという "it is said the chances are low". Often paired with 〜によると.' },
  'osore-ga-aru': { level: 'N3', title: '〜おそれがある — "there is a risk that"', pattern: 'Verb plain form / Noun + の + おそれがある', note: 'A formal warning that something bad could happen: 波が高くなるおそれがある "the waves could get high". Only used for bad outcomes.' },
  'to-mirareru': { level: 'N3', title: '〜とみられる — "is thought to"', pattern: 'Plain form + とみられる', note: 'A careful guess in news writing: 多いとみられる "is expected to be many". The writer avoids stating it as fact.' },
  'mikomi': { level: 'N3', title: '〜見込みだ — "is expected to"', pattern: 'Verb plain form + 見込みだ', note: 'What is forecast or planned to happen: 達する見込みだ "is expected to reach". Common in weather and economic news.' },
  'utagai': { level: 'N3', title: '〜疑いがある — "is suspected of"', pattern: 'Plain form + 疑いがある', note: 'Something not yet proven: 決めていた疑いがある "is suspected of having decided". News uses it until a court decides.' },
  'to-shite-iru': { level: 'N3', title: '〜としている — "says / takes the position"', pattern: 'Quote / plain form + としている', note: 'How the news reports an organisation\'s official line: 「協力する」としている "says it will cooperate".' },
  'to-shite': { level: 'N3', title: '〜として — "saying that / as"', pattern: 'Quote + として', note: 'Gives the reason or claim behind an action: 「議論が必要だ」として反発 "objects, saying debate is needed".' },
  'naka': { level: 'N3', title: '〜中 — "amid, while"', pattern: 'Verb plain form + 中(で)', note: 'The situation in which something happens: 値上げが続く中 "as prices keep rising".' },
  'koto-kara': { level: 'N3', title: '〜ことから — "because (of the fact that)"', pattern: 'Plain form + ことから', note: 'A written way to give a reason, often based on a fact: 時間がかかることから "since it takes time".' },
  'tame-reason': { level: 'N3', title: '〜ため — "because" (written)', pattern: 'Plain form / Noun + の + ため', note: 'In news and notices ため gives a reason, like から: 時間がかかるため "because it takes time". With a verb of intent it means "in order to" instead.' },
  'masu-stem-and': { level: 'N3', title: 'ます-stem + 、 — "and" (written)', pattern: 'Verb ます-stem + 、', note: 'Written Japanese often joins two sentences with the ます-stem instead of the て-form: 変え、 = 変えて、 "changes …, and".' },
  'te-ori': { level: 'N3', title: '〜ており — written 〜ていて', pattern: 'Verb て-form + おり', note: 'The formal, written version of 〜ていて: 反発しており "is objecting, and…".' },
  'ippou-conj': { level: 'N3', title: '一方 — "on the other hand"', pattern: '一方、 + sentence', note: 'At the start of a sentence, 一方 turns to a contrasting side of the story: 一方、野党は… "the opposition, meanwhile, …".' },
  'to-naru': { level: 'N3', title: '〜となる — written 〜になる', pattern: 'Noun + となる', note: 'News and formal writing often use と for になる "become": 10人目となる "becomes the tenth".' },
  'sai': { level: 'N3', title: '〜際 — "when" (formal)', pattern: 'Verb plain form / Noun + の + 際(は / に)', note: 'A formal とき, common in news and notices: 釣りをする際は "when fishing".' },
};
const GRAMMAR = { ...STORY_GRAMMAR, ...GRAMMAR_EXTRA, ...GRAMMAR_NEWS };

// Patterns found in the text. `rx` matches the grammar itself; the snippet
// shown on the page also takes in the word before it (`back` words, default
// 1), so 多いとみられる rather than とみられる. Points the shared rules found
// in the same stretch of text (`replaces`) are dropped, since they're the
// same words misread — the よると of 〜によると isn't 〜と "when".
const NEWS_RULES = [
  { id: 'ni-yoru-to', rx: /によると/, replaces: ['ni-particle', 'to-conditional'] },
  { id: 'to-iu-report', rx: /という(?=。)/, replaces: ['to-iu-name', 'to-quote', 'plain-form'] },
  { id: 'osore-ga-aru', rx: /おそれがあ(?:る|ります)/, back: 2, replaces: ['plain-form'] },
  { id: 'to-mirareru', rx: /とみられ(?:る|ます)/, replaces: ['to-quote', 'passive'] },
  { id: 'mikomi', rx: /見込み/ },
  { id: 'utagai', rx: /疑いがあ(?:る|ります)/, back: 2, replaces: ['plain-form', 'masu', 'ga-subject'] },
  { id: 'to-shite-iru', rx: /としている/, back: 0, replaces: ['to-quote', 'te-iru'] },
  { id: 'to-shite', rx: /として(?!い)/, back: 0 },
  { id: 'naka', rx: /中(?=、)/ },
  { id: 'koto-kara', rx: /ことから/, replaces: ['kara-from'] },
  { id: 'tame-reason', rx: /ため(?![にの])/, replaces: ['tame-ni'] },
  { id: 'te-ori', rx: /ており/, replaces: ['te-sequence'] },
  { id: 'ippou-conj', rx: /^一方(?=、)/, back: 0 },
  { id: 'sai', rx: /(?<!実)際(?=[はに、])/ },
  { id: 'toki', rx: /とき(?=[はに、])/, replaces: ['ni-particle'] },
  { id: 'tari', rx: /[たださ]り[^。]*たり(?:する|し)/, replaces: [] },
  { id: 'you-ni-suru', rx: /ようにしましょう/, replaces: ['ni-suru-choice', 'mashou'] },
  { id: 'sou-looks', rx: /そう(?:です|だ)(?=。|$)/, replaces: ['desu', 'da-plain'] },
  { id: 'kamoshirenai', rx: /かもしれません/, back: 2, replaces: ['masen'] },
  { id: 'to-quote', rx: /(?:ない|しい|える|する)と(?=　?(?:言|話|考|強調|発表|説明))/, back: 0, replaces: ['to-conditional'] },
  { id: 'ni-tsuite', rx: /について/ },
  { id: 'tame-ni', rx: /ために/, replaces: ['ni-particle'] },
  { id: 'nakereba-naranai', rx: /なければなりませんでした/, replaces: ['ba-conditional', 'masen-deshita', 'deshita'] },
  { id: 'to-naru', rx: /となる/, replaces: ['to-with', 'plain-form'] },
  { id: 'you-ni-naru', rx: /ようになり/, replaces: ['ni-naru', 'ni-particle'] },
  { id: 'koto-ni-naru', rx: /ことになり/, replaces: ['ni-naru'] },
];

const isPunct = p => !p.key && /^[、。「」　\s]+$/.test(p.src.replace(/\[[^\]]*\]/g, ''));

function newsGrammar(morphs, plain, pieces) {
  let g = detectGrammar(morphs, plain, GRAMMAR);
  for (const rule of NEWS_RULES) {
    const m = rule.rx.exec(plain);
    if (!m) continue;
    const coreFrom = m.index, coreTo = m.index + m[0].length;
    if (rule.replaces) {
      g = g.filter(([id, snippet]) => {
        if (!rule.replaces.includes(id)) return true;
        // Dropped if any place the snippet occurs overlaps the match.
        for (let at = plain.indexOf(snippet); at !== -1; at = plain.indexOf(snippet, at + 1)) {
          if (at < coreTo && at + snippet.length > coreFrom) return false;
        }
        return true;
      });
    }
    if (g.some(([id]) => id === rule.id)) continue;
    let k = pieces.findIndex(p => p.from <= coreFrom && coreFrom < p.to);
    for (let n = rule.back === undefined ? 1 : rule.back; n > 0 && k > 0 && !isPunct(pieces[k - 1]); n--) k--;
    const from = Math.min(coreFrom, pieces[k] ? pieces[k].from : coreFrom);
    g.push([rule.id, plain.slice(from, coreTo)]);
  }
  // Written Japanese joins sentences with the ます-stem: 変え、 for 変えて、.
  const i = morphs.findIndex((m, j) => m.pos === '動詞' && m.pos_detail_1 === '自立' && !['いる', 'おる', 'ある'].includes(m.basic_form) && m.conjugated_form === '連用形' && morphs[j + 1] && morphs[j + 1].surface_form === '、');
  if (i !== -1) {
    const p = pieces.find(q => q.from <= morphs[i].from && morphs[i].from < q.to);
    g.push(['masu-stem-and', plain.slice(p.from, p.to)]);
  }
  return g;
}

// ─── Build ───────────────────────────────────────────────────────────────────

const gloss = {};
const grammarUsed = new Set();
const lines = {};
const misses = new Map();

function analyse(id, markup) {
  const { pieces, morphs, plain } = segment(markup);
  const words = [];
  pieces.forEach(({ src, key }) => {
    if (key && key.miss) {
      if (key.miss.length > 1) misses.set(key.miss, (misses.get(key.miss) || []).concat(id));
      words.push(src);
    } else if (key) {
      gloss[key[0]] = key[1];
      words.push([src, key[0]]);
    } else words.push(src);
  });
  const w = words.reduce((acc, t) => {
    if (typeof t === 'string' && typeof acc[acc.length - 1] === 'string') acc[acc.length - 1] += t;
    else acc.push(t);
    return acc;
  }, []);
  const g = newsGrammar(morphs, plain, pieces);
  g.forEach(([gid]) => {
    if (!GRAMMAR[gid]) throw new Error(`unknown grammar id ${gid}`);
    grammarUsed.add(gid);
  });
  lines[id] = { w, g };
}

for (const item of NEWS_ITEMS) {
  for (const [level, v] of Object.entries(item.levels)) {
    analyse(`${item.id}:${level}:t`, v.title);
    v.lines.forEach((l, i) => analyse(`${item.id}:${level}:${i}`, l[0]));
  }
}

// Names: every word in news_names.json's lists that the news uses.
const NAMES = readJson('news_names.json');
const nameOf = {};
for (const kind of ['person', 'place', 'org', 'not']) {
  for (const k of NAMES[kind]) {
    if (nameOf[k]) throw new Error(`news_names.json: ${k} is in both ${nameOf[k]} and ${kind}`);
    nameOf[k] = kind;
  }
}
const names = {};
const unnamed = [];
for (const [key, [, meaning, pos]] of Object.entries(gloss)) {
  const kind = nameOf[key];
  if (kind) { if (kind !== 'not') names[key] = kind; continue; }
  const proper = segment(key.replace(/\(.*\)$/, '')).morphs.some(m => m.pos_detail_1 === '固有名詞');
  if (proper || /name|organi[sz]ation/.test(pos) || /\((surname|given name|company)\b/.test(meaning)) unnamed.push(`${key} — ${meaning}`);
}

const sorted = o => Object.fromEntries(Object.keys(o).sort().map(k => [k, o[k]]));
const grammar = sorted(Object.fromEntries([...grammarUsed].map(id => [id, GRAMMAR[id]])));
// One entry a line, so adding a day's news adds lines instead of rewriting
// one huge one.
const entries = o => `{\n${Object.entries(o).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(',\n')}\n}`;
const js = `// Generated by scripts/tokenize_news.mjs from news-data.js — do not edit.
// NEWS_WORDS.lines['<story id>:<level>:<n>'] (sentence n) or
// ['<story id>:<level>:t'] (the headline) is { w, g }: w lists the sentence's
// pieces — a string is plain text, [markup, key] a word whose [reading,
// meaning, part of speech] is gloss[key] — and g lists its grammar as
// [id, snippet], explained in grammar[id]. names[key] marks a word as a
// 'person', 'place' or 'org' name (scripts/news_names.json).
(function (global) {
  'use strict';
  global.NEWS_WORDS = {
${['gloss', 'grammar', 'names', 'lines'].map(k => `"${k}":${entries({ gloss: sorted(gloss), grammar, names: sorted(names), lines }[k])}`).join(',\n')}
};
})(typeof window !== 'undefined' ? window : globalThis);
`;
writeFileSync(path.join(ROOT, 'news-words.js'), js);
console.log(`${Object.keys(lines).length} sentences, ${Object.keys(gloss).length} words, ${grammarUsed.size} grammar points; ${misses.size} words not found`);
if (unnamed.length) {
  console.log(`${unnamed.length} possible names not in scripts/news_names.json (add each to person, place, org or not):`);
  unnamed.forEach(n => console.log(`  ${n}`));
  process.exitCode = 1;
}
if (process.argv.includes('--misses')) [...misses].forEach(([k, ids]) => console.log(k, ids.length, ids[0]));
