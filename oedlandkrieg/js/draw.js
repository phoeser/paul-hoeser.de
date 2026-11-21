"use strict";
/* ======================= Gelände zeichnen ======================= */
function renderTerrain(){const W=MW*T,H=MH*T;terrainC=document.createElement('canvas');terrainC.width=W;terrainC.height=H;const c=terrainC.getContext('2d');
  const n=noise2(W+8,H+8,90),n2=noise2(W,H,18),n3=noise2(W,H,260);srand(4242);
  const img=c.createImageData(W,H),d=img.data;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const v=n(x,y),w=n2(x,y),z=n3(x,y),lt=(n(x+6,y+6)-v)*-260,s=(Math.random()-.5)*12,i=(y*W+x)*4;
    const L=1+clamp(lt*.45,-.09,.09);
    d[i]=(146+v*52+w*14+z*22+s)*L;d[i+1]=(116+v*40+w*10-z*6+s)*L;d[i+2]=(74+v*24+w*6-z*16+s)*L;d[i+3]=255}
  c.putImageData(img,0,0);
  // Risse
  c.strokeStyle='rgba(60,40,20,.35)';c.lineWidth=1;for(let i=0;i<MW*MH/6;i++){let x=sr()*W,y=sr()*H;c.beginPath();c.moveTo(x,y);for(let k=0;k<5;k++){x+=(sr()-.5)*26;y+=(sr()-.5)*26;c.lineTo(x,y)}c.stroke()}
  // Krater & Schutt
  for(let i=0;i<MW*MH/55;i++){const x=sr()*W,y=sr()*H,r=8+sr()*22;const g=c.createRadialGradient(x,y,r*.2,x,y,r);g.addColorStop(0,'rgba(50,35,20,.55)');g.addColorStop(.7,'rgba(70,50,30,.25)');g.addColorStop(.85,'rgba(200,170,120,.25)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill()}
  // Fels: Umgebungsschatten und Schlagschatten
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(tiles[y*MW+x]===1){const cx=x*T+16,cy=y*T+16;const g=c.createRadialGradient(cx+6,cy+8,4,cx+6,cy+8,34);g.addColorStop(0,'rgba(35,22,10,.55)');g.addColorStop(1,'rgba(35,22,10,0)');c.fillStyle=g;c.beginPath();c.arc(cx+6,cy+8,34,0,7);c.fill()}
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(tiles[y*MW+x]===1){for(let k=0;k<3;k++){const cx=x*T+6+sr()*20,cy=y*T+6+sr()*20,r=11+sr()*9;
      const g=c.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r);const b=90+sr()*30;g.addColorStop(0,`rgb(${b+60},${b+45},${b+28})`);g.addColorStop(.6,`rgb(${b},${b-12},${b-28})`);g.addColorStop(1,`rgb(${b-45},${b-55},${b-65})`);
      c.fillStyle=g;c.beginPath();c.ellipse(cx,cy,r,r*.85,sr()*3,0,7);c.fill();
      c.strokeStyle='rgba(40,28,18,.45)';c.lineWidth=1.2;c.beginPath();c.moveTo(cx-r*.3,cy-r*.1);c.lineTo(cx+r*.1,cy+r*.3);c.lineTo(cx+r*.4,cy+r*.2);c.stroke();
      c.strokeStyle='rgba(255,235,200,.25)';c.beginPath();c.ellipse(cx,cy,r*.9,r*.75,0,3.5,4.6);c.stroke()}}
  // Fahrspuren
  c.strokeStyle='rgba(90,66,40,.18)';c.lineWidth=3;for(let i=0;i<MW/8;i++){const pts=[];let x=sr()*W,y=sr()*H,a=sr()*6;pts.push([x,y]);for(let k=0;k<14;k++){a+=(sr()-.5)*.5;x+=Math.cos(a)*40;y+=Math.sin(a)*40;pts.push([x,y])}
    for(const o of[0,6]){c.beginPath();pts.forEach(([px,py],k)=>k?c.lineTo(px+o,py+o):c.moveTo(px+o,py+o));c.stroke()}}
  // Schrottfelder
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(tiles[y*MW+x]===3&&(x===0||tiles[y*MW+x-1]!==3)&&(y===0||tiles[(y-1)*MW+x]!==3)){const cx=x*T+32,cy=y*T+32;
    c.fillStyle='rgba(50,40,30,.45)';c.beginPath();c.ellipse(cx,cy,38,32,0,0,7);c.fill();
    for(let k=0;k<16;k++){const px=cx+(sr()-.5)*52,py=cy+(sr()-.5)*44,w=6+sr()*14,h=4+sr()*9;c.save();c.translate(px,py);c.rotate(sr()*6);
      const g=c.createLinearGradient(-w/2,-h/2,w/2,h/2),b=70+sr()*60;g.addColorStop(0,`rgb(${b+40},${b+20},${b})`);g.addColorStop(1,`rgb(${b-30|0},${b-40|0},${b-45|0})`);c.fillStyle=g;c.fillRect(-w/2,-h/2,w,h);
      c.fillStyle='rgba(150,70,30,.45)';c.fillRect(-w/2,-h/2,w*.4,h);c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=1;c.strokeRect(-w/2,-h/2,w,h);c.restore()}
    for(let k=0;k<3;k++){const px=cx+(sr()-.5)*40,py=cy+(sr()-.5)*34;c.strokeStyle='#1a1614';c.lineWidth=4;c.beginPath();c.arc(px,py,6,0,7);c.stroke();c.strokeStyle='#3a3430';c.lineWidth=1;c.beginPath();c.arc(px,py,3,0,7);c.stroke()}}
  // Ölfelder
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(tiles[y*MW+x]===2&&(x===0||tiles[y*MW+x-1]!==2)&&(y===0||tiles[(y-1)*MW+x]!==2)){const cx=x*T+32,cy=y*T+32;
    c.fillStyle='rgba(20,14,8,.5)';c.beginPath();c.ellipse(cx,cy,36,30,0,0,7);c.fill();
    for(let k=0;k<6;k++){c.fillStyle='#0b0806';c.beginPath();c.ellipse(cx+(sr()-.5)*30,cy+(sr()-.5)*24,10+sr()*14,8+sr()*10,sr()*3,0,7);c.fill()}
    c.strokeStyle='rgba(120,90,200,.35)';c.lineWidth=2;c.beginPath();c.ellipse(cx-6,cy-6,12,6,.3,3.6,5.6);c.stroke();c.strokeStyle='rgba(80,200,180,.25)';c.beginPath();c.ellipse(cx+6,cy+4,9,4,.2,3.5,5.2);c.stroke()}
  // Deko: Knochen, tote Bäume, Autowracks
  for(let i=0;i<MW*MH/70;i++){const x=(sr()*MW)|0,y=(sr()*MH)|0;if(tiles[y*MW+x]!==0)continue;const px=x*T+sr()*T,py=y*T+sr()*T,k=sr();c.save();c.translate(px,py);c.rotate(sr()*6);
    if(k<.35){c.strokeStyle='#4a3a28';c.lineWidth=2.5;c.beginPath();c.moveTo(0,0);c.lineTo(0,-14);c.moveTo(0,-8);c.lineTo(6,-13);c.moveTo(0,-5);c.lineTo(-5,-9);c.stroke()}
    else if(k<.6){c.fillStyle='#e8dcc0';c.fillRect(-5,-1,10,2);c.beginPath();c.arc(-5,0,2,0,7);c.arc(5,0,2,0,7);c.fill()}
    else{c.fillStyle='#3d3128';c.fillRect(-12,-6,24,12);c.fillStyle='#2a221c';c.fillRect(-7,-5,10,10);c.fillStyle='#5a3a24';c.fillRect(-12,-6,4,12)}c.restore()}
  decalC=document.createElement('canvas');decalC.width=W;decalC.height=H;decalX=decalC.getContext('2d');
  // Minikarte
  miniBase=document.createElement('canvas');miniBase.width=MW;miniBase.height=MH;const m=miniBase.getContext('2d');
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=tiles[y*MW+x];m.fillStyle=t===1?'#5e5244':t===2?'#120c08':t===3?'#6e6a66':'#a98858';m.fillRect(x,y,1,1)}}

