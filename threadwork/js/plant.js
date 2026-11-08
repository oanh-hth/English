// Plant, sky scene and watering effects. Pure rendering: no app state.
export const VARIETY={
  tomato:{name:"Tomato",plural:"tomatoes",fruit:"#E0412F",shape:"round",yield:5,unlock:0,stake:true},
  chili:{name:"Chili",plural:"chilies",fruit:"#D42A1C",shape:"long",yield:6,unlock:1,stake:false},
  lemon:{name:"Lemon tree",plural:"lemons",fruit:"#F2C230",shape:"round",yield:4,unlock:3,stake:false},
  eggplant:{name:"Eggplant",plural:"eggplants",fruit:"#6B3FA0",shape:"long",yield:4,unlock:5,stake:true}
};
export const STAGES=[[0,"Seed"],[5,"Sprout"],[15,"Seedling"],[30,"Young plant"],[50,"Flowering"],[65,"Fruiting"],[80,"Ripening"],[100,"Ready to harvest"]];


export const WX={sun:"Sunny",cloud:"Cloudy",rain:"Rain",snow:"Snow",wind:"Windy"};
export const MOTION={calm:1.7,normal:1,lively:.6};
let motion=1;
export function setMotion(name){ motion=MOTION[name]||1; document.documentElement.style.setProperty("--m",motion); }
export const stageOf=g=>{let st=STAGES[0];STAGES.forEach(x=>{if(g>=x[0])st=x});return st};
export const nextStage=g=>STAGES.find(x=>x[0]>g);

function rnd(i,n){ const x=Math.sin(i*127.1+n*311.7)*43758.5453; return x-Math.floor(x); }   // stable pseudo-random
function sceneLayers(w,nt,small){
  let back="",front=""; const k=small?.45:1;
  if(nt) back+=[...Array(small?6:14)].map((_,i)=>`<i class="star" style="left:${rnd(i,1)*95}%;top:${rnd(i,2)*45}%;animation-delay:${-rnd(i,3)*3}s"></i>`).join("");
  if(w==="sun"||w==="wind") back+=nt?`<i class="moon"></i>`:`<i class="sun"></i>`;
  else if(nt&&w==="snow") back+=`<i class="moon"></i>`;
  const clouds={sun:1,wind:2,cloud:3,rain:4,snow:3}[w];
  back+=[...Array(clouds)].map((_,i)=>`<i class="cloud" style="top:${6+i*9+rnd(i,4)*6}%;animation-delay:${-(i*13+rnd(i,5)*10)}s"></i>`).join("");
  if(w==="rain"){ front+=[...Array(Math.round(46*k))].map((_,i)=>`<i class="rain" style="left:${rnd(i,6)*104-2}%;animation-delay:${-rnd(i,7)}s;animation-duration:calc(${(.6+rnd(i,8)*.35).toFixed(2)}s*var(--m))"></i>`).join("")
      +[...Array(Math.round(8*k))].map((_,i)=>`<i class="splash" style="left:${rnd(i,9)*92}%;animation-delay:${-rnd(i,10)}s"></i>`).join(""); }
  if(w==="snow") front+=[...Array(Math.round(30*k))].map((_,i)=>`<i class="flake" style="left:${rnd(i,11)*100}%;animation-delay:${-rnd(i,12)*7}s;width:${3+rnd(i,13)*4}px;height:${3+rnd(i,13)*4}px"></i>`).join("");
  if(w==="wind") front+=[...Array(Math.round(5*k)+1)].map((_,i)=>`<i class="gust" style="top:${15+rnd(i,14)*60}%;animation-delay:${-rnd(i,15)*1.6}s"></i>`).join("");
  return {back:`<div class="sky-layer">${back}</div>`,front:`<div class="fx-layer">${front}</div>`};
}
export function scene(cls,kind,g,o,attrs="",badge=true){
  const L=sceneLayers(o.weather,o.night,cls.includes("small"));
  return `<div class="${cls} scene w-${o.weather}${o.night?" night":""}" ${attrs}>${L.back}${plantSVG(kind,g,o)}${L.front}${badge?`<span class="scene-badge">${o.label||WX[o.weather]+" · "+(o.night?"Night":"Day")}</span>`:""}</div>`;
}

