'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),baseline='5b4ffee',target='0d0f516';
const git=(...args)=>cp.execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:32e6});
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const constant=(html,name)=>{const m=html.match(new RegExp('^(?:const|var) '+name+' = ([^\\r\\n]+);[ \\t]*\\r?$','m'));assert(m,name);return m[1];};
const {harness}=require(path.join(root,'pipeline/tests/helpers/mother-tongue-harness.cjs'));
const {collect}=require(path.join(root,'pipeline/ipa-effects/build.cjs'));
const {loadMedia}=require(path.join(root,'pipeline/pronunciation-audio/build.cjs'));
const media=loadMedia(),courses=[];
for(const file of ['vocagoyangfable.html','vocagoyangksat2027.html','vocagoyangebs2027.html']){
 const before=git('show',baseline+':'+file),after=git('show',target+':'+file),disk=fs.readFileSync(path.join(root,file),'utf8');
 assert.equal(disk.replace(/\r\n/g,'\n'),after.replace(/\r\n/g,'\n'),file+' disk matches pinned commit');
 const names=['DATA','IPA_EFFECT_MAPS','PRONUNCIATION_AUDIO_MAP',...(file.includes('fable')?['READING_CORE','MORPHOLOGY','CONNECTIONS']:['MT_PRONUNCIATIONS'])];
 const constants=names.map(name=>{const a=constant(before,name),b=constant(after,name);assert.equal(a,b,file+' '+name);return {name,unchanged:true,sha256:hash(b),entries:Array.isArray(JSON.parse(b))?JSON.parse(b).length:Object.keys(JSON.parse(b)).length};});
 const data=JSON.parse(constant(after,'DATA')),cards=data.flatMap(L=>L.exercises.flatMap(e=>e.words));
 const h=harness(path.join(root,file)),visible=h.state.lessons.filter(L=>L.kind!=='saved').map(L=>({lesson:L.lesson,id:L.id,exercises:[...h.ctx.visEx(L)].length,cards:[...h.ctx.visEx(L)].reduce((n,e)=>n+e.words.length,0)}));
 courses.push({file,constants,sets:data.length,sourceGroups:data.reduce((n,L)=>n+L.exercises.length,0),cards:cards.length,headwords:new Set(cards.map(w=>(w.word??w.en).normalize('NFC').trim().replace(/\s+/g,' ').toLowerCase())).size,playableExercises:visible.reduce((n,L)=>n+L.exercises,0),visibleSets:visible,audioStats:collect(after,media).stats});
}
const changed=git('diff','--name-only',baseline,target).trim().split(/\r?\n/).filter(Boolean);
const changedVocabularySources=changed.filter(p=>/^(?:pipeline\/(?:out\/|reading-core\.json|morphology\.json|connections\.json|exercise-topics\.json|.*pronunciations\.json|pronunciation-audio\/(?!browser\.test\.cjs)|ipa-effects\/(?!runtime\.js|styles\.css))|assets\/pronunciation\/)/.test(p));
assert.deepEqual(changedVocabularySources,[]);
const h=harness(path.join(root,'vocagoyangfable.html')),msg=[...h.run('FE_MSG')],ordered=[];
for(const L of h.state.lessons.filter(L=>L.kind!=='saved'))for(const e of h.ctx.visEx(L))for(const w of e.words){const term=h.ctx.msHead(w);if(msg.includes(term)&&!ordered.some(o=>o.term===term))ordered.push({term,set:L.lesson});}
assert.equal(new Set(msg).size,msg.length);assert.equal(ordered.length,msg.length);
const output={baseline:git('rev-parse',baseline).trim(),target:git('rev-parse',target).trim(),generatedAt:new Date().toISOString(),courses,changedFiles:changed,changedVocabularySources,messageWords:{requested:msg,inLearnedOrder:ordered,unique:true,allExist:true},limits:['Exact structural/data comparison, not a fresh semantic reread of every card.','Actual browser/audio validation is performed separately by the parent reviewer.']};
fs.writeFileSync(path.join(__dirname,'data-audit.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({courses:courses.map(c=>({file:c.file,cards:c.cards,headwords:c.headwords,playableExercises:c.playableExercises,allDataAndMapsUnchanged:true,audioStats:c.audioStats})),messageWords:msg.length,changedVocabularySources}));
