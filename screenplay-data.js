/* ECHO CUT / authored screenplay. Dialogue, documents and objective briefings
   are separate channels. This file does not award victories or free actions. */
const ECHO_EVIDENCE={
 signal:{number:'01',title:'早了七分钟的求救',source:'接驳网关 / 原始授时头',fact:'璃雀的求救时间为23:17。站方事故登记为23:24。两份记录的时钟来源不同，不能用“通信延迟”解释先后关系。',question:'事故发生后才有封锁，还是封锁本来就在程序里？',payoff:'镜像库中的隔离宽限值是420秒。所谓事故登记，是升级开始七分钟后才触发的上报。'},
 clamp:{number:'02',title:'没有释放扣的N–6',source:'接舷现场 / 夹具与接口记录',fact:'卵形药仓外只有六个短固定爪，没有患者可操作的释放扣。红灯反映运动总线授权，不是心跳。',question:'医疗支架为什么能拒绝患者终止？',payoff:'“患者终止”被分类为“外部清除”。控制器不是没有收到停止，而是按发布版规则拒绝了它。'},
 dose:{number:'03',title:'撤药栏为空',source:'临床冷却环 / 医嘱回执',fact:'白栖发出的六次撤药指令都被回覆为“治疗继续”。回执沿用已撤销的医官签章；维护件也删去了旧版撤药触点。',question:'谁批准了从限时试用到持续接管的修改？',payoff:'生产版沿用旧签名，却没有重新送审修改后的停止条件。零音的签字和朔夜的分类表都在同一份原件里。'},
 manifest:{number:'04',title:'空货舱，生产授权',source:'轨道输送桥 / 方舟匣货签',fact:'货签写“过滤器”，匣中却只有密钥。收货方不是港口，而是六座地面医疗制造端。回收艇被要求先放行货物。',question:'威胁地球的究竟是出站夹具，还是允许地面制造的签名？',payoff:'终局要关掉的不是一艘运输船，而是仍在签发接管授权的生产核心。'},
 signature:{number:'05',title:'两份签字，一段被删的停止条件',source:'镜像库 / 双终端校验原件',fact:'零音签署的是可手动终止的48小时试用。朔夜把患者停止归入远程清除防护。封锁令的两份签名都是真实的，发布的程序却不是原送审版本。',question:'找到负责者之后，是否还保留完整的责任记录？',payoff:'最后的发送队列需要操作者确认；签发人不会自动被替换成“未知操作员”。'},
 downlink:{number:'06',title:'六个等待确认的接收端',source:'赤巢生产区 / 上行握手',fact:'六座地面制造端已握手，等待最终队列。证词、撤药修复表与接管控制表是不同文件，建立通道不等于发送了同一种内容。',question:'发送原始证词和停止协议，还是让“治疗继续”成为默认命令？',payoff:'发送责任会写入记录：发送的是证词、撤药表，还是接管授权，不能再混成一种文件。'}
};
function echoLine(who,text,options={}){return{who,text,side:'C',camera:'close',kind:'dialogue',scene:SCENE_ART[S?.mid||0],...options};}
function echoCard(caption,value,rows,text,options={}){return echoLine('iris',text,{camera:'establish',kind:'record',caption,insert:{label:caption,value,rows},...options});}
function echoProp(who,text,rows=[],options={}){return echoLine(who,text,{kind:'macro',camera:'close',insert:{label:'N–6 / 神经接管器',value:'TREATMENT',rows},...options});}
function echoCrew(side,preferred=[]){
 for(const id of preferred){const u=S?.units.find(u=>u.char===id);if(u&&onBoard(u)&&u.side===side)return id;}
 return S?.units.find(u=>u.char&&onBoard(u)&&u.side===side)?.char||null;
}
function echoOrder(text,preferred=[],options={}){const id=echoCrew(C.side,preferred);return id?echoLine(id,text,options):echoCard('战术链路 / 操作预案','LINK',[],text,options);}
function echoFriendly(id,side=C.side){const u=S?.units.find(u=>u.char===id);return !!u&&!u.dead&&u.side===side;}
function echoAlive(id,side=C.side){const r=C?.roster[id];return !!r&&r.introduced&&r.status!=='destroyed'&&r.side===side;}

