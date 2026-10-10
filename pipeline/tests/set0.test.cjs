'use strict';
// 26.10.10 0세트 재구성(PRINCIPLES 12): 0세트를 문법 순서 23연습으로 다시 묶고 5세트 38장·1세트 1장을 옮겨 오고 새 카드 3장을 더했다.
// 카드 내용은 초안대로, 모아둔 카드·완료 기록·이어하기는 바꾸기 전 판에서 그대로 이어지는지 본다.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const html=read('vocagoyangfable.html'),savedRuntime=read('pipeline/saved-cards/runtime.js');
const plan=JSON.parse(read('pipeline/set0-20261010/plan.json')),draft=JSON.parse(read(plan.draft));
const {hash,reverse}=require('../claude-review-20261008/ledger-lib.cjs');
const {LAYERS}=require('../claude-review-20261008/restore.cjs');
const {runtime,candidates}=require('../set0-20261010/carry.cjs');
// 이 층보다 나중에 쌓인 원장만 먼저 되돌려 재구성 직후 상태를 얻는다.
let now=JSON.parse(html.match(/^const DATA = (\[.*\]);\s*$/m)[1]);
const layer=LAYERS.find(L=>L.name==='set0-20261010');assert(layer,'set-0 ledger must be in the restore chain');
for(const L of LAYERS){if(L===layer)break;const s=L.snapshots.DATA;if(hash(now)===s.afterHash)now=reverse(now,s.changes,s.keyOrders);}
assert.equal(hash(now),layer.snapshots.DATA.afterHash,'Unlogged change after the set-0 rebuild');
const before=reverse(now,layer.snapshots.DATA.changes,layer.snapshots.DATA.keyOrders);
assert.equal(hash(before),layer.snapshots.DATA.beforeHash);
const old=runtime(html,savedRuntime,before),cur=runtime(html,savedRuntime,now);
const title=x=>x.L.id+'|'+x.e.title;

// 1. 새 0세트는 초안 그대로(23연습·234장, 순서·예문·해석·해설). 다른 카드는 그대로 남고 새 카드는 3장뿐이다.
const set0=cur.flat.filter(x=>x.L.lesson===0);
assert.deepEqual(set0.map(x=>x.e.title),draft.exercises.map(E=>`Exercise ${E.no} · ${E.name}`));
for(const [i,E] of draft.exercises.entries())assert.deepEqual(set0[i].e.words.map(w=>[w.word,w.si,w.ex,w.tr,w.c]),E.cards.map(c=>[c.word,c.si,c.ex,c.tr,c.c]));
const fresh=[...cur.cards.values()].filter(x=>!old.cards.has(x.w.savedCardId));
assert.deepEqual(fresh.map(x=>x.w.word).sort(),['because of','ice cream','no one']);
assert.equal(cur.cards.size,old.cards.size+3);
const drafted=new Map(draft.exercises.flatMap(E=>E.cards.map(c=>[c.word+'|'+c.si,c])));
const carried=['savedCardId','savedId','priorKeys','resumeFrom'],clean=(w,ex)=>{const c={...w};for(const k of carried)delete c[k];if(ex)Object.assign(c,ex);return JSON.stringify(c);};
let moved=0,edited=0;
for(const [id,p] of old.cards){
 const x=cur.cards.get(id);assert(x,'Saved ID changed or card lost: '+p.w.word);
 const d=x.L.lesson===0?drafted.get(x.w.word+'|'+x.w.si):null;
 if(x.L.lesson===0)assert(d,'Unexpected card in set 0: '+x.w.word);else assert.equal(x.L.lesson,p.L.lesson,'Card left its set: '+x.w.word);
 if(d&&d.changed.length)edited++;
 if(x.L.lesson!==p.L.lesson)moved++;
 assert.equal(clean(x.w),clean(p.w,d?{ex:d.ex,tr:d.tr,c:d.c}:null),'Only drafted fields may change: '+x.w.word);
}
assert.equal(moved,39);assert.equal(edited,68);
const reload=runtime(html,savedRuntime,now,{'test-progress-saved-cards-v1':JSON.stringify([...old.cards.keys()].map((id,i)=>({id,addedAt:i+1})))});
assert.equal(reload.ctx.savedItems().length,old.cards.size,'Every saved card still resolves');

// 2. 0세트와 카드가 빠진 1·5세트 연습 밖에서는 연습 제목과 기록 키가 그대로다.
const losing=new Set(plan.exercises.flatMap(E=>E.cards).filter(c=>c.lesson!==0&&!c.new).map(c=>{const p=old.cards.get(c.savedId);return p.L.lesson+'|'+p.e.ex;}));
const affected=x=>x.L.lesson===0||losing.has(x.L.lesson+'|'+x.e.ex);
const oldByTitle=new Map(old.flat.map(x=>[title(x),x]));let untouched=0;
for(const x of cur.flat.filter(x=>!affected(x))){const p=oldByTitle.get(title(x));assert(p,'Exercise vanished: '+title(x));assert.deepEqual(cur.key(x),old.key(p));untouched++;}
assert.equal(untouched+cur.flat.filter(affected).length,cur.flat.length);

