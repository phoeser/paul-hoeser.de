"use strict";
/* ======================= Lucky Brawlers – Räume und Netzwerk (PeerJS). Der Gastgeber rechnet, Mitspieler schicken ihre Eingaben. ======================= */
const PFX='luckybrawlers-v1-';
const NET={peer:null,host:false,client:false,local:false,hc:null,players:[],code:'',pub:false,mode:'gem',lobby:null,you:0,playing:false,cdT:0,cdS:-1,fxBuf:[],snapT:0,sendT:0,name:'Spieler',hero:'luke'};
function loadPeer(cb){if(window.Peer)return cb();const s=document.createElement('script');s.src='https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';s.onload=cb;s.onerror=()=>netFail('Keine Verbindung zum Internet – online spielen geht gerade nicht.');document.head.appendChild(s)}
function peerOpts(){const q=new URLSearchParams(location.search);return q.get('peerhost')?{host:q.get('peerhost'),port:+q.get('peerport')||9000,path:'/',secure:false}:{}}
function netClose(){try{if(NET.peer)NET.peer.destroy()}catch(e){}Object.assign(NET,{peer:null,host:false,client:false,local:false,hc:null,players:[],code:'',pub:false,lobby:null,playing:false,fxBuf:[]})}
function netFail(msg){netClose();G=null;showMenu(msg)}

/* ---------- Gastgeber ---------- */
function hostRoom(id,pub,mode,onTaken){loadPeer(()=>{netClose();const p=NET.peer=new Peer(PFX+id,peerOpts());let ok=false;
  Object.assign(NET,{host:true,pub,mode,code:id,you:0,players:[{name:NET.name,hero:NET.hero,conn:null}],cdT:pub?25:0,cdS:-1});
  p.on('open',()=>{ok=true;lobbySync()});
  p.on('connection',c=>{c.on('data',d=>hostData(c,d));c.on('close',()=>hostDrop(c));c.on('error',()=>hostDrop(c))});
  p.on('disconnected',()=>{try{p.reconnect()}catch(e){}});
  p.on('error',e=>{if(e.type==='peer-unavailable')return;if(!ok){if(e.type==='unavailable-id'&&onTaken)onTaken();else netFail(e.type==='unavailable-id'?'Dieser Raum ist schon vergeben.':'Verbindung fehlgeschlagen ('+e.type+').')}})})}
function lobbyInfo(){return{players:NET.players.map(p=>({name:p.name,hero:p.hero})),mode:NET.mode,pub:NET.pub,code:NET.code,cd:NET.pub?Math.max(0,Math.ceil(NET.cdT)):0}}
function lobbySync(){NET.lobby=lobbyInfo();NET.players.forEach((p,i)=>{if(p.conn&&p.conn.open)p.conn.send({t:'lobby',L:NET.lobby,you:i})});if(!NET.playing)showLobby()}
function hostData(c,d){if(!d)return;const i=NET.players.findIndex(p=>p.conn===c);
  if(d.t==='hi'){if(i>=0)return;if(NET.playing||NET.players.length>=MODES[NET.mode].size){c.send({t:'busy'});setTimeout(()=>{try{c.close()}catch(e){}},400);return}
    NET.players.push({name:String(d.name||'Spieler').slice(0,12),hero:HEROES[d.hero]?d.hero:'luke',conn:c});if(NET.pub&&NET.players.length===2)NET.cdT=Math.min(NET.cdT,12);lobbySync();return}
  if(i<0)return;const pl=NET.players[i];
  if(d.t==='hero'&&!NET.playing){if(HEROES[d.hero])pl.hero=d.hero;lobbySync()}
  else if(d.t==='in'&&NET.playing&&G){const p=G.P[pl.pid];if(!p)return;p.mx=clamp(+d.mx||0,-1,1);p.my=clamp(+d.my||0,-1,1);
    if(d.f!==pl.f){pl.f=d.f;p.fa=+d.a||0;p.aimD=+d.d||0;p.fireQ=1}if(d.s!==pl.s){pl.s=d.s;p.fa=+d.a||0;p.aimD=+d.d||0;p.supQ=1}}}
