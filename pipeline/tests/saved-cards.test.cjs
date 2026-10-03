'use strict';
// Saved cards are personal references to live course cards, never a second
// completion track. Run the actual three application scripts through the
// existing DOM/speech harness and exercise their public saved-card hooks.
const assert=require('node:assert/strict'),path=require('node:path');
const {harness,root}=require('./helpers/mother-tongue-harness.cjs');
const files=['vocagoyangfable.html','vocagoyangksat2027.html','vocagoyangebs2027.html'];
const plain=v=>JSON.parse(JSON.stringify(v));
const current=h=>h.state.session.words[h.state.session.currentId];
const items=h=>h.ctx.savedItems();
const storeKey=h=>h.run('savedStoreKey');
function quizSnapshot(h){
 const s=h.state.session;
 return JSON.stringify({currentId:s.currentId,queue:s.queue,round:s.round,answered:s.answered,copyMode:s.copyMode,
  attempts:s.attempts,errors:s.errors,firstSeen:s.firstSeen,firstCorrect:s.firstCorrect,hints:s.hints,
  cardStart:s.cardStart,revealedAt:s.revealedAt,
  words:s.words.map(w=>({id:w.id,attempts:w.attempts,corrects:w.corrects,errors:w.errors,passed:w.passed})),
  input:h.els.get('ainput').value});
}
function learningStorage(h){
 return Object.fromEntries(['STORAGE','LASTKEY','UNIKEY'].map(name=>{const key=h.run(name);return [key,h.storage.get(key)??null];}));
}
function selected(h,word){return items(h).some(item=>item.id===word.savedCardId);}
function clickCat(h){
 let prevented=false,stopped=false;
 h.fire('catSubmit','click',{preventDefault(){prevented=true;},stopPropagation(){stopped=true;}});
 assert(prevented&&stopped,'Saving must consume the cat click');
}
function pressCat(h,key){
 let prevented=false,stopped=false;
 const event={target:h.els.get('catSubmit'),key,code:key===' '?'Space':'Enter',
  preventDefault(){prevented=true;},stopPropagation(){stopped=true;}};
 h.fire('catSubmit','keydown',event);
 if(!stopped)for(const fn of h.events['doc:keydown']||[])fn(event);
 // Native buttons activate from Enter/Space unless their key handler handled it.
 if(!prevented)clickCat(h);
}
function locate(h,predicate){
 for(let li=0;li<h.state.lessons.length;li++){
  const L=h.state.lessons[li],visible=h.ctx.visEx(L);
  for(let ei=0;ei<visible.length;ei++)for(let wi=0;wi<visible[ei].words.length;wi++){
   const w=visible[ei].words[wi];if(predicate(w,L,visible[ei]))return {li,ei,wi,w};
  }
 }
 throw Error('Required real-card fixture is missing');
}
function startAt(h,place){
 h.start(place.li,place.ei);
 h.state.session.queue=[place.wi];h.ctx.nextCard();
 assert.equal(current(h).savedCardId,place.w.savedCardId);
}
function saveAt(h,place){startAt(h,place);assert.equal(h.ctx.savedToggleCurrent(),true);assert(selected(h,current(h)));}
function playSaved(h){
 h.ctx.savedOpen();h.ctx.startExercise(0);
 const s=h.state.session;let answered=0;
 while(h.els.get('gameScreen').classList.contains('active')){
  assert.equal(h.state.session,s,'The saved exercise retains its own session');
  const w=current(h);h.type(w.term);if(!s.answered)h.ctx.submit();
  assert(s.answered&&!s.copyMode,w.term+' still uses the original headword grader');
  h.ctx.nextCard();assert(++answered<100,'Saved review must terminate');
 }
 assert(h.els.get('sumScreen').classList.contains('active'));
 return s;
}
const reports=[];
for(const file of files){
 const filename=path.join(root,file),course=file.includes('fable')?'FABLE':file.includes('ksat')?'Mother Tongue':'EBS';
 let h=harness(filename);assert.equal(storeKey(h),h.run('STORAGE')+'-saved-cards-v1');
 const allWords=h.state.lessons.flatMap(L=>L.exercises.flatMap(e=>e.words));
 assert(allWords.every(w=>typeof w.savedCardId==='string'&&w.savedCardId),'Every original card has a stable ID');
 assert.equal(new Set(allWords.map(w=>w.savedCardId)).size,allWords.length,'Distinct card occurrences must not merge by headword');
 const originalCount=h.ctx.totalExercises(),originalCards=allWords.length;
 h.start();let w=current(h),before=quizSnapshot(h);const id=w.savedCardId;
 clickCat(h);assert.equal(quizSnapshot(h),before,'Saving a question must neither submit nor advance');assert(selected(h,w));
 assert.equal(h.els.get('catSubmit').getAttribute('aria-pressed'),'true');
 clickCat(h);assert.equal(quizSnapshot(h),before);assert(!selected(h,w));
 assert.equal(h.els.get('catSubmit').getAttribute('aria-pressed'),'false');
 h.type(w.term);assert(h.state.session.answered&&!h.state.session.copyMode);
 before=quizSnapshot(h);clickCat(h);assert.equal(quizSnapshot(h),before,'Saving a revealed answer must not grade or advance it');
 assert(selected(h,w));
 // In FABLE the document-wide next-card key listener must ignore the cat.
 for(const key of ['Enter',' ']){
  before=quizSnapshot(h);const was=selected(h,w);pressCat(h,key);
  assert.equal(quizSnapshot(h),before,'Cat '+JSON.stringify(key)+' must not reach the document next-card handler');
  assert.equal(selected(h,w),!was,'Native keyboard activation toggles the same current card');
 }
 if(!selected(h,w))clickCat(h);
 const stored=JSON.parse(h.storage.get(storeKey(h)));
 assert.equal(stored.length,1);assert.equal(stored[0].id,id);assert(Number.isFinite(stored[0].addedAt));
 assert.deepEqual(Object.keys(stored[0]).sort(),['addedAt','id'],'Storage carries references, not outdated lesson/example copies');
 const seed=Object.fromEntries(h.storage);h=harness(filename,seed);
 assert.equal(items(h).length,1);assert.equal(items(h)[0].id,id,'Saved selection survives a reload');
 const live=h.state.lessons.flatMap(L=>L.exercises.flatMap(e=>e.words)).find(w=>w.savedCardId===id);
 assert(live);const previousMeaning=live.meaning;live.meaning='검수 후 바뀐 최신 뜻';
 assert.equal(items(h)[0].word.meaning,live.meaning,'Selection resolves the current course card');
 live.meaning=previousMeaning;
 h.start();h.ctx.submit({forced:true});assert(h.state.session.copyMode);
 before=quizSnapshot(h);clickCat(h);assert.equal(quizSnapshot(h),before,'Saving during correction must not submit the answer');
 assert(h.state.session.copyMode);
 // Fresh state for normal-progress conservation and the in-play removal case.
 h=harness(filename,seed);const progressBefore=plain(h.state.progress),storageBefore=learningStorage(h);
 const totalBefore=h.ctx.totalExercises(),doneBefore=h.ctx.clearedExercises();
 const lessonsBefore=h.state.lessons;h.state.perfectStreak=3;
 h.ctx.savedOpen();assert.equal(h.state.savedLesson.kind,'saved');assert.equal(h.state.savedLesson.id,'모아둔 카드');
 assert.equal(h.state.lessons,lessonsBefore,'Personal review must not append to the curriculum');
 assert.equal(h.ctx.activeLesson(),h.state.savedLesson);
 assert.equal(h.ctx.totalExercises(),totalBefore);assert.equal(h.ctx.clearedExercises(),doneBefore);
 h.ctx.startExercise(0);const session=h.state.session,reviewWords=session.words.map(w=>w.savedCardId),reviewId=current(h).savedCardId;
 before=quizSnapshot(h);assert.equal(h.ctx.savedSet(reviewId,false),true);
 assert.equal(items(h).length,0);assert.equal(quizSnapshot(h),before,'Removing an active card must keep the current exercise snapshot');
 assert.deepEqual(session.words.map(w=>w.savedCardId),reviewWords);
 h.type(current(h).term);assert(session.answered&&!session.copyMode);h.ctx.nextCard();
 assert(h.els.get('sumScreen').classList.contains('active'));
 assert.deepEqual(plain(h.state.progress),progressBefore);assert.deepEqual(learningStorage(h),storageBefore);
 assert.equal(h.state.perfectStreak,3,'A saved review neither extends nor breaks the course perfect streak');
 assert.equal(h.ctx.totalExercises(),totalBefore);assert.equal(h.ctx.clearedExercises(),doneBefore);
 assert(!h.els.get('ending').classList.contains('show'),'Saved review is not a curriculum ending');
 assert(h.els.get('nextEx').disabled,'The final saved exercise must not lead into a numbered course');
 h.ctx.savedOpen();assert.equal(h.state.savedLesson.exercises.length,0,'The collection becomes empty after returning to its list');
 assert.equal(h.state.lessons,lessonsBefore);
 // Writes can be blocked by browser storage settings. A success notification
 // or in-memory selection must not conceal the failed persistent save.
 h=harness(filename);h.start();const storage=h.ctx.localStorage,oldSet=storage.setItem;
 storage.setItem=()=>{throw new Error('QuotaExceededError');};before=quizSnapshot(h);
 assert.equal(h.ctx.savedToggleCurrent(),false);assert.equal(items(h).length,0);
 assert.equal(quizSnapshot(h),before);storage.setItem=oldSet;
 assert.equal(h.ctx.savedToggleCurrent(),true);assert.equal(items(h).length,1);
 // Bad persisted JSON is treated as an empty personal collection; neither
 // malformed records nor unknown IDs may alter the ordinary course.
 const key=storeKey(h);
 for(const value of ['{broken','null','{}',JSON.stringify([{id:'no-such-card',addedAt:1},null,{id:7}])]){
  const corrupt=harness(filename,{[key]:value});assert.equal(items(corrupt).length,0);
  assert.equal(corrupt.ctx.totalExercises(),originalCount);
 }
 const blocked=harness(filename),oldGet=blocked.ctx.localStorage.getItem;
 blocked.ctx.localStorage.getItem=()=>{throw Error('SecurityError');};
 assert.doesNotThrow(()=>blocked.ctx.savedInit());assert.equal(items(blocked).length,0);
 blocked.ctx.localStorage.getItem=oldGet;
 // Copying a collection is plain text; the useful source/card text is present.
 const exported=h.ctx.savedCopyText();assert.equal(typeof exported,'string');assert(exported.includes(current(h).term));
 assert(!exported.includes('[object Object]'));
 // Imported/local data is text. The collection detail must not turn a useful
 // example or commentary into markup when the user expands it.
 const activeItem=items(h)[0],hostile='<img src=x onerror="throw 1">';
 activeItem.word.meaning=hostile;activeItem.word.c=hostile;h.ctx.savedOpen();
 const walk=el=>[el,...(el.children||[]).flatMap(walk)];
 const listNodes=walk(h.els.get('exList'));
 assert(listNodes.some(el=>el.textContent.includes(hostile)),'Collection details preserve literal text');
 assert(listNodes.every(el=>!el.innerHTML.includes(hostile)),'Collection details never insert unescaped card text as HTML');
 // Even a learner who already cleared the complete curriculum should only see
 // the personal-review result, never the global ending again.
 const complete=harness(filename);complete.state.prevOn=true;
 for(const L of complete.state.lessons)for(const e of L.exercises)complete.ctx.setRec(L.id,e.title,{timeMs:1,attempts:1,errors:0,first:100});
 complete.start();assert.equal(complete.ctx.savedToggleCurrent(),true);
 const completedProgress=JSON.stringify(complete.state.progress),completedStorage=learningStorage(complete);
 playSaved(complete);complete.advance(1000);
 assert(!complete.els.get('ending').classList.contains('show'),'Saved review cannot reopen a fully completed curriculum ending');
 assert.equal(JSON.stringify(complete.state.progress),completedProgress);assert.deepEqual(learningStorage(complete),completedStorage);
 reports.push({course,cards:originalCards,exercises:originalCount,storage:'reference-only/reload/error checked',review:'isolated from curriculum progress'});
}

