// Given: the illustrations for Threadwork: background scenes, stickers and folders. Plain SVG strings, no libraries.
// Each scene carries its own <style> with animations, and turns them off under prefers-reduced-motion.

const motionOff = (p: string) => `@media (prefers-reduced-motion: reduce){.${p} *{animation:none!important}}`;

/* ------------------------------------------------------------------ scenes */
const coffee = `<svg class="sc-coffee" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<style>
.sc-coffee .lamp{transform-origin:0 0;animation:cf-swing 6s ease-in-out infinite}
.sc-coffee .lamp.b{animation-duration:7.5s;animation-delay:-2s}
.sc-coffee .steam path{animation:cf-steam 4s ease-in-out infinite;opacity:0}
.sc-coffee .steam path:nth-child(2){animation-delay:-1.3s}.sc-coffee .steam path:nth-child(3){animation-delay:-2.6s}
.sc-coffee .cloud{animation:cf-drift 60s linear infinite}.sc-coffee .cloud.b{animation-duration:85s;animation-delay:-40s}
.sc-coffee .glow{animation:cf-glow 5s ease-in-out infinite}
@keyframes cf-swing{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
@keyframes cf-steam{0%{opacity:0;transform:translateY(10px)}30%{opacity:.7}100%{opacity:0;transform:translateY(-40px)}}
@keyframes cf-drift{from{transform:translateX(-200px)}to{transform:translateX(520px)}}
@keyframes cf-glow{50%{opacity:.55}}
${motionOff("sc-coffee")}
</style>
<rect width="1200" height="800" fill="#E8D5BE"/>
<rect y="0" width="1200" height="40" fill="#5B3A2A"/>
<g><rect x="70" y="120" width="420" height="380" rx="10" fill="#9CC7E0"/>
<clipPath id="cf-win"><rect x="70" y="120" width="420" height="380" rx="10"/></clipPath>
<g clip-path="url(#cf-win)"><rect x="70" y="380" width="420" height="120" fill="#B9D7A8"/>
<g class="cloud"><ellipse cx="140" cy="200" rx="60" ry="22" fill="#fff" opacity=".9"/><ellipse cx="180" cy="188" rx="40" ry="20" fill="#fff" opacity=".9"/></g>
<g class="cloud b"><ellipse cx="100" cy="270" rx="50" ry="18" fill="#fff" opacity=".8"/></g>
<rect x="300" y="300" width="60" height="120" fill="#C98F6B"/><rect x="370" y="270" width="80" height="150" fill="#B97C58"/></g>
<rect x="70" y="120" width="420" height="380" rx="10" fill="none" stroke="#5B3A2A" stroke-width="14"/>
<line x1="280" y1="120" x2="280" y2="500" stroke="#5B3A2A" stroke-width="10"/><line x1="70" y1="310" x2="490" y2="310" stroke="#5B3A2A" stroke-width="10"/></g>
<g transform="translate(620 120)"><rect width="300" height="230" rx="8" fill="#2F3A33"/><rect x="10" y="10" width="280" height="210" rx="4" fill="none" stroke="#C7A97F" stroke-width="4"/>
<text x="150" y="58" fill="#F1E6D2" font-family="Georgia,serif" font-size="30" text-anchor="middle">Menu</text>
<g fill="#F1E6D2" font-family="Georgia,serif" font-size="18"><text x="36" y="100">Flat white</text><text x="230" y="100">3.5</text><text x="36" y="134">Cold brew</text><text x="230" y="134">4.0</text><text x="36" y="168">Matcha latte</text><text x="230" y="168">4.5</text><text x="36" y="202">Croissant</text><text x="230" y="202">3.0</text></g></g>
<g transform="translate(980 40)"><line x1="0" y1="0" x2="0" y2="90" stroke="#3A2A20" stroke-width="3"/>
<g class="lamp" transform="translate(0 0)"><line x1="0" y1="0" x2="0" y2="90" stroke="#3A2A20" stroke-width="3"/><path d="M-40 130 Q0 70 40 130 Z" fill="#2F4F45"/><ellipse class="glow" cx="0" cy="140" rx="60" ry="22" fill="#FFE2A0" opacity=".85"/></g></g>
<g transform="translate(560 40)"><g class="lamp b"><line x1="0" y1="0" x2="0" y2="120" stroke="#3A2A20" stroke-width="3"/><path d="M-34 156 Q0 104 34 156 Z" fill="#B5542F"/><ellipse class="glow" cx="0" cy="164" rx="50" ry="18" fill="#FFE2A0" opacity=".85"/></g></g>
<rect y="560" width="1200" height="240" fill="#8A5A3C"/><rect y="540" width="1200" height="34" fill="#6E452E"/>
<g transform="translate(800 400)"><rect width="200" height="140" rx="10" fill="#B8BEC4"/><rect x="20" y="20" width="160" height="40" rx="6" fill="#7E868E"/>
<circle cx="60" cy="40" r="10" fill="#2F2F33"/><circle cx="140" cy="40" r="10" fill="#2F2F33"/><rect x="70" y="80" width="60" height="20" fill="#2F2F33"/></g>
<g transform="translate(250 470)"><path d="M0 0 h70 v50 a20 20 0 0 1 -20 20 h-30 a20 20 0 0 1 -20 -20z" fill="#F7F1E8"/><path d="M70 12 a14 14 0 0 1 0 28" fill="none" stroke="#F7F1E8" stroke-width="8"/><ellipse cx="35" cy="4" rx="32" ry="6" fill="#6B3E25"/>
<g class="steam" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M20 -10 q-10 -15 0 -30 q10 -15 0 -30"/><path d="M36 -10 q-10 -15 0 -30 q10 -15 0 -30"/><path d="M52 -10 q-10 -15 0 -30 q10 -15 0 -30"/></g></g>
<g transform="translate(460 480)"><path d="M0 0 h56 v40 a16 16 0 0 1 -16 16 h-24 a16 16 0 0 1 -16 -16z" fill="#2F6E8F"/><ellipse cx="28" cy="3" rx="26" ry="5" fill="#6B3E25"/>
<g class="steam" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M18 -8 q-8 -12 0 -24 q8 -12 0 -24"/><path d="M34 -8 q-8 -12 0 -24 q8 -12 0 -24"/></g></g>
<g transform="translate(1080 420)"><rect x="-26" y="80" width="52" height="40" rx="6" fill="#C1693F"/><path d="M0 80 C-40 40 -30 0 0 -10 C30 0 40 40 0 80Z" fill="#3F7D4E"/><path d="M0 80 C-60 60 -70 20 -50 10 C-20 20 -10 50 0 80Z" fill="#4E9A60"/></g>
</svg>`;

