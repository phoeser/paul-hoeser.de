"use strict";
/* ======================= Seitenleiste ======================= */
let tab='b',uiT=0,hoverT=null,hintT=12;
const DESC={pow:'Liefert 100 Strom. Ohne genug Strom läuft alles halb so schnell.',ref:'Hier liefern die Laster das Öl ab. Bringt einen Laster mit.',der:'Fördert Öl. Nur auf schwarzen Ölfeldern.',bar:'Bildet Fußtruppen aus und erforscht ihre Ausrüstung.',wall:'Hält Bodentruppen auf. Mehrere nacheinander setzen, Rechtsklick beendet.',tow:'Günstiger Turm gegen Fußtruppen und Flieger.',fac:'Baut Fahrzeuge bzw. Bestien und erforscht ihre Ausrüstung.',sil:'+10 % Öl-Ertrag (bis zu 3 Stück).',scr:'Macht aus Schrott Geld. Nur auf Schrottfeldern.',rep:'Repariert Fahrzeuge und Gebäude in der Nähe.',ctow:'Schwerer Turm gegen Fahrzeuge. Trifft keine Flieger.',rad:'Zeigt alle feindlichen Einheiten auf der Minikarte.',rtow:'Große Reichweite, stark gegen Flieger und Fahrzeuge.',air:'Baut Lufteinheiten.',lab:'Schaltet die stärkste Bodeneinheit und die Superwaffe frei.',sup:'Superwaffe. Lädt 5 Minuten, dann Ziel wählen.',
 inf:'Billig. Gut gegen Fußtruppen, schwach gegen Panzer.',rkt:'Stark gegen Fahrzeuge, Gebäude und Flieger.',scout:'Sehr schnell, sieht weit. Zum Erkunden.',flame:'Kurze Reichweite, verheerend gegen Fußtruppen.',med:'Heilt Verwundete in der Nähe. Kämpft nicht.',fast:'Schnell. Gut gegen Fußtruppen.',oil:'Holt Öl vom Ölfeld zur Raffinerie.',heavy:'Starker Allrounder gegen Fahrzeuge und Gebäude.',art:'Riesige Reichweite, Flächenschaden. Wehrlos im Nahkampf.',mbt:'Stärkste Bodeneinheit.',heli:'Fliegt über alles hinweg. Nur Raketen, MG und Laser treffen.'};
function descHTML(o){const S=sides[me],t=o.t,d=o.isB?B[t]:stat(me,t),nm=o.isB?FAC[S.fac].b[t]:FAC[S.fac].u[t];let h=`<b>${nm}</b> · <span style="color:#ffcf5a">${d.cost} $</span><br>${DESC[t]||''}`;
  if(o.isB){if(d.pw>0)h+=`<br><span style="color:#b9a27e">Verbraucht ${d.pw} Strom</span>`}else h+=`<br><span style="color:#b9a27e">Leben ${d.hp}${d.dmg?' · Schaden '+d.dmg+' · Reichweite '+d.rng:''}</span>`;
  const r=reqText(S,t);if(r)h+=`<br><span style="color:#ff7a5a">🔒 ${r}</span>`;return h}
function hints(dt){if(over||cfg.demo||(cfg.diff!=='easy'&&cfg.diff!=='normal')||time>720)return;if((hintT-=dt)>0)return;hintT=28;const S=sides[me],has=t=>own(me,t).length,n=FAC[S.fac].b,army=units(me).filter(u=>u.s.dmg).length;let m='';
  if(S.bq&&S.bq.done)m='Dein Gebäude ist fertig – rechts anklicken und Bauplatz wählen';
  else if(!has('ref'))m=`Als Erstes brauchst du: ${n.ref} (bringt Öl-Geld)`;
  else if(!has('der'))m=`Setze „${n.der}“ auf ein schwarzes Ölfeld`;
  else if(S.pw&&S.pw.low)m=`Zu wenig Strom – baue: ${n.pow}`;
  else if(!has('bar'))m=`„${n.bar}“ bildet Fußtruppen aus`;
  else if(army<5)m='Bilde im Reiter „Truppen“ ein paar Kämpfer aus';
  else if(!has('tow'))m=`„${n.tow}“ schützt deine Basis`;
  else if(!has('fac'))m=`„${n.fac}“ bringt stärkere Einheiten`;
  else if(S.lvl<2&&!S.upg)m='Zentrale anklicken und ausbauen – das schaltet schwere Einheiten frei';
  else if(has('der')<3)m='Mehr Ölfelder bringen mehr Geld';
  if(m)say('💡 Tipp: '+m,'',true)}
function selArmy(){sel=units(me).filter(u=>u.s.dmg);sfx('click');infoUI()}
const iconCache={};
function iconFor(kind,type,side){const key=kind+type+sides[side].fac;if(iconCache[key])return iconCache[key];const c=document.createElement('canvas');c.width=104;c.height=88;const x=c.getContext('2d');
  x.fillStyle='#2e2416';x.fillRect(0,0,104,88);x.save();
  if(kind==='b'){const d=B[type],s=Math.min(84/(d.w*T),70/(d.h*T+20));x.translate(52-d.w*T*s/2,48-d.h*T*s/2+6);x.scale(s,s);drawWith(x,()=>drawBld({type,side,tx:0,ty:0,w:d.w,h:d.h,x:d.w*T/2,y:d.h*T/2,hp:1,max:1,anim:1,tdir:.5}))}
  else{const r=U[type].r;const s=Math.min(3.6,38/r);x.translate(52,46);x.scale(s,s);drawWith(x,()=>drawUnit({type,side,x:0,y:0,dir:-.5,tdir:-.5,anim:0,s:stat(side,type),path:null,load:0}))}
  x.restore();iconCache[key]=c;return c}
