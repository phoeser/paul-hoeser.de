"use strict";
/* ======================= Luke Brawlers – Regeln und Simulation (rechnet beim Gastgeber) ======================= */
const TS=40,PR=15;
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>v<a?a:v>b?b:v,dist=(a,b,c,d)=>Math.hypot(a-c,b-d);
// rl: Sekunden je Schuss nachladen, rng: Reichweite in Feldern
const HEROES={
 luke:{n:'Captain Luke',d:'Allrounder mit Dreifach-Blaster',hp:3600,spd:150,col:'#2f7bff',rl:1.5,rng:8,atk:{k:'burst',n:3,dmg:420,spd:520,gap:.09,spread:.03,r:5},sup:{k:'rockets',n:6,dmg:520,spd:440,r:8,ex:50},sn:'Raketensalve'},
 rex:{n:'Robo-Rex',d:'Panzer-Roboter, stark aus der Nähe',hp:5200,spd:138,col:'#ff8a1e',rl:1.7,rng:4.6,atk:{k:'fan',n:5,dmg:340,spd:480,arc:.5,r:5},sup:{k:'dash',dmg:900,len:6},sn:'Rammstoß'},
 nina:{n:'Nina Ninja',d:'Blitzschnell, wirft Wurfsterne',hp:3000,spd:178,col:'#b04cff',rl:1.2,rng:6.5,atk:{k:'fan',n:3,dmg:400,spd:600,arc:.22,r:5},sup:{k:'dash',dmg:1200,len:7},sn:'Schattensprung'},
 zappa:{n:'Zappa',d:'Magierin mit weitem Blitzstrahl',hp:2800,spd:150,col:'#18c7c7',rl:1.9,rng:10,atk:{k:'bolt',dmg:900,spd:760,r:6,pierce:true},sup:{k:'zone',dmg:450,r:110,dur:4},sn:'Gewitterfeld'},
 bert:{n:'Bumm-Bert',d:'Wirft Bomben über Mauern',hp:3200,spd:145,col:'#e23b3b',rl:1.8,rng:7.5,atk:{k:'lob',dmg:800,ex:58,time:.8},sup:{k:'lob',dmg:1900,ex:105,time:1},sn:'Riesenbombe'},
 flora:{n:'Doc Flora',d:'Heilt Freunde, piekst Feinde',hp:3300,spd:152,col:'#3fc04f',rl:1.4,rng:7.5,atk:{k:'bolt',dmg:560,spd:560,r:7,heal:480},sup:{k:'heal',amt:2200,r:130},sn:'Heilkreis'}
};
const HKEYS=Object.keys(HEROES);
const BOTNAMES=['Blitz','Keks','Turbo','Pixel','Flitzer','Brummer','Zack','Wumms','Schnipp','Krümel','Rakete','Pfeffer'];
const MODES={gem:{n:'Juwelenjagd',d:'3 gegen 3 – wer 10 Juwelen hält, gewinnt',size:6,W:19,H:27},solo:{n:'Jeder gegen jeden',d:'10 Kämpfer – der Letzte gewinnt',size:10,W:33,H:33}};
let G=null,me=-1;
function rng(seed){let s=seed>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}

