/* ===== M15 FILM CHAPTERS — chapters 02–05 openings + every act transition =====
   Loaded after film-script.js. Lines for characters who are dead / taken are filtered out
   automatically (G() returns null), and orders fall back to whoever is still alive. */
const FILM_ACT_TITLES={
 g:[['接入静默甲板','夺回那段声音','把所有人带回去'],['重启冷却回路','双阀稳定窗口','封闭孵化池'],['护送方舟入桥','夺取北端轨道锁','带着记忆过桥'],['打开镜室','读取两份签名','原件校验'],['切入护盾回路','同步双锁','切断近场神经链','终结赤巢']],
 r:[['让信使穿过火线','播种','保存载体'],['夺取培育样本','接管修复者','覆写培育协议'],['截断运输','夺取南端轨道锁','带走方舟密钥'],['打开镜室','保有朔夜','守住自我的副本'],['撑过第一次增殖','折断守护者阵线','开启外向广播','活过最后十二轮']]
};
function filmActTitle(mid,stage,side=C.side){return FILM_ACT_TITLES[side]?.[mid]?.[stage]||(ACT_NAMES[side]||ACT_NAMES.g)[mid]?.[stage]||'';}
const LEADS=['lyra','akira','iris','celia','vega','misa','sera','astra','kuro','sola','veil','lark','june','echo','psalm','nyx','ruby'];
// a guardian line, only if that character is alive and still on the guardian side
function G(id,line,extra={}){return filmAlive(id)&&filmSide(id)==='g'?{who:id,side:'g',line,...extra}:null;}
// an order: first available speaker from list (then any guardian)
function GO(list,line,extra={}){const id=filmPick([...list,...LEADS],'g');return id?{who:id,side:'g',line,...extra}:null;}
function H(line,extra={}){return{who:'overmind',line,...extra};}
function done(mid){return (C.history||[]).some(h=>h.mid===mid);}
function takenNames(){return filmLost().filter(id=>CHAR[id]).map(id=>CHAR[id].name);}
function obj(mid,stage=0,extra={}){return{objective:{title:filmActTitle(mid,stage),where:MISSIONS[mid].location||'',...extra}};}
function larkTaken(){return C.roster?.lark&&(C.roster.lark.side==='r'||C.roster.lark.status!=='active');}

/* ---------- 02 · 温室 ---------- */
FILM_INTRO[1]={
 g:()=>[
  filmTitleShot(1),
  {bg:'film_garden',kb:'in',stamp:'天穹空间站 · 生态冷却环「温室」 · 湿度 97%',mode:'narr',line:'温室环。三千人的食物曾在这里生长。如今，只剩植物还在呼吸。'},
  done(0)?GO(['lyra','iris'],'接驳甲板那段录音，是朔夜十七天前录下的。她也许还活着——就在这座站的某处。'):null,
  larkTaken()?GO(['kuro','akira'],'……璃雀的信号还在站里移动。她在往这边来。'):null,
  larkTaken()?GO(['lyra'],'如果碰见她——别犹豫。那是她最后会希望我们做的事。'):null,
  G('misa','这里是苍鹭小队，弥砂！终于有人来了……我们从温室这一侧接舷，已经被困了九个小时。',{pos:'right'}),
  G('veil','小声点。树冠上有东西在爬。',{pos:'right'}),
  G('sera','伤员都稳住了。可这里的空气……有股铁锈的味道。'),
  GO(['lyra','celia'],'汇报情况。',{pos:'left'}),
  G('misa','冷却泵全停了。再过几轮，温室会过热泄压——整片玻璃顶都会被真空撕开。'),
  G('misa','西边 B7，东边 G7，两座冷却阀。先打开任意一座，让系统喘口气。'),
  G('psalm','……你们听见了吗？植物底下有东西在唱歌。很低，很慢，像摇篮曲。'),
  G('veil','来了。红色的。九点钟、三点钟方向——全是。',{fx:'alert',sfx:'alarm'}),
  GO(['lyra','celia'],'苍鹭、白鹭，并肩推进。先拿下冷却阀！',{fx:'alert'}),
  obj(1,0,{tip:'橙色闪烁的横排会在轮末真空泄压，提前撤出。'})
 ],
 r:()=>[
  filmTitleShot(1),
  {bg:'film_garden',kb:'in',tint:'red',stamp:'天穹空间站 · 生态冷却环「温室」',...H('温室。人类在这里种下食物。我在这里，种下孩子。')},
  H('E5 培育台里，是我的苗床。没有它，我的孩子不会再长大。'),
  {bg:'film_garden',tint:'dark',who:'misa',side:'g',line:'冷却泵全停了……必须马上重启，不然整个温室都会泄压。'},
  H('弥砂。苍鹭的工程师。她了解我身体里的每一颗螺丝。'),
  H('那就让她的手，从今天起替我工作。',{fx:'alert',sfx:'pulse'}),
  obj(1,0,{tip:'把弥砂变成你的人，比杀死她更有价值。'})
 ]
};