/* ======================= Zeichnen ======================= */
const cv=$('cv'),ctx=cv.getContext('2d');let DC=ctx;const mini=$('mini'),mctx=mini.getContext('2d');let CW=0,CH=0,DPR=1;
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);CW=cv.clientWidth;CH=cv.clientHeight;cv.width=CW*DPR;cv.height=CH*DPR;clampCam()}
const viewW=()=>CW/zoom,viewH=()=>CH/zoom;
function clampCam(){camX=clamp(camX,0,Math.max(0,MW*T-viewW()));camY=clamp(camY,0,Math.max(0,MH*T-viewH()))}
const onScreen=(x,y,m=40)=>x>camX-m&&y>camY-m&&x<camX+viewW()+m&&y<camY+viewH()+m;
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;r=clamp(r*f,0,255)|0;g=clamp(g*f,0,255)|0;b=clamp(b*f,0,255)|0;return`rgb(${r},${g},${b})`}
function render(){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,CW,CH);
  const shx=shake>0?(rnd()-.5)*shake*14:0,shy=shake>0?(rnd()-.5)*shake*14:0;ctx.setTransform(DPR*zoom,0,0,DPR*zoom,(-camX+shx)*DPR*zoom,(-camY+shy)*DPR*zoom);ctx.imageSmoothingEnabled=true;
  const vw=viewW(),vh=viewH();ctx.drawImage(terrainC,camX,camY,vw,vh,camX,camY,vw,vh);ctx.drawImage(decalC,camX,camY,vw,vh,camX,camY,vw,vh);
  const list=ents.filter(e=>!e.dead&&onScreen(e.x,e.y,e.k==='b'?120:40)&&(e.side!==1||isVisTo(0,e))).sort((a,b)=>(a.k==='b'?a.y-6:a.y)-(b.k==='b'?b.y-6:b.y));
  for(const e of list){if(e.k==='b')drawBld(e);}
  // Auswahl-Ringe unter Einheiten
  for(const e of sel)if(e.k==='u'&&!e.dead){ctx.strokeStyle='#7aff6a';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(e.x,e.y+2,e.s.r+3,(e.s.r+3)*.6,0,0,7);ctx.stroke()}
  for(const e of list)if(e.k==='u'&&!e.s.air)drawUnit(e);
  for(const t of tracers){ctx.strokeStyle=t.c;ctx.globalAlpha=Math.min(1,t.l*14);ctx.lineWidth=t.w||1.5;ctx.beginPath();ctx.moveTo(t.x1,t.y1);ctx.lineTo(t.x2,t.y2);ctx.stroke()}ctx.globalAlpha=1;
  for(const e of list)if(e.k==='u'&&e.s.air)drawUnit(e);
  for(const p of projs)if(p.wpn==='shell'){const k=clamp(1-dist(p.x,p.y,p.tx,p.ty)/Math.max(1,p.d0),0,1),hh=Math.sin(k*Math.PI)*p.d0*.3;ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.arc(p.x,p.y,3,0,7);ctx.fill();ctx.fillStyle='#2a2622';ctx.beginPath();ctx.arc(p.x,p.y-hh,4,0,7);ctx.fill();ctx.fillStyle='#ffb04a';ctx.beginPath();ctx.arc(p.x,p.y-hh,1.8,0,7);ctx.fill()}
  for(const n of nukes){const k=1-n.t/n.max,R=5.5*T;ctx.strokeStyle=n.fac==='mutant'?'#9aff3a':'#ff3a2a';ctx.globalAlpha=.4+Math.sin(time*12)*.3;ctx.lineWidth=3;ctx.setLineDash([10,8]);ctx.beginPath();ctx.arc(n.x,n.y,R,0,7);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(n.x,n.y,R*(1-k),0,7);ctx.stroke();ctx.globalAlpha=1;
    if(n.t<1.2){const hgt=n.t/1.2*500;ctx.fillStyle='#ddd';ctx.save();ctx.translate(n.x,n.y-hgt);ctx.fillRect(-4,-22,8,22);ctx.fillStyle='#c0302a';ctx.beginPath();ctx.moveTo(-4,0);ctx.lineTo(0,8);ctx.lineTo(4,0);ctx.fill();ctx.restore();ctx.fillStyle='rgba(255,200,80,.6)';ctx.beginPath();ctx.arc(n.x,n.y-hgt-26,6,0,7);ctx.fill()}}
  for(const p of projs)if(p.wpn!=='shell'){if(p.wpn==='rocket'){ctx.fillStyle='#ffdf6a';ctx.beginPath();ctx.arc(p.x,p.y,2.5,0,7);ctx.fill()}else{ctx.fillStyle='#2a2a2a';ctx.beginPath();ctx.arc(p.x,p.y,3,0,7);ctx.fill();ctx.fillStyle='#ffb04a';ctx.beginPath();ctx.arc(p.x,p.y,1.5,0,7);ctx.fill()}}
  for(const p of parts)if(p.t!=='fire'&&p.t!=='flash'&&p.t!=='txt')drawPart(p);
  ctx.globalCompositeOperation='lighter';for(const p of parts)if(p.t==='fire'||p.t==='flash')drawPart(p);for(const t of tracers)if(t.w){ctx.strokeStyle=t.c;ctx.globalAlpha=.35;ctx.lineWidth=t.w*3;ctx.beginPath();ctx.moveTo(t.x1,t.y1);ctx.lineTo(t.x2,t.y2);ctx.stroke()}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  for(const p of parts)if(p.t==='txt')drawPart(p);
  drawFog(vw,vh);
  // Lebensbalken
  for(const e of list){const show=sel.includes(e)||e.hp<e.max&&(e.k==='b'||e.lastHit&&time-e.lastHit<3);if(!show||e.type==='tech')continue;const w=e.k==='b'?e.w*T*.8:Math.max(18,e.s.r*2),x=e.x-w/2,y=e.k==='b'?e.ty*T-6:e.y-e.s.r-8;
    ctx.fillStyle='#000a';ctx.fillRect(x-1,y-1,w+2,5);const f=e.hp/e.max;ctx.fillStyle=f>.6?'#6ad13a':f>.3?'#e6c32a':'#e0402a';ctx.fillRect(x,y,w*f,3);
    if(e.k==='u'&&e.vet){ctx.fillStyle='#ffd84a';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText('★'.repeat(e.vet),e.x,y-2)}}
  for(const e of sel)if(e.k==='b'&&!e.dead){ctx.strokeStyle='#7aff6a';ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.strokeRect(e.tx*T,e.ty*T,e.w*T,e.h*T);ctx.setLineDash([]);
    if(e.rally){ctx.strokeStyle='#7aff6a88';ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.rally.x,e.rally.y);ctx.stroke();ctx.fillStyle='#7aff6a';ctx.fillRect(e.rally.x-2,e.rally.y-12,2,12);ctx.fillRect(e.rally.x,e.rally.y-12,8,5)}}
  // Bewegungsziel-Marker
  for(const m of marks){ctx.strokeStyle=m.c;ctx.globalAlpha=m.l;ctx.lineWidth=2;ctx.beginPath();ctx.arc(m.x,m.y,(1-m.l)*14+4,0,7);ctx.stroke()}ctx.globalAlpha=1;
  // Platzieren
  if(placing&&hover){const d=B[placing];const tx=Math.floor(hover.x/T-d.w/2+.5),ty=Math.floor(hover.y/T-d.h/2+.5);const ok=canPlace(sides[0],placing,tx,ty);
    ctx.globalAlpha=.55;drawBld({type:placing,side:0,tx,ty,w:d.w,h:d.h,x:(tx+d.w/2)*T,y:(ty+d.h/2)*T,hp:1,max:1,anim:time,tdir:1.5,ghost:true});ctx.globalAlpha=1;
    ctx.fillStyle=ok?'rgba(80,255,80,.25)':'rgba(255,60,40,.35)';ctx.fillRect(tx*T,ty*T,d.w*T,d.h*T);ctx.strokeStyle=ok?'#6f6':'#f44';ctx.strokeRect(tx*T,ty*T,d.w*T,d.h*T)}
  ctx.setTransform(DPR,0,0,DPR,0,0);drawMood();
  if(drag&&drag.box){ctx.strokeStyle='#7aff6a';ctx.lineWidth=1;ctx.fillStyle='rgba(120,255,100,.08)';const x=Math.min(drag.sx,drag.cx),y=Math.min(drag.sy,drag.cy),w=Math.abs(drag.cx-drag.sx),h=Math.abs(drag.cy-drag.sy);ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h)}
  if(atkMode){ctx.fillStyle='#e0402a';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText('ANGRIFFSBEWEGUNG – Ziel wählen',CW/2,CH-18)}
  if(supMode){ctx.fillStyle='#ff5a3a';ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.fillText('☢ ZIEL FÜR DIE SUPERWAFFE WÄHLEN – Rechtsklick bricht ab',CW/2,CH-18)}
  if(placing){ctx.fillStyle='#ffcf5a';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText('Bauplatz wählen – Rechtsklick bricht ab',CW/2,CH-18)}}
let fogC=null,fogX=null,fogImg=null,fogB=null,fogBX=null;const FS=6;
function updFog(){if(!fogC||fogC.width!==MW||fogC.height!==MH){fogC=document.createElement('canvas');fogC.width=MW;fogC.height=MH;fogX=fogC.getContext('2d');fogImg=fogX.createImageData(MW,MH);
    fogB=document.createElement('canvas');fogB.width=MW*FS;fogB.height=MH*FS;fogBX=fogB.getContext('2d')}
  const d=fogImg.data;for(let i=0;i<MW*MH;i++){d[i*4]=6;d[i*4+1]=4;d[i*4+2]=2;d[i*4+3]=!expl[i]?255:!vis[i]?125:0}fogX.putImageData(fogImg,0,0);
  fogBX.clearRect(0,0,fogB.width,fogB.height);fogBX.imageSmoothingEnabled=true;fogBX.filter='blur('+(FS*.9)+'px)';fogBX.drawImage(fogC,0,0,fogB.width,fogB.height);fogBX.filter='none'}