function drawWith(c2,fn){const old=DC;DC=c2;try{fn()}finally{DC=old}}
function buildUI(){hoverT=null;const S=sides[me];if(!S)return;const box=$('btns');box.innerHTML='';
  const list=tab==='b'?BORDER:UORDER;
  for(const t of list){const isB=tab==='b',d=isB?B[t]:stat(me,t);const b=document.createElement('button');b.className='bb';b.dataset.t=t;
    const ok=reqOK(S,t);if(!ok)b.classList.add('lock');
    const cv2=document.createElement('canvas');cv2.width=104;cv2.height=88;cv2.getContext('2d').drawImage(iconFor(isB?'b':'u',t,me),0,0);b.appendChild(cv2);
    b.insertAdjacentHTML('beforeend',`<div class="nm">${isB?FAC[S.fac].b[t]:FAC[S.fac].u[t]}</div><div class="co">${d.cost} $</div>`);if(!ok)b.insertAdjacentHTML('beforeend','<div class="shade" style="background:#0006"></div><div style="position:absolute;top:2px;left:3px;font-size:12px">🔒</div>');
    b.title=ok?(isB?'Linksklick: bauen · Rechtsklick: abbrechen':'Linksklick: ausbilden · Rechtsklick: abbrechen'):reqText(S,t);
    b.onclick=()=>{sfx('click');if(isB){if(S.bq&&S.bq.done&&S.bq.type===t){placing=t;return}if(S.bq){say('Es wird schon gebaut','bad',true);return}if(!ok){say(reqText(S,t),'bad',true);return}act(['build',t])}else{if(!ok){say(reqText(S,t),'bad',true);return}act(['q',t])}updUI(true)};
    b.oncontextmenu=e=>{e.preventDefault();if(isB){if(S.bq&&S.bq.type===t){act(['cbuild']);placing=null}}else act(['dq',t]);updUI(true)};
    b.onpointerenter=e=>{if(e.pointerType==='mouse'){hoverT={t,isB};infoUI()}};b.onpointerleave=()=>{hoverT=null;infoUI()};
    box.appendChild(b)}
  updUI(true)}
let lockSig='';
function updUI(force){const S=sides[me];{const sig=tab+(tab==='b'?BORDER:UORDER).map(t=>reqOK(S,t)?1:0).join('');if(sig!==lockSig){lockSig=sig;buildUI();return}}$('money').textContent=Math.floor(S.money);const P=S.pw||power(S),pb=$('pwr');pb.firstChild.style.width=Math.min(100,P.u/Math.max(1,P.p)*100)+'%';pb.firstChild.style.background=P.low?'#e0402a':P.u>P.p*.85?'#e6c32a':'#5ad13a';pb.lastChild.textContent=(P.low?'⚡ STROMMANGEL ':'⚡ Strom ')+Math.round(P.u)+' / '+Math.round(P.p);
  for(const b of $('btns').children){const t=b.dataset.t,isB=tab==='b';const cost=isB?B[t].cost:stat(me,t).cost;b.classList.toggle('poor',S.money<cost);b.classList.toggle('lock',!reqOK(S,t));
    let pr=b.querySelector('.prog'),cn=b.querySelector('.cnt'),rd=b.querySelector('.rd'),sh=b.querySelector('.shade');
    let frac=0,count=0,ready=false,busy=false;
    if(isB){if(S.bq&&S.bq.type===t){frac=S.bq.t/S.bq.total;ready=!!S.bq.done}else if(S.bq)busy=true}
    else{const q=S.uq[U[t].from];count=q.filter(x=>x.type===t).length;if(q[0]&&q[0].type===t)frac=q[0].t/q[0].total}
    if(frac>0&&!ready){if(!pr){pr=document.createElement('div');pr.className='prog';b.appendChild(pr)}pr.style.width=(frac*100)+'%'}else if(pr)pr.remove();
    if(count){if(!cn){cn=document.createElement('div');cn.className='cnt';b.appendChild(cn)}cn.textContent=count}else if(cn)cn.remove();
    b.classList.toggle('ready',ready);if(ready){if(!rd){rd=document.createElement('div');rd.className='rd';rd.textContent='PLATZIEREN';b.appendChild(rd)}}else if(rd)rd.remove();
    if(busy){if(!sh){sh=document.createElement('div');sh.className='shade';b.appendChild(sh)}}else if(sh)sh.remove()}
  if(force||(uiT+=1)%6===0)infoUI()}
function bupInfo(t){return{ref:'+20 % Öl je Stufe',der:'Laster laden schneller',bar:'bildet 35 % schneller aus',fac:'baut 35 % schneller',tow:'mehr Schaden und Reichweite'}[t]+', +30 % Haltbarkeit'}
function setInfo(h){const box=$('info');if(box._h!==h){box._h=h;box.innerHTML=h}}
$('info').addEventListener('pointerdown',ev=>{const b=ev.target.closest('button');if(!b||b.disabled)return;ev.preventDefault();sfx('click');
  if(b.id==='iSell')act(['sell',+b.dataset.id]);else if(b.id==='iUp')act(['hq']);else if(b.id==='iNuke'){supMode=sel.find(x=>!x.dead&&x.id===+b.dataset.id);say('Ziel auf der Karte wählen – Rechtsklick bricht ab','',true)}else if(b.id==='iBup')act(['bup',+b.dataset.id]);else if(b.dataset.res){act(['res',b.dataset.res]);infoUI()}});
