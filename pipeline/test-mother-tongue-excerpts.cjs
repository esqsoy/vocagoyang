const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {harness,root}=require('./tests/helpers/mother-tongue-harness.cjs');
const file=process.argv[2]?path.resolve(process.argv[2]):path.join(root,'vocagoyangksat2027.html'),h=harness(file);
let cards=0,examples=0,copyCases=0;
h.state.prevOn=true;
for(let li=0;li<h.state.lessons.length;li++)for(let ei=0;ei<h.state.lessons[li].exercises.length;ei++){
 h.start(li,ei);
 for(let i=0;i<h.state.session.words.length;i++){
  h.run('state.session.queue=['+i+'];nextCard();');const w=h.state.session.words[i];cards++;
  if(!w.context){assert(!h.els.get('hoeCtx').innerHTML.includes('mt-gap'));continue;}
  examples++;const question=h.els.get('hoeCtx').innerHTML;
  assert(question.includes('class="ex mt-source"'));assert.equal((question.match(/class="blanks"/g)||[]).length,1,'One inline headword input');
  assert(!question.includes('</div><div class="ex">'),'No separate answer row');assert.equal(h.els.get('reveal').innerHTML,'');
  const readable=s=>s.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
  assert.equal(readable(h.ctx.mtInlineSource(w,'answer')),readable(h.ctx.esc(w.context.example)),'Inline reveal preserves original inflection and intervening words '+w.term);
  if(h.ctx.mtNeedsWholePronunciation(w))assert(h.ctx.pronunciationEffectInfo(w.term,w.meaning).forceWhole,'Do not map headword phonemes onto different source spelling '+w.term);
  for(const extra of w.context.maskSurfaces||[])assert(!h.ctx.mtSourceText(w,false).toLowerCase().includes(extra.toLowerCase()),'Another inflection must not leak the answer '+w.term);
  assert.equal(h.ctx.mtSourceText(w,true).replace(/<\/?strong[^>]*>/g,''),h.ctx.esc(w.context.example),'Exact source text survives reveal '+w.term);
  if(w.context.sourceKind==='choice')assert(h.els.get('hoeCtx').innerHTML.includes('선택지'));
  const current=h.ctx.pronunciationEntry(w.term,w.meaning),original=h.ctx.pronunciationEntry(w.term,w.originalMeaning);assert.equal(JSON.stringify(current),JSON.stringify(original),'Contextual meaning must not change homograph pronunciation '+w.term);
  h.type(w.term);if(!h.state.session.answered)h.ctx.submit();assert(!h.state.session.copyMode&&h.state.session.answered);
  assert(h.els.get('reveal').innerHTML.includes(h.ctx.esc(w.context.translation)));
  assert(!h.els.get('reveal').innerHTML.includes('ov-ipa'));
  if(w.context.note){assert.equal(h.els.get('catSpeech').textContent,w.context.note);assert.equal(h.els.get('catSpeechReserve').textContent,w.context.note);assert(!h.els.get('reveal').innerHTML.includes('rv-note'));}
  assert(h.ctx.mtRevealDelay(w)>=1200&&h.ctx.mtRevealDelay(w)<=6500);
 }
}
assert.equal(cards,6498);assert(examples>6300,'Unexpected excerpt loss');
for(const [li,ei,index] of [[0,0,0],[1,5,0],[10,19,5],[10,19,19]]){
 h.state.prevOn=false;h.start(li,ei);h.run('state.session.queue=['+index+'];nextCard();');const w=h.state.session.words[index];
 h.ctx.submit({forced:true});assert(h.state.session.copyMode);assert(h.els.get('hoeCtx').innerHTML.includes('class="ex mt-source"'));assert(h.blank.innerHTML.includes(' gh'),'Correction stays in the inline headword cells');assert(h.els.get('reveal').innerHTML.includes(h.ctx.esc(w.context.translation)));
 h.type(w.term);assert(!h.state.session.copyMode);assert.equal(h.spoken.at(-1).text,h.ctx.pronunciationEntry(w.term,w.meaning).speech||w.term);copyCases++;
}
console.log(`PASS Mother Tongue excerpts: ${cards} cards, ${examples} original excerpts, ${copyCases} copy/speech paths, source wording and pronunciation preserved.`);
