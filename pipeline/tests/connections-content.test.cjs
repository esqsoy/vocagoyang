const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const repo=path.resolve(__dirname,'../..'),html=fs.readFileSync(path.join(repo,'vocagoyangfable.html'),'utf8');
const readConst=name=>JSON.parse(html.match(new RegExp('const '+name+' = ([^\\n]+);\\r?\\n'))[1]);
const DATA=readConst('DATA'),CONNECTIONS=readConst('CONNECTIONS');
assert.deepEqual(CONNECTIONS,JSON.parse(fs.readFileSync(path.join(repo,'pipeline/connections.json'),'utf8')));
// Keep historical audit IDs after removing yeah/oh at indices 4 and 5 of 0:4.
const prior=new Map(DATA.slice(0,49).flatMap(L=>L.exercises.flatMap(e=>e.words.map((w,i)=>{
  const oldIndex=e.legacyWords?e.legacyWords.findIndex(x=>x.word===w.word&&x.si===w.si):i;assert(oldIndex>=0);
  return [`${L.lesson}:${e.ex}:${L.lesson===0&&e.ex===4&&oldIndex>=4?oldIndex+2:oldIndex}`,w];
}))));
const seen=new Set(),entries=new Map(CONNECTIONS.entries.map(e=>[e.id,e]));
assert.equal(entries.size,CONNECTIONS.entries.length);
assert.equal(CONNECTIONS.review.cards,6715);
const checked=new Set();
// The historical reread included the retired slang unit plus yeah and oh.
const retired=new Set([...Array.from({length:19},(_,i)=>`0:10:${i}`),'0:4:4','0:4:5',...require('./helpers/editorial-review.cjs').audit.removals.map(r=>r.id)]);
for(const id of retired)assert(!prior.has(id),'Retired card remains active: '+id);
for(const filename of CONNECTIONS.review.auditFiles){
  const audit=JSON.parse(fs.readFileSync(path.join(repo,'pipeline',filename),'utf8'));
  assert.equal(audit.readCardIds.length,audit.readCardCount);
  for(const id of audit.readCardIds){assert(prior.has(id)||retired.has(id),id);assert(!checked.has(id),'Repeated audit card '+id);checked.add(id);}
}
assert.equal(checked.size,6715,'Full reread is incomplete');
assert.equal(prior.size,6667);for(const id of prior.keys())assert(checked.has(id),'Active card was not reviewed: '+id);
const between=(a,b)=>html.slice(html.indexOf(a),html.indexOf(b,html.indexOf(a)+a.length));
const ctx=vm.createContext({ALT:{}});
vm.runInContext(between('function normalize(','function shuffle(')+'\n'+between('function isAliasHit(','const SYNLINES='),ctx);
let aliases=0,sourceRefs=0;
for(const course of CONNECTIONS.courses){
  const L=DATA.find(L=>L.lesson===course.lesson);
  assert(L&&L.kind==='connections');assert.equal(L.progressId,course.progressId);
  assert.equal(L.exercises.length,course.groups.length);
  assert.deepEqual(L.exercises,JSON.parse(fs.readFileSync(path.join(repo,`pipeline/out/set${course.lesson}.json`),'utf8')));
  for(const [i,g] of course.groups.entries()){
    assert(g.entryIds.length>=6&&g.entryIds.length<=12,'Unbalanced exercise '+g.name);
    const actual=L.exercises[i];assert.equal(actual.name,g.name);
    assert.deepEqual(actual.words.map(w=>w.constructionId),g.entryIds);
    assert(new Set(actual.words.map(w=>w.word)).size>=4,'Too few different answers in one exercise');
    for(const [j,id] of g.entryIds.entries()){
      assert(!seen.has(id),'Card assigned twice '+id);seen.add(id);
      const entry=entries.get(id);assert(entry,id);const w=entry.card,raw=actual.words[j];
      for(const field of ['word','en','ko','ex','tr','c','ipa','pos'])assert(typeof w[field]==='string'&&w[field].trim(),id+' '+field);
      assert.equal(w.word,w.en,id);assert.equal((w.ex.match(/\{\{BLANK\}\}/g)||[]).length,1,id+' blank');
      assert(!/[<>]/.test(w.ex+w.tr+w.c),id+' markup');
      assert(w.c.length<=70,id+' explanation length');
      const sentence=w.ex.replace('{{BLANK}}',w.en),wordCount=sentence.trim().split(/\s+/).length;
      assert(wordCount<=10||entry.lengthNote,id+' longer example lacks review');
      assert(entry.connection&&entry.ambiguityNote,id+' review metadata');
      assert(['revisit','new-sense','new-expression'].includes(entry.status),id+' status');
      assert(entry.priorRefs.length>0,id+' no learning bridge');
      for(const ref of entry.priorRefs){assert(prior.has(ref),id+' bad prior ref '+ref);sourceRefs++;}
      assert(entry.sources.length>0&&entry.sources.every(s=>/^https:\/\//.test(s)),id+' sources');
      const {constructionId,si,sn,...rest}=raw;assert.deepEqual(rest,w,id+' generated card drift');
      const runtime={term:w.en,constructionId:id,acceptedAnswers:w.acceptedAnswers};
      assert(ctx.isCorrect(w.en.replace(/\s/g,''),w.en),id+' spaceless phrase input');
      for(const a of w.acceptedAnswers||[]){
        assert(a.trim()===a&&a.length&&!ctx.isCorrect(a,w.en),id+' redundant alias');
        assert(ctx.isAliasHit(a,runtime),id+' alias not accepted');aliases++;
      }
      // No ordinary-word alias may migrate to a different meaning in a new course.
      ctx.ALT[w.en+'/'+si]=['impossible alias sentinel'];
      assert(!ctx.isAliasHit('impossible alias sentinel',{...runtime,si}),id+' alias leakage');
    }
  }
}
assert.equal(seen.size,entries.size,'Unassigned cards remain');
console.log(JSON.stringify({newCards:entries.size,courses:CONNECTIONS.courses.length,existingCardsRead:checked.size,priorReferences:sourceRefs,explicitAcceptedAnswers:aliases,allExamples:'one blank; length and explanation bounds checked',cardAndSourceSync:'passed',legacyAliasIsolation:'passed'}));
