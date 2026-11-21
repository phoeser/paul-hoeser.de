"use strict";
/* ======================= Lucky Brawlers – Arena und Bildaufbau ======================= */
let groundC=null,wallC=null,bushC=null,groundFor=null,lastR=0;
const PAL={gem:{g1:'#79d453',g2:'#70ca4b',w1:'#a98bf0',w2:'#6b4fb8',wl:'#d6c6ff',out:'#245c2a',edge:'#35245f'},solo:{g1:'#edd590',g2:'#e6cb82',w1:'#d9924f',w2:'#96522a',wl:'#f3c08a',out:'#7a5a30',edge:'#4e2710'}};

/* ---------- Boden, Felsen und Büsche einmal vorzeichnen ---------- */
function buildGround(){const W=G.W*TS,H=G.H*TS,solo=G.mode==='solo',p=PAL[G.mode],T=(x,y)=>x<0||y<0||x>=G.W||y>=G.H?1:G.t[y*G.W+x];
  let s=G.seed>>>0||1;const R=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296},mk=h=>{const n=document.createElement('canvas');n.width=W;n.height=h;return n};
  groundC=mk(H);let c=groundC.getContext('2d');c.lineCap=c.lineJoin='round';
  for(let y=0;y<G.H;y++)for(let x=0;x<G.W;x++){c.fillStyle=(x+y)%2?p.g1:p.g2;c.fillRect(x*TS,y*TS,TS,TS)}
  for(let i=0;i<G.W*G.H/5;i++)glow(c,R()*W,R()*H,50+R()*70,R()<.5?'255,255,210':solo?'120,70,20':'0,70,20',.1);
  for(let i=0;i<G.W*G.H*2.4;i++){const x=R()*W,y=R()*H,tv=T(x/TS|0,y/TS|0),q=R();if(tv===1||tv===4)continue;
    if(!solo){if(q<.72){c.strokeStyle=q<.36?'#4fae36':'#a4ec7a';c.lineWidth=1.6;c.beginPath();for(const d of[-3,0,3]){c.moveTo(x+d,y);c.lineTo(x+d*1.6,y-5-R()*3)}c.stroke()}
      else if(q<.86){c.fillStyle=['#fff','#ffe95a','#ff9ac0'][(R()*3)|0];for(let k=0;k<5;k++){c.beginPath();c.arc(x+Math.cos(k*1.257)*2.6,y+Math.sin(k*1.257)*2.6,1.7,0,TAU);c.fill()}c.fillStyle='#ffb02e';c.beginPath();c.arc(x,y,1.5,0,TAU);c.fill()}
      else el(c,x,y,2.5+R()*2,1.8+R()*1.4,'#b9c0b0',1.2)}
    else{if(q<.4){c.strokeStyle='rgba(255,245,200,.55)';c.lineWidth=1.5;c.beginPath();c.arc(x,y,6+R()*8,3.5,5.6);c.stroke()}
      else if(q<.6){c.strokeStyle='rgba(110,70,20,.3)';c.lineWidth=1.3;c.beginPath();c.moveTo(x,y);c.lineTo(x+6-R()*12,y+5);c.lineTo(x+8-R()*16,y+11);c.stroke()}
      else if(q<.82){c.strokeStyle='#c2a24a';c.lineWidth=1.5;c.beginPath();for(const d of[-3,0,3]){c.moveTo(x+d,y);c.lineTo(x+d*1.7,y-5-R()*3)}c.stroke()}
      else el(c,x,y,2.5+R()*2.5,1.8+R()*1.6,'#c9a070',1.2)}}
  for(let y=0;y<G.H;y++)for(let x=0;x<G.W;x++)if(T(x,y)===4){const px=x*TS,py=y*TS,g=c.createLinearGradient(0,py,0,py+TS);g.addColorStop(0,'#46b8f5');g.addColorStop(1,'#2a95e0');c.fillStyle=g;c.fillRect(px,py,TS,TS);
    c.fillStyle='rgba(255,255,255,.6)';if(T(x,y-1)!==4)c.fillRect(px,py,TS,4);if(T(x,y+1)!==4)c.fillRect(px,py+TS-3,TS,3);if(T(x-1,y)!==4)c.fillRect(px,py,3,TS);if(T(x+1,y)!==4)c.fillRect(px+TS-3,py,3,TS);
    c.fillStyle='rgba(10,60,120,.25)';if(T(x,y-1)!==4)c.fillRect(px,py+4,TS,3)}
  c.fillStyle='rgba(20,30,10,.22)';c.beginPath();for(let y=0;y<G.H;y++)for(let x=0;x<G.W;x++)if(T(x,y)===1)c.rect(x*TS+7,y*TS+5,TS,TS);c.fill();
  if(!solo){const mx=W/2,my=H/2;el(c,mx,my+3,41,31,'#3b2d66',3);el(c,mx,my,34,24,'#231a44',2);for(let i=0;i<9;i++){const a=i*TAU/9;el(c,mx+Math.cos(a)*38,my+3+Math.sin(a)*28,6.5,5,'#8f86a8',1.6)}}
  // Felsen: Oberseite etwas nach oben versetzt, Vorderseite dunkler, Kontur nur außen
  wallC=mk(H+10);c=wallC.getContext('2d');c.translate(0,10);c.lineCap=c.lineJoin='round';
  for(let y=0;y<G.H;y++)for(let x=0;x<G.W;x++)if(G.t[y*G.W+x]===1){const px=x*TS,py=y*TS,sh=.9+R()*.2,up=T(x,y-1)!==1,dn=T(x,y+1)!==1,lf=T(x-1,y)!==1,rt=T(x+1,y)!==1,q=R(),mx=px+10+R()*20,my=py-2+R()*14;
    if(dn){c.fillStyle=p.w2;c.fillRect(px,py+TS-10,TS,10);c.fillStyle='rgba(0,0,0,.2)';c.fillRect(px,py+TS-4,TS,4)}
    c.fillStyle=p.w1;c.fillRect(px,py-10,TS,TS);c.fillStyle=sh>1?`rgba(255,255,255,${(sh-1)*.9})`:`rgba(0,0,0,${(1-sh)*.9})`;c.fillRect(px,py-10,TS,TS);
    if(up){c.fillStyle='rgba(255,255,255,.32)';c.fillRect(px,py-10,TS,5)}if(lf){c.fillStyle='rgba(255,255,255,.17)';c.fillRect(px,py-10,4,TS)}if(rt){c.fillStyle='rgba(0,0,0,.15)';c.fillRect(px+TS-4,py-10,4,TS)}
    if(!solo){if(q<.3)for(const[dx,hh,col]of[[-5,9,'#8ff0ff'],[1,14,'#e9d6ff'],[6,8,'#8ff0ff']])poly(c,[mx+dx-3,my+7,mx+dx,my+7-hh,mx+dx+3,my+7],col,1.4);
      else if(q<.62){c.strokeStyle=p.w2;c.lineWidth=1.6;c.beginPath();c.moveTo(mx-7,my);c.lineTo(mx-1,my+5);c.lineTo(mx+6,my+2);c.stroke()}}
    else{if(q<.13){rr(c,mx-3.2,my-9,6.4,17,3.2,'#46b452',1.5);rr(c,mx-9,my-3,5,3.4,1.7,'#46b452',1.3);rr(c,mx+4,my-.5,5,3.4,1.7,'#46b452',1.3)}
      else if(q<.5){el(c,mx,my+3,5+R()*3,3.4,p.wl,1.3);el(c,mx+8,my+6,3,2.2,p.wl,1.2)}else if(q<.78){c.strokeStyle=p.w2;c.lineWidth=1.6;c.beginPath();c.moveTo(px+5,my+2);c.lineTo(px+TS-5,my+5);c.stroke()}}
    c.strokeStyle=p.edge;c.lineWidth=2.6;c.beginPath();if(up){c.moveTo(px,py-10);c.lineTo(px+TS,py-10)}if(lf){c.moveTo(px,py-10);c.lineTo(px,py+TS-(dn?0:10))}if(rt){c.moveTo(px+TS,py-10);c.lineTo(px+TS,py+TS-(dn?0:10))}
    if(dn){c.moveTo(px,py+TS);c.lineTo(px+TS,py+TS);c.moveTo(px,py+TS-10);c.lineTo(px+TS,py+TS-10)}c.stroke()}
  // Büsche: dunkler Rand um die ganze Gruppe, dann einzelne Blätterkugeln mit Licht
  bushC=mk(H);c=bushC.getContext('2d');const bl=[];for(let y=0;y<G.H;y++)for(let x=0;x<G.W;x++)if(G.t[y*G.W+x]===2)for(let k=0;k<6;k++)bl.push([x*TS+6+R()*28,y*TS+5+R()*27,12+R()*6,R()]);
  c.fillStyle='#14552a';for(const b of bl){c.beginPath();c.arc(b[0],b[1],b[2]+2.6,0,TAU);c.fill()}
  for(const b of bl){c.fillStyle=lit(c,b[0],b[1],b[2],b[3]<.5?'#36b54e':'#2a9f42');c.beginPath();c.arc(b[0],b[1],b[2],0,TAU);c.fill();c.strokeStyle='rgba(15,70,30,.5)';c.lineWidth=1.4;c.beginPath();c.arc(b[0],b[1],b[2]*.55,.5,2.2);c.stroke();
    if(b[3]>.82)for(let k=0;k<3;k++)el(c,b[0]-5+k*5,b[1]+2-(k%2)*5,2.2,2.2,'#ff4a5a',1)}}