function infoUI(){if(hoverT){setInfo(descHTML(hoverT));return}const S=sides[me],box=$('info');const s=sel.filter(e=>!e.dead);
  if(!s.length){setInfo(`<b>${FAC[S.fac].name}</b><br>Einheiten: ${units(me).length} · Gebäude: ${own(me).length}<br><span style="color:#b9a27e">Gegner: ${sides.filter(x=>!x.dead&&hostile(x.id,me)).length}× ${DIFF[cfg.diff].name}</span>`);return}
  if(s.length===1){const e=s[0];const nm=e.k==='b'?(e.side>=0?FAC[sides[e.side].fac].b[e.type]:'Tech-Bunker'):FAC[sides[e.side].fac].u[e.type];
    let h=`<b>${nm}</b>${e.k==='u'&&e.vet?' <span style="color:#ffd84a">'+'★'.repeat(e.vet)+'</span>':''}<div class="hpb"><i style="width:${e.hp/e.max*100}%"></i></div>${Math.ceil(e.hp)} / ${Math.ceil(e.max)}`;
    if(e.k==='b'&&e.type==='sup'){const c=e.charge||0;h+=`<br>Ladung: ${Math.floor(c/B.sup.charge*100)} %`;if(e.side===me)h+=c>=B.sup.charge?`<button class="sbtn" id="iNuke" data-id="${e.id}" style="background:linear-gradient(#c0302a,#6a1010)">☢ ${FAC[S.fac].sup} abfeuern</button>`:''}
    if(e.k==='b'&&e.type==='scr')h+=`<br>Schrott übrig: ${Math.max(0,Math.floor(e.scrap||0))}`;
    if(e.k==='b'&&e.type==='rad')h+='<br><span style="color:#b9a27e">Zeigt Feinde auf der Minikarte (mit Strom)</span>';
    if(e.k==='b'&&e.type==='rep')h+='<br><span style="color:#b9a27e">Repariert Fahrzeuge und Gebäude in der Nähe</span>';
    if(e.k==='b'&&e.type==='pow')h+=`<br>Erzeugt ${Math.round(-B.pow.pw*(1+(e.lvl-1)*.5))} Strom`;else if(e.k==='b'&&B[e.type].pw>0)h+=`<br><span style="color:#b9a27e">Verbraucht ${B[e.type].pw} Strom</span>`;
    if(e.k==='u'&&e.type==='oil')h+=`<br>Ladung: ${e.load} Öl`;if(e.k==='b'&&e.type==='der')h+=`<br>Ölvorrat: ${Math.max(0,e.oil)}`;
    if(e.k==='u'&&e.kills)h+=`<br>Abschüsse: ${e.kills}`;
    if(e.side===me&&e.type==='hq')h+=S.lvl>1?'<br>✔ Ausgebaut':S.upg?`<br>Ausbau läuft … ${Math.floor(S.upg.t/S.upg.total*100)} %`:`<button class="sbtn" id="iUp" ${S.money<1200?'disabled':''}>⬆ Ausbau (1200 $)</button>`;
    if(e.k==='b'&&BUPG.includes(e.type))h+=`<br><span style="color:#ffcf5a">Stufe ${e.lvl}</span> · <span style="color:#b9a27e">${bupInfo(e.type)}</span>`;
    if(e.k==='u'){const S2=sides[e.side],w=S2.tech[isInf(e)?'infW':'vehW']||0,ar=S2.tech[isInf(e)?'infA':'vehA']||0;if(w||ar)h+=`<br><span style="color:#7aff6a">${w?'Waffen '+ROM[w]:''}${w&&ar?' · ':''}${ar?'Panzerung '+ROM[ar]:''}</span>`}
    if(e.side===me&&e.k==='b'&&BUPG.includes(e.type)){if(e.up)h+=`<br>Ausbau läuft … ${Math.floor(e.up.t/e.up.total*100)} %`;else if(e.lvl<3)h+=`<button class="sbtn" id="iBup" data-id="${e.id}" ${S.money<bupCost(e)?'disabled':''}>⬆ Auf Stufe ${e.lvl+1} (${bupCost(e)} $)</button>`;else h+='<br>✔ Höchste Stufe'}
    if(e.side===me&&(e.type==='bar'||e.type==='fac'||e.type==='air')){if(e.type!=='air'){h+='<div style="margin-top:6px;color:#ffdf9a;font-weight:800">Forschung</div>';
      for(const k in RES){const r=RES[k];if(r.at!==e.type)continue;const lv=S.tech[k]||0;
        if(S.res&&S.res.k===k)h+=`<div>${r.ic} ${r.n} ${ROM[lv+1]} … ${Math.floor(S.res.t/S.res.total*100)} %</div>`;
        else if(lv>=2)h+=`<div>${r.ic} ${r.n} ✔ II</div>`;
        else h+=`<button class="sbtn" data-res="${k}" ${S.res||S.money<r.c[lv]?'disabled':''}>${r.ic} ${r.n} ${ROM[lv+1]} (${r.c[lv]} $)</button>`}
      if(S.res&&RES[S.res.k].at!==e.type)h+='<div style="color:#b9a27e">Es läuft schon eine Forschung</div>';
      }h+='<span style="color:#b9a27e">Rechtsklick auf die Karte setzt den Sammelpunkt</span>'}
    if(e.side===me&&e.k==='b'&&e.type!=='hq')h+=`<button class="sbtn" id="iSell" data-id="${e.id}">♻ Verkaufen (+${Math.floor(e.spent*.5*e.hp/e.max)} $)</button>`;
    setInfo(h);return}
  const cnt={};for(const e of s)cnt[e.type]=(cnt[e.type]||0)+1;setInfo(`<b>${s.length} ausgewählt</b><br>`+Object.entries(cnt).map(([t,n])=>`${n}× ${FAC[S.fac].u[t]||t}`).join('<br>'))}
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===t));tab=t.dataset.t;buildUI()});

