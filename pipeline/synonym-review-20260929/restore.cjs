// Reverse this authorized editorial delta for historical regression baselines.
// Never update an old hash to bless a new, unrecorded content edit.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const review=JSON.parse(fs.readFileSync(path.join(__dirname,'findings.json'),'utf8'));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function restoreSynonymReview(data){
 const restored=structuredClone(data),current=hash(restored);
 if(current===review.baselineDataSha256)return restored;
 assert.equal(current,review.afterDataSha256,'Unlogged change after synonym/example review');
 const seen=new Set();
 for(const c of review.changes){
  const key=[c.lesson,c.exercise,c.index,c.field].join(':');assert(!seen.has(key),key);seen.add(key);
  assert(['ex','tr','c'].includes(c.field),'Review must not alter answers or card identities');
  const w=restored.find(L=>L.lesson===c.lesson)?.exercises.find(e=>e.ex===c.exercise)?.words[c.index];
  assert(w,key);assert.equal(w.word,c.word);assert.equal(w.si,c.si);assert.equal(w[c.field],c.new,key);
  w[c.field]=c.old;
 }
 assert.equal(hash(restored),review.baselineDataSha256,'Changes exceed the logged review');
 return restored;
}
module.exports={review,restoreSynonymReview};
