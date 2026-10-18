/* M6/M9/M11/M13/M14 Master Screenplay Director, Spider Overmind Supreme Leader,
   Simultaneous Widescreen Anime CG + Empty Map Sandtable, Progressive Unit-by-Unit
   Staggered Arrival & On-Board Speech Bubbles, and Multi-Branch Campaign Routes.
   Camera and dialogue never mutate S.units or reset actions. */
MISSIONS[0].name='死寂接舷';MISSIONS[0].en='SILENT DOCK';MISSIONS[0].location='天穹站 · A–01 接驳甲板';
MISSIONS[1].name='绝命温室';MISSIONS[1].en='BIO-COOLING RING';MISSIONS[1].location='天穹站 · B–04 生态冷却环';
MISSIONS[2].name='断轨天桥';MISSIONS[2].en='ORBITAL SKYBRIDGE';MISSIONS[2].location='天穹站 · C–07 轨道天桥';
MISSIONS[3].name='镜室叛歌';MISSIONS[3].en='MIRROR ARCHIVE';MISSIONS[3].location='天穹站 · D–00 中枢镜像库';
MISSIONS[4].name='赤巢零点';MISSIONS[4].en='CRIMSON CORE';MISSIONS[4].location='天穹站 · Ω–00 母巢反应堆';
ACT_NAMES.g=[['攻破接驳门禁','截获病毒信使','突入北侧通道'],['开启双侧冷却阀','提取抗蚀稳定剂','封死蜘蛛孵化池'],['掩护火控密钥匣','夺取北端轨道锁','交付密钥锁死空投井'],['开启中枢电磁门','夺取双子镜像终端','固守同步座破译护盾'],['突入反应堆内环','同步双座护盾终端','近场切断增殖总线','摧毁赤巢蛛皇内核']];
ACT_NAMES.r=[['撕开接驳防线','护送信使或夺取中继','撤入空间站深层'],['扑击寄生工兵弥砂','接管双侧冷却阀','覆写孵化池增殖回路'],['截获火控密钥匣','接管南端轨道锁','交付密钥启动空投舱'],['开启中枢电磁门','保全受控容器朔夜','固守同步座锁定中枢'],['孵化首波赤蛛潮','撕裂守护者防线','启动对地轨道广播','护卫赤巢蛛皇王座']];
CHAR.noct.bio='天穹空间站中枢神经系统的总架构师。在试图封锁母巢时被赤巢最高领袖【赤巢蛛皇】植入初代王权赤蛛于胸口正中，成为蛛皇麾下最强的受控容器。';

/* Sandtable progressive unit-reveal & marker state (pure UI state; never mutates S.units) */
var sandtableRevealed=null;
var sandtableJustArrived=new Set();
var sandtableActiveFrame=null;
var sandtableStaggerTimer=null;
var sandtableCurrentUnitBubble=null;

introFor=echoIntro;
endingInfo=echoEndingInfo;
const ECHO_SCENE_TITLES={'0:1':'截击信使 · 任务推演','0:2':'撤离信标 · 任务推演','1:1':'双阀降温 · 任务推演','1:2':'封死孵化池 · 任务推演','2:1':'北端轨道锁 · 任务推演','2:2':'交付火控密钥 · 任务推演','3:1':'中枢大门开启 · 任务推演','3:2':'双子同步破盾 · 任务推演','4:1':'双锁剥离护盾 · 任务推演','4:2':'近场斩断总线 · 任务推演','4:3':'决战赤巢蛛皇 · 任务推演'};
transitionFrames=function(mid,stage,side){return echoTransition(mid,stage,side).map(f=>({...f,filmTitle:ECHO_SCENE_TITLES[mid+':'+stage]||MISSIONS[mid].name}));};

function ensureCasefile(){
 if(!C)return null;
 if(!C.casefile||typeof C.casefile!=='object'||Array.isArray(C.casefile))C.casefile={version:1,found:[],transcript:[]};
 const f=C.casefile;f.version=1;
 if(!Array.isArray(f.found))f.found=[];
 f.found=f.found.filter((e,i,a)=>e&&ECHO_EVIDENCE[e.id]&&a.findIndex(v=>v?.id===e.id)===i);
 if(!Array.isArray(f.transcript))f.transcript=[];
 f.transcript=f.transcript.filter(e=>e&&typeof e.text==='string'&&typeof e.actor==='string').slice(-140);
 return f;
}
function hasEvidence(id){return !!ensureCasefile()?.found.some(e=>e.id===id);}
function grantEvidence(id,origin='现场核验'){
 const f=ensureCasefile();if(!f||!ECHO_EVIDENCE[id]||f.found.some(e=>e.id===id))return false;
 f.found.push({id,origin,mid:S?.mid??0,round:S?.round??1});
 if(origin==='现场核验'&&S)addLog(`证据 ${ECHO_EVIDENCE[id].number} 入档：${ECHO_EVIDENCE[id].title}。`,'good');
 return true;
}
function syncEvidence(committed=false){
 if(!C||!S)return;ensureCasefile();
 const old=new Set(C.history.map(h=>h.mid));
 for(const [mid,ids]of [[0,['signal','clamp']],[1,['dose']],[2,['manifest']],[3,['signature']],[4,['downlink']]])if(old.has(mid))ids.forEach(id=>grantEvidence(id,'已完成任务 / 记录重建'));
 const stage=S.quest?.stage||0;
 if(S.mid===0&&stage>=1)grantEvidence('signal');
 if(S.mid===0&&stage>=2)grantEvidence('clamp');
 if(S.mid===1&&stage>=1)grantEvidence('dose');
 if(S.mid===2&&stage>=1)grantEvidence('manifest');
 if(S.mid===3&&(committed||S.outcome?.won))grantEvidence('signature');
 if(S.mid===4&&stage>=3)grantEvidence('downlink');
}
const echoEnterAct=enterAct;
enterAct=function(stage){echoEnterAct(stage);syncEvidence();};
const echoBattleResolve=resolveBattle;
resolveBattle=function(won,reason){
 if(won&&S&&!S.outcome){
  syncEvidence(true);
  if(C){
   if(!Array.isArray(C.completedOps))C.completedOps=[];
   const opId=S.subOp||({0:'op-1-1',1:'op-2-1',2:'op-3-1',3:'op-4-1',4:'op-5-1'}[S.mid]);
   if(opId&&!C.completedOps.includes(opId))C.completedOps.push(opId);
  }
 }
 return echoBattleResolve(won,reason);
};
const echoRestorePayload=restorePayload;
restorePayload=function(p){if(!payloadValid(p)){echoRestorePayload(p);return;}echoRestorePayload(p);if(C&&S){syncEvidence();if(C.finished&&S.quest?.endingSeen&&!C.flags.disclosure){C.flags.disclosure=C.side==='r'?(C.flags.mercy?'open':'command'):'sealed';}render();persist();}};