// 3. 완료 기록: 바꾸기 전 판의 기록이 카드를 모두 덮으면 완료, 하나라도 빠지면 미완료. 새 카드가 든 연습은 새로 해야 한다.
const setProgress=keys=>{cur.state.progress={};for(const k of keys){const [id,t]=typeof k==='string'?JSON.parse(k):k;(cur.state.progress[id]||={})[t]={completed:true};}};
setProgress(old.flat.map(x=>JSON.stringify(old.key(x))));
const withNew=cur.flat.filter(x=>x.e.words.some(w=>!old.cards.has(w.savedCardId)));
assert.deepEqual(withNew.map(title),['0세트|Exercise 5 · 잇는 말과 묻는 말','0세트|Exercise 11 · 가족과 모두·아무도','0세트|Exercise 17 · 먹는 것']);
assert.equal(cur.ctx.clearedExercises(),cur.flat.length-withNew.length,'A fully completed pool stays completed except exercises with new cards');
let checked=0,incomplete=0,older=0;
for(const x of cur.flat.filter(affected)){
 const known=x.e.words.filter(w=>old.cards.has(w.savedCardId)),hasNew=known.length<x.e.words.length;
 const required=[...new Set(known.map(w=>JSON.stringify(old.key(old.cards.get(w.savedCardId)))))];
 setProgress(required);assert.equal(!!cur.ctx.getRec(x.L.id,x.e.title)?.completed,!hasNew,'Completion carry: '+title(x));checked++;
 if(hasNew){setProgress([...required,JSON.stringify(cur.key(x))]);assert(cur.ctx.getRec(x.L.id,x.e.title)?.completed);continue;}
 for(const missing of required){setProgress(required.filter(k=>k!==missing));assert(!cur.ctx.getRec(x.L.id,x.e.title)?.completed,'Partial coverage completed '+title(x));incomplete++;}
 // 더 옛 판의 기록(그 카드를 담았던 가장 오래된 기록)으로도 이어진다.
 setProgress(known.map(w=>{const p=old.cards.get(w.savedCardId),keys=[old.key(p),...(p.e.priorCoverage?.[p.i]||[]).map(k=>[k.id,k.title]),...(p.e.parentRecord?[[p.e.parentRecord.id,p.e.parentRecord.title]]:[])];return keys.at(-1);}));
 assert(cur.ctx.getRec(x.L.id,x.e.title)?.completed,'Older-layout completion carry: '+title(x));older++;
}
cur.state.progress={};

// 4. 바꾸기 전에 저장한 이어하기(모든 옛 판 이름): 0세트는 그 연습의 첫 카드가 간 새 연습으로,
//    1·5세트는 그 연습의 첫 카드부터 같은 세트에 남은 첫 카드가 있는 연습으로, 나머지는 같은 연습으로 돌아온다.
const destLesson=w=>cur.cards.get(w.savedCardId).L.lesson;
let resumes=0,remapped=0;
for(const c of candidates(old,[0,1,5])){
 const t=old.pick(c),a=cur.pick(c);
 if(!t){assert.equal(a,null,'Unknown old save now resolves: '+JSON.stringify(c));continue;}
 resumes++;
 if(!affected(t)){assert(a&&title(a)===title(t),'Untouched resume moved: '+JSON.stringify(c));continue;}
 const rest=old.flat.slice(old.flat.findIndex(x=>x.L===t.L&&x.e===t.e)).filter(x=>x.L===t.L).flatMap(x=>x.e.words);
 const anchor=rest.find(w=>destLesson(w)===t.L.lesson)||t.e.words[0],expected=cur.cards.get(anchor.savedCardId);
 assert(a&&a.li===expected.li&&a.ei===expected.ei,'Resume went elsewhere: '+JSON.stringify(c));remapped++;
}
// 5. 재구성 뒤에 저장한 이어하기는 그 판으로 돌아온다(옛 위치 표가 새 제목을 가로채지 않는다).
for(const x of cur.flat){
 cur.state.progress={};cur.ctx.saveLast(x.L.id,x.e.title);
 const a=cur.ctx.resumeTarget();assert(a&&a.L.id===x.L.id&&a.e.title===x.e.title,'New save resumed elsewhere: '+title(x));
}
console.log(JSON.stringify({set0Exercises:set0.length,set0Cards:set0.reduce((n,x)=>n+x.e.words.length,0),moved,edited,newCards:fresh.length,
 exercises:cur.flat.length,untouched,completionChecks:checked,incompleteCases:incomplete,olderLayoutCarry:older,resumes,remapped,savedIds:'stable'}));
