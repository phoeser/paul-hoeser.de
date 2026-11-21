"use strict";
/* ======================= Detailreichere Bodentruppen der Bunkerleute; alle anderen Einheiten werden wie bisher gezeichnet, nur etwas größer ======================= */
{const old=drawUnit,NEW={inf:1,rkt:1,flame:1,med:1,scout:1,fast:1,oil:1,heavy:1,art:1,mbt:1};
drawUnit=function(u){const c=DC;if(sides[u.side].fac!=='bunker'||!NEW[u.type]){c.save();c.translate(u.x,u.y);c.scale(1.1,1.1);c.translate(-u.x,-u.y);old(u);c.restore();return}
  const col=COL[u.side],mv=!!u.path,a=u.anim;c.save();c.translate(u.x,u.y);
  // Erforschte Waffen und Panzerung machen die Einheit etwas größer und geben ihr Panzerplatten bzw. eine Waffenspitze
  const tk=sides[u.side].tech,ti=u.s.arm==='inf',wl=tk?tk[ti?'infW':'vehW']||0:0,al=tk?tk[ti?'infA':'vehA']||0:0,usc=1.3*(1+(wl+al)*.035);
  c.scale(usc,usc);if(u.s.air){c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(16,24,u.s.r*1.1,u.s.r*.6,0,0,7);c.fill();c.translate(0,-6+Math.sin(a*2)*1.5)}else{const sg=c.createRadialGradient(3,5,1,3,5,u.s.r*1.2);sg.addColorStop(0,'rgba(0,0,0,.42)');sg.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=sg;c.beginPath();c.ellipse(3,5,u.s.r*1.25,u.s.r*.8,0,0,7);c.fill()}
  c.rotate(u.dir);const leg=mv?Math.sin(a*14)*3:0,kick=time-(u.fT||-9)<.1?-1.5:0;
  // Fußsoldat: Stiefel, Rucksack, Weste mit Parteistreifen, Arme in Zielrichtung
  const man=(bc,pack)=>{c.lineCap='round';c.strokeStyle='#1e1a14';c.lineWidth=3;c.beginPath();c.moveTo(-1,-3);c.lineTo(-1+leg,-6);c.moveTo(-1,3);c.lineTo(-1-leg,6);c.stroke();if(pack)mrect(c,-7.6,-3.6,4.6,7.2,pack,1.5);
    mrect(c,-4,-6,8,12,bc,3.6);c.fillStyle=col;c.fillRect(-4,-5,2.2,10);c.rotate(u.tdir-u.dir);c.strokeStyle=shade(bc,.8);c.lineWidth=2.6;c.beginPath();c.moveTo(.5,-4.6);c.lineTo(5.5,1.4);c.moveTo(.5,4.6);c.lineTo(4.2,2.6);c.stroke();c.lineCap='butt'};
  const lights=(x,y)=>{c.fillStyle='#fff2b0';c.fillRect(x,-y-1,1.5,2);c.fillRect(x,y-1,1.5,2)};
  switch(u.type){
    case'inf':man('#6e6d4a','#4a4a36');mrect(c,1.5+kick,1.2,11,2.2,'#22211c',.6);c.fillStyle='#6a5434';c.fillRect(1+kick,.9,3.4,2.8);mcirc(c,0,0,3.9,'#515538');c.fillStyle='rgba(0,0,0,.35)';c.fillRect(1.8,-2.4,1.2,4.8);break;
    case'rkt':man('#6e6d4a','#3e3c2c');mrect(c,-5+kick,.4,16,4.2,'#3c3c30',1.4);c.fillStyle='#b8321c';c.beginPath();c.moveTo(11+kick,.4);c.lineTo(14.6+kick,2.5);c.lineTo(11+kick,4.6);c.fill();mrect(c,2+kick,-.8,3.2,1.5,'#22211c',.4);mcirc(c,0,0,3.9,'#515538');c.fillStyle='rgba(0,0,0,.35)';c.fillRect(1.8,-2.4,1.2,4.8);break;
    case'flame':mcirc(c,-6.6,-2.5,3,'#c8641e');mcirc(c,-6.6,2.5,3,'#c8641e');man('#6b6a48');mrect(c,1,1,11.5,2.8,'#2a2a26',.8);c.fillStyle=u.tgt?'#ffb03a':'#7a3a14';c.beginPath();c.arc(13,2.4,1.8,0,7);c.fill();mcirc(c,0,0,3.8,'#5a5a40');c.fillStyle='#ff9a3a';c.fillRect(1.4,-2.2,1.6,4.4);break;
    case'med':man('#dcdad0','#c0302a');mrect(c,3.4,1.6,4.6,3.6,'#eceade',1);c.fillStyle='#d0302a';c.fillRect(4.6,3,2.2,.8);c.fillRect(5.3,2.3,.8,2.2);mcirc(c,0,0,3.8,'#f0eee4');c.fillRect(-2.3,-.7,4.6,1.4);c.fillRect(-.7,-2.3,1.4,4.6);break;
    case'scout':c.fillStyle='#120f0c';c.beginPath();c.roundRect(-11.5,-2.2,6.5,4.4,2);c.roundRect(5,-2.2,6.5,4.4,2);c.fill();mrect(c,-7,-1.7,14,3.4,'#6a6a62',1.5);mrect(c,-2.4,-3.2,6.6,6.4,col,2.2);mrect(c,-10.5,2,5.5,1.5,'#9a988c',.6);
      c.strokeStyle='#1a1a16';c.lineWidth=1.5;c.beginPath();c.moveTo(5.4,-4.6);c.lineTo(5.4,4.6);c.stroke();c.fillStyle='#fff2b0';c.beginPath();c.arc(9.8,0,1.5,0,7);c.fill();mcirc(c,-1.4,0,3.5,'#4e5236');c.fillStyle='rgba(0,0,0,.35)';c.fillRect(.4,-2.2,1.2,4.4);c.rotate(u.tdir-u.dir);mrect(c,1.5+kick,1.4,7.5,1.5,'#1b1a16',.4);break;
    case'fast':wheels(c,[[-7.5,-8],[7.5,-8],[-7.5,8],[7.5,8]],8,5);mrect(c,-12,-6,24,12,'#7d6c46',3);mrect(c,4,-5,7.6,10,'#8c7a50',2);c.fillStyle=col;c.fillRect(-11.4,-5.4,3.6,10.8);mcirc(c,-9.6,0,2.4,'#1a1612');
      c.strokeStyle='#2a2418';c.lineWidth=1.5;c.strokeRect(-5.5,-5,9,10);c.beginPath();c.moveTo(-5.5,-5);c.lineTo(3.5,5);c.moveTo(3.5,-5);c.lineTo(-5.5,5);c.stroke();lights(10.4,3.6);c.rotate(u.tdir-u.dir);mrect(c,1+kick,-1.3,12,2.6,'#1c1812',.6);mcirc(c,0,0,3.9,'#3c362a');break;
    case'oil':wheels(c,[[-9.5,-6.6],[-3,-6.6],[9,-6.6],[-9.5,6.6],[-3,6.6],[9,6.6]],5.4,3.2);mrect(c,-13,-4.6,27,9.2,'#2e2a24',1.5);mrect(c,-12.6,-5.8,18,11.6,u.load?'#4a4038':'#a09a8e',5.8);c.fillStyle='rgba(0,0,0,.3)';for(const x of[-8,-3.5,1])c.fillRect(x,-5.4,.9,10.8);
      c.fillStyle='rgba(255,255,255,.28)';c.fillRect(-10,-3.9,13,1.4);c.fillStyle=col;c.fillRect(-6.2,-5.8,2.6,11.6);mcirc(c,-1.2,0,1.9,'#6a665c');mrect(c,6.4,-5.2,7.6,10.4,'#6b5a3a',2);c.fillStyle='#9ad0ff';c.fillRect(11,-3.8,2,7.6);lights(13.2,3.6);break;
    case'heavy':track(c,-17,-13.5,34,7,a,mv);track(c,-17,6.5,34,7,a,mv);mrect(c,-16,-10.2,32,2.4,'#4e5036',1);mrect(c,-16,7.8,32,2.4,'#4e5036',1);mrect(c,-14.5,-8.5,29,17,'#5e6040',3);mrect(c,7,-7,7,14,'#6c6e4a',2);c.fillStyle=col;c.fillRect(-13.6,-7.6,4.6,15.2);
      c.fillStyle='rgba(0,0,0,.35)';for(let i=0;i<3;i++)c.fillRect(-7.6,-4+i*3,4.6,1.5);mrect(c,-17,-6,3,2.2,'#2a2a26',.6);mrect(c,-17,3.8,3,2.2,'#2a2a26',.6);
      c.rotate(u.tdir-u.dir);mrect(c,6+kick*2,-2.1,16,4.2,'#2e2e22',1);mrect(c,20+kick*2,-3,4,6,'#1c1c14',1);mrect(c,-7.5,-7,15.5,14,'#4c4e34',4.5);mcirc(c,-2,-2.6,2.5,'#3a3c28');mrect(c,-1,3.6,6.5,1.3,'#1c1c14',.4);c.strokeStyle='#1c1c14';c.lineWidth=.6;c.beginPath();c.moveTo(-5,4);c.lineTo(-12,9);c.stroke();break;
    case'art':{track(c,-14,-10.5,26,5.5,a,mv);track(c,-14,5,26,5.5,a,mv);mrect(c,-12.5,-7,23,14,'#6a6648',3);c.fillStyle=col;c.fillRect(-11.6,-6.2,3.8,12.4);mrect(c,-16.5,-5,3.2,10,'#3a3a2c',1);
      c.rotate(u.tdir-u.dir);const rc=u.cd>u.s.cd-.25?-3:0;mrect(c,4+rc,-1.8,23,3.6,'#3a3a2c',1);mrect(c,26+rc,-2.7,3.6,5.4,'#1a1a12',.8);mrect(c,-6,-6,12,12,'#5a5a3e',2);mrect(c,-3,-2.7,6,5.4,'#48483a',1);break}
    case'mbt':{track(c,-21,-16.5,42,8.5,a,mv);track(c,-21,8,42,8.5,a,mv);mrect(c,-19.5,-12.2,39,3,'#4a4c32',1);mrect(c,-19.5,9.2,39,3,'#4a4c32',1);mrect(c,-18,-10,36,20,'#5a5c3e',4);mrect(c,9,-8.5,8.5,17,'#686a48',2.5);c.fillStyle=col;c.fillRect(-17,-9,6,18);
      c.fillStyle='rgba(0,0,0,.35)';for(let i=0;i<4;i++)c.fillRect(-10,-5.6+i*3.2,5,1.6);c.rotate(u.tdir-u.dir);const rc2=u.cd>u.s.cd-.25?-4:0;for(const y of[-5.2,1.6]){mrect(c,6+rc2,y,21,3.6,'#2e2e22',1);mrect(c,25+rc2,y-.7,3.6,5,'#1c1c14',.8)}
      mrect(c,-13,-5.5,8,11,'#44462e',2);mcirc(c,-1,0,10.5,'#4e5034');mcirc(c,-3,-4,2.6,'#3a3c28');mcirc(c,2.5,4,2.2,'#3a3c28');c.strokeStyle='#1c1c14';c.lineWidth=.7;c.beginPath();c.moveTo(-8,5);c.lineTo(-17,11);c.stroke();break}}
  // Glanzlicht von oben links
  c.restore();c.save();c.translate(u.x,u.y);c.scale(usc,usc);if(u.s.air)c.translate(0,-6);const hl=c.createRadialGradient(-u.s.r*.4,-u.s.r*.5,0,0,0,u.s.r*1.1);hl.addColorStop(0,'rgba(255,240,200,.22)');hl.addColorStop(.5,'rgba(255,240,200,0)');c.fillStyle=hl;c.beginPath();c.arc(0,0,u.s.r*1.05,0,7);c.fill();
  if(al){c.strokeStyle=al>1?'#e2bd55':'#c2ccd4';c.lineWidth=al>1?1.8:1.2;for(const o of[Math.PI/2,-Math.PI/2]){c.beginPath();c.arc(0,0,u.s.r*1.02,u.dir+o-.8,u.dir+o+.8);c.stroke()}}
  if(wl&&u.s.dmg){c.save();c.rotate(u.tdir);c.fillStyle=wl>1?'#ff4a2a':'#ffb03a';c.beginPath();c.moveTo(u.s.r+1,-2);c.lineTo(u.s.r+5.5,0);c.lineTo(u.s.r+1,2);c.fill();c.restore()}
  if(time-(u.fT||-9)<.07&&u.s.wpn&&u.s.wpn!=='melee'&&u.s.wpn!=='fire'){const inf=u.s.arm==='inf';c.rotate(u.tdir);const mx=u.s.r+(inf?5:8),my=inf?2:0;c.globalCompositeOperation='lighter';c.fillStyle='#ffe9a0';c.beginPath();for(let i=0;i<8;i++){const an=i*Math.PI/4,rr=i%2?2:(inf?5:9);c.lineTo(mx+Math.cos(an)*rr,my+Math.sin(an)*rr)}c.fill();c.globalCompositeOperation='source-over'}
  c.restore()}}
