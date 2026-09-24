const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const audit=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../editorial-review-20260925/findings.json'),'utf8'));
function restoreReviewedBaseline(data){
  const restored=structuredClone(data);
  for(const change of audit.changes){
    const [set,exercise]=change.id.split(':').map(Number);
    const card=restored[set].exercises.find(e=>e.ex===exercise).words.find(w=>w.word===change.word&&w.si===change.si);
    assert(card,change.id);assert.deepEqual(card[change.field],change.new,change.id+' '+change.field);
    card[change.field]=structuredClone(change.old);
  }
  const removals=[...audit.removals].sort((a,b)=>{
    const x=a.id.split(':').map(Number),y=b.id.split(':').map(Number);return x[0]-y[0]||x[1]-y[1]||x[2]-y[2];
  });
  for(const {id,card} of removals){
    const [set,exercise,index]=id.split(':').map(Number),words=restored[set].exercises.find(e=>e.ex===exercise).words;
    assert(!words.some(w=>w.word===card.word&&w.si===card.si),'Removed card remains: '+id);
    words.splice(index,0,structuredClone(card));
  }
  for(const change of audit.groupMetadataChanges){
    const [set,exercise]=change.id.split(':').map(Number),group=restored[set].exercises.find(e=>e.ex===exercise);
    assert.deepEqual(group[change.field],change.new);delete group[change.field];
  }
  for(const e of restored[46].exercises)e.words=e.words.map(w=>{
    const ref=w.reviewOf,original=restored[ref.set].exercises.flatMap(e=>e.words).find(x=>x.word===ref.word&&x.si===ref.si);
    assert(original);return {...structuredClone(original),reviewOf:ref};
  });
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(restored)).digest('hex'),'f9aaab01e26c57c171be1ed705bb27b87b502fdd4fdc458e282e8f3b2813061d','Changes exceed the complete editorial audit');
  return restored;
}
module.exports={audit,restoreReviewedBaseline};
