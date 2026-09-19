// Run from the repository: node pipeline/test-mother-tongue-pronunciation.cjs [candidate.html]
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {harness,root}=require('./tests/helpers/mother-tongue-harness.cjs');
const filename=process.argv[2]?path.resolve(process.argv[2]):path.join(root,'vocagoyangksat2027.html');
const fable=fs.readFileSync(path.join(root,'vocagoyangfable.html'),'utf8');
const clean=s=>s.replace(/<[^>]+>/g,'');
let h=harness(filename);
assert.equal(h.html.match(/^function fmtIpa\(.*$/m)[0],fable.match(/^function fmtIpa\(.*$/m)[0],'Use the same IPA stress formatting as Fable');
assert(!h.html.includes('class="mt-speak"'));assert(!h.els.has('muteBtn'));assert(!h.els.has('resetBtn'));
assert(h.els.has('muteBtn2'));
let markup=h.ctx.pronunciationMarkup('house','소장하다, 보관하다');
assert(markup.includes('class="ov-ipa"'));assert(clean(markup).includes('동사 /haʊz/'));assert(!clean(markup).includes('haʊs'));
markup=h.ctx.pronunciationMarkup('house','보관하다 / 집');assert(clean(markup).includes('동사 /haʊz/ · 명사 /haʊs/'));
assert(!/<button|role=/.test(markup),'IPA has no separate replay button');
assert(h.ctx.pronunciationMarkup('official','').includes('<b>'),'Primary stress retains Fable emphasis');
h.run('MT_PRONUNCIATIONS["unsafe"]={ipa:"ˈa<&",label:"<명사>",speech:"safe",alternatives:[{ipa:"b>&",label:"동사"}]}');
markup=h.ctx.pronunciationMarkup('unsafe','');assert(markup.includes('&lt;명사&gt;'));assert(markup.includes('&lt;&amp;'));assert(!markup.includes('<명사>'));

// A real quiz answer triggers one utterance, never before the reveal.
h=harness(filename);h.start();
const term=h.state.session.words[h.state.session.currentId].term;
assert.equal(h.els.get('reveal').innerHTML,'');assert.equal(h.spoken.length,0);
h.ctx.speakPronunciation(term,'');assert.equal(h.spoken.length,0);
h.type(term);assert.equal(h.state.session.answered,true);assert.equal(h.spoken.length,1);
assert.equal(h.spoken[0].text,term);assert.equal(h.spoken[0].rate,.88);assert.equal(h.spoken[0].lang,'en-US');
assert(h.els.get('reveal').innerHTML.includes('ov-ipa'));assert(h.els.get('reveal').innerHTML.includes('class="rv-w"'));
const afterStart=h.cancels;h.advance(1500);
assert.equal(h.state.session.answered,false);assert.equal(h.els.get('reveal').innerHTML,'');assert.equal(h.cancels,afterStart,'Started audio may finish across the next question');

// Wrong answers use the same Fable word/IPA reveal and automatic TTS during copy.
h=harness(filename);h.start();h.els.get('ainput').value='wrong';h.ctx.submit();
assert(h.state.session.copyMode);assert.equal(h.spoken.length,1);assert(h.els.get('reveal').innerHTML.includes('ov-ipa'));
const word=h.state.session.words[0];
const wordTarget={closest:q=>q==='.rv-w'?{}:null};
h.fire('reveal','click',{target:wordTarget});assert.equal(h.spoken.length,2,'Fable word tap replays, with no standalone control');assert.equal(h.doc.activeElement,h.els.get('ainput'));
h.fire('reveal','keydown',{target:wordTarget,key:'Enter'});assert.equal(h.spoken.length,3,'Revealed word remains keyboard accessible');
const count=h.spoken.length;h.fire('reveal','click',{target:{closest:()=>null}});assert.equal(h.spoken.length,count);
const cancelBefore=h.cancels;h.fire('muteBtn2','click');assert(h.state.muted);assert(h.cancels>cancelBefore);
h.ctx.speakPronunciation(word.term,word.meaning);assert.equal(h.spoken.length,count);
h.fire('muteBtn2','click');h.ctx.speakPronunciation(word.term,word.meaning);assert.equal(h.spoken.length,count+1);
h.fire('exitBtn','click');assert.equal(h.state.session,null);assert(!h.doc.body.classList.contains('playing'));

// Current meaning determines both transcription and spoken context for homographs.
h=harness(filename);h.start();
Object.assign(h.state.session.words[0],{term:'house',meaning:'소장하다, 보관하다'});h.state.session.answered=true;
h.ctx.showReveal('good','house','소장하다, 보관하다','');assert.equal(h.spoken.at(-1).text,'to house');assert(clean(h.els.get('reveal').innerHTML).includes('동사 /haʊz/'));

// US candidates win even when another English voice has a preferred name.
h=harness(filename);
h.ctx.window.speechSynthesis.getVoices=()=>[{name:'Samantha',lang:'en-GB'},{name:'Plain English',lang:'en-US'}];
assert.equal(h.ctx.pickPronunciationVoice().lang,'en-US');

// Lazy voice loading may not start a stale question's audio after a transition.
h=harness(filename);h.ctx.window.speechSynthesis.getVoices=()=>[];h.start();h.type(h.state.session.words[0].term);
assert(h.spoken.every(u=>u.text===' '));h.advance(1500);
h.ctx.window.speechSynthesis.getVoices=()=>[{name:'US',lang:'en-US'}];
for(const task of [...h.intervals.values()])task.f();
assert(h.spoken.every(u=>u.text===' '),'Pending old pronunciation was invalidated');

// Missing native TTS and native failures do not break reveal or copy.
for(const kind of ['missing','voices-throw','speak-throw']){
 h=harness(filename);
 if(kind==='missing'){h.ctx.window.speechSynthesis=null;h.ctx.window.SpeechSynthesisUtterance=null;}
 if(kind==='voices-throw')h.ctx.window.speechSynthesis.getVoices=()=>{throw Error('voice failure');};
 if(kind==='speak-throw')h.ctx.window.speechSynthesis.speak=()=>{throw Error('speak failure');};
 assert.doesNotThrow(()=>{h.start();h.els.get('ainput').value='wrong';h.ctx.submit();});
 assert(h.state.session.copyMode);assert(h.els.get('reveal').innerHTML.includes('ov-ipa'));
 if(kind==='missing')assert(!h.els.get('reveal').innerHTML.includes('role="button"'));
 assert.doesNotThrow(()=>h.fire('exitBtn','click'));
}
console.log('PASS pronunciation UI: Fable IPA formatting, no separate replay button, reveal-only automatic TTS, word tap/keyboard replay, meaning-aware audio, mute/exit/lazy/unsupported safety.');
