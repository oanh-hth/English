
(function(){
'use strict';

/* ---------- constants ---------- */
const CURRENCY = 'VND';
const LOCALE = 'vi-VN';
const KEY = 'phongtrudo.v1';
const CATS = [
  {id:'produce',     name:'Rau củ quả',  color:'#ff5a47', kw:/banana|apple|spinach|lettuce|tomato(?!.*can)|fruit|veg|berry|berries|carrot|onion|potato|salad|orange\b/i},
  {id:'dairy',       name:'Sữa & trứng',   color:'#3d9bff', kw:/milk|cheese|yogh?urt|butter|egg|cream(?!.*hand)/i},
  {id:'drinks',      name:'Đồ uống',         color:'#ff9a1f', kw:/juice|water|soda|cola|beer|wine|tea\b|coffee|drink/i},
  {id:'pantry',      name:'Đồ khô',         color:'#bd8c4a', kw:/pasta|rice|bread|flour|sugar|oil|sauce|cereal|noodle|snack|canned|beans/i},
  {id:'meds',        name:'Thuốc',       color:'#1fbf8a', kw:/vitamin|ibuprofen|paracetamol|tablet|medicine|syrup|pill|supplement/i},
  {id:'care',        name:'Chăm sóc cá nhân',  color:'#c76bf0', kw:/shampoo|soap|lotion|hand cream|toothpaste|deodorant|conditioner|sunscreen/i},
  {id:'cleaning',    name:'Đồ vệ sinh',       color:'#19c3e0', kw:/detergent|cleaner|spray|bleach|sponge|dish|laundry/i},
  {id:'electronics', name:'Đồ điện tử',    color:'#6f86ad', kw:/cable|batter|earbud|charger|mouse|usb|phone|lamp|speaker/i},
  {id:'baby',        name:'Đồ cho bé',           color:'#ff6f9f', kw:/b[ỉi]m|\btã\b|diaper|sữa bột|em bé|baby|trẻ em|khăn ướt/i},
  {id:'clothes',     name:'Quần áo',        color:'#5b6ee1', kw:/(^|[^\p{L}])(áo|quần|váy|đầm|giày|dép|tất|vớ|nón|mũ|găng tay|khẩu trang)([^\p{L}]|$)|\b(t-?shirts?|shirts?|dress|jeans|shoes?|sneakers?|jacket|hoodie|socks?|pants)\b/iu},
  {id:'gift',        name:'Mua tặng',       color:'#f2b705', kw:/$^/},
  {id:'other',       name:'Khác',          color:'#c4925f', kw:/$^/}
];
const CAT = Object.fromEntries(CATS.map(c => [c.id, c]));
const GUESS_ORDER = ['baby','clothes','care','cleaning','meds','electronics','drinks','dairy','produce','pantry'];
const VN = {
  care:/sữa tắm|dầu gội|dầu xả|kem đánh răng|xà phòng|sữa rửa mặt|kem dưỡng/i,
  cleaning:/nước rửa|nước lau|nước giặt|tẩy|xịt/i,
  meds:/thuốc|vitamin|viên|siro/i,
  electronics:/cáp|sạc|\bpin\b|chuột|tai nghe|loa/i,
  drinks:/nước ngọt|nước suối|bia|trà|phê|nước ép|sinh tố|matcha/i,
  dairy:/sữa|trứng|phô mai|bơ\b|sữa chua/i,
  produce:/rau|trái cây|táo|chuối|cà chua|cam\b|dâu/i,
  pantry:/gạo|mì\b|dầu ăn|bánh|nước mắm|đường|bột/i
};

/* ---------- helpers ---------- */
const $ = (s, r=document) => r.querySelector(s);
const pad = n => String(n).padStart(2,'0');
const iso = d => d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parseISO = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d); };
const today = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
const addDays = (d,n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const clamp = (v,a,b) => Math.min(b, Math.max(a, v));
const money = n => new Intl.NumberFormat(LOCALE,{style:'currency',currency:CURRENCY,maximumFractionDigits:0}).format(Math.round(n));
const money0 = n => n===0 ? '0' : n>=1e6 ? (n/1e6).toFixed(n%1e6?1:0).replace('.',',')+' tr' : Math.round(n/1000)+'k';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Math.random().toString(36).slice(2,9);
const shortDate = s => parseISO(s).toLocaleDateString('vi-VN',{day:'numeric',month:'short'});
const monthName = d => d.toLocaleDateString('vi-VN',{month:'short'});
const icon = (cat, cls='') => '<svg class="'+cls+'" viewBox="0 0 48 48" aria-hidden="true"><use href="#s-'+cat+'"/></svg>';

/* ---------- state ---------- */
function seed(){
  const t = today();
  const S = [
    ['Sữa tươi 1L','dairy',-2,1,2.4,1,22,62],
    ['Sữa chua Hy Lạp','dairy',-3,2,3.2,1,31,80],
    ['Dâu tây','produce',-1,2,4.5,1,62,74],
    ['Rau bina','produce',-4,-1,2.1,1,48,60],
    ['Nước cam','drinks',-5,9,3.8,1,75,62],
    ['Nước có ga','drinks',-6,120,5.4,6,85,82],
    ['Mì Ý','pantry',-6,240,2.0,2,72,16],
    ['Cà chua đóng hộp','pantry',-20,400,5.4,3,80,16],
    ['Ibuprofen','meds',-22,45,6.5,1,88,16],
    ['Vitamin C','meds',-41,5,9.9,1,14,87],
    ['Dầu gội','care',-25,180,7.2,1,11,53],
    ['Kem dưỡng tay','care',-12,20,5.5,1,38,91],
    ['Xịt rửa chén','cleaning',-35,null,4.2,1,93,56],
    ['Cáp USB-C','electronics',-28,null,12,1,54,88],
    ['Trứng gà','dairy',-8,6,4.1,1,41,67],
    ['Chuột không dây','electronics',-1,null,24,1,58,52],
    ['Gạo 5kg','pantry',-36,null,11.9,1,18,70],
    ['Dầu ô liu','pantry',-34,300,8.5,1,26,52,true],
    ['Nước giặt','cleaning',-33,null,12.4,1,66,90],
    ['Ngũ cốc ăn sáng','pantry',-31,60,4.3,1,0,0,true],
    ['Bỉm tã quần đêm','baby',-3,null,517600,1,46,74],
    ['Bỉm tã Bobby size L','baby',-33,null,18,1,30,50],
    ['Sữa tươi tiệt trùng 1L','dairy',-38,-10,2.2,1,60,60],
    ['Trà đào cam sả','drinks',0,null,1.8,1,67,70],
    ['Cà phê sữa','drinks',-1,null,1.2,1,80,72],
    ['Trà sữa trân châu','drinks',-2,null,2,1,88,64],
    ['Nước ép ổi','drinks',-3,null,1.6,1,92,76],
    ['Nước dừa','drinks',-4,null,1.4,1,78,92],
    ['Áo thun cotton','clothes',-100,null,16,1,24,76],
    ['Áo khoác mỏng','clothes',-60,null,32,1,70,84],
    ['Quà sinh nhật cho mẹ','gift',-45,null,20,1,50,92]
  ];
  return S.map(r => ({id:uid(), name:r[0], cat:r[1], bought:iso(addDays(t,r[2])), exp:r[3]===null?'':iso(addDays(t,r[3])), price:r[4]<1000?Math.round(r[4]*25000/1000)*1000:r[4], qty:r[5], x:r[6], y:r[7], used:!!r[8]}));
}
function load(){ try{ const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; }catch(e){ return null; } }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){} }
let state = load();
if(!state || !Array.isArray(state.items)) state = {items:[], win:3};
let sel = null, filter = null, justAdded = null, found = null;
const byId = id => state.items.find(i => i.id === id);

function daysLeft(it){ return it.exp ? Math.round((parseISO(it.exp) - today())/864e5) : null; }
function status(it){
  const d = daysLeft(it);
  if(d === null) return 'none';
  if(d < 0) return 'expired';
  if(d <= state.win) return 'soon';
  return 'ok';
}
/* ---------- rebuy rule: buying the same thing again means last month's one is finished ---------- */
const REBUY_CATS = new Set(['baby','care','cleaning']);   // one-at-a-time things: a new diaper pack replaces the old one, whatever the brand
const monthKey = d => String(d).slice(0,7);
const unaccent = x => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
const NAME_STOP = new Set(['combo','tang','tui','mini','size','goi','mieng','hop','chai','lon','thung','set','pack']);
function nameTokens(name){
  return new Set(unaccent(name).replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(t => t.length > 1 && !/\d/.test(t) && !NAME_STOP.has(t)));
}
function sameProduct(a, b){
  const ta = nameTokens(a.name), tb = nameTokens(b.name);
  if(!ta.size || !tb.size) return unaccent(a.name).trim() === unaccent(b.name).trim();
  let inter = 0; ta.forEach(t => { if(tb.has(t)) inter++; });
  const small = Math.min(ta.size, tb.size), union = ta.size + tb.size - inter;
  if(small === 1) return ta.size === tb.size && inter === 1;
  return inter === small || inter/union >= 0.6;
}
const isRebuy = (older, newer) => older.id !== newer.id && !older.used && older.cat !== 'gift' && newer.cat !== 'gift' && monthKey(older.bought) < monthKey(newer.bought) &&
  (sameProduct(older, newer) || (older.cat === newer.cat && REBUY_CATS.has(older.cat)));
function applyRebuy(newItems){
  if(state.autoRebuy === false) return [];
  const hit = [];
  newItems.filter(b => !b.used).forEach(b => {
    state.items.forEach(a => { if(isRebuy(a, b)){ a.used = true; a.replacedBy = b.id; hit.push({a, b}); } });
  });
  return hit;
}
function announceRebuy(hit){
  const b = hit[0].b, names = hit.map(h => h.a.name);
  toast('Bạn mua lại '+b.name+', nên '+(names.length > 2 ? names[0]+' và '+(names.length-1)+' món cũ' : names.join(', '))+' của tháng trước được tính là đã hết.',
    {label:'Hoàn tác', fn:() => { hit.forEach(h => { h.a.used = false; delete h.a.replacedBy; }); save(); renderAll(); }});
}

