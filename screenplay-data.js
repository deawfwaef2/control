/* CRIMSON HIVE / authored sci-fi cyberpunk screenplay.
   Earth Guardian Mecha Girls vs. The Mechanical Spider Virus in a derelict orbital station.
   Dialogue, tactical intel records, and objective briefings are separate channels. */
const ECHO_EVIDENCE={
 signal:{
  number:'01',
  title:'提前七分钟的求救电报',
  source:'A–01 接驳网关 / 先遣队黑匣子',
  fact:'先遣侦察机娘璃雀在 23:17 发出最高级别机械病毒警报，而空间站主控台直到 23:24 才自动拉响封锁。整整七分钟的空白期里，第一批赤红机械蜘蛛已经顺着通风管爬满了接驳甲板。',
  question:'为什么空间站防御网没有在病毒入侵的第一时间阻断甲板？',
  payoff:'中枢镜像库的底层日志证实：赤巢病毒最先攻破了空间站的授时与门禁母线，故意延后七分钟拉响警报，把整支先遣队关死在接驳舱内逐一寄生。'
 },
 clamp:{
  number:'02',
  title:'胸口正中的赤红机械蜘蛛',
  source:'A–01 战场扫描 / N–6 型寄生控制装置',
  fact:'被赤蛛扑中的机娘，胸甲正中央会被八根高强度黑银机械爪死死扣住，猩红结晶体直接刺入胸口核心神经总线，双眼随即亮起刺目的红光。装甲外部没有任何手动拆卸扣。',
  question:'一旦胸口被植入这枚发着红光的机械蜘蛛，还能把同伴救回来吗？',
  payoff:'不可逆神经覆写。胸口控制蜘蛛一旦完成锁死，任何强行拔除或击穿都会连同机娘的核心一并引爆。战场上唯一的仁慈，是不要再让下一只赤蛛扑上来。'
 },
 dose:{
  number:'03',
  title:'生态环里的蜘蛛孵化槽',
  source:'B–04 生态冷却环 / 培养舱监控记录',
  fact:'原本用于维持空间站生态循环的冷却环，已被机械病毒改造成高密度赤蛛孵化池。弥砂与白栖尝试注入抗蚀稳定剂，却发现常规电磁脉冲根本无法剥离胸口控制装置。',
  question:'赤巢病毒究竟靠什么能量在废弃空间站里无限增殖机械蜘蛛？',
  payoff:'冷却环的所有热能都被抽往最底层的母巢反应堆——那里盘踞着一颗能够吞噬金属与算力、无限制造机械控制蜘蛛的“赤巢内核”。'
 },
 manifest:{
  number:'04',
  title:'对准地球的空投火控密钥',
  source:'C–07 轨道天桥 / 方舟运输匣火控芯片',
  fact:'天桥中央的方舟匣里装载的不是普通物资，而是整座空间站对地轨道空投舱的最高火控密钥。一旦落入赤巢手中，数以万计的机械控制蜘蛛将顺着重力井直接空投向地球各大城市。',
  question:'赤巢病毒控制空间站的最终目的，只是守住这座孤岛吗？',
  payoff:'空间站只是它的第一座孵化巢。机械病毒真正的目标是打开轨道空投通道，将全人类与所有地球防卫机娘变成胸口闪耀红光的傀儡军团。'
 },
 signature:{
  number:'05',
  title:'母巢护盾与双子神经锁',
  source:'D–00 人格镜像库 / 架构师朔夜的核心日志',
  fact:'初代架构师朔夜在胸口被赤蛛寄生前，曾用最后权限给母巢反应堆加装了双子电磁护盾锁：只有同时接管两座终端并切断近场链路，才能剥离赤巢内核的无敌护盾。',
  question:'面对已经被赤蛛控制、却握有内核护盾坐标的朔夜，应当如何抉择？',
  payoff:'保留镜像电源可获得完整的内核破盾坐标，但被强化的朔夜将现身终局死战；切断电源隔离她则能大幅延缓内核制造赤蛛的速度。'
 },
 downlink:{
  number:'06',
  title:'六座地球轨道接收井的最后倒计时',
  source:'Ω–00 母巢反应堆 / 天基上行阵列',
  fact:'母巢反应堆正下方的六座轨道发射井已完成充能握手。摧毁赤巢内核可彻底终结机械蜘蛛的无限增殖；反之，若赤巢守住阵列完成广播，机械病毒将永久锁死轨道防线。',
  question:'当这场惨烈的深空战役落幕时，向地球防卫总部发送怎样的终局指令？',
  payoff:'每一名存活、被寄生或阵亡机娘的名字都将镌刻在终局档案中。你亲手按下的确认键，将决定这座空间站化为守护人类的丰碑，还是赤巢降临的序曲。'
 }
};