const cozy = `<svg class="sc-cozy" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<style>
.sc-cozy .star{animation:cz-twinkle 3s ease-in-out infinite}
.sc-cozy .star:nth-of-type(3n){animation-delay:-1s}.sc-cozy .star:nth-of-type(3n+1){animation-delay:-2s}
.sc-cozy .halo{animation:cz-glow 4s ease-in-out infinite}
.sc-cozy .bulb{animation:cz-twinkle 2.4s ease-in-out infinite}.sc-cozy .bulb:nth-child(2n){animation-delay:-1.2s}
.sc-cozy .tail{transform-origin:0 0;animation:cz-tail 3s ease-in-out infinite}
.sc-cozy .breath{transform-origin:50% 100%;animation:cz-breath 4s ease-in-out infinite}
@keyframes cz-twinkle{50%{opacity:.25}}
@keyframes cz-glow{50%{opacity:.6;transform:scale(.97)}}
@keyframes cz-tail{0%,100%{transform:rotate(0)}50%{transform:rotate(14deg)}}
@keyframes cz-breath{50%{transform:scaleY(1.04)}}
${motionOff("sc-cozy")}
</style>
<rect width="1200" height="800" fill="#3A3150"/>
<rect y="600" width="1200" height="200" fill="#5A4636"/>
<g transform="translate(120 110)"><rect width="360" height="330" rx="12" fill="#18203F"/>
<circle cx="270" cy="80" r="34" fill="#F4EBC8"/><circle cx="285" cy="70" r="30" fill="#18203F"/>
<g fill="#fff"><circle class="star" cx="60" cy="60" r="3"/><circle class="star" cx="120" cy="40" r="2"/><circle class="star" cx="170" cy="100" r="2.5"/><circle class="star" cx="80" cy="150" r="2"/><circle class="star" cx="210" cy="160" r="3"/><circle class="star" cx="320" cy="190" r="2"/><circle class="star" cx="40" cy="230" r="2.5"/><circle class="star" cx="150" cy="250" r="2"/><circle class="star" cx="290" cy="270" r="2.5"/></g>
<rect width="360" height="330" rx="12" fill="none" stroke="#E9DCC7" stroke-width="14"/><line x1="180" y1="0" x2="180" y2="330" stroke="#E9DCC7" stroke-width="10"/><line x1="0" y1="165" x2="360" y2="165" stroke="#E9DCC7" stroke-width="10"/>
<path d="M-20 -10 Q30 140 -10 360 L-30 360 L-30 -10Z" fill="#B5564A"/><path d="M380 -10 Q330 140 370 360 L390 360 L390 -10Z" fill="#B5564A"/></g>
<path d="M0 60 Q300 120 600 60 T1200 60" fill="none" stroke="#2A2438" stroke-width="2"/>
<g><circle class="bulb" cx="80" cy="76" r="7" fill="#FFD27A"/><circle class="bulb" cx="200" cy="92" r="7" fill="#FF9D7A"/><circle class="bulb" cx="320" cy="100" r="7" fill="#FFD27A"/><circle class="bulb" cx="440" cy="92" r="7" fill="#A8E0FF"/><circle class="bulb" cx="560" cy="66" r="7" fill="#FFD27A"/><circle class="bulb" cx="680" cy="48" r="7" fill="#FF9D7A"/><circle class="bulb" cx="800" cy="44" r="7" fill="#FFD27A"/><circle class="bulb" cx="920" cy="56" r="7" fill="#A8E0FF"/><circle class="bulb" cx="1040" cy="72" r="7" fill="#FFD27A"/><circle class="bulb" cx="1160" cy="70" r="7" fill="#FF9D7A"/></g>
<g transform="translate(760 140)"><rect width="300" height="460" fill="#6D4C3D"/>
<g><rect x="16" y="20" width="268" height="12" fill="#523629"/><rect x="16" y="140" width="268" height="12" fill="#523629"/><rect x="16" y="260" width="268" height="12" fill="#523629"/><rect x="16" y="380" width="268" height="12" fill="#523629"/></g>
<g><rect x="24" y="40" width="22" height="100" fill="#D96C4E"/><rect x="48" y="52" width="18" height="88" fill="#4E7FD9"/><rect x="68" y="44" width="26" height="96" fill="#E8C35A"/><rect x="96" y="60" width="16" height="80" fill="#5DA27A"/><rect x="150" y="70" width="60" height="70" rx="30" fill="#7AA5A0"/>
<rect x="24" y="168" width="30" height="92" fill="#9A6FD0"/><rect x="56" y="180" width="20" height="80" fill="#E8C35A"/><rect x="78" y="172" width="24" height="88" fill="#D96C4E"/><rect x="190" y="190" width="70" height="70" fill="#C9B79C"/>
<rect x="30" y="290" width="26" height="90" fill="#4E7FD9"/><rect x="58" y="300" width="22" height="80" fill="#5DA27A"/><rect x="200" y="300" width="40" height="80" rx="6" fill="#B5564A"/></g></g>
<g transform="translate(620 300)"><line x1="0" y1="0" x2="0" y2="300" stroke="#2A2230" stroke-width="8"/><ellipse cx="0" cy="300" rx="40" ry="10" fill="#2A2230"/>
<ellipse class="halo" cx="0" cy="10" rx="150" ry="120" fill="#FFD9A0" opacity=".35"/><path d="M-60 30 L60 30 L36 -40 L-36 -40Z" fill="#F2C38B"/></g>
<g transform="translate(160 460)"><rect x="0" y="40" width="340" height="140" rx="40" fill="#8E5C7E"/><rect x="20" y="0" width="300" height="110" rx="40" fill="#A86F95"/><rect x="-20" y="60" width="70" height="120" rx="30" fill="#8E5C7E"/><rect x="290" y="60" width="70" height="120" rx="30" fill="#8E5C7E"/>
<g transform="translate(180 30)"><g class="breath"><ellipse cx="0" cy="20" rx="70" ry="34" fill="#E09A5A"/><circle cx="-60" cy="4" r="26" fill="#E09A5A"/><path d="M-80 -16 l8 -20 l10 16Z M-52 -18 l10 -18 l6 20Z" fill="#E09A5A"/><path d="M-70 4 q6 4 12 0 M-54 4 q6 4 12 0" stroke="#5A3A24" stroke-width="2" fill="none"/></g>
<g transform="translate(66 30)"><path class="tail" d="M0 0 C40 0 60 -30 50 -60" stroke="#E09A5A" stroke-width="14" fill="none" stroke-linecap="round"/></g></g></g>
<ellipse cx="420" cy="720" rx="360" ry="50" fill="#7A5F8A" opacity=".7"/>
</svg>`;