/* ======================= Eingabe ======================= */
let drag=null,hover=null,marks=[],ptrs=new Map(),pinch=null,lastTap={t:0,id:0},keys={},mouseIn=false,mouse={x:0,y:0};
const toWorld=(sx,sy)=>({x:camX+sx/zoom,y:camY+sy/zoom});
function entAt(wx,wy){let best=null,bd=1e9;for(const e of ents){if(e.dead)continue;if(hostile(e.side,me)&&!isVisTo(me,e))continue;
  if(e.k==='u'){const d=dist(e.x,e.y,wx,wy);if(d<e.s.r+6&&d<bd){bd=d;best=e}}else if(wx>=e.tx*T&&wx<(e.tx+e.w)*T&&wy>=e.ty*T&&wy<(e.ty+e.h)*T&&!best){best=e;bd=999}}return best}
function selectAt(wx,wy,add,dbl){const e=entAt(wx,wy);if(!add)sel=[];
  if(e){if(dbl&&e.k==='u'&&e.side===me){sel=ents.filter(o=>!o.dead&&o.k==='u'&&o.side===me&&o.type===e.type&&onScreen(o.x,o.y,0))}else if(add&&sel.includes(e))sel=sel.filter(o=>o!==e);else sel.push(e);sfx('click')}
  infoUI()}
function boxSelect(a,b){const x0=Math.min(a.x,b.x),x1=Math.max(a.x,b.x),y0=Math.min(a.y,b.y),y1=Math.max(a.y,b.y);let s=ents.filter(e=>!e.dead&&e.k==='u'&&e.side===me&&e.x>=x0&&e.x<=x1&&e.y>=y0&&e.y<=y1);
  if(s.some(e=>e.type!=='oil'))s=s.filter(e=>e.type!=='oil');sel=s;if(s.length)sfx('click');infoUI()}
function command(wx,wy,forceAtk){const mine=sel.filter(e=>!e.dead&&e.side===me);if(!mine.length)return;
  const us=mine.filter(e=>e.k==='u'),bs=mine.filter(e=>e.k==='b'),ids=a=>a.map(e=>e.id);
  if(!us.length&&bs.length){act(['rally',ids(bs),wx,wy]);for(const b of bs)if(PRODB.includes(b.type))b.rally={x:wx,y:wy};marks.push({x:wx,y:wy,l:1,c:'#7aff6a'});return}
  const t=entAt(wx,wy);
  if(t&&hostile(t.side,me)){act(['atk',ids(us),t.id]);marks.push({x:t.x,y:t.y,l:1,c:'#ff4a3a'});sfx('click');return}
  if(t&&t.type==='tech'&&!t.opened){const inf=us.filter(u=>u.s.arm==='inf');if(inf.length){act(['bunk',ids(inf),t.id]);marks.push({x:t.x,y:t.y,l:1,c:'#7ae8ff'});const rest=us.filter(u=>u.s.arm!=='inf');if(rest.length)act(['mv',ids(rest),t.x,t.y+T*2.5,'move']);return}}
  if(t&&t.side===me&&t.k==='b'&&t.type==='der'){const tk=us.filter(u=>u.type==='oil');if(tk.length)act(['der',ids(tk),t.id]);const rest=us.filter(u=>u.type!=='oil');if(rest.length)act(['mv',ids(rest),wx,wy,'move']);if(tk.length)return}
  const mv=us.filter(u=>u.type!=='oil'||!t);if(mv.length)act(['mv',ids(mv),wx,wy,forceAtk||atkMode?'amove':'move']);marks.push({x:wx,y:wy,l:1,c:forceAtk||atkMode?'#ff4a3a':'#7aff6a'});sfx('click')}
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',e=>{if(paused||over)return;cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.offsetX,y:e.offsetY});
  if(ptrs.size===2){const[p1,p2]=[...ptrs.values()];pinch={d:dist(p1.x,p1.y,p2.x,p2.y),z:zoom,cx:(p1.x+p2.x)/2,cy:(p1.y+p2.y)/2,cam:{x:camX,y:camY}};drag=null;return}
  const w=toWorld(e.offsetX,e.offsetY);
  if(e.button===1){drag={pan:true,sx:e.offsetX,sy:e.offsetY,cam:{x:camX,y:camY}};return}
  if(e.button===2){if(supMode){supMode=null;return}if(placing){const S=sides[me];if(placing==='wall'&&S.bq&&S.bq.type==='wall')act(['cbuild']);placing=null;return}if(atkMode){atkMode=false;updTop();return}command(w.x,w.y);return}
  drag={sx:e.offsetX,sy:e.offsetY,cx:e.offsetX,cy:e.offsetY,box:false,touch:e.pointerType!=='mouse',shift:e.shiftKey,ctrl:e.ctrlKey}});
