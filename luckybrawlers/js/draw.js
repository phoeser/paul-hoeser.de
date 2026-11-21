"use strict";
/* ======================= Lucky Brawlers – Zeichnen, Effekte, Ton ======================= */
const cv=$('cv'),cx=cv.getContext('2d');
let VW=0,VH=0,DPR=1,SC=1,camX=0,camY=0,PT=[],FT=[],groundC=null,bushC=null,groundFor=null,AC=null,soundOn=true,STICKS=[],aimPrev=null;
const PAL={gem:{g1:'#7ed957',g2:'#72cc4e',w1:'#9a7be0',w2:'#5d43a3',edge:'#3a2a6e'},solo:{g1:'#ecd08a',g2:'#e2c47a',w1:'#d08a4e',w2:'#8a4a22',edge:'#5a2e12'}};
function shadeC(hex,f){const n=parseInt(hex.slice(1),16);return'rgb('+[n>>16,n>>8&255,n&255].map(v=>clamp(v*f,0,255)|0).join(',')+')'}
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);VW=window.innerWidth;VH=window.innerHeight;cv.width=VW*DPR;cv.height=VH*DPR;SC=Math.max(.55,Math.min(VW,VH)/(11*TS))*(VW>VH?1.1:1)}

/* ---------- Boden, Mauern und Büsche einmal vorzeichnen ---------- */
function buildGround(){const W=G.W*TS,H=G.H*TS,p=PAL[G.mode];groundC=document.createElement('canvas');groundC.width=W;groundC.height=H;const c=groundC.getContext('2d');
  let s=G.seed>>>0||1;const R=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};
  for(let y=0;y<G.H;y++)for(let x=0;x<G.W;x++){c.fillStyle=(x+y)%2?p.g1:p.g2;c.fillRect(x*TS,y*TS,TS,TS)}
  for(let i=0;i<G.W*G.H*.6;i++){c.fillStyle=R()<.5?'rgba(255,255,255,.12)':'rgba(0,0,0,.07)';c.beginPath();c.arc(R()*W,R()*H,1+R()*2.5,0,7);c.fill()}
  for(let y=0;y<G.H;y++)for(let x=0;x<G.W;x++)if(G.t[y*G.W+x]===4){c.fillStyle='#3fb2f0';c.fillRect(x*TS,y*TS,TS,TS);c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=2;c.beginPath();c.arc(x*TS+12,y*TS+16,6,3.4,5.6);c.stroke();c.beginPath();c.arc(x*TS+28,y*TS+28,5,3.4,5.6);c.stroke()}
  for(let y=0;y<G.H;y++)for(let x=0;x<G.W;x++)if(G.t[y*G.W+x]===1){const px=x*TS,py=y*TS;c.fillStyle=p.w2;c.fillRect(px,py+TS-14,TS,14);c.strokeStyle=p.edge;c.lineWidth=2;c.strokeRect(px+1,py+TS-14,TS-2,13);
    c.fillStyle=p.w1;c.beginPath();c.roundRect(px,py-8,TS,TS-6,5);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.22)';c.fillRect(px+5,py-4,TS-10,4)}
  bushC=document.createElement('canvas');bushC.width=W;bushC.height=H;const b=bushC.getContext('2d');
  for(let y=0;y<G.H;y++)for(let x=0;x<G.W;x++)if(G.t[y*G.W+x]===2)for(let k=0;k<5;k++){const bx=x*TS+8+R()*24,by=y*TS+8+R()*24,r=11+R()*6;b.fillStyle=k%2?'#35b24a':'#2a9a3e';b.beginPath();b.arc(bx,by,r,0,7);b.fill();b.strokeStyle='#1c6e2c';b.lineWidth=2;b.stroke();b.fillStyle='rgba(255,255,255,.25)';b.beginPath();b.arc(bx-3,by-4,r*.35,0,7);b.fill()}}

