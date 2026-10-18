/* M5 interface integration. Loaded after campaign.js. No hidden combat bonuses. */
let archiveState='current';
const gallerySide=id=>archiveState==='g'||archiveState==='r'?archiveState:S?.units.find(u=>u.char===id)?.side||C?.roster[id]?.side||CHAR[id].origin;
function showArchivePortrait(id,side=gallerySide(id)){
 const d=CHAR[id];if(!d)return;
 openModal(d.name+' / '+(side==='r'?'控制态预览':'自主态预览'),'PERSONNEL / FULL FRAME',`<button class="text-button gallery-back" data-gallery-back>← 返回十二人档案</button><div class="full-portrait" data-portrait-character="${id}"><img src="${portraitSource(id,side)}" alt="${d.name} / ${side==='r'?'控制态':'自主态'}完整立绘"><div><span>${d.code} / ${d.en} / ${d.age}岁</span><h3>${d.name}</h3><div class="archive-tabs"><button data-portrait-id="${id}" data-portrait-state="g" class="${side==='g'?'active':''}">自主态</button><button data-portrait-id="${id}" data-portrait-state="r" class="${side==='r'?'active':''}">控制态</button></div><p>${side==='r'?'发光赤红机械蜘蛛（N–6控制装置）死死扣在她胸口正中的装甲上，八根金属支足刺入神经总线，双眸同步亮起猩红光芒。战役中的夺控不可逆，攻击受控者只会击杀，不会解救。':'胸口正中装甲完好，未植入赤红机械蜘蛛控制装置。此处是独立的美术预览，不代表战役中的实际阵营。'}</p><p>${d.bio}</p><p>${d.rule}</p><p class="gallery-preview-note">预览不会转换角色、消耗行动或改变存档。</p></div></div>`);
}

