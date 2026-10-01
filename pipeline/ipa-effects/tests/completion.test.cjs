'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const runtime=fs.readFileSync(path.resolve(__dirname,'../runtime.js'),'utf8');
const {align}=require('../alignment.cjs');
const info={term:'photographic',ipa:'ˌfoʊtəˈɡræfɪk',speech:'photographic'};
const mapped=align(info.term,info.ipa);
assert.equal(mapped.mode,'aligned');
const maps={[info.term+'\t'+info.ipa]:mapped.parts.map(p=>[p.start,p.end,p.ipa,p.silent?3:p.stress?1:p.secondary?2:0,p.beat,p.weight])};
function harness(){
  let now=0,serial=0,next=0,current=true;const timers=new Map();
  function element(){
    const el={style:{},children:[],className:'',textContent:'',innerHTML:'',getBoundingClientRect:()=>({left:0,top:0}),setAttribute(){},appendChild(x){this.children.push(x);},remove(){this.removed=true;}};
    el.classList={contains:x=>el.className.split(' ').includes(x),add(...xs){el.className=[...new Set([...el.className.split(' ').filter(Boolean),...xs])].join(' ');},remove(...xs){el.className=el.className.split(' ').filter(x=>!xs.includes(x)).join(' ');}};
    Object.defineProperty(el,'offsetWidth',{get(){return Math.max(1,(el.textContent||el.innerHTML.replace(/<[^>]+>/g,'')).length)*7;}});
    return el;
  }
  const slots=[...info.term].map((letter,i)=>Object.assign(element(),{letter,getBoundingClientRect:()=>({left:30+i*24,right:54+i*24,top:100,bottom:130,height:30})}));
  const ctx=vm.createContext({IPA_EFFECT_MAPS:maps,performance:{now:()=>now},window:{innerWidth:390,addEventListener(){},speechSynthesis:{cancel(){}}},document:{hidden:false,addEventListener(){},querySelector:()=>null,querySelectorAll:()=>slots,createElement:element,body:{appendChild(){}}},getComputedStyle:e=>({fontSize:e.style.fontSize||'25px'}),setTimeout(fn,ms){const id=++serial;timers.set(id,{fn,at:now+ms});return id;},clearTimeout:id=>timers.delete(id)});
  vm.runInContext(runtime,ctx);
  function advance(ms){const end=now+ms;for(let count=0;;count++){assert(count<10000,'Timer loop');const first=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!first)break;now=first[1].at;timers.delete(first[0]);first[1].fn();}now=end;}
  const valid=()=>current;
  function start(overrides={}){const run=ctx.ipaEffectRequest({...info,...overrides},valid),u={rate:.88,lang:'en-US'};ctx.ipaEffectAttach(u,run);u.onstart();return {run,u};}
  return {ctx,slots,start,advance,gate:()=>ctx.ipaEffectAdvance(()=>next++,valid),invalidate:()=>current=false,get now(){return now;},get next(){return next;}};
}
const pending=run=>run.nodes.filter(n=>!n.part.silent&&!n.el.classList.contains('lit'));
const finishing=run=>run.nodes.every(n=>n.el.classList.contains('finishing'));
function fullyShown(h,run){assert.equal(pending(run).length,0,'All supplied IPA segments must appear');assert(h.slots.every(s=>s.classList.contains('ipa-under')||s.classList.contains('ipa-silent')),'Every spelling slot must be accounted for');}

// First pronunciation: real TTS can end before the final estimated syllable.
{
  const h=harness(),{run,u}=h.start();h.advance(850);
  assert.equal(run.timing.duration,1680);assert.equal(pending(run).length,1);
  h.gate();u.onend();fullyShown(h,run);assert(!finishing(run));
  h.advance(179);assert.equal(h.next,0,'Keep missing IPA visible before auto-advance');assert(!finishing(run));
  h.advance(1);assert.equal(h.next,1);assert(finishing(run),'Use the original fade after the short completion hold');
  h.advance(249);assert(run.layer);h.advance(1);assert.equal(run.layer,null);
}
// Slow TTS: no extra hold when the estimated sequence already completed.
{
  const h=harness(),{run,u}=h.start();h.advance(2100);fullyShown(h,run);
  h.gate();u.onend();assert(finishing(run));assert(!run.visualUntil);
  h.advance(60);assert.equal(h.next,1);h.advance(190);assert.equal(run.layer,null);
}
// Cached slow timing followed by faster replays still needs completion until
// the existing short cache adapts. The fix must not require that adaptation.
{
  const h=harness(),estimates=[],unfinished=[];
  for(const actual of [1800,850,850,850]){
    const {run,u}=h.start();estimates.push(run.timing.duration);h.advance(actual);
    unfinished.push(pending(run).length);u.onend();fullyShown(h,run);h.advance(500);
  }
  assert.deepEqual(estimates,[1680,1800,1325,850]);
  assert.deepEqual(unfinished,[0,1,1,0]);
}
// Whole-IPA fallback displays everything on start and keeps its old end timing.
{
  const h=harness(),{run,u}=h.start({forceWhole:true});assert(run.nodes[0].whole);fullyShown(h,run);
  h.advance(300);h.gate();u.onend();assert(finishing(run));assert(!run.visualUntil);
  h.advance(60);assert.equal(h.next,1);h.advance(190);assert.equal(run.layer,null);
}
// Errors must not manufacture a completion flash or hold an overdue next card.
{
  const h=harness(),{run,u}=h.start();h.advance(850);assert(pending(run).length);
  h.gate();u.onerror();assert.equal(run.layer,null);assert(!run.visualUntil);
  h.advance(60);assert.equal(h.next,1);h.advance(1000);assert.equal(run.layer,null);
}
// Manual navigation during the completion hold cancels its delayed fade too.
{
  const h=harness(),{run,u}=h.start();h.advance(850);h.gate();u.onend();fullyShown(h,run);
  h.advance(80);h.invalidate();h.ctx.ipaEffectCancel();assert.equal(run.layer,null);
  h.advance(1000);assert.equal(h.next,0);assert(h.slots.every(s=>!s.classList.contains('ipa-under')));
}
// Replaying during a completion hold removes the old display and timers; a
// stale end event must not finish the new pronunciation or release its gate.
{
  const h=harness(),old=h.start();h.advance(850);h.gate();old.u.onend();h.advance(80);
  const fresh=h.start();assert.equal(old.run.layer,null);old.u.onend();
  h.advance(100);assert(!fresh.run.finished);assert(fresh.run.layer);assert.equal(h.next,0);
  h.advance(750);fresh.u.onend();fullyShown(h,fresh.run);h.advance(240);assert.equal(h.next,1);
}
console.log('PASS IPA completion: early first speech, changing replay timing, 180 ms completion hold, unchanged slow/whole/error timing, and manual/replay cancellation.');