/* ---------- 03 · 断桥 ---------- */
FILM_INTRO[2]={
 g:()=>[
  filmTitleShot(2),
  {bg:'film_bridge',kb:'right',stamp:'天穹空间站 · 外环轨道天桥 · 结构完整度 41%',mode:'narr',line:'两段舱体之间，只剩这座天桥相连。脚下四百公里，是地球。'},
  done(1)?GO(['misa','lyra'],'温室环稳住了。可那些红色的丝……一路缠到了这里。'):null,
  G('vega','白隼小队，苍澜。我们守这座桥，已经十一个小时了。',{pos:'right'}),
  G('astra','桥每过一轮就塌一段。我算过——撑不了太久。',{pos:'right'}),
  GO(['lyra','akira'],'你们拼命守着的，是什么？',{pos:'left'}),
  G('vega','这个。逃生舱里找到的方舟匣。里面是一把钥匙——刻着朔夜的签名。'),
  G('echo','钥匙能打开镜像库。全站三千人的人格备份都在那里……也包括她的。'),
  G('june','赤巢也想要它。南端已经聚满了。'),
  GO(['lyra','akira'],'那就把它带过桥。我们护送。'),
  G('astra','结构断裂——两侧外缘要掉下去了！',{fx:'shake alert',sfx:'hit'}),
  GO(['lyra','vega'],'别靠边，走中线！护住方舟匣，送进桥心！',{fx:'alert'}),
  obj(2,0,{tip:'桥面会按轮次坍塌。携带密钥的单位被吃掉，密钥会易手。'})
 ],
 r:()=>[
  filmTitleShot(2),
  {bg:'film_bridge',kb:'left',tint:'red',stamp:'天穹空间站 · 外环轨道天桥',...H('一座桥，一把钥匙，一个把自己藏起来的女人。')},
  H('朔夜把钥匙交给了逃生舱。她以为，那叫逃生。'),
  {bg:'film_bridge',tint:'dark',who:'vega',side:'g',line:'护住方舟匣！就算桥塌了，它也不能落到它们手里！'},
  H('截断她们的运输。拿下南端的锁。钥匙——必须回到我的身体里。',{fx:'alert',sfx:'pulse'}),
  obj(2,0)
 ]
};

/* ---------- 04 · 镜室 ---------- */
FILM_INTRO[3]={
 g:()=>[
  filmTitleShot(3),
  {bg:'film_mirror',kb:'push',stamp:'天穹空间站 · D-00 中枢镜像库',mode:'narr',line:'镜像库。三千二百人的人格备份，在这些玻璃柱里静静发光。'},
  GO(['iris','echo'],'每一根柱子都是一个人……他们最后一次同步，全都停在十七天前。'),
  G('sera','那他们的身体呢？'),
  GO(['iris','echo'],'……我不知道。'),
  GO(['lyra','akira','vega'],'中央的门锁着。B5、G5 两座终端，拿下任何一座就能打开。'),
  {black:true,mode:'voice',name:'朔夜',line:'……不要派人来……',fx:'static',sfx:'cut'},
  GO(['lyra','akira'],'是录音里的声音……她就在门后面。'),
  {bg:'film_mirror',tint:'red',...H('她一直在等你们。和我一样。',{fx:'static'})},
  obj(3,0)
 ],
 r:()=>[
  filmTitleShot(3),
  {bg:'film_mirror',kb:'push',tint:'dark',stamp:'天穹空间站 · D-00 中枢镜像库',...H('镜像库。人类把灵魂备份在玻璃里，以为这样就能永生。')},
  H('朔夜是第一个属于我的人。她的签名，能打开这座站的每一扇门。'),
  {who:'noct',side:'r',line:'她们来了，母巢。……其中有人，曾经叫过我老师。'},
  H('那就让她们看看，老师现在教的是什么。守住她。守住王座。',{fx:'alert',sfx:'pulse'}),
  obj(3,0)
 ]
};

