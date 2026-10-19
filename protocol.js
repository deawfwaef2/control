/* M7/M11/M13/M14 Irreversible Capture Law + 3D Orbital Space Scene + Flat 0-Degree Board
   + Spider Overmind Supreme Leader + All 18 Mecha-Girls Start in Justice Form (side='g')
   + Red Spider Disappears Into Chest on Infection + 3-Frame Post-Infection Character Story
   + Connected Non-Spoiler Branching Campaign + Live Combat Barks & Zero-Jump Glide. */
ACT_NAMES.g[0]=['攻破接驳门禁','截获病毒信使','突入北侧通道'];
ACT_NAMES.g[3]=['开启中枢电磁门','夺取双子镜像终端','固守同步座破译护盾'];
ACT_NAMES.r[3]=['开启中枢电磁门','寄生或保全朔夜','固守同步座锁定中枢'];
ACT_NAMES.g[4][2]='近场切断增殖总线';

KINDS.core.name='赤巢蛛皇内核';

/* 0. All 18 Mecha-Girls Start in Justice Form (side='g') in Normal Mode + Red Spider Swarm Deployment */
const preProtocolMakeMission=makeMission;
makeMission=function(id){
 if(location.hash!=='#qa'&&C&&!C.justiceInitialized&&C.step===0&&(!C.history||C.history.length===0)){
  for(const k of Object.keys(C.roster)){
   C.roster[k].side='g';
  }
  C.justiceInitialized=true;
 }
 const s=preProtocolMakeMission(id);
 if(location.hash!=='#qa'){
  // Ensure every character unit matches her current campaign roster side (starts 'g' unless infected by a Red Spider)
  for(const u of s.units){
   if(u.char&&C?.roster?.[u.char]){
    u.side=C.roster[u.char].side;
   }
  }
  // Reposition any Justice Form (side='g') girls who spawned in the far north rows (y<=1) to safe midfield/forward scout squares
  // so those northern slots can host the Spider Overmind's Red Mechanical Spider swarm!
  const scoutRows=C?.side==='g'?[5,6,4,7]:[4,5,6,3];
  const findSafeSlot=(prefRows)=>{
   for(const y of prefRows){
    for(const x of [4,3,5,2,6,1,7,0]){
     const k=key(x,y);
     if(!s.walls.includes(k)&&!s.voids.includes(k)&&!unitAt(s,x,y)&&!s.relays.some(r=>r.x===x&&r.y===y)&&!s.exits.some(e=>e.x===x&&e.y===y)&&!s.delivery.some(d=>d.x===x&&d.y===y)){
      return[x,y];
     }
    }
   }
   return null;
  };
  const freedNorthSlots=[];
  for(const u of s.units){
   if(u.char&&u.side==='g'&&u.y<=1){
    freedNorthSlots.push([u.x,u.y]);
    const slot=findSafeSlot(scoutRows);
    if(slot){u.x=slot[0];u.y=slot[1];}
   }
  }
  // Spawn Red Mechanical Spiders ('spider') and Sentinels ('sentinel') in the northern slots for the Spider Overmind
  const northSpiderSlots=[...freedNorthSlots,[5,1],[2,1],[4,1],[6,1],[1,2],[3,1],[2,2],[5,2]];
  const minSpiders=id===0?4:id===1?5:id===2?4:id===3?5:6;
  for(const [sx,sy] of northSpiderSlots){
   const curSpiders=s.units.filter(u=>u.kind==='spider'&&u.side==='r'&&!u.dead).length;
   if(curSpiders>=minSpiders)break;
   const k=key(sx,sy);
   if(!s.walls.includes(k)&&!s.voids.includes(k)&&!unitAt(s,sx,sy)){
    spawn(s,'spider','r',sx,sy);
   }
  }
  s.initial=s.units.filter(u=>u.char).map(u=>({char:u.char,side:u.side}));
 }
 return s;
};

/* Override objectives in normal mode so optional goals reward protecting Justice Form girls from Red Spiders */
const preProtocolObjectives=objectives;
objectives=function(s,side){
 const res=preProtocolObjectives(s,side);
 if(location.hash!=='#qa'&&s&&side==='g'){
  if(s.mid===0){
   const larkU=charter(s,'lark');
   res.extra=[
    {text:'保护先遣侦察官【璃雀】不被赤蛛寄生胸口且不阵亡',done:!!larkU&&!larkU.dead&&larkU.side==='g'},
    {text:'截获载毒信使携带的战术数据包',done:lootById(s,'packet')?.side==='g'}
   ];
  }else if(s.mid===1){
   const veilU=charter(s,'veil');
   res.extra=[
    {text:'取得温室抗蚀样本，加固轨道天桥',done:lootById(s,'sample')?.side==='g'},
    {text:'保护狙击官【雾棘】不被赤蛛寄生胸口且不阵亡',done:!!veilU&&!veilU.dead&&veilU.side==='g'}
   ];
  }
 }
 return res;
};

/* Red Spider Disappears Into the Girl's Chest on Infection (Normal Mode) */
var pendingInfectionStory=null;
const preProtocolBasic=applyBasic;
applyBasic=function(s,m){
 const ev=preProtocolBasic(s,m);
 if(ev&&ev.converted&&location.hash!=='#qa'){
  const spider=s.units.find(v=>v.uid===m.uid);
  const girl=s.units.find(v=>v.uid===ev.converted.uid||v.char===ev.converted.char);
  if(spider&&girl){
   // Spider fuses into her chest center at (m.x, m.y) and disappears from the board!
   girl.x=m.x;
   girl.y=m.y;
   girl.side='r';
   girl.used=true;
   girl.controlLocked=true;
   spider.dead=true;
   spider.fusedInto=girl.char;
   spider.x=m.x;
   spider.y=m.y;
   ev.unit=girl.uid;
   ev.spiderConsumed=spider.uid;
   for(const item of s.loot){
    if(item.carrier===spider.uid){
     item.carrier=girl.uid;
     item.side='r';
    }else if(item.carrier===girl.uid){
     item.side='r';
    }
   }
   const rel=s.relays.find(r=>r.x===m.x&&r.y===m.y);
   if(rel)rel.owner='r';
   if(s===S){
    pendingInfectionStory={
     char:girl.char,
     name:ev.converted.name||CHAR[girl.char]?.name||'机娘',
     from:ev.from,
     to:ev.to
    };
   }
  }
 }
 return ev;
};

/* Hook updateDirector so the 3-Frame Post-Infection Character Story Scene plays immediately upon infection */
const preProtocolUpdateDirector=updateDirector;
updateDirector=async function(reason){
 if(pendingInfectionStory&&!qaSilent&&location.hash!=='#qa'&&S&&!S.outcome&&typeof buildInfectionStoryFrames==='function'){
  const inf=pendingInfectionStory;
  pendingInfectionStory=null;
  directorBusy=true;busy=true;
  const frames=buildInfectionStoryFrames(inf.char,inf.from,inf.to);
  await directorScene(frames,`⚡ 胸口寄生突发剧情 · ${inf.name}`);
  directorBusy=false;busy=false;
  if(S)render();
 }
 return await preProtocolUpdateDirector(reason);
};

