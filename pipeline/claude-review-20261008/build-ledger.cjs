'use strict';
// 범용 원장 만들기: 기준 커밋과 지금 작업 트리의 DATA·저작 원본(out/*.json 등)을 경로 단위로 비교해 원장을 쓴다.
// 사용: LEDGER_DATE=2026-10-10 node pipeline/claude-review-20261008/build-ledger.cjs <이름> <기준 커밋> '<승인>' '<요약>'
// 카드를 빼거나 자리를 바꿔도 되돌린 결과가 기준과 해시까지 같은지 확인한 뒤에만 쓴다.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const ROOT=path.resolve(__dirname,'../..');
const {hash,diff,reverse,keyOrders}=require('./ledger-lib.cjs');
const [,,name,beforeRef,authorization,summary]=process.argv;
if(!name||!beforeRef||!authorization||!summary)throw new Error('usage: build-ledger.cjs <name> <before-ref> <authorization> <summary>');
const show=f=>{try{return cp.execFileSync('git',['-C',ROOT,'show',`${beforeRef}:${f}`],{maxBuffer:1<<28,stdio:['ignore','pipe','ignore']}).toString();}catch{return null;}};
const dataOf=h=>JSON.parse(h.match(/^const DATA = (\[.*\]);\s*$/m)[1]);
// 배열 끝에서 3개 이상 빠지면 ledger-lib reverse가 뒤 번호부터 넣어 순서가 뒤집힌다. 같은 배열의 연속 삭제는 내림차순으로 적어
// reverse가 앞 번호부터 넣게 한다(라이브러리는 기존 원장이 그 동작에 기대므로 바꾸지 않는다).
function tailOrder(changes){
  const out=[],removal=ch=>ch.oldExists&&!ch.newExists&&typeof ch.path.at(-1)==='number',par=ch=>JSON.stringify(ch.path.slice(0,-1));
  for(let j=0;j<changes.length;){
    if(!removal(changes[j])){out.push(changes[j++]);continue;}
    let r=j;while(r+1<changes.length&&removal(changes[r+1])&&par(changes[r+1])===par(changes[j]))r++;
    out.push(...changes.slice(j,r+1).reverse());j=r+1;
  }
  return out;
}
// 카드가 자리를 바꾸면 같은 자리 객체의 키 순서가 달라진다. 되돌린 결과와 기준을 함께 걸어 키 순서가 다른 객체를 모두 남긴다.
function orderFix(before,after,changes,ko){
  const back=reverse(after,changes,ko),extra=[];
  (function walk(x,y,p){
    if(Array.isArray(x)&&Array.isArray(y)){x.forEach((v,i)=>walk(v,y[i],[...p,i]));return;}
    if(x&&y&&typeof x==='object'&&typeof y==='object'){
      if(Object.keys(x).join('\u0000')!==Object.keys(y).join('\u0000'))extra.push({path:p,keys:Object.keys(x)});
      for(const k of Object.keys(x))if(Object.hasOwn(y,k))walk(x[k],y[k],[...p,k]);
    }
  })(before,back,[]);
  const seen=new Set(ko.map(o=>JSON.stringify(o.path)));
  return [...ko,...extra.filter(o=>!seen.has(JSON.stringify(o.path)))];
}
function record(b,a){
  const changes=tailOrder(diff(b,a)),orders=orderFix(b,a,changes,keyOrders(b,changes));
  if(hash(reverse(a,changes,orders))!==hash(b))throw new Error('reverse mismatch');
  return {changes,orders};
}
const B=dataOf(show('vocagoyangfable.html')),A=dataOf(fs.readFileSync(path.join(ROOT,'vocagoyangfable.html'),'utf8'));
const data=record(B,A);
const ledger={date:process.env.LEDGER_DATE||new Date().toISOString().slice(0,10),name,status:'applied_locally_verified',authorization,summary,
  snapshots:{DATA:{beforeHash:hash(B),afterHash:hash(A),changes:data.changes,keyOrders:data.orders}},sourceSnapshots:{},sourceChanges:{},sourceKeyOrders:{}};
const files=[...[0,1,2,3,4].map(i=>`pipeline/out/lesson0${i}.json`),...Array.from({length:46},(_,i)=>`pipeline/out/set${String(i+5).padStart(2,'0')}.json`),
  'pipeline/morphology.json','pipeline/connections.json'];
for(const f of files){
  const old=show(f);if(old===null||!fs.existsSync(path.join(ROOT,f)))continue;
  const b=JSON.parse(old),a=JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8')),r=record(b,a);if(!r.changes.length)continue;
  ledger.sourceSnapshots[f]={beforeHash:hash(b),afterHash:hash(a)};ledger.sourceChanges[f]=r.changes;ledger.sourceKeyOrders[f]=r.orders;
}
const out=path.join(__dirname,name+'.json');
fs.writeFileSync(out,JSON.stringify(ledger,null,1)+'\n');
console.log(JSON.stringify({ledger:path.relative(ROOT,out),dataChanges:data.changes.length,sources:Object.keys(ledger.sourceSnapshots).length,
  sourceChanges:Object.values(ledger.sourceChanges).reduce((n,c)=>n+c.length,0),reverseVerified:true}));
