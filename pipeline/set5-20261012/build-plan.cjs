'use strict';
// 26.10.12 5세트 문법 뜻 분산 계획(plan.json)을 만든다. 배포판(BASE 커밋)의 게임 코드와 DATA를 그대로 돌려,
// 다른 세트로 가는 카드마다 모아둔 카드 ID(savedId)와 완료 기록 키(priorKeys)를 계산해 고정하고,
// 카드가 빠지는 5세트 연습의 배포판 카드 목록(deployed)을 남긴다. 바꾼 뒤에는 다시 돌리지 않는다.
// 사용: node pipeline/set5-20261012/build-plan.cjs acfe20e
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {runtime}=require('../set0-20261010/carry.cjs');
const root=path.resolve(__dirname,'../..'),base=process.argv[2];assert(base,'usage: build-plan.cjs <base commit>');
const git=f=>execFileSync('git',['show',`${base}:${f}`],{cwd:root,encoding:'utf8',maxBuffer:1<<28});
const html=git('vocagoyangfable.html'),DATA=JSON.parse(html.match(/^const DATA = (\[.*\]);\s*$/m)[1]);
const old=runtime(html,git('pipeline/saved-cards/runtime.js'),DATA);
const spec=JSON.parse(fs.readFileSync(path.join(__dirname,'spec.json'),'utf8'));
const set5=old.flat.filter(x=>x.L.lesson===5),src5=DATA.find(L=>L.lesson===5);
const find=(word,si)=>{const hits=set5.flatMap(x=>x.e.words.map((w,i)=>({...x,w,i}))).filter(y=>y.w.word===word&&(y.w.si||1)===si);assert.equal(hits.length,1,word+si);return hits[0];};
const keysOf=x=>{const keys=[old.key(x),...(x.e.priorCoverage?.[x.i]||[]).map(k=>[k.id,k.title]),...(x.e.parentRecord?[[x.e.parentRecord.id,x.e.parentRecord.title]]:[])];
 return [...new Map(keys.map(k=>[JSON.stringify(k),k])).values()];};
// 1. 옮기는 카드: 배포판에서의 ID와 완료 기록 키. 새 연습 번호는 그 세트의 마지막 연습 다음.
const moves=spec.moves.map(m=>{
 const dest=DATA.find(L=>L.lesson===m.to);
 return {to:m.to,ex:Math.max(...dest.exercises.map(e=>e.ex))+1,name:m.name,cards:m.cards.map(([word,si])=>{
  const x=find(word,si);return {word,si,from:x.e.ex,savedId:x.w.savedCardId,priorKeys:keysOf(x)};
 })};
});
// 2. 카드가 빠지는 5세트 원본 연습: 배포판 카드 목록과 판 나눔(게임이 그 판의 기록·이어하기 제목을 다시 계산한다).
const losing=[...new Set(moves.flatMap(m=>m.cards.map(c=>c.from)))].sort((a,b)=>a-b);
const deployed=losing.map(ex=>{const e=src5.exercises.find(e=>e.ex===ex);assert(e.preDeletion,'Expected the set-0 removal before: '+ex);
 return {ex,words:e.words.map(w=>({word:w.word,si:w.si||1})),parts:e.practiceParts||null};});
const plan={id:spec.id,base,spec:'pipeline/set5-20261012/spec.json',
 note:'build-plan.cjs가 배포판(base)에서 계산했다. moves의 savedId·priorKeys는 그 카드의 배포판 ID와 완료 기록 키(옛 판 포함), deployed는 카드가 빠지는 5세트 연습의 배포판 목록이다.',
 moves,deployed};
fs.writeFileSync(path.join(__dirname,'plan.json'),JSON.stringify(plan,null,1)+'\n');
console.log(JSON.stringify({moved:moves.reduce((n,m)=>n+m.cards.length,0),destinations:moves.map(m=>`${m.to}:${m.ex}`),losingExercises:losing,
 priorKeys:moves.flatMap(m=>m.cards.map(c=>c.priorKeys.length))}));
