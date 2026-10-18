/* M7/M11 Irreversible Capture Law + 3D Board Terrain Modules + Live 60FPS Dossier & Token FX.
   Only Red Spiders infect and swap; all other captures permanently destroy the target. */
ACT_NAMES.g[0]=['攻破接驳门禁','截获病毒信使','突入北侧通道'];
ACT_NAMES.g[3]=['开启中枢电磁门','夺取双子镜像终端','固守同步座破译护盾'];
ACT_NAMES.r[3]=['开启中枢电磁门','保全受控架构师朔夜','固守同步座锁定中枢'];
ACT_NAMES.g[4][2]='近场切断增殖总线';

const protocolBoard=renderBoard;
renderBoard=function(){
 protocolBoard();
 const b=$('board');if(!b||!S)return;
 const sector=S.subOpSector||({0:'dock',1:'garden',2:'bridge',3:'archive',4:'reactor'}[S.mid||0])||'dock';
 b.dataset.sector=sector;
 if(S.subOpName){
  const chap=$('chapter-name');
  if(chap)chap.textContent=S.subOpName;
 }

 // Decorate 3D terrain tiles with sculpted sci-fi structural badges & live token FX
 b.querySelectorAll('.cell').forEach(cell=>{
  if(!cell.querySelector('.terrain-badge')){
   let label='';
   if(cell.classList.contains('wall'))label='装甲掩体';
   else if(cell.classList.contains('void'))label='深空裂隙';
   else if(cell.classList.contains('relay'))label='中继终端';
   else if(cell.classList.contains('exit'))label='气闸撤离';
   else if(cell.classList.contains('hazard'))label='泄压危区';
   if(label)cell.insertAdjacentHTML('beforeend',`<span class="terrain-badge">${label}</span>`);
  }
  const tok=cell.querySelector('.token.character-token');
  if(tok&&!tok.querySelector('.token-live-fx')){
   const u=unitAt(S,+cell.dataset.x,+cell.dataset.y);
   if(u&&u.char){
    const rig=typeof LIVE_RIG_COORDS!=='undefined'?(LIVE_RIG_COORDS[u.char]||LIVE_RIG_COORDS.lyra):{cx:384,cy:575};
    const cxPct=((rig.cx/768)*100).toFixed(1)+'%',cyPct=((rig.cy/1024)*100).toFixed(1)+'%';
    tok.insertAdjacentHTML('beforeend',`<span class="token-live-fx ${u.side}" style="--spider-x:${cxPct};--spider-y:${cyPct}" aria-hidden="true"><i></i><b></b></span>`);
   }
  }
 });

 const chosen=S.units.find(u=>u.uid===selected&&onBoard(u));if(!chosen)return;
 b.querySelectorAll('.cell.capture').forEach(cell=>{
  const target=unitAt(S,+cell.dataset.x,+cell.dataset.y),mode=captureMode(chosen,target);
  cell.dataset.captureMode=mode;
  cell.insertAdjacentHTML('beforeend',`<span class="resolution-pill ${mode}">${mode==='infect'?'永久寄生':'击杀'}</span>`);
 });
 if(chosen.side===C.side&&!chosen.used)$('board-hint').textContent+=chosen.kind==='spider'&&chosen.side==='r'?' · 机娘目标：永久寄生（胸口植入红蜘蛛）':' · 吃子：直接击杀，不会解救';
};

const protocolDossier=renderDossier;
renderDossier=function(){
 protocolDossier();
 const u=S?.units.find(v=>v.uid===selected&&onBoard(v))||movers(S,C.side).find(v=>v.char)||movers(S,C.side)[0];if(!u)return;
 const parasite=u.kind==='spider'&&u.side==='r';
 const text=parasite?'仅赤蛛能永久感染机娘（胸口正中植入发光红蜘蛛，人物暗化）。寄生换位后本阶段双方锁定；没有解救。':'吃到敌方单位直接击杀。机娘、哨卫、信使都不能感染，也不能解救受控者。';
 const dControls=$('dossier').querySelector('.dossier-controls');
 if(dControls){
  dControls.insertAdjacentHTML('beforebegin',`<p class="capture-law ${parasite?'infect':''}"><b>${parasite?'唯一感染执行器':'致命吃子'}</b>${text}</p>`);
  if(u.char&&typeof PERSONA!=='undefined'&&PERSONA[u.char]){
   const p=PERSONA[u.char];
   dControls.insertAdjacentHTML('beforebegin',`
    <div class="dossier-persona-box ${u.side}">
     <div class="persona-tag-line"><span>${p.archetype}</span><b>${p.weapon}</b></div>
     <p>${u.side==='r'?p.psychInfected:p.psychClean}</p>
     <small>🔗 ${p.bonds?.[0]||''}</small>
    </div>`);
  }
 }
 // Mount 60FPS Live2D-style animated canvas in the Dossier portrait container
 if(u.char){
  const pCard=$('dossier').querySelector('.dossier-portrait');
  if(pCard&&!pCard.querySelector('.live-rig-canvas')){
   pCard.insertAdjacentHTML('beforeend',`<canvas class="live-rig-canvas dossier-live-canvas" width="320" height="426" data-char-id="${u.char}" data-side="${u.side}" data-speaking="false"></canvas><span class="dossier-live-pill">${u.side==='r'?'🕷️ LIVE · 胸口红光律动':'⚡ LIVE · 动态立绘'}</span>`);
  }
 }
};

radioForCapture=function(ev){
 if(ev.converted){
  const line=(typeof PERSONA!=='undefined'&&PERSONA[ev.converted.char]?.voice?.infected)||'胸口正中的机械蜘蛛红光暴涨，她的双眸瞬间转为猩红：“神经链路已被赤巢覆写……服从母巢指令。”';
  radio(ev.converted.name,line);
 }
};

