/* M6 / ECHO CUT: evidence-led thriller, actor-accurate scenes and film controls.
   Camera and dialogue never reset actions. Documents unlock from game state,
   not from whether the player watches or skips a cutscene. No remote services. */
MISSIONS[1].name='玻璃病区';MISSIONS[1].en='THE WITHDRAWAL WINDOW';MISSIONS[1].location='回声站 · 临床冷却环';
MISSIONS[3].name='签名原件';MISSIONS[3].en='THE ORIGINAL SIGNATURE';
ACT_NAMES.g=[['接入站内链路','回收证人或原始记录','撤离接驳甲板'],['重启冷却阀','保持撤药窗口','执行回路隔离'],['护送授权匣','接管北端轨道锁','完成密钥交付'],['打开镜像库','恢复签名持有人','校验原始记录'],['接入生产网','同步双锁','切断运动指令链','关闭制造核心']];
ACT_NAMES.r=[['穿过第一道封锁','建立站外备份','撤收受控载体'],['带走药仓样本','接入维护权限','覆写隔离回路'],['截住授权匣','接管南端轨道锁','带离生产密钥'],['打开镜像库','保住签名持有人','校验原始记录'],['维持第一次增殖','突破封锁阵线','锁定上行通道','守至第十二轮']];
CHAR.noct.bio='神经支架协议的架构师，也是封锁令的签发人之一。她躲进无法被远程删改的镜像库，把自己的修改记录和事故资料锁在同一卷原件里。';
introFor=echoIntro;endingInfo=echoEndingInfo;
const ECHO_SCENE_TITLES={'0:1':'七分钟','0:2':'释放扣','1:1':'医嘱回执','1:2':'停药窗口','2:1':'空货舱','2:2':'返航许可','3:1':'只写不读','3:2':'签名原件','4:1':'最后的许可','4:2':'停止电平','4:3':'确认键'};
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
resolveBattle=function(won,reason){if(won&&S&&!S.outcome)syncEvidence(true);return echoBattleResolve(won,reason);};
const echoRestorePayload=restorePayload;
restorePayload=function(p){if(!payloadValid(p)){echoRestorePayload(p);return;}echoRestorePayload(p);if(C&&S){syncEvidence();if(C.finished&&S.quest?.endingSeen&&!C.flags.disclosure){C.flags.disclosure=C.side==='r'?(C.flags.mercy?'open':'command'):'sealed';}render();persist();}};

