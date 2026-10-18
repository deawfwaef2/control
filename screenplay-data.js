/* M6/M9/M11/M13 Master Tactical Sandtable Screenplay & Mission Marker Choreography.
   Every chapter opening follows:
   1. Full-Screen Anime Event CG Showcase (CG剧照特写)
   2. Empty Tactical Map Scan (棋盘地图先展示)
   3. Unit-by-Unit Materialization & Speech (单位逐个降临棋盘并说话)
   4. Animated Mission Marker & Vector Choreography (任务标记与推演路线锁定演出)
   Every mid-battle act transition (0:1..4:3) has 3-step tactical deduction & marker lock-on. */

const ECHO_EVIDENCE={
 signal:{number:'E–01',title:'信使逃逸与门禁封锁日志',source:'A–01 接驳门禁终端 / C4',fact:'A–01 接驳甲板通往空间站深层的北侧防爆门已被 C4 门禁台锁死；与此同时，一台装载着空间站母本坐标的赤巢「载毒信使」正沿东侧 H 列走廊全速逃往 H8 撤离井。',question:'为什么赤巢要在接驳甲板同时布下机械蜘蛛与载毒信使？',payoff:'赤巢不仅企图用机械蜘蛛把登舰机娘转化为新傀儡，更试图将记录着守护者战术频率的数据包经 H8 送往母巢核心。'},
 clamp:{number:'E–02',title:'胸口正中寄生扫描报告',source:'先遣侦察员【璃雀】机体扫描 / F7',fact:'八足机械蜘蛛精准刺穿机娘胸口正中央的装甲核心，八根合金倒钩直接与胸椎运动神经熔接，同时将宿主的双眸覆写为发光猩红。',question:'战斗中能否通过攻击将同伴胸口的红蜘蛛打下来解救她？',payoff:'绝对不能。倒钩已与中枢神经锁死：只有红蜘蛛扑击机娘才能完成寄生转化；任何机娘、哨卫或火炮的攻击都会直接击穿载体造成永久阵亡。'},
 dose:{number:'E–03',title:'生态孵化池与真空泄压日志',source:'B–04 生态冷却环 / E5 孵化池',fact:'赤巢将生态温室中央的 E5 培养槽改造成了机械蜘蛛孵化池，并设定了周期性横向真空泄压程序，企图清除靠近冷却阀的守护者。',question:'如何安全关闭 E5 蜘蛛孵化池并带走抗蚀稳定剂？',payoff:'必须先同时占领 B7 与 G7 两座冷却阀并维持两个轮末，待高温护盾消退后，派工程机娘弥砂抵近 E5 执行固守封锁。'},
 manifest:{number:'E–04',title:'轨道空投井与火控密钥清单',source:'C–07 轨道天桥 / 方舟运输匣',fact:'天穹空间站下方的六座轨道空投舱已装满休眠态赤红机械蜘蛛，只等「方舟火控密钥」接入南端发射台便会向地球大气层实施全球播撒。',question:'为什么外侧 C 列与 F 列桥面会在交战中突然坍塌？',payoff:'赤巢引爆了外侧承重桁架，企图将护送密钥匣的机娘连同桥面一起抛入深空裂隙。'},
 signature:{number:'E–05',title:'总架构师朔夜的破盾镜像',source:'D–00 中枢镜像库 / 双子终端',fact:'天穹站总架构师【朔夜】在试图物理熔断母巢内核时，被初代赤蛛王正面扑中胸口正中；但她被寄生前将母巢内核的破盾协议锁在了 B5、G5 双子终端与中央同步座中。',question:'为什么要同时控制 B5、G5 并在中央 D5/E5 同步座固守两轮？',payoff:'只有双子终端与中央同步座连续两轮谐振，才能提取出击穿 Ω 区母巢内核无敌护盾的动态密钥。'},
 downlink:{number:'E–06',title:'Ω–00 赤巢无限增殖内核结构图',source:'Ω–00 母巢反应堆 / E8 内核',fact:'位于 E8 的赤巢母巢内核每隔数轮便会自动孵化新的赤红机械蜘蛛。其外围由 B6、G6 两座护盾终端及近场增殖总线双重保护。',question:'如何彻底终结机械蜘蛛的无限孵化？',payoff:'先同时掌控 B6 与 G6 护盾终端两轮，再派队员抵近 E8 内核旁点击「固守」斩断近场总线，最后直接攻入 E8 轰碎赤巢内核！'}
};

function echoLine(who,text,opt={}){return{kind:'dialogue',camera:'close',axis:'right',side:'C',text,who,...opt};}
function echoCard(label,value,rows,text,opt={}){return{kind:'record',camera:'establish',axis:'center',who:opt.who||'iris',side:opt.side||'C',text,insert:{label,value,rows},...opt};}