/* Misu reminds about things nobody has touched for a while: 30 days, 90 days for clothes, never for things bought as gifts */
const DORMANT_DAYS = 30, DORMANT_DAYS_CLOTHES = 90;
const dormantAfter = it => it.cat === 'clothes' ? DORMANT_DAYS_CLOTHES : DORMANT_DAYS;
/* Still in date? Then Misu only asks "have you used it yet?" instead of nagging; "Chưa dùng" snoozes the question for 30 days */
const inDate = it => !!it.exp && daysLeft(it) >= 0;
const snoozeActive = it => !!it.snoozed && (today() - parseISO(it.snoozed))/864e5 <= DORMANT_DAYS;
const isDormant = it => !it.used && it.cat !== 'gift' && idleDays(it) > dormantAfter(it) && !(inDate(it) && snoozeActive(it));
const needsAsk = it => isDormant(it) && inDate(it);
const idleDays = it => Math.round((today() - parseISO(it.touched || it.bought))/864e5);
const dormantList = () => state.items.filter(isDormant).sort((a,b) => idleDays(b) - idleDays(a));
function whenText(d){
  if(d < 0) return 'Đã hết hạn '+(-d)+' ngày trước';
  if(d === 0) return 'Hết hạn hôm nay';
  if(d === 1) return 'Ngày mai hết hạn';
  return 'Còn '+d+' ngày là hết hạn';
}
function attention(){
  return state.items.filter(i => !i.used && (status(i)==='expired' || status(i)==='soon'))
    .sort((a,b) => daysLeft(a)-daysLeft(b));
}

/* ---------- toast ---------- */
let toastT;
function toast(msg, act){
  const t = $('#toast'); t.textContent = msg;
  if(act){
    const b = document.createElement('button'); b.type = 'button'; b.className = 'toast-act'; b.textContent = act.label;
    b.addEventListener('click', () => { act.fn(); t.hidden = true; });
    t.append(b);
  }
  t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, act ? 8000 : 3800);
}

function trashItem(id){
  const idx = state.items.findIndex(i => i.id===id); if(idx < 0) return;
  const it = state.items[idx];
  state.items.splice(idx,1);
  if(sel === id) sel = null;
  save(); react('trash', it.name); renderAll();
  toast('Đã xoá '+it.name+', '+money(it.price)+' cũng biến khỏi phần chi tiêu.', {label:'Hoàn tác', fn:() => {
    state.items.splice(Math.min(idx, state.items.length), 0, it); sel = it.id; save(); react('undo', it.name); renderAll();
  }});
}

/* ---------- room ---------- */
const room = $('#room');
function itemLabel(it){
  const d = daysLeft(it);
  return it.name+', '+CAT[it.cat].name+(d===null?'':', '+whenText(d).toLowerCase());
}
/* ---------- the critic: Miso the cat ---------- */
let tick = 0, reaction = null, lastCounts = null;
const react = (kind, name, n, cat) => { reaction = {kind, name, n, cat}; };
function catSvg(mood){
  const fur='#f4a259', dark='#3b2a1a';
  let face='';
  if(mood==='happy') face='<path d="M24 43q5-6 10 0M46 43q5-6 10 0" stroke="'+dark+'" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M34 57q6 6 12 0" stroke="'+dark+'" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  else if(mood==='neutral') face='<circle cx="29" cy="43" r="3.2" fill="'+dark+'"/><circle cx="51" cy="43" r="3.2" fill="'+dark+'"/><path d="M36 58q4 3 8 0" stroke="'+dark+'" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  else if(mood==='judging') face='<ellipse cx="29" cy="43" rx="6" ry="5" fill="#fff"/><ellipse cx="51" cy="43" rx="6" ry="5" fill="#fff"/><circle cx="31" cy="44" r="2.6" fill="'+dark+'"/><circle cx="53" cy="44" r="2.6" fill="'+dark+'"/><rect x="22" y="37" width="14" height="6.5" fill="'+fur+'"/><rect x="44" y="37" width="14" height="6.5" fill="'+fur+'"/><path d="M22 43.500h14M44 43.500h14" stroke="'+dark+'" stroke-width="2.5" stroke-linecap="round"/><path d="M45 33l12-4" stroke="'+dark+'" stroke-width="2.5" stroke-linecap="round"/><path d="M35 58h10" stroke="'+dark+'" stroke-width="2.5" stroke-linecap="round"/>';
  else face='<circle cx="29" cy="42" r="7" fill="#fff"/><circle cx="51" cy="42" r="7" fill="#fff"/><circle cx="29" cy="43" r="2" fill="'+dark+'"/><circle cx="51" cy="43" r="2" fill="'+dark+'"/><ellipse cx="40" cy="60" rx="4" ry="5" fill="#7a2e3a"/><path d="M69 22q5 8 0 12q-5-4 0-12z" fill="#7ec8ff"/>';
  return '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M13 36L15 9l18 13z" fill="'+fur+'"/><path d="M67 36L65 9 47 22z" fill="'+fur+'"/><path d="M18 28l1-10 8 6z" fill="#f3a3b6"/><path d="M62 28l-1-10-8 6z" fill="#f3a3b6"/><ellipse cx="40" cy="45" rx="29" ry="26" fill="'+fur+'"/><path d="M40 20v8M32 21l2 7M48 21l-2 7" stroke="#d9822b" stroke-width="3" stroke-linecap="round"/><ellipse cx="40" cy="55" rx="12" ry="9" fill="#fff3e0"/>'+face+'<path d="M37 50h6l-3 4z" fill="#e0607e"/><path d="M12 50l12 2M12 57l12-2M68 50l-12 2M68 57l-12-2" stroke="#8a5a2b" stroke-width="1.4" stroke-linecap="round"/></svg>';
}
/* Miso on weekly habits: how many of the last 7 days did you buy something from the same category? 5-6 days is a nudge, 7 of 7 is a scolding */
const HABIT_MIN_DAYS = 5;
const HABIT = {
  drinks:{strong:['Bảy ngày liền ngày nào cũng mua đồ uống luôn đó. Bạn là cá hay sao mà uống dữ vậy?','{hdays}/7 ngày, ngày nào cũng có đồ uống mới. Thận bạn gọi điện cầu cứu tui rồi nè.','Đồ uống mua mỗi ngày trong tuần luôn. Uống nước lọc thử đi bạn ơi, miễn phí á.'],
          mild:['{hdays} ngày trong tuần bạn đều mua đồ uống. Nhớ uống nước lọc nữa nha.','Tuần này đồ uống về nhà gần như mỗi ngày. Bạn uống nhiều quá rồi đó nha.']},
  dairy:{strong:['Ngày nào cũng mua sữa & trứng, bạn nuôi cả đàn hả?','7/7 ngày mua sữa & trứng luôn. Tủ lạnh bạn sắp thành nông trại rồi.'],
         mild:['{hdays} ngày trong tuần mua sữa & trứng. Uống không hết là nó hư á nha.','Sữa & trứng mua đều ghê, nhưng ăn hết chưa mà mua tiếp vậy?']},
  produce:{strong:['Ngày nào cũng mua rau củ quả, tốt cho sức khoẻ thiệt. Nhưng ăn hết chưa đó, tui thấy rau héo rồi nè.','7/7 ngày mua rau củ quả. Bạn định mở sạp rau trong phòng hả?'],
           mild:['{hdays} ngày trong tuần mua rau củ quả. Chăm ghê, nhớ ăn cho hết nha.','Rau củ về đều đều, tui khen. Nhưng đừng để nó héo nha.']},
  pantry:{strong:['Đồ khô mua hết 7 ngày trong tuần luôn. Kho lương của bạn sắp thành siêu thị rồi.','Ngày nào cũng mua đồ khô, bạn chuẩn bị qua mùa đông hả?'],
          mild:['{hdays} ngày trong tuần bạn mua đồ khô. Kệ bếp thở không nổi nữa rồi.','Đồ khô mua đều quá. Bạn tích trữ hả?']},
  meds:{strong:['Ngày nào cũng mua thuốc và vitamin... Bạn khoẻ không vậy? Tui hơi lo đó.','7/7 ngày mua thuốc. Bạn nhớ đi khám nha, đừng tự mua hoài.'],
        mild:['{hdays} ngày trong tuần mua thuốc, vitamin. Bạn nhớ uống đúng liều nha.','Thuốc men mua đều ghê. Bạn có khoẻ không đó?']},
  care:{strong:['Ngày nào cũng mua đồ chăm sóc cá nhân. Bạn đẹp thêm cỡ nào nữa vậy trời?','7/7 ngày mua đồ chăm sóc cá nhân. Chai lọ trong phòng nhiều hơn cả tui rồi.'],
        mild:['{hdays} ngày trong tuần mua đồ chăm sóc cá nhân. Đẹp vừa thôi nha.','Dầu gội, kem dưỡng mua đều ghê. Dùng hết cái cũ chưa?']},
  cleaning:{strong:['Ngày nào cũng mua đồ vệ sinh. Bạn dọn nhà mỗi ngày hay mua để ngắm vậy?','7/7 ngày mua đồ vệ sinh. Nhà sạch bóng rồi, tha cho nó đi.'],
            mild:['{hdays} ngày trong tuần mua đồ vệ sinh. Chăm dọn dẹp ghê, hay mua dư rồi?','Nước giặt, nước lau mua đều quá. Dùng hết cái cũ chưa?']},
  electronics:{strong:['Ngày nào cũng mua đồ điện tử. Ví bạn kêu cứu rồi nè.','7/7 ngày mua đồ điện tử. Bạn mở cửa hàng công nghệ hả?'],
               mild:['{hdays} ngày trong tuần mua đồ điện tử. Dây cáp trong phòng sắp rối thành cuộn len rồi.','Đồ điện tử mua đều ghê. Cái cũ còn xài được không đó?']},
  baby:{strong:['Ngày nào cũng mua đồ cho bé. Bé nhà bạn xài dữ ha, hay bạn mua nhiều quá?','7/7 ngày mua đồ cho bé. Thương bé vừa thôi, thương ví bạn nữa nha.'],
        mild:['{hdays} ngày trong tuần mua đồ cho bé. Bé được cưng ghê.','Đồ cho bé mua đều. Nhớ kiểm tra còn dư bao nhiêu trước khi mua thêm nha.']},
  clothes:{strong:['Ngày nào cũng mua quần áo. Tủ đồ của bạn sắp tràn ra phòng rồi nè.','7/7 ngày mua quần áo. Bạn mặc kịp hết không đó?'],
           mild:['{hdays} ngày trong tuần mua quần áo. Tủ đồ than thở rồi đó.','Quần áo mua đều ghê. Mặc cái cũ chưa?']},
  other:{strong:['Ngày nào cũng mua đồ linh tinh. Nhóm "Khác" mà nhiều thế này thì hết là khác rồi.','7/7 ngày mua đồ nhóm Khác. Bạn mua gì mà tui không phân loại nổi vậy?'],
         mild:['{hdays} ngày trong tuần mua đồ linh tinh. Nhớ phân loại cho tui nha.','Đồ nhóm Khác mua đều ghê. Mua gì vậy bạn?']}
};
function weeklyHabit(){
  const t = today(), week = new Set(Array.from({length:7}, (_,i) => iso(addDays(t,-i)))), days = {};
  state.items.forEach(i => { if(i.cat === 'gift' || !week.has(i.bought)) return; (days[i.cat] = days[i.cat] || new Set()).add(i.bought); });
  let best = null;
  Object.keys(days).forEach(cat => { const n = days[cat].size; if(n >= HABIT_MIN_DAYS && (!best || n > best.days)) best = {cat, days:n}; });
  return best;
}
const habitLines = h => h ? HABIT[h.cat][h.days >= 7 ? 'strong' : 'mild'] : [];

