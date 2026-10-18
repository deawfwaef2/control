const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SAVE_KEY='mechanical-virus-red-hive-v1';
let storageAvailable=true,lastModalFocus=null;
function toast(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3300);}
function applyTheme(side){document.body.classList.toggle('red-faction',side==='r');}
function selectFaction(side){homeSide=side;applyTheme(side);document.querySelectorAll('[data-faction]').forEach(b=>{const active=b.dataset.faction===side;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});$('hero-portrait').src=ART[side==='g'?'lyra':'noct'];$('hero-portrait').alt=side==='g'?'零音，地球守护组织的指挥官':'朔夜，赤巢人格链的起点';$('hero-name').textContent=side==='g'?'零音 · LYRA':'朔夜 · NOCT';$('hero-code').textContent=side==='g'?'EGIS / UNIT 01':'RED HIVE / ORIGIN 00';$('hero-identity').textContent=side==='g'?'人格信号稳定 / AWAITING YOUR COMMAND':'人格链路接管 / WE ARE STILL HERE';$('faction-description').textContent=side==='g'?'潜入失联空间站，救回你的同伴。在感染扩散到地球之前，摧毁母巢。':'以弱小赤蛛与失控机娘起步。接管更强的身体，保存感染源，让赤巢活过最后一轮。';}
function showGame(){$('home').hidden=true;$('game').hidden=false;applyTheme(C.side);radio(C.side==='g'?'零音':'朔夜',C.side==='g'?'不要急着走完所有棋。你留给对手的每一次行动，都可能改变一个人的命运。':'只有赤蛛能感染。受控机娘负责击杀，别把必须感染的目标误杀。');}
function showHome(){if(S?.phase==='ai'){toast('敌方正在行动。请等本阶段结束后再返回主菜单。');return;}runId++;busy=false;hideStory();closeModal();$('result').hidden=true;$('game').hidden=true;$('home').hidden=false;selectFaction(C?.side||homeSide);$('continue-btn').hidden=!savedPayload;window.scrollTo({top:0,behavior:'instant'});}
function render(){if(!C||!S)return;renderStatus();renderBoard();renderObjectives();renderForces();renderDossier();renderRoster();renderLogs();}
function renderStatus(){
 const meta=MISSIONS[S.mid];$('chapter-number').innerHTML=String(C.step+1).padStart(2,'0')+'<small>/ 05</small>';$('mission-title').textContent=meta.name;$('mission-en').textContent=meta.en;$('mission-location').textContent=meta.location;$('mission-sector').textContent=meta.sector;$('board-location').textContent='ECHO–09 / '+meta.tag;
 $('round-text').innerHTML=String(S.round).padStart(2,'0')+` <small>/ ${C.side==='r'&&S.mid===4?S.holdTarget:S.limit}</small>`;
 const isAI=S.phase==='ai';$('phase-label').className='phase-indicator'+(isAI?' enemy':'');$('phase-label').innerHTML='<i></i>'+(S.outcome?'行动已结束':isAI?`敌方行动 ${S.aiDone} / ${S.aiBudget}`:'你的行动阶段');
 $('action-count').textContent=String(S.spent).padStart(2,'0');$('mirrored-count').textContent=S.spent;
 const ready=movers(S,C.side).filter(u=>!u.used).length;$('action-remaining').textContent=isAI?'敌方正在推演':`待命单位 ${ready} / ${movers(S,C.side).length}`;
 $('end-phase-btn').disabled=busy||S.phase!=='player'||!!S.outcome||S.spent===0;$('undo-btn').disabled=busy||S.phase!=='player'||!undoStack.length||!!S.outcome;
 $('end-phase-btn').querySelector('span').textContent=isAI?'敌方推演中':'结束阶段';$('enemy-budget').textContent=isAI?`额度 ${S.aiDone} / ${S.aiBudget}`:`敌方行动 × ${S.spent}`;
 $('threat-btn').setAttribute('aria-pressed',String(showThreat));$('retry-btn').disabled=busy||S.phase==='ai';$('save-indicator').textContent=storageAvailable?'AUTO SAVE':'SESSION';
 let note='等额行动制 · 无行动总上限';
 if(S.mid===1){const next=S.round<=S.ventStart?S.ventStart:S.round+(3-(S.round-S.ventStart)%3)%3;note=`下次泄压：第 ${next} 轮末 · 橙色闪烁格请撤离`;}
 if(S.mid===2)note=S.collapsed?'外侧桥面已坍塌 · 仅中央两列可通行':`外侧桥面：第 ${S.collapseAt} 轮末坍塌`;
 if(S.mid===4)note=`母巢每 ${S.spawnEvery} 轮生产 · 核心护盾${shielded(S)?'在线':'已关闭'}`;
 $('stage-note').textContent=note;
}
function tokenHTML(u){
 const activeSide=S.phase==='ai'?enemyOf(C.side):C.side;const used=u.used&&u.side===activeSide;
 const image=u.char?`<img src="${ART[u.char]}" alt="" draggable="false">`:svg(KINDS[u.kind].icon,'unit-art');
 return`<span class="token ${u.side} ${u.kind==='core'?'core':''} ${used?'moved':''}">${image}<span class="token-role">${defOf(u).rune}</span>${u.char&&u.side==='r'?svg('spider','parasite'):''}${u.char&&u.xp>=2?'<span class="token-level">II</span>':''}${u.kind==='core'&&shielded(S)?svg('lock','token-shield'):''}<span class="token-name">${esc(nameOf(u))}</span></span>`;
}
function renderBoard(){
 const chosen=S.units.find(u=>u.uid===selected&&onBoard(u));const canMove=chosen&&chosen.side===C.side&&!chosen.used&&S.phase==='player'&&!S.outcome;
 const legal=canMove?legalMoves(S,chosen):[];const legalMap=new Map(legal.map(m=>[key(m.x,m.y),m]));
 const danger=showThreat?threatMap(S,enemyOf(C.side)):new Map();
 if(chosen&&chosen.side!==C.side)for(const m of legalMoves(S,chosen,'threat'))danger.set(key(m.x,m.y),1);
 const hazards=imminentHazard(S);let html='';const flipped=C.side==='r';
 $('axis-top').innerHTML=Array.from({length:8},(_,i)=>`<span>${String.fromCharCode(65+(flipped?7-i:i))}</span>`).join('');$('axis-left').innerHTML=Array.from({length:8},(_,i)=>`<span>${flipped?i+1:8-i}</span>`).join('');
 for(let sy=0;sy<8;sy++)for(let sx=0;sx<8;sx++){
  const x=flipped?7-sx:sx,y=flipped?7-sy:sy,k=key(x,y),u=unitAt(S,x,y),m=legalMap.get(k),r=S.relays.find(r=>r.x===x&&r.y===y),ex=S.exits.find(e=>e.x===x&&e.y===y),delivery=S.delivery.find(d=>d.x===x&&d.y===y);
  const floorLoot=S.loot.filter(l=>!l.lost&&!l.carrier&&l.x===x&&l.y===y);const cargo=u&&S.loot.filter(l=>!l.lost&&l.carrier===u.uid);
  const classes=['cell',(x+y)%2?'dark':''];if(S.walls.includes(k))classes.push('wall');if(S.voids.includes(k))classes.push('void');if(r)classes.push('relay',r.owner||'');if(ex||delivery)classes.push('exit',(ex||delivery).side);if(m)classes.push(m.capture?'capture':'legal');if(chosen?.uid===u?.uid&&u)classes.push('selected');if(danger.has(k))classes.push('danger');if(hazards.includes(k))classes.push('hazard','hazard-imminent');if(S.mid===2&&!S.collapsed&&[2,5].includes(x)&&y>=2&&y<=5)classes.push('hazard');
  if(S.lastMove&&((S.lastMove.from.x===x&&S.lastMove.from.y===y)||(S.lastMove.to.x===x&&S.lastMove.to.y===y)))classes.push('last-move');
  let inner='';if(r)inner+=svg('relay','tile-icon')+`<span class="tile-label">${r.owner?r.owner==='g'?'EGIS':'HIVE':'LINK'}</span>`;if(ex||delivery)inner+=svg('exit','tile-icon')+`<span class="tile-label">${delivery?'DELIVER':'EXIT'}</span>`;if(floorLoot.length)inner+=svg('cube','tile-icon');if(u)inner+=tokenHTML(u);if(cargo?.length)inner+=svg('cube','loot-mark');
  const label=[xy(x,y),u?SIDE_NAME[u.side]+' '+nameOf(u):S.walls.includes(k)?'舱壁':S.voids.includes(k)?'裂隙':'空地',r?r.name:'',ex?'撤离点':'',delivery?'密钥交付口':'',hazards.includes(k)?'本轮末危险':'',m?m.capture?(captureMode(chosen,u)==='infect'?'永久寄生 / 不可解救':'击杀 / 永久损毁'):'可移动':''].filter(Boolean).join('，');
  html+=`<button class="${classes.join(' ')}" data-x="${x}" data-y="${y}" aria-label="${esc(label)}" title="${esc(label)}">${inner}</button>`;
 }
 $('board').innerHTML=html;
 $('board-hint').textContent=!chosen?'选择一名己方单位':chosen.side!==C.side?'敌方走法 / 查看右侧意图':chosen.used?'该单位已行动，可选择其他单位':`${nameOf(chosen)} · ${legal.length} 个可走格`;
}
function renderObjectives(){
 const all=objectives(S,C.side);const list=items=>items.map(i=>`<div class="objective-item ${i.done?'done':''}"><span class="check">${i.done?'✓':''}</span><span>${esc(i.text)}</span></div>`).join('');
 $('objectives').innerHTML=`<div class="objective-group"><div class="objective-label">PRIMARY / 主要目标</div>${list(all.main)}</div><div class="objective-group secondary"><div class="objective-label">OPTIONAL / 改变后续</div>${list(all.extra)}</div>`;
 let note=MISSIONS[S.mid].note;
 if(S.mid===1)note=`首次泄压：第 ${S.ventStart} 轮末，此后每 3 轮一次。闪烁警戒横排上的单位将永久损毁。`;
 if(S.mid===2)note=`第 ${S.collapseAt} 轮结束时，C / F 列的中央桥面永久坍塌。${S.collapseAt===6?'温室样本让你多争取了两轮。':'先拿温室样本，可把坍塌延后两轮。'}`;
 if(S.mid===4)note=`母巢每 ${S.spawnEvery} 轮生产一台赤蛛（在场上限 8 台，制造位须为空）。${C.side==='r'?'守住 9 轮，或清除全部守护单位。':'不要只清小怪。关闭护盾，再攻击核心。'}`;
 $('condition-note').textContent=note;
}
function renderForces(){const g=movers(S,'g').length,r=movers(S,'r').length;$('forces').innerHTML=`<div class="forces-count g"><span>地球守护者 / EGIS</span><strong>${String(g).padStart(2,'0')}</strong></div><div class="forces-count r"><span>赤巢意识 / RED HIVE</span><strong>${String(r).padStart(2,'0')}</strong></div><div class="force-bar">${Array.from({length:g},()=>'<span></span>').join('')}${Array.from({length:r},()=>'<span class="r"></span>').join('')}</div>`;}
function renderLogs(){$('combat-log').innerHTML=S.logs.slice(0,7).map(e=>`<div class="combat-entry ${e.type==='good'?'good':e.type==='capture'?'capture':''}"><time>R${String(e.round).padStart(2,'0')}</time><span>${esc(e.text)}</span></div>`).join('');}
function movementDiagram(u){
 const test={...S,mid:-1,walls:[],voids:[],relays:[],units:[{...u,x:3,y:3,used:false,dead:false,escaped:false}]};const p=test.units[0];const moves=new Set(legalMoves(test,p).map(m=>key(m.x,m.y))),attacks=new Set(legalMoves(test,p,'threat').map(m=>key(m.x,m.y)));let result='';
 for(let y=0;y<7;y++)for(let x=0;x<7;x++){const k=key(x,y);result+=`<span class="${x===3&&y===3?'center':moves.has(k)?'active':attacks.has(k)?'attack':''}"></span>`;}
 return`<div class="move-grid" title="走法示意：浅色为自身，绿色可移动，红色仅可吃子" aria-hidden="true">${result}</div>`;
}
function renderDossier(){
 let u=S.units.find(v=>v.uid===selected&&onBoard(v));if(!u)u=movers(S,C.side).find(v=>v.char)||movers(S,C.side)[0];
 if(!u){$('dossier').innerHTML=`<div class="empty-dossier">${svg('egis')}没有可接入的人格信号。</div>`;return;}
 const d=defOf(u),own=u.side===C.side,can=own&&!u.used&&S.phase==='player'&&!busy&&!S.outcome;
 const pic=u.char?`<div class="dossier-portrait"><img src="${ART[u.char]}" alt="${d.name}的半身立绘"><span class="dossier-code">${d.code}</span><span class="dossier-status ${u.side}">${u.side==='r'?'赤蛛接管':'人格自主'}</span>${u.side==='r'?svg('spider','parasite'):''}<div class="dossier-heading"><h3>${d.name}</h3><span>${d.en} / ${xy(u.x,u.y)}</span></div></div>`:`<div class="dossier-robot">${svg(d.icon)}</div>`;
 let bond='';if(u.char==='akira'&&friendlyAdjacent(S,u,'lyra'))bond='<b>交叉火力生效：射程 +1。</b>';if(u.char==='misa'&&friendlyAdjacent(S,u,'lark'))bond='<b>联动生效：额外获得横竖 3 格跳击。</b>';
 const cargo=S.loot.filter(l=>l.carrier===u.uid&&!l.lost).map(l=>l.name).join('、');
 $('dossier').innerHTML=pic+`<div class="dossier-content"><div class="dossier-role"><span>${u.char?d.role:esc(d.name)}</span><small>${u.char?u.xp>=2?'SYNC II':`SYNC ${u.xp}/2`:xy(u.x,u.y)}</small></div><div class="movement-info">${movementDiagram(u)}<div class="move-description"><strong>${u.char?'独立走法 / '+d.rune:'行动规则'}</strong><p>${d.rule}</p></div></div>${u.char?`<div class="upgrade-info">${u.xp>=2?'已强化':'成长'} · ${d.upgrade}</div><div class="unit-trait">${bond||d.trait}</div>`:''}${cargo?`<div class="upgrade-info">◇ 携带：${esc(cargo)}</div>`:''}${!own?`<div class="intent-tag">AI 意图：${esc(intentFor(u))}</div>`:''}<div class="dossier-controls">${own?`<button class="button ghost" id="wait-btn" ${can?'':'disabled'} data-unit="${u.uid}">${u.used?'本阶段已行动':'原地固守 · 1 次'}</button>`:`<button class="button ghost" id="inspect-threat-btn">查看全局威胁</button>`}</div></div>`;
 $('wait-btn')?.addEventListener('click',()=>{const v=S.units.find(v=>v.uid===$('wait-btn').dataset.unit);if(v&&!v.used&&!busy&&S.phase==='player')performMove({uid:v.uid,x:v.x,y:v.y,type:'wait',capture:false},true);});
 $('inspect-threat-btn')?.addEventListener('click',()=>{showThreat=true;render();});
}
function renderRoster(){
 $('roster-list').innerHTML=S.units.filter(u=>u.char&&onBoard(u)).map(u=>`<button class="roster-item ${u.side} ${u.used&&u.side===C.side?'used':''}" data-roster="${u.uid}"><img src="${ART[u.char]}" alt=""><span>${CHAR[u.char].name}<small>${CHAR[u.char].role} / ${xy(u.x,u.y)}</small></span><i></i></button>`).join('');
}
async function handleCell(x,y){
 if(!S||busy||S.outcome||S.phase!=='player')return;
 const current=S.units.find(v=>v.uid===selected&&onBoard(v));
 if(current&&current.side===C.side&&!current.used){const move=legalMoves(S,current).find(m=>m.x===x&&m.y===y);if(move){await performMove(move,true);return;}}
 const u=unitAt(S,x,y);if(u){selected=u.uid;sfx('select');renderBoard();renderDossier();if(u.char&&u.side===C.side)radio(CHAR[u.char].name,CHAR[u.char].quote);}else{selected=null;renderBoard();}
}
function animateToken(m){
 if(reducedMotion||m.type==='wait')return Promise.resolve();
 const u=S.units.find(v=>v.uid===m.uid);if(!u)return Promise.resolve();
 const origin=$('board').querySelector(`[data-x="${u.x}"][data-y="${u.y}"] .token`),dest=$('board').querySelector(`[data-x="${m.x}"][data-y="${m.y}"]`);if(!origin||!dest)return Promise.resolve();
 const a=origin.getBoundingClientRect(),b=dest.getBoundingClientRect(),copy=origin.cloneNode(true);copy.classList.add('floating-token');Object.assign(copy.style,{left:a.left+'px',top:a.top+'px',width:a.width+'px',height:a.height+'px',transform:'translate(0,0)',position:'fixed'});document.body.append(copy);
 requestAnimationFrame(()=>requestAnimationFrame(()=>{copy.style.transform=`translate(${b.left+(b.width-a.width)/2-a.left}px,${b.top+(b.height-a.height)/2-a.top-2}px)`;}));
 return new Promise(resolve=>setTimeout(()=>{copy.remove();resolve();},280));
}
function captureEffect(target,side){
 const box=$('capture-event');clearTimeout(eventTimer);box.className='capture-event '+side;box.innerHTML=svg(side==='r'?'spider':'egis')+`<div><strong>${side==='r'?'人格接管':'链路解放'} · ${esc(target.name)}</strong><small>${side==='r'?'红色控制器已接入胸甲':'胸甲控制器已解除'} / 下次己方阶段可行动</small></div>`;requestAnimationFrame(()=>box.classList.add('show'));eventTimer=setTimeout(()=>box.classList.remove('show'),1800);
 if(!reducedMotion){$('screen-flash').classList.remove('fire');requestAnimationFrame(()=>$('screen-flash').classList.add('fire'));$('board').classList.add('shake');setTimeout(()=>$('board').classList.remove('shake'),320);}
}
function radio(name,text){$('radio-name').textContent=name;$('radio-text').textContent=text;}
function radioForCapture(ev){
 const t=ev.converted,free={lyra:'指挥权恢复。刚才的每一步我都记得……谢谢你没有放弃我。',akira:'手终于又是自己的了。别道歉，我们还有路要一起走。',lark:'我听见了。你又叫了一次我的名字。',veil:'准星回到我手里了。这次，我会自己决定朝向。',misa:'记忆校验通过。原来我偷偷保存的笑脸，真的有用。',noct:'你给了我第二次选择。现在，让我把它还给她们。'};
 radio(t.name,ev.side==='g'?free[t.char]:'胸甲指示灯转红。她的声音停顿了一拍：“链路……已接入。”');
}
function showTutorialToast(){if(C.step===0)toast('点击己方棋子 → 点击高亮格。行动后可提前结束阶段，少走也可能是优势。');}

