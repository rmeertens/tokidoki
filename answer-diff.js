// Character diff between a typed answer and the expected one, so a wrong
// answer can show exactly which characters were off. Each side comes back
// as a list of { ch, ok } — ok is false for a character that isn't part of
// the longest common subsequence (typed wrong/extra on the typed side,
// missing on the expected side). Spaces and punctuation are never marked.

(function (global) {
  const IGNORED = /[\s　。、．，,.!?！？「」]/;

  // Katakana and hiragana count as the same letter, as do full/half width forms.
  function fold(ch) {
    const c = ch.normalize('NFKC');
    return c.replace(/[ァ-ヶ]/g, k => String.fromCharCode(k.charCodeAt(0) - 0x60));
  }

  function diff(typed, expected) {
    const a = Array.from(String(typed));
    const b = Array.from(String(expected));
    const ai = a.map((ch, i) => i).filter(i => !IGNORED.test(a[i]));
    const bi = b.map((ch, i) => i).filter(i => !IGNORED.test(b[i]));
    const ak = ai.map(i => fold(a[i]));
    const bk = bi.map(i => fold(b[i]));

    // lcs[i][j] = LCS length of ak[i..] and bk[j..]
    const n = ak.length, m = bk.length;
    const lcs = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        lcs[i][j] = ak[i] === bk[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
      }
    }

    const typedSide = a.map(ch => ({ ch, ok: true }));
    const expectedSide = b.map(ch => ({ ch, ok: true }));
    ai.forEach(i => { typedSide[i].ok = false; });
    bi.forEach(j => { expectedSide[j].ok = false; });
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (ak[i] === bk[j]) {
        typedSide[ai[i]].ok = true;
        expectedSide[bi[j]].ok = true;
        i++; j++;
      } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
        i++;
      } else {
        j++;
      }
    }
    return { typed: typedSide, expected: expectedSide, common: lcs[0][0] };
  }

  // Of several accepted answers, the one closest to what was typed.
  function closest(typed, answers) {
    let best = answers[0], bestScore = -Infinity;
    for (const ans of answers) {
      const d = diff(typed, ans);
      const misses = d.typed.filter(c => !c.ok).length + d.expected.filter(c => !c.ok).length;
      if (-misses > bestScore) { bestScore = -misses; best = ans; }
    }
    return best;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  // Runs of characters, with mismatches wrapped in <span class="cls">.
  function toHtml(side, cls) {
    let html = '', run = '', runOk = true;
    const flush = () => {
      if (!run) return;
      html += runOk ? escapeHtml(run) : `<span class="${cls}">${escapeHtml(run)}</span>`;
      run = '';
    };
    for (const { ch, ok } of side) {
      if (ok !== runOk) { flush(); runOk = ok; }
      run += ch;
    }
    flush();
    return html;
  }

  global.AnswerDiff = { diff, closest, toHtml };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.AnswerDiff;
  }
})(typeof window !== 'undefined' ? window : globalThis);
