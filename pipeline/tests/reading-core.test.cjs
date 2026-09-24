const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path'),crypto=require('crypto');
// The persistent copy lives in pipeline/tests. Supply a repository path when running this scratch copy.
const repo=path.resolve(process.argv[2]||path.join(__dirname,'../..'));
const h=fs.readFileSync(path.join(repo,'vocagoyangfable.html'),'utf8');
const legacy=JSON.parse(fs.readFileSync(path.join(repo,'pipeline/tests/legacy-progress.fixture.json'),'utf8'));
const priorMorph=JSON.parse(fs.readFileSync(path.join(repo,'pipeline/tests/morphology-progress-before-merge.fixture.json'),'utf8'));
const readConst=name=>JSON.parse(h.match(new RegExp('const '+name+' = ([^\\n]+);\\r?\\n'))[1]);
const DATA=readConst('DATA'),READING_CORE=readConst('READING_CORE'),MORPHOLOGY=readConst('MORPHOLOGY'),CONNECTIONS=readConst('CONNECTIONS');
const between=(a,b)=>{const i=h.indexOf(a),j=h.indexOf(b,i+a.length);assert(i>=0&&j>i,a);return h.slice(i,j);};
for(const s of h.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(s[1]);
assert.deepEqual(DATA.map(L=>L.lesson),Array.from({length:51},(_,i)=>i));
assert.equal(DATA[46].name,'잘못 알기 쉬운 단어들');
assert(!h.includes('id="coreBtn"'));assert(!h.includes('독해 핵심 다시 배우기'));
for(const id of ['studyScreen','studyBack','studyList','studyStart'])assert(!h.includes('id="'+id+'"'),'Unapproved guide UI remains: '+id);
assert(!h.includes('function openMorphologyGuide('),'Optional guide flow must also be removed');
assert.equal(DATA[47].name,'접사로 뜻과 품사 읽기');
assert.equal(DATA[48].name,'어근과 단어 가족');
assert.deepEqual(MORPHOLOGY.courses.map(c=>c.lesson),[47,48]);
for(const [number,kinds] of [[47,['affix']],[48,['latin','greek','germanic']]]){
  assert.equal(DATA[number].kind,'morphology');
  const course=MORPHOLOGY.courses.find(c=>c.lesson===number);assert(course);
  const actual=new Set();
  for(const id of course.groups.flatMap(g=>g.unitIds)){const kind=MORPHOLOGY.units.find(u=>u.id===id)?.kind;assert(kinds.includes(kind),'Wrong course for '+id);actual.add(kind);}
  assert.deepEqual([...actual],kinds);
}
assert.equal(DATA[47].exercises.length,10);assert.equal(DATA[48].exercises.length,16);
assert.equal(DATA[47].exercises.flatMap(e=>e.words).length,71);assert.equal(DATA[48].exercises.flatMap(e=>e.words).length,96);
assert.equal(DATA.slice(0,49).reduce((n,L)=>n+L.exercises.length,0),500);
assert.equal(DATA.slice(0,49).flatMap(L=>L.exercises.flatMap(e=>e.words)).length,6694);
assert.deepEqual(CONNECTIONS.courses.map(c=>c.lesson),[49,50]);
assert.equal(DATA[49].name,'전치사가 잇는 관계');assert.equal(DATA[50].name,'동사 결합으로 읽는 뜻');
for(const L of DATA.slice(49)){assert.equal(L.kind,'connections');assert(L.progressId.startsWith('connections-'));}
let reviewReferences=0;
for(const e of DATA[46].exercises)for(const w of e.words){
  const r=w.reviewOf,original=DATA[r.set].exercises.flatMap(e=>e.words).find(x=>x.word===r.word&&x.si===r.si);
  const {reviewOf,...copy}=w;assert.deepEqual(copy,original,'Review copy drifted');reviewReferences++;
}
const elements=new Map(),storage=new Map(),timed=[],events=[];
let tickerStarts=0,currentScreen='home';
function element(){
  const handlers={};let html='';
  return {textContent:'',value:'',style:{},hidden:false,disabled:false,children:[],attributes:{},
    get innerHTML(){return html;},set innerHTML(v){html=v;this.children=[];},
    classList:{add(){},remove(){},toggle(){}},appendChild(e){this.children.push(e);},
    setAttribute(k,v){this.attributes[k]=v;},addEventListener(n,f){(handlers[n]??=[]).push(f);},
    click(){if(this.disabled)return;this.onclick?.({target:this});for(const f of handlers.click||[])f({target:this});},focus(){},blur(){}};
}
const $=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);};
const state={lessons:[],progress:{},li:0,ei:0,prevOn:false,session:null,ticker:null};
const ctx=vm.createContext({DATA,READING_CORE,MORPHOLOGY,CONNECTIONS,state,$,Set,Map,Math,Date,JSON,URL,STORAGE:'test-progress',LASTKEY:'test-last',
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},document:{createElement:element},window:{scrollTo(){}},
  setCat(){},pick:a=>a?.[0]||'',LINES:{welcome:[],start:[],exerciseDone:[],allDone:['ending']},LESSONCLEAR:{},
  show:n=>{currentScreen=n;events.push(n);},startRound(){},startTicker(){tickerStarts++;state.ticker={};},stopTicker(){state.ticker=null;},
  toast(){},esc:s=>String(s),fmt:()=>'',setTimeout:f=>timed.push(f),showEnding:()=>events.push('ENDING'),showRoar:()=>events.push('ROAR')});