cv.addEventListener('pointermove',e=>{mouse={x:e.offsetX,y:e.offsetY};mouseIn=true;hover=toWorld(e.offsetX,e.offsetY);if(e.pointerType==='mouse'&&!drag){const t=entAt(hover.x,hover.y);cv.style.cursor=placing||supMode||atkMode?'crosshair':t&&hostile(t.side,me)&&sel.some(x=>x.side===me&&x.k==='u')?'crosshair':t&&t.side===me?'pointer':'default'}if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,{x:e.offsetX,y:e.offsetY});
  if(pinch&&ptrs.size===2){const[p1,p2]=[...ptrs.values()];const d=dist(p1.x,p1.y,p2.x,p2.y),cx=(p1.x+p2.x)/2,cy=(p1.y+p2.y)/2;const wz=clamp(pinch.z*d/pinch.d,.55,1.8);
    const wx=pinch.cam.x+pinch.cx/pinch.z,wy=pinch.cam.y+pinch.cy/pinch.z;zoom=wz;camX=wx-cx/zoom;camY=wy-cy/zoom;clampCam();return}
  if(!drag)return;if(drag.pan){camX=drag.cam.x-(e.offsetX-drag.sx)/zoom;camY=drag.cam.y-(e.offsetY-drag.sy)/zoom;clampCam();return}
  drag.cx=e.offsetX;drag.cy=e.offsetY;if(!drag.box&&dist(drag.sx,drag.sy,drag.cx,drag.cy)>8){
    if(drag.touch&&!boxMode){drag.pan=true;drag.cam={x:camX,y:camY};return}drag.box=true}});
cv.addEventListener('pointerup',e=>{ptrs.delete(e.pointerId);if(pinch){if(ptrs.size<2)pinch=null;drag=null;return}if(!drag)return;const d=drag;drag=null;if(d.pan)return;
  const w=toWorld(d.cx,d.cy);
  if(d.box){boxSelect(toWorld(d.sx,d.sy),w);if(boxMode){boxMode=false;updTop()}return}
  if(placing){const S=sides[me],B0=B[placing];const tx=Math.floor(w.x/T-B0.w/2+.5),ty=Math.floor(w.y/T-B0.h/2+.5);if(S.bq&&S.bq.done&&canPlace(S,placing,tx,ty)){const w=placing==='wall'&&S.money>=B.wall.cost;act(['place',tx,ty]);if(!w)placing=null;updUI(true)}else say('Hier kann nicht gebaut werden','bad',true);return}
  if(supMode){act(['sup',supMode.id,w.x,w.y]);supMode=null;return}
  if(atkMode){command(w.x,w.y,true);atkMode=false;updTop();return}
  const now=performance.now(),e2=entAt(w.x,w.y),dbl=now-lastTap.t<350&&e2&&lastTap.id===e2.id;lastTap={t:now,id:e2?e2.id:0};
  if(d.touch){const mine=sel.filter(x=>x.side===me&&x.k==='u'&&!x.dead);if(e2&&e2.side===me&&!(mine.length&&e2.k==='b'&&e2.type==='der'&&mine.some(u=>u.type==='oil'))){selectAt(w.x,w.y,false,dbl);return}
    if(mine.length||sel.some(x=>x.side===me&&x.k==='b'&&PRODB.includes(x.type))){command(w.x,w.y);return}selectAt(w.x,w.y,false,false);return}
  selectAt(w.x,w.y,d.shift,dbl)});
cv.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);drag=null;pinch=null});
cv.addEventListener('pointerleave',()=>{mouseIn=false});
cv.addEventListener('wheel',e=>{e.preventDefault();const w=toWorld(e.offsetX,e.offsetY);zoom=clamp(zoom*(e.deltaY<0?1.12:1/1.12),.55,1.8);camX=w.x-e.offsetX/zoom;camY=w.y-e.offsetY/zoom;clampCam()},{passive:false});
let miniDrag=false;
const miniPos=e=>{const r=mini.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*MW*T,y:(e.clientY-r.top)/r.height*MH*T}};
mini.addEventListener('contextmenu',e=>e.preventDefault());
mini.addEventListener('pointerdown',e=>{if(paused)return;const p=miniPos(e);if(e.button===2){command(p.x,p.y);return}miniDrag=true;mini.setPointerCapture(e.pointerId);camX=p.x-viewW()/2;camY=p.y-viewH()/2;clampCam()});
mini.addEventListener('pointermove',e=>{if(!miniDrag)return;const p=miniPos(e);camX=p.x-viewW()/2;camY=p.y-viewH()/2;clampCam()});
mini.addEventListener('pointerup',()=>miniDrag=false);
window.addEventListener('keydown',e=>{if($('start').classList.contains('hidden')===false)return;keys[e.key]=true;const k=e.key.toLowerCase();
  if(k==='escape'||k==='p'){if(supMode){supMode=null;return}if(placing){placing=null;return}if(atkMode){atkMode=false;updTop();return}togglePause();return}
  if(paused)return;
  if(k==='a'){atkMode=!atkMode;updTop()}else if(k==='s'){stopSel()}else if(k==='h'){home()}else if(k==='q'){selArmy()}else if(k===' '){e.preventDefault();const al=sides[me].alarm;if(al&&time-al.t<40){camX=al.x-viewW()/2;camY=al.y-viewH()/2;clampCam()}else home()}
  else if(/^[1-9]$/.test(k)){if(e.ctrlKey){e.preventDefault();groups[k]=sel.filter(x=>x.k==='u');say(`Gruppe ${k} gespeichert`,'',true)}else if(groups[k]){const g=groups[k].filter(x=>!x.dead);if(sel.length===g.length&&sel.every(x=>g.includes(x))&&g.length){camX=g[0].x-viewW()/2;camY=g[0].y-viewH()/2;clampCam()}sel=g;infoUI()}}});
