// Sorts the JLPT vocabulary (vocabulary-data.js) into themed groups of
// 20–50 words for the Vocab Quiz page, and writes vocab-groups.js.
//
// Usage (kuromoji isn't a site dependency, so install it just for this):
//   npm install --no-save kuromoji
//   node scripts/build_vocab_groups.mjs
//
// Each word gets a part of speech from kuromoji (verb, い/な adjective,
// adverb, 〜する noun, noun…). Nouns (and 〜する nouns) are then sorted into
// a topic by the words in their English meaning (THEMES, first match wins);
// verbs and adjectives get their own themes the same way. Whatever matches
// nothing lands in a catch-all for its part of speech. Words placed wrongly
// go in scripts/vocab_group_overrides.json as "漢字|かな": "theme id".
//
// Per level, a theme with fewer than MIN words is folded into its `into`
// theme; one with more than MAX is split, in あいうえお order, into equal
// parts of at most MAX.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const kuromoji = require(path.join(ROOT, 'node_modules/kuromoji'));

globalThis.window = globalThis;
require(path.join(ROOT, 'vocabulary-data.js'));
const VOCAB = globalThis.VOCAB_DATA;
const LEVELS = ['n5', 'n4', 'n3'];
const MIN = 20;
const MAX = 50;

const OVERRIDES = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/vocab_group_overrides.json'), 'utf8'));

// Words in a meaning: "To meet, to see" → match /\bmeet\b/ etc.
// (Lookarounds rather than \b, so "café" works.)
const words = list => new RegExp(`(?<![a-zà-ÿ'-])(?:${list.join('|')})(?![a-zà-ÿ-])`, 'i');

