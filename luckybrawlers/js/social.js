"use strict";
/* ======================= Lucky Brawlers – Freunde, Einladungen, Team-Sprüche, Sprechen im privaten Raum =======================
   Jedes Gerät hat eine feste Kennung. Solange das Spiel offen ist, ist es unter dieser Kennung für Freunde erreichbar (Einladungen).
   Im Raum meldet jeder seine Kennung; der Gastgeber verteilt die Liste – so landen Mitspieler in der Freundesliste. */
const SAY=['👍 Gut gemacht!','🆘 Hilfe!','⚔️ Angriff!','🛡️ Zurück!','💎 Ich hab die Juwelen!','🎯 Auf den da!','😂 Haha!','🙏 Danke!'];
const SOC={uid:'',pp:null,fr:{},on:{},conns:{},inv:[],ros:[],say:{},sayAt:0,voice:false,stream:null,calls:{},aud:{},ld:null,toastT:0};
try{SOC.uid=localStorage.getItem('lb-uid')||'';SOC.fr=JSON.parse(localStorage.getItem('lb-friends')||'{}')||{}}catch(e){}
if(!/^[a-z0-9]{10}$/.test(SOC.uid)){SOC.uid='';for(let i=0;i<10;i++)SOC.uid+='abcdefghijklmnopqrstuvwxyz0123456789'[(Math.random()*36)|0];try{localStorage.setItem('lb-uid',SOC.uid)}catch(e){}}

document.head.insertAdjacentHTML('beforeend',`<style>
#bChat,#bMic{position:absolute;left:8px;pointer-events:auto;width:46px;height:46px;border-radius:14px;border:2px solid rgba(255,255,255,.25);background:rgba(12,14,36,.78);color:#fff;font-size:22px;cursor:pointer}
#bChat{top:calc(58px + env(safe-area-inset-top))}#bMic{top:calc(112px + env(safe-area-inset-top))}#bMic.on{background:#22b455;border-color:#fff}
#chatP{position:absolute;left:62px;top:calc(58px + env(safe-area-inset-top));pointer-events:auto;display:grid;grid-template-columns:1fr 1fr;gap:6px;background:rgba(12,14,36,.9);border:2px solid rgba(255,255,255,.25);border-radius:16px;padding:8px;max-width:min(330px,calc(100vw - 74px))}
#chatP button{font:inherit;font-size:16px;font-weight:bold;color:#fff;background:#4a56d6;border:0;border-radius:11px;padding:10px 6px;cursor:pointer}
#toast{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:30;background:#ffd23f;color:#1b1730;font-weight:bold;padding:10px 16px;border-radius:14px;max-width:92vw;text-align:center;box-shadow:0 6px 18px rgba(0,0,0,.4)}
#invite{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:31;width:min(440px,94vw);background:#1b1f4a;border:3px solid #ffd23f;border-radius:18px;padding:14px;display:flex;flex-direction:column;gap:10px;box-shadow:0 8px 26px rgba(0,0,0,.5)}
.fr{display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.25);border-radius:12px;padding:6px 8px 6px 12px}.fr span{font-weight:bold;flex:1;text-align:left}.fr small{color:#c9ceff;font-size:16px}
.fr .dot{width:13px;height:13px;border-radius:50%;background:#6b7096;flex:none}.fr .dot.on{background:#3fe06a;box-shadow:0 0 8px #3fe06a}.fr .dot.busy{background:#ffb03a}
.fr .x{font:inherit;background:none;border:0;color:#aab0e8;font-size:18px;cursor:pointer;padding:4px 6px}#friends,#xFr,#lbx{display:flex;flex-direction:column;gap:7px}
</style>`);
$('hud').insertAdjacentHTML('beforeend','<button id="bChat" title="Team-Sprüche">💬</button><button id="bMic" class="hidden" title="Sprechen">🎤</button><div id="chatP" class="hidden"></div>');
document.body.insertAdjacentHTML('beforeend','<div id="toast" class="hidden"></div><div id="invite" class="hidden"></div>');
$('bTrain').insertAdjacentHTML('beforebegin','<div id="friends"></div>');
$('chatP').innerHTML=SAY.map((s,i)=>`<button data-i="${i}">${s}</button>`).join('');
function toast(t){const e=$('toast');e.textContent=t;e.classList.remove('hidden');clearTimeout(SOC.toastT);SOC.toastT=setTimeout(()=>e.classList.add('hidden'),3200)}
function roomLink(){return location.origin+location.pathname+'?raum='+NET.code}

