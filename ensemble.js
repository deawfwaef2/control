/* M5/M9/M11/M14 Grand Ensemble, 18 Mecha-Girls Deep Persona Archive & Connected 15-Node Branching Campaign Tree.
   Loaded after campaign.js. All 18 Mecha-Girls start in Justice Form (side='g'); zero spoilers on locked nodes. */
let archiveState='current';
const gallerySide=id=>{
 if(archiveState==='g'||archiveState==='r')return archiveState;
 if(location.hash==='#qa')return S?.units.find(u=>u.char===id)?.side||C?.roster[id]?.side||CHAR[id].origin;
 return S?.units.find(u=>u.char===id)?.side||C?.roster[id]?.side||'g';
};

/* Exact normalized (768x1024) chest-center spider coordinates for subtle ruby-core pulse */
const LIVE_RIG_COORDS={
 lyra:{cx:384,cy:568},iris:{cx:394,cy:588},lark:{cx:354,cy:605},
 sera:{cx:384,cy:588},psalm:{cx:384,cy:578},vega:{cx:384,cy:568},
 ruby:{cx:384,cy:572},june:{cx:364,cy:578},noct:{cx:414,cy:632},
 akira:{cx:384,cy:572},veil:{cx:394,cy:578},misa:{cx:364,cy:595},
 astra:{cx:332,cy:515},kuro:{cx:352,cy:660},celia:{cx:342,cy:550},
 nyx:{cx:382,cy:640},echo:{cx:352,cy:615},sola:{cx:362,cy:600}
};

/* 15 Connected Branching Operations — Every single mission sits on a connected branch line (parents -> nextOps)
   with explicit chapter-to-chapter continuity and zero spoilers for locked stages. */
