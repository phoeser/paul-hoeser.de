"use strict";
/* ======================= Lucky Brawlers – Effekte, Geschosse, Ton ======================= */
let SHK=0,DEC=[],HF={},RC={};
function actx(){AC=AC||new(window.AudioContext||window.webkitAudioContext)();return AC}
function beep(f1,f2,d,v,type){if(!soundOn)return;try{const A=actx(),t=A.currentTime,o=A.createOscillator(),g=A.createGain();o.type=type||'square';o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(A.destination);o.start(t);o.stop(t+d)}catch(e){}}
function noise(d,v,f){if(!soundOn)return;try{const A=actx(),n=A.sampleRate*d|0,b=A.createBuffer(1,n,A.sampleRate),ch=b.getChannelData(0);for(let i=0;i<n;i++)ch[i]=(Math.random()*2-1)*(1-i/n)**2;
  const s=A.createBufferSource(),g=A.createGain(),fl=A.createBiquadFilter();fl.type='lowpass';fl.frequency.value=f;g.gain.value=v;s.buffer=b;s.connect(fl).connect(g).connect(A.destination);s.start()}catch(e){}}
function burst(x,y,n,col,sp,r,k,g){for(let i=0;i<n;i++){const a=Math.random()*7,v=sp*(.3+Math.random()),l=.35+Math.random()*.35;PT.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l,m:l,c:col,r:r*(.5+Math.random()),k:k||'d',g:g||0,rot:Math.random()*7,vr:(Math.random()-.5)*16})}}
function one(k,x,y,r,c,l){PT.push({k,x,y,vx:0,vy:0,l,m:l,c,r,g:0,rot:0,vr:0})}
function txt(x,y,t,c,s){FT.push({x,y,l:.9,m:.9,t:String(t),c,s:s||15})}
function nearP(x,y){let b=null,bd=34;if(G)for(const p of G.P){const d=dist(p.x,p.y,x,y);if(d<bd){bd=d;b=p}}return b}
const SHOT_SND={luke:()=>beep(900,320,.07,.045),rex:()=>{noise(.1,.12,900);beep(180,90,.1,.06)},nina:()=>beep(1500,700,.06,.03,'triangle'),zappa:()=>beep(1600,200,.16,.05,'sawtooth'),bert:()=>beep(260,520,.12,.04,'sine'),flora:()=>beep(600,1100,.07,.04,'sine')};

function applyFx(list){const m=G&&G.P[me];for(const[k,x,y,v]of list){const near=m&&dist(x,y,m.x,m.y)<TS*14,q=nearP(x,y);
    if(k==='hit'){txt(x+(Math.random()-.5)*16,y-36,v,'#fff',v>=800?21:15);burst(x,y-6,5,'#fff',150,2.6,'star');burst(x,y-6,3,q?HEROES[q.hero].col:'#ffd23f',110,3);if(q){HF[q.id]=.16;if(q.id===me)SHK=Math.max(SHK,.25)}if(near)beep(320,110,.07,.05)}
    else if(k==='heal'){txt(x,y-36,'+'+v,'#6aff8a');burst(x,y-8,6,'#5aff7a',70,4.5,'plus',-70);if(near)beep(520,880,.15,.05,'sine')}
    else if(k==='die'){const col=G.P[v]?HEROES[G.P[v].hero].col:'#fff';one('flash',x,y,70,0,.16);one('ring',x,y,70,'255,255,255',.4);burst(x,y,24,col,240,5);burst(x,y,8,'#ffffff',90,9,'smoke',-40);burst(x,y,9,'#ffd23f',200,4,'star');
      txt(x,y-44,'K.O.','#ffd23f',25);if(near){SHK=Math.max(SHK,.45);beep(400,60,.35,.12,'sawtooth');noise(.35,.2,900)}}
    else if(k==='shot'){const sp=String(v).endsWith('!'),hk=String(v).replace('!','');if(q)RC[q.id]=1;
      if(sp){one('ring',x,y,64,'255,215,70',.45);burst(x,y,10,'#ffd23f',190,4,'star');txt(x,y-56,HEROES[hk].sn+'!','#ffd23f',19);if(near){beep(220,880,.3,.08,'sawtooth');noise(.25,.12,1800)}}
      else if(near&&SHOT_SND[hk])SHOT_SND[hk]()}
    else if(k==='boom'){one('flash',x,y,v*1.2,0,.14);one('ring',x,y,v,'255,220,150',.35);burst(x,y,14,'#ffb03a',260,6);burst(x,y,9,'#ff5a2a',170,7);burst(x,y,9,'#4a4652',70,v/5,'smoke',-45);burst(x,y,7,'#3a3a48',240,4,'chip',300);
      DEC.push({x,y,r:v*.75,l:9});if(near){SHK=Math.max(SHK,Math.min(.7,v/110*.5));noise(.45,.3,700);beep(140,40,.3,.12,'sawtooth')}}
    else if(k==='puff')burst(x,y,5,'#fff',90,2.4,'star');
    else if(k==='gem'){burst(x,y,8,'#e09aff',130,3.4,'star');txt(x,y-30,'+1','#e9b4ff',17);if(near)beep(700,1300,.12,.06,'sine')}
    else if(k==='cube'){burst(x,y,8,'#8aff7a',130,3.4,'star');txt(x,y-30,'+Kraft','#8aff7a',17);if(near)beep(500,1000,.14,.06,'sine')}
    else if(k==='crate'){if(G){G.t[v]=0;delete G.crate[v]}burst(x,y,11,'#c8873a',230,5,'chip',320);burst(x,y,5,'#e0d0b0',60,8,'smoke',-30);if(near)noise(.2,.15,1200)}
    else if(k==='spawn'){one('ring',x,y,40,'230,170,255',.4);burst(x,y,8,'#f0c0ff',110,3,'star')}}}
