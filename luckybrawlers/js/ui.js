"use strict";
/* ======================= Lucky Brawlers – Bedienung, Menüs, Spielschleife ======================= */
const IN={mx:0,my:0,a:-Math.PI/2,d:0,f:0,s:0};
let selMode='gem',keys={},mvStick=null,aimStick=null,last=performance.now(),endShown=false,hudS='',supS=-1,lf=0,ls=0;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SR=46;   // Radius der Daumen-Sticks
function show(id){for(const s of['menu','lobby','wait','end'])$(s).classList.toggle('hidden',s!==id);$('hud').classList.toggle('hidden',id!==null)}
function wake(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}}
function heroCards(el,cur,pick){el.innerHTML='';for(const k of HKEYS){const h=HEROES[k],b=document.createElement('button');b.className='hero'+(k===cur?' on':'');b.style.setProperty('--c',h.col);
    const c=document.createElement('canvas');c.width=c.height=120;drawHero(c.getContext('2d'),k,60,68,-.6,null,0,2.3);b.appendChild(c);
    b.insertAdjacentHTML('beforeend',`<b>${h.n}</b><small>${h.d}<br>Super: ${h.sn}</small>`);b.onclick=()=>pick(k);el.appendChild(b)}}

/* ---------- Menü ---------- */
function showMenu(msg){show('menu');$('msg').textContent=msg||'';$('name').value=NET.name==='Spieler'?'':NET.name;
  heroCards($('heroes'),NET.hero,k=>{NET.hero=k;try{localStorage.setItem('lb-hero',k)}catch(e){}showMenu()});
  for(const m of['gem','solo'])$('m_'+m).classList.toggle('on',selMode===m)}
function readName(){NET.name=($('name').value||'').trim().slice(0,12)||'Spieler';try{localStorage.setItem('lb-name',NET.name)}catch(e){}}
function newCode(){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=A[(Math.random()*A.length)|0];return s}
function showWait(t){show('wait');$('waitT').textContent=t}
$('m_gem').onclick=()=>{selMode='gem';showMenu()};$('m_solo').onclick=()=>{selMode='solo';showMenu()};
$('name').onchange=readName;
$('bQuick').onclick=()=>{wake();readName();quickPlay(selMode)};
$('bPriv').onclick=()=>{wake();readName();showWait('Raum wird eröffnet …');hostRoom(newCode(),false,selMode)};
$('bJoin').onclick=()=>{wake();readName();const c=($('code').value||'').trim().toUpperCase();if(c.length<4){$('msg').textContent='Bitte den Raum-Code eingeben.';return}
  showWait('Verbinde mit Raum '+c+' …');joinRoom(c,()=>netFail('Der Raum ist voll oder das Spiel läuft schon.'),()=>netFail('Diesen Raum gibt es nicht (mehr).'))};
$('bTrain').onclick=()=>{wake();readName();startLocal(selMode)};
$('waitX').onclick=()=>netFail('');

/* ---------- Raum ---------- */
function showLobby(){const L=NET.lobby;if(!L)return;const el=$('lobby'),sig=JSON.stringify([L.players,L.mode,L.pub,L.code,NET.you,NET.host]);
  if(!el.classList.contains('hidden')&&el.dataset.sig===sig){const e=$('cdn');if(e)e.textContent=L.cd;return}
  show('lobby');el.dataset.sig=sig;const link=location.origin+location.pathname+'?raum='+L.code,own=!L.pub&&NET.host,myHero=(L.players[NET.you]||{}).hero||NET.hero;
  el.innerHTML=`<div class="card"><h2>${L.pub?'Offener Raum':'Privater Raum'}</h2>
    ${L.pub?`<p class="lead">${L.players.length<2?'Warte auf Mitspieler …':'Gleich geht es los!'} Start in <b id="cdn">${L.cd}</b> s</p><p>Freie Plätze füllt der Computer.</p>`
      :`<p class="lead">Code: <b class="code">${esc(L.code)}</b></p><div class="row"><input id="lnk" readonly value="${esc(link)}"><button class="btn sm" id="cpy">Link kopieren</button></div>`}
    ${own?`<div class="row"><button class="btn sm${L.mode==='gem'?' on':''}" id="lm_gem">💎 ${MODES.gem.n}</button><button class="btn sm${L.mode==='solo'?' on':''}" id="lm_solo">👑 ${MODES.solo.n}</button></div>`:''}
    <p><b>${MODES[L.mode].n}</b> – ${MODES[L.mode].d}</p>
    <div class="plist">${L.players.map((p,i)=>`<div><i style="background:${HEROES[p.hero].col}"></i>${esc(p.name)}${i===NET.you?' (du)':''} – ${HEROES[p.hero].n}</div>`).join('')}<div class="cpu">+ ${MODES[L.mode].size-L.players.length} Computer</div></div>
    <div class="heroes sm" id="lHeroes"></div>
    ${own?'<button class="btn go" id="lGo">▶ Spiel starten</button>':L.pub?'':'<p>Der Gastgeber startet das Spiel.</p>'}
    <button class="btn sec" id="lLeave">Raum verlassen</button></div>`;
  heroCards($('lHeroes'),myHero,k=>{NET.hero=k;try{localStorage.setItem('lb-hero',k)}catch(e){}if(NET.host){NET.players[0].hero=k;lobbySync()}else if(NET.hc&&NET.hc.open)NET.hc.send({t:'hero',hero:k})});
  $('lLeave').onclick=()=>{netClose();showMenu()};
  if($('cpy'))$('cpy').onclick=()=>{try{navigator.clipboard.writeText(link);$('cpy').textContent='Kopiert ✔'}catch(e){$('lnk').select()}};
  if(own){$('lGo').onclick=()=>startMatch();for(const m of['gem','solo'])$('lm_'+m).onclick=()=>{NET.mode=m;lobbySync()}}}