const SUB_OPERATIONS=[
 {id:'op-1-1',code:'OP 1–1',name:'死寂接舷',route:'main',routeLabel:'第 I 幕 · 接驳主轴起点',baseMid:0,sector:'dock',location:'A–01 接驳主甲板',
  parents:[],nextOps:['op-1-2','op-1-3','op-2-1','op-3-1'],nodePos:{x:58,y:125},
  chars:['lyra','akira','iris','kuro','sola','lark'],
  continuity:'【战役起点】：苍穹防线全员以清醒的「正义形态」登陆失联的天穹空间站 A–01 甲板。',
  desc:'全员机娘处于正义形态，迎战赤巢蛛皇派出的首批赤红机械蜘蛛群。先占领 C4 接驳门禁台，再夺取 D8 主中继并拦截载毒信使。',
  intro:[
   {who:'lyra',side:'g',camera:'medium',text:'全员注意，我们已登陆 A–01 接驳甲板！目前所有姐妹均保持清醒的【正义形态】，千万提防棋盘上的赤红机械蜘蛛扑击胸口！'},
   {who:'iris',side:'g',camera:'close',text:'先派前锋占领中央偏西的【C4 接驳门禁台】解开北侧通道，再向北接管 D8 主中继站并截杀东侧载毒信使！'}
  ]},
 {id:'op-1-2',code:'OP 1–2',name:'气闸封锁线',route:'alpha',routeLabel:'第 II 幕 · α前哨气闸分支',baseMid:0,sector:'airlock',location:'A–02 检疫气闸长廊',
  parents:['op-1-1'],nextOps:['op-2-1'],nodePos:{x:185,y:58},
  chars:['kuro','sola','lyra','lark','nyx'],walls:['2,3','5,3','2,5','5,5'],voids:['0,3','7,3'],
  continuity:'【承接 OP 1–1 死寂接舷】：突破 A–01 主甲板后，左翼突击分队沿 A–02 检疫气闸向生态冷却环推进。',
  desc:'暗影忍姬【玄羽】与熔核拳姬【阳炎】率队清理检疫气闸走廊内的赤红机械蜘蛛伏兵，打通前往 α 线生态环的航道。',
  intro:[
   {who:'kuro',side:'g',camera:'medium',text:'已由 A–01 主甲板突入 A–02 检疫气闸长廊！前方走廊即是通往生态冷却环的必经之路，大批赤红机械蜘蛛正在上方钢梁潜伏！'},
   {who:'sola',side:'g',camera:'close',text:'管它多少机械蜘蛛！只要帮我占住【C4 门禁台】打开火力通道，在这些铁蜘蛛碰到大家胸口前，本小姐一拳一个把它们全轰碎！'}
  ]},
 {id:'op-1-3',code:'OP 1–3',name:'外环信使追击战',route:'beta',routeLabel:'第 II 幕 · β/γ外环高架分支',baseMid:0,sector:'dock',location:'A–04 外环货运高架',
  parents:['op-1-1'],nextOps:['op-3-1','op-3-x'],nodePos:{x:185,y:192},
  chars:['iris','kuro','akira','june','lark'],walls:['3,2','4,2','3,5','4,5'],voids:['0,4','1,4','6,4','7,4'],
  continuity:'【承接 OP 1–1 死寂接舷】：突破 A–01 主甲板后，右翼高机动分队沿外环货运高架追击残余信使，开辟通往天桥与暗渠的航线。',
  desc:'电子战官【鸢尾】与忍姬【玄羽】跨越外环断轨裂隙，在赤巢信使逃入深层前将其截杀，打通前往轨道天桥与零重力暗渠的分支。',
  intro:[
   {who:'iris',side:'g',camera:'medium',text:'我们已从 A–01 甲板追击至 A–04 外环货运高架！打通这条高架走廊后，即可分兵前往轨道天桥或底层零重力暗渠！'},
   {who:'kuro',side:'g',camera:'close',text:'高架中段有深空裂隙，用我的越障潜行与鸢尾的跃迁脉冲跨过去，先占领 C4 门禁台再截杀信使！'}
  ]},
 {id:'op-2-1',code:'OP 2–1',name:'绝命温室',route:'alpha',routeLabel:'第 III 幕 · α生态深渊主分支',baseMid:1,sector:'garden',location:'B–04 生态冷却环',
  parents:['op-1-1','op-1-2'],nextOps:['op-2-2','op-3-1','op-4-1'],nodePos:{x:330,y:45},
  chars:['misa','sera','celia','veil','psalm','nyx'],
  continuity:'【承接 A 区突破战果】：小队突入 B–04 生态冷却环，与驻守此处的工程师弥砂、医官白栖、圣盾圣歌汇合，迎战孵化池涌出的赤蛛群。',
  desc:'周期性真空泄压的生态冷却环。先同时开启并守住 B7、G7 两座冷却阀两个轮末，再派工兵弥砂封闭中央 E5 蜘蛛孵化池总阀。',
  intro:[
   {who:'misa',side:'g',camera:'medium',text:'接驳甲板分队终于到了！中央 E5 的机械蜘蛛孵化池正处于高温锁死状态，请先帮我同时占住北侧【B7 与 G7 两座冷却阀】连续两个轮末降温！'},
   {who:'sera',side:'g',camera:'close',text:'大家保持正义形态阵型！一旦双阀降温完成，立刻派队员踏上中央 E5（或让弥砂在相邻格）点击【固守】封死蜘蛛孵化池！'}
  ]},
 {id:'op-2-2',code:'OP 2–2',name:'培养槽深渊',route:'alpha',routeLabel:'第 IV 幕 · α生态底层分支',baseMid:1,sector:'garden',location:'B–06 母本培养底层',
  parents:['op-2-1'],nextOps:['op-2-3','op-4-1'],nodePos:{x:475,y:34},
  chars:['celia','sera','misa','nyx','veil'],walls:['2,2','5,2','3,4','4,4'],voids:['0,5','7,5'],
  continuity:'【承接 OP 2–1 绝命温室】：封锁上层孵化池后，小队深入 B–06 母本培养底层，清除残余机械蜘蛛母本槽。',
  desc:'圣盾骑士【圣歌】护卫医官【白栖】与工兵【弥砂】深入培养槽底层，在赤蛛群合围下锁死底层双冷却阀。',
  intro:[
   {who:'celia',side:'g',camera:'medium',text:'上层温室已经稳住，这里是 B–06 母本培养底层！赤巢蛛皇在这里藏了备用孵化槽，白栖、弥砂，紧跟在我的光子圣盾后面推进！'},
   {who:'misa',side:'g',camera:'close',text:'明白！只要再锁死底层的 B7、G7 冷却阀并在 E5 固守隔离，整座生态环的赤蛛增殖源就彻底断绝了！'}
  ]},
 {id:'op-2-3',code:'OP 2–3',name:'毒雾排风井',route:'alpha',routeLabel:'第 IV 幕 · α排风突围分支',baseMid:1,sector:'airlock',location:'B–09 高压排风竖井',
  parents:['op-2-2','op-2-1'],nextOps:['op-4-1'],nodePos:{x:605,y:52},
  chars:['sola','misa','akira','psalm','lark'],walls:['1,3','6,3','2,5','5,5'],voids:['3,2','4,2'],
  continuity:'【承接 α 线生态环战果】：肃清培养槽后，小队穿过 B–09 高压排风竖井，向 D 区中枢主干道汇合。',
  desc:'熔核拳姬【阳炎】与先锋【绛刃】开路，协助【弥砂】在高压泄压风道中夺取双阀，打通前往中枢区的大门。',
  intro:[
   {who:'sola',side:'g',camera:'medium',text:'穿过这条 B–09 高压排风竖井就能抵达中枢区了！弥砂，你盯着中央总阀，北边那两座阀门交给我和绛刃去抢！'},
   {who:'misa',side:'g',camera:'close',text:'小心橙色闪烁的真空泄压横排！每三轮爆发一次，千万别在爆发轮停留在橙色格子里！'}
  ]},
 {id:'op-3-1',code:'OP 3–1',name:'断轨天桥',route:'beta',routeLabel:'第 III 幕 · β轨道天基主分支',baseMid:2,sector:'bridge',location:'C–07 轨道天桥',
  parents:['op-1-1','op-1-3','op-2-1'],nextOps:['op-3-2','op-2-1','op-4-1'],nodePos:{x:330,y:125},
  chars:['vega','astra','echo','june','lyra','akira'],
  continuity:'【承接前线突破战果】：小队登上悬在地球上空的 C–07 轨道天桥，与空天重卫苍澜、轨道重炮星枢汇合，护送方舟火控密钥。',
  desc:'在外侧桥面崩塌前，护送携带「方舟火控密钥」的单位推进过半，占领北端 E7 轨道锁并将密钥送入 D8/E8 交付口。',
  intro:[
   {who:'vega',side:'g',camera:'medium',text:'方舟火控密钥就在南端 D2 的运输匣里！赤巢蛛皇正在破坏外侧 C 列与 F 列的桥面承重梁，全员走中央主桥向北护送！'},
   {who:'astra',side:'g',camera:'close',text:'先护送密钥过半场，再踩开北侧【E7 轨道锁】，最后把密钥送进最北端的【D8 或 E8 交付口】！'}
  ]},
 {id:'op-3-2',code:'OP 3–2',name:'远星炮台阵',route:'beta',routeLabel:'第 IV 幕 · β天基炮台分支',baseMid:2,sector:'bridge',location:'C–09 天基磁轨炮台',
  parents:['op-3-1'],nextOps:['op-3-3','op-4-1'],nodePos:{x:475,y:115},
  chars:['astra','vega','lyra','echo','ruby'],walls:['3,3','4,3','2,5','5,5'],voids:['0,2','0,3','7,2','7,3'],
  continuity:'【承接 OP 3–1 断轨天桥】：通过轨道天桥主段后，重炮分队突入 C–09 天基磁轨炮台，争夺轨道副炮火控权。',
  desc:'轨道重炮王牌【星枢】与空天重卫【苍澜】在天基炮台迎击赤巢蛛群，护送副炮密钥锁死发射轨。',
  intro:[
   {who:'astra',side:'g',camera:'medium',text:'我们已从轨道天桥突入 C–09 天基磁轨炮台！只要把副炮火控密钥送到北端交付口，就能彻底解除赤巢对地轰炸的威胁！'},
   {who:'vega',side:'g',camera:'close',text:'全向引力护盾已展开！跟紧运输匣，不要被两侧的赤红机械蜘蛛扑上胸口！'}
  ]},
 {id:'op-3-3',code:'OP 3–3',name:'坠落残骸带',route:'beta',routeLabel:'第 IV 幕 · β失重残骸分支',baseMid:2,sector:'bridge',location:'C–12 失重残骸浮岛',
  parents:['op-3-2','op-3-x'],nextOps:['op-4-1'],nodePos:{x:605,y:132},
  chars:['vega','iris','kuro','june','veil'],walls:['3,4','4,4'],voids:['1,2','6,2','1,5','6,5','2,3','5,3'],
  continuity:'【承接 β/γ 线推进战果】：穿越炮台与暗渠交界处的 C–12 失重残骸浮岛，护送密钥直插中枢区入口。',
  desc:'布满深空裂隙的残骸浮岛战区！【苍澜】【鸢尾】【玄羽】【霁川】利用越障走法跨越断桥，将密钥送抵北端终点。',
  intro:[
   {who:'iris',side:'g',camera:'medium',text:'前方是 C–12 失重残骸浮岛，穿过这里就能直达中枢区！桥面到处都是深空裂隙，善用跳跃与折跃走法掩护运输匣！'},
   {who:'kuro',side:'g',camera:'close',text:'我的越障潜行与霁川的斑马跳可以直接越过裂隙清剿北侧的赤红蜘蛛，掩护苍澜向北突围！'}
  ]},
 {id:'op-3-x',code:'OP 3–X',name:'零重力暗渠',route:'gamma',routeLabel:'第 III 幕 · γ零重力暗渠分支',baseMid:2,sector:'airlock',location:'C–00 外骨骼零重力暗渠',
  parents:['op-1-3','op-1-1'],nextOps:['op-3-3','op-4-3'],nodePos:{x:330,y:202},
  chars:['kuro','iris','astra','echo','nyx'],walls:['2,2','5,2','2,4','5,4','2,6','5,6'],voids:['0,3','7,3','0,5','7,5'],
  continuity:'【承接 A 区外环突围】：特种潜行分队绕过正面火网，潜入空间站底部的 C–00 零重力维修暗渠奇袭敌后。',
  desc:'【玄羽】【鸢尾】【星枢】从密集掩体构成的零重力维修暗渠护送密钥直插北端轨道锁，开辟通往深层实验室的秘密航线。',
  intro:[
   {who:'kuro',side:'g',camera:'medium',text:'这里是空间站外骨骼底部的 C–00 零重力暗渠。从这里护送密钥突破 E7 轨道锁，就能绕到中枢防线背后！'},
   {who:'astra',side:'g',camera:'close',text:'笔直的暗渠走廊正好发挥我磁轨炮的三格贯通射程！任何赤红机械蜘蛛敢露头，直接轰碎！'}
  ]},
 {id:'op-4-1',code:'OP 4–1',name:'镜室叛歌',route:'main',routeLabel:'第 V 幕 · D区中枢双线汇合',baseMid:3,sector:'archive',location:'D–00 中枢镜像库',
  parents:['op-2-1','op-2-2','op-2-3','op-3-1','op-3-2','op-3-3','op-4-3'],nextOps:['op-4-2','op-4-3','op-5-1'],nodePos:{x:720,y:92},
  chars:['lyra','kuro','noct','ruby','misa','astra'],
  continuity:'【承接 α/β/γ 三大分支汇合】：各分支突击队在 D–00 中枢镜像库全员会师，与总架构师朔夜、安全官绯律联手破译母巢护盾。',
  desc:'先占领 B5 或 G5 任一终端降下中央电磁门，再同时控制双子终端，并派单位固守中央 D5/E5 同步座两轮提取破盾密钥。',
  intro:[
   {who:'lyra',side:'g',camera:'medium',text:'三大分支航线已全线汇合于 D–00 中枢镜像库！先派高机动队员占领西侧【B5】或东侧【G5】终端，降下中央电磁门！'},
   {who:'misa',side:'g',camera:'close',text:'大门降下后，同时守住 B5 与 G5 两座终端，并派队员踏入中央【D5 或 E5 同步座】坚守两个轮末，即可提取母巢破盾源码！'}
  ]},
 {id:'op-4-2',code:'OP 4–2',name:'处刑回廊',route:'main',routeLabel:'第 V 幕 · D区内务回廊分支',baseMid:3,sector:'archive',location:'D–03 内务处刑长廊',
  parents:['op-4-1'],nextOps:['op-5-1'],nodePos:{x:720,y:176},
  chars:['celia','sola','akira','ruby','nyx'],walls:['1,2','6,2','3,3','4,3','2,6','5,6'],voids:['0,4','7,4'],
  continuity:'【承接 OP 4–1 镜室叛歌】：取得中枢镜像权限后，重装攻坚队肃清 D–03 内务处刑长廊的赤蛛防线，直扑反应堆大门。',
  desc:'【圣歌】【阳炎】【绛刃】【绯律】协同推进，夺取走廊两侧 B5、G5 终端并占领中央同步座，彻底扫清通往终章反应堆的障碍。',
  intro:[
   {who:'celia',side:'g',camera:'medium',text:'穿过这条 D–03 内务长廊就是母巢反应堆的正门了！大批重装蛛卫与赤红蜘蛛正在前方列阵，全员随我突击！'},
   {who:'ruby',side:'g',camera:'close',text:'我的隔山重炮已锁定走廊主轴！先占领两侧 B5、G5 终端打开中央大门，再夺下中央同步座！'}
  ]},
 {id:'op-4-3',code:'OP 4–3',name:'记忆黑匣子核心',route:'gamma',routeLabel:'第 IV/V 幕 · γ实验室深层分支',baseMid:3,sector:'archive',location:'D–07 朔夜私人实验室',
  parents:['op-3-x','op-4-1'],nextOps:['op-4-1','op-5-1'],nodePos:{x:555,y:202},
  chars:['astra','misa','sera','noct','echo','psalm'],walls:['2,3','5,3','2,5','5,5'],voids:['3,1','4,1'],
  continuity:'【承接 γ 线零重力暗渠 / D 区镜室】：潜入 D–07 私人实验室，抢在赤巢蛛群毁灭证据前提取初代破盾黑匣子。',
  desc:'深入私人实验室，在赤巢精锐蛛群围堵下同步 B5、G5 双子终端并固守中央 D5/E5 两轮，解码初代破盾原件。',
  intro:[
   {who:'misa',side:'g',camera:'medium',text:'我们已从暗渠潜入 D–07 实验室！只要联通两侧 B5、G5 终端并在中央 D5/E5 坚守两轮，就能拿到完整的初代破盾源码！'},
   {who:'sera',side:'g',camera:'close',text:'实验室北侧有大量赤红机械蜘蛛正在逼近，大家注意保护胸甲，绝不能被赤蛛扑中！'}
  ]},
 {id:'op-5-1',code:'OP 5–1',name:'赤巢零点',route:'omega',routeLabel:'第 VI 幕 · Ω区终章主线决战',baseMid:4,sector:'reactor',location:'Ω–00 母巢反应堆',
  parents:['op-4-1','op-4-2','op-4-3'],nextOps:['op-5-2'],nodePos:{x:838,y:86},
  chars:['lyra','akira','misa','astra','noct','vega','celia','kuro','sola'],
  continuity:'【承接 D 区破盾战果】：携带破盾源码正式杀入 Ω–00 母巢反应堆，直面盘踞在 E8 王座的机械蜘蛛最高领袖【赤巢蛛皇】！',
  desc:'同时控制 B6/G6 双护盾终端两轮，抵近 E8 内核旁点击「固守」斩断近场总线，最后攻入 E8 彻底摧毁赤巢蛛皇内核！',
  intro:[
   {who:'misa',side:'g',camera:'medium',text:'已突入 Ω–00 母巢反应堆！记住破盾三步曲：①同时占住 B6 与 G6 护盾终端两轮；②抵近 E8 内核旁点【固守】断链；③攻入 E8 击碎赤巢蛛皇！'},
   {who:'lyra',side:'g',camera:'close',text:'苍穹防线全军突击！一鼓作气终结赤巢蛛皇与机械蜘蛛病毒！'}
  ]},
 {id:'op-5-2',code:'OP 5–2',name:'苍穹坠落·终焉决战',route:'omega',routeLabel:'第 VI 幕 · Ω区全员终极决战',baseMid:4,sector:'reactor',location:'Ω–99 天穹轨道核心王座',
  parents:['op-5-1'],nextOps:[],nodePos:{x:838,y:172},
  chars:['lyra','akira','astra','celia','kuro','sola','noct','ruby','nyx','echo'],walls:['2,3','5,3','3,5','4,5'],voids:['0,2','7,2','0,4','7,4'],
  continuity:'【承接 OP 5–1 赤巢零点】：深入 Ω–99 轨道核心最深处，与狂暴化的赤巢蛛皇展开最终宿命总决战！',
  desc:'全阵容女武神宿命集结！在轨道核心之巅展开最高烈度的终极决战，破除双终端护盾并彻底粉碎 E8 赤巢蛛皇王座！',
  intro:[
   {who:'lyra',side:'g',camera:'medium',text:'这里是 Ω–99 天穹轨道核心最深处！夺取 B6、G6 双终端，近场斩断内核总线，彻底粉碎 E8 赤巢蛛皇的最终王座！'}
  ]}
];

