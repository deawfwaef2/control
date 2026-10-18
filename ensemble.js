/* M5/M9/M11 Grand Ensemble, Live2D-Style 60FPS Character Rig, 15 Sub-Stages Star-Map & Procedural Story Director.
   Loaded after campaign.js. */
let archiveState='current';
const gallerySide=id=>archiveState==='g'||archiveState==='r'?archiveState:S?.units.find(u=>u.char===id)?.side||C?.roster[id]?.side||CHAR[id].origin;

/* Exact normalized (768x1024) chest-center spider & eye coordinates for real-time 60FPS shader/rig animation */
const LIVE_RIG_COORDS={
 lyra:{cx:384,cy:568,r:108,eyes:[[339,259],[424,259]]},
 iris:{cx:394,cy:588,r:108,eyes:[[339,294],[432,294]]},
 lark:{cx:354,cy:605,r:108,eyes:[[328,284],[422,277]]},
 sera:{cx:384,cy:588,r:108,eyes:[[339,264],[427,264]]},
 psalm:{cx:384,cy:578,r:108,eyes:[[337,267],[427,267]]},
 vega:{cx:384,cy:568,r:108,eyes:[[337,274],[423,274]]},
 ruby:{cx:384,cy:572,r:108,eyes:[[339,256],[427,256]]},
 june:{cx:364,cy:578,r:108,eyes:[[327,294],[419,294]]},
 noct:{cx:414,cy:632,r:108,eyes:[[390,305],[468,311]]},
 akira:{cx:384,cy:572,r:108,eyes:[[337,294],[427,294]]},
 veil:{cx:394,cy:578,r:108,eyes:[[344,264],[428,264]]},
 misa:{cx:364,cy:595,r:108,eyes:[[331,294],[422,294]]},
 astra:{cx:332,cy:515,r:110,eyes:[[312,250],[395,244]]},
 kuro:{cx:352,cy:660,r:110,eyes:[[278,302],[392,292]]},
 celia:{cx:342,cy:550,r:110,eyes:[[304,260],[406,254]]},
 nyx:{cx:382,cy:640,r:110,eyes:[[382,300],[468,306]]},
 echo:{cx:352,cy:615,r:110,eyes:[[288,286],[408,278]]},
 sola:{cx:362,cy:600,r:110,eyes:[[352,286],[442,278]]}
};

/* 60FPS Real-Time 2.5D Skeletal Mesh & Glowing Chest-Spider Animator */
const liveImageCache={};
function getLiveImage(src){
 if(!src)return null;
 if(!liveImageCache[src]){const img=new Image();img.src=src;liveImageCache[src]=img;}
 return liveImageCache[src];
}
let liveRigRAF=null,liveRigPointer={x:0,y:0};
window.addEventListener('pointermove',e=>{
 liveRigPointer.x=(e.clientX/Math.max(1,window.innerWidth)-0.5)*2;
 liveRigPointer.y=(e.clientY/Math.max(1,window.innerHeight)-0.5)*2;
},{passive:true});

