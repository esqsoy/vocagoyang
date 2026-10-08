'use strict';
// 외운 단어 돌파 축하: 교재 합집합(중복 제외) 수, 1,000 단위 문턱, 업데이트 전 학생의 한 번 축하, 복습 판 제외, 엔딩 순서.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {harness,root}=require('./helpers/mother-tongue-harness.cjs');
const KEY='goyang-learned-words-v1',SEEN='goyang-milestone-v1';
const COURSES=[['vocagoyangfable.html','fable'],['vocagoyangksat2027.html','ksat'],['vocagoyangebs2027.html','ebs']];
const head=c=>(c.word??c.en).normalize('NFC').trim().replace(/\s+/gu,' ').toLowerCase();   // index-stats.cjs와 같은 규칙
const dataHeads=file=>{const html=fs.readFileSync(path.join(root,file),'utf8');const D=JSON.parse(html.match(/^const DATA\s*=\s*(\[[^\r\n]*\]);[ \t]*\r?$/m)[1]);
  return new Set(D.flatMap(L=>L.exercises.flatMap(e=>e.words)).map(head));};
const clearAll=h=>h.state.lessons.forEach(L=>L.exercises.forEach(e=>h.ctx.setRec(L.id,e.title,{timeMs:1})));

// 1) 교재별 표제어 수와 교재 합집합이 선택 화면(index-stats)의 계산과 같다.
let carry={},union=new Set();
for(const [file,id] of COURSES){
  const h=harness(path.join(root,file),carry);
  assert.equal(h.run('MS_COURSE'),id);
  clearAll(h);const total=h.ctx.msSync().size;
  const own=dataHeads(file);own.forEach(k=>union.add(k));
  assert.equal(JSON.parse(h.storage.get(KEY))[id].length,own.size,id+': 교재 표제어 수');
  assert.equal(total,union.size,id+': 앞 교재와 겹치는 단어는 한 번만 센다');
  carry={[KEY]:h.storage.get(KEY)};
}
assert.equal(union.size,8309,'세 교재 합집합(중복 제외)');

// 2) 처음 여는 학생은 아무것도 쓰지 않는다.
{const h=harness(path.join(root,'vocagoyangfable.html'));assert(!h.storage.has(KEY));assert(!h.storage.has(SEEN));}

// 3) 차례로 클리어하면 1,000·2,000에서 한 번씩만 띄운다.
let progressAt2500=null;
{
  const h=harness(path.join(root,'vocagoyangfable.html')),shows=[];
  h.ctx.msShow=info=>{shows.push(info);h.run('msBusy=false');};
  const order=h.state.lessons.flatMap(L=>L.exercises.map(e=>[L.id,e.title]));
  for(const [lid,title] of order){
    const before=h.run('msUnion(msRead()).size');
    h.ctx.setRec(lid,title,{timeMs:1});h.ctx.msAfterClear(before);h.advance(1000);
    if(h.run('msUnion(msRead()).size')>=2500){progressAt2500=h.storage.get(h.run('STORAGE'));break;}
  }
  assert.deepEqual(shows.map(s=>[s.m,s.retro]),[[1000,false],[2000,false]]);
  assert(shows.every(s=>s.total>=s.m&&s.total<s.m+300),'문턱을 넘은 그 판에서 띄운다');
  assert.equal(JSON.parse(h.storage.get(SEEN)).seen,2000);
  const before=h.run('msUnion(msRead()).size');h.ctx.msAfterClear(before);h.advance(1000);
  assert.equal(shows.length,2,'같은 문턱은 다시 띄우지 않는다');
}

// 4) 업데이트 전에 이미 넘은 학생: 첫 클리어 때 가장 큰 문턱 하나만, '어느새' 대사로.
{
  const h=harness(path.join(root,'vocagoyangfable.html'),{['goyang-hoe-seoul-v1']:progressAt2500}),shows=[];
  assert.equal(h.run('STORAGE'),'goyang-hoe-seoul-v1');
  assert(h.run('msUnion(msRead()).size')>=2500,'열 때 이 교재 몫을 적어 둔다');
  h.ctx.msShow=info=>{shows.push(info);h.run('msBusy=false');};
  const before=h.run('msUnion(msRead()).size');h.ctx.msAfterClear(before);h.advance(1000);
  assert.deepEqual(shows.map(s=>[s.m,s.retro]),[[2000,true]]);
  assert.match(h.ctx.msLine(2000,true),/2,000단어/);
  h.ctx.msAfterClear(h.run('msUnion(msRead()).size'));h.advance(1000);
  assert.equal(shows.length,1,'지나간 1,000은 따로 띄우지 않는다');
}

