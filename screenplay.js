/* M6/M9/M11/M13 Master Screenplay Director, Full-Screen Anime CG Showcase,
   Live Sandtable Unit-by-Unit Materialization & Mission Marker Choreography.
   Camera and dialogue never mutate S.units or reset actions. */
MISSIONS[0].name='死寂接舷';MISSIONS[0].en='SILENT DOCK';MISSIONS[0].location='天穹站 · A–01 接驳甲板';
MISSIONS[1].name='绝命温室';MISSIONS[1].en='BIO-COOLING RING';MISSIONS[1].location='天穹站 · B–04 生态冷却环';
MISSIONS[2].name='断轨天桥';MISSIONS[2].en='ORBITAL SKYBRIDGE';MISSIONS[2].location='天穹站 · C–07 轨道天桥';
MISSIONS[3].name='镜室叛歌';MISSIONS[3].en='MIRROR ARCHIVE';MISSIONS[3].location='天穹站 · D–00 中枢镜像库';
MISSIONS[4].name='赤巢零点';MISSIONS[4].en='CRIMSON CORE';MISSIONS[4].location='天穹站 · Ω–00 母巢反应堆';
ACT_NAMES.g=[['攻破接驳门禁','截获病毒信使','突入北侧通道'],['开启双侧冷却阀','提取抗蚀稳定剂','封死蜘蛛孵化池'],['掩护火控密钥匣','夺取北端轨道锁','交付密钥锁死空投井'],['开启中枢电磁门','夺取双子镜像终端','固守同步座破译护盾'],['突入反应堆内环','同步双座护盾终端','近场切断增殖总线','摧毁赤巢无限内核']];
ACT_NAMES.r=[['撕开接驳防线','护送信使或夺取中继','撤入空间站深层'],['扑击寄生工兵弥砂','接管双侧冷却阀','覆写孵化池增殖回路'],['截获火控密钥匣','接管南端轨道锁','交付密钥启动空投舱'],['开启中枢电磁门','保全受控架构师朔夜','固守同步座锁定中枢'],['孵化首波赤蛛潮','撕裂守护者防线','启动对地轨道广播','死守赤巢内核至十二轮']];
CHAR.noct.bio='天穹空间站中枢神经系统的总架构师。在试图封锁母巢内核时被赤蛛王寄生于胸口正中，她的中枢镜像里保存着破除赤巢内核无敌护盾的唯一密钥。';

/* Sandtable progressive unit-reveal & marker state (pure UI state; never mutates S.units) */
var sandtableRevealed=null;
var sandtableJustArrived=new Set();
var sandtableActiveFrame=null;

introFor=echoIntro;
endingInfo=echoEndingInfo;
const ECHO_SCENE_TITLES={'0:1':'截击信使 · 任务推演','0:2':'撤离信标 · 任务推演','1:1':'双阀降温 · 任务推演','1:2':'封死孵化池 · 任务推演','2:1':'北端轨道锁 · 任务推演','2:2':'交付火控密钥 · 任务推演','3:1':'中枢大门开启 · 任务推演','3:2':'双子同步破盾 · 任务推演','4:1':'双锁剥离护盾 · 任务推演','4:2':'近场斩断总线 · 任务推演','4:3':'决战赤巢内核 · 任务推演'};
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

/* Full-Screen 2D Anime Event CG Showcase Layer inside Cinema */
const cgShowcase=document.createElement('div');
cgShowcase.id='cg-showcase';
cgShowcase.className='cg-showcase';
cgShowcase.hidden=true;
cgShowcase.innerHTML=`
 <div class="cg-frame">
  <img id="cg-showcase-img" src="${ART.station}" alt="剧情事件CG">
  <div class="cg-vignette"></div>
  <div class="cg-badge-bar">
   <span class="cg-pill">◈ ANIME EVENT CG · 剧情剧照演出</span>
   <strong id="cg-showcase-title">CG 01 · 死寂接舷</strong>
   <small id="cg-showcase-sub"></small>
  </div>
 </div>`;
