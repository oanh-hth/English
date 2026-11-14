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
  for (let i = 0; i < 8; i++) { await p.click('[data-a=reveal]'); if (i === 0) await shot('review-card'); await p.click('[data-a=grade][data-g="2"]'); }
  ok(await p.locator('.huge').textContent() === 'Review done', `${name}: review finishes`);
  const gp1 = await p.evaluate(() => L.S.garden.cur.gp); ok(gp1 - gp0 >= 8 * 4 + 10, `${name}: review grows the plant (${gp0} -> ${gp1})`);
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
  await p.reload(); ok(await p.evaluate(() => L.S.items.length) === NOTES.length + 2, `${name}: data survives reload`);
  ok(errs.length === 0, `${name}: no console errors ${errs.join(' | ')}`);
  await b.close();
}
(async () => { await run('iphone', devices['iPhone 13']); await run('ipad', devices['iPad (gen 7)']); await run('ipad-land', devices['iPad Pro 11 landscape']); console.log(fails ? `${fails} FAILED` : 'all passed'); process.exit(fails ? 1 : 0); })();
