"use strict";
/* ======================= Online-Spiel (bis zu 4 Spieler) =======================
   Der Gastgeber rechnet das Spiel. Mitspieler schicken Befehle und bekommen
   mehrmals pro Sekunde den Spielstand zurück. */
const PFX='oedlandkrieg-v1-',SKEYS=['id','fac','team','name','human','dead','money','lvl','bq','uq','upg','tech','res','stats','alarm','pw'];
Object.assign(NET,{peer:null,hostConn:null,code:'',nick:'',fac:'bunker',players:[],set:{mode:'coop',ais:1,diff:'normal',size:64},playing:false,fx:[],fxS:0,fxDepth:0,acc:0,map:new Map(),first:true,seen:0,lobby:null});
try{NET.nick=localStorage.getItem('oedland-nick')||''}catch(e){}
const r2=v=>Math.round(v*100)/100,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function peerOpts(){const u=new URLSearchParams(location.search),o={debug:0};if(u.get('peerhost')){o.host=u.get('peerhost');o.port=+u.get('peerport')||9000;o.path='/';o.secure=false}return o}
function loadPeer(){return window.Peer?Promise.resolve():new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';s.onload=res;s.onerror=()=>rej(new Error('load'));document.head.appendChild(s)})}
function netPanel(html){$('overlay').classList.remove('hidden');$('panel').innerHTML=html}
function netReset(){try{if(NET.peer)NET.peer.destroy()}catch(e){}Object.assign(NET,{on:false,host:false,client:false,peer:null,hostConn:null,players:[],playing:false,fx:[],lobby:null,code:''});NET.map.clear();me=0}
NET.leave=function(){netReset();sides=[];ents=[];paused=true;$('overlay').classList.add('hidden');$('start').classList.remove('hidden')};
function netError(e,txt){const t=txt||(e&&e.type==='peer-unavailable'?'Diesen Raum gibt es nicht (mehr). Bitte prüfe den Code.':e&&e.type==='unavailable-id'?'Der Raum-Code ist schon vergeben. Bitte noch einmal versuchen.':'Die Verbindung hat nicht geklappt. Bitte prüfe dein Internet und versuche es noch einmal.');
  netReset();sides=[];ents=[];paused=true;$('start').classList.remove('hidden');netPanel(`<h2>🔌 Verbindung</h2><p>${t}</p><button class="sbtn" id="nBack">Zurück</button>`);$('nBack').onclick=()=>$('overlay').classList.add('hidden')}

/* ---------- Menü und Raum ---------- */
const inS='width:100%;box-sizing:border-box;padding:10px;font:inherit;font-size:16px;font-weight:700;background:#211910;color:#fff;border:2px solid #5b4428;border-radius:8px';
function segHTML(id,opts,cur,dis){return`<div class="seg" id="${id}">`+opts.map(([v,l])=>`<button class="opt${String(v)===String(cur)?' on':''}" data-v="${v}" ${dis&&dis(v)?'disabled style="opacity:.35"':''}>${l}</button>`).join('')+'</div>'}
function segOn(id,fn){document.querySelectorAll(`#${id} .opt`).forEach(b=>b.onclick=()=>{if(!b.disabled)fn(b.dataset.v)})}
function onlineMenu(code){const fac=NET.fac||cfg.fac;
  netPanel(`<h2>🌐 Mit anderen spielen</h2><div class="lbl">Dein Name</div><input id="nNick" maxlength="14" value="${esc(NET.nick)}" placeholder="Name" style="${inS}">
   <div class="lbl">Dein Volk</div>${segHTML('nFac',[['bunker','Bunkerleute'],['mutant','Mutanten']],fac)}
   ${code?`<p>Du wurdest in den Raum <b>${esc(code)}</b> eingeladen.</p><div class="row"><button class="sbtn" id="nJoin">▶ Beitreten</button></div>`
     :`<div class="row"><button class="sbtn" id="nHost">🏠 Eigenen Raum eröffnen</button></div><div class="lbl">Oder Raum-Code eines Mitspielers</div><input id="nCode" maxlength="5" placeholder="CODE" style="${inS};text-transform:uppercase"><div class="row"><button class="sbtn" id="nJoin">▶ Beitreten</button></div>`}
   <div class="row"><button class="sbtn" id="nBack">Zurück</button></div><div id="nMsg" style="color:#ff7a5a;min-height:20px"></div>`);
  NET.fac=fac;segOn('nFac',v=>{NET.fac=v;document.querySelectorAll('#nFac .opt').forEach(x=>x.classList.toggle('on',x.dataset.v===v))});
  const nick=()=>{const n=($('nNick').value||'').trim().slice(0,14)||'Spieler';NET.nick=n;try{localStorage.setItem('oedland-nick',n)}catch(e){}return n};
  $('nBack').onclick=()=>$('overlay').classList.add('hidden');
  if($('nHost'))$('nHost').onclick=()=>{nick();hostRoom()};
  $('nJoin').onclick=()=>{const c=(code||$('nCode').value||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5);if(c.length<5){$('nMsg').textContent='Der Raum-Code hat 5 Zeichen.';return}nick();joinRoom(c)}}
async function hostRoom(){netPanel('<h2>🌐 Raum wird eröffnet …</h2>');try{await loadPeer()}catch(e){netError({});return}
  const code=Array.from({length:5},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*31)]).join('');
  Object.assign(NET,{on:true,host:true,client:false,code,players:[{nick:NET.nick,fac:NET.fac,conn:null}],playing:false});NET.set.diff=cfg.diff;NET.set.size=cfg.size;me=0;
  const peer=new Peer(PFX+code,peerOpts());NET.peer=peer;peer.on('open',()=>showLobby());peer.on('error',e=>{if(e&&e.type==='peer-unavailable')return;if(!NET.playing||e.type==='unavailable-id')netError(e)});
  peer.on('connection',c=>{c.on('data',d=>hostData(c,d));c.on('close',()=>dropConn(c))})}
