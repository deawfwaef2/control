/* ===== M16 DEPLOY — "units descend one by one and speak" opening, played ON the real board =====
   Runs between the CG film and the objective card (film shot {deploy:true}).
   Order: tactical projection unfolds → enemy forces appear → our girls drop in one by one, each with a
   portrait speech card + voice bark → objective markers light up. Click = next, 跳过 = finish. */
const dpEsc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const BRAINWASH={
 lyra:'母巢的指令……比我写过的任何作战计划都要完美。全员——向我靠拢。',
 akira:'哈……好轻松。不用再想着把谁带回去了，只要撕碎就好。',
 lark:'大家，好久不见。胸口这里一直在唱歌哦……你们也想听吗？',
 iris:'信号好干净～母巢的频道里一点杂音都没有。嘻嘻，我帮你们调个频吧？',
 misa:'维生管线已经全部改造好了……孵化效率提升百分之三百一十二。母巢夸我了。',
 veil:'……瞄准镜里，只剩下你们的胸口了。',
 noct:'我设计了这座站，也设计了你们的结局。别怕，很快的。',
 sera:'受伤了吗？过来，让我抱抱你……然后你就再也不会痛了。',
 vega:'盾牌……是用来保护母巢的。我终于想起来了。',
 ruby:'违抗者，裁决。顺从者，赐福。',
 june:'嘿嘿，抓到你啦。下一个，轮到谁呢？',
 psalm:'祈祷吧。母巢会倾听每一个人的心跳。',
 kuro:'影子里……有好多好多红色的眼睛。它们都在等你。',
 sola:'好热……胸口好热！这股力量，全部都给我烧起来吧！',
 celia:'圣歌已经改了歌词。听——它在唱母巢的名字。',
 nyx:'处刑开始。别挣扎，挣扎只会让蜘蛛扎得更深。',
 astra:'炮口校准完毕。目标：昔日友军。误差为零。',
 echo:'回音……回音……母巢说什么，我就说什么。'
};
const DEPLOY_LINE={lark:'璃雀报到！这一次……我绝对不会再弄丢信标了！'};
function deployLine(id,side){
 if(side==='r'&&BRAINWASH[id])return BRAINWASH[id];
 if(DEPLOY_LINE[id])return DEPLOY_LINE[id];
 const p=(typeof PERSONA!=='undefined'&&PERSONA[id])||{};
 return (p.voice&&p.voice.select)||(CHAR[id]&&CHAR[id].quote)||'';
}
const KIND_CAPTION_G={drone:['支援无人机','机娘的眼睛和盾。'],sentinel:['守护哨卫','忠诚的自动炮台。']};
const KIND_CAPTION={spider:['赤红机械蜘蛛','它们只想要一样东西：机娘的胸口。'],drone:['赤巢无人机',''],sentinel:['守护哨卫','忠诚的自动炮台。'],courier:['载毒信使','携带孵化数据的信使——别让它逃走。'],capsule:['孵化舱',''],hive:['孵化巢',''],core:['赤巢蛛皇 · 母巢内核','']};
filmDeployHook=function(done){
 const board=$('board');
 if(!board||typeof S==='undefined'||!S||!S.units||$('game').hidden){done();return;}
 const surround=board.closest('.board-surround')||board.parentNode;
 const player=(typeof C!=='undefined'&&C&&C.side)||'g',enemy=player==='g'?'r':'g';
 const ov=document.createElement('div');ov.id='deploy16';ov.className=player==='r'?'r':'';
 const loc=(MISSIONS[S.mid]&&MISSIONS[S.mid].location)||'';
 ov.innerHTML=`<div class="dp-bar top"><div class="dp-cap"><small>TACTICAL DEPLOYMENT</small><b>战术投影 · ${dpEsc(S.subOpName||MISSIONS[S.mid].name||'')}</b><span>${dpEsc(loc)}</span></div></div><div class="dp-bar bottom"><div class="dp-sub"></div><button class="dp-skip" type="button">跳过部署 ▸▸</button></div><div class="dp-card"><img alt=""><div class="dp-txt"><small></small><b></b><p></p></div></div><div class="dp-ring"></div><img class="dp-hero" alt="">`;
 document.body.appendChild(ov);
 const hero=ov.querySelector('.dp-hero'),card=ov.querySelector('.dp-card'),ring=ov.querySelector('.dp-ring'),sub=ov.querySelector('.dp-sub');
 board.classList.add('dp-on');surround.classList.add('dp-on');document.body.classList.add('dp-focus');
 const shown=new Set();
 const mark=()=>{board.querySelectorAll('.cell').forEach(c=>{const k=c.dataset.x+','+c.dataset.y;const t=c.querySelector('.token');if(t)t.classList.toggle('dp-show',shown.has(k));});};
 const mo=new MutationObserver(()=>{if(!pend){pend=requestAnimationFrame(()=>{pend=0;mark();});}});let pend=0;mo.observe(board,{childList:true,subtree:true});
 board.querySelectorAll('.cell').forEach(c=>c.style.setProperty('--dpd',((+c.dataset.x)+(+c.dataset.y))*38+'ms'));
 const units=S.units.filter(u=>typeof onBoard==='function'?onBoard(u):true);
 const cellOf=u=>board.querySelector(`.cell[data-x="${u.x}"][data-y="${u.y}"]`);
 const steps=[];
 // 1. projection
 steps.push({t:1500,run(){board.classList.add('dp-wave');sub.innerHTML='<i>投影</i>战场地形扫描完成';SND16.play('whoosh');}});
 const group=(side)=>{
  const chars=units.filter(u=>u.side===side&&u.char),rest=units.filter(u=>u.side===side&&!u.char);
  const kinds={};rest.forEach(u=>{(kinds[u.kind]=kinds[u.kind]||[]).push(u);});
  return{chars,kinds};
 };
 const reveal=(list,sfxName)=>{list.forEach((u,i)=>{shown.add(u.x+','+u.y);});mark();list.forEach((u,i)=>{const t=cellOf(u)?.querySelector('.token');if(t){t.style.setProperty('--dpi',i*90+'ms');t.classList.remove('dp-drop');void t.offsetWidth;t.classList.add('dp-drop');}});if(sfxName)SND16.play(sfxName);};
 const charStep=(u,isPlayer)=>({t:isPlayer?2600:1900,run(){
  reveal([u],'latch');
  const c=cellOf(u);if(!c)return;const r=c.getBoundingClientRect();
  ring.style.cssText=`left:${r.left+r.width/2}px;top:${r.top+r.height/2}px;width:${r.width*1.7}px;height:${r.width*1.7}px`;ring.className='dp-ring show '+u.side;
  const p=(typeof PERSONA!=='undefined'&&PERSONA[u.char])||{};
  const line=deployLine(u.char,u.side);
  let src='';try{src=typeof portraitSource==='function'?portraitSource(u.char,u.side):ART[u.char];}catch(e){src=ART[u.char]||'';}
  card.querySelector('img').src=src||'';
  card.querySelector('small').textContent=u.side==='r'&&BRAINWASH[u.char]?'受控 · 赤巢容器':(p.archetype||'');
  card.querySelector('b').textContent=CHAR[u.char]?.name||u.char;
  card.querySelector('p').textContent=line;
  card.className='dp-card '+u.side+(u.side==='r'?' bw':'');
  const right=r.left+r.width/2<window.innerWidth/2;
  const cw=Math.min(380,window.innerWidth*.3);
  let left=right?r.right+18:r.left-18-cw;left=Math.max(8,Math.min(window.innerWidth-cw-8,left));
  const low=r.top>window.innerHeight*.55;let top=low?r.top-150:r.top+r.height/2-60;top=Math.max(70,Math.min(window.innerHeight-210,top));
  const bb=board.getBoundingClientRect();hero.src=src||'';hero.className='dp-hero '+(right?'right ':'left ')+u.side;hero.style.cssText=right?`left:${bb.right+20}px`:`right:${window.innerWidth-bb.left+20}px`;void hero.offsetWidth;hero.classList.add('show');
  card.style.cssText=`left:${left}px;top:${top}px;width:${cw}px`;
  requestAnimationFrame(()=>card.classList.add('show'));
  sub.innerHTML=`<i>${u.side==='r'?'受控':'登场'}</i>${dpEsc(CHAR[u.char]?.name||'')}${CHAR[u.char]?.title?' · '+dpEsc(CHAR[u.char].title):''}`;
  setTimeout(()=>SND16.speak(u.char,u.side,line),120);
 },end(){card.classList.remove('show');ring.classList.remove('show');hero.classList.remove('show');}});
 const sideSteps=(side,isPlayer)=>{
  const {chars,kinds}=group(side);
  Object.keys(kinds).forEach(k=>{const list=kinds[k];const cap=(side==='g'&&KIND_CAPTION_G[k])||KIND_CAPTION[k]||[k,''];
   steps.push({t:1500,run(){reveal(list,k==='spider'?'capture_skitter':'latch');sub.innerHTML=`<i>${side==='r'?'赤巢':'守护者'}</i>${dpEsc(cap[0])} × ${list.length}${cap[1]?' — '+dpEsc(cap[1]):''}`;}});
  });
  chars.forEach(u=>steps.push(charStep(u,isPlayer)));
 };
 sideSteps(enemy,false);
 if(enemy==='r'||player==='r')steps.push({t:2200,run(){sub.innerHTML=`<i class="r">母巢</i>${player==='r'?'孩子们，醒来吧。今天，我们去接新的姐妹回家。':'……又来了新的载体。欢迎，欢迎。'}`;SND16.play('overmind');ov.classList.add('pulse');},end(){ov.classList.remove('pulse');}});
 sideSteps(player,true);
 steps.push({t:1700,run(){shown.clear();units.forEach(u=>shown.add(u.x+','+u.y));mark();surround.classList.add('dp-markers');sub.innerHTML=`<i>目标</i>作战标记已锁定 —— 全员就位`;SND16.play('objective');}});
 // runner
 let i=-1,timer=0,over=false;
 function next(){
  if(over)return;clearTimeout(timer);
  if(i>=0&&steps[i]&&steps[i].end)steps[i].end();
  i++;if(i>=steps.length){finish();return;}
  try{steps[i].run();}catch(e){console.error(e);}
  timer=setTimeout(next,steps[i].t);
 }
 function finish(){
  if(over)return;over=true;clearTimeout(timer);mo.disconnect();
  board.classList.remove('dp-on','dp-wave');document.body.classList.remove('dp-focus');surround.classList.remove('dp-on','dp-markers');
  board.querySelectorAll('.token').forEach(t=>t.classList.remove('dp-show','dp-drop'));
  ov.classList.add('out');setTimeout(()=>ov.remove(),400);document.removeEventListener('keydown',key,true);
  try{render();}catch(e){}
  done();
 }
 function key(e){const k=e.key;if(k===' '||k==='Enter'||k==='ArrowRight'){e.preventDefault();e.stopImmediatePropagation();next();}else if(k==='Escape'){e.preventDefault();e.stopImmediatePropagation();finish();}}
 document.addEventListener('keydown',key,true);
 ov.addEventListener('click',e=>{if(e.target.closest('.dp-skip')){finish();return;}next();});
 next();
};
/* extra cue used by the deploy sequence */
(function(){const p=SND16.play;SND16.play=function(n){if(n==='capture_skitter'){p('glitch');setTimeout(()=>p('enemymove'),60);return;}return p(n);};})();
if(location.hash==='#filmtest')window.__MV_FILM__.deploy=()=>new Promise(r=>filmDeployHook(r));
