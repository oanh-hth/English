/* Garden (home), Review overview and Me. */
(() => {
const L = window.L, esc = L.esc, A = L.A, S = () => L.S;
const pct = (a, b) => Math.round(Math.min(1, a / b) * 100);
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

/* ---------- Garden ---------- */
const seedPicker = () => {
  const g = S().garden;
  return `<div class="card seedhead"><h2 class="display" style="margin:0 0 6px;font-size:24px">${g.done.length ? 'Pick your next seed' : 'Plant your first seed'}</h2><p class="muted" style="margin:0">Every day you study, and every exercise you finish, makes it grow.${g.bank ? ` <b>${g.bank} growth</b> is saved and goes in right away.` : ''}</p></div>
  <div class="seeds">${Object.entries(PLANTS).map(([k, p]) => `<div class="seed t-${p.tint}"><div class="seedart">${plantSvg(k, .86, { still: 1 })}</div><h3>${p.name}</h3><p class="small">${p.blurb}</p><span class="pill">${p.need} growth</span><button class="btn sm" data-a="plant" data-t="${k}">Plant it</button></div>`).join('')}</div>`;
};
const weekStrip = () => {
  const days = []; for (let i = 6; i >= 0; i--) days.push(SRS.addDays(L.dayKey(), -i));
  return `<div class="week">${days.map(k => { const on = (S().log[k] || {}).watered, [y, m, d] = k.split('-').map(Number); return `<div class="wd${on ? ' on' : ''}${k === L.dayKey() ? ' today' : ''}"><small>${new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'narrow' })}</small><span>${on ? '<svg viewBox="0 0 24 24"><path d="M12 3C8 8 6 11 6 14a6 6 0 0 0 12 0c0-3-2-6-6-11z"/></svg>' : ''}</span></div>`; }).join('')}</div>`;
};
L.views.garden = () => {
  const g = S().garden, cur = g.cur, wx = L.currentWx(), t = L.today(), due = L.due().length, hr = new Date().getHours();
  const hello = hr < 5 ? 'Still up?' : hr < 12 ? 'Good morning!' : hr < 18 ? 'Good afternoon!' : 'Good evening!';
  const head = `<div class="row" style="justify-content:space-between"><p class="brand">Lexigrow</p><span class="chipstat">${plural(L.activeDays(), 'day')} watered</span></div><h1>${hello}</h1>`;
  if (!cur) return head + `<p class="muted">Your garden is empty.</p>` + seedPicker() + shelf();
  const st = L.plantStage(), P = PLANTS[cur.type], thirsty = L.thirsty(), ready = L.ready();
  const mot = ready ? `Your ${P.name.toLowerCase()} is ripe. Time to harvest!` : t.watered ? `Watered today. ${t.pts ? `${t.pts} points earned.` : 'Review your notes to grow it faster.'}` : due ? `${plural(due, 'note')} waiting. Review them to water your plant.` : 'Add a note or practice to water your plant today.';
  const plantHtml = plantSvg(cur.type, st.t, { thirsty });
  const wxBtn = S().settings.weather.mode === 'off' ? '' : `<span class="wxchip">${esc(L.wxLine(wx))}</span>`;
  const scene = `<div class="card scenecard"><div class="scenewrap">${L.scene(wx, plantHtml)}${wxBtn}</div>
    <div class="gmeta"><div class="row" style="justify-content:space-between;align-items:baseline"><h2 class="display" style="margin:0;font-size:24px">${P.name}</h2><span class="pill ${ready ? 'good' : ''}">${st.label}</span></div>
    <div class="bar xp"><i style="width:${pct(cur.gp, P.need)}%"></i></div><p class="small muted" style="margin:6px 0 0">${cur.gp} / ${P.need} growth · ${thirsty ? 'Your plant is thirsty. Any study brings it back.' : esc(L.wxNote(wx))}</p>
    ${ready ? `<button class="btn coral" style="margin-top:12px" data-a="harvest">Harvest your ${P.name.toLowerCase()}</button>` : ''}</div></div>`;
  const right = `<div class="card review-card ${due ? 't-coral tinted' : ''}"><div class="row"><div class="grow"><h3>${due ? plural(due, 'note') + ' to review' : 'All caught up'}</h3><span class="small" style="opacity:.8">${due ? 'Quick review, a few minutes' : (SRS.nextAfter(S().items, L.dayKey()) ? 'Next review ' + L.dayLabel(SRS.nextAfter(S().items, L.dayKey())).toLowerCase() : 'Notes you add will show up here')}</span></div>${L.doodle('drop', 'cardart')}</div>${due ? '<button class="btn" style="margin-top:12px" data-a="startReview">Start review</button>' : ''}</div>
    ${L.missionCard()}
    <div class="grid2"><button class="card act" data-a="noteAdd">${L.doodle('pencil')}<b>Add a note</b><span class="small muted">+5 growth</span></button><button class="card act" data-a="bulkOpen">${L.doodle('book')}<b>Add many</b><span class="small muted">Paste a list</span></button></div>
    <div class="card"><div class="row" style="justify-content:space-between"><h3>This week</h3><span class="small muted">Today: ${t.pts + (t.watered ? 20 : 0)} growth</span></div>${weekStrip()}</div>
    ${S().settings.weather.mode === 'off' ? `<div class="card cheer-card"><b>Match your garden to the sky</b><p style="margin:6px 0 12px">Show the real weather outside, from rain to snow. Only your rough location is used.</p><div class="row" style="gap:8px"><button class="btn coral sm" data-a="wxLocate">Use my location</button><button class="btn ghost sm" data-a="wxCity">Pick a city</button></div></div>` : ''}`;
  return head + `<p class="muted">${mot}</p><div class="home-grid"><div>${scene}</div><div>${right}</div></div>${shelf()}`;
};
const shelf = () => { const d = S().garden.done; return d.length ? `<h2 class="display">Your collection</h2><div class="shelf">${d.map(x => `<div class="shelfitem">${plantSvg(x.type, 1, { still: 1 })}<b>${PLANTS[x.type].name}</b><span class="small muted">${L.dayLabel(x.day)}</span></div>`).join('')}</div>` : ''; };
A.plant = el => { L.plant(el.dataset.t); L.render(); window.scrollTo(0, 0); L.toast(`Planted a ${PLANTS[el.dataset.t].name.toLowerCase()}.`); };
A.harvest = () => { const n = PLANTS[S().garden.cur.type].name; L.harvest(); L.render(); window.scrollTo(0, 0); L.toast(`${n} added to your collection. Pick a new seed!`); };
A.startReview = () => L.startReview(L.due().slice(0, 30).map(i => i.id));