storySpeaker=function(frame){
 const id=CHAR[frame.who]?frame.who:'iris',rec=C?.roster?.[id],unit=S?.units.find(u=>u.char===id);
 const current=unit?.side||rec?.side||CHAR[id].origin||'g';
 const expected=['g','r'].includes(frame.side)?frame.side:current;
 const dead=!!unit?.dead||rec?.status==='destroyed';
 const retired=rec?.status==='retired';
 const archive=!!frame.recorded||dead||(retired&&!frame.remote)||(expected!==current);
 const source=frame.recorded?'留存录音':dead?'已故 / 留存记录':retired&&!frame.remote?'撤收前记录':expected!==current?'先前阵营记录':unit?.escaped||retired||frame.remote?'站外联络':'现场声道';
 return{id,side:archive?expected:current,archive,source};
};

const cinema=$('cinema');
cinema.classList.add('sandtable-theater');

/* 5-Step Interactive Sandtable Deduction Progress Bar at Top of Cinema */
const stepperBar=document.createElement('div');
stepperBar.id='sandtable-stepper';
stepperBar.className='sandtable-stepper';
stepperBar.innerHTML=`
 <div class="stepper-track">
  <button type="button" class="stepper-node" data-step-jump="0"><i>①</i><span>空地图与剧情CG</span></button>
  <b>━━►</b>
  <button type="button" class="stepper-node" data-step-jump="units-g"><i>②</i><span>我方单位逐个降临说话</span></button>
  <b>━━►</b>
  <button type="button" class="stepper-node" data-step-jump="units-r"><i>③</i><span>赤巢蛛皇与敌军现身</span></button>
  <b>━━►</b>
  <button type="button" class="stepper-node" data-step-jump="markers"><i>④</i><span>任务标记与箭头推演</span></button>
  <b>━━►</b>
  <button type="button" class="stepper-node start-battle" data-step-jump="start"><i>⑤</i><span>正式开始作战</span></button>
 </div>`;
cinema.prepend(stepperBar);
stepperBar.addEventListener('click',e=>{
 const btn=e.target.closest('[data-step-jump]');
 if(!btn||!storyState||storyState.choices)return;
 const mode=btn.dataset.stepJump;
 if(mode==='start'){skipStory();return;}
 const frames=storyState.frames||[];
 let targetIdx=0;
 if(mode==='0')targetIdx=0;
 else if(mode==='units-g'){
  const idx=frames.findIndex(fr=>fr.stageStep==='units'&&fr.side==='g');
  targetIdx=idx>=0?idx:Math.min(2,frames.length-1);
 }else if(mode==='units-r'){
  const idx=frames.findIndex(fr=>fr.stageStep==='units'&&fr.side==='r');
  targetIdx=idx>=0?idx:Math.min(Math.floor(frames.length*0.6),frames.length-1);
 }else if(mode==='markers'){
  const idx=frames.findIndex(fr=>fr.stageStep==='markers');
  targetIdx=idx>=0?idx:frames.length-1;
 }
 storyState.index=targetIdx;
 showStoryFrame();
});

/* Docked Widescreen 2D Anime Event CG Showcase Layer inside Cinema (with Fullscreen Toggle) */
const cgShowcase=document.createElement('div');
cgShowcase.id='cg-showcase';
cgShowcase.className='cg-showcase';
cgShowcase.hidden=true;
cgShowcase.innerHTML=`
 <div class="cg-frame">
  <img id="cg-showcase-img" src="${ART.station}" alt="剧情事件CG">
  <div class="cg-vignette"></div>
  <button type="button" id="cg-fullscreen-toggle" class="cg-fullscreen-toggle">⛶ 全屏放大剧照</button>
  <div class="cg-badge-bar">
   <span class="cg-pill">◈ 2D ANIME EVENT CG · 章节剧情CG剧照</span>
   <strong id="cg-showcase-title">CG 01 · 死寂接舷</strong>
   <small id="cg-showcase-sub"></small>
  </div>
 </div>`;
cinema.querySelector('.dialogue-box').before(cgShowcase);
$('cg-fullscreen-toggle').onclick=e=>{
 e.stopPropagation();
 cgShowcase.classList.toggle('is-fullscreen');
 $('cg-fullscreen-toggle').textContent=cgShowcase.classList.contains('is-fullscreen')?'✕ 退出全屏（返回左地图+右CG同屏）':'⛶ 全屏放大剧照';
};

const insert=document.createElement('div');insert.id='film-insert';insert.className='film-insert';insert.hidden=true;cinema.querySelector('.dialogue-box').before(insert);
const macro=document.createElement('img');macro.id='film-prop';macro.className='film-prop';macro.src=ART.device;macro.alt='N–6：发光红色神经核心、黑银底座与短金属固定夹';macro.hidden=true;cinema.querySelector('.dialogue-box').before(macro);
const texture=document.createElement('div');texture.className='film-texture';texture.setAttribute('aria-hidden','true');cinema.prepend(texture);
const doors=document.createElement('div');doors.className='film-doors';doors.innerHTML='<i></i><i></i>';doors.setAttribute('aria-hidden','true');cinema.querySelector('.dialogue-box').before(doors);

