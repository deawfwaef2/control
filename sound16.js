/* ===== M16 SOUND — punchy synthesized SFX + Danganronpa-style character voice barks =====
   - SFX: everything synthesized with WebAudio (no samples), routed through a small space reverb.
   - Voices: short Japanese interjections only (never whole sentences). Each character maps to one of
     three voice banks with her own pitch, so lines start with a "えっ？" / "了解" style bark.
   - Respects the existing mixer (EchoAudio settings: enabled / effects / effectsVolume). */
const SND16=(()=>{
 let ctx=null,master=null,sfxBus=null,voxBus=null,verb=null,verbSend=null,unlocked=false,lastVox=0,lastMove=0;
 const bufs={},loading={};let VP=1,VV=1,curUnit=null;const lastPitch={},lastVar={},lastVoxKey={};
 const st=()=>{try{return EchoAudio.settings;}catch(e){return{enabled:true,effects:true,effectsVolume:.72};}};
 const on=()=>{const s=st();return s.enabled!==false&&s.effects!==false;};
 function init(){
  if(ctx)return ctx;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
  ctx=new AC();
  const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.attack.value=.003;comp.release.value=.2;
  master=ctx.createGain();master.connect(comp);comp.connect(ctx.destination);
  sfxBus=ctx.createGain();sfxBus.connect(master);
  voxBus=ctx.createGain();voxBus.gain.value=1.15;voxBus.connect(master);
  // generated impulse response: metal corridor
  const len=Math.floor(ctx.sampleRate*1.7),ir=ctx.createBuffer(2,len,ctx.sampleRate);
  for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++){const t=i/len;d[i]=(Math.random()*2-1)*Math.pow(1-t,3.2)*(i%(37+c*11)<3?1.6:1);}}
  verb=ctx.createConvolver();verb.buffer=ir;verbSend=ctx.createGain();verbSend.gain.value=.32;verbSend.connect(verb);verb.connect(master);
  mix();return ctx;
 }
 function mix(){if(!ctx)return;const s=st();master.gain.value=on()?1:0;sfxBus.gain.value=Math.max(0,Math.min(1,s.effectsVolume??.72))*1.25;}
 function unlock(){if(!on())return;init();if(!ctx)return;if(ctx.state!=='running')ctx.resume().catch(()=>{});unlocked=true;mix();preload();}
 const now=()=>ctx.currentTime;
 function ready(){if(!ctx||!unlocked||!on()||document.hidden)return false;if(ctx.state!=='running'){ctx.resume().catch(()=>{});return false;}mix();return true;}
 function env(g,t,a,peak,dur){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),t+a);g.gain.exponentialRampToValueAtTime(.0001,t+dur);}
 function osc(type,f0,f1,dur,vol,delay=0,opt={}){
  f0*=VP;if(f1)f1*=VP;vol*=VV;const t=now()+delay,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur*(opt.glide||1));
  if(opt.detune)o.detune.value=opt.detune;env(g,t,opt.a||.006,vol,dur);let node=g;
  if(opt.lp){const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=opt.lp;f.Q.value=opt.q||.8;g.connect(f);node=f;}
  o.connect(g);node.connect(sfxBus);if(opt.verb)node.connect(verbSend);o.start(t);o.stop(t+dur+.05);return o;
 }
 let nbuf=null;function noiseBuf(){if(nbuf)return nbuf;const len=ctx.sampleRate*2;nbuf=ctx.createBuffer(1,len,ctx.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;return nbuf;}
 function noise(dur,vol,type='bandpass',f0=1500,f1=null,delay=0,opt={}){
  f0*=VP;if(f1)f1*=VP;vol*=VV;const t=now()+delay,s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseBuf();s.loop=true;
  f.type=type;f.frequency.setValueAtTime(f0,t);if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+dur);f.Q.value=opt.q||1.2;
  env(g,t,opt.a||.004,vol,dur);s.connect(f);f.connect(g);g.connect(sfxBus);if(opt.verb)g.connect(verbSend);s.start(t,Math.random()*1.5);s.stop(t+dur+.05);
 }
 function ring(freqs,dur,vol,delay=0){freqs.forEach((f,i)=>osc('sine',f,f*0.995,dur*(1-i*.12),vol/(i+1),delay,{a:.002,verb:true}));}
 const FX={
  hover(){osc('square',2400,2000,.02,.018,0,{lp:5000});},
  ui(){osc('triangle',1300,1700,.05,.06);noise(.03,.04,'highpass',5000);},
  select(){osc('square',520,1180,.07,.06,0,{lp:3200});osc('sine',1760,1760,.09,.05,.05);noise(.05,.05,'highpass',4200);},
  move(){ // hydraulic servo glide + landing clank
   noise(.36,.13,'bandpass',380,1400,0,{q:3});osc('sawtooth',90,150,.32,.05,0,{lp:600});
   osc('sine',140,42,.18,.42,.36);noise(.08,.22,'lowpass',900,null,.36);ring([1980,3170],.22,.05,.37);
  },
  enemymove(){noise(.34,.12,'bandpass',240,800,0,{q:4});osc('sawtooth',70,55,.34,.06,0,{lp:420});osc('sine',110,36,.2,.45,.36);noise(.1,.18,'lowpass',600,null,.36);},
  wait(){osc('sine',196,196,.35,.08,0,{a:.04});osc('sine',294,294,.35,.05,0,{a:.04});noise(.12,.05,'bandpass',900);},
  hit(){ // lethal hit: boom + crunch + metal ring
   osc('sine',150,28,.55,.75,0,{a:.002});noise(.32,.45,'lowpass',2600,300,0,{verb:true});osc('sawtooth',900,120,.22,.12,.01,{lp:2400});
   ring([523,1187,1873,2711],.9,.16,.02);noise(.5,.08,'highpass',3000,800,.08,{verb:true});
  },
  capture(){ // spider infection: skitter → organic squelch → heartbeat
   for(let i=0;i<14;i++)noise(.018,.16,'highpass',3500+Math.random()*2500,null,i*.035+Math.random()*.01,{q:2});
   osc('sawtooth',62,44,1.0,.16,.45,{lp:500,q:6,verb:true});osc('sine',300,90,.5,.12,.5,{lp:900});noise(.4,.12,'bandpass',600,200,.5,{q:5});
   [1.05,1.32,1.85,2.12].forEach(d=>{osc('sine',62,38,.16,.6,d);});
   for(let i=0;i<5;i++)osc('square',200+Math.random()*1800,100+Math.random()*900,.04,.05,1.4+i*.05,{lp:3000});
  },
  infect(){FX.capture();},
  commit(){osc('sine',110,55,.2,.4);noise(.07,.15,'lowpass',1200);[523,659,988].forEach((f,i)=>osc('triangle',f,f,.32,.09,.08+i*.08,{verb:true}));},
  objective(){[659,880,1175,1568].forEach((f,i)=>osc('triangle',f,f,.45,.1,i*.07,{verb:true}));osc('sine',1568,1568,1.2,.04,.3,{verb:true});},
  alarm(){[0,.42,.84].forEach(t=>{osc('square',440,330,.36,.07,t,{lp:1800});osc('square',446,334,.36,.05,t,{lp:1800});});},
  victory(){[262,330,392,523].forEach((f,i)=>osc('sawtooth',f,f,1.6,.06,i*.02,{lp:1600,a:.08,verb:true}));[523,659,784,1046].forEach((f,i)=>osc('triangle',f,f,.5,.1,.2+i*.12,{verb:true}));},
  defeat(){[392,370,311,262].forEach((f,i)=>osc('sawtooth',f,f*.97,.6,.07,i*.28,{lp:900,verb:true}));osc('sine',65,40,1.6,.4,1.1,{verb:true});},
  knock(){[0,.2,.6].forEach((t,i)=>{osc('sine',120,45,i===2?.25:.12,.45,t);noise(i===2?.16:.07,.2,'lowpass',800,null,t,{verb:true});});},
  latch(){noise(.1,.25,'bandpass',2600,900,0,{q:3});osc('square',220,70,.18,.12,0,{lp:1500});ring([2400,3600],.25,.06,.05);},
  pulse(){osc('sine',72,38,.8,.55,0,{verb:true});osc('sine',144,80,.5,.08,.03);noise(.5,.05,'lowpass',300,null,0,{verb:true});},
  cut(){noise(.42,.16,'bandpass',4200,260,0,{q:1.6,verb:true});osc('sine',90,40,.3,.25,.06);},
  whoosh(){noise(.5,.14,'bandpass',300,3800,0,{q:1.4,verb:true});},
  boom(){osc('sine',90,26,1.4,.8,0,{a:.003,verb:true});noise(.9,.3,'lowpass',1400,80,0,{verb:true});ring([311,622,940],1.6,.08,.02);},
  stamp(){osc('sine',160,50,.25,.5);noise(.12,.25,'lowpass',1800);ring([1400,2100],.3,.05,.02);},
  glitch(){for(let i=0;i<8;i++)osc('square',300+Math.random()*2400,80+Math.random()*600,.03,.06,i*.035,{lp:4000});noise(.25,.1,'highpass',2000);},
  type(){osc('square',1900+Math.random()*300,1500,.012,.012,0,{lp:4000});},
  overmind(){osc('sawtooth',55,52,.7,.14,0,{lp:380,q:8,verb:true});osc('square',110,104,.6,.05,.02,{lp:700});for(let i=0;i<4;i++)osc('sine',880+i*120,700,.05,.03,.05+i*.09);noise(.6,.06,'bandpass',180,120,0,{q:6});}
 };
 /* M17: no two plays sound identical — random pitch/level, never the same pitch twice in a row,
    and real variants for the sounds you hear most (move / select / hit / whoosh). */
 const R=(a,b)=>a+Math.random()*(b-a);
 const VARIANTS={
  move:{
   girl:[()=>{noise(.3,.12,'bandpass',500,2400,0,{q:2.5});osc('sawtooth',120,240,.28,.04,0,{lp:900});osc('sine',170,60,.14,.36,.3);ring([2200,3500],.18,.05,.31);},
         ()=>{noise(.22,.1,'bandpass',900,3800,0,{q:1.6,verb:true});osc('triangle',300,620,.2,.05,0);osc('sine',150,48,.16,.38,.24);noise(.06,.16,'lowpass',1100,null,.25);},
         ()=>{[0,.11,.22].forEach((t,i)=>{osc('sine',120+i*12,50,.08,.22,t);noise(.04,.1,'lowpass',1300,null,t);});noise(.3,.07,'highpass',3000,6000,.02);ring([2600],.15,.04,.24);}],
   spider:[()=>{for(let i=0;i<8;i++)noise(.016,.15,'highpass',R(2600,4800),null,i*.045+R(0,.012),{q:3});osc('sawtooth',80,60,.36,.05,0,{lp:380});osc('sine',100,40,.12,.3,.38);},
           ()=>{for(let i=0;i<6;i++){osc('square',R(900,1600),R(400,700),.02,.05,i*.06,{lp:2500});}noise(.4,.08,'bandpass',300,700,0,{q:6});osc('sine',90,36,.16,.35,.4);}],
   drone:[()=>{osc('sawtooth',180,260,.45,.05,0,{lp:900,q:4});osc('sawtooth',182,262,.45,.04,0,{lp:900,q:4});noise(.45,.06,'bandpass',1200,1800,0,{q:5});osc('sine',300,160,.12,.12,.44);},
          ()=>{osc('triangle',420,880,.3,.06,0);osc('sine',880,600,.2,.04,.2);noise(.3,.05,'highpass',2500,5000,0);}],
   courier:[()=>{noise(.25,.1,'bandpass',600,2600,0,{q:2});for(let i=0;i<4;i++)noise(.015,.12,'highpass',R(3000,5000),null,.05+i*.05);osc('sine',110,50,.12,.25,.27);}]
  },
  select:[()=>{osc('square',520,1180,.07,.06,0,{lp:3200});osc('sine',1760,1760,.09,.05,.05);noise(.05,.05,'highpass',4200);},
          ()=>{osc('triangle',880,1320,.06,.07,0);osc('sine',1320,1320,.12,.05,.06,{verb:true});},
          ()=>{osc('sine',660,660,.05,.06,0);osc('sine',990,990,.05,.06,.05);osc('sine',1480,1480,.1,.04,.1,{verb:true});noise(.04,.04,'highpass',5000);},
          ()=>{osc('square',300,900,.05,.05,0,{lp:2200});ring([1700,2550],.18,.06,.04);}],
  hit:[null,
       ()=>{noise(.06,.4,'highpass',3000,null,0);osc('sawtooth',2400,300,.18,.14,0,{lp:5000});osc('sine',120,30,.45,.6,.02);noise(.4,.3,'lowpass',2000,200,.03,{verb:true});for(let i=0;i<6;i++)osc('square',R(2000,5000),R(800,1500),.03,.04,.05+i*.04,{lp:6000});},
       ()=>{osc('sine',90,24,.7,.8,0,{a:.002,verb:true});noise(.5,.4,'lowpass',1600,120,0,{verb:true});ring([311,740,1320],1.1,.12,.03);noise(.15,.2,'bandpass',800,300,.12,{q:4});}],
  whoosh:[null,()=>{noise(.55,.13,'bandpass',4200,260,0,{q:1.2,verb:true});},()=>{noise(.35,.1,'bandpass',600,2600,0,{q:2});noise(.5,.06,'highpass',3000,8000,.1,{verb:true});},()=>{noise(.7,.12,'lowpass',300,2600,0,{verb:true});osc('sine',60,90,.6,.1,0,{verb:true});}]
 };
 function kindOf(u){if(!u)return'girl';if(u.char)return'girl';if(u.kind==='spider')return'spider';if(u.kind==='courier')return'courier';return'drone';}
 function play(name){if(!ready())return;
  let p=R(.9,1.1);if(lastPitch[name]&&Math.abs(p-lastPitch[name])<.035)p+=p>1?-.06:.06;lastPitch[name]=p;VP=p;VV=R(.86,1.08);
  let f=FX[name]||FX.ui;
  if((name==='move'||name==='enemymove')&&curUnit){const k=kindOf(curUnit);const pool=VARIANTS.move[k];if(pool&&(k!=='girl'||Math.random()<.75)){let i=Math.floor(Math.random()*pool.length);if(pool.length>1&&i===lastVar['m'+k])i=(i+1)%pool.length;lastVar['m'+k]=i;f=pool[i];}}
  else if(VARIANTS[name]&&Array.isArray(VARIANTS[name])){const pool=VARIANTS[name];let i=Math.floor(Math.random()*pool.length);if(pool.length>1&&i===lastVar[name])i=(i+1)%pool.length;lastVar[name]=i;if(pool[i])f=pool[i];}
  try{f();}catch(e){}VP=1;VV=1;}
 function setUnit(u){curUnit=u;}

 /* ---------- voices ---------- */
 const BANK={
  v1:{ok:'ok',surprise:'surprise',shock:'surprise',pain:'pain',scream:'surprise',think:'think',hmm:'think',attack:'attack',cheer:'attack',laugh:'ok',sad:'sad',sigh:'sad'},
  v2:{ok:'obey',obey:'obey',surprise:'surprise',shock:'surprise',pain:'pain',scream:'pain',think:'hmm',hmm:'hmm',attack:'attack',cheer:'attack',laugh:'hmm',sad:'sad',sigh:'sad'},
  v3:{ok:'ok',surprise:'surprise',shock:'shock',pain:'pain',scream:'scream',think:'think',hmm:'hmm',attack:'attack',cheer:'cheer',laugh:'laugh',sad:'sad',sigh:'sigh'}
 };
 // character → [bank, pitch]   (pitch = playbackRate; <1 deeper/cooler, >1 younger)
 const CAST={lyra:['v3',.9],akira:['v3',.86],vega:['v3',.84],kuro:['v3',.93],veil:['v3',.95],noct:['v3',.88],celia:['v3',1.02],iris:['v3',1.05],sera:['v3',1.0],psalm:['v3',.97],astra:['v3',1.08],
  lark:['v1',1.04],sola:['v1',.96],misa:['v1',1.0],june:['v1',1.08],
  nyx:['v2',.92],ruby:['v2',1.0],echo:['v2',1.06]};
 function voiceFor(id,side){
  const c=CAST[id]||['v3',1];let bank=c[0],rate=c[1];
  const red=side==='r'||(typeof C!=='undefined'&&C&&C.roster&&C.roster[id]&&C.roster[id].side==='r'&&side!=='g');
  if(red&&bank!=='v2'){bank='v2';rate=c[1]*0.97;}
  return{bank,rate};
 }
 function preload(){if(!ctx)return;for(const k of Object.keys(VOICE_DATA||{}))load(k);}
 function load(k){
  if(bufs[k]||loading[k]||!VOICE_DATA[k]||!ctx)return loading[k];
  const b64=VOICE_DATA[k].split(',')[1],bin=atob(b64),arr=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
  loading[k]=new Promise(res=>{ctx.decodeAudioData(arr.buffer,b=>{bufs[k]=b;res(b);},()=>res(null));});return loading[k];
 }
 function emotion(text,ctxHint){
  const t=String(text||'');
  if(ctxHint)return ctxHint;
  if(/哈哈|呵呵|嘻嘻|噗|笑/.test(t))return'laugh';
  if(/[！!][？?]|[？?][！!]|^(什么|诶|欸|咦|不会吧)/.test(t))return'shock';
  if(/对不起|抱歉|不要|求你|救|好痛|疼/.test(t))return/痛|疼/.test(t)?'pain':'sad';
  if(/……$|…$/.test(t)&&t.length<26)return'sigh';
  if(/[？?]$/.test(t))return Math.random()<.5?'think':'hmm';
  if(/[！!]/.test(t))return/(上|冲|开火|去|杀|击|拦|突破|跟我|动手|轰)/.test(t)?'attack':(Math.random()<.5?'cheer':'ok');
  if(/明白|了解|收到|是的|好的|遵命|是，母巢/.test(t))return'ok';
  return Math.random()<.55?'hmm':'ok';
 }
 function speak(id,side,text,hint){
  if(!id||id==='overmind'){if(id==='overmind')play('overmind');return;}
  if(!ready())return;const tNow=performance.now();if(tNow-lastVox<260)return;lastVox=tNow;
  const {bank,rate}=voiceFor(id,side);const emo=emotion(text,hint);let slot=(BANK[bank]||BANK.v3)[emo]||'ok';let key=`${bank}_${slot}`;
  if(lastVoxKey[id]===key&&!hint){const alt={ok:'hmm',hmm:'ok',think:'hmm',obey:'hmm',cheer:'attack',attack:'cheer',laugh:'ok',sigh:'sad',sad:'sigh'}[slot];if(alt&&VOICE_DATA[`${bank}_${alt}`]){slot=alt;key=`${bank}_${alt}`;}}lastVoxKey[id]=key;
  const go=b=>{if(!b||!ctx)return;const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=b;s.playbackRate.value=rate*(0.95+Math.random()*.1);g.gain.value=bank==='v2'?.95:.85;s.connect(g);g.connect(voxBus);
   if(bank==='v2'){g.connect(verbSend);}s.start();};
  if(bufs[key])go(bufs[key]);else{const p=load(key);if(p)p.then(go);}
 }
 ['pointerdown','keydown','touchstart'].forEach(ev=>document.addEventListener(ev,e=>{if(e.isTrusted)unlock();},{capture:true}));
 document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden)ctx.suspend().catch(()=>{});else if(unlocked&&on())ctx.resume().catch(()=>{});});
 return{play,speak,unlock,emotion,setUnit,get state(){return{ctx:ctx?ctx.state:'none',unlocked,on:on(),voices:Object.keys(bufs).length};}};
})();

