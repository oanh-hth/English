// End-to-end test on an iPhone-sized screen. Needs Playwright and a static server on :8123 (python3 -m http.server 8123).
// YouTube and Anthropic are mocked, so no network is used.
const { chromium, devices } = require('playwright');
const FX = require('./fixtures.js');
const SHOT = process.env.SHOT_DIR || '';

const FAKE_YT = `
window.__yt = { calls: [], players: 0 };
window.YT = { Player: class {
  constructor(id, o) { window.__yt.players++; this.t = 0; this.playing = false; this.at = 0; const el = document.getElementById(id);
    if (el) { const f = document.createElement('iframe'); f.src = 'about:blank'; f.title = 'fake player'; el.replaceWith(f); f.id = id; }
    setTimeout(() => o.events.onReady({}), 20); }
  seekTo(s) { window.__yt.calls.push(['seek', s]); this.t = s; this.at = Date.now(); }
  playVideo() { window.__yt.calls.push(['play']); this.playing = true; this.at = Date.now(); this.base = this.t; }
  pauseVideo() { window.__yt.calls.push(['pause']); this.playing = false; }
  getCurrentTime() { return this.playing ? this.base + (Date.now() - this.at) / 1000 * (this.rate || 1) * 8 : this.t; }
  setPlaybackRate(r) { this.rate = r; window.__yt.calls.push(['rate', r]); }
  destroy() { window.__yt.calls.push(['destroy']); }
} };
setTimeout(() => window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady(), 10);`;

