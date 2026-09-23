const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const path=require('path'),crypto=require('crypto');
const html = fs.readFileSync(path.resolve(__dirname,'../../vocagoyangfable.html'),'utf8');
const dataBlob = h => h.match(/const DATA = (\[.*?\]);\r?\n/s)[1];
const baseline = JSON.parse(dataBlob(html)).slice(0,46);
const corrections=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../connection-legacy-corrections.json'),'utf8')).changes;
const originalBaseline=JSON.parse(JSON.stringify(baseline));
assert.equal(corrections.length,4,'Review any additional legacy edits explicitly');
for(const change of corrections){
  const [set,exercise,index]=change.id.split(':').map(Number);
  const card=originalBaseline[set].exercises.find(e=>e.ex===exercise).words[index];
  assert.equal(card.word,change.word);assert.equal(change.field,'c');assert.equal(card.c,change.new);
  card.c=change.old;
}
assert.equal(crypto.createHash('sha256').update(JSON.stringify(originalBaseline)).digest('hex'),'00a6219b449ab28ca5be7375df61617642217d757243abb429d20d460acf63dc','0–45 changed beyond the four reviewed explanation corrections and removal of lesson 0 exercise 10');
for (const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(m[1]);
const data = JSON.parse(dataBlob(html));
const canonical = data.map(l => ({...l, id:l.label, exercises:l.exercises.map(e => ({...e,title:'Exercise '+e.ex,words:e.words.map(w => ({...w,term:w.en,meaning:w.ko}))}))}));
const lessons=canonical;
function between(start,end) {
  const a=html.indexOf(start), b=html.indexOf(end,a+start.length);
  assert(a>=0 && b>a, start);
  return html.slice(a,b);
}
let rngSeed=10;
const seededMath=Object.create(Math);
seededMath.random=()=>{rngSeed=(Math.imul(1664525,rngSeed)+1013904223)>>>0;return rngSeed/4294967296;};
const elements=new Map();
let previous=null, shown=0, lastShow=null;
const ctx = vm.createContext({
  Math:seededMath,Date,Set,console,
  state:{lessons:canonical,li:0,ei:0,session:null},
  activeLesson:()=>canonical[ctx.state.li],
  $:id=>{if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',value:'',style:{},classList:{add(){},remove(){}},focus(){}});return elements.get(id);},
  visEx:l=>l.exercises, saveLast(){}, setCat(){}, show(){}, startTicker(){}, toast(){}, pick(){}, LINES:{start:[]},
  updateStats(){},mirrorTyped(){},focusAnswerInput(){},requestAnimationFrame:f=>f(),
  finishExercise(){ctx.state.session.finished=true;},
  hoeCtxHtml(w){
    const s=ctx.state.session;
    const key=(w.word||w.term).trim().toLowerCase();
    if(previous===key){
      assert(!s.queue.some(id=>(s.round===1||!s.words[id].passed)&&(s.words[id].word||s.words[id].term).trim().toLowerCase()!==key), 'Repeated word despite an eligible different word');
    }
    previous=key; shown++; lastShow={id:w.id,round:s.round}; return '';
  }
});
const code=[
  between('function limitFor(', 'function isCorrect('),
  between('function shuffle(', 'function submit('),
  between('function applyCorrect(', '/* 입력창에 친 글자를')
].join('\n');
vm.runInContext(code,ctx);
let sessions=0,firstOrders=new Set();
for(let seed=1;seed<=12;seed++){
  rngSeed=seed;
  for(let li=0;li<lessons.length;li++)for(let ei=0;ei<lessons[li].exercises.length;ei++){
    ctx.state.li=li; previous=null; shown=0;
    ctx.startExercise(ei);
    const s=ctx.state.session,seenFirst=[],attempts=new Map();
    while(!s.finished){
      assert(shown<1500,'Session did not terminate');
      const w=s.words[s.currentId];
      const n=(attempts.get(w.id)||0)+1;attempts.set(w.id,n);
      if(s.round===1)seenFirst.push(w.id);
      // Alternate all-correct, first-attempt misses, and repeated review misses.
      const miss=seed%3===0 ? n===1&&w.id%3===0 : seed%3===1 ? n<=2&&w.id%4===0 : false;
      if(miss){w.wrongEver=true;if(s.round===1)w.firstWrong=true;ctx.applyWrong(w);}else ctx.applyCorrect(w);
      ctx.nextCard();
    }
    assert.deepEqual([...seenFirst].sort((a,b)=>a-b),s.words.map(w=>w.id),'First pass lost or duplicated cards');
    assert(s.words.every(w=>w.passed),'Completion before mastery');
    assert(s.words.filter(w=>w.wrongEver).every(w=>w.roundStreak>=2),'Wrong card did not receive two correct answers');
    if(li===0&&ei===0)firstOrders.add(seenFirst.join(','));
    sessions++;
  }
}
assert(firstOrders.size>1,'First pass did not shuffle');
// A retry consisting of one headword must still terminate, including repeated misses.
ctx.state.li=1; previous=null; shown=0;
const target=lessons[1].exercises[0].words[0].term;
ctx.startExercise(0,new Set([target]));
assert(ctx.state.session.partial);
const partial=ctx.state.session;
const attempts=new Map();
while(!partial.finished){
  assert(shown<100);
  const w=partial.words[partial.currentId],n=(attempts.get(w.id)||0)+1;attempts.set(w.id,n);
  if(n===1){w.wrongEver=true;ctx.applyWrong(w);}else ctx.applyCorrect(w);
  ctx.nextCard();
}
for(const l of lessons)for(const e of l.exercises)for(const w of e.words){
  const letters=w.term.replace(/[^a-zA-Z]/g,'').length;
  const count=w.term.trim().split(/\s+/).filter(Boolean).length;
  const old=Math.min(45,Math.max(14,Math.round(8+letters*1.6+Math.max(0,count-1)*4)));
  assert.equal(ctx.limitFor(w.term),old+1);
}
// Progress uses unchanged lesson labels and exercise titles, not card counts.
const progressKey=(l,e)=>l.label+'|'+(e.scope==='prev'?'이전기출 ':'Exercise ')+e.ex+(e.name?' · '+e.name:'');
const oldKeys=baseline.slice(0,46).flatMap(l=>l.exercises.map(e=>progressKey(l,e))),newKeys=data.flatMap(l=>l.exercises.map(e=>progressKey(l,e)));
assert.equal(new Set(newKeys).size,newKeys.length);for(const k of oldKeys)assert(newKeys.includes(k),'Lost progress key '+k);
const addedProgressKeys=newKeys.filter(k=>!oldKeys.includes(k)).length;
assert.equal(addedProgressKeys,lessons.slice(46).reduce((n,l)=>n+l.exercises.length,0));
const textCtx=vm.createContext({esc:s=>s});vm.runInContext(between('function answerInSentence(', 'function hoeCtxHtml('),textCtx);
assert.equal(textCtx.answerInSentence('{{BLANK}} is useful.','iPhone'),'iPhone');
assert.equal(textCtx.answerInSentence('I won. {{BLANK}}, she lost.','however'),'However');
assert.equal(textCtx.answerInSentence('It is {{BLANK}}.','good'),'good');
const result={sessions,exercises:lessons.reduce((n,l)=>n+l.exercises.length,0),seeds:12,firstOrders:firstOrders.size,partialRetry:'passed',allCardLimits:'exactly +1 second',cardData:'0–45 only four logged explanation corrections and removal of 0:10; remaining data hash verified',scriptSyntax:'passed',nonAdjacentRule:'passed except when no other headword remains',existingProgressKeys:oldKeys.length,newProgressKeys:addedProgressKeys,brandAndSentenceCasing:'passed'};
console.log(JSON.stringify(result));