vm.runInContext([
  between('function buildLessons()','/* ===== progress / route ===== */'),
  between('function loadProgress()','/* ===== screens ===== */'),
  between('function saveLast(','/* 발음 읽어주기'),
  between('function renderHome()','/* ===== game ===== */'),
  between('function normalize(','function shuffle('),
  between('function startExercise(','function startRound('),
  between('function finishExercise()','/* ===== fx + audio ===== */'),
  between('$("#retryEx").addEventListener','/* 결과 화면 틀린 단어:'),
  between('$("#nextEx").addEventListener','$("#muteBtn").addEventListener')
].join('\n'),ctx);

// Historical course/record fixtures describe the authored topic groups. Keep
// checking those identities here; the live short parts are checked below.
state.lessons=ctx.buildLessons();

// The fixture freezes legacy keys instead of deriving expected values from the new implementation.
let legacyRecords=0;
for(const old of legacy.lessons){
  const L=state.lessons.find(l=>l.lesson===old.lesson);assert.equal(L.id,old.id);state.progress[old.id]={};
  for(const e of old.exercises){
    if(old.lesson===0 && e.title==='Exercise 10 · 생활 구어'){
      assert(!L.exercises.some(x=>x.title===e.title),'Retired exercise is still active');
      const before=ctx.clearedExercises();
      state.progress[old.id][e.title]={completed:true};
      assert.equal(ctx.clearedExercises(),before,'Retired record counted toward completion');
      continue;
    }
    assert(L.exercises.some(x=>x.title===e.title&&x.scope===e.scope),'Legacy exercise renamed: '+old.id+' / '+e.title);
    state.progress[old.id][e.title]={completed:true,legacyMarker:old.lesson};assert(ctx.getRec(old.id,e.title)?.completed);
    if(e.scope!=='prev')legacyRecords++;
  }
}
const oldProgressSnapshot=JSON.stringify(Object.fromEntries(legacy.lessons.map(l=>[l.id,state.progress[l.id]])));
const review=state.lessons[46];state.progress[READING_CORE.id]={};
for(const e of review.exercises){
  assert.equal(e.progressTitle,'핵심 '+e.ex+' · '+READING_CORE.exercises.find(x=>x.ex===e.ex).name);
  state.progress[READING_CORE.id][e.progressTitle]={completed:true};assert(ctx.getRec(review.id,e.title)?.completed);
}
// Freeze every pre-merge exercise, including its card order and stored namespace.
assert.deepEqual(priorMorph.lessons.map(L=>L.lesson),[47,48,49,50]);
const priorEntries=priorMorph.lessons.flatMap(L=>L.exercises.map(e=>({L,e})));
assert.equal(priorEntries.length,26);
assert.equal(priorEntries.filter(x=>x.L.lesson>=48).length,16);
const mappedMorph=priorEntries.map(({L:oldL,e:oldE})=>{
  const L=state.lessons[oldL.lesson===47?47:48];
  const matches=L.exercises.map((e,ei)=>({e,ei})).filter(x=>JSON.stringify(x.e.unitIds)===JSON.stringify(oldE.unitIds));
  assert.equal(matches.length,1,'Old exercise missing or duplicated: '+oldL.id+' / '+oldE.title);
  const {e,ei}=matches[0],raw=DATA[L.lesson].exercises[ei];
  assert.equal(raw.words.length,oldE.cardCount);
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(raw.words)).digest('hex'),oldE.cardsSha256,'Cards changed while merging '+oldE.title);
  assert.equal((e.progressId||L.progressId),oldL.progressId);
  assert.equal((e.progressTitle||e.title),oldE.progressTitle);
  if(oldL.lesson>=48){assert.equal(e.legacyLocation?.lid,oldL.id);assert.equal(e.legacyLocation?.title,oldE.title);}
  return {oldL,oldE,L,e,ei};
});
// Check the original Latin → Greek → English sequence, not merely membership.
assert.deepEqual(DATA[48].exercises.map(e=>e.unitIds),priorMorph.lessons.filter(L=>L.lesson>=48).flatMap(L=>L.exercises.map(e=>e.unitIds)));

