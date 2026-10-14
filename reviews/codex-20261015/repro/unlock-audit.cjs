// Baseline: 74a6ddc. Diagnostic reproduction; does not edit app files.
const fs=require('fs'),path=require('path'),cp=require('child_process');
const resultDir=process.env.REVIEW_OUT || fs.mkdtempSync(path.join(require('os').tmpdir(),'fable-review-'));
const root=path.resolve(__dirname,'../../..'),h=fs.readFileSync(path.join(root,'vocagoyangfable.html'),'utf8');
const {runtime}=require(path.join(root,'pipeline/set0-20261010/carry.cjs'));
const git=process.env.GIT || 'git';
const read=f=>fs.readFileSync(path.join(root,f),'utf8'),gitRead=(ref,f)=>cp.execFileSync(git,['show',`${ref}:${f}`],{cwd:root,encoding:'utf8',maxBuffer:32e6});
const data=html=>JSON.parse(html.match(/^const DATA = (\[.*\]);\s*$/m)[1]);
const cur=runtime(h,read('pipeline/saved-cards/runtime.js'),data(h));
const out=[];
for(const ref of ['e9c178d','acfe20e','921e8ff','5a66345']){
 const old=runtime(gitRead(ref,'vocagoyangfable.html'),gitRead(ref,'pipeline/saved-cards/runtime.js'),data(gitRead(ref,'vocagoyangfable.html'))),bad=[];
 for(const x of old.flat.filter(x=>x.L.lesson>0)){
  const [k,t]=old.key(x);cur.state.progress={[k]:{[t]:{completed:true}}};
  const L=cur.state.lessons.find(l=>l.lesson===x.L.lesson);
  const inherited=L.exercises.filter(e=>cur.ctx.getRec(L.id,e.title)?.completed);
  if(inherited.length&&!cur.ctx.openSets().has(L))bad.push({oldSet:x.L.lesson,oldExercise:x.e.title,key:[k,t],inherited:inherited.map(e=>e.title),exampleWords:x.e.words.slice(0,3).map(w=>w.term)});
 }
 out.push({ref,checked:old.flat.length,cases:bad});
}
fs.writeFileSync(path.join(resultDir,'unlock-audit.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out.map(x=>({ref:x.ref,checked:x.checked,cases:x.cases.length,examples:x.cases.slice(0,2)}))));
