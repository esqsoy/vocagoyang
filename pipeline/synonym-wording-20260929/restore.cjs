// Undo only this recorded wording change before the previous audit is restored.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const review=JSON.parse(fs.readFileSync(path.join(__dirname,'findings.json'),'utf8'));
const previous=JSON.parse(fs.readFileSync(path.join(__dirname,'../synonym-review-20260929/findings.json'),'utf8'));
const playerFeedback=JSON.parse(fs.readFileSync(path.join(__dirname,'../player-feedback-20260930.json'),'utf8'));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function restoreSynonymWording(data){
 const suffixBaseline=require('../suffix-rebuild-20261001/restore.cjs').restoreSuffixExpansion(data);
 const restored=require('../morphology-rebuild-20260930/restore.cjs').restoreMorphologyExpansion(suffixBaseline);
 // Preserve historical hashes by undoing only the later, explicitly logged note edit.
 if(hash(restored)===playerFeedback.afterDataSha256){
  for(const c of playerFeedback.changes){
   assert.equal(c.field,'c','Only explanation wording may change');
   const w=restored.find(L=>L.lesson===c.lesson)?.exercises.find(e=>e.ex===c.exercise)?.words.find(w=>w.word===c.word&&w.si===c.si);
   assert(w);assert.equal(w[c.field],c.new);w[c.field]=c.old;
  }
  assert.equal(hash(restored),playerFeedback.baselineDataSha256,'Changes exceed recorded player feedback');
 }
 const current=hash(restored);
 if(current===review.baselineDataSha256||current===previous.baselineDataSha256)return restored;
 assert.equal(current,review.afterDataSha256,'Unlogged change after synonym wording review');
 const seen=new Set();
 for(const c of review.changes){
  const key=[c.lesson,c.exercise,c.index,c.field].join(':');assert(!seen.has(key),key);seen.add(key);
  assert.equal(c.field,'c','Only explanation wording may change');
  const w=restored.find(L=>L.lesson===c.lesson)?.exercises.find(e=>e.ex===c.exercise)?.words[c.index];
  assert(w,key);assert.equal(w.word,c.word);assert.equal(w.si,c.si);assert.equal(w.c,c.new,key);w.c=c.old;
 }
 assert.equal(hash(restored),review.baselineDataSha256,'Changes exceed the recorded wording review');
 return restored;
}
module.exports={review,restoreSynonymWording};
