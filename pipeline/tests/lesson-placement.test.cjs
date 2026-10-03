'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),html=fs.readFileSync(path.join(root,'vocagoyangfable.html'),'utf8');
const data=require('../placement-review-20261003/restore.cjs').restoreRegrouping(JSON.parse(html.match(/^const DATA = (\[.*\]);\s*$/m)[1]));
const {restoreLessonPlacement}=require('../restore-lesson-placement.cjs');
const before=restoreLessonPlacement(data);
const between=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i+a.length);assert(i>=0&&j>i);return html.slice(i,j);};
function runtime(DATA){
 const storage=new Map(),state={lessons:[],progress:{},prevOn:true};
 const ctx=vm.createContext({DATA,state,STORAGE:'test-progress',LASTKEY:'test-last',localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}});
 vm.runInContext([
  between('function buildLessons()','/* ===== progress / route ===== */'),
  between('function loadProgress()','/* ===== screens ===== */'),
  between('function saveLast(','/* 발음 읽어주기')
 ].join('\n'),ctx);
 const flat=state.lessons.flatMap((L,li)=>L.exercises.map((e,ei)=>({L,e,li,ei})));
 return {ctx,state,storage,flat};
}
const old=runtime(before),now=runtime(data),plain=x=>JSON.parse(JSON.stringify(x));
const key=(run,x)=>JSON.stringify(run.ctx.recordKey(x.L.id,x.e.title));
assert.equal(now.ctx.totalExercises(),620);
assert.equal(data[0].exercises.flatMap(e=>e.words).length,228);
assert.equal(data[45].exercises.flatMap(e=>e.words).length,165);
assert(!data[0].exercises.some(e=>e.name.startsWith('독해 핵심 보강')));
assert.deepEqual(data[45].exercises.slice(8).map(e=>e.ex),[9,10,11,12,13,14]);
assert.equal(data[45].exercises.slice(8).flatMap(e=>e.words).length,77);
for(let i=1;i<data.length;i++)if(i!==45)assert.deepEqual(data[i],before[i]);
assert.deepEqual(data[0].exercises,before[0].exercises.slice(0,-6));
assert.deepEqual(data[45].exercises.slice(0,8),before[45].exercises);
const cards=d=>d.flatMap(L=>L.exercises.flatMap(e=>e.words.map(w=>JSON.stringify(w)))).sort();
assert.deepEqual(cards(data),cards(before),'Relocation must preserve every card field and multiplicity');
const previousKeys=new Set(old.flat.map(x=>key(old,x))),newKeys=new Set(now.flat.map(x=>key(now,x)));
assert.equal(previousKeys.size,620);assert.equal(newKeys.size,620);
assert.deepEqual([...newKeys].sort(),[...previousKeys].sort(),'Preserve each saved completion identity');
for(const x of old.flat)old.ctx.setRec(x.L.id,x.e.title,{completed:true});
now.state.progress=plain(old.state.progress);assert.equal(now.ctx.clearedExercises(),620);
old.state.progress={};now.state.progress={};
let oldResumes=0,newResumes=0;
function checkResume(lid,title,layout){
 const last=JSON.stringify({lid,title,layout});old.storage.set('test-last',last);now.storage.set('test-last',last);
 const expected=old.ctx.resumeTarget(),actual=now.ctx.resumeTarget();assert(expected&&actual);
 assert.equal(key(now,actual),key(old,expected),`Resume changed cards: ${lid} / ${title} / ${layout}`);oldResumes++;
}
for(const x of old.flat){
 checkResume(x.L.id,x.e.title,'topics-v4');
 if(x.L.lesson!==0||!x.e.title.includes('독해 핵심 보강'))continue;
 for(const [layout,field] of [['short-v1','priorTitles'],['heads-v2','priorHeadTitles'],['heads-v3','priorElevenTitles'],['heads-v3-editorial-20260925','priorCurrentTitles']]){
  for(const title of x.e[field]||[])checkResume(x.L.id,title,layout);
 }
 checkResume(x.L.id,x.e.sourceTitle,undefined);
}
for(const x of now.flat){
 now.ctx.saveLast(x.L.id,x.e.title);const actual=now.ctx.resumeTarget();
 assert.equal(actual.li,x.li);assert.equal(actual.ei,x.ei);newResumes++;
}
for(const x of now.flat.filter(x=>x.e.relocatedFrom)){
 const previous=old.flat.find(y=>key(old,y)===key(now,x));assert(previous);
 assert.equal(x.li,45);assert.equal(previous.li,0);
 old.state.progress={};now.state.progress={};
 old.ctx.setRec(previous.L.id,previous.e.title,{completed:true});now.state.progress=plain(old.state.progress);
 assert(now.ctx.getRec(x.L.id,x.e.title)?.completed);assert.equal(now.ctx.clearedExercises(),1);
}
console.log(JSON.stringify({movedCards:77,movedHeadwords:35,fromSetCards:228,toSetCards:165,totalExercises:620,completionKeys:'all preserved',oldResumes,newResumes,allCardFields:'unchanged'}));
