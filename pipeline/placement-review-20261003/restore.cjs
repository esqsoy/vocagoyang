'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const plan=JSON.parse(fs.readFileSync(path.join(__dirname,'placement.json'),'utf8'));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function restoreRegrouping(data){
 const restored=structuredClone(data);
 if(!restored.some(L=>L.placementHistory))return restored;
 assert.equal(hash(restored),plan.audit.afterDataSha256,'Unlogged edit after the approved regrouping');
 const lessons=new Map(restored.map(L=>[L.lesson,L])),cards=new Map();
 for(const rewrite of plan.rewrites){
  const L=lessons.get(rewrite.lesson),index=L.exercises.findIndex(e=>e.ex===rewrite.metadata.ex);assert(index>=0);
  const [exercise]=L.exercises.splice(index,1);assert.equal(exercise.words.length,rewrite.cards.length);
  exercise.words.forEach((word,i)=>{const card=structuredClone(word);delete card.savedId;cards.set(rewrite.cards[i].join(':'),card);});
 }
 for(const group of plan.beforeGroups){
  const L=lessons.get(group.lesson),words=Array.from({length:group.cardCount},(_,i)=>{const word=cards.get([group.lesson,group.metadata.ex,i].join(':'));assert(word);return word;});
  L.exercises.splice(group.index,0,{...structuredClone(group.metadata),words});
 }
 for(const L of restored)delete L.placementHistory;
 for(const move of plan.wholeMoves){
  const source=lessons.get(move.fromLesson),target=lessons.get(move.toLesson),index=target.exercises.findIndex(e=>e.ex===move.toExercise);assert(index>=0);
  const [exercise]=target.exercises.splice(index,1);assert.equal(exercise.words.length,move.cards);
  source.exercises.splice(move.fromIndex,0,{...structuredClone(move.originalMetadata),words:exercise.words});
 }
 for(const change of plan.titleChanges){const L=lessons.get(change.lesson);assert.equal(L.name,change.new);L.name=change.old;}
 assert.equal(hash(restored),plan.audit.beforeDataSha256,'Regrouping changed an unapproved card or field');
 return restored;
}
module.exports={restoreRegrouping};