function echoIntro(mid){
 const g=C.side==='g';
 if(mid===0)return g?[
  echoCard('CG 01 · 死寂接舷','A–01 DOCKING BAY / 战区全景扫描',['第 1 步：展示 A–01 接驳甲板全景地形','第 2 步：双方作战单位逐一降临棋盘','第 3 步：锁定 C4 门禁、D8 中继与 H 列信使目标'],'天穹空间站失联第 72 小时。先遣侦察员【璃雀】在回传最后一段红色机械蜘蛛影像后彻底失联。现在，先扫描 A–01 接驳甲板地形，各作战单位准备逐一降临棋盘！',{
   who:'lyra',side:'g',scene:'station',sound:'cut',
   cgBanner:{title:'CG 01 · 死寂接舷：胸口正中的赤色梦魇',sub:'先遣侦察员璃雀在检疫气闸遭赤红机械蜘蛛正面扑击，八根合金倒钩刺入胸甲正中'},
   revealUnits:[]
  }),
  echoLine('iris','【全息沙盘已展开】：8×8 战区地形与关键设施扫描完毕！现在，双方作战单位依次降临棋盘！',{
   who:'lyra',side:'g',scene:'station',sound:'cut',
   camera:'establish',caption:'第 1 步 · 战区空棋盘地形先展示',
   stageStep:'map',revealUnits:[],
   markers:[{x:2,y:4,badge:'门禁终端 C4',tone:'cyan'},{x:3,y:0,badge:'主中继站 D8',tone:'gold'}]
  }),
  echoLine('lyra','苍穹防线旗舰指挥官【零音】，降临 C1 阵位！北侧防爆墙后面就是空间站主通道，全员按预定坐标依次着舰！',{
   side:'g',camera:'medium',axis:'left',caption:'旗舰指挥官 · 零音 降临 [C1]',
   revealUnits:['lyra','drone'],focusCell:[2,7]
  }),
  echoLine('akira','先锋突击手【绛刃】，F1 阵位着舰完毕！我的电磁轨刃已经充能完毕，随时可以沿直线撕开赤巢防线！',{
   side:'g',camera:'close',axis:'left',caption:'先锋轨刃突击手 · 绛刃 降临 [F1]',
   revealUnits:['akira'],focusCell:[5,7]
  }),
  echoLine('iris','电子战通讯官【珀弦】，B2 阵位上线！指挥官，我已经接通了三天前秘密潜入检疫走廊的【玄羽】和【阳炎】！',{
   side:'g',camera:'close',axis:'left',caption:'电子战巡骑 · 珀弦 降临 [B2]',
   revealUnits:['iris'],focusCell:[1,6]
  }),
  echoLine('kuro','暗影忍姬【玄羽】，在 G2 解除光学迷彩；熔核拳姬【阳炎】已在 D1 就位。我们在检疫走廊阻击了赤蛛群整整三天，终于等到主力舰队了。',{
   side:'g',camera:'medium',axis:'left',caption:'先遣潜伏组 · 玄羽 [G2] & 阳炎 [D1] 现身汇合',
   revealUnits:['kuro','sola'],focusCell:[6,6]
  }),
  echoLine('sola','大家小心北面！刚才有两只赤红机械蜘蛛潜伏在 B5 和 G5 走廊，而且……你们看北侧 F7 防爆门后面走出来的人是谁？！',{
   side:'g',camera:'close',axis:'left',caption:'熔核拳姬 · 阳炎 发出敌情预警 [D1]',
   revealUnits:['spider'],focusCell:[3,7],
   markers:[{x:1,y:3,badge:'▲ 赤蛛伏兵 B5',tone:'red'},{x:6,y:3,badge:'▲ 赤蛛伏兵 G5',tone:'red'}]
  }),
  echoLine('lark','……救……救命……零音队长……我胸口正中间的这只红色蜘蛛……把我的神经锁死了……我控制不住自己的枪口，快逃啊！',{
   side:'r',camera:'close',axis:'right',sound:'pulse',caption:'▲ 受控先遣斥候 · 璃雀 现身 [F7]',
   revealUnits:['lark'],focusCell:[5,1],
   markers:[{x:5,y:1,badge:'▲ 受控同伴：璃雀 [F7]',tone:'red'}]
  }),
  echoLine('kuro','别冲动！扫描显示：她胸口正中的红蜘蛛倒钩已与脊柱熔接——【只有红蜘蛛能感染机娘，任何其他攻击都会直接击杀目标】，无法通过攻击解救她！',{
   side:'g',camera:'close',axis:'left',caption:'战术铁则：不可逆感染 / 吃子即击杀',
   focusCell:[5,1],
   markers:[{x:5,y:1,badge:'不可解救 · 普通攻击将直接击杀',tone:'red'}]
  }),
  echoLine('iris','更糟的是，东侧 H3 出现了一台赤巢【载毒信使】，正带着母本数据沿 H 列逃往北端【H8 出口】！而通往北侧的通道被【C4 门禁台】锁死了！',{
   side:'g',camera:'close',axis:'left',caption:'敌方信使异动 · [H3 → H8]',
   revealUnits:['courier'],focusCell:[7,5],
   markers:[
    {x:7,y:5,badge:'▲ 载毒信使 [H3]',tone:'red'},
    {x:7,y:0,badge:'信使逃逸口 [H8]',tone:'gold',from:[7,5]}
   ]
  }),
  echoLine('lyra','【第一阶段任务标记锁定】：全军先向中央推进，派任意队员占领【C4 接驳门禁台】解开北侧封锁！门禁一开，立刻北上夺取【D8 主中继站】并截杀【H 列信使】！',{
   side:'g',camera:'close',axis:'left',sound:'knock',caption:'◉ 阶段一任务锁定：占领 C4 接驳门禁台',
   revealUnits:['ALL'],focusCell:[2,4],
   markers:[
    {x:2,y:4,badge:'◉ 第一阶段目标：占领 C4 门禁台',tone:'cyan',from:[2,7]},
    {x:3,y:0,badge:'后续目标：D8 主中继站',tone:'gold',from:[2,4]},
    {x:7,y:5,badge:'次要目标：截杀 H3 信使',tone:'red',from:[6,6]}
   ]
  })
 ]:[
  echoCard('CG 01 · 赤巢苏醒','A–01 DOCKING BAY / 母巢沙盘推演',['第 1 步：扫描 A–01 接驳甲板猎场','第 2 步：赤巢单位与猎物逐一显现','第 3 步：锁定 H 列信使推进与赤蛛寄生目标'],'地球防卫组织「苍穹防线」已踏入 A–01 接驳甲板。先扫描整座甲板地形，唤醒潜伏在暗处的赤红机械蜘蛛与新受控载体！',{
   who:'lark',side:'r',scene:'station',sound:'cut',
   cgBanner:{title:'CG 01 · 赤巢苏醒：胸口正中的猩红指令',sub:'被植入胸口正中红蜘蛛的璃雀化为赤巢先锋，率领机械蜘蛛群迎击登陆小队'},
   revealUnits:[]
  }),
  echoLine('iris','【全息沙盘已展开】：8×8 战区地形与关键设施扫描完毕！现在，双方作战单位依次降临棋盘！',{
   who:'lark',side:'r',scene:'station',sound:'cut',
   camera:'establish',caption:'第 1 步 · 战区空棋盘地形先展示',
   stageStep:'map',revealUnits:[],
   markers:[{x:7,y:0,badge:'信使撤离井 H8',tone:'gold'}]
  }),
  echoLine('lark','我是第一名接入赤巢胸口控制器的侦察员【璃雀】，已于 F7 就位。胸口正中的红光让我不再畏惧孤单。',{
   side:'r',camera:'close',axis:'right',sound:'pulse',caption:'受控斥候 · 璃雀 现身 [F7]',
   revealUnits:['lark'],focusCell:[5,1]
  }),
  echoLine('kuro','苍穹防线的【玄羽】【阳炎】【零音】【绛刃】【珀弦】已在南侧第 1、2 排展开防线，企图封锁甲板！',{
   side:'g',camera:'medium',axis:'left',caption:'守护者防线于南侧集结 [C1/F1/B2/G2/D1]',
   revealUnits:['lyra','akira','iris','kuro','sola','drone'],focusCell:[2,7]
  }),
  echoLine('sola','我们的赤红机械蜘蛛已在 B5、G5 待命，东侧 H3 的【载毒信使】也已装载好母本数据包！',{
   side:'r',camera:'close',axis:'right',caption:'赤蛛集群 [B5/G5] 与载毒信使 [H3] 就位',
   revealUnits:['spider','courier'],focusCell:[7,5],
   markers:[{x:1,y:3,badge:'▲ 赤蛛感染源 B5',tone:'red'},{x:6,y:3,badge:'▲ 赤蛛感染源 G5',tone:'red'},{x:7,y:5,badge:'◆ 载毒信使 H3',tone:'gold'}]
  }),
  echoLine('lyra','记住赤巢铁律：只有【赤红机械蜘蛛】扑击机娘才能将其永久寄生并换位；受控机娘或哨卫的攻击只会直接击杀猎物！',{
   side:'r',camera:'close',axis:'left',caption:'战术铁律：唯赤蛛可寄生夺控',
   focusCell:[1,3],
   markers:[{x:1,y:6,badge:'▲ 扑击机娘 → 永久寄生换位',tone:'red',from:[1,3]}]
  }),
  echoLine('iris','东侧 H 列的【载毒信使】只要向北推进越过第 5 排，就能撕开守护者的封锁网！',{
   side:'r',camera:'close',axis:'left',caption:'东翼信使突围路线 [H3 → H5 → H8]',
   focusCell:[7,5],
   markers:[{x:7,y:3,badge:'◉ 推进信使越过第 5 排',tone:'gold',from:[7,5]}]
  }),
  echoLine('akira','【第一阶段任务标记锁定】：护送 H3 载毒信使向北越过第 5 排，或者指挥 B5/G5 的赤红机械蜘蛛直接扑击感染一名守护者机娘！',{
   side:'r',camera:'close',axis:'left',sound:'knock',caption:'◉ 阶段一任务锁定：信使突进 或 赤蛛寄生',
   revealUnits:['ALL'],focusCell:[7,3],
   markers:[
    {x:7,y:3,badge:'◉ 目标 A：信使越过第 5 排',tone:'gold',from:[7,5]},
    {x:1,y:6,badge:'◉ 目标 B：赤蛛扑击寄生机娘',tone:'red',from:[1,3]}
   ]
  })
 ];

 if(mid===1)return[
  echoCard('CG 02 · 绝命温室','B–04 BIO-COOLING RING / 战区全景扫描',['第 1 步：展示 B–04 生态冷却环地形与双冷却阀','第 2 步：双方驻守与增援机娘逐一登场','第 3 步：锁定 B7/G7 冷却阀与 E5 孵化池目标'],'B–04 生态冷却环已被改造成机械蜘蛛孵化池。中央 E5 培养槽正在高温孵化赤蛛，而每三轮一次的横向真空泄压随时会撕碎走廊上的单位！',{
   who:'misa',side:C.side,scene:'garden',sound:'cut',
   cgBanner:{title:'CG 02 · 绝命温室：孵化环的激光与电浆火网',sub:'工程师弥砂与战地医官白栖死守冷却阀，迎战漫天袭来的赤红机械蜘蛛与高处狙击手雾棘'},
   revealUnits:[]
  }),
  echoLine('iris','【全息沙盘已展开】：8×8 战区地形与关键设施扫描完毕！现在，双方作战单位依次降临棋盘！',{
   who:'misa',side:C.side,scene:'garden',sound:'cut',
   camera:'establish',caption:'第 1 步 · 战区空棋盘地形先展示',
   stageStep:'map',revealUnits:[],
   markers:[{x:1,y:1,badge:'西冷却阀 B7',tone:'cyan'},{x:6,y:1,badge:'东冷却阀 G7',tone:'cyan'},{x:4,y:3,badge:'蜘蛛孵化池 E5',tone:'red'}]
  }),
  echoLine('sera','我是驻守 B–04 医疗检疫区的战地医官【白栖】。我身边是首席工程师【弥砂】，我们终于守到主力小队抵达了！',{
   side:'g',camera:'medium',axis:'left',caption:'战地医官 · 白栖 & 脉冲工兵 · 弥砂 登场',
   revealUnits:['sera','misa','lyra','akira','iris','kuro','sola','drone'],focusCell:[2,7]
  }),
  echoLine('celia','荣誉卫队圣盾骑士【圣歌】，携重装圣盾赶到前线！我的羽翼护盾将掩护弥砂和白栖向北推进！',{
   side:'g',camera:'close',axis:'left',caption:'圣盾骑士 · 圣歌 降临增援',
   revealUnits:['celia'],focusCell:[5,7]
  }),
  echoLine('veil','……别再往前走了，白栖。我是原驻站狙击官【雾棘】……胸口正中的红蜘蛛已经接管了我的狙击目镜，踏入对角线的人都会被我射穿。',{
   side:'r',camera:'close',axis:'right',sound:'pulse',caption:'▲ 受控狙击官 · 雾棘 封锁高处对角线',
   revealUnits:['veil','lark'],focusCell:[2,0],
   markers:[{x:2,y:0,badge:'▲ 对角狙击封锁：雾棘',tone:'red'}]
  }),
  echoLine('psalm','还有我，声学调律官【祈雾】，以及内务处刑官【绯夜】。听见胸口红蜘蛛的共鸣了吗？中央 E5 的孵化池马上就要沸腾了哦。',{
   side:'r',camera:'close',axis:'right',caption:'▲ 受控歌姬 · 祈雾 & 处刑官 · 绯夜 现身',
   revealUnits:['psalm','nyx','spider'],focusCell:[6,1],
   markers:[{x:4,y:3,badge:'▲ E5 孵化池 + 温室抗蚀样本',tone:'gold'}]
  }),
  echoLine('nyx','嘻嘻，我们还在温室里启动了周期性【横向真空泄压】！第 '+(S?.ventStart||4)+' 轮末起每三轮爆发一次，停在橙色闪烁横排上的棋子会直接被吹进太空粉身碎骨哦！',{
   side:'r',camera:'close',axis:'right',caption:'环境杀招预警：第 4/5 排周期性真空泄压',
   focusCell:[4,3],
   markers:[{x:3,y:3,badge:'▲ 泄压危区：闪烁轮切勿停留',tone:'red'},{x:4,y:3,badge:'◆ E5 温室样本（夺取可延缓天桥坍塌）',tone:'gold'}]
  }),
  echoLine('misa',g?'【第一阶段任务标记锁定】：中央 E5 孵化池有高温锁，请先派机动队员冲上北侧，占领【B7 西冷却阀】或【G7 东冷却阀】开启降温回路！顺便派人踩上【E5】拿走温室样本！':'【第一阶段任务标记锁定】：先派单位踏上中央【E5 培育台】夺取温室样本，再派赤红机械蜘蛛扑击感染工程师【弥砂】！',{
   side:C.side,camera:'close',axis:'left',sound:'knock',caption:g?'◉ 阶段一任务锁定：占领 B7 或 G7 冷却阀':'◉ 阶段一任务锁定：夺取 E5 样本并感染弥砂',
   revealUnits:['ALL'],focusCell:g?[1,1]:[4,3],
   markers:g?[
    {x:1,y:1,badge:'◉ 第一阶段目标：占领 B7 西冷却阀',tone:'cyan',from:[1,6]},
    {x:6,y:1,badge:'◉ 或占领 G7 东冷却阀',tone:'cyan',from:[6,6]},
    {x:4,y:3,badge:'★ 支线奖励：踩 E5 夺取抗蚀样本',tone:'gold',from:[3,6]}
   ]:[
    {x:4,y:3,badge:'◉ 第一阶段目标：踏上 E5 夺取样本',tone:'gold',from:[3,1]},
    {x:2,y:7,badge:'▲ 后续目标：用赤蛛扑击感染弥砂',tone:'red',from:[3,1]}
   ]
  })
 ];

 if(mid===2)return[
  echoCard('CG 03 · 断轨天桥','C–07 ORBITAL SKYBRIDGE / 战区全景扫描',['第 1 步：扫描 C–07 轨道天桥与深空裂隙','第 2 步：空天艇与天基炮小队逐一降临','第 3 步：锁定 D2 密钥运输匣、E7 轨道锁与 C/F 断桥预警'],'C–07 轨道天桥悬在蓝色的地球上方。桥面南端 D2 的装甲运输匣内锁着「方舟火控密钥」——绝不能让赤巢启动对地轨道空投！',{
   who:'vega',side:C.side,scene:'bridge',sound:'cut',
   cgBanner:{title:'CG 03 · 断轨天桥：地球上空的苍穹与赤巢之刃',sub:'零音、绛刃与轨道重炮星枢在万米天桥迎战赤巢女武神，脚下即是蔚蓝地球'},
   revealUnits:[]
  }),
  echoLine('iris','【全息沙盘已展开】：8×8 战区地形与关键设施扫描完毕！现在，双方作战单位依次降临棋盘！',{
   who:'vega',side:C.side,scene:'bridge',sound:'cut',
   camera:'establish',caption:'第 1 步 · 战区空棋盘地形先展示',
   stageStep:'map',revealUnits:[],
   markers:[{x:4,y:1,badge:'北端轨道锁 E7',tone:'cyan'},{x:3,y:0,badge:'北端交付口 D8/E8',tone:'gold'}]
  }),
  echoLine('vega','空天重卫队长【苍澜】，携全向护盾降临天桥！南端 D2 的【方舟密钥运输匣】由我贴身护卫！',{
   side:'g',camera:'medium',axis:'left',caption:'空天重卫 · 苍澜 & 方舟密钥匣 [D2] 就位',
   revealUnits:['vega','capsule','lyra','akira','iris','kuro','sola','misa','sera','celia','drone'],focusCell:[3,6],
   markers:[{x:3,y:6,badge:'◆ 方舟火控密钥匣 [D2]',tone:'cyan'}]
  }),
  echoLine('astra','轨道重炮王牌【星枢】，双肩超导磁轨炮已校准天桥主轴线！谁敢靠近运输匣，三格之内直接轰成宇宙尘埃！',{
   side:'g',camera:'close',axis:'left',caption:'轨道重炮王牌 · 星枢 降临天桥',
   revealUnits:['astra'],focusCell:[2,7]
  }),
  echoLine('echo','星枢姐姐，好久不见呀～我是量子导航姬【回音】。胸口正中这颗发光的红蜘蛛，正在帮我引导赤巢的火控轨道呢。',{
   side:'r',camera:'close',axis:'right',sound:'pulse',caption:'▲ 受控量子导航姬 · 回音 现身北桥',
   revealUnits:['echo','lark','veil','psalm','nyx'],focusCell:[5,1],
   markers:[{x:5,y:1,badge:'▲ 量子穿墙折跃：回音',tone:'red'}]
  }),
  echoLine('june','还有外环侦察斥候【霁川】！天桥两侧的深空裂隙挡不住我的 3×2 斑马跳，你们的密钥匣我收下啦！',{
   side:'r',camera:'close',axis:'right',caption:'▲ 受控深空猎手 · 霁川 & 赤蛛群现身',
   revealUnits:['june','spider'],focusCell:[2,0]
  }),
  echoLine('ruby','紧急结构预警：天桥外侧【C 列与 F 列（第 3..6 排）】承重梁已被赤巢爆破，将在第 '+(S?.collapseAt||6)+' 轮末彻底坍塌坠入深空！全员务必走中央 D、E 两列主桥！',{
   side:'r',camera:'close',axis:'right',caption:'▲ 断桥预警：外侧 C 列与 F 列即将坍塌',
   focusCell:[2,3],
   markers:[{x:2,y:3,badge:'▲ C列桥面将坍塌',tone:'red'},{x:5,y:3,badge:'▲ F列桥面将坍塌',tone:'red'}]
  }),
  echoLine(g?'vega':'june',g?'【第一阶段任务标记锁定】：立刻掩护携带火控密钥的【D2 运输匣】（或接力拾取密钥的队员）沿中央主桥向北推进，越过半场抵达【第 5 排（y≤4）以上】！':'【第一阶段任务标记锁定】：集火击毁守护者的【D2 运输匣】夺取掉落的方舟密钥，或直接派单位南下占领【D2 南端轨道锁】！',{
   side:C.side,camera:'close',axis:'left',sound:'knock',caption:g?'◉ 阶段一任务锁定：护送密钥过半场 → 开启 E7 锁 → 送达 D8/E8':'◉ 阶段一任务锁定：截获密钥 或 占领 D2 南端锁',
   revealUnits:['ALL'],focusCell:g?[3,4]:[3,6],
   markers:g?[
    {x:3,y:4,badge:'◉ 第一阶段目标：护送密钥抵达桥心(第5排以上)',tone:'cyan',from:[3,6]},
    {x:4,y:1,badge:'第二阶段：占领 E7 北端轨道锁',tone:'gold',from:[3,4]},
    {x:3,y:0,badge:'第三阶段：送入 D8/E8 交付口',tone:'cyan',from:[4,1]}
   ]:[
    {x:3,y:6,badge:'◉ 第一阶段目标：夺取 D2 密钥 / 占领 D2 轨道锁',tone:'red',from:[2,2]},
    {x:3,y:7,badge:'后续目标：送入 D1/E1 南端交付口',tone:'gold',from:[3,6]}
   ]
  })
 ];

 if(mid===3)return[
  echoCard('CG 04 · 镜室叛歌','D–00 MIRROR ARCHIVE / 战区全景扫描',['第 1 步：扫描 D–00 中枢镜像库与中央电磁门','第 2 步：总架构师朔夜与隔山重炮绯律现身','第 3 步：锁定 B5/G5 双子终端与 D5/E5 同步座'],'D–00 中枢镜像库。要击穿下一章 Ω–00 母巢反应堆的无敌护盾，就必须在这里解开中央电磁门，同步双子终端并提取破盾源码！',{
   who:'noct',side:C.side,scene:'archive',sound:'cut',
   cgBanner:{title:'CG 04 · 镜室叛歌：王座之上的总架构师朔夜',sub:'胸口正中嵌着初代赤蛛王的总架构师朔夜悬浮于中枢镜室，红色神经缆线贯穿全场'},
   revealUnits:[]
  }),
  echoLine('iris','【全息沙盘已展开】：8×8 战区地形与关键设施扫描完毕！现在，双方作战单位依次降临棋盘！',{
   who:'noct',side:C.side,scene:'archive',sound:'cut',
   camera:'establish',caption:'第 1 步 · 战区空棋盘地形先展示',
   stageStep:'map',revealUnits:[],
   markers:[{x:1,y:3,badge:'西镜像终端 B5',tone:'cyan'},{x:6,y:3,badge:'东镜像终端 G5',tone:'cyan'},{x:3,y:3,badge:'中央电磁门 D5/E5',tone:'gold'}]
  }),
  echoLine('noct','欢迎来到中枢镜像库。我是天穹站总架构师【朔夜】。当我试图锁死母巢时，初代赤蛛王刺穿了我的胸口正中……如今我与赤巢同在。',{
   side:'r',camera:'establish',axis:'right',sound:'pulse',caption:'▲ 受控总架构师 · 朔夜 现身镜室深处',
   revealUnits:['noct'],focusCell:[5,1],
   markers:[{x:5,y:1,badge:'▲ 赤巢最高统帅：朔夜',tone:'red'}]
  }),
  echoLine('ruby','我是最高安全隔离官【绯律】。中央电磁门后就是我的【隔山重炮】射界——只要直线上隔着任意一枚棋子做炮架，我的电浆炮就能轰碎炮架后的目标！',{
   side:'r',camera:'close',axis:'right',caption:'▲ 受控安全隔离官 · 绯律（隔山重炮）登场',
   revealUnits:['ruby','lark','veil','psalm','nyx','june','echo','spider','sentinel'],focusCell:[2,0],
   markers:[{x:2,y:0,badge:'▲ 隔山重炮：绯律（隔1子远距轰击）',tone:'red'}]
  }),
  echoLine('lyra','苍穹防线全员进场！大家注意分散队形，千万不要在同一条竖线上前后重叠给绯律当炮架！',{
   side:'g',camera:'medium',axis:'left',caption:'苍穹防线全员突入镜室南翼',
   revealUnits:['lyra','akira','iris','kuro','sola','misa','sera','celia','vega','astra','drone'],focusCell:[2,7]
  }),
  echoLine('misa','指挥官，中央【D5 与 E5】现在被电磁装甲门封死，无法通行！必须先派人踩上西侧【B5】或东侧【G5】任一终端，才能降下中央大门！',{
   side:'g',camera:'close',axis:'left',caption:'机关解析：先占 B5/G5 降下 D5/E5 电磁门',
   focusCell:[3,3],
   markers:[{x:3,y:3,badge:'◈ 中央电磁门 D5/E5（占终端后开启）',tone:'gold'}]
  }),
  echoLine('kuro','大门降下后，我们还要同时占住【B5 与 G5 两座终端】，并派一名队员踏入中央【D5 或 E5 同步座】坚守两个轮末，才能读取完整的破盾源码！',{
   side:'g',camera:'close',axis:'left',caption:'后续步骤：双终端同步 + 固守中央同步座两轮',
   focusCell:[4,3]
  }),
  echoLine(g?'lyra':'noct',g?'【第一阶段任务标记锁定】：左右分兵突击！先派高机动单位占领西侧【B5 终端】或东侧【G5 终端】，降下中央电磁大门！':'【第一阶段任务标记锁定】：先派单位占领【B5 或 G5 终端】降下中央电磁大门，同时严密保护【朔夜】不死，送她进入中央 D5/E5 同步座！',{
   side:C.side,camera:'close',axis:'left',sound:'knock',caption:'◉ 阶段一任务锁定：占领 B5 或 G5 终端开启中央镜室',
   revealUnits:['ALL'],focusCell:[1,3],
   markers:[
    {x:1,y:3,badge:'◉ 第一阶段目标：占领 B5 西终端开门',tone:'cyan',from:[1,6]},
    {x:6,y:3,badge:'◉ 或占领 G5 东终端开门',tone:'cyan',from:[6,6]},
    {x:3,y:3,badge:'开门后目标：进入 D5/E5 同步座守 2 轮',tone:'gold',from:[1,3]}
   ]
  })
 ];

 return[
  echoCard('CG 05 · 赤巢零点','Ω–00 HIVE REACTOR / 终局决战全景扫描',['第 1 步：扫描 Ω–00 母巢反应堆与 E8 赤巢内核','第 2 步：十八名美少女机娘全阵容终局集结','第 3 步：锁定 B6/G6 护盾终端、近场断链与 E8 内核目标'],'Ω–00 母巢反应堆——所有胸口红色机械蜘蛛的诞生源头！【E8 赤巢无限增殖内核】每隔 '+(S?.spawnEvery||2)+' 轮就会自动孵化新的赤蛛，决战时刻到了！',{
   who:g?'lyra':'noct',side:C.side,scene:'reactor',sound:'cut',
   cgBanner:{title:'CG 05 · 赤巢零点：粉碎无限增殖内核',sub:'苍穹防线全员向 E8 赤巢母巢内核发起总攻，磁轨炮与高周波剑斩裂赤红护盾'},
   revealUnits:[]
  }),
  echoLine('iris','【全息沙盘已展开】：8×8 战区地形与关键设施扫描完毕！现在，双方作战单位依次降临棋盘！',{
   who:g?'lyra':'noct',side:C.side,scene:'reactor',sound:'cut',
   camera:'establish',caption:'第 1 步 · 战区空棋盘地形先展示',
   stageStep:'map',revealUnits:[],
   markers:[{x:4,y:0,badge:'▲ 赤巢无限内核 E8',tone:'red'},{x:1,y:2,badge:'西护盾终端 B6',tone:'cyan'},{x:6,y:2,badge:'东护盾终端 G6',tone:'cyan'}]
  }),
  echoLine('noct','听见反应堆的脉动了吗？位于【E8】的赤巢无限内核受到双重法则护盾保护，普通攻击根本无法伤它分毫。',{
   side:'r',camera:'establish',axis:'right',sound:'pulse',caption:'▲ 赤巢母巢核心 [E8] 与赤巢军团现身',
   revealUnits:['hive','noct','lark','veil','psalm','nyx','june','echo','ruby','spider'],focusCell:[4,0],
   markers:[{x:4,y:0,badge:'◈ E8 赤巢内核（护盾在线时免疫攻击）',tone:'red'}]
  }),
  echoLine('lyra','苍穹防线全员——向 Ω–00 反应堆主甲板集结！只要斩断它的双层护盾，我们就能亲手轰碎这颗罪恶的母巢内核！',{
   side:'g',camera:'medium',axis:'left',caption:'苍穹防线全员集结完毕',
   revealUnits:['lyra','akira','iris','kuro','sola','misa','sera','celia','vega','astra','drone','sentinel'],focusCell:[2,7]
  }),
  echoLine('misa','全员牢记【破除内核护盾三步曲】：第一步，先占领【B6 与 G6】两座护盾终端并连续稳守两个轮末，关闭外层电磁护盾！',{
   side:'g',camera:'close',axis:'left',caption:'破盾第 1 步：同时控制 B6 与 G6 终端维持 2 轮',
   focusCell:[1,2],
   markers:[{x:1,y:2,badge:'[1] 控制 B6 西护盾终端',tone:'cyan'},{x:6,y:2,badge:'[1] 控制 G6 东护盾终端',tone:'cyan'}]
  }),
  echoLine('astra','第二步：外层护盾关闭后，派一名队员抵近【E8 内核相邻格】（弥砂可在 2 格内）点击右侧面板的【固守 · 近场断链】按钮，彻底斩断内核的近场锁！',{
   side:'g',camera:'close',axis:'left',caption:'破盾第 2 步：抵近 E8 内核旁点击「固守」断链',
   focusCell:[4,1],
   markers:[{x:4,y:1,badge:'[2] 在 E8 旁点击「固守·近场断链」',tone:'gold',from:[1,2]}]
  }),
  echoLine('akira','第三步：只要近场锁一断，保持 B6、G6 双终端在手，任何队员都能直接攻入【E8】一击轰碎赤巢母巢内核！',{
   side:'g',camera:'close',axis:'left',caption:'破盾第 3 步：直接攻入 E8 摧毁赤巢内核',
   focusCell:[4,0],
   markers:[{x:4,y:0,badge:'[3] 攻入 E8 彻底摧毁赤巢内核！',tone:'red',from:[4,1]}]
  }),
  echoLine(g?'lyra':'noct',g?'【第一阶段任务标记锁定】：全军突击！不要跟无限孵化的小蜘蛛缠斗，立刻抢占【B6 西护盾终端】与【G6 东护盾终端】！':'【第一阶段任务标记锁定】：母巢正在孵化首波赤蛛潮！守住前两轮防线，撕裂守护者阵型并开启对地广播，死守 E8 内核至第 12 轮！',{
   side:C.side,camera:'close',axis:'left',sound:'knock',caption:g?'◉ 阶段一任务锁定：抢占 B6 / G6 护盾终端':'◉ 阶段一任务锁定：守住首波孵化并反击',
   revealUnits:['ALL'],focusCell:g?[1,2]:[4,0],
   markers:g?[
    {x:1,y:2,badge:'◉ 第一阶段目标：占领 B6 护盾终端',tone:'cyan',from:[1,6]},
    {x:6,y:2,badge:'◉ 或占领 G6 护盾终端',tone:'cyan',from:[6,6]},
    {x:4,y:0,badge:'终极目标：破盾后摧毁 E8 内核',tone:'red',from:[4,1]}
   ]:[
    {x:4,y:0,badge:'◉ 守护核心：保住 E8 内核不灭',tone:'red'},
    {x:1,y:2,badge:'后续目标：占领 B6/G6 开启对地广播',tone:'gold',from:[4,0]}
   ]
  })
 ];
}