/* ---------- Freundesliste ---------- */
function saveFriends(){const ids=Object.keys(SOC.fr).sort((a,b)=>SOC.fr[b].t-SOC.fr[a].t);for(const id of ids.slice(40))delete SOC.fr[id];try{localStorage.setItem('lb-friends',JSON.stringify(SOC.fr))}catch(e){}}
function addFriend(uid,name){if(!/^[a-z0-9]{10}$/.test(uid)||uid===SOC.uid)return;const neu=!SOC.fr[uid];SOC.fr[uid]={n:String(name||'Spieler').slice(0,12),t:Date.now()};saveFriends();if(neu)pollFriends();drawFriends()}
function friendIds(){return Object.keys(SOC.fr).sort((a,b)=>SOC.fr[b].t-SOC.fr[a].t).slice(0,15)}
function drawFriends(){const ids=friendIds(),row=(id,inRoom)=>{const o=SOC.on[id],st=!o?'off':o.busy?'busy':'on';return`<div class="fr"><i class="dot ${st}"></i><span>${esc(SOC.fr[id].n)}</span><small>${st==='on'?'ist da':st==='busy'?'spielt gerade':'nicht da'}</small>${st==='on'?`<button class="btn sm" data-u="${id}">Einladen</button>`:''}${inRoom?'':`<button class="x" data-x="${id}" title="Aus der Liste nehmen">✕</button>`}</div>`};
  $('friends').innerHTML='<label>Freunde</label>'+(ids.length?ids.map(id=>row(id,false)).join(''):'<p class="how">Hier erscheint automatisch jeder, mit dem du schon gespielt hast. Ist ein Freund gerade im Spiel-Menü, kannst du ihn mit einem Tipp einladen.</p>');
  const x=$('xFr');if(x){const here=SOC.ros.map(e=>e.uid),l=ids.filter(id=>!here.includes(id)&&SOC.on[id]);x.innerHTML=l.length?l.map(id=>row(id,true)).join(''):'<p class="how">Freunde, die das Spiel gerade offen haben, kannst du hier direkt einladen.</p>'}}
function frClick(e){const u=e.target.dataset.u,x=e.target.dataset.x;if(x){delete SOC.fr[x];saveFriends();drawFriends()}else if(u)invite(u)}
$('friends').onclick=frClick;
function invite(uid){if(NET.code&&NET.lobby&&!NET.lobby.pub&&!NET.playing){sendInvite(uid);return}SOC.inv.push(uid);if(NET.host||NET.client)netClose();$('bPriv').click()}
function sendInvite(uid){const c=SOC.conns[uid],n=SOC.fr[uid]?SOC.fr[uid].n:'Dein Freund';if(c&&c.open){c.send({t:'inv',code:NET.code,name:NET.name,mode:NET.mode,uid:SOC.uid});toast('Einladung an '+n+' geschickt.')}else toast(n+' hat das Spiel gerade nicht offen – schick den Link.')}

