const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const audit=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../editorial-review-20260925/findings.json'),'utf8'));
const explanationReview=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../explanation-review-20260927/findings.json'),'utf8'));
const stressReview=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../stress-review-20260927/findings.json'),'utf8'));
const topicReview=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../topic-review-20260927/findings.json'),'utf8'));
const contentReview=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../content-review-20260927/findings.json'),'utf8'));
const poolExpansion=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../pool-expansion-20260927/findings.json'),'utf8'));
const playerFeedbacks=['20260927','20260928'].map(date=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../player-feedback-'+date+'.json'),'utf8')));
const {review:synonymReview,restoreSynonymReview}=require('../../synonym-review-20260929/restore.cjs');
const meaningHints=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../meaning-hints-20261002.json'),'utf8'));
function restorePlayerFeedback(data){
  const restored=restoreSynonymReview(data),hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
  for(const playerFeedback of [...playerFeedbacks].reverse()){
    assert.equal(hash(restored),playerFeedback.afterDataSha256,'Unlogged change after player feedback');
    for(const change of [...playerFeedback.changes].reverse()){
      const group=restored.find(L=>L.lesson===change.lesson)?.exercises.find(e=>e.ex===change.exercise);
      const card=group?.words.find(w=>w.word===change.word&&w.si===change.si);assert(card);
      assert(['c','ex','tr','meow'].includes(change.field),'Only recorded content fields may change');
      assert.equal(card[change.field],change.new);
      if(change.oldExists===false)delete card[change.field];else card[change.field]=change.old;
    }
    assert.equal(hash(restored),playerFeedback.baselineDataSha256,'Changes exceed recorded player feedback');
  }
  return restored;
}
function restorePoolExpansion(data){
  const restored=restorePlayerFeedback(data),seen=new Set();
  const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(poolExpansion.baselineDataSha256,'9a25a4b1ca7b344c2b77223c7c5486a975c7eadae4bcdb626847c2ef0e6ae6c7','Do not rewrite the pre-expansion content baseline');
  assert.equal(hash(restored),poolExpansion.afterDataSha256,'Unlogged change after the pool expansion');
  for(const change of poolExpansion.groupChanges){
    const key=`${change.lesson}:${change.ex}`;assert(!seen.has(key),'Duplicate pool group '+key);seen.add(key);
    const lesson=restored.find(L=>L.lesson===change.lesson);assert(lesson,key);
    const index=lesson.exercises.findIndex(e=>e.ex===change.ex);assert(index>=0,key);
    assert.deepEqual(lesson.exercises[index],change.new,'Expanded group drifted: '+key);
    lesson.exercises[index]=structuredClone(change.old);
  }
  assert.equal(hash(restored),poolExpansion.baselineDataSha256,'Changes exceed the approved 17 additions and 2 consolidations');
  return restored;
}
function restoreContentReview(data){
  const restored=structuredClone(data);
  for(const change of contentReview.changes){
    const [set,exercise,index]=change.id.split(':').map(Number);
    const card=restored[set].exercises.find(e=>e.ex===exercise).words[index];
    assert.equal(card.word,change.word);assert.equal(card.si,change.si);
    assert.deepEqual(card[change.field],change.new,change.id+' '+change.field);
    card[change.field]=structuredClone(change.old);
  }
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(restored)).digest('hex'),contentReview.baselineDataSha256,'Changes exceed the 2026-09-27 full content review');
  return restored;
}
function restoreTopicGrouping(data,{beforeContentReview=false}={}){
  const restored=require('../../restore-lesson-placement.cjs').restoreLessonPlacement(data);
  const currentReview=crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')===synonymReview.afterDataSha256;
  const beforeSynonymPolicy=require('../../restore-word-family-wording.cjs').restoreSynonymPolicy(data);
  const currentMeaningReview=crypto.createHash('sha256').update(JSON.stringify(beforeSynonymPolicy)).digest('hex')===meaningHints.snapshots.DATA.afterHash;
  // Remove only the two audited calendar repeats and their grouping metadata
  // before restoring explanation snapshots at their historical card indexes.
  for(const change of topicReview.metadataChanges){
    const group=restored[change.lesson].exercises.find(e=>e.ex===change.ex);
    assert.deepEqual(group[change.field],change.new);delete group[change.field];
  }
  for(const added of [...topicReview.additions].sort((a,b)=>b.index-a.index)){
    const words=restored[added.lesson].exercises.find(e=>e.ex===added.ex).words;
    const expected=structuredClone(added.card);
    if(!beforeContentReview)for(const change of contentReview.changes){
      if(change.id===`${added.lesson}:${added.ex}:${added.index}`){
        assert.deepEqual(expected[change.field],change.old);expected[change.field]=structuredClone(change.new);
      }
    }
    if(currentReview)for(const change of synonymReview.changes){
      if(change.lesson===added.lesson&&change.exercise===added.ex&&change.index===added.index){
        assert.equal(expected[change.field],change.old);expected[change.field]=change.new;
      }
    }
    // Apply only the recorded calendar wording delta to the historical fixture.
    // All other fields of these inserted review cards remain independently checked.
    if(currentMeaningReview)for(const change of meaningHints.snapshots.DATA.changes){
      const p=change.path,exerciseIndex=data[added.lesson].exercises.findIndex(e=>e.ex===added.ex);
      if(p.join('/')===`${added.lesson}/exercises/${exerciseIndex}/words/${added.index}/ko`){
        assert.equal(expected.ko,change.old);expected.ko=change.new;
      }
    }
    assert.deepEqual(words[added.index],expected);words.splice(added.index,1);
  }
  return restored;
}
function restoreReviewedBaseline(data){
  const restored=restoreTopicGrouping(restoreContentReview(restorePoolExpansion(data)),{beforeContentReview:true});
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
module.exports={audit,contentReview,poolExpansion,restorePlayerFeedback,restorePoolExpansion,restoreContentReview,restoreReviewedBaseline,restoreTopicGrouping};