/* Helper: Determine which sub-operations are unlocked vs locked behind anti-spoiler fog-of-war */
function getCampaignUnlockState(){
 const done=new Set(C?.completedOps||[]);
 if(C?.history)C.history.forEach(h=>{
  const mainMap={0:'op-1-1',1:'op-2-1',2:'op-3-1',3:'op-4-1',4:'op-5-1'};
  if(mainMap[h.mid])done.add(mainMap[h.mid]);
 });
 const curOp=S?.subOp||({0:'op-1-1',1:'op-2-1',2:'op-3-1',3:'op-4-1',4:'op-5-1'}[S?.mid||0])||'op-1-1';
 const unlocked=new Set(['op-1-1',curOp,...done]);
 // Unlock immediate child branch nodes of any completed node or current node
 for(const op of SUB_OPERATIONS){
  if(done.has(op.id)||op.id===curOp){
   (op.nextOps||[]).forEach(nid=>unlocked.add(nid));
  }
  if((op.parents||[]).some(pid=>done.has(pid))){
   unlocked.add(op.id);
  }
 }
 return{done,curOp,unlocked};
}

function showArchivePortrait(id,side=gallerySide(id)){
 const d=CHAR[id],p=PERSONA[id]||{};if(!d)return;
 openModal(d.name+' · '+(p.archetype||d.role)+' / '+(side==='r'?'胸口红蜘蛛控制态':'正义自主形态'),'PERSONNEL DOSSIER / 角色深度人设与走法档案',`
  <button class="text-button gallery-back" data-gallery-back>← 返回十八名美少女机娘总览</button>
  <div class="full-portrait" data-portrait-character="${id}">
   <div class="live-portrait-stage ${side}">
    <img src="${portraitSource(id,side)}" alt="${d.name} / ${side==='r'?'控制态':'自主态'}完整立绘">
   </div>
   <div class="persona-detail-pane">
    <span>${d.code} / ${d.en} / ${d.age}岁 · ${p.squad||''}</span>
    <h3>${d.name} <small>${p.archetype||d.role}</small></h3>
    <div class="archive-tabs">
     <button data-portrait-id="${id}" data-portrait-state="g" class="${side==='g'?'active':''}">正义自主态（未寄生）</button>
     <button data-portrait-id="${id}" data-portrait-state="r" class="${side==='r'?'active':''}">受控态预览（胸口正中红蜘蛛）</button>
    </div>
    <div class="persona-specs">
     <div><b>专属装甲</b><span>${p.frame||'苍穹制式机动外骨骼'}</span></div>
     <div><b>标志武装</b><span>${p.weapon||'高周波战术武装'}</span></div>
     <div><b>战棋走法</b><span>${d.role}（${d.rune}）· ${d.rule}</span></div>
     <div><b>同步 II</b><span>${d.upgrade}</span></div>
    </div>
    <div class="persona-psych ${side}">
     <h4>${side==='r'?'胸口红蜘蛛寄生状态（被赤蛛扑击后触发）':'正义自主人格与战术信念（开局默认状态）'}</h4>
     <p>${side==='r'?(p.psychInfected||d.bio):(p.psychClean||d.bio)}</p>
    </div>
    <div class="persona-bonds">
     <h4>角色关系网与战术协同</h4>
     ${(p.bonds||[d.trait]).map(b=>`<p>• ${b}</p>`).join('')}
    </div>
    <div class="persona-voices">
     <h4>情境语音台词（点击在电台播报）</h4>
     <div class="voice-buttons">
      <button type="button" data-voice-char="${id}" data-voice-key="select">点选出击</button>
      <button type="button" data-voice-char="${id}" data-voice-key="move">机动推进</button>
      <button type="button" data-voice-char="${id}" data-voice-key="attack">致命破阵</button>
      <button type="button" data-voice-char="${id}" data-voice-key="infected">胸口寄生剧情</button>
     </div>
     <blockquote id="persona-voice-preview">“${side==='r'?(p.voice?.infected||d.quote):(p.voice?.select||d.quote)}”</blockquote>
    </div>
    <p class="gallery-preview-note">预览仅切换立绘与人设档案，不会改变当前战役中的实际阵营或消耗行动。</p>
   </div>
  </div>`);
}