// Mother Tongue cards retain their own original passage and homograph meaning,
// including previous-exam cards while the numbered-course filter is off.
{
 const file=path.join(root,'vocagoyangksat2027.html'),h=harness(file);h.state.prevOn=true;
 const candidates=[locate(h,w=>!!w.context&&!!w.originalMeaning),locate(h,(w,L,e)=>e.scope==='prev'&&!!w.context)];
 for(const place of candidates)saveAt(h,place);
 const expected=new Map(items(h).map(item=>[item.id,{context:plain(item.word.context),originalMeaning:item.word.originalMeaning,term:item.word.term}]));
 h.state.prevOn=false;h.ctx.savedOpen();h.ctx.startExercise(0);
 const s=h.state.session;assert.equal(s.words.length,expected.size,'Personal review keeps explicitly saved previous-exam cards visible');
 for(const w of s.words){
  const source=expected.get(w.savedCardId);assert(source);assert.deepEqual(plain(w.context),source.context);assert.equal(w.originalMeaning,source.originalMeaning);
  s.queue=[w.id];h.ctx.nextCard();
  assert(h.els.get('hoeCtx').innerHTML.includes('mt-source'),'Saved passage uses the sentence-inline layout');
  const readable=v=>v.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
  assert.equal(readable(h.ctx.mtInlineSource(w,'answer')),readable(h.ctx.esc(source.context.example)));
  assert.deepEqual(plain(h.ctx.pronunciationEntry(w.term,w.meaning)),plain(h.ctx.pronunciationEntry(w.term,w.originalMeaning)));
 }
}