function critique(){
  const t = today(), y = t.getFullYear(), m = t.getMonth(), day = t.getDate();
  const ly = m===0 ? y-1 : y, lm = m===0 ? 11 : m-1;
  const units = (yy,mm,upTo) => state.items.reduce((a,i) => { const d = parseISO(i.bought); return a + (d.getFullYear()===yy && d.getMonth()===mm && d.getDate()<=upTo ? i.qty : 0); }, 0);
  const now = units(y,m,31), prev = units(ly,lm,day);
  const inRoom = state.items.filter(i => !i.used);
  const expired = inRoom.filter(i => status(i)==='expired');
  const lost = expired.reduce((a,i) => a + i.price, 0);
  const habit = weeklyHabit();
  const F = {hdays:habit ? habit.days : 0, now, prev, day, inRoom:inRoom.length, expired:expired.length, lost:money(lost), name:expired[0] ? expired[0].name : '', ratio:prev ? String(+(now/prev).toFixed(1)) : ''};
  let tier, mood;
  if(F.expired >= 3){ tier='waste'; mood='horrified'; }
  else if(habit){ tier='habit'; mood = habit.days >= 7 ? 'horrified' : 'judging'; }
  else if(F.inRoom >= 24){ tier='hoard'; mood='horrified'; }
  else if(prev > 0 && now >= prev*1.5 && now >= 6){ tier='more'; mood='judging'; }
  else if(F.expired >= 1){ tier='expired'; mood='judging'; }
  else if(now >= 12){ tier='busy'; mood='judging'; }
  else if(now <= 3){ tier='calm'; mood='happy'; }
  else { tier='ok'; mood='neutral'; }
  const L = {
    waste:['{expired} món hết hạn rồi nè bạn ơi. Tủ đồ ăn của bạn sắp thành vườn nấm luôn đó nha.','Hết hạn mất {lost} rồi. Tui xót ví giùm bạn ghê, lần sau ăn sớm sớm nha.','{expired} món bị bỏ quên trong góc. Tụi nó buồn hiu hà, bạn ghé thăm chút đi.'],
    habit: habitLines(habit),
    hoard:['{inRoom} món trong phòng rồi nè. Tui sắp hết chỗ nằm phơi nắng luôn á.','Phòng đầy ắp {inRoom} món, bạn định mở tiệm tạp hóa hả? Cho tui làm bảo vệ nha.','{inRoom} món! Mình ăn bớt đồ cũ trước rồi hẵng mua thêm nha bạn.','Phòng chật cứng {inRoom} món rồi. Tui đi qua còn phải nín thở nữa đó.','{inRoom} món luôn á. Bạn thử dọn bớt một góc cho tui nằm đi, hứa không quậy.','Tui đếm được {inRoom} món. Mai mốt kệ cũng phải có kệ riêng cho tui nha.','Phòng đầy ú ụ {inRoom} món. Nghỉ mua vài bữa cho phòng thở với bạn ơi.'],
    more:['Mới ngày {day} mà bạn mua {now} món rồi. Tháng trước cùng kỳ có {prev} thôi à nha.','Nhanh gấp {ratio} lần tháng trước luôn. Ví bạn đang thở dốc đó, thương nó chút đi.','{now} món trong {day} ngày. Ngón tay bạn bấm thanh toán nhanh dữ ha.'],
    expired:['{name} hết hạn mất tiêu rồi. Hồi nãy nó còn chờ bạn ăn đó, tội ghê.','Ôi {name} hết hạn rồi. Tui không giận đâu, tui chỉ buồn xíu thôi à.'],
    busy:['Tháng này {now} món rồi nha. Bạn có cần hết không, hay chỉ thích mở hộp thôi?','{now} món rồi đó. Tui đếm bằng chân luôn mà vẫn còn đếm chưa hết.'],
    calm:['Tháng này mới {now} món thôi. Bạn giỏi ghê, tui thưởng một cái vuốt tai nè.','Biết kiềm chế rồi đó. Tui tự hào về bạn lắm luôn.','Chỉ {now} món thôi, ví bạn đang cười tít mắt luôn nè.','Giỏi quá trời, tháng này bạn mua có {now} món. Cho bạn một miếng pate nè.','Bạn nhịn mua được {now} món thôi luôn hả. Tui vỗ tay bằng chân nè.','Ví nhẹ nhàng, phòng gọn gàng, tui hài lòng lắm. Cứ thế nha bạn.'],
    ok:['{now} món tháng này. Vừa vừa thôi, tui vẫn đang để ý bạn nha.','Hôm nay chưa có gì để chê. Chưa thôi nha.']
  }[tier];
  const R = reaction && {
    add:['Thêm {name} nữa hả? Tháng này bạn mua {now} món rồi nha.','{name} vào phòng rồi nè. Giờ phòng có {inRoom} món, tui ngó chừng bạn đó.','Ting ting! Thêm {name}. Tháng này {now} món rồi đó bạn ơi.'],
    bulk:['Mua một lèo {n} món luôn hả? Tháng này tổng {now} món rồi đó nha.','{n} món mới toanh vào phòng. Giờ phòng có {inRoom} món, tui chen chân hông nổi.'],
    trash:['Tạm biệt {name}. Phòng còn {inRoom} món, tháng này tính còn {now} món.','Bỏ {name} rồi hả? Tui hơi tiếc, nhưng phòng thoáng hơn, còn {inRoom} món.'],
    used:['{name} dùng hết rồi, bạn giỏi ghê. Phòng còn {inRoom} món nè.','Xong {name} rồi hả? Tui ghi công cho bạn. Phòng còn {inRoom} món.'],
    rebuy:['Mua lại {name} rồi hả? Món cũ coi như hết rồi nha, tui dọn giùm bạn.','{name} mới về là {n} món cũ nghỉ hưu liền. Phòng thoáng hơn rồi nè.'],
    undo:['Hoàn tác hả? Thôi được, {name} quay về phòng. Giờ lại {inRoom} món.']
  }[reaction.kind];
  const useHabit = !!(reaction && (reaction.kind === 'add' || reaction.kind === 'bulk') && habit && [].concat(reaction.cat || []).indexOf(habit.cat) >= 0);
  if(useHabit) mood = habit.days >= 7 ? 'horrified' : 'judging';
  const pool = (useHabit ? habitLines(habit) : R) || L, G = reaction ? Object.assign({}, F, {name:reaction.name, n:reaction.n}) : F;
  const line = pool[(t.getDate() + tick) % pool.length].replace(/\{(\w+)\}/g, (_,k) => G[k]);
  return {line, mood, now, prev, inRoom:F.inRoom, habit:habit ? {name:CAT[habit.cat].name, days:habit.days} : null};
}
function renderCritic(){
  const c = critique();
  $('#critic').innerHTML = '<button class="av" type="button" id="cat-av" aria-label="Nhờ Miso chê tiếp">'+catSvg(c.mood)+'</button>'+
    '<div class="bubble" lang="vi"><div class="eyebrow">Miso, bé mèo khó tính</div><p>'+esc(c.line)+'</p><div class="meta"><span>Tháng này: <b id="m-now">'+c.now+'</b> món đã mua · <b id="m-room">'+c.inRoom+'</b> món trong phòng · cùng kỳ tháng trước '+c.prev+' món'+(c.habit ? ' · 7 ngày qua mua <b>'+esc(c.habit.name)+'</b> '+c.habit.days+'/7 ngày' : '')+'</span><button class="btn ghost sm" id="cat-more" type="button">Chê tiếp đi</button></div></div>';
  if(lastCounts){
    if(lastCounts.now !== c.now) $('#m-now').classList.add('bump');
    if(lastCounts.inRoom !== c.inRoom) $('#m-room').classList.add('bump');
  }
  lastCounts = {now:c.now, inRoom:c.inRoom};
  const again = () => { tick++; reaction = null; renderCritic(); const b = $('#cat-more'); if(b) b.focus(); };
  $('#cat-more').addEventListener('click', again); $('#cat-av').addEventListener('click', again);
}