/* ---------- Karte: 0 Boden, 1 Mauer, 2 Busch, 3 Kiste, 4 Wasser ---------- */
function genMap(mode,seed){const M=MODES[mode],W=M.W,H=M.H,t=new Uint8Array(W*H),R=rng(seed),cx=W>>1,cy=H>>1;
  const set=(x,y,v)=>{if(x>0&&y>0&&x<W-1&&y<H-1)t[y*W+x]=v};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!x||!y||x===W-1||y===H-1)t[y*W+x]=1;
  const sym=(x,y,v)=>{set(x,y,v);set(W-1-x,H-1-y,v);if(mode==='solo'){set(W-1-x,y,v);set(x,H-1-y,v)}};
  for(let i=0;i<(mode==='gem'?16:22);i++){const x=1+(R()*(W-2)|0),y=1+(R()*(H>>1)|0),k=R(),v=k<.45?1:k<.85?2:4,len=2+(R()*3|0),hor=R()<.5;
    for(let j=0;j<len;j++){const px=x+(hor?j:0),py=y+(hor?0:j);sym(px,py,v);if(v===2&&R()<.7)sym(px+(hor?0:1),py+(hor?1:0),2)}}
  const clear=(x,y,r)=>{for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)set(x+i,y+j,0)};
  clear(cx,cy,2);const spawns=[];
  if(mode==='gem'){for(const tm of[0,1])for(let i=0;i<3;i++){const sx=cx-3+i*3,sy=tm?2:H-3;clear(sx,sy,1);spawns.push({x:sx,y:sy,team:tm})}}
  else{for(let i=0;i<10;i++){const a=i/10*Math.PI*2,sx=Math.round(cx+Math.cos(a)*W*.4),sy=Math.round(cy+Math.sin(a)*H*.4);clear(sx,sy,1);spawns.push({x:sx,y:sy,team:i})}
    for(let i=0;i<26;i++){const x=2+(R()*(W-4)|0),y=2+(R()*(H-4)|0);if(!t[y*W+x]&&!spawns.some(s=>Math.abs(s.x-x)<2&&Math.abs(s.y-y)<2)&&Math.abs(x-cx)+Math.abs(y-cy)>2)t[y*W+x]=3}}
  // Jeder Startplatz muss die Mitte erreichen können
  const seen=new Uint8Array(W*H),q=[cy*W+cx];seen[q[0]]=1;while(q.length){const i=q.pop();for(const d of[1,-1,W,-W]){const j=i+d;if(!seen[j]&&(t[j]===0||t[j]===2)){seen[j]=1;q.push(j)}}}
  for(const s of spawns)if(!seen[s.y*W+s.x]){let x=s.x,y=s.y;while(x!==cx||y!==cy){if(x!==cx)x+=Math.sign(cx-x);else y+=Math.sign(cy-y);const v=t[y*W+x];if(v!==0&&v!==2)t[y*W+x]=0}}
  return{W,H,t,spawns}}
function newGame(mode,seed,plist){const m=genMap(mode,seed);
  G={mode,seed,W:m.W,H:m.H,t:m.t,spawns:m.spawns,time:0,P:[],shots:[],zones:[],gems:[],cubes:[],crate:{},fx:[],over:false,win:-1,overT:0,gemT:3,cd:null,rank:[],feed:[],R:rng(seed+7)};
  for(let i=0;i<G.t.length;i++)if(G.t[i]===3)G.crate[i]=1800;
  const used=[0,0];plist.forEach((p,i)=>{const sp=mode==='gem'?m.spawns.filter(s=>s.team===p.team)[used[p.team]++%3]:m.spawns[i%m.spawns.length],hk=HEROES[p.hero]?p.hero:'luke',h=HEROES[hk],x=(sp.x+.5)*TS,y=(sp.y+.5)*TS;
    G.P.push({id:i,name:p.name,hero:hk,team:mode==='gem'?p.team:i,bot:!!p.bot,x,y,sx:x,sy:y,tx:x,ty:y,hp:h.hp,max:h.hp,ammo:3,sup:0,aim:mode==='gem'&&p.team?Math.PI/2:-Math.PI/2,mx:0,my:0,fa:0,aimD:0,fireQ:0,supQ:0,dead:false,resp:0,gems:0,cubes:0,hitT:-9,shotT:-9,shield:2,dash:null,burst:null,kills:0,gasT:0,ai:{t:G.R()*.3,next:null,strafe:1,gx:null,gy:null,fire:null,ox:0}})});
  return G}
const tileAt=(x,y)=>{const tx=Math.floor(x/TS),ty=Math.floor(y/TS);return tx<0||ty<0||tx>=G.W||ty>=G.H?1:G.t[ty*G.W+tx]};
const blocksMove=v=>v===1||v===3||v===4,blocksShot=v=>v===1||v===3;
function canStand(x,y){const r=PR-3;return!blocksMove(tileAt(x-r,y-r))&&!blocksMove(tileAt(x+r,y-r))&&!blocksMove(tileAt(x-r,y+r))&&!blocksMove(tileAt(x+r,y+r))}
function movePlayer(p,dx,dy){if(canStand(p.x+dx,p.y))p.x+=dx;if(canStand(p.x,p.y+dy))p.y+=dy}
function los(x0,y0,x1,y1){const n=Math.ceil(dist(x0,y0,x1,y1)/(TS*.4));for(let i=1;i<n;i++){const k=i/n;if(blocksShot(tileAt(x0+(x1-x0)*k,y0+(y1-y0)*k)))return false}return true}
const teamGems=()=>{const s=[0,0];for(const p of G.P)s[p.team]+=p.gems;return s};
const gasR=()=>Math.max(TS*3.5,G.W*TS*.75-Math.max(0,G.time-18)*9);
const dmgMul=p=>1+p.cubes*.1;
// Im Busch ist man für Gegner unsichtbar, außer ganz nah oder kurz nach einem Schuss
function visibleTo(a,q){if(q.dead)return false;if(a.team===q.team)return true;const rec=q.rec!=null?q.rec:G.time-q.shotT<.8;return!(tileAt(q.x,q.y)===2&&dist(a.x,a.y,q.x,q.y)>TS*2.2&&!rec)}

