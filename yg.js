/* YouGlish embed: search any phrase/word in real YouTube videos without leaving the app.
 * Uses YouGlish's JavaScript widget API (youglish.com/public/emb/widget.js). Needs internet. */
(() => {
  const SN = window.SN, A = SN.A;
  let loader = null, counter = 0;
  function loadYG() {
    if (window.YG && window.YG.Widget) return Promise.resolve();
    if (loader) return loader;
    loader = new Promise((resolve, reject) => {
      const t = setTimeout(() => { loader = null; reject(new Error('timeout')); }, 12000);
      window.onYouglishAPIReady = () => { clearTimeout(t); resolve(); };
      const s = document.createElement('script');
      s.src = 'https://youglish.com/public/emb/widget.js'; s.charset = 'utf-8'; s.async = true;
      s.onerror = () => { clearTimeout(t); loader = null; reject(new Error('load')); };
      document.head.appendChild(s);
    });
    return loader;
  }
  const fallbackLink = q => `<a href="https://youglish.com/pronounce/${encodeURIComponent(q)}/english/us" target="_blank" rel="noopener noreferrer">Open on YouGlish ↗</a>`;
  A.ygsearch = async el => {
    const box = el.closest('.ygbox'), q = box.querySelector('.yg-q').value.trim(), out = box.querySelector('.yg-out'), status = box.querySelector('.yg-status');
    if (!q) { SN.toast('Type what to search.'); return; }
    status.innerHTML = 'Searching real videos…';
    try { await loadYG(); } catch (e) { status.innerHTML = `Couldn't load YouGlish (offline or blocked). ${fallbackLink(q)}`; return; }
    try {
      if (!box._yg) {
        out.id = 'yg-w-' + (++counter);
        box._yg = new window.YG.Widget(out.id, {
          width: Math.max(260, Math.min(600, out.clientWidth || 320)),
          components: 9, // search box + captions (per YouGlish's documented example)
          events: { onFetchDone: ev => { status.innerHTML = ev && ev.totalResult === 0 ? `No videos found for that search. ${fallbackLink(q)}` : ''; } },
        });
      }
      box._yg.fetch(q, 'english', 'us');
      status.innerHTML = '';
    } catch (e) { status.innerHTML = `Search failed. ${fallbackLink(q)}`; }
  };
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('yg-q')) { e.preventDefault(); e.target.blur(); A.ygsearch(e.target); }
  });
})();