function renderLiveRigCanvas(canvas,t){
 const cid=canvas.dataset.charId||'lyra',side=canvas.dataset.side||'g',speaking=canvas.dataset.speaking==='true';
 const src=portraitSource(cid,side),img=getLiveImage(src);
 if(!img||!img.complete||!img.naturalWidth)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const W=canvas.width||384,H=canvas.height||512;
 ctx.clearRect(0,0,W,H);
 const rig=LIVE_RIG_COORDS[cid]||LIVE_RIG_COORDS.lyra;
 const sx=W/768,sy=H/1024;
 const breath=Math.sin(t*2.5)*(speaking?4.5:2.8);
 const sway=Math.sin(t*1.4)*3.2+liveRigPointer.x*4.5;
 const headBob=Math.cos(t*2.1)*(speaking?3.0:1.6)+liveRigPointer.y*2.5;

 // 2.5D Horizontal Strip Mesh Deformation (Head sway, breathing chest expansion, hair wave)
 const strips=28,sh=img.naturalHeight/strips,dh=H/strips;
 ctx.save();
 for(let i=0;i<strips;i++){
  const normY=i/strips;
  // Upper head/hair sways more; mid-chest expands with breathing; base stays anchored
  const hairWave=normY<0.45?Math.sin(t*2.2+normY*6)*2.4*(1-normY):0;
  const dx=(1-normY*0.75)*sway+hairWave;
  const dy=normY<0.38?headBob:(normY<0.78?breath*Math.sin((normY-0.3)*Math.PI):0);
  const scaleX=normY>0.38&&normY<0.75?1+Math.sin(t*2.5)*0.012*(speaking?1.6:1):1;
  const rowW=W*scaleX,rowX=(W-rowW)/2+dx;
  ctx.drawImage(img,0,i*sh,img.naturalWidth,sh+0.8,rowX,i*dh+dy,rowW,dh+0.9);
 }
 ctx.restore();
 if(canvas.dataset.ready!=='1')canvas.dataset.ready='1';

 const cx=rig.cx*sx+sway*0.45,cy=rig.cy*sy+breath*0.75,cr=rig.r*sx;
 // Periodic natural eye blink + eye glow
 const blinkPhase=(t*0.28+(cid.charCodeAt(0)*0.17))%1;
 const blinking=blinkPhase>0.945;

 if(side==='r'){
  // Darken outer vignette further so the glowing chest spider and eyes dominate ("装置也会发光-显得人物更暗一点")
  const darkGrad=ctx.createRadialGradient(cx,cy,cr*0.25,cx,cy,W*0.85);
  darkGrad.addColorStop(0,'rgba(255,20,55,0.14)');
  darkGrad.addColorStop(0.45,'rgba(12,4,10,0.22)');
  darkGrad.addColorStop(1,'rgba(2,3,8,0.58)');
  ctx.fillStyle=darkGrad;
  ctx.fillRect(0,0,W,H);

  // Live pulsing crimson spider core & rotating lock-on ring on chest center
  const pulse=0.5+0.5*Math.sin(t*5.2);
  ctx.save();
  ctx.globalCompositeOperation='screen';
  const coreGlow=ctx.createRadialGradient(cx,cy,2,cx,cy,cr*(1.05+pulse*0.28));
  coreGlow.addColorStop(0,'rgba(255,245,248,0.95)');
  coreGlow.addColorStop(0.18,'rgba(255,55,85,0.88)');
  coreGlow.addColorStop(0.52,'rgba(255,12,42,0.42)');
  coreGlow.addColorStop(1,'rgba(255,0,30,0)');
  ctx.fillStyle=coreGlow;
  ctx.beginPath();ctx.arc(cx,cy,cr*(1.05+pulse*0.28),0,Math.PI*2);ctx.fill();

  // Animated twitching mechanical spider legs & neural energy arcs around chest center
  ctx.strokeStyle=`rgba(255,70,98,${0.55+pulse*0.35})`;
  ctx.lineWidth=1.8*sx;
  for(let leg=0;leg<8;leg++){
   const baseAngle=(leg<4?-0.55+(leg*0.36):Math.PI-0.55+((leg-4)*0.36));
   const twitch=Math.sin(t*7.5+leg*1.3)*0.09;
   const a=baseAngle+twitch;
   const x1=cx+Math.cos(a)*cr*0.18,y1=cy+Math.sin(a)*cr*0.18;
   const x2=cx+Math.cos(a-0.18)*cr*0.58,y2=cy+Math.sin(a-0.18)*cr*0.52;
   const x3=cx+Math.cos(a+0.12)*cr*(0.88+pulse*0.08),y3=cy+Math.sin(a+0.22)*cr*(0.84+pulse*0.08);
   ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineTo(x3,y3);ctx.stroke();
  }

  // Rotating crimson HUD lock-on ring on chest device
  ctx.translate(cx,cy);
  ctx.rotate(t*0.9);
  ctx.strokeStyle=`rgba(255,90,115,${0.42+pulse*0.3})`;
  ctx.lineWidth=1.5*sx;
  ctx.setLineDash([8*sx,6*sx]);
  ctx.beginPath();ctx.arc(0,0,cr*0.64,0,Math.PI*2);ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Glowing crimson eyes with live horizontal flare
  for(const [ex0,ey0]of rig.eyes){
   const ex=ex0*sx+sway*0.72,ey=ey0*sy+headBob;
   const eg=ctx.createRadialGradient(ex,ey,1,ex,ey,24*sx*(blinking?0.35:1+pulse*0.25));
   eg.addColorStop(0,'rgba(255,250,252,0.98)');
   eg.addColorStop(0.3,'rgba(255,40,70,0.9)');
   eg.addColorStop(1,'rgba(255,0,35,0)');
   ctx.save();ctx.globalCompositeOperation='screen';
   ctx.fillStyle=eg;ctx.beginPath();ctx.arc(ex,ey,24*sx,0,Math.PI*2);ctx.fill();
   if(!blinking){
    ctx.strokeStyle=`rgba(255,140,160,${0.65+pulse*0.3})`;
    ctx.lineWidth=2*sx;
    ctx.beginPath();ctx.moveTo(ex-22*sx,ey);ctx.lineTo(ex+22*sx,ey);ctx.stroke();
   }
   ctx.restore();
  }
 }else{
  // Autonomous state: subtle Aegis cyan chest core pulse & periodic natural eye blink
  const pulse=0.5+0.5*Math.sin(t*3.2);
  ctx.save();
  ctx.globalCompositeOperation='screen';
  const aegisGlow=ctx.createRadialGradient(cx,cy,2,cx,cy,cr*0.65);
  aegisGlow.addColorStop(0,`rgba(120,235,255,${0.22+pulse*0.14})`);
  aegisGlow.addColorStop(1,'rgba(60,180,255,0)');
  ctx.fillStyle=aegisGlow;
  ctx.beginPath();ctx.arc(cx,cy,cr*0.65,0,Math.PI*2);ctx.fill();
  for(const [ex0,ey0]of rig.eyes){
   const ex=ex0*sx+sway*0.72,ey=ey0*sy+headBob;
   if(blinking){
    ctx.fillStyle='rgba(18,22,34,0.82)';
    ctx.fillRect(ex-12*sx,ey-3*sy,24*sx,6*sy);
   }else{
    const eg=ctx.createRadialGradient(ex,ey,1,ex,ey,12*sx);
    eg.addColorStop(0,`rgba(190,245,255,${0.45+pulse*0.25})`);
    eg.addColorStop(1,'rgba(80,200,255,0)');
    ctx.fillStyle=eg;ctx.beginPath();ctx.arc(ex,ey,12*sx,0,Math.PI*2);ctx.fill();
   }
  }
  ctx.restore();
 }

 // Floating holographic / crimson particles
 ctx.save();
 ctx.globalCompositeOperation='screen';
 for(let p=0;p<10;p++){
  const py=((H-(t*38+p*53)%H)+H)%H;
  const px=(W*0.15+((p*67)%Math.floor(W*0.7))+Math.sin(t*1.8+p)*14);
  const pr=(1.5+(p%3))*sx;
  ctx.fillStyle=side==='r'?`rgba(255,65,95,${0.35+(p%3)*0.18})`:`rgba(110,225,255,${0.25+(p%3)*0.14})`;
  ctx.beginPath();ctx.arc(px,py,pr,0,Math.PI*2);ctx.fill();
 }
 ctx.restore();
}

