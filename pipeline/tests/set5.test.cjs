'use strict';
// 26.10.12 5세트 문법 뜻 분산(PRINCIPLES 12): 5세트의 문법 뜻 카드 11장을 14·17·21·25세트 끝 새 연습으로 보냈다.
// 배포판(plan.base)의 게임 코드·DATA와 비교해, 모아둔 카드·완료 기록·이어하기(배포 전 옛 판과 배포판 둘 다)가 그대로 이어지는지 본다.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const plan=JSON.parse(read('pipeline/set5-20261012/plan.json'));
const git=f=>execFileSync('git',['show',`${plan.base}:${f}`],{cwd:root,encoding:'utf8',maxBuffer:1<<28});
const {runtime,candidates,LAYOUTS}=require('../set0-20261010/carry.cjs');
const dataOf=h=>JSON.parse(h.match(/^const DATA = (\[.*\]);\s*$/m)[1]);
const oldHtml=git('vocagoyangfable.html'),html=read('vocagoyangfable.html');
const old=runtime(oldHtml,git('pipeline/saved-cards/runtime.js'),dataOf(oldHtml));
// 26.10.13: 이 검사는 fable-review-20261013까지의 판을 본다. 그 뒤 원장(3000급 채우기 pull-20261013 등)은 먼저 되돌린다.
// 그 원장들의 진도·모아둔 카드 이어받기는 각자의 검사(pull.test.cjs 등)가 본다.
const {hash,reverse}=require('../claude-review-20261008/ledger-lib.cjs');
const {LAYERS}=require('../claude-review-20261008/restore.cjs');
let now=dataOf(html);
for(const L of LAYERS){if(L.name==='fable-review-20261013')break;const s=L.snapshots.DATA;assert.equal(hash(now),s.afterHash,'Unlogged change after '+L.name);now=reverse(now,s.changes,s.keyOrders);}
const cur=runtime(html,read('pipeline/saved-cards/runtime.js'),now);
const title=x=>x.L.id+'|'+x.e.title;
const moved=new Map(plan.moves.flatMap(m=>m.cards.map(c=>[c.savedId,m])));

// 1. 배포판의 모아둔 카드 ID는 모두 그대로 찾아진다. 옮긴 11장만 세트가 바뀌고 정한 새 연습에 있다.
let stayed=0;
for(const [id,p] of old.cards){
 const x=cur.cards.get(id);assert(x,'Saved ID changed or card lost: '+p.w.word);
 const m=moved.get(id);
 if(m){assert.equal(p.L.lesson,5);assert.equal(x.L.lesson,m.to);assert.equal(x.e.sourceTitle,`Exercise ${m.ex} · ${m.name}`,'Moved card in the planned exercise');}
 else{assert.equal(x.L.lesson,p.L.lesson,'Card left its set: '+p.w.word);stayed++;}
}
assert.equal(moved.size,11);assert.equal(stayed,old.cards.size-11);
const fresh=[...cur.cards.values()].filter(x=>!old.cards.has(x.w.savedCardId)).map(x=>x.w.word+'|'+x.w.si);
assert.deepEqual(fresh,['prime|2'],'Only cards added after the deployed release are new');
const reload=runtime(html,read('pipeline/saved-cards/runtime.js'),dataOf(html),{'test-progress-saved-cards-v1':JSON.stringify([...old.cards.keys()].map((id,i)=>({id,addedAt:i+1})))});
assert.equal(reload.ctx.savedItems().length,old.cards.size,'Every saved card still resolves');

// 2. 카드가 빠진 5세트 연습(1~6)과 새 연습 밖에서는 연습 제목과 기록 키가 그대로다.
const losing=new Set(plan.deployed.map(d=>'5|'+d.ex)),destinations=new Set(plan.moves.map(m=>m.to+'|'+m.ex));
const affected=x=>losing.has(x.L.lesson+'|'+x.e.ex)||destinations.has(x.L.lesson+'|'+x.e.ex);
const oldByTitle=new Map(old.flat.map(x=>[title(x),x]));let untouched=0;
for(const x of cur.flat.filter(x=>!affected(x))){const p=oldByTitle.get(title(x));assert(p,'Exercise vanished: '+title(x));assert.deepEqual(cur.key(x),old.key(p));untouched++;}
assert.equal(cur.flat.filter(x=>destinations.has(x.L.lesson+'|'+x.e.ex)).length,4,'One new exercise per destination');

