'use strict';
// 26.10.13 영신: 권을 나누지 않고 메뉴 색과 B1/C1 버튼으로 구별한다. 세트·연습 이름의 단어 번호는 실제 순서로 다시 매긴다.
// (PRINCIPLES 2-8, UI_STANDARD '홈 제목과 이어하기')
// 1. 다시 매긴 번호는 0세트 1번부터 끊김 없이 이어지고, 기록 열쇠인 연습 제목(title)은 원본 이름을 그대로 쓴다.
// 2. B1이면 0~25세트만 진도·이어하기·다음 세트에 들어가고, C1(기본)과 엔딩 판정은 전부를 본다.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {runtime}=require('../set0-20261010/carry.cjs');
const html=read('vocagoyangfable.html'),saved=read('pipeline/saved-cards/runtime.js');
const DATA=()=>JSON.parse(html.match(/^const DATA = (\[.*\]);\s*$/m)[1]);
const RANGE=/(\d+)~(\d+)/;

// 1. 번호 다시 매기기
const c1=runtime(html,saved,DATA());
const lessons=c1.state.lessons.filter(L=>L.lesson<=45);
let next=1,numbered=0;
for(const L of lessons){
 const m=L.name.match(RANGE);assert(m,'Set name has a word range: '+L.id+' '+L.name);
 const a=+m[1],b=+m[2];
 assert.equal(a,next,`${L.id} starts right after the previous set`);assert(b>=a);
 let last=a-1;
 for(const e of L.exercises){
  const shown=e.displayTitle||e.title,r=shown.match(RANGE);
  if(!r)continue;
  numbered++;
  assert(+r[1]>last&&+r[2]<=b,`${L.id} ${shown} stays inside ${L.name} and goes forward`);last=+r[2];
 }
 next=b+1;
}
assert(numbered>400,'Most exercises carry a renumbered range');
assert.equal(c1.state.lessons.find(L=>L.lesson===46).name,DATA().find(L=>L.lesson===46).name,'Theme sets keep their names');
// 연습 제목(기록·이어하기·모아둔 카드의 열쇠)은 원본 연습 이름을 그대로 쓴다.
const source=new Map(DATA().map(L=>[L.lesson,new Set(L.exercises.map(e=>e.name))]));
for(const L of lessons)for(const e of L.exercises){
 const name=(e.title.split(' · ').slice(1).join(' · '));
 if(name&&RANGE.test(name))assert(source.get(L.lesson).has(name),'Record title keeps the source name: '+L.id+' '+e.title);
}

// 2. B1/C1 범위
const all=c1.ctx.totalExercises(true);
assert.equal(c1.state.levelB1,false,'C1 (everything) is the default');
assert.equal(c1.ctx.totalExercises(),all,'C1 counts every set');
const b1=runtime(html,saved,DATA(),{'goyang-fable-level-v1':'B1'});
assert.equal(b1.state.levelB1,true);
const inB1=b1.flat.filter(x=>x.L.lesson<=25).length;
assert.equal(b1.ctx.totalExercises(),inB1,'B1 counts sets 0-25 only');
assert.equal(b1.ctx.totalExercises(true),all,'The ending still needs every set');
assert(inB1>0&&inB1<all);
const i25=b1.state.lessons.findIndex(L=>L.lesson===25);
assert.equal(b1.ctx.nextLessonIndex(i25),-1,'No next set after 25 in B1');
assert.equal(c1.ctx.nextLessonIndex(i25),i25+1,'C1 goes on to 26');
// 이어하기: 26세트 뒤에 멈춘 학생이 B1을 켜면 0~25세트의 다음 미완료 연습으로 간다.
const at30=b1.flat.find(x=>x.L.lesson===30);
b1.storage.set('test-last',JSON.stringify({lid:at30.L.id,title:at30.e.title,layout:'placement-v1',prune:'20261012'}));
b1.state.progress={};
const t=b1.ctx.resumeTarget();
assert(t&&t.L.lesson<=25,'B1 resume stays inside sets 0-25');
c1.storage.set('test-last',JSON.stringify({lid:at30.L.id,title:at30.e.title,layout:'placement-v1',prune:'20261012'}));
c1.state.progress={};
assert.equal(c1.ctx.resumeTarget().L.lesson,30,'C1 resume returns to set 30');
console.log(`level-scope: ${lessons.length}세트 ${next-1}단어 번호, 연습 ${numbered}개 번호 · B1 ${inB1}/${all} 연습 · PASS`);
