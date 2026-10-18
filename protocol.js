/* M7 irreversible capture law. The engine is authoritative for both AI and player.
   No purification, revival, disarm-to-rescue, or reverse faction conversion. */
ACT_NAMES.g[0]=['接入静默甲板','截取原始授时','撤离封锁甲板'];
ACT_NAMES.g[3]=['开启镜像读口','取出双份签名','守住校验窗口'];
ACT_NAMES.r[3]=['打开镜室','保全受控校验员','维持镜像写入'];
ACT_NAMES.g[4][2]='近场切断生产链';

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
 const image=target.char?portraitSource(target.char,infect?'r':target.side):ART.device;
 box.innerHTML=`<div class="capture-face"><img src="${image}" alt=""></div><div class="capture-copy"><span>${infect?'NEURAL OVERWRITE / IRREVERSIBLE':'TARGET ELIMINATED / NO CONVERSION'}</span><strong>${infect?'永久寄生':'击杀'} · ${esc(target.name)}</strong><small>${infect?'装置与眼部同步亮红。无法解救。':'载体永久损毁，不会转换阵营。'}</small><em>${infect?'刚被寄生单位本阶段锁定':'死亡状态跨章保留'}</em></div>`;
 requestAnimationFrame(()=>box.classList.add('show'));eventTimer=setTimeout(()=>box.classList.remove('show'),2000);
 if(!reducedMotion){$('board').classList.remove('shake');requestAnimationFrame(()=>$('board').classList.add('shake'));setTimeout(()=>$('board').classList.remove('shake'),320);}
}
captureEffect=function(target){combatCutIn(target,'infect');};
function killEffect(target){combatCutIn(target,'kill');}

const protocolAdvance=advanceMission;
advanceMission=function(){
 if(!S?.outcome?.won||S.mid!==3||C.flags.mercy!==null){protocolAdvance();return;}
 const g=C.side==='g',noct=C.roster.noct;
 const frame=echoCard('镜像库 / 电源去向','LIVE STATE',['原始签名页 / 已读取','在线校验 / 仍在运行','感染 / 不可逆'],'拿走文件，不等于保留了它运行时的状态。镜像电源还要不要留？',{title:'留电，还是断电',scene:'archive'});
 playChoice(frame,[
  {label:'保留在线状态，取得完整校验链',detail:`保留可复现的运行态证据，核心仍每2轮生产。${g?'存活的朔夜仍是赤巢敌人，会强化后出现在终章。':'存活的朔夜强化并继续参战，但第4轮会有守护增援。'}已死亡者不会复活。`,action:()=>{C.flags.mercy=true;C.flags.liveSignature=true;if(noct.status==='active')noct.xp=Math.max(2,noct.xp);nextMission();}},
  {label:'切断电源，隔离镜像节点',detail:'核心生产间隔改为3轮；朔夜若存活则被封存在离线节点，不参加终章，阵营不变且没有获救。静态签名页保留，但失去可复现的在线校验链。',action:()=>{C.flags.mercy=false;C.flags.liveSignature=false;if(noct.status==='active')noct.status='retired';nextMission();}}
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