/* ---------- Review overview ---------- */
const rrow = it => `<div class="rrow"><div class="grow"><b>${esc(it.text)}</b><div class="small muted clamp">${esc(it.meaning || it.example || '')}</div></div>${SRS.diff(it.due, L.dayKey()) < 0 ? `<span class="pill warn">${esc(SRS.whenLabel(it.due, L.dayKey()))}</span>` : L.dots(it.stage)}</div>`;
L.views.review = () => {
  const items = S().items, today = L.dayKey(), due = L.due(), up = SRS.upcoming(items, today, 21), cap = L.cap(), known = items.filter(i => i.stage >= 5).length;
  if (!items.length) return `<p class="brand">Review</p><h1>Nothing to review yet</h1><div class="card empty-card">${L.doodle('book')}<p class="muted">Add notes and they will come back here at the right moments: tomorrow, then in 3 days, a week, and so on.</p><button class="btn coral sm" data-a="noteAdd">Add a note</button></div>`;
  const next = SRS.nextAfter(items, today);
  const hero = `<div class="card hero"><div class="big">${due.length}</div><p style="margin:4px 0 0">${due.length ? (due.length === 1 ? 'note is' : 'notes are') + ' ready to review today.' : 'Nothing due today.'}</p>${due.length ? `<button class="btn" data-a="startReview">Start review${due.length > 30 ? ' (30 at a time)' : ''}</button>` : `<p class="small" style="opacity:.85">${next ? 'Next review ' + esc(L.dayLabel(next).toLowerCase()) + '.' : ''}</p><button class="btn" data-a="reviewAhead" ${up.length ? '' : 'disabled'}>Review ahead</button>`}</div>`;
  const days = up.map(g => `<div class="upday"><div class="updl"><b>${esc(L.dayLabel(g.day))}</b><span class="small muted">${plural(g.items.length, 'note')}</span></div><div class="bar"><i style="width:${pct(g.items.length, cap)}%"></i></div><div class="chips" style="margin-top:8px">${g.items.slice(0, 4).map(i => `<span class="chip">${esc(i.text.length > 22 ? i.text.slice(0, 21) + '…' : i.text)}</span>`).join('')}${g.items.length > 4 ? `<span class="chip">+${g.items.length - 4}</span>` : ''}</div></div>`).join('');
  return `<p class="brand">Review</p><h1>Spaced review</h1><p class="muted">New notes come back tomorrow, then in 3 days, a week, two weeks and beyond. No more than ${cap} notes per day, so reviews never pile up.</p>
    ${hero}
    <h2 class="display">Practice</h2><div class="typelist"><button class="item t-pink" data-a="startSentences"><span class="ico">${L.doodle('pencil')}</span><span class="grow"><b>Write your own sentences</b><br><span class="small muted">Make up a sentence with each word, then judge it yourself.</span></span></button><button class="item t-blue" data-a="startSpeak"><span class="ico">${L.doodle('sun')}</span><span class="grow"><b>Say it out loud</b><br><span class="small muted">Listen, record yourself and compare.</span></span></button></div>
    <div class="grid3"><div class="card stat"><b>${items.length}</b><span>notes</span></div><div class="card stat"><b>${items.filter(i => i.stage >= 1 && i.stage < 5).length}</b><span>learning</span></div><div class="card stat"><b>${known}</b><span>known</span></div></div>
    ${due.length ? `<h2 class="display">Due today</h2><div class="card rlist">${due.map(rrow).join('')}</div>` : ''}
    <h2 class="display">Coming up</h2>${up.length ? `<div class="updays">${days}</div>` : '<div class="card empty small">No reviews in the next 3 weeks.</div>'}`;
};
A.reviewAhead = () => { const q = S().items.filter(i => SRS.diff(i.due, L.dayKey()) > 0).sort((a, b) => SRS.num(a.due) - SRS.num(b.due)).slice(0, 10).map(i => i.id); if (q.length) L.startReview(q); };

