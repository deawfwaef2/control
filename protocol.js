/* M7 irreversible capture law. The engine is authoritative for both AI and player.
   No purification, revival, disarm-to-rescue, or reverse faction conversion. */
ACT_NAMES.g[0]=['攻破接驳门禁','截获病毒信使','突入北侧通道'];
ACT_NAMES.g[3]=['开启中枢电磁门','夺取双子镜像终端','固守同步座破译护盾'];
ACT_NAMES.r[3]=['开启中枢电磁门','保全受控架构师朔夜','固守同步座锁定中枢'];
ACT_NAMES.g[4][2]='近场切断增殖总线';

const protocolBoard=renderBoard;
renderBoard=function(){
 protocolBoard();const chosen=S?.units.find(u=>u.uid===selected&&onBoard(u));if(!chosen)return;
 $('board').querySelectorAll('.cell.capture').forEach(cell=>{
  const target=unitAt(S,+cell.dataset.x,+cell.dataset.y),mode=captureMode(chosen,target);
  cell.dataset.captureMode=mode;
  cell.insertAdjacentHTML('beforeend',`<span class="resolution-pill ${mode}">${mode==='infect'?'永久寄生':'击杀'}</span>`);
 });
 if(chosen.side===C.side&&!chosen.used)$('board-hint').textContent+=chosen.kind==='spider'&&chosen.side==='r'?' · 机娘目标：永久寄生':' · 吃子：击杀，不会解救';
};
const protocolDossier=renderDossier;
renderDossier=function(){
 protocolDossier();const u=S?.units.find(v=>v.uid===selected&&onBoard(v))||movers(S,C.side).find(v=>v.char)||movers(S,C.side)[0];if(!u)return;
 const parasite=u.kind==='spider'&&u.side==='r';
 const text=parasite?'仅赤蛛能永久感染机娘。寄生换位后，本阶段双方锁定；没有解救。':'吃到敌方单位直接击杀。机娘、哨卫、信使都不能感染，也不能解救受控者。';
 $('dossier').querySelector('.dossier-controls')?.insertAdjacentHTML('beforebegin',`<p class="capture-law ${parasite?'infect':''}"><b>${parasite?'唯一感染执行器':'致命吃子'}</b>${text}</p>`);
};
radioForCapture=function(ev){if(ev.converted)radio(ev.converted.name,'N–6 运动总线覆写完成。阵营永久接入赤巢。');};
function combatCutIn(target,mode){
 clearTimeout(eventTimer);const box=$('capture-event'),infect=mode==='infect';
 box.className='capture-event cinema-capture '+(infect?'r':'lethal');
 const image=target.char?portraitSource(target.char,infect?'r':target.side):target.kind==='core'?ART.reactor:ART.device;
 const face=target.char||['spider','courier','core'].includes(target.kind)?`<img src="${image}" alt="">`:svg(KINDS[target.kind]?.icon||'drone','kill-machine');
 box.innerHTML=`<div class="capture-face">${face}</div><div class="capture-copy"><span>${infect?'NEURAL OVERWRITE / IRREVERSIBLE':'TARGET ELIMINATED / NO CONVERSION'}</span><strong>${infect?'永久寄生':'击杀'} · ${esc(target.name)}</strong><small>${infect?'装置与眼部同步亮红。无法解救。':'载体永久损毁，不会转换阵营。'}</small><em>${infect?'刚被寄生单位本阶段锁定':'死亡状态跨章保留'}</em></div>`;
 requestAnimationFrame(()=>box.classList.add('show'));eventTimer=setTimeout(()=>box.classList.remove('show'),2000);
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
 // Preserve existing roster history in legacy saves; do not retroactively
 // kill, convert or resurrect anyone. All NEW captures use the current law.
 if(old){C.flags.legacyCaptureHistory=true;persist();toast('旧档状态已保留；从现在起只有赤蛛能感染，其他吃子直接击杀，无法解救。');}
};
const protocolCasefile=showCasefile;
showCasefile=function(){protocolCasefile();$('modal-content').insertAdjacentHTML('afterbegin','<div class="manual-note"><b>不可逆感染</b>：停产只阻止新增感染，不会治愈已受控者。拆除装置、普通攻击和停机都不能把红方角色变回守护者。死者不会在后续章节重新部署。</div>');};
caseButton.onclick=showCasefile;
const protocolHelp=showHelp;
showHelp=function(){protocolHelp();$('modal-content').insertAdjacentHTML('afterbegin','<div class="manual-note lethal-note"><b>新规则：只有红蜘蛛能控制；没有解救。</b><br>普通机娘、哨卫、哨塔、信使与运输器的攻击都会击杀目标，哪怕对方是你曾经的同伴。受控机娘也只有击杀能力，不能继续感染别人。旧版双向夺控已取消。</div>');};
$('help-btn').onclick=showHelp;$('home-rules-btn').onclick=showHelp;
$('home').querySelector('.prototype-tag').textContent='IRON RULE · 0.6';
$('hero-identity').textContent=homeSide==='g'?'未感染 / 只有赤蛛能改写阵营':'不可逆感染 / RED HIVE CONTROL';
if(location.hash==='#qa')Object.assign(window.__MV_QA__,{
 captureMode(attacker,target){return captureMode(S.units.find(u=>u.uid===attacker),S.units.find(u=>u.uid===target));},
 hypothetical(m){const before=clone(S),test=clone(S),ev=applyBasic(test,m);return{before,after:test,event:ev};}
});