// Themes in the order they are tried. `pos` limits a theme to some parts of
// speech; `into` is where a level's too-small theme goes.
const NOUNS = ['noun', 'suru', 'pronoun'];
const THEMES = [
  // ── Nouns ──
  { id: 'numbers', en: 'Numbers & counting', ja: '数', pos: NOUNS, into: 'time',
    re: words(['two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'hundred', 'thousand', 'ten thousand', 'million', 'number', 'numbers', 'counter', 'half', 'double', 'quantity', 'amount', 'count', 'calculation', 'percent', 'total', 'sum', 'average', 'zero', 'digit', 'figure', 'times']) },
  { id: 'time', en: 'Time & the calendar', ja: '時', pos: ['noun', 'suru', 'adverb'], into: 'numbers',
    re: words(['day', 'days', 'week', 'weeks', 'month', 'months', 'year', 'years', 'time', 'times', 'hour', 'hours', 'minute', 'minutes', 'morning', 'noon', 'afternoon', 'evening', 'night', 'tonight', 'today', 'tomorrow', 'yesterday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'spring', 'summer', 'autumn', 'winter', 'season', 'date', 'calendar', 'birthday', 'holiday', 'holidays', 'vacation', 'weekend', 'ago', 'future', 'past', 'period', 'century', 'era', "o'clock", 'schedule', 'midnight', 'dawn', 'daytime', 'age', 'lifetime', 'annual', 'daily', 'monthly', 'beginning of the year', 'end of the year', 'new year', 'fall', 'previous', 'next', 'last']) },
  { id: 'food', en: 'Food & drink', ja: '食べ物', pos: NOUNS, into: 'home',
    re: words(['whiskey', 'whisky', 'cream', 'soba', 'grain', 'grains', 'cereal', 'rice-plant', 'nutrition', 'plum', 'feed', 'provisions', 'cocktail', 'lunch', 'bento', 'food', 'foods', 'meal', 'meals', 'breakfast', 'lunch', 'dinner', 'supper', 'rice', 'bread', 'meat', 'beef', 'pork', 'chicken', 'vegetable', 'vegetables', 'fruit', 'fruits', 'tea', 'coffee', 'sugar', 'salt', 'soy', 'sauce', 'egg', 'eggs', 'cake', 'candy', 'sweets', 'confectionery', 'beer', 'wine', 'sake', 'alcohol', 'liquor', 'milk', 'juice', 'soup', 'noodles', 'taste', 'flavor', 'flavour', 'apple', 'orange', 'banana', 'lemon', 'potato', 'onion', 'carrot', 'butter', 'cheese', 'curry', 'dish', 'cuisine', 'cooking', 'chopsticks', 'menu', 'dessert', 'snack', 'bean', 'beans', 'tofu', 'flour', 'dough', 'wheat', 'sushi', 'drink', 'drinks', 'beverage', 'salad', 'steak', 'sandwich', 'sandwiches', 'hamburger', 'grapes', 'foodstuff', 'foodstuffs', 'groceries', 'feast', 'box lunch', 'lunch box', 'appetite', 'hunger', 'bowl', 'oil', 'vinegar', 'pepper', 'spice', 'grape', 'strawberry', 'peach', 'melon', 'mandarin', 'tangerine', 'ham', 'sausage', 'jam', 'ice cream', 'chocolate', 'restaurant', 'cafeteria', 'dining', 'café', 'cafe', 'coffee shop', 'kitchen', 'recipe', 'ingredient', 'ingredients', 'fried', 'boiled', 'raw', 'pot', 'pan']) },
  // "One" alone would catch "one's", "one another": only with a numeral.
  { id: 'numbers-one', en: 'Numbers & counting', ja: '数', pos: NOUNS, into: 'numbers', test: w => /[一]/.test(w.kanji) && /^one\b(?!'s| another)/i.test(w.meaning) },
  { id: 'body', en: 'Body & health', ja: '体・健康', pos: NOUNS, into: 'people',
    re: words(['cancer', 'organ', 'lung', 'lungs', 'thigh', 'nerve', 'nerves', 'headache', 'symptoms', 'nearsightedness', 'gargling', 'gargle', 'massage', 'physiology', 'fat', 'germ', 'germs', 'bacteria', 'virus', 'stomachache', 'toothache', 'burn', 'bruise', 'naked', 'sex', 'nutrition', 'vitamin', 'allergy', 'body', 'head', 'face', 'eye', 'eyes', 'ear', 'ears', 'nose', 'mouth', 'tooth', 'teeth', 'hand', 'hands', 'arm', 'arms', 'leg', 'legs', 'foot', 'feet', 'finger', 'fingers', 'toe', 'hair', 'neck', 'back', 'stomach', 'belly', 'abdomen', 'blood', 'skin', 'bone', 'bones', 'throat', 'shoulder', 'shoulders', 'knee', 'chest', 'breast', 'lip', 'lips', 'tongue', 'brain', 'muscle', 'nail', 'illness', 'disease', 'sickness', 'sick', 'ill', 'cold', 'flu', 'fever', 'medicine', 'medical', 'doctor', 'physician', 'hospital', 'nurse', 'injury', 'wound', 'health', 'healthy', 'pain', 'ache', 'cough', 'patient', 'dentist', 'clinic', 'breath', 'breathing', 'sweat', 'tears', 'sleep', 'eyesight', 'eyebrow', 'cheek', 'chin', 'forehead', 'wrist', 'elbow', 'hip', 'waist', 'thumb', 'cure', 'surgery', 'surgical operation', 'medical treatment', 'symptom', 'pulse', 'birth', 'death', 'life', 'die', 'beard', 'height', 'weight', 'figure']) },
  { id: 'kosoado', en: 'Question & pointing words (こそあど)', ja: 'こそあど', pos: ['pronoun', 'function', 'adverb', 'noun'], into: 'function',
    kana: /^(?:(?:こ|そ|あ|ど)(?:れ|こ|ちら|っち|の|んな|う|れら)|あそこ|どなた|いつ|いくつ|いくら|なぜ|なに|なん|だれ|どうして|どうやって|どこか|なにか|なにも|なんでも|だれか|いつか|いつでも|いつまでも)$/ },
  { id: 'people', en: 'People & family', ja: '人・家族', pos: NOUNS, into: 'feelings',
    re: words(['landlord', 'landlady', 'housewife', 'boys', 'girls', 'persons', 'deceased', 'inhabitants', 'helper', 'ms', 'single', 'alone', 'captain', 'coach', 'poet', 'painter', 'reporter', 'bureaucrat', 'ambassador', 'chairman', 'governor', 'farmers', 'passenger', 'passengers', 'ogre', 'all members', 'crowd', 'pickpocket', 'father', 'mother', 'brother', 'brothers', 'sister', 'sisters', 'siblings', 'parent', 'parents', 'child', 'children', 'son', 'daughter', 'husband', 'wife', 'family', 'grandfather', 'grandmother', 'grandchild', 'uncle', 'aunt', 'cousin', 'baby', 'man', 'men', 'woman', 'women', 'boy', 'girl', 'person', 'people', 'friend', 'friends', 'adult', 'elder', 'lover', 'boyfriend', 'girlfriend', 'mr', 'mrs', 'miss', 'guest', 'guests', 'neighbor', 'neighbour', 'stranger', 'everybody', 'everyone', 'somebody', 'someone', 'myself', 'yourself', 'himself', 'herself', 'oneself', 'self', 'relative', 'relatives', 'couple', 'mama', 'papa', 'mom', 'dad', 'i', 'me', 'you', 'he', 'she', 'we', 'they', 'him', 'her', 'who', 'youth', 'young', 'old person', 'elderly', 'gentleman', 'lady', 'kid', 'twins', 'ancestor', 'descendant', 'host', 'hostess', 'acquaintance', 'companion', 'colleague', 'partner', 'fellow', 'citizen', 'resident', 'inhabitant', 'human', 'humans', 'mankind', 'individual', 'senior', 'junior', 'master', 'owner', 'name', 'surname', 'foreigner', 'foreigners', 'marriage', 'married', 'wedding', 'bride', 'groom']) },
  { id: 'jobs', en: 'Jobs & work', ja: '仕事', pos: NOUNS, into: 'money',
    re: words(['work', 'job', 'jobs', 'occupation', 'profession', 'career', 'employee', 'employer', 'employment', 'company', 'office', 'business', 'boss', 'salary', 'wage', 'wages', 'meeting', 'conference', 'factory', 'industry', 'industrial', 'product', 'products', 'production', 'manufacture', 'trade', 'commerce', 'sales', 'customer', 'customers', 'client', 'manager', 'management', 'staff', 'clerk', 'labor', 'labour', 'worker', 'workers', 'teacher', 'police', 'policeman', 'officer', 'engineer', 'secretary', 'president', 'director', 'chief', 'leader', 'member', 'section', 'department', 'post', 'position', 'duty', 'task', 'retirement', 'interview', 'contract', 'firm', 'enterprise', 'shopkeeper', 'merchant', 'trader', 'farmer', 'agriculture', 'fisherman', 'carpenter', 'cook', 'chef', 'driver', 'pilot', 'soldier', 'lawyer', 'scholar', 'scientist', 'artist', 'writer', 'author', 'singer', 'actor', 'actress', 'player', 'specialist', 'expert', 'professional', 'part-time', 'overtime', 'transfer', 'promotion']) },
  { id: 'money', en: 'Money & shops', ja: 'お金・買い物', pos: NOUNS, into: 'jobs',
    re: words(['stock', 'stocks', 'currency', 'profits', 'demand', 'supply', 'safe', 'luxury', 'luxurious', 'value', 'used', 'second-hand', 'landlord', 'money', 'yen', 'price', 'prices', 'cost', 'costs', 'fee', 'fees', 'fare', 'shop', 'shops', 'store', 'stores', 'shopping', 'sale', 'bank', 'pay', 'payment', 'tax', 'taxes', 'budget', 'expense', 'expenses', 'expenditure', 'income', 'profit', 'loss', 'wallet', 'purse', 'cash', 'coin', 'coins', 'bill', 'receipt', 'discount', 'savings', 'saving', 'deposit', 'loan', 'debt', 'rent', 'rich', 'poor', 'poverty', 'wealth', 'fortune', 'property', 'goods', 'merchandise', 'purchase', 'market', 'supermarket', 'greengrocer', 'grocer', 'barber', "barber's", 'bookseller', 'shop', 'shops', 'department store', 'bookstore', 'economy', 'economic', 'finance', 'financial', 'gift', 'souvenir', 'stamp', 'ticket', 'tickets', 'free', 'cheap', 'expensive']) },
  { id: 'school', en: 'School & study', ja: '学校・勉強', pos: NOUNS, into: 'communication',
    re: words(['verb', 'noun', 'adjective', 'particle', 'particles', 'proverb', 'font', 'annotation', 'edition', 'yearbook', 'quarterly', 'philosophy', 'questionnaire', 'academic', 'qualifications', 'credit', 'teachings', 'truth', 'riddle', 'school', 'student', 'students', 'pupil', 'class', 'classes', 'classroom', 'lesson', 'lessons', 'study', 'studies', 'homework', 'exam', 'examination', 'test', 'question', 'questions', 'answer', 'university', 'college', 'grade', 'textbook', 'dictionary', 'book', 'books', 'notebook', 'word', 'words', 'sentence', 'sentences', 'kanji', 'hiragana', 'katakana', 'language', 'english', 'grammar', 'reading', 'writing', 'meaning', 'mathematics', 'math', 'arithmetic', 'science', 'history', 'geography', 'subject', 'research', 'knowledge', 'lecture', 'course', 'education', 'practice', 'example', 'exercise', 'problem', 'essay', 'composition', 'phrase', 'vocabulary', 'pronunciation', 'character', 'characters', 'letter', 'letters', 'alphabet', 'translation', 'graduation', 'entrance', 'admission', 'semester', 'term', 'blackboard', 'pencil', 'eraser', 'ruler', 'library', 'kindergarten', 'scholarship', 'seminar', 'thesis', 'theory', 'experiment', 'mistake', 'error', 'review', 'preparation', 'learning', 'literature', 'chapter', 'page', 'line', 'paragraph', 'text', 'grades', 'score', 'quiz', 'principal', 'professor', 'tutor']) },
  { id: 'communication', en: 'Talk, news & media', ja: '話・ニュース', pos: NOUNS, into: 'culture',
    re: words(['talk', 'conversation', 'story', 'stories', 'speech', 'opinion', 'opinions', 'discussion', 'debate', 'report', 'reports', 'information', 'news', 'newspaper', 'magazine', 'advertisement', 'advertising', 'broadcast', 'broadcasting', 'program', 'programme', 'message', 'mail', 'e-mail', 'telephone', 'phone', 'call', 'reply', 'response', 'greeting', 'greetings', 'thanks', 'apology', 'excuse', 'request', 'invitation', 'promise', 'joke', 'rumor', 'rumour', 'lie', 'secret', 'consultation', 'advice', 'explanation', 'announcement', 'notice', 'notification', 'contact', 'communication', 'introduction', 'description', 'expression', 'statement', 'comment', 'complaint', 'praise', 'conversation', 'dialogue', 'voice', 'sound', 'noise', 'internet', 'website', 'telegram', 'diary', 'announcer', 'media', 'press', 'article', 'title', 'topic', 'subject matter', 'word of mouth', 'postcard', 'envelope', 'post office', 'parcel', 'package', 'letter box', 'mailbox', 'signal', 'sign']) },
  { id: 'culture', en: 'Hobbies, sport & culture', ja: '趣味・文化', pos: NOUNS, into: 'communication',
    re: words(['go', 'harp', 'flute', 'christmas', 'camp', 'picnic', 'skate', 'skates', 'racket', 'yacht', 'tent', 'hunting', 'zen', 'classic', 'classics', 'statue', 'bow', 'decoration', 'treasure', 'prize', 'trophy', 'music', 'song', 'songs', 'singing', 'movie', 'movies', 'film', 'films', 'picture', 'pictures', 'painting', 'drawing', 'art', 'arts', 'photo', 'photograph', 'photography', 'sport', 'sports', 'game', 'games', 'party', 'festival', 'hobby', 'hobbies', 'piano', 'guitar', 'violin', 'instrument', 'dance', 'dancing', 'baseball', 'soccer', 'football', 'tennis', 'golf', 'swimming', 'skiing', 'ski', 'concert', 'theater', 'theatre', 'drama', 'tragedy', 'comedy', 'novel', 'novels', 'poem', 'poetry', 'culture', 'cultural', 'tradition', 'traditional', 'religion', 'religious', 'temple', 'shrine', 'god', 'gods', 'buddha', 'buddhism', 'christian', 'church', 'magic', 'conjuring', 'toy', 'toys', 'team', 'match', 'tournament', 'competition', 'contest', 'race', 'victory', 'defeat', 'champion', 'record', 'records', 'player', 'audience', 'spectator', 'spectators', 'stage', 'performance', 'show', 'exhibition', 'museum', 'zoo', 'amusement', 'entertainment', 'fun', 'play', 'leisure', 'travel', 'trip', 'journey', 'tour', 'sightseeing', 'hiking', 'camping', 'fishing', 'climbing', 'walk', 'stroll', 'jogging', 'exercise', 'training', 'gym', 'pool', 'ball', 'cards', 'chess', 'manga', 'comic', 'comics', 'cartoon', 'animation', 'anime', 'video', 'camera', 'fireworks', 'celebration', 'ceremony', 'custom', 'customs', 'manners', 'etiquette', 'tea ceremony', 'flower arrangement', 'kimono', 'calligraphy', 'origami', 'sumo', 'judo', 'karate']) },
  { id: 'clothes', en: 'Clothes & things you carry', ja: '服・持ち物', pos: NOUNS, into: 'home',
    re: words(['clothes', 'clothing', 'garment', 'shirt', 'skirt', 'trousers', 'pants', 'shoes', 'shoe', 'sock', 'socks', 'hat', 'cap', 'coat', 'jacket', 'sweater', 'dress', 'kimono', 'button', 'buttons', 'pocket', 'uniform', 'fabric', 'cloth', 'necktie', 'tie', 'belt', 'glove', 'gloves', 'ring', 'necklace', 'suit', 'underwear', 'pajamas', 'boots', 'sandal', 'sandals', 'overcoat', 'slippers', 'apron', 'collar', 'sleeve', 'sleeves', 'size', 'fashion', 'style', 'clothes', 'umbrella', 'bag', 'handbag', 'handkerchief', 'wallet', 'purse', 'watch', 'glasses', 'spectacles', 'sunglasses', 'accessory', 'jewel', 'jewelry', 'makeup', 'cosmetics', 'perfume', 'ribbon', 'thread', 'needle', 'yarn', 'wool', 'cotton', 'silk', 'leather']) },
  { id: 'home', en: 'Home & everyday things', ja: '家・物', pos: NOUNS, into: 'clothes',
    re: words(['card', 'can', 'chain', 'detergent', 'label', 'bench', 'typewriter', 'chime', 'mic', 'microphone', 'ink', 'board', 'paint', 'brake', 'hole', 'band', 'set', 'tidying up', 'house', 'home', 'room', 'rooms', 'door', 'window', 'windows', 'bath', 'bathroom', 'toilet', 'lavatory', 'bed', 'desk', 'chair', 'table', 'key', 'box', 'clock', 'telephone', 'television', 'tv', 'radio', 'computer', 'lamp', 'light', 'refrigerator', 'fridge', 'stove', 'heater', 'shelf', 'wall', 'walls', 'floor', 'ceiling', 'roof', 'stairs', 'staircase', 'garden', 'yard', 'furniture', 'pen', 'paper', 'soap', 'towel', 'bottle', 'mirror', 'tool', 'tools', 'scissors', 'knife', 'string', 'rope', 'broom', 'battery', 'machine', 'gas', 'electricity', 'water', 'cup', 'glass', 'plate', 'dish', 'tray', 'kettle', 'spoon', 'fork', 'basket', 'bucket', 'curtain', 'carpet', 'mat', 'tatami', 'cushion', 'pillow', 'blanket', 'futon', 'sheet', 'hanger', 'trash', 'garbage', 'rubbish', 'dust', 'cleaning', 'laundry', 'washing', 'housework', 'chores', 'apartment', 'mansion', 'building', 'gate', 'entrance', 'hall', 'corridor', 'veranda', 'balcony', 'fence', 'pole', 'post', 'nail', 'tape', 'glue', 'match', 'matches', 'candle', 'fan', 'air conditioner', 'vacuum cleaner', 'washing machine', 'tap', 'faucet', 'shower', 'bathtub', 'sink', 'drawer', 'closet', 'wardrobe', 'sofa', 'object', 'thing', 'things', 'goods', 'article', 'item', 'equipment', 'device', 'appliance', 'container', 'lid', 'cover', 'handle', 'switch', 'plug', 'wire', 'cord', 'pipe', 'ladder', 'locket', 'suitcase', 'screen', 'stereo', 'shelves', 'bell', 'rooftop', 'roof', 'fax', 'tobacco', 'cigarette', 'cigarettes', 'ashtray', 'bookshelf', 'bookcase', 'elevator', 'lift', 'escalator', 'lock', 'shower', 'cassette', 'recorder', 'tape recorder', 'stamp', 'tissue', 'toothbrush', 'toothpaste', 'comb', 'brush', 'razor', 'bowl', 'pot', 'pan', 'vase', 'doll', 'photo album', 'album', 'calendar']) },
  { id: 'places', en: 'Places & transport', ja: '場所・交通', pos: NOUNS, into: 'nature',
    re: words(['railway', 'railroad', 'walkway', 'basement', 'hometown', 'interior', 'moat', 'aviation', 'down-train', 'orient', 'hut', 'eaves', 'tropics', 'grave', 'come from', 'surroundings', 'horizon', 'out', 'place', 'places', 'town', 'city', 'village', 'country', 'countries', 'station', 'street', 'road', 'roads', 'bridge', 'park', 'hotel', 'library', 'museum', 'airport', 'port', 'harbor', 'harbour', 'area', 'region', 'district', 'map', 'address', 'exit', 'corner', 'neighborhood', 'neighbourhood', 'countryside', 'capital', 'prefecture', 'world', 'car', 'cars', 'automobile', 'bus', 'train', 'trains', 'taxi', 'bicycle', 'bike', 'airplane', 'aeroplane', 'plane', 'ship', 'boat', 'subway', 'passport', 'luggage', 'baggage', 'seat', 'traffic', 'truck', 'vehicle', 'vehicles', 'motorcycle', 'track', 'line', 'platform', 'stop', 'crossing', 'intersection', 'signal', 'parking', 'garage', 'gasoline', 'petrol', 'tunnel', 'highway', 'expressway', 'express', 'limited express', 'auditorium', 'africa', 'route', 'direction', 'directions', 'north', 'south', 'east', 'west', 'left', 'right', 'front', 'behind', 'inside', 'outside', 'near', 'nearby', 'far', 'distance', 'around', 'side', 'top', 'bottom', 'middle', 'center', 'centre', 'here', 'there', 'over there', 'where', 'abroad', 'overseas', 'foreign', 'japan', 'america', 'europe', 'asia', 'china', 'france', 'england', 'germany', 'tokyo', 'kyoto', 'osaka', 'downtown', 'suburbs', 'suburb', 'location', 'spot', 'site', 'square', 'plaza', 'land', 'lot', 'space', 'block', 'avenue', 'lane', 'path', 'sidewalk', 'pavement', 'department store', 'post office', 'police box', 'police station', 'church', 'temple', 'shrine', 'tower', 'castle', 'palace', 'embassy', 'office', 'hall', 'theater', 'cinema', 'stadium', 'field', 'ground', 'pool', 'zoo', 'farm', 'factory', 'hospital', 'school', 'shop', 'store', 'restaurant', 'café', 'cafe', 'bar', 'pub', 'inn', 'hostel', 'campsite', 'ride', 'drive', 'driving', 'travel', 'trip', 'transportation', 'transport', 'commuting', 'commute', 'departure', 'arrival', 'transfer', 'flight', 'voyage', 'accident']) },
  { id: 'nature', en: 'Nature, weather & animals', ja: '自然・動物', pos: NOUNS, into: 'science',
    re: words(['shell', 'shells', 'sprout', 'bud', 'lawn', 'sunlight', 'plum', 'rice-plant', 'feed', 'weather', 'rain', 'rainy', 'snow', 'wind', 'cloud', 'clouds', 'cloudy', 'sky', 'sun', 'sunshine', 'moon', 'star', 'stars', 'sea', 'ocean', 'river', 'mountain', 'mountains', 'lake', 'island', 'forest', 'woods', 'tree', 'trees', 'flower', 'flowers', 'blossom', 'blossoms', 'grass', 'leaf', 'leaves', 'branch', 'root', 'stone', 'rock', 'sand', 'earth', 'soil', 'mud', 'fire', 'ice', 'air', 'typhoon', 'earthquake', 'storm', 'thunder', 'lightning', 'temperature', 'climate', 'nature', 'natural', 'wave', 'waves', 'beach', 'coast', 'shore', 'universe', 'cosmos', 'environment', 'plant', 'plants', 'seed', 'seeds', 'animal', 'animals', 'dog', 'cat', 'bird', 'birds', 'fish', 'horse', 'cow', 'cattle', 'pig', 'insect', 'insects', 'bug', 'mouse', 'rat', 'rabbit', 'monkey', 'bear', 'elephant', 'tiger', 'lion', 'snake', 'frog', 'pet', 'wing', 'wings', 'tail', 'feather', 'feathers', 'sheep', 'goat', 'deer', 'fox', 'wolf', 'whale', 'dolphin', 'shark', 'turtle', 'crab', 'shrimp', 'octopus', 'squid', 'butterfly', 'bee', 'ant', 'mosquito', 'fly', 'spider', 'chicken', 'duck', 'crow', 'pigeon', 'nest', 'egg', 'shadow', 'shade', 'light', 'darkness', 'heat', 'cold', 'cool', 'warmth', 'humidity', 'fog', 'mist', 'frost', 'dew', 'rainbow', 'sunrise', 'sunset', 'scenery', 'landscape', 'view', 'valley', 'hill', 'cliff', 'cave', 'volcano', 'desert', 'pond', 'stream', 'waterfall', 'bay', 'gulf', 'continent', 'planet', 'globe', 'pollution', 'disaster', 'flood', 'drought', 'fruit', 'crop', 'crops', 'harvest', 'bamboo', 'pine', 'cherry', 'rose', 'moss', 'weed', 'weeds']) },
  { id: 'society', en: 'Society, politics & law', ja: '社会', pos: NOUNS, into: 'jobs',
    re: words(['diplomacy', 'constitution', 'nationality', 'delinquency', 'gun', 'bullet', 'shield', 'sword', 'damage', 'harm', 'morals', 'act', 'doctrine', 'civilization', 'candidacy', 'incident', 'event', 'uproar', 'obstacle', 'blockade', 'popularity', 'government', 'politics', 'political', 'politician', 'law', 'laws', 'legal', 'rule', 'rules', 'regulation', 'regulations', 'election', 'elections', 'vote', 'votes', 'ballot', 'citizen', 'citizens', 'society', 'social', 'nation', 'national', 'state', 'war', 'army', 'military', 'troops', 'weapon', 'weapons', 'crime', 'criminal', 'pickpocket', 'thief', 'theft', 'robbery', 'murder', 'court', 'judge', 'trial', 'rights', 'freedom', 'liberty', 'peace', 'international', 'public', 'official', 'policy', 'council', 'minister', 'parliament', 'diet', 'welfare', 'population', 'king', 'queen', 'emperor', 'prince', 'princess', 'kingdom', 'empire', 'revolution', 'democracy', 'independence', 'system', 'organization', 'organisation', 'association', 'union', 'party', 'group', 'committee', 'authority', 'power', 'control', 'order', 'security', 'safety', 'danger', 'protection', 'defense', 'defence', 'attack', 'enemy', 'ally', 'battle', 'fight', 'conflict', 'dispute', 'problem', 'issue', 'policy', 'reform', 'development', 'progress', 'history', 'historical', 'tradition', 'class', 'status', 'rank', 'responsibility', 'obligation', 'duty', 'crime', 'punishment', 'prison', 'arrest', 'investigation', 'evidence', 'witness', 'victim', 'insurance', 'pension', 'tax', 'budget', 'statistics', 'census', 'region', 'local', 'community', 'public opinion', 'majority', 'minority', 'equality', 'discrimination', 'protest', 'demonstration', 'strike', 'campaign', 'movement', 'cooperation', 'support', 'aid', 'assistance', 'contribution', 'volunteer', 'charity', 'donation', 'environment', 'pollution', 'disaster', 'accident', 'fire', 'rescue', 'emergency', 'police']) },
  { id: 'science', en: 'Science, colours & measures', ja: '科学・技術', pos: NOUNS, into: 'nature',
    re: words(['oxygen', 'acidity', 'magnetism', 'coal', 'atmosphere', 'nucleus', 'organic', 'resources', 'smoke', 'flame', 'ash', 'bubble', 'bubbles', 'swirl', 'automatic', 'species', 'second', 'plus', 'minus', 'level', 'rate', 'balance', 'science', 'scientific', 'technology', 'technique', 'technical', 'machine', 'machinery', 'engine', 'motor', 'electric', 'electrical', 'electricity', 'electronic', 'energy', 'power', 'chemical', 'chemistry', 'physics', 'biology', 'experiment', 'laboratory', 'data', 'computer', 'rocket', 'satellite', 'atom', 'atomic', 'nuclear', 'matter', 'substance', 'material', 'materials', 'metal', 'iron', 'steel', 'gold', 'silver', 'copper', 'plastic', 'glass', 'wood', 'wooden', 'paper', 'rubber', 'cloth', 'fiber', 'gas', 'liquid', 'solid', 'element', 'molecule', 'cell', 'gene', 'microscope', 'telescope', 'robot', 'invention', 'discovery', 'research', 'analysis', 'measurement', 'measure', 'length', 'width', 'depth', 'height', 'weight', 'volume', 'size', 'speed', 'velocity', 'pressure', 'temperature', 'degree', 'degrees', 'meter', 'metre', 'kilometer', 'kilogram', 'gram', 'liter', 'centimeter', 'millimeter', 'ton', 'mass', 'density', 'force', 'gravity', 'heat', 'radiation', 'wave', 'frequency', 'signal', 'circuit', 'battery', 'program', 'software', 'system', 'network', 'shape', 'form', 'circle', 'triangle', 'square', 'line', 'point', 'angle', 'surface', 'edge', 'curve', 'straight', 'diagonal', 'color', 'colour', 'red', 'blue', 'green', 'yellow', 'white', 'black', 'brown', 'purple', 'pink', 'gray', 'grey']) },
  { id: 'feelings', en: 'Feelings & character', ja: '気持ち・性格', pos: NOUNS, into: 'people',
    re: words(['malicious', 'selfishness', 'stinginess', 'charm', 'friendship', 'fame', 'shock', 'mentality', 'abuse', 'encounter', 'parting', 'relation', 'mutual', 'ideal', 'reputation', 'feeling', 'feelings', 'emotion', 'emotions', 'mind', 'heart', 'happiness', 'sadness', 'sorrow', 'grief', 'anger', 'rage', 'fear', 'terror', 'joy', 'delight', 'love', 'affection', 'hope', 'hopes', 'dream', 'dreams', 'worry', 'worries', 'anxiety', 'concern', 'surprise', 'pleasure', 'interest', 'curiosity', 'character', 'personality', 'nature', 'attitude', 'spirit', 'spirits', 'mood', 'courage', 'bravery', 'patience', 'pride', 'shame', 'embarrassment', 'memory', 'memories', 'thought', 'thoughts', 'idea', 'ideas', 'seriousness', 'earnestness', 'sincerity', 'honesty', 'kindness', 'cruelty', 'loneliness', 'jealousy', 'envy', 'regret', 'relief', 'satisfaction', 'dissatisfaction', 'disappointment', 'despair', 'confidence', 'self-confidence', 'trust', 'doubt', 'suspicion', 'belief', 'faith', 'wish', 'desire', 'will', 'intention', 'purpose', 'aim', 'goal', 'ambition', 'taste', 'preference', 'hate', 'hatred', 'dislike', 'tension', 'stress', 'fatigue', 'boredom', 'excitement', 'enthusiasm', 'passion', 'sympathy', 'pity', 'gratitude', 'respect', 'humor', 'humour', 'smile', 'laughter', 'tear', 'tears', 'cry', 'temper', 'conscience', 'manner', 'manners', 'behavior', 'behaviour', 'habit', 'habits', 'effort', 'efforts', 'diligence', 'laziness', 'talent', 'ability', 'skill', 'genius', 'wisdom', 'intelligence', 'common sense', 'sense', 'impression', 'experience', 'favorite', 'favourite', 'hobby']) },
  // ── Verbs ──
  { id: 'v-keigo', en: 'Verbs: polite (keigo) forms', ja: '敬語', pos: ['verb'], into: 'v-other',
    re: words(['honorific', 'humble', 'modest', 'extra-modest', 'polite']) },
  { id: 'v-move', en: 'Verbs: moving & going', ja: '動く', pos: ['verb'], into: 'v-other',
    re: words(['go', 'come', 'return', 'walk', 'run', 'enter', 'exit', 'leave', 'arrive', 'climb', 'ride', 'cross', 'pass', 'fly', 'swim', 'move', 'turn', 'stop', 'hurry', 'follow', 'approach', 'get off', 'get on', 'board', 'go out', 'come out', 'go back', 'come back', 'jump', 'fall', 'drop', 'rise', 'sink', 'float', 'roll', 'slide', 'slip', 'travel', 'escape', 'run away', 'chase', 'lead', 'guide', 'visit', 'attend', 'drive', 'step', 'proceed', 'advance', 'retreat', 'gather', 'assemble', 'meet', 'part', 'separate', 'wander', 'stroll', 'flow', 'pour', 'spread', 'reach', 'head', 'transfer', 'change trains', 'commute', 'go over', 'pass through', 'go around', 'hide', 'appear', 'disappear', 'emerge', 'sit', 'stand', 'lie', 'lie down', 'stay', 'remain', 'live', 'reside', 'dwell']) },
  { id: 'v-daily', en: 'Verbs: daily life', ja: '毎日', pos: ['verb'], into: 'v-hands',
    re: words(['eat', 'drink', 'sleep', 'wake', 'wake up', 'get up', 'wash', 'bathe', 'wear', 'put on', 'take off', 'cook', 'clean', 'brush', 'shower', 'dress', 'undress', 'boil', 'bake', 'fry', 'grill', 'roast', 'steam', 'cut', 'chop', 'peel', 'mix', 'stir', 'taste', 'smell', 'bite', 'chew', 'swallow', 'breathe', 'rest', 'relax', 'play', 'work', 'study', 'practice', 'practise', 'exercise', 'live', 'marry', 'get married', 'grow up', 'raise', 'bring up', 'take care', 'look after', 'shop', 'buy', 'sell', 'pay', 'spend', 'save', 'use', 'borrow', 'lend', 'rent', 'wait', 'meet', 'invite', 'celebrate', 'sing', 'dance', 'draw', 'paint', 'photograph', 'write', 'read', 'watch', 'see', 'look', 'listen', 'hear', 'smoke', 'get drunk', 'get tired', 'tire', 'heal', 'recover', 'catch a cold', 'hurt', 'injure', 'die', 'be born', 'live']) },
  { id: 'v-talk', en: 'Verbs: talking & thinking', ja: '話す・考える', pos: ['verb'], into: 'v-other',
    re: words(['say', 'speak', 'talk', 'tell', 'ask', 'answer', 'reply', 'call', 'shout', 'whisper', 'explain', 'teach', 'learn', 'think', 'know', 'understand', 'remember', 'recall', 'forget', 'believe', 'decide', 'consider', 'feel', 'wish', 'hope', 'want', 'like', 'love', 'hate', 'dislike', 'worry', 'be worried', 'be surprised', 'surprise', 'laugh', 'smile', 'cry', 'weep', 'get angry', 'scold', 'praise', 'apologize', 'apologise', 'thank', 'greet', 'introduce', 'promise', 'refuse', 'decline', 'agree', 'disagree', 'argue', 'quarrel', 'discuss', 'consult', 'advise', 'recommend', 'suggest', 'propose', 'complain', 'boast', 'lie', 'deceive', 'joke', 'tease', 'notice', 'realize', 'realise', 'recognize', 'guess', 'imagine', 'expect', 'doubt', 'suspect', 'judge', 'compare', 'choose', 'select', 'pick', 'plan', 'intend', 'mean', 'express', 'describe', 'report', 'inform', 'announce', 'translate', 'pronounce', 'memorize', 'memorise', 'review', 'prepare', 'investigate', 'examine', 'check', 'confirm', 'research', 'study', 'read', 'write', 'mutter', 'be troubled', 'be at a loss', 'be glad', 'rejoice', 'be pleased', 'fear', 'be afraid', 'be frightened', 'admire', 'respect', 'envy', 'trust', 'rely', 'depend', 'encourage', 'comfort', 'persuade', 'request', 'demand', 'order', 'command', 'forgive', 'pardon', 'allow', 'permit', 'forbid', 'prohibit', 'pray', 'regret', 'give up', 'be satisfied', 'be bored', 'be embarrassed', 'be ashamed', 'be moved', 'be impressed', 'be interested']) },
  { id: 'v-hands', en: 'Verbs: giving, taking & making', ja: 'あげる・もらう・作る', pos: ['verb'], into: 'v-daily',
    re: words(['give', 'receive', 'take', 'get', 'obtain', 'hold', 'carry', 'put', 'place', 'set', 'lend', 'borrow', 'send', 'deliver', 'catch', 'throw', 'pick', 'pick up', 'push', 'press', 'pull', 'open', 'close', 'shut', 'cut', 'break', 'make', 'create', 'build', 'construct', 'fix', 'repair', 'mend', 'collect', 'gather', 'tie', 'bind', 'wrap', 'hang', 'lift', 'raise', 'lower', 'drop', 'hit', 'strike', 'beat', 'kick', 'touch', 'grab', 'grasp', 'seize', 'squeeze', 'fold', 'bend', 'stretch', 'tear', 'rip', 'pour', 'fill', 'empty', 'add', 'remove', 'take out', 'put in', 'insert', 'attach', 'stick', 'paste', 'connect', 'join', 'separate', 'divide', 'share', 'distribute', 'hand over', 'return', 'exchange', 'replace', 'arrange', 'line up', 'pile', 'stack', 'cover', 'wrap', 'hide', 'keep', 'store', 'save', 'protect', 'guard', 'lose', 'find', 'search', 'look for', 'steal', 'rob', 'shoot', 'fire', 'turn on', 'turn off', 'switch', 'plant', 'grow', 'raise', 'dig', 'sweep', 'wipe', 'polish', 'paint', 'draw', 'sew', 'knit', 'weave', 'lock', 'unlock', 'decorate', 'prepare', 'serve', 'offer', 'present', 'win', 'earn', 'spend', 'waste', 'use', 'operate', 'handle', 'treat', 'deal with', 'manage', 'control', 'adjust', 'measure', 'weigh', 'count', 'calculate', 'mark', 'sign', 'print', 'copy', 'record', 'publish', 'produce', 'manufacture', 'invent', 'develop', 'design']) },
  { id: 'v-change', en: 'Verbs: change & how things are', ja: '変わる', pos: ['verb'], into: 'v-other',
    re: words(['become', 'change', 'increase', 'decrease', 'grow', 'end', 'finish', 'begin', 'start', 'continue', 'appear', 'disappear', 'vanish', 'exist', 'be', 'remain', 'stay', 'fit', 'suit', 'match', 'differ', 'fail', 'succeed', 'win', 'lose', 'happen', 'occur', 'spread', 'melt', 'freeze', 'burn', 'dry', 'get wet', 'fill', 'cool', 'warm', 'heat', 'boil', 'shine', 'glow', 'shake', 'tremble', 'swing', 'break', 'be broken', 'collapse', 'crumble', 'rot', 'decay', 'ripen', 'bloom', 'wither', 'fade', 'shrink', 'expand', 'swell', 'stretch', 'improve', 'worsen', 'get worse', 'get better', 'recover', 'be cured', 'gain', 'lack', 'be lacking', 'be enough', 'suffice', 'overflow', 'leak', 'mix', 'mingle', 'blend', 'differ', 'resemble', 'look like', 'be similar', 'be different', 'be decided', 'be settled', 'be found', 'be seen', 'be visible', 'be heard', 'be audible', 'be able', 'can', 'need', 'cost', 'take', 'last', 'pass', 'elapse', 'go out', 'turn', 'get dark', 'clear up', 'rain', 'snow', 'blow', 'thunder', 'strengthen', 'weaken', 'get strong', 'calm down', 'settle', 'stop', 'cease', 'be over', 'be done', 'be completed', 'complete', 'accumulate', 'pile up', 'gather', 'crowd', 'be crowded', 'be empty', 'be vacant', 'be full', 'be left', 'remain', 'be missing', 'be lost', 'get lost', 'be late', 'be in time', 'be delayed']) },
  // ── Adjectives ──
  { id: 'a-people', en: 'Describing people & feelings', ja: '人・気持ちの形容詞', pos: ['adj-i', 'adj-na'], into: 'a-things', firstOnly: true,
    re: words(['happy', 'glad', 'sad', 'lonely', 'kind', 'gentle', 'strict', 'busy', 'free', 'lazy', 'diligent', 'hardworking', 'clever', 'smart', 'wise', 'stupid', 'foolish', 'silly', 'honest', 'shy', 'cheerful', 'bright', 'angry', 'scary', 'frightening', 'afraid', 'fond', 'like', 'dislike', 'hate', 'skilled', 'skillful', 'good at', 'poor at', 'bad at', 'unskillful', 'healthy', 'well', 'sick', 'tired', 'painful', 'itchy', 'sleepy', 'hungry', 'thirsty', 'polite', 'rude', 'impolite', 'selfish', 'serious', 'earnest', 'calm', 'nervous', 'famous', 'beautiful', 'pretty', 'cute', 'lovely', 'ugly', 'handsome', 'young', 'old', 'elderly', 'rich', 'poor', 'proud', 'humble', 'brave', 'cowardly', 'gentle', 'violent', 'cruel', 'mean', 'nasty', 'nice', 'friendly', 'warmhearted', 'interesting', 'boring', 'fun', 'enjoyable', 'pleasant', 'unpleasant', 'uncomfortable', 'comfortable', 'embarrassing', 'embarrassed', 'ashamed', 'jealous', 'envious', 'grateful', 'thankful', 'sorry', 'worried', 'anxious', 'uneasy', 'relieved', 'satisfied', 'dissatisfied', 'disappointed', 'surprised', 'amazing', 'wonderful', 'terrible', 'awful', 'dreadful', 'pitiful', 'pitiable', 'poor', 'miserable', 'unfortunate', 'lucky', 'fortunate', 'unhappy', 'merry', 'lively', 'quiet', 'noisy', 'loud', 'talkative', 'reserved', 'stubborn', 'obstinate', 'patient', 'careful', 'careless', 'reckless', 'sincere', 'frank', 'generous', 'stingy', 'greedy', 'modest', 'arrogant', 'clumsy', 'able', 'capable', 'competent', 'efficient', 'talented', 'smart', 'wise', 'intelligent', 'ignorant', 'innocent', 'naive', 'mature', 'childish', 'adult', 'feminine', 'masculine', 'elegant', 'graceful', 'refined', 'vulgar', 'awkward', 'weird', 'strange', 'odd', 'eager', 'enthusiastic', 'keen', 'passionate', 'indifferent', 'sleepy', 'drunk', 'energetic', 'vigorous', 'spirited', 'tough', 'weak', 'strong', 'delicate', 'sensitive', 'emotional']) },
  { id: 'a-things', en: 'Describing things', ja: '物の形容詞', pos: ['adj-i', 'adj-na'], into: 'a-people' },
  // ── Adverbs and small words ──
  { id: 'adverbs', en: 'Adverbs & how much', ja: '副詞', pos: ['adverb'], into: 'function' },
  { id: 'function', en: 'Connecting words & set phrases', ja: '接続詞・あいさつ', pos: ['function'], into: 'adverbs' },
  // ── Catch-alls ──
  { id: 'v-other', en: 'Verbs: more verbs', ja: '動詞', pos: ['verb'], into: 'v-change' },
  { id: 'actions', en: 'Action nouns (〜する)', ja: '〜する', pos: ['suru'], into: 'abstract' },
  { id: 'abstract', en: 'Ideas & abstract words', ja: '名詞', pos: ['noun', 'suru', 'pronoun', 'adverb', 'function', 'adj-i', 'adj-na', 'verb'], into: null },
];
const THEME = Object.fromEntries(THEMES.map(t => [t.id, t]));

// ─── Part of speech ──────────────────────────────────────────────────────────

const tokenizer = await new Promise((resolve, reject) => {
  kuromoji.builder({ dicPath: path.join(ROOT, 'node_modules/kuromoji/dict') }).build((err, tk) => (err ? reject(err) : resolve(tk)));
});

function partOfSpeech(w) {
  const toks = tokenizer.tokenize(w.kanji.replace(/[～〜]/g, ''));
  const meaning = w.meaning.trim();
  // The English says "to …": a verb, whatever kuromoji makes of it.
  if (/^to /i.test(meaning) && /[うくぐすつぬぶむる]$/.test(w.kana)) return 'verb';
  const content = toks.filter(t => !['助詞', '助動詞', '記号'].includes(t.pos));
  const head = content[content.length - 1] || toks[toks.length - 1];
  switch (head.pos) {
    case '動詞': return toks.length === 1 ? 'verb' : (/^to /i.test(meaning) ? 'verb' : 'noun');
    case '形容詞': return 'adj-i';
    case '副詞': return 'adverb';
    case '連体詞': return 'function';
    case '接続詞': return 'function';
    case '感動詞': return 'function';
    case 'フィラー': return 'function';
    case '名詞':
      if (head.pos_detail_1 === '形容動詞語幹') return 'adj-na';
      if (head.pos_detail_1 === 'サ変接続') return 'suru';
      if (head.pos_detail_1 === '代名詞') return 'pronoun';
      if (head.pos_detail_1 === '副詞可能' && !/\b(day|week|month|year|time|morning|evening|night|today|tomorrow|yesterday|now)\b/i.test(meaning)) return 'adverb';
      return 'noun';
    default:
      return toks.length > 2 ? 'function' : 'noun';
  }
}

// ─── Sorting ─────────────────────────────────────────────────────────────────

const keyOf = w => `${w.kanji}|${w.kana}`;

// "Verbs: moving & going" + "Verbs: more verbs" → "Verbs: moving & going ·
// more verbs"; other themes are just listed.
function titleOf(ids) {
  const ens = ids.map(id => THEME[id].en);
  const prefix = ens.every(e => e.startsWith('Verbs: ')) ? 'Verbs: ' : '';
  return prefix + ens.map(e => (prefix ? e.slice(prefix.length) : e)).join(' · ');
}

function themeFor(w, pos) {
  const forced = OVERRIDES[keyOf(w)];
  if (forced) {
    if (!THEME[forced]) throw new Error(`Unknown theme ${forced} for ${keyOf(w)}`);
    return forced;
  }
  // The first sense decides when it matches something; otherwise the rest.
  const senses = w.meaning.replace(/\([^)]*\)/g, ' ').split(/[;,]/).map(s => s.trim()).filter(Boolean);
  const tries = [senses[0] || w.meaning, w.meaning.replace(/\([^)]*\)/g, ' ')];
  const byKana = THEMES.find(th => th.kana && th.pos.includes(pos) && th.kana.test(w.kana.replace(/[～〜]/g, '')));
  if (byKana) return byKana.id;
  const byTest = THEMES.find(th => th.test && th.pos.includes(pos) && th.test(w));
  if (byTest) return byTest.into;
  for (const [i, text] of tries.entries()) {
    const t = THEMES.find(th => th.re && th.pos.includes(pos) && !(i && th.firstOnly) && th.re.test(text));
    if (t) return t.id;
  }
  if (pos === 'verb') return 'v-other';
  if (pos === 'adj-i' || pos === 'adj-na') return 'a-things';
  if (pos === 'adverb') return 'adverbs';
  if (pos === 'function') return 'function';
  if (pos === 'pronoun') return 'people';
  if (pos === 'suru') return 'actions';
  return 'abstract';
}

const kanaOrder = (a, b) => a.kana.localeCompare(b.kana, 'ja');

const out = {};
const report = [];
for (const level of LEVELS) {
  const buckets = new Map(THEMES.map(t => [t.id, []]));
  const seen = new Set();
  for (const w of VOCAB[level]) {
    if (seen.has(keyOf(w))) continue;
    seen.add(keyOf(w));
    const pos = partOfSpeech(w);
    const theme = themeFor(w, pos);
    buckets.get(theme).push(Object.assign({ theme }, w));
  }
  if (process.argv.includes('--sizes')) {
    console.log(level, [...buckets].filter(([, l]) => l.length).map(([id, l]) => `${id} ${l.length}`).join(', '));
  }
  // Fold small themes into their `into`, until every non-empty one is big
  // enough (or has nowhere left to go).
  for (let pass = 0; pass < 5; pass++) {
    for (const t of THEMES) {
      const list = buckets.get(t.id);
      if (list.length && list.length < MIN && t.into) {
        buckets.get(t.into).push(...list);
        buckets.set(t.id, []);
      }
    }
  }
  // Two small themes that only had each other: shops, banks and offices
  // are places in town; anything else left goes to the catch-all.
  const LAST = { jobs: 'places', money: 'places', communication: 'school', culture: 'school', v: 'v-other', a: 'a-things' };
  for (const t of THEMES) {
    const list = buckets.get(t.id);
    if (!list.length || list.length >= MIN) continue;
    // A small catch-all is mostly little words like だけ, など and 一緒.
    const target = t.id === 'abstract' ? 'adverbs' : LAST[t.id] || LAST[t.id.split('-')[0]] || 'abstract';
    if (target === t.id) continue;
    buckets.get(target).push(...list);
    buckets.set(t.id, []);
  }
  const groups = [];
  for (const t of THEMES) {
    const list = buckets.get(t.id).sort(kanaOrder);
    if (!list.length) continue;
    // A theme that took in smaller ones is named after all of them, the
    // biggest first: "Jobs · Money & shopping".
    const counts = {};
    list.forEach(w => { counts[w.theme] = (counts[w.theme] || 0) + 1; });
    const parts_ = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || (a === t.id ? -1 : b === t.id ? 1 : 0));
    const title = parts_.length === 1 ? THEME[t.id].en : titleOf(parts_);
    const parts = Math.ceil(list.length / MAX);
    for (let p = 0; p < parts; p++) {
      const from = Math.round((p * list.length) / parts);
      const to = Math.round(((p + 1) * list.length) / parts);
      const slice = list.slice(from, to);
      groups.push({
        id: `${level}-${t.id}${parts > 1 ? `-${p + 1}` : ''}`,
        theme: t.id,
        title,
        part: parts > 1 ? p + 1 : 0,
        words: slice.map(keyOf),
      });
    }
    report.push(`${level} ${t.id.padEnd(14)} ${String(list.length).padStart(4)} → ${parts}`);
  }
  out[level] = groups;
}

const themes = Object.fromEntries(THEMES.map(t => [t.id, { en: t.en, ja: t.ja }]));
const banner = `// Generated by scripts/build_vocab_groups.mjs from vocabulary-data.js —
// don't edit by hand. The JLPT vocabulary in themed groups of 20–50 words
// for the Vocab Quiz page (vocab-quiz.html). Words are "漢字|かな" keys into
// VOCAB_DATA; each word is in exactly one group per level.
`;
const body = `(function (global) {
  'use strict';
  global.VOCAB_THEMES = ${JSON.stringify(themes, null, 2).replace(/\n/g, '\n  ')};
  global.VOCAB_GROUPS = {
${LEVELS.map(level => `    ${level}: [\n${out[level].map(g => `      ${JSON.stringify(g)},`).join('\n')}\n    ],`).join('\n')}
  };
})(typeof window !== 'undefined' ? window : globalThis);
`;
fs.writeFileSync(path.join(ROOT, 'vocab-groups.js'), banner + body);
if (process.argv.includes('--report')) console.log(report.join('\n'));
console.log(`Wrote vocab-groups.js: ${LEVELS.map(l => `${l} ${out[l].length} groups`).join(', ')}`);