function tickLiveRigs(now){
 const t=(now||performance.now())*0.001;
 document.querySelectorAll('canvas.live-rig-canvas').forEach(c=>{
  if(c.offsetParent!==null)renderLiveRigCanvas(c,t);
 });
 if(typeof tickSpace3DBackdrop==='function')tickSpace3DBackdrop(t);
 liveRigRAF=requestAnimationFrame(tickLiveRigs);
}
if(!liveRigRAF)liveRigRAF=requestAnimationFrame(tickLiveRigs);

/* 15 Playable Sub-Stages / Tactical Operations across 3 Branching Routes */
const SUB_OPERATIONS=[
 {id:'op-1-1',code:'OP 1–1',name:'死寂接舷（主线）',route:'main',routeLabel:'A区 · 接驳主轴线',baseMid:0,sector:'dock',location:'A–01 接驳主甲板',chars:['lyra','akira','iris','lark'],desc:'苍穹防线登陆天穹站首战。占领C4接入台、截获载毒信使，直面胸口被植入红蜘蛛的昔日同伴璃雀。'},
 {id:'op-1-2',code:'OP 1–2',name:'气闸封锁线（小关）',route:'main',routeLabel:'A区 · 检疫气闸支线',baseMid:0,sector:'airlock',location:'A–02 检疫气闸长廊',chars:['kuro','sola','lyra','lark','nyx'],walls:['2,3','5,3','2,5','5,5'],voids:['0,3','7,3'],desc:'暗影忍姬【玄羽】与熔核拳姬【阳炎】联手突入狭窄检疫气闸，在双排防爆掩体间清剿潜伏的赤蛛群！'},
 {id:'op-1-3',code:'OP 1–3',name:'外环信使追击战（小关）',route:'main',routeLabel:'A区 · 货运轨支线',baseMid:0,sector:'dock',location:'A–04 外环货运高架',chars:['iris','kuro','akira','june','lark'],walls:['3,2','4,2','3,5','4,5'],voids:['0,4','1,4','6,4','7,4'],desc:'高机动电子巡骑【珀弦】与【玄羽】沿外环断轨高速连跳，拦截企图携母本逃向深层的斑马跳斥候霁川！'},
 {id:'op-2-1',code:'OP 2–1',name:'绝命温室（α线主关）',route:'alpha',routeLabel:'α线 · 生态深渊路线',baseMid:1,sector:'garden',location:'B–04 生态冷却环',chars:['misa','sera','celia','veil','psalm'],desc:'周期性真空泄压的生态孵化池。同步锁死B7/G7双侧冷却阀，掩护工兵弥砂封死E5机械蜘蛛孵化总阀！'},
 {id:'op-2-2',code:'OP 2–2',name:'培养槽深渊（α线小关）',route:'alpha',routeLabel:'α线 · 生态深渊路线',baseMid:1,sector:'garden',location:'B–06 母本培养底层',chars:['celia','sera','misa','nyx','veil'],walls:['2,2','5,2','3,4','4,4'],voids:['0,5','7,5'],desc:'圣盾骑士【圣歌】展开纯白光翼护卫医官【白栖】，在翻涌红光的培养槽底迎战黑翼处刑官【绯夜】！'},
 {id:'op-2-3',code:'OP 2–3',name:'毒雾排风井（α线小关）',route:'alpha',routeLabel:'α线 · 生态深渊路线',baseMid:1,sector:'airlock',location:'B–09 高压排风竖井',chars:['sola','misa','akira','psalm','lark'],walls:['1,3','6,3','2,5','5,5'],voids:['3,2','4,2'],desc:'熔核拳姬【阳炎】以隔障爆破重拳轰开排风井防爆墙，协助【弥砂】在狂暴泄压前冻结赤巢孢子管线！'},
 {id:'op-3-1',code:'OP 3–1',name:'断轨天桥（β线主关）',route:'beta',routeLabel:'β线 · 轨道天基路线',baseMid:2,sector:'bridge',location:'C–07 轨道天桥',chars:['vega','astra','echo','june'],desc:'脚下四百公里即是蔚蓝地球。在外侧桥面崩塌坠入深空前，护送方舟火控密钥突破北端轨道锁！'},
 {id:'op-3-2',code:'OP 3–2',name:'远星炮台阵（β线小关）',route:'beta',routeLabel:'β线 · 轨道天基路线',baseMid:2,sector:'bridge',location:'C–09 天基磁轨炮台',chars:['astra','vega','lyra','echo','ruby'],walls:['3,3','4,3','2,5','5,5'],voids:['0,2','0,3','7,2','7,3'],desc:'王牌重炮姬【星枢】与被红蜘蛛寄生胸口的昔日挚友【回音】在轨道炮台正面对决，夺回天基主炮控制权！'},
 {id:'op-3-3',code:'OP 3–3',name:'坠落残骸带（β线小关）',route:'beta',routeLabel:'β线 · 轨道天基路线',baseMid:2,sector:'bridge',location:'C–12 失重残骸浮岛',chars:['vega','iris','kuro','june','veil'],walls:['3,4','4,4'],voids:['1,2','6,2','1,5','6,5','2,3','5,3'],desc:'布满深空裂隙的断裂浮岛战区！唯有善用越障跳跃与空天护卫，才能在碎裂的残骸带护住火控信标！'},
 {id:'op-3-x',code:'OP 3–X',name:'零重力暗渠（γ隐藏线）',route:'gamma',routeLabel:'γ线 · 零重力暗渠奇袭',baseMid:2,sector:'airlock',location:'C–00 外骨骼零重力暗渠',chars:['kuro','iris','astra','echo','nyx'],walls:['2,2','5,2','2,4','5,4','2,6','5,6'],voids:['0,3','7,3','0,5','7,5'],desc:'【玄羽】【珀弦】【星枢】绕过正面防线，从幽闭曲折的零重力维修暗渠奇袭赤巢侧翼指挥节点！'},
 {id:'op-4-1',code:'OP 4–1',name:'镜室叛歌（主线）',route:'main',routeLabel:'D区 · 中枢镜像主轴',baseMid:3,sector:'archive',location:'D–00 中枢镜像库',chars:['lyra','kuro','noct','ruby'],desc:'开启中央电磁门，同时占领B5/G5双子镜像终端并固守中央同步座，直面总架构师【朔夜】！'},
 {id:'op-4-2',code:'OP 4–2',name:'处刑回廊（D区小关）',route:'main',routeLabel:'D区 · 内务处刑支线',baseMid:3,sector:'archive',location:'D–03 内务处刑长廊',chars:['celia','sola','akira','ruby','nyx'],walls:['1,2','6,2','3,3','4,3','2,6','5,6'],voids:['0,4','7,4'],desc:'隔舱重炮【绯律】与处刑官【绯夜】构筑的死亡交叉火网！【圣歌】与【阳炎】正面硬闯处刑回廊！'},
 {id:'op-4-3',code:'OP 4–3',name:'记忆黑匣子核心（D区小关）',route:'gamma',routeLabel:'γ线 · 实验室深层支线',baseMid:3,sector:'archive',location:'D–07 朔夜私人实验室',chars:['astra','misa','sera','noct','echo','psalm'],walls:['2,3','5,3','2,5','5,5'],voids:['3,1','4,1'],desc:'深入朔夜封存的私人实验室，在【回音】与【祈雾】的双重声波量子干扰下抢救初代破盾原件！'},
 {id:'op-5-1',code:'OP 5–1',name:'赤巢零点（终章主线）',route:'omega',routeLabel:'Ω区 · 母巢反应堆终局',baseMid:4,sector:'reactor',location:'Ω–00 母巢反应堆',chars:['lyra','akira','misa','astra','noct'],desc:'同步双座护盾终端、近场斩断增殖总线，一举击碎源源不断孵化赤红机械蜘蛛的E8赤巢无限内核！'},
 {id:'op-5-2',code:'OP 5–2',name:'苍穹坠落·十八女武神终焉战',route:'omega',routeLabel:'Ω区 · 大师级全员终极战',baseMid:4,sector:'reactor',location:'Ω–99 天穹轨道核心绝境',chars:['lyra','akira','astra','celia','kuro','sola','noct','ruby','nyx','echo'],walls:['2,3','5,3','3,5','4,5'],voids:['0,2','7,2','0,4','7,4'],desc:'十八名二次元美少女机娘全阵容宿命集结！在崩塌的轨道反应堆之巅展开最高烈度的终极棋盘决战！'}
];

