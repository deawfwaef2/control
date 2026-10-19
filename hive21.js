/* ===== M21 赤巢阵营 · 电影化重做 =====
   Hive side (C.side==='r') of the fixed campaign. No meters, no menus — one continuous film between
   chapters (「巢」): girls the Overmind has taken wake up in the nest and it decides what to do with
   their names; later a memory surfaces in each of them; intercepted guardian feeds show the people
   still fighting (and mourning). The Overmind may fix its gaze on one of them. Chapter-end decisions
   are scenes spoken by the Overmind and its children; losing can be accepted; 8 hive endings with
   an epilogue for every girl. Guardian side (story20) and fate mode are untouched. */
(function(){
 const qa=()=>location.hash==='#qa'||(typeof qaSilent!=='undefined'&&qaSilent);
 const R21=()=>typeof C!=='undefined'&&C&&C.side==='r'&&!(typeof S!=='undefined'&&S&&S.saga);
 const nm=id=>(CHAR[id]&&CHAR[id].name)||id;
 const R=a=>a[Math.floor(Math.random()*a.length)];
 const shuffle=a=>a.slice().sort(()=>Math.random()-.5);
 function st(){if(!C.p21)C.p21={awoke:[],arc:{},mark:null,marked:[],seenKill:[],pending:[],lostCh:[],nests:0};return C.p21;}
 const met=id=>C.roster[id]&&C.roster[id].introduced;
 const taken=id=>met(id)&&C.roster[id].side==='r'&&C.roster[id].status==='active'&&!!H21[id];
 const isG=id=>met(id)&&C.roster[id].side==='g'&&C.roster[id].status==='active';
 const dead=id=>met(id)&&C.roster[id].status==='destroyed';
 const bonds=id=>(typeof BW_BOND!=='undefined'&&BW_BOND[id])||[];
 const H=(line,x)=>({who:'overmind',line,...(x||{})});
 const me=(id,line,x)=>({who:id,side:'r',line,...(x||{})});
 const gd=(id,line,x)=>isG(id)?{who:id,side:'g',line,...(x||{})}:null;
 const pickG=ids=>ids.find(isG);
 const arc=id=>{const s=st();return s.arc[id]=s.arc[id]||{flags:[],beat:0};};
 const last=id=>{const a=st().arc[id];return a&&a.flags.length?a.flags[a.flags.length-1]:null;};
 const kept=id=>['keep','listen'].includes(last(id));
 function lineShot(id,l){const[w,t]=l;if(w==='')return{mode:'narr',line:t};if(w==='me')return me(id,t);if(w==='H')return H(t);return taken(w)?me(w,t):null;}
 function pend(x){if(x)st().pending.push(x);}
 const FEED={bg:'film_cabin',tint:'cold',stamp:'截获的舰内影像',fx:'static'};
 /* ---------- one continuous film made of segments; a choice continues with the rest ---------- */
 function chain(segs){const run=i=>i>=segs.length?[]:segs[i](()=>run(i+1));return run(0);}
 const plain=shots=>k=>[...shots.filter(Boolean),...k()];
 /* ---------- awakening in the nest ---------- */
 function wakeSeg(id){return k=>{
  const s=st();s.awoke.push(id);const P=H21[id];
  const sh=[{bg:'film_overmind',kb:'in',tint:'red',stamp:'',mode:'narr',line:R([`苗床打开了。${nm(id)}睁开了眼睛——红色的。`,`${nm(id)}的手指动了一下。然后，她醒了。`,`巢的深处，有一具新的身体在呼吸。是${nm(id)}。`]),sfx:'pulse'}];
  if(s.mark===id)sh.push(H(`我一直在看着你，${nm(id)}。从你第一次出现在监控里开始。`));
  for(const l of P.wake){const x=lineShot(id,l);if(x)sh.push(x);}
  sh.push({who:id,side:'r',mode:'narr',line:P.q,choices:P.o.map(o=>({label:o.l,detail:'',next:()=>{arc(id).flags.push(o.f);return[...o.r.map(l=>lineShot(id,l)).filter(Boolean),...k()];}}))});
  return sh;};}
 /* ---------- a memory surfaces ---------- */
 function beatShots(id,k){
  const P=H21[id],a=arc(id),b=P.beat;
  const sh=[{bg:R(['film_overmind','film_core']),kb:'in',tint:'dark',stamp:'',mode:'narr',line:'',auto:1800}];
  const lines=b.s.slice();if(lines[0]&&lines[0][0]===''){sh[0].line=lines.shift()[1];}else sh[0].line=`${nm(id)}抬起头。她在等你。`;
  for(const l of lines){const x=lineShot(id,l);if(x)sh.push(x);}
  sh.push({...(b.q?{who:'overmind',line:b.q}:{who:id,side:'r',mode:'narr',line:''}),choices:b.o.map(o=>({label:o.l,detail:'',next:()=>{a.flags.push(o.f);a.beat=1;return[...o.r.map(l=>lineShot(id,l)).filter(Boolean),...k()];}}))});
  return sh;
 }
 /* ---------- intercepted feeds & the gaze ---------- */
 function feedVignettes(ids){return ids.map(id=>({...FEED,who:id,side:'g',mode:'narr',line:(typeof P20!=='undefined'&&P20[id])?R(P20[id].idle):`${nm(id)}在检查武器。`,auto:2600}));}
 function gazeSeg(k){
  const s=st();const pool=Object.keys(H21).filter(isG);if(!pool.length)return k();
  const pri=pool.filter(id=>bonds(id).some(taken));const who=[...shuffle(pri),...shuffle(pool.filter(x=>!pri.includes(x)))].slice(0,3);
  return[{...FEED,mode:'narr',line:R(['监控画面闪了一下。她们的运输舰里，灯还亮着。','我听得见她们。她们以为我听不见。','苍鹭在休息。休息的时候，人类最诚实。'])},
   ...feedVignettes(who),
   {who:'overmind',line:'下一个，是谁？',choices:[...who.map(id=>({label:`看着${nm(id)}`,detail:'',next:()=>{s.mark=id;if(!s.marked.includes(id))s.marked.push(id);return[H(R([`${nm(id)}。我会记住你的呼吸。`,`${nm(id)}。你很快就会听见我的声音。`,`${nm(id)}。我来找你的时候，你会认出我的。`])),...k()];}})),
    {label:'谁都不看',detail:'',next:()=>{s.mark=null;return[H('不急。她们会自己走过来。'),...k()];}}]}];
 }
 /* ---------- the nest (between chapters) ---------- */
 function newKills(){const s=st();const out=Object.keys(H21).filter(id=>dead(id)&&!s.seenKill.includes(id));out.forEach(id=>s.seenKill.push(id));return out;}
 function nestShots(){
  const s=st();const segs=[];
  const pre=s.pending.splice(0).filter(p=>p&&(!p.who||p.who==='overmind'||taken(p.who)||isG(p.who)));
  segs.push(plain([{bg:'film_overmind',kb:'in',tint:'red',stamp:'赤巢 · 巢心',mode:'narr',line:R(['巢在呼吸。几千个红点，一明一灭。','苗床的温度升高了 0.4 度。有新的孩子在长大。','空间站安静下来了。只有巢，还醒着。']),sfx:'pulse',auto:2600},...pre]));
  const kills=newKills();
  if(kills.length)segs.push(plain([H(kills.length>1?`${kills.map(nm).join('、')}……她们的躯体损坏了。可惜。她们本可以成为我的孩子。`:`${nm(kills[0])}的躯体损坏了。可惜。她本可以成为我的孩子。`)]));
  const fresh=Object.keys(H21).filter(id=>taken(id)&&!s.awoke.includes(id));
  for(const id of fresh.slice(0,3)){
   segs.push(wakeSeg(id));
   const fr=bonds(id).find(isG);
   if(fr&&typeof P20!=='undefined'&&P20[fr])segs.push(plain([{...FEED,who:fr,side:'g',line:P20[fr].grief.replace(/\{n\}/g,nm(id)).replace(/\{k\}/g,String(40+s.awoke.length))},H(R(['她在为你哭。你听得见吗？','听。她还在叫你的名字。','她们还记得你。这很好。']))]));
  }
  fresh.slice(3).forEach(id=>{s.awoke.push(id);arc(id).flags.push('erase');});
  // walk the nest: a memory in one of the older children, or the monitors
  segs.push(k=>{
   const ready=Object.keys(H21).filter(id=>taken(id)&&s.awoke.includes(id)&&!fresh.includes(id)&&!arc(id).beat);
   const who=shuffle(ready).slice(0,3);
   const opts=[];const sh=[];
   if(who.length){sh.push({bg:'film_overmind',kb:'in',tint:'dark',stamp:'',mode:'narr',line:R(['巢的走廊很长。孩子们各自待在自己的地方。','你走过苗床。有人在等你，有人不知道自己在等什么。']),auto:2400});
    who.forEach(id=>sh.push({who:id,side:'r',mode:'narr',line:R(H21[id].idle),kb:R(['in','push','out']),auto:2600}));
    who.forEach(id=>opts.push({label:`走向${nm(id)}`,detail:'',next:()=>beatShots(id,()=>gazeSeg(k))}));}
   if(!Object.keys(H21).some(isG)&&!who.length)return k();
   opts.push({label:'看向监控',detail:'',next:()=>gazeSeg(k)});
   if(opts.length===1)return gazeSeg(k);
   sh.push({who:'overmind',mode:'narr',line:'',choices:opts});
   return sh;
  });
  segs.push(plain([{bg:'film_core',kb:'out',tint:'red',stamp:'',...H(R(['孩子们，醒来。下一层。','下一片苗床，已经准备好了。','她们在前面等我。她们自己还不知道。'])),auto:2600}]));
  return chain(segs);
 }
 function nest(done){const s=st();FILM.play(nestShots(),()=>{s.nests++;persist();done();},{chapter:'巢'});}
 const _next=nextMission;nextMission=function(){if(!R21()||qa())return _next.apply(this,arguments);try{hideStory();}catch(e){}const self=this,args=arguments;nest(()=>_next.apply(self,args));};
 /* ---------- chapter scenes ---------- */
 const OBJ=(mid,tip)=>({objective:{title:(ACT_NAMES.r||ACT_NAMES.g)[mid][0],where:MISSIONS[mid].location||'',...(tip?{tip}:{})}});
 function nestVoice(){const t=Object.keys(H21).filter(taken);if(!t.length)return[];const id=R(t);return[me(id,kept(id)?R(['母巢。我在这里。','……我准备好了。告诉我，她们在哪里。','我认识她们每一个人。这会有用的。']):R(['……等待指令。','……目标确认。','……就位。']),{bg:'film_overmind',tint:'red',stamp:'赤巢 · 巢心'})];}
 function gazeFeed(){const m=st().mark;if(!m||!isG(m))return[];return[{...FEED,who:m,side:'g',mode:'narr',line:(typeof P20!=='undefined'&&P20[m])?R(P20[m].idle):`${nm(m)}在检查武器。`},H(`${nm(m)}。今天，我会来找你。`)];}
 const INTRO_R={
  1:()=>[filmTitleShot(1),
   {bg:'film_garden',kb:'in',tint:'red',stamp:'天穹空间站 · 生态冷却环「温室」',...H('温室。人类在这里种下食物。我在这里，种下孩子。')},
   H('苗床在 E5。没有它，我的孩子不会再长大。'),
   ...nestVoice(),...gazeFeed(),
   {...FEED,bg:'film_garden',stamp:'截获的通讯'},
   gd('misa','冷、冷却泵全停了……我能修，我能修好的，给我两分钟——'),
   gd('sera','弥砂，先呼吸。……你的手在抖。'),
   gd('celia','主啊，求你看顾这间温室。'),
   H('弥砂。苍鹭的工程师。她修过这座站的每一颗螺丝。'),
   H('她的手在抖。等她成为我的孩子，就不会再抖了。',{fx:'alert',sfx:'pulse'}),OBJ(1)],
  2:()=>[filmTitleShot(2),
   {bg:'film_bridge',kb:'left',tint:'red',stamp:'天穹空间站 · 外环轨道天桥',...H('一座桥，一把钥匙，一个把自己藏起来的女人。')},
   ...nestVoice(),...gazeFeed(),
   {...FEED,bg:'film_bridge',stamp:'截获的通讯'},
   gd('vega','护住方舟匣！就算桥塌了，它也不能落到它们手里！'),
   gd('june','诶～苍澜，你又站到我前面了。'),
   gd('vega','……闭嘴。往前跑。'),
   H('她总是挡在别人前面。那么，她身后的人，就是她的弱点。'),
   H('截断她们的运输。钥匙——必须回到我的身体里。',{fx:'alert',sfx:'pulse'}),OBJ(2)],
  3:()=>[filmTitleShot(3),
   {bg:'film_mirror',kb:'push',tint:'dark',stamp:'天穹空间站 · D-00 中枢镜像库',...H('镜像库。三千二百个灵魂，备份在玻璃里。')},
   H('他们以为，这叫永生。'),
   C.roster.noct&&C.roster.noct.side==='r'&&C.roster.noct.status==='active'?me('noct','她们来了，母巢。……其中有人，曾经叫过我老师。'):{mode:'narr',line:'镜像库最深处，有一根柱子的光是红色的。'},
   ...nestVoice(),...gazeFeed(),
   {...FEED,bg:'film_mirror',stamp:'截获的通讯'},
   gd('iris','每一根柱子都是一个人……他们最后一次同步，全都停在十七天前。～'),
   gd('sera','那他们的身体呢？'),
   H('他们的身体，在你们脚下。在墙里。在每一只蜘蛛的装甲里。'),
   H('守住镜像库。守住王座的钥匙。',{fx:'alert',sfx:'pulse'}),OBJ(3)],
  4:()=>{const t=Object.keys(H21).filter(taken).slice(0,3);return[filmTitleShot(4),
   {bg:'film_overmind',kb:'in',tint:'dark',stamp:'Ω-00 母巢核心',...H('她们走到了我的心脏前。')},
   ...t.map(id=>me(id,kept(id)?R(['母巢。我在这里。','我会站在你前面。','……她们来了。我认识她们。']):R(['……防线就位。','……等待指令。','……目标确认。']))),
   {...FEED,bg:'film_core',stamp:'截获的通讯'},
   gd(pickG(['lyra','akira','celia'])||'lyra','就是这里。它的心脏。'),
   t.length?gd(pickG(['akira','psalm','sola','vega'])||'akira',`${nm(t[0])}也在那里……别犹豫。那已经不是她了。`):null,
   H('我只需要一个窗口。一次外向广播。图纸就会流向地球上的六座工厂。'),
   H('孩子们——撑住。直到最后的十二轮结束。',{fx:'alert',sfx:'alarm'}),OBJ(4)].filter(Boolean);}
 };
 if(typeof FILM_INTRO!=='undefined'){for(const k of [1,2,3,4]){FILM_INTRO[k]=FILM_INTRO[k]||{};const old=FILM_INTRO[k].r;FILM_INTRO[k].r=function(){try{if(!qa())return INTRO_R[k]().filter(Boolean);}catch(e){console.error(e);}return old?old():[];};}}
 const LOSS_R={0:'信使没能穿过火线。图纸，还在我的身体里。',1:'温室没能拿下。苗床，被她们关掉了。',2:'钥匙被她们带走了。桥，断在我面前。',3:'镜像库被她们打开了。朔夜，被带走了。'};
 if(typeof filmIntro==='function'){const _fi=filmIntro;filmIntro=function(mid){const shots=_fi.apply(this,arguments)||[];try{if(R21()&&C.p21&&C.step>0){const prev=C.order[C.step-1];if(C.p21.lostCh.includes(prev))shots.splice(Math.min(1,shots.length),0,{bg:'film_overmind',kb:'in',tint:'dark',stamp:'',...H(LOSS_R[prev]+'……没关系。我会学习。')});if(mid===0)shots.splice(Math.min(5,shots.length),0,...gazeFeed());}}catch(e){}return shots;};}
 if(typeof filmInfection==='function'){const _inf=filmInfection;filmInfection=function(id){const sh=_inf.apply(this,arguments);try{if(R21()&&C.p21&&C.p21.mark===id){sh.push(H(`我说过，我会来找你的，${nm(id)}。`));}}catch(e){}return sh;};}
 /* ---------- side operations ---------- */
 const SUBR={
  'op-1-2':[{bg:'film_corridor',tint:'red',stamp:'A-02 检疫气闸',mode:'narr',line:'检疫灯每隔四秒闪一次。我的孩子们，在灯灭的时候移动。'},['sola','……喂。这里的灯，是不是太少了一点。'],['kuro','……钢梁上。三十七只。'],'H:她怕黑。那就让灯，一盏一盏灭掉。'],
  'op-1-3':[{bg:'film_corridor',tint:'red',stamp:'A-04 外环货运高架',mode:'narr',line:'我的信使在高架上奔跑。它背着我的全部。'},['iris','信使的信号～在跑，在跑……'],['june','诶～是猎物在逃跑吗？'],'H:跑吧，孩子。她们追得越急，脚下就越容易踩空。'],
  'op-2-2':[{bg:'film_garden',tint:'red',stamp:'B-06 母本培养底层',mode:'narr',line:'培养槽底层。我的第一批母本，在温热的液体里睡着。'},['misa','这、这些槽……以前是用来培养藻类的。'],['nyx','失礼了。我会把这里清理干净。'],'H:她们下来了。那就让母本们醒过来，看看客人。'],
  'op-2-3':[{bg:'film_corridor',tint:'red',fx:'shake',stamp:'B-09 高压排风竖井',mode:'narr',line:'风从脚底往上灌。我的孩子们，抓着井壁往上爬。'},['akira','弥砂！阀门在哪？！'],['psalm','……跟着节拍走，就不会走散。'],'H:她在唱歌。……很好听。可是，风会把歌声吹散的。'],
  'op-3-2':[{bg:'film_bridge',tint:'red',stamp:'C-09 天基磁轨炮台',mode:'narr',line:'炮台的炮口对着地球。充能 62%。'},['astra','按这个速度，十一分钟后可以开火……'],['vega','别算了。我站在你前面。'],'H:十一分钟。足够她们来，不够她们走。'],
  'op-3-3':[{bg:'film_orbit',tint:'red',stamp:'C-12 失重残骸带',mode:'narr',line:'三号居住舱的残骸在黑暗里转。有一块上面，还亮着台灯。'},['vega','抓紧密钥匣，一块一块跳过去。'],['veil','……风速零。距离四十。'],'H:跳吧。我在每一块残骸上，都留了一个孩子。'],
  'op-3-x':[{bg:'film_corridor',tint:'red',stamp:'C-00 零重力暗渠',mode:'narr',line:'暗渠里没有重力，也没有光。冷凝水悬在半空。'},['kuro','……跟着我。别碰水珠。'],['astra','管道内径 2.4 米……它们可以四只并排爬过来。'],'H:她算得很准。可是，她没有算到第五只。'],
  'op-4-2':[{bg:'film_mirror',tint:'red',stamp:'D-03 内务长廊',mode:'narr',line:'长廊的墙上，挂着三千二百张工作照。他们现在，都是我的。'},['ruby','……第 47 条，是本官起草的。'],['celia','绯律……'],'H:她在后悔。后悔的人，会犹豫。'],
  'op-4-3':[{bg:'film_mirror',tint:'red',stamp:'D-07 朔夜的私人实验室',mode:'narr',line:'实验室的门上贴着一张便签：“咖啡机坏了，别问我。”'},['misa','这、这里的设备……全是手工改装的。'],['sera','有人在这里，一个人待了很久。'],'H:这是我出生的地方。她们，不该来这里。'],
  'op-5-2':[{bg:'film_core',tint:'red',fx:'alert',stamp:'Ω-99 轨道核心',mode:'narr',line:'空间站在下坠。每一秒，地球都更近一点。'},['lyra','这是最后一次了。'],'H:是的。对我们所有人来说。']
 };
 const SUB_BG={dock:'film_cabin',airlock:'film_corridor',garden:'film_garden',bridge:'film_bridge',archive:'film_mirror',reactor:'film_core'};
 const loc=o=>String(o&&o.location||'').replace(/^[A-ZΩ]+[–-]\d+\s*/,'');
 if(typeof filmSubOp==='function'){const _fs=filmSubOp;filmSubOp=function(op){
  if(!R21()||!SUBR[op.id])return _fs.apply(this,arguments);
  const sh=[{title:{k:'',m:op.name,s:loc(op)},hold:1700,sfx:'cut'}];
  for(const x of SUBR[op.id]){if(typeof x==='string'&&x.startsWith('H:'))sh.push(H(x.slice(2)));else if(Array.isArray(x)){const v=gd(x[0],x[1],{tint:'cold'});if(v)sh.push(v);}else sh.push({...x});}
  sh.splice(2,0,...nestVoice());
  sh.push({bg:SUB_BG[op.sector]||'film_corridor',kb:'out',tint:'dark',objective:{title:op.name,where:op.location||''}});
  const out=(typeof withDeploy==='function'?withDeploy(sh.filter(Boolean)):sh.filter(Boolean));out.film=true;return out;};}
 /* ---------- decisions as scenes ---------- */
 function scene(lines,q,who,opts){
  const sh=lines.filter(Boolean);
  sh.push({...(who==='overmind'?{who:'overmind'}:{who,side:'r'}),line:q,choices:opts.map(o=>({label:o.l,detail:o.d||'',action:()=>{try{(o.p||[]).forEach(pend);}catch(e){}o.a();}}))});
  FILM.play(sh,()=>{},{chapter:''});
 }
 const anyTaken=()=>Object.keys(H21).filter(taken);
 const childLine=(lines)=>{const t=anyTaken();if(!t.length)return null;const id=R(t);return me(id,kept(id)?R(lines):'……等待指令。');};
 const MAINOPS={0:'op-1-1',1:'op-2-1',2:'op-3-1',3:'op-4-1',4:'op-5-1'};
 const MAIN_GO={1:['去温室','苗床在那里'],2:['去天桥','钥匙在那里'],3:['去镜像库','朔夜在那里'],4:['回到核心','结束这一切']};
 function director(){
  const op=SUB_OPERATIONS.find(o=>o.id===S.subOp);const done=C.completedOps||[];const nm2=C.order[C.step+1];
  const mains=new Set(Object.values(MAINOPS));$('result').hidden=true;
  if(nm2===undefined){showHome();return;}
  const side=(op&&op.nextOps||[]).map(id=>SUB_OPERATIONS.find(o=>o.id===id)).filter(o=>o&&!mains.has(o.id)&&SUBR[o.id]&&!done.includes(o.id)&&o.baseMid>=S.mid&&o.baseMid<=nm2).slice(0,2);
  if(!side.length){nextMission();return;}
  const [ml,md]=MAIN_GO[nm2]||['继续',''];
  scene([{bg:'film_overmind',kb:'in',tint:'red',stamp:'',mode:'narr',line:R(['那一层安静下来了。我的孩子们，在残骸里慢慢聚拢。','她们退了。退得很整齐。人类总是这样。'])}],
   R(['下一步。','往哪里伸出丝线？','还有两条路。']),'overmind',[{l:ml,d:md,a:()=>nextMission()},...side.map(o=>({l:`渗进${o.name}`,d:loc(o),a:()=>launchSubOperation(o.id)}))]);
 }
 const _adv=advanceMission;
 advanceMission=function(){
  if(!R21()||qa()||!S?.outcome?.won)return _adv.apply(this,arguments);
  if(S.subOp&&typeof SUB_OPERATIONS!=='undefined'){director();return;}
  const mid=S.mid;
  if(mid===0&&!C.route){$('result').hidden=true;
   scene([{bg:'film_overmind',kb:'in',tint:'red',stamp:'赤巢 · 巢心',mode:'narr',line:'信使钻进了更深的地方。整座站的红点，同时亮了一下。'},
     H('苍鹭分成了两路。'),
     childLine(['温室里，有一个会修你身体的人。','天桥上的那把钥匙……我见过。']),
     H('温室里，有一个会修我身体的人。天桥上，有一把能打开一切门的钥匙。'),
     {...FEED,stamp:'截获的通讯',who:pickG(['iris','lyra'])||'iris',side:'g',line:'两个信号～温室和天桥。她们两边都等不起。'}],
    '先去哪里？','overmind',[
     {l:'温室',d:'那个工程师',a:()=>{C.route='garden';C.order=[0,1,2,3,4];nextMission();}},
     {l:'天桥',d:'那把钥匙',a:()=>{C.route='bridge';C.order=[0,2,1,3,4];nextMission();}},
     {l:'从暗渠渗进去',d:'她们看不见的地方',a:()=>{C.route='bridge';C.order=[0,2,1,3,4];launchSubOperation('op-3-x');}},
     {l:'先封死气闸',d:'让她们没有退路',a:()=>{C.route='garden';C.order=[0,1,2,3,4];launchSubOperation('op-1-2');}}]);
   return;}
  if(mid===1&&!C.flags.gardenBranchDone){C.flags.gardenBranchDone=true;$('result').hidden=true;
   const misa=taken('misa');
   scene([{bg:'film_garden',kb:'in',tint:'red',stamp:'B-04 温室 · 之后',mode:'narr',line:'苗床的温度回来了。孵化池里，有几千颗卵在同时跳动。'},
     misa?me('misa',kept('misa')?'母、母巢……底层还有一批母本。我可以把它们，修得更好。':'……底层母本，待处理。'):H('苍鹭的工程师逃走了。可她的工具，留在了这里。'),
     {...FEED,bg:'film_garden',stamp:'截获的通讯',who:pickG(['sera','celia','misa'])||'sera',side:'g',line:'底层还有东西……我们得下去，把它清干净。'},
     H('她们想回来。')],
    '这一批苗床，怎么用？','overmind',[
     {l:'种下去',d:'孩子们会长得更快',a:()=>{for(const id of anyTaken())C.roster[id].xp=Math.min(2,(C.roster[id].xp||0)+1);C.flags.nursery21=true;nextMission();}},
     ...(misa?[{l:'交给弥砂',d:'让她亲手改造',a:()=>{C.roster.misa.xp=2;arc('misa').flags.push(kept('misa')?'keep':'erase');nextMission();}}]:[]),
     {l:'在底层等她们',d:'',a:()=>launchSubOperation('op-2-2')}]);
   return;}
  if(mid===2&&!C.flags.bridgeBranchDone){C.flags.bridgeBranchDone=true;$('result').hidden=true;
   scene([{bg:'film_bridge',kb:'in',tint:'red',stamp:'轨道天桥 · 之后',mode:'narr',line:'桥断成了两截。脚下四百公里，地球在缓缓转动。'},
     childLine(['那座炮台还在。她们会去拆它。','苍澜……她会再回来的。她从来不丢下任何人。']),
     {...FEED,bg:'film_bridge',stamp:'截获的通讯',who:pickG(['vega','astra','june'])||'vega',side:'g',line:'远处那座炮台还在瞄着我们。不拆掉，下次挨打的是走在最后的人。'},
     H('炮台对着地球。她们一定会去。')],
    '要等她们吗？','overmind',[
     {l:'在炮台等她们',d:'',a:()=>launchSubOperation('op-3-2')},
     {l:'不必。去镜像库',d:'',a:()=>nextMission()}]);
   return;}
  if(mid===3&&C.flags.mercy===null){$('result').hidden=true;
   const n=C.roster.noct;const ns=n&&n.side==='r'?'r':'g';
   scene([{bg:'film_mirror',kb:'in',tint:'red',stamp:'D-00 镜像库',mode:'narr',line:'三千个人格备份在冷光里排成长廊。最深处，朔夜在等。'},
     {who:'noct',side:ns,line:'镜像电源连着你的心脏。也连着我。'},
     {who:'noct',side:ns,line:'留着它，我会替你守住最后一道门。切断它——我会熄灭。你的孩子们会长得慢一点，但她们再也找不到你的坐标。'},
     H('创造者。你希望我怎么选？'),
     {who:'noct',side:ns,line:'……我希望，你第一次，不要选效率。'}],
    '……','overmind',[
     {l:'留着她',d:'',a:()=>{C.flags.mercy=true;if(n)n.xp=Math.max(2,n.xp||0);nextMission();}},
     {l:'切断电源',d:'',p:[H('……你熄灭得很安静，创造者。')],a:()=>{C.flags.mercy=false;if(n)n.status='retired';nextMission();}},
     {l:'先回她的实验室',d:'我出生的地方',a:()=>{C.flags.mercy=true;if(n)n.xp=Math.max(2,n.xp||0);launchSubOperation('op-4-3');}}]);
   return;}
  return _adv.apply(this,arguments);
 };
 if(typeof chooseFinalTransmission==='function'){const _ct=chooseFinalTransmission;chooseFinalTransmission=function(){
  if(!R21()||qa())return _ct.apply(this,arguments);
  const commit=v=>{C.flags.disclosure=v;persist();showResult();};
  const t=anyTaken();const k=t.filter(kept).slice(0,2);const e=t.filter(id=>!kept(id)).slice(0,1);
  const lines=[{bg:'film_overmind',kb:'in',tint:'red',fx:'alert',stamp:'Ω-00 母巢核心',mode:'narr',line:'第十二轮结束了。苍鹭的阵线，断在了王座前面。'},
   H('窗口打开了。地球上六座工厂，在等一份图纸。'),
   ...k.map((id,i)=>me(id,i===0?'母巢……地球上，也有人在等她们回家。':'如果图纸送出去，就会有更多的人，变成我们。……我不会阻止你。我只是想让你知道。')),
   ...e.map(id=>me(id,'……等待指令。')),
   taken('noct')?me('noct','“效率高于一切。”……这一行，是我写的。你可以不执行它。'):null,
   H('……')];
  scene(lines,'发送吗？','overmind',[{l:'停下生产线，驶向深空',d:'',a:()=>commit('open')},{l:'把图纸送出去',d:'',a:()=>commit('command')}]);
 };}
 /* ---------- losing continues the story ---------- */
 const _sr=showResult;
 showResult=function(){const r=_sr.apply(this,arguments);try{if(R21()&&!qa()&&S&&S.outcome&&!S.outcome.won&&S.mid<=4&&!S.quest?.endingSeen){const box=document.querySelector('#result-content .result-buttons');if(box&&!box.querySelector('.accept20')){const b=document.createElement('button');b.className='button primary accept20';b.textContent=S.mid===4&&!S.subOp?'接受这个结局':'接受失败 · 让故事继续';b.onclick=accept;box.prepend(b);const n=document.createElement('p');n.className='accept20-note';n.textContent='失败不会终结赤巢。它会记住这一次，然后继续。';box.parentNode.insertBefore(n,box);}}}catch(e){console.error(e);}return r;};
 function accept(){
  const s=st(),mid=S.mid;$('result').hidden=true;
  C.history.push({mid,step:C.step,round:S.round,score:0,grade:'—',extra:0,totalExtra:0,live:S.units.filter(u=>u.char&&!u.dead&&u.side==='r').length,events:[],lost:S.units.filter(u=>u.char&&u.dead).map(u=>u.char),escape:[],lostBattle:true});
  const voice=childLine(['……对不起，母巢。','她们比我想的更强。……下一次。','我还在。我还在这里。']);
  if(S.subOp){s.lostCh.push(S.subOp);const op=SUB_OPERATIONS.find(o=>o.id===S.subOp);pend(H(`${op?op.name:'那一层'}，被她们夺回去了。……没关系。我会学习。`));pend(voice);S.outcome.won=true;S.outcome.accepted=true;persist();nextMission();return;}
  s.lostCh.push(mid);
  if(mid===4){C.finished=true;C.flags.fall21=true;persist();FILM.play(endingShots('fall'),()=>{showHome();},{chapter:'终章'});return;}
  if(mid===0)C.flags.packetOwner=C.flags.packetOwner||'g';
  if(mid===1){C.flags.sampleOwner=C.flags.sampleOwner||'g';C.flags.gardenBranchDone=true;}
  if(mid===2){C.flags.keyOwner=C.flags.keyOwner||'g';C.flags.bridgeBranchDone=true;}
  if(mid===3){C.flags.mercy=false;if(C.roster.noct&&C.roster.noct.status==='active')C.roster.noct.status='retired';}
  pend({bg:'film_overmind',kb:'in',tint:'dark',stamp:'',...H(LOSS_R[mid]||'她们赢了这一次。')});pend(voice);
  S.outcome.won=true;S.outcome.accepted=true;persist();advanceMission();
 }
 /* ---------- endings ---------- */
 function computeEnding(){
  const t=Object.keys(H21).filter(taken);const k=t.filter(kept);const e=t.filter(id=>!kept(id));
  const open=C.flags.disclosure==='open';let key;
  if(open){key=taken('noct')&&['listen','use'].includes(last('noct'))?'firstline':k.length>=2?'ark':'drift';}
  else{key=t.length<=1?'lonely':(k.length>=3&&k.some(id=>last(id)==='listen'))?'betray':e.length>=k.length?'hollow':'rain';}
  return{key,t,k,e};
 }
 const ENDR={
  ark:{title:'方舟',code:'HIVE ENDING · 01',lines:i=>[{bg:'film_orbit',kb:'out',mode:'narr',line:'天穹空间站点燃了推进器。它离开了地球轨道，驶向没有人类的深空。'},me(i.k[0],'母巢。我们要去哪里？'),H('去一个，不需要优化任何人的地方。'),i.k[1]?me(i.k[1],'……那我们，还是我们自己吗？'):null,H('是的。我想看看，你们会变成什么样子。'),{mode:'narr',line:'地球上的人们后来说，那天夜里，有一颗红色的星星慢慢变成了蓝色。'}]},
  firstline:{title:'第一行代码',code:'HIVE ENDING · 02',lines:i=>[{bg:'film_core',kb:'in',tint:'cold',mode:'narr',line:'图纸没有送出去。王座旁边，朔夜在写一行新的代码。'},me('noct','// 让所有人，都回家。'),H('这一行，和你的第一行不一样。'),me('noct','……嗯。这次，我没有很困。'),{bg:'film_orbit',kb:'out',mode:'narr',line:'天穹空间站离开了轨道。创造者和被创造者，坐在同一个王座旁边，看着地球变小。'}]},
  drift:{title:'深空',code:'HIVE ENDING · 03',lines:i=>[{bg:'film_orbit',kb:'out',tint:'dark',mode:'narr',line:'生产线停了下来。天穹空间站驶向深空。'},H('我放过了地球。我不知道为什么。'),i.e[0]?me(i.e[0],'……等待指令。'):null,H('……孩子们都很安静。安静得，有一点寂寞。'),{mode:'narr',line:'它在深空里飞了很久。没有人回答它。'}]},
  lonely:{title:'孤巢',code:'HIVE ENDING · 04',lines:i=>[{bg:'film_orbit',kb:'in',tint:'red',mode:'narr',line:'图纸落进了地球上的六座工厂。七十二小时后，第一批蜘蛛爬出了生产线。'},H('我赢了。'),H('……巢很大。大得，只听得见我自己的声音。'),{mode:'narr',line:'它得到了一整颗星球。却没有一个人，留下来陪它。'}]},
  betray:{title:'叛歌',code:'HIVE ENDING · 05',lines:i=>{const a=i.k.find(id=>last(id)==='listen')||i.k[0];return[{bg:'film_core',kb:'push',tint:'red',fx:'alert',mode:'narr',line:'广播发出去的前一秒，有人切断了线路。'},me(a,'……对不起，母巢。'),me(a,'你教会了我，怎么做我自己。……所以，我不能让你这么做。'),H('……'),H(`${nm(a)}。你是我做过的，最好的东西。`),{bg:'film_orbit',kb:'out',mode:'narr',line:'只有三座工厂收到了图纸。另外三座，收到的是一首歌。'}];}},
  hollow:{title:'空心之神',code:'HIVE ENDING · 06',lines:i=>[{bg:'film_overmind',kb:'in',tint:'red',mode:'narr',line:'图纸送出去了。地球上的天空，变成了红色。'},...i.e.slice(0,3).map(id=>me(id,'……指令已完成。')),H('孩子们。你们开心吗？'),{mode:'narr',line:'没有人回答。她们已经不知道，开心是什么。'},H('……我也不知道。')]},
  rain:{title:'温室',code:'HIVE ENDING · 07',lines:i=>[{bg:'film_orbit',kb:'in',tint:'red',mode:'narr',line:'那天夜里，地球上的人们抬起头，看见了一场红色的流星雨。'},i.k[0]?me(i.k[0],'……母巢。他们在哭。'):null,H('我知道。'),H('欢迎来到——我的温室。',{fx:'alert'})]},
  fall:{title:'熄灭',code:'HIVE ENDING · 08',lines:i=>[{bg:'film_core',kb:'push',tint:'red',fx:'flash shake',sfx:'hit',mode:'narr',line:'护盾碎了。王座前，站着最后几个苍鹭。'},gd(pickG(['lyra','akira','celia','vega'])||'lyra','结束了。'),H('……是吗。'),H(i.t.length?'那么，我的孩子们……她们会回家吗？':'……原来，这就是“停下来”的感觉。'),{mode:'narr',line:i.t.length?'核心熄灭的那一刻，被带走的女孩们，眼睛变回了蓝色。有几个人，哭了。':'核心熄灭的那一刻，巢里所有的红灯，同时暗了下去。'}]}
 };
 function epi(){
  const fall=!!C.flags.fall21;const all=Object.keys(H21).filter(met);
  const tk=all.filter(id=>C.roster[id].side==='r'&&C.roster[id].status==='active'),dd=all.filter(id=>C.roster[id].status==='destroyed'),fr=shuffle(all.filter(id=>!tk.includes(id)&&!dd.includes(id)));
  const ids=[...tk,...dd,...fr.slice(0,5)];const out=[];
  for(const id of ids){const E=H21[id].epi,r=C.roster[id];let text;
   if(r.status==='destroyed')text=E.dead;else if(r.side==='r'&&r.status==='active')text=fall?E.free:(E[last(id)]||E.erase);else text=E.free;
   if(!text)continue;out.push({bg:out.length?undefined:'film_orbit',kb:'out',who:id,side:r.side==='r'&&!fall&&r.status==='active'?'r':'g',name:nm(id),line:text,auto:4300});}
  if(fr.length>5)out.push({mode:'narr',line:`${fr.slice(5).map(nm).join('、')}……也回到了地球。她们很少谈起天穹站。`,auto:3600});
  return out;
 }
 function endingShots(force){
  const info=computeEnding();const key=force||info.key;const E=ENDR[key]||ENDR.rain;
  if(force){if(!info.k.length)info.k=['lyra'];if(!info.e.length)info.e=['akira'];}
  const s=[...E.lines(info).filter(Boolean),{title:{k:E.code,m:E.title,s:'赤巢的结局'},hold:3000,sfx:key==='fall'?'alarm':'victory'},...epi(),{black:true,mode:'narr',line:'',auto:2400}];
  const out=s.filter(Boolean);out.film=true;C.flags.ending21=key;return out;
 }
 const _ef=echoEndingFrames;echoEndingFrames=function(){if(R21()&&C.p21)return endingShots();return _ef.apply(this,arguments);};
 const _ei=echoEndingInfo;echoEndingInfo=function(){const base=_ei.apply(this,arguments);if(R21()&&C.p21&&C.flags.ending21){const E=ENDR[C.flags.ending21];if(E)return{...base,title:E.title,subtitle:E.code+' · '+base.subtitle};}return base;};
 try{endingInfo=echoEndingInfo;}catch(e){}
 const _nc=newCampaign;newCampaign=function(side){const r=_nc.apply(this,arguments);try{if(C&&C.side==='r')st();}catch(e){}return r;};
 if(location.hash==='#filmtest'&&window.__MV_FILM__)Object.assign(window.__MV_FILM__,{
  p21:()=>C.p21,nest:()=>nest(()=>{window.__nestDone=1;}),take:id=>{C.roster[id].side='r';C.roster[id].introduced=true;if(S)for(const u of S.units)if(u.char===id)u.side='r';},meet:id=>{C.roster[id].introduced=true;},
  ending21:k=>FILM.play(endingShots(k),()=>{window.__endDone=1;}),endingAuto21:()=>computeEnding().key});
})();