showArchive=function(){
 const stateOf=gallerySide;
 openModal('十八名二次元美少女机娘 · 深度人设与独创走法总览','AEGIS & HIVE / 18 MECHA GIRLS ROSTER',`
  <div class="archive-intro">
   <p class="manual-lead">天穹空间站战役 · 全阵容 <b>18 名二次元美少女机娘</b>。<br>开局全员均为清醒的<b>【正义自主形态】</b>；唯有在战斗中被赤红机械蜘蛛扑中，蜘蛛装置才会从棋盘消失并融进她胸口正中央，触发专属受控剧情。</p>
   <div class="archive-tabs">
    <button data-gallery-state="current" class="${archiveState==='current'?'active':''}">当前战役状态</button>
    <button data-gallery-state="g" class="${archiveState==='g'?'active':''}">正义自主态预览（18人）</button>
    <button data-gallery-state="r" class="${archiveState==='r'?'active':''}">受控态预览（胸口正中红蜘蛛）</button>
   </div>
   <small>受控态下胸口正中央嵌有发光赤红机械蜘蛛，双眸同步转为绯红；点击任意立绘可查看完整大图与深度人设。</small>
  </div>
  <div class="archive-grid">${Object.entries(CHAR).map(([id,d])=>{
   const p=PERSONA[id]||{},rec=C?.roster[id],side=stateOf(id);
   const status=rec?.status==='destroyed'?'永久损毁':rec?.status==='retired'?'已隔离离场':rec?.introduced?'已参战':'后续分支登场';
   return`<article class="archive-card ${side==='r'?'is-infected-preview':''}" data-character="${id}" data-status="${rec?.status||'active'}">
    <button type="button" class="archive-photo" data-gallery-portrait="${id}" aria-label="查看${d.name}完整立绘与人设">
     <img src="${portraitSource(id,side)}" alt="${d.name} / ${side==='r'?'控制态':'自主态'}" loading="lazy">
     <span class="archive-state ${side}">${side==='r'?'胸口赤蛛寄生':'正义自主形态'} / ${status}</span>
     <span class="archive-open">查看深度人设 ↗</span>
    </button>
    <div class="archive-info">
     <span>${d.code} / ${d.en} / ${d.age}岁</span>
     <h3>${d.name} <small>${p.archetype||''}</small></h3>
     <b>${d.role} · 【${d.rune}】 · ${p.weapon||''}</b>
     <p>${side==='r'?(p.psychInfected||d.bio):(p.psychClean||d.bio)}</p>
     <p class="archive-rule-line">${d.rule}</p>
     <small>${(p.bonds&&p.bonds[0])||d.upgrade}</small>
    </div>
   </article>`;
  }).join('')}</div>`);
};
$('archive-btn').onclick=showArchive;

