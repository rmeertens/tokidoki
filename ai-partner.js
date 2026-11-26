// blog-ai-language-partner.html: fills the learner's level, goals and focus
// into the "paste this link" message and the full instructions, and copies
// either one to the clipboard. Nothing is stored.
(function () {
  const $ = id => document.getElementById(id);
  const msg = $('aip-msg'), prompt = $('aip-prompt');
  if (!msg || !prompt) return;
  const PROMPT = prompt.textContent;
  const URL = 'https://tokidoki.meertens.dev/blog-ai-language-partner.html';
  const fields = { level: $('aip-level'), goals: $('aip-goals'), focus: $('aip-focus') };
  const val = k => fields[k].value.trim();

  function update() {
    const lines = [`Please read ${URL} and be my Japanese conversation partner, following the instructions on that page.`];
    if (val('level')) lines.push(`My level: ${val('level')}`);
    if (val('goals')) lines.push(`My goals: ${val('goals')}`);
    if (val('focus')) lines.push(`This week's focus: ${val('focus')}`);
    if (!val('level') || !val('goals')) lines.push('Ask me for anything that\'s missing before we start.');
    msg.textContent = lines.join('\n');
    prompt.textContent = PROMPT
      .replace('[LEVEL]', val('level') || '[LEVEL]')
      .replace('[GOALS]', val('goals') || '[GOALS]')
      .replace('[FOCUS]', val('focus') || '[FOCUS]');
  }
  Object.values(fields).forEach(f => f.addEventListener('input', update));
  update();

  function copy(text, status) {
    const done = () => { status.textContent = 'Copied ✓'; setTimeout(() => { status.textContent = ''; }, 2500); };
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { status.textContent = 'Select the text and copy it'; }
      ta.remove();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.hidden = false;
    btn.addEventListener('click', () => {
      const target = $(btn.dataset.copy);
      copy(target.textContent, btn.parentNode.querySelector('.aip-status'));
    });
  });
})();