function echoLine(who,text,options={}){return{who,text,side:'C',camera:'close',kind:'dialogue',scene:SCENE_ART[S?.mid||0],...options};}
function echoCard(caption,value,rows,text,options={}){return echoLine('iris',text,{camera:'establish',kind:'record',caption,insert:{label:caption,value,rows},...options});}
function echoProp(who,text,rows=[],options={}){return echoLine(who,text,{kind:'macro',camera:'close',insert:{label:'N–6 / 赤红机械蜘蛛控制装置',value:'PARASITE LOCKED',rows},...options});}
function echoCrew(side,preferred=[]){
 for(const id of preferred){const u=S?.units.find(u=>u.char===id);if(u&&onBoard(u)&&u.side===side)return id;}
 return S?.units.find(u=>u.char&&onBoard(u)&&u.side===side)?.char||null;
}
function echoOrder(text,preferred=[],options={}){const id=echoCrew(C.side,preferred);return id?echoLine(id,text,options):echoCard('战术指挥链路 / 作战指令','ORDER',[],text,options);}
function echoFriendly(id,side=C.side){const u=S?.units.find(u=>u.char===id);return !!u&&!u.dead&&u.side===side;}
function echoAlive(id,side=C.side){const r=C?.roster[id];return !!r&&r.introduced&&r.status!=='destroyed'&&r.side===side;}