const library = `<svg class="sc-library" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<style>
.sc-library .mote{animation:lb-float 9s ease-in-out infinite}
.sc-library .mote:nth-child(2n){animation-duration:12s;animation-delay:-4s}.sc-library .mote:nth-child(3n){animation-duration:15s;animation-delay:-8s}
.sc-library .rays{animation:lb-rays 8s ease-in-out infinite}
.sc-library .halo{animation:lb-rays 5s ease-in-out infinite}
@keyframes lb-float{0%{transform:translate(0,0);opacity:0}20%{opacity:.9}100%{transform:translate(60px,-120px);opacity:0}}
@keyframes lb-rays{50%{opacity:.35}}
${motionOff("sc-library")}
</style>
<rect width="1200" height="800" fill="#3E2F28"/>
<rect y="640" width="1200" height="160" fill="#6B4A36"/>
<g id="lb-shelf">${[0,1,2,3].map(r=>`<rect x="0" y="${r*150+40}" width="1200" height="14" fill="#2B1F1A"/>`).join("")}</g>
${[0,1,2,3].map(r=>{let x=10,out="";const cols=["#B5564A","#4E7FD9","#E8C35A","#5DA27A","#9A6FD0","#D98C4E","#C9B79C","#7AA5A0"];let i=r*3;while(x<1190){const w=18+((i*7)%22),h=90+((i*13)%40);out+=`<rect x="${x}" y="${r*150+40-h}" width="${w}" height="${h}" fill="${cols[i%cols.length]!}"/>`;x+=w+3+((i*5)%9===0?40:0);i++;}return out;}).join("")}
<g transform="translate(420 70)"><path d="M0 520 V160 A180 160 0 0 1 360 160 V520Z" fill="#CFE4F0"/><path d="M0 520 V160 A180 160 0 0 1 360 160 V520Z" fill="none" stroke="#2B1F1A" stroke-width="16"/>
<line x1="180" y1="0" x2="180" y2="520" stroke="#2B1F1A" stroke-width="10"/><line x1="0" y1="300" x2="360" y2="300" stroke="#2B1F1A" stroke-width="10"/>
<g class="rays" opacity=".55"><path d="M60 520 L-40 800 L120 800Z" fill="#FFF3C9"/><path d="M200 520 L160 800 L320 800Z" fill="#FFF3C9"/><path d="M320 520 L380 800 L520 800Z" fill="#FFF3C9"/></g></g>
<g fill="#FFF3C9">${Array.from({length:16},(_,i)=>`<circle class="mote" cx="${470+((i*53)%300)}" cy="${520+((i*37)%220)}" r="${1.5+(i%3)}"/>`).join("")}</g>
<g transform="translate(160 560)"><rect width="340" height="22" fill="#4A3226"/><rect x="20" y="22" width="16" height="120" fill="#4A3226"/><rect x="304" y="22" width="16" height="120" fill="#4A3226"/>
<g transform="translate(250 -10)"><line x1="0" y1="0" x2="20" y2="-80" stroke="#2B2B2B" stroke-width="6"/><path d="M0 -110 L60 -96 L44 -60Z" fill="#2F6B4F"/><ellipse class="halo" cx="40" cy="-30" rx="90" ry="40" fill="#FFE2A0" opacity=".5"/></g>
<rect x="60" y="-24" width="110" height="24" rx="3" fill="#F2E8D6"/><line x1="115" y1="-24" x2="115" y2="0" stroke="#C9B79C" stroke-width="2"/></g>
<g transform="translate(940 160)"><line x1="0" y1="0" x2="-60" y2="480" stroke="#8A5A3C" stroke-width="10"/><line x1="60" y1="0" x2="0" y2="480" stroke="#8A5A3C" stroke-width="10"/>${[1,2,3,4,5,6].map(i=>`<line x1="${-i*10}" y1="${i*70}" x2="${60-i*10}" y2="${i*70}" stroke="#8A5A3C" stroke-width="8"/>`).join("")}</g>
</svg>`;

