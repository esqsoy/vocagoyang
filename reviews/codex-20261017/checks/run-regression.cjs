'use strict';
// Review-only copy of work/pronunciation-sample-20261015/verify-integrated.cjs.
// Original app and test files are never modified. Each run records full controlled logs.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../../..');
const python='C:/Users/Young/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const tests=[];
for(const dir of ['pipeline/tests','pipeline/ipa-effects/tests'])for(const file of fs.readdirSync(path.join(root,dir)).filter(f=>f.endsWith('.test.cjs')).sort())tests.push([dir+'/'+file]);
tests.push(...[
 ['pipeline/test-answer-replay.cjs'],['pipeline/test-textbook-ui.cjs'],['pipeline/test-mother-tongue-excerpts.cjs'],['pipeline/test-mother-tongue-layout.cjs'],
 ['pipeline/test-mother-tongue-pronunciation.cjs'],['pipeline/test-mother-tongue-pronunciation-data.cjs'],['pipeline/test-ebs-pronunciation-data.cjs'],
 ['pipeline/ipa-effects/build-check.cjs'],['pipeline/ipa-effects/alignment-check.cjs'],
 ['pipeline/pronunciation-audio/runtime.test.cjs'],['pipeline/pronunciation-audio/host.test.cjs'],['pipeline/pronunciation-audio/build.test.cjs'],['pipeline/pronunciation-audio/stamp.test.cjs'],
 ['pipeline/ipa-effects/build.cjs','--check'],['pipeline/milestones/build.cjs','--check'],['pipeline/pace/build.cjs','--check'],['pipeline/mother-tongue-excerpts/build.cjs','--check'],['pipeline/saved-cards/build.cjs','--check'],['pipeline/index-stats.cjs','--check'],['pipeline/set-stamp/build.cjs','--check']
]);
const results=[];
function run(executable,args,normalization=false){
 const env={...process.env};delete env.NODE_OPTIONS;
 if(normalization)env.NODE_OPTIONS='--require '+JSON.stringify(path.join(__dirname,'normalize-lfs.cjs'));
 const started=Date.now(),r=cp.spawnSync(executable,args,{cwd:root,env,encoding:'utf8',timeout:180000,maxBuffer:4e6});
 const result={executable,args,normalization,status:r.status,ms:Date.now()-started,stdout:r.stdout,stderr:r.stderr,error:r.error?.message};
 results.push(result);
 fs.writeFileSync(path.join(__dirname,'regression-results.json'),JSON.stringify({root,head:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),results},null,2)+'\n');
 console.log(args.join(' ')+' '+r.status+(normalization?' [CRLF read normalization]':''));
 if(r.status!==0)console.log((r.stderr||r.stdout||'').slice(0,1800));
 return result;
}
for(const args of tests)run(process.execPath,args);
for(const file of ['pipeline/assemble-mother-tongue-pronunciations.py','pipeline/assemble-ebs-pronunciations.py'])run(python,['-X','utf8',file,'--check']);
const rawMilestones=results.find(r=>r.args[0]==='pipeline/tests/milestones.test.cjs');
if(rawMilestones.status!==0)run(process.execPath,rawMilestones.args,true);
const summary={nodeTests:tests.length,rawPass:results.slice(0,tests.length).filter(r=>r.status===0).length,pythonChecks:2,pythonPass:results.filter(r=>r.executable===python&&r.status===0).length,normalizedMilestones:results.find(r=>r.normalization)?.status};
fs.writeFileSync(path.join(__dirname,'regression-summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary));
process.exitCode=results.some(r=>r.status!==0&&r!==rawMilestones)||rawMilestones.status!==0&&!results.some(r=>r.normalization&&r.status===0)?1:0;