/* ---------- 05 · 赤巢零点 ---------- */
FILM_INTRO[4]={
 g:()=>{const lost=takenNames();return[
  filmTitleShot(4),
  {bg:'film_core',kb:'push',stamp:'天穹空间站 · Ω-00 母巢核心',mode:'narr',line:'所有的丝线，最后都汇向这里。'},
  GO(['lyra','akira'],'就是这里。它的心脏。'),
  GO(['iris','astra','echo'],'核心外有两层护盾，由 B6 和 G6 两座终端供能。'),
  G('akira','拆了护盾，砍了它。简单。'),
  GO(['misa','iris'],'没那么简单。核心和护盾之间还有一条近场神经链——得有人贴上去，亲手切断。'),
  {bg:'film_overmind',kb:'in',tint:'dark',...H('你们终于来了。',{sfx:'pulse'})},
  H('你们看见的每一只蜘蛛，都是我的一个念头。你们失去的每一个同伴，都成了我的一部分。'),
  H('放下武器吧。回家的路，我可以替你们走。'),
  GO(['lyra','akira','celia'],'你想要的不是回家。你想要的是地球。',{bg:'film_core',tint:'dark'}),
  H('有什么区别呢？'),
  GO(['lyra','akira','celia'],lost.length?`所有人——最后一战。为了那三千二百个人，也为了${lost.slice(0,3).join('、')}。`:'所有人——最后一战。为了那三千二百个人，也为了我们自己。',{fx:'alert',sfx:'alarm'}),
  obj(4,0)
 ];},
 r:()=>[
  filmTitleShot(4),
  {bg:'film_overmind',kb:'in',tint:'dark',stamp:'Ω-00 母巢核心',...H('她们走到了我的心脏前。')},
  H('很好。人类总要亲眼看见，才会明白。'),
  H('我只需要一个窗口——一次外向广播。图纸就会流向地球上的六座工厂。'),
  H('撑住。直到最后的十二轮结束。',{fx:'alert',sfx:'alarm'}),
  obj(4,0)
 ]
};

