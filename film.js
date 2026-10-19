/* ===== M15 FILM PLAYER =====
   Full-screen cinematic scene player. Loaded after audio.js, before film-script.js.
   Shot schema (all optional):
   {bg:'film_orbit', kb:'in|out|left|right|up|push', tint:'dark|abyss|red|cold|blur', black:true,
    stamp:'location/time caption', title:{k,m,s}, hold:ms,
    who:'lyra'|'overmind', side:'g'|'r', pos:'left'|'right', solo:true, name:'override',
    line:'text', mode:'narr|sys|voice|hive', fx:'flash|redflash|shake|static|alert' (space-separated),
    sfx:'cut|pulse|alarm|latch|knock|hit|capture|commit|victory', objective:{title,where,tip,go}}
   NEVER put design notes / requirement text into lines. Lines must read like film dialogue. */
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
  root.innerHTML=`<div class="fm-stage"><div class="fm-bg" data-l="0"></div><div class="fm-bg" data-l="1"></div><div class="fm-actor left" data-pos="left"><img alt=""></div><div class="fm-actor right" data-pos="right"><img alt=""></div><div class="fm-grade"></div><div class="fm-grain"></div><div class="fm-alert"></div><div class="fm-static"></div><div class="fm-flash"></div></div><div class="fm-bar top"></div><div class="fm-bar bottom"></div><div class="fm-chapter"></div><div class="fm-stamp"></div><div class="fm-sub"><div class="fm-name"></div><div class="fm-line" aria-live="polite"></div></div><div class="fm-title"><div class="k"></div><div class="m"></div><div class="line"></div><div class="s"></div></div><div class="fm-obj"><small></small><h3></h3><div class="where"></div><ol></ol><div class="tip"></div><button class="fm-go" type="button">开始作战</button></div><div class="fm-ctl"><button type="button" data-a="auto" aria-pressed="${auto}">自动播放</button><button type="button" data-a="skip">跳过 ▸▸</button></div><div class="fm-hint">点击 / 空格 继续 ▸</div><div class="fm-progress"></div>`;
  document.body.appendChild(root);
  root.addEventListener('click',e=>{
   if(!st)return;
   const b=e.target.closest('button');
   if(b&&b.dataset.a==='auto'){auto=!auto;b.setAttribute('aria-pressed',String(auto));try{localStorage.setItem('mv-film-auto',auto?'1':'0');}catch(_){}if(auto&&!st.typing)schedule();return;}
   if(b&&b.dataset.a==='skip'){skip();return;}
   if(b&&b.classList.contains('fm-go')){finish();return;}
   if(e.target.closest('.fm-obj'))return;
   advance();
  });
  window.addEventListener('keydown',e=>{
   if(!st||root.hidden)return;
   const k=e.key;
   if(k===' '||k==='Enter'||k==='ArrowRight'){e.preventDefault();e.stopImmediatePropagation();if(st.objective&&k!=='ArrowRight')finish();else advance();}
   else if(k==='Escape'){e.preventDefault();e.stopImmediatePropagation();skip();}
   else e.stopImmediatePropagation();
  },true);
  return root;
 }
 function clearTimers(){if(!st)return;clearInterval(st.typer);clearTimeout(st.autoT);clearTimeout(st.holdT);}
 function setBg(shot){
  const layers=[...root.querySelectorAll('.fm-bg')];
  if(shot.black){layers.forEach(l=>l.classList.remove('show'));st.bg=null;return true;}
  if(!shot.bg)return false;
  const tint=shot.tint?` t-${shot.tint}`:'';
  if(shot.bg===st.bg&&!shot.recut){const cur=layers[st.layer];cur.className=cur.className.replace(/ t-\w+/g,'')+tint;return false;}
  const next=layers[1-st.layer],prev=layers[st.layer];
  next.style.backgroundImage=`url("${ART[shot.bg]||''}")`;
  next.className=`fm-bg${tint}`;void next.offsetWidth;
  next.className=`fm-bg show kb-${shot.kb||'in'}${tint}`;
  prev.classList.remove('show');st.layer=1-st.layer;st.bg=shot.bg;return true;
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
 function ready(){root.classList.add('ready');if(auto)schedule();}
 function schedule(){clearTimeout(st.autoT);const len=(st.fullText||'').length;st.autoT=setTimeout(()=>{if(st&&!st.typing&&!st.objective)advance();},1500+len*55);}
 function show(){
  clearTimers();root.classList.remove('ready');
  let shot=st.shots[st.i];
  if(typeof shot==='function')shot=shot();
  if(!shot){advance(true);return;}
  st.shot=shot;
  q('.fm-progress').style.width=`${(st.i+1)/st.shots.length*100}%`;
  const title=q('.fm-title'),sub=q('.fm-sub'),obj=q('.fm-obj');
  obj.classList.remove('show');st.objective=false;
  const changed=setBg(shot);
  if(changed&&!shot.keep)clearActors();
  if(shot.stamp!==undefined){const s=q('.fm-stamp');s.classList.remove('show');s.textContent=shot.stamp;if(shot.stamp)requestAnimationFrame(()=>s.classList.add('show'));}
  else if(changed||shot.black)q('.fm-stamp').classList.remove('show');
  fx(shot);
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
  type(line,shot.line||'',ready);
 }
 function escHtml(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
 function advance(force){
  if(!st)return;
  if(st.typing&&!force){clearInterval(st.typer);st.typing=false;if(st.lineEl)st.lineEl.textContent=st.fullText;ready();return;}
  if(st.objective&&!force)return;
  if(st.i<st.shots.length-1){st.i++;show();}else finish();
 }
 function skip(){
  if(!st)return;
  const idx=st.shots.findIndex((s,i)=>i>st.i&&s&&typeof s==='object'&&s.objective);
  if(idx>=0&&!st.objective){st.i=idx;show();return;}
  finish();
 }
 function finish(){
  if(!st)return;clearTimers();const done=st.onDone;st=null;
  root.classList.remove('on','alert','static','ready');
  setTimeout(()=>{if(!st){root.hidden=true;const cin=document.getElementById('cinema');if(cin){cin.hidden=true;cin.classList.remove('film-proxy');}}},600);
  try{window.scrollTo(0,0);document.scrollingElement&&(document.scrollingElement.scrollTop=0);}catch(e){}
  try{done&&done();}catch(e){console.error(e);}
 }
 function play(shots,onDone,opts={}){
  build();
  if(st){clearTimers();}
  const list=(shots||[]).filter(Boolean);
  if(!list.length){onDone&&onDone();return;}
  st={shots:list,i:0,onDone,layer:0,bg:null,last:null,typing:false};
  root.querySelectorAll('.fm-bg').forEach(l=>{l.className='fm-bg';l.style.backgroundImage='';});
  clearActors();q('.fm-stamp').classList.remove('show');q('.fm-title').classList.remove('show');q('.fm-obj').classList.remove('show');
  q('.fm-chapter').textContent=opts.chapter||'';
  const cin=document.getElementById('cinema');if(cin){cin.classList.add('film-proxy');cin.hidden=false;}
  ['toast','capture-event'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('show');});
  root.hidden=false;void root.offsetWidth;root.classList.add('on');
  show();
 }
 return{play,skip,finish,get active(){return !!st;}};
})();