const rainy = `<svg class="sc-rainy" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<style>
.sc-rainy .drop{animation:rn-fall 1s linear infinite}
.sc-rainy .slide{animation:rn-slide 7s ease-in infinite}
.sc-rainy .steam path{animation:rn-steam 4s ease-in-out infinite;opacity:0}.sc-rainy .steam path:nth-child(2){animation-delay:-2s}
.sc-rainy .blink{animation:rn-blink 5s ease-in-out infinite}
@keyframes rn-fall{from{transform:translate(0,-120px)}to{transform:translate(-30px,900px)}}
@keyframes rn-slide{0%{transform:translateY(0);opacity:0}10%{opacity:.8}100%{transform:translateY(420px);opacity:0}}
@keyframes rn-steam{0%{opacity:0;transform:translateY(8px)}30%{opacity:.7}100%{opacity:0;transform:translateY(-36px)}}
@keyframes rn-blink{50%{opacity:.4}}
${motionOff("sc-rainy")}
</style>
<rect width="1200" height="800" fill="#4B5868"/>
<rect x="60" y="40" width="1080" height="600" fill="#6F8296"/>
<g opacity=".55"><rect x="120" y="300" width="120" height="340" fill="#4A5A6C"/><rect x="260" y="220" width="160" height="420" fill="#3F4E5F"/><rect x="460" y="330" width="110" height="310" fill="#4A5A6C"/><rect x="600" y="180" width="180" height="460" fill="#3A4757"/><rect x="820" y="280" width="140" height="360" fill="#4A5A6C"/><rect x="990" y="240" width="120" height="400" fill="#3F4E5F"/>
<g fill="#FFD98A">${Array.from({length:22},(_,i)=>`<rect class="blink" style="animation-delay:-${(i*0.7)%5}s" x="${140+((i*97)%940)}" y="${260+((i*61)%320)}" width="12" height="16"/>`).join("")}</g></g>
<g stroke="#DDE7F2" stroke-width="2" stroke-linecap="round" opacity=".55">${Array.from({length:60},(_,i)=>`<line class="drop" style="animation-delay:-${((i*37)%100)/100}s;animation-duration:${0.8+((i*13)%5)/10}s" x1="${70+((i*53)%1080)}" y1="0" x2="${64+((i*53)%1080)}" y2="26"/>`).join("")}</g>
<g fill="#E6EEF6" opacity=".7">${Array.from({length:12},(_,i)=>`<ellipse class="slide" style="animation-delay:-${(i*0.9)%7}s" cx="${110+((i*89)%1000)}" cy="${80+((i*43)%160)}" rx="5" ry="8"/>`).join("")}</g>
<rect x="60" y="40" width="1080" height="600" fill="none" stroke="#EDE6DA" stroke-width="22"/><line x1="600" y1="40" x2="600" y2="640" stroke="#EDE6DA" stroke-width="14"/><line x1="60" y1="340" x2="1140" y2="340" stroke="#EDE6DA" stroke-width="12"/>
<rect x="20" y="636" width="1160" height="40" fill="#D9CFBF"/><rect y="676" width="1200" height="124" fill="#3B3F48"/>
<g transform="translate(220 560)"><rect x="-34" y="40" width="68" height="44" rx="8" fill="#B7653E"/><path d="M0 40 C-30 0 -26 -40 0 -50 C26 -40 30 0 0 40Z" fill="#4E8A5E"/><path d="M0 40 C-56 24 -66 -10 -46 -20 C-20 -10 -10 16 0 40Z" fill="#5FA571"/><path d="M0 40 C56 24 66 -10 46 -20 C20 -10 10 16 0 40Z" fill="#5FA571"/></g>
<g transform="translate(900 586)"><path d="M0 0 h64 v40 a18 18 0 0 1 -18 18 h-28 a18 18 0 0 1 -18 -18z" fill="#E7B34B"/><path d="M64 10 a12 12 0 0 1 0 24" fill="none" stroke="#E7B34B" stroke-width="7"/><ellipse cx="32" cy="3" rx="30" ry="5" fill="#6B3E25"/>
<g class="steam" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M22 -10 q-10 -14 0 -28 q10 -14 0 -28"/><path d="M42 -10 q-10 -14 0 -28 q10 -14 0 -28"/></g></g>
</svg>`;

