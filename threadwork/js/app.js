// Threadwork: tasks, notes, sketches and a garden that grows as you finish work.
import { VARIETY, STAGES, WX, setMotion, stageOf, nextStage, plantSVG, scene, waterFx, tweenPlant } from "./plant.js";
import { setSound, unlockAudio, playWater, playChime, playHarvest, rainSound, rainPlaying } from "./sound.js";
import * as store from "./store.js";
import * as auth from "./auth.js";
import * as cloud from "./cloud.js";
import * as weather from "./weather.js";

const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>Math.random().toString(36).slice(2,9);
const icon=(n,cls="i")=>`<svg class="${cls}"><use href="#i-${n}"/></svg>`;
const dayKey=(d=new Date())=>d.toISOString().slice(0,10);
const addDays=(n)=>{const d=new Date();d.setDate(d.getDate()+n);return dayKey(d)};
const GROW={low:8,medium:15,high:25,critical:40};   // % growth a finished task gives the plant
const IMP_NAME={low:"Low",medium:"Medium",high:"High",critical:"Critical"};
const FOCUS_GROW=3;
/* ---------------- Data ---------------- */
function exampleData(){
  const t=(id,title,status,imp,due,desc,links,resources,doneAt)=>({id,title,status,imp,due,desc,links,resources,doneAt:doneAt||null,sample:true});
  return {
    user:null, theme:null, streak:3, lastDone:addDays(-1), spent:2,
    garden:{kind:"tomato",growth:58,planted:addDays(-6)}, nextKind:"tomato",
    harvests:[{kind:"tomato",fruits:5,date:addDays(-9)}],
    log:[[addDays(-6),15],[addDays(-5),8],[addDays(-4),0],[addDays(-3),23],[addDays(-2),15],[addDays(-1),25]],
    tasks:[
      t("ex-t1","Draft Q4 project proposal","doing","high",addDays(2),"Outline goals, budget, timeline. Pull numbers from the survey sheet.",["ex-t2","ex-t3"],[{rid:"ex-r1",used:true},{rid:"ex-r2",used:false}]),
      t("ex-t2","Collect survey results","doing","critical",addDays(0),"Export responses and clean the duplicates.",["ex-t1"],[{rid:"ex-r3",used:true}]),
      t("ex-t3","Sketch the onboarding flow","inbox","medium",addDays(1),"Three screens: welcome, pick goals, first task.",["ex-t1","ex-t5"],[{rid:"ex-r4",used:false}]),
      t("ex-t4","Reply to Minh about the workshop","inbox","low",addDays(0),"",[],[]),
      t("ex-t5","Review vocabulary list, Unit 5","inbox","low",addDays(3),"Mark words I still miss.",["ex-t3"],[{rid:"ex-r5",used:false}]),
      t("ex-t6","Book dentist appointment","done","low",addDays(-1),"",[],[],addDays(-1)),
      t("ex-t7","Clean up the shared drive","done","medium",addDays(-2),"",[],[],addDays(-2))
    ],
    resources:[
      {id:"ex-r1",name:"Proposal template (Docs)",kind:"file",url:"https://docs.google.com",sample:true},
      {id:"ex-r2",name:"Budget 2026 spreadsheet",kind:"file",url:"",sample:true},
      {id:"ex-r3",name:"Survey form responses",kind:"link",url:"https://forms.google.com",sample:true},
      {id:"ex-r4",name:"Procreate on iPad",kind:"tool",url:"",sample:true},
      {id:"ex-r5",name:"English File: Upper-Intermediate",kind:"book",url:"",sample:true},
      {id:"ex-r6",name:"Minh (workshop host)",kind:"person",url:"",sample:true}
    ],
    notes:[
      {id:"ex-n1",kind:"draft",title:"Proposal intro, v1",body:"We want to cut onboarding time from 3 days to 1.\n\nWhy now: the survey shows 62% of new people feel lost in week one.\n\nWhat we'll do:\n- A guided first task\n- One page of goals\n- A buddy for the first week",taskId:"ex-t1",updated:Date.now()-3600e3,sample:true},
      {id:"ex-n2",kind:"data",title:"Survey numbers",rows:[["Question","Yes","No","Unsure"],["Felt lost in week 1","62","28","10"],["Knew who to ask","41","44","15"],["Would like a buddy","78","9","13"]],taskId:"ex-t2",updated:Date.now()-7200e3,sample:true},
      {id:"ex-n3",kind:"note",title:"Missed: call the bank",body:"Ask about the card limit before Friday.",taskId:null,updated:Date.now()-86400e3,sample:true}
    ],
    sketches:[],
    treats:[
      {id:"w1",name:"Coffee walk outside",cost:1},
      {id:"w2",name:"15 minutes of anything you like",cost:2},
      {id:"w3",name:"Bubble tea or a favourite snack",cost:3},
      {id:"w4",name:"One episode of your show",cost:5},
      {id:"w5",name:"A new pen, sticker pack or notebook",cost:8},
      {id:"w6",name:"Lunch at your favourite place",cost:12},
      {id:"w7",name:"Half a day off, no guilt",cost:25},
      {id:"w8",name:"The book or course you have been eyeing",cost:35}
    ],
    redeemed:[{name:"15 minutes of anything you like",at:addDays(-2),cost:2}],
    inspo:[
      {id:"ex-p1",type:"quote",text:"Small steps every day add up to big results.",who:"Pinned by you",sample:true},
      {id:"ex-p2",type:"goal",title:"Why I'm doing this",text:"By March: lead the onboarding project and speak confidently in English meetings.",sample:true},
      {id:"ex-p3",type:"quote",text:"You don't have to see the whole staircase. Just take the first step.",who:"Martin Luther King Jr.",sample:true}
    ],
    focusDone:2,
    scene:{weather:"auto",time:"auto",motion:"normal",sound:true}
  };
}
function fresh(){
  return { v:3, savedAt:0, profile:{name:"",email:""}, theme:null, streak:0, lastDone:null, spent:0,
    garden:{kind:"tomato",growth:0,planted:dayKey()}, nextKind:"tomato", harvests:[], log:[],
    tasks:[], resources:[], notes:[], sketches:[], treats:exampleData().treats, redeemed:[], inspo:[], focusDone:0,
    scene:{weather:"auto",time:"auto",motion:"normal",sound:true,place:null,live:null} };
}
function normalize(st){ const f=fresh(); for(const k in f) if(st[k]===undefined) st[k]=f[k]; st.scene={...f.scene,...st.scene}; return st; }
let S=fresh();
const live={t:[]};   // timers owned by the current view
let signedIn=false;

/* ---------------- Saving & sync ---------------- */
let saveT=null, cloudT=null, pending={changed:[],removed:[]}, sync={status:"off",at:null,error:""}, deferred=null;
function save(){ S.savedAt=Date.now(); clearTimeout(saveT); saveT=setTimeout(persist,250); }
async function persist(){
  try{ const r=await store.saveState(S); pending.changed.push(...r.changed); pending.removed.push(...r.removed); }
  catch(e){ toast("Couldn't save on this device: "+esc(e.message)); return; }
  if(cloud.user()){ clearTimeout(cloudT); cloudT=setTimeout(pushCloud,1200); }
}
async function pushCloud(){
  if(!cloud.user()) return;
  const p=pending; pending={changed:[],removed:[]}; sync.status="syncing"; paintSync();
  try{ await cloud.push(JSON.stringify(store.stripImages(S)),S.savedAt,p.changed,p.removed); sync={status:"ok",at:Date.now(),error:""}; }
  catch(e){ pending.changed.push(...p.changed); pending.removed.push(...p.removed); sync={status:"error",at:sync.at,error:e.message}; }
  paintSync();
}
const typing=()=>!!document.activeElement?.matches?.("input,textarea,select");
async function applyRemote(d){
  if(!d?.json) return;
  const st=normalize(JSON.parse(d.json));
  if((st.savedAt||0)<=(S.savedAt||0)) return;
  if(typing()){ deferred=d; return; }
  await store.attachImages(st,cloud.fetchImage);
  S=st; await store.saveState(S); applyPrefs();
  sync={status:"ok",at:Date.now(),error:""};
  if(signedIn){ render(); if(openId) task(openId)?openTask(openId):closeDrawer(); toast("Updated from your other device"); }
}
document.addEventListener("focusout",()=>setTimeout(()=>{ if(deferred&&!typing()){ const d=deferred; deferred=null; applyRemote(d); } },300));
function syncLabel(){
  if(!cloud.enabled()) return "Sync is off. Everything is saved on this device only.";
  if(!cloud.user()) return "Sync is set up, but you are not signed in.";
  if(sync.status==="syncing") return "Syncing…";
  if(sync.status==="error") return `Sync problem: ${esc(sync.error)} Changes are kept on this device and will be sent again.`;
  return sync.at?`Synced at ${new Date(sync.at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})} as ${esc(cloud.user().email)}`:`Connected as ${esc(cloud.user().email)}`;
}
function paintSync(){ const el=$("#sync-status"); if(el) el.innerHTML=syncLabel(); }
const hasContent=st=>!!(st.tasks.length||st.notes.length||st.sketches.length||st.harvests.length||st.garden.growth>0);
const allImages=()=>[...S.sketches.filter(x=>x.img).map(x=>({id:x.id,data:x.img})),...S.inspo.filter(p=>p.type==="image"&&p.src).map(p=>({id:p.id,data:p.src}))];
async function pushEverything(){ await cloud.pushAllImages(allImages()); if(!S.savedAt) S.savedAt=Date.now(); await cloud.push(JSON.stringify(store.stripImages(S)),S.savedAt); sync={status:"ok",at:Date.now(),error:""}; }
async function startCloud(){
  try{
    const remote=await cloud.readState(), key="tw.linked."+cloud.user().uid, linked=localStorage.getItem(key);
    if(!remote) await pushEverything();
    else{
      const rs=normalize(JSON.parse(remote.json));
      if(!linked&&hasContent(S)&&hasContent(rs)){
        const pick=await ask("Two copies of your work","This device and your account both have data. Which one do you want to keep? The other copy is replaced.",
          [["cloud",`Keep the account copy (${rs.tasks.length} tasks)`],["local",`Keep this device's copy (${S.tasks.length} tasks)`]]);
        if(pick==="local"){ S.savedAt=Date.now(); await store.saveState(S); await pushEverything(); }
        else { rs.savedAt=Math.max(rs.savedAt||0,(S.savedAt||0)+1); await applyRemote({json:JSON.stringify(rs)}); }
      } else if((rs.savedAt||0)>(S.savedAt||0)) await applyRemote(remote);
      else await pushEverything();
    }
    localStorage.setItem(key,"1");
    cloud.watch(applyRemote); paintSync();
  }catch(e){ sync={status:"error",at:null,error:e.message}; paintSync(); }
}

/* ---------------- In-page dialog ---------------- */
function ask(title,text,options){
  return new Promise(done=>{
    const d=$("#dialog"); $("#scrim").hidden=false; d.hidden=false;
    d.innerHTML=`<h2>${esc(title)}</h2><p class="muted">${esc(text)}</p><div class="stack" style="gap:8px">${options.map(([v,l],i)=>`<button class="btn ${i===0?"primary":""}" data-choice="${v}" style="justify-content:center">${esc(l)}</button>`).join("")}</div>`;
    d.onclick=e=>{ const b=e.target.closest("[data-choice]"); if(!b) return; d.hidden=true; if(!openId) $("#scrim").hidden=true; done(b.dataset.choice); };
  });
}

/* ---------------- Weather ---------------- */
const liveFresh=()=>{ const l=S.scene.live; return !!S.scene.place&&!!l&&Date.now()-l.at<3*3600e3; };
const wx=()=>S.scene.weather!=="auto"?S.scene.weather:(liveFresh()?S.scene.live.kind:"sun");
const night=()=>S.scene.time==="day"?false:S.scene.time==="night"?true:(S.scene.weather==="auto"&&liveFresh()?!S.scene.live.isDay:(h=>h<6||h>=19)(new Date().getHours()));
const sceneLabel=()=>S.scene.weather==="auto"&&liveFresh()?`${S.scene.live.desc} · ${S.scene.live.temp}°`:undefined;
const plantOpts=()=>({thirsty:thirsty()&&wx()!=="rain",weather:wx(),night:night(),label:sceneLabel()});
async function refreshWeather(force){
  const p=S.scene.place; if(!p) return;
  const l=S.scene.live; if(!force&&l&&Date.now()-l.at<30*60e3) return;
  try{ S.scene.live=await weather.current(p.lat,p.lon); save(); if(signedIn&&!typing()&&["garden","today","inspire","settings"].includes(cur())){ const y=$("#view").scrollTop; render(); $("#view").scrollTop=y; } }
  catch(e){ if(force) toast(esc(e.message)); }
}
setInterval(()=>refreshWeather(false),10*60e3);
document.addEventListener("visibilitychange",()=>{ if(!document.hidden) refreshWeather(false); });
function applyPrefs(){ applyTheme(); setMotion(S.scene.motion); setSound(S.scene.sound); }

