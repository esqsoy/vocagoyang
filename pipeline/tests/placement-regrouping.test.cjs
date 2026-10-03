'use strict';
// Exercise regrouping changes display order, never a card's identity or the
// exact coverage represented by an already stored completion.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),html=fs.readFileSync(path.join(root,'vocagoyangfable.html'),'utf8');
const data=JSON.parse(html.match(/^const DATA = (\[.*\]);\s*$/m)[1]);
const before=require('../placement-review-20261003/restore.cjs').restoreRegrouping(data);
const savedRuntime=fs.readFileSync(path.join(root,'pipeline/saved-cards/runtime.js'),'utf8');
const plain=value=>JSON.parse(JSON.stringify(value));
function between(a,b){const i=html.indexOf(a),j=html.indexOf(b,i+a.length);assert(i>=0&&j>i,a);return html.slice(i,j);}
function runtime(DATA,seed={}){
 const storage=new Map(Object.entries(seed)),state={lessons:[],progress:{},prevOn:true};
 const ctx=vm.createContext({DATA,state,STORAGE:'test-progress',LASTKEY:'test-last',SAVED_COURSE:'FABLE',
  localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},savedSyncCat(){},toast(){}});
 vm.runInContext([
  between('function buildLessons()','/* ===== progress / route ===== */'),
  between('function loadProgress()','/* ===== screens ===== */'),
  between('function saveLast(','/* 발음 읽어주기'),
  savedRuntime.slice(savedRuntime.indexOf('var savedStoreKey='),savedRuntime.indexOf('function savedCurrentWord()')),
  'savedInit();'
 ].join('\n'),ctx);
 const flat=state.lessons.flatMap((L,li)=>L.exercises.map((e,ei)=>({L,e,li,ei})));
 const cards=new Map(flat.flatMap(x=>x.e.words.map((w,i)=>[w.savedCardId,{...x,w,i}])));
 return {ctx,state,storage,flat,cards};
}
const old=runtime(before),now=runtime(data),key=(run,x)=>JSON.stringify(run.ctx.recordKey(x.L.id,x.e.title));
assert.equal(now.cards.size,7067);assert.equal(old.cards.size,7067);
assert.equal(now.flat.reduce((n,x)=>n+x.e.words.length,0),now.cards.size,'Saved IDs must be unique');
assert.deepEqual([...now.cards.keys()].sort(),[...old.cards.keys()].sort(),'Every prior saved-card ID survives regrouping');
const content=values=>values.flatMap(L=>L.exercises.flatMap(e=>e.words.map(w=>{const clean={...w};delete clean.savedId;return JSON.stringify(clean);}))).sort();
assert.deepEqual(content(data),content(before),'All headwords, senses, examples, explanations and answer rules are unchanged');
const reload=runtime(data,{'test-progress-saved-cards-v1':JSON.stringify([...old.cards.keys()].map((id,i)=>({id,addedAt:i+1})))});
assert.equal(reload.ctx.savedItems().length,7067,'Stored selections resolve every current card after relocation');

const ordinals=new Set(['first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth','eleventh','twelfth','thirteenth','fourteenth','fifteenth','seventeenth','eighteenth','nineteenth','twentieth','thirtieth','fortieth','fiftieth','sixtieth','seventieth','eightieth','ninetieth','hundredth']);
const directions=new Set(['north','south','east','west','northeast','northwest','southeast','southwest']);
const primary=[...now.cards.values()].filter(x=>x.L.lesson<=45);
const ordinalCards=primary.filter(x=>ordinals.has(x.w.word)),directionCards=primary.filter(x=>directions.has(x.w.word));
assert.equal(ordinalCards.length,30);assert(ordinalCards.every(x=>x.L.lesson===1));
assert.equal(directionCards.length,10);assert(directionCards.every(x=>x.L.lesson===3));
assert.equal(new Set(directionCards.map(x=>x.e)).size,1,'All direction senses stay in one exercise');
for(const head of ordinals)assert.equal(new Set(ordinalCards.filter(x=>x.w.word===head).map(x=>x.e)).size,1,head+' senses must not split');
const a=primary.filter(x=>x.w.word==='a'),an=primary.find(x=>x.w.word==='an');
assert.equal(an.L.lesson,5);assert(a.every(x=>x.e===an.e),'a and an belong to the same playable exercise');
const wings=primary.filter(x=>['left-wing','right-wing'].includes(x.w.word));
assert.equal(wings.length,2);assert(wings.every(x=>x.L.lesson===35));assert.equal(wings[0].e,wings[1].e);
const movedBasics=now.flat.filter(x=>x.L.lesson===4&&x.e.sourceTitle?.includes('기초 핵심 보강'));
assert.equal(movedBasics.flatMap(x=>x.e.words).length,36);assert(!data[0].exercises.some(e=>e.name?.includes('기초 핵심 보강')));