// 5) '틀린 것만'과 모아둔 카드 복습은 세지 않는다. 정규 클리어만 확인한다.
{
  const h=harness(path.join(root,'vocagoyangksat2027.html')),calls=[];
  h.ctx.msOrigFinish=()=>'orig';h.ctx.msAfterClear=b=>calls.push(b);
  for(const [session,count] of [[{partial:true,lesson:{}},0],[{partial:false,lesson:{kind:'saved'}},0],[{partial:false,lesson:{kind:'lesson'}},1]]){
    h.state.session=session;assert.equal(h.ctx.finishExercise(),'orig');assert.equal(calls.length,count);
  }
}

// 6) 축하가 떠 있으면 엔딩은 닫은 뒤에 이어서 연다. 퍼펙트 포효가 떠 있으면 축하는 그 뒤에 연다.
{
  const h=harness(path.join(root,'vocagoyangebs2027.html'));let endings=0;const shows=[];
  h.ctx.msOrigEnding=()=>endings++;
  h.run('msBusy=true');h.ctx.showEnding();assert.equal(endings,0);assert.equal(h.run('msPendingEnding'),true);
  h.ctx.msClose();assert.equal(endings,1);assert.equal(h.run('msBusy'),false);
  h.ctx.showEnding();assert.equal(endings,2,'축하가 없으면 엔딩은 그대로');
  const roar=h.els.get('roar');roar.classList.add('show');h.ctx.msShow=info=>shows.push(info);
  h.ctx.msQueue({m:1000,total:1000,retro:false,words:[]});h.advance(1500);assert.equal(shows.length,0);
  roar.classList.remove('show');h.advance(300);assert.equal(shows.length,1);
}

// 7) 실제 화면 함수(동작 줄이기 경로)와 저장소 거부는 오류 없이 지나간다.
{
  const h=harness(path.join(root,'vocagoyangfable.html'));
  assert.doesNotThrow(()=>h.ctx.msShow({m:3000,total:3012,retro:false,words:['apple']}));
  assert(h.doc.body.children.some(c=>c.id==='msFx'));
  h.ctx.msClose();assert(!h.doc.body.children.some(c=>c.id==='msFx'));assert.equal(h.run('msBusy'),false);
  h.ctx.localStorage.setItem=()=>{throw Error('blocked');};clearAll(h);
  assert.doesNotThrow(()=>h.ctx.msAfterClear(0));
}

// 8) 주소 끝 #milestone=2000은 저장하지 않고 연출만 보여 준다.
{
  const h=harness(path.join(root,'vocagoyangfable.html')),shows=[];h.ctx.msShow=info=>shows.push(info);
  h.run("location.hash='#milestone=2000'");assert.equal(h.ctx.msPreview(),true);h.advance(700);
  assert.deepEqual(shows.map(s=>[s.m,s.preview,s.words.length>=2000]),[[2000,true,true]]);
  assert(!h.storage.has(SEEN));
}

// 9) 문턱이 높을수록 유성우가 길고 연출이 화려하다(영신: "갈수록 더 길게", "1000개나 외웠는데 좀 길어도").
{
  const h=harness(path.join(root,'vocagoyangfable.html')),P=[1000,2000,3000,4000].map(m=>h.ctx.msPlan(m));
  assert.equal(P[0].T,5400,'1,000은 약 5.4초 동안 센다');
  for(let i=1;i<P.length;i++){assert(P[i].T>P[i-1].T);assert(P[i].shells>P[i-1].shells);assert(P[i].rings>P[i-1].rings);assert(P[i].rays>P[i-1].rays);}
  assert.equal(P[0].rain,0);assert(P[1].rain>0,'2,000부터 금빛 비');
  assert(h.ctx.msPlan(8000).T<=15000,'가장 길어도 15초');
}

// 10) 세 HTML의 삽입 구간이 원본(runtime.js·style.css)과 같다.
cp.execFileSync(process.execPath,[path.join(root,'pipeline/milestones/build.cjs'),'--check'],{stdio:'pipe'});
console.log('PASS milestones: 세 교재 합집합 8,309, 1,000 단위 한 번씩, 업데이트 전 학생은 가장 큰 문턱 한 번, 복습 판 제외, 엔딩·포효 순서, 미리 보기 저장 없음, 문턱마다 길고 화려하게');
