/* M5 ensemble data. Loaded after data.js and BEFORE the engine and save parser.
   New characters are real pieces, not gallery-only NPCs. All are adults.
   Keep this data separate from the authored mystery reveals in screenplay.js. */
const BASE_CAST_IDS=['lyra','akira','lark','veil','misa','noct'];
const CAST_REVEAL={0:['iris'],1:['sera','psalm'],2:['vega','june'],3:['ruby'],4:[]};
const EXTRA_CAST={
 iris:{name:'珀弦',en:'IRIS',code:'EGIS–31',age:29,origin:'g',debut:0,role:'链路审计',rune:'巡',value:8,move:'nightrider',rule:'沿同一“日”字方向连续跳跃，最多 2 跳；每个落点都必须有效。遇单位即停止，敌人可吃。不是一次行动走任意两次马步。',upgrade:'同步 II：同方向连续跳跃上限增至 3 跳。',trait:'巡骑会跨过墙，但不能经过被占据的中继落点。远点再好，也须保住第一跳。',bio:'调查队的通信审计员。她拒绝接受转录摘要，随身带着一只从不接入站内授时的机械表。她最先指出：求救信号的时间不对。',quote:'把原始时间戳给我。不要截图。'},
 sera:{name:'白栖',en:'SERA',code:'MED–04',age:31,origin:'g',debut:1,role:'神经急救',rune:'护',value:5,move:'medic',rule:'空走：横竖 1 格，不能吃子。攻击 / 吃子：斜向 1 格，不能斜走到空格。移动与攻击方向不同。',upgrade:'同步 II：空走可沿横竖直行 2 格，不能穿越阻挡；斜向吃子范围不变。',trait:'先用直线接近，再以斜线击杀。医官身份不提供净化、解救或复活能力；被控制后同样不可逆。',bio:'回声站值班医官。停电后，她把药量改记在袖口上，因为所有电子病历都开始显示“无需撤药”。她认识每一种红灯，却没有见过这一种医嘱。',quote:'先报呼吸、瞳孔和固定爪状态。不要替病人回答。'},
 vega:{name:'苍澜',en:'VEGA',code:'FLIGHT–08',age:33,origin:'g',debut:2,role:'近域回收',rune:'王',value:6,move:'pilot',rule:'八方向移动 / 吃子 1 格。短距离、全向防守，没有“被将军”限制。',upgrade:'同步 II：额外获得横竖直行 2 格；路径必须畅通。',trait:'近身封锁八个方向。不能用长距离突进补救错误站位，适合守护运载器与撤离口。',bio:'回收艇驾驶员。她的飞行记录有一条被拒绝的返航申请，时间恰好早于封锁。她一直保存着那份拒绝回执，而不是事故报告里的“自愿留站”。',quote:'我负责最后一程。先把出口空出来。'},
 ruby:{name:'绯律',en:'RUBY',code:'SEAL–17',age:32,origin:'r',debut:3,role:'隔舱封锁',rune:'隔',value:7,move:'cannon',rule:'横竖空走最多 4 格，不可越子。吃子必须隔着恰好 1 枚单位作为炮架，目标是炮架后的第一枚单位；墙与裂隙不能当炮架。',upgrade:'同步 II：横竖射程由 4 格增至 7 格；仍须恰好 1 枚炮架才能吃子。',trait:'炮架可以属于任一阵营。夺控换位会改变炮架的位置，旧火线可能立即失效。',bio:'空间站隔离官。灾难当晚，她执行了封锁令，却发现命令签发人也被封在门内。她不相信口头解释，只承认完整的授权链。',quote:'我需要原件。盖章的复印件也不行。'},
 june:{name:'霁川',en:'JUNE',code:'TRACE–06',age:30,origin:'r',debut:2,role:'远域取证',rune:'斑',value:7,move:'zebra',rule:'走“长斜日”：横 3 格、竖 2 格，或横 2 格、竖 3 格；可跳过阻挡，落点不能是舱壁或裂隙。',upgrade:'同步 II：额外获得斜向 1 格移动与吃子，补足近身空隙。',trait:'八个远距落点不等于八条退路。计划跃迁时，要同时看下一次可达的区域。',bio:'负责事故现场重建的取证员。她从桥缝里找回的不是遗物，而是一张被擦去收货方的货签。被接管后，她仍把每一份记录保留两个副本。',quote:'划掉的字也算证据。别擦。'},
 psalm:{name:'祈雾',en:'PSALM',code:'CAL–09',age:28,origin:'r',debut:1,role:'声道调律',rune:'折',value:8,move:'gryphon',rule:'先斜行 1 格，可停下；若该格为空，可转为同方向横线或竖线，继续最多 2 格。整条折线路径不能穿越单位或墙。',upgrade:'同步 II：转弯后的直行段上限增至 3 格。',trait:'不是跳跃。封住第一个斜格，就能切断从那里延伸的两条声道。',bio:'赤巢最早接管的校准员。她负责为神经支架调节脉冲，也听见过停止指令被系统当作杂音滤掉的声音。她知道那串敲击不是故障。',quote:'先把自动降噪关掉。你漏掉了一句。'}
};
Object.assign(CHAR,EXTRA_CAST);
Object.assign(CHAR.lyra,{age:30,origin:'g',debut:0,bio:'地球守护组织的现场指挥官，曾签署一份限时神经支架试验。此次任务书要求她回收设备；她在登站前，把第一项手写改成了“确认失联人员状态”。两份文件都留有她的签名。',quote:'先报位置。没有证据的事，先别下结论。'});
Object.assign(CHAR.akira,{age:27,origin:'g',debut:0,bio:'负责破门与撤收掩护的突击手。上一回有人让她等命令，救生门在等候中关上了。现在她会先问清楚：这道门由谁负责打开。',quote:'最后一排留给撤离。别把退路走满。'});
Object.assign(CHAR.lark,{age:25,origin:'r',debut:0,bio:'失联先遣队侦察员。她发出的求救早于事故记录七分钟。控制器接管了动作，却没有完全封住通信；一段不合节拍的敲击混在她的语音里。',quote:'看灯灭的那一瞬。别一直盯着红光。'});
Object.assign(CHAR.veil,{age:29,origin:'r',debut:1,bio:'回声站原安全官。她保留着病区封锁前的瞄准镜录像，却拒绝交出剪辑后的版本。录像里，她没有向一个越过隔离线的人开枪。',quote:'录像没有丢。有人只想要最后三秒。'});
Object.assign(CHAR.misa,{age:28,origin:'g',debut:1,bio:'神经接口维护工程师。她发现新批次夹具删去了撤药触点，起初以为是物料替代。她留下了旧件，也留下了自己批准替代件的维修签收单。',quote:'先断授权，再拆固定爪。次序不能反。'});
Object.assign(CHAR.noct,{age:32,origin:'r',debut:3,bio:'神经支架协议的架构师。她写过阻止人格被远程清除的保护条款；当停止指令被纳入同一条款时，治疗变成了永久接管。她没有资格决定这只是一个程序错误。',quote:'原件复制两份。然后再问我做过什么。'});
KINDS.spider.name='赤蛛夹具';
KINDS.spider.role='N–6 神经接管器';
KINDS.spider.rule='八方向移动 / 吃子 1 格。短固定爪闭锁后接入神经接口，对机娘执行夺控换位。';

// Migration only fills NEW IDs. Never reset an existing character's side, XP,
// death or retirement. New crew join on the NEXT normal chapter deployment.
function migrateCast(c){
 if(!c?.roster||BASE_CAST_IDS.some(id=>!c.roster[id]))return;
 for(const [id,d]of Object.entries(EXTRA_CAST))if(!Object.prototype.hasOwnProperty.call(c.roster,id))c.roster[id]={side:d.origin,status:'active',xp:0,introduced:false};
}