window.addEventListener('keyup',e=>{keys[e.key]=false});
function stopSel(){act(['stop',sel.filter(u=>u.k==='u'&&u.side===me).map(u=>u.id)])}
function home(){const h=own(me,'hq')[0]||own(me)[0]||units(me)[0];if(h){camX=h.x-viewW()/2;camY=h.y-viewH()/2;clampCam()}}
function updTop(){$('tAtk').classList.toggle('on',atkMode);$('tBox').classList.toggle('on',boxMode)}
$('tAtk').onclick=()=>{atkMode=!atkMode;updTop()};$('tStop').onclick=stopSel;$('tHome').onclick=home;$('tBox').onclick=()=>{boxMode=!boxMode;updTop()};$('tMenu').onclick=()=>togglePause();
{const b=document.createElement('button');b.className='tbtn';b.textContent='🪖';b.title='Alle Kampftruppen wählen (Q)';b.onclick=selArmy;$('topbar').appendChild(b)}

/* ======================= Ablauf ======================= */
function newGame(){hintT=12;nukes=[];supMode=null;shake=0;MW=MH=cfg.players>2?Math.max(64,cfg.size):cfg.size;ents=[];nextId=1;projs=[];tracers=[];parts=[];pathQ=[];sel=[];marks=[];groups={};time=0;over=false;placing=null;atkMode=false;msgT={};
  const ai=['bunker','mutant'].find(f=>f!==cfg.fac);
  const mk=(id,fac,human)=>({id,fac,human,ai:!human,team:id,name:`${FAC[fac].name} (${CNAME[id]})`,money:human?2600:2000,lvl:1,bq:null,uq:{bar:[],fac:[],air:[]},upg:null,tech:{},res:null,stats:{kills:0,lost:0,blost:0,built:0,oil:0,made:0}});
  if(NET.host&&NET.playing)NET.mkSides(mk);else{me=0;sides=[mk(0,cfg.fac,true)];for(let i=1;i<cfg.players;i++)sides.push(mk(i,i%2?ai:cfg.fac,false))}
  if(cfg.demo)sides[me].human=false;
  const m=genMap();renderTerrain();iconCacheClear();
  for(const[s,p]of m.starts.map((p,s)=>[s,p])){const hq=addBld(s,'hq',p.x-1,p.y-1);hq.born=-9;const ut=['inf','inf','inf','rkt'];ut.forEach((t,i)=>{const f=nearestFree(p.x+2+i%2,p.y+3+(i>>1),4);if(f)addUnit(s,t,f.x*T+16,f.y*T+16)})}
  for(const t of m.techs){const b=addBld(-1,'tech',t.x,t.y);b.born=-9}
  for(const e of ents)e.born=-9;
  resize();zoom=CW>700?1.35:1.1;clampCam();home();computeVis();buildUI();paused=false}
function iconCacheClear(){for(const k in iconCache)delete iconCache[k]}
function togglePause(){if(NET.on&&NET.playing){const o=$('overlay');if(o.classList.contains('hidden'))showMenu();else o.classList.add('hidden');return}if(over)return;paused=!paused;if(paused)showMenu();else $('overlay').classList.add('hidden')}
function showMenu(){const p=$('panel');$('overlay').classList.remove('hidden');
  p.innerHTML=`<h2>${NET.on?'Menü':'Pause'}</h2><div class="row"><button class="sbtn" id="mRes">▶ Weiter</button></div>
   <div class="row"><button class="sbtn" id="mSpd" ${NET.on?'style="display:none"':''}>⏩ Tempo: ${speed===1?'Normal':speed>1?'Schnell':'Langsam'}</button><button class="sbtn" id="mSnd">${soundOn?'🔊 Ton an':'🔇 Ton aus'}</button></div>
   <div class="row"><button class="sbtn" id="mVoc">${voiceOn?'🗣 Ansagen an':'🤐 Ansagen aus'}</button><button class="sbtn" id="mHelp">📜 Hilfe</button></div>
   <div class="row"><button class="sbtn" id="mNew">${NET.on?'🚪 Spiel verlassen':'🔁 Neues Gefecht'}</button><button class="sbtn" id="mQuit">🏳 Aufgeben</button></div>`;
  $('mRes').onclick=()=>togglePause();$('mSpd').onclick=()=>{speed=speed===1?1.5:speed>1?.7:1;showMenu()};$('mSnd').onclick=()=>{soundOn=!soundOn;showMenu()};$('mVoc').onclick=()=>{voiceOn=!voiceOn;showMenu()};
  $('mHelp').onclick=()=>showHelp(showMenu);$('mNew').onclick=()=>{if(NET.on){NET.leave();return}$('overlay').classList.add('hidden');$('start').classList.remove('hidden');paused=true};$('mQuit').onclick=()=>{$('overlay').classList.add('hidden');paused=false;if(NET.on)act(['quit']);endGame(false,'Du hast aufgegeben.')}}
