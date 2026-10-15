'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const audioRuntime=fs.readFileSync(path.join(__dirname,'runtime.js'),'utf8');
const ipaRuntime=fs.readFileSync(path.join(__dirname,'../ipa-effects/runtime.js'),'utf8');
const noun={term:'record',ipa:'ˈrɛkɚd'},verb={term:'record',ipa:'rɪˈkɔrd'};
function harness(options={}){
  let now=1000,serial=0,valid=true,fallbacks=0,next=0,speechCancels=0;
  const timers=new Map(),audios=[],events={};
  class FakeAudio{
    constructor(){if(options.constructorThrows)throw Error('constructor');this.src='';this.duration=NaN;this.ended=false;this.playCount=0;this.pauseCount=0;this.loadCount=0;audios.push(this);}
    play(){this.playCount++;if(options.playThrows)throw Error('play');return new Promise((resolve,reject)=>{this.resolve=resolve;this.reject=reject;});}
    pause(){this.pauseCount++;this.onpause?.();}
    load(){this.loadCount++;}
    removeAttribute(name){if(name==='src')this.src='';}
    emit(name){if(name==='ended')this.ended=true;this['on'+name]?.();}
  }
  const ctx=vm.createContext({console,PRONUNCIATION_AUDIO_MAP:{[noun.term+'\t'+noun.ipa]:{src:'assets/pronunciation/record-n.mp3',duration:.8},[verb.term+'\t'+verb.ipa]:{src:'assets/pronunciation/record-v.mp3',duration:1.1}},IPA_EFFECT_MAPS:{},
    performance:{now:()=>now},window:{Audio:options.noAudio?undefined:FakeAudio,addEventListener(){},speechSynthesis:{cancel(){speechCancels++;}}},
    document:{hidden:false,addEventListener:(n,f)=>events[n]=f,querySelector:()=>null,querySelectorAll:()=>[]},
    setTimeout(fn,ms){const id=++serial;timers.set(id,{fn,at:now+ms});return id;},clearTimeout:id=>timers.delete(id)});
  vm.runInContext(audioRuntime+'\n'+ipaRuntime,ctx);
  function advance(ms){const end=now+ms;for(let n=0;;n++){assert(n<10000,'timer loop');const t=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!t)break;now=t[1].at;timers.delete(t[0]);t[1].fn();}now=end;}
  const current=()=>valid;
  function play(info=noun,{noRun=false,fallback}={}){const run=noRun?null:ctx.ipaEffectRequest(info,current);const selected=ctx.exceptionAudioPlay(info,run,current,fallback||(()=>{fallbacks++;if(run)ctx.ipaEffectFinish(run,true);}));return {run,selected,audio:audios.at(-1)};}
  return {ctx,audios,timers,events,advance,play,current,invalidate(){valid=false;},gate(){ctx.ipaEffectAdvance(()=>next++,current);},get next(){return next;},get fallbacks(){return fallbacks;},get speechCancels(){return speechCancels;}};
}
async function main(){
  {
    const h=harness();assert.equal(h.audios.length,0,'No eager media construction');
    assert(h.ctx.exceptionAudioEntry(noun));assert(h.ctx.exceptionAudioEntry(verb));
    assert.equal(h.ctx.exceptionAudioEntry({term:'Record',ipa:noun.ipa}),null,'Exact spelling');
    assert.equal(h.ctx.exceptionAudioEntry({term:'record',ipa:'wrong'}),null,'Exact sense IPA');
    assert.equal(h.play({term:'cat',ipa:'kæt'}).selected,false);assert.equal(h.audios.length,0,'Ordinary TTS word makes no request');
    assert.equal(harness({noAudio:true}).play().selected,false,'Unsupported Audio falls through');
  }
  {
    const h=harness();h.ctx.exceptionAudioPreload(noun);assert.equal(h.audios.length,1);assert.equal(h.audios[0].playCount,0);
    h.ctx.exceptionAudioPreload(noun);assert.equal(h.audios.length,1,'One warm object for current card');
    const a=h.play();assert.equal(h.audios.length,1,'Playback reuses preload');assert.equal(a.audio.playCount,1);
    assert.equal(a.run.started,null,'play() alone does not start IPA');a.audio.duration=.72;a.audio.emit('playing');
    assert.equal(a.run.timing.duration,720,'Media duration drives estimated visual span');assert(a.run.timing.recorded);
    a.audio.emit('playing');h.advance(500);h.gate();assert.equal(h.next,0);a.audio.emit('ended');h.advance(60);
    assert.equal(h.next,1);assert.equal(h.fallbacks,0);assert.equal(h.ctx.ipaEffectTiming({...a.run,map:{parts:[]}}, {rate:.88,lang:'en-US'}).recorded,undefined);
    assert.equal(vm.runInContext('ipaEffectDurations.size+ipaEffectVoices.size',h.ctx),0,'Recording cannot calibrate native TTS');
  }
  {
    const h=harness();h.ctx.exceptionAudioPreload(noun);const old=h.audios[0];h.ctx.exceptionAudioPreload(verb);
    assert.equal(old.src,'');assert(old.pauseCount);assert.equal(h.audios.length,2);assert.equal(h.audios[1].playCount,0);
    h.ctx.exceptionAudioPreload({term:'cat',ipa:'kæt'});assert.equal(h.audios[1].src,'','Ordinary next card releases warm clip');
  }
  for(const kind of ['error','reject','load-timeout','play-throws','constructor-throws']){
    const h=harness({playThrows:kind==='play-throws',constructorThrows:kind==='constructor-throws'});const a=h.play();assert(a.selected);
    if(kind==='error')a.audio.emit('error');
    if(kind==='reject'){a.audio.reject(Error('NotAllowedError'));await Promise.resolve();await Promise.resolve();}
    if(kind==='load-timeout')h.advance(1800);
    a.audio?.emit('error');h.advance(10000);assert.equal(h.fallbacks,1,kind+' must fall back once');
    assert(a.run.finished,kind+' failed fallback run must release gate');
  }
  {
    const h=harness();let fallbackRun;
    const a=h.play(noun,{fallback:()=>{fallbackRun=a.run;assert.equal(a.run.started,null);assert(!a.run.finished);a.run.info={...noun,speech:'a record',forceWhole:true};h.ctx.ipaEffectAttach({},a.run);}});
    a.audio.emit('playing');h.advance(250);a.audio.emit('error');
    assert.equal(fallbackRun,a.run,'Same effect owner can attach TTS fallback');assert.equal(a.run.info.speech,'a record');
  }
  for(const mode of ['cancel','next','hidden']){
    const h=harness(),a=h.play(),latePlaying=a.audio.onplaying,lateError=a.audio.onerror;
    if(mode==='next')h.invalidate();
    if(mode==='hidden'){h.ctx.document.hidden=true;h.events.visibilitychange();}else h.ctx.ipaEffectCancel();
    latePlaying();lateError();a.audio.reject(Error('late'));await Promise.resolve();h.advance(10000);
    assert.equal(h.fallbacks,0,mode+' must not restart TTS');assert(a.audio.pauseCount,mode+' pauses native media');assert.equal(a.audio.src,'');
  }
  {
    const h=harness(),old=h.play(),oldEnd=old.audio.onended;old.audio.emit('playing');h.advance(400);h.gate();
    const fresh=h.play(verb);fresh.audio.emit('playing');oldEnd();h.advance(100);assert(!fresh.run.finished);assert.equal(h.next,0);
    fresh.audio.emit('ended');h.advance(60);assert.equal(h.next,1,'Replay retains automatic gate and ignores previous audio end');
  }
  {
    const h=harness(),a=h.play();a.audio.emit('playing');h.advance(2400);assert.equal(h.fallbacks,1,'Missing end is bounded');assert(a.audio.pauseCount);
  }
  {
    const h=harness(),a=h.play();h.advance(1500);h.gate();h.advance(1000);assert.equal(h.next,1,'Failed load never traps progression');assert.equal(h.fallbacks,1);
  }
  for(const mode of ['copy','review']){
    const h=harness(),a=h.play(noun,{noRun:true});assert(a.selected);a.audio.emit('playing');a.audio.emit('ended');assert.equal(h.fallbacks,0);
    const b=h.play(verb,{noRun:true});b.audio.emit('error');assert.equal(h.fallbacks,1,mode+' can fall back without IPA');
  }
  {
    const h=harness(),a=h.play(noun,{noRun:true});h.ctx.document.hidden=true;h.events.visibilitychange();h.advance(10000);
    assert(a.audio.pauseCount);assert.equal(h.fallbacks,0,'Hidden copy/review without an IPA run still stops');
  }
  {
    const h=harness();h.invalidate();assert(h.play().selected);assert.equal(h.audios.length,0,'Stale request never starts media');
  }
  console.log('PASS pronunciation exceptions: exact sense lookup, lazy single-card preload, playing/ended gate, measured duration, native-cache isolation, bounded failures, replay/next/hidden cancellation, and null-run copy/review.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
