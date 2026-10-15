'use strict';
// 철자 변형 판정(26.10.15 아스트라 리뷰 T01): 영국식 -ise와 띄어쓰기 차이만 맞다고 하고, z를 s로 바꾼 오자는 틀리게 한다.
// 세 교재 모두 함수 단위로 보고, FABLE은 실제 입력 → 자동 제출 경로(bus 카드에 buz)까지 본다.
const assert=require('node:assert/strict'),path=require('node:path');
const {harness,root}=require('./helpers/mother-tongue-harness.cjs');
const yes=[['realise','realize'],['organisation','organization'],['organisational','organizational'],['analyse','analyze'],['recognised','recognized'],['apologising','apologizing'],['eye sight','eyesight'],['insize','in size'],['de-emphasise','de-emphasize'],['deemphasise','de-emphasize'],['recognisethesize','recognize the size']];
const no=[['buz','bus'],['soo','zoo'],['sise','size'],['in sise','in size'],['insise','in size'],['recognise the sise','recognize the size'],['citisen','citizen'],['exercize','exercise'],['priSe','prize'],['realize','realize'],['','realize']];
for(const file of ['vocagoyangfable.html','vocagoyangksat2027.html','vocagoyangebs2027.html']){
 const h=harness(path.join(root,file));
 for(const [t,term] of yes)assert.equal(h.ctx.isSpellingVariant(t,term),true,`${file}: ${t} for ${term}`);
 for(const [t,term] of no)assert.equal(h.ctx.isSpellingVariant(t,term),false,`${file}: ${t} for ${term}`);
}
// 실제 경로: bus와 49세트 in size 카드에서 z/s 오자를 자동 제출해도 틀린다.
for(const [term,typed] of [['bus','buz'],['in size','in sise']]){
 const h=harness(path.join(root,'vocagoyangfable.html'));let hit=null;
 h.state.lessons.forEach((L,li)=>h.ctx.visEx(L).forEach((e,ei)=>{if(!hit&&e.words.some(w=>w.term===term))hit={li,ei};}));
 assert(hit,term+' card');h.ctx.openLesson(hit.li);h.ctx.openExercise(hit.ei);
 const s=h.state.session;for(let g=0;g<200&&s.words[s.currentId].term!==term;g++){h.type(s.words[s.currentId].term);h.ctx.nextCard();}
 assert.equal(s.words[s.currentId].term,term);h.type(typed);
 assert.equal(s.answered,true,typed+' fills the slot and submits');assert.equal(s.words[s.currentId].passed,false,typed+' is wrong');assert(s.errors>=1);}
console.log('PASS spelling-variant: 단어별 -ise/-yse·띄어쓰기는 맞고 z/s 오자는 틀린다(세 교재), bus·in size 카드 실제 제출 경로');