function echoTransition(mid,stage,side){
 const g=side==='g',key=`${mid}:${stage}`;
 const table={
  '0:1':g?[
   echoLine('iris','【战果确认】：C4 接驳门禁台已成功破译！北侧通道的防爆电磁锁已经全部打开了！',{
    side:'g',camera:'close',sound:'cut',caption:'✓ 第一阶段达成：C4 门禁已解封',
    focusCell:[2,4],markers:[{x:2,y:4,badge:'✓ C4 门禁已解封',tone:'cyan'}]
   }),
   echoLine('kuro','注意！北侧气闸门开启的同时，赤巢的重装哨卫与赤蛛正从北侧入口涌入，而东侧 H 列的【载毒信使】正全速冲向北端 H8！',{
    side:'g',camera:'close',caption:'▲ 敌情异动：北侧哨卫增援 & 信使逃向 H8',
    focusCell:[7,2],markers:[{x:7,y:0,badge:'▲ 阻止信使逃入 H8',tone:'red',from:[7,4]}]
   }),
   echoLine('lyra','【第二阶段任务标记锁定】：主力立即北上占领【D8 主中继站】（并在 D8 固守读取授时头），机动部队全力在 H8 之前截杀【载毒信使】夺回数据包！',{
    side:'g',camera:'close',sound:'knock',caption:'◉ 第二阶段任务锁定：占领 D8 中继站 + 截获信使数据',
    focusCell:[3,0],markers:[
     {x:3,y:0,badge:'◉ 第二阶段目标：占领 D8 主中继站',tone:'cyan',from:[2,4]},
     {x:7,y:0,badge:'◉ 截杀奔向 H8 的载毒信使',tone:'gold',from:[6,6]}
    ]
   })
  ]:[
   echoLine('lark','【战果确认】：苍穹防线的第一道封锁网已经被我们撕开了！更多赤红机械蜘蛛正从通风管涌入甲板！',{
    side:'r',camera:'close',sound:'cut',caption:'✓ 第一阶段达成：防线突破',
    focusCell:[5,1]
   }),
   echoLine('noct','【第二阶段任务标记锁定】：继续掩护东侧【载毒信使】冲进北端【H8 撤离井】，或者指挥赤蛛累计扑击寄生【2 名守护者机娘】！',{
    side:'r',camera:'close',sound:'knock',caption:'◉ 第二阶段任务锁定：信使入 H8 或 累计感染 2 人',
    focusCell:[7,0],markers:[{x:7,y:0,badge:'◉ 目标：护送信使进入 H8 或累计感染2人',tone:'red',from:[7,3]}]
   })
  ],
  '0:2':g?[
   echoLine('iris','【战果确认】：D8 主中继站的原始数据已成功截获！但空间站内环的自动封锁门正在落下，大批赤蛛正在合围！',{
    side:'g',camera:'close',sound:'cut',caption:'✓ 第二阶段达成：中继数据已夺回',
    focusCell:[3,0],markers:[{x:3,y:0,badge:'✓ D8 中继数据已夺回',tone:'cyan'}]
   }),
   echoLine('akira','南侧甲板的应急撤收通道已经全部打开了，坐标就在最南端的【A1、C1、F1】！',{
    side:'g',camera:'close',caption:'通道开启：南端 A1 / C1 / F1 撤离点就绪',
    focusCell:[2,7]
   }),
   echoLine('lyra','【第三阶段任务标记锁定】：掩护至少 2 名己方单位踏上南侧【A1、C1 或 F1 撤离点】安全转入空间站内环！（撤离的机娘将在下一章继续参战）',{
    side:'g',camera:'close',sound:'knock',caption:'◉ 第三阶段任务锁定：2 名己方单位从 A1/C1/F1 撤离',
    focusCell:[2,7],markers:[
     {x:0,y:7,badge:'◉ 撤离口 A1',tone:'cyan',from:[1,5]},
     {x:2,y:7,badge:'◉ 撤离口 C1',tone:'cyan',from:[3,0]},
     {x:5,y:7,badge:'◉ 撤离口 F1',tone:'cyan',from:[5,4]}
    ]
   })
  ]:[
   echoLine('lark','【战果确认】：母本数据与受控宿体已就位！北端【C8、F8、H8】深层撤收井已打开！',{
    side:'r',camera:'close',sound:'cut',caption:'✓ 第二阶段达成：准备撤入深层',
    focusCell:[5,0]
   }),
   echoLine('noct','【第三阶段任务标记锁定】：立刻让 2 个赤巢单位从北端【C8、F8 或 H8】撤离点转入空间站内环！',{
    side:'r',camera:'close',sound:'knock',caption:'◉ 第三阶段任务锁定：2 个单位从 C8/F8/H8 撤离',
    focusCell:[5,0],markers:[
     {x:2,y:0,badge:'◉ 撤离口 C8',tone:'red'},
     {x:5,y:0,badge:'◉ 撤离口 F8',tone:'red'},
     {x:7,y:0,badge:'◉ 撤离口 H8',tone:'red'}
    ]
   })
  ],
  '1:1':g?[
   echoLine('misa','【战果确认】：第一座冷却阀已经打开！但单侧降温还不足以解除中央 E5 孵化池的高温电磁锁！',{
    side:'g',camera:'close',sound:'cut',caption:'✓ 第一阶段达成：单侧冷却阀已开启',
    focusCell:[1,1]
   }),
   echoLine('sera','小心北侧通风口！赤巢派出了新的机械蜘蛛增援，企图夺回冷却阀！',{
    side:'g',camera:'close',caption:'▲ 敌情异动：北侧赤蛛增援出现',
    focusCell:[6,1]
   }),
   echoLine('lyra','【第二阶段任务标记锁定】：同时占领【B7 西冷却阀】与【G7 东冷却阀】，并连续稳守【2 个轮末】，彻底解除中央孵化池的高温锁定！',{
    side:'g',camera:'close',sound:'knock',caption:'◉ 第二阶段任务锁定：同时控制 B7 与 G7 维持 2 轮末',
    focusCell:[6,1],markers:[
     {x:1,y:1,badge:'◉ 保持控制：B7 西冷却阀',tone:'cyan'},
     {x:6,y:1,badge:'◉ 同时占领：G7 东冷却阀（维持2轮）',tone:'cyan'}
    ]
   })
  ]:[
   echoLine('psalm','【战果确认】：E5 培育台的温室样本已经到手！',{
    side:'r',camera:'close',sound:'cut',caption:'✓ 第一阶段达成：已夺取 E5 样本',
    focusCell:[4,3]
   }),
   echoLine('veil','【第二阶段任务标记锁定】：指挥【赤红机械蜘蛛】扑击感染工程师【弥砂】（切勿用机娘误杀她！），并至少占领 B7 或 G7 其中一座冷却阀！',{
    side:'r',camera:'close',sound:'knock',caption:'◉ 第二阶段任务锁定：用赤蛛感染弥砂 + 占领冷却阀',
    focusCell:[4,3],markers:[
     {x:1,y:1,badge:'◉ 占领 B7 或 G7 冷却阀',tone:'red'},
     {x:4,y:3,badge:'▲ 必须用赤蛛感染弥砂（勿误杀）',tone:'gold'}
    ]
   })
  ],
  '1:2':g?[
   echoLine('misa','【战果确认】：B7 与 G7 双冷却阀已稳定运行两轮！中央【E5 机械蜘蛛孵化池】的高温护盾彻底解除！',{
    side:'g',camera:'close',sound:'cut',caption:'✓ 第二阶段达成：E5 孵化池总阀已解锁',
    focusCell:[4,3],markers:[{x:4,y:3,badge:'✓ E5 孵化池总阀已解锁',tone:'cyan'}]
   }),
   echoLine('sera','【第三阶段任务标记锁定】：保持 B7、G7 双阀归属我方，派任意队员踏上中央【E5】（或让弥砂站在 E5 相邻格）点击右侧【固守 · 紧急隔离】按钮，彻底封死孵化池！',{
    side:'g',camera:'close',sound:'knock',caption:'◉ 第三阶段任务锁定：在 E5（弥砂可相邻）点击「固守」封池',
    focusCell:[4,3],markers:[
     {x:4,y:3,badge:'◉ 终极目标：在 E5 点击「固守·紧急隔离」',tone:'gold',from:[1,1]},
     {x:1,y:1,badge:'保持控制 B7',tone:'cyan'},
     {x:6,y:1,badge:'保持控制 G7',tone:'cyan'}
    ]
   })
  ]:[
   echoLine('misa','……胸口正中的红蜘蛛……已经接管了我的工程机械臂……我现在为赤巢效命。',{
    side:'r',camera:'close',sound:'pulse',caption:'✓ 第二阶段达成：工程师弥砂已被赤蛛寄生',
    focusCell:[4,3]
   }),
   echoLine('veil','【第三阶段任务标记锁定】：保住受控的弥砂与样本，派单位在中央【E5】（弥砂可在相邻格）点击【固守 · 覆写培育台】完成改造！',{
    side:'r',camera:'close',sound:'knock',caption:'◉ 第三阶段任务锁定：在 E5 点击「固守·覆写培育台」',
    focusCell:[4,3],markers:[{x:4,y:3,badge:'◉ 终极目标：在 E5 点击「固守·覆写培育台」',tone:'red'}]
   })
  ],
  '2:1':g?[
   echoLine('vega','【战果确认】：方舟火控密钥已经顺利护送过半场！但北端【D8 / E8 交付口】的装甲闸门仍处于锁死状态！',{
    side:'g',camera:'close',sound:'cut',caption:'✓ 第一阶段达成：火控密钥已推进至桥心',
    focusCell:[3,4]
   }),
   echoLine('astra','【第二阶段任务标记锁定】：保护好携带密钥的单位，先派先锋攻占北侧【E7 北端轨道锁】，打开北端交付闸门！',{
    side:'g',camera:'close',sound:'knock',caption:'◉ 第二阶段任务锁定：占领 E7 北端轨道锁',
    focusCell:[4,1],markers:[
     {x:4,y:1,badge:'◉ 第二阶段目标：占领 E7 北端轨道锁',tone:'cyan',from:[3,4]},
     {x:3,y:0,badge:'解锁后开启：D8/E8 交付口',tone:'gold',from:[4,1]}
    ]
   })
  ]:[
   echoLine('june','【战果确认】：我们已经截断了天桥运输线！',{
    side:'r',camera:'close',sound:'cut',caption:'✓ 第一阶段达成：运输线已截断',
    focusCell:[3,6]
   }),
   echoLine('echo','【第二阶段任务标记锁定】：确保【方舟火控密钥】掌握在我方手中，并占领南侧【D2 南端轨道锁】打开南端发射井！',{
    side:'r',camera:'close',sound:'knock',caption:'◉ 第二阶段任务锁定：持有密钥 + 占领 D2 南端轨道锁',
    focusCell:[3,6],markers:[{x:3,y:6,badge:'◉ 第二阶段目标：持有密钥并占领 D2 轨道锁',tone:'red'}]
   })
  ],
  '2:2':g?[
   echoLine('iris','【战果确认】：E7 北端轨道锁已由我方接管！最北端【D8 与 E8 密钥交付口】的闸门已经完全敞开！',{
    side:'g',camera:'close',sound:'cut',caption:'✓ 第二阶段达成：D8 / E8 交付口已开启',
    focusCell:[4,1],markers:[{x:4,y:1,badge:'✓ E7 轨道锁已开启',tone:'cyan'}]
   }),
   echoLine('lyra','【第三阶段任务标记锁定】：保持【E7 轨道锁】归属我方，护送携带火控密钥的单位直接踏入最北端【D8 或 E8 交付口】完成锁死！',{
    side:'g',camera:'close',sound:'knock',caption:'◉ 第三阶段任务锁定：携密钥踏入 D8 或 E8 交付口',
    focusCell:[3,0],markers:[
     {x:3,y:0,badge:'◉ 终极目标：携密钥踏入 D8 交付口',tone:'gold',from:[4,1]},
     {x:4,y:0,badge:'◉ 或踏入 E8 交付口',tone:'gold',from:[4,1]}
    ]
   })
  ]:[
   echoLine('june','【战果确认】：D2 南端轨道锁已开启！南端【D1 与 E1】发射交付口已经就绪！',{
    side:'r',camera:'close',sound:'cut',caption:'✓ 第二阶段达成：南端交付口已开启',
    focusCell:[3,6]
   }),
   echoLine('noct','【第三阶段任务标记锁定】：保持 D2 轨道锁归属赤巢，护送携带密钥的单位直接踏入最南端【D1 或 E1 交付口】！',{
    side:'r',camera:'close',sound:'knock',caption:'◉ 第三阶段任务锁定：携密钥踏入 D1 或 E1 交付口',
    focusCell:[3,7],markers:[
     {x:3,y:7,badge:'◉ 终极目标：携密钥踏入 D1 交付口',tone:'red',from:[3,6]},
     {x:4,y:7,badge:'◉ 或踏入 E1 交付口',tone:'red',from:[3,6]}
    ]
   })
  ],
  '3:1':g?[
   echoLine('misa','【战果确认】：单侧终端已接管！轰隆——中央【D5 与 E5】的电磁装甲门已经降下了，中央镜室同步座已暴露！',{
    side:'g',camera:'close',sound:'cut',caption:'✓ 第一阶段达成：中央 D5/E5 电磁门已降下',
    focusCell:[3,3],markers:[{x:3,y:3,badge:'✓ 中央电磁门 D5/E5 已开启',tone:'cyan'}]
   }),
   echoLine('lyra','【第二阶段任务标记锁定】：继续推进，同时占领西侧【B5 终端】与东侧【G5 终端】，解锁中央同步座的破盾校验权限！',{
    side:'g',camera:'close',sound:'knock',caption:'◉ 第二阶段任务锁定：同时占领 B5 与 G5 双终端',
    focusCell:[6,3],markers:[
     {x:1,y:3,badge:'◉ 同时控制：B5 西镜像终端',tone:'cyan'},
     {x:6,y:3,badge:'◉ 同时控制：G5 东镜像终端',tone:'cyan'}
    ]
   })
  ]:[
   echoLine('ruby','【战果确认】：中央【D5 与 E5】电磁门已开启！',{
    side:'r',camera:'close',sound:'cut',caption:'✓ 第一阶段达成：中央镜室已开启',
    focusCell:[3,3]
   }),
   echoLine('noct','【第二阶段任务标记锁定】：保护我（朔夜）不被击杀，并同时占领【B5 与 G5 两座镜像终端】！',{
    side:'r',camera:'close',sound:'knock',caption:'◉ 第二阶段任务锁定：保住朔夜 + 同时控制 B5/G5',
    focusCell:[1,3],markers:[
     {x:1,y:3,badge:'◉ 占领 B5 西终端',tone:'red'},
     {x:6,y:3,badge:'◉ 占领 G5 东终端',tone:'red'}
    ]
   })
  ],
  '3:2':g?[
   echoLine('iris','【战果确认】：B5 与 G5 双子终端已同时联通！中央【D5 与 E5 镜室同步座】亮起了蓝色的校验光环！',{
    side:'g',camera:'close',sound:'cut',caption:'✓ 第二阶段达成：双子终端已联通',
    focusCell:[3,3],markers:[{x:3,y:3,badge:'★ 中央同步座 D5/E5 已激活',tone:'gold'}]
   }),
   echoLine('lyra','【第三阶段任务标记锁定】：在保持【B5、G5 双终端】归属我方的同时，派任意一名我方单位踏入中央【D5 或 E5 同步座】并连续坚守【2 个轮末】，即可完成破盾源码提取！',{
    side:'g',camera:'close',sound:'knock',caption:'◉ 第三阶段任务锁定：派单位站上 D5/E5 同步座并保持双终端 2 轮末',
    focusCell:[3,3],markers:[
     {x:3,y:3,badge:'◉ 终极目标：站上 D5 或 E5 坚守 2 轮末',tone:'gold',from:[1,3]},
     {x:4,y:3,badge:'◉ 同步座 E5',tone:'gold',from:[6,3]},
     {x:1,y:3,badge:'保持 B5',tone:'cyan'},
     {x:6,y:3,badge:'保持 G5',tone:'cyan'}
    ]
   })
  ]:[
   echoLine('ruby','【战果确认】：B5 与 G5 双子终端已锁定！中央【D5 / E5 同步座】已准备就绪！',{
    side:'r',camera:'close',sound:'cut',caption:'✓ 第二阶段达成：双子终端已锁定',
    focusCell:[3,3]
   }),
   echoLine('noct','【第三阶段任务标记锁定】：保持 B5、G5 双终端归属赤巢，由我（朔夜）亲自踏入中央【D5 或 E5 同步座】并连续坚守【2 个轮末】！',{
    side:'r',camera:'close',sound:'knock',caption:'◉ 第三阶段任务锁定：让朔夜进入 D5/E5 坚守 2 轮末',
    focusCell:[3,3],markers:[
     {x:3,y:3,badge:'◉ 终极目标：朔夜站上 D5/E5 坚守 2 轮末',tone:'red'},
     {x:4,y:3,badge:'◉ 同步座 E5',tone:'red'}
    ]
   })
  ],
  '4:1':g?[
   echoLine('misa','【战果确认】：已切入第一座护盾终端！但 E8 母巢内核的护盾需要双侧终端同时谐振才能剥离！',{
    side:'g',camera:'close',sound:'cut',caption:'✓ 第一阶段达成：已切入首座护盾终端',
    focusCell:[1,2]
   }),
   echoLine('lyra','【第二阶段任务标记锁定】：同时占领【B6 西护盾终端】与【G6 东护盾终端】，并连续稳守【2 个轮末】剥离外层电磁护盾！',{
    side:'g',camera:'close',sound:'knock',caption:'◉ 第二阶段任务锁定：同时控制 B6 与 G6 维持 2 轮末',
    focusCell:[6,2],markers:[
     {x:1,y:2,badge:'◉ 同时控制：B6 西护盾终端',tone:'cyan'},
     {x:6,y:2,badge:'◉ 同时控制：G6 东护盾终端（维持2轮）',tone:'cyan'}
    ]
   })
  ]:[
   echoLine('noct','【战果确认】：第一波赤蛛增殖潮已经涌出孵化槽！',{
    side:'r',camera:'close',sound:'cut',caption:'✓ 第一阶段达成：首波赤蛛增殖完成',
    focusCell:[4,0]
   }),
   echoLine('lark','【第二阶段任务标记锁定】：发起反击！在本阶段内用赤蛛【扑击感染 1 名守护者机娘】，或【击杀 2 个守护者单位】折断她们的阵线！',{
    side:'r',camera:'close',sound:'knock',caption:'◉ 第二阶段任务锁定：感染 1 名机娘 或 击杀 2 个敌军',
    focusCell:[3,5],markers:[{x:2,y:6,badge:'◉ 目标：感染 1 名机娘 或 击杀 2 敌军',tone:'red',from:[3,1]}]
   })
  ],
  '4:2':g?[
   echoLine('misa','【战果确认】：B6 与 G6 双终端已稳定谐振两轮！E8 母巢内核的外层护盾已经消失，只剩最后一道近场增殖总线！',{
    side:'g',camera:'close',sound:'cut',caption:'✓ 第二阶段达成：外层护盾已剥离',
    focusCell:[4,0],markers:[{x:4,y:0,badge:'⚡ 外层护盾已解除！需近场断链',tone:'gold'}]
   }),
   echoLine('astra','【第三阶段任务标记锁定】：保持 B6、G6 双终端归属我方，派任意队员移动到【E8 内核相邻格】（弥砂可在 2 格内）点击右侧【固守 · 近场断链】按钮斩断总线！',{
    side:'g',camera:'close',sound:'knock',caption:'◉ 第三阶段任务锁定：在 E8 相邻格点击「固守·近场断链」',
    focusCell:[4,1],markers:[
     {x:4,y:1,badge:'◉ 第三阶段目标：抵近 E8 旁点击「固守·近场断链」',tone:'gold',from:[1,2]},
     {x:3,y:0,badge:'可断链位置 D8',tone:'cyan'},
     {x:5,y:0,badge:'可断链位置 F8',tone:'cyan'}
    ]
   })
  ]:[
   echoLine('noct','【战果确认】：守护者的前锋防线已经被我们撕裂！',{
    side:'r',camera:'close',sound:'cut',caption:'✓ 第二阶段达成：守护者阵线已折断',
    focusCell:[1,2]
   }),
   echoLine('ruby','【第三阶段任务标记锁定】：占领【B6 或 G6】任一终端，并让站在该终端上的赤巢单位点击右侧【固守 · 开启广播】按钮启动对地信号！',{
    side:'r',camera:'close',sound:'knock',caption:'◉ 第三阶段任务锁定：占领 B6/G6 并点击「固守·开启广播」',
    focusCell:[1,2],markers:[
     {x:1,y:2,badge:'◉ 占领 B6 并点击「固守·开启广播」',tone:'red'},
     {x:6,y:2,badge:'◉ 或在 G6 点击「固守·开启广播」',tone:'red'}
    ]
   })
  ],
  '4:3':g?[
   echoLine('misa','【战果确认】：近场增殖总线已彻底斩断！【E8 赤巢母巢内核】的所有护盾已经完全瓦解，它现在完全暴露在我们的火力之下！',{
    side:'g',camera:'close',sound:'pulse',caption:'✓ 第三阶段达成：E8 内核无敌锁已彻底破除！',
    focusCell:[4,0],markers:[{x:4,y:0,badge:'✓ E8 内核护盾全破！可直接攻击！',tone:'red'}]
   }),
   echoLine('lyra','【最终阶段任务标记锁定】：保持 B6 与 G6 双终端归属我方，全军向【E8 赤巢母巢内核】发起最后一击——直接吃掉 E8，彻底终结机械蜘蛛危机！',{
    side:'g',camera:'close',sound:'knock',caption:'◉ 最终决战锁定：保持双终端，直接攻入 E8 摧毁赤巢内核！',
    focusCell:[4,0],markers:[
     {x:4,y:0,badge:'◉ 最终目标：直接攻入 E8 摧毁赤巢内核！',tone:'red',from:[4,1]},
     {x:1,y:2,badge:'保持控制 B6',tone:'cyan'},
     {x:6,y:2,badge:'保持控制 G6',tone:'cyan'}
    ]
   })
  ]:[
   echoLine('noct','【战果确认】：对地轨道广播已全面启动！六座轨道空投井正在倒计时充能！',{
    side:'r',camera:'close',sound:'pulse',caption:'✓ 第三阶段达成：对地轨道广播已启动',
    focusCell:[4,0]
   }),
   echoLine('lark','【最终阶段任务标记锁定】：保持广播在线，死守【E8 赤巢内核】存活至第 12 轮末，或全歼场上剩余的守护者单位！',{
    side:'r',camera:'close',sound:'knock',caption:'◉ 最终决战锁定：死守 E8 内核至第 12 轮末 或 全歼敌军',
    focusCell:[4,0],markers:[{x:4,y:0,badge:'◉ 终极目标：死守 E8 内核至第 12 轮末',tone:'red'}]
   })
  ]
 };
 return table[key]||[];
}