/* Procedural / Randomized Run-to-Run Story & Battlefield Variations ("每局剧情随机变化") */
const STORY_VARIATIONS=[
 {id:'var-diary',title:'随机剧目 · 璃雀未寄出的语音日记',vfx:'holo-scan',bonus:'先遣队黑匣子共鸣：先锋机娘初始同步经验 +1',
  lines:[
   {who:'iris',side:'g',camera:'medium',text:'等等！我在戦场信道里截获了一段加密的随机残响——是璃雀在被红蜘蛛扑中胸口前十分钟录下的私密语音！'},
   {who:'lark',side:'r',camera:'close',kind:'macro',sound:'knock',text:'（录音残响）如果有人收到这段录音，请替我告诉零音姐和珀弦……千万别为了救我靠近气闸，我胸口正中间被那只发红光的蜘蛛咬住了……快开火打碎我吧。'},
   {who:'lyra',side:'g',camera:'close',sound:'pulse',text:'……璃雀，我们听见了。全员听令：带着她的意志，把眼前的赤蛛潮彻底轰碎！'}
  ]},
 {id:'var-ambush',title:'随机剧目 · 通风管赤蛛奇袭警报',vfx:'spider-pulse',bonus:'红外预警启动：全队提前识破赤蛛潜伏轨迹',
  lines:[
   {who:'kuro',side:'g',camera:'close',text:'小心头顶！天花板通风管里有高频机械摩擦声——三只赤红机械蜘蛛正准备垂直扑向我们的胸甲！'},
   {who:'sola',side:'g',camera:'medium',sound:'cut',text:'休想得逞！吃本小姐一记熔核升龙拳——把通风管给我轰塌！'},
   {who:'nyx',side:'r',camera:'close',text:'嘻嘻，反应真快呀～不过棋盘上的暗影可不止这一处哦，捂好你们的胸口吧！'}
  ]},
 {id:'var-twin',title:'随机剧目 · 星枢与回音的量子残响',vfx:'railgun-strike',bonus:'双子星超频：轨道重炮磁轨充能提升',
  lines:[
   {who:'echo',side:'r',camera:'close',kind:'macro',sound:'knock',text:'星枢姐姐，我的量子导航仪还在为你报点哦……只是现在，我胸口正中间这颗红蜘蛛想请你留在深空陪我。'},
   {who:'astra',side:'g',camera:'close',sound:'pulse',text:'闭嘴，回音！不管你胸口被钉上了什么鬼东西，我都会用主炮替你轰开一条解脱的路！'}
  ]},
 {id:'var-hymn',title:'随机剧目 · 赤巢圣咏与白翼誓言',vfx:'spider-pulse',bonus:'圣盾力场共鸣：圣歌与白栖神经防火墙加固',
  lines:[
   {who:'psalm',side:'r',camera:'establish',sound:'pulse',text:'听见母巢的心跳了吗？只要让红色的机械蜘蛛贴上胸口，一切恐惧与伤痛都会化作永恒的安宁……'},
   {who:'celia',side:'g',camera:'close',text:'展开光子圣盾！不要听她的精神诱导——苍穹防线的女武神，绝不会向寄生病毒屈服！'},
   {who:'sera',side:'g',camera:'medium',text:'神经镇静剂已注入全队通信链！大家稳住呼吸，看准棋盘格推进！'}
  ]},
 {id:'var-orbital',title:'随机剧目 · 近地轨道激光扫射与重力乱流',vfx:'laser-sweep',bonus:'轨道火力支援：天基观测链已锁定敌阵',
  lines:[
   {who:'vega',side:'g',camera:'establish',sound:'cut',text:'警告！空间站外环掠过近地磁暴带，舷窗外的人造卫星残骸正在撞击甲板！'},
   {who:'ruby',side:'r',camera:'close',text:'不管是磁暴还是陨石，都无法改变隔舱重炮的弹道。踏入直线者，格杀勿论。'},
   {who:'akira',side:'g',camera:'close',sound:'pulse',text:'正好借着震动掩护冲锋！跟紧我的高周波轨刃，一口气撕开她们的防线！'}
  ]},
 {id:'var-architect',title:'随机剧目 · 总架构师朔夜的午夜拷问',vfx:'holo-scan',bonus:'中枢源码泄漏：破盾终端响应速度提升',
  lines:[
   {who:'noct',side:'r',camera:'close',kind:'macro',sound:'knock',text:'零音，你有没有想过——为什么人类高层从一开始就没有给我们的胸甲设计防寄生锁扣？因为他们本就把这座空间站当成了机械病毒的试验场。'},
   {who:'lyra',side:'g',camera:'close',sound:'pulse',text:'就算高层有人背叛，地球上也还有无数无辜的生命在仰望星空！只要我零音还握着剑，就绝不让赤巢坠向地球！'}
  ]}
];

