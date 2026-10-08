'use strict';
// Undo only the recorded example edits before validating older content snapshots.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const ledger=JSON.parse(fs.readFileSync(path.join(__dirname,'player-feedback-20261007.json'),'utf8'));
const review=ledger.snapshots.DATA;
const history=require('./history-review-20261007/restore.cjs');
const claude=require('./claude-review-20261008/restore.cjs'); // 26.10.08 이후 층을 먼저 되돌린다
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
function restorePlayerFeedback20261007(data){
 const restored=history.restoreHistoryExamples(claude.restoreClaudeReview20261008(data));
 if(hash(restored)!==review.afterHash)return restored;
 for(const change of [...review.changes].reverse()){
  const p=change.path,key=p.at(-1);
  assert.equal(p.length,6);assert.equal(p[1],'exercises');assert.equal(p[3],'words');
  assert(['ex','tr','c'].includes(key),'Only recorded example, translation and explanation fields may change');
  assert.equal(change.oldExists,true);assert.equal(change.newExists,true);
  const card=p.slice(0,-1).reduce((value,k)=>value[k],restored);
  assert(Object.hasOwn(card,key));assert.deepEqual(card[key],change.new);
  card[key]=structuredClone(change.old);
 }
 assert.equal(hash(restored),review.beforeHash,'Changes exceed the recorded 2026-10-07 player feedback');
 return restored;
}
function restorePlayerFeedbackSource20261007(value,file){
 const restored=history.restoreHistorySource(claude.restoreClaudeReviewSource20261008(value,file),file),snap=ledger.sourceSnapshots[file];
 if(!snap||hash(restored)!==snap.afterHash)return restored;
 for(const change of [...ledger.sourceChanges].reverse().filter(c=>c.file===file)){
  assert(['ex','tr','c'].includes(change.field));
  const exercises=Array.isArray(restored)?restored:restored.exercises;
  const exercise=exercises.find(e=>e.ex===change.exercise);assert(exercise);
  const cards=exercise.words.filter(w=>(w.word||w.en)===change.word&&w.si===change.si);
  assert.equal(cards.length,1);assert.deepEqual(cards[0][change.field],change.new);
  cards[0][change.field]=structuredClone(change.old);
 }
 assert.equal(hash(restored),snap.beforeHash,'Unexpected original feedback source edits in '+file);
 return restored;
}
module.exports={restorePlayerFeedback20261007,restorePlayerFeedbackSource20261007};
