'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../..'),sha=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n')).digest('hex');
(async()=>{
  const result=[];
  for(const file of ['index.html','vocagoyangfable.html','vocagoyangksat2027.html','vocagoyangebs2027.html']){
    const url='https://esqsoy.github.io/vocagoyang/'+file+'?review=20261017-'+Date.now(),r=await fetch(url);
    if(!r.ok)throw new Error(file+' '+r.status);
    const remote=sha(await r.text()),local=sha(fs.readFileSync(path.join(root,file),'utf8'));
    result.push({file,status:r.status,local,remote,equal:local===remote});
  }
  fs.writeFileSync(path.resolve(__dirname,'../evidence/public-source.json'),JSON.stringify({checkedAt:new Date().toISOString(),normalization:'CRLF to LF only',result},null,2)+'\n');
  console.log(JSON.stringify(result));
  if(result.some(r=>!r.equal))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
