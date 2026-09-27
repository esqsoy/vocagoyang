const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const repo=path.resolve(__dirname,'../..');
const html=fs.readFileSync(path.join(repo,'vocagoyangfable.html'),'utf8');
const DATA=JSON.parse(html.match(/const DATA = ([^\n]+);\r?\n/)[1]);
const {poolExpansion:review,restorePoolExpansion}=require('./helpers/editorial-review.cjs');
const before=restorePoolExpansion(DATA),json=JSON.stringify;
const group=(data,l,e)=>data.find(L=>L.lesson===l).exercises.find(x=>x.ex===e);
const cardAt=(data,id)=>{const[l,e,i]=id.split(':').map(Number);return group(data,l,e).words[i];};
const cardKey=w=>w.word+'/'+w.si,groupKey=(l,e)=>l+':'+e;
const count=data=>data.flatMap(L=>L.exercises.flatMap(e=>e.words)).length;
const signature=e=>e.words.map(cardKey);
assert.equal(count(before),6861);assert.equal(count(DATA),6876);
assert.equal(DATA.length,51);assert.equal(DATA.reduce((n,L)=>n+L.exercises.length,0),520);
assert.equal(DATA.slice(0,49).flatMap(L=>L.exercises.flatMap(e=>e.words)).length,6684);
assert.equal(review.additions.length,17);assert.equal(review.removals.length,2);
const expectedNew=['eventually','virtually','respectively','thereby','given','essential','essential','entertain','furnish','worry','surprise','bill','nothing but','anything but','even if','even though','as long as'];
assert.deepEqual(review.additions.map(x=>x.card.word).sort(),expectedNew.sort());
assert.deepEqual(review.removals.map(x=>x.card.word).sort(),['proceedings','tyre']);
assert.equal(DATA[44].exercises.flatMap(e=>e.words).filter(w=>w.word==='tempt').length,2,'Keep both approved tempt exercises');
assert.equal(DATA[41].exercises.flatMap(e=>e.words).filter(w=>w.word==='proceeding').length,2,'Keep legal and event proceedings');
assert.deepEqual(DATA.slice(46),before.slice(46),'The review, root, and connection courses were not expanded');

