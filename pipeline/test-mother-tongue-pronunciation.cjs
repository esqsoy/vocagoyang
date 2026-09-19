/* Run: node pipeline/test-mother-tongue-pronunciation.cjs [baseline.html]
 * The frozen fingerprints keep this check runnable in a fresh repository clone.
 * If available, also verify the immutable work/mt-pronunciation-20260920/before.html.
 */
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),assert=require('assert/strict');
const read=p=>fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n');
const html=read(path.resolve(__dirname,'../vocagoyangksat2027.html'));
const baselinePath=process.argv[2]?path.resolve(process.argv[2]):path.resolve(__dirname,'../../../mt-pronunciation-20260920/before.html');
const frozen={
  data:'0ced6024f141350d6fa8d0e7b43bbb728bef774ac9300349f3ba1c682638fe81',
  storage:'6777caf708d683c3c3f2336c7da403bd83f6348e313fcfffb1763fc653f3ed9f',
  lessonsAndProgress:'1b22925ee52a3b81b4502e5f4f31a6c5a1388c55dd15c1ed9d3af9ff10a54928',
  rulesAndStart:'1f29d0c9b4a0d967b8e40a2a053e414460b8d11765fda6ce40b117f8212d4ade',
  nextCard:'47b3857274c547b913fc9abf89495833a99205834fc8ada9e741a025c48e1034',
  grading:'37177adbf257e022c6872a3a8bd78314603220f3d5edfc299722352013b62be0',
  copyAndCompletion:'18960ca625594f9eee90b7a6a371d2130eae1611a024eb10323af2fe0a67b43d'
};
function between(text,a,b){const i=text.indexOf(a),j=text.indexOf(b,i+a.length);assert(i>=0&&j>i,`Missing source boundary: ${a} -> ${b}`);return text.slice(i,j);}
const block=(a,b)=>between(html,a,b);
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
function invariants(text){return {
  data:text.match(/^const DATA = .*;$/m)?.[0],
  storage:text.match(/^const STORAGE=.*;$/m)?.[0]+'\n'+text.match(/^const MODEKEY=.*;$/m)?.[0],
  lessonsAndProgress:between(text,'function buildLessons(','/* ===== screens ===== */'),
  rulesAndStart:between(text,'function limitFor(','function nextCard('),
  nextCard:between(text,'function nextCard(','function submit(').replace('  // 이미 시작한 긴 발음은 마치게 두고, 아직 시작하지 않은 재생 예약만 취소한다.\n  stopPronunciation(false);\n',''),
  grading:between(text,'function submit(','function showReveal('),
  copyAndCompletion:between(text,'function submitCopy(','/* ===== fx + audio ===== */')
};}
const current=invariants(html);
for(const [name,expected] of Object.entries(frozen))assert.equal(digest(current[name]),expected,`Unrelated change to ${name}`);
if(process.argv[2]||fs.existsSync(baselinePath)){
  const original=invariants(read(baselinePath));
  for(const [name,expected] of Object.entries(frozen)){
    assert.equal(digest(original[name]),expected,`Immutable baseline changed: ${name}`);
    assert.equal(current[name],original[name],`Original ${name} must remain unchanged`);
  }
}
for(const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
assert.equal((html.match(/^const MT_PRONUNCIATIONS\s*=/gm)||[]).length,1);
assert.equal((html.match(/\$\("#quizOverlay"\)\.addEventListener\("click"/g)||[]).length,1,'One delegated pronunciation listener');
assert.equal((html.match(/\$\("#muteBtn"\)\.addEventListener\("click"/g)||[]).length,1,'Do not duplicate mute listeners');
assert.match(html,/\.mt-speak:focus-visible\{/,'Keyboard focus must remain visible');

const fixtures={
  lead:{ipa:'liːd',speech:'lead',label:'동사',alternatives:[{ipa:'led',label:'명사'}],meanings:{'납':{ipa:'led',speech:'led'}}},
  phrase:{ipa:'ˈfreɪz ; freɪz',speech:'a longer example phrase'},
  'unsafe"<&':{ipa:'ˈa<&',speech:'safe',label:'<명사>',alternatives:[{ipa:'ˌb>&',label:'"동사"'}]}
};
const usVoice={name:'Plain English',lang:'en-US',localService:true};
function harness(options={}){
  const {supported=true,speechThrows=false,voicesThrow=false}=options;
  let voices=options.voices??[usVoice],cancelCount=0,intervalId=0;
  const spoken=[],intervals=new Map(),timeouts=[],elements=new Map();
  function element(id){
    if(elements.has(id))return elements.get(id);
    const classes=new Set(id==='#gameScreen'?['active']:[]),events={};
    const el={value:'',innerHTML:'',textContent:'',className:'',disabled:false,style:{},offsetWidth:100,events,
      classList:{add:(...s)=>s.forEach(v=>classes.add(v)),remove:(...s)=>s.forEach(v=>classes.delete(v)),contains:s=>classes.has(s)},
      addEventListener:(name,fn)=>(events[name]??=[]).push(fn),focus(){this.focused=true;}};
    elements.set(id,el);return el;
  }
  const word={id:0,term:'lead',meaning:'납',passed:false},next={id:1,term:'phrase',meaning:'표현',passed:false};
  const state={muted:false,session:{currentId:0,answered:true,copyMode:false,copyAns:'',words:[word,next],queue:[1],round:1,fbMode:true}};
  const synth={getVoices:()=>{if(voicesThrow)throw Error('voices unavailable');return voices;},cancel:()=>cancelCount++,speak:u=>{if(speechThrows)throw Error('speech unavailable');spoken.push(u);}};
  const window=supported?{speechSynthesis:synth,SpeechSynthesisUtterance:function(text){this.text=text;}}:{};
  const screens={game:element('#gameScreen'),home:element('#homeScreen'),lesson:element('#lessonScreen'),sum:element('#sumScreen')};
  const ctx=vm.createContext({window,state,screens,MT_PRONUNCIATIONS:fixtures,$:element,CAT:{evil:'data:test'},
    esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),
    setInterval:fn=>{intervals.set(++intervalId,fn);return intervalId;},clearInterval:id=>intervals.delete(id),
    setTimeout:(fn,ms)=>{timeouts.push({fn,ms});return timeouts.length;},requestAnimationFrame:fn=>fn(),
    limitFor:()=>12,hintFor:()=>'',setCat(){},updateStats(){},startRound(){},stopTicker(){},renderExList(){},fx(){},beep(){}});
  vm.runInContext([
    block('function show(n)','/* ===== home ===== */'),
    block('function normalize(','function shuffle('),
    block('function nextCard(','function submit('),
    block('function showReveal(','function giveHint('),
    block('$("#quizOverlay").addEventListener','$("#aform").addEventListener'),
    block('$("#exitBtn").addEventListener','$("#backHome").addEventListener'),
    block('$("#muteBtn").addEventListener','$("#resetBtn").addEventListener')
  ].join('\n'),ctx);
  return {ctx,state,screens,spoken,intervals,timeouts,element,
    get cancels(){return cancelCount;},setVoices:v=>voices=v,
    run:s=>vm.runInContext(s,ctx),fire:(id,event='click',e={})=>element(id).events[event]?.forEach(fn=>fn(e)),
    tick:()=>[...intervals.values()].forEach(fn=>fn())};
}

// Meaning-specific entries resolve both displayed IPA and spoken text, without leaking base alternatives.
let h=harness();
let markup=h.run('pronunciationMarkup("lead","납")');
assert(markup.includes('/led/'));assert(!markup.includes('/liːd/'));assert(!markup.includes('동사'));
assert(markup.includes('aria-label="lead 발음 듣기"'));assert(markup.includes('type="button"'));
assert(markup.includes('title="발음 듣기: led (무음에서는 재생되지 않음)"'),'Explain the actual disambiguating speech expression');
markup=h.run('pronunciationMarkup("lead","이끌다 / 납")');
assert(markup.includes('동사 /liːd/ · 명사 /led/'));
assert.equal((markup.match(/class="mt-ipa"/g)||[]).length,1);
markup=h.ctx.pronunciationMarkup('unsafe"<&','');
assert(markup.includes('&lt;명사&gt; /ˈa&lt;&amp;/ · &quot;동사&quot; /ˌb&gt;&amp;/'));
assert(markup.includes('aria-label="unsafe&quot;&lt;&amp; 발음 듣기"'));
assert(!markup.includes('<명사>'),'IPA, labels and answer text must be escaped');
assert(h.run('pronunciationMarkup("phrase","")').includes('/ˈfreɪz ; freɪz/'),'Preserve stress marks and separators');

// Actual reveal and copy functions pass the current meaning and display audio only after an answer.
h.ctx.showReveal('good','lead','납','맞았어');
assert(h.element('#quizOverlay').innerHTML.includes('/led/'));assert.equal(h.spoken.at(-1).text,'led');
assert.equal(h.spoken.at(-1).rate,.88);
h=harness();h.ctx.startCopy('lead','납','다시 써 봐');
assert(h.element('#quizOverlay').innerHTML.includes('/led/'));assert.equal(h.spoken[0].text,'led');
assert.equal(h.state.session.copyMode,true);assert.equal(h.element('#ainput').disabled,false);
assert.equal(h.element('#ainput').focused,true,'Adding a button must not steal typing focus');
const beforeReplay=h.spoken.length;
h.element('#ainput').focused=false;
h.fire('#quizOverlay','click',{target:{closest:()=>({})}});assert.equal(h.spoken.length,beforeReplay+1);assert.equal(h.spoken.at(-1).text,'led');
assert.equal(h.element('#ainput').focused,true,'Replay returns focus to the current copy input');
h.fire('#quizOverlay','click',{target:{closest:()=>null}});assert.equal(h.spoken.length,beforeReplay+1,'Unrelated clicks do not replay');
// A native button provides Enter/Space activation through the same single click handler.
assert.equal(h.element('#quizOverlay').events.click.length,1);
h.element('#ainput').value='lead';h.ctx.submitCopy();
assert.equal(h.timeouts.at(-1).ms,650,'Copy completion delay remains unchanged');
assert.equal(h.state.session.copyMode,false);

// A new question clears IPA and button markup; blocked calls cannot reveal its answer by audio.
h=harness();h.ctx.showReveal('good','lead','납','');const afterReveal=h.spoken.length,cancelsAtStart=h.cancels;
h.ctx.nextCard();
assert.equal(h.element('#quizOverlay').innerHTML,'');assert.equal(h.state.session.answered,false);
assert.equal(h.state.session.currentId,1);assert.equal(h.cancels,cancelsAtStart,'Already started speech must finish across nextCard');
h.ctx.speakPronunciation('phrase','표현');assert.equal(h.spoken.length,afterReveal);
h.state.session.answered=true;h.ctx.speakPronunciation('lead','납');assert.equal(h.spoken.length,afterReveal,'A different answer cannot be spoken');
h.ctx.speakPronunciation('phrase','표현');assert.equal(h.spoken.at(-1).text,'a longer example phrase');assert.equal(h.cancels,cancelsAtStart+1,'New revealed speech replaces previous speech');

// One mute control silences both queued and current speech, without changing answer state.
h=harness();h.ctx.speakPronunciation('lead','납');const muteStart=h.cancels;
h.fire('#muteBtn');assert.equal(h.state.muted,true);assert.equal(h.cancels,muteStart+1);
h.ctx.speakPronunciation('lead','납');assert.equal(h.spoken.length,1);assert.equal(h.state.session.answered,true);
h.fire('#muteBtn');h.ctx.speakPronunciation('lead','납');assert.equal(h.spoken.length,2);

// Exit uses the real handler and show() path, cancelling active speech and pending work.
h=harness();h.ctx.speakPronunciation('lead','납');const exitStart=h.cancels;
h.fire('#exitBtn');assert.equal(h.state.session,null);assert.equal(h.cancels,exitStart+1);
assert(h.screens.lesson.classList.contains('active'));assert(!h.screens.game.classList.contains('active'));
h.ctx.speakPronunciation('lead','납');assert.equal(h.spoken.length,1);

// Unavailable APIs or runtime exceptions cannot break reveal/copy/next-card flow.
for(const options of [{supported:false},{speechThrows:true},{voicesThrow:true}]){
  h=harness(options);
  assert.doesNotThrow(()=>h.ctx.showReveal('good','lead','납',''));
  assert.doesNotThrow(()=>h.ctx.startCopy('lead','납',''));
  if(options.supported===false)assert(h.element('#quizOverlay').innerHTML.includes(' disabled'));
  assert.doesNotThrow(()=>h.ctx.nextCard());assert.equal(h.state.session.answered,false);
}

// Lazy voice loading has a bounded wait, and nextCard must invalidate queued old answers.
h=harness({voices:[]});h.ctx.speakPronunciation('lead','납');
assert.equal(h.intervals.size,1);assert.equal(h.spoken[0].volume,0,'Only a silent priming utterance before voices load');
const stale=[...h.intervals.values()][0];h.ctx.nextCard();assert.equal(h.intervals.size,0);
h.setVoices([usVoice]);stale();assert.equal(h.spoken.length,1,'Stale callbacks cannot speak after advancing');
h=harness({voices:[]});h.ctx.speakPronunciation('lead','납');h.setVoices([usVoice]);h.tick();
assert.equal(h.spoken.at(-1).text,'led');assert.equal(h.intervals.size,0);
h=harness({voices:[]});h.ctx.speakPronunciation('lead','납');for(let i=0;i<12;i++)h.tick();
assert.equal(h.spoken.at(-1).lang,'en-US');assert.equal(h.spoken.at(-1).text,'led');assert.equal(h.intervals.size,0);
for(const action of ['mute','exit']){
  h=harness({voices:[]});h.ctx.speakPronunciation('lead','납');const pending=[...h.intervals.values()][0];
  h.fire(action==='mute'?'#muteBtn':'#exitBtn');assert.equal(h.intervals.size,0);h.setVoices([usVoice]);pending();
  assert.equal(h.spoken.length,1,`${action} must invalidate delayed speech`);
}

// US voices outrank even preferred-name UK voices; late US availability supersedes an earlier UK choice.
const uk={name:'Samantha',lang:'en-GB',localService:true};
h=harness({voices:[uk,usVoice]});h.ctx.speakPronunciation('lead','납');assert.equal(h.spoken[0].voice.lang,'en-US');
h=harness({voices:[uk]});h.ctx.speakPronunciation('lead','납');assert.equal(h.spoken[0].voice.lang,'en-GB');
h.setVoices([uk,usVoice]);h.ctx.speakPronunciation('lead','납');assert.equal(h.spoken.at(-1).voice.lang,'en-US');

console.log(JSON.stringify({baseline:'frozen 2026-09-20 snapshot',data:'unchanged',gameplayTimingProgress:'unchanged',
  display:'reveal and copy only; escaped IPA, labels and alternatives; meaning-aware',audio:'reveal-only and meaning-aware',
  muteExitUnsupported:'passed',delayedSpeech:'bounded and invalidated on navigation',startedSpeech:'survives nextCard',
  voice:'US preferred',events:'one native-button replay handler'}));