// Personal testimony never migrates into another character's mouth. A destroyed
// or departed actor remains the same named actor and is explicitly a recording.
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
const insert=document.createElement('div');insert.id='film-insert';insert.className='film-insert';insert.hidden=true;cinema.querySelector('.dialogue-box').before(insert);
const macro=document.createElement('img');macro.id='film-prop';macro.className='film-prop';macro.src=ART.device;macro.alt='N–6：发光红色神经核心、黑银底座与短金属固定夹';macro.hidden=true;cinema.querySelector('.dialogue-box').before(macro);
const texture=document.createElement('div');texture.className='film-texture';texture.setAttribute('aria-hidden','true');cinema.prepend(texture);
const doors=document.createElement('div');doors.className='film-doors';doors.innerHTML='<i></i><i></i>';doors.setAttribute('aria-hidden','true');cinema.querySelector('.dialogue-box').before(doors);
const controls=document.createElement('div');controls.className='film-controls';controls.innerHTML='<button id="film-prev" title="回看上一镜">← 上一镜</button><button id="film-auto" aria-pressed="false">自动放映</button><button id="film-sound" aria-pressed="false">声音关闭</button><button id="film-brief" aria-expanded="false">任务卡</button>';
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
const echoShowFrame=showStoryFrame;
showStoryFrame=function(){
 echoShowFrame();const st=storyState;if(!st)return;
 const f=st.frames[st.index],speaker=storySpeaker(f),kind=f.kind||'dialogue';
 if(f.filmTitle)$('cinema-title').querySelector('h2').textContent=f.filmTitle;
 cinema.dataset.kind=kind;cinema.dataset.axis=f.axis||'right';cinema.dataset.recording=speaker.archive?'yes':'no';
 insert.hidden=!f.insert;macro.hidden=kind!=='macro';
 if(f.insert)insert.innerHTML=`<span>${esc(f.insert.label)}</span><strong>${esc(f.insert.value)}</strong><div>${(f.insert.rows||[]).map(r=>`<p>${esc(r)}</p>`).join('')}</div>`;
 $('dialogue-direction').textContent=f.caption||`${MISSIONS[S.mid].location} / ${speaker.source}`;
 if(kind==='record'||kind==='exit'||f.systemVoice){$('speaker-name').textContent=f.systemVoice?'系统回执':'现场记录';$('speaker-code').textContent=f.caption||'ECHO / ORIGINAL RECORD';}
 else{$('speaker-name').textContent=(speaker.archive?speaker.source+' · ':'')+CHAR[speaker.id].name;$('speaker-code').textContent=CHAR[speaker.id].code+' / '+CHAR[speaker.id].role;}
 $('film-prev').disabled=st.index===0||!!st.choices;$('film-auto').disabled=!!st.choices;$('film-brief').disabled=!!S.outcome;
 $('film-auto').textContent=filmAuto?'暂停放映':'自动放映';$('film-auto').setAttribute('aria-pressed',String(filmAuto));$('film-sound').textContent=soundEnabled?'声音开启':'声音关闭';$('film-sound').setAttribute('aria-pressed',String(soundEnabled));
 $('next-dialogue').innerHTML=(st.index===st.frames.length-1?(S.outcome?'继续':'返回战场'):'下一镜')+' <span>↗</span>';
 filmBrief.hidden=true;$('film-brief').setAttribute('aria-expanded','false');
 recordEchoFrame(st,f,speaker);filmSound(f.sound);
 if(!reducedMotion){
  const image=$('cinema-portrait');image.getAnimations().forEach(a=>a.cancel());image.animate([{transform:'scale(1)'},{transform:'scale(1.04)'}],{duration:11000,easing:'linear',fill:'forwards'});
  if(kind==='exit'){doors.getAnimations({subtree:true}).forEach(a=>a.cancel());doors.firstElementChild.animate([{transform:'translateX(0)'},{transform:'translateX(-101%)'}],{duration:2600,delay:400,easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'});doors.lastElementChild.animate([{transform:'translateX(0)'},{transform:'translateX(101%)'}],{duration:2600,delay:400,easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'});}
 }
 scheduleFilm();
};
const echoPlayStory=playStory;
playStory=function(frames,onDone,title){stopFilmTimer();filmBrief.hidden=true;$('result').hidden=true;echoPlayStory(frames,onDone,title);startFilmHum();};
const echoPlayChoice=playChoice;
playChoice=function(frame,choices){echoPlayChoice(frame,choices);stopFilmTimer();$('film-prev').disabled=true;$('film-auto').disabled=true;$('film-brief').disabled=true;};
const echoHideStory=hideStory;
hideStory=function(){stopFilmTimer();stopFilmHum();filmBrief.hidden=true;echoHideStory();};
$('film-prev').onclick=()=>{if(!storyState||storyState.choices||storyState.index===0)return;storyState.index--;showStoryFrame();};
$('film-auto').onclick=()=>{if(storyState?.choices)return;filmAuto=!filmAuto;$('film-auto').textContent=filmAuto?'暂停放映':'自动放映';$('film-auto').setAttribute('aria-pressed',String(filmAuto));scheduleFilm();};
$('film-sound').onclick=()=>{toggleAudio();$('toast').classList.remove('show');clearTimeout(toastTimer);$('film-sound').textContent=soundEnabled?'声音开启':'声音关闭';$('film-sound').setAttribute('aria-pressed',String(soundEnabled));if(soundEnabled)startFilmHum();else stopFilmHum();};
$('film-brief').onclick=()=>{if(!S||S.outcome)return;filmBrief.hidden=!filmBrief.hidden;$('film-brief').setAttribute('aria-expanded',String(!filmBrief.hidden));if(!filmBrief.hidden){filmBrief.innerHTML=`<span>OPERATION CARD / 任务卡</span><h3>${esc(ACT_NAMES[C.side][S.mid][S.quest?.stage||0])}</h3>${actGoals(S).map(g=>`<p><i>${g.done?'✓':'○'}</i>${esc(g.text)}</p>`).join('')}<small>${esc(questHint(S))}</small>`;stopFilmTimer();}else scheduleFilm();};
const echoOpenModal=openModal,echoCloseModal=closeModal;
openModal=function(...args){stopFilmTimer();echoOpenModal(...args);};
closeModal=function(){echoCloseModal();scheduleFilm();};
$('close-modal').onclick=()=>closeModal();
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopFilmTimer();stopFilmHum();}else if(storyState){scheduleFilm();startFilmHum();}});