/* ---------- Me ---------- */
L.views.me = () => {
  const s = S(), w = s.settings.weather, items = s.items;
  const modes = [['off', 'Off'], ['live', 'Live'], ['demo', 'Preview']];
  const wxDetail = w.mode === 'live' ? `<p class="small muted">${w.lat != null ? `Showing ${esc(w.place || 'your location')}.${L.wxError ? ' Could not reach the weather service just now, showing the last known sky.' : ''}` : 'Choose where you are.'}</p><div class="row" style="gap:8px;flex-wrap:wrap"><button class="chip" data-a="wxLocate">Use my location</button><button class="chip" data-a="wxCity">Pick a city</button><button class="chip" data-a="wxRefresh">Refresh</button></div>` :
    w.mode === 'demo' ? `<p class="small muted">Preview how your garden looks in each kind of weather.</p><div class="chips">${L.CONDS.map(c => `<button class="chip${w.demo === c ? ' on' : ''}" data-a="wxDemo" data-c="${c}">${L.COND[c]}</button>`).join('')}<button class="chip${w.night ? ' on' : ''}" data-a="wxNight">Night</button></div>` : '<p class="small muted">The garden follows the time of day only.</p>';
  return `<p class="brand">Me</p><h1>Your progress</h1>
    <div class="grid3"><div class="card stat"><b>${items.length}</b><span>notes</span></div><div class="card stat"><b>${L.activeDays()}</b><span>days watered</span></div><div class="card stat"><b>${s.garden.done.length}</b><span>harvested</span></div></div>
    <div class="card"><h3>Review pace</h3><p class="small muted">The most notes that can come due on one day. Big batches are spread across several days.</p><div class="seg">${[5, 8, 10, 15, 20].map(n => `<button data-a="setCap" data-n="${n}" class="${L.cap() === n ? 'on' : ''}">${n}</button>`).join('')}</div></div>
    <div class="card"><h3>Garden weather</h3><div class="seg" style="margin:8px 0">${modes.map(([k, l]) => `<button data-a="wxMode" data-m="${k}" class="${w.mode === k ? 'on' : ''}">${l}</button>`).join('')}</div>${wxDetail}<p class="small muted" style="margin-top:10px">Weather comes from <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a>. Only coordinates are sent. Nothing else leaves your device.</p></div>
    <div class="card"><h3>Your data</h3><p class="small muted">Everything lives on this device. Export a backup now and then, especially before clearing your browser.</p><div class="stack"><button class="btn ghost" data-a="exportData">Export backup</button><label class="btn ghost" style="cursor:pointer">Import backup<input type="file" id="importfile" accept="application/json,.json" hidden></label><button class="btn ghost" data-a="resetAsk" style="color:var(--bad)">Delete everything</button></div></div>
    <p class="small muted" style="text-align:center">Pronunciation: tap YouGlish on any note to hear real speakers.</p>`;
};
A.setCap = el => { S().settings.cap = +el.dataset.n; L.save(); L.render(true); };
A.wxRefresh = () => { L.toast('Updating...'); L.refreshWeather(true); };
A.exportData = () => {
  const blob = new Blob([JSON.stringify(S(), null, 2)], { type: 'application/json' }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `lexigrow-backup-${L.dayKey()}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
};
document.addEventListener('change', e => {
  if (e.target.id !== 'importfile' || !e.target.files[0]) return;
  const r = new FileReader();
  r.onload = () => { try { const o = JSON.parse(r.result); if (!o || !Array.isArray(o.items)) throw 0; L._import = o; L.openSheet(`<h2 style="margin-top:0">Replace your data?</h2><p>This backup has <b>${plural(o.items.length, 'note')}</b>. It replaces what is on this device now.</p><div class="stack"><button class="btn" data-a="importYes">Replace</button><button class="btn ghost" data-a="closeSheet">Cancel</button></div>`); } catch (x) { L.toast('That file is not a Lexigrow backup.'); } e.target.value = ''; };
  r.readAsText(e.target.files[0]);
});
A.importYes = () => { L.S = L._import; L.save(); L.closeSheet(); L.go('garden'); L.toast('Backup restored.'); L.refreshWeather(); };
A.resetAsk = () => L.openSheet(`<h2 style="margin-top:0">Delete everything?</h2><p>All notes, points and plants on this device will be erased. Export a backup first if you might want them back.</p><div class="stack"><button class="btn" style="background:var(--bad);color:#fff" data-a="resetYes">Delete everything</button><button class="btn ghost" data-a="closeSheet">Cancel</button></div>`);
A.resetYes = () => { L.reset(); L.closeSheet(); L.go('garden'); };
})();
