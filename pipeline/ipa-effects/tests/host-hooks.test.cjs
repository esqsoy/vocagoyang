const assert=require('node:assert/strict'),path=require('node:path');
const {harness,root}=require('../../tests/helpers/mother-tongue-harness.cjs');
const files=['vocagoyangfable.html','vocagoyangksat2027.html','vocagoyangebs2027.html'];
for(const file of files){
 const fable=file.includes('fable'),delay=fable?2200:1200; // FABLE은 해설 읽을 시간 예산 원값(26.10.08 복원)
 const make=()=>{const h=harness(path.join(root,file),{},{manualSpeech:true});h.start();return h;};
 const answer=h=>{
  const session=h.state.session,word=session.words[session.currentId],id=session.currentId;
  if(fable)word.c=''; // Use the existing shortest explanation delay, not a new duration rule.
  h.type(word.term);assert(session.answered&&!session.copyMode,file+' correct answer entered copy mode');
  const u=h.spoken.filter(u=>u.text.trim()).at(-1);assert(u,file+' did not speak');assert.equal(u.rate,.88,file+' changed speech rate');assert.equal(u.voice?.name,'Google US English',file+' changed selected browser voice');
  assert.equal(typeof u.onstart,'function',file+' did not attach speech/IPA hooks');
  return {session,word,id,u};
 };
 {
  const h=make(),a=answer(h);a.u.onstart();h.advance(delay);assert.equal(h.state.session.currentId,a.id,file+' advanced before speech ended');
  h.advance(250);a.u.onend();h.advance(100);assert.notEqual(h.state.session.currentId,a.id,file+' did not advance after speech ended');
 }
 {
  const h=make(),a=answer(h);a.u.onstart();h.advance(300);const cancels=h.cancels;
  if(fable)h.ctx.doNext();else h.ctx.advanceRevealed();
  const nextId=h.state.session.currentId;assert.notEqual(nextId,a.id,file+' blocked manual next');assert(h.cancels>cancels,file+' failed to cancel speech on manual next');
  a.u.onend();h.advance(delay+200);assert.equal(h.state.session.currentId,nextId,file+' stale voice/auto callback advanced the next question');
 }
 {
  const h=make(),a=answer(h);a.u.onstart();h.advance(delay);h.ctx.setMuted(true);h.advance(100);
  assert.notEqual(h.state.session.currentId,a.id,file+' mute stranded a card after its original delay');
 }
 {
  const h=make(),a=answer(h);a.u.onstart();h.advance(delay);
  if(fable)h.ctx.speak(a.word.term);else h.ctx.replayCurrentPronunciation();
  const replay=h.spoken.at(-1);assert.notEqual(replay,a.u,file+' replay missing');replay.onstart();h.advance(250);a.u.onend();h.advance(100);assert.equal(h.state.session.currentId,a.id,file+' old end interrupted replay');
  replay.onend();h.advance(100);assert.notEqual(h.state.session.currentId,a.id,file+' replay discarded automatic next');
 }
 {
  const h=make(),session=h.state.session,word=session.words[session.currentId],id=session.currentId;
  if(fable)word.c='';
  h.ctx.submit({forced:true});assert(session.copyMode,file+' wrong answer did not require copy');
  assert.equal(h.run('ipaEffectRun'),null,file+' exposed IPA overlay during copy entry');
  const learning=()=>JSON.stringify({attempts:session.attempts,errors:session.errors,firstSeen:session.firstSeen,firstCorrect:session.firstCorrect,streak:session.streak,queue:session.queue,word});
  const before=learning(),old=h.spoken.filter(u=>u.text.trim()).at(-1),count=h.spoken.length,cancels=h.cancels;
  old?.onstart?.();h.advance(500);h.type(word.term);assert(!session.copyMode,file+' exact copy did not complete');
  assert.equal(learning(),before,file+' copying a wrong answer changed learning results');
  assert(h.blank.classList.contains('revealed'),file+' copied answer retained ghost cells');
  assert(h.cancels>cancels,file+' copied answer did not cancel the previous pronunciation');
  const u=h.spoken.at(-1);assert.equal(h.spoken.length,count+1,file+' completed copy must speak once');
  assert.notEqual(u,old);assert.equal(u.rate,.88);assert.equal(typeof u.onstart,'function',file+' completed copy has no IPA hooks');
  if(!fable){h.ctx.advanceRevealed();assert.equal(session.currentId,id,file+' copy completion did not reset accidental-tap protection');}
  h.type(word.term);h.ctx.submitCopy();assert.equal(h.spoken.length,count+1,file+' duplicate copy input replayed pronunciation');
  u.onstart();h.advance(delay);old?.onend?.();h.advance(100);
  assert.equal(session.currentId,id,file+' completed copy advanced before its new pronunciation ended');
  u.onend();h.advance(100);assert.notEqual(session.currentId,id,file+' completed copy did not advance after pronunciation');
  const next=session.currentId;u.onend();h.advance(delay);assert.equal(session.currentId,next,file+' stale copy completion advanced a later question');
 }
 {
  // Completing the copy before the voice list arrives replaces its pending audio.
  const h=make();h.ctx.window.speechSynthesis.getVoices=()=>[];
  h.run(fable?'_voice=null;_voiceName=null;':'pronunciationVoice=null;pronunciationVoiceName=null;');
  const session=h.state.session,id=session.currentId,w=session.words[id];if(fable)w.c='';
  h.ctx.submit({forced:true});const previous=[...h.intervals].filter(([,t])=>t.ms===100);
  assert(previous.length,file+' missing delayed copy voice fixture');h.type(w.term);
  for(const [timer] of previous)assert(!h.intervals.has(timer),file+' old copy voice wait survived completion');
  h.ctx.window.speechSynthesis.getVoices=()=>[{name:'Google US English',lang:'en-US',localService:true}];
  for(const [,wait] of [...h.intervals].filter(([,t])=>t.ms===100))wait.f();
  const utterances=h.spoken.filter(u=>u.text.trim());assert.equal(utterances.length,1,file+' delayed copy produced duplicate pronunciation');
  const u=utterances[0];assert.equal(typeof u.onstart,'function');u.onstart();h.advance(delay);
  assert.equal(session.currentId,id,file+' delayed copy did not wait for pronunciation');u.onend();h.advance(100);assert.notEqual(session.currentId,id);
 }
 {
  const h=make();h.ctx.window.speechSynthesis.getVoices=()=>[];
  h.run(fable?'_voice=null;_voiceName=null;':'pronunciationVoice=null;pronunciationVoiceName=null;');
  const w=h.state.session.words[h.state.session.currentId];if(fable)w.c='';h.type(w.term);
  const waits=[...h.intervals.values()].filter(t=>t.ms===100);assert(waits.length,file+' missing delayed-voice wait fixture');
  h.fire('exitBtn','click');
  for(let i=0;i<13;i++)for(const wait of waits)wait.f();
  assert(!h.spoken.some(u=>u.text.trim()),file+' delayed voice resumed after exit');assert.equal(h.run('ipaEffectRun'),null,file+' exit retained IPA overlay');
 }
 {
  const h=make();h.ctx.setMuted(true);const session=h.state.session,id=session.currentId,w=session.words[id];if(fable)w.c='';h.type(w.term);
  assert(!h.spoken.some(u=>u.text.trim()),file+' muted answer spoke');h.advance(delay);assert.notEqual(h.state.session.currentId,id,file+' muted answer changed normal reveal delay');
 }
 for(const mode of ['muted','unsupported']){
  const h=make();if(mode==='muted')h.ctx.setMuted(true);else h.ctx.window.speechSynthesis=null;
  const session=h.state.session,id=session.currentId,w=session.words[id];if(fable)w.c='';
  h.ctx.submit({forced:true});h.type(w.term);assert(!session.copyMode);
  assert(!h.spoken.some(u=>u.text.trim()),file+' '+mode+' copied answer spoke');
  h.advance(delay-1);assert.equal(session.currentId,id,file+' '+mode+' copied answer skipped normal reveal time');
  h.advance(1);assert.notEqual(session.currentId,id,file+' '+mode+' copied answer was stranded');
 }
 console.log('PASS '+file+': real speech hooks, timing, manual next, mute, replay, copy, delayed voice exit, and original voice/rate.');
}
