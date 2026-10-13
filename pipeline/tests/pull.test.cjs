'use strict';
// 26.10.13 3000급 채우기(PRINCIPLES 2-8): 26~45세트의 Oxford 3000 A1~B1 기초어 카드를 9~25세트 끝 주제 연습으로 당겼다.
// 배포판(plan.base)의 게임 코드·DATA와 비교해, 모아둔 카드·완료 기록·이어하기(배포판과 그 전 옛 판 저장)가 그대로 이어지는지 본다.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const plan=JSON.parse(read('pipeline/pull-20261013/plan.json'));
const git=f=>execFileSync('git',['show',`${plan.base}:${f}`],{cwd:root,encoding:'utf8',maxBuffer:1<<28});
const {runtime,candidates}=require('../set0-20261010/carry.cjs');
const {hash,reverse}=require('../claude-review-20261008/ledger-lib.cjs');
const {LAYERS}=require('../claude-review-20261008/restore.cjs');
const dataOf=h=>JSON.parse(h.match(/^const DATA = (\[.*\]);\s*$/m)[1]);
const oldHtml=git('vocagoyangfable.html'),html=read('vocagoyangfable.html');
// 이 원장보다 나중에 쌓인 원장은 먼저 되돌려 당긴 직후 상태를 본다.
let now=dataOf(html);
const layer=LAYERS.find(L=>L.name==='pull-20261013');assert(layer,'Pull ledger must be in the restore chain');
for(const L of LAYERS){if(L===layer)break;const s=L.snapshots.DATA;assert.equal(hash(now),s.afterHash,'Unlogged change after '+L.name);now=reverse(now,s.changes,s.keyOrders);}
assert.equal(hash(now),layer.snapshots.DATA.afterHash,'Unlogged change after the pull');
assert.equal(hash(reverse(now,layer.snapshots.DATA.changes,layer.snapshots.DATA.keyOrders)),hash(dataOf(oldHtml)),'The pull ledger undoes to the deployed DATA');
const old=runtime(oldHtml,git('pipeline/saved-cards/runtime.js'),dataOf(oldHtml));
const cur=runtime(html,read('pipeline/saved-cards/runtime.js'),now);
const title=x=>x.L.id+'|'+x.e.title;
const moved=new Map(plan.moves.flatMap(m=>m.cards.map(c=>[c.savedId,m])));

// 1. 배포판의 모아둔 카드 ID는 모두 그대로 찾아진다. 옮긴 카드만 세트가 바뀌고 정한 새 연습에 있다. 새 카드는 없다.
let stayed=0;
for(const [id,p] of old.cards){
 const x=cur.cards.get(id);assert(x,'Saved ID changed or card lost: '+p.w.word);
 const m=moved.get(id);
 if(m){assert(p.L.lesson>=26&&p.L.lesson<=45);assert.equal(x.L.lesson,m.to);assert.equal(x.e.sourceTitle||x.e.title,`Exercise ${m.ex} · ${m.name}`,'Moved card in the planned exercise: '+p.w.word);}
 else{assert.equal(x.L.lesson,p.L.lesson,'Card left its set: '+p.w.word);stayed++;}
}
assert.equal(moved.size,plan.moves.reduce((n,m)=>n+m.cards.length,0));assert.equal(stayed,old.cards.size-moved.size);
assert.equal(cur.cards.size,old.cards.size,'No card added or lost');
const reload=runtime(html,read('pipeline/saved-cards/runtime.js'),dataOf(html),{'test-progress-saved-cards-v1':JSON.stringify([...old.cards.keys()].map((id,i)=>({id,addedAt:i+1})))});
assert.equal(reload.ctx.savedItems().length,old.cards.size,'Every saved card still resolves in the current game');

