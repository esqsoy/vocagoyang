'use strict';
// 해설에 "이 문장에는 X도 들어간다"고 적은 낱말을 치면(26.11.28 영신 "이 카드에서는"):
// 오답으로 치지 않고(오답 수·따라쓰기 없음) 이 카드의 답을 알려 준 뒤 다시 치게 한다. 답을 봤으니 첫 시도 정답으로는 세지 않는다.
// FABLE 엔진과 시험 단어장 엔진(토익 HTML을 복제한 토플)을 함께 본다.
const assert=require('node:assert/strict'),path=require('node:path');
const {harness,root}=require('./helpers/mother-tongue-harness.cjs');

for(const file of ['vocagoyangfable.html','vocagoyangtoefl.html']){
  const h=harness(path.join(root,file));
  assert.deepEqual(JSON.parse(JSON.stringify(h.run('noteAlternatives({c:"톨스토이. 이 문장에는 upbraid·censure·lecture도 들어간다."})'))),['upbraid','censure','lecture'],file+': 해설에서 낱말을 뽑는다');
  assert.deepEqual(JSON.parse(JSON.stringify(h.run('noteAlternatives({c:"편지·이메일. 이 뜻에서는 mail·post와 바꿔 쓸 수 있다."})'))),['mail','post'],file+': "바꿔 쓸 수 있다"도 뽑는다');
  assert.deepEqual(JSON.parse(JSON.stringify(h.run('noteAlternatives({c:"철자에 w가 두 번 들어간다."})'))),[],file+': 다른 "들어간다"는 뽑지 않는다');

  // 해설에 경쟁어가 적힌 첫 카드가 있는 연습을 연다.
  let at=null;
  h.state.lessons.forEach((L,li)=>(L.exercises||[]).forEach((e,ei)=>e.words.forEach(w=>{
    if(!at&&h.ctx.noteAlternatives(w).length)at={li,ei,term:w.term,c:w.c,alt:h.ctx.noteAlternatives(w)[0]};})));
  assert(at,file+': 해설에 경쟁어가 적힌 카드가 있다');
  h.ctx.openLesson(at.li);
  const vis=typeof h.ctx.visEx==='function'?h.ctx.visEx(h.state.lessons[at.li]):h.state.lessons[at.li].exercises;
  const idx=vis.indexOf(h.state.lessons[at.li].exercises[at.ei]);
  h.ctx.openExercise(idx>=0?idx:at.ei);
  const s=h.state.session;let guard=0;
  // 같은 표제어의 다른 뜻 카드(해설이 다름)와 헷갈리지 않게 해설까지 맞춰 찾는다.
  while(!(s.words[s.currentId].term===at.term&&s.words[s.currentId].c===at.c)){
    const w=s.words[s.currentId];h.type(w.term);if(!s.answered)h.ctx.submit();h.ctx.nextCard();assert(++guard<80,file+': 카드를 찾지 못했다');
  }
  const errors=s.errors,first=s.firstCorrect;
  h.type(at.alt);h.ctx.submit();
  assert.equal(s.answered,false,file+': '+at.alt+'는 오답 처리하지 않는다');
  assert.equal(s.copyMode,false,file+': 따라쓰기로 가지 않는다');
  assert.equal(s.errors,errors,file+': 오답 수가 늘지 않는다');
  assert.equal(h.els.get('ainput').value,'',file+': 입력칸을 비운다');
  assert.match(h.els.get('catSpeech').textContent,new RegExp(at.term),file+': 이 카드의 답을 알려 준다');
  h.type(at.term);if(!s.answered)h.ctx.submit();
  assert.equal(s.answered,true,file+': 다시 친 답은 맞다');
  assert.equal(s.errors,errors,file+': 그래도 오답 수는 그대로');
  assert.equal(s.firstCorrect,first,file+': 답을 봤으니 첫 시도 정답으로 세지 않는다');
  console.log(`PASS ${file}: ${at.term} ← ${at.alt}`);
}
