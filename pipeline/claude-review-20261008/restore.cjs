'use strict';
// 26.10.08 Claude 리뷰 반영분(결함 수정·고양이 대사, 이후 사촌 쌍, 긴 예문 다시 쓰기)을 기록대로만 되돌린다.
// Codex의 복원 체인(restore-player-feedback-20261007 → history-review …) 맨 위에서 먼저 실행된다.
// 현재 상태가 각 원장의 '적용 후' 해시와 같을 때만 되돌리고, 되돌린 결과가 '적용 전' 해시와 정확히 같아야 한다.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {hash,reverse}=require('./ledger-lib.cjs');
const LAYERS=['knowledge-13','knowledge-12','knowledge-11','knowledge-05','knowledge-07','knowledge-06','knowledge-08','knowledge-10','knowledge-09','word-notes','knowledge-04','proper-nouns','knowledge-03','knowledge-02','knowledge-01','country','academic-terms','long-examples','cousin-pairs','content-fixes']   // 최신 순
  .map(n=>path.join(__dirname,n+'.json')).filter(f=>fs.existsSync(f))
  .map(f=>JSON.parse(fs.readFileSync(f,'utf8')));
function restoreClaudeReview20261008(data){
  let v=data;
  for(const L of LAYERS){
    const s=L.snapshots.DATA;if(hash(v)!==s.afterHash)continue;
    v=reverse(v,s.changes,s.keyOrders);
    assert.equal(hash(v),s.beforeHash,'Unexpected DATA changes outside Claude review layer '+L.name);
  }
  return v;
}
function restoreClaudeReviewSource20261008(value,file){
  let v=value;
  for(const L of LAYERS){
    const s=L.sourceSnapshots[file];if(!s||hash(v)!==s.afterHash)continue;
    v=reverse(v,L.sourceChanges[file],L.sourceKeyOrders[file]);
    assert.equal(hash(v),s.beforeHash,'Unexpected source changes outside Claude review layer '+L.name+' in '+file);
  }
  return v;
}
module.exports={restoreClaudeReview20261008,restoreClaudeReviewSource20261008,LAYERS};
