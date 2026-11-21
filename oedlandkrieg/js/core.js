"use strict";
/* ======================= Kartengenerator ======================= */
function noise2(w,h,sc){const gw=Math.ceil(w/sc)+2,gh=Math.ceil(h/sc)+2,g=[];for(let i=0;i<gw*gh;i++)g.push(sr());
  const f=t=>t*t*(3-2*t);return(x,y)=>{const gx=x/sc,gy=y/sc,ix=gx|0,iy=gy|0,fx=f(gx-ix),fy=f(gy-iy),a=g[iy*gw+ix],b=g[iy*gw+ix+1],c=g[(iy+1)*gw+ix],d=g[(iy+1)*gw+ix+1];return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy}}
function genMap(){srand((Math.random()*1e9)|0);tiles=new Uint8Array(MW*MH);occ=new Int32Array(MW*MH);expl=new Uint8Array(MW*MH);vis=new Uint8Array(MW*MH);wallMap=new Uint8Array(MW*MH);
  const n1=noise2(MW,MH,7),n2=noise2(MW,MH,3);
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const v=n1(x,y)*.75+n2(x,y)*.25;if(v>.66||x===0||y===0||x===MW-1||y===MH-1)tiles[y*MW+x]=1}
  const m=8,NP=cfg.players||2,cs=[{x:m,y:MH-m-2},{x:MW-m-2,y:m},{x:m,y:m},{x:MW-m-2,y:MH-m-2}];let starts;
  if(NP===2)starts=sr()<.5?[cs[1],cs[0]]:[cs[0],cs[1]];else{for(let i=3;i>0;i--){const j=(sr()*(i+1))|0;[cs[i],cs[j]]=[cs[j],cs[i]]}starts=cs.slice(0,NP)}
  const sA=starts[0];
  const clear=(cx,cy,r)=>{for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)if(x>0&&y>0&&x<MW-1&&y<MH-1&&Math.hypot(x-cx,y-cy)<=r)tiles[y*MW+x]=0};
  for(const s of starts)clear(s.x,s.y,9);
  const fields=[],place=(x,y)=>{x=clamp(x|0,2,MW-4);y=clamp(y|0,2,MH-4);if(fields.some(f=>Math.abs(f.x-x)<5&&Math.abs(f.y-y)<5))return;clear(x+1,y+1,3);fields.push({x,y})};
  for(const s of starts){const dx=Math.sign(MW/2-s.x),dy=Math.sign(MH/2-s.y);place(s.x+dx*6,s.y-dy*1);place(s.x-dx*2,s.y+dy*6);place(s.x+dx*7,s.y+dy*7)}
  const mid=Math.round(MW/2),cnt=(MW>70?7:MW>50?5:3)+(NP-2);
  for(let i=0;i<cnt;i++){const a=i/cnt*Math.PI*2+sr();place(mid+Math.cos(a)*MW*.18,mid+Math.sin(a)*MH*.18)}
  for(let i=0;i<cnt;i++)place(4+sr()*(MW-8),4+sr()*(MH-8));
  for(const f of fields)for(let y=f.y;y<f.y+2;y++)for(let x=f.x;x<f.x+2;x++)tiles[y*MW+x]=2;
  const scraps=[],placeS=(x,y)=>{x=clamp(x|0,2,MW-4);y=clamp(y|0,2,MH-4);if(fields.some(f=>Math.abs(f.x-x)<4&&Math.abs(f.y-y)<4)||scraps.some(f=>Math.abs(f.x-x)<5&&Math.abs(f.y-y)<5))return;clear(x+1,y+1,2);scraps.push({x,y})};
  for(const s0 of starts){const dx=Math.sign(MW/2-s0.x),dy=Math.sign(MH/2-s0.y);placeS(s0.x-dx*1,s0.y-dy*7)}
  for(let i=0;i<cnt+1;i++)placeS(4+sr()*(MW-8),4+sr()*(MH-8));
  for(const f of scraps)for(let y=f.y;y<f.y+2;y++)for(let x=f.x;x<f.x+2;x++)tiles[y*MW+x]=3;
  const techs=[];for(let i=0;i<(MW>70?3:2);i++){const a=sr()*Math.PI*2,r=MW*.08+sr()*MW*.12;const x=clamp((mid+Math.cos(a)*r)|0,4,MW-6),y=clamp((mid+Math.sin(a)*r)|0,4,MH-6);
    if(fields.some(f=>Math.abs(f.x-x)<4&&Math.abs(f.y-y)<4)||scraps.some(f=>Math.abs(f.x-x)<4&&Math.abs(f.y-y)<4)||techs.some(t=>Math.abs(t.x-x)<6&&Math.abs(t.y-y)<6))continue;clear(x+1,y+1,3);techs.push({x,y})}
  // Verbindung sicherstellen
  const reach=()=>{const seen=new Uint8Array(MW*MH),q=[sA.y*MW+sA.x];seen[q[0]]=1;while(q.length){const i=q.pop(),x=i%MW,y=(i/MW)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const j=(y+dy)*MW+x+dx;if(!seen[j]&&tiles[j]!==1){seen[j]=1;q.push(j)}}}return seen};
  const carve=(ax,ay,bx,by)=>{let x=ax,y=ay;let g=0;while((x!==bx||y!==by)&&g++<500){if(sr()<.5&&x!==bx)x+=Math.sign(bx-x);else if(y!==by)y+=Math.sign(by-y);else x+=Math.sign(bx-x);for(let yy=y-1;yy<=y+1;yy++)for(let xx=x-1;xx<=x+1;xx++)if(xx>0&&yy>0&&xx<MW-1&&yy<MH-1&&tiles[yy*MW+xx]===1)tiles[yy*MW+xx]=0}};
  for(const t of[...starts.slice(1),...fields,...scraps,...techs.map(t=>({x:t.x,y:t.y-1}))]){const s=reach();if(!s[t.y*MW+t.x])carve(sA.x,sA.y,t.x,t.y)}
  return{starts,fields,techs,scraps}}

/* ======================= Wegfindung ======================= */
function findPath(sx,sy,gx,gy){sx=clamp(sx,0,MW-1);sy=clamp(sy,0,MH-1);
  if(blocked(gx,gy)){const g=nearestFree(gx,gy,8);if(!g)return null;gx=g.x;gy=g.y}
  if(sx===gx&&sy===gy)return[];
  const N=MW*MH,gs=new Float32Array(N).fill(1e9),from=new Int32Array(N).fill(-1),closed=new Uint8Array(N);
  const heap=[],push=(i,f)=>{heap.push([f,i]);let k=heap.length-1;while(k>0){const p=(k-1)>>1;if(heap[p][0]<=heap[k][0])break;[heap[p],heap[k]]=[heap[k],heap[p]];k=p}},
   pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===k)break;[heap[m],heap[k]]=[heap[k],heap[m]];k=m}}return top};
  const s=sy*MW+sx,goal=gy*MW+gx,h=(x,y)=>{const dx=Math.abs(x-gx),dy=Math.abs(y-gy);return Math.max(dx,dy)+.414*Math.min(dx,dy)};
  gs[s]=0;push(s,h(sx,sy));let it=0,best=s,bestH=1e9;
  while(heap.length&&it++<9000){const[,i]=pop();if(closed[i])continue;closed[i]=1;if(i===goal){best=i;break}
    const x=i%MW,y=(i/MW)|0,hh=h(x,y);if(hh<bestH){bestH=hh;best=i}
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(blocked(nx,ny))continue;if(dx&&dy&&(blocked(x+dx,y)||blocked(x,y+dy)))continue;
      const j=ny*MW+nx,ng=gs[i]+(dx&&dy?1.414:1);if(ng<gs[j]){gs[j]=ng;from[j]=i;push(j,ng+h(nx,ny))}}}
  const p=[];let c=best;while(c!==s&&c>=0){p.push(c);c=from[c]}p.reverse();
  // glätten
  const pts=p.map(i=>({x:i%MW,y:(i/MW)|0}));const out=[];let cx=sx,cy=sy,k=0;
  while(k<pts.length){let far=k;for(let j=pts.length-1;j>k;j--)if(los(cx,cy,pts[j].x,pts[j].y)){far=j;break}out.push(pts[far]);cx=pts[far].x;cy=pts[far].y;k=far+1}
  return out.map(q=>({x:q.x*T+16,y:q.y*T+16}))}
