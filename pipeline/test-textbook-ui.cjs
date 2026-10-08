// Exercise every EBS card through the actual new input handlers, and verify the
// Fable presentation does not change either textbook's passage/record boundaries.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const {harness,root}=require('./tests/helpers/mother-tongue-harness.cjs');
const mt=require('./tests/mother-tongue-layout.fixture.json'),ebs=require('./tests/ebs-layout.fixture.json');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex'),plain=x=>JSON.parse(JSON.stringify(x));
const totals=[];
for(const [book,fixture] of [['ksat',mt],['ebs',ebs]]){
 let h=harness(path.join(root,'vocagoyang'+book+'2027.html'));
 assert.equal(hash(h.run('JSON.stringify(DATA)')),fixture.dataSha256,'Vocabulary stays unchanged');
 assert.deepEqual(plain(h.state.lessons.map(l=>({id:l.id,exercises:l.exercises.map(e=>({title:e.title,scope:e.scope}))}))),fixture.progressKeys);
 for(const [key,value] of Object.entries(fixture.storage))assert.equal(h.run(key),value);
 for(const [name,expected] of Object.entries(mt.functions))assert.equal(hash(require('./saved-cards/restore-host.cjs').restoreHostFunction(h.ctx[name].toString(),'vocagoyang'+book+'2027.html')),expected,'Original textbook rule '+name);
 assert(h.html.includes('class="slot-hint"'));assert(h.html.includes('class="cat-speech"'));
 assert(h.html.includes('background:#b8a2d4'));assert(h.html.includes('background:#b97882'));
 assert(!h.html.includes('힌트②'));assert(!h.els.has('focusInputBtn'));assert(!h.els.has('resetBtn'));
 assert.equal(h.els.has('prevBtn'),book==='ksat');
 if(book==='ebs'){
   let cards=0,events=0;
   for(let li=0;li<h.state.lessons.length;li++)for(let ei=0;ei<h.state.lessons[li].exercises.length;ei++){
     h.start(li,ei);const s=h.state.session;
     for(let wi=0;wi<s.words.length;wi++){
       assert.equal(s.currentId,wi);const w=s.words[wi];
       for(let n=1;n<=w.term.length&&!s.answered;n++){
         const prefix=w.term.slice(0,n);h.type(prefix);events++;
         if(s.answered)assert(h.ctx.isCorrect(prefix,w.term)||h.ctx.isSpellingVariant(prefix,w.term),'Premature grading '+w.term);
       }
       assert(s.answered&&!s.copyMode,w.term);assert.equal(s.errors,0);
       assert(h.blank.innerHTML.includes('slot-glyph'));assert(!h.els.get('reveal').innerHTML.includes('rv-word'));
       assert(h.els.get('catSpeech').textContent);h.advance(1500);cards++;
     }
     assert(h.ctx.getRec(s.lesson.id,s.exercise.title).completed);
   }
   assert.equal(cards,597);assert.equal(h.ctx.totalExercises(),48);assert.equal(h.spoken.filter(u=>u.text.trim()).length,cards,'Every reviewed EBS card receives its browser pronunciation');totals.push({book,cards,characterEvents:events});
   const progress=Object.fromEntries(h.storage);h=harness(path.join(root,'vocagoyangebs2027.html'),progress);
   assert.equal(h.ctx.clearedExercises(),48);assert(h.ctx.resumeTarget());assert(!h.storage.has('goyang-seoul-v1'));
 }
 h=harness(path.join(root,'vocagoyang'+book+'2027.html'));h.start();let s=h.state.session;
 const w=s.words[0];w.term='nineteen';h.ctx.giveHint();h.ctx.giveHint();assert.equal(h.els.get('ainput').value,'n');assert.equal(s.hints,1);
 assert.equal(h.els.get('qmini').textContent,'');assert(!s.answered);h.type('nineteen');assert(s.answered&&!s.copyMode);assert.equal(s.firstCorrect,0);
 h.ctx.cancelPendingAdvance();h.start();s=h.state.session;h.ctx.submit({forced:true});assert(s.copyMode);assert.equal(s.errors,1);
 h.type(s.words[0].term);assert(!s.copyMode);h.advance(1500);assert.equal(s.currentId,1);
 h.ctx.giveHint();assert.equal(s.hints,1,'Per-exercise hint count');
 // Native one-letter hint never submits by itself.
 h.ctx.cancelPendingAdvance();h.start();s=h.state.session;s.words[0].term='I';h.ctx.giveHint();assert(!s.answered);h.fire('aform','submit');assert(s.answered);
 h.ctx.cancelPendingAdvance();h.start();s=h.state.session;h.fire('ainput','compositionstart');h.type(s.words[0].term);h.fire('aform','submit');assert(!s.answered);h.fire('ainput','compositionend');assert(s.answered);
 const clean={errors:0,words:[{}]},dirty={errors:1,words:[{}]};assert.equal(h.ctx.completePerfectRun(clean,100),1);assert.equal(h.ctx.completePerfectRun(clean,100),1);
 assert.equal(h.ctx.completePerfectRun({errors:0,words:[{}]},100),2);assert.equal(h.ctx.completePerfectRun(dirty,90),0);
 s.words[0].wrongEver=true;s.words[0].errors=1;s.errors=1;h.ctx.finishExercise();assert(h.els.get('sumWrong').innerHTML.includes('wrow'));
 assert(h.els.get('sumWrong').innerHTML.includes('data-id="0"'));
}
console.log(JSON.stringify({ebs:totals,allPassageAndStorageKeysPreserved:true,firstCellHint:'one letter only, one-letter answers require confirmation',input:'correct, copy, IME and retries',feedback:'answer remains in cells; cat dialogue above',perfectStreak:'duplicate completion and miss reset verified'}));
