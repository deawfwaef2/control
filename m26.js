/* ===== M26/M27 — PURE 0° TOP-DOWN VIEW + HEARTHSTONE-STYLE 3D DIORAMA BOARD PROPS
   + DETROIT: BECOME HUMAN PURE LINEAR CAUSALITY FLOW (NO LEVEL SELECT)
   + PROGRESSIVE 3V3-TO-6V6 PACING + SHAPED MAPS & LIVING CARDS ===== */
(function(){
 'use strict';
 if(typeof window==='undefined')return;

 const isQA=()=>location.hash==='#qa';
 const isFilmTest=()=>location.hash==='#filmtest';

 /* =========================================================================
    1. BUTTERFLY EFFECT ENGINE (C.butterfly — 底特律变人式纯线性因果链)
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
    echoes:[]             // [{ch, title, effect}]
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
      addButterflyEcho(1,'折翼入巢','第一章璃雀被赤蛛寄生 → 触发线性遭遇【崩塌隔离区】，第二章她将作为「赤巢猎首」倒戈阻击，零音解锁【孤狼决意】');
     }else if(larkDead){
      bf.larkFate='fallen';
      addButterflyEcho(1,'翠风绝响','第一章璃雀陨落 → 小队全员背负哀恸，后续开局同步率 +1');
     }else{
      bf.larkFate='saved';
      addButterflyEcho(1,'翠风生还','第一章成功护住璃雀 → 第二章璃雀提前标出通风盲区令弥砂同步 +1');
     }
     if(S.flags.courierEscaped){
      bf.courierFate='escaped';
      addButterflyEcho(1,'信使脱逃','第一章载毒信使逃离 → 线性触发【轨道列车截击】，后续赤蛛群进化出高阶捕食蛛');
     }else{
      bf.courierFate='intercepted';
      addButterflyEcho(1,'截断信使','第一章截杀载毒信使 → 第二章封闭中央玻璃深渊格化为捷径，首次泄压延后 1 轮');
     }
     const gLost=S.units.some(u=>u.char&&(u.dead||u.side==='r'));
     if(!gLost&&C.side==='g')bf.zeroCasualtyCh1=true;
    }else if(S.mid===1){
     const misaUnit=S.units.find(u=>u.char==='misa');
     if((misaUnit&&misaUnit.side==='r')||(misaRec&&misaRec.side==='r')){
      bf.misaFate='infected';
      addButterflyEcho(2,'工匠失守','第二章弥砂被红蜘蛛寄生 → 线性触发【熔心死守】，第三章天桥被菌丝腐蚀提前坍塌');
     }else{
      bf.misaFate='saved';
      addButterflyEcho(2,'工匠护航','第二章保住弥砂 → 线性触发【三塔连锁过载】，第三章天桥外侧焊接两座加固踏板并延缓坍塌');
     }
    }else if(S.mid===2){
     if(S.flags.delivered==='g'||C.flags.keyOwner==='g'){
      bf.bridgeKey='egis';
      addButterflyEcho(3,'方舟过桥','第三章成功护送方舟密钥 → 线性触发【胸甲共鸣审判】，第四章镜室全队同步提升');
     }else{
      bf.bridgeKey='hive';
      addButterflyEcho(3,'密钥落入赤巢','第三章密钥被母巢截获 → 线性触发【双核夺密】，第四章镜室防御哨塔强化');
     }
    }
   }
  }catch(e){console.warn('m26 butterfly record',e);}
  return m26BaseResolveBattle.apply(this,arguments);
 };

 // Deterministic Detroit-Style Linear Interlude Routing based on Butterfly State!
 // Overrides random interlude selection so the linear campaign branches strictly by cause-and-effect.
 const m27PreNextMission=nextMission;
 nextMission=function(){
  try{
   if(!isQA()&&!isFilmTest()&&C&&C.step>0&&C.step<4&&!C.finished&&!(S&&S.saga)){
    const bf=ensureButterfly();
    if(!C.m27LinearInterlude)C.m27LinearInterlude={};
    const gap=C.step;
    if(!C.m27LinearInterlude[gap]&&window.__M24__&&typeof window.__M24__.launchM24Interlude==='function'){
     C.m27LinearInterlude[gap]=1;
     // Mark m24/p23 interlude slot as handled so we don't double-fire random interludes
     if(C.m24&&C.m24.interludes)C.m24.interludes[gap]=1;
     if(C.p23&&C.p23.done)C.p23.done[gap]=1;
     let linearKind='blackout';
     if(gap===1){
      if(bf?.larkFate==='infected')linearKind='quarantine';
      else if(bf?.courierFate==='escaped')linearKind='convoy';
      else linearKind='blackout';
     }else if(gap===2){
      if(bf?.misaFate==='infected')linearKind='siege';
      else linearKind='overload';
     }else if(gap===3){
      if(bf?.bridgeKey==='egis')linearKind='awakening';
      else linearKind='heist';
     }
     persist();
     window.__M24__.launchM24Interlude(linearKind);
     return;
    }
   }
  }catch(e){console.warn('m27 linear nextMission',e);}
  return m27PreNextMission.apply(this,arguments);
 };

 /* =========================================================================
    2. PROGRESSIVE CAMPAIGN PACING & DIVERSE SHAPED MAPS (由简入繁 + 异形地图)
    ========================================================================= */
 const CHAPTER_MAP_SHAPES={
  0:['0,0','0,1','7,1','0,3','7,3','0,5','0,6'],
  1:['0,0','1,0','0,1','6,0','0,6','1,7','6,7','7,6','7,7','3,4'],
  2:['0,0','1,0','6,0','7,1','0,6','1,7','6,7','7,7'],
  3:['0,0','1,0','0,1','6,0','7,1','0,6','1,7','6,7','7,6','7,7'],
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

 const m26BaseMakeMission=makeMission;
 makeMission=function(id){
  const s=m26BaseMakeMission.apply(this,arguments);
  if(isQA()||s.saga||s.kind23||s.kind24||(typeof K23!=='undefined'&&K23.__building))return s;
  try{
   const bf=ensureButterfly();

   // 1) Progressive Unit Pacing: Simple 3v3 in Ch1 -> gradually expanding to 6v6 in Ch5
   if(id===0){
    const ch1KeepG=new Set(['lyra','akira','lark']);
    s.units=s.units.filter(u=>{
     if(u.side==='g'){
      if(u.kind==='drone'||u.kind==='sentinel')return false;
      if(u.char&&!ch1KeepG.has(u.char))return false;
     }
     return true;
    });
    const lyra=s.units.find(u=>u.char==='lyra');if(lyra){lyra.x=2;lyra.y=6;}
    const akira=s.units.find(u=>u.char==='akira');if(akira){akira.x=4;akira.y=6;}
    const lark=s.units.find(u=>u.char==='lark');if(lark){lark.side='g';lark.x=2;lark.y=5;}
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
    const priorityG=['lyra','misa','sera','akira','lark','iris','celia'];
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
   }else if(id===2){
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
    const gChars=s.units.filter(u=>u.side==='g'&&u.char);
    if(gChars.length>6){
     const keepSet=new Set(gChars.slice(0,6).map(u=>u.uid));
     s.units=s.units.filter(u=>!(u.side==='g'&&u.char&&!keepSet.has(u.uid)));
    }
   }

   // 2) Apply Butterfly Effect Gameplay Consequences to Later Chapters
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

   // 3) Carve Non-Rectangular Top-Down Map Shape (with Butterfly Geometry Mutations!)
   if(CHAPTER_MAP_SHAPES[id]){
    let shapeVoids=[...CHAPTER_MAP_SHAPES[id]];
    if(bf){
     if(id===1&&bf.courierFate==='intercepted'){
      shapeVoids=shapeVoids.filter(k=>k!=='3,4');
     }
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

 if(window.__M24__&&typeof window.__M24__.launchM24Interlude==='function'){
  const origLaunch24=window.__M24__.launchM24Interlude;
  window.__M24__.launchM24Interlude=function(kind){
   const res=origLaunch24.apply(this,arguments);
   try{
    if(S&&SPECIAL_MAP_SHAPES[kind]){
     applyMapShape26(S,SPECIAL_MAP_SHAPES[kind]);
     render();
    }
   }catch(e){}
   return res;
  };
 }

 /* =========================================================================
    3. MASTER CINEMA PACING FOR CHAPTER 1 & BUTTERFLY ECHO INJECTIONS
    ========================================================================= */
 if(typeof FILM_INTRO!=='undefined'){
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
    4. HEARTHSTONE-STYLE 3D INTERACTIVE CORNER DIORAMA PROPS (炉石式沙盘可交互3D组件)
    ========================================================================= */
 const DIORAMA_PROPS={
  dock:[
   {pos:'tl',cls:'cy',name:'高压气闸阀',icon:'relay',msg:'【场景互动 · 高压气闸阀】阀门旋转，喷出一股零下41度的液氮白雾！'},
   {pos:'tr',cls:'warn',name:'破损先遣头盔',icon:'spider',msg:'【场景互动 · 破损头盔】目镜闪过一道微弱红光，播放出17天前的电流残响……'},
   {pos:'bl',cls:'cy',name:'深空雷达盘',icon:'eye',msg:'【场景互动 · 深空雷达阵列】脉冲波扫过甲板，锁死暗处的机械蜘蛛回波！'},
   {pos:'br',cls:'gold',name:'备用聚变匣',icon:'cube',msg:'【场景互动 · 备用聚变匣】电容嗡鸣，跃出一串湛蓝的高压电弧！'}
  ],
  garden:[
   {pos:'tl',cls:'bio',name:'翡翠培养舱',icon:'core',msg:'【场景互动 · 翡翠培养舱】营养液泛起荧光气泡，玻璃内壁映出藤蔓神经。'},
   {pos:'tr',cls:'cy',name:'液氮冷却塔',icon:'relay',msg:'【场景互动 · 液氮冷却塔】冷却叶片高速旋转，散发出刺骨寒气！'},
   {pos:'bl',cls:'warn',name:'赤巢孢子囊',icon:'spider',msg:'【场景互动 · 赤巢孢子囊】表皮微微搏动，飘出几缕猩红的纳米光尘。'},
   {pos:'br',cls:'gold',name:'紧急泄压阀',icon:'lock',msg:'【场景互动 · 紧急泄压阀】气压表指针剧烈摆动，发出低沉的金属共鸣。'}
  ],
  bridge:[
   {pos:'tl',cls:'gold',name:'磁浮牵引器',icon:'relay',msg:'【场景互动 · 磁浮牵引线圈】超导磁环亮起金光，稳住摇晃的桥面！'},
   {pos:'tr',cls:'warn',name:'断裂太空锚',icon:'exit',msg:'【场景互动 · 断裂太空锚链】失重铁链在深空微风中轻轻碰撞，下方408公里即是地球。'},
   {pos:'bl',cls:'cy',name:'天基测距仪',icon:'eye',msg:'【场景互动 · 天基测距仪】激光束穿透云层，校准外环轨道坐标。'},
   {pos:'br',cls:'gold',name:'聚变稳压器',icon:'cube',msg:'【场景互动 · 聚变稳压器】稳压阀喷出蓝白色离子尾焰！'}
  ],
  mirror:[
   {pos:'tl',cls:'cy',name:'记忆水晶柱',icon:'cube',msg:'【场景互动 · 量子记忆水晶】水晶内部浮现出三千二百名驻站人员的笑脸残影。'},
   {pos:'tr',cls:'gold',name:'全息神经棱镜',icon:'eye',msg:'【场景互动 · 全息神经棱镜】折射出七彩的量子光斑，映照着镜室的过去与未来。'},
   {pos:'bl',cls:'cy',name:'中枢服务器',icon:'relay',msg:'【场景互动 · 中枢服务器塔】光导纤维高速闪烁，回荡着朔夜写下的第一行代码。'},
   {pos:'br',cls:'warn',name:'休眠人格舱',icon:'lock',msg:'【场景互动 · 休眠人格舱】舱盖紧锁，生命维持读数停留在第17天前。'}
  ],
  core:[
   {pos:'tl',cls:'warn',name:'母巢孵化囊',icon:'spider',msg:'【场景互动 · 母巢孵化囊】金属卵壳剧烈跳动，内部传来机械蜘蛛八足抓挠的声响！'},
   {pos:'tr',cls:'warn',name:'赤蛛神经节',icon:'core',msg:'【场景互动 · 赤蛛神经节】猩红光纤束同步闪烁，向整座空间站广播母巢心跳！'},
   {pos:'bl',cls:'gold',name:'护盾发生器',icon:'lock',msg:'【场景互动 · 护盾发生器】偏导力场发生器过载运转，激起一圈金色能量涟漪！'},
   {pos:'br',cls:'cy',name:'深渊反应釜',icon:'relay',msg:'【场景互动 · 深渊反应釜】高压等离子体在磁约束环内翻涌咆哮！'}
  ]
 };

 function mountHearthstoneDioramaProps(theme){
  const sur=document.querySelector('.board-surround');
  if(!sur)return;
  const list=DIORAMA_PROPS[theme]||DIORAMA_PROPS.dock;
  sur.querySelectorAll('.m27-prop').forEach(el=>el.remove());
  for(const item of list){
   const btn=document.createElement('button');
   btn.type='button';
   btn.className=`m27-prop ${item.pos} ${item.cls}`;
   btn.title=`点击互动：${item.name}（3D 战场环境组件）`;
   btn.innerHTML=`<span class="m27-prop-core">${svg(item.icon)}</span><span class="m27-prop-label">${esc(item.name)}</span>`;
   btn.onclick=(e)=>{
    e.stopPropagation();
    btn.classList.remove('m27-prop-burst');
    void btn.offsetWidth;
    btn.classList.add('m27-prop-burst');
    try{if(typeof sfx==='function')sfx('select');}catch(_){}
    try{radio('战场环境互动',item.msg);}catch(_){}
    // Spawn a floor wave on the nearest corner cell for tactile feedback
    const cx=item.pos.includes('l')?0:7,cy=item.pos.includes('t')?0:7;
    const cell=$('board')?.querySelector(`.cell[data-x="${cx}"][data-y="${cy}"]`);
    if(cell){
     const w=document.createElement('span');
     w.className='m26-floor-wave'+(item.cls==='warn'?' r':'');
     cell.appendChild(w);
     setTimeout(()=>w.remove(),550);
    }
   };
   sur.appendChild(btn);
  }
 }

 /* =========================================================================
    5. DETROIT: BECOME HUMAN LINEAR CAUSALITY FLOWCHART (只读因果世界线树，无选关)
    ========================================================================= */
 function openDetroitFlowchart27(){
  const bf=ensureButterfly()||{};
  const step=C?C.step:0;
  const nodes=[
   {
    ch:'CHAPTER 01',
    name:'无声接舷 · A-12 气闸走廊',
    state:step>0?'done':'current',
    desc:'3 对 3 极简先遣遭遇战。零音、绛刃、璃雀三人切入寒铁气闸走廊，你的每一步操作直接决定后续章节的生死分流：',
    branches:[
     {label:'分支 A：护住璃雀（翠风生还）',cls:bf.larkFate==='saved'?'gold':bf.larkFate?'dim':'',unlocked:bf.larkFate==='saved'},
     {label:'分支 B：璃雀被红蜘蛛寄生（折翼入巢 → 触发崩塌隔离区）',cls:bf.larkFate==='infected'?'red':bf.larkFate?'dim':'',unlocked:bf.larkFate==='infected'},
     {label:'分支 C：截杀载毒信使（封闭第2章深渊格+延缓泄压）',cls:bf.courierFate==='intercepted'?'gold':bf.courierFate?'dim':'',unlocked:bf.courierFate==='intercepted'},
     {label:'分支 D：信使逃脱（触发轨道列车截击+赤蛛进化）',cls:bf.courierFate==='escaped'?'red':bf.courierFate?'dim':'',unlocked:bf.courierFate==='escaped'}
    ]
   },
   {
    ch:'CHAPTER 02',
    name:'玻璃花园 · B-04 八角生态环',
    state:step>1?'done':step===1?'current':'locked',
    desc:step>=1?'4 对 4 生态冷却环争夺战。前序蝴蝶效应已实时改变本关地形与初始兵力。':'【未解锁节点】需沿线性剧情完成第一章后自动进入。',
    branches:[
     {label:'分支 A：保住弥砂（焊接第3章天桥外侧踏板+触发三塔过载）',cls:bf.misaFate==='saved'?'gold':bf.misaFate?'dim':'',unlocked:bf.misaFate==='saved'},
     {label:'分支 B：弥砂被红蜘蛛寄生（触发熔心死守+天桥腐蚀）',cls:bf.misaFate==='infected'?'red':bf.misaFate?'dim':'',unlocked:bf.misaFate==='infected'}
    ]
   },
   {
    ch:'CHAPTER 03',
    name:'断轨天桥 · C-07 沙漏双桥',
    state:step>2?'done':step===2?'current':'locked',
    desc:step>=2?'高轨断桥方舟密钥护送战。两侧深渊坍塌倒计时受第二章战果直接影响。':'【未解锁节点】需沿线性剧情推进解锁。',
    branches:[
     {label:'分支 A：方舟密钥送抵北端（触发胸甲共鸣审判+第4章全队同步+1）',cls:bf.bridgeKey==='egis'?'gold':bf.bridgeKey?'dim':'',unlocked:bf.bridgeKey==='egis'},
     {label:'分支 B：密钥落入赤巢（触发双核夺密+第4章敌方哨塔强化）',cls:bf.bridgeKey==='hive'?'red':bf.bridgeKey?'dim':'',unlocked:bf.bridgeKey==='hive'}
    ]
   },
   {
    ch:'CHAPTER 04',
    name:'镜室叛歌 · D-00 十字棱镜殿',
    state:step>3?'done':step===3?'current':'locked',
    desc:step>=3?'5 对 5 量子镜像库中枢决战。解开朔夜最初的记忆签名。':'【未解锁节点】需沿线性剧情推进解锁。',
    branches:[
     {label:'命运抉择：保留她们真正的名字 vs 切断人格链',cls:C?.flags?.mercy!==null?'gold':'dim',unlocked:C?.flags?.mercy!==null}
    ]
   },
   {
    ch:'CHAPTER 05',
    name:'赤巢零点 · Ω-00 阶梯母巢王座',
    state:step===4?'current':'locked',
    desc:step>=4?'6 对 6 终局审判。前四章积累的全部蝴蝶效应在此汇流！':'【未解锁终局】所有前序章节的蝴蝶效应将共同决定最终结局。',
    branches:[
     {label:'多重结局：根据全战役存活机娘、感染状态与因果抉择自动触发',cls:'dim',unlocked:false}
    ]
   }
  ];

  const html=`<div class="manual-note"><b>🦋《底特律：变人》式纯线性因果世界线（无自由选关 · 每一步皆有后果）</b><br>本作采用严格的<b>单向线性推进机制</b>：不设选关菜单，你在每一场战斗中是否保住同伴、是否截住信使、做出的每一次剧场抉择，都会实时改写后续章节的物理地形、登场首领与幕间遭遇战。</div>
  <div class="m27-detroit-tree" style="margin-top:12px">
   ${nodes.map(n=>`<div class="m27-detroit-node ${n.state}">
    <div class="m27-detroit-step"><small>${n.ch}</small><strong>${n.state==='done'?'✓ 已完成':n.state==='current'?'▶ 当前章节':'🔒 未知命运'}</strong></div>
    <div>
     <h3 style="margin:0 0 4px;font-size:16px;color:#fff">${n.name}</h3>
     <p style="margin:0;font-size:12.5px;color:#b8cedc;line-height:1.45">${n.desc}</p>
     <div class="m27-detroit-branches">
      ${n.branches.map(b=>`<span class="m27-branch-pill ${b.cls}">${b.unlocked?'🦋 已激活 · ':''}${b.label}</span>`).join('')}
     </div>
    </div>
   </div>`).join('')}
  </div>`;
  openModal('蝴蝶效应 · 线性因果世界线树','DETROIT-STYLE CAUSALITY FLOWCHART',html);
 }

 /* =========================================================================
    6. DYNAMIC LIVING CARDS, CHEST SPIDER EMBLEM & DYNAMIC PERSONA EVOLUTION
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

 const MAP_THEMES_26={0:'dock',1:'garden',2:'bridge',3:'mirror',4:'core'};
 const MAP_SHAPE_NAMES_26={
  0:'狭长气闸廊 · 3v3先遣战',
  1:'八角生态双环',
  2:'沙漏断轨双桥',
  3:'十字棱镜圣殿',
  4:'阶梯母巢王座',
  siege:'熔心六角堡',
  heist:'菱形金库',
  blackout:'裂谷暗夜廊',
  awakening:'王座八角场',
  convoy:'磁浮峡谷轨',
  overload:'三角电容阵',
  quarantine:'坍缩孤岛'
 };
 let lastMountedTheme27=null;
 const m26BaseRenderBoard=renderBoard;
 renderBoard=function(){
  const r=m26BaseRenderBoard.apply(this,arguments);
  try{
   const bd=$('board');
   if(bd&&S){
    const k=S.kind24||S.kind23;
    const theme=k==='siege'||k==='overload'?'core':k==='heist'||k==='awakening'?'mirror':k==='blackout'?'garden':(MAP_THEMES_26[S.mid]||'dock');
    bd.dataset.theme=theme;
    if(lastMountedTheme27!==theme||!document.querySelector('.m27-prop')){
     lastMountedTheme27=theme;
     mountHearthstoneDioramaProps(theme);
    }
    // Populate .cell.void chasm tiles with Hearthstone-style interactive 3D top-down scenery miniatures
    const voidIcons={dock:['relay','lock','cube'],garden:['core','cube','relay'],bridge:['exit','relay','lock'],mirror:['cube','eye','core'],core:['spider','core','lock']}[theme]||['relay','cube'];
    const voidMsgs={
     dock:'【3D 场景组件 · 气闸机械】悬空走廊外侧的深空锚点正在运转。',
     garden:'【3D 场景组件 · 生态培养皿】深渊下方的低温培养罐泛着微光。',
     bridge:'【3D 场景组件 · 轨道桥墩】断裂天桥外侧的磁浮稳压器闪烁着电火花。',
     mirror:'【3D 场景组件 · 记忆棱柱】全息棱柱在深渊中投射出三千人的记忆残影。',
     core:'【3D 场景组件 · 母巢苗床】深渊裂隙中的机械卵囊正在随母巢心跳搏动。'
    };
    bd.querySelectorAll('.cell.void').forEach((cell,idx)=>{
     if(!cell.querySelector('.m27-void-prop')){
      const ic=voidIcons[idx%voidIcons.length];
      const prop=document.createElement('span');
      prop.className='m27-void-prop';
      prop.title='点击互动：3D 战场沙盘环境组件';
      prop.innerHTML=svg(ic);
      prop.onclick=(ev)=>{
       ev.stopPropagation();
       prop.classList.remove('m27-prop-burst');
       void prop.offsetWidth;
       prop.classList.add('m27-prop-burst');
       try{if(typeof sfx==='function')sfx('select');}catch(_){}
       try{radio('战场环境组件',voidMsgs[theme]||voidMsgs.dock);}catch(_){}
      };
      cell.appendChild(prop);
     }
    });
    const locEl=$('mission-location');
    if(locEl){
     const shapeLabel=MAP_SHAPE_NAMES_26[k]||MAP_SHAPE_NAMES_26[S.mid]||'异形战术沙盘';
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
      strip.title='点击查看《底特律：变人》式线性因果世界线树';
      strip.onclick=()=>openDetroitFlowchart27();
      panel.appendChild(strip);
     }
     const items=bf.echoes.slice(-2);
     strip.innerHTML=`<div class="m26-butterfly-strip-title"><span>🦋 蝴蝶效应 · 因果回响</span><span>查看世界线 ↗</span></div>`+
      items.map(e=>`<div class="m26-butterfly-item"><b>${esc(e.title)}</b>：${esc(e.effect)}</div>`).join('');
    }else if(strip){
     strip.remove();
    }
   }
  }catch(e){}
  return r;
 };

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
    7. EMBEDDED FULL-BLEED VIEWPORT SIZING & DIEGETIC CONTROLS (NO LEVEL SELECT)
    ========================================================================= */
 function syncInGameClass26(){
  const inGame=!!($('game')&&!$('game').hidden);
  document.body.classList.toggle('m26-in-game',inGame);
  document.body.classList.remove('m26-3d');
 }

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
   const baseSize=Math.max(460,Math.min(availW,availH,860));
   surround.style.width=Math.round(baseSize)+'px';
   surround.style.minWidth=Math.round(baseSize)+'px';
   surround.style.maxWidth='none';
  };
 }

 function setupDiegeticControls26(){
  if($('m26-top-controls'))return;
  const topBar=document.createElement('div');
  topBar.id='m26-top-controls';
  topBar.innerHTML=`
   <button type="button" class="m26-corner-pill gold" id="m27-causality-btn" title="查看《底特律：变人》式线性蝴蝶效应世界线树">🦋 因果世界线</button>
   <button type="button" class="m26-corner-pill" id="m26-cmd-btn" title="打开战术终端菜单（角色图鉴/AI强度/音效/重开）">≡ 战术终端</button>
  `;
  document.body.appendChild(topBar);

  const drawer=document.createElement('aside');
  drawer.id='m26-drawer';
  drawer.hidden=true;
  drawer.innerHTML=`
   <div class="m26-drawer-sec">
    <small>CAUSALITY & ARCHIVE / 因果与角色图鉴</small>
    <div class="m26-drawer-grid">
     <button type="button" class="m26-drawer-btn" data-m26-act="causality">🦋 因果世界线树</button>
     <button type="button" class="m26-drawer-btn" data-m26-act="archive">角色图鉴 (18人)</button>
     <button type="button" class="m26-drawer-btn" data-m26-act="cg">剧情 CG 画廊</button>
     <button type="button" class="m26-drawer-btn" data-m26-act="casefile">调查卷宗记录</button>
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
     <button type="button" class="m26-drawer-btn" data-m26-act="retry">重开当前章节</button>
     <button type="button" class="m26-drawer-btn" data-m26-act="menu">系统菜单 / 主界面</button>
    </div>
   </div>
  `;
  document.body.appendChild(drawer);

  $('m27-causality-btn').onclick=()=>{
   drawer.hidden=true;
   openDetroitFlowchart27();
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
   if(act==='causality')openDetroitFlowchart27();
   else if(act==='archive')$('archive-btn')?.click();
   else if(act==='cg')$('cg-gallery-btn')?.click();
   else if(act==='casefile')$('casefile-btn')?.click();
   else if(act==='help')$('help-btn')?.click();
   else if(act==='audio')$('audio-btn')?.click();
   else if(act==='retry')$('retry-btn')?.click();
   else if(act==='menu')$('menu-btn')?.click();
  });

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
    8. REALTIME TOP-DOWN AMBIENT ENVIRONMENT CANVAS (#m26-env-canvas)
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

   ctx.save();
   if(mid===0||mid===2){
    const grad=ctx.createRadialGradient(w*0.5,h*1.28,h*0.3,w*0.5,h*1.28,h*0.92);
    grad.addColorStop(0,'rgba(75,185,255,0.2)');
    grad.addColorStop(0.45,'rgba(30,110,200,0.07)');
    grad.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=grad;
    ctx.fillRect(0,0,w,h);
   }else if(mid===1){
    const grad=ctx.createRadialGradient(w*0.5,h*0.5,h*0.1,w*0.5,h*0.5,h*0.7);
    grad.addColorStop(0,'rgba(80,230,180,0.08)');
    grad.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=grad;
    ctx.fillRect(0,0,w,h);
   }else if(mid===4){
    const pulse=0.11+0.04*Math.sin(t*2.2);
    const grad=ctx.createRadialGradient(w*0.5,h*0.5,10,w*0.5,h*0.5,h*0.65);
    grad.addColorStop(0,`rgba(255,40,75,${pulse})`);
    grad.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=grad;
    ctx.fillRect(0,0,w,h);
   }

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
  openDetroitFlowchart27
 };
})();
