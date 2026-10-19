/* M22 · 赤巢阵营深化
   1) 更聪明的对手：感染威胁 ×2 估值、交换估算、多步回应搜索、目标/段落意识、按指挥官性格微调。
   2) 可重玩：每章战场变数（地形 / 节奏 / 增援 / 环境）每次开局随机，守护者阵位洗牌，指挥官人格随机。
   3) 关卡事件：战斗中途的剧情事件提前一轮预告，在棋盘上真实发生（不弹面板）。
   只读公开信息；AI 与玩家使用同一套走法引擎，不给任何隐藏加成。 */
(function(){
 const qa22=()=>location.hash==='#qa'&&!window.__AI22QA;
 const R22=()=>typeof C!=='undefined'&&C&&C.side==='r'&&!(typeof S!=='undefined'&&S&&S.saga);
 const nm=id=>(CHAR[id]&&CHAR[id].name)||id;
 function mul(seed){let a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
 function rnd(s){const a=s.ai22||(s.ai22={seed:(Math.random()*4294967296)>>>0,doc:null});a.seed=(a.seed+0x9E3779B9)>>>0;return mul(a.seed)();}
 const pickR=(s,arr)=>arr[Math.floor(rnd(s)*arr.length)];

 /* ------------------------------------------------------------------ AI */
 const DOCS={
  wall:{safe:1.22,greed:.9,goal:1,pair:7},
  blade:{safe:.86,greed:1.32,goal:.95,pair:0},
  thread:{safe:1.02,greed:.95,goal:1.38,pair:3},
  swarm:{safe:.92,greed:1.18,goal:1.1,pair:0},
  broken:{safe:.82,greed:.85,goal:.72,pair:0}
 };
 function persona(s,side){const d=(s.ai22&&s.ai22.doc)||(side==='r'?'swarm':'wall');let P={...(DOCS[d]||DOCS.wall)};
  if(s.mid===4&&side==='g'){P.safe*=.72;P.greed*=1.15;}
  const tp=Math.min(1,Math.max(0,(s.round-4)/8));P.safe*=1-.25*tp;P.goal*=1+.5*tp; // 时间压力：越拖越敢拼
  return P;}
 function tinfo(s,side){
  const m=new Map();
  for(const u of movers(s,side)){
   const v=valueOf(u),sp=u.kind==='spider'&&side==='r';
   for(const t of legalMoves(s,u,'threat')){const k=key(t.x,t.y),e=m.get(k);if(!e)m.set(k,{min:v,n:1,sp});else{e.n++;if(v<e.min)e.min=v;if(sp)e.sp=true;}}
  }
  return m;
 }
 function actDenial(s,side){
  const q=s.quest;if(!q||q.player===side||typeof actGoals!=='function')return 0;
  let done=0;try{done=actGoals(s,q.player).filter(x=>x.done).length;}catch(e){}
  return done;
 }
 function eval22(s,side,P,remain){
  let sc=goalPositionScore(s,side);
  const opp=enemyOf(side),To=tinfo(s,opp),Tm=tinfo(s,side),hz=imminentHazard(s),sh=shielded(s);
  const losses=[],gains=[];
  const spiders=side==='g'?movers(s,'r').filter(u=>u.kind==='spider'):[];
  for(const u of s.units){
   if(!onBoard(u))continue;const k=key(u.x,u.y),v=valueOf(u)*12;
   if(u.side===side){
    if(hz.includes(k))sc-=v*2.6;
    const t=To.get(k),def=Tm.has(k);
    if(u.char&&side==='g'){ // 赤蛛两步之内的机娘：下一阶段就可能被感染
     let near=0;for(const sp of spiders)if(distance(sp,u)===2)near++;
     if(near)sc-=Math.min(3,near)*(def?2.5:5)*P.safe;
     if(near||t){ // 退路检查：没有安全格可退的机娘，下一阶段几乎必被感染
      let esc=0;for(const m of legalMoves(s,u)){if(!To.has(key(m.x,m.y)))esc++;if(esc>1)break;}
      if(esc===0)sc-=v*(t?.6:.85)*P.safe;else if(esc===1)sc-=v*.22*P.safe;
     }
     if(def&&P.pair)sc+=P.pair;
    }
    if(!t||(u.kind==='core'&&sh))continue;
    const inf=t.sp&&u.char&&side==='g';
    let l=inf?v*2-(def?36:0):Math.max(v*.18,v-(def?t.min*12:0));
    if(!inf&&def&&t.n>=2)l=Math.max(l,v*.45);
    losses.push(l);
   }else if(u.side===opp){
    const t=Tm.get(k);if(!t||(u.kind==='core'&&sh))continue;
    const inf=t.sp&&u.char&&opp==='g',def=To.has(k);
    gains.push(inf?v*2:Math.max(v*.15,v-(def?t.min*12:0)));
   }
  }
  losses.sort((a,b)=>b-a);gains.sort((a,b)=>b-a);
  const w=[1,.55,.3,.15];losses.forEach((l,i)=>sc-=l*(w[i]||.1)*P.safe);
  sc+=(gains[0]||0)*(remain>0?.55:.12)*P.greed+(gains[1]||0)*.05;
  sc-=actDenial(s,side)*85*P.goal;
  if(s.mid===0&&side==='g'){const c=s.units.find(u=>u.kind==='courier');if(s.flags.courierEscaped)sc-=700;else if(c&&onBoard(c)){const d=courierPath(s,c);sc-=(9-Math.min(9,d))*32*P.goal;const t=Tm.get(key(c.x,c.y));if(t)sc+=36*(remain>0?1:.5)*P.greed;}}
  if(side==='g'&&s.mid===3)sc+=s.relays.filter(r=>r.owner==='g').length*28*P.goal;
  if(side==='g'&&s.mid===4){const own=movers(s,'g');for(const r of s.relays){if(r.owner==='g')sc+=70*P.goal;else sc-=bestDistance(own,r)*9*P.goal;}sc-=Math.max(0,s.round-3)*(2-s.relays.filter(r=>r.owner==='g').length)*12;}
  if(s.mid===4&&side==='g'&&!sh){const core=s.units.find(u=>u.kind==='core'&&onBoard(u));if(core){const t=Tm.get(key(core.x,core.y));if(t)sc+=160;}}
  if(s.mid===1&&side==='g'){const m=charter(s,'misa');if(m&&onBoard(m)&&m.side==='g'){const t=To.get(key(m.x,m.y));if(t&&t.sp)sc-=60*P.safe;}}
  if(s.mid===3&&side==='g'){const n=charter(s,'noct');if(n&&onBoard(n)&&n.side==='r')sc-=bestDistance(movers(s,'g'),n)*5*P.goal;}
  if(s.kind23&&typeof K23!=='undefined'&&K23[s.kind23]&&K23[s.kind23].ev)sc+=(side==='g'?1:-1)*K23[s.kind23].ev(s,side);
  return sc;
 }
 // 信使到 H8 的真实路径长度（四向、绕开舱壁与单位；被堵死记 9）
 function courierPath(s,c){
  const goal=key(7,0),seen=new Set([key(c.x,c.y)]);let fr=[[c.x,c.y]],d=0;
  while(fr.length&&d<9){if(fr.some(([x,y])=>x===7&&y===0))return d;d++;const nx=[];
   for(const[x,y]of fr)for(const[dx,dy]of DIR4){const X=x+dx,Y=y+dy,k=key(X,Y);if(X<0||Y<0||X>7||Y>7||seen.has(k)||blocked(s,X,Y))continue;const o=unitAt(s,X,Y);if(o&&k!==goal)continue;seen.add(k);nx.push([X,Y]);}
   fr=nx;}
  return fr.some(([x,y])=>x===7&&y===0)?d:9;
 }
 function caps(s,side){
  const out=[];
  for(const u of movers(s,side)){if(u.used)continue;for(const m of legalMoves(s,u))if(m.capture){const t=unitAt(s,m.x,m.y);out.push({m,gain:t?valueOf(t)*(captureMode(u,t)==='infect'?2:1):0});}}
  return out.sort((a,b)=>b.gain-a.gain);
 }
 function choose22(s,side){
  const P=persona(s,side);computeRetreat(s,side);
  const remain=Math.max(0,(s.aiBudget||1)-(s.aiDone||0)-1);
  const cands=[];
  for(const u of movers(s,side).filter(u=>!u.used)){
   const target=strategicTarget(s,u),moves=legalMoves(s,u);moves.push({uid:u.uid,x:u.x,y:u.y,type:'wait',capture:false});
   for(const m of moves){
    const next=clone(s);const ev=applyBasic(next,m);if(!ev&&m.type!=='wait')continue;
    const mv=next.units.find(v=>v.uid===u.uid);if(mv)mv.used=true;
    let b=0;
    if(target&&mv)b+=(distance(u,target)-distance(mv,target))*(u.kind==='courier'||u.flee?14:3)*P.goal;
    if(m.type==='wait')b-=3;if(ev&&ev.relay)b+=6;if(u.flee&&ev&&ev.escaped)b+=valueOf(u)*25;
    cands.push({m,next,b,q:eval22(next,side,P,remain)+b});
   }
  }
  if(!cands.length)return null;
  cands.sort((a,b)=>b.q-a.q);
  const top=cands.slice(0,18),opp=enemyOf(side);
  for(const c of top){
   // 本阶段还有额度：看看这一步能不能为下一步吃子铺路（组合）
   if(remain>0){let f=0;for(const x of caps(c.next,side).slice(0,4)){const b2=clone(c.next);applyBasic(b2,x.m);const bu=b2.units.find(v=>v.uid===x.m.uid);if(bu)bu.used=true;f=Math.max(f,eval22(b2,side,P,remain-1)-c.q);}c.follow=Math.max(0,f);}
   const n=c.next;for(const v of n.units)if(v.side===opp)v.used=false;
   let worst=c.q;
   for(const r of caps(n,opp).slice(0,9)){
    const a=clone(n);applyBasic(a,r.m);const au=a.units.find(v=>v.uid===r.m.uid);if(au)au.used=true;
    let sc=eval22(a,side,P,1),w2=sc;
    for(const x of caps(a,opp).slice(0,4)){const b2=clone(a);applyBasic(b2,x.m);w2=Math.min(w2,eval22(b2,side,P,1));}
    worst=Math.min(worst,sc*.45+w2*.55);c.nr=(c.nr||0)+1;
   }
   c.worst=worst;
   c.score=worst*.88+c.q*.12+c.b*.12+(c.follow||0)*.3;
  }
  top.sort((a,b)=>b.score-a.score);
  if(choose22.list)return top;
  if(location.hash==='#filmtest')window.__T22=top.slice(0,6).map(c=>{const u=s.units.find(v=>v.uid===c.m.uid);return (u.char||u.kind)+'@'+u.x+','+u.y+'>'+c.m.x+','+c.m.y+(c.m.capture?'x':'')+' q'+Math.round(c.q)+' s'+Math.round(c.score)+' w'+Math.round(c.worst)+' n'+(c.nr||0)+' f'+Math.round(c.follow||0);});
  const best=top[0].score,tol=4+Math.abs(best)*.0015;
  const pool=top.filter(c=>c.score>=best-tol).slice(0,3);
  if(pool.length<2)return top[0].m;
  const ws=pool.map(c=>Math.exp((c.score-best)/2.2)),sum=ws.reduce((a,b)=>a+b,0);let r=rnd(s)*sum;
  for(let i=0;i<pool.length;i++){r-=ws[i];if(r<=0)return pool[i].m;}
  return pool[0].m;
 }

 /* ---------------- M23 · 迭代加深 α-β 搜索（单步为一层，按阶段额度切换走子方） ----------------
    叶节点用 eval22，叶上做一层吃子静止搜索；根节点先用完整评估预筛，再在时间预算内逐层加深。 */
 const AB={ms:300};
 function lite(s){const L=s.logs,E=s.events;s.logs=[];s.events=[];const c=clone(s);s.logs=L;s.events=E;return c;}
 function gen(s,side,cap){
  const out=[],foes=movers(s,enemyOf(side));
  for(const u of movers(s,side)){
   if(u.used)continue;const tg=strategicTarget(s,u);
   for(const m of legalMoves(s,u)){
    let o;
    if(m.capture){const t=unitAt(s,m.x,m.y);o=1000+(t?valueOf(t)*(captureMode(u,t)==='infect'?2:1)*12:0)-valueOf(u);}
    else{o=0;if(tg)o+=(distance(u,tg)-distance(m,tg))*6;
     if(u.kind==='spider'&&side==='r'){for(const f of foes)if(f.char&&distance(m,f)===1){o+=45;break;}}
     else if(u.char&&side==='g'){for(const f of foes)if(f.kind==='spider'&&distance(m,f)<=1){o-=40;break;}}}
    out.push({m,o});
   }
   out.push({m:{uid:u.uid,x:u.x,y:u.y,type:'wait',capture:false},o:-30});
  }
  out.sort((a,b)=>b.o-a.o);
  if(cap){const caps=out.filter(x=>x.m.capture),quiet=out.filter(x=>!x.m.capture);return caps.slice(0,5).concat(quiet.slice(0,Math.max(2,cap-Math.min(5,caps.length))));}
  return out;
 }
 function step(s,side,left,B){ // 返回下一步的走子方和剩余额度（必要时切换阶段并重置 used）
  if(left>0&&movers(s,side).some(u=>!u.used))return[side,left];
  const o=enemyOf(side);for(const u of s.units)if(u.side===o)u.used=false;return[o,B];
 }
 function search23(s,side){
  const P=persona(s,side),t0=performance.now(),dead=t0+AB.ms;
  computeRetreat(s,side);
  const left0=Math.max(1,(s.aiBudget||1)-(s.aiDone||0)),B=Math.max(1,Math.min(3,s.aiBudget||2));
  choose22.list=true;let top;try{top=choose22(s,side);}finally{choose22.list=false;}
  if(!top||!top.length)return null;
  const R=top.slice(0,5).map(c=>({m:c.m,n:c.next,b:c.b||0,q:c.score}));
  let nodes=0;const OUT={};
  function leaf(n,toMove,left){
   const rem=toMove===side?left:0;let v=eval22(n,side,P,rem);
   // 静止搜索：轮到谁走、谁就可能立即吃子
   const cs=gen(n,toMove,0).filter(x=>x.m.capture).slice(0,2);
   for(const c of cs){const a=lite(n);applyBasic(a,c.m);const w=eval22(a,side,P,0);v=toMove===side?Math.max(v,w):Math.min(v,w);}
   return v;
  }
  function ab(n,toMove,left,depth,alpha,beta){
   if(++nodes%32===0&&performance.now()>dead)throw OUT;
   if(n.outcome||depth===0)return leaf(n,toMove,left);
   const max=toMove===side,ms=gen(n,toMove,depth>=2?7:6);
   if(!ms.length)return leaf(n,toMove,left);
   let best=max?-Infinity:Infinity;
   for(const g of ms){
    const a=lite(n);applyBasic(a,g.m);const u=a.units.find(v=>v.uid===g.m.uid);if(u)u.used=true;
    const[ns,nl]=step(a,toMove,left-1,B);
    const v=ab(a,ns,nl,depth-1,alpha,beta);
    if(max){if(v>best)best=v;if(best>alpha)alpha=best;}else{if(v<best)best=v;if(best<beta)beta=best;}
    if(alpha>=beta)break;
   }
   return best;
  }
  let done=R.map(c=>({c,score:c.q})),reached=0;
  for(let depth=2;depth<=6;depth++){
   const cur=[];
   try{
    let alpha=-Infinity;
    for(const c of R){const a=lite(c.n);for(const v of a.units)if(v.side!==side&&false)v.used=false;const[ns,nl]=step(a,side,left0-1,B);const v=ab(a,ns,nl,depth,-Infinity,Infinity);cur.push({c,score:v*.5+c.q*.5});}
   }catch(e){if(e!==OUT)throw e;break;}
   cur.sort((a,b)=>b.score-a.score);done=cur;reached=depth;
   R.sort((a,b)=>(cur.find(x=>x.c===b).score)-(cur.find(x=>x.c===a).score));
   if(performance.now()>t0+AB.ms*.55)break;
  }
  AB.last={depth:reached,nodes,ms:Math.round(performance.now()-t0)};
  const best=done[0].score,tol=3+Math.abs(best)*.001;
  const pool=done.filter(x=>x.score>=best-tol).slice(0,3);
  if(location.hash==='#filmtest')window.__T23=AB.last;
  if(pool.length<2)return done[0].c.m;
  return pool[Math.floor(rnd(s)*pool.length)].c.m;
 }
 const legacyAI=chooseAI;
 chooseAI=function(s,side){
  if(qa22()||s.saga)return legacyAI(s,side);
  try{return search23(s,side)||choose22(s,side)||legacyAI(s,side);}catch(e){console.warn('ai22',e);return legacyAI(s,side);}
 };

 /* ------------------------------------------------------------- 战场变数 */
 const free=(s,x,y)=>x>=0&&y>=0&&x<8&&y<8&&!s.walls.includes(key(x,y))&&!s.voids.includes(key(x,y))&&!s.units.some(u=>!u.dead&&!u.escaped&&u.x===x&&u.y===y)&&!s.relays.some(r=>r.x===x&&r.y===y)&&!s.exits.some(e=>e.x===x&&e.y===y)&&!s.delivery.some(d=>d.x===x&&d.y===y)&&!s.loot.some(l=>l.x===x&&l.y===y);
 const wall=(s,cells)=>{for(const[x,y]of cells)if(free(s,x,y))s.walls.push(key(x,y));};
 const add=(s,kind,side,slots)=>{const p=slots.find(([x,y])=>free(s,x,y));if(p)return spawn(s,kind,side,p[0],p[1]);return null;};
 const LEAD={wall:['lyra','celia','sera','vega','psalm'],blade:['akira','nyx','sola','kuro','ruby'],thread:['iris','vega','astra','june','echo','lark']};
 const DOC_LINE={
  wall:['所有人两两站位。谁都不许一个人站在红色旁边。','别追。守住彼此，它们就只能在外面绕。','后背交给身边的人。今天谁也不准落单。'],
  blade:['别等它们靠近。看见赤蛛，先砍掉。','它们每多活一轮，就多一个人危险。主动出击！','打它的腿，不要给它搭桥的机会。'],
  thread:['终端优先。链路在我们手里，它们就只是噪音。','别被它们牵着走，盯住目标。','先拿下阵地，再谈救人。']
 };
 /* 每章 3 个变数：terrain 立即生效；ev[回合] 在该回合末发生，提前一回合以截获通讯预告 */
 const V22={
  0:[
   {k:'cargo',feed:'接驳甲板的货柜在对接冲击中倾覆，挡住了两条通道。',hz:null,set:s=>wall(s,[[1,5],[6,2],[2,2]]),ev:{3:{warn:'穿梭机还有一轮到港。撑住，增援马上就到。',sp:[['drone','g',[[1,7],[2,7],[0,6]],'苍鹭穿梭机靠港：守护哨卫从舱门冲进甲板。']]}}},
   {k:'dormant',feed:'冷藏舱里，还有我上一次留下的孩子。它们在等我叫醒。',set:s=>{add(s,'sentinel','g',[[5,6],[2,6],[4,6]]);},ev:{2:{warn:'冷藏舱温度在升高……里面有东西在动。',sp:[['spider','r',[[0,4],[7,4],[0,3],[7,3]],'冷藏舱破裂：一只休眠赤蛛醒了过来。']]}}},
   {k:'airlock',feed:'A 列气闸在循环。每三轮，那一列会被抽成真空。',hz:{rounds:[3,6,9],cells:[[0,2],[0,3],[0,4],[0,5]]},set:s=>{},ev:{}}
  ],
  1:[
   {k:'racks',feed:'倒塌的培育架横在温室南侧。守护者要绕路，才能碰到样本。',set:s=>wall(s,[[3,5],[4,5]]),ev:{3:{warn:'温室南门已经撬开，增援下一轮进来。',sp:[['drone','g',[[3,7],[4,7],[2,7]],'温室南门被撬开：守护哨卫进入花园。']]}}},
   {k:'bloom',feed:'苗床提前醒了。冷却系统也开始失控。',set:s=>{s.ventStart=Math.max(2,s.ventStart-1);},ev:{2:{warn:'苗床在发热。第一窝，就快破壳了。',sp:[['spider','r',[[4,2],[3,2],[4,1]],'苗床破壳：一只新生赤蛛爬出培育槽。']]}}},
   {k:'lockdown',feed:'温室进入封锁。守护者多带了一台哨塔，可她们的退路也被锁死了。',set:s=>{add(s,'sentinel','g',[[4,6],[3,6],[5,6]]);add(s,'spider','r',[[1,2],[6,2],[0,1]]);},ev:{5:{warn:'封锁门的电源在闪。还有一轮。',sp:[['spider','r',[[0,2],[7,2],[0,1]],'封锁门断电：通风井里落下一只赤蛛。']]}}}
  ],
  2:[
   {k:'storm',feed:'太阳风暴提前到达。桥面会比预计更早断开。',set:s=>{s.collapseAt=Math.max(3,(s.collapseAt||6)-1);},ev:{}},
   {k:'spine',feed:'中轴的检修架断了，桥心变成了之字形。',set:s=>wall(s,[[2,3],[5,4]]),ev:{4:{warn:'护送队在呼叫支援。下一轮，北端会有东西下来。',sp:[['drone','g',[[3,7],[4,7],[2,6]],'北端支援抵达：一台守护哨卫落上桥面。']]}}},
   {k:'escort',feed:'护送队比情报里多了一台哨卫。我也多派了一只。',set:s=>{add(s,'drone','g',[[4,6],[2,6],[5,6]]);add(s,'spider','r',[[2,1],[5,1],[3,1]]);},ev:{}}
  ],
  3:[
   {k:'shards',feed:'镜面碎了一地。碎片之间，路变窄了。',set:s=>wall(s,[[1,5],[6,5]]),ev:{4:{warn:'镜像库的备用门在解锁。她们在叫人。',sp:[['sentinel','g',[[1,7],[6,7],[0,6]],'备用门打开：轨道哨塔进入镜像库。']]}}},
   {k:'echo',feed:'镜子里有回声。有些回声，是我的。',set:s=>{},ev:{3:{warn:'镜面在颤……有什么东西，要从反面爬出来。',sp:[['spider','r',[[3,5],[4,5],[2,5],[5,5]],'镜面翻转：一只赤蛛从镜子背面爬进她们的后方。']]}}},
   {k:'seal',feed:'镜像库封闭协议启动。两边都多了一点筹码。',set:s=>{add(s,'drone','g',[[3,6],[4,6],[2,6]]);add(s,'sentinel','r',[[3,1],[5,1],[2,1]]);},ev:{}}
  ],
  4:[
   {k:'overload',feed:'母巢在过载。第五轮，它会一口气吐出两只。',set:s=>{},ev:{5:{warn:'核心温度在攀升。下一轮，母巢会过载生产。',sp:[['spider','r',[[2,1],[6,1],[3,1]],'母巢过载：额外一只赤蛛出槽。'],['spider','r',[[1,1],[5,1],[4,1]],'']]}}},
   {k:'assault',feed:'她们准备了两波突击。第一波，第三轮到。',set:s=>{add(s,'spider','r',[[2,2],[6,3],[1,3]]);},ev:{3:{warn:'突击艇在减速。下一轮靠舷。',sp:[['sentinel','g',[[0,6],[7,6],[1,7]],'第一波突击：轨道哨塔从舷窗突入。']]},6:{warn:'第二艘突击艇在靠近。',sp:[['drone','g',[[7,7],[6,7],[1,7]],'第二波突击：守护哨卫跟进。']]}}},
   {k:'purge',feed:'反应堆在泄压。第 4 排会周期性被抽成真空——对她们，对我，都一样。',hz:{rounds:[4,8,12],cells:[[0,4],[1,4],[2,4],[5,4],[6,4],[7,4]]},set:s=>{},ev:{}}
  ]
 };
 // 入口被占时，就近换一个己方后排空格（不占撤离点/交付口/终端）
 function slotFor(side,slots,used){
  const ok=([x,y])=>!(used&&used.has(key(x,y)))&&!blocked(S,x,y)&&!unitAt(S,x,y)&&!S.exits.some(e=>e.x===x&&e.y===y)&&!S.delivery.some(d=>d.x===x&&d.y===y)&&!S.relays.some(r=>r.x===x&&r.y===y);
  let p=slots.find(ok);if(p)return p;const[a,b]=slots[0];const rows=side==='g'?[7,6,5]:[0,1,2];const all=[];
  for(const y of rows)for(let x=0;x<8;x++)all.push([x,y]);all.sort((m,n)=>(Math.abs(m[0]-a)+Math.abs(m[1]-b))-(Math.abs(n[0]-a)+Math.abs(n[1]-b)));
  return all.find(ok)||null;
 }
 function ingress(kind,side,slots,text,quiet){
  const p=slotFor(side,slots);if(!p)return;
  const u=spawn(S,kind,side,p[0],p[1]);if(!u)return;u.used=true;
  if(text){addLog(text,side==='r'?'good':'capture');try{radio(side==='r'?'赤巢':'截获通讯',text);}catch(e){}}
  try{if(typeof sfx==='function')sfx(side==='r'?'spawn':'alarm');}catch(e){}
 }
 /* 暗线（不显示在任务栏）：蛛皇在开场低语一个愿望；完成后下一章苗床多孵化。 */
 const WHISPERS={
  clean:{line:'这一次，别让我的孩子再碎掉。最多一只。',ok:s=>s.units.filter(u=>u.kind==='spider'&&u.side==='r'&&u.dead).length<=1},
  swift:{line:'快一点。在她们的增援想明白之前，结束这里。',ok:s=>s.round<=Math.ceil(s.limit*.55)},
  harvest:{line:'这里有两个人，我想要。两个。',ok:s=>s.flags.conversionsR.length>=2}
 };
 const _mm=makeMission;
 makeMission=function(id){
  const s=_mm.apply(this,arguments);
  try{
   if(!s.ai22)s.ai22={seed:(Math.random()*4294967296)>>>0,doc:null};
   if(qa22()||s.saga||(typeof K23!=='undefined'&&K23.__building))return s;
   const aiSide=C.side==='r'?'g':'r';
   if(aiSide==='g'){
    const lead=Object.keys(LEAD).flatMap(d=>LEAD[d].map(c=>({d,c}))).filter(o=>s.units.some(u=>u.char===o.c&&u.side==='g'&&!u.dead));
    const pick=lead.length?lead[Math.floor(rnd(s)*lead.length)]:{d:pickR(s,['wall','blade','thread']),c:null};
    s.ai22.doc=pick.d;s.ai22.lead=pick.c;s.ai22.line=pickR(s,DOC_LINE[pick.d]);
   }else s.ai22.doc='swarm';
   if(!R22())return s;
   // 守护者阵位洗牌：同一批人，不同站位
   const gs=s.units.filter(u=>u.side==='g'&&!u.dead&&u.kind!=='capsule');const pos=gs.map(u=>[u.x,u.y]);
   for(let i=pos.length-1;i>0;i--){const j=Math.floor(rnd(s)*(i+1));[pos[i],pos[j]]=[pos[j],pos[i]];}
   gs.forEach((u,i)=>{u.x=pos[i][0];u.y=pos[i][1];});
   const list=V22[id];if(!list)return s;
   const v=list[Math.floor(rnd(s)*list.length)];s.var22=v.k;v.set(s);
   const ws=Object.keys(WHISPERS);s.whisper22=ws[Math.floor(rnd(s)*ws.length)];
   // 上一战的暗线奖励：苗床多孵出的赤蛛
   const brood=Math.min(2,C.flags.brood22||0);
   for(let i=0;i<brood;i++)add(s,'spider','r',[[2,1],[5,1],[4,1],[3,1],[1,1],[6,1],[2,2],[5,2]]);
   s.brood22=brood;C.flags.brood22=0;
  }catch(e){console.warn('var22',e);}
  return s;
 };
 const curV=()=>S&&S.var22&&V22[S.mid]?V22[S.mid].find(v=>v.k===S.var22):null;
 const _hz=imminentHazard;
 imminentHazard=function(s){
  const base=_hz.apply(this,arguments);
  try{if(s&&s.var22&&!s.saga&&V22[s.mid]){const v=V22[s.mid].find(v=>v.k===s.var22);if(v&&v.hz&&v.hz.rounds.includes(s.round)){const extra=v.hz.cells.map(([x,y])=>key(x,y)).filter(k=>!s.walls.includes(k)&&!s.voids.includes(k)&&!base.includes(k));return base.concat(extra);}}}catch(e){}
  return base;
 };
 const _env=resolveEnvironment;
 resolveEnvironment=function(){
  try{const v=curV();if(v&&v.ev){const e=v.ev[S.round];if(e&&e.sp)for(const a of e.sp)ingress(...a);const w=v.ev[S.round+1];if(w&&w.warn){radio('截获通讯',w.warn);addLog('截获通讯：'+w.warn,'capture');}}}catch(e){console.warn('ev22',e);}
  return _env.apply(this,arguments);
 };
 const _rb=resolveBattle;
 resolveBattle=function(won,reason){
  try{if(S&&!S.outcome&&R22()&&S.whisper22&&won&&WHISPERS[S.whisper22]&&WHISPERS[S.whisper22].ok(S)){C.flags.brood22=Math.min(2,(C.flags.brood22||0)+1);S.events.push('苗床多孵出了一窝');}}catch(e){}
  return _rb.apply(this,arguments);
 };
 // 被凝视的她：被感染的那一刻直接同步 II
 const _ce=captureEffect;
 captureEffect=function(target){
  try{if(R22()&&target&&target.char&&C.p21&&C.p21.mark===target.char){const u=S.units.find(v=>v.char===target.char);if(u){u.xp=Math.max(2,u.xp||0);if(C.roster[u.char])C.roster[u.char].xp=u.xp;addLog(`${nm(u.char)}醒得很快。她一直在等我——同步 II。`,'good');}}}catch(e){}
  return _ce.apply(this,arguments);
 };

 // 预告：下一轮末将有单位进入的格子在棋盘上脉动（红=赤巢，青=守护者）
 try{const _rb22=renderBoard;renderBoard=function(){const r=_rb22.apply(this,arguments);try{const v=curV();const board=document.getElementById('board');
  if(board&&v&&v.ev&&S&&!S.outcome){const e=v.ev[S.round];if(e&&e.sp){const used=new Set();for(const[kind,side,slots]of e.sp){const p=slotFor(side,slots,used);if(!p)continue;used.add(key(p[0],p[1]));const c=board.querySelector(`.cell[data-x="${p[0]}"][data-y="${p[1]}"]`);if(c){c.classList.add('ingress22',side==='r'?'ingress22-r':'ingress22-g');c.title=(c.title||'')+'，本轮末将有'+(side==='r'?'赤巢':'守护者')+'单位进入';}}}}
 }catch(e){}return r;};}catch(e){}

 /* ------------------------------------------------------- 开场：截获情报 */
 if(typeof filmIntro==='function'){
  const _fi=filmIntro;
  filmIntro=function(mid){
   const shots=_fi.apply(this,arguments)||[];
   try{
    if(R22()&&S&&S.mid===mid&&!qa22()){
     const add=[],v=curV();
     if(S.brood22)add.push({bg:'film_overmind',tint:'dark',kb:'in',who:'overmind',line:S.brood22>1?'上一战没有浪费。苗床多孵出了两只。':'上一战没有浪费。苗床里，多了一只。'});
     if(v)add.push({bg:'film_corridor',tint:'cold',kb:'in',fx:'static',stamp:'战场扫描',mode:'narr',line:v.feed});
     const lead=S.ai22&&S.ai22.lead;
     if(lead&&S.ai22.line)add.push({bg:'film_cabin',tint:'cold',stamp:'截获的舰内频道',fx:'static',who:lead,side:'g',name:nm(lead),line:S.ai22.line});
     if(S.whisper22&&WHISPERS[S.whisper22])add.push({bg:'film_overmind',tint:'dark',kb:'in',who:'overmind',line:WHISPERS[S.whisper22].line});
     if(add.length){let at=shots.findIndex(s=>s&&s.objective);if(at<0)at=shots.length;shots.splice(at,0,...add);}
    }
   }catch(e){console.warn('intro22',e);}
   return shots;
  };
 }

 /* ------------------------------------------------------ 测试钩子（仅 #filmtest） */
 if(location.hash==='#filmtest'&&window.__MV_FILM__)Object.assign(window.__MV_FILM__,{
  v22:()=>({var:S&&S.var22,doc:S&&S.ai22&&S.ai22.doc,lead:S&&S.ai22&&S.ai22.lead,whisper:S&&S.whisper22,brood:S&&S.brood22,walls:S&&S.walls.slice(),units:S&&S.units.filter(u=>!u.dead).map(u=>u.side+':'+(u.char||u.kind)+'@'+u.x+','+u.y)}),
  // 无界面的 AI 对弈：hive 用旧 AI 作为固定“玩家”，守护者 AI 可切换新/旧；返回感染/击杀统计
  sim22:(mid,useNew,rounds,k,variant)=>{
   newCampaign('r');try{hideStory();}catch(e){}
   C.step=mid;for(const r of Object.values(C.roster)){if(r.status!=='destroyed')r.status='active';}
   S=makeMission(mid);if(variant===false){S.var22=null;}
   const t0=performance.now();let moves=0,aiMs=0;
   const pick=(side)=>{const t=performance.now();const m=side==='g'?(useNew==='m23'?search23(S,'g'):useNew?choose22(S,'g'):legacyAI(S,'g')):(window.__HIVEAI==='m22'?choose22(S,'r'):legacyAI(S,'r'));aiMs+=performance.now()-t;return m;};
   for(let r=0;r<rounds&&!S.outcome;r++){
    for(const side of ['r','g']){
     for(const u of S.units)if(u.side===side)u.used=false;
     S.aiBudget=k;S.aiDone=0;
     for(let i=0;i<k&&!S.outcome;i++){const m=pick(side);if(!m)break;if(window.__LOG22&&side==='g'&&useNew)window.__LOG22.push('R'+S.round+' '+(window.__T22||[]).slice(0,3).join(' | '));if(window.__LOG22&&side==='r'){const u=S.units.find(v=>v.uid===m.uid);window.__LOG22.push('R'+S.round+' HIVE '+(u.char||u.kind)+'@'+u.x+','+u.y+'>'+m.x+','+m.y+(m.capture?'x':''));}applyBasic(S,m);const u=S.units.find(v=>v.uid===m.uid);if(u)u.used=true;S.aiDone++;moves++;}
    }
    try{const v=curV();if(v&&v.ev&&v.ev[S.round]&&v.ev[S.round].sp)for(const a of v.ev[S.round].sp)ingress(...a);}catch(e){}
    const hz=imminentHazard(S);for(const u of S.units)if(onBoard(u)&&hz.includes(key(u.x,u.y)))u.dead=true;
    if(S.mid===2&&hz.length){S.voids.push(...hz);S.collapsed=true;}
    S.round++;
   }
   const girls=S.units.filter(u=>u.char);
   return{conv:S.flags.conversionsR.length,gDead:girls.filter(u=>u.dead).length,spDead:S.units.filter(u=>u.kind==='spider'&&u.dead).length,gLeft:movers(S,'g').length,rLeft:movers(S,'r').length,courier:!!S.flags.courierEscaped,delivered:S.flags.delivered,relG:S.relays.filter(r=>r.owner==='g').length,ms:Math.round(performance.now()-t0),aiMs:Math.round(aiMs),moves,var:S.var22};
  }
 });
})();
