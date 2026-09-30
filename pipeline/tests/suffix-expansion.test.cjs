'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),h=fs.readFileSync(path.join(root,'vocagoyangfable.html'),'utf8');
const readConst=n=>JSON.parse(h.match(new RegExp('const '+n+' = ([^\\n]+);\\r?\\n'))[1]);
const {restoreWordFamilyWording}=require('../restore-word-family-wording.cjs');
// The later display-only terminology edit has a recorded exact inverse.
const DATA=restoreWordFamilyWording(readConst('DATA')),morph=restoreWordFamilyWording(readConst('MORPHOLOGY'),'MORPHOLOGY');
const {review,beforeMorphology,restoreSuffixExpansion,hash}=require('../suffix-rebuild-20261001/restore.cjs');
assert.equal(hash(DATA),review.afterDataSha256);assert.equal(hash(morph),review.afterMorphologySha256);
assert.equal(hash(beforeMorphology),review.baselineMorphologySha256);
const before=restoreSuffixExpansion(DATA),all=d=>d.flatMap(L=>L.exercises.flatMap(e=>e.words));
assert.equal(hash(before),review.baselineDataSha256);
for(const L of DATA)if(![47,48].includes(L.lesson))assert.deepEqual(L,before[L.lesson]);
const oldHeads=new Set(all(before).map(w=>w.word.toLowerCase()));
const newHeads=[...new Set(all(DATA).map(w=>w.word.toLowerCase()))].filter(w=>!oldHeads.has(w));
assert.deepEqual(newHeads.sort(),['biome','chromosome','genome','microbiome','ribosome']);
assert.equal(all(DATA).length,7066);assert.equal(all(DATA).length-all(before).length,30);
assert.equal(review.addedCardProvenance.filter(p=>p.type==='existing_pool_review').length,25);
const units=new Map(morph.units.map(u=>[u.id,u]));let retained=0,notes=0;
for(const old of beforeMorphology.units){
 const updated=units.get(old.id);assert(updated,old.id);
 for(const w of old.cards){
  const matches=updated.cards.filter(c=>c.word===w.word);assert.equal(matches.length,1,w.word);
  const {c:oldC,...oldRest}=w,{c:newC,...newRest}=matches[0];assert.deepEqual(newRest,oldRest,w.word);
  retained++;if(oldC!==newC){notes++;assert(review.explanationChanges.some(c=>c.unitId===old.id&&c.word===w.word&&c.old===oldC&&c.new===newC));}
 }
}
assert.equal(retained,327);assert.equal(notes,review.explanationChanges.length);
// Every review reuses the pronunciation of the recorded meaning; source cards stay intact.
for(const row of review.addedCardProvenance.filter(p=>p.type==='existing_pool_review')){
 const p=row.provenance,original=p.originalCard;
 assert(original,'Missing source-card evidence: '+row.word);
 const source=before.find(L=>L.lesson===p.lesson)?.exercises.find(e=>e.ex===p.exercise)?.words.find(w=>w.word===original.word&&w.si===original.si);
 assert.deepEqual(source,original,row.word);assert.equal(row.card.ipa,original.ipa,row.word);
 assert.deepEqual(units.get(row.unitId).cards.find(w=>w.word===row.word),row.card);
}
// Use the actual game functions to verify group boundaries, completion and resume.
const between=(a,b)=>h.slice(h.indexOf(a),h.indexOf(b,h.indexOf(a)));
const storage=new Map(),state={lessons:[],progress:{},prevOn:true};
const ctx=vm.createContext({DATA,state,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},STORAGE:'test-progress',LASTKEY:'test-last',console});
vm.runInContext(between('function buildLessons()','function updateRoute()'),ctx);
vm.runInContext(between('function saveLast(','/* 발음 읽어주기'),ctx);
const source=ctx.buildLessons();state.lessons=ctx.splitExercises(source);assert.equal(ctx.totalExercises(),620);
for(const L of before.filter(L=>[47,48].includes(L.lesson)))for(const e of L.exercises){
 const id=e.progressId||L.progressId,title=e.progressTitle||`Exercise ${e.ex} · ${e.name}`;(state.progress[id]??={})[title]={completed:true};
}
const oldProgress=JSON.stringify(state.progress),assigned=new Set();let count=0;
for(const L of state.lessons.filter(L=>[47,48].includes(L.lesson))){
 assert.equal(L.progressId,`morphology-${L.lesson}-20261001`);
 assert.equal(L.exercises.length,L.lesson===47?12:22);
 assert.equal(L.exercises.reduce((n,e)=>n+e.words.length,0),L.lesson===47?123:234);
 const heads=new Map();
 for(const e of L.exercises){
  assert(e.words.length>=8&&e.words.length<=15,e.title);
  const raw=source[L.lesson].exercises.find(x=>x.ex===e.ex);assert.equal(e.words.length,raw.words.length,'A teaching family was split');
  for(const id of new Set(e.words.map(w=>w.unitId))){assert(!assigned.has(id));assigned.add(id);}
  for(const w of e.words){assert(!w.acceptedAnswers);if(heads.has(w.word))assert.equal(heads.get(w.word),e.title,'Split headword '+w.word);heads.set(w.word,e.title);}
  assert(!ctx.getRec(L.id,e.title)?.completed,'Old records completed new content');count++;
 }
}
assert.equal(assigned.size,morph.units.length);assert.equal(JSON.stringify(state.progress),oldProgress);
for(const L of state.lessons)for(const [ei,e] of L.exercises.entries()){
 state.progress={};ctx.saveLast(L.id,e.title);const target=ctx.resumeTarget();assert.equal(target.li,L.lesson);assert.equal(target.ei,ei);
 ctx.setRec(L.id,e.title,{});assert(ctx.getRec(L.id,e.title).completed);
 assert.equal(L.exercises.filter(x=>ctx.getRec(L.id,x.title)?.completed).length,1);
}
const families=[['care','careful','carefully','careless','carelessness'],['employ','employer','employee','employment'],['predictor','prediction','predictable'],['flexible','flexibility'],['photograph','photography','photographer','photographic'],['psychology','psychological','psychologist'],['biome','microbiome'],['chromosome','ribosome']];
for(const family of families)assert(state.lessons.slice(47,49).some(L=>L.exercises.some(e=>family.every(w=>e.words.some(c=>c.word===w)))),family.join('/'));
console.log(JSON.stringify({retained,notes,newHeadwords:newHeads.length,reviewCards:25,morphologyCards:357,morphologyExercises:count,totalCards:7066,totalExercises:620,unrelatedCourses:'unchanged',oldRecords:'retained without false completion',resume:'all 620 exercises',families:'intact'}));
