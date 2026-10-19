/* ===== M15 HUD — one-screen battle layout (desktop ≥1100px) =====
   Left: objectives / forces / log. Center: board fitted to the viewport. Right: unit dossier + roster.
   Pure layout layer: panels keep their ids, so every renderer still finds them. */
(function(){
 const game=$('game');if(!game)return;
 const left=document.createElement('aside');left.id='hud-left';left.className='hud-left';
 const brief=$('operation-brief'),forces=document.querySelector('.forces-panel'),log=document.querySelector('.log-panel');
 const workspace=document.querySelector('#game .workspace');
 if(workspace){workspace.prepend(left);}
 [brief,forces,log].forEach(p=>{if(p)left.appendChild(p);});
 const isDesk=()=>window.innerWidth>=860&&window.innerHeight>=520;
 function apply(){
  document.body.classList.toggle('hud15',isDesk());
  const h=document.querySelector('.site-header');
  document.documentElement.style.setProperty('--hud-top',(h?h.offsetHeight:50)+'px');
 }
 apply();
 const baseRefresh=typeof refreshPieceSize==='function'?refreshPieceSize:null;
 if(baseRefresh){
  refreshPieceSize=function(){
   const pan=document.querySelector('.board-pan'),surround=document.querySelector('.board-surround');
   if(!document.body.classList.contains('hud15')||!pan||!surround||game.hidden){baseRefresh();return;}
   const zoom=Math.min(1.75,Math.max(1,(parseInt(($('zoom-level')||{}).textContent,10)||100)/100));
   const avail=Math.max(360,Math.min(pan.clientWidth-8,pan.clientHeight-8));
   const size=Math.round(avail*zoom);
   surround.style.width=size+'px';surround.style.minWidth=size+'px';surround.style.maxWidth='none';
   pan.classList.toggle('zoomed',zoom>1);
   document.documentElement.style.setProperty('--card-scale',String(zoom));
   if($('zoom-level'))$('zoom-level').textContent=Math.round(zoom*100)+'%';
   if($('zoom-out'))$('zoom-out').disabled=zoom<=1;
   if($('zoom-in'))$('zoom-in').disabled=zoom>=1.75;
  };
 }
 let raf=0;
 function relayout(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{apply();try{refreshPieceSize();}catch(e){}});}
 window.addEventListener('resize',relayout);
 ['zoom-in','zoom-out','portrait-view-btn','overview-btn'].forEach(id=>{const b=$(id);if(b)b.addEventListener('click',()=>setTimeout(relayout,0));});
 new MutationObserver(relayout).observe(game,{attributes:true,attributeFilter:['hidden']});
 const baseRender=render;
 const SHORT={'赤红机械蜘蛛':'赤蛛','赤红机械 蜘蛛':'赤蛛','载毒信使':'信使','守护哨卫':'哨卫','轨道哨塔':'哨塔'};
 function shortNames(){document.querySelectorAll('#board .token-name').forEach(n=>{const f=n.firstChild;if(!f||f.nodeType!==3)return;const t=f.nodeValue.replace(/\s+/g,'');if(SHORT[t]){n.title=t;f.nodeValue=SHORT[t];}});}
 {const bd=$('board');if(bd){let pend=0;new MutationObserver(()=>{if(pend)return;pend=requestAnimationFrame(()=>{pend=0;shortNames();});}).observe(bd,{childList:true,subtree:true});}}
 render=function(){const r=baseRender.apply(this,arguments);try{shortNames();}catch(e){}if(document.body.classList.contains('hud15')&&!game.hidden){const s=document.querySelector('.board-surround');if(s&&!s.style.width.endsWith('px'))relayout();}return r;};
 setTimeout(relayout,50);
})();

/* ===== M15 TITLE SCREEN — cinematic main menu layered over #home =====
   Buttons forward to existing handlers (selectFaction / confirmNew / restore / header buttons). */
