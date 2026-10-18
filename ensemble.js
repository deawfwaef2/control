/* M5/M9/M11 Grand Ensemble, 18 Mecha-Girls Deep Persona Archive & 15 Sub-Stages Star-Map.
   Loaded after campaign.js. */
let archiveState='current';
const gallerySide=id=>archiveState==='g'||archiveState==='r'?archiveState:S?.units.find(u=>u.char===id)?.side||C?.roster[id]?.side||CHAR[id].origin;

/* Exact normalized (768x1024) chest-center spider coordinates for subtle ruby-core pulse */
const LIVE_RIG_COORDS={
 lyra:{cx:384,cy:568},iris:{cx:394,cy:588},lark:{cx:354,cy:605},
 sera:{cx:384,cy:588},psalm:{cx:384,cy:578},vega:{cx:384,cy:568},
 ruby:{cx:384,cy:572},june:{cx:364,cy:578},noct:{cx:414,cy:632},
 akira:{cx:384,cy:572},veil:{cx:394,cy:578},misa:{cx:364,cy:595},
 astra:{cx:332,cy:515},kuro:{cx:352,cy:660},celia:{cx:342,cy:550},
 nyx:{cx:382,cy:640},echo:{cx:352,cy:615},sola:{cx:362,cy:600}
};

