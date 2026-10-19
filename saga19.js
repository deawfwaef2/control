/* ===== M19 命运模式 (FATE / SAGA MODE) =====
   A procedural, state-driven campaign. Nothing is pre-ordered: after every battle the director
   reads the station (hive spread, orbit, sectors), the cast (alive / taken / dead, who was rescued,
   who was left behind), the enemy's model of the player (favourite piece, play style) and the
   result, and writes the next chapter: structure, cold open, montage, a character scene, an enemy
   cross-cut, a timed Detroit-style choice, a generated board, mid-battle twists and sometimes a
   sudden-death rule. Winning and losing both move the story. No undo, no retry.
   Uses mid=5 so none of the scripted chapter logic (mid 0–4) fires. */
const SAGA19=(()=>{
 const KEY='mv-saga-19',MID=5;
 const POOL=['akira','lark','iris','misa','sera','vega','kuro','sola','celia','astra','veil','june','psalm','ruby','nyx','echo','noct'];
 const BEATS=['hook','rise','twist','crisis','climax'];
 const BEAT_CN={hook:'序幕',rise:'发展',twist:'转折',crisis:'危机',climax:'高潮'};
 /* ---------- seeded randomness + anti-repetition ---------- */
 function rnd(){const g=C.saga;g.seed=(g.seed+0x6D2B79F5)|0;let t=g.seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;}
 const R={f:rnd,i:n=>Math.floor(rnd()*n),pick:a=>a[Math.floor(rnd()*a.length)],chance:p=>rnd()<p,shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;},
  weighted(list){const tot=list.reduce((s,x)=>s+x[1],0);let r=rnd()*tot;for(const x of list){r-=x[1];if(r<=0)return x[0];}return list[list.length-1][0];}};
 function fresh(tag,pool){const u=C.saga.used[tag]=C.saga.used[tag]||[];let c=pool.map((_,i)=>i).filter(i=>!u.includes(i));if(!c.length){u.length=0;c=pool.map((_,i)=>i);}const i=R.pick(c);u.push(i);return pool[i];}
 const nm=id=>(CHAR[id]&&CHAR[id].name)||id;
 function tic(id,t){
  if(!t)return'';
  if(id==='sola')t=t.replace(/我(?!们)/g,'本小姐');
  if(id==='echo'){const m=t.replace(/[。！？…!?]+$/,'');t=m+'……'+m.slice(-2)+'，'+m.slice(-2)+'。';}
  if(id==='iris'&&rnd()<.45)t=t.replace(/[。]$/,'～');
  if(id==='psalm'&&rnd()<.3)t='♪ '+t+' ♪';
  if(id==='astra'&&rnd()<.3)t=t.replace(/[。]$/,`。……生还概率，${40+R.i(50)}.${R.i(10)}${R.i(10)}%。`);
  if(id==='ruby'&&rnd()<.25)t='本官认为——'+t;
  return t;
 }
 function L(id,v){if(typeof v==='string')return tic(id,v);return tic(id,v[VG19[id]||'warm']||v.warm||Object.values(v)[0]);}
 /* ---------- roster views ---------- */
 const rec=id=>C.roster[id];
 const isAlive=id=>rec(id)&&rec(id).status==='active';
 function squad(){return C.saga.squad.filter(id=>isAlive(id)&&rec(id).side==='g');}
 function taken(){return Object.keys(C.roster).filter(id=>rec(id).introduced&&isAlive(id)&&rec(id).side==='r');}
 function dead(){return Object.keys(C.roster).filter(id=>rec(id).introduced&&rec(id).status==='destroyed');}
 const bondsOf=id=>((typeof BW_BOND!=='undefined'&&BW_BOND[id])||[]);
 /* ---------- new saga ---------- */
 function newSaga(){
  runId++;busy=false;selected=null;undoStack=[];
  C={version:1,combatRules:2,side:'g',step:0,order:[0,1,2,3,4],route:null,roster:{},flags:{packetOwner:null,sampleOwner:null,keyOwner:null,mercy:null,taken17:[]},history:[],stats:{moves:0,enemyMoves:0,conversions:0,rescues:0,losses:0},finished:false,justiceInitialized:true};
  for(const id of Object.keys(CHAR))C.roster[id]={side:'g',status:'active',xp:0,introduced:false};
  C.saga={seed:(Date.now()^Math.floor(Math.random()*2147483647))|0,n:0,P:0,H:8,alt:404,temp:610,arc:{n:1,beat:0},used:{},squad:[],surv:[],nodes:[],mark:null,style:'balanced',streak:0,secrets:[],lastLost:[],grieved:[],newcomer:null,pendingPart2:null,ground:true,lastTypes:[],lastSecs:[],spot:[],cost:null,ended:null};
  const pool=R.shuffle(POOL);
  C.saga.squad=['lyra',...pool.slice(0,5)];C.saga.squad.forEach(id=>rec(id).introduced=true);
  C.saga.reserve=pool.slice(5);
  addSignal();addSignal();C.saga.surv.forEach(s=>s.clock++);
  document.body.classList.add('saga19');
  startChapter(planNext());
 }
 function addSignal(){
  const g=C.saga;if(!g.reserve.length)return null;const who=g.reserve.shift();
  const sec=R.pick(['dock','garden','bridge','archive','reactor','corridor','orbit']);
  const s={who,sec,clock:2+R.i(2)};g.surv.push(s);return s;
 }
 /* ---------- the director: what happens next ---------- */
 function planNext(){
  const g=C.saga;g.n++;
  if(g.ended)return null;
  if(g.P>=100)return makePlan('core',{finale:'g'});
  if(g.H>=100)return makePlan('lastevac',{finale:'h'});
  if(g.n>=15)return makePlan(g.P>=g.H?'core':'lastevac',{finale:g.P>=g.H?'g':'h'});
  if(g.pendingPart2){const p=g.pendingPart2;g.pendingPart2=null;return makePlan(p.type,{part:2,from:p});}
  const beat=BEATS[g.arc.beat];
  const W={hook:{breach:3,seize:3,intercept:2,rescue:2,escort:1},rise:{escort:3,seize:2,rescue:2,hunt:2,evac:2,intercept:2},twist:{hunt:3,escort:2,evac:2,duel:2,intercept:2,seize:1},crisis:{hold:3,evac:3,duel:3,hunt:2},climax:{hunt:4,hold:2,duel:2,seize:2}}[beat];
  let list=Object.entries(W).map(([t,w])=>[t,w]);
  const urgent=g.surv.some(s=>s.clock<=1);
  if(g.surv.length)list.push(['rescue',urgent?7:1.5]);
  if(!taken().length)list=list.filter(x=>x[0]!=='duel');
  if(!g.surv.length)list=list.filter(x=>x[0]!=='rescue');
  list=list.map(([t,w])=>[t,g.lastTypes.slice(-2).includes(t)?w*.15:w]);
  const type=R.weighted(list);
  const p=makePlan(type,{beat});
  if(['escort','evac','rescue','intercept'].includes(type)&&['rise','twist'].includes(beat)&&R.chance(.32))p.part=1;
  return p;
 }
 function makePlan(type,o={}){
  const g=C.saga,beat=o.beat||(o.finale?'climax':BEATS[g.arc.beat]);
  const p={type,n:g.n,beat,part:o.part||0,finale:o.finale||null,from:o.from||null,fx:{},choice:null,twist:null,sudden:null,need:0};
  // target girl
  if(type==='rescue'){const s=g.surv.slice().sort((a,b)=>a.clock-b.clock)[0];p.target=s.who;p.sec=s.sec;}
  if(type==='duel'){p.target=R.pick(taken());}
  if(o.from){p.sec=o.from.sec;p.layout=o.from.layout;p.target=o.from.target||p.target;}
  const secBy={core:'hive',lastevac:'reactor',hold:R.pick(['reactor','garden','dock']),duel:R.pick(['archive','corridor','orbit']),evac:R.pick(['bridge','corridor','dock']),escort:R.pick(['bridge','corridor','orbit']),hunt:R.pick(['garden','hive','corridor','reactor'])};
  if(!p.sec){let s=secBy[type]||R.pick(['dock','garden','bridge','archive','reactor','corridor','orbit']);if(g.lastSecs.slice(-1)[0]===s&&!secBy[type])s=R.pick(['dock','garden','bridge','archive','reactor','corridor','orbit'].filter(x=>x!==s));p.sec=s;}
  const sec=SECTOR19[p.sec];p.bg=R.pick(sec.bg);
  const base=fresh('title-'+type,TITLE19[type]||TITLE19.seize);
  p.title=base+(p.part===1?'（上）':p.part===2?'（下）':'');
  p.en=sec.en;
  // difficulty adapts to the streak — losing is never a dead end, winning is never free
  const diff=2+Math.min(4,g.n*.35)+Math.max(-2,Math.min(2,g.streak*.6))+(o.finale?1.5:0);
  p.enemy=Math.max(2,Math.min(7,Math.round(2+diff*.7)));
  p.limit={breach:9,seize:10,rescue:9,escort:10,intercept:7,hunt:9,hold:7,evac:9,duel:8,core:12,lastevac:10}[type]||9;
  if(type==='hold')p.limit=6+Math.min(2,Math.floor(g.n/4));
  // featured pair
  const sq=squad();const pickA=()=>{const pri=[...g.lastLost.flatMap(bondsOf),...(p.target?bondsOf(p.target):[])].filter(id=>sq.includes(id));const fresh=sq.filter(id=>!g.spot.slice(-3).includes(id));return pri[0]||R.pick(fresh.length?fresh:sq);};
  p.a=pickA();const bb=bondsOf(p.a).filter(id=>sq.includes(id)&&id!==p.a);p.b=bb[0]||R.pick(sq.filter(id=>id!==p.a))||p.a;
  g.spot.push(p.a);
  // twist & sudden death
  const tw={hook:.3,rise:.5,twist:1,crisis:.7,climax:.6}[beat];
  if(R.chance(tw)&&!o.finale)p.twist=pickTwist(p);
  const sdChance={hook:.05,rise:.15,twist:.25,crisis:.5,climax:.75}[beat];
  if(o.finale||R.chance(sdChance))p.sudden=pickSudden(p);
  if(p.twist&&p.twist.kind==='overload'&&p.sudden)p.twist=null;
  p.deploy=g.n===1||!!o.finale;
  return p;
 }
 function pickTwist(p){
  const opts=[['wave',3],['breach',2]];
  if(taken().length&&p.type!=='duel')opts.push(['arrival',3]);
  if(C.saga.surv.length&&p.type!=='rescue')opts.push(['survivor',2]);
  if(!p.sudden)opts.push(['overload',1.5]);
  if(C.saga.streak<=-2&&C.saga.ground)opts.push(['ally',4]);
  return{kind:R.weighted(opts),round:3+R.i(3),done:false,warned:false};
 }
 function pickSudden(p){
  const opts=[];
  if(['hold','escort','seize','breach','core'].includes(p.type))opts.push('reach');
  if(p.type!=='rescue')opts.push('vip');
  if(['hunt','core','hold','seize','duel','breach'].includes(p.type))opts.push('kill');
  const kind=R.pick(opts);
  if(kind==='reach')return{kind,label:R.pick(['反应堆注入口','逃生舱发射轨','地球通讯阵列','维生总阀']),on:true};
  if(kind==='vip')return{kind,who:R.pick(['lyra',p.a].filter(id=>squad().includes(id)))||p.a,on:true};
  return{kind:'kill',on:true};
 }
 /* ---------- board generation ---------- */
 const LAYOUTS=[
  ()=>['2,2','5,2','2,5','5,5'],()=>['3,3','4,3','3,4','4,4'],()=>['1,3','2,3','5,4','6,4'],()=>['0,3','1,3','3,3','4,3','6,3','7,3'],
  ()=>['2,2','2,3','5,4','5,5'],()=>['3,2','4,5','1,4','6,3'],()=>['2,4','3,4','4,3','5,3'],
  ()=>{const w=new Set();const n=3+R.i(3);while(w.size<n*2){const x=R.i(4),y=2+R.i(4);w.add(key(x,y));w.add(key(7-x,7-y));}return[...w];}
 ];
 function connected(walls){
  const bl=new Set(walls);const seen=new Set();const q=[];for(let x=0;x<8;x++)if(!bl.has(key(x,7))){q.push([x,7]);seen.add(key(x,7));}
  while(q.length){const[x,y]=q.shift();if(y===0)return true;for(const[dx,dy]of DIR8){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(nx<0||ny<0||nx>7||ny>7||bl.has(k)||seen.has(k))continue;seen.add(k);q.push([nx,ny]);}}
  return false;
 }
 function freeCells(s,rows,avoid=[]){const out=[];for(const y of rows)for(let x=0;x<8;x++){const k=key(x,y);if(!blocked(s,x,y)&&!unitAt(s,x,y)&&!avoid.includes(k)&&!s.exits.some(e=>e.x===x&&e.y===y)&&!s.relays.some(r=>r.x===x&&r.y===y))out.push({x,y});}return out;}
 function put(s,kind,side,cells,char=null,uid=null){const c=cells.length?cells.splice(R.i(cells.length),1)[0]:null;if(!c)return null;return spawn(s,kind,side,c.x,c.y,char,uid);}
 function buildState(p){
  const s={mid:MID,round:1,phase:'player',spent:0,aiBudget:0,aiDone:0,limit:Math.max(5,p.limit+(p.fx.limit||0)+(p.fx.easy?1:0)),holdTarget:99,units:[],walls:[],voids:[],doors:[],relays:[],loot:[],exits:[],delivery:[],logs:[],serial:1,
   flags:{conversionsG:[],conversionsR:[],courierEscaped:false,delivered:null,gatesOpen:false,survived:false},counts:{g:0,r:0},captureSeen:{},events:[],outcome:null,lastMove:null,collapsed:false,collapseAt:99,ventStart:99,spawnEvery:p.type==='core'?2:99,
   saga:{type:p.type,held:0,hazard:[],need:0,startSquad:[],stat:{},kills:0,waits:0,moves:0,sudden:p.sudden?{...p.sudden}:null,twist:p.twist?{...p.twist}:null,target:p.target||null,alphaFlee:p.type==='hunt'?3:99}};
  S=s;
  let walls=p.layout||null;
  if(!walls){for(let t=0;t<8;t++){const w=R.pick(LAYOUTS)();if(connected(w)){walls=w;break;}}walls=walls||['2,2','5,2','2,5','5,5'];if(p.sec==='hive'){const extra=['1,2','6,5','3,1','4,6'].filter(()=>R.chance(.5));if(connected([...walls,...extra]))walls=[...walls,...extra];}}
  p.layout=walls;s.walls=walls.slice();
  const T=p.type,sd=s.saga;
  // exits / relays / special objects
  if(T==='evac'||T==='lastevac'){s.exits.push({x:0,y:0,side:'g'},{x:7,y:0,side:'g'});sd.need=Math.max(1,Math.min(3,squad().length-1)+(p.fx.need||0));}
  if(T==='rescue'){s.exits.push({x:R.chance(.5)?0:7,y:7,side:'g'});}
  if(T==='escort'){s.exits.push({x:R.chance(.5)?0:7,y:0,side:'g'});}
  if(T==='intercept'){const left=R.chance(.5);s.exits.push({x:left?0:7,y:4+R.i(2),side:'r'});sd.courierFrom=left?7:0;}
  if(T==='hunt'){s.exits.push({x:R.chance(.5)?0:7,y:0,side:'r'});}
  if(T==='seize'||T==='breach'){const spots=R.shuffle([[1,3],[6,3],[3,2],[4,4],[1,5],[6,2]]).filter(([x,y])=>!s.walls.includes(key(x,y)));const n=T==='seize'?2:1+R.i(2);const names=R.shuffle(['主控终端','气闸控制台','维生分配器','灯光总闸','门禁核心']);for(let i=0;i<n&&i<spots.length;i++)s.relays.push({x:spots[i][0],y:spots[i][1],owner:i===0&&T==='seize'&&R.chance(.4)?'r':null,name:names[i]});}
  // guardians
  const benched=p.fx.bench?[p.fx.bench]:[];
  let roster=squad().filter(id=>!benched.includes(id)&&id!==p.target);
  const must=[p.a,p.b,p.fx.bait,p.sudden&&p.sudden.who].filter(id=>id&&roster.includes(id));
  roster=[...new Set([...must,...R.shuffle(roster)])].slice(0,6);
  const rowsG=p.fx.advance?[5,6]:[6,7];
  let gcells=freeCells(s,rowsG);
  if(p.fx.flank){const side=R.chance(.5);gcells=gcells.filter(c=>side?c.x<=3:c.x>=4);if(gcells.length<roster.length)gcells=freeCells(s,[5,6,7]);}
  for(const id of roster){if(id===p.fx.bait){const c=freeCells(s,[4,3]);const cc=c.length?c[R.i(c.length)]:null;if(cc){spawn(s,'mech','g',cc.x,cc.y,id);continue;}}put(s,'mech','g',gcells,id);}
  if(roster.length<4||R.chance(.35))put(s,'drone','g',freeCells(s,[6,7]));
  if(T==='escort'){const c=freeCells(s,[6]);const u=put(s,'capsule','g',c,null,'ark');if(u)s.loot.push({id:'ark',name:'方舟匣',carrier:'ark',side:'g',x:null,y:null,lost:false});}
  if(T==='hold'){const c=freeCells(s,[7]).filter(c=>c.x>=2&&c.x<=5);put(s,'capsule','g',c.length?c:freeCells(s,[7]),null,'pod');}
  if(T==='rescue'&&p.target){const c=freeCells(s,[2,3]).filter(c=>c.x>=1&&c.x<=6);put(s,'mech','g',c.length?c:freeCells(s,[2,3]),p.target);rec(p.target).introduced=true;}
  sd.startSquad=s.units.filter(u=>u.char&&u.side==='g').map(u=>u.char);
  // hive
  const enemy=Math.max(1,p.enemy+(p.fx.enemy||0)-(p.fx.easy?1:0));
  let rcells=freeCells(s,[0,1,2]);
  if(T==='core'){spawn(s,'core','r',R.chance(.5)?3:4,0,null,'hive');s.spawnEvery=2;rcells=freeCells(s,[0,1,2]);}
  if(T==='hunt'||T==='lastevac'||(p.sudden&&p.sudden.kind==='kill')){const c=p.fx.bait?freeCells(s,[2,3]):freeCells(s,[0,1]);const a=put(s,'spider','r',c.length?c:rcells,null,'alpha');rcells=freeCells(s,[0,1,2]);}
  if(T==='intercept'){const c=freeCells(s,[3,4]).filter(c=>Math.abs(c.x-sd.courierFrom)<=1);put(s,'courier','r',c.length?c:freeCells(s,[3]),null,'courier');}
  if((T==='duel'||p.fx.spare)&&p.target){const c=freeCells(s,[1,2]).filter(c=>c.x>=2&&c.x<=5);put(s,'mech','r',c.length?c:rcells,p.target);rcells=freeCells(s,[0,1,2]);}
  // other taken girls may stand with the hive when it is strong
  for(const id of taken()){if(id===p.target)continue;if(S.units.some(u=>u.char===id))continue;if(C.saga.H>35&&R.chance(.35)||p.finale){put(s,'mech','r',rcells,id);}}
  for(let i=0;i<enemy;i++)put(s,'spider','r',rcells);
  if(T==='rescue'&&p.target){const tu=charter(s,p.target);if(tu){for(const[dx,dy]of R.shuffle(DIR8).slice(0,2)){const x=tu.x+dx,y=Math.max(0,tu.y+dy-1);if(!blocked(s,x,y)&&!unitAt(s,x,y)){spawn(s,'spider','r',x,y);break;}}}}
  if(C.saga.n>=4&&R.chance(.4))put(s,'sentinel','r',freeCells(s,[0]));
  // hazards: evac sweeps up from the bottom, breach collapses a column
  if(T==='evac'||T==='lastevac'){for(let r=0;r<5;r++)sd.hazard.push({round:3+r*2,cells:Array.from({length:8},(_,x)=>key(x,7-r)),collapse:true});}
  s.initial=s.units.filter(u=>u.char).map(u=>({char:u.char,side:u.side}));
  if(p.fx.shield)sd.shield=true;
  sd.spare=!!p.fx.spare;
  if(p.fx.sync)for(const u of s.units)if(u.char&&u.side==='g')u.xp=Math.max(u.xp,2);
  if(p.fx.trust){const u=charter(s,p.a);if(u)u.xp=Math.max(u.xp,2);}
  if(sd.sudden&&sd.sudden.kind==='reach'){const row=freeCells(s,[7]).filter(c=>!s.units.some(u=>u.x===c.x&&u.y===c.y));const cells=R.shuffle(row).slice(0,2).map(c=>key(c.x,c.y));sd.sudden.cells=cells.length?cells:[key(3,7)];}
  if(p.twist&&p.twist.kind==='overload')sd.sudden=null;
  return s;
 }
 /* ---------- objectives ---------- */
 function goals(s){
  const sd=s.saga,T=sd.type,m=[],x=[];const tgt=sd.target&&charter(s,sd.target);
  const esc=s.units.filter(u=>u.side==='g'&&u.escaped).length;
  if(T==='seize'||T==='breach'){const n=s.relays.length,own=relayCount(s,'g');m.push({text:`控制全部 ${n} 座终端（${own}/${n}）`,done:own===n});if(T==='seize')m.push({text:`保持全部终端到轮末（${sd.held}/1）`,done:sd.held>=1});}
  if(T==='rescue')m.push({text:`让${nm(sd.target)}从出口撤离（她被感染或损毁即失败）`,done:!!tgt&&tgt.escaped&&tgt.side==='g'});
  if(T==='escort'){const l=lootById(s,'ark');m.push({text:'把方舟匣送到远端出口',done:!!l&&l.evacuated&&l.side==='g'});}
  if(T==='intercept'){const c=s.units.find(u=>u.uid==='courier');m.push({text:'在信使逃出侧舱口之前击毁它',done:!!c&&c.dead});}
  if(T==='hunt'){const a=s.units.find(u=>u.uid==='alpha');m.push({text:'击杀蛛母（它会在第 3 轮后开始撤离）',done:!!a&&a.dead});}
  if(T==='hold'){m.push({text:`守住医疗舱，撑过第 ${s.limit} 轮`,done:s.round>s.limit||!!sd.survived});}
  if(T==='evac'||T==='lastevac')m.push({text:`让 ${sd.need} 个己方单位从顶部出口撤离（${esc}/${sd.need}）`,done:esc>=sd.need});
  if(T==='duel'){if(sd.spare)m.push({text:`撑过第 ${s.limit} 轮，不让她突破`,done:!!sd.survived});else m.push({text:`击毁${nm(sd.target)}的载体`,done:!!tgt&&tgt.dead});}
  if(T==='core'){const c=s.units.find(u=>u.kind==='core');m.push({text:'吃掉赤巢内核',done:!!c&&c.dead});}
  x.push({text:'本章没有机娘被感染或损毁',done:!s.units.some(u=>u.char&&sd.startSquad.includes(u.char)&&(u.dead||u.side==='r'))});
  return{main:m,extra:x};
 }
 function suddenText(sd){
  if(!sd)return'';
  if(sd.kind==='reach')return`生死局：任何赤巢单位踏上红框标记的「${sd.label}」，守护者立即全线崩溃。`;
  if(sd.kind==='vip')return`生死局：${nm(sd.who)}是唯一握有坐标的人——她被感染或损毁，守护者立即失败。`;
  if(sd.kind==='kill')return'生死局：蛛母是蜂群的神经节点——击杀它，赤巢这一侧立即瓦解。';
  return'';
 }
 /* ---------- battle rules ---------- */
 function check(){
  if(!S||S.outcome)return true;const sd=S.saga;const sdd=sd.sudden;
  if(sdd&&sdd.on){
   if(sdd.kind==='reach'&&S.units.some(u=>onBoard(u)&&u.side==='r'&&(sdd.cells||[]).includes(key(u.x,u.y)))){resolve(false,`赤巢单位踏上了「${sdd.label}」。生死局判负。`,'sudden');return true;}
   if(sdd.kind==='vip'){const u=charter(S,sdd.who);if(u&&(u.dead||u.side==='r')){resolve(false,`${nm(sdd.who)}${u.dead?'倒下了':'被赤巢接管了'}。坐标随她一起消失——生死局判负。`,'sudden');return true;}}
   if(sdd.kind==='kill'){const a=S.units.find(u=>u.uid==='alpha');if(a&&a.dead){resolve(true,'蛛母被击杀，整个蜂群失去了神经节点。生死局判胜。','sudden');return true;}}
  }
  const T=sd.type,G=goals(S);
  if(G.main.length&&G.main.every(g=>g.done)){resolve(true,'主要目标达成。');return true;}
  if(T==='rescue'){const t=charter(S,sd.target);if(!t||t.dead||t.side==='r'){resolve(false,t&&t.side==='r'?`${nm(sd.target)}被赤蛛扑中了胸口。你们晚了一步。`:`${nm(sd.target)}没能撑到出口。`);return true;}}
  if(T==='escort'){const l=lootById(S,'ark');if(l&&l.side==='r'&&l.evacuated){resolve(false,'方舟匣被赤巢带走了。');return true;}const ark=S.units.find(u=>u.uid==='ark');if(ark&&ark.dead&&l&&!l.carrier&&l.x===null){resolve(false,'方舟匣被摧毁了。');return true;}}
  if(T==='intercept'&&S.flags.courierEscaped){resolve(false,'信使逃出了侧舱口。它带走的东西，下一章会回来找你们。');return true;}
  if(T==='hunt'){const a=S.units.find(u=>u.uid==='alpha');if(a&&a.escaped){resolve(false,'蛛母钻进了巢道。它记住了你们每一个人的样子。');return true;}}
  if(T==='hold'){const pod=S.units.find(u=>u.uid==='pod');if(pod&&pod.dead){resolve(false,'医疗舱被攻破了。');return true;}}
  if(T==='duel'&&!sd.spare){const t=charter(S,sd.target);if(t&&t.escaped){resolve(false,`${nm(sd.target)}退进了黑暗里。`);return true;}}
  if(T==='evac'||T==='lastevac'){const esc=S.units.filter(u=>u.side==='g'&&u.escaped).length;const left=movers(S,'g').length;if(esc+left<sd.need){resolve(false,'能撤出去的人，已经不够了。');return true;}}
  if(T!=='evac'&&T!=='lastevac'&&movers(S,'g').filter(u=>u.kind!=='capsule').length===0){resolve(false,'所有可行动的机娘都已倒下或被接管。');return true;}
  return false;
 }
 function hazardNow(s){return(s.saga.hazard||[]).filter(h=>h.round===s.round).flatMap(h=>h.cells).filter(k=>!s.walls.includes(k)&&!s.voids.includes(k)&&!s.exits.some(e=>key(e.x,e.y)===k));}
 function environment(){
  const sd=S.saga;
  const hz=(sd.hazard||[]).filter(h=>h.round===S.round);
  if(hz.length){const cells=hazardNow(S);for(const u of pieces(S).filter(u=>cells.includes(key(u.x,u.y))))destroyFromEnvironment(u,true);S.voids.push(...cells);radio('系统','舱体又塌下去一段。脚下只剩更少的路。');sfx('alarm');}
  if(S.spawnEvery===2&&S.units.some(u=>u.kind==='core'&&!u.dead)&&S.round%2===0){const c=freeCells(S,[0,1]);if(c.length&&pieces(S,'r').filter(u=>u.kind==='spider').length<9){const pp=c[R.i(c.length)];const u=spawn(S,'spider','r',pp.x,pp.y);if(u){u.used=true;addLog(`赤巢内核产出新赤蛛：${xy(u.x,u.y)}。`,'capture');}}}
  if(sd.type==='seize')sd.held=S.relays.length&&relayCount(S,'g')===S.relays.length?sd.held+1:0;
  runTwist();
  if(check())return true;
  if(S.round>=S.limit){
   if(sd.type==='hold'||(sd.type==='duel'&&sd.spare)){sd.survived=true;resolve(true,'撑住了。门还在，人还在。');return true;}
   resolve(false,'作战窗口耗尽。站体的这一段，从此不再属于你们。');return true;
  }
  return false;
 }
 function runTwist(){
  const tw=S.saga.twist;if(!tw||tw.done)return;
  const W={wave:'通风管道里有很多脚步声……在靠近。',breach:'结构应力异常。很快会有一段舱体塌下去。',arrival:'有一个信号在靠近。……那个频率，我们认得。',survivor:'等等——附近有求救信号！',overload:'反应堆读数在飙升……不太对劲。',ally:'地面回话了：增援已经在路上。'};
  if(!tw.warned&&S.round>=tw.round-2){tw.warned=true;radio('战术频道',W[tw.kind]);try{boardSay(R.pick(squad()),W[tw.kind],{priority:true});}catch(e){}if(S.round<tw.round-1)return;}
  if(S.round<tw.round-1)return;
  tw.done=true;
  if(tw.kind==='breach'){const col=R.pick([1,2,5,6]);const cells=[2,3,4,5].map(y=>key(col,y));S.saga.hazard.push({round:S.round+1,cells});radio('系统',`${'ABCDEFGH'[col]} 列中段即将坍塌！橙色闪烁格会在下一轮末消失。`);}
  if(tw.kind==='wave'){const c=freeCells(S,[0]);for(let i=0;i<2&&c.length;i++){const u=put(S,'spider','r',c);if(u)u.used=true;}radio('战术频道','它们从通风口里涌出来了！');try{SND16.play('alarm');}catch(e){}}
  if(tw.kind==='arrival'){const id=taken().find(id=>!S.units.some(u=>u.char===id&&onBoard(u)));if(id){const c=freeCells(S,[0,1]);const u=put(S,'mech','r',c,id);if(u){u.used=true;setTimeout(()=>{try{boardSay(id,R.pick(CAST17[id]?.bw||['……我回来了。']),{priority:true});}catch(e){}},600);const f=squad().find(x=>bondsOf(id).includes(x));if(f)setTimeout(()=>{try{boardSay(f,`${nm(id)}……？！`,{priority:true});}catch(e){}},2600);}}}
  if(tw.kind==='survivor'){const s=C.saga.surv.find(s=>s.who!==S.saga.target);if(s){const c=freeCells(S,[3,4]);const u=put(S,'mech','g',c,s.who);if(u){rec(s.who).introduced=true;C.saga.surv=C.saga.surv.filter(x=>x!==s);if(!C.saga.squad.includes(s.who))C.saga.squad.push(s.who);S.saga.startSquad.push(s.who);u.used=false;setTimeout(()=>{try{boardSay(s.who,FOUND19[s.who]||'……终于有人来了。',{priority:true});}catch(e){}},500);addLog(`${nm(s.who)}从隔间里冲了出来，加入战斗。`,'good');}}}
  if(tw.kind==='overload'){const row=freeCells(S,[7]);const cells=R.shuffle(row).slice(0,2).map(c=>key(c.x,c.y));S.saga.sudden={kind:'reach',label:'反应堆注入口',cells:cells.length?cells:[key(3,7)],on:true};showSudden(true);radio('系统','反应堆过载！从现在起——任何赤巢单位进入注入口，全站熔毁！');}
  if(tw.kind==='ally'){const c=freeCells(S,[7]);const u=put(S,'sentinel','g',c);if(u)radio('苍穹防线','轨道哨塔已投放。坚持住。');}
  render();
 }
 /* ---------- AI: the hive plays to the generated objective ---------- */
 function aiTarget(s,u){
  const sd=s.saga;if(u.side!=='r')return null;
  if(u.uid==='courier'){return s.exits.find(e=>e.side==='r');}
  if(u.uid==='alpha'&&sd.type==='hunt'&&s.round>=sd.alphaFlee){return s.exits.find(e=>e.side==='r');}
  const mark=C.saga.mark&&s.units.find(v=>v.char===C.saga.mark&&onBoard(v)&&v.side==='g');
  if(sd.sudden&&sd.sudden.on&&sd.sudden.kind==='reach'&&u.kind==='spider'&&(u.uid.charCodeAt(u.uid.length-1)%2===0)){const k=sd.sudden.cells[0].split(',').map(Number);return{x:k[0],y:k[1]};}
  if(sd.sudden&&sd.sudden.on&&sd.sudden.kind==='vip'){const v=charter(s,sd.sudden.who);if(v&&onBoard(v)&&v.side==='g'&&distance(u,v)<=4)return v;}
  if(sd.type==='hold'){const pod=s.units.find(v=>v.uid==='pod'&&onBoard(v));if(pod)return pod;}
  if(sd.type==='escort'){const l=lootById(s,'ark');const c=l&&s.units.find(v=>v.uid===l.carrier&&onBoard(v));if(c&&c.side==='g')return c;if(l&&!l.carrier&&l.x!==null)return l;}
  if(sd.type==='rescue'){const t=charter(s,sd.target);if(t&&onBoard(t)&&t.side==='g')return t;}
  if(sd.type==='seize'||sd.type==='breach'){const r=s.relays.filter(r=>r.owner!=='r').sort((a,b)=>distance(u,a)-distance(u,b))[0];if(r&&u.kind!=='spider')return r;if(r&&R.chance(.5))return r;}
  if(mark&&distance(u,mark)<=5&&u.kind==='spider')return mark;
  if(sd.type==='evac'||sd.type==='lastevac'){const t=movers(s,'g').sort((a,b)=>distance(u,a)-distance(u,b))[0];if(t)return t;}
  return null;
 }
 function aiScore(s,side){
  const sd=s.saga;let sc=0;const sgn=side==='r'?1:-1;
  if(sd.type==='hold'){const pod=s.units.find(v=>v.uid==='pod');if(pod&&pod.dead)sc+=900*sgn;}
  if(sd.type==='intercept'){const c=s.units.find(v=>v.uid==='courier');if(s.flags.courierEscaped)sc+=900*sgn;else if(c&&onBoard(c)){const e=s.exits.find(e=>e.side==='r');sc+=(10-distance(c,e))*20*sgn;}}
  if(sd.type==='hunt'){const a=s.units.find(v=>v.uid==='alpha');if(a&&a.escaped)sc+=900*sgn;if(a&&a.dead)sc-=900*sgn;else if(a&&onBoard(a)&&s.round>=sd.alphaFlee){const e=s.exits.find(e=>e.side==='r');sc+=(10-distance(a,e))*22*sgn;}}
  if(sd.sudden&&sd.sudden.on){if(sd.sudden.kind==='reach'){const cells=(sd.sudden.cells||[]).map(k=>k.split(',').map(Number));const sp=movers(s,'r');if(sp.length&&cells.length)sc+=sgn*(14-Math.min(...sp.flatMap(u=>cells.map(([x,y])=>distance(u,{x,y})))))*9;if(sp.some(u=>(sd.sudden.cells||[]).includes(key(u.x,u.y))))sc+=2000*sgn;}
   if(sd.sudden.kind==='kill'){const a=s.units.find(v=>v.uid==='alpha');if(a&&a.dead)sc-=2000*sgn;}
   if(sd.sudden.kind==='vip'){const v=charter(s,sd.sudden.who);if(v&&(v.dead||v.side==='r'))sc+=2000*sgn;}}
  const mark=C.saga.mark&&s.units.find(v=>v.char===C.saga.mark);if(mark&&mark.side==='r')sc+=120*sgn;
  if(sd.type==='rescue'){const t=charter(s,sd.target);if(t&&(t.dead||t.side==='r'))sc+=700*sgn;if(t&&onBoard(t)&&t.side==='g'){const e=s.exits.find(e=>e.side==='g');if(e)sc-=(10-distance(t,e))*14*sgn;}}
  if(sd.type==='escort'){const l=lootById(s,'ark');const c=l&&s.units.find(v=>v.uid===l.carrier&&onBoard(v));const e=s.exits.find(e=>e.side==='g');if(c&&e&&c.side==='g')sc-=(10-distance(c,e))*14*sgn;}
  if(sd.type==='evac'||sd.type==='lastevac'){sc-=s.units.filter(u=>u.side==='g'&&u.escaped).length*120*sgn;}
  return sc;
 }
 /* ---------- resolution ---------- */
 function resolve(won,reason,how){
  if(S.outcome)return;runId++;busy=false;S.phase='over';S.outcome={won,reason,how:how||''};undoStack=[];
  try{syncRoster();}catch(e){}
  render();try{sfx(won?'victory':'defeat');}catch(e){}
  persistNow();
  setTimeout(()=>after(won,reason,how),1100);
 }
 function after(won,reason,how){
  const g=C.saga,p=g.cur,sd=S.saga;
  // who did we lose in THIS chapter
  const lostNow=[],takenNow=[];
  for(const u of S.units)if(u.char&&sd.startSquad.includes(u.char)){if(u.dead)lostNow.push(u.char);else if(u.side==='r'){takenNow.push(u.char);if(!C.flags.taken17.includes(u.char))C.flags.taken17.push(u.char);}}
  for(const u of S.units)if(u.char&&u.side==='r'&&!sd.startSquad.includes(u.char)&&u.dead){rec(u.char).status='destroyed';}
  const cons=[];
  // rescue / abandon / bench consequences
  if(p.type==='rescue'&&p.target){
   g.surv=g.surv.filter(s=>s.who!==p.target);
   if(won&&isAlive(p.target)&&rec(p.target).side==='g'){if(!g.squad.includes(p.target))g.squad.push(p.target);g.newcomer=p.target;cons.push(`${nm(p.target)}加入了小队。`);C.stats.rescues++;}
   else if(isAlive(p.target)){rec(p.target).side='r';if(!C.flags.taken17.includes(p.target))C.flags.taken17.push(p.target);if(!takenNow.includes(p.target))takenNow.push(p.target);}
  }
  if(p.fx.abandon){const id=p.fx.abandon;g.surv=g.surv.filter(s=>s.who!==id);rec(id).introduced=true;rec(id).side='r';C.flags.taken17.push(id);cons.push(`你们没有回头。${nm(id)}的信号，在身后熄灭了。`);g.cost=id;}
  if(p.fx.bench){const id=p.fx.bench;const roll=R.f();const back=won?roll<.78:roll<.38;
   if(back){cons.push(`${nm(id)}一瘸一拐地走回了集合点。她还活着。`);}
   else if(R.chance(.5)){rec(id).status='destroyed';lostNow.push(id);cons.push(`${nm(id)}没有回来。断后的位置上，只剩下她的武器。`);g.cost=id;}
   else{rec(id).side='r';C.flags.taken17.push(id);takenNow.push(id);cons.push(`${nm(id)}没有回来。后来，有人在红区里看见了她——她在笑。`);g.cost=id;}}
  if(p.fx.warm&&won&&g.reserve.length){const id=g.reserve.shift();rec(id).introduced=true;g.squad.push(id);g.newcomer=id;cons.push(`医疗舱里的人醒了——是${nm(id)}。她加入了小队。`);}
  if(p.fx.leaveBehind){for(const u of S.units)if(u.char&&u.side==='g'&&onBoard(u)&&sd.startSquad.includes(u.char)&&R.chance(.5)){rec(u.char).side='r';if(!C.flags.taken17.includes(u.char))C.flags.taken17.push(u.char);takenNow.push(u.char);cons.push(`舱门合上的时候，${nm(u.char)}还在另一边。`);}}
  if(p.fx.spare&&p.target){cons.push(`${nm(p.target)}退回了黑暗里。她回头看了一眼。`);}
  // survivor clocks
  for(const s of g.surv.slice()){s.clock--;if(s.clock<0){g.surv=g.surv.filter(x=>x!==s);rec(s.who).introduced=true;rec(s.who).side='r';C.flags.taken17.push(s.who);cons.push(`${nm(s.who)}的求救信号停了。没有人赶到${SECTOR19[s.sec].name}。`);}}
  // meters
  const bonus=p.beat==='climax'?10:p.beat==='crisis'?5:0;
  if(won){g.P=Math.min(100,g.P+13+bonus+(p.fx.defy?6:0)+(p.type==='rescue'?3:0));g.H=Math.max(0,g.H-3);g.streak=g.streak>=0?g.streak+1:1;}
  else{g.H=Math.min(100,g.H+13+bonus+(p.fx.H||0)+(p.type==='intercept'?8:0));g.P=Math.min(100,g.P+3);g.streak=g.streak<=0?g.streak-1:-1;if(p.fx.defy)g.ground=false;}
  if(p.fx.H&&won)g.H=Math.min(100,g.H+p.fx.H);
  g.H=Math.min(100,g.H+takenNow.length*4);
  g.alt=Math.max(300,g.alt-(won?1:4)-R.i(3));g.temp=Math.min(1200,g.temp+(won?10:45)+R.i(30));
  // the enemy learns: favourite piece + style
  const st=sd.stat;const fav=Object.entries(st).sort((a,b)=>b[1]-a[1])[0];g.mark=fav&&fav[1]>=3&&isAlive(fav[0])&&rec(fav[0]).side==='g'?fav[0]:null;
  g.style=sd.moves?(sd.kills/sd.moves>.28?'aggressive':sd.waits/sd.moves>.25||sd.kills/sd.moves<.1?'cautious':'balanced'):'balanced';
  g.lastLost=[...lostNow,...takenNow];
  g.lastTypes.push(p.type);g.lastSecs.push(p.sec);
  // flowchart node
  g.nodes.push({n:p.n,title:p.title,type:p.type,sec:p.sec,beat:p.beat,won,reason,how:how||'',lost:lostNow,taken:takenNow,choice:p.choice,cons,sudden:!!(S.saga.sudden)});
  // two-part continuation
  if(p.part===1){const cont=won?R.pick(['hold','seize']):(takenNow.length?'duel':'evac');g.pendingPart2={type:cont,sec:p.sec,layout:p.layout,target:cont==='duel'?takenNow[0]:null};}
  // arc
  if(!p.part||p.part===2){g.arc.beat++;if(g.arc.beat>4){g.arc.n++;g.arc.beat=0;addSignal();}}
  if(g.n%2===0)addSignal();
  // finale outcomes
  let ending=null;
  if(p.finale==='g'){if(won){ending=(dead().length+taken().length)<=2?'dawn':'ash';}else{g.H=100;}}
  if(p.finale==='h'){ending=won?'fall':'hive';}
  if(ending){g.ended=ending;}
  const next=ending?null:planNext();
  g.next=next;
  persistNow();
  FILM.play(outcomeShots(p,won,reason,how,cons,lostNow,takenNow,next,ending),()=>showFlow(()=>{if(ending){showEnding(ending);}else startChapter(next);}),{chapter:`第${p.n}章 · 结算`});
 }
 /* ---------- film composition ---------- */
 function ctx(p){
  const g=C.saga,sec=SECTOR19[p.sec];const h=(g.n*7+R.i(24))%24,mi=R.i(60);
  const surv=g.surv[0];
  return{R,L,nm,sec,bg:p.bg,clock:`T+${16+g.n}日 ${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}`,H:g.H,P:g.P,alt:g.alt,temp:g.temp,alive:squad().length,taken:taken().length,dead:dead().length,
   survivor:surv&&surv.who,survivorSec:surv&&SECTOR19[surv.sec].name,lastLost:g.lastLost[0],lost:g.lastLost[0],mem:id=>typeof MEM17!=='undefined'&&MEM17[id]?`${MEM17[id]}，还在原处。`:'她的东西还在原处。',
   mark:g.mark,taken1:p.target&&taken().includes(p.target)?p.target:(g.lastLost.find(id=>taken().includes(id))||taken()[0]),target:p.target,a:p.a,b:p.b,costName:g.cost?nm(g.cost):'一个人',
   Rp:id=>L(id,R.pick((CAST17[id]&&CAST17[id].bw)||['……来。']))};
 }
 function titleShot(p){const g=C.saga;return{bg:p.bg,kb:'in',title:{k:`第${g.n}章 · ${p.finale?'终局':BEAT_CN[p.beat]||''}`,m:p.title,s:`CHAPTER ${String(g.n).padStart(2,'0')} · ${p.en}${p.part?` · PART ${p.part}`:''}`},sfx:'pulse',hold:2200};}
 function montage(p,c,n){
  const u=C.saga.used.mont=C.saga.used.mont||[];if(u.length>MONT19.length-n-2)u.splice(0,u.length-4);
  const idx=R.shuffle(MONT19.map((_,i)=>i)).sort((a,b)=>(u.includes(a)?1:0)-(u.includes(b)?1:0));const items=[];
  for(const i of idx){if(items.length>=n)break;let r=null;try{r=MONT19[i](c);}catch(e){}if(r){items.push(r);u.push(i);}}
  const bgs=R.shuffle([...SECTOR19[p.sec].bg,'film_orbit','film_corridor','station']);
  return items.map((s,i)=>({...s,bg:bgs[i%bgs.length],kb:R.pick(['in','left','right','up']),auto:2300,cut:R.pick(['push','pushl','wipe'])}));
 }
 function coldOpen(p,c){const pool=COLD19.filter(x=>x.t===p.type||x.t==='*');const pick=fresh('cold-'+p.type,pool.filter(x=>x.t===p.type).length&&R.chance(.6)?pool.filter(x=>x.t===p.type):pool.filter(x=>x.t==='*'));try{return pick.f(c).map(s=>({bg:p.bg,...s}));}catch(e){return[];}}
 function hiveCut(p,c){
  const g=C.saga;let k;
  if(g.n<=1)k='open';else if(g.mark&&R.chance(.7))k='mark';else if(c.taken1&&taken().length&&R.chance(.45))k='taken';else if(g.streak>=1&&R.chance(.6))k='winning';else if((g.streak<=-1||g.lastLost.length)&&R.chance(.7))k='losing';else k=g.style==='aggressive'?'aggressive':g.style==='cautious'?'cautious':'neutral';
  const f=fresh('hive-'+k,HIVE19[k]);return[{bg:'film_overmind',kb:'in',tint:'red',stamp:'与此同时 · 赤巢深层',who:'overmind',line:f(c),cut:'zoom'}];
 }
 function scene(p,c){
  const g=C.saga;let kind=null,cc=c;
  const ll=g.lastLost.find(id=>!g.grieved.includes(id));
  if(p.part===2)return[];
  if(ll){g.grieved.push(ll);if(taken().includes(ll)){kind='taken';cc={...c,taken1:ll};}else{kind='grief';cc={...c,lost:ll};}const fr=squad().find(id=>bondsOf(ll).includes(id));if(fr)cc={...cc,a:fr,b:fr===c.b?c.a:c.b};}
  else if(g.newcomer&&squad().includes(g.newcomer)){kind='newcomer';cc={...c,target:g.newcomer};g.newcomer=null;}
  else if(g.streak<=-2)kind='breakdown';
  else if(g.cost){kind='doubt';g.cost=null;}
  else if(R.chance(.45)){const cand=[c.a,c.b,...squad()].filter(id=>SECRET19[id]&&!g.secrets.includes(id)&&squad().includes(id));if(cand.length){const who=cand[0];g.secrets.push(who);const other=who===c.b?c.a:c.b;const lines=SECRET19[who];
    return[{bg:'film_cabin',kb:'in',tint:'dark',stamp:R.pick(['休整舱 · 灯光调暗','走廊尽头 · 换班间隙','观测窗前 · 无人值守']),who,line:L(who,lines[0])},{who,line:L(who,lines[1])},{who,line:L(who,lines[2])},other&&other!==who?{who:other,line:L(other,{cold:'……我记住了。',hot:'……你这家伙。下次早点说啊。',warm:'谢谢你告诉我。',terse:'……嗯。'})}:null].filter(Boolean);}}
  if(!kind)kind=g.streak>=1||R.chance(.5)?'banter':null;
  if(!kind||!SCENE19[kind])return[];
  if(cc.a===cc.b&&kind!=='newcomer')return[];
  const f=fresh('scene-'+kind,SCENE19[kind]);let out=[];try{out=f(cc);}catch(e){out=[];}
  const bg=kind==='grief'||kind==='breakdown'?'film_cabin':p.bg;
  return out.map((s,i)=>i===0?{bg,kb:'in',tint:kind==='grief'?'dark':undefined,...s}:s);
 }
 function dilemma(p,c,post,generic){
  const pool=DILEMMA19.filter(d=>(d.t===p.type&&!generic)||d.t==='*');
  const specific=pool.filter(d=>d.t===p.type);
  const d=fresh('dil-'+p.type,specific.length&&R.chance(.7)?specific:pool.filter(d=>d.t==='*'));
  let q;try{q=d.f(c);}catch(e){return null;}
  if(q.opts.some(o=>o.fx.bench&&(o.fx.bench===p.a||squad().length<3)))return generic?null:dilemma(p,c,post,true);
  return{who:q.who,line:L(q.who,q.q),timer:12,timeout:q.timeout||0,choices:q.opts.map((o,i)=>({label:o.label,detail:o.detail,next:late=>{p.fx={...p.fx,...o.fx};p.choice={picked:(late?'（犹豫）':'')+o.label,alts:q.opts.filter((_,j)=>j!==i).map(x=>x.label),late:!!late};if(o.fx.abandon){p.type='evac';p.target=null;p.title=fresh('title-evac',TITLE19.evac);}if(o.fx.spare){p.type='duel';}return post();}}))};
 }
 function objectiveShot(p){
  const G=goals(S);const tip=[suddenText(S.saga.sudden),p.twist?'有些事会在战斗中途发生——注意战术频道。':'','命运模式：没有悔棋，没有重来。输赢都会写进下一章。'].filter(Boolean).join(' ');
  return{objective:{title:p.title,where:`天穹站 · ${SECTOR19[p.sec].name}`,items:G.main.map(x=>x.text),tip,go:'开始作战'}};
 }
 function postShots(p){
  return()=>{
   runId++;busy=false;undoStack=[];showThreat=false;S=buildState(p);
   selected=movers(S,'g').find(u=>u.char)?.uid||movers(S,'g')[0]?.uid;
   addLog(`第 ${C.saga.n} 章 · ${p.title}。${SECTOR19[p.sec].name}。`,'good');
   try{render();}catch(e){console.error(e);}persistNow();
   const out=[];
   if(p.choice){const r=R.pick([p.a,p.b].filter(Boolean));out.push({who:r,line:L(r,{cold:'明白。执行。',hot:'好！就这么干！',warm:'……嗯。我相信你。',terse:'……了解。'})});}
   if(S.saga.sudden){out.push({bg:p.bg,tint:'red',mode:'narr',stamp:'⚠ 生死局',line:suddenText(S.saga.sudden),fx:'alert',sfx:'alarm'});}
   if(p.deploy)out.push({deploy:true});
   out.push(objectiveShot(p));
   return out;
  };
 }
 function composeIntro(p){
  const c=ctx(p);const post=postShots(p);
  const T=titleShot(p);
  if(p.finale){
   const vows=squad().slice(0,4).map(id=>({who:id,line:L(id,{cold:'这是最后一次了。……我会回来写报告的。',hot:'最后一仗！打完了，所有人都来喝庆功酒！',warm:'不管发生什么……我很高兴遇见你们。',terse:'……走吧。'})}));
   const dl={who:p.a,line:p.finale==='g'?L(p.a,{cold:'赤巢的心脏就在前面。这是唯一的机会。',hot:'冲进去，把那颗心脏砍成两半！',warm:'就是这里了……所有人，最后一次。',terse:'……最后一战。'}):L(p.a,'站体要坠毁了。能带走几个，就带走几个。'),choices:[{label:'出发',detail:'没有回头路',next:post}],timer:0};
   return[...hiveCut(p,c),T,...montage(p,c,3),...vows,dl];
  }
  if(p.part===2){
   const prev=C.saga.nodes[C.saga.nodes.length-1];
   const recap={bg:p.bg,mode:'narr',stamp:'前情',line:prev?(prev.won?'她们以为最难的部分已经过去了。':'没有时间喘息。'):''};
   const dl=dilemma(p,c,post);
   return[T,recap,...coldOpen(p,c),dl||{who:p.a,line:'没有时间了。',choices:[{label:'继续',detail:'',next:post}],timer:0}];
  }
  const parts={cold:coldOpen(p,c),title:[T],mont:montage(p,c,2+R.i(2)),scene:scene(p,c),hive:R.chance(p.beat==='crisis'||p.beat==='climax'?.9:.55)?hiveCut(p,c):[]};
  const dl=dilemma(p,c,post)||{who:p.a,line:'准备好了吗？',choices:[{label:'出发',detail:'',next:post}],timer:0};
  const ORDERS=[['cold','title','mont','scene','hive'],['title','mont','cold','scene','hive'],['hive','title','cold','scene','mont'],['scene','title','mont','cold','hive'],['cold','title','scene','hive','mont'],['mont','title','cold','hive','scene']];
  const order=fresh('order',ORDERS);
  const shots=[];for(const k of order)shots.push(...parts[k]);
  shots.push(dl);
  return shots.filter(Boolean);
 }
 function teaser(next){
  if(!next)return null;const sec=SECTOR19[next.sec];
  const t={rescue:`${sec.name}深处，${nm(next.target)}的信标还在闪。频率，越来越慢。`,duel:`红区里有人在等她们。那个人，所有人都认得。`,intercept:'一只信使正背着坐标，沿着管线爬向外环。',hunt:`热成像上，${sec.name}的红点都朝着同一个方向偏转。`,hold:`${sec.name}的医疗舱，是最后一盏还亮着的灯。`,evac:`${sec.name}的结构应力，正在逼近临界值。`,escort:'方舟匣需要被带过火线。',seize:`${sec.name}的两座终端，正在被一点点染红。`,breach:`${sec.name}的门，从里面锁上了。`,core:'赤巢的心脏，第一次出现在了地图上。',lastevac:'空间站开始坠落。'}[next.type]||'';
  return{bg:R.pick(sec.bg),kb:'in',tint:'dark',mode:'narr',stamp:`下一章 · 第${next.n}章`,line:t,cut:'iris'};
 }
 function outcomeShots(p,won,reason,how,cons,lostNow,takenNow,next,ending){
  const c=ctx(p);const out=[];
  out.push({bg:p.bg,kb:'out',tint:won?undefined:'red',mode:'sys',stamp:won?(how==='sudden'?'生死局 · 胜':'作战成功'):(how==='sudden'?'生死局 · 败':'作战失败'),line:reason,sfx:won?'objective':'alarm'});
  const pool=won?OUT19.win:OUT19.lose;out.push(...R.shuffle(pool).slice(0,2).map(f=>{try{return f(c);}catch(e){return null;}}).filter(Boolean));
  for(const id of lostNow){const lw=(typeof FILM_LAST_WORDS!=='undefined'&&FILM_LAST_WORDS[id])||'……';out.push({bg:'film_cabin',tint:'dark',mode:'narr',stamp:`阵亡 · ${nm(id)}`,line:typeof lw==='string'?lw:'……'});}
  for(const id of takenNow){out.push({bg:p.bg,tint:'red',mode:'narr',stamp:`失联 · ${nm(id)}`,line:`${nm(id)}的信标，变成了红色。`});}
  for(const t of cons)out.push({mode:'narr',line:t,auto:2600});
  out.push({mode:'narr',stamp:`赤巢扩散 ${C.saga.H}% · 反攻进度 ${C.saga.P}%`,line:won?'天平向她们这一侧，倾斜了一点点。':'天平向深渊，又倾斜了一点。',auto:2600});
  if(p.part===1&&C.saga.pendingPart2){const cliff={hold:'可就在这时——追兵到了。',seize:'可就在这时，终端的灯一盏一盏变红了。',duel:`可就在这时，红区里走出来一个人。是${nm(C.saga.pendingPart2.target)}。`,evac:'然后，地板开始倾斜。'}[C.saga.pendingPart2.type];out.push({bg:p.bg,tint:'red',mode:'narr',stamp:'未完待续',line:cliff,fx:'shake',sfx:'boom'});}
  else if(!ending){const t=teaser(next);if(t)out.push(t);}
  return out;
 }
 /* ---------- chapter start ---------- */
 function startChapter(p){
  if(!p)return;const g=C.saga;g.cur=p;document.body.classList.add('saga19');
  C.step=Math.min(4,g.n-1);
  MISSIONS[MID]={name:p.title,en:p.en,location:`天穹站 · ${SECTOR19[p.sec].name}`,sector:`S-${String(g.n).padStart(2,'0')}`,limit:p.limit,tag:'FATE MODE',note:'命运模式：没有悔棋。输赢都会改变下一章。'};
  if(typeof CHAPTER_BG!=='undefined')CHAPTER_BG[MID]=p.bg;
  // provisional board so the background behind the film is coherent
  runId++;busy=false;undoStack=[];S=buildState({...p,fx:{},twist:null});
  try{showGame();render();}catch(e){console.error(e);}
  const shots=composeIntro(p);
  FILM.play(shots,()=>{try{render();}catch(e){}persistNow();},{chapter:`命运模式 · 第${g.n}章`});
 }
 /* ---------- flowchart (Detroit-style) ---------- */
 function showFlow(done){
  const g=C.saga;let el=document.getElementById('flow19');if(!el){el=document.createElement('div');el.id='flow19';document.body.appendChild(el);}
  const node=n=>`<div class="f19-node ${n.won?'win':'lose'} ${n.sudden?'sd':''}"><div class="f19-n">${String(n.n).padStart(2,'0')}</div><div class="f19-body"><b>${esc19(n.title)}</b><small>${esc19(SECTOR19[n.sec].name)} · ${BEAT_CN[n.beat]||'终局'}${n.sudden?' · 生死局':''}</small><p>${n.won?'✔':'✘'} ${esc19(n.reason)}</p>${n.choice?`<div class="f19-branch"><span class="pick">◆ ${esc19(n.choice.picked)}</span>${n.choice.alts.map(a=>`<span class="alt">◇ ${esc19(a)} · 未走的路</span>`).join('')}</div>`:''}${n.cons.length?`<ul>${n.cons.map(t=>`<li>${esc19(t)}</li>`).join('')}</ul>`:''}${n.lost.length||n.taken.length?`<div class="f19-loss">${n.lost.map(id=>`<i class="d">${nm(id)}</i>`).join('')}${n.taken.map(id=>`<i class="t">${nm(id)}</i>`).join('')}</div>`:''}</div></div>`;
  const sq=squad().map(id=>`<span class="g">${nm(id)}</span>`).join('')+taken().map(id=>`<span class="t">${nm(id)}</span>`).join('')+dead().map(id=>`<span class="d">${nm(id)}</span>`).join('')+g.surv.map(s=>`<span class="s">求救 · ${nm(s.who)} · ${esc19(SECTOR19[s.sec].name)} · ${s.clock<=0?'最后机会':'还剩 '+(s.clock+1)+' 章'}</span>`).join('');
  el.innerHTML=`<div class="f19-wrap"><header><small>FATE FLOWCHART · 命运流程图</small><h2>${g.ended?'终章':'第 '+g.nodes.length+' 章之后'}</h2><div class="f19-meters"><div><label>反攻进度</label><i style="--v:${g.P}%"></i><b>${g.P}%</b></div><div class="h"><label>赤巢扩散</label><i style="--v:${g.H}%"></i><b>${g.H}%</b></div></div><div class="f19-cast">${sq}</div></header><div class="f19-list">${g.nodes.map(node).join('<div class="f19-link"></div>')}${g.next?`<div class="f19-link"></div><div class="f19-node next"><div class="f19-n">${String(g.next.n).padStart(2,'0')}</div><div class="f19-body"><b>???</b><small>${esc19(SECTOR19[g.next.sec].name)}</small><p>尚未发生</p></div></div>`:''}</div><footer><button type="button" class="f19-go">${g.ended?'观看结局':'进入下一章 →'}</button><button type="button" class="f19-home">返回主菜单（自动保存）</button></footer></div>`;
  el.hidden=false;requestAnimationFrame(()=>{el.classList.add('on');const l=el.querySelector('.f19-list');l.scrollTop=l.scrollHeight;});
  el.querySelector('.f19-go').onclick=()=>{try{sfx('commit');}catch(e){}el.classList.remove('on');setTimeout(()=>{el.hidden=true;done&&done();},350);};
  el.querySelector('.f19-home').onclick=()=>{el.classList.remove('on');el.hidden=true;persistNow();document.body.classList.remove('saga19');showHome();};
 }
 const esc19=t=>String(t==null?'':t).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
 function showEnding(code){
  const e=ENDING19[code];const g=C.saga;
  const roll=[...squad().map(id=>`${nm(id)} · 归还`),...taken().map(id=>`${nm(id)} · 归巢`),...dead().map(id=>`${nm(id)} · 阵亡`)];
  const shots=[{black:true,mode:'narr',line:'……'},...e.lines.map((t,i)=>({bg:i===0?(code==='hive'?'film_overmind':'film_orbit'):undefined,kb:'out',mode:'narr',line:t})),{bg:'film_orbit',title:{k:e.code,m:e.title,s:`${g.n} 章 · 救回 ${C.stats.rescues||0} 人 · 阵亡 ${dead().length} · 归巢 ${taken().length}`},hold:3200},...roll.slice(0,8).map(t=>({mode:'narr',line:t,auto:1400}))];
  try{localStorage.removeItem(KEY);}catch(err){}
  FILM.play(shots,()=>{document.body.classList.remove('saga19');showHome();},{chapter:'命运模式 · 终章'});
 }
 /* ---------- sudden-death banner ---------- */
 function showSudden(flash){
  let b=document.getElementById('sd19');const sd=S&&S.saga&&S.saga.sudden;
  if(!sd||!sd.on||S.outcome){if(b)b.hidden=true;return;}
  if(!b){b=document.createElement('div');b.id='sd19';document.body.appendChild(b);}
  b.innerHTML=`<b>生死局</b><span>${esc19(suddenText(sd).replace(/^生死局：/,''))}</span>`;b.hidden=false;
  if(flash){b.classList.remove('flash');void b.offsetWidth;b.classList.add('flash');}
 }
 /* ---------- persistence ---------- */
 function persistNow(){if(!C||!C.saga||!S||!S.saga)return;try{localStorage.setItem(KEY,JSON.stringify({v:1,c:C,s:S}));}catch(e){}}
 function hasSave(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');return !!(d&&d.c&&d.c.saga&&!d.c.saga.ended);}catch(e){return false;}}
 function resume(){
  let d=null;try{d=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){}
  if(!d||!d.c||!d.c.saga){toast('没有可继续的命运存档。');return;}
  runId++;busy=false;undoStack=[];C=d.c;S=d.s;document.body.classList.add('saga19');
  const p=C.saga.cur;if(p){MISSIONS[MID]={name:p.title,en:p.en,location:`天穹站 · ${SECTOR19[p.sec].name}`,sector:`S-${String(C.saga.n).padStart(2,'0')}`,limit:p.limit,tag:'FATE MODE',note:'命运模式：没有悔棋。输赢都会改变下一章。'};if(typeof CHAPTER_BG!=='undefined')CHAPTER_BG[MID]=p.bg;}
  if(S.outcome){if(C.saga.next)startChapter(C.saga.next);else if(C.saga.ended)showEnding(C.saga.ended);else{showGame();render();}return;}
  if(S.phase==='ai'){S.phase='player';}
  selected=movers(S,'g').find(u=>u.char)?.uid;showGame();render();toast('命运继续。');
 }
 return{force:(won)=>resolve(!!won,won?'（测试）目标达成。':'（测试）作战失败。'),newSaga,resume,hasSave,check,environment,goals,aiTarget,aiScore,hazardNow,showSudden,persistNow,get on(){return !!(S&&S.saga);},stat(u,m){if(!S||!S.saga||!u||u.side!=='g')return;const sd=S.saga;sd.moves++;if(m.type==='wait')sd.waits++;if(m.capture)sd.kills++;if(u.char)sd.stat[u.char]=(sd.stat[u.char]||0)+1;}};
})();