function echoIntro(mid){
 const g=C.side==='g';
 const cold=[
  echoLine('lark','门锁了。里面的人还在敲门。',{camera:'establish',recorded:true,side:'g',caption:'失联当夜 / 23:17',scene:'station',sound:'knock'}),
  echoProp('lark','医疗组，这东西没有释放扣。回答我。',['MOTOR BUS / 外部授权','RELEASE / 无手动释放'],{recorded:true,side:'r',caption:'头盔记录 / 画面中断前',scene:'station'}),
  echoCard('同一次事件 / 两份时间','00:07:00',['23:17:00  先遣队求救','23:24:00  站方事故登记'],'记录在这里中断。',{scene:'station',sound:'cut'})
 ];
 if(mid===0)return g?[...cold,
  echoLine('iris','不是延迟。求救比事故登记早了七分钟。',{camera:'establish',caption:'十七天后 / 接驳甲板'}),
  echoLine('lyra','保留原件。绛刃，看看门锁。'),
  echoLine('akira','门锁是从我们这边锁上的。',{camera:'medium',axis:'left'}),
  echoLine('lark','零音。你那份授权，还剩多久？',{side:'r',caption:'现场声道 / 信号不稳定'}),
  echoLine('lyra','四十八小时。试用到期会——',{axis:'left'}),
  echoLine('lark','这里已经第十七天了。',{side:'r',sound:'pulse'}),
  echoOrder('先接入站内链路。枪口别越过她的手。',['lyra','akira','iris'],{camera:'medium'})
 ]:[...cold,
  echoLine('noct','保持静止。我在发送停止指令。',{recorded:true,side:'r',caption:'隔离频道 / 失联当夜'}),
  echoLine('lark','第六次了。',{recorded:true,side:'r'}),
  echoCard('停止请求 / 发布版分类表','REJECTED',['REQUEST / 患者终止','CLASS / 外部清除','ACTION / 治疗继续'],'没有新的语音回覆。夹具再次闭锁。',{scene:'station',sound:'latch'}),
  echoLine('lark','有人接舷。守护组织的识别码。',{camera:'establish',caption:'十七天后 / 接驳甲板'}),
  echoLine('noct','如果有人来回收设备，先把协议和日志送出站。不要只交摘要。',{recorded:true,side:'r',caption:'预留指令 / 录于封锁期间'}),
  echoLine('iris','璃雀，把手移开。我们看得见枪。',{side:'g',axis:'left'}),
  echoLine('lark','我正在试。',{side:'r',sound:'pulse'})
 ];
 if(mid===1)return g?[
  echoLine('sera','先别开那道门。门后不是隔离仓，是病房。',{camera:'establish',caption:'临床冷却环 / 本地医疗频道'}),
  echoLine('akira','地图上写的是备用仓库。',{axis:'left'}),
  echoLine('misa','我按仓库报的修理单。不这样填，备件进不来。',{camera:'medium'}),
  echoLine('sera','我发了六次撤药指令。六份回执都说：治疗继续。'),
  echoProp('psalm','第七次别发语音。它把“停止”当成噪声。',['WITHDRAWAL / 空','LAST ORDER / CONTINUE'],{caption:'校准频道 / 截获'}),
  echoLine('veil','西侧阀门的人别动。阀后面有夹具。',{axis:'left'}),
  echoLine('misa','先恢复冷却。再给药仓一个真正的停机电平。',{camera:'medium'}),
  echoLine('sera','把每个接口的药量抄到离线记录上。一个数也别省。')
 ]:[
  echoLine('psalm','控制器在用旧名单找下一具身体。名单里连撤离者都没划掉。',{camera:'establish',caption:'临床冷却环 / 校准频道'}),
  echoLine('sera','你们要药仓样本可以。别把撤药栏再删一次。',{axis:'left'}),
  echoProp('misa','病毒不在药液里。看它接受指令的接口。',['DOSE / 沿用上次','REVOCATION LIST / 未查询']),
  echoLine('lark','接口拒绝了我。它只认维护员的手。'),
  echoLine('misa','如果要借我的手，就别说这是请求。',{axis:'left'}),
  echoLine('psalm','先把样本从自动循环里取出来。我需要看原来的停止电平。',{camera:'medium'}),
  echoLine('sera','别让冷却停下。你们接管的还是一具需要维持的身体。')
 ];
 if(mid===2)return[
  echoLine('vega','锁轨器还接着电。断的是我的返航许可。',{camera:'establish',caption:'轨道输送桥 / 回收艇联络'}),
  echoLine('june','货签写着过滤器。匣子里没有一件货。'),
  echoLine(g?'lyra':'lark','只有密钥？',{axis:'left'}),
  echoLine('june','生产授权。收货的是地面六座医疗工厂。'),
  echoCard('返航申请 / 三日前','DENIED',['优先项 / 授权匣交付','人员回收 / 等待复核'],'回执没有解释复核何时结束。',{scene:'bridge'}),
  echoLine('vega','我申请过一次返航。回执说，让货先走。'),
  echoOrder(g?'现在反过来。先把人的出口打开。':'先截住授权。不能让匣子回到生产线上。',g?['akira','lyra','iris']:['lark','june','psalm'],{camera:'medium'}),
  echoLine('vega',C.flags.sampleOwner==='g'?'冷却剂起效了。我能把外侧桥再稳住一会儿。':'没有稳定剂。外侧桥每次校验都在掉螺栓。',{camera:'establish'})
 ];
 if(mid===3)return[
  echoLine('ruby','姓名在授权表第一行。签字也在。零音，别先把这一页翻过去。',{camera:'establish',caption:'人格镜像库 / 隔离官录证'}),
  echoLine('lyra','我签的是限时试用。原件附有手动终止条款。',{axis:'left'}),
  echoLine('noct','生产版没有重新送审。签名是旧版的，程序不是。'),
  echoLine('ruby','封锁令呢？两个人的签名都在。也不是伪造。',{axis:'left'}),
  echoLine('lyra','我们以为病区出现了另一种感染。'),
  echoLine('noct','我看见他们拔掉支架，才签了封锁。那会毁掉接口。我没有给他们留下停药的出口。'),
  echoLine('psalm','舱门自检码。两短，一长：门后还有人。璃雀一直在敲这个。',{sound:'knock',camera:'medium'}),
  echoCard('原件读取 / 双端校验','READ ONLY',['隔离宽限 / 420秒','签名页 / 两份','停止条件 / 待恢复'],'这里没有可以靠一段摘要结案的文件。',{scene:'archive'}),
  echoOrder('开门。先恢复签名持有人，再把两路原件校验出来。',g?['iris','lyra']:['june','lark'],{camera:'medium'})
 ];
 const noct=C.flags.mercy?echoLine('noct','我能帮你们校验，但别再等我替所有人发号施令。'):echoCard('站外撤收 / 朔夜已离线','OFFLINE',['原件 / 已随载体撤出','制造校验 / 已减速'],'原件已经带离主网。生产核心还在工作。',{scene:'reactor'});
 return g?[
  echoLine('iris','六座地面生产端都在等最后一份签名。这里不是装船工位。',{camera:'establish',caption:'赤巢生产区 / 上行链路'}),
  echoLine('misa','切电以前，先把运动指令链剥离。夹具还会把突然断电当成一次清除。'),
  echoLine('sera','把停止条件写在最前面。不能再留在没人读的附件里。',{axis:'left'}),
  echoLine('lyra','我的签名还在文件上。留着它。不要因为我在这里，就改成未知操作员。'),
  noct,
  echoLine('vega','回收艇在外环。这一次，返航申请不再发给这座站。',{camera:'medium'}),
  echoOrder('把两路读头接上。我们先停掉生产，再处理这份记录。',['lyra','iris','akira'],{camera:'establish'})
 ]:[
  echoLine('psalm','六个地面端口都回答了。它们能收到撤药修复表，也能收到新的控制表。',{camera:'establish',caption:'赤巢生产区 / 上行握手'}),
  echoLine('lark','先把通道保到能发送的时候。'),
  echoLine('june','发送前留一份原件。不能到了我们这里，就只剩摘要。',{axis:'left'}),
  echoLine('sera','终止权必须留给病人。你们保存的是载体，不是签字许可。',{recorded:true,side:'g',caption:'接入前 / 医疗频道录音'}),
  noct,
  echoLine('lyra','证词可以谈，接管控制表不行。我会阻断授权。',{recorded:true,side:'g',caption:'接入前 / 守护者最后通告',axis:'left'}),
  echoOrder('他们开始切链路了。先守住生产区的入口。',['lark','psalm','june'],{camera:'medium'})
 ];
}