async function joinRoom(code){netPanel(`<h2>🌐 Verbinde mit Raum ${esc(code)} …</h2>`);try{await loadPeer()}catch(e){netError({});return}
  Object.assign(NET,{on:true,host:false,client:true,code,playing:false});const peer=new Peer(peerOpts());NET.peer=peer;peer.on('error',e=>netError(e));
  peer.on('open',()=>{const c=peer.connect(PFX+code,{reliable:true});NET.hostConn=c;const to=setTimeout(()=>{if(!c.open)netError({})},15000);
    c.on('open',()=>{clearTimeout(to);c.send({t:'hello',nick:NET.nick,fac:NET.fac});NET.seen=performance.now()});c.on('data',guestData);
    c.on('close',()=>{if(NET.client)netError({},'Die Verbindung zum Gastgeber ist abgebrochen.')})})}
function lobbyData(){const s=NET.set,h=NET.players.length;s.ais=clamp(s.ais,0,4-h);return{players:NET.players.map(p=>({nick:p.nick,fac:p.fac})),set:s,code:NET.code}}
function lobbySync(){const L=lobbyData();NET.players.forEach((p,i)=>{if(p.conn&&p.conn.open)p.conn.send({t:'lobby',L,you:i})});if(!NET.playing)showLobby()}
function lobbyOK(){const s=NET.set,h=NET.players.length;if(h+s.ais<2)return'Es fehlt noch ein Mitspieler oder ein Computer-Gegner.';if(s.mode==='coop'&&s.ais<1)return'„Zusammen gegen den Computer“ braucht mindestens einen Computer-Gegner.';return''}
function showLobby(){const L=NET.host?lobbyData():NET.lobby;if(!L)return;const s=L.set,host=NET.host,you=host?0:NET.you;
  const link=(location.protocol==='file:'?'https://paul-hoeser.de/oedlandkrieg/':location.origin+location.pathname)+'?raum='+L.code;
  const pl=L.players.map((p,i)=>`<div style="padding:5px 0;font-weight:700"><span style="color:${COL[i]}">■</span> ${esc(p.nick)} – ${FAC[p.fac].name}${i===0?' <span style="color:#b9a27e">(Gastgeber)</span>':''}${i===you?' <span style="color:#7aff6a">← du</span>':''}</div>`).join('');
  const modeT={coop:'Zusammen gegen den Computer',ffa:'Jeder gegen jeden'},sizeT={48:'Klein',64:'Mittel',84:'Groß'};
  let h=`<h2>🌐 Raum ${esc(L.code)}</h2>`;
  if(host)h+=`<p>Schick diesen Link an deine Mitspieler (oder nenne ihnen den Code <b>${esc(L.code)}</b>):</p><input id="lLink" readonly value="${esc(link)}" style="${inS};font-size:14px"><div class="row"><button class="sbtn" id="lCopy">📋 Link kopieren</button></div>`;
  h+=`<div class="lbl">Spieler (${L.players.length} von 4)</div>${pl}`;
  if(host){h+=`<div class="lbl">Spielart</div>${segHTML('lMode',[['coop',modeT.coop],['ffa',modeT.ffa]],s.mode)}
    <div class="lbl">Computer-Gegner</div>${segHTML('lAi',[[0,'keiner'],[1,'1'],[2,'2'],[3,'3']],s.ais,v=>+v>4-L.players.length)}
    <div class="lbl">Stärke der Computer-Gegner</div>${segHTML('lDiff',Object.keys(DIFF).map(k=>[k,DIFF[k].name]),s.diff)}
    <div class="lbl">Karte</div>${segHTML('lSize',[[48,'Klein'],[64,'Mittel'],[84,'Groß']],s.size)}
    <div id="lHint" style="color:#ff7a5a;min-height:20px;margin-top:6px">${lobbyOK()}</div>
    <div class="row"><button class="sbtn" id="lGo" ${lobbyOK()?'disabled':''}>⚔ Spiel starten</button><button class="sbtn" id="lLeave">Raum schließen</button></div>`}
  else h+=`<div class="lbl">Einstellungen des Gastgebers</div><p>${modeT[s.mode]} · Computer-Gegner: ${s.ais} (${DIFF[s.diff].name}) · Karte: ${sizeT[s.size]}</p>
    <div class="lbl">Dein Volk</div>${segHTML('lFac',[['bunker','Bunkerleute'],['mutant','Mutanten']],L.players[you]?L.players[you].fac:NET.fac)}
    <p style="color:#ffcf5a">⏳ Warte, bis der Gastgeber das Spiel startet …</p><div class="row"><button class="sbtn" id="lLeave">Raum verlassen</button></div>`;
  netPanel(h);$('lLeave').onclick=()=>NET.leave();
  if(host){const set=(k,v)=>{NET.set[k]=v;lobbySync()};segOn('lMode',v=>set('mode',v));segOn('lAi',v=>set('ais',+v));segOn('lDiff',v=>set('diff',v));segOn('lSize',v=>set('size',+v));
    $('lCopy').onclick=()=>{const i=$('lLink');i.select();try{navigator.clipboard.writeText(i.value)}catch(e){try{document.execCommand('copy')}catch(e2){}}$('lCopy').textContent='✔ Kopiert'};
    $('lGo').onclick=()=>{if(lobbyOK())return;netStart()}}
  else segOn('lFac',v=>{NET.fac=v;NET.hostConn.send({t:'fac',fac:v})})}

