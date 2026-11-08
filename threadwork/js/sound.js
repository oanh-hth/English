// Sound effects, synthesised with Web Audio (no audio files).
let enabled=true;
export function setSound(on){ enabled=!!on; if(!enabled) rainSound(false); }
export function unlockAudio(){ if(SFX.c&&SFX.c.state==="suspended") SFX.c.resume(); }
const SFX={c:null,rain:null};
function ac(){ if(!enabled) return null; try{ if(!SFX.c) SFX.c=new (window.AudioContext||window.webkitAudioContext)(); if(SFX.c.state==="suspended") SFX.c.resume(); }catch(e){ return null; } return SFX.c; }
function noise(c,sec){ const b=c.createBuffer(1,Math.floor(c.sampleRate*sec),c.sampleRate), d=b.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; return b; }
function blip(c,t,f1,f2,dur,vol,type="sine"){ const o=c.createOscillator(),g=c.createGain(); o.type=type; o.frequency.setValueAtTime(f1,t); o.frequency.exponentialRampToValueAtTime(f2,t+dur); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.008); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g).connect(c.destination); o.start(t); o.stop(t+dur+.02); }
export function playWater(delay=.6){ const c=ac(); if(!c) return; const t=c.currentTime+delay;
  const src=c.createBufferSource(); src.buffer=noise(c,1.4); const bp=c.createBiquadFilter(); bp.type="bandpass"; bp.Q.value=.9; bp.frequency.setValueAtTime(650,t); bp.frequency.linearRampToValueAtTime(1500,t+1.1);
  const g=c.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.22,t+.12); g.gain.setValueAtTime(.22,t+.8); g.gain.linearRampToValueAtTime(0,t+1.25);
  src.connect(bp).connect(g).connect(c.destination); src.start(t); src.stop(t+1.4);
  for(let i=0;i<6;i++) blip(c,t+.15+i*.17+Math.random()*.05,1400+Math.random()*900,420,.07,.07); }
export function playChime(notes=[784,988,1319]){ const c=ac(); if(!c) return; const t=c.currentTime+.05; notes.forEach((f,i)=>{ blip(c,t+i*.1,f,f*.995,.6,.09,"triangle"); }); }
export function playHarvest(n=5){ const c=ac(); if(!c) return; const t=c.currentTime; for(let i=0;i<n;i++) blip(c,t+.25+i*.09,320,110,.16,.18); setTimeout(()=>playChime([659,784,988,1319]),900); }
let rainTimer=null;
export function rainSound(on,ms){
  if(!on){ if(SFX.rain){ const {g,src,c}=SFX.rain; g.gain.setTargetAtTime(0,c.currentTime,.25); setTimeout(()=>{try{src.stop()}catch(e){}},900); SFX.rain=null; } return; }
  if(SFX.rain) return; const c=ac(); if(!c) return;
  const src=c.createBufferSource(); src.buffer=noise(c,2.5); src.loop=true; const hp=c.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=400; const lp=c.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=2600;
  const g=c.createGain(); g.gain.setValueAtTime(0,c.currentTime); g.gain.linearRampToValueAtTime(.07,c.currentTime+.8); src.connect(hp).connect(lp).connect(g).connect(c.destination); src.start();
  SFX.rain={src,g,c}; clearTimeout(rainTimer); if(ms) rainTimer=setTimeout(()=>rainSound(false),ms);
}
export const rainPlaying=()=>!!SFX.rain;