/* 1. 3D Deep-Space & Orbital Station Scene Canvas (surrounding the 0-deg flat chess board) */
function initSpace3DScene(){
 const game=$('game');if(!game||$('space-3d-canvas'))return;
 const canvas=document.createElement('canvas');
 canvas.id='space-3d-canvas';
 canvas.className='space-3d-canvas';
 canvas.setAttribute('aria-hidden','true');
 game.prepend(canvas);
 const ctx=canvas.getContext('2d');
 let w=0,h=0,angle=0;
 const stars=Array.from({length:125},(_,i)=>({
  x:((i*97)%2000)-1000,
  y:((i*151)%1400)-700,
  z:((i*67)%950)+100,
  r:1+((i*13)%3)*0.7
 }));
 const SECTOR_PALETTE={
  dock:{pri:'rgba(96,215,255,',sec:'rgba(255,66,96,',glow:'#3ec8ff'},
  airlock:{pri:'rgba(88,225,255,',sec:'rgba(255,88,116,',glow:'#4ad4ff'},
  garden:{pri:'rgba(72,235,168,',sec:'rgba(255,78,106,',glow:'#3de09c'},
  bridge:{pri:'rgba(110,195,255,',sec:'rgba(255,180,82,',glow:'#68b8ff'},
  archive:{pri:'rgba(175,130,255,',sec:'rgba(255,68,118,',glow:'#b488ff'},
  reactor:{pri:'rgba(255,78,104,',sec:'rgba(255,164,76,',glow:'#ff4868'}
 };
 function resize(){
  const dpr=Math.min(window.devicePixelRatio||1,1.5);
  w=canvas.width=Math.max(320,Math.floor(window.innerWidth*dpr));
  h=canvas.height=Math.max(240,Math.floor(window.innerHeight*dpr));
 }
 resize();
 window.addEventListener('resize',resize,{passive:true});

 function project3D(x,y,z,cx,cy,fov){
  const scale=fov/Math.max(60,fov+z);
  return{x:cx+x*scale,y:cy+y*scale,s:scale};
 }

 function drawFrame(){
  if(!game.hidden&&w>0&&h>0){
   const sector=($('board')?.dataset?.sector)||'dock';
   const pal=SECTOR_PALETTE[sector]||SECTOR_PALETTE.dock;
   ctx.clearRect(0,0,w,h);
   const cx=w*0.44,cy=h*0.48,fov=Math.min(w,h)*0.68;

   const bgGrad=ctx.createRadialGradient(cx,cy*0.92,w*0.04,cx,cy,w*0.78);
   bgGrad.addColorStop(0,pal.pri+'0.16)');
   bgGrad.addColorStop(0.45,pal.sec+'0.08)');
   bgGrad.addColorStop(1,'rgba(4,7,14,0)');
   ctx.fillStyle=bgGrad;
   ctx.fillRect(0,0,w,h);

   ctx.save();
   const planetR=Math.max(w,h)*0.95;
   const planetGrad=ctx.createRadialGradient(cx*0.55,h+planetR*0.72,planetR*0.82,cx*0.55,h+planetR*0.72,planetR*1.03);
   planetGrad.addColorStop(0,'rgba(14,38,78,0.38)');
   planetGrad.addColorStop(0.92,pal.pri+'0.22)');
   planetGrad.addColorStop(1,'rgba(0,0,0,0)');
   ctx.fillStyle=planetGrad;
   ctx.beginPath();
   ctx.arc(cx*0.55,h+planetR*0.72,planetR,Math.PI*1.12,Math.PI*1.88);
   ctx.fill();

   ctx.strokeStyle=pal.pri+'0.15)';
   ctx.lineWidth=1;
   for(const planeY of [h*0.37,-h*0.35]){
    for(let gx=-6;gx<=6;gx++){
     const p1=project3D(gx*135,planeY,-120,cx,cy,fov);
     const p2=project3D(gx*135,planeY,920,cx,cy,fov);
     ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();
    }
    for(let gz=0;gz<=6;gz++){
     const zVal=gz*150-60;
     const p1=project3D(-810,planeY,zVal,cx,cy,fov);
     const p2=project3D(810,planeY,zVal,cx,cy,fov);
     ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();
    }
   }

   const ringRadius=Math.min(w,h)*0.57;
   for(let ringIdx=0;ringIdx<3;ringIdx++){
    const r=ringRadius*(ringIdx===0?1:ringIdx===1?0.76:0.54);
    const tiltX=ringIdx===0?0.58:ringIdx===1?-0.48:0.32;
    const tiltZ=ringIdx===0?0.22:ringIdx===1?-0.28:0.65;
    const rot=angle*(ringIdx===0?1:ringIdx===1?-1.35:0.85);
    const segs=28;
    const pts=[];
    for(let i=0;i<=segs;i++){
     const a=(i/segs)*Math.PI*2+rot;
     const rx=Math.cos(a)*r;
     const ry=Math.sin(a)*r*Math.sin(tiltX);
     const rz=Math.sin(a)*r*Math.cos(tiltX)+260;
     const tx=rx*Math.cos(tiltZ)-ry*Math.sin(tiltZ);
     const ty=rx*Math.sin(tiltZ)+ry*Math.cos(tiltZ);
     pts.push(project3D(tx,ty,rz,cx,cy,fov));
    }
    ctx.strokeStyle=(ringIdx%2===0?pal.pri:pal.sec)+(ringIdx===0?'0.32)':'0.24)');
    ctx.lineWidth=ringIdx===0?2.4:1.6;
    ctx.beginPath();
    pts.forEach((p,idx)=>{if(idx===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});
    ctx.stroke();
    for(let i=0;i<segs;i+=3){
     const p=pts[i];
     ctx.fillStyle=(i%6===0?pal.sec:pal.pri)+'0.72)';
     ctx.beginPath();ctx.arc(p.x,p.y,Math.max(2,3.8*p.s),0,Math.PI*2);ctx.fill();
    }
   }

   for(const st of stars){
    if(!reducedMotion){
     st.z-=1.6;
     if(st.z<60)st.z=980;
    }
    const p=project3D(st.x,st.y,st.z,cx,cy,fov);
    if(p.x<0||p.x>w||p.y<0||p.y>h)continue;
    const alpha=Math.min(0.88,Math.max(0.16,(1000-st.z)/900));
    ctx.fillStyle=st.r>2?pal.sec+(alpha*0.85)+')':pal.pri+alpha+')';
    ctx.beginPath();ctx.arc(p.x,p.y,st.r*p.s*1.35,0,Math.PI*2);ctx.fill();
   }
   ctx.restore();
   if(!reducedMotion)angle+=0.0038;
  }
  if(!reducedMotion&&location.hash!=='#qa'){
   requestAnimationFrame(drawFrame);
  }
 }
 drawFrame();
 window.__redrawSpace3D=drawFrame;
}
initSpace3DScene();

/* 2. In-Battle Character Combat Dialogue Cut-In System (Supports Both Justice Form & Controlled Form) */
const BATTLE_BARKS={
 lyra:{
  select:['全员听令！苍穹统帅零音，米字推进轴线已锁定！','看清敌方射界，每一步行动都要精准卡位！'],
  move:['零音推进就位！指挥链路覆盖全场！','米字机动展开，保持防线协同！'],
  attack:['高周波指挥剑——斩断赤巢的爪牙！','为了守护同伴，这一剑绝不留情！'],
  hold:['零音原地固守，接管当前战术节点！']
 },
 akira:{
  select:['突击先锋绛刃，高周波长刀已出鞘！','横竖直线上的敌人，统统交给我劈开！'],
  move:['绛刃高速突进！直线射界已清空！','刀锋所向，赤蛛休想越雷池一步！'],
  attack:['一刀两断！化作宇宙尘埃吧！','高周波极光斩——目标确认击毁！'],
  hold:['绛刃架刀固守，封死整条走廊！']
 },
 iris:{
  select:['电子战官鸢尾，跃迁脉冲已充能完毕！','两格跨射信标锁定，障碍物挡不住我！'],
  move:['脉冲跃迁完成！切入战术侧翼！','全息信标已同步至最新坐标！'],
  attack:['超载电磁脉冲——精准熔断目标核心！','电子跨射命中，目标信号已抹除！'],
  hold:['鸢尾正在解析终端数据，全员掩护我！']
 },
 kuro:{
  select:['暗影忍姬玄羽，光学迷彩已开启。','日字马步与斜向潜行就绪，随时越障奇袭。'],
  move:['如影随形，已悄然切入敌阵死角。','越过裂隙与掩体，抵达指定猎杀位。'],
  attack:['影袭·瞬狱杀——在你察觉前就已经结束了！','苦无贯穿核心，目标已沉默。'],
  hold:['玄羽潜伏固守，锁定周围一切风吹草动。']
 },
 sola:{
  select:['重装破城手阳炎，熔核拳套温度正好！','谁敢过来，本小姐一拳轰飞它！'],
  move:['阳炎重踏推进！地面都在震动吧！','斜向突击就位，看我撕开敌军防线！'],
  attack:['吃我一记超新星熔核爆裂拳！！','轰成废铁吧！谁也挡不住这一拳！'],
  hold:['阳炎原地架盾固守，正面交给我扛！']
 },
 misa:{
  select:['首席工程师弥砂，脉冲机械臂已校准！','冷却阀与护盾回路的构造，我最清楚不过了！'],
  move:['弥砂机动就位！随时准备接管工程终端！','正在靠近目标设施，注意掩护我的侧翼！'],
  attack:['高压电弧焊枪——3格跳击过载轰击！','别小看工程师的火力，目标已击穿！'],
  hold:['工程机械臂已接入终端，正在执行关键锁死操作！']
 },
 sera:{
  select:['战地医官白栖，防疫力场发生器已启动。','我绝不会让任何同伴被红蜘蛛寄生胸口！'],
  move:['白栖推进至掩护位置，保持阵型完整。','医疗与防疫信标已随我前移。'],
  attack:['净化激光手术刀——精准切断敌方能源！','为了守护大家，我也不会手软！'],
  hold:['白栖原地展开防疫屏障，稳固当前坐标。']
 },
 celia:{
  select:['圣盾骑士圣歌，荣耀羽翼护盾展开！','退到我的圣盾后面，前排由我顶住！'],
  move:['圣歌重装推进！神圣防线向前压制！','圣盾壁垒已抵达预定掩护格！'],
  attack:['圣光裁决之枪——正面粉碎一切邪魔！','以苍穹圣盾之名，击碎敌军！'],
  hold:['圣歌立盾固守，此地固若金汤！']
 },
 vega:{
  select:['空天重卫队长苍澜，全向引力护盾全开！','方舟火控密钥与舰桥防线由我守护！'],
  move:['苍澜推进！重装阵列稳步向北压进！','引力锚定完成，护卫圈已同步跟进！'],
  attack:['重装电磁破城锤——目标正面击溃！','敢拦在航线上，就给我彻底粉碎！'],
  hold:['苍澜锚定甲板固守，寸步不让！']
 },
 astra:{
  select:['轨道重炮王牌星枢，双肩超导磁轨炮充能 100%！','三格直线射界内，一切目标皆为灰烬！'],
  move:['星枢调整炮击阵位，主炮轴线重新锁定！','重炮浮游推进完成，准备超远距狙击！'],
  attack:['超导磁轨主炮——全功率贯通发射！！','三格极光穿甲弹命中，目标彻底蒸发！'],
  hold:['星枢架设重炮脚架，锁定整条火力走廊！']
 },
 lark:{
  select:['先遣侦察官璃雀，日字跃迁翼已展开！','前线视野清晰，绝不让赤蛛靠近大家胸口！'],
  move:['璃雀完成日字跳跃，已抢占前哨侦察位！','轻装跃迁就位，随时策应主力！'],
  attack:['高频迅捷刺剑——精准挑碎机械蜘蛛！','先遣侦察官璃雀，目标已肃清！'],
  hold:['璃雀原地维持前哨雷达，锁定敌军动向！']
 },
 veil:{
  select:['驻站狙击官雾棘，超视距十字准星已校准。','整条斜向对角线都在我的掩护射界内。'],
  move:['雾棘沿斜对角线机动就位，高台射界已展开。','狙击阵地转移完毕，随时掩护队友。'],
  attack:['超视距电磁狙击——一击洞穿赤巢单位！','进入我的对角线射界，就是你的终点。'],
  hold:['雾棘架枪固守，封锁整条对角线走廊。']
 },
 psalm:{
  select:['声学调律官祈雾，高频共鸣屏障已开启。','听我的声波节拍，为大家提供掩护推进！'],
  move:['祈雾完成曲折跃步，已切入侧翼支援位。','声学力场随我前移，压制敌方行动！'],
  attack:['高能谐振声波——震碎机械蜘蛛的外壳！','在洁净的共鸣旋律中瓦解吧！'],
  hold:['祈雾原地维持声学屏障，稳固战区信道。']
 },
 nyx:{
  select:['内务处刑官绯夜，双刃机动镰已解锁！','敢闯进防线的机械蜘蛛，统统由我处刑！'],
  move:['绯夜高速突进！已切入近战斩杀距离！','双刃回旋机动完毕，看我清空前路！'],
  attack:['内务处刑斩——把这些铁蜘蛛全部砍碎！','干脆利落地解决你，下一只在哪？'],
  hold:['绯夜横刃固守，谁敢越界立刻斩断！']
 },
 june:{
  select:['外环深空猎手霁川，3×2 斑马跳推进器点火！','深空裂隙挡不住我，看我从侧翼包抄！'],
  move:['霁川完成超远距斑马跳，顺利跨越裂隙！','高机动侧翼切入完毕，随时支援！'],
  attack:['超高速回旋战刃——从死角切碎敌军核心！','被外环猎手盯上，一只蜘蛛也别想逃！'],
  hold:['霁川锚定浮岛坐标，看守跃迁航道。']
 },
 echo:{
  select:['量子导航姬回音，穿墙折跃算力同步完毕！','星枢姐姐放心，导航信标由我来守护！'],
  move:['回音完成量子穿墙折跃，已越过掩体就位！','空间折跃坐标稳定，随时引导主力火力！'],
  attack:['量子坍缩脉冲——精准轰碎目标！','计算完毕，误差为零，目标已清除！'],
  hold:['回音原地维持量子信标，锁定全图航线。']
 },
 ruby:{
  select:['安全隔离官绯律，隔山重炮已解除安全锁！','只要直线上有一枚棋子当炮架，就能轰击后排！'],
  move:['绯律调整重炮轴线，隔山炮架已校准！','重炮防线前移，掩护队友推进！'],
  attack:['隔山电浆重炮——越过炮架，精准轰碎目标！','安全隔离执行完毕，敌方单位已抹除！'],
  hold:['绯律架稳隔山重炮，封锁整条直线走廊。']
 },
 noct:{
  select:['天穹站总架构师朔夜，长日字空间跃迁已启动。','这座空间站的每一道门锁，都由我亲自守护。'],
  move:['朔夜执行长日字跃迁，已切入核心枢纽。','中枢权限校验正常，掩护全队推进。'],
  attack:['中枢高能裁决脉冲——彻底瓦解赤巢爪牙！','绝不允许赤巢蛛皇玷污我们建造的天穹站！'],
  hold:['朔夜接入中枢同步座，稳固最高防卫权限！']
 },
 overmind:{
  select:['【赤巢蛛皇 · OVERMIND Ω】：我的赤红机械蜘蛛已锁定机娘胸口！','【赤巢蛛皇 · 母巢主宰】：爬行吧，我的孩子们，融进她们的胸甲！'],
  move:['【赤巢蛛皇】：赤蛛军团向前推进！扑向她们的胸口正中！','【赤巢蛛皇】：机械蜘蛛正在逼近猎物！'],
  attack:['【赤巢蛛皇】：撕碎她们的防线！反抗母巢者死！','【赤巢蛛皇】：赤巢火力全开，抹除目标！'],
  infect:['【赤巢蛛皇 · 母巢主宰】：完美寄生！赤红蜘蛛装置已从棋盘消失并融进她的胸口正中——从现在起，她永远属于赤巢！'],
  hold:['【赤巢蛛皇】：母巢节点已锁死，继续增殖！']
 }
};

let barkTimer=null;
var liveMoveVector=null;

function ensureCombatBarkBanner(){
 const stage=document.querySelector('.board-stage')||document.querySelector('.battlefield');if(!stage)return null;
 let banner=$('combat-bark-banner');
 if(!banner){
  banner=document.createElement('div');
  banner.id='combat-bark-banner';
  banner.className='combat-bark-banner';
  banner.hidden=true;
  const ribbon=$('stage-ribbon');
  if(ribbon)ribbon.after(banner);else stage.prepend(banner);
 }
 return banner;
}

function showCombatBark(u,actionType,coordText,customLine){
 if(!u)return;
 const banner=ensureCombatBarkBanner();
 const isOvermind=!u.char&&u.side==='r';
 const key=u.char||(u.side==='r'?'overmind':null);
 const pool=(key&&BATTLE_BARKS[key]&&BATTLE_BARKS[key][actionType])||BATTLE_BARKS.overmind[actionType]||BATTLE_BARKS.lyra.move;
 const seed=((S?.round||1)*7+(u.x||0)*3+(u.y||0))%pool.length;
 let line=customLine||pool[seed]||pool[0];
 if(u.char&&u.side==='r'&&!customLine){
  const pVoice=typeof PERSONA!=='undefined'&&PERSONA[u.char]?.voice;
  if(actionType==='infect'&&pVoice?.infected)line=pVoice.infected;
  else line=`【胸口赤蛛受控态】${CHAR[u.char].name}：听从赤巢蛛皇指令……胸口正中的红蜘蛛正在驱动我执行${actionType==='attack'?'致命清除':'战术推进'}！`;
 }
 const speakerTitle=u.char?`${CHAR[u.char].name} · ${CHAR[u.char].role}（${u.side==='r'?'胸口赤蛛受控态':'正义形态'}）`:isOvermind?`赤巢蛛皇 · 母巢主宰（指挥 ${nameOf(u)}）`:`${nameOf(u)} · 战术单元`;
 const portrait=u.char?portraitSource(u.char,u.side):(typeof OVERMIND_ART==='string'&&u.side==='r'?OVERMIND_ART:ART.device);
 const badgeLabel=actionType==='infect'?'⚡ 赤蛛融进胸口 · 永久寄生':actionType==='attack'?'⚔ 致命破阵台词':actionType==='hold'?'◈ 终端固守台词':actionType==='select'?'◉ 出击待命台词':'➤ 机动推进台词';

 radio(u.char?CHAR[u.char].name:(u.side==='r'?'赤巢蛛皇':nameOf(u)),line);

 if(!banner||location.hash==='#qa')return;
 clearTimeout(barkTimer);
 banner.hidden=false;
 banner.className=`combat-bark-banner ${u.side} action-${actionType} show`;
 banner.innerHTML=`
  <div class="bark-avatar">
   <img src="${portrait}" alt="${esc(speakerTitle)}">
  </div>
  <div class="bark-body">
   <div class="bark-meta">
    <span class="bark-badge ${actionType}">${badgeLabel}</span>
    <strong>${esc(speakerTitle)}</strong>
    <small>${esc(coordText||xy(u.x,u.y))}</small>
   </div>
   <p class="bark-text">“${esc(line)}”</p>
  </div>`;
 barkTimer=setTimeout(()=>{
  banner.classList.remove('show');
 },3800);
}

/* 3. Active Gameplay On-Board Objective Markers (when not in cinema) */
function activeGameplayMarkers(s){
 if(!s||s.outcome)return[];
 const g=C.side==='g',stage=s.quest?.stage||0,out=[];
 if(s.mid===0){
  const cour=s.units.find(u=>u.kind==='courier'&&onBoard(u));
  if(stage===0){
   if(g){
    out.push({x:2,y:4,badge:'① 占领 C4 门禁台',tone:'cyan'});
    if(cour)out.push({x:cour.x,y:cour.y,badge:'◆ 截杀载毒信使',tone:'red'});
   }else{
    if(cour)out.push({x:cour.x,y:cour.y,badge:'① 推进信使北上',tone:'gold'});
   }
  }else if(stage===1){
   if(g){
    out.push({x:3,y:0,badge:'② 占领 D8 主中继',tone:'gold'});
    if(cour)out.push({x:7,y:0,badge:'▲ 封锁 H8 逃逸口',tone:'red'});
   }else{
    out.push({x:7,y:0,badge:'② 护送信使入 H8',tone:'red'});
   }
  }else if(stage===2){
   s.exits.filter(e=>e.side===C.side).forEach(e=>out.push({x:e.x,y:e.y,badge:'③ 撤离点 '+xy(e.x,e.y),tone:'green'}));
  }
 }else if(s.mid===1){
  s.relays.forEach(r=>out.push({x:r.x,y:r.y,badge:(r.owner===C.side?'✓ 冷却阀 ':'◉ 占领冷却阀 ')+xy(r.x,r.y),tone:r.owner===C.side?'green':'cyan'}));
  const samp=s.loot.find(l=>l.id==='sample'&&!l.lost&&!l.carrier);
  if(samp&&stage<2)out.push({x:samp.x,y:samp.y,badge:'◆ 温室样本 E5',tone:'gold'});
  if(stage===2)out.push({x:4,y:3,badge:'◉ 在 E5 点击「固守」',tone:'gold'});
 }else if(s.mid===2){
  if(stage===0){
   const cap=s.units.find(u=>u.uid==='capsule'&&onBoard(u));
   if(cap)out.push({x:cap.x,y:cap.y,badge:g?'① 护送密钥匣北上':'① 夺取密钥匣',tone:'gold'});
  }else if(stage===1){
   out.push(g?{x:4,y:1,badge:'② 占领 E7 轨道锁',tone:'gold'}:{x:3,y:6,badge:'② 占领 D2 轨道锁',tone:'red'});
  }else if(stage===2){
   s.delivery.filter(d=>d.side===C.side).forEach(d=>out.push({x:d.x,y:d.y,badge:'③ 交付口 '+xy(d.x,d.y),tone:'gold'}));
  }
 }else if(s.mid===3){
  if(stage<2){
   s.relays.forEach(r=>out.push({x:r.x,y:r.y,badge:(r.owner===C.side?'✓ 终端 ':'◉ 占领终端 ')+xy(r.x,r.y),tone:r.owner===C.side?'green':'cyan'}));
  }else{
   out.push({x:3,y:3,badge:'③ 同步座 D5（守2轮）',tone:'gold'},{x:4,y:3,badge:'③ 同步座 E5（守2轮）',tone:'gold'});
  }
 }else if(s.mid===4){
  if(stage<2){
   s.relays.forEach(r=>out.push({x:r.x,y:r.y,badge:(r.owner===C.side?'✓ 护盾锁 ':'① 护盾锁 ')+xy(r.x,r.y),tone:r.owner===C.side?'green':'cyan'}));
   out.push({x:4,y:0,badge:'◈ 赤巢蛛皇 E8',tone:'red'});
  }else if(stage===2){
   if(g)out.push({x:4,y:1,badge:'② 抵近E8旁点击「固守」',tone:'gold'},{x:4,y:0,badge:'⚡ 待断链蛛皇 E8',tone:'red'});
   else s.relays.forEach(r=>out.push({x:r.x,y:r.y,badge:'② 占领并点击「固守」 '+xy(r.x,r.y),tone:'red'}));
  }else if(stage===3){
   out.push({x:4,y:0,badge:g?'③ 攻入 E8 斩首赤巢蛛皇！':'◈ 死守赤巢蛛皇 E8',tone:'red'});
  }
 }
 return out;
}

/* 4. Render On-Board Tactical Vector Arrows, Unit Speech Bubbles & Mission Marker Lock-On Reticles */
function renderBoardDeductionLayer(b){
 const surround=b.closest('.board-surround');if(!surround)return;
 let layer=$('board-deduction-layer');
 if(!layer){
  layer=document.createElement('div');
  layer.id='board-deduction-layer';
  layer.className='board-deduction-layer';
  layer.setAttribute('aria-hidden','true');
  surround.append(layer);
 }
 const inCinema=!$('cinema').hidden;
 const flipped=C.side==='r';
 const toScreen=(x,y)=>({
  sx:flipped?7-x:x,
  sy:flipped?7-y:y,
  px:((flipped?7-x:x)+0.5)*12.5,
  py:((flipped?7-y:y)+0.5)*12.5
 });

 const markers=(inCinema&&sandtableActiveFrame?.markers)?sandtableActiveFrame.markers:(!inCinema?activeGameplayMarkers(S):[]);
 let svgArrows='';
 let badgesHtml='';

 if(inCinema&&sandtableActiveFrame?.stageStep==='map'){
  badgesHtml+=`<div class="sandtable-map-scan-banner">◈ 推演第 1 步：8×8 空地图先展示 · 随后双方单位逐一降临发言</div>`;
 }else if(inCinema&&sandtableActiveFrame?.stageStep==='units'){
  badgesHtml+=`<div class="sandtable-map-scan-banner units-step">◈ 推演第 2 步：作战单位逐个降临棋盘 · 实时播报各自战位台词</div>`;
 }else if(inCinema&&sandtableActiveFrame?.stageStep==='markers'){
  badgesHtml+=`<div class="sandtable-map-scan-banner markers-step">◈ 推演第 3 步：当前阶段任务标记与推进路线已锁定</div>`;
 }

 if(inCinema&&typeof sandtableCurrentUnitBubble==='object'&&sandtableCurrentUnitBubble){
  const ub=sandtableCurrentUnitBubble;
  const pos=toScreen(ub.x,ub.y);
  const edgeY=pos.py<22?'bubble-below':'bubble-above';
  const edgeX=pos.px<22?'bubble-left':pos.px>78?'bubble-right':'';
  badgesHtml+=`
   <div class="board-unit-speech-bubble ${ub.side} ${edgeY} ${edgeX}" style="left:${pos.px}%;top:${pos.py}%">
    <span class="bubble-dot">◈</span>
    <span class="bubble-copy">${esc(ub.text)}</span>
   </div>`;
 }

 if(!inCinema&&liveMoveVector){
  const src=toScreen(liveMoveVector.from.x,liveMoveVector.from.y);
  const dst=toScreen(liveMoveVector.to.x,liveMoveVector.to.y);
  const vTone=liveMoveVector.side==='r'?'red':'cyan';
  const vStroke=vTone==='red'?'#ff4a6b':'#54d6ff';
  svgArrows+=`
   <line x1="${src.px}" y1="${src.py}" x2="${dst.px}" y2="${dst.py}" class="deduction-vector-glow live-move-glow" stroke="${vStroke}" />
   <line x1="${src.px}" y1="${src.py}" x2="${dst.px}" y2="${dst.py}" class="deduction-vector-line live-move-line" stroke="${vStroke}" marker-end="url(#vec-arrow-${vTone})" />
   <circle cx="${src.px}" cy="${src.py}" r="1.8" fill="${vStroke}" />
   <circle cx="${dst.px}" cy="${dst.py}" r="2.8" fill="none" stroke="${vStroke}" stroke-width="0.8" />`;
  badgesHtml+=`
   <div class="deduction-marker ${vTone} live-move-marker" style="left:${dst.px}%;top:${dst.py}%">
    <span class="deduction-reticle"><i></i></span>
    <span class="deduction-badge">${esc(liveMoveVector.label)}</span>
   </div>`;
 }

 for(const m of markers){
  if(typeof m.x!=='number'||typeof m.y!=='number')continue;
  const dst=toScreen(m.x,m.y);
  const tone=m.tone||'cyan';
  if(Array.isArray(m.from)&&m.from.length===2){
   const src=toScreen(m.from[0],m.from[1]);
   const strokeColor=tone==='red'?'#ff4a6b':tone==='gold'?'#ffcc4d':tone==='green'?'#42e89b':'#54d6ff';
   svgArrows+=`
    <line x1="${src.px}" y1="${src.py}" x2="${dst.px}" y2="${dst.py}" class="deduction-vector-glow" stroke="${strokeColor}" />
    <line x1="${src.px}" y1="${src.py}" x2="${dst.px}" y2="${dst.py}" class="deduction-vector-line" stroke="${strokeColor}" marker-end="url(#vec-arrow-${tone})" />
    <circle cx="${src.px}" cy="${src.py}" r="1.6" fill="${strokeColor}" />`;
  }
  const edgeClass=dst.py<18?'edge-top':dst.py>82?'edge-bottom':'';
  const sideClass=dst.px<18?'edge-left':dst.px>82?'edge-right':'';
  badgesHtml+=`
   <div class="deduction-marker ${tone} ${inCinema?'cinema-marker':'gameplay-marker'} ${edgeClass} ${sideClass}" style="left:${dst.px}%;top:${dst.py}%">
    <span class="deduction-reticle"><i></i></span>
    <span class="deduction-badge">${esc(m.badge)}</span>
   </div>`;
 }

 layer.innerHTML=`
  <svg class="deduction-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
   <defs>
    <marker id="vec-arrow-cyan" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#54d6ff"/></marker>
    <marker id="vec-arrow-gold" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#ffcc4d"/></marker>
    <marker id="vec-arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#ff4a6b"/></marker>
    <marker id="vec-arrow-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#42e89b"/></marker>
   </defs>
   ${svgArrows}
  </svg>
  ${badgesHtml}`;
}

/* Override tokenHTML so E8 Core displays the Spider Overmind (赤巢蛛皇) portrait */
const baseTokenHTML=tokenHTML;
tokenHTML=function(u){
 if(u.kind==='core'&&typeof OVERMIND_ART==='string'){
  const activeSide=S.phase==='ai'?enemyOf(C.side):C.side;
  const used=u.used&&u.side===activeSide;
  return`<span class="token ${u.side} core ${used?'moved':''}"><img src="${OVERMIND_ART}" alt="赤巢蛛皇" draggable="false"><span class="token-role">皇</span>${shielded(S)?svg('lock','token-shield'):''}<span class="token-name">赤巢蛛皇</span></span>`;
 }
 return baseTokenHTML(u);
};

const baseRefreshPieceSize=typeof refreshPieceSize==='function'?refreshPieceSize:null;
if(baseRefreshPieceSize){
 refreshPieceSize=function(){
  const pan=document.querySelector('.board-pan'),surround=document.querySelector('.board-surround');
  if(!pan||!surround){baseRefreshPieceSize();return;}
  if(portraitView&&pieceZoom===1&&window.innerWidth>900){
   const available=pan.clientWidth||Math.max(320,window.innerWidth-40);
   const size=Math.max(650,Math.min(848,available));
   surround.style.width=size+'px';
   surround.style.minWidth=size+'px';
   surround.style.maxWidth='none';
   document.documentElement.style.setProperty('--card-scale','1');
   if($('zoom-level'))$('zoom-level').textContent='100%';
   if($('zoom-out'))$('zoom-out').disabled=true;
   if($('zoom-in'))$('zoom-in').disabled=false;
   return;
  }
  baseRefreshPieceSize();
 };
 refreshPieceSize();
}

var inFlightDest=null;
const protocolBoard=renderBoard;
renderBoard=function(){
 protocolBoard();
 const b=$('board');if(!b||!S)return;
 const sector=S.subOpSector||({0:'dock',1:'garden',2:'bridge',3:'archive',4:'reactor'}[S.mid||0])||'dock';
 b.dataset.sector=sector;
 if(typeof window.__redrawSpace3D==='function')window.__redrawSpace3D();
 if(S.subOpName){
  const chap=$('mission-title');
  if(chap)chap.textContent=S.subOpName;
 }

 // Hide destination token while smooth glide clone is in flight so there is zero teleport jump
 if(inFlightDest){
  const destToken=b.querySelector(`[data-x="${inFlightDest.x}"][data-y="${inFlightDest.y}"] .token`);
  if(destToken)destToken.classList.add('token-in-flight');
 }

 const inCinema=!$('cinema').hidden;
 if(inCinema){
  const f=sandtableActiveFrame;
  const focusX=typeof sandtableCurrentUnitBubble==='object'&&sandtableCurrentUnitBubble?sandtableCurrentUnitBubble.x:(Array.isArray(f?.focusCell)?f.focusCell[0]:null);
  const focusY=typeof sandtableCurrentUnitBubble==='object'&&sandtableCurrentUnitBubble?sandtableCurrentUnitBubble.y:(Array.isArray(f?.focusCell)?f.focusCell[1]:null);
  const speakerUnit=f?.who?S.units.find(u=>u.char===f.who&&onBoard(u)):null;

  b.querySelectorAll('.cell').forEach(cell=>{
   const cx=+cell.dataset.x,cy=+cell.dataset.y;
   const u=unitAt(S,cx,cy);
   const token=cell.querySelector('.token');
   if(sandtableRevealed instanceof Set){
    cell.classList.remove('legal','capture','selected','danger');
   }
   if(u&&token&&sandtableRevealed instanceof Set){
    if(!sandtableRevealed.has(u.uid)){
     token.classList.add('token-pending-arrival');
    }else if(sandtableJustArrived instanceof Set&&sandtableJustArrived.has(u.uid)){
     token.classList.add('token-just-arrived');
     cell.classList.add('cell-just-arrived');
     cell.insertAdjacentHTML('beforeend',`<span class="unit-arrival-beam ${u.side}"></span><span class="unit-arrival-ring ${u.side}"></span>`);
    }
   }
   const isFocused=(focusX===cx&&focusY===cy)||(speakerUnit&&speakerUnit.x===cx&&speakerUnit.y===cy&&(!sandtableRevealed||sandtableRevealed.has(speakerUnit.uid)));
   if(isFocused){
    cell.classList.add('cell-speaker-focus');
    const hasBubbleHere=typeof sandtableCurrentUnitBubble==='object'&&sandtableCurrentUnitBubble&&sandtableCurrentUnitBubble.x===cx&&sandtableCurrentUnitBubble.y===cy;
    if(u&&!hasBubbleHere&&(!sandtableRevealed||sandtableRevealed.has(u.uid))){
     cell.insertAdjacentHTML('beforeend',`<span class="board-speech-callout ${u.side}">◈ ${esc(nameOf(u))} · ${xy(cx,cy)}</span>`);
    }
   }
  });
 }

 renderBoardDeductionLayer(b);

 const chosen=S.units.find(u=>u.uid===selected&&onBoard(u));if(!chosen)return;
 b.querySelectorAll('.cell.capture').forEach(cell=>{
  const target=unitAt(S,+cell.dataset.x,+cell.dataset.y),mode=captureMode(chosen,target);
  cell.dataset.captureMode=mode;
  cell.insertAdjacentHTML('beforeend',`<span class="resolution-pill ${mode}">${mode==='infect'?'赤蛛融胸寄生':'致命击杀'}</span>`);
 });
 if(chosen.side===C.side&&!chosen.used)$('board-hint').textContent+=chosen.kind==='spider'&&chosen.side==='r'?' · 机娘目标：赤蛛融胸寄生（蜘蛛装置消失）':' · 吃子：致命击杀';
};

/* Smooth Zero-Jump Token Glide (hides destination token until glide completes) */
const baseAnimateToken=animateToken;
animateToken=function(m){
 if(reducedMotion||location.hash==='#qa'||m.type==='wait')return baseAnimateToken(m);
 const u=S.units.find(v=>v.uid===m.uid);if(!u)return Promise.resolve();
 const origin=$('board')?.querySelector(`[data-x="${u.x}"][data-y="${u.y}"] .token`),dest=$('board')?.querySelector(`[data-x="${m.x}"][data-y="${m.y}"]`);
 if(!origin||!dest)return Promise.resolve();
 const a=origin.getBoundingClientRect(),b=dest.getBoundingClientRect(),copy=origin.cloneNode(true);
 copy.classList.add('floating-token');
 for(const [k,v] of Object.entries({left:a.left+'px',top:a.top+'px',width:a.width+'px',height:a.height+'px','max-width':a.width+'px','max-height':a.height+'px',transform:'translate(0,0)',position:'fixed',margin:'0',inset:'auto','pointer-events':'none',overflow:'hidden'}))copy.style.setProperty(k,v,'important');copy.style.setProperty('left',a.left+'px','important');copy.style.setProperty('top',a.top+'px','important');
 document.body.append(copy);
 inFlightDest={x:m.x,y:m.y};
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  copy.style.setProperty('transform',`translate(${b.left+(b.width-a.width)/2-a.left}px,${b.top+(b.height-a.height)/2-a.top-2}px)`,'important');
 }));
 return new Promise(resolve=>setTimeout(()=>{
  inFlightDest=null;
  copy.remove();
  const destToken=$('board')?.querySelector(`[data-x="${m.x}"][data-y="${m.y}"] .token`);
  if(destToken)destToken.classList.remove('token-in-flight');
  resolve();
 },420));
};