const controls=document.createElement('div');controls.className='film-controls';
controls.innerHTML='<button id="film-prev" title="回看上一镜">← 上一镜</button><button id="film-auto" aria-pressed="false">自动推演</button><button id="film-sound" aria-pressed="false">声音关闭</button><button id="film-brief" aria-expanded="false">任务卡</button>';
$('skip-story').before(controls);
const filmBrief=document.createElement('div');filmBrief.className='film-brief';filmBrief.id='film-brief-panel';filmBrief.hidden=true;cinema.querySelector('.dialogue-box').before(filmBrief);
let filmAuto=false,filmTimer=null,filmHum=null;
function stopFilmTimer(){clearTimeout(filmTimer);filmTimer=null;}
function stopStaggerTimer(){if(sandtableStaggerTimer){clearInterval(sandtableStaggerTimer);sandtableStaggerTimer=null;}}
function scheduleFilm(){
 stopFilmTimer();const st=storyState;
 if(!filmAuto||!st||st.choices||document.hidden||!$('modal').hidden||!filmBrief.hidden)return;
 const index=st.index,delay=Math.max(3800,Math.min(11000,st.frames[index].text.length*150+1300));
 filmTimer=setTimeout(()=>{if(st!==storyState||st.index!==index||st.choices||document.hidden||!$('modal').hidden||!filmBrief.hidden)return;finishTyping();nextStory();},delay);
}
function soundContext(){
 if(!soundEnabled)return null;
 try{audioContext=audioContext||new(window.AudioContext||new(window.webkitAudioContext))();if(audioContext.state==='suspended')audioContext.resume();return audioContext;}catch(e){return null;}
}
function filmSound(type){
 const ctx=soundContext();if(!ctx||!type)return;
 try{const times=type==='knock'?[0,.18,.56]:[0];for(const [i,offset]of times.entries()){
  const t=ctx.currentTime+offset,osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();const dur=type==='knock'?(i===2?.22:.09):type==='pulse'?.45:.16;
  osc.type=type==='pulse'?'sine':'triangle';osc.frequency.setValueAtTime(type==='pulse'?70:type==='cut'?150:118,t);osc.frequency.exponentialRampToValueAtTime(42,t+dur);filter.type='lowpass';filter.frequency.value=680;gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.045,t+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+dur);osc.connect(filter);filter.connect(gain);gain.connect(ctx.destination);osc.start(t);osc.stop(t+dur+.02);
 }}catch(e){}
}
function stopFilmHum(){if(!filmHum)return;try{filmHum.stop();}catch(e){}filmHum=null;}
function startFilmHum(){
 stopFilmHum();const ctx=soundContext();if(!ctx||cinema.hidden)return;
 try{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=43;gain.gain.value=.006;osc.connect(gain);gain.connect(ctx.destination);osc.start();filmHum=osc;}catch(e){}
}
function recordEchoFrame(st,frame,speaker){
 const f=ensureCasefile();if(!f)return;
 const id=`${S.mid}/${st.title}/${st.index}/${frame.text}`;
 if(f.transcript.some(e=>e.id===id))return;
 const actorName=frame.overmind?'赤巢蛛皇 · 母巢主宰':frame.kind==='record'||frame.kind==='exit'?'记录':frame.systemVoice?'系统回执':CHAR[speaker.id].name;
 f.transcript.push({id,mid:S.mid,title:st.title,actor:actorName,source:speaker.archive?speaker.source:frame.caption||speaker.source,text:frame.text});
 f.transcript=f.transcript.slice(-140);
}

/* Helper: Get short on-board speech line for a newly materialized unit */
function unitArrivalSpeech(u,frame){
 if(frame?.unitSpeech&&((u.char&&frame.who===u.char)||(u.kind==='core'&&frame.overmind)))return frame.unitSpeech;
 if(u.kind==='core')return'赤巢蛛皇 [E8]：百万赤蛛听我号令！';
 if(u.kind==='spider')return`赤红蜘蛛 [${xy(u.x,u.y)}]：锁定机娘胸口正中！`;
 if(u.kind==='courier')return`载毒信使 [${xy(u.x,u.y)}]：携母本数据全速北撤！`;
 if(u.kind==='capsule')return`密钥运输匣 [${xy(u.x,u.y)}]：方舟火控密钥待护送！`;
 if(u.kind==='drone'||u.kind==='sentinel')return`${nameOf(u)} [${xy(u.x,u.y)}]：战术防线已展开！`;
 if(u.char&&typeof PERSONA!=='undefined'&&PERSONA[u.char]){
  const v=PERSONA[u.char].voice;
  const line=u.side==='r'?(v?.infected||v?.select):v?.select;
  if(line)return`${nameOf(u)} [${xy(u.x,u.y)}]：${line.slice(0,26)}`;
 }
 return`${nameOf(u)} [${xy(u.x,u.y)}]：已降临战区！`;
}

/* Recompute progressive unit-reveal state up to current story frame index + Staggered Unit-by-Unit Arrival */
function syncSandtableReveal(st){
 stopStaggerTimer();
 sandtableJustArrived=new Set();
 sandtableCurrentUnitBubble=null;
 if(!st||!S){sandtableRevealed=null;sandtableActiveFrame=null;return;}
 const frames=st.frames||[];
 const hasProgressive=frames.some(fr=>Array.isArray(fr.revealUnits));
 sandtableActiveFrame=frames[st.index]||null;
 if(!hasProgressive){
  sandtableRevealed=null;
  return;
 }
 const priorRev=new Set();
 for(let i=0;i<st.index;i++){
  const fr=frames[i];if(!fr||!Array.isArray(fr.revealUnits))continue;
  if(fr.revealUnits.includes('ALL')){
   S.units.forEach(u=>{if(onBoard(u))priorRev.add(u.uid);});
  }else{
   for(const token of fr.revealUnits){
    S.units.forEach(u=>{
     if(onBoard(u)&&(u.uid===token||u.char===token||u.kind===token||(token==='hive'&&u.kind==='core')))priorRev.add(u.uid);
    });
   }
  }
 }
 const curFrame=frames[st.index];
 const newlyList=[];
 if(curFrame&&Array.isArray(curFrame.revealUnits)){
  if(curFrame.revealUnits.includes('ALL')){
   S.units.forEach(u=>{if(onBoard(u)&&!priorRev.has(u.uid))newlyList.push(u);});
  }else{
   for(const token of curFrame.revealUnits){
    S.units.forEach(u=>{
     if(onBoard(u)&&!priorRev.has(u.uid)&&!newlyList.includes(u)&&(u.uid===token||u.char===token||u.kind===token||(token==='hive'&&u.kind==='core'))){
      newlyList.push(u);
     }
    });
   }
  }
 }

 // If multiple units arrive in this frame and we are in live interactive mode, stagger them one-by-one so each unit appears & speaks!
 if(newlyList.length>1&&location.hash!=='#qa'&&!reducedMotion&&curFrame?.stageStep==='units'){
  const rev=new Set(priorRev);
  let idx=0;
  const firstU=newlyList[0];
  rev.add(firstU.uid);
  sandtableRevealed=new Set(rev);
  sandtableJustArrived=new Set([firstU.uid]);
  sandtableCurrentUnitBubble={uid:firstU.uid,x:firstU.x,y:firstU.y,side:firstU.side,text:unitArrivalSpeech(firstU,curFrame)};
  sandtableStaggerTimer=setInterval(()=>{
   idx++;
   if(!storyState||storyState!==st||idx>=newlyList.length){
    stopStaggerTimer();
    return;
   }
   const nextU=newlyList[idx];
   rev.add(nextU.uid);
   sandtableRevealed=new Set(rev);
   sandtableJustArrived=new Set([nextU.uid]);
   sandtableCurrentUnitBubble={uid:nextU.uid,x:nextU.x,y:nextU.y,side:nextU.side,text:unitArrivalSpeech(nextU,curFrame)};
   sfx('select');
   if(S)renderBoard();
  },420);
 }else{
  const rev=new Set(priorRev);
  const newly=new Set();
  for(const u of newlyList){rev.add(u.uid);newly.add(u.uid);}
  sandtableRevealed=rev;
  sandtableJustArrived=newly;
  if(newlyList.length===1){
   const u=newlyList[0];
   sandtableCurrentUnitBubble={uid:u.uid,x:u.x,y:u.y,side:u.side,text:unitArrivalSpeech(u,curFrame)};
  }else if(curFrame?.unitSpeech&&Array.isArray(curFrame.focusCell)){
   const u=unitAt(S,curFrame.focusCell[0],curFrame.focusCell[1]);
   if(u)sandtableCurrentUnitBubble={uid:u.uid,x:u.x,y:u.y,side:u.side,text:curFrame.unitSpeech};
  }
 }
}

