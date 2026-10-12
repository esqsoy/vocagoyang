const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const out=process.env.REVIEW_OUT||path.join(require('os').tmpdir(),'vocagoyang-review-20261013');fs.mkdirSync(out,{recursive:true});
const repo=path.resolve(__dirname,'../../..'),git=process.env.GIT_EXE||'git';
const show=(rev,file)=>cp.execFileSync(git,['-c','safe.directory='+repo,'show',rev+':'+file],{cwd:repo,encoding:'utf8',maxBuffer:40000000});
const {runtime}=require(path.join(repo,'pipeline/set0-20261010/carry.cjs'));
const data=h=>JSON.parse(h.match(/^const DATA = (\[.*\]);\s*$/m)[1]);
const currentHtml=show('921e8ff','vocagoyangfable.html'),saved=show('921e8ff','pipeline/saved-cards/runtime.js');
const cur=runtime(currentHtml,saved,data(currentHtml));
const title=x=>x&&x.L.id+'|'+x.e.title;
const report={head:'921e8ff',versions:[]};
for(const rev of ['e9c178d','acfe20e','5fdf148']){
 const html=show(rev,'vocagoyangfable.html'),old=runtime(html,show(rev,'pipeline/saved-cards/runtime.js'),data(html));
 const result={rev,cards:old.cards.size,exercises:old.flat.length,savedIdsLost:[],moved:[],resumesChecked:0,resumeFailures:[],completionCases:0,completionFailures:[]};
 for(const [id,p] of old.cards){const x=cur.cards.get(id);if(!x)result.savedIdsLost.push(id);else if(x.L.lesson!==p.L.lesson)result.moved.push({id,word:p.w.word,si:p.w.si,from:p.L.lesson,to:x.L.lesson});}
 for(let i=0;i<old.flat.length;i++){
  const p=old.flat[i];old.ctx.saveLast(p.L.id,p.e.title);const last=JSON.parse(old.storage.get('test-last'));
  const a=cur.pick(last);let expected;
  if(p.L.lesson===5&&rev!=='5fdf148'){
   const rest=old.flat.slice(i).filter(x=>x.L.lesson===5).flatMap(x=>x.e.words);
   expected=rest.map(w=>cur.cards.get(w.savedCardId)).find(x=>x?.L.lesson===5);
  }else expected=cur.flat.find(x=>title(x)===title(p));
  result.resumesChecked++;
  if(title(a)!==title(expected))result.resumeFailures.push({last,actual:title(a),expected:title(expected)});
 }
 const oldkeys=[...new Set(old.flat.filter(x=>[5,14,17,21,25].includes(x.L.lesson)).map(x=>JSON.stringify(old.key(x))))];
 for(const one of oldkeys){
  const [id,t]=JSON.parse(one);old.state.progress={[id]:{[t]:{completed:true,timeMs:12345}}};cur.state.progress=JSON.parse(JSON.stringify(old.state.progress));
  const done=new Set(old.flat.filter(x=>old.ctx.getRec(x.L.id,x.e.title)?.completed).flatMap(x=>x.e.words.map(w=>w.savedCardId)));
  for(const x of cur.flat.filter(x=>[5,14,17,21,25].includes(x.L.lesson))){
   const expected=x.e.words.every(w=>done.has(w.savedCardId));const actual=!!cur.ctx.getRec(x.L.id,x.e.title)?.completed;result.completionCases++;
   if(actual!==expected)result.completionFailures.push({seed:[id,t],exercise:title(x),actual,expected,uncovered:x.e.words.filter(w=>!done.has(w.savedCardId)).map(w=>w.word+'|'+w.si)});
  }
 }
 report.versions.push(result);
 console.log(JSON.stringify({...result,savedIdsLost:result.savedIdsLost.length,moved:result.moved.length,resumeFailures:result.resumeFailures.length,completionFailures:result.completionFailures.length}));
}
fs.writeFileSync(path.join(out,'migration-audit.json'),JSON.stringify(report,null,2)+'\n');
