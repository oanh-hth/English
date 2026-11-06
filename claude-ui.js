/* "Ask Claude" panel under every phrase and word, plus the API-key settings card.
 * Uses the official Anthropic SDK (bundled in vendor/anthropic-sdk.js) straight from the browser with YOUR key,
 * which is stored only in this browser's localStorage. */
import Anthropic from './vendor/anthropic-sdk.js';

const SN = window.SN, A = SN.A, esc = SN.esc;
const KEY = 'speakNatural.apikey', MODEL = 'speakNatural.model';
const MODELS = [
  ['claude-opus-5-5', 'Claude Opus 5.5 (most capable, default)'],
  ['claude-sonnet-5-5', 'Claude Sonnet 5.5 (cheaper)'],
  ['claude-haiku-5-5', 'Claude Haiku 5.5 (cheapest, fastest)'],
];
const get = k => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
const set = (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) { /* private mode */ } };

const SYSTEM = `You are a friendly American English coach helping a learner decide whether and how to use a phrase or word.
- Be concise: under 150 words unless asked for more. Use simple English.
- Say plainly if it is unnatural, dated, too formal, too casual, or more British/Australian than American.
- Give 2-3 natural American example sentences and, when useful, common alternatives.
- If you are unsure how common something is, say so instead of sounding certain.
- Use short lines and "- " bullets. No headings.`;

const md = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/^- /gm, '• ').replace(/\n/g, '<br>');

SN.aiSettingsHtml = () => `
  <h2>Claude help</h2>
  <div class="card stack">
    <p class="small muted" style="margin:0">The <b>✨ Ask Claude</b> box under each phrase uses your own Claude API key. It is saved only in this browser and sent only to Anthropic. Never share the key, and set a spend limit in the Anthropic Console. Each question costs a fraction of a cent to a couple of cents.</p>
    <input class="type" id="ai-key" type="password" placeholder="sk-ant-…" value="${esc(get(KEY))}" autocomplete="off" autocapitalize="off" spellcheck="false" style="margin:0">
    <label class="row"><span class="grow">Model</span><select id="ai-model">${MODELS.map(([id, n]) => `<option value="${id}" ${id === (get(MODEL) || MODELS[0][0]) ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
    <div class="row"><button class="btn ghost sm" data-a="aisave">Save</button><button class="btn plain sm" data-a="aiclear">Remove key</button></div>
  </div>`;

A.aisave = () => {
  const k = document.querySelector('#ai-key').value.trim();
  set(KEY, k); set(MODEL, document.querySelector('#ai-model').value);
  SN.toast(k ? 'Saved on this device.' : 'Key removed.');
};
A.aiclear = () => { set(KEY, ''); const i = document.querySelector('#ai-key'); if (i) i.value = ''; SN.toast('Key removed.'); };
A.aiq = el => {
  const box = el.closest('.aibox'); box.querySelector('.ai-q').value = el.dataset.q; A.aiask(el);
};

A.aiask = async el => {
  const box = el.closest('.aibox'), c = SN.BY_ID[box.dataset.id], out = box.querySelector('.ai-out');
  const q = box.querySelector('.ai-q').value.trim() || 'Is this natural American English? When would I use it, and when not?';
  const key = get(KEY);
  if (!key) { out.innerHTML = 'Add your Claude API key first: <b>Me → Claude help</b>.'; return; }
  const model = get(MODEL) || MODELS[0][0];
  out.textContent = 'Thinking…';
  try {
    const client = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
    const params = {
      model, max_tokens: 4000, output_config: { effort: 'low' }, system: SYSTEM,
      messages: [{ role: 'user', content: `Item: "${c.p}" (${c.v ? 'word' : 'phrase'})\nMeaning in my app: ${c.m}\n${c.c ? 'Usage note: ' + c.c + '\n' : ''}${c.ex ? 'Example: ' + c.ex + '\n' : ''}\nMy question: ${q}` }],
    };
    // Server-side fallback if the first model declines; not offered for Haiku.
    if (model !== 'claude-haiku-5-5') { params.betas = ['server-side-fallback-2026-07-01']; params.fallbacks = 'default'; }
    const res = await client.beta.messages.create(params);
    if (res.stop_reason === 'refusal') { out.textContent = 'Claude declined to answer that one. Try rephrasing your question.'; return; }
    const text = res.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    out.innerHTML = text ? md(text) : 'No answer came back. Try again.';
  } catch (e) {
    const s = e && e.status;
    out.textContent = s === 401 ? 'The API key was rejected. Check it in Me → Claude help.'
      : s === 429 ? 'Rate limited. Wait a moment and try again.'
      : s === 400 || s === 403 ? `Request not accepted: ${(e.message || '').slice(0, 160)}`
      : 'Could not reach Claude (offline or blocked). Try again.';
  }
};
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('ai-q')) { e.preventDefault(); e.target.blur(); A.aiask(e.target); }
});