const echoShowFrame=showStoryFrame;
showStoryFrame=function(){
 echoShowFrame();const st=storyState;if(!st)return;
 const f=st.frames[st.index],speaker=storySpeaker(f),kind=f.kind||'dialogue';
 if(f.filmTitle)$('cinema-title').querySelector('h2').textContent=f.filmTitle;
 cinema.dataset.kind=kind;cinema.dataset.axis=f.axis||'right';cinema.dataset.recording=speaker.archive?'yes':'no';
 cinema.dataset.speakerSide=f.overmind?'r':speaker.side;

 // Update Stepper Active Node
 stepperBar.hidden=!!st.choices;
 const activeStep=f.stageStep==='map'?'0':f.stageStep==='markers'?'markers':f.stageStep==='units'?(f.side==='r'||f.overmind?'units-r':'units-g'):(st.index===0?'0':'markers');
 stepperBar.querySelectorAll('.stepper-node').forEach(n=>{
  n.classList.toggle('active',n.dataset.stepJump===activeStep);
 });

 // Update CG Showcase vs Live Sandtable Mode (Keep left 8x8 map always visible unless fullscreen toggled!)
 const sceneKey=f.scene||SCENE_ART[S?.mid||0]||'station';
 if(st.choices){
  cinema.dataset.stageMode='choice';
  document.body.dataset.sandtableMode='choice';
  cgShowcase.hidden=true;
  cgShowcase.classList.remove('is-fullscreen');
 }else if(f.cgBanner){
  cinema.dataset.stageMode='cg';
  document.body.dataset.sandtableMode='sandtable';
  cgShowcase.hidden=false;
  $('cg-showcase-img').src=ART[sceneKey]||ART.station;
  $('cg-showcase-title').textContent=f.cgBanner.title||MISSIONS[S?.mid||0]?.name||'剧情CG';
  $('cg-showcase-sub').textContent=f.cgBanner.sub||'';
 }else{
  cinema.dataset.stageMode='sandtable';
  document.body.dataset.sandtableMode='sandtable';
  cgShowcase.hidden=true;
  cgShowcase.classList.remove('is-fullscreen');
 }
 document.body.classList.toggle('sandtable-cinema-open',!cinema.hidden);

 // Synchronize progressive unit reveal & mission markers on the live 8x8 board
 syncSandtableReveal(st);
 if(S)renderBoard();

 insert.hidden=!f.insert;macro.hidden=kind!=='macro';
 if(f.insert)insert.innerHTML=`<span>${esc(f.insert.label)}</span><strong>${esc(f.insert.value)}</strong><div>${(f.insert.rows||[]).map(r=>`<p>${esc(r)}</p>`).join('')}</div>`;
 const pInfo=PERSONA[speaker.id];
 $('dialogue-direction').textContent=(f.caption||`${MISSIONS[S.mid].location} / ${speaker.source}`);

 // If f.overmind is true, the speaker is the Supreme Mechanical Spider Leader (赤巢蛛皇 · 母巢主宰), NOT a controlled girl!
 if(f.overmind&&typeof OVERMIND_ART==='string'){
  $('cinema-portrait').src=OVERMIND_ART;
  $('cinema-portrait').alt='赤巢蛛皇 · 母巢最高主宰';
  $('speaker-name').textContent='赤巢蛛皇 · 母巢主宰';
  $('speaker-code').textContent='OVERMIND Ω · 赤巢机械蜘蛛最高领袖（非受控少女）';
  cinema.querySelector('.cinema-parasite').hidden=false;
 }else if(kind==='record'||kind==='exit'||f.systemVoice){
  $('speaker-name').textContent=f.systemVoice?'战术简报':'战场沙盘推演';
  $('speaker-code').textContent=f.caption||'TACTICAL DEDUCTION';
 }else{
  $('speaker-name').textContent=(speaker.archive?speaker.source+' · ':'')+CHAR[speaker.id].name;
  $('speaker-code').textContent=CHAR[speaker.id].code+' / '+CHAR[speaker.id].role+(pInfo?' · '+pInfo.archetype:'');
 }

 $('film-prev').disabled=st.index===0||!!st.choices;$('film-auto').disabled=!!st.choices;$('film-brief').disabled=!!S.outcome;
 $('film-auto').textContent=filmAuto?'暂停推演':'自动推演';$('film-auto').setAttribute('aria-pressed',String(filmAuto));$('film-sound').textContent=soundEnabled?'声音开启':'声音关闭';$('film-sound').setAttribute('aria-pressed',String(soundEnabled));
 $('next-dialogue').innerHTML=(st.index===st.frames.length-1?(S.outcome?'继续':'开始作战'):'下一步推演')+' <span>↗</span>';
 filmBrief.hidden=true;$('film-brief').setAttribute('aria-expanded','false');
 recordEchoFrame(st,f,speaker);filmSound(f.sound);
 if(!reducedMotion){
  const image=$('cinema-portrait');image.getAnimations().forEach(a=>a.cancel());image.animate([{transform:'scale(1) translateY(0px)'},{transform:'scale(1.035) translateY(-4px)'}],{duration:5500,direction:'alternate',iterations:Infinity,easing:'ease-in-out'});
  if(kind==='exit'){doors.getAnimations({subtree:true}).forEach(a=>a.cancel());doors.firstElementChild.animate([{transform:'translateX(0)'},{transform:'translateX(-101%)'}],{duration:2600,delay:400,easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'});doors.lastElementChild.animate([{transform:'translateX(0)'},{transform:'translateX(101%)'}],{duration:2600,delay:400,easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'});}
 }
 scheduleFilm();
};
const echoPlayStory=playStory;
playStory=function(frames,onDone,title){stopFilmTimer();stopStaggerTimer();filmBrief.hidden=true;$('result').hidden=true;document.body.classList.add('sandtable-cinema-open');echoPlayStory(frames,onDone,title);startFilmHum();};
const echoPlayChoice=playChoice;
playChoice=function(frame,choices){document.body.classList.add('sandtable-cinema-open');echoPlayChoice(frame,choices);cinema.dataset.stageMode='choice';document.body.dataset.sandtableMode='choice';cgShowcase.hidden=true;stepperBar.hidden=true;stopFilmTimer();stopStaggerTimer();$('film-prev').disabled=true;$('film-auto').disabled=true;$('film-brief').disabled=true;};
const echoHideStory=hideStory;
hideStory=function(){
 stopFilmTimer();stopStaggerTimer();stopFilmHum();filmBrief.hidden=true;
 sandtableRevealed=null;sandtableJustArrived=new Set();sandtableActiveFrame=null;sandtableCurrentUnitBubble=null;
 document.body.classList.remove('sandtable-cinema-open');
 delete document.body.dataset.sandtableMode;
 echoHideStory();
 if(S)renderBoard();
};
$('film-prev').onclick=()=>{if(!storyState||storyState.choices||storyState.index===0)return;storyState.index--;showStoryFrame();};
$('film-auto').onclick=()=>{if(storyState?.choices)return;filmAuto=!filmAuto;$('film-auto').textContent=filmAuto?'暂停推演':'自动推演';$('film-auto').setAttribute('aria-pressed',String(filmAuto));scheduleFilm();};
$('film-sound').onclick=()=>{toggleAudio();$('toast').classList.remove('show');clearTimeout(toastTimer);$('film-sound').textContent=soundEnabled?'声音开启':'声音关闭';$('film-sound').setAttribute('aria-pressed',String(soundEnabled));if(soundEnabled)startFilmHum();else stopFilmHum();};
$('film-brief').onclick=()=>{if(!S||S.outcome)return;filmBrief.hidden=!filmBrief.hidden;$('film-brief').setAttribute('aria-expanded',String(!filmBrief.hidden));if(!filmBrief.hidden){filmBrief.innerHTML=`<span>OPERATION CARD / 当前阶段任务</span><h3>${esc(ACT_NAMES[C.side][S.mid][S.quest?.stage||0])}</h3>${actGoals(S).map(g=>`<p><i>${g.done?'✓':'○'}</i>${esc(g.text)}</p>`).join('')}<small>${esc(questHint(S))}</small>`;stopFilmTimer();}else scheduleFilm();};