function los(x0,y0,x1,y1){const dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),n=Math.max(dx,dy)*4;for(let i=1;i<=n;i++){const t=i/n,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t;
  for(const[ox,oy]of[[-.48,-.48],[.48,-.48],[-.48,.48],[.48,.48]])if(blocked(Math.round(x+ox),Math.round(y+oy)))return false}return true}
function nearestFree(x,y,R){for(let r=0;r<=R;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;if(!blocked(x+dx,y+dy))return{x:x+dx,y:y+dy}}return null}

/* ======================= Objekte ======================= */
function addUnit(side,type,x,y){const s=stat(side,type);const u={id:nextId++,k:'u',type,side,x,y,hp:s.hp,max:s.hp,s,dir:sr()*6,tdir:0,path:null,pi:0,ord:null,tgt:null,cd:sr(),vet:0,kills:0,acq:0,anim:rnd()*6,gx:x,gy:y,load:0,st:'idle',stT:0,repath:0};
  ents.push(u);if(side>=0)sides[side].stats.made++;return u}
function addBld(side,type,tx,ty){const d=B[type];const b={id:nextId++,k:'b',type,side,tx,ty,w:d.w,h:d.h,x:(tx+d.w/2)*T,y:(ty+d.h/2)*T,hp:d.hp,max:d.hp,cd:0,tgt:null,anim:0,born:time,rally:null,oil:type==='der'?9000:0,opened:false,tdir:1.5,lvl:1,spent:d.cost||0,up:null};
  if(side>=0&&b.type!=='tech'){const lvl=sides[side].lvl;if(lvl>1&&type==='hq'){b.max=b.hp=d.hp*1.3}if(sides[side].human){b.max*=1.15;b.hp=b.max}}
  for(let y=ty;y<ty+d.h;y++)for(let x=tx;x<tx+d.w;x++)occ[y*MW+x]=b.id;if(type==='wall')wallMap[ty*MW+tx]=side+1;
  // Einheiten aus dem Weg schieben
  for(const e of ents)if(e.k==='u'&&!e.s.air&&e.x>tx*T-4&&e.x<(tx+d.w)*T+4&&e.y>ty*T-4&&e.y<(ty+d.h)*T+4){const f=nearestFree((e.x/T)|0,(e.y/T)|0,6);if(f){e.x=f.x*T+16;e.y=f.y*T+16;e.path=null}}
  ents.push(b);return b}
const alive=e=>e&&!e.dead;
const own=(s,t)=>ents.filter(e=>!e.dead&&e.k==='b'&&e.side===s&&(!t||e.type===t));
const hostile=(a,b)=>a>=0&&b>=0&&a!==b&&sides[a].team!==sides[b].team;
const foes=s=>ents.filter(e=>!e.dead&&e.k==='b'&&hostile(e.side,s));
function tell(sid,txt,cls,quiet){if(sid===me)say(txt,cls,quiet);else if(NET.host)NET.tell(sid,txt,cls,quiet)}
function act(c){if(NET.client)NET.cmd(c);else doCmd(me,c)}
const units=(s,t)=>ents.filter(e=>!e.dead&&e.k==='u'&&e.side===s&&(!t||e.type===t));
function edgeDist(a,b){if(b.k==='b'){const x0=b.tx*T,y0=b.ty*T,x1=x0+b.w*T,y1=y0+b.h*T;const dx=Math.max(x0-a.x,0,a.x-x1),dy=Math.max(y0-a.y,0,a.y-y1);return Math.hypot(dx,dy)}return Math.max(0,dist(a.x,a.y,b.x,b.y)-(b.s?b.s.r:0))}
const isVisTo=(side,e)=>side!==me||cfg.reveal||(e.k==='b'?expl[((e.ty+(e.h>>1))*MW+e.tx+(e.w>>1))]:vis[((e.y/T)|0)*MW+((e.x/T)|0)]);

/* ======================= Befehle ======================= */
function cmdMove(us,wx,wy,ord){const n=us.length;if(!n)return;const tx=clamp((wx/T)|0,0,MW-1),ty=clamp((wy/T)|0,0,MH-1);
  const spots=[];const used=new Set();for(let r=0;r<12&&spots.length<n;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r||spots.length>=n)continue;const x=tx+dx,y=ty+dy;if(blocked(x,y)||used.has(y*MW+x))continue;used.add(y*MW+x);spots.push({x,y})}
  const sorted=us.slice().sort((a,b)=>dist(a.x,a.y,wx,wy)-dist(b.x,b.y,wx,wy));
  sorted.forEach((u,i)=>{const sp=spots[i]||spots[0]||{x:tx,y:ty};u.ord=ord||'move';u.tgt=null;u.gx=sp.x*T+16;u.gy=sp.y*T+16;reqPath(u,sp.x,sp.y);if(u.type==='oil'){u.st='manual'}})}
function cmdAttack(us,t){for(const u of us){if(!u.s.dmg)continue;u.ord='attack';u.tgt=t;u.repath=0}}
function reqPath(u,gx,gy){u.pgx=gx;u.pgy=gy;if(u.s.air){u.path=[{x:clamp(gx,0,MW-1)*T+16,y:clamp(gy,0,MH-1)*T+16}];u.pi=0;return}if(!pathQ.includes(u))pathQ.push(u)}
function processPaths(){let n=0;while(pathQ.length&&n++<20){const u=pathQ.shift();if(u.dead)continue;u.path=findPath((u.x/T)|0,(u.y/T)|0,u.pgx,u.pgy);u.pi=0}}

/* ======================= Kampf ======================= */
function hurt(t,dmg,wpn,src){if(!alive(t)||t.type==='tech')return;const arm=t.k==='b'?'bld':t.s.arm;let d=dmg*ARM[wpn][arm]*(src&&src.vet?1+src.vet*.2:1)*(src&&src.side>=0?techW(src):1)*(src&&src.k==='b'&&src.lvl>1?1+(src.lvl-1)*.4:1)/(t.k==='u'?techA(t):1);
  t.hp-=d;t.lastHit=time;if(t.k==='b'&&t.side>=0&&sides[t.side].human&&src&&hostile(src.side,t.side))warnAttack(t);
  if(t.k==='b'&&t.side>=0)sides[t.side].lastAtk={t:time,x:t.x,y:t.y,src};
  if(t.k==='u'&&src&&!src.dead&&!t.tgt&&t.ord!=='move'&&t.s.dmg&&src.side!==t.side)t.tgt=src;
  if(t.k==='u'&&t.side>=0)sides[t.side].lastAtkU={t:time,x:t.x,y:t.y,src};
  if(t.hp<=0)kill(t,src)}
function kill(t,src){t.dead=true;t.hp=0;
  if(t.k==='b'){for(let y=t.ty;y<t.ty+t.h;y++)for(let x=t.tx;x<t.tx+t.w;x++)if(occ[y*MW+x]===t.id)occ[y*MW+x]=0;if(t.type==='wall')wallMap[t.ty*MW+t.tx]=0;
    boom(t.x,t.y,t.w*14,true);for(let i=0;i<t.w*t.h*2;i++)setTimeout(()=>boom(t.x+(rnd()-.5)*t.w*T,t.y+(rnd()-.5)*t.h*T,16),i*90);
    decalRubble(t);if(t.side>=0)sides[t.side].stats.blost++;if(t.side>=0)tell(t.side,`${FAC[sides[t.side].fac].b[t.type]} zerstört!`,'bad');}
  else{if(t.s.arm==='inf'||t.type==='fast'&&sides[t.side].fac==='mutant'||t.type==='heavy'&&sides[t.side].fac==='mutant'||t.type==='oil'&&sides[t.side].fac==='mutant'||t.type==='elite'&&sides[t.side].fac==='mutant'){decalBlood(t.x,t.y,t.s.r);sfx('die',t.x,t.y)}
    else{boom(t.x,t.y,t.s.r*1.6,false);decalWreck(t)}
    if(t.side>=0)sides[t.side].stats.lost++}
  if(src&&src.k==='u'&&!src.dead&&src.side!==t.side){src.kills++;sides[src.side].stats.kills++;const v=src.kills>=10?3:src.kills>=5?2:src.kills>=2?1:0;if(v>src.vet){src.vet=v;const nm=stat(src.side,src.type).hp*(1+v*.2);src.hp+=nm-src.max;src.max=nm;src.hp=Math.min(src.max,src.hp+src.max*.3);tell(src.side,`${FAC[sides[src.side].fac].u[src.type]} befördert – ${'★'.repeat(v)}`)}}
  else if(src&&src.k==='b'&&src.side!==t.side)sides[src.side].stats.kills++;
  sel=sel.filter(e=>e!==t)}