/* ---------- Gastgeber ---------- */
function hostData(c,d){if(!d||typeof d!=='object')return;const p=NET.players.find(x=>x.conn===c);if(p)p.seen=performance.now();
  if(d.t==='hello'){if(p)return;if(NET.playing){c.send({t:'full',why:'In diesem Raum läuft gerade ein Spiel. Bitte warte, bis es vorbei ist.'});return}if(NET.players.length>=4){c.send({t:'full',why:'Der Raum ist schon voll (4 Spieler).'});return}
    NET.players.push({nick:String(d.nick||'Spieler').slice(0,14),fac:d.fac==='mutant'?'mutant':'bunker',conn:c,seen:performance.now()});lobbySync()}
  else if(!p)return;
  else if(d.t==='fac'&&!NET.playing){p.fac=d.fac==='mutant'?'mutant':'bunker';lobbySync()}
  else if(d.t==='c'&&NET.playing&&p.sid!=null)doCmd(p.sid,d.c)}
function dropConn(c){const i=NET.players.findIndex(x=>x.conn===c);if(i<0)return;const p=NET.players[i];
  if(NET.playing&&p.sid!=null&&sides[p.sid]){const S=sides[p.sid];p.conn=null;if(!S.dead){S.human=false;const m=`${p.nick} hat das Spiel verlassen – der Computer übernimmt.`;say(m,'bad');for(const q of NET.players)if(q.conn&&q.conn.open)q.conn.send({t:'say',a:[m,'bad']})}}
  else{NET.players.splice(i,1);lobbySync()}}
NET.mkSides=function(mk){const s=NET.set,coop=s.mode==='coop',other=f=>f==='bunker'?'mutant':'bunker';sides=[];
  NET.players.forEach((p,i)=>{const S=mk(i,p.fac,true);S.name=`${p.nick} (${CNAME[i]})`;S.team=coop?0:i;p.sid=i;sides.push(S)});
  for(let k=0;k<s.ais;k++){const i=sides.length,S=mk(i,k%2?NET.players[0].fac:other(NET.players[0].fac),false);S.team=coop?1:i;sides.push(S)}};