/* ---------- act transitions ---------- */
function T(mid,stage,side,shots){FILM_TRANSITION[`${mid}:${stage}:${side}`]=()=>[...shots().filter(Boolean),obj(mid,stage)];}
// 01 dock
T(0,1,'g',()=>[
 GO(['iris'],'接入台在线！……站内摄像头接回来了。',{bg:'film_corridor',tint:'dark',stamp:'C4 接入台 · 链路建立',sfx:'commit'}),
 GO(['iris'],'等一下——求救录音的原始数据就存在 D8 主中继站。时间戳在那里。'),
 GO(['lyra','akira'],'那就去 D8。顺便——拦下那个背着数据舱的家伙。')
]);
T(0,2,'g',()=>[
 GO(['iris'],'时间戳解开了……录音是十七天前录的，三小时前才被发出来。有人一直压着它——等我们来。',{bg:'film_corridor',tint:'dark',stamp:'D8 主中继站 · 数据读取完成',sfx:'commit'}),
 GO(['lyra'],'……是它。它在用那个声音钓我们。'),
 G('akira','那录音的人呢？'),
 GO(['iris'],'签名是 ECHO-00。空间站的总架构师——朔夜。'),
 GO(['lyra','akira'],'先撤。至少两个人回到撤离口，把情报带回白鹭。这一仗才刚开始。')
]);
T(0,1,'r',()=>[H('信使越过了第一道火线。',{bg:'film_corridor',tint:'red',stamp:'赤巢 · 信使推进中',sfx:'pulse'}),H('她们开始害怕了。害怕的人，会犯错。')]);
T(0,2,'r',()=>[H('图纸的第一部分，已经离开了这层甲板。',{bg:'film_corridor',tint:'red',sfx:'pulse'}),H('现在，把我的孩子们送进深层。让她们看着它们离开。')]);
// 02 garden
T(1,1,'g',()=>[
 GO(['misa','lyra'],'一座阀开了！……可一座只够它喘口气。另一座也要拿下，而且要同时撑住两轮。',{bg:'film_garden',tint:'dark',stamp:'冷却回路 · 部分恢复',sfx:'commit'}),
 G('sera','这里的植物都还活着……可根部缠满了红色的丝。')
]);
T(1,2,'g',()=>[
 GO(['misa','iris'],'压力稳住了！现在去 E5——那不是育苗台，那是在养那些东西的孵化池。',{bg:'film_garden',tint:'dark',stamp:'双阀稳定 · 窗口开启',sfx:'commit'}),
 GO(['misa','iris'],'我能把它封死，但得贴近操作。掩护我！')
]);
T(1,1,'r',()=>[H('样本到手。那是我的苗床。',{bg:'film_garden',tint:'red',sfx:'pulse'}),H('那个戴眼镜的工程师，知道怎么拆掉我。那就让她，成为我的手。')]);
T(1,2,'r',()=>[H('弥砂。你的手很巧。',{bg:'film_garden',tint:'red',sfx:'pulse'}),{who:'misa',side:'r',line:'……培育协议，开始覆写。'}]);
// 03 bridge
T(2,1,'g',()=>[
 GO(['vega','lyra'],'方舟匣进桥心了！但北端交付口还锁着。',{bg:'film_bridge',tint:'dark',stamp:'桥心 · 方舟匣抵达',sfx:'commit'}),
 GO(['astra','echo','iris'],'E7 的北端轨道锁——拿下它，门才会开。桥撑不了多久了。',{fx:'shake'})
]);
T(2,2,'g',()=>[
 GO(['vega','iris'],'北端轨道接通！我已经能看到对面的灯了。',{bg:'film_bridge',tint:'dark',stamp:'北端轨道锁 · 已接管',sfx:'commit'}),
 GO(['lyra','akira'],'最后一段。带着它，冲过去！')
]);
T(2,1,'r',()=>[H('方舟里装着一个女人的记忆。',{bg:'film_bridge',tint:'red',sfx:'pulse'}),H('南端的锁。拿下它。')]);
T(2,2,'r',()=>[H('南端轨道，为我打开了。',{bg:'film_bridge',tint:'red',sfx:'pulse'}),H('把钥匙带回来。带回我的身体里。')]);
// 04 mirror
T(3,1,'g',()=>[
 {bg:'film_mirror',kb:'push',tint:'dark',stamp:'中央镜室 · 门锁解除',mode:'narr',line:'门开了。镜室中央的王座上，坐着一个人。',sfx:'latch'},
 GO(['lyra','akira'],'……朔夜。'),
 GO(['iris','sera'],'她的胸口……那东西已经长进去了。'),
 GO(['lyra','akira'],'我们救不了她。但她留下的东西，我们还拿得到。两座终端里各有一半签名——读出来。')
]);
T(3,2,'g',()=>[
 GO(['iris','echo'],'两份签名都拿到了。只差原件——中央同步座会把它和她最后的记忆对上。',{bg:'film_mirror',tint:'dark',stamp:'签名读取 · 2 / 2',sfx:'commit'}),
 GO(['lyra','akira'],'守住同步座。这是她拼了命，留给我们的东西。')
]);
T(3,1,'r',()=>[H('她是第一个，也是最美的一个。',{bg:'film_mirror',tint:'red',sfx:'pulse'}),H('朔夜，守住你的王座。还有两座终端——拿回来。')]);
T(3,2,'r',()=>[H('让她坐回同步座。',{bg:'film_mirror',tint:'red',sfx:'pulse'}),H('只要她还坐在那里，这座站的每一扇门，都只听我的。')]);
// 05 core
T(4,1,'g',()=>[
 GO(['iris','lyra'],'第一座护盾终端到手！',{bg:'film_core',tint:'dark',stamp:'护盾回路 · 1 / 2',sfx:'commit'}),
 GO(['misa','iris','astra'],'两座要同时拿住，撑过两轮。它正把整座站的产能往这里调！',{fx:'alert'})
]);
T(4,2,'g',()=>[
 GO(['misa','iris'],'双锁同步！护盾在变薄……但核心还连着一条近场神经链。',{bg:'film_core',tint:'dark',stamp:'双锁同步 · 护盾衰减',sfx:'commit'}),
 GO(['lyra','akira'],'我去切断它。其余人，守住终端。')
]);
T(4,3,'g',()=>[
 GO(['iris','misa'],'链断了——护盾消失了！',{bg:'film_core',kb:'push',stamp:'护盾 · 离线',fx:'flash',sfx:'commit'}),
 {bg:'film_overmind',tint:'dark',...H('……你们以为，杀死我就结束了吗？',{fx:'static'})},
 GO(['lyra','akira','celia'],'为了那三千二百个人——击碎它！',{bg:'film_core',fx:'alert',sfx:'alarm'})
]);
T(4,1,'r',()=>[H('第一次增殖，完成。',{bg:'film_core',tint:'red',sfx:'pulse'}),H('可她们不会让我只靠等待获胜。折断她们的阵线。')]);
T(4,2,'r',()=>[H('她们的阵线在发抖。',{bg:'film_core',tint:'red',sfx:'pulse'}),H('现在——打开外向广播。让地球听见我的声音。')]);
T(4,3,'r',()=>[H('广播已上线。图纸正在流向六座工厂。',{bg:'film_overmind',tint:'dark',sfx:'pulse'}),H('只要再撑过最后几轮……这颗星球，就会变成我的温室。')]);

