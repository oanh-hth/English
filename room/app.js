
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
  {id:'pantry',      name:'Đồ khô',         color:'#bd8c4a', kw:/pasta|rice|bread|flour|sugar|oil|sauce|cereal|noodle|canned|beans/i},
  {id:'meds',        name:'Thuốc',       color:'#1fbf8a', kw:/vitamin|ibuprofen|paracetamol|tablet|medicine|syrup|pill|supplement/i},
  {id:'care',        name:'Chăm sóc & mỹ phẩm', color:'#c76bf0', kw:/shampoo|soap|lotion|hand cream|toothpaste|deodorant|conditioner|sunscreen|lipstick|makeup|make-up|perfume|foundation|mascara|serum|eyeliner|(^|[^\p{L}])(son|phấn|nước hoa|toner|tẩy trang|mặt nạ|cushion|má hồng|kẻ mày|dưỡng da|kem nền|kem lót|chống nắng|mỹ phẩm)([^\p{L}]|$)/iu},
  {id:'cleaning',    name:'Đồ vệ sinh',       color:'#19c3e0', kw:/detergent|cleaner|spray|bleach|sponge|dish|laundry/i},
  {id:'electronics', name:'Đồ điện tử',    color:'#6f86ad', kw:/cable|batter|earbud|charger|mouse|usb|phone|lamp|speaker/i},
  {id:'baby',        name:'Đồ cho bé',           color:'#ff6f9f', kw:/bỉm|(^|[^\p{L}])bim(?! ?bim)([^\p{L}]|$)|(^|[^\p{L}])tã([^\p{L}]|$)|diaper|sữa bột|em bé|baby|trẻ em|khăn ướt/iu},
  {id:'clothes',     name:'Quần áo',        color:'#5b6ee1', kw:/(^|[^\p{L}])(áo|quần|váy|đầm|giày|dép|tất|vớ|nón|mũ|găng tay|khẩu trang)([^\p{L}]|$)|\b(t-?shirts?|shirts?|dress|jeans|shoes?|sneakers?|jacket|hoodie|socks?|pants)\b/iu},
  {id:'gift',        name:'Mua tặng',       color:'#f2b705', kw:/$^/},
  {id:'tools',       name:'Dụng cụ',        color:'#f76707', kw:/(^|[^\p{L}])(búa|kìm|tua vít|tô vít|cờ lê|mỏ lết|khoan|cưa|thước dây|đinh|ốc vít|băng keo|keo dán|dụng cụ|đồ nghề)([^\p{L}]|$)|hammer|wrench|screwdriver|drill|pliers|tape measure|toolbox/iu},
  {id:'stationery',  name:'Văn phòng phẩm', color:'#74b816', kw:/(^|[^\p{L}])(bút|vở|sổ|giấy|kẹp giấy|ghim|bìa|tẩy|thước kẻ|thước|bút chì|bút bi|bút lông|băng dính|bấm kim|văn phòng phẩm)([^\p{L}]|$)|notebook|pencil|\bpens?\b|stapler|highlighter|marker|sticky note/iu},
  {id:'yarn',        name:'Len',            color:'#7950f2', kw:/(^|[^\p{L}])(len|sợi len|kim đan|móc len|kim móc|đan len|cuộn len|sợi bông|sợi cotton)([^\p{L}]|$)|yarn|knitting|crochet/iu},
  {id:'snack',       name:'Đồ ăn vặt',      color:'#e64980', kw:/(^|[^\p{L}])(bim ?bim|snack|kẹo|socola|sô cô la|bánh quy|bánh gạo|bánh snack|bánh kẹo|bánh ngọt|bánh bông lan|hạt điều|hạt hướng dương|hạt dẻ|mứt|rong biển sấy|khô bò|khô gà|khoai tây chiên|trái cây sấy)([^\p{L}]|$)|cookies?|biscuits?|chocolate|candy|chips?|nuts|cracker|wafer|gummy|popcorn/iu},
  {id:'other',       name:'Khác',          color:'#c4925f', kw:/$^/}
];
const CAT = Object.fromEntries(CATS.map(c => [c.id, c]));
const GUESS_ORDER = ['snack','baby','clothes','care','cleaning','meds','electronics','tools','stationery','yarn','drinks','dairy','produce','pantry'];
const VN = {
  care:/sữa tắm|dầu gội|dầu xả|kem đánh răng|xà phòng|sữa rửa mặt|kem dưỡng/i,
  cleaning:/nước rửa|nước lau|nước giặt|tẩy|xịt|giấy vệ sinh|giấy ăn|khăn giấy/i,
  meds:/thuốc|vitamin|viên|siro/i,
  electronics:/cáp|sạc|\bpin\b|chuột|tai nghe|loa/i,
  drinks:/nước ngọt|nước suối|bia|trà|phê|nước ép|sinh tố|matcha/i,
  dairy:/sữa|trứng|phô mai|(^|[^\p{L}])bơ([^\p{L}]|$)|sữa chua/iu,
  produce:/rau|trái cây|táo|chuối|cà chua|cam\b|dâu/i,
  pantry:/gạo|(^|[^\p{L}])mì([^\p{L}]|$)|dầu ăn|bánh|nước mắm|đường|bột/iu
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
/* A few things to start with, so the room is not empty the first time you open it */
function starter(){
  const t = today();
  const S = [
    ['Sữa tươi 1L','dairy',-2,5,36000,1,25,62],
    ['Trứng gà (10 quả)','dairy',-3,12,38000,1,38,80],
    ['Rau cải xanh','produce',-1,2,15000,1,52,66],
    ['Nước cam ép','drinks',-5,6,28000,1,74,62],
    ['Gạo ST25 5kg','pantry',-12,null,145000,1,72,16],
    ['Vitamin C','meds',-9,180,120000,1,82,16],
    ['Dầu gội','care',-20,300,95000,1,12,56],
    ['Nước rửa chén','cleaning',-15,null,42000,1,88,60],
    ['Áo thun trắng','clothes',-30,null,189000,1,22,86],
    ['Quà sinh nhật cho bạn','gift',-3,null,250000,1,52,90],
    ['Son dưỡng môi','care',-8,365,89000,1,16,70],
    ['Bánh quy bơ','snack',-5,70,52000,1,60,90],
    ['Bộ tua vít','tools',-10,null,135000,1,64,88],
    ['Bút gel (hộp 10 cây)','stationery',-6,null,45000,1,44,88],
    ['Len cotton 200g','yarn',-14,null,60000,2,34,92]
  ];
  return S.map(r => ({id:uid(), name:r[0], cat:r[1], bought:iso(addDays(t,r[2])), exp:r[3]===null?'':iso(addDays(t,r[3])), price:r[4], qty:r[5], x:r[6], y:r[7], used:false}));
}
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
    ['Nước suối','drinks',0,null,0.5,1,86,86],
    ['Cà phê sữa','drinks',-1,null,1.2,1,80,72],
    ['Trà sữa trân châu','drinks',-2,null,2,1,88,64],
    ['Nước ép ổi','drinks',-3,null,1.6,1,92,76],
    ['Nước dừa','drinks',-4,null,1.4,1,78,92],
    ['Áo thun cotton','clothes',-100,null,16,1,24,76],
    ['Áo khoác mỏng','clothes',-60,null,32,1,70,84],
    ['Quà sinh nhật cho mẹ','gift',-45,null,20,1,50,92],
    ['Son dưỡng môi','care',-8,365,3.5,1,16,70],
    ['Bánh quy bơ','snack',-5,70,2.1,1,60,90],
    ['Bộ tua vít','tools',-50,null,5.4,1,64,88],
    ['Bút gel (hộp 10 cây)','stationery',-6,null,1.8,1,44,88],
    ['Len cotton 200g','yarn',-14,null,2.4,2,34,92]
  ];
  return S.map(r => ({id:uid(), name:r[0], cat:r[1], bought:iso(addDays(t,r[2])), exp:r[3]===null?'':iso(addDays(t,r[3])), price:r[4]<1000?Math.round(r[4]*25000/1000)*1000:r[4], qty:r[5], x:r[6], y:r[7], used:!!r[8]}));
}
function load(){ try{ const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; }catch(e){ return null; } }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){} }
let state = load();
if(!state || !Array.isArray(state.items)){ state = {items:starter(), win:3}; save(); }
if(state.items.some(i => i.cat === 'cosmetics')){ state.items.forEach(i => { if(i.cat === 'cosmetics') i.cat = 'care'; }); save(); }   // Mỹ phẩm merged into Chăm sóc & mỹ phẩm
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
const REBUY_CATS = new Set(['baby','cleaning']);   // one-at-a-time things: a new diaper pack replaces the old one, whatever the brand
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

/* Misu reminds about things nobody has touched for a while: 30 days, 90 days for clothes, yarn, tools and stationery, never for things bought as gifts */
const DORMANT_DAYS = 30, DORMANT_DAYS_LONG = 90, LONG_IDLE = new Set(['clothes','yarn','tools','stationery']);
const dormantAfter = it => LONG_IDLE.has(it.cat) ? DORMANT_DAYS_LONG : DORMANT_DAYS;
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

