// Threadwork: tasks, the results of complex ones, and the decisions you make along the way.
import * as store from "./store.js";
import * as auth from "./auth.js";
import * as cloud from "./cloud.js";
import * as L from "./logic.js";
import { CATEGORIES, GROUPS, categoryById, categoriesByGroup } from "./categories.js";

const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2,11);
const today=()=>L.todayKey();

/* ---------------- Data ---------------- */
function fresh(){ return { v:4, savedAt:0, profile:{name:"",email:""}, theme:null, tasks:[] }; }
function normalize(st){
  const f=fresh(); for(const k in f) if(st[k]===undefined) st[k]=f[k];
  st.tasks=L.migrateTasks(st.tasks||[]);
  for(const k of ["notes","resources","sketches","inspo","garden","harvests","treats","redeemed","log","scene","streak","lastDone","spent","focusSessions","focusDone","nextKind"]) delete st[k];
  st.v=4; return st;
}
let S=fresh();
let signedIn=false;
function applyPrefs(){ applyTheme(); }

function exampleTasks(){
  const d=n=>L.addDays(today(),n), t=(title,extra={})=>({...L.createTask(title,uid(),d(-6)),sample:true,...extra});
  return [
    t("Reply to Minh about the workshop",{due:d(0)}),
    t("Update dependencies",{due:d(2)}),
    t("Decide how to handle form validation",{complexity:"complex",due:d(1)}),
    t("Choose how to lay out the board",{complexity:"complex",status:"done",doneAt:d(-2),outcome:{result:"Flexbox needed extra wrapper elements for the columns. Grid places columns and rows directly and keeps the HTML flat.",decision:"Use CSS Grid for the board, Flexbox inside each card.",category:"layout"}}),
    t("Pick a way to manage state",{complexity:"complex",status:"done",doneAt:d(-1),outcome:{result:"Context + useReducer covers everything the app needs today.",decision:"No state library for now. Revisit if the state grows past one reducer.",category:"state"}}),
    t("Check colour contrast on buttons",{complexity:"complex",status:"done",doneAt:d(-1),outcome:{result:"Muted grey text on white was 3.9:1, below WCAG AA (4.5:1).",decision:"Darken the muted colour to #646B72 (5.3:1).",category:"accessibility"}}),
    t("Clean up the downloads folder",{status:"done",doneAt:d(0)}),
  ];
}
const hasExamples=()=>S.tasks.some(t=>t.sample);

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
  if(signedIn){ render(); toast("Updated from your other device"); }
}
document.addEventListener("focusout",()=>setTimeout(()=>{ if(deferred&&!typing()){ const d=deferred; deferred=null; applyRemote(d); } },300));
function syncLabel(){
  if(!cloud.enabled()) return "Sync is off. Everything is saved on this device only.";
  if(!cloud.user()) return "Sync is set up, but you are not signed in.";
  if(sync.status==="syncing") return "Syncing…";
  if(sync.status==="error") return `Sync problem: ${esc(sync.error)} Changes are kept on this device and will be sent again.`;
  return sync.at?`Synced at ${new Date(sync.at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})} as ${esc(cloud.user().email)}`:`Connected as ${esc(cloud.user().email)}`;
}
function paintSync(){ const el=$("#sync-status"); if(el) el.innerHTML=syncLabel(); const top=$("#sync-top"); if(top) top.textContent=!cloud.enabled()?"On this device":!cloud.user()?"Not signed in to sync":sync.status==="syncing"?"Syncing…":sync.status==="error"?"Sync problem":"Synced"; }
const hasContent=st=>!!st.tasks.length;
async function pushEverything(){ if(!S.savedAt) S.savedAt=Date.now(); await cloud.push(JSON.stringify(store.stripImages(S)),S.savedAt); sync={status:"ok",at:Date.now(),error:""}; }
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
    d.onclick=e=>{ const b=e.target.closest("[data-choice]"); if(!b) return; d.hidden=true; $("#scrim").hidden=true; done(b.dataset.choice); };
  });
}

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
    signin:`<div><h2>Welcome back</h2><p class="muted">Sign in to your tasks and decisions.</p></div>
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
  $("#login").hidden=true; $("#app").hidden=false; render();
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
const VIEWS=["tasks","decisions","settings"];
const cur=()=>{const h=location.hash.slice(1);return VIEWS.includes(h)?h:"tasks"};
window.addEventListener("hashchange",()=>{ if(signedIn){ closeOutcome(); render(); } });
const filter={group:null,category:null,text:""};
let showAllDone=false, recording=null, searchT=null, restoreData=null;

function render(){
  const v=cur();
  document.querySelectorAll(".tabs a").forEach(a=>{ if(a.getAttribute("href")==="#"+v) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  $("#view").innerHTML=R[v]();
  paintSync();
}

/* ---------------- Views ---------------- */
const R={};
const plural=(n,one,many)=>`${n} ${n===1?one:many}`;

function taskItem(t){
  const done=t.status==="done", due=done?"":L.dueLabel(t.due,today()), cat=t.outcome&&categoryById(t.outcome.category);
  return `<li class="task-item" data-status="${t.status}" data-complexity="${t.complexity}">
    ${!done&&t.complexity==="simple"?`<input type="checkbox" class="tick" aria-label="Done: ${esc(t.title)}" data-act="complete" data-id="${t.id}">`:""}
    <div class="body">
      <span class="title">${esc(t.title)}</span>
      <span class="meta">
        ${t.complexity==="complex"?`<span class="pill complex">Complex</span>`:""}
        ${due?`<span class="${due.includes("overdue")?"due overdue":"due"}">${due}</span>`:""}
        ${done?`<span>Done ${t.doneAt}</span>`:""}
        ${done&&t.outcome?`<button class="pill category" data-act="filter-cat" data-id="${esc(t.outcome.category)}" aria-label="Show all ${esc(cat?.name??t.outcome.category)} decisions">${esc(cat?.name??t.outcome.category)}</button>`:""}
      </span>
      ${done&&t.outcome?`<p class="decision">${esc(t.outcome.decision)}</p>`:""}
    </div>
    <div class="actions">
      ${!done&&t.complexity==="complex"?`<button class="primary" data-act="record" data-id="${t.id}" aria-label="Record result for ${esc(t.title)}">Record result</button>`:""}
      ${!done?`<button class="ghost" data-act="toggle-kind" data-id="${t.id}" title="Change between simple and complex">${t.complexity==="simple"?"Make complex":"Make simple"}</button>`:""}
      ${done&&t.outcome?`<button data-act="record" data-id="${t.id}" aria-label="Edit result for ${esc(t.title)}">Edit result</button>`:""}
      ${done?`<button data-act="reopen" data-id="${t.id}" aria-label="Reopen ${esc(t.title)}">Reopen</button>`:""}
      <button class="ghost" data-act="delete" data-id="${t.id}" aria-label="Delete ${esc(t.title)}">Delete</button>
    </div>
  </li>`;
}

R.tasks=()=>{
  const s=L.weekSummary(S.tasks,today()), sorted=L.sortTasks(S.tasks);
  const todo=sorted.filter(t=>t.status==="todo"), done=sorted.filter(t=>t.status==="done");
  const top=s.topCategory&&categoryById(s.topCategory.id);
  return `
  ${S.tasks.length?"":`<section class="card start"><h2>Start here</h2><ol>
    <li>Type a task below and press <b>Add</b>. Tick <b>Needs a decision</b> when finishing it will mean choosing something.</li>
    <li>Simple tasks: tick them off. Complex tasks: press <b>Record result</b> and write what happened, what you decided, and the topic.</li>
    <li>Open <b>Decisions</b> to filter everything you've decided by topic.</li></ol>
    <button data-act="add-examples">Add example tasks to explore</button></section>`}
  <section class="summary" aria-label="This week">
    <div><b>${s.open}</b><span>to do</span></div>
    <div class="${s.overdue?"warn":""}"><b>${s.overdue}</b><span>overdue</span></div>
    <div><b>${s.doneToday}</b><span>done today</span></div>
    <div><b>${s.doneThisWeek}</b><span>done this week</span></div>
    <div><b>${s.decisionsThisWeek}</b><span>decisions this week</span></div>
    ${top?`<div class="wide"><b>${esc(top.name)}</b><span>most decided this week</span></div>`:""}
  </section>
  <form class="capture" id="capture-form">
    <label for="capture" class="visually-hidden">Capture a task</label>
    <input id="capture" placeholder="What do you need to do?" autocomplete="off">
    <label class="check"><input type="checkbox" id="capture-complex"> Needs a decision</label>
    <label class="date">Due <input type="date" id="capture-due"></label>
    <button type="submit" class="primary">Add</button>
    <p class="error" id="capture-err" role="alert" hidden></p>
  </form>
  <div class="task-list">
    <section aria-label="To do"><h2>To do (${todo.length})</h2>
      ${todo.length?`<ul>${todo.map(taskItem).join("")}</ul>`:`<p class="empty">Nothing to do. Capture a task above.</p>`}</section>
    <section aria-label="Done"><h2>Done (${done.length})</h2>
      ${done.length?`<ul>${(showAllDone?done:done.slice(0,10)).map(taskItem).join("")}</ul>`:`<p class="empty">Finished tasks appear here.</p>`}
      ${!showAllDone&&done.length>10?`<button data-act="show-all">Show all ${done.length}</button>`:""}</section>
  </div>
  ${hasExamples()?`<p class="muted"><button class="linkish" data-act="remove-examples">Remove the example tasks</button></p>`:""}`;
};

function decisionList(){
  const all=L.decisionsOf(S.tasks), shown=L.filterDecisions(all,filter);
  if(!all.length) return `<p class="empty">No decisions yet. When you finish a complex task, its result and decision appear here.</p>`;
  return `<p class="muted">${plural(shown.length,"decision","decisions")}</p>
    ${shown.length?shown.map(d=>{ const name=categoryById(d.category)?.name??d.category; return `
      <article class="decision-card" aria-labelledby="d-${d.taskId}">
        <header><h3 id="d-${d.taskId}">${esc(d.title)}</h3><time datetime="${d.doneAt}">${d.doneAt}</time></header>
        <button class="pill category" data-act="filter-cat" data-id="${esc(d.category)}" aria-label="Show all ${esc(name)} decisions">${esc(name)}</button>
        <dl><dt>Result</dt><dd>${esc(d.result)}</dd><dt>Decision</dt><dd>${esc(d.decision)}</dd></dl>
        <button data-act="record" data-id="${d.taskId}" aria-label="Edit ${esc(d.title)}">Edit</button>
      </article>`;}).join(""):`<p class="empty">No decisions match these filters. <button data-act="clear-filters">Clear filters</button></p>`}`;
}
function filterControls(){
  const counts=L.countByCategory(L.decisionsOf(S.tasks));
  const options=CATEGORIES.filter(c=>(!filter.group||c.group===filter.group)&&((counts[c.id]??0)>0||c.id===filter.category));
  const active=filter.group||filter.category||filter.text;
  return `<div class="groups">${[null,...GROUPS].map(g=>`<button data-act="group" data-g="${g??""}" aria-pressed="${filter.group===g}">${g??"All"}</button>`).join("")}</div>
    <label for="f-category">Category</label>
    <select id="f-category"><option value="">All categories</option>${options.map(c=>`<option value="${c.id}" ${c.id===filter.category?"selected":""}>${esc(c.name)} (${counts[c.id]??0})</option>`).join("")}</select>
    <label for="f-text">Search decisions</label>
    <input id="f-text" type="search" value="${esc(filter.text)}">
    ${active?`<button data-act="clear-filters">Clear filters</button>`:""}`;
}
R.decisions=()=>`<section class="card">
  <div class="row between"><h1>Decisions</h1><button data-act="export-md">Export as Markdown</button></div>
  <p class="muted">What you learned and decided while finishing complex tasks, filed by web development topic.</p>
  ${L.decisionsOf(S.tasks).length?`<div role="search" aria-label="Filter decisions" class="filters" id="filters">${filterControls()}</div>`:""}
  <div id="decision-list" class="decision-log">${decisionList()}</div></section>`;
function refreshDecisions(){ const f=$("#filters"); if(f){ f.innerHTML=filterControls(); } const l=$("#decision-list"); if(l) l.innerHTML=decisionList(); }

/* ---------------- Outcome dialog ---------------- */
function openOutcome(id){
  const t=S.tasks.find(x=>x.id===id); if(!t) return;
  recording=id; const o=t.outcome??{result:"",decision:"",category:""}, groups=categoriesByGroup();
  $("#outcome").innerHTML=`<form id="outcome-form" class="outcome-form" role="dialog" aria-label="Record the result" novalidate>
    <h2>${esc(t.title)}</h2>
    <label for="o-result">Result</label><textarea id="o-result" rows="4" placeholder="What happened? What did you find out?">${esc(o.result)}</textarea>
    <label for="o-decision">Decision</label><textarea id="o-decision" rows="3" placeholder="What did you decide, and why?">${esc(o.decision)}</textarea>
    <label for="o-category">Category</label>
    <select id="o-category"><option value="">Choose a category…</option>${GROUPS.map(g=>`<optgroup label="${g}">${groups[g].map(c=>`<option value="${c.id}" ${c.id===o.category?"selected":""}>${esc(c.name)}</option>`).join("")}</optgroup>`).join("")}</select>
    <p class="error" id="o-err" role="alert" hidden></p>
    <div class="row"><button type="submit" class="primary">Save decision</button><button type="button" data-act="close-outcome">Cancel</button></div>
  </form>`;
  $("#outcome").hidden=false; setTimeout(()=>$("#o-result")?.focus(),30);
}
function closeOutcome(){ recording=null; $("#outcome").hidden=true; $("#outcome").innerHTML=""; }

/* ---------------- Settings ---------------- */
R.settings=()=>{
  const cl=cloud.enabled();
  return `<div class="settings-grid">
    <section class="card stack"><h2>Account</h2>
      <form id="name-form" class="row"><label class="label" for="set-name" style="width:100%">Name</label><input class="input" id="set-name" value="${esc(S.profile.name)}" style="flex:1;min-width:160px"><button class="btn" type="submit">Save</button></form>
      <p class="muted">Email: ${esc(S.profile.email||"not set")}</p>
      ${cl?`<p class="muted" style="font-size:.85rem">Your password is managed by your sync account. To change it, sign out and use "Email me a reset link".</p>`
      :`<form id="pw-form" class="stack" style="gap:8px"><span class="label">Change password</span><input class="input" id="pw-old" type="password" autocomplete="current-password" placeholder="Current password" required><input class="input" id="pw-new" type="password" autocomplete="new-password" placeholder="New password, 8+ characters" required><input class="input" id="pw-new2" type="password" autocomplete="new-password" placeholder="Repeat new password" required><button class="btn" type="submit">Change password</button></form>`}
      <div><button class="btn" data-act="logout">Sign out</button></div>
    </section>
    <section class="card stack"><h2>Sync between iPad and computer</h2>
      <p id="sync-status" class="sync-line">${syncLabel()}</p>
      ${cl?`<div><button class="btn" data-act="cloud-off">Stop syncing on this device</button></div>`
      :`<p class="muted" style="font-size:.88rem">Sync uses your own free Firebase project. Follow the steps in the README, then paste the config here on each device.</p>
      <form id="sync-form" class="stack" style="gap:8px"><label class="label" for="fb-config">Firebase config</label><textarea class="input" id="fb-config" placeholder="const firebaseConfig = { apiKey: ..., projectId: ..., appId: ... }" style="min-height:110px;font-family:ui-monospace,monospace;font-size:.8rem"></textarea><button class="btn primary" type="submit">Connect sync</button></form>`}
    </section>
    <section class="card stack"><h2>Backup and export</h2>
      <p class="muted" style="font-size:.88rem">Download everything as one file, and keep a copy somewhere safe, especially if sync is off.</p>
      <div class="row"><button class="btn" data-act="backup">Download backup</button><label class="btn" for="restore-file" style="cursor:pointer">Restore from file</label><input id="restore-file" type="file" accept="application/json,.json" hidden><button class="btn" data-act="export-md">Export decisions as Markdown</button></div>
      <div id="restore-confirm"></div>
    </section>
    <section class="card stack"><h2>Appearance</h2>
      <div class="seg">${[["","Match device"],["light","Light"],["dark","Dark"]].map(([v,l])=>`<button data-act="set-theme" data-v="${v}" aria-pressed="${(S.theme||"")===v}">${l}</button>`).join("")}</div>
      <h2>Example tasks</h2>
      <div>${hasExamples()?`<button class="btn" data-act="remove-examples">Remove example tasks</button>`:`<button class="btn" data-act="add-examples">Add example tasks</button>`}</div>
      <h2>Erase</h2><p class="muted" style="font-size:.88rem">Removes everything stored on this device and signs you out.</p>
      <div><button class="btn danger" data-act="erase">Erase this device</button></div>
    </section>
  </div>`;
};

/* ---------------- Theme, toast, download ---------------- */
let toastT;
function toast(msg){ const t=$("#toast"); t.innerHTML=msg; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true,3200); }
function download(name,text,type){ const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([text],{type})); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000); }

/* ---------------- Actions ---------------- */
function change(fn){ S.tasks=fn(S.tasks); save(); render(); }
const A={
  complete:d=>{ change(ts=>L.completeSimple(ts,d.id,today())); toast("Done"); },
  record:d=>openOutcome(d.id),
  "close-outcome":closeOutcome,
  reopen:d=>change(ts=>L.reopenTask(ts,d.id)),
  "toggle-kind":d=>{ const t=S.tasks.find(x=>x.id===d.id); change(ts=>L.setComplexity(ts,d.id,t.complexity==="simple"?"complex":"simple")); },
  delete:d=>{ const b=document.querySelector(`[data-act=delete][data-id="${d.id}"]`); if(!b.dataset.armed){ b.dataset.armed="1"; b.textContent="Tap to confirm"; b.classList.add("danger"); return; } change(ts=>L.deleteTask(ts,d.id)); },
  "show-all":()=>{ showAllDone=true; render(); },
  "filter-cat":d=>{ filter.group=null; filter.category=d.id; filter.text=""; if(cur()==="decisions") render(); else location.hash="decisions"; },
  group:d=>{ filter.group=d.g||null; filter.category=null; refreshDecisions(); },
  "clear-filters":()=>{ filter.group=null; filter.category=null; filter.text=""; render(); },
  "export-md":()=>{ download(`decisions-${today()}.md`,L.decisionsToMarkdown(L.decisionsOf(S.tasks)),"text/markdown"); toast("Decisions exported"); },
  "add-examples":()=>{ if(hasExamples()) return; S.tasks=[...exampleTasks(),...S.tasks]; save(); render(); toast("Example tasks added. Remove them from the task list or Settings."); },
  "remove-examples":()=>{ S.tasks=S.tasks.filter(t=>!t.sample); save(); render(); toast("Example tasks removed"); },
  "set-theme":d=>{ S.theme=d.v||null; save(); applyTheme(); render(); },
  logout:async()=>{ auth.endSession(); if(cloud.user()) await cloud.signOut(); location.hash=""; location.reload(); },
  backup:()=>{ download(`threadwork-backup-${today()}.json`,JSON.stringify({app:"threadwork",version:2,exportedAt:new Date().toISOString(),state:S}),"application/json"); toast("Backup downloaded"); },
  "restore-yes":()=>{ if(!restoreData) return; S=normalize(restoreData); S.savedAt=Date.now(); restoreData=null; applyPrefs(); save(); render(); toast("Backup restored"); },
  "restore-no":()=>{ restoreData=null; render(); },
  "cloud-off":async()=>{ if(cloud.user()) await cloud.signOut(); cloud.setConfig(null); auth.startSession(S.profile.email||"me"); location.reload(); },
  erase:async()=>{ const b=$("[data-act=erase]"); if(!b.dataset.armed){ b.dataset.armed="1"; b.textContent="Tap again to erase everything on this device"; return; } if(cloud.user()) await cloud.signOut(); await store.wipeAll(); auth.endSession(); cloud.setConfig(null); location.hash=""; location.reload(); },
};
document.addEventListener("click",e=>{
  const el=e.target.closest("[data-act]"); if(!el||el.closest("#login")) return;
  const f=A[el.dataset.act]; if(!f) return;
  if(el.tagName!=="INPUT") e.preventDefault();
  f(el.dataset);
});
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&recording) closeOutcome(); });
$("#outcome").addEventListener("click",e=>{ if(e.target.id==="outcome") closeOutcome(); });
document.addEventListener("change",e=>{
  const el=e.target;
  if(el.id==="f-category"){ filter.category=el.value||null; refreshDecisions(); }
  else if(el.id==="restore-file"&&el.files[0]){ el.files[0].text().then(t=>{ try{ const d=JSON.parse(t); if(d.app!=="threadwork"||!d.state) throw 0; restoreData=d.state; $("#restore-confirm").innerHTML=`<p>Replace everything with the backup from <b>${esc((d.exportedAt||"").slice(0,10))}</b> (${d.state.tasks?.length||0} tasks)?</p><div class="row"><button class="btn primary" data-act="restore-yes">Replace</button><button class="btn ghost" data-act="restore-no">Cancel</button></div>`; }catch(x){ toast("That file isn't a Threadwork backup."); } }); }
});
document.addEventListener("input",e=>{
  if(e.target.id==="f-text"){ filter.text=e.target.value; clearTimeout(searchT); searchT=setTimeout(()=>{ const l=$("#decision-list"); if(l) l.innerHTML=decisionList(); },250); }
  if(e.target.id==="capture"){ const er=$("#capture-err"); if(er) er.hidden=true; }
});
document.addEventListener("submit",e=>{
  const f=e.target; e.preventDefault();
  if(f.id.startsWith("auth-")) return onAuthSubmit(f);
  if(f.id==="capture-form"){
    const title=$("#capture").value.trim();
    if(!title){ const er=$("#capture-err"); er.textContent="Type a task first"; er.hidden=false; return; }
    S.tasks=[L.createTask(title,uid(),today(),{complexity:$("#capture-complex").checked?"complex":"simple",due:$("#capture-due").value||null}),...S.tasks];
    save(); render(); $("#capture")?.focus();
  }
  if(f.id==="outcome-form"){
    const r=L.parseOutcome({result:$("#o-result").value,decision:$("#o-decision").value,category:$("#o-category").value});
    if(!r.ok){ const er=$("#o-err"); er.textContent=r.error; er.hidden=false; return; }
    const id=recording, first=S.tasks.find(t=>t.id===id)?.status!=="done";
    closeOutcome(); change(ts=>L.recordOutcome(ts,id,r.value,today()));
    toast(first?`Decision saved under ${esc(categoryById(r.value.category)?.name??"")}`:"Decision updated");
  }
  if(f.id==="name-form"){ S.profile.name=$("#set-name").value.trim(); save(); render(); toast("Name saved"); }
  if(f.id==="pw-form"){ const ok=$("#pw-new").value.length>=8&&$("#pw-new").value===$("#pw-new2").value; if(!ok) return toast("New passwords must match and be at least 8 characters."); auth.changePassword($("#pw-old").value,$("#pw-new").value).then(r=>{ toast(r?"Password changed":"Current password is wrong"); if(r) f.reset(); }); }
  if(f.id==="sync-form") connectCloud($("#fb-config").value,m=>toast(esc(m)));
});

boot();