function netStart(){const s=NET.set;NET.players=NET.players.filter(p=>!p.conn||p.conn.open);if(lobbyOK()){showLobby();return}
  cfg.fac=NET.players[0].fac;cfg.diff=s.diff;cfg.size=s.size;cfg.players=NET.players.length+s.ais;cfg.reveal=false;cfg.demo=false;speed=1;me=0;NET.playing=true;NET.fx=[];NET.acc=0;
  $('overlay').classList.add('hidden');$('start').classList.add('hidden');try{AC=AC||new(window.AudioContext||window.webkitAudioContext)()}catch(e){}
  newGame();const pub=pubSides(),tl=Array.from(tiles);
  for(const p of NET.players)if(p.conn&&p.conn.open)p.conn.send({t:'start',me:p.sid,cfg:{size:MW,diff:cfg.diff,players:cfg.players},tiles:tl,sides:pub});
  say(s.mode==='coop'?'Ihr spielt zusammen gegen den Computer':'Jeder gegen jeden – viel Glück!')}
function pubSides(){return sides.map(S=>{const o={};for(const k of SKEYS)o[k]=k==='money'?Math.floor(S[k]):S[k];return o})}
NET.tell=function(sid,txt,cls,quiet){const p=NET.players.find(x=>x.sid===sid);if(p&&p.conn&&p.conn.open&&NET.playing)p.conn.send({t:'say',a:[txt,cls,quiet]})};
NET.snap=function(dt){if(!NET.playing)return;if((NET.acc+=dt)<.11)return;NET.acc=0;const E=[];
  for(const e of ents){if(e.dead)continue;const fl=(time-(e.fT||-9)<.25?8:0)|(e.lastHit&&time-e.lastHit<3?16:0);
    if(e.k==='u')E.push([e.id,0,e.type,e.side,Math.round(e.x),Math.round(e.y),Math.ceil(e.hp),Math.round(e.max),r2(e.dir),r2(e.tdir),fl|(e.path?1:0)|(e.tgt?2:0)|(e.cd>e.s.cd-.25?4:0),e.load|0,e.vet,e.kills]);
    else E.push([e.id,1,e.type,e.side,e.tx,e.ty,Math.ceil(e.hp),Math.round(e.max),r2(e.tdir),fl|(B[e.type].cd&&e.cd>B[e.type].cd-.25?4:0)|(e.opened?32:0),e.lvl,e.up?[r2(e.up.t),e.up.total]:0,Math.round(e.charge||0),Math.round(e.oil||0),Math.round(e.scrap||0),Math.round(e.spent||0),e.rally?[Math.round(e.rally.x),Math.round(e.rally.y)]:0])}
  const d=JSON.stringify({t:r2(time),E,S:pubSides(),P:projs.map(p=>[Math.round(p.x),Math.round(p.y),Math.round(p.tx),Math.round(p.ty),p.wpn,Math.round(p.d0||0),p.spd]),N:nukes.map(n=>[Math.round(n.x),Math.round(n.y),r2(n.t),n.max,n.fac]),sh:r2(shake),F:NET.fx});NET.fx=[];NET.fxS=0;
  const now=performance.now();for(const p of NET.players)if(p.conn){if(p.conn.open)p.conn.send({t:'s',d});if(now-(p.seen||now)>20000)dropConn(p.conn)}};
NET.toLobby=function(){NET.playing=false;paused=true;for(const p of NET.players)p.sid=null;NET.players=NET.players.filter(p=>!p.conn||p.conn.open);lobbySync()};

/* ---------- Mitspieler ---------- */
NET.cmd=function(c){if(NET.hostConn&&NET.hostConn.open)NET.hostConn.send({t:'c',c})};
function guestData(d){if(!d||typeof d!=='object')return;NET.seen=performance.now();
  if(d.t==='lobby'){NET.lobby=d.L;NET.you=d.you;if(NET.playing){NET.playing=false;paused=true;sides=[];ents=[]}showLobby()}
  else if(d.t==='full')netError({},d.why)
  else if(d.t==='start')clientStart(d)
  else if(d.t==='s'&&NET.playing){try{applySnap(JSON.parse(d.d))}catch(e){console.error(e)}}
  else if(d.t==='say')say(d.a[0],d.a[1],d.a[2])}
