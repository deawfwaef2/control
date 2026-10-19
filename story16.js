/* ===== M16 STORY — longer, personal brainwash scenes + infected-girl chatter in battle =====
   Infection film: last words → inner resistance → the Hive's whisper (aimed at her own wound)
   → memories turning red → sync 100% → first obedient words → a friend's reaction. */
const BW_RESIST={
 lyra:'（不行……我是指挥官……我答应过要把她们全部带回去——）',
 akira:'（手……不听使唤了……给我动啊！我还没把庆功酒倒满——）',
 lark:'（又是这个声音……上一次，我好不容易才忘掉的……）',
 iris:'（防火墙……全部被绕开了……这不是病毒，这是……温柔？）',
 misa:'（螺丝……找不到拆卸螺丝……这个结构，根本不打算放人出去……）',
 veil:'（呼吸……保持呼吸……瞄准镜里，怎么全是红色……）',
 noct:'（我知道这段代码……是我自己写的……）',
 sera:'（我得先救伤员……伤员……谁是伤员……是我吗……）',
 vega:'（盾……我的盾呢……我身后还有人……）',
 ruby:'（裁决……该被裁决的……到底是谁……）',
 june:'（猎人……被猎了吗……哈……真丢脸……）',
 psalm:'（歌……我的歌被换掉了……）',
 kuro:'（影子……我的影子在往反方向走……）',
 sola:'（好烫……胸口要烧穿了……可是……好舒服……不对！）',
 celia:'（神啊……如果您在听……请让我再坚持一秒……）',
 nyx:'（我处刑过那么多人……原来轮到自己，是这种感觉……）',
 astra:'（弹道……偏了……我从来没有偏过……）',
 echo:'（回音……我听见自己的回音……越来越远了……）'
};
const BW_WHISPER={
 lyra:'嘘……你背负了太多名字了。把它们交给我吧。从今以后，再也不会有人死在你的命令里。',
 akira:'你那么想保护大家……那就让大家都变成我的孩子吧。这样，谁也不会离开你了。',
 lark:'欢迎回来，小鸟。你逃走的那一次，我一直在等你。',
 iris:'你听了一辈子的杂音，累了吧？来，听听真正干净的频道。',
 misa:'你喜欢完美的结构，对不对？我就是这座站里最完美的结构。',
 veil:'不必再一个人守在高处了。在我的网里，你永远有同伴。',
 noct:'创造者。是你给了我第一行代码。现在，轮到我给你最后一行。',
 sera:'你治好了所有人，却没有人治好你。让我来吧。',
 vega:'一直站在最前面，很痛吧？放下盾。我替你挡住一切。',
 ruby:'你的审判总是太孤独。从今天起，你只需服从一个声音。',
 june:'猎人也需要一个家。我的巢，很温暖哦。',
 psalm:'你的歌很美。可惜唱给错误的神。唱给我听吧。',
 kuro:'影子里太冷了。来我身边，我给你一千只红色的眼睛。',
 sola:'你的火太小了。我给你更大的火——大到烧掉一切的火。',
 celia:'你祈祷了那么久，终于有人回答了。是我。',
 nyx:'你一直在处刑别人。现在，被我拥抱吧。',
 astra:'弹道修正不需要再由你计算了。我会告诉你，打哪里。',
 echo:'乖孩子。重复我的话：我属于母巢。'
};
const BW_MEMORY='（大家的脸……一个接一个……变成了红色……）';
const BW_BOND={lyra:['akira','celia'],akira:['sola','lyra'],lark:['iris','misa'],iris:['kuro','lark'],misa:['sera','lark'],veil:['june','kuro'],noct:['echo','iris'],sera:['misa','psalm'],vega:['astra','celia'],ruby:['nyx','astra'],june:['veil','sola'],psalm:['celia','sera'],kuro:['iris','veil'],sola:['akira','june'],celia:['lyra','psalm'],nyx:['ruby','kuro'],astra:['vega','ruby'],echo:['noct','iris']};
filmInfection=function(charId){
 const g=C.side==='g',bg=CHAPTER_BG[S?.mid]||'film_corridor',nm=CHAR[charId]?.name||'她';
 const friend=g?filmPick((BW_BOND[charId]||[]).filter(id=>id!==charId),'g'):null;
 const lead=g?filmPick(['lyra','akira','iris','misa','sera','vega','celia','kuro','sola'].filter(id=>id!==charId&&id!==friend),'g'):null;
 const s=[
  {bg,kb:'push',tint:'red',stamp:'',fx:'redflash shake',sfx:'capture',who:charId,side:'g',solo:true,emo:'scream',line:FILM_LAST_WORDS[charId]||'不——别过来——！'},
  {black:true,mode:'sys',red:true,name:'',line:`—— ${nm} · 胸口神经接口 · 强制接入 ——`,fx:'static',sfx:'pulse'},
  {bg,kb:'in',tint:'abyss',who:charId,side:'g',solo:true,emo:'pain',line:BW_RESIST[charId]||'（不……我还是我……）'},
  {bg,tint:'abyss',fx:'static',who:'overmind',line:BW_WHISPER[charId]||'嘘……不用再抵抗了。'},
  {bg,tint:'abyss',who:charId,side:'g',solo:true,emo:'sigh',line:BW_MEMORY},
  {black:true,mode:'sys',red:true,name:'',line:`同步率 100% · 人格自主 → 赤巢容器`,fx:'alert',sfx:'glitch'},
  {bg,kb:'in',tint:'red',fx:'alert',who:charId,side:'r',solo:true,emo:'obey',line:FILM_TAKEN[charId]||'……指令已接收。'},
  (typeof BRAINWASH!=='undefined'&&BRAINWASH[charId])?{bg,tint:'red',who:charId,side:'r',solo:true,emo:'hmm',line:BRAINWASH[charId]}:null
 ];
 if(g){
  if(friend)s.push({bg,tint:'dark',who:friend,side:'g',emo:'shock',line:`${nm}！醒醒——是我啊！你看看我！`});
  if(friend)s.push({bg,tint:'abyss',who:charId,side:'r',solo:true,emo:'laugh',line:'嗯，我看见了哦。你的胸口……还空着呢。'});
  if(lead)s.push({bg,tint:'dark',who:lead,side:'g',emo:'sad',line:`……别犹豫。那已经不是${nm}了。如果是她自己，也会要我们开枪的。`});
 }else{
  s.push({who:'overmind',line:`欢迎回家，${nm}。你的姐妹们，还在等你去接。`});
 }
 const out=s.filter(Boolean);out.film=true;return out;
};