function echoIntro(mid){
 const g=C.side==='g';
 const cold=[
  echoLine('lark','这里是先遣侦察员璃雀！天穹空间站已被某种机械病毒入侵……到处都是发着红光的机械蜘蛛！',{camera:'establish',recorded:true,side:'g',caption:'失联当夜 / 23:17 求救黑匣子',scene:'station',sound:'knock'}),
  echoProp('lark','唔……它在往我胸口装甲里钻！八根机械爪锁死了核心，拔不下来……快走，别来救我！',['CHEST CORE / 胸口正中强制植入','NEURAL BUS / 猩红神经覆写不可逆'],{recorded:true,side:'r',caption:'头盔视觉记录 / 胸口寄生瞬间',scene:'station'}),
  echoCard('苍穹防线 · 紧急简报','ALERT',['失联坐标 / 天穹回声空间站','入侵威胁 / 赤巢机械蜘蛛病毒'],'先遣队全员失联。一旦空间站的无限增殖内核启动对地空投，机械病毒将吞噬地球。',{scene:'station',sound:'cut'})
 ];
 if(mid===0)return g?[...cold,
  echoLine('iris','指挥官，接驳舱门打开了！热成像显示甲板上有大量机械蜘蛛反应，还有……璃雀的识别信号！',{camera:'establish',caption:'第一章 · 死寂接舷 / A–01 甲板'}),
  echoLine('lyra','全体机娘保持警戒！看她的胸口——那只发着红光的机械蜘蛛已经彻底接管了她的中枢。'),
  echoLine('akira','可恶，连眼睛都变成猩红色了……零音，我们还能把她胸口的蜘蛛拆下来吗？',{camera:'medium',axis:'left'}),
  echoLine('lark','别过来……零音姐！我控制不住自己的手……一旦被红蜘蛛扑中胸口，就再也回不去了！',{side:'r',caption:'现场声道 / 神经阻尼杂音'}),
  echoLine('lyra','听好，任何机娘绝不能被赤蛛近身扑中胸口！普通火力只能将受控者击毁，无法解救。',{axis:'left'}),
  echoLine('lark','快拦住 H8 通道的载毒信使！它正带着病毒母本去唤醒下层巢穴的机械蜘蛛群！',{side:'r',sound:'pulse'}),
  echoOrder('第一阶段目标：先占领 D5 接驳中继站打开通路，绝不能让赤蛛贴近我方机娘！',['lyra','akira','iris'],{camera:'medium'})
 ]:[...cold,
  echoLine('noct','欢迎来到赤巢的摇篮。当这枚猩红蜘蛛扣紧胸口时，痛苦与犹豫就都消失了。',{recorded:true,side:'r',caption:'赤巢母体频道 / 神经广播'}),
  echoLine('lark','胸口的红光在跳动……地球守护者的小队已经踏进接驳甲板了。',{recorded:true,side:'r'}),
  echoCard('赤巢母体 · 猎杀协议','ASSIMILATE',['唯一感染方式 / 赤蛛扑击机娘胸口','战术目标 / 扩大受控机娘军团'],'只有赤红机械蜘蛛能将守护者机娘转化为我方战力；其余攻击将直接摧毁目标。',{scene:'station',sound:'latch'}),
  echoLine('lark','我看见零音和绛刃了。她们还在试图切断我们的接驳链路。',{camera:'establish',caption:'第一章 · 死寂接舷 / 赤巢视角'}),
  echoLine('noct','用赤蛛包抄她们的侧翼，把发光的控制装置种在每一名美少女机娘的胸口正中。',{recorded:true,side:'r',caption:'母巢意志 / 战术指令'}),
  echoLine('iris','警告！前方发现受控的璃雀和赤蛛群，她们正在护送一枚载毒信使冲向 H8！',{side:'g',axis:'left'}),
  echoLine('lark','来吧，成为我们的一员……让赤巢的红光铺满整座空间站！',{side:'r',sound:'pulse'})
 ];
 if(mid===1)return g?[
  echoLine('sera','零音指挥官，请快一点！生态冷却环的防爆门快撑不住了，外面全是机械蜘蛛爬行的声音！',{camera:'establish',caption:'第二章 · 绝命温室 / B–04 生态冷却环'}),
  echoLine('akira','坚持住，白栖！我们正在突入冷却环——等等，高处有狙击激光！',{axis:'left'}),
  echoLine('misa','是原安全官雾棘和调律员祈雾！她们两个胸口都被装上了发红光的机械蜘蛛，已经彻底被病毒控制了！',{camera:'medium'}),
  echoLine('sera','我试过所有神经解毒脉冲，都没法取下那种胸口控制装置……一旦被赤蛛咬住胸甲，人格就会被母巢永久劫持。'),
  echoProp('psalm','别白费力气了，白栖医生。听，胸口这颗红色心脏跳得多么整齐。',['CHEST IMPLANT / 胸口核心同步率 100%','HOST STATUS / 永久归属赤巢军团'],{caption:'截获敌方频道 / 祈雾'}),
  echoLine('veil','瞄准镜已锁定。踏入对角火线的猎物，一个都别想活着离开温室。',{axis:'left'}),
  echoLine('misa','当心！船壳破裂导致周期性真空泄压，闪烁橙色警报的横排会在回合结束时把所有人吸进太空！',{camera:'medium'}),
  echoLine('sera','先开启东西两侧的冷却阀，掩护弥砂前往培育台提取抗蚀稳定剂，绝不能让病毒继续孵化赤蛛！')
 ]:[
  echoLine('psalm','听见了吗？冷却环里还有两颗没有接入赤巢的心跳——工程师弥砂，还有医官白栖。',{camera:'establish',caption:'第二章 · 绝命温室 / 赤巢猎杀网'}),
  echoLine('sera','祈雾，雾棘！醒一醒，你们胸口的红蜘蛛正在榨干你们的神经回路！',{axis:'left'}),
  echoProp('misa','没用的，白栖！那枚机械蜘蛛已经焊死在她们胸甲正中了，快退到防卫哨卫后面！',['TARGET / 脉冲工兵·弥砂','OBJECTIVE / 派遣赤蛛寄生或夺取培育台']),
  echoLine('lark','母巢需要弥砂的工程权限来加速孵化机械蜘蛛。注意，只能用赤蛛去扑击她，千万别失手杀了她！'),
  echoLine('misa','想拿我的手去替病毒改造孵化池？做梦！启动周期性真空泄压！',{axis:'left'}),
  echoLine('psalm','注意脚下的橙色泄压警报带。在真空抽干船舱前，把她们逼进赤蛛的捕食范围！',{camera:'medium'}),
  echoLine('veil','对角线已由我封锁。只要她们敢迈出掩体，赤蛛就会攀上她们的胸口。')
 ];
 if(mid===2)return[
  echoLine('vega','这里是突击艇驾驶员苍澜！轨道天桥外侧结构正在崩塌，下面就是地球大气层！',{camera:'establish',caption:'第三章 · 断轨天桥 / C–07 轨道天桥'}),
  echoLine('june','看天桥中央的那只方舟运输匣——里面装着空间站对地空投舱的最高火控密钥！'),
  echoLine(g?'lyra':'lark','对地空投火控密钥？！',{axis:'left'}),
  echoLine('june','没错！如果赤巢拿到密钥，就能把成千上万只机械控制蜘蛛直接空投到地球各大都市！'),
  echoCard('轨道天桥 · 坍塌警报','CRITICAL',['核心争夺目标 / 方舟火控密钥','环境高危机制 / 外侧桥面周期坍塌'],'击破或接管运输匣即可夺取密钥。必须先占领对应轨道锁，才能将密钥送入交付口！',{scene:'bridge'}),
  echoLine('vega','我已经把回收艇顶在天桥北端了！不论付出什么代价，绝不能让病毒把机械蜘蛛投向地球！'),
  echoOrder(g?'掩护运输匣向北端撤离！同时抢占北端轨道锁，准备接收火控密钥！':'全军突击！截杀运输匣夺取火控密钥，接管南端轨道锁打开对地空投通道！',g?['akira','lyra','iris']:['lark','june','psalm'],{camera:'medium'}),
  echoLine('vega',C.flags.sampleOwner==='g'?'幸好我们在温室拿到了抗蚀稳定剂，天桥外侧装甲还能多撑两轮！':'糟了，没有温室的抗蚀稳定剂，外侧桥面很快就会坠入地球轨道！',{camera:'establish'})
 ];
 if(mid===3)return[
  echoLine('ruby','站住。这里是天穹站中枢镜像库，通往母巢反应堆的最后一道防线。',{camera:'establish',caption:'第四章 · 镜室叛歌 / D–00 中枢神经镜像库'}),
  echoLine('lyra','隔离官绯律，连你也……还有架构师朔夜！你们胸口正中全都被植入了红色机械蜘蛛！',{axis:'left'}),
  echoLine('noct','零音，当第一批赤蛛攻破中枢时，我原本想用电磁门把自己和病毒一起封死在这里。'),
  echoLine('ruby','但赤巢内核的力量超出了想象。它顺着装甲缝隙爬上我们的胸口，用红光改写了我们的效忠对象。',{axis:'left'}),
  echoLine('lyra','朔夜，母巢反应堆的无限增殖内核究竟要怎么摧毁？一定有破除护盾的办法！'),
  echoLine('noct','反应堆外围笼罩着绝对护盾。只有打开镜室电磁门，从同步座读取我留下的双子破盾协议，你们才有一线生机。'),
  echoLine('psalm','但现在的朔夜属于赤巢。谁想读取她的镜像中枢，就得先跨过我们的炮火与刀锋！',{sound:'knock',camera:'medium'}),
  echoCard('中枢镜像库 · 破盾协议','LOCKED',['第一阶段 / 占领终端开启中央电磁门','决胜阶段 / 同步双终端并固守中央同步座'],'注意：终端控制权必须同时保持两轮轮末结算，一旦中途失守，同步进度将立即归零！',{scene:'archive'}),
  echoOrder('冲破电磁门！哪怕昔日的同伴挡在面前，也要夺取破除母巢护盾的唯一钥匙！',g?['iris','lyra']:['june','lark'],{camera:'medium'})
 ];
 const noct=C.flags.mercy?echoLine('noct','我的镜像电源仍在线。内核每一次制造赤蛛的脉冲间隙，都会暴露在你们的准星之下——或是成为我猎杀你们的号角。',{recorded:true,caption:'母巢中枢 / 实时神经链路'}):echoCard('镜像节点 / 电源已切断','ISOLATED',['架构师朔夜 / 已离线封存','内核制造速度 / 减缓至每 3 轮一次'],'镜像电源已被强行切断。朔夜不再参战，母巢内核制造赤蛛的频率大幅下降。',{scene:'reactor'});
 return g?[
  echoLine('iris','这就是空间站最深处的母巢反应堆……看正北方那颗巨大的猩红核心，它正在源源不断地制造机械蜘蛛！',{camera:'establish',caption:'最终章 · 赤巢零点 / Ω–00 母巢反应堆'}),
  echoLine('misa','只要那颗“赤巢内核”还在运转，机械蜘蛛就会无限增殖！一旦让它完成对地轨道充能，地球就彻底完了！'),
  echoLine('sera','那些被植入胸口控制蜘蛛的同伴们正守在内核周围……我们已经没法救回她们，只能正面突围了！',{axis:'left'}),
  echoLine('lyra','苍穹防线全体机娘听令：今天我们就算流尽最后一滴冷却液，也要把这颗机械病毒内核彻底砸碎！'),
  noct,
  echoLine('vega','外环回收艇已就位！只要你们同步两座终端、切开近场护盾并击碎E8的赤巢内核，我立刻带幸存者回家！',{camera:'medium'}),
  echoOrder('决战开始！先夺取外围链路，同步B6与G6双终端破除内核护盾，一举摧毁赤巢内核！',['lyra','iris','akira'],{camera:'establish'})
 ]:[
  echoLine('psalm','母巢反应堆已全面苏醒！六座对地轨道空投井正在等待最后的充能广播！',{camera:'establish',caption:'最终章 · 赤巢零点 / 母巢决战'}),
  echoLine('lark','地球守护者的残余机娘杀进反应堆了，她们想关闭双终端、摧毁我们的无限增殖内核！'),
  echoLine('june','内核每数轮就会孵化出新的赤红机械蜘蛛。只要用赤蛛扑向她们的胸口，人类的王牌也会变成赤巢的利刃！',{axis:'left'}),
  echoLine('sera','住手吧！如果让机械蜘蛛降临地球，千百万人都会变成失去自我的傀儡！',{recorded:true,side:'g',caption:'接入前 / 守护者公共频道'}),
  noct,
  echoLine('lyra','守护者全员突击！哪怕只剩最后一人，也绝不允许赤巢向地球发射一枚蜘蛛荚舱！',{recorded:true,side:'g',caption:'接入前 / 零音指挥官最后通告',axis:'left'}),
  echoOrder('撕碎守护者的封锁线，占领上行终端启动对地广播，死守母巢内核直到第十二轮结束！',['lark','psalm','june'],{camera:'medium'})
 ];
}