function clientStart(d){me=d.me;cfg.size=d.cfg.size;cfg.diff=d.cfg.diff;cfg.players=d.cfg.players;cfg.reveal=false;cfg.demo=false;speed=1;hintT=12;
  nukes=[];supMode=null;shake=0;MW=MH=d.cfg.size;ents=[];projs=[];tracers=[];parts=[];pathQ=[];sel=[];marks=[];groups={};time=0;over=false;placing=null;atkMode=false;msgT={};NET.map.clear();NET.first=true;
  tiles=Uint8Array.from(d.tiles);occ=new Int32Array(MW*MH);expl=new Uint8Array(MW*MH);vis=new Uint8Array(MW*MH);wallMap=new Uint8Array(MW*MH);
  sides=d.sides;cfg.fac=sides[me].fac;srand(MW*7919+tiles[MW+5]);renderTerrain();iconCacheClear();
  $('overlay').classList.add('hidden');$('start').classList.add('hidden');try{AC=AC||new(window.AudioContext||window.webkitAudioContext)()}catch(e){}
  resize();zoom=CW>700?1.35:1.1;clampCam();NET.playing=true;paused=false;lockSig='';buildUI();
  say(sides.some(S=>S.id!==me&&S.team===sides[me].team)?'Ihr spielt zusammen gegen den Computer':'Jeder gegen jeden – viel Glück!')}
function applySnap(s){const S0=sides[me],wasDone=S0.bq&&S0.bq.done;time=s.t;
  s.S.forEach((o,i)=>{if(sides[i])Object.assign(sides[i],o)});const seen=new Set();
  for(const a of s.E){const id=a[0];seen.add(id);let e=NET.map.get(id);const fl=a[1]?a[9]:a[10];
    if(a[1]===0){if(!e){e={id,k:'u',type:a[2],side:a[3],x:a[4],y:a[5],s:stat(a[3],a[2]),anim:rnd()*6,pi:0,fT:-9};NET.map.set(id,e);ents.push(e)}
      e.nx=a[4];e.ny=a[5];e.hp=a[6];e.max=a[7];e.dir=a[8];e.tdir=a[9];e.path=fl&1?[]:null;e.tgt=fl&2?1:null;e.cd=fl&4?e.s.cd:0;e.load=a[11];e.vet=a[12];e.kills=a[13]}
    else{if(!e){const d=B[a[2]];e={id,k:'b',type:a[2],side:a[3],tx:a[4],ty:a[5],w:d.w,h:d.h,x:(a[4]+d.w/2)*T,y:(a[5]+d.h/2)*T,anim:0,born:NET.first?-9:time,fT:-9};NET.map.set(id,e);ents.push(e)}
      e.hp=a[6];e.max=a[7];e.tdir=a[8];e.cd=fl&4?B[e.type].cd:0;e.opened=!!(fl&32);e.lvl=a[10];e.up=a[11]?{t:a[11][0],total:a[11][1]}:null;e.charge=a[12];e.oil=a[13];e.scrap=a[14];e.spent=a[15];e.rally=a[16]?{x:a[16][0],y:a[16][1]}:null}
    if(fl&8){if(!e.fOn){e.fOn=1;e.fT=time}}else e.fOn=0;if(fl&16)e.lastHit=time}
  let gone=false;for(const e of ents)if(!seen.has(e.id)){e.dead=true;NET.map.delete(e.id);gone=true}
  if(gone){ents=ents.filter(e=>!e.dead);sel=sel.filter(e=>!e.dead)}
  occ.fill(0);wallMap.fill(0);for(const e of ents)if(e.k==='b'){for(let y=e.ty;y<e.ty+e.h;y++)for(let x=e.tx;x<e.tx+e.w;x++)occ[y*MW+x]=e.id;if(e.type==='wall')wallMap[e.ty*MW+e.tx]=e.side+1}
  projs=s.P.map(a=>({x:a[0],y:a[1],tx:a[2],ty:a[3],wpn:a[4],d0:a[5],spd:a[6]}));nukes=s.N.map(a=>({x:a[0],y:a[1],t:a[2],max:a[3],fac:a[4]}));if(s.sh>shake)shake=s.sh;
  for(const f of s.F){const n=f[0];try{
    if(n==='tr')tracers.push({x1:f[1],y1:f[2],x2:f[3],y2:f[4],l:f[5],c:f[6],w:f[7]||undefined});
    else if(n==='decalWreck')decalWreck({x:f[1],y:f[2],dir:f[3],s:{r:f[4]}});
    else if(n==='decalRubble')decalRubble({tx:f[1],ty:f[2],w:f[3],h:f[4],x:(f[1]+f[3]/2)*T,y:(f[2]+f[4]/2)*T});
    else if(n==='boom')boom(f[1],f[2],f[3],!!f[4],!!f[5]);
    else if(['flash','floatTxt','decalBlood','decalScorch','sfx'].includes(n))window[n](...f.slice(1))}catch(e){}}
  if(NET.first){NET.first=false;for(const e of ents){e.x=e.nx??e.x;e.y=e.ny??e.y}home();computeVis()}
  if(S0.bq&&S0.bq.done&&!wasDone){tab='b';document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x.dataset.t==='b'));buildUI()}
  if(placing&&!(S0.bq&&S0.bq.done))placing=null}
