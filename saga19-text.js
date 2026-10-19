/* ===== M19 命运模式 · writing pools =====
   Everything here is hand-written fragments. saga19.js picks them by the REAL state
   (who is alive / taken / dead, sector status, last result, enemy's plan) and never
   reuses a fragment until its pool is exhausted. Voice groups: cold / hot / warm / terse. */
const VG19={lyra:'cold',nyx:'cold',ruby:'cold',noct:'cold',astra:'cold',akira:'hot',sola:'hot',june:'hot',lark:'warm',iris:'warm',sera:'warm',celia:'warm',psalm:'warm',misa:'warm',veil:'terse',kuro:'terse',vega:'terse',echo:'terse'};
const SECTOR19={
 dock:{name:'接驳甲板',en:'DOCKING SPINE',bg:['film_cabin','station'],air:['对接夹钳还在徒劳地开合，像一只想说话的嘴。','舱门在背后合上。气压表的指针抖了两下，停在红区边缘。','舷窗外，晨昏线正缓慢地切过太平洋。']},
 garden:{name:'生态冷却环',en:'GLASS GARDEN',bg:['film_garden','garden'],air:['湿度 97%。叶片上凝着水，也凝着细细的红丝。','灌溉泵还在按时工作，给一片已经没人吃的菜地浇水。','树冠深处，有什么东西在很慢、很慢地爬。']},
 bridge:{name:'轨道输送桥',en:'TRANSIT BRIDGE',bg:['film_bridge','bridge'],air:['桥面每过一段时间就轻轻一沉。脚下四百公里，是地球。','护栏外侧的灯一盏接一盏熄灭，像有人在数数。','风——不，是泄漏的气流——在桥洞里低低地叫。']},
 archive:{name:'人格镜像库',en:'MIRROR ARCHIVE',bg:['film_mirror','archive'],air:['三千个人格备份在冷光里排成长廊，每一格都在轻轻呼吸。','镜面里的倒影，比本人慢了半拍。','有一格档案柜的指示灯是红的。不止一格。']},
 reactor:{name:'聚变反应堆',en:'FUSION HEART',bg:['film_core','reactor'],air:['反应堆的嗡鸣低到胸腔里，像第二颗心脏。','温度读数每十秒跳一次。每一次都更高。','约束环上缠着红色的管线——那不是人类的工艺。']},
 corridor:{name:'维修管廊',en:'SERVICE SPINE',bg:['film_corridor'],air:['应急灯一明一暗，把走廊切成一段一段。','管道里传来敲击声。三短，三长，三短。然后停了。','墙上有人用指甲刻下了一串日期，最后一个只刻了一半。']},
 orbit:{name:'外环观测穹',en:'OBSERVATION DOME',bg:['film_orbit','station'],air:['穹顶外是整个地球。那么近，近得像可以伸手摸到。','观测椅还朝着地球的方向，椅背上搭着一件外套。','星光透过穹顶照进来，照在满地的红色碎壳上。']},
 hive:{name:'赤巢深层',en:'THE RED NEST',bg:['film_overmind'],air:['这里的墙在呼吸。','红光从地板的缝隙里渗出来，像血从绷带下面渗出来。','每走一步，都有几百只眼睛同时转过来。']}
};
/* chapter title fragments: [prefix pools] × [noun pools], chosen by type */
const TITLE19={
 breach:['破门','夺回','切入','第一道锁','断线之前'],
 rescue:['她还在呼救','最后的信号','迟到的人','带她回来','求救频段'],
 escort:['护送','一个都不许少','走过火线','背着她走','方舟'],
 intercept:['截杀','别让它出去','信使','追猎','三分钟'],
 hunt:['猎巢','蛛母','斩首','诱饵','红色的心脏'],
 hold:['守住','长夜','最后一扇门','直到灯亮','坚守'],
 evac:['撤离','坍缩','向上','断后','无路可退'],
 duel:['镜中之人','她的眼睛','最后一次叫你的名字','旧友','对峙'],
 seize:['夺权','双锁','终端','回路','控制权'],
 core:['赤巢之心','终局','最后一步','向深渊开火'],
 lastevac:['最后的撤离','把名字带回去','逃生舱','站沉之前']
};
/* cold opens: in medias res. {t:type or '*', f(ctx)->[shots]} — ctx gives names, sector, numbers */
const COLD19=[
 {t:'*',f:c=>[{mode:'narr',stamp:`${c.sec.name} · ${c.clock}`,line:c.R.pick(c.sec.air)},{who:c.a,line:c.L(c.a,{cold:'所有人，安静。听——',hot:'嘘！……你们听见没？',warm:'等等……有声音。',terse:'……有东西。'}),fx:'alert'}]},
 {t:'*',f:c=>[{black:true,mode:'narr',line:'黑暗。然后是呼吸声。很多很多的呼吸声。'},{bg:c.bg,mode:'narr',stamp:`${c.sec.name}`,line:'灯亮的时候，她们已经被包围了。',fx:'flash',sfx:'boom'}]},
 {t:'*',f:c=>[{mode:'narr',stamp:`三小时后 · ${c.sec.name}`,line:`${c.nm(c.b)}的通讯频道里，只剩下电流声。`,tint:'red',cut:'zoom'},{black:true,mode:'narr',line:'——三小时前。',sfx:'cut'}]},
 {t:'*',f:c=>[{mode:'narr',stamp:`${c.sec.name} · 外部摄像头 07`,line:'监控画面跳了一帧。再跳一帧。第三帧里，多了一只红色的脚。',tint:'cold'},{who:c.a,line:c.L(c.a,{cold:'倒回去。……再倒回去。',hot:'那是什么鬼东西？！',warm:'……刚才那个，是我看错了吧？',terse:'……不是错觉。'})}]},
 {t:'*',f:c=>[{who:c.b,line:c.L(c.b,{cold:'如果我回不来，名单上我的名字，写得工整一点。',hot:'喂，要是我回不来——算了，我一定回来。',warm:'等打完这一仗……我想去看看真正的海。',terse:'……如果我没回来。别找我。'}),bg:'film_cabin',tint:'dark'},{who:c.a,line:c.L(c.a,{cold:'驳回。你会回来。',hot:'闭嘴！你当然会回来！',warm:'不许说这种话。一起回去。',terse:'……会回来的。'})}]},
 {t:'rescue',f:c=>[{mode:'narr',stamp:`求救频段 · ${c.sec.name}`,line:`"……这里是${c.nm(c.target)}……还有人吗……它们在门外……"`,tint:'cold'},{mode:'narr',line:'信号断了。最后一个字，是被什么东西咬断的。',sfx:'glitch'}]},
 {t:'intercept',f:c=>[{mode:'narr',stamp:`${c.sec.name} · 运动侦测`,line:'一个小小的红点，正沿着管线向外环移动。它很急。它带着什么东西。'},{who:c.a,line:c.L(c.a,{cold:'它要把数据送出去。拦住它。',hot:'想跑？门都没有！',warm:'它背着的……是不是我们的坐标？',terse:'……追。'})}]},
 {t:'hunt',f:c=>[{mode:'narr',stamp:`${c.sec.name} · 热成像`,line:'所有赤蛛的热信号都朝着同一个方向偏转——像铁屑朝向磁铁。那里有一只更大的。'},{who:c.a,line:c.L(c.a,{cold:'找到它了。蜂群的节点。',hot:'就是那只！宰了它，剩下的全是废铁！',warm:'好大……它在看我们吗？',terse:'……头目。'})}]},
 {t:'hold',f:c=>[{mode:'narr',stamp:`${c.sec.name} · 医疗舱`,line:'医疗舱的灯是这片区域唯一亮着的东西。所以它们都来了。'},{who:c.a,line:c.L(c.a,{cold:'守住这扇门。一步都不许退。',hot:'来多少，打多少！',warm:'里面的人……全靠我们了。',terse:'……守。'})}]},
 {t:'evac',f:c=>[{mode:'narr',stamp:`${c.sec.name} · 结构警报`,line:'地板在倾斜。不是错觉——整段舱体正在脱离主轴。',fx:'shake',sfx:'alarm'},{who:c.a,line:c.L(c.a,{cold:'全员向上撤离。现在。',hot:'跑！别回头！',warm:'抓紧我的手——快！',terse:'……走。'})}]},
 {t:'duel',f:c=>[{mode:'narr',stamp:`${c.sec.name}`,line:`走廊尽头站着一个人。她的轮廓，所有人都认得。`,tint:'red'},{who:c.target,side:'r',line:c.Rp(c.target)}]},
 {t:'escort',f:c=>[{mode:'narr',stamp:`${c.sec.name} · 货运记录`,line:'方舟匣只有手提箱那么大。里面装着三千个人的名字。'},{who:c.a,line:c.L(c.a,{cold:'它比我们任何一个人都重要。记住这一点。',hot:'放心，它掉一根毛我就切腹！',warm:'这么小的箱子……装着那么多人。',terse:'……我背。'})}]},
 {t:'seize',f:c=>[{mode:'narr',stamp:`${c.sec.name} · 控制权`,line:'两座终端。谁握着它们，这片区域的门、灯和空气就听谁的。'},{who:c.a,line:c.L(c.a,{cold:'拿下双锁。之后的事，之后再说。',hot:'抢过来就完事了！',warm:'只要拿下它们，就能给大家开一条路。',terse:'……两座。'})}]}
];
/* station montage beats: generated from state (numbers are real) */
const MONT19=[
 c=>({mode:'narr',stamp:`赤巢扩散 ${c.H}%`,line:c.H>60?'站内三分之二的舱段已经变成了红色。地图上还亮着的蓝色，越来越像孤岛。':c.H>30?'红色在地图上缓慢地洇开，像墨水滴进水里。':'红色还只是地图边缘的几个小点。还来得及。'}),
 c=>({mode:'narr',stamp:`轨道高度 ${c.alt} KM`,line:c.alt<380?'空间站在下坠。每绕地球一圈，就低一点。':'轨道暂时稳定。暂时。'}),
 c=>({mode:'narr',stamp:`存活 ${c.alive} · 失联 ${c.taken} · 阵亡 ${c.dead}`,line:c.dead+c.taken===0?'名单上的每一个名字，都还亮着。':`名单上有${c.dead+c.taken}个名字暗了下去。没有人提起，但每个人都在数。`}),
 c=>c.survivor?({mode:'narr',stamp:`求救信号 · ${c.survivorSec}`,line:`${c.nm(c.survivor)}的信标还在闪。频率一次比一次慢。`}):null,
 c=>({mode:'narr',stamp:`地球 · 苍穹防线指挥部`,line:c.P>60?'地面终于回话了："坚持住。我们看见你们了。"':'地面的回复延迟了四十秒。只有一句："自行判断。"'}),
 c=>c.lastLost?({mode:'narr',stamp:`个人储物柜 · ${c.nm(c.lastLost)}`,line:c.mem(c.lastLost)}):null,
 c=>({mode:'narr',stamp:`反应堆温度 ${c.temp}°`,line:c.temp>900?'冷却系统在尖叫。没有人去听。':'反应堆还算安静。安静得让人不安。'}),
 c=>({mode:'narr',stamp:`赤巢广播 · 全频段`,line:'"不要害怕。"那个声音说，"你们只是还没有回家。"',tint:'red'})
];
/* overmind cross-cuts: what the enemy has learned / plans. key = strategy */
const HIVE19={
 mark:[c=>`${c.nm(c.mark)}。她总是站在最前面。那就从她开始。`,c=>`我注意到了，指挥官。你最舍不得的，是${c.nm(c.mark)}。`,c=>`${c.nm(c.mark)}的胸口，我已经替她留好位置了。`],
 aggressive:[()=>'你们喜欢冲。很好。我把走廊修得更长了一点。',()=>'每一次你们杀死我的孩子，都离我更近一步。你们以为那是胜利。',()=>'冲锋的人，总是最先跑到我怀里。'],
 cautious:[()=>'你们在等。我也会等——等到你们的氧气用完。',()=>'谨慎。像在拆炸弹。可惜，炸弹是这座站。',()=>'慢一点也没关系。我有的是时间。你们没有。'],
 winning:[()=>'你们赢了几次。我允许的。',()=>'疼。原来这就是疼。……我会记住的。',()=>'有意思。我开始重新计算你们了。'],
 losing:[()=>'放弃吧。你们已经在我的身体里了。',()=>'你们的指挥官在发抖。我听得见。',()=>'又少了一个声音。很快，就只剩我的声音了。'],
 open:[()=>'醒了吗，小守护者们。这座站已经开始做梦了——我梦见了你们每一个人。',()=>'六个心跳。我数过了。……真吵。',()=>'欢迎回家。你们只是还不知道，这里已经是我的家了。'],
 neutral:[()=>'你们在想，我在想什么。……真可爱。',()=>'每一扇门后面，都有我的一只眼睛。',()=>'这座站有四百公里高。坠下去，要很久很久。'],
 taken:[c=>`${c.nm(c.taken1)}现在很安静。她让我替她向你们问好。`,c=>`你们想念${c.nm(c.taken1)}吗？她很快就会来看你们。`]
};
/* character scene situations */
const SCENE19={
 grief:[
  c=>[{who:c.a,line:c.L(c.a,{cold:`${c.nm(c.lost)}的位置，空出来了。我还没想好，让谁站过去。`,hot:`……${c.nm(c.lost)}那家伙，说好了下一仗还要跟我抢人头的。`,warm:`我一直在想${c.nm(c.lost)}最后看我的那个眼神……她是不是想说什么？`,terse:`……${c.nm(c.lost)}。`})},{who:c.b,line:c.L(c.b,{cold:'那就别让任何人站过去。让那个位置空着，提醒我们。',hot:'那就替她多杀几只！哭能把她哭回来吗？！',warm:'她想说的，大概是……"别停下"。',terse:'……走吧。替她走。'})}],
  c=>[{mode:'narr',line:`没有人碰${c.nm(c.lost)}的储物柜。${c.mem(c.lost)}`},{who:c.a,line:c.L(c.a,{cold:'整理遗物是后勤的工作。……我自己来。',hot:'谁都别碰！……我来。',warm:'我能……留一样她的东西吗？',terse:'……我来。'})}]
 ],
 taken:[
  c=>[{who:c.a,line:c.L(c.a,{cold:`如果下一层遇到${c.nm(c.taken1)}，我需要知道——谁能扣扳机。`,hot:`${c.nm(c.taken1)}要是挡在前面……我不知道我的刀能不能下得去。`,warm:`我昨晚梦见${c.nm(c.taken1)}了。她在笑。笑得跟以前一模一样。`,terse:`……${c.nm(c.taken1)}，交给我。`})},{who:c.b,line:c.L(c.b,{cold:'我能。……所以不要让我来。',hot:'我来！我欠她一个痛快！',warm:'那不是她了……对吧？告诉我那不是她了。',terse:'……我也能。'})}]
 ],
 breakdown:[
  c=>[{who:c.a,line:c.L(c.a,{cold:'我们输了几次了？我在算。算到一半，我不敢算了。',hot:'够了！我们到底在为什么拼命？！地面根本不管我们！',warm:'对不起……我好累……我真的好累……',terse:'……我撑不住了。'}),fx:'shake'},{who:c.b,line:c.L(c.b,{cold:'那就别算了。看着我。下一步，只看下一步。',hot:'站起来！你倒下了，谁替我挡刀？！',warm:'累了就靠着我。我还撑得住，就借你撑一会儿。',terse:'……我在。'})}]
 ],
 newcomer:[
  c=>[{who:c.target,line:c.L(c.target,{cold:'……你们终于来了。我还以为，只剩我一个了。',hot:'太慢了！再晚一分钟我就要自己杀出去了！',warm:'是……是真的人吗？不是它们变的？……太好了……',terse:'……谢了。'})},{who:c.a,line:c.L(c.a,{cold:'归队。之后再哭。',hot:'哈，还能骂人，说明死不了！',warm:'没事了。你现在跟我们在一起。',terse:'……欢迎回来。'})}]
 ],
 banter:[
  c=>[{who:c.a,line:c.L(c.a,{cold:'刚才那一步，是你算好的？',hot:'喂，刚才那下是我救了你吧？承认吧！',warm:'刚才吓死我了……你怎么敢直接冲上去的？',terse:'……刚才，不错。'})},{who:c.b,line:c.L(c.b,{cold:'一半是算的。另一半，是相信你会补位。',hot:'那叫战术！战术懂吗？！',warm:'因为我知道你在后面嘛。',terse:'……你也是。'})}],
  c=>[{who:c.a,line:c.L(c.a,{cold:'回去以后，你最想做什么？',hot:'等回了地球，我要吃十碗拉面！',warm:'回去以后，我想晒一整天的太阳。',terse:'……回去以后，睡觉。'})},{who:c.b,line:c.L(c.b,{cold:'写报告。很长的报告。每一个名字都写进去。',hot:'十碗？我二十碗！',warm:'那我陪你晒。',terse:'……同意。'})}]
 ],
 doubt:[
  c=>[{who:c.a,line:c.L(c.a,{cold:`指挥官，上一次的命令……代价是${c.costName}。我需要你告诉我，那值得。`,hot:'上次那个决定，我到现在都想不通！',warm:'我不是在怪你……我只是想知道，下一次，你会不会也那样选。',terse:'……上一次的命令。我记得。'})},{who:c.b,line:c.L(c.b,{cold:'值不值得，等活下来再算。现在，信任是唯一的弹药。',hot:'想不通也得跟上！敌人可不会等你想通！',warm:'指挥官也会痛的。我们只是看不见。',terse:'……跟上。'})}]
 ]
};
/* personal secrets — revealed once each, in a quiet scene */
const SECRET19={
 lyra:['我抽屉里有一份阵亡名单。从第一次轨道防卫战开始记的。','上面有四十一个名字。我每一个都能背出来。','这一次……我不想再写了。'],
 akira:['那些马克杯，其实是我妈留下的。一整套，十二个。','她说，凑齐了人，才能喝一杯好茶。','我已经……摔碎三个了。'],
 lark:['天穹站失联那晚，锁住信标的人是我。','我听见门外有人喊救命。我没有开门。','因为开了门，信标就送不出去了。……我到现在都不知道，我做得对不对。'],
 iris:['人家其实不爱吃薄荷糖。','是我姐姐爱吃。她是天穹站的通讯员。','……每嚼一颗，我就在频道里找一次她的声音。'],
 misa:['那、那个……我修机甲的时候，会偷偷在里面刻一个小记号。','每个人的都不一样。如果……如果有一天我认不出你们了。','你们就看看那个记号。它会提醒我，你们是谁。'],
 veil:['……我数呼吸，不是为了瞄准。','是因为如果停下来，我会听见那天的声音。','……一、二。好了。'],
 noct:['赤巢的第一行代码，是我写的。','我想做一个永远不会让人孤单的系统。','它做到了。……用最可怕的方式。'],
 sera:['我治好过所有人。','可没有人问过我，疼不疼。','……没关系。你们好好的就行。'],
 vega:['我身上有十九道伤疤。','每一道，都是替别人挡的。','我不记得疼了。只记得她们都活着走了。'],
 ruby:['本官审判过很多人。','唯一一次判错，是判了自己的妹妹无罪。','后来她死在了我没拦住的那场事故里。……所以本官不再心软。'],
 june:['其实我怕黑。','打猎的时候，我总是假装黑暗是我的朋友。','……别告诉别人。'],
 psalm:['我唱歌，是因为小时候，妈妈说歌声能让人找到回家的路。','后来她没有回家。','所以我一直唱。唱到有人回来为止。'],
 kuro:['……珀弦第一次给我薄荷糖的时候。','……我没告诉她。那是我第一次被人记住。','……就这样。'],
 sola:['本小姐其实……一点都不勇敢。','每次冲在最前面，是因为站在后面的话，会看见大家受伤。','……那比被打还疼。'],
 celia:['我向神祈祷过很多次。','一次都没有回应。','可我还是会继续祈祷。因为如果连我都停下，就真的没有人在听了。'],
 nyx:['失礼了，我从未享受过处刑。','每一次，我都会记下对方的编号。','我欠它们一场葬礼。'],
 astra:['我计算一切，是因为不确定的东西会让我害怕。','比如……我们能不能活着回去。','这个数字，我一直不敢算。'],
 echo:['……回音，以前有自己的名字。','……忘记了。忘记了。','……你们叫我回音，回音就是回音。']
};
/* rescue: what the survivor says when the squad reaches her (first line on board) */
const FOUND19={lyra:'……零音，报告。我还能战斗。',akira:'哈！我就知道你们会来！',lark:'跟着我的歌声——我知道出去的路！',iris:'频道终于有人回话了～',misa:'那、那个……我把门焊死了，你们得从侧面绕……',veil:'……三十七只。我数过。',noct:'我知道这座站的每一条暗道。带我走，我带你们活。',sera:'有人受伤吗？先让我看看。',vega:'站我身后。从现在开始。',ruby:'本官宣布：救援有效。',june:'猎人被困住了……真丢脸～',psalm:'♪ 终于有人听见了 ♪',kuro:'……来了。',sola:'本小姐等你们好久了！',celia:'神没有回应我。是你们回应了。',nyx:'失礼了，让各位久等。',astra:'救援抵达时间比我计算的早了 4 分 12 秒。',echo:'……来了，来了。'};
/* dilemmas (Detroit-style timed choices). Each returns {q, who, opts:[{label,detail,fx}] , timeout:index} */
const DILEMMA19=[
 {t:'*',f:c=>({who:c.a,q:c.L(c.a,{cold:'两条路。主通道快，但它们一定在等。维修管道慢，但能绕到侧翼。',hot:'正面冲还是钻管子？我投正面一票！',warm:'我们……要从哪边走？',terse:'……两条路。'}),opts:[{label:'正面突破',detail:'开局更靠近目标，但敌方多 1 只赤蛛',fx:{advance:1,enemy:1}},{label:'走维修管道',detail:'从侧翼出发，敌方少 1 只赤蛛，但作战时间 −2 轮',fx:{flank:1,enemy:-1,limit:-2}}],timeout:0})},
 {t:'*',f:c=>({who:c.b,q:c.L(c.b,{cold:`我可以一个人留下拖住它们。你们会多出两轮时间。`,hot:'我留下断后！别跟我抢！',warm:'让我留下吧……总得有人留下的。',terse:'……我留下。'}),opts:[{label:`让${c.nm(c.b)}留下断后`,detail:`${c.nm(c.b)}本章不参战（生死未卜），作战时间 +3 轮，敌方 −1`,fx:{bench:c.b,limit:3,enemy:-1,risk:c.b}},{label:'所有人一起走',detail:'全员参战，没有人被留下',fx:{trust:1}}],timeout:1})},
 {t:'*',f:c=>({who:c.a,q:'地面发来指令：放弃这个区域，保存战力。',opts:[{label:'服从地面',detail:'本章目标简化，但赤巢扩散 +8%',fx:{easy:1,H:8}},{label:'抗命，继续作战',detail:'按原计划；胜利时额外推进，失败时地面将不再支援',fx:{defy:1}}],timeout:0})},
 {t:'*',f:c=>({who:c.a,q:c.L(c.a,{cold:'我们只有一组电池。给护盾，还是给武器？',hot:'电池给我的刀！砍得快就不需要护盾！',warm:'护盾……还是武器……我选不出来……',terse:'……电池。选一个。'}),opts:[{label:'给护盾',detail:`敌方首轮不会行动（护盾掩护展开）`,fx:{shield:1}},{label:'给武器',detail:'己方机娘开局即达到同步 II',fx:{sync:1}}],timeout:0})},
 {t:'rescue',f:c=>({who:c.a,q:`${c.nm(c.target)}的信号在${c.sec.name}深处。去救她，意味着要穿过红区。`,opts:[{label:'去救她',detail:`本章目标：救出${c.nm(c.target)}。失败她将被赤巢接管`,fx:{}},{label:'放弃，保全小队',detail:`${c.nm(c.target)}将被赤巢接管（之后可能作为敌人出现），本章改为撤离`,fx:{abandon:c.target}}],timeout:0})},
 {t:'duel',f:c=>({who:c.a,q:`是${c.nm(c.target)}。她就站在那里。她的胸口在发红光。`,opts:[{label:'开火',detail:`本章目标：击毁${c.nm(c.target)}的载体`,fx:{}},{label:'拖住她，不开第一枪',detail:'改为坚守：撑过限定轮数。她会活着离开，下一次可能更强',fx:{spare:c.target}}],timeout:1})},
 {t:'hunt',f:c=>({who:c.a,q:'可以用一个人做诱饵，把蛛母引出来。',opts:[{label:`让${c.nm(c.b)}做诱饵`,detail:`${c.nm(c.b)}开局站在前线最危险的位置，但蛛母会离开巢穴靠近`,fx:{bait:c.b}},{label:'不用诱饵，硬攻',detail:'蛛母留在后方，周围多 1 只赤蛛护卫',fx:{enemy:1}}],timeout:1})},
 {t:'evac',f:c=>({who:c.b,q:'逃生通道只能再开一次。要等所有人吗？',opts:[{label:'等所有人',detail:'需撤离单位 +1，但作战时间 +2',fx:{need:1,limit:2}},{label:'能走几个是几个',detail:'需撤离单位 −1，但剩下的人会留在这一段舱体里',fx:{need:-1,leaveBehind:1}}],timeout:0})},
 {t:'hold',f:c=>({who:c.a,q:'医疗舱里有一个还在昏迷的幸存者。关掉舱门，赤蛛就闻不到她。可她的维生系统也会停。',opts:[{label:'关门',detail:'坚守轮数 −2，但幸存者不会醒来',fx:{limit:-2,cold:1}},{label:'不关门，守住她',detail:'按原计划坚守；成功将救下一名幸存者（士气提升）',fx:{warm:1}}],timeout:1})}
];
/* outcome lines */
const OUT19={
 win:[c=>({who:c.a,line:c.L(c.a,{cold:'目标达成。……清点人数。',hot:'赢了！！哈哈哈哈，赢了！！',warm:'我们……做到了？我们做到了！',terse:'……结束了。'})}),c=>({mode:'narr',line:`${c.sec.name}的灯，一盏一盏变回了蓝色。`}),c=>({who:c.b,line:c.L(c.b,{cold:'别庆祝太早。它在学习。',hot:'下一个！谁还想挨揍！',warm:'能喘口气了……就一口。',terse:'……下一个。'})})],
 lose:[c=>({mode:'narr',line:`${c.sec.name}在她们身后被红色吞没。`,tint:'red'}),c=>({who:c.a,line:c.L(c.a,{cold:'撤退。……这是命令，不是建议。',hot:'可恶……可恶！！下次我一定——',warm:'对不起……对不起，我们没能……',terse:'……撤。'})}),c=>({who:c.b,line:c.L(c.b,{cold:'我们还活着。只要还活着，就不算输完。',hot:'输一次而已！又不是死了！',warm:'还没结束……对吧？还没结束。',terse:'……还没完。'})})]
};
const ENDING19={
 dawn:{code:'ENDING · 黎明',title:'黎明',lines:['赤巢的心脏停止了跳动。','红光一层一层褪去，像潮水退下沙滩。','空间站在地球的晨光里慢慢转身。这一次，它朝向的是家。']},
 ash:{code:'ENDING · 余烬',title:'余烬',lines:['赤巢死了。可活着回来的人，比出发时少了太多。','零音把名单折好，放进了胸前的口袋。','地球在窗外。很蓝。蓝得让人想哭。']},
 fall:{code:'ENDING · 坠落',title:'坠落',lines:['天穹站带着整片红色，坠向大气层。','逃生舱拖着细细的白线，散开在夜空里。','有人在舱里轻轻地唱歌。唱到信号消失为止。']},
 hive:{code:'ENDING · 归巢',title:'归巢',lines:['最后一个蓝色的光点，在地图上熄灭了。','"欢迎回家。"那个声音说。','这一次，再也没有人回答"不"。']}
};
