const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(path.resolve(__dirname,'../../vocagoyangfable.html'),'utf8');
const between=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i+a.length);assert(i>=0&&j>i);return html.slice(i,j);};
let submitted=0,copied=0;const wrap={innerHTML:''},input={value:''};
const state={composing:false,session:{currentId:0,answered:false,copyMode:false,words:[{term:'take advantage of'}]}};
const ctx=vm.createContext({state,$:s=>s==='#ainput'?input:wrap,esc:s=>s,submit:()=>submitted++,submitCopy:()=>copied++});
vm.runInContext([
 between('function normalize(','function shuffle('),
 between('function hasHangul(','function composingKey('),
 between('function handleCopyInput()','function answerInSentence('),
 between('function renderCopyBlank(','function startCopy('),
].join('\n'),ctx);
const groups=h=>[...h.matchAll(/<span class="slot-word">((?:<span class="slot[^\"]*">[^<]*<\/span>)+)<\/span>/g)].map(m=>[...m[1].matchAll(/<span class="slot[^\"]*">([^<]*)<\/span>/g)].map(x=>x[1]));
const sizes=h=>groups(h).map(g=>g.length);
const text=h=>groups(h).map(g=>g.join('')).join(' ');
assert.deepEqual(sizes(ctx.maskBlank('Please {{BLANK}} this chance.','take advantage of')),[4,9,2]);
assert.deepEqual(sizes(ctx.maskBlank('{{BLANK}}','in accordance with')),[2,10,4]);
assert.deepEqual(sizes(ctx.maskBlank('{{BLANK}}','word')),[4]);
for(const value of ['take ','take a','takea']){
  input.value=value;ctx.mirrorTyped();assert.equal(submitted,0);assert.deepEqual(sizes(wrap.innerHTML),[4,9,2]);
}
for(const value of ['take advantage of','takeadvantageof',' take   advantage  of ']){
  input.value=value;const before=submitted;ctx.mirrorTyped();assert.equal(submitted,before+1);
  assert.equal(text(wrap.innerHTML),'take advantage of');assert(ctx.isCorrect(value,'take advantage of'));
}
// Explicit spaces remain visible, including alternative answers with different word lengths.
assert(text(ctx.blankSlots('take advantage of','ta ke a')).startsWith('ta ke a'));
assert(text(ctx.blankSlots('in size','in terms of')).startsWith('in terms of'));
assert.deepEqual(sizes(ctx.blankSlots('in size','in ')),[2,4]);
assert.deepEqual(sizes(ctx.blankSlots('in size','i')),[2,4]);
state.session.words=[{term:'by',constructionId:'test',acceptedAnswers:['via']}];
input.value='vi';let before=submitted;ctx.mirrorTyped();assert.equal(submitted,before);
input.value='via';ctx.mirrorTyped();assert.equal(submitted,before+1);
// Spaced Korean input remains visible, and IME input cannot auto-submit.
state.session.words=[{term:'case'}];state.composing=true;input.value='한 글 입 력';before=submitted;ctx.mirrorTyped();
assert.equal(text(wrap.innerHTML),'한 글 입 력');assert.equal(submitted,before);
state.composing=false;ctx.mirrorTyped();assert.equal(submitted,before);
// Copy feedback aligns letters regardless of spaces, apostrophes or hyphens.
state.session.copyMode=true;state.session.answered=true;
for(const [answer,values] of [
 ['take advantage of',['take advantage of','takeadvantageof']],
 ["o'clock",["o'clock",'oclock']],['e-mail',['e-mail','email']],
 ['self-confidence',['self-confidence','selfconfidence']],
]){
 state.session.copyAns=answer;
 for(const value of values){
   ctx.renderCopyBlank(value);assert(!wrap.innerHTML.includes('slot x'),answer+' '+value);
   input.value=value;const n=copied;ctx.handleCopyInput();assert.equal(copied,n+1);
 }
}
state.session.copyAns='take advantage of';ctx.renderCopyBlank('take advx');
assert.deepEqual(sizes(wrap.innerHTML),[4,9,2]);assert.equal((wrap.innerHTML.match(/slot x/g)||[]).length,1);
ctx.renderCopyBlank('take ad');assert(!wrap.innerHTML.includes('slot x'));
state.composing=true;input.value='take advantage of';const n=copied;ctx.handleCopyInput();assert.equal(copied,n);
assert(/\.hoectx \.blanks\{[^}]*max-width:calc\(100% - 8px\)[^}]*flex-wrap:wrap/.test(html));
assert(/\.hoectx \.slot-word\{[^}]*max-width:100%[^}]*flex-wrap:wrap/.test(html));
console.log(JSON.stringify({wordBoundaries:'prompt, typing and copy mode',explicitSpaces:'preserved without consuming slots',spacelessAnswers:'accepted',copyFeedback:'spaces and punctuation do not shift letters',longAliases:'preserved',IME:'protected',responsiveRules:'word wrapping enabled'}));