function crateAt(c,px,py){rr(c,px+2,py+TS-13,TS-4,12,2,'#8a5220');rr(c,px+2,py-7,TS-4,TS-7,4,lit(c,px+20,py+8,26,'#d59a48'));c.strokeStyle='#8a5220';c.lineWidth=2;c.beginPath();c.moveTo(px+3,py+4);c.lineTo(px+TS-3,py+4);c.moveTo(px+3,py+15);c.lineTo(px+TS-3,py+15);c.stroke();
  for(const[bx,by]of[[6,-3],[TS-6,-3],[6,22],[TS-6,22]])el(c,px+bx,py+by,1.7,1.7,'#5a6474',1);poly(c,[px+22,py-1,px+14.5,py+10.5,px+19.4,py+10.5,px+17.5,py+19,px+26,py+7.4,px+21,py+7.4],'#ffe95a',1.3)}

/* ---------- Ein Bild ---------- */
function render(){const c=cx,now=performance.now(),fdt=clamp((now-lastR)/1000,.005,.1);lastR=now;c.setTransform(DPR,0,0,DPR,0,0);
  if(!G||!G.P.length){c.fillStyle='#141a33';c.fillRect(0,0,VW,VH);return}if(groundFor!==G){buildGround();groundFor=G;DEC=[]}
  const m=G.P[me]||G.P[0],vw=VW/SC,vh=VH/SC,MW=G.W*TS,MH=G.H*TS,t=G.time,solo=G.mode==='solo',p=PAL[G.mode];c.fillStyle=p.out;c.fillRect(0,0,VW,VH);
  camX=MW<vw?(MW-vw)/2:clamp(m.x-vw/2,0,MW-vw);camY=MH<vh?(MH-vh)/2:clamp(m.y-vh/2,0,MH-vh);
  c.setTransform(DPR*SC,0,0,DPR*SC,-(camX+(Math.random()-.5)*SHK*14)*DPR*SC,-(camY+(Math.random()-.5)*SHK*14)*DPR*SC);c.drawImage(groundC,0,0);c.lineJoin=c.lineCap='round';
  const inView=(x,y)=>x>camX-70&&y>camY-70&&x<camX+vw+70&&y<camY+vh+90,r0=Math.max(0,Math.floor(camY/TS)-1),r1=Math.min(G.H-1,Math.floor((camY+vh)/TS)+1),c0=Math.max(0,Math.floor(camX/TS)-1),c1=Math.min(G.W-1,Math.floor((camX+vw)/TS)+1);
  c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=2;for(let ty=r0;ty<=r1;ty++)for(let tx=c0;tx<=c1;tx++)if(G.t[ty*G.W+tx]===4){const px=tx*TS,py=ty*TS,w=Math.sin(t*1.6+tx*1.3+ty)*4;c.beginPath();c.arc(px+12+w,py+17,6,3.5,5.6);c.stroke();c.beginPath();c.arc(px+28-w,py+31,5,3.5,5.6);c.stroke()}
  for(const d of DEC)glow(c,d.x,d.y,d.r,'30,20,10',.5*Math.min(1,d.l/3));
  if(!solo){const mx=MW/2,my=MH/2,f=.5+Math.sin(t*3)*.15;glow(c,mx,my,62,'200,110,255',f*.7);for(const[dx,hh,col]of[[-12,15,'#b044f0'],[-2,24,'#d98aff'],[9,17,'#b044f0']])poly(c,[mx+dx-6,my+8,mx+dx,my+8-hh,mx+dx+6,my+8],col,1.6)}
  for(const z of G.zones)if(z.k==='h')drawZone(c,z,m,t);
  for(const g of solo?G.cubes:G.gems)if(inView(g.x,g.y))drawItem(c,g,solo,t);
  // Zielhilfe des eigenen Helden
  if(aimPrev&&!m.dead){const h=HEROES[m.hero],lob=h.atk.k==='lob',d=lob?clamp(aimPrev.d||h.rng*TS*.8,TS,h.rng*TS):h.rng*TS,ex=m.x+Math.cos(aimPrev.a)*d,ey=m.y+Math.sin(aimPrev.a)*d;
    if(lob){c.fillStyle='rgba(255,255,255,.16)';c.beginPath();c.arc(ex,ey,h.atk.ex,0,TAU);c.fill();c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=3;c.setLineDash([7,6]);c.stroke();c.beginPath();c.moveTo(m.x,m.y);c.quadraticCurveTo((m.x+ex)/2,(m.y+ey)/2-60,ex,ey);c.stroke();c.setLineDash([])}
    else{c.strokeStyle='rgba(255,255,255,.3)';c.lineWidth=h.atk.k==='fan'?30:13;c.beginPath();c.moveTo(m.x,m.y);c.lineTo(ex,ey);c.stroke();c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=2;c.setLineDash([6,6]);c.beginPath();c.moveTo(m.x,m.y);c.lineTo(ex,ey);c.stroke();c.setLineDash([])}}
  // Bewegung erkennen: Laufen, Staub, Nachbilder beim Sprung
  for(const q of G.P){const d=dist(q.x,q.y,q._x===undefined?q.x:q._x,q._y===undefined?q.y:q._y)/fdt;q._mv=d>25;q._x=q.x;q._y=q.y;if(q.dead||!inView(q.x,q.y))continue;
    if(d>430&&d<4000&&Math.random()<.75)PT.push({k:'ghost',hero:q.hero,a:q.aim,t:t+q.id,x:q.x,y:q.y,vx:0,vy:0,l:.28,m:.28,g:0,rot:0,vr:0});
    else if(q._mv&&Math.random()<.14&&visibleTo(m,q))PT.push({k:'smoke',x:q.x,y:q.y+14,vx:0,vy:-8,l:.4,m:.4,c:solo?'#f3e2b0':'#d8f0c0',r:3,g:0,rot:0,vr:0})}
  // Helden und Felsen Reihe für Reihe, damit Figuren hinter Felsen verschwinden
  const vis=G.P.filter(q=>!q.dead&&inView(q.x,q.y)&&visibleTo(m,q)).sort((a,b)=>a.y-b.y),ringOf=q=>q.id===me?'#5cf07a':q.team===m.team?'#4ab0ff':'#ff5548',sx0=Math.max(0,Math.floor(camX)-2),sw=Math.min(MW-sx0,Math.ceil(vw)+4);let hi=0;
  const hero=q=>{c.globalAlpha=tileAt(q.x,q.y)===2?.6:1;drawHero(c,q.hero,q.x,q.y,q.aim,ringOf(q),t+q.id,1,{mv:q._mv,rec:RC[q.id]||0,flash:HF[q.id]||0,sup:q.sup>=1});c.globalAlpha=1;
    if(q.shield>0){glow(c,q.x,q.y-8,34,'140,225,255',.35);c.strokeStyle=`rgba(170,235,255,${.6+Math.sin(t*14)*.3})`;c.lineWidth=3;c.beginPath();c.arc(q.x,q.y-8,29,0,TAU);c.stroke()}};
  for(let r=r0;r<=Math.min(G.H,r1+1);r++){while(hi<vis.length&&vis[hi].y<r*TS-4)hero(vis[hi++]);const hh=Math.min(TS,MH+10-r*TS);if(sw>0&&hh>0)c.drawImage(wallC,sx0,r*TS,sw,hh,sx0,r*TS-10,sw,hh);
    if(solo&&r<G.H)for(let tx=c0;tx<=c1;tx++)if(G.t[r*G.W+tx]===3)crateAt(c,tx*TS,r*TS)}
  while(hi<vis.length)hero(vis[hi++]);
  for(const s of G.shots)if(s.k!=='l'&&inView(s.x,s.y))drawShot(c,s,m,t);
  c.drawImage(bushC,0,0);
  for(const z of G.zones)if(z.k!=='h')drawZone(c,z,m,t);
  for(const s of G.shots)if(s.k==='l'&&(inView(s.x,s.y)||inView(s.tx,s.ty)))drawShot(c,s,m,t);
  // Giftnebel
  if(solo){const R=gasR(),mx=MW/2,my=MH/2;c.fillStyle='rgba(70,210,90,.34)';c.beginPath();c.rect(camX-60,camY-60,vw+120,vh+120);c.arc(mx,my,R,0,TAU,true);c.fill('evenodd');
    c.fillStyle='rgba(120,240,120,.22)';for(let i=0;i<56;i++){const a=i*TAU/56+t*.04,d=R+20+Math.sin(t*1.3+i*2.1)*10,gx=mx+Math.cos(a)*d,gy=my+Math.sin(a)*d;if(inView(gx,gy)){c.beginPath();c.arc(gx,gy,30+(i%4)*5,0,TAU);c.fill()}}
    c.strokeStyle='rgba(150,255,150,.9)';c.lineWidth=4;c.setLineDash([14,9]);c.lineDashOffset=t*20;c.beginPath();c.arc(mx,my,R,0,TAU);c.stroke();c.setLineDash([])}
  drawParts(c);
  // Namen, Lebensbalken, Munition
  c.textAlign='center';for(const q of vis){const y=q.y-58,w=46,f=clamp(q.hp/q.max,0,1),col=ringOf(q);c.font='900 11.5px "Trebuchet MS",sans-serif';c.lineWidth=3.2;c.strokeStyle='rgba(16,14,40,.9)';c.strokeText(q.name,q.x,y-5);c.fillStyle='#fff';c.fillText(q.name,q.x,y-5);
    c.fillStyle='rgba(16,14,40,.92)';c.beginPath();c.roundRect(q.x-w/2-2,y-2,w+4,11,4.5);c.fill();if(f>0){c.fillStyle=col;c.beginPath();c.roundRect(q.x-w/2,y,Math.max(3,w*f),7,3);c.fill();c.fillStyle='rgba(255,255,255,.35)';c.fillRect(q.x-w/2+1.5,y+1,Math.max(0,w*f-3),2)}
    c.fillStyle='rgba(16,14,40,.55)';for(let hp=1000;hp<q.max;hp+=1000)c.fillRect(q.x-w/2+w*hp/q.max-.5,y,1,7);
    const n=solo?q.cubes:q.gems;if(n){el(c,q.x+w/2+11,y+3,8.5,8.5,solo?'#2fae3a':'#a03ae0',1.6);c.fillStyle='#fff';c.font='900 10.5px sans-serif';c.fillText(n,q.x+w/2+11,y+6.8)}
    if(q.id===me)for(let i=0;i<3;i++){c.fillStyle='rgba(16,14,40,.92)';c.beginPath();c.roundRect(q.x-w/2-2+i*16.6,y+10,15.6,7,3);c.fill();c.fillStyle='#ffb03a';c.beginPath();c.roundRect(q.x-w/2-.5+i*16.6,y+11.5,12.6*clamp(q.ammo-i,0,1),4,2);c.fill()}}
  drawTexts(c);
  // Bildschirm-Ebene: Randabdunklung, Start-Banner, Sticks, Hinweise
  c.setTransform(DPR,0,0,DPR,0,0);const vg=c.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.45,VW/2,VH/2,Math.max(VW,VH)*.78);vg.addColorStop(0,'rgba(10,8,30,0)');vg.addColorStop(1,'rgba(10,8,30,.4)');c.fillStyle=vg;c.fillRect(0,0,VW,VH);
  if(t<2.4&&!G.over){const go=t>1.4,k=go?t-1.4:t,pop=1+Math.max(0,.25-k)*2.4;c.globalAlpha=Math.min(1,(2.4-t)*3);c.font=`900 ${Math.min(VW/9,go?74:46)*pop}px "Trebuchet MS",sans-serif`;c.textAlign='center';c.lineWidth=8;c.strokeStyle='#1b1730';const s=go?'LOS!':MODES[G.mode].n;c.strokeText(s,VW/2,VH*.36);c.fillStyle=go?'#ffd23f':'#fff';c.fillText(s,VW/2,VH*.36);c.globalAlpha=1}
  for(const s of STICKS){c.fillStyle='rgba(16,14,40,.28)';c.beginPath();c.arc(s.ox,s.oy,48,0,TAU);c.fill();c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=3;c.stroke();c.fillStyle=s.aim?'rgba(255,110,80,.85)':'rgba(255,255,255,.8)';c.beginPath();c.arc(s.ox+s.dx,s.oy+s.dy,22,0,TAU);c.fill();c.strokeStyle='rgba(16,14,40,.6)';c.lineWidth=2.5;c.stroke()}
  if(m.dead&&!G.over){c.fillStyle='rgba(10,12,30,.65)';c.fillRect(0,VH/2-28,VW,56);c.fillStyle='#fff';c.font='900 21px "Trebuchet MS",sans-serif';c.textAlign='center';c.fillText(solo?'Ausgeschieden – du schaust zu':'Gleich geht es weiter … '+Math.max(1,Math.ceil(m.resp||0)),VW/2,VH/2+7)}}