/* ---------- Spiel ---------- */
function startPlay(){show(null);resize();PT=[];FT=[];endShown=false;hudS='';supS=-1;IN.f=IN.s=lf=ls=0;IN.mx=IN.my=0;mvStick=aimStick=null;STICKS=[];aimPrev=null;wake()}
function autoAim(){const m=G.P[me];let b=null,bd=1e9;for(const q of G.P)if(q.team!==m.team&&!q.dead&&visibleTo(m,q)){const d=dist(m.x,m.y,q.x,q.y);if(d<bd){bd=d;b=q}}
  if(b&&bd<HEROES[m.hero].rng*TS*1.3){IN.a=Math.atan2(b.y-m.y,b.x-m.x);IN.d=bd}else{IN.a=m.aim;IN.d=HEROES[m.hero].rng*TS*.7}}
function hud(){const m=G.P[me];let t;
  if(G.mode==='gem'){const sc=teamGems();t=`<span class="tb">💎 Wir ${sc[m.team]}</span><span class="tr">${sc[1-m.team]} Gegner 💎</span>`+(G.cd?`<span class="cd">${G.cd.team===m.team?'Wir gewinnen':'Gegner gewinnt'} in ${Math.max(0,Math.ceil(G.cd.t))}</span>`:'')}
  else t=`<span class="tb">Übrig: ${G.P.filter(p=>!p.dead).length}</span><span class="tr">⚡ Kraft ${m.cubes}</span>`;
  t+='<div class="feed">'+G.feed.map(f=>`<div>${f[0]<0?'☠':esc(G.P[f[0]].name)+' ✖'} ${esc(G.P[f[1]].name)}</div>`).join('')+'</div>';
  if(t!==hudS){hudS=t;$('top').innerHTML=t}
  const sp=Math.round(m.sup*100);if(sp!==supS){supS=sp;const b=$('bSup');b.style.setProperty('--p',sp+'%');b.classList.toggle('rdy',sp>=100)}}
function showEnd(){if(!G)return;show('end');const m=G.P[me],solo=G.mode==='solo',ctl=NET.host||NET.local;let h;
  if(solo){const pl=G.rank.indexOf(me)+1,won=G.win===m.team;h=`<h2>${won?'🏆 Sieg!':'Platz '+(pl||G.P.length)+' von '+G.P.length}</h2><div class="plist">`+G.rank.slice(0,5).map((id,i)=>`<div><i style="background:${HEROES[G.P[id].hero].col}"></i>${i+1}. ${esc(G.P[id].name)}${id===me?' (du)':''} – ${G.P[id].kills} ✖</div>`).join('')+'</div>'}
  else{const won=G.win===m.team;h=`<h2>${won?'🏆 Sieg!':'Niederlage'}</h2><p class="lead">${won?'Euer Team hat die Juwelen gehalten.':'Die Gegner haben die Juwelen gehalten.'}</p><div class="plist">`+G.P.slice().sort((a,b)=>(a.team===m.team?0:1)-(b.team===m.team?0:1)||b.kills-a.kills).map(p=>`<div class="${p.team===m.team?'':'foe'}"><i style="background:${HEROES[p.hero].col}"></i>${esc(p.name)}${p.id===me?' (du)':''} – ${p.kills} ✖</div>`).join('')+'</div>'}
  h+=NET.local?'<button class="btn go" id="eAgain">🔁 Nochmal</button><button class="btn sec" id="eBack">Hauptmenü</button>':ctl?`<button class="btn go" id="eBack">${NET.pub?'Weiter':'Zurück zum Raum'}</button>`:'<p>Der Gastgeber bringt gleich alle zurück in den Raum.</p><button class="btn sec" id="eLeave">Verlassen</button>';
  $('end').innerHTML='<div class="card">'+h+'</div>';
  if($('eAgain'))$('eAgain').onclick=()=>startLocal(NET.mode);if($('eBack'))$('eBack').onclick=()=>toLobby();if($('eLeave'))$('eLeave').onclick=()=>{netClose();G=null;showMenu()}}