function combatCutIn(target,mode){
 clearTimeout(eventTimer);const box=$('capture-event'),infect=mode==='infect';
 box.className='capture-event cinema-capture '+(infect?'r':'lethal');
 const image=target.char?portraitSource(target.char,infect?'r':target.side):target.kind==='core'?ART.reactor:ART.device;
 const face=target.char||['spider','courier','core'].includes(target.kind)?`<img src="${image}" alt="">`:svg(KINDS[target.kind]?.icon||'drone','kill-machine');
 box.innerHTML=`<div class="capture-face">${face}</div><div class="capture-copy"><span>${infect?'NEURAL OVERWRITE / CHEST SPIDER LOCKED':'TARGET ELIMINATED / NO CONVERSION'}</span><strong>${infect?'胸口永久寄生':'致命击杀'} · ${esc(target.name)}</strong><small>${infect?'赤红机械蜘蛛已锁死胸口正中央，人物暗化、核心与双眸红光暴涨！':'载体永久损毁，不会转换阵营。'}</small><em>${infect?'刚被寄生单位本阶段锁定':'死亡状态跨章保留'}</em></div>`;
 requestAnimationFrame(()=>box.classList.add('show'));eventTimer=setTimeout(()=>box.classList.remove('show'),2400);
 if(typeof triggerBoardCinemaVFX==='function')triggerBoardCinemaVFX(infect?'spider-pulse':'railgun-strike',{x:target.x||3,y:target.y||3});
 if(!reducedMotion){$('board').classList.remove('shake');requestAnimationFrame(()=>$('board').classList.add('shake'));setTimeout(()=>$('board').classList.remove('shake'),320);}
}
captureEffect=function(target){combatCutIn(target,'infect');};
function killEffect(target){combatCutIn(target,'kill');}

const protocolAdvance=advanceMission;
advanceMission=function(){
 if(!S?.outcome?.won||S.mid!==3||C.flags.mercy!==null){protocolAdvance();return;}
 const g=C.side==='g',noct=C.roster.noct;
 const frame=echoCard('中枢镜像库 / 破盾抉择','CORE LINK',['破盾协议 / 已读取','母巢内核 / 正在加速孵化赤蛛','胸口寄生状态 / 不可逆'],'中枢镜像电源直接连着母巢反应堆。要保留镜像在线以获取完整破盾脉冲，还是立刻切断电源延缓赤蛛孵化？',{title:'留电破译，还是断电封锁',scene:'archive'});
 playChoice(frame,[
  {label:'保留镜像电源，全功率破译内核坐标',detail:`保留可复现的在线破译链，母巢内核维持每 2 轮孵化赤蛛。${g?'存活的朔夜仍是赤巢强敌，将升至同步 II 在终章迎战。':'存活的朔夜升至同步 II 继续参战，但第 4 轮将遭遇守护者精锐增援。'}已阵亡者不会复活。`,action:()=>{C.flags.mercy=true;C.flags.liveSignature=true;if(noct.status==='active')noct.xp=Math.max(2,noct.xp);nextMission();}},
  {label:'切断镜像电源，物理隔离中枢节点',detail:'母巢内核的赤蛛孵化间隔延缓至每 3 轮一次；存活的朔夜将被封存在离线镜室中不再参战（阵营不变且无法解救）。静态破盾坐标保留，但失去在线破译链。',action:()=>{C.flags.mercy=false;C.flags.liveSignature=false;if(noct.status==='active')noct.status='retired';nextMission();}}
 ]);
};

const protocolRestore=restorePayload;
restorePayload=function(p){
 if(!payloadValid(p)){protocolRestore(p);return;}
 const old=p.c.combatRules!==2;protocolRestore(p);C.combatRules=2;
 if(old){C.flags.legacyCaptureHistory=true;persist();toast('旧档状态已保留；从现在起只有赤蛛能感染，其他吃子直接击杀，无法解救。');}
};
const protocolCasefile=showCasefile;
showCasefile=function(){protocolCasefile();$('modal-content').insertAdjacentHTML('afterbegin','<div class="manual-note"><b>不可逆胸口寄生法则</b>：只有赤红机械蜘蛛扑中机娘才能将发光装置锁死于胸口正中（人物暗化/红眼发光）；普通攻击只会击杀目标，无法解救。</div>');};
caseButton.onclick=showCasefile;
const protocolHelp=showHelp;
showHelp=function(){protocolHelp();$('modal-content').insertAdjacentHTML('afterbegin','<div class="manual-note lethal-note"><b>核心法则：只有红蜘蛛能控制（寄生胸口）；没有解救。</b><br>普通机娘、哨卫、哨塔、信使与运输器的攻击都会直接击杀目标。受控机娘胸口正中嵌有发光红蜘蛛且人物暗化，但她们也只有击杀能力，不能继续感染别人。</div>');};
$('help-btn').onclick=showHelp;$('home-rules-btn').onclick=showHelp;
$('home').querySelector('.prototype-tag').textContent='MASTER 3D CINEMA · 18 GIRLS · 15 STAGES';
$('hero-identity').textContent=homeSide==='g'?'未感染 / 18名美少女机娘动态阵容':'胸口寄生发光 / CRIMSON HIVE CONTROL';
if(location.hash==='#qa')Object.assign(window.__MV_QA__,{
 captureMode(attacker,target){return captureMode(S.units.find(u=>u.uid===attacker),S.units.find(u=>u.uid===target));},
 hypothetical(m){const before=clone(S),test=clone(S),ev=applyBasic(test,m);return{before,after:test,event:ev};}
});