// 2. 카드가 빠진 연습과 새 연습 밖에서는 연습 제목과 기록 키가 그대로다.
const losing=new Set(plan.deployed.map(d=>d.set+'|'+d.ex)),destinations=new Set(plan.moves.map(m=>m.to+'|'+m.ex));
const affected=x=>losing.has(x.L.lesson+'|'+x.e.ex)||destinations.has(x.L.lesson+'|'+x.e.ex);
const oldByTitle=new Map(old.flat.map(x=>[title(x),x]));let untouched=0;
for(const x of cur.flat.filter(x=>!affected(x))){const p=oldByTitle.get(title(x));assert(p,'Exercise vanished: '+title(x));assert.deepEqual(cur.key(x),old.key(p));untouched++;}
assert.equal(new Set(cur.flat.filter(x=>destinations.has(x.L.lesson+'|'+x.e.ex)).map(x=>x.L.lesson)).size,17,'One new exercise in each of sets 9-25');

// 3. 완료 기록: 배포판 기록이 카드를 모두 덮으면 완료, 하나라도 빠지면 미완료.
const setProgress=keys=>{cur.state.progress={};for(const k of keys){const [id,t]=typeof k==='string'?JSON.parse(k):k;(cur.state.progress[id]||={})[t]={completed:true};}};
setProgress(old.flat.map(x=>JSON.stringify(old.key(x))));
assert.equal(cur.ctx.clearedExercises(true),cur.flat.length,'A fully completed deployed pool stays completed');
let checked=0,incomplete=0;
for(const x of cur.flat.filter(affected)){
 const required=[...new Set(x.e.words.map(w=>JSON.stringify(old.key(old.cards.get(w.savedCardId)))))];
 setProgress(required);assert(cur.ctx.getRec(x.L.id,x.e.title)?.completed,'Completion carry: '+title(x));checked++;
 for(const missing of required.slice(0,3)){setProgress(required.filter(k=>k!==missing));assert(!cur.ctx.getRec(x.L.id,x.e.title)?.completed,'Partial coverage completed '+title(x));incomplete++;}
}
cur.state.progress={};

// 4. 이어하기: 배포판 저장(prune "20261012")과 그 전 옛 판 저장 모두, 카드가 빠진 연습은 그 판의 첫 카드부터
//    같은 세트에 남은 첫 카드가 있는 연습으로, 나머지는 같은 연습으로 돌아온다.
const sets=[...new Set([...plan.deployed.map(d=>d.set),...plan.moves.map(m=>m.to)])];
const destLesson=w=>cur.cards.get(w.savedCardId).L.lesson;
const deployedSaves=old.flat.filter(x=>sets.includes(x.L.lesson)).map(x=>({lid:x.L.id,title:x.e.title,layout:'placement-v1',prune:'20261012'}));
let resumes=0,remapped=0;
for(const c of [...candidates(old,sets),...deployedSaves]){
 const t=old.pick(c),a=cur.pick(c);
 if(!t){assert.equal(a,null,'Unknown old save now resolves: '+JSON.stringify(c));continue;}
 resumes++;
 if(!losing.has(t.L.lesson+'|'+t.e.ex)){assert(a&&title(a)===title(t),'Untouched resume moved: '+JSON.stringify(c)+' -> '+(a&&title(a)));continue;}
 const rest=old.flat.slice(old.flat.findIndex(x=>x.L===t.L&&x.e===t.e)).filter(x=>x.L===t.L).flatMap(x=>x.e.words);
 const anchor=rest.find(w=>destLesson(w)===t.L.lesson),expected=cur.cards.get(anchor.savedCardId);
 assert(a&&a.li===expected.li&&a.ei===expected.ei,`Resume went elsewhere: ${JSON.stringify(c)} -> ${a&&title(a)} (expected ${title(expected)})`);remapped++;
}
// 5. 바꾼 뒤에 저장한 이어하기는 그 판으로 돌아온다.
for(const x of cur.flat){
 cur.state.progress={};cur.ctx.saveLast(x.L.id,x.e.title);
 const a=cur.ctx.resumeTarget();assert(a&&a.L.id===x.L.id&&a.e.title===x.e.title,'New save resumed elsewhere: '+title(x));
}
console.log(JSON.stringify({moved:moved.size,destinations:plan.moves.length,losingExercises:losing.size,untouched,completionChecks:checked,incompleteCases:incomplete,resumes,remapped,savedIds:'stable'}));
