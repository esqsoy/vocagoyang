'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const review=JSON.parse(fs.readFileSync(path.join(__dirname,'findings.json'),'utf8'));
const beforeMorphology=JSON.parse(fs.readFileSync(path.join(__dirname,'before-morphology.json'),'utf8'));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function restoreSuffixExpansion(data){
 const result=require('../restore-word-family-wording.cjs').restoreWordFamilyWording(data);
 if(hash(result)!==review.afterDataSha256)return result;
 assert.deepEqual(review.lessonChanges.map(c=>c.lesson),[47,48]);
 for(const change of review.lessonChanges){
  const i=result.findIndex(L=>L.lesson===change.lesson);assert(i>=0);
  assert.deepEqual(result[i],change.new,'Unrecorded suffix-course change');
  result[i]=structuredClone(change.old);
 }
 assert.equal(hash(result),review.baselineDataSha256,'Change escaped recorded suffix expansion');
 return result;
}
module.exports={review,beforeMorphology,restoreSuffixExpansion,hash};