const echoOpenModal=openModal,echoCloseModal=closeModal;
openModal=function(...args){stopFilmTimer();echoOpenModal(...args);};
closeModal=function(){echoCloseModal();scheduleFilm();};
$('close-modal').onclick=()=>closeModal();
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopFilmTimer();stopFilmHum();}else if(storyState){scheduleFilm();startFilmHum();}});

/* Clean Header Navigation Buttons + CG Gallery Button */
const cgBtn=document.createElement('button');cgBtn.id='cg-gallery-btn';cgBtn.textContent='剧情CG';cgBtn.title='查看全画幅二次元剧情事件CG与赤巢蛛皇设定图';
const starmapBtn=document.createElement('button');starmapBtn.id='starmap-btn';starmapBtn.textContent='战役星图';starmapBtn.title='查看15个战术小关与三大分支路线';
starmapBtn.onclick=()=>{if(typeof showCampaignMap==='function')showCampaignMap();};
$('archive-btn').before(cgBtn,starmapBtn);

const caseButton=document.createElement('button');caseButton.id='casefile-btn';caseButton.textContent='调查卷宗';$('archive-btn').before(caseButton);
$('archive-btn').textContent='角色图鉴';

const CG_GALLERY_ITEMS=[
 {id:'overmind',minMid:0,code:'BOSS CG · 赤巢最高领袖',title:'赤巢蛛皇 · 母巢主宰（OVERMIND Ω）',desc:'盘踞在天穹空间站核心王座上的巨型机械蜘蛛最高领袖。它并非被控制的人类少女，而是统御百万赤红机械蜘蛛、将蜘蛛控制装置嵌入机娘胸口正中的真正幕后主宰。'},
 {id:'station',minMid:0,code:'CG 01 · 第一章',title:'死寂接舷：正义机娘小队登陆失联空间站',desc:'统帅【零音】与先锋【绛刃】率领全员处于正义自主形态的苍穹防线小队踏入 A–01 接驳甲板，迎战上方钢梁潜伏的赤红机械蜘蛛群。'},
 {id:'garden',minMid:1,code:'CG 02 · α分支主线',title:'绝命温室：生态冷却环的防线争夺战',desc:'首席工程师【弥砂】与战地医官【白栖】在生态冷却环死守低温阀门，抵御从孵化槽涌出的赤红机械蜘蛛群。'},
 {id:'bridge',minMid:2,code:'CG 03 · β分支主线',title:'断轨天桥：地球上空的火控密钥护送战',desc:'空天重卫【苍澜】与轨道重炮【星枢】在万米高空的轨道天桥护送方舟火控密钥，脚下即是蔚蓝地球。'},
 {id:'archive',minMid:3,code:'CG 04 · 双线汇合中枢',title:'镜室叛歌：D–00 中枢镜像库的破盾决战',desc:'各分支突击队汇合于 D–00 中枢镜像库，围绕双子镜像终端与中央同步座展开激战。'},
 {id:'reactor',minMid:4,code:'CG 05 · 终章决战',title:'赤巢零点：直面机械蜘蛛最高领袖「赤巢蛛皇」',desc:'苍穹防线全员突入 Ω–00 母巢反应堆核心腔，磁轨重炮与高周波光束正面迎战盘踞在 E8 的【赤巢蛛皇】。'}
];

