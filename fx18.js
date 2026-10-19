/* ===== M18 FX — reliable battle audio, no pop-up panels, cinematic board FX =====
   Loaded LAST. Only wraps/extends existing systems (see handoff.md M18):
   1) AUD18: own WebAudio SFX engine. Sounds are SCHEDULED even while the context
      is suspended (they start on resume) instead of being silently dropped —
      that drop was why moving/fighting often had no sound, esp. on mobile.
   2) No pop-ups while battling: toast -> radio bar + log; kill/infect cut-in
      panel -> in-board particles + floating text; move chatter bubbles are
      queued until the piece has landed.
   3) Cinematic board FX: dynamic light, move trail, landing ring, hit sparks,
      infection spores, hit-stop, scene-art backdrop, film grain/vignette. */
const AUD18=(()=>{
 let ctx=null,master=null,verb=null,verbSend=null,stepAlt=false;const lastPlay={};
 const settings=()=>{try{return EchoAudio.settings;}catch(e){return{enabled:true,effects:true,effectsVolume:.8};}};
 const enabled=()=>{const s=settings();return s.enabled!==false&&s.effects!==false;};
 const vol=()=>{const s=settings();const v=Number(s.effectsVolume);return Math.max(.08,Math.min(1,isNaN(v)?.8:v));};
 function ensure(){
  if(ctx){if(ctx.state==='suspended')ctx.resume().catch(()=>{});return ctx;}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
  try{ctx=new AC({latencyHint:'interactive'});}catch(e){try{ctx=new AC();}catch(_){return null;}}
  const comp=ctx.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=5;comp.attack.value=.003;comp.release.value=.22;
  master=ctx.createGain();master.gain.value=.9;master.connect(comp);comp.connect(ctx.destination);
  const len=Math.floor(ctx.sampleRate*1.4),ir=ctx.createBuffer(2,len,ctx.sampleRate);
  for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);}
  verb=ctx.createConvolver();verb.buffer=ir;verbSend=ctx.createGain();verbSend.gain.value=.3;verbSend.connect(verb);verb.connect(master);
  return ctx;
 }
 function resume(){ensure();if(ctx&&ctx.state!=='running')ctx.resume().catch(()=>{});}
 ['pointerdown','touchstart','touchend','click','keydown'].forEach(ev=>document.addEventListener(ev,()=>{resume();try{SND16.unlock();}catch(e){}},{capture:true,passive:true}));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)resume();});
 function env(g,t,a,peak,dur){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),t+a);g.gain.exponentialRampToValueAtTime(.0001,t+dur);}
 function tone(type,f0,f1,dur,v,delay=0,opt={}){
  const t=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;
  o.frequency.setValueAtTime(Math.max(20,f0),t);if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  if(opt.detune)o.detune.value=opt.detune;
  env(g,t,opt.a||.005,v*vol(),dur);
  let node=g;if(opt.lp){const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=opt.lp;f.Q.value=opt.q||.7;g.connect(f);node=f;}
  o.connect(g);node.connect(master);if(opt.verb)node.connect(verbSend);
  o.start(t);o.stop(t+dur+.05);
 }
 let nbuf=null;
 function noise(dur,v,type='bandpass',f0=1500,f1=null,delay=0,opt={}){
  if(!nbuf){const len=ctx.sampleRate*2;nbuf=ctx.createBuffer(1,len,ctx.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;}
  const t=ctx.currentTime+delay,s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
  s.buffer=nbuf;s.loop=true;f.type=type;f.frequency.setValueAtTime(f0,t);if(f1)f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);f.Q.value=opt.q||1.1;
  env(g,t,opt.a||.004,v*vol(),dur);s.connect(f);f.connect(g);g.connect(master);if(opt.verb)g.connect(verbSend);
  s.start(t,Math.random()*1.4);s.stop(t+dur+.05);
 }
 function ring(freqs,dur,v,delay=0){freqs.forEach((f,i)=>tone('sine',f*(1+Math.random()*.01),f*.994,dur*(1-i*.13),v/(i+1.4),delay,{a:.002,verb:true}));}
 const R=(a,b)=>a+Math.random()*(b-a);
 function moveSound(kind){
  if(kind==='spider'){for(let i=0;i<6;i++)noise(.02,.13,'highpass',R(3200,5200),null,i*.045,{q:2});tone('sawtooth',70,48,.34,.07,0,{lp:420});noise(.3,.07,'bandpass',260,720,0,{q:4});return;}
  if(kind==='core'||kind==='sentinel'||kind==='turret'){tone('sawtooth',52,38,.42,.13,0,{lp:300});noise(.4,.08,'bandpass',180,420,0,{q:3});tone('sine',96,34,.3,.4,.34);return;}
  /* 机娘 / 通用：伺服滑行 + 交替脚步（每次音高不同，不再重复同一声） */
  tone('sawtooth',R(150,175),R(260,320),.3,.045,0,{lp:640});
  noise(.32,.11,'bandpass',R(360,460),1300,0,{q:2.6});
  stepAlt=!stepAlt;const f=stepAlt?R(680,760):R(500,570);
  tone('square',f,f*.6,.05,.05,.1,{lp:2600});tone('square',stepAlt?R(500,560):R(690,770),(stepAlt?500:690)*.6,.05,.05,.24,{lp:2600});
  tone('sine',130,40,.17,.4,.36);noise(.07,.2,'lowpass',820,null,.36);ring([1900,2900],.18,.04,.37);
 }
 function hitSound(big){
  const base=R(120,185);
  tone('sine',base,26,big?.7:.5,.8,0,{a:.002});
  noise(big?.4:.28,big?.5:.38,'lowpass',2600,260,0,{verb:true});
  tone('sawtooth',R(760,980),110,.2,.11,.012,{lp:2300});
  ring([R(500,560),R(1150,1250),R(1800,1950),R(2600,2850)],big?1.1:.8,.15,.02);
  noise(.45,.07,'highpass',3200,900,.07,{verb:true});
  if(big){tone('sine',64,22,1.0,.6,.03,{verb:true});noise(.6,.16,'lowpass',900,90,.02,{verb:true});}
 }
 function captureSound(){
  for(let i=0;i<12;i++)noise(.016,.15,'highpass',R(3200,5600),null,i*.034+Math.random()*.008,{q:2});
  tone('sawtooth',R(76,92),720,.55,.1,.42,{lp:1100,q:5,verb:true});
  tone('sine',290,84,.5,.12,.48,{lp:850});noise(.38,.12,'bandpass',620,190,.5,{q:5});
  [.95,1.2,1.72,1.95].forEach(d=>tone('sine',60,36,.16,.55,d));
  for(let i=0;i<5;i++)tone('square',R(220,1900),R(120,800),.04,.045,1.32+i*.05,{lp:2800});
 }
 function play(name,opt={}){
  if(!enabled())return;
  if(!ensure())return;
  if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  const nowMs=performance.now(),minGap=(name==='hit'||name==='capture'||name==='infect')?60:75;
  if(lastPlay[name]&&nowMs-lastPlay[name]<minGap)return;lastPlay[name]=nowMs;
  const kind=opt.kind||(typeof FX18Mover!=='undefined'&&FX18Mover?FX18Mover.kind:null);
  try{switch(name){
   case 'move': case 'enemymove': moveSound(kind||(name==='enemymove'?'machine':null));break;
   case 'step': stepAlt=!stepAlt;{const f=stepAlt?R(640,730):R(470,540);tone('square',f,f*.55,.045,.06,0,{lp:2500});noise(.04,.06,'bandpass',R(900,1400));}break;
   case 'land': tone('sine',125,38,.16,.42);noise(.07,.2,'lowpass',760);ring([1700,2600],.15,.035,.01);break;
   case 'select': {const f=R(860,1120);tone('square',f,f*1.42,.06,.055,0,{lp:3200});tone('sine',f*2,f*2,.08,.04,.045);}break;
   case 'hover': tone('square',2300,1900,.018,.014,0,{lp:4800});break;
   case 'ui': tone('triangle',R(1180,1360),1650,.05,.055);noise(.03,.035,'highpass',4800);break;
   case 'wait': case 'hold': tone('sine',196,196,.3,.07,0,{a:.035});tone('sine',294,294,.3,.045,0,{a:.035});noise(.1,.06,'bandpass',880);tone('square',320,180,.05,.05,.02,{lp:1800});break;
   case 'hit': case 'kill': hitSound(name==='kill');break;
   case 'capture': case 'infect': captureSound();break;
   case 'commit': tone('sine',108,52,.2,.38);noise(.07,.14,'lowpass',1100);[523,659,988].forEach((f,i)=>tone('triangle',f,f,.3,.085,.07+i*.075,{verb:true}));break;
   case 'objective': [659,880,1175,1568].forEach((f,i)=>tone('triangle',f,f,.42,.09,i*.065,{verb:true}));tone('sine',1568,1568,1.1,.035,.28,{verb:true});break;
   case 'alarm': [0,.4].forEach(d=>{tone('square',R(425,445),322,.34,.06,d,{lp:1700});});break;
   case 'victory': [262,330,392,523].forEach((f,i)=>tone('sawtooth',f,f,1.4,.05,i*.02,{lp:1500,a:.07,verb:true}));[523,659,784,1046,1318].forEach((f,i)=>tone('triangle',f,f,.5,.09,.18+i*.11,{verb:true}));break;
   case 'defeat': [392,370,311,262].forEach((f,i)=>tone('sawtooth',f,f*.97,.55,.06,i*.26,{lp:850,verb:true}));tone('sine',62,36,1.5,.38,1.05,{verb:true});break;
   case 'whoosh': noise(.48,.13,'bandpass',280,3600,0,{q:1.3,verb:true});break;
   case 'cut': noise(.4,.15,'bandpass',4200,240,0,{q:1.5,verb:true});tone('sine',88,38,.28,.22,.05);break;
   case 'boom': tone('sine',88,24,1.3,.75,0,{a:.003,verb:true});noise(.85,.28,'lowpass',1300,80,0,{verb:true});ring([311,622,940],1.4,.07,.02);break;
   case 'glitch': for(let i=0;i<7;i++)tone('square',R(280,2600),R(90,650),.03,.05,i*.032,{lp:3800});noise(.22,.09,'highpass',1900);break;
   case 'pulse': tone('sine',70,36,.75,.5,0,{verb:true});tone('sine',140,76,.45,.07,.03);break;
   case 'latch': noise(.09,.22,'bandpass',2500,850,0,{q:3});tone('square',215,68,.16,.11,0,{lp:1400});ring([2300,3500],.22,.05,.04);break;
   case 'knock': [0,.19,.55].forEach((d,i)=>{tone('sine',118,44,i===2?.24:.11,.42,d);noise(i===2?.15:.06,.18,'lowpass',780,null,d,{verb:true});});break;
   case 'stamp': tone('sine',155,48,.24,.48);noise(.11,.22,'lowpass',1700);ring([1350,2050],.28,.045,.02);break;
   case 'type': tone('square',R(1750,2150),1450,.012,.011,0,{lp:3800});break;
   case 'overmind': tone('sawtooth',54,50,.7,.13,0,{lp:360,q:7,verb:true});tone('square',108,101,.6,.045,.02,{lp:650});for(let i=0;i<4;i++)tone('sine',860+i*130,680,.05,.028,.05+i*.09);noise(.55,.05,'bandpass',175,115,0,{q:6});break;
   default: tone('triangle',430,310,.09,.05);
  }}catch(e){}
 }
 return{play,resume,get state(){return{ctx:ctx?ctx.state:'none',enabled:enabled()};}};
})();
let FX18Mover=null;