/* ---------- Helden ---------- */
function ball(c,x,y,r,col){const g=c.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r);g.addColorStop(0,shadeC(col,1.35));g.addColorStop(1,shadeC(col,.75));c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();c.strokeStyle='#1a1a2a';c.lineWidth=2.4;c.stroke()}
function drawHero(c,k,x,y,a,ring,t,sc){const col=HEROES[k].col,OL='#1a1a2a';c.save();c.translate(x,y);if(sc)c.scale(sc,sc);c.lineJoin='round';
  c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.ellipse(0,PR*.8,PR*1.05,PR*.45,0,0,7);c.fill();
  if(ring){c.strokeStyle=ring;c.lineWidth=3;c.beginPath();c.ellipse(0,PR*.75,PR*1.35,PR*.62,0,0,7);c.stroke()}
  const hy=Math.sin(t*9)*.4,box=(x0,y0,w,hh,fc)=>{c.fillStyle=fc;c.beginPath();c.roundRect(x0,y0,w,hh,2);c.fill();c.stroke()};
  // Waffe und Hand zeigen in Zielrichtung
  c.save();c.rotate(a);c.lineWidth=2;c.strokeStyle=OL;
  if(k==='luke'){box(PR-4,-3.5,17,7,'#8a93a8');box(PR+9,-5,5,10,'#ffd23f')}
  else if(k==='rex'){box(PR-5,-8,15,6,'#7a8088');box(PR-5,2,15,6,'#7a8088')}
  else if(k==='nina'){c.save();c.translate(PR+7,0);c.rotate(t*10);c.fillStyle='#dfe6f0';c.beginPath();for(let i=0;i<8;i++){const r=i%2?2.5:7,an=i*Math.PI/4;c.lineTo(Math.cos(an)*r,Math.sin(an)*r)}c.closePath();c.fill();c.stroke();c.restore()}
  else if(k==='zappa'){box(PR-6,-1.5,20,3,'#8a5a2a');c.fillStyle='#ffe95a';c.beginPath();c.arc(PR+15,0,4.5,0,7);c.fill();c.stroke()}
  else if(k==='bert'){c.fillStyle='#2a2a34';c.beginPath();c.arc(PR+6,0,6.5,0,7);c.fill();c.stroke();c.fillStyle='#ffb03a';c.beginPath();c.arc(PR+11,-5,2.2,0,7);c.fill()}
  else{box(PR-4,-2.5,15,5,'#e8f4ff');box(PR+11,-1,6,2,'#c0c8d0');c.fillStyle='#ff5a7a';c.fillRect(PR-1,-1.5,7,3)}
  c.fillStyle=shadeC(col,1.15);c.beginPath();c.arc(PR-3,0,4,0,7);c.fill();c.stroke();c.restore();
  ball(c,0,2+hy,PR,col);c.lineWidth=2;c.strokeStyle=OL;
  // Kopfschmuck
  if(k==='luke'){c.fillStyle='#1f4fd0';c.beginPath();c.arc(0,-3+hy,PR*.95,Math.PI*1.05,Math.PI*1.95);c.closePath();c.fill();c.stroke();c.fillStyle='#ffd23f';c.beginPath();for(let i=0;i<10;i++){const r=i%2?2:4.6,an=i*Math.PI/5-Math.PI/2;c.lineTo(Math.cos(an)*r,-10+hy+Math.sin(an)*r)}c.closePath();c.fill()}
  else if(k==='rex'){c.fillStyle='#c8ccd4';c.beginPath();c.roundRect(-9,-15+hy,18,9,3);c.fill();c.stroke();c.beginPath();c.moveTo(0,-15+hy);c.lineTo(0,-21+hy);c.stroke();c.fillStyle='#ff3a3a';c.beginPath();c.arc(0,-22+hy,2.4,0,7);c.fill()}
  else if(k==='nina'){c.fillStyle='#3a1a5a';c.fillRect(-PR+1,-7+hy,PR*2-2,5);c.beginPath();c.moveTo(-PR+2,-5+hy);c.lineTo(-PR-8,-9+hy+Math.sin(t*8)*2);c.lineTo(-PR-7,-2+hy);c.closePath();c.fill();c.stroke()}
  else if(k==='zappa'){c.fillStyle='#0e8f96';c.beginPath();c.moveTo(-12,-7+hy);c.lineTo(2,-27+hy);c.lineTo(12,-7+hy);c.closePath();c.fill();c.stroke();c.fillStyle='#ffe95a';c.beginPath();c.arc(1,-15+hy,2.6,0,7);c.fill()}
  else if(k==='bert'){c.fillStyle='#a01e1e';c.beginPath();c.arc(0,-2+hy,PR*.98,Math.PI,0);c.closePath();c.fill();c.stroke();c.fillStyle='#ffd23f';c.fillRect(-PR+2,-4+hy,PR*2-4,3)}
  else{c.fillStyle='#1f8a34';for(const sx of[-7,0,7]){c.beginPath();c.ellipse(sx,-13+hy,4,7,sx*.06,0,7);c.fill();c.stroke()}}
  // Augen schauen in Zielrichtung
  const ex=Math.cos(a)*3.2,ey=Math.sin(a)*2.2+1+hy;for(const sd of[-1,1]){c.fillStyle='#fff';c.beginPath();c.ellipse(ex+sd*5,ey,4,4.8,0,0,7);c.fill();c.lineWidth=1.2;c.stroke();c.fillStyle=OL;c.beginPath();c.arc(ex+sd*5+Math.cos(a)*1.5,ey+Math.sin(a)*1.5,1.9,0,7);c.fill()}
  c.restore()}

