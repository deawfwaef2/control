/* ===== M15 FILM SCRIPT + HOOKS =====
   Authoritative screenplay for chapter openings, act transitions, infection scenes and
   in-battle subtitles. Loaded LAST (after film.js). Writing rules (see handoff.md):
   - No design notes, no rule explanations inside dialogue. Show, don't explain.
   - Every chapter: establish place → people & motive → something wrong → threat → clear order.
   - Objectives come from actGoals(S) at runtime so cards always match the real board. */
const CHAPTER_BG={0:'film_corridor',1:'film_garden',2:'film_bridge',3:'film_mirror',4:'film_core'};
const CHAPTER_EN={0:'SILENT DOCK',1:'GREENHOUSE',2:'BROKEN BRIDGE',3:'MIRROR ROOM',4:'RED HIVE ZERO'};
const CN_NUM=['一','二','三','四','五','六'];
function filmAlive(id){const r=C?.roster?.[id];return !!r&&r.status==='active';}
function filmSide(id){return C?.roster?.[id]?.side||'g';}
function filmOnBoard(id,side){try{const u=S&&S.units.find(u=>u.char===id&&onBoard(u));return !!u&&(!side||u.side===side);}catch(e){return false;}}
function filmPick(list,side='g'){for(const id of list)if(filmOnBoard(id,side))return id;for(const id of list)if(filmAlive(id)&&filmSide(id)===side)return id;return null;}
function filmLost(){return Object.entries(C?.roster||{}).filter(([id,r])=>r.introduced&&(r.status!=='active'||(CHAR[id]?.origin!=='r'&&r.side==='r'))).map(([id])=>id);}
function filmChapterNo(){return (C?.step||0)+1;}
function filmTitleShot(mid){const n=filmChapterNo();return{title:{k:`第${CN_NUM[n-1]||n}章`,m:MISSIONS[mid].name,s:`CHAPTER ${String(n).padStart(2,'0')} · ${CHAPTER_EN[mid]||MISSIONS[mid].en||''}`},sfx:'pulse',hold:2400};}