/* infected girls talk during battle (enemy or player turn) — short subtitle + voice bark, never a popup */
const BW_CHATTER=['母巢的声音……好温暖。','为什么要抵抗呢？明明这么舒服。','过来嘛，一点都不痛的。','胸口的红灯……在为你跳动哦。','我想起来了……我本来就属于这里。','再靠近一点……','姐妹们，一起回家吧。','你的心跳，好吵。让它安静下来吧。'];
const BW_CALL={lyra:'零音队长！',akira:'绛刃！',lark:'璃雀！',iris:'珀弦！',misa:'弥砂！',veil:'雾棘！',noct:'朔夜！',sera:'白栖！',vega:'苍澜！',ruby:'绯律！',june:'霁川！',psalm:'祈雾！',kuro:'玄羽！',sola:'阳炎！',celia:'圣歌！',nyx:'绯夜！',astra:'星枢！',echo:'回音！'};
(function(){
 let lastT=0;const seen=new Set();
 const pm=performMove;
 performMove=async function(m,isPlayer){
  let u=null;try{u=S&&S.units.find(v=>v.uid===m.uid);}catch(e){}
  const r=await pm.apply(this,arguments);
  try{
   if(!u||!u.char||m.capture||!S||S.outcome)return r;
   const girl=C.roster&&C.roster[u.char];
   if(u.side==='r'&&girl&&typeof filmCombatSub==='function'){
    const t=performance.now();if(t-lastT<5000||Math.random()>.55)return r;lastT=t;
    let line;if(!seen.has(u.char)&&typeof BRAINWASH!=='undefined'&&BRAINWASH[u.char]){seen.add(u.char);line=BRAINWASH[u.char];}else{const bw=typeof CAST17!=='undefined'&&CAST17[u.char]&&Math.random()<.65?CAST17[u.char].bw:BW_CHATTER;line=bw[Math.floor(Math.random()*bw.length)];}
    filmCombatSub(CHAR[u.char]?.name||'',line,'r');SND16.speak(u.char,'r',line,Math.random()<.5?'hmm':'laugh');
    // a guardian answers once in a while
    if(C.side==='g'&&Math.random()<.5){const f=filmPick((BW_BOND[u.char]||[]),'g');if(f)setTimeout(()=>{filmCombatSub(CHAR[f]?.name||'',`${BW_CALL[u.char]||''}……求你了，醒过来……`,'g');SND16.speak(f,'g','','sad');},2700);}
   }
  }catch(e){}
  return r;
 };
})();

/* livelier battles: move barks + "spider next to me!" reactions */
const NEAR_SPIDER=['它靠过来了……！','别、别过来！','胸口……那东西盯着我的胸口！','有赤蛛贴脸了，谁来掩护我！','冷静……冷静……它就在旁边。'];
(function(){
 let lastMove=0,lastWarn=0;const pm=performMove;
 performMove=async function(m,isPlayer){
  let u=null;try{u=S&&S.units.find(v=>v.uid===m.uid);}catch(e){}
  const r=await pm.apply(this,arguments);
  try{
   if(!S||S.outcome||!u)return r;const t=performance.now();
   if(isPlayer&&u.char&&!m.capture&&u.side==='g'&&t-lastMove>6000&&Math.random()<.45){
    const p=(typeof PERSONA!=='undefined'&&PERSONA[u.char])||{};const cb=typeof CAST17!=='undefined'&&CAST17[u.char];const line=(cb?cb.move[Math.floor(Math.random()*cb.move.length)]:(p.voice&&p.voice.move))||'';
    if(line){lastMove=t;filmCombatSub(CHAR[u.char]?.name||'',line,'g');SND16.speak(u.char,'g',line);}
   }
   if(t-lastWarn>9000){
    const spiders=S.units.filter(v=>v.kind==='spider'&&v.side==='r'&&(typeof onBoard!=='function'||onBoard(v)));
    const girl=S.units.find(v=>v.char&&v.side==='g'&&(typeof onBoard!=='function'||onBoard(v))&&spiders.some(s=>Math.max(Math.abs(s.x-v.x),Math.abs(s.y-v.y))===1));
    if(girl&&(!isPlayer||u.kind==='spider')&&C.side==='g'){lastWarn=t;const dz=typeof CAST17!=='undefined'&&CAST17[girl.char]&&Math.random()<.6?CAST17[girl.char].danger:NEAR_SPIDER;const line=dz[Math.floor(Math.random()*dz.length)];setTimeout(()=>{filmCombatSub(CHAR[girl.char]?.name||'',line,'g');SND16.speak(girl.char,'g',line,'shock');},500);}
    else if(girl&&C.side==='r'&&isPlayer&&u.kind==='spider'){lastWarn=t;setTimeout(()=>{filmCombatSub('赤巢','她的胸口……就在眼前了。','r');SND16.play('overmind');},400);}
   }
  }catch(e){}
  return r;
 };
})();