function fire(a,t){const s=a.k==='b'?B[a.type]:a.s;const mx=a.x+Math.cos(a.tdir)*(a.k==='u'?a.s.r:8),my=a.y+Math.sin(a.tdir)*(a.k==='u'?a.s.r:8);
  if(s.wpn==='bullet'){hurt(t,s.dmg*(.8+rnd()*.4),'bullet',a);tracers.push({x1:mx,y1:my,x2:t.x+(rnd()-.5)*8,y2:t.y+(rnd()-.5)*8,l:.07,c:'#ffe28a'});flash(mx,my,4);sfx(a.type==='fast'||a.k==='b'?'mg':'rifle',a.x,a.y)}
  else if(s.wpn==='melee'){hurt(t,s.dmg,'melee',a);sfx('bite',a.x,a.y);if(rnd()<.5)parts.push({x:t.x,y:t.y,vx:(rnd()-.5)*40,vy:(rnd()-.5)*40,l:.4,m:.4,t:'blood',r:2})}
  else if(s.wpn==='laser'){hurt(t,s.dmg,'laser',a);tracers.push({x1:mx,y1:my,x2:t.x,y2:t.y,l:.18,c:'#7ae8ff',w:4});flash(t.x,t.y,10,'#7ae8ff');sfx('laser',a.x,a.y)}
  else if(s.wpn==='fire'){hurt(t,s.dmg,'fire',a);for(const e of ents)if(e!==t&&!e.dead&&hostile(e.side,a.side)&&!(e.s&&e.s.air)&&edgeDist({x:t.x,y:t.y},e)<14)hurt(e,s.dmg*.5,'fire',a);
    tracers.push({x1:mx,y1:my,x2:t.x,y2:t.y,l:.12,c:'#ff8a2a',w:5});for(let i=0;i<4;i++){const k=rnd();parts.push({x:mx+(t.x-mx)*k,y:my+(t.y-my)*k,vx:(rnd()-.5)*20,vy:-10-rnd()*20,l:.35,m:.35,t:'fire',r:3+k*5})}sfx('flame',a.x,a.y)}
  else if(s.wpn==='shell'){const d0=dist(mx,my,t.x,t.y);projs.push({x:mx,y:my,sx:mx,sy:my,d0,t,tx:t.x+(rnd()-.5)*20,ty:t.y+(rnd()-.5)*20,spd:190,wpn:'shell',dmg:s.dmg,src:a,side:a.side,trail:0});flash(mx,my,12);sfx('cannon',a.x,a.y)}
  else{projs.push({x:mx,y:my,t,tx:t.x,ty:t.y,spd:s.wpn==='rocket'?250:420,wpn:s.wpn,dmg:s.dmg,src:a,side:a.side,trail:0});flash(mx,my,s.wpn==='cannon'?9:5);sfx(s.wpn,a.x,a.y)}}
function updProj(dt){for(const p of projs){if(alive(p.t)&&p.wpn!=='shell'){p.tx=p.t.x;p.ty=p.t.y}const d=dist(p.x,p.y,p.tx,p.ty),st=p.spd*dt;
  if(p.wpn==='rocket'&&(p.trail-=dt)<0){p.trail=.02;parts.push({x:p.x,y:p.y,vx:(rnd()-.5)*6,vy:(rnd()-.5)*6,l:.6,m:.6,t:'smoke',r:3})}
  if(d<=st){p.done=true;const R=p.wpn==='shell'?44:p.wpn==='rocket'?18:22;boom(p.tx,p.ty,p.wpn==='shell'?16:p.wpn==='cannon'?10:8,p.wpn==='shell',p.wpn!=='shell');
    for(const e of ents)if(!e.dead&&hostile(e.side,p.side)&&!(e.k==='u'&&e.s.air&&!ARM[p.wpn].air&&e!==p.t)&&edgeDist({x:p.tx,y:p.ty},e)<=R){const f=e===p.t||p.wpn==='shell'&&edgeDist({x:p.tx,y:p.ty},e)<16?1:.45;hurt(e,p.dmg*f,p.wpn,p.src)}}
  else{p.x+=(p.tx-p.x)/d*st;p.y+=(p.ty-p.y)/d*st}}projs=projs.filter(p=>!p.done)}
function acquire(a,range){const w=(a.k==='b'?B[a.type]:a.s).wpn;let best=null,bd=1e9;for(const e of ents){if(e.dead||!hostile(e.side,a.side))continue;if(e.k==='u'&&e.s.air&&!ARM[w].air)continue;if(!isVisTo(a.side,e))continue;const d=edgeDist(a,e);if(d>range*T)continue;
  let sc=d+(e.k==='b'?120:0)-(e.s&&e.s.dmg?20:0);if(sc<bd){bd=sc;best=e}}return best}

/* ======================= Einheiten-Logik ======================= */
function updUnit(u,dt){u.cd-=dt;u.anim+=dt;const s=u.s;
  if(u.type==='oil'){tanker(u,dt);move(u,dt);return}
  if(s.heal){let best=null,bw=0;for(const e of ents){if(e.dead||e.k!=='u'||e.side!==u.side||e===u||!organic(e)||e.hp>=e.max)continue;const dd=dist(u.x,u.y,e.x,e.y);
      if(dd<2.6*T){e.hp=Math.min(e.max,e.hp+s.heal*dt);if(rnd()<dt*3)parts.push({x:e.x,y:e.y-6,vx:0,vy:-14,l:.8,m:.8,t:'heal',r:3})}else if(dd<7*T&&e.max-e.hp>bw){bw=e.max-e.hp;best=e}}
    if(best&&!u.path&&u.ord!=='move'&&(u.repath-=dt)<=0){u.repath=1.5;reqPath(u,(best.x/T)|0,(best.y/T)|0)}move(u,dt);return}
  if(u.tgt&&(u.tgt.dead||!isVisTo(u.side,u.tgt)))u.tgt=null;
  if(!u.tgt&&u.ord!=='move'&&(u.acq-=dt)<=0){u.acq=.3+rnd()*.2;const t=acquire(u,s.sight);if(t){u.tgt=t;if(!u.ord){u.ord='guard';u.hx=u.x;u.hy=u.y}}}
  if(u.tgt){const d=edgeDist(u,u.tgt);const rng=s.rng*T;
    if(d<=rng){u.path=null;const a=Math.atan2(u.tgt.y-u.y,u.tgt.x-u.x);u.tdir=turn(u.tdir,a,dt*6);if(s.arm==='inf'||sides[u.side].fac==='mutant')u.dir=u.tdir;
      if(u.cd<=0&&Math.abs(angDiff(u.tdir,a))<.4&&!(s.min&&d<s.min*T)){fire(u,u.tgt);u.cd=s.cd*(.9+rnd()*.2)}}
    else{if(u.ord==='guard'&&dist(u.x,u.y,u.hx,u.hy)>9*T){u.tgt=null;u.ord='move';u.gx=u.hx;u.gy=u.hy;reqPath(u,(u.hx/T)|0,(u.hy/T)|0)}
      else if((u.repath-=dt)<=0){u.repath=.8+rnd()*.4;const tx=u.tgt.k==='b'?u.tgt.tx+(u.tgt.w>>1):(u.tgt.x/T)|0,ty=u.tgt.k==='b'?u.tgt.ty+(u.tgt.h>>1):(u.tgt.y/T)|0;reqPath(u,tx,ty)}}}
  else if(u.ord==='attack'||u.ord==='guard'){if(u.ord==='guard'){u.ord='move';reqPath(u,(u.hx/T)|0,(u.hy/T)|0);u.gx=u.hx;u.gy=u.hy}else{u.ord=null}}
  else if(u.ord==='amove'&&!u.path&&!pathQ.includes(u)){if(dist(u.x,u.y,u.gx,u.gy)<T*1.5)u.ord=null;else reqPath(u,(u.gx/T)|0,(u.gy/T)|0)}
  // Tech-Bunker
  if(u.bunker&&!u.bunker.opened&&edgeDist(u,u.bunker)<T*.9)openBunker(u.bunker,u);
  move(u,dt)}