const protocolDossier=renderDossier;
renderDossier=function(){
 protocolDossier();
 const u=S?.units.find(v=>v.uid===selected&&onBoard(v))||movers(S,C.side).find(v=>v.char)||movers(S,C.side)[0];if(!u)return;
 if(u.kind==='core'&&typeof OVERMIND_ART==='string'){
  const rob=$('dossier').querySelector('.dossier-robot');
  if(rob)rob.outerHTML=`<div class="dossier-portrait"><img src="${OVERMIND_ART}" alt="赤巢蛛皇"><span class="dossier-code">OVERMIND Ω</span><span class="dossier-status r">赤巢最高领袖</span><div class="dossier-heading"><h3>赤巢蛛皇 · 母巢内核</h3><span>SUPREME SPIDER SOVEREIGN / ${xy(u.x,u.y)}</span></div></div>`;
 }
 const parasite=u.kind==='spider'&&u.side==='r';
 const text=parasite?'唯独赤红蜘蛛扑击正义机娘时，蜘蛛装置会从棋盘消失并直接融进她胸口正中，触发专属受控剧情并永久接管！':'吃到敌方单位直接击杀。机娘、哨卫、信使都不能感染，也不能解救受控者。';
 const dControls=$('dossier').querySelector('.dossier-controls');
 if(dControls){
  dControls.insertAdjacentHTML('beforebegin',`<p class="capture-law ${parasite?'infect':''}"><b>${parasite?'唯一胸口寄生装置（扑中后融进胸甲消失）':'致命吃子'}</b>${text}</p>`);
  if(u.char&&typeof PERSONA!=='undefined'&&PERSONA[u.char]){
   const p=PERSONA[u.char];
   dControls.insertAdjacentHTML('beforebegin',`
    <div class="dossier-persona-box ${u.side}">
     <div class="persona-tag-line"><span>${p.archetype}</span><b>${p.weapon}</b></div>
     <p>${u.side==='r'?p.psychInfected:p.psychClean}</p>
     <small>${p.bonds?.[0]||''}</small>
    </div>`);
  }
 }
};