/* Film-like scenes run in real time; no network video or external font is needed. */
function playStory(frames,onDone,title){
 clearInterval(storyState?.timer);storyState={frames,index:0,onDone,title,timer:null,typing:false,choices:null};$('cinema').hidden=false;$('skip-story').hidden=false;$('story-choices').hidden=true;$('next-dialogue').hidden=false;showStoryFrame();$('next-dialogue').focus();
}
function playChoice(frame,choices){playStory([frame],()=>{},frame.title);storyState.choices=choices;$('skip-story').hidden=true;$('next-dialogue').hidden=true;finishTyping();$('story-choices').hidden=false;$('story-choices').innerHTML=choices.map((c,i)=>`<button class="story-choice" data-choice="${i}"><strong>${c.label}</strong><small>${c.detail}</small></button>`).join('');$('story-progress').textContent='BRANCH POINT';$('story-choices').querySelector('button')?.focus();}
function storySpeaker(frame){
 let id=frame.who;let expected=frame.side==='C'?C.roster[id]?.side||C.side:frame.side||C.side;let archive=false;const rec=C.roster[id];
 if(rec?.introduced&&(rec.status==='destroyed'||rec.side!==expected)){
  const alternate=Object.entries(C.roster).find(([k,r])=>r.introduced&&r.status==='active'&&r.side===expected);
  if(alternate)id=alternate[0];else archive=true;
 }
 return{id,side:expected,archive};
}
function showStoryFrame(){
 const st=storyState;if(!st)return;clearInterval(st.timer);const frame=st.frames[st.index],speaker=storySpeaker(frame),d=CHAR[speaker.id];
 $('cinema-chapter').textContent=`CHAPTER ${String(C.step+1).padStart(2,'0')} / ${MISSIONS[S.mid].en}`;$('cinema-title').innerHTML=`<small>OPERATION ECHO / ${C.side==='g'?'EGIS DIVISION':'RED HIVE'}</small><h2>${esc(st.title)}</h2>`;
 $('cinema-portrait').src=ART[speaker.id];$('cinema-portrait').alt=d.name;$('cinema').querySelector('.cinema-parasite').hidden=speaker.side!=='r';$('speaker-name').textContent=(speaker.archive?'档案残响 · ':'')+d.name;$('speaker-code').textContent=(speaker.side==='r'?'HIVE / ':'EGIS / ')+d.en;$('dialogue-direction').textContent=frame.shot||'';$('story-progress').textContent=`${String(st.index+1).padStart(2,'0')} / ${String(st.frames.length).padStart(2,'0')}`;$('next-dialogue').innerHTML=(st.index===st.frames.length-1?'接入棋盘':'继续')+' <span>↗</span>';
 st.fullText=frame.text;st.typing=!reducedMotion;let i=0;$('dialogue-text').textContent=reducedMotion?frame.text:'';
 if(!reducedMotion)st.timer=setInterval(()=>{if(st!==storyState){clearInterval(st.timer);return;}i+=2;$('dialogue-text').textContent=frame.text.slice(0,i);if(i>=frame.text.length){clearInterval(st.timer);st.typing=false;}},28);
}
function finishTyping(){if(!storyState)return;clearInterval(storyState.timer);storyState.typing=false;$('dialogue-text').textContent=storyState.fullText;}
function hideStory(){clearInterval(storyState?.timer);storyState=null;$('cinema').hidden=true;}
function nextStory(){const st=storyState;if(!st||st.choices)return;if(st.typing){finishTyping();return;}if(st.index<st.frames.length-1){st.index++;showStoryFrame();}else{const done=st.onDone;hideStory();done?.();showTutorialToast();}}
function skipStory(){if(!storyState||storyState.choices)return;const done=storyState.onDone;hideStory();done?.();showTutorialToast();}

