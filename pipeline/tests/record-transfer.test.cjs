'use strict';
// 기록 옮기기 합치기 규칙: 지우지 않는다, 두 번 합쳐도 그대로다, 종류마다 맞는 쪽을 남긴다.
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const rt=require('../record-transfer/merge.js');
const J=JSON.stringify,P=s=>JSON.parse(s);

function fakeStore(obj){const keys=Object.keys(obj);return {length:keys.length,key:i=>keys[i],getItem:k=>obj[k]??null};}

// 모으기: goyang- 키만, 검사용 전체 열기는 뺀다. 같은 주소의 다른 게임(주기율표 zerotwo_) 키는 건드리지 않는다.
const col=rt.rtCollect(fakeStore({'goyang-hoe-seoul-v1':'{}','goyang-fable-unlock-v1':'1','zerotwo_save_v1':'x','tangogoyang-a':'y'}));
assert.deepEqual(Object.keys(col),['goyang-hoe-seoul-v1']);

// 파일 형식
const packed=J(rt.rtPack({'goyang-uni-v1':'서울대'},Date.UTC(2026,10,4)));
assert.deepEqual(rt.rtParse(packed).data,{'goyang-uni-v1':'서울대'});
assert.throws(()=>rt.rtParse('not json'),/깨졌다/);
assert.throws(()=>rt.rtParse(J({app:'other',v:1,data:{}})),/기록 파일이 아니라고양/);
assert.throws(()=>rt.rtParse(J({app:rt.RT_APP,v:rt.RT_VERSION+1,data:{}})),/새 판/);
assert.deepEqual(rt.rtParse(J({app:rt.RT_APP,v:1,data:{'goyang-a':'1','evil':'x','goyang-b':5,'goyang-fable-unlock-v1':'1'}})).data,{'goyang-a':'1'});

// 종류
assert.equal(rt.rtKind('goyang-hoe-seoul-v1'),'progress');
assert.equal(rt.rtKind('goyang-seoul-v1'),'progress');
assert.equal(rt.rtKind('goyang-ebs-seoul-v1'),'progress');
assert.equal(rt.rtKind('goyang-hoe-seoul-v1-saved-cards-v1'),'saved');
assert.equal(rt.rtKind('goyang-seoul-last-v1'),'keep');
assert.equal(rt.rtKind('goyang-pace-fable-v1'),'pace');
assert.equal(rt.rtKind('goyang-pace-meta-fable-v1'),'paceMeta');

