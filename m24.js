/* ===== M24 · GRANDMASTER AI, ZERO-POPUP COMBAT, 3-TIER GROWTH & DYNAMIC STORY BRANCHES =====
   1) Zero-Popup Clean Movement: suppresses floating move/bubble popups on the board; routes barks to HUD radio.
   2) 3-Tier Sync (SYNC I / II / III) + 4-Stat Growth (MOB / ATK / SYN / PERK) + Overclock Blitz + Spider Predator Leap.
   3) Juicy Combat VFX: weapon beams/slashes, combo chains, hit-stop, and Grandmaster Tactical Hint.
   4) Chess.com-style Grandmaster AI: Transposition Table + Killer/History heuristics + Multi-budget combo search.
   5) Expanded Interlude Mission Types (Both Factions), Character-State Story Branches & Mid-Battle Climax Choices.
*/
(function(){
 'use strict';
 const isQA=()=>location.hash==='#qa'||(typeof qaSilent!=='undefined'&&qaSilent);
 const isFilmTest=()=>location.hash==='#filmtest';
 if(isFilmTest())document.body.classList.add('m24-filmtest');

 /* =========================================================================
    1. ZERO-POPUP CLEAN MOVEMENT & SELECTION
    ========================================================================= */
 // Suppress floating bubbles during normal gameplay; route character lines to the static radio bar
 try{
  if(typeof BUB17!=='undefined'&&BUB17){
   const origSay=BUB17.say;
   const origConvo=BUB17.convo;
   BUB17.say=function(id,text,opt={}){
    if(isFilmTest())return origSay.apply(this,arguments);
    if(!text)return null;
    try{
     const nm=(typeof CHAR!=='undefined'&&CHAR[id]&&CHAR[id].name)||id||'战术频道';
     if(typeof radio==='function')radio(nm,String(text));
    }catch(e){}
    return null;
   };
   BUB17.convo=async function(lines){
    if(isFilmTest())return origConvo.apply(this,arguments);
    if(!Array.isArray(lines)||!lines.length)return false;
    try{
     const [id,text]=lines[0];
     const nm=(typeof CHAR!=='undefined'&&CHAR[id]&&CHAR[id].name)||id||'战术频道';
     if(typeof radio==='function'&&text)radio(nm,String(text));
    }catch(e){}
    return true;
   };
  }
  if(typeof filmCombatSub==='function'){
   const origSub=filmCombatSub;
   filmCombatSub=function(name,line,side){
    if(isFilmTest())return origSub.apply(this,arguments);
    try{if(typeof radio==='function'&&line)radio(name||'战术频道',String(line));}catch(e){}
   };
  }
  if(typeof showCombatBark==='function'){
   showCombatBark=function(u,actionType,coordText,customLine){
    if(!u||isQA())return;
    try{
     const b1=$('combat-bark-banner');if(b1){b1.hidden=true;b1.classList.remove('show');}
     const b2=$('capture-event');if(b2){b2.classList.remove('show');}
     liveMoveVector=null;
     if(customLine&&typeof radio==='function'){
      radio(u.char?CHAR[u.char].name:(u.side==='r'?'赤巢蛛皇':nameOf(u)),customLine);
     }
    }catch(e){}
   };
  }
 }catch(e){console.warn('m24 popup clean',e);}

 /* =========================================================================
    2. CHARACTER 4-STAT GROWTH, SYNC III OVERCLOCK & SPIDER PREDATOR EVOLUTION
    ========================================================================= */
 const PERKS24={
  lyra:{name:'统帅超频领域',desc:'2格内友军射程+1；破敌/夺点触发超频连动'},
  akira:{name:'高周波破阵斩',desc:'直线贯通压制；击杀敌军触发超频再动'},
  lark:{name:'折翼曲率闪袭',desc:'无视阻挡跃迁；侧翼突袭触发超频再动'},
  veil:{name:'超视距死神锁',desc:'全屏对角封锁；狙杀目标触发超频再动'},
  misa:{name:'反应堆超载炮',desc:'隔障重炮轰击；占领终端立即刷新行动'},
  noct:{name:'中枢架构奇点',desc:'长日字跃迁+全向近防；超频连斩就绪'},
  iris:{name:'巡骑连跳共振',desc:'同向连跳追猎；高同步下解锁近身8向机动'},
  sera:{name:'白翼斜向裁决',desc:'直走斜吃战术机动；破敌刷新行动'},
  vega:{name:'苍澜重盾壁垒',desc:'全向近防+直线突进；固守终端强化全队'},
  ruby:{name:'隔山电浆重炮',desc:'超远隔子轰击；击杀高价值目标刷新行动'},
  june:{name:'斑马曲率急袭',desc:'3×2超远奇袭；深入敌后获得额外机动'},
  psalm:{name:'折线狮鹫巡航',desc:'先斜后直广域封锁；超频状态下步幅+1'},
  kuro:{name:'暗影越障潜行',desc:'斜向越障刺杀；斩首后触发暗影连动'},
  sola:{name:'跃空熔核重拳',desc:'跳击震荡破甲；连续击杀触发熔核超频'},
  celia:{name:'圣盾骑士冲锋',desc:'直行护卫+马步策应；夺点触发圣盾再动'},
  nyx:{name:'深渊处刑双刃',desc:'斜向滑行+横竖跳斩；处刑后刷新行动'},
  astra:{name:'超导磁轨狙击',desc:'超远直线穿刺；远程狙杀触发超频再动'},
  echo:{name:'量子折跃残响',desc:'八向二格折跃；折跃夺点或破敌可再动'}
 };

 function ensureRosterStats(id){
  if(!C||!C.roster||!C.roster[id])return null;
  const r=C.roster[id];
  if(typeof r.kills24!=='number')r.kills24=0;
  if(typeof r.steps24!=='number')r.steps24=0;
  if(typeof r.relays24!=='number')r.relays24=0;
  return r;
 }

 function hiveEvoLevel(s){
  if(!s)return 0;
  const conv=(s.flags&&s.flags.conversionsR?s.flags.conversionsR.length:0)+((typeof C!=='undefined'&&C&&C.stats&&C.stats.conversions)||0);
  const rel=s.relays?s.relays.filter(r=>r.owner==='r').length:0;
  const rBonus=(typeof C!=='undefined'&&C&&C.side==='r'&&s.round>=2)?1:0;
  return Math.min(3,conv+rel+rBonus);
 }

 function statsOf(u,s){
  s=s||S;
  if(!u)return{tier:1,xp:0,mob:1,atk:1,syn:100,perkTitle:'战术单元',perkDesc:'标准制式作战单元'};
  if(!u.char){
   if(u.kind==='spider'&&u.side==='r'){
    const evo=Math.max(u.xp||0,hiveEvoLevel(s));
    const tier=evo>=2?3:evo>=1?2:1;
    return{
     tier,xp:evo*2,
     mob:tier,atk:tier,syn:100+evo*65,
     perkTitle:tier>=2?'🕸️ 捕食跃击 · 母巢超频':'🕸️ 胸口寄生执行器',
     perkDesc:tier>=2?'已进化：可向2格内机娘直接扑跃寄生，感染返还行动额度':'扑中机娘时融进胸口正中并将其永久转化为赤巢容器'
    };
   }
   return{tier:1,xp:u.xp||0,mob:1,atk:1,syn:100,perkTitle:defOf(u).role||'战术机械',perkDesc:defOf(u).rule||''};
  }
  const r=(typeof C!=='undefined'&&C&&C.roster&&C.roster[u.char])||{};
  const xp=Math.max(u.xp||0,r.xp||0);
  const kills=(u.kills24||0)+(r.kills24||0);
  const steps=(u.steps24||0)+(r.steps24||0);
  const tier=xp>=4?3:xp>=2?2:1;
  const mob=xp>=3||steps>=6?3:xp>=1||steps>=2?2:1;
  const atk=kills>=2||xp>=4?3:kills>=1||xp>=2?2:1;
  const syn=Math.min(300,100+xp*45+kills*30+Math.min(40,steps*5));
  const pk=PERKS24[u.char]||{name:'高阶神经同步',desc:'破敌与占点可触发超频连动'};
  const infected=u.side==='r';
  return{
   tier,xp,mob,atk,syn,
   perkTitle:(infected?'【赤蛛共鸣】':'【觉醒特质】')+pk.name,
   perkDesc:pk.desc
  };
 }

 // Extend friendlyAdjacent when synergy is high (radius 2 for SYNC II+ units in live play)
 const baseFriendlyAdj=friendlyAdjacent;
 friendlyAdjacent=function(s,u,id){
  if(baseFriendlyAdj(s,u,id))return true;
  if(isQA()||!u||!s||!s.units)return false;
  if((u.xp||0)>=2){
   return s.units.some(v=>onBoard(v)&&v.char===id&&v.side===u.side&&v.uid!==u.uid&&Math.max(Math.abs(v.x-u.x),Math.abs(v.y-u.y))<=2);
  }
  return false;
 };

 // Extend legalMoves for SYNC III Overclock & Red Spider Predator Leap (outside #qa)
 const baseLegalMoves=legalMoves;
 legalMoves=function(s,u,mode='move'){
  const out=baseLegalMoves(s,u,mode);
  if(isQA()||!s||!u||!onBoard(u)||u.kind==='core')return out;
  const threat=mode==='threat';
  const seen=new Set(out.map(m=>key(m.x,m.y)));
  function tryAdd(x,y,attackAllowed=true,moveAllowed=true){
   if(blocked(s,x,y))return false;
   const target=unitAt(s,x,y),k=key(x,y);
   if(threat){
    if(attackAllowed&&!seen.has(k)){out.push({uid:u.uid,x,y,target:target?.uid||null,capture:!!target,type:'move'});seen.add(k);}
   }else if(target){
    if(target.side!==u.side&&attackAllowed&&!(target.kind==='core'&&shielded(s))&&!seen.has(k)){
     out.push({uid:u.uid,x,y,target:target.uid,capture:true,type:'move'});seen.add(k);
    }
   }else if(moveAllowed&&!seen.has(k)){
    out.push({uid:u.uid,x,y,target:null,capture:false,type:'move'});seen.add(k);
   }
   return !target;
  }

  // A) Red Spider Predator Leap (when playing Red Hive or spider is evolved)
  if(u.kind==='spider'&&u.side==='r'){
   const playerIsHive=typeof C!=='undefined'&&C&&C.side==='r';
   const evo=Math.max(u.xp||0,playerIsHive?hiveEvoLevel(s):0);
   if(evo>=1&&!threat){
    const dirs=evo>=2?DIR8:DIR4;
    const girls=s.units.filter(v=>onBoard(v)&&v.char&&v.side==='g');
    for(const[dx,dy]of dirs){
     const mx=u.x+dx,my=u.y+dy,tx=u.x+dx*2,ty=u.y+dy*2;
     if(blocked(s,tx,ty)||blocked(s,mx,my))continue;
     const midU=unitAt(s,mx,my),destU=unitAt(s,tx,ty);
     // Can pounce 2 tiles directly onto a Guardian girl if midpoint is empty
     if(!midU&&destU&&destU.char&&destU.side==='g'){
      tryAdd(tx,ty,true,false);
     }else if(!midU&&!destU&&playerIsHive&&girls.some(g=>distance({x:tx,y:ty},g)<distance(u,g)&&distance(u,g)<=4)){
      // Predator dash toward nearby prey
      tryAdd(tx,ty,false,true);
     }
    }
   }
   return out;
  }

  // B) SYNC III (xp >= 4) Overclock Movement Expansion for Mecha Girls
  if(u.char&&(u.xp||0)>=4){
   const mv=CHAR[u.char]?.move;
   if(['queen','rook','valkyrie','lancer','paladin'].includes(mv)){
    const dirs=mv==='queen'?DIR8:mv==='valkyrie'?DIAG:DIR4;
    const extraRange=mv==='queen'?4:mv==='rook'?6:4;
    for(const[dx,dy]of dirs){
     for(let n=1;n<=extraRange;n++){
      const x=u.x+dx*n,y=u.y+dy*n;
      if(blocked(s,x,y))break;
      const clear=tryAdd(x,y);
      if(!clear)break;
     }
    }
   }
   // All SYNC III mecha girls unlock full 8-direction 1-tile close-quarters tactical step
   for(const[dx,dy]of DIR8)tryAdd(u.x+dx,u.y+dy,true,true);
  }
  return out;
 };

 /* =========================================================================
    3. JUICY COMBAT VFX, WEAPON TRAJECTORIES & OVERCLOCK BLITZ CHAIN
    ========================================================================= */
 function drawWeaponTrajectory(fromPos,toPos,u,mode){
  try{
   if(!fromPos||!toPos||(fromPos.x===toPos.x&&fromPos.y===toPos.y))return;
   if(typeof FX18==='undefined'||!FX18.cellCenter)return;
   const a=FX18.cellCenter(fromPos.x,fromPos.y),b=FX18.cellCenter(toPos.x,toPos.y);
   if(!a||!b)return;
   const isRed=u&&u.side==='r';
   const colors=mode==='infect'?['#ff2a55','#ff7597','#ffe0e6']:isRed?['#ff4d6d','#ff9ebb','#fde047']:['#38bdf8','#a5f3fc','#fde047'];
   const steps=10;
   for(let i=1;i<=steps;i++){
    const t=i/steps;
    const px=a.x+(b.x-a.x)*t,py=a.y+(b.y-a.y)*t;
    setTimeout(()=>{
     FX18.burst(px,py,colors,mode==='infect'?7:5,2.2,0.55,2.8,0);
    },i*14);
   }
  }catch(e){}
 }

 function playComboChord(combo){
  try{
   if(typeof AUD18==='undefined'||!AUD18.play)return;
   AUD18.play(combo>=2?'objective':'commit');
  }catch(e){}
 }

 const m24BasePerformMove=performMove;
 performMove=async function(m,isPlayer){
  if(!S||S.outcome)return;
  const u=S.units.find(v=>v.uid===m.uid);
  const fromPos=u?{x:u.x,y:u.y}:null;
  const targetBefore=m.capture?unitAt(S,m.x,m.y):null;
  const modeBefore=u&&targetBefore?captureMode(u,targetBefore):null;
  const relaysBefore=S.relays?S.relays.map(r=>r.owner):[];
  const xpBefore=u?u.xp||0:0;

  if(u&&m.capture&&fromPos&&!isQA()){
   drawWeaponTrajectory(fromPos,{x:m.x,y:m.y},u,modeBefore);
  }

  const res=await m24BasePerformMove.apply(this,arguments);

  try{
   // Always clear any residual liveMoveVector popup
   liveMoveVector=null;
   const b1=$('combat-bark-banner');if(b1){b1.hidden=true;b1.classList.remove('show');}
   const b2=$('capture-event');if(b2){b2.classList.remove('show');}

   if(!S||S.outcome||!u||isQA())return res;

   const didRelay=S.relays&&S.relays.some((r,idx)=>r.owner!==relaysBefore[idx]&&r.owner===u.side);
   const didCapture=!!m.capture;
   const didInfect=modeBefore==='infect';

   // Update persistent growth stats
   if(m.type!=='wait'){
    u.steps24=(u.steps24||0)+1;
    if(u.char){const rec=ensureRosterStats(u.char);if(rec)rec.steps24++;}
    // Every 3 tactical moves grants +1 XP
    if(u.char&&u.steps24%3===0){
     u.xp=(u.xp||0)+1;
     if(C.roster&&C.roster[u.char])C.roster[u.char].xp=Math.max(C.roster[u.char].xp||0,u.xp);
    }
   }
   if(didRelay){
    u.xp=(u.xp||0)+1;
    if(u.char){
     const rec=ensureRosterStats(u.char);
     if(rec){rec.relays24++;rec.xp=Math.max(rec.xp||0,u.xp);}
    }
   }
   if(didCapture){
    u.kills24=(u.kills24||0)+1;
    u.xp=(u.xp||0)+(didInfect?2:1);
    if(u.char){
     const rec=ensureRosterStats(u.char);
     if(rec){rec.kills24++;rec.xp=Math.max(rec.xp||0,u.xp);}
    }
   }

   const c=typeof FX18!=='undefined'&&FX18.cellCenter?FX18.cellCenter(u.x,u.y):null;
   // Check Sync Tier Upgrade notification (in-board float text, no popup)
   const tierBefore=xpBefore>=4?3:xpBefore>=2?2:1;
   const tierAfter=(u.xp||0)>=4?3:(u.xp||0)>=2?2:1;
   if(tierAfter>tierBefore&&c){
    FX18.ring(c.x,c.y,'#fde047',12,3.4);
    FX18.floatText(c.x,c.y-28,tierAfter===3?'★ SYNC III · 超频觉醒!':'▲ SYNC II · 走法进化!','#fde047',true);
    playComboChord(2);
   }

   // Combo & Overclock Blitz Chain for Player
   if(isPlayer&&(didCapture||didRelay)){
    S.combo24=(S.combo24||0)+1;
    if(S.combo24>=2&&c){
     const label=S.combo24===2?'🔥 二连破阵 · DOUBLE CHAIN!':`👑 ${S.combo24}连绝杀 · MASTER CHAIN!`;
     FX18.floatText(c.x,c.y-46,label,'#fef08a',true);
     playComboChord(S.combo24);
    }

    // Overclock Blitz: SYNC II+ character gets 1 free follow-up action per phase on capture/relay!
    const actorNow=S.units.find(v=>onBoard(v)&&(v.uid===u.uid||(didInfect&&targetBefore&&v.char===targetBefore.char)));
    if(actorNow&&actorNow.char&&(actorNow.xp||0)>=2&&!actorNow.blitzUsed24&&!actorNow.controlLocked){
     actorNow.blitzUsed24=true;
     actorNow.used=false;
     S.spent=Math.max(0,S.spent-1);
     selected=actorNow.uid;
     if(c){
      FX18.ring(c.x,c.y,'#fde047',10,3.8);
      FX18.floatText(c.x,c.y-14,'⚡ 超频连斩 · 行动刷新!','#fde047',true);
     }
     radio(nameOf(actorNow),'神经超频已触发——本次行动不计消耗，可立即再次出击！');
     render();
    }else if(didInfect&&C.side==='r'&&S.round24Blitz!==S.round){
     // Red Hive Frenzy: infecting a girl refunds 1 action budget and refreshes another spider if available!
     S.round24Blitz=S.round;
     S.spent=Math.max(0,S.spent-1);
     const restingSpider=S.units.find(v=>onBoard(v)&&v.kind==='spider'&&v.side==='r'&&v.used);
     if(restingSpider)restingSpider.used=false;
     if(c){
      FX18.ring(c.x,c.y,'#ff3b5c',14,3.8);
      FX18.floatText(c.x,c.y-14,'🕸️ 母巢狂潮 · 额度返还!','#ff9aac',true);
     }
     radio('赤巢蛛皇','完美寄生！母巢神经网共鸣，返还 1 点行动额度！');
     render();
    }
   }
  }catch(e){console.warn('m24 postMove',e);}
  return res;
 };

 // Reset blitz flags at the end of each phase
 const m24BaseEndPhase=endPhase;
 endPhase=async function(){
  if(S){
   S.combo24=0;
   for(const u of S.units)u.blitzUsed24=false;
  }
  return await m24BaseEndPhase.apply(this,arguments);
 };

 /* =========================================================================
    4. DOSSIER 4-STAT GROWTH PANEL & TOKEN BADGES
    ========================================================================= */
 const m24BaseTokenHTML=tokenHTML;
 tokenHTML=function(u){
  let html=m24BaseTokenHTML.apply(this,arguments);
  try{
   if(!u||isQA())return html;
   const st=statsOf(u,S);
   if(u.char&&st.tier===3){
    html=html.replace('<span class="token-level">SYNC II</span>','<span class="token-level sync3">SYNC III★</span>')
             .replace('<span class="token-level">II</span>','<span class="token-level sync3">III★</span>');
   }else if(u.kind==='spider'&&u.side==='r'&&st.tier>=2){
    html=html.replace('</span></span>',`</span><span class="token-level">${st.tier===3?'皇蛛III':'跃击II'}</span></span>`);
   }
   if(u.char&&(u.xp||0)>=2&&!u.used&&!u.blitzUsed24&&u.side===(C&&C.side)){
    html=html.replace('class="token ','class="token m24-blitz-active ');
   }
  }catch(e){}
  return html;
 };

 const m24BaseDossier=renderDossier;
 renderDossier=function(){
  const r=m24BaseDossier.apply(this,arguments);
  try{
   const box=$('dossier');if(!box||!S)return r;
   const u=S.units.find(v=>v.uid===selected&&onBoard(v))||movers(S,C.side).find(v=>v.char)||movers(S,C.side)[0];
   if(!u)return r;
   const st=statsOf(u,S);
   // Update sync badge in dossier header
   const roleSmall=box.querySelector('.dossier-role small');
   if(roleSmall&&u.char){
    roleSmall.textContent=st.tier===3?`SYNC III ★ (XP ${st.xp})`:st.tier===2?`SYNC II (XP ${st.xp}/4)`:`SYNC I (XP ${st.xp}/2)`;
   }
   // Inject compact 4-stat growth panel before movement-info or dossier-controls
   if(!box.querySelector('.m24-growth-panel')){
    const anchor=box.querySelector('.movement-info')||box.querySelector('.dossier-controls');
    if(anchor){
     const mobPct=Math.round((st.mob/3)*100);
     const atkPct=Math.round((st.atk/3)*100);
     const synPct=Math.round(((st.syn-100)/200)*100);
     const tierPct=Math.round((st.tier/3)*100);
     const panel=document.createElement('div');
     panel.className=`m24-growth-panel ${u.side}`;
     panel.innerHTML=`
      <div class="m24-stat-cell ${st.tier>=3?'max':''}">
       <div class="m24-stat-head"><span>阶位</span><b>S-${st.tier}</b></div>
       <div class="m24-stat-bar"><i style="width:${tierPct}%"></i></div>
      </div>
      <div class="m24-stat-cell ${st.mob>=3?'max':''}">
       <div class="m24-stat-head"><span>机动</span><b>Lv.${st.mob}</b></div>
       <div class="m24-stat-bar"><i style="width:${mobPct}%"></i></div>
      </div>
      <div class="m24-stat-cell ${st.atk>=3?'max':''}">
       <div class="m24-stat-head"><span>威能</span><b>Lv.${st.atk}</b></div>
       <div class="m24-stat-bar"><i style="width:${atkPct}%"></i></div>
      </div>
      <div class="m24-stat-cell ${st.syn>=260?'max':''}">
       <div class="m24-stat-head"><span>同步</span><b>${st.syn}%</b></div>
       <div class="m24-stat-bar"><i style="width:${Math.max(15,synPct)}%"></i></div>
      </div>
      <div class="m24-perk-line" title="${esc(st.perkDesc)}"><strong>${esc(st.perkTitle)}</strong>${esc(st.perkDesc)}</div>
     `;
     anchor.before(panel);
    }
   }
  }catch(e){console.warn('m24 dossier',e);}
  return r;
 };

 /* =========================================================================
    5. CHESS.COM GRANDMASTER-STYLE TACTICAL AI ENGINE (TT + Killer + History + PVS)
    ========================================================================= */
 let aiEloTier=2600; // 1600 (Tactical), 2100 (Master), 2600 (Grandmaster)
 const TT=new Map();
 const killers={};
 const historyTable={};

 function hashBoard(s,toMove,left){
  let h=`${s.mid}|${s.round}|${toMove}|${left}|${s.quest?s.quest.stage:0}|`;
  for(const u of s.units){
   if(!u.dead&&!u.escaped)h+=`${u.uid}:${u.side}${u.x}${u.y}${u.used?1:0}${u.xp||0};`;
  }
  if(s.relays)for(const r of s.relays)h+=`R${r.x}${r.y}${r.owner||'n'}`;
  return h;
 }

 function moveKey(m){return `${m.uid}:${m.x},${m.y},${m.type||'m'}`;}

 function tacticalEval24(s,side){
  let sc=goalPositionScore(s,side);
  const opp=enemyOf(side);
  const myThreats=threatMap(s,side);
  const oppThreats=threatMap(s,opp);
  const hz=imminentHazard(s);
  const sh=shielded(s);

  let myPower=0,oppPower=0,forkBonus=0;
  for(const u of s.units){
   if(!onBoard(u))continue;
   const k=key(u.x,u.y);
   const val=valueOf(u)*14+(u.char&&(u.xp||0)>=2?18:0);
   if(u.side===side){
    myPower+=val;
    if(hz.includes(k))sc-=val*2.8;
    if(oppThreats.has(k)&&!(u.kind==='core'&&sh)){
     const defended=myThreats.has(k);
     const isGirlThreatenedBySpider=u.char&&side==='g'&&s.units.some(sp=>onBoard(sp)&&sp.kind==='spider'&&sp.side==='r'&&distance(sp,u)<=2);
     sc-=isGirlThreatenedBySpider?val*1.95:(defended?val*0.52:val*1.25);
    }
    // Check forks (1 unit threatening 2+ enemy pieces)
    if(!u.used){
     const capTargets=legalMoves(s,u).filter(m=>m.capture);
     if(capTargets.length>=2)forkBonus+=28*capTargets.length;
    }
   }else{
    oppPower+=val;
    if(myThreats.has(k)&&!(u.kind==='core'&&sh)){
     const isInfectTarget=u.char&&opp==='g'&&side==='r';
     sc+=isInfectTarget?val*1.45:val*0.65;
    }
   }
  }
  sc+=(myPower-oppPower)+forkBonus;
  if(s.kind23&&typeof K23!=='undefined'&&K23[s.kind23]&&K23[s.kind23].ev){
   sc+=(side==='g'?1:-1)*K23[s.kind23].ev(s,side);
  }
  return sc;
 }

 function orderedMoves24(s,side,ply,ttMoveKey){
  const list=[];
  const opp=enemyOf(side);
  const oppThreats=threatMap(s,opp);
  for(const u of movers(s,side)){
   if(u.used)continue;
   const tg=strategicTarget(s,u);
   const moves=legalMoves(s,u);
   for(const m of moves){
    const mk=moveKey(m);
    let order=0;
    if(mk===ttMoveKey)order+=10000;
    if(m.capture){
     const victim=unitAt(s,m.x,m.y);
     const mode=victim?captureMode(u,victim):'kill';
     order+=2000+(victim?valueOf(victim)*(mode==='infect'?32:16):10)-valueOf(u);
    }else{
     if(killers[ply]&&(killers[ply][0]===mk||killers[ply][1]===mk))order+=900;
     order+=(historyTable[mk]||0);
     if(tg)order+=(distance(u,tg)-distance(m,tg))*14;
     if(s.relays&&s.relays.some(r=>r.x===m.x&&r.y===m.y&&r.owner!==side))order+=180;
     if(s.exits&&s.exits.some(e=>e.x===m.x&&e.y===m.y&&e.side===side))order+=220;
     if(oppThreats.has(key(u.x,u.y))&&!oppThreats.has(key(m.x,m.y)))order+=160;
     if(oppThreats.has(key(m.x,m.y)))order-=140;
    }
    list.push({m,mk,order});
   }
  }
  list.sort((a,b)=>b.order-a.order);
  return list;
 }

 const baseChooseAI24=chooseAI;
 function searchGM(s,side,customMs){
  const budgetMs=customMs||(aiEloTier>=2600?360:aiEloTier>=2100?180:70);
  const maxDepth=aiEloTier>=2600?6:aiEloTier>=2100?4:2;
  const baseMove=baseChooseAI24(s,side);
  if(aiEloTier<=1600)return baseMove;

  const t0=performance.now(),deadline=t0+budgetMs;
  const left0=Math.max(1,(s.aiBudget||2)-(s.aiDone||0));
  const phaseCap=Math.max(1,Math.min(3,s.aiBudget||2));
  let nodes=0;
  const TIMEOUT={};

  function cloneFast(state){
   const L=state.logs,E=state.events;
   state.logs=[];state.events=[];
   const c=clone(state);
   state.logs=L;state.events=E;
   return c;
  }

  function nextTurnState(state,curSide,left){
   if(left>0&&movers(state,curSide).some(u=>!u.used))return[curSide,left];
   const nxt=enemyOf(curSide);
   for(const u of state.units)if(u.side===nxt)u.used=false;
   return[nxt,phaseCap];
  }

  function quiesce(state,toMove,alpha,beta,qDepth){
   const standPat=tacticalEval24(state,side);
   const maximizing=toMove===side;
   if(qDepth<=0)return standPat;
   if(maximizing){
    if(standPat>=beta)return beta;
    if(standPat>alpha)alpha=standPat;
   }else{
    if(standPat<=alpha)return alpha;
    if(standPat<beta)beta=standPat;
   }
   const caps=orderedMoves24(state,toMove,99,null).filter(x=>x.m.capture).slice(0,4);
   for(const c of caps){
    const nxt=cloneFast(state);
    applyBasic(nxt,c.m);
    const score=quiesce(nxt,enemyOf(toMove),alpha,beta,qDepth-1);
    if(maximizing){
     if(score>alpha)alpha=score;
     if(alpha>=beta)break;
    }else{
     if(score<beta)beta=score;
     if(alpha>=beta)break;
    }
   }
   return maximizing?alpha:beta;
  }

  function pvs(state,toMove,left,depth,ply,alpha,beta){
   if((++nodes&31)===0&&performance.now()>deadline)throw TIMEOUT;
   if(state.outcome||depth<=0)return quiesce(state,toMove,alpha,beta,1);

   const hKey=hashBoard(state,toMove,left);
   const ttEntry=TT.get(hKey);
   if(ttEntry&&ttEntry.depth>=depth){
    if(ttEntry.flag==='EXACT')return ttEntry.score;
    if(ttEntry.flag==='LOWER'&&ttEntry.score>alpha)alpha=ttEntry.score;
    else if(ttEntry.flag==='UPPER'&&ttEntry.score<beta)beta=ttEntry.score;
    if(alpha>=beta)return ttEntry.score;
   }

   const moves=orderedMoves24(state,toMove,ply,ttEntry?ttEntry.bestKey:null).slice(0,depth>=3?10:7);
   if(!moves.length)return tacticalEval24(state,side);

   const maximizing=toMove===side;
   let bestScore=maximizing?-Infinity:Infinity;
   let bestKey=moves[0].mk;
   const alphaOrig=alpha,betaOrig=beta;

   for(let i=0;i<moves.length;i++){
    const {m,mk}=moves[i];
    const nxt=cloneFast(state);
    applyBasic(nxt,m);
    const u=nxt.units.find(v=>v.uid===m.uid);if(u)u.used=true;
    const [ns,nl]=nextTurnState(nxt,toMove,left-1);
    const sc=pvs(nxt,ns,nl,depth-1,ply+1,alpha,beta);
    if(maximizing){
     if(sc>bestScore){bestScore=sc;bestKey=mk;}
     if(sc>alpha)alpha=sc;
    }else{
     if(sc<bestScore){bestScore=sc;bestKey=mk;}
     if(sc<beta)beta=sc;
    }
    if(alpha>=beta){
     if(!m.capture){
      killers[ply]=killers[ply]||[null,null];
      if(killers[ply][0]!==mk){killers[ply][1]=killers[ply][0];killers[ply][0]=mk;}
      historyTable[mk]=(historyTable[mk]||0)+depth*depth*10;
     }
     break;
    }
   }

   if(TT.size>12000)TT.clear();
   const flag=bestScore<=alphaOrig?'UPPER':bestScore>=betaOrig?'LOWER':'EXACT';
   TT.set(hKey,{depth,score:bestScore,flag,bestKey});
   return bestScore;
  }

  const rootCands=orderedMoves24(s,side,0,null).slice(0,12);
  if(!rootCands.length)return baseMove;
  let bestMove=baseMove||rootCands[0].m;

  for(let d=2;d<=maxDepth;d++){
   try{
    let curBest=bestMove,curScore=-Infinity;
    for(const cand of rootCands){
     const nxt=cloneFast(s);
     applyBasic(nxt,cand.m);
     const u=nxt.units.find(v=>v.uid===cand.m.uid);if(u)u.used=true;
     const [ns,nl]=nextTurnState(nxt,side,left0-1);
     const sc=pvs(nxt,ns,nl,d-1,1,-Infinity,Infinity);
     cand.lastScore=sc;
     if(sc>curScore){curScore=sc;curBest=cand.m;}
    }
    rootCands.sort((a,b)=>(b.lastScore||0)-(a.lastScore||0));
    bestMove=curBest;
    if(performance.now()>t0+budgetMs*0.62)break;
   }catch(e){
    if(e!==TIMEOUT)break;
    break;
   }
  }
  return bestMove||baseMove;
 }

 chooseAI=function(s,side){
  if(isQA()&&!window.__AI22QA)return baseChooseAI24(s,side);
  try{
   return searchGM(s,side)||baseChooseAI24(s,side);
  }catch(e){
   return baseChooseAI24(s,side);
  }
 };

 /* =========================================================================
    6. TOOLBAR CONTROLS: AI STRENGTH (ELO) SWITCH & GRANDMASTER TACTICAL HINT
    ========================================================================= */
 let hintMove24=null,hintTimer24=null;
 function triggerTacticalHint(){
  if(!S||S.outcome||S.phase!=='player'||busy)return;
  const best=searchGM(S,C.side,240);
  if(!best){radio('战术推演','当前无可行动单位，请结束阶段。');return;}
  const u=S.units.find(v=>v.uid===best.uid);
  if(!u)return;
  hintMove24={from:{x:u.x,y:u.y},to:{x:best.x,y:best.y},uid:u.uid};
  selected=u.uid;
  renderBoard();
  renderDossier();
  const fromCell=document.querySelector(`#board .cell[data-x="${u.x}"][data-y="${u.y}"]`);
  const toCell=document.querySelector(`#board .cell[data-x="${best.x}"][data-y="${best.y}"]`);
  fromCell?.classList.add('m24-hint-from');
  toCell?.classList.add('m24-hint-to');
  const target=unitAt(S,best.x,best.y);
  const actDesc=target?(captureMode(u,target)==='infect'?`扑击寄生【${nameOf(target)}】`:`击杀【${nameOf(target)}】`):`推进至 ${xy(best.x,best.y)}`;
  radio('宗师推演引擎',`建议最优手：【${nameOf(u)}】 ${xy(u.x,u.y)} → ${xy(best.x,best.y)}（${actDesc}）`);
  try{sfx('select');}catch(e){}
  clearTimeout(hintTimer24);
  hintTimer24=setTimeout(()=>{
   hintMove24=null;
   document.querySelectorAll('.m24-hint-from,.m24-hint-to').forEach(el=>el.classList.remove('m24-hint-from','m24-hint-to'));
  },3600);
 }

 function mountToolbar24(){
  const tb=document.querySelector('.board-toolbar');
  if(!tb||tb.querySelector('.m24-toolbar-group'))return;
  const grp=document.createElement('div');
  grp.className='m24-toolbar-group';
  grp.innerHTML=`
   <button type="button" class="m24-elo-btn" id="m24-elo-btn" title="切换敌方 AI 搜索引擎强度（国际象棋 α-β 引擎）">♟ AI: 宗师 2600</button>
   <button type="button" class="m24-hint-btn" id="m24-hint-btn" title="调用宗师级 α-β 搜索引擎推演当前最优走法">⚡ 大师推演</button>
  `;
  tb.appendChild(grp);
  const eloBtn=$('m24-elo-btn');
  eloBtn.onclick=()=>{
   aiEloTier=aiEloTier===2600?2100:aiEloTier===2100?1600:2600;
   const label=aiEloTier===2600?'♟ AI: 宗师 2600':aiEloTier===2100?'♟ AI: 大师 2100':'♟ AI: 战术 1600';
   eloBtn.textContent=label;
   radio('系统',`AI 战术引擎已切换至【${label.replace('♟ ','')}】（置换表 + 杀手启发 + 迭代加深 α-β）。`);
  };
  $('m24-hint-btn').onclick=triggerTacticalHint;
 }
 mountToolbar24();

 /* =========================================================================
    7. M24-2: DIVERSE INTERLUDE MISSIONS (BOTH FACTIONS), CHARACTER-STATE
       STORY BRANCHES & MID-BATTLE CLIMAX CHOICES
    ========================================================================= */
 const nm24=id=>(typeof CHAR!=='undefined'&&CHAR[id]&&CHAR[id].name)||id||'她';
 const pick24=arr=>arr[Math.floor(Math.random()*arr.length)];
 const shuf24=arr=>arr.slice().sort(()=>Math.random()-0.5);

 function ensureM24State(){
  if(!C)return null;
  if(!C.m24)C.m24={interludes:{},incidents:{},climax:{},usedTypes:[],branchFlags:{}};
  return C.m24;
 }

 function activeGirls(side){
  if(!C||!C.roster)return[];
  return Object.keys(C.roster).filter(id=>C.roster[id].introduced&&C.roster[id].status==='active'&&C.roster[id].side===side);
 }

 // A) Mid-Battle Climax Choices (小关大关发展→高潮→抉择)
 const CLIMAX_SCENES={
  0:{
   title:'接驳甲板 · 临界抉择',
   shots:(side)=>{
    const lead=activeGirls(side)[0]||(side==='g'?'lyra':'lark');
    return[
     {bg:'film_corridor',kb:'in',tint:side==='r'?'red':'dark',fx:'alert',stamp:'A–01 临界点',mode:'narr',line:'接驳走廊的隔离闸门正在落下，信使与主中继的争夺进入白热化。'},
     side==='g'
      ?{who:lead,side:'g',line:'指挥官，主电容器还能最后超载一次！是直接给全队主武器超频，还是封死侧翼通风井并呼叫护卫？',choices:[
        {label:'⚡ 全队神经超频（主力直达 SYNC II+）',detail:'',action:()=>{for(const u of movers(S,'g'))if(u.char){u.xp=Math.max(2,(u.xp||0)+1);u.used=false;if(C.roster[u.char])C.roster[u.char].xp=u.xp;}render();}},
        {label:'🛡️ 启动重装防卫哨塔（部署轨道哨塔助战）',detail:'',action:()=>{spawn(S,'sentinel','g',3,5);spawn(S,'drone','g',4,5);render();}}
       ]}
      :{who:'overmind',line:'她们的火线出现了一道裂口。现在，让孩子们扑上去，还是唤醒甲板底层的皇卫赤蛛？',choices:[
        {label:'🕸️ 母巢神经狂潮（全体赤蛛进化捕食跃击）',detail:'',action:()=>{for(const u of movers(S,'r')){u.xp=Math.max(2,(u.xp||0)+1);u.used=false;}render();}},
        {label:'🕷️ 破壳突袭（前线额外孵化 2 只赤蛛）',detail:'',action:()=>{spawn(S,'spider','r',2,2);spawn(S,'spider','r',5,2);render();}}
       ]}
    ];
   }
  },
  1:{
   title:'玻璃花园 · 临界抉择',
   shots:(side)=>{
    const lead=activeGirls(side)[0]||(side==='g'?'misa':'veil');
    return[
     {bg:'film_garden',kb:'in',tint:side==='r'?'red':'dark',fx:'alert',stamp:'B–04 冷却失控',mode:'narr',line:'生物冷却环的玻璃穹顶开始结霜，培育台周围的神经脉冲达到峰值。'},
     side==='g'
      ?{who:lead,side:'g',line:'冷却阀压力见顶了！我们可以将多余能量导入全队机甲推进器，或者在培育台周围架设电磁护栏！',choices:[
        {label:'⚡ 推进器极限超频（主力升至 SYNC III 觉醒）',detail:'',action:()=>{for(const u of movers(S,'g').slice(0,2))if(u.char){u.xp=Math.max(4,(u.xp||0)+2);u.used=false;if(C.roster[u.char])C.roster[u.char].xp=u.xp;}render();}},
        {label:'🔒 培育台电磁封锁（延迟泄压并部署哨塔）',detail:'',action:()=>{S.ventStart=(S.ventStart||3)+2;spawn(S,'sentinel','g',4,5);render();}}
       ]}
      :{who:'overmind',line:'温室里的养分已经足够。要让受控的孩子们彻底觉醒，还是让孢子布满整座花园？',choices:[
        {label:'🌺 容器深渊觉醒（受控机娘直达 SYNC III★）',detail:'',action:()=>{for(const u of movers(S,'r'))if(u.char){u.xp=Math.max(4,(u.xp||0)+2);u.used=false;if(C.roster[u.char])C.roster[u.char].xp=u.xp;}render();}},
        {label:'🕷️ 苗床暴走孵化（中路涌出 2 只捕食赤蛛）',detail:'',action:()=>{const a=spawn(S,'spider','r',3,2),b=spawn(S,'spider','r',4,2);if(a)a.xp=2;if(b)b.xp=2;render();}}
       ]}
    ];
   }
  },
  2:{
   title:'断轨天桥 · 临界抉择',
   shots:(side)=>{
    const lead=activeGirls(side)[0]||(side==='g'?'akira':'lark');
    return[
     {bg:'film_bridge',kb:'in',tint:side==='r'?'red':'dark',fx:'alert shake',stamp:'C–07 轨道崩解',mode:'narr',line:'地球的引力在脚下咆哮，方舟密钥的护送进入最后的生死竞速。'},
     side==='g'
      ?{who:lead,side:'g',line:'天桥结构快撑不住了！给我最高超频权限，我带队直接杀穿中轴线！或者启动备用磁力索稳住桥面！',choices:[
        {label:'⚔️ 破阵决死突击（全员刷新行动 + 同步提升）',detail:'',action:()=>{for(const u of movers(S,'g'))if(u.char){u.xp=Math.max(3,(u.xp||0)+1);u.used=false;}render();}},
        {label:'🧲 启动磁力锚索（坍塌延后2轮 + 空投护卫）',detail:'',action:()=>{S.collapseAt=(S.collapseAt||5)+2;spawn(S,'sentinel','g',3,5);render();}}
       ]}
      :{who:'overmind',line:'不要让密钥离开这座桥。切断她们的退路，或者让我的孩子们直接扑上去！',choices:[
        {label:'🕸️ 猎群合围（赤蛛升级跃击 + 前锋刷新行动）',detail:'',action:()=>{for(const u of movers(S,'r')){u.xp=Math.max(2,(u.xp||0)+1);u.used=false;}render();}},
        {label:'💥 震碎桥面侧翼（提前召唤轨道哨塔截击）',detail:'',action:()=>{spawn(S,'sentinel','r',3,2);spawn(S,'spider','r',4,2);render();}}
       ]}
    ];
   }
  },
  3:{
   title:'镜室叛歌 · 临界抉择',
   shots:(side)=>{
    const lead=activeGirls(side)[0]||(side==='g'?'lyra':'noct');
    return[
     {bg:'film_mirror',kb:'in',tint:side==='r'?'red':'dark',fx:'alert',stamp:'D–00 镜像共鸣',mode:'narr',line:'无数面镜子同时映出胸口闪烁的红光与蓝光，同步座的倒计时已经开始。'},
     side==='g'
      ?{who:lead,side:'g',line:'镜像库的算力正在汇集！我们可以将算力注入全队神经链路实现超频觉醒，或者投影出防卫屏障固守同步座！',choices:[
        {label:'★ 全员镜像觉醒（全队机娘升至 SYNC III★）',detail:'',action:()=>{for(const u of movers(S,'g'))if(u.char){u.xp=Math.max(4,(u.xp||0)+2);u.used=false;if(C.roster[u.char])C.roster[u.char].xp=u.xp;}render();}},
        {label:'🛡️ 镜像全息防线（在同步座旁部署2台重装哨塔）',detail:'',action:()=>{spawn(S,'sentinel','g',2,4);spawn(S,'sentinel','g',5,4);render();}}
       ]}
      :{who:'overmind',line:'镜子里的每一个倒影，都在呼唤我的名字。让这份共鸣彻底淹没她们！',choices:[
        {label:'👑 母巢王座共鸣（全体赤巢单位超频刷新）',detail:'',action:()=>{for(const u of movers(S,'r')){u.xp=Math.max(3,(u.xp||0)+1);u.used=false;}render();}},
        {label:'🕷️ 镜面折跃增援（在敌阵侧翼折跃2只皇卫赤蛛）',detail:'',action:()=>{const a=spawn(S,'spider','r',2,4),b=spawn(S,'spider','r',5,4);if(a)a.xp=2;if(b)b.xp=2;render();}}
       ]}
    ];
   }
  },
  4:{
   title:'赤巢零点 · 终局高潮抉择',
   shots:(side)=>{
    const lead=activeGirls(side)[0]||(side==='g'?'lyra':'noct');
    return[
     {bg:'film_core',kb:'in',tint:'red',fx:'alert shake',stamp:'Ω–00 终焉时刻',mode:'narr',line:'母巢反应堆的轰鸣声震耳欲聋，地球轨道就在脚下，这是决定所有人命运的最后抉择。'},
     side==='g'
      ?{who:lead,side:'g',line:'全舰听令——解除所有神经同步限制器！哪怕烧毁回路，今天也要在这里终结赤巢！',choices:[
        {label:'🔥 苍穹终极解放（全员 SYNC III★ + 行动全部刷新）',detail:'',action:()=>{for(const u of movers(S,'g'))if(u.char){u.xp=Math.max(5,(u.xp||0)+2);u.used=false;if(C.roster[u.char])C.roster[u.char].xp=u.xp;}render();}},
        {label:'⚡ 轨道火力齐射（直接瘫痪外围2只赤蛛并部署哨塔）',detail:'',action:()=>{const sps=movers(S,'r').filter(u=>u.kind==='spider').slice(0,2);sps.forEach(sp=>{sp.used=true;});spawn(S,'sentinel','g',3,5);spawn(S,'sentinel','g',4,5);render();}}
       ]}
      :{who:'overmind',line:'黎明就在眼前。孩子们，向她们展示新世界的诞生！',choices:[
        {label:'👑 赤巢神罚降临（全体受控机娘与赤蛛升至满阶并刷新）',detail:'',action:()=>{for(const u of movers(S,'r')){u.xp=Math.max(5,(u.xp||0)+2);u.used=false;}render();}},
        {label:'🕸️ 无尽母巢狂潮（核心周围立即孵化 3 只皇卫赤蛛）',detail:'',action:()=>{[[2,1],[4,1],[6,1]].forEach(([x,y])=>{const sp=spawn(S,'spider','r',x,y);if(sp)sp.xp=3;});render();}}
       ]}
    ];
   }
  }
 };

 // Trigger Climax Choice on Round 3 start in main missions (outside #qa / #filmtest)
 const m24ClimaxEndPhase=endPhase;
 endPhase=async function(){
  const r=await m24ClimaxEndPhase.apply(this,arguments);
  try{
   if(!isQA()&&!isFilmTest()&&S&&!S.outcome&&!S.kind23&&!S.saga&&S.phase==='player'&&S.round===3&&!S.climax24Done){
    const cs=CLIMAX_SCENES[S.mid];
    if(cs&&typeof FILM!=='undefined'&&!FILM.active){
     S.climax24Done=true;
     FILM.play(cs.shots(C.side),()=>{try{render();}catch(e){}},{chapter:cs.title});
    }
   }
  }catch(e){console.warn('m24 climax',e);}
  return r;
 };

 // B) Character-State Dependent Story Branches in Chapter Openings
 if(typeof filmIntro==='function'){
  const m24BaseFilmIntro=filmIntro;
  filmIntro=function(mid){
   const shots=m24BaseFilmIntro.apply(this,arguments)||[];
   try{
    if(isQA()||!C||!S||S.kind23||S.saga)return shots;
    const extra=[];
    const gAlive=activeGirls('g');
    const rTaken=activeGirls('r');
    const destroyed=Object.keys(C.roster||{}).filter(id=>C.roster[id].status==='destroyed');
    const aces=Object.keys(C.roster||{}).filter(id=>C.roster[id].introduced&&C.roster[id].status==='active'&&(C.roster[id].xp||0)>=3);

    // Branch 1: Ace Awakening Character Scene (if a character has grown to high XP)
    if(aces.length&&mid>=1){
     const ace=aces[0];
     if(C.side==='g'&&C.roster[ace].side==='g'){
      extra.push(
       {bg:'film_cabin',tint:'cold',kb:'in',stamp:'角色成长分支 · 超频突破',who:ace,side:'g',line:`指挥官，我的神经同步率已经突破了安全阈值（XP ${C.roster[ace].xp}）。这一战，请把最危险的战线交给我。`}
      );
     }else if(C.side==='r'&&C.roster[ace].side==='r'){
      extra.push(
       {bg:'film_overmind',tint:'red',kb:'in',stamp:'使徒进化分支 · 深渊同调',who:ace,side:'r',line:`母巢……胸口的红蜘蛛已经和我的心跳完全重合了。现在的我，比在苍穹防线时更强。`}
      );
     }
    }

    // Branch 2: Bond Partner Infected / Fallen Dynamic Branch Choice (once per chapter)
    if(mid>=1&&!S.branchIntro24){
     S.branchIntro24=true;
     for(const gId of gAlive){
      const bonds=(typeof BW_BOND!=='undefined'&&BW_BOND[gId])||[];
      const infectedBond=bonds.find(b=>rTaken.includes(b));
      const fallenBond=bonds.find(b=>destroyed.includes(b));
      if(C.side==='g'&&infectedBond){
       extra.push(
        {bg:'film_corridor',tint:'dark',kb:'in',stamp:`羁绊分支 · ${nm24(gId)}与${nm24(infectedBond)}`,who:gId,side:'g',line:`雷达上有${nm24(infectedBond)}的信号……她胸口的红色控制器还在发报。指挥官，如果遇到她，我们该怎么办？`,choices:[
         {label:`⚡ 优先压制周围赤蛛，给${nm24(gId)}注入超频算力`,detail:'',action:()=>{const u=S.units.find(v=>v.char===gId);if(u){u.xp=Math.max(3,(u.xp||0)+2);if(C.roster[gId])C.roster[gId].xp=u.xp;}}},
         {label:`🛡️ 全员结成严密防线，额外部署1台护卫哨卫`,detail:'',action:()=>{spawn(S,'drone','g',3,6);}}
        ]}
       );
       break;
      }else if(C.side==='g'&&fallenBond){
       extra.push(
        {bg:'film_cabin',tint:'cold',kb:'in',stamp:`遗志分支 · 铭记${nm24(fallenBond)}`,who:gId,side:'g',line:`我把${nm24(fallenBond)}留下的识别牌挂在了驾驶舱里。放心吧，她的那一份火力，由我来打出去。`}
       );
       const u=S.units.find(v=>v.char===gId);if(u)u.xp=Math.max(2,(u.xp||0)+1);
       break;
      }
     }
    }

    if(extra.length){
     let idx=shots.findIndex(s=>s&&s.objective);
     if(idx<0)idx=shots.length;
     shots.splice(idx,0,...extra);
    }
   }catch(e){console.warn('m24 intro branch',e);}
   return shots;
  };
 }

 // C) Register 4 Additional Diverse Interlude Missions into K23 (Siege, Heist, Awakening, Blackout)
 // Works seamlessly with hive23.js interlude runner AND adds Guardian interlude support!
 try{
  if(typeof K23!=='undefined'&&K23){
   // 6 · 反应堆死守 (Siege / Survival & Counter-Blitz, Faction-Aware)
   K23.siege={
    win:'hold',w:2,base:2,name:'熔心死守',en:'REACTOR SIEGE',where:'B–09 副反应堆核心',bg:'film_core',
    cond:()=>activeGirls('g').length>=2,
    setup(){return{gs:shuf24(activeGirls('g')).slice(0,3),ts:shuf24(activeGirls('r')).slice(0,2)};},
    build(d){
     const s=makeMission(1);
     s.mid=1;s.units=[];s.walls=['2,3','5,3','2,5','5,5'];s.voids=[];s.loot=[];s.exits=[];s.delivery=[];
     const defOwner=C.side;
     s.relays=[{x:3,y:3,owner:defOwner,name:'D5 熔心锁'},{x:4,y:3,owner:defOwner,name:'E5 熔心锁'}];
     s.subOp='m24_siege';s.subOpOpen=true;s.subOpName='熔心死守';s.where23='B–09 副反应堆核心';
     [[2,1],[5,1],[3,2],[4,2]].forEach(([x,y])=>spawn(s,'spider','r',x,y));
     d.ts.forEach((id,i)=>spawn(s,'mech','r',i===0?1:6,1,id));
     const gSlots=[[3,6],[4,6],[2,7]];
     d.gs.forEach((id,i)=>spawn(s,'mech','g',gSlots[i][0],gSlots[i][1],id));
     spawn(s,'sentinel','g',5,7);spawn(s,'drone','g',1,6);
     s.k23={hatch:7,limit:7};
     return s;
    },
    goals(s){
     const side=C.side,foe=enemyOf(side);
     const held=s.relays.filter(r=>r.owner===side).length;
     const fLeft=movers(s,foe).length;
     return[
      {text:`守住至少 1 座熔心锁直至第 7 轮末，或全歼/感染来袭敌军（剩余敌军 ${fLeft}）`,done:fLeft===0},
      {text:`当前控制的熔心锁：${held}/2（失守全部两座熔心锁则立即战败）`,done:held>=1}
     ];
    },
    check(s){
     const side=C.side,foe=enemyOf(side);
     if(s.relays.every(r=>r.owner===foe))return['lose','eggs'];
     if(movers(s,foe).length===0)return['win','infect'];
     return null;
    },
    survive:'hatch',
    ev(s){
     const gHeld=s.relays.filter(r=>r.owner==='g').length;
     return (gHeld-1)*180+(movers(s,'g').length-movers(s,'r').length)*25;
    },
    target(s,u){
     return s.relays.find(r=>r.owner!==u.side)||movers(s,enemyOf(u.side))[0]||null;
    },
    intro(d){
     const g0=d.gs[0]||'lyra';
     return[
      {bg:'film_core',kb:'in',tint:C.side==='r'?'red':'dark',stamp:'B–09 副反应堆核心',mode:'narr',line:'副反应堆的两座熔心锁正在高负荷运转，双方突击队在核心回廊迎头相撞。'},
      C.side==='g'
       ?{who:g0,side:'g',line:'守住 D5 和 E5 两座熔心锁！只要撑到第 7 轮脉冲释放，或者全歼来袭赤蛛，这片扇区就安全了！',choices:[
         {label:'⚡ 熔心算力注入（出战机娘升至 SYNC II+）',detail:'',action:()=>{for(const u of movers(S,'g'))if(u.char)u.xp=Math.max(2,(u.xp||0)+1);render();}},
         {label:'🛡️ 启动核心防卫塔（额外部署1台轨道哨塔）',detail:'',action:()=>{spawn(S,'sentinel','g',3,5);render();}}
        ]}
       :{who:'overmind',line:'守住熔心锁，或者把闯进来的她们全部留在这里。',choices:[
         {label:'🕸️ 过载熔心（全体赤蛛升至 SYNC II 捕食态）',detail:'',action:()=>{for(const u of movers(S,'r'))if(u.kind==='spider')u.xp=2;render();}},
         {label:'🛡️ 部署重装防线（在熔心锁旁增设1座轨道哨塔）',detail:'',action:()=>{spawn(S,'sentinel','r',3,1);render();}}
        ]},
      {bg:'film_core',kb:'out',tint:'dark',objective:{title:'熔心死守',where:'B–09 副反应堆核心'}}
     ];
    },
    after(s,res){
     const won=res==='hatch'||res==='infect';
     if(C.side==='g'){
      if(won){
       for(const id of activeGirls('g'))if(C.roster[id])C.roster[id].xp=Math.min(5,(C.roster[id].xp||0)+1);
       return[{mode:'narr',line:'副反应堆成功完成过载脉冲，敌群被一扫而空。'},{who:activeGirls('g')[0]||'lyra',side:'g',line:'防线稳住了！全队同步等级提升，准备接入下一章主战场！'}];
      }
      return[{mode:'narr',line:'副反应堆熔心锁失守，小队被迫撤往下一层。'}];
     }
     if(won){
      C.flags.brood22=Math.min(2,(C.flags.brood22||0)+1);
      return[{mode:'narr',line:'副反应堆的红光平稳跳动，来袭的小队被彻底瓦解。'},{who:'overmind',line:'算力保住了。下一战，我的孩子们会走得更快。'}];
     }
     return[{mode:'narr',line:'副反应堆被迫切入紧急冷却。'},{who:'overmind',line:'……暂时的退让。主反应堆还在我们手里。'}];
    }
   };

   // 7 · 双核夺密 (Twin-Core Heist / Loot Extraction Race, Faction-Aware)
   K23.heist={
    win:'through',w:2,base:2,name:'双核夺密',en:'TWIN BLACKBOX',where:'C–04 加密数据金库',bg:'film_mirror',
    cond:()=>activeGirls('g').length>=2,
    setup(){return{gs:shuf24(activeGirls('g')).slice(0,3),ts:shuf24(activeGirls('r')).slice(0,2)};},
    build(d){
     const s=makeMission(2);
     s.mid=2;s.units=[];s.walls=['1,3','6,3','3,4','4,4'];s.voids=[];s.relays=[];s.delivery=[];
     s.loot=[{id:'box1',name:'黑匣α',x:2,y:3,carrier:null,side:null,lost:false},{id:'box2',name:'黑匣β',x:5,y:3,carrier:null,side:null,lost:false}];
     s.exits=[{x:3,y:0,side:'r'},{x:4,y:0,side:'r'},{x:3,y:7,side:'g'},{x:4,y:7,side:'g'}];
     s.subOp='m24_heist';s.subOpOpen=true;s.subOpName='双核夺密';s.where23='C–04 加密数据金库';
     [[2,1],[5,1],[3,1],[4,1]].forEach(([x,y])=>spawn(s,'spider','r',x,y));
     d.ts.forEach((id,i)=>spawn(s,'mech','r',i===0?1:6,1,id));
     const gSlots=[[2,6],[5,6],[3,7]];
     d.gs.forEach((id,i)=>spawn(s,'mech','g',gSlots[i][0],gSlots[i][1],id));
     spawn(s,'drone','g',4,7);
     s.k23={limit:9};
     return s;
    },
    goals(s){
     const side=C.side,foe=enemyOf(side);
     const myGot=s.loot.some(l=>l.evacuated&&l.side===side);
     const fLeft=movers(s,foe).length;
     return[
      {text:`拾取任一加密黑匣并从己方撤离口脱出，或歼灭/感染敌方主力（${Math.min(s.round,9)}/9 轮）`,done:myGot||fLeft===0},
      {text:'阻止敌方将全部两枚黑匣带离战场',done:true}
     ];
    },
    check(s){
     const side=C.side,foe=enemyOf(side);
     if(s.loot.some(l=>l.evacuated&&l.side===side)||movers(s,foe).length===0||(side==='r'&&s.flags.conversionsR.length>=1))return['win','through'];
     if(s.loot.every(l=>l.evacuated&&l.side===foe))return['lose','escaped'];
     if(movers(s,side).length===0)return['lose','nospider'];
     return null;
    },
    timeout:'closed',
    ev(s){
     let v=0;
     for(const l of s.loot){
      if(l.evacuated&&l.side==='r')v-=600;
      if(l.evacuated&&l.side==='g')v+=600;
     }
     return v;
    },
    target(s,u){
     const freeLoot=s.loot.find(l=>!l.carrier&&!l.evacuated);
     if(freeLoot)return freeLoot;
     return s.exits.find(e=>e.side===u.side)||null;
    },
    intro(d){
     const g0=d.gs[0]||'iris';
     return[
      {bg:'film_mirror',kb:'in',tint:C.side==='r'?'red':'dark',stamp:'C–04 加密数据金库',mode:'narr',line:'金库中央悬浮着两枚未销毁的黑匣，里面记录着天穹站全员的神经特征码。'},
      {who:g0,side:'g',line:'绝不能让赤巢拿到神经特征码！抢下黑匣，立即撤回南侧气闸！'},
      {who:'overmind',line:'拿到特征码，或者直接把来抢黑匣的她变成我的孩子。'},
      {bg:'film_mirror',kb:'out',tint:'dark',objective:{title:'双核夺密',where:'C–04 加密数据金库'}}
     ];
    },
    after(s,res){
     const won=res==='through';
     if(won){
      for(const id of activeGirls(C.side))if(C.roster[id])C.roster[id].xp=Math.min(5,(C.roster[id].xp||0)+1);
      return[{mode:'narr',line:'加密黑匣已被成功解析，全队神经同步率获得突破。'}];
     }
     return[{mode:'narr',line:'金库气闸落下，黑匣争夺战告一段落。'}];
    }
   };

   // 9 · 胸甲共鸣审判 (Resonance Awakening Boss Duel)
   K23.awakening={
    win:'infect',w:2,base:3,name:'胸甲共鸣审判',en:'RESONANCE TRIAL',where:'D–05 共鸣审判庭',bg:'film_mirror',
    cond:()=>activeGirls('g').length>=2,
    setup(){return{gs:shuf24(activeGirls('g')).slice(0,3),ts:shuf24(activeGirls('r')).slice(0,2)};},
    build(d){
     const s=makeMission(3);
     s.mid=3;s.units=[];s.walls=['2,2','5,2','2,5','5,5'];s.voids=[];s.loot=[];s.exits=[];s.delivery=[];
     s.relays=[{x:3,y:3,owner:null,name:'D5 共鸣王座'},{x:4,y:4,owner:null,name:'E4 共鸣王座'}];
     s.subOp='m24_awakening';s.subOpOpen=true;s.subOpName='胸甲共鸣审判';s.where23='D–05 共鸣审判庭';
     d.gs.forEach((id,i)=>{const u=spawn(s,'mech','g',[3,2,5][i],6,id);if(u&&i===0)u.xp=Math.max(4,u.xp||0);});
     spawn(s,'sentinel','g',4,7);
     [[2,1],[3,1],[4,1],[5,1]].forEach(([x,y])=>{const sp=spawn(s,'spider','r',x,y);if(sp)sp.xp=2;});
     d.ts.forEach((id,i)=>{const u=spawn(s,'mech','r',i===0?1:6,1,id);if(u)u.xp=Math.max(4,u.xp||0);});
     s.k23={limit:8};
     return s;
    },
    goals(s){
     const side=C.side,foe=enemyOf(side);
     const rel=s.relays.filter(r=>r.owner===side).length;
     const fLeft=movers(s,foe).length;
     return[
      {text:`同时掌控 D5 与 E4 两座共鸣王座（${rel}/2），或击破/感染全部敌方主力（剩余 ${fLeft}）`,done:rel===2||fLeft===0},
      {text:'王牌主力已进入 SYNC III★ 超频觉醒状态，善用超频连斩破局',done:true}
     ];
    },
    check(s){
     const side=C.side,foe=enemyOf(side);
     if(s.relays.filter(r=>r.owner===side).length===2||movers(s,foe).length===0)return['win','infect'];
     if(movers(s,side).length===0)return['lose','nospider'];
     return null;
    },
    timeout:'closed',
    ev(s){
     return (s.relays.filter(r=>r.owner==='g').length-s.relays.filter(r=>r.owner==='r').length)*190;
    },
    target(s,u){
     return s.relays.find(r=>r.owner!==u.side)||movers(s,enemyOf(u.side))[0]||null;
    },
    intro(d){
     const g0=d.gs[0]||'lyra';
     return[
      {bg:'film_mirror',kb:'in',tint:C.side==='r'?'red':'dark',stamp:'D–05 共鸣审判庭',mode:'narr',line:'审判庭中央的两座共鸣王座正在放大所有机娘胸甲的神经信号。王牌与王牌的对决一触即发。'},
      {who:g0,side:'g',line:'我的超频回路已经全开了！拿下中央共鸣王座，一鼓作气击溃她们！'},
      {bg:'film_mirror',kb:'out',tint:'dark',objective:{title:'胸甲共鸣审判',where:'D–05 共鸣审判庭'}}
     ];
    },
    after(s,res){
     if(res==='infect'){
      for(const id of activeGirls(C.side))if(C.roster[id])C.roster[id].xp=Math.min(5,(C.roster[id].xp||0)+1);
      return[{mode:'narr',line:'共鸣王座的算力汇入全队，主力机娘完成了终极超频蜕变。'}];
     }
     return[{mode:'narr',line:'共鸣审判庭归于沉寂，双方撤出回廊。'}];
    }
   };

   // 8 · 极夜脉冲猎场 (EMP Blackout / Relay Illumination & Assassination)
   K23.blackout={
    win:'infect',w:2,base:3,name:'极夜脉冲猎场',en:'EMP BLACKOUT',where:'D–08 暗区走廊',bg:'film_corridor',
    cond:()=>activeGirls('g').length>=2,
    setup(){return{gs:shuf24(activeGirls('g')).slice(0,3),ts:shuf24(activeGirls('r')).slice(0,2)};},
    build(d){
     const s=makeMission(3);
     s.mid=3;s.units=[];s.walls=['3,2','4,2','3,5','4,5'];s.voids=[];s.loot=[];s.exits=[];s.delivery=[];
     s.relays=[{x:1,y:3,owner:null,name:'B5 照明信标'},{x:6,y:3,owner:null,name:'G5 照明信标'}];
     s.subOp='m24_blackout';s.subOpOpen=true;s.subOpName='极夜脉冲猎场';s.where23='D–08 暗区走廊';
     const playerSide=C.side;
     if(playerSide==='g'){
      d.gs.forEach((id,i)=>spawn(s,'mech','g',[2,5,3][i],6,id));
      spawn(s,'drone','g',4,6);
      [[1,1],[3,1],[4,1],[6,1],[2,2],[5,2]].forEach(([x,y])=>spawn(s,'spider','r',x,y));
      d.ts.forEach((id,i)=>spawn(s,'mech','r',i===0?0:7,1,id));
     }else{
      [[1,1],[3,1],[4,1],[6,1]].forEach(([x,y])=>spawn(s,'spider','r',x,y));
      d.ts.forEach((id,i)=>spawn(s,'mech','r',i===0?2:5,1,id));
      d.gs.forEach((id,i)=>spawn(s,'mech','g',[2,5,3][i],6,id));
      spawn(s,'sentinel','g',4,6);spawn(s,'drone','g',1,6);
     }
     s.k23={limit:8};
     return s;
    },
    goals(s){
     const side=C.side;
     const rel=s.relays.filter(r=>r.owner===side).length;
     const foes=movers(s,enemyOf(side)).length;
     return[
      {text:`占领 B5 与 G5 两座照明信标（${rel}/2），或歼灭/感染全部敌军（剩余 ${foes}）`,done:rel===2||foes===0},
      {text:`在第 8 轮极夜脉冲引爆前完成作战（${Math.min(s.round,8)}/8 轮）`,done:false}
     ];
    },
    check(s){
     const side=C.side;
     if(s.relays.filter(r=>r.owner===side).length===2||movers(s,enemyOf(side)).length===0)return['win','infect'];
     if(movers(s,side).length===0)return['lose','nospider'];
     return null;
    },
    timeout:'closed',
    ev(s){
     const gRel=s.relays.filter(r=>r.owner==='g').length;
     const rRel=s.relays.filter(r=>r.owner==='r').length;
     return (gRel-rRel)*160+(movers(s,'g').length-movers(s,'r').length)*35;
    },
    target(s,u){
     return s.relays.find(r=>r.owner!==u.side)||movers(s,enemyOf(u.side))[0]||null;
    },
    intro(d){
     const side=C.side,g0=d.gs[0]||'kuro';
     return[
      {bg:'film_corridor',kb:'in',tint:side==='r'?'red':'dark',stamp:'D–08 暗区走廊',mode:'narr',line:'主电源被切断，走廊陷入极夜。唯有两侧的照明信标还在闪烁微光。'},
      side==='g'
       ?{who:g0,side:'g',line:'黑暗里全是赤蛛的爬行声！点亮 B5 和 G5 两座照明信标，或者直接肃清走廊里的敌群！',choices:[
         {label:'⚡ 启动夜视超频（出战机娘全部升至 SYNC II+）',detail:'',action:()=>{for(const u of movers(S,'g'))if(u.char)u.xp=Math.max(2,(u.xp||0)+1);render();}},
         {label:'🛡️ 增派先导护卫（额外部署1台轨道哨塔）',detail:'',action:()=>{spawn(S,'sentinel','g',3,5);render();}}
        ]}
       :{who:'overmind',line:'黑暗是孩子们的猎场。在她们点亮两座信标之前，扑向她们的胸口！',choices:[
         {label:'🕸️ 暗夜急袭（全体赤蛛进化捕食跃击）',detail:'',action:()=>{for(const u of movers(S,'r'))if(u.kind==='spider')u.xp=2;render();}},
         {label:'🕷️ 阴影伏兵（在中路走廊额外唤出2只赤蛛）',detail:'',action:()=>{spawn(S,'spider','r',2,3);spawn(S,'spider','r',5,3);render();}}
        ]},
      {bg:'film_corridor',kb:'out',tint:'dark',objective:{title:'极夜脉冲猎场',where:'D–08 暗区走廊'}}
     ];
    },
    after(s,res){
     const won=res==='infect';
     if(C.side==='g'){
      if(won){
       for(const id of activeGirls('g'))if(C.roster[id])C.roster[id].xp=Math.min(5,(C.roster[id].xp||0)+1);
       return[{mode:'narr',line:'照明信标全功率点亮，暗区走廊的伏兵被彻底肃清。'},{who:activeGirls('g')[0]||'lyra',side:'g',line:'干得漂亮！全队神经同步率已记录提升，继续向下一层推进！'}];
      }
      return[{mode:'narr',line:'极夜脉冲爆发，小队被迫交替掩护后撤。'}];
     }
     if(won){
      C.flags.brood22=Math.min(2,(C.flags.brood22||0)+1);
      return[{mode:'narr',line:'最后一座照明信标熄灭了。黑暗彻底归于赤巢。'},{who:'overmind',line:'在黑暗里，她们连自己是谁都会忘记。'}];
     }
     return[{mode:'narr',line:'强光刺破了走廊，赤蛛群退回通风管道。'}];
    }
   };
  }
 }catch(e){console.warn('m24 k23 extend',e);}

 // D) Hook M24 Custom Interludes (siege / heist / blackout) into Mission Lifecycle for BOTH Factions
 function isM24Interlude(s){
  return s&&s.kind24&&K23[s.kind24];
 }

 function launchM24Interlude(kind){
  const def=K23[kind];if(!def)return false;
  const st24=ensureM24State();
  if(st24&&!st24.usedTypes.includes(kind))st24.usedTypes.push(kind);
  const data=def.setup();
  runId++;busy=false;undoStack=[];
  try{hideStory();}catch(e){}
  try{$('result').hidden=true;}catch(e){}
  S=def.build(data);
  S.kind24=kind;
  S.kind23=kind;
  S.data24=data;
  S.limit=S.k23?.limit||8;
  for(const u of S.units)if(u.char&&C.roster[u.char])C.roster[u.char].introduced=true;
  selected=movers(S,C.side).find(u=>u.char)?.uid||movers(S,C.side)[0]?.uid;
  addLog(`接入特殊行动区域：${def.where}。`,'good');
  checkpoint={c:clone(C),s:clone(S)};
  showGame();render();persist();
  const shots=[{title:{k:'SPECIAL INTERLUDE',m:def.name,s:def.where},hold:1600,sfx:'cut'},...def.intro(data).filter(Boolean)];
  FILM.play(typeof withDeploy==='function'?withDeploy(shots):shots,()=>{try{render();}catch(e){}},{chapter:`INTERLUDE / ${def.en}`});
  return true;
 }

 const HINT24={
  siege:'死守中央两座熔心锁，利用高同步单位的超频连斩反杀突袭敌军！',
  heist:'夺取中央加密黑匣并护送携带者抵达己方撤离口，或直接歼灭/感染敌方主力！',
  blackout:'极夜环境下迅速占领 B5 与 G5 两座照明信标即可直接锁定胜局！',
  awakening:'王牌主力已进入 SYNC III★ 超频觉醒态，掌控两座共鸣王座或击溃敌军！'
 };
 const m24BaseQuestHint=questHint;
 questHint=function(s){
  if(isM24Interlude(s)&&HINT24[s.kind24])return HINT24[s.kind24];
  return m24BaseQuestHint.apply(this,arguments);
 };

 const m24BaseObjectives=objectives;
 objectives=function(s,side){
  if(isM24Interlude(s)){
   return{main:K23[s.kind24].goals(s),extra:[]};
  }
  return m24BaseObjectives.apply(this,arguments);
 };

 const m24BaseCheckOutcome=checkOutcome;
 checkOutcome=function(){
  if(isM24Interlude(S)){
   if(S.outcome)return true;
   const r=K23[S.kind24].check(S);
   if(r){
    S.res24=r[1];
    resolveBattle(r[0]==='win',r[0]==='win'?'特殊作战目标已达成！':'特殊作战目标未达成，战线转移。');
    return true;
   }
   return false;
  }
  return m24BaseCheckOutcome.apply(this,arguments);
 };

 const m24BaseResolveEnv=resolveEnvironment;
 resolveEnvironment=function(){
  if(isM24Interlude(S)){
   const d=K23[S.kind24];
   if(checkOutcome())return true;
   if(d.survive&&S.round>=(S.k23?.hatch||7)){
    S.res24=d.survive;
    resolveBattle(true,'成功坚守至反应堆脉冲释放！');
    return true;
   }
   if(S.round>=(S.k23?.limit||8)){
    S.res24=d.timeout||'timeout';
    resolveBattle(false,'作战窗口耗尽。');
    return true;
   }
   return false;
  }
  return m24BaseResolveEnv.apply(this,arguments);
 };

 const m24BaseAdvance=advanceMission;
 advanceMission=function(){
  if(isM24Interlude(S)){
   const def=K23[S.kind24];
   const res=S.res24||(S.outcome&&S.outcome.won?def.win:def.timeout);
   $('result').hidden=true;
   let sh=[];
   try{sh=def.after(S,res,S.data24).filter(Boolean);}catch(e){}
   sh=sh.map((x,i)=>({bg:def.bg||'film_corridor',kb:i%2?'out':'in',tint:C.side==='r'?'red':'dark',...x}));
   S.kind24=null;S.kind23=null;
   persist();
   FILM.play(sh,()=>{nextMission();},{chapter:`AFTERGLOW / ${def.en}`});
   return;
  }
  return m24BaseAdvance.apply(this,arguments);
 };

 // Hook nextMission so Guardians ALSO get random interludes between chapters, and Red Hive can roll M24 interludes
 const m24BaseNextMission=nextMission;
 nextMission=function(){
  try{
   if(!isQA()&&!isFilmTest()&&C&&C.step<4&&!C.finished&&!(S&&S.saga)){
    const st24=ensureM24State();
    const gap=C.step;
    if(C.side==='g'&&st24&&!st24.interludes[gap]){
     st24.interludes[gap]=1;
     const pool=['siege','heist','blackout','awakening'].filter(k=>!st24.usedTypes.includes(k)&&K23[k]&&K23[k].cond());
     if(pool.length&&Math.random()<0.75){
      const pickKind=pick24(pool);
      persist();
      launchM24Interlude(pickKind);
      return;
     }
    }else if(C.side==='r'&&st24&&!st24.interludes[gap]){
     st24.interludes[gap]=1;
     const pool=['siege','heist','blackout','awakening'].filter(k=>!st24.usedTypes.includes(k)&&K23[k]&&K23[k].cond());
     if(pool.length&&Math.random()<0.55){
      if(C.p23&&C.p23.done)C.p23.done[gap]=1;
      const pickKind=pick24(pool);
      persist();
      launchM24Interlude(pickKind);
      return;
     }
    }
   }
  }catch(e){console.warn('m24 nextMission',e);}
  return m24BaseNextMission.apply(this,arguments);
 };

 window.__M24__={
  statsOf,searchGM,triggerTacticalHint,launchM24Interlude,
  get elo(){return aiEloTier;},setElo(v){aiEloTier=v;}
 };
 if(isFilmTest()&&window.__MV_FILM__){
  Object.assign(window.__MV_FILM__,{
   m24Launch:k=>launchM24Interlude(k),
   m24Hint:()=>triggerTacticalHint(),
   m24Stats:uid=>{const u=S&&S.units.find(v=>v.uid===uid||v.char===uid);return statsOf(u,S);}
  });
 }
})();