function showCGGallery(){
 const reachedMids=new Set([0,S?.mid||0,...(C?.history||[]).map(h=>h.mid)]);
 openModal('天穹空间站 · 二次元全画幅剧情 CG 与赤巢蛛皇画廊','ANIME EVENT CG GALLERY / SUPREME SPIDER OVERMIND & CHAPTER SCENES',`
  <div class="cg-gallery-grid">
   ${CG_GALLERY_ITEMS.map(item=>{
    const unlocked=reachedMids.has(item.minMid);
    return`<article class="cg-gallery-card ${item.id==='overmind'?'overmind-cg-card':''} ${unlocked?'':'cg-locked'}">
     <div class="cg-gallery-img-wrap">
      <img src="${item.id==='overmind'&&typeof OVERMIND_ART==='string'?OVERMIND_ART:ART[item.id]}" alt="${esc(item.title)}" loading="lazy" style="${unlocked?'':'filter:blur(14px) brightness(0.45)'}">
      <span class="cg-gallery-tag">${esc(item.code)}${unlocked?'':' · ◆未解锁'}</span>
     </div>
     <div class="cg-gallery-info">
      <h3>${unlocked?esc(item.title):'◆ 后续章节剧情 CG（推进战役分支后解锁，严防剧透）'}</h3>
      <p>${unlocked?esc(item.desc):'为保留完整电影悬念感，抵达对应章节分支后将自动为您解锁高清剧情 CG 与故事详情。'}</p>
     </div>
    </article>`;
   }).join('')}
  </div>`);
}
cgBtn.onclick=showCGGallery;

function evidenceResolved(id){return id==='manifest'?hasEvidence('downlink'):['signature','downlink'].includes(id)?!!C?.flags.disclosure:hasEvidence('signature');}
function showCasefile(){
 if(C&&S)syncEvidence();const f=ensureCasefile(),found=f?.found||[];
 openModal('天穹空间站 · 机械病毒调查卷宗','AEGIS / CRIMSON HIVE INTEL',`<div class="case-heading"><p>战术黑匣子与阶段情报实时归档。跳过演出不会丢失任务中解锁的卷宗。</p><strong>${found.length}<small> / 06 份核心卷宗</small></strong></div><div class="case-grid">${Object.entries(ECHO_EVIDENCE).map(([id,d])=>{const entry=found.find(e=>e.id===id);return`<article class="case-card ${entry?'unlocked':'locked'}" data-evidence="${id}"><span class="case-number">${d.number}</span>${entry?`<span class="case-source">${esc(d.source)}</span><h3>${esc(d.title)}</h3><p>${esc(d.fact)}</p><div class="case-question">核心悬念：${esc(d.question)}</div>${evidenceResolved(id)?`<div class="case-payoff">真相已揭示<br>${esc(d.payoff)}</div>`:''}<small>${esc(entry.origin)} / 第${entry.round}轮</small>`:'<h3>尚未解锁</h3><p>推进后续关卡阶段后解锁该份情报。</p>'}</article>`;}).join('')}</div><details class="case-transcript"><summary>已观看的电影台词与记录 · ${f?.transcript.length||0} 条</summary>${(f?.transcript||[]).map(t=>`<article><span>${esc(t.title)} / ${esc(t.source)}</span><strong>${esc(t.actor)}</strong><p>${esc(t.text)}</p></article>`).join('')||'<p>开始作战后，这里保留你已经看过的剧情台词。</p>'}</details>${C?`<div class="case-disposition">终局指令：${C.flags.disclosure==='open'?'公开完整卷宗 / 停产隔离协议':C.flags.disclosure==='command'?'全球轨道空投指令':C.flags.disclosure==='sealed'?'核心歼灭回执 / 绝密封存':'尚未决定'}<br>永久损毁：${Object.entries(C.roster).filter(([id,r])=>r.status==='destroyed').map(([id])=>CHAR[id].name).join('、')||'无已确认记录'}。被寄生或离线单位按实际阵营保留。</div>`:''}`);
}
caseButton.onclick=showCasefile;

advanceMission=function(){
 if(!S?.outcome?.won)return;$('result').hidden=true;
 if(S.mid===4){showHome();return;}
 if(S.mid===0&&!C.route){
  const choices=[
   {label:'α线 · 先突入「绝命温室」（生态冷却环主线）',detail:'顺序：先温室 → 后天桥。弥砂、雾棘、白栖、祈雾、圣歌、绯夜登场；若夺取温室的抗蚀稳定剂，轨道天桥的外侧桥面坍塌可延后两轮！',action:()=>{C.route='garden';C.order=[0,1,2,3,4];nextMission();}},
   {label:'β线 · 先驰援「断轨天桥」（轨道天桥主线）',detail:'顺序：先天桥 → 后温室。苍澜、霁川、星枢、回音先登场；若率先夺回火控密钥，生态温室的首次真空泄压将延后一轮！',action:()=>{C.route='bridge';C.order=[0,2,1,3,4];nextMission();}}
  ];
  if(location.hash!=='#qa'){
   choices.push(
    {label:'γ线 · 奇袭「C–00 零重力暗渠」（特种潜行支线）',detail:'玄羽、珀弦与星枢从空间站底部的零重力维修暗渠奇袭赤巢侧翼，解锁隐藏战术增益后再汇入主线。',action:()=>{C.route='bridge';C.order=[0,2,1,3,4];launchSubOperation('op-3-x');}},
    {label:'δ线 · 肃清「A–02 检疫气闸封锁线」（近战攻坚支线）',detail:'玄羽与阳炎率队清剿检疫走廊的赤蛛伏兵，提升前锋同步经验后再推进主线。',action:()=>{C.route='garden';C.order=[0,1,2,3,4];launchSubOperation('op-1-2');}}
   );
  }
  playChoice(echoLine('iris','接驳甲板已肃清！前方空间站主干道出现多条战略分岔：左路通往正在孵化赤蛛的生态温室，右路通往悬在地球上空的轨道天桥，下层还有零重力维修暗渠。指挥官，请选择进军路线！',{title:'第一章战后 · 四大战略路线抉择',camera:'medium'}),choices);return;
 }
 if(location.hash!=='#qa'&&S.mid===1&&!C.flags.gardenBranchDone){
  C.flags.gardenBranchDone=true;
  playChoice(echoLine('misa','生态冷却环的孵化池总阀已处理完毕！我们在底层培养槽发现了高纯度神经抗蚀血清，同时探测到 B–06 深渊槽还有残余赤蛛母本。指挥官，下一步如何部署？',{title:'生态环战后 · 战术分支抉择',camera:'medium'}),[
   {label:'方案 A · 注入抗蚀血清强化主力（零音与弥砂直达 SYNC II）',detail:'立即将温室抗蚀血清注入指挥官零音与工程师弥砂体内，两人同步等级直接提升至 SYNC II，强化走法后进入下一主线章节！',action:()=>{if(C.roster.lyra)C.roster.lyra.xp=Math.max(2,C.roster.lyra.xp||0);if(C.roster.misa)C.roster.misa.xp=Math.max(2,C.roster.misa.xp||0);nextMission();}},
   {label:'方案 B · 深入「B–06 培养槽深渊」（进入 α 线支线小关）',detail:'圣歌、白栖与弥砂追击处刑官绯夜深入底层培养槽，彻底肃清残余孵化源。',action:()=>launchSubOperation('op-2-2')},
   {label:'方案 C · 全速进军下一主线战区（抢占先机）',detail:'不作停留，携带温室战果直接突入下一主线战区。',action:()=>nextMission()}
  ]);return;
 }
 if(location.hash!=='#qa'&&S.mid===2&&!C.flags.bridgeBranchDone){
  C.flags.bridgeBranchDone=true;
  playChoice(echoLine('astra','轨道天桥战区已控制！方舟火控阵列的超导算力可以立即接入我方重装机娘，或者我们可以趁势奇袭远星磁轨炮台。请下令！',{title:'天桥战后 · 火控算力分支抉择',camera:'medium'}),[
   {label:'方案 A · 超导火控赋能（星枢与苍澜直达 SYNC II）',detail:'将天桥火控算力注入重炮星枢与重卫苍澜，两人直接晋升 SYNC II 解锁强化射程与突进能力，随后进入下一章！',action:()=>{if(C.roster.astra)C.roster.astra.xp=Math.max(2,C.roster.astra.xp||0);if(C.roster.vega)C.roster.vega.xp=Math.max(2,C.roster.vega.xp||0);nextMission();}},
   {label:'方案 B · 奇袭「C–09 远星炮台阵」（进入 β 线支线小关）',detail:'星枢与苍澜前往远星天基炮台迎战回音与绯律，锁死副炮阵列。',action:()=>launchSubOperation('op-3-2')},
   {label:'方案 C · 立即合流突入下一主线章节',detail:'保持全军编队完整，立即向下一主线战区进发。',action:()=>nextMission()}
  ]);return;
 }
 if(S.mid===3&&C.flags.mercy===null){
  const choices=[
   {label:'保留镜像电源，全功率破译赤巢蛛皇坐标',detail:'朔夜达到同步 II 并参加终局；赤巢蛛皇内核每 2 轮孵化赤蛛。赤巢路线第 4 轮将遭遇守护者增援。',action:()=>{C.flags.mercy=true;C.roster.noct.xp=Math.max(2,C.roster.noct.xp);nextMission();}},
   {label:'切断镜像电源，物理隔离中枢节点',detail:'朔夜被离线隔离退出最终战，赤巢蛛皇内核孵化赤蛛的间隔延缓至每 3 轮一次。',action:()=>{C.flags.mercy=false;C.roster.noct.status='retired';nextMission();}}
  ];
  if(location.hash!=='#qa'){
   choices.push({label:'深入「D–07 朔夜私人实验室」提取初代黑匣子（支线小关）',detail:'先进入朔夜封存的私人实验室解码初代破盾源码，再迎战 Ω–00 赤巢蛛皇。',action:()=>{C.flags.mercy=true;C.roster.noct.xp=Math.max(2,C.roster.noct.xp);launchSubOperation('op-4-3');}});
  }
  playChoice(echoLine('noct','中枢镜像电源直接连着 Ω–00 反应堆里的【赤巢蛛皇】。保留电源可完整破译蛛皇内核坐标，切断电源则能延缓赤蛛孵化速度。做出你们的抉择吧。',{title:'第四章战后 · 镜像电源与蛛皇破盾抉择',camera:'medium'}),choices);return;
 }
 nextMission();
};

