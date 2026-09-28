const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const runtime=fs.readFileSync(path.resolve(__dirname,'../runtime.js'),'utf8');
function harness(){
 let now=0,serial=0,cancelled=0,next=0,current=true;
 const timers=new Map(),events={};
 const ctx=vm.createContext({console,IPA_EFFECT_MAPS:{},performance:{now:()=>now},document:{hidden:false,querySelectorAll:()=>[],querySelector:()=>null,addEventListener:(type,fn)=>events[type]=fn},window:{addEventListener(){},speechSynthesis:{cancel(){cancelled++;}}},
  setTimeout(fn,ms){const id=++serial;timers.set(id,{fn,at:now+ms});return id;},clearTimeout:id=>timers.delete(id)});
 vm.runInContext(runtime,ctx);
 const valid=()=>current;
 function advance(ms){const end=now+ms;let n=0;for(;;){const first=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!first)break;assert(++n<10000,'Timer loop');now=first[1].at;timers.delete(first[0]);first[1].fn();}now=end;}
 function request(){const run=ctx.ipaEffectRequest({term:'photographic',ipa:'ˌfoʊtəˈɡræfɪk'},valid),u={rate:.88,lang:'en-US'};ctx.ipaEffectAttach(u,run);return {run,u};}
 return {ctx,timers,events,advance,request,valid,gate:()=>ctx.ipaEffectAdvance(()=>next++,valid),invalidate:()=>current=false,get next(){return next;},get cancelled(){return cancelled;}};
}
{
 const h=harness(),{u}=h.request();u.onstart();h.advance(1500);h.gate();assert.equal(h.next,0,'Active speech should hold the auto timer');h.advance(350);u.onend();h.advance(80);assert.equal(h.next,1,'Completed speech releases auto advance');h.advance(10000);assert.equal(h.next,1,'No duplicate automatic advance');
}
{
 const h=harness();h.request();h.advance(1500);h.gate();h.advance(1100);assert.equal(h.next,1,'Missing start event must not trap a card');assert(h.cancelled>0,'Cancel speech that never started before advancing');
}
{
 const h=harness(),{u}=h.request();u.onstart();h.advance(1500);h.gate();h.advance(6500);assert.equal(h.next,1,'Missing end event must not trap a card');
}
{
 const h=harness(),{u}=h.request();u.onstart();h.advance(1500);h.gate();u.onerror();h.advance(80);assert.equal(h.next,1,'Audio error releases pending auto advance');
}
{
 const h=harness(),{u}=h.request();u.onstart();h.advance(1500);h.gate();h.ctx.ipaEffectCancel();h.advance(80);assert.equal(h.next,1,'Muting/cancelling speech after the normal reveal deadline must still advance automatically');
}
{
 const h=harness(),first=h.request();first.u.onstart();h.advance(1500);h.gate();const replay=h.request();replay.u.onstart();h.advance(500);assert.equal(h.next,0,'Replay should keep a pending automatic advance waiting for its own end');first.u.onend();h.advance(80);assert.equal(h.next,0,'Old end must not release the replay');replay.u.onend();h.advance(80);assert.equal(h.next,1,'Replay must not discard the previously pending automatic advance');
}
{
 const h=harness(),first=h.request();first.u.onstart();h.advance(1500);h.gate();for(let i=0;i<20&&!h.next;i++){h.advance(700);if(!h.next)h.request().u.onstart();}assert.equal(h.next,1,'Repeated replay cannot extend an already due automatic advance indefinitely');
}
{
 const h=harness(),{u}=h.request();u.onstart();h.advance(1500);h.gate();h.invalidate();h.ctx.ipaEffectCancel();h.advance(10000);assert.equal(h.next,0,'Manual next or exit invalidates the old automatic callback');
}
{
 const h=harness();h.gate();assert.equal(h.next,1,'No audio run retains the original automatic advance');
}
{
 const h=harness(),{u}=h.request();u.onstart();h.advance(1500);h.gate();h.ctx.document.hidden=true;h.events.visibilitychange();h.advance(80);assert.equal(h.next,1,'Hidden/cancelled visual cannot hold automatic progression forever');
}
console.log('PASS: auto-advance waits for speech, bounds missing events, survives mute/replay, ignores stale events, and preserves manual navigation.');
