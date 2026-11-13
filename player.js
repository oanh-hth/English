/* YouTube IFrame player wrapper with "play this segment" support, plus a text-to-speech fallback.
 * Audio starts from a tap (iOS requires it), so call play functions from click handlers. */
(() => {
const L = window.L;
let apiPromise = null;
function loadApi() {
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const t = setTimeout(() => { apiPromise = null; reject(new Error('timeout')); }, 12000);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { clearTimeout(t); if (prev) prev(); resolve(); };
    const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => { clearTimeout(t); apiPromise = null; reject(new Error('load')); };
    document.head.appendChild(s);
  });
  return apiPromise;
}

const P = L.player = {
  p: null, ready: false, ytId: null, poll: null, guard: null, rate: 1, error: '', tok: 0,
  /** Create the player inside the element with the given id. Resolves when ready (or sets P.error). */
  async mount(elId, ytId) {
    P.destroy(); P.ytId = ytId; P.error = ''; const tok = ++P.tok;
    try { await loadApi(); } catch (e) { P.error = 'Could not load YouTube. Check your connection.'; return false; }
    const el = document.getElementById(elId); if (!el) return false;
    return new Promise(resolve => {
      const vars = { playsinline: 1, rel: 0, modestbranding: 1, controls: 1, fs: 1 };
      if (/^https?:/.test(location.protocol)) vars.origin = location.origin;
      P.p = new window.YT.Player(elId, {
        videoId: ytId, width: '100%', height: '100%', playerVars: vars,
        events: {
          onReady: () => { if (tok !== P.tok) return resolve(false); P.ready = true; resolve(true); },
          onError: ev => { if (tok !== P.tok) return resolve(false); P.error = [101, 150, 152, 153].includes(ev.data) ? 'The owner of this video does not allow playing it in other apps.' : 'This video could not be played.'; resolve(false); },
        },
      });
    });
  },
  stopTimers() { clearInterval(P.poll); clearTimeout(P.guard); P.poll = P.guard = null; },
  setRate(r) { P.rate = r; if (P.ready && P.p.setPlaybackRate) P.p.setPlaybackRate(r); },
  /** Play [s, e] seconds then pause. */
  playSegment(s, e, rate = 1, onEnd) {
    if (!P.ready) return false;
    P.stopTimers(); P.setRate(rate);
    P.p.seekTo(s, true); P.p.playVideo();
    const done = () => { P.stopTimers(); try { P.p.pauseVideo(); } catch (x) { /* ignore */ } if (onEnd) onEnd(); };
    P.poll = setInterval(() => { try { if (P.p.getCurrentTime() >= e - 0.05) done(); } catch (x) { done(); } }, 80);
    P.guard = setTimeout(done, ((e - s) / rate) * 1000 + 4000);
    return true;
  },
  pause() { P.stopTimers(); if (P.ready) try { P.p.pauseVideo(); } catch (e) { /* ignore */ } },
  destroy() { P.tok++; P.stopTimers(); if (P.p && P.p.destroy) try { P.p.destroy(); } catch (e) { /* ignore */ } P.p = null; P.ready = false; },
};

/** Play a transcript line: the video segment if available, else the phone's voice. */
L.playLine = (seg, { rate = 1, onEnd } = {}) => {
  if (P.ready && seg.s != null && P.playSegment(seg.s, seg.e, rate, onEnd)) return 'video';
  L.speak(seg.t, rate * 0.95, onEnd); return 'voice';
};
})();