// 3. 완료 기록: 배포판 기록이 카드를 모두 덮으면 완료, 하나라도 빠지면 미완료. 배포 전 가장 옛 판의 기록으로도 이어진다.
const setProgress=keys=>{cur.state.progress={};for(const k of keys){const [id,t]=typeof k==='string'?JSON.parse(k):k;(cur.state.progress[id]||={})[t]={completed:true};}};
setProgress(old.flat.map(x=>JSON.stringify(old.key(x))));
// 배포 뒤 제자리에 더한 카드(41세트 prime ②)는 그 연습의 완료 기록이 그대로 덮는다(연습에 카드를 더해도 제목·기록은 그대로).
assert.equal(cur.ctx.clearedExercises(),cur.flat.length,'A fully completed deployed pool stays completed');
let checked=0,incomplete=0,older=0;
for(const x of cur.flat.filter(affected)){
 const required=[...new Set(x.e.words.map(w=>JSON.stringify(old.key(old.cards.get(w.savedCardId)))))];
 setProgress(required);assert(cur.ctx.getRec(x.L.id,x.e.title)?.completed,'Completion carry: '+title(x));checked++;
 for(const missing of required){setProgress(required.filter(k=>k!==missing));assert(!cur.ctx.getRec(x.L.id,x.e.title)?.completed,'Partial coverage completed '+title(x));incomplete++;}
 setProgress(x.e.words.map(w=>{const p=old.cards.get(w.savedCardId),keys=[old.key(p),...(p.e.priorCoverage?.[p.i]||[]).map(k=>[k.id,k.title]),...(p.e.parentRecord?[[p.e.parentRecord.id,p.e.parentRecord.title]]:[])];return keys.at(-1);}));
 assert(cur.ctx.getRec(x.L.id,x.e.title)?.completed,'Older-layout completion carry: '+title(x));older++;
}
cur.state.progress={};

// 4. 이어하기: 배포 전 옛 판 저장(prune 표시 없음)과 배포판 저장(prune "20261010") 모두,
//    5세트 카드가 빠진 연습은 그 판의 첫 카드부터 5세트에 남은 첫 카드가 있는 연습으로, 나머지는 같은 연습으로 돌아온다.
const destLesson=w=>cur.cards.get(w.savedCardId).L.lesson;
const deployedSaves=old.flat.filter(x=>[5,...plan.moves.map(m=>m.to)].includes(x.L.lesson)).map(x=>({lid:x.L.id,title:x.e.title,layout:'placement-v1',prune:'20261010'}));
let resumes=0,remapped=0;
for(const c of [...candidates(old,[5,...plan.moves.map(m=>m.to)]),...deployedSaves]){
 const t=old.pick(c),a=cur.pick(c);
 if(!t){assert.equal(a,null,'Unknown old save now resolves: '+JSON.stringify(c));continue;}
 resumes++;
 if(t.L.lesson!==5||!losing.has('5|'+t.e.ex)){assert(a&&title(a)===title(t),'Untouched resume moved: '+JSON.stringify(c));continue;}
 const rest=old.flat.slice(old.flat.findIndex(x=>x.L===t.L&&x.e===t.e)).filter(x=>x.L===t.L).flatMap(x=>x.e.words);
 const anchor=rest.find(w=>destLesson(w)===5),expected=cur.cards.get(anchor.savedCardId);
 assert(a&&a.li===expected.li&&a.ei===expected.ei,`Resume went elsewhere: ${JSON.stringify(c)} -> ${a&&title(a)} (expected ${title(expected)})`);remapped++;
}
// 5. 바꾼 뒤에 저장한 이어하기는 그 판으로 돌아온다.
for(const x of cur.flat){
 cur.state.progress={};cur.ctx.saveLast(x.L.id,x.e.title);
 const a=cur.ctx.resumeTarget();assert(a&&a.L.id===x.L.id&&a.e.title===x.e.title,'New save resumed elsewhere: '+title(x));
}
console.log(JSON.stringify({moved:moved.size,destinations:[...destinations],untouched,completionChecks:checked,incompleteCases:incomplete,olderLayoutCarry:older,resumes,remapped,savedIds:'stable'}));