/* ---------- Misu the puppy: reminds you about things nobody has touched for over a month ---------- */
let misuTick = 0, misuReaction = null, showAllDormant = false;
function misuSvg(mood){
  const dark = '#3b2a1a';
  let eyes, extra = '';
  if(mood === 'sleepy'){
    eyes = '<path d="M23 43q5 5 10 0M47 43q5 5 10 0" stroke="'+dark+'" stroke-width="3" fill="none" stroke-linecap="round"/>';
    extra = '<text x="60" y="20" font-size="11" font-weight="700" font-family="sans-serif" fill="#6c86ad">z</text><text x="67" y="12" font-size="8" font-weight="700" font-family="sans-serif" fill="#6c86ad">z</text>';
  }else if(mood === 'worried'){
    eyes = '<circle cx="29" cy="43" r="3.6" fill="'+dark+'"/><circle cx="51" cy="43" r="3.6" fill="'+dark+'"/><circle cx="30.200" cy="41.800" r="1.200" fill="#fff"/><circle cx="52.200" cy="41.800" r="1.200" fill="#fff"/><path d="M22 35l10 4M58 35l-10 4" stroke="'+dark+'" stroke-width="2.500" stroke-linecap="round"/>';
    extra = '<path d="M70 28q4 6 0 9q-4-3 0-9z" fill="#7ec8ff"/>';
  }else{
    eyes = '<circle cx="29" cy="43" r="3.6" fill="'+dark+'"/><circle cx="51" cy="43" r="3.6" fill="'+dark+'"/><circle cx="30.200" cy="41.800" r="1.200" fill="#fff"/><circle cx="52.200" cy="41.800" r="1.200" fill="#fff"/>';
  }
  const mouth = mood === 'worried' ? '<path d="M34 61q6-4 12 0" stroke="'+dark+'" stroke-width="2.500" fill="none" stroke-linecap="round"/>'
    : '<path d="M40 54v4q-4 4-8 1M40 58q4 4 8 1" stroke="'+dark+'" stroke-width="2.500" fill="none" stroke-linecap="round"/>'+(mood==='happy' ? '<path d="M36 61q4 9 8 0z" fill="#f08aa1"/>' : '');
  return '<svg viewBox="0 0 80 80" aria-hidden="true"><ellipse cx="13" cy="40" rx="9" ry="19" fill="#b08968" transform="rotate(14 13 40)"/><ellipse cx="67" cy="40" rx="9" ry="19" fill="#b08968" transform="rotate(-14 67 40)"/><ellipse cx="40" cy="45" rx="27" ry="25" fill="#fbf1e4"/><ellipse cx="55" cy="39" rx="9" ry="10" fill="#d9b99b"/><ellipse cx="40" cy="56" rx="11" ry="8" fill="#fff"/>'+eyes+'<ellipse cx="40" cy="51" rx="4.500" ry="3.200" fill="'+dark+'"/>'+mouth+extra+'</svg>';
}
function renderDormant(){
  const list = dormantList(), el = $('#dormant'), asks = list.filter(needsAsk), std = list.filter(i => !needsAsk(i)), top = std[0] || asks[0];
  const F = {n:std.length, name:top ? top.name : '', days:top ? idleDays(top) : 0, exp:top && top.exp ? shortDate(top.exp) : '', money:money(std.reduce((a,i) => a + i.price, 0))};
  const mood = !std.length ? 'happy' : std.length >= 5 ? 'worried' : 'sleepy';
  const POOLS = {
    none:['Hổng có món nào nằm im quá lâu hết. Misu vẫy đuôi cho bạn nè!','Đồ trong phòng được dùng đều đều ghê. Misu thích lắm luôn.'],
    some:['Misu thấy {n} món nằm im lâu rồi nè. Nhất là {name}, {days} ngày không ai ngó tới.','{name} nằm đó {days} ngày rồi. Nó chờ bạn dùng mà tủi thân lắm á.','Có {n} món đang ngủ quên, tổng cộng {money} nằm yên trong phòng. Mình dùng bớt đi bạn ơi.','Misu ngửi thấy bụi trên {name} rồi nha. {days} ngày chưa đụng tới luôn đó.'],
    many:['{n} món ngủ quên luôn rồi! Mình dọn dẹp hoặc dùng thử vài món đi bạn ơi.','Phòng có tới {n} món nằm im, tổng cộng {money}. Misu lo quá à.','Bạn ơi, {n} món chưa được đụng tới lâu rồi. Mình xử lý dần nha, bắt đầu từ {name} đi.'],
    touch:['Yay, {name} được dùng rồi! Misu vẫy đuôi nè.','Cảm ơn bạn đã ghé {name}. Nó hết tủi thân rồi đó!'],
    ask:['Misu hỏi nhỏ thôi nha: {name} còn hạn dùng tới {exp}, bạn dùng chưa vậy?','Hỏi xíu thôi: {name} vẫn còn hạn, bạn đã dùng chưa nè?','{name} còn hạn mà lâu rồi chưa thấy bạn nhắc tới. Bạn dùng chưa?'],
    snooze:['Ok, chưa dùng thì thôi. Misu hỏi lại sau nha, nhớ dùng {name} trước khi hết hạn đó.'],
    done:['{name} xong nhiệm vụ rồi. Phòng bớt một món ngủ quên, Misu vui lắm!']
  };
  const pool = misuReaction ? POOLS[misuReaction.kind] : POOLS[!list.length ? 'none' : !std.length ? 'ask' : std.length >= 5 ? 'many' : 'some'];
  const G = misuReaction ? Object.assign({}, F, {name:misuReaction.name}) : F;
  const line = pool[(today().getDate() + misuTick) % pool.length].replace(/\{(\w+)\}/g, (_,k) => G[k]);
  const rows = showAllDormant ? list : list.slice(0,5);
  el.innerHTML =
    '<div class="card-head"><h2 id="h-dormant">Nằm im lâu rồi</h2><span class="small muted">'+(list.length ? list.length+' món' : 'Chưa có món nào')+'</span></div>'+
    '<div class="critic misu"><button class="av" type="button" id="misu-av" aria-label="Nhờ Misu nhắc tiếp">'+misuSvg(mood)+'</button>'+
      '<div class="bubble" lang="vi"><div class="eyebrow">Misu, bé cún hay lo xa</div><p>'+esc(line)+'</p><div class="meta"><span>Đồ thường hơn 1 tháng, quần áo hơn 3 tháng, đồ mua tặng thì Misu không nhắc. Món còn hạn dùng thì Misu chỉ hỏi bạn đã dùng chưa.</span><button class="btn ghost sm" id="misu-more" type="button">Nhắc tiếp đi</button></div></div></div>'+
    (list.length ? '<ul class="dlist">'+rows.map(i => {
      const ask = needsAsk(i);
      const info = ask
        ? 'Còn hạn tới '+shortDate(i.exp)+' ('+daysLeft(i)+' ngày nữa) · <b class="q">Bạn dùng chưa?</b> · '+money(i.price)
        : 'Mua '+shortDate(i.bought)+(i.touched?' · dùng '+shortDate(i.touched):'')+' · nằm im <b>'+idleDays(i)+' ngày</b> · '+money(i.price);
      const btns = ask
        ? '<button class="btn ghost sm" type="button" data-touch="'+i.id+'">Dùng rồi</button><button class="btn ghost sm" type="button" data-snooze="'+i.id+'">Chưa dùng</button>'
        : '<button class="btn ghost sm" type="button" data-touch="'+i.id+'">Vừa dùng</button>';
      return '<li style="--c:'+CAT[i.cat].color+'">'+icon(i.cat)+
        '<div class="dtext"><div class="nm">'+esc(i.name)+(i.qty>1?' ×'+i.qty:'')+'</div><div class="small muted">'+info+'</div></div>'+
        '<div class="dacts">'+btns+'<button class="btn ghost sm" type="button" data-done="'+i.id+'">Dùng hết rồi</button><button class="btn ghost sm" type="button" data-dfind="'+i.id+'">Tìm</button></div></li>';
    }).join('')+'</ul>'+
      (list.length>5 ? '<button type="button" class="btn ghost sm more" id="d-more">'+(showAllDormant?'Thu gọn':'Xem hết '+list.length+' món')+'</button>' : '') : '');
  const again = () => { misuTick++; misuReaction = null; renderDormant(); const b = $('#misu-more'); if(b) b.focus(); };
  $('#misu-more').addEventListener('click', again); $('#misu-av').addEventListener('click', again);
  const more = $('#d-more'); if(more) more.addEventListener('click', () => { showAllDormant = !showAllDormant; renderDormant(); });
  el.querySelectorAll('[data-touch]').forEach(b => b.addEventListener('click', () => { const it = byId(b.dataset.touch); it.touched = iso(today()); misuReaction = {kind:'touch', name:it.name}; save(); renderAll(); }));
  el.querySelectorAll('[data-snooze]').forEach(b => b.addEventListener('click', () => { const it = byId(b.dataset.snooze); it.snoozed = iso(today()); misuReaction = {kind:'snooze', name:it.name}; save(); renderAll(); toast('Ok, Misu sẽ hỏi lại về '+it.name+' sau 30 ngày nha.'); }));
  el.querySelectorAll('[data-done]').forEach(b => b.addEventListener('click', () => { const it = byId(b.dataset.done); it.used = true; if(sel===it.id) sel = null; misuReaction = {kind:'done', name:it.name}; save(); react('used', it.name); renderAll(); toast(it.name+' đã dùng hết. Tiền mua vẫn được tính trong chi tiêu nha.'); }));
  el.querySelectorAll('[data-dfind]').forEach(b => b.addEventListener('click', () => { sel = b.dataset.dfind; found = sel; renderRoom(); renderInspector(); room.scrollIntoView({behavior:'smooth', block:'center'}); }));
}

/* ---------- period ---------- */
let period = {key:'all', from:'', to:''}, showAllRows = false, refocus = null;
function periodRange(){
  const t = today(), y = t.getFullYear(), m = t.getMonth();
  switch(period.key){
    case 'this': return [iso(new Date(y,m,1)), iso(new Date(y,m+1,0))];
    case 'last': return [iso(new Date(y,m-1,1)), iso(new Date(y,m,0))];
    case '30': return [iso(addDays(t,-29)), iso(t)];
    case 'custom': return [period.from || '0000-01-01', period.to || '9999-12-31'];
    default: return null;
  }
}
const inPeriod = it => { const r = periodRange(); return !r || (it.bought >= r[0] && it.bought <= r[1]); };
function periodLabel(){
  const r = periodRange(); if(!r) return 'Tất cả thời gian';
  if(period.key==='custom') return (period.from?shortDate(period.from):'Ngày đầu')+' – '+(period.to?shortDate(period.to):'hôm nay');
  const t = today();
  if(period.key==='this') return t.toLocaleDateString('vi-VN',{month:'long',year:'numeric'});
  if(period.key==='last') return parseISO(r[0]).toLocaleDateString('vi-VN',{month:'long',year:'numeric'});
  return shortDate(r[0])+' – '+shortDate(r[1]);
}
function rowStatus(it){
  if(it.used) return '<span class="pill">'+(it.replacedBy ? 'Đã thay bằng món mới' : 'Đã dùng hết')+'</span>';
  const st = status(it), d = daysLeft(it);
  if(st==='expired') return '<span class="pill bad">'+whenText(d)+'</span>';
  if(st==='soon') return '<span class="pill warn">'+whenText(d)+'</span>';
  return '<span class="pill">Trong phòng</span>';
}
function renderHistory(){
  const el = $('#history');
  const PRESETS = [['all','Tất cả'],['this','Tháng này'],['last','Tháng trước'],['30','30 ngày qua'],['custom','Tự chọn']];
  const list = state.items.filter(inPeriod).sort((a,b) => b.bought.localeCompare(a.bought) || a.name.localeCompare(b.name));
  const total = list.reduce((a,i) => a + i.price, 0);
  const byCat = CATS.map(c => ({c, v:list.filter(i => i.cat===c.id).reduce((a,i) => a + i.price, 0), n:list.filter(i => i.cat===c.id).length})).filter(x => x.n).sort((a,b) => b.v-a.v);
  const maxV = Math.max(1, ...byCat.map(x => x.v));
  const rows = showAllRows ? list : list.slice(0,8);
  el.innerHTML =
    '<div class="card-head"><h2 id="h-hist">Lịch sử mua sắm</h2><span class="small muted">Tính theo ngày mua</span></div>'+
    '<div class="periods" role="group" aria-label="Period">'+PRESETS.map(p => '<button type="button" class="chip" data-p="'+p[0]+'" aria-pressed="'+(period.key===p[0])+'">'+p[1]+'</button>').join('')+'</div>'+
    (period.key==='custom' ? '<div class="custom"><label for="p-from">Từ ngày<input type="date" id="p-from" value="'+esc(period.from)+'"></label><label for="p-to">Đến ngày<input type="date" id="p-to" value="'+esc(period.to)+'"></label></div>' : '')+
    '<div class="hsum"><div><div class="eyebrow">'+esc(periodLabel())+'</div><div class="amt num">'+money(total)+'</div></div><span class="muted">'+list.length+' món</span></div>'+
    (list.length ?
      '<div class="cbs">'+byCat.map(x => '<div class="cb" style="--c:'+x.c.color+'"><span>'+icon(x.c.id)+x.c.name+' <span class="muted num">'+x.n+'</span></span><div class="track"><i style="width:'+Math.max(3,x.v/maxV*100).toFixed(1)+'%;background:'+x.c.color+'"></i></div><b class="num">'+money(x.v)+'</b></div>').join('')+'</div>'+
      '<ul class="hlist">'+rows.map(i => '<li><button type="button" class="hrow" data-id="'+i.id+'"'+(i.used?' disabled':'')+' style="--c:'+CAT[i.cat].color+'"><span class="hd num">'+shortDate(i.bought)+'</span><span class="hn"><b>'+icon(i.cat)+'<span>'+esc(i.name)+(i.qty>1?' ×'+i.qty:'')+'</span></b>'+rowStatus(i)+'</span><span class="hp num">'+money(i.price)+'</span></button></li>').join('')+'</ul>'+
      (list.length>8 ? '<button type="button" class="btn ghost sm more" id="h-more">'+(showAllRows?'Thu gọn':'Xem hết '+list.length+' món')+'</button>' : '')
      : '<p class="empty">Khoảng này chưa mua gì hết nè.</p>');
  el.querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => {
    period.key = b.dataset.p; showAllRows = false;
    if(period.key==='custom' && !period.from && !period.to){ period.from = iso(addDays(today(),-6)); period.to = iso(today()); }
    renderRoom(); renderHistory();
  }));
  ['from','to'].forEach(k => { const f = $('#p-'+k); if(f) f.addEventListener('change', e => { period[k] = e.target.value; refocus = 'p-'+k; renderRoom(); renderHistory(); }); });
  const more = $('#h-more'); if(more) more.addEventListener('click', () => { showAllRows = !showAllRows; renderHistory(); });
  el.querySelectorAll('.hrow:not(:disabled)').forEach(b => b.addEventListener('click', () => { select(b.dataset.id); room.scrollIntoView({behavior:'smooth', block:'center'}); }));
  if(refocus){ const f = document.getElementById(refocus); refocus = null; if(f) f.focus(); }
}

