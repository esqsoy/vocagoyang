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
console.log(JSON.stringify({sets:DATA.length,reviewReferences,legacyProgressKeys:legacyRecords,legacyProgress:'preserved',reviewProgress:'former track retained',mergedProgress:'26 historical exercise keys preserved; 16 consolidated exercises',newProgress:'49/50 isolated from historical root-course records',migratedResumes,courseNavigation:'45→46→47→48→49→50 directly to game',guideUI:'removed',greekResearchUnits:greekUnits,ending:'all 51 sets required',syntax:'passed'}));