// Even matching numbered-set records must not clear the replacement courses.
for(const L of state.lessons.slice(46)){
  state.progress[L.id]={};for(const e of L.exercises)state.progress[L.id][e.title]={completed:true};
}
for(const L of priorMorph.lessons.filter(L=>L.lesson>48))state.progress[L.id]=Object.fromEntries(L.exercises.map(e=>[e.title,{completed:true}]));
const newIds=[...new Set(mappedMorph.map(x=>x.oldL.progressId))];
assert.equal(newIds.length,4);assert(newIds.every(id=>id&&!/^\d+세트$/.test(id)&&id!==READING_CORE.id));
for(const {L,e} of mappedMorph)assert.equal(ctx.getRec(L.id,e.title),null);
for(const L of state.lessons.slice(49))for(const e of L.exercises)assert.equal(ctx.getRec(L.id,e.title),null,'Old numbered records leaked into new construction courses');
assert.equal(ctx.clearedExercises(),legacyRecords+review.exercises.length);
// Every prior stored completion is visible, without modifying storage or creating a new namespace.
for(const {oldL,oldE,L,e} of mappedMorph){
  const rec={completed:true,source:oldL.lesson,exercise:oldE.ex};
  (state.progress[oldL.progressId]??={})[oldE.progressTitle]=rec;
  assert.equal(ctx.getRec(L.id,e.title),rec);
}
const morphSnapshot=JSON.stringify(Object.fromEntries(newIds.map(id=>[id,state.progress[id]])));
assert.equal(ctx.clearedExercises(),legacyRecords+review.exercises.length+26);
assert.equal(JSON.stringify(Object.fromEntries(newIds.map(id=>[id,state.progress[id]]))),morphSnapshot,'Reading migrated progress rewrote records');
for(const id of newIds)delete state.progress[id];