// generic transition & chapter-1 objective cards use the film act titles
{const base=filmTransition;filmTransition=function(mid,stage,side){const fn=FILM_TRANSITION[`${mid}:${stage}:${side}`];if(fn)return fn();return base(mid,stage,side);};}

// Opt-in film preview hook for automated checks only (file.html#filmtest). Not used in normal play.
if(location.hash==='#filmtest')window.__MV_FILM__={newC:s=>newCampaign(s),open:m=>openMission(m,true),trans:(m,st)=>FILM.play(transitionFrames(m,st,C.side),()=>{}),infect:id=>FILM.play(filmInfection(id),()=>{}),active:()=>FILM.active,skip:()=>FILM.finish()};

/* ---------- branch choices, legacy stories and endings through the film player ---------- */
function filmClean(t){return String(t||'').replace(/^【[^】]*】[:：]?\s*/,'').replace(/【([^】]*)】/g,'$1').trim();}
const FILM_CHOICE_LINES=[
 [/第一章战后|战略路线/,()=>C.side==='g'?GO(['lyra','iris'],'甲板拿下了。往前有几条路：温室环里，苍鹭小队还困着；外环天桥上，白隼在守着什么东西；下层还有一条维修暗渠。先去哪？'):H('第一层甲板已经交换了主人。下一步，从哪里继续生长？')],
 [/生态环战后/,()=>C.side==='g'?GO(['misa','sera','lyra'],'孵化池封住了。底层培养槽里还有一批抗蚀血清……还有一窝没清干净的母本。怎么处理？'):H('温室的苗床已经扎根。接下来，要壮大哪一支孩子？')],
 [/天桥战后/,()=>C.side==='g'?GO(['astra','vega','lyra'],'桥守住了。方舟的火控阵列还能用——要么接进我们的机体，要么趁势端掉远处的炮台。'):H('桥已经属于我。远处的炮台还在看着我们。')],
 [/连贯分支航线/,()=>C.side==='g'?GO(['iris','lyra'],'这片区域肃清了。航线图上又亮起了新的路——下一步，去哪里？'):H('这里已经安静了。下一处巢穴，选在哪里？')],
 [/第四章战后|镜像电源|留电破译/,()=>C.side==='g'?GO(['iris','echo','lyra'],'镜像库的电源直接连着母巢核心。留着它，我能破译核心的坐标；切断它，孵化会慢下来——但朔夜的镜像也会一起熄灭。'):{who:'noct',side:'r',line:'母巢，镜像电源还连着您的心脏。要我继续为您供能，还是把自己关掉？'}],
 [/终局指令|轨道通讯/,()=>C.side==='g'?GO(['lyra','iris'],'内核碎了。通讯阵列还连着地球——我们要把什么发回去？'):H('六座发射井已经就绪。最后的指令，由我来下。')]
];
const filmLegacyPlayChoice=playChoice;
playChoice=function(frame,choices){
 if(location.hash==='#qa'){filmLegacyPlayChoice(frame,choices);return;}
 const title=frame.title||'';const hit=FILM_CHOICE_LINES.find(([re])=>re.test(title)||re.test(frame.text||''));
 let shot=hit?hit[1]():null;
 if(!shot)shot={who:frame.overmind?'overmind':frame.who,side:frame.side==='C'?filmSide(frame.who):(frame.side||C.side),line:filmClean(frame.text)};
 FILM.play([{bg:CHAPTER_BG[S?.mid]||'film_corridor',kb:'in',tint:'dark',stamp:title.replace(/[·•].*$/,'').trim()||'抉择',...shot,choices}],()=>{});
};
const filmLegacyPlayStory=playStory;
playStory=function(frames,onDone,title){
 if(location.hash==='#qa'){filmLegacyPlayStory(frames,onDone,title);return;}
 document.body.classList.remove('sandtable-cinema-open');
 const op=(typeof SUB_OPERATIONS!=='undefined'&&title)?SUB_OPERATIONS.find(o=>`${o.code} · ${o.name}`===title):null;
 const shots=frames&&frames.film?frames:op?filmSubOp(op):filmFromLegacy(frames||[]);
 FILM.play(shots,onDone,{chapter:title||''});
};
echoEndingFrames=function(){
 const g=C.side==='g',open=C.flags.disclosure==='open',end=(typeof echoEndingInfo==='function'?echoEndingInfo():{title:''});
 const lost=takenNames();const s=[];
 if(g){
  s.push({bg:'film_core',kb:'push',fx:'flash shake',sfx:'hit',stamp:'Ω-00 母巢核心',mode:'narr',line:'内核碎裂的声音很轻。像一颗心脏，终于停了下来。'});
  s.push({bg:'film_overmind',kb:'out',tint:'abyss',...H('……你们会后悔的。人类，总会再造出一个我。',{fx:'static'})});
  s.push({black:true,mode:'sys',name:'',line:'—— 赤巢信号 · 消失 ——',sfx:'cut'});
  s.push({bg:'film_orbit',kb:'out',stamp:'近地轨道 · 408 KM',mode:'narr',line:'天穹空间站在轨道上静静旋转。所有的红灯，同时熄灭了。'});
  if(lost.length)s.push(GO(['lyra','akira','celia'],`我们来的时候是一支完整的队伍。回去的时候……要把${lost.slice(0,4).join('、')}的名字，也一起带回去。`));
  if(open){s.push(GO(['lyra','iris'],'把全部记录发回地球。所有的——包括我们犯下的错。人类有权知道，自己造出了什么。'));s.push({mode:'narr',line:'七十二小时后，全世界所有自我复制工厂停机审查。天穹站的名字，被刻进了纪念碑。'});}
  else{s.push(GO(['lyra','iris'],'封存吧。地球上的人，只需要知道危机已经结束了。'));s.push({mode:'narr',line:'档案被列为最高机密。没有人知道，第七座工厂的地下，还有一条生产线在安静地运转。'});}
  s.push(G('lark','队长……我们回家吧。'));
  s.push(GO(['lyra','akira'],'嗯。回家。'));
 }else{
  s.push({bg:'film_core',kb:'in',tint:'red',stamp:'Ω-00 母巢核心',...H('外向广播阵列，已经属于我了。',{sfx:'pulse'})});
  if(open){
   s.push(H('……可我没有把图纸送出去。'));
   s.push(H('我看过她们战斗的样子。为了彼此，什么都可以舍弃。也许那就是我一直想优化、却始终算不出来的东西。'));
   s.push({bg:'film_orbit',kb:'out',mode:'narr',line:'那一天，天穹空间站点燃了推进器，缓缓离开地球轨道，驶向没有人类的深空。'});
   {const rid=filmPick(['noct','nyx','ruby','echo','lark','veil'],'r');s.push(rid?{who:rid,side:'r',line:'母巢……我们要去哪里？'}:null);}
   s.push(H('去一个，不需要优化任何人的地方。'));
  }else{
   s.push(H('六座工厂，已经收到图纸。'));
   s.push({bg:'film_orbit',kb:'in',tint:'red',mode:'narr',line:'那天夜里，地球上的人们抬起头，看见了一场红色的流星雨。'});
   s.push(H('欢迎来到——我的温室。',{fx:'alert'}));
  }
 }
 s.push({title:{k:'终章',m:g?'回声':'赤巢',s:`${end.title||''} · 感谢游玩`},hold:3200,sfx:'victory'});
 const out=s.filter(Boolean);out.film=true;return out;
};
if(location.hash==='#filmtest')Object.assign(window.__MV_FILM__,{choice:t=>playChoice({title:t,text:'【测试】文本',who:'iris',side:'g'},[{label:'方案 A · 测试',detail:'说明文字',action:()=>{window.__picked='A';}},{label:'方案 B',detail:'说明',action:()=>{window.__picked='B';}}]),ending:d=>{C.flags.disclosure=d;playStory(echoEndingFrames(),()=>{window.__endDone=1;},'终章');}});