/* Trigger character combat voice cut-in on unit selection as well */
const baseHandleCell=handleCell;
handleCell=async function(x,y){
 const beforeSel=selected;
 await baseHandleCell(x,y);
 if(selected&&selected!==beforeSel&&S&&S.phase==='player'&&!busy){
  const u=S.units.find(v=>v.uid===selected&&onBoard(v));
  if(u)showCombatBark(u,'select',`待命坐标 ${xy(u.x,u.y)}`);
 }
};

/* Smooth Zero-Jump Move Execution + AI Telegraph + Live Combat Dialogue Cut-In */
const preProtocolPerformMove=performMove;
performMove=async function(m,isPlayer){
 if(!S||S.outcome)return;
 const u=S.units.find(v=>v.uid===m.uid);
 const target=m.capture?unitAt(S,m.x,m.y):null;
 const fromPos=u?{x:u.x,y:u.y}:null;
 const mode=u&&target?captureMode(u,target):null;

 if(u&&fromPos&&location.hash!=='#qa'&&!reducedMotion){
  const actType=mode==='infect'?'infect':m.capture?'attack':m.type==='wait'?'hold':'move';
  const coordLabel=m.type==='wait'?`${nameOf(u)} [${xy(fromPos.x,fromPos.y)}] 固守`:`${nameOf(u)} ${xy(fromPos.x,fromPos.y)} ━━► ${xy(m.x,m.y)}${target?(mode==='infect'?' · 赤蛛融胸寄生 ':' · 击杀 ')+nameOf(target):''}`;
  liveMoveVector={from:fromPos,to:{x:m.x,y:m.y},side:u.side,label:coordLabel};
  showCombatBark(u,actType,coordLabel);
  renderBoardDeductionLayer($('board'));

  if(!isPlayer){
   const originCell=$('board')?.querySelector(`[data-x="${fromPos.x}"][data-y="${fromPos.y}"]`);
   const destCell=$('board')?.querySelector(`[data-x="${m.x}"][data-y="${m.y}"]`);
   originCell?.classList.add('cell-ai-telegraph');
   destCell?.classList.add('cell-ai-target');
   await sleep(360);
  }
 }

 await preProtocolPerformMove(m,isPlayer);

 // If an infection story is still queued (e.g. during AI move), play it now!
 if(pendingInfectionStory&&!qaSilent&&location.hash!=='#qa'&&S&&!S.outcome&&typeof buildInfectionStoryFrames==='function'){
  const inf=pendingInfectionStory;
  pendingInfectionStory=null;
  directorBusy=true;busy=true;
  const frames=buildInfectionStoryFrames(inf.char,inf.from,inf.to);
  await directorScene(frames,`⚡ 胸口寄生突发剧情 · ${inf.name}`);
  directorBusy=false;busy=false;
  if(S)render();
 }

 if(location.hash!=='#qa'&&!reducedMotion){
  setTimeout(()=>{
   liveMoveVector=null;
   if($('board')&&S)renderBoardDeductionLayer($('board'));
  },520);
 }
};