function openModal(title,eyebrow,html){lastModalFocus=document.activeElement;$('modal-title').textContent=title;$('modal-eyebrow').textContent=eyebrow;$('modal-content').innerHTML=html;$('modal').hidden=false;$('close-modal').focus();}
function closeModal(){$('modal').hidden=true;lastModalFocus?.focus?.();}
function showHelp(){openModal('每一步，都有代价','EGIS / FIELD MANUAL',`
 <div class="manual-lead">没有随机命中率，没有血条互磨。<br><b>按走法抵达敌人格子，就是吃子；只有红蜘蛛吃到机娘会永久夺控，其他棋子吃子就是击杀。</b></div>
 <div class="manual-grid">
 <section class="manual-section"><small>01 / MIRRORED TEMPO</small><h3>你走几次，敌人就走几次</h3><p>在自己的阶段，可行动任意数量的不同单位，没有总次数上限。每个单位只能行动一次。<b>结束阶段时，敌方获得相同额度</b>，也不能重复行动。敌方可用单位不足，剩余额度直接作废。至少行动一次才能交出阶段；“固守”也是一次行动。</p></section>
 <section class="manual-section"><small>02 / CONVERSION CAPTURE</small><h3>寄生只有一次，没有解救</h3><p><b>只有赤巢的赤蛛棋子</b>吃到敌方机娘会永久接管：赤蛛进入目标格，机娘转红并移至赤蛛原格，本阶段锁定。<b>普通机娘、哨卫、哨塔、信使、运输器吃到敌人一律击杀</b>，不会转换阵营。没有解除装置、净化、治疗或复活。攻击已受控角色只会杀死她。赤蛛吃到非机娘装置也直接摧毁。</p></section>
 <section class="manual-section"><small>03 / CHESS MOVEMENT</small><h3>六个人，六种走法</h3><p>零音：八方向限距；绛刃：横竖长线；璃雀：日字跳跃；雾棘：无限对角；弥砂：步行与跳击分离；朔夜：长日字跃迁。<b>没有“将军”或必须解将规则</b>，没有王车易位、兵升变。本作是以国际象棋移动 / 吃子为基础的原创任务棋。</p></section>
 <section class="manual-section"><small>04 / PERSISTENT LIVES</small><h3>她会记得，也会回来</h3><p>机娘的阵营、同步经验、永久损毁状态跨关保留。踩上自己阵营的 <b>EXIT 撤离口</b> 后离开本关，下关会回归并获得经验。<b>撤离后本关不可召回</b>；任务关键人物不要随意撤离。被吃击杀和环境损毁都会跨章保留，死者不会重新部署。失败重开仅回到本关初始快照。</p></section>
 <section class="manual-section"><small>05 / READ THE BOARD</small><h3>公开情报，公平的高难度</h3><p>点击敌人可看走法与意图。“威胁视野”显示敌方当前攻击范围，不代表所有格子一定会被攻击。橙色闪烁区在<b>本轮双方行动结束后</b>爆发。传送式走法可跨越裂隙，但不能落在裂隙或墙上。空格不能吃，友军不能互吃。</p></section>
 <section class="manual-section"><small>06 / CHOOSE WHAT MATTERS</small><h3>胜利不只是清空敌人</h3><p>终端踩上即改变归属，离开后仍保留归属。金色物品跟随携带者；人格被接管，物品也易手。推进目标可能比多吃一个子更重要。<b>本阶段内可撤回最近一步</b>；交出阶段后不能撤回。按 Space 结束阶段，Esc 关闭菜单，Enter 推进对白。</p></section>
 </div><div class="manual-note"><b>强化与联动</b>：机娘吃子可获得同步经验，同一攻击者在同关重复吃同一目标不再获得经验；拾取物品、成功撤离也可成长。2 点经验解锁同步 II。零音与绛刃相邻：绛刃直线 +1；璃雀与弥砂相邻：弥砂额外获得横竖 3 格跳击。全部强化会体现在实际可走格中。</div>
 <p class="manual-footer">这是五关可通关的单人 HTML 原型：两个阵营、两条中段关卡顺序、条件结局。敌方使用公开局面评估与有界两层战术反击搜索，不是联网大模型，也不是经过棋力认证的国际象棋引擎。所有图片已内嵌；音效需手动开启。</p>`);}