/* Press and hold an item (or press D, or use the Nhân đôi button) to buy another one like it, as of today */
function duplicateItem(id, refocus){
  const src = byId(id); if(!src) return;
  let exp = '';
  if(src.exp){ const life = Math.round((parseISO(src.exp) - parseISO(src.bought))/864e5); if(life > 0) exp = iso(addDays(today(), life)); }
  const it = Object.assign({}, src, {id:uid(), bought:iso(today()), exp, x:+clamp(src.x+6, 6, 94).toFixed(2), y:+clamp(src.y+6, 10, 93).toFixed(2), used:false});
  delete it.touched; delete it.snoozed; delete it.replacedBy; delete it.batch;
  state.items.push(it);                 // on purpose no rebuy rule here: you asked for two of them
  save(); react('add', it.name, undefined, it.cat);
  sel = it.id; justAdded = it.id; filter = null;
  renderAll();
  try{ if(navigator.vibrate) navigator.vibrate(25); }catch(e){}
  if(refocus){ const n = room.querySelector('[data-id="'+it.id+'"]'); if(n) n.focus({preventScroll:true}); }
  toast('Đã nhân đôi '+it.name+' (+'+money(it.price)+', ngày mua là hôm nay'+(exp ? ', hạn tính từ hôm nay' : '')+').', {label:'Hoàn tác', fn:() => { state.items = state.items.filter(x => x.id !== it.id); if(sel === it.id) sel = null; save(); renderAll(); }});
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
  drinks:{strong:['Cả tuần ngày nào cũng có đồ uống mới. Bạn uống nước hay uống tiền vậy?','{hdays}/7 ngày liền mua đồ uống. Tui bắt đầu nghi bạn là cá heo hoá thân rồi á.','Tuần này nhà mình ngập trong đồ uống luôn. Cho tui xin một ngày không đồ uống đi bạn.'],
          mild:['{hdays} ngày trong tuần có đồ uống mới về nhà. Bạn chắc là không ngập nước chứ?','Đồ uống về đều như đi làm vậy. Nghỉ một hôm cho bụng bạn thở nha.']},
  dairy:{strong:['Ngày nào cũng mua sữa & trứng, bạn nuôi cả đàn hả?','7/7 ngày mua sữa & trứng luôn. Tủ lạnh bạn sắp thành nông trại rồi.'],
         mild:['{hdays} ngày trong tuần mua sữa & trứng. Uống không hết là nó hư á nha.','Sữa & trứng mua đều ghê, nhưng ăn hết chưa mà mua tiếp vậy?']},
  produce:{strong:['Ngày nào cũng mua rau củ quả, tốt cho sức khoẻ thiệt. Nhưng ăn hết chưa đó, tui thấy rau héo rồi nè.','7/7 ngày mua rau củ quả. Bạn định mở sạp rau trong phòng hả?'],
           mild:['{hdays} ngày trong tuần mua rau củ quả. Chăm ghê, nhớ ăn cho hết nha.','Rau củ về đều đều, tui khen. Nhưng đừng để nó héo nha.']},
  pantry:{strong:['Đồ khô mua hết 7 ngày trong tuần luôn. Kho lương của bạn sắp thành siêu thị rồi.','Ngày nào cũng mua đồ khô, bạn chuẩn bị qua mùa đông hả?'],
          mild:['{hdays} ngày trong tuần bạn mua đồ khô. Kệ bếp thở không nổi nữa rồi.','Đồ khô mua đều quá. Bạn tích trữ hả?']},
  meds:{strong:['Ngày nào cũng mua thuốc và vitamin... Bạn khoẻ không vậy? Tui hơi lo đó.','7/7 ngày mua thuốc. Bạn nhớ đi khám nha, đừng tự mua hoài.'],
        mild:['{hdays} ngày trong tuần mua thuốc, vitamin. Bạn nhớ uống đúng liều nha.','Thuốc men mua đều ghê. Bạn có khoẻ không đó?']},
  care:{strong:['Ngày nào cũng mua mỹ phẩm, đồ chăm sóc. Bàn trang điểm của bạn sắp thành cửa hàng rồi.','Ngày nào cũng mua đồ chăm sóc cá nhân. Bạn đẹp thêm cỡ nào nữa vậy trời?','7/7 ngày mua đồ chăm sóc cá nhân. Chai lọ trong phòng nhiều hơn cả tui rồi.'],
        mild:['{hdays} ngày trong tuần mua mỹ phẩm. Son nào cũng đẹp, nhưng môi chỉ có một cặp thôi nha.','{hdays} ngày trong tuần mua đồ chăm sóc cá nhân. Đẹp vừa thôi nha.','Dầu gội, kem dưỡng mua đều ghê. Dùng hết cái cũ chưa?']},
  cleaning:{strong:['Ngày nào cũng mua đồ vệ sinh. Bạn dọn nhà mỗi ngày hay mua để ngắm vậy?','7/7 ngày mua đồ vệ sinh. Nhà sạch bóng rồi, tha cho nó đi.'],
            mild:['{hdays} ngày trong tuần mua đồ vệ sinh. Chăm dọn dẹp ghê, hay mua dư rồi?','Nước giặt, nước lau mua đều quá. Dùng hết cái cũ chưa?']},
  electronics:{strong:['Ngày nào cũng mua đồ điện tử. Ví bạn kêu cứu rồi nè.','7/7 ngày mua đồ điện tử. Bạn mở cửa hàng công nghệ hả?'],
               mild:['{hdays} ngày trong tuần mua đồ điện tử. Dây cáp trong phòng sắp rối thành cuộn len rồi.','Đồ điện tử mua đều ghê. Cái cũ còn xài được không đó?']},
  baby:{strong:['Ngày nào cũng mua đồ cho bé. Bé nhà bạn xài dữ ha, hay bạn mua nhiều quá?','7/7 ngày mua đồ cho bé. Thương bé vừa thôi, thương ví bạn nữa nha.'],
        mild:['{hdays} ngày trong tuần mua đồ cho bé. Bé được cưng ghê.','Đồ cho bé mua đều. Nhớ kiểm tra còn dư bao nhiêu trước khi mua thêm nha.']},
  clothes:{strong:['Ngày nào cũng mua quần áo. Tủ đồ của bạn sắp tràn ra phòng rồi nè.','7/7 ngày mua quần áo. Bạn mặc kịp hết không đó?'],
           mild:['{hdays} ngày trong tuần mua quần áo. Tủ đồ than thở rồi đó.','Quần áo mua đều ghê. Mặc cái cũ chưa?']},
  tools:{strong:['Ngày nào cũng mua dụng cụ. Bạn đang xây nhà hay sửa nhà vậy?','7/7 ngày mua dụng cụ. Hộp đồ nghề của bạn nặng hơn cả tui rồi.'],
         mild:['{hdays} ngày trong tuần mua dụng cụ. Cái búa cũ còn chưa dùng mà.','Dụng cụ mua đều ghê. Có việc gì cần sửa hả bạn?']},
  stationery:{strong:['Ngày nào cũng mua văn phòng phẩm. Bút trong nhà nhiều hơn chữ bạn viết rồi.','7/7 ngày mua văn phòng phẩm. Bạn mở tiệm giấy bút hả?'],
              mild:['{hdays} ngày trong tuần mua văn phòng phẩm. Cây bút cũ còn mực đó nha.','Giấy bút mua đều ghê. Viết hết chưa mà mua thêm?']},
  snack:{strong:['Ngày nào cũng mua đồ ăn vặt. Bạn ăn vặt hay ăn chính vậy?','7/7 ngày mua đồ ăn vặt. Bụng bạn có ngăn riêng cho bim bim hả?'],
         mild:['{hdays} ngày trong tuần mua đồ ăn vặt. Nhớ ăn cơm trước nha.','Đồ ăn vặt về đều ghê. Tui cũng thích, nhưng vừa thôi nha.']},
  yarn:{strong:['Ngày nào cũng mua len. Bạn đan áo cho cả xóm hả?','7/7 ngày mua len. Cuộn len nhiều hơn thời gian bạn có để đan đó.'],
        mild:['{hdays} ngày trong tuần mua len. Cuộn cũ còn đan dở kìa bạn.','Len mua đều ghê. Đan xong cái khăn trước đã nha.']},
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

/* Miso on the same day: buying from one category in 2 or more separate purchases today is already too much.
   A purchase is one add by hand, or one whole bill (every line on a bill shares a batch). */
const DAILY_MIN = 2;
const DAILY = {
  drinks:['Hôm nay {dcount} lần mua nước rồi hả? Bạn định biến thành cái hồ nước di động à?','{dcount} lần mua nước trong một ngày. Con mèo như tui còn uống ít hơn bạn đó.','Tui nghe tiếng ùng ục từ đây luôn. Đồ uống {dcount} lần rồi nha bạn.','Đồ uống {dcount} lần trong hôm nay. Bạn chắc không phải đang tích nước như lạc đà chứ?','Ví bạn nhẹ đi, bụng bạn thì nặng lên. {dcount} lần đồ uống hôm nay rồi đó.','Nước lọc ở nhà đang tủi thân vì bạn mua đồ uống {dcount} lần hôm nay.'],
  dairy:['Hôm nay mua sữa & trứng {dcount} lần rồi nha. Một lần là đủ mà bạn.','Sữa & trứng {dcount} lần trong một ngày. Tủ lạnh bạn có kêu không đó?'],
  produce:['Rau củ quả hôm nay mua {dcount} lần rồi. Chăm ghê, nhưng ăn cho hết nha.','{dcount} lần mua rau củ trong một ngày. Bạn đi chợ hay đi dạo vậy?'],
  pantry:['Đồ khô mua {dcount} lần trong hôm nay rồi. Mua một lần cho đủ đi bạn ơi.','{dcount} lần đồ khô trong một ngày. Kệ bếp sắp hết chỗ rồi nè.'],
  meds:['Hôm nay mua thuốc, vitamin {dcount} lần rồi. Bạn khoẻ không đó? Tui hơi lo.','{dcount} lần mua thuốc trong một ngày. Nhớ đọc kỹ liều dùng nha.'],
  care:['Hôm nay mua mỹ phẩm, đồ chăm sóc {dcount} lần rồi. Đẹp vừa thôi nha bạn.','Đồ chăm sóc cá nhân hôm nay mua {dcount} lần rồi. Đẹp vừa thôi nha.','{dcount} lần dầu gội, kem dưỡng trong một ngày. Bạn mở spa hả?'],
  cleaning:['Đồ vệ sinh hôm nay mua {dcount} lần rồi. Nhà có sạch quá đâu mà.','{dcount} lần mua nước giặt, nước lau trong một ngày. Dùng hết cái cũ chưa?'],
  electronics:['Đồ điện tử hôm nay mua {dcount} lần rồi. Ví bạn kêu cứu rồi nè.','{dcount} lần mua đồ điện tử trong một ngày. Bạn bị cuốn vào giỏ hàng rồi.'],
  baby:['Đồ cho bé hôm nay mua {dcount} lần rồi. Thương bé vừa thôi, thương ví bạn nữa.','{dcount} lần mua đồ cho bé trong một ngày. Kiểm tra còn dư bao nhiêu chưa?'],
  clothes:['Quần áo hôm nay mua {dcount} lần rồi. Tủ đồ than thở rồi đó.','{dcount} lần mua quần áo trong một ngày. Mặc kịp hết không bạn?'],
  tools:['Hôm nay mua dụng cụ {dcount} lần rồi. Sửa gì mà nhiều dữ vậy?','{dcount} lần mua dụng cụ trong một ngày. Bạn quên mua đủ một lần hả?'],
  stationery:['Hôm nay mua văn phòng phẩm {dcount} lần rồi. Bút nào cũng viết ra cùng một chữ thôi.','{dcount} lần mua văn phòng phẩm trong một ngày. Bạn học bài hay sưu tầm vậy?'],
  snack:['Hôm nay mua đồ ăn vặt {dcount} lần rồi. Bim bim không tự sinh sôi khi bạn mua thêm đâu nha.','{dcount} lần đồ ăn vặt trong một ngày. Ví bạn đang rỗng như túi bim bim đó.'],
  yarn:['Hôm nay mua len {dcount} lần rồi. Tui sợ bạn bị quấn trong đống len mất.','{dcount} lần mua len trong một ngày. Mèo chỉ muốn lăn len thôi á.'],
  other:['Đồ nhóm Khác hôm nay mua {dcount} lần rồi. Mua gì mà tui không phân loại nổi vậy?','{dcount} lần mua đồ linh tinh trong một ngày. Dừng tay lại nào bạn.']
};
function dailyMany(){
  const day = iso(today()), buys = {};
  state.items.forEach(i => { if(i.cat === 'gift' || i.bought !== day) return; (buys[i.cat] = buys[i.cat] || new Set()).add(i.batch || i.id); });
  let best = null;
  Object.keys(buys).forEach(cat => { const n = buys[cat].size; if(n >= DAILY_MIN && (!best || n > best.count)) best = {cat, count:n}; });
  return best;
}
const dailyLines = d => d ? DAILY[d.cat] : [];

function critique(){
  const t = today(), y = t.getFullYear(), m = t.getMonth(), day = t.getDate();
  const ly = m===0 ? y-1 : y, lm = m===0 ? 11 : m-1;
  const units = (yy,mm,upTo) => state.items.reduce((a,i) => { const d = parseISO(i.bought); return a + (d.getFullYear()===yy && d.getMonth()===mm && d.getDate()<=upTo ? i.qty : 0); }, 0);
  const now = units(y,m,31), prev = units(ly,lm,day);
  const inRoom = state.items.filter(i => !i.used);
  const expired = inRoom.filter(i => status(i)==='expired');
  const lost = expired.reduce((a,i) => a + i.price, 0);
  const habit = weeklyHabit(), daily = dailyMany();
  const F = {dcount:daily ? daily.count : 0, hdays:habit ? habit.days : 0, now, prev, day, inRoom:inRoom.length, expired:expired.length, lost:money(lost), name:expired[0] ? expired[0].name : '', ratio:prev ? String(+(now/prev).toFixed(1)) : ''};
  let tier, mood;
  if(F.expired >= 3){ tier='waste'; mood='horrified'; }
  else if(daily){ tier='daily'; mood = daily.count >= 3 ? 'horrified' : 'judging'; }
  else if(habit){ tier='habit'; mood = habit.days >= 7 ? 'horrified' : 'judging'; }
  else if(F.inRoom >= 24){ tier='hoard'; mood='horrified'; }
  else if(prev > 0 && now >= prev*1.5 && now >= 6){ tier='more'; mood='judging'; }
  else if(F.expired >= 1){ tier='expired'; mood='judging'; }
  else if(now >= 12){ tier='busy'; mood='judging'; }
  else if(now <= 3){ tier='calm'; mood='happy'; }
  else { tier='ok'; mood='neutral'; }
  const L = {
    waste:['{expired} món hết hạn rồi nè bạn ơi. Tủ đồ ăn của bạn sắp thành vườn nấm luôn đó nha.','Hết hạn mất {lost} rồi. Tui xót ví giùm bạn ghê, lần sau ăn sớm sớm nha.','{expired} món bị bỏ quên trong góc. Tụi nó buồn hiu hà, bạn ghé thăm chút đi.'],
    daily: dailyLines(daily),
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
  const justAddedTo = c => !!(reaction && (reaction.kind === 'add' || reaction.kind === 'bulk') && [].concat(reaction.cat || []).indexOf(c) >= 0);
  const useDaily = !!(daily && justAddedTo(daily.cat)), useHabit = !useDaily && !!(habit && justAddedTo(habit.cat));
  if(useDaily) mood = daily.count >= 3 ? 'horrified' : 'judging';
  else if(useHabit) mood = habit.days >= 7 ? 'horrified' : 'judging';
  const pool = (useDaily ? dailyLines(daily) : useHabit ? habitLines(habit) : R) || L, G = reaction ? Object.assign({}, F, {name:reaction.name, n:reaction.n}) : F;
  const line = pool[(t.getDate() + tick) % pool.length].replace(/\{(\w+)\}/g, (_,k) => G[k]);
  return {line, mood, now, prev, inRoom:F.inRoom, habit:habit ? {name:CAT[habit.cat].name, days:habit.days} : null, daily:daily ? {name:CAT[daily.cat].name, count:daily.count} : null};
}
function renderCritic(){
  const c = critique();
  $('#critic').innerHTML = '<button class="av" type="button" id="cat-av" aria-label="Nhờ Miso chê tiếp">'+catSvg(c.mood)+'</button>'+
    '<div class="bubble" lang="vi"><div class="eyebrow">Miso, bé mèo khó tính</div><p>'+esc(c.line)+'</p><div class="meta"><span>Tháng này: <b id="m-now">'+c.now+'</b> món đã mua · <b id="m-room">'+c.inRoom+'</b> món trong phòng · cùng kỳ tháng trước '+c.prev+' món'+(c.daily ? ' · Hôm nay mua <b>'+esc(c.daily.name)+'</b> '+c.daily.count+' lần' : '')+(c.habit ? ' · 7 ngày qua mua <b>'+esc(c.habit.name)+'</b> '+c.habit.days+'/7 ngày' : '')+'</span><button class="btn ghost sm" id="cat-more" type="button">Chê tiếp đi</button></div></div>';
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
      '<div class="bubble" lang="vi"><div class="eyebrow">Misu, bé cún hay lo xa</div><p>'+esc(line)+'</p><div class="meta"><span>Đồ thường hơn 1 tháng; quần áo, len, dụng cụ, văn phòng phẩm hơn 3 tháng; đồ mua tặng thì Misu không nhắc. Món còn hạn dùng thì Misu chỉ hỏi bạn đã dùng chưa.</span><button class="btn ghost sm" id="misu-more" type="button">Nhắc tiếp đi</button></div></div></div>'+
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
  { const dn = $('#dock-n-dormant'); dn.textContent = list.length; dn.hidden = !list.length; }
  const again = () => { misuTick++; misuReaction = null; renderDormant(); const b = $('#misu-more'); if(b) b.focus(); };
  $('#misu-more').addEventListener('click', again); $('#misu-av').addEventListener('click', again);
  const more = $('#d-more'); if(more) more.addEventListener('click', () => { showAllDormant = !showAllDormant; renderDormant(); });
  el.querySelectorAll('[data-touch]').forEach(b => b.addEventListener('click', () => { const it = byId(b.dataset.touch); it.touched = iso(today()); misuReaction = {kind:'touch', name:it.name}; save(); renderAll(); }));
  el.querySelectorAll('[data-snooze]').forEach(b => b.addEventListener('click', () => { const it = byId(b.dataset.snooze); it.snoozed = iso(today()); misuReaction = {kind:'snooze', name:it.name}; save(); renderAll(); toast('Ok, Misu sẽ hỏi lại về '+it.name+' sau 30 ngày nha.'); }));
  el.querySelectorAll('[data-done]').forEach(b => b.addEventListener('click', () => { const it = byId(b.dataset.done); it.used = true; if(sel===it.id) sel = null; misuReaction = {kind:'done', name:it.name}; save(); react('used', it.name); renderAll(); toast(it.name+' đã dùng hết. Tiền mua vẫn được tính trong chi tiêu nha.'); }));
  el.querySelectorAll('[data-dfind]').forEach(b => b.addEventListener('click', () => { sel = b.dataset.dfind; found = sel; renderRoom(); renderInspector(); closeSheets(); room.scrollIntoView({behavior:'smooth', block:'center'}); }));
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
  el.querySelectorAll('.hrow:not(:disabled)').forEach(b => b.addEventListener('click', () => { select(b.dataset.id); closeSheets(); room.scrollIntoView({behavior:'smooth', block:'center'}); }));
  if(refocus){ const f = document.getElementById(refocus); refocus = null; if(f) f.focus(); }
}

function renderRoom(){
  room.querySelectorAll('.item').forEach(n => n.remove());
  $('#empty-room').hidden = state.items.some(i => !i.used);
  if(state.view === '3d' && v3){ sync3D(); return; }
  state.items.filter(i => !i.used).forEach(it => {
    const st = status(it), d = daysLeft(it);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'item st-'+st+(it.id===sel?' sel':'')+((filter && filter!==it.cat) || !inPeriod(it)?' dim':'')+(it.id===justAdded?' pop':'')+(it.id===found?' found':'');
    b.dataset.id = it.id;
    b.style.cssText = 'left:'+it.x+'%;top:'+it.y+'%;--c:'+CAT[it.cat].color+';z-index:'+Math.round(it.y*10);
    b.setAttribute('aria-label', itemLabel(it)+'. Kéo để di chuyển, nhấn giữ hoặc bấm phím D để nhân đôi, phím mũi tên để nhích.');
    const badge = st==='expired' ? '<span class="badge">!</span>' : st==='soon' ? '<span class="badge">'+(d===0?'Today':d+'d')+'</span>' : '';
    const zz = isDormant(it) ? '<span class="zz" title="Nằm im lâu rồi">zZ</span>' : '';
    b.innerHTML = icon(it.cat,'ico')+badge+zz+'<span class="tag">'+esc(it.name)+'</span>';
    room.appendChild(b);
  });
}

const LONG_PRESS_MS = 600;
let drag = null;
const binEl = $('#bin');
binEl.addEventListener('click', () => { if(sel && byId(sel)) trashItem(sel); else toast('Chọn một món trước, hoặc kéo món vào thùng rác nha.'); });
room.addEventListener('pointerdown', e => {
  const el = e.target.closest('.item'); if(!el) return;
  const it = byId(el.dataset.id); if(!it) return;
  drag = {el, it, sx:e.clientX, sy:e.clientY, ox:it.x, oy:it.y, r:room.getBoundingClientRect(), moved:false, pid:e.pointerId};
  const d0 = drag;
  el.classList.add('holding');
  d0.timer = setTimeout(() => {          // press and hold without moving: duplicate
    if(drag !== d0 || d0.moved) return;
    drag = null; el.classList.remove('holding');
    duplicateItem(it.id);
  }, LONG_PRESS_MS);
  try{ el.setPointerCapture(e.pointerId); }catch(_){}
});
room.addEventListener('pointermove', e => {
  if(!drag || e.pointerId !== drag.pid) return;
  const dx = e.clientX-drag.sx, dy = e.clientY-drag.sy;
  if(!drag.moved && Math.hypot(dx,dy) < 5) return;
  if(!drag.moved){ binEl.classList.add('armed'); clearTimeout(drag.timer); drag.el.classList.remove('holding'); }
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
  clearTimeout(d.timer); d.el.classList.remove('holding');
  binEl.classList.remove('armed','over');
  if(d.moved && d.over){ d.it.x = d.ox; d.it.y = d.oy; trashItem(d.it.id); return; }
  if(d.moved) save();
  select(d.it.id);
  if(!d.moved) openSheet('insp');
}
room.addEventListener('contextmenu', e => { if(e.target.closest('.item')) e.preventDefault(); });
room.addEventListener('pointerup', endDrag);
room.addEventListener('pointercancel', endDrag);
room.addEventListener('click', e => {
  const el = e.target.closest('.item');
  if(el && e.detail === 0) { select(el.dataset.id); const n = room.querySelector('[data-id="'+el.dataset.id+'"]'); if(n) n.focus({preventScroll:true}); }
});
room.addEventListener('keydown', e => {
  const el = e.target.closest('.item'); if(!el) return;
  if(e.key === 'd' || e.key === 'D'){ e.preventDefault(); duplicateItem(el.dataset.id, true); return; }
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
    if(isMobile() && $('#sh-insp').classList.contains('open')) closeSheets();
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
        '<button class="btn ghost sm" id="i-dup" type="button">Nhân đôi</button>'+
        '<button class="btn ghost sm" id="i-touch" type="button">Vừa dùng</button>'+
        '<button class="btn ghost sm" id="i-used" type="button">Dùng hết rồi</button>'+
        '<button class="btn danger sm" id="i-del" type="button">Xoá</button>'+
      '</div>'+
    '</div>';
  $('#i-exp').addEventListener('change', e => { it.exp = e.target.value; save(); renderAll(); });
  $('#i-dup').addEventListener('click', () => duplicateItem(it.id));
  $('#i-touch').addEventListener('click', () => { it.touched = iso(today()); misuReaction = {kind:'touch', name:it.name}; save(); renderAll(); toast('Đã ghi nhận bạn vừa dùng '+it.name+'.'); });
  $('#i-used').addEventListener('click', () => { it.used = true; sel = null; save(); react('used', it.name); renderAll(); toast(it.name+' đã dùng hết. Tiền mua vẫn được tính trong chi tiêu nha.'); });
  $('#i-del').addEventListener('click', () => trashItem(it.id));
}

/* ---------- alerts ---------- */
function renderAlerts(){
  const list = attention();
  const exp = list.filter(i => status(i)==='expired').length, soon = list.length-exp;
  $('#bell-count').textContent = list.length;
  { const dn = $('#dock-n-alerts'); dn.textContent = list.length; dn.hidden = !list.length; }
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
    closeSheets(); room.scrollIntoView({behavior:'smooth', block:'center'});
  }));
  setupNotifButton();
}
function jumpAlerts(){ if(openSheet('alerts')) return; $('#alerts').scrollIntoView({behavior:'smooth', block:'start'}); }
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
  closeSheets(); room.scrollIntoView({behavior:'smooth', block:'center'});
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
    const added = [], batch = uid();
    chosen.forEach(r => {
      const spot = freeSpot(), o = {id:uid(), name:r.name.trim(), cat:r.cat, exp:r.exp, price:r.price, qty:r.qty, note:r.note||'', bought:r.bought, x:spot.x, y:spot.y, used:consumed, batch};
      state.items.push(o); added.push(o);
    });
    const hit = applyRebuy(added);
    if(hit.length) react('rebuy', hit[0].b.name, hit.length); else react(chosen.length>1 ? 'bulk' : 'add', chosen[0] ? chosen[0].name : '', chosen.length, chosen.map(r => r.cat));
    save(); filter = null; sel = null; billRows = []; files = []; renderThumbs(); $('#bill-preview').innerHTML = ''; $('#bill-text').value = '';
    renderAll();
    if(hit.length) announceRebuy(hit); else toast(chosen.length+' món '+(consumed?'đã được tính vào chi tiêu.':'đã thêm từ hoá đơn.'));
    closeSheets(); room.scrollIntoView({behavior:'smooth', block:'center'});
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
const addStarter = () => {
  const have = new Set(state.items.filter(i => !i.used).map(i => unaccent(i.name)));
  const add = starter().filter(i => !have.has(unaccent(i.name)));
  if(!add.length){ toast('Mấy món có sẵn đã nằm trong phòng hết rồi nè.'); return; }
  state.items = state.items.concat(add); save(); filter = null; renderAll(); toast('Đã thêm '+add.length+' món có sẵn vào phòng.');
};
const loadSample = () => { state.items = seed(); applyRebuy(state.items); sel = null; filter = null; save(); renderAll(); toast('Đã nạp dữ liệu mẫu nè.'); };
twoStep($('#reset'), 'Bấm lần nữa để thay bằng dữ liệu mẫu', loadSample);
twoStep($('#wipe'), 'Bấm lần nữa để xoá hết', () => { state.items = []; sel = null; filter = null; save(); renderAll(); toast('Đã xoá hết dữ liệu.'); });
$('#load-sample').addEventListener('click', addStarter);
$('#add-starter').addEventListener('click', addStarter);
$('#auto-rebuy').checked = state.autoRebuy !== false;
$('#auto-rebuy').addEventListener('change', e => { state.autoRebuy = e.target.checked; save(); });

/* ---------- 3D view: three.js, loaded the first time you ask for it ---------- */
const THREE_URL = 'vendor/three.min.js';
const RW = 10, RD = 7, RH = 4.2, FW = RW*0.96;
let T = null, v3 = null;
function loadThree(){
  if(window.THREE) return Promise.resolve(window.THREE);
  return new Promise((res, rej) => {
    const sc = document.createElement('script'); sc.src = THREE_URL;
    sc.onload = () => window.THREE ? res(window.THREE) : rej(new Error('three'));
    sc.onerror = () => rej(new Error('load'));
    document.head.appendChild(sc);
  });
}
/* 2D room coordinates (x 0-100, y 0-100) <-> 3D: y >= 44 is floor, above that is the back wall and its shelf */
function toWorld(it){
  const x = (it.x/100 - 0.5)*FW;
  if(it.y >= 44) return [x, 0, -RD/2 + 0.5 + (it.y-44)/52*(RD-0.9)];
  return [x, clamp(2.4 + (16-it.y)*0.06, 0.3, 3.4), -RD/2 + 0.35];
}
const floorToItem = (x, z) => ({x:+clamp((x/FW + 0.5)*100, 4, 96).toFixed(2), y:+clamp(44 + (z - (-RD/2 + 0.5))/(RD-0.9)*52, 44, 96).toFixed(2)});
function pill(x, c, text, fill, cx, cy){
  c.font = '700 24px "DM Sans", system-ui, sans-serif';
  const w = Math.max(40, c.measureText(text).width + 22), h = 38, l = cx - w/2, t = cy - h/2;
  c.fillStyle = fill; c.beginPath(); c.moveTo(l+h/2,t); c.arcTo(l+w,t,l+w,t+h,h/2); c.arcTo(l+w,t+h,l,t+h,h/2); c.arcTo(l,t+h,l,t,h/2); c.arcTo(l,t,l+w,t,h/2); c.closePath(); c.fill();
  c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, cx, cy+1);
}
function badgeOf(it){
  const st = status(it), d = daysLeft(it);
  return st === 'expired' ? {t:'!', c:'#c42b36'} : st === 'soon' ? {t:d === 0 ? 'Hôm nay' : d+'d', c:'#b26a00'} : null;
}
const badgeSig = it => (badgeOf(it) ? badgeOf(it).t : '')+'|'+(isDormant(it) ? 'z' : '');
/* Every category is a small 3D object built from simple shapes */
const hashId = id => { let h = 0; for(let i = 0; i < id.length; i++) h = (h*31 + id.charCodeAt(i)) | 0; return Math.abs(h); };
function disposeObj(o){ o.traverse(c => { if(c.geometry) c.geometry.dispose(); if(c.material){ if(c.material.map) c.material.map.dispose(); c.material.dispose(); } }); }
function buildModel(cat){
  const col = CAT[cat].color, g = new T.Group(), WHITE = 0xffffff, DARK = 0x3d4452;
  const light = (c, k) => new T.Color(c).lerp(new T.Color(0xffffff), k).getHex();
  const add = (geo, c, x, y, z, o) => { const m = new T.Mesh(geo, new T.MeshLambertMaterial(Object.assign({color:c}, o || {}))); m.position.set(x || 0, y || 0, z || 0); g.add(m); return m; };
  const cyl = (rt, rb, h, c, y, x, z) => add(new T.CylinderGeometry(rt, rb, h, 28), c, x, y, z);
  const box = (w, h, d, c, x, y, z) => add(new T.BoxGeometry(w, h, d), c, x, y, z);
  const plane = (w, h, c, x, y, z) => add(new T.PlaneGeometry(w, h), c, x, y, z);
  const disc = (r, c, x, y, z) => add(new T.CircleGeometry(r, 20), c, x, y, z);
  if(cat === 'produce'){                       // apple
    add(new T.SphereGeometry(0.5, 28, 20), col, 0, 0.5, 0).scale.set(1, 0.92, 1);
    cyl(0.04, 0.05, 0.22, 0x6b4a2b, 1.02);
    const leaf = add(new T.SphereGeometry(0.16, 12, 8), 0x4c9a3f, 0.15, 1.08, 0); leaf.scale.set(1.6, 0.35, 0.8); leaf.rotation.z = 0.4;
  }else if(cat === 'dairy'){                   // milk carton
    box(0.72, 0.9, 0.72, col, 0, 0.45, 0);
    plane(0.46, 0.4, WHITE, 0, 0.45, 0.365); disc(0.09, col, 0, 0.45, 0.367);
    const geo = new T.CylinderGeometry(0.4, 0.4, 0.72, 3); geo.rotateZ(Math.PI/2); geo.rotateX(-Math.PI/2);
    const roof = add(geo, light(col, 0.12), 0, 1.01, 0); roof.scale.y = 0.55;
    box(0.26, 0.1, 0.14, WHITE, 0, 1.27, 0);
  }else if(cat === 'drinks'){                  // bottle
    cyl(0.3, 0.3, 0.7, col, 0.35); cyl(0.13, 0.3, 0.22, col, 0.81); cyl(0.13, 0.13, 0.25, col, 1.04); cyl(0.15, 0.15, 0.12, 0x3b3b3b, 1.22);
    cyl(0.305, 0.305, 0.3, WHITE, 0.4);
  }else if(cat === 'pantry'){                  // can
    cyl(0.4, 0.4, 0.9, col, 0.45); cyl(0.42, 0.42, 0.07, new T.Color(col).multiplyScalar(0.7).getHex(), 0.9); cyl(0.42, 0.42, 0.07, new T.Color(col).multiplyScalar(0.7).getHex(), 0.035);
    cyl(0.405, 0.405, 0.45, WHITE, 0.45);
  }else if(cat === 'meds'){                    // pill bottle
    cyl(0.32, 0.32, 0.8, col, 0.4); cyl(0.36, 0.36, 0.25, 0xf1f3f5, 0.93); cyl(0.325, 0.325, 0.42, WHITE, 0.4);
    box(0.28, 0.07, 0.02, col, 0, 0.4, 0.335); box(0.07, 0.28, 0.02, col, 0, 0.4, 0.335);
  }else if(cat === 'care'){                    // pump bottle + lipstick + compact
    const bt = new T.Group(); bt.position.set(0.25, 0, -0.05); bt.scale.setScalar(0.88); g.add(bt);
    const bm = (geo, c, x, y, z) => { const o = new T.Mesh(geo, new T.MeshLambertMaterial({color:c})); o.position.set(x, y, z); bt.add(o); return o; };
    bm(new T.CylinderGeometry(0.32, 0.32, 0.78, 28), col, 0, 0.39, 0); bm(new T.CylinderGeometry(0.16, 0.32, 0.15, 28), col, 0, 0.855, 0); bm(new T.CylinderGeometry(0.07, 0.07, 0.18, 16), DARK, 0, 1.0, 0);
    bm(new T.BoxGeometry(0.3, 0.1, 0.14), DARK, 0.05, 1.12, 0); bm(new T.BoxGeometry(0.16, 0.05, 0.05), DARK, 0.22, 1.14, 0); bm(new T.PlaneGeometry(0.4, 0.32), WHITE, 0, 0.4, 0.325);
    cyl(0.12, 0.12, 0.4, DARK, 0.2, -0.52, -0.02); cyl(0.127, 0.127, 0.1, 0xf2b705, 0.45, -0.52, -0.02);
    cyl(0.095, 0.095, 0.24, 0xe64980, 0.62, -0.52, -0.02); add(new T.ConeGeometry(0.095, 0.13, 16), 0xe64980, -0.52, 0.8, -0.02);
    cyl(0.3, 0.3, 0.1, 0xe64980, 0.05, -0.15, 0.42); cyl(0.25, 0.25, 0.03, 0xffffff, 0.115, -0.15, 0.42);
  }else if(cat === 'cleaning'){                // spray bottle
    box(0.6, 0.75, 0.42, col, 0, 0.375, 0); cyl(0.1, 0.12, 0.18, DARK, 0.84, 0.05, 0);
    box(0.55, 0.28, 0.3, DARK, 0.05, 1.07, 0); const tr = box(0.07, 0.3, 0.07, DARK, 0.32, 0.92, 0); tr.rotation.z = 0.4;
    plane(0.4, 0.3, WHITE, 0, 0.38, 0.215);
  }else if(cat === 'electronics'){             // laptop
    box(1.0, 0.07, 0.72, 0xa6b0be, 0, 0.035, 0.05); box(0.84, 0.012, 0.4, 0x6a7585, 0, 0.075, 0.08);
    const lid = new T.Group(); lid.position.set(0, 0.07, -0.3); lid.rotation.x = -0.32; g.add(lid);
    const back = new T.Mesh(new T.BoxGeometry(1.0, 0.68, 0.06), new T.MeshLambertMaterial({color:DARK})); back.position.y = 0.34; lid.add(back);
    const scr = new T.Mesh(new T.PlaneGeometry(0.88, 0.56), new T.MeshLambertMaterial({color:col, emissive:col, emissiveIntensity:0.45})); scr.position.set(0, 0.34, 0.032); lid.add(scr);
  }else if(cat === 'baby'){                    // diaper pack
    box(0.9, 1.0, 0.5, col, 0, 0.5, 0); add(new T.TorusGeometry(0.22, 0.045, 8, 18, Math.PI), 0x4a4a4a, 0, 1.0, 0);
    plane(0.62, 0.46, WHITE, 0, 0.55, 0.255); disc(0.14, col, 0, 0.55, 0.257); box(0.9, 0.14, 0.51, light(col, 0.55), 0, 0.12, 0);
  }else if(cat === 'clothes'){                 // t-shirt
    const sh = new T.Shape(); [[-0.38,0],[0.38,0],[0.38,0.62],[0.75,0.52],[0.62,0.84],[0.28,0.96],[0.14,0.98],[0,0.86],[-0.14,0.98],[-0.28,0.96],[-0.62,0.84],[-0.75,0.52],[-0.38,0.62]].forEach((p, i) => i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1]));
    const geo = new T.ExtrudeGeometry(sh, {depth:0.16, bevelEnabled:false}); geo.translate(0, 0, -0.08);
    const tee = add(geo, col, 0, 0.02, 0); tee.scale.set(0.95, 0.95, 1);
    box(0.2, 0.2, 0.02, light(col, 0.4), 0.2, 0.52, 0.085);
  }else if(cat === 'gift'){                    // gift box with a bow
    box(0.9, 0.7, 0.9, col, 0, 0.35, 0); box(1.0, 0.2, 1.0, light(col, 0.15), 0, 0.8, 0);
    box(0.16, 0.72, 0.92, WHITE, 0, 0.36, 0); box(0.92, 0.72, 0.16, WHITE, 0, 0.36, 0);
    box(0.16, 0.22, 1.02, WHITE, 0, 0.8, 0); box(1.02, 0.22, 0.16, WHITE, 0, 0.8, 0);
    const b1 = add(new T.SphereGeometry(0.16, 14, 10), WHITE, -0.14, 1.0, 0); b1.scale.set(1.3, 0.75, 0.7); b1.rotation.z = 0.5;
    const b2 = add(new T.SphereGeometry(0.16, 14, 10), WHITE, 0.14, 1.0, 0); b2.scale.set(1.3, 0.75, 0.7); b2.rotation.z = -0.5;
    add(new T.SphereGeometry(0.07, 10, 8), WHITE, 0, 0.98, 0);
  }else if(cat === 'tools'){                   // toolbox
    box(0.95, 0.42, 0.5, col, 0, 0.21, 0); box(0.97, 0.14, 0.52, light(col, 0.2), 0, 0.49, 0);
    add(new T.TorusGeometry(0.2, 0.04, 8, 16, Math.PI), DARK, 0, 0.56, 0);
    box(0.12, 0.1, 0.04, 0xf2b705, -0.3, 0.4, 0.27); box(0.12, 0.1, 0.04, 0xf2b705, 0.3, 0.4, 0.27);
  }else if(cat === 'stationery'){              // pencil cup
    cyl(0.32, 0.28, 0.55, col, 0.275);
    [[-0.13, 0.08, 0xe03131, 0.22], [0.04, -0.1, 0x1971c2, -0.12], [0.15, 0.1, 0xf59f00, 0.14]].forEach(a => {
      const pg = new T.Group(); pg.position.set(a[0], 0.5, a[1]); pg.rotation.z = a[3]; g.add(pg);
      const pen = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 0.7, 10), new T.MeshLambertMaterial({color:a[2]})); pen.position.y = 0.35; pg.add(pen);
      const tip = new T.Mesh(new T.ConeGeometry(0.04, 0.1, 10), new T.MeshLambertMaterial({color:0xf5d9b0})); tip.position.y = 0.75; pg.add(tip);
    });
  }else if(cat === 'yarn'){                    // ball of yarn with needles
    add(new T.SphereGeometry(0.45, 24, 18), col, 0, 0.45, 0);
    [0.2, 0.8, 1.4].forEach(r => { const t = add(new T.TorusGeometry(0.455, 0.02, 6, 32), light(col, 0.45), 0, 0.45, 0); t.rotation.set(r, r*0.7, 0); });
    const n1 = cyl(0.025, 0.025, 1.15, 0xc8a572, 0.85, 0.12, 0); n1.rotation.z = 0.55; const n2 = cyl(0.025, 0.025, 1.15, 0xc8a572, 0.85, 0.12, 0); n2.rotation.z = -0.2;
  }else if(cat === 'snack'){                   // bag of chips + a wrapped sweet
    box(0.78, 1.0, 0.3, col, 0, 0.5, 0); box(0.8, 0.1, 0.34, new T.Color(col).multiplyScalar(0.72).getHex(), 0, 0.96, 0); box(0.8, 0.08, 0.34, new T.Color(col).multiplyScalar(0.72).getHex(), 0, 0.04, 0);
    disc(0.21, WHITE, 0, 0.5, 0.152); disc(0.12, light(col, 0.15), 0, 0.5, 0.154);
    const sw = add(new T.SphereGeometry(0.11, 12, 10), 0xffd43b, 0.62, 0.11, 0.18); sw.scale.x = 1.3;
    add(new T.ConeGeometry(0.08, 0.14, 10), 0xffd43b, 0.76, 0.11, 0.18).rotation.z = -Math.PI/2; add(new T.ConeGeometry(0.08, 0.14, 10), 0xffd43b, 0.48, 0.11, 0.18).rotation.z = Math.PI/2;
  }else{                                       // other: a parcel
    box(0.9, 0.9, 0.9, col, 0, 0.45, 0); box(0.22, 0.02, 0.92, light(col, 0.55), 0, 0.905, 0); box(0.22, 0.9, 0.02, light(col, 0.55), 0, 0.45, 0.451);
  }
  return g;
}
function badgeCanvas(it){
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d'), b = badgeOf(it);
  if(b) pill(x, x, b.t, b.c, isDormant(it) ? 170 : 128, 64);
  if(isDormant(it)) pill(x, x, 'zZ', '#6c86ad', b ? 66 : 128, 64);
  return c;
}
function canvasTex(w, h, draw){
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new T.CanvasTexture(c); t.anisotropy = 4; return t;
}
function buildRoomMeshes(){
  const r = roomLook(), p = ROOMS.find(x => x.id === r.preset) || ROOMS[0], V = p.v;
  if(v3.group){ v3.scene.remove(v3.group); v3.group.traverse(o => { if(o.geometry) o.geometry.dispose(); if(o.material){ if(o.material.map) o.material.map.dispose(); o.material.dispose(); } }); }
  const g = new T.Group(), L = (c, o) => new T.MeshLambertMaterial(Object.assign({color:c}, o || {}));
  const box = (w, h, d, c, x, y, z) => { const m = new T.Mesh(new T.BoxGeometry(w,h,d), L(c)); m.position.set(x,y,z); g.add(m); return m; };
  const shade = (hex, k) => '#'+new T.Color(hex).multiplyScalar(k).getHexString();
  // floor with planks
  const floorTex = canvasTex(1024, 720, (x, w, h) => {
    x.fillStyle = V['--floor']; x.fillRect(0,0,w,h); x.strokeStyle = V['--floor-line']; x.lineWidth = 3;
    for(let i = 0; i <= 8; i++){ x.beginPath(); x.moveTo(0, i*h/8); x.lineTo(w, i*h/8); x.stroke(); }
    for(let i = 0; i < 8; i++){ for(let j = 0; j < 4; j++){ const px = ((i % 2) ? 128 : 0) + j*256 + 128*0; x.beginPath(); x.moveTo(px, i*h/8); x.lineTo(px, (i+1)*h/8); x.stroke(); } }
  });
  const floor = new T.Mesh(new T.PlaneGeometry(RW, RD), L(0xffffff, {map:floorTex})); floor.rotation.x = -Math.PI/2; g.add(floor);
  box(RW+0.3, 0.3, RD+0.3, shade(V['--floor-line'], 0.9), 0, -0.17, 0);
  // walls
  const wallTex = canvasTex(1024, 430, (x, w, h) => { x.fillStyle = V['--wall']; x.fillRect(0,0,w,h); x.fillStyle = V['--wall-2']; x.globalAlpha = 0.4; x.fillRect(0,0,w,h*0.17); x.globalAlpha = 1; });
  const back = new T.Mesh(new T.PlaneGeometry(RW, RH), new T.MeshBasicMaterial({map:wallTex})); back.position.set(0, RH/2, -RD/2); g.add(back);
  const sideMat = new T.MeshBasicMaterial({color:shade(V['--wall'], 0.88)});
  const left = new T.Mesh(new T.PlaneGeometry(RD, RH), sideMat); left.rotation.y = Math.PI/2; left.position.set(-RW/2, RH/2, 0); g.add(left);
  const right = new T.Mesh(new T.PlaneGeometry(RD, RH), sideMat); right.rotation.y = -Math.PI/2; right.position.set(RW/2, RH/2, 0); g.add(right);
  box(RW, 0.2, 0.1, V['--base'], 0, 0.1, -RD/2+0.05); box(0.1, 0.2, RD, V['--base'], -RW/2+0.05, 0.1, 0); box(0.1, 0.2, RD, V['--base'], RW/2-0.05, 0.1, 0);
  if(r.mode === 'image'){                       // your photo becomes the back wall
    const img = lsGet(KEY_IMG);
    if(img){ const im = new Image(); im.onload = () => {
      const c = document.createElement('canvas'); c.width = 1600; c.height = Math.round(1600*RH/RW); const x = c.getContext('2d');
      const k = Math.max(c.width/im.width, c.height/im.height), w = im.width*k, h = im.height*k; x.drawImage(im, (c.width-w)/2, (c.height-h)/2, w, h);
      x.fillStyle = 'rgba(255,255,255,'+(r.veil/100)+')'; x.fillRect(0,0,c.width,c.height);
      const t = new T.CanvasTexture(c); back.material.map.dispose(); back.material.map = t; back.material.needsUpdate = true; v3.needs = true;
    }; im.src = img; }
  }
  // window, picture, shelf
  box(2.3, 1.8, 0.08, V['--frame'], -3.1, 2.55, -RD/2+0.05);
  const glass = new T.Mesh(new T.PlaneGeometry(2.0, 1.5), new T.MeshBasicMaterial({color:V['--glass']})); glass.position.set(-3.1, 2.55, -RD/2+0.1); g.add(glass);
  box(0.07, 1.5, 0.05, V['--frame'], -3.1, 2.55, -RD/2+0.12); box(2.0, 0.07, 0.05, V['--frame'], -3.1, 2.55, -RD/2+0.12);
  const beam = new T.Mesh(new T.PlaneGeometry(1.9, 3.2), new T.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.16})); beam.rotation.x = -Math.PI/2; beam.position.set(-3.0, 0.02, -1.3); g.add(beam);
  box(1.3, 1.0, 0.06, V['--frame'], 0.5, 3.0, -RD/2+0.04);
  const pic = new T.Mesh(new T.PlaneGeometry(1.1, 0.8), new T.MeshBasicMaterial({map:canvasTex(220,160,(x,w,h) => { x.fillStyle = V['--wall-2']; x.fillRect(0,0,w,h); x.fillStyle = V['--rug']; x.beginPath(); x.moveTo(0,h); x.lineTo(60,60); x.lineTo(105,105); x.lineTo(150,50); x.lineTo(w,h); x.fill(); })})); pic.position.set(0.5, 3.0, -RD/2+0.08); g.add(pic);
  const shelfX = (0.795-0.5)*FW; box(2.5, 0.12, 0.55, V['--floor-line'], shelfX, 2.34, -RD/2+0.3); box(0.1, 0.5, 0.35, V['--floor-line'], shelfX-1.0, 2.05, -RD/2+0.2); box(0.1, 0.5, 0.35, V['--floor-line'], shelfX+1.0, 2.05, -RD/2+0.2);
  // rug and plant
  const rug = new T.Mesh(new T.CircleGeometry(1, 48), L(V['--rug'])); rug.rotation.x = -Math.PI/2; rug.scale.set(2.5, 1.5, 1); rug.position.set(0.2, 0.012, 0.9); g.add(rug);
  const pot = new T.Mesh(new T.CylinderGeometry(0.35, 0.28, 0.6, 20), L(0xb96a4a)); pot.position.set(4.2, 0.3, -2.6); g.add(pot);
  [[0,0.55,0,0.45],[0.2,0.9,0.1,0.38],[-0.2,0.85,-0.1,0.36],[0,1.2,0,0.3]].forEach(a => { const l = new T.Mesh(new T.SphereGeometry(a[3], 14, 10), L(0x4c9a3f)); l.position.set(4.2+a[0], 0.3+a[1], -2.6+a[2]); l.scale.y = 1.35; g.add(l); });
  v3.group = g; v3.scene.add(g);
  room.style.background = 'linear-gradient(180deg,'+V['--wall-2']+','+V['--base']+')';
  v3.needs = true;
}
function placeCamera(){
  const q = v3, cp = Math.cos(q.pitch);
  q.camera.position.set(q.target.x + q.radius*Math.sin(q.yaw)*cp, q.target.y + q.radius*Math.sin(q.pitch), q.target.z + q.radius*Math.cos(q.yaw)*cp);
  q.camera.lookAt(q.target); q.needs = true;
}
function resize3D(){
  if(!v3) return;
  const w = room.clientWidth, h = room.clientHeight; if(!w || !h) return;
  v3.renderer.setSize(w, h, false); v3.camera.aspect = w/h; v3.camera.updateProjectionMatrix(); v3.needs = true;
}
function makeItemGroup(it){
  const grp = new T.Group();
  const shadow = new T.Mesh(new T.CircleGeometry(0.55, 24), new T.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.2, depthWrite:false}));
  shadow.rotation.x = -Math.PI/2; shadow.position.y = 0.02; shadow.scale.set(1, 0.65, 1); shadow.raycast = () => {}; grp.add(shadow);
  const sp = new T.Sprite(new T.SpriteMaterial({transparent:true, depthTest:false})); sp.scale.set(1.5, 0.75, 1); sp.position.y = 1.75; sp.renderOrder = 4; sp.raycast = () => {}; sp.visible = false; grp.add(sp);
  grp.userData = {id:it.id, sp, shadow, model:null, cat:'', sig:null, dim:false};
  v3.items.add(grp); v3.map.set(it.id, grp); return grp;
}
function sync3D(){
  if(!v3 || state.view !== '3d') return;
  const live = state.items.filter(i => !i.used), keep = new Set();
  live.forEach(it => {
    keep.add(it.id);
    const grp = v3.map.get(it.id) || makeItemGroup(it), u = grp.userData;
    if(u.cat !== it.cat){
      if(u.model){ grp.remove(u.model); disposeObj(u.model); }
      u.model = buildModel(it.cat); u.model.rotation.y = ((hashId(it.id) % 100)/100 - 0.5)*0.8; u.cat = it.cat; u.dim = false; grp.add(u.model);
    }
    if(!(v3.drag && v3.drag.moved && v3.drag.id === it.id)){ const w = toWorld(it); grp.position.set(w[0], w[1], w[2]); u.shadow.position.y = 0.02 - w[1]; }
    const dim = (filter && filter !== it.cat) || !inPeriod(it);
    if(dim !== u.dim){ u.dim = dim; u.model.traverse(o => { if(o.material){ o.material.transparent = dim; o.material.opacity = dim ? 0.25 : 1; o.material.needsUpdate = true; } }); u.sp.material.opacity = dim ? 0.25 : 1; }
    u.model.scale.setScalar(sel === it.id ? 1.12 : 1);
    const sig = badgeSig(it);
    if(sig !== u.sig){
      u.sig = sig; const has = !!badgeOf(it) || isDormant(it); u.sp.visible = has;
      if(has){ const tex = new T.CanvasTexture(badgeCanvas(it)); if(u.sp.material.map) u.sp.material.map.dispose(); u.sp.material.map = tex; u.sp.material.needsUpdate = true; }
    }
  });
  v3.map.forEach((grp, id) => { if(!keep.has(id)){ v3.items.remove(grp); disposeObj(grp); v3.map.delete(id); } });
  const s = sel && byId(sel);
  if(s && !s.used){ const w = toWorld(s); v3.ring.position.set(w[0], w[1]+0.03, w[2]); v3.ring.visible = true; } else v3.ring.visible = false;
  v3.needs = true;
}
function ndc(e){
  const r = v3.renderer.domElement.getBoundingClientRect();
  return new T.Vector2(((e.clientX-r.left)/r.width)*2 - 1, -((e.clientY-r.top)/r.height)*2 + 1);
}
function pick3D(e){
  v3.ray.setFromCamera(ndc(e), v3.camera);
  const hits = v3.ray.intersectObjects(Array.from(v3.map.values()), true);
  for(const h of hits){ let o = h.object; while(o && !(o.userData && o.userData.id)) o = o.parent; if(o) return o.userData.id; }
  return null;
}
function floorPoint(e){
  v3.ray.setFromCamera(ndc(e), v3.camera);
  const pt = new T.Vector3(); return v3.ray.ray.intersectPlane(v3.plane, pt) ? pt : null;
}
function updateTag3D(){
  const tag = $('#tag3d'), id = v3 && (v3.hover || sel), it = id && byId(id);
  if(!it || it.used || !v3 || state.view !== '3d'){ tag.hidden = true; return; }
  const w = toWorld(it), v = new T.Vector3(w[0], w[1] + 2.2, w[2]).project(v3.camera);
  tag.hidden = false; tag.textContent = it.name; tag.style.left = ((v.x*0.5 + 0.5)*room.clientWidth)+'px'; tag.style.top = ((-v.y*0.5 + 0.5)*room.clientHeight)+'px';
}
function build3D(){
  const host = $('#room3d'), canvas = host.querySelector('canvas');
  const renderer = new T.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setClearColor(0x000000, 0);
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(38, 1.6, 0.1, 100);
  scene.add(new T.AmbientLight(0xffffff, 0.64)); const dl = new T.DirectionalLight(0xffffff, 0.4); dl.position.set(-4, 8, 6); scene.add(dl);
  v3 = {renderer, scene, camera, yaw:0, pitch:0.5, radius:12.5, target:new T.Vector3(0, 1.0, 0.3), ray:new T.Raycaster(), plane:new T.Plane(new T.Vector3(0,1,0), 0),
        items:new T.Group(), map:new Map(), needs:true, drag:null, orbit:null, hover:null, raf:0, timer:0};
  scene.add(v3.items);
  v3.ring = new T.Mesh(new T.RingGeometry(0.5, 0.62, 40), new T.MeshBasicMaterial({color:0x07877d, side:T.DoubleSide, transparent:true, opacity:0.95, depthTest:false}));
  v3.ring.rotation.x = -Math.PI/2; v3.ring.visible = false; v3.ring.renderOrder = 5; scene.add(v3.ring);
  buildRoomMeshes(); placeCamera(); resize3D(); new ResizeObserver(resize3D).observe(room);

  canvas.addEventListener('pointerdown', e => {
    const id = pick3D(e); canvas.setPointerCapture(e.pointerId);
    if(id){
      const it = byId(id), d = v3.drag = {id, sx:e.clientX, sy:e.clientY, ox:it.x, oy:it.y, moved:false, pid:e.pointerId, over:false};
      clearTimeout(v3.timer);
      v3.timer = setTimeout(() => { if(v3.drag === d && !d.moved){ v3.drag = null; duplicateItem(id); } }, LONG_PRESS_MS);
    }else v3.orbit = {sx:e.clientX, sy:e.clientY, yaw:v3.yaw, pitch:v3.pitch, pid:e.pointerId};
  });
  canvas.addEventListener('pointermove', e => {
    const d = v3.drag, o = v3.orbit;
    if(d && e.pointerId === d.pid){
      if(!d.moved && Math.hypot(e.clientX-d.sx, e.clientY-d.sy) < 5) return;
      if(!d.moved){ d.moved = true; clearTimeout(v3.timer); binEl.classList.add('armed'); }
      const pt = floorPoint(e), it = byId(d.id);
      if(pt && it){
        const m = floorToItem(pt.x, pt.z); it.x = m.x; it.y = m.y;
        const grp = v3.map.get(d.id), w = toWorld(it); grp.position.set(w[0], 0, w[2]); grp.userData.shadow.position.y = 0.02; v3.ring.position.set(w[0], 0.03, w[2]); v3.ring.visible = true; v3.needs = true;
      }
      const br = binEl.getBoundingClientRect(), pad = 12;
      d.over = e.clientX >= br.left-pad && e.clientX <= br.right+pad && e.clientY >= br.top-pad && e.clientY <= br.bottom+pad;
      binEl.classList.toggle('over', d.over);
    }else if(o && e.pointerId === o.pid){
      v3.yaw = clamp(o.yaw - (e.clientX-o.sx)*0.006, -0.75, 0.75); v3.pitch = clamp(o.pitch + (e.clientY-o.sy)*0.004, 0.2, 1.05); placeCamera();
    }else{
      const id = pick3D(e); if(id !== v3.hover){ v3.hover = id; canvas.style.cursor = id ? 'pointer' : 'grab'; }
    }
  });
  const end = e => {
    clearTimeout(v3.timer); const d = v3.drag; v3.drag = null; v3.orbit = null; binEl.classList.remove('armed','over');
    if(!d || e.pointerId !== d.pid) return;
    const it = byId(d.id); if(!it) return;
    if(d.moved && d.over){ it.x = d.ox; it.y = d.oy; trashItem(d.id); return; }
    if(d.moved) save();
    select(d.id);
    if(!d.moved) openSheet('insp');
  };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('wheel', e => { e.preventDefault(); v3.radius = clamp(v3.radius*(1 + Math.sign(e.deltaY)*0.08), 8, 16); placeCamera(); }, {passive:false});
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  const loop = () => { if(state.view !== '3d'){ v3.raf = 0; return; } v3.raf = requestAnimationFrame(loop); if(v3.needs){ v3.needs = false; v3.renderer.render(v3.scene, v3.camera); } updateTag3D(); };
  v3.loop = loop;
  return v3;
}
function show3D(on){
  $('#room3d').hidden = !on; room.classList.toggle('is3d', on);
  $('#v3d-btn').textContent = on ? 'Xem 2D' : 'Xem 3D'; $('#v3d-btn').setAttribute('aria-pressed', String(on));
  $('#v3d-reset').hidden = !on; $('#tag3d').hidden = true;
  room.querySelector('.hint').textContent = on ? 'Kéo vào chỗ trống để xoay phòng, cuộn để zoom. Kéo món để dời, nhấn giữ để nhân đôi.' : 'Kéo món đi đâu cũng được. Nhấn giữ để nhân đôi. Thả vào thùng rác để xoá.';
  if(!on) room.style.background = '';
}
async function enter3D(){
  const btn = $('#v3d-btn'); btn.disabled = true; btn.textContent = 'Đang tải 3D…';
  try{
    T = await loadThree();
    if(!v3) build3D();
  }catch(e){
    v3 = null; state.view = '2d'; btn.disabled = false; btn.textContent = 'Xem 3D';
    toast('Chưa mở được phòng 3D. Lần đầu bạn cần có mạng, và trình duyệt cần hỗ trợ WebGL nha.'); return;
  }
  btn.disabled = false; state.view = '3d'; save(); show3D(true); applyRoom(); resize3D(); renderRoom();
  if(!v3.raf) v3.loop();
}
function leave3D(){ state.view = '2d'; save(); show3D(false); applyRoom(); renderRoom(); }
$('#v3d-btn').addEventListener('click', () => { if(state.view === '3d') leave3D(); else enter3D(); });
$('#v3d-reset').addEventListener('click', () => { if(!v3) return; v3.yaw = 0; v3.pitch = 0.5; v3.radius = 12.5; placeCamera(); });