// FABLE must distinguish a headword's meanings and deliberate later reviews.
{
 const h=harness(path.join(root,'vocagoyangfable.html'));h.state.prevOn=true;
 const byTerm=new Map();for(const L of h.state.lessons)for(const e of L.exercises)for(const w of e.words){const a=byTerm.get(w.term)||[];a.push(w);byTerm.set(w.term,a);}
 const sameTerm=[...byTerm.values()].find(words=>words.length>=3&&new Set(words.map(w=>w.meaning)).size>=2);assert(sameTerm);
 for(const w of sameTerm.slice(0,3))saveAt(h,locate(h,c=>c.savedCardId===w.savedCardId));
 assert.equal(items(h).length,3,'The same English spelling can identify three separate useful cards');
 const s=playSaved(h);assert.equal(s.words.length,3);
 const more=h.state.lessons.flatMap(L=>L.exercises.flatMap(e=>e.words)).slice(0,30);
 for(const w of more)assert.equal(h.ctx.savedSet(w.savedCardId,true),true);
 h.ctx.savedOpen();assert(h.state.savedLesson.exercises.length>1,'Larger collections use short review exercises');
 assert.equal(h.state.savedLesson.exercises.flatMap(e=>e.words).length,items(h).length);
 const headPart=new Map();for(const [ei,e] of h.state.savedLesson.exercises.entries())for(const w of e.words){
  const head=(w.word||w.term).toLowerCase();if(headPart.has(head))assert.equal(headPart.get(head),ei,'A headword stays in one review exercise');headPart.set(head,ei);
 }
}
console.log(JSON.stringify({savedCards:reports,passagePreservation:true,distinctMeaningsAndReviews:true,keyboardAndClick:'no grading/navigation side effects'}));