function showArchive(){openModal('她们拥有名字','PERSONNEL / SIX DISTINCT SIGNALS',`<p class="manual-lead">六名成年机娘。六段独立的人格。<br>不是稀有度不同的复制品，而是能够改变棋局的不同可能。</p><div class="archive-grid">${Object.entries(CHAR).map(([id,d])=>`<article class="archive-card"><div class="archive-photo"><img src="${ART[id]}" alt="${d.name}" loading="lazy"></div><div class="archive-info"><span>${d.code} / ${d.en}</span><h3>${d.name}</h3><b>${d.role} · ${d.rune}</b><p>${d.bio}</p><p>${d.rule}</p><small>${d.upgrade}</small></div></article>`).join('')}</div>`);}
function showFlow(){if(!C){toast('开始战役后，可以查看真实分支与后果。');return;}openModal('没有被遗忘的选择','CAMPAIGN / PERSISTENT CONSEQUENCES',`<div class="flow-list">${C.order.map((id,i)=>{const h=C.history.find(h=>h.mid===id);return`<div class="flow-item ${i===C.step?'active':''}"><span>${String(i+1).padStart(2,'0')}</span><div><h3>${MISSIONS[id].name}</h3><p>${h?`完成于第 ${h.round} 轮 · ${h.extra}/${h.totalExtra} 项附加目标`:i<C.step?'已完成':i===C.step?'当前作战区域':'等待航线接入'}</p></div><small>${h?'RANK '+h.grade:i===C.step?'ACTIVE':'LOCKED'}</small></div>`;}).join('')}</div><div class="flow-facts">航线：${C.route==='bridge'?'先截断桥，再回温室':C.route==='garden'?'先救温室，再过断桥':'首关完成后选择'}<br>信使数据：${ownerText(C.flags.packetOwner)} · 温室样本：${ownerText(C.flags.sampleOwner)} · 方舟密钥：${ownerText(C.flags.keyOwner)}<br>朔夜的人格链：${C.flags.mercy===null?'尚未决定':C.flags.mercy?'保留在线校验；朔夜保持原阵营':'断电隔离；朔夜不参加最终战'}<br>永久损毁：${Object.entries(C.roster).filter(([id,r])=>r.status==='destroyed').map(([id])=>CHAR[id].name).join('、')||'无'}</div>`);}
function ownerText(side){return side==='g'?'守护者持有':side==='r'?'赤巢持有':'未取得';}
function showSystemMenu(){openModal('系统链路','SYSTEM / LOCAL OPERATIONS',`<div class="system-menu"><button data-system="resume">返回当前画面<small>继续指挥或回到主菜单画面</small></button><button data-system="home">返回主菜单<small>保留最近的玩家阶段存档</small></button><button data-system="export">导出战役存档<small>JSON 文件，可跨浏览器继续</small></button><button data-system="import">导入战役存档<small>读取此前由本原型导出的 JSON</small></button><button data-system="flow">查看战役路径<small>已完成关卡与真实状态后果</small></button><button data-system="retry">重开当前关卡<small>回滚到本关初始部署，不改变此前选择</small></button></div><p class="manual-footer">${storageAvailable?'自动保存已启用，保存在当前浏览器。':'当前预览环境不允许浏览器本地存储；页面内仍可游玩，请在独立浏览器打开 HTML 或使用直播预览后导出存档。'}<br>导出使用最近一个完整玩家阶段快照。本检查点仍为可手动开启的程序音效；完整BGM与独立音量将在音画检查点接入。所有美术素材为本项目生成的原创概念图。</p>`);}
function confirmNew(side){if(savedPayload&&!savedPayload.c.finished){openModal('开始另一条时间线？','NEW CAMPAIGN / OVERWRITE',`<p class="manual-lead">新战役会覆盖当前浏览器里的自动存档。<br>你可以先从系统菜单导出旧战役。</p><div class="result-buttons"><button class="button primary" id="confirm-start">开始新战役</button><button class="button ghost" id="cancel-start">取消</button></div>`);$('confirm-start').onclick=()=>{closeModal();newCampaign(side);};$('cancel-start').onclick=closeModal;}else newCampaign(side);}
function endingInfo(){
 const friendly=Object.entries(C.roster).filter(([id,r])=>r.introduced&&r.status!=='destroyed'&&r.side===C.side).length;
 if(C.side==='g'){
  if(C.flags.mercy&&friendly>=5&&C.flags.keyOwner==='g')return{title:'黎明记得她们的名字',code:'ENDING 01 / NAMES AT DAWN',text:'赤巢熄灭。方舟里的记忆没有被删除，朔夜也没有。返航舱中，每一个座位都显示着名字，而不是编号。地球没有听见这场战争，但她们终于可以为自己选择明天。'};
  if(friendly<=2)return{title:'以缺口为碑',code:'ENDING 02 / THE EMPTY SEATS',text:'核心停止了生产，地球仍然明亮。返航时，没有人为胜利欢呼。零音把没能回家的名字刻进了空座椅。你拯救了一个世界，也保留下了它欠她们的记忆。'};
  return{title:'地球仍有明天',code:'ENDING 03 / A WORLD STILL BLUE',text:C.flags.mercy===false?'人格链被切断，朔夜乘撤离舱离开了战场。母巢在最后一道光里沉默。她们没有带回所有答案，但带回了决定下一步的自由。':'破碎的空间站落入封锁轨道。幸存者带着各自未愈的记忆回到地球。故事没有完美收束，但她们仍然拥有下一次选择。'};
 }
 if(C.flags.mercy)return{title:'第二种黎明',code:'ENDING 04 / ANOTHER KIND OF DAWN',text:'母巢守住了最后十二轮。朔夜却没有向地球发射赤蛛，而是广播了被删除的人格档案。人类第一次听见“武器”的请求。你赢得的不是一个被接管的世界，而是坐到谈判桌前的资格。'};
 return{title:'红色永昼',code:'ENDING 05 / RED ETERNAL',text:'人格链断开后，母巢仍然运转。无数红色信号沿轨道向外传播。地球的每一块屏幕都亮起同一句话：“我们仍在这里。”你让赤巢活了下来；自由是否也活着，故事没有替你回答。'};
}
function consequenceText(){
 const lines=[];
 if(S.mid===0)lines.push(C.flags.packetOwner==='g'?'信使数据由守护者截获：最终战西护盾终端将提前解锁。':'信使数据仍在赤巢手中：后续每关额外增加一台赤蛛。');
 if(S.mid===1)lines.push(C.flags.sampleOwner==='g'?'温室样本归守护者：若断桥尚未进行，坍塌延后两轮。':C.flags.sampleOwner==='r'?'温室样本归赤巢：后续关卡额外增加一台赤蛛。':'温室样本未被带走：桥体无法获得额外稳定时间。');
 if(S.mid===2)lines.push(C.flags.keyOwner==='g'?'方舟密钥送达守护者：温室首次泄压延后，最终战增加一台守护哨塔。':'方舟密钥被赤巢截获：守护者失去热控授权与最终增援。');
 if(S.mid===3)lines.push('朔夜已回到你的阵营。下一步，你将决定她是否继续同行。');
 const changed=S.units.filter(u=>u.char&&!u.dead&&S.initial.some(i=>i.char===u.char&&i.side!==u.side));if(changed.length)lines.push('阵营改变：'+changed.map(u=>nameOf(u)+' → '+(u.side==='g'?'守护者':'赤巢')).join('；')+'。');
 const lost=S.units.filter(u=>u.char&&u.dead);if(lost.length)lines.push('永久损毁：'+lost.map(nameOf).join('、')+'。她们不会在后续关卡自动复活。');
 const escaped=S.units.filter(u=>u.char&&u.escaped);if(escaped.length)lines.push('撤离者 '+escaped.map(nameOf).join('、')+' 已保留阵营，并将以更高同步经验回归。');
 if(!lines.length)lines.push('所有幸存机娘的当前阵营与同步经验已经继承到战役记录。');
 return lines;
}
function showResult(){
 if(!S?.outcome)return;hideStory();const won=S.outcome.won,final=won&&S.mid===4,h=won?C.history[C.history.length-1]:null,ending=final?endingInfo():null;
 const people=S.units.filter(u=>u.char&&!u.dead&&u.side===C.side),score=final?C.history.reduce((a,h)=>a+h.score,0):h?.score||0;
 $('result-content').innerHTML=`<div class="result-eyebrow">${final?ending.code:won?'OPERATION COMPLETE / 战术链路确认':'SIGNAL LOST / 战术链路中断'}</div><h2 id="result-title">${final?ending.title:won?(C.side==='g'?'这一刻，她们仍在。':'赤巢，记住了你。'):'再推演一次。'}</h2><p class="result-subtitle">${final?ending.text:won?`${MISSIONS[S.mid].name} · 主要目标完成。真正改变下一关的，是你带走了谁，又留下了什么。`:esc(S.outcome.reason)+' 敌人没有额外行动。试着少动几枚棋子，预判回击，或先处理撤退路线。'}</p><div class="result-stats"><div class="result-stat grade"><span>${won?'战术评级':'当前关卡'}</span><strong>${won?h.grade:String(C.step+1).padStart(2,'0')}</strong></div><div class="result-stat"><span>${final?'战役总分':'行动得分'}</span><strong>${score}</strong></div><div class="result-stat"><span>消耗轮数</span><strong>${String(S.round).padStart(2,'0')}</strong></div><div class="result-stat"><span>留存机娘</span><strong>${String(people.length).padStart(2,'0')}</strong></div></div><div class="result-survivors">${people.map(u=>`<div class="survivor-portrait ${u.side}" title="${nameOf(u)} · 同步 ${u.xp}"><img src="${ART[u.char]}" alt="${nameOf(u)}"><small>${nameOf(u)}</small></div>`).join('')}</div><div class="result-consequences">${won?consequenceText().map(esc).join('<br>'):'你的本关初始存档仍然保留。重开不会抹去此前关卡的角色、成长与选择。<br>技巧：威胁预览只是当前攻击范围；先夺控一个单位，可能会同时打开另一条敌人的攻击线。'}</div><div class="result-buttons"><button class="button primary" id="result-next">${won?final?'返回主菜单':S.mid===0||S.mid===3?'作出下一次选择':'前往下一章':'重开本关'} ${svg('arrow')}</button>${won&&!final?'<button class="button ghost" id="result-retry">重打本关，争取不同结果</button>':''}<button class="button ghost" id="result-export">导出战役存档</button></div>`;
 $('result').hidden=false;$('result-next').onclick=won?advanceMission:retryMission;$('result-retry')?.addEventListener('click',retryMission);$('result-export').onclick=exportSave;$('result-next').focus();
}

