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

 window.__M24__={statsOf,searchGM,triggerTacticalHint,get elo(){return aiEloTier;},setElo(v){aiEloTier=v;}};
})();
