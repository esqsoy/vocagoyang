'use strict';
// 철자 변형 판정(26.10.15 아스트라 리뷰 T01): 영국식 -ise와 띄어쓰기 차이만 맞다고 하고, z를 s로 바꾼 오자는 틀리게 한다.
// 세 교재 모두 함수 단위로 보고, FABLE은 실제 입력 → 자동 제출 경로(bus 카드에 buz)까지 본다.
const assert=require('node:assert/strict'),path=require('node:path');
const {harness,root}=require('./helpers/mother-tongue-harness.cjs');
const yes=[['realise','realize'],['organisation','organization'],['organisational','organizational'],['analyse','analyze'],['recognised','recognized'],['apologising','apologizing'],['eye sight','eyesight']];
const no=[['buz','bus'],['soo','zoo'],['sise','size'],['citisen','citizen'],['exercize','exercise'],['priSe','prize'],['realize','realize'],['','realize']];
for(const file of ['vocagoyangfable.html','vocagoyangksat2027.html','vocagoyangebs2027.html']){
 const h=harness(path.join(root,file));
 for(const [t,term] of yes)assert.equal(h.ctx.isSpellingVariant(t,term),true,`${file}: ${t} for ${term}`);
 for(const [t,term] of no)assert.equal(h.ctx.isSpellingVariant(t,term),false,`${file}: ${t} for ${term}`);
}
// 실제 경로: bus 카드에 buz를 치면 틀린다(전에는 맞다고 하고 복습에서도 빠졌다).
{const h=harness(path.join(root,'vocagoyangfable.html'));let hit=null;
 h.state.lessons.forEach((L,li)=>h.ctx.visEx(L).forEach((e,ei)=>{if(!hit&&e.words.some(w=>w.term==='bus'))hit={li,ei};}));
 assert(hit,'bus card');h.ctx.openLesson(hit.li);h.ctx.openExercise(hit.ei);
 const s=h.state.session;for(let g=0;g<200&&s.words[s.currentId].term!=='bus';g++){h.type(s.words[s.currentId].term);h.ctx.nextCard();}
 assert.equal(s.words[s.currentId].term,'bus');h.type('buz');
 assert.equal(s.answered,true,'buz fills the slot and submits');assert.equal(s.words[s.currentId].passed,false,'buz is wrong');assert(s.errors>=1);}
console.log('PASS spelling-variant: -ise/-yse·띄어쓰기는 맞고 buz·soo·sise·citisen·exercize는 틀린다(세 교재), bus 카드 실제 제출 경로');