$('bQuit').onclick=()=>{netClose();G=null;showMenu()};
$('bSup').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(!G||!NET.playing)return;if(!(aimStick&&Math.hypot(aimStick.dx,aimStick.dy)>12))autoAim();IN.s++});

/* ---------- Eingabe: links bewegen, rechts zielen und beim Loslassen schießen ---------- */
function aimFromMouse(e){const m=G.P[me],sx=(m.x-camX)*SC,sy=(m.y-camY)*SC;IN.a=Math.atan2(e.clientY-sy,e.clientX-sx);IN.d=Math.hypot(e.clientX-sx,e.clientY-sy)/SC;aimPrev={a:IN.a,d:IN.d}}
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',e=>{if(!G||!NET.playing)return;e.preventDefault();wake();
  if(e.pointerType==='mouse'){aimFromMouse(e);if(e.button===2)IN.s++;else IN.f++;return}
  try{cv.setPointerCapture(e.pointerId)}catch(x){}
  if(e.clientX<VW/2&&!mvStick)mvStick={id:e.pointerId,ox:e.clientX,oy:e.clientY,dx:0,dy:0};else if(!aimStick)aimStick={id:e.pointerId,ox:e.clientX,oy:e.clientY,dx:0,dy:0,aim:true};
  STICKS=[mvStick,aimStick].filter(Boolean)});
cv.addEventListener('pointermove',e=>{if(!G||!NET.playing)return;if(e.pointerType==='mouse'){aimFromMouse(e);return}
  const s=mvStick&&mvStick.id===e.pointerId?mvStick:aimStick&&aimStick.id===e.pointerId?aimStick:null;if(!s)return;let dx=e.clientX-s.ox,dy=e.clientY-s.oy;const l=Math.hypot(dx,dy);if(l>SR){dx*=SR/l;dy*=SR/l}s.dx=dx;s.dy=dy;
  if(s===mvStick){IN.mx=dx/SR;IN.my=dy/SR}else if(l>12){IN.a=Math.atan2(dy,dx);IN.d=Math.min(1,l/SR)*HEROES[G.P[me].hero].rng*TS;aimPrev={a:IN.a,d:IN.d}}else aimPrev=null});
function stickUp(e){if(e.pointerType==='mouse')return;
  if(mvStick&&mvStick.id===e.pointerId){mvStick=null;IN.mx=IN.my=0}
  else if(aimStick&&aimStick.id===e.pointerId){const drag=Math.hypot(aimStick.dx,aimStick.dy)>12;aimStick=null;aimPrev=null;if(G&&NET.playing&&e.type==='pointerup'){if(!drag)autoAim();IN.f++}}
  STICKS=[mvStick,aimStick].filter(Boolean)}
cv.addEventListener('pointerup',stickUp);cv.addEventListener('pointercancel',stickUp);
window.addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='INPUT')return;keys[e.key.toLowerCase()]=true;if(e.key===' '&&G&&NET.playing){e.preventDefault();IN.s++}});
window.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
window.addEventListener('resize',resize);

/* ---------- Schleife ---------- */
function simFrame(dt){const p=G.P[me];if(p){p.mx=IN.mx;p.my=IN.my;if(IN.f!==lf){lf=IN.f;p.fa=IN.a;p.aimD=IN.d;p.fireQ=1}if(IN.s!==ls){ls=IN.s;p.fa=IN.a;p.aimD=IN.d;p.supQ=1}}
  step(dt);const f=G.fx;G.fx=[];if(f.length){applyFx(f);if(NET.host)for(const x of f)NET.fxBuf.push(x)}netSnap(dt)}
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;hostTick(dt);if(!G||!NET.playing)return;
  if(!mvStick){IN.mx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);IN.my=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)}
  if(NET.client)clientTick(dt);else{simFrame(dt);if(NET.host&&NET.pub&&G.over&&G.time-G.overT>8){toLobby();return}}
  updFx(dt);hud();render();if(G.over&&!endShown){endShown=true;setTimeout(showEnd,1300)}}
// Läuft der Gastgeber im Hintergrund, rechnet ein Zeitgeber weiter (langsamer), damit das Spiel für die anderen nicht einfriert
setInterval(()=>{if(document.hidden&&G&&NET.playing&&NET.host){for(let i=0;i<4;i++)simFrame(.05)}},200);
try{NET.name=localStorage.getItem('lb-name')||'Spieler';const h=localStorage.getItem('lb-hero');if(HEROES[h])NET.hero=h}catch(e){}
resize();showMenu();{const r=new URLSearchParams(location.search).get('raum');if(r){$('code').value=r.toUpperCase();$('msg').textContent='Raum '+r.toUpperCase()+' – Namen eingeben und auf „Beitreten“ tippen.'}}
requestAnimationFrame(loop);