/* ---------- Effekte und Ton ---------- */
function beep(f1,f2,d,v,type){if(!soundOn)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d)}catch(e){}}
function burst(x,y,n,col,sp,r){for(let i=0;i<n;i++){const a=Math.random()*7,v=sp*(.3+Math.random());PT.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.35+Math.random()*.3,m:.65,c:col,r:r*(.5+Math.random())})}}
function applyFx(list){const m=G&&G.P[me];for(const[k,x,y,v]of list){const near=m&&dist(x,y,m.x,m.y)<TS*14;
    if(k==='hit'){FT.push({x,y:y-18,l:.7,t:'-'+v,c:'#ff5a4a'});burst(x,y,4,'#ffffff',90,3);if(near)beep(300,120,.07,.05)}
    else if(k==='heal'){FT.push({x,y:y-18,l:.8,t:'+'+v,c:'#5aff7a'});burst(x,y,5,'#7aff8a',60,3)}
    else if(k==='die'){burst(x,y,22,'#ffffff',220,5);burst(x,y,12,'#ffd23f',160,4);if(near)beep(400,60,.35,.12,'sawtooth')}
    else if(k==='shot'){const sp=String(v).endsWith('!');if(near)beep(sp?220:620,sp?660:260,sp?.25:.08,.05)}
    else if(k==='boom'){PT.push({x,y,vx:0,vy:0,l:.3,m:.3,c:'ring',r:v});burst(x,y,14,'#ffb03a',200,5);burst(x,y,8,'#ff5a2a',140,6);if(near)beep(160,40,.3,.14,'sawtooth')}
    else if(k==='puff')burst(x,y,4,'#e8e8f0',70,3);
    else if(k==='gem'){burst(x,y,8,'#d07aff',120,3);if(near)beep(700,1300,.12,.06,'sine')}
    else if(k==='cube'){burst(x,y,8,'#6aff5a',120,3);if(near)beep(500,1000,.14,.06,'sine')}
    else if(k==='crate'){if(G){G.t[v]=0;delete G.crate[v]}burst(x,y,12,'#b07a3a',160,5);if(near)beep(200,70,.2,.1,'sawtooth')}
    else if(k==='spawn')burst(x,y,10,'#e0a0ff',100,3)}}
function updFx(dt){for(const p of PT){p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.9;p.vy*=.9}PT=PT.filter(p=>p.l>0);if(PT.length>400)PT.splice(0,PT.length-400);for(const f of FT){f.l-=dt;f.y-=28*dt}FT=FT.filter(f=>f.l>0)}

