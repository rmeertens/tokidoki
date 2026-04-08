const Conjugator = (() => {

  const U_VERB_STEMS = {
    'う': { a: 'わ', i: 'い', e: 'え', o: 'お', te: 'って', ta: 'った' },
    'つ': { a: 'た', i: 'ち', e: 'て', o: 'と', te: 'って', ta: 'った' },
    'る': { a: 'ら', i: 'り', e: 'れ', o: 'ろ', te: 'って', ta: 'った' },
    'む': { a: 'ま', i: 'み', e: 'め', o: 'も', te: 'んで', ta: 'んだ' },
    'ぶ': { a: 'ば', i: 'び', e: 'べ', o: 'ぼ', te: 'んで', ta: 'んだ' },
    'ぬ': { a: 'な', i: 'に', e: 'ね', o: 'の', te: 'んで', ta: 'んだ' },
    'く': { a: 'か', i: 'き', e: 'け', o: 'こ', te: 'いて', ta: 'いた' },
    'ぐ': { a: 'が', i: 'ぎ', e: 'げ', o: 'ご', te: 'いで', ta: 'いだ' },
    'す': { a: 'さ', i: 'し', e: 'せ', o: 'そ', te: 'して', ta: 'した' },
  };

  function getUVerbBase(reading) {
    return reading.slice(0, -1);
  }

  function getUVerbEnding(reading) {
    return reading.slice(-1);
  }

  function getRuVerbStem(reading) {
    return reading.slice(0, -1);
  }

  function conjugate(verb, form) {
    const { reading, type } = verb;

    if (type === 'irregular') {
      return conjugateIrregular(verb, form);
    }
    if (type === 'ru') {
      return conjugateRu(reading, form);
    }
    return conjugateU(reading, form);
  }

  function conjugateU(reading, form) {
    const base = getUVerbBase(reading);
    const ending = getUVerbEnding(reading);
    const stems = U_VERB_STEMS[ending];

    if (!stems) return reading;

    const endsWithIku = reading.endsWith('いく') || reading.endsWith('ゆく');

    switch (form) {
      case 'masu':        return base + stems.i + 'ます';
      case 'masu-neg':    return base + stems.i + 'ません';
      case 'masu-past':   return base + stems.i + 'ました';
      case 'masu-past-neg': return base + stems.i + 'ませんでした';
      case 'te':
        if (endsWithIku) return reading.slice(0, -2) + 'いって';
        return base + stems.te;
      case 'ta':
        if (endsWithIku) return reading.slice(0, -2) + 'いった';
        return base + stems.ta;
      case 'nai':         return base + stems.a + 'ない';
      case 'nakatta':     return base + stems.a + 'なかった';
      case 'dict':        return reading;
      case 'tai':         return base + stems.i + 'たい';
      case 'potential':   return base + stems.e + 'る';
      case 'volitional':  return base + stems.o + 'う';
      case 'passive':     return base + stems.a + 'れる';
      case 'causative':   return base + stems.a + 'せる';
      case 'causative-passive': return base + stems.a + 'せられる';
      case 'ba':          return base + stems.e + 'ば';
      default:            return reading;
    }
  }

  function conjugateRu(reading, form) {
    const stem = getRuVerbStem(reading);

    switch (form) {
      case 'masu':        return stem + 'ます';
      case 'masu-neg':    return stem + 'ません';
      case 'masu-past':   return stem + 'ました';
      case 'masu-past-neg': return stem + 'ませんでした';
      case 'te':          return stem + 'て';
      case 'ta':          return stem + 'た';
      case 'nai':         return stem + 'ない';
      case 'nakatta':     return stem + 'なかった';
      case 'dict':        return reading;
      case 'tai':         return stem + 'たい';
      case 'potential':   return stem + 'られる';
      case 'volitional':  return stem + 'よう';
      case 'passive':     return stem + 'られる';
      case 'causative':   return stem + 'させる';
      case 'causative-passive': return stem + 'させられる';
      case 'ba':          return stem + 'れば';
      default:            return reading;
    }
  }

  function conjugateIrregular(verb, form) {
    const { reading } = verb;

    if (reading === 'する' || reading.endsWith('する')) {
      return conjugateSuru(reading, form);
    }
    if (reading === 'くる' || reading === 'きる' || reading.endsWith('くる')) {
      return conjugateKuru(reading, form);
    }
    if (reading === 'いく') {
      return conjugateU(reading, form);
    }

    return conjugateU(reading, form);
  }

  function conjugateSuru(reading, form) {
    const prefix = reading.slice(0, -2);

    switch (form) {
      case 'masu':        return prefix + 'します';
      case 'masu-neg':    return prefix + 'しません';
      case 'masu-past':   return prefix + 'しました';
      case 'masu-past-neg': return prefix + 'しませんでした';
      case 'te':          return prefix + 'して';
      case 'ta':          return prefix + 'した';
      case 'nai':         return prefix + 'しない';
      case 'nakatta':     return prefix + 'しなかった';
      case 'dict':        return reading;
      case 'tai':         return prefix + 'したい';
      case 'potential':   return prefix + 'できる';
      case 'volitional':  return prefix + 'しよう';
      case 'passive':     return prefix + 'される';
      case 'causative':   return prefix + 'させる';
      case 'causative-passive': return prefix + 'させられる';
      case 'ba':          return prefix + 'すれば';
      default:            return reading;
    }
  }

  function conjugateKuru(reading, form) {
    const prefix = reading.slice(0, -2);

    switch (form) {
      case 'masu':        return prefix + 'きます';
      case 'masu-neg':    return prefix + 'きません';
      case 'masu-past':   return prefix + 'きました';
      case 'masu-past-neg': return prefix + 'きませんでした';
      case 'te':          return prefix + 'きて';
      case 'ta':          return prefix + 'きた';
      case 'nai':         return prefix + 'こない';
      case 'nakatta':     return prefix + 'こなかった';
      case 'dict':        return reading;
      case 'tai':         return prefix + 'きたい';
      case 'potential':   return prefix + 'こられる';
      case 'volitional':  return prefix + 'こよう';
      case 'passive':     return prefix + 'こられる';
      case 'causative':   return prefix + 'こさせる';
      case 'causative-passive': return prefix + 'こさせられる';
      case 'ba':          return prefix + 'くれば';
      default:            return reading;
    }
  }

  const FORM_INFO = {
    'masu':        { name: 'Polite', nameJp: 'ます形', hint: 'Polite present/future', symbol: 'ます', color: '#2196F3', chapter: 3,
      explanation: '<p>The <strong>ます form</strong> is the standard polite form used in everyday Japanese conversation, at work, and with people you don\'t know well. It expresses present tense ("I do") and future tense ("I will do").</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Example</th></tr></thead><tbody>'
        + '<tr><td>Ru-verb</td><td>Drop <b>る</b>, add <b>ます</b></td><td>食べ<b>る</b> → 食べ<b>ます</b></td></tr>'
        + '<tr><td>U-verb</td><td>Change final kana to <b>い-row</b>, add <b>ます</b></td><td>書<b>く</b> → 書<b>きます</b><br>飲<b>む</b> → 飲<b>みます</b><br>話<b>す</b> → 話<b>します</b></td></tr>'
        + '<tr class="irr-row"><td>する</td><td>Irregular</td><td>する → <b>します</b></td></tr>'
        + '<tr class="irr-row"><td>くる</td><td>Irregular (vowel き)</td><td>くる → <b>きます</b></td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note">The い-row mapping for u-verbs: う→い, く→き, ぐ→ぎ, す→し, つ→ち, ぬ→に, ぶ→び, む→み, る→り</p>' },

    'masu-neg':    { name: 'Polite negative', nameJp: 'ません形', hint: 'Polite negative', symbol: 'ません', color: '#FF8F00', chapter: 3,
      explanation: '<p>The <strong>polite negative</strong> uses the same verb stem as the ます form, but adds <b>ません</b> instead. It means "do not do" in polite speech. An alternative modern form is ない + です (e.g. 食べないです).</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Example</th></tr></thead><tbody>'
        + '<tr><td>Ru-verb</td><td>Drop <b>る</b>, add <b>ません</b></td><td>食べる → 食べ<b>ません</b></td></tr>'
        + '<tr><td>U-verb</td><td>Change final kana to <b>い-row</b>, add <b>ません</b></td><td>書く → 書き<b>ません</b><br>飲む → 飲み<b>ません</b></td></tr>'
        + '<tr class="irr-row"><td>する</td><td>Irregular</td><td>する → <b>しません</b></td></tr>'
        + '<tr class="irr-row"><td>くる</td><td>Irregular (vowel き)</td><td>くる → <b>きません</b></td></tr>'
        + '</tbody></table>' },

    'masu-past':   { name: 'Polite past', nameJp: 'ました形', hint: 'Polite past', symbol: 'ました', color: '#00ACC1', chapter: 4,
      explanation: '<p>The <strong>polite past</strong> expresses "did" in polite speech. It uses the same verb stem as the ます form, but adds <b>ました</b>.</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Example</th></tr></thead><tbody>'
        + '<tr><td>Ru-verb</td><td>Drop <b>る</b>, add <b>ました</b></td><td>食べる → 食べ<b>ました</b></td></tr>'
        + '<tr><td>U-verb</td><td>Change final kana to <b>い-row</b>, add <b>ました</b></td><td>書く → 書き<b>ました</b><br>飲む → 飲み<b>ました</b></td></tr>'
        + '<tr class="irr-row"><td>する</td><td>Irregular</td><td>する → <b>しました</b></td></tr>'
        + '<tr class="irr-row"><td>くる</td><td>Irregular (vowel き)</td><td>くる → <b>きました</b></td></tr>'
        + '</tbody></table>' },

    'masu-past-neg': { name: 'Polite past neg.', nameJp: 'ませんでした形', hint: 'Polite past negative', symbol: 'ませんでした', color: '#AB47BC', chapter: 4,
      explanation: '<p>The <strong>polite past negative</strong> means "did not do" in polite speech. Same stem as ます form, add <b>ませんでした</b>. An alternative is なかったです.</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Example</th></tr></thead><tbody>'
        + '<tr><td>Ru-verb</td><td>Drop <b>る</b>, add <b>ませんでした</b></td><td>食べる → 食べ<b>ませんでした</b></td></tr>'
        + '<tr><td>U-verb</td><td>Change final kana to <b>い-row</b>, add <b>ませんでした</b></td><td>書く → 書き<b>ませんでした</b></td></tr>'
        + '<tr class="irr-row"><td>する</td><td>Irregular</td><td>する → <b>しませんでした</b></td></tr>'
        + '<tr class="irr-row"><td>くる</td><td>Irregular (vowel き)</td><td>くる → <b>きませんでした</b></td></tr>'
        + '</tbody></table>' },
    'te':          { name: 'Te-form', nameJp: 'て形', hint: 'Connecting / request', symbol: 'て', color: '#4CAF50', chapter: 6,
      explanation: '<p>The <strong>て form</strong> is one of the most important conjugations. It connects actions ("I ate <em>and</em> went home"), makes requests (〜てください), and is the basis for many grammar patterns like 〜ている (ongoing action), 〜てもいい (permission), and 〜てはいけない (prohibition).</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Example</th></tr></thead><tbody>'
        + '<tr><td>Ru-verb</td><td>Drop <b>る</b>, add <b>て</b></td><td>食べる → 食べ<b>て</b></td></tr>'
        + '<tr class="irr-row"><td>する</td><td>Irregular</td><td>する → <b>して</b></td></tr>'
        + '<tr class="irr-row"><td>くる</td><td>Irregular (vowel き)</td><td>くる → <b>きて</b></td></tr>'
        + '</tbody></table>'
        + '<p style="margin-top:10px">U-verbs follow <strong>sound-change rules</strong> based on the dictionary-form ending:</p>'
        + '<table class="conj-table"><thead><tr><th>Ending</th><th>Change</th><th>Example</th></tr></thead><tbody>'
        + '<tr><td>う, つ, る</td><td>→ <b>って</b></td><td>買<b>う</b> → 買<b>って</b>、待<b>つ</b> → 待<b>って</b>、取<b>る</b> → 取<b>って</b></td></tr>'
        + '<tr><td>む, ぶ, ぬ</td><td>→ <b>んで</b></td><td>飲<b>む</b> → 飲<b>んで</b>、遊<b>ぶ</b> → 遊<b>んで</b>、死<b>ぬ</b> → 死<b>んで</b></td></tr>'
        + '<tr><td>く</td><td>→ <b>いて</b></td><td>書<b>く</b> → 書<b>いて</b></td></tr>'
        + '<tr><td>ぐ</td><td>→ <b>いで</b></td><td>泳<b>ぐ</b> → 泳<b>いで</b></td></tr>'
        + '<tr><td>す</td><td>→ <b>して</b></td><td>話<b>す</b> → 話<b>して</b></td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note"><strong>Exception:</strong> 行く → 行<b>って</b> (not 行いて)</p>' },

    'nai':         { name: 'Plain negative', nameJp: 'ない形', hint: 'Plain negative', symbol: 'ない', color: '#F44336', chapter: 8,
      explanation: '<p>The <strong>ない form</strong> is the plain/casual negative ("don\'t do"). It is used in casual speech and inside many grammar patterns like 〜ないでください (please don\'t), 〜なければならない (must do), and 〜ないと (if not).</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Example</th></tr></thead><tbody>'
        + '<tr><td>Ru-verb</td><td>Drop <b>る</b>, add <b>ない</b></td><td>食べる → 食べ<b>ない</b></td></tr>'
        + '<tr><td>U-verb</td><td>Change final kana to <b>あ-row</b>, add <b>ない</b></td><td>書<b>く</b> → 書<b>かない</b><br>飲<b>む</b> → 飲<b>まない</b><br>話<b>す</b> → 話<b>さない</b></td></tr>'
        + '<tr class="irr-row"><td>する</td><td>Irregular</td><td>する → <b>しない</b></td></tr>'
        + '<tr class="irr-row"><td>くる</td><td>Irregular (vowel こ)</td><td>くる → <b>こない</b></td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note"><strong>Exception:</strong> Verbs ending in <b>う</b> change to <b>わ</b> (not あ): 買<b>う</b> → 買<b>わない</b></p>'
        + '<p class="conj-note">The あ-row mapping: く→か, ぐ→が, す→さ, つ→た, ぬ→な, ぶ→ば, む→ま, る→ら, う→<b>わ</b></p>' },

    'dict':        { name: 'Dictionary', nameJp: '辞書形', hint: 'Plain present/future', symbol: '辞書', color: '#9C27B0', chapter: 8,
      explanation: '<p>The <strong>dictionary form</strong> (辞書形) is the base form of the verb — the form you find in dictionaries. It functions as the plain present/future tense in casual speech and appears inside many grammar constructions.</p>'
        + '<table class="conj-table"><thead><tr><th>Usage</th><th>Pattern</th><th>Example</th></tr></thead><tbody>'
        + '<tr><td>Casual present</td><td>Verb (dict)</td><td>明日行<b>く</b>。 (I\'ll go tomorrow.)</td></tr>'
        + '<tr><td>Ability</td><td>Verb + ことができる</td><td>日本語を話す<b>ことができる</b></td></tr>'
        + '<tr><td>Intention</td><td>Verb + つもり</td><td>来年留学する<b>つもり</b></td></tr>'
        + '<tr><td>Before ~</td><td>Verb + 前に</td><td>寝る<b>前に</b>歯を磨く</td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note">Ru-verbs always end in <b>る</b> (with an え or い vowel sound before it). U-verbs can end in any of the う-row kana: う, く, ぐ, す, つ, ぬ, ぶ, む, る.</p>' },

    'ta':          { name: 'Plain past', nameJp: 'た形', hint: 'Plain past', symbol: 'た', color: '#FDD835', chapter: 9,
      explanation: '<p>The <strong>た form</strong> is the plain past tense ("did"). It follows the exact same sound-change rules as the て form, but uses <b>た/だ</b> instead of <b>て/で</b>. It is also used in the pattern 〜たことがある (have experienced).</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Example</th></tr></thead><tbody>'
        + '<tr><td>Ru-verb</td><td>Drop <b>る</b>, add <b>た</b></td><td>食べる → 食べ<b>た</b></td></tr>'
        + '<tr class="irr-row"><td>する</td><td>Irregular</td><td>する → <b>した</b></td></tr>'
        + '<tr class="irr-row"><td>くる</td><td>Irregular (vowel き)</td><td>くる → <b>きた</b></td></tr>'
        + '</tbody></table>'
        + '<p style="margin-top:10px">U-verb sound changes (same pattern as て form, with た/だ):</p>'
        + '<table class="conj-table"><thead><tr><th>Ending</th><th>Change</th><th>Example</th></tr></thead><tbody>'
        + '<tr><td>う, つ, る</td><td>→ <b>った</b></td><td>買う → 買<b>った</b>、待つ → 待<b>った</b>、取る → 取<b>った</b></td></tr>'
        + '<tr><td>む, ぶ, ぬ</td><td>→ <b>んだ</b></td><td>飲む → 飲<b>んだ</b>、遊ぶ → 遊<b>んだ</b></td></tr>'
        + '<tr><td>く</td><td>→ <b>いた</b></td><td>書く → 書<b>いた</b></td></tr>'
        + '<tr><td>ぐ</td><td>→ <b>いだ</b></td><td>泳ぐ → 泳<b>いだ</b></td></tr>'
        + '<tr><td>す</td><td>→ <b>した</b></td><td>話す → 話<b>した</b></td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note"><strong>Exception:</strong> 行く → 行<b>った</b> (not 行いた)</p>' },
    'nakatta':     { name: 'Plain past neg.', nameJp: 'なかった形', hint: 'Plain past negative', symbol: 'なかった', color: '#D32F2F', chapter: 9,
      explanation: '<p>The <strong>plain past negative</strong> means "didn\'t do." To form it, first make the ない form, then replace <b>ない</b> with <b>なかった</b>. This works the same way for all verb types since it builds on the ない form.</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>ない form</th><th>なかった form</th></tr></thead><tbody>'
        + '<tr><td>Ru-verb</td><td>食べ<b>ない</b></td><td>食べ<b>なかった</b></td></tr>'
        + '<tr><td>U-verb (く)</td><td>書か<b>ない</b></td><td>書か<b>なかった</b></td></tr>'
        + '<tr><td>U-verb (む)</td><td>飲ま<b>ない</b></td><td>飲ま<b>なかった</b></td></tr>'
        + '<tr><td>U-verb (う)</td><td>買わ<b>ない</b></td><td>買わ<b>なかった</b></td></tr>'
        + '<tr class="irr-row"><td>する</td><td>し<b>ない</b></td><td>し<b>なかった</b></td></tr>'
        + '<tr class="irr-row"><td>くる</td><td>こ<b>ない</b></td><td>こ<b>なかった</b></td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note">Think of it as: ない conjugates like an い-adjective (ない → なかった, just like 高い → 高かった).</p>' },

    'tai':         { name: 'Want to', nameJp: 'たい形', hint: 'Want to ~', symbol: 'たい', color: '#E91E63', chapter: 11,
      explanation: '<p>The <strong>たい form</strong> expresses the speaker\'s desire to do something ("I want to ~"). It uses the same stem as the ます form and adds <b>たい</b>. The たい form itself conjugates like an い-adjective (たくない, たかった, etc.).</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Example</th></tr></thead><tbody>'
        + '<tr><td>Ru-verb</td><td>Drop <b>る</b>, add <b>たい</b></td><td>食べる → 食べ<b>たい</b></td></tr>'
        + '<tr><td>U-verb</td><td>Change final kana to <b>い-row</b>, add <b>たい</b></td><td>書く → 書き<b>たい</b><br>飲む → 飲み<b>たい</b></td></tr>'
        + '<tr class="irr-row"><td>する</td><td>Irregular</td><td>する → <b>したい</b></td></tr>'
        + '<tr class="irr-row"><td>くる</td><td>Irregular (vowel き)</td><td>くる → <b>きたい</b></td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note">Only used for the speaker\'s own desires (first person). For third person, use 〜たがっている. The object particle を can optionally become が with たい.</p>' },

    'potential':   { name: 'Potential', nameJp: '可能形', hint: 'Can do ~', symbol: '可能', color: '#7B1FA2', chapter: 13,
      explanation: '<p>The <strong>potential form</strong> expresses ability — "can do" or "be able to." The result is a ru-verb, so it conjugates further like a ru-verb (e.g. 書ける → 書けない, 書けます).</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Example</th></tr></thead><tbody>'
        + '<tr><td>Ru-verb</td><td>Drop <b>る</b>, add <b>られる</b></td><td>食べる → 食べ<b>られる</b></td></tr>'
        + '<tr><td>U-verb</td><td>Change final kana to <b>え-row</b>, add <b>る</b></td><td>書<b>く</b> → 書<b>ける</b><br>飲<b>む</b> → 飲<b>める</b><br>話<b>す</b> → 話<b>せる</b></td></tr>'
        + '<tr class="irr-row"><td>する</td><td>Irregular (completely changes)</td><td>する → <b>できる</b></td></tr>'
        + '<tr class="irr-row"><td>くる</td><td>Irregular (vowel こ)</td><td>くる → <b>こられる</b></td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note">In casual speech, ru-verb <b>られる</b> is often shortened to <b>れる</b> (ら抜き言葉): 食べられる → 食べれる. This is very common but considered informal.</p>'
        + '<p class="conj-note">The え-row mapping: う→え, く→け, ぐ→げ, す→せ, つ→て, ぬ→ね, ぶ→べ, む→め, る→れ</p>' },

    'volitional':  { name: 'Volitional', nameJp: '意向形', hint: "Let's ~ / intend to", symbol: '意向', color: '#00BCD4', chapter: 15,
      explanation: '<p>The <strong>volitional form</strong> expresses "let\'s do" or "I shall do." It is the plain equivalent of ましょう. It is also used with と思う to express intention (〜ようと思う = "I think I\'ll…").</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Example</th></tr></thead><tbody>'
        + '<tr><td>Ru-verb</td><td>Drop <b>る</b>, add <b>よう</b></td><td>食べる → 食べ<b>よう</b></td></tr>'
        + '<tr><td>U-verb</td><td>Change final kana to <b>お-row</b>, add <b>う</b></td><td>書<b>く</b> → 書<b>こう</b><br>飲<b>む</b> → 飲<b>もう</b><br>話<b>す</b> → 話<b>そう</b></td></tr>'
        + '<tr class="irr-row"><td>する</td><td>Irregular</td><td>する → <b>しよう</b></td></tr>'
        + '<tr class="irr-row"><td>くる</td><td>Irregular (vowel こ)</td><td>くる → <b>こよう</b></td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note">The お-row mapping: う→お, く→こ, ぐ→ご, す→そ, つ→と, ぬ→の, ぶ→ぼ, む→も, る→ろ</p>' },

    'passive':     { name: 'Passive', nameJp: '受身形', hint: 'Is done to ~', symbol: '受身', color: '#1565C0', chapter: 21,
      explanation: '<p>The <strong>passive form</strong> means "is done (to someone)." Japanese passive has two uses: <em>direct passive</em> (the subject receives the action) and <em>indirect/suffering passive</em> (the subject is adversely affected). The result is a ru-verb.</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Example</th></tr></thead><tbody>'
        + '<tr><td>Ru-verb</td><td>Drop <b>る</b>, add <b>られる</b></td><td>食べる → 食べ<b>られる</b></td></tr>'
        + '<tr><td>U-verb</td><td>Change final kana to <b>あ-row</b>, add <b>れる</b></td><td>書<b>く</b> → 書<b>かれる</b><br>飲<b>む</b> → 飲<b>まれる</b><br>取<b>る</b> → 取<b>られる</b></td></tr>'
        + '<tr class="irr-row"><td>する</td><td>Irregular</td><td>する → <b>される</b></td></tr>'
        + '<tr class="irr-row"><td>くる</td><td>Irregular (vowel こ)</td><td>くる → <b>こられる</b></td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note"><strong>Exception:</strong> U-verbs ending in <b>う</b> change to <b>わ</b>: 買<b>う</b> → 買<b>われる</b></p>'
        + '<p class="conj-note">Note: ru-verb passive (られる) looks identical to the potential form. Context determines which meaning is intended.</p>' },

    'causative':   { name: 'Causative', nameJp: '使役形', hint: 'Make/let do ~', symbol: '使役', color: '#EF6C00', chapter: 22,
      explanation: '<p>The <strong>causative form</strong> means "make someone do" or "let someone do." Whether it means forcing or allowing depends on context and the particles used. The result is a ru-verb.</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Example</th></tr></thead><tbody>'
        + '<tr><td>Ru-verb</td><td>Drop <b>る</b>, add <b>させる</b></td><td>食べる → 食べ<b>させる</b></td></tr>'
        + '<tr><td>U-verb</td><td>Change final kana to <b>あ-row</b>, add <b>せる</b></td><td>書<b>く</b> → 書<b>かせる</b><br>飲<b>む</b> → 飲<b>ませる</b><br>読<b>む</b> → 読<b>ませる</b></td></tr>'
        + '<tr class="irr-row"><td>する</td><td>Irregular</td><td>する → <b>させる</b></td></tr>'
        + '<tr class="irr-row"><td>くる</td><td>Irregular (vowel こ)</td><td>くる → <b>こさせる</b></td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note"><strong>Exception:</strong> U-verbs ending in <b>う</b> change to <b>わ</b>: 買<b>う</b> → 買<b>わせる</b></p>'
        + '<p class="conj-note">"Make": 先生は学生に本を読ま<b>せた</b> (The teacher made the students read a book.)<br>"Let": お母さんは子供にゲームをさ<b>せた</b> (Mom let the child play games.)</p>' },

    'ba':          { name: 'Conditional', nameJp: 'ば形', hint: 'If ~', symbol: 'ば', color: '#009688', chapter: 22,
      explanation: '<p>The <strong>ば conditional</strong> means "if ~." It expresses general or hypothetical conditions. It is often used for advice (〜ばいい = "it would be good if") and habitual conditions.</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Example</th></tr></thead><tbody>'
        + '<tr><td>Ru-verb</td><td>Drop <b>る</b>, add <b>れば</b></td><td>食べる → 食べ<b>れば</b></td></tr>'
        + '<tr><td>U-verb</td><td>Change final kana to <b>え-row</b>, add <b>ば</b></td><td>書<b>く</b> → 書<b>けば</b><br>飲<b>む</b> → 飲<b>めば</b><br>話<b>す</b> → 話<b>せば</b></td></tr>'
        + '<tr class="irr-row"><td>する</td><td>Irregular</td><td>する → <b>すれば</b></td></tr>'
        + '<tr class="irr-row"><td>くる</td><td>Irregular</td><td>くる → <b>くれば</b></td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note">Compare with other conditionals: 〜たら (more concrete/sequential), 〜と (automatic/natural result), 〜なら (topic-based condition).</p>' },

    'causative-passive': { name: 'Causative-Passive', nameJp: '使役受身形', hint: 'Is made to do ~', symbol: '使役受身', color: '#BF360C', chapter: 23,
      explanation: '<p>The <strong>causative-passive</strong> means "to be made to do" — the subject is forced to do something against their will. It combines the causative and passive forms. The result is a ru-verb.</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Example</th></tr></thead><tbody>'
        + '<tr><td>Ru-verb</td><td>Drop <b>る</b>, add <b>させられる</b></td><td>食べる → 食べ<b>させられる</b></td></tr>'
        + '<tr><td>U-verb</td><td>Change final kana to <b>あ-row</b>, add <b>せられる</b></td><td>書<b>く</b> → 書<b>かせられる</b><br>飲<b>む</b> → 飲<b>ませられる</b></td></tr>'
        + '<tr class="irr-row"><td>する</td><td>Irregular</td><td>する → <b>させられる</b></td></tr>'
        + '<tr class="irr-row"><td>くる</td><td>Irregular (vowel こ)</td><td>くる → <b>こさせられる</b></td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note"><strong>Short form (u-verbs only):</strong> In casual speech, u-verbs use a contracted form: あ-row + <b>される</b> instead of せられる.<br>書<b>く</b> → 書<b>かされる</b>、飲<b>む</b> → 飲<b>まされる</b>、行<b>く</b> → 行<b>かされる</b></p>'
        + '<p class="conj-note"><strong>Exception:</strong> U-verbs ending in <b>す</b> cannot use the short form (話す → 話させられる only, not 話さされる).</p>' },
  };

  const ALL_FORMS = Object.keys(FORM_INFO);

  function getFormsForChapter(chapter) {
    return ALL_FORMS.filter(f => FORM_INFO[f].chapter <= chapter);
  }

  function getFormInfo(form) {
    return FORM_INFO[form] || ADJ_FORM_INFO[form] || null;
  }

  // ─── Adjective Conjugation ──────────────────────────────────────────────────

  const ADJ_FORM_INFO = {
    'adj-present':   { name: 'Present', nameJp: '現在形', hint: 'Plain present', symbol: 'だ/い', color: '#9C27B0', chapter: 5,
      explanation: '<p>The <strong>plain present</strong> of adjectives. い-adjectives are used as-is (they already end in い). な-adjectives add <b>だ</b> in plain form or <b>です</b> in polite form.</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Plain</th><th>Polite</th></tr></thead><tbody>'
        + '<tr><td>い-adjective</td><td>高<b>い</b></td><td>高<b>いです</b></td></tr>'
        + '<tr><td>な-adjective</td><td>静か<b>だ</b></td><td>静か<b>です</b></td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note">な-adjectives use <b>な</b> when modifying a noun (静か<b>な</b>人) but <b>だ</b>/<b>です</b> at the end of a sentence.</p>' },

    'adj-neg':       { name: 'Negative', nameJp: '否定形', hint: 'Plain negative', symbol: 'くない', color: '#F44336', chapter: 5,
      explanation: '<p>The <strong>negative</strong> of adjectives ("is not ~"). い-adjectives and な-adjectives follow different patterns.</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Plain</th><th>Polite</th></tr></thead><tbody>'
        + '<tr><td>い-adjective</td><td>Drop <b>い</b>, add <b>くない</b></td><td>高い → 高<b>くない</b></td><td>高<b>くないです</b></td></tr>'
        + '<tr><td>な-adjective</td><td>Add <b>じゃない</b></td><td>静か → 静か<b>じゃない</b></td><td>静か<b>じゃないです</b></td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note"><strong>Exception:</strong> いい (good) → <b>よくない</b> (not よくない). The irregular stem よ- is used for all conjugations of いい.<br>Similarly: かっこいい → <b>かっこよくない</b></p>' },

    'adj-past':      { name: 'Past', nameJp: '過去形', hint: 'Plain past', symbol: 'かった', color: '#FF9800', chapter: 9,
      explanation: '<p>The <strong>plain past</strong> of adjectives ("was ~"). い-adjectives change their ending; な-adjectives add だった.</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Plain</th><th>Polite</th></tr></thead><tbody>'
        + '<tr><td>い-adjective</td><td>Drop <b>い</b>, add <b>かった</b></td><td>高い → 高<b>かった</b></td><td>高<b>かったです</b></td></tr>'
        + '<tr><td>な-adjective</td><td>Add <b>だった</b></td><td>静か → 静か<b>だった</b></td><td>静か<b>でした</b></td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note"><strong>Exception:</strong> いい → <b>よかった</b>、かっこいい → <b>かっこよかった</b></p>' },

    'adj-past-neg':  { name: 'Past negative', nameJp: '過去否定形', hint: 'Plain past negative', symbol: 'なかった', color: '#D32F2F', chapter: 9,
      explanation: '<p>The <strong>past negative</strong> of adjectives ("was not ~"). Builds on the negative form by changing ない to なかった (since ない conjugates like an い-adjective).</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Plain</th><th>Polite</th></tr></thead><tbody>'
        + '<tr><td>い-adjective</td><td>Drop <b>い</b>, add <b>くなかった</b></td><td>高い → 高<b>くなかった</b></td><td>高<b>くなかったです</b></td></tr>'
        + '<tr><td>な-adjective</td><td>Add <b>じゃなかった</b></td><td>静か → 静か<b>じゃなかった</b></td><td>静か<b>じゃなかったです</b></td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note"><strong>Exception:</strong> いい → <b>よくなかった</b>、かっこいい → <b>かっこよくなかった</b></p>' },

    'adj-te':        { name: 'Te-form', nameJp: 'て形', hint: 'Connecting / and...', symbol: 'くて', color: '#4CAF50', chapter: 9,
      explanation: '<p>The <strong>て form</strong> of adjectives connects them in a sentence ("A and B," "A, so B"). It works like "and" for listing multiple descriptions.</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Example</th></tr></thead><tbody>'
        + '<tr><td>い-adjective</td><td>Drop <b>い</b>, add <b>くて</b></td><td>高い → 高<b>くて</b></td></tr>'
        + '<tr><td>な-adjective</td><td>Add <b>で</b></td><td>静か → 静か<b>で</b></td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note"><strong>Exception:</strong> いい → <b>よくて</b>、かっこいい → <b>かっこよくて</b></p>'
        + '<p class="conj-note">Example: この部屋は広<b>くて</b>、明るいです。(This room is spacious <em>and</em> bright.)<br>この町は静か<b>で</b>、きれいです。(This town is quiet <em>and</em> beautiful.)</p>' },

    'adj-adverb':    { name: 'Adverb', nameJp: '副詞形', hint: 'Adverb form', symbol: 'く/に', color: '#00BCD4', chapter: 10,
      explanation: '<p>The <strong>adverb form</strong> turns adjectives into adverbs that modify verbs. い-adjectives use <b>く</b> and な-adjectives use <b>に</b>.</p>'
        + '<table class="conj-table"><thead><tr><th>Type</th><th>Rule</th><th>Example sentence</th></tr></thead><tbody>'
        + '<tr><td>い-adjective</td><td>Drop <b>い</b>, add <b>く</b></td><td>早い → 早<b>く</b>走る (run quickly)</td></tr>'
        + '<tr><td>な-adjective</td><td>Add <b>に</b></td><td>静か → 静か<b>に</b>話す (speak quietly)</td></tr>'
        + '</tbody></table>'
        + '<p class="conj-note"><strong>Exception:</strong> いい → <b>よく</b> (よく分かる = understand well)、かっこいい → <b>かっこよく</b></p>'
        + '<p class="conj-note">The adverb form of い-adjectives also appears in the pattern 〜くなる (to become ~): 暖か<b>く</b>なる (to become warm).</p>' },
  };

  const ADJ_ALL_FORMS = Object.keys(ADJ_FORM_INFO);

  function getAdjFormsForChapter(chapter) {
    return ADJ_ALL_FORMS.filter(f => ADJ_FORM_INFO[f].chapter <= chapter);
  }

  function conjugateAdjective(adj, form) {
    const { reading, type } = adj;

    if (type === 'i-adj') {
      return conjugateIAdj(reading, form);
    }
    if (type === 'na-adj') {
      return conjugateNaAdj(reading, form);
    }
    return reading;
  }

  function conjugateIAdj(reading, form) {
    const isIi = reading === 'いい';
    const isKakkoii = reading === 'かっこいい';

    let stem;
    if (isIi) stem = 'よ';
    else if (isKakkoii) stem = 'かっこよ';
    else stem = reading.slice(0, -1);

    switch (form) {
      case 'adj-present':   return reading;
      case 'adj-neg':       return stem + 'くない';
      case 'adj-past':      return stem + 'かった';
      case 'adj-past-neg':  return stem + 'くなかった';
      case 'adj-te':        return stem + 'くて';
      case 'adj-adverb':    return stem + 'く';
      default:              return reading;
    }
  }

  function conjugateNaAdj(reading, form) {
    switch (form) {
      case 'adj-present':   return reading + 'だ';
      case 'adj-neg':       return reading + 'じゃない';
      case 'adj-past':      return reading + 'だった';
      case 'adj-past-neg':  return reading + 'じゃなかった';
      case 'adj-te':        return reading + 'で';
      case 'adj-adverb':    return reading + 'に';
      default:              return reading;
    }
  }

  function isHiragana(ch) {
    const code = ch.charCodeAt(0);
    return code >= 0x3041 && code <= 0x309F;
  }

  function getOkurigana(str) {
    let i = str.length - 1;
    while (i >= 0 && isHiragana(str[i])) {
      i--;
    }
    return str.slice(i + 1);
  }

  function conjugateKanji(verb, form) {
    const { kanji, reading } = verb;
    if (!kanji || kanji === reading) return null;

    const okurigana = getOkurigana(kanji);
    if (!okurigana || okurigana.length >= reading.length) return null;

    const kanjiBase = kanji.slice(0, kanji.length - okurigana.length);
    const readingBaseLen = reading.length - okurigana.length;

    const isAdj = verb.type === 'i-adj' || verb.type === 'na-adj';
    const hiraganaConj = isAdj ? conjugateAdjective(verb, form) : conjugate(verb, form);
    return kanjiBase + hiraganaConj.slice(readingBaseLen);
  }

  function conjugateAdjKanji(adj, form) {
    return conjugateKanji(adj, form);
  }

  return {
    conjugate,
    conjugateAdjective,
    conjugateKanji,
    conjugateAdjKanji,
    getFormsForChapter,
    getAdjFormsForChapter,
    getFormInfo,
    FORM_INFO,
    ALL_FORMS,
    ADJ_FORM_INFO,
    ADJ_ALL_FORMS,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Conjugator;
}
