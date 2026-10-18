/* M7/M11/M13 Irreversible Capture Law + 3D Orbital Space Scene + Flat 0-Degree Board
   + Progressive Unit Arrival & Speech Staging + Animated Mission Marker Choreography.
   Only Red Spiders infect and swap; all other captures permanently destroy the target. */
ACT_NAMES.g[0]=['攻破接驳门禁','截获病毒信使','突入北侧通道'];
ACT_NAMES.g[3]=['开启中枢电磁门','夺取双子镜像终端','固守同步座破译护盾'];
ACT_NAMES.r[3]=['开启中枢电磁门','保全受控架构师朔夜','固守同步座锁定中枢'];
ACT_NAMES.g[4][2]='近场切断增殖总线';

/* 1. 3D Deep-Space & Orbital Station Scene Canvas (surrounding the 0-deg flat chess board) */
function initSpace3DScene(){
 const game=$('game');if(!game||$('space-3d-canvas'))return;
 const canvas=document.createElement('canvas');
 canvas.id='space-3d-canvas';
 canvas.className='space-3d-canvas';
 canvas.setAttribute('aria-hidden','true');
 game.prepend(canvas);
 const ctx=canvas.getContext('2d');
 let w=0,h=0,angle=0;
 const stars=Array.from({length:110},(_,i)=>({
  x:((i*97)%2000)-1000,
  y:((i*151)%1400)-700,
  z:((i*67)%950)+120,
  r:1+((i*13)%3)*0.65
 }));
 const SECTOR_PALETTE={
  dock:{pri:'rgba(96,215,255,',sec:'rgba(255,66,96,',glow:'#3ec8ff'},
  garden:{pri:'rgba(72,235,168,',sec:'rgba(255,78,106,',glow:'#3de09c'},
  bridge:{pri:'rgba(110,195,255,',sec:'rgba(255,180,82,',glow:'#68b8ff'},
  archive:{pri:'rgba(175,130,255,',sec:'rgba(255,68,118,',glow:'#b488ff'},
  reactor:{pri:'rgba(255,78,104,',sec:'rgba(255,164,76,',glow:'#ff4868'}
 };
 function resize(){
  const dpr=Math.min(window.devicePixelRatio||1,1.5);
  w=canvas.width=Math.max(320,Math.floor(window.innerWidth*dpr));
  h=canvas.height=Math.max(240,Math.floor(window.innerHeight*dpr));
 }
 resize();
 window.addEventListener('resize',resize,{passive:true});

 function project3D(x,y,z,cx,cy,fov){
  const scale=fov/Math.max(60,fov+z);
  return{x:cx+x*scale,y:cy+y*scale,s:scale};
 }

 function drawFrame(){
  if(!game.hidden&&w>0&&h>0){
   const sector=($('board')?.dataset?.sector)||'dock';
   const pal=SECTOR_PALETTE[sector]||SECTOR_PALETTE.dock;
   ctx.clearRect(0,0,w,h);
   const cx=w*0.44,cy=h*0.48,fov=Math.min(w,h)*0.68;

   // 1) 3D Deep-Space Planetary Horizon & Volumetric Core Glow
   const bgGrad=ctx.createRadialGradient(cx,cy*0.92,w*0.04,cx,cy,w*0.75);
   bgGrad.addColorStop(0,pal.pri+'0.14)');
   bgGrad.addColorStop(0.45,pal.sec+'0.06)');
   bgGrad.addColorStop(1,'rgba(4,7,14,0)');
   ctx.fillStyle=bgGrad;
   ctx.fillRect(0,0,w,h);

   // 2) 3D Perspective Tactical Holo-Floor Grid beneath the orbital station
   ctx.save();
   ctx.strokeStyle=pal.pri+'0.14)';
   ctx.lineWidth=1;
   const floorY=h*0.36;
   for(let gx=-6;gx<=6;gx++){
    const p1=project3D(gx*135,floorY,-120,cx,cy,fov);
    const p2=project3D(gx*135,floorY,920,cx,cy,fov);
    ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();
   }
   for(let gz=0;gz<=7;gz++){
    const zVal=gz*135-60;
    const p1=project3D(-810,floorY,zVal,cx,cy,fov);
    const p2=project3D(810,floorY,zVal,cx,cy,fov);
    ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();
   }

   // 3) 3D Counter-Rotating Orbital Station Double-Ring Structure
   const ringRadius=Math.min(w,h)*0.56;
   for(let ringIdx=0;ringIdx<2;ringIdx++){
    const r=ringRadius*(ringIdx===0?1:0.74);
    const tiltX=ringIdx===0?0.58:-0.48;
    const tiltZ=ringIdx===0?0.22:-0.28;
    const rot=angle*(ringIdx===0?1:-1.35);
    const segs=24;
    const pts=[];
    for(let i=0;i<=segs;i++){
     const a=(i/segs)*Math.PI*2+rot;
     const rx=Math.cos(a)*r;
     const ry=Math.sin(a)*r*Math.sin(tiltX);
     const rz=Math.sin(a)*r*Math.cos(tiltX)+260;
     const tx=rx*Math.cos(tiltZ)-ry*Math.sin(tiltZ);
     const ty=rx*Math.sin(tiltZ)+ry*Math.cos(tiltZ);
     pts.push(project3D(tx,ty,rz,cx,cy,fov));
    }
    ctx.strokeStyle=(ringIdx===0?pal.pri:pal.sec)+'0.28)';
    ctx.lineWidth=ringIdx===0?2.2:1.5;
    ctx.beginPath();
    pts.forEach((p,idx)=>{if(idx===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});
    ctx.stroke();
    // Draw 3D orbital truss nodes along the ring
    for(let i=0;i<segs;i+=3){
     const p=pts[i];
     ctx.fillStyle=(i%6===0?pal.sec:pal.pri)+'0.65)';
     ctx.beginPath();ctx.arc(p.x,p.y,Math.max(1.8,3.6*p.s),0,Math.PI*2);ctx.fill();
    }
   }

   // 4) 3D Starfield & Sector Volumetric Depth Particles
   for(const st of stars){
    if(!reducedMotion){
     st.z-=1.6;
     if(st.z<60)st.z=980;
    }
    const p=project3D(st.x,st.y,st.z,cx,cy,fov);
    if(p.x<0||p.x>w||p.y<0||p.y>h)continue;
    const alpha=Math.min(0.85,Math.max(0.15,(1000-st.z)/900));
    ctx.fillStyle=st.r>2?pal.sec+(alpha*0.85)+')':pal.pri+alpha+')';
    ctx.beginPath();ctx.arc(p.x,p.y,st.r*p.s*1.3,0,Math.PI*2);ctx.fill();
   }
   ctx.restore();
   if(!reducedMotion)angle+=0.0035;
  }
  if(!reducedMotion&&location.hash!=='#qa'){
   requestAnimationFrame(drawFrame);
  }
 }
 drawFrame();
 // Also redraw whenever board renders in #qa or reducedMotion
 window.__redrawSpace3D=drawFrame;
}
initSpace3DScene();

/* 2. Active Gameplay On-Board Objective Markers (when not in cinema) */
function activeGameplayMarkers(s){
 if(!s||s.outcome)return[];
 const g=C.side==='g',stage=s.quest?.stage||0,out=[];
 if(s.mid===0){
  const cour=s.units.find(u=>u.kind==='courier'&&onBoard(u));
  if(stage===0){
   if(g){
    out.push({x:2,y:4,badge:'◉ 占领 C4 门禁',tone:'cyan'});
    if(cour)out.push({x:cour.x,y:cour.y,badge:'◆ 截杀信使',tone:'red'});
   }else{
    if(cour)out.push({x:cour.x,y:cour.y,badge:'◆ 推进信使北上',tone:'red'});
   }
  }else if(stage===1){
   if(g){
    out.push({x:3,y:0,badge:'◉ 占领 D8 中继',tone:'gold'});
    if(cour)out.push({x:7,y:0,badge:'▲ 封锁 H8 逃逸口',tone:'red'});
   }else{
    out.push({x:7,y:0,badge:'◉ 护送信使入 H8',tone:'red'});
   }
  }else if(stage===2){
   s.exits.filter(e=>e.side===C.side).forEach(e=>out.push({x:e.x,y:e.y,badge:'◉ 撤离点 '+xy(e.x,e.y),tone:'green'}));
  }
 }else if(s.mid===1){
  s.relays.forEach(r=>out.push({x:r.x,y:r.y,badge:(r.owner===C.side?'✓ 阀门 ':'◉ 占领 ')+xy(r.x,r.y),tone:r.owner===C.side?'green':'cyan'}));
  const samp=s.loot.find(l=>l.id==='sample'&&!l.lost&&!l.carrier);
  if(samp&&stage<2)out.push({x:samp.x,y:samp.y,badge:'◆ 温室样本 E5',tone:'gold'});
  if(stage===2)out.push({x:4,y:3,badge:'◉ E5 点击固守',tone:'gold'});
 }else if(s.mid===2){
  if(stage===0){
   const cap=s.units.find(u=>u.uid==='capsule'&&onBoard(u));
   if(cap)out.push({x:cap.x,y:cap.y,badge:g?'◆ 护送密钥匣':'◉ 夺取密钥匣',tone:'gold'});
  }else if(stage===1){
   out.push(g?{x:4,y:1,badge:'◉ 占领 E7 轨道锁',tone:'gold'}:{x:3,y:6,badge:'◉ 占领 D2 轨道锁',tone:'red'});
  }else if(stage===2){
   s.delivery.filter(d=>d.side===C.side).forEach(d=>out.push({x:d.x,y:d.y,badge:'◉ 交付口 '+xy(d.x,d.y),tone:'gold'}));
  }
 }else if(s.mid===3){
  if(stage<2){
   s.relays.forEach(r=>out.push({x:r.x,y:r.y,badge:(r.owner===C.side?'✓ 终端 ':'◉ 占领 ')+xy(r.x,r.y),tone:r.owner===C.side?'green':'cyan'}));
  }else{
   out.push({x:3,y:3,badge:'◉ 同步座 D5',tone:'gold'},{x:4,y:3,badge:'◉ 同步座 E5',tone:'gold'});
  }
 }else if(s.mid===4){
  if(stage<2){
   s.relays.forEach(r=>out.push({x:r.x,y:r.y,badge:(r.owner===C.side?'✓ 护盾锁 ':'◉ 护盾锁 ')+xy(r.x,r.y),tone:r.owner===C.side?'green':'cyan'}));
   out.push({x:4,y:0,badge:'◈ 赤巢内核 E8',tone:'red'});
  }else if(stage===2){
   if(g)out.push({x:4,y:1,badge:'◉ 抵近E8点击固守断链',tone:'gold'},{x:4,y:0,badge:'⚡ 待断链内核 E8',tone:'red'});
   else s.relays.forEach(r=>out.push({x:r.x,y:r.y,badge:'◉ 占领并点击固守 '+xy(r.x,r.y),tone:'red'}));
  }else if(stage===3){
   out.push({x:4,y:0,badge:g?'◉ 攻入摧毁内核 E8':'◈ 死守内核 E8',tone:'red'});
  }
 }
 return out;
}

/* 3. Render On-Board Tactical Vector Arrows & Mission Marker Lock-On Reticles */
function renderBoardDeductionLayer(b){
 const surround=b.closest('.board-surround');if(!surround)return;
 let layer=$('board-deduction-layer');
 if(!layer){
  layer=document.createElement('div');
  layer.id='board-deduction-layer';
  layer.className='board-deduction-layer';
  layer.setAttribute('aria-hidden','true');
  surround.append(layer);
 }
 const inCinema=!$('cinema').hidden;
 const flipped=C.side==='r';
 const toScreen=(x,y)=>({
  sx:flipped?7-x:x,
  sy:flipped?7-y:y,
  px:((flipped?7-x:x)+0.5)*12.5,
  py:((flipped?7-y:y)+0.5)*12.5
 });

 const markers=(inCinema&&sandtableActiveFrame?.markers)?sandtableActiveFrame.markers:(!inCinema?activeGameplayMarkers(S):[]);
 let svgArrows='';
 let badgesHtml='';

 if(inCinema&&sandtableActiveFrame?.stageStep==='map'){
  badgesHtml+=`<div class="sandtable-map-scan-banner">◈ 8×8 战区全息地形已展开 · 作战单位即将逐一降临</div>`;
 }

 for(const m of markers){
  if(typeof m.x!=='number'||typeof m.y!=='number')continue;
  const dst=toScreen(m.x,m.y);
  const tone=m.tone||'cyan';
  if(Array.isArray(m.from)&&m.from.length===2){
   const src=toScreen(m.from[0],m.from[1]);
   const strokeColor=tone==='red'?'#ff4a6b':tone==='gold'?'#ffcc4d':tone==='green'?'#42e89b':'#54d6ff';
   svgArrows+=`
    <line x1="${src.px}" y1="${src.py}" x2="${dst.px}" y2="${dst.py}" class="deduction-vector-glow" stroke="${strokeColor}" />
    <line x1="${src.px}" y1="${src.py}" x2="${dst.px}" y2="${dst.py}" class="deduction-vector-line" stroke="${strokeColor}" marker-end="url(#vec-arrow-${tone})" />
    <circle cx="${src.px}" cy="${src.py}" r="1.4" fill="${strokeColor}" />`;
  }
  const edgeClass=dst.py<18?'edge-top':dst.py>82?'edge-bottom':'';
  const sideClass=dst.px<18?'edge-left':dst.px>82?'edge-right':'';
  badgesHtml+=`
   <div class="deduction-marker ${tone} ${inCinema?'cinema-marker':'gameplay-marker'} ${edgeClass} ${sideClass}" style="left:${dst.px}%;top:${dst.py}%">
    <span class="deduction-reticle"><i></i></span>
    <span class="deduction-badge">${esc(m.badge)}</span>
   </div>`;
 }

 layer.innerHTML=`
  <svg class="deduction-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
   <defs>
    <marker id="vec-arrow-cyan" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#54d6ff"/></marker>
    <marker id="vec-arrow-gold" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#ffcc4d"/></marker>
    <marker id="vec-arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#ff4a6b"/></marker>
    <marker id="vec-arrow-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#42e89b"/></marker>
   </defs>
   ${svgArrows}
  </svg>
  ${badgesHtml}`;
}

const protocolBoard=renderBoard;
renderBoard=function(){
 protocolBoard();
 const b=$('board');if(!b||!S)return;
 const sector=S.subOpSector||({0:'dock',1:'garden',2:'bridge',3:'archive',4:'reactor'}[S.mid||0])||'dock';
 b.dataset.sector=sector;
 if(typeof window.__redrawSpace3D==='function')window.__redrawSpace3D();
 if(S.subOpName){
  const chap=$('chapter-name');
  if(chap)chap.textContent=S.subOpName;
 }

 // Progressive Unit Materialization & On-Board Speech Staging during Sandtable Cinema
 const inCinema=!$('cinema').hidden;
 if(inCinema){
  const f=sandtableActiveFrame;
  const focusX=Array.isArray(f?.focusCell)?f.focusCell[0]:null;
  const focusY=Array.isArray(f?.focusCell)?f.focusCell[1]:null;
  const speakerUnit=f?.who?S.units.find(u=>u.char===f.who&&onBoard(u)):null;

  b.querySelectorAll('.cell').forEach(cell=>{
   const cx=+cell.dataset.x,cy=+cell.dataset.y;
   const u=unitAt(S,cx,cy);
   const token=cell.querySelector('.token');
   if(sandtableRevealed instanceof Set){
    cell.classList.remove('legal','capture','selected','danger');
   }
   if(u&&token&&sandtableRevealed instanceof Set){
    if(!sandtableRevealed.has(u.uid)){
     token.classList.add('token-pending-arrival');
    }else if(sandtableJustArrived instanceof Set&&sandtableJustArrived.has(u.uid)){
     token.classList.add('token-just-arrived');
     cell.classList.add('cell-just-arrived');
     cell.insertAdjacentHTML('beforeend',`<span class="unit-arrival-beam ${u.side}"></span><span class="unit-arrival-ring ${u.side}"></span>`);
    }
   }
   const isFocused=(focusX===cx&&focusY===cy)||(speakerUnit&&speakerUnit.x===cx&&speakerUnit.y===cy&&(!sandtableRevealed||sandtableRevealed.has(speakerUnit.uid)));
   if(isFocused){
    cell.classList.add('cell-speaker-focus');
    if(u&&(!sandtableRevealed||sandtableRevealed.has(u.uid))){
     cell.insertAdjacentHTML('beforeend',`<span class="board-speech-callout ${u.side}">◈ ${esc(nameOf(u))} · ${xy(cx,cy)}</span>`);
    }
   }
  });
 }

 // Render Mission Marker Choreography & Vector Arrows Layer
 renderBoardDeductionLayer(b);

 const chosen=S.units.find(u=>u.uid===selected&&onBoard(u));if(!chosen)return;
 b.querySelectorAll('.cell.capture').forEach(cell=>{
  const target=unitAt(S,+cell.dataset.x,+cell.dataset.y),mode=captureMode(chosen,target);
  cell.dataset.captureMode=mode;
  cell.insertAdjacentHTML('beforeend',`<span class="resolution-pill ${mode}">${mode==='infect'?'永久寄生':'击杀'}</span>`);
 });
 if(chosen.side===C.side&&!chosen.used)$('board-hint').textContent+=chosen.kind==='spider'&&chosen.side==='r'?' · 机娘目标：永久寄生':' · 吃子：击杀，不会解救';
};

const protocolDossier=renderDossier;
renderDossier=function(){
 protocolDossier();
 const u=S?.units.find(v=>v.uid===selected&&onBoard(v))||movers(S,C.side).find(v=>v.char)||movers(S,C.side)[0];if(!u)return;
 const parasite=u.kind==='spider'&&u.side==='r';
 const text=parasite?'仅赤蛛能永久感染机娘（胸口正中植入发光红蜘蛛）。寄生换位后本阶段双方锁定；没有解救。':'吃到敌方单位直接击杀。机娘、哨卫、信使都不能感染，也不能解救受控者。';
 const dControls=$('dossier').querySelector('.dossier-controls');
 if(dControls){
  dControls.insertAdjacentHTML('beforebegin',`<p class="capture-law ${parasite?'infect':''}"><b>${parasite?'唯一感染执行器':'致命吃子'}</b>${text}</p>`);
  if(u.char&&typeof PERSONA!=='undefined'&&PERSONA[u.char]){
   const p=PERSONA[u.char];
   dControls.insertAdjacentHTML('beforebegin',`
    <div class="dossier-persona-box ${u.side}">
     <div class="persona-tag-line"><span>${p.archetype}</span><b>${p.weapon}</b></div>
     <p>${u.side==='r'?p.psychInfected:p.psychClean}</p>
     <small>${p.bonds?.[0]||''}</small>
    </div>`);
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
 box.innerHTML=`<div class="capture-face">${face}</div><div class="capture-copy"><span>${infect?'NEURAL OVERWRITE / IRREVERSIBLE':'TARGET ELIMINATED / NO CONVERSION'}</span><strong>${infect?'永久寄生':'击杀'} · ${esc(target.name)}</strong><small>${infect?'红蜘蛛已锁死胸口正中，双眸同步亮红，无法解救。':'载体永久损毁，不会转换阵营。'}</small><em>${infect?'刚被寄生单位本阶段锁定':'死亡状态跨章保留'}</em></div>`;
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
 if(old){C.flags.legacyCaptureHistory=true;persist();toast('旧档状态已保留；从现在起只有赤蛛能感染，其他吃子直接击杀，无法解救。');}
};
const protocolCasefile=showCasefile;
showCasefile=function(){protocolCasefile();$('modal-content').insertAdjacentHTML('afterbegin','<div class="manual-note"><b>不可逆感染</b>：停产只阻止新增感染，不会治愈已受控者。拆除装置、普通攻击和停机都不能把红方角色变回守护者。死者不会在后续章节重新部署。</div>');};
caseButton.onclick=showCasefile;
const protocolHelp=showHelp;
showHelp=function(){protocolHelp();$('modal-content').insertAdjacentHTML('afterbegin','<div class="manual-note lethal-note"><b>新规则：只有红蜘蛛能控制；没有解救。</b><br>普通机娘、哨卫、哨塔、信使与运输器的攻击都会击杀目标，哪怕对方是你曾经的同伴。受控机娘也只有击杀能力，不能继续感染别人。旧版双向夺控已取消。</div>');};
$('help-btn').onclick=showHelp;$('home-rules-btn').onclick=showHelp;
$('home').querySelector('.prototype-tag').textContent='DIRECTOR EDITION · 18 OPERATORS';
$('hero-identity').textContent=homeSide==='g'?'未感染 / 只有赤蛛能改写阵营':'不可逆感染 / RED HIVE CONTROL';
if(location.hash==='#qa')Object.assign(window.__MV_QA__,{
 captureMode(attacker,target){return captureMode(S.units.find(u=>u.uid===attacker),S.units.find(u=>u.uid===target));},
 hypothetical(m){const before=clone(S),test=clone(S),ev=applyBasic(test,m);return{before,after:test,event:ev};}
});