// 진도: 한쪽이라도 클리어면 클리어, 둘 다면 이 기기 것 + 더 빠른 최고 시간
{
  const L={'goyang-seoul-v1':J({a:{e1:{completed:true,bestMs:5000,lastMs:6000},e2:{tries:1}}})};
  const I={'goyang-seoul-v1':J({a:{e1:{completed:true,bestMs:4000,lastMs:9000},e2:{completed:true,bestMs:7000},e3:{completed:true}},b:{x:{completed:true}}})};
  const m=rt.rtMerge(L,I),o=P(m.writes['goyang-seoul-v1']);
  assert.deepEqual(o.a.e1,{completed:true,bestMs:4000,lastMs:6000});
  assert.equal(o.a.e2.completed,true);assert.equal(o.a.e3.completed,true);assert.equal(o.b.x.completed,true);
  assert.equal(m.summary.exercises,3);
  // 이 기기가 더 빠르면 그대로
  assert.deepEqual(rt.rtMerge({'goyang-seoul-v1':J({a:{e1:{completed:true,bestMs:3000}}})},{'goyang-seoul-v1':J({a:{e1:{completed:true,bestMs:4000}}})}).writes,{});
  // 이 기기에 키가 없으면 통째로, 개수도 센다
  const n=rt.rtMerge({},{'goyang-hoe-seoul-v1':J({s0:{a:{completed:true},b:{completed:true}},s1:{c:{}}})});
  assert.equal(n.summary.exercises,2);
}
// 모아둔 카드: 합집합, 이 기기 순서 먼저, 담은 때는 이른 쪽
{
  const k='goyang-hoe-seoul-v1-saved-cards-v1';
  const m=rt.rtMerge({[k]:J([{id:'a',addedAt:10},{id:'b',addedAt:20}])},{[k]:J([{id:'c',addedAt:40},{id:'a',addedAt:5},{id:'d',addedAt:30},{nope:1}])});
  assert.deepEqual(P(m.writes[k]),[{id:'a',addedAt:5},{id:'b',addedAt:20},{id:'d',addedAt:30},{id:'c',addedAt:40}]);
  assert.equal(m.summary.saved,2);
}
// 익힌 단어·틀린 단어·돌파
{
  const m=rt.rtMerge({'goyang-learned-words-v1':J({fable:['a','b']}),'goyang-missed-words-v1':J({a:2,b:1}),'goyang-milestone-v1':J({seen:1000})},
    {'goyang-learned-words-v1':J({fable:['b','c'],ksat:['z']}),'goyang-missed-words-v1':J({a:1,b:3,c:1}),'goyang-milestone-v1':J({seen:0})});
  assert.deepEqual(P(m.writes['goyang-learned-words-v1']),{fable:['a','b','c'],ksat:['z']});
  assert.deepEqual(P(m.writes['goyang-missed-words-v1']),{a:2,b:3,c:1});
  assert.equal(m.writes['goyang-milestone-v1'],undefined);
  assert.equal(rt.rtMerge({'goyang-milestone-v1':J({seen:0})},{'goyang-milestone-v1':J({seen:2000})}).writes['goyang-milestone-v1'],J({seen:2000}));
}
// 도장: 받은 도장은 다 남기고, 둘 다 있으면 이 기기 날짜
{
  const k='goyang-fable-stamps-v1';
  const m=rt.rtMerge({[k]:J({s0:0,s1:111})},{[k]:J({s1:222,s2:333})});
  assert.deepEqual(P(m.writes[k]),{s0:0,s1:111,s2:333});assert.equal(m.summary.stamps,1);
}
// 진행 속도: 합쳐 시간순, 600판
{
  const k='goyang-pace-fable-v1',r=(at)=>({at,ms:1000,u:3,k:'n'});
  const m=rt.rtMerge({[k]:J([r(1),r(3)])},{[k]:J([r(2),r(3)])});
  assert.deepEqual(P(m.writes[k]).map(x=>x.at),[1,2,3]);
  const big=rt.rtMerge({[k]:J(Array.from({length:500},(_,i)=>r(i*2+1)))},{[k]:J(Array.from({length:500},(_,i)=>r(i*2+2)))});
  const got=P(big.writes[k]);assert.equal(got.length,600);assert.equal(got[0].at,401);assert.equal(got.at(-1).at,1000);
  const mk='goyang-pace-meta-fable-v1';
  assert.deepEqual(P(rt.rtMerge({[mk]:J({total:4,target:'B1'})},{[mk]:J({total:9,target:'C1',extra:1})}).writes[mk]),{total:9,target:'B1',extra:1});
}
// 설정·이어하기 자리: 이 기기에 있으면 그대로, 없을 때만 가져온다
{
  const m=rt.rtMerge({'goyang-hoe-last-v1':'L','goyang-fable-level-v1':'B1'},{'goyang-hoe-last-v1':'I','goyang-fable-level-v1':'C1','goyang-uni-v1':'연세대'});
  assert.deepEqual(m.writes,{'goyang-uni-v1':'연세대'});
}
// 전체 성질: 지우지 않는다, 같은 파일을 두 번 합치면 두 번째는 할 일이 없다
{
  const L={'goyang-seoul-v1':J({a:{e1:{completed:true}}}),'goyang-seoul-v1-saved-cards-v1':J([{id:'a',addedAt:1}]),'goyang-fable-stamps-v1':J({s0:0}),'goyang-pace-ksat-v1':J([{at:5,ms:1,u:1}])};
  const I={'goyang-seoul-v1':J({a:{e2:{completed:true}}}),'goyang-seoul-v1-saved-cards-v1':J([{id:'b',addedAt:2}]),'goyang-fable-stamps-v1':J({s1:9}),'goyang-pace-ksat-v1':J([{at:6,ms:1,u:1}]),'goyang-milestone-v1':J({seen:1000})};
  const once=Object.assign({},L,rt.rtMerge(L,I).writes);
  assert.equal(P(once['goyang-seoul-v1']).a.e1.completed,true);
  assert.deepEqual(P(once['goyang-seoul-v1-saved-cards-v1']).map(x=>x.id),['a','b']);
  assert.deepEqual(rt.rtMerge(once,I).writes,{});
  // 반대로 합쳐도 같은 내용이 남는다(순서만 다를 수 있다)
  const other=Object.assign({},I,rt.rtMerge(I,L).writes);
  assert.deepEqual(Object.keys(P(other['goyang-seoul-v1']).a).sort(),['e1','e2']);
}
// 다른 단어장 설정으로도 돈다(SHARED.md): 이름·접두어·키 종류가 config를 따르고, 보카고양 키는 건드리지 않는다
{
  const vm=require('node:vm');
  const code=fs.readFileSync(path.join(__dirname,'../record-transfer/merge.js'),'utf8').replace(/\nif\(typeof module[^\n]*\s*$/,'');
  const ctx={RT_CONFIG:{game:'탕고고양',app:'tangogoyang-records',prefix:'tangogoyang-',skip:[],kinds:{progress:'^tangogoyang-progress-v1$'}}};
  vm.createContext(ctx);vm.runInContext(code,ctx);
  assert.deepEqual(Object.keys(ctx.rtCollect(fakeStore({'tangogoyang-progress-v1':'{}','goyang-hoe-seoul-v1':'{}'}))),['tangogoyang-progress-v1']);
  assert.equal(ctx.rtKind('tangogoyang-progress-v1'),'progress');
  assert.equal(ctx.rtKind('tangogoyang-other-v1'),'keep');
  assert.throws(()=>ctx.rtParse(packed),/탕고고양 기록 파일이 아니라고양/);
  const m=ctx.rtMerge({'tangogoyang-progress-v1':J({a:{x:{completed:true}}})},{'tangogoyang-progress-v1':J({a:{y:{completed:true}}}),'goyang-seoul-v1':'{}'});
  assert.deepEqual(Object.keys(m.writes),['tangogoyang-progress-v1']);assert.equal(m.summary.exercises,1);
}
// 이 저장소 설정: 보카고양
assert.equal(rt.RT_GAME,'보카고양');assert.equal(rt.RT_APP,'vocagoyang-records');
// index.html에 최신 원본이 들어 있다
const html=fs.readFileSync(path.join(__dirname,'../../index.html'),'utf8');
assert.ok(html.includes('/* RECORD_TRANSFER_START */')&&html.includes('id="rtSheet"'),'index.html has record transfer');
console.log('record-transfer: merge rules, file format, idempotence OK');
