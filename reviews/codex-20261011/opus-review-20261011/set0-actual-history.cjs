'use strict';
const fs=require('fs'),cp=require('child_process');
const root='C:/Users/Young/Documents/Codex/2026-09-18/new-chat/work/opus-review-20261011/repo';
const gitRoot='C:/Users/Young/Documents/Codex/2026-09-18/new-chat/work/release-20260919/repo';
const git=(rev,f)=>cp.execFileSync('git',['-c','safe.directory='+gitRoot,'show',rev+':'+f],{cwd:gitRoot,encoding:'utf8',maxBuffer:1<<28});
const {runtime,candidates}=require(root+'/pipeline/set0-20261010/carry.cjs');
const html=fs.readFileSync(root+'/vocagoyangfable.html','utf8'),saved=fs.readFileSync(root+'/pipeline/saved-cards/runtime.js','utf8');
const data=h=>JSON.parse(h.match(/^const DATA = (\[.*\]);\s*$/m)[1]);
const cur=runtime(html,saved,data(html));
const manifest=JSON.parse(fs.readFileSync(root+'/pipeline/prune-20261010.json','utf8'));
const out={};
for(const rev of ['59aaf81','56005cc','df95ea4']) {
 const oh=git(rev,'vocagoyangfable.html'),old=runtime(oh,git(rev,'pipeline/saved-cards/runtime.js'),data(oh));
 const report=out[rev]={oldCards:old.cards.size,oldExercises:old.flat.length,missing:[],resumeMismatch:[],completionMismatch:[]};
 for(const [id,x] of old.cards) if(!cur.cards.has(id)&&!manifest.words.includes(x.w.word.toLowerCase()))report.missing.push([id,x.w.word]);
 let checked=0;for(const x of old.flat){
  const c={lid:x.L.id,title:x.e.title,layout:'placement-v1'},a=cur.pick(c);
  const rest=old.flat.slice(old.flat.indexOf(x)).filter(z=>z.L===x.L).flatMap(z=>z.e.words);
  const anchor=rest.find(w=>cur.cards.get(w.savedCardId)?.L.lesson===x.L.lesson);
  const expected=anchor&&cur.cards.get(anchor.savedCardId);
  if(!expected||!a||a.li!==expected.li||a.ei!==expected.ei)report.resumeMismatch.push({c,first:x.e.words[0].word,actual:a&&[a.L.id,a.e.title],expected:expected&&[expected.L.id,expected.e.title]}); checked++;
 }
 report.resumes=checked;
 const oldKeys=new Map();for(const x of old.flat)x.e.words.forEach((w,i)=>{
  const keys=[old.key(x),...(x.e.priorCoverage?.[i]||[]).map(k=>[k.id,k.title]),...(x.e.parentRecord?[[x.e.parentRecord.id,x.e.parentRecord.title]]:[])];
  for(const k of keys){const s=JSON.stringify(k);if(!oldKeys.has(s))oldKeys.set(s,new Set());oldKeys.get(s).add(w.savedCardId);}
 });
 cur.state.progress={};for(const x of old.flat){const [id,t]=old.key(x);(cur.state.progress[id]||={})[t]={completed:true};}
 const unexpectedIncomplete=cur.flat.filter(x=>x.e.words.every(w=>old.cards.has(w.savedCardId))&&!cur.ctx.getRec(x.L.id,x.e.title)?.completed);
 report.unexpectedIncomplete=unexpectedIncomplete.map(x=>[x.L.id,x.e.title]);
 let records=0; for(const [serial,ids] of oldKeys){
  const [id,t]=JSON.parse(serial);cur.state.progress={[id]:{[t]:{completed:true}}};
  for(const x of cur.flat){
   const expected=x.e.words.every(w=>ids.has(w.savedCardId)),actual=!!cur.ctx.getRec(x.L.id,x.e.title)?.completed;
   if(actual!==expected)report.completionMismatch.push({key:[id,t],at:[x.L.id,x.e.title],expected,actual,notCovered:x.e.words.filter(w=>!ids.has(w.savedCardId)).map(w=>w.word)});
  } records++;
 }
 report.records=records;
 console.log(rev,JSON.stringify(report));
}
fs.writeFileSync('C:/Users/Young/Documents/Codex/2026-09-18/new-chat/work/opus-review-20261011/set0-actual-history.json',JSON.stringify(out,null,2));