showArchive=function(){
 const stateOf=gallerySide;
 openModal('十二名美少女机娘档案','AEGIS & HIVE / 12 MECHA GIRLS',`<div class="archive-intro"><p class="manual-lead">天穹空间站战役 · 十二名二次元美少女机娘。<br>每人拥有独立国际象棋式走法、同步 II 进阶强化与跨章状态；点击立绘可切换预览自主态与胸口正中红蜘蛛控制态。</p><div class="archive-tabs"><button data-gallery-state="current" class="${archiveState==='current'?'active':''}">当前状态</button><button data-gallery-state="g" class="${archiveState==='g'?'active':''}">自主态预览</button><button data-gallery-state="r" class="${archiveState==='r'?'active':''}">控制态预览</button></div><small>自主态为未被寄生形象，控制态为胸口正中植入发光红蜘蛛形象；预览只切换立绘，不能解救或改变战役阵营。</small></div><div class="archive-grid">${Object.entries(CHAR).map(([id,d])=>{const rec=C?.roster[id],side=stateOf(id),status=rec?.status==='destroyed'?'永久损毁':rec?.status==='retired'?'已隔离离场':rec?.introduced?'已登场':`${MISSIONS[d.debut].name}登场`;return`<article class="archive-card" data-character="${id}" data-status="${rec?.status||'active'}"><button type="button" class="archive-photo" data-gallery-portrait="${id}" aria-label="查看${d.name}完整立绘"><img src="${portraitSource(id,side)}" alt="${d.name} / ${side==='r'?'控制态':'自主态'}" loading="lazy"><span class="archive-state ${side}">${side==='r'?'胸口赤蛛寄生':'自主神经链路'} / ${status}</span><span class="archive-open">查看全图 ↗</span></button><div class="archive-info"><span>${d.code} / ${d.en} / ${d.age}岁</span><h3>${d.name}</h3><b>${d.role} · ${d.rune}</b><p>${d.bio}</p><p>${d.rule}</p><small>${d.upgrade}</small></div></article>`;}).join('')}</div>`);
};
$('archive-btn').onclick=showArchive;
$('modal-content').addEventListener('click',e=>{const b=e.target.closest('[data-gallery-state]');if(b){archiveState=b.dataset.galleryState;showArchive();return;}const art=e.target.closest('[data-gallery-portrait]');if(art){showArchivePortrait(art.dataset.galleryPortrait);return;}const state=e.target.closest('[data-portrait-state]');if(state){showArchivePortrait(state.dataset.portraitId,state.dataset.portraitState);return;}if(e.target.closest('[data-gallery-back]'))showArchive();});
const ensembleHelp=showHelp;
showHelp=function(){ensembleHelp();const sections=$('modal-content').querySelectorAll('.manual-section');for(const section of sections)if(section.querySelector('small')?.textContent.includes('CHESS MOVEMENT'))section.innerHTML='<small>03 / TWELVE MOVEMENT SYSTEMS</small><h3>十二人，十二种走法</h3><p>原六名之外，新增：珀弦·同向连跳巡骑；白栖·直走斜吃；苍澜·王步近防；绯律·隔子炮；霁川·3×2 斑马跳；祈雾·折线狮鹫。每人可达格、威胁图、AI与规则面板使用同一套实际走法生成器。<b>没有将军规则，没有随机命中率，也没有额外隐藏行动。</b></p>';};
$('help-btn').onclick=showHelp;$('home-rules-btn').onclick=showHelp;
const ensembleMission=makeMission;
makeMission=function(id){migrateCast(C);return ensembleMission(id);};
const oldMoveDiagram=movementDiagram;
movementDiagram=function(u){
 if(!u.char||CHAR[u.char].move!=='cannon')return oldMoveDiagram(u);
 // A cannon diagram needs a screen. Without one, a blank-board picture would
 // falsely imply that the cannon cannot capture in ANY direction.
 const test={...S,mid:-1,walls:[],voids:[],relays:[],units:[{...u,x:3,y:3,used:false,dead:false,escaped:false},{uid:'diagram-screen',kind:'drone',side:u.side,x:3,y:2,used:true,dead:false,escaped:false}]};
 const moves=new Set(legalMoves(test,test.units[0]).map(m=>key(m.x,m.y))),attacks=new Set(legalMoves(test,test.units[0],'threat').map(m=>key(m.x,m.y)));let result='';
 for(let y=0;y<7;y++)for(let x=0;x<7;x++){const k=key(x,y);result+=`<span class="${x===3&&y===3?'center':x===3&&y===2?'screen':moves.has(k)?'active':attacks.has(k)?'attack':''}"></span>`;}
 return`<div class="move-grid" title="金色格为炮架；炮架之后的红色格为可吃子区" aria-hidden="true">${result}</div>`;
};
radioForCapture=function(ev){
 const t=ev.converted;if(!t)return;
 const free={lyra:'手动权限恢复。给我现在的作战记录。',akira:'我看见枪口转过去了。不是你们的错，先散开。',lark:'七分钟。把事故时间往前查七分钟。',veil:'保留完整录像。中间没有可以删掉的部分。',misa:'固定爪松了。别碰红色药仓，先断它的授权。',noct:'别替我删记录。那是我写下的东西。',iris:'离线表还在走。报一下你们的时间。',sera:'我能自己抬手了。把其他病人的状态报给我。',vega:'回收链路重连。出口留一格给我。',ruby:'隔离令冻结。我要核对最初的签发人。',june:'录制还在继续。现在这段也保留。',psalm:'你们听见了吗？停止指令一直都在。'};
 radio(t.name,ev.side==='g'?(free[t.char]||'自主链路恢复。'): 'N–6 固定爪闭锁。运动指令已被覆写；该载体在下一己方阶段接入。');
};
$('home').querySelector('.prototype-tag').textContent='ECHO CUT · 0.4';
$('home').querySelector('.hero-rule').innerHTML='<span>12 OPERATORS / 05 CHAPTERS / 16 ACTS</span> 双阵营 <b>·</b> 回声站封锁事件';
if(location.hash==='#qa')Object.assign(window.__MV_QA__,{
 cast(){return Object.fromEntries(Object.entries(CHAR).map(([id,d])=>[id,{name:d.name,move:d.move,origin:d.origin,debut:d.debut,age:d.age}]));},
 threats(uid){return legalMoves(S,S.units.find(u=>u.uid===uid),'threat');},
 validate(p){return payloadValid(p);},
 next(){return nextMission();},
 openArchive(){showArchive();}
});