const city = `<svg class="sc-city" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<style>
.sc-city .win{animation:ct-blink 6s steps(1) infinite}
.sc-city .shoot{animation:ct-shoot 9s ease-in infinite}
.sc-city .star{animation:ct-tw 3s ease-in-out infinite}.sc-city .star:nth-of-type(2n){animation-delay:-1.5s}
.sc-city .screen{animation:ct-screen 4s ease-in-out infinite}
@keyframes ct-blink{0%,100%{opacity:1}40%{opacity:.15}70%{opacity:1}}
@keyframes ct-shoot{0%,85%{transform:translate(0,0);opacity:0}88%{opacity:1}100%{transform:translate(-320px,160px);opacity:0}}
@keyframes ct-tw{50%{opacity:.3}}
@keyframes ct-screen{50%{opacity:.75}}
${motionOff("sc-city")}
</style>
<defs><linearGradient id="ct-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E1433"/><stop offset="1" stop-color="#3B2F63"/></linearGradient></defs>
<rect width="1200" height="800" fill="url(#ct-sky)"/>
<g fill="#fff">${Array.from({length:30},(_,i)=>`<circle class="star" cx="${(i*131)%1200}" cy="${(i*47)%300}" r="${1+(i%3)*0.6}"/>`).join("")}</g>
<path d="M992 76 A56 56 0 1 0 1036 160 A44 44 0 1 1 992 76Z" fill="#F4EBC8"/>
<g class="shoot"><line x1="900" y1="60" x2="960" y2="40" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>
<g fill="#1A1A33">${([[0,380,120],[120,300,90],[210,420,140],[350,260,110],[460,340,130],[590,220,100],[690,360,150],[840,280,120],[960,400,110],[1070,320,130]] as [number, number, number][]).map(([x,y,w])=>`<rect x="${x}" y="${y}" width="${w}" height="${800-y}"/>`).join("")}</g>
<g fill="#FFD27A">${Array.from({length:70},(_,i)=>{const x=10+((i*83)%1180),y=300+((i*29)%300);return `<rect class="win" style="animation-delay:-${(i*1.7)%6}s;animation-duration:${5+(i%5)}s" x="${x}" y="${y}" width="10" height="14" opacity="${(i%4)?1:.4}"/>`;}).join("")}</g>
<rect y="600" width="1200" height="200" fill="#2A2238"/><rect y="590" width="1200" height="20" fill="#3A3050"/>
<g transform="translate(470 470)"><rect x="0" y="100" width="260" height="14" rx="4" fill="#9AA3B5"/><rect x="20" y="0" width="220" height="104" rx="8" fill="#9AA3B5"/><rect class="screen" x="30" y="10" width="200" height="84" rx="4" fill="#8FB4FF" opacity=".95"/>
<g fill="#E9F0FF" opacity=".9"><rect x="44" y="24" width="110" height="8" rx="4"/><rect x="44" y="40" width="160" height="8" rx="4"/><rect x="44" y="56" width="90" height="8" rx="4"/></g></g>
<g transform="translate(820 540)"><path d="M0 0 h50 v34 a14 14 0 0 1 -14 14 h-22 a14 14 0 0 1 -14 -14z" fill="#E86A6A"/><path d="M50 8 a10 10 0 0 1 0 20" fill="none" stroke="#E86A6A" stroke-width="6"/></g>
<g transform="translate(240 520)"><rect x="-26" y="40" width="52" height="40" rx="6" fill="#6C5B9E"/><path d="M0 40 C-40 10 -30 -30 0 -36 C30 -30 40 10 0 40Z" fill="#3F7D4E"/></g>
</svg>`;

