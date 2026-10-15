'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const {harness,root}=require('../tests/helpers/mother-tongue-harness.cjs');
const files=['vocagoyangfable.html','vocagoyangksat2027.html','vocagoyangebs2027.html'];
const noun={term:'record',meaning:'기록',ipa:'ˈrɛkɚd',src:'assets/pronunciation/test-record-n.mp3'},verb={term:'record',meaning:'기록하다',ipa:'rɪˈkɔrd',src:'assets/pronunciation/test-record-v.mp3'};

// These tests execute each built host's real input, replay, navigation and
// pronunciation code. Only the native media/voice objects are simulated.
// Distinct fixture clips make noun/verb selection deterministic without a
// dependency on random FABLE card order or a particular production recording.
function setup(file,options={}){
  const h=harness(path.join(root,file),{},{manualSpeech:true}),audios=[];
  assert.equal(h.run('typeof exceptionAudioPlay'),'function',file+': build pronunciation audio before testing');
  class FakeAudio{
    constructor(){this.src='';this.duration=NaN;this.ended=false;this.playCount=0;this.pauseCount=0;this.loadCount=0;audios.push(this);}
    play(){this.playCount++;return new Promise((resolve,reject)=>{this.resolve=resolve;this.reject=reject;});}
    pause(){this.pauseCount++;this.onpause?.();}
    load(){this.loadCount++;}
    removeAttribute(name){if(name==='src')this.src='';}
    emit(name){if(name==='ended')this.ended=true;this['on'+name]?.();}
  }
  if(!options.noAudio){h.ctx.Audio=FakeAudio;h.ctx.window.Audio=FakeAudio;}
  h.run(`PRONUNCIATION_AUDIO_MAP[${JSON.stringify(noun.term+'\t'+noun.ipa)}]={src:${JSON.stringify(noun.src)},duration:4.5};
    PRONUNCIATION_AUDIO_MAP[${JSON.stringify(verb.term+'\t'+verb.ipa)}]={src:${JSON.stringify(verb.src)},duration:4.5};`);
  if(!file.includes('fable'))h.run(`MT_PRONUNCIATIONS.record={ipa:${JSON.stringify(noun.ipa)},speech:'a record',meanings:{'기록하다':{ipa:${JSON.stringify(verb.ipa)},speech:'to record'}}};`);
  assert.equal(audios.length,0,'Loading a host must not allocate every pronunciation');
  h.start();h.ctx.exceptionAudioPreload(null);
  const fable=file.includes('fable'),session=h.state.session,id=session.currentId,word=session.words[id];
  function fixture(sense=noun){
    Object.assign(word,{term:sense.term,word:sense.term,meaning:sense.meaning,originalMeaning:sense.meaning,ipa:sense.ipa,ex:'Keep a {{BLANK}}.',tr:'',c:'',context:null});
    return word;
  }
  fixture(options.sense||noun);
  const lastAudio=()=>audios.filter(a=>a.playCount).at(-1);
  const realSpeech=()=>h.spoken.filter(u=>u.text.trim());
  const delay=()=>fable?h.ctx.revealDelay(word):h.ctx.mtRevealDelay?h.ctx.mtRevealDelay(word):1500;
  const next=()=>fable?h.ctx.doNext():h.ctx.advanceRevealed();
  const replay=()=>h.fire('hoeCtx','click',{type:'click',target:h.blank});
  function answer(){h.type(word.term);assert(session.answered&&!session.copyMode,file+' did not accept fixture answer');return lastAudio();}
  function clickReview(sense=verb){
    h.ctx.show('sum');
    // A different current card must not override the reviewed card's sense.
    const reviewIndex=(id+1)%session.words.length;
    const review=session.words[reviewIndex];
    Object.assign(review,{term:sense.term,meaning:sense.meaning,originalMeaning:sense.meaning,ipa:sense.ipa});
    if(file.includes('ksat'))review.meaning='원문에 맞춰 정리한 기록하다';
    const row=h.doc.createElement('button');row.className='wrow';
    row.dataset={id:String(reviewIndex),t:sense.term,ipa:sense.ipa};
    h.fire('sumWrong','click',{target:row});return {audio:lastAudio(),row};
  }
  return {h,audios,session,id,word,fable,fixture,lastAudio,realSpeech,delay,next,replay,answer,clickReview};
}