function hostDrop(c){const i=NET.players.findIndex(p=>p.conn===c);if(i<0)return;const pl=NET.players[i];NET.players.splice(i,1);if(NET.playing&&G){const p=G.P[pl.pid];if(p)p.bot=true}else lobbySync()}
function hostTick(dt){if(!NET.host||NET.playing||!NET.pub)return;NET.cdT-=dt;const s=Math.ceil(NET.cdT);if(s!==NET.cdS){NET.cdS=s;lobbySync()}if(NET.cdT<=0)startMatch()}
function startMatch(){const mode=NET.mode,M=MODES[mode],seed=(Math.random()*1e9)|0,pl=[];NET.players=NET.players.filter(p=>!p.conn||p.conn.open).slice(0,M.size);
  NET.players.forEach((p,i)=>{p.pid=i;p.f=0;p.s=0;pl.push({name:p.name,hero:p.hero,team:mode==='gem'?(NET.pub?i%2:(i<3?0:1)):0,bot:false})});
  const names=BOTNAMES.slice().sort(()=>Math.random()-.5);
  while(pl.length<M.size)pl.push({name:names[pl.length%names.length],hero:HKEYS[(Math.random()*HKEYS.length)|0],team:mode==='gem'?(pl.filter(p=>p.team===0).length<3?0:1):0,bot:true});
  newGame(mode,seed,pl);me=0;NET.playing=true;NET.fxBuf=[];NET.snapT=0;for(const p of NET.players)if(p.conn&&p.conn.open)p.conn.send({t:'start',mode,seed,pl,you:p.pid});startPlay()}
function startLocal(mode){netClose();Object.assign(NET,{local:true,mode,players:[{name:NET.name,hero:NET.hero,conn:null}]});startMatch()}
function toLobby(){NET.playing=false;G=null;if(NET.local||!NET.host){netClose();showMenu();return}NET.cdT=NET.pub?(NET.players.length>1?12:25):0;NET.cdS=-1;lobbySync()}
function netSnap(dt){if(!NET.host||(NET.snapT+=dt)<1/15)return;NET.snapT=0;const fx=NET.fxBuf;NET.fxBuf=[];if(!NET.players.some(p=>p.conn))return;
  const s={t:'s',g:[+G.time.toFixed(2),G.over?1:0,G.win,G.cd?G.cd.team:-1,G.cd?Math.ceil(G.cd.t):0],
    p:G.P.map(p=>[p.x|0,p.y|0,p.hp|0,p.max,(p.ammo*10)|0,(p.sup*100)|0,+p.aim.toFixed(2),(p.dead?1:0)|(p.shield>0?2:0),G.mode==='gem'?p.gems:p.cubes,+(p.resp||0).toFixed(1),p.kills,G.time-p.shotT<.8?1:0]),
    s:G.shots.map(q=>q.k==='l'?[1,q.sx|0,q.sy|0,q.tx|0,q.ty|0,+q.t.toFixed(2),q.time,q.team,q.big?1:0,q.ex]:[0,q.x|0,q.y|0,q.vx|0,q.vy|0,q.r,q.team,q.hero]),
    z:G.zones.map(z=>[z.x|0,z.y|0,z.r,z.k,z.team,+z.t.toFixed(1)]),i:(G.mode==='gem'?G.gems:G.cubes).map(g=>[g.x|0,g.y|0]),fx,fd:G.feed,rk:G.rank};
  for(const p of NET.players)if(p.conn&&p.conn.open)p.conn.send(s)}

/* ---------- Mitspieler ---------- */
function joinRoom(id,onBusy,onNone){loadPeer(()=>{netClose();const p=NET.peer=new Peer(undefined,peerOpts());NET.client=true;let st=0;   // 0 offen, 1 drin, 2 abgebrochen
  const to=setTimeout(()=>{if(!st){st=2;onNone()}},8000);
  p.on('open',()=>{const c=NET.hc=p.connect(PFX+id,{reliable:true});
    c.on('open',()=>c.send({t:'hi',name:NET.name,hero:NET.hero}));
    c.on('data',d=>{if(st===2||!d)return;if(d.t==='busy'){st=2;clearTimeout(to);onBusy();return}if(!st){st=1;clearTimeout(to);NET.code=id}clientData(d)});
    c.on('close',()=>{if(st===1&&NET.hc===c)netFail('Die Verbindung zum Gastgeber ist abgerissen.')})});
  p.on('error',e=>{if(st)return;st=2;clearTimeout(to);if(e.type==='peer-unavailable')onNone();else netFail('Verbindung fehlgeschlagen ('+e.type+').')})})}