function drawFog(vw,vh){if(cfg.reveal||!fogB)return;ctx.imageSmoothingEnabled=true;ctx.drawImage(fogB,0,0,MW*T,MH*T)}
let vigC=null;
function drawMood(){if(!vigC||vigC.w!==CW||vigC.h!==CH){vigC={w:CW,h:CH,g:ctx.createRadialGradient(CW/2,CH/2,Math.min(CW,CH)*.35,CW/2,CH/2,Math.max(CW,CH)*.75)};vigC.g.addColorStop(0,'rgba(0,0,0,0)');vigC.g.addColorStop(1,'rgba(20,8,0,.5)')}
  ctx.fillStyle='rgba(255,150,70,.05)';ctx.fillRect(0,0,CW,CH);ctx.fillStyle=vigC.g;ctx.fillRect(0,0,CW,CH)}
function drawPart(p){const f=p.l/p.m;
  if(p.t==='fire'){ctx.fillStyle=`rgba(255,${120+f*120|0},${40*f|0},${f})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r*(.6+f*.6),0,7);ctx.fill()}
  else if(p.t==='heal'){ctx.fillStyle=`rgba(90,255,110,${f})`;ctx.fillRect(p.x-3,p.y-1,6,2);ctx.fillRect(p.x-1,p.y-3,2,6)}
  else if(p.t==='spark'){ctx.fillStyle=`rgba(255,230,120,${f})`;ctx.fillRect(p.x-1,p.y-1,2.5,2.5)}
  else if(p.t==='gas'){ctx.fillStyle=`rgba(120,200,60,${f*.35})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill()}
  else if(p.t==='dust'){ctx.fillStyle=`rgba(190,160,110,${f*.35})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill()}
  else if(p.t==='smoke'){ctx.fillStyle=`rgba(40,36,32,${f*.45})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill()}
  else if(p.t==='debris'){ctx.fillStyle='#2a2018';ctx.fillRect(p.x-1.5,p.y-1.5,3,3)}
  else if(p.t==='blood'){ctx.fillStyle=`rgba(150,12,10,${f})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill()}
  else if(p.t==='flash'){const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);g.addColorStop(0,p.c);g.addColorStop(.4,'rgba(255,190,90,.35)');g.addColorStop(1,'rgba(255,200,80,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill()}
  else if(p.t==='txt'){ctx.fillStyle=p.c;ctx.globalAlpha=f;ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText(p.txt,p.x,p.y);ctx.globalAlpha=1}}
function wheels(c,pts,w,h){c.fillStyle='#161210';for(const[x,y]of pts){c.fillRect(x-w/2,y-h/2,w,h)}}
function mrect(c,x,y,w,h,col,r=2){const g=c.createLinearGradient(x,y,x+w*.5,y+h);g.addColorStop(0,shade(col,1.35));g.addColorStop(.55,col);g.addColorStop(1,shade(col,.6));c.fillStyle=g;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();c.strokeStyle='rgba(10,8,6,.7)';c.lineWidth=.9;c.stroke()}
function mcirc(c,x,y,r,col){const g=c.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r);g.addColorStop(0,shade(col,1.45));g.addColorStop(1,shade(col,.55));c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();c.strokeStyle='rgba(10,8,6,.7)';c.lineWidth=.9;c.stroke()}
function track(c,x,y,w,h,a,mv){c.fillStyle='#1a1712';c.beginPath();c.roundRect(x,y,w,h,h/2);c.fill();c.fillStyle='#3a362c';const o=mv?(a*30)%5:0;for(let i=x+o;i<x+w-1;i+=5)c.fillRect(i,y+1,1.6,h-2)}
function drawUnit(u){const c=DC,col=COL[u.side],f=sides[u.side].fac,mv=!!u.path,a=u.anim;c.save();c.translate(u.x,u.y);
  c.scale(1.18,1.18);if(u.s.air){c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(16,24,u.s.r*1.1,u.s.r*.6,0,0,7);c.fill();c.translate(0,-6+Math.sin(a*2)*1.5)}else{const sg=c.createRadialGradient(3,5,1,3,5,u.s.r*1.2);sg.addColorStop(0,'rgba(0,0,0,.42)');sg.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=sg;c.beginPath();c.ellipse(3,5,u.s.r*1.25,u.s.r*.8,0,0,7);c.fill()}
  c.rotate(u.dir);const leg=mv?Math.sin(a*14)*3:0;
  if(f==='bunker'){switch(u.type){
    case'inf':case'rkt':c.strokeStyle='#2c2a20';c.lineWidth=2.4;c.beginPath();c.moveTo(-1,-3);c.lineTo(-1+leg,-5);c.moveTo(-1,3);c.lineTo(-1-leg,5);c.stroke();
      c.fillStyle='#6b6a48';c.beginPath();c.ellipse(0,0,4.5,5.5,0,0,7);c.fill();c.fillStyle=col;c.fillRect(-3,-5,2,10);
      c.rotate(u.tdir-u.dir);if(u.type==='rkt'){c.fillStyle='#3a3a2e';c.fillRect(-4,1,13,3.4);c.fillStyle='#8a2a1a';c.fillRect(8,1,2,3.4)}else{c.strokeStyle='#1b1a16';c.lineWidth=1.8;c.beginPath();c.moveTo(2,2);c.lineTo(10,2);c.stroke()}
      c.fillStyle='#4e5236';c.beginPath();c.arc(0,0,3.4,0,7);c.fill();break;
    case'fast':wheels(c,[[-7,-7],[7,-7],[-7,7],[7,7]],7,4);c.fillStyle='#7a6a44';c.beginPath();c.roundRect(-11,-6,22,12,3);c.fill();c.fillStyle=col;c.fillRect(-11,-6,4,12);c.strokeStyle='#2a2418';c.lineWidth=1.5;c.strokeRect(-4,-5,7,10);
      c.rotate(u.tdir-u.dir);c.fillStyle='#3a3428';c.beginPath();c.arc(0,0,3.5,0,7);c.fill();c.strokeStyle='#1a1610';c.lineWidth=2;c.beginPath();c.moveTo(0,0);c.lineTo(11,0);c.stroke();break;
    case'heavy':c.fillStyle='#1d1a14';c.fillRect(-15,-12,30,6);c.fillRect(-15,6,30,6);c.fillStyle='#3a362a';for(let i=0;i<6;i++){const o=((a*(mv?30:0))+i*5)%30;c.fillRect(-15+o,-12,2,6);c.fillRect(-15+o,6,2,6)}
      c.fillStyle='#5e6040';c.beginPath();c.roundRect(-13,-8,26,16,3);c.fill();c.fillStyle=col;c.fillRect(-13,-8,26,3);c.rotate(u.tdir-u.dir);c.fillStyle='#4a4c32';c.beginPath();c.arc(0,0,7,0,7);c.fill();c.strokeStyle='#2a2a1c';c.lineWidth=1;c.stroke();
      c.fillStyle='#2e2e22';c.fillRect(5,-1.8,15,3.6);c.fillStyle='#1a1a12';c.fillRect(18,-2.4,3,4.8);break;
    case'oil':wheels(c,[[-9,-6],[3,-6],[9,-6],[-9,6],[3,6],[9,6]],5,3);c.fillStyle='#8a8478';c.beginPath();c.roundRect(-12,-5,17,10,5);c.fill();c.fillStyle=u.load?'#2a2420':'#b8b2a4';c.fillRect(-9,-2,11,4);c.fillStyle='#6b5a3a';c.fillRect(6,-5,7,10);c.fillStyle=col;c.fillRect(6,-5,2,10);c.fillStyle='#9ad0ff';c.fillRect(10,-3,2,6);break;
    case'scout':c.fillStyle='#161210';c.beginPath();c.ellipse(-8,0,3.5,2,0,0,7);c.ellipse(8,0,3.5,2,0,0,7);c.fill();mrect(c,-7,-2,14,4,'#6a6a62',2);mrect(c,-3,-3.5,6,7,col,2);
      c.strokeStyle='#1a1a16';c.lineWidth=1.4;c.beginPath();c.moveTo(5,-4);c.lineTo(5,4);c.stroke();mcirc(c,-1,0,3.2,'#4e5236');c.rotate(u.tdir-u.dir);c.strokeStyle='#1b1a16';c.lineWidth=1.6;c.beginPath();c.moveTo(1,2);c.lineTo(8,2);c.stroke();break;
    case'flame':c.strokeStyle='#2c2a20';c.lineWidth=2.4;c.beginPath();c.moveTo(-1,-3);c.lineTo(-1+leg,-5);c.moveTo(-1,3);c.lineTo(-1-leg,5);c.stroke();mcirc(c,-5,0,3.6,'#c8641e');c.fillStyle='#6b6a48';c.beginPath();c.ellipse(0,0,4.5,5.5,0,0,7);c.fill();
      c.rotate(u.tdir-u.dir);c.fillStyle='#2a2a26';c.fillRect(1,1,10,2.6);c.fillStyle=u.tgt?'#ffb03a':'#5a2a10';c.beginPath();c.arc(11,2.3,1.6,0,7);c.fill();mcirc(c,0,0,3.4,'#5a5a40');break;
    case'med':c.strokeStyle='#2c2a20';c.lineWidth=2.4;c.beginPath();c.moveTo(-1,-3);c.lineTo(-1+leg,-5);c.moveTo(-1,3);c.lineTo(-1-leg,5);c.stroke();c.fillStyle='#d8d6cc';c.beginPath();c.ellipse(0,0,4.5,5.5,0,0,7);c.fill();c.strokeStyle='#555';c.lineWidth=.8;c.stroke();
      c.fillStyle='#d0302a';c.fillRect(-2.5,-.8,5,1.6);c.fillRect(-.8,-2.5,1.6,5);mcirc(c,1,0,3,'#e8e6dc');c.fillStyle=col;c.fillRect(-4,-5,2,10);break;
    case'art':track(c,-13,-10,24,5,a,mv);track(c,-13,5,24,5,a,mv);mrect(c,-12,-7,22,14,'#6a6648',3);c.fillStyle=col;c.fillRect(-12,-7,4,14);c.rotate(u.tdir-u.dir);mrect(c,-6,-5,12,10,'#5a5a3e',2);
      const rc=u.cd>u.s.cd-.25?-3:0;mrect(c,4+rc,-1.6,22,3.2,'#3a3a2c',1);c.fillStyle='#1a1a12';c.fillRect(25+rc,-2.2,3,4.4);break;
    case'mbt':track(c,-20,-16,40,8,a,mv);track(c,-20,8,40,8,a,mv);mrect(c,-18,-10,36,20,'#5a5c3e',4);c.fillStyle=col;c.fillRect(-18,-10,36,3);c.fillStyle='rgba(0,0,0,.25)';for(let i=-14;i<16;i+=6)c.fillRect(i,6,3,2);
      c.rotate(u.tdir-u.dir);mcirc(c,-2,0,10,'#4e5034');const rc2=u.cd>u.s.cd-.25?-4:0;mrect(c,6+rc2,-5,20,3.4,'#2e2e22',1);mrect(c,6+rc2,1.6,20,3.4,'#2e2e22',1);mrect(c,-6,-4,6,8,'#3e402a',1);break;
    case'heli':{c.fillStyle='#3a3e34';c.fillRect(-22,-1.4,14,2.8);c.fillRect(-23,-5,3,10);mrect(c,-9,-6,22,12,'#5a6048',6);c.fillStyle='#8ad0ff';c.beginPath();c.ellipse(8,0,4,4,0,0,7);c.fill();c.fillStyle=col;c.fillRect(-6,-6,4,12);
      c.fillStyle='#2a2a26';c.fillRect(-2,-9,3,4);c.fillRect(-2,5,3,4);c.save();c.rotate(a*30);c.fillStyle='rgba(30,30,30,.55)';c.fillRect(-22,-1.5,44,3);c.fillRect(-1.5,-22,3,44);c.restore();c.fillStyle='rgba(60,60,60,.12)';c.beginPath();c.arc(0,0,22,0,7);c.fill();mcirc(c,0,0,2.5,'#222');break}
    case'elite':c.fillStyle='#14161a';c.fillRect(-17,-13,34,7);c.fillRect(-17,6,34,7);c.fillStyle='#4a5a6a';c.beginPath();c.roundRect(-15,-9,30,18,4);c.fill();c.fillStyle=col;c.fillRect(-15,-9,30,3);c.rotate(u.tdir-u.dir);c.fillStyle='#36424e';c.beginPath();c.arc(0,0,8,0,7);c.fill();
      c.fillStyle='#22282e';c.fillRect(4,-5,17,3);c.fillRect(4,2,17,3);c.fillStyle='#7ae8ff';c.globalAlpha=.6+Math.sin(a*6)*.3;c.fillRect(19,-5,3,3);c.fillRect(19,2,3,3);c.globalAlpha=1;break}}
  else{switch(u.type){
    case'inf':case'rkt':c.strokeStyle='#3a2a1a';c.lineWidth=2.8;c.beginPath();c.moveTo(-1,-3.5);c.lineTo(-1+leg,-6);c.moveTo(-1,3.5);c.lineTo(-1-leg,6);c.stroke();
      c.fillStyle='#7a8a5a';c.beginPath();c.ellipse(0,0,5.5,6.5,0,0,7);c.fill();c.fillStyle=col;c.beginPath();c.moveTo(-5,-5);c.lineTo(1,-6);c.lineTo(-2,6);c.lineTo(-5,5);c.fill();
      c.rotate(u.tdir-u.dir);if(u.type==='rkt'){c.fillStyle='#5a4a2a';c.fillRect(-5,1.5,14,4);c.fillStyle='#c84a1a';c.beginPath();c.moveTo(9,1.5);c.lineTo(12,3.5);c.lineTo(9,5.5);c.fill()}else{c.strokeStyle='#2a1e14';c.lineWidth=2.4;c.beginPath();c.moveTo(2,2.5);c.lineTo(10,2.5);c.stroke()}
      c.fillStyle='#8a9a66';c.beginPath();c.arc(0,0,3.8,0,7);c.fill();c.fillStyle='#c83a1a';c.fillRect(-3,-1,6,2);break;
    case'fast':{const l=mv?Math.sin(a*16)*4:0;c.strokeStyle='#5a4428';c.lineWidth=2.4;c.beginPath();c.moveTo(6,-3);c.lineTo(8+l,-8);c.moveTo(6,3);c.lineTo(8-l,8);c.moveTo(-6,-3);c.lineTo(-8-l,-8);c.moveTo(-6,3);c.lineTo(-8+l,8);c.stroke();
      c.fillStyle='#a08048';c.beginPath();c.ellipse(0,0,11,5.5,0,0,7);c.fill();c.fillStyle='#5a4226';for(const[x,y]of[[-4,-2],[2,2],[-1,3],[5,-2]]){c.beginPath();c.arc(x,y,1.3,0,7);c.fill()}
      c.fillStyle='#8a6a3a';c.beginPath();c.ellipse(12,0,5,4,0,0,7);c.fill();c.fillStyle='#f0e0c0';c.fillRect(15,-2,3,1);c.fillRect(15,1,3,1);c.fillStyle='#ff3a1a';c.fillRect(12,-2.5,1.5,1.5);
      c.fillStyle='#7a8a5a';c.beginPath();c.arc(-2,0,3.6,0,7);c.fill();c.fillStyle=col;c.fillRect(-4,-3,2.5,6);break}
    case'heavy':{const l=mv?Math.sin(a*8)*3:0;c.fillStyle='#4a3a28';for(const[x,y,s]of[[8,-11,1],[8,11,-1],[-8,-11,-1],[-8,11,1]])c.fillRect(x-3+l*s,y-3,6,6);
      c.fillStyle='#6a5034';c.beginPath();c.ellipse(0,0,16,12,0,0,7);c.fill();c.strokeStyle='#4a3420';c.lineWidth=1;for(let i=-12;i<12;i+=3){c.beginPath();c.moveTo(i,-10);c.lineTo(i+2,-6);c.stroke()}
      c.fillStyle='#5a4228';c.beginPath();c.ellipse(16,0,7,6,0,0,7);c.fill();c.strokeStyle='#5a4228';c.lineWidth=3.5;c.beginPath();c.moveTo(21,0);c.quadraticCurveTo(28,3+Math.sin(a*3)*2,26,9);c.stroke();
      c.strokeStyle='#f2e6c8';c.lineWidth=2.4;c.beginPath();c.moveTo(19,-4);c.quadraticCurveTo(27,-8,28,-3);c.moveTo(19,4);c.quadraticCurveTo(27,8,28,3);c.stroke();
      c.fillStyle='#3a2a1a';c.fillRect(-8,-7,13,14);c.fillStyle=col;c.fillRect(-8,-7,13,3);c.rotate(u.tdir-u.dir);c.fillStyle='#2a2a26';c.fillRect(-2,-2.5,16,5);c.fillStyle='#4a4a40';c.beginPath();c.arc(-1,0,4,0,7);c.fill();break}
    case'oil':{const l=mv?Math.sin(a*8)*2:0;c.fillStyle='#5a4a3a';c.beginPath();c.ellipse(8,0,7,5,0,0,7);c.fill();c.strokeStyle='#4a3a2a';c.lineWidth=2;c.beginPath();c.moveTo(10,-4);c.lineTo(11+l,-7);c.moveTo(10,4);c.lineTo(11-l,7);c.stroke();
      c.strokeStyle='#e8dcc0';c.lineWidth=1.6;c.beginPath();c.moveTo(13,-3);c.lineTo(16,-6);c.moveTo(13,3);c.lineTo(16,6);c.stroke();c.strokeStyle='#3a2a1a';c.beginPath();c.moveTo(1,0);c.lineTo(-3,0);c.stroke();
      wheels(c,[[-8,-7],[-8,7]],6,3);c.fillStyle=u.load?'#2a2018':'#7a5a36';c.beginPath();c.ellipse(-8,0,6,6,0,0,7);c.fill();c.strokeStyle='#3a2a18';c.lineWidth=1.2;c.stroke();c.fillStyle=col;c.fillRect(-10,-6,4,12);break}
    case'scout':{const l=mv?Math.sin(a*18)*3:0;c.strokeStyle='#4a3a2a';c.lineWidth=2;c.beginPath();c.moveTo(4,-2);c.lineTo(6+l,-6);c.moveTo(4,2);c.lineTo(6-l,6);c.moveTo(-4,-2);c.lineTo(-6-l,-6);c.moveTo(-4,2);c.lineTo(-6+l,6);c.stroke();
      c.fillStyle='#6a5a4a';c.beginPath();c.ellipse(0,0,9,4.5,0,0,7);c.fill();c.fillStyle='#7a6a58';c.beginPath();c.ellipse(9,0,4,3,0,0,7);c.fill();c.fillStyle='#ff3a1a';c.fillRect(11,-1.6,1.2,1.2);c.strokeStyle='#c8a0a0';c.lineWidth=1.2;c.beginPath();c.moveTo(-9,0);c.quadraticCurveTo(-15,-4,-18,1);c.stroke();
      c.fillStyle='#7a8a5a';c.beginPath();c.arc(-1,0,3.2,0,7);c.fill();c.fillStyle=col;c.fillRect(-3,-2.5,2,5);break}
    case'flame':c.strokeStyle='#3a2a1a';c.lineWidth=2.8;c.beginPath();c.moveTo(-1,-3.5);c.lineTo(-1+leg,-6);c.moveTo(-1,3.5);c.lineTo(-1-leg,6);c.stroke();mcirc(c,-5,0,4,'#5a4a2a');c.fillStyle='#ff8a2a';c.beginPath();c.arc(-5,0,1.8,0,7);c.fill();
      c.fillStyle='#7a8a5a';c.beginPath();c.ellipse(0,0,5.5,6.5,0,0,7);c.fill();c.rotate(u.tdir-u.dir);c.strokeStyle='#3a2a18';c.lineWidth=2;c.beginPath();c.moveTo(2,3);c.lineTo(11,3);c.stroke();c.fillStyle='#ffb03a';c.globalAlpha=.6+Math.sin(a*20)*.4;c.beginPath();c.arc(12,3,2,0,7);c.fill();c.globalAlpha=1;
      c.fillStyle='#8a9a66';c.beginPath();c.arc(0,0,3.8,0,7);c.fill();c.fillStyle=col;c.fillRect(-3,-1,6,2);break;
    case'med':c.strokeStyle='#3a2a1a';c.lineWidth=2.8;c.beginPath();c.moveTo(-1,-3.5);c.lineTo(-1+leg,-6);c.moveTo(-1,3.5);c.lineTo(-1-leg,6);c.stroke();c.fillStyle='#8a7a5a';c.beginPath();c.ellipse(0,0,5.5,6.5,0,0,7);c.fill();
      c.strokeStyle='#e8dcc0';c.lineWidth=1.8;c.beginPath();c.moveTo(-2,-8);c.lineTo(5,6);c.stroke();c.fillStyle='#e8dcc0';c.beginPath();c.arc(-2,-8,2.2,0,7);c.fill();c.fillStyle='#5aff6a';c.globalAlpha=.5+Math.sin(a*5)*.3;c.beginPath();c.arc(-2,-8,3.5,0,7);c.fill();c.globalAlpha=1;
      c.fillStyle='#8a9a66';c.beginPath();c.arc(0,0,3.6,0,7);c.fill();c.fillStyle=col;c.fillRect(-3,-1,6,2);break;
    case'art':{const l=mv?Math.sin(a*7)*3:0;c.fillStyle='#4a5a2a';for(const[x,y,s2]of[[7,-9,1],[7,9,-1],[-7,-9,-1],[-7,9,1]])c.fillRect(x-2.5+l*s2,y-2.5,5,5);c.fillStyle='#5a6a34';c.beginPath();c.ellipse(0,0,13,8,0,0,7);c.fill();
      c.strokeStyle='#3a4a1a';c.lineWidth=1;for(let i=-10;i<10;i+=3){c.beginPath();c.moveTo(i,-6);c.lineTo(i+1,-3);c.stroke()}c.fillStyle='#6a7a3a';c.beginPath();c.ellipse(13,0,5,4,0,0,7);c.fill();c.strokeStyle='#5a6a34';c.lineWidth=3;c.beginPath();c.moveTo(-12,0);c.lineTo(-20,Math.sin(a*3)*3);c.stroke();
      c.rotate(u.tdir-u.dir);c.strokeStyle='#5a3a1a';c.lineWidth=3;const sw=u.cd>u.s.cd-.4?-1.2:0;c.save();c.rotate(sw);c.beginPath();c.moveTo(-4,0);c.lineTo(14,0);c.stroke();c.fillStyle='#4a2a10';c.beginPath();c.arc(14,0,3.5,0,7);c.fill();c.restore();c.fillStyle=col;c.fillRect(-3,-3,5,6);break}
    case'mbt':{const l=mv?Math.sin(a*6)*3:0;c.fillStyle='#3a2a1a';for(const[x,y,s2]of[[10,-15,1],[10,15,-1],[-10,-15,-1],[-10,15,1]])c.fillRect(x-4+l*s2,y-4,8,8);c.fillStyle='#5a3e26';c.beginPath();c.ellipse(0,0,21,15,0,0,7);c.fill();
      c.strokeStyle='#3a2414';c.lineWidth=1;for(let i=-16;i<16;i+=3){c.beginPath();c.moveTo(i,-13);c.lineTo(i+2,-8);c.stroke()}c.fillStyle='#2a1a0e';for(let i=-12;i<14;i+=6){c.beginPath();c.moveTo(i,-14);c.lineTo(i+2,-20);c.lineTo(i+4,-14);c.fill()}
      c.fillStyle='#4a3420';c.beginPath();c.ellipse(20,0,9,8,0,0,7);c.fill();c.strokeStyle='#f2e6c8';c.lineWidth=3;c.beginPath();c.moveTo(24,-5);c.quadraticCurveTo(34,-12,36,-3);c.moveTo(24,5);c.quadraticCurveTo(34,12,36,3);c.moveTo(26,0);c.lineTo(32,0);c.stroke();c.fillStyle='#ff2a1a';c.fillRect(22,-4,2,2);c.fillRect(22,2,2,2);c.fillStyle=col;c.fillRect(-10,-6,8,12);break}
    case'heli':{const fl=Math.sin(a*9)*.5;c.fillStyle='#4a3a2a';c.save();c.rotate(fl);c.beginPath();c.moveTo(-2,-3);c.quadraticCurveTo(-6,-20,-14,-26);c.lineTo(-6,-18);c.lineTo(2,-4);c.fill();c.restore();c.save();c.rotate(-fl);c.beginPath();c.moveTo(-2,3);c.quadraticCurveTo(-6,20,-14,26);c.lineTo(-6,18);c.lineTo(2,4);c.fill();c.restore();
      c.fillStyle='#5a4632';c.beginPath();c.ellipse(0,0,11,5,0,0,7);c.fill();c.fillStyle='#3a2a1a';c.beginPath();c.moveTo(-10,-3);c.lineTo(-17,0);c.lineTo(-10,3);c.fill();c.fillStyle='#c89a8a';c.beginPath();c.ellipse(11,0,3.6,2.6,0,0,7);c.fill();c.fillStyle='#e8c84a';c.beginPath();c.moveTo(14,-1);c.lineTo(18,0);c.lineTo(14,1);c.fill();c.fillStyle=col;c.fillRect(-4,-2,4,4);break}
    case'elite':{c.strokeStyle='#2a1a0e';c.lineWidth=2.4;for(let i=-1;i<=1;i++){const l=mv?Math.sin(a*14+i)*3:0;c.beginPath();c.moveTo(i*5,-5);c.lineTo(i*5+l,-14);c.moveTo(i*5,5);c.lineTo(i*5-l,14);c.stroke()}
      c.fillStyle='#3a2410';for(let i=0;i<4;i++){c.beginPath();c.ellipse(-4-i*6,0,6-i,5-i,0,0,7);c.fill()}c.fillStyle='#5a3418';c.beginPath();c.ellipse(5,0,10,8,0,0,7);c.fill();
      c.strokeStyle='#5a3418';c.lineWidth=3;c.beginPath();c.moveTo(12,-5);c.quadraticCurveTo(20,-12,24,-6);c.moveTo(12,5);c.quadraticCurveTo(20,12,24,6);c.stroke();
      c.strokeStyle='#4a2c12';c.lineWidth=3.5;c.beginPath();c.moveTo(-24,0);c.quadraticCurveTo(-30,-14+Math.sin(a*4)*3,-14,-14);c.stroke();c.fillStyle='#c8e83a';c.beginPath();c.arc(-14,-14,2.5,0,7);c.fill();c.fillStyle=col;c.fillRect(-2,-3,6,6);break}}}
  // Glanzlicht von oben links
  c.restore();c.save();c.translate(u.x,u.y);c.scale(1.18,1.18);const hl=c.createRadialGradient(-u.s.r*.4,-u.s.r*.5,0,0,0,u.s.r*1.1);hl.addColorStop(0,'rgba(255,240,200,.22)');hl.addColorStop(.5,'rgba(255,240,200,0)');c.fillStyle=hl;c.beginPath();c.arc(0,0,u.s.r*1.05,0,7);c.fill();
  c.restore()}
function drawBld(b){const c=DC,col=b.side>=0?COL[b.side]:'#888',x0=b.tx*T,y0=b.ty*T,w=b.w*T,h=b.h*T,f=b.side>=0?sides[b.side].fac:'neutral',a=b.anim;
  let sc=1;if(b.born!=null&&time-b.born<.45){sc=.6+(time-b.born)/.45*.4}c.save();c.translate(x0+w/2,y0+h/2);c.scale(sc,sc);c.translate(-w/2,-h/2);
  {const sg=c.createLinearGradient(0,0,14,14);c.fillStyle='rgba(0,0,0,.32)';c.beginPath();c.moveTo(4,h);c.lineTo(w,h);c.lineTo(w+10,h+9);c.lineTo(14,h+9);c.closePath();c.fill();c.beginPath();c.moveTo(w,6);c.lineTo(w+10,15);c.lineTo(w+10,h+9);c.lineTo(w,h);c.closePath();c.fill()}
  const mut=f==='mutant',wall=mut?'#6a4a2e':'#77756a',wall2=mut?'#4a3420':'#5a5850',roof=mut?'#5a3a22':'#8a887c';
  const plate=(x,y,ww,hh,c1)=>{const cc=c1||wall,dep=Math.max(3,Math.min(9,hh*.28));
    c.fillStyle=shade(cc,.5);c.fillRect(x,y+hh-dep,ww,dep);c.fillStyle='rgba(0,0,0,.25)';for(let i=x+5;i<x+ww-3;i+=9)c.fillRect(i,y+hh-dep+2,2,dep-3);
    const g=c.createLinearGradient(x,y,x+ww*.6,y+hh);g.addColorStop(0,shade(cc,1.28));g.addColorStop(1,shade(cc,.82));c.fillStyle=g;c.fillRect(x,y,ww,hh-dep);
    c.fillStyle='rgba(255,245,215,.28)';c.fillRect(x,y,ww,1.5);c.fillRect(x,y,1.5,hh-dep);
    c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=1;c.strokeRect(x+.5,y+.5,ww-1,hh-1);
    if(!mut){c.fillStyle='rgba(30,28,24,.55)';for(let i=x+4;i<x+ww-2;i+=8){c.fillRect(i,y+3,1.6,1.6);c.fillRect(i,y+hh-dep-4,1.6,1.6)}}
    if(mut){c.strokeStyle='rgba(30,18,10,.5)';for(let i=x+4;i<x+ww;i+=7){c.beginPath();c.moveTo(i,y+1);c.lineTo(i-2,y+hh-1);c.stroke()}c.fillStyle='rgba(140,70,30,.35)';c.fillRect(x+ww*.6,y+hh*.2,ww*.2,hh*.3)}
    else{c.fillStyle='rgba(120,60,30,.3)';c.fillRect(x+3,y+hh-dep-5,ww*.4,4)}};
  const spikes=(x,y,ww)=>{if(!mut)return;c.fillStyle='#2a1a10';for(let i=x+3;i<x+ww-2;i+=7){c.beginPath();c.moveTo(i,y);c.lineTo(i+2.5,y-7);c.lineTo(i+5,y);c.fill()}};
  const skull=(x,y)=>{c.fillStyle='#e8dcc0';c.beginPath();c.arc(x,y,4,0,7);c.fill();c.fillRect(x-2.5,y+2,5,3);c.fillStyle='#1a1008';c.fillRect(x-2.6,y-1.4,2,2);c.fillRect(x+.6,y-1.4,2,2)};
  const flag=(x,y)=>{c.strokeStyle='#2a2420';c.lineWidth=1.5;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-20);c.stroke();c.fillStyle=col;const wv=Math.sin(a*4)*2;c.beginPath();c.moveTo(x,y-20);c.lineTo(x+12,y-17+wv);c.lineTo(x,y-13);c.fill()};
  switch(b.type){
    case'hq':plate(4,10,w-8,h-14);plate(w*.25,2,w*.5,h*.45,roof);spikes(4,10,w-8);
      if(mut){skull(w*.5,h*.62);c.fillStyle='#3a2414';c.beginPath();c.moveTo(w*.38,h-4);c.lineTo(w*.38,h*.72);c.lineTo(w*.62,h*.72);c.lineTo(w*.62,h-4);c.fill()}
      else{c.fillStyle='#4a4840';c.beginPath();c.arc(w*.5,h*.3,13,Math.PI,0);c.fill();c.fillStyle='#2a2a26';c.fillRect(w*.38,h-16,w*.24,12);c.fillStyle='#ffd24a';for(let i=0;i<3;i++)c.fillRect(w*.42+i*7,h-14,4,2)}
      c.strokeStyle='#2a2420';c.lineWidth=2;c.beginPath();c.moveTo(w-14,10);c.lineTo(w-14,-14);c.stroke();c.fillStyle=Math.sin(a*5)>0?'#ff3a2a':'#5a1a14';c.beginPath();c.arc(w-14,-14,2.5,0,7);c.fill();
      if(b.side>=0&&sides[b.side].lvl>1){c.save();c.translate(18,16);c.rotate(a*1.5);c.strokeStyle='#ddd';c.lineWidth=2;c.beginPath();c.arc(0,0,8,-1,1);c.stroke();c.restore()}flag(12,12);break;
    case'ref':plate(2,h*.45,w-4,h*.5);for(const[x,y,r]of[[w*.25,h*.32,15],[w*.62,h*.3,17]]){const tg=c.createRadialGradient(x-r*.4,y-r*.45,r*.1,x,y,r);tg.addColorStop(0,mut?'#8a6a48':'#d8d4c8');tg.addColorStop(1,mut?'#3a2818':'#5e5a50');c.fillStyle=tg;c.beginPath();c.arc(x,y,r,0,7);c.fill();c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=1.5;c.stroke();c.fillStyle='rgba(255,255,255,.18)';c.beginPath();c.arc(x-4,y-5,r*.45,0,7);c.fill();c.fillStyle=col;c.fillRect(x-r*.6,y-2,r*1.2,4)}
      c.fillStyle='#3a3630';c.fillRect(12,-2,8,14);c.strokeStyle='#4a4038';c.lineWidth=4;c.beginPath();c.moveTo(w*.35,h*.55);c.lineTo(w*.5,h*.55);c.stroke();spikes(2,h*.45,w-4);if(mut)skull(w*.85,h*.7);break;
    case'der':{c.fillStyle='#1a1410';c.fillRect(3,3,w-6,h-6);c.strokeStyle=mut?'#5a3a20':'#6a6a60';c.lineWidth=3;c.beginPath();c.moveTo(10,h-6);c.lineTo(w*.45,8);c.lineTo(w-10,h-6);c.stroke();
      const ang=Math.sin(a*2.2)*.35;c.save();c.translate(w*.45,10);c.rotate(ang);c.fillStyle=mut?'#7a4a24':'#c8a030';c.fillRect(-20,-3,40,6);c.fillStyle=mut?'#4a2a14':'#3a3a34';c.beginPath();c.moveTo(18,-6);c.lineTo(26,-3);c.lineTo(26,6);c.lineTo(18,7);c.fill();c.restore();
      c.fillStyle='#2a2a26';c.fillRect(w*.45-24,10+Math.sin(ang)*-20,3,h-26);c.fillStyle=col;c.fillRect(4,h-10,10,6);if(b.oil<=0){c.fillStyle='rgba(0,0,0,.4)';c.fillRect(0,0,w,h)}break}
    case'bar':plate(4,8,w-8,h-12);c.fillStyle=mut?'#3a2414':'#4a4a3e';c.fillRect(w*.35,h-16,w*.3,12);if(mut){spikes(4,8,w-8);skull(w*.22,h*.45);skull(w*.78,h*.45)}else{c.fillStyle='#a08a5a';for(let i=0;i<5;i++){c.beginPath();c.ellipse(8+i*11,h-3,6,3.5,0,0,7);c.fill()}}flag(w-10,10);break;
    case'fac':plate(2,6,w-4,h-8);c.fillStyle=mut?'#2a1a0e':'#3a3a34';c.fillRect(w*.2,h*.45,w*.6,h*.5);c.strokeStyle=mut?'#5a3a20':'#e6c32a';c.lineWidth=3;for(let i=0;i<5;i++){c.beginPath();c.moveTo(w*.2+i*w*.12,h*.45);c.lineTo(w*.2+i*w*.12+8,h*.95);c.stroke()}
      c.strokeStyle='#3a3630';c.lineWidth=3;c.beginPath();c.moveTo(10,6);c.lineTo(10,-16);c.lineTo(w*.6,-16);c.stroke();c.strokeStyle='#2a2620';c.lineWidth=1;c.beginPath();c.moveTo(w*.5+Math.sin(a)*10,-16);c.lineTo(w*.5+Math.sin(a)*10,0);c.stroke();spikes(2,6,w-4);if(mut){skull(w*.88,h*.25);c.strokeStyle='#e8dcc0';c.lineWidth=2;c.beginPath();c.moveTo(w*.1,h*.3);c.lineTo(w*.18,h*.15);c.stroke()}c.fillStyle=col;c.fillRect(2,6,w-4,4);break;
    case'tow':c.fillStyle=wall2;c.fillRect(2,4,w-4,h-4);c.fillStyle=wall;c.fillRect(4,6,w-8,h-8);c.save();c.translate(w/2,h/2);c.rotate(b.tdir);c.fillStyle=mut?'#4a3018':'#3e3e36';c.beginPath();c.arc(0,0,8,0,7);c.fill();c.fillStyle='#1a1a16';c.fillRect(4,-3,14,2);c.fillRect(4,1,14,2);c.restore();c.fillStyle=col;c.fillRect(2,h-4,w-4,3);if(mut)spikes(2,4,w-4);break;
    case'pow':plate(2,10,w-4,h-12);if(mut){mcirc(c,w*.5,h*.42,14,'#5a5a2a');c.fillStyle='#9aff3a';c.globalAlpha=.4+Math.sin(a*4)*.25;c.beginPath();c.arc(w*.5,h*.42,8,0,7);c.fill();c.globalAlpha=1;skull(w*.8,h*.75);spikes(2,10,w-4)}
      else{for(const x of[w*.3,w*.7]){mrect(c,x-7,-2,14,h*.55,'#8a887c',3);c.fillStyle='#3a3a34';c.fillRect(x-7,4,14,3)}c.fillStyle=Math.sin(a*6)>0?'#ffe24a':'#6a5a1a';c.beginPath();c.arc(w*.5,h*.72,3,0,7);c.fill();c.strokeStyle='#e6c32a';c.lineWidth=2;c.beginPath();c.moveTo(w*.42,h*.66);c.lineTo(w*.52,h*.72);c.lineTo(w*.46,h*.78);c.lineTo(w*.58,h*.84);c.stroke()}break;
    case'wall':{const wm=typeof wallMap!=='undefined'&&wallMap&&b.tx!=null,me=b.side+1,N=wm&&b.ty>0&&wallMap[(b.ty-1)*MW+b.tx]===me,S2=wm&&wallMap[(b.ty+1)*MW+b.tx]===me,W=wm&&b.tx>0&&wallMap[b.ty*MW+b.tx-1]===me,E=wm&&wallMap[b.ty*MW+b.tx+1]===me;
      const wc=mut?'#5a4a3a':'#8a887e';mrect(c,6,6,w-12,h-12,wc,2);if(N)mrect(c,8,-2,w-16,12,wc,0);if(S2)mrect(c,8,h-10,w-16,12,wc,0);if(W)mrect(c,-2,8,12,h-16,wc,0);if(E)mrect(c,w-10,8,12,h-16,wc,0);
      if(mut){c.fillStyle='#2a1a10';c.beginPath();c.moveTo(w/2-3,8);c.lineTo(w/2,1);c.lineTo(w/2+3,8);c.fill();c.fillStyle='rgba(150,70,30,.5)';c.fillRect(9,h/2,6,4)}else{c.fillStyle='rgba(0,0,0,.25)';c.fillRect(8,h/2-1,w-16,1.5);c.fillStyle=col;c.fillRect(w/2-2,h/2-2,4,4)}break}
    case'sil':for(const[x,y]of[[w*.3,h*.35],[w*.7,h*.35],[w*.5,h*.72]]){if(mut){c.fillStyle='#120c08';c.beginPath();c.ellipse(x,y,11,9,0,0,7);c.fill();c.strokeStyle='#5a3a20';c.lineWidth=2;c.stroke();c.strokeStyle='rgba(120,90,200,.4)';c.beginPath();c.ellipse(x-2,y-2,5,3,0,3.5,5.5);c.stroke()}else{mcirc(c,x,y,11,'#a8a498');c.fillStyle=col;c.fillRect(x-7,y-1.5,14,3)}}break;
    case'scr':plate(2,h*.35,w-4,h*.6);c.save();c.translate(w*.5,h*.3);c.rotate(a*1.5);c.fillStyle=mut?'#5a3a20':'#4a4a44';for(let i=0;i<6;i++){c.rotate(Math.PI/3);c.fillRect(-2,-13,4,6)}mcirc(c,0,0,9,mut?'#6a4a2a':'#6a6a62');c.restore();c.fillStyle='#3a2a1a';c.fillRect(w*.1,h*.75,w*.3,h*.15);c.fillStyle='rgba(150,80,40,.6)';for(let i=0;i<4;i++)c.fillRect(w*.12+i*4,h*.77,3,3);if(mut)spikes(2,h*.35,w-4);c.fillStyle=col;c.fillRect(w-12,h-8,8,4);break;
    case'rep':plate(2,6,w-4,h-8);c.fillStyle=mut?'#2a1a0e':'#2e2e2a';c.fillRect(w*.2,h*.45,w*.6,h*.45);c.save();c.translate(w*.5,h*.3);c.rotate(Math.sin(a*2)*.6);c.strokeStyle=mut?'#e8dcc0':'#c8c4b8';c.lineWidth=3;c.beginPath();c.moveTo(-8,0);c.lineTo(8,0);c.stroke();c.beginPath();c.arc(8,0,3,1,5.3);c.stroke();c.restore();
      if(rnd()<.3){c.fillStyle='#ffe28a';c.fillRect(w*.3+rnd()*w*.4,h*.55+rnd()*h*.3,2,2)}c.fillStyle=col;c.fillRect(2,6,w-4,3);if(mut)spikes(2,6,w-4);break;
    case'ctow':plate(1,4,w-2,h-5,mut?'#5a4a3a':'#6a6a62');c.save();c.translate(w/2,h/2);c.rotate(b.tdir);if(mut){c.strokeStyle='#4a2a10';c.lineWidth=4;c.beginPath();c.moveTo(-6,0);c.lineTo(14,0);c.stroke();c.fillStyle='#6a6a62';c.beginPath();c.arc(14,0,5,0,7);c.fill();mcirc(c,-4,0,7,'#5a3a20')}else{mcirc(c,0,0,11,'#4a4c38');const rc=b.cd>B.ctow.cd-.25?-4:0;mrect(c,6+rc,-2.5,20,5,'#2e2e22',1);c.fillStyle='#1a1a12';c.fillRect(24+rc,-3,3,6)}c.restore();c.fillStyle=col;c.fillRect(1,h-4,w-2,3);if(mut)spikes(1,4,w-2);break;
    case'rtow':c.fillStyle=wall2;c.fillRect(2,4,w-4,h-4);c.save();c.translate(w/2,h/2);c.rotate(b.tdir);mrect(c,-7,-8,12,16,mut?'#5a4a2a':'#5a5e4a',2);c.fillStyle='#2a2a26';for(let i=0;i<2;i++)for(let j=0;j<2;j++){c.beginPath();c.arc(1+i*4,-4+j*8,2,0,7);c.fill()}c.fillStyle='#c84a1a';c.fillRect(7,-6,3,2);c.fillRect(7,4,3,2);c.restore();c.fillStyle=col;c.fillRect(2,h-4,w-4,3);if(mut)spikes(2,4,w-4);break;
    case'rad':plate(4,h*.45,w-8,h*.5);c.strokeStyle=mut?'#5a3a20':'#6a6a60';c.lineWidth=2;c.beginPath();c.moveTo(w*.5,h*.55);c.lineTo(w*.5,h*.3);c.stroke();c.save();c.translate(w*.5,h*.3);c.rotate(a*(sides[b.side]&&sides[b.side].pw&&sides[b.side].pw.low?.3:2));
      if(mut){c.fillStyle='#4a3a2a';c.fillRect(-2,-2,4,4);c.strokeStyle='#e8dcc0';c.lineWidth=2;c.beginPath();c.arc(0,0,12,-.6,.6);c.stroke();skull(10,0)}else{c.fillStyle='#c8c4b8';c.beginPath();c.ellipse(0,0,4,15,0,0,7);c.fill();c.strokeStyle='#4a4a44';c.lineWidth=1;c.stroke();c.fillStyle='#ff3a2a';c.fillRect(3,-1,3,2)}c.restore();c.fillStyle=col;c.fillRect(4,h-6,10,4);break;
    case'air':c.fillStyle=mut?'#3a2a1a':'#3a3a36';c.fillRect(2,2,w-4,h-4);if(mut){c.strokeStyle='#6a4a2a';c.lineWidth=3;for(let i=0;i<8;i++){c.beginPath();c.moveTo(w/2,h/2);c.lineTo(w/2+Math.cos(i)*w*.45,h/2+Math.sin(i)*h*.45);c.stroke()}c.fillStyle='#e8dcc0';for(let i=0;i<3;i++){c.beginPath();c.ellipse(w*.4+i*7,h*.5,3,4,0,0,7);c.fill()}spikes(2,4,w-4)}
      else{c.strokeStyle='#e6c32a';c.lineWidth=2;c.beginPath();c.arc(w/2,h/2,w*.32,0,7);c.stroke();c.fillStyle='#e6c32a';c.font='bold 22px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('H',w/2,h/2+1);c.textBaseline='alphabetic';for(let i=0;i<4;i++){c.fillStyle=Math.sin(a*4+i)>0?'#5aff5a':'#1a4a1a';c.fillRect(i<2?4:w-8,i%2?h-8:4,4,4)}}c.fillStyle=col;c.fillRect(2,h-5,w-4,3);break;
    case'lab':plate(2,8,w-4,h-10);if(mut){c.fillStyle='#2a3a10';c.beginPath();c.ellipse(w*.5,h*.45,w*.32,h*.25,0,0,7);c.fill();for(let i=0;i<5;i++){c.fillStyle='rgba(150,255,60,.5)';c.beginPath();c.arc(w*.35+((a*20+i*13)%30),h*.45+Math.sin(a*3+i)*6,2+i%2,0,7);c.fill()}skull(w*.2,h*.25);skull(w*.8,h*.25);spikes(2,8,w-4)}
      else{c.fillStyle='rgba(120,200,255,.35)';c.beginPath();c.arc(w*.5,h*.4,w*.28,Math.PI,0);c.fill();c.strokeStyle='#c8c4b8';c.lineWidth=1.5;c.stroke();for(let i=0;i<3;i++){c.fillStyle=Math.sin(a*3+i*2)>0?'#7ae8ff':'#2a5a6a';c.fillRect(w*.3+i*w*.15,h*.65,6,4)}}c.fillStyle=col;c.fillRect(2,8,w-4,3);break;
    case'sup':{plate(2,4,w-4,h-6,mut?'#4a3a28':'#6a6a62');const ch=(b.charge||0)/B.sup.charge;if(mut){c.fillStyle='#1a2a08';c.beginPath();c.arc(w/2,h/2,w*.3,0,7);c.fill();c.fillStyle=`rgba(150,255,50,${.3+ch*.6})`;c.beginPath();c.arc(w/2,h/2,w*.26*ch+3,0,7);c.fill();if(b.id)for(let i=0;i<3;i++)if(rnd()<.2)parts.push({x:b.x+(rnd()-.5)*20,y:b.y-10,vx:0,vy:-12,l:1.5,m:1.5,t:'gas',r:4});skull(w*.5,h*.85)}
      else{const op=ch>=1?1:0;c.fillStyle='#2a2a26';c.fillRect(w*.25,h*.2,w*.5,h*.6);c.fillStyle='#4a4a44';c.fillRect(w*.25-op*10,h*.2,w*.25,h*.6);c.fillRect(w*.5+op*10,h*.2,w*.25,h*.6);c.strokeStyle='#e6c32a';c.lineWidth=2;c.strokeRect(w*.25,h*.2,w*.5,h*.6);if(op){c.fillStyle='#ddd';c.beginPath();c.arc(w/2,h/2,5,0,7);c.fill();c.fillStyle='#c0302a';c.beginPath();c.arc(w/2,h/2,2.5,0,7);c.fill()}}
      c.fillStyle='#000a';c.fillRect(4,h-8,w-8,4);c.fillStyle=ch>=1?(Math.sin(a*8)>0?'#ff3a2a':'#ffcf5a'):'#ffcf5a';c.fillRect(4,h-8,(w-8)*ch,4);c.fillStyle=col;c.fillRect(2,4,w-4,3);break}
    case'tech':c.fillStyle='#4a4e52';c.fillRect(2,6,w-4,h-8);c.fillStyle='#2e3236';c.fillRect(8,12,w-16,h-20);c.fillStyle=b.opened?'#1a1a1a':'#e6c32a';for(let i=0;i<4;i++){c.save();c.translate(w/2,h/2+2);c.rotate(i*Math.PI/2+.4);c.fillRect(-2,-14,4,8);c.restore()}
      c.fillStyle=b.opened?'#333':(Math.sin(a*4)>0?'#7ae8ff':'#2a6a7a');c.beginPath();c.arc(w/2,h/2+2,4,0,7);c.fill();c.fillStyle='#ddd';c.font='bold 8px sans-serif';c.textAlign='center';c.fillText(b.opened?'LEER':'☢',w/2,10);break}
  if(b.lvl>1){for(let i=0;i<b.lvl-1;i++){c.fillStyle='#1a1208';c.beginPath();c.moveTo(4+i*11,h-3);c.lineTo(9+i*11,h-10);c.lineTo(14+i*11,h-3);c.lineTo(14+i*11,h-6);c.lineTo(9+i*11,h-13);c.lineTo(4+i*11,h-6);c.fill();
    c.fillStyle='#ffcf5a';c.beginPath();c.moveTo(5+i*11,h-4);c.lineTo(9+i*11,h-9);c.lineTo(13+i*11,h-4);c.lineTo(13+i*11,h-6);c.lineTo(9+i*11,h-11);c.lineTo(5+i*11,h-6);c.fill()}}
  if(b.up){c.strokeStyle='#ffcf5a';c.lineWidth=2;c.setLineDash([4,4]);c.lineDashOffset=-a*20;c.strokeRect(2,2,w-4,h-4);c.setLineDash([])}
  c.restore()}
function drawMini(){const W=mini.width,s=W/MW;mctx.imageSmoothingEnabled=false;mctx.drawImage(miniBase,0,0,W,W);
  const radar=own(0,'rad').length&&!(sides[0].pw&&sides[0].pw.low);for(const e of ents){if(e.dead)continue;if(e.side===1&&!isVisTo(0,e)&&!(radar&&e.k==='u'))continue;mctx.fillStyle=e.side<0?(e.opened?'#666':'#7ae8ff'):COL[e.side];
    if(e.k==='b')mctx.fillRect(e.tx*s,e.ty*s,e.w*s,e.h*s);else mctx.fillRect(e.x/T*s-1,e.y/T*s-1,2.5,2.5)}
  if(!cfg.reveal){mctx.fillStyle='rgba(0,0,0,1)';for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=y*MW+x;if(!expl[i]){mctx.globalAlpha=1;mctx.fillRect(x*s,y*s,s+.5,s+.5)}else if(!vis[i]){mctx.globalAlpha=.4;mctx.fillRect(x*s,y*s,s+.5,s+.5)}}mctx.globalAlpha=1}
  const al=sides[0].alarm;if(al&&time-al.t<5&&Math.sin(time*10)>0){mctx.strokeStyle='#ff3a2a';mctx.lineWidth=2;mctx.beginPath();mctx.arc(al.x/T*s,al.y/T*s,8,0,7);mctx.stroke()}
  mctx.strokeStyle='#fff';mctx.lineWidth=1;mctx.strokeRect(camX/T*s,camY/T*s,viewW()/T*s,viewH()/T*s)}
function computeVis(){vis.fill(0);for(const e of ents){if(e.dead||e.side!==0)continue;const r=(e.k==='b'?B[e.type].sight:e.s.sight)+(e.k==='b'?Math.max(e.w,e.h)/2:0);const cx=e.x/T,cy=e.y/T,r2=r*r;
  for(let y=Math.max(0,(cy-r)|0);y<=Math.min(MH-1,(cy+r)|0);y++)for(let x=Math.max(0,(cx-r)|0);x<=Math.min(MW-1,(cx+r)|0);x++){const dx=x+.5-cx,dy=y+.5-cy;if(dx*dx+dy*dy<=r2){vis[y*MW+x]=1;expl[y*MW+x]=1}}}updFog()}
