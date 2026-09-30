'use strict';
// Keep earlier audit snapshots fixed when display wording is edited later.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const review=JSON.parse(fs.readFileSync(path.join(__dirname,'word-family-wording-20261001.json'),'utf8'));
const feedback=JSON.parse(fs.readFileSync(path.join(__dirname,'player-feedback-20261001.json'),'utf8'));
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
function restorePlayerFeedback(value,kind='DATA'){
 let result=value;for(const patch of [...feedback.patches].reverse())result=restoreRecorded(result,patch.snapshots[kind]);return result;
}
function restoreWordFamilyWording(value,kind='DATA'){
 return restoreRecorded(restorePlayerFeedback(value,kind),review.snapshots[kind]);
}
module.exports={restoreWordFamilyWording,restorePlayerFeedback};