function renderRoom(){
  room.querySelectorAll('.item').forEach(n => n.remove());
  $('#empty-room').hidden = state.items.some(i => !i.used);
  state.items.filter(i => !i.used).forEach(it => {
    const st = status(it), d = daysLeft(it);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'item st-'+st+(it.id===sel?' sel':'')+((filter && filter!==it.cat) || !inPeriod(it)?' dim':'')+(it.id===justAdded?' pop':'')+(it.id===found?' found':'');
    b.dataset.id = it.id;
    b.style.cssText = 'left:'+it.x+'%;top:'+it.y+'%;--c:'+CAT[it.cat].color+';z-index:'+Math.round(it.y*10);
    b.setAttribute('aria-label', itemLabel(it)+'. Kéo để di chuyển, dùng phím mũi tên để nhích.');
    const badge = st==='expired' ? '<span class="badge">!</span>' : st==='soon' ? '<span class="badge">'+(d===0?'Today':d+'d')+'</span>' : '';
    const zz = isDormant(it) ? '<span class="zz" title="Nằm im lâu rồi">zZ</span>' : '';
    b.innerHTML = icon(it.cat,'ico')+badge+zz+'<span class="tag">'+esc(it.name)+'</span>';
    room.appendChild(b);
  });
}

let drag = null;
const binEl = $('#bin');
binEl.addEventListener('click', () => { if(sel && byId(sel)) trashItem(sel); else toast('Chọn một món trước, hoặc kéo món vào thùng rác nha.'); });
room.addEventListener('pointerdown', e => {
  const el = e.target.closest('.item'); if(!el) return;
  const it = byId(el.dataset.id); if(!it) return;
  drag = {el, it, sx:e.clientX, sy:e.clientY, ox:it.x, oy:it.y, r:room.getBoundingClientRect(), moved:false, pid:e.pointerId};
  try{ el.setPointerCapture(e.pointerId); }catch(_){}
});
room.addEventListener('pointermove', e => {
  if(!drag || e.pointerId !== drag.pid) return;
  const dx = e.clientX-drag.sx, dy = e.clientY-drag.sy;
  if(!drag.moved && Math.hypot(dx,dy) < 5) return;
  if(!drag.moved) binEl.classList.add('armed');
  drag.moved = true; drag.el.classList.add('drag');
  drag.it.x = +clamp(drag.ox + dx/drag.r.width*100, 4, 96).toFixed(2);
  drag.it.y = +clamp(drag.oy + dy/drag.r.height*100, 8, 95).toFixed(2);
  drag.el.style.left = drag.it.x+'%'; drag.el.style.top = drag.it.y+'%';
  const br = binEl.getBoundingClientRect(), pad = 12;
  drag.over = e.clientX>=br.left-pad && e.clientX<=br.right+pad && e.clientY>=br.top-pad && e.clientY<=br.bottom+pad;
  binEl.classList.toggle('over', drag.over); drag.el.classList.toggle('over-bin', drag.over);
});
function endDrag(e){
  if(!drag || e.pointerId !== drag.pid) return;
  const d = drag; drag = null;
  binEl.classList.remove('armed','over');
  if(d.moved && d.over){ d.it.x = d.ox; d.it.y = d.oy; trashItem(d.it.id); return; }
  if(d.moved) save();
  select(d.it.id);
}
room.addEventListener('pointerup', endDrag);
room.addEventListener('pointercancel', endDrag);
room.addEventListener('click', e => {
  const el = e.target.closest('.item');
  if(el && e.detail === 0) { select(el.dataset.id); const n = room.querySelector('[data-id="'+el.dataset.id+'"]'); if(n) n.focus({preventScroll:true}); }
});
room.addEventListener('keydown', e => {
  const el = e.target.closest('.item'); if(!el) return;
  const step = {ArrowLeft:[-1.5,0], ArrowRight:[1.5,0], ArrowUp:[0,-1.5], ArrowDown:[0,1.5]}[e.key];
  if(!step) return;
  e.preventDefault();
  const it = byId(el.dataset.id);
  it.x = +clamp(it.x+step[0], 4, 96).toFixed(2); it.y = +clamp(it.y+step[1], 8, 95).toFixed(2);
  el.style.left = it.x+'%'; el.style.top = it.y+'%'; el.style.zIndex = Math.round(it.y*10);
  save();
});

function select(id){
  sel = id; justAdded = null; found = null;
  renderRoom(); renderInspector();
}

function freeSpot(){
  const used = state.items.filter(i => !i.used);
  let best = null, bestD = -1;
  for(let n=0; n<40; n++){
    const x = 8 + Math.random()*84, y = 46 + Math.random()*46;
    const d = Math.min(99, ...used.map(i => Math.hypot(i.x-x, (i.y-y)*1.6)));
    if(d > bestD){ bestD = d; best = {x:+x.toFixed(2), y:+y.toFixed(2)}; }
  }
  return best;
}

/* ---------- legend ---------- */
function renderLegend(){
  const el = $('#legend'); el.innerHTML = '';
  CATS.forEach(c => {
    const n = state.items.filter(i => !i.used && i.cat===c.id).length;
    if(!n && filter!==c.id) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.style.setProperty('--c', c.color);
    b.setAttribute('aria-pressed', filter===c.id ? 'true' : 'false');
    b.innerHTML = icon(c.id)+c.name+' <b>'+n+'</b>';
    b.addEventListener('click', () => { filter = filter===c.id ? null : c.id; renderLegend(); renderRoom(); });
    el.appendChild(b);
  });
}

/* ---------- inspector ---------- */
function renderInspector(){
  const el = $('#inspector'); const it = sel && byId(sel);
  if(!it || it.used){
    el.innerHTML = '<p class="muted">Chạm vào một món trong phòng để xem chi tiết nhé. Kéo để dời sang chỗ khác.</p>';
    return;
  }
  const d = daysLeft(it), st = status(it);
  const pill = d===null ? '<span class="pill">Không có hạn dùng</span>' : '<span class="pill '+(st==='expired'?'bad':st==='soon'?'warn':'')+'">'+whenText(d)+'</span>';
  el.innerHTML =
    '<div class="insp" style="--c:'+CAT[it.cat].color+'">'+
      icon(it.cat,'big')+
      '<div class="insp-main"><h3>'+esc(it.name)+(it.qty>1?' <span class="muted">×'+it.qty+'</span>':'')+'</h3>'+
        '<div class="facts"><span>'+CAT[it.cat].name+'</span>'+(it.note?'<span>'+esc(it.note)+'</span>':'')+'<span>Mua ngày '+shortDate(it.bought)+'</span><span class="num">'+money(it.price)+'</span>'+pill+(it.cat==='gift'?'<span class="pill">Misu không nhắc</span>':'')+'</div></div>'+
      '<div class="insp-actions">'+
        '<label for="i-exp">Ngày hết hạn<input id="i-exp" type="date" value="'+esc(it.exp)+'"></label>'+
        '<button class="btn ghost sm" id="i-touch" type="button">Vừa dùng</button>'+
        '<button class="btn ghost sm" id="i-used" type="button">Dùng hết rồi</button>'+
        '<button class="btn danger sm" id="i-del" type="button">Xoá</button>'+
      '</div>'+
    '</div>';
  $('#i-exp').addEventListener('change', e => { it.exp = e.target.value; save(); renderAll(); });
  $('#i-touch').addEventListener('click', () => { it.touched = iso(today()); misuReaction = {kind:'touch', name:it.name}; save(); renderAll(); toast('Đã ghi nhận bạn vừa dùng '+it.name+'.'); });
  $('#i-used').addEventListener('click', () => { it.used = true; sel = null; save(); react('used', it.name); renderAll(); toast(it.name+' đã dùng hết. Tiền mua vẫn được tính trong chi tiêu nha.'); });
  $('#i-del').addEventListener('click', () => trashItem(it.id));
}

