/* ===== M17 BOARD CHAT — speech bubbles above the pieces, conversations, tactical call-outs =====
   boardSay(id,text,{side,hold})  · boardConvo([[id,text],…])
   Every combat subtitle (filmCombatSub) is redirected here when the speaker is on the board. */
const BUB17=(()=>{
 const layer=document.createElement('div');layer.id='bub17';document.body.appendChild(layer);
 const live=[];let queue=[],playing=false,convoToken=0;
 const unitOf=id=>typeof S!=='undefined'&&S&&S.units?S.units.find(u=>u.char===id&&(typeof onBoard!=='function'||onBoard(u))):null;
 const cellOf=u=>u&&document.querySelector(`#board .cell[data-x="${u.x}"][data-y="${u.y}"]`);
 const blocked=()=>{const f=document.getElementById('film');return(f&&f.classList.contains('on')&&!f.classList.contains('deploying'))||document.getElementById('deploy16')||!$('modal').hidden||$('game').hidden;};
 function place(b){
  const u=b._uid?S&&S.units.find(v=>v.uid===b._uid):null;const c=cellOf(u);
  if(!c){b.classList.add('gone');return;}
  const r=c.getBoundingClientRect(),w=b.offsetWidth,h=b.offsetHeight;
  let x=r.left+r.width/2-w/2,y=r.top-h-6;let below=false;
  if(y<(document.querySelector('.site-header')?.offsetHeight||50)+4){y=r.bottom+6;below=true;}
  x=Math.max(8,Math.min(window.innerWidth-w-8,x));
  b.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px)`;b.classList.toggle('below',below);
  b.style.setProperty('--ax',Math.round(r.left+r.width/2-x)+'px');
 }
 function say(id,text,opt={}){
  if(!text||blocked())return null;const u=unitOf(id);if(!u)return null;
  // one bubble per speaker; at most 2 on screen
  for(const b of live.slice())if(b._id===id)kill(b,true);
  while(live.length>=2)kill(live[0],true);
  const b=document.createElement('div');b.className='b17 '+(u.side==='r'?'r':'g');b._id=id;b._uid=u.uid;
  const nm=(CHAR[id]&&CHAR[id].name)||'';
  b.innerHTML=`<b>${nm}</b><p></p>`;layer.appendChild(b);live.push(b);
  const p=b.querySelector('p');p.textContent=text;place(b);p.textContent='';
  requestAnimationFrame(()=>b.classList.add('show'));
  let i=0;const step=()=>{if(!b.isConnected)return;i+=1;p.textContent=text.slice(0,i);place(b);if(i<text.length)b._t=setTimeout(step,28);};step();
  if(!opt.silent)try{SND16.speak(id,u.side,text,opt.emo);}catch(e){}
  const hold=opt.hold||Math.min(5200,1500+text.length*85);
  b._k=setTimeout(()=>kill(b),hold);
  return b;
 }
 function kill(b,fast){clearTimeout(b._t);clearTimeout(b._k);const i=live.indexOf(b);if(i>=0)live.splice(i,1);b.classList.remove('show');b.classList.add('out');setTimeout(()=>b.remove(),fast?120:300);}
 function clear(){live.slice().forEach(b=>kill(b,true));queue=[];convoToken++;playing=false;}
 async function convo(lines){
  lines=lines.filter(([id])=>unitOf(id));if(lines.length<2)return false;
  const tok=++convoToken;playing=true;
  for(const [id,text,emo] of lines){
   if(tok!==convoToken)return false;
   while(blocked()&&tok===convoToken)await new Promise(r=>setTimeout(r,300));
   say(id,text,{emo,hold:Math.min(6000,2300+text.length*90)});
   await new Promise(r=>setTimeout(r,Math.min(4200,1100+text.length*75)));
  }
  if(tok===convoToken)playing=false;return true;
 }
 setInterval(()=>{for(const b of live)place(b);},200);
 window.addEventListener('resize',()=>{for(const b of live)place(b);});
 return{say,convo,clear,get busy(){return playing||live.length>0;},unitOf};
})();
function boardSay(id,text,opt){return BUB17.say(id,text,opt);}

/* redirect combat subtitles into bubbles */
(function(){
 if(typeof filmCombatSub!=='function')return;
 const base=filmCombatSub;
 filmCombatSub=function(name,line,side){
  let id=null;try{id=Object.keys(CHAR).find(c=>CHAR[c].name===name);}catch(e){}
  if(id&&BUB17.unitOf(id)){BUB17.say(id,line,{silent:true});return;}
  base(name,line,side);
 };
 // richer, personality-specific lines for the existing systems
 try{for(const id of Object.keys(CAST17)){FILM_BARKS[id]=CAST17[id].kill.slice();}}catch(e){}
 try{for(const id of Object.keys(CAST17)){if(typeof BRAINWASH!=='undefined'&&!BRAINWASH[id])BRAINWASH[id]=CAST17[id].bw[0];}}catch(e){}
})();

/* ---------- the brain: who talks, when, about what ---------- */
const TALK17=(()=>{
 const used=new Set();let lastLostCount=0,lastTalkRound=-1;
 const pick=a=>a[Math.floor(Math.random()*a.length)];
 const name=id=>(CHAR[id]&&CHAR[id].name)||id;
 const onB=(side)=>S.units.filter(u=>u.char&&u.side===side&&(typeof onBoard!=='function'||onBoard(u)));
 const coord=(x,y)=>typeof xy==='function'?xy(x,y):`${x},${y}`;
 function lostIds(){try{return (typeof filmLost==='function'?filmLost():[]).filter(id=>CHAR[id]);}catch(e){return[];}}
 function tactical(){
  const me=C.side,foe=me==='g'?'r':'g';
  const threats=threatMap(S,foe);
  const mine=onB(me).filter(u=>threats.has(key(u.x,u.y))&&!u.used);
  if(!mine.length)return null;
  const v=mine[0];
  const attacker=S.units.find(a=>a.side===foe&&(typeof onBoard!=='function'||onBoard(a))&&legalMoves(S,a,'threat').some(m=>m.x===v.x&&m.y===v.y));
  const safe=legalMoves(S,v).filter(m=>!m.capture&&!threats.has(key(m.x,m.y)));
  const friends=onB(me).filter(u=>u.uid!==v.uid);
  const bond=(typeof BW_BOND!=='undefined'&&BW_BOND[v.char])||[];
  const caller=friends.find(f=>bond.includes(f.char))||friends.find(f=>['lyra','iris','astra','vega'].includes(f.char))||friends[0];
  const infect=attacker&&attacker.kind==='spider'&&attacker.side==='r'&&me==='g';
  const aName=attacker?(attacker.char?name(attacker.char):infect?'赤蛛':'敌机'):'敌人';
  if(me==='g'){
   if(!caller)return[[v.char,pick(CAST17[v.char]?.danger||['它在盯着我……'])]];
   const s=safe.length?safe.sort((a,b)=>Math.abs(a.y-v.y)-Math.abs(b.y-v.y))[0]:null;
   const l1=s?`${name(v.char)}，${attacker?coord(attacker.x,attacker.y)+'那只':''}${aName}下一步就能${infect?'扑到你的胸口':'打到你'}——退到 ${coord(s.x,s.y)}！`:`${name(v.char)}，你被${aName}盯上了，周围没有安全格……找人掩护！`;
   return[[caller.char,l1,'shock'],[v.char,s?pick(['收到！','明、明白！','……知道了。','谢啦！']):pick(CAST17[v.char]?.danger||['……'])]];
  }
  return null;
 }
 function hiveTactical(){
  if(C.side!=='r')return null;
  const prey=S.units.filter(g=>g.char&&g.side==='g'&&(typeof onBoard!=='function'||onBoard(g)));
  for(const sp of S.units.filter(u=>u.kind==='spider'&&u.side==='r'&&(typeof onBoard!=='function'||onBoard(u)))){
   const hit=legalMoves(S,sp).find(m=>m.capture&&prey.some(g=>g.x===m.x&&g.y===m.y));
   if(hit){const g=prey.find(g=>g.x===hit.x&&g.y===hit.y);const voice=onB('r').find(u=>u.char);
    const line=`${coord(sp.x,sp.y)} 的孩子，离 ${name(g.char)} 的胸口只差一步了。`;
    if(voice)return[[voice.char,line,'laugh']];
    filmCombatSub('赤巢',line,'r');return [];}
  }
  return null;
 }
 function confront(){
  const lost=lostIds();const taken=onB('r').filter(u=>lost.includes(u.char));
  for(const t of taken){
   for(const g of onB('g')){
    const k=`${t.char}>${g.char}`;if(CONFRONT17[k]&&!used.has(k)){used.add(k);return CONFRONT17[k];}
   }
  }
  // generic confrontation with a bond friend
  for(const t of taken){
   const bond=(typeof BW_BOND!=='undefined'&&BW_BOND[t.char])||[];const f=onB('g').find(g=>bond.includes(g.char));
   const k=`gen>${t.char}>${f&&f.char}`;
   if(f&&!used.has(k)){used.add(k);return[[f.char,`${name(t.char)}……是我啊。你还认得我吗？`,'sad'],[t.char,pick(CAST17[t.char]?.bw||['……认得哦。']),'laugh'],[f.char,pick(['……我会把你带回来的。哪怕只剩名字。','对不起……我要开枪了。','别用她的脸笑！']),'sad']];}
  }
  return null;
 }
 function banter(ctx){
  const me=C.side;const here=new Set(onB(me).map(u=>u.char));
  const pool=BANTER17.filter(b=>b.ctx===ctx&&b.who.every(w=>here.has(w))&&!used.has(b.lines[0][1]));
  if(!pool.length)return null;const b=pick(pool);used.add(b.lines[0][1]);return b.lines;
 }
 function lostLine(){
  const lost=lostIds();if(lost.length<=lastLostCount){lastLostCount=lost.length;return null;}
  lastLostCount=lost.length;const who=lost[lost.length-1];
  const bond=(typeof BW_BOND!=='undefined'&&BW_BOND[who])||[];const f=onB(C.side).find(u=>bond.includes(u.char))||onB(C.side)[0];
  if(!f||C.side!=='g')return null;
  const b=banter('lost');if(b)return b;
  return[[f.char,pick(CAST17[f.char]?.lost||['……']),'sad']];
 }
 function turnStart(){
  if(!S||S.outcome||S.phase!=='player'||lastTalkRound===S.round)return;lastTalkRound=S.round;
  setTimeout(()=>{
   if(!S||S.phase!=='player'||S.outcome)return;
   const lines=tactical()||hiveTactical()||lostLine()||confront()||(Math.random()<.6?banter(onB(C.side).some(u=>threatMap(S,C.side==='g'?'r':'g').has(key(u.x,u.y)))?'danger':'idle'):null);
   if(!lines||!lines.length)return;if(lines.length===1)BUB17.say(lines[0][0],lines[0][1],{emo:lines[0][2]});else BUB17.convo(lines);
  },900);
 }
 return{turnStart,used};
})();
(function(){
 const ep=endPhase;
 endPhase=async function(){const r=await ep.apply(this,arguments);try{TALK17.turnStart();}catch(e){console.error(e);}return r;};
 // first turn of a mission: after the film/deploy closes
 const obs=new MutationObserver(()=>{const f=document.getElementById('film');if(f&&!f.classList.contains('on')&&S&&S.round===1&&S.phase==='player')setTimeout(()=>{try{TALK17.turnStart();}catch(e){}},1200);});
 const f=document.getElementById('film');if(f)obs.observe(f,{attributes:true,attributeFilter:['class']});
})();
/* use the cast bible in the older reaction systems */
(function(){
 try{
  if(typeof NEAR_SPIDER!=='undefined'){NEAR_SPIDER.length=0;NEAR_SPIDER.push('它靠过来了……！','别、别过来！','胸口……它盯着我的胸口！');}
  if(typeof BW_CHATTER!=='undefined'){/* keep generic pool, bubbles prefer personal lines below */}
  for(const id of Object.keys(CAST17)){if(typeof PERSONA!=='undefined'&&PERSONA[id]&&PERSONA[id].voice){PERSONA[id].voice.move=CAST17[id].move[0];}}
 }catch(e){}
})();
if(location.hash==='#filmtest')Object.assign(window.__MV_FILM__,{say:(id,t)=>boardSay(id,t),convo:l=>BUB17.convo(l),turn:()=>{TALK17.turnStart();},banter:()=>{const b=BANTER17.find(b=>b.who.every(w=>BUB17.unitOf(w)));return b?BUB17.convo(b.lines):null;}});
if(location.hash==='#filmtest')Object.assign(window.__MV_FILM__,{
 st:()=>({round:S&&S.round,phase:S&&S.phase,side:C&&C.side}),
 step:()=>{const u=S.units.find(v=>v.side===C.side&&!v.used&&v.char&&legalMoves(S,v).some(m=>!m.capture));if(!u)return 0;handleCell(u.x,u.y);const m=legalMoves(S,u).find(m=>!m.capture);handleCell(m.x,m.y);return u.char;},
 end:()=>endPhase()});
