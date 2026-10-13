'use strict';
// 26.10.13 영신: FABLE은 앞 세트를 다 클리어해야 다음 세트가 나타난다(마더텅·EBS는 그대로).
// 1. 처음엔 0세트만 열리고, 한 세트를 다 클리어하면 바로 다음 세트가 열린다.
// 2. 한 연습이라도 클리어한 세트는 앞이 덜 끝났어도 열려 있다(업데이트 전에 건너뛰며 하던 학생이 잃지 않게).
// 3. 이어하기·다음 세트는 잠긴 세트로 가지 않는다. 옛 저장을 잇는 계산(resumeTarget·nextLessonIndex)은 그대로다.
// 4. #unlock(state.unlockAll)은 전부 연다. B1 범위에서도 같은 규칙이다.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {runtime}=require('../set0-20261010/carry.cjs');
const html=read('vocagoyangfable.html'),saved=read('pipeline/saved-cards/runtime.js');
const DATA=()=>JSON.parse(html.match(/^const DATA = (\[.*\]);\s*$/m)[1]);
const r=runtime(html,saved,DATA()),{ctx,state}=r;
const idx=n=>state.lessons.findIndex(L=>L.lesson===n),L=n=>state.lessons[idx(n)];
const clear=(n,only)=>ctx.visEx(L(n)).forEach((e,i)=>{if(only===undefined||only===i)ctx.setRec(L(n).id,e.title,{});});
const opened=()=>[...ctx.openSets()].filter(x=>x.kind!=='saved').map(x=>x.lesson);
assert.equal(state.unlockAll,false,'Locked by default (no #unlock)');

// 1. 처음엔 0세트만.
state.progress={};
assert.deepEqual(opened(),[0]);
assert.equal(ctx.nextLessonIndex(idx(0)),idx(1),'The resume chain still knows set 1 comes next');
assert.equal(ctx.openNextLessonIndex(idx(0)),-1,'but the next-set button waits until set 0 is cleared');
// 한 연습만 남기면 아직 잠겨 있고, 다 클리어하면 열린다.
ctx.visEx(L(0)).slice(0,-1).forEach(e=>ctx.setRec(L(0).id,e.title,{}));
assert.deepEqual(opened(),[0]);
clear(0);assert.deepEqual(opened(),[0,1]);assert.equal(ctx.openNextLessonIndex(idx(0)),idx(1));
for(let n=1;n<=10;n++)clear(n);
assert.deepEqual(opened(),[...Array(12).keys()],'Clearing sets 0-10 opens up to set 11');

// 2. 앞이 덜 끝나도 한 연습이라도 클리어한 세트는 열려 있다.
clear(30,0);assert.deepEqual(opened(),[...Array(12).keys(),30]);

// 3. 이어하기: 잠긴 세트(35, 클리어 없음)에 저장이 있으면 열린 세트의 첫 남은 연습으로 간다. 열린 세트 저장은 그대로다.
const at=(n,i)=>{const e=ctx.visEx(L(n))[i];r.storage.set('test-last',JSON.stringify({lid:L(n).id,title:e.title,layout:'placement-v1',prune:'20261013'}));};
at(35,2);assert.equal(ctx.resumeTarget().L.lesson,35,'The raw resume still finds the saved place');
let t=ctx.openResumeTarget();assert.equal(t.L.lesson,11);assert.equal(t.ei,0);
at(30,0);t=ctx.openResumeTarget();assert.equal(t.L.lesson,30,'A started set keeps its resume');assert.equal(t.ei,1);

// 4. #unlock은 전부 연다.
state.unlockAll=true;assert.equal(opened().length,state.lessons.filter(x=>x.kind!=='saved').length);
at(35,2);assert.equal(ctx.openResumeTarget().L.lesson,35);state.unlockAll=false;

// B1 범위도 같은 규칙: 0~25세트를 다 클리어하기 전에는 25세트까지도 순서대로만 열린다.
const b1=runtime(html,saved,DATA(),{'goyang-fable-level-v1':'B1'});b1.state.progress={};
assert.deepEqual([...b1.ctx.openSets()].map(x=>x.lesson),[0]);
console.log(`set-unlock: 처음 0세트만 · 한 세트 다 클리어하면 다음 세트 · 클리어가 있는 세트는 열림 · 잠긴 세트로 이어하지 않음 · #unlock · PASS`);
