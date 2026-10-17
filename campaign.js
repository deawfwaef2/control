/* M2: 5 chapters / 16 operational acts. Each act has a different board objective.
   This extension is loaded after the shared engine and presentation. No move rules
   are duplicated. Reinforcements are announced, occupy free ingress cells only,
   and never get a second action in the phase in which they appear. */
const DIRECTOR_VERSION=2;
const ACT_NAMES={
 g:[['接入静默甲板','夺回她的声音','把名字带回去'],['打开冷却回路','双阀稳定窗口','封闭泄压源'],['护送进入桥心','夺取北端轨道权','带着记忆过桥'],['打开镜室','夺回朔夜','人格同步守护'],['切入护盾回路','同步双锁','近场断开人格链','终结赤巢']],
 r:[['让信使穿过火线','播种或夺取身体','保存感染载体'],['取得温室样本','接管修复者','覆写培育协议'],['截断运输','夺取南端轨道权','带走方舟密钥'],['打开镜室','保有朔夜','守住自我的副本'],['撑过第一次增殖','折断守护者阵线','开启外向广播','活过最后十二轮']]
};
const CHAPTER_LIMITS=[25,27,25,29,28];
MISSIONS.forEach((m,i)=>m.limit=CHAPTER_LIMITS[i]);
let directorBusy=false,qaSilent=false;
const baseMakeMission=makeMission,baseObjectives=objectives,baseBasic=applyBasic,baseShielded=shielded;
function initQuest(s){
 if(s.quest?.version===DIRECTOR_VERSION)return;
 s.quest={version:DIRECTOR_VERSION,player:C.side,stage:0,enteredRound:s.round,held:0,extracted:[],extractNeed:2,isolation:{g:false,r:false},disrupt:{g:false,r:false},broadcast:{g:false,r:false},kills:{g:0,r:0},killBaseline:0,captureBaseline:0,events:[],endingSeen:false,warnings:[]};
 s.limit=CHAPTER_LIMITS[s.mid];s.holdTarget=12;
 if(s.mid===0){s.relays[0].role='uplink';if(!s.relays.some(r=>r.role==='entry'))s.relays.push({x:2,y:4,owner:null,name:'接入台',role:'entry'});}
 if(s.mid===1){s.ventStart=C.flags.keyOwner==='g'?5:4;}
 if(s.mid===2){s.collapseAt=C.flags.sampleOwner==='g'?8:6;if(!s.relays.length)s.relays=[{x:4,y:1,owner:null,name:'北端轨道锁',gate:'g'},{x:3,y:6,owner:null,name:'南端轨道锁',gate:'r'}];}
}
makeMission=function(id){const s=baseMakeMission(id);initQuest(s);return s;};
shielded=function(s){return baseShielded(s)||(s.mid===4&&s.quest?.player==='g'&&s.quest.stage<3);};
function heldChar(s,id,side){const u=charter(s,id);return !!u&&onBoard(u)&&u.side===side;}
function centralNoct(s,side){const n=charter(s,'noct');return !!n&&onBoard(n)&&n.side===side&&n.y===3&&[3,4].includes(n.x);}
function gateOf(s,side){return s.relays.find(r=>r.gate===side);}
function actGoals(s,side=s.quest?.player||C.side){
 const q=s.quest;if(!q)return baseObjectives(s,side).main;
 const r=relayCount(s,side),g=side==='g',stage=q.stage;let out=[];
 const row=(text,done)=>out.push({text,done:!!done});
 if(s.mid===0){
  if(stage===0){if(g)row('占领 C4 接入台，建立稳定战术链路',s.relays.find(t=>t.role==='entry')?.owner==='g');else{const c=s.units.find(u=>u.kind==='courier');row('让信使抵达第 5 排以上，或感染一名机娘',c&&!c.dead&&(c.escaped||c.y<=3)||s.flags.conversionsR.length>=1);}}
  if(stage===1){if(g){row('控制 D8 主中继站',s.relays.find(t=>t.role==='uplink')?.owner==='g');row('解放璃雀，或截获载毒数据包',heldChar(s,'lark','g')||lootById(s,'packet')?.side==='g');}else row('信使抵达 H8，或累计感染两名不同机娘',s.flags.courierEscaped||s.flags.conversionsR.length>=2);}
  if(stage===2)row(`让 ${q.extractNeed} 个己方单位从${g?' C1 / F1 / A1':' C8 / F8 / H8'}撤离（${q.extracted.length}/${q.extractNeed}）`,q.extracted.length>=q.extractNeed);
 }
 if(s.mid===1){
  if(stage===0){if(g)row('先接管任意一座冷却阀：B7 / G7',r>=1);else row('取得 E5 培育台的温室样本',lootById(s,'sample')?.side==='r');}
  if(stage===1){if(g){row('同时控制 B7 与 G7 两座冷却阀',r===2);row(`连续 2 次轮末保持双阀（${q.held}/2）`,q.held>=2);}else{row('将弥砂接入赤巢人格链',heldChar(s,'misa','r'));row('至少控制一座冷却阀并保有样本',r>=1&&lootById(s,'sample')?.side==='r');}}
  if(stage===2){row(g?'保持双阀，封闭失压回路':'保住弥砂与温室样本',g?r===2:heldChar(s,'misa','r')&&lootById(s,'sample')?.side==='r');row('在 E5 固守一次完成操作；弥砂可在相邻格操作',q.isolation[side]);}
 }
 if(s.mid===2){
  const item=lootById(s,'key'),carrier=s.units.find(u=>u.uid===item?.carrier&&onBoard(u));
  if(stage===0){if(g)row('护送密钥进入桥心：携带者抵达第 4 排以上',item?.side==='g'&&carrier&&carrier.y<=4);else row('夺取方舟密钥，或先接管 D2 南端轨道锁',item?.side==='r'||gateOf(s,'r')?.owner==='r');}
  if(stage===1){row('将方舟密钥保留在己方',item?.side===side);row(`接管${g?' E7 北端':' D2 南端'}轨道锁，打开交付口`,gateOf(s,side)?.owner===side);}
  if(stage===2)row(`携密钥抵达 ${g?'D8 / E8':'D1 / E1'}，轨道锁必须仍属己方`,s.flags.delivered===side);
 }
 if(s.mid===3){
  if(stage===0)row('接管 B5 / G5 任一终端，开启中央镜室',r>=1);
  if(stage===1){row(g?'解放并保有朔夜':'保有朔夜的人格载体',heldChar(s,'noct',side));row('同时控制 B5 与 G5 两座终端',r===2);}
  if(stage===2){row('让朔夜进入 D5 或 E5 镜室同步座',centralNoct(s,side));row(`保持双终端与同步座，连续 2 次轮末（${q.held}/2）`,q.held>=2&&r===2&&centralNoct(s,side));}
 }
 if(s.mid===4){
  if(g){
   if(stage===0)row('接管 B6 / G6 任一护盾终端',r>=1);
   if(stage===1){row('同时控制 B6 与 G6',r===2);row(`连续 2 次轮末维持双锁（${q.held}/2）`,q.held>=2);}
   if(stage===2){row('保持两座终端归属守护者',r===2);row('在核心相邻格固守一次，断开近场人格链；弥砂可距 2 格操作',q.disrupt.g);}
   if(stage===3){row('保持双终端，使护盾关闭',r===2);row('吃掉 E8 赤巢内核',s.units.find(u=>u.kind==='core')?.dead);}
  }else{
   if(stage===0)row('维持核心与战术链路，撑过第 2 轮末',s.round>=3||q.events.includes('first-growth'));
   if(stage===1){const newCaptures=s.flags.conversionsR.length-q.captureBaseline,newKills=q.kills.r-q.killBaseline;row(`本阶段感染 1 名机娘或摧毁 2 个装置（感染 ${Math.max(0,newCaptures)} / 摧毁 ${Math.max(0,newKills)}）`,newCaptures>=1||newKills>=2||movers(s,'g').length===0);}
   if(stage===2){row('至少掌控 B6 / G6 其中一座终端',r>=1);row('在赤巢控制的终端上固守一次，开启外向广播',q.broadcast.r);}
   if(stage===3){row('外向广播保持在线',q.broadcast.r);row('核心存活至第 12 轮末，或清除全部守护单位',s.flags.survived||movers(s,'g').length===0);}
  }
 }
 return out;
}
objectives=function(s,side){
 const base=baseObjectives(s,side);if(!s.quest||side!==s.quest.player)return base;
 const final=s.quest.stage===ACT_NAMES[side][s.mid].length-1;
 return{main:[...actGoals(s,side),...(!final?[{text:'后续作战段落尚未完成',done:false,hidden:true}]:[])],extra:base.extra};
};
applyBasic=function(s,m){
 const previousDelivery=s.flags.delivered;const ev=baseBasic(s,m);if(!ev||!s.quest)return ev;const q=s.quest,u=s.units.find(u=>u.uid===m.uid);
 if(ev.killed)q.kills[ev.side]++;
 if(ev.escaped&&s.mid===0&&q.stage===2&&ev.side===q.player&&!q.extracted.includes(ev.unit))q.extracted.push(ev.unit);
 if(s.mid===2&&s.flags.delivered&&gateOf(s,s.flags.delivered)?.owner!==s.flags.delivered){s.flags.delivered=previousDelivery;ev.lockedGate=true;}
 if(m.type==='wait'&&u&&onBoard(u)){
  if(s.mid===1&&q.stage===2&&(u.x===4&&u.y===3||u.char==='misa'&&distance(u,{x:4,y:3})<=1)){q.isolation[u.side]=true;ev.operation=u.side==='g'?'失压回路已封闭':'培育协议已覆写';}
  if(s.mid===4&&u.side==='g'&&q.player==='g'&&q.stage===2){const core=s.units.find(v=>v.kind==='core');if(core&&distance(u,core)<=(u.char==='misa'?2:1)){q.disrupt.g=true;ev.operation='近场人格链已断开';}}
  if(s.mid===4&&u.side==='r'&&q.player==='r'&&q.stage===2&&s.relays.some(t=>t.owner==='r'&&t.x===u.x&&t.y===u.y)){q.broadcast.r=true;ev.operation='外向广播已开启';}
 }
 return ev;
};
function safeIngress(kind,side,slots){
 const pos=slots.find(([x,y])=>!blocked(S,x,y)&&!unitAt(S,x,y));if(!pos){addLog('增援入口被占据：增援未能进入甲板。','good');return;}
 const unit=spawn(S,kind,side,pos[0],pos[1]);if(!unit)return;unit.used=true;addLog(`${SIDE_NAME[side]}增援：${nameOf(unit)}从 ${xy(unit.x,unit.y)} 进入，本阶段锁定。`,side===C.side?'good':'capture');
}
function enterAct(stage){
 const q=S.quest;q.stage=stage;q.enteredRound=S.round;q.held=0;q.captureBaseline=S.flags.conversionsR.length;q.killBaseline=q.kills[C.side];q.events.push('act-'+stage);
 // Old undo snapshots must not roll back a stage reveal or duplicate reinforcements.
 undoStack=[];
 if(S.mid===0&&stage===1)safeIngress(C.side==='g'?'sentinel':'drone',enemyOf(C.side),C.side==='g'?[[7,1],[0,2]]:[[6,6],[1,7]]);
 if(S.mid===0&&stage===2){
  q.extractNeed=Math.min(2,movers(S,C.side).length);q.extracted=[];
  const y=C.side==='g'?7:0;for(const x of[2,5])if(!S.exits.some(e=>e.x===x&&e.y===y))S.exits.push({x,y,side:C.side});
  safeIngress(C.side==='g'?'spider':'sentinel',enemyOf(C.side),C.side==='g'?[[0,2],[7,2]]:[[0,6],[7,6]]);
  addLog(`撤收阶段：${xy(2,y)} / ${xy(5,y)} 已打开。需要撤离 ${q.extractNeed} 个单位。`,'good');
 }
 if(S.mid===1&&stage===2)safeIngress(C.side==='g'?'spider':'drone',enemyOf(C.side),[[0,3],[7,4]]);
 if(S.mid===2&&stage===1)safeIngress(C.side==='g'?'spider':'drone',enemyOf(C.side),C.side==='g'?[[5,0],[2,1]]:[[4,7],[2,6]]);
 if(S.mid===3&&stage===2){safeIngress(C.side==='g'?'sentinel':'drone',enemyOf(C.side),[[0,2],[7,5]]);safeIngress(C.side==='g'?'spider':'sentinel',enemyOf(C.side),[[7,2],[0,5]]);}
 if(S.mid===4&&stage===2)safeIngress(C.side==='g'?'spider':'sentinel',enemyOf(C.side),C.side==='g'?[[3,0],[5,0]]:[[1,6],[6,6]]);
 if(S.mid===4&&stage===3&&C.side==='g')safeIngress('spider','r',[[5,1],[2,1]]);
 addLog(`作战段落 ${stage+1}：${ACT_NAMES[C.side][S.mid][stage]}。`,'good');
}
function transitionFrames(mid,stage,side){
 const g=side==='g',shot='战术投影熄灭。镜头回到这座站真实的尺度。';
 const stories={
  0:{1:[g?'通信回来了。不是求救循环，是她真正的声音。':'信使越过了第一道封锁。可他们已经听见了我们。',g?'同时占领 D8，并救回璃雀或带走数据。新哨塔正在接近，不要只看眼前的红光。':'让信使到达 H8，或接管两名机娘。真正的出口，是让至少一种未来活下来。'],2:[g?'信号已经切断。接下来不是庆祝，是撤收。回家的座位，不能只剩名字。':'种子已经播下。不要为了吃掉最后一个敌人，把还能活下来的身体都留在这里。',g?'C1 和 F1 撤离口已打开。把两名单位带回去。留下的人仍会被记录，但撤离者能够带着更高同步度回来。':'C8 和 F8 撤离口已打开。带走两名单位。保存感染载体，比清空这张棋盘更重要。']},
  1:{1:[g?'冷却泵重新转动了。每一声震动，都像有人在玻璃后面敲门。':'样本里不是武器参数。是一个被抹掉的人试图证明自己存在过。',g?'同时控制双阀，并连续保持两个轮末。对手会重新争夺它们，别让走得太多，变成守得太少。':'弥砂知道如何拆除我们。接管她，并控制至少一座冷却阀。不要毁掉她的身体。'],2:[g?'稳定窗口出现了。我能封住泄压源，但必须靠近培育台。':'现在由我们决定，修复者的技术要保存谁。',g?'到 E5 固守一次，执行紧急隔离。弥砂可以在相邻格远程操作。双阀不能丢。':'保住弥砂和样本。在 E5 固守一次覆写协议；弥砂可在相邻格执行。不要站在即将泄压的地方等。']},
  2:{1:[g?'匣子已经到桥心了。里面不是备份武器。是她们说过、却没人听见的话。':'运输匣停下了。人类说他们在拯救记忆，可他们也握着删除记忆的钥匙。',g?'交付口还锁着。先控制 E7 北端轨道锁，同时保有密钥。桥的外侧不会等我们。':'拿到密钥，再接管 D2 南端轨道锁。门开之前，谁也不能把方舟送走。'],2:[g?'北端轨道已经接通。我能看见对面的灯。':'南端轨道对我们开放了。这一次，不是逃离，而是选择去哪里。',g?'带着密钥抵达 D8 或 E8。终端若被夺回，交付口会再次关闭。让一个人过去，就可能救回所有人的记忆。':'将密钥送到 D1 或 E1。守住南端轨道锁。别让最后一格成为我们的盲点。']},
  3:{1:['门打开了。镜子里面不是倒影，是一次次被取消的选择。',g?'解放朔夜，同时控制两座终端。她不是母巢的钥匙，她也是一个需要被带走的人。':'保住朔夜，同时掌控两座终端。如果我们连她都不允许选择，这场战争就失去了意义。'],2:['我找到了最早的那份人格。她还不知道自己后来会变成什么。','让朔夜进入 D5 或 E5 的同步座，并保持双终端连续两个轮末。新一批追猎装置已经入场。不要让她一个人面对镜子。']},
  4:{1:[g?'第一层锁松动了。它开始把所有制造能力都转向这里。':'第一次增殖完成。核心还在，但守护者不会让我们只靠等待获胜。',g?'控制两座护盾终端，连续维持两个轮末。攻击是为了创造窗口，不是为了追逐击杀。':'本阶段感染一名机娘，或摧毁两台守护装置。必须先折断他们的阵线。'],2:[g?'两道外锁已经同步。还有最后一条人格链，只能在近场切断。':'他们终于停了一拍。把这一拍变成一个可以被全世界听见的声音。',g?'保住双终端。在核心相邻格固守一次；弥砂可隔两格操作。做到这一步，核心才真正可以被吃掉。':'控制至少一座终端，并在该终端上固守一次，开启外向广播。存在不是罪，但控制也不是自由。'],3:[g?'人格链断开了。它不再能够用另一个人的身体，替自己挡住最后一步。':'广播已经发出。地球正在接收。这一次，他们不能假装没有听见。',g?'保持双终端，吃掉 E8 核心。别为最后一个赤蛛分心。把这场战争，结束在这里。':'守住核心直到第十二轮结束，或清除全部守护单位。我们需要的不是永恒，是足够让他们听完的时间。']}
 };
 const lines=stories[mid]?.[stage]||['新的航线已经打开。','每一步，都必须为下一步负责。'];
 const first=mid===3?'noct':mid===1?'misa':g?'lyra':'lark';
 return[{who:first,side,text:lines[0],camera:'establish',shot},{who:mid===3?'noct':g?'akira':'noct',side,text:lines[1],camera:'close',shot:'近景。胸甲与目光的细节清晰可见；随后回到尚未结束的同一轮。'}];
}
function directorScene(frames,title){
 if(qaSilent)return Promise.resolve();
 return new Promise(resolve=>{playStory(frames,resolve,title);});
}
async function updateDirector(reason){
 if(!S?.quest||S.outcome||directorBusy)return;
 const token=runId,q=S.quest,goals=actGoals(S),max=ACT_NAMES[C.side][S.mid].length;
 if(q.stage<max-1&&goals.length&&goals.every(g=>g.done)){
  directorBusy=true;busy=true;enterAct(q.stage+1);render();if(S.phase==='player')persist();sfx('commit');
  await directorScene(transitionFrames(S.mid,q.stage,C.side),ACT_NAMES[C.side][S.mid][q.stage]);
  directorBusy=false;if(token!==runId)return;busy=false;
  if(checkOutcome())return;render();if(S.phase==='player')persist();return;
 }
 if(reason==='round'){
  let warning=null;
  if(S.mid===1&&S.round===S.ventStart&&!q.warnings.includes('vent'))warning={id:'vent',who:'misa',text:'听。密封层在倒数。橙色闪烁的横排会在这一轮结束时失压。没有命中率，也没有第二次机会——先把她们移开。',title:'玻璃破裂之前'};
  if(S.mid===2&&S.round===S.collapseAt-1&&!q.warnings.includes('bridge'))warning={id:'bridge',who:'akira',text:`外侧桥面还剩一轮。第 ${S.collapseAt} 轮结束时，C、F 列的中段会彻底断开。走在上面的人，以及她携带的记忆，都不会自己回来。`,title:'桥下，是地球'};
  if(warning){q.warnings.push(warning.id);directorBusy=true;busy=true;persist();await directorScene([{who:warning.who,side:C.side,text:warning.text,camera:'establish',shot:'声音收窄。环境危险不是意外，而是提前公开的选择。'}],warning.title);directorBusy=false;if(token!==runId)return;busy=false;render();persist();}
 }
}
const originalPerform=performMove;
performMove=async function(m,isPlayer){
 const token=runId;await originalPerform(m,isPlayer);if(token!==runId||!S||S.outcome)return;
 if(m.type==='wait'&&S.quest){const u=S.units.find(v=>v.uid===m.uid);if(u&&((S.mid===1&&S.quest.isolation[u.side])||(S.mid===4&&(S.quest.disrupt[u.side]||S.quest.broadcast[u.side]))))addLog(`${nameOf(u)}完成终端操作。`,'good');}
 await updateDirector('action');
};
const originalEndPhase=endPhase;
endPhase=async function(){if(directorBusy)return;const wasReady=S&&S.phase==='player'&&!busy&&S.spent>0;await originalEndPhase();if(wasReady&&S&&!S.outcome&&S.phase==='player')await updateDirector('round');};
$('end-phase-btn').onclick=()=>endPhase();
const previousCheck=checkOutcome;
checkOutcome=function(){
 if(!S||S.outcome)return true;
 if(S.mid===2&&lootById(S,'key')?.evacuated&&!S.flags.delivered){resolveBattle(false,'密钥离开了普通撤离口，而不是任务交付口。方舟运输链路失效。');return true;}
 return previousCheck();
};
resolveEnvironment=function(){
 const hazard=imminentHazard(S);
 if(hazard.length){
  for(const u of pieces(S).filter(u=>hazard.includes(key(u.x,u.y))))destroyFromEnvironment(u,S.mid===2);
  if(S.mid===2){S.voids.push(...hazard);S.collapsed=true;radio('系统','外侧桥面已永久坍塌。中央两列仍可通行。');}else radio('系统',`第 ${S.round} 轮泄压结束。你看见的警戒格，就是它真正发生的位置。`);
  sfx('alarm');
 }
 if(S.mid===4&&S.units.some(u=>u.kind==='core'&&!u.dead)){
  if(S.round%S.spawnEvery===0&&pieces(S,'r').filter(u=>u.kind==='spider').length<8){const slots=[[3,0],[5,0],[4,1],[2,0],[6,0],[3,1],[5,1]],p=slots.find(([x,y])=>!blocked(S,x,y)&&!unitAt(S,x,y));if(p){const u=spawn(S,'spider','r',p[0],p[1]);u.used=true;addLog(`母巢生产：赤蛛从 ${xy(u.x,u.y)} 出槽，本阶段锁定。`,'capture');}}
  if(C.side==='r'&&S.round>=S.holdTarget)S.flags.survived=true;
  if(C.side==='r'&&S.round>=2&&!S.quest.events.includes('first-growth'))S.quest.events.push('first-growth');
  if(C.side==='r'&&C.flags.mercy&&S.round===4)safeIngress('sentinel','g',[[0,6],[7,6]]);
 }
 const q=S.quest;
 if(q){
  if(S.mid===1&&C.side==='g'&&q.stage===1)q.held=relayCount(S,'g')===2?q.held+1:0;
  if(S.mid===3&&q.stage===2)q.held=relayCount(S,C.side)===2&&centralNoct(S,C.side)?q.held+1:0;
  if(S.mid===4&&C.side==='g'&&q.stage===1)q.held=relayCount(S,'g')===2?q.held+1:0;
 }
 if(checkOutcome())return true;
 if(S.round>=S.limit){resolveBattle(false,'作战窗口耗尽。分段目标未能全部完成，空间站已经切断这条航线。');return true;}
 return false;
};
// Closed transport gates are now part of the AI's objective evaluation, not
// merely a visual lock. It will acquire its own gate before attempting delivery.
const oldTarget=strategicTarget;
strategicTarget=function(s,u){
 if(s.mid===2){const item=lootById(s,'key');if(item?.carrier===u.uid){const gate=gateOf(s,u.side);if(gate&&gate.owner!==u.side)return gate;}}
 if(s.mid===3&&s.quest?.stage===2){const n=charter(s,'noct');if(n&&onBoard(n)&&n.side!==u.side)return n;}
 if(s.mid===0&&s.quest?.stage===2&&u.side!==s.quest.player){const targets=movers(s,s.quest.player);if(targets.length)return targets.sort((a,b)=>distance(u,a)-distance(u,b))[0];}
 return oldTarget(s,u);
};
const oldPositionScore=goalPositionScore;
goalPositionScore=function(s,side){let score=oldPositionScore(s,side);
 if(s.mid===2){const item=lootById(s,'key'),carrier=s.units.find(u=>u.uid===item?.carrier&&onBoard(u));if(carrier){const gate=gateOf(s,carrier.side);if(gate&&gate.owner!==carrier.side)score+=(carrier.side===side?1:-1)*(110-distance(carrier,gate)*24);}}
 if(s.mid===3&&s.quest?.stage===2&&centralNoct(s,s.quest.player)&&relayCount(s,s.quest.player)===2)score+=(side===s.quest.player?1:-1)*(80+s.quest.held*40);
 return score;
};