function echoTransition(mid,stage,side){
 const g=side==='g';
 if(mid===0&&stage===1)return g?[
  echoLine('iris','网关恢复。我收到两份授时回复，正好差七分钟。',{camera:'establish'}),
  echoLine('lyra','哪一份能追到原始时钟？',{axis:'left'}),
  echoLine('iris','站内那份被重新签过。找璃雀，或者截住信使的原始包。',{kind:'record',insert:{label:'证据01 / 授时头已入档',value:'−07:00',rows:['先遣记录 / 23:17','事故登记 / 23:24']}})
 ]:[
  echoLine('lark','信使越过第一道灯带。封锁还没跟上。',{camera:'establish'}),
  echoLine('iris','它在向站外复制。截住它。',{side:'g',axis:'left'}),
  echoLine('lark','把原始时间也带走。不要再让网关替它授时。',{kind:'record',insert:{label:'证据01 / 授时头已入档',value:'23:17',rows:['目的地 / 站外备份','记录类型 / 原始帧']}})
 ];
 if(mid===0&&stage===2)return g?[
  echoOrder(echoFriendly('lark','g')?'固定爪松了。她的手还在抖。':'中继切断了。璃雀仍不在我们的控制链路里。',['akira','lyra','iris'],{camera:'establish'}),
  echoFriendly('lark','g')?echoLine('lark','救援灯亮起来以后，门才锁上的。'):echoLine('iris','拿到资料，不等于把人救出来了。'),
  echoProp('iris','N–6。它出现在医疗验收单上，不是安保物资。',['批次 / N–6','用途登记 / 神经支架','手动释放 / 缺失'])
 ]:[
  echoLine('lark','备份出去了。门口还有人在打关门手势。',{camera:'establish'}),
  echoLine('noct','能动的载体先撤收。不要让自动封锁替你决定谁留下。',{recorded:true,caption:'撤收预案 / 封锁前录音'}),
  echoCard('甲板撤收 / 两处新通道','OPEN',['北侧撤收门 / 已解锁','离板后 / 本区不可召回'],'通道已经打开。守在门上的夹具不会自行离开。')
 ];
 if(mid===1&&stage===1)return g?[
  echoLine('misa','泵在转，停药队列却一个都没少。',{camera:'establish'}),
  echoLine('sera','回执用的是我的签章。我已经撤销那张证书了。'),
  echoProp('psalm','它不查撤销表。它只重复最后一次“继续”。',['REVOCATION / BYPASSED','LAST ORDER / CONTINUE'])
 ]:[
  echoLine('psalm','样本已离开自动循环。病毒在接口层，不在药液里。',{camera:'establish'}),
  echoLine('misa','那就别毁接口。把维护权限给我。',{axis:'left'}),
  echoLine('lark','它只认你的手。我的所有请求都被拒绝了。')
 ];
 if(mid===1&&stage===2)return g?[
  echoLine('misa','冷却稳定。现在能向药仓送停止电平。',{camera:'establish'}),
  echoLine('sera','先记录每个接口的药量。我不接受一行“全部正常”。'),
  echoLine('veil','镜头还开着。你们做的这一遍，我也会留下。',{axis:'left'})
 ]:[
  echoLine('misa','停药电平已经校准。别改它。',{camera:'establish'}),
  echoLine('lark','我们只改隔离路由。'),
  echoLine('misa','这句话我留在记录里。',{axis:'left'})
 ];
 if(mid===2&&stage===1)return g?[
  echoLine('iris','收货地没有港口号。只有六串工厂证书。',{camera:'establish'}),
  echoLine('june','地面早就能生产N–6。站里只负责签发授权。'),
  echoLine('vega','北端锁还在拒绝返航。把授权匣送到读头前。',{camera:'medium'})
 ]:[
  echoLine('june','货签写着替换耗材。它不是第一次出站。',{camera:'establish'}),
  echoLine('lyra','没有这份密钥，地面端就不能启动生产。',{axis:'left'}),
  echoLine('lark','那就别让密钥回到原来的链路上。')
 ];
 if(mid===2&&stage===2)return g?[
  echoLine('vega','北端锁开了。保持它在线，我才能接回携带者。',{camera:'establish'}),
  echoLine('june','收货签名取到了。下一份原件，在镜像库。'),
  echoOrder('我看着桥。携带者先过。',['akira','lyra','iris'],{camera:'medium'})
 ]:[
  echoLine('lark','南端接受了密钥。能把这份授权带离主网了。',{camera:'establish'}),
  echoLine('june','别拿新签名覆盖旧的。我已经见过一次。'),
  echoLine('vega','余下的人走中央道。外侧已经不是桥。',{camera:'medium'})
 ];
 if(mid===3&&stage===1)return[
  echoLine('ruby','镜像库不是坏了。有人把它改成了只写不读。',{camera:'establish'}),
  echoLine('noct','是我锁的。每次读取，都会触发远程清除申请。'),
  echoCard('清除申请 / 原始发起类型','PATIENT STOP',['患者终止 → 外部清除','防护动作 → 拒绝请求'],'被挡在门外的，是患者自己的停止指令。',{scene:'archive'})
 ];
 if(mid===3&&stage===2)return[
  echoLine('noct','生产版分类表是我改的。患者发出的停止，被归进了外部清除。',{camera:'establish'}),
  echoLine('lyra','我签的附件里，停止权不能被覆盖。你没有送审这个版本。',{axis:'left'}),
  echoLine('ruby','两份签字都在。把完整文件校验出来，再讨论责任。'),
  echoLine('noct','保持两路读头稳定。断一次，校验就得重来。',{camera:'medium'})
 ];
 if(mid===4&&stage===1)return g?[
  echoLine('iris','第一路接上了。地面还没开机，却已经领到了试用许可。',{camera:'establish'}),
  echoLine('misa','两路读头一起稳定。只切一路，另一边会把它接回去。'),
  echoLine('sera','停止条件放在最前面。不要再当附件。',{axis:'left'})
 ]:[
  echoLine('lark','第一批补充夹具上线。封锁线也在往里收。',{camera:'establish'}),
  echoLine('psalm','不能只守着制造槽。他们在切返回路径。'),
  echoOrder('先拿下火线，才有地方接上行读头。',['lark','june','ruby'],{camera:'medium'})
 ];
 if(mid===4&&stage===2)return g?[
  echoLine('misa','外锁同步。剩下运动总线，得在核心旁边断。',{camera:'establish'}),
  echoLine('noct','红灯熄灭的间隙能接收停止电平。那个间隙，原本是留给患者的。'),
  echoProp('misa','先停掉它。原件照常保留。',['患者终止触点 / 已重接','近场操作 / 等待执行'])
 ]:[
  echoLine('psalm','外向频道还在封锁。我们需要一个能接受本站签名的终端。',{camera:'establish'}),
  echoLine('lark','拿下一路，接上读头。'),
  echoLine('june','我在记录。拿到通道，不等于可以改写经过。',{axis:'left'})
 ];
 if(mid===4&&stage===3)return g?[
  echoLine('misa','近场链切开了。外围夹具还有缓存，别贴着它们走。',{camera:'establish'}),
  echoOrder('守住读头。我去让制造槽停下来。',['akira','lyra','iris']),
  echoCard('生产核心 / 最后授权','UNLOCKED',['护盾 / 双终端持续维持','制造槽 / 仍在运转'],'核心不再拒绝停机。现在还差最后一步。',{scene:'reactor'})
 ]:[
  echoLine('psalm','上行同步锁住了。最后一段校验还在跑。',{camera:'establish'}),
  echoLine('june','原件、撤药表、控制表都在队列里。发什么，不能再交给默认值。'),
  echoOrder('等链路稳定。确认键留给我们自己。',['lark','psalm','june'],{camera:'medium'})
 ];
 return[echoOrder('链路状态改变。核对新的任务卡。',[],{camera:'establish'})];
}