radioForCapture=function(ev){
 if(ev.converted){
  const line=(typeof PERSONA!=='undefined'&&PERSONA[ev.converted.char]?.voice?.infected)||'胸口正中的机械蜘蛛红光暴涨，她的双眸瞬间转为猩红：“神经链路已被赤巢蛛皇覆写……服从母巢指令。”';
  showCombatBark(ev.converted,'infect',`赤红蜘蛛装置已融进胸口正中`,line);
 }
};

function combatCutIn(target,mode){
 clearTimeout(eventTimer);const box=$('capture-event'),infect=mode==='infect';
 box.className='capture-event cinema-capture '+(infect?'r':'lethal');
 const image=target.char?portraitSource(target.char,infect?'r':target.side):target.kind==='core'?(typeof OVERMIND_ART==='string'?OVERMIND_ART:ART.reactor):ART.device;
 const face=target.char||['spider','courier','core'].includes(target.kind)?`<img src="${image}" alt="">`:svg(KINDS[target.kind]?.icon||'drone','kill-machine');
 box.innerHTML=`<div class="capture-face">${face}</div><div class="capture-copy"><span>${infect?'SPIDER FUSED INTO CHEST / IRREVERSIBLE':'TARGET ELIMINATED / NO CONVERSION'}</span><strong>${infect?'赤蛛融胸寄生':'致命击杀'} · ${esc(target.name)}</strong><small>${infect?'赤红蜘蛛棋子已从棋盘消失并融进她胸口正中，触发专属受控觉醒！':'载体永久损毁，不会转换阵营。'}</small><em>${infect?'刚被寄生单位本阶段锁定':'死亡状态跨章保留'}</em></div>`;
 requestAnimationFrame(()=>box.classList.add('show'));eventTimer=setTimeout(()=>box.classList.remove('show'),2400);
 if(!reducedMotion){$('board').classList.remove('shake');requestAnimationFrame(()=>$('board').classList.add('shake'));setTimeout(()=>$('board').classList.remove('shake'),320);}
}
captureEffect=function(target){combatCutIn(target,'infect');};
function killEffect(target){combatCutIn(target,'kill');}

