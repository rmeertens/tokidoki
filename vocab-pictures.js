(function (global) {
  'use strict';

  // Pictures for the Vocabulary page's "Picture → Word" direction: a word's
  // kanji spelling (as in vocabulary-data.js) → the drawing that shows it,
  // using the illustrations from listening-art.js. A value is
  //   'name'                 an icon (ListeningArt.ICONS)
  //   { person: 'role' }     a person (ListeningArt.ROLES), or a full person spec
  //   { items: [...] }       several icons side by side
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
  };
})(typeof window !== 'undefined' ? window : globalThis);
