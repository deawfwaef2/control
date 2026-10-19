/* ===== M17-3 STATE-AWARE CHAPTER OPENINGS =====
   Each chapter opening now changes with who is alive, who was taken by the hive and who was destroyed.
   Inserted after the establishing shot of every chapter (except chapter 1). */
const MEM17={lyra:'那份她总是随身带着的阵亡名单',akira:'桌上那只空着的马克杯',lark:'那首没唱完的地球老歌',iris:'频道里残留的薄荷糖嘎嘣声',misa:'工具箱里拧到一半的螺丝',veil:'瞄准镜上她留下的呼吸雾',noct:'设计图角落里的签名',sera:'没用完的那卷绷带',vega:'盾上新添的那道划痕',ruby:'没写完的判决书',june:'她刻在枪托上的猎物计数',psalm:'那段少了一个声部的和声',kuro:'影子里空出来的位置',sola:'说好的那顿烤肉',celia:'那串断掉的念珠',nyx:'叠得整整齐齐的手套',astra:'计算板上停住的数字',echo:'走廊里不再回响的声音'};
function recap17(mid){
 const out=[];if(!C||mid<1)return out;
 const nm=id=>CHAR[id]?.name||id;
 const t17=(C.flags&&C.flags.taken17)||[];
 const lost=[...new Set([...filmLost(),...t17])].filter(id=>CHAR[id]&&(t17.includes(id)||!filmAlive(id)||CHAR[id].origin!=='r'));
 const taken=lost.filter(id=>filmSide(id)==='r'&&filmAlive(id));
 const gone=lost.filter(id=>!filmAlive(id));
 const pick=a=>a[Math.floor(Math.random()*a.length)];
 const bondOf=id=>((typeof BW_BOND!=='undefined'&&BW_BOND[id])||[]);
 const voiceFor=(id)=>filmPick([...bondOf(id),'lyra','akira','iris','celia','vega','sera'],'g');
 if(C.side==='g'){
  if(!lost.length){
   const a=filmAlive('akira')&&filmSide('akira')==='g';
   out.push(a?{who:'akira',side:'g',line:'报数——……一个都没少。马克杯，也一个都没少。'}:G('lyra','全员在列。保持下去。'));
   const l=filmPick(['lyra','celia','vega'],'g');if(l&&a)out.push({who:l,side:'g',line:l==='lyra'?'……别得意。下一层只会更难。':'别松懈。我们把运气用在了上一层。'});
   return out.filter(Boolean);
  }
  for(const id of [...lost].reverse().slice(0,2)){
   const isTaken=taken.includes(id);
   out.push({mode:'narr',stamp:isTaken?`失联 · ${nm(id)} · 信号频段：赤巢`:`阵亡 · ${nm(id)}`,line:isTaken?`${MEM17[id]||'她的东西'}还在。可${nm(id)}的信号，已经变成了红色。`:`${MEM17[id]||'她的东西'}，留在了上一层甲板。`});
   const f=voiceFor(id);
   if(f){
    out.push({who:f,side:'g',line:pick(CAST17[f]?.lost||['……'])});
    if(isTaken)out.push({who:f,side:'g',line:pick([`如果在这一层遇见${nm(id)}——我会叫她的名字。叫到她想起来为止。`,`${nm(id)}要是挡在前面……我不知道我能不能开枪。`,`她不是敌人。她只是……还没被我们接回来。`])});
   }
  }
  if(taken.length){const l=filmPick(['lyra','celia','vega','astra'],'g');if(l)out.push({who:l,side:'g',line:`听好：被赤蛛扎进胸口的人，回不来了。遇见${taken.map(nm).join('、')}，把她当成敌人——这是命令，也是她们最后的愿望。`});}
  else if(gone.length>=2){const l=filmPick(['lyra','celia','sera'],'g');if(l)out.push({who:l,side:'g',line:'我们已经少了太多人。从这一层开始，谁都不许再冒险。'});}
  return out.filter(Boolean);
 }
 // hive campaign: the overmind admires its collection
 if(taken.length){
  out.push({who:'overmind',line:`我的孩子又多了：${taken.map(nm).join('、')}。她们醒来时，第一句话都是"欢迎回家"。`});
  const t=taken[taken.length-1];out.push({who:t,side:'r',line:pick(CAST17[t]?.bw||['……欢迎回家。'])});
 }
 if(gone.length)out.push({who:'overmind',line:`${nm(gone[gone.length-1])}碎了。可惜——她本可以成为我最美的孩子。`});
 return out;
}
(function(){
 if(typeof filmIntro!=='function')return;
 const base=filmIntro;
 filmIntro=function(mid){
  const shots=base.apply(this,arguments)||[];
  let extra=[];try{extra=recap17(mid);}catch(e){console.error(e);}
  if(!extra.length)return shots;
  // after title + establishing shot
  const at=Math.min(2,shots.length);
  return [...shots.slice(0,at),...extra,...shots.slice(at)];
 };
})();
if(location.hash==='#filmtest')Object.assign(window.__MV_FILM__,{recap:(mid,setup)=>{if(setup)setup(C);return JSON.stringify(filmIntro(mid).slice(0,12).map(s=>s&&(s.who||s.mode||'')+':'+(s.line||s.stamp||'')));},roster:()=>C.roster,play:(sh)=>FILM.play(sh,()=>{})});