// „Schnelles Spiel“: offene Räume der Reihe nach probieren; ist keiner da, selbst einen eröffnen
function quickPlay(mode,n){n=n||1;if(n>4){netFail('Alle offenen Räume sind gerade voll. Versuch es gleich noch einmal.');return}showWait('Suche einen offenen Raum …');
  const id='pub-'+mode+'-'+n;joinRoom(id,()=>quickPlay(mode,n+1),()=>hostRoom(id,true,mode,()=>quickPlay(mode,n+1)))}
function clientData(d){
  if(d.t==='lobby'){NET.lobby=d.L;NET.you=d.you;NET.mode=d.L.mode;NET.pub=d.L.pub;if(NET.playing){NET.playing=false;G=null}showLobby()}
  else if(d.t==='start'){newGame(d.mode,d.seed,d.pl);me=d.you;NET.playing=true;startPlay()}
  else if(d.t==='s'&&G&&NET.playing)applySnap(d)}
function applySnap(d){const g=d.g;G.time=g[0];G.over=!!g[1];G.win=g[2];G.cd=g[3]>=0?{team:g[3],t:g[4]}:null;
  d.p.forEach((a,i)=>{const p=G.P[i];if(!p)return;const was=p.dead;p.tx=a[0];p.ty=a[1];p.hp=a[2];p.max=a[3];p.ammo=a[4]/10;p.sup=a[5]/100;p.aim=a[6];p.dead=!!(a[7]&1);p.shield=a[7]&2?1:0;if(G.mode==='gem')p.gems=a[8];else p.cubes=a[8];p.resp=a[9];p.kills=a[10];p.rec=!!a[11];
    if(was&&!p.dead||dist(p.x,p.y,p.tx,p.ty)>TS*4){p.x=p.tx;p.y=p.ty}});
  G.shots=d.s.map(a=>{if(a[0]){const k=Math.min(1,a[5]/a[6]);return{k:'l',sx:a[1],sy:a[2],tx:a[3],ty:a[4],t:a[5],time:a[6],team:a[7],big:!!a[8],ex:a[9],x:a[1]+(a[3]-a[1])*k,y:a[2]+(a[4]-a[2])*k}}return{k:'b',x:a[1],y:a[2],vx:a[3],vy:a[4],r:a[5],team:a[6],hero:a[7]}});
  G.zones=d.z.map(a=>({x:a[0],y:a[1],r:a[2],k:a[3],team:a[4],t:a[5]}));const it=d.i.map(a=>({x:a[0],y:a[1]}));if(G.mode==='gem')G.gems=it;else G.cubes=it;
  G.feed=d.fd;G.rank=d.rk;if(d.fx&&d.fx.length)applyFx(d.fx)}
function clientTick(dt){G.time+=dt;const k=Math.min(1,dt*16);for(const p of G.P){p.x+=(p.tx-p.x)*k;p.y+=(p.ty-p.y)*k}
  for(const s of G.shots){if(s.k==='l'){s.t+=dt;const q=Math.min(1,s.t/s.time);s.x=s.sx+(s.tx-s.sx)*q;s.y=s.sy+(s.ty-s.sy)*q}else{s.x+=s.vx*dt;s.y+=s.vy*dt}}
  if((NET.sendT+=dt)>=.05&&NET.hc&&NET.hc.open){NET.sendT=0;NET.hc.send({t:'in',mx:+IN.mx.toFixed(2),my:+IN.my.toFixed(2),a:+IN.a.toFixed(2),d:IN.d|0,f:IN.f,s:IN.s})}}