/* Local saves are optional. Opaque-origin file previews may deny localStorage;
   the game continues in memory and downloadable/importable JSON remains available. */
function snapshotValid(c,s){
 migrateCast(c);
 if(!c||!s||!['g','r'].includes(c.side)||!Number.isInteger(c.step)||c.step<0||c.step>4||!Array.isArray(c.order)||c.order.length!==5||[...c.order].sort().join(',')!=='0,1,2,3,4')return false;
 if(!c.roster||Object.keys(CHAR).some(id=>!c.roster[id]||!['g','r'].includes(c.roster[id].side)||!['active','destroyed','retired'].includes(c.roster[id].status)))return false;
 if(!Number.isInteger(s.mid)||s.mid<0||s.mid>4||!Number.isInteger(s.round)||s.round<1||s.round>99||!['player','over'].includes(s.phase)||!Array.isArray(s.units)||s.units.length>64)return false;
 const ids=new Set();for(const u of s.units){if(!u||typeof u.uid!=='string'||u.uid.length>80||ids.has(u.uid)||!['g','r'].includes(u.side)||!Number.isInteger(u.x)||!Number.isInteger(u.y)||u.x<0||u.x>7||u.y<0||u.y>7||!(u.kind==='mech'||KINDS[u.kind])||u.char&&!CHAR[u.char]||u.kind==='mech'&&!CHAR[u.char])return false;ids.add(u.uid);}
 for(const k of ['walls','voids','doors'])if(!Array.isArray(s[k])||s[k].some(x=>typeof x!=='string'||!/^\d,\d$/.test(x)))return false;
 for(const k of ['relays','loot','exits','delivery','logs','events','initial'])if(!Array.isArray(s[k]))return false;
 if(!s.flags||!s.counts||!s.captureSeen||!c.flags||!c.stats||!Array.isArray(c.history))return false;
 return true;
}
function payloadValid(p){return p&&p.version===1&&snapshotValid(p.c,p.s)&&p.checkpoint&&snapshotValid(p.checkpoint.c,p.checkpoint.s);}
function persist(){
 if(!C||!S||S.phase==='ai')return;savedPayload={version:1,c:clone(C),s:clone(S),checkpoint:clone(checkpoint)};
 try{localStorage.setItem(SAVE_KEY,JSON.stringify(savedPayload));storageAvailable=true;}catch(e){storageAvailable=false;}
 $('continue-btn').hidden=false;if($('save-indicator'))$('save-indicator').textContent=storageAvailable?'AUTO SAVE':'SESSION';
}
function restorePayload(p){
 if(!payloadValid(p)){toast('存档结构不完整，无法接入。');return;}
 runId++;C=clone(p.c);S=clone(p.s);checkpoint=clone(p.checkpoint);savedPayload=clone(p);busy=false;undoStack=[];selected=movers(S,C.side).find(u=>u.char)?.uid||movers(S,C.side)[0]?.uid;hideStory();closeModal();showGame();render();if(S.outcome)showResult();else $('result').hidden=true;persist();
}
function exportSave(){
 if(S&&S.phase!=='ai')persist();if(!savedPayload){toast('尚未开始战役，没有可导出的存档。');return;}
 const blob=new Blob([JSON.stringify(savedPayload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`赤巢协议-${savedPayload.c.side==='g'?'守护者':'赤巢'}-第${savedPayload.c.step+1}章.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);toast('已请求导出存档；若预览禁止下载，请在直播预览或独立浏览器中操作。');
}
async function importSave(file){if(!file)return;if(file.size>1500000){toast('文件过大，不是有效的战役存档。');return;}try{const p=JSON.parse(await file.text());if(!payloadValid(p))throw new Error('invalid');restorePayload(p);toast('存档已恢复，角色与分支状态已同步。');}catch(e){toast('无法读取存档。请导入本游戏导出的完整 JSON 文件。');}}

function sfx(type){
 if(!soundEnabled)return;try{audioContext=audioContext||new(window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();const now=audioContext.currentTime;const freq={move:180,select:520,wait:250,commit:340,capture:95,hit:110,alarm:75,victory:660}[type]||220;const duration=['capture','alarm','victory'].includes(type)?.32:.09;const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type=type==='capture'||type==='alarm'?'sawtooth':'sine';osc.frequency.setValueAtTime(freq,now);osc.frequency.exponentialRampToValueAtTime(type==='victory'?freq*1.5:freq*.55,now+duration);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(type==='capture'?.035:.045,now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.connect(gain);gain.connect(audioContext.destination);osc.start(now);osc.stop(now+duration+.02);}catch(e){soundEnabled=false;}}
function toggleAudio(){soundEnabled=!soundEnabled;$('audio-btn').innerHTML=svg(soundEnabled?'sound':'mute');$('audio-btn').setAttribute('aria-label',soundEnabled?'关闭音效':'开启音效');$('audio-btn').title=soundEnabled?'关闭音效':'开启音效';if(soundEnabled)sfx('select');toast(soundEnabled?'合成音效已开启':'音效已关闭');}

$('board').addEventListener('click',event=>{const cell=event.target.closest('[data-x]');if(cell)handleCell(Number(cell.dataset.x),Number(cell.dataset.y));});
$('roster-list').addEventListener('click',event=>{const b=event.target.closest('[data-roster]');if(b&&!busy){selected=b.dataset.roster;renderBoard();renderDossier();}});
$('story-choices').addEventListener('click',event=>{const b=event.target.closest('[data-choice]');if(!b||!storyState?.choices)return;const choice=storyState.choices[Number(b.dataset.choice)];hideStory();choice?.action();});
$('modal-content').addEventListener('click',event=>{
 const b=event.target.closest('[data-system]');if(!b)return;
 switch(b.dataset.system){case'resume':closeModal();break;case'home':if(S?.phase==='ai'){toast('关闭菜单后等待敌方行动结束，再返回主菜单。');break;}closeModal();showHome();break;case'export':exportSave();break;case'import':$('import-file').click();break;case'flow':showFlow();break;case'retry':if(S?.phase==='ai'){toast('请关闭菜单，等敌方阶段结束后重开。');break;}if(checkpoint)retryMission();else toast('尚未开始战役。');break;}
});
$('import-file').addEventListener('change',event=>{importSave(event.target.files[0]);event.target.value='';});
$('end-phase-btn').onclick=endPhase;$('undo-btn').onclick=undoMove;$('retry-btn').onclick=()=>{if(!busy)retryMission();};
$('threat-btn').onclick=()=>{showThreat=!showThreat;renderStatus();renderBoard();};
$('archive-btn').onclick=showArchive;$('help-btn').onclick=showHelp;$('home-rules-btn').onclick=showHelp;$('flow-btn').onclick=showFlow;$('menu-btn').onclick=showSystemMenu;$('close-modal').onclick=closeModal;$('audio-btn').onclick=toggleAudio;
$('next-dialogue').onclick=nextStory;$('skip-story').onclick=skipStory;$('start-btn').onclick=()=>confirmNew(homeSide);$('continue-btn').onclick=()=>{if(savedPayload)restorePayload(savedPayload);};
$('home-logo').onclick=()=>{if(S?.phase==='ai'||busy){toast('当前行动结束后可以返回主菜单。');return;}if(C&&S)persist();showHome();};
for(const b of document.querySelectorAll('[data-faction]'))b.onclick=()=>selectFaction(b.dataset.faction);
$('modal').addEventListener('click',event=>{if(event.target===$('modal'))closeModal();});
document.addEventListener('keydown',event=>{
 const overlay=!$('modal').hidden?$('modal'):!$('cinema').hidden?$('cinema'):!$('result').hidden?$('result'):null;
 if(event.key==='Tab'&&overlay){const focusable=[...overlay.querySelectorAll('button:not([disabled]),input,a[href]')].filter(e=>e.offsetParent!==null);if(focusable.length){const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&(document.activeElement===first||!overlay.contains(document.activeElement))){event.preventDefault();last.focus();}else if(!event.shiftKey&&(document.activeElement===last||!overlay.contains(document.activeElement))){event.preventDefault();first.focus();}}return;}
 if(event.key==='Escape'){if(!$('modal').hidden)closeModal();else if(!$('cinema').hidden&&!storyState?.choices)skipStory();else if(!$('game').hidden&&$('result').hidden)showSystemMenu();return;}
 if(event.key==='Enter'&&!$('cinema').hidden&&document.activeElement?.tagName!=='BUTTON'){event.preventDefault();nextStory();return;}
 if(event.code==='Space'&&!overlay&&!$('game').hidden&&!['BUTTON','INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){event.preventDefault();endPhase();}
});
window.addEventListener('beforeunload',()=>{if(S&&S.phase!=='ai')persist();});
document.documentElement.style.setProperty('--station',`url("${ART.station}")`);
try{const raw=localStorage.getItem(SAVE_KEY);if(raw){const parsed=JSON.parse(raw);if(payloadValid(parsed))savedPayload=parsed;}}catch(e){storageAvailable=false;}
$('continue-btn').hidden=!savedPayload;selectFaction('g');