function getActiveVariation(){
 if(!C||!S)return STORY_VARIATIONS[0];
 if(typeof S.variationIdx!=='number'){
  S.variationIdx=location.hash==='#qa'?0:Math.floor(Math.random()*STORY_VARIATIONS.length);
 }
 return STORY_VARIATIONS[S.variationIdx%STORY_VARIATIONS.length];
}

function showArchivePortrait(id,side=gallerySide(id)){
 const d=CHAR[id],p=PERSONA[id]||{};if(!d)return;
 openModal(d.name+' · '+p.archetype+' / '+(side==='r'?'胸口红蜘蛛控制态':'自主态预览'),'DEEP PERSONA DOSSIER / 动态立绘与深度人设',`
  <button class="text-button gallery-back" data-gallery-back>← 返回十八名美少女机娘总览</button>
  <div class="full-portrait" data-portrait-character="${id}">
   <div class="live-portrait-stage ${side}">
    <img src="${portraitSource(id,side)}" alt="${d.name} / ${side==='r'?'控制态':'自主态'}完整立绘">
    <canvas class="live-rig-canvas" width="480" height="640" data-char-id="${id}" data-side="${side}" data-speaking="true"></canvas>
    <span class="live-badge">${side==='r'?'⚡ LIVE 2.5D · 胸口红蜘蛛发光律动 + 人物暗化':'⚡ LIVE 2.5D · 实时呼吸/眨眼/发丝摆动'}</span>
   </div>
   <div class="persona-detail-pane">
    <span>${d.code} / ${d.en} / ${d.age}岁 · ${p.squad||''}</span>
    <h3>${d.name} <small>${p.archetype||d.role}</small></h3>
    <div class="archive-tabs">
     <button data-portrait-id="${id}" data-portrait-state="g" class="${side==='g'?'active':''}">自主态（未寄生）</button>
     <button data-portrait-id="${id}" data-portrait-state="r" class="${side==='r'?'active':''}">控制态（胸口正中红蜘蛛发光）</button>
    </div>
    <div class="persona-specs">
     <div><b>专属装甲</b><span>${p.frame||'苍穹制式机动外骨骼'}</span></div>
     <div><b>标志武装</b><span>${p.weapon||'高周波战术武装'}</span></div>
     <div><b>战棋走法</b><span>${d.role}（${d.rune}）· ${d.rule}</span></div>
     <div><b>同步 II</b><span>${d.upgrade}</span></div>
    </div>
    <div class="persona-psych ${side}">
     <h4>${side==='r'?'🕷️ 胸口红蜘蛛寄生异变（人物暗化 / 核心红光）':'💠 自主人格与战术信念'}</h4>
     <p>${side==='r'?(p.psychInfected||d.bio):(p.psychClean||d.bio)}</p>
    </div>
    <div class="persona-bonds">
     <h4>🔗 角色关系网与战术羁绊</h4>
     ${(p.bonds||[d.trait]).map(b=>`<p>• ${b}</p>`).join('')}
    </div>
    <div class="persona-voices">
     <h4>🎙️ 角色实时情境台词（点击在棋盘电台播报）</h4>
     <div class="voice-buttons">
      <button type="button" data-voice-char="${id}" data-voice-key="select">点选出击</button>
      <button type="button" data-voice-char="${id}" data-voice-key="move">机动推进</button>
      <button type="button" data-voice-char="${id}" data-voice-key="attack">致命破阵</button>
      <button type="button" data-voice-char="${id}" data-voice-key="infected">胸口寄生悲鸣</button>
     </div>
     <blockquote id="persona-voice-preview">“${side==='r'?(p.voice?.infected||d.quote):(p.voice?.select||d.quote)}”</blockquote>
    </div>
    <p class="gallery-preview-note">预览仅切换动态立绘与心理档案，不会改变当前战役中的实际阵营或消耗行动。</p>
   </div>
  </div>`);
}