/* ---------- Kampf ---------- */
function hurt(p,d,src){if(p.dead||p.shield>0||G.over)return;p.hp-=d;p.hitT=G.time;G.fx.push(['hit',p.x|0,p.y|0,Math.round(d)]);if(src&&src!==p)src.sup=Math.min(1,src.sup+d/4200);if(p.hp<=0)die(p,src)}
function die(p,src){p.dead=true;p.hp=0;p.dash=null;p.burst=null;p.mx=p.my=0;G.fx.push(['die',p.x|0,p.y|0,p.id]);if(src&&src!==p){src.kills++;G.feed.push([src.id,p.id])}else G.feed.push([-1,p.id]);
  if(G.mode==='gem'){for(let i=0;i<p.gems;i++)dropGem(p.x+(G.R()-.5)*70,p.y+(G.R()-.5)*70);p.gems=0;p.resp=3}
  else{G.rank.unshift(p.id);for(let i=0;i<Math.max(1,p.cubes);i++)G.cubes.push({x:clamp(p.x+(G.R()-.5)*50,TS*1.4,(G.W-1.4)*TS),y:clamp(p.y+(G.R()-.5)*50,TS*1.4,(G.H-1.4)*TS)});
    const al=G.P.filter(q=>!q.dead);if(al.length<=1){if(al[0])G.rank.unshift(al[0].id);endGame(al[0]?al[0].team:-1)}}}
function dropGem(x,y){x=clamp(x,TS*1.5,(G.W-1.5)*TS);y=clamp(y,TS*1.5,(G.H-1.5)*TS);if(blocksMove(tileAt(x,y))){x=G.W*TS/2;y=G.H*TS/2}G.gems.push({x,y})}
function endGame(team){if(G.over)return;G.over=true;G.win=team;G.overT=G.time}
function shoot(p,ang,sp){const h=HEROES[p.hero],a=sp?h.sup:h.atk,mul=dmgMul(p),ox=p.x+Math.cos(ang)*PR,oy=p.y+Math.sin(ang)*PR,rg=h.rng*TS;
  const bullet=(an,o)=>G.shots.push(Object.assign({k:'b',x:ox,y:oy,vx:Math.cos(an)*a.spd,vy:Math.sin(an)*a.spd,r:a.r,dmg:a.dmg*mul,team:p.team,own:p.id,life:rg/a.spd,hero:p.hero,hit:[]},o));
  switch(a.k){
    case'burst':p.burst={n:a.n,t:0,ang};break;
    case'fan':for(let i=0;i<a.n;i++)bullet(ang+(i/(a.n-1)-.5)*a.arc*2,{});break;
    case'bolt':bullet(ang,{pierce:a.pierce,heal:a.heal});break;
    case'rockets':for(let i=0;i<a.n;i++)bullet(ang+(i/(a.n-1)-.5)*.5,{ex:a.ex,life:rg*1.1/a.spd});break;
    case'lob':{const d=clamp(p.aimD||rg*.8,TS,rg);G.shots.push({k:'l',x:p.x,y:p.y,sx:p.x,sy:p.y,tx:p.x+Math.cos(ang)*d,ty:p.y+Math.sin(ang)*d,t:0,time:a.time,dmg:a.dmg*mul,ex:a.ex,team:p.team,own:p.id,big:sp});break}
    case'dash':p.dash={t:0,dur:a.len*TS/620,vx:Math.cos(ang)*620,vy:Math.sin(ang)*620,dmg:a.dmg*mul,hit:[]};p.shield=Math.max(p.shield,.25);break;
    case'zone':{const d=clamp(p.aimD||rg*.6,TS,rg*.85);G.zones.push({k:'z',x:p.x+Math.cos(ang)*d,y:p.y+Math.sin(ang)*d,r:a.r,dmg:a.dmg*mul,t:a.dur,tick:0,team:p.team,own:p.id});break}
    case'heal':G.zones.push({k:'h',x:p.x,y:p.y,r:a.r,dmg:0,t:.6,tick:9,team:p.team,own:p.id});for(const q of G.P)if(!q.dead&&q.team===p.team&&dist(q.x,q.y,p.x,p.y)<a.r){q.hp=Math.min(q.max,q.hp+a.amt);G.fx.push(['heal',q.x|0,q.y|0,a.amt])}break}
  p.shotT=G.time;p.aim=ang;G.fx.push(['shot',p.x|0,p.y|0,p.hero+(sp?'!':'')])}