/* route all game cues through AUD18 (voices stay on SND16, with fallback) */
sfx=function(type){AUD18.play(type);};
filmSound=function(type){if(type)AUD18.play(type);};
try{const _sp=SND16.play;SND16.play=function(n){try{if(SND16.state.ctx!=='running'){AUD18.play(n==='capture_skitter'?'glitch':n);return;}}catch(e){}return _sp(n);};}catch(e){}

/* ================= no pop-up panels while battling ================= */
const FX18Toast=toast;
toast=function(text){
 try{
  const inBattle=typeof S!=='undefined'&&S&&typeof C!=='undefined'&&C&&!$('game').hidden;
  if(inBattle){try{radio('系统',String(text));}catch(e){}try{addLog(String(text));}catch(e){}return;}
 }catch(e){}
 return FX18Toast(text);
};

/* ================= cinematic board FX ================= */
const FX18=(()=>{
 const reduced=()=>{try{return !!reducedMotion;}catch(e){return false;}};
 const canvas=document.createElement('canvas');canvas.id='fx18-canvas';document.body.appendChild(canvas);
 const floatLayer=document.createElement('div');floatLayer.id='fx18-float';document.body.appendChild(floatLayer);
 const grade=document.createElement('div');grade.id='fx18-grade';document.body.appendChild(grade);
 const light=document.createElement('div');light.id='fx18-light';document.body.appendChild(light);
 const cx=canvas.getContext('2d');let W=0,H=0,parts=[],rings=[],raf=0;
 function size(){const d=Math.min(2,window.devicePixelRatio||1);W=window.innerWidth;H=window.innerHeight;canvas.width=W*d;canvas.height=H*d;canvas.style.width=W+'px';canvas.style.height=H+'px';cx.setTransform(d,0,0,d,0,0);}
 size();window.addEventListener('resize',size);
 function cellCenter(x,y){const c=document.querySelector(`#board .cell[data-x="${x}"][data-y="${y}"]`);if(!c)return null;const r=c.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,w:r.width};}
 function loop(){
  cx.clearRect(0,0,W,H);
  parts=parts.filter(p=>p.life>0);rings=rings.filter(r=>r.life>0);
  for(const r of rings){r.r+=r.vr;r.life-=r.dec;cx.beginPath();cx.arc(r.x,r.y,r.r,0,6.283);cx.strokeStyle=r.color;cx.globalAlpha=Math.max(0,r.life)*.8;cx.lineWidth=r.lw;cx.stroke();}
  for(const p of parts){p.life-=p.dec;p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.vx*=.985;cx.globalAlpha=Math.max(0,Math.min(1,p.life));cx.fillStyle=p.color;cx.beginPath();cx.arc(p.x,p.y,p.size*Math.max(.3,p.life),0,6.283);cx.fill();}
  cx.globalAlpha=1;
  if(parts.length||rings.length)raf=requestAnimationFrame(loop);else{raf=0;cx.clearRect(0,0,W,H);}
 }
 function kick(){if(!raf&&(parts.length||rings.length))raf=requestAnimationFrame(loop);}
 function burst(x,y,colors,n=18,speed=3.4,life=1,size=3.2,grav=.06){
  if(reduced())return;const cap=420;for(let i=0;i<n&&parts.length<cap;i++){const a=Math.random()*6.283,s=(0.3+Math.random()*0.7)*speed;
   parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,g:grav,life:life*(0.6+Math.random()*.6),dec:.016+Math.random()*.014,size:size*(0.5+Math.random()),color:colors[i%colors.length]});}
  kick();
 }
 function ring(x,y,color='#6fd6ff',r0=8,vr=2.6){if(reduced())return;rings.push({x,y,r:r0,vr,life:1,dec:.03,color,lw:2.4});kick();}
 function floatText(x,y,text,color='#dff4ff',big=false){
  const el=document.createElement('div');el.className='fx18-float-text'+(big?' big':'');el.textContent=text;el.style.left=x+'px';el.style.top=y+'px';el.style.color=color;floatLayer.appendChild(el);
  setTimeout(()=>el.remove(),1450);
 }
 function setLight(x,y,side){
  const c=cellCenter(x,y);if(!c){light.style.opacity='0';return;}
  light.style.opacity='1';light.style.left=c.x+'px';light.style.top=c.y+'px';
  light.style.background=side==='r'?'radial-gradient(circle,rgba(255,59,92,.34),rgba(255,59,92,.1) 45%,transparent 70%)':'radial-gradient(circle,rgba(111,214,255,.32),rgba(111,214,255,.09) 45%,transparent 70%)';
 }
 function surroundFX(cls){
  if(reduced())return;const s=document.querySelector('.board-surround');if(!s)return;
  s.classList.remove(cls);void s.offsetWidth;s.classList.add(cls);setTimeout(()=>s.classList.remove(cls),650);
 }
 function backdrop(){
  try{
   if(typeof S==='undefined'||!S||typeof CHAPTER_BG==='undefined'||typeof ART==='undefined')return;
   const sur=document.querySelector('.board-surround');if(!sur)return;const keyBg=CHAPTER_BG[S.mid];if(!keyBg||sur.dataset.fx18bg===keyBg)return;
   const art=ART[keyBg];if(!art)return;sur.dataset.fx18bg=keyBg;
   sur.style.setProperty('background',`linear-gradient(160deg,rgba(7,13,20,.9),rgba(7,12,18,.78) 55%,rgba(5,8,12,.92)),url(${art}) center/cover no-repeat`,'important');
   const boardEl=document.getElementById('board');
   if(boardEl&&boardEl.dataset.fx18bg!==keyBg){boardEl.dataset.fx18bg=keyBg;
    boardEl.style.setProperty('background',`linear-gradient(155deg,rgba(8,15,23,.86),rgba(7,12,19,.78) 55%,rgba(5,9,14,.9)),url(${art}) center/cover no-repeat`,'important');}
  }catch(e){}
 }
 function combatFX(target,mode){
  try{
   const box=$('capture-event');if(box){box.classList.remove('show');box.innerHTML='';}
   if(!target)return;
   const c=cellCenter(target.x,target.y);if(!c)return;
   if(mode==='infect'){
    burst(c.x,c.y,['#ff3b5c','#ff8fa5','#ffd6dc','#ff5c39'],42,4.6,1.25,3.6,.03);
    ring(c.x,c.y,'#ff3b5c',10,3.4);ring(c.x,c.y,'#ff8fa5',4,2.2);
    floatText(c.x,c.y-c.w*.62,'胸口寄生 · 永久接管','#ff9aac',true);
    AUD18.play('pulse');
   }else{
    burst(c.x,c.y,['#ffd9a0','#ff9a5c','#e8f4ff','#8fb8c9'],46,5.2,1.15,3.6,.09);
    ring(c.x,c.y,'#ffd9a0',10,3.8);
    floatText(c.x,c.y-c.w*.62,'击毁 · TARGET DOWN','#ffd9a0',true);
   }
   surroundFX('fx18-hitstop');setTimeout(()=>surroundFX('fx18-shake'),60);
  }catch(e){}
 }
 function landing(m,mover){
  const c=cellCenter(m.x,m.y);if(!c)return;
  const side=mover?mover.side:null;
  burst(c.x,c.y,side==='r'?['#ff8fa5','#c9d6de']:['#9adcff','#c9d6de'],10,2.1,.7,2.4,.05);
  ring(c.x,c.y,side==='r'?'#ff5c74':'#6fd6ff',6,2.2);
  setLight(m.x,m.y,side);
 }
 function trailStep(){
  const t=document.querySelector('.floating-token');if(!t)return;const r=t.getBoundingClientRect();
  const red=t.classList.contains('r');
  burst(r.left+r.width/2,r.top+r.height/2,red?['rgba(255,92,116,.9)']:['rgba(111,214,255,.9)'],2,0.7,0.55,3.4,0);
 }
 let queuedBubble=null;
 function flushBubble(){
  if(!queuedBubble)return;const q=queuedBubble;queuedBubble=null;
  setTimeout(()=>{try{BUB17.say(q[0],q[1],q[2]);}catch(e){}},120);
 }
 setInterval(()=>{ /* battle ambience: objective sparkles + grade toggle */
  try{
   const inBattle=typeof S!=='undefined'&&S&&!$('game').hidden;
   document.body.classList.toggle('fx18-battle',!!inBattle);
   backdrop();
   if(!inBattle||document.hidden||reduced())return;
   const cells=[...document.querySelectorAll('#board .cell.relay,#board .cell.exit,#board .cell.capture')];
   if(cells.length&&Math.random()<.8){const r=cells[Math.floor(Math.random()*cells.length)].getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,['#ffe9a8','#9adcff'],5,1.1,1,2,-.01);}
  }catch(e){}
 },2400);
 return{burst,ring,floatText,setLight,backdrop,combatFX,landing,trailStep,flushBubble,
  queueBubble(q){queuedBubble=q;},cellCenter,surroundFX,
  get moving(){return FX18Moving;}};
})();