function mix(a,b,t){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const A=p(a),B=p(b);return "#"+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,"0")).join("")}
export function plantSVG(kind,g,opt={}){
  const V=VARIETY[kind]; g=Math.max(0,Math.min(100,g)); const dry=opt.thirsty;
  const ph=-(performance.now()%12000)/1000;               // keeps idle motion continuous across re-renders
  const D=s=>`animation-delay:${(ph+s).toFixed(2)}s`;
  const cl=v=>Math.max(0,Math.min(1,v));
  const leaf=dry?"#A9A24B":"var(--leaf)", leafD=dry?"#7F7A33":"var(--leaf-dark)";
  const o=`<svg class="plant${opt.still?" still":""}${dry?" dry":""}" viewBox="0 0 200 260" role="img" aria-label="${V.name}, ${Math.round(g)}% grown">`;
  const pot=`<path d="M56 212h88l-9 44H65z" fill="var(--pot)"/><rect x="48" y="200" width="104" height="15" rx="4" fill="var(--pot-rim)"/><ellipse cx="100" cy="202" rx="48" ry="5" fill="var(--soil)"/>`;
  if(g<5) return o+pot+`<g class="seed-wiggle" style="${D(0)}"><ellipse cx="100" cy="199" rx="6" ry="4" fill="#8A5A2B"/>${g>2?`<path d="M100 196q2-5 5-6" stroke="var(--leaf)" stroke-width="2" fill="none" stroke-linecap="round"/>`:""}</g></svg>`;
  const L=14+g*1.62, top=200-L, sway=10, mid=(200+top)/2;
  const P=t=>[(1-t)*(1-t)*100+2*(1-t)*t*(100+sway)+t*t*100,(1-t)*(1-t)*200+2*(1-t)*t*mid+t*t*top];
  let back="",front="",fx="";
  if(V.stake&&g>=40) back+=`<line x1="124" y1="206" x2="124" y2="${top+18}" stroke="#C8A165" stroke-width="3.5" stroke-linecap="round" opacity="${cl((g-40)/6)}"/>`;
  back+=`<path d="M100 200Q${100+sway} ${mid} 100 ${top}" stroke="var(--stem)" stroke-width="${2+g*.035}" fill="none" stroke-linecap="round"/>`;
  const slots=[];
  for(let i=0;i<12;i++){
    const h=14+i*14, sc=cl((L-h-6)/14); if(sc<=0) break;     // leaves unfurl as the stem passes them
    const t=h/L, [x,y]=P(t), side=i%2?1:-1;
    const sz=(10+Math.min(18,g*.2))*(1-h/176*.35)*sc, rot=side>0?-28+(dry?38:0):208-(dry?38:0);
    back+=`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot})"><g class="leaf" style="${D(i*.37)}"><path d="M0 0Q${sz*.5} ${-sz*.42} ${sz} 0Q${sz*.5} ${sz*.42} 0 0z" fill="${leaf}"/><path d="M1 0H${sz*.8}" stroke="${leafD}" stroke-width="1"/></g></g>`;
    if(t>.3&&t<.92&&sc>=1) slots.push([x+side*sz*.75,y]);
  }
  const bs=cl((g-5)/10);
  back+=`<g transform="translate(100 ${top}) scale(${bs})"><g class="leaf" style="${D(.5)}"><path d="M0 0Q-5 -9 -2 -16Q3 -9 0 0z" fill="${leaf}"/><path d="M0 0Q8 -6 11 -12Q3 -10 0 0z" fill="${leaf}"/></g></g>`;
  slots.slice(0,V.yield).forEach(([x,y],k)=>{
    const fl=cl((g-(50+6*k))/4), fr=cl((g-(65+7*k))/5);
    if(fr>0){
      const r=(4+Math.min(1,(g-65)/35)*7)*(.4+.6*fr), col=mix("#7DB548",V.fruit,cl((g-78)/22)), cy=y+r+6;
      const shape=V.shape==="round"?`<circle cx="${x}" cy="${cy}" r="${r}" fill="${col}"/><circle cx="${x-r*.35}" cy="${cy-r*.35}" r="${r*.25}" fill="#fff" opacity=".35"/><path d="M${x-4} ${cy-r}l4 2 4-2" stroke="var(--leaf-dark)" stroke-width="1.6" fill="none"/>`
        :`<ellipse cx="${x}" cy="${cy+r*.5}" rx="${r*.5}" ry="${r*1.35}" fill="${col}" transform="rotate(${k%2?10:-10} ${x} ${cy})"/><path d="M${x-3} ${cy-r*.8}l3 2 3-2" stroke="var(--leaf-dark)" stroke-width="1.6" fill="none"/>`;
      front+=`<g class="fruit" style="transform-origin:${x}px ${y}px;${D(k*.6)}"><g class="fruit-body" style="animation-delay:${k*.09}s"><line x1="${x}" y1="${y}" x2="${x}" y2="${cy-r}" stroke="var(--stem)" stroke-width="1.5"/>${shape}</g></g>`;
    }
    const fs=fl*(1-fr);
    if(fs>0) front+=`<g transform="translate(${x} ${y+4}) scale(${fs})"><g class="flower" style="${D(k*.45)}">${[0,72,144,216,288].map(a=>`<ellipse rx="2.2" ry="4" cy="-4" fill="#F4C842" transform="rotate(${a})"/>`).join("")}<circle r="1.8" fill="#C98A12"/></g></g>`;
  });
  if(g>=100) fx+=[[40,60],[160,80],[150,30],[50,120]].map(([x,y],i)=>`<path class="twinkle" style="animation-delay:${i*.45}s" d="M${x} ${y-7}l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="var(--gold)"/>`).join("");
  const calm=!dry&&!opt.still&&!opt.noBee&&!opt.night&&!['rain','snow'].includes(opt.weather), M=motion;
  if(g>=30&&calm) fx+=`<g class="butterfly"><path class="bw" d="M0 0C-9 -10 -14 -2 -10 3C-7 7 -2 4 0 0z" fill="#F28C38"/><path class="bw r" d="M0 0C9 -10 14 -2 10 3C7 7 2 4 0 0z" fill="#7A4FD1"/><ellipse rx="1.2" ry="4.5" fill="#2A2116"/><animateMotion dur="${13*M}s" repeatCount="indefinite" path="M30 ${mid}C10 ${top-10} 90 ${top-40} 150 ${top+10}S190 ${mid+40} 120 ${mid+30}S40 ${mid+50} 30 ${mid}"/></g>`;
  if(g>=50&&g<100&&calm) fx+=`<g class="bee"><ellipse class="wing" cx="-1" cy="-5" rx="3" ry="3.4" fill="#fff" opacity=".85"/><ellipse rx="5.5" ry="3.8" fill="#F4C842"/><path d="M-1.5 -3.6v7.2M1.8 -3.2v6.4" stroke="#2A2116" stroke-width="1.5"/><circle cx="5" cy="-.5" r="1.9" fill="#2A2116"/><animateMotion dur="${9*M}s" repeatCount="indefinite" path="M100 ${top+30}C175 ${top} 178 ${mid} 128 ${mid+12}S28 ${mid+24} 36 ${top+22}S82 ${top+44} 100 ${top+30}"/></g>`;
  return o+`<g class="sway">${back}${front}</g>`+pot+fx+"</svg>";
}