function echoEndingInfo(){
 const open=C.flags.disclosure==='open';
 if(C.side==='g')return open?{
  title:'原件送达 / 苍穹凯旋',
  subtitle:'ENDING G–A / AEGIS VICTORY & FULL DISCLOSURE',
  text:'E8 赤巢无限增殖内核在雷鸣般的爆炸中彻底粉碎。你选择向全人类公开天穹空间站的完整病毒卷宗，地球轨道防卫网全面升级。幸存的美少女机娘们终于踏上返航舰，而那些曾被红蜘蛛锁死胸口的同伴名字，被镌刻在了深空纪念碑的正中央。'
 }:{
  title:'绝密封存 / 寂静返航',
  subtitle:'ENDING G–B / AEGIS VICTORY & CLASSIFIED SEAL',
  text:'E8 赤巢母巢内核已被彻底摧毁，对地轨道空投舱永久锁死。你提交了最高机密歼灭回执，将天穹空间站与胸口寄生蜘蛛的残酷影像永久封存于深空。地球迎来了平静的黎明，只有幸存的机娘们记得那场在钢铁棋盘上的生死决战。'
 };
 return open?{
  title:'停产条件',
  subtitle:'ENDING R–A / HIVE CONTAINMENT PROTOCOL',
  text:'在统治天穹空间站的最后一刻，受控的朔夜与璃雀用残存的人类记忆锁死了对地空投舱，向地球发送了停产与永久隔离协议。胸口闪耀红光的机娘们没有入侵地球，而是选择将整座空间站化作漂向深空尽头的孤岛。'
 }:{
  title:'默认继续',
  subtitle:'ENDING R–B / CRIMSON ORBITAL DAWN',
  text:'随着六座轨道发射井同时点火，成千上万枚装载着赤红机械蜘蛛的空投舱如流星雨般坠入地球大气层。天穹空间站化作了赤巢意识的轨道王座，胸口正中央闪耀的红光成为了新纪元的唯一律法。'
 };
}