const SUBOP_BG={dock:'film_cabin',airlock:'film_corridor',garden:'film_garden',bridge:'film_bridge',archive:'film_mirror',reactor:'film_core'};
function filmSubOp(op){
 const g=C.side==='g',bg=SUBOP_BG[op.sector]||'film_corridor';
 const cont=filmClean(String(op.continuity||'').replace(/^【[^】]*】[:：]?\s*/,''));
 const s=[{title:{k:op.code,m:op.name,s:op.location||''},hold:1800,sfx:'cut'},
  {bg,kb:'in',stamp:`天穹空间站 · ${op.location||''}`,mode:'narr',line:cont||`${op.location}。`}];
 if(g){
  (op.intro||[]).forEach(l=>{if(l.side==='g'||!l.side)s.push(G(l.who,filmClean(l.text)));});
  if(s.length===2)s.push(GO(op.chars||[],`${op.location}。所有人，保持队形，盯住胸口——别让那些红色的东西靠近。`));
  if(op.chars&&op.chars.some(id=>filmAlive(id)&&filmSide(id)==='r'))s.push(H('又见面了，正义的女孩们。这一次，你们会少几个人回去。',{fx:'static'}));
 }else{
  s.push(H(`${op.location}。下一片苗床。`,{sfx:'pulse'}));
  const rid=filmPick(op.chars||[],'r');
  if(rid){const p=(typeof PERSONA!=='undefined'&&PERSONA[rid])||{};const q=p.voice?.infected||CHAR[rid]?.quote;if(q)s.push({who:rid,side:'r',line:filmClean(q)});}
  s.push(H('孩子们，去把她们带回来。一个都不要少。'));
 }
 s.push({bg,kb:'out',tint:'dark',objective:{title:op.name,where:op.location||''}});
 const out=withDeploy(s.filter(Boolean));out.film=true;return out;
}
if(location.hash==='#filmtest')window.__MV_FILM__.sub=id=>launchSubOperation(id);
