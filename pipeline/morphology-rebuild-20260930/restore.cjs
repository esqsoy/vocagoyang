'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const review=JSON.parse(fs.readFileSync(path.join(__dirname,'findings.json'),'utf8'));
const beforeMorphology=JSON.parse(fs.readFileSync(path.join(__dirname,'before-morphology.json'),'utf8'));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function restoreMorphologyExpansion(data){
 const result=structuredClone(data);
 // Older audit helpers may pass an already-restored historical snapshot.
 // Only the exact recorded new pool can enter this inverse transformation.
 if(hash(result)!==review.afterDataSha256)return result;
 assert.deepEqual(review.lessonChanges.map(c=>c.lesson),[47,48]);
 for(const change of review.lessonChanges){
  const i=result.findIndex(L=>L.lesson===change.lesson);assert(i>=0);
  assert.deepEqual(result[i],change.new,'Unrecorded morphology course edit');
  result[i]=structuredClone(change.old);
 }
 assert.equal(hash(result),review.baselineDataSha256,'Change escaped approved morphology courses');
 return result;
}
module.exports={review,beforeMorphology,restoreMorphologyExpansion,hash};