export function waterFx(host){
  const svg=host.querySelector("svg.plant"); if(!svg) return;
  const hr=host.getBoundingClientRect(), r=svg.getBoundingClientRect(); if(!r.width) return;
  const fx=document.createElement("div"); fx.className="water-fx";
  Object.assign(fx.style,{left:(r.left-hr.left)+"px",top:(r.top-hr.top)+"px",width:r.width+"px",height:r.height+"px"});
  fx.innerHTML=`<svg viewBox="0 0 200 260" width="100%" height="100%" style="overflow:visible"><g class="can"><path d="M140 108L118 92" stroke="#4F86B5" stroke-width="4.5" stroke-linecap="round"/><ellipse cx="116.5" cy="91" rx="3" ry="4.5" fill="#4F86B5" transform="rotate(-36 116.5 91)"/><rect x="140" y="95" width="36" height="28" rx="5" fill="#5E97C7"/><path d="M176 101q12 2 8 14" stroke="#4F86B5" stroke-width="3.5" fill="none" stroke-linecap="round"/><rect x="144" y="99" width="10" height="3" rx="1.5" fill="#fff" opacity=".4"/></g>${[0,1,2,3,4,5].map(i=>`<ellipse class="drop" cx="${107+i*2.4}" cy="${114+(i%2)*3}" rx="1.5" ry="3" fill="#6AB0E6" style="animation-delay:${.6+i*.09}s"/>`).join("")}</svg>`;
  host.appendChild(fx); setTimeout(()=>fx.remove(),2000);
}
export function tweenPlant(host,kind,from,to,o,dur,done){
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches, t0=performance.now(), D=reduce?0:dur;
  (function f(now){ const k=D?Math.min(1,(now-t0)/D):1, e=1-Math.pow(1-k,3), svg=host.isConnected&&host.querySelector("svg.plant");
    if(!svg) return; svg.outerHTML=plantSVG(kind,from+(to-from)*e,{...o,noBee:k<1}); if(k<1) requestAnimationFrame(f); else done&&done(); })(t0);
}