/* ---------- alerts ---------- */
function renderAlerts(){
  const list = attention();
  const exp = list.filter(i => status(i)==='expired').length, soon = list.length-exp;
  $('#bell-count').textContent = list.length;
  $('#bell-count').dataset.zero = list.length ? 'false' : 'true';

  const bn = $('#banner');
  if(list.length){
    const parts = [];
    if(exp) parts.push(exp+' món đã hết hạn');
    if(soon) parts.push(soon+' món sắp hết hạn trong '+state.win+' ngày');
    bn.innerHTML = '<strong>'+list.length+' món cần bạn để ý.</strong><span>'+parts.join(', ')+'.</span><a id="banner-go" role="button" tabindex="0">Xem danh sách</a>';
    bn.hidden = false;
    const go = $('#banner-go');
    go.addEventListener('click', jumpAlerts);
    go.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); jumpAlerts(); } });
  } else bn.hidden = true;

  const el = $('#alerts');
  el.innerHTML = '<div class="card-head"><h2 id="h-alerts">Sắp hết hạn</h2><span class="small muted">Trong '+state.win+' ngày tới</span></div>'+
    (list.length ? '<ul class="alist">'+list.map(i => {
        const d = daysLeft(i), bad = d<0;
        return '<li style="--c:'+CAT[i.cat].color+'">'+icon(i.cat)+
          '<div style="min-width:0"><div class="nm">'+esc(i.name)+'</div><div class="when '+(bad?'bad':'warn')+'">'+whenText(d)+'</div></div>'+
          '<button class="btn ghost sm" type="button" data-find="'+i.id+'">Tìm</button></li>';
      }).join('')+'</ul>'
      : '<p class="empty">'+state.win+' ngày tới chưa có món nào hết hạn, yên tâm nha.</p>')+
    '<div class="alert-foot"><span class="small muted" id="notif-note"></span><button class="btn ghost sm" id="enable-notif" type="button">Bật thông báo</button></div>';
  el.querySelectorAll('[data-find]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.find; sel = id; found = id; renderRoom(); renderInspector();
    room.scrollIntoView({behavior:'smooth', block:'center'});
  }));
  setupNotifButton();
}
function jumpAlerts(){ $('#alerts').scrollIntoView({behavior:'smooth', block:'start'}); }
$('#bell').addEventListener('click', jumpAlerts);
const NOTIF_KEY = 'phongtrudo.lastNotify';
const canNotify = () => 'Notification' in window;
function setupNotifButton(){
  const btn = $('#enable-notif'), note = $('#notif-note'); if(!btn) return;
  if(!canNotify()){ btn.hidden = true; note.textContent = 'Trình duyệt này chưa hỗ trợ thông báo.'; return; }
  const p = Notification.permission;
  if(p === 'granted'){ btn.textContent = 'Gửi thử một thông báo'; note.textContent = 'Miso sẽ nhắc bạn mỗi ngày khi bạn mở app.'; }
  else if(p === 'denied'){ btn.hidden = true; note.textContent = 'Thông báo đang bị chặn. Bạn mở lại trong phần cài đặt của trình duyệt nha.'; }
  else { btn.textContent = 'Bật thông báo'; note.textContent = 'Để Miso nhắc khi có món sắp hết hạn.'; }
  btn.onclick = async () => {
    if(Notification.permission === 'default'){ try{ await Notification.requestPermission(); }catch(e){} }
    if(Notification.permission === 'granted'){ showExpiryNotification(true); }
    setupNotifButton();
  };
}
async function showExpiryNotification(force){
  const list = attention();
  const body = list.length ? list.slice(0,3).map(i => i.name+': '+whenText(daysLeft(i)).toLowerCase()).join('\n')+(list.length>3 ? '\nvà '+(list.length-3)+' món nữa' : '') : 'Chưa có món nào sắp hết hạn, Miso yên tâm rồi.';
  if(force) toast('Miso: '+body.replace(/\n/g,' · '));
  if(!canNotify() || Notification.permission !== 'granted') return;
  const opts = {body, icon:'icons/icon-192.png', tag:'het-han'};
  try{
    const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
    if(reg) await reg.showNotification('Phòng Trữ Đồ', opts); else new Notification('Phòng Trữ Đồ', opts);
  }catch(e){}
}
/* once a day, when the app is opened (a static web app cannot push while it is closed) */
function dailyNotify(){
  if(!canNotify() || Notification.permission !== 'granted' || !attention().length) return;
  let last = ''; try{ last = localStorage.getItem(NOTIF_KEY) || ''; }catch(e){}
  if(last === iso(today())) return;
  try{ localStorage.setItem(NOTIF_KEY, iso(today())); }catch(e){}
  showExpiryNotification(false);
}
$('#win').value = String(state.win);
$('#win').addEventListener('change', e => { state.win = +e.target.value; save(); renderAll(); });

/* ---------- spending ---------- */
function nice(v){ if(v<=0) return 10; const p = Math.pow(10, Math.floor(Math.log10(v))); return Math.ceil(v/p)*p; }
function monthDaily(y, m){
  const n = new Date(y, m+1, 0).getDate(), a = new Array(n+1).fill(0);
  state.items.forEach(i => { const d = parseISO(i.bought); if(d.getFullYear()===y && d.getMonth()===m) a[d.getDate()] += i.price; });
  return a;
}
function cumulative(a, upTo){ const out = []; let s = 0; for(let d=1; d<=upTo; d++){ s += a[d]||0; out.push(s); } return out; }
function renderSpend(){
  const t = today(), y = t.getFullYear(), m = t.getMonth(), day = t.getDate();
  const ly = m===0 ? y-1 : y, lm = m===0 ? 11 : m-1;
  const cur = monthDaily(y,m), prev = monthDaily(ly,lm);
  const prevDays = prev.length-1;
  const curC = cumulative(cur, day), prevC = cumulative(prev, prevDays);
  const curTotal = curC[curC.length-1] || 0;
  const prevTotal = prevC[prevC.length-1] || 0;
  const sameN = Math.min(day, prevDays);
  const prevSame = prevC[sameN-1] || 0;
  const diff = curTotal - prevSame;
  const pct = prevSame>0 ? diff/prevSame*100 : null;
  const cls = Math.abs(diff) < 0.005 ? 'flat' : diff>0 ? 'up' : 'down';
  const arrow = cls==='up' ? '▲' : cls==='down' ? '▼' : '=';
  const cm = monthName(t), pm = monthName(new Date(ly,lm,1));
  const rangeNow = day===1 ? '1 '+cm : '1–'+day+' '+cm;
  const rangePrev = sameN===1 ? '1 '+pm : '1–'+sameN+' '+pm;

  const W=330, H=140, L=44, R=12, T=10, B=24, N=31;
  const mx = nice(Math.max(prevTotal, curTotal)*1.08);
  const X = d => L + (d-1)/(N-1)*(W-L-R), Y = v => T + (1-v/mx)*(H-T-B);
  const pts = arr => arr.map((v,i) => X(i+1).toFixed(1)+','+Y(v).toFixed(1)).join(' ');
  let g = '';
  [0, .5, 1].forEach(f => { const v = mx*f; g += '<line class="grid-l" x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(v).toFixed(1)+'" y2="'+Y(v).toFixed(1)+'"/><text x="'+(L-6)+'" y="'+(Y(v)+3.5).toFixed(1)+'" text-anchor="end">'+money0(v)+'</text>'; });
  [1,8,15,22,29].forEach(d => { g += '<text x="'+X(d).toFixed(1)+'" y="'+(H-6)+'" text-anchor="middle">'+d+'</text>'; });
  const svg = '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Chi tiêu cộng dồn theo ngày, tháng này so với tháng trước">'+g+
    '<line class="today-l" x1="'+X(day).toFixed(1)+'" x2="'+X(day).toFixed(1)+'" y1="'+T+'" y2="'+(H-B)+'"/>'+
    '<polyline class="l-last" points="'+pts(prevC)+'"/>'+
    '<polyline class="l-now" points="'+pts(curC)+'"/>'+
    '<circle class="dot" cx="'+X(day).toFixed(1)+'" cy="'+Y(curTotal).toFixed(1)+'" r="4.5"/></svg>';

  $('#spend').innerHTML =
    '<div class="card-head"><h2 id="h-spend">Chi tiêu</h2><span class="small muted">Cộng dồn theo ngày</span></div>'+
    '<div class="spend-top"><div><div class="eyebrow">Tháng này tính đến hôm nay</div><div class="amt num">'+money(curTotal)+'</div></div>'+
      '<span class="delta '+cls+'" title="So với cùng kỳ tháng trước">'+arrow+' '+(pct===null ? (diff>0?'Mới chi':'Không đổi') : (diff>=0?'+':'−')+Math.abs(pct).toFixed(0)+'%')+' <span style="font-weight:500">so với '+rangePrev+'</span></span></div>'+
    '<div class="cmp">'+
      '<div><div class="eyebrow">'+rangePrev+'</div><div class="v num">'+money(prevSame)+'</div></div>'+
      '<div><div class="eyebrow">Cả tháng trước</div><div class="v num">'+money(prevTotal)+'</div></div>'+
    '</div>'+
    svg+
    '<div class="key"><span><i></i>Tháng này ('+rangeNow+')</span><span><i class="d"></i>Tháng trước</span></div>';
}

/* ---------- add: by hand ---------- */
const catsBox = $('#f-cats');
CATS.forEach((c,i) => {
  const l = document.createElement('label'); l.className = 'cat'; l.style.setProperty('--c', c.color);
  l.innerHTML = '<input type="radio" name="f-cat" value="'+c.id+'"'+(i===1?' checked':'')+'><span>'+icon(c.id)+c.name+'</span>';
  catsBox.appendChild(l);
});
$('#f-bought').value = iso(today());
$('#pane-hand').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#f-name').value.trim(), err = $('#f-err');
  if(!name){ err.textContent = 'Bạn đặt tên cho món này trước nha.'; $('#f-name').focus(); return; }
  const price = parseFloat($('#f-price').value);
  if($('#f-price').value !== '' && !(price >= 0)){ err.textContent = 'Giá phải là số, ví dụ 35000.'; return; }
  err.textContent = '';
  const cat = (document.querySelector('input[name="f-cat"]:checked')||{}).value || 'other';
  const spot = freeSpot();
  const it = {id:uid(), name, cat, exp:$('#f-exp').value, price:isNaN(price)?0:price, qty:Math.max(1, parseInt($('#f-qty').value,10)||1), bought:$('#f-bought').value||iso(today()), x:spot.x, y:spot.y, used:false};
  state.items.push(it); const hit = applyRebuy([it]); save(); hit.length ? react('rebuy', it.name, hit.length) : react('add', it.name, undefined, it.cat);
  sel = it.id; justAdded = it.id; filter = null;
  renderAll();
  $('#f-name').value = ''; $('#f-exp').value = ''; $('#f-price').value = ''; $('#f-qty').value = '1';
  if(hit.length) announceRebuy(hit); else toast(name+' đã vào phòng rồi. Kéo nó tới chỗ bạn thích nha.');
  room.scrollIntoView({behavior:'smooth', block:'center'});
});

/* ---------- add: from a bill ---------- */
const dmy = n => { const d = addDays(today(),n); return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear(); };
const SAMPLES = {
  shopee:
'Mall Applecrumby Việt Nam\n[COMBO 2 Tặng Túi ] Bỉm tã quần đêm...\nQuầnXL12-18kg,17miếg,Combo 2 túi x1\n867.000đ 667.000đ\nThành tiền: 517.600đ\n\nMall Vinamilk Official\nSữa tươi tiệt trùng 1L...\nThùng 12 hộp x1\n420.000đ 360.000đ\nThành tiền: 305.000đ',
  cafe:
'Giờ vào: 09:12     Giờ ra: 09:12\nSTT  Tên món  SL  Đơn giá  Thành tiền\n1  Phê Hạnh Nhân  1  35,000  35,000\n2  Mộc  1  37,000  37,000\n   - Thạch Giòn  1  0  0\n3  Thạch Giòn  1  5,000  5,000\nThành tiền:  77,000 đ\nTổng tiền:  77,000 đ\n+Thanh toán tiền mặt  77,000 đ\nWifi: Thức',
  receipt:
'SIÊU THỊ FRESHMART\nNgày: '+dmy(-1)+'\n-----------------------------\nSữa tươi 1L          x2    72.000\nPhô mai Cheddar      x1    52.000\nChuối 1kg            x1    23.000\nXà phòng rửa tay     x1    31.000\nTỔNG CỘNG                 178.000'
};
$('#bill-load').addEventListener('click', () => { $('#bill-text').value = SAMPLES[$('#bill-sample').value]; });