/* 15 Playable Sub-Stages / Tactical Operations across 3 Branching Routes with full story buildup */
const SUB_OPERATIONS=[
 {id:'op-1-1',code:'OP 1–1',name:'死寂接舷（主线）',route:'main',routeLabel:'A区 · 接驳主轴线',baseMid:0,sector:'dock',location:'A–01 接驳主甲板',chars:['lyra','akira','iris','lark'],
  desc:'苍穹防线登陆天穹站首战。先占领 C4 接驳门禁台解开封锁，再向北夺取 D8 主中继并拦截 H 列逃窜的载毒信使。',
  intro:[
   {who:'lyra',side:'g',camera:'medium',text:'全员注意，A–01 接驳甲板已被赤巢封锁。先派人占领中央偏西的【C4 接驳门禁台】，解开北侧通道的电子锁！'},
   {who:'iris',side:'g',camera:'close',text:'指挥官，东侧 H 列的载毒信使正带着战术数据逃向 H8！等 C4 门禁一开，我们立刻北上接管 D8 主中继站！'}
  ]},
 {id:'op-1-2',code:'OP 1–2',name:'气闸封锁线（支线小关）',route:'main',routeLabel:'A区 · 检疫气闸支线',baseMid:0,sector:'airlock',location:'A–02 检疫气闸长廊',chars:['kuro','sola','lyra','lark','nyx'],walls:['2,3','5,3','2,5','5,5'],voids:['0,3','7,3'],
  desc:'暗影忍姬【玄羽】与熔核拳姬【阳炎】在检疫走廊正面迎击赤蛛先锋。先夺下 C4 门禁阀，再掩护小队突破北侧气闸。',
  intro:[
   {who:'kuro',side:'g',camera:'medium',text:'这里是 A–02 检疫气闸长廊。我和阳炎已经在此阻击赤蛛群七十二小时——走廊两侧有深空裂隙，大家善用掩体推进。'},
   {who:'sola',side:'g',camera:'close',text:'管它多少机械蜘蛛！只要帮我占住【C4 门禁台】打开火力通道，本小姐一拳一个把它们全轰飞！'},
   {who:'nyx',side:'r',camera:'close',text:'嘻嘻，检疫走廊的门已经关上咯，看看是你们先打开 C4 门禁，还是我的小蜘蛛先扑上你们的胸口吧！'}
  ]},
 {id:'op-1-3',code:'OP 1–3',name:'外环信使追击战（支线小关）',route:'main',routeLabel:'A区 · 货运轨支线',baseMid:0,sector:'dock',location:'A–04 外环货运高架',chars:['iris','kuro','akira','june','lark'],walls:['3,2','4,2','3,5','4,5'],voids:['0,4','1,4','6,4','7,4'],
  desc:'高机动巡骑【珀弦】与忍姬【玄羽】沿外环断轨越障突进，在载毒信使逃入 H8 之前将其截杀并夺回 D8 中继站。',
  intro:[
   {who:'iris',side:'g',camera:'medium',text:'载毒信使逃进外环货运高架了！这里中段两侧全是断裂的深空裂隙，普通走法很难绕过去。'},
   {who:'kuro',side:'g',camera:'close',text:'交给我和珀弦。你的连续马步和我的斜向越障潜行可以直接跳过裂隙——先占领 C4 解锁轨道，再一举截杀信使！'}
  ]},
 {id:'op-2-1',code:'OP 2–1',name:'绝命温室（α线主关）',route:'alpha',routeLabel:'α线 · 生态深渊路线',baseMid:1,sector:'garden',location:'B–04 生态冷却环',chars:['misa','sera','celia','veil','psalm'],
  desc:'周期性真空泄压的生态孵化池。先同时开启并守住 B7、G7 两座冷却阀两个轮末，再派工兵弥砂封闭中央 E5 孵化池总阀。',
  intro:[
   {who:'misa',side:'g',camera:'medium',text:'中央 E5 的机械蜘蛛孵化池处于高温锁定状态！请先帮我同时占住北侧【B7 与 G7 两座冷却阀】连续两个轮末降温！'},
   {who:'sera',side:'g',camera:'close',text:'一旦双阀降温完成，立刻派队员踏上中央 E5（或让弥砂站在相邻格）点击【固守】按钮，就能彻底封死孵化池！'}
  ]},
 {id:'op-2-2',code:'OP 2–2',name:'培养槽深渊（α线小关）',route:'alpha',routeLabel:'α线 · 生态深渊路线',baseMid:1,sector:'garden',location:'B–06 母本培养底层',chars:['celia','sera','misa','nyx','veil'],walls:['2,2','5,2','3,4','4,4'],voids:['0,5','7,5'],
  desc:'圣盾骑士【圣歌】护卫医官【白栖】与工兵【弥砂】深入培养槽底层，迎战处刑官【绯夜】并锁死底层双冷却阀。',
  intro:[
   {who:'celia',side:'g',camera:'medium',text:'培养槽底层的赤蛛密度极高，雾棘和绯夜正封锁着通往 B7、G7 冷却阀的斜线。白栖、弥砂，紧跟在我的光子圣盾后面！'},
   {who:'nyx',side:'r',camera:'close',text:'圣歌姐姐好威风呀～不过只要我跳过前排护盾切入后方，你们的工程师可就危险咯！'}
  ]},
 {id:'op-2-3',code:'OP 2–3',name:'毒雾排风井（α线小关）',route:'alpha',routeLabel:'α线 · 生态深渊路线',baseMid:1,sector:'airlock',location:'B–09 高压排风竖井',chars:['sola','misa','akira','psalm','lark'],walls:['1,3','6,3','2,5','5,5'],voids:['3,2','4,2'],
  desc:'熔核拳姬【阳炎】与先锋【绛刃】开路，协助【弥砂】在高压泄压风道中夺取双阀并封闭排风井孢子源。',
  intro:[
   {who:'sola',side:'g',camera:'medium',text:'排风井里的风压越来越大了！弥砂，你只管盯着中央 E5 总阀，北边那两座冷却阀交给我和绛刃去抢！'},
   {who:'misa',side:'g',camera:'close',text:'小心橙色闪烁的真空泄压横排！每隔三轮就会爆发一次，千万别在爆发轮停留在橙色格子里！'}
  ]},
 {id:'op-3-1',code:'OP 3–1',name:'断轨天桥（β线主关）',route:'beta',routeLabel:'β线 · 轨道天基路线',baseMid:2,sector:'bridge',location:'C–07 轨道天桥',chars:['vega','astra','echo','june'],
  desc:'在外侧桥面崩塌前，护送携带「方舟火控密钥」的单位推进过半，占领北端 E7 轨道锁并将密钥送入 D8/E8 交付口。',
  intro:[
   {who:'vega',side:'g',camera:'medium',text:'方舟火控密钥就在运输匣里！外侧 C 列与 F 列桥面即将坍塌，全员走中央主桥向北推进！'},
   {who:'astra',side:'g',camera:'close',text:'先护送密钥过半场，再踩开北侧【E7 轨道锁】，最后把密钥送进最北端的【D8 或 E8 交付口】锁死对地发射井！'}
  ]},
 {id:'op-3-2',code:'OP 3–2',name:'远星炮台阵（β线小关）',route:'beta',routeLabel:'β线 · 轨道天基路线',baseMid:2,sector:'bridge',location:'C–09 天基磁轨炮台',chars:['astra','vega','lyra','echo','ruby'],walls:['3,3','4,3','2,5','5,5'],voids:['0,2','0,3','7,2','7,3'],
  desc:'轨道重炮姬【星枢】与被红蜘蛛寄生胸口的昔日领航搭档【回音】在天基炮台正面对决，护送密钥锁死主炮发射轨。',
  intro:[
   {who:'echo',side:'r',camera:'close',text:'星枢姐姐，C–09 炮台的射击诸元我已经替赤巢算好了哦。只要抢下你们手里的火控密钥，主炮就会对准地球开火呢。'},
   {who:'astra',side:'g',camera:'close',text:'闭嘴，回音！那是我们一起守护过的地球！苍澜、零音，掩护我的射击轴线，今天无论如何也要把火控密钥送到北端终点！'}
  ]},
 {id:'op-3-3',code:'OP 3–3',name:'坠落残骸带（β线小关）',route:'beta',routeLabel:'β线 · 轨道天基路线',baseMid:2,sector:'bridge',location:'C–12 失重残骸浮岛',chars:['vega','iris','kuro','june','veil'],walls:['3,4','4,4'],voids:['1,2','6,2','1,5','6,5','2,3','5,3'],
  desc:'布满深空裂隙的残骸浮岛战区！【苍澜】【珀弦】【玄羽】迎战斑马跳斥候【霁川】，护送火控密钥穿越断桥。',
  intro:[
   {who:'june',side:'r',camera:'medium',text:'欢迎来到失重残骸带！这里的桥面到处都是深空裂隙，只有我的 3×2 斑马跳能来去自如哦！'},
   {who:'iris',side:'g',camera:'close',text:'那可不一定！我的连续日字跳和玄羽的暗影潜行一样能跨过裂隙——护住苍澜大姐的运输匣，向北突围！'}
  ]},
 {id:'op-3-x',code:'OP 3–X',name:'零重力暗渠（γ隐藏线）',route:'gamma',routeLabel:'γ线 · 零重力暗渠奇袭',baseMid:2,sector:'airlock',location:'C–00 外骨骼零重力暗渠',chars:['kuro','iris','astra','echo','nyx'],walls:['2,2','5,2','2,4','5,4','2,6','5,6'],voids:['0,3','7,3','0,5','7,5'],
  desc:'【玄羽】【珀弦】【星枢】绕过正面防线，从密集掩体构成的零重力维修暗渠护送密钥直插北端轨道锁。',
  intro:[
   {who:'kuro',side:'g',camera:'medium',text:'这里是空间站外骨骼底部的 C–00 零重力暗渠。虽然掩体密集，但可以避开正面的重火力直插北端 E7 轨道锁。'},
   {who:'astra',side:'g',camera:'close',text:'直线走廊正好发挥我磁轨炮的超远射程！谁敢露头，三格之内直接轰碎！'}
  ]},
 {id:'op-4-1',code:'OP 4–1',name:'镜室叛歌（主线）',route:'main',routeLabel:'D区 · 中枢镜像主轴',baseMid:3,sector:'archive',location:'D–00 中枢镜像库',chars:['lyra','kuro','noct','ruby'],
  desc:'先占领任一终端降下中央电磁门，再同时控制 B5 与 G5 双子终端，并派单位固守中央 D5/E5 同步座两轮提取破盾密钥。',
  intro:[
   {who:'noct',side:'r',camera:'medium',text:'想破除下一层母巢内核的无敌护盾，就试着打开中央电磁门，同时守住 B5 与 G5 双子终端并在中央同步座坚持两轮吧。'},
   {who:'lyra',side:'g',camera:'close',text:'小心绯律的隔山炮，不要在同一条直线上扎堆！先派机动单位踩开 B5 或 G5 终端降下大门！'}
  ]},
 {id:'op-4-2',code:'OP 4–2',name:'处刑回廊（D区小关）',route:'main',routeLabel:'D区 · 内务处刑支线',baseMid:3,sector:'archive',location:'D–03 内务处刑长廊',chars:['celia','sola','akira','ruby','nyx'],walls:['1,2','6,2','3,3','4,3','2,6','5,6'],voids:['0,4','7,4'],
  desc:'隔舱重炮【绯律】与处刑官【绯夜】构筑的交叉火网！【圣歌】【阳炎】【绛刃】正面攻坚夺取双子终端。',
  intro:[
   {who:'ruby',side:'r',camera:'medium',text:'D–03 处刑长廊已进入最高戒备。前排的每一只赤蛛都是我隔山重炮的炮架。'},
   {who:'celia',side:'g',camera:'close',text:'散开阵型，不要给绯律留直线炮架！先占领两侧 B5、G5 终端打开中央大门，再占领中央同步座！'}
  ]},
 {id:'op-4-3',code:'OP 4–3',name:'记忆黑匣子核心（D区小关）',route:'gamma',routeLabel:'γ线 · 实验室深层支线',baseMid:3,sector:'archive',location:'D–07 朔夜私人实验室',chars:['astra','misa','sera','noct','echo','psalm'],walls:['2,3','5,3','2,5','5,5'],voids:['3,1','4,1'],
  desc:'深入朔夜封存的私人实验室，在【朔夜】【回音】【祈雾】的围堵下同步双子终端并解码初代破盾原件。',
  intro:[
   {who:'misa',side:'g',camera:'medium',text:'这里就是朔夜博士最初研发神经防卫网的私人实验室！只要联通两侧 B5、G5 终端并在中央 D5/E5 坚守两轮，就能拿到完整的破盾源码！'},
   {who:'psalm',side:'r',camera:'close',text:'这里是赤巢诞生的摇篮，我们绝不会让你们拿走朔夜大人的记忆原件。'}
  ]},
 {id:'op-5-1',code:'OP 5–1',name:'赤巢零点（终章主线）',route:'omega',routeLabel:'Ω区 · 母巢反应堆终局',baseMid:4,sector:'reactor',location:'Ω–00 母巢反应堆',chars:['lyra','akira','misa','astra','noct'],
  desc:'同时控制 B6/G6 双护盾终端两轮，抵近 E8 内核旁点击「固守」斩断近场总线，最后攻入 E8 彻底摧毁赤巢无限内核！',
  intro:[
   {who:'misa',side:'g',camera:'medium',text:'记住破盾三步曲：①同时占住 B6 与 G6 护盾终端两轮；②派人抵近 E8 内核旁（我可距2格）点【固守】断链；③直接攻入 E8 击碎内核！'},
   {who:'lyra',side:'g',camera:'close',text:'全军突击！一鼓作气终结赤巢机械病毒！'}
  ]},
 {id:'op-5-2',code:'OP 5–2',name:'苍穹坠落·十八女武神终焉战',route:'omega',routeLabel:'Ω区 · 大师级全员终极战',baseMid:4,sector:'reactor',location:'Ω–99 天穹轨道核心绝境',chars:['lyra','akira','astra','celia','kuro','sola','noct','ruby','nyx','echo'],walls:['2,3','5,3','3,5','4,5'],voids:['0,2','7,2','0,4','7,4'],
  desc:'十八名美少女机娘全阵容宿命集结！在轨道反应堆之巅展开最高烈度的终极决战，破除双终端护盾并击碎 E8 赤巢内核！',
  intro:[
   {who:'noct',side:'r',camera:'establish',text:'苍穹防线的精锐与赤巢的女武神全部集结于此了。在这张 8×8 的钢铁棋盘上，决定地球与深空未来的最终一战开始吧！'},
   {who:'lyra',side:'g',camera:'close',text:'苍穹防线全员听令——夺取 B6、G6 双终端，近场斩断内核总线，彻底粉碎 E8 赤巢内核！'}
  ]}
];