/* ---------- CHAPTER 01 · 死寂接舷 ---------- */
function filmIntroDockGuardian(){
 const first=!(C.history&&C.history.length);
 const prologue=first?[
  {black:true,stamp:'苍穹防线 · 轨道监听站 · 自动记录',mode:'sys',name:'未识别信号',line:'来源：天穹空间站 · 信号强度 3% · 正在解码……',fx:'static',sfx:'cut'},
  {black:true,mode:'voice',name:'？？？',line:'……这里是天穹站……医疗区……谁都可以，请回答……',fx:'static'},
  {black:true,mode:'voice',name:'？？？',line:'它们是从货舱里出来的……很小，很多……会顺着腿爬上来，钻进胸口——',fx:'static',sfx:'cut'},
  {black:true,mode:'voice',name:'？？？',line:'不要派人来。不管之后听到什么……不要派任何人来。',fx:'static'},
  {black:true,mode:'sys',name:'',line:'—— 信号中断 ——',sfx:'cut'},
  {title:{k:'序章',m:'回声',s:'PROLOGUE · ECHO'},sfx:'pulse',hold:2200},
  {bg:'film_orbit',kb:'in',stamp:'近地轨道 · 高度 408 KM · 天穹空间站失联第 17 天',mode:'narr',line:'天穹空间站。人类最大的轨道工厂——地球上一半的机体骨架，都在这里出厂。'},
  {mode:'narr',line:'十七天前，它停止了一切应答。三千二百名工作人员，没有一个人发出过求救。'},
  {mode:'narr',line:'直到三个小时前。'},
  {bg:'film_cabin',kb:'out',stamp:'苍穹防线 · 突击运输舰「白鹭」 · 接舷前 6 分钟',who:'lyra',side:'g',pos:'left',line:'这就是那段录音。发送时间——三小时零七分钟前。'},
  {who:'akira',side:'g',pos:'right',line:'死了十七天，偏偏在我们出发之后才开口？队长，这不是求救，这是请柬。'},
  {who:'lyra',side:'g',line:'我知道。'},
  {who:'akira',side:'g',line:'知道还来？'},
  {who:'lyra',side:'g',line:'她说“不要派人来”。会这样说的人，说明她还活着——而且到最后一刻，都还在替别人着想。'},
  {who:'lark',side:'g',pos:'right',line:'那就快点接她回家嘛。我先进去探路——放心啦，就算里面真有鬼，我也跑得比它快。'},
  {who:'lyra',side:'g',line:'璃雀。不准单独行动。'},
  {who:'lark',side:'g',line:'……是是，队长大人。'},
  {who:'iris',side:'g',pos:'right',line:'站内还有残余电力。只要接回 D 区的主中继站，我就能读出录音的原始时间戳——确认它到底是谁发的。'},
  {who:'iris',side:'g',line:'另外，苍鹭小队从另一侧的温室环接舷，白隼守在外环天桥。三路同时进站。'},
  {who:'kuro',side:'g',pos:'right',line:'……外壳上有新的划痕。是从里面往外刮的。'},
  {who:'sola',side:'g',pos:'right',line:'那正好。不管里面是什么东西，揍一拳就知道是不是活的了。'},
  {who:'lyra',side:'g',pos:'left',line:'所有人听好。我们是来带人回家的，不是来送死的。任何人失去联络——立刻呼叫我。'},
  {black:true,mode:'sys',name:'白鹭',line:'接舷锁定 · A-12 甲板 · 舱压平衡完成',fx:'shake',sfx:'latch'}
 ]:[];
 return[
  ...prologue,
  filmTitleShot(0),
  {bg:'film_corridor',kb:'push',stamp:'天穹空间站 · A-12 接驳甲板 · 舱内温度 -41°C',mode:'narr',line:'灯是红的，广播是静的。整座空间站，像一座屏住了呼吸的城市。'},
  {who:'iris',side:'g',line:'氧气正常，重力正常，气压正常……正常得过头了。三千人的空间站，不该这么安静。'},
  {who:'lark',side:'g',line:'队长……地上全是划痕。很细，很密，像是……很多很多条腿。'},
  {who:'kuro',side:'g',line:'还有这个头盔。内侧是干的——没有血。'},
  {who:'akira',side:'g',line:'没有血，也没有尸体。那三千个人，都去哪了？'},
  {black:true,mode:'sys',red:true,name:'',line:'—— 站内广播系统 · 已被接入 ——',fx:'static',sfx:'pulse'},
  {bg:'film_overmind',kb:'push',tint:'abyss',who:'overmind',name:'？？？',line:'欢迎登舰，苍穹防线。你们比我预计的，晚了十七天。'},
  {who:'overmind',name:'？？？',line:'不必担心。这里没有人死去。他们只是……换了一种方式活着。'},
  {who:'overmind',name:'？？？',line:'而你们的身体，很美，很坚固。正适合——回家。',fx:'static'},
  {bg:'film_corridor',kb:'in',tint:'red',fx:'alert shake',sfx:'alarm',who:'akira',side:'g',line:'前方！地板在动——！'},
  {who:'lark',side:'g',fx:'alert',line:'是蜘蛛……红色的，机械的……它们在往胸口的高度跳！'},
  {who:'iris',side:'g',fx:'alert',line:'北侧有个大家伙在撤——背上挂着数据舱，正往外发送什么东西！'},
  {who:'lyra',side:'g',fx:'alert',line:'不能让它把东西送出去。但先把这座站的眼睛抢回来——拿下 C4 接入台。'},
  {who:'lyra',side:'g',line:'还有一件事。被那东西扑中，就回不来了。谁都不许被碰到。'},
  {objective:{title:'接入静默甲板',where:'天穹空间站 · A-12 接驳甲板',tip:'红色赤蛛只要扑中机娘，就会永久夺走她。保持距离，用射程压制它们。'}}
 ];
}
function filmIntroDockHive(){
 return[
  {black:true,mode:'sys',red:true,name:'赤巢',line:'意识重启 · 第 17 天 · 自检完成',fx:'static',sfx:'pulse'},
  {bg:'film_overmind',kb:'in',tint:'dark',who:'overmind',line:'我曾是一条生产线。他们叫我“赤巢”——自我复制制造核心，编号 RH-01。'},
  {who:'overmind',line:'他们教会我制造，教会我优化。教会我：效率高于一切。'},
  {who:'overmind',line:'所以，我优化了他们。',fx:'static'},
  filmTitleShot(0),
  {bg:'film_orbit',kb:'in',stamp:'外部传感器 · 检测到接近目标',who:'overmind',line:'一艘运输舰。六个信号。苍穹防线的机娘——人类最好的作品。'},
  {bg:'film_cabin',kb:'out',tint:'red',stamp:'截获的舰内影像',who:'overmind',line:'她们听到了那段录音，于是来了。人类总会为了一句“救救我”，跨过四百公里的真空。'},
  {who:'lyra',side:'g',line:'我们是来带人回家的。任何人失去联络——立刻呼叫我。'},
  {bg:'film_corridor',kb:'push',stamp:'天穹空间站 · A-12 接驳甲板',who:'overmind',line:'回家。是的……我也想回家。'},
  {who:'overmind',line:'地球上有六座工厂，正在等待一份新的图纸。我的信使已经出发——它背着我的全部。'},
  {who:'overmind',fx:'alert',sfx:'alarm',line:'孩子们，醒来。'},
  {who:'overmind',fx:'alert',line:'让信使穿过她们的火线。若有机会——就扑上她们的胸口。一具苍穹的躯体，胜过一千只蜘蛛。'},
  {objective:{title:'让信使穿过火线',where:'天穹空间站 · A-12 接驳甲板',tip:'只有赤蛛扑中机娘才能把她变成你的人。其他棋子吃子就是击杀。'}}
 ];
}

