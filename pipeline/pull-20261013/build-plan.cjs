'use strict';
// 26.10.13 3000급 채우기 계획(plan.json)을 만든다(PRINCIPLES 2-8). 5세트 문법 뜻 분산(set5-20261012)과 같은 방식이다.
// 배포판(BASE 커밋)의 게임 코드와 DATA를 그대로 돌려, 9~25세트로 가는 카드마다 모아둔 카드 ID(savedId)와
// 완료 기록 키(priorKeys)를 계산해 고정하고, 카드가 빠지는 26~45세트 연습의 배포판 카드 목록(deployed)을 남긴다.
// 바꾼 뒤에는 다시 돌리지 않는다. 사용: node pipeline/pull-20261013/build-plan.cjs 5a66345
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {runtime}=require('../set0-20261010/carry.cjs');
const root=path.resolve(__dirname,'../..'),base=process.argv[2];assert(base,'usage: build-plan.cjs <base commit>');
const git=f=>execFileSync('git',['show',`${base}:${f}`],{cwd:root,encoding:'utf8',maxBuffer:1<<28});
const html=git('vocagoyangfable.html'),DATA=JSON.parse(html.match(/^const DATA = (\[.*\]);\s*$/m)[1]);
const old=runtime(html,git('pipeline/saved-cards/runtime.js'),DATA);
const spec=JSON.parse(fs.readFileSync(path.join(__dirname,'spec.json'),'utf8'));
const source=old.flat.filter(x=>x.L.lesson>=26&&x.L.lesson<=45).flatMap(x=>x.e.words.map((w,i)=>({...x,w,i})));
const find=(word,si)=>{const hits=source.filter(y=>y.w.word===word&&(y.w.si||1)===si);assert.equal(hits.length,1,word+si);return hits[0];};
const keysOf=x=>{const keys=[old.key(x),...(x.e.priorCoverage?.[x.i]||[]).map(k=>[k.id,k.title]),...(x.e.parentRecord?[[x.e.parentRecord.id,x.e.parentRecord.title]]:[])];
 return [...new Map(keys.map(k=>[JSON.stringify(k),k])).values()];};
// 1. 옮기는 카드: 배포판에서의 ID·완료 기록 키·원래 자리(세트·연습). 새 연습 번호는 그 세트의 마지막 연습 다음.
const moves=spec.moves.map(m=>{
 const dest=DATA.find(L=>L.lesson===m.to);
 return {to:m.to,ex:Math.max(...dest.exercises.map(e=>e.ex))+1,name:m.name,cards:m.cards.map(([word,si])=>{
  const x=find(word,si);return {word,si,set:x.L.lesson,from:x.e.ex,savedId:x.w.savedCardId,priorKeys:keysOf(x)};
 })};
});
// 2. 카드가 빠지는 원본 연습: 배포판 카드 목록과 판 나눔. 이미 한 번 뺀 연습(preDeletion)인지도 적는다.
const losing=[...new Map(moves.flatMap(m=>m.cards.map(c=>[c.set+'|'+c.from,[c.set,c.from]]))).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
const deployed=losing.map(([set,ex])=>{const e=DATA.find(L=>L.lesson===set).exercises.find(e=>e.ex===ex);
 assert(!e.deployedWords,'A third removal is not supported: '+set+'/'+ex);
 return {set,ex,words:e.words.map(w=>({word:w.word,si:w.si||1})),parts:e.practiceParts||null,earlierRemoval:!!e.preDeletion};});
const plan={id:spec.id,base,spec:'pipeline/pull-20261013/spec.json',layout:'20261012',
 note:'build-plan.cjs가 배포판(base)에서 계산했다. moves의 savedId·priorKeys는 그 카드의 배포판 ID와 완료 기록 키(옛 판 포함), deployed는 카드가 빠지는 연습의 배포판 목록이다. layout은 배포판 이어하기 저장값의 prune 표시다.',
 moves,deployed};
fs.writeFileSync(path.join(__dirname,'plan.json'),JSON.stringify(plan,null,1)+'\n');
console.log(JSON.stringify({moved:moves.reduce((n,m)=>n+m.cards.length,0),destinations:moves.map(m=>`${m.to}:${m.ex}`).join(' '),losingExercises:losing.length,
 earlierRemoval:deployed.filter(d=>d.earlierRemoval).length,withParts:deployed.filter(d=>d.parts).length}));