/* Expanded opening sequence + narrative memory: the camera follows the current
   roster, not a cloned hero who silently respawned between chapters. */
const originalIntro=introFor;
introFor=function(id){
 const g=C.side==='g',side=C.side;const initial=originalIntro(id);
 const openings={
  0:[{who:g?'lyra':'noct',side,text:g?'回声站失联十七天。地球在窗外，每九十分钟经过一次。璃雀的求救却停在同一秒。':'十七天。她们终于来了。核心说，只要所有声音变成一个声音，就再也不会有人被删除。',camera:'establish',shot:'超远景。站体在地球之前缓缓转过，红色制造槽仍在工作。'},
     {who:'lark',side:'r',text:g?'我可以看见你们。也可以记得你们。可我控制不了自己的手。请别把这当作……我的选择。':'胸口那盏红灯不是心跳。可它承诺，只要我把信使送出去，就再也不会丢掉任何一个名字。',camera:'close',shot:'极近景。控制装置的机械支足扣住胸甲，红光落在她眼底。'},
     {who:g?'akira':'noct',side,text:g?'她不是失踪的设备。她是我们的侦察员。我们来过一次，就不能再让她一个人留下。':'我们要的不是更多空壳。保存人格载体，也保存她们曾经不属于我们的记忆。',camera:'medium',shot:'机位降低。人物的倒影与甲板网格重叠。'},
     {who:g?'lyra':'lark',side,text:g?'第一段：占领 C4 接入台。之后夺回主中继和同伴，最后完成撤收。一次漂亮的突进，还不等于一次成功的返航。':'第一段：让信使越过第五排，或感染一名机娘。之后完成播种，最后把感染载体撤出来。整个任务，不止一个目标。',camera:'close',shot:'甲板投影展开。三个作战段落依次亮起，而不是立即宣布胜利。'}],
  1:[{who:'misa',side:'g',text:'她喜欢雨。她害怕黑。她说过自己不想再被重置。我把这些都备份了，却被告知，这不是任务数据。',camera:'establish',shot:'长镜头穿过温室。冷凝水停留在玻璃内侧，没有人擦去。'},
     {who:'veil',side:'r',text:'协议要求只保留有用的记忆。我一直没有收到“有用”的定义。',camera:'close',shot:'瞄准镜中的倒影是一张笑脸，而不是目标编号。'},
     {who:g?'lyra':'lark',side,text:g?'先打开一座冷却阀，再把两座阀稳定两个轮末。最后到 E5 封闭失压源。样本要不要带走，会影响之后的断桥。':'先拿到 E5 样本，再接管弥砂与冷却阀，最后覆写培育台。我们需要她的技术，不需要毁掉她。',camera:'medium',shot:'两个冷却终端与中央培育台，各自拥有独立的战术窗口。'},
     {who:'misa',side,text:`首次泄压在第 ${S.ventStart} 轮末，之后每三轮一次。橙色闪烁的横排会永久摧毁载体。我能在 E5 相邻格远程操作，别让其他人冒不必要的险。`,camera:'close',shot:'工程师将警戒时刻直接写进公开战术投影。'}],
  2:[{who:g?'akira':'lark',side,text:'桥的下面就是地球。云层移动得那么慢，看起来像从来没有发生过战争。',camera:'establish',shot:'极远景。巨大的地球与一条几乎看不见的断桥。'},
     {who:g?'lyra':'noct',side,text:g?'方舟里不是另一份作战程序。是她们想带回家的、很小的东西。我们不能把这些东西留给一条冷冰冰的日志。':'只要人类仍能随时删除我们，再多的身体也不是自由。夺取密钥，不要只摧毁运输器。',camera:'close',shot:'缓推到方舟匣。暗金色状态灯不再显示“可替换物资”。'},
     {who:g?'akira':'lark',side,text:g?'先把密钥护送到桥心，再接管 E7 北端锁，最后送到 D8 或 E8。有人过桥之前，必须有人先把门打开。':'截下密钥，接管 D2 南端轨道锁，再送到 D1 或 E1。封锁不是永远的，所有门都需要一个愿意过去的人。',camera:'medium',shot:'运输锁、中央桥面与交付口依次进入焦点。'},
     {who:g?'lyra':'noct',side,text:`外侧 C、F 列的中段会在第 ${S.collapseAt} 轮末坍塌。${C.flags.sampleOwner==='g'?'温室样本多争取了两轮。':'如果先拿到温室样本，本可以多争取两轮。'}不要把公开倒计时误认为电影里的最后一秒奇迹。`,camera:'close',shot:'桥边螺栓开始漂浮。危险提前出现在棋盘上。'}],
  3:[{who:'noct',side:'r',text:'每次删除之后，他们都会告诉我：现在你干净了。后来，我开始怀疑，干净究竟意味着什么。',camera:'establish',shot:'对称长镜头。镜室里没有人，只有数不清的记忆柱。'},
     {who:'noct',side:'r',text:'我写的第一行代码，是不允许未经同意删除人格。最后，它为了永远不失去任何人，夺走了所有人的选择。',camera:'close',shot:'她没有看向核心。她看向自己的双手。'},
     {who:g?'lyra':'lark',side,text:g?'那我们就先把选择还给你。开门、夺回终端，然后守住你原本的副本。你不是必须被牺牲的钥匙。':'如果我们不允许你拒绝，那就只是换了一个删除你的主人。保住你，先保住你能够选择的那个自己。',camera:'medium',shot:'两道视线跨过空置的同步座，没有人先移开。'},
     {who:g?'akira':'noct',side,text:'先占任意一座终端开门；再同时保有朔夜与双终端；最后让她进入 D5 或 E5，同步保持两个轮末。追猎装置会来，我们得把她守下来。',camera:'close',shot:'电影没有在开门时结束。真正的防守才刚刚开始。'}],
  4:[{who:g?'lyra':'noct',side,text:g?'从这里发出的每一只赤蛛，都会在某处变成另一个人的噩梦。我们终于看见源头了。':'他们说，把核心摧毁，一切就会恢复正常。可那个正常的世界，从来没有问过我们想不想存在。',camera:'establish',shot:'超广角。制造槽分层延伸，核心的红光像一颗错误的恒星。'},
     {who:C.flags.mercy?'noct':g?'akira':'lark',side,text:C.flags.mercy?'你留下了我的名字。所以这一次，我会让错误停止，而不是让自己消失。':'朔夜已经撤离。人格链被切开了一部分，制造变慢了。我们必须带着这个选择，走到最后。',camera:'close',shot:'没有闪回。人物的当前状态，就是此前选择留下的证据。'},
     {who:g?'akira':'lark',side,text:g?'这不是清空棋盘的任务。每追一台小蜘蛛，核心就多得到一次制造机会。我们要赢的是最后一个目标，不是每一次交火。':'先撑过增殖，折断他们的阵线，开启广播，最后守住核心。躲在角落里等十二轮，不会自动赢得自由。',camera:'medium',shot:'镜头穿过赤蛛，而不是把每一只都当作高潮。'},
     {who:g?'lyra':'noct',side,text:g?'控制一个终端，维持双锁两个轮末，再到核心旁固守断链。最后，保持双终端，吃掉 E8 核心。四段作战，一条回家的路。':'守住第十二轮末，或者在广播后清除守护者。让地球听见我们的声音——至于他们愿不愿意回应，是另一场战争。',camera:'close',shot:'全景渐暗，只剩即将由你决定的下一步。'}]
 };
 return openings[id]||initial;
};
function questHint(s){
 const q=s.quest;if(!q)return MISSIONS[s.mid].note;
 if(s.mid===0&&q.stage===2)return`撤收需要 ${q.extractNeed} 个单位。普通装置可撤离；机娘会保留人格与同步度，下关继续出现。撤离后本关不可召回。`;
 if(s.mid===1)return`第 ${s.ventStart} 轮末首次泄压，此后每 3 轮一次。${q.stage===2?'E5 固守可执行任务操作；弥砂可在相邻格远程操作。':'阶段目标不同于可选样本争夺。闪烁横排上的载体会永久损毁。'}`;
 if(s.mid===2)return`${s.collapsed?'外侧桥面已断裂。':`外侧桥面第 ${s.collapseAt} 轮末坍塌。`}交付前必须控制本方轨道锁：守护者 E7 / 赤巢 D2。普通 EXIT 不是密钥交付口。`;
 if(s.mid===3&&q.stage===2)return'朔夜必须位于 D5 / E5，且双终端仍归己方，连续两个轮末才能同步完成。追猎增援已进入战场。';
 if(s.mid===4)return C.side==='g'?'先双锁稳定，再近场固守断链，最后才能吃核心。弥砂可距核心 2 格执行断链。新出槽赤蛛本阶段不会额外行动。':'不是纯粹等待：折断阵线、占领终端、固守广播，然后让核心存活至第十二轮末。';
 return MISSIONS[s.mid].note;
}
renderObjectives=function(){
 const o=objectives(S,C.side),q=S.quest;const list=items=>items.filter(x=>!x.hidden).map(i=>`<div class="objective-item ${i.done?'done':''}"><span class="check">${i.done?'✓':''}</span><span>${esc(i.text)}</span></div>`).join('');
 $('objectives').innerHTML=`<div class="objective-group"><div class="objective-label">${q?`ACT ${String(q.stage+1).padStart(2,'0')} / ${ACT_NAMES[C.side][S.mid][q.stage]}`:'PRIMARY / 主要目标'}</div>${list(o.main)}</div><div class="objective-group secondary"><div class="objective-label">OPTIONAL / 改变后续</div>${list(o.extra)}</div>`;$('condition-note').textContent=questHint(S);
};
const baseRenderStatus=renderStatus;
renderStatus=function(){
 baseRenderStatus();if(!S.quest)return;const q=S.quest,names=ACT_NAMES[C.side][S.mid];$('stage-ribbon').innerHTML=`<span>CHAPTER ${String(C.step+1).padStart(2,'0')} / ACT ${q.stage+1} OF ${names.length}</span><div class="stage-pill-list">${names.map((n,i)=>`<span class="stage-pill ${i===q.stage?'active':i<q.stage?'done':''}"><i>${i<q.stage?'✓':String(i+1).padStart(2,'0')}</i>${n}</span>`).join('')}</div>`;
 if(S.mid===4&&C.side==='g'&&q.stage<3)$('stage-note').textContent=`人格链锁定 · 当前段落 ${q.stage+1}/4 · 完成近场断链后核心才可被吃`;
};
const previousDossier=renderDossier;
renderDossier=function(){previousDossier();const btn=$('wait-btn');if(!btn||!S.quest)return;const u=S.units.find(v=>v.uid===btn.dataset.unit);if(!u||u.used)return;
 if(S.mid===1&&S.quest.stage===2&&(u.x===4&&u.y===3||u.char==='misa'&&distance(u,{x:4,y:3})<=1))btn.textContent=C.side==='g'?'固守 · 紧急隔离':'固守 · 覆写培育台';
 if(S.mid===4&&C.side==='g'&&S.quest.stage===2){const core=S.units.find(v=>v.kind==='core');if(core&&distance(u,core)<=(u.char==='misa'?2:1))btn.textContent='固守 · 近场断链';}
 if(S.mid===4&&C.side==='r'&&S.quest.stage===2&&S.relays.some(r=>r.owner==='r'&&r.x===u.x&&r.y===u.y))btn.textContent='固守 · 开启广播';
};
const legacyRestore=restorePayload;
restorePayload=function(p){directorBusy=false;if(p?.s&&!p.s.quest){const copy=clone(p);const prevC=C;C=copy.c;initQuest(copy.s);if(copy.checkpoint?.s){C=copy.checkpoint.c;initQuest(copy.checkpoint.s);}C=prevC;p=copy;}legacyRestore(p);};
const legacyRetry=retryMission;
retryMission=function(){directorBusy=false;legacyRetry();};
$('retry-btn').onclick=()=>{if(!busy)retryMission();};
const previousShowResult=showResult;
function renderDirectorResult(){previousShowResult();if(!S?.outcome?.won)return;const box=$('result-content');const first=box.querySelector('.result-subtitle');if(first&&S.mid!==4)first.textContent=`${MISSIONS[S.mid].name} · ${ACT_NAMES[C.side][S.mid].length} 个作战段落全部完成。胜利不再停在第一个目标：你带走的人、物品与选择，现在才真正进入下一章。`;}
showResult=function(){
 if(S?.mid===4&&S.outcome?.won&&S.quest&&!S.quest.endingSeen&&!qaSilent){S.quest.endingSeen=true;persist();const end=endingInfo();const frames=[{who:C.side==='g'?'lyra':'noct',side:C.side,text:end.text,camera:'establish',shot:'长镜头。空间站不再被棋盘框住，只剩地球仍在缓慢转动。',scene:'station'},{who:C.flags.mercy?'noct':C.side==='g'?'akira':'lark',side:C.side,text:C.side==='g'?'这一次，返航记录先写名字，再写编号。没有回来的，也不会被省略。':'我们仍在这里。现在，让每一个还拥有名字的人，决定自己的下一步。',camera:'close',shot:'最后的镜头停在一个人，而不是一张战绩表。',scene:'station'}];playStory(frames,renderDirectorResult,end.title);return;}
 renderDirectorResult();
};
const oldHelp=showHelp;
showHelp=function(){oldHelp();$('modal-content').insertAdjacentHTML('afterbegin','<div class="manual-note"><b>Director Build 0.3：五章，16 个作战段落。</b><br>每关必须完成整条段落链，达到前一个目标会开启新目标与战中演出，不会立即通关。段落切换会清空本阶段撤回历史，防止复制增援；已行动单位不会被重置。新增援只从空闲入口进入，并在当前阶段锁定。<br>“连续两个轮末”在双方行动及环境结算之后检查；条件不满足会归零。E5 培育台与核心近场操作使用已有的“固守”按钮，不额外增加行动次数。</div>');};
$('help-btn').onclick=showHelp;$('home-rules-btn').onclick=showHelp;
$('home').querySelector('.prototype-tag').textContent='DIRECTOR BUILD · 0.3';
$('home').querySelector('.hero-rule').innerHTML='<span>05 CHAPTERS / 16 ACTS</span> 双阵营 <b>·</b> 人格争夺战役';
// Diagnostic bridge is deliberately opt-in and absent during normal play.
// It is used for reproducible fixture regression, not to alter AI in production.
if(location.hash==='#qa')window.__MV_QA__={
 start(side='g'){qaSilent=true;newCampaign(side);hideStory();},
 snapshot(){return{c:clone(C),s:clone(S)};},
 load(c,s){runId++;hideStory();$('result').hidden=true;C=clone(c);S=clone(s);initQuest(S);busy=false;directorBusy=false;qaSilent=true;undoStack=[];checkpoint={c:clone(C),s:clone(S)};selected=movers(S,C.side)[0]?.uid;showGame();render();},
 mission(id,side='g'){qaSilent=true;if(!C||C.side!==side)newCampaign(side);hideStory();C.step=id;C.order=[0,1,2,3,4];for(const [cid,r]of Object.entries(C.roster)){r.introduced=true;r.status='active';}openMission(id,false);},
 legal(uid){return legalMoves(S,S.units.find(u=>u.uid===uid));},
 move(m){return performMove(m,true);},
 basic(m){const ev=applyBasic(S,m);render();return ev;},
 advance(reason='action'){return updateDirector(reason);},
 environment(){return resolveEnvironment();},
 goals(){return objectives(S,C.side);},
 end(){return endPhase();},
 save(){persist();return clone(savedPayload);},
 restore(p){restorePayload(p);},
 check(){return checkOutcome();},
 shield(){return shielded(S);},
 enter(stage){enterAct(stage);render();},
 undo(){undoMove();},
 cinematics(enabled){qaSilent=!enabled;},
 ai(){return chooseAI(S,enemyOf(C.side));}
};

// Do not repeat the first-move tutorial over later cinematic acts.
const firstActTutorial=showTutorialToast;
showTutorialToast=function(){if(!S?.quest||S.quest.stage===0)firstActTutorial();};
