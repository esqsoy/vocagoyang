'use strict';
// Reverse only the approved, recorded wording edits for historical-content checks.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const reviews=['difficulty-revision-02.json','difficulty-revision-01.json','application-01.json'].map(file=>JSON.parse(fs.readFileSync(path.join(__dirname,file),'utf8')));
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
function restoreHistoryExamples(data){
 const restored=structuredClone(data);
 for(const review of reviews){
 const snap=review.snapshots.DATA;
 if(hash(restored)!==snap.afterHash)continue;
 for(const change of [...snap.changes].reverse()){
  const p=change.path,key=p.at(-1);
  assert.equal(p.length,6);assert.equal(p[1],'exercises');assert.equal(p[3],'words');
  assert(['ex','tr','c'].includes(key));assert(change.oldExists&&change.newExists);
  const card=p.slice(0,-1).reduce((v,k)=>v[k],restored);
  assert(Object.hasOwn(card,key));assert.deepEqual(card[key],change.new);card[key]=structuredClone(change.old);
 }
 assert.equal(hash(restored),snap.beforeHash,'Unexpected changes outside history batch 01');
 }
 return restored;
}
function restoreHistorySource(value,file){
 const restored=structuredClone(value);
 for(const review of reviews){
 const snap=review.sourceSnapshots[file];
 if(!snap||hash(restored)!==snap.afterHash)continue;
 for(const change of [...review.sourceChanges].reverse().filter(c=>c.file===file)){
  const p=change.sourcePath,key=p.at(-1);assert(['ex','tr','c'].includes(key));
  const card=p.slice(0,-1).reduce((v,k)=>v[k],restored);
  assert.equal(card.word||card.en,change.word);assert.equal(card.si,change.si);
  assert.deepEqual(card[key],change.new);card[key]=structuredClone(change.old);
 }
 assert.equal(hash(restored),snap.beforeHash,'Unexpected authoring edits in '+file);
 }
 return restored;
}
module.exports={restoreHistoryExamples,restoreHistorySource};
