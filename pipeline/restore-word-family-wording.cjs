'use strict';
// Keep earlier audit snapshots fixed when display wording is edited later.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const review=JSON.parse(fs.readFileSync(path.join(__dirname,'word-family-wording-20261001.json'),'utf8'));
const feedback=JSON.parse(fs.readFileSync(path.join(__dirname,'player-feedback-20261001.json'),'utf8'));
const meaningHints=JSON.parse(fs.readFileSync(path.join(__dirname,'meaning-hints-20261002.json'),'utf8'));
const synonymPolicy=JSON.parse(fs.readFileSync(path.join(__dirname,'synonym-policy-20261002.json'),'utf8'));
const feedback20261003=JSON.parse(fs.readFileSync(path.join(__dirname,'player-feedback-20261003.json'),'utf8'));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function restoreRecorded(value,record){
 const result=structuredClone(value);
 if(!record||hash(result)!==record.afterHash)return result;
 for(const change of [...record.changes].reverse()){
  const key=change.path.at(-1),parent=change.path.slice(0,-1).reduce((o,k)=>o[k],result);
  assert.equal(Object.hasOwn(parent,key),change.newExists);assert.deepEqual(parent[key],change.new);
  if(change.oldExists)parent[key]=structuredClone(change.old);
  else if(Array.isArray(parent)){assert.equal(Number(key),parent.length-1,'Only recorded appended items may be removed');parent.pop();}
  else delete parent[key];
 }
 assert.equal(hash(result),record.beforeHash,'Changes exceed the recorded content delta');return result;
}
function restoreSynonymPolicy(value,kind='DATA'){
 if(kind==='DATA')value=require('./restore-lesson-placement.cjs').restoreLessonPlacement(value);
 // 26.10.08 Claude 리뷰 층: 47~50세트 메타데이터는 원본 파일(morphology/connections.json)과 같은 값이라 그 원장으로 되돌린다.
 else if(kind==='MORPHOLOGY'||kind==='CONNECTIONS')value=require('./claude-review-20261008/restore.cjs').restoreClaudeReviewSource20261008(value,'pipeline/'+kind.toLowerCase()+'.json');
 return restoreRecorded(restoreRecorded(value,feedback20261003.snapshots[kind]),synonymPolicy.snapshots[kind]);
}
function restorePlayerFeedback(value,kind='DATA'){
 let result=restoreRecorded(restoreSynonymPolicy(value,kind),meaningHints.snapshots[kind]);
 for(const patch of [...feedback.patches].reverse())result=restoreRecorded(result,patch.snapshots[kind]);return result;
}
function restoreWordFamilyWording(value,kind='DATA'){
 return restoreRecorded(restorePlayerFeedback(value,kind),review.snapshots[kind]);
}
module.exports={restoreWordFamilyWording,restorePlayerFeedback,restoreSynonymPolicy};
