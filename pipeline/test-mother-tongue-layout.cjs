/* Run: node pipeline/test-mother-tongue-layout.cjs [candidate.html]
 * Execute the actual embedded application script, preserving the pre-layout
 * data/rule fingerprints while exercising the new input UI through events.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {harness,root}=require('./tests/helpers/mother-tongue-harness.cjs');
const filename=process.argv[2]?path.resolve(process.argv[2]):path.join(root,'vocagoyangksat2027.html');
const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'tests/mother-tongue-layout.fixture.json'),'utf8'));
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
const plain=v=>JSON.parse(JSON.stringify(v));
let h=harness(filename);
assert.equal(digest(h.run('JSON.stringify(DATA)')),fixture.dataSha256,'All original cards and their order must remain unchanged');
assert.equal(digest(h.run('JSON.stringify(MT_PRONUNCIATIONS)')),fixture.pronunciationSha256,'All published IPA and meaning-specific speech entries must remain unchanged');
for(const [name,value] of Object.entries(fixture.storage))assert.equal(h.run(name),value,`${name} progress key`);
for(const [name,hash] of Object.entries(fixture.functions))assert.equal(digest(h.ctx[name].toString().replace(/\r\n/g,'\n')),hash,`${name} is an unchanged learning/progress rule`);
assert.deepEqual(plain(h.state.lessons.map(l=>({id:l.id,exercises:l.exercises.map(e=>({title:e.title,scope:e.scope}))}))),fixture.progressKeys,'Every original record address remains valid');
assert.equal(h.ctx.totalExercises(),161);assert.equal(h.state.lessons.reduce((n,l)=>n+h.ctx.visEx(l).reduce((s,e)=>s+e.words.length,0),0),2089);
h.state.prevOn=true;
assert.equal(h.ctx.totalExercises(),521);assert.equal(h.state.lessons.reduce((n,l)=>n+h.ctx.visEx(l).reduce((s,e)=>s+e.words.length,0),0),6498);
for(const id of ['prevBtn','hoeCtx','reveal','catSubmit','ainput','muteBtn2'])assert(h.els.has(id),`${id} exists`);
for(const id of ['focusInputBtn','inputHelp'])assert(!h.els.has(id),`${id} helper removed`);
assert(!h.html.includes('똑같이 따라 쓰면 넘어간다고양'),'No copy-mode instructions');
assert(!h.els.has('muteBtn'));assert(!h.els.has('resetBtn'));
assert(!/<button\b[^>]*class="[^\"]*mt-speak/.test(h.html),'No separate pronunciation replay button');
const appbar=h.html.match(/<div class="appbar">([\s\S]*?)<\/div>/)?.[1]||'';
assert(appbar.includes('꽃과 단어의 도시를'));assert(appbar.includes('prevBtn'));assert.equal((appbar.match(/<button\b/g)||[]).length,1,'Only the year-range button remains in the top bar');

// Run every real card in its actual exercise. A punctuation suffix may be
// omitted by the original normalizer, so completing an already valid prefix
// is allowed, but no incomplete answer may be graded as wrong.
let cardCount=0,characterInputs=0;
for(let li=0;li<h.state.lessons.length;li++){
 const exercises=h.state.lessons[li].exercises;
 for(let ei=0;ei<exercises.length;ei++){
  h.start(li,ei);const s=h.state.session;
  assert.equal(s.currentId,0);assert.equal(s.round,1);
  for(let wi=0;wi<exercises[ei].words.length;wi++){
   const w=exercises[ei].words[wi];assert.equal(s.currentId,wi,'Original first-round ordering');
   assert(!h.els.get('reveal').innerHTML,'No answer/IPA before input');
   const slots=h.ctx.blankParts(w.term).chars.length;
   assert.equal((h.blank.innerHTML.match(/class="slot(?:\s|\")/g)||[]).length,slots,`${w.term}: complete visible slot count`);
   for(let n=1;n<=w.term.length&&!s.answered;n++){
    const prefix=w.term.slice(0,n);h.type(prefix);characterInputs++;
    if(s.answered)assert(h.ctx.isCorrect(prefix,w.term)||h.ctx.isSpellingVariant(prefix,w.term),`${w.term}: premature grading at ${JSON.stringify(prefix)}`);
   }
   assert(s.answered&&!s.copyMode,`${w.term}: canonical answer auto-submits correctly`);assert.equal(s.errors,0);
   assert(h.els.get('reveal').innerHTML.includes('ov-ipa'),`${w.term}: IPA after reveal`);
   assert.equal(s.words[wi].corrects,1);assert.equal(s.firstCorrect,wi+1);
   h.advance(1499);assert.equal(s.currentId,wi,'Correct answer remains for 1500 ms');
   h.advance(1);cardCount++;
  }
  assert(h.els.get('sumScreen').classList.contains('active'),'Exercise completes');
  const rec=h.ctx.getRec(s.lesson.id,s.exercise.title);assert(rec.completed);assert.equal(rec.errors,0);assert.equal(rec.first,100);
 }
}
assert.equal(cardCount,6498);

// Fresh sessions keep these edge cases independent of the full-card run.
h=harness(filename);h.start();
function mountWord(test,word={term:'official',ko:'직원, 공무원 / 공식적인, 공무상의'}){
 test.ctx.cancelPendingAdvance();const s=test.state.session;
 Object.assign(s,{words:[{term:word.term,meaning:word.ko,id:0},{term:'upcoming',meaning:'다가오는, 곧 있을',id:1}].map(w=>({...w,attempts:0,corrects:0,errors:0,firstWrong:false,wrongEver:false,roundStreak:0,needed:1,passed:false})),queue:[0,1],roundTargets:[0,1],round:1,currentId:null,attempts:0,errors:0,firstSeen:0,firstCorrect:0,seenSet:new Set(),streak:0});
 test.ctx.nextCard();return s;
}
let quizPaths=0,copyPaths=0;
for(const c of fixture.qaCases){
 for(const a of c.answers){
  let s=mountWord(h,c);
  assert.equal(h.ctx.isCorrect(a.input,c.term)||h.ctx.isSpellingVariant(a.input,c.term),a.quiz,`${c.term}: original quiz acceptance for ${a.path}`);
  assert.equal(h.ctx.isCorrect(a.input,c.term),a.copy,`${c.term}: original copy acceptance for ${a.path}`);
  for(let n=1;n<=a.input.length&&!s.answered;n++){
   const prefix=a.input.slice(0,n);h.type(prefix);
   if(a.quiz&&s.answered)assert(h.ctx.isCorrect(prefix,c.term)||h.ctx.isSpellingVariant(prefix,c.term),`${c.term}/${a.path}: accepted input cut off too early`);
  }
  if(!s.answered)h.fire('ainput','keydown',{key:'Enter',keyCode:13});
  assert.equal(s.words[0].corrects===1,a.quiz,`${c.term}/${a.path}: typed answer outcome`);quizPaths++;
  s=mountWord(h,c);h.ctx.submit({forced:true});assert(s.copyMode);
  h.type(a.input);
  if(s.copyMode)h.fire('aform','submit');
  assert.equal(!s.copyMode,a.copy,`${c.term}/${a.path}: copy outcome`);copyPaths++;
 }
}

// Accents, punctuation and word boundaries are visible, and compact input is
// accepted without moving the letter cursor before the answer is complete.
assert.equal(h.ctx.blankParts('cliché').chars.length,6);
assert(h.ctx.blankSlots('cliché','cliché').includes('é'));
assert(h.ctx.blankSlots('lab(=laboratory)').includes('>=</span>'),'Required editorial equals is visible');
assert.equal((h.ctx.blankSlots('read between the lines').match(/class="slot-word"/g)||[]).length,4);
assert.equal((h.ctx.blankSlots('read between the lines','readbetweenthelines').match(/class="slot-word"/g)||[]).length,4);
assert.equal((h.ctx.blankSlots('read between the lines','read between').match(/class="slot-word"/g)||[]).length,4);
for(const input of ['read between the lines','readbetweenthelines','READ BETWEEN THE LINES']){
 const s=mountWord(h,{term:'read between the lines',ko:'행간의 의미를 읽다'});h.type(input);assert(s.answered&&!s.copyMode);
}

// IME: neither input nor Enter can grade an unfinished composition. Hangul is
// shown in the slots without extra language-switch instructions.
let s=mountWord(h);h.fire('ainput','compositionstart');h.type('official');
h.fire('ainput','keydown',{key:'Enter',keyCode:229,isComposing:true});h.fire('aform','submit');
assert(!s.answered);assert.equal(h.state.composing,true);
h.fire('ainput','compositionend');assert(s.answered&&!s.copyMode);assert.equal(s.attempts,1);
s=mountWord(h);h.fire('ainput','compositionstart');h.type('오피셜');h.fire('ainput','compositionend');
assert(!s.answered);assert(h.blank.innerHTML.includes('오'));
h.type('official');assert(s.answered&&!s.copyMode);
s=mountWord(h);h.ctx.submit({forced:true});h.fire('ainput','compositionstart');h.type('official');h.fire('aform','submit');assert(s.copyMode);
h.fire('ainput','compositionend');assert(!s.copyMode);assert.equal(s.attempts,1,'Copy does not count as a fresh attempt');
h.advance(649);assert.equal(s.currentId,0);h.advance(1);assert.equal(s.currentId,1,'Copy completes after 650 ms');

// Hints, forced skips and timeouts keep the original grading semantics.
s=mountWord(h);assert.equal(h.els.get('qmini').textContent,'');h.ctx.giveHint();assert(h.els.get('qmini').innerHTML.includes('힌트①'));h.type('official');assert.equal(s.firstCorrect,0);assert.equal(s.errors,0);
s=mountWord(h);h.els.get('ainput').value='official';h.ctx.submit({timeout:true});assert(s.copyMode);assert.equal(s.errors,1);assert.equal(s.firstCorrect,0);
s=mountWord(h);h.els.get('ainput').value='official';h.ctx.submit({forced:true});assert(s.copyMode);assert.equal(s.errors,1);
s=mountWord(h);h.advance(s.cardLimit*1000);h.ctx.updateStats();assert(s.copyMode);assert.equal(s.errors,1,'Timer expiration is still an incorrect attempt');

// Focus returns through the actual UI events without a separate helper button,
// both while answering and while copying a missed answer.
s=mountWord(h);
for(const copy of [false,true]){
 if(copy)h.ctx.submit({forced:true});
 assert.equal(h.doc.activeElement,h.els.get('ainput'));
 h.els.get('ainput').blur();h.events['win:focus'].forEach(f=>f());
 assert.equal(h.doc.activeElement,h.els.get('ainput'));
 h.els.get('ainput').blur();h.fire('gameScreen','mousedown',{target:h.els.get('hoeCtx')});
 assert.equal(h.doc.activeElement,h.els.get('ainput'));
}
h.type('official');assert(!s.copyMode);h.advance(650);assert.equal(s.currentId,1);

// Retry rounds: correct first-pass words stay out; wrong words require two
// consecutive later answers, and wrong retries reset their streak.
s=mountWord(h);s.words[0].wrongEver=true;s.words[1].passed=true;s.queue=[];h.ctx.startRound(2);
assert.deepEqual(plain(s.roundTargets),[0]);assert.equal(s.words[0].needed,2);
h.type('official');assert.equal(s.words[0].roundStreak,1);assert.equal(s.words[0].passed,false);assert.deepEqual(plain(s.queue),[0]);
h.advance(1500);h.ctx.submit({forced:true});assert.equal(s.words[0].roundStreak,0);h.type('official');h.advance(650);
h.type('official');h.advance(1500);h.type('official');assert.equal(s.words[0].roundStreak,2);assert.equal(s.words[0].passed,true);

// Leaving/changing scope must cancel the previous card's pending transition.
s=mountWord(h);h.type('official');h.fire('exitBtn','click');h.start(0,0);const fresh=h.state.session;
h.advance(1500);assert.equal(h.state.session,fresh);assert.equal(fresh.currentId,0);assert(!fresh.answered);
h.type('official');h.fire('prevBtn','click');assert.equal(h.state.session,null);assert(h.els.get('homeScreen').classList.contains('active'));assert.equal(h.storage.get('goyang-mode-v1'),'1');h.advance(2000);assert.equal(h.state.session,null);

// An actual old record fixture remains usable in both range modes.
const records={'01강':{'Exercise 1':{completed:true,bestMs:12345,lastMs:14000,attempts:5,errors:1,first:80},'이전기출 1':{completed:true,bestMs:54321,lastMs:55000,attempts:9,errors:2,first:70}}};
const seed={'goyang-seoul-v1':JSON.stringify(records),'goyang-mode-v1':'0','goyang-uni-v1':'기존 대학'};
h=harness(filename,seed);assert.equal(h.ctx.clearedExercises(),1);assert.equal(h.ctx.getRec('01강','Exercise 1').bestMs,12345);assert.equal(h.storage.get('goyang-uni-v1'),'기존 대학');
h.fire('prevBtn','click');assert.equal(h.ctx.clearedExercises(),2);assert.equal(h.ctx.totalExercises(),521);assert.equal(h.els.get('prevBtn').textContent,'전체');
assert.deepEqual(JSON.parse(h.storage.get('goyang-seoul-v1')),records,'Changing year scope does not rewrite progress');
h.ctx.setRec('01강','Exercise 1',{timeMs:20000,attempts:6,errors:0,first:100});assert.equal(h.ctx.getRec('01강','Exercise 1').bestMs,12345);assert.equal(h.ctx.getRec('01강','Exercise 1').lastMs,20000);
h.ctx.setRec('01강','Exercise 1',{timeMs:10000,attempts:5,errors:0,first:100});assert.equal(h.ctx.getRec('01강','Exercise 1').bestMs,10000);assert.equal(h.ctx.getRec('01강','이전기출 1').bestMs,54321);
assert.deepEqual(Object.keys(h.ctx.getRec('01강','Exercise 1')).sort(),['attempts','bestMs','completed','errors','first','lastMs']);
h.start();s=h.state.session;const before={total:s.totalStart,card:s.cardStart};h.doc.hidden=true;h.events['doc:visibilitychange'].forEach(f=>f());h.advance(4200);h.doc.hidden=false;h.events['doc:visibilitychange'].forEach(f=>f());
assert.equal(s.totalStart-before.total,4200);assert.equal(s.cardStart-before.card,4200);
assert.equal(JSON.parse(h.storage.get('goyang-seoul-last-v1')).lid,'01강','Resume metadata uses its own key');

console.log(`PASS Mother Tongue Fable UI: 6,498 canonical cards (${characterInputs.toLocaleString()} character events), ${fixture.qaCases.length} special terms / ${quizPaths} quiz + ${copyPaths} copy paths; IME, slots, timers, retry rules and legacy records preserved.`);