const task=id=>S.tasks.find(t=>t.id===id);
const res=id=>S.resources.find(r=>r.id===id);
const harvested=()=>S.harvests.reduce((a,h)=>a+h.fruits,0);
const basket=()=>harvested()-S.spent;
const thirsty=()=>!!S.lastDone&&S.lastDone<addDays(-2)&&S.garden.growth>=5;
const unlocked=k=>S.harvests.length>=VARIETY[k].unlock;

/* ---------------- Theme ---------------- */
function applyTheme(){ if(S.theme) document.documentElement.setAttribute("data-theme",S.theme); else document.documentElement.removeAttribute("data-theme"); }

/* ---------------- Auth ---------------- */
let authMode="signin";
function showLogin(mode,msg=""){
  authMode=mode; signedIn=false; $("#app").hidden=true; $("#login").hidden=false;
  const err=`<p class="err" id="auth-err" role="alert">${esc(msg)}</p>`;
  const field=(id,label,type,ac,ph,val="")=>`<div class="stack" style="gap:6px"><label class="label" for="${id}">${label}</label><input class="input" id="${id}" type="${type}" autocomplete="${ac}" placeholder="${ph}" value="${esc(val)}" required></div>`;
  const B={
    create:`<div><h2>Create your account</h2><p class="muted">Your password locks Threadwork on this device.</p></div>
      <form id="auth-create" class="stack" novalidate>${field("a-name","Your name","text","name","What should we call you?")}${field("a-email","Email","email","username","you@example.com")}${field("a-pass","Password","password","new-password","At least 8 characters")}${field("a-pass2","Repeat password","password","new-password","Type it again")}${err}
      <button class="btn primary big" type="submit">Create account</button></form>
      <p class="proto-note">Already using Threadwork on another device? <button class="linkish" data-auth="cloud-setup">Connect sync instead</button></p>`,
    signin:`<div><h2>Welcome back</h2><p class="muted">Sign in to your tasks, sketches and garden.</p></div>
      <form id="auth-signin" class="stack" novalidate>${field("a-email","Email","email","username","you@example.com",S.profile.email)}${field("a-pass","Password","password","current-password","Your password")}${err}
      <button class="btn primary big" type="submit">Sign in</button></form>
      <p class="proto-note">Forgot your password? It can't be recovered on this device. <button class="linkish" data-auth="reset">Reset this device</button></p>`,
    reset:`<div><h2>Reset this device?</h2><p class="muted">This erases every task, note, sketch and plant stored on this device, then lets you create a new account. If sync is on, your data is still in your account.</p></div>
      ${err}<button class="btn big danger" data-auth="wipe">Erase this device</button><button class="btn ghost" data-auth="signin">Cancel</button>`,
    cloud:`<div><h2>Sign in to sync</h2><p class="muted">Use the email and password of your Threadwork sync account.</p></div>
      <form id="auth-cloud" class="stack" novalidate>${field("a-email","Email","email","username","you@example.com",S.profile.email)}${field("a-pass","Password","password","current-password","At least 8 characters")}${err}
      <div class="row"><button class="btn primary big" type="submit" style="flex:1">Sign in</button><button class="btn big" type="button" data-auth="cloud-new" style="flex:1">Create account</button></div></form>
      <p class="proto-note"><button class="linkish" data-auth="forgot">Email me a reset link</button> · <button class="linkish" data-auth="cloud-off">Stop syncing on this device</button></p>`,
    "cloud-setup":`<div><h2>Connect sync</h2><p class="muted">Paste the Firebase config from your project (Project settings → Your apps → SDK setup and configuration → Config). The README explains the setup.</p></div>
      <form id="auth-setup" class="stack" novalidate><label class="label" for="a-config">Firebase config</label><textarea class="input" id="a-config" placeholder="const firebaseConfig = { apiKey: ..., projectId: ..., appId: ... }" style="min-height:140px;font-family:var(--f-mono);font-size:.8rem"></textarea>${err}
      <button class="btn primary big" type="submit">Connect</button></form>
      <button class="btn ghost" data-auth="back">Back</button>`,
    offline:`<div><h2>You're offline</h2><p class="muted">Sign-in needs a connection the first time on this device. Connect to the internet and try again.</p></div><button class="btn primary big" data-auth="retry">Try again</button>`
  };
  $("#auth-body").innerHTML=B[mode];
  setTimeout(()=>{ const f=$("#auth-body input:not([value]):not([type=hidden]), #auth-body input[value=''], #auth-body textarea"); f&&f.focus(); },60);
}
const authErr=m=>{ const e=$("#auth-err"); if(e) e.textContent=m; };
const validEmail=e=>/^\S+@\S+\.\S+$/.test(e);
async function backToStart(){ if(cloud.enabled()) return showLogin("cloud"); showLogin(await auth.hasAccount()?"signin":"create"); }
document.addEventListener("click",async e=>{
  const b=e.target.closest("[data-auth]"); if(!b) return; e.preventDefault();
  const a=b.dataset.auth;
  if(a==="cloud-setup"||a==="reset"||a==="signin") showLogin(a);
  if(a==="back"||a==="retry") backToStart();
  if(a==="wipe"){ await store.wipeAll(); auth.endSession(); cloud.setConfig(null); location.reload(); }
  if(a==="cloud-off"){ cloud.setConfig(null); location.reload(); }
  if(a==="forgot"){ const em=$("#a-email").value.trim(); if(!validEmail(em)) return authErr("Enter your email first."); try{ await cloud.resetPassword(em); authErr("Check your inbox for a reset link."); }catch(x){ authErr(firebaseMsg(x)); } }
  if(a==="cloud-new"){ const em=$("#a-email").value.trim(), pw=$("#a-pass").value; if(!validEmail(em)) return authErr("Enter a valid email address."); if(pw.length<8) return authErr("Use at least 8 characters for the password.");
    try{ authErr("Creating your account…"); await cloud.signUp(em,pw); }catch(x){ authErr(firebaseMsg(x)); } }
});
function firebaseMsg(x){
  const c=x?.code||""; return c.includes("invalid-credential")||c.includes("wrong-password")||c.includes("user-not-found")?"Email or password is wrong.":
    c.includes("email-already-in-use")?"An account with this email already exists. Sign in instead.":c.includes("weak-password")?"Choose a longer password.":
    c.includes("admin-restricted")||c.includes("operation-not-allowed")?"New accounts are turned off for this project. Sign in with your existing account.":
    c.includes("network")?"No connection. Try again when you're online.":c.includes("too-many-requests")?"Too many tries. Wait a minute and try again.":(x?.message||"Something went wrong.");
}
async function onAuthSubmit(f){
  const v=id=>($("#"+id)?.value||"").trim();
  if(f.id==="auth-create"){
    if(!v("a-name")) return authErr("Enter your name."); if(!validEmail(v("a-email"))) return authErr("Enter a valid email address.");
    if($("#a-pass").value.length<8) return authErr("Use at least 8 characters for the password."); if($("#a-pass").value!==$("#a-pass2").value) return authErr("The two passwords don't match.");
    authErr("Creating your account…"); await auth.createAccount(v("a-name"),v("a-email"),$("#a-pass").value);
    S.profile={name:v("a-name"),email:v("a-email").toLowerCase()}; save(); enterApp();
  }
  if(f.id==="auth-signin"){
    authErr("Checking…");
    if(await auth.checkPassword(v("a-email"),$("#a-pass").value)){ auth.startSession(v("a-email")); enterApp(); } else authErr("Email or password is wrong.");
  }
  if(f.id==="auth-cloud"){
    if(!validEmail(v("a-email"))) return authErr("Enter a valid email address.");
    try{ authErr("Signing in…"); await cloud.signIn(v("a-email"),$("#a-pass").value); }catch(x){ authErr(firebaseMsg(x)); }
  }
  if(f.id==="auth-setup") connectCloud($("#a-config").value,authErr);
}
async function connectCloud(text,report){
  const cfg=cloud.parseConfig(text);
  if(!cfg) return report("That doesn't look like a Firebase config. It needs apiKey, projectId and appId.");
  cloud.setConfig(cfg); report("Connecting…");
  try{ await cloud.init(); location.reload(); }catch(e){ cloud.setConfig(null); report("Couldn't load Firebase. Check your connection and the config."); }
}
function enterApp(){
  if(signedIn) return; signedIn=true;
  $("#login").hidden=true; $("#app").hidden=false; render(); refreshWeather(false);
}
async function boot(){
  try{ const st=await store.loadState(); if(st) S=normalize(st); }catch(e){}
  applyPrefs();
  if("serviceWorker" in navigator && location.protocol!=="file:") navigator.serviceWorker.register("sw.js").catch(()=>{});
  if(cloud.enabled()){
    try{
      await cloud.init();
      cloud.onUser(u=>{
        if(u){ S.profile.email=u.email; if(!S.profile.name) S.profile.name=u.email.split("@")[0]; auth.startSession(u.email); enterApp(); startCloud(); }
        else if(signedIn) location.reload(); else showLogin("cloud");
      });
    }catch(e){ if(auth.sessionValid()) enterApp(); else showLogin("offline"); }
    return;
  }
  if(!(await auth.hasAccount())) return showLogin("create");
  if(auth.sessionValid()) return enterApp();
  showLogin("signin");
}

/* ---------------- Routing ---------------- */
const VIEWS=["today","tasks","map","sketch","notes","resources","inspire","garden","settings"];
const cur=()=>{const h=location.hash.slice(1);return VIEWS.includes(h)?h:"today"};
window.addEventListener("hashchange",()=>{ if(signedIn){ closeDrawer(); render(); } });
let ctx={noteId:null,sketchTask:null,editSketch:null};

