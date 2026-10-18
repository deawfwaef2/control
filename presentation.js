/* M1 presentation layer. Keep the rules engine shared; do not fork move logic.
   New state art is generated imagery, not a UI spider drawn over the portrait. */
const SCENE_ART=['station','garden','bridge','archive','reactor'];
const portraitSource=(id,side)=>side==='r'&&ART[id+'_infected']?ART[id+'_infected']:ART[id];
let portraitView=true;
const originalFaction=selectFaction;
selectFaction=function(side){originalFaction(side);$('hero-portrait').src=portraitSource(side==='g'?'lyra':'noct',side);};

// Remove the cramped three-column layout. Objectives become a full-width strip;
// the battlefield gets the page, with one substantial character dossier beside it.
const workspace=$('game').querySelector('.workspace');
const brief=document.createElement('div');brief.className='operation-brief';brief.id='operation-brief';
brief.append(document.querySelector('.objectives-panel'));workspace.before(brief);
const rightRail=document.querySelector('.right-rail');
rightRail.append(document.querySelector('.forces-panel'),document.querySelector('.log-panel'));
document.querySelector('.left-rail').remove();
const surround=document.querySelector('.board-surround');const pan=document.createElement('div');pan.className='board-pan';surround.before(pan);pan.append(surround);
const viewControl=document.createElement('div');viewControl.className='view-control';viewControl.innerHTML='<button id="portrait-view-btn" class="active" title="更大的角色卡与可横向滑动的棋盘">立绘视图</button><button id="overview-btn" title="缩小整张棋盘，快速阅读全局">全局总览</button>';
document.querySelector('.board-toolbar').append(viewControl);
const stageRibbon=document.createElement('div');stageRibbon.className='stage-ribbon';stageRibbon.id='stage-ribbon';stageRibbon.innerHTML='<span>OPERATION / LIVE</span><strong>先看目标，再决定下一步。</strong>';
document.querySelector('.battlefield').prepend(stageRibbon);
function setBoardView(large){portraitView=large;document.body.classList.toggle('overview-mode',!large);$('portrait-view-btn').classList.toggle('active',large);$('overview-btn').classList.toggle('active',!large);}
$('portrait-view-btn').onclick=()=>setBoardView(true);$('overview-btn').onclick=()=>setBoardView(false);
$('game').querySelector('.board-bottomline').insertAdjacentHTML('beforeend','<span class="pan-tip">大棋子模式 · 窄屏可横向滑动 / 切换总览</span>');

