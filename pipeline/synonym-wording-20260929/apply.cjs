// Apply only reviewed content fields. Keep all answer rules and card identities.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../..'),p=path.join(root,'pipeline');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const write=(f,x)=>fs.writeFileSync(f,JSON.stringify(x,null,2)+'\n');
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const htmlFile=path.join(root,'vocagoyangfable.html');
const shell=h=>h.replace(/const (DATA|MORPHOLOGY|CONNECTIONS) = [^\n]+;\r?\n/g,'const $1 = CONTENT;\n').replace(/\r\n/g,'\n');
const appShellSha256=hash(shell(fs.readFileSync(htmlFile,'utf8')));
const readData=()=>JSON.parse(fs.readFileSync(htmlFile,'utf8').match(/const DATA = ([^\n]+);\r?\n/)[1]);
const before=readData();
assert.equal(hash(before),'3194965e0233062a9eb301633528ea96c82aa2d57936df1fce6786f9087716bc','Start from the reviewed live content');
const parts=['part-00-15.json','part-16-32.json','part-33-45.json','part-47-50.json'].map(f=>read(path.join(__dirname,f)));
const edits=parts.flatMap(x=>x.changes),sources=new Map(),seen=new Set();
function source(file){if(!sources.has(file))sources.set(file,read(file));return sources.get(file);}
for(const edit of edits){
 const {lesson,exercise,word,si,field}=edit,key=[lesson,exercise,word,si,field].join(':');
 assert(!seen.has(key),'Duplicate change '+key);seen.add(key);
 assert.equal(field,'c','Only synonym explanations may change');
 const words=before.find(x=>x.lesson===lesson)?.exercises.find(x=>x.ex===exercise)?.words;
 const matches=words?.filter(w=>w.word===word&&w.si===si)||[];assert.equal(matches.length,1,key);
 const card=matches[0];assert.deepEqual(card[field],edit.old,key+' baseline');assert.notDeepEqual(edit.old,edit.new,key+' no-op');
 let raw;
 if(lesson<=45){
  const name=lesson<5?`lesson${String(lesson).padStart(2,'0')}`:`set${String(lesson).padStart(2,'0')}`;
  const file=path.join(p,'out',name+'.json'),d=source(file),groups=Array.isArray(d)?d:d.exercises;
  raw=groups.find(e=>e.ex===exercise).words.find(w=>w.word===word&&w.si===si);
 }else if(lesson===47||lesson===48){
  const unit=source(path.join(p,'morphology.json')).units.find(x=>x.id===card.unitId);
  const candidates=unit.cards.filter(w=>w.word===word);assert.equal(candidates.length,1,key);raw=candidates[0];
 }else if(lesson===49||lesson===50){
  raw=source(path.join(p,'connections.json')).entries.find(x=>x.id===card.constructionId).card;
 }else throw new Error('Edit source of referenced cards, not set 46');
 assert(raw,key+' raw card');assert.deepEqual(raw[field],edit.old,key+' source baseline');raw[field]=edit.new;
}
// Validation above is complete before the first source file is written.
for(const [file,d] of sources)write(file,d);
cp.execFileSync(process.argv[2]||'python',[path.join(p,'assemble.py')],{cwd:root,stdio:'inherit'});
const after=readData(),changes=[];
assert.equal(hash(shell(fs.readFileSync(htmlFile,'utf8'))),appShellSha256,'Gameplay and UI must not change');
const scrub=d=>d.map(L=>({...L,exercises:L.exercises.map(e=>({...e,words:e.words.map(w=>{const {ex,tr,c,...rest}=w;return rest;})}))}));
assert.deepEqual(scrub(after),scrub(before),'Cards, order, answers, IPA and progress metadata must stay identical');
for(let li=0;li<before.length;li++)for(let ei=0;ei<before[li].exercises.length;ei++){
 const L=before[li],e=L.exercises[ei];
 for(let wi=0;wi<e.words.length;wi++){
  const old=e.words[wi],now=after[li].exercises[ei].words[wi];
  for(const field of ['ex','tr','c'])if(old[field]!==now[field]){
   const original=edits.find(x=>x.lesson===L.lesson&&x.exercise===e.ex&&x.word===old.word&&x.si===old.si&&x.field===field);
   assert(original||old.reviewOf||old.topicReviewOf,'Unexpected generated change');
   changes.push({lesson:L.lesson,exercise:e.ex,index:wi,word:old.word,si:old.si,field,old:old[field],new:now[field],reason:original?.reason||'원본 카드 교정을 참조 복습에 반영',...(original?.sources?{sources:original.sources}:{})});
  }
 }
}
const summary={date:'2026-09-29',baselineCommit:'de20aad',baselineDataSha256:hash(before),afterDataSha256:hash(after),appShellSha256,scope:'FABLE synonym-note wording only; no new accepted answers',readCards:after.reduce((n,L)=>n+L.exercises.reduce((m,e)=>m+e.words.length,0),0),sourceChanges:edits.length,changedCards:new Set(changes.map(x=>`${x.lesson}:${x.exercise}:${x.index}`)).size,changes};
write(path.join(__dirname,'findings.json'),summary);
console.log(JSON.stringify({fields:changes.length,cards:summary.changedCards,sourceChanges:edits.length,reviewCopies:changes.length-edits.length,afterDataSha256:summary.afterDataSha256}));