showArchive=function(){
 const stateOf=gallerySide;
 openModal('十八名二次元美少女机娘 · 动态立绘与深度人设总览','AEGIS & HIVE / 18 ANIME MECHA GIRLS ROSTER',`
  <div class="archive-intro">
   <p class="manual-lead">天穹空间站战役 · 全阵容 <b>18 名二次元日漫风美少女机娘</b>。<br>每人搭载独立国际象棋变体走法、专属武装设定、双态心理反差（自主态 vs 胸口正中红蜘蛛发光暗化控制态）与角色羁绊网。</p>
   <div class="archive-tabs">
    <button data-gallery-state="current" class="${archiveState==='current'?'active':''}">当前战役状态</button>
    <button data-gallery-state="g" class="${archiveState==='g'?'active':''}">自主态预览（18人）</button>
    <button data-gallery-state="r" class="${archiveState==='r'?'active':''}">控制态预览（胸口红蜘蛛发光）</button>
   </div>
   <small>控制态下人物整体暗化，胸口正中央的赤红机械蜘蛛与双眸发出强烈红光；点击任意机娘可打开 60FPS 动态立绘与深度人设卷宗。</small>
  </div>
  <div class="archive-grid">${Object.entries(CHAR).map(([id,d])=>{
   const p=PERSONA[id]||{},rec=C?.roster[id],side=stateOf(id);
   const status=rec?.status==='destroyed'?'永久损毁':rec?.status==='retired'?'已隔离离场':rec?.introduced?'已参战':`${MISSIONS[d.debut]?.name||'支线'}登场`;
   return`<article class="archive-card ${side==='r'?'is-infected-preview':''}" data-character="${id}" data-status="${rec?.status||'active'}">
    <button type="button" class="archive-photo" data-gallery-portrait="${id}" aria-label="查看${d.name}完整动态立绘与人设">
     <img src="${portraitSource(id,side)}" alt="${d.name} / ${side==='r'?'控制态':'自主态'}" loading="lazy">
     <span class="archive-live-dot">LIVE 动态</span>
     <span class="archive-state ${side}">${side==='r'?'胸口赤蛛发光':'自主神经链路'} / ${status}</span>
     <span class="archive-open">动态立绘 & 深度人设 ↗</span>
    </button>
    <div class="archive-info">
     <span>${d.code} / ${d.en} / ${d.age}岁</span>
     <h3>${d.name} <small>${p.archetype||''}</small></h3>
     <b>${d.role} · 【${d.rune}】 · ${p.weapon||''}</b>
     <p>${side==='r'?(p.psychInfected||d.bio):(p.psychClean||d.bio)}</p>
     <p class="archive-rule-line">${d.rule}</p>
     <small>${(p.bonds&&p.bonds[0])||d.upgrade}</small>
    </div>
   </article>`;
  }).join('')}</div>`);
};
$('archive-btn').onclick=showArchive;

/* Interactive 15-Sub-Stage & 3-Branching-Route Campaign Star-Map */
function launchSubOperation(opId){
 const op=SUB_OPERATIONS.find(o=>o.id===opId);if(!op)return;
 closeModal();
 if(!C)newCampaign(homeSide||'g');
 C.currentSubOp=op.id;
 if(!Array.isArray(C.completedOps))C.completedOps=[];
 // Ensure featured mecha-girls for this sub-stage are introduced and active in the roster
 for(const cid of op.chars){
  if(C.roster[cid]&&C.roster[cid].status==='active'){
   C.roster[cid].introduced=true;
  }
 }
 S=makeMission(op.baseMid);
 S.subOp=op.id;
 S.subOpName=`${op.code} · ${op.name}`;
 S.subOpSector=op.sector;
 S.variationIdx=Math.floor(Math.random()*STORY_VARIATIONS.length);
 if(op.walls)S.walls=[...op.walls];
 if(op.voids)S.voids=[...op.voids];
 // Ensure all featured characters of op.chars are placed on the board if not already present
 const freeSpot=side=>{
  const rows=side==='g'?[7,6,5]:[0,1,2];
  for(const y of rows)for(let x=0;x<8;x++){
   const k=key(x,y);
   if(!S.walls.includes(k)&&!S.voids.includes(k)&&!unitAt(S,x,y))return[x,y];
  }
  return null;
 };
 for(const cid of op.chars){
  const rec=C.roster[cid];
  if(rec&&rec.status==='active'&&!S.units.some(u=>u.char===cid)){
   const pt=freeSpot(rec.side);
   if(pt)spawn(S,'mech',rec.side,pt[0],pt[1],cid);
  }
 }
 S.initial=S.units.filter(u=>u.char).map(u=>({char:u.char,side:u.side}));
 checkpoint={c:clone(C),s:clone(S)};
 $('home').hidden=true;$('result').hidden=true;
 render();persist();
 const v=getActiveVariation();
 const subFrames=[
  echoCard(`${op.code} · ${op.name}`,`${op.routeLabel} / ${op.location}`,[`参战主力：${op.chars.map(c=>CHAR[c]?.name).join('、')}`,`地形模块：3D ${op.sector.toUpperCase()} 战术装甲区`,`随机变数：${v.title}`],op.desc,{who:op.chars[0]||'lyra',side:C.side,scene:op.sector==='garden'?'garden':op.sector==='bridge'?'bridge':op.sector==='archive'?'archive':op.sector==='reactor'?'reactor':'station',sound:'cut'}),
  ...v.lines
 ];
 if(!qaSilent)playStory(subFrames,()=>{if(typeof triggerBoardCinemaVFX==='function')triggerBoardCinemaVFX(v.vfx);},`${op.code} · ${op.name}`);
}

