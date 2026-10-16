'use strict';
// Read-only reconstruction of renderer schedule using the shipped FABLE data.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..');
const {harness}=require(path.join(root,'pipeline/tests/helpers/mother-tongue-harness.cjs'));
const h=harness(path.join(root,'vocagoyangfable.html'));
const result={};
for(const mode of ['full','b1']){
 const seq=[];
 for(const L of h.state.lessons){if(L.kind==='saved'||mode==='b1'&&L.lesson>25)continue;const seen=new Set();for(const e of h.ctx.visEx(L))for(const w of e.words){const k=h.ctx.msHead(w);if(!k||seen.has(k))continue;seen.add(k);seq.push({term:String(w.term??w.word??w.en),set:L.lesson});}}
 const N=seq.length,T=mode==='b1'?30000:60000,rEnd=.008;let lo=300,hi=1e7;
 for(let i=0;i<80;i++){const m=(lo+hi)/2;if(rEnd*m*Math.expm1(T/m)>N)lo=m;else hi=m;}
 const tau=(lo+hi)/2,r0=rEnd*Math.exp(T/tau);
 seq.forEach((q,k)=>q.t=Math.min(T,-tau*Math.log(Math.max(1e-9,1-k/(r0*tau)))));
 const want=new Set(h.run('FE_MSG').map(t=>t.toLowerCase())),hits=[];
 seq.forEach((q,k)=>{if(want.has(q.term.toLowerCase())){want.delete(q.term.toLowerCase());hits.push(k);}});
 const M=hits.length,a0=Math.max(seq[hits[0]]?.t||0,1000),a1=Math.max(seq[hits[M-1]]?.t||0,T-1000),span=Math.max(0,a1-a0),DL=1200;
 const dOf=R=>Math.abs(1-R)<1e-6?span/Math.max(1,M-1):span*(1-R)/(1-Math.pow(R,M-1));let R=1;
 if(M>2&&span/(M-1)>DL){lo=.3;hi=.999999;for(let k=0;k<60;k++){const m=(lo+hi)/2;if(dOf(m)*Math.pow(m,M-2)>DL)hi=m;else lo=m;}R=(lo+hi)/2;}
 const d0=M>1?dOf(R):0;let tt=a0,prev=-1e9;
 const messages=hits.map((k,i)=>{if(i)tt+=d0*Math.pow(R,i-1);const t=Math.max(tt,seq[k].t,prev+1200),gap=i?t-prev:null;prev=t;return {term:seq[k].term,set:seq[k].set,seqIndex:k,naturalMs:Math.round(seq[k].t),messageMs:Math.round(t),gapMs:gap===null?null:Math.round(gap)};});
 result[mode]={N,T,tau,r0:r0*1000,R,missing:[...want],messages};
}
fs.writeFileSync(path.join(__dirname,'schedule-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