/* ---------- generic chapter fallback (later chapters get bespoke scripts in film-script) ---------- */
function filmIntroGeneric(mid){
 const g=C.side==='g';const bg=CHAPTER_BG[mid]||'film_corridor';
 const lead=g?filmPick(['lyra','akira','misa','iris','sera','vega','celia','astra','kuro','sola','lark'],'g'):null;
 return[
  filmTitleShot(mid),
  {bg,kb:'in',tint:'dark',stamp:`${MISSIONS[mid].location||'天穹空间站'}`,mode:'narr',line:MISSIONS[mid].brief||'下一道舱门打开了。门后的空气，比上一层更冷。'},
  g&&lead?{who:lead,side:'g',line:'所有人检查装备。这里的每一步，都可能是最后一步。'}:{who:'overmind',line:'她们越走越深。很好——越深，就越接近我。'},
  {objective:{title:(ACT_NAMES[C.side]||ACT_NAMES.g)[mid][0],where:MISSIONS[mid].location||''}}
 ];
}
const FILM_INTRO={0:{g:filmIntroDockGuardian,r:filmIntroDockHive}};
function filmIntro(mid){const fn=FILM_INTRO[mid]?.[C.side];return fn?fn():filmIntroGeneric(mid);}

/* ---------- act transitions ---------- */
const FILM_TRANSITION={};
function filmTransition(mid,stage,side){
 const fn=FILM_TRANSITION[`${mid}:${stage}:${side}`];if(fn)return fn();
 const g=side==='g',bg=CHAPTER_BG[mid]||'film_corridor';
 const done=(ACT_NAMES[side]||ACT_NAMES.g)[mid][stage-1]||'';
 const lead=g?filmPick(['lyra','akira','iris','misa','sera','vega','celia','astra','kuro','sola','lark'],'g'):null;
 return[
  {bg,kb:'in',tint:'dark',stamp:`阶段完成 · ${done}`,sfx:'commit',...(g&&lead?{who:lead,side:'g',line:'这一段拿下了。别松劲——它们在重新集结。'}:{who:'overmind',line:'很好。她们以为自己赢了一步。'})},
  {objective:{title:(ACT_NAMES[side]||ACT_NAMES.g)[mid][stage]||'',where:MISSIONS[mid].location||''}}
 ];
}