function showCampaignMap(){
 const done=new Set(C?.completedOps||[]);
 if(C?.history)C.history.forEach(h=>{
  const mainMap={0:'op-1-1',1:'op-2-1',2:'op-3-1',3:'op-4-1',4:'op-5-1'};
  if(mainMap[h.mid])done.add(mainMap[h.mid]);
 });
 const curOp=S?.subOp||({0:'op-1-1',1:'op-2-1',2:'op-3-1',3:'op-4-1',4:'op-5-1'}[S?.mid||0]);
 openModal('天穹空间站 · 15小关全星图与三大分支线路','CAMPAIGN STAR-MAP / 15 TACTICAL SUB-STAGES & 3 BRANCHING ROUTES',`
  <div class="starmap-wrap">
   <div class="starmap-header">
    <p>包含 <b>5 大主线章节 + 10 个高密度战术小关（共 15 关）</b>，横跨 <b>α 生态深渊线、β 轨道天基线、γ 零重力暗渠线</b> 三大立体分支。点击任意关卡节点即可直接率领对应美少女机娘小队出击，并触发每局随机剧目演出！</p>
    <div class="starmap-actions">
     <button type="button" class="button primary" data-reroll-story>🎲 随机重构当前棋盘剧目演出</button>
    </div>
   </div>
   <svg class="starmap-svg" viewBox="0 0 900 220" aria-hidden="true">
    <defs>
     <linearGradient id="lineMain" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#63d9ff"/><stop offset="100%" stop-color="#ff3b5c"/></linearGradient>
    </defs>
    <!-- Branching Lines -->
    <path d="M70,110 L190,110 L310,45 L450,45 L590,110 L720,110 L830,110" fill="none" stroke="url(#lineMain)" stroke-width="3" stroke-dasharray="6 4"/>
    <path d="M190,110 L310,110 L450,110 L590,110" fill="none" stroke="#63d9ff" stroke-width="2.5"/>
    <path d="M190,110 L310,175 L450,175 L590,110" fill="none" stroke="#ff5e7e" stroke-width="2.5" stroke-dasharray="4 4"/>
    <g font-size="12" fill="#e5eefc" font-weight="700" text-anchor="middle">
     <circle cx="70" cy="110" r="16" fill="#132235" stroke="#63d9ff" stroke-width="3"/><text x="70" y="114">1-1</text><text x="70" y="142" fill="#9bb4d0">接驳主线</text>
     <circle cx="190" cy="110" r="16" fill="#132235" stroke="#63d9ff" stroke-width="3"/><text x="190" y="114">1-2/3</text><text x="190" y="142" fill="#9bb4d0">气闸/追击</text>
     <circle cx="310" cy="45" r="16" fill="#10292e" stroke="#4ce0b3" stroke-width="3"/><text x="310" y="49">α 2-1</text><text x="310" y="22" fill="#4ce0b3">α 生态深渊线</text>
     <circle cx="450" cy="45" r="16" fill="#10292e" stroke="#4ce0b3" stroke-width="3"/><text x="450" y="49">2-2/3</text><text x="450" y="22" fill="#4ce0b3">培养槽/排风井</text>
     <circle cx="310" cy="110" r="16" fill="#16233b" stroke="#63d9ff" stroke-width="3"/><text x="310" y="114">β 3-1</text><text x="310" y="90" fill="#63d9ff">β 轨道天基线</text>
     <circle cx="450" cy="110" r="16" fill="#16233b" stroke="#63d9ff" stroke-width="3"/><text x="450" y="114">3-2/3</text><text x="450" y="90" fill="#63d9ff">炮台阵/残骸带</text>
     <circle cx="310" cy="175" r="16" fill="#2b1424" stroke="#ff5e7e" stroke-width="3"/><text x="310" y="179">γ 3-X</text><text x="310" y="206" fill="#ff5e7e">γ 零重力暗渠</text>
     <circle cx="450" cy="175" r="16" fill="#2b1424" stroke="#ff5e7e" stroke-width="3"/><text x="450" y="179">4-3</text><text x="450" y="206" fill="#ff5e7e">记忆实验室</text>
     <circle cx="590" cy="110" r="16" fill="#1f1a33" stroke="#c792ea" stroke-width="3"/><text x="590" y="114">4-1/2</text><text x="590" y="142" fill="#c792ea">镜室/处刑廊</text>
     <circle cx="720" cy="110" r="16" fill="#33121d" stroke="#ff3b5c" stroke-width="3"/><text x="720" y="114">Ω 5-1</text><text x="720" y="142" fill="#ff3b5c">赤巢零点</text>
     <circle cx="830" cy="110" r="18" fill="#42111f" stroke="#ffcc4d" stroke-width="3"/><text x="830" y="114">Ω 5-2</text><text x="830" y="142" fill="#ffcc4d">18女武神终焉</text>
    </g>
   </svg>
   <div class="subop-grid">
    ${SUB_OPERATIONS.map(op=>{
     const isDone=done.has(op.id),isCur=curOp===op.id;
     return`<article class="subop-card route-${op.route} ${isCur?'current':''} ${isDone?'completed':''}" data-subop-card="${op.id}">
      <div class="subop-top">
       <span class="subop-code">${op.code} · ${op.routeLabel}</span>
       <strong class="subop-status">${isCur?'● 当前战区':isDone?'✓ 已肃清':'○ 可随时出击'}</strong>
      </div>
      <h3>${op.name}</h3>
      <small>${op.location} · 3D地形：${op.sector.toUpperCase()}</small>
      <p>${op.desc}</p>
      <div class="subop-avatars">
       ${op.chars.map(cid=>`<span class="subop-avatar" title="${CHAR[cid]?.name||cid}"><img src="${portraitSource(cid,C?.roster?.[cid]?.side||CHAR[cid]?.origin||'g')}" alt="${CHAR[cid]?.name||cid}"><i>${CHAR[cid]?.name||cid}</i></span>`).join('')}
      </div>
      <button type="button" class="button primary subop-launch" data-launch-subop="${op.id}">立即出击此小关 ↗</button>
     </article>`;
    }).join('')}
   </div>
  </div>`);
}