/* Launch any connected node on the 15-Stage Branching Campaign Tree */
function launchSubOperation(opId){
 const op=SUB_OPERATIONS.find(o=>o.id===opId);if(!op)return;
 closeModal();
 if(!C)newCampaign(homeSide||'g');
 C.currentSubOp=op.id;
 if(!Array.isArray(C.completedOps))C.completedOps=[];
 for(const cid of op.chars){
  if(C.roster[cid]&&C.roster[cid].status==='active')C.roster[cid].introduced=true;
 }
 S=makeMission(op.baseMid);
 S.subOp=op.id;
 S.subOpName=`${op.code} · ${op.name}`;
 S.subOpSector=op.sector;
 if(op.walls)S.walls=[...op.walls];
 if(op.voids)S.voids=[...op.voids];
 // Keep the board focused on this operation's featured characters so nobody appears unintroduced
 S.units=S.units.filter(u=>!u.char||op.chars.includes(u.char));
 const freeSpot=side=>{
  const rows=side==='g'?[7,6,5]:[0,1,2];
  for(const y of rows)for(let x=0;x<8;x++){
   const k=key(x,y);
   if(!S.walls.includes(k)&&!S.voids.includes(k)&&!unitAt(S,x,y))return[x,y];
  }
  return null;
 };
 for(const cid of op.chars){
  const rec=C.roster[cid];
  if(rec&&rec.status==='active'&&!S.units.some(u=>u.char===cid)){
   const pt=freeSpot(rec.side);
   if(pt)spawn(S,'mech',rec.side,pt[0],pt[1],cid);
  }
 }
 // Ensure Red Hive (Spider Overmind) has an active swarm of Red Mechanical Spiders on the north side
 if(location.hash!=='#qa'){
  const spiderCount=S.units.filter(u=>u.kind==='spider'&&u.side==='r'&&!u.dead).length;
  const needSpiders=Math.max(0,4-spiderCount);
  for(let i=0;i<needSpiders;i++){
   const pt=freeSpot('r');
   if(pt)spawn(S,'spider','r',pt[0],pt[1]);
  }
 }
 S.initial=S.units.filter(u=>u.char).map(u=>({char:u.char,side:u.side}));
 selected=movers(S,C.side).find(u=>u.char)?.uid||movers(S,C.side)[0]?.uid;
 checkpoint={c:clone(C),s:clone(S)};
 $('home').hidden=true;$('result').hidden=true;
 render();persist();
 const sceneName=op.sector==='garden'?'garden':op.sector==='bridge'?'bridge':op.sector==='archive'?'archive':op.sector==='reactor'?'reactor':'station';
 const mapMarkers=typeof activeGameplayMarkers==='function'?activeGameplayMarkers(S):[];
 const charFrames=op.chars.map((cid,idx)=>{
  const u=S.units.find(x=>x.char===cid&&onBoard(x));
  const introLine=(op.intro||[]).find(l=>l.who===cid);
  const p=PERSONA[cid]||{};
  const side=u?.side||C.roster[cid]?.side||'g';
  const text=introLine&&side==='g'?introLine.text:(side==='r'?(p.voice?.infected||CHAR[cid]?.quote):(p.voice?.select||CHAR[cid]?.quote))||`${CHAR[cid]?.name}已抵达${op.location}！`;
  return echoLine(cid,text,{
   side,camera:idx===0?'medium':'close',axis:side==='r'?'right':'left',
   stageStep:'units',
   revealUnits:idx===op.chars.length-1?[cid,'spider','drone','sentinel','courier','capsule','hive']:[cid],
   focusCell:u?[u.x,u.y]:null,
   caption:`第 2 步 · 单位逐一降临：${u?'['+xy(u.x,u.y)+'] ':''}${CHAR[cid]?.name||cid}（${side==='r'?'受控态':'正义形态'}）登场发言`,
   unitSpeech:`${CHAR[cid]?.name||cid}${u?' ['+xy(u.x,u.y)+']':''}：${text.slice(0,24)}`
  });
 });
 const subFrames=[
  echoCard(`${op.code} · ${op.name}`,`${op.routeLabel} / ${op.location}`,[
   `推演第 1 步：展示 ${op.location} 8×8 空地图地形`,
   `推演第 2 步：参战机娘（${op.chars.map(c=>CHAR[c]?.name).join('、')}）逐一降临发言`,
   `推演第 3 步：锁定当前阶段任务标记（不剧透后续关卡）`
  ],`${op.continuity} ${op.desc}`,{
   who:op.chars[0]||'lyra',side:C.side,scene:sceneName,sound:'cut',
   cgBanner:{title:`${op.code} · ${op.name}`,sub:`${op.routeLabel} · ${op.location}`},
   stageStep:'map',revealUnits:[],markers:mapMarkers
  }),
  echoLine('noct',`【赤巢蛛皇 · 母巢主宰】：${op.location}已被纳入我的母巢神经网！赤红机械蜘蛛群听令——一旦扑中机娘，蜘蛛装置将从棋盘消失并直接融进她胸口正中，将她化为我的受控容器！`,{
   overmind:true,side:'r',scene:sceneName,sound:'pulse',camera:'establish',axis:'right',
   stageStep:'map',revealUnits:[],markers:mapMarkers,
   caption:`第 1 步 · 8×8 空地图地形展示 & 赤巢蛛皇宣战`
  }),
  ...charFrames,
  echoLine(op.chars[0]||'lyra',`【第 3 步 · 任务标记与路线推演锁定】：全员看清棋盘上的目标标记，严防赤红蜘蛛扑击胸口，按阶段夺取战区控制权！`,{
   side:C.side,camera:'close',sound:'knock',
   stageStep:'markers',revealUnits:['ALL'],
   focusCell:mapMarkers[0]?[mapMarkers[0].x,mapMarkers[0].y]:[3,4],
   markers:mapMarkers,
   caption:`第 3 步 · 任务标记演出：锁定 ${op.name} 当前阶段目标`
  })
 ];
 if(!qaSilent)playStory(subFrames,()=>{render();},`${op.code} · ${op.name}`);
}

