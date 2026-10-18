/* M5/M9 ensemble data. Loaded after data.js and BEFORE the engine and save parser.
   Twelve unique Japanese anime Mecha Girls with distinct chess-like movements. */
const BASE_CAST_IDS=['lyra','akira','lark','veil','misa','noct'];
const CAST_REVEAL={0:['iris'],1:['sera','psalm'],2:['vega','june'],3:['ruby'],4:[]};
const EXTRA_CAST={
 iris:{name:'珀弦',en:'IRIS',code:'EGIS–31',age:29,origin:'g',debut:0,role:'战术通信官',rune:'巡',value:8,move:'nightrider',rule:'沿同一“日”字方向连续跳跃，最多 2 跳；每个落点都必须有效。遇单位即停止，敌人可吃。不是一次行动走任意两次马步。',upgrade:'同步 II：同方向连续跳跃上限增至 3 跳。',trait:'巡骑会跨过墙，但不能经过被占据的中继落点。远点再好，也须保住第一跳。',bio:'苍穹防线的精锐战术通信机娘。她能实时捕捉空间站暗区中机械蜘蛛的红外脉冲，也是第一个锁定赤巢病毒母本信号的天才电子战专家。',quote:'雷达已锁定赤蛛群坐标——指挥官，请下达突击指令！'},
 sera:{name:'白栖',en:'SERA',code:'MED–04',age:31,origin:'g',debut:1,role:'战地医官',rune:'护',value:5,move:'medic',rule:'空走：横竖 1 格，不能吃子。攻击 / 吃子：斜向 1 格，不能斜走到空格。移动与攻击方向不同。',upgrade:'同步 II：空走可沿横竖直行 2 格，不能穿越阻挡；斜向吃子范围不变。',trait:'先用直线接近，再以斜线击杀。医官身份不提供净化、解救或复活能力；被控制后同样不可逆。',bio:'驻守生态冷却环的温柔战地医官机娘。危机爆发后她拼死守护隔离舱，深知一旦胸口被赤红机械蜘蛛锁死，任何医疗手段都无法逆转神经覆写。',quote:'千万别让红蜘蛛扑到胸口上！快退到我的掩体后面！'},
 vega:{name:'苍澜',en:'VEGA',code:'FLIGHT–08',age:33,origin:'g',debut:2,role:'空天王牌',rune:'王',value:6,move:'pilot',rule:'八方向移动 / 吃子 1 格。短距离、全向防守，没有“被将军”限制。',upgrade:'同步 II：额外获得横竖直行 2 格；路径必须畅通。',trait:'近身封锁八个方向。不能用长距离突进补救错误站位，适合守护运载器与撤离口。',bio:'苍穹防线的强袭突击艇驾驶员。在空间站被机械病毒攻陷时，她毅然拒绝独自返航，驾驶突击艇死死顶住轨道天桥北端，为队友守住最后的生路。',quote:'只要我还握着操纵杆，就绝不让一只机械蜘蛛掉回地球！'},
 ruby:{name:'绯律',en:'RUBY',code:'SEAL–17',age:32,origin:'r',debut:3,role:'重装隔离官',rune:'隔',value:7,move:'cannon',rule:'横竖空走最多 4 格，不可越子。吃子必须隔着恰好 1 枚单位作为炮架，目标是炮架后的第一枚单位；墙与裂隙不能当炮架。',upgrade:'同步 II：横竖射程由 4 格增至 7 格；仍须恰好 1 枚炮架才能吃子。',trait:'炮架可以属于任一阵营。夺控换位会改变炮架的位置，旧火线可能立即失效。',bio:'天穹空间站的最高防卫隔离官。在掩护中枢撤离时不幸被赤蛛突袭，胸口正中央被植入了发红光的机械控制蜘蛛，化作守卫母巢大门的冷酷重炮手。',quote:'隔舱重炮已装填。胸口的红光命令我——将一切入侵者轰成碎片。'},
 june:{name:'霁川',en:'JUNE',code:'TRACE–06',age:30,origin:'r',debut:2,role:'深空猎手',rune:'斑',value:7,move:'zebra',rule:'走“长斜日”：横 3 格、竖 2 格，或横 2 格、竖 3 格；可跳过阻挡，落点不能是舱壁或裂隙。',upgrade:'同步 II：额外获得斜向 1 格移动与吃子，补足近身空隙。',trait:'八个远距落点不等于八条退路。计划跃迁时，要同时看下一次可达的区域。',bio:'原本负责外环轨道侦察的高机动机娘。被赤巢病毒寄生控制后，她凭借胸口核心的超频驱动在断轨天桥上高速跃迁，率领赤蛛群争夺对地火控密钥。',quote:'看见我胸口闪耀的红宝石了吗？很快，你们也会戴上它。'},
 psalm:{name:'祈雾',en:'PSALM',code:'CAL–09',age:28,origin:'r',debut:1,role:'共鸣调律者',rune:'折',value:8,move:'gryphon',rule:'先斜行 1 格，可停下；若该格为空，可转为同方向横线或竖线，继续最多 2 格。整条折线路径不能穿越单位或墙。',upgrade:'同步 II：转弯后的直行段上限增至 3 格。',trait:'不是跳跃。封住第一个斜格，就能切断从那里延伸的两条声道。',bio:'空间站的神经声学调律机娘。胸口被植入赤红机械蜘蛛后，她成为了传达母巢意志的歌姬，用诡异折线步伐在战场上编织死亡捕食网。',quote:'别挣扎了，听一听胸口红蜘蛛的心跳，那是母巢最温柔的摇篮曲。'}
};
Object.assign(CHAR,EXTRA_CAST);
Object.assign(CHAR.lyra,{age:30,origin:'g',debut:0,bio:'地球守护组织“苍穹防线”的王牌现场指挥官。白银装甲下有着绝对冷静的战术头脑，为了摧毁空间站的机械病毒内核、保卫人类家园而率队深入死地。',quote:'苍穹防线绝不后退半步！哪怕只剩我一人，也要击碎赤巢内核！'});
Object.assign(CHAR.akira,{age:27,origin:'g',debut:0,bio:'苍穹防线的绯红高马尾突击机娘，擅长以狂暴的高频轨刃正面撕裂机械蜘蛛防线。重情重义，痛恨将同伴变成傀儡的机械病毒。',quote:'挡路的赤蛛统统斩碎！跟紧我，我来替大家杀出一条血路！'});
Object.assign(CHAR.lark,{age:25,origin:'r',debut:0,bio:'先遣调查队的活泼侦察机娘。在空间站失联当夜被赤红机械蜘蛛扑中胸口正中央，即便双眼亮起红光、身体被病毒强行操控，仍试图用残存意识向同伴发出警告。',quote:'快跑……我胸口的红色机械蜘蛛正在控制我开火……别被它扑上来！'});
Object.assign(CHAR.veil,{age:29,origin:'r',debut:1,bio:'天穹空间站原首席安全狙击手。在冷却环死战中被赤蛛从暗处寄生，胸甲中央镶嵌着刺目的红光控制装置，在对角线上用致命狙击猎杀昔日战友。',quote:'全息十字准星已锁定。在赤巢的意志下，没有任何猎物能逃出对角线。'});
Object.assign(CHAR.misa,{age:28,origin:'g',debut:1,role:'脉冲工兵',bio:'空间站的天才机甲工程师。在机械蜘蛛潮爆发时利用改装脉冲炮死守生态冷却环，掌握着提取抗蚀稳定剂与切断母巢近场护盾的关键技术。',quote:'护盾回路交给我来破译！你们只管掩护我，千万别让红蜘蛛靠近！'});
Object.assign(CHAR.noct,{age:32,origin:'r',debut:3,bio:'天穹空间站中枢神经系统的总架构师。在试图封锁母巢内核时被赤蛛王寄生于胸口正中，她的中枢镜像里保存着破除赤巢内核无敌护盾的唯一密钥。',quote:'我曾想用代码锁住深渊，如今深渊却在我胸口绽放出猩红的光。'});
KINDS.spider.name='赤红机械蜘蛛';
KINDS.spider.role='N–6 胸口寄生控制装置';
KINDS.spider.rule='八方向移动 / 吃子 1 格。扑中守护者机娘时直接植入其胸口正中，永久夺控并换位！';

// Migration only fills NEW IDs. Never reset an existing character's side, XP,
// death or retirement. New crew join on the NEXT normal chapter deployment.
function migrateCast(c){
 if(!c?.roster||BASE_CAST_IDS.some(id=>!c.roster[id]))return;
 for(const [id,d]of Object.entries(EXTRA_CAST))if(!Object.prototype.hasOwnProperty.call(c.roster,id))c.roster[id]={side:d.origin,status:'active',xp:0,introduced:false};
}
