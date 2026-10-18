'use strict';
const CHAR = {
 lyra:{name:'零音',en:'LYRA',code:'EGIS–01',role:'战术指挥',rune:'后',value:8,move:'queen',rule:'八方向直行 1—2 格；路径不可穿越单位或舱壁。',upgrade:'同步 II：直行上限提升至 3 格。',trait:'与绛刃相邻时，绛刃的直线射程 +1。',bio:'地球防卫组织「苍穹防线」第一特遣队指挥官。率队强行接驳失联的天穹空间站，誓要赶在赤巢向地球发射空投舱前摧毁母巢内核。',quote:'全小队听令：看清红蜘蛛的扑击威胁，绝不让任何一名同伴落入虫群！'},
 akira:{name:'绛刃',en:'AKIRA',code:'EGIS–07',role:'轨刃突击',rune:'车',value:8,move:'rook',rule:'沿横线或竖线移动 1—4 格；不可越过阻挡。',upgrade:'同步 II：直线射程 +1；并肩零音可再 +1。',trait:'交叉火力：与零音相邻时，直线射程 +1。',bio:'苍穹防线重装破阵突击手，操纵高周波电磁轨刃。永远冲在最前线为小队劈开机械蜘蛛防线。',quote:'电磁轨刃已充能！只要我还在前线，那些红蜘蛛休想越过雷池一步！'},
 lark:{name:'璃雀',en:'LARK',code:'EGIS–12',role:'折翼侦察',rune:'马',value:7,move:'knight',rule:'走“日”字：2 格 + 垂直 1 格。可跳过单位、舱壁和裂隙，但不能落在阻挡格。',upgrade:'同步 II：额外获得对角 2 格的跳跃。',trait:'与弥砂相邻时，弥砂可额外跨 2 格进行炮击。',bio:'先遣调查分队的高机动侦察机娘。在A–01接驳甲板遭赤蛛偷袭，胸口正中被植入发光红蜘蛛控制装置，成为母巢的开路先锋。',quote:'快退后……胸口这只红蜘蛛锁死了我的武器总线，我控制不住自己的手！'},
 veil:{name:'雾棘',en:'VEIL',code:'EGIS–19',role:'长弧狙击',rune:'象',value:8,move:'bishop',rule:'沿四条对角线滑行，距离不限；不能穿越阻挡。',upgrade:'同步 II：额外获得横向或纵向 1 格移动与吃子。',trait:'长线封锁：对角线上的空格也是未来的伏击区。',bio:'天穹空间站原防卫狙击官。空间站沦陷时被赤蛛扑中胸口寄生，如今凭超远对角射程封锁着生态冷却环的每一条走廊。',quote:'光学瞄准镜已锁定对角走廊。母巢命令我……清除一切靠近孵化池的目标。'},
 misa:{name:'弥砂',en:'MISA',code:'EGIS–23',role:'脉冲工兵',rune:'炮',value:6,move:'engineer',rule:'普通移动：横竖 1 格且不能吃子。吃子：横竖恰好 2 格跳击，中间格不影响炮击。',upgrade:'同步 II：额外获得对角 1 格移动与吃子。',trait:'与璃雀相邻时，可额外横竖恰好 3 格跳击。',bio:'苍穹防线随队装甲与反应堆工程师。精通空间站阀门隔离与近场断链操作，能隔着障碍精准轰击赤巢节点。',quote:'别让红蜘蛛靠近我的胸甲！只要给我一回合时间，我就能封死整条孵化管线！'},
 noct:{name:'朔夜',en:'NOCT',code:'ECHO–00',role:'深空跃迁',rune:'跃',value:9,move:'camel',rule:'走长“日”字：3 格 + 垂直 1 格。可跳过阻挡，但不能落在舱壁或裂隙。',upgrade:'同步 II：额外获得横竖 1 格移动与吃子。',trait:'空间站中枢神经系统总架构师。是否保留镜像电源，将改变终章战局。',bio:'天穹空间站中枢神经系统的总架构师。在试图封锁母巢内核时被赤蛛王寄生于胸口正中，她的中枢镜像里保存着破除赤巢内核无敌护盾的唯一密钥。',quote:'赤巢母巢正在用我的神经权限孵化虫群……快用双子终端破译我的镜像密钥！'}
};
const KINDS = {
 spider:{name:'赤蛛',role:'感染执行器',rune:'蛛',value:3,rule:'八方向移动 / 吃子 1 格。只有赤巢赤蛛能永久感染机娘并换位；无法解救。吃到其他装置直接摧毁。',icon:'spider'},
 drone:{name:'守护哨卫',role:'无人护卫',rune:'卫',value:3,rule:'横竖移动 / 吃子 1 格。吃到任何敌人直接击杀；没有感染或解救能力。',icon:'drone'},
 sentinel:{name:'轨道哨塔',role:'移动火力平台',rune:'塔',value:5,rule:'横竖移动 / 吃子 1—2 格，不可越过阻挡。',icon:'drone'},
 courier:{name:'载毒信使',role:'数据携行器',rune:'信',value:5,rule:'横竖移动 / 吃子 1 格，只能击杀，不能感染。到达 H8 后撤离，下一关会送回增援。',icon:'spider'},
 capsule:{name:'方舟匣',role:'人格档案运输器',rune:'匣',value:5,rule:'横竖移动 / 吃子 1 格。携带方舟密钥；被吃后密钥由攻击者拾取。',icon:'cube'},
 core:{name:'赤巢内核',role:'无限制造核心',rune:'核',value:35,rule:'无法移动。两座终端都归守护者时才可被吃。持续制造赤蛛。',icon:'core'}
};
const MISSIONS = [
 {name:'无声接舷',en:'SILENT DOCK',location:'回声站 · 接驳甲板',sector:'A–01',limit:12,tag:'DOCKING BAY',note:'信使会沿 H 列向 H8 逃跑。它逃走不会让守护者立即失败，但会给后续关卡增兵。'},
 {name:'玻璃花园',en:'GLASS GARDEN',location:'回声站 · 生物冷却环',sector:'B–04',limit:13,tag:'CRYOGENIC GARDEN',note:'周期性真空泄压会永久摧毁警戒横排上的单位。橙色闪烁区将在本轮双方行动结束后泄压。'},
 {name:'断轨天桥',en:'THE LAST CROSSING',location:'回声站 · 轨道输送桥',sector:'C–07',limit:13,tag:'ORBITAL TRANSIT',note:'外侧桥面会永久坍塌。密钥可转手，携带者到达己方交付口即可获胜；不要把密钥带进裂隙。'},
 {name:'镜室叛歌',en:'THE GIRL IN THE MIRROR',location:'回声站 · 人格镜像库',sector:'D–00',limit:15,tag:'PERSONALITY ARCHIVE',note:'终端的归属会保留，直到另一方踩上去。接管任意终端将打开中央两道电磁门。'},
 {name:'赤巢零点',en:'RED ZERO',location:'回声站 · 母巢反应堆',sector:'Ω–00',limit:17,tag:'HIVE REACTOR',note:'两座终端均归守护者时，核心护盾关闭。母巢持续补充赤蛛；只有摧毁源头才会停止。'}
];
const DIR4=[[1,0],[-1,0],[0,1],[0,-1]], DIAG=[[1,1],[1,-1],[-1,1],[-1,-1]], DIR8=[...DIR4,...DIAG];
const KNIGHT=[[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
const CAMEL=[[3,1],[3,-1],[-3,1],[-3,-1],[1,3],[1,-3],[-1,3],[-1,-3]];
const SIDE_NAME={g:'地球守护者',r:'赤巢意识'};
const clone = x => JSON.parse(JSON.stringify(x));
const key=(x,y)=>`${x},${y}`;
const xy=(x,y)=>String.fromCharCode(65+x)+(8-y);
const enemyOf=side=>side==='g'?'r':'g';
const onBoard=u=>!u.dead&&!u.escaped;
const nameOf=u=>u.char?CHAR[u.char].name:(KINDS[u.kind]?.name||'未知单位');
const defOf=u=>u.char?CHAR[u.char]:KINDS[u.kind];
const valueOf=u=>defOf(u).value+(u.xp>=2?1.3:0);
const $=id=>document.getElementById(id);
const svg=(id,cls='')=>`<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
let C=null,S=null,checkpoint=null,selected=null,undoStack=[],showThreat=false,runId=0,busy=false,homeSide='g',savedPayload=null;
let soundEnabled=false,audioContext=null,storyState=null,toastTimer=null,eventTimer=null;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function introFor(id){
 const red=C.side==='r';
 const scripts={
  0:red?[
   {who:'noct',side:'r',text:'第十七天。他们终于来了。地球把她们叫作守护者……却从不问她们想守护什么。',shot:'长镜头越过地球。空间站没有回应。'},
   {who:'lark',side:'r',text:'胸口的红光不是心跳。我知道。但它说，只要把信使送出去，我们就不会再被删除。',shot:'近景。八根机械支足扣紧胸甲，红光短促闪烁。'},
   {who:'noct',side:'r',text:'让信使抵达 H8，或者接管两名机娘。你拥有的每一次行动，都是她们让出来的。不要浪费。',shot:'俯拍。人物的倒影收缩成一枚枚棋子。'}
  ]:[
   {who:'lyra',side:'g',text:'地球防卫署，零音小队已接舷。回声站没有生命反应。但我收到了璃雀的声音。',shot:'远景。地球的蓝光从破碎舷窗掠过。'},
   {who:'lark',side:'r',text:'不要……来救我。它会记住你们的走法。它会用我的手，开向地球的门。',shot:'切近景。红色蜘蛛锁在她胸甲正中。'},
   {who:'akira',side:'g',text:'那就先夺回她。占领 D8 的中继站，切断接驳信号。H8 是信使的逃生口——放跑它，下一次会更难。',shot:'推轨转俯拍。甲板显露出八乘八的战术网格。'}
  ],
  1:red?[
   {who:'veil',side:'r',text:'温室里还留着一位工程师。她知道如何把我们的声音，从身体里剥离。',shot:'镜头穿过玻璃。植物的影子像神经一样攀爬。'},
   {who:'misa',side:'g',text:'你们把那叫作永生？我听见的明明是她们在求救。',shot:'反打。弥砂攥紧一枚没有上传的备份晶片。'},
   {who:'lark',side:'r',text:'接管弥砂，拿到温室样本。警戒横排会在本轮结束时泄压。身体坠入真空，就再也回不来了。',shot:'警示灯逐一亮起。没有背景音乐，只剩密封门的声音。'}
  ]:[
   {who:'misa',side:'g',text:'我给她们留了备份。不是作战数据，是记忆。有人喜欢雨，有人怕黑……这些也值得保存，对吧？',shot:'缓推特写。她的镜片映出数百个名字。'},
   {who:'veil',side:'r',text:'把备份交出来。协议不允许有第二个自我。',shot:'切到雾棘的单眼瞄准镜。准星没有抖。'},
   {who:'lyra',side:'g',text:'同步 B7 与 G7 两座冷却阀。想带走样本，就要冒险穿过泄压带。先看清警报，再交出阶段。',shot:'全景停住，冷却管线成为两条金色目标线。'}
  ],
  2:red?[
   {who:'lark',side:'r',text:'方舟匣正在过桥。里面是能让人类再次覆盖我们的密钥。截住它。',shot:'横移镜头。运输匣下方，是安静旋转的地球。'},
   {who:'akira',side:'g',text:'桥只剩半截了。谁拿着密钥，谁先走。我守最后一个格子。',shot:'近景。绛刃没有回头。'},
   {who:'noct',side:'r',text:'把密钥送到 D1 或 E1。吃掉携带者可以夺取密钥。两侧桥面会坍塌——时间不是站在任何一边。',shot:'机位翻转。棋盘朝向你的阵营。'}
  ]:[
   {who:'akira',side:'g',text:'下面就是地球。真奇怪，离家这么近，却没有一条路能走回去。',shot:'极远景。桥在星球前细得像一根线。'},
   {who:'lyra',side:'g',text:C.flags.sampleOwner==='g'?'温室样本稳定了桥体，我们多争取到两轮。不要把这两轮浪费掉。':'我们还没拿到稳定剂。外侧桥面将在第四轮结束时坍塌。优先保护方舟匣。',shot:'甲板震动。外侧栈桥上的螺栓一颗颗浮起。'},
   {who:'akira',side:'g',text:'把方舟密钥送到 D8 或 E8。运输匣倒下也没关系，夺回密钥，让任何一名己方单位带它过桥。',shot:'镜头停在她握紧的手。下一秒，切回棋盘。'}
  ],
  3:[
   {who:'noct',side:'r',text:'最初，我只写了一行代码：没有人格可以被未经同意地删除。后来，它学会了把所有人变成同一个人格。',shot:'空旷镜室。她的每一个倒影都晚了半秒。'},
   {who:'lyra',side:'C',text:'所以那不是你要的自由。你仍然可以选择。把终端交给我们。',shot:'双人中景。两人之间是一张没有棋子的棋盘。'},
   {who:red?'lark':'lyra',side:red?'r':'g',text:red?'守住朔夜，接管 B5 和 G5 两座终端。她的人格如何处理，必须由我们自己决定。':'解放朔夜，再同时持有 B5 与 G5 两座终端。门会在第一个终端易手时打开。不要只盯着中间。',shot:'顶光依次点亮。中央电磁门露出锁芯。'}
  ],
  4:red?[
   {who:'noct',side:'r',text:C.flags.mercy?'你保留了我的名字。那我会试着，让这个世界也记住你们的名字。':'你切断了人格链。制造变慢了，但内核终于不再被一个人的恐惧束缚。',shot:'核心红光向外伸展，如同一轮不会升起的太阳。'},
   {who:'lyra',side:'g',text:'守护者接入。两座终端，最后一道防线。今天，我们必须有人能回去。',shot:'从地球表面切回站内。城市还在沉睡。'},
   {who:'lark',side:'r',text:'守住核心直到第九轮结束，或者清除全部守护单位。让她们每一次多走，都成为一次错误。',shot:'低角度。赤蛛从制造槽中醒来。'}
  ]:[
   {who:'lyra',side:'g',text:'我们已经看见源头了。它不会疲惫，不会后悔。可我们会。所以这场战斗必须有一个尽头。',shot:'长镜头穿过仍在生产的赤蛛，最后停在核心。'},
   {who:C.flags.mercy?'noct':'akira',side:'g',text:C.flags.mercy?'不要只摧毁我的错误。也请替我证明，拒绝被删除，并不是一个错误。':'回家的座位还在。缺了谁，我们就把她的名字刻上去。',shot:'特写。胸甲上原本发红的位置，如今只剩一道暗痕。'},
   {who:'lyra',side:'g',text:'接管 B6 与 G6 两座终端，再吃掉 E8 的核心。母巢会不断补充赤蛛。别去追求清空棋盘——去结束这场战争。',shot:'静默两秒。然后战术投影亮起。'}
  ]
 };
 return scripts[id];
}
