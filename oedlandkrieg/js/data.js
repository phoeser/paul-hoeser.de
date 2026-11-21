"use strict";
/* ======================= Grunddaten ======================= */
const T=32;let MW=64,MH=64;
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>v<a?a:v>b?b:v,rnd=Math.random,dist=(a,b,c,d)=>Math.hypot(a-c,b-d);
let seed=1;const srand=s=>{seed=(s>>>0)||1},sr=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const ARM={bullet:{inf:1,light:.55,heavy:.22,bld:.22,air:.5},rocket:{inf:.4,light:1.15,heavy:1,bld:.9,air:1.25},cannon:{inf:.7,light:1,heavy:1,bld:1.1,air:0},melee:{inf:1.3,light:.85,heavy:.45,bld:.35,air:0},laser:{inf:1,light:1.1,heavy:1.1,bld:1,air:.8},fire:{inf:1.5,light:.7,heavy:.3,bld:.9,air:0},shell:{inf:1,light:1,heavy:.9,bld:1.4,air:0}};
const U={
 inf:{hp:70,spd:34,rng:4.2,dmg:9,wpn:'bullet',cd:.9,cost:100,time:6,arm:'inf',r:6,sight:6.5,from:'bar'},
 rkt:{hp:60,spd:30,rng:5,dmg:34,wpn:'rocket',cd:2.3,cost:220,time:9,arm:'inf',r:6,sight:6.5,from:'bar'},
 scout:{hp:90,spd:100,rng:3.5,dmg:5,wpn:'bullet',cd:.5,cost:150,time:5,arm:'light',r:8,sight:10,from:'bar'},
 flame:{hp:110,spd:30,rng:2.3,dmg:15,wpn:'fire',cd:.35,cost:260,time:9,arm:'inf',r:6,sight:6,from:'bar',req:['pow']},
 med:{hp:75,spd:36,rng:0,dmg:0,cost:200,time:8,arm:'inf',r:6,sight:6,from:'bar',req:['rep'],heal:10},
 fast:{hp:160,spd:85,rng:4,dmg:8,wpn:'bullet',cd:.4,cost:320,time:10,arm:'light',r:11,sight:7,from:'fac'},
 oil:{hp:280,spd:46,rng:0,dmg:0,cost:450,time:12,arm:'light',r:12,sight:5,from:'fac'},
 heavy:{hp:480,spd:32,rng:5.5,dmg:52,wpn:'cannon',cd:2.4,cost:700,time:18,arm:'heavy',r:15,sight:7,from:'fac',lvl:2},
 art:{hp:200,spd:24,rng:11,min:3,dmg:62,wpn:'shell',cd:4.5,cost:900,time:20,arm:'light',r:13,sight:7,from:'fac',req:['rad']},
 mbt:{hp:1300,spd:26,rng:6,dmg:85,wpn:'cannon',cd:2.6,cost:1600,time:30,arm:'heavy',r:19,sight:7,from:'fac',req:['lab']},
 heli:{hp:320,spd:95,rng:5,dmg:24,wpn:'rocket',cd:1.3,cost:1100,time:22,arm:'air',r:14,sight:9,from:'air',air:true},
 elite:{hp:950,spd:40,rng:6.5,dmg:75,wpn:'laser',cd:1.5,arm:'heavy',r:17,sight:8,cost:0}
};
// pw: Strombedarf (negativ = erzeugt Strom)
const B={
 hq:{w:3,h:3,hp:2200,cost:0,time:0,sight:8,pw:-50},
 pow:{w:2,h:2,hp:700,cost:300,time:8,sight:4,req:['hq'],pw:-100},
 ref:{w:3,h:3,hp:1100,cost:800,time:14,sight:5,req:['hq'],pw:30},
 der:{w:2,h:2,hp:550,cost:500,time:9,sight:5,req:['ref'],pw:10},
 bar:{w:2,h:2,hp:750,cost:400,time:10,sight:5,req:['hq'],pw:20},
 wall:{w:1,h:1,hp:900,cost:40,time:.3,sight:1,req:['bar'],pw:0},
 tow:{w:1,h:1,hp:700,cost:450,time:9,sight:7,req:['bar'],rng:6,dmg:15,wpn:'bullet',cd:.55,pw:15},
 fac:{w:3,h:3,hp:1200,cost:1000,time:18,sight:5,req:['ref'],pw:40},
 sil:{w:2,h:2,hp:600,cost:500,time:9,sight:4,req:['ref'],pw:10},
 scr:{w:2,h:2,hp:700,cost:700,time:12,sight:4,req:['ref'],pw:20},
 rep:{w:2,h:2,hp:900,cost:600,time:12,sight:5,req:['fac'],pw:30},
 ctow:{w:2,h:2,hp:1600,cost:800,time:14,sight:8,req:['fac'],rng:7,dmg:60,wpn:'cannon',cd:2.2,pw:25},
 rad:{w:2,h:2,hp:800,cost:700,time:14,sight:12,req:['fac','pow'],pw:40},
 rtow:{w:1,h:1,hp:900,cost:650,time:12,sight:9,req:['rad'],rng:8,dmg:38,wpn:'rocket',cd:1.8,pw:30},
 air:{w:3,h:3,hp:1000,cost:1200,time:20,sight:6,req:['rad'],pw:40},
 lab:{w:3,h:3,hp:1200,cost:1500,time:25,sight:5,req:['rad','rep'],pw:60},
 sup:{w:3,h:3,hp:1800,cost:2500,time:35,sight:5,req:['lab'],pw:80,charge:300},
 tech:{w:2,h:2,hp:99999,sight:0}
};
const BORDER=['pow','ref','der','bar','wall','tow','fac','sil','scr','rep','ctow','rad','rtow','air','lab','sup'],UORDER=['inf','rkt','scout','flame','med','fast','oil','heavy','art','mbt','heli'];
const PRODB=['bar','fac','air'];
const FAC={
 bunker:{name:'Bunkerleute',
  u:{inf:'Gewehrschütze',rkt:'Bazooka-Trupp',scout:'Motorrad-Späher',flame:'Flammenwerfer',med:'Sanitäter',fast:'Kampfbuggy',heavy:'Kettenpanzer',oil:'Tanklaster',art:'Haubitze',mbt:'Mammutpanzer',heli:'Kampfhubschrauber',elite:'Laser-Prototyp'},
  b:{hq:'Bunker-Kommando',pow:'Kraftwerk',ref:'Raffinerie',der:'Bohrturm',bar:'Kaserne',wall:'Betonmauer',tow:'MG-Turm',fac:'Panzerwerk',sil:'Öltank-Lager',scr:'Schrottpresse',rep:'Werkstatt',ctow:'Kanonenbunker',rad:'Radarstation',rtow:'Raketenturm',air:'Helipad',lab:'Forschungslabor',sup:'Atomraketensilo',tech:'Tech-Bunker'},
  sup:'Atomrakete',mod:{}},
 mutant:{name:'Mutanten',
  u:{inf:'Plünderer',rkt:'Raketen-Irrer',scout:'Rattenreiter',flame:'Feuerteufel',med:'Knochenflicker',fast:'Hyänenreiter',heavy:'Kriegsmammut',oil:'Ölochse',art:'Katapult-Echse',mbt:'Behemoth',heli:'Riesengeier',elite:'Riesenskorpion'},
  b:{hq:'Häuptlingsfestung',pow:'Strahlenkessel',ref:'Ölkocherei',der:'Ölpumpe',bar:'Schlägergrube',wall:'Schrottwall',tow:'Schrottturm',fac:'Bestienzucht',sil:'Ölgrube',scr:'Schrottmühle',rep:'Flickbude',ctow:'Felsschleuder',rad:'Ausguck',rtow:'Raketennest',air:'Geierhorst',lab:'Mutationsgrube',sup:'Seuchenkessel',tech:'Tech-Bunker'},
  sup:'Seuchenbombe',mod:{inf:{hp:88,cost:90,rng:3.6,dmg:11},rkt:{hp:74},scout:{hp:100},flame:{hp:125},fast:{wpn:'melee',rng:1.3,dmg:20,cd:.8,hp:180,spd:78},heavy:{hp:570,spd:29},mbt:{wpn:'melee',rng:1.7,dmg:150,cd:1.6,hp:1500,spd:30},heli:{hp:340},elite:{wpn:'melee',rng:1.8,dmg:110,cd:1.3,hp:1050,spd:46}}}
};
// Einheitenart für Heilung: biologisch?
const organic=u=>u.s.arm==='inf'||(sides[u.side].fac==='mutant'&&u.type!=='oil'&&u.type!=='elite');
const DIFF={easy:{inc:.5,first:480,wave:3,grow:1,mix:0,maxw:10,think:1.5,gap:150,cap:18,name:'Leicht'},normal:{inc:.75,first:340,wave:4,grow:1,mix:.08,maxw:16,think:1.15,gap:110,cap:28,name:'Normal'},hard:{inc:.95,first:240,wave:5,grow:2,mix:.18,maxw:22,think:1,gap:80,cap:40,name:'Schwer'},brutal:{inc:1.25,first:170,wave:6,grow:2,mix:.28,maxw:28,think:.9,gap:60,cap:55,name:'Brutal'}};
const COL=['#e6a92a','#c8352c','#3a8ee0','#a45ad8'],CNAME=['Gelb','Rot','Blau','Lila'];
const BUPG=['ref','der','bar','fac','tow','pow','ctow','rtow','rep','scr'];const bupCost=b=>Math.round(B[b.type].cost*.6*b.lvl),bupTime=b=>8+b.lvl*6;
const RES={infW:{at:'bar',n:'Waffen Fußtruppen',ic:'🔫',c:[350,700],t:[18,26]},infA:{at:'bar',n:'Panzerung Fußtruppen',ic:'🛡',c:[300,600],t:[16,24]},vehW:{at:'fac',n:'Waffen Fahrzeuge & Bestien',ic:'💥',c:[500,1000],t:[22,30]},vehA:{at:'fac',n:'Panzerung Fahrzeuge & Bestien',ic:'🛡',c:[450,900],t:[20,28]}};
const ROM=['','I','II'];
const isInf=u=>u.s.arm==='inf';const techW=u=>u.k==='u'?1+.15*(sides[u.side].tech[isInf(u)?'infW':'vehW']||0):1,techA=u=>u.k==='u'?1+.15*(sides[u.side].tech[isInf(u)?'infA':'vehA']||0):1;
function stat(side,type){return Object.assign({},U[type],FAC[sides[side].fac].mod[type]||{})}

/* ======================= Zustand ======================= */
let me=0;const NET={on:false,host:false,client:false};
let tiles,occ,expl,vis,wallMap,ents=[],nextId=1,sides=[],time=0,speed=1,paused=true,over=false,cfg={fac:'bunker',diff:'normal',size:64,players:2};
let terrainC,decalC,decalX,miniBase,camX=0,camY=0,zoom=1,sel=[],placing=null,atkMode=false,boxMode=false,groups={};
let projs=[],tracers=[],parts=[],pathQ=[],visT=0,aiT=0,msgT={},nukes=[],supMode=null,shake=0,pwT=0;
const power=S=>{let p=0,u=0;for(const b of ents)if(!b.dead&&b.k==='b'&&b.side===S.id){const w=B[b.type].pw||0;if(w<0)p-=w*(1+(b.lvl-1)*.5);else u+=w}return{p,u,low:u>p}};
const pf=S=>S.pw&&S.pw.low?.5:1;
const blocked=(x,y)=>x<0||y<0||x>=MW||y>=MH||tiles[y*MW+x]===1||occ[y*MW+x]>0;
