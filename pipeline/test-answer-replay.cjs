const assert=require('node:assert/strict'),path=require('node:path');
const {harness,root}=require('./tests/helpers/mother-tongue-harness.cjs');
for(const file of ['vocagoyangfable.html','vocagoyangksat2027.html','vocagoyangebs2027.html']){
 const h=harness(path.join(root,file),{},{manualSpeech:true});h.start();
 const s=h.state.session,w=s.words[s.currentId],id=s.currentId;
 const event=(type='click',extra={})=>{let prevented=false,stopped=false;h.fire('hoeCtx',type,{type,target:h.blank,...extra,preventDefault(){prevented=true;},stopPropagation(){stopped=true;}});return {prevented,stopped};};
 h.blank.classList.add('answer-replay');event();assert.equal(h.spoken.length,0,'No replay before answer');
 h.type(w.term);assert(s.answered&&!s.copyMode);assert.equal(h.blank.getAttribute('role'),'button');assert.equal(h.blank.getAttribute('tabindex'),'0');
 assert.equal(h.blank.getAttribute('aria-label'),w.term+' 발음 다시 듣기');
 assert(!/rv-inline-ipa|ov-ipa/.test(h.els.get('reveal').innerHTML),'No IPA in commentary');
 if(file.includes('fable')&&w.c)assert(h.els.get('reveal').innerHTML.includes(h.ctx.esc(w.c)),'Keep FABLE word commentary');
 const learning=()=>JSON.stringify({id:s.currentId,attempts:s.attempts,errors:s.errors,queue:s.queue,streak:s.streak,word:w});
 const before=learning();let hearts=0;h.ctx.fx=()=>hearts++;
 const initial=h.spoken.at(-1);initial.onstart();h.advance(300);
 assert.deepEqual(event(),{prevented:true,stopped:true});const replay=h.spoken.at(-1);assert.notEqual(replay,initial);assert.equal(replay.text,initial.text);replay.onstart();
 assert(h.run('ipaEffectRun')&&h.run('ipaEffectRun.info.term')===w.term,'Replay also starts the IPA effect');
 assert.equal(learning(),before);assert.equal(hearts,0,'Replay must not reward another answer');
 let count=h.spoken.length;event('keydown',{key:'Enter'});event('keydown',{key:' '});assert.equal(h.spoken.length,count+2,'Enter and Space replay');
 count=h.spoken.length;event('keydown',{key:'Enter',repeat:true});event('keydown',{key:'Enter',isComposing:true});event('keydown',{key:'Tab'});assert.equal(h.spoken.length,count,'Ignore composing/repeated/unrelated keys');
 const current=h.spoken.at(-1);current.onstart();const delay=h.ctx.revealDelay?h.ctx.revealDelay(w):h.ctx.mtRevealDelay?h.ctx.mtRevealDelay(w):1200;
 h.advance(delay+100);initial.onend();replay.onend();h.advance(50);assert.equal(s.currentId,id,'Old audio completion cannot cut off replay');
 current.onend();h.advance(100);assert.notEqual(s.currentId,id,'Replay retains automatic advance');
 // The correction remains an input until complete, then becomes the same replay control.
 h.start();const copyWord=h.state.session.words[h.state.session.currentId];h.ctx.submit({forced:true});count=h.spoken.length;event();assert.equal(h.spoken.length,count,'Do not intercept correction typing');
 h.type(copyWord.term);assert(!h.state.session.copyMode);count=h.spoken.length;event();assert.equal(h.spoken.length,count+1,'Completed copy replays');
 h.ctx.setMuted(true);count=h.spoken.length;event();assert.equal(h.spoken.length,count,'Mute remains respected');assert(h.run('ipaEffectRun'),'Muted replay still shows IPA');
 console.log('PASS '+file+': answer tap/keyboard, IPA replay, no duplicate reward, copy, mute, and auto-advance.');
}
