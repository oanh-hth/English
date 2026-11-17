/* End-to-end: run `python3 -m http.server 8123` in the repo root, then `node tests/e2e.js`. Open-Meteo is mocked. */
const { chromium, devices } = require('playwright');
const URL = 'http://localhost:8123/index.html', OUT = process.env.SHOTS || '';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const NOTES = [['I will get back to you', 'reply later', 'Let me check and I will get back to you.'], ['run out of', 'have none left', 'We run out of milk every week.'], ['hang out', 'spend time together', 'Do you want to hang out later?'], ['figure out', 'solve or understand', 'I cannot figure out this puzzle.'], ['bummer', 'something disappointing', 'Oh, bummer, it is closed.'], ['reluctant', 'not wanting to do something', '']];

async function run(name, device) {
  const b = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] }); const ctx = await b.newContext({ ...device, geolocation: { latitude: 21.03, longitude: 105.85 }, permissions: ['geolocation', 'microphone'] });
  await ctx.route('https://api.open-meteo.com/**', r => r.fulfill({ json: { current: { weather_code: 63, is_day: 1, temperature_2m: 22.4 } } }));
  await ctx.route('https://geocoding-api.open-meteo.com/**', r => r.fulfill({ json: { results: [{ name: 'Hanoi', admin1: 'Hanoi', country: 'Vietnam', latitude: 21.03, longitude: 105.85 }] } }));
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  const shot = async n => { if (OUT) await p.screenshot({ path: `${OUT}/${name}-${n}.png` }); };
  const noOverflow = async n => { const w = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); ok(w[0] <= w[1], `${name}: no horizontal overflow on ${n} (${w})`); };
  await p.goto(URL);
  const answerCard = async g => { if (await p.locator('#rv-ans').count()) { await p.click('[data-a=rvSkip]'); await p.click('[data-a=grade][data-g="1"]'); } else { await p.click('[data-a=reveal]'); await p.click(`[data-a=grade][data-g="${g}"]`); } };
  const record = async () => { await p.click('[data-a=dRec]'); await p.waitForSelector('.recbtn.on'); await p.waitForTimeout(300); await p.click('[data-a=dRec]'); await p.waitForSelector('[data-a=dSaid]'); };
  ok(await p.locator('.seed').count() === 7, `${name}: seed picker shows 7 plants`);
  await shot('seeds'); await noOverflow('seeds');
  await p.click('[data-a=plant][data-t=tomato]');
  ok(await p.locator('.scene .plant').count() === 1, `${name}: plant is drawn in the scene`);
  await noOverflow('garden');
  // add notes
  for (const [t, m, e] of NOTES) { await p.click('[data-a=tab][data-v=notebook]'); await p.click('[data-a=noteAdd]'); await p.fill('#f-text', t); await p.fill('#f-mean', m); await p.fill('#f-ex', e); await p.click('[data-a=noteSave]'); }
  ok(await p.locator('.note').count() === NOTES.length, `${name}: ${NOTES.length} notes saved`);
  await p.click('[data-a=noteAdd]'); await p.fill('#f-text', 'Hang Out'); await p.click('[data-a=noteSave]');
  ok(await p.locator('.note').count() === NOTES.length, `${name}: duplicate is rejected`);
  await p.click('[data-a=closeSheet]', { force: true }).catch(() => {}); await p.evaluate(() => L.closeSheet());
  ok((await p.getAttribute('.note a.chip', 'href')).startsWith('https://youglish.com/pronounce/'), `${name}: YouGlish link-out present`);
  await p.fill('#nq', 'reluc'); ok(await p.locator('.note').count() === 1, `${name}: search filters`); await p.fill('#nq', '');
  await shot('notebook'); await noOverflow('notebook');
  // edit
  await p.locator('[data-a=noteEdit]').first().click(); await p.fill('#f-note', 'casual'); await p.click('[data-a=noteSave]'); ok((await p.locator('.nnote').count()) === 1, `${name}: edit saved`);
  // bulk
  await p.click('[data-a=bulkOpen]'); await p.fill('#b-text', 'wrap up = finish\nspill the beans = tell a secret | He spilled the beans.'); await p.click('[data-a=bulkSave]');
  ok(await p.locator('.note').count() === NOTES.length + 2, `${name}: bulk add`);
  // schedule: 8 notes added today, due tomorrow, none today
  await p.click('[data-a=tab][data-v=review]'); ok(await p.locator('.upday').count() >= 1, `${name}: upcoming schedule listed`); await shot('review-empty'); await noOverflow('review');
  // spread over days when the cap is small
  const spread = await p.evaluate(() => { L.S.settings.cap = 3; const items = L.S.items; items.forEach(i => i.due = null); items.slice().reverse().forEach(i => SRS.schedule(items, i, L.dayKey(), 3)); const m = {}; items.forEach(i => m[i.due] = (m[i.due] || 0) + 1); L.S.settings.cap = 10; return Object.values(m).sort(); });
  ok(JSON.stringify(spread) === '[2,3,3]', `${name}: 8 notes spread across days with cap 3 (${spread})`);
  // make everything due, review
  await p.evaluate(() => { L.S.items.forEach(i => i.due = L.dayKey()); L.save(); L.go('review'); });
  ok((await p.textContent('.hero .big')) === '8', `${name}: 8 due today`);
  const gp0 = await p.evaluate(() => L.S.garden.cur.gp);
  await p.click('[data-a=startReview]');
  for (let i = 0; i < 8; i++) { if (i === 0) await shot('review-card'); await answerCard(2); }
  ok(await p.locator('.huge').textContent() === 'Review done', `${name}: review finishes`);
  const gp1 = await p.evaluate(() => L.S.garden.cur.gp); ok(gp1 - gp0 >= 8 * 3 + 10, `${name}: review grows the plant (${gp0} -> ${gp1})`);
  await shot('review-done');
  const dueAfter = await p.evaluate(() => L.due().length); ok(dueAfter === 0, `${name}: nothing due after review`);
  await p.evaluate(() => L.go('review'));
  ok(await p.locator('#tabs button').count() === 4, `${name}: four tabs`);
  ok(await p.locator('[data-a=keyAsk]').count() === 0, `${name}: no AI feature`);
  const pts0 = await p.evaluate(() => L.S.pts); ok(pts0 > 0, `${name}: reviewing earned points (${pts0})`);
  await shot('review-practice');
  // write your own sentences
  await p.evaluate(() => { L.S.items.forEach(i => i.due = L.dayKey()); L.save(); });
  await p.click('[data-a=startSentences]');
  ok(await p.locator('.drillcard').count() === 1, `${name}: sentence drill starts`);
  await shot('sentence');
  await p.fill('#d-text', 'x'); await p.click('[data-a=dSubmit]'); ok(await p.locator('#d-text').count() === 1, `${name}: too-short sentence is refused`);
  const target0 = await p.evaluate(() => L.item(L.S.items[0].id) && document.querySelector('.drillcard .phrase').textContent);
  for (let i = 0; i < 5; i++) {
    const w = (await p.locator('.drillcard .phrase').textContent()).replace(/\(.*?\)/g, '').trim();
    await p.fill('#d-text', `Yesterday I tried to ${w} with my friends at home`); await p.click('[data-a=dSubmit]');
    if (i === 0) { await shot('sentence-rate'); ok(await p.locator('[data-a=dRate]').count() === 3, `${name}: self-rating offered`); }
    await p.click(`[data-a=dRate][data-r=${i === 4 ? 'off' : 'natural'}]`);
  }
  ok((await p.textContent('.huge')) === 'Sentences done', `${name}: sentence drill finishes`);
  const mine = await p.evaluate(() => ({ n: L.S.items.filter(i => i.mine && i.mine.length).length, w: L.today().writes, pts: L.S.pts }));
  ok(mine.n === 5 && mine.w === 5 && mine.pts > pts0, `${name}: sentences saved on notes and points awarded (${JSON.stringify(mine)})`);
  const offItem = await p.evaluate(() => L.S.items.find(i => i.mine && i.mine[0].r === 'off')); ok(offItem && offItem.stage === 0, `${name}: a sentence that felt off resets that note`);
  await shot('sentence-done'); await noOverflow('sentence results');
  await p.click('[data-a=drillLeave]');
  // say it out loud (fake microphone)
  await p.click('[data-a=startSpeak]'); ok(await p.locator('.recbtn').count() === 1, `${name}: speak drill starts`);
  await p.click('[data-a=dRec]'); await p.waitForSelector('.recbtn.on'); await p.waitForTimeout(600); await p.click('[data-a=dRec]');
  await p.waitForSelector('[data-a=dPlay]'); ok(true, `${name}: recording captured and can be played back`);
  await shot('speak-ready');
  for (let i = 0; i < 5; i++) {
    if (!(await p.locator('[data-a=dSaid]').count())) { await p.click('[data-a=dRec]'); await p.waitForSelector('.recbtn.on'); await p.waitForTimeout(300); await p.click('[data-a=dRec]'); await p.waitForSelector('[data-a=dSaid]'); }
    await p.click(`[data-a=dSaid][data-r=${i % 2 ? 'work' : 'good'}]`);
  }
  ok((await p.textContent('.huge')) === 'Nice speaking', `${name}: speak drill finishes`); await shot('speak-done');
  ok(await p.evaluate(() => (L.today().speaks || 0) === 5), `${name}: speaking counted`);
  await p.click('[data-a=drillLeave]');
  // use it today
  await p.evaluate(() => L.go('garden'));
  ok(await p.locator('.mission').count() === 1, `${name}: word of the day shown`); await shot('mission');
  const mid = await p.evaluate(() => L.S.mission.id); await p.click('[data-a=missionDone]'); await p.fill('#m-where', 'told my coworker'); await p.click('[data-a=missionSave]');
  ok(await p.evaluate(id => L.item(id).uses[0].where === 'told my coworker' && L.S.mission.done, mid), `${name}: mission completed and saved on the note`);
  ok((await p.locator('.mission').textContent()).includes('Used today'), `${name}: mission shows done`);
  await p.evaluate(() => L.go('notebook')); ok(await p.locator('.nnote', { hasText: 'My sentence' }).count() >= 1 && await p.locator('.nnote', { hasText: 'Used for real' }).count() === 1, `${name}: notes show my sentence and real use`);
  await p.evaluate(() => L.go('garden'));
  // quick capture makes a draft that stays out of reviews until it is finished
  await p.fill('#qc-g', 'on the fence'); await p.click('[data-a=quickAdd][data-i=qc-g]');
  const d1 = await p.evaluate(() => { const it = L.S.items.find(i => i.text === 'on the fence'); return { draft: !!it.draft, due: L.due().some(i => i.id === it.id), up: SRS.upcoming(L.S.items, L.dayKey(), 21).some(g => g.items.includes(it)), todo: L.drafts().length }; });
  ok(d1.draft && !d1.due && !d1.up && d1.todo === 1, `${name}: quick capture saves a draft outside the schedule (${JSON.stringify(d1)})`);
  await shot('garden-today');
  await p.click('[data-a=goTodo]'); ok(await p.locator('.note').count() === 1, `${name}: "to finish" list shows the draft`);
  await p.click('[data-a=noteEdit]'); await p.fill('#f-mean', 'undecided'); await p.click('[data-a=noteSave]');
  const d2 = await p.evaluate(() => { const it = L.S.items.find(i => i.text === 'on the fence'); return !it.draft && it.due === SRS.addDays(L.dayKey(), 1); });
  ok(d2, `${name}: finishing a draft schedules its first review`);
  // a typed, auto-checked card: right answer, then wrong answer
  const answer = await p.evaluate(() => { const it = L.S.items.find(i => i.example && LX.gapOf(i) !== null); for (let r = 0; r < 60; r++) { it.reps = r; if (L.cardType(it) === 'gap') break; } it.due = L.dayKey(); L.save(); L.startReview([it.id]); return LX.plain(it.text); });
  ok(await p.locator('#rv-ans').count() === 1, `${name}: fill-the-gap card asks for a typed answer`);
  await shot('review-typed');
  await p.fill('#rv-ans', answer.toUpperCase() + '!'); await p.click('[data-a=rvCheck]');
  ok((await p.textContent('.tip')).includes('Correct') && await p.locator('.rates.three [data-a=grade]').count() === 3, `${name}: a correct typed answer is recognised`);
  await p.click('[data-a=grade][data-g="2"]');
  await p.evaluate(() => { const it = L.S.items.find(i => i.example && LX.gapOf(i) !== null); for (let r = it.reps; r < it.reps + 60; r++) { it.reps = r; if (L.cardType(it) === 'gap') break; } it.due = L.dayKey(); it.stage = 4; L.save(); L.startReview([it.id]); });
  await p.fill('#rv-ans', 'zzz'); await p.click('[data-a=rvCheck]');
  ok((await p.textContent('.tip')).includes('Not quite') && await p.locator('.rates.two [data-a=grade]').count() === 2, `${name}: a wrong typed answer offers Again`);
  await p.click('[data-a=grade][data-g="0"]');
  ok(await p.evaluate(() => L.S.items.find(i => i.example && LX.gapOf(i) !== null && i.lapses > 0).stage) === 2, `${name}: Again drops two stages instead of resetting`);
  await p.click('[data-a=reveal]'); await p.click('[data-a=grade][data-g="2"]'); await p.evaluate(() => L.go('garden'));
  ok(await p.evaluate(() => L.PTS.review === 3 && L.PTS.sentence === 5 && L.PTS.speak === 3), `${name}: points are flat per answer`);
  // after a break: twice the daily pace today, the rest rolls over
  const bl = await p.evaluate(() => { L.S.settings.cap = 5; L.today().reviewed = 0; for (let i = 0; i < 30; i++) L.S.items.push({ id: 'zz' + i, kind: 'word', text: 'bulk' + i, meaning: 'm' + i, example: '', note: '', stage: 1, due: SRS.addDays(L.dayKey(), -3), lapses: 0, reps: 1, c: i }); L.save(); L.go('review'); return [L.due().length, L.todayDue().length]; });
  ok(bl[0] >= 30 && bl[1] === 10 && (await p.textContent('.hero .big')) === '10' && (await p.textContent('.hero')).includes('roll over'), `${name}: backlog is limited to twice the daily pace (${bl})`);
  await shot('review-backlog');
  // today's session chains review, writing and speaking
  await p.evaluate(() => { const t = L.today(); t.writes = 0; t.speaks = 0; t.reviewed = 0; L.S.items = L.S.items.filter(i => !i.id.startsWith('zz') || +i.id.slice(2) < 2); L.S.settings.cap = 10; L.save(); L.go('garden'); });
  const nDue = await p.evaluate(() => L.todayDue().length);
  ok(nDue >= 2 && (await p.textContent('.today-card')).includes(`${nDue} reviews`), `${name}: today's card describes the session (${nDue} reviews)`);
  await p.click('[data-a=startToday]');
  for (let i = 0; i < nDue; i++) await answerCard(2);
  ok((await p.textContent('[data-a=flowNext]')).includes('write sentences'), `${name}: review hands over to writing`);
  await p.click('[data-a=flowNext]');
  const nSent = await p.evaluate(() => document.querySelector('.counter').textContent.split('/')[1]);
  for (let i = 0; i < +nSent; i++) { const w = (await p.locator('.drillcard .phrase').textContent()); await p.fill('#d-text', `Today I used ${w} in a sentence`); await p.click('[data-a=dSubmit]'); await p.click('[data-a=dRate][data-r=unsure]'); }
  ok((await p.textContent('[data-a=flowNext]')).includes('say them'), `${name}: writing hands over to speaking`);
  await p.click('[data-a=flowNext]');
  for (let i = 0; i < +nSent; i++) { await record(); await p.click('[data-a=dSaid][data-r=good]'); }
  await p.click('[data-a=flowNext]');
  ok((await p.textContent('.today-card')).includes('All done for today'), `${name}: today's session finishes on the garden with every step ticked`);
  await shot('garden-done');
  // reminders
  ok((await p.locator('.remind', { hasText: 'Back up' }).count()) === 1, `${name}: backup reminder appears once there are notes worth losing`);
  await p.click('[data-a=backupLater]'); ok((await p.locator('.remind', { hasText: 'Back up' }).count()) === 0, `${name}: backup reminder can be snoozed`);
  // weather
  await p.evaluate(() => L.go('garden'));
  await p.click('[data-a=wxLocate]'); await p.waitForSelector('.wxchip'); ok((await p.textContent('.wxchip')).includes('Rainy'), `${name}: live weather shows rain (${await p.textContent('.wxchip')})`);
  ok(await p.locator('.scene .drop').count() > 10, `${name}: rain animation drawn`); await shot('garden-rain'); await noOverflow('garden');
  await p.evaluate(() => L.go('me')); await p.click('[data-a=wxMode][data-m=demo]'); await p.click('[data-a=wxDemo][data-c=snow]'); await p.click('[data-a=wxNight]'); await p.evaluate(() => L.go('garden')); ok(await p.locator('.sc-snow.is-night .flake').count() > 5, `${name}: preview snow at night`); await shot('garden-snow-night');
  for (const c of ['clear', 'storm', 'fog']) { await p.evaluate(c => { L.S.settings.weather.demo = c; L.S.settings.weather.night = false; L.render(); }, c); if (c === 'clear') await shot('garden-clear'); }
  // harvest
  await p.evaluate(() => { L.S.garden.cur.gp = PLANTS.tomato.need - 1; L.grow(5); L.render(); });
  await shot('garden-ready'); await p.click('[data-a=harvest]'); ok(await p.locator('.seed').count() === 7 && await p.locator('.shelfitem').count() === 1, `${name}: harvest -> collection and new seed picker`);
  // thirsty
  await p.evaluate(() => { L.plant('chilli'); const old = SRS.addDays(L.dayKey(), -5); L.S.log = { [old]: { watered: 1, pts: 0, reviews: 0, practice: 0, added: 0 } }; L.render(); }); ok(await p.locator('.plant.thirsty').count() === 1, `${name}: plant looks thirsty after 5 idle days`); await shot('garden-thirsty');
  // reload persistence
  const total = await p.evaluate(() => L.S.items.length); await p.reload(); ok(await p.evaluate(() => L.S.items.length) === total && total > NOTES.length, `${name}: data survives reload`);
  // data saved under the app's earlier name is carried over
  { const c2 = await b.newContext({ ...device }); const p2 = await c2.newPage(); await p2.addInitScript(() => { if (!localStorage.getItem('lexigrow.v1') && !localStorage.getItem('word-garden.v1')) localStorage.setItem('word-garden.v1', JSON.stringify({ items: [{ id: 'a', kind: 'word', text: 'legacy', meaning: '', example: '', note: '', stage: 0, due: '2026-11-15', added: '2026-11-14' }], log: {}, pts: 0, garden: { cur: null, done: [], bank: 0 }, settings: { cap: 10, weather: { mode: 'off' } } })); });
    await p2.goto(URL); ok(await p2.evaluate(() => L.S.items.length === 1 && L.S.items[0].text === 'legacy'), `${name}: notes saved under the old name are loaded`);
    await p2.evaluate(() => { L.today(); L.save(); }); ok(await p2.evaluate(() => !!localStorage.getItem('lexigrow.v1')), `${name}: data is saved under the new name`); await c2.close(); }
  ok(errs.length === 0, `${name}: no console errors ${errs.join(' | ')}`);
  await b.close();
}
(async () => { await run('iphone', devices['iPhone 13']); await run('ipad', devices['iPad (gen 7)']); await run('ipad-land', devices['iPad Pro 11 landscape']); console.log(fails ? `${fails} FAILED` : 'all passed'); process.exit(fails ? 1 : 0); })();