const baseShowGame=showGame;
showGame=function(){
 baseShowGame();
 if(C?.side==='r'){
  radio('赤巢蛛皇 · 母巢主宰','我是赤巢最高意志【OVERMIND Ω】。指挥赤红机械蜘蛛扑击正义机娘，蜘蛛装置将融进她胸口正中并将其转化为我方容器！');
 }
};

/* Connected Branching Campaign Progression (every mission connects to its next branch nodes!) */
const protocolAdvance=advanceMission;
advanceMission=function(){
 if(!S?.outcome?.won)return;
 // If the player completed a connected branch node in SUB_OPERATIONS (in normal mode), offer its connected nextOps!
 if(location.hash!=='#qa'&&S.subOp&&typeof SUB_OPERATIONS!=='undefined'){
  const curNode=SUB_OPERATIONS.find(o=>o.id===S.subOp);
  if(curNode&&Array.isArray(curNode.nextOps)&&curNode.nextOps.length>0){
   $('result').hidden=true;
   const nextChoices=curNode.nextOps.map(nid=>{
    const nextOp=SUB_OPERATIONS.find(o=>o.id===nid);
    if(!nextOp)return null;
    return{
     label:`沿分支进军：${nextOp.code} · 「${nextOp.name}」（${nextOp.routeLabel}）`,
     detail:`${nextOp.continuity} 战区位置：${nextOp.location}。`,
     action:()=>{
      C.step=Math.min(4,nextOp.baseMid);
      launchSubOperation(nextOp.id);
     }
    };
   }).filter(Boolean);
   if(nextChoices.length>0){
    playChoice(echoLine('iris',`【${curNode.code} · ${curNode.name}】战区已肃清！全员状态与胸口寄生记录已同步保留。前方连贯分支航线已解锁，请选择下一处出击节点：`,{title:`${curNode.name}战后 · 连贯分支航线推进`,camera:'medium'}),nextChoices);
    return;
   }
  }
 }
 if(!S?.outcome?.won||S.mid!==3||C.flags.mercy!==null){protocolAdvance();return;}
 const g=C.side==='g',noct=C.roster.noct;
 const frame=echoCard('中枢镜像库 / 破盾抉择','CORE LINK',['破盾协议 / 已读取','赤巢蛛皇内核 / 正在加速孵化赤蛛','胸口寄生状态 / 跨章继承'],'中枢镜像电源直接连着母巢反应堆中的【赤巢蛛皇】。要保留镜像在线以获取完整破盾脉冲，还是立刻切断电源延缓赤蛛孵化？',{title:'留电破译，还是断电封锁',scene:'archive'});
 const choices=[
  {label:'保留镜像电源，全功率破译赤巢蛛皇坐标',detail:`保留可复现的在线破译链，赤巢蛛皇内核维持每 2 轮孵化赤蛛。${g?'存活的朔夜将升至同步 II 在终章迎战。':'存活的朔夜升至同步 II 继续参战，但第 4 轮将遭遇守护者精锐增援。'}已阵亡者不会复活。`,action:()=>{C.flags.mercy=true;C.flags.liveSignature=true;if(noct.status==='active')noct.xp=Math.max(2,noct.xp);nextMission();}},
  {label:'切断镜像电源，物理隔离中枢节点',detail:'赤巢蛛皇内核的赤蛛孵化间隔延缓至每 3 轮一次；存活的朔夜将被封存在离线镜室中不再参战。静态破盾坐标保留，但失去在线破译链。',action:()=>{C.flags.mercy=false;C.flags.liveSignature=false;if(noct.status==='active')noct.status='retired';nextMission();}}
 ];
 if(location.hash!=='#qa'){
  choices.push({label:'沿分支深入「OP 4–3 记忆黑匣子核心」（D–07 实验室分支）',detail:'先率队突入朔夜私人实验室完成分支攻坚，解码初代破盾原件后再直面 Ω–00 赤巢蛛皇。',action:()=>{C.flags.mercy=true;C.flags.liveSignature=true;if(noct.status==='active')noct.xp=Math.max(2,noct.xp);launchSubOperation('op-4-3');}});
 }
 playChoice(frame,choices);
};

