'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const placement=JSON.parse(fs.readFileSync(path.join(__dirname,'lesson-placement-20261003.json'),'utf8'));
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
function restoreLessonPlacement(data){
 const restored=require('./placement-review-20261003/restore.cjs').restoreRegrouping(data);
 if(!restored.some(L=>L.exercises?.some(e=>e.relocatedFrom)))return restored;
 assert.equal(hash(restored),placement.audit.afterDataSha256,'Unlogged edit after lesson relocation');
 for(const move of placement.moves){
  const source=restored.find(L=>L.lesson===move.fromLesson),target=restored.find(L=>L.lesson===move.toLesson);
  const index=target.exercises.findIndex(e=>e.ex===move.toExercise);assert(index>=0);
  const [exercise]=target.exercises.splice(index,1);assert.equal(exercise.words.length,move.cards);
  source.exercises.splice(move.fromIndex,0,{...structuredClone(move.originalMetadata),words:exercise.words});
 }
 for(const change of placement.titleChanges){
  const lesson=restored.find(L=>L.lesson===change.lesson);assert.equal(lesson.name,change.new);lesson.name=change.old;
 }
 assert.equal(hash(restored),placement.audit.beforeDataSha256,'Relocation changed more than the approved placement');
 return restored;
}
module.exports={restoreLessonPlacement};
