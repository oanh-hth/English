/* Weather: live conditions from Open-Meteo (free, no API key) and the animated garden scene. */
(() => {
const L = window.L;
const LABEL = { clear: 'Clear', partly: 'Partly cloudy', cloudy: 'Cloudy', fog: 'Foggy', drizzle: 'Drizzle', rain: 'Rainy', snow: 'Snowy', storm: 'Thunderstorm' };
const NOTE = {
  clear: 'Sunny out there. Perfect growing weather.', partly: 'A few clouds, plenty of light.', cloudy: 'Grey sky, but roots keep working.',
  fog: 'Foggy morning. Your plant is waiting quietly.', drizzle: 'A light drizzle is watering the garden.', rain: 'Rain is watering your plant for free.',
  snow: 'Snowing outside. Roots stay cosy underground.', storm: 'Stormy! Your plant is holding on tight.',
};
L.COND = LABEL; L.CONDS = Object.keys(LABEL);
L.condFromCode = c => c === 0 ? 'clear' : c <= 2 ? 'partly' : c === 3 ? 'cloudy' : (c === 45 || c === 48) ? 'fog' : (c >= 51 && c <= 57) ? 'drizzle' : ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) ? 'rain' : ((c >= 71 && c <= 77) || c === 85 || c === 86) ? 'snow' : c >= 95 ? 'storm' : 'cloudy';

// [day top, day bottom, night top, night bottom, hill1 day, hill2 day, hill1 night, hill2 night]
const SKY = {
  clear:   ['#7fc0ea', '#d6efff', '#17213f', '#3b4c7a', '#8cc152', '#6fa83a', '#2f4a2a', '#25401f'],
  partly:  ['#8fc3e6', '#dcebf5', '#1d2745', '#46567f', '#86bb52', '#6aa23a', '#2f4a2a', '#25401f'],
  cloudy:  ['#a3b1bd', '#d5dce2', '#2b313b', '#4b5462', '#7fae55', '#689a3f', '#2b4328', '#233a22'],
  fog:     ['#c5cac9', '#e7e6e0', '#3a3f45', '#5b6068', '#94b569', '#7ea457', '#34492f', '#2b3f2a'],
  drizzle: ['#8795a1', '#bdc7cf', '#262c36', '#434c5a', '#78a653', '#61913d', '#2a4127', '#223720'],
  rain:    ['#6f7e8b', '#a6b2bc', '#202630', '#39424f', '#6f9f4f', '#5a8838', '#274025', '#1f351e'],
  snow:    ['#c6d2dc', '#f1f4f7', '#2c3544', '#55607a', '#e9eff2', '#d4dde3', '#8d98aa', '#7c879a'],
  storm:   ['#454d5b', '#7c8693', '#141820', '#2b313d', '#5f8a45', '#4d7637', '#23391f', '#1b2e19'],
};
const CLOUDS = { clear: 0, partly: 3, cloudy: 5, fog: 3, drizzle: 5, rain: 6, snow: 4, storm: 6 };
const DROPS = { drizzle: 18, rain: 38, storm: 52 };

L.defaultWx = () => ({ cond: 'clear', isDay: new Date().getHours() >= 6 && new Date().getHours() < 19, temp: null, place: '' });
L.wx = L.defaultWx();

/* The weather the scene should show right now, from settings. */
L.currentWx = () => {
  const w = L.S.settings.weather || {};
  if (w.mode === 'demo') return { cond: w.demo || 'clear', isDay: w.night ? false : true, temp: null, place: 'Preview' };
  if (w.mode === 'live' && L.wx.live) return L.wx;
  return L.defaultWx();
};

const CK = 'lexigrow.wx';
L.refreshWeather = async (force = false) => {
  const w = L.S.settings.weather || {};
  if (w.mode !== 'live' || w.lat == null) return;
  const key = `${w.lat},${w.lon}`;
  try { const c = JSON.parse(localStorage.getItem(CK)); if (!force && c && c.key === key && Date.now() - c.t < 30 * 60 * 1000) { L.wx = { ...c.wx, live: true, place: w.place || '' }; return L.afterWeather(); } } catch (e) { /* no cache */ }
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${w.lat}&longitude=${w.lon}&current=weather_code,is_day,temperature_2m&timezone=auto`);
    if (!r.ok) throw new Error(r.status);
    const j = (await r.json()).current;
    const wx = { cond: L.condFromCode(j.weather_code), isDay: !!j.is_day, temp: Math.round(j.temperature_2m) };
    L.wx = { ...wx, live: true, place: w.place || '' };
    try { localStorage.setItem(CK, JSON.stringify({ key, t: Date.now(), wx })); } catch (e) { /* ignore */ }
    L.afterWeather();
  } catch (e) { L.wxError = true; L.afterWeather(); }
};
L.afterWeather = () => { if (L.V.name === 'garden') L.render(true); };

L.wxLine = w => `${LABEL[w.cond]}${w.temp != null ? ` · ${w.temp}°C` : ''}${w.place ? ` · ${w.place}` : ''}`;
L.wxNote = w => NOTE[w.cond];

/* The scene: sky, sun or moon, clouds, precipitation, hills. `inner` is placed on the grass. */
L.scene = (w, inner, cls = '') => {
  const c = SKY[w.cond] ? w.cond : 'clear', p = SKY[c], day = w.isDay, top = day ? p[0] : p[2], bot = day ? p[1] : p[3], h1 = day ? p[4] : p[6], h2 = day ? p[5] : p[7];
  const sky = (c === 'clear' || c === 'partly') ? (day ? '<i class="sun"></i>' : '<i class="moon"></i><i class="star s1"></i><i class="star s2"></i><i class="star s3"></i><i class="star s4"></i><i class="star s5"></i>') : '';
  const clouds = Array.from({ length: CLOUDS[c] }, (_, i) => `<i class="cloud" style="top:${6 + (i * 17) % 38}%;left:${(i * 37) % 90 - 8}%;--s:${.7 + (i % 3) * .25};animation-duration:${60 + i * 14}s;animation-delay:-${i * 11}s;opacity:${c === 'partly' || c === 'clear' ? .95 : .85}"></i>`).join('');
  const drops = Array.from({ length: DROPS[c] || 0 }, (_, i) => `<i class="drop" style="left:${(i * 53) % 100}%;animation-delay:-${(i * 0.13).toFixed(2)}s;animation-duration:${(c === 'drizzle' ? 1.3 : .75) + (i % 4) * .1}s"></i>`).join('');
  const flakes = c === 'snow' ? Array.from({ length: 34 }, (_, i) => `<i class="flake" style="left:${(i * 29) % 100}%;animation-delay:-${(i * 0.37).toFixed(2)}s;animation-duration:${4 + (i % 5)}s;width:${4 + i % 4}px;height:${4 + i % 4}px"></i>`).join('') : '';
  return `<div class="scene ${cls} sc-${c} ${day ? 'is-day' : 'is-night'}" style="--sky1:${top};--sky2:${bot};--h1:${h1};--h2:${h2}">
    ${sky}${clouds}${c === 'fog' ? '<i class="fogband f1"></i><i class="fogband f2"></i>' : ''}${drops}${flakes}${c === 'storm' ? '<i class="bolt"></i>' : ''}
    <svg class="hills" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 52C60 28 120 30 190 50S330 62 400 36V120H0Z" fill="var(--h2)"/><path d="M0 74C80 54 150 60 220 72S340 80 400 62V120H0Z" fill="var(--h1)"/></svg>
    <div class="scene-plant">${inner || ''}</div></div>`;
};

/* ----- settings actions ----- */
L.A.wxLocate = () => {
  if (!navigator.geolocation) { L.toast('Location is not available here. Search a city instead.'); return; }
  L.toast('Finding your location...');
  navigator.geolocation.getCurrentPosition(pos => {
    L.S.settings.weather = { ...L.S.settings.weather, mode: 'live', lat: +pos.coords.latitude.toFixed(2), lon: +pos.coords.longitude.toFixed(2), place: 'Your location' };
    L.save(); L.refreshWeather(true); L.toast('Weather is on.'); L.render(true);
  }, () => L.toast('Could not get your location. Search a city instead.'), { timeout: 10000, maximumAge: 3600000 });
};
L.A.wxCity = () => {
  L.openSheet(`<h2 style="margin-top:0">Pick a city</h2><input class="type" id="cityq" placeholder="e.g. Hanoi, Austin, Lisbon" autocomplete="off"><button class="btn" data-a="wxSearch">Search</button><div id="cityres" class="stack" style="margin-top:12px"></div>`);
  setTimeout(() => { const i = document.getElementById('cityq'); if (i) i.focus(); }, 60);
};
L.A.wxSearch = async () => {
  const q = (document.getElementById('cityq') || {}).value, out = document.getElementById('cityres'); if (!q || !q.trim()) return;
  out.innerHTML = '<p class="muted">Searching...</p>';
  try {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=5&language=en`);
    const j = await r.json(); const res = j.results || [];
    L.cityResults = res;
    out.innerHTML = res.length ? res.map((c, i) => `<button class="item" data-a="wxPick" data-i="${i}"><span class="grow"><b>${L.esc(c.name)}</b><br><span class="muted small">${L.esc([c.admin1, c.country].filter(Boolean).join(', '))}</span></span></button>`).join('') : '<p class="muted">No city found. Try another spelling.</p>';
  } catch (e) { out.innerHTML = '<p class="muted">Could not reach the weather service. Check your connection.</p>'; }
};
L.A.wxPick = el => {
  const c = (L.cityResults || [])[+el.dataset.i]; if (!c) return;
  L.S.settings.weather = { ...L.S.settings.weather, mode: 'live', lat: +c.latitude.toFixed(2), lon: +c.longitude.toFixed(2), place: c.name };
  L.save(); L.closeSheet(); L.refreshWeather(true); L.toast(`Weather set to ${c.name}.`); L.render(true);
};
L.A.wxMode = el => {
  const w = L.S.settings.weather = { ...L.S.settings.weather, mode: el.dataset.m };
  if (w.mode === 'live' && w.lat == null) { L.save(); L.render(true); return L.A.wxLocate(); }
  L.save(); if (w.mode === 'live') L.refreshWeather(); L.render(true);
};
L.A.wxDemo = el => { L.S.settings.weather = { ...L.S.settings.weather, mode: 'demo', demo: el.dataset.c }; L.save(); L.render(true); };
L.A.wxNight = () => { const w = L.S.settings.weather; w.night = !w.night; L.save(); L.render(true); };
})();
