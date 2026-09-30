'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const h=fs.readFileSync(path.join(root,'vocagoyangfable.html'),'utf8');
const readConst=n=>JSON.parse(h.match(new RegExp('const '+n+' = ([^\\n]+);\\r?\\n'))[1]);
// Keep the historical 327-card expansion assertions fixed. The subsequent
// suffix stage has its own live-data and progress tests.
const suffix=require('../suffix-rebuild-20261001/restore.cjs');
const DATA=suffix.restoreSuffixExpansion(readConst('DATA')),morph=suffix.beforeMorphology;
const {review,beforeMorphology,restoreMorphologyExpansion,hash}=require('../morphology-rebuild-20260930/restore.cjs');
assert.equal(hash(DATA),review.afterDataSha256);
assert.equal(hash(morph),review.afterMorphologySha256);
assert.equal(hash(beforeMorphology),review.baselineMorphologySha256);
const before=restoreMorphologyExpansion(DATA);
assert.equal(hash(before),review.baselineDataSha256);
for(const L of DATA)if(![47,48].includes(L.lesson))assert.deepEqual(L,before[L.lesson],'Unrelated course changed');
const all=d=>d.flatMap(L=>L.exercises.flatMap(e=>e.words));
const beforeHeads=new Set(all(before).map(w=>w.word.toLowerCase()));
const newHeads=[...new Set(all(DATA).map(w=>w.word.toLowerCase()))].filter(w=>!beforeHeads.has(w));
assert.equal(newHeads.length,37);assert.equal(all(DATA).length-all(before).length,160);
assert.deepEqual(newHeads.sort(),review.addedCardProvenance.filter(x=>x.type==='new_headword').map(x=>x.word.toLowerCase()).sort());
assert.equal(review.addedCardProvenance.filter(x=>x.type==='existing_pool_review').length,123);
assert.equal(all(DATA).length,7036);
const units=new Map(morph.units.map(u=>[u.id,u]));
let retained=0,notes=0;
for(const old of beforeMorphology.units){
 const updated=units.get(old.id);assert(updated,old.id);
 for(const w of old.cards){
  const matches=updated.cards.filter(c=>c.word===w.word);assert.equal(matches.length,1,w.word);
  const {c:oldC,...oldRest}=w,{c:newC,...newRest}=matches[0];
  assert.deepEqual(newRest,oldRest,'Changed retained card beyond explanation: '+w.word);
  retained++;if(oldC!==newC)notes++;
 }
}
assert.equal(retained,167);assert.equal(notes,33);
// Exercise boundaries must preserve entire teaching units and same-headword pairs.
const between=(a,b)=>h.slice(h.indexOf(a),h.indexOf(b,h.indexOf(a)));
const storage=new Map(),state={lessons:[],progress:{},prevOn:true};
const ctx=vm.createContext({DATA,state,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},STORAGE:'test-progress',LASTKEY:'test-last',console});
vm.runInContext(between('function buildLessons()','function updateRoute()'),ctx);
vm.runInContext(between('function saveLast(','/* 발음 읽어주기'),ctx);
const source=ctx.buildLessons();state.lessons=ctx.splitExercises(source);
assert.equal(ctx.totalExercises(),618);
const oldKeys=[];
for(const L of before.filter(L=>[47,48].includes(L.lesson)))for(const e of L.exercises){
 const id=e.progressId||L.progressId,title=e.progressTitle||`Exercise ${e.ex} · ${e.name}`;
 (state.progress[id]??={})[title]={completed:true};oldKeys.push([id,title]);
}
const oldProgress=JSON.stringify(state.progress);
let count=0;
for(const L of state.lessons.filter(L=>[47,48].includes(L.lesson))){
 assert.equal(L.progressId,`morphology-${L.lesson}-20260930`);
 const owners=new Map();
 assert.equal(L.exercises.length,L.lesson===47?10:22);
 for(const e of L.exercises){
  assert(e.words.length>=8&&e.words.length<=15);
  assert.equal(e.words.length,source[L.lesson].exercises.find(x=>x.ex===e.ex).words.length,'Split a teaching family');
  for(const w of e.words){
   if(owners.has(w.unitId))assert.equal(owners.get(w.unitId),e.title);
   owners.set(w.unitId,e.title);
   assert(!w.acceptedAnswers,'Added unapproved alternative answers');
  }
  assert(!ctx.getRec(L.id,e.title)?.completed,'An old course completion cleared new content');
  count++;
 }
}
assert.equal(JSON.stringify(state.progress),oldProgress,'Reading new course erased old records');
assert.equal(count,32);
// New completions and resume are exact; neighbouring exercises remain unfinished.
for(const L of state.lessons.filter(L=>[47,48].includes(L.lesson)))for(const [ei,e] of L.exercises.entries()){
 state.progress={};ctx.saveLast(L.id,e.title);const target=ctx.resumeTarget();assert.equal(target.li,L.lesson);assert.equal(target.ei,ei);
 ctx.setRec(L.id,e.title,{});assert(ctx.getRec(L.id,e.title).completed);
 assert.equal(L.exercises.filter(x=>ctx.getRec(L.id,x.title)?.completed).length,1);
}
// Unchanged course records and saved locations still resolve normally.
for(const L of state.lessons.filter(L=>![47,48].includes(L.lesson))){
 const e=L.exercises[0];state.progress={};ctx.saveLast(L.id,e.title);assert.equal(ctx.resumeTarget().li,L.lesson);
 ctx.setRec(L.id,e.title,{});assert(ctx.getRec(L.id,e.title).completed);
}
const pairs=[['microscopic','macroscopic'],['microeconomics','macroeconomics'],['intracellular','intercellular'],['homogeneous','heterogeneous'],['symmetry','asymmetry'],['include','exclude'],['sensitive','sensible'],['temporary','contemporary']];
for(const pair of pairs)assert(state.lessons.slice(47,49).some(L=>L.exercises.some(e=>pair.every(w=>e.words.some(c=>c.word===w)))),pair.join('/'));
console.log(JSON.stringify({retained,notes,newHeadwords:newHeads.length,reviewCards:123,morphologyCards:327,morphologyExercises:count,totalCards:7036,totalExercises:618,unrelatedCourses:'unchanged',oldRecords:'retained without false completion',newResume:'all 32 exercises',pairs:'intact'}));