function updFx(dt){for(const p of PT){p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const f=p.k==='smoke'?.95:.9;p.vx*=f;p.vy*=f;if(p.g)p.vy+=p.g*dt;p.rot+=p.vr*dt}
  PT=PT.filter(p=>p.l>0);if(PT.length>520)PT.splice(0,PT.length-520);for(const f of FT){f.l-=dt;f.y-=30*dt}FT=FT.filter(f=>f.l>0);
  SHK=Math.max(0,SHK-dt*1.7);for(const id in HF)if((HF[id]-=dt)<=0)delete HF[id];for(const id in RC)if((RC[id]-=dt*5)<=0)delete RC[id];for(const d of DEC)d.l-=dt;DEC=DEC.filter(d=>d.l>0)}

function drawParts(c){for(const p of PT){const f=clamp(p.l/p.m,0,1);
    if(p.k==='ring'){c.strokeStyle=`rgba(${p.c},${f})`;c.lineWidth=6*f+1;c.beginPath();c.arc(p.x,p.y,p.r*(1-f*f)+6,0,TAU);c.stroke()}
    else if(p.k==='flash')glow(c,p.x,p.y,p.r*(1.25-f*.45),'255,245,200',f);
    else if(p.k==='smoke'){c.globalAlpha=f*.5;c.fillStyle=p.c;c.beginPath();c.arc(p.x,p.y,p.r*(2.3-f*1.3),0,TAU);c.fill()}
    else if(p.k==='star'){c.globalAlpha=Math.min(1,f*2);star(c,p.x,p.y,p.r*2*f+1.2,(p.r*2*f+1.2)*.32,4,p.rot,p.c,0)}
    else if(p.k==='plus'){c.globalAlpha=Math.min(1,f*2);c.fillStyle=p.c;const s=p.r;c.fillRect(p.x-s,p.y-s/3,s*2,s*.66);c.fillRect(p.x-s/3,p.y-s,s*.66,s*2)}
    else if(p.k==='chip'){c.globalAlpha=Math.min(1,f*2);c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.fillStyle=p.c;c.fillRect(-p.r,-p.r*.5,p.r*2,p.r);c.strokeStyle=OL;c.lineWidth=1;c.strokeRect(-p.r,-p.r*.5,p.r*2,p.r);c.restore()}
    else if(p.k==='ghost'){c.globalAlpha=f*.38;drawHero(c,p.hero,p.x,p.y,p.a,null,p.t,1,{bare:1,mv:1})}
    else{c.globalAlpha=Math.min(1,f*1.6);c.fillStyle=p.c;c.beginPath();c.arc(p.x,p.y,p.r*(.4+f*.6),0,TAU);c.fill()}
    c.globalAlpha=1}}
function drawTexts(c){c.textAlign='center';c.lineJoin='round';for(const f of FT){const k=f.l/f.m,pop=1+Math.max(0,k-.8)*3;c.globalAlpha=Math.min(1,k*2.2);c.font=`900 ${f.s*pop}px "Trebuchet MS",sans-serif`;c.lineWidth=4;c.strokeStyle='rgba(20,16,44,.9)';c.strokeText(f.t,f.x,f.y);c.fillStyle=f.c;c.fillText(f.t,f.x,f.y)}c.globalAlpha=1}

