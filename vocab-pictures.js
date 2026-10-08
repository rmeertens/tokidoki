(function (global) {
  'use strict';

  // Pictures for the Vocabulary page's "Picture → Word" direction: a word's
  // kanji spelling (as in vocabulary-data.js) → the drawing that shows it,
  // using the illustrations from listening-art.js. A value is
  //   'name'                 an icon (ListeningArt.ICONS)
  //   { person: 'role' }     a person (ListeningArt.ROLES), or a full person spec
  //   { items: [...] }       several icons side by side
  //   { people: [...] }      several people (roles) side by side
  // Only words a picture can pin down are here; one picture per word, so no
  // two cards share a drawing.
  const POLICE = { hair: 'short', top: 'jacket', topColor: 'navy', bottom: 'trousers', bottomColor: 'navy', cap: true, hatColor: 'navy', tie: true };

  global.VOCAB_PICTURES = {
    // food and drink
    '果物': { items: ['apple', 'banana', 'mandarin'] }, 'ぶどう': 'grapes', '卵': 'egg', 'パン': 'bread',
    '牛乳': 'milk', 'ジュース': 'juice', 'コーヒー': 'coffee', 'お茶': 'tea', '紅茶': 'blacktea', 'ビール': 'beer',
    'ワイン': 'wine', 'お酒': 'sake', '水': 'water', '氷': 'ice', 'アイスクリーム': 'icecream', 'ケーキ': 'cake',
    'お菓子': 'sweets', '飴': 'lollipop', 'サンドイッチ': 'sandwich', 'カレー': 'curry', '御飯': 'rice',
    'お弁当': 'bento', '魚': 'fish', '肉': 'meat', '鶏肉': 'drumstick', '野菜': 'vegetables', '豆': 'beans',
    'サラダ': 'salad', 'ジャム': 'jam', '醤油': 'soysauce', 'お皿': 'plate', 'コップ': 'glass',
    'スプーン': 'spoon', 'フォーク': 'fork', 'ナイフ': 'knife', '箸': 'chopsticks', '鍋': 'pot',

    // animals
    '犬': 'dog', '猫': 'cat', '鳥': 'bird', '虫': 'ladybug', '猿': 'monkey', '兎': 'rabbit', '馬': 'horse',
    '牛': 'cow', '象': 'elephant', '虎': 'tiger', '鼠': 'mouse', '蚊': 'mosquito', '貝': 'shell',

    // nature, weather and seasons
    '花': 'flower', '木': 'tree', '桜': 'sakura', '葉': 'leaf', '草': 'grass', '森': 'forest', '山': 'mountain',
    '川': 'river', '池': 'pond', '島': 'island', '海': 'beach', '波': 'wave', '石': 'stone', '火': 'fire',
    '火事': 'houseFire', '地球': 'globe', '太陽': 'sun', '月': 'moon', '星': 'star', '雲': 'cloud',
    '曇り': 'cloudy', '雨': 'rain', '雪': 'snow', '風': 'wind', '雷': 'thunder',
    '春': 'tulip', '夏': 'watermelon', '秋': 'leaves', '冬': 'snowman', '朝': 'sunrise', '夜': 'night',

    // people
    '医者': { person: 'doctor' }, '看護婦': { person: 'nurse' }, '先生': { person: 'teacher' },
    '学生': { person: 'student' }, '店員': { person: 'clerk' }, 'お父さん': { person: 'father' },
    'お母さん': { person: 'mother' }, 'おじいさん': { person: 'grandpa' }, 'おばあさん': { person: 'grandma' },
    '男の子': { person: 'boy' }, '女の子': { person: 'girl' }, '警官': { person: POLICE }, '赤ちゃん': 'baby',
    '王': 'crown',

    // the body
    '顔': 'face', '頭': 'head', '目': 'eye', '耳': 'ear', '鼻': 'nose', '口': 'mouth', '歯': 'tooth',
    '手': 'hand', '足': 'foot', '心臓': 'heart', '骨': 'bone', '血': 'blood',

    // clothes and things you carry
    '帽子': 'hat', '眼鏡': 'glasses', 'シャツ': 'tshirt', 'セーター': 'sweater', 'コート': 'coat',
    'ネクタイ': 'necktie', 'スカート': 'skirt', 'ズボン': 'trousers', '靴': 'shoes', '靴下': 'socks',
    '手袋': 'gloves', '指輪': 'ring', 'ベルト': 'belt', '着物': 'kimono', 'ボタン': 'button',
    '傘': 'umbrella', 'かばん': 'bag', '財布': 'wallet', '鍵': 'key', 'お金': 'money', 'スーツケース': 'suitcase',

    // at home
    '家': 'house', '椅子': 'chair', '机': 'desk', 'テーブル': 'table', 'ベッド': 'bed', '窓': 'window',
    'ドア': 'door', '階段': 'stairs', '鏡': 'mirror', '時計': 'clock', 'カレンダー': 'calendar',
    'テレビ': 'tv', 'ラジオ': 'radio', '電話': 'phone', 'パソコン': 'computer', '冷蔵庫': 'fridge',
    '冷房': 'aircon', '電気': 'lightbulb', '電灯': 'lamp', '花瓶': 'vase', '石鹸': 'soap', '箱': 'box',
    'ごみ': 'trash', '人形': 'doll', 'おもちゃ': 'teddy', '薬': 'medicine', '注射': 'syringe', '病気': 'thermometer',

    // paper, school and hobbies
    '本': 'book', '本棚': 'books', '辞書': 'dictionary', 'ノート': 'notebook', '鉛筆': 'pencil', 'ペン': 'pen',
    '消しゴム': 'eraser', 'はさみ': 'scissors', '糸': 'thread', '手紙': 'handLetter', '封筒': 'letter',
    '葉書': 'postcard', '切手': 'stamp', '切符': 'ticket', '新聞': 'newspaper', '地図': 'map', '写真': 'photo',
    'カメラ': 'camera', '映画': 'film', '音楽': 'music', '歌': 'karaoke', '絵': 'paint', 'ギター': 'guitar',
    'ピアノ': 'piano', 'ボール': 'ball', 'テニス': 'tennis', '旗': 'flag', 'ベル': 'bell', 'テント': 'tent',
    '宿題': 'homework', '勉強': 'study', '仕事': 'work', '料理': 'cooking', '掃除': 'broom', '洗濯': 'washer',
    '散歩': 'walk', '買い物': 'shopping', '水泳': 'swim', '誕生日': 'gift',

    // places
    '学校': 'school', '病院': 'hospital', '駅': 'station', '店': 'shop', '喫茶店': 'cafe', '図書館': 'library',
    '公園': 'park', '門': 'gate', 'プール': 'pool', '銀行': 'bank', '郵便局': 'postoffice', 'ポスト': 'mailbox',
    '神社': 'shrine', '城': 'castle', '塔': 'pagoda', '橋': 'bridge', 'トンネル': 'tunnel', '信号': 'trafficlight',
    'エレベーター': 'elevator',

    // getting around
    '車': 'car', '自転車': 'bike', 'バス': 'bus', 'タクシー': 'taxi', '電車': 'train', '飛行機': 'plane',
    '舟': 'ship', '汽車': 'steamtrain', 'トラック': 'truck', 'オートバイ': 'motorbike', 'ロケット': 'rocket',
    'ヨット': 'sailboat', 'ボート': 'rowboat',

    // colours and where things are
    '赤': 'swatch-red', '青': 'swatch-blue', '黄色': 'swatch-yellow', '白': 'swatch-white', '黒': 'swatch-black',
    '緑': 'swatch-green', '茶色': 'swatch-brown',
    '上': 'above', '下': 'below', '中': 'inside', '右': 'turn-right', '左': 'turn-left',
    '北': 'north', '南': 'south', '東': 'east', '西': 'west', '円': 'circle', '四角': 'square',

    // more food and drink
    '食べ物': { items: ['onigiri', 'apple', 'bread'] }, '飲み物': 'drink', '牛肉': { items: ['cow', 'meat'] },
    '豚肉': { items: ['pig', 'meat'] }, '米': 'ricesack', '小麦': 'wheat', '塩': 'salt', '胡椒': 'pepper', '砂糖': 'sugar',
    'スープ': 'soup', '蕎麦': 'soba', 'チーズ': 'cheese', 'デザート': 'pudding', 'ウイスキー': 'whiskey',
    'カップ': 'mug', '皿': 'dishes', '瓶': 'bottle', '缶': 'can', '辛い': 'chili', 'すっぱい': 'lemon',

    // people, feelings, doing things
    '男': { person: 'man' }, '女': { person: 'woman' }, '子供': { people: ['boy', 'girl'] },
    '両親': { people: ['father', 'mother'] }, '家族': { people: ['father', 'mother', 'boy', 'girl'] },
    '友達': { people: ['friend', 'friendMan'] }, '泥棒': 'thief',
    '笑う': 'laugh', '泣く': 'cry', '怒る': 'angry', '眠い': 'sleepy', '驚く': 'surprised', '嬉しい': 'happy',
    '舌': 'tongue', 'ひげ': 'beard', '髪': 'hair', '指': 'finger', '筋肉': 'muscle', '脳': 'brain',
    '食べる': 'eat', '飲む': 'drinking', '聞く': 'listen', '読む': 'reading', '走る': 'run', '書く': 'write',
    '寝る': 'sleep', 'ハイキング': 'hiking',

    // weather, sky and land
    '暑い': 'hot', '寒い': 'cold', '空': 'sky', '晴れ': 'sunny', '夕方': 'sunset', '台風': 'typhoon',
    '地震': 'earthquake', '砂漠': 'desert', '畑': 'field', '丘': 'hill', '泉': 'fountain', '枝': 'branch',
    '芽': 'sprout', '植物': 'plant', '松': 'pine', '稲': 'riceplant', '羽根': 'feather',

    // at home
    'トイレ': 'toilet', 'お風呂': 'bath', 'シャワー': 'shower', '台所': 'kitchen', '庭': 'garden',
    'カーテン': 'curtain', '棚': 'shelves', '引き出し': 'drawer', 'ソファー': 'sofa', '布団': 'futon',
    '畳': 'tatami', '毛布': 'blanket', 'タオル': 'towel', '水道': 'faucet', 'スイッチ': 'lightswitch',
    '湯': 'onsen', '壁': 'brickwall', '柵': 'fence', 'ベンチ': 'bench', '家具': { items: ['chair', 'table', 'bed'] },
    '金庫': 'safe', '機械': 'gears', '道具': 'tools', '鎖': 'chain', '縄': 'rope', '板': 'plank', '籠': 'basket',
    '体重': 'scale', 'ライター': 'lighter', 'たばこ': 'cigarette', 'マッチ': 'match',

    // clothes and things you carry
    '服': 'hanger', '背広': 'suit', 'ワイシャツ': 'dressshirt', 'ドレス': 'dress', 'ポケット': 'pocket',
    'サンダル': 'sandals', 'ハンカチ': 'handkerchief', 'アクセサリー': 'necklace', '宝石': 'gem', '化粧': 'lipstick',
    '荷物': 'luggage', '小包': 'parcel', '袋': 'paperbag', 'カード': 'card', 'パスポート': 'passport',
    '硬貨': 'coin', '札': 'banknote', '宝': 'treasure', '刀': 'katana', '盾': 'shield',

    // paper, school and hobbies
    '紙': 'paper', '雑誌': 'magazine', '漫画': 'manga', 'アルバム': 'album', 'ボールペン': 'ballpoint',
    '万年筆': 'fountainpen', '筆': 'brush', 'インク': 'inkbottle', 'テープ': 'tape', 'タイプライター': 'typewriter',
    '黒板': 'blackboard', 'レコード': 'record', '音': 'speaker', '楽器': { items: ['guitar', 'piano'] },
    'バイオリン': 'violin', '笛': 'recorder', 'ゲーム': 'game', 'スポーツ': { items: ['soccer', 'baseball'] },
    'スキー': 'ski', 'スケート': 'skate', '柔道': 'judogi', 'キャンプ': 'campfire', 'パーティー': 'balloons',
    'クリスマス': 'xmastree', 'お祭り': 'lantern', 'ペット': 'fishbowl', '動物園': { items: ['elephant', 'monkey', 'tiger'] },

    // places and getting around
    '道': 'road', '町': 'town', '村': 'village', 'ホテル': 'hotel', 'レストラン': 'restaurant', '大学': 'gradcap',
    'ビル': 'skyscraper', '地下鉄': 'subway', '交差点': 'crossroads', 'エスカレーター': 'escalator',
    '空港': 'airport', '教会': 'church', '寺': 'temple', '工場': 'factory', '駐車場': 'parking', '劇場': 'theater',
    'スーパー': 'cart', '鐘': 'templebell', '衛星': 'satellite',
  };
})(typeof window !== 'undefined' ? window : globalThis);