/* ---------- wire into the existing engine (only when S.saga) ---------- */
(function(){
 const on=()=>!!(typeof S!=='undefined'&&S&&S.saga);
 const _obj=objectives;objectives=function(s,side){if(s&&s.saga)return SAGA19.goals(s);return _obj.apply(this,arguments);};
 const _act=actGoals;actGoals=function(s,side){if(s&&s.saga)return SAGA19.goals(s).main;return _act.apply(this,arguments);};
 const _chk=checkOutcome;checkOutcome=function(){if(on())return SAGA19.check();return _chk.apply(this,arguments);};
 const _env=resolveEnvironment;resolveEnvironment=function(){if(on())return SAGA19.environment();return _env.apply(this,arguments);};
 const _haz=imminentHazard;imminentHazard=function(s){if(s&&s.saga)return SAGA19.hazardNow(s);return _haz.apply(this,arguments);};
 const _tg=strategicTarget;strategicTarget=function(s,u){if(s&&s.saga){const t=SAGA19.aiTarget(s,u);if(t)return t;if(u.kind==='courier')return s.exits.find(e=>e.side==='r')||null;}return _tg.apply(this,arguments);};
 const _gs=goalPositionScore;goalPositionScore=function(s,side){const b=_gs.apply(this,arguments);if(s&&s.saga)return b+SAGA19.aiScore(s,side);return b;};
 const _ai=chooseAI;chooseAI=function(s,side){if(s&&s.saga&&s.saga.shield&&s.round===1){return null;}return _ai.apply(this,arguments);};
 const _undo=undoMove;undoMove=function(){if(on()){toast('命运模式没有悔棋。每一步都算数。');return;}return _undo.apply(this,arguments);};
 const _retry=retryMission;retryMission=function(){if(on()){toast('命运模式不能重来。输了，故事也会继续。');return;}return _retry.apply(this,arguments);};
 const _pm=performMove;performMove=async function(m,isPlayer){try{if(on()&&isPlayer){const u=S.units.find(v=>v.uid===m.uid);SAGA19.stat(u,m);}}catch(e){}return _pm.apply(this,arguments);};
 const _per=persist;persist=function(){if(on()){SAGA19.persistNow();return;}return _per.apply(this,arguments);};
 const _sr=showResult;showResult=function(){if(on())return;return _sr.apply(this,arguments);};
 const _rs=resolveBattle;resolveBattle=function(won,reason){if(on()){SAGA19.check();if(!S.outcome){/* engine-level fallback */S.saga.forced=true;}return;}return _rs.apply(this,arguments);};
 const _rb=renderBoard;renderBoard=function(){const r=_rb.apply(this,arguments);if(on()){try{
   const sd=S.saga.sudden;document.querySelectorAll('#board .cell.sd19').forEach(c=>c.classList.remove('sd19'));
   if(sd&&sd.on&&sd.cells)for(const k of sd.cells){const[x,y]=k.split(',');const c=document.querySelector(`#board .cell[data-x="${x}"][data-y="${y}"]`);if(c){c.classList.add('sd19');c.dataset.sd=sd.label||'';}}
   for(const[uid,label,cls]of[['alpha','蛛母','alpha19'],['pod','医疗舱','pod19'],['ark','方舟匣','ark19']]){const u=S.units.find(v=>v.uid===uid&&onBoard(v));if(!u)continue;const c=document.querySelector(`#board .cell[data-x="${u.x}"][data-y="${u.y}"] .token`);if(c){c.classList.add(cls);const n=c.querySelector('.token-name');if(n)n.textContent=label;}}
  }catch(e){}SAGA19.showSudden(false);}else{const b=document.getElementById('sd19');if(b)b.hidden=true;}return r;};
 const _rst=renderStatus;renderStatus=function(){const r=_rst.apply(this,arguments);if(on()){try{const g=C.saga;$('chapter-number').innerHTML=String(g.n).padStart(2,'0')+'<small>/ 命运</small>';const rib=$('stage-ribbon');if(rib)rib.innerHTML=`<span>FATE · 第 ${g.n} 章 · 反攻 ${g.P}% · 赤巢 ${g.H}%</span>`;const sn=$('stage-note');if(sn)sn.textContent=`作战窗口：第 ${S.round} / ${S.limit} 轮 · 没有悔棋`;}catch(e){}}return r;};
 const _home=showHome;showHome=function(){const r=_home.apply(this,arguments);document.body.classList.remove('saga19');const b=document.getElementById('sd19');if(b)b.hidden=true;syncMenu();return r;};
 const _ng=typeof newCampaign==='function'?newCampaign:null;if(_ng)newCampaign=function(){document.body.classList.remove('saga19');return _ng.apply(this,arguments);};
 // title menu entry
 function syncMenu(){const m=document.querySelector('#title15 .t15-menu');if(!m)return;let b=m.querySelector('[data-saga=new]');
  if(!b){b=document.createElement('button');b.dataset.saga='new';b.className='saga19-btn';b.innerHTML='<span>命运模式</span><small>每一局都不同 · 没有悔棋</small>';m.insertBefore(b,m.firstChild);
   const c=document.createElement('button');c.dataset.saga='cont';c.className='saga19-btn cont';c.innerHTML='<span>继续命运</span><small>读取命运存档</small>';m.insertBefore(c,b.nextSibling);
   m.addEventListener('click',e=>{const t=e.target.closest('[data-saga]');if(!t)return;e.stopPropagation();try{applyTheme('g');}catch(_){}if(t.dataset.saga==='new'){if(SAGA19.hasSave()&&!confirm('开始新的命运会覆盖当前命运存档。继续吗？'))return;SAGA19.newSaga();}else SAGA19.resume();},true);}
  const c=m.querySelector('[data-saga=cont]');if(c)c.hidden=!SAGA19.hasSave();}
 syncMenu();const home=$('home');if(home)new MutationObserver(syncMenu).observe(home,{attributes:true,attributeFilter:['hidden']});
})();
if(location.hash==='#filmtest'&&window.__MV_FILM__)Object.assign(window.__MV_FILM__,{saga:()=>SAGA19.newSaga(),sagaState:()=>({n:C.saga&&C.saga.n,P:C.saga&&C.saga.P,H:C.saga&&C.saga.H,type:S&&S.saga&&S.saga.type,round:S&&S.round,phase:S&&S.phase,outcome:S&&S.outcome,squad:C.saga&&squadList(),film:FILM.active,sudden:S&&S.saga&&S.saga.sudden,twist:S&&S.saga&&S.saga.twist,nodes:C.saga&&C.saga.nodes.length}),sagaForce:won=>SAGA19.force(won),sagaMove:async()=>{if(!S||S.outcome||S.phase!=='player'||busy)return'busy';const m=chooseAI(S,'g');if(!m)return'none';await performMove(m,true);return'ok';},sagaEnd:()=>{endPhase();return true;},sagaText:()=>document.querySelector('#film .fm-line')?.textContent});
function squadList(){return C.saga.squad.filter(id=>C.roster[id].status==='active'&&C.roster[id].side==='g');}
