/* M8 offline sound stage. Music is licensed PeriTune material, not AI speech.
   No network requests, timer-driven combat changes, or musical autoplay before
   the first trusted user gesture. All channels are independently adjustable. */
const MUSIC_CATALOG={
 'cyberpunk-city':{title:'Cyberpunk_City',artist:'PeriTune',role:'主菜单 / 调查 / 赤巢',url:'https://peritune.com/blog/2020/05/22/cyberpunk_city/'},
 irregular:{title:'Irregular',artist:'PeriTune',role:'守护者交战 / 终章',url:'https://peritune.com/blog/2020/02/28/irregular/'}
};
const EchoAudio=(()=>{
 const storageKey='echo-neon-audio-v1',defaults={enabled:true,music:true,effects:true,musicVolume:.45,effectsVolume:.72};
 let settings={...defaults};
 try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved&&typeof saved==='object'){for(const k of ['enabled','music','effects'])if(typeof saved[k]==='boolean')settings[k]=saved[k];for(const k of ['musicVolume','effectsVolume'])if(typeof saved[k]==='number'&&Number.isFinite(saved[k]))settings[k]=Math.max(0,Math.min(1,saved[k]));}}catch(e){}
 let unlocked=false,graph=null,current=null,revision=0,pending=false,error='',effectCount=0,lastEffect='',duckUntil=0;
 const decoded=new Map(),loading=new Map(),positions={},retiring=new Set();
 function store(){try{localStorage.setItem(storageKey,JSON.stringify(settings));}catch(e){}}
 function ramp(param,value,seconds=.1){if(!graph)return;const t=graph.ctx.currentTime;if(param.cancelAndHoldAtTime)param.cancelAndHoldAtTime(t);else{const current=param.value;param.cancelScheduledValues(t);param.setValueAtTime(current,t);}if(value===0)param.linearRampToValueAtTime(0,t+Math.min(.25,Math.max(.02,seconds*2)));else param.setTargetAtTime(value,t,Math.max(.008,seconds));}
 function makeGraph(){
  if(graph)return graph;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw new Error('浏览器不支持 Web Audio');
  let ctx;try{ctx=new AC({latencyHint:'interactive',sampleRate:32000});}catch(e){ctx=new AC();}
  audioContext=ctx;
  const master=ctx.createGain(),music=ctx.createGain(),effects=ctx.createGain(),compressor=ctx.createDynamicsCompressor(),meter=ctx.createAnalyser();
  master.gain.value=0;music.gain.value=0;effects.gain.value=0;compressor.threshold.value=-10;compressor.knee.value=12;compressor.ratio.value=5;compressor.attack.value=.006;compressor.release.value=.18;meter.fftSize=512;
  music.connect(master);effects.connect(master);master.connect(compressor);compressor.connect(meter);meter.connect(ctx.destination);
  const noise=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.65),ctx.sampleRate),data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  graph={ctx,master,music,effects,compressor,meter,noise};ctx.addEventListener('statechange',renderUI);return graph;
 }
 function refreshMix(){
  soundEnabled=settings.enabled;
  if(graph){const scene=!$('cinema').hidden?.46:!$('modal').hidden?.72:1,duck=graph.ctx.currentTime<duckUntil?.48:1;
   ramp(graph.master.gain,settings.enabled&&!document.hidden?.78:0,.035);
   ramp(graph.music.gain,settings.music?settings.musicVolume*scene*duck:0,.14);
   ramp(graph.effects.gain,settings.effects?settings.effectsVolume:0,.018);
  }
  renderUI();
 }
 function desired(){if(!$('home').hidden||!$('cinema').hidden||S?.outcome)return'cyberpunk-city';return C?.side==='r'&&S?.mid!==4?'cyberpunk-city':'irregular';}
 async function buffer(id){
  if(decoded.has(id))return decoded.get(id);if(loading.has(id))return loading.get(id);
  const promise=(async()=>{const encoded=AUDIO[id];if(!encoded)throw new Error('缺少内嵌曲目');const bin=atob(encoded.slice(encoded.indexOf(',')+1)),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);const b=await graph.ctx.decodeAudioData(bytes.buffer);decoded.set(id,b);return b;})();
  loading.set(id,promise);try{return await promise;}finally{loading.delete(id);}
 }
 function retire(old){
  if(!old||!graph)return;const ctx=graph.ctx;positions[old.id]=(old.offset+ctx.currentTime-old.started)%old.buffer.duration;
  ramp(old.gain.gain,0,.16);retiring.add(old);
  old.source.onended=()=>{try{old.source.disconnect();old.gain.disconnect();}catch(e){}retiring.delete(old);};
  try{old.source.stop(ctx.currentTime+.72);}catch(e){retiring.delete(old);}
 }
 async function reconcile(){
  const ticket=++revision;refreshMix();if(!unlocked||!settings.enabled||!settings.music||document.hidden||!graph)return;
  const id=desired();if(current?.id===id){renderUI();return;}
  try{
   const b=await buffer(id);if(ticket!==revision||!unlocked||!settings.enabled||!settings.music||document.hidden||desired()!==id||graph?.ctx.state==='closed')return;
   const ctx=graph.ctx,source=ctx.createBufferSource(),gain=ctx.createGain(),offset=(positions[id]||0)%b.duration;
   source.buffer=b;source.loop=true;source.loopStart=0;source.loopEnd=b.duration;gain.gain.value=0;source.connect(gain);gain.connect(graph.music);
   const old=current;current={id,source,gain,buffer:b,offset,started:ctx.currentTime};source.start(0,offset);ramp(gain.gain,1,.18);retire(old);error='';renderUI();
  }catch(e){error='音频未能启动。请点击启声；若预览阻止声音，请下载HTML后用浏览器直接打开。';renderUI();}
 }
 function sync(){if(pending)return;pending=true;queueMicrotask(()=>{pending=false;void reconcile();});}
 async function unlock(){
  if(!settings.enabled)return;
  try{const g=makeGraph();unlocked=true;await g.ctx.resume();error='';refreshMix();sync();}catch(e){error='浏览器阻止音频。点击启声，或下载HTML独立打开。';renderUI();}
 }
 function set(key,value){if(!(key in defaults))return;settings[key]=typeof defaults[key]==='boolean'?!!value:Math.max(0,Math.min(1,Number(value)||0));store();refreshMix();if(settings.enabled)void unlock();sync();}
 function toggle(){set('enabled',!settings.enabled);if(settings.enabled)effect('select');}
 function tone(frequency,end,duration,volume,delay=0,type='triangle'){
  const {ctx,effects}=graph,t=ctx.currentTime+delay,osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type=type;osc.frequency.setValueAtTime(frequency,t);osc.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);
  gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
  osc.connect(gain);gain.connect(effects);osc.onended=()=>{osc.disconnect();gain.disconnect();};osc.start(t);osc.stop(t+duration+.025);
 }
 function noise(duration,volume,hz=1500,delay=0){
  const{ctx,effects}=graph,t=ctx.currentTime+delay,source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=graph.noise;filter.type='bandpass';filter.frequency.value=hz;filter.Q.value=.7;
  gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+.005);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
  source.connect(filter);filter.connect(gain);gain.connect(effects);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};source.start(t);source.stop(t+duration+.02);
 }
 function effect(type){
  if(!unlocked||!settings.enabled||!settings.effects||!graph||graph.ctx.state!=='running'||document.hidden)return;
  effectCount++;lastEffect=type;
  try{switch(type){
   case'select':tone(880,660,.075,.07);noise(.025,.05,4200);break;
   case'move':tone(155,65,.17,.11,0,'sine');noise(.11,.11,1800);tone(740,520,.08,.028,.04);break;
   case'wait':tone(390,275,.14,.09);noise(.04,.055,2800);break;
   case'commit':[350,525,700].forEach((f,i)=>tone(f,f,.16,.075,i*.075));break;
   case'hit':tone(118,32,.34,.29,0,'sine');noise(.24,.28,1450);tone(830,310,.22,.055,.025,'sawtooth');break;
   case'capture':tone(100,670,.64,.13,0,'sawtooth');tone(660,440,.32,.1,.2);tone(1174,880,.28,.08,.37);noise(.15,.11,2600,.48);break;
   case'alarm':[0,.34].forEach(t=>{tone(330,300,.25,.065,t,'square');tone(349,319,.25,.05,t);});break;
   case'victory':[523,659,784,1046].forEach((f,i)=>tone(f,f,.36,.11,i*.13));tone(523,523,.9,.055,.45);tone(784,784,.9,.045,.45);break;
   case'knock':[0,.18,.56].forEach((t,i)=>{tone(130,48,i===2?.22:.1,.13,t,'sine');noise(i===2?.15:.065,.1,850,t);});break;
   case'latch':noise(.12,.14,2300);tone(250,62,.24,.13,0,'sawtooth');break;
   case'pulse':tone(74,42,.5,.16,0,'sine');tone(148,84,.36,.035,.04);break;
   case'cut':noise(.075,.1,3700);tone(140,42,.15,.08);break;
   default:tone(420,300,.1,.055);
  }
  if(['capture','hit','alarm','victory'].includes(type)){duckUntil=graph.ctx.currentTime+.75;refreshMix();setTimeout(refreshMix,820);}
  }catch(e){error='音效通道暂不可用；战局仍可继续。';renderUI();}
 }
 function renderUI(){
  soundEnabled=settings.enabled;const available=settings.enabled&&(settings.music&&settings.musicVolume>0||settings.effects&&settings.effectsVolume>0);
  const button=$('audio-btn');if(button){button.innerHTML=svg(available?'sound':'mute');button.setAttribute('aria-pressed',String(settings.enabled));button.title=available?'静音（音乐与音效）':'启用音乐与音效';button.setAttribute('aria-label',button.title);}
  const film=$('film-sound');if(film){film.textContent=settings.enabled?'声音开启':'声音关闭';film.setAttribute('aria-pressed',String(settings.enabled));}
  let status=!settings.enabled?'已静音':!unlocked?'点击接入作战，启用音乐与音效':document.hidden?'页面在后台，声音已暂停':error||(!settings.music?'背景音乐已关闭':current&&graph?.ctx.state==='running'?`♫ ${MUSIC_CATALOG[current.id].title} · 循环`:'音频待启动 · 点击启声');
  if($('audio-live-status'))$('audio-live-status').textContent=status;
  if($('audio-status'))$('audio-status').textContent=status;
  for(const key of ['enabled','music','effects']){const input=$('audio-flag-'+key);if(input)input.checked=settings[key];}
  for(const key of ['musicVolume','effectsVolume']){const out=$('audio-value-'+key);if(out)out.textContent=Math.round(settings[key]*100)+'%';}
 }
 function state(){let rms=0;if(graph){const samples=new Float32Array(graph.meter.fftSize);graph.meter.getFloatTimeDomainData(samples);rms=Math.sqrt(samples.reduce((sum,n)=>sum+n*n,0)/samples.length);}return{...settings,unlocked,context:graph?.ctx.state||'not-created',track:current?.id||null,loop:current?.source.loop||false,duration:current?.buffer.duration||0,decoded:[...decoded.keys()],rms,effectCount,lastEffect,error,musicGain:graph?.music.gain.value||0,effectsGain:graph?.effects.gain.value||0,activeMusicSources:(current?1:0)+retiring.size,position:current&&graph?(current.offset+graph.ctx.currentTime-current.started)%current.buffer.duration:0};}
 function visibility(){if(!graph)return;if(document.hidden){ramp(graph.master.gain,0,.008);graph.ctx.suspend().catch(()=>{});}else if(unlocked&&settings.enabled){graph.ctx.resume().then(()=>{refreshMix();sync();}).catch(()=>renderUI());}renderUI();}
 function shutdown(){revision++;unlocked=false;if(graph){try{current?.source.stop();for(const item of retiring)item.source.stop();graph.ctx.close().catch(()=>{});}catch(e){}}current=null;retiring.clear();decoded.clear();loading.clear();graph=null;}
 return{unlock,sync,set,toggle,effect,state,renderUI,visibility,shutdown,get settings(){return{...settings};},get context(){return graph?.ctx||null;}};
})();