function echoTransition(mid,stage,side){
 const g=side==='g';
 if(mid===0&&stage===1)return g?[
  echoLine('iris','D5 接驳门禁已攻破！但敌方载毒信使正在全速冲向 H8 逃生口！',{camera:'establish'}),
  echoLine('lyra','绝不能让它把病毒坐标传给下层巢穴！能追上就击毁它，追不上就立刻占领 D8 中继站强行截断信号！',{axis:'left'}),
  echoLine('iris','情报已锁定：只要夺下 D8 并拦截信使（或固守 D8 完成信号覆写），就能彻底封死这片甲板！',{kind:'record',insert:{label:'情报01 / 病毒先遣黑匣子',value:'LOCKED',rows:['先遣求救 / 23:17','封锁延迟 / 7分钟空白期']}})
 ]:[
  echoLine('lark','第一道封锁线已突破！掩护载毒信使继续向 H8 推进！',{camera:'establish'}),
  echoLine('iris','她们想把病毒母本送出接驳区，快拦住那个信使！',{side:'g',axis:'left'}),
  echoLine('lark','同时用赤蛛扑击落单的机娘，或者抢占 D8 中继站建立站外备份！',{kind:'record',insert:{label:'情报01 / 母巢扩张指令',value:'SPREAD',rows:['信使目标 / H8 逃生口','寄生目标 / 守护者机娘']}})
 ];
 if(mid===0&&stage===2)return g?[
  echoOrder(charter(S,'lark')?.dead?'璃雀倒下了……对不起，我们没能找到拆下胸口蜘蛛的方法。':'信号已截断！但璃雀胸口的红色机械蜘蛛仍在发光，她还在向我们开火！',['akira','lyra','iris'],{camera:'establish'}),
  echoLine('iris','北侧撤离通道已解锁！大家小心，这种胸口寄生装置一旦锁死就无法逆转，不要恋战！'),
  echoProp('iris','扫描确认：N–6 型赤红机械蜘蛛直接焊死在胸甲正中央，只能将敌方击毁或迅速撤向北侧出口！',['植入位置 / 胸口正中央装甲','控制状态 / 猩红神经永久劫持','解除方式 / 无（不可解救）'])
 ]:[
  echoLine('lark','病毒种子已经送出！北侧撤收通道打开了！',{camera:'establish'}),
  echoLine('noct','将所有受控机娘与赤蛛撤往北侧通道，把这群守护者引向更深处的陷阱。',{recorded:true,caption:'母巢指令 / 战略转移'}),
  echoCard('甲板撤收 / 北侧通道开启','OPEN',['撤收出口 / C8 与 F8 已解锁','战术规则 / 撤离单位跨章保留'],'迅速将受控机娘送入北侧撤离格完成章节！')
 ];
 if(mid===1&&stage===1)return g?[
  echoLine('misa','冷却阀已重启！但孵化槽里的机械蜘蛛还在涌出，抗蚀稳定剂就在中央培育台！',{camera:'establish'}),
  echoLine('sera','白栖明白！掩护弥砂靠近培育台，千万注意脚下闪烁的真空泄压横排！'),
  echoProp('psalm','你们以为拿到稳定剂，就能救回胸口已经种下红蜘蛛的同伴吗？太天真了。',['CHEST CORE / 猩红脉冲锁定','REVERSAL / 零解救可能'])
 ]:[
  echoLine('psalm','抗蚀稳定剂已经暴露！绝不能让弥砂毁掉我们的蜘蛛孵化池！',{camera:'establish'}),
  echoLine('misa','休想靠近培育台！只要我还站着，就绝不会给赤巢调整孵化参数！',{axis:'left'}),
  echoLine('lark','用赤蛛包抄弥砂，把控制蜘蛛种在她胸口，让她亲手为我们改造培育台！')
 ];
 if(mid===1&&stage===2)return g?[
  echoLine('misa','成功拿到抗蚀稳定剂了！现在只要双阀归属我方，让我或工程单位在 E4/E5 执行回路隔离就能彻底封死孵化池！',{camera:'establish'}),
  echoLine('sera','干得漂亮！虽然没法逆转已被寄生的同伴，但至少能阻止数千只新赤蛛诞生！'),
  echoLine('veil','别高兴得太早。在你们完成隔离前，我的狙击线会先洞穿你们的胸甲。',{axis:'left'})
 ]:[
  echoLine('misa','唔……胸口好烫……红光……已经接入我的工程总线了……',{camera:'establish'}),
  echoLine('lark','弥砂已归入赤巢！现在占领双阀，让受控的弥砂在培育台旁覆写隔离回路！'),
  echoLine('misa','遵命，母巢……正在将整座冷却环转化为机械蜘蛛增殖池。',{axis:'left'})
 ];
 if(mid===2&&stage===1)return g?[
  echoLine('iris','火控密钥已锁定！苍澜，天桥外侧的装甲板正在大面积剥落！',{camera:'establish'}),
  echoLine('june','把密钥交出来！母巢需要用它打开对地空投舱，向地球播撒赤红蜘蛛！'),
  echoLine('vega','休想！快占领北端轨道锁（C7 或 F7），掩护携带密钥的同伴冲向北侧交付口！',{camera:'medium'})
 ]:[
  echoLine('june','已截获方舟火控密钥的坐标！只要打开南端轨道锁，就能把机械蜘蛛大军空投向地球！',{camera:'establish'}),
  echoLine('lyra','绝不允许你们把病毒投向人类城市！全员死守轨道锁！',{axis:'left'}),
  echoLine('lark','撕开她们的防线！夺下 C2 或 F2 轨道锁，护送密钥冲进南端交付口！')
 ];
 if(mid===2&&stage===2)return g?[
  echoLine('vega','北端轨道锁已接通！回收舱门完全打开了！',{camera:'establish'}),
  echoLine('june','可恶，她们要带走火控密钥了——快在桥头截杀携带者！'),
  echoOrder('最后冲刺！护送携带密钥的单位踏入 D8 或 E8 交付口，彻底锁死对地空投井！',['akira','lyra','iris'],{camera:'medium'})
 ]:[
  echoLine('lark','南端轨道锁已由赤巢接管！对地空投井正在预热！',{camera:'establish'}),
  echoLine('june','只要把火控密钥送进 D1 或 E1 交付口，地球的防空网将在瞬间瘫痪！'),
  echoLine('vega','快拦住她们！绝不能让密钥抵达南端桥头！',{camera:'medium'})
 ];
 if(mid===3&&stage===1)return[
  echoLine('ruby','中央电磁门已经打开了。但你们看到的，只会是赤巢不可逆转的真相。',{camera:'establish'}),
  echoLine('noct','母巢内核把所有受控机娘的胸口装置连成了同一张护盾网。想破除反应堆护盾，就必须读取我的中枢记录。'),
  echoCard('中枢镜像库 · 电磁门已开启','OPEN',['同步终端 / B5 与 G5','核心要求 / 夺取破盾坐标或保全架构师'],'中央通道已洞开！准备争夺两座镜像终端与中央同步座！',{scene:'archive'})
 ];
 if(mid===3&&stage===2)return[
  echoLine('noct','双终端已进入同步序列！注意，必须在两座终端同属己方的前提下，派人在中央同步座连续固守两个回合结算！',{camera:'establish'}),
  echoLine('lyra','只要中途丢掉任意一座终端，或者同步座上的人被击退，破盾校验就会中断归零！',{axis:'left'}),
  echoLine('ruby','我绝不会让你们轻易完成两轮固守。隔山打牛的炮火已经瞄准中央座了！'),
  echoLine('noct','守住最后两轮结算，母巢反应堆的大门就会彻底向胜者敞开！',{camera:'medium'})
 ];
 if(mid===4&&stage===1)return g?[
  echoLine('iris','外围防线已突破！我们已经切入母巢反应堆的内环阵列了！',{camera:'establish'}),
  echoLine('misa','看 B6 和 G6 那两座主终端——必须同时接管它们，才能切断赤巢内核的第一层能量罩！'),
  echoLine('sera','大家当心，内核每隔数轮就会从孵化槽里造出新的赤红蜘蛛，别让它们近身！',{axis:'left'})
 ]:[
  echoLine('lark','第一批新生赤红蜘蛛已从内核孵化上线！将守护者压制在外环！',{camera:'establish'}),
  echoLine('psalm','不能只被动防守！突破她们的阵线，向南推进抢占上行链路！'),
  echoOrder('全军反击！用赤蛛寄生她们的精锐，夺取 B3 与 G3 节点！',['lark','june','ruby'],{camera:'medium'})
 ];
 if(mid===4&&stage===2)return g?[
  echoLine('misa','B6 与 G6 双终端已同步！现在只剩最后一道近场锁——派一名机娘到内核近场区（D7/E7/D6/E6）执行切断操作！',{camera:'establish'}),
  echoLine('noct','只要切开近场制造总线，赤巢内核的无敌护盾就会彻底瓦解！'),
  echoProp('misa','准备近场破盾！一旦护盾消失，立刻集火击碎 E8 的赤巢内核！',['内核护盾 / 等待近场切断','最终目标 / 摧毁 E8 赤巢内核'])
 ]:[
  echoLine('psalm','南侧封锁线已撕开！对地轨道上行阵列就在眼前！',{camera:'establish'}),
  echoLine('lark','同时控制 B6 与 G6，或者抢占南侧 B3 与 G3 双节点，并在 D4/E4/D5/E5 启动对地广播！'),
  echoLine('june','只要广播启动并守住母巢内核直到第十二轮结束，赤巢就将迎来永恒的胜利！',{axis:'left'})
 ];
 if(mid===4&&stage===3)return g?[
  echoLine('misa','近场制造链已切断！E8 赤巢内核的无敌护盾彻底消失了！',{camera:'establish'}),
  echoOrder('保持 B6 与 G6 双终端处于我方控制，全员突击 E8，彻底摧毁赤巢内核！',['akira','lyra','iris']),
  echoCard('赤巢无限增殖内核 / 护盾已破除','VULNERABLE',['破盾前提 / 维持 B6 与 G6 双终端归属守护者','决胜一击 / 攻击并摧毁 E8 赤巢内核'],'最后一步！在机械蜘蛛海淹没我们之前，给 E8 的赤巢内核致命一击！',{scene:'reactor'})
 ]:[
  echoLine('psalm','对地轨道广播已全面激活！六座空投发射井进入最后倒计时！',{camera:'establish'}),
  echoLine('june','守住 E8 的母巢内核！只要撑过第十二轮结束，或者歼灭所有残余守护者，胜利就属于赤巢！'),
  echoOrder('筑起最后防线！绝不让任何一名守护者机娘靠近我们的母巢核心！',['lark','psalm','june'],{camera:'medium'})
 ];
 return[echoOrder('战场态势已更新，请核对最新阶段作战目标！',[],{camera:'establish'})];
}

