'use strict';
// 26.10.10 표제어 정리(PRINCIPLES 2-8): 기초 5,000에서 뺀 73개 단어(90장).
// 남은 카드의 내용·저장 ID·완료 기록·이어하기가 빼기 전 그대로 이어지는지 본다.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),html=fs.readFileSync(path.join(root,'vocagoyangfable.html'),'utf8');
const prune=JSON.parse(fs.readFileSync(path.join(root,'pipeline/prune-20261010.json'),'utf8'));
const {hash,reverse}=require('../claude-review-20261008/ledger-lib.cjs');
const {LAYERS}=require('../claude-review-20261008/restore.cjs');
const savedRuntime=fs.readFileSync(path.join(root,'pipeline/saved-cards/runtime.js'),'utf8');
function between(a,b){const i=html.indexOf(a),j=html.indexOf(b,i+a.length);assert(i>=0&&j>i,a);return html.slice(i,j);}
// 이 층보다 나중에 쌓인 원장만 먼저 되돌려 정리 직후 상태를 얻는다.
let now=JSON.parse(html.match(/^const DATA = (\[.*\]);\s*$/m)[1]);
const layer=LAYERS.find(L=>L.name==='prune-20261010');assert(layer,'prune ledger must be in the restore chain');
for(const L of LAYERS){if(L===layer)break;const s=L.snapshots.DATA;if(hash(now)===s.afterHash)now=reverse(now,s.changes,s.keyOrders);}
assert.equal(hash(now),layer.snapshots.DATA.afterHash,'Unlogged change after pruning');
const before=reverse(now,layer.snapshots.DATA.changes,layer.snapshots.DATA.keyOrders);
assert.equal(hash(before),layer.snapshots.DATA.beforeHash);
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
const old=runtime(before),cur=runtime(now),key=(run,x)=>JSON.stringify(run.ctx.recordKey(x.L.id,x.e.title));
const drop=new Set(prune.words);
const isDropped=w=>drop.has((w.word||w.term).toLowerCase());

// 1. 정확히 90장·73단어만 빠졌고 남은 카드의 내용은 그대로다.
assert.equal(old.cards.size-cur.cards.size,prune.cards);
assert.equal([...old.cards.values()].filter(x=>isDropped(x.w)).length,prune.cards);
assert(![...cur.cards.values()].some(x=>isDropped(x.w)),'A pruned headword is still playable');
assert.deepEqual(new Set([...old.cards.values()].filter(x=>isDropped(x.w)).map(x=>(x.w.word||x.w.term).toLowerCase())),drop);
for(const [id,x] of cur.cards){const p=old.cards.get(id);assert(p,'Saved ID changed for '+x.w.word);
 const clean=w=>{const c={...w};delete c.savedCardId;delete c.savedId;return JSON.stringify(c);};assert.equal(clean(x.w),clean(p.w));}
const reload=runtime(now,{'test-progress-saved-cards-v1':JSON.stringify([...old.cards.keys()].map((id,i)=>({id,addedAt:i+1})))});
assert.equal(reload.ctx.savedItems().length,cur.cards.size,'Saved selections of remaining cards still resolve; pruned ones drop out quietly');

// 2. 카드를 빼지 않은 연습의 기록 키는 그대로다.
const oldByTitle=new Map(old.flat.map(x=>[x.L.id+'|'+x.e.title,x]));
let untouched=0;
for(const x of cur.flat.filter(x=>!x.e.preDeletion)){const p=oldByTitle.get(x.L.id+'|'+x.e.title);assert(p);assert.equal(key(cur,x),key(old,p));untouched++;}

// 3. 카드를 뺀 연습: 빼기 전 기록이 남은 카드를 모두 덮으면 완료, 하나라도 빠지면 미완료.
const setProgress=keys=>{cur.state.progress={};for(const serial of keys){const [id,title]=JSON.parse(serial);(cur.state.progress[id]||={})[title]={completed:true};}};
setProgress(old.flat.map(x=>key(old,x)));
assert.equal(cur.ctx.clearedExercises(),cur.flat.length,'A fully completed pool stays fully completed after pruning');
let pruned=0,incomplete=0;
for(const x of cur.flat.filter(x=>x.e.preDeletion)){
 pruned++;
 const required=new Set(x.e.words.map(w=>key(old,old.cards.get(w.savedCardId))));
 setProgress(required);assert(cur.ctx.getRec(x.L.id,x.e.title)?.completed,'Lost completion after pruning: '+x.e.title);
 for(const missing of required){
  setProgress([...required].filter(k=>k!==missing));
  assert(!cur.ctx.getRec(x.L.id,x.e.title)?.completed,'Incomplete coverage marked a pruned exercise complete');incomplete++;
 }
}
assert(pruned>0);cur.state.progress={};

// 4. 빼기 전에 저장한 이어하기 위치는 같은 카드가 있는 연습으로 돌아온다.
let resumes=0;
for(const x of old.flat){
 const survivor=x.e.words.find(w=>!isDropped(w));if(!survivor)continue;
 old.ctx.saveLast(x.L.id,x.e.title);cur.storage.set('test-last',old.storage.get('test-last'));
 const actual=cur.ctx.resumeTarget(),expected=cur.cards.get(survivor.savedCardId);
 assert(actual&&expected);assert.equal(actual.li,expected.li);assert.equal(actual.ei,expected.ei,'Resume moved to unrelated cards: '+x.e.title);resumes++;
}
console.log(JSON.stringify({removedCards:prune.cards,removedHeadwords:drop.size,cards:cur.cards.size,exercises:cur.flat.length,
 prunedExercises:pruned,untouchedExercises:untouched,incompleteCases:incomplete,resumes,savedIds:'stable'}));
