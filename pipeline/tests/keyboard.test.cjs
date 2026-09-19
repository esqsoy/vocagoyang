const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const html=fs.readFileSync(path.resolve(__dirname,'../../vocagoyangfable.html'),'utf8');
const between=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i+a.length);assert(i>=0&&j>i,a);return html.slice(i,j);};
const els=new Map(),windowEvents={};let focusedPage=true,activeGame=true,submitted=0,copied=0,advanced=0;
const document={activeElement:null,hasFocus:()=>focusedPage};
function $(id){if(!els.has(id))els.set(id,{value:'',innerHTML:'',textContent:'',hidden:true,disabled:false,events:{},classList:{contains:()=>activeGame},addEventListener(n,f){(this.events[n]??=[]).push(f)},focus(){document.activeElement=this;this.events.focus?.forEach(f=>f())}});return els.get(id);}
const state={composing:false,session:{currentId:0,answered:false,copyMode:false,words:[{term:'case'}]}};
const ctx=vm.createContext({state,$,document,window:{addEventListener:(n,f)=>windowEvents[n]=f},requestAnimationFrame:f=>f(),Date,
 esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;'),
 submit:()=>submitted++,submitCopy:()=>copied++,doNext:()=>advanced++});
vm.runInContext([
 between('function normalize(','function shuffle('),
 between('function answerInputActive()','function slots('),
 between('function renderCopyBlank(','function startCopy('),
 between('function onRevealKey(','function onRevealTap('),
 between('$("#ainput").addEventListener("keydown"','$("#catSubmit").addEventListener')
].join('\n'),ctx);
const a=$('#ainput'),fire=(name,e={})=>a.events[name]?.forEach(f=>f(e));
document.activeElement=a;
// Korean input must be visible; composing or committed Korean cannot auto-submit.
fire('compositionstart');a.value='ㅊ';fire('input');assert($('#hoeCtx .blanks').innerHTML.includes('ㅊ'));assert.equal(submitted,0);assert.equal($('#inputHelp').hidden,false);
a.value='한글입력';fire('input');assert($('#hoeCtx .blanks').innerHTML.includes('한'));assert.equal(submitted,0);
fire('compositionend');assert.equal(state.composing,false);assert.equal(submitted,0);
// English input still auto-submits at the original alphabet count.
a.value='ca';fire('input');assert.equal($('#inputHelp').hidden,true);assert.equal(submitted,0);
a.value='case';fire('input');assert.equal(submitted,1);
// Enter used to commit IME text must neither grade nor advance a card.
for(const flags of [{isComposing:true},{keyCode:229}]){const e={key:'Enter',preventDefault(){throw Error('IME Enter intercepted')},stopPropagation(){throw Error('IME Enter intercepted')},...flags};fire('keydown',e);ctx.onRevealKey(e);}
state.composing=true;fire('keydown',{key:'Enter'});state.composing=false;assert.equal(submitted,1);assert.equal(advanced,0);
// Copy mode follows the same composition rule, then accepts a committed exact answer.
state.session.answered=true;state.session.copyMode=true;state.session.copyAns='practice';a.value='practice';state.composing=true;ctx.handleCopyInput();assert.equal(copied,0);
state.composing=false;ctx.handleCopyInput();assert.equal(copied,1);
// When focus leaves the page, reveal a direct keyboard-entry action and restore it on return.
document.activeElement=null;focusedPage=false;windowEvents.blur();assert.equal($('#focusInputBtn').hidden,false);
focusedPage=true;windowEvents.focus();assert.equal(document.activeElement,a);assert.equal($('#focusInputBtn').hidden,true);
document.activeElement=null;$('#focusInputBtn').events.click[0]();assert.equal(document.activeElement,a);
// An initial focus attempt can be refused by a browser; keep the recovery button available.
const normalFocus=a.focus;document.activeElement=null;a.focus=()=>{};ctx.focusAnswerInput();assert.equal($('#focusInputBtn').hidden,false);a.focus=normalFocus;
// Do not steal focus from the result or a non-game screen.
state.session.copyMode=false;document.activeElement=null;windowEvents.focus();assert.equal(document.activeElement,null);
activeGame=false;state.session.answered=false;windowEvents.focus();assert.equal(document.activeElement,null);
// A new card's explicitly allowed longer answer must not be graded midway.
activeGame=true;state.session.answered=false;state.session.copyMode=false;
state.session.words=[{term:'by',constructionId:'connection-test',acceptedAnswers:['via']}];
const beforeAliases=submitted;
a.value='vi';fire('input');assert.equal(submitted,beforeAliases);
a.value='via';fire('input');assert.equal(submitted,beforeAliases+1);
a.value='zz';fire('input');assert.equal(submitted,beforeAliases+2,'An invalid answer must still submit at the normal length');
a.value='by';fire('input');assert.equal(submitted,beforeAliases+3,'Canonical answer must retain immediate submission');
// Former courses retain their original automatic submission threshold.
state.session.words=[{term:'by'}];a.value='vi';fire('input');assert.equal(submitted,beforeAliases+4);
ctx.ALT={'by/1':['from']};
vm.runInContext(between('function isAliasHit(','const SYNLINES='),ctx);
assert(ctx.isAliasHit('via',{term:'by',constructionId:'connection-test',acceptedAnswers:['via']}));
assert(!ctx.isAliasHit('from',{term:'by',constructionId:'connection-test',acceptedAnswers:['via']}),'Legacy aliases leaked into a different new meaning');
assert(ctx.isAliasHit('from',{term:'by'}),'Legacy alias handling changed');
console.log(JSON.stringify({hangulVisible:true,imeEnterProtected:true,compositionDoesNotAutoSubmit:true,englishAndCopyInput:true,focusRecovery:true,nonGameFocusPreserved:true,newCardLongerAcceptedAnswer:true,legacyInputThresholdUnchanged:true,aliasesScopedToCard:true}));
