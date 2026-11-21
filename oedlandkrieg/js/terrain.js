"use strict";
/* ======================= Gelände in doppelter Auflösung (ersetzt renderTerrain aus draw.js) ======================= */
let TS=2;
function renderTerrain(){const W=MW*T,H=MH*T;TS=Math.min(2,(matchMedia('(pointer:coarse)').matches?4096:6144)/W);
  terrainC=document.createElement('canvas');terrainC.width=Math.round(W*TS);terrainC.height=Math.round(H*TS);const c=terrainC.getContext('2d');
  const n=noise2(W+8,H+8,90),n2=noise2(W,H,18),n3=noise2(W,H,260);srand(4242);
  const hex=(r,g,b)=>'#'+((1<<24)|(clamp(r,0,255)<<16)|(clamp(g,0,255)<<8)|clamp(b,0,255)).toString(16).slice(1),free=(px,py)=>tiles[((py/T)|0)*MW+((px/T)|0)]===0;
  // Grundfarbe in halber Auflösung, weich hochgezogen
  {const bw=W>>1,bh=H>>1,sm=document.createElement('canvas');sm.width=bw;sm.height=bh;const sx=sm.getContext('2d'),img=sx.createImageData(bw,bh),d=img.data;
    for(let y=0;y<bh;y++)for(let x=0;x<bw;x++){const X=x*2,Y=y*2,v=n(X,Y),w=n2(X,Y),z=n3(X,Y),i=(y*bw+x)*4,L=.94+w*.12;
      d[i]=(150+v*50+w*12+z*22)*L;d[i+1]=(117+v*38+w*9-z*6)*L;d[i+2]=(72+v*22+w*5-z*16)*L;d[i+3]=255}
    sx.putImageData(img,0,0);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(sm,0,0,terrainC.width,terrainC.height)}
  // Feine Körnung in voller Auflösung
  {const g=document.createElement('canvas');g.width=g.height=256;const gx=g.getContext('2d'),img=gx.createImageData(256,256),d=img.data;
    for(let i=0;i<65536;i++){const r=Math.random(),k=Math.random();if(r<.5){d[i*4]=50;d[i*4+1]=30;d[i*4+2]=12}else{d[i*4]=255;d[i*4+1]=236;d[i*4+2]=200}d[i*4+3]=(k<.03?70:k*30)|0}
    gx.putImageData(img,0,0);c.fillStyle=c.createPattern(g,'repeat');c.fillRect(0,0,terrainC.width,terrainC.height)}
  c.setTransform(TS,0,0,TS,0,0);c.lineCap='round';c.lineJoin='round';
  // Windrippen im Sand
  for(let i=0;i<MW*MH/26;i++){const x=sr()*W,y=sr()*H,a=sr()*Math.PI,len=30+sr()*60,m=3+(sr()*4|0);c.save();c.translate(x,y);c.rotate(a);
    for(let k=0;k<m;k++){const oy=k*5+sr()*2,l=len*(.6+sr()*.4),ph=sr()*6;for(const[dy,col]of[[0,'rgba(84,54,24,.26)'],[1.1,'rgba(255,236,196,.22)']]){c.strokeStyle=col;c.lineWidth=.8;c.beginPath();for(let q=0;q<=l;q+=4){const yy=oy+dy+Math.sin(q*.09+ph)*2;q?c.lineTo(q-l/2,yy):c.moveTo(q-l/2,yy)}c.stroke()}}c.restore()}
  // Trockenrisse
  for(let i=0;i<MW*MH/100;i++){const cx=sr()*W,cy=sr()*H;const walk=(x,y,a,dep)=>{const m=2+(sr()*3|0);c.beginPath();c.moveTo(x,y);for(let k=0;k<m;k++){a+=(sr()-.5)*1.1;x+=Math.cos(a)*(4+sr()*5);y+=Math.sin(a)*(4+sr()*5);c.lineTo(x,y);if(dep<1&&sr()<.4){const bx=x,by=y,ba=a+(sr()<.5?1:-1)*(.7+sr()*.6);c.stroke();walk(bx,by,ba,dep+1);c.beginPath();c.moveTo(x,y)}}c.stroke()};
    for(const[o,col,lw]of[[.7,'rgba(255,232,190,.2)',.7],[0,'rgba(46,28,12,.6)',.9]]){const s0=seed;c.strokeStyle=col;c.lineWidth=lw;c.save();c.translate(o,o);for(let b=0;b<5;b++)walk(cx,cy,b*1.26+sr(),0);c.restore();if(o)seed=s0}}
  // Krater mit Rand
  for(let i=0;i<MW*MH/60;i++){const x=sr()*W,y=sr()*H,r=7+sr()*20;let g=c.createRadialGradient(x+r*.15,y+r*.15,r*.1,x,y,r);g.addColorStop(0,'rgba(44,28,14,.62)');g.addColorStop(.75,'rgba(70,46,24,.3)');g.addColorStop(1,'rgba(70,46,24,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();
    c.lineWidth=1.3;c.strokeStyle='rgba(255,236,196,.38)';c.beginPath();c.arc(x,y,r*.86,.4,2.4);c.stroke();c.strokeStyle='rgba(30,18,8,.4)';c.beginPath();c.arc(x,y,r*.86,3.5,5.5);c.stroke()}
  // Fahrspuren
  c.strokeStyle='rgba(84,58,32,.2)';c.lineWidth=2.6;for(let i=0;i<MW/8;i++){const pts=[];let x=sr()*W,y=sr()*H,a=sr()*6;pts.push([x,y]);for(let k=0;k<14;k++){a+=(sr()-.5)*.5;x+=Math.cos(a)*40;y+=Math.sin(a)*40;pts.push([x,y])}
    for(const o of[0,7]){c.setLineDash([5,2.5]);c.beginPath();pts.forEach(([px,py],k)=>k?c.lineTo(px+o,py+o):c.moveTo(px+o,py+o));c.stroke()}}c.setLineDash([]);
  // Kiesel
  for(let i=0;i<MW*MH*1.4;i++){const x=sr()*W,y=sr()*H;if(!free(x,y))continue;const r=.7+sr()*sr()*2.6,b=96+sr()*70|0,a=sr()*3;c.fillStyle='rgba(30,18,8,.4)';c.beginPath();c.ellipse(x+r*.5,y+r*.6,r,r*.75,a,0,7);c.fill();c.fillStyle=hex(b+18,b,b-22);c.beginPath();c.ellipse(x,y,r,r*.75,a,0,7);c.fill();c.fillStyle='rgba(255,244,220,.45)';c.beginPath();c.arc(x-r*.3,y-r*.3,r*.35,0,7);c.fill()}
  // Trockenes Gras in Büscheln
  for(let i=0;i<MW*MH/22;i++){const cx=sr()*W,cy=sr()*H,m=4+(sr()*10|0);for(let k=0;k<m;k++){const x=cx+(sr()-.5)*46,y=cy+(sr()-.5)*46;if(x<0||y<0||x>=W||y>=H||!free(x,y))continue;c.fillStyle='rgba(30,20,8,.28)';c.beginPath();c.ellipse(x+1.5,y+1,3.5,1.6,0,0,7);c.fill();
      const bl=4+(sr()*4|0);for(let q=0;q<bl;q++){const a=-Math.PI/2+(q/(bl-1)-.5)*1.9+(sr()-.5)*.3,l=3.5+sr()*5;c.strokeStyle=['#7c6c30','#a8964e','#5e5426','#c2b06a'][(sr()*4)|0];c.lineWidth=.9;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a)*l*.5,y+Math.sin(a)*l*.6,x+Math.cos(a)*l+1,y+Math.sin(a)*l);c.stroke()}}}
  // Fels: Schatten, dann kantige Brocken
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(tiles[y*MW+x]===1){const cx=x*T+16,cy=y*T+16;const g=c.createRadialGradient(cx+7,cy+9,4,cx+7,cy+9,36);g.addColorStop(0,'rgba(28,17,8,.6)');g.addColorStop(1,'rgba(28,17,8,0)');c.fillStyle=g;c.beginPath();c.arc(cx+7,cy+9,36,0,7);c.fill()}
  c.fillStyle='rgba(58,44,32,.55)';for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(tiles[y*MW+x]===1){c.beginPath();c.roundRect(x*T+1,y*T+1,T-2,T-2,13);c.fill()}
  const boulder=(cx,cy,r,tr,tg,tb)=>{const m=7+(sr()*3|0),v=[],a0=sr()*6;for(let i=0;i<m;i++){const a=a0+i/m*Math.PI*2+(sr()-.5)*.35,rr=r*(.74+sr()*.36);v.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.86,a])}
    c.fillStyle='rgba(18,10,5,.42)';c.beginPath();v.forEach(([px,py],i)=>i?c.lineTo(px+r*.24,py+r*.3):c.moveTo(px+r*.24,py+r*.3));c.fill();
    const ax=cx-r*.2+(sr()-.5)*r*.25,ay=cy-r*.24+(sr()-.5)*r*.25;
    for(let i=0;i<m;i++){const p=v[i],q=v[(i+1)%m],am=(p[2]+q[2])/2+(i===m-1?Math.PI:0),l=-(Math.cos(am)*.7+Math.sin(am)*.72),f=1+l*.4+(sr()-.5)*.08,col=hex(tr*f|0,tg*f|0,tb*f|0);c.fillStyle=col;c.strokeStyle=col;c.lineWidth=.6;c.beginPath();c.moveTo(ax,ay);c.lineTo(p[0],p[1]);c.lineTo(q[0],q[1]);c.closePath();c.fill();c.stroke()}
    c.strokeStyle='rgba(255,240,214,.2)';c.lineWidth=.6;c.beginPath();for(const p of v)if(Math.cos(p[2])+Math.sin(p[2])<.2){c.moveTo(ax,ay);c.lineTo(p[0],p[1])}c.stroke();
    c.strokeStyle='rgba(22,13,7,.85)';c.lineWidth=1;c.beginPath();v.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.closePath();c.stroke();
    c.strokeStyle='rgba(255,244,222,.5)';c.lineWidth=.9;c.beginPath();let on=false;for(let i=0;i<=m;i++){const p=v[i%m],lit=Math.cos(p[2])+Math.sin(p[2])<-.5;if(lit){on?c.lineTo(p[0]+.6,p[1]+.6):c.moveTo(p[0]+.6,p[1]+.6);on=true}else on=false}c.stroke()};
  const rk=(x,y)=>x<0||y<0||x>=MW||y>=MH||tiles[y*MW+x]===1;
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(tiles[y*MW+x]===1){const inner=rk(x-1,y)&&rk(x+1,y)&&rk(x,y-1)&&rk(x,y+1),b=sr()*26|0,red=sr()<.3?14:0;
    if(inner)boulder(x*T+16+(sr()-.5)*8,y*T+16+(sr()-.5)*8,19+sr()*5,128+b+red,108+b,88+b-red);
    else{const m=2+(sr()*2|0);for(let k=0;k<m;k++)boulder(x*T+7+sr()*18,y*T+7+sr()*18,9+sr()*7,112+b+red,94+b,76+b-red);
      for(let k=0;k<3;k++){const px=x*T+16+(sr()-.5)*46,py=y*T+16+(sr()-.5)*46;if(px>0&&py>0&&px<W&&py<H&&free(px,py))boulder(px,py,2+sr()*2.6,118+b,100+b,82+b)}}}
  // Schrottfelder
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(tiles[y*MW+x]===3&&(x===0||tiles[y*MW+x-1]!==3)&&(y===0||tiles[(y-1)*MW+x]!==3)){const cx=x*T+32,cy=y*T+32;
    c.fillStyle='rgba(50,40,30,.45)';c.beginPath();c.ellipse(cx,cy,38,32,0,0,7);c.fill();
    for(let k=0;k<18;k++){const px=cx+(sr()-.5)*52,py=cy+(sr()-.5)*44,w=6+sr()*14,h=4+sr()*9,ro=sr()*6;c.save();c.translate(px+2,py+2.5);c.rotate(ro);c.fillStyle='rgba(15,10,6,.45)';c.fillRect(-w/2,-h/2,w,h);c.restore();c.save();c.translate(px,py);c.rotate(ro);
      const g=c.createLinearGradient(-w/2,-h/2,w/2,h/2),b=70+sr()*60;g.addColorStop(0,`rgb(${b+50|0},${b+30|0},${b+8|0})`);g.addColorStop(1,`rgb(${b-30|0},${b-40|0},${b-45|0})`);c.fillStyle=g;c.fillRect(-w/2,-h/2,w,h);
      c.fillStyle='rgba(160,72,28,.5)';c.fillRect(-w/2,-h/2,w*.4,h);c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=.8;c.strokeRect(-w/2,-h/2,w,h);c.fillStyle='rgba(255,240,210,.35)';c.fillRect(-w/2,-h/2,w,.8);c.restore()}
    for(let k=0;k<3;k++){const px=cx+(sr()-.5)*40,py=cy+(sr()-.5)*34;c.strokeStyle='rgba(10,8,6,.4)';c.lineWidth=4;c.beginPath();c.arc(px+1.5,py+2,6,0,7);c.stroke();c.strokeStyle='#1a1614';c.beginPath();c.arc(px,py,6,0,7);c.stroke();c.strokeStyle='#4a443e';c.lineWidth=.8;c.beginPath();c.arc(px,py,7.6,3.4,5.2);c.stroke();c.strokeStyle='#3a3430';c.lineWidth=1;c.beginPath();c.arc(px,py,3,0,7);c.stroke()}}
  // Ölfelder: glänzende Lachen
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(tiles[y*MW+x]===2&&(x===0||tiles[y*MW+x-1]!==2)&&(y===0||tiles[(y-1)*MW+x]!==2)){const cx=x*T+32,cy=y*T+32;
    let g=c.createRadialGradient(cx,cy,10,cx,cy,44);g.addColorStop(0,'rgba(24,15,8,.75)');g.addColorStop(1,'rgba(24,15,8,0)');c.fillStyle=g;c.beginPath();c.arc(cx,cy,44,0,7);c.fill();
    const bl=[];for(let k=0;k<7;k++)bl.push([cx+(sr()-.5)*32,cy+(sr()-.5)*26,9+sr()*13,7+sr()*9,sr()*3]);
    c.fillStyle='rgba(120,84,48,.5)';for(const[bx,by,rx,ry,ro]of bl){c.beginPath();c.ellipse(bx,by,rx+1.6,ry+1.6,ro,0,7);c.fill()}
    c.fillStyle='#070504';for(const[bx,by,rx,ry,ro]of bl){c.beginPath();c.ellipse(bx,by,rx,ry,ro,0,7);c.fill()}
    for(const[bx,by,rx,ry,ro]of bl){c.strokeStyle='rgba(150,165,190,.3)';c.lineWidth=1;c.beginPath();c.ellipse(bx,by,rx*.82,ry*.8,ro,3.4,4.9);c.stroke()}
    c.lineWidth=1.6;c.strokeStyle='rgba(140,100,230,.45)';c.beginPath();c.ellipse(cx-6,cy-6,12,6,.3,3.6,5.6);c.stroke();c.strokeStyle='rgba(70,210,190,.38)';c.beginPath();c.ellipse(cx+6,cy+4,9,4,.2,3.5,5.2);c.stroke();c.strokeStyle='rgba(230,170,70,.3)';c.beginPath();c.ellipse(cx-2,cy+7,10,4,-.2,3.3,5);c.stroke();
    c.fillStyle='rgba(255,255,255,.5)';for(let k=0;k<3;k++){c.beginPath();c.ellipse(cx-10+k*9+sr()*4,cy-8+sr()*10,2.6,.9,-.5,0,7);c.fill()}
    for(let k=0;k<4;k++){const bx=cx+(sr()-.5)*24,by=cy+(sr()-.5)*18,r=1+sr()*1.6;c.strokeStyle='rgba(120,120,130,.6)';c.lineWidth=.6;c.beginPath();c.arc(bx,by,r,0,7);c.stroke();c.fillStyle='rgba(255,255,255,.6)';c.fillRect(bx-r*.5,by-r*.5,.8,.8)}}
  // Deko: tote Bäume, Büsche, Knochen, Wracks, Fässer, Mauerreste
  for(let i=0;i<MW*MH/34;i++){const x=(sr()*MW)|0,y=(sr()*MH)|0;if(tiles[y*MW+x]!==0)continue;const px=x*T+4+sr()*24,py=y*T+4+sr()*24,k=sr(),ro=sr()*6;
    if(k<.3){const s=8+sr()*9,tree=(ox,oy,col,lw)=>{c.strokeStyle=col;const br=(bx,by,a,l,w,dep)=>{const ex=bx+Math.cos(a)*l,ey=by+Math.sin(a)*l;c.lineWidth=w;c.beginPath();c.moveTo(bx,by);c.lineTo(ex,ey);c.stroke();if(dep<2)for(const da of[-.55-sr()*.3,.5+sr()*.3])br(ex,ey,a+da,l*.62,w*.6,dep+1)};const m=4+(sr()*2|0);for(let q=0;q<m;q++)br(px+ox,py+oy,ro+q/m*Math.PI*2+sr()*.5,s*.55,lw,0)};
      const s0=seed;tree(3.5,4.5,'rgba(22,13,6,.35)',2);seed=s0;tree(0,0,'#3c2b1c',1.8);c.fillStyle='#4e3a26';c.beginPath();c.arc(px,py,2.2,0,7);c.fill();c.fillStyle='rgba(255,236,200,.3)';c.beginPath();c.arc(px-.7,py-.7,.9,0,7);c.fill()}
    else if(k<.5){for(let q=0;q<5;q++){const bx=px+(sr()-.5)*10,by=py+(sr()-.5)*8,r=2.5+sr()*3;c.fillStyle='rgba(22,14,6,.3)';c.beginPath();c.arc(bx+2,by+2.4,r,0,7);c.fill();c.fillStyle=['#5a5a2c','#6c6a34','#4a4a26'][(sr()*3)|0];c.beginPath();c.arc(bx,by,r,0,7);c.fill();c.strokeStyle='rgba(190,184,110,.55)';c.lineWidth=.6;c.beginPath();c.arc(bx,by,r*.7,3.3,5.2);c.stroke()}}
    else if(k<.64){c.save();c.translate(px,py);c.rotate(ro);c.strokeStyle='#efe4c8';c.lineWidth=1.3;for(let q=-2;q<=2;q++){c.beginPath();c.moveTo(q*2.4,-3.6);c.quadraticCurveTo(q*2.4+1.2,0,q*2.4,3.6);c.stroke()}c.beginPath();c.moveTo(-6,0);c.lineTo(6,0);c.stroke();c.fillStyle='#efe4c8';c.beginPath();c.arc(9,0,2.8,0,7);c.fill();c.fillStyle='#2a1c10';c.fillRect(9.2,-1.4,1.1,1.1);c.fillRect(9.2,.4,1.1,1.1);c.restore()}
    else if(k<.78){c.save();c.translate(px,py);c.rotate(ro);c.fillStyle='rgba(18,11,6,.4)';c.fillRect(-11,-4,25,13);const g=c.createLinearGradient(0,-6,0,6);g.addColorStop(0,'#8a5a36');g.addColorStop(1,'#4a2e1c');c.fillStyle=g;c.beginPath();c.roundRect(-13,-6.5,26,13,3);c.fill();c.strokeStyle='rgba(20,12,8,.8)';c.lineWidth=.8;c.stroke();c.fillStyle='#1c1612';c.fillRect(-5,-5,9,10);c.fillStyle='rgba(150,190,210,.35)';c.fillRect(4.5,-4.5,2,9);c.fillStyle='#9a4a1e';c.fillRect(-13,-6.5,5,4);c.fillRect(7,2,5,4);c.fillStyle='#14100c';c.fillRect(-10,-8,5,2);c.fillRect(-10,6,5,2);c.fillRect(6,-8,5,2);c.restore()}
    else if(k<.88){for(let q=0;q<1+(sr()*3|0);q++){const bx=px+(sr()-.5)*14,by=py+(sr()-.5)*12,tox=sr()<.35;c.fillStyle='rgba(18,11,6,.4)';c.beginPath();c.arc(bx+2,by+2.5,4,0,7);c.fill();c.fillStyle=tox?'#b8a02a':'#7a3a22';c.beginPath();c.arc(bx,by,4,0,7);c.fill();c.strokeStyle='rgba(20,12,8,.8)';c.lineWidth=.8;c.stroke();c.strokeStyle=tox?'#e8d86a':'#b0623a';c.beginPath();c.arc(bx,by,2.6,0,7);c.stroke();c.fillStyle='#1a1410';c.beginPath();c.arc(bx+1,by-1,.9,0,7);c.fill()}}
    else{c.save();c.translate(px,py);c.rotate(((ro*2/Math.PI)|0)*Math.PI/2);const seg=(x0,y0,w,h)=>{c.fillStyle='rgba(18,11,6,.4)';c.fillRect(x0+3,y0+4,w,h);c.fillStyle='#8a857a';c.fillRect(x0,y0,w,h);c.fillStyle='#b4afa2';c.fillRect(x0,y0,w,1.4);c.fillStyle='#5a564e';c.fillRect(x0,y0+h-1.6,w,1.6);c.strokeStyle='rgba(20,14,10,.75)';c.lineWidth=.7;c.strokeRect(x0,y0,w,h)};seg(-12,-3,9+sr()*8,6);seg(-12,-3,6,10+sr()*8);c.fillStyle='#6e6a60';for(let q=0;q<4;q++)c.fillRect(-2+sr()*14,5+sr()*8,2+sr()*2.5,1.6+sr()*2);c.restore()}}
  c.setTransform(1,0,0,1,0,0);
  decalC=document.createElement('canvas');decalC.width=W;decalC.height=H;decalX=decalC.getContext('2d');
  // Minikarte
  miniBase=document.createElement('canvas');miniBase.width=MW;miniBase.height=MH;const m=miniBase.getContext('2d');
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=tiles[y*MW+x];m.fillStyle=t===1?'#5e5244':t===2?'#120c08':t===3?'#6e6a66':'#a98858';m.fillRect(x,y,1,1)}}
// Das Gelände liegt in TS-facher Auflösung vor; beim Zeichnen wird der Ausschnitt entsprechend umgerechnet
{const d0=ctx.drawImage.bind(ctx);ctx.drawImage=function(im,a,b,w,h,...r){return im===terrainC&&r.length?d0(im,a*TS,b*TS,w*TS,h*TS,...r):d0(im,a,b,w,h,...r)}}