function crateHit(tx,ty,dmg){const i=ty*G.W+tx;if(G.t[i]!==3)return;if((G.crate[i]-=dmg)<=0){G.t[i]=0;delete G.crate[i];G.cubes.push({x:(tx+.5)*TS,y:(ty+.5)*TS});G.fx.push(['crate',(tx+.5)*TS|0,(ty+.5)*TS|0,i])}}
function boomAt(x,y,r,dmg,team,own){G.fx.push(['boom',x|0,y|0,r|0]);const src=G.P[own];for(const q of G.P)if(!q.dead&&q.team!==team&&dist(q.x,q.y,x,y)<r+PR)hurt(q,dmg,src);
  if(G.mode==='solo')for(let ty=Math.floor((y-r)/TS);ty<=Math.floor((y+r)/TS);ty++)for(let tx=Math.floor((x-r)/TS);tx<=Math.floor((x+r)/TS);tx++)if(tx>0&&ty>0&&tx<G.W&&ty<G.H)crateHit(tx,ty,dmg)}
function updShots(dt){for(const s of G.shots){
    if(s.k==='l'){s.t+=dt;const k=Math.min(1,s.t/s.time);s.x=s.sx+(s.tx-s.sx)*k;s.y=s.sy+(s.ty-s.sy)*k;if(k>=1){s.done=true;boomAt(s.tx,s.ty,s.ex,s.dmg,s.team,s.own)}continue}
    const n=Math.max(1,Math.ceil(Math.hypot(s.vx,s.vy)*dt/10));
    for(let i=0;i<n&&!s.done;i++){s.x+=s.vx*dt/n;s.y+=s.vy*dt/n;const tv=tileAt(s.x,s.y);
      if(blocksShot(tv)){s.done=true;if(tv===3)crateHit(Math.floor(s.x/TS),Math.floor(s.y/TS),s.dmg);if(s.ex)boomAt(s.x,s.y,s.ex,s.dmg*.6,s.team,s.own);else G.fx.push(['puff',s.x|0,s.y|0,0]);break}
      for(const q of G.P){if(q.dead||q.id===s.own||s.hit.includes(q.id)||dist(q.x,q.y,s.x,s.y)>PR+s.r)continue;
        if(q.team===s.team){if(s.heal&&q.hp<q.max){q.hp=Math.min(q.max,q.hp+s.heal);G.fx.push(['heal',q.x|0,q.y|0,s.heal]);s.done=true;break}continue}
        s.hit.push(q.id);if(s.ex)boomAt(s.x,s.y,s.ex,s.dmg,s.team,s.own);else hurt(q,s.dmg,G.P[s.own]);if(!s.pierce){s.done=true;break}}}
    if((s.life-=dt)<=0&&!s.done){s.done=true;if(s.ex)boomAt(s.x,s.y,s.ex,s.dmg,s.team,s.own)}}
  G.shots=G.shots.filter(s=>!s.done)}
function updZones(dt){for(const z of G.zones){z.t-=dt;if(z.k==='z'&&(z.tick-=dt)<=0){z.tick=.5;for(const q of G.P)if(!q.dead&&q.team!==z.team&&dist(q.x,q.y,z.x,z.y)<z.r+PR)hurt(q,z.dmg,G.P[z.own])}}G.zones=G.zones.filter(z=>z.t>0)}