/* ---------- room look: ready-made rooms, or your own photo ---------- */
const KEY_IMG = 'phongtrudo.roomimg';
const ROOMS = [
  {id:'sang',     name:'Phòng sáng',    v:{'--wall':'#c4e5ff','--wall-2':'#aedaff','--base':'#ffffff','--floor':'#f6dcae','--floor-line':'#e8c690','--rug':'#7fd6c8','--glass':'#e3f4ff','--frame':'#ffffff','--shadow':'rgba(110,70,20,.22)'}},
  {id:'bacha',    name:'Bạc hà mát',    v:{'--wall':'#cdf0e1','--wall-2':'#b6e6d1','--base':'#ffffff','--floor':'#ead9b6','--floor-line':'#dac79a','--rug':'#f4a5b8','--glass':'#e3f7ff','--frame':'#ffffff','--shadow':'rgba(80,70,30,.22)'}},
  {id:'hong',     name:'Hồng kẹo',      v:{'--wall':'#ffd9e6','--wall-2':'#ffc6da','--base':'#ffffff','--floor':'#f4dcc8','--floor-line':'#e6c6ae','--rug':'#b9a7f5','--glass':'#fde9f3','--frame':'#ffffff','--shadow':'rgba(120,60,70,.22)'}},
  {id:'go',       name:'Gỗ ấm',         v:{'--wall':'#ecd0a8','--wall-2':'#dfbc8e','--base':'#fff5e6','--floor':'#bb8050','--floor-line':'#a46b3b','--rug':'#c9605a','--glass':'#d9eefa','--frame':'#fff5e6','--shadow':'rgba(60,30,10,.32)'}},
  {id:'hoanghon', name:'Hoàng hôn',     v:{'--wall':'#ffd3a6','--wall-2':'#ffb98a','--base':'#fff3e3','--floor':'#e6bb92','--floor-line':'#d3a579','--rug':'#8f74d6','--glass':'#ffd9a8','--frame':'#fff3e3','--shadow':'rgba(110,50,20,.28)'}},
  {id:'dem',      name:'Đêm yên tĩnh',  v:{'--wall':'#2f3a63','--wall-2':'#252e52','--base':'#46538a','--floor':'#4a3d33','--floor-line':'#3a2f27','--rug':'#7a63d6','--glass':'#1c2650','--frame':'#5d6aa0','--shadow':'rgba(0,0,0,.45)'}}
];
const roomLook = () => Object.assign({mode:'preset', preset:'sang', veil:25}, state.room || {});
function applyRoom(){
  const r = roomLook(), p = ROOMS.find(x => x.id === r.preset) || ROOMS[0];
  Object.keys(p.v).forEach(k => room.style.setProperty(k, p.v[k]));
  const img = r.mode === 'image' ? lsGet(KEY_IMG) : '';
  const layer = $('#room-img'), veil = $('#room-veil'), bg = room.querySelector('svg.bg');
  if(img){ layer.style.backgroundImage = 'url("'+img+'")'; layer.hidden = false; veil.hidden = false; veil.style.opacity = r.veil/100; bg.style.visibility = 'hidden'; }
  else { layer.hidden = true; veil.hidden = true; layer.style.backgroundImage = ''; bg.style.visibility = ''; }
  if(v3 && state.view === '3d') buildRoomMeshes();
  renderRoomStyle();
}
function renderRoomStyle(){
  const r = roomLook(), img = lsGet(KEY_IMG), box = $('#swatches');
  box.innerHTML = '';
  const mk = (id, name, paint, checked) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'sw'; b.dataset.id = id;
    b.setAttribute('role','radio'); b.setAttribute('aria-checked', String(checked));
    const prev = document.createElement('span'); prev.className = 'sw-prev'; prev.style.background = paint;
    const lab = document.createElement('span'); lab.textContent = name;
    b.append(prev, lab);
    b.addEventListener('click', () => {
      state.room = id === '_img' ? Object.assign(roomLook(), {mode:'image'}) : Object.assign(roomLook(), {mode:'preset', preset:id});
      save(); applyRoom();
    });
    box.appendChild(b);
  };
  ROOMS.forEach(p => mk(p.id, p.name, 'linear-gradient(180deg,'+p.v['--wall']+' 0 52%,'+p.v['--floor']+' 52% 100%)', r.mode === 'preset' && r.preset === p.id));
  if(img) mk('_img', 'Ảnh của bạn', 'center / cover url("'+img+'")', r.mode === 'image');
  $('#rs-remove').hidden = !img; $('#rs-veil-wrap').hidden = !(img && r.mode === 'image'); $('#rs-veil').value = r.veil;
}
const rsStatus = t => { $('#rs-status').textContent = t || ''; };
$('#rs-open').addEventListener('click', () => {
  if(openSheet('rs')) return;
  const panel = $('#room-style'), open = panel.hidden;
  panel.hidden = !open; $('#rs-open').setAttribute('aria-expanded', String(open));
  if(open) panel.scrollIntoView({behavior:'smooth', block:'nearest'});
});
$('#rs-close').addEventListener('click', () => { $('#room-style').hidden = true; $('#rs-open').setAttribute('aria-expanded','false'); $('#rs-open').focus(); });
$('#rs-pick').addEventListener('click', () => $('#rs-file').click());
$('#rs-file').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if(!f) return;
  if(!/^image\//.test(f.type)){ rsStatus('Tệp này không phải ảnh. Bạn chọn ảnh JPG, PNG hoặc WebP nha.'); return; }
  try{
    const bmp = await createImageBitmap(f), sc = Math.min(1, 1600/Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width*sc); c.height = Math.round(bmp.height*sc);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const data = c.toDataURL('image/jpeg', 0.82);
    try{ localStorage.setItem(KEY_IMG, data); }catch(err){ rsStatus('Ảnh hơi nặng để lưu trên máy này. Bạn thử ảnh nhỏ hơn nha.'); return; }
    state.room = Object.assign(roomLook(), {mode:'image'}); save(); applyRoom();
    rsStatus('Đã đổi nền phòng sang ảnh của bạn. Kéo thanh "Làm dịu ảnh" nếu đồ trong phòng khó nhìn nha.');
  }catch(err){ rsStatus('Chưa đọc được ảnh này. Bạn thử ảnh JPG hoặc PNG khác nha.'); }
});
$('#rs-remove').addEventListener('click', () => {
  try{ localStorage.removeItem(KEY_IMG); }catch(e){}
  if(roomLook().mode === 'image') state.room = Object.assign(roomLook(), {mode:'preset'});
  save(); applyRoom(); rsStatus('Đã xoá ảnh.');
});
$('#rs-veil').addEventListener('input', e => { state.room = Object.assign(roomLook(), {veil:+e.target.value}); $('#room-veil').style.opacity = state.room.veil/100; });
$('#rs-veil').addEventListener('change', save);