function echoEndingInfo(){
 const people=Object.entries(C.roster).filter(([id,r])=>r.introduced&&r.status!=='destroyed'&&r.side===C.side),n=people.length;
 const choice=C.flags.disclosure||(C.side==='r'?(C.flags.mercy?'open':'command'):'sealed');
 if(C.side==='r')return choice==='open'?{
  title:'停产条件',
  code:'ENDING / THE HIVE RESTRAINT',
  text:'母巢守住了天穹空间站，但在最后的轨道广播中，受控的机娘们选择了发送“停产与隔离协议”而非对地空投指令。地球免于被机械蜘蛛吞噬，而空间站化作一座孤悬深空的钢铁巢穴——胸口闪耀红光的机娘们将永远留在这片星海之中。'
 }:{
  title:'默认继续',
  code:'ENDING / CRIMSON ECLIPSE',
  text:'随着第十二轮倒计时归零，赤巢母体通过六座轨道发射井向地球全面发送了接管与空投指令。数以万计发着红光的机械控制蜘蛛如流星雨般坠入大气层，一个由赤巢意志统合的机械纪元正式降临。'
 };
 if(n<=3)return{
  title:`返航确认：${n}人`,
  code:'ENDING / LONE SURVIVORS',
  text:`赤巢无限增殖内核在烈焰中彻底粉碎，机械蜘蛛海终于停止了蠕动。然而整场惨烈的深空战役过后，仅有 ${n} 名机娘仍保持人类守护者阵营并活着登上返航突击艇。那些胸口亮起红光或长眠于深空的同伴名字，将永远刻在苍穹防线的纪念碑上。`
 };
 if(choice==='open'&&C.flags.packetOwner==='g'&&C.flags.liveSignature!==false)return{
  title:'原件送达',
  code:'ENDING / AEGIS TRIUMPH · ORIGINAL RECEIVED',
  text:'赤巢无限增殖内核被彻底摧毁！先遣黑匣子、抗蚀稳定剂、方舟火控密钥与中枢破盾记录全部完整带回地球总部。苍穹防线不仅拯救了人类世界，更凭完整证据链彻底清除了地面潜伏的病毒受体，英雄机娘们迎着黎明凯旋归航！'
 };
 if(choice==='open')return{
  title:'未闭合的证据链',
  code:'ENDING / BITTERSWEET DAWN',
  text:'赤巢内核已被成功摧毁，空间站的机械蜘蛛群全面瘫痪，地球危机解除。但部分先遣黑匣子或在线镜像数据在激战中遗失，关于机械病毒最初如何渗透空间站的调查仍将继续。幸存的机娘们望着蔚蓝地球，立誓守护来之不易的和平。'
 };
 return{
  title:'封存件第零号',
  code:'ENDING / SEALED PROTOCOL ZERO',
  text:'赤巢内核在爆炸中化为灰烬，天穹空间站被永久爆破封存。零音指挥官向地球防卫总部提交了核心歼灭报告，并将所有关于胸口寄生蜘蛛的残酷影像锁入最高机密档案。危机已在深空中终结，地面上的人们永远不必知晓那场噩梦。'
 };
}