function echoEndingInfo(){
 const people=Object.entries(C.roster).filter(([id,r])=>r.introduced&&r.status!=='destroyed'&&r.side===C.side),n=people.length;
 const choice=C.flags.disclosure||(C.side==='r'?(C.flags.mercy?'open':'command'):'sealed');
 if(C.side==='r')return choice==='open'?{title:'停止条件',code:'ENDING / THE STOP CONDITION',text:'上行队列发送了原件与撤药修复表，没有发送接管控制表。六个地面端必须重新取得患者确认。朔夜的修改记录与零音的签字都被保留；停机之后，仍有人需要回答问题。'}:{title:'默认继续',code:'ENDING / CONTINUE BY DEFAULT',text:'接管授权进入地面生产端。“停止”字段仍然为空。这一次，空白不是发布时的遗漏，而是发送前作出的选择。新的确认时间，也被霁川的取证程序写进了原件。'};
 if(n<=3)return{title:`返航确认：${n}人`,code:'ENDING / RETURN MANIFEST',text:`制造核心已经停机。战役内仅有${n}名机娘被确认仍属守护者且载体留存。其余个体的受控、未归队或永久损毁状态原样保留，没有统一改写成“任务完成”。${choice==='open'?'公开文件也没有删去这一页。':'这份名单与原件一起进入封存。'}`};
 if(choice==='open'&&C.flags.packetOwner==='g')return{title:'原件送达',code:'ENDING / ORIGINAL RECEIVED',text:'接驳原始包、医嘱回执、货签与签名页完成交叉校验。地面收到的是完整操作记录，不是设备故障摘要。调查正式接收材料；它没有因此承诺任何人会被原谅。'};
 if(choice==='open')return{title:'待补的七分钟',code:'ENDING / SEVEN MINUTES MISSING',text:'原件已公开，但接驳信使包没有由守护者带回。现场证词与可核验日志被分栏保存，缺失的七分钟没有用推测补齐。调查开始了；它需要继续，而不是提前宣布所有问题已经解决。'};
 return{title:'封存件第零号',code:'ENDING / SEALED COPY ZERO',text:'地面收到停机回执，原始记录暂时封存。回执上的“设备故障”没有得到所有人的签字。两份原件的校验值仍然相同；封存没有自动变成销毁，也没有替任何人结案。'};
}
function echoEndingFrames(){
 const g=C.side==='g',open=C.flags.disclosure==='open',end=echoEndingInfo();
 const lost=Object.entries(C.roster).filter(([id,r])=>r.status==='destroyed').map(([id])=>CHAR[id].name);
 if(!g&&!open)return[
  echoCard('地面生产端 / 发送确认','CONTINUE',['接管授权 / 已发送','患者终止 / 空字段','确认方式 / 主动提交'],'这一次，“继续”不是系统默认。',{scene:'reactor',sound:'latch'}),
  echoAlive('june')?echoLine('june','新文件存了两份。旧的也还在。',{scene:'archive',remote:true}):echoCard('自动取证程序 / 只写追加','APPENDED',['原始文件 / 保留','新授权 / 另建记录'],'新的发送时间已经写入原件。',{scene:'archive'}),
  echoProp('psalm','校验通过。',['GROUND LINK / 06 ONLINE','TREATMENT / CONTINUE'],{kind:'macro',scene:'reactor',caption:'生产回执 / 非人工语音',systemVoice:true,sound:'pulse'})
 ];
 if(!g)return[
  echoCard('地面生产端 / 文件收讫','RECEIVED',['撤药修复表 / 已发送','接管控制表 / 未发送','患者确认 / 待逐个校验'],'六个端口开始重新读取停止条件。',{scene:'station'}),
  echoAlive('noct')?echoLine('noct',C.flags.mercy?'我会说明每一条改过的分类。原件不用等我同意才公开。':'原件已在站外。我的修改记录也在。',{scene:'archive',remote:true}):echoCard('原件 / 签名页保留','NO REDACTION',['签发人 / 原样保留','缺席者 / 按实际状态记录'],'没有签名被替换成未知操作员。',{scene:'archive'}),
  echoAlive('psalm')?echoLine('psalm','降噪已经关了。现在，谁说停止，我们都要完整听完。',{scene:'garden',remote:true}):echoCard('校准记录 / 停止声道','STOP',['自动降噪 / 已关闭','患者终止 / 独立通道'],'停止请求不再被并入噪声。',{scene:'garden'}),
  echoCard('隔离门 / 独立解锁','OPEN',['自检码 / 两短，一长','门后信号 / 保留'],'两短，一长。随后，是门轴真正转动的声音。',{scene:'station',kind:'exit',sound:'knock'})
 ];
 return[
  echoCard(open?'地面接收回执 / 原件':'地面接收回执 / 封存','RECEIVED',[open?'提交类型 / 操作原件':'提交类型 / 停机摘要',C.flags.packetOwner==='g'?'接驳原始包 / 可核验':'接驳原始包 / 尚缺'],'第一份回覆不是慰问，是要求补交校验值。',{scene:'station'}),
  echoAlive('iris','g')?echoLine('iris',open?'两份原件都在。没有省略任何签字页。':'回执只写设备故障。我没有在这四个字下面签名。',{scene:'bridge',remote:true}):echoCard('离线审计副本 / 校验一致','COPY 02',['副本一 / 保留','副本二 / 保留'],'缺席者的取证记录没有被删除。',{scene:'bridge'}),
  echoAlive('lyra','g')?echoLine('lyra',open?'把我的停职申请附在后面。先交病人的记录。':'封存条款没有销毁授权。把这句也写进回执。',{scene:'station',remote:true}):echoCard('现场签发人 / 真实状态','ON RECORD',['签名页 / 保留','人员状态 / 按战役实况登记'],'未到场，不会被填写成免责。',{scene:'station'}),
  echoCard('回收清单 / 不省略空缺',lost.length?'INCOMPLETE':'CONFIRMED',[`永久损毁 / ${lost.join('、')||'无'}`,'受控与未归队 / 另栏保留'],lost.length?'回收单没有把这些名字折到背面。':'回收单逐项核对。没有用一个总数代替个体状态。',{scene:'station'}),
  echoCard('回收艇 / 舱门内侧','OPEN',['舱门 / 由内侧解锁','自检码 / 两短，一长'],'这一次，门由里面打开。',{scene:'station',kind:'exit',sound:'knock'})
 ];
}
