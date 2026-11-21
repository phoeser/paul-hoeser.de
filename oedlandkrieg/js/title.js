"use strict";
/* ======================= Titelbild (Startbildschirm) ======================= */
// Gemalte Ödland-Szene im Sonnenuntergang: fester Hintergrund wird einmal gezeichnet, Flammen, Pumpen, Funken und Staub bewegen sich.
(function(){const cvT=$('titleBg');if(!cvT)return;const x=cvT.getContext('2d');let W=0,H=0,base=null,hz=0,sd=7,embers=[],dust=[],pumps=[],flares=[];
  const R=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};
  function paint(){const d=Math.min(2,window.devicePixelRatio||1);W=cvT.clientWidth;H=cvT.clientHeight;if(!W||!H)return;cvT.width=W*d;cvT.height=H*d;x.setTransform(d,0,0,d,0,0);
    base=document.createElement('canvas');base.width=W*d;base.height=H*d;const c=base.getContext('2d');c.setTransform(d,0,0,d,0,0);sd=7;hz=H*.63;pumps=[];flares=[];
    // Himmel
    let g=c.createLinearGradient(0,0,0,hz);g.addColorStop(0,'#07060d');g.addColorStop(.35,'#2a1220');g.addColorStop(.7,'#8a3018');g.addColorStop(.92,'#e8892e');g.addColorStop(1,'#ffd27a');c.fillStyle=g;c.fillRect(0,0,W,hz+2);
    // Sonne mit Dunst
    const sx=W*.66,sy=hz-H*.035,sr=Math.max(46,H*.105);g=c.createRadialGradient(sx,sy,0,sx,sy,sr*5);g.addColorStop(0,'rgba(255,225,150,.75)');g.addColorStop(.25,'rgba(255,150,60,.32)');g.addColorStop(1,'rgba(255,120,40,0)');c.fillStyle=g;c.fillRect(0,0,W,hz+2);
    g=c.createLinearGradient(0,sy-sr,0,sy+sr);g.addColorStop(0,'#fff6d0');g.addColorStop(1,'#ffb040');c.fillStyle=g;c.beginPath();c.arc(sx,sy,sr,0,7);c.fill();
    // Rauchbänder
    for(let i=0;i<16;i++){const y=hz*(.2+R()*.72),w=W*(.2+R()*.5),cx=R()*W;c.fillStyle=`rgba(${24+R()*30|0},${8+R()*10|0},${12+R()*12|0},${.2+R()*.25})`;c.beginPath();c.ellipse(cx,y,w,5+R()*H*.016,0,0,7);c.fill()}
    // Ferne Tafelberge
    const ridge=(y0,amp,stp,col,flat)=>{c.fillStyle=col;c.beginPath();c.moveTo(0,H);c.lineTo(0,y0);let y=y0;for(let px=0;px<=W+stp;px+=stp){if(R()<flat)y=y0-R()*amp;c.lineTo(px,y);c.lineTo(px+stp*.75,y)}c.lineTo(W,H);c.fill()};
    ridge(hz-H*.02,H*.085,W/26,'#6a2c1a',.4);ridge(hz+H*.005,H*.05,W/34,'#45190f',.5);
    // Boden
    g=c.createLinearGradient(0,hz,0,H);g.addColorStop(0,'#3a160c');g.addColorStop(.25,'#1c0c07');g.addColorStop(1,'#040302');c.fillStyle=g;c.fillRect(0,hz+H*.012,W,H);
    // Lichtstreifen der Sonne auf dem Boden
    g=c.createRadialGradient(sx,hz+H*.03,0,sx,hz+H*.03,W*.34);g.addColorStop(0,'rgba(255,150,60,.26)');g.addColorStop(1,'rgba(255,150,60,0)');c.fillStyle=g;c.save();c.translate(0,hz+H*.03);c.scale(1,.2);c.translate(0,-(hz+H*.03));c.fillRect(0,hz-H*2,W,H*5);c.restore();
    // Ruinenstadt
    const k=H/720,ruin=(px,w,h,col)=>{const y=hz+H*.02;c.fillStyle=col;c.beginPath();c.moveTo(px,y);c.lineTo(px,y-h);let q=px;while(q<px+w){const st=4+R()*10*k;c.lineTo(q,y-h+R()*h*.28);q+=st;c.lineTo(Math.min(q,px+w),y-h+R()*h*.28)}c.lineTo(px+w,y);c.fill();
      c.fillStyle='rgba(255,160,70,.5)';for(let i=0;i<w*h/(900*k*k);i++)if(R()<.3)c.fillRect(px+3+R()*(w-8),y-h*.7+R()*h*.6,2*k,3*k)};
    for(let px=-10;px<W;){const w=(18+R()*46)*k,h=(30+R()*120)*k*(Math.abs(px-sx)<W*.12?.45:1);if(R()<.78)ruin(px,w,h,'#22100b');px+=w+R()*30*k}
    // Bohrtürme und Fackeln
    const tower=(px,h)=>{const y=hz+H*.03,w=h*.34;c.strokeStyle='#120806';c.lineWidth=Math.max(1.5,2.4*k);c.beginPath();c.moveTo(px-w,y);c.lineTo(px-w*.18,y-h);c.lineTo(px+w*.18,y-h);c.lineTo(px+w,y);for(let i=1;i<6;i++){const t=i/6,a=w*(1-t*.82),b=w*(1-(t+1/6)*.82);c.moveTo(px-a,y-h*t);c.lineTo(px+b,y-h*(t+1/6));c.moveTo(px+a,y-h*t);c.lineTo(px-b,y-h*(t+1/6))}c.stroke();c.fillStyle='#120806';c.fillRect(px-w*.3,y-h-5*k,w*.6,6*k)};
    for(const[fx,fh]of[[.07,.2],[.2,.13],[.43,.17],[.86,.22],[.95,.12]])tower(W*fx,H*fh);
    for(const[fx,fh]of[[.13,.15],[.52,.1],[.79,.13]]){const px=W*fx,y=hz+H*.03,h=H*fh;c.fillStyle='#120806';c.fillRect(px-2.5*k,y-h,5*k,h);flares.push({x:px,y:y-h,s:(9+R()*6)*k})}
    for(const fx of[.3,.6,.72]){pumps.push({x:W*fx,y:hz+H*.045,s:(26+R()*12)*k,p:R()*6})}
    // Vordergrund: Düne, Wrack, Pfähle
    c.fillStyle='#030201';c.beginPath();c.moveTo(0,H);c.lineTo(0,H*.86);c.bezierCurveTo(W*.2,H*.79,W*.36,H*.9,W*.55,H*.885);c.bezierCurveTo(W*.74,H*.87,W*.86,H*.8,W,H*.84);c.lineTo(W,H);c.fill();
    c.strokeStyle='rgba(255,140,50,.35)';c.lineWidth=1.5;c.beginPath();c.moveTo(0,H*.86);c.bezierCurveTo(W*.2,H*.79,W*.36,H*.9,W*.55,H*.885);c.bezierCurveTo(W*.74,H*.87,W*.86,H*.8,W,H*.84);c.stroke();
    const rim=()=>{c.fill();c.strokeStyle='rgba(255,150,60,.45)';c.lineWidth=1.3;c.stroke()};
    {const s=Math.max(.8,k*1.25),px=W*.1,py=H*.835;c.save();c.translate(px,py);c.rotate(-.09);c.scale(s,s);c.fillStyle='#030201';c.beginPath();c.roundRect(-70,0,140,22,11);rim();c.beginPath();c.moveTo(-58,0);c.lineTo(-46,-20);c.lineTo(44,-20);c.lineTo(60,0);c.closePath();rim();c.beginPath();c.roundRect(-22,-40,48,22,5);rim();c.save();c.translate(22,-31);c.rotate(-.28);c.beginPath();c.rect(0,-3.5,78,7);rim();c.restore();c.restore()}
    for(const[fx,fy,h,a]of[[.9,.83,70,.12],[.83,.845,46,-.2],[.955,.85,54,.3],[.31,.87,40,.18]]){c.save();c.translate(W*fx,H*fy);c.rotate(a);c.fillStyle='#030201';c.beginPath();c.rect(-3*k,-h*k,6*k,h*k+20);rim();c.beginPath();c.arc(0,-h*k-6*k,6.5*k,0,7);rim();c.fillStyle='#ff9a3a';c.fillRect(-3.4*k,-h*k-8*k,2.2*k,2.4*k);c.fillRect(1.2*k,-h*k-8*k,2.2*k,2.4*k);c.restore()}
    // Randabdunklung
    g=c.createRadialGradient(W/2,H*.45,Math.min(W,H)*.3,W/2,H*.5,Math.max(W,H)*.78);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.72)');c.fillStyle=g;c.fillRect(0,0,W,H);
    embers=[];for(let i=0;i<70;i++)embers.push({x:Math.random()*W,y:Math.random()*H,v:12+Math.random()*30,s:.6+Math.random()*1.8,p:Math.random()*6});
    dust=[];for(let i=0;i<9;i++)dust.push({x:Math.random()*W,y:hz+H*.02+Math.random()*H*.3,w:W*(.15+Math.random()*.3),v:8+Math.random()*22,a:.04+Math.random()*.06})}
  let t0=performance.now();
  function frame(now){requestAnimationFrame(frame);if($('start').classList.contains('hidden'))return;if(cvT.clientWidth!==W||cvT.clientHeight!==H||!base)paint();if(!base)return;const dt=Math.min(.05,(now-t0)/1000),t=now/1000,k=H/720;t0=now;
    x.drawImage(base,0,0,W,H);
    // Ölpumpen
    x.strokeStyle='#120806';x.fillStyle='#120806';for(const p of pumps){const a=Math.sin(t*1.3+p.p)*.3,s=p.s;x.lineWidth=Math.max(1.5,s*.09);x.beginPath();x.moveTo(p.x-s*.45,p.y);x.lineTo(p.x,p.y-s);x.lineTo(p.x+s*.45,p.y);x.stroke();x.save();x.translate(p.x,p.y-s);x.rotate(a);x.fillRect(-s*.95,-s*.07,s*1.9,s*.14);x.beginPath();x.moveTo(s*.82,-s*.3);x.lineTo(s*1.12,-s*.14);x.lineTo(s*1.12,s*.3);x.lineTo(s*.82,s*.34);x.fill();x.restore()}
    // Fackeln, Funken
    x.globalCompositeOperation='lighter';for(const f of flares){const fl=.75+Math.sin(t*9+f.x)*.14+Math.random()*.16,r=f.s*2.6*fl;let g=x.createRadialGradient(f.x,f.y-r*.3,0,f.x,f.y-r*.3,r*2.4);g.addColorStop(0,'rgba(255,190,90,.55)');g.addColorStop(1,'rgba(255,120,30,0)');x.fillStyle=g;x.beginPath();x.arc(f.x,f.y-r*.3,r*2.4,0,7);x.fill();
      x.fillStyle='#ffd070';x.beginPath();x.moveTo(f.x-f.s*.5,f.y);x.quadraticCurveTo(f.x-f.s*.9*fl,f.y-r*.6,f.x+Math.sin(t*6+f.x)*f.s*.5,f.y-r*1.5);x.quadraticCurveTo(f.x+f.s*.9*fl,f.y-r*.6,f.x+f.s*.5,f.y);x.fill()}
    for(const e of embers){e.y-=e.v*dt;e.x+=Math.sin(t*1.2+e.p)*12*dt+7*dt;if(e.y<-5){e.y=H+5;e.x=Math.random()*W}if(e.x>W+5)e.x=-5;const al=.3+.5*Math.abs(Math.sin(t*2.2+e.p));x.fillStyle=`rgba(255,${130+e.s*40|0},50,${al})`;x.beginPath();x.arc(e.x,e.y,e.s*Math.max(.8,k),0,7);x.fill()}
    x.globalCompositeOperation='source-over';
    // Staubfahnen
    for(const d of dust){d.x+=d.v*dt;if(d.x-d.w>W)d.x=-d.w;const g=x.createRadialGradient(d.x,d.y,0,d.x,d.y,d.w);g.addColorStop(0,`rgba(210,130,70,${d.a})`);g.addColorStop(1,'rgba(210,130,70,0)');x.fillStyle=g;x.save();x.translate(0,d.y);x.scale(1,.16);x.translate(0,-d.y);x.beginPath();x.arc(d.x,d.y,d.w,0,7);x.fill();x.restore()}}
  requestAnimationFrame(frame)})();