function move(u,dt){const s=u.s;if(!u.path||u.pi>=u.path.length){if(u.path&&u.ord==='move')u.ord=null;u.path=null;return}
  if(s.air){const p=u.path[u.pi],dx=p.x-u.x,dy=p.y-u.y,d=Math.hypot(dx,dy);if(d<6){u.pi++;return}const a=Math.atan2(dy,dx);u.dir=turn(u.dir,a,dt*4);if(!u.tgt)u.tdir=u.dir;const v=s.spd*dt*(u.vet?1+u.vet*.05:1);u.x+=Math.cos(u.dir)*v;u.y+=Math.sin(u.dir)*v;u.x=clamp(u.x,8,MW*T-8);u.y=clamp(u.y,8,MH*T-8);u.moving=true;return}
  const p=u.path[u.pi],dx=p.x-u.x,dy=p.y-u.y,d=Math.hypot(dx,dy);const last=u.pi===u.path.length-1;
  if(d<(last?3:10)){u.pi++;return}
  const a=Math.atan2(dy,dx);u.dir=turn(u.dir,a,dt*(s.arm==='inf'?12:5));if(!u.tgt)u.tdir=turn(u.tdir,u.dir,dt*5);
  const ok=Math.abs(angDiff(u.dir,a))<1.2;const v=s.spd*dt*(ok?1:.3)*(u.vet?1+u.vet*.05:1);
  const nx=u.x+Math.cos(u.dir)*v,ny=u.y+Math.sin(u.dir)*v;
  const ox=u.x,oy=u.y;
  if(!blocked((nx/T)|0,(ny/T)|0)){u.x=nx;u.y=ny;u.stuck=0}else if(!blocked((nx/T)|0,(u.y/T)|0))u.x=nx;else if(!blocked((u.x/T)|0,(ny/T)|0))u.y=ny;
  else{const cx=((u.x/T)|0)*T+16,cy=((u.y/T)|0)*T+16;u.x+=(cx-u.x)*.3;u.y+=(cy-u.y)*.3;if(++u.stuck>20){u.stuck=0;reqPath(u,u.pgx,u.pgy)}}
  if(ok&&Math.abs(u.x-ox)+Math.abs(u.y-oy)<v*.2&&++u.stuck>20){u.stuck=0;reqPath(u,u.pgx,u.pgy)}
  u.moving=true;if(u.s.arm!=='inf'&&(u.trk=(u.trk||0)-dt)<=0&&onScreen(u.x,u.y,60)){u.trk=.12;const r=u.s.r;decalX.save();decalX.translate(u.x,u.y);decalX.rotate(u.dir);decalX.fillStyle='rgba(70,50,30,.10)';decalX.fillRect(-3,-r*.7,6,3);decalX.fillRect(-3,r*.7-3,6,3);decalX.restore();
    if(rnd()<.5)parts.push({x:u.x-Math.cos(u.dir)*r,y:u.y-Math.sin(u.dir)*r,vx:(rnd()-.5)*8,vy:(rnd()-.5)*8,l:.9,m:.9,t:'dust',r:3+r*.2})}}
const angDiff=(a,b)=>{let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d};
const turn=(a,b,m)=>{const d=angDiff(a,b);return a+clamp(d,-m,m)};
function separate(){const cell={},key=(x,y)=>((x/48)|0)+','+((y/48)|0);const us=ents.filter(e=>e.k==='u'&&!e.dead&&!e.s.air);
  for(const u of us){const k=key(u.x,u.y);(cell[k]||(cell[k]=[])).push(u)}
  for(const u of us){const cx=(u.x/48)|0,cy=(u.y/48)|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const l=cell[(cx+dx)+','+(cy+dy)];if(!l)continue;
    for(const o of l){if(o.id<=u.id||u.type==='oil'&&o.type==='oil')continue;const ddx=o.x-u.x,ddy=o.y-u.y,d=Math.hypot(ddx,ddy)||.01,m=(u.s.r+o.s.r)*.85;if(d<m){const push=(m-d)*.35,px=ddx/d*push,py=ddy/d*push;
      const um=!u.path,om=!o.path;const fu=um&&!om?.3:1,fo=om&&!um?.3:1;
      tryPush(u,-px*fu,-py*fu);tryPush(o,px*fo,py*fo)}}}}}
function tryPush(u,dx,dy){const nx=u.x+dx,ny=u.y+dy;if(!blocked((nx/T)|0,(ny/T)|0)){u.x=nx;u.y=ny}}
function tanker(u,dt){const S=sides[u.side];u.stT-=dt;
  if(u.st==='manual'){if(!u.path&&!pathQ.includes(u))u.st='idle';return}
  if(u.st==='idle'||!alive(u.der)&&u.st!=='toRef'&&u.st!=='unload'){const ds=own(u.side,'der').filter(d=>d.oil>0);let best=null,bd=1e9;
    for(const d of ds){const n=units(u.side,'oil').filter(o=>o.der===d&&o!==u).length;const dd=dist(u.x,u.y,d.x,d.y)+n*400;if(n<3&&dd<bd){bd=dd;best=d}}
    u.der=best;if(best){if(u.load>=200){u.st='toRef'}else{u.st='toDer';const t=dock(best);u.gx=t.x*T+16;u.gy=t.y*T+16;reqPath(u,t.x,t.y)}}else if(u.load>0){u.st='toRef'}else{u.st='wait';u.stT=2}}
  if(u.st==='wait'&&u.stT<=0)u.st='idle';
  if(u.st==='toDer'){if(!u.der){u.st='idle';return}if(edgeDist(u,u.der)<T*.8){u.st='load';u.stT=2.5/(1+(u.der.lvl-1)*.5);u.path=null}else if(!u.path&&!pathQ.includes(u)){const t=dock(u.der);reqPath(u,t.x,t.y)}}
  if(u.st==='load'&&u.stT<=0){const amt=Math.min(200,u.der?u.der.oil:0);if(u.der)u.der.oil-=amt;u.load=amt;u.st='toRef'}
  if(u.st==='toRef'){const rs=own(u.side,'ref');if(!rs.length){u.st='wait';u.stT=3;return}let r=rs.reduce((a,b)=>dist(u.x,u.y,a.x,a.y)<dist(u.x,u.y,b.x,b.y)?a:b);u.ref=r;
    if(edgeDist(u,r)<T*.8){u.st='unload';u.stT=1.5;u.path=null}else if(!u.path&&!pathQ.includes(u)){const t=dock(r);reqPath(u,t.x,t.y)}}
  if(u.st==='unload'&&u.stT<=0){if(alive(u.ref)){const inc=u.load*(S.ai?DIFF[cfg.diff].inc:1)*(1+(u.ref.lvl-1)*.2)*(1+Math.min(3,own(u.side,'sil').length)*.1);S.money+=Math.round(inc);S.stats.oil+=Math.round(inc);if(u.side===me&&onScreen(u.x,u.y))floatTxt(u.ref.x,u.ref.y-30,'+'+Math.round(inc),'#ffcf5a')}u.load=0;u.st='idle'}}
function dock(b){let best=null,bd=1e9;for(let y=b.ty-1;y<=b.ty+b.h;y++)for(let x=b.tx-1;x<=b.tx+b.w;x++){if(blocked(x,y))continue;const d=Math.abs(y-(b.ty+b.h))*0.5+Math.abs(x-(b.tx+b.w/2));if(d<bd){bd=d;best={x,y}}}return best||{x:b.tx,y:b.ty+b.h}}
function openBunker(b,u){b.opened=true;const S=sides[u.side];const n=cfg.size>70?2:1;
  for(let i=0;i<n;i++){const f=nearestFree(b.tx+1,b.ty+b.h+1,5);if(f){const e=addUnit(u.side,'elite',f.x*T+16,f.y*T+16);e.vet=1}}
  for(const o of ents)if(o.bunker===b)o.bunker=null;
  boom(b.x,b.y,14);tell(u.side,`Tech-Bunker geöffnet – ${FAC[S.fac].u.elite} erbeutet!`);if(u.side!==me&&hostile(u.side,me)&&isVisTo(me,b))say('Der Feind hat einen Tech-Bunker geplündert!','bad')}