function showArchivePortrait(id,side=gallerySide(id)){
 const d=CHAR[id],p=PERSONA[id]||{};if(!d)return;
 openModal(d.name+' · '+(p.archetype||d.role)+' / '+(side==='r'?'胸口红蜘蛛控制态':'自主态预览'),'PERSONNEL DOSSIER / 角色深度人设与走法档案',`
  <button class="text-button gallery-back" data-gallery-back>← 返回十八名美少女机娘总览</button>
  <div class="full-portrait" data-portrait-character="${id}">
   <div class="live-portrait-stage ${side}">
    <img src="${portraitSource(id,side)}" alt="${d.name} / ${side==='r'?'控制态':'自主态'}完整立绘">
   </div>
   <div class="persona-detail-pane">
    <span>${d.code} / ${d.en} / ${d.age}岁 · ${p.squad||''}</span>
    <h3>${d.name} <small>${p.archetype||d.role}</small></h3>
    <div class="archive-tabs">
     <button data-portrait-id="${id}" data-portrait-state="g" class="${side==='g'?'active':''}">自主态（未寄生）</button>
     <button data-portrait-id="${id}" data-portrait-state="r" class="${side==='r'?'active':''}">控制态（胸口正中红蜘蛛）</button>
    </div>
    <div class="persona-specs">
     <div><b>专属装甲</b><span>${p.frame||'苍穹制式机动外骨骼'}</span></div>
     <div><b>标志武装</b><span>${p.weapon||'高周波战术武装'}</span></div>
     <div><b>战棋走法</b><span>${d.role}（${d.rune}）· ${d.rule}</span></div>
     <div><b>同步 II</b><span>${d.upgrade}</span></div>
    </div>
    <div class="persona-psych ${side}">
     <h4>${side==='r'?'胸口红蜘蛛寄生状态（不可逆夺控）':'自主人格与战术信念'}</h4>
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
      <button type="button" data-voice-char="${id}" data-voice-key="infected">胸口寄生</button>
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
   <p class="manual-lead">天穹空间站战役 · 全阵容 <b>18 名二次元美少女机娘</b>。<br>每人拥有独立国际象棋变体走法、专属武装、双态心理档案（自主态 vs 胸口正中红蜘蛛控制态）与角色羁绊。</p>
   <div class="archive-tabs">
    <button data-gallery-state="current" class="${archiveState==='current'?'active':''}">当前战役状态</button>
    <button data-gallery-state="g" class="${archiveState==='g'?'active':''}">自主态预览（18人）</button>
    <button data-gallery-state="r" class="${archiveState==='r'?'active':''}">控制态预览（胸口正中红蜘蛛）</button>
   </div>
   <small>控制态下胸口正中央嵌有发光赤红机械蜘蛛，双眸同步转为绯红；点击任意立绘可查看完整大图与深度人设。</small>
  </div>
  <div class="archive-grid">${Object.entries(CHAR).map(([id,d])=>{
   const p=PERSONA[id]||{},rec=C?.roster[id],side=stateOf(id);
   const status=rec?.status==='destroyed'?'永久损毁':rec?.status==='retired'?'已隔离离场':rec?.introduced?'已参战':`${MISSIONS[d.debut]?.name||'支线'}登场`;
   return`<article class="archive-card ${side==='r'?'is-infected-preview':''}" data-character="${id}" data-status="${rec?.status||'active'}">
    <button type="button" class="archive-photo" data-gallery-portrait="${id}" aria-label="查看${d.name}完整立绘与人设">
     <img src="${portraitSource(id,side)}" alt="${d.name} / ${side==='r'?'控制态':'自主态'}" loading="lazy">
     <span class="archive-state ${side}">${side==='r'?'胸口赤蛛寄生':'自主神经链路'} / ${status}</span>
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

/* Interactive 15-Sub-Stage & 3-Branching-Route Campaign Star-Map */
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
 // Keep the board focused on this sub-stage's featured characters so nobody appears unintroduced
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
 S.initial=S.units.filter(u=>u.char).map(u=>({char:u.char,side:u.side}));
 selected=movers(S,C.side).find(u=>u.char)?.uid||movers(S,C.side)[0]?.uid;
 checkpoint={c:clone(C),s:clone(S)};
 $('home').hidden=true;$('result').hidden=true;
 render();persist();
 const subFrames=[
  echoCard(`${op.code} · ${op.name}`,`${op.routeLabel} / ${op.location}`,[`本关登场角色：${op.chars.map(c=>CHAR[c]?.name).join('、')}`,`战区坐标：${op.location}`],op.desc,{who:op.chars[0]||'lyra',side:C.side,scene:op.sector==='garden'?'garden':op.sector==='bridge'?'bridge':op.sector==='archive'?'archive':op.sector==='reactor'?'reactor':'station',sound:'cut'}),
  ...(op.intro||[]).map(l=>echoLine(l.who,l.text,{side:l.side||C.side,camera:l.camera||'close',caption:`${op.location} / 战前部署铺垫`}))
 ];
 if(!qaSilent)playStory(subFrames,()=>{render();},`${op.code} · ${op.name}`);
}

function showCampaignMap(){
 const done=new Set(C?.completedOps||[]);
 if(C?.history)C.history.forEach(h=>{
  const mainMap={0:'op-1-1',1:'op-2-1',2:'op-3-1',3:'op-4-1',4:'op-5-1'};
  if(mainMap[h.mid])done.add(mainMap[h.mid]);
 });
 const curOp=S?.subOp||({0:'op-1-1',1:'op-2-1',2:'op-3-1',3:'op-4-1',4:'op-5-1'}[S?.mid||0]);
 openModal('天穹空间站 · 15关战役星图与三大分支路线','CAMPAIGN STAR-MAP / 15 STAGES & 3 BRANCHING ROUTES',`
  <div class="starmap-wrap">
   <div class="starmap-header">
    <p>包含 <b>5 大主线章节 + 10 个独立战术支线小关（共 15 关）</b>，横跨 <b>α 生态深渊线、β 轨道天基线、γ 零重力暗渠线</b>。每一小关均配有专属角色阵容与战前剧情铺垫。</p>
   </div>
   <svg class="starmap-svg" viewBox="0 0 900 220" aria-hidden="true">
    <defs>
     <linearGradient id="lineMain" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#63d9ff"/><stop offset="100%" stop-color="#ff3b5c"/></linearGradient>
    </defs>
    <path d="M70,110 L190,110 L310,45 L450,45 L590,110 L720,110 L830,110" fill="none" stroke="url(#lineMain)" stroke-width="2.5" stroke-dasharray="6 4"/>
    <path d="M190,110 L310,110 L450,110 L590,110" fill="none" stroke="#63d9ff" stroke-width="2"/>
    <path d="M190,110 L310,175 L450,175 L590,110" fill="none" stroke="#ff5e7e" stroke-width="2" stroke-dasharray="4 4"/>
    <g font-size="11" fill="#e5eefc" font-weight="600" text-anchor="middle">
     <circle cx="70" cy="110" r="15" fill="#132235" stroke="#63d9ff" stroke-width="2.5"/><text x="70" y="114">1-1</text><text x="70" y="140" fill="#9bb4d0">接驳主线</text>
     <circle cx="190" cy="110" r="15" fill="#132235" stroke="#63d9ff" stroke-width="2.5"/><text x="190" y="114">1-2/3</text><text x="190" y="140" fill="#9bb4d0">气闸/追击</text>
     <circle cx="310" cy="45" r="15" fill="#10292e" stroke="#4ce0b3" stroke-width="2.5"/><text x="310" y="49">α 2-1</text><text x="310" y="22" fill="#4ce0b3">α 生态深渊线</text>
     <circle cx="450" cy="45" r="15" fill="#10292e" stroke="#4ce0b3" stroke-width="2.5"/><text x="450" y="49">2-2/3</text><text x="450" y="22" fill="#4ce0b3">培养槽/排风井</text>
     <circle cx="310" cy="110" r="15" fill="#16233b" stroke="#63d9ff" stroke-width="2.5"/><text x="310" y="114">β 3-1</text><text x="310" y="90" fill="#63d9ff">β 轨道天基线</text>
     <circle cx="450" cy="110" r="15" fill="#16233b" stroke="#63d9ff" stroke-width="2.5"/><text x="450" y="114">3-2/3</text><text x="450" y="90" fill="#63d9ff">炮台阵/残骸带</text>
     <circle cx="310" cy="175" r="15" fill="#2b1424" stroke="#ff5e7e" stroke-width="2.5"/><text x="310" y="179">γ 3-X</text><text x="310" y="204" fill="#ff5e7e">γ 零重力暗渠</text>
     <circle cx="450" cy="175" r="15" fill="#2b1424" stroke="#ff5e7e" stroke-width="2.5"/><text x="450" y="179">4-3</text><text x="450" y="204" fill="#ff5e7e">记忆实验室</text>
     <circle cx="590" cy="110" r="15" fill="#1f1a33" stroke="#c792ea" stroke-width="2.5"/><text x="590" y="114">4-1/2</text><text x="590" y="140" fill="#c792ea">镜室/处刑廊</text>
     <circle cx="720" cy="110" r="15" fill="#33121d" stroke="#ff3b5c" stroke-width="2.5"/><text x="720" y="114">Ω 5-1</text><text x="720" y="140" fill="#ff3b5c">赤巢零点</text>
     <circle cx="830" cy="110" r="16" fill="#42111f" stroke="#ffcc4d" stroke-width="2.5"/><text x="830" y="114">Ω 5-2</text><text x="830" y="140" fill="#ffcc4d">终焉决战</text>
    </g>
   </svg>
   <div class="subop-grid">
    ${SUB_OPERATIONS.map(op=>{
     const isDone=done.has(op.id),isCur=curOp===op.id;
     return`<article class="subop-card route-${op.route} ${isCur?'current':''} ${isDone?'completed':''}" data-subop-card="${op.id}">
      <div class="subop-top">
       <span class="subop-code">${op.code} · ${op.routeLabel}</span>
       <strong class="subop-status">${isCur?'● 当前战区':isDone?'✓ 已肃清':'○ 可出击'}</strong>
      </div>
      <h3>${op.name}</h3>
      <small>${op.location}</small>
      <p>${op.desc}</p>
      <div class="subop-avatars">
       ${op.chars.map(cid=>`<span class="subop-avatar" title="${CHAR[cid]?.name||cid}"><img src="${portraitSource(cid,C?.roster?.[cid]?.side||CHAR[cid]?.origin||'g')}" alt="${CHAR[cid]?.name||cid}"><i>${CHAR[cid]?.name||cid}</i></span>`).join('')}
      </div>
      <button type="button" class="button primary subop-launch" data-launch-subop="${op.id}">进入本关作战 ↗</button>
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