/* ---------- Erreichbarkeit: fester Anschluss je Gerät ---------- */
function socLoad(cb){if(window.Peer)return cb();if(SOC.ld){SOC.ld.push(cb);return}SOC.ld=[cb];const s=document.createElement('script');s.src='https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';s.onload=()=>{const l=SOC.ld;SOC.ld=null;l.forEach(f=>f())};s.onerror=()=>{SOC.ld=null};document.head.appendChild(s)}
function presence(){socLoad(()=>{if(SOC.pp&&!SOC.pp.destroyed)return;const p=SOC.pp=new Peer(PFX+'u-'+SOC.uid,peerOpts());
  p.on('open',pollFriends);p.on('connection',c=>c.on('data',d=>presData(c,d,null)));p.on('disconnected',()=>{try{p.reconnect()}catch(e){}});
  p.on('error',e=>{if(e.type==='peer-unavailable'){const id=(String(e.message).match(/-u-([a-z0-9]{10})/)||[])[1];if(id){delete SOC.conns[id];delete SOC.on[id];drawFriends()}}})})}
function pollFriends(){const p=SOC.pp;if(!p||!p.open)return;for(const uid of friendIds()){const c=SOC.conns[uid],q={t:'q',uid:SOC.uid,name:NET.name};
    if(c){if(c.open)c.send(q);continue}const n=SOC.conns[uid]=p.connect(PFX+'u-'+uid,{reliable:true});n.on('open',()=>n.send(q));n.on('data',d=>presData(n,d,uid));
    n.on('close',()=>{if(SOC.conns[uid]===n){delete SOC.conns[uid];delete SOC.on[uid];drawFriends()}})}}
function presData(c,d,uid){if(!d)return;
  if(d.t==='q')c.send({t:'st',busy:!!NET.playing,name:NET.name});
  else if(d.t==='st'&&uid&&SOC.fr[uid]){SOC.on[uid]={busy:!!d.busy};if(d.name)SOC.fr[uid].n=String(d.name).slice(0,12);drawFriends()}
  else if(d.t==='inv'){if(!SOC.fr[d.uid])return;if(NET.playing){c.send({t:'no',name:NET.name});return}showInvite(d,c)}
  else if(d.t==='ok')toast(String(d.name).slice(0,12)+' kommt!');
  else if(d.t==='no')toast(String(d.name).slice(0,12)+' kann gerade nicht.')}
function showInvite(d,c){const e=$('invite'),code=String(d.code||'').replace(/[^A-Z0-9]/g,'').slice(0,8),mode=MODES[d.mode]?d.mode:'gem';e.innerHTML=`<p class="lead"><b>${esc(String(d.name).slice(0,12))}</b> lädt dich ein!</p><p>${MODES[mode].n}</p><div class="row"><button class="btn go" id="invY">Mitspielen</button><button class="btn sec" id="invN">Nein</button></div>`;
  e.classList.remove('hidden');beep(700,1100,.18,.07,'sine');const hide=()=>{e.classList.add('hidden');clearTimeout(tm)},tm=setTimeout(()=>{hide();try{c.send({t:'no',name:NET.name})}catch(x){}},25000);
  $('invN').onclick=()=>{hide();try{c.send({t:'no',name:NET.name})}catch(x){}};
  $('invY').onclick=()=>{hide();try{c.send({t:'ok',name:NET.name})}catch(x){}wake();readName();showWait('Verbinde mit dem Raum …');joinRoom(code,()=>netFail('Der Raum ist voll oder das Spiel läuft schon.'),()=>netFail('Diesen Raum gibt es nicht (mehr).'))}}

/* ---------- Im Raum: Kennungen austauschen, Sprüche, Sprechen ---------- */
function rosSync(){if(!NET.host||!NET.peer)return;SOC.ros=NET.players.map(p=>({uid:p.conn?p.uid||'':SOC.uid,name:p.name,peer:p.conn?p.conn.peer:NET.peer.id,vo:p.conn?!!p.vo:SOC.voice,gi:p.pid}));for(const p of NET.players)if(p.conn&&p.conn.open)p.conn.send({t:'ros',r:SOC.ros});rosApply()}
function rosApply(){for(const e of SOC.ros)if(e.uid)addFriend(e.uid,e.name);voiceSync();lobbyExtra()}
function sayAll(pid,i){SOC.say[pid]={i,t:performance.now()};for(const p of NET.players)if(p.conn&&p.conn.open)p.conn.send({t:'say',p:pid,i})}
function say(i){const now=performance.now();if(!G||!NET.playing||now-SOC.sayAt<1200)return;SOC.sayAt=now;if(NET.client){if(NET.hc&&NET.hc.open)NET.hc.send({t:'say',i})}else sayAll(me,i)}
$('bChat').onclick=()=>$('chatP').classList.toggle('hidden');
$('chatP').onclick=e=>{const i=e.target.dataset.i;if(i!==undefined){say(+i);$('chatP').classList.add('hidden')}};

