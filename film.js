/* ===== M15 FILM PLAYER =====
   Full-screen cinematic scene player. Loaded after audio.js, before film-script.js.
   Shot schema (all optional):
   {bg:'film_orbit', kb:'in|out|left|right|up|push', tint:'dark|abyss|red|cold|blur', black:true,
    stamp:'location/time caption', title:{k,m,s}, hold:ms,
    who:'lyra'|'overmind', side:'g'|'r', pos:'left'|'right', solo:true, name:'override',
    line:'text', mode:'narr|sys|voice|hive', fx:'flash|redflash|shake|static|alert' (space-separated),
    sfx:'cut|pulse|alarm|latch|knock|hit|capture|commit|victory', objective:{title,where,tip,go}}
   NEVER put design notes / requirement text into lines. Lines must read like film dialogue. */
let filmShotHook=null,filmDeployHook=null;
function withDeploy(shots){if(!Array.isArray(shots))return shots;const out=shots.slice();let i=-1;for(let k=out.length-1;k>=0;k--){if(out[k]&&typeof out[k]==='object'&&out[k].objective){i=k;break;}}if(i<0)return shots;out.splice(i,0,{deploy:true});if(shots.film)out.film=true;return out;}
const FILM=(()=>{
 let root=null,st=null,auto=false;
 try{auto=localStorage.getItem('mv-film-auto')==='1';}catch(e){}
 const q=s=>root.querySelector(s);
 function snd(name){try{if(name)sfx(name);}catch(e){}}
 function portrait(id,side){
  if(typeof portraitSource==='function'){try{return portraitSource(id,side);}catch(e){}}
  return side==='r'&&ART[id+'_infected']?ART[id+'_infected']:ART[id];
 }
 function build(){
  if(root)return root;
  root=document.createElement('div');root.id='film';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','剧情演出');
  root.innerHTML=`<div class="fm-stage"><div class="fm-bg" data-l="0"></div><div class="fm-bg" data-l="1"></div><div class="fm-actor left" data-pos="left"><img alt=""></div><div class="fm-actor right" data-pos="right"><img alt=""></div><div class="fm-grade"></div><div class="fm-grain"></div><div class="fm-alert"></div><div class="fm-static"></div><div class="fm-flash"></div><div class="fm-streak"></div><div class="fm-lens"></div></div><div class="fm-bar top"></div><div class="fm-bar bottom"></div><div class="fm-chapter"></div><div class="fm-stamp"></div><div class="fm-sub"><div class="fm-name"></div><div class="fm-line" aria-live="polite"></div></div><div class="fm-title"><div class="k"></div><div class="m"></div><div class="line"></div><div class="s"></div></div><div class="fm-obj"><small></small><h3></h3><div class="where"></div><ol></ol><div class="tip"></div><button class="fm-go" type="button">开始作战</button></div><div class="fm-choices"></div><div class="fm-ctl"><button type="button" data-a="auto" aria-pressed="${auto}">自动播放</button><button type="button" data-a="skip">跳过 ▸▸</button></div><div class="fm-hint">点击 / 空格 继续 ▸</div><div class="fm-progress"></div>`;
  document.body.appendChild(root);
  root.addEventListener('click',e=>{
   if(!st)return;
   const b=e.target.closest('button');
   if(b&&b.dataset.a==='auto'){auto=!auto;b.setAttribute('aria-pressed',String(auto));try{localStorage.setItem('mv-film-auto',auto?'1':'0');}catch(_){}if(auto&&!st.typing)schedule();return;}
   if(b&&b.dataset.a==='skip'){skip();return;}
   if(b&&b.classList.contains('fm-go')){finish();return;}
   if(b&&b.dataset.choice!==undefined&&st.shot&&st.shot.choices){pick(+b.dataset.choice,false);return;}
   if(e.target.closest('.fm-choices'))return;
   if(e.target.closest('.fm-obj'))return;
   advance();
  });
  window.addEventListener('keydown',e=>{
   if(!st||root.hidden)return;
   const k=e.key;
   if(st.deploying)return;
   if(st.choosing&&(k===' '||k==='Enter'||k==='ArrowRight'||k==='Escape')){if(document.activeElement&&document.activeElement.dataset&&document.activeElement.dataset.choice!==undefined&&k!=='ArrowRight'&&k!=='Escape')return;e.preventDefault();e.stopImmediatePropagation();return;}
   if(k===' '||k==='Enter'||k==='ArrowRight'){e.preventDefault();e.stopImmediatePropagation();if(st.objective&&k!=='ArrowRight')finish();else advance();}
   else if(k==='Escape'){e.preventDefault();e.stopImmediatePropagation();skip();}
   else e.stopImmediatePropagation();
  },true);
  return root;
 }
 function clearTimers(){if(!st)return;clearInterval(st.typer);clearTimeout(st.autoT);clearTimeout(st.holdT);clearTimeout(st.choiceT);}
 /* M19: choice resolution. c.next(late) may return more shots to splice in (branching inside one film);
    otherwise the film closes and c.action() runs (legacy). */
 function pick(i,late){
  if(!st||!st.shot||!st.shot.choices)return;const c=st.shot.choices[i];if(!c)return;clearTimeout(st.choiceT);
  if(typeof c.next==='function'){
   const box=q('.fm-choices');box.querySelectorAll('button').forEach((b,j)=>b.classList.toggle('picked',j===i));box.classList.add('resolved');
   let more=null;try{more=c.next(late);}catch(err){console.error(err);}
   if(Array.isArray(more)&&more.length&&st){st.shots.splice(st.i+1,st.shots.length,...more.filter(Boolean));st.choosing=false;setTimeout(()=>{if(!st)return;box.classList.remove('resolved');advance(true);},late?900:420);return;}
   finish();return;
  }
  finish();try{c.action&&c.action();}catch(err){console.error(err);}
 }
 function setBg(shot){
  const layers=[...root.querySelectorAll('.fm-bg')];
  if(shot.black){layers.forEach(l=>l.classList.remove('show'));st.bg=null;return true;}
  if(!shot.bg)return false;
  const tint=shot.tint?` t-${shot.tint}`:'';
  if(shot.bg===st.bg&&!shot.recut){const cur=layers[st.layer];cur.className=cur.className.replace(/ t-\w+/g,'')+tint;return false;}
  const next=layers[1-st.layer],prev=layers[st.layer];
  next.style.backgroundImage=`url("${ART[shot.bg]||''}")`;
  next.style.animation='';next.style.transition='';
  next.className=`fm-bg${tint}`;void next.offsetWidth;
  next.className=`fm-bg show kb-${shot.kb||'in'}${tint}`;
  prev.classList.remove('show');st.layer=1-st.layer;
  if(st.bg){ // M17: varied, motivated cuts instead of one flat crossfade
   const CUTS=['push','zoom','wipe','pushl','iris'];st.cutN=(st.cutN||0)+1;
   const c=shot.cut||(shot.fx&&/alert|shake|flash/.test(shot.fx)?'zoom':CUTS[st.cutN%CUTS.length]);
   const KB={in:'kbIn 22s ease-out',out:'kbOut 22s ease-out',left:'kbLeft 24s linear',right:'kbRight 24s linear',up:'kbUp 24s ease-out',push:'kbPush 9s cubic-bezier(.2,.6,.2,1)'}[shot.kb||'in']||'kbIn 22s ease-out';
   const IN={push:'c17PushIn 1s cubic-bezier(.2,.7,.1,1)',pushl:'c17PushInL 1s cubic-bezier(.2,.7,.1,1)',zoom:'c17ZoomIn .95s cubic-bezier(.2,.8,.2,1)',wipe:'c17Wipe 1.05s cubic-bezier(.7,0,.2,1)',iris:'c17Iris 1.1s cubic-bezier(.6,0,.2,1)'}[c];
   const OUT={push:'c17PushOut 1s cubic-bezier(.5,0,.3,1)',pushl:'c17PushOutL 1s cubic-bezier(.5,0,.3,1)',zoom:'c17ZoomOut .8s cubic-bezier(.6,0,.8,.4)',wipe:'',iris:'c17IrisOut 1.1s ease'}[c];
   if(IN){next.style.animation=`${IN} backwards, ${KB} forwards`;}
   if(OUT)prev.style.animation=`${OUT} forwards`;
   if(c==='wipe'||c==='iris'){next.style.transition='opacity .05s';prev.style.transition='opacity .35s ease .95s';}
   const sk=q('.fm-streak');sk.className='fm-streak';void sk.offsetWidth;sk.className='fm-streak go s-'+c;
  }
  st.bg=shot.bg;return true;
 }
 function clearActors(){root.querySelectorAll('.fm-actor').forEach(a=>{a.className='fm-actor '+a.dataset.pos;a.dataset.id='';});st.last=null;}
 function setActor(shot){
  const actors={left:q('.fm-actor[data-pos=left]'),right:q('.fm-actor[data-pos=right]')};
  const nonActor=!shot.who||shot.who==='overmind'||shot.mode==='narr'||shot.mode==='sys';
  if(nonActor){for(const a of Object.values(actors)){if(a.classList.contains('show')){a.classList.add('dim');a.classList.remove('speaking');}}return;}
  const side=shot.side||(typeof C!=='undefined'&&C.roster?.[shot.who]?.side)||'g';
  const tag=shot.who+':'+side;
  let pos=shot.pos;
  if(!pos){pos=Object.keys(actors).find(p=>actors[p].dataset.id===tag);}
  if(!pos){pos=st.last==='left'?'right':st.last==='right'?'left':(side==='r'?'right':'left');}
  const a=actors[pos],other=actors[pos==='left'?'right':'left'];
  if(a.dataset.id!==tag){
   a.className=`fm-actor ${pos}`;void a.offsetWidth;
   a.querySelector('img').src=portrait(shot.who,side);a.querySelector('img').alt=CHAR[shot.who]?.name||'';
   a.dataset.id=tag;
  }
  a.className=`fm-actor ${pos} show speaking ${side}`;
  if(shot.solo){other.className=`fm-actor ${pos==='left'?'right':'left'}`;other.dataset.id='';}
  else if(other.classList.contains('show')){other.classList.add('dim');other.classList.remove('speaking');}
  st.last=pos;
 }
 function fx(shot){
  root.classList.toggle('alert',/\balert\b/.test(shot.fx||'')||(!!shot.keepAlert&&root.classList.contains('alert')));
  root.classList.toggle('static',/\bstatic\b/.test(shot.fx||''));
  if(/\bshake\b/.test(shot.fx||'')){root.classList.remove('shake');void root.offsetWidth;root.classList.add('shake');}
  const f=q('.fm-flash');
  if(/flash/.test(shot.fx||'')){f.classList.remove('go','red');void f.offsetWidth;f.classList.add('go');if(/redflash/.test(shot.fx))f.classList.add('red');}
  snd(shot.sfx);
 }
 function type(el,text,cb){
  el.innerHTML='';
  if(reducedMotionSafe()||!text){el.textContent=text||'';cb();return;}
  st.typing=true;let i=0;const span=document.createElement('span'),caret=document.createElement('i');caret.className='caret';el.append(span,caret);
  const step=text.length>60?2:1;
  st.typer=setInterval(()=>{i+=step;span.textContent=text.slice(0,i);if(i>=text.length){clearInterval(st.typer);caret.remove();st.typing=false;cb();}},34);
  st.fullText=text;st.lineEl=el;
 }
 function reducedMotionSafe(){try{return typeof reducedMotion!=='undefined'&&reducedMotion;}catch(e){return false;}}
 function ready(){root.classList.add('ready');if(auto)schedule();else if(st&&st.shot&&st.shot.auto&&!st.shot.choices){const me=st.shot;st.autoT=setTimeout(()=>{if(st&&st.shot===me&&!st.typing&&!st.objective&&!st.choosing)advance();},me.auto);}}
 function schedule(){clearTimeout(st.autoT);const len=(st.fullText||'').length;st.autoT=setTimeout(()=>{if(st&&!st.typing&&!st.objective)advance();},1500+len*55);}
 function show(){
  clearTimers();root.classList.remove('ready');
  let shot=st.shots[st.i];
  if(typeof shot==='function')shot=shot();
  if(!shot){advance(true);return;}
  st.shot=shot;
  if(shot.deploy){
   if(typeof filmDeployHook!=='function'){advance(true);return;}
   st.deploying=true;root.classList.add('deploying');clearTimers();const me=st;
   setTimeout(()=>{if(st!==me)return;try{filmDeployHook(()=>{if(st!==me)return;st.deploying=false;root.classList.remove('deploying');advance(true);});}catch(e){console.error(e);st.deploying=false;root.classList.remove('deploying');advance(true);}},450);
   return;
  }
  q('.fm-progress').style.width=`${(st.i+1)/st.shots.length*100}%`;
  const title=q('.fm-title'),sub=q('.fm-sub'),obj=q('.fm-obj');
  obj.classList.remove('show');st.objective=false;st.choosing=false;q('.fm-ctl').style.visibility='';q('.fm-choices').classList.remove('show');q('.fm-choices').innerHTML='';
  const changed=setBg(shot);
  if(changed&&!shot.keep)clearActors();
  if(shot.stamp!==undefined){const s=q('.fm-stamp');s.classList.remove('show');s.textContent=shot.stamp;if(shot.stamp)requestAnimationFrame(()=>s.classList.add('show'));}
  else if(changed||shot.black)q('.fm-stamp').classList.remove('show');
  fx(shot);
  try{filmShotHook&&filmShotHook(shot,changed);}catch(e){}
  if(shot.title){
   title.querySelector('.k').textContent=shot.title.k||'';title.querySelector('.m').textContent=shot.title.m||'';title.querySelector('.s').textContent=shot.title.s||'';
   title.classList.remove('show');void title.offsetWidth;title.classList.add('show');sub.style.opacity=0;
   st.holdT=setTimeout(()=>{if(st&&st.shot===shot)ready();if(st&&st.shot===shot&&!auto)st.holdT=setTimeout(()=>{if(st&&st.shot===shot)advance();},shot.hold||2600);},1500);
   st.fullText='';return;
  }
  title.classList.remove('show');
  if(shot.objective){
   sub.style.opacity=0;root.classList.remove('alert','static');
   const side=(typeof C!=='undefined'&&C.side)||'g';obj.classList.toggle('r',side==='r');
   const o=shot.objective;
   obj.querySelector('small').textContent=side==='r'?'赤巢指令':'作战目标';
   obj.querySelector('h3').textContent=o.title||'';
   obj.querySelector('.where').textContent=o.where||'';
   let goals=o.items;
   if(!goals){try{goals=actGoals(S,side).map(g=>g.text);}catch(e){goals=[];}}
   obj.querySelector('ol').innerHTML=goals.map(t=>`<li>${escHtml(t)}</li>`).join('');
   const tip=obj.querySelector('.tip');tip.textContent=o.tip||'';tip.hidden=!o.tip;
   obj.querySelector('.fm-go').textContent=o.go||(side==='r'?'开始侵蚀':'开始作战');
   setTimeout(()=>{if(st&&st.shot===shot){obj.classList.add('show');obj.querySelector('.fm-go').focus({preventScroll:true});}},250);
   st.objective=true;snd('commit');return;
  }
  sub.style.opacity=1;
  setActor(shot);
  const name=q('.fm-name'),line=q('.fm-line');
  const mode=shot.mode||(shot.who==='overmind'?'hive':'');
  const side=shot.side||(shot.who&&CHAR[shot.who]&&typeof C!=='undefined'&&C.roster?.[shot.who]?.side)||'g';
  let nm=shot.name!==undefined?shot.name:(shot.who==='overmind'?'赤巢':shot.who&&CHAR[shot.who]?CHAR[shot.who].name:'');
  if(mode==='narr')nm=shot.name||'';
  name.className=`fm-name${(side==='r'||shot.who==='overmind'||shot.red)?' r':''}${mode==='sys'?' sys':''}`;
  name.textContent=nm;
  name.classList.toggle('show',!!nm);
  line.className=`fm-line${mode?' '+mode:''}${(shot.red||side==='r'&&mode==='sys')?' r':''}`;
  type(line,shot.line||'',shot.choices?()=>showChoices(shot):ready);
 }
 function showChoices(shot){
  st.choosing=true;q('.fm-ctl').style.visibility='hidden';const box=q('.fm-choices');
  box.innerHTML=shot.choices.map((c,i)=>`<button type="button" data-choice="${i}"><b>${escHtml(c.label||'')}</b>${c.detail?`<small>${escHtml(c.detail)}</small>`:''}</button>`).join('');
  box.classList.remove('resolved','late');
  if(shot.timer>0){const bar=document.createElement('div');bar.className='fm-timer';bar.innerHTML=`<i style="animation-duration:${shot.timer}s"></i><span>犹豫，也是一种选择</span>`;box.appendChild(bar);
   st.choiceT=setTimeout(()=>{if(!st||st.shot!==shot)return;box.classList.add('late');try{sfx('alarm');}catch(e){}pick(shot.timeout||0,true);},shot.timer*1000);}
  requestAnimationFrame(()=>{box.classList.add('show');const f=box.querySelector('button');f&&f.focus({preventScroll:true});});
 }
 function escHtml(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
 function advance(force){
  if(!st)return;
  if(st.typing&&!force){clearInterval(st.typer);st.typing=false;if(st.lineEl)st.lineEl.textContent=st.fullText;if(st.shot&&st.shot.choices&&!st.choosing)showChoices(st.shot);else ready();return;}
  if(st.objective&&!force)return;
  if(st.choosing)return;
  if(st.i<st.shots.length-1){st.i++;show();}else finish();
 }
 function skip(){
  if(!st||st.choosing||(st.shot&&st.shot.choices))return;
  if(st.deploying)return;
  const idx=st.shots.findIndex((s,i)=>i>st.i&&s&&typeof s==='object'&&(s.objective||s.deploy));
  if(idx>=0&&!st.objective){st.i=idx;show();return;}
  finish();
 }
 function finish(){
  if(!st)return;clearTimers();const done=st.onDone;st=null;
  root.classList.add('exit17');root.classList.remove('on','alert','static','ready');
  try{document.body.classList.remove('arrive17');void document.body.offsetWidth;document.body.classList.add('arrive17');setTimeout(()=>document.body.classList.remove('arrive17'),2200);}catch(e){}
  setTimeout(()=>{if(!st){root.classList.remove('exit17');root.hidden=true;const cin=document.getElementById('cinema');if(cin){cin.hidden=true;cin.classList.remove('film-proxy');}}},1300);
  try{window.scrollTo(0,0);document.scrollingElement&&(document.scrollingElement.scrollTop=0);}catch(e){}
  try{done&&done();}catch(e){console.error(e);}
 }
 function play(shots,onDone,opts={}){
  build();
  if(st){clearTimers();}
  const list=(shots||[]).filter(Boolean);
  if(!list.length){onDone&&onDone();return;}
  st={shots:list,i:0,onDone,layer:0,bg:null,last:null,typing:false};
  root.querySelectorAll('.fm-bg').forEach(l=>{l.className='fm-bg';l.style.backgroundImage='';l.style.animation='';l.style.transition='';});
  clearActors();q('.fm-stamp').classList.remove('show');q('.fm-title').classList.remove('show');q('.fm-obj').classList.remove('show');
  q('.fm-chapter').textContent=opts.chapter||'';
  const cin=document.getElementById('cinema');if(cin){cin.classList.add('film-proxy');cin.hidden=false;}
  ['toast','capture-event'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('show');});
  root.classList.remove('exit17');root.hidden=false;void root.offsetWidth;root.classList.add('on');
  show();
 }
 return{play,skip,finish,get active(){return !!st;}};
})();
