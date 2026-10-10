'use strict';
// 26.10.10 0세트 재구성 계획(plan.json)을 만든다. 바꾸기 전 판(BASE 커밋)의 게임 코드와 DATA를 그대로 돌려,
// 0세트로 들어가는 카드마다 모아둔 카드 ID(savedId)와 완료 기록 키(priorKeys)를, 바뀌는 연습의 옛 이어하기 저장값마다
// 돌아갈 카드(resume)를 계산해 고정한다. 바꾼 뒤에는 다시 돌리지 않는다(바꾸기 전 판이 기준이다).
// 사용: node pipeline/set0-20261010/build-plan.cjs df95ea4
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {runtime,candidates}=require('./carry.cjs');
const root=path.resolve(__dirname,'../..'),base=process.argv[2];assert(base,'usage: build-plan.cjs <base commit>');
const git=f=>execFileSync('git',['show',`${base}:${f}`],{cwd:root,encoding:'utf8',maxBuffer:1<<28});
const html=git('vocagoyangfable.html');
const old=runtime(html,git('pipeline/saved-cards/runtime.js'),JSON.parse(html.match(/^const DATA = (\[.*\]);\s*$/m)[1]));
const draft=JSON.parse(fs.readFileSync(path.join(root,'pipeline/grammar/set0-draft-20261010.json'),'utf8'));
const LESSONS=[0,1,5],cardKey=(lesson,word,si)=>JSON.stringify([lesson,word,si]);
const byKey=new Map();
for(const x of old.flat.filter(x=>LESSONS.includes(x.L.lesson)))x.e.words.forEach((w,i)=>{
 const k=cardKey(x.L.lesson,w.word||w.term,w.si||1);assert(!byKey.has(k),'Duplicate card '+k);byKey.set(k,{...x,w,i});
});
// 1. 새 0세트: 연습마다 카드 참조(바꾸기 전 화면 세트·단어·뜻 번호)와 이어받을 ID·기록 키.
const into0=new Set(),exercises=draft.exercises.map(E=>({ex:E.no,name:E.name,cards:E.cards.map(c=>{
 if(c.new)return {lesson:0,word:c.word,si:c.si,new:true};
 const lesson=Number(c.frm.match(/^(\d+)세트/)[1]),x=byKey.get(cardKey(lesson,c.word,c.si));assert(x,c.word);
 into0.add(x.w.savedCardId);
 const keys=[old.key(x),...(x.e.priorCoverage?.[x.i]||[]).map(k=>[k.id,k.title]),...(x.e.parentRecord?[[x.e.parentRecord.id,x.e.parentRecord.title]]:[])];
 return {lesson,word:c.word,si:c.si,savedId:x.w.savedCardId,priorKeys:[...new Map(keys.map(k=>[JSON.stringify(k),k])).values()]};
})}));
assert.equal(exercises.reduce((n,E)=>n+E.cards.length,0),234);
// 2. 바뀌는 연습: 0세트 전부와, 카드가 빠지는 1·5세트 원본 연습에서 나온 화면 연습.
const losing=new Set([...byKey.values()].filter(x=>x.L.lesson!==0&&into0.has(x.w.savedCardId)).map(x=>x.L.lesson+'|'+x.e.ex));
const affected=x=>x.L.lesson===0||losing.has(x.L.lesson+'|'+x.e.ex);
const destLesson=w=>into0.has(w.savedCardId)?0:old.cards.get(w.savedCardId).L.lesson;
// 3. 옛 저장값이 가리키던 연습의 첫 카드부터 같은 세트에 남는 첫 카드로 돌아간다(0세트는 그 연습의 첫 카드).
const resume=new Map();let checked=0;
for(const c of candidates(old,LESSONS)){
 const t=old.pick(c);checked++;if(!t||!affected(t))continue;
 const rest=old.flat.slice(old.flat.indexOf(old.flat.find(x=>x.L===t.L&&x.e===t.e))).filter(x=>x.L===t.L).flatMap(x=>x.e.words);
 const anchor=rest.find(w=>destLesson(w)===t.L.lesson)||t.e.words[0],lesson=destLesson(anchor);
 const k=cardKey(lesson,anchor.word||anchor.term,anchor.si||1),slot=JSON.stringify([k,c.lid,c.title]);
 if(!resume.has(slot))resume.set(slot,{card:k,from:[c.lid,c.title,[]]});
 resume.get(slot).from[2].push(c.layout??'');
}
const byCard=new Map();
for(const {card,from} of resume.values()){if(!byCard.has(card))byCard.set(card,[]);byCard.get(card).push(from);}
const plan={id:'set0-20261010',base,draft:'pipeline/grammar/set0-draft-20261010.json',progressId:'set0-20261010',
 note:'build-plan.cjs가 바꾸기 전 판에서 계산했다. 카드 참조의 lesson은 바꾸기 전 화면 세트다. resume의 from은 [세트 이름, 옛 제목, 판 이름들](판 이름 ""은 이름 없는 옛 저장).',
 exercises,resume:[...byCard].map(([k,from])=>{const [lesson,word,si]=JSON.parse(k);return {lesson,word,si,from};})};
fs.writeFileSync(path.join(__dirname,'plan.json'),JSON.stringify(plan,null,1)+'\n');
console.log(JSON.stringify({cards:234,moved:[...into0].filter(id=>old.cards.get(id).L.lesson!==0).length,losingExercises:[...losing],
 candidates:checked,resumeEntries:resume.size,resumeCards:byCard.size,bytes:fs.statSync(path.join(__dirname,'plan.json')).size}));