/* route every existing cue to the new engine */
sfx=type=>{if(type==='move'&&typeof S!=='undefined'&&S&&S.phase&&S.phase!=='player'){SND16.play('enemymove');return;}SND16.play(type);};
(function(){const pm=performMove;performMove=async function(m){try{SND16.setUnit(S&&S.units.find(v=>v.uid===m.uid));}catch(e){}return pm.apply(this,arguments);};})();
filmSound=type=>{if(type)SND16.play(type);};
if(location.hash==='#filmtest'||location.hash==='#qa')window.__MV_SND__=SND16;

/* film player: voice bark at the start of every spoken line, whoosh on scene changes, boom on title cards */
filmShotHook=function(shot,changed){
 if(shot.title){SND16.play('boom');return;}
 if(shot.objective){SND16.play('objective');return;}
 if(changed&&!shot.sfx)SND16.play(shot.black?'cut':'whoosh');
 if(shot.stamp&&!shot.sfx)setTimeout(()=>SND16.play('stamp'),120);
 if(shot.who&&shot.line&&shot.mode!=='narr'&&shot.mode!=='sys'){const side=shot.side||(typeof filmSide==='function'?filmSide(shot.who):'g');setTimeout(()=>SND16.speak(shot.who,side,shot.line,shot.emo),changed?260:60);}
};