const HELP=`<h2>So wird gespielt</h2><ul>
<li><b>Ziel:</b> Zerstöre alle Gebäude des Gegners, bevor er deine zerstört.</li>
<li><b>Öl ist alles:</b> Baue eine Raffinerie (bringt einen Tanklaster mit) und Bohrtürme auf die schwarzen Ölfelder. Die Laster fahren das Öl automatisch zur Raffinerie – das bringt Öl-Dollar.</li>
<li><b>Bauen:</b> Rechts ein Gebäude anklicken, warten bis „PLATZIEREN“ blinkt, dann Bauplatz in der Nähe deiner Basis wählen. Bohrtürme gehen auf jedes erkundete Ölfeld.</li>
<li><b>Truppen:</b> Im Reiter „Truppen“ ausbilden. Schwere Einheiten brauchen den Ausbau der Zentrale (Zentrale anklicken → Ausbau).</li>
<li><b>Steuern (Maus):</b> Linksklick wählt aus, Rahmen ziehen wählt mehrere, Doppelklick wählt alle gleichen. Rechtsklick bewegt bzw. greift an. Mausrad zoomt, Bildschirmrand/Pfeiltasten/Mitteltaste scrollen.</li>
<li><b>Tablet:</b> Antippen wählt aus, danach auf den Boden oder einen Feind tippen. Mit einem Finger ziehen scrollt, mit ⬚ ziehst du einen Auswahlrahmen, zwei Finger zoomen.</li>
<li><b>Tasten:</b> <kbd>A</kbd> Angriffsbewegung, <kbd>S</kbd> Stopp, <kbd>H</kbd> zur Basis, <kbd>Q</kbd> alle Kampftruppen wählen, <kbd>Leertaste</kbd> zum letzten Angriff springen, <kbd>Strg</kbd>+<kbd>1–9</kbd> Gruppe speichern, <kbd>1–9</kbd> Gruppe wählen, <kbd>Esc</kbd> Pause.</li>
<li><b>Tech-Bunker</b> ☢: Schick Fußsoldaten hin – darin wartet eine mächtige Spezialeinheit.</li>
<li><b>Technologiebaum:</b> Gebäude schalten weitere frei (🔒 zeigt, was fehlt). Beispiel: Panzerwerk + Kraftwerk → Radar → Raketenturm, Flugfeld; Radar + Werkstatt → Labor → Superwaffe.</li>
<li><b>Strom:</b> Kraftwerke liefern Strom. Bei Strommangel (roter Balken) läuft alles halb so schnell.</li>
<li><b>Mauern:</b> Mauer wählen, dann beliebig viele Stücke setzen – Rechtsklick beendet.</li>
<li><b>Ausbauen:</b> Eigenes Gebäude anklicken → „Auf Stufe 2/3“. Kaserne und Panzerwerk erforschen außerdem Waffen und Panzerung für deine Truppen (wirkt auch auf alle vorhandenen).</li>
<li><b>Mit anderen spielen:</b> Im Startbild „Mit anderen spielen“ wählen, Raum eröffnen und den Link verschicken. Bis zu 4 Parteien – zusammen gegen den Computer oder jeder gegen jeden. Verlässt jemand das Spiel, übernimmt der Computer.</li>
<li><b>Hilfe im Spiel:</b> Fahre mit der Maus über einen Bau-Knopf – unten steht, was das Gebäude oder die Einheit kann.</li>
<li><b>Erfahrung:</b> Einheiten mit Abschüssen bekommen Sterne und werden stärker.</li>
<li><b>Waffen:</b> Gewehre gegen Fußvolk, Raketen und Kanonen gegen Fahrzeuge, Bestien und Gebäude.</li></ul>`;
function showHelp(back){const p=$('panel');$('overlay').classList.remove('hidden');p.innerHTML=HELP+`<button class="sbtn" id="hBack">Zurück</button>`;$('hBack').onclick=()=>{if(back)back();else $('overlay').classList.add('hidden')}}
function endGame(win,why){if(over)return;over=true;const S=sides[me],eLost=sides.filter(x=>x.id!==me).reduce((n,x)=>n+x.stats.lost,0);const mm=Math.floor(time/60),ss=String(Math.floor(time%60)).padStart(2,'0');
  say(win?'Sieg!':'Niederlage!',win?'':'bad');const p=$('panel');$('overlay').classList.remove('hidden');
  p.innerHTML=`<h2>${win?'🏆 Sieg!':'💀 Niederlage'}</h2><p>${why}</p><table class="st"><tr><td>Spielzeit</td><td>${mm}:${ss}</td></tr><tr><td>Feinde vernichtet</td><td>${S.stats.kills}</td></tr><tr><td>Eigene Verluste</td><td>${S.stats.lost}</td></tr><tr><td>Gebäude gebaut</td><td>${S.stats.built}</td></tr><tr><td>Öl gefördert</td><td>${Math.round(S.stats.oil)} $</td></tr><tr><td>Gegner – Verluste</td><td>${eLost}</td></tr></table>
  <div class="row"><button class="sbtn" id="eAgain" ${NET.client?'style="display:none"':''}>${NET.host?'🔁 Zurück zum Raum':'🔁 Nochmal'}</button><button class="sbtn" id="eMenu">${NET.on?'🚪 Verlassen':'🏠 Hauptmenü'}</button><button class="sbtn" id="eLook">👁 Karte ansehen</button></div>`;
  $('eAgain').onclick=()=>{if(NET.host){NET.toLobby();return}$('overlay').classList.add('hidden');newGame()};$('eMenu').onclick=()=>{if(NET.on){NET.leave();return}$('overlay').classList.add('hidden');$('start').classList.remove('hidden');paused=true};$('eLook').onclick=()=>{$('overlay').classList.add('hidden');cfg.reveal=true}}