const caseButton=document.createElement('button');caseButton.id='casefile-btn';caseButton.textContent='证据';$('archive-btn').before(caseButton);$('archive-btn').textContent='人物';
function evidenceResolved(id){return id==='manifest'?hasEvidence('downlink'):['signature','downlink'].includes(id)?!!C?.flags.disclosure:hasEvidence('signature');}
function showCasefile(){
 if(C&&S)syncEvidence();const f=ensureCasefile(),found=f?.found||[];
 openModal('回声站封锁案','ECHO / EVIDENCE & TESTIMONY',`<div class="case-heading"><p>原始记录与推断分开保存。跳过演出不会丢失任务中取得的证据。</p><strong>${found.length}<small> / 06 份记录</small></strong></div><div class="case-grid">${Object.entries(ECHO_EVIDENCE).map(([id,d])=>{const entry=found.find(e=>e.id===id);return`<article class="case-card ${entry?'unlocked':'locked'}" data-evidence="${id}"><span class="case-number">${d.number}</span>${entry?`<span class="case-source">${esc(d.source)}</span><h3>${esc(d.title)}</h3><p>${esc(d.fact)}</p><div class="case-question">待解释：${esc(d.question)}</div>${evidenceResolved(id)?`<div class="case-payoff">关联已核验<br>${esc(d.payoff)}</div>`:''}<small>${esc(entry.origin)} / 第${entry.round}轮</small>`:'<h3>尚未接入</h3><p>后续任务中核验后解锁。不提前展示答案。</p>'}</article>`;}).join('')}</div><details class="case-transcript"><summary>已观看的对白与记录 · ${f?.transcript.length||0} 条</summary>${(f?.transcript||[]).map(t=>`<article><span>${esc(t.title)} / ${esc(t.source)}</span><strong>${esc(t.actor)}</strong><p>${esc(t.text)}</p></article>`).join('')||'<p>开始调查后，这里保留你已经看过的镜头对白。</p>'}</details>${C?`<div class="case-disposition">最终发送：${C.flags.disclosure==='open'?'公开原件 / 停产协议':C.flags.disclosure==='command'?'接管授权':C.flags.disclosure==='sealed'?'停机回执 / 原件封存':'尚未决定'}<br>永久损毁：${Object.entries(C.roster).filter(([id,r])=>r.status==='destroyed').map(([id])=>CHAR[id].name).join('、')||'无已确认记录'}。受控或未归队者不会被自动记为死亡。</div>`:''}`);
}
caseButton.onclick=showCasefile;