soundEnabled=EchoAudio.settings.enabled;
sfx=type=>EchoAudio.effect(type);
filmSound=type=>{if(type)EchoAudio.effect(type);};
stopFilmHum();startFilmHum=function(){};
soundContext=function(){return soundEnabled&&EchoAudio.settings.effects?EchoAudio.context:null;};
toggleAudio=function(){EchoAudio.toggle();};$('audio-btn').onclick=toggleAudio;
const soundSettingsButton=document.createElement('button');soundSettingsButton.id='audio-settings-btn';soundSettingsButton.className='icon-button';soundSettingsButton.textContent='♫';soundSettingsButton.title='背景音乐 / 音效 / 音量';soundSettingsButton.setAttribute('aria-label','音乐与音效设置');$('audio-btn').before(soundSettingsButton);
function showAudioSettings(){
 const set=EchoAudio.settings;
 openModal('音乐与音效','ECHO / SOUND STAGE',`<div class="audio-panel"><p class="manual-lead">两首完整循环 BGM，独立音乐与音效混音。<br>所有声音已内嵌，离线也能播放。</p><p id="audio-status" class="audio-status"></p><button class="button primary" data-audio-unlock>点击启声 / 试听</button><div class="audio-switches">${[['enabled','总声音'],['music','背景音乐'],['effects','动作与演出音效']].map(([key,label])=>`<label><span>${label}</span><input id="audio-flag-${key}" data-audio-flag="${key}" type="checkbox" ${set[key]?'checked':''}></label>`).join('')}</div>${[['musicVolume','音乐音量'],['effectsVolume','音效音量']].map(([key,label])=>`<label class="audio-slider"><span>${label}<output id="audio-value-${key}">${Math.round(set[key]*100)}%</output></span><input aria-label="${label}" data-audio-volume="${key}" type="range" min="0" max="100" step="1" value="${Math.round(set[key]*100)}"></label>`).join('')}<div class="audio-audition"><button class="button ghost" data-audio-cue="move">试听移动</button><button class="button ghost" data-audio-cue="hit">试听击杀</button><button class="button ghost" data-audio-cue="capture">试听寄生</button></div><div class="audio-credits"><span>MUSIC / LICENSED, NOT ORIGINAL COMPOSITION</span><p>Irregular · Cyberpunk_City — <b>PeriTune</b></p><p>Creative Commons Attribution 4.0 International。使用作者循环版本，转码为112 kbps MP3；未改写旋律。动作音效为本游戏的程序合成。</p><p><a href="https://peritune.com/blog/2020/02/28/irregular/" target="_blank" rel="noopener">Irregular 原页 ↗</a> · <a href="https://peritune.com/blog/2020/05/22/cyberpunk_city/" target="_blank" rel="noopener">Cyberpunk_City 原页 ↗</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0 ↗</a></p><small>首次真实点击后启用。切到后台自动暂停；设置不修改战役存档；若预览禁止本地存储，设置仅在本页生效。若沙盒预览禁止音频，请下载HTML独立打开。</small></div></div>`);
 EchoAudio.renderUI();EchoAudio.sync();
}
soundSettingsButton.onclick=showAudioSettings;
const filmMixerButton=document.createElement('button');filmMixerButton.id='film-mix';filmMixerButton.textContent='♫ 混音';filmMixerButton.title='调整背景音乐与音效';filmMixerButton.onclick=showAudioSettings;document.querySelector('.film-controls').append(filmMixerButton);
$('modal-content').addEventListener('input',e=>{if(e.target.dataset.audioVolume)EchoAudio.set(e.target.dataset.audioVolume,Number(e.target.value)/100);});
$('modal-content').addEventListener('change',e=>{if(e.target.dataset.audioFlag)EchoAudio.set(e.target.dataset.audioFlag,e.target.checked);});
$('modal-content').addEventListener('click',e=>{if(e.target.closest('[data-audio-unlock]')){EchoAudio.set('enabled',true);void EchoAudio.unlock();}const cue=e.target.closest('[data-audio-cue]');if(cue)EchoAudio.effect(cue.dataset.audioCue);if(e.target.closest('[data-open-audio]'))showAudioSettings();});
const audioSystemMenu=showSystemMenu;
showSystemMenu=function(){audioSystemMenu();$('modal-content').querySelector('.system-menu')?.insertAdjacentHTML('afterbegin','<button data-open-audio>音乐与音效<small>背景音乐、打击音效与独立音量；查看音乐署名与许可</small></button>');};$('menu-btn').onclick=showSystemMenu;
const audioHomeHint=document.createElement('p');audioHomeHint.className='audio-home-hint';audioHomeHint.id='audio-live-status';$('home').querySelector('.hero-buttons').after(audioHomeHint);
const audioRender=render;render=function(){audioRender();EchoAudio.sync();};
const audioFaction=selectFaction;selectFaction=function(side){audioFaction(side);EchoAudio.sync();};
const audioObserver=new MutationObserver(()=>EchoAudio.sync());for(const id of ['home','cinema','modal','result'])audioObserver.observe($(id),{attributes:true,attributeFilter:['hidden']});
function audioGesture(e){if(e.isTrusted&&EchoAudio.settings.enabled)void EchoAudio.unlock();}
document.addEventListener('pointerdown',audioGesture,{capture:true});document.addEventListener('keydown',audioGesture,{capture:true});document.addEventListener('visibilitychange',()=>EchoAudio.visibility());
window.addEventListener('pagehide',()=>EchoAudio.shutdown());EchoAudio.renderUI();
$('home').querySelector('.prototype-tag').textContent='NEON CUT · 0.7';
if(location.hash==='#qa')Object.assign(window.__MV_QA__,{audio(){return EchoAudio.state();},audioSettings(){showAudioSettings();},audioCue(type){EchoAudio.effect(type);},audioSet(key,value){EchoAudio.set(key,value);}});