function toNum(s){
  if(/^\d{1,3}(\.\d{3})+$/.test(s)) return parseFloat(s.replace(/\./g,''));
  if(/,\d{1,2}$/.test(s)) return parseFloat(s.replace(/\./g,'').replace(',','.'));
  return parseFloat(s.replace(/,/g,''));
}
function guessCat(name){
  for(const id of GUESS_ORDER){ if((CAT[id].kw && CAT[id].kw.test(name)) || (VN[id] && VN[id].test(name))) return id; }
  return 'other';
}
function digits(s){ return parseInt(String(s).replace(/[^\d]/g,''),10) || 0; }
function cleanName(s){ return s.replace(/\[[^\]]*\]/g,'').replace(/(\.{2,}|…)\s*$/,'').replace(/\s+/g,' ').trim(); }
/* Shopee-style order: shop, product name, variation + "xN", prices (struck-through then current), "Thành tiền" */
function parseShopee(text){
  const rows = []; let pending = [], prev = '', cur = null, bought = iso(today());
  const flush = total => {
    const sum = pending.reduce((a,r) => a + r.unit*r.qty, 0);
    pending.forEach(r => { r.price = total>0 && sum>0 ? Math.round(total * (r.unit*r.qty)/sum) : r.unit*r.qty; delete r.unit; rows.push(r); });
    pending = [];
  };
  text.split(/\r?\n/).forEach(raw => {
    const line = raw.replace(/\s+/g,' ').trim(); if(!line) return;
    const dm = line.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/); if(dm){ bought = dm[3]+'-'+pad(+dm[2])+'-'+pad(+dm[1]); return; }
    if(/th[àa]nh ti[ềe]n/i.test(line)){ flush(digits(line.split(':').pop())); prev = ''; cur = null; return; }
    if(/^(\d[\d.,]*\s*[đ₫]\s*){1,2}$/.test(line)){
      const nums = [...line.matchAll(/(\d[\d.,]*)\s*[đ₫]/g)].map(m => digits(m[1]));
      if(cur) cur.unit = nums[nums.length-1];
      return;
    }
    const q = line.match(/^(.*?)\s*[x×]\s?(\d+)$/i);
    if(q && prev && q[2]){ cur = {on:true, name:cleanName(prev), cat:guessCat(prev), exp:'', price:0, unit:0, qty:+q[2], note:q[1].trim()}; pending.push(cur); return; }
    prev = line;
  });
  flush(0);
  rows.forEach(r => r.bought = bought);
  return rows;
}
/* Café / restaurant table: STT, Tên món, SL, Đơn giá, Thành tiền. "- topping" lines with 0 are attached to the item above. */
function parseDineIn(text){
  const rows = []; let last = null, grand = 0, bought = iso(today());
  text.split(/\r?\n/).forEach(raw => {
    const line = raw.replace(/\s+/g,' ').trim(); if(!line) return;
    const dm = line.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/); if(dm){ bought = dm[3]+'-'+pad(+dm[2])+'-'+pad(+dm[1]); return; }
    if(/t[ổo]ng ti[ềe]n/i.test(line)){ grand = digits(line.split(':').pop()); return; }
    if(/^\+?\s*(th[àa]nh|thanh to[áa]n|wifi|gi[ờo]|stt)/i.test(line)) return;
    const m = line.match(/^(?:(\d+)\s+)?(-\s*)?(.+?)\s+(\d+)\s+(\d[\d.,]*)\s+(\d[\d.,]*)\s*[đ₫]?$/);
    if(!m) return;
    const name = m[3].trim(), qty = +m[4], total = digits(m[6]);
    if(m[2] && total === 0){ if(last) last.note = (last.note ? last.note+', ' : '')+name; return; }
    last = {on:true, name, cat:(guessCat(name)==='other' ? 'drinks' : guessCat(name)), exp:'', price:total, qty, note:''};
    rows.push(last);
  });
  const sum = rows.reduce((a,r) => a + r.price, 0);
  if(grand > 0 && sum > 0 && grand !== sum) rows.forEach(r => r.price = Math.round(grand * r.price / sum));
  rows.forEach(r => r.bought = bought);
  rows.consumed = true;
  return rows;
}
function parseBill(text){
  if(/t[êe]n m[óo]n/i.test(text) && /\bSTT\b/i.test(text)) return parseDineIn(text);
  if(/th[àa]nh ti[ềe]n/i.test(text)) return parseShopee(text);
  let bought = iso(today()); const rows = [];
  const skip = /\b(sub-?total|total|tax|vat|shipping|delivery|discount|change|cash|card|tender|balance|order|invoice|receipt)\b/i;
  text.split(/\r?\n/).forEach(raw => {
    const line = raw.replace(/\.{2,}/g,' ').replace(/[|]/g,' ').replace(/\s+/g,' ').trim();
    if(!line) return;
    const a = line.match(/(\d{4})-(\d{2})-(\d{2})/), b = line.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
    if(a){ bought = a[1]+'-'+a[2]+'-'+a[3]; return; }
    if(b){ bought = b[3]+'-'+pad(+b[2])+'-'+pad(+b[1]); return; }
    if(skip.test(line) || /^[-=_*\s]+$/.test(line)) return;
    const pm = line.match(/(\d{1,9}(?:[.,]\d{1,3})*)\s*[đ₫]?\s*$/); if(!pm) return;
    const price = toNum(pm[1]); if(!(price >= 0)) return;
    let rest = line.slice(0, pm.index).trim(), qty = 1, q;
    if((q = rest.match(/^(\d+)\s*[x×]\s+(.*)$/i))){ qty = +q[1]; rest = q[2]; }
    else if((q = rest.match(/^(.*?)\s+[x×]\s?(\d+)$/i))){ rest = q[1]; qty = +q[2]; }
    rest = rest.replace(/[-:–]+$/,'').trim();
    if(rest.length < 2) return;
    rows.push({on:true, name:rest, cat:guessCat(rest), exp:'', price, qty});
  });
  rows.forEach(r => r.bought = bought);
  return rows;
}
let billRows = [];

