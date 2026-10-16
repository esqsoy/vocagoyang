'use strict';
// Execute the actual old/new select helper in the existing state harness; no browser/audio claim.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..');
const {harness}=require(path.join(root,'pipeline/tests/helpers/mother-tongue-harness.cjs'));
const FILE='vocagoyangfable.html',SOURCE='pipeline/pronunciation-audio/browser.test.cjs';
function load(source){const a=source.indexOf('async function select('),b=source.indexOf('\n(async()=>',a);assert(a>=0&&b>a);return vm.runInNewContext(source.slice(a,b)+'\nselect;');}
const old=load(cp.execFileSync('git',['show','5b4ffee:'+SOURCE],{cwd:root,encoding:'utf8'})),current=load(fs.readFileSync(path.join(root,SOURCE),'utf8'));
async function scenario(select,targetFirst){
 const h=harness(path.join(root,FILE));
 h.ctx.shuffle=a=>{const s=h.state.session,target=s.words.find(w=>w.term==='contract'&&h.ctx.exceptionAudioEntry({term:w.term,ipa:w.ipa}));assert(target);
   const first=targetFirst?target.id:s.words.find(w=>w.term!=='contract').id;
   return [first,...a.filter(id=>id!==first)];};
 const page={evaluate:(fn,arg)=>h.run('('+fn.toString()+')('+JSON.stringify(arg)+')')};
 const selected=await select(page,FILE,'contract');
 const s=h.state.session,w=s.words[s.currentId];
 return {targetFirst,selected: selected.term,current: w.term,ipa:w.ipa,queueLength:s.queue.length,answered:s.answered,copyMode:s.copyMode,score:s.attempts};
}
(async()=>{
 const oldFirst=await scenario(old,true),newFirst=await scenario(current,true),newOther=await scenario(current,false);
 assert.notEqual(oldFirst.current,'contract','Old helper must reproduce its reported selection bug');
 for(const r of [newFirst,newOther]){assert.equal(r.current,'contract');assert.equal(r.score,0);assert.equal(r.answered,false);assert.equal(r.copyMode,false);}
 const result={oldFirst,newFirst,newOther,pass:true,scope:'Actual select() code executed with the existing VM state harness and forced first-card choices. Does not test actual browser gestures or playback.'};
 fs.writeFileSync(path.join(__dirname,'browser-selection-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1;});