/* ---------- phones: bottom sheets opened from the dock ---------- */
const mqMobile = window.matchMedia('(max-width: 820px)');
const isMobile = () => mqMobile.matches;
const SHEET_TITLES = {alerts:'Sắp hết hạn', spend:'Chi tiêu', add:'Thêm vào phòng', history:'Lịch sử mua sắm', dormant:'Món nằm im', insp:'Chi tiết món', rs:'Đổi giao diện phòng'};
function syncDock(){
  document.querySelectorAll('.dock [data-sheet]').forEach(b => b.setAttribute('aria-expanded', String($('#sh-'+b.dataset.sheet).classList.contains('open'))));
}
let sheetOpenedAt = 0;
function openSheet(key){
  if(!isMobile()) return false;
  sheetOpenedAt = Date.now();
  document.querySelectorAll('.sheet.open').forEach(x => closeOne(x));
  const sh = $('#sh-'+key); if(!sh) return false;
  sh.classList.add('open'); sh.setAttribute('role','dialog'); sh.setAttribute('aria-modal','true'); sh.setAttribute('aria-label', SHEET_TITLES[key] || '');
  if(key === 'rs'){ $('#room-style').hidden = false; $('#rs-open').setAttribute('aria-expanded','true'); }
  $('#scrim').hidden = false; document.body.classList.add('sheet-open'); sh.scrollTop = 0; syncDock();
  return true;
}
function closeOne(sh){
  sh.classList.remove('open'); sh.removeAttribute('role'); sh.removeAttribute('aria-modal'); sh.removeAttribute('aria-label');
  if(sh.id === 'sh-rs' && isMobile()){ $('#room-style').hidden = true; $('#rs-open').setAttribute('aria-expanded','false'); }
}
function closeSheets(){
  document.querySelectorAll('.sheet.open').forEach(closeOne);
  $('#scrim').hidden = true; document.body.classList.remove('sheet-open'); syncDock();
}
document.querySelectorAll('.dock [data-sheet]').forEach(b => b.addEventListener('click', () => {
  const key = b.dataset.sheet; if($('#sh-'+key).classList.contains('open')) closeSheets(); else openSheet(key);
}));
document.querySelectorAll('.sheet-x').forEach(b => b.addEventListener('click', closeSheets));
$('#scrim').addEventListener('click', () => { if(Date.now() - sheetOpenedAt > 450) closeSheets(); });   // ignore the click that follows the tap which opened the sheet
document.addEventListener('keydown', e => { if(e.key === 'Escape' && document.querySelector('.sheet.open')) closeSheets(); });
(mqMobile.addEventListener ? mqMobile.addEventListener.bind(mqMobile, 'change') : mqMobile.addListener.bind(mqMobile))(() => { closeSheets(); });

/* ---------- boot ---------- */
function renderAll(){ renderRoom(); renderLegend(); renderInspector(); renderAlerts(); renderSpend(); renderHistory(); renderCritic(); renderDormant(); }
applyRoom();
renderAll();
if(state.view === '3d') enter3D();
dailyNotify();
if('serviceWorker' in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