const AI = { phrases: [{ text: 'keep the change', meaning: 'let the cashier keep the extra money' }, { text: 'to go please', meaning: 'take the order away' }, { text: 'invented phrase not in video', meaning: 'x' }],
  words: [{ text: 'barista', pos: 'n', meaning: 'a person who makes coffee' }], quiz: [{ q: 'What does the speaker say about paying cash?', options: ['Keep the change', 'Use a card', 'Pay later', 'Ask for a bill'], answer: 0 }, { q: 'Who asks "here or to go"?', options: ['The barista', 'The cashier', 'A friend', 'The manager'], answer: 0 }] };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'], reducedMotion: 'reduce' }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text()) && errs.push('console: ' + m.text()));
  await p.route('https://www.youtube.com/iframe_api', r => r.fulfill({ contentType: 'application/javascript', body: FAKE_YT }));
  await p.route('https://i.ytimg.com/**', r => r.fulfill({ contentType: 'image/gif', body: Buffer.from('R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', 'base64') }));
  let aiReq = null;
  await p.route('https://api.anthropic.com/**', async r => {
    const q = r.request(); if (q.method() === 'OPTIONS') return r.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
    aiReq = JSON.parse(q.postData());
    r.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json' }, body: JSON.stringify({ id: 'm', type: 'message', role: 'assistant', model: 'x', content: [{ type: 'text', text: 'Here you go:\n' + JSON.stringify(AI) }], stop_reason: 'end_turn', stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } }) });
  });
  const out = {}; const shot = n => SHOT && p.screenshot({ path: `${SHOT}/${n}.png` });
  await p.goto('http://localhost:8123/index.html');
  await shot('home-empty');
  // --- add a video with a link and a timed transcript
  await p.click('[data-a=openAdd]');
  await p.fill('#a-link', 'https://youtu.be/dQw4w9WgXcQ?si=abc'); await p.fill('#a-title', 'Coffee English');
  await p.fill('#a-text', FX.YT_COPY);
  out.preview = (await p.textContent('#a-prev')).slice(0, 60);
  await shot('add');
  await p.click('[data-a=createVideo]');
  await p.waitForSelector('#ytslot'); await p.waitForFunction(() => /Tap/.test(document.getElementById('pstat').textContent));
  out.title = await p.textContent('h1'); await shot('video');
  out.recs = await p.locator('.rec b').allTextContents();
  // --- play a transcript line: video seeks and then pauses at the end of the segment
  await p.click('.tbtn >> nth=1'); await p.waitForFunction(() => window.__yt.calls.some(c => c[0] === 'pause'), null, { timeout: 8000 });
  out.ytCalls = await p.evaluate(() => window.__yt.calls.map(c => c[0]).join(','));
  // --- quick-save a recommendation
  await p.click('.rec .btn.coral >> nth=0'); out.savedLabel = (await p.locator('.rec .btn[disabled]').first().textContent()).trim();
  // --- dictation session
  await p.click('[data-a=startEx][data-t=dictation]'); await p.waitForSelector('#ex-in');
  await p.click('[data-a=exPlay]'); await p.waitForFunction(() => window.__yt.calls.filter(c => c[0] === 'seek').length >= 2);
  let x = await p.evaluate(() => { const q = L.debugX().list[0]; return q.text; });
  await p.fill('#ex-in', x); await p.click('[data-a=exCheck]'); out.dictOk = await p.textContent('.tip');
  // select two words in the line and save
  await p.click('.selline .w >> nth=1'); await p.click('.selline .w >> nth=2'); out.selbar = (await p.textContent('.selbar')).replace(/\s+/g, ' ').trim().slice(0, 60);
  await shot('feedback');
  await p.click('[data-a=saveSel]'); await p.click('[data-a=commitSave]');
  out.notesAfter = await p.evaluate(() => L.S.notes.length);
  // finish the rest of the dictation session with wrong answers
  for (let k = 0; k < 20; k++) { if (await p.locator('.bigpct').count()) break; await p.click('[data-a=exNext]'); if (await p.locator('.bigpct').count()) break; if (await p.locator('#ex-in').count()) { await p.fill('#ex-in', 'hello'); await p.click('[data-a=exCheck]'); } }
  out.done = (await p.textContent('.bigpct')).trim(); await shot('results');
  // --- each other type
  for (const t of ['gap', 'choice', 'order', 'shadow', 'mixed']) {
    await p.click('[data-a=exitEx]'); await p.click(`[data-a=startEx][data-t=${t}]`); await p.waitForSelector('#qarea .label');
    for (let k = 0; k < 12; k++) {
      if (await p.locator('.bigpct').count()) break;
      const q = await p.evaluate(() => { const X = L.debugX(); const q = X.list[X.i]; return { type: q.type, answer: q.answer, tiles: q.tiles, target: q.target, gaps: q.gaps }; });
      if (q.type === 'choice') await p.click(`[data-a=exPick][data-n="${q.answer}"]`);
      else if (q.type === 'gap') { const ins = p.locator('.gi'); for (let g = 0; g < q.gaps.length; g++) await ins.nth(g).fill(q.gaps[g].answer); await p.click('[data-a=exCheck]'); }
      else if (q.type === 'order') { for (const w of q.target.split(' ')) { await p.locator('.bank .tile:not(.used)', { hasText: new RegExp('^' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }).first().click(); } await p.click('[data-a=exCheck]'); }
      else if (q.type === 'shadow') { await p.click('[data-a=exReveal]'); await p.click('[data-a=exRate][data-ok="1"]'); continue; }
      else { await p.fill('#ex-in', 'x'); await p.click('[data-a=exCheck]'); }
      await p.click('[data-a=exNext]');
    }
    out['t_' + t] = (await p.textContent('.bigpct')).trim();
  }
  // --- sources tab
  await p.click('[data-a=exitEx]'); await p.click('[data-a=tab][data-v=sources]'); out.sources = await p.locator('.src').count();
  out.srcLinks = await p.evaluate(() => [...document.querySelectorAll('.src a')].every(a => a.target === '_blank' && /noopener/.test(a.rel) && /^https:/.test(a.href)));
  await shot('sources');
  // --- notebook
  await p.click('[data-a=tab][data-v=notebook]');
  out.noteCount = await p.locator('.note').count(); out.yg = await p.getAttribute('.note a[href*="youglish"]', 'href'); await shot('notebook');
  await p.fill('#nsearch', 'zzzz'); out.search = await p.locator('.note').count(); await p.fill('#nsearch', '');
  // --- Claude picks (mocked)
  await p.click('[data-a=tab][data-v=me]'); await p.fill('#ai-key', 'sk-ant-test'); await p.click('[data-a=aiSave]');
  await p.click('[data-a=tab][data-v=home]'); await p.click('.vcard'); await p.waitForSelector('[data-a=askClaude]'); await p.click('[data-a=askClaude]');
  await p.waitForSelector('text=Claude\'s picks');
  out.aiRecs = await p.locator('.rec b').allTextContents(); out.aiModel = aiReq.model; out.aiFallbacks = aiReq.fallbacks; out.hasQuiz = await p.locator('[data-t=quiz]').count();
  await p.click('[data-t=quiz]'); await p.click('[data-a=exPick][data-n="0"]'); out.quizOk = (await p.textContent('.tip')).trim().length > 0;
  // --- sample + untimed text mode (voice)
  await p.click('[data-a=exitEx]'); await p.click('[data-a=tab][data-v=home]');
  await p.evaluate(() => { window.__spoken = []; speechSynthesis.speak = u => window.__spoken.push(u.text); });
  await p.click('[data-a=openAdd]'); await p.fill('#a-text', 'I really love this song. It makes me feel happy every morning. We should go to the concert together next month.'); await p.click('[data-a=createVideo]');
  await p.click('[data-a=startEx][data-t=dictation]'); out.voiceSpoke = await p.evaluate(() => window.__spoken.length);
  await shot('voice');
  out.errs = errs; out.w = await p.evaluate(() => document.documentElement.scrollWidth);
  console.log(JSON.stringify(out, null, 1)); await b.close();
})().catch(e => { console.error('E2E FAILED:', e.message); process.exit(1); });