/* in-battle voices: select bark, victim cry on kill / infection, attacker taunt */
(function(){
 let lastSel=null,lastSelT=0;
 const hc=handleCell;
 handleCell=async function(x,y){
  const before=selected;const r=await hc.apply(this,arguments);
  try{
   if(selected&&selected!==before&&S&&!S.outcome){
    const u=S.units.find(v=>v.uid===selected);
    if(u){SND16.play('select');const t=performance.now();if(u.char&&(u.char!==lastSel||t-lastSelT>4000)){lastSel=u.char;lastSelT=t;SND16.speak(u.char,u.side,'',u.side==='r'?'obey':(Math.random()<.6?'ok':'hmm'));}}
   }
  }catch(e){}
  return r;
 };
 const pm=performMove;
 performMove=async function(m,isPlayer){
  let u=null,target=null,mode=null;
  try{u=S&&S.units.find(v=>v.uid===m.uid);target=m.capture&&S?unitAt(S,m.x,m.y):null;mode=u&&target&&typeof captureMode==='function'?captureMode(u,target):null;}catch(e){}
  if(u&&u.char&&target&&!isPlayer)setTimeout(()=>SND16.speak(u.char,u.side,'',u.side==='r'?'attack':'attack'),80);
  if(u&&u.char&&target&&isPlayer)setTimeout(()=>SND16.speak(u.char,u.side,'',u.side==='r'?'attack':'attack'),40);
  const r=await pm.apply(this,arguments);
  try{if(target&&target.char){setTimeout(()=>SND16.speak(target.char,target.side,'',mode==='infect'?'scream':'pain'),mode==='infect'?380:160);}}catch(e){}
  return r;
 };
 // the bottom radio strip: bark when a character line appears
 const rb=document.querySelector('#game .radio-bar');
 if(rb){let last='';new MutationObserver(()=>{const n=(rb.querySelector('strong')||{}).textContent||'',p=(rb.querySelector('p')||{}).textContent||'';const k=n+p;if(k===last)return;last=k;
  let id=null;try{id=Object.keys(CHAR).find(c=>CHAR[c].name===n.trim());}catch(e){}if(id&&!document.getElementById('film')?.classList.contains('on'))SND16.speak(id,null,p);}).observe(rb,{childList:true,subtree:true,characterData:true});}
})();