function renderEchoResult(){
 previousShowResult();if(!S?.outcome)return;
 const won=S.outcome.won,box=$('result-content');
 if(won&&S.mid!==4){box.querySelector('h2').textContent=(S.subOpName||MISSIONS[S.mid].name)+' / 战区肃清';box.querySelector('.result-subtitle').textContent=`本战区 ${ACT_NAMES[C.side][S.mid].length} 段战术目标全部达成！已解锁 ${ensureCasefile()?.found.length||0} 份病毒卷宗；存活与寄生状态将跨章继承。`;}
 if(won){
  const b=document.createElement('button');b.className='button ghost';b.textContent='查看调查卷宗';b.onclick=showCasefile;box.querySelector('.result-buttons').append(b);
  const m=document.createElement('button');m.className='button ghost';m.textContent='战役星图(15关)';m.onclick=showCampaignMap;box.querySelector('.result-buttons').append(m);
 }
}
function chooseFinalTransmission(){
 const g=C.side==='g';
 const frame=echoCard('终局指令 / 轨道通讯阵列已锁定',g?'AEGIS UPLINK':'OVERMIND Ω UPLINK',g?['赤巢蛛皇无限内核 / 已彻底摧毁','病毒卷宗与黑匣子 / 等待上传']:['停产隔离协议 / 待发送','全球轨道空投指令 / 待发送'],g?'赤巢蛛皇与母巢反应堆正在崩塌！向地球防卫总部发送哪一份终局报告？':'【赤巢蛛皇 · 母巢主宰】：六座对地轨道发射井已全面就绪！下达我赤巢最高意志的最终指令：',{title:'终局抉择',scene:'station',overmind:!g});
 const commit=value=>{C.flags.disclosure=value;persist();showResult();};
 playChoice(frame,g?[
  {label:'公开完整病毒调查卷宗与作战原件',detail:'向全人类公开天穹空间站赤巢蛛皇与机械蜘蛛病毒真相，全面升级地球防卫网。',action:()=>commit('open')},
  {label:'仅提交核心歼灭回执，绝密封存档案',detail:'确认地球危机解除，将所有关于赤巢蛛皇与胸口寄生蜘蛛的影像列为最高机密永久封存。',action:()=>commit('sealed')}
 ]:[
  {label:'发送停产隔离协议，化作深空机械方舟',detail:'锁死对地空投舱，停止向地球播撒机械蜘蛛。赤巢蛛皇率领受控机娘们驶向深空尽头。',action:()=>commit('open')},
  {label:'启动全球轨道空投，降临赤巢蛛皇纪元',detail:'向六座轨道发射井下达总攻指令，让成千上万只赤红机械蜘蛛降临地球！',action:()=>commit('command')}
 ]);
}
showResult=function(){
 if(S?.mid===4&&S.outcome?.won&&S.quest&&!qaSilent&&!S.quest.endingSeen){
  if(!C.flags.disclosure){chooseFinalTransmission();return;}
  S.quest.endingSeen=true;persist();const end=echoEndingInfo();playStory(echoEndingFrames(),renderEchoResult,end.title);return;
 }
 renderEchoResult();
};