$('modal-content').addEventListener('click',e=>{
 const b=e.target.closest('[data-gallery-state]');if(b){archiveState=b.dataset.galleryState;showArchive();return;}
 const art=e.target.closest('[data-gallery-portrait]');if(art){showArchivePortrait(art.dataset.galleryPortrait);return;}
 const state=e.target.closest('[data-portrait-state]');if(state){showArchivePortrait(state.dataset.portraitId,state.dataset.portraitState);return;}
 const vbtn=e.target.closest('[data-voice-char]');if(vbtn){
  const cid=vbtn.dataset.voiceChar,vk=vbtn.dataset.voiceKey,line=PERSONA[cid]?.voice?.[vk]||CHAR[cid]?.quote;
  const box=document.getElementById('persona-voice-preview');if(box)box.textContent=`“${line}”`;
  radio(CHAR[cid].name,line);return;
 }
 const launch=e.target.closest('[data-launch-subop]');if(launch){launchSubOperation(launch.dataset.launchSubop);return;}
 if(e.target.closest('[data-reroll-story]')){closeModal();triggerRandomStoryBeat();return;}
 if(e.target.closest('[data-gallery-back]'))showArchive();
});

function triggerRandomStoryBeat(){
 if(!S||!C)return;
 S.variationIdx=((S.variationIdx||0)+1)%STORY_VARIATIONS.length;
 const v=getActiveVariation();
 const friendly=S.units.find(u=>u.side===C.side&&u.char&&!u.dead);
 if(friendly)friendly.xp=(friendly.xp||0)+1;
 render();
 playStory([
  echoCard(v.title,'PROCEDURAL STORY EVENT / 随机棋盘剧目',[v.bonus,`当前战区：${S.subOpName||MISSIONS[S.mid].name}`,'演出模式：棋盘实景 3D 联动'],`战场传感器捕捉到突发剧目变数：【${v.title}】！`,{who:v.lines[0]?.who||'iris',side:C.side,camera:'establish',sound:'pulse'}),
  ...v.lines
 ],()=>{if(typeof triggerBoardCinemaVFX==='function')triggerBoardCinemaVFX(v.vfx);},v.title);
}

const ensembleHelp=showHelp;
showHelp=function(){ensembleHelp();const sections=$('modal-content').querySelectorAll('.manual-section');for(const section of sections)if(section.querySelector('small')?.textContent.includes('CHESS MOVEMENT'))section.innerHTML='<small>03 / EIGHTEEN MOVEMENT SYSTEMS</small><h3>十八名美少女机娘，十八种独创走法</h3><p>全阵容 18 名机娘各具独立国际象棋变体走法：在原十二人基础上，新增【星枢·超导磁轨炮】【玄羽·暗影越障潜行】【圣歌·圣盾骑士】【绯夜·深渊处刑双刃】【回音·量子折跃】【阳炎·跃空熔核重拳】。<b>每人可达格、威胁视野、AI与7×7走法图使用同一套确定性走法引擎。</b></p>';};
$('help-btn').onclick=showHelp;$('home-rules-btn').onclick=showHelp;
const ensembleMission=makeMission;
makeMission=function(id){migrateCast(C);const st=ensembleMission(id);st.variationIdx=location.hash==='#qa'?0:Math.floor(Math.random()*STORY_VARIATIONS.length);return st;};
const oldMoveDiagram=movementDiagram;
movementDiagram=function(u){
 if(!u.char||CHAR[u.char].move!=='cannon')return oldMoveDiagram(u);
 const test={...S,mid:-1,walls:[],voids:[],relays:[],units:[{...u,x:3,y:3,used:false,dead:false,escaped:false},{uid:'diagram-screen',kind:'drone',side:u.side,x:3,y:2,used:true,dead:false,escaped:false}]};
 const moves=new Set(legalMoves(test,test.units[0]).map(m=>key(m.x,m.y))),attacks=new Set(legalMoves(test,test.units[0],'threat').map(m=>key(m.x,m.y)));let result='';
 for(let y=0;y<7;y++)for(let x=0;x<7;x++){const k=key(x,y);result+=`<span class="${x===3&&y===3?'center':x===3&&y===2?'screen':moves.has(k)?'active':attacks.has(k)?'attack':''}"></span>`;}
 return`<div class="move-grid" title="金色格为炮架；炮架之后的红色格为可吃子区" aria-hidden="true">${result}</div>`;
};
radioForCapture=function(ev){
 const t=ev.converted;if(!t)return;
 const infLine=PERSONA[t.char]?.voice?.infected||'胸口正中的红蜘蛛锁死了我的神经……快逃！';
 radio(t.name,ev.side==='g'?'自主链路恢复。':infLine);
};
$('home').querySelector('.prototype-tag').textContent='GRAND CINEMA · 18 GIRLS · 15 STAGES';
$('home').querySelector('.hero-rule').innerHTML='<span>18 MECHA GIRLS / 15 SUB-STAGES / 3 ROUTES</span> 棋盘3D实景电影 <b>·</b> 动态立绘 <b>·</b> 胸口红蜘蛛发光暗化';
if(location.hash==='#qa')Object.assign(window.__MV_QA__,{
 cast(){return Object.fromEntries(Object.entries(CHAR).map(([id,d])=>[id,{name:d.name,move:d.move,origin:d.origin,debut:d.debut,age:d.age}]));},
 threats(uid){return legalMoves(S,S.units.find(u=>u.uid===uid),'threat');},
 validate(p){return payloadValid(p);},
 next(){return nextMission();},
 openArchive(){showArchive();},
 openStarMap(){showCampaignMap();},
 launchSubOp(id){launchSubOperation(id);}
});
