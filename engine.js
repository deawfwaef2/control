function newCampaign(side){
 runId++; busy=false; selected=null; undoStack=[];
 C={version:1,side,step:0,order:[0,1,2,3,4],route:null,roster:{},flags:{packetOwner:null,sampleOwner:null,keyOwner:null,mercy:null},history:[],stats:{moves:0,enemyMoves:0,conversions:0,rescues:0,losses:0},finished:false};
 for(const id of Object.keys(CHAR)) C.roster[id]={side:['lyra','akira','misa'].includes(id)?'g':'r',status:'active',xp:0,introduced:false};
 openMission(0,true);
}
function unitAt(s,x,y){return s.units.find(u=>onBoard(u)&&u.x===x&&u.y===y);}
function blocked(s,x,y){return x<0||x>7||y<0||y>7||s.walls.includes(key(x,y))||s.voids.includes(key(x,y));}
function pieces(s,side){return s.units.filter(u=>onBoard(u)&&(!side||u.side===side));}
function movers(s,side){return pieces(s,side).filter(u=>u.kind!=='core');}
function relayCount(s,side){return s.relays.filter(r=>r.owner===side).length;}
function shielded(s){return s.mid===4&&relayCount(s,'g')<2;}
function lootById(s,id){return s.loot.find(l=>l.id===id);}
function charter(s,id){return s.units.find(u=>u.char===id);}
function friendlyAdjacent(s,u,id){return s.units.some(v=>onBoard(v)&&v.char===id&&v.side===u.side&&v.uid!==u.uid&&Math.max(Math.abs(v.x-u.x),Math.abs(v.y-u.y))===1);}
function spawn(s,kind,side,x,y,char=null,uid=null){
 let pos={x,y};
 if(blocked(s,x,y)||unitAt(s,x,y)){
  const cells=[];for(let yy=0;yy<8;yy++)for(let xx=0;xx<8;xx++)if(!blocked(s,xx,yy)&&!unitAt(s,xx,yy))cells.push({x:xx,y:yy,d:Math.abs(xx-x)+Math.abs(yy-y)});
  cells.sort((a,b)=>a.d-b.d);if(!cells.length)return null;pos=cells[0];
 }
 const u={uid:uid||char||`${kind}-${s.serial++}`,kind,char,side,x:pos.x,y:pos.y,used:false,xp:char?C.roster[char].xp:0,dead:false,escaped:false,flee:false};s.units.push(u);return u;
}
function makeMission(id){
 const s={mid:id,round:1,phase:'player',spent:0,aiBudget:0,aiDone:0,limit:MISSIONS[id].limit,holdTarget:9,units:[],walls:[],voids:[],doors:[],relays:[],loot:[],exits:[{x:7,y:0,side:'r'},{x:0,y:7,side:'g'}],delivery:[],logs:[],serial:1,flags:{conversionsG:[],conversionsR:[],courierEscaped:false,delivered:null,gatesOpen:false,survived:false},counts:{g:0,r:0},captureSeen:{},events:[],outcome:null,lastMove:null,collapsed:false,collapseAt:C.flags.sampleOwner==='g'?6:4,ventStart:C.flags.keyOwner==='g'?4:3,spawnEvery:C.flags.mercy===false?3:2};
 const reveal=id===0?['lyra','akira','lark']:id===1?['misa','veil']:id===3?['noct']:[];
 reveal.forEach(cid=>C.roster[cid].introduced=true);
 if(id===0){s.walls=['3,3','4,3','3,4','4,4'];s.relays=[{x:3,y:0,owner:null,name:'中继站'}];}
 if(id===1){s.walls=['2,2','5,2','2,5','5,5'];s.relays=[{x:1,y:1,owner:null,name:'西冷却阀'},{x:6,y:1,owner:null,name:'东冷却阀'}];s.loot.push({id:'sample',name:'温室样本',x:4,y:3,carrier:null,side:null,lost:false});}
 if(id===2){for(let y=2;y<=5;y++)for(const x of [0,1,6,7])s.voids.push(key(x,y));s.walls=['1,1','6,1'];s.delivery=[{x:3,y:0,side:'g'},{x:4,y:0,side:'g'},{x:3,y:7,side:'r'},{x:4,y:7,side:'r'}];}
 if(id===3){s.walls=['3,2','3,3','4,3','4,4'];s.doors=['3,3','4,3'];s.relays=[{x:1,y:3,owner:null,name:'西镜像终端'},{x:6,y:3,owner:null,name:'东镜像终端'}];}
 if(id===4){s.walls=['2,3','5,3','3,5','4,5'];s.relays=[{x:1,y:2,owner:C.flags.packetOwner==='g'?'g':null,name:'西护盾终端'},{x:6,y:2,owner:null,name:'东护盾终端'}];}
 const formations=id===2?{g:[[2,7],[5,7],[2,6],[5,6],[1,7],[6,7]],r:[[5,1],[2,0],[6,1],[1,0],[4,1],[3,1]]}:{g:[[2,7],[5,7],[1,6],[6,6],[3,7],[4,7]],r:[[5,1],[2,0],[6,1],[1,0],[4,1],[3,1]]};
 for(const side of ['g','r']){
  let i=0;for(const [cid,rec]of Object.entries(C.roster))if(rec.introduced&&rec.status==='active'&&rec.side===side){const p=formations[side][i++]||[side==='g'?1:6,side==='g'?7:0];spawn(s,'mech',side,p[0],p[1],cid);}
 }
 if(id===0){spawn(s,'drone','g',3,6);spawn(s,'spider','r',1,3);spawn(s,'spider','r',6,3);spawn(s,'courier','r',7,5,null,'courier');s.loot.push({id:'packet',name:'载毒数据包',carrier:'courier',side:'r',x:null,y:null,lost:false});}
 if(id===1){spawn(s,'drone','g',3,6);spawn(s,'spider','r',3,1);spawn(s,'spider','r',6,3);}
 if(id===2){spawn(s,'capsule','g',3,6,null,'capsule');s.loot.push({id:'key',name:'方舟密钥',carrier:'capsule',side:'g',x:null,y:null,lost:false});spawn(s,'drone','g',4,7);spawn(s,'spider','r',2,2);spawn(s,'spider','r',5,2);}
 if(id===3){spawn(s,'drone','g',3,6);spawn(s,'spider','r',1,2);spawn(s,'spider','r',6,2);spawn(s,'sentinel','r',4,1);}
 if(id===4){spawn(s,'core','r',4,0,null,'hive');spawn(s,'spider','r',3,1);spawn(s,'spider','r',5,2);spawn(s,'spider','r',1,3);spawn(s,'drone','g',1,7);spawn(s,'sentinel','g',6,7);if(C.flags.keyOwner==='g')spawn(s,'sentinel','g',4,6);}
 if(id!==0&&C.flags.packetOwner==='r')spawn(s,'spider','r',7,2);
 if(id!==0&&C.flags.sampleOwner==='r'&&id!==1)spawn(s,'spider','r',0,2);
 for(const side of ['g','r'])if(movers(s,side).length<2){spawn(s,side==='g'?'sentinel':'spider',side,side==='g'?1:6,side==='g'?6:1);spawn(s,side==='g'?'drone':'spider',side,side==='g'?6:1,side==='g'?6:1);}
 s.initial=s.units.filter(u=>u.char).map(u=>({char:u.char,side:u.side}));
 return s;
}
function openMission(id,withStory=true){
 runId++;busy=false;undoStack=[];showThreat=false;S=makeMission(id);selected=movers(S,C.side).find(u=>u.char)?.uid||movers(S,C.side)[0]?.uid;
 addLog(`接入 ${MISSIONS[id].location}。行动额度镜像协议启用。`,'good');
 if(id===2)addLog(`桥面坍塌倒计时：第 ${S.collapseAt} 轮末。`,'capture');
 if(id===4&&C.flags.packetOwner==='g')addLog('接驳数据已解码：西护盾终端预先归守护者控制。','good');
 checkpoint={c:clone(C),s:clone(S)};showGame();render();persist();
 if(withStory)playStory(introFor(id),()=>{render();},MISSIONS[id].name);else showTutorialToast();
}
function legalMoves(s,u,mode='move'){
 if(!u||!onBoard(u)||u.kind==='core')return[];
 const out=[],seen=new Set(),threat=mode==='threat',level=u.xp>=2;
 function add(x,y,attackAllowed=true,moveAllowed=true){
  if(blocked(s,x,y))return false;const target=unitAt(s,x,y);const k=key(x,y);
  if(threat){if(attackAllowed&&!seen.has(k)){out.push({uid:u.uid,x,y,target:target?.uid||null,capture:!!target,type:'move'});seen.add(k);}}
  else if(target){if(target.side!==u.side&&attackAllowed&&!(target.kind==='core'&&shielded(s))&&!seen.has(k)){out.push({uid:u.uid,x,y,target:target.uid,capture:true,type:'move'});seen.add(k);}}
  else if(moveAllowed&&!seen.has(k)){out.push({uid:u.uid,x,y,target:null,capture:false,type:'move'});seen.add(k);}
  return !target;
 }
 function rays(dirs,max){for(const[dx,dy]of dirs)for(let n=1;n<=max;n++){const x=u.x+dx*n,y=u.y+dy*n;if(blocked(s,x,y))break;const clear=add(x,y);if(!clear)break;}}
 function leaps(offsets){for(const[dx,dy]of offsets)add(u.x+dx,u.y+dy);}
 if(!u.char){if(u.kind==='spider')leaps(DIR8);else if(u.kind==='sentinel')rays(DIR4,2);else leaps(DIR4);return out;}
 switch(CHAR[u.char].move){
  case'queen':rays(DIR8,level?3:2);break;
  case'rook':rays(DIR4,4+(level?1:0)+(friendlyAdjacent(s,u,'lyra')?1:0));break;
  case'knight':leaps(KNIGHT);if(level)leaps(DIAG.map(([x,y])=>[2*x,2*y]));break;
  case'bishop':rays(DIAG,7);if(level)leaps(DIR4);break;
  case'camel':leaps(CAMEL);if(level)leaps(DIR4);break;
  case'engineer':for(const[dx,dy]of DIR4){add(u.x+dx,u.y+dy,false,true);add(u.x+dx*2,u.y+dy*2,true,false);if(friendlyAdjacent(s,u,'lark'))add(u.x+dx*3,u.y+dy*3,true,false);}if(level)leaps(DIAG);break;
 }
 return out;
}
function threatMap(s,side){const map=new Map();for(const u of movers(s,side))for(const m of legalMoves(s,u,'threat')){const k=key(m.x,m.y);map.set(k,(map.get(k)||0)+1);}return map;}
function imminentHazard(s){
 if(s.mid===1&&s.round>=s.ventStart&&(s.round-s.ventStart)%3===0){const row=((s.round-s.ventStart)/3)%2===0?3:4;return Array.from({length:8},(_,x)=>key(x,row)).filter(k=>!s.walls.includes(k));}
 if(s.mid===2&&!s.collapsed&&s.round===s.collapseAt){const arr=[];for(let y=2;y<=5;y++)for(const x of[2,5])arr.push(key(x,y));return arr;}
 return[];
}
function applyBasic(s,m){
 const u=s.units.find(v=>v.uid===m.uid&&onBoard(v));if(!u)return null;
 const ev={unit:u.uid,name:nameOf(u),side:u.side,from:{x:u.x,y:u.y},to:{x:m.x,y:m.y},type:m.type,converted:null,killed:null,escaped:false,relay:false,loot:[],upgraded:false};
 u.used=true;s.counts[u.side]++;
 if(m.type==='wait')return ev;
 const target=unitAt(s,m.x,m.y),oldX=u.x,oldY=u.y;
 if(target&&target.side!==u.side){
  if(target.char){
   ev.converted={char:target.char,uid:target.uid,name:nameOf(target),from:target.side,to:u.side};target.side=u.side;target.x=oldX;target.y=oldY;target.used=true;target.flee=false;
   const list=u.side==='g'?s.flags.conversionsG:s.flags.conversionsR;if(!list.includes(target.char))list.push(target.char);
   for(const item of s.loot)if(item.carrier===target.uid)item.side=target.side;
  }else{
   ev.killed={uid:target.uid,kind:target.kind,name:nameOf(target)};target.dead=true;
   for(const item of s.loot)if(item.carrier===target.uid){item.carrier=null;item.x=m.x;item.y=m.y;item.side=null;}
  }
  const captureKey=u.uid+'>'+target.uid;
  if(u.char&&!s.captureSeen[captureKey]){const old=u.xp;u.xp++;s.captureSeen[captureKey]=true;if(old<2&&u.xp>=2)ev.upgraded=true;}
 }
 u.x=m.x;u.y=m.y;
 for(const item of s.loot)if(!item.lost&&!item.carrier&&item.x===u.x&&item.y===u.y){item.carrier=u.uid;item.x=null;item.y=null;item.side=u.side;ev.loot.push(item.name);if(u.char)u.xp++;}
 const relay=s.relays.find(r=>r.x===u.x&&r.y===u.y);if(relay&&relay.owner!==u.side){relay.owner=u.side;ev.relay=true;if(s.mid===3&&!s.flags.gatesOpen){s.flags.gatesOpen=true;s.walls=s.walls.filter(k=>!s.doors.includes(k));}}
 if(s.mid===2){const item=lootById(s,'key');if(item?.carrier===u.uid&&s.delivery.some(d=>d.x===u.x&&d.y===u.y&&d.side===u.side)){s.flags.delivered=u.side;item.side=u.side;}}
 if(s.exits.some(e=>e.x===u.x&&e.y===u.y&&e.side===u.side)){
  u.escaped=true;ev.escaped=true;
  if(u.kind==='courier'&&u.side==='r')s.flags.courierEscaped=true;
  if(u.char)u.xp++;
  for(const item of s.loot)if(item.carrier===u.uid){item.side=u.side;item.evacuated=true;}
 }
 s.lastMove={from:ev.from,to:ev.to};return ev;
}
function addLog(text,type='normal'){if(!S)return;S.logs.unshift({text,type,round:S.round});if(S.logs.length>24)S.logs.length=24;}
async function performMove(m,isPlayer){
 if(!S||S.outcome)return;const token=runId;busy=true;
 if(isPlayer)undoStack.push({s:clone(S),stats:clone(C.stats)});
 const flight=animateToken(m);const ev=applyBasic(S,m);if(!ev){busy=false;return;}
 if(isPlayer){S.spent++;C.stats.moves++;}else{S.aiDone++;C.stats.enemyMoves++;}
 const coord=m.type==='wait'?'原地固守':`${xy(ev.from.x,ev.from.y)} → ${xy(m.x,m.y)}`;
 addLog(`${ev.name} ${coord}${ev.converted?' · '+(ev.side==='g'?'解放':'感染')+ev.converted.name:ev.killed?' · 摧毁'+ev.killed.name:''}`,ev.converted?(ev.side===C.side?'good':'capture'):'normal');
 if(ev.converted){
  if(ev.side===C.side){C.stats.conversions++;if(ev.side==='g')C.stats.rescues++;}
  S.events.push(`${ev.converted.name}${ev.side==='g'?'恢复自由':'被赤巢接管'}`);
  captureEffect(ev.converted,ev.side);radioForCapture(ev);sfx('capture');
 }else if(ev.killed)sfx('hit');else sfx(m.type==='wait'?'wait':'move');
 if(ev.escaped){addLog(`${ev.name}已撤离；若为机娘，她会保留阵营与同步等级，在后续关卡重返战场。`,ev.side===C.side?'good':'capture');if(ev.unit==='courier')radio('璃雀','信使出去了。下一次接舷，来的就不会只有这一批赤蛛。');}
 if(ev.relay)addLog(`终端 ${xy(m.x,m.y)} 已归 ${SIDE_NAME[ev.side]}。`,ev.side===C.side?'good':'capture');
 if(ev.loot.length){addLog(`${ev.name}获得 ${ev.loot.join('、')}。`,'good');toast(`已取得 ${ev.loot.join('、')} · 携带者易手时，物品也会易手`);}
 if(ev.upgraded){toast(`${ev.name} · 同步 II 解锁，走法已强化`);S.events.push(`${ev.name}达到同步 II`);}
 selected=isPlayer?ev.unit:selected;render();await flight;
 if(token!==runId)return;busy=false;
 if(checkOutcome())return;
 render();if(isPlayer)persist();
}
function objectives(s,side){
 const m=[],extra=[];const rel=relayCount(s,side);const liveChar=(id,team)=>{const u=charter(s,id);return !!u&&onBoard(u)&&u.side===team;};
 if(s.mid===0){
  if(side==='g'){m.push({text:'占领 D8 中继站，切断接驳信号',done:s.relays[0].owner==='g'});extra.push({text:'解放并保有璃雀',done:liveChar('lark','g')},{text:'截获信使携带的数据包',done:lootById(s,'packet')?.side==='g'});}
  else{m.push({text:'信使抵达 H8，或累计感染两名机娘',done:s.flags.courierEscaped||s.flags.conversionsR.length>=2});extra.push({text:'额外感染一名守护者',done:s.flags.conversionsR.length>=1},{text:'保住璃雀的人格载体',done:liveChar('lark','r')});}
 }
 if(s.mid===1){
  if(side==='g'){m.push({text:`控制 B7、G7 两座冷却阀（${rel}/2）`,done:rel===2});extra.push({text:'带走温室样本，稳定输送桥',done:lootById(s,'sample')?.side==='g'},{text:'解放雾棘',done:liveChar('veil','g')});}
  else{m.push({text:'将弥砂转化为赤巢单位',done:liveChar('misa','r')},{text:'取得并保有温室样本',done:lootById(s,'sample')?.side==='r'});extra.push({text:'保住雾棘',done:liveChar('veil','r')},{text:'至少控制一座冷却阀',done:rel>0});}
 }
 if(s.mid===2){m.push({text:`将方舟密钥送到 ${side==='g'?'D8 / E8':'D1 / E1'} 交付口`,done:s.flags.delivered===side});extra.push({text:'没有机娘在本关永久损毁',done:!s.units.some(u=>u.char&&u.dead)},{text:'在桥面坍塌前完成交付',done:s.flags.delivered===side&&!s.collapsed});}
 if(s.mid===3){m.push({text:`${side==='g'?'解放':'保有'}朔夜`,done:liveChar('noct',side)},{text:`控制 B5、G5 两座镜像终端（${rel}/2）`,done:rel===2});extra.push({text:'本阵营至少保有四名机娘',done:s.units.filter(u=>u.char&&!u.dead&&u.side===side).length>=4},{text:'打开中央电磁门',done:s.flags.gatesOpen});}
 if(s.mid===4){
  const core=s.units.find(u=>u.kind==='core');
  if(side==='g'){m.push({text:`控制 B6、G6，关闭核心护盾（${rel}/2）`,done:rel===2},{text:'吃掉 E8 赤巢内核',done:!!core?.dead});}
  else m.push({text:'核心存活至第 9 轮结束，或消灭全部守护单位',done:!!s.flags.survived||movers(s,'g').length===0});
  extra.push({text:'让至少四名机娘保有本阵营人格',done:s.units.filter(u=>u.char&&!u.dead&&u.side===side).length>=4},{text:'本关没有机娘永久损毁',done:!s.units.some(u=>u.char&&u.dead)});
 }
 return{main:m,extra};
}
function checkOutcome(){
 if(!S||S.outcome)return true;
 const goals=objectives(S,C.side);if(goals.main.length&&goals.main.every(g=>g.done)){resolveBattle(true,'主要作战目标已完成。');return true;}
 if(S.mid===2&&S.flags.delivered&&S.flags.delivered!==C.side){resolveBattle(false,'对手已将方舟密钥送离输送桥。');return true;}
 if(S.mid===2&&lootById(S,'key')?.lost){resolveBattle(false,'方舟密钥随携带者坠入裂隙，任务目标永久丢失。');return true;}
 if(S.mid===4&&C.side==='r'&&S.units.find(u=>u.kind==='core')?.dead){resolveBattle(false,'守护者突破了终端，赤巢内核已被摧毁。');return true;}
 if(S.mid===3&&charter(S,'noct')?.dead){resolveBattle(false,'朔夜的人格载体永久损毁，无法完成镜室同步。');return true;}
 if(S.mid===1&&C.side==='r'&&charter(S,'misa')?.dead){resolveBattle(false,'弥砂的人格载体在真空中损毁，感染目标失去。');return true;}
 if(movers(S,C.side).length===0){resolveBattle(false,'所有可行动单位都已被接管、撤离或摧毁，战术链路中断。');return true;}
 return false;
}
function destroyFromEnvironment(u,isVoid){
 u.dead=true;if(u.char){C.stats.losses++;S.events.push(`${nameOf(u)}永久损毁`);}
 for(const item of S.loot)if(item.carrier===u.uid){item.carrier=null;item.x=u.x;item.y=u.y;item.side=null;item.lost=isVoid;}
 addLog(`${nameOf(u)}被${isVoid?'坍塌桥面吞没':'真空泄压摧毁'}${u.char?' · 永久损毁':''}。`,'capture');
}
function resolveEnvironment(){
 const hazard=imminentHazard(S);
 if(hazard.length){for(const u of pieces(S).filter(u=>hazard.includes(key(u.x,u.y))))destroyFromEnvironment(u,S.mid===2);
  if(S.mid===2){S.voids.push(...hazard);S.collapsed=true;radio('系统','外侧桥面已永久坍塌。中央两列仍可通行。');}else radio('系统',`第 ${S.round} 轮泄压结束。下一次警戒将提前显示在棋盘上。`);
  sfx('alarm');
 }
 if(S.mid===4&&S.units.some(u=>u.kind==='core'&&!u.dead)){
  if(S.round%S.spawnEvery===0&&pieces(S,'r').filter(u=>u.kind==='spider').length<8){const slots=[[3,0],[5,0],[4,1],[2,0],[6,0],[3,1],[5,1]];const pos=slots.find(([x,y])=>!blocked(S,x,y)&&!unitAt(S,x,y));if(pos){const u=spawn(S,'spider','r',pos[0],pos[1]);u.used=true;addLog('母巢完成一次生产：新赤蛛已接入甲板。','capture');}}
  if(C.side==='r'&&S.round>=S.holdTarget)S.flags.survived=true;
  if(C.side==='r'&&C.flags.mercy&&S.round===4){spawn(S,'sentinel','g',0,6);addLog('守护者增援抵达：一台轨道哨塔加入战场。','capture');}
 }
 if(checkOutcome())return true;
 if(S.round>=S.limit){resolveBattle(false,'作战窗口耗尽。空间站已进入不可逆的轨道坠落程序。');return true;}
 return false;
}
async function endPhase(){
 if(!S||busy||S.phase!=='player'||S.outcome)return;
 if(S.spent===0){toast('至少让一个单位移动或固守，再交出阶段。');return;}
 const token=++runId;S.phase='ai';S.aiBudget=S.spent;S.aiDone=0;undoStack=[];busy=true;
 for(const u of pieces(S,enemyOf(C.side)))u.used=false;
 addLog(`你交出了 ${S.spent} 次行动；对手获得相同额度。`);render();sfx('commit');await sleep(reducedMotion?80:430);
 while(S&&S.aiDone<S.aiBudget&&!S.outcome&&token===runId){
  if(!$('modal').hidden){await sleep(140);continue;}
  if(document.hidden){await sleep(200);continue;}
  const eligible=movers(S,enemyOf(C.side)).filter(u=>!u.used);if(!eligible.length){addLog(`对手无更多可行动单位，剩余 ${S.aiBudget-S.aiDone} 次额度作废。`);break;}
  busy=true;renderStatus();await sleep(reducedMotion?30:180);if(token!==runId)return;
  const move=chooseAI(S,enemyOf(C.side));if(!move)break;
  await performMove(move,false);if(token!==runId||S.outcome)return;busy=true;await sleep(reducedMotion?40:250);
 }
 if(token!==runId||!S||S.outcome)return;
 if(resolveEnvironment())return;
 S.round++;S.phase='player';S.spent=0;S.aiDone=0;S.aiBudget=0;busy=false;
 for(const u of pieces(S,C.side))u.used=false;
 if(!selected||!S.units.some(u=>u.uid===selected&&onBoard(u)&&u.side===C.side))selected=movers(S,C.side).find(u=>u.char)?.uid||movers(S,C.side)[0]?.uid;
 if(imminentHazard(S).length)toast('环境警报：橙色闪烁格将在本轮结束时被摧毁。');
 addLog(`第 ${S.round} 轮 · ${SIDE_NAME[C.side]}行动阶段。`,'good');render();persist();
}
function undoMove(){
 if(busy||!S||S.phase!=='player'||!undoStack.length||S.outcome)return;
 const prev=undoStack.pop();S=prev.s;C.stats=prev.stats;selected=movers(S,C.side).find(u=>!u.used)?.uid||null;render();persist();toast('已撤回最近一步。敌方行动阶段开始后不能撤回。');
}
function retryMission(){
 if(!checkpoint)return;runId++;C=clone(checkpoint.c);S=clone(checkpoint.s);busy=false;undoStack=[];selected=movers(S,C.side).find(u=>u.char)?.uid||movers(S,C.side)[0]?.uid;$('result').hidden=true;closeModal();hideStory();showGame();render();persist();toast('已从本关初始部署重新接入。');
}
function syncRoster(){
 for(const u of S.units)if(u.char){const rec=C.roster[u.char];rec.side=u.side;rec.xp=u.xp;if(u.dead)rec.status='destroyed';}
 for(const item of S.loot){if(item.id==='packet')C.flags.packetOwner=item.side;if(item.id==='sample')C.flags.sampleOwner=item.lost?null:item.side;if(item.id==='key')C.flags.keyOwner=S.flags.delivered||item.side;}
}
function resolveBattle(won,reason){
 if(S.outcome)return;runId++;busy=false;S.phase='over';S.outcome={won,reason};undoStack=[];
 if(won){
  syncRoster();const goals=objectives(S,C.side);const extra=goals.extra.filter(x=>x.done).length;const live=S.units.filter(u=>u.char&&!u.dead&&u.side===C.side).length;const score=500+extra*150+live*70+Math.max(0,S.limit-S.round)*25;
  const grade=extra===goals.extra.length&&S.round<=Math.ceil(S.limit*.7)?'S':extra>0?'A':'B';
  const entry={mid:S.mid,step:C.step,round:S.round,score,grade,extra,totalExtra:goals.extra.length,live,events:[...new Set(S.events)].slice(-7),lost:S.units.filter(u=>u.char&&u.dead).map(u=>u.char),escape:S.units.filter(u=>u.char&&u.escaped).map(u=>u.char)};
  C.history.push(entry);if(S.mid===4){C.finished=true;}
 }
 render();persist();showResult();sfx(won?'victory':'alarm');
}
function advanceMission(){
 if(!S?.outcome?.won)return;
 $('result').hidden=true;
 if(S.mid===4){showHome();return;}
 if(S.mid===0&&!C.route){
  playChoice({who:C.side==='g'?'lyra':'lark',side:C.side,text:'有两条路通往镜室。先走哪一条，另一条就必须承受等待的代价。',shot:'航线图展开。两束光在核心前重新汇合。',title:'第一次分歧'},[
   {label:'先去玻璃花园',detail:'顺序：温室 → 输送桥。可先获得弥砂、雾棘与桥体稳定剂；适合救援与稳步推进。',action:()=>{C.route='garden';C.order=[0,1,2,3,4];nextMission();}},
   {label:'先截断轨天桥',detail:'顺序：输送桥 → 温室。机娘更少，护送更难；若守护者带回密钥，温室首次泄压延后一轮。',action:()=>{C.route='bridge';C.order=[0,2,1,3,4];nextMission();}}
  ]);return;
 }
 if(S.mid===3&&C.flags.mercy===null){
  playChoice({who:'noct',side:C.side,text:'你现在可以删除我，关闭人格链。也可以留下我，让我的错误和我的名字一起活下去。这一次，请让我知道你的选择。',shot:'没有倒计时。只有她的目光。',title:'名字，还是协议'},[
   {label:'保留朔夜的人格',detail:C.side==='g'?'朔夜继续参战，立即提升至同步 II；母巢每 2 轮生产。保留共存结局的可能。':'朔夜继续参战并达到同步 II；母巢每 2 轮生产，但守护者第 4 轮会增援。开启共存结局。',action:()=>{C.flags.mercy=true;C.roster.noct.xp=Math.max(2,C.roster.noct.xp);nextMission();}},
   {label:'切断人格链，送她撤离',detail:'朔夜保留记忆但退出最终战。母巢生产减慢至每 3 轮；你将失去她独特的跃迁走法。',action:()=>{C.flags.mercy=false;C.roster.noct.status='retired';nextMission();}}
  ]);return;
 }
 nextMission();
}
function nextMission(){hideStory();C.step++;openMission(C.order[C.step],true);}