async function voiceToggle(){if(SOC.voice)voiceOff();else{try{SOC.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});SOC.voice=true}catch(e){toast('Das Mikrofon ist nicht freigegeben.');return}}
  if(NET.host)rosSync();else{if(NET.hc&&NET.hc.open)NET.hc.send({t:'vo',on:SOC.voice});voiceSync();lobbyExtra()}}
function dropCall(id){const k=SOC.calls[id];delete SOC.calls[id];try{if(k)k.close()}catch(e){}const a=SOC.aud[id];if(a){a.srcObject=null;a.remove();delete SOC.aud[id]}}
function voiceOff(){SOC.voice=false;if(SOC.stream){SOC.stream.getTracks().forEach(t=>t.stop());SOC.stream=null}for(const id of Object.keys(SOC.calls))dropCall(id)}
function voiceCall(call){const id=call.peer;SOC.calls[id]=call;call.on('stream',st=>{let a=SOC.aud[id];if(!a){a=SOC.aud[id]=document.createElement('audio');a.autoplay=true;a.playsInline=true;document.body.appendChild(a)}a.srcObject=st;a.play().catch(()=>{});voiceMute()});
  const end=()=>{if(SOC.calls[id]===call)dropCall(id)};call.on('close',end);call.on('error',end)}
function voiceSync(){const p=NET.peer;if(!p)return;if(!p._lbv){p._lbv=1;p.on('call',call=>{if(!SOC.voice||NET.pub){try{call.close()}catch(e){}return}call.answer(SOC.stream);voiceCall(call)})}
  if(SOC.voice&&!NET.pub)for(const e of SOC.ros)if(e.peer!==p.id&&e.vo&&!SOC.calls[e.peer]&&p.id<e.peer)voiceCall(p.call(e.peer,SOC.stream));
  for(const id of Object.keys(SOC.calls))if(!SOC.voice||!SOC.ros.some(e=>e.peer===id&&e.vo))dropCall(id);voiceMute()}
// Im 3 gegen 3 hört man beim Spielen nur das eigene Team, im Raum alle
function voiceMute(){const m=G&&NET.playing&&G.mode==='gem'?G.P[me]:null;for(const e of SOC.ros){const a=SOC.aud[e.peer];if(a){const q=m&&G.P[e.gi];a.muted=!!(q&&q.team!==m.team)}}
  const n=SOC.ros.filter(e=>e.vo).length,b=$('bMic'),x=$('xMic');b.classList.toggle('on',SOC.voice);if(x){x.textContent=SOC.voice?'🎤 Sprechen: an ('+n+')':'🎤 Sprechen: aus'+(n?' ('+n+' sprechen)':'');x.classList.toggle('on',SOC.voice)}}
$('bMic').onclick=voiceToggle;
function lobbyExtra(){const L=NET.lobby,el=$('lobby');if(!L||L.pub||el.classList.contains('hidden')||!$('lLeave'))return;
  if(!$('lbx')){$('lLeave').insertAdjacentHTML('beforebegin','<div id="lbx"><div class="row"><button class="btn sm" id="xShare">📤 Einladung teilen</button><button class="btn sm" id="xMic"></button></div><div id="xFr"></div></div>');
    $('xMic').onclick=voiceToggle;$('xFr').onclick=frClick;$('xShare').onclick=()=>{const url=roomLink(),text=NET.name+' lädt dich zu Lucky Brawlers ein! Raum-Code: '+NET.code;
      if(navigator.share)navigator.share({title:'Lucky Brawlers',text,url}).catch(()=>{});else{try{navigator.clipboard.writeText(text+' '+url);toast('Einladung kopiert – jetzt einfügen und abschicken.')}catch(e){toast(url)}}}}
  drawFriends();voiceMute()}

