/* Home, Add video, Video page and Me. */
(() => {
const L = window.L, esc = L.esc, A = L.A, S = () => L.S;
const SAMPLE = `0:00
hey everyone welcome back to the channel
0:03
today we're going to talk about how to
0:05
order coffee like a local so let me
0:08
get back to you on that in a second
0:10
what's up everyone I'm so excited
0:13
because today's topic is really useful
0:16
when you walk into a coffee shop you can say
0:19
can I get a medium latte please
0:22
it's a polite and very common way to order
0:26
the barista will ask for here or to go
0:29
and you just say to go please
0:32
keep the change is what you say when you pay cash
0:36
that's it see you in the next video
0:38
take care everyone`;

const vidOf = id => S().videos.find(v => v.id === id);
const cur = () => vidOf(L.V.id);
const AN = new Map();
const analysis = v => { const k = v.id + ':' + v.segs.length; if (!AN.has(k)) AN.set(k, LT.analyze(v.segs, window.LEXICON)); return AN.get(k); };
L.analysisOf = analysis;
const minutes = v => { const last = v.segs[v.segs.length - 1]; return v.timed && last && last.e ? Math.max(1, Math.round(last.e / 60)) : Math.max(1, Math.round(v.segs.reduce((a, s) => a + s.t.split(' ').length, 0) / 150)); };
const thumb = v => v.ytId ? `<img class="thumb" src="https://i.ytimg.com/vi/${v.ytId}/mqdefault.jpg" alt="" loading="lazy" onerror="this.style.display='none'">` : `<div class="thumb noimg">${L.doodle('headphones')}</div>`;

/* ---------- Home ---------- */
L.views.home = () => {
  const t = L.today(), goal = S().settings.dailyGoal, done = t.lines + t.saved, st = L.streak(), rate = L.recall();
  const hr = new Date().getHours(), hello = hr < 5 ? 'Still up?' : hr < 12 ? 'Good morning!' : hr < 18 ? 'Good afternoon!' : 'Good evening!';
  const mot = done >= goal ? 'Goal crushed. Anything more today is a bonus!' : done > 0 ? `Nice start. ${goal - done} more to hit today's goal.` : st > 1 ? `You're on a ${st}-day streak. Keep your ears warm!` : S().videos.length ? 'Ten minutes of listening today makes tomorrow easier.' : 'Paste a YouTube link and turn it into listening practice.';
  const vids = S().videos;
  return `<div class="row" style="justify-content:space-between"><p class="brand">Listen &amp; Learn</p><span class="chipstat">${st} day streak</span></div>
    <h1>${hello}</h1><p class="muted">${mot}</p>
    <div class="card hero cta"><div class="stackdeco" aria-hidden="true">${['pink', 'sage', 'blue'].map(c => `<i class="t-${c} tinted"></i>`).join('')}</div>
      <h2 class="display" style="margin:0 0 8px;font-size:24px;max-width:70%">Turn any YouTube video into listening practice</h2>
      <p style="max-width:72%">Add a link and its transcript. We make the exercises and pick the phrases worth learning.</p>
      <button class="btn" data-a="openAdd">Add a video</button></div>
    <h2 class="display">Your videos</h2>
    ${vids.length ? vids.map(v => { const [, tint] = L.artFor(v.id), an = analysis(v); return `<button class="vcard" data-a="openVideo" data-id="${v.id}">${thumb(v)}<span class="vinfo"><b>${esc(v.title)}</b><span class="muted small">${v.segs.length} lines · about ${minutes(v)} min${v.timed ? '' : ' · text only'}</span><span class="chips" style="margin-top:6px"><span class="pillchip ${tint === 'blue' ? 'blue' : tint === 'coral' ? 'coral' : 'sage'}">${an.stats.level}</span><span class="pillchip" style="background:var(--sand)">${an.phrases.length + an.chunks.length} phrases</span></span></span></button>`; }).join('')
      : `<div class="card cheer-card"><b>No videos yet</b><p style="margin:6px 0 12px">Try the sample to see how it works. It uses your phone's voice instead of a video.</p><button class="btn coral sm" data-a="useSample">Try the sample</button></div>`}
    <div class="card goal-card"><div class="ringbox">${L.ring(done / goal)}<div class="ring-num"><b>${done}</b><span>/ ${goal}</span></div></div>
      <div class="grow"><h3>Today's goal</h3><span class="muted small">Lines practiced and phrases saved count.</span></div></div>
    <div class="card streak-card"><div class="streak-num">${st}</div><h2 class="display">Day streak</h2>
      <p>You practiced <span class="pillchip blue">${Object.values(S().log).reduce((a, l) => a + l.lines, 0)} lines</span> so far</p>
      ${rate === null ? '' : `<p>With a <span class="pillchip coral">${rate}%</span> hit rate</p>`}${L.calendar()}</div>`;
};
A.openVideo = el => L.go('video', { id: el.dataset.id });
A.openAdd = () => L.go('add');
A.useSample = () => { const v = create({ link: '', title: 'Sample: ordering coffee', text: SAMPLE }); if (v) L.go('video', { id: v.id }); };

/* ---------- Add video ---------- */
function create({ link, title, text }) {
  const id = link.trim() ? LT.parseVideoId(link) : null;
  if (link.trim() && !id) { L.toast('That does not look like a YouTube link.'); return null; }
  const parsed = LT.parseTranscript(text), segs = LT.segment(parsed);
  if (segs.length < 3) { L.toast('Paste a longer transcript (at least a few lines).'); return null; }
  const v = { id: L.uid(), ytId: id, title: title.trim() || (id ? 'YouTube video ' + id : 'My transcript'), segs, timed: parsed.timed, created: Date.now() };
  S().videos.unshift(v);
  if (!L.save()) { S().videos.shift(); return null; }
  return v;
}
const previewHtml = (text, link) => {
  if (!text.trim()) return '<span class="muted">Paste a transcript to see a preview.</span>';
  const p = LT.parseTranscript(text), segs = LT.segment(p);
  const bad = link.trim() && !LT.parseVideoId(link);
  return `${bad ? '<b style="color:var(--bad)">That link is not a YouTube link.</b><br>' : ''}${segs.length >= 3 ? `<b>${segs.length} practice lines</b> found${p.timed ? ' with timestamps. The video will play each line.' : '. No timestamps, so lines are read aloud by your phone.'}` : '<b style="color:var(--bad)">Only ' + segs.length + ' line found.</b> Paste more text.'}`;
};
L.views.add = () => `<div class="topbar"><button class="back" data-a="tab" data-v="home">‹ Back</button></div>
  <h1>Add a video</h1><p class="muted">Two quick steps: the link, then the transcript.</p>
  <div class="card"><div class="label" style="margin-top:0">1. YouTube link</div>
    <input class="type" id="a-link" placeholder="https://www.youtube.com/watch?v=…" autocomplete="off" autocapitalize="off" spellcheck="false" style="margin:6px 0 8px">
    <input class="type" id="a-title" placeholder="Title (optional)" autocomplete="off" style="margin:0">
    <p class="muted small" style="margin:8px 0 0">No link? Leave it empty to practice with your phone's voice.</p></div>
  <div class="card"><div class="label" style="margin-top:0">2. Transcript</div>
    <textarea class="type" id="a-text" rows="9" placeholder="Paste the transcript here (with timestamps if you can)" spellcheck="false" style="margin:6px 0 8px;font-size:16px"></textarea>
    <label class="btn ghost sm" style="cursor:pointer">Choose a file (.srt .vtt .txt)<input id="a-file" type="file" accept=".srt,.vtt,.txt,text/plain" hidden></label>
    <div id="a-prev" class="small" style="margin-top:12px">${previewHtml('', '')}</div></div>
  <details class="card help"><summary><b>How do I get a transcript from YouTube?</b></summary>
    <ol class="small"><li>Open the video on YouTube (computer works best).</li><li>Tap <b>…more</b> under the video, then <b>Show transcript</b>.</li><li>Select the text in the transcript panel, copy it, and paste it above. Timestamps are kept automatically.</li><li>On the phone app: open the description, tap <b>Show transcript</b>, then copy.</li><li>You can also upload an <b>.srt</b> or <b>.vtt</b> caption file.</li></ol>
    <p class="muted small">We can't download transcripts for you: YouTube doesn't allow web pages to fetch them.</p></details>
  <div class="stack"><button class="btn" data-a="createVideo">Create practice</button><button class="btn plain" data-a="useSample">Try the sample instead</button></div>`;
const upd = () => { const t = document.getElementById('a-text'), l = document.getElementById('a-link'), p = document.getElementById('a-prev'); if (t && p) p.innerHTML = previewHtml(t.value, l ? l.value : ''); };
document.addEventListener('input', e => { if (e.target.id === 'a-text' || e.target.id === 'a-link') upd(); });
document.addEventListener('change', async e => {
  if (e.target.id === 'a-file' && e.target.files[0]) { const f = e.target.files[0]; document.getElementById('a-text').value = await f.text(); const t = document.getElementById('a-title'); if (t && !t.value) t.value = f.name.replace(/\.\w+$/, ''); upd(); }
});
A.createVideo = () => {
  const v = create({ link: document.getElementById('a-link').value, title: document.getElementById('a-title').value, text: document.getElementById('a-text').value });
  if (v) { L.toast('Practice ready!'); L.go('video', { id: v.id }); }
};

/* ---------- Video page ---------- */
L.views.video = () => {
  const v = cur(); if (!v) return '<div class="empty">Video not found.</div>';
  return `<div class="topbar"><button class="back" data-a="tab" data-v="home">‹ Videos</button></div>
    <h1 style="margin-bottom:10px">${esc(v.title)}</h1>
    ${v.ytId ? '<div class="player-slot"><div id="ytslot"></div></div><p id="pstat" class="small muted" style="margin:8px 0 0">Loading video…</p>' : '<div class="card cheer-card small"><b>Voice mode</b><p style="margin:4px 0 0">No video linked, so lines are read by your phone. Add a link by creating the video again for real audio.</p></div>'}
    <div id="vbody"></div>`;
};
L.after.video = async () => {
  const v = cur(); if (!v) return;
  L.paintVideo();
  if (L.V.seg != null) setTimeout(() => { const n = document.getElementById('line-' + L.V.seg); if (n) { n.scrollIntoView({ block: 'center' }); n.classList.add('flash-line'); } }, 60);
  if (v.ytId) {
    const ok = await L.player.mount('ytslot', v.ytId), p = document.getElementById('pstat');
    if (p) p.textContent = ok ? (v.timed ? 'Tap ▶ on any line below to replay just that part.' : 'This transcript has no timestamps, so lines are read by your phone.') : L.player.error + ' Lines will be read by your phone instead.';
  }
};
const recRow = (r, g, n) => `<div class="rec"><div class="grow"><b>${esc(r.text)}</b>${r.count > 1 ? ` <span class="cnt">×${r.count}</span>` : ''}${r.meaning ? `<div class="small muted">${esc(r.meaning)}</div>` : ''}</div>
  <button class="speak sm" data-a="hearRec" data-line="${r.line}" aria-label="Hear it in the video">▶</button>
  ${L.isSaved(r.text) ? '<button class="btn sm ghost" disabled>Saved ✓</button>' : `<button class="btn sm coral" data-a="rec" data-g="${g}" data-n="${n}">+ Save</button>`}</div>`;
let SHOWALL = false;
L.paintVideo = () => {
  const v = cur(), box = document.getElementById('vbody'); if (!v || !box) return;
  const an = analysis(v), ai = v.ai;
  const group = (title, blurb, list, g) => list.length ? `<h3 class="grouph">${title}</h3><p class="muted small" style="margin:0 0 6px">${blurb}</p>${list.map((r, n) => recRow(r, g, n)).join('')}` : '';
  const types = LT.TYPES.map(t => ({ ...t, n: LT.eligible(v.segs, t.key).length }));
  const lines = SHOWALL ? v.segs : v.segs.slice(0, 40);
  const speed = S().settings.speed;
  box.innerHTML = `<div class="chips" style="margin:12px 0"><span class="pillchip sage">${an.stats.level}</span><span class="pillchip" style="background:var(--sand)">${v.segs.length} lines</span><span class="pillchip" style="background:var(--sand)">${an.stats.words} words</span></div>
    <h2 class="display">Practice</h2>
    <button class="btn" data-a="startEx" data-t="mixed" style="margin-bottom:12px">Mixed practice (10)</button>
    <div class="tgrid">${types.map((t, i) => `<button class="topic-card t-${['sage', 'blue', 'pink', 'coral', 'olive'][i % 5]}" data-a="startEx" data-t="${t.key}" ${t.n ? '' : 'disabled style="opacity:.45"'}><h3>${t.name}</h3><span class="sub">${t.blurb}<br>${t.n} lines</span>${L.doodle(t.art)}</button>`).join('')}
      ${ai && ai.quiz && ai.quiz.length ? `<button class="topic-card t-sand" data-a="startEx" data-t="quiz"><h3>Comprehension</h3><span class="sub">Questions from Claude<br>${ai.quiz.length} questions</span>${L.doodle('speech')}</button>` : ''}</div>
    <div class="row" style="margin:6px 0 0"><span class="small muted grow">Playback speed</span><div class="seg">${[1, 0.75, 0.5].map(s => `<button class="${speed === s ? 'on' : ''}" data-a="speed" data-s="${s}">${s}×</button>`).join('')}</div></div>
    <h2 class="display">Recommended for you</h2>
    ${ai ? `<div class="card cheer-card small" style="margin-bottom:10px"><b>Claude's picks</b><p style="margin:2px 0 0">Based on the whole transcript.</p></div>${group('Phrases', 'Natural expressions from this video.', ai.phrases, 'ai-p')}${group('Words', 'Useful words worth knowing.', ai.words, 'ai-w')}` : ''}
    ${group('Natural phrases', 'Expressions native speakers use, found in this video.', an.phrases, 'phrases')}
    ${group('Said again and again', 'Chunks repeated in the video, so they are probably useful.', an.chunks, 'chunks')}
    ${group('Words to learn', 'Everyday words from our word list that appear here.', an.words, 'words')}
    ${group('Frequent words', 'Repeated words you may not know yet.', an.frequent, 'frequent')}
    ${!an.phrases.length && !an.chunks.length && !an.words.length && !an.frequent.length && !ai ? '<p class="muted">No strong picks found. Tap any word in the transcript to save it yourself.</p>' : ''}
    <div class="stack" style="margin-top:12px">${L.claudeButton ? L.claudeButton(v) : ''}</div>
    <h2 class="display">Transcript</h2><p class="muted small">Tap ▶ to hear a line. Tap a word to select it, tap another to select a phrase, then save it.</p>
    <div class="lines">${lines.map(s => `<div class="line" id="line-${s.i}"><button class="tbtn" data-a="playLine" data-i="${s.i}" aria-label="Play line ${s.i + 1}">▶ ${s.s != null ? L.fmtTime(s.s) : s.i + 1}</button><div class="ltxt">${L.selectable(s, 'v' + s.i)}</div></div>`).join('')}</div>
    ${!SHOWALL && v.segs.length > 40 ? `<button class="btn plain" data-a="showAll" style="margin-top:10px">Show all ${v.segs.length} lines</button>` : ''}
    <div class="stack" style="margin-top:22px"><button class="btn plain" data-a="renameVideo">Rename</button><button class="btn plain" data-a="delVideo" style="color:var(--bad)">Delete this video</button></div>`;
};
A.showAll = () => { SHOWALL = true; L.paintVideo(); };
A.speed = el => { S().settings.speed = +el.dataset.s; L.save(); L.paintVideo(); };
A.playLine = el => { const v = cur(); if (v) L.playLine(v.segs[+el.dataset.i], { rate: S().settings.speed }); };
A.hearRec = el => { const v = cur(); if (v) L.playLine(v.segs[+el.dataset.line] || v.segs[0], { rate: S().settings.speed }); };
A.rec = el => {
  const v = cur(), an = analysis(v), g = el.dataset.g, n = +el.dataset.n, list = g === 'ai-p' ? v.ai.phrases : g === 'ai-w' ? v.ai.words : an[g], r = list[n];
  if (r && L.quickSave({ text: r.text, meaning: r.meaning, vid: v.id, seg: r.line })) { L.save(); L.toast('Saved to your notebook.'); }
  L.paintVideo();
};
A.renameVideo = () => { const v = cur(), t = prompt('Video title', v.title); if (t && t.trim()) { v.title = t.trim(); L.save(); L.render(); } };
A.delVideo = () => { const v = cur(); if (!confirm('Delete this video and its practice? Saved notes stay in your notebook.')) return; S().videos = S().videos.filter(x => x.id !== v.id); L.save(); L.go('home'); };
A.startEx = el => L.startSession(L.V.id, el.dataset.t);

/* ---------- Me ---------- */
L.views.me = () => `<p class="brand">Me</p><h1>Settings</h1>
  <div class="card stack"><label class="row"><span class="grow">Daily goal (lines + saves)</span><select data-s="dailyGoal">${[10, 20, 30, 50].map(n => `<option ${n === S().settings.dailyGoal ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div>
  ${L.claudeSettings ? L.claudeSettings() : ''}
  <h2 class="display">How it works</h2>
  <div class="card small"><p><b>1. Add</b> a YouTube link and its transcript.</p><p><b>2. Practice</b> with dictation, gaps, word order and shadowing built from the real lines.</p><p><b>3. Save</b> the phrases and words you hear. Check how people say them on YouGlish.</p><p class="muted" style="margin:0">Everything is stored on this device only.</p></div>
  <h2 class="display">Data</h2>
  <div class="card small"><p style="margin:0">${S().videos.length} video${S().videos.length === 1 ? '' : 's'} and ${S().notes.length} note${S().notes.length === 1 ? '' : 's'} saved here.</p></div>
  <button class="btn plain" data-a="resetAll" style="color:var(--bad)">Reset everything</button>`;
document.addEventListener('change', e => { if (e.target.dataset && e.target.dataset.s === 'dailyGoal') { S().settings.dailyGoal = +e.target.value; L.save(); } });
A.resetAll = () => { if (confirm('Delete all videos, notes and progress on this device?')) { L.reset(); L.go('home'); L.toast('Everything was reset.'); } };
})();