function echoEndingFrames(){
 const end=echoEndingInfo(),g=C.side==='g',open=C.flags.disclosure==='open';
 return g?[
  echoCard('终局档案 / 战役结算',open?'PUBLIC ARCHIVE':'CLASSIFIED SEAL',[`结局：${end.title}`,`公开策略：${open?'公开完整病毒卷宗':'最高机密封存'}`,`存活归队：${Object.entries(C.roster).filter(([_,r])=>r.status==='active'&&r.side==='g').map(([id])=>CHAR[id].name).join('、')||'无'}`],end.text,{who:'lyra',side:'g',scene:'reactor',sound:'cut',cgBanner:{title:'终局 CG · 赤巢覆灭与黎明返航',sub:end.title}}),
  echoLine('lyra',open?'所有阵亡与受控同伴的名字，都已经完整写入人类防卫史册。苍穹防线，返航！':'封存档案吧。只要蔚蓝的地球还在安静转动，我们付出的一切就都有意义。',{side:'g',camera:'close',axis:'left',caption:'地球返航轨道'})
 ]:[
  echoCard('终局档案 / 赤巢纪元',open?'CONTAINMENT':'ORBITAL DROP',[`结局：${end.title}`,`终局指令：${open?'停产隔离协议':'全球轨道空投'}`,`赤巢阵容：${Object.entries(C.roster).filter(([_,r])=>r.status==='active'&&r.side==='r').map(([id])=>CHAR[id].name).join('、')||'无'}`],end.text,{who:'noct',side:'r',scene:'station',sound:'pulse',cgBanner:{title:'终局 CG · 赤巢王座的最终意志',sub:end.title}}),
  echoLine('noct',open?'把空间站驶向深空吧。胸口这盏红灯，将在没有人类的星海里永远跳动下去。':'看呐，地球的大气层已经被赤巢的流星染红了。新的机械纪元，降临了。',{side:'r',camera:'close',axis:'right',caption:'天穹空间站 · 主观测窗'})
 ];
}
