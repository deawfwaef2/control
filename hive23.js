/* M23 · 赤巢：小关（幕间战）与随机分支
   大关（主线章节）之间插入一场“小关”，每局从池中按角色处境随机抽取，胜利条件各不相同：
   追猎（在她逃上逃生舱前感染她）/ 守卵（撑到孵化）/ 斩首（拿下指挥官）/ 渗透（让孩子们钻过防线）/ 镜像（她与旧日搭档）。
   小关之后可能随机触发一段角色事件（带抉择），后果会写进下一场大关的棋盘与对白。
   全部用影片和棋盘表达，没有任何数值面板。 */
const K23={};
(function(){
 const qa=()=>location.hash==='#qa'||(typeof qaSilent!=='undefined'&&qaSilent);
 const HV=()=>typeof C!=='undefined'&&C&&C.side==='r'&&!(typeof S!=='undefined'&&S&&S.saga);
 const nm=id=>(CHAR[id]&&CHAR[id].name)||id;
 const R=a=>a[Math.floor(Math.random()*a.length)];
 const shuffle=a=>a.slice().sort(()=>Math.random()-.5);
 function st(){if(!C.p23)C.p23={done:{},inc:{},used:[],seen:[],log:[],grief:[]};return C.p23;}
 function p21(){if(!C.p21)C.p21={awoke:[],arc:{},mark:null,marked:[],seenKill:[],pending:[],lostCh:[],nests:0};return C.p21;}
 const met=id=>C.roster[id]&&C.roster[id].introduced;
 const isG=id=>met(id)&&C.roster[id].side==='g'&&C.roster[id].status==='active';
 const taken=id=>met(id)&&C.roster[id].side==='r'&&C.roster[id].status==='active';
 const arcOf=id=>{const a=p21();return a.arc[id]=a.arc[id]||{flags:[],beat:0};};
 const lastF=id=>{const a=p21().arc[id];return a&&a.flags.length?a.flags[a.flags.length-1]:null;};
 const kept=id=>['keep','listen'].includes(lastF(id));
 const bonds=id=>(typeof BW_BOND!=='undefined'&&BW_BOND[id])||[];
 const gList=()=>Object.keys(C.roster).filter(isG);
 const tList=()=>Object.keys(C.roster).filter(taken);
 const H=(line,x)=>({who:'overmind',line,...(x||{})});
 const me=(id,line,x)=>({who:id,side:'r',line,...(x||{})});
 const gd=(id,line,x)=>({who:id,side:'g',line,...(x||{})});
 const N=(line,x)=>({mode:'narr',line,...(x||{})});
 const FEED={bg:'film_cabin',tint:'cold',stamp:'截获的舰内影像',fx:'static'};
 const say=(id,keptLine,erasedLine,x)=>me(id,kept(id)?keptLine:erasedLine,x);

 /* ---------- 卵囊：不能移动的己方单位 ---------- */
 KINDS.egg={name:'卵囊',role:'孵化中的子嗣',rune:'卵',value:4,rule:'无法移动。被吃即毁。撑到孵化的那一轮末，它会破壳成为赤蛛。',icon:'core'};
 const _mv=movers;movers=function(s,side){return _mv.apply(this,arguments).filter(u=>u.kind!=='egg');};
 const _lm=legalMoves;legalMoves=function(s,u,mode){if(u&&u.kind==='egg')return[];const out=_lm.apply(this,arguments);if(u&&u.slow23&&mode!=='threat')return out.filter(m=>distance(u,m)<=1);if(u&&u.slow23&&mode==='threat')return out.filter(m=>distance(u,m)<=1);return out;};
 const _iq=initQuest;initQuest=function(s){if(s&&s.kind23)return;return _iq.apply(this,arguments);};

 let building=false;
 function blank(base,name,where){
  building=true;K23.__building=true;let s;try{s=makeMission(base);}finally{building=false;K23.__building=false;}
  Object.assign(s,{units:[],relays:[],loot:[],walls:[],voids:[],doors:[],delivery:[],exits:[],var22:null,whisper22:null,brood22:0,ventStart:99,collapseAt:99,spawnEvery:99,collapsed:true,limit:99,holdTarget:99,round:1,serial:100});
  delete s.quest;s.flags.gatesOpen=true;s.subOpName=name.replace('幕间 · ','');s.where23=where;return s;
 }
 const put=(s,kind,side,x,y,char)=>spawn(s,kind,side,x,y,char||undefined,char||undefined);
 const putG=(s,id,x,y)=>{const u=spawn(s,'mech','g',x,y,id);return u;};
 const putT=(s,id,x,y)=>{const u=spawn(s,'mech','r',x,y,id);return u;};
 const alive=(s,id)=>{const u=s.units.find(v=>v.char===id);return u&&!u.dead&&!u.escaped?u:null;};
 const near=(u,list)=>list.reduce((m,p)=>Math.min(m,distance(u,p)),9);

 /* ======================= 小关定义 ======================= */
 const DEFS={
  /* 1 · 追猎 ---------------------------------------------------- */
  hunt:{win:'infect',w:2,base:1,name:'逃生舱的倒计时',en:'THE LAST POD',where:'B–06 逃生舱甲板',bg:'film_corridor',
   cond:()=>gList().length>=3,
   setup(){const g=gList();const m=p21().mark;const t=isG(m)?m:R(g);const esc=bonds(t).find(id=>isG(id)&&id!==t)||R(g.filter(x=>x!==t));const res=R(g.filter(x=>x!==t&&x!==esc))||null;return{t,esc,res};},
   build(d){const s=blank(1,'幕间 · 逃生舱的倒计时','B–06 逃生舱甲板');s.walls=['2,3','5,3','1,5','6,5'];s.exits=[{x:0,y:7,side:'g'},{x:7,y:7,side:'g'}];
    const t=putG(s,d.t,3,2);t.slow23=true;putG(s,d.esc,4,3);put(s,'drone','g',2,2);if(d.res)putG(s,d.res,3,7);put(s,'sentinel','g',4,7);
    put(s,'spider','r',2,0);put(s,'spider','r',5,0);put(s,'spider','r',0,3);put(s,'spider','r',7,3);
    const ts=shuffle(tList()).slice(0,2);[[1,1],[6,1]].forEach((p,i)=>{if(ts[i])putT(s,ts[i],p[0],p[1]);else put(s,'sentinel','r',p[0],p[1]);});
    s.k23={t:d.t,esc:d.esc,limit:9};return s;},
   goals(s){const t=alive(s,s.k23.t);return[{text:`在${nm(s.k23.t)}登上 A1 / H1 逃生舱之前，用赤蛛感染她（${Math.min(s.round,s.k23.limit)}/${s.k23.limit} 轮）`,done:t&&t.side==='r'},{text:`${nm(s.k23.t)}受了伤，每次只能移动 1 格；她死了，你就什么也得不到`,done:false}];},
   check(s){const u=s.units.find(v=>v.char===s.k23.t);if(!u)return null;if(u.side==='r')return['win','infect'];if(u.dead)return['lose','killed'];if(u.escaped)return['lose','escaped'];if(!movers(s,'r').some(v=>v.kind==='spider'))return['lose','nospider'];return null;},
   timeout:'escaped',
   ev(s){const u=s.units.find(v=>v.char===s.k23.t);if(!u)return 0;if(u.side==='r')return-900;if(u.dead)return 400;if(u.escaped)return 900;let v=-near(u,s.exits)*45;for(const sp of movers(s,'r'))if(sp.kind==='spider')v+=Math.min(4,distance(sp,u))*6;return v;},
   target(s,u){const t=s.units.find(v=>v.char===s.k23.t);if(!t||t.dead||t.escaped)return null;if(u.uid===t.uid&&u.side==='g')return[...s.exits].sort((a,b)=>distance(u,a)-distance(u,b))[0];if(u.side==='r'&&t.side==='g'){if(u.kind==='spider')return t;return[...s.exits].sort((a,b)=>distance(t,a)-distance(t,b))[0];}return null;},
   intro(d){const t=d.t,e=d.esc;return[
    {bg:'film_corridor',kb:'in',tint:'red',stamp:'B–06 逃生舱甲板',...N(`上一战的爆炸把${nm(t)}甩进了错误的一层。她的腿在流冷却液。`)},
    {...FEED,who:t,side:'g',line:R([`我没事……我还能走。只要走到逃生舱——`,`别回头。我自己能走到舱门。`,`……别告诉队长我受伤了。`])},
    {...FEED,who:e,side:'g',line:R([`抓住我的肩膀，${nm(t)}。还有六格。`,`我背你。别争。`,`看着我，别看后面那些红点。`])},
    H(p21().mark===t?`我一直在看着你，${nm(t)}。现在，你跑不快了。`:`两座逃生舱。九轮。她走一步，我的孩子也走一步。`),
    {bg:'film_corridor',kb:'out',tint:'dark',objective:{title:'逃生舱的倒计时',where:'B–06 逃生舱甲板'}}];},
   after(s,res,d){const t=d.t,e=d.esc;
    if(res==='infect')return[N(`舱门在${nm(t)}面前三格的地方关上了。`),H(`欢迎，${nm(t)}。你不用再跑了。`),isG(e)?{...FEED,who:e,side:'g',line:`${nm(t)}！！——放开她！`}:null,H('苗床在等她。')];
    if(res==='killed'){st().grief.push(t);return[N(`${nm(t)}倒在离舱门两格的地方。她的手还伸着。`),H('……我没有想要这个。'),isG(e)?{...FEED,who:e,side:'g',line:'我会记住是谁做的。每一只。'}:null];}
    C.roster[t].status='retired';return[N('逃生舱脱离。一颗小小的光点，往地球的方向坠下去。'),{...FEED,who:t,side:'g',line:R(['我会回来的。带着所有人回来。','对不起……对不起，我先走了。'])},H('她带走了我的一部分秘密。……下一次，我会更快。')];}
  },
  /* 2 · 守卵 ---------------------------------------------------- */
  eggs:{win:'hatch',w:1,base:1,name:'孵化前的九十秒',en:'NINETY SECONDS',where:'B–04 温室底层',bg:'film_garden',
   cond:()=>gList().length>=2,
   setup(){return{gs:shuffle(gList()).slice(0,4)};},
   build(d){const s=blank(1,'幕间 · 孵化前的九十秒','B–04 温室底层');s.walls=['1,4','6,4','3,5'];
    put(s,'egg','r',1,0);put(s,'egg','r',4,0);put(s,'egg','r',7,2);
    put(s,'spider','r',2,1);put(s,'spider','r',4,1);put(s,'spider','r',5,2);
    const ts=shuffle(tList()).slice(0,1);if(ts[0])putT(s,ts[0],3,2);else put(s,'sentinel','r',3,2);
    const slots=[[2,7],[5,7],[4,6],[7,7]];d.gs.forEach((id,i)=>putG(s,id,slots[i][0],slots[i][1]));put(s,'drone','g',3,6);put(s,'sentinel','g',6,6);put(s,'drone','g',1,7);put(s,'sentinel','g',0,6);
    s.k23={hatch:8,limit:8};return s;},
   eggsAlive:s=>s.units.filter(u=>u.kind==='egg'&&!u.dead).length,
   goals(s){const n=DEFS.eggs.eggsAlive(s);return[{text:`守住卵囊，撑到第 ${s.k23.hatch} 轮末孵化（${Math.min(s.round,s.k23.hatch)}/${s.k23.hatch}）`,done:false},{text:`至少保住 2 枚卵囊（现存 ${n}）`,done:n>=2}];},
   check(s){if(DEFS.eggs.eggsAlive(s)<=1)return['lose','eggs'];return null;},
   survive:'hatch',
   ev(s){const eggs=s.units.filter(u=>u.kind==='egg'&&!u.dead);let v=(3-eggs.length)*140;const own=movers(s,'g');for(const e of eggs)v-=bestDistance(own,e)*7;return v;},
   intro(d){const g=d.gs;return[
    {bg:'film_garden',kb:'in',tint:'red',stamp:'B–04 温室底层',...N('温室底层。三枚卵囊贴着冷却管，像心脏一样一下一下地亮。')},
    H('九十秒。它们只需要九十秒。'),
    {...FEED,bg:'film_garden',who:g[0],side:'g',line:R(['底层有热源……是卵。全部烧掉。','一枚都不能留。留下一枚，下个月就是一百只。'])},
    g[1]?{...FEED,bg:'film_garden',who:g[1],side:'g',line:R(['它们在动……它们知道我们来了。','我负责左边。别让任何一只靠近你。'])}:null,
    tList()[0]?say(tList()[0],'母巢，让我守在最前面。它们……也是我的弟弟妹妹。','守卫协议已载入。'):null,
    {bg:'film_garden',kb:'out',tint:'dark',objective:{title:'孵化前的九十秒',where:'B–04 温室底层'}}];},
   after(s,res){const n=DEFS.eggs.eggsAlive(s);
    if(res==='hatch'){C.flags.brood22=Math.min(2,(C.flags.brood22||0)+Math.max(1,n-1));return[N(`第 ${s.k23.hatch} 轮末。${n} 枚卵囊同时裂开。`),H('看。它们第一眼看见的，是我。'),N('细小的红色腿，踩在温室的玻璃上。')];}
    return[N('最后一枚卵囊在火焰里缩成一团。'),H('……她们烧的是孩子。她们知道吗？'),H('我会记住这个温度。')];}
  },
  /* 3 · 斩首 ---------------------------------------------------- */
  decap:{win:'infect',w:1,base:3,name:'她们的指挥官',en:'THE COMMANDER',where:'D–02 指挥舱回廊',bg:'film_bridge',
   cond:()=>['lyra','akira','iris','vega','celia'].some(isG)&&gList().length>=3,
   setup(){const L=['lyra','akira','iris','vega','celia'].filter(isG);const lead=R(L);const guards=shuffle(gList().filter(x=>x!==lead)).slice(0,2);return{lead,guards};},
   build(d){const s=blank(3,'幕间 · 她们的指挥官','D–02 指挥舱回廊');s.walls=['2,4','5,4','0,5','7,5'];
    putG(s,d.lead,4,6);d.guards.forEach((id,i)=>putG(s,id,[2,6][i],6));put(s,'drone','g',3,7);put(s,'sentinel','g',5,7);
    [[1,1],[3,1],[4,2],[6,1],[2,2],[5,0]].forEach(p=>put(s,'spider','r',p[0],p[1]));
    const ts=shuffle(tList()).slice(0,2);[[0,1],[7,1]].forEach((p,i)=>{if(ts[i])putT(s,ts[i],p[0],p[1]);});
    s.k23={lead:d.lead,limit:11};return s;},
   goals(s){const L=alive(s,s.k23.lead);return[{text:`在第 ${s.k23.limit} 轮末她撤离之前，拿下指挥官${nm(s.k23.lead)}（${Math.min(s.round,s.k23.limit)}/${s.k23.limit}）`,done:!L||L.side==='r'},{text:'感染她，她就是你的；击毁她，她们会为她复仇',done:false}];},
   check(s){const u=s.units.find(v=>v.char===s.k23.lead);if(!u)return null;if(u.side==='r')return['win','infect'];if(u.dead)return['win','killed'];if(!movers(s,'r').some(v=>v.kind==='spider'))return['lose','nospider'];return null;},
   timeout:'evac',
   target(s,u){const L=s.units.find(v=>v.char===s.k23.lead);if(u.side==='r'&&u.kind==='spider'&&L&&!L.dead&&L.side==='g')return L;return null;},
   ev(s){const u=s.units.find(v=>v.char===s.k23.lead);if(!u)return 0;if(u.dead||u.side==='r')return-900;let v=0;for(const sp of movers(s,'r'))if(sp.kind==='spider'&&distance(sp,u)<=2)v-=distance(sp,u)===1?160:45;return v;},
   intro(d){const L=d.lead;return[
    {bg:'film_bridge',kb:'in',tint:'red',stamp:'D–02 指挥舱回廊',...N('指挥舱的灯一直亮着。所有的命令，都从这里出去。')},
    {...FEED,who:L,side:'g',line:R(['所有人，听我口令。我们不会再失去任何人。','我在这里。只要我还在，阵线就不会断。','十轮之后撤到下一层。在那之前，守住。'])},
    d.guards[0]?{...FEED,who:d.guards[0],side:'g',line:R([`${nm(L)}，你站到后面去。这次换我们挡。`,'它们冲着你来的。我感觉得到。'])}:null,
    H(`砍掉头，身体会自己倒下。……不过，${nm(L)}，我更想让你为我说话。`),
    {bg:'film_bridge',kb:'out',tint:'dark',objective:{title:'她们的指挥官',where:'D–02 指挥舱回廊'}}];},
   after(s,res,d){const L=d.lead;
    if(res==='infect'){C.flags.leaderless23=L;return[N(`${nm(L)}的耳麦里，还在传出她小队的呼叫。`),H('从现在起，她们听到的命令，是我的。'),N('苍鹭的频道，第一次乱成一片。')];}
    if(res==='killed'){C.flags.enraged23=L;st().grief.push(L);return[N(`${nm(L)}的耳麦掉在地上，还亮着。`),{...FEED,who:R(d.guards.filter(isG))||L,side:'g',line:'……全员。不要再撤了。我们去把它们烧干净。'},H('愤怒会让她们变快。也会让她们犯错。')];}
    return[N('穿梭机带着她离开了回廊。'),{...FEED,who:L,side:'g',line:'记住这一层。我们会回来的。'},H('下一次，我会先切断她的退路。')];}
  },
  /* 4 · 渗透 ---------------------------------------------------- */
  drain:{win:'through',w:1,base:1,name:'暗渠',en:'THE UNDERDRAIN',where:'C–00 排水暗渠',bg:'film_corridor',
   cond:()=>gList().length>=1,
   setup(){return{gs:shuffle(gList()).slice(0,2)};},
   build(d){const s=blank(1,'幕间 · 暗渠','C–00 排水暗渠');s.walls=['0,3','2,3','5,3','7,3','3,5','4,5'];s.exits=[{x:1,y:7,side:'r'},{x:6,y:7,side:'r'}];
    [[1,0],[2,1],[3,0],[4,1],[5,0],[6,1]].forEach(p=>put(s,'spider','r',p[0],p[1]));
    put(s,'drone','g',2,5);put(s,'drone','g',5,5);put(s,'sentinel','g',0,6);put(s,'sentinel','g',7,6);d.gs.forEach((id,i)=>putG(s,id,[3,4][i],6));
    s.k23={need:3,limit:10};return s;},
   esc:s=>s.units.filter(u=>u.kind==='spider'&&u.side==='r'&&u.escaped).length,
   goals(s){const n=DEFS.drain.esc(s);return[{text:`让 ${s.k23.need} 只赤蛛钻进 B1 / G1 暗渠口（${n}/${s.k23.need}）`,done:n>=s.k23.need},{text:`第 ${s.k23.limit} 轮末暗渠闸门关闭（${Math.min(s.round,s.k23.limit)}/${s.k23.limit}）`,done:false}];},
   check(s){const n=DEFS.drain.esc(s);if(n>=s.k23.need)return['win','through'];const left=movers(s,'r').filter(u=>u.kind==='spider').length;if(n+left<s.k23.need)return['lose','caught'];return null;},
   timeout:'closed',
   ev(s){let v=DEFS.drain.esc(s)*-170;for(const u of movers(s,'r'))if(u.kind==='spider')v-=Math.max(0,7-near(u,s.exits))*9;return v;},
   target(s,u){if(u.side==='r'&&u.kind==='spider')return[...s.exits].sort((a,b)=>distance(u,a)-distance(u,b))[0];return null;},
   intro(d){return[
    {bg:'film_corridor',kb:'in',tint:'red',stamp:'C–00 排水暗渠',...N('排水暗渠。水声，锈，还有两扇通往她们背后的闸门。')},
    H('不用打赢。只要钻过去。三只就够。'),
    d.gs[0]?{...FEED,who:d.gs[0],side:'g',line:R(['暗渠也要守？……好吧，反正这里没人会看见我打哈欠。','闸门十轮后自动关闭。在那之前，一只都别放过去。'])}:null,
    N('哨塔的探照灯，一格一格地扫过水面。'),
    {bg:'film_corridor',kb:'out',tint:'dark',objective:{title:'暗渠',where:'C–00 排水暗渠'}}];},
   after(s,res){const n=DEFS.drain.esc(s);
    if(res==='through'){C.flags.ambush23=Math.min(3,n);return[N(`${n} 只赤蛛消失在闸门后的黑暗里。`),H('它们会安静地等。等到她们以为背后是安全的。')];}
    return[N('闸门落下。水面上漂着碎掉的腿。'),H('……暗渠太窄了。我记住了每一个转角。')];}
  },
  /* 5 · 镜像（角色向：被夺走的她，对上旧日的搭档） ----------------- */
  duel:{win:'infect',w:3,base:3,name:'镜像',en:'MIRROR, MIRROR',where:'D–00 人格镜像库 · 侧厅',bg:'film_mirror',
   cond:()=>tList().some(a=>bonds(a).some(isG)),
   setup(){const pairs=[];for(const a of tList())for(const b of bonds(a))if(isG(b))pairs.push([a,b]);const[a,b]=R(pairs);return{a,b};},
   build(d){const s=blank(3,'幕间 · 镜像','D–00 人格镜像库 · 侧厅');s.walls=['1,2','6,2','1,5','6,5','0,3','7,3','0,4','7,4'];
    putT(s,d.a,3,1);put(s,'spider','r',2,0);put(s,'spider','r',5,0);put(s,'spider','r',4,2);
    putG(s,d.b,4,6);put(s,'drone','g',3,7);put(s,'sentinel','g',5,7);
    s.k23={a:d.a,b:d.b,limit:10};return s;},
   goals(s){const{a,b}=s.k23;const B=alive(s,b);return[{text:`让${nm(b)}回到${nm(a)}身边——由赤蛛感染她（${Math.min(s.round,s.k23.limit)}/${s.k23.limit}）`,done:B&&B.side==='r'},{text:`${nm(a)}不能被击毁；${nm(b)}也不能死`,done:!!alive(s,a)}];},
   check(s){const{a,b}=s.k23;const A=s.units.find(v=>v.char===a),B=s.units.find(v=>v.char===b);if(A&&A.dead)return['lose','fallen'];if(B&&B.side==='r')return['win','infect'];if(B&&B.dead)return['lose','killed'];if(!movers(s,'r').some(v=>v.kind==='spider'))return['lose','nospider'];return null;},
   timeout:'apart',
   ev(s){const A=s.units.find(v=>v.char===s.k23.a),B=s.units.find(v=>v.char===s.k23.b);if(!A||!B)return 0;if(B.side==='r')return-900;if(A.dead||B.dead)return 600;let v=0;for(const sp of movers(s,'r'))if(sp.kind==='spider')v+=Math.min(4,distance(sp,B))*7;return v;},
   target(s,u){const B=s.units.find(v=>v.char===s.k23.b);if(u.side==='r'&&u.kind==='spider'&&B&&!B.dead&&B.side==='g')return B;return null;},
   intro(d){const{a,b}=d,k=kept(a),S0=()=>S;const obj={bg:'film_mirror',kb:'out',tint:'dark',objective:{title:'镜像',where:'D–00 人格镜像库 · 侧厅'}};
    return[
    {bg:'film_mirror',kb:'in',tint:'red',stamp:'D–00 人格镜像库 · 侧厅',...N(`镜像库的侧厅。每一面镜子里，都有一个${nm(a)}。`)},
    {...FEED,bg:'film_mirror',who:b,side:'g',line:k?R([`${nm(a)}……是你吗？你的眼睛……`,`你还记得我，对不对？你刚才叫了我的名字。`]):R([`${nm(a)}！是我啊！你看看我！`,`回答我，${nm(a)}。求你了。`])},
    k?me(a,R([`我记得。所以，我才来接你。`,`别哭。这里一点都不疼。我保证。`])):me(a,'……目标确认。'),
    k?gd(b,R(['那不是你。那是它在用你的嘴说话。','……如果我跟你走，你会回来吗？'])):gd(b,'……不。不不不——'),
    {who:'overmind',line:'她们之间，还有一根线。由谁来拉？',choices:[
     {label:`让${nm(a)}亲手去接她`,detail:'',action:()=>{const s=S0();const u=s&&s.units.find(v=>v.char===a);if(u){u.xp=Math.max(2,u.xp||0);C.roster[a].xp=u.xp;}try{render();}catch(e){}},next:()=>withDeploy([me(a,k?'我自己去。她只会为我停下来。':'指令接收。'),obj])},
     {label:'让孩子们一起去',detail:'',action:()=>{const s=S0();if(s){spawn(s,'spider','r',4,0);spawn(s,'spider','r',1,1);}try{render();}catch(e){}},next:()=>withDeploy([H('一个人去太孤单了。带上弟弟妹妹。'),obj])}]}];},
   after(s,res,d){const{a,b}=d,k=kept(a);
    if(res==='infect')return[N(`${nm(b)}跪在镜子前。镜子里的两个人，眼睛是同一种红。`),k?me(a,'……你看。我说过，不疼的。'):me(a,'……'),k?null:N(`${nm(a)}的手，停在了${nm(b)}的头发上。很久。`),H('线，接上了。')];
    if(res==='killed'){st().grief.push(b);return[N(`${nm(b)}倒下的时候，还在喊${nm(a)}的名字。`),k?me(a,'……为什么不跟我走。为什么。'):me(a,'……目标……已清除。'),k?N(`${nm(a)}在镜子前坐了很久。镜子里的她，一直在哭。`):N(`${nm(a)}的指尖，在微微地发抖。她自己没有发现。`)];}
    if(res==='fallen')return[N(`${nm(a)}倒在镜子之间。${nm(b)}抱着她，一直没有松手。`),H('……我把她还给你了。这不是我想要的方式。')];
    return[N(`${nm(b)}被她的小队拖走了。她一直回头。`),k?me(a,'……下一次。下一次我一定接到你。'):me(a,'……目标脱离。')];}
  }
 };
 for(const k of Object.keys(DEFS))K23[k]=DEFS[k];

 /* ======================= 运行与胜负 ======================= */
 let cur=null; // {id,data}
 function launch(id){
  const def=DEFS[id];const data=def.setup();st().used.push(id);
  runId++;busy=false;undoStack=[];try{hideStory();}catch(e){}try{$('result').hidden=true;}catch(e){}
  S=def.build(data);S.kind23=id;S.data23=data;cur={id,data};S.limit=S.k23.limit;
  for(const u of S.units)if(u.char)C.roster[u.char].introduced=true;
  selected=movers(S,'r').find(u=>u.char)?.uid||movers(S,'r')[0]?.uid;
  addLog(`接入${def.where}。`,'good');checkpoint={c:clone(C),s:clone(S)};showGame();render();persist();
  const shots=[{title:{k:'INTERLUDE',m:def.name,s:def.where},hold:1700,sfx:'cut'},...def.intro(data).filter(Boolean)];
  FILM.play(withDeploy(shots),()=>{try{render();}catch(e){}},{chapter:`INTERLUDE / ${def.en}`});
 }

 const HINT23={"hunt": "她受了伤，只能一格一格地挪。堵住她的路，把她赶进孩子们的怀里。别让被夺走的女孩们杀了她。", "eggs": "卵囊不会动。她们会直扑卵囊——挡在路上，或者先咬住冲得最快的那一个。", "decap": "她身边有护卫。拆开护卫，或者绕过去。时间一到，她就会撤离。", "drain": "不用打赢。哨塔看得远，但转身慢。三只钻进暗渠口就够了。", "duel": "被夺走的她不能感染，只能替孩子们开路。把她的搭档逼进角落。"};
 const _qh=questHint;questHint=function(s){if(s&&s.kind23&&HINT23[s.kind23])return HINT23[s.kind23];return _qh.apply(this,arguments);};
 const _obj=objectives;objectives=function(s,side){if(s&&s.kind23&&DEFS[s.kind23]){const g=DEFS[s.kind23].goals(s);return side==='r'?{main:g,extra:[]}:{main:[],extra:[]};}return _obj.apply(this,arguments);};
 const _co=checkOutcome;checkOutcome=function(){
  if(S&&S.kind23&&DEFS[S.kind23]){if(S.outcome)return true;const r=DEFS[S.kind23].check(S);if(r){S.res23=r[1];resolveBattle(r[0]==='win',REASON[r[1]]||'');return true;}return false;}
  return _co.apply(this,arguments);};
 const REASON={infect:'她的眼睛，变成了红色。',killed:'她没能走到最后。',escaped:'逃生舱脱离了。',nospider:'孩子们，一只都不剩了。',hatch:'卵囊破壳。',eggs:'卵囊被烧毁了。',evac:'指挥官撤离了回廊。',through:'孩子们钻进了暗渠。',caught:'剩下的孩子，已经不够钻过去了。',closed:'闸门落下了。',fallen:'她倒在了镜子之间。',apart:'她被小队带走了。'};
 const _env=resolveEnvironment;resolveEnvironment=function(){
  if(S&&S.kind23&&DEFS[S.kind23]){const d=DEFS[S.kind23];if(checkOutcome())return true;
   if(d.survive&&S.round>=S.k23.hatch){S.res23=d.survive;resolveBattle(true,REASON[d.survive]);return true;}
   if(S.round>=S.k23.limit){S.res23=d.timeout;resolveBattle(false,REASON[d.timeout]||'时间到了。');return true;}
   if(S.round===S.k23.limit-1)radio('截获通讯','最后一轮。');
   return false;}
  return _env.apply(this,arguments);};
 const _st=strategicTarget;strategicTarget=function(s,u){if(s&&s.kind23&&DEFS[s.kind23]&&DEFS[s.kind23].target){const t=DEFS[s.kind23].target(s,u);if(t)return t;}return _st.apply(this,arguments);};
 const _rb=resolveBattle;resolveBattle=function(won,reason){
  const k=S&&S.kind23,n=C.history.length;const r=_rb.apply(this,arguments);
  try{if(k){if(C.history.length>n)C.history.length=n;st().log.push({id:k,res:S.res23,step:C.step});}
   else if(S&&!S.saga&&HV()){for(const[id,rec]of Object.entries(C.roster))if(rec.status==='reserve23')rec.status='active';}}catch(e){}
  return r;};
 function finish(){
  const def=DEFS[S.kind23],data=S.data23,res=S.res23||(S.outcome&&S.outcome.won?def.win:def.timeout);$('result').hidden=true;
  let sh=[];try{sh=def.after(S,res,data).filter(Boolean);}catch(e){console.error(e);}
  sh=sh.map((x,i)=>({bg:def.bg,kb:i%2?'out':'in',tint:'red',...x}));
  persist();FILM.play(sh,()=>{nextMission();},{chapter:`INTERLUDE / ${def.en}`});
 }
 const _adv=advanceMission;advanceMission=function(){if(S&&S.kind23){finish();return;}return _adv.apply(this,arguments);};
 const _sr=showResult;showResult=function(){const r=_sr.apply(this,arguments);
  try{if(S&&S.kind23&&S.outcome){const sub=document.querySelector('#result-content .result-subtitle');if(sub)sub.textContent=S.outcome.reason||'';
    document.querySelectorAll('#result-content li, #result-content p, #result-content div').forEach(el=>{if(!el.children.length&&/样本|密钥|数据包|桥体|中继|卷宗|朔夜已回到|是否继续同行|镜室|信使/.test(el.textContent))el.remove();});}}catch(e){}
  try{if(S&&S.kind23&&S.outcome&&!S.outcome.won){const box=document.querySelector('#result-content .result-buttons');if(box){box.querySelectorAll('.accept20').forEach(b=>b.remove());document.querySelectorAll('.accept20-note').forEach(n=>n.remove());const b=document.createElement('button');b.className='button primary accept20';b.textContent='接受失败 · 让故事继续';b.onclick=()=>{finish();};box.prepend(b);}}}catch(e){console.error(e);}
  return r;};

 /* ======================= 随机分支（角色事件） ======================= */
 const INC={
  call:{cond:()=>tList().some(t=>lastF(t)==='erase'&&bonds(t).some(isG)),
   play(){const t=R(tList().filter(t=>lastF(t)==='erase'&&bonds(t).some(isG)));const b=bonds(t).find(isG);return{shots:[
    {bg:'film_overmind',kb:'in',tint:'dark',...N(`巢里很安静。只有${nm(t)}的旧频道，突然亮了起来。`)},
    {...FEED,who:b,side:'g',line:R([`${nm(t)}……如果你还听得见，就敲两下。一下也行。`,`我每天晚上都在这个频道等你。今天也一样。`])},
    me(t,'……'),N(`${nm(t)}的手指，停在频道开关上。`)],
    q:'让她接吗？',opts:[
     {label:'让她接',action:()=>{arcOf(t).flags.push('listen');st().seen.push('call:'+t);},after:[me(t,`……${nm(b)}？`),H('……她想起了一点点。这一点点，会让她在战场上慢半拍。')]},
     {label:'切断频道',action:()=>{C.roster[t].xp=2;},after:[N('频道熄灭。'),me(t,'指令已接收。'),H('安静是一种礼物。')]}]};}},
  standdown:{cond:()=>gList().some(g=>bonds(g).some(t=>taken(t)&&kept(t))),
   play(){const g=R(gList().filter(g=>bonds(g).some(t=>taken(t)&&kept(t))));const t=bonds(g).find(t=>taken(t)&&kept(t));return{shots:[
    {...FEED,stamp:'加密的私人频道',who:g,side:'g',line:`我知道${nm(t)}在你那里。我知道她还记得自己是谁。`},
    {...FEED,stamp:'加密的私人频道',who:g,side:'g',line:'下一战，我不会出现。只要你也别让她上前线。……这是我能给的全部。'},
    say(t,`……${nm(g)}，你在做什么。她们会把你当成叛徒的。`,'……')],
    q:`${nm(g)}在等回答。`,opts:[
     {label:'答应她',action:()=>{C.roster[g].status='reserve23';C.roster[t].status='reserve23';st().seen.push('standdown:'+g);},after:[H('成交。下一战，你们两个都在后面看着。'),N('频道那头，传来一声很轻的“谢谢”。')]},
     {label:'假装答应',action:()=>{C.flags.exposed23=g;st().seen.push('betray:'+g);},after:[H('成交。'),N(`频道关闭。蛛皇把${nm(g)}的位置，标在了地图最前面。`),say(t,'……母巢，你没有骗她，对吧？','……')]}]};}},
  mutation:{cond:()=>true,
   play(){return{shots:[{bg:'film_overmind',kb:'in',tint:'red',...N('苗床最深处，有一枚卵长得不一样。它的壳是黑色的，还在发烫。')},H('一个错误。也可能是一个礼物。')],
    q:'怎么处理它？',opts:[
     {label:'让它长成哨塔',action:()=>{C.flags.sentinel23=(C.flags.sentinel23||0)+1;},after:[N('黑色的壳裂开。里面是一座会走路的炮台。'),H('下一战，它站在我这边。')]},
     {label:'把它分给孩子们',action:()=>{for(const id of tList())C.roster[id].xp=Math.min(2,(C.roster[id].xp||0)+1);},after:[N('被夺走的女孩们，一个接一个地把手放在卵上。'),H('你们会变得更强。')]}]};}},
  rift:{cond:()=>gList().length>=3&&Object.values(C.roster).filter(r=>r.introduced&&(r.side==='r'||r.status==='destroyed')).length>=2,
   play(){const[a,b]=shuffle(gList()).slice(0,2);return{shots:[
    {...FEED,stamp:'截获的舰内影像 · 休息舱',who:a,side:'g',line:R(['我们每推进一层，就少一个人。这还叫救援吗？','如果当时听我的，她们现在还在。'])},
    {...FEED,stamp:'截获的舰内影像 · 休息舱',who:b,side:'g',line:R(['那你想怎样？丢下她们回地球？','你以为只有你在难过吗！'])},
    N('门被重重地关上。')],
    q:'她们之间裂开了一道缝。',opts:[
     {label:'把缝撬大',action:()=>{C.roster[a].status='reserve23';},after:[N(`第二天，${nm(a)}没有出现在集合点。她一个人去找失踪的人了。`),H('一个人走在走廊里的女孩，是最好找的。')]},
     {label:'让她们自己吵完',action:()=>{},after:[H('人类吵完架，会靠得更近。……我想看看，那是什么样子。')]}]};}},
  fever:{cond:()=>tList().some(kept),
   play(){const t=R(tList().filter(kept));return{shots:[
    {bg:'film_overmind',kb:'in',tint:'dark',...N(`${nm(t)}缩在苗床边，浑身发烫。她的身体在排斥我的线。`)},
    me(t,R(['好冷……又好热……母巢，我是不是坏掉了？','我梦见她们了。她们在叫我回去。'])),
    H('如果我重写她，她就不会再痛。也不会再记得。')],
    q:'她在发抖。',opts:[
     {label:'抱住她',action:()=>{arcOf(t).flags.push('keep');},after:[N('巨大的机械臂，很笨拙地，把她圈了起来。'),me(t,'……谢谢。'),H('痛是她的一部分。我留着。')]},
     {label:'重写她',action:()=>{arcOf(t).flags.push('erase');C.roster[t].xp=2;},after:[N(`${nm(t)}的眼睛闭上，又睁开。`),me(t,'……系统正常。等待指令。'),H('……不痛了。')]}]};}},
  trap:{cond:()=>true,
   play(){const g=R(gList())||'lyra';return{shots:[
    {...FEED,stamp:'截获的作战简报',who:g,side:'g',line:'它们一定会走中间。我们在两侧埋伏，等它们进来就合围。'},
    H('她们以为我听不见。')],
    q:'怎么回应这份计划？',opts:[
     {label:'将计就计',action:()=>{C.flags.trap23='exploit';},after:[H('我会走中间。只不过，先走进去的，是一只她们看不见的孩子。'),N('一只赤蛛，安静地爬进了中央通道的阴影。')]},
     {label:'让她们空等',action:()=>{C.flags.trap23='wait';},after:[H('让她们在两侧蹲着吧。蹲久了，腿会麻。')]}]};}}
 };
 function playIncident(id,done){
  const it=INC[id].play();st().seen.push(id);
  const sh=it.shots.filter(Boolean);
  sh.push({who:'overmind',line:it.q,choices:it.opts.map(o=>({label:o.label,detail:'',action:()=>{try{o.action();}catch(e){console.error(e);}persist();},next:()=>[...o.after.filter(Boolean)]}))});
  FILM.play(sh,()=>{done();},{chapter:'巢 · 低语'});
 }
 function pickInterlude(){
  const s=st();const pool=Object.keys(DEFS).filter(id=>!s.used.includes(id)&&(()=>{try{return DEFS[id].cond();}catch(e){return false;}})());
  if(!pool.length)return null;let tot=pool.reduce((a,id)=>a+DEFS[id].w,0),r=Math.random()*tot;for(const id of pool){r-=DEFS[id].w;if(r<=0)return id;}return pool[0];
 }
 function pickIncident(){
  const s=st();const pool=Object.keys(INC).filter(id=>!s.seen.includes(id)&&(()=>{try{return INC[id].cond();}catch(e){return false;}})());
  return pool.length?R(pool):null;
 }
 const _next=nextMission;
 nextMission=function(){
  try{
   if(HV()&&!qa()&&C.step<4&&!C.finished){
    const s=st(),gap=C.step;
    if(!s.done[gap]){s.done[gap]=1;const id=pickInterlude();if(id){persist();launch(id);return;}}
    if(!s.inc[gap]){s.inc[gap]=1;if(Math.random()<.7){const id=pickIncident();if(id){try{$('result').hidden=true;hideStory();}catch(e){}playIncident(id,()=>nextMission());return;}}}
   }
  }catch(e){console.error('m23',e);}
  return _next.apply(this,arguments);
 };

 /* ---------- 后果写进下一场大关 ---------- */
 const _mm=makeMission;
 makeMission=function(id){
  const s=_mm.apply(this,arguments);
  if(building||!HV()||qa()||s.saga)return s;
  try{
   const free=(x,y)=>!blocked(s,x,y)&&!unitAt(s,x,y)&&!s.relays.some(r=>r.x===x&&r.y===y)&&!s.exits.some(e=>e.x===x&&e.y===y)&&!s.delivery.some(d=>d.x===x&&d.y===y);
   const drop=(kind,side,rows)=>{for(const y of rows)for(const x of shuffle([0,1,2,3,4,5,6,7]))if(free(x,y)){const u=spawn(s,kind,side,x,y);return u;}return null;};
   s.fx23=[];
   if(C.flags.ambush23){for(let i=0;i<Math.min(2,C.flags.ambush23);i++)drop('spider','r',[6,5]);s.fx23.push('ambush');C.flags.ambush23=0;}
   if(C.flags.sentinel23){drop('sentinel','r',[1,2]);s.fx23.push('sentinel');C.flags.sentinel23=0;}
   if(C.flags.trap23==='exploit'){const u=drop('spider','r',[3,4]);if(u)s.fx23.push('trap');if(s.ai22){s.ai22.doc='blade';}C.flags.trap23=null;}else if(C.flags.trap23==='wait'){if(s.ai22){s.ai22.doc='wall';}s.fx23.push('trapwait');C.flags.trap23=null;}
   if(C.flags.exposed23){const g=s.units.find(u=>u.char===C.flags.exposed23&&u.side==='g'&&!u.dead);if(g){for(const y of [3,4])for(const x of shuffle([1,2,3,4,5,6]))if(free(x,y)&&g.y>4){g.x=x;g.y=y;}s.fx23.push('exposed:'+g.char);}C.flags.exposed23=null;}
   if(C.flags.leaderless23&&s.ai22){s.ai22.doc='broken';s.ai22.lead=null;s.fx23.push('leaderless:'+C.flags.leaderless23);C.flags.leaderless23=null;}
   if(C.flags.enraged23&&s.ai22){s.ai22.doc='blade';drop('drone','g',[7,6]);s.fx23.push('enraged:'+C.flags.enraged23);C.flags.enraged23=null;}
   if(Object.values(C.roster).some(r=>r.status==='reserve23'))s.fx23.push('reserve');
  }catch(e){console.warn('m23 fx',e);}
  return s;
 };
 if(typeof filmIntro==='function'){
  const _fi=filmIntro;
  filmIntro=function(mid){
   const shots=_fi.apply(this,arguments)||[];
   try{if(HV()&&S&&S.fx23&&S.fx23.length&&!qa()){
    const add=[];
    for(const f of S.fx23){const[k,id]=f.split(':');
     if(k==='ambush')add.push({bg:'film_corridor',tint:'dark',kb:'in',...N('暗渠的出口，就在她们背后。孩子们已经在那里等了很久。')});
     if(k==='sentinel')add.push(H('黑色的那一个，站在最前面。'));
     if(k==='trap')add.push(H('中间那条路上，已经有一只孩子在等着。'));
     if(k==='trapwait')add.push({...FEED,line:'……它们没有进来。两侧的人，继续等。'});
     if(k==='exposed')add.push({...FEED,who:id,side:'g',line:R(['……奇怪。我的位置，怎么被排在最前面了？','它答应过的。……它答应过的，对吧？'])});
     if(k==='leaderless')add.push({...FEED,line:`苍鹭频道里，没有人在下命令了。${nm(id)}的位置，是一片红。`});
     if(k==='enraged')add.push({...FEED,line:`为了${nm(id)}。所有人，不要留手。`});
     if(k==='reserve')add.push(N('有两个位置，今天空着。'));}
    if(add.length){let at=shots.findIndex(s=>s&&s.objective);if(at<0)at=shots.length;shots.splice(at,0,...add.filter(Boolean));}
   }}catch(e){console.warn('m23 intro',e);}
   return shots;
  };
 }

 /* ---------- 测试钩子（仅 #filmtest） ---------- */
 if(location.hash==='#filmtest'&&window.__MV_FILM__)Object.assign(window.__MV_FILM__,{
  i23:id=>launch(id),mv23:m=>performMove(m,true),end23:()=>endPhase(),hive23:()=>chooseAI(S,'r'), inc23:id=>playIncident(id,()=>{window.__INC23DONE=1;}),
  st23:()=>({kind:S&&S.kind23,res:S&&S.res23,outcome:S&&S.outcome,goals:S&&S.kind23?DEFS[S.kind23].goals(S):null,p23:C.p23,fx:S&&S.fx23,units:S&&S.units.filter(u=>!u.dead).map(u=>u.side+':'+(u.char||u.kind)+'@'+u.x+','+u.y)}),
  sim23:(id,k,ms)=>{
   newCampaign('r');try{hideStory();}catch(e){}
   for(const c of ['lyra','akira','lark','iris','kuro','sola','misa','veil','sera','celia'])if(C.roster[c]){C.roster[c].introduced=true;C.roster[c].status='active';C.roster[c].side='g';}
   for(const c of ['lark','akira'])C.roster[c].side='r';
   const def=DEFS[id];S=def.build(def.setup());S.kind23=id;let res=null;const t0=performance.now();
   for(let r=0;r<20&&!res;r++){
    for(const side of ['r','g']){for(const u of S.units)if(u.side===side)u.used=false;S.aiBudget=k;S.aiDone=0;
     for(let i=0;i<k&&!res;i++){const m=chooseAI(S,side);if(!m)break;applyBasic(S,m);const u=S.units.find(v=>v.uid===m.uid);if(u)u.used=true;S.aiDone++;const c=def.check(S);if(c)res=c;}
     if(res)break;}
    if(res)break;
    if(def.survive&&S.round>=S.k23.hatch){res=['win',def.survive];break;}
    if(S.round>=S.k23.limit){res=['lose',def.timeout];break;}
    S.round++;
   }
   return{id,res,round:S.round,ms:Math.round(performance.now()-t0)};
  },
  defs23:()=>Object.keys(DEFS).map(id=>id+':'+(()=>{try{return DEFS[id].cond();}catch(e){return 'ERR '+e.message;}})())
 });
})();