const additions=new Map(review.additions.map(x=>[x.id,x]));
const removals=new Map(review.removals.map(x=>[x.id,x]));
assert.equal(additions.size,17);assert.equal(removals.size,2);
for(const [id,item] of additions)assert.deepEqual(cardAt(DATA,id),item.card,'Added card drifted: '+id);
for(const [id,item] of removals)assert.deepEqual(cardAt(before,id),item.card,'Removed card snapshot drifted: '+id);
const edits=new Map(review.fieldChanges.map(x=>[x.id+'/'+x.field,x]));
assert.equal(edits.size,review.fieldChanges.length,'Duplicate existing-card edit');
const resetGroups=new Set(review.progress.resetGroups.map(g=>groupKey(g.lesson,g.ex)));
assert.equal(resetGroups.size,review.progress.resetGroups.length);
let structuralGroups=0,changedFields=0;
for(const L of before){
  const next=DATA.find(x=>x.lesson===L.lesson);
  const {exercises:oldExercises,...oldMeta}=L,{exercises:newExercises,...newMeta}=next;
  assert.deepEqual(newMeta,oldMeta,'Set metadata changed');
  assert.deepEqual(newExercises.map(e=>e.ex),oldExercises.map(e=>e.ex),'Original exercise order changed');
  for(const old of oldExercises){
    const current=group(DATA,L.lesson,old.ex),key=groupKey(L.lesson,old.ex);
    const structural=json(signature(old))!==json(signature(current));
    assert.equal(resetGroups.has(key),structural,'Reset only changed card membership: '+key);
    if(structural){
      structuralGroups++;
      assert.equal(current.progressId,'fable-pool-20260927-set'+L.lesson+'-ex'+old.ex);
      assert.notEqual(current.progressId,old.progressId);
    }else assert.equal(current.progressId,old.progressId,'Unchanged group lost its records');
    const {words:oldWords,progressId:oldId,...oldGroupMeta}=old;
    const {words:newWords,progressId:newId,...newGroupMeta}=current;
    assert.deepEqual(newGroupMeta,oldGroupMeta,'Unaudited group metadata change: '+key);
    assert.equal(new Set(newWords.map(cardKey)).size,newWords.length,'Duplicate card identity: '+key);
    const keptOld=oldWords.filter((w,i)=>!removals.has(key+':'+i));
    const keptNew=newWords.filter((w,i)=>!additions.has(key+':'+i));
    assert.deepEqual(keptNew.map(cardKey),keptOld.map(cardKey),'Surviving cards changed order or sense identity: '+key);
    for(const [i,oldCard] of oldWords.entries()){
      const id=key+':'+i;if(removals.has(id))continue;
      const currentCard=keptNew.find(w=>cardKey(w)===cardKey(oldCard));assert(currentCard,id);
      for(const field of ['word','en','si'])assert.equal(currentCard[field],oldCard[field],'Existing answer identity changed: '+id);
      for(const field of new Set([...Object.keys(oldCard),...Object.keys(currentCard)])){
        if(json(oldCard[field])===json(currentCard[field]))continue;
        const edit=edits.get(id+'/'+field);assert(edit,'Unlogged survivor field: '+id+'/'+field);
        assert.deepEqual(edit.old,oldCard[field]);assert.deepEqual(edit.new,currentCard[field]);changedFields++;
      }
    }
  }
}
assert.equal(changedFields,edits.size,'A declared existing-card edit was not applied');
assert.equal(structuralGroups,resetGroups.size);
for(const item of review.additions){
  const L=DATA[item.placement.lesson],peers=L.exercises.flatMap(e=>e.words).filter(w=>w.word===item.card.word);
  assert(peers.every(w=>w.sn===peers.length),'Incorrect displayed sense total: '+item.card.word);
  assert.deepEqual(peers.map(w=>w.si).sort((a,b)=>a-b),Array.from({length:peers.length},(_,i)=>i+1));
}
function between(start,end){
  const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
  assert(a>=0&&b>a,start);return html.slice(a,b);
}
function makeProgressContext(data){
  const state={progress:{},lessons:[],prevOn:false},storage=new Map();
  const ctx=vm.createContext({DATA:data,state,Set,Map,Math,JSON,STORAGE:'pool-test-progress',LASTKEY:'pool-test-last',
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}});
  vm.runInContext([
    between('function buildLessons()','/* ===== progress / route ===== */'),
    between('function loadProgress()','/* ===== screens ===== */'),
    between('function saveLast(','/* 발음 읽어주기')
  ].join('\n'),ctx);
  return {ctx,state,storage};
}
const oldRuntime=makeProgressContext(before),live=makeProgressContext(DATA);
const oldParts=oldRuntime.state.lessons.flatMap((L,li)=>L.exercises.map((e,ei)=>({L,e,li,ei})));
const parts=live.state.lessons.flatMap((L,li)=>L.exercises.map((e,ei)=>({L,e,li,ei})));
assert.equal(parts.length,612);assert.equal(review.summary.playableExercises,612);
assert.equal(Math.min(...parts.map(x=>x.e.words.length)),4);
assert.equal(Math.max(...parts.map(x=>x.e.words.length)),15);
assert.equal(resetGroups.size,16);assert.equal(review.groupChanges.length,17);
assert.equal(parts.reduce((n,x)=>n+x.e.words.length,0),6876);
const uniqueRecordKeys=new Set();
for(const {L,e} of parts){
  const key=json(live.ctx.recordKey(L.id,e.title));assert(!uniqueRecordKeys.has(key),'Duplicate current record key');uniqueRecordKeys.add(key);
}
// Freeze the source namespace from BEFORE expansion; deriving oldId from the
// revised group's progressId would only test fake old records in a new namespace.
let resetParts=0,retainedParts=0;
for(const L of before)for(const old of L.exercises){
  const key=groupKey(L.lesson,old.ex),wasReset=resetGroups.has(key);
  const prior=oldParts.filter(x=>x.L.lesson===L.lesson&&x.e.ex===old.ex);
  const current=parts.filter(x=>x.L.lesson===L.lesson&&x.e.ex===old.ex);
  const records=new Map();
  for(const {L:oldL,e} of prior){
    const [id,title]=oldRuntime.ctx.recordKey(oldL.id,e.title);
    records.set(json([id,title]),{id,title});
    if(e.parentRecord)records.set(json([e.parentRecord.id,e.parentRecord.title]),e.parentRecord);
    for(const r of (e.priorCoverage||[]).flat())records.set(json([r.id,r.title]),r);
  }
  live.state.progress={};
  for(const {id,title} of records.values())(live.state.progress[id]??={})[title]={completed:true};
  const untouched=json(live.state.progress);
  for(const {L:nextL,e} of current){
    assert.equal(!!live.ctx.getRec(nextL.id,e.title)?.completed,!wasReset,'Historical record falsely clears or loses '+key+' / '+e.title);
    if(wasReset)resetParts++;else retainedParts++;
  }
  assert.equal(live.ctx.clearedExercises(),wasReset?0:current.length,'Old group records clear unrelated cards: '+key);
  assert.equal(json(live.state.progress),untouched,'Reading progress rewrites stored history');
}
// Every live part can save, reload, and resume independently. A new part's
// completion cannot complete its siblings or reuse an old whole-topic key.
for(const [i,{L,e,li,ei}] of parts.entries()){
  live.state.progress={};live.ctx.saveLast(L.id,e.title);
  let target=live.ctx.resumeTarget();assert.equal(target.li,li);assert.equal(target.ei,ei);
  live.ctx.setRec(L.id,e.title,{});
  assert.equal(json(live.ctx.loadProgress()),json(live.state.progress));
  assert.equal(live.ctx.clearedExercises(),1,'One live part completed extra parts');
  live.state.progress=live.ctx.loadProgress();assert(live.ctx.getRec(L.id,e.title)?.completed);
  target=live.ctx.resumeTarget();
  const expected=parts[(i+1)%parts.length];assert.equal(target.li,expected.li);assert.equal(target.ei,expected.ei);
}
for(const [li,L] of live.state.lessons.entries()){
  assert.equal(json(L.exercises.flatMap(e=>e.words).map(w=>[w.word,w.si])),json(DATA[li].exercises.flatMap(e=>e.words).map(w=>[w.word,w.si])),'Splitting changes live card order');
  const owners=new Map();
  if(li<46)for(const e of L.exercises)for(const w of e.words){
    const key=w.word.trim().toLowerCase();
    if(owners.has(key))assert.equal(owners.get(key),e.title,'Split a headword: '+key);else owners.set(key,e.title);
  }
}

