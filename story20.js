/* ===== M20 主线 · 人物线 / 信任 / 休整 / 失败也继续 / 多结局 =====
   Guardian side of the fixed campaign only (C.side==='g'); the hive side and fate mode are untouched.
   Layers on top of the existing chapter flow:
   - 休整 camp between chapters: the player can only talk to TWO girls; each talk is the next beat of
     her personal arc (P20). Grief / warnings / departures play first.
   - trust −3…+3 per girl, changed by camp talks and by chapter-end choices (someone always disagrees).
     trust ≥2 → she starts the battle at SYNC II. trust ≤−3 → she leaves the squad for good.
   - chapter-end choices rewritten as in-character arguments with a countdown.
   - losing a chapter can be accepted: the story continues with the consequences; losing the final
     battle is its own ending.
   - ending matrix (10 endings) + a Detroit-style epilogue roll for every girl you met. */
(function(){
 const qa=()=>location.hash==='#qa'||(typeof qaSilent!=='undefined'&&qaSilent);
 const G20=()=>typeof C!=='undefined'&&C&&C.side==='g'&&!(typeof S!=='undefined'&&S&&S.saga);
 const nm=id=>(CHAR[id]&&CHAR[id].name)||id;
 const R=a=>a[Math.floor(Math.random()*a.length)];
 const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function st(){if(!C.p20)C.p20={trust:{},arc:{},camps:0,lostCh:[],left:[],warned:[],pending:[],seenLoss:[],choices:[]};return C.p20;}
 const T=id=>st().trust[id]||0;
 const isG=id=>C.roster[id]&&C.roster[id].status==='active'&&C.roster[id].side==='g';
 const met=id=>C.roster[id]&&C.roster[id].introduced;
 const bonds=id=>(typeof BW_BOND!=='undefined'&&BW_BOND[id])||[];
 function arcFlag(id){const a=st().arc[id];return a&&a.flags.length?a.flags[a.flags.length-1]:null;}
 function arcDone(id){const a=st().arc[id];return !!a&&P20[id]&&a.beat>=P20[id].talks.length;}
 /* ---------- trust feedback (Detroit-style corner chips) ---------- */
 function chip(text,cls){let box=document.getElementById('trust20');if(!box){box=document.createElement('div');box.id='trust20';document.body.appendChild(box);}
  const c=document.createElement('div');c.className='t20 '+(cls||'');c.innerHTML=text;box.appendChild(c);setTimeout(()=>c.classList.add('out'),2900);setTimeout(()=>c.remove(),3500);}
 function trust(id,d,quiet){if(!d||!P20[id]||!met(id))return;const s=st();const before=T(id);s.trust[id]=Math.max(-3,Math.min(3,before+d));if(s.trust[id]===before)return;
  if(!quiet)chip(`<b>${esc(nm(id))}</b><span>${d>0?'信任 ▲':'信任 ▼'}</span>`,d>0?'up':'down');
  if(s.trust[id]>=2&&before<2&&!quiet)setTimeout(()=>chip(`<b>${esc(nm(id))}</b><span>愿意把同步上限交给你</span>`,'up'),700);}
 function remember(id,text){chip(`<b>${esc(nm(id))}</b><span>${esc(text||'会记住这件事')}</span>`,'mem');}
 /* ---------- talk film from a persona beat ---------- */
 function lineShot(l){const[who,text]=l;if(!who)return{mode:'narr',line:text};if(!isG(who))return null;return{who,side:'g',line:text};}
 function talkShots(id,done){
  const P=P20[id],s=st();const a=s.arc[id]=s.arc[id]||{beat:0,flags:[]};const beat=P.talks[a.beat];if(!beat){done&&done();return null;}
  let lines=beat.s;if(!Array.isArray(lines)){const prev=a.flags[a.flags.length-1];lines=lines[prev]||lines.x||Object.values(lines)[0];}
  const shots=[{bg:R(['film_cabin','film_corridor','station']),kb:'in',tint:'dark',stamp:`休整 · ${nm(id)} · 「${beat.t}」`,mode:'narr',line:'',auto:600}];
  shots[0].line=lines[0]&&!lines[0][0]?lines[0][1]:`${nm(id)}抬起头，看见了你。`;
  for(const l of (lines[0]&&!lines[0][0]?lines.slice(1):lines)){const x=lineShot(l);if(x)shots.push(x);}
  shots.push({who:id,side:'g',line:beat.q,choices:beat.o.map(o=>({label:o.l,detail:'',next:()=>{
   a.flags.push(o.f);a.beat++;trust(id,o.tr||0);for(const[k,v]of Object.entries(o.ot||{}))trust(k,v);
   if(o.tr===0)setTimeout(()=>remember(id),300);
   s.choices.push({who:id,t:beat.t,pick:o.l});
   const out=o.r.map(lineShot).filter(Boolean);
   if(a.beat>=P.talks.length)out.push({mode:'narr',stamp:`人物线 · ${nm(id)} · 完结`,line:`${nm(id)}把想说的话，都告诉你了。`,auto:2400});
   return out.length?out:[{mode:'narr',line:'……',auto:800}];
  }}))});
  return shots;
 }
 /* ---------- camp ---------- */
 function lossesSince(){const s=st();const out=[];for(const id of Object.keys(C.roster)){if(!met(id)||s.seenLoss.includes(id))continue;const r=C.roster[id];if(r.status==='destroyed'||r.side==='r'){out.push(id);}}return out;}
 function preShots(){
  const s=st(),shots=[];
  for(const p of s.pending.splice(0))if(p&&(!p.who||isG(p.who)))shots.push(p);
  for(const id of lossesSince()){s.seenLoss.push(id);const fr=bonds(id).find(isG)||Object.keys(P20).find(x=>isG(x)&&x!=='lyra'&&met(x));if(!fr||!P20[fr])continue;const k=Object.keys(C.roster).filter(x=>met(x)&&(C.roster[x].status==='destroyed'||C.roster[x].side==='r')).length+41;
   shots.push({bg:'film_cabin',kb:'in',tint:'dark',stamp:C.roster[id].side==='r'?`失联 · ${nm(id)}`:`阵亡 · ${nm(id)}`,mode:'narr',line:C.roster[id].side==='r'?`${nm(id)}的床位还铺着。没有人去动她的东西。`:`${nm(id)}的储物柜贴上了封条。`});
   shots.push({bg:'film_cabin',who:fr,side:'g',line:P20[fr].grief.replace(/\{n\}/g,nm(id)).replace(/\{k\}/g,String(k))});}
  for(const id of Object.keys(P20)){if(!isG(id)||!met(id)||id==='lyra')continue;const t=T(id);
   if(t<=-3){s.left.push(id);C.roster[id].status='retired';C.roster[id].left20=true;shots.push({bg:'film_corridor',kb:'out',tint:'dark',stamp:`离队 · ${nm(id)}`,who:id,side:'g',line:P20[id].leave});shots.push({mode:'narr',line:`${nm(id)}离开了小队。之后的战斗里，她不会再出现了。`,auto:2600});}
   else if(t<=-2&&!s.warned.includes(id)){s.warned.push(id);shots.push({bg:'film_cabin',kb:'in',tint:'dark',stamp:`休整 · ${nm(id)}`,who:id,side:'g',line:P20[id].warn});shots.push({mode:'narr',stamp:'⚠',line:`${nm(id)}对你的信任，快要见底了。`,auto:2400});}}
  return shots;
 }
 function idleText(id){const lost=bonds(id).find(b=>met(b)&&(C.roster[b].status==='destroyed'||C.roster[b].side==='r'));if(lost&&Math.random()<.7)return`${nm(id)}一直看着${nm(lost)}的空床位。`;return R(P20[id].idle);}
 function camp(done){
  const s=st();const idx=s.camps;const talks={left:2};
  const pre=preShots();
  const open=()=>{
   const pool=Object.keys(P20).filter(id=>isG(id)&&met(id));
   // some girls are on watch / repairing — a different set every camp
   let cards=pool;if(cards.length>6){const pri=cards.filter(id=>!arcDone(id)&&bonds(id).some(b=>s.seenLoss.includes(b)));const rest=cards.filter(id=>!pri.includes(id)).sort(()=>Math.random()-.5);cards=[...pri,...rest].slice(0,6);}
   const watch=pool.filter(id=>!cards.includes(id));
   const idle={};cards.forEach(id=>idle[id]=idleText(id));
   const draw=()=>{
    let el=document.getElementById('camp20');if(!el){el=document.createElement('div');el.id='camp20';document.body.appendChild(el);}
    const card=id=>{const a=s.arc[id]||{beat:0};const can=a.beat<P20[id].talks.length&&a.beat<=idx;const done=a.beat>=P20[id].talks.length;const talked=talks[id];const t=T(id);
     const pips=[-3,-2,-1,1,2,3].map(v=>`<i class="${v<0?(t<=v?'n on':'n'):(t>=v?'p on':'p')}"></i>`).join('');
     const status=talked?'刚刚聊过':done?'她已经把话说完了':!can?'她现在不想说话':talks.left<=0?'没有时间了':a.beat?`人物线 ${a.beat}/${P20[id].talks.length}`:'新的对话';
     return`<button type="button" class="c20 ${can&&!talked&&talks.left>0?'can':'no'} ${t>=2?'hi':t<=-2?'lo':''}" data-id="${id}"><img src="${ART[id]||''}" alt=""><div class="c20-body"><b>${esc(nm(id))}</b><small>${esc(P20[id].tag)}</small><p>${esc(idle[id])}</p><div class="c20-foot"><span class="pips">${pips}</span><em>${status}</em></div></div></button>`;};
    el.innerHTML=`<div class="c20-wrap"><header><small>INTERLUDE · 休整</small><h2>第 ${idx+1} 次休整</h2><p>舰内时间只够和 <b>${talks.left}</b> 个人好好说说话。剩下的人，要等下一次了——如果还有下一次。</p></header><div class="c20-grid">${cards.map(card).join('')}</div>${watch.length?`<div class="c20-watch">在值勤：${watch.map(id=>esc(nm(id))).join('、')}</div>`:''}<footer><button type="button" class="c20-go">${talks.left>0?'不聊了，出发':'出发 →'}</button></footer></div>`;
    el.hidden=false;document.body.classList.add('camp20-on');requestAnimationFrame(()=>el.classList.add('on'));
    el.querySelectorAll('.c20.can').forEach(b=>b.onclick=()=>{const id=b.dataset.id;talks[id]=1;talks.left--;el.classList.remove('on');el.hidden=true;document.body.classList.remove('camp20-on');try{sfx('commit');}catch(e){}
     const sh=talkShots(id);if(!sh){draw();return;}FILM.play(sh,()=>{persist();draw();},{chapter:`休整 · ${nm(id)}`});});
    el.querySelector('.c20-go').onclick=()=>{el.classList.remove('on');el.hidden=true;document.body.classList.remove('camp20-on');s.camps++;persist();try{sfx('commit');}catch(e){}done();};
   };
   draw();
  };
  if(pre.length)FILM.play(pre,open,{chapter:'休整'});else open();
 }
 /* ---------- battle effects of trust ---------- */
 const _mk=makeMission;makeMission=function(id){const s=_mk.apply(this,arguments);try{if(G20()&&C.p20){const hi=[];for(const u of s.units)if(u.char&&u.side==='g'&&T(u.char)>=2){if(u.xp<2){u.xp=2;hi.push(nm(u.char));}}if(hi.length)setTimeout(()=>{try{radio('信任',`${hi.join('、')}把同步上限交给了你——开局即为 SYNC II。`);}catch(e){}},400);}}catch(e){console.error(e);}return s;};
 /* ---------- camp between chapters ---------- */
 const _next=nextMission;nextMission=function(){if(!G20()||qa()||!P20)return _next.apply(this,arguments);try{hideStory();}catch(e){}const self=this,args=arguments;camp(()=>_next.apply(self,args));};
 /* ---------- chapter-end choices as arguments ---------- */
 function pend(shot){st().pending.push(shot);}
 function argue(lines,q,who,opts,timer){
  const shots=lines.filter(Boolean);
  shots.push({who,side:'g',line:q,timer:timer||0,timeout:0,choices:opts.map(o=>({label:o.l,detail:o.d||'',action:()=>{try{for(const[k,v]of Object.entries(o.t||{}))trust(k,v);if(o.p)o.p.forEach(pend);st().choices.push({t:q,pick:o.l});}catch(e){console.error(e);}o.a();}}))});
  FILM.play(shots,()=>{},{chapter:'抉择'});
 }
 const g=(id,line,extra)=>isG(id)?{who:id,side:'g',line,...(extra||{})}:null;
 const pick=(ids)=>ids.find(isG);
 const _adv=advanceMission;
 advanceMission=function(){
  if(!G20()||qa()||!S?.outcome?.won||S.subOp)return _adv.apply(this,arguments);
  const mid=S.mid;
  if(mid===0&&!C.route){$('result').hidden=true;
   const lead=pick(['iris','lyra','kuro'])||'lyra';
   argue([{bg:'film_corridor',kb:'in',tint:'dark',stamp:'A-01 接驳甲板 · 战后',mode:'narr',line:'甲板安静下来了。安静得能听见每个人的呼吸。'},
     g('iris','两个信号～温室环那边，苍鹭小队五分钟前还在喊救命。外环天桥上，白隼的信标……一个小时没动过了。'),
     g('akira','温室！弥砂在那边！那家伙连枪都拿不稳，没人护着她会死的！'),
     g('lark','……天桥上有方舟的密钥。如果赤巢先拿到它，就没有人能回家了。'),
     g('kuro','……下面。暗渠。……能绕。'),
     g('lyra','两边都等不起。指挥官，你来定。')],
    '往哪里走？',lead,[
     {l:'去温室。苍鹭还在喊',d:'先救人',t:{akira:1,lark:-1},p:[g('akira','好！我就知道你会选这边！'),g('lark','……嗯。希望天桥上的人，还撑得住。')],a:()=>{C.route='garden';C.order=[0,1,2,3,4];nextMission();}},
     {l:'去天桥。密钥不能丢',d:'先保住回家的路',t:{lark:1,akira:-1},p:[g('akira','……啧。你最好是对的。弥砂要是出了事，我砍你。'),g('lark','谢谢你……信我一次。')],a:()=>{C.route='bridge';C.order=[0,2,1,3,4];nextMission();}},
     {l:'走暗渠，绕到它背后',d:'玄羽带路，冒险奇袭',t:{kuro:1,lyra:-1},p:[g('lyra','……绕路。好。但如果出了岔子，我们两边都救不了。')],a:()=>{C.route='bridge';C.order=[0,2,1,3,4];launchSubOperation('op-3-x');}},
     {l:'先清干净气闸，别留尾巴',d:'稳扎稳打',t:{sola:1,akira:-1},p:[g('sola','哼哼，本小姐最喜欢打扫了！')],a:()=>{C.route='garden';C.order=[0,1,2,3,4];launchSubOperation('op-1-2');}}],15);
   return;}
  if(mid===1&&!C.flags.gardenBranchDone){C.flags.gardenBranchDone=true;$('result').hidden=true;
   argue([{bg:'film_garden',kb:'in',stamp:'B-04 生态冷却环 · 战后',mode:'narr',line:'孵化池的总阀关上了。冷却环的灯，一盏一盏变回了蓝色。'},
     g('misa','那、那个……底层培养槽里，我找到了抗蚀血清。只有两支。'),
     g('sera','留给伤员。下一个被扑中的人，也许能因为它多撑几秒——够我们把她拖回来。'),
     g('misa','可、可是如果现在就给前线打上，她们就不会被扑中了啊！'),
     g('nyx','失礼了。底层还有一窝母本没有清干净。如果不去，它们会一直跟着我们。')],
    '血清怎么用？',pick(['misa','sera','lyra'])||'lyra',[
     {l:'给前线打上（零音、弥砂）',d:'两人立即 SYNC II',t:{misa:1,sera:-1},p:[g('sera','……好。那我就祈祷，不会有人需要它。')],a:()=>{if(C.roster.lyra)C.roster.lyra.xp=Math.max(2,C.roster.lyra.xp||0);if(C.roster.misa)C.roster.misa.xp=Math.max(2,C.roster.misa.xp||0);nextMission();}},
     {l:'留给伤员',d:'白栖保管',t:{sera:1,misa:-1},p:[g('misa','……嗯。白栖说得对。我、我只是想快点结束这一切。')],a:()=>{C.flags.serum20='kept';nextMission();}},
     {l:'下去，清掉母本',d:'进入 B-06 培养槽深渊',t:{nyx:1,celia:1},p:[g('nyx','失礼了。我会做得很干净。')],a:()=>launchSubOperation('op-2-2')}],12);
   return;}
  if(mid===2&&!C.flags.bridgeBranchDone){C.flags.bridgeBranchDone=true;$('result').hidden=true;
   argue([{bg:'film_bridge',kb:'in',stamp:'轨道输送桥 · 战后',mode:'narr',line:'桥面不再下沉了。脚下四百公里，地球在缓缓转动。'},
     g('astra','方舟的火控阵列还能用。接进机体，命中率提高 31.00%。'),
     g('vega','远处那座炮台还在瞄着我们。不拆掉，下次过桥的时候，挨打的是走在最后的人。'),
     g('june','猎物就在那儿诶～不去追吗？')],
    '怎么办？',pick(['astra','vega','lyra'])||'lyra',[
     {l:'把火控接进机体',d:'星枢、苍澜立即 SYNC II',t:{astra:1,vega:-1},p:[g('vega','……好。那我站在最后面。')],a:()=>{if(C.roster.astra)C.roster.astra.xp=Math.max(2,C.roster.astra.xp||0);if(C.roster.vega)C.roster.vega.xp=Math.max(2,C.roster.vega.xp||0);nextMission();}},
     {l:'去拆掉那座炮台',d:'进入 C-09 远星炮台阵',t:{vega:1,june:1,astra:-1},p:[g('june','嘿嘿～狩猎时间！')],a:()=>launchSubOperation('op-3-2')},
     {l:'不停留，直接走',d:'保持编队完整',t:{lyra:1},p:[],a:()=>nextMission()}],12);
   return;}
  if(mid===3&&C.flags.mercy===null){$('result').hidden=true;
   argue([{bg:'film_mirror',kb:'in',tint:'cold',stamp:'D-00 人格镜像库',mode:'narr',line:'三千个人格备份在冷光里排成长廊。朔夜站在最深处，背对着所有人。'},
     {who:'noct',side:C.roster.noct&&C.roster.noct.side==='r'?'r':'g',line:'镜像电源连着赤巢的心脏。也连着我。'},
     {who:'noct',side:C.roster.noct&&C.roster.noct.side==='r'?'r':'g',line:'留着它，我能把赤巢的核心坐标完整破译出来。切断它，赤巢的孵化会慢下来——而我会熄灭。'},
     g('nyx','失礼了。……她在等你说话。'),
     {mode:'narr',line:'没有倒计时。只有她的目光。'}],
    '你选哪一个？','noct',[
     {l:'留着电源。也留着你',d:'朔夜参加终局',t:{noct:2,echo:1},p:[{who:'noct',side:'g',line:'……了解。我会让这个决定，值得。'}],a:()=>{C.flags.mercy=true;C.roster.noct.xp=Math.max(2,C.roster.noct.xp);nextMission();}},
     {l:'切断电源',d:'赤巢孵化变慢，朔夜离线',t:{iris:-1,ruby:1},p:[g('ruby','本官认为，这是正确的判决。……即使它很残忍。')],a:()=>{C.flags.mercy=false;C.roster.noct.status='retired';nextMission();}},
     {l:'先去她的私人实验室',d:'取回黑匣子，再决定',t:{noct:1},p:[],a:()=>{C.flags.mercy=true;C.roster.noct.xp=Math.max(2,C.roster.noct.xp);launchSubOperation('op-4-3');}}],0);
   return;}
  return _adv.apply(this,arguments);
 };
 /* ---------- losing continues the story ---------- */
 const LOSS_LINE={0:'接驳甲板没能守住。赤巢的信使带着什么东西，钻进了更深的地方。',1:'温室没能守住。冷却环的灯，一盏一盏变成了红色。',2:'天桥没能守住。桥面在她们身后断成了两截。',3:'镜像库没能守住。朔夜最后看了她们一眼，然后熄灭了。'};
 const _sr=showResult;
 showResult=function(){const r=_sr.apply(this,arguments);try{if(G20()&&!qa()&&S&&S.outcome&&!S.outcome.won&&!S.subOp&&S.mid<=4&&!S.quest?.endingSeen){const box=document.querySelector('#result-content .result-buttons');if(box&&!box.querySelector('.accept20')){const b=document.createElement('button');b.className='button primary accept20';b.textContent=S.mid===4?'接受这个结局':'接受失败 · 让故事继续';b.onclick=accept;box.prepend(b);const p=document.createElement('p');p.className='accept20-note';p.textContent=S.mid===4?'这一战决定一切。接受它，你会看到另一个结局。':'失败不会终结故事。损失会被带进下一章——她们会记得这一天。';box.parentNode.insertBefore(p,box);}}}catch(e){console.error(e);}return r;};
 function accept(){
  const s=st(),mid=S.mid;s.lostCh.push(mid);$('result').hidden=true;
  C.history.push({mid,step:C.step,round:S.round,score:0,grade:'—',extra:0,totalExtra:0,live:S.units.filter(u=>u.char&&!u.dead&&u.side==='g').length,events:[...new Set(S.events||[])].slice(-7),lost:S.units.filter(u=>u.char&&u.dead).map(u=>u.char),escape:[],lostBattle:true});
  if(mid===4){C.finished=true;C.flags.fall20=true;persist();FILM.play(endingShots('fall'),()=>{showHome();},{chapter:'终章'});return;}
  if(mid===1){C.flags.sampleOwner=C.flags.sampleOwner||'r';C.flags.gardenBranchDone=true;}
  if(mid===2)C.flags.bridgeBranchDone=true;
  if(mid===3){C.flags.mercy=false;if(C.roster.noct&&C.roster.noct.status==='active'&&C.roster.noct.side==='g')C.roster.noct.status='retired';}
  const sp=Object.keys(P20).filter(id=>isG(id)&&met(id));const who=R(sp.length?sp:['lyra']);
  pend({bg:'film_cabin',kb:'in',tint:'red',stamp:'战败之后',mode:'narr',line:LOSS_LINE[mid]||'她们输了。'});
  if(P20[who])pend({who,side:'g',line:P20[who].fail});
  const comfort=sp.find(id=>id!==who&&bonds(who).includes(id));if(comfort)pend({who:comfort,side:'g',line:R(['……还活着。还活着就还能打。','别这样。我们还在。','下一次。下一次，我们一起。'])});
  S.outcome.won=true;S.outcome.accepted=true;persist();advanceMission();
 }
 // chapter intros remember a lost chapter
 if(typeof filmIntro==='function'){const _fi=filmIntro;filmIntro=function(mid){const shots=_fi.apply(this,arguments)||[];try{if(G20()&&C.p20&&C.step>0){const prev=C.order[C.step-1];if(C.p20.lostCh.includes(prev)){const at=Math.min(1,shots.length);shots.splice(at,0,{bg:'film_cabin',kb:'in',tint:'dark',stamp:'前情',mode:'narr',line:LOSS_LINE[prev]+'所有人都知道，这一章会更难。'});}}}catch(e){}return shots;};}
 /* ---------- endings ---------- */
 const ENDINGS={
  dawn:{title:'全员归港',code:'ENDING · 01',lines:s=>[{bg:'film_orbit',kb:'out',mode:'narr',line:'返航舰的舱室里，座位一个都没有空。'},g('akira','十二个杯子！一个都不少！我就说吧！'),g('lyra','……今天，名单上没有新的名字。'),{mode:'narr',line:'那天晚上，零音没有翻开笔记本。她睡得很沉。'}]},
  sacrifice:{title:'第四十二行',code:'ENDING · 02',lines:s=>[{bg:'film_core',kb:'push',tint:'red',fx:'alert',mode:'narr',line:'自毁程序需要有人在核心里手动按住。三十秒。'},{who:'lyra',side:'g',line:'全员撤离。这是命令。'},g(pick(['akira','iris','vega','celia'].filter(x=>x!=='lyra')),'队长——！'),{who:'lyra',side:'g',line:'笔记本在指挥官那里。第四十二行……就麻烦你了。'},{black:true,mode:'sys',line:'—— 核心信号 · 消失 ——',sfx:'cut'},{bg:'film_orbit',kb:'out',mode:'narr',line:'你在第四十二行写下了她的名字。字迹不太工整。你想，她会原谅你的。'}]},
  coexist:{title:'最后一行注释',code:'ENDING · 03',lines:s=>[{bg:'film_core',kb:'in',tint:'cold',mode:'narr',line:'内核没有碎。它只是……停了下来。'},{who:'noct',side:'g',line:'“// 让它们学会停下来。”……它读懂了。'},{who:'overmind',line:'……安静。原来，这就是安静的感觉。'},g('iris','它……在写一首新的诗。～'),{bg:'film_orbit',kb:'out',mode:'narr',line:'天穹空间站成了第一座人类与机器共同看守的轨道站。所有的红灯，都变成了蓝色。'}]},
  nameless:{title:'无名的指挥官',code:'ENDING · 04',lines:s=>{const lead=pick(['akira','iris','vega','celia','misa','sola','astra'])||'';return[{bg:'film_orbit',kb:'out',mode:'narr',line:'零音没能看到这一天。'},lead?{who:lead,side:'g',line:'我替她把命令下完了。……可是我不知道，她会不会满意。'}:null,{mode:'narr',line:'那本笔记本被留在了指挥席上。后来，每个活下来的人，都在上面写了一行字。'}];}},
  scatter:{title:'散场',code:'ENDING · 05',lines:s=>[{bg:'film_orbit',kb:'out',tint:'dark',mode:'narr',line:'赤巢被摧毁了。可返航舰上，空了很多座位——不是因为死亡。'},{mode:'narr',line:`${s.left.map(nm).join('、')}，在某一天离开了队伍。没有人知道她们去了哪里。`},g('lyra','我们赢了。……可这支队伍，已经不在了。')]},
  lone:{title:'孤星',code:'ENDING · 06',lines:s=>{const a=Object.keys(P20).filter(id=>isG(id)&&met(id));return[{bg:'film_orbit',kb:'out',tint:'dark',mode:'narr',line:'返航舰很大。大得让人害怕。'},{mode:'narr',line:`活着回来的，只有${a.map(nm).join('和')||'你'}。`},a[0]?{who:a[0],side:'g',line:'……我们去把她们的东西，一件一件带回家吧。'}:null];}},
  ash:{title:'余烬',code:'ENDING · 07',lines:s=>[{bg:'film_orbit',kb:'out',tint:'dark',mode:'narr',line:'赤巢的心脏停止了跳动。代价，是很多很多名字。'},g(pick(['lyra','akira','celia']),`${s.lost.slice(0,5).map(nm).join('、')}……我们会把她们带回去。每一个。`),{mode:'narr',line:'返航舰点亮引擎的时候，没有人欢呼。'}]},
  tea:{title:'十二个杯子',code:'ENDING · 08',lines:s=>[{bg:'film_orbit',kb:'out',mode:'narr',line:'地球。一间只有十二个座位的茶馆。'},g('akira','坐坐坐！杯子都给你们摆好了！'),g('sola','本小姐要甜的那个！'),{mode:'narr',line:'有几个杯子是空的。可是每一个都倒满了茶。'}]},
  echo:{title:'回声',code:'ENDING · 09',lines:s=>[{bg:'film_orbit',kb:'out',mode:'narr',line:'天穹空间站在轨道上静静旋转。所有的红灯，同时熄灭了。'},g(pick(['lyra','akira','iris']),'回家吧。'),{mode:'narr',line:'她们回去了。带着活着的人，也带着那些名字。'}]},
  fall:{title:'赤色黎明',code:'ENDING · 10',lines:s=>[{bg:'film_core',kb:'in',tint:'red',fx:'alert',mode:'narr',line:'内核没有碎。碎掉的，是她们最后的阵线。'},{who:'overmind',line:'辛苦了，小守护者们。你们已经很努力了。'},{who:'overmind',line:'现在——欢迎回家。'},{bg:'film_orbit',kb:'in',tint:'red',mode:'narr',line:'那天夜里，地球上的人们抬起头，看见了一场红色的流星雨。'}]}
 };
 function computeEnding(){
  const s=st();const ids=Object.keys(P20).filter(met);
  const lost=ids.filter(id=>C.roster[id].status==='destroyed'||C.roster[id].side==='r');
  const left=ids.filter(id=>C.roster[id].left20);const alive=ids.filter(isG);
  const avg=alive.length?alive.reduce((a,id)=>a+T(id),0)/alive.length:0;
  const info={lost,left,alive,avg};
  let k='echo';
  if(isG('lyra')&&arcFlag('lyra')==='sacrifice')k='sacrifice';
  else if(isG('noct')&&(arcFlag('noct')==='rewrite'||(C.flags.mercy&&arcFlag('iris')==='dive')))k='coexist';
  else if(!isG('lyra'))k='nameless';
  else if(left.length>=3)k='scatter';
  else if(!lost.length&&!left.length&&!s.lostCh.length)k='dawn';
  else if(alive.length<=2)k='lone';
  else if(lost.length>=4)k='ash';
  else if(avg>=1&&isG('akira'))k='tea';
  return{k,info};
 }
 function epiShots(sacrificed){
  const ids=['lyra',...Object.keys(P20).filter(id=>id!=='lyra')].filter(met);const out=[];
  for(const id of ids){const r=C.roster[id],E=P20[id].epi;let key,label;
   if(r.left20){key='left';label='离队';}else if(r.status==='destroyed'){key='dead';label='阵亡';}else if(r.side==='r'){key='taken';label='归巢';}else if(r.status==='retired'){key='x';label='离线';}
   else{const fl=(st().arc[id]||{flags:[]}).flags.slice().reverse().find(f=>E[f]);key=fl||'x';label='归还';}
   if(id==='lyra'&&sacrificed){key='sacrifice';label='阵亡';}
   const text=E[key]||E.x;if(!text||text==='——')continue;
   out.push({bg:out.length?undefined:'film_orbit',kb:'out',who:id,side:key==='taken'?'r':'g',name:`${nm(id)} · ${label}`,line:text,auto:4300});}
  return out;
 }
 function endingShots(force){
  const{k,info}=force?{k:force,info:{lost:[],left:[],alive:[]}}:computeEnding();const E=ENDINGS[k];
  const s=[];
  if(k!=='fall'){s.push({bg:'film_core',kb:'push',fx:'flash shake',sfx:'hit',stamp:'Ω-00 母巢核心',mode:'narr',line:'内核碎裂的声音很轻。像一颗心脏，终于停了下来。'});}
  s.push(...E.lines(info));
  if(k!=='fall'&&C.flags.disclosure){s.push(C.flags.disclosure==='open'?{mode:'narr',line:'全部记录被发回了地球——包括她们犯下的错。七十二小时后，所有自我复制工厂停机审查。'}:{mode:'narr',line:'档案被列为最高机密。没有人知道，第七座工厂的地下，还有一条生产线在安静地运转。'});}
  s.push({title:{k:E.code,m:E.title,s:'她们的结局'},hold:3000,sfx:k==='fall'?'alarm':'victory'});
  s.push(...epiShots(k==='sacrifice'));
  s.push({black:true,mode:'narr',line:`你在这一局里，做了 ${st().choices.length} 个选择。换一种选法，她们会走向不同的地方。`,auto:4200});
  const out=s.filter(Boolean);out.film=true;C.flags.ending20=k;return out;
 }
 const _ef=echoEndingFrames;echoEndingFrames=function(){if(G20()&&C.p20)return endingShots();return _ef.apply(this,arguments);};
 const _ei=echoEndingInfo;echoEndingInfo=function(){const base=_ei.apply(this,arguments);if(G20()&&C.p20&&C.flags.ending20){const E=ENDINGS[C.flags.ending20];if(E)return{...base,title:E.title,subtitle:E.code+' · '+base.subtitle};}return base;};
 if(typeof endingInfo!=='undefined')try{endingInfo=echoEndingInfo;}catch(e){}
 // make sure every new guardian campaign has the persona layer
 const _nc=newCampaign;newCampaign=function(side){const r=_nc.apply(this,arguments);try{if(C&&C.side==='g')st();}catch(e){}return r;};
 if(location.hash==='#filmtest'&&window.__MV_FILM__)Object.assign(window.__MV_FILM__,{p20:()=>C.p20,camp:()=>camp(()=>{window.__campDone=1;}),talk:id=>FILM.play(talkShots(id),()=>{window.__talkDone=1;}),trust:(id,d)=>trust(id,d),ending:k=>FILM.play(endingShots(k),()=>{window.__endDone=1;}),endingAuto:()=>{const e=computeEnding();return e.k;},advance:()=>advanceMission(),accept:()=>accept(),win:()=>resolveBattle(true,'（测试）目标达成'),lose:()=>resolveBattle(false,'（测试）失败'),state20:()=>({mid:S&&S.mid,step:C.step,route:C.route,film:FILM.active,camp:!document.getElementById('camp20')?.hidden&&!!document.getElementById('camp20'),result:!$('result').hidden,trust:C.p20&&C.p20.trust,arc:C.p20&&C.p20.arc,camps:C.p20&&C.p20.camps})});
})();