// Coverage is reconstructed independently from the actual previous layout,
// including older short/headword/topic keys. No new destination parent key may
// stand in for unrelated source cards.
let regrouped=0,coverageCards=0;
for(const x of now.flat.filter(x=>x.e.placementRegrouped)){
 regrouped++;assert.equal(x.e.parentRecord,null);
 x.e.words.forEach((w,index)=>{
  const previous=old.cards.get(w.savedCardId);assert(previous);
  const expected=[{id:JSON.parse(key(old,previous))[0],title:JSON.parse(key(old,previous))[1]},
   ...(previous.e.priorCoverage?.[previous.i]||[]),...(previous.e.parentRecord?[previous.e.parentRecord]:[])];
  const unique=keys=>[...new Set(keys.map(k=>JSON.stringify(k)))].sort();
  assert.deepEqual(unique(x.e.priorCoverage[index]),unique(expected),'Incorrect inherited coverage for '+w.word);coverageCards++;
 });
}
assert(regrouped>0);
const oldKeys=new Set(old.flat.map(x=>key(old,x))),newKeys=new Set(now.flat.map(x=>key(now,x)));
assert.equal(newKeys.size,now.flat.length,'Current exercise record keys must be unique');
for(const x of now.flat.filter(x=>x.e.placementRegrouped))assert(!oldKeys.has(key(now,x)),'Changed contents cannot reuse an old completion key');
const setProgress=keys=>{now.state.progress={};for(const serial of keys){const [id,title]=JSON.parse(serial);(now.state.progress[id]||=( {} ))[title]={completed:true};}};
setProgress(oldKeys);assert.equal(now.ctx.clearedExercises(),now.flat.length,'A fully completed previous pool remains fully completed');
let incompleteCases=0;
for(const x of now.flat.filter(x=>x.e.placementRegrouped)){
 const required=new Set(x.e.words.map(w=>key(old,old.cards.get(w.savedCardId))));
 setProgress(required);assert(now.ctx.getRec(x.L.id,x.e.title)?.completed);
 for(const missing of required){
  setProgress([...required].filter(k=>k!==missing));
  assert(!now.ctx.getRec(x.L.id,x.e.title)?.completed,'Incomplete source coverage marked a merged/repartitioned exercise complete');incompleteCases++;
 }
}
// In particular, knowing a does not grant completion for the newly joined an.
const oldA=old.cards.get(a[0].w.savedCardId),oldAn=old.cards.get(an.w.savedCardId);
assert.notEqual(key(old,oldA),key(old,oldAn));setProgress([key(old,oldA)]);
assert(!now.ctx.getRec(an.L.id,an.e.title)?.completed);
now.state.progress={};old.state.progress={};

let priorResumes=0,currentResumes=0;const seen=new Set();
function checkPrior(lid,title,layout){
 const serial=JSON.stringify({lid,title,layout});if(seen.has(serial))return;seen.add(serial);
 old.storage.set('test-last',serial);now.storage.set('test-last',serial);
 const previous=old.ctx.resumeTarget(),actual=now.ctx.resumeTarget();assert(previous&&actual);
 const expected=now.cards.get(previous.e.words[0].savedCardId);assert(expected);
 assert.equal(actual.li,expected.li,'Old resume chose the wrong set: '+serial);
 assert.equal(actual.ei,expected.ei,'Old resume chose unrelated cards: '+serial);priorResumes++;
}
for(const x of old.flat){
 checkPrior(x.L.id,x.e.title,'topics-v4');
 checkPrior(x.L.id,x.e.sourceTitle,undefined);
 for(const [layout,field] of [['short-v1','priorTitles'],['heads-v2','priorHeadTitles'],['heads-v3','priorElevenTitles'],['heads-v3-editorial-20260925','priorCurrentTitles']])
  for(const title of x.e[field]||[])checkPrior(x.L.id,title,layout);
}
for(const x of now.flat){
 now.ctx.saveLast(x.L.id,x.e.title);assert.equal(JSON.parse(now.storage.get('test-last')).layout,'placement-v1');
 const actual=now.ctx.resumeTarget();assert.equal(actual.li,x.li);assert.equal(actual.ei,x.ei);currentResumes++;
}
console.log(JSON.stringify({cards:now.cards.size,exercises:now.flat.length,regrouped,coverageCards,incompleteCases,
 ordinalCards:30,directionCards:10,movedBasics:36,stableSavedIds:'all preserved and reloaded',priorResumes,currentResumes,content:'unchanged'}));
