const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const audit=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../editorial-review-20260925/findings.json'),'utf8'));
const explanationReview=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../explanation-review-20260927/findings.json'),'utf8'));
const stressReview=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../stress-review-20260927/findings.json'),'utf8'));
const topicReview=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../topic-review-20260927/findings.json'),'utf8'));
function restoreTopicGrouping(data){
  const restored=structuredClone(data);
  // Remove only the two audited calendar repeats and their grouping metadata
  // before restoring explanation snapshots at their historical card indexes.
  for(const change of topicReview.metadataChanges){
    const group=restored[change.lesson].exercises.find(e=>e.ex===change.ex);
    assert.deepEqual(group[change.field],change.new);delete group[change.field];
  }
  for(const added of [...topicReview.additions].sort((a,b)=>b.index-a.index)){
    const words=restored[added.lesson].exercises.find(e=>e.ex===added.ex).words;
    assert.deepEqual(words[added.index],added.card);words.splice(added.index,1);
  }
  return restored;
}
function restoreReviewedBaseline(data){
  const restored=restoreTopicGrouping(data);
  // Reverse the later explanation-only review before checking the original audit.
  // The historical baseline hash remains unchanged and still rejects unlogged edits.
  for(const review of [stressReview,explanationReview])for(const change of review.changes){
    const [set,exercise,index]=change.id.split(':').map(Number);
    const card=restored[set].exercises.find(e=>e.ex===exercise).words[index];
    assert.equal(change.field,'c');assert.equal(card.word,change.word);assert.equal(card.si,change.si);
    assert.equal(card.c,change.new,change.id+' explanation');card.c=change.old;
  }
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
module.exports={audit,restoreReviewedBaseline,restoreTopicGrouping};
