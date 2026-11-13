/* Optional: smarter phrase/word picks and comprehension questions from Claude.
 * Uses the official Anthropic SDK (vendor/anthropic-sdk.js) straight from the browser with YOUR key,
 * saved only in this browser's localStorage. Without a key the app works fully with its built-in analysis. */
import Anthropic from './vendor/anthropic-sdk.js';

const L = window.L, esc = L.esc, A = L.A;
const KEY = 'listen-learn.apikey', MODEL = 'listen-learn.model';
const MODELS = [['claude-opus-5-5', 'Claude Opus 5.5 (most capable)'], ['claude-sonnet-5-5', 'Claude Sonnet 5.5 (cheaper)'], ['claude-haiku-5-5', 'Claude Haiku 5.5 (cheapest)']];
const get = k => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
const set = (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) { /* private mode */ } };

L.claudeSettings = () => `<h2 class="display">Claude help (optional)</h2>
  <div class="card stack"><p class="small muted" style="margin:0">Add your own Claude API key for smarter phrase picks and comprehension questions. It is saved only in this browser and sent only to Anthropic. Set a spend limit on the key in the Anthropic Console. A video costs roughly a few cents.</p>
    <input class="type" id="ai-key" type="password" placeholder="sk-ant-…" value="${esc(get(KEY))}" autocomplete="off" autocapitalize="off" spellcheck="false" style="margin:0">
    <label class="row"><span class="grow">Model</span><select id="ai-model">${MODELS.map(([id, n]) => `<option value="${id}" ${id === (get(MODEL) || MODELS[0][0]) ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
    <div class="row"><button class="btn ghost sm" data-a="aiSave">Save</button><button class="btn plain sm" data-a="aiClear">Remove key</button></div></div>`;
A.aiSave = () => { set(KEY, document.getElementById('ai-key').value.trim()); set(MODEL, document.getElementById('ai-model').value); L.toast(get(KEY) ? 'Saved on this device.' : 'Key removed.'); };
A.aiClear = () => { set(KEY, ''); const i = document.getElementById('ai-key'); if (i) i.value = ''; L.toast('Key removed.'); };

L.claudeButton = v => get(KEY)
  ? `<button class="btn ghost" data-a="askClaude">${v.ai ? 'Refresh Claude\'s picks' : 'Smarter picks and quiz with Claude'}</button><p id="aistat" class="small muted" style="margin:0"></p>`
  : '<div class="card small" style="margin:0"><b>Want smarter picks?</b><p style="margin:4px 0 0" class="muted">Add a Claude key in Me to get hand-picked phrases and comprehension questions.</p></div>';

const SYSTEM = `You help English learners practice listening. You receive a transcript of a video. Reply with ONLY one JSON object, no other text:
{"phrases":[{"text":"...","meaning":"..."}],"words":[{"text":"...","pos":"n|v|adj|adv","meaning":"..."}],"quiz":[{"q":"...","options":["...","...","...","..."],"answer":0}]}
Rules: 8 phrases (natural spoken expressions, idioms or collocations of 2 to 6 words that appear in the transcript, copied exactly), 8 words (useful, not too basic, copied exactly as in the transcript), 5 multiple-choice comprehension questions answerable from the transcript with 4 options each and "answer" as the 0-based index. Meanings in simple English, under 12 words.`;

const parseAi = (text, v) => {
  const a = text.indexOf('{'), b = text.lastIndexOf('}'); if (a < 0 || b < 0) throw new Error('no json');
  const o = JSON.parse(text.slice(a, b + 1)), all = ' ' + v.segs.map(s => LT.norm(s.t)).join(' ') + ' ';
  const find = t => { const n = LT.norm(t); if (!n || !all.includes(' ' + n + ' ')) return null; const i = v.segs.findIndex(s => (' ' + LT.norm(s.t) + ' ').includes(' ' + n + ' ')); return i < 0 ? 0 : i; };
  const keep = (arr, kind) => (Array.isArray(arr) ? arr : []).map(x => ({ kind, text: String(x.text || '').trim(), pos: x.pos, meaning: String(x.meaning || '').trim(), count: 1, line: find(String(x.text || '')), source: 'claude' })).filter(x => x.text && x.line !== null).slice(0, 10);
  const quiz = (Array.isArray(o.quiz) ? o.quiz : []).filter(q => q && q.q && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4).map(q => ({ q: String(q.q), options: q.options.map(String), answer: q.answer })).slice(0, 6);
  return { phrases: keep(o.phrases, 'phrase'), words: keep(o.words, 'word'), quiz, at: Date.now() };
};

A.askClaude = async el => {
  const v = L.S.videos.find(x => x.id === L.V.id), key = get(KEY), stat = document.getElementById('aistat'); if (!v || !key) return;
  const model = get(MODEL) || MODELS[0][0]; el.disabled = true; if (stat) stat.textContent = 'Claude is reading the transcript…';
  try {
    const client = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
    const transcript = v.segs.map(s => s.t).join('\n').slice(0, 24000);
    const params = { model, max_tokens: 6000, output_config: { effort: 'low' }, system: SYSTEM, messages: [{ role: 'user', content: `Title: ${v.title}\n\nTranscript:\n${transcript}` }] };
    if (model !== 'claude-haiku-5-5') { params.betas = ['server-side-fallback-2026-07-01']; params.fallbacks = 'default'; }
    const res = await client.beta.messages.create(params);
    if (res.stop_reason === 'refusal') throw Object.assign(new Error('refused'), { refused: true });
    const text = res.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
    v.ai = parseAi(text, v); L.save(); L.toast('Claude picked ' + (v.ai.phrases.length + v.ai.words.length) + ' items for you.'); L.paintVideo();
  } catch (e) {
    const s = e && e.status;
    if (stat) stat.textContent = e.refused ? 'Claude declined this one.' : s === 401 ? 'The API key was rejected. Check it in Me.' : s === 429 ? 'Rate limited. Try again in a moment.' : e instanceof SyntaxError || (e && e.message === 'no json') ? 'Claude\'s answer could not be read. Try again.' : 'Could not reach Claude (offline or blocked).';
    el.disabled = false;
  }
};