/* ---------- bill photos: Claude reads the image ---------- */
const KEY_API = 'phongtrudo.apikey', KEY_MODEL = 'phongtrudo.model';
const lsGet = k => { try{ return localStorage.getItem(k) || ''; }catch(e){ return ''; } };
const lsSet = (k,v) => { try{ v ? localStorage.setItem(k,v) : localStorage.removeItem(k); }catch(e){} };
let maxImgs = 4, files = [], ctl = null, sampleFn = null;
/* inside a Claude artifact the page can ask Claude itself, so no key is needed there */
(async () => {
  try{
    if(!window.claude) return;
    const sm = await window.claude.use('sample'), lim = sm && await sm.limits();
    if(lim && lim.images){ sampleFn = sm; maxImgs = lim.images.maxCount || 4; $('#key-details').hidden = true; }
  }catch(e){}
})();
$('#api-key').value = lsGet(KEY_API);
if(lsGet(KEY_MODEL)) $('#api-model').value = lsGet(KEY_MODEL);
$('#api-save').addEventListener('click', () => {
  lsSet(KEY_API, $('#api-key').value.trim()); lsSet(KEY_MODEL, $('#api-model').value);
  pStatus($('#api-key').value.trim() ? 'Đã lưu khoá trên máy này.' : 'Đã xoá khoá.');
});
$('#api-clear').addEventListener('click', () => { lsSet(KEY_API,''); $('#api-key').value = ''; pStatus('Đã xoá khoá.'); });
const pStatus = t => { $('#photo-status').textContent = t || ''; };
function renderThumbs(){
  const box = $('#thumbs'); box.innerHTML = '';
  files.forEach((f,i) => {
    const d = document.createElement('div'); d.className = 'thumb';
    const img = document.createElement('img'); img.alt = 'Ảnh hoá đơn '+(i+1); img.src = URL.createObjectURL(f); img.onload = () => URL.revokeObjectURL(img.src);
    const x = document.createElement('button'); x.type = 'button'; x.textContent = '×'; x.setAttribute('aria-label','Xoá ảnh '+(i+1));
    x.addEventListener('click', () => { files.splice(i,1); renderThumbs(); });
    d.append(img, x); box.appendChild(d);
  });
  $('#photo-read').disabled = !files.length;
}
function addFiles(list){
  const imgs = [...list].filter(f => /^image\//.test(f.type));
  if(!imgs.length){ pStatus('Tệp này không phải ảnh. Bạn chọn ảnh JPG, PNG hoặc WebP nha.'); return; }
  files = files.concat(imgs).slice(0, maxImgs);
  pStatus(files.length >= maxImgs ? 'Tối đa '+maxImgs+' ảnh mỗi lần.' : '');
  renderThumbs();
}
$('#bill-pick').addEventListener('click', () => $('#bill-file').click());
$('#bill-file').addEventListener('change', e => { addFiles(e.target.files); e.target.value = ''; });
const drop = $('#drop');
['dragenter','dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave','drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e => addFiles(e.dataTransfer.files));

const ERR_BY_STATUS = {
  401:'Khoá API không đúng. Bạn kiểm tra lại khoá nha.',
  403:'Khoá API chưa được phép dùng mô hình này.',
  429:'Đang gửi hơi nhiều. Đợi một chút rồi thử lại nha.',
  413:'Ảnh hơi nặng. Thử ảnh nhỏ hơn nhé.'
};
const ERR_BY_CODE = {
  not_granted:'Bạn cần cho phép app dùng Claude để đọc ảnh. Hoặc dán chữ của hoá đơn vào nha.',
  sampling_disabled:'Tài khoản này chưa dùng được Claude. Bạn dán chữ của hoá đơn vào nha.',
  rate_limited:'Đang gửi hơi nhiều. Đợi một chút rồi thử lại nha.',
  image_rejected:'Ảnh này chưa đọc được. Bạn thử ảnh khác nha.',
  invalid_json:'Miso chưa hiểu kết quả. Bạn thử lại hoặc dùng ảnh rõ hơn nha.',
  session_expired:'Bạn đăng nhập lại rồi thử nữa nha.'
};
function parseJsonLoose(t){
  try{ return JSON.parse(t); }catch(e){}
  const f = t.match(/```(?:json)?\s*([\s\S]*?)```/); if(f){ try{ return JSON.parse(f[1]); }catch(e){} }
  const a = t.indexOf('{'), b = t.lastIndexOf('}'); if(a >= 0 && b > a){ try{ return JSON.parse(t.slice(a,b+1)); }catch(e){} }
  return null;
}
async function toBase64(file){
  const bmp = await createImageBitmap(file), sc = Math.min(1, 1600/Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width*sc); c.height = Math.round(bmp.height*sc);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.85).split(',')[1];
}
function photoPrompt(){
  return 'You read photos and screenshots of shopping bills for a household inventory app. Bills are usually Vietnamese (Shopee or other online order screens, café or restaurant receipts, supermarket receipts) but can be in any language. All images belong to the same purchase.\n\n'+
'Reply with only one JSON object of this shape:\n'+
'{"date": "YYYY-MM-DD, or null if no date is printed", "consumed": true or false, "amount_paid": number or null, "items": [{"name": string, "variant": string, "qty": integer, "unit_price": number, "category": string}]}\n\n'+
'Rules:\n'+
'- consumed is true only for a café or restaurant bill, where the items were eaten or drunk on the spot.\n'+
'- name: the product name with promo tags such as [COMBO ...], marketing words and truncation dots removed. Keep the original language.\n'+
'- variant: size, pack or option text shown under the name (for example "Quần XL 12-18kg, 17 miếng"), or "". A topping or add-on priced 0 under a drink goes into that item\'s variant, not into its own item. A topping with a price above 0 is its own item.\n'+
'- unit_price: the price of ONE unit as currently charged, never the crossed-out original price. Prices are Vietnamese dong, so 667.000đ and 35,000 mean 667000 and 35000. Whole numbers only.\n'+
'- amount_paid: the final amount the customer paid for everything shown ("Thành tiền" on an online order, "Tổng tiền" on a receipt). If several shops appear, add their totals. null if none is shown.\n'+
'- category must be one of: '+CATS.map(c => c.id+' ('+c.name+')').join(', ')+'. Use gift only if the bill itself says the item is a gift.\n'+
'- Do not invent items. If the image is not a bill, return {"items": []}.';
}
function fromAI(out){
  const raw = out && Array.isArray(out.items) ? out.items : [];
  const items = raw.map(r => ({name:String(r.name||'').trim(), note:String(r.variant||'').trim(), qty:Math.max(1, Math.round(+r.qty)||1), unit:Math.max(0, +r.unit_price||0), cat:String(r.category||'')}))
    .filter(r => r.name);
  const sum = items.reduce((a,r) => a + r.unit*r.qty, 0), paid = +out.amount_paid > 0 ? +out.amount_paid : 0;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(out.date||'') ? out.date : iso(today());
  const rows = items.map(r => {
    const line = r.unit*r.qty;
    return {on:true, name:r.name, cat:CAT[r.cat] ? r.cat : guessCat(r.name), exp:'', qty:r.qty, note:r.note, bought:date,
            price: paid && sum ? Math.round(paid*line/sum) : line};
  });
  rows.consumed = !!out.consumed;
  return rows;
}
$('#photo-read').addEventListener('click', async () => {
  if(!files.length) return;
  const key = lsGet(KEY_API);
  if(!key && !sampleFn){ $('#key-details').open = true; pStatus('Bạn thêm khoá API Claude ở dưới trước nha. Hoặc dán chữ của hoá đơn vào thay cho ảnh.'); return; }
  ctl = new AbortController();
  $('#photo-read').disabled = true; $('#photo-stop').hidden = false; $('#bill-preview').innerHTML = '';
  pStatus('Miso đang đọc hoá đơn, đợi xíu nha…');
  try{
    let out;
    if(sampleFn){
      out = await sampleFn.json(photoPrompt(), {images:files.slice(), signal:ctl.signal, modelTier:'default'});
    }else{
      const images = await Promise.all(files.map(toBase64));
      const { default: Anthropic } = await import('../vendor/anthropic-sdk.js');
      const client = new Anthropic({apiKey:key, dangerouslyAllowBrowser:true});
      const res = await client.messages.create({
        model: lsGet(KEY_MODEL) || 'claude-sonnet-5-5', max_tokens: 4000,
        messages: [{role:'user', content:[...images.map(data => ({type:'image', source:{type:'base64', media_type:'image/jpeg', data}})), {type:'text', text:photoPrompt()}]}]
      }, {signal: ctl.signal});
      out = parseJsonLoose(res.content.filter(b => b.type==='text').map(b => b.text).join('\n'));
    }
    if(!out){ pStatus('Miso chưa hiểu kết quả. Bạn thử lại hoặc dùng ảnh rõ hơn nha.'); }
    else {
      billRows = fromAI(out);
      if(!billRows.length) pStatus('Miso không tìm thấy món nào. Thử ảnh rõ hơn, hoặc dán chữ của hoá đơn nha.');
      else { pStatus(''); renderBill(); }
    }
  }catch(e){
    const aborted = ctl && ctl.signal.aborted;
    pStatus(aborted || (e && e.code==='cancelled') ? '' : (ERR_BY_STATUS[e && e.status] || ERR_BY_CODE[e && e.code] || 'Chưa đọc được hoá đơn (có thể mất mạng). Bạn thử lại nha.'));
  }finally{
    $('#photo-read').disabled = !files.length; $('#photo-stop').hidden = true; ctl = null;
  }
});
$('#photo-stop').addEventListener('click', () => { if(ctl) ctl.abort(); });
$('#bill-read').addEventListener('click', () => {
  const txt = $('#bill-text').value.trim();
  if(!txt){ $('#bill-preview').innerHTML = '<p class="err">Dán hoá đơn hoặc chọn ví dụ trước nha.</p>'; return; }
  billRows = parseBill(txt);
  renderBill();
});
function renderBill(){
  const box = $('#bill-preview');
  if(!billRows.length){ box.innerHTML = '<p class="err">Không tìm thấy món nào. Bạn kiểm tra xem mỗi dòng có kết thúc bằng giá tiền chưa nha.</p>'; return; }
  const on = billRows.filter(r => r.on).length;
  box.innerHTML =
    '<label class="small" style="display:flex;gap:8px;align-items:flex-start;margin:6px 0 4px"><input type="checkbox" id="bill-used"'+(billRows.consumed?' checked':'')+' style="margin-top:3px"><span>Đã ăn hoặc uống rồi. Chỉ tính vào chi tiêu, không đặt vào phòng.</span></label>'+
    '<p class="small muted" style="margin:4px 0 6px">Tìm thấy '+billRows.length+' món, mua ngày '+shortDate(billRows[0].bought)+'. Bạn xem lại và sửa giúp nếu có chỗ chưa đúng, nhớ thêm hạn dùng nếu có nha.</p>'+
    billRows.map((r,i) =>
      '<div class="brow'+(r.on?'':' off')+'" data-i="'+i+'">'+
        '<input type="checkbox" data-k="on" aria-label="Chọn '+esc(r.name)+'"'+(r.on?' checked':'')+'>'+
        '<input type="text" data-k="name" value="'+esc(r.name)+'" aria-label="Tên món">'+
        '<input type="number" data-k="price" min="0" step="1000" value="'+r.price+'" aria-label="Giá">'+
        '<div class="l2">'+
          '<select data-k="cat" aria-label="Nhóm">'+CATS.map(c => '<option value="'+c.id+'"'+(c.id===r.cat?' selected':'')+'>'+c.name+'</option>').join('')+'</select>'+
          '<input type="date" data-k="exp" value="'+esc(r.exp)+'" aria-label="Hạn dùng (nếu có)">'+
        '</div></div>'
    ).join('')+
    '<div style="display:flex;gap:8px;margin-top:12px"><button class="btn" id="bill-add" type="button" style="flex:1">Thêm '+on+' món</button></div>';
  box.querySelectorAll('.brow').forEach(rowEl => {
    const r = billRows[+rowEl.dataset.i];
    rowEl.querySelectorAll('[data-k]').forEach(f => {
      const ev = (f.type==='checkbox' || f.tagName==='SELECT' || f.type==='date') ? 'change' : 'input';
      f.addEventListener(ev, () => {
        const k = f.dataset.k;
        r[k] = f.type==='checkbox' ? f.checked : k==='price' ? (parseFloat(f.value)||0) : f.value;
        if(k==='on'){ rowEl.classList.toggle('off', !r.on); const n = billRows.filter(x => x.on).length; const bt = $('#bill-add'); bt.textContent = 'Thêm '+n+' món'; bt.disabled = !n; }
      });
    });
  });
  $('#bill-add').addEventListener('click', () => {
    const consumed = $('#bill-used').checked;
    const chosen = billRows.filter(r => r.on && r.name.trim());
    const added = [];
    chosen.forEach(r => {
      const spot = freeSpot(), o = {id:uid(), name:r.name.trim(), cat:r.cat, exp:r.exp, price:r.price, qty:r.qty, note:r.note||'', bought:r.bought, x:spot.x, y:spot.y, used:consumed};
      state.items.push(o); added.push(o);
    });
    const hit = applyRebuy(added);
    if(hit.length) react('rebuy', hit[0].b.name, hit.length); else react(chosen.length>1 ? 'bulk' : 'add', chosen[0] ? chosen[0].name : '', chosen.length, chosen.map(r => r.cat));
    save(); filter = null; sel = null; billRows = []; files = []; renderThumbs(); $('#bill-preview').innerHTML = ''; $('#bill-text').value = '';
    renderAll();
    if(hit.length) announceRebuy(hit); else toast(chosen.length+' món '+(consumed?'đã được tính vào chi tiêu.':'đã thêm từ hoá đơn.'));
    room.scrollIntoView({behavior:'smooth', block:'center'});
  });
}

/* ---------- tabs ---------- */
function showTab(which){
  const hand = which==='hand';
  $('#tab-hand').setAttribute('aria-selected', hand); $('#tab-bill').setAttribute('aria-selected', !hand);
  $('#pane-hand').hidden = !hand; $('#pane-bill').hidden = hand;
}
$('#tab-hand').addEventListener('click', () => showTab('hand'));
$('#tab-bill').addEventListener('click', () => showTab('bill'));

function twoStep(btn, armedText, fn){
  const orig = btn.textContent; let t;
  btn.addEventListener('click', () => {
    if(btn.dataset.armed === '1'){ clearTimeout(t); btn.dataset.armed = '0'; btn.textContent = orig; fn(); return; }
    btn.dataset.armed = '1'; btn.textContent = armedText;
    t = setTimeout(() => { btn.dataset.armed = '0'; btn.textContent = orig; }, 3500);
  });
}
const loadSample = () => { state.items = seed(); applyRebuy(state.items); sel = null; filter = null; save(); renderAll(); toast('Đã nạp dữ liệu mẫu nè.'); };
twoStep($('#reset'), 'Bấm lần nữa để thay bằng dữ liệu mẫu', loadSample);
twoStep($('#wipe'), 'Bấm lần nữa để xoá hết', () => { state.items = []; sel = null; filter = null; save(); renderAll(); toast('Đã xoá hết dữ liệu.'); });
$('#load-sample').addEventListener('click', loadSample);
$('#auto-rebuy').checked = state.autoRebuy !== false;
$('#auto-rebuy').addEventListener('change', e => { state.autoRebuy = e.target.checked; save(); });

/* ---------- boot ---------- */
function renderAll(){ renderRoom(); renderLegend(); renderInspector(); renderAlerts(); renderSpend(); renderHistory(); renderCritic(); renderDormant(); }
renderAll();
dailyNotify();
if('serviceWorker' in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