/* ---------- Ein Bild ---------- */
function render(){const c=cx;c.setTransform(DPR,0,0,DPR,0,0);c.fillStyle='#141a33';c.fillRect(0,0,VW,VH);if(!G||!G.P.length)return;if(groundFor!==G){buildGround();groundFor=G}
  const m=G.P[me]||G.P[0],vw=VW/SC,vh=VH/SC,MWp=G.W*TS,MHp=G.H*TS,t=G.time,solo=G.mode==='solo';
  camX=MWp<vw?(MWp-vw)/2:clamp(m.x-vw/2,0,MWp-vw);camY=MHp<vh?(MHp-vh)/2:clamp(m.y-vh/2,0,MHp-vh);
  c.setTransform(DPR*SC,0,0,DPR*SC,-camX*DPR*SC,-camY*DPR*SC);c.drawImage(groundC,0,0);c.lineJoin='round';
  const inView=(x,y)=>x>camX-60&&y>camY-60&&x<camX+vw+60&&y<camY+vh+60;
  for(const z of G.zones){const col=z.k==='h'?'90,255,120':'255,233,90';c.fillStyle=`rgba(${col},${.18+Math.sin(t*12)*.06})`;c.beginPath();c.arc(z.x,z.y,z.r,0,7);c.fill();c.strokeStyle=`rgba(${col},.85)`;c.lineWidth=3;c.stroke()}
  if(!solo){c.fillStyle='rgba(70,30,110,.45)';c.beginPath();c.ellipse(MWp/2,MHp/2,34,26,0,0,7);c.fill();c.strokeStyle='#3a1a6a';c.lineWidth=3;c.stroke()}
  // Kisten
  if(solo)for(let ty=Math.max(0,Math.floor(camY/TS)-1);ty<Math.min(G.H,(camY+vh)/TS+1);ty++)for(let tx=Math.max(0,Math.floor(camX/TS)-1);tx<Math.min(G.W,(camX+vw)/TS+1);tx++)if(G.t[ty*G.W+tx]===3){const px=tx*TS,py=ty*TS;
    c.fillStyle='#7a4a1e';c.fillRect(px+2,py+TS-12,TS-4,10);c.fillStyle='#c8873a';c.beginPath();c.roundRect(px+2,py-4,TS-4,TS-8,4);c.fill();c.strokeStyle='#5a3210';c.lineWidth=2;c.stroke();c.beginPath();c.moveTo(px+6,py);c.lineTo(px+TS-6,py+TS-16);c.moveTo(px+TS-6,py);c.lineTo(px+6,py+TS-16);c.stroke()}
  // Juwelen und Kraftwürfel
  for(const g of solo?G.cubes:G.gems){if(!inView(g.x,g.y))continue;const by=Math.sin(t*4+g.x)*2;c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(g.x,g.y+10,8,3.5,0,0,7);c.fill();c.lineWidth=2;
    if(solo){c.fillStyle='#4ae04a';c.beginPath();c.roundRect(g.x-8,g.y-9+by,16,16,3);c.fill();c.strokeStyle='#17691f';c.stroke();c.fillStyle='rgba(255,255,255,.55)';c.fillRect(g.x-5,g.y-6+by,5,4)}
    else{c.fillStyle='#c45aff';c.beginPath();c.moveTo(g.x,g.y-11+by);c.lineTo(g.x+8,g.y-2+by);c.lineTo(g.x,g.y+8+by);c.lineTo(g.x-8,g.y-2+by);c.closePath();c.fill();c.strokeStyle='#4a1a7a';c.stroke();c.fillStyle='rgba(255,255,255,.6)';c.beginPath();c.moveTo(g.x,g.y-9+by);c.lineTo(g.x-5,g.y-2+by);c.lineTo(g.x,g.y-3+by);c.closePath();c.fill()}}
  // Zielhilfe des eigenen Helden
  if(aimPrev&&!m.dead){const h=HEROES[m.hero],lob=h.atk.k==='lob',d=lob?clamp(aimPrev.d||h.rng*TS*.8,TS,h.rng*TS):h.rng*TS,ex=m.x+Math.cos(aimPrev.a)*d,ey=m.y+Math.sin(aimPrev.a)*d;
    if(lob){c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=3;c.setLineDash([7,6]);c.beginPath();c.arc(ex,ey,h.atk.ex,0,7);c.stroke();c.setLineDash([])}
    else{c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=h.atk.k==='fan'?26:12;c.lineCap='round';c.beginPath();c.moveTo(m.x,m.y);c.lineTo(ex,ey);c.stroke();c.lineCap='butt'}}
  // Helden
  const vis=G.P.filter(p=>!p.dead&&inView(p.x,p.y)&&visibleTo(m,p)).sort((a,b)=>a.y-b.y);
  const ringOf=p=>p.id===me?'#5aff7a':p.team===m.team?'#4aa8ff':'#ff4a4a';
  for(const p of vis){c.globalAlpha=tileAt(p.x,p.y)===2?.6:1;drawHero(c,p.hero,p.x,p.y,p.aim,ringOf(p),t+p.id);c.globalAlpha=1;
    if(p.shield>0){c.strokeStyle=`rgba(140,225,255,${.5+Math.sin(t*14)*.3})`;c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,PR+7,0,7);c.stroke()}}
  // Schüsse
  for(const s of G.shots){if(!inView(s.x,s.y))continue;
    if(s.k==='l'){const k=Math.min(1,s.t/s.time),hgt=Math.sin(k*Math.PI)*70,r=s.big?11:7;c.strokeStyle='rgba(255,80,60,.7)';c.lineWidth=2;c.setLineDash([6,5]);c.beginPath();c.arc(s.tx,s.ty,s.ex,0,7);c.stroke();c.setLineDash([]);
      c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(s.x,s.y,r,r*.5,0,0,7);c.fill();c.fillStyle='#2a2a34';c.beginPath();c.arc(s.x,s.y-hgt,r,0,7);c.fill();c.strokeStyle='#ff5a3a';c.stroke()}
    else{const col=s.team===m.team?'#6ad0ff':'#ff6a5a';c.strokeStyle=col;c.lineWidth=s.r*1.1;c.lineCap='round';c.globalAlpha=.45;c.beginPath();c.moveTo(s.x,s.y);c.lineTo(s.x-s.vx*.04,s.y-s.vy*.04);c.stroke();c.globalAlpha=1;c.lineCap='butt';
      c.fillStyle=HEROES[s.hero]?HEROES[s.hero].col:col;c.beginPath();c.arc(s.x,s.y,s.r,0,7);c.fill();c.strokeStyle=col;c.lineWidth=2;c.stroke()}}
  c.drawImage(bushC,0,0);
  // Giftnebel
  if(solo){const R=gasR();c.fillStyle='rgba(80,220,90,.32)';c.beginPath();c.rect(camX-50,camY-50,vw+100,vh+100);c.arc(MWp/2,MHp/2,R,0,Math.PI*2,true);c.fill('evenodd');c.strokeStyle='rgba(130,255,130,.9)';c.lineWidth=4;c.beginPath();c.arc(MWp/2,MHp/2,R,0,7);c.stroke()}
  // Funken
  for(const p of PT){const f=p.l/p.m;if(p.c==='ring'){c.strokeStyle=`rgba(255,220,150,${f})`;c.lineWidth=4*f+1;c.beginPath();c.arc(p.x,p.y,p.r*(1-f)+8,0,7);c.stroke()}else{c.globalAlpha=Math.min(1,f*1.5);c.fillStyle=p.c;c.beginPath();c.arc(p.x,p.y,p.r,0,7);c.fill();c.globalAlpha=1}}
  // Namen, Lebensbalken, Munition
  c.textAlign='center';for(const p of vis){const y=p.y-PR-20,w=38,f=clamp(p.hp/p.max,0,1);c.font='bold 11px sans-serif';c.lineWidth=3;c.strokeStyle='rgba(10,12,30,.85)';c.strokeText(p.name,p.x,y-5);c.fillStyle='#fff';c.fillText(p.name,p.x,y-5);
    c.fillStyle='rgba(10,12,30,.85)';c.fillRect(p.x-w/2-1.5,y-1.5,w+3,8);c.fillStyle=p.id===me?'#5aff7a':p.team===m.team?'#4aa8ff':'#ff4a4a';c.fillRect(p.x-w/2,y,w*f,5);
    const n=solo?p.cubes:p.gems;if(n){c.fillStyle=solo?'#2fae3a':'#a03ae0';c.beginPath();c.arc(p.x+w/2+9,y+2,8,0,7);c.fill();c.strokeStyle='#1a1a2a';c.lineWidth=1.5;c.stroke();c.fillStyle='#fff';c.font='bold 10px sans-serif';c.fillText(n,p.x+w/2+9,y+5.5)}
    if(p.id===me)for(let i=0;i<3;i++){c.fillStyle='rgba(10,12,30,.85)';c.fillRect(p.x-w/2+i*13-.5,y+8,12,5);c.fillStyle='#ffb03a';c.fillRect(p.x-w/2+i*13+.5,y+9,10*clamp(p.ammo-i,0,1),3)}}
  c.font='bold 14px sans-serif';for(const f of FT){c.globalAlpha=Math.min(1,f.l*2);c.lineWidth=3;c.strokeStyle='rgba(10,12,30,.8)';c.strokeText(f.t,f.x,f.y);c.fillStyle=f.c;c.fillText(f.t,f.x,f.y)}c.globalAlpha=1;
  // Bildschirm-Ebene: Sticks und Hinweise
  c.setTransform(DPR,0,0,DPR,0,0);
  for(const s of STICKS){c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=3;c.beginPath();c.arc(s.ox,s.oy,46,0,7);c.stroke();c.fillStyle=s.aim?'rgba(255,120,90,.55)':'rgba(255,255,255,.4)';c.beginPath();c.arc(s.ox+s.dx,s.oy+s.dy,22,0,7);c.fill()}
  if(m.dead&&!G.over){c.fillStyle='rgba(10,12,30,.6)';c.fillRect(0,VH/2-26,VW,52);c.fillStyle='#fff';c.font='bold 20px sans-serif';c.textAlign='center';c.fillText(solo?'Ausgeschieden – du schaust zu':'Gleich geht es weiter … '+Math.max(1,Math.ceil(m.resp||0)),VW/2,VH/2+7)}}