function updBld(b,dt){b.anim+=dt;const d=B[b.type];const S=b.side>=0?sides[b.side]:null,PF=S?pf(S):1;
  if(b.up){b.up.t+=dt*PF;if(b.up.t>=b.up.total){b.up=null;b.lvl++;const add=b.max*.3;b.max+=add;b.hp+=add;if(b.side>=0){tell(b.side,`${FAC[sides[b.side].fac].b[b.type]} auf Stufe ${b.lvl} ausgebaut`);floatTxt(b.x,b.y-30,'Stufe '+b.lvl,'#7aff6a')}}}
  if(d.wpn){const rg=d.rng+(b.lvl-1)*.75;b.cd-=dt*PF;if(b.tgt&&(b.tgt.dead||edgeDist(b,b.tgt)>rg*T||!isVisTo(b.side,b.tgt)))b.tgt=null;if(!b.tgt&&(b.acqT=(b.acqT||0)-dt)<=0){b.acqT=.4;b.tgt=acquire(b,rg)}
    if(b.tgt){const a=Math.atan2(b.tgt.y-b.y,b.tgt.x-b.x);b.tdir=turn(b.tdir,a,dt*5);if(b.cd<=0&&Math.abs(angDiff(b.tdir,a))<.3){fire(b,b.tgt);b.cd=d.cd}}}
  if(b.hp<b.max*.5&&rnd()<dt*6)parts.push({x:b.x+(rnd()-.5)*b.w*T*.6,y:b.y+(rnd()-.5)*b.h*T*.6,vx:4,vy:-18,l:1.6,m:1.6,t:b.hp<b.max*.25&&rnd()<.5?'fire':'smoke',r:5});
  if(b.type==='rep'&&S){const hr=4.5*T;for(const e of ents){if(e.dead||e.side!==b.side||e===b)continue;if(e.k==='u'){if(e.hp<e.max&&(!organic(e)||S.fac==='mutant')&&dist(e.x,e.y,b.x,b.y)<hr){e.hp=Math.min(e.max,e.hp+14*dt*PF*b.lvl);if(rnd()<dt*2)parts.push({x:e.x,y:e.y-6,vx:0,vy:-14,l:.8,m:.8,t:'spark',r:2})}}
      else if(e.hp<e.max&&e.type!=='tech'&&dist(e.x,e.y,b.x,b.y)<6.5*T){e.hp=Math.min(e.max,e.hp+5*dt*PF*b.lvl);if(rnd()<dt)parts.push({x:e.x+(rnd()-.5)*e.w*T*.6,y:e.y+(rnd()-.5)*e.h*T*.6,vx:0,vy:-10,l:.7,m:.7,t:'spark',r:2})}}}
  if(b.type==='scr'&&S&&b.scrap>0){const v=Math.min(b.scrap,9*dt*PF*(1+(b.lvl-1)*.3));b.scrap-=v;const inc=v*(S.ai?DIFF[cfg.diff].inc:1);S.money+=inc;S.stats.oil+=inc;b.acc=(b.acc||0)+inc;if(b.acc>=50){if(b.side===me&&onScreen(b.x,b.y))floatTxt(b.x,b.y-24,'+'+Math.round(b.acc),'#ffcf5a');b.acc=0}}
  if(b.type==='sup'&&S){b.charge=Math.min(B.sup.charge,(b.charge||0)+dt*PF);if(b.charge>=B.sup.charge&&S.ai)aiFireSup(S,b)}
  if(b.type==='pow'&&rnd()<dt*3)parts.push({x:b.tx*T+12,y:b.ty*T+4,vx:4,vy:-16,l:1.8,m:1.8,t:S&&S.fac==='mutant'?'gas':'smoke',r:4});
  if((b.type==='ref'||b.type==='hq')&&rnd()<dt*2.5)parts.push({x:b.tx*T+(b.type==='ref'?20:b.w*T-14),y:b.ty*T+6,vx:6,vy:-14,l:2.2,m:2.2,t:'smoke',r:4})}

/* ======================= Produktion ======================= */
function reqList(type){const d=B[type]||U[type];const r=[...(d.req||[])];if(U[type]&&!B[type])r.unshift(U[type].from);return r}
function reqOK(S,type){if(type==='heavy'&&S.lvl<2)return false;return reqList(type).every(t=>own(S.id,t).length>0)}
function reqText(S,type){const miss=reqList(type).filter(t=>!own(S.id,t).length).map(t=>FAC[S.fac].b[t]);if(type==='heavy'&&S.lvl<2)miss.push('Ausbau der Zentrale');return miss.length?'braucht '+miss.join(' + '):''}
function startBuild(S,type){if(S.bq||!reqOK(S,type))return false;const c=B[type].cost;if(S.money<c){tell(S.id,'Zu wenig Öl-Dollar!','bad');return false}S.money-=c;S.bq={type,t:0,total:B[type].time};return true}
function queueUnit(S,type){if(!reqOK(S,type))return false;const st=stat(S.id,type);if(S.money<st.cost){tell(S.id,'Zu wenig Öl-Dollar!','bad');return false}
  const q=S.uq[st.from];if(q.length>=10)return false;S.money-=st.cost;q.push({type,t:0,total:st.time});return true}
function updProd(S,dt){const PF=pf(S);if(S.bq&&!S.bq.done){S.bq.t+=dt*PF;if(S.bq.t>=S.bq.total){S.bq.done=true;tell(S.id,'Gebäude bereit – jetzt platzieren');if(S.id===me){tab='b';buildUI()}}}
  for(const pb of PRODB){const q=S.uq[pb],ps=own(S.id,pb);if(!q.length||!ps.length)continue;q[0].t+=dt*PF*(1+(ps.length-1)*.5)*(1+(Math.max(...ps.map(p=>p.lvl))-1)*.35);
    if(q[0].t>=q[0].total){const it=q.shift();const p=ps[(S.rot=(S.rot||0)+1)%ps.length];const f=nearestFree(p.tx+(p.w>>1),p.ty+p.h,6)||{x:p.tx,y:p.ty+p.h};
      const u=addUnit(S.id,it.type,f.x*T+16,f.y*T+16);if(p.rally)cmdMove([u],p.rally.x,p.rally.y,it.type==='oil'?'move':'amove');tell(S.id,`${FAC[S.fac].u[it.type]} bereit`,'',true)}}
  if(S.res){if(!own(S.id,RES[S.res.k].at).length){S.money+=S.res.cost;S.res=null}else{S.res.t+=dt*PF;if(S.res.t>=S.res.total){const k=S.res.k;S.tech[k]=(S.tech[k]||0)+1;S.res=null;tell(S.id,`Forschung fertig: ${RES[k].n} ${ROM[S.tech[k]]}`)}}}
  if(S.upg){S.upg.t+=dt*PF;if(S.upg.t>=S.upg.total){S.upg=null;S.lvl=2;for(const h of own(S.id,'hq')){h.max*=1.3;h.hp*=1.3}tell(S.id,'Zentrale ausgebaut – schwere Einheiten verfügbar!')}}}
function fireSup(S,b,x,y){if(!b||b.dead||(b.charge||0)<B.sup.charge)return false;b.charge=0;const delay=S.human?3:8;nukes.push({x,y,t:delay,max:delay,side:S.id,fac:S.fac});
  for(const X of sides){if(X.id===S.id)tell(X.id,`${FAC[S.fac].sup} abgefeuert!`);else if(X.human&&!X.dead&&hostile(X.id,S.id)){tell(X.id,`Warnung: ${FAC[S.fac].sup} im Anflug!`,'bad');X.alarm={x,y,t:time}}}sfx('launch');return true}
