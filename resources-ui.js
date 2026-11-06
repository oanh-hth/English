/* Resources tab: external links (YouTube channels etc.). */
(() => {
  const SN = window.SN, esc = SN.esc;
  SN.VIEWS.resources = () => `
    <h1>Resources</h1>
    <p class="muted">Watch and listen outside the app to practice what you learn.</p>
    ${(window.RESOURCES || []).map(r => `<a class="item" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer"><span class="ico">${r.icon || '🔗'}</span><span class="grow"><h3>${esc(r.title)}</h3><span class="muted small">${esc(r.kind)} · ${esc(r.desc || '')}</span></span><span class="chev">↗</span></a>`).join('')}
    <h2>Heard a new word?</h2>
    <div class="card small"><p>While watching, save any word you don't know. It joins your review deck, with its own exercises.</p><button class="btn ghost sm" data-a="addWord">✍️ Save a word</button></div>`;
  SN.render();
})();