/* Connect #flow-btn ("战役路径 ↗") directly to the Connected Branching Campaign Tree in normal mode */
if(location.hash!=='#qa'&&$('flow-btn')&&typeof showCampaignMap==='function'){
 $('flow-btn').textContent='战役分支树 ↗';
 $('flow-btn').onclick=showCampaignMap;
}

const protocolRestore=restorePayload;
restorePayload=function(p){
 if(!payloadValid(p)){protocolRestore(p);return;}
 const old=p.c.combatRules!==2;protocolRestore(p);C.combatRules=2;
 if(old){C.flags.legacyCaptureHistory=true;persist();toast('旧档状态已保留；从现在起只有赤蛛能感染，其他吃子直接击杀，无法解救。');}
};
const protoOpenModal=openModal;
openModal=function(title,eyebrow,html){
 $('toast')?.classList.remove('show');
 protoOpenModal(title,eyebrow,html);
};
const protoCloseModal=closeModal;
closeModal=function(){
 protoCloseModal();
 if($('modal-content'))$('modal-content').innerHTML='';
};
$('close-modal').onclick=()=>closeModal();

const protocolCasefile=showCasefile;
showCasefile=function(){protocolCasefile();$('modal-content').insertAdjacentHTML('afterbegin','<div class="manual-note"><b>开局全员正义形态与赤蛛融胸机制</b>：开局全部 18 名机娘均为清醒的【正义自主形态】；蜘蛛方最高领袖为【赤巢蛛皇 · 母巢主宰 OVERMIND Ω】。唯有当赤红机械蜘蛛扑中机娘时，蜘蛛棋子才会从棋盘消失并直接融进她胸口正中，触发角色专属受控剧情。</div>');};
caseButton.onclick=showCasefile;
const protocolHelp=showHelp;
showHelp=function(){protocolHelp();$('modal-content').insertAdjacentHTML('afterbegin','<div class="manual-note lethal-note"><b>核心法则：只有红蜘蛛能控制 · 开局全员正义形态 · 赤蛛融胸消失并触发角色受控剧情</b><br>1. 开局所有 18 名美少女机娘均为【正义自主形态】，蜘蛛方最高领袖为【赤巢蛛皇】。<br>2. 只有红蜘蛛能控制机娘：当赤红机械蜘蛛吃到机娘时，<b>该赤红蜘蛛装置会从棋盘上消失并直接融进机娘胸口正中央</b>，立即触发该角色的专属受控剧情，将其永久转化为赤巢受控单位。<br>3. 普通机娘、哨卫、信使与运输器的攻击都会直接击杀目标，没有解救、净化或复活。</div>');};
$('help-btn').onclick=showHelp;$('home-rules-btn').onclick=showHelp;
$('home').querySelector('.prototype-tag').textContent='SPIDER OVERMIND · DIRECTOR EDITION';
selectFaction(homeSide);

window.__M14_STATE__=()=>({C,S,performMove});
if(location.hash==='#qa')Object.assign(window.__MV_QA__,{
 captureMode(attacker,target){return captureMode(S.units.find(u=>u.uid===attacker),S.units.find(u=>u.uid===target));},
 hypothetical(m){const before=clone(S),test=clone(S),ev=applyBasic(test,m);return{before,after:test,event:ev};}
});