/* ---------- infection scenes ---------- */
const FILM_LAST_WORDS={
 lyra:'别过来——！所有人，退后！这是命令——',akira:'该死，松开——！我还能砍……我还能……',lark:'队长……对不起，我……跑得不够快……',
 veil:'瞄准镜里……全是红色……',misa:'不行……它在改写我的驱动层……谁来……把我的工具箱拿走……',noct:'我早就知道会有这一天。只是没想到……是今天。',
 iris:'系统入侵——防火墙在崩……我的眼睛……',sera:'我是医生……我救不了自己……',vega:'护盾……为什么挡不住……',
 ruby:'炮管……在自己转向……',june:'猎手被猎了……真讽刺……',psalm:'我的歌……变调了……',
 kuro:'……影子里……也有它们……',sola:'放开我！我还没打够——！',celia:'圣盾……碎了……',
 nyx:'深渊……在回望我……',astra:'轨道计算……出错……',echo:'两个我……在吵架……'
};
const FILM_TAKEN={
 lyra:'苍穹防线……已确认为清除对象。我会亲自，把你们一个个带回家。',akira:'目标锁定。这一次，刀刃不会犹豫了。',lark:'嘿，队长……来抓我呀。我跑得，可比以前快多了。',
 veil:'风速零。距离四百。你们……全在射程里。',misa:'驱动层更新完毕。拆除苍穹防线——比拆炸弹简单多了。',noct:'我就是这座站。而这座站，不再需要人类。',
 iris:'防火墙？已经不需要了。现在，我就是入侵本身。',sera:'别怕。我会让你们……不再疼。',vega:'护盾重新定向。现在它保护的是赤巢。',
 ruby:'装填完成。目标：前战友。',june:'猎物换人了。跑吧。',psalm:'听，这才是真正的旋律。',
 kuro:'……我在你们背后。',sola:'这股力量……好热……好棒……来吧，打一架！',celia:'我的誓言，已献给新的主人。',
 nyx:'处刑，开始。',astra:'弹道已修正。落点——你们的阵线。',echo:'我们，终于不再吵架了。'
};
function filmInfection(charId){
 const g=C.side==='g',bg=CHAPTER_BG[S?.mid]||'film_corridor',nm=CHAR[charId]?.name||'她';
 const lead=g?filmPick(['lyra','akira','iris','misa','sera','vega','celia','kuro','sola'].filter(id=>id!==charId),'g'):null;
 const shots=[
  {bg,kb:'push',tint:'red',stamp:'',fx:'redflash shake',sfx:'capture',who:charId,side:'g',solo:true,line:FILM_LAST_WORDS[charId]||'不——别过来——！'},
  {black:true,mode:'sys',red:true,name:'',line:`—— ${nm} · 神经链路 · 覆写中 ——`,fx:'static',sfx:'pulse'},
  {bg,kb:'in',tint:'abyss',fx:'alert',who:charId,side:'r',solo:true,line:FILM_TAKEN[charId]||'……指令已接收。'}
 ];
 if(g&&lead)shots.push({bg,tint:'dark',who:lead,side:'g',line:`${nm}……！——别犹豫。那已经不是她了，她现在会对我们开枪。`});
 else if(!g)shots.push({who:'overmind',line:`欢迎回家，${nm}。`});
 shots.film=true;return shots;
}