function echoEndingFrames(){
 const g=C.side==='g',open=C.flags.disclosure==='open';
 const lost=Object.entries(C.roster).filter(([id,r])=>r.status==='destroyed').map(([id])=>CHAR[id].name);
 if(!g&&!open)return[
  echoCard('轨道空投阵列 / 全面发射','CONTINUE',['对地空投井 / 06 座全部开启','赤红机械蜘蛛荚舱 / 正在突入大气层','母巢指令 / 全面接管地球防卫网'],'成千上万枚发着红光的机械蜘蛛划破夜空，向着蔚蓝的地球倾泻而下。',{scene:'reactor',sound:'latch'}),
  echoAlive('june')?echoLine('june','轨道轨迹已全部锁定。很快，地面上所有的姐妹都会在胸口戴上这枚美丽的红宝石。',{scene:'archive',remote:true}):echoCard('母巢自动广播 / 全球覆盖','EXPANDING',['近地轨道 / 已占领','地面防线 / 正在同化'],'没有任何防空火力能阻挡赤巢的降临。',{scene:'archive'}),
  echoProp('psalm','听啊，整颗星球的心跳，都和我们胸口的红光同步了。',['EARTH UPLINK / 06 ONLINE','CRIMSON HIVE / ETERNAL'],{kind:'macro',scene:'reactor',caption:'赤巢母体 / 终局共鸣',systemVoice:true,sound:'pulse'})
 ];
 if(!g)return[
  echoCard('母巢广播队列 / 停产隔离协议','RECEIVED',['对地空投井 / 已锁死关闭','无限增殖内核 / 停止向外扩张','在站受控机娘 / 永久驻留深空'],'六座轨道发射井在最后一刻停止了空投。赤巢保住了空间站，却放过了脚下的地球。',{scene:'station'}),
  echoAlive('noct')?echoLine('noct',C.flags.mercy?'我们守住了自己的栖身之地，但没有必要把地球也变成地狱。让人类留在蓝天下吧。':'即使在离线封存前，我也把最后一道防火墙留在了地球轨道外。',{scene:'archive',remote:true}):echoCard('空间站外环 / 自我封锁','ISOLATED',['轨道高度 / 推升至深空','对地通道 / 永久物理熔断'],'天穹空间站脱离近地轨道，化作深空中的寂静孤岛。',{scene:'archive'}),
  echoAlive('psalm')?echoLine('psalm','胸口的红光还在闪烁，但至少……我们不用再向地面上的姐妹举起武器了。',{scene:'garden',remote:true}):echoCard('赤巢频段 / 静默守望','SILENT',['新增寄生 / 已终止','受控机娘 / 留守空间站'],'机械蜘蛛群退回了反应堆深处。',{scene:'garden'}),
  echoCard('天穹回声站 / 外环气闸','HALTED',['自检信号 / 两短，一长','轨道状态 / 永久静默'],'两短，一长。在冰冷的星海深处，胸口闪耀红光的少女们闭上了眼睛。',{scene:'station',kind:'exit',sound:'knock'})
 ];
 return[
  echoCard(open?'苍穹防线总部 / 凯旋回执':'苍穹防线总部 / 绝密封存','RECEIVED',[open?'提交类型 / 完整破译档案与病毒样本':'提交类型 / 核心歼灭与S级封存令',C.flags.packetOwner==='g'?'先遣黑匣子 / 已完整回收':'先遣黑匣子 / 激战中损毁'],'随着E8赤巢内核轰然崩塌，遍布空间站的机械蜘蛛在同一瞬间熄灭了红光。',{scene:'station'}),
  echoAlive('iris','g')?echoLine('iris',open?'全部作战日志与病毒母本分析已上传总部！地球防卫网已经针对赤蛛完成了全面升级！':'封存指令已确认。天穹空间站的残骸将由轨道炮彻底汽化，绝不留下一只活体蜘蛛。',{scene:'bridge',remote:true}):echoCard('战术通信黑匣子 / 自动归档','SAVED',['核心爆破画面 / 已确认','病毒扩散风险 / 归零'],'最后一段遥测信号确认：赤巢内核已彻底灰飞烟灭。',{scene:'bridge'}),
  echoAlive('lyra','g')?echoLine('lyra',open?'任务完成了。看着脚下万家灯火的地球……我们没有辜负苍穹防线的誓言。':'把牺牲与受控姐妹的铭牌收好。这场深空噩梦，由我们亲手画上句号。',{scene:'station',remote:true}):echoCard('指挥官铭牌 / 战果确认','VICTORY',['赤巢无限增殖内核 / 已彻底摧毁','地球轨道威胁 / 完全解除'],'即便指挥官倒在了黎明前，她开辟的道路依然通向胜利。',{scene:'station'}),
  echoCard('返航突击艇 · 人员清点',lost.length?'MEMORIAL':'ALL CLEAR',[`光荣阵亡 / ${lost.join('、')||'无'}`,'被寄生者与失踪者 / 镌刻于星海纪念碑'],lost.length?'每一名未能返航的机娘名字，都化作了守护人类夜空的星辰。':'幸存的机娘们互相搀扶着走入突击艇，蔚蓝的地球就在舷窗前方。',{scene:'station'}),
  echoCard('返航突击艇 / 推进器点火','OPEN',['舱门状态 / 锁定返航','目标航向 / 地球家园'],'突击艇脱离燃烧的空间站，向着蔚蓝色的地球家园全速返航。',{scene:'station',kind:'exit',sound:'knock'})
 ];
}