/* ---------- Ein Zeitschritt ---------- */
function step(dt){if(!G)return;G.time+=dt;if(G.over)return;
  for(const p of G.P){
    if(p.dead){if(G.mode==='gem'&&(p.resp-=dt)<=0){p.dead=false;p.x=p.sx;p.y=p.sy;p.hp=p.max;p.ammo=3;p.shield=2.5}continue}
    if(p.bot)botThink(p,dt);
    const h=HEROES[p.hero];p.shield=Math.max(0,p.shield-dt);p.ammo=Math.min(3,p.ammo+dt/h.rl);
    if(G.time-p.hitT>3&&G.time-p.shotT>3&&p.hp<p.max)p.hp=Math.min(p.max,p.hp+p.max*.13*dt);
    if(p.dash){const d=p.dash;movePlayer(p,d.vx*dt,d.vy*dt);for(const q of G.P)if(!q.dead&&q.team!==p.team&&!d.hit.includes(q.id)&&dist(q.x,q.y,p.x,p.y)<PR*2.4){d.hit.push(q.id);hurt(q,d.dmg,p)}if((d.t+=dt)>=d.dur)p.dash=null}
    else{let l=Math.hypot(p.mx,p.my);if(l>1){p.mx/=l;p.my/=l;l=1}if(l>.05){movePlayer(p,p.mx*h.spd*dt,p.my*h.spd*dt);if(G.time-p.shotT>.35)p.aim=Math.atan2(p.my,p.mx)}}
    if(p.fireQ){p.fireQ=0;if(p.ammo>=1&&!p.burst&&!p.dash){p.ammo-=1;shoot(p,p.fa,false)}}
    if(p.supQ){p.supQ=0;if(p.sup>=1&&!p.dash){p.sup=0;shoot(p,p.fa,true)}}
    if(p.burst){p.burst.t-=dt;if(p.burst.t<=0){const a=h.atk,an=p.burst.ang+(G.R()-.5)*a.spread*2;G.shots.push({k:'b',x:p.x+Math.cos(an)*PR,y:p.y+Math.sin(an)*PR,vx:Math.cos(an)*a.spd,vy:Math.sin(an)*a.spd,r:a.r,dmg:a.dmg*dmgMul(p),team:p.team,own:p.id,life:h.rng*TS/a.spd,hero:p.hero,hit:[]});p.burst.t=a.gap;if(--p.burst.n<=0)p.burst=null}}
    if(G.mode==='gem'){for(const g of G.gems)if(!g.got&&dist(g.x,g.y,p.x,p.y)<PR+12){g.got=true;p.gems++;G.fx.push(['gem',g.x|0,g.y|0,0])}}
    else{for(const c of G.cubes)if(!c.got&&dist(c.x,c.y,p.x,p.y)<PR+12){c.got=true;p.cubes++;p.max+=400;p.hp+=400;G.fx.push(['cube',c.x|0,c.y|0,0])}
      if(dist(p.x,p.y,G.W*TS/2,G.H*TS/2)>gasR()){if((p.gasT+=dt)>.5){p.gasT=0;p.shield=0;hurt(p,500,null)}}}}
  G.gems=G.gems.filter(g=>!g.got);G.cubes=G.cubes.filter(c=>!c.got);updShots(dt);updZones(dt);
  if(G.mode==='gem'&&!G.over){if((G.gemT-=dt)<=0){G.gemT=7;if(G.gems.length<14){const a=G.R()*7;dropGem(G.W*TS/2+Math.cos(a)*50,G.H*TS/2+Math.sin(a)*50);G.fx.push(['spawn',G.W*TS/2|0,G.H*TS/2|0,0])}}
    const sc=teamGems(),lead=sc[0]>=10&&sc[0]>sc[1]?0:sc[1]>=10&&sc[1]>sc[0]?1:-1;if(lead<0)G.cd=null;else{if(!G.cd||G.cd.team!==lead)G.cd={team:lead,t:15};G.cd.t-=dt;if(G.cd.t<=0)endGame(lead)}}
  if(G.feed.length>4)G.feed.splice(0,G.feed.length-4)}

/* ---------- Computergegner ---------- */
function pathNext(p,gx,gy){const W=G.W,s=Math.floor(p.y/TS)*W+Math.floor(p.x/TS),g=clamp(Math.floor(gy/TS),1,G.H-2)*W+clamp(Math.floor(gx/TS),1,W-2);if(s===g)return null;
  const from=new Int32Array(W*G.H).fill(-1),q=[g];from[g]=g;for(let k=0;k<q.length;k++){const i=q[k];if(i===s)break;for(const d of[1,-1,W,-W]){const j=i+d;if(from[j]<0&&!blocksMove(G.t[j])){from[j]=i;q.push(j)}}}
  if(from[s]<0)return null;const n=from[s];return{x:(n%W+.5)*TS,y:(Math.floor(n/W)+.5)*TS}}