/* Connected 15-Node Branching Campaign Tree Modal (Zero Disconnected Missions, Zero Spoilers) */
function showCampaignMap(){
 const {done,curOp,unlocked}=getCampaignUnlockState();
 const opMap=Object.fromEntries(SUB_OPERATIONS.map(o=>[o.id,o]));

 // Build SVG edges for EVERY parent -> child connection in SUB_OPERATIONS
 let edgesSvg='';
 for(const op of SUB_OPERATIONS){
  for(const nextId of (op.nextOps||[])){
   const dst=opMap[nextId];if(!dst)continue;
   const activeEdge=(done.has(op.id)||curOp===op.id)&&unlocked.has(dst.id);
   const stroke=activeEdge?(dst.route==='alpha'?'#4ce0b3':dst.route==='beta'?'#63d9ff':dst.route==='gamma'?'#ff5e7e':dst.route==='omega'?'#ffcc4d':'#7ee0ff'):'rgba(110,150,175,0.28)';
   const width=activeEdge?'3':'1.8';
   const dash=activeEdge?'':'5 4';
   edgesSvg+=`<path d="M${op.nodePos.x},${op.nodePos.y} C${(op.nodePos.x+dst.nodePos.x)/2},${op.nodePos.y} ${(op.nodePos.x+dst.nodePos.x)/2},${dst.nodePos.y} ${dst.nodePos.x},${dst.nodePos.y}" fill="none" stroke="${stroke}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
  }
 }

 let nodesSvg='';
 for(const op of SUB_OPERATIONS){
  const isDone=done.has(op.id),isCur=curOp===op.id,isOpen=unlocked.has(op.id);
  const stroke=isCur?'#ffd257':isDone?'#46e89a':isOpen?(op.route==='alpha'?'#4ce0b3':op.route==='beta'?'#63d9ff':op.route==='gamma'?'#ff5e7e':'#c792ea'):'#425868';
  const fill=isCur?'#3a2c0f':isDone?'#0f2e22':isOpen?'#132436':'#0a121a';
  const shortCode=op.code.replace('OP ','');
  const labelText=isOpen?op.name:'◆ 加密战区';
  const labelY=op.nodePos.y<80?op.nodePos.y-22:op.nodePos.y+30;
  nodesSvg+=`
   <g class="starmap-node-group ${isOpen?'is-open':'is-locked'}" data-map-node="${op.id}" style="cursor:${isOpen?'pointer':'not-allowed'}">
    ${isCur?`<circle cx="${op.nodePos.x}" cy="${op.nodePos.y}" r="22" fill="none" stroke="#ffd257" stroke-width="2" stroke-dasharray="4 3"/>`:''}
    <circle cx="${op.nodePos.x}" cy="${op.nodePos.y}" r="16" fill="${fill}" stroke="${stroke}" stroke-width="2.6"/>
    <text x="${op.nodePos.x}" y="${op.nodePos.y+5}" font-size="13" fill="${isOpen?'#ffffff':'#6e8798'}" font-weight="800" text-anchor="middle">${shortCode}</text>
    <text x="${op.nodePos.x}" y="${labelY}" font-size="13" fill="${isCur?'#ffd257':isDone?'#78f0b8':isOpen?'#d6ecfa':'#5d7485'}" font-weight="700" text-anchor="middle">${labelText}</text>
   </g>`;
 }

 openModal('天穹空间站 · 全连贯分支战役树（严防剧透 · 全节点在线）','CONNECTED BRANCHING CAMPAIGN TREE / ZERO SPOILERS',`
  <div class="starmap-wrap">
   <div class="starmap-header">
    <p>全战役 <b>15 个战术关卡全部部署在连贯的分支航线上</b>（从第 I 幕接驳突入 ➔ α 生态环 / β 轨道天桥 / γ 零重力暗渠三大分支 ➔ D 区中枢汇合 ➔ Ω 区决战）。<b>未抵达的后续分支节点自动启用战术迷雾加密，绝不提前剧透剧情与首领信息！</b></p>
   </div>
   <svg class="starmap-svg" viewBox="0 0 900 245" aria-label="15节点连贯分支战役树">
    ${edgesSvg}
    ${nodesSvg}
   </svg>
   <div class="subop-grid">
    ${SUB_OPERATIONS.map(op=>{
     const isDone=done.has(op.id),isCur=curOp===op.id,isOpen=unlocked.has(op.id);
     const parentNames=(op.parents||[]).map(pid=>opMap[pid]?.code||pid).join(' / ');
     const nextNames=(op.nextOps||[]).map(nid=> unlocked.has(nid)?(opMap[nid]?.code+' '+opMap[nid]?.name):(opMap[nid]?.code+' ◆加密节点')).join(' ➔ ');
     if(!isOpen){
      return`<article class="subop-card route-${op.route} locked-node" data-subop-card="${op.id}">
       <div class="subop-top">
        <span class="subop-code">${op.code} · ${op.routeLabel}</span>
        <strong class="subop-status locked">◆ 航线迷雾加密</strong>
       </div>
       <h3>◆ 机密战区 [${op.code}]</h3>
       <small>前置分支要求：需先完成 ${parentNames||'前置主线节点'}</small>
       <p class="spoiler-shield-note">【深空战术迷雾已启用】：为保障剧情连贯与电影悬念感，在推进至本分支节点前，战区简报、机关机制与登场角色名单均处于加密状态（拒绝剧透）。</p>
       <div class="subop-branch-links"><span>分支衔接：${parentNames} ━━► ${op.code} ━━► ${op.nextOps?.length?op.nextOps.map(n=>opMap[n]?.code).join('/'):'终局'}</span></div>
       <button type="button" class="button ghost subop-launch" disabled>◆ 完成前置分支 (${parentNames}) 后解锁</button>
      </article>`;
     }
     return`<article class="subop-card route-${op.route} ${isCur?'current':''} ${isDone?'completed':''}" data-subop-card="${op.id}">
      <div class="subop-top">
       <span class="subop-code">${op.code} · ${op.routeLabel}</span>
       <strong class="subop-status">${isCur?'● 当前所在分支':isDone?'✓ 已肃清节点':'◉ 分支可出击'}</strong>
      </div>
      <h3>${op.name}</h3>
      <small>${op.location}</small>
      <div class="subop-continuity-box">${esc(op.continuity)}</div>
      <p>${esc(op.desc)}</p>
      <div class="subop-branch-links"><span>后续连贯分支：${nextNames||'战役终局顶点'}</span></div>
      <div class="subop-avatars">
       ${op.chars.map(cid=>{
        const cSide=typeof charCurrentSide==='function'?charCurrentSide(cid):(C?.roster?.[cid]?.side||'g');
        return`<span class="subop-avatar ${cSide}" title="${CHAR[cid]?.name||cid}（${cSide==='r'?'胸口红蜘蛛受控态':'正义形态'}）"><img src="${portraitSource(cid,cSide)}" alt="${CHAR[cid]?.name||cid}"><i>${CHAR[cid]?.name||cid}</i></span>`;
       }).join('')}
      </div>
      <button type="button" class="button primary subop-launch" data-launch-subop="${op.id}">${isCur?'继续当前分支作战 ↗':isDone?'重温本分支节点 ↗':'沿此分支出击 ↗'}</button>
     </article>`;
    }).join('')}
   </div>
  </div>`);
}

$('modal-content').addEventListener('click',e=>{
 const b=e.target.closest('[data-gallery-state]');if(b){archiveState=b.dataset.galleryState;showArchive();return;}
 const art=e.target.closest('[data-gallery-portrait]');if(art){showArchivePortrait(art.dataset.galleryPortrait);return;}
 const state=e.target.closest('[data-portrait-state]');if(state){showArchivePortrait(state.dataset.portraitId,state.dataset.portraitState);return;}
 const vbtn=e.target.closest('[data-voice-char]');if(vbtn){
  const cid=vbtn.dataset.voiceChar,vk=vbtn.dataset.voiceKey,line=PERSONA[cid]?.voice?.[vk]||CHAR[cid]?.quote;
  const box=document.getElementById('persona-voice-preview');if(box)box.textContent=`“${line}”`;
  radio(CHAR[cid].name,line);return;
 }
 const mapNode=e.target.closest('[data-map-node]');
 if(mapNode){
  const opId=mapNode.dataset.mapNode;
  const {unlocked}=getCampaignUnlockState();
  if(unlocked.has(opId)){launchSubOperation(opId);}
  else{toast('该分支节点处于战术迷雾保护中，请先完成前置分支任务解锁（拒绝剧透）！');}
  return;
 }
 const launch=e.target.closest('[data-launch-subop]');if(launch){launchSubOperation(launch.dataset.launchSubop);return;}
 if(e.target.closest('[data-gallery-back]'))showArchive();
});

const ensembleHelp=showHelp;
showHelp=function(){ensembleHelp();const sections=$('modal-content').querySelectorAll('.manual-section');for(const section of sections)if(section.querySelector('small')?.textContent.includes('CHESS MOVEMENT'))section.innerHTML='<small>03 / EIGHTEEN MOVEMENT SYSTEMS</small><h3>十八名美少女机娘，十八种独创走法</h3><p>全阵容 18 名机娘各具独立国际象棋变体走法：在原十二人基础上，新增【星枢·超导磁轨炮】【玄羽·暗影越障潜行】【圣歌·圣盾骑士】【绯夜·深渊处刑双刃】【回音·量子折跃】【阳炎·跃空熔核重拳】。<b>每人可达格、威胁视野、AI与7×7走法图使用同一套确定性走法引擎。</b></p>';};
$('help-btn').onclick=showHelp;$('home-rules-btn').onclick=showHelp;
const ensembleMission=makeMission;
makeMission=function(id){migrateCast(C);return ensembleMission(id);};
const oldMoveDiagram=movementDiagram;
movementDiagram=function(u){
 if(!u.char||CHAR[u.char].move!=='cannon')return oldMoveDiagram(u);
 const test={...S,mid:-1,walls:[],voids:[],relays:[],units:[{...u,x:3,y:3,used:false,dead:false,escaped:false},{uid:'diagram-screen',kind:'drone',side:u.side,x:3,y:2,used:true,dead:false,escaped:false}]};
 const moves=new Set(legalMoves(test,test.units[0]).map(m=>key(m.x,m.y))),attacks=new Set(legalMoves(test,test.units[0],'threat').map(m=>key(m.x,m.y)));let result='';
 for(let y=0;y<7;y++)for(let x=0;x<7;x++){const k=key(x,y),c=x===3&&y===3?'center':x===3&&y===2?'screen':moves.has(k)?'active':attacks.has(k)?'attack':'';result+='<span class="'+c+'"></span>';}
 return '<div class="move-grid">'+result+'</div>';
};
radioForCapture=function(ev){
 const t=ev.converted;if(!t)return;
 const infLine=PERSONA[t.char]?.voice?.infected||'胸口正中的红蜘蛛锁死了我的神经……快逃！';
 radio(t.name,ev.side==='g'?'自主链路恢复。':infLine);
};
$('home').querySelector('.prototype-tag').textContent='DIRECTOR EDITION · 18 OPERATORS';
$('home').querySelector('.hero-rule').innerHTML='<span>18 MECHA GIRLS / 15 STAGES / 3 ROUTES</span> 双阵营战术战棋 <b>·</b> 天穹空间站机械病毒危机';
if(location.hash==='#qa')Object.assign(window.__MV_QA__,{
 cast(){return Object.fromEntries(Object.entries(CHAR).map(([id,d])=>[id,{name:d.name,move:d.move,origin:d.origin,debut:d.debut,age:d.age}]));},
 threats(uid){return legalMoves(S,S.units.find(u=>u.uid===uid),'threat');},
 validate(p){return payloadValid(p);},
 next(){return nextMission();},
 openArchive(){showArchive();},
 openStarMap(){showCampaignMap();},
 launchSubOp(id){launchSubOperation(id);}
});