async function main(){
 for(const file of files){
  {
    const t=setup(file),{h}=t;
    h.ctx.exceptionAudioPreload({term:t.word.term,ipa:t.word.ipa});const warm=t.audios.at(-1);
    const a=t.answer();assert.equal(a,warm,file+' did not reuse the current-card preload');assert.equal(a.src,noun.src);
    assert.equal(t.realSpeech().length,0,file+' exception also spoke browser TTS');
    const run=h.run('ipaEffectRun');assert(run&&run.started===null,file+' started IPA before media playing');
    a.duration=4.1;a.emit('playing');assert.equal(run.timing.duration,4100);assert(run.timing.recorded);
    if(!t.fable)assert.equal(!!run.info.forceWhole,false,'MP3 must not inherit contextual TTS forceWhole');
    h.advance(t.delay());assert.equal(t.session.currentId,t.id,file+' advanced before recording end');
    a.emit('ended');h.advance(100);assert.notEqual(t.session.currentId,t.id,file+' recording end stranded auto-next');
  }
  {
    const t=setup(file),{h}=t;h.ctx.submit({forced:true});assert(t.session.copyMode);
    const first=t.lastAudio(),oldEnd=first.onended;assert.equal(first.src,noun.src);assert.equal(h.run('ipaEffectRun'),null,'Initial wrong-answer audio must leave copy slots visible');
    first.emit('playing');h.advance(300);
    const learning=()=>JSON.stringify({attempts:t.session.attempts,errors:t.session.errors,queue:t.session.queue,firstCorrect:t.session.firstCorrect,word:t.word});
    const before=learning(),count=t.audios.filter(a=>a.playCount).length;
    h.type(t.word.term);assert(!t.session.copyMode);assert.equal(learning(),before,'Copy completion must not change learning results');
    const completed=t.lastAudio();assert.notEqual(completed,first);assert(first.pauseCount&&first.src==='');
    assert(h.run('ipaEffectRun'),'Completed copy has the same pronunciation effect as correct answers');
    assert.equal(t.audios.filter(a=>a.playCount).length,count+1);
    h.type(t.word.term);h.ctx.submitCopy();assert.equal(t.audios.filter(a=>a.playCount).length,count+1,'Duplicate copy completion replayed');
    completed.emit('playing');h.advance(t.delay());oldEnd();h.advance(100);assert.equal(t.session.currentId,t.id,'Old copy audio advanced a newly revealed card');
    completed.emit('ended');h.advance(100);assert.notEqual(t.session.currentId,t.id);
  }
  {
    const t=setup(file),{h}=t,first=t.answer(),oldEnd=first.onended;first.emit('playing');
    h.advance(t.delay());
    const learning=JSON.stringify({attempts:t.session.attempts,errors:t.session.errors,queue:t.session.queue,word:t.word});let hearts=0;h.ctx.fx=()=>hearts++;
    t.replay();const current=t.lastAudio();assert.notEqual(current,first);assert(first.pauseCount);current.emit('playing');
    oldEnd();h.advance(100);assert.equal(t.session.currentId,t.id);assert.equal(hearts,0);
    assert.equal(JSON.stringify({attempts:t.session.attempts,errors:t.session.errors,queue:t.session.queue,word:t.word}),learning);
    current.emit('ended');h.advance(100);assert.notEqual(t.session.currentId,t.id,'Replay lost the existing automatic gate');
  }
  for(const action of ['next','mute','exit','hidden']){
    const t=setup(file),{h}=t,a=t.answer(),latePlaying=a.onplaying,lateError=a.onerror,lateEnd=a.onended;
    a.emit('playing');h.advance(300);
    if(action==='next')t.next();
    if(action==='mute')h.ctx.setMuted(true);
    if(action==='exit')h.fire('exitBtn','click');
    if(action==='hidden'){h.doc.hidden=true;for(const listener of h.events['doc:visibilitychange']||[])listener();}
    const currentId=t.session.currentId;
    assert(a.pauseCount&&a.src==='',file+' '+action+' did not stop media');
    latePlaying();lateError();lateEnd();a.reject(Error('late cancellation'));await Promise.resolve();await Promise.resolve();
    assert.equal(t.realSpeech().length,0,file+' '+action+' resurrected native fallback');
    if(action==='next'){assert.notEqual(currentId,t.id);h.advance(t.delay()+100);assert.equal(t.session.currentId,currentId,'Old pronunciation advanced another card');}
    if(action==='mute'){h.advance(t.delay());assert.notEqual(t.session.currentId,t.id,'Mute stranded auto-next');}
  }
  {
    const t=setup(file),{h}=t;h.ctx.setMuted(true);const plays=t.audios.filter(a=>a.playCount).length;
    t.answer();assert.equal(t.audios.filter(a=>a.playCount).length,plays);assert.equal(t.realSpeech().length,0);assert(h.run('ipaEffectRun'),'Muted answer still needs silent IPA');
    h.advance(t.delay());assert.notEqual(t.session.currentId,t.id);
  }
  for(const failure of ['error','reject','timeout']){
    const t=setup(file),{h}=t,a=t.answer();
    if(failure==='error')a.emit('error');
    if(failure==='reject'){a.reject(Error('NotAllowedError'));await Promise.resolve();await Promise.resolve();}
    if(failure==='timeout')h.advance(1800);
    a.emit('error');assert.equal(t.realSpeech().length,1,file+' '+failure+' must fall back exactly once');
    const u=t.realSpeech()[0];assert.equal(u.text,t.fable?'record':'a record');assert.equal(u.rate,.88);assert.equal(u.voice.name,'Google US English');
    assert.equal(typeof u.onstart,'function');if(!t.fable)assert(h.run('ipaEffectRun.info.forceWhole'),'Native fallback must restore contextual TTS whole effect');
    u.onstart();h.advance(t.delay());assert.equal(t.session.currentId,t.id);u.onend();h.advance(100);assert.notEqual(t.session.currentId,t.id,'Failed audio/native fallback stranded progression');
  }
  {
    const t=setup(file,{noAudio:true});t.answer();assert.equal(t.realSpeech().length,1,'No Audio API must retain native TTS');
    if(!t.fable)assert(t.h.run('ipaEffectRun.info.forceWhole'),'Unsupported Audio uses contextual TTS');
  }
  {
    const t=setup(file),{h}=t;h.ctx.window.speechSynthesis=null;h.ctx.window.SpeechSynthesisUtterance=undefined;h.ctx.SpeechSynthesisUtterance=undefined;
    const a=t.answer();assert(a&&a.src===noun.src,'Audio exceptions must work even without speechSynthesis');a.emit('playing');a.emit('ended');h.advance(t.delay()+100);assert.notEqual(t.session.currentId,t.id);
  }
  {
    const t=setup(file),{h}=t;t.fixture({term:'cat',meaning:'고양이',ipa:'kæt'});
    h.run("delete PRONUNCIATION_AUDIO_MAP['cat\\tkæt'];");
    if(!t.fable)h.run("MT_PRONUNCIATIONS.cat={ipa:'kæt'};");
    t.answer();assert.equal(t.audios.filter(a=>a.playCount).length,0,'Ordinary word must keep native TTS');assert.equal(t.realSpeech()[0].text,'cat');
  }
  {
    const t=setup(file,{sense:verb});const a=t.answer();assert.equal(a.src,verb.src,'Same spelling must select its exact meaning/IPA clip');
  }
  {
    const t=setup(file),{h}=t,{audio,row}=t.clickReview();assert.equal(audio.src,verb.src,file+' review selected the current card instead of reviewed meaning');
    assert.equal(h.run('ipaEffectRun'),null,'Review pronunciation must not create a game overlay');
    const count=t.audios.filter(a=>a.playCount).length;h.fire('sumWrong','click',{target:row});assert.equal(t.audios.filter(a=>a.playCount).length,count,'Dismissed review row replayed');
    audio.emit('error');assert.equal(t.realSpeech().length,1);assert.equal(t.realSpeech()[0].text,t.fable?'record':'to record');
    h.ctx.setMuted(true);const before=t.audios.filter(a=>a.playCount).length;t.clickReview();assert.equal(t.audios.filter(a=>a.playCount).length,before,'Muted review played media');
  }
  if(!file.includes('fable')){
    const t=setup(file),{h}=t;
    h.run("MT_PRONUNCIATIONS.record={ipa:'ˈrɛkɚd',speech:'a record',label:'명사',alternatives:[{ipa:'rɪˈkɔrd',label:'동사'}]};");
    t.answer();assert.equal(t.audios.filter(a=>a.playCount).length,0,'Unresolved multiple pronunciations must not choose one recording');
    assert(h.run('ipaEffectRun.info.forceWhole'));assert.equal(t.realSpeech().length,1);
  }
  if(file.includes('ksat')){
    const t=setup(file),{h}=t;
    t.word.context={example:'Keep records.',surface:'records',start:5,end:12,translation:'',note:''};
    // A source form differs from the spoken headword, even when MP3 eliminates
    // the extra TTS phrase used to disambiguate its noun/verb reading.
    assert.equal(h.ctx.mtNeedsWholePronunciation(t.word),true);
    const a=t.answer();assert(a);assert(h.run('ipaEffectRun.info.forceWhole'),'Inflected passage spelling must retain whole-word IPA');
  }
  console.log('PASS '+file+': audio correct/copy/replay, cancel/mute/exit/hidden, exact sense/review, TTS fallback, auto gate and no eager pool download.');
 }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