const originalShowGame=showGame;
showGame=function(){originalShowGame();const backdrop=ART[SCENE_ART[S.mid]]||ART.station;document.documentElement.style.setProperty('--battle-art',`url("${backdrop}")`);setBoardView(portraitView);};
tokenHTML=function(u){
 const activeSide=S.phase==='ai'?enemyOf(C.side):C.side;const moved=u.used&&u.side===activeSide;
 let art=u.char?`<img class="piece-portrait" src="${portraitSource(u.char,u.side)}" alt="" draggable="false">`:['spider','courier'].includes(u.kind)?`<img class="piece-machine" src="${ART.device}" alt="" draggable="false">`:u.kind==='core'?`<img class="piece-reactor" src="${ART.reactor}" alt="" draggable="false">`:svg(KINDS[u.kind].icon,'unit-art');
 return`<span class="token ${u.side} ${u.char?'character-token':'machine-token'} ${u.kind==='core'?'core':''} ${moved?'moved':''}">${art}<span class="token-bevel"></span><span class="token-role">${defOf(u).rune}</span><span class="token-signal">${moved?'—':'●'}</span>${u.char&&u.xp>=2?'<span class="token-level">SYNC II</span>':''}${u.kind==='core'&&shielded(S)?svg('lock','token-shield'):''}<span class="token-name">${esc(nameOf(u))}<small>${u.char?CHAR[u.char].en:u.side==='r'?'RED HIVE':'EGIS'}</small></span></span>`;
};
const originalDossier=renderDossier;
renderDossier=function(){
 originalDossier();const u=S.units.find(v=>v.uid===selected&&onBoard(v))||movers(S,C.side).find(v=>v.char)||movers(S,C.side)[0];if(!u)return;
 if(u.char){const img=$('dossier').querySelector('.dossier-portrait>img');if(img)img.src=portraitSource(u.char,u.side);
  const controls=$('dossier').querySelector('.dossier-controls');if(controls){const btn=document.createElement('button');btn.className='button ghost';btn.textContent='查看完整立绘';btn.onclick=()=>openModal(CHAR[u.char].name+' / '+(u.side==='r'?'人格接管':'人格自主'),'CHARACTER / FULL FRAME',`<div class="full-portrait"><img src="${portraitSource(u.char,u.side)}" alt="${nameOf(u)}"><div><span>${CHAR[u.char].code}</span><h3>${CHAR[u.char].name}</h3><p>${CHAR[u.char].bio}</p><p>${u.side==='r'?'N–6 已永久覆写运动与阵营权限。没有解救手段；普通棋子攻击她将造成永久击杀。':'没有红色控制装置。她现在为自己的意志行动。'}</p></div></div>`);controls.append(btn);}
 }else if(['spider','courier'].includes(u.kind)){$('dossier').querySelector('.dossier-robot').innerHTML=`<img class="device-detail" src="${ART.device}" alt="N–6 紧凑型胸甲控制器">`;}
};
const originalRoster=renderRoster;
renderRoster=function(){originalRoster();$('roster-list').querySelectorAll('[data-roster]').forEach(b=>{const u=S.units.find(v=>v.uid===b.dataset.roster);if(u)b.querySelector('img').src=portraitSource(u.char,u.side);});};
const originalPlayStory=playStory;
playStory=function(frames,onDone,title){
 clearTimeout(toastTimer);clearTimeout(eventTimer);$('toast').classList.remove('show');$('capture-event').classList.remove('show');
 originalPlayStory(frames,onDone,title);
};
const originalStoryFrame=showStoryFrame;
showStoryFrame=function(){
 originalStoryFrame();if(!storyState)return;const frame=storyState.frames[storyState.index],speaker=storySpeaker(frame);$('cinema-portrait').src=portraitSource(speaker.id,speaker.side);
 const shot=frame.camera||((storyState.index===0&&storyState.frames.length>1)?'establish':storyState.index%2?'close':'medium');
 $('cinema').dataset.shot=shot;$('cinema').dataset.tone=speaker.side;
 const art=ART[frame.scene||SCENE_ART[S.mid]]||ART.station;$('cinema').style.setProperty('--scene-art',`url("${art}")`);
 const direction=$('dialogue-direction');direction.textContent=MISSIONS[S.mid].location+' / '+(shot==='establish'?'站内光学影像':'加密人格频道');direction.dataset.shotNotes=frame.shot||'';
};
captureEffect=function(target,side){
 clearTimeout(eventTimer);const box=$('capture-event');box.className='capture-event cinema-capture '+side;
 box.innerHTML=`<div class="capture-face"><img src="${portraitSource(target.char,side)}" alt=""></div><div class="capture-copy"><span>${side==='r'?'CONTROL OVERRIDE':'PERSONALITY RESTORED'}</span><strong>${side==='r'?'赤蛛接管':'人格回归'} · ${esc(target.name)}</strong><small>${side==='r'?'她记得一切，却暂时无法选择。':'她的下一步，重新属于自己。'}</small><em>下一己方阶段可行动</em></div>`;
 requestAnimationFrame(()=>box.classList.add('show'));eventTimer=setTimeout(()=>box.classList.remove('show'),2300);
 if(!reducedMotion){$('screen-flash').classList.remove('fire');requestAnimationFrame(()=>$('screen-flash').classList.add('fire'));$('board').classList.add('shake');setTimeout(()=>$('board').classList.remove('shake'),320);}
};
// Use state art in reports, too; do not incorrectly show a clean portrait for an infected survivor.
const originalResult=showResult;
showResult=function(){originalResult();if(!S)return;const people=S.units.filter(u=>u.char&&!u.dead&&u.side===C.side);$('result-content').querySelectorAll('.survivor-portrait img').forEach((img,i)=>{if(people[i])img.src=portraitSource(people[i].char,people[i].side);});};
$('home').querySelector('.prototype-tag').textContent='DIRECTOR BUILD · 0.2';
$('home').querySelector('.hero-copy>.micro-label').innerHTML='<span class="red-line"></span> THE ECHO STATION INCIDENT';
$('home').querySelector('.hero-footnote').firstChild;
selectFaction(homeSide);

// Readability is a player-controlled setting, not a fixed-size screenshot choice.
let pieceZoom=1;
const zoomBar=document.createElement('div');zoomBar.className='piece-zoom';zoomBar.innerHTML='<button id="zoom-out" aria-label="缩小棋子" title="缩小棋子">−</button><span id="zoom-level">100%</span><button id="zoom-in" aria-label="放大棋子" title="放大棋子（最高175%）">+</button>';document.querySelector('.board-toolbar').append(zoomBar);
function refreshPieceSize(){
 const available=pan.clientWidth||Math.max(320,window.innerWidth-40);
 if(portraitView){const base=Math.max(window.innerWidth<=700?660:window.innerWidth<=1200?570:650,Math.min(1000,available));const size=Math.round(base*pieceZoom);surround.style.width=size+'px';surround.style.minWidth=size+'px';surround.style.maxWidth='none';}
 else{surround.style.width='100%';surround.style.minWidth='0';surround.style.maxWidth='680px';}
 document.documentElement.style.setProperty('--card-scale',portraitView?String(pieceZoom):'1');$('zoom-level').textContent=Math.round(pieceZoom*100)+'%';$('zoom-out').disabled=pieceZoom<=1;$('zoom-in').disabled=pieceZoom>=1.75;
}
const initialBoardView=setBoardView;
setBoardView=function(large){initialBoardView(large);refreshPieceSize();};
$('zoom-in').onclick=()=>{pieceZoom=Math.min(1.75,pieceZoom+.25);setBoardView(true);};
$('zoom-out').onclick=()=>{pieceZoom=Math.max(1,pieceZoom-.25);setBoardView(true);};
window.addEventListener('resize',()=>{if(!$('game').hidden)requestAnimationFrame(refreshPieceSize);});
refreshPieceSize();