/* ---------- Geschosse: jede Waffe sieht anders aus; Rand in Teamfarbe ---------- */
function drawShot(c,s,m,t){const tc=s.team===m.team?'90,200,255':'255,90,70';
  if(s.k==='l'){const k=Math.min(1,s.t/s.time),hgt=Math.sin(k*Math.PI)*(s.big?110:75),r=s.big?13:7.5;
    c.fillStyle=`rgba(${tc},${.13+Math.sin(t*20)*.07})`;c.beginPath();c.arc(s.tx,s.ty,s.ex,0,TAU);c.fill();c.strokeStyle=`rgba(${tc},.95)`;c.lineWidth=3;c.setLineDash([9,7]);c.lineDashOffset=-t*50;c.stroke();c.setLineDash([]);
    c.lineWidth=2;c.beginPath();c.moveTo(s.tx-7,s.ty);c.lineTo(s.tx+7,s.ty);c.moveTo(s.tx,s.ty-7);c.lineTo(s.tx,s.ty+7);c.stroke();
    c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(s.x,s.y,r*(1-hgt/260),r*.5*(1-hgt/260),0,0,TAU);c.fill();
    c.save();c.translate(s.x,s.y-hgt);c.rotate(t*(s.big?5:9));el(c,0,0,r,r,lit(c,0,0,r,'#3a3a48'));if(s.big){c.fillStyle='#e8334a';c.fillRect(-r*.9,-3,r*1.8,6);c.fillStyle='#ffd23f';for(const bx of[-6,0,6])c.fillRect(bx-1.5,-3,3,6)}
    rr(c,-2,-r-3.5,4,4.5,1,'#b9c2cf',1.2);star(c,0,-r-6,3.4+Math.sin(t*40)*1.6,1.2,4,t*12,'#ffe95a',0);c.restore();return}
  const an=Math.atan2(s.vy,s.vx),hk=s.hero;c.save();c.translate(s.x,s.y);c.rotate(an);glow(c,0,0,s.r*2.8,tc,.6);c.lineCap='round';
  if(hk==='luke'&&s.r>=8){poly(c,[-9,-3.4,-20-Math.random()*8,0,-9,3.4],'#ffb03a',0);poly(c,[-9,-2,-15-Math.random()*5,0,-9,2],'#fff6c0',0);poly(c,[-9,-4,-13,-8,-4,-4],'#e8334a',1.3);poly(c,[-9,4,-13,8,-4,4],'#e8334a',1.3);
    rr(c,-10,-4.2,18,8.4,3,'#e6ecf6',1.6);poly(c,[7,-4.2,15,0,7,4.2],'#e8334a',1.6);if(Math.random()<.5)PT.push({k:'smoke',x:s.x-Math.cos(an)*14,y:s.y-Math.sin(an)*14,vx:0,vy:-12,l:.4,m:.4,c:'#d8dce6',r:4,g:0,rot:0,vr:0})}
  else if(hk==='luke'){c.strokeStyle='rgba(120,200,255,.5)';c.lineWidth=6;c.beginPath();c.moveTo(-22,0);c.lineTo(0,0);c.stroke();rr(c,-8,-3.2,16,6.4,3.2,'#5ac0ff',1.4);rr(c,-4.5,-1.3,10,2.6,1.3,'#fff',0)}
  else if(hk==='rex'){c.strokeStyle='rgba(255,170,60,.5)';c.lineWidth=7;c.beginPath();c.moveTo(-16,0);c.lineTo(0,0);c.stroke();el(c,0,0,6,4.6,'#ffb04a',1.5);el(c,1.5,-1,2.4,1.5,'#fff0c0',0)}
  else if(hk==='nina'){c.strokeStyle='rgba(190,120,255,.5)';c.lineWidth=5;c.beginPath();c.moveTo(-18,0);c.lineTo(0,0);c.stroke();c.rotate(t*26);star(c,0,0,8.4,2.7,4,0,'#eef3fa',1.4);el(c,0,0,1.7,1.7,'#7a35c9',0)}
  else if(hk==='zappa'){const pts=[];for(let i=0;i<=5;i++)pts.push(-38+i*8.8,i===5?0:(Math.random()-.5)*11);for(const[w,col]of[[8,'rgba(110,235,255,.55)'],[2.8,'#fff']]){c.strokeStyle=col;c.lineWidth=w;c.lineJoin='round';c.beginPath();for(let i=0;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.stroke()}
    glow(c,6,0,12,'200,250,255',.9);el(c,6,0,4.6,4.6,'#fff',0)}
  else if(hk==='flora'){c.strokeStyle='rgba(120,255,150,.45)';c.lineWidth=5;c.beginPath();c.moveTo(-20,0);c.lineTo(-8,0);c.stroke();rr(c,-13,-2.2,3.4,4.4,1,'#b9c2cf',1.2);rr(c,-9.6,-3,13.6,6,2.6,'rgba(235,248,255,.95)',1.4);
    c.fillStyle='#ff5a8f';c.beginPath();c.roundRect(-8,-1.7,9,3.4,1.5);c.fill();c.strokeStyle='#eef3fa';c.lineWidth=1.5;c.beginPath();c.moveTo(4,0);c.lineTo(11,0);c.stroke()}
  else el(c,0,0,s.r,s.r,'#fff',1.5);
  c.restore()}

/* ---------- Gewitterfeld und Heilkreis ---------- */
function drawZone(c,z,m,t){const tc=z.k==='h'?'90,255,130':z.team===m.team?'90,200,255':'255,90,70';
  if(z.k==='h'){const f=clamp(1-z.t/.6,0,1);c.fillStyle=`rgba(${tc},${.3*(1-f)})`;c.beginPath();c.arc(z.x,z.y,z.r,0,TAU);c.fill();c.strokeStyle=`rgba(${tc},${1-f})`;c.lineWidth=7;c.beginPath();c.arc(z.x,z.y,z.r*(.3+f*.7),0,TAU);c.stroke();return}
  c.fillStyle='rgba(40,30,100,.3)';c.beginPath();c.arc(z.x,z.y,z.r,0,TAU);c.fill();c.strokeStyle=`rgba(${tc},.95)`;c.lineWidth=3.5;c.setLineDash([12,8]);c.lineDashOffset=t*60;c.stroke();c.setLineDash([]);
  for(let n=0;n<2;n++)if(Math.random()<.55){const a=Math.random()*7,d=Math.random()*z.r*.85,bx=z.x+Math.cos(a)*d,by=z.y+Math.sin(a)*d;let px=bx+(Math.random()-.5)*30,py=by-95;
    for(const[w,col]of[[7,'rgba(110,235,255,.5)'],[2.6,'#fff']]){c.strokeStyle=col;c.lineWidth=w;c.lineJoin='round';c.beginPath();c.moveTo(px,py);for(let i=1;i<=4;i++)c.lineTo(px+(bx-px)*i/4+(i<4?(n*7+i*13)%17-8:0),py+(by-py)*i/4);c.stroke()}
    glow(c,bx,by,18,'200,250,255',.8)}
  for(let i=0;i<7;i++){const a=i*TAU/7+t*.5,d=z.r*(.25+.5*((i*37)%10)/10);c.fillStyle=`rgba(${70+i*6},${60+i*5},${130+i*8},.8)`;c.beginPath();c.arc(z.x+Math.cos(a)*d,z.y-92+Math.sin(a)*d*.35,22+(i%3)*5,0,TAU);c.fill()}}

/* ---------- Juwelen und Kraftwürfel ---------- */
function drawItem(c,g,solo,t){const by=Math.sin(t*4+g.x)*2.5,x=g.x,y=g.y+by-3;c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.ellipse(g.x,g.y+11,8.5,3.6,0,0,TAU);c.fill();
  if(solo){glow(c,x,y,22,'110,255,120',.45+Math.sin(t*6+g.y)*.15);rr(c,x-9,y-9,18,18,4,lit(c,x,y,12,'#3fd84f'));poly(c,[x+1.5,y-6.5,x-4.5,y+1.2,x-.6,y+1.2,x-2,y+6.5,x+4.5,y-1.6,x+.6,y-1.6],'#fff6a0',1.1)}
  else{glow(c,x,y,24,'210,120,255',.5+Math.sin(t*6+g.y)*.15);poly(c,[x,y-12,x+9.5,y-3,x,y+10,x-9.5,y-3],'#b044f0');poly(c,[x,y-12,x+9.5,y-3,x,y-1.5],'#d98aff',0);poly(c,[x,y-12,x-9.5,y-3,x,y-1.5],'#efc4ff',0);
    c.strokeStyle=OL;c.lineWidth=1;c.beginPath();c.moveTo(x-9.5,y-3);c.lineTo(x,y-1.5);c.lineTo(x+9.5,y-3);c.moveTo(x,y-1.5);c.lineTo(x,y+10);c.stroke();star(c,x-4,y-7,3.6+Math.sin(t*7+g.x)*1.6,1,4,t*2,'#fff',0)}}