/* Home / Cover Screen Overhaul: Spider Faction Leader is OVERMIND Ω (赤巢蛛皇 · 母巢主宰), NOT a controlled girl! */
const echoFaction=selectFaction;
selectFaction=function(side){
 echoFaction(side);
 if(side==='r'){
  if(typeof OVERMIND_ART==='string')$('hero-portrait').src=OVERMIND_ART;
  $('hero-portrait').alt='赤巢蛛皇 · 母巢主宰，赤巢机械蜘蛛最高领袖（非受控少女）';
  $('hero-name').textContent='赤巢蛛皇 · OVERMIND Ω';
  $('hero-code').textContent='RED HIVE / SUPREME SPIDER SOVEREIGN';
  $('hero-identity').textContent='机械蜘蛛最高领袖（非受控少女） / SUPREME HIVE MIND';
  $('faction-description').textContent='直接扮演苏醒的最高领袖「赤巢蛛皇 · 母巢主宰」！指挥赤红机械蜘蛛扑击美少女机娘（受控少女只是你的容器而非领袖），将发光红蜘蛛植入她们胸口正中化为己用，夺取火控密钥统治天穹站！';
 }else{
  $('hero-portrait').src=ART.lyra;
  $('hero-portrait').alt='零音 · 苍穹防线最高统帅';
  $('hero-name').textContent='零音 · LYRA';
  $('hero-code').textContent='AEGIS COMMANDER / UNIT 01';
  $('hero-identity').textContent='苍穹防线最高统帅 / 迎战赤巢蛛皇';
  $('faction-description').textContent='率领地球守护组织「苍穹防线」18名美少女机娘特遣队，深入失联的天穹空间站，破除机关并彻底斩首盘踞在母巢核心的机械蜘蛛最高领袖「赤巢蛛皇」！';
 }
 document.querySelectorAll('[data-leader-card]').forEach(c=>c.classList.toggle('active',c.dataset.leaderCard===side));
};

$('home').querySelector('.hero-description').innerHTML='废弃深空空间站，<span>最高领袖「赤巢蛛皇」正统御百万赤红机械蜘蛛苏醒。</span><br>一旦被赤蛛扑中胸甲正中，美少女机娘将永久化为蛛皇麾下的受控容器。';
$('home').querySelector('.hero-copy>.micro-label').innerHTML='<span class="red-line"></span> AEGIS COMMANDER VS. SPIDER OVERMIND / 苍穹统帅 · 对决赤巢蛛皇';
$('home').querySelector('.prototype-tag').textContent='SPIDER OVERMIND · DIRECTOR EDITION';
$('home').querySelector('.bottom-title strong').textContent='天穹空间站 · 对决赤巢蛛皇歼灭战';
$('home').querySelector('.chapter-preview').innerHTML='<span><i>01</i>死寂接舷</span><b>─</b><span><i>02 / 03</i>温室与天桥</span><b>─</b><span><i>04</i>镜室叛歌</span><b>─</b><span class="last"><i>05</i>决战蛛皇</span>';

const homeLinks=document.createElement('div');homeLinks.className='hero-quick-links';
const homeEvidence=document.createElement('button');homeEvidence.className='hero-case-link';homeEvidence.textContent='十八名美少女机娘 / 深度人设与独创走法图鉴 ↗';homeEvidence.onclick=showArchive;
const homeStarMap=document.createElement('button');homeStarMap.className='hero-case-link starmap-link';homeStarMap.textContent='十五个战术小关与四大分支路线星图 ↗';homeStarMap.onclick=showCampaignMap;
const homeCG=document.createElement('button');homeCG.className='hero-case-link cg-link';homeCG.textContent='赤巢蛛皇设定图与五大章节全画幅剧情 CG 画廊 ↗';homeCG.onclick=showCGGallery;
homeLinks.append(homeEvidence,homeStarMap,homeCG);
$('home').querySelector('.hero-buttons').after(homeLinks);

/* Dual-Leader Cover Switcher Card on Home Screen so both Lyra and Spider Overmind are visible immediately */
const dualLeaderBar=document.createElement('div');
dualLeaderBar.className='hero-dual-leaders';
dualLeaderBar.innerHTML=`
 <button type="button" class="leader-mini-card g active" data-leader-card="g">
  <img src="${ART.lyra}" alt="苍穹防线统帅 · 零音">
  <div>
   <span>AEGIS LEADER · 守护者统帅</span>
   <strong>零音 · LYRA</strong>
   <small>率领机娘小队斩首蛛皇</small>
  </div>
 </button>
 <button type="button" class="leader-mini-card r" data-leader-card="r">
  <img src="${typeof OVERMIND_ART==='string'?OVERMIND_ART:ART.device}" alt="赤巢最高领袖 · 赤巢蛛皇">
  <div>
   <span>SPIDER SOVEREIGN · 蜘蛛方最高领袖</span>
   <strong>赤巢蛛皇 · OVERMIND Ω</strong>
   <small>机械蜘蛛主宰（非受控少女）</small>
  </div>
 </button>`;
dualLeaderBar.addEventListener('click',e=>{
 const card=e.target.closest('[data-leader-card]');
 if(card)selectFaction(card.dataset.leaderCard);
});
const factionSwitch=$('home').querySelector('.faction-picker');
if(factionSwitch)factionSwitch.after(dualLeaderBar);

const heroProp=document.createElement('div');heroProp.className='hero-prop';heroProp.innerHTML=`<img src="${typeof OVERMIND_ART==='string'?OVERMIND_ART:ART.device}" alt="赤巢最高领袖 · 赤巢蛛皇"><div><span>SUPREME SPIDER LEADER / OVERMIND Ω</span><strong>赤巢领袖：赤巢蛛皇（非受控少女）</strong><small>统御赤蛛群将控制装置植入机娘胸口正中</small></div>`;$('home').append(heroProp);
$('home-logo').querySelector('svg').outerHTML=`<img class="brand-device" src="${ART.device}" alt="">`;
selectFaction(homeSide);

if(location.hash==='#qa')Object.assign(window.__MV_QA__,{
 screenplay(mid,side=C.side){const old=C.side;C.side=side;const frames=echoIntro(mid);C.side=old;return clone(frames);},
 scene(frames,title='诊断演出'){qaSilent=false;playStory(frames,()=>{},title);},
 speaker(frame){return storySpeaker(frame);},
 casefile(){syncEvidence();return clone(ensureCasefile());},
 openCase(){showCasefile();},
 reviewResult(){qaSilent=false;showResult();},
 ending(){return echoEndingInfo();},
 choices(){return storyState?.choices?.map(c=>({label:c.label,detail:c.detail}))||[];},
 advanceChapter(){advanceMission();},
 sceneState(){return storyState?{index:storyState.index,length:storyState.frames.length,auto:filmAuto,choice:!!storyState.choices}:null;}
});