NET.tick=function(dt){if(!NET.playing)return;time+=dt;const k=Math.min(1,dt*14);
  for(const e of ents){e.anim+=dt;if(e.k==='u'){e.x+=(e.nx-e.x)*k;e.y+=(e.ny-e.y)*k}}
  for(const p of projs){const d=dist(p.x,p.y,p.tx,p.ty),st=p.spd*dt;if(d>st){p.x+=(p.tx-p.x)/d*st;p.y+=(p.ty-p.y)/d*st}}
  for(const n of nukes)n.t=Math.max(0,n.t-dt);if(shake>0)shake=Math.max(0,shake-dt);
  updParts(dt);for(const m of marks)m.l-=dt*1.5;marks=marks.filter(m=>m.l>0);if((visT+=dt)>.2){visT=0;computeVis()}
  hints(dt);checkEnd();if(performance.now()-NET.seen>12000&&NET.client)netError({},'Die Verbindung zum Gastgeber ist abgebrochen.');};

/* ---------- Effekte für die Mitspieler mitschreiben ---------- */
{const R=v=>Math.round(v),enc={boom:a=>[R(a[0]),R(a[1]),r2(a[2]),a[3]?1:0,a[4]?1:0],flash:a=>[R(a[0]),R(a[1]),R(a[2]),a[3]],floatTxt:a=>[R(a[0]),R(a[1]),a[2],a[3]],decalBlood:a=>[R(a[0]),R(a[1]),a[2]],decalScorch:a=>[R(a[0]),R(a[1]),R(a[2])],
    decalWreck:a=>[R(a[0].x),R(a[0].y),r2(a[0].dir),a[0].s.r],decalRubble:a=>[a[0].tx,a[0].ty,a[0].w,a[0].h],sfx:a=>a[1]==null||NET.fxS++>10?null:[a[0],R(a[1]),R(a[2])]};
  for(const nm in enc){const f=window[nm];window[nm]=function(...a){if(NET.host&&NET.playing&&!NET.fxDepth&&NET.fx.length<220){const e=enc[nm](a);if(e)NET.fx.push([nm,...e])}NET.fxDepth++;try{return f.apply(this,a)}finally{NET.fxDepth--}}}
  const f1=fire;fire=function(a,t){const n=tracers.length;f1(a,t);if(NET.host&&NET.playing)for(let i=n;i<tracers.length&&NET.fx.length<220;i++){const q=tracers[i];NET.fx.push(['tr',R(q.x1),R(q.y1),R(q.x2),R(q.y2),q.l,q.c,q.w||0])}}}
/* ---------- Gastgeber rechnet weiter, auch wenn sein Fenster im Hintergrund ist; Mitspieler melden sich alle 3 Sekunden ---------- */
try{const w=new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),50)'],{type:'text/javascript'})));let lt=0;
  requestAnimationFrame(function f(){NET.raf=performance.now();requestAnimationFrame(f)});
  w.onmessage=()=>{const now=performance.now(),dt=Math.min(.1,(now-lt)/1000);lt=now;
    if((document.hidden||now-(NET.raf||0)>300)&&NET.host&&NET.playing&&sides.length){time+=dt;step(dt);NET.snap(dt)}
    if(NET.client&&now-(NET.pingAt||0)>3000){NET.pingAt=now;if(NET.hostConn&&NET.hostConn.open)NET.hostConn.send({t:'p'})}}}catch(e){}
$('bOnline').onclick=()=>onlineMenu();
{const rc=new URLSearchParams(location.search).get('raum');if(rc)onlineMenu(rc.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5))}