export interface Theme { id: string; name: string; svg: string; tint: string }
export const THEMES: Theme[] = [
  { id: "coffee", name: "Coffee shop", svg: coffee, tint: "#E8D5BE" },
  { id: "cozy", name: "Cozy room", svg: cozy, tint: "#3A3150" },
  { id: "library", name: "Library", svg: library, tint: "#3E2F28" },
  { id: "rainy", name: "Rainy window", svg: rainy, tint: "#4B5868" },
  { id: "city", name: "Night city", svg: city, tint: "#1A1A33" },
  { id: "plain", name: "Plain", svg: "", tint: "" },
];
export const themeById = (id: string): Theme => THEMES.find(t => t.id === id) ?? THEMES[0]!;

/* ---------------------------------------------------------------- stickers */
// Die-cut look: a thick white outline under every shape.
const cut = (shapes: string) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g stroke="#fff" stroke-width="7" stroke-linejoin="round" fill="#fff">${shapes}</g><g>${shapes}</g></svg>`;
export interface StickerArt { id: string; name: string; svg: string }
export const STICKERS: StickerArt[] = [
  { id: "idea", name: "Insight", svg: cut(`<circle cx="32" cy="26" r="16" fill="#FFD23F"/><rect x="24" y="40" width="16" height="12" rx="3" fill="#8A93A6"/><path d="M26 26 l6 6 l6 -6" stroke="#B88A00" stroke-width="3" fill="none"/>`) },
  { id: "star", name: "Proud", svg: cut(`<path d="M32 6 l7.6 16.4 17.9 2 -13.3 12.2 3.7 17.6 -15.9 -9 -15.9 9 3.7 -17.6 -13.3 -12.2 17.9 -2z" fill="#FFB627"/>`) },
  { id: "rocket", name: "Shipped", svg: cut(`<path d="M32 6 C44 14 46 32 40 44 H24 C18 32 20 14 32 6Z" fill="#E9EEF6"/><circle cx="32" cy="24" r="6" fill="#4F6BED"/><path d="M24 44 l-8 8 l2 -14Z M40 44 l8 8 l-2 -14Z" fill="#E4572E"/><path d="M28 46 h8 l-4 12Z" fill="#FFB627"/>`) },
  { id: "gotcha", name: "Gotcha", svg: cut(`<path d="M32 8 L58 54 H6Z" fill="#FF9F1C"/><rect x="29" y="24" width="6" height="16" rx="3" fill="#3A2A10"/><circle cx="32" cy="46" r="3.5" fill="#3A2A10"/>`) },
  { id: "heart", name: "Loved it", svg: cut(`<path d="M32 54 C10 40 6 26 12 18 C18 10 28 12 32 20 C36 12 46 10 52 18 C58 26 54 40 32 54Z" fill="#F25F8A"/>`) },
  { id: "puzzle", name: "Tricky", svg: cut(`<path d="M10 22 h12 a6 6 0 1 1 12 0 h12 v12 a6 6 0 1 0 0 12 v10 H10Z" fill="#7B61FF"/>`) },
  { id: "check", name: "Confirmed", svg: cut(`<circle cx="32" cy="32" r="24" fill="#2BB673"/><path d="M20 33 l8 8 l16 -18" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`) },
  { id: "revisit", name: "Revisit later", svg: cut(`<path d="M14 22 h32 v18 a14 14 0 0 1 -14 14 h-4 a14 14 0 0 1 -14 -14z" fill="#B07D52"/><path d="M46 28 a8 8 0 0 1 0 16" stroke="#B07D52" stroke-width="5" fill="none"/><path d="M24 8 q-4 5 0 10 M34 8 q-4 5 0 10" stroke="#8A93A6" stroke-width="3" fill="none" stroke-linecap="round"/>`) },
];
export const stickerById = (id: string) => STICKERS.find(s => s.id === id);

/* ----------------------------------------------------------------- folders */
export const GROUP_COLORS: Record<string, string> = { Frontend: "#4F6BED", Backend: "#2BA36F", Workflow: "#E39A2D" };
/** A folder illustration; up to three sticker ids are stuck on the cover. */
export function folderSvg(color: string, stickerIds: readonly string[] = []): string {
  const spots: [number, number, number][] = [[18, 58, -12], [70, 64, 9], [118, 54, -5]];
  const stuck = stickerIds.slice(0, 3).map((id, i) => {
    const s = stickerById(id); if (!s) return "";
    const [x, y, r] = spots[i]!;
    return `<g transform="translate(${x} ${y}) rotate(${r} 18 18)"><svg width="36" height="36" viewBox="0 0 64 64">${s.svg.replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg></g>`;
  }).join("");
  return `<svg viewBox="0 0 170 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<path d="M8 22 a8 8 0 0 1 8 -8 h44 l12 12 h82 a8 8 0 0 1 8 8 v80 a8 8 0 0 1 -8 8 H16 a8 8 0 0 1 -8 -8Z" fill="${color}" opacity=".75"/>
<rect x="18" y="20" width="120" height="70" rx="3" fill="#FFFDF7" transform="rotate(-4 78 55)"/>
<rect x="26" y="26" width="120" height="70" rx="3" fill="#FFFFFF" transform="rotate(3 86 61)"/>
<path d="M8 44 a8 8 0 0 1 8 -8 h138 a8 8 0 0 1 8 8 v70 a8 8 0 0 1 -8 8 H16 a8 8 0 0 1 -8 -8Z" fill="${color}"/>
<path d="M8 44 a8 8 0 0 1 8 -8 h138 a8 8 0 0 1 8 8 v6 H8Z" fill="#fff" opacity=".18"/>
${stuck}</svg>`;
}