function render(){
  const v=cur();
  document.querySelectorAll(".nav[href]").forEach(a=>{ if(a.getAttribute("href")==="#"+v) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  renderStats();
  if(v!=="sketch") teardownSketch();
  live.t.forEach(clearTimeout); live.t=[];
  $("#view").innerHTML=R[v]();
  rainSound(v==="garden"&&wx()==="rain"&&S.scene.sound);
  if(v==="garden"&&!matchMedia("(prefers-reduced-motion: reduce)").matches){ const loop=()=>{ const el=$("#smp-water"); if(!el) return; waterFx(el); live.t.push(setTimeout(loop,4200)); }; live.t.push(setTimeout(loop,1200)); }
  if(v==="sketch") setupSketch();
  if(v==="inspire") paintTimer();
  $("#view").scrollTop=0;
}
function renderStats(){
  const G=S.garden, V=VARIETY[G.kind];
  $("#stats").innerHTML=`<a class="stat plant-chip" href="#garden" title="Your plant">${plantSVG(G.kind,G.growth,{...plantOpts(),noBee:true})}<span>${V.name} <span class="mono">${Math.round(G.growth)}%</span></span></a><span class="stat" title="Harvest you can trade for treats"><span class="fruit-dot" style="background:${V.fruit};width:14px;height:14px"></span><span class="mono">${basket()}</span></span><span class="stat" title="Days in a row with a finished task">${icon("flame")}<span class="mono">${S.streak}</span>&nbsp;days</span>`;
}

/* ---------------- Views ---------------- */
const R={};
const fmtDue=d=>{ if(!d) return ""; const diff=Math.round((new Date(d)-new Date(dayKey()))/864e5); return diff===0?"Due today":diff===1?"Due tomorrow":diff<0?`${-diff}d overdue`:`Due in ${diff}d`; };
const countFor=t=>({links:t.links.length,res:t.resources.length,att:S.notes.filter(n=>n.taskId===t.id).length+S.sketches.filter(s=>s.taskId===t.id).length});

function taskLine(t){
  const c=countFor(t);
  return `<div class="task-line">
    <button class="check ${t.status==="done"?"on":""}" data-act="toggle" data-id="${t.id}" aria-label="${t.status==="done"?"Mark not done":"Mark done"}">${icon("check")}</button>
    <button class="t" data-act="open" data-id="${t.id}"><b>${esc(t.title)}</b>
      <span class="meta"><span>${fmtDue(t.due)}</span><span class="imp ${t.imp}">${IMP_NAME[t.imp]}</span>${c.links?`<span>${c.links} linked</span>`:""}${c.res?`<span>${c.res} resources</span>`:""}</span></button>
    <span class="pill ${t.status}">${t.status}</span>
  </div>`;
}

R.today=()=>{
  const open=S.tasks.filter(t=>t.status!=="done");
  const todays=open.filter(t=>t.due&&t.due<=addDays(1)).sort((a,b)=>a.due.localeCompare(b.due));
  const doneToday=S.tasks.filter(t=>t.status==="done"&&t.doneAt===dayKey()).length;
  const goal=Math.max(3,doneToday+todays.filter(t=>t.due<=dayKey()).length);
  const pct=Math.min(1,doneToday/goal);
  const G=S.garden, V=VARIETY[G.kind], ns=nextStage(G.growth);
  const q=S.inspo.filter(p=>p.type==="quote");
  const quote=q[new Date().getDate()%Math.max(1,q.length)];
  const hr=new Date().getHours(); const hi=hr<12?"Good morning":hr<18?"Good afternoon":"Good evening";
  const C=2*Math.PI*46;
  return `<div class="view-head"><div><span class="label">${new Date().toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long"})}</span><h1>${hi}${S.profile.name?", "+esc(S.profile.name):""}</h1></div>
    ${hasExamples()?`<button class="btn sm" data-act="remove-examples">Remove example data</button>`:""}</div>
  ${S.tasks.length?"":`<div class="card start-card"><h2>Start here</h2><ol><li>Type a task in the bar at the top and press <b>Add</b>. It goes to your Inbox.</li><li>Open a task to set how important it is, link it to other tasks, and attach notes, sketches and resources.</li><li>Finish it to water your tomato. Important tasks make it grow faster.</li></ol><div class="row"><button class="btn" data-act="add-examples">Add example data to explore</button><a class="btn ghost" href="#settings">Set your weather location</a></div></div>`}
  <div class="today-grid">
    <div class="stack" style="gap:16px">
      <div class="card hero-card">
        <svg class="ring" viewBox="0 0 110 110" aria-label="${doneToday} of ${goal} done today"><circle cx="55" cy="55" r="46" stroke="var(--line)" stroke-width="10" fill="none"/><circle cx="55" cy="55" r="46" stroke="var(--good)" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct)}" transform="rotate(-90 55 55)"/><text x="55" y="62" text-anchor="middle" font-size="24">${doneToday}/${goal}</text></svg>
        <div class="stack" style="gap:6px"><h2>${doneToday>=goal?"Today's goal is done. Your plant is happy.":doneToday?"Good pace. Keep the thread going.":"Pick one task and start small."}</h2>
        <p class="muted">Every finished task makes your ${V.name.toLowerCase()} grow. More important tasks grow it faster. You are on a <b>${S.streak}-day streak</b>.</p></div>
      </div>
      <div class="card"><div class="sect-head" style="margin-bottom:4px"><h2>Due today &amp; tomorrow</h2><a class="btn sm ghost" href="#tasks">All tasks</a></div>
        ${todays.length?todays.map(taskLine).join(""):`<p class="empty">Nothing due soon. Capture a task in the bar above.</p>`}
      </div>
      <div class="card"><div class="sect-head" style="margin-bottom:4px"><h2>Captured, not planned yet</h2><span class="muted" style="font-size:.85rem">Inbox</span></div>
        ${open.filter(t=>t.status==="inbox"&&!todays.includes(t)).map(taskLine).join("")||`<p class="empty">Inbox is clear.</p>`}
      </div>
    </div>
    <div class="stack" style="gap:16px">
      ${quote?`<div class="card pin-quote"><p class="quote">“${esc(quote.text)}”</p><p class="who">${esc(quote.who||"")}</p></div>`:""}
      <a class="card mini-plant" href="#garden" style="text-decoration:none;color:inherit">${scene("small",G.kind,G.growth,plantOpts(),"data-live-plant",false)}
        <div class="stack" style="gap:6px"><span class="label">Your ${V.name.toLowerCase()}</span><h3>${stageOf(G.growth)[1]} · ${Math.round(G.growth)}%</h3>
        ${G.growth>=100?`<span class="btn sm gold">Ready to harvest</span>`:`<p class="muted" style="font-size:.88rem">${ns[0]-Math.round(G.growth)}% to ${ns[1].toLowerCase()}. About ${Math.ceil((ns[0]-G.growth)/GROW.medium)} medium task${Math.ceil((ns[0]-G.growth)/GROW.medium)>1?"s":""}.</p>`}
        ${thirsty()?(wx()==="rain"?`<p class="muted" style="font-size:.85rem">The rain watered your plant.</p>`:`<p class="thirsty">Your plant is thirsty. Finish a task to water it.</p>`):""}</div></a>
      <div class="card stack"><div class="sect-head"><h2>Recent work</h2></div>
        ${[...S.notes].sort((a,b)=>b.updated-a.updated).slice(0,3).map(n=>`<button class="note-item" data-act="open-note" data-id="${n.id}"><b>${esc(n.title||"Untitled")}</b><small>${n.kind==="data"?"Data table":n.kind==="draft"?"Draft":"Note"}${n.taskId&&task(n.taskId)?" · "+esc(task(n.taskId).title):""}</small></button>`).join("")}
        ${S.sketches.slice(-2).reverse().map(s=>`<button class="attach" data-act="open-sketch" data-id="${s.id}"><img src="${s.img}" alt=""><span>${esc(s.title)}</span></button>`).join("")}
      </div>
    </div>
  </div>`;
};

R.tasks=()=>{
  const cols=[["inbox","Inbox","Captured ideas and missed tasks"],["doing","Doing","What you're working on"],["done","Done","Finished and rewarded"]];
  return `<div class="view-head"><div><h1>Tasks</h1><p>Drag cards between columns, or tap one to link tasks, attach resources, notes and sketches.</p></div>
    <button class="btn primary" data-act="new-task">${icon("plus")}New task</button></div>
  <div class="board">${cols.map(([k,n,d])=>{
    const list=S.tasks.filter(t=>t.status===k);
    return `<section class="col" data-col="${k}"><div class="col-head"><div><h3>${n}</h3><small class="muted">${d}</small></div><span class="mono muted">${list.length}</span></div>
    ${list.map(t=>{const c=countFor(t);return `<button class="tcard ${k==="done"?"is-done":""}" draggable="true" data-act="open" data-id="${t.id}">
      <div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b>${esc(t.title)}</b><span class="imp ${t.imp}">${IMP_NAME[t.imp]}</span></div>
      <div class="icons">${t.due?`<span>${fmtDue(t.due)}</span>`:""}${c.links?`<span>${icon("link")}${c.links}</span>`:""}${c.res?`<span>${icon("box")}${c.res}</span>`:""}${c.att?`<span>${icon("note")}${c.att}</span>`:""}</div></button>`}).join("")||`<p class="empty">Drop a task here</p>`}
    </section>`}).join("")}</div>`;
};

R.map=()=>{
  const W=900,H=560, nodes=[], edges=[];
  S.tasks.forEach(t=>nodes.push({id:t.id,kind:"task",label:t.title,status:t.status}));
  S.notes.filter(n=>n.taskId).forEach(n=>{nodes.push({id:n.id,kind:"note",label:n.title});edges.push([n.id,n.taskId,"att"])});
  S.sketches.filter(s=>s.taskId).forEach(s=>{nodes.push({id:s.id,kind:"sketch",label:s.title});edges.push([s.id,s.taskId,"att"])});
  const usedR=new Set(); S.tasks.forEach(t=>t.resources.forEach(r=>{usedR.add(r.rid);edges.push([t.id,r.rid,r.used?"used":"res"])}));
  S.resources.filter(r=>usedR.has(r.id)).forEach(r=>nodes.push({id:r.id,kind:"res",label:r.name}));
  const seen=new Set(); S.tasks.forEach(t=>t.links.forEach(l=>{const k=[t.id,l].sort().join("|"); if(!seen.has(k)&&task(l)){seen.add(k);edges.push([t.id,l,"link"])}}));
  // simple force layout, deterministic
  const idx={}; nodes.forEach((n,i)=>{idx[n.id]=n; const a=i/nodes.length*Math.PI*2; n.x=W/2+Math.cos(a)*220; n.y=H/2+Math.sin(a)*170;});
  const E=edges.filter(e=>idx[e[0]]&&idx[e[1]]);
  for(let it=0;it<300;it++){
    nodes.forEach(a=>{a.vx=0;a.vy=0});
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j];let dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy)||1;const f=5200/(d*d);a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f;}
    E.forEach(([s,t,k])=>{const a=idx[s],b=idx[t];let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;const L=k==="link"?150:105;const f=(d-L)*.04;a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f;});
    nodes.forEach(n=>{n.vx+=(W/2-n.x)*.004;n.vy+=(H/2-n.y)*.004;n.x=Math.max(70,Math.min(W-70,n.x+n.vx));n.y=Math.max(30,Math.min(H-30,n.y+n.vy));});
  }
  const col={inbox:"var(--muted)",doing:"var(--accent)",done:"var(--good)"};
  const short=s=>s.length>24?s.slice(0,23)+"…":s;
  const shape=n=>n.kind==="task"?`<circle r="13" fill="${col[n.status]}" stroke="var(--surface)" stroke-width="2"/>`
    :n.kind==="res"?`<path d="M0-10L10 0 0 10-10 0z" fill="var(--gold)" stroke="var(--surface)" stroke-width="2"/>`
    :`<rect x="-8" y="-8" width="16" height="16" rx="3" fill="${n.kind==="sketch"?"var(--warn)":"var(--surface)"}" stroke="${n.kind==="sketch"?"var(--surface)":"var(--ink)"}" stroke-width="2"/>`;
  const act=n=>n.kind==="task"?`data-act="open" data-id="${n.id}"`:n.kind==="note"?`data-act="open-note" data-id="${n.id}"`:n.kind==="sketch"?`data-act="open-sketch" data-id="${n.id}"`:`data-act="goto" data-to="resources"`;
  return `<div class="view-head"><div><h1>Link map</h1><p>Every task, the notes and sketches attached to it, and the resources it uses. Tap any dot to open it.</p></div></div>
  <div class="map-wrap"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Map of linked tasks, notes and resources">
    ${E.map(([s,t,k])=>{const a=idx[s],b=idx[t];return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${k==="link"?"var(--accent)":k==="used"?"var(--gold)":"var(--line)"}" stroke-width="${k==="link"?2.5:1.6}" ${k==="att"||k==="res"?'stroke-dasharray="5 5"':""}/>`}).join("")}
    ${nodes.map(n=>`<g class="node" transform="translate(${n.x},${n.y})" ${act(n)} tabindex="0" role="button" aria-label="${esc(n.label)}">${shape(n)}<text y="${n.kind==="task"?30:26}" text-anchor="middle" font-weight="${n.kind==="task"?700:400}">${esc(short(n.label))}</text></g>`).join("")}
  </svg></div>
  <div class="map-legend">
    <span><svg width="14" height="14"><circle cx="7" cy="7" r="6" fill="var(--accent)"/></svg>Task (blue doing · grey inbox · green done)</span>
    <span><svg width="14" height="14"><rect x="1" y="1" width="12" height="12" rx="2" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.5"/></svg>Note / draft / data</span>
    <span><svg width="14" height="14"><rect x="1" y="1" width="12" height="12" rx="2" fill="var(--warn)"/></svg>Sketch</span>
    <span><svg width="14" height="14"><path d="M7 1l6 6-6 6-6-6z" fill="var(--gold)"/></svg>Resource (gold line = used)</span>
    <span><svg width="24" height="6"><line x1="0" y1="3" x2="24" y2="3" stroke="var(--accent)" stroke-width="2.5"/></svg>Linked tasks</span>
  </div>`;
};

R.sketch=()=>{
  const ed=ctx.editSketch&&S.sketches.find(s=>s.id===ctx.editSketch);
  const taskSel=ed?ed.taskId:ctx.sketchTask;
  return `<div class="view-head"><div><h1>Sketch</h1><p>Draw with Apple Pencil: pressure changes the line. With the pencil, your palm and fingers are ignored, so you can rest your hand.</p></div></div>
  <div class="sketch-tools" role="toolbar" aria-label="Drawing tools">
    <button class="tool" data-tool="pen" aria-label="Pen">${icon("pencil")}</button>
    <button class="tool" data-tool="marker" aria-label="Highlighter">${icon("marker")}</button>
    <button class="tool" data-tool="eraser" aria-label="Eraser">${icon("eraser")}</button>
    <span class="sep"></span>
    ${["#1D2227","#2F45C2","#C2412F","#2C8A57","#E2A21A"].map(c=>`<button class="swatch" data-color="${c}" style="background:${c}" aria-label="Colour ${c}"></button>`).join("")}
    <span class="sep"></span>
    <label class="row" style="gap:6px;font-size:.8rem" for="sk-size">Size<input id="sk-size" type="range" min="1" max="24" value="4" style="width:90px"></label>
    <button class="tool" data-act="sk-undo" aria-label="Undo">${icon("undo")}</button>
    <button class="tool" data-act="sk-clear" aria-label="Clear page">${icon("trash")}</button>
  </div>
  <div class="canvas-wrap" id="canvas-wrap"><canvas id="sketch"></canvas><span class="pen-hint" id="pen-hint">Finger or mouse draws until a pencil is detected</span></div>
  <div class="row" style="margin-top:12px">
    <input class="input" id="sk-title" placeholder="Name this sketch" value="${esc(ed?ed.title:"")}" style="flex:1;min-width:180px">
    <select class="input" id="sk-task" style="flex:1;min-width:180px" aria-label="Attach to task"><option value="">Not attached to a task</option>${S.tasks.map(t=>`<option value="${t.id}" ${t.id===taskSel?"selected":""}>${esc(t.title)}</option>`).join("")}</select>
    <button class="btn primary" data-act="sk-save">${icon("check")}${ed?"Save changes":"Save sketch"}</button>
    ${ed?`<button class="btn" data-act="sk-new">New page</button>`:""}
  </div>
  <h2 style="margin-top:28px">Saved sketches</h2>
  <div class="gallery">${S.sketches.length?S.sketches.slice().reverse().map(s=>`<button class="attach" data-act="open-sketch" data-id="${s.id}"><img src="${s.img}" alt=""><b>${esc(s.title)}</b><small class="muted">${s.taskId&&task(s.taskId)?esc(task(s.taskId).title):"No task"}</small></button>`).join(""):`<p class="empty">Your saved sketches appear here. Draw a wireframe, a chart idea or a mind map and save it to a task.</p>`}</div>`;
};

R.notes=()=>{
  const list=[...S.notes].sort((a,b)=>b.updated-a.updated);
  if(!ctx.noteId||!S.notes.find(n=>n.id===ctx.noteId)) ctx.noteId=list[0]?.id||null;
  const n=S.notes.find(x=>x.id===ctx.noteId);
  const kinds={note:"Note",draft:"Draft",data:"Data table"};
  return `<div class="view-head"><div><h1>Notes &amp; drafts</h1><p>Quick notes for things you might miss, longer drafts, and small data tables to rough out numbers.</p></div>
    <div class="row"><button class="btn" data-act="new-note" data-kind="note">${icon("plus")}Note</button><button class="btn" data-act="new-note" data-kind="draft">${icon("plus")}Draft</button><button class="btn" data-act="new-note" data-kind="data">${icon("plus")}Data table</button></div></div>
  <div class="notes-layout">
    <div class="stack" style="gap:8px">${list.map(x=>`<button class="note-item" data-act="pick-note" data-id="${x.id}" aria-current="${x.id===ctx.noteId}"><b>${esc(x.title||"Untitled")}</b><small>${kinds[x.kind]}${x.taskId&&task(x.taskId)?" · "+esc(task(x.taskId).title):""}</small></button>`).join("")||`<p class="empty">No notes yet.</p>`}</div>
    ${n?`<div class="card stack">
      <input class="input" id="note-title" value="${esc(n.title)}" placeholder="Title" style="font-family:var(--f-display);font-weight:700;font-size:1.2rem">
      <div class="row"><span class="pill inbox">${kinds[n.kind]}</span>
        <select class="input" id="note-task" style="flex:1;min-width:200px" aria-label="Linked task"><option value="">Not linked to a task</option>${S.tasks.map(t=>`<option value="${t.id}" ${t.id===n.taskId?"selected":""}>${esc(t.title)}</option>`).join("")}</select>
        ${n.kind==="note"?`<button class="btn sm" data-act="note-to-task" data-id="${n.id}">${icon("tasks")}Turn into task</button>`:""}
        <button class="btn sm ghost" data-act="del-note" data-id="${n.id}">${icon("trash")}Delete</button></div>
      ${n.kind==="data"?`<div class="grid-table"><table>${n.rows.map((r,i)=>`<tr>${r.map((c,j)=>`<td><input data-cell="${i},${j}" value="${esc(c)}" aria-label="Row ${i+1} column ${j+1}"></td>`).join("")}</tr>`).join("")}</table></div>
        <div class="row"><button class="btn sm" data-act="add-row">${icon("plus")}Row</button><button class="btn sm" data-act="add-col">${icon("plus")}Column</button></div>`
      :`<textarea class="input" id="note-body" style="min-height:${n.kind==="draft"?360:180}px" placeholder="${n.kind==="draft"?"Start drafting…":"Write it down before it slips away…"}">${esc(n.body)}</textarea>`}
      <small class="muted" id="note-saved">Saved automatically</small>
    </div>`:`<p class="empty">Create a note, draft or data table.</p>`}
  </div>`;
};

R.resources=()=>{
  const kinds=["link","file","tool","book","person"];
  return `<div class="view-head"><div><h1>Resources</h1><p>Everything you use to get work done. Attach them to tasks and tick the ones you actually used.</p></div></div>
  <form class="card row" id="res-form" style="margin-bottom:16px">
    <input class="input" id="res-name" placeholder="Name, e.g. Brand guidelines PDF" style="flex:2;min-width:200px" required>
    <select class="input" id="res-kind" style="flex:0 1 130px" aria-label="Kind">${kinds.map(k=>`<option>${k}</option>`).join("")}</select>
    <input class="input" id="res-url" placeholder="Link (optional)" style="flex:2;min-width:180px">
    <button class="btn primary" type="submit">${icon("plus")}Add resource</button>
  </form>
  <div class="card scroll-x" style="padding:0"><table class="res-table"><thead><tr><th>Resource</th><th>Kind</th><th>Used in</th><th></th></tr></thead><tbody>
  ${S.resources.map(r=>{const uses=S.tasks.filter(t=>t.resources.some(x=>x.rid===r.id));return `<tr><td><b>${esc(r.name)}</b>${r.url?`<br><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.url.replace(/^https?:\/\//,""))}</a>`:""}</td><td><span class="kind">${r.kind}</span></td>
    <td><div class="row" style="gap:6px">${uses.map(t=>{const u=t.resources.find(x=>x.rid===r.id).used;return `<button class="chip" data-act="open" data-id="${t.id}" title="${u?"Used":"Planned"}">${u?icon("check"):""}${esc(t.title)}</button>`}).join("")||`<span class="muted">Not attached</span>`}</div></td>
    <td><button class="btn sm ghost" data-act="del-res" data-id="${r.id}" aria-label="Delete ${esc(r.name)}">${icon("trash")}</button></td></tr>`}).join("")}
  </tbody></table></div>`;
};

let timer={left:25*60,run:false,h:null};
R.inspire=()=>{
  const wins=S.tasks.filter(t=>t.status==="done").sort((a,b)=>(b.doneAt||"").localeCompare(a.doneAt||"")).slice(0,12);
  const days=[...Array(7)].map((_,i)=>addDays(i-6));
  const pts=days.map(d=>S.log.filter(l=>l[0]===d).reduce((a,l)=>a+l[1],0));
  const mx=Math.max(40,...pts);
  const bw=40,gap=16,ch=120;
  return `<div class="view-head"><div><h1>Inspiration</h1><p>Your wall. Pin quotes, goals and pictures that make you want to start. Wins collect here as you finish tasks.</p></div>
  <div class="row"><button class="btn" data-act="add-quote">${icon("plus")}Quote</button><button class="btn" data-act="add-goal">${icon("plus")}Goal</button>
  <label class="btn" for="inspo-file" style="cursor:pointer">${icon("img")}Picture</label><input id="inspo-file" type="file" accept="image/*" hidden></div></div>
  <div id="inspo-form"></div>
  <div class="board-inspo">
    <div class="card stack"><span class="label">Focus session</span><div class="timer" id="timer">25:00</div>
      <div class="row"><button class="btn primary" data-act="timer">${icon(timer.run?"pause":"play")}${timer.run?"Pause":"Start 25 min"}</button><button class="btn ghost" data-act="timer-reset">Reset</button></div>
      <p class="muted" style="font-size:.85rem">Finish a session to water your plant (+3%). ${S.focusDone} sessions done so far.</p></div>
    <div class="card stack"><span class="label">Wins wall</span><div class="wins">${wins.map((t,i)=>`<span class="win" style="--rot:${[-2,1.5,-1,2,0][i%5]}deg">${esc(t.title)}</span>`).join("")||`<span class="muted">Finish a task to pin your first win.</span>`}</div></div>
    ${S.inspo.map(p=>p.type==="quote"?`<div class="card pin-quote"><p class="quote">“${esc(p.text)}”</p><div class="row" style="justify-content:space-between"><p class="who">${esc(p.who||"")}</p><button class="btn sm ghost" style="color:inherit" data-act="del-pin" data-id="${p.id}" aria-label="Remove">${icon("x")}</button></div></div>`
      :p.type==="goal"?`<div class="card pin-goal stack"><div class="row" style="justify-content:space-between"><span class="label">${esc(p.title)}</span><button class="btn sm ghost" data-act="del-pin" data-id="${p.id}" aria-label="Remove">${icon("x")}</button></div><p style="font-size:1.1rem;font-weight:700">${esc(p.text)}</p></div>`
      :`<div class="card pin-img" style="padding:8px"><img src="${p.src}" alt="Pinned picture"><div class="row" style="justify-content:flex-end"><button class="btn sm ghost" data-act="del-pin" data-id="${p.id}" aria-label="Remove">${icon("x")}</button></div></div>`).join("")}
    <div class="card week stack"><span class="label">Plant growth this week</span>
      <svg viewBox="0 0 ${7*(bw+gap)} ${ch+24}" role="img" aria-label="Plant growth per day this week, in percent">
        <line x1="0" y1="${ch}" x2="${7*(bw+gap)}" y2="${ch}" stroke="var(--line)"/>
        ${pts.map((p,i)=>{const h=p/mx*(ch-18);return `<rect x="${i*(bw+gap)+gap/2}" y="${ch-h}" width="${bw}" height="${Math.max(h,0)}" rx="5" fill="var(--good)" opacity="${i===6?1:.75}"/>${p?`<text x="${i*(bw+gap)+gap/2+bw/2}" y="${ch-h-5}" text-anchor="middle">+${p}%</text>`:""}<text x="${i*(bw+gap)+gap/2+bw/2}" y="${ch+16}" text-anchor="middle">${new Date(days[i]).toLocaleDateString(undefined,{weekday:"narrow"})}</text>`}).join("")}
      </svg></div>
    <a class="card mini-plant" href="#garden" style="text-decoration:none;color:inherit">${scene("small",S.garden.kind,S.garden.growth,plantOpts(),"",false)}<div class="stack" style="gap:4px"><span class="label">Growing now</span><h3>${VARIETY[S.garden.kind].name} · ${stageOf(S.garden.growth)[1]}</h3><p class="muted" style="font-size:.85rem">${S.harvests.length} harvest${S.harvests.length===1?"":"s"} so far</p></div></a>
  </div>`;
};

const BADGES=[
  ["First sprout","Finish your first task",()=>S.tasks.some(t=>t.status==="done")],
  ["Weaver","Link 3 pairs of tasks",()=>S.tasks.reduce((a,t)=>a+t.links.length,0)/2>=3],
  ["Sketcher","Save your first sketch",()=>S.sketches.length>0],
  ["On a roll","Keep a 3-day streak",()=>S.streak>=3],
  ["First harvest","Harvest your first plant",()=>S.harvests.length>=1],
  ["Green thumb","Harvest 3 plants",()=>S.harvests.length>=3],
  ["Big push","Finish a Critical task",()=>S.tasks.some(t=>t.status==="done"&&t.imp==="critical")],
  ["Well equipped","Tick 5 resources as used",()=>S.tasks.reduce((a,t)=>a+t.resources.filter(r=>r.used).length,0)>=5],
  ["Focused","Complete 5 focus sessions",()=>S.focusDone>=5],
  ["Week warrior","Keep a 7-day streak",()=>S.streak>=7]
];
R.garden=()=>{
  const G=S.garden, V=VARIETY[G.kind], st=stageOf(G.growth), ns=nextStage(G.growth), b=basket();
  const per=STAGES.slice(1);
  return `<div class="view-head"><div><h1>Garden</h1><p>Finishing tasks grows your plant. The more important the task, the faster it grows. Harvest the fruit, then trade it for real treats.</p></div></div>
  <div class="garden-grid">
    <div class="card stack" style="gap:14px">
      <div class="sect-head"><div><span class="label">Growing now · planted ${G.planted}</span><h2 style="font-size:1.5rem">${V.name} · ${st[1]}</h2></div><span class="mono" style="font-size:1.4rem;font-weight:500">${Math.round(G.growth)}%</span></div>
      ${scene("plant-stage",G.kind,G.growth,plantOpts(),'data-live-plant id="main-scene" title="Tap to shake the plant"')}
      <div class="stack" style="gap:4px">
        <div class="stage-track">${per.map((x,i)=>{const lo=STAGES[i][0],hi=x[0];const f=Math.max(0,Math.min(1,(G.growth-lo)/(hi-lo)));return `<span><i style="transform:scaleX(${f})"></i></span>`}).join("")}</div>
        <div class="stage-names">${per.map(x=>G.growth>=x[0]?`<b>${x[1]==="Ready to harvest"?"Harvest":x[1]}</b>`:`<span>${x[1]==="Ready to harvest"?"Harvest":x[1]}</span>`).join("")}</div>
      </div>
      ${thirsty()?(wx()==="rain"?`<p class="muted">No task in 2 days, but the rain is keeping your plant watered today.</p>`:`<p class="thirsty">No task finished in the last 2 days, so the leaves are drooping. Finish any task to water it.</p>`):""}
      ${G.growth>=100?`<button class="btn gold" data-act="harvest" style="justify-content:center;min-height:48px">${icon("gift")}Harvest ${V.yield} ${V.plural}</button>`
        :`<p class="muted">${ns[0]-Math.round(G.growth)}% to <b>${ns[1].toLowerCase()}</b>. ${ns[0]-G.growth<=GROW.low?"Any one task will do it.":`About ${Math.ceil((ns[0]-G.growth)/GROW.high)} High task${Math.ceil((ns[0]-G.growth)/GROW.high)>1?"s":""} or ${Math.ceil((ns[0]-G.growth)/GROW.medium)} Medium.`}</p>`}
    </div>
    <div class="stack" style="gap:16px">
      <div class="card scene-controls"><span class="label">Scene</span>
        ${[["weather","Weather",{auto:"Auto",sun:"Sunny",cloud:"Cloudy",rain:"Rain",snow:"Snow",wind:"Windy"}],["time","Time of day",{auto:"Auto",day:"Day",night:"Night"}],["motion","Motion",{calm:"Calm",normal:"Normal",lively:"Lively"}],["sound","Sound",{on:"On",off:"Off"}]].map(([k,n,opts])=>`<div class="ctrl"><span class="muted" style="font-size:.8rem;font-weight:700">${n}</span><div class="seg">${Object.entries(opts).map(([v,l])=>`<button data-act="scene" data-k="${k}" data-v="${v}" aria-pressed="${k==="sound"?(S.scene.sound?"on":"off")===v:S.scene[k]===v}">${l}</button>`).join("")}</div></div>`).join("")}
        <p class="muted" style="font-size:.8rem">${S.scene.place?(liveFresh()?`Auto shows the live weather in ${esc(S.scene.place.name)}: ${esc(S.scene.live.desc.toLowerCase())}, ${S.scene.live.temp}°.`:`Auto will show the weather in ${esc(S.scene.place.name)} once it loads.`):`Auto uses your clock for day and night. <a href="#settings">Set your location</a> to show the live weather.`}</p></div>
      <div class="card stack"><span class="label">How tasks grow your plant</span>
        <table class="grow-table"><tbody>
          ${Object.keys(GROW).map(k=>`<tr><td><span class="imp ${k}">${IMP_NAME[k]}</span> importance</td><td>+${GROW[k]}%</td></tr>`).join("")}
          <tr><td>Focus session (25 min)</td><td>+${FOCUS_GROW}%</td></tr>
          <tr><td>No task for 2 days</td><td>leaves droop</td></tr>
        </tbody></table>
        <p class="muted" style="font-size:.82rem">A full plant needs 100%: about 4 High tasks, 7 Medium or 13 Low.</p></div>
      <div class="card stack"><span class="label">Seed packets · next planting</span>
        <div class="seeds">${Object.entries(VARIETY).map(([k,v])=>`<button class="seed" data-act="pick-seed" data-k="${k}" aria-pressed="${S.nextKind===k}" ${unlocked(k)?"":"disabled"}><span class="fruit-dot ${v.shape==="long"?"long":""}" style="background:${v.fruit}"></span><span><b>${v.name}</b><small>${unlocked(k)?`${v.yield} ${v.plural} per harvest`:`Unlocks after ${v.unlock} harvest${v.unlock>1?"s":""}`}</small></span></button>`).join("")}</div></div>
      <div class="card stack"><span class="label">Basket</span>
        <div class="basket">${Object.entries(VARIETY).map(([k,v])=>{const n=S.harvests.filter(h=>h.kind===k).reduce((a,h)=>a+h.fruits,0);return n?`<div><span class="fruit-dot ${v.shape==="long"?"long":""}" style="background:${v.fruit}"></span>${n} ${v.plural}</div>`:""}).join("")||`<span class="muted">Empty. Your first harvest goes here.</span>`}</div>
        <p class="muted" style="font-size:.85rem"><b class="mono" style="color:var(--ink)">${b}</b> fruit left to trade for treats.</p></div>
    </div>
  </div>
  <h2 style="margin:28px 0 4px">Previews</h2>
  <p class="muted" style="margin-bottom:12px">Try the animations without touching your real plant.</p>
  <div class="samples">
    <div class="card sample-card">${scene("plant-stage","tomato",100,{weather:"sun",night:false},'id="smp-ripe"')}
      <div><h3>Ready to harvest · 100%</h3><p class="muted" style="font-size:.85rem">Ripe tomatoes, sparkles, a butterfly.</p></div>
      <div class="row"><button class="btn sm gold" data-act="smp-harvest">${icon("gift")}Harvest</button><button class="btn sm" data-act="smp-grow">${icon("play")}Grow from seed</button></div></div>
    <div class="card sample-card">${scene("plant-stage","tomato",56,{weather:"sun",night:false},'id="smp-water"')}
      <div><h3>Watering</h3><p class="muted" style="font-size:.85rem">What happens each time you finish a task.</p></div>
      <div class="row"><button class="btn sm primary" data-act="smp-water">${icon("play")}Water it</button></div></div>
    <div class="card sample-card">${scene("plant-stage","tomato",74,{weather:"rain",night:false},'id="smp-rain"')}
      <div><h3>Raining</h3><p class="muted" style="font-size:.85rem">Rain waters the plant. Bees and butterflies take shelter.</p></div>
      <div class="row"><button class="btn sm" data-act="smp-rain">${icon("play")}Listen to the rain</button><button class="btn sm ghost" data-act="smp-night">Switch to night</button></div></div>
  </div>
  <div class="sect-head" style="margin:28px 0 12px"><h2>Trade your harvest for a treat</h2><button class="btn sm" data-act="add-reward">${icon("plus")}Your own treat</button></div>
  <div id="reward-form"></div>
  <div class="shop">${S.treats.map(r=>`<div class="card reward"><h3>${esc(r.name)}</h3>
    <div class="row" style="justify-content:space-between"><span class="cost"><span class="fruit-dot" style="background:var(--warn);width:14px;height:14px"></span><span class="mono">${r.cost}</span> fruit</span>
    <button class="btn sm ${r.cost<=b?"gold":""}" data-act="redeem" data-id="${r.id}" ${r.cost>b?"disabled":""}>${r.cost<=b?"Claim":`${r.cost-b} more`}</button></div></div>`).join("")}</div>
  <h2 style="margin:28px 0 12px">Harvest shelf</h2>
  ${S.harvests.length?`<div class="shelf">${S.harvests.slice().reverse().map(h=>`<figure>${plantSVG(h.kind,100,{still:true})}<figcaption><b>${VARIETY[h.kind].name}</b>${h.fruits} ${VARIETY[h.kind].plural} · ${h.date}</figcaption></figure>`).join("")}</div>`:`<p class="empty">Plants you harvest are kept here.</p>`}
  <h2 style="margin:28px 0 12px">Badges</h2>
  <div class="badges">${BADGES.map(([n,d,f])=>`<div class="card badge ${f()?"got":""}"><span class="medal">${icon("medal")}</span><div><b>${n}</b><small>${d}</small></div></div>`).join("")}</div>
  <h2 style="margin:28px 0 12px">Claimed treats</h2>
  ${S.redeemed.length?`<div class="card" style="padding:4px 16px">${S.redeemed.slice().reverse().map(r=>`<div class="task-line"><span style="flex:1">${esc(r.name)}</span><span class="mono muted">${r.at} · −${r.cost} fruit</span></div>`).join("")}</div>`:`<p class="empty">Nothing claimed yet.</p>`}`;
};

let cityResults=[], restoreData=null;
const hasExamples=()=>S.tasks.some(t=>t.sample)||S.notes.some(n=>n.sample)||S.resources.some(r=>r.sample)||S.inspo.some(p=>p.sample);
R.settings=()=>{
  const p=S.scene.place, l=S.scene.live, cl=cloud.enabled();
  return `<div class="view-head"><div><h1>Settings</h1><p>Your account, sync between devices, weather for the garden, and backups.</p></div></div>
  <div class="settings-grid">
    <section class="card stack"><h2>Account</h2>
      <form id="name-form" class="row"><label class="label" for="set-name" style="width:100%">Name</label><input class="input" id="set-name" value="${esc(S.profile.name)}" style="flex:1;min-width:160px"><button class="btn" type="submit">Save</button></form>
      <p class="muted">Email: ${esc(S.profile.email||"not set")}</p>
      ${cl?`<p class="muted" style="font-size:.85rem">Your password is managed by your sync account. To change it, sign out and use "Email me a reset link".</p>`
      :`<form id="pw-form" class="stack" style="gap:8px"><span class="label">Change password</span><input class="input" id="pw-old" type="password" autocomplete="current-password" placeholder="Current password" required><input class="input" id="pw-new" type="password" autocomplete="new-password" placeholder="New password, 8+ characters" required><input class="input" id="pw-new2" type="password" autocomplete="new-password" placeholder="Repeat new password" required><button class="btn" type="submit">Change password</button></form>`}
      <button class="btn" data-act="logout">${icon("out")}Sign out</button>
    </section>
    <section class="card stack"><h2>Sync between iPad and computer</h2>
      <p id="sync-status" class="sync-line">${syncLabel()}</p>
      ${cl?`<button class="btn" data-act="cloud-off">Stop syncing on this device</button><p class="muted" style="font-size:.85rem">Your data stays on this device and in your account.</p>`
      :`<p class="muted" style="font-size:.88rem">Sync uses your own free Firebase project, so your data stays in an account you control. Follow the steps in the README, then paste the config here on each device.</p>
      <form id="sync-form" class="stack" style="gap:8px"><label class="label" for="fb-config">Firebase config</label><textarea class="input" id="fb-config" placeholder="const firebaseConfig = { apiKey: ..., projectId: ..., appId: ... }" style="min-height:110px;font-family:var(--f-mono);font-size:.8rem"></textarea><button class="btn primary" type="submit">Connect sync</button></form>`}
    </section>
    <section class="card stack"><h2>Weather for your garden</h2>
      <p>${p?`Location: <b>${esc(p.name)}</b>${l?` · ${esc(l.desc)}, ${l.temp}°, wind ${l.wind} km/h · updated ${new Date(l.at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}`:""}`:`No location set. The garden shows sunny weather and uses your clock for day and night.`}</p>
      <div class="row"><button class="btn" data-act="locate">Use my location</button>${p?`<button class="btn ghost" data-act="weather-now">Refresh now</button><button class="btn ghost" data-act="clear-place">Remove location</button>`:""}</div>
      <form id="city-form" class="row"><input class="input" id="city-q" placeholder="Or search a city, e.g. Ho Chi Minh City" style="flex:1;min-width:180px"><button class="btn" type="submit">Search</button></form>
      <div class="row" id="city-results"></div>
      <p class="muted" style="font-size:.8rem">Weather comes from Open-Meteo. Only the location is sent, and it updates every 30 minutes while the app is open.</p>
    </section>
    <section class="card stack"><h2>Backup</h2>
      <p class="muted" style="font-size:.88rem">Download everything, including sketches and pictures, as one file. Keep a copy somewhere safe, especially if sync is off.</p>
      <div class="row"><button class="btn" data-act="backup">Download backup</button><label class="btn" for="restore-file" style="cursor:pointer">Restore from file</label><input id="restore-file" type="file" accept="application/json,.json" hidden></div>
      <div id="restore-confirm"></div>
    </section>
    <section class="card stack"><h2>Example data</h2>
      <p class="muted" style="font-size:.88rem">Example tasks, notes, resources and quotes to explore the app. They don't change your garden.</p>
      <div class="row">${hasExamples()?`<button class="btn" data-act="remove-examples">Remove example data</button>`:`<button class="btn" data-act="add-examples">Add example data</button>`}</div>
    </section>
    <section class="card stack"><h2>Appearance</h2>
      <div class="seg">${[["","Match device"],["light","Light"],["dark","Dark"]].map(([v,l])=>`<button data-act="set-theme" data-v="${v}" aria-pressed="${(S.theme||"")===v}">${l}</button>`).join("")}</div>
      <h2 style="margin-top:12px">Erase</h2>
      <p class="muted" style="font-size:.88rem">Removes everything stored on this device and signs you out.</p>
      <div><button class="btn danger" data-act="erase">Erase this device</button></div>
    </section>
  </div>`;
};

/* ---------------- Drawer ---------------- */
let openId=null;
function openTask(id){
  const t=task(id); if(!t) return; openId=id;
  const linked=t.links.map(task).filter(Boolean);
  const atts=[...S.notes.filter(n=>n.taskId===id).map(n=>({...n,_t:"note"})),...S.sketches.filter(s=>s.taskId===id).map(s=>({...s,_t:"sketch"}))];
  $("#drawer").innerHTML=`
    <div class="row" style="justify-content:space-between"><span class="pill ${t.status}">${t.status}</span><button class="btn sm ghost" data-act="close" aria-label="Close">${icon("x")}</button></div>
    <input class="drawer-title" id="d-title" value="${esc(t.title)}" aria-label="Task title">
    <div class="sect"><span class="label">Status</span><div class="seg">${["inbox","doing","done"].map(s=>`<button data-act="status" data-s="${s}" aria-pressed="${t.status===s}">${s[0].toUpperCase()+s.slice(1)}</button>`).join("")}</div></div>
    <div class="row" style="gap:12px;align-items:end">
      <div class="sect" style="flex:1;min-width:140px"><label class="label" for="d-imp">Importance</label><select class="input" id="d-imp">${Object.keys(GROW).map(k=>`<option value="${k}" ${t.imp===k?"selected":""}>${IMP_NAME[k]} · grows +${GROW[k]}%</option>`).join("")}</select></div>
      <div class="sect" style="flex:1;min-width:140px"><label class="label" for="d-due">Due</label><input class="input" type="date" id="d-due" value="${t.due||""}"></div>
    </div>
    <div class="sect"><label class="label" for="d-desc">Details</label><textarea class="input" id="d-desc" placeholder="What does done look like?">${esc(t.desc)}</textarea></div>
    <div class="sect"><div class="sect-head"><span class="label">Linked tasks</span></div>
      <div class="row" style="gap:6px">${linked.map(l=>`<span class="chip"><button style="color:var(--ink);font-size:.8rem" data-act="open" data-id="${l.id}">${icon("link")} ${esc(l.title)}</button><button data-act="unlink" data-id="${l.id}" aria-label="Unlink">×</button></span>`).join("")||`<span class="muted" style="font-size:.85rem">No links yet.</span>`}</div>
      <select class="input" id="d-link" aria-label="Link another task"><option value="">+ Link to another task…</option>${S.tasks.filter(x=>x.id!==id&&!t.links.includes(x.id)).map(x=>`<option value="${x.id}">${esc(x.title)}</option>`).join("")}</select></div>
    <div class="sect"><div class="sect-head"><span class="label">Resources</span><span class="muted" style="font-size:.8rem">Tick when used</span></div>
      ${t.resources.map(x=>{const r=res(x.rid);return r?`<div class="res-line"><span class="kind">${r.kind}</span><span class="nm">${r.url?`<a href="${esc(r.url)}" target="_blank" rel="noopener" style="color:var(--accent)">${esc(r.name)}</a>`:esc(r.name)}</span><label><input type="checkbox" data-used="${r.id}" ${x.used?"checked":""}>Used</label><button class="btn sm ghost" data-act="unres" data-id="${r.id}" aria-label="Remove">${icon("x")}</button></div>`:""}).join("")||`<span class="muted" style="font-size:.85rem">No resources attached.</span>`}
      <select class="input" id="d-res" aria-label="Attach resource"><option value="">+ Attach a resource…</option>${S.resources.filter(r=>!t.resources.some(x=>x.rid===r.id)).map(r=>`<option value="${r.id}">${esc(r.name)} (${r.kind})</option>`).join("")}<option value="__new">Add a new resource…</option></select></div>
    <div class="sect"><div class="sect-head"><span class="label">Notes &amp; sketches</span></div>
      <div class="attach-grid">${atts.map(a=>a._t==="sketch"?`<button class="attach" data-act="open-sketch" data-id="${a.id}"><img src="${a.img}" alt=""><span>${esc(a.title)}</span></button>`:`<button class="attach" data-act="open-note" data-id="${a.id}">${icon("note")}<b>${esc(a.title||"Untitled")}</b><small class="muted">${a.kind==="data"?"Data table":a.kind}</small></button>`).join("")}</div>
      <div class="row"><button class="btn sm" data-act="task-note" data-kind="note">${icon("note")}Note</button><button class="btn sm" data-act="task-note" data-kind="draft">${icon("note")}Draft</button><button class="btn sm" data-act="task-note" data-kind="data">${icon("tasks")}Data</button><button class="btn sm" data-act="task-sketch">${icon("pencil")}Sketch</button></div></div>
    <div class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding-top:16px">
      <button class="btn ghost sm" data-act="del-task">${icon("trash")}Delete</button>
      ${t.status!=="done"?`<button class="btn primary" data-act="toggle" data-id="${t.id}" style="min-height:46px">${icon("check")}Complete · plant +${GROW[t.imp]}%</button>`:`<span class="muted">Done ${t.doneAt||""}</span>`}
    </div>`;
  $("#drawer").hidden=false; $("#scrim").hidden=false;
}
function closeDrawer(){ openId=null; $("#drawer").hidden=true; $("#scrim").hidden=true; }
function refresh(){ render(); if(openId) openTask(openId); }

/* ---------------- Actions ---------------- */
function grow(amount,why){
  const G=S.garden, from=G.growth; G.growth=Math.min(100,from+amount); G.extra=(G.extra||0)+Math.max(0,from+amount-100);
  const today=dayKey(); const l=S.log.find(x=>x[0]===today); if(l) l[1]+=amount; else S.log.push([today,amount]);
  save(); const to=G.growth; setTimeout(()=>celebrate(from,to,amount,why),0);   // after the view re-renders
}
function setStatus(t,s){
  if(t.status===s) return;
  const was=t.status; t.status=s;
  if(s==="done"&&was!=="done"){
    t.doneAt=dayKey();
    const today=dayKey(); if(S.lastDone!==today){ S.streak=S.lastDone===addDays(-1)?S.streak+1:1; S.lastDone=today; }
    grow(GROW[t.imp],t.title);
  } else if(was==="done"&&s!=="done"){
    const amt=GROW[t.imp]; S.garden.growth=Math.max(0,S.garden.growth-amt); const l=S.log.find(x=>x[0]===t.doneAt); if(l) l[1]=Math.max(0,l[1]-amt); t.doneAt=null;
  }
  save();
}
function newTask(title,status="inbox"){ const t={id:uid(),title:title||"Untitled task",status,imp:"medium",due:"",desc:"",links:[],resources:[],doneAt:null}; S.tasks.unshift(t); save(); return t; }
function newNote(kind,taskId=null){ const n={id:uid(),kind,title:kind==="data"?"New table":kind==="draft"?"New draft":"",body:"",rows:kind==="data"?[["Item","Value","Note"],["","",""],["","",""]]:undefined,taskId,updated:Date.now()}; S.notes.push(n); save(); return n; }

const A={
  open:d=>openTask(d.id), close:closeDrawer,
  toggle:d=>{const t=task(d.id); setStatus(t,t.status==="done"?"inbox":"done"); refresh();},
  status:d=>{setStatus(task(openId),d.s); refresh();},
  unlink:d=>{const t=task(openId),o=task(d.id); t.links=t.links.filter(x=>x!==d.id); if(o) o.links=o.links.filter(x=>x!==openId); save(); refresh();},
  unres:d=>{const t=task(openId); t.resources=t.resources.filter(x=>x.rid!==d.id); save(); refresh();},
  "del-task":()=>{const id=openId; const b=$("[data-act=del-task]"); if(b.dataset.armed){ S.tasks=S.tasks.filter(t=>t.id!==id); S.tasks.forEach(t=>t.links=t.links.filter(x=>x!==id)); S.notes.forEach(n=>{if(n.taskId===id)n.taskId=null}); S.sketches.forEach(n=>{if(n.taskId===id)n.taskId=null}); save(); closeDrawer(); render(); toast("Task deleted"); } else { b.dataset.armed="1"; b.innerHTML=icon("trash")+"Tap again to delete"; b.style.color="var(--warn)"; }},
  "new-task":()=>{const t=newTask("New task"); render(); openTask(t.id); setTimeout(()=>{const i=$("#d-title");i.focus();i.select()},60);},
  "task-note":d=>{const n=newNote(d.kind,openId); ctx.noteId=n.id; closeDrawer(); location.hash="notes"; if(cur()==="notes") render();},
  "task-sketch":()=>{ctx.sketchTask=openId; ctx.editSketch=null; closeDrawer(); location.hash="sketch"; if(cur()==="sketch") render();},
  "open-note":d=>{ctx.noteId=d.id; closeDrawer(); if(cur()==="notes") render(); else location.hash="notes";},
  "open-sketch":d=>{ctx.editSketch=d.id; closeDrawer(); if(cur()==="sketch") render(); else location.hash="sketch";},
  goto:d=>{location.hash=d.to},
  "pick-note":d=>{ctx.noteId=d.id; render();},
  "new-note":d=>{ctx.noteId=newNote(d.kind).id; render(); setTimeout(()=>$("#note-title")?.focus(),40);},
  "del-note":d=>{S.notes=S.notes.filter(n=>n.id!==d.id); ctx.noteId=null; save(); render(); toast("Note deleted");},
  "note-to-task":d=>{const n=S.notes.find(x=>x.id===d.id); const t=newTask(n.title||n.body.split("\n")[0]||"From note"); t.desc=n.body; n.taskId=t.id; save(); render(); openTask(t.id); toast("Task created from note");},
  "add-row":()=>{const n=S.notes.find(x=>x.id===ctx.noteId); n.rows.push(n.rows[0].map(()=>"")); save(); render();},
  "add-col":()=>{const n=S.notes.find(x=>x.id===ctx.noteId); n.rows.forEach((r,i)=>r.push(i?"":"Column")); save(); render();},
  "del-res":d=>{S.resources=S.resources.filter(r=>r.id!==d.id); S.tasks.forEach(t=>t.resources=t.resources.filter(x=>x.rid!==d.id)); save(); render();},
  redeem:d=>{const r=S.treats.find(x=>x.id===d.id); if(!r||r.cost>basket()) return; S.spent+=r.cost; S.redeemed.push({name:r.name,at:dayKey(),cost:r.cost}); save(); render(); toast(`${icon("gift")} Enjoy it: ${esc(r.name)}`);},
  harvest:()=>{const G=S.garden; if(G.growth<100) return; const V=VARIETY[G.kind];
    const go=()=>{ S.harvests.push({kind:G.kind,fruits:V.yield,date:dayKey()}); const k=unlocked(S.nextKind)?S.nextKind:"tomato"; S.garden={kind:k,growth:Math.min(99,G.extra||0),extra:0,planted:dayKey()}; save(); render(); $(".plant-stage svg.plant")?.classList.add("sow"); burst(); toast(`${icon("gift")} Harvested ${V.yield} ${V.plural}. A new ${VARIETY[k].name.toLowerCase()} seed is planted.`); };
    const svg=$(".plant-stage svg.plant"); if(svg&&!matchMedia("(prefers-reduced-motion: reduce)").matches){ svg.classList.add("harvesting"); playHarvest(V.yield); setTimeout(go,1000); } else go(); },
  scene:d=>{ if(d.k==="sound"){ S.scene.sound=d.v==="on"; setSound(S.scene.sound); if(S.scene.sound) playChime([880,1175]); } else S.scene[d.k]=d.v; applyPrefs(); save(); const y=$("#view").scrollTop; render(); $("#view").scrollTop=y; },
  "smp-water":()=>{ const el=$("#smp-water"); waterFx(el); playWater(); const g0=+(el.dataset.g||56), g1=g0>=96?40:Math.min(100,g0+15); el.dataset.g=g1; live.t.push(setTimeout(()=>tweenPlant(el,"tomato",g0,g1,{weather:"sun",night:false},1500,()=>{ if(stageOf(g0)[1]!==stageOf(g1)[1]) playChime(); }),900)); },
  "smp-harvest":()=>{ const el=$("#smp-ripe"), svg=el.querySelector("svg.plant"); if(svg.classList.contains("harvesting")) return; svg.classList.add("harvesting"); playHarvest(); live.t.push(setTimeout(()=>{ el.querySelector("svg.plant").outerHTML=plantSVG("tomato",0,{weather:"sun"}); el.querySelector("svg.plant").classList.add("sow"); live.t.push(setTimeout(()=>tweenPlant(el,"tomato",0,100,{weather:"sun",night:false},5200,()=>playChime()),1100)); },1000)); },
  "smp-grow":()=>{ const el=$("#smp-ripe"); playWater(0); tweenPlant(el,"tomato",0,100,{weather:"sun",night:false},6000,()=>playChime()); },
  "smp-rain":()=>{ if(rainPlaying()) return rainSound(false); if(!S.scene.sound) return toast("Sound is off. Turn it on in Scene."); rainSound(true,8000); },
  "smp-night":d=>{ const el=$("#smp-rain"), nt=!el.classList.contains("night"); el.outerHTML=scene("plant-stage","tomato",74,{weather:"rain",night:nt},'id="smp-rain"'); const b=$("[data-act=smp-night]"); if(b) b.textContent=nt?"Switch to day":"Switch to night"; },
  "pick-seed":d=>{ if(!unlocked(d.k)) return; S.nextKind=d.k; if(S.garden.growth<5) S.garden.kind=d.k; save(); render(); },
  "add-reward":()=>{$("#reward-form").innerHTML=`<form class="card row" id="rw-form" style="margin-bottom:12px"><input class="input" id="rw-name" placeholder="e.g. Movie night with friends" style="flex:2;min-width:200px" required><input class="input" id="rw-cost" type="number" min="1" step="1" value="6" style="flex:0 1 120px" aria-label="Cost in harvested fruit"><button class="btn primary" type="submit">Add reward</button></form>`; $("#rw-name").focus();},
  "add-quote":()=>{$("#inspo-form").innerHTML=`<form class="card row" id="q-form" style="margin-bottom:16px"><input class="input" id="q-text" placeholder="A line that gets you moving" style="flex:3;min-width:220px" required><input class="input" id="q-who" placeholder="Who said it" style="flex:1;min-width:140px"><button class="btn primary" type="submit">Pin quote</button></form>`; $("#q-text").focus();},
  "add-goal":()=>{$("#inspo-form").innerHTML=`<form class="card row" id="g-form" style="margin-bottom:16px"><input class="input" id="g-text" placeholder="What are you working toward?" style="flex:3;min-width:220px" required><button class="btn primary" type="submit">Pin goal</button></form>`; $("#g-text").focus();},
  "del-pin":d=>{S.inspo=S.inspo.filter(p=>p.id!==d.id); save(); render();},
  timer:()=>{ timer.run=!timer.run; if(timer.run){ timer.h=setInterval(tick,1000);} else clearInterval(timer.h); render(); },
  "timer-reset":()=>{ clearInterval(timer.h); timer={left:25*60,run:false,h:null}; render(); },
  "set-theme":d=>{ S.theme=d.v||null; save(); applyTheme(); render(); },
  theme:()=>{ const dark=S.theme?S.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches; S.theme=dark?"light":"dark"; save(); applyTheme(); },
  logout:async()=>{ auth.endSession(); if(cloud.user()) await cloud.signOut(); location.hash=""; location.reload(); },
  "add-examples":()=>{ if(hasExamples()) return; const ex=exampleData(); S.tasks.push(...ex.tasks); S.resources.push(...ex.resources); S.notes.push(...ex.notes); S.inspo.push(...ex.inspo); save(); render(); toast("Example data added. Remove it from Today or Settings."); },
  "remove-examples":()=>{ const gone=new Set(S.tasks.filter(t=>t.sample).map(t=>t.id)); const rgone=new Set(S.resources.filter(r=>r.sample).map(r=>r.id));
    S.tasks=S.tasks.filter(t=>!t.sample); S.tasks.forEach(t=>{ t.links=t.links.filter(x=>!gone.has(x)); t.resources=t.resources.filter(x=>!rgone.has(x.rid)); });
    S.resources=S.resources.filter(r=>!r.sample); S.notes=S.notes.filter(n=>!n.sample); S.inspo=S.inspo.filter(p=>!p.sample);
    S.notes.forEach(n=>{ if(gone.has(n.taskId)) n.taskId=null; }); S.sketches.forEach(n=>{ if(gone.has(n.taskId)) n.taskId=null; }); save(); render(); toast("Example data removed"); },
  locate:async()=>{ toast("Finding your location…"); try{ S.scene.place=await weather.locate(); S.scene.live=null; save(); await refreshWeather(true); render(); toast("Weather location set"); }catch(e){ toast(esc(e.message)); } },
  "pick-city":d=>{ const c=cityResults[+d.i]; if(!c) return; S.scene.place=c; S.scene.live=null; save(); refreshWeather(true).then(render); render(); },
  "clear-place":()=>{ S.scene.place=null; S.scene.live=null; save(); render(); },
  "weather-now":()=>refreshWeather(true),
  backup:()=>{ const blob=new Blob([JSON.stringify({app:"threadwork",version:1,exportedAt:new Date().toISOString(),state:S})],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`threadwork-backup-${dayKey()}.json`; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000); toast("Backup downloaded"); },
  "restore-yes":async()=>{ if(!restoreData) return; S=normalize(restoreData); S.savedAt=Date.now(); restoreData=null; applyPrefs(); save(); render(); toast("Backup restored"); },
  "restore-no":()=>{ restoreData=null; render(); },
  "cloud-off":async()=>{ if(cloud.user()) await cloud.signOut(); cloud.setConfig(null); auth.startSession(S.profile.email||"me"); location.reload(); },
  "erase":async d=>{ const b=$("[data-act=erase]"); if(!b.dataset.armed){ b.dataset.armed="1"; b.textContent="Tap again to erase everything on this device"; return; } if(cloud.user()) await cloud.signOut(); await store.wipeAll(); auth.endSession(); cloud.setConfig(null); location.hash=""; location.reload(); },
  "sk-undo":()=>{ sk.strokes.pop(); redraw(); },
  "sk-clear":()=>{ sk.strokes=[]; sk.base=null; redraw(); },
  "sk-new":()=>{ ctx.editSketch=null; render(); },
  "sk-save":saveSketch
};
function tick(){ timer.left--; if(timer.left<=0){ clearInterval(timer.h); timer={left:25*60,run:false,h:null}; S.focusDone++; grow(FOCUS_GROW,"Focus session"); if(cur()==="inspire") render(); return; } paintTimer(); }
function paintTimer(){ const el=$("#timer"); if(el) el.textContent=`${String(Math.floor(timer.left/60)).padStart(2,"0")}:${String(timer.left%60).padStart(2,"0")}`; }

document.addEventListener("click",e=>{
  unlockAudio();
  const pl=e.target.closest(".plant-stage svg.plant"); if(pl&&!pl.classList.contains("harvesting")){ pl.classList.remove("wiggle"); void pl.getBoundingClientRect(); pl.classList.add("wiggle"); setTimeout(()=>pl.classList.remove("wiggle"),850); }
  const el=e.target.closest("[data-act]"); if(!el) return;
  const f=A[el.dataset.act]; if(f){ e.preventDefault(); f(el.dataset); }
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&openId) closeDrawer();
  if((e.key==="Enter"||e.key===" ")&&e.target.matches("g[data-act]")){ e.preventDefault(); A[e.target.dataset.act]?.(e.target.dataset); }
});
$("#scrim").addEventListener("click",closeDrawer);

document.addEventListener("change",e=>{
  const el=e.target, t=openId&&task(openId);
  if(t&&el.id==="d-title"){ t.title=el.value.trim()||t.title; save(); render(); }
  else if(t&&el.id==="d-imp"){ t.imp=el.value; save(); refresh(); }
  else if(t&&el.id==="d-due"){ t.due=el.value; save(); render(); }
  else if(t&&el.id==="d-desc"){ t.desc=el.value; save(); }
  else if(t&&el.id==="d-link"&&el.value){ const o=task(el.value); t.links.push(o.id); if(!o.links.includes(t.id)) o.links.push(t.id); save(); refresh(); toast("Tasks linked"); }
  else if(t&&el.id==="d-res"&&el.value){ if(el.value==="__new"){ closeDrawer(); location.hash="resources"; setTimeout(()=>$("#res-name")?.focus(),60); return; } t.resources.push({rid:el.value,used:false}); save(); refresh(); }
  else if(t&&el.dataset.used){ const x=t.resources.find(r=>r.rid===el.dataset.used); x.used=el.checked; save(); render(); }
  else if(el.id==="note-task"){ const n=S.notes.find(x=>x.id===ctx.noteId); n.taskId=el.value||null; save(); render(); }
  else if(el.id==="restore-file"&&el.files[0]){ el.files[0].text().then(t=>{ try{ const d=JSON.parse(t); if(d.app!=="threadwork"||!d.state) throw 0; restoreData=d.state; $("#restore-confirm").innerHTML=`<p>Replace everything with the backup from <b>${esc((d.exportedAt||"").slice(0,10))}</b> (${d.state.tasks?.length||0} tasks)?</p><div class="row"><button class="btn primary sm" data-act="restore-yes">Replace</button><button class="btn sm ghost" data-act="restore-no">Cancel</button></div>`; }catch(x){ toast("That file isn't a Threadwork backup."); } }); }
  else if(el.id==="inspo-file"&&el.files[0]){ shrinkImage(el.files[0],720).then(src=>{ S.inspo.unshift({id:uid(),type:"image",src}); save(); render(); }); }
});
let noteT;
document.addEventListener("input",e=>{
  const el=e.target, n=S.notes.find(x=>x.id===ctx.noteId);
  if(!n) return;
  if(el.id==="note-title") n.title=el.value;
  else if(el.id==="note-body") n.body=el.value;
  else if(el.dataset.cell){ const [i,j]=el.dataset.cell.split(",").map(Number); n.rows[i][j]=el.value; }
  else return;
  n.updated=Date.now(); clearTimeout(noteT); const s=$("#note-saved"); if(s) s.textContent="Saving…";
  noteT=setTimeout(()=>{ save(); const s=$("#note-saved"); if(s) s.textContent="Saved automatically"; },400);
});
document.addEventListener("submit",e=>{
  const f=e.target; e.preventDefault();
  if(f.id.startsWith("auth-")) return onAuthSubmit(f);
  if(f.id==="name-form"){ S.profile.name=$("#set-name").value.trim(); save(); render(); toast("Name saved"); }
  if(f.id==="pw-form"){ const ok=$("#pw-new").value.length>=8&&$("#pw-new").value===$("#pw-new2").value; if(!ok) return toast("New passwords must match and be at least 8 characters."); auth.changePassword($("#pw-old").value,$("#pw-new").value).then(r=>{ toast(r?"Password changed":"Current password is wrong"); if(r) f.reset(); }); }
  if(f.id==="sync-form") connectCloud($("#fb-config").value,m=>toast(esc(m)));
  if(f.id==="city-form"){ const q=$("#city-q").value.trim(); if(!q) return; const out=$("#city-results"); out.innerHTML=`<p class="muted">Searching…</p>`; weather.searchCity(q).then(r=>{ cityResults=r; out.innerHTML=r.length?r.map((c,i)=>`<button class="chip" data-act="pick-city" data-i="${i}">${esc(c.name)}</button>`).join(""):`<p class="muted">No places found. Try another spelling.</p>`; }).catch(x=>{ out.innerHTML=`<p class="muted">${esc(x.message)}</p>`; }); }
  if(f.id==="capture-form"){ const v=$("#capture-input").value.trim(); if(!v) return; newTask(v); $("#capture-input").value=""; render(); toast("Captured to Inbox"); }
  if(f.id==="res-form"){ S.resources.push({id:uid(),name:$("#res-name").value.trim(),kind:$("#res-kind").value,url:$("#res-url").value.trim()}); save(); render(); toast("Resource added"); }
  if(f.id==="rw-form"){ S.treats.push({id:uid(),name:$("#rw-name").value.trim(),cost:Math.max(1,+$("#rw-cost").value||5)}); S.treats.sort((a,b)=>a.cost-b.cost); save(); render(); }
  if(f.id==="q-form"){ S.inspo.unshift({id:uid(),type:"quote",text:$("#q-text").value.trim(),who:$("#q-who").value.trim()}); save(); render(); }
  if(f.id==="g-form"){ S.inspo.unshift({id:uid(),type:"goal",title:"Goal",text:$("#g-text").value.trim()}); save(); render(); }
});

/* Drag & drop on the board (mouse) */
let dragId=null;
document.addEventListener("dragstart",e=>{ const c=e.target.closest?.(".tcard"); if(c){ dragId=c.dataset.id; e.dataTransfer.effectAllowed="move"; try{e.dataTransfer.setData("text/plain",dragId)}catch(_){}} });
document.addEventListener("dragover",e=>{ const col=e.target.closest?.(".col"); if(col&&dragId){ e.preventDefault(); document.querySelectorAll(".col").forEach(c=>c.classList.toggle("drop",c===col)); } });
document.addEventListener("drop",e=>{ const col=e.target.closest?.(".col"); if(col&&dragId){ e.preventDefault(); setStatus(task(dragId),col.dataset.col); dragId=null; render(); } });
document.addEventListener("dragend",()=>{ dragId=null; document.querySelectorAll(".col").forEach(c=>c.classList.remove("drop")); });

function shrinkImage(file,max){ return new Promise(ok=>{ const r=new FileReader(); r.onload=()=>{ const im=new Image(); im.onload=()=>{ const s=Math.min(1,max/Math.max(im.width,im.height)); const c=document.createElement("canvas"); c.width=im.width*s; c.height=im.height*s; c.getContext("2d").drawImage(im,0,0,c.width,c.height); ok(c.toDataURL("image/jpeg",.82)); }; im.src=r.result; }; r.readAsDataURL(file); }); }

/* ---------------- Sketch (Apple Pencil aware) ---------------- */
const sk={tool:"pen",color:"#1D2227",size:4,strokes:[],cur:null,penSeen:false,base:null,ro:null,c:null,x:null,w:0,h:0};
function setupSketch(){
  const c=$("#sketch"); sk.c=c; sk.x=c.getContext("2d"); sk.strokes=[]; sk.base=null;
  const ed=ctx.editSketch&&S.sketches.find(s=>s.id===ctx.editSketch);
  if(ed){ const im=new Image(); im.onload=()=>{sk.base=im; redraw();}; im.src=ed.img; }
  const fit=()=>{ const r=c.getBoundingClientRect(),d=window.devicePixelRatio||1; sk.w=r.width; sk.h=r.height; c.width=r.width*d; c.height=r.height*d; sk.x.setTransform(d,0,0,d,0,0); redraw(); };
  sk.ro=new ResizeObserver(fit); sk.ro.observe(c); fit();
  syncTools();
  document.querySelectorAll("[data-tool]").forEach(b=>b.onclick=()=>{sk.tool=b.dataset.tool; syncTools();});
  document.querySelectorAll("[data-color]").forEach(b=>b.onclick=()=>{sk.color=b.dataset.color; if(sk.tool==="eraser") sk.tool="pen"; syncTools();});
  $("#sk-size").value=sk.size; $("#sk-size").oninput=e=>sk.size=+e.target.value;
  if(sk.penSeen) $("#pen-hint").textContent="Pencil mode: fingers and palm are ignored";
  c.onpointerdown=e=>{
    if(e.pointerType==="pen" && !sk.penSeen){ sk.penSeen=true; $("#pen-hint").textContent="Pencil mode: fingers and palm are ignored"; }
    if(sk.penSeen && e.pointerType==="touch") return;           // palm rejection
    e.preventDefault(); c.setPointerCapture(e.pointerId);
    sk.cur={tool:sk.tool,color:sk.color,size:sk.size,pts:[pt(e)]}; sk.strokes.push(sk.cur); redraw();
  };
  c.onpointermove=e=>{
    if(!sk.cur||(sk.penSeen&&e.pointerType==="touch")) return;
    const evs=e.getCoalescedEvents?e.getCoalescedEvents():[e];
    evs.forEach(ev=>sk.cur.pts.push(pt(ev))); redraw();
  };
  c.onpointerup=c.onpointercancel=()=>{ sk.cur=null; };
}
function pt(e){ const r=sk.c.getBoundingClientRect(); const p=e.pointerType==="pen"?(e.pressure||.5):.5; return [e.clientX-r.left,e.clientY-r.top,p]; }
function syncTools(){ document.querySelectorAll("[data-tool]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.tool===sk.tool)); document.querySelectorAll("[data-color]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.color===sk.color&&sk.tool!=="eraser")); }
function redraw(){
  const x=sk.x; if(!x) return; x.clearRect(0,0,sk.w,sk.h);
  if(sk.base) x.drawImage(sk.base,0,0,sk.w,sk.h);
  sk.strokes.forEach(s=>{
    x.save(); x.lineCap="round"; x.lineJoin="round";
    if(s.tool==="eraser"){ x.globalCompositeOperation="destination-out"; }
    if(s.tool==="marker"){ x.globalAlpha=.32; x.globalCompositeOperation="multiply"; }
    x.strokeStyle=s.color; const P=s.pts;
    if(P.length===1){ x.fillStyle=s.color; x.beginPath(); x.arc(P[0][0],P[0][1],s.size*.6,0,7); x.fill(); x.restore(); return; }
    if(s.tool==="marker"||s.tool==="eraser"){ x.lineWidth=s.tool==="marker"?s.size*4:s.size*4; x.beginPath(); x.moveTo(P[0][0],P[0][1]); for(let i=1;i<P.length-1;i++){const mx=(P[i][0]+P[i+1][0])/2,my=(P[i][1]+P[i+1][1])/2; x.quadraticCurveTo(P[i][0],P[i][1],mx,my);} x.lineTo(P[P.length-1][0],P[P.length-1][1]); x.stroke(); }
    else { for(let i=1;i<P.length;i++){ const a=P[i-1],b=P[i]; x.lineWidth=s.size*(.35+((a[2]+b[2])/2)*1.3); x.beginPath(); x.moveTo(a[0],a[1]); x.lineTo(b[0],b[1]); x.stroke(); } }
    x.restore();
  });
}
function saveSketch(){
  if(!sk.strokes.length&&!sk.base) return toast("Draw something first");
  const o=document.createElement("canvas"); const sc=Math.min(1,900/sk.w); o.width=sk.w*sc; o.height=sk.h*sc;
  const ox=o.getContext("2d"); ox.fillStyle="#FFFFFF"; ox.fillRect(0,0,o.width,o.height); ox.drawImage(sk.c,0,0,o.width,o.height);
  const img=o.toDataURL("image/jpeg",.85), title=$("#sk-title").value.trim()||"Sketch "+(S.sketches.length+1), taskId=$("#sk-task").value||null;
  const ed=ctx.editSketch&&S.sketches.find(s=>s.id===ctx.editSketch);
  if(ed){ Object.assign(ed,{img,title,taskId}); } else { const s={id:uid(),img,title,taskId}; S.sketches.push(s); ctx.editSketch=s.id; }
  save(); ctx.sketchTask=null; render(); toast(taskId?"Sketch saved to "+task(taskId).title:"Sketch saved");
}
function teardownSketch(){ if(sk.ro){ sk.ro.disconnect(); sk.ro=null; } sk.x=null; }

/* ---------------- Celebrate ---------------- */
let toastT;
function toast(msg){ const t=$("#toast"); t.innerHTML=msg; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true,3600); }
function celebrate(from,to,amount,why){
  const G=S.garden, V=VARIETY[G.kind], a=stageOf(from)[1], b=stageOf(to)[1], o={...plantOpts(),thirsty:false};
  toast(`<span class="toast-plant" data-live-plant>${plantSVG(G.kind,from,{noBee:true})}</span><span>${V.name} +${amount}%. ${a!==b?(to>=100?"Ready to harvest!":"Now "+b.toLowerCase()+"."):Math.round(to)+"% grown."}</span>`);
  renderStats();
  const chip=$("#stats .plant-chip"), els=[...document.querySelectorAll("[data-live-plant]")];
  els.forEach(el=>{ const s=el.querySelector("svg.plant"); if(s) s.outerHTML=plantSVG(G.kind,from,{...o,noBee:true}); });
  if(chip){ chip.querySelector("svg.plant").outerHTML=plantSVG(G.kind,from,{noBee:true}); chip.querySelector(".mono").textContent=Math.round(from)+"%"; }
  playWater();
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){ renderStats(); els.forEach(el=>{ const s=el.querySelector("svg.plant"); if(s) s.outerHTML=plantSVG(G.kind,to,o); }); return; }
  els.forEach(el=>{ if(el.classList.contains("scene")&&el.offsetParent) waterFx(el); });
  setTimeout(()=>{
    if(chip){ chip.classList.add("pop"); setTimeout(()=>chip.classList.remove("pop"),700); const t0=performance.now(); (function f(now){ const k=Math.min(1,(now-t0)/1500), g=from+(to-from)*(1-Math.pow(1-k,3)); if(!chip.isConnected) return; chip.querySelector("svg.plant").outerHTML=plantSVG(G.kind,g,{noBee:true}); chip.querySelector(".mono").textContent=Math.round(g)+"%"; if(k<1) requestAnimationFrame(f); })(t0); }
    els.forEach((el,i)=>tweenPlant(el,G.kind,from,to,el.classList.contains("toast-plant")?{noBee:true}:o,1500,i===0?()=>{ if(a!==b){ burst(); playChime(to>=100?[659,784,988,1319]:undefined); } }:null));
  },900);
}
function burst(){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c=$("#confetti"), x=c.getContext("2d"), d=devicePixelRatio||1; c.hidden=false; c.width=innerWidth*d; c.height=innerHeight*d; x.scale(d,d);
  const cs=getComputedStyle(document.documentElement); const cols=["--good","--gold","--leaf","--warn"].map(v=>cs.getPropertyValue(v).trim());
  const P=[...Array(110)].map(()=>({x:innerWidth/2,y:innerHeight*.55,vx:(Math.random()-.5)*14,vy:-Math.random()*14-5,r:Math.random()*6+3,c:cols[Math.random()*4|0],a:Math.random()*6,s:(Math.random()-.5)*.3}));
  let f=0; (function step(){ x.clearRect(0,0,innerWidth,innerHeight); P.forEach(p=>{p.vy+=.45;p.x+=p.vx;p.y+=p.vy;p.vx*=.99;p.a+=p.s; x.save(); x.translate(p.x,p.y); x.rotate(p.a); x.fillStyle=p.c; x.fillRect(-p.r/2,-p.r/4,p.r,p.r/2); x.restore();}); if(++f<90) requestAnimationFrame(step); else c.hidden=true; })();
}

boot();