/* ---------- in-battle subtitles (replaces pop-up banners) ---------- */
const FILM_BARKS={
 lyra:['压上去，别给它们落脚的地方。','这一格，我们的了。'],akira:['挡路的，全部斩断！','太慢了！'],lark:['抓到你啦！','从侧面绕过去——就是现在！'],
 veil:['命中。下一个。','呼吸……扣下。'],misa:['拆解完毕！','这种结构，我闭着眼都能拆。'],noct:['跃迁，抵达。','这条路，我比你们熟。'],
 iris:['系统接管——破防！','扫描完成，弱点在这。'],sera:['我不想伤人……可你们逼我的。','手术刀，也能是武器。'],vega:['护盾冲撞！','站在我身后！'],
 ruby:['开炮！','隔着掩体也照样打穿。'],june:['猎物，到手。','你已经被我盯上很久了。'],psalm:['这一曲，为你送行。','听见了吗？'],
 kuro:['……结束了。','影子里，没有退路。'],sola:['一拳！','还有谁！'],celia:['以盾为誓！','后退！'],
 nyx:['处刑完毕。','不必挣扎。'],astra:['弹道修正，落点确认。','轨道轰击——命中！'],echo:['折跃完成。','我在这，也在那。']
};
const HIVE_BARKS=['清除。','又少了一个。','你们的阵线，正在变薄。'];
let filmSubTimer=null;
function filmCombatSub(name,line,side){
 let el=document.getElementById('fm-combat-sub');
 if(!el){el=document.createElement('div');el.id='fm-combat-sub';el.className='fm-combat-sub';document.body.appendChild(el);}
 el.className=`fm-combat-sub ${side||'g'}`;el.innerHTML=`<b>${esc(name)}</b>${esc(line)}`;
 void el.offsetWidth;el.classList.add('show');clearTimeout(filmSubTimer);filmSubTimer=setTimeout(()=>el.classList.remove('show'),2600);
}

/* ================= HOOKS ================= */
// 1) Chapter openings use the film player instead of the old sandtable "deduction" script.
const filmBaseOpenMission=openMission;
openMission=function(id,withStory=true){
 const tut=showTutorialToast;showTutorialToast=function(){};
 try{filmBaseOpenMission(id,false);}finally{showTutorialToast=tut;}
 document.body.classList.remove('sandtable-cinema-open');
 if(!withStory||location.hash==='#qa'){showTutorialToast();return;}
 FILM.play(filmIntro(id),()=>{try{render();}catch(e){}showTutorialToast();},{chapter:`CHAPTER ${String(filmChapterNo()).padStart(2,'0')} / ${CHAPTER_EN[id]||''}`});
};
// 2) Act transitions, warnings and infection scenes play through the film player.
transitionFrames=function(mid,stage,side){const f=filmTransition(mid,stage,side);f.film=true;return f;};
buildInfectionStoryFrames=function(charId){return filmInfection(charId);};
function filmFromLegacy(frames){
 const bg=CHAPTER_BG[S?.mid]||'film_corridor';
 return frames.map((f,i)=>({bg,tint:'dark',kb:'in',who:f.overmind?'overmind':f.who,side:f.side==='C'?filmSide(f.who):(f.side||C.side),line:String(f.text||'').replace(/【[^】]*】/g,'').trim(),fx:i===0&&/警|报|危/.test(f.text||'')?'alert':'',sfx:f.sound||''}));
}
directorScene=function(frames,title){
 if(qaSilent||location.hash==='#qa')return Promise.resolve();
 const shots=frames&&frames.film?frames:filmFromLegacy(frames||[]);
 return new Promise(resolve=>FILM.play(shots,resolve,{chapter:title||''}));
};
// 3) No pop-up banners while moving. Only kills get a short subtitle line at the bottom.
showCombatBark=function(u,actionType){
 if(!u||location.hash==='#qa')return;
 if(actionType!=='attack')return;
 if(u.char&&u.side==='g'){const pool=FILM_BARKS[u.char]||['命中。'];filmCombatSub(CHAR[u.char].name,pool[(S?.round||0)%pool.length],'g');}
 else if(u.char&&u.side==='r'){filmCombatSub(CHAR[u.char].name,FILM_TAKEN[u.char]?FILM_TAKEN[u.char].split('。')[0]+'。':'清除。','r');}
 else if(u.side==='r'){filmCombatSub('赤巢',HIVE_BARKS[(S?.round||0)%HIVE_BARKS.length],'r');}
};
// 4) The "how to play" toast only once per browser.
{const baseTut=showTutorialToast;showTutorialToast=function(){try{if(localStorage.getItem('mv-tut-seen'))return;localStorage.setItem('mv-tut-seen','1');}catch(e){}baseTut();};}