function aiFireSup(S,b){const en=foes(S.id).filter(e=>e.type!=='wall');if(!en.length)return;let best=en[0],bn=-1;for(const e of en){const n=en.filter(o=>dist(o.x,o.y,e.x,e.y)<5*T).length;if(n>bn){bn=n;best=e}}fireSup(S,b,best.x,best.y)}
function updNukes(dt){for(const n of nukes){n.t-=dt;if(n.t<=0&&!n.done){n.done=true;const R=5.5*T,plague=n.fac==='mutant';
    for(const e of ents){if(e.dead||e.type==='tech')continue;const dd=e.k==='b'?edgeDist({x:n.x,y:n.y},e):dist(e.x,e.y,n.x,n.y);if(dd<R){const f=1-dd/R*.6;const dm=1100*f*(plague?(e.k==='b'?.6:1.25):1);e.hp-=dm;e.lastHit=time;if(e.hp<=0)kill(e,null)}}
    for(let i=0;i<14;i++)setTimeout(()=>boom(n.x+(rnd()-.5)*R*1.2,n.y+(rnd()-.5)*R*1.2,22,true),i*70);boom(n.x,n.y,40,true);flash(n.x,n.y,R*1.2,plague?'#b8ff5a':'#fff8d0');
    for(let i=0;i<60;i++){const a=rnd()*7,v=40+rnd()*160;parts.push({x:n.x,y:n.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:2+rnd()*2,m:4,t:plague?'gas':'smoke',r:10+rnd()*14})}
    decalScorch(n.x,n.y,R*1.1);shake=1.2}}nukes=nukes.filter(n=>!n.done)}
function canPlace(S,type,tx,ty){const d=B[type];if(tx<1||ty<1||tx+d.w>MW-1||ty+d.h>MH-1)return false;
  for(let y=ty;y<ty+d.h;y++)for(let x=tx;x<tx+d.w;x++){const t=tiles[y*MW+x];if(t===1||occ[y*MW+x])return false;if(type==='der'?t!==2:type==='scr'?t!==3:t>=2)return false}
  if(type==='der'||type==='scr')return S.id!==me||expl[ty*MW+tx]||cfg.reveal;
  for(const b of own(S.id))if(tx<=b.tx+b.w+6&&tx+d.w>=b.tx-6&&ty<=b.ty+b.h+6&&ty+d.h>=b.ty-6)return true;return false}
function place(S,tx,ty){const type=S.bq.type,left=type==='wall'?(S.bq.left||3)-1:0;if(!canPlace(S,type,tx,ty))return false;const b=addBld(S.id,type,tx,ty);S.bq=null;S.stats.built++;
  if(type==='ref'||type==='der'){const d=dock(b);const f=nearestFree(d.x,d.y,5);if(f){const u=addUnit(S.id,'oil',f.x*T+16,f.y*T+16);if(type==='der')u.der=b}}
  if(type==='scr')b.scrap=7000;
  if(left>0&&S.human&&S.money>=B.wall.cost){S.money-=B.wall.cost;S.bq={type:'wall',t:0,total:0,done:true,left}}
  sfx('place',b.x,b.y);return true}

/* ======================= Computer-Gegner ======================= */
function updAI(S,dt){const D=DIFF[cfg.diff];if(S.human||S.dead)return;
  const hq=own(S.id,'hq')[0]||own(S.id)[0];if(!hq)return;
  const has=t=>own(S.id,t).length,ders=own(S.id,'der');
  // Bauen
  const P=S.pw||power(S),lv={easy:0,normal:1,hard:2,brutal:3}[cfg.diff];
  if(!S.bq){let want=null;
    if(!has('ref'))want='ref';else if(ders.length<1)want='der';else if(!has('bar'))want='bar';else if(ders.length<2&&freeOil(S).length)want='der';else if(!has('fac'))want='fac';
    else if(has('tow')<1)want='tow';else if(ders.length<4&&freeOil(S).length&&S.money>500)want='der';else if(has('tow')<2+(cfg.diff==='brutal'?2:0)&&time>240)want='tow';
    else if(lv>=1&&!has('rep')&&time>260&&S.money>700)want='rep';
    else if(lv>=1&&!has('rad')&&time>330&&S.money>900)want='rad';
    else if(has('rad')&&has('rtow')<lv&&S.money>800)want='rtow';
    else if(has('ctow')<lv-1&&S.money>900)want='ctow';
    else if(lv>=2&&has('rad')&&!has('air')&&time>480&&S.money>1300)want='air';
    else if(lv>=2&&has('rad')&&has('rep')&&!has('lab')&&time>600&&S.money>1700)want='lab';
    else if(lv>=2&&has('lab')&&!has('sup')&&time>(lv>=3?800:950)&&S.money>2700)want='sup';
    else if(has('scr')<2&&freeOil(S,3).length&&S.money>900)want='scr';
    else if(has('sil')<lv&&S.money>1300)want='sil';
    else if(S.money>1800&&has('bar')<2)want='bar';else if(S.money>2200&&has('fac')<2)want='fac';else if(S.money>1500&&has('ref')<2&&ders.length>=3)want='ref';
    else if(freeOil(S).length&&S.money>900&&ders.length<7)want='der';
    if(want&&want!=='pow'&&P.u+(B[want].pw||0)>P.p)want='pow';
    S.want=want;if(want)startBuild(S,want)}
  if(S.bq&&S.bq.done){const spot=aiSpot(S,S.bq.type,hq);if(spot)place(S,spot.x,spot.y);else if(S.bq.type==='der'||S.bq.type==='scr'||(S.bqT=(S.bqT||0)+1)>20){S.money+=B[S.bq.type].cost;S.bq=null;S.bqT=0}}
  if(S.lvl<2&&!S.upg&&has('fac')&&(S.money>1300||time>420&&S.money>=1200)){S.money-=1200;S.upg={t:0,total:30}}
  if((cfg.diff==='hard'||cfg.diff==='brutal')&&time>360&&S.money>1600&&!S.res){const k=['infW','vehW','infA','vehA'].find(k=>(S.tech[k]||0)<(cfg.diff==='brutal'?2:1)&&own(S.id,RES[k].at).length);if(k)startRes(S,k)}
  if(time>300&&S.money>2000){const b=own(S.id).find(b=>BUPG.includes(b.type)&&!b.up&&b.lvl<(cfg.diff==='easy'?1:cfg.diff==='normal'?2:3)&&(b.type==='ref'||b.type==='tow'||b.type==='fac'));if(b){const c=bupCost(b);S.money-=c;b.spent+=c;b.up={t:0,total:bupTime(b)}}}
  const armyN=units(S.id).filter(u=>u.type!=='oil').length;
  const saving=(S.want&&!S.bq&&S.money<B[S.want].cost)||(S.lvl<2&&has('fac')&&!S.upg&&time>300);
  const reserve=saving&&armyN>=5?99999:0;
  // Truppen
  const tk=units(S.id,'oil').length+S.uq.fac.filter(q=>q.type==='oil').length;
  if(has('fac')&&tk<Math.min(ders.length+Math.floor(ders.length/2)+1,10)&&S.uq.fac.length<2&&S.money>600)queueUnit(S,'oil');
  const mix=()=>{const r=rnd();if(has('lab')&&r<.1)return'mbt';if(has('rad')&&r<.2)return'art';if(S.lvl>=2&&r<.3+D.mix*.3)return'heavy';if(has('pow')&&r<.42)return'flame';if(r<.6)return'inf';if(r<.8)return'rkt';return'fast'};
  const full=armyN>=D.cap;
  if(!full&&has('air')&&S.uq.air.length<1&&S.money>1300)queueUnit(S,'heli');
  if(!full&&has('rep')&&units(S.id,'med').length+S.uq.bar.filter(q=>q.type==='med').length<(lv>=2?2:1)&&S.money>500)queueUnit(S,'med');
  for(let k=0;k<2&&!full;k++){const t=mix();const from=U[t].from;if(has(from)&&S.uq[from].length<2&&S.money>stat(S.id,t).cost+150+reserve)queueUnit(S,t)}
  // Rallypunkt vor der Basis
  const army=units(S.id).filter(u=>u.type!=='oil'&&u.type!=='elite'||u.type==='elite');
  const idle=army.filter(u=>!u.wave&&u.ord!=='attack');
  const enemyB=foes(S.id).filter(b=>b.type!=='wall');
  // Verteidigung
  if(S.lastAtk&&time-S.lastAtk.t<3){for(const u of idle){if(dist(u.x,u.y,S.lastAtk.x,S.lastAtk.y)<16*T&&!u.tgt){u.ord='amove';u.gx=S.lastAtk.x;u.gy=S.lastAtk.y;reqPath(u,(u.gx/T)|0,(u.gy/T)|0)}}}
  // Angriffswelle
  S.wave=S.wave||D.wave;
  if(time>D.first&&(time-(S.lastWave||-999)>D.gap||(cfg.diff==='hard'||cfg.diff==='brutal')&&time>D.first+300&&idle.length>=D.cap*.75&&time-(S.lastWave||-999)>D.gap*.4)&&idle.length>=S.wave&&enemyB.length){const tgt=enemyB.reduce((a,b)=>dist(hq.x,hq.y,a.x,a.y)<dist(hq.x,hq.y,b.x,b.y)?a:b);
    const big=(cfg.diff==='hard'||cfg.diff==='brutal')&&time>D.first+300&&idle.length>=D.cap*.75,grp=big?idle.slice(0,idle.length-4):idle.slice(0,S.wave+2);for(const u of grp){u.wave=1}cmdMove(grp,tgt.x,tgt.y,'amove');S.wave=Math.min(D.maxw,S.wave+D.grow);S.lastWave=time}
  // Wellen, die am Ziel stehen, weiter schicken
  for(const u of army)if(u.wave&&!u.tgt&&!u.path&&!pathQ.includes(u)&&enemyB.length){const t=enemyB.reduce((a,b)=>dist(u.x,u.y,a.x,a.y)<dist(u.x,u.y,b.x,b.y)?a:b);cmdMove([u],t.x,t.y,'amove')}
  // Sammelpunkt
  for(const u of idle)if(!u.path&&!u.tgt&&!u.rallied){u.rallied=1;const ex=enemyB[0];if(ex){const a=Math.atan2(ex.y-hq.y,ex.x-hq.x);cmdMove([u],hq.x+Math.cos(a)*5*T+(rnd()-.5)*96,hq.y+Math.sin(a)*5*T+(rnd()-.5)*96,'amove')}}
  // Tech-Bunker
  if(time>120&&!S.scout){const tb=ents.find(e=>e.type==='tech'&&!e.opened);const sc=units(S.id,'inf')[0]||units(S.id,'fast')[0];if(tb&&sc&&sc.s.arm==='inf'){S.scout=1;sc.wave=1;sc.bunker=tb;cmdMove([sc],tb.x,tb.y+T*1.5,'move')}}}