(function(){
 const home=$('home');if(!home)return;
 const t=document.createElement('section');t.id='title15';t.setAttribute('aria-label','主菜单');
 const click=id=>{const b=$(id);if(b)b.click();};
 t.innerHTML=`
 <div class="t15-bg" style="background-image:url('${ART.film_orbit}')"></div><div class="t15-glow"></div><div class="t15-grain"></div><div class="t15-vig"></div>
 <figure class="t15-hero"><img alt=""></figure>
 <div class="t15-main">
  <div class="t15-kicker"><i></i>MECHANICAL VIRUS · RED HIVE PROTOCOL</div>
  <h1 class="t15-logo">机械<b>病毒</b></h1>
  <div class="t15-sub">赤 巢 协 议</div>
  <p class="t15-hook">十七天前，天穹空间站停止了应答。<br>三小时前，它只发来一句话——<em>“不要派人来。”</em></p>
  <nav class="t15-menu" data-view="menu">
   <button data-t="continue" hidden><span>继续战役</span><small id="t15-save">读取自动存档</small></button>
   <button data-t="new"><span>开始新战役</span><small>序章 · 回声</small></button>
   <button data-t="map"><span>战役星图</span><small>关卡与分支</small></button>
   <button data-t="cast"><span>角色图鉴</span><small>十八名机娘</small></button>
   <button data-t="cg"><span>剧情 CG</span><small>已解锁的画面</small></button>
   <button data-t="help"><span>作战手册</span><small>规则与走法</small></button>
   <button data-t="audio"><span>声音设置</span><small>音乐 / 音效</small></button>
  </nav>
  <div class="t15-faction" data-view="faction" hidden>
   <div class="t15-ftitle">选择你的立场</div>
   <div class="t15-cards">
    <button class="t15-card g" data-side="g"><b>苍穹防线</b><span>地球守护者 · 推荐首次游玩</span><p>带领机娘小队登上失联的空间站，查明真相，把活着的人带回家。</p></button>
    <button class="t15-card r" data-side="r"><b>赤巢</b><span>机械意识 · 高难度</span><p>你是那座空间站本身。让入侵者成为你的身体，把图纸送回地球。</p></button>
   </div>
   <div class="t15-frow"><button class="t15-back" data-t="back">← 返回</button><button class="t15-go" data-t="go">开 始</button></div>
  </div>
 </div>
 <footer class="t15-foot"><span>M15 · 持续更新的可玩版本</span><span>BGM：PeriTune（CC BY 4.0）</span></footer>`;
 home.appendChild(t);
 let side='g';
 const hero=t.querySelector('.t15-hero img');
 function setSide(s){side=s;t.classList.toggle('r',s==='r');t.querySelectorAll('.t15-card').forEach(c=>c.classList.toggle('on',c.dataset.side===s));
  const src=s==='r'?(ART.film_overmind):(ART.lyra);hero.src=src;t.querySelector('.t15-hero').classList.toggle('wide',s==='r');}
 function view(v){t.querySelector('[data-view=menu]').hidden=v!=='menu';t.querySelector('[data-view=faction]').hidden=v!=='faction';}
 function sync(){
  const on=!home.hidden;document.body.classList.toggle('title15-on',on);
  const cont=t.querySelector('[data-t=continue]'),cb=$('continue-btn');cont.hidden=!cb||cb.hidden;
  if(on){view('menu');}
 }
 t.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  try{sfx('select');}catch(_){}
  const a=b.dataset.t;
  if(b.dataset.side){setSide(b.dataset.side);return;}
  if(a==='new'){setSide(side);view('faction');}
  else if(a==='back')view('menu');
  else if(a==='go'){try{selectFaction(side);}catch(_){}confirmNew(side);}
  else if(a==='continue')click('continue-btn');
  else if(a==='map')click('starmap-btn');
  else if(a==='cast')click('archive-btn');
  else if(a==='cg')click('cg-gallery-btn');
  else if(a==='help')click('help-btn');
  else if(a==='audio')click('audio-settings-btn');
 });
 setSide('g');sync();
 new MutationObserver(sync).observe(home,{attributes:true,attributeFilter:['hidden']});
 const cb=$('continue-btn');if(cb)new MutationObserver(sync).observe(cb,{attributes:true,attributeFilter:['hidden']});
})();

/* ===== M16 bigger board: chapter title goes into the top bar, turn/phase/actions into a slim side column ===== */
(function(){
 const bf=document.querySelector('#game .battlefield');if(!bf)return;
 const side=document.createElement('div');side.className='hud-side';
 const round=document.querySelector('#game .round-indicator'),phase=$('phase-label'),flow=$('flow-btn'),bar=document.querySelector('#game .action-bar');
 [phase,round,bar,flow].forEach(e=>{if(e)side.appendChild(e);});
 bf.appendChild(side);
 const mh=document.querySelector('#game .mission-heading'),hdr=document.querySelector('.site-header'),game=$('game');
 function place(){if(!mh||!hdr)return;const desk=document.body.classList.contains('hud15');if(desk&&mh.parentNode!==hdr)hdr.insertBefore(mh,hdr.querySelector('.header-actions'));else if(!desk&&mh.parentNode!==game)game.prepend(mh);hdr.classList.toggle('in-game',desk&&!game.hidden);}
 place();window.addEventListener('resize',()=>requestAnimationFrame(place));new MutationObserver(place).observe(game,{attributes:true,attributeFilter:['hidden']});
 setTimeout(()=>{try{refreshPieceSize();}catch(e){}},80);
})();