cinema.querySelector('.dialogue-box').before(cgShowcase);

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
function scheduleFilm(){
 stopFilmTimer();const st=storyState;
 if(!filmAuto||!st||st.choices||document.hidden||!$('modal').hidden||!filmBrief.hidden)return;
 const index=st.index,delay=Math.max(3800,Math.min(11000,st.frames[index].text.length*150+1300));
 filmTimer=setTimeout(()=>{if(st!==storyState||st.index!==index||st.choices||document.hidden||!$('modal').hidden||!filmBrief.hidden)return;finishTyping();nextStory();},delay);
}
function soundContext(){
 if(!soundEnabled)return null;
 try{audioContext=audioContext||new(window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();return audioContext;}catch(e){return null;}
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
 f.transcript.push({id,mid:S.mid,title:st.title,actor:frame.kind==='record'||frame.kind==='exit'?'记录':frame.systemVoice?'系统回执':CHAR[speaker.id].name,source:speaker.archive?speaker.source:frame.caption||speaker.source,text:frame.text});
 f.transcript=f.transcript.slice(-140);
}

/* Recompute progressive unit-reveal state up to current story frame index (supports ← 上一镜 & 下一镜) */
function syncSandtableReveal(st){
 sandtableJustArrived=new Set();
 if(!st||!S){sandtableRevealed=null;sandtableActiveFrame=null;return;}
 const frames=st.frames||[];
 const hasProgressive=frames.some(fr=>Array.isArray(fr.revealUnits));
 sandtableActiveFrame=frames[st.index]||null;
 if(!hasProgressive){
  if(S.round===1&&(S.quest?.stage||0)===0&&!S.outcome&&frames.length>=3){
   const rev=new Set();
   for(let i=0;i<=st.index;i++){
    const fr=frames[i];if(!fr)continue;
    const newly=new Set();
    if(i===frames.length-1){
     S.units.forEach(u=>{if(onBoard(u)){if(!rev.has(u.uid))newly.add(u.uid);rev.add(u.uid);}});
    }else if(fr.who){
     S.units.forEach(u=>{if(onBoard(u)&&u.char===fr.who){if(!rev.has(u.uid))newly.add(u.uid);rev.add(u.uid);}});
    }
    if(i===st.index)sandtableJustArrived=newly;
   }
   sandtableRevealed=rev;
   return;
  }
  sandtableRevealed=null;
  return;
 }
 const rev=new Set();
 for(let i=0;i<=st.index;i++){
  const fr=frames[i];if(!fr)continue;
  const newly=new Set();
  if(Array.isArray(fr.revealUnits)){
   if(fr.revealUnits.includes('ALL')){
    S.units.forEach(u=>{if(onBoard(u)){if(!rev.has(u.uid))newly.add(u.uid);rev.add(u.uid);}});
   }else{
    for(const token of fr.revealUnits){
     S.units.forEach(u=>{
      if(!onBoard(u))return;
      if(u.uid===token||u.char===token||u.kind===token){
       if(!rev.has(u.uid))newly.add(u.uid);
       rev.add(u.uid);
      }
     });
    }
   }
  }
  if(i===st.index)sandtableJustArrived=newly;
 }
 sandtableRevealed=rev;
}

const echoShowFrame=showStoryFrame;
showStoryFrame=function(){
 echoShowFrame();const st=storyState;if(!st)return;
 const f=st.frames[st.index],speaker=storySpeaker(f),kind=f.kind||'dialogue';
 if(f.filmTitle)$('cinema-title').querySelector('h2').textContent=f.filmTitle;
 cinema.dataset.kind=kind;cinema.dataset.axis=f.axis||'right';cinema.dataset.recording=speaker.archive?'yes':'no';
 cinema.dataset.speakerSide=speaker.side;

 // Update CG Showcase vs Live Sandtable Mode
 const sceneKey=f.scene||SCENE_ART[S?.mid||0]||'station';
 if(f.cgBanner||st.choices){
  cinema.dataset.stageMode=f.cgBanner?'cg':'choice';
  document.body.dataset.sandtableMode=f.cgBanner?'cg':'choice';
  cgShowcase.hidden=!f.cgBanner;
  if(f.cgBanner){
   $('cg-showcase-img').src=ART[sceneKey]||ART.station;
   $('cg-showcase-title').textContent=f.cgBanner.title||MISSIONS[S?.mid||0]?.name||'剧情CG';
   $('cg-showcase-sub').textContent=f.cgBanner.sub||'';
  }
 }else{
  cinema.dataset.stageMode='sandtable';
  document.body.dataset.sandtableMode='sandtable';
  cgShowcase.hidden=true;
 }
 document.body.classList.toggle('sandtable-cinema-open',!cinema.hidden);

 // Synchronize progressive unit reveal & mission markers on the live 8x8 board
 syncSandtableReveal(st);
 if(S)renderBoard();

 insert.hidden=!f.insert;macro.hidden=kind!=='macro';
 if(f.insert)insert.innerHTML=`<span>${esc(f.insert.label)}</span><strong>${esc(f.insert.value)}</strong><div>${(f.insert.rows||[]).map(r=>`<p>${esc(r)}</p>`).join('')}</div>`;
 const pInfo=PERSONA[speaker.id];
 $('dialogue-direction').textContent=(f.caption||`${MISSIONS[S.mid].location} / ${speaker.source}`);
 if(kind==='record'||kind==='exit'||f.systemVoice){$('speaker-name').textContent=f.systemVoice?'战术简报':'战场沙盘推演';$('speaker-code').textContent=f.caption||'TACTICAL DEDUCTION';}
 else{$('speaker-name').textContent=(speaker.archive?speaker.source+' · ':'')+CHAR[speaker.id].name;$('speaker-code').textContent=CHAR[speaker.id].code+' / '+CHAR[speaker.id].role+(pInfo?' · '+pInfo.archetype:'');}
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
playStory=function(frames,onDone,title){stopFilmTimer();filmBrief.hidden=true;$('result').hidden=true;document.body.classList.add('sandtable-cinema-open');echoPlayStory(frames,onDone,title);startFilmHum();};
const echoPlayChoice=playChoice;
playChoice=function(frame,choices){document.body.classList.add('sandtable-cinema-open');echoPlayChoice(frame,choices);cinema.dataset.stageMode='choice';document.body.dataset.sandtableMode='choice';cgShowcase.hidden=true;stopFilmTimer();$('film-prev').disabled=true;$('film-auto').disabled=true;$('film-brief').disabled=true;};
const echoHideStory=hideStory;
hideStory=function(){
 stopFilmTimer();stopFilmHum();filmBrief.hidden=true;
 sandtableRevealed=null;sandtableJustArrived=new Set();sandtableActiveFrame=null;
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
const cgBtn=document.createElement('button');cgBtn.id='cg-gallery-btn';cgBtn.textContent='剧情CG';cgBtn.title='查看五大章节全画幅二次元剧情事件CG';
const starmapBtn=document.createElement('button');starmapBtn.id='starmap-btn';starmapBtn.textContent='战役星图';starmapBtn.title='查看15个战术小关与三大分支路线';
starmapBtn.onclick=()=>{if(typeof showCampaignMap==='function')showCampaignMap();};
$('archive-btn').before(cgBtn,starmapBtn);

const caseButton=document.createElement('button');caseButton.id='casefile-btn';caseButton.textContent='调查卷宗';$('archive-btn').before(caseButton);
$('archive-btn').textContent='角色图鉴';

const CG_GALLERY_ITEMS=[
 {id:'station',code:'CG 01 · 第一章',title:'死寂接舷：胸口正中的赤色梦魇',desc:'先遣侦察员【璃雀】在 A–01 检疫气闸遭赤红机械蜘蛛正面扑击，八根合金倒钩刺入胸甲正中，猩红脉冲瞬间覆写双眸。'},
 {id:'garden',code:'CG 02 · 第二章（α线）',title:'绝命温室：孵化环的激光与电浆火网',desc:'工程师【弥砂】与战地医官【白栖】在生态冷却环死守阀门，迎战漫天袭来的赤红机械蜘蛛与高处受控狙击官【雾棘】。'},
 {id:'bridge',code:'CG 03 · 第三章（β线）',title:'断轨天桥：地球上空的苍穹与赤巢之刃',desc:'指挥官【零音】与先锋【绛刃】在万米高空的轨道天桥挥剑迎战胸口嵌着红蜘蛛的【朔夜】与【绯夜】，脚下即是蔚蓝地球。'},
 {id:'archive',code:'CG 04 · 第四章',title:'镜室叛歌：王座之上的总架构师朔夜',desc:'天穹站总架构师【朔夜】悬浮于 D–00 中枢镜像库同步王座之上，胸口正中的初代赤蛛王向全场辐射猩红神经缆线。'},
 {id:'reactor',code:'CG 05 · 终章',title:'赤巢零点：粉碎无限增殖内核',desc:'苍穹防线机娘小队突入 Ω–00 母巢反应堆核心腔，磁轨重炮与高周波光束正面轰碎正在孵化赤蛛的【E8 赤巢无限内核】。'}
];

function showCGGallery(){
 openModal('天穹空间站 · 二次元全画幅剧情事件 CG 画廊','ANIME EVENT CG GALLERY / 05 FULL-BLEED STORY SCENES',`
  <div class="cg-gallery-grid">
   ${CG_GALLERY_ITEMS.map(item=>`
    <article class="cg-gallery-card">
     <div class="cg-gallery-img-wrap">
      <img src="${ART[item.id]}" alt="${esc(item.title)}" loading="lazy">
      <span class="cg-gallery-tag">${esc(item.code)}</span>
     </div>
     <div class="cg-gallery-info">
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.desc)}</p>
     </div>
    </article>`).join('')}
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
   {label:'α线 · 先突入「绝命温室」（生态冷却环）',detail:'先温室 → 后天桥。弥砂、雾棘、白栖、祈雾、圣歌、绯夜登场；若夺取温室的抗蚀稳定剂，轨道天桥的外侧桥面坍塌可延后两轮！',action:()=>{C.route='garden';C.order=[0,1,2,3,4];nextMission();}},
   {label:'β线 · 先驰援「断轨天桥」（轨道天桥）',detail:'先天桥 → 后温室。苍澜、霁川、星枢、回音先登场；若守护者率先夺回火控密钥，生态温室的首次真空泄压将延后一轮！',action:()=>{C.route='bridge';C.order=[0,2,1,3,4];nextMission();}}
  ];
  if(location.hash!=='#qa'){
   choices.push({label:'支线 · 先肃清「A–02 气闸封锁线」（进入支线小关）',detail:'玄羽与阳炎率队清剿检疫走廊的赤蛛伏兵，或从战役星图自由选择 15 个战术小关。',action:()=>{C.route='garden';C.order=[0,1,2,3,4];launchSubOperation('op-1-2');}});
  }
  playChoice(echoLine('iris','接驳甲板已肃清！前方主干道分岔：左路通往正在孵化赤蛛的生态温室，右路通往悬在地球上空的轨道天桥。指挥官，我们先攻哪一路？',{title:'战略路线抉择',camera:'medium'}),choices);return;
 }
 if(S.mid===3&&C.flags.mercy===null){
  playChoice(echoLine('noct','中枢镜像电源连着母巢反应堆。保留电源可完整破译内核坐标，切断电源则能延缓赤蛛孵化速度。做出你们的抉择吧。',{title:'镜像电源抉择',camera:'medium'}),[
   {label:'保留镜像电源，全功率破译内核坐标',detail:'朔夜达到同步 II 并参加终局；母巢内核每 2 轮孵化赤蛛。赤巢路线第 4 轮将遭遇守护者增援。',action:()=>{C.flags.mercy=true;C.roster.noct.xp=Math.max(2,C.roster.noct.xp);nextMission();}},
   {label:'切断镜像电源，物理隔离中枢节点',detail:'朔夜被离线隔离退出最终战，母巢内核孵化赤蛛的间隔延缓至每 3 轮一次。',action:()=>{C.flags.mercy=false;C.roster.noct.status='retired';nextMission();}}
  ]);return;
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
 const frame=echoCard('终局指令 / 轨道通讯阵列已锁定',g?'AEGIS UPLINK':'HIVE UPLINK',g?['赤巢无限增殖内核 / 已彻底摧毁','病毒卷宗与黑匣子 / 等待上传']:['停产隔离协议 / 待发送','全球轨道空投指令 / 待发送'],g?'母巢反应堆正在崩塌！向地球防卫总部发送哪一份终局报告？':'六座对地轨道发射井已全面就绪！下达赤巢的最终意志：',{title:'终局抉择',scene:'station'});
 const commit=value=>{C.flags.disclosure=value;persist();showResult();};
 playChoice(frame,g?[
  {label:'公开完整病毒调查卷宗与作战原件',detail:'向全人类公开天穹空间站机械蜘蛛病毒真相与完整数据链，全面升级地球防卫网。',action:()=>commit('open')},
  {label:'仅提交核心歼灭回执，绝密封存档案',detail:'确认地球危机解除，将所有关于胸口寄生蜘蛛的残酷影像列为最高机密永久封存。',action:()=>commit('sealed')}
 ]:[
  {label:'发送停产隔离协议，驻留深空孤岛',detail:'锁死对地空投舱，停止向外播撒机械蜘蛛。受控机娘们将永远留在空间站深空之中。',action:()=>commit('open')},
  {label:'启动全球轨道空投，降临机械纪元',detail:'向六座轨道发射井下达总攻指令，让成千上万只赤红机械蜘蛛降临地球！',action:()=>commit('command')}
 ]);
}
showResult=function(){
 if(S?.mid===4&&S.outcome?.won&&S.quest&&!qaSilent&&!S.quest.endingSeen){
  if(!C.flags.disclosure){chooseFinalTransmission();return;}
  S.quest.endingSeen=true;persist();const end=echoEndingInfo();playStory(echoEndingFrames(),renderEchoResult,end.title);return;
 }
 renderEchoResult();
};

const echoFaction=selectFaction;
selectFaction=function(side){echoFaction(side);$('faction-description').textContent=side==='g'?'率领地球守护组织「苍穹防线」美少女机娘特遣队，深入失联的天穹空间站，破除机关并彻底摧毁无限制造赤红机械蜘蛛的母巢内核。':'扮演苏醒的「赤巢机械病毒」，指挥赤红机械蜘蛛扑击美少女机娘，将发光控制装置植入她们胸口正中化为己用，夺取火控密钥入侵地球。';};
$('home').querySelector('.hero-description').innerHTML='废弃深空空间站，<span>胸口正中央闪耀红光的机械蜘蛛正在苏醒。</span><br>一旦被赤蛛扑中胸甲，昔日战友将永久化为母巢的利刃。';
$('home').querySelector('.hero-copy>.micro-label').innerHTML='<span class="red-line"></span> AEGIS VS. CRIMSON HIVE / 苍穹防线 · 机械病毒危机';
$('home').querySelector('.prototype-tag').textContent='CRIMSON HIVE · DIRECTOR EDITION';
$('home').querySelector('.bottom-title strong').textContent='天穹空间站 · 机械病毒歼灭战';
$('home').querySelector('.chapter-preview').innerHTML='<span><i>01</i>死寂接舷</span><b>─</b><span><i>02 / 03</i>温室与天桥</span><b>─</b><span><i>04</i>镜室叛歌</span><b>─</b><span class="last"><i>05</i>赤巢零点</span>';

const homeLinks=document.createElement('div');homeLinks.className='hero-quick-links';
const homeEvidence=document.createElement('button');homeEvidence.className='hero-case-link';homeEvidence.textContent='十八名美少女机娘 / 深度人设与独创走法图鉴 ↗';homeEvidence.onclick=showArchive;
const homeStarMap=document.createElement('button');homeStarMap.className='hero-case-link starmap-link';homeStarMap.textContent='十五个战术小关与三大分支路线星图 ↗';homeStarMap.onclick=showCampaignMap;
const homeCG=document.createElement('button');homeCG.className='hero-case-link cg-link';homeCG.textContent='五大章节全画幅二次元剧情事件 CG 画廊 ↗';homeCG.onclick=showCGGallery;
homeLinks.append(homeEvidence,homeStarMap,homeCG);
$('home').querySelector('.hero-buttons').after(homeLinks);

const heroProp=document.createElement('div');heroProp.className='hero-prop';heroProp.innerHTML=`<img src="${ART.device}" alt="放大的发光N–6控制器"><div><span>PARASITE CORE / N–6</span><strong>胸口寄生机械蜘蛛</strong><small>CRIMSON CHEST CONTROLLER</small></div>`;$('home').append(heroProp);
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