let last=performance.now(),acc=0;
function loop(now){const rdt=Math.min(.05,(now-last)/1000);last=now;
  if(NET.client){if(sides.length)NET.tick(rdt)}else if(!paused&&sides.length){const dt=rdt*speed;time+=dt;step(dt);hints(dt);if(NET.host)NET.snap(dt)}
  if(sides.length){// Kamera
    const sp=600*rdt/zoom;if(keys.ArrowLeft)camX-=sp;if(keys.ArrowRight)camX+=sp;if(keys.ArrowUp)camY-=sp;if(keys.ArrowDown)camY+=sp;
    if(mouseIn&&!drag&&!paused&&matchMedia('(pointer:fine)').matches){const m=14;if(mouse.x<m)camX-=sp;if(mouse.x>CW-m)camX+=sp;if(mouse.y<m)camY-=sp;if(mouse.y>CH-m)camY+=sp}
    clampCam();render();drawMini();if(!paused)updUI()}
  requestAnimationFrame(loop)}
function step(dt){processPaths();if((pwT-=dt)<=0){pwT=.5;for(const S of sides)S.pw=power(S)}updNukes(dt);if(shake>0)shake=Math.max(0,shake-dt);
  for(const e of ents){if(e.dead)continue;e.moving=false;if(e.k==='u')updUnit(e,dt);else updBld(e,dt)}
  separate();updProj(dt);updParts(dt);for(const m of marks)m.l-=dt*1.5;marks=marks.filter(m=>m.l>0);
  for(const S of sides)updProd(S,dt);
  if((aiT+=dt)>.8*DIFF[cfg.diff].think){const k=aiT;aiT=0;for(const S of sides)if(!S.human)updAI(S,k)}
  if((visT+=dt)>.2){visT=0;computeVis()}
  if(ents.some(e=>e.dead))ents=ents.filter(e=>!e.dead);
  for(const S of sides)if(!S.dead&&!own(S.id).some(b=>b.type!=='wall')){S.dead=true;if(S.id!==me||NET.on)for(const e of ents)if(!e.dead&&e.side===S.id)kill(e,null);for(const X of sides)if(X.id!==S.id&&!X.dead&&(X.human||X.id===me))tell(X.id,`${S.name} sind vernichtet!`)}
  checkEnd()}
function checkEnd(){if(over||!sides.length)return;const liv=sides.filter(S=>!S.dead);
  if(sides[me].dead)endGame(false,'Alle deine Gebäude wurden zerstört.');else if(liv.every(S=>S.team===liv[0].team))endGame(true,sides.length>2?'Alle Gegner sind vernichtet. Das Öl gehört dir!':`Die ${FAC[sides[1-me].fac].name} sind vernichtet. Das Öl gehört dir!`)}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!NET.on&&!paused&&!over&&sides.length&&$('start').classList.contains('hidden'))togglePause()});
window.addEventListener('resize',()=>{if(sides.length)resize()});

/* ======================= Startbildschirm ======================= */
function segSel(id,key,num){document.querySelectorAll(`#${id} .opt`).forEach(b=>b.onclick=()=>{cfg[key]=num?+b.dataset.v:b.dataset.v;document.querySelectorAll(`#${id} .opt`).forEach(x=>x.classList.toggle('on',x===b))})}
segSel('facs','fac');segSel('segD','diff');segSel('segM','size',true);segSel('segP','players',true);
$('bStart').onclick=()=>{$('start').classList.add('hidden');try{AC=AC||new(window.AudioContext||window.webkitAudioContext)()}catch(e){}cfg.reveal=false;newGame()};
$('bHelp').onclick=()=>showHelp();
// Vorschaubilder der Völker
(function(){const pv=[...document.querySelectorAll('#facs canvas')];sides=[{fac:'bunker'},{fac:'mutant'}];
  pv.forEach((c,i)=>{const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,90);g.addColorStop(0,'#5a3a1a');g.addColorStop(1,'#a07a48');x.fillStyle=g;x.fillRect(0,0,240,90);
    const side=i;sides[0].fac=i?'mutant':'bunker';sides[1].fac=i?'mutant':'bunker';
    drawWith(x,()=>{x.save();x.translate(30,22);x.scale(.75,.75);drawBld({type:'hq',side:0,tx:0,ty:0,w:3,h:3,x:48,y:48,hp:1,max:1,anim:1,tdir:0});x.restore();
      const us=[['heavy',150,52,2],['fast',196,30,1.8],['inf',130,26,2.2],['rkt',210,66,2.2]];for(const[t,ux,uy,s]of us){x.save();x.translate(ux,uy);x.scale(s,s);drawUnit({type:t,side:0,x:0,y:0,dir:Math.PI,tdir:Math.PI,anim:i,s:U[t],path:null,load:0});x.restore()}})});
  sides=[]})();
requestAnimationFrame(loop);
