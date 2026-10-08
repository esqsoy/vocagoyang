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

// 1-2) 날아오는 단어는 배운 순서대로다: 교재 안에서는 세트·연습 순서, 교재 사이는 FABLE → 마더텅 → EBS.
{
  const h=harness(path.join(root,'vocagoyangfable.html')),L=h.state.lessons[0],e=L.exercises[0];
  h.ctx.setRec(L.id,e.title,{timeMs:1});const mine=[...new Set(e.words.map(w=>head(w.word?w:{en:w.term})))];
  assert.deepEqual([...h.ctx.msSync()],mine,'첫 연습의 단어가 카드 순서 그대로');
  assert.deepEqual([...h.ctx.msUnion({ebs:['zeta','alpha'],ksat:['beta','alpha'],fable:['gamma']})],['gamma','beta','alpha','zeta']);
  const before=h.run('msUnion(msRead()).size');h.ctx.setRec(L.id,L.exercises[1].title,{timeMs:1});
  assert.deepEqual([...h.ctx.msSync()].slice(0,mine.length),mine,'나중에 클리어한 연습은 뒤에 붙는다');assert(h.run('msUnion(msRead()).size')>before);
}

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
  h.run("location.hash='#milestone=1000&fx=warp'");h.ctx.msPreview();h.advance(700);
  assert.deepEqual(shows.map(s=>s.mode),[undefined,'warp'],'&fx=warp로 다가오는 단어(B) 후보를 미리 본다');
  assert.equal(h.run('msMode'),'warp','정식 축하는 저 멀리에서 날아오는 단어(far to near)');
}

// 9) 문턱이 높을수록 유성우가 길고 연출이 화려하다(영신: "갈수록 더 길게", "1000개나 외웠는데 좀 길어도").
{
  const h=harness(path.join(root,'vocagoyangfable.html')),P=[1000,2000,3000,4000].map(m=>h.ctx.msPlan(m));
  assert.equal(P[0].T,6000,'1,000은 첫 6단어 뒤 약 6초 동안 센다');assert.deepEqual([P[0].intro,P[0].introGap],[6,420],'처음 6단어는 0.42초 간격으로 하나씩');
  for(let i=1;i<P.length;i++){assert(P[i].T>P[i-1].T);assert(P[i].shells>P[i-1].shells);assert(P[i].rings>P[i-1].rings);assert(P[i].rays>P[i-1].rays);}
  assert.equal(P[0].rain,0);assert(P[1].rain>0,'2,000부터 금빛 비');
  assert(h.ctx.msPlan(8000).T<=15000,'가장 길어도 15초');
}

// 10) 틀렸던 단어 기록: 판이 끝나거나 중간에 나갈 때, 판마다 한 번씩 표제어로 센다(정규·틀린 것만·모아둔 카드 모두).
{
  const h=harness(path.join(root,'vocagoyangksat2027.html'));h.ctx.msOrigFinish=()=>'orig';h.ctx.msAfterClear=()=>{};
  const words=[{term:'Apple',wrongEver:true},{term:'pear',wrongEver:false},{term:'apple',wrongEver:true}];
  h.state.session={partial:true,lesson:{},words};h.ctx.finishExercise();h.ctx.finishExercise();
  assert.deepEqual(JSON.parse(h.storage.get('goyang-missed-words-v1')),{apple:1},'같은 판은 한 번, 표제어 기준');
  h.state.session={partial:false,lesson:{kind:'saved'},words:[{term:'apple',wrongEver:true},{term:'stone',wrongEver:true}]};
  h.ctx.show('lesson');
  assert.deepEqual(JSON.parse(h.storage.get('goyang-missed-words-v1')),{apple:2,stone:1},'중간에 나가도 남는다');
  h.ctx.show('game');assert.equal(JSON.parse(h.storage.get('goyang-missed-words-v1')).stone,1,'게임 화면으로 갈 때는 세지 않는다');
}

// 11) 단어 벽은 1,000·2,000·4,000단어를 한 화면(393·320px)에 배운 순서대로, 줄을 넘치지 않게 깐다.
{
  const h=harness(path.join(root,'vocagoyangfable.html')),words=h.ctx.msPreviewWords(4000),measure=(t,fs)=>t.length*fs*.56;
  for(const [W,H] of [[393,852],[320,640]])for(const n of [1000,2000,4000]){
    const lay=h.ctx.msWallLayout(words.slice(0,n),W,H,measure);
    assert(lay.rows*lay.lh<=H,`${n}단어 ${W}px: 화면 안`);assert(lay.fs>=2.4);
    assert(lay.slots.every((s,i)=>s&&s.x>=0&&s.x+s.w<=W+.5),`${n}단어 ${W}px: 가로로 넘치지 않음`);
    assert(lay.slots.every((s,i)=>i===0||s.y>lay.slots[i-1].y||(s.y===lay.slots[i-1].y&&s.x>lay.slots[i-1].x)),'배운 순서대로 왼쪽 위부터');
  }
  assert(h.ctx.msWallLayout(words.slice(0,1000),393,852,measure).fs>=7,'1,000단어는 8px 남짓');
}

// 12) 화면 문구: '외운'이 아니라 '익힌' 단어(영신).
{
  const h=harness(path.join(root,'vocagoyangebs2027.html'));h.ctx.msShow({m:1000,total:1003,retro:false,words:['a','b'],missed:['a']});
  const fx=h.doc.body.children.find(c=>c.id==='msFx'),inner=fx.children.find(c=>c.className==='ms-inner');
  assert.equal(inner.children[0].innerHTML,'익힌 단어');assert.match(inner.children.find(c=>c.className==='ms-sub').innerHTML,/금빛 1개는 한 번 틀렸다가/);
  h.ctx.msClose();
}

// 13) 세 HTML의 삽입 구간이 원본(runtime.js·style.css)과 같다.
cp.execFileSync(process.execPath,[path.join(root,'pipeline/milestones/build.cjs'),'--check'],{stdio:'pipe'});
console.log('PASS milestones: 세 교재 합집합 8,309, 1,000 단위 한 번씩, 업데이트 전 학생은 가장 큰 문턱 한 번, 복습 판 제외, 엔딩·포효 순서, 미리 보기 저장 없음, 문턱마다 길고 화려하게, 틀린 단어 기록, 단어 벽 배치, 익힌 단어');
