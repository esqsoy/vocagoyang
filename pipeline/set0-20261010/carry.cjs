'use strict';
// 26.10.10 0세트 재구성의 진도 잇기 도구. 게임 코드를 그대로 vm에서 돌려 카드 ID·완료 기록 키·이어하기 위치를 잰다.
// build-plan.cjs(바꾸기 전 판 계산)와 pipeline/tests/set0.test.cjs(바꾼 뒤 검증)가 같이 쓴다.
const vm=require('node:vm'),assert=require('node:assert/strict');
// 지금까지 게임이 저장한 이어하기 판 이름. undefined는 판 이름을 남기기 전(short-v1) 저장이다.
const LAYOUTS=['placement-v1','topics-v4','heads-v3-editorial-20260925','heads-v3','heads-v2',undefined];
function runtime(html,savedRuntime,DATA,seed={}){
 const between=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i+a.length);assert(i>=0&&j>i,a);return html.slice(i,j);};
 // resumeTarget이 고른 위치(k)를 완료 건너뛰기 전에 읽으려고 한 줄만 엿본다.
 const resume=between('function saveLast(','/* 발음 읽어주기'),probe='if(k>=0)start=k;';
 assert.equal(resume.split(probe).length,2,'resumeTarget probe point');
 const storage=new Map(Object.entries(seed)),state={lessons:[],progress:{},prevOn:true};
 const ctx=vm.createContext({DATA,state,STORAGE:'test-progress',LASTKEY:'test-last',SAVED_COURSE:'FABLE',__k:null,
  localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},savedSyncCat(){},toast(){}});
 vm.runInContext([
  between('function buildLessons()','/* ===== progress / route ===== */'),
  between('function loadProgress()','/* ===== screens ===== */'),
  resume.replace(probe,'__k=k;'+probe),
  savedRuntime.slice(savedRuntime.indexOf('var savedStoreKey='),savedRuntime.indexOf('function savedCurrentWord()')),
  'savedInit();'
 ].join('\n'),ctx);
 const flat=[];state.lessons.forEach((L,li)=>ctx.visEx(L).forEach((e,ei)=>flat.push({L,e,li,ei})));
 const cards=new Map(flat.flatMap(x=>x.e.words.map((w,i)=>[w.savedCardId,{...x,w,i}])));
 assert.equal(cards.size,flat.reduce((n,x)=>n+x.e.words.length,0),'Saved card IDs must be unique');
 const key=x=>[...ctx.recordKey(x.L.id,x.e.title)];   // vm 밖 배열로 바꿔 비교한다
 // 저장된 이어하기가 가리키는 연습(완료 건너뛰기 전). 못 찾으면 null.
 const pick=last=>{state.progress={};storage.set('test-last',JSON.stringify(last));ctx.__k=null;ctx.resumeTarget();return ctx.__k>=0?flat[ctx.__k]:null;};
 return {ctx,state,storage,flat,cards,key,pick};
}
// 옛 이어하기 저장값 후보: 이 연습으로 돌아올 수 있는 세트 이름 × 옛 제목 × 판 이름.
function candidates(run,lessons){
 const out=new Map();
 for(const x of run.flat.filter(x=>lessons.includes(x.L.lesson))){
  const e=x.e,sources=e.placementResumeSources||[];
  const lids=new Set([x.L.id,e.relocatedFrom?.lid,e.legacyLocation?.lid,...sources.map(s=>s.lid)].filter(Boolean));
  const titles=new Set([e.title,e.sourceTitle,e.legacyLocation?.title,...(e.priorTitles||[]),...(e.priorHeadTitles||[]),...(e.priorElevenTitles||[]),
   ...(e.priorCurrentTitles||[]),...(e.deletionResumeTitles||[]),
   ...sources.flatMap(s=>[s.title,s.sourceTitle,...(s.priorTitles||[]),...(s.priorHeadTitles||[]),...(s.priorElevenTitles||[]),...(s.priorCurrentTitles||[])])].filter(Boolean));
  for(const lid of lids)for(const title of titles)for(const layout of LAYOUTS)out.set(JSON.stringify([lid,title,layout??'']),{lid,title,layout});
 }
 return [...out.values()];
}
module.exports={LAYOUTS,runtime,candidates};