/* ---------- Einhängen in Netzwerk, Menü, Raum und Bild ---------- */
{const hd=hostData,cd=clientData,ls=lobbySync,sm=startMatch,hdp=hostDrop,nc=netClose,sl=showLobby,smn=showMenu,sp=startPlay,rn=render;
  hostData=function(c,d){const pl=d&&NET.players.find(p=>p.conn===c);if(pl&&d.t==='id'){pl.seen=performance.now();pl.uid=/^[a-z0-9]{10}$/.test(d.uid)?d.uid:'';rosSync();return}
    if(pl&&d.t==='vo'){pl.vo=!!d.on&&!NET.pub;rosSync();return}if(pl&&d.t==='say'){if(NET.playing&&SAY[d.i|0])sayAll(pl.pid,d.i|0);return}hd(c,d)};
  clientData=function(d){if(d.t==='ros'){SOC.ros=Array.isArray(d.r)?d.r:[];rosApply();return}if(d.t==='say'){SOC.say[d.p]={i:d.i|0,t:performance.now()};return}cd(d);
    const c=NET.hc;if(c&&c.open&&!c._lbId){c._lbId=1;c.send({t:'id',uid:SOC.uid})}};
  lobbySync=function(){ls();if(NET.peer&&NET.peer.open)rosSync()};startMatch=function(){sm();if(!NET.local)rosSync()};hostDrop=function(c){hdp(c);rosSync()};
  netClose=function(){voiceOff();SOC.ros=[];SOC.say={};nc()};
  showLobby=function(){sl();const L=NET.lobby;if(L&&!L.pub&&NET.code&&SOC.inv.length&&(!NET.host||(NET.peer&&NET.peer.open))){const l=SOC.inv;SOC.inv=[];l.forEach(sendInvite)}lobbyExtra()};
  showMenu=function(m){smn(m);drawFriends();pollFriends()};
  startPlay=function(){sp();$('chatP').classList.add('hidden');$('bMic').classList.toggle('hidden',NET.local||NET.pub);voiceMute()};
  // Sprechblasen: im 3 gegen 3 nur fürs eigene Team sichtbar
  render=function(){rn();if(!G||!NET.playing)return;const m=G.P[me],now=performance.now(),c=cx;c.setTransform(DPR,0,0,DPR,0,0);c.textAlign='center';c.font='bold 15px "Trebuchet MS",sans-serif';
    for(const id in SOC.say){const s=SOC.say[id],q=G.P[id],age=(now-s.t)/1000;if(age>2.8||!q){delete SOC.say[id];continue}if(q.dead||(G.mode==='gem'&&q.team!==m.team)||!visibleTo(m,q))continue;
      if(!s.snd){s.snd=1;beep(880,1250,.09,.04,'sine')}const tx=SAY[s.i]||'',w=c.measureText(tx).width+20,x=clamp((q.x-camX)*SC,w/2+6,VW-w/2-6),y=Math.max(40,(q.y-camY-76)*SC)-Math.max(0,.15-age)*60;
      c.globalAlpha=Math.min(1,(2.8-age)*3);c.fillStyle='#fff';c.strokeStyle='#1b1730';c.lineWidth=2.5;c.beginPath();c.roundRect(x-w/2,y-28,w,28,11);c.fill();c.stroke();c.beginPath();c.moveTo(x-7,y-1);c.lineTo(x,y+9);c.lineTo(x+7,y-1);c.fill();c.stroke();
      c.fillRect(x-6,y-4,12,4);c.fillStyle='#1b1730';c.fillText(tx,x,y-9);c.globalAlpha=1}}}
drawFriends();presence();setInterval(()=>{if(!NET.playing)pollFriends()},20000);