function freeOil(S,code=2){const r=[];for(let y=1;y<MH-2;y++)for(let x=1;x<MW-2;x++)if(tiles[y*MW+x]===code&&tiles[y*MW+x-1]!==code&&tiles[(y-1)*MW+x]!==code&&!occ[y*MW+x])r.push({x,y});
  const hq=own(S.id,'hq')[0]||own(S.id)[0];if(!hq)return[];const en=foes(S.id);
  return r.filter(f=>!en.some(b=>Math.hypot(b.tx-f.x,b.ty-f.y)<8)).sort((a,b)=>Math.hypot(a.x-hq.tx,a.y-hq.ty)-Math.hypot(b.x-hq.tx,b.y-hq.ty))}
function aiSpot(S,type,hq){if(type==='der'||type==='scr'){return freeOil(S,type==='der'?2:3).find(f=>canPlace(S,type,f.x,f.y))||null}
  const en=foes(S.id).sort((a,b)=>dist(hq.x,hq.y,a.x,a.y)-dist(hq.x,hq.y,b.x,b.y))[0]||{x:MW*T/2,y:MH*T/2};const a=Math.atan2(en.y-hq.y,en.x-hq.x);
  for(let r=3;r<12;r++)for(let k=0;k<24;k++){const ang=type==='tow'?a+(k%2?1:-1)*Math.floor(k/2)*.25:k/24*Math.PI*2+rnd()*.2;const x=Math.round(hq.tx+1+Math.cos(ang)*r),y=Math.round(hq.ty+1+Math.sin(ang)*r);
    if(canPlace(S,type,x,y)){let gap=true;const d=B[type];for(let yy=y-1;yy<=y+d.h&&gap;yy++)for(let xx=x-1;xx<=x+d.w;xx++)if(occ[yy*MW+xx]){gap=false;break}if(gap||type==='tow')return{x,y}}}return null}

/* ======================= Effekte ======================= */
function boom(x,y,s,big,small){for(let i=0;i<(small?5:s);i++){const a=rnd()*7,v=rnd()*s*4;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.5+rnd()*.4,m:.9,t:'fire',r:s*.35+rnd()*s*.3})}
  for(let i=0;i<(small?2:s*.6);i++)parts.push({x:x+(rnd()-.5)*s,y:y+(rnd()-.5)*s,vx:(rnd()-.5)*12,vy:-10-rnd()*10,l:1.5+rnd(),m:2.5,t:'smoke',r:s*.4+4});
  if(!small)for(let i=0;i<s*.5;i++){const a=rnd()*7,v=40+rnd()*120;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.5+rnd()*.5,m:1,t:'debris',r:2})}
  flash(x,y,Math.min(36,s*1.6));decalScorch(x,y,small?6:s*1.1);sfx(big?'bigboom':small?'hit':'boom',x,y)}
function flash(x,y,r,c){parts.push({x,y,vx:0,vy:0,l:.08,m:.08,t:'flash',r,c:c||'#fff2b0'})}
function floatTxt(x,y,txt,c){parts.push({x,y,vx:0,vy:-22,l:1.4,m:1.4,t:'txt',txt,c})}
function decalScorch(x,y,r){const g=decalX.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(20,12,6,.55)');g.addColorStop(1,'rgba(20,12,6,0)');decalX.fillStyle=g;decalX.beginPath();decalX.arc(x,y,r,0,7);decalX.fill()}
function decalBlood(x,y,r){for(let i=0;i<7;i++){decalX.fillStyle=`rgba(${110+rnd()*40|0},10,8,${.5+rnd()*.3})`;decalX.beginPath();decalX.ellipse(x+(rnd()-.5)*r*2.2,y+(rnd()-.5)*r*2.2,1+rnd()*r*.7,1+rnd()*r*.5,rnd()*3,0,7);decalX.fill()}
  decalX.fillStyle='rgba(60,45,35,.9)';decalX.beginPath();decalX.ellipse(x,y,r*.7,r*.35,rnd()*3,0,7);decalX.fill();for(let i=0;i<6;i++)parts.push({x,y,vx:(rnd()-.5)*60,vy:(rnd()-.5)*60,l:.35,m:.35,t:'blood',r:2})}
function decalWreck(u){decalScorch(u.x,u.y,u.s.r*1.8);decalX.save();decalX.translate(u.x,u.y);decalX.rotate(u.dir);decalX.fillStyle='rgba(28,22,18,.92)';const r=u.s.r;decalX.fillRect(-r,-r*.65,r*2,r*1.3);decalX.fillStyle='rgba(60,40,28,.9)';decalX.fillRect(-r*.4,-r*.4,r*.8,r*.8);decalX.restore()}
function decalRubble(b){const x0=b.tx*T,y0=b.ty*T,w=b.w*T,h=b.h*T;decalScorch(b.x,b.y,Math.max(w,h)*.8);for(let i=0;i<b.w*b.h*10;i++){decalX.fillStyle=`rgba(${50+rnd()*40|0},${40+rnd()*30|0},${30+rnd()*20|0},.95)`;decalX.fillRect(x0+rnd()*w,y0+rnd()*h,3+rnd()*7,3+rnd()*6)}}
function updParts(dt){for(const p of parts){p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.t==='debris'||p.t==='blood'){p.vx*=.92;p.vy*=.92}if(p.t==='smoke'||p.t==='dust'){p.r+=dt*6}}parts=parts.filter(p=>p.l>0);if(parts.length>1400)parts.splice(0,parts.length-1400);
  for(const t of tracers)t.l-=dt;tracers=tracers.filter(t=>t.l>0)}