const unfinished=review.exercises[1];delete state.progress[READING_CORE.id][unfinished.progressTitle];
ctx.openLesson(46);ctx.openExercise(1,new Set([unfinished.words[0].term]));ctx.finishExercise();
assert.equal(ctx.getRec(review.id,unfinished.title),null,'Partial replay cannot clear a full exercise');assert.equal(timed.length,0);
function assertPlaying(number,index){
  assert.equal(state.li,number);assert.equal(state.ei,index);assert.equal(currentScreen,'game');
  assert.equal(state.session.lesson,state.lessons[number]);assert.equal(state.session.exercise,ctx.visEx(state.lessons[number])[index]);assert(state.ticker);
}

// The actual exercise buttons start gameplay directly, including the consolidated root course.
for(let n=45;n<=50;n++){
  ctx.openLesson(n);const play=$('#exList').children[0];
  const before=events.length,starts=tickerStarts;play.click();assertPlaying(n,0);assert.equal(tickerStarts,starts+1);
  assert(!events.slice(before).includes('study'),'Normal play forced a guide');ctx.stopTicker();state.session=null;
}

// Source-language research stays in the retained teaching data, not in a new gameplay screen.
let greekUnits=0;
for(const u of MORPHOLOGY.units.filter(u=>u.kind==='greek')){
  const g=Array.isArray(u.history.greek)?u.history.greek.join(' '):u.history.greek;
  assert.equal(typeof g,'string');assert(/[\u0370-\u03ff\u1f00-\u1fff]/u.test(g),'Greek original missing: '+u.id);
  assert(u.history.romanization,'Romanization missing: '+u.id);
  assert(u.sources.some(url=>/^https?:\/\//.test(url)),'Research source missing: '+u.id);greekUnits++;
}
assert(greekUnits>0);

// Finishing a course or exercise must not introduce a compulsory explanation screen either.
ctx.openLesson(45);ctx.openExercise(state.lessons[45].exercises.length-1);
for(let n=45;n<50;n++){
  ctx.finishExercise();const before=events.length;$('#nextEx').click();assertPlaying(n+1,0);
  assert(!events.slice(before).includes('study'),'Next-course flow forced a guide');
  if(n+1>=47){
    const L=state.lessons[n+1];ctx.finishExercise();const e=L.exercises[0];assert(state.progress[e.progressId||L.progressId][e.progressTitle||e.title].completed);
    if(L.exercises.length>1){$('#nextEx').click();assertPlaying(n+1,1);}
  }
  ctx.openExercise(state.lessons[n+1].exercises.length-1);
}
ctx.finishExercise();assert.equal(currentScreen,'sum');assert($('#nextEx').disabled);assert.equal(timed.length,0);

// Resume every old 47–50 location at its corresponding current exercise, including all 16 merged exercises.
let migratedResumes=0;
for(const {oldL,oldE,L,e,ei} of mappedMorph){
  delete state.progress[oldL.progressId]?.[oldE.progressTitle];
  ctx.saveLast(oldL.id,oldE.title);ctx.renderHome();assert(!$('#resumeBtn').hidden);
  $('#resumeBtn').click();assertPlaying(L.lesson,ei);migratedResumes++;
  // Newly saved locations also resolve to the exact same exercise.
  const last=JSON.parse(storage.get('test-last'));assert.equal(last.lid,L.id);assert.equal(last.title,e.title);
  const resumed=ctx.resumeTarget();assert.equal(resumed.li,L.lesson);assert.equal(resumed.ei,ei);
  ctx.finishExercise();assert(state.progress[oldL.progressId][oldE.progressTitle].completed,'Completion wrote the wrong historical key');
  $('#retryEx').click();assertPlaying(L.lesson,ei);
}
assert.equal(migratedResumes,26);
// Only the legacy exercise actually replayed above may have its old extra metadata replaced.
const expectedOld=JSON.parse(oldProgressSnapshot),last45=legacy.lessons.find(l=>l.lesson===45).exercises.at(-1).title;
expectedOld['45세트'][last45]={completed:true};
assert.equal(JSON.stringify(Object.fromEntries(legacy.lessons.map(l=>[l.id,state.progress[l.id]]))),JSON.stringify(expectedOld));
for(const {oldL,oldE,L,e} of mappedMorph){
  const saved=state.progress[oldL.progressId][oldE.progressTitle];
  delete state.progress[oldL.progressId][oldE.progressTitle];assert.equal(ctx.getRec(L.id,e.title),null);
  state.progress[oldL.progressId][oldE.progressTitle]=saved;
}

// Completing all of the former 49 sets still leaves the two new courses unfinished.
for(const L of state.lessons.slice(0,49))for(const e of L.exercises)ctx.setRec(L.id,e.title,{});
ctx.openLesson(48);ctx.openExercise(state.lessons[48].exercises.length-1);ctx.finishExercise();
assert.equal(timed.length,0);assert(!$('#nextEx').disabled);assert(ctx.clearedExercises()<ctx.totalExercises());
// A full completion trigger requires all 51 sets.
assert.equal(timed.length,0);for(const L of state.lessons)for(const e of L.exercises)ctx.setRec(L.id,e.title,{});
ctx.openLesson(50);ctx.openExercise(state.lessons[50].exercises.length-1);ctx.finishExercise();
assert.equal(timed.length,1);assert.equal(ctx.clearedExercises(),ctx.totalExercises());assert($('#nextEx').disabled);
timed[0]();assert.equal(events.at(-1),'ENDING');
const ids=new Set();
for(const L of DATA.filter(l=>l.kind==='morphology'))for(const e of L.exercises){
  const expected=e.unitIds.flatMap(id=>{ids.add(id);const u=MORPHOLOGY.units.find(u=>u.id===id);assert(u);return u.cards;});
  assert.equal(expected.length,e.words.length);e.words.forEach((w,i)=>{for(const k of ['word','en','ko','ex','tr','c','ipa','pos'])assert.equal(w[k],expected[i][k]);});
}
assert.equal(ids.size,MORPHOLOGY.units.length);

// The live course uses short parts, while DATA remains the editable topic source.
const sourceLessons=ctx.buildLessons();state.lessons=ctx.splitExercises(sourceLessons);
const flatParts=state.lessons.flatMap((L,li)=>L.exercises.map((e,ei)=>({L,li,e,ei})));
assert.equal(ctx.totalExercises(),613);
assert.equal(flatParts.reduce((n,x)=>n+x.e.words.length,0),6886);
assert.equal(Math.min(...flatParts.map(x=>x.e.words.length)),4);
assert.equal(Math.max(...flatParts.map(x=>x.e.words.length)),15);
const sizes={},recordKeys=new Set();let sourceGroups=0,splitGroups=0,oldLocations=0,newLocations=0;
for(const {L,e} of flatParts){
  sizes[e.words.length]=(sizes[e.words.length]||0)+1;
  const key=JSON.stringify(ctx.recordKey(L.id,e.title));assert(!recordKeys.has(key),'Duplicate part record');recordKeys.add(key);
}
for(const [li,source] of sourceLessons.entries()){
  const L=state.lessons[li];
  assert.equal(JSON.stringify(L.exercises.flatMap(e=>e.words)),JSON.stringify(source.exercises.flatMap(e=>e.words)),'Splitting changed card contents or order');
  assert.equal(new Set(L.exercises.map(e=>e.title)).size,L.exercises.length,'Duplicate visible title');
  for(const original of source.exercises){
    sourceGroups++;
    const parts=flatParts.filter(x=>x.li===li&&x.e.sourceTitle===original.title);
    assert(parts.length>0);if(parts.length>1)splitGroups++;
    assert.equal(JSON.stringify(parts.flatMap(x=>x.e.words)),JSON.stringify(original.words),'A topic lost or gained cards');
    const owners=new Map();
    for(const {e} of parts)for(const w of e.words){
      const key=(w.word||w.term).trim().toLowerCase();
      if(owners.has(key))assert.equal(owners.get(key),e.title,'Headword split across parts: '+key);
      owners.set(key,e.title);
    }
    const oldId=original.progressId||source.progressId||source.id,oldTitle=original.progressTitle||original.title;
    const rec={completed:true,legacyMarker:original.title};state.progress={[oldId]:{[oldTitle]:rec}};
    const untouched=JSON.stringify(state.progress);
    for(const {e} of parts)assert.equal(ctx.getRec(L.id,e.title),rec,'Old completion must clear every descendant');
    assert.equal(ctx.clearedExercises(),parts.length,'A legacy record cleared an unrelated exercise');
    assert.equal(JSON.stringify(state.progress),untouched,'Reading old completions rewrote storage');
    state.progress={[oldId]:{[oldTitle]:{completed:false}}};
    for(const {e} of parts)assert(!ctx.getRec(L.id,e.title)?.completed,'An unfinished parent cleared a part');

    // Last location from both the previous release and the old root courses.
    const locations=[{lid:source.id,title:original.title},...(original.legacyLocation?[original.legacyLocation]:[])];
    for(const old of locations){
      state.progress={};ctx.saveLast(old.lid,old.title);
      let target=ctx.resumeTarget();assert.equal(target.li,li);assert.equal(target.ei,parts[0].ei);oldLocations++;
      ctx.setRec(L.id,parts[0].e.title,{});
      if(parts.length>1){
        target=ctx.resumeTarget();assert.equal(target.li,li);assert.equal(target.ei,parts[1].ei,'Resume should select the first unfinished part');
        assert(!state.progress[oldId]?.[oldTitle],'One part incorrectly completed the whole topic');
        for(const {e} of parts.slice(1))assert.equal(ctx.getRec(L.id,e.title),null);
      }
    }
    for(const {e,ei} of parts){
      state.progress={};ctx.saveLast(L.id,e.title);
      const target=ctx.resumeTarget();assert.equal(target.li,li);assert.equal(target.ei,ei);newLocations++;
    }
  }
}
assert.equal(sourceGroups,520);assert.equal(newLocations,613);

// Preserve all meanings of get and other vocabulary heads across an entire
// ordinary set. Later topic-based review intentionally repeats some headwords.
for(const L of state.lessons.slice(0,46)){
  const owner=new Map();
  for(const e of L.exercises)for(const w of e.words){
    const key=(w.word||w.term).trim().toLowerCase();
    if(owner.has(key))assert.equal(owner.get(key),e.title,`${L.id}: split ${key}`);owner.set(key,e.title);
  }
}
const getParts=state.lessons[1].exercises.filter(e=>e.words.some(w=>w.word==='get'));
assert.equal(getParts.length,1);assert.equal(getParts[0].words.filter(w=>w.word==='get').length,6);
assert.equal(getParts[0].words.length,12);
assert.equal(JSON.stringify([...new Set(getParts[0].words.map(w=>w.word))]),JSON.stringify(['like','no','time','get']),'Keep varied heads alongside get');
const uniqueWords=n=>Array.from({length:n},(_,i)=>({word:'word'+i,term:'word'+i}));
const rangeSizes=words=>Array.from(ctx.headwordRanges(words),([a,b])=>b-a);
assert.deepEqual(rangeSizes(uniqueWords(14)),[14]);
assert.deepEqual(rangeSizes(uniqueWords(15)),[15]);
assert.deepEqual(rangeSizes(uniqueWords(17)),[9,8]);
assert.deepEqual(rangeSizes(uniqueWords(22)),[11,11]);
assert.deepEqual(rangeSizes(uniqueWords(24)),[12,12]);
assert.deepEqual(rangeSizes(uniqueWords(37)),[13,12,12]);
assert.deepEqual(rangeSizes(Array.from({length:15},()=>({word:'one-head'}))),[15],'Never force an oversized headword into separate parts');
assert.deepEqual(rangeSizes([{word:'repeat'},...uniqueWords(8),{word:'repeat'}]),[10],'Non-adjacent senses must remain together too');

// Freeze the previous published eight-card partition algorithm independently.
// A changed part is complete only if all of its cards were already completed,
// not merely because its visible ordinal happens to match an old part.
const headsV2=JSON.parse(fs.readFileSync(path.join(repo,'pipeline/tests/headword-parts-v2.fixture.json'),'utf8'));
assert.equal(headsV2.layout,'heads-v2');assert.equal(headsV2.groups.length,520);
let priorPartLocations=0,coverageCases=0,headPartLocations=0,mixedCoverageCases=0;
for(const [li,source] of sourceLessons.entries())for(const original of source.exercises){
  const parts=flatParts.filter(x=>x.li===li&&x.e.sourceTitle===original.title);
  const oldCount=Math.ceil(original.words.length/8),q=Math.floor(original.words.length/oldCount),r=original.words.length%oldCount;
  const oldId=original.progressId||source.progressId||source.id,base=original.progressTitle||original.title;
  const previous=[];let offset=0;
  for(let i=0;i<oldCount;i++){
    const start=offset;offset+=q+(i<r?1:0);
    previous.push({start,end:offset,title:oldCount===1?original.title:original.title.replace(/^((?:Exercise|이전기출) \d+)/,`$1-${i+1}`),key:oldCount===1?base:`${base} :: short-v1 ${i+1}/${oldCount}`});
  }
  for(const {e} of parts){
    const start=original.words.indexOf(e.words[0]),end=start+e.words.length;
    const covers=previous.filter(p=>p.start<end&&p.end>start);
    assert.equal(JSON.stringify(e.priorParts),JSON.stringify(oldCount>1?covers.map(p=>({id:oldId,title:p.key})):[]));
    if(parts.length>1)assert(!previous.some(p=>p.key===e.progressTitle),'Reused a v1 key for different card coverage');
  }
  for(let mask=0;mask<(1<<oldCount);mask++){
    state.progress={[oldId]:{}};const completed=new Set();
    previous.forEach((p,i)=>{if(mask&(1<<i)){state.progress[oldId][p.key]={completed:true};for(let n=p.start;n<p.end;n++)completed.add(n);}});
    const before=JSON.stringify(state.progress);
    for(const {L,e} of parts){
      const expected=e.words.every(w=>completed.has(original.words.indexOf(w)));
      assert.equal(!!ctx.getRec(L.id,e.title)?.completed,expected,`${L.id} ${e.title}: incorrect old-part inheritance`);coverageCases++;
    }
    assert.equal(JSON.stringify(state.progress),before,'Migration rewrote existing records');
  }
  for(const old of previous){
    state.progress={};storage.set('test-last',JSON.stringify({lid:source.id,title:old.title}));
    const expected=parts.find(x=>{const start=original.words.indexOf(x.e.words[0]);return start<old.end&&start+x.e.words.length>old.start;});
    const target=ctx.resumeTarget();assert.equal(target.li,li);assert.equal(target.ei,expected.ei,'Old split location resumed at an unrelated ordinal');priorPartLocations++;
  }

  // The last published headword-aware layout is frozen, not inferred from the
  // new target size. Records from either prior version can cover a new part.
  const frozen=headsV2.groups.find(g=>g.lesson===source.lesson&&g.ex===original.ex);assert(frozen);
  assert.equal(JSON.stringify(ctx.headwordRanges(original.words,8)),JSON.stringify(frozen.ranges),'Changed heads-v2 reconstruction');
  const headParts=frozen.ranges.map(([start,end],i)=>({start,end,
    title:frozen.ranges.length===1?original.title:original.title.replace(/^((?:Exercise|이전기출) \d+)/,`$1-${i+1}`),
    key:frozen.ranges.length===1?base:`${base} :: heads-v2 ${start+1}-${end}`}));
  const historical=[...new Map([...previous,...headParts].map(p=>[p.key,p])).values()];
  for(let mask=0;mask<(1<<historical.length);mask++){
    state.progress={[oldId]:{}};const completed=new Set();
    historical.forEach((p,i)=>{if(mask&(1<<i)){state.progress[oldId][p.key]={completed:true};for(let n=p.start;n<p.end;n++)completed.add(n);}});
    const before=JSON.stringify(state.progress);
    for(const {L,e} of parts){
      const expected=e.words.every(w=>completed.has(original.words.indexOf(w)));
      assert.equal(!!ctx.getRec(L.id,e.title)?.completed,expected,`${L.id} ${e.title}: mixed-version coverage`);mixedCoverageCases++;
    }
    assert.equal(JSON.stringify(state.progress),before,'Reading mixed records rewrote progress');
  }
  for(const old of headParts){
    state.progress={};storage.set('test-last',JSON.stringify({lid:source.id,title:old.title,layout:'heads-v2'}));
    const expected=parts.find(x=>{const start=original.words.indexOf(x.e.words[0]);return start<old.end&&start+x.e.words.length>old.start;});
    const target=ctx.resumeTarget();assert.equal(target.li,li);assert.equal(target.ei,expected.ei,'heads-v2 resume chose the old ordinal instead of its cards');headPartLocations++;
  }
}
assert.equal(priorPartLocations,1079);
assert.equal(headPartLocations,931);

// Completing, retrying and advancing a real short part must affect that part only.
state.progress={};timed.length=0;ctx.openLesson(0);ctx.openExercise(0);
const firstPart=state.lessons[0].exercises[0],secondPart=state.lessons[0].exercises[1];
assert.equal(state.session.words.length,11);
ctx.finishExercise();assert(ctx.getRec('0세트',firstPart.title)?.completed);assert.equal(ctx.getRec('0세트',secondPart.title),null);
assert.equal(JSON.stringify(ctx.loadProgress()),JSON.stringify(state.progress),'New part records survive reload');
$('#retryEx').click();assertPlaying(0,0);
$('#nextEx').click();assertPlaying(0,1);assert.equal(state.session.words.length,11);
assert.equal($('#gTitle').textContent,'Exercise 1-2');
ctx.openExercise(1,new Set([secondPart.words[0].term]));ctx.finishExercise();assert.equal(ctx.getRec('0세트',secondPart.title),null,'Partial review cleared a short part');

// Completion still requires every displayed part; legacy full completions work too.
state.progress={};
for(const L of sourceLessons)for(const e of L.exercises){
  const id=e.progressId||L.progressId||L.id;(state.progress[id]??={})[e.progressTitle||e.title]={completed:true};
}
assert.equal(ctx.clearedExercises(),613);
state.progress={};timed.length=0;
for(const {L,e} of flatParts.slice(0,-1))ctx.setRec(L.id,e.title,{});
assert.equal(ctx.clearedExercises(),612);
const lastPart=flatParts.at(-1);ctx.openLesson(lastPart.li);ctx.openExercise(lastPart.ei);ctx.finishExercise();
assert.equal(ctx.clearedExercises(),613);assert.equal(timed.length,1);assert($('#nextEx').disabled);
console.log(JSON.stringify({shortExercises:613,sourceGroups,splitGroups,cards:6886,sizes,oldLocations,newLocations,priorPartLocations,headPartLocations,coverageCases,mixedCoverageCases,getSensesTogether:6,headwordSplits:0,completionInheritance:'source groups, short-v1, heads-v2 and mixed-version coverage checked',shortPartNavigation:'pass',shortPartEnding:'pass'}));
console.log(JSON.stringify({sets:DATA.length,reviewReferences,legacyProgressKeys:legacyRecords,legacyProgress:'preserved',reviewProgress:'former track retained',mergedProgress:'26 historical exercise keys preserved; 16 consolidated exercises',newProgress:'49/50 isolated from historical root-course records',migratedResumes,courseNavigation:'45→46→47→48→49→50 directly to game',guideUI:'removed',greekResearchUnits:greekUnits,ending:'all 51 sets required',syntax:'passed'}));
