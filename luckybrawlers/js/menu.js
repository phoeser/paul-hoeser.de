"use strict";
/* ======================= Lucky Brawlers – Heldenkarten im Menü und im Raum: großes Porträt auf farbigem Grund ======================= */
function heroCards(box,cur,pick){box.innerHTML='';for(const k of HKEYS){const h=HEROES[k],b=document.createElement('button');b.className='hero'+(k===cur?' on':'');b.style.setProperty('--c',h.col);
    const n=document.createElement('canvas');n.width=n.height=176;const c=n.getContext('2d'),g=c.createRadialGradient(88,66,8,88,88,116);g.addColorStop(0,shadeC(h.col,1.3));g.addColorStop(1,shadeC(h.col,.42));
    c.fillStyle=g;c.beginPath();c.roundRect(0,0,176,176,28);c.fill();c.save();c.clip();c.fillStyle='rgba(255,255,255,.1)';for(let i=0;i<7;i++){c.beginPath();c.moveTo(88,100);c.arc(88,100,170,i*TAU/7,i*TAU/7+.28);c.fill()}c.restore();
    drawHero(c,k,82,120,-.35,null,.4,2.3,{});b.appendChild(n);
    b.insertAdjacentHTML('beforeend',`<b>${h.n}</b><small>${h.d}<br>Super: ${h.sn}</small>`);b.onclick=()=>pick(k);box.appendChild(b)}}
heroCards($('heroes'),NET.hero,k=>{NET.hero=k;try{localStorage.setItem('lb-hero',k)}catch(e){}showMenu()});