/* kill / infect: no more centre-screen panel — in-board FX only */
captureEffect=function(target){FX18.combatFX(target,'infect');};
killEffect=function(target){FX18.combatFX(target,'kill');};

/* bubbles: smaller via CSS; during a move, queue the latest line until landing */
let FX18Moving=false;
try{const _say=BUB17.say;BUB17.say=function(id,text,opt={}){if(FX18Moving&&!opt.priority){FX18.queueBubble([id,text,opt]);return null;}return _say(id,text,opt);};}catch(e){}

/* move wrapper: audio resume in-gesture, footsteps, trail, landing, dynamic light */
const FX18PerformMove=performMove;
performMove=async function(m,isPlayer){
 let mover=null;
 try{mover=(typeof S!=='undefined'&&S)?S.units.find(v=>v.uid===m.uid):null;}catch(e){}
 FX18Mover=mover?{kind:mover.kind,char:mover.char,side:mover.side}:null;
 FX18Moving=true;AUD18.resume();
 let trail=null;
 if(mover&&m.type!=='wait'){
  if(!reducedMotionSafe())trail=setInterval(()=>FX18.trailStep(),55);
  setTimeout(()=>AUD18.play('step',{kind:mover.kind}),120);
  setTimeout(()=>AUD18.play('step',{kind:mover.kind}),275);
  if(!m.capture)setTimeout(()=>AUD18.play('land',{kind:mover.kind}),405);
 }
 let r;
 try{r=await FX18PerformMove.apply(this,arguments);}
 finally{if(trail)clearInterval(trail);}
 try{
  if(mover&&m.type==='wait'){const c=FX18.cellCenter(m.x,m.y);if(c){FX18.ring(c.x,c.y,mover.side==='r'?'#ff5c74':'#6fd6ff',8,2.4);FX18.setLight(m.x,m.y,mover.side);}}
  else if(mover&&!m.capture)FX18.landing(m,mover);
  else if(mover)FX18.setLight(m.x,m.y,mover.side);
 }catch(e){}
 setTimeout(()=>{FX18Moving=false;FX18.flushBubble();},reducedMotionSafe()?50:300);
 return r;
};
function reducedMotionSafe(){try{return !!reducedMotion;}catch(e){return false;}}
try{const _hc=handleCell;handleCell=async function(){AUD18.resume();return _hc.apply(this,arguments);};}catch(e){}
try{const _rb=renderBoard;renderBoard=function(){const r=_rb.apply(this,arguments);try{FX18.backdrop();const u=(typeof S!=='undefined'&&S)?S.units.find(v=>v.uid===selected&&onBoard(v)):null;if(u)FX18.setLight(u.x,u.y,u.side);}catch(e){}return r;};}catch(e){}

window.__FX18__={AUD18,FX18,version:'M18-1'};
