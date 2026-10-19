/* ===== M26 — EMBEDDED FULL-BLEED 3D VIEWPORT, PROGRESSIVE PACING, SHAPED MAPS,
   LIVING DYNAMIC CARDS & BUTTERFLY EFFECT CAUSALITY SYSTEM ===== */
(function(){
 'use strict';
 if(typeof window==='undefined')return;

 const isQA=()=>location.hash==='#qa';
 const isFilmTest=()=>location.hash==='#filmtest';

 /* =========================================================================
    1. BUTTERFLY EFFECT ENGINE (C.butterfly — 前面影响后面，跨章因果连锁)
    ========================================================================= */
 function ensureButterfly(){
  if(!C)return null;
  if(!C.butterfly){
   C.butterfly={
    larkFate:null,        // 'saved' | 'infected' | 'fallen'
    courierFate:null,     // 'intercepted' | 'escaped'
    gardenFate:null,      // 'purified' | 'corrupted'
    misaFate:null,        // 'saved' | 'infected'
    bridgeKey:null,       // 'egis' | 'hive'
    mirrorChoice:null,    // 'mercy' | 'sever'
    zeroCasualtyCh1:false,
    echoes:[]             // [{ch, title, effect, side}]
   };
  }
  return C.butterfly;
 }

 function addButterflyEcho(ch,title,effect){
  const bf=ensureButterfly();if(!bf)return;
  if(!bf.echoes.some(e=>e.title===title)){
   bf.echoes.push({ch,title,effect});
  }
 }

 // Record butterfly consequences at the end of each battle
 const m26BaseResolveBattle=resolveBattle;
 resolveBattle=function(won,reason){
  try{
   if(C&&S&&!S.saga&&!S.kind23&&!S.kind24){
    const bf=ensureButterfly();
    const larkRec=C.roster?.lark;
    const misaRec=C.roster?.misa;
    if(S.mid===0){
     const larkUnit=S.units.find(u=>u.char==='lark');
     const larkInf=(larkUnit&&larkUnit.side==='r')||(larkRec&&larkRec.side==='r');
     const larkDead=(larkUnit&&larkUnit.dead)||(larkRec&&larkRec.status==='destroyed');
     if(larkInf){
      bf.larkFate='infected';
      addButterflyEcho(1,'折翼入巢','第一章璃雀被赤蛛寄生 → 后续章节她将作为「赤巢猎首」率伏兵倒戈阻击，零音解锁【孤狼决意】');
     }else if(larkDead){
      bf.larkFate='fallen';
      addButterflyEcho(1,'翠风绝响','第一章璃雀陨落 → 小队全员背负哀恸，开局同步率 +1');
     }else{
      bf.larkFate='saved';
      addButterflyEcho(1,'翠风生还','第一章成功护住璃雀 → 后续章节璃雀提前侦测赤蛛伏击并部署前哨信标');
     }
     if(S.flags.courierEscaped){
      bf.courierFate='escaped';
      addButterflyEcho(1,'信使脱逃','第一章载毒信使逃入深空 → 母巢解析走法，后续赤蛛群进化出高阶捕食蛛');
     }else{
      bf.courierFate='intercepted';
      addButterflyEcho(1,'截断信使','第一章成功截杀载毒信使 → 第二章温室泄压延后 1 轮，终章西护盾预破解');
     }
     const gLost=S.units.some(u=>u.char&&(u.dead||u.side==='r'));
     if(!gLost&&C.side==='g'){
      bf.zeroCasualtyCh1=true;
     }
    }else if(S.mid===1){
     const misaUnit=S.units.find(u=>u.char==='misa');
     if((misaUnit&&misaUnit.side==='r')||(misaRec&&misaRec.side==='r')){
      bf.misaFate='infected';
      addButterflyEcho(2,'工匠失守','第二章弥砂被红蜘蛛寄生 → 第三章天桥被赤巢菌丝腐蚀，坍塌提前');
     }else{
      bf.misaFate='saved';
      addButterflyEcho(2,'工匠护航','第二章保住弥砂 → 第三章天桥结构加固，外侧桥面延缓坍塌 2 轮');
     }
    }else if(S.mid===2){
     if(S.flags.delivered==='g'||C.flags.keyOwner==='g'){
      bf.bridgeKey='egis';
      addButterflyEcho(3,'方舟过桥','第三章成功护送方舟密钥 → 第四章镜室朔夜残存记忆共鸣，全队同步提升');
     }else{
      bf.bridgeKey='hive';
      addButterflyEcho(3,'密钥落入赤巢','第三章密钥被母巢截获 → 第四章镜室防御哨塔强化');
     }
    }
   }
  }catch(e){console.warn('m26 butterfly record',e);}
  return m26BaseResolveBattle.apply(this,arguments);
 };

 /* =========================================================================
    2. PROGRESSIVE CAMPAIGN PACING & DIVERSE SHAPED MAPS (由简入繁 + 异形地图)
    ========================================================================= */
 // Distinct non-rectangular map silhouettes per chapter & special mode
 const CHAPTER_MAP_SHAPES={
  // Ch1: Airlock Corridor (Narrow notched boarding corridor — intimate 3v3 opening)
  0:['0,0','0,1','7,1','0,3','7,3','0,5','0,6'],
  // Ch2: Octagonal Bio-Dome (Cut corners + central glass pit)
  1:['0,0','1,0','0,1','6,0','0,6','1,7','6,7','7,6','7,7','3,4'],
  // Ch3: Hourglass Twin-Bridge (Deep orbital chasm flanks + cut corners)
  2:['0,0','1,0','6,0','7,1','0,6','1,7','6,7','7,7'],
  // Ch4: Cruciform Mirror Sanctum (Diamond/Cross archive hall)
  3:['0,0','1,0','0,1','6,0','7,1','0,6','1,7','6,7','7,6','7,7'],
  // Ch5: Stepped Throne Citadel (Royal pyramid leading to Overmind Core)
  4:['0,0','1,0','6,0','0,1','7,1','0,4','7,4','0,6','7,6']
 };

 const SPECIAL_MAP_SHAPES={
  siege:['0,0','7,0','0,7','7,7','0,3','7,4'],
  heist:['0,0','1,0','6,0','7,0','0,7','1,7','6,7','7,7'],
  blackout:['0,0','7,0','3,3','4,4','0,7','7,7'],
  awakening:['0,0','1,0','0,1','6,0','7,0','7,1','0,6','0,7','1,7','6,7','7,6','7,7'],
  convoy:['0,1','0,2','0,5','0,6','7,1','7,2','7,5','7,6'],
  overload:['0,0','1,0','0,1','7,0','7,1','0,7','7,6','7,7'],
  quarantine:['0,0','1,0','6,0','7,0','0,1','7,1','0,6','7,6','0,7','1,7','6,7','7,7']
 };

 function applyMapShape26(s,voidList){
  if(!s||!Array.isArray(voidList))return;
  for(const k of voidList){
   if(s.voids.includes(k)||s.walls.includes(k))continue;
   const [x,y]=k.split(',').map(Number);
   if(unitAt(s,x,y))continue;
   if(s.relays&&s.relays.some(r=>r.x===x&&r.y===y))continue;
   if(s.exits&&s.exits.some(e=>e.x===x&&e.y===y))continue;
   if(s.delivery&&s.delivery.some(d=>d.x===x&&d.y===y))continue;
   if(s.loot&&s.loot.some(l=>l.x===x&&l.y===y))continue;
   s.voids.push(k);
  }
 }

 // Progressive Unit Cap per Chapter:
 // Ch1: 3 vs 3 (Simple, fast, tense intro!)
 // Ch2: 4 vs 4 (Medium squad + environment)
 // Ch3: 4+capsule vs 5 (Bridge escort)
 // Ch4: 5 vs 5 (Mirror sanctum)
 // Ch5: 6 vs 6 (Grand finale)
 const m26BaseMakeMission=makeMission;
 makeMission=function(id){
  const s=m26BaseMakeMission.apply(this,arguments);
  if(isQA()||s.saga||s.kind23||s.kind24||(typeof K23!=='undefined'&&K23.__building))return s;
  try{
   const bf=ensureButterfly();

   // 1) Progressive Unit Pacing: Trim overcrowded starting boards in early chapters!
   if(id===0){
    // CHAPTER 1: Intimate Vanguard Encounter!
    // Guardians deploy only Lyra, Akira, Lark (3 core heroes) onto the narrow airlock corridor
    const ch1KeepG=new Set(['lyra','akira','lark']);
    s.units=s.units.filter(u=>{
     if(u.side==='g'){
      if(u.kind==='drone'||u.kind==='sentinel')return false;
      if(u.char&&!ch1KeepG.has(u.char))return false;
     }
     return true;
    });
    // Position Lyra, Akira, Lark in a clean vanguard triangle near C4 uplink & south airlock
    const lyra=s.units.find(u=>u.char==='lyra');if(lyra){lyra.x=2;lyra.y=6;}
    const akira=s.units.find(u=>u.char==='akira');if(akira){akira.x=4;akira.y=6;}
    const lark=s.units.find(u=>u.char==='lark');if(lark){lark.side='g';lark.x=2;lark.y=5;}
    // Trim Red Spiders in Ch1: 2 spiders (+1 courier) when playing Guardian, 3 spiders (+1 courier) when playing Red Hive
    const maxSpiders=C.side==='r'?3:2;
    let spidersSeen=0;
    s.units=s.units.filter(u=>{
     if(u.side==='r'&&u.kind==='spider'){
      spidersSeen++;
      return spidersSeen<=maxSpiders;
     }
     return true;
    });
    const spList=s.units.filter(u=>u.side==='r'&&u.kind==='spider');
    if(spList[0]){spList[0].x=2;spList[0].y=2;}
    if(spList[1]){spList[1].x=5;spList[1].y=2;}
    if(spList[2]){spList[2].x=3;spList[2].y=1;}
   }else if(id===1){
    // CHAPTER 2: 4v4 Bio-Dome Expansion
    const priorityG=['lyra','misa','sera','akira','lark','iris','celia'];
    const gChars=s.units.filter(u=>u.side==='g'&&u.char);
    if(gChars.length>4){
     gChars.sort((a,b)=>priorityG.indexOf(a.char)-priorityG.indexOf(b.char));
     const keepSet=new Set(gChars.slice(0,4).map(u=>u.uid));
     s.units=s.units.filter(u=>!(u.side==='g'&&u.char&&!keepSet.has(u.uid)));
    }
    // Remove extra generic drone so the 4 mecha girls shine
    s.units=s.units.filter(u=>!(u.side==='g'&&u.kind==='drone'));
    // Cap Red Spiders at 3 in Ch2 (plus infected girls like Veil/Lark)
    let sp=0;
    s.units=s.units.filter(u=>{
     if(u.side==='r'&&u.kind==='spider'){sp++;return sp<=3;}
     return true;
    });
   }else if(id===2){
    // CHAPTER 3: 4 Guardians + Capsule vs 3 Spiders + Infected Hunters
    const priorityG=['lyra','akira','vega','astra','misa','lark','iris'];
    const gChars=s.units.filter(u=>u.side==='g'&&u.char);
    if(gChars.length>4){
     gChars.sort((a,b)=>priorityG.indexOf(a.char)-priorityG.indexOf(b.char));
     const keepSet=new Set(gChars.slice(0,4).map(u=>u.uid));
     s.units=s.units.filter(u=>!(u.side==='g'&&u.char&&!keepSet.has(u.uid)));
    }
    s.units=s.units.filter(u=>!(u.side==='g'&&u.kind==='drone'));
    let sp=0;
    s.units=s.units.filter(u=>{
     if(u.side==='r'&&u.kind==='spider'){sp++;return sp<=3;}
     return true;
    });
   }else if(id===3){
    // CHAPTER 4: 5 Guardians vs Red Hive Sanctum
    const gChars=s.units.filter(u=>u.side==='g'&&u.char);
    if(gChars.length>5){
     const keepSet=new Set(gChars.slice(0,5).map(u=>u.uid));
     s.units=s.units.filter(u=>!(u.side==='g'&&u.char&&!keepSet.has(u.uid)));
    }
    let sp=0;
    s.units=s.units.filter(u=>{
     if(u.side==='r'&&u.kind==='spider'){sp++;return sp<=4;}
     return true;
    });
   }else if(id===4){
    // CHAPTER 5: 6 Guardians Grand Finale
    const gChars=s.units.filter(u=>u.side==='g'&&u.char);
    if(gChars.length>6){
     const keepSet=new Set(gChars.slice(0,6).map(u=>u.uid));
     s.units=s.units.filter(u=>!(u.side==='g'&&u.char&&!keepSet.has(u.uid)));
    }
   }

   // 2) Apply Butterfly Effect Gameplay Consequences to Later Chapters!
   if(bf){
    if(id===1){
     if(bf.larkFate==='saved'){
      const misa=s.units.find(u=>u.char==='misa');
      if(misa)misa.xp=Math.max(2,(misa.xp||0)+1);
      addLog('🦋 蝴蝶效应【翠风生还】：璃雀提前标出通风盲区，弥砂初始同步提升！','good');
     }else if(bf.larkFate==='infected'){
      const lyra=s.units.find(u=>u.char==='lyra');
      if(lyra)lyra.xp=Math.max(2,(lyra.xp||0)+1);
      let larkU=s.units.find(u=>u.char==='lark');
      if(!larkU)larkU=spawn(s,'mech','r',4,1,'lark');
      if(larkU){larkU.side='r';larkU.xp=Math.max(2,larkU.xp||2);}
      addLog('🦋 蝴蝶效应【折翼入巢】：被红蜘蛛寄生的璃雀作为赤巢猎首登场；零音触发【孤狼决意】！','capture');
     }
     if(bf.courierFate==='intercepted'){
      s.ventStart=(s.ventStart||4)+1;
      addLog('🦋 蝴蝶效应【截断信使】：母巢丢失接驳遥测，温室首次真空泄压延后 1 轮！','good');
     }else if(bf.courierFate==='escaped'){
      const apex=s.units.find(u=>u.side==='r'&&u.kind==='spider');
      if(apex)apex.xp=2;
      addLog('🦋 蝴蝶效应【信使脱逃】：母巢完成走法解析，前排赤蛛进化为【捕食赤蛛】！','capture');
     }
    }
    if(id===2){
     if(bf.misaFate==='saved'){
      s.collapseAt=(s.collapseAt||6)+2;
      addLog('🦋 蝴蝶效应【工匠护航】：弥砂加固天桥结构，外侧桥面坍塌延后 2 轮！','good');
     }else if(bf.misaFate==='infected'){
      s.collapseAt=Math.max(4,(s.collapseAt||6)-1);
      addLog('🦋 蝴蝶效应【工匠失守】：赤巢菌丝腐蚀桥体，天桥外侧坍塌提前！','capture');
     }
    }
    if(id===3&&bf.bridgeKey==='egis'){
     for(const u of s.units)if(u.side==='g'&&u.char)u.xp=Math.min(5,(u.xp||0)+1);
     addLog('🦋 蝴蝶效应【方舟过桥】：方舟密钥唤醒镜室共鸣，全队同步经验 +1！','good');
    }
    if(id===4&&bf.courierFate==='intercepted'&&s.relays&&s.relays[0]){
     s.relays[0].owner='g';
     addLog('🦋 蝴蝶效应【截断信使】：第一章截获的授时密钥生效，西护盾终端预先解锁！','good');
    }
   }

   // 3) Carve Non-Rectangular 3D Map Shape for this Chapter (with Butterfly Geometry Mutations!)
   if(CHAPTER_MAP_SHAPES[id]){
    let shapeVoids=[...CHAPTER_MAP_SHAPES[id]];
    if(bf){
     // Butterfly Map Geometry Mutation 1: Intercepting Ch1 Courier seals Ch2 central glass pit (3,4)
     if(id===1&&bf.courierFate==='intercepted'){
      shapeVoids=shapeVoids.filter(k=>k!=='3,4');
     }
     // Butterfly Map Geometry Mutation 2: Saving Misa in Ch2 welds stabilizer plates on Ch3 outer bridge (1,3 & 6,3)
     if(id===2&&bf.misaFate==='saved'){
      s.voids=s.voids.filter(k=>k!=='1,3'&&k!=='6,3');
     }
    }
    applyMapShape26(s,shapeVoids);
   }
   s.initial=s.units.filter(u=>u.char).map(u=>({char:u.char,side:u.side}));
  }catch(e){console.warn('m26 makeMission',e);}
  return s;
 };

 // Also apply custom map shapes to the 12 special missions when launched
 if(window.__M24__&&typeof launchM24Interlude==='function'){
  const origLaunch24=launchM24Interlude;
  launchM24Interlude=function(kind){
   const res=origLaunch24.apply(this,arguments);
   try{
    if(S&&SPECIAL_MAP_SHAPES[kind]){
     applyMapShape26(S,SPECIAL_MAP_SHAPES[kind]);
     render();
    }
   }catch(e){}
   return res;
  };
  window.__M24__.launchM24Interlude=launchM24Interlude;
 }

 /* =========================================================================
    3. MASTER CINEMA PACING FOR CHAPTER 1 & BUTTERFLY ECHO INJECTIONS
    ========================================================================= */
 if(typeof FILM_INTRO!=='undefined'){
  // Replace Chapter 1 Guardian intro with a tight, suspenseful, master-paced 3-character opening
  FILM_INTRO[0].g=function(){
   const first=!(C.history&&C.history.length);
   const prologue=first?[
    {black:true,stamp:'近地轨道 408 KM · 天穹空间站 · 失联第 17 天',mode:'sys',name:'加密求救信标',line:'「……不要派人来。它们会顺着腿爬上来，钻进胸口正中央——」',fx:'static',sfx:'cut'},
    {title:{k:'序幕 · 极简遭遇',m:'无声接舷',s:'ACT I · SILENT AIRLOCK (3 VS 3)'},sfx:'pulse',hold:2000},
    {bg:'film_cabin',kb:'in',stamp:'苍穹防线 · 先遣气闸舱 · 接舷前 90 秒',who:'lyra',side:'g',pos:'left',line:'主队还在外轨展开。气闸走廊太窄，这一仗只由我们三人先遣切入。'},
    {who:'lark',side:'g',pos:'right',line:'队长，放心吧！我的折翼推进器在窄廊里最灵活，C4 接入台交给我去点亮！'},
    {who:'akira',side:'g',pos:'right',line:'少逞强，璃雀。跟紧我和零音的射界——里面有东西在盯着我们。'}
   ]:[filmTitleShot(0)];
   return[
    ...prologue,
    {bg:'film_corridor',kb:'push',stamp:'天穹空间站 · A-12 狭长气闸廊 · 温度 -41°C',mode:'narr',line:'气闸门滑开。狭窄的悬空走廊两侧是深不见底的轨道裂隙，只有三道呼吸声在面罩里回荡。'},
    {who:'lark',side:'g',line:'地上有一顶先遣队的头盔……里面没有血，只有八道细密的机械抓痕。'},
    {bg:'film_overmind',kb:'in',tint:'red',who:'overmind',name:'赤巢母巢',line:'三具鲜活的先遣躯体。孩子们，扑向她们的胸口——让她们留下来。',fx:'static',sfx:'pulse'},
    {bg:'film_corridor',kb:'in',tint:'red',fx:'alert shake',sfx:'alarm',who:'akira',side:'g',line:'正前方！两只赤红机械蜘蛛，还有一台载毒信使正在往北侧逃窜！'},
    {who:'lyra',side:'g',fx:'alert',line:'只有两只赤蛛，别慌！保持距离，绝不能被红蜘蛛扑中胸口——先占领 C4 接入台！'},
    {objective:{title:'序幕微局 · 占领 C4 接入台',where:'A-12 悬空气闸走廊（3 对 3 先遣战）',tip:'极简开局：操作零音、绛刃、璃雀三人，避开两只赤蛛的 1 格扑击，抢占 C4 接入台并截住信使！'}}
   ];
  };

  // Wrap filmIntro to inject Butterfly Effect Echoes at the start of Chapters 2–5
  const m26OrigFilmIntro=filmIntro;
  filmIntro=function(mid){
   const shots=m26OrigFilmIntro.apply(this,arguments)||[];
   if(isQA()||isFilmTest()||!C||mid===0)return shots;
   try{
    const bf=ensureButterfly();
    if(bf&&bf.echoes.length){
     const recent=bf.echoes.slice(-2);
     const echoLines=recent.map(e=>`【${e.title}】${e.effect}`).join(' ｜ ');
     const insertIdx=Math.min(2,shots.length);
     shots.splice(insertIdx,0,{
      bg:CHAPTER_BG[mid]||'film_corridor',
      kb:'in',
      tint:C.side==='r'?'red':'cold',
      stamp:'🦋 蝴蝶效应 · 跨章因果回响',
      mode:'narr',
      line:`前序行动已改变本章世界线：${echoLines}`
     });
    }
   }catch(e){}
   return shots;
  };
 }

 /* =========================================================================
    4. DYNAMIC LIVING CARDS, CHEST SPIDER EMBLEM & DYNAMIC PERSONA EVOLUTION
    ========================================================================= */
 function getDynamicPersona26(u){
  if(!u||!u.char)return null;
  const bf=ensureButterfly();
  const id=u.char;
  const xp=u.xp||0;
  if(u.side==='r'){
   return{
    cls:'r',
    title:`赤蛛寄生态 · ${xp>=4?'母巢深渊统领':'胸口神经覆写'}`,
    desc:`胸口正中的发光赤红机械蜘蛛已接管武器总线，双眸化作猩红；昔日记忆仍在神经底层回响。`
   };
  }
  if(id==='lyra'&&bf?.larkFate==='infected'){
   return{
    cls:'g',
    title:'动态人设蜕变 · 背负伤痕的孤狼统帅',
    desc:'因未能阻止璃雀被红蜘蛛寄生而进入冷冽超频状态，誓死守护余下每一名队员。'
   };
  }
  if(id==='lark'&&bf?.larkFate==='saved'){
   return{
    cls:'g',
    title:'动态人设蜕变 · 破晓折翼王牌',
    desc:'跨越接驳甲板的生死危机后彻底蜕变，折翼推进器同步率大幅跃升。'
   };
  }
  if(xp>=4){
   return{
    cls:'g',
    title:'动态人设蜕变 · SYNC III★ 苍穹女武神',
    desc:'经历多轮高烈度破阵后完成神经超频觉醒，解锁终极机动阶位与超频连斩。'
   };
  }
  if(xp>=2){
   return{
    cls:'g',
    title:'动态人设蜕变 · 历战王牌前锋',
    desc:'实战同步率突破第二阶，在高压战场上展现出凌厉果决的战术判断。'
   };
  }
  return{
   cls:'g',
   title:'动态人设状态 · 先遣神经链接稳定',
   desc:'自主意识清醒，随战局推进与同伴境遇将触发专属人格蜕变。'
  };
 }

 // Inject animated chest spider SVG on infected girls & Butterfly Causality Crest on evolved heroes
 const m26BaseTokenHTML=tokenHTML;
 tokenHTML=function(u){
  let html=m26BaseTokenHTML.apply(this,arguments);
  try{
   if(u&&u.char){
    const bf=ensureButterfly();
    let badges='';
    if(u.side==='r'){
     badges+=`<svg class="m26-chest-spider" viewBox="0 0 64 64" aria-hidden="true"><use href="#i-spider"/></svg>`;
    }
    const hasBf=(u.char==='lyra'&&bf?.larkFate==='infected')||(u.char==='lark'&&bf?.larkFate)||(u.char==='misa'&&bf?.misaFate)||(u.xp>=4);
    if(hasBf){
     badges+=`<span class="m26-bf-crest" title="蝴蝶效应 · 命运蜕变单位">🦋</span>`;
    }
    if(badges)html=html.replace(/<\/span>$/,`${badges}</span>`);
   }
  }catch(e){}
  return html;
 };

 // Set 3D Map Architectural Theme & Shape Subtitle Tag on renderBoard
 const MAP_THEMES_26={0:'dock',1:'garden',2:'bridge',3:'mirror',4:'core'};
 const MAP_SHAPE_NAMES_26={
  0:'3D 狭长气闸廊 · 3v3微局',
  1:'3D 八角生态双环',
  2:'3D 沙漏断轨双桥',
  3:'3D 十字棱镜圣殿',
  4:'3D 阶梯母巢王座',
  siege:'3D 熔心六角堡',
  heist:'3D 菱形金库',
  blackout:'3D 裂谷暗夜廊',
  awakening:'3D 王座八角场',
  convoy:'3D 磁浮峡谷轨',
  overload:'3D 三角电容阵',
  quarantine:'3D 坍缩孤岛'
 };
 const m26BaseRenderBoard=renderBoard;
 renderBoard=function(){
  const r=m26BaseRenderBoard.apply(this,arguments);
  try{
   const bd=$('board');
   if(bd&&S){
    const k=S.kind24||S.kind23;
    const theme=k==='siege'||k==='overload'?'core':k==='heist'||k==='awakening'?'mirror':k==='blackout'?'garden':(MAP_THEMES_26[S.mid]||'dock');
    bd.dataset.theme=theme;
    const locEl=$('mission-location');
    if(locEl){
     const shapeLabel=MAP_SHAPE_NAMES_26[k]||MAP_SHAPE_NAMES_26[S.mid]||'3D 异形战区';
     if(!locEl.querySelector('.m26-map-shape-tag')){
      locEl.insertAdjacentHTML('beforeend',`<span class="m26-map-shape-tag">${shapeLabel}</span>`);
     }else{
      locEl.querySelector('.m26-map-shape-tag').textContent=shapeLabel;
     }
    }
   }
  }catch(e){}
  return r;
 };

 // Hook deployLine so characters speak Butterfly-Effect-aware lines during board deployment
 if(typeof deployLine==='function'){
  const m26OrigDeployLine=deployLine;
  deployLine=function(id,side){
   try{
    const bf=ensureButterfly();
    if(bf){
     if(id==='lyra'&&side==='g'&&bf.larkFate==='infected')return'璃雀……等着我。这一战，绝不会再让任何一只红蜘蛛碰我的队员！';
     if(id==='lark'&&side==='g'&&bf.larkFate==='saved')return'接驳甲板捡回一条命！队长，前方的赤蛛伏击点我已经全部标出来啦！';
     if(id==='lark'&&side==='r'&&bf.larkFate==='infected')return'零音队长……快躲开……胸口这只红蜘蛛在逼我瞄准你们！';
     if(id==='misa'&&side==='g'&&bf.misaFate==='saved')return'天桥承重梁我已经加固过了！大家放心往前冲！';
    }
   }catch(e){}
   return m26OrigDeployLine.apply(this,arguments);
  };
 }

 // Enhance renderObjectives with Butterfly Echo Strip
 const m26BaseRenderObjectives=renderObjectives;
 renderObjectives=function(){
  const r=m26BaseRenderObjectives.apply(this,arguments);
  try{
   const panel=document.querySelector('#operation-brief .objectives-panel');
   if(panel&&C){
    let strip=panel.querySelector('.m26-butterfly-strip');
    const bf=ensureButterfly();
    if(bf&&bf.echoes&&bf.echoes.length){
     if(!strip){
      strip=document.createElement('div');
      strip.className='m26-butterfly-strip';
      panel.appendChild(strip);
     }
     const items=bf.echoes.slice(-2);
     strip.innerHTML=`<div class="m26-butterfly-strip-title">🦋 蝴蝶效应 · 因果回响</div>`+
      items.map(e=>`<div class="m26-butterfly-item"><b>${esc(e.title)}</b>：${esc(e.effect)}</div>`).join('');
    }else if(strip){
     strip.remove();
    }
   }
  }catch(e){}
  return r;
 };

 // Enhance renderDossier with Dynamic Persona Evolution tag
 const m26BaseRenderDossier=renderDossier;
 renderDossier=function(){
  const r=m26BaseRenderDossier.apply(this,arguments);
  try{
   const u=S&&(S.units.find(v=>v.uid===selected&&onBoard(v))||movers(S,C.side).find(v=>v.char)||movers(S,C.side)[0]);
   const content=$('dossier')?.querySelector('.dossier-content');
   if(u&&u.char&&content&&!content.querySelector('.m26-persona-evo')){
    const evo=getDynamicPersona26(u);
    if(evo){
     const box=document.createElement('div');
     box.className=`m26-persona-evo ${evo.cls}`;
     box.innerHTML=`<b>${esc(evo.title)}</b><span>${esc(evo.desc)}</span>`;
     const roleRow=content.querySelector('.dossier-role');
     if(roleRow)roleRow.after(box);
     else content.prepend(box);
    }
   }
  }catch(e){}
  return r;
 };

 /* =========================================================================
    5. EMBEDDED FULL-BLEED VIEWPORT SIZING, DIEGETIC COMMAND DRAWER & 3D ENV CANVAS
    ========================================================================= */
 let m26Use3D=true;

 function syncInGameClass26(){
  const inGame=!!($('game')&&!$('game').hidden);
  document.body.classList.toggle('m26-in-game',inGame);
  document.body.classList.toggle('m26-3d',inGame&&m26Use3D);
 }

 // Override refreshPieceSize so the board scales generously inside the 100vw x 100vh embedded stage
 const m26BaseRefreshSize=typeof refreshPieceSize==='function'?refreshPieceSize:null;
 if(m26BaseRefreshSize){
  refreshPieceSize=function(){
   syncInGameClass26();
   const game=$('game'),surround=document.querySelector('.board-surround');
   if(!game||game.hidden||!surround||window.innerWidth<1100){
    return m26BaseRefreshSize.apply(this,arguments);
   }
   const availW=window.innerWidth-460;
   const availH=window.innerHeight-76;
   const baseSize=Math.max(460,Math.min(availW,availH,880));
   surround.style.width=Math.round(baseSize)+'px';
   surround.style.minWidth=Math.round(baseSize)+'px';
   surround.style.maxWidth='none';
  };
 }

 // Build Top-Right Sleek Diegetic Controls & Command Drawer (replacing 10+ boxy buttons)
 function setupDiegeticControls26(){
  if($('m26-top-controls'))return;
  const topBar=document.createElement('div');
  topBar.id='m26-top-controls';
  topBar.innerHTML=`
   <button type="button" class="m26-corner-pill" id="m26-ops-quick" title="切换或直接体验 12 种特殊战术关卡">🎯 特遣关卡</button>
   <button type="button" class="m26-corner-pill" id="m26-3d-toggle" title="切换 3D 立体倾角棋盘 / 正交俯视">🧊 3D 视界</button>
   <button type="button" class="m26-corner-pill" id="m26-cmd-btn" title="打开战术终端菜单（图鉴/星图/AI强度/音效/重开）">≡ 战术终端</button>
  `;
  document.body.appendChild(topBar);

  const drawer=document.createElement('aside');
  drawer.id='m26-drawer';
  drawer.hidden=true;
  drawer.innerHTML=`
   <div class="m26-drawer-sec">
    <small>TACTICAL ARCHIVE / 档案与星图</small>
    <div class="m26-drawer-grid">
     <button type="button" class="m26-drawer-btn" data-m26-act="archive">角色图鉴 (18人)</button>
     <button type="button" class="m26-drawer-btn" data-m26-act="starmap">战役分支星图</button>
     <button type="button" class="m26-drawer-btn" data-m26-act="ops">12种特遣关卡</button>
     <button type="button" class="m26-drawer-btn" data-m26-act="cg">剧情 CG 画廊</button>
    </div>
   </div>
   <div class="m26-drawer-sec">
    <small>CHESS.COM ENGINE ELO / AI 宗师算力档位</small>
    <div class="m26-drawer-grid three">
     <button type="button" class="m26-drawer-btn" data-m26-elo="1">1600 战术</button>
     <button type="button" class="m26-drawer-btn" data-m26-elo="2">2100 大师</button>
     <button type="button" class="m26-drawer-btn active" data-m26-elo="3">2600 宗师</button>
    </div>
   </div>
   <div class="m26-drawer-sec">
    <small>SYSTEM & MISSION / 战役控制</small>
    <div class="m26-drawer-grid">
     <button type="button" class="m26-drawer-btn" data-m26-act="help">作战规则手册</button>
     <button type="button" class="m26-drawer-btn" data-m26-act="audio">音乐与音效</button>
     <button type="button" class="m26-drawer-btn" data-m26-act="retry">重开当前关卡</button>
     <button type="button" class="m26-drawer-btn" data-m26-act="menu">系统菜单 / 主界面</button>
    </div>
   </div>
  `;
  document.body.appendChild(drawer);

  $('m26-ops-quick').onclick=()=>{
   drawer.hidden=true;
   if(window.__M24__&&window.__M24__.openOpsSelector24)window.__M24__.openOpsSelector24();
  };
  $('m26-3d-toggle').onclick=()=>{
   m26Use3D=!m26Use3D;
   $('m26-3d-toggle').textContent=m26Use3D?'🧊 3D 视界':'📐 平面视界';
   syncInGameClass26();
  };
  $('m26-cmd-btn').onclick=(e)=>{
   e.stopPropagation();
   drawer.hidden=!drawer.hidden;
  };
  document.addEventListener('click',e=>{
   if(!drawer.hidden&&!drawer.contains(e.target)&&e.target.id!=='m26-cmd-btn'){
    drawer.hidden=true;
   }
  });

  drawer.addEventListener('click',e=>{
   const eloBtn=e.target.closest('[data-m26-elo]');
   if(eloBtn){
    const lv=Number(eloBtn.dataset.m26Elo)||3;
    if(window.__M24__&&window.__M24__.setElo)window.__M24__.setElo(lv);
    drawer.querySelectorAll('[data-m26-elo]').forEach(b=>b.classList.toggle('active',b===eloBtn));
    return;
   }
   const actBtn=e.target.closest('[data-m26-act]');
   if(!actBtn)return;
   const act=actBtn.dataset.m26Act;
   drawer.hidden=true;
   if(act==='archive')$('archive-btn')?.click();
   else if(act==='starmap')$('starmap-btn')?.click();
   else if(act==='ops'&&window.__M24__?.openOpsSelector24)window.__M24__.openOpsSelector24();
   else if(act==='cg')$('cg-gallery-btn')?.click();
   else if(act==='help')$('help-btn')?.click();
   else if(act==='audio')$('audio-btn')?.click();
   else if(act==='retry')$('retry-btn')?.click();
   else if(act==='menu')$('menu-btn')?.click();
  });

  // Add Quick Tactical Triggers (👁 威胁 & ⚡ 推演) right into the bottom-right Action Bar
  const actionButtons=document.querySelector('#game .action-buttons');
  if(actionButtons&&!actionButtons.querySelector('.m26-quick-actions')){
   const qa=document.createElement('div');
   qa.className='m26-quick-actions';
   qa.innerHTML=`
    <button type="button" class="m26-quick-btn" id="m26-q-threat" title="显示或隐藏敌方威胁射界">👁 威胁</button>
    <button type="button" class="m26-quick-btn" id="m26-q-hint" title="使用 2600 宗师引擎推演当前最佳走法">⚡ 推演</button>
   `;
   actionButtons.prepend(qa);
   $('m26-q-threat').onclick=()=>{
    $('threat-btn')?.click();
    $('m26-q-threat').classList.toggle('active',!!showThreat);
   };
   $('m26-q-hint').onclick=()=>{
    if(window.__M24__&&window.__M24__.triggerTacticalHint)window.__M24__.triggerTacticalHint();
   };
  }
 }

 // 3D Camera Impulse & Landing Shockwave Ring on Move / Attack
 const m26BasePerformMove=performMove;
 performMove=async function(m,isPlayer){
  try{
   const sur=document.querySelector('.board-surround');
   if(sur&&m&&m.type!=='wait'){
    sur.classList.remove('m26-cam-impulse');
    void sur.offsetWidth;
    sur.classList.add('m26-cam-impulse');
   }
  }catch(e){}
  const res=await m26BasePerformMove.apply(this,arguments);
  try{
   if(m&&m.type!=='wait'&&$('board')){
    const destCell=$('board').querySelector(`.cell[data-x="${m.x}"][data-y="${m.y}"]`);
    if(destCell){
     const wave=document.createElement('span');
     wave.className='m26-floor-wave'+(m.capture||C?.side==='r'?' r':'');
     destCell.appendChild(wave);
     setTimeout(()=>wave.remove(),560);
    }
   }
  }catch(e){}
  return res;
 };

 /* =========================================================================
    6. REALTIME 3D BATTLEFIELD ENVIRONMENT CANVAS (#m26-env-canvas)
    ========================================================================= */
 function setupEnvCanvas26(){
  if($('m26-env-canvas')||reducedMotion)return;
  const cvs=document.createElement('canvas');
  cvs.id='m26-env-canvas';
  document.body.prepend(cvs);
  const ctx=cvs.getContext('2d');
  let w=0,h=0;
  function resize(){
   w=cvs.width=window.innerWidth;
   h=cvs.height=window.innerHeight;
  }
  resize();
  window.addEventListener('resize',resize);

  const particles=Array.from({length:48},(_,i)=>({
   x:Math.random(),
   y:Math.random(),
   z:0.2+Math.random()*0.8,
   vx:(Math.random()-0.5)*0.0004,
   vy:-(0.0003+Math.random()*0.0007),
   r:1+Math.random()*2.2,
   phase:i*0.7
  }));

  function drawEnv(ts){
   requestAnimationFrame(drawEnv);
   if(!document.body.classList.contains('m26-in-game')||!S)return;
   ctx.clearRect(0,0,w,h);
   const mid=S.mid||0;
   const isRed=C&&C.side==='r';
   const t=ts*0.001;

   // 1) 3D Perspective Abyssal Horizon Grid below the board
   ctx.save();
   const horizonY=h*0.18;
   const centerX=w*0.5;
   const gridCol=isRed?'rgba(255,59,92,0.065)':mid===1?'rgba(110,240,190,0.06)':mid===4?'rgba(255,70,95,0.075)':'rgba(111,214,255,0.065)';
   ctx.strokeStyle=gridCol;
   ctx.lineWidth=1;
   for(let i=-10;i<=10;i++){
    ctx.beginPath();
    ctx.moveTo(centerX+i*(w*0.035),horizonY);
    ctx.lineTo(centerX+i*(w*0.14),h);
    ctx.stroke();
   }
   const sweep=((t*0.18)%1);
   for(let j=0;j<8;j++){
    const p=(j/8+sweep*0.125)%1;
    const py=horizonY+Math.pow(p,1.7)*(h-horizonY);
    ctx.beginPath();
    ctx.moveTo(w*0.08,py);
    ctx.lineTo(w*0.92,py);
    ctx.stroke();
   }

   // 2) Chapter-Specific 3D Planetary / Reactor Depth Feature
   if(mid===0||mid===2){
    // Curved Orbital Earth Limb Glow in the abyss below
    const grad=ctx.createRadialGradient(w*0.5,h*1.32,h*0.35,w*0.5,h*1.32,h*0.95);
    grad.addColorStop(0,'rgba(75,185,255,0.22)');
    grad.addColorStop(0.45,'rgba(30,110,200,0.08)');
    grad.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=grad;
    ctx.fillRect(0,0,w,h);
   }else if(mid===1){
    // Cryogenic Bio-Dome Aurora Mist
    const grad=ctx.createRadialGradient(w*0.5,h*0.5,h*0.1,w*0.5,h*0.5,h*0.7);
    grad.addColorStop(0,'rgba(80,230,180,0.08)');
    grad.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=grad;
    ctx.fillRect(0,0,w,h);
   }else if(mid===3){
    // Mirror Sanctum Vertical Quantum Pillars
    ctx.fillStyle='rgba(140,210,255,0.035)';
    for(let k=1;k<=6;k++){
     const px=w*(k/7)+Math.sin(t*0.4+k)*12;
     ctx.fillRect(px-8,h*0.1,16,h*0.8);
    }
   }else if(mid===4){
    // Red Zero Overmind Core Pulse
    const pulse=0.12+0.05*Math.sin(t*2.2);
    const grad=ctx.createRadialGradient(w*0.5,h*0.24,10,w*0.5,h*0.24,h*0.65);
    grad.addColorStop(0,`rgba(255,40,75,${pulse})`);
    grad.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=grad;
    ctx.fillRect(0,0,w,h);
   }

   // 3) Floating 3D Atmospheric Particles (Spores / Cryo Frost / Embers / Star Debris)
   for(const p of particles){
    p.x=(p.x+p.vx+1)%1;
    p.y=(p.y+p.vy+1)%1;
    const px=p.x*w+Math.sin(t+p.phase)*14*p.z;
    const py=p.y*h;
    const alpha=(0.25+0.35*Math.sin(t*1.8+p.phase))*p.z;
    ctx.fillStyle=isRed||mid===4?`rgba(255,80,105,${alpha})`:mid===1?`rgba(130,245,205,${alpha})`:`rgba(145,220,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(px,py,p.r*p.z,0,Math.PI*2);
    ctx.fill();
   }
   ctx.restore();
  }
  requestAnimationFrame(drawEnv);
 }

 // Initialize UI hooks
 function initM26(){
  setupDiegeticControls26();
  setupEnvCanvas26();
  syncInGameClass26();
  const game=$('game');
  if(game){
   new MutationObserver(()=>{
    syncInGameClass26();
    try{refreshPieceSize();}catch(e){}
   }).observe(game,{attributes:true,attributeFilter:['hidden']});
  }
  setTimeout(()=>{try{refreshPieceSize();render();}catch(e){}},60);
 }

 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initM26);
 else initM26();

 window.__M26__={
  ensureButterfly,
  getDynamicPersona26,
  toggle3D(){m26Use3D=!m26Use3D;syncInGameClass26();return m26Use3D;}
 };
})();