// The two mid-campaign choices retain the existing mechanical consequences.
// Retiring Noct is an evacuation decision, not deleting or killing her.
advanceMission=function(){
 if(!S?.outcome?.won)return;$('result').hidden=true;
 if(S.mid===4){showHome();return;}
 if(S.mid===0&&!C.route){
  playChoice(echoLine('iris','一路连着病区，一路连着回收艇。我们先接哪边？',{title:'先接哪一路',camera:'medium'}),[
   {label:'先恢复临床冷却',detail:'先病区 → 后断桥。弥砂、雾棘、白栖、祈雾登场；若带走温室样本，断桥坍塌可延后两轮。',action:()=>{C.route='garden';C.order=[0,1,2,3,4];nextMission();}},
   {label:'先截住过桥授权',detail:'先断桥 → 后病区。苍澜、霁川先登场；若守护者带回密钥，病区首次泄压延后一轮。初期同行者较少。',action:()=>{C.route='bridge';C.order=[0,2,1,3,4];nextMission();}}
  ]);return;
 }
 if(S.mid===3&&C.flags.mercy===null){
  playChoice(echoLine('noct','我能留下维持实时校验，也能带着原件先走。你们需要决定，哪一个不能丢。',{title:'证人去向',camera:'medium'}),[
   {label:'朔夜随队，保留实时校验',detail:'朔夜达到同步II并参加终局；核心每2轮生产。赤巢路线第4轮还有守护增援。完整责任记录照常保留。',action:()=>{C.flags.mercy=true;C.roster.noct.xp=Math.max(2,C.roster.noct.xp);nextMission();}},
   {label:'先撤出朔夜与原件',detail:'朔夜退出最终战，不被删除或判死。切开在线人格链后，核心生产间隔变为3轮。她作为站外证人留存。',action:()=>{C.flags.mercy=false;C.roster.noct.status='retired';nextMission();}}
  ]);return;
 }
 nextMission();
};
function renderEchoResult(){
 // previousShowResult is the shared M1 portrait-corrected core report, not the
 // M2 cutscene wrapper. Calling it avoids a second ending or recursive choices.
 previousShowResult();if(!S?.outcome)return;
 const won=S.outcome.won,box=$('result-content');
 if(won&&S.mid!==4){box.querySelector('h2').textContent=MISSIONS[S.mid].name+' / 链路确认';box.querySelector('.result-subtitle').textContent=`本区${ACT_NAMES[C.side][S.mid].length}段目标完成。${ensureCasefile()?.found.length||0}份证据已入档；人物状态、物品和撤离记录进入下一次部署。`;}
 if(won){const b=document.createElement('button');b.className='button ghost';b.textContent='查看原件与证词';b.onclick=showCasefile;box.querySelector('.result-buttons').append(b);}
}
function chooseFinalTransmission(){
 const g=C.side==='g';
 const frame=echoCard('最终发送 / 需要操作者确认',g?'RETURN LINK':'UPLINK READY',g?['停机 / 已确认','原件 / 保留两份']:['原件与停产协议 / 待发送','接管控制表 / 待发送'],g?'回收链路只剩一次完整上行余量。提交哪一种记录？':'通道已经稳定。现在选择发送什么。',{title:'最后一个确认键',scene:'station'});
 const commit=value=>{C.flags.disclosure=value;persist();showResult();};
 playChoice(frame,g?[
  {label:'公开操作原件，保留所有签名',detail:'发送可核验的操作与授权记录；缺失内容仍标为缺失，不用证词冒充原始数据。个人神经副本不随操作日志公开。',action:()=>commit('open')},
  {label:'先交停机回执，封存原件',detail:'确认地面安全，暂不公开操作责任。两份原件保留；封存不等于销毁，也不等于结案。',action:()=>commit('sealed')}
 ]:[
  {label:'广播原件与停产协议',detail:'令地面停止制造新的感染载体，不发送接管授权。已经受控的人无法恢复；相关签名与损失照常保留。',action:()=>commit('open')},
  {label:'继续发送接管授权',detail:'允许地面N–6进入运动接管。停止字段维持空白；发送者的这次选择会成为新增证据。',action:()=>commit('command')}
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
selectFaction=function(side){echoFaction(side);$('faction-description').textContent=side==='g'?'进入不可逆感染区，核验授权链、阻止扩散。只有赤蛛能夺控；其他吃子直接击杀，无法解救。':'以受控载体和少量夹具起步，突破回收封锁；最后由你决定上行队列发送证词，还是接管授权。';};
$('home').querySelector('.hero-description').innerHTML='求救信号，<span>比事故早了七分钟。</span><br>十七天后，她仍站在门后。';
$('home').querySelector('.hero-copy>.micro-label').innerHTML='<span class="red-line"></span> THE ECHO STATION CASE / 回声证词';
$('home').querySelector('.prototype-tag').textContent='ECHO CUT · 0.5';
$('home').querySelector('.bottom-title strong').textContent='回声站封锁案';
$('home').querySelector('.chapter-preview').innerHTML='<span><i>01</i>失联信号</span><b>─</b><span><i>02 / 03</i>病区与断桥</span><b>─</b><span><i>04</i>签名原件</span><b>─</b><span class="last"><i>05</i>最终发送</span>';
const homeEvidence=document.createElement('button');homeEvidence.className='hero-case-link';homeEvidence.textContent='十二名当事人 / 查看人物与独立走法 ↗';homeEvidence.onclick=showArchive;$('home').querySelector('.hero-buttons').after(homeEvidence);
const heroProp=document.createElement('div');heroProp.className='hero-prop';heroProp.innerHTML=`<img src="${ART.device}" alt="放大的发光N–6控制器"><div><span>EVIDENCE / 02</span><strong>没有释放扣的医疗夹具</strong><small>N–6 NEURAL LATCH</small></div>`;$('home').append(heroProp);
// Remove the rejected spider from principal branding as well as character art.
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
