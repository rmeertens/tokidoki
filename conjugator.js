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
    'masu':        { name: 'Polite', nameJp: 'ます形', hint: 'Polite present/future', symbol: 'ます', color: '#2196F3', chapter: 3 },
    'masu-neg':    { name: 'Polite negative', nameJp: 'ません形', hint: 'Polite negative', symbol: 'ません', color: '#64B5F6', chapter: 3 },
    'masu-past':   { name: 'Polite past', nameJp: 'ました形', hint: 'Polite past', symbol: 'ました', color: '#FF9800', chapter: 4 },
    'masu-past-neg': { name: 'Polite past neg.', nameJp: 'ませんでした形', hint: 'Polite past negative', symbol: 'ませんでした', color: '#FFB74D', chapter: 4 },
    'te':          { name: 'Te-form', nameJp: 'て形', hint: 'Connecting / request', symbol: 'て', color: '#4CAF50', chapter: 6 },
    'nai':         { name: 'Plain negative', nameJp: 'ない形', hint: 'Plain negative', symbol: 'ない', color: '#F44336', chapter: 8 },
    'dict':        { name: 'Dictionary', nameJp: '辞書形', hint: 'Plain present/future', symbol: '辞書', color: '#9C27B0', chapter: 8 },
    'ta':          { name: 'Plain past', nameJp: 'た形', hint: 'Plain past', symbol: 'た', color: '#E65100', chapter: 9 },
    'nakatta':     { name: 'Plain past neg.', nameJp: 'なかった形', hint: 'Plain past negative', symbol: 'なかった', color: '#D32F2F', chapter: 9 },
    'tai':         { name: 'Want to', nameJp: 'たい形', hint: 'Want to ~', symbol: 'たい', color: '#E91E63', chapter: 11 },
    'potential':   { name: 'Potential', nameJp: '可能形', hint: 'Can do ~', symbol: '可能', color: '#7B1FA2', chapter: 13 },
    'volitional':  { name: 'Volitional', nameJp: '意向形', hint: "Let's ~ / intend to", symbol: '意向', color: '#00BCD4', chapter: 15 },
    'passive':     { name: 'Passive', nameJp: '受身形', hint: 'Is done to ~', symbol: '受身', color: '#1565C0', chapter: 21 },
    'causative':   { name: 'Causative', nameJp: '使役形', hint: 'Make/let do ~', symbol: '使役', color: '#EF6C00', chapter: 22 },
    'ba':          { name: 'Conditional', nameJp: 'ば形', hint: 'If ~', symbol: 'ば', color: '#009688', chapter: 22 },
    'causative-passive': { name: 'Causative-Passive', nameJp: '使役受身形', hint: 'Is made to do ~', symbol: '使役受身', color: '#BF360C', chapter: 23 },
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
    'adj-present':   { name: 'Present', nameJp: '現在形', hint: 'Plain present', symbol: 'だ/い', color: '#9C27B0', chapter: 5 },
    'adj-neg':       { name: 'Negative', nameJp: '否定形', hint: 'Plain negative', symbol: 'くない', color: '#F44336', chapter: 5 },
    'adj-past':      { name: 'Past', nameJp: '過去形', hint: 'Plain past', symbol: 'かった', color: '#FF9800', chapter: 9 },
    'adj-past-neg':  { name: 'Past negative', nameJp: '過去否定形', hint: 'Plain past negative', symbol: 'なかった', color: '#D32F2F', chapter: 9 },
    'adj-te':        { name: 'Te-form', nameJp: 'て形', hint: 'Connecting / and...', symbol: 'くて', color: '#4CAF50', chapter: 9 },
    'adj-adverb':    { name: 'Adverb', nameJp: '副詞形', hint: 'Adverb form', symbol: 'く/に', color: '#00BCD4', chapter: 10 },
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

  return {
    conjugate,
    conjugateAdjective,
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
