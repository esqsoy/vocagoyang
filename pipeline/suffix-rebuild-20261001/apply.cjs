'use strict';
// Historical one-time application of the reviewed overlays. Future edits belong
// in morphology.json; this script must not overwrite a later curriculum.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(name,value)=>fs.writeFileSync(path.join(__dirname,name),JSON.stringify(value,null,2)+'\n');
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const data=()=>JSON.parse(fs.readFileSync(path.join(root,'vocagoyangfable.html'),'utf8').match(/const DATA = ([^\n]+);\r?\n/)[1]);
assert(!fs.existsSync(path.join(__dirname,'findings.json')),'Already applied: edit the canonical source instead of replaying this patch');
const before=data(),oldMorph=read(path.join(root,'pipeline/morphology.json'));
const previous=read(path.join(__dirname,'../morphology-rebuild-20260930/findings.json'));
assert.equal(hash(before),previous.afterDataSha256,'Recheck changes made after the proposal');
assert.equal(hash(oldMorph),previous.afterMorphologySha256);
const overlays=[47,48].map(n=>read(path.join(__dirname,`set${n}-overlay.json`)));
const morph=structuredClone(oldMorph);morph.version='2026-10-01';
morph.courses=overlays.map(o=>({...o.course,progressId:`morphology-${o.course.lesson}-20261001`}));
morph.units=overlays.flatMap(o=>o.units);
const oldUnits=new Map(oldMorph.units.map(u=>[u.id,u])),units=new Map(morph.units.map(u=>[u.id,u]));
assert.equal(units.size,morph.units.length);
const changes=[];
for(const [id,u] of oldUnits){
 const v=units.get(id);assert(v,id);
 for(const card of u.cards){
  const matches=v.cards.filter(w=>w.word===card.word);assert.equal(matches.length,1,id+':'+card.word);
  const {c:oldC,...oldRest}=card,{c:newC,...newRest}=matches[0];
  assert.deepEqual(newRest,oldRest,'An existing card changed beyond its explanation');
  if(oldC!==newC)changes.push({unitId:id,word:card.word,field:'c',old:oldC,new:newC});
 }
}
const oldHeads=new Set(before.flatMap(L=>L.exercises.flatMap(e=>e.words.map(w=>w.word.toLowerCase()))));
const additions=overlays.flatMap(o=>o.addedCards).map(row=>({...row,type:oldHeads.has(row.word.toLowerCase())?'existing_pool_review':'new_headword'}));
assert.equal(additions.length,30);assert.equal(additions.filter(x=>x.type==='existing_pool_review').length,25);
assert.deepEqual(additions.filter(x=>x.type==='new_headword').map(x=>x.word).sort(),['biome','chromosome','genome','microbiome','ribosome']);
const assigned=morph.courses.flatMap(L=>L.groups.flatMap(g=>g.unitIds));
assert.equal(assigned.length,units.size);assert.equal(new Set(assigned).size,units.size);
for(const L of morph.courses)for(const g of L.groups){
 const cards=g.unitIds.flatMap(id=>units.get(id).cards);assert(cards.length>=8&&cards.length<=15,g.name);
 for(const w of cards){assert.equal((w.ex.match(/\{\{BLANK\}\}/g)||[]).length,1,w.word);assert(w.ex.replace('{{BLANK}}',w.en).split(/\s+/).length<=10,w.word);assert(w.c.length<=70,w.word);}
}
write('before-morphology.json',oldMorph);
fs.writeFileSync(path.join(root,'pipeline/morphology.json'),JSON.stringify(morph,null,2)+'\n');
process.stdout.write(cp.execFileSync(process.argv[2]||'python',['-X','utf8',path.join(root,'pipeline/assemble.py')],{encoding:'utf8'}));
const after=data(),lessonChanges=[];
for(const [i,L] of after.entries()){
 if([47,48].includes(L.lesson))lessonChanges.push({lesson:L.lesson,old:before[i],new:L});
 else assert.deepEqual(L,before[i],'An unrelated course changed');
}
write('findings.json',{date:'2026-10-01',status:'local-not-deployed',baselineDataSha256:hash(before),afterDataSha256:hash(after),baselineMorphologySha256:hash(oldMorph),afterMorphologySha256:hash(morph),lessonChanges,addedCardProvenance:additions,explanationChanges:changes,counts:{retained:327,existingReviewCards:25,newHeadwords:5,morphologyCards:357,totalCards:after.flatMap(L=>L.exercises.flatMap(e=>e.words)).length}});
console.log(JSON.stringify({retained:327,addedCards:additions.length,explanationChanges:changes.length,units:units.size,courses:morph.courses.map(L=>({lesson:L.lesson,exercises:L.groups.length,cards:L.groups.flatMap(g=>g.unitIds.flatMap(id=>units.get(id).cards)).length}))}));
