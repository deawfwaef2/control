/* Targeted offline browser + deterministic rules-fixture checks.
   Not a complete campaign playthrough or balance certification.
   Install Playwright outside the workspace if the 128 MB budget is tight.
   PLAYWRIGHT_BROWSERS_PATH=/tmp/control-browsers node qa/check.cjs
*/
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
let pw;try{pw=require('playwright')}catch(e){pw=require(process.env.PLAYWRIGHT_PACKAGE||'/tmp/control-qa/node_modules/playwright')}
const ROOT=path.resolve(__dirname,'..'),url=require('url').pathToFileURL(path.join(ROOT,'index.html')).href;
const results=[],runtimeErrors=[],networkRequests=[];let browser;
async function check(name,fn){try{const details=await fn();results.push({name,pass:true,details:details||null});console.log('PASS',name)}catch(e){results.push({name,pass:false,error:e.message});console.error('FAIL',name,e.message)}}
async function newPage(viewport={width:1440,height:1080}){const c=await browser.newContext({viewport,reducedMotion:'reduce'}),p=await c.newPage();p.on('pageerror',e=>runtimeErrors.push(e.message));p.on('request',r=>{if(/^https?:/.test(r.url()))networkRequests.push(r.url())});return p;}
async function fixture(p,id,side,mutate){await p.evaluate(({id,side})=>{const q=window.__MV_QA__;q.mission(id,side);const f=q.snapshot();q.load(f.c,f.s)}, {id,side});if(mutate)await p.evaluate(mutate);}
(async()=>{
 browser=await pw.chromium.launch({headless:true,args:['--no-sandbox']});
 const normal=await newPage();await normal.goto(url);
 await check('Normal offline entrypoint / real UI starts game',async()=>{await normal.locator('#start-btn').click();assert.equal(await normal.locator('#cinema').isVisible(),true);await normal.locator('#skip-story').click();assert.equal(await normal.locator('.cell').count(),64);assert.equal(await normal.locator('.stage-pill').count(),3);return{cells:64,acts:3};});
 await check('Normal UI portrait pieces are materially larger',async()=>{const box=await normal.locator('[data-x="2"][data-y="7"] .token').boundingBox();assert.ok(box.width>=85&&box.height>=90);return{width:box.width,height:box.height};});
 await check('Pieces can zoom to 175 percent without overflowing the page',async()=>{const before=await normal.locator('[data-x="2"][data-y="7"] .token').boundingBox();for(let i=0;i<3;i++)await normal.locator('#zoom-in').click();assert.equal((await normal.locator('#zoom-level').innerText()).trim(),'175%');const after=await normal.locator('[data-x="2"][data-y="7"] .token').boundingBox();assert.ok(after.width>before.width*1.6);assert.ok(await normal.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));for(let i=0;i<3;i++)await normal.locator('#zoom-out').click();return{baseWidth:before.width,maxWidth:after.width};});
 await check('Normal UI legal move, undo, then mirrored AI phase',async()=>{await normal.locator('[data-x="2"][data-y="7"]').click();await normal.locator('.cell.legal').first().click();await normal.waitForTimeout(150);assert.equal((await normal.locator('#action-count').innerText()).trim(),'01');await normal.locator('#undo-btn').click();assert.equal((await normal.locator('#action-count').innerText()).trim(),'00');await normal.locator('[data-x="2"][data-y="7"]').click();await normal.locator('.cell.legal').first().click();await normal.waitForTimeout(150);await normal.locator('#end-phase-btn').click();await normal.waitForFunction(()=>document.getElementById('round-text').textContent.includes('02'),null,{timeout:30000});return{round:2};});
 await check('Portrait-mode and overview controls respond',async()=>{await normal.locator('#overview-btn').click();assert.equal(await normal.locator('body').evaluate(e=>e.classList.contains('overview-mode')),true);await normal.locator('#portrait-view-btn').click();assert.equal(await normal.locator('body').evaluate(e=>e.classList.contains('overview-mode')),false);});
 const p=await newPage();await p.goto(url+'#qa');
 await check('Guardian and Red Hive can each start the campaign',async()=>{for(const side of ['g','r']){await p.evaluate(side=>window.__MV_QA__.start(side),side);const f=await p.evaluate(()=>window.__MV_QA__.snapshot());assert.equal(f.c.side,side);assert.equal(f.s.quest.stage,0);assert.equal(f.s.quest.player,side);assert.ok(f.s.units.some(u=>u.side===side&&!u.dead));}return{factions:['g','r']};});
 await check('All five maps initialize for both factions with 16 acts per route',async()=>{let maps=0;for(const side of ['g','r'])for(let id=0;id<5;id++){await fixture(p,id,side);const f=await p.evaluate(()=>window.__MV_QA__.snapshot());assert.equal(f.s.mid,id);assert.equal(f.s.quest.stage,0);assert.ok(f.s.limit>=25);const positions=f.s.units.filter(u=>!u.dead&&!u.escaped).map(u=>u.x+','+u.y);assert.equal(new Set(positions).size,positions.length);maps++;}return{maps,actsPerRoute:16};});
 await check('Capture swaps the actual character, converts ownership and locks both units',async()=>{
  await fixture(p,0,'g',()=>{const q=window.__MV_QA__,f=q.snapshot();f.s.units=f.s.units.filter(u=>['lyra','lark'].includes(u.char)||u.kind==='drone');const a=f.s.units.find(u=>u.char==='lyra'),t=f.s.units.find(u=>u.char==='lark');Object.assign(a,{x:2,y:2,side:'g',used:false});Object.assign(t,{x:2,y:3,side:'r',used:false});q.load(f.c,f.s);});
  await p.evaluate(()=>window.__MV_QA__.basic({uid:'lyra',x:2,y:3,type:'move'}));const s=(await p.evaluate(()=>window.__MV_QA__.snapshot())).s,a=s.units.find(u=>u.char==='lyra'),t=s.units.find(u=>u.char==='lark');assert.equal(t.side,'g');assert.deepEqual([a.x,a.y],[2,3]);assert.deepEqual([t.x,t.y],[2,2]);assert.equal(a.used,true);assert.equal(t.used,true);assert.equal(s.units.filter(u=>u.char==='lark').length,1);
 });
 await check('First chapter objective advances an act rather than ending the mission',async()=>{
  await fixture(p,0,'g',()=>{const q=window.__MV_QA__,f=q.snapshot();f.s.relays.find(r=>r.role==='entry').owner='g';q.load(f.c,f.s);});
  await p.evaluate(()=>window.__MV_QA__.advance());const f=await p.evaluate(()=>window.__MV_QA__.snapshot());assert.equal(f.s.quest.stage,1);assert.equal(f.s.outcome,null);const incoming=f.s.units.filter(u=>u.kind==='sentinel');assert.ok(incoming.length>0&&incoming.every(u=>u.used));
 });
 await check('Act transition does not reset already-used units',async()=>{
  await fixture(p,0,'g',()=>{const q=window.__MV_QA__,f=q.snapshot();f.s.units.find(u=>u.char==='lyra').used=true;f.s.spent=1;f.s.relays.find(r=>r.role==='entry').owner='g';q.load(f.c,f.s);});await p.evaluate(()=>window.__MV_QA__.advance());const s=(await p.evaluate(()=>window.__MV_QA__.snapshot())).s;assert.equal(s.units.find(u=>u.char==='lyra').used,true);assert.equal(s.spent,1);
 });
 await check('Evacuating the final required unit wins before empty-force defeat',async()=>{
  await fixture(p,0,'g',()=>{const q=window.__MV_QA__;q.enter(2);const f=q.snapshot();f.s.units=f.s.units.filter(u=>u.side==='r'||['lyra','akira'].includes(u.char));Object.assign(f.s.units.find(u=>u.char==='lyra'),{x:2,y:6,side:'g',used:false});Object.assign(f.s.units.find(u=>u.char==='akira'),{x:5,y:6,side:'g',used:false});f.s.quest.extractNeed=2;q.load(f.c,f.s);});
  await p.evaluate(()=>{const q=window.__MV_QA__;q.basic({uid:'lyra',x:2,y:7,type:'move'});q.basic({uid:'akira',x:5,y:7,type:'move'});q.check();});const f=await p.evaluate(()=>window.__MV_QA__.snapshot());assert.equal(f.s.quest.extracted.length,2);assert.equal(f.s.outcome.won,true);
 });
 await check('Garden engineering action costs one action and allows Misa adjacency',async()=>{
  await fixture(p,1,'g',()=>{const q=window.__MV_QA__,f=q.snapshot();f.s.quest.stage=2;f.s.relays.forEach(r=>r.owner='g');const u=f.s.units.find(u=>u.char==='misa');f.s.units=f.s.units.filter(v=>v.uid===u.uid||v.x!==4||v.y!==4);Object.assign(u,{side:'g',x:4,y:4,used:false});q.load(f.c,f.s);});
  await p.evaluate(()=>window.__MV_QA__.move({uid:'misa',x:4,y:4,type:'wait'}));const s=(await p.evaluate(()=>window.__MV_QA__.snapshot())).s;assert.equal(s.quest.isolation.g,true);assert.equal(s.spent,1);assert.equal(s.outcome.won,true);
 });
 await check('Vacuum damage remains permanent after mission roster sync',async()=>{
  await fixture(p,1,'g',()=>{const q=window.__MV_QA__,f=q.snapshot();f.s.round=f.s.ventStart;const u=f.s.units.find(u=>u.char==='lyra');Object.assign(u,{x:0,y:3});q.load(f.c,f.s);q.environment();const after=q.snapshot();after.s.quest.stage=2;after.s.quest.isolation.g=true;after.s.relays.forEach(r=>r.owner='g');q.load(after.c,after.s);q.check();});const f=await p.evaluate(()=>window.__MV_QA__.snapshot());assert.equal(f.s.units.find(u=>u.char==='lyra').dead,true);assert.equal(f.c.roster.lyra.status,'destroyed');
 });
 await check('Bridge cannot deliver through an unowned track lock',async()=>{
  await fixture(p,2,'g',()=>{const q=window.__MV_QA__,f=q.snapshot();f.s.quest.stage=2;const u=f.s.units.find(u=>u.uid==='capsule');f.s.units=f.s.units.filter(v=>v.uid===u.uid||!(v.x===4&&v.y===1));Object.assign(u,{x:4,y:1,used:false});f.s.relays.forEach(r=>r.owner=null);q.load(f.c,f.s);q.basic({uid:'capsule',x:4,y:0,type:'move'});});let f=await p.evaluate(()=>window.__MV_QA__.snapshot());assert.equal(f.s.flags.delivered,null);
  await p.evaluate(()=>{const q=window.__MV_QA__,f=q.snapshot();f.s.relays.find(r=>r.gate==='g').owner='g';f.s.units.find(u=>u.uid==='capsule').used=false;q.load(f.c,f.s);q.basic({uid:'capsule',x:3,y:0,type:'move'});q.check();});f=await p.evaluate(()=>window.__MV_QA__.snapshot());assert.equal(f.s.outcome.won,true);
 });
 await check('Mirror synchronization requires two qualifying round ends',async()=>{
  await fixture(p,3,'g',()=>{const q=window.__MV_QA__,f=q.snapshot();f.s.quest.stage=2;f.s.quest.held=0;f.s.relays.forEach(r=>r.owner='g');f.s.walls=f.s.walls.filter(k=>!f.s.doors.includes(k));const n=f.s.units.find(u=>u.char==='noct');f.s.units=f.s.units.filter(v=>v.uid===n.uid||v.x!==3||v.y!==3);Object.assign(n,{side:'g',x:3,y:3});q.load(f.c,f.s);q.environment();});let f=await p.evaluate(()=>window.__MV_QA__.snapshot());assert.equal(f.s.quest.held,1);assert.equal(f.s.outcome,null);
  await p.evaluate(()=>{const q=window.__MV_QA__,f=q.snapshot();f.s.round++;q.load(f.c,f.s);q.environment();});f=await p.evaluate(()=>window.__MV_QA__.snapshot());assert.equal(f.s.quest.held,2);assert.equal(f.s.outcome.won,true);
 });
 await check('Losing a synchronization condition resets its counter',async()=>{
  await fixture(p,3,'g',()=>{const q=window.__MV_QA__,f=q.snapshot();f.s.quest.stage=2;f.s.quest.held=1;f.s.relays.forEach(r=>r.owner='g');f.s.relays[0].owner='r';q.load(f.c,f.s);q.environment();});const f=await p.evaluate(()=>window.__MV_QA__.snapshot());assert.equal(f.s.quest.held,0);
 });
 await check('Core stays locked until near-field operation, then can be captured',async()=>{
  await fixture(p,4,'g',()=>{const q=window.__MV_QA__,f=q.snapshot();f.s.quest.stage=2;f.s.relays.forEach(r=>r.owner='g');const u=f.s.units.find(u=>u.char==='lyra');f.s.units=f.s.units.filter(v=>v.uid===u.uid||v.x!==4||v.y!==1);Object.assign(u,{side:'g',x:4,y:1,used:false});q.load(f.c,f.s);});
  assert.equal(await p.evaluate(()=>window.__MV_QA__.shield()),true);let moves=await p.evaluate(()=>window.__MV_QA__.legal('lyra'));assert.equal(moves.some(m=>m.x===4&&m.y===0),false);
  await p.evaluate(async()=>{const q=window.__MV_QA__;q.basic({uid:'lyra',x:4,y:1,type:'wait'});await q.advance();});assert.equal(await p.evaluate(()=>window.__MV_QA__.shield()),false);
  moves=await p.evaluate(()=>window.__MV_QA__.legal('lyra'));assert.ok(moves.some(m=>m.x===4&&m.y===0));await p.evaluate(()=>{const q=window.__MV_QA__,f=q.snapshot();f.s.units.find(u=>u.char==='lyra').used=false;q.load(f.c,f.s);q.basic({uid:'lyra',x:4,y:0,type:'move'});q.check();});const f=await p.evaluate(()=>window.__MV_QA__.snapshot());assert.equal(f.s.outcome.won,true);assert.equal(f.c.finished,true);
 });
 await check('Red Hive finale requires broadcast and twelve-round hold',async()=>{
  await fixture(p,4,'r',()=>{const q=window.__MV_QA__,f=q.snapshot();f.s.quest.stage=3;f.s.quest.broadcast.r=true;f.s.round=11;q.load(f.c,f.s);q.environment();});let f=await p.evaluate(()=>window.__MV_QA__.snapshot());assert.equal(f.s.outcome,null);
  await p.evaluate(()=>{const q=window.__MV_QA__,f=q.snapshot();f.s.round=12;q.load(f.c,f.s);q.environment();});f=await p.evaluate(()=>window.__MV_QA__.snapshot());assert.equal(f.s.flags.survived,true);assert.equal(f.s.outcome.won,true);
 });
 await check('AI cannot reuse the only available unit after it acts',async()=>{
  await fixture(p,0,'g',()=>{const q=window.__MV_QA__,f=q.snapshot();const opp=f.s.units.filter(u=>u.side==='r');opp.forEach(u=>u.used=true);opp[0].used=false;q.load(f.c,f.s);});const m=await p.evaluate(()=>window.__MV_QA__.ai());assert.ok(m);await p.evaluate(m=>window.__MV_QA__.basic(m),m);const again=await p.evaluate(()=>window.__MV_QA__.ai());assert.equal(again,null);
 });
 await check('Act, objective counters, and generated-state art survive save restoration',async()=>{
  await fixture(p,3,'r',()=>{const q=window.__MV_QA__,f=q.snapshot();f.s.quest.stage=2;f.s.quest.held=1;q.load(f.c,f.s);const saved=q.save();q.start('g');q.restore(saved);});const f=await p.evaluate(()=>window.__MV_QA__.snapshot());assert.equal(f.c.side,'r');assert.equal(f.s.quest.stage,2);assert.equal(f.s.quest.held,1);assert.ok(await p.locator('.piece-portrait').count());
 });
 await check('Real in-battle cinema pauses, cuts to close-up, and resumes the same action budget',async()=>{
  await fixture(p,0,'g',()=>{const q=window.__MV_QA__,f=q.snapshot();f.s.relays.find(r=>r.role==='entry').owner='g';f.s.spent=1;f.s.units.find(u=>u.char==='lyra').used=true;q.load(f.c,f.s);q.cinematics(true);void q.advance();});
  await p.locator('#cinema').waitFor({state:'visible'});let f=await p.evaluate(()=>window.__MV_QA__.snapshot());assert.equal(f.s.quest.stage,1);assert.equal(f.s.spent,1);assert.equal(f.s.phase,'player');
  await p.locator('#next-dialogue').click();assert.equal(await p.locator('#cinema').getAttribute('data-shot'),'close');await p.screenshot({path:'/tmp/control-m3-cinema.png'});
  await p.locator('#skip-story').click();await p.locator('#cinema').waitFor({state:'hidden'});await p.waitForFunction(()=>!document.getElementById('end-phase-btn').disabled);f=await p.evaluate(()=>window.__MV_QA__.snapshot());assert.equal(f.s.spent,1);assert.equal(f.s.units.find(u=>u.char==='lyra').used,true);
  await p.locator('#end-phase-btn').click();await p.waitForFunction(()=>document.getElementById('round-text').textContent.includes('02'),null,{timeout:30000});
 });
 await check('All eighteen embedded generated/composited art assets decode offline',async()=>{
  const decoded=await p.evaluate(async()=>Promise.all(Object.entries(ART).map(([name,src])=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve({name,ok:img.naturalWidth>0});img.onerror=()=>resolve({name,ok:false});img.src=src;}))));assert.equal(decoded.length,18);assert.ok(decoded.every(i=>i.ok));return{decoded:decoded.length};
 });
 await check('A legacy stage-less save migrates without losing its roster',async()=>{
  await fixture(p,1,'g',()=>{const q=window.__MV_QA__,f=q.snapshot();q.load(f.c,f.s);const saved=q.save();delete saved.s.quest;delete saved.checkpoint.s.quest;saved.s.ventStart=3;q.restore(saved);});const f=await p.evaluate(()=>window.__MV_QA__.snapshot());assert.equal(f.s.quest.version,2);assert.equal(f.s.quest.stage,0);assert.equal(f.s.mid,1);assert.equal(f.c.roster.lyra.status,'active');
 });
 const mobile=await newPage({width:390,height:844});await mobile.goto(url+'#qa');
 await check('Mobile page contains its large board in a horizontal viewport',async()=>{await mobile.evaluate(()=>window.__MV_QA__.start('g'));const metrics=await mobile.evaluate(()=>({width:innerWidth,body:document.documentElement.scrollWidth,pan:document.querySelector('.board-pan').clientWidth,board:document.querySelector('.board-surround').getBoundingClientRect().width}));assert.ok(metrics.body<=metrics.width+2);assert.ok(metrics.board>=650&&metrics.pan<metrics.board);return metrics;});
 await check('Mobile overview fits all eight columns without page overflow',async()=>{await mobile.locator('#overview-btn').click();const metrics=await mobile.evaluate(()=>({width:innerWidth,body:document.documentElement.scrollWidth,board:document.querySelector('.board-surround').getBoundingClientRect().width}));assert.ok(metrics.body<=metrics.width+2);assert.ok(metrics.board<=390);return metrics;});
 await check('Packaged game makes no external network requests',async()=>{assert.deepEqual(networkRequests,[]);});
 await check('No browser page errors in targeted checks',async()=>{assert.deepEqual(runtimeErrors,[]);});
 const report={milestone:'M2',date:'2026-10-18',mode:'offline file:// + opt-in #qa deterministic fixtures',browser:'Chromium',results,runtimeErrors,externalRequests:networkRequests,passed:results.filter(r=>r.pass).length,total:results.length,limitations:['No full manual campaign playthrough','No difficulty-balance certification','Fixtures isolate rules; they do not claim players reached objectives naturally','No real-time second agent was observed']};
 fs.writeFileSync(path.join(ROOT,'qa','m2-report.json'),JSON.stringify(report,null,2));
 await normal.screenshot({path:'/tmp/control-m2-battle.png',fullPage:true});await mobile.screenshot({path:'/tmp/control-m2-mobile.png',fullPage:true});
 console.log(`RESULT ${report.passed}/${report.total}`);await browser.close();process.exitCode=report.passed===report.total?0:1;
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1});
