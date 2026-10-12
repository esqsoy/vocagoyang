const fs=require('fs'),path=require('path'),cp=require('child_process');
const out=process.env.REVIEW_OUT||path.join(require('os').tmpdir(),'vocagoyang-review-20261013');fs.mkdirSync(out,{recursive:true});
const repo=path.resolve(__dirname,'../../..'),git=process.env.GIT_EXE||'git';
const run=(...args)=>cp.execFileSync(git,['-c','safe.directory='+repo,...args],{cwd:repo,maxBuffer:40000000,encoding:'utf8'});
const data=s=>JSON.parse(s.match(/^const DATA = (\[.*\]);\s*$/m)[1]);
const {LAYERS}=require(path.join(repo,'pipeline/claude-review-20261008/restore.cjs')),{hash,reverse}=require(path.join(repo,'pipeline/claude-review-20261008/ledger-lib.cjs'));
let v=data(run('show','921e8ff:vocagoyangfable.html')),log=[];
for(const L of LAYERS){if(L.name==='codex-review-20261011')break;const s=L.snapshots.DATA,matches=hash(v)===s.afterHash;log.push({layer:L.name,matches});if(matches)v=reverse(v,s.changes,s.keyOrders);}
const dataMatch=hash(v)===hash(data(run('show','acfe20e:vocagoyangfable.html'))),sources=[];
for(const f of run('diff','--name-only','-z','acfe20e..921e8ff','--','pipeline/out').split('\0').filter(Boolean)){
 let val=JSON.parse(fs.readFileSync(path.join(repo,f))),applied=[];
 for(const L of LAYERS){if(L.name==='codex-review-20261011')break;const s=L.sourceSnapshots[f];if(s&&hash(val)===s.afterHash){val=reverse(val,L.sourceChanges[f],L.sourceKeyOrders[f]);applied.push(L.name);}}
 sources.push({file:f,layers:applied.length,match:hash(val)===hash(JSON.parse(run('show','acfe20e:'+f)))});
}
fs.writeFileSync(path.join(out,'restoration-audit.json'),JSON.stringify({base:'acfe20e',head:'921e8ff',dataMatch,layers:log,sources},null,2));
console.log(JSON.stringify({dataMatch,layers:log.length,skipped:log.filter(l=>!l.matches),sources:sources.length,mismatched:sources.filter(s=>!s.match)}));
