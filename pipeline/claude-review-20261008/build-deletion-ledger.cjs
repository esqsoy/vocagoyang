'use strict';
// 사용: [LEDGER_BASE=<커밋>] node pipeline/claude-review-20261008/build-deletion-ledger.cjs <원장 이름> "<승인>" "<요약>"
// LEDGER_BASE(기본 HEAD)의 DATA와 작업 트리의 DATA를 비교한다.
// 카드 삭제만 있는 변경을 원장으로 남긴다: 배열에서 뺀 카드(정확한 원래 위치)와 새로 붙인 preDeletion 키.
// 범용 diff는 뒤 카드가 당겨진 것을 값 변경으로 적어 되돌릴 때 키 순서가 어긋나므로 쓰지 않는다.
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const path=require('node:path'),ROOT=path.resolve(__dirname,'../..');
const {hash,reverse}=require(ROOT+'/pipeline/claude-review-20261008/ledger-lib.cjs');
const dataOf=h=>JSON.parse(h.match(/^const DATA = (\[.*\]);\s*$/m)[1]);
const B=dataOf(cp.execSync(`git -C ${ROOT} show ${process.env.LEDGER_BASE||'HEAD'}:vocagoyangfable.html`,{maxBuffer:1<<28}).toString());
const A=dataOf(fs.readFileSync(ROOT+'/vocagoyangfable.html','utf8'));
assert.equal(B.length,A.length);
const changes=[];
B.forEach((L,li)=>{
  assert.equal(L.exercises.length,A[li].exercises.length,'exercise count changed in lesson '+li);
  L.exercises.forEach((e,ei)=>{
    const a=A[li].exercises[ei];
    const {words:bw,preDeletion:bp,...bm}=e,{words:aw,preDeletion,...am}=a;
    assert.deepEqual(am,bm,'exercise metadata changed '+li+'/'+ei);
    if(!preDeletion){assert(!bp,'preDeletion removed '+li+'/'+ei);assert.deepEqual(aw,bw);return;}
    // 이미 preDeletion이 붙은 연습은 그 목록(배포된 배치)을 그대로 둔다.
    if(bp)assert.deepEqual(preDeletion,bp,'preDeletion changed '+li+'/'+ei);
    // 남은 카드는 순서·내용이 그대로여야 한다.
    const kept=[],removed=[];let j=0;
    bw.forEach((w,i)=>{if(j<aw.length&&JSON.stringify(aw[j])===JSON.stringify(w)){kept.push(i);j++;}else removed.push(i);});
    assert.equal(j,aw.length,'kept cards changed '+li+'/'+ei);
    for(const i of [...removed].reverse())changes.push({path:[li,'exercises',ei,'words',i],oldExists:true,newExists:false,old:bw[i]});
    if(!bp)changes.push({path:[li,'exercises',ei,'preDeletion'],oldExists:false,newExists:true,new:preDeletion});
  });
});
const back=reverse(A,changes,[]);
assert.equal(hash(back),hash(B),'reverse must reproduce the previous DATA exactly');
const [,,name,authorization,summary]=process.argv;
const ledger={date:'2026-10-10',name,status:'applied_locally_verified',authorization,summary,
  snapshots:{DATA:{beforeHash:hash(B),afterHash:hash(A),changes,keyOrders:[]}},sourceSnapshots:{},sourceChanges:{},sourceKeyOrders:{}};
fs.writeFileSync(path.join(__dirname,name+'.json'),JSON.stringify(ledger,null,1)+'\n');
console.log(JSON.stringify({ledger:name,removedCards:changes.filter(c=>c.oldExists).length,exercises:changes.filter(c=>c.newExists).length,reverseVerified:true}));