/* Deterministic tactical AI: public information only, bounded two-ply reply search.
   Captures, conversion swaps, objectives, environmental danger and retreat all use
   the exact same move generator as the player. No hidden action or stat bonus. */
function distance(a,b){return Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));}
function bestDistance(units,target){return units.length?Math.min(...units.map(u=>distance(u,target))):9;}
function goalPositionScore(s,side){
 let score=0;const own=movers(s,side),opp=movers(s,enemyOf(side));
 for(const u of s.units){const mult=u.side===side?1:-1;if(!u.dead)score+=valueOf(u)*(u.escaped?.57:1)*12*mult;}
 for(const r of s.relays){if(r.owner===side)score+=60;else if(r.owner===enemyOf(side))score-=42;else score-=bestDistance(own,r)*2.4;}
 const remaining=s.relays.filter(r=>r.owner!==side);for(const r of remaining)score-=bestDistance(own,r)*4;
 for(const l of s.loot){if(l.lost)continue;const carrier=s.units.find(u=>u.uid===l.carrier);if(l.side===side)score+=l.id==='key'?90:42;else if(l.side===enemyOf(side))score-=l.id==='key'?85:34;else if(l.x!==null)score-=bestDistance(own,l)*4;if(carrier&&onBoard(carrier)&&carrier.side!==side)score-=bestDistance(own,carrier)*3;}
 if(s.mid===0){
  const courier=s.units.find(u=>u.kind==='courier');if(side==='r'){if(s.flags.courierEscaped)score+=650;else if(courier&&onBoard(courier))score+=(7-distance(courier,{x:7,y:0}))*17;score+=s.flags.conversionsR.length*35;}
  else if(s.relays[0].owner==='g')score+=650;
 }
 if(s.mid===1&&side==='r'){const target=charter(s,'misa');if(target&&!target.dead){if(target.side==='r')score+=105;else score-=bestDistance(own,target)*6;}}
 if(s.mid===2){const l=lootById(s,'key'),carrier=s.units.find(u=>u.uid===l?.carrier);if(s.flags.delivered)score+=s.flags.delivered===side?1200:-1200;if(carrier&&onBoard(carrier)){const targets=s.delivery.filter(d=>d.side===carrier.side);const d=Math.min(...targets.map(p=>distance(carrier,p)));score+=(carrier.side===side?1:-1)*(120-d*22);}}
 if(s.mid===3){const n=charter(s,'noct');if(n&&!n.dead){if(n.side===side)score+=95;else score-=bestDistance(own,n)*6;}if(relayCount(s,side)===2)score+=100;}
 if(s.mid===4){const core=s.units.find(u=>u.kind==='core');if(core?.dead)score+=side==='g'?2500:-2500;else if(side==='g'&&!shielded(s))score-=bestDistance(own,core)*18;else if(side==='r'&&relayCount(s,'g')===2)score-=220;}
 if(own.length&&opp.length&&s.mid!==2){score-=Math.min(...own.flatMap(a=>opp.map(b=>distance(a,b))))*.6;}
 return score;
}
function safetyScore(s,side){
 const enemyThreat=threatMap(s,enemyOf(side)),ownThreat=threatMap(s,side),hazard=imminentHazard(s);let score=0;
 for(const u of movers(s,side)){
  const k=key(u.x,u.y);if(enemyThreat.has(k)){const defended=ownThreat.has(k);score-=valueOf(u)*(defended?4.5:7.5);}
  if(hazard.includes(k))score-=valueOf(u)*32;
 }
 return score;
}
function strategicTarget(s,u){
 if(u.kind==='courier')return{x:7,y:0};
 if(u.flee)return s.exits.find(e=>e.side===u.side);
 if(s.mid===2){const l=lootById(s,'key');const carrier=s.units.find(v=>v.uid===l?.carrier&&onBoard(v));if(carrier?.uid===u.uid){const gates=s.delivery.filter(g=>g.side===u.side);return gates.sort((a,b)=>distance(u,a)-distance(u,b))[0];}if(carrier)return carrier;if(l&&!l.lost&&l.x!==null)return l;}
 if(s.mid===1&&u.side==='r'){const m=charter(s,'misa');const sample=lootById(s,'sample');if(sample&&!sample.carrier&&!sample.lost)return sample;if(m&&onBoard(m)&&m.side!==u.side)return m;}
 if(s.mid===3){const n=charter(s,'noct');if(n&&onBoard(n)&&n.side!==u.side&&distance(u,n)<4)return n;}
 const pending=s.relays.filter(r=>r.owner!==u.side);
 if(pending.length&&!(s.mid===0&&u.side==='r'))return [...pending].sort((a,b)=>distance(u,a)-distance(u,b))[0];
 if(s.mid===4&&u.side==='g')return s.units.find(v=>v.kind==='core'&&onBoard(v));
 return movers(s,enemyOf(u.side)).sort((a,b)=>distance(u,a)-distance(u,b))[0]||null;
}
function computeRetreat(s,side){
 const own=movers(s,side),opp=movers(s,enemyOf(side)),power=own.reduce((a,u)=>a+valueOf(u),0),foe=opp.reduce((a,u)=>a+valueOf(u),0),danger=threatMap(s,enemyOf(side));
 for(const u of own){if(u.kind==='courier'){u.flee=true;continue;}const essential=(s.mid===3&&u.char==='noct')||(s.mid===1&&u.char==='misa')||s.loot.some(l=>l.carrier===u.uid&&l.id==='key');u.flee=!!u.char&&!essential&&s.mid!==4&&power<foe*.62&&danger.has(key(u.x,u.y));}
}
function chooseAI(s,side){
 computeRetreat(s,side);const eligible=movers(s,side).filter(u=>!u.used);let candidates=[];
 for(const u of eligible){const moves=legalMoves(s,u);moves.push({uid:u.uid,x:u.x,y:u.y,type:'wait',capture:false});const target=strategicTarget(s,u);
  for(const m of moves){const next=clone(s);const ev=applyBasic(next,m);const moved=next.units.find(v=>v.uid===u.uid);let bonus=0;
   if(target)bonus+=(distance(u,target)-distance(moved,target))*(u.kind==='courier'||u.flee?14:2.7);
   if(u.flee&&ev.escaped)bonus+=valueOf(u)*25;
   if(m.type==='wait')bonus-=2;
   if(ev.relay)bonus+=8;
   if(m.capture)bonus+=1.5;
   const quick=goalPositionScore(next,side)+safetyScore(next,side)*.7+bonus;
   candidates.push({m,next,quick,bonus});
  }
 }
 if(!candidates.length)return null;
 candidates.sort((a,b)=>b.quick-a.quick);candidates=candidates.slice(0,12);
 for(const cand of candidates){
  const opponent=enemyOf(side);let replies=[];
  for(const u of movers(cand.next,opponent))for(const m of legalMoves(cand.next,u))if(m.capture){const target=unitAt(cand.next,m.x,m.y);replies.push({m,gain:target?valueOf(target)*(target.char?2:1):0});}
  replies.sort((a,b)=>b.gain-a.gain);let worst=goalPositionScore(cand.next,side);
  for(const reply of replies.slice(0,7)){const after=clone(cand.next);applyBasic(after,reply.m);worst=Math.min(worst,goalPositionScore(after,side)+safetyScore(after,side)*.35);}
  cand.score=cand.quick*.6+worst*.4+cand.bonus*.2;
 }
 candidates.sort((a,b)=>b.score-a.score);return candidates[0].m;
}
function intentFor(u){
 if(u.kind==='core')return`生产周期 ${S.spawnEvery} 轮 · ${shielded(S)?'护盾在线':'护盾已关闭'}`;
 if(u.kind==='courier')return'优先撤往 H8；会选择危险较低的路线。';
 if(u.flee)return'战术撤离：敌我力量悬殊，正试图保存人格载体。';
 const t=strategicTarget(S,u);if(t)return`当前倾向：${t.uid?'接近 '+nameOf(t):'争夺 '+xy(t.x,t.y)}。行动时会重新评估反击风险。`;
 return'维持阵型，寻找可夺控目标。';
}
