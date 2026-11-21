"use strict";
/* ======================= Lucky Brawlers – Figuren und Waffen ======================= */
const cv=$('cv'),cx=cv.getContext('2d');
let VW=0,VH=0,DPR=1,SC=1,camX=0,camY=0,PT=[],FT=[],AC=null,soundOn=true,STICKS=[],aimPrev=null,heroTmp=null;
const OL='#1b1730',TAU=Math.PI*2;
function shadeC(hex,f){const n=parseInt(hex.slice(1),16);return'rgb('+[n>>16,n>>8&255,n&255].map(v=>clamp(v*f,0,255)|0).join(',')+')'}
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);VW=window.innerWidth;VH=window.innerHeight;cv.width=VW*DPR;cv.height=VH*DPR;SC=Math.max(.55,Math.min(VW,VH)/(11*TS))*(VW>VH?1.1:1)}

/* ---------- Zeichenhelfer: alles mit dunkler Kontur und weichem Licht ---------- */
function fs(c,fill,lw){c.fillStyle=fill;c.fill();if(lw!==0){c.lineWidth=lw||2;c.strokeStyle=OL;c.stroke()}}
function rr(c,x,y,w,h,r,fill,lw){c.beginPath();c.roundRect(x,y,w,h,r);fs(c,fill,lw)}
function el(c,x,y,rx,ry,fill,lw,rot){c.beginPath();c.ellipse(x,y,rx,ry,rot||0,0,TAU);fs(c,fill,lw)}
function poly(c,p,fill,lw){c.beginPath();for(let i=0;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.closePath();fs(c,fill,lw)}
function star(c,x,y,r1,r2,n,rot,fill,lw){c.beginPath();for(let i=0;i<n*2;i++){const r=i%2?r2:r1,a=rot+i*Math.PI/n;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}c.closePath();fs(c,fill,lw)}
function lit(c,x,y,r,col){const g=c.createRadialGradient(x-r*.35,y-r*.45,r*.12,x,y,r*1.08);g.addColorStop(0,shadeC(col,1.32));g.addColorStop(.65,col);g.addColorStop(1,shadeC(col,.7));return g}
function glow(c,x,y,r,rgb,al){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rgb},${al})`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}

const HV={luke:{skin:'#ffd2a6',body:'#2f6fe8',foot:'#27324f'},rex:{skin:'#ff9a2e',body:'#e8791a',foot:'#5a5f6e'},nina:{skin:'#f6cdb0',body:'#7a35c9',foot:'#2c1d4a'},
  zappa:{skin:'#ffd9b8',body:'#14a7b0',foot:'#5b3a8a'},bert:{skin:'#f2bd95',body:'#c93030',foot:'#4a2c1a'},flora:{skin:'#ffe0c4',body:'#f4f7fb',foot:'#2f9a44'}};

/* ---------- Gesicht ---------- */
function face(c,dir,a,o,noMouth){const lx=Math.cos(a)*1.6,ly=Math.sin(a)*1.1,sh=o.rec>.15,ex=dir*2.2;
  c.fillStyle='rgba(255,90,110,.28)';for(const s of[-1,1]){c.beginPath();c.ellipse(ex+s*8.6,5.2,2.6,1.7,0,0,TAU);c.fill()}
  for(const s of[-1,1]){const px=ex+s*5;c.beginPath();c.ellipse(px,1,3.5,4.4,0,0,TAU);c.fillStyle='#fff';c.fill();c.lineWidth=1.3;c.strokeStyle=OL;c.stroke();
    c.fillStyle=OL;c.beginPath();c.arc(px+lx,1.4+ly,2.2,0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(px+lx-.8,.5+ly,.8,0,TAU);c.fill();
    c.lineWidth=1.9;c.beginPath();c.moveTo(px+s*3.6,-5.6);c.lineTo(px-s*2.6,sh?-3.4:-6.3);c.stroke()}
  if(noMouth)return;
  if(sh){c.beginPath();c.ellipse(ex,7.4,2.7,2.3,0,0,TAU);c.fillStyle='#5a1a2a';c.fill();c.lineWidth=1.3;c.stroke();c.fillStyle='#ff7a8a';c.beginPath();c.ellipse(ex,8.4,1.6,1,0,0,TAU);c.fill()}
  else{c.lineWidth=1.7;c.beginPath();c.arc(ex,5.4,3.3,.16*Math.PI,.84*Math.PI);c.stroke()}}

/* ---------- Kopf je Held ---------- */
function head(c,k,dir,a,t,o){const v=HV[k];
  if(k==='luke'){el(c,-dir*9,-2,5,7,'#6b3f1e');el(c,-dir*11,2,2.6,3.2,v.skin,1.6);el(c,0,0,12,12,lit(c,0,0,12,v.skin));face(c,dir,a,o);
    c.beginPath();c.arc(0,-1.5,12.6,Math.PI*1.04,Math.PI*1.96);c.closePath();fs(c,lit(c,0,-8,12,'#2456d6'));el(c,dir*8.5,-4.6,7.5,2.7,'#1b3fa6',2,dir*.12);
    c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.ellipse(-dir*3,-10,5,2,-.3*dir,0,TAU);c.fill();star(c,dir*1.5,-9,4.2,1.9,5,-Math.PI/2,'#ffd23f',1.2)}
  else if(k==='rex'){c.lineWidth=2;c.strokeStyle=OL;c.beginPath();c.moveTo(-dir*5,-10);c.lineTo(-dir*7,-19);c.stroke();el(c,-dir*7,-20,2.6,2.6,Math.sin(t*8)>0?'#ff3a3a':'#8a1a1a',1.5);
    for(const s of[-1,1])el(c,s*12.5,1,2.6,4,'#8b93a3',1.6);rr(c,-12,-11,24,21,6.5,lit(c,0,-1,13,v.skin));
    c.fillStyle='rgba(255,255,255,.3)';c.beginPath();c.roundRect(-8,-9,10,3,1.5);c.fill();rr(c,-9.5,-4.5,19,9,3.5,'#10202e',1.8);
    const lx=Math.cos(a)*1.8+dir*1.2,ly=Math.sin(a)*1.1,hot=o.rec>.15;c.fillStyle=hot?'#ff5a3a':'#5af0ff';for(const s of[-1,1]){c.beginPath();c.roundRect(s*4.2+lx-2.4,(hot?-.6:-2)+ly,4.8,hot?2.4:4.4,1.4);c.fill()}
    c.lineWidth=1.3;for(const gx of[-4,0,4]){c.beginPath();c.moveTo(gx+dir,6);c.lineTo(gx+dir,8.8);c.stroke()}}
  else if(k==='nina'){for(const i of[0,1]){const w=Math.sin(t*9+i*1.4)*2.4;poly(c,[-dir*10,-4+i*2,-dir*(21+i*2),-7+i*5+w,-dir*(19+i),-1+i*5+w],'#e8334a',1.5)}
    el(c,0,0,12,12,lit(c,0,0,12,'#4a2a7a'));rr(c,-9.5+dir,-4.6,19,9.6,4.8,v.skin,1.6);
    c.save();c.beginPath();c.roundRect(-9.5+dir,-4.6,19,9.6,4.8);c.clip();c.translate(0,-.6);face(c,dir,a,{rec:1},true);c.restore();
    rr(c,-12.4,-8.6,24.8,3.6,1.6,'#e8334a',1.5);el(c,-dir*11,-6.8,2.4,2.4,'#b81f36',1.4)}
  else if(k==='zappa'){for(const s of[-1,1])el(c,s*9.5,5,4.6,8.5,'#0b7d86',2,s*.2);el(c,0,0,12,12,lit(c,0,0,12,v.skin));face(c,dir,a,o);
    const w=Math.sin(t*4)*1.5;poly(c,[-10.5,-7,-3.5,-25,-dir*(8+w),-31,2.5,-23,10.5,-7],lit(c,0,-14,16,'#0e8f96'));el(c,0,-7,16,4.4,'#0b7d86');
    c.fillStyle='#ffd23f';c.beginPath();c.moveTo(-9,-9.6);c.lineTo(9,-9.6);c.lineTo(8,-12.6);c.lineTo(-8,-12.6);c.closePath();c.fill();star(c,-dir*1.5,-18,3.2,1.4,5,-Math.PI/2+t,'#ffe95a',1)}
  else if(k==='bert'){el(c,0,0,12,12,lit(c,0,0,12,v.skin));
    poly(c,[-11,2,-12,8,-8.5,11,-6,15,-2.5,12.5,0,17,2.5,12.5,6,15,8.5,11,12,8,11,2,6,4.4,0,3,-6,4.4],lit(c,0,8,12,'#e2641c'));
    for(const s of[-1,1])el(c,dir*2+s*5,1.2,4.9,4.9,'#9fe8ff',2);c.lineWidth=2;c.strokeStyle=OL;c.beginPath();c.moveTo(dir*2-1,1);c.lineTo(dir*2+1,1);c.stroke();
    const lx=Math.cos(a)*1.5,ly=Math.sin(a)*1.1;c.fillStyle=OL;for(const s of[-1,1]){c.beginPath();c.arc(dir*2+s*5+lx,1.4+ly,2,0,TAU);c.fill()}
    c.fillStyle='rgba(255,255,255,.75)';for(const s of[-1,1]){c.beginPath();c.arc(dir*2+s*5-1.6,-.6,1.1,0,TAU);c.fill()}
    c.beginPath();c.arc(0,-3,12.8,Math.PI,0);c.closePath();fs(c,lit(c,0,-9,12,'#ffc62e'));rr(c,-14,-5.4,28,3.6,1.8,'#e0a012');rr(c,-2.2,-16.6,4.4,11.5,2,'#ffe37a',1.5)}
  else{for(const[lx,ly,rot]of[[-9,-9,-.9],[9,-9,.9],[-4.5,-13,-.35],[4.5,-13,.35],[0,-14.5,0]])el(c,lx,ly,3.6,8,lit(c,lx,ly,8,'#2fae46'),1.8,rot);
    el(c,0,0,12,12,lit(c,0,0,12,v.skin));face(c,dir,a,o);c.fillStyle='rgba(180,110,70,.5)';for(const s of[-1,1])for(const q of[0,1]){c.beginPath();c.arc(dir*2.2+s*(7.6+q*1.6),3.6+q*.9,.55,0,TAU);c.fill()}
    for(let i=0;i<5;i++){const an=i*TAU/5+t*.6;el(c,-dir*8.5+Math.cos(an)*3,-9.5+Math.sin(an)*3,2.3,2.3,'#ff7eb0',1.1)}el(c,-dir*8.5,-9.5,1.9,1.9,'#ffe95a',1)}}

/* ---------- Rücken, Körper ---------- */
function back(c,k,dir,t){if(k==='nina'){c.save();c.rotate(-dir*.75);rr(c,-1.4,-17,2.8,24,1.2,'#cfd8e6',1.4);rr(c,-2.4,-21,4.8,5,1,'#3a1a5a',1.4);c.restore()}
  else if(k==='zappa'){const w=Math.sin(t*5)*2;poly(c,[-7,0,-dir*(13+w),15,-dir*(3+w),17,7,2],'#6a3fb0')}
  else if(k==='bert'){rr(c,-dir*12-4,-1,8,13,3,'#7a4a1e');el(c,-dir*12,-1,3.4,2,'#2a2a34',1.5)}
  else if(k==='rex')for(const s of[-1,1])rr(c,s*9-2,-6,4,9,1.5,'#6d7482',1.6)
  else if(k==='luke')rr(c,-dir*10-3,1,6,10,2.5,'#8a94ab',1.6)}
function body(c,k,dir,t){const v=HV[k];rr(c,-7.6,-1.5,15.2,14,5.2,lit(c,0,5,10,v.body));
  if(k==='luke'){poly(c,[-5,-1.4,0,4.4,5,-1.4,2.4,-1.4,0,1.6,-2.4,-1.4],'#ffd23f',1.2);rr(c,-7.6,8,15.2,2.6,1,'#1b2a52',1.2);rr(c,-1.6,7.6,3.2,3.4,.8,'#ffd23f',1)}
  else if(k==='rex'){rr(c,-4.8,1.4,9.6,6.4,1.6,'#10202e',1.4);['#5aff7a','#ffe95a','#ff5a4a'].forEach((q,i)=>{c.fillStyle=(Math.floor(t*3)+i)%3?q:'#fff';c.beginPath();c.arc(-2.8+i*2.8,4.6,1,0,TAU);c.fill()});
    c.fillStyle='#8b3f08';for(const[bx,by]of[[-6,0],[6,0],[-6,11],[6,11]]){c.beginPath();c.arc(bx,by,.8,0,TAU);c.fill()}}
  else if(k==='nina'){rr(c,-7.6,6.4,15.2,3,1,'#2c1d4a',1.2);poly(c,[-6.5,-2,6.5,-2,4,1.8,-4,1.8],'#e8334a',1.3)}
  else if(k==='zappa'){star(c,-3,5,2,.9,5,t,'#ffe95a',0);star(c,3.4,8.6,1.6,.7,5,-t,'#ffe95a',0);rr(c,-7.6,-1.8,15.2,2.8,1.2,'#ffd23f',1.2)}
  else if(k==='bert'){rr(c,-5.4,3,10.8,9.5,2,'#7a4a1e',1.3);for(const s of[-1,1])rr(c,s*4.4-1.1,-1.5,2.2,5.5,.8,'#7a4a1e',1.1);for(const bx of[-3,0,3])el(c,bx,8,1.5,1.5,'#2a2a34',1)}
  else{rr(c,-2.4,-1.5,4.8,14,1,'#3fc04f',1.1);c.fillStyle='#17913a';c.fillRect(3.2,3.6,3.6,1.3);c.fillRect(4.35,2.45,1.3,3.6);
    c.lineWidth=1.5;c.strokeStyle='#5a6474';c.beginPath();c.arc(0,-1,5,.15*Math.PI,.85*Math.PI);c.stroke();el(c,-dir*4.6,5,1.5,1.5,'#b9c2cf',1)}}

/* ---------- Waffe und Hände: zeigen in Zielrichtung, mit Rückstoß und Mündungsfeuer ---------- */
function weapon(c,k,a,t,rec){const v=HV[k],hand=(x,y)=>el(c,x,y,2.9,2.9,k==='rex'?'#8b93a3':k==='nina'?'#4a2a7a':v.skin,1.6);
  c.save();c.rotate(a);if(Math.cos(a)<0)c.scale(1,-1);c.translate(-rec*4,0);let tip=27;
  if(k==='luke'){for(const by of[-4.6,-1.3,2])rr(c,17,by,9,2.6,1,'#8a94ab',1.3);rr(c,6,-5.4,13,9.4,2.6,lit(c,12,-1,9,'#e6ecf6'));c.fillStyle='#ffd23f';c.fillRect(8,-5,2.4,8.6);
    glow(c,14,-.8,5,'90,220,255',.8);el(c,14,-.8,2.1,2.1,'#7ae6ff',1.1);rr(c,8,3.2,3.4,5,1,'#27324f',1.3);hand(8.6,5);hand(16,4.2)}
  else if(k==='rex'){for(const by of[-10,3]){rr(c,2,by,17,7,3,lit(c,10,by+3,9,'#9aa2b2'));rr(c,7,by-.6,3.2,8.2,1,'#e8791a',1.2);el(c,19.4,by+3.5,1.7,2.8,'#1a1a24',1.2)}tip=23}
  else if(k==='nina'){hand(7.5,3.4);hand(14,0);if(rec<.4){c.save();c.translate(18,0);c.rotate(t*12);star(c,0,0,7.2,2.4,4,0,'#e6edf7',1.4);el(c,0,0,1.5,1.5,'#7a35c9',1);c.restore()}tip=20}
  else if(k==='zappa'){rr(c,0,-1.3,25,2.6,1.2,'#9a6a3a',1.3);poly(c,[23,-3.4,27,-5,26,0,27,5,23,3.4],'#ffd23f',1.2);const f=.75+Math.sin(t*18)*.25;glow(c,28.5,0,11,'120,240,255',.55*f);el(c,28.5,0,4.4,4.4,'#bff6ff',1.4);
    c.strokeStyle='#fff';c.lineWidth=1.1;c.beginPath();for(let i=0;i<3;i++){const an=t*7+i*2.1;c.moveTo(28.5,0);c.lineTo(28.5+Math.cos(an)*7,Math.sin(an)*7)}c.stroke();hand(8,0);hand(15.5,.6);tip=31}
  else if(k==='bert'){hand(8,3.2);hand(13.5,2.4);if(rec<.4){el(c,17,-2,6.6,6.6,lit(c,17,-2,7,'#3a3a48'));rr(c,15.6,-10.6,2.8,3,.8,'#b9c2cf',1.1);c.strokeStyle='#c8a25a';c.lineWidth=1.4;c.beginPath();c.moveTo(17,-10.6);c.quadraticCurveTo(20,-14,22,-12);c.stroke();
      star(c,22,-12,2.2+Math.sin(t*30)*1.2,.9,4,t*9,'#ffe95a',0)}tip=20}
  else{rr(c,3,-2.6,4,5.2,1,'#b9c2cf',1.3);rr(c,7,-4,14,8,3.4,'rgba(235,248,255,.9)',1.6);c.fillStyle='#ff5a8f';c.beginPath();c.roundRect(8.6,-2.4,9*(1-rec*.7),4.8,2);c.fill();
    c.fillStyle='rgba(255,255,255,.7)';c.fillRect(9,-3,10,1.1);rr(c,21,-1.5,3,3,.8,'#b9c2cf',1.2);c.strokeStyle='#dfe6f0';c.lineWidth=1.3;c.beginPath();c.moveTo(24,0);c.lineTo(29.5,0);c.stroke();hand(9,3.8);hand(16.5,4)}
  if(rec>.5&&k!=='nina'&&k!=='bert'){const f=(rec-.5)*2;glow(c,tip+3,0,13*f,'255,230,120',.8);star(c,tip+3,k==='rex'?-6.5:0,9*f,3.4*f,5,t*20,'#fff6c0',0);if(k==='rex')star(c,tip+3,6.5,9*f,3.4*f,5,-t*20,'#fff6c0',0)}
  c.restore()}

/* ---------- Schatten, Team-Ring, Super-Leuchten ---------- */
function heroBase(c,x,y,ring,sc,o,t){const S=(sc||1)*1.15;c.save();c.translate(x,y);c.scale(S,S);
  c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(0,14,12.5,5,0,0,TAU);c.fill();
  if(ring){c.strokeStyle='rgba(16,14,40,.6)';c.lineWidth=5.4;c.beginPath();c.ellipse(0,13,16,7.4,0,0,TAU);c.stroke();c.strokeStyle=ring;c.lineWidth=3;c.stroke()}
  if(o.sup){const f=.6+Math.sin(t*8)*.25;glow(c,0,6,27,'255,215,70',.42*f);c.strokeStyle=`rgba(255,225,90,${f})`;c.lineWidth=2.6;c.setLineDash([6,5]);c.lineDashOffset=-t*40;c.beginPath();c.ellipse(0,13,20,9.4,0,0,TAU);c.stroke();c.setLineDash([])}
  c.restore()}

/* ---------- Ganzer Held. o: {mv bewegt sich, rec Rückstoß 0..1, flash Treffer-Blitz, sup Super bereit} ---------- */
function drawHero(c,k,x,y,a,ring,t,sc,o){o=o||{};
  if(o.flash>0){heroTmp=heroTmp||Object.assign(document.createElement('canvas'),{width:160,height:160});const tc=heroTmp.getContext('2d'),q=sc||1;tc.setTransform(1,0,0,1,0,0);tc.globalCompositeOperation='source-over';tc.clearRect(0,0,160,160);
    drawHero(tc,k,80,90,a,null,t,2,Object.assign({},o,{flash:0,bare:1}));tc.setTransform(1,0,0,1,0,0);tc.globalCompositeOperation='source-atop';tc.fillStyle=`rgba(255,255,255,${Math.min(.85,o.flash*5)})`;tc.fillRect(0,0,160,160);
    heroBase(c,x,y,ring,sc,o,t);c.drawImage(heroTmp,x-40*q,y-45*q,80*q,80*q);return}
  const S=(sc||1)*1.15,dir=Math.cos(a)>=0?1:-1,up=Math.sin(a)<-.35,wk=o.mv?Math.sin(t*15):0,bob=o.mv?Math.abs(wk)*1.6:Math.sin(t*3)*.5,rec=o.rec||0,v=HV[k];
  if(!o.bare)heroBase(c,x,y,ring,sc,o,t);
  c.save();c.translate(x,y);c.scale(S,S);c.lineJoin=c.lineCap='round';
  el(c,-5+wk*2.6,13-Math.max(0,wk)*2.2,4.7,3.3,v.foot);el(c,5-wk*2.6,13-Math.max(0,-wk)*2.2,4.7,3.3,v.foot);
  c.save();c.translate(0,3-bob*.5);if(up)weapon(c,k,a,t,rec);c.restore();
  c.save();c.translate(0,-bob*.5);back(c,k,dir,t);body(c,k,dir,t);c.restore();
  c.save();c.translate(dir,-10-bob);head(c,k,dir,a,t,o);c.restore();
  c.save();c.translate(0,3-bob*.5);if(!up)weapon(c,k,a,t,rec);c.restore();
  c.restore()}
