const assert=require('node:assert/strict'),path=require('node:path');
const {harness,root}=require('../../tests/helpers/mother-tongue-harness.cjs');
const files=['vocagoyangfable.html','vocagoyangksat2027.html','vocagoyangebs2027.html'];
for(const file of files){
 const fable=file.includes('fable'); // FABLE은 카드마다 읽을 시간 예산(revealDelay: 예문·해석·해설, 26.10.11), 교재는 1.5초(26.10.08 복원)
 // 말소리가 6초 넘게 안 끝나면 게임은 멈춘 것으로 보고 넘어간다. 말소리 끝을 기다리는지 보려고 FABLE 카드의 해석·해설을 비워 예산을 6초 아래로 둔다.
 const short=w=>{if(fable)Object.assign(w,{c:'',tr:''});return w;},wait=(h,w)=>fable?h.ctx.revealDelay(w):1500;
 const make=()=>{const h=harness(path.join(root,file),{},{manualSpeech:true});h.start();return h;};
 const answer=h=>{
  const session=h.state.session,word=session.words[session.currentId],id=session.currentId;
  short(word);
  h.type(word.term);assert(session.answered&&!session.copyMode,file+' correct answer entered copy mode');
  const u=h.spoken.filter(u=>u.text.trim()).at(-1);assert(u,file+' did not speak');assert.equal(u.rate,.88,file+' changed speech rate');assert.equal(u.voice?.name,'Google US English',file+' changed selected browser voice');
  assert.equal(typeof u.onstart,'function',file+' did not attach speech/IPA hooks');
  return {session,word,id,u};
 };
 {
  const h=make(),a=answer(h);a.u.onstart();h.advance(wait(h,a.word));assert.equal(h.state.session.currentId,a.id,file+' advanced before speech ended');
  h.advance(250);a.u.onend();h.advance(100);assert.notEqual(h.state.session.currentId,a.id,file+' did not advance after speech ended');
 }
 {
  const h=make(),a=answer(h);a.u.onstart();h.advance(300);const cancels=h.cancels;
  if(fable)h.ctx.doNext();else h.ctx.advanceRevealed();
  const nextId=h.state.session.currentId;assert.notEqual(nextId,a.id,file+' blocked manual next');assert(h.cancels>cancels,file+' failed to cancel speech on manual next');
  a.u.onend();h.advance(wait(h,a.word)+200);assert.equal(h.state.session.currentId,nextId,file+' stale voice/auto callback advanced the next question');
 }
 {
  const h=make(),a=answer(h);a.u.onstart();h.advance(wait(h,a.word));h.ctx.setMuted(true);h.advance(100);
  assert.notEqual(h.state.session.currentId,a.id,file+' mute stranded a card after its original delay');
 }
 {
  const h=make(),a=answer(h);a.u.onstart();h.advance(wait(h,a.word));
  if(fable)h.ctx.speak(a.word.term);else h.ctx.replayCurrentPronunciation();
  const replay=h.spoken.at(-1);assert.notEqual(replay,a.u,file+' replay missing');replay.onstart();h.advance(250);a.u.onend();h.advance(100);assert.equal(h.state.session.currentId,a.id,file+' old end interrupted replay');
  replay.onend();h.advance(100);assert.notEqual(h.state.session.currentId,a.id,file+' replay discarded automatic next');
 }
 {
  const h=make(),session=h.state.session,word=session.words[session.currentId],id=session.currentId;
  short(word);
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
  u.onstart();h.advance(wait(h,word));old?.onend?.();h.advance(100);
  assert.equal(session.currentId,id,file+' completed copy advanced before its new pronunciation ended');
  u.onend();h.advance(100);assert.notEqual(session.currentId,id,file+' completed copy did not advance after pronunciation');
  const next=session.currentId;u.onend();h.advance(wait(h,word));assert.equal(session.currentId,next,file+' stale copy completion advanced a later question');
 }
 {
  // Completing the copy before the voice list arrives replaces its pending audio.
  const h=make();h.ctx.window.speechSynthesis.getVoices=()=>[];
  h.run(fable?'_voice=null;_voiceName=null;':'pronunciationVoice=null;pronunciationVoiceName=null;');
  const session=h.state.session,id=session.currentId,w=short(session.words[id]);
  h.ctx.submit({forced:true});const previous=[...h.intervals].filter(([,t])=>t.ms===100);
  assert(previous.length,file+' missing delayed copy voice fixture');h.type(w.term);
  for(const [timer] of previous)assert(!h.intervals.has(timer),file+' old copy voice wait survived completion');
  h.ctx.window.speechSynthesis.getVoices=()=>[{name:'Google US English',lang:'en-US',localService:true}];
  for(const [,wait] of [...h.intervals].filter(([,t])=>t.ms===100))wait.f();
  const utterances=h.spoken.filter(u=>u.text.trim());assert.equal(utterances.length,1,file+' delayed copy produced duplicate pronunciation');
  const u=utterances[0];assert.equal(typeof u.onstart,'function');u.onstart();h.advance(wait(h,w));
  assert.equal(session.currentId,id,file+' delayed copy did not wait for pronunciation');u.onend();h.advance(100);assert.notEqual(session.currentId,id);
 }
 {
  const h=make();h.ctx.window.speechSynthesis.getVoices=()=>[];
  h.run(fable?'_voice=null;_voiceName=null;':'pronunciationVoice=null;pronunciationVoiceName=null;');
  const w=short(h.state.session.words[h.state.session.currentId]);h.type(w.term);
  const waits=[...h.intervals.values()].filter(t=>t.ms===100);assert(waits.length,file+' missing delayed-voice wait fixture');
  h.fire('exitBtn','click');
  for(let i=0;i<13;i++)for(const wait of waits)wait.f();
  assert(!h.spoken.some(u=>u.text.trim()),file+' delayed voice resumed after exit');assert.equal(h.run('ipaEffectRun'),null,file+' exit retained IPA overlay');
 }
 {
  const h=make();h.ctx.setMuted(true);const session=h.state.session,id=session.currentId,w=short(session.words[id]);h.type(w.term);
  assert(!h.spoken.some(u=>u.text.trim()),file+' muted answer spoke');h.advance(wait(h,w));assert.notEqual(h.state.session.currentId,id,file+' muted answer changed normal reveal delay');
 }
 for(const mode of ['muted','unsupported']){
  const h=make();if(mode==='muted')h.ctx.setMuted(true);else h.ctx.window.speechSynthesis=null;
  const session=h.state.session,id=session.currentId,w=short(session.words[id]);
  h.ctx.submit({forced:true});h.type(w.term);assert(!session.copyMode);
  assert(!h.spoken.some(u=>u.text.trim()),file+' '+mode+' copied answer spoke');
  h.advance(wait(h,w)-1);assert.equal(session.currentId,id,file+' '+mode+' copied answer skipped normal reveal time');
  h.advance(1);assert.notEqual(session.currentId,id,file+' '+mode+' copied answer was stranded');
 }
 if(fable){
  // 해설까지 읽을 시간(26.10.11 영신): 말소리가 일찍 끝나도 예문·해석·해설 예산이 다 지나야 넘어간다.
  const h=make(),session=h.state.session,id=session.currentId,w=session.words[id];
  // 표본은 무작위 카드라, 해설이 없거나 짧은 카드(26.10.12 세트 작업에서 뜻 줄을 되풀이한 해설을 뺌)가 뽑히면 예산이 6초에 못 미친다. 그럴 때만 해설 길이를 채운다.
  if((w.tr||'').length+(w.c||'').length<45)w.c='이 뜻에서는 다른 말과 바꿔 쓸 수 있다. 예문과 해석을 읽고 해설까지 읽을 시간.';
  h.type(w.term);
  const expected=Math.min(20000,2000+w.ex.split(/\s+/).filter(Boolean).length*250+((w.tr||'').length+(w.c||'').length)*110);
  assert.equal(h.ctx.revealDelay(w),expected,file+' reading budget formula');assert(expected>=6000,file+' sample card has a real explanation');
  const u=h.spoken.filter(u=>u.text.trim()).at(-1);u.onstart();h.advance(800);u.onend();
  h.advance(expected-900);assert.equal(session.currentId,id,file+' advanced before the explanation could be read');
  h.advance(300);assert.notEqual(session.currentId,id,file+' did not advance after the reading budget');
 }
 console.log('PASS '+file+': real speech hooks, timing, manual next, mute, replay, copy, delayed voice exit, and original voice/rate.');
}