/* ======================= Ton & Ansagen ======================= */
let AC=null,soundOn=true,voiceOn=true,sfxCount={};
function sfx(kind,x,y){if(!soundOn||paused)return;if(x!=null&&!onScreen(x,y,200))return;const now=performance.now();if((sfxCount[kind]||0)>now)return;sfxCount[kind]=now+({flame:120,rifle:45,mg:35,die:90,boom:60,hit:40,bite:60}[kind]||80);
  try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime,out=AC.createGain();out.gain.value=.5;out.connect(AC.destination);
    const noise=(len,f,q,v,type='bandpass')=>{const b=AC.createBuffer(1,AC.sampleRate*len,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(rnd()*2-1)*Math.pow(1-i/d.length,2);const s=AC.createBufferSource(),fl=AC.createBiquadFilter(),g=AC.createGain();fl.type=type;fl.frequency.value=f;fl.Q.value=q;g.gain.value=v;s.buffer=b;s.connect(fl).connect(g).connect(out);s.start(t)};
    const tone=(f1,f2,len,v,w='square')=>{const o=AC.createOscillator(),g=AC.createGain();o.type=w;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+len);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+len);o.connect(g).connect(out);o.start(t);o.stop(t+len)};
    if(kind==='rifle')noise(.09,2200,1.2,.5);else if(kind==='mg')noise(.06,1600,1,.45);else if(kind==='rocket'){noise(.35,800,.7,.35);tone(300,90,.3,.05,'sawtooth')}
    else if(kind==='cannon'){noise(.3,300,.6,1,'lowpass');tone(120,40,.25,.2,'sine')}else if(kind==='laser')tone(1800,200,.25,.12,'sawtooth');
    else if(kind==='boom'){noise(.6,240,.5,1,'lowpass');tone(90,30,.5,.25,'sine')}else if(kind==='bigboom'){noise(1.4,160,.4,1.4,'lowpass');tone(70,20,1.2,.4,'sine')}
    else if(kind==='flame')noise(.25,700,.4,.35,'lowpass');else if(kind==='launch'){noise(1.6,300,.3,.8,'lowpass');tone(80,400,1.5,.15,'sawtooth')}else if(kind==='hit')noise(.2,500,.6,.6,'lowpass');else if(kind==='die'){tone(260,90,.22,.06,'sawtooth')}else if(kind==='bite')noise(.12,900,2,.5);
    else if(kind==='place'){tone(140,70,.3,.2,'square');noise(.3,400,.5,.5,'lowpass')}else if(kind==='click')tone(900,700,.05,.05,'square');
    else if(kind==='ready')[[523,.0],[659,.08]].forEach(([f,dl])=>{const o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.value=f;g.gain.setValueAtTime(.05,t+dl);g.gain.exponentialRampToValueAtTime(.001,t+dl+.15);o.connect(g).connect(out);o.start(t+dl);o.stop(t+dl+.16)})}catch(e){}}
let lastSay=0;
function say(txt,cls,quiet){const m=document.createElement('div');m.className='msg '+(cls||'');m.textContent=txt;const box=$('msgs');box.appendChild(m);while(box.children.length>4)box.firstChild.remove();setTimeout(()=>m.remove(),4500);
  if(!quiet)sfx('ready');
  if(voiceOn&&!quiet&&window.speechSynthesis&&performance.now()-lastSay>1500){lastSay=performance.now();try{const u=new SpeechSynthesisUtterance(txt.replace(/–.*$/,'').replace(/★/g,''));u.lang='de-DE';u.rate=1.08;u.pitch=.7;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}}
function warnAttack(b){const S=sides[b.side];if(time-(S.atkT||-99)>15){S.atkT=time;tell(S.id,'Unsere Basis wird angegriffen!','bad');S.alarm={x:b.x,y:b.y,t:time}}}

/* ======================= Befehle (lokal und über das Netz) ======================= */
function sellBld(S,e){if(!e||e.dead||e.side!==S.id||e.k!=='b'||e.type==='hq')return;const v=Math.floor(e.spent*.5*e.hp/e.max);
  for(let y=e.ty;y<e.ty+e.h;y++)for(let x=e.tx;x<e.tx+e.w;x++)if(occ[y*MW+x]===e.id)occ[y*MW+x]=0;if(e.type==='wall')wallMap[e.ty*MW+e.tx]=0;
  e.dead=true;e.hp=0;S.money+=v;for(const o of ents)if(o.der===e)o.der=null;
  for(let i=0;i<e.w*e.h*3;i++)parts.push({x:e.x+(rnd()-.5)*e.w*T,y:e.y+(rnd()-.5)*e.h*T,vx:(rnd()-.5)*10,vy:-8-rnd()*10,l:1.2+rnd(),m:2,t:'smoke',r:6});
  decalRubble(e);sfx('place',e.x,e.y);floatTxt(e.x,e.y-20,'+'+v,'#ffcf5a');tell(S.id,`${FAC[S.fac].b[e.type]} verkauft (+${v} $)`,'',true);if(S.id===me){sel=sel.filter(o=>o!==e);infoUI();updUI(true)}}
function upgradeBld(S,e){if(!e||e.dead||e.side!==S.id||!BUPG.includes(e.type)||e.up||e.lvl>=3)return;const c=bupCost(e);if(S.money<c){tell(S.id,'Zu wenig Öl-Dollar!','bad',true);return}
  S.money-=c;e.spent+=c;e.up={t:0,total:bupTime(e)};tell(S.id,`Ausbau ${FAC[S.fac].b[e.type]} gestartet`,'',true);if(S.id===me)infoUI()}
function startRes(S,k){const r=RES[k],lv=S.tech[k]||0;if(!r||S.res||lv>=2||!own(S.id,r.at).length)return false;const c=r.c[lv];if(S.money<c){tell(S.id,'Zu wenig Öl-Dollar!','bad',true);return false}
  S.money-=c;S.res={k,t:0,total:r.t[lv],cost:c};tell(S.id,`Forschung gestartet: ${r.n} ${ROM[lv+1]}`,'',true);return true}
function upgradeHQ(S){if(S.money>=1200&&!S.upg&&S.lvl<2){S.money-=1200;S.upg={t:0,total:30};tell(S.id,'Ausbau der Zentrale gestartet','',true);if(S.id===me)infoUI()}}
function doCmd(sid,c){const S=sides[sid];if(!S||S.dead||!Array.isArray(c))return;
  const mine=ids=>Array.isArray(ids)?ents.filter(e=>!e.dead&&e.side===sid&&ids.includes(e.id)):[],get=id=>ents.find(e=>!e.dead&&e.id===id);
  switch(c[0]){
    case'build':if(B[c[1]]&&BORDER.includes(c[1]))startBuild(S,c[1]);break;
    case'cbuild':if(S.bq){S.money+=B[S.bq.type].cost;S.bq=null}break;
    case'q':if(UORDER.includes(c[1]))queueUnit(S,c[1]);break;
    case'dq':{if(!UORDER.includes(c[1]))break;const d=stat(sid,c[1]),q=S.uq[d.from];for(let i=q.length-1;i>=0;i--)if(q[i].type===c[1]){S.money+=d.cost;q.splice(i,1);break}break}
    case'place':if(S.bq&&S.bq.done)place(S,c[1]|0,c[2]|0);break;
    case'sell':sellBld(S,get(c[1]));break;
    case'bup':upgradeBld(S,get(c[1]));break;
    case'res':startRes(S,c[1]);break;
    case'hq':upgradeHQ(S);break;
    case'sup':{const b=get(c[1]);if(b&&b.side===sid&&b.type==='sup')fireSup(S,b,+c[2],+c[3]);break}
    case'rally':for(const b of mine(c[1]))if(b.k==='b'&&PRODB.includes(b.type))b.rally={x:+c[2],y:+c[3]};break;
    case'mv':cmdMove(mine(c[1]).filter(e=>e.k==='u'),+c[2],+c[3],c[4]==='amove'?'amove':'move');break;
    case'atk':{const t=get(c[2]);if(t&&hostile(t.side,sid))cmdAttack(mine(c[1]).filter(e=>e.k==='u'),t);break}
    case'bunk':{const t=get(c[2]);if(t&&t.type==='tech'&&!t.opened){const us=mine(c[1]).filter(u=>u.k==='u'&&u.s.arm==='inf');for(const u of us)u.bunker=t;cmdMove(us,t.x,t.y+T*1.4,'move')}break}
    case'der':{const t=get(c[2]);if(t&&t.side===sid&&t.type==='der')for(const u of mine(c[1]))if(u.type==='oil'){u.der=t;u.st='toDer';const d=dock(t);reqPath(u,d.x,d.y)}break}
    case'stop':for(const u of mine(c[1]))if(u.k==='u'){u.path=null;u.ord=null;u.tgt=null}break;
    case'quit':for(const e of ents)if(!e.dead&&e.side===sid&&e.k==='b')kill(e,null);break}}