function steer(p){const ai=p.ai,n=ai.next,tx=n?n.x:ai.gx,ty=n?n.y:ai.gy;if(tx==null){p.mx=p.my=0;return}const dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy);if(d<6){p.mx=p.my=0;if(n)ai.next=pathNext(p,ai.gx,ai.gy);return}p.mx=dx/d;p.my=dy/d}
function botThink(p,dt){const ai=p.ai,h=HEROES[p.hero],rg=h.rng*TS;if((ai.t-=dt)>0){steer(p);return}ai.t=.18+G.R()*.1;
  let tg=null,td=1e9;for(const q of G.P)if(q.team!==p.team&&visibleTo(p,q)){const d=dist(p.x,p.y,q.x,q.y);if(d<td){td=d;tg=q}}
  const cx=G.W*TS/2,cy=G.H*TS/2;let gx=cx,gy=cy;
  if(G.mode==='gem'){let bd=TS*10,bg=null;for(const g of G.gems){const d=dist(p.x,p.y,g.x,g.y);if(d<bd){bd=d;bg=g}}const sc=teamGems();
    if(p.gems>=4&&sc[p.team]>=10){gx=p.sx;gy=p.sy+(p.team?TS*3:-TS*3)}else if(bg){gx=bg.x;gy=bg.y}else{if(!ai.ox)ai.ox=(G.R()-.5)*TS*5;gx=cx+ai.ox;gy=cy+(p.team?-TS*2:TS*2)}}
  else{let bd=TS*9,b=null;for(const c of G.cubes){const d=dist(p.x,p.y,c.x,c.y);if(d<bd){bd=d;b=c}}
    if(b){gx=b.x;gy=b.y}else{let ci=-1;bd=TS*8;for(const k in G.crate){const x=(k%G.W+.5)*TS,y=(Math.floor(k/G.W)+.5)*TS,d=dist(p.x,p.y,x,y);if(d<bd&&dist(x,y,cx,cy)<gasR()){bd=d;ci=+k;gx=x;gy=y}}
      if(ci>=0){if(!tg&&bd<rg*.8)ai.fire={a:Math.atan2(gy-p.y,gx-p.x),d:bd};if(bd<TS*1.7){gx=p.x;gy=p.y}}
      else{gx=cx+Math.cos(p.id*2+G.time*.05)*gasR()*.4;gy=cy+Math.sin(p.id*2+G.time*.05)*gasR()*.4}}
    if(dist(p.x,p.y,cx,cy)>gasR()*.88){gx=cx;gy=cy}}
  if(tg){const inR=td<rg*.92,see=h.atk.k==='lob'||los(p.x,p.y,tg.x,tg.y);
    if(inR&&see){const tm=h.atk.spd?td/h.atk.spd:h.atk.time,ts=HEROES[tg.hero].spd*tm*.6;ai.fire={a:Math.atan2(tg.y+tg.my*ts-p.y,tg.x+tg.mx*ts-p.x)+(G.R()-.5)*.22,d:td,sup:p.sup>=1}}
    if(p.hp<p.max*.33){if(G.mode==='gem'){gx=p.sx;gy=p.sy}else{gx=p.x-(tg.x-p.x);gy=p.y-(tg.y-p.y)}}
    else if(td<TS*9&&(G.mode==='solo'||td<TS*5||p.gems<3)){if(h.rng<5||td>rg*.8||!see){gx=tg.x;gy=tg.y}else if(td<rg*.45){gx=p.x-(tg.x-p.x);gy=p.y-(tg.y-p.y)}
      else{if(G.R()<.15)ai.strafe=-ai.strafe;const a=Math.atan2(tg.y-p.y,tg.x-p.x)+Math.PI/2*ai.strafe;gx=p.x+Math.cos(a)*TS*2;gy=p.y+Math.sin(a)*TS*2}}}
  ai.gx=clamp(gx,TS*1.5,(G.W-1.5)*TS);ai.gy=clamp(gy,TS*1.5,(G.H-1.5)*TS);ai.next=pathNext(p,ai.gx,ai.gy);
  if(ai.fire){const f=ai.fire;ai.fire=null;p.fa=f.a;p.aimD=f.d;if(f.sup)p.supQ=1;else if(p.ammo>=1&&G.R()<.75)p.fireQ=1}
  steer(p)}