// Exercise the actual mirrorTyped -> submit path for all new cards and their
// approved alternatives. These are ordinary vocabulary cards: do not fake a
// constructionId, which would enable a different long-alias input path.
const elements=new Map(),$=id=>{
  if(!elements.has(id))elements.set(id,{value:'',innerHTML:'',textContent:'',disabled:false,classList:{add(){},remove(){}}});
  return elements.get(id);
};
const inputState={composing:false,session:null},noop=()=>{};
let decision=null,submissions=[];
const input=vm.createContext({state:inputState,$,Date,Set,CAT:{},
  LINES:{correct:['correct'],correctStreak:['correct'],wrong:['wrong'],timeout:['timeout']},
  esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;'),pick:lines=>lines[0],
  applyCorrect:w=>{decision=true;w.passed=true;},applyWrong:()=>{decision=false;},
  isSynonymMiss:()=>false,fx:noop,beep:noop,setCat:noop,showReveal:noop,startCopy:noop,armReveal:noop,updateStats:noop});
vm.runInContext([
  between('function normalize(','function shuffle('),
  between('function variantKey(','function isAliasHit('),
  between('function isAliasHit(','const SYNLINES='),
  between('function hasHangul(','function composingKey('),
  between('function mirrorTyped(','function slots('),
  between('function submit(','function applyCorrect(')
].join('\n'),input);
const realSubmit=input.submit;
input.submit=options=>{const typed=$('#ainput').value;realSubmit(options);submissions.push({typed,correct:decision});};
const letters=s=>s.toLowerCase().replace(/[^a-z]/g,'');
let typingPaths=0,aliasPaths=0,phrasePaths=0;
function typeAnswer(card,answer,compact,alias){
  const typed=compact?answer.replace(/\s/g,''):answer;
  const w={term:card.en,meaning:card.ko,si:card.si,acceptedAnswers:card.acceptedAnswers||[],id:0,attempts:0,corrects:0,errors:0,passed:false};
  assert(!w.constructionId,'New vocabulary must use its actual input branch');
  inputState.session={currentId:0,words:[w],answered:false,copyMode:false,round:1,cardStart:Date.now()-1000,hintLevel:0,
    attempts:0,errors:0,firstSeen:0,firstCorrect:0,streak:0,seenSet:new Set()};
  inputState.composing=false;decision=null;submissions=[];$('#ainput').value='';
  for(const c of typed){
    $('#ainput').value+=c;input.mirrorTyped();
    if(submissions.length){
      assert.equal(submissions.length,1,'Repeated submission: '+card.word);
      assert(input.isCorrect(submissions[0].typed,answer),'Premature answer truncation: '+card.word+' -> '+answer);
      assert.equal(submissions[0].correct,true,'Real submit rejected '+answer);
    }
  }
  assert.equal(submissions.length,1,'Complete answer did not auto-submit: '+answer);
  assert(inputState.session.answered);assert.equal(w.corrects,1);assert.equal(w.errors,0);
  typingPaths++;if(alias)aliasPaths++;if(card.en.includes(' '))phrasePaths++;
}
for(const {card} of review.additions){
  assert.equal(card.en,card.word);
  for(const compact of [false,true])typeAnswer(card,card.en,compact,false);
  for(const alias of card.acceptedAnswers||[]){
    assert.equal(letters(alias).length,letters(card.en).length,'Review ordinary-card alias input length: '+card.word);
    assert(!input.isCorrect(alias,card.en),'Redundant accepted answer');
    for(const compact of [false,true])typeAnswer(card,alias,compact,true);
  }
}
assert.equal(typingPaths-aliasPaths,34);
assert.equal(review.additions.filter(x=>x.card.en.includes(' ')).length,5);
assert(aliasPaths>0,'Approved same-length aliases were not exercised');
assert(phrasePaths>=10);
console.log(JSON.stringify({cards:count(DATA),added:17,removed:2,sourceGroups:520,playableExercises:parts.length,
  resetGroups:resetGroups.size,resetParts,retainedParts,newRecordAndResumeCases:parts.length,
  historicalBaseline:'fixed SHA-256 restored',unlistedFields:'unchanged',headwordSplits:0,
  typingPaths,aliasPaths,phrasePaths,actualInputBranch:'ordinary vocabulary; exact and spaceless answers'}));
