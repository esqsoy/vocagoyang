// Baseline: 74a6ddc. Diagnostic reproduction; does not edit app files.
const fs=require('fs'),vm=require('vm'),path=require('path');
const resultDir=process.env.REVIEW_OUT || fs.mkdtempSync(path.join(require('os').tmpdir(),'fable-review-'));
const root=path.resolve(__dirname,'../../..'),src=fs.readFileSync(path.join(root,'pipeline/pace/runtime.js'),'utf8');
let now=new Date('2026-10-15T12:00:00Z').getTime();const store=new Map(),els={};
const el=q=>els[q]??={textContent:q==='#sumTitle'?'연습 클리어 ✦':'',innerHTML:'',hidden:false};
const ctx={PACE_COURSE:'fable',Date:class extends Date {constructor(...a){super(...(a.length?a:[now]));}static now(){return now;}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},state:{session:null},startExercise(){},finishExercise(){},$:el,esc:x=>x,document:{addEventListener(){}}};vm.createContext(ctx);vm.runInContext(src,ctx);
ctx.paceTargets=()=>({u:10000,ex:100,label:'5,929단어',next:'FABLE 완주'});
ctx.paceNoteEl=()=>el('#paceNote');
const recs=Array.from({length:600},(_,i)=>({at:now-(600-i)*120000,ms:18000,u:5.2,k:'n'}));
store.set(ctx.paceKey,JSON.stringify(recs));store.set(ctx.paceMetaKey,JSON.stringify({intro:true,n:600,target:'5,929단어',later:true}));
const rows=[];for(let i=0;i<12;i++){now+=120000;el('#sumBubble').innerHTML='original';ctx.paceShow({e:{words:[{word:'cat',ex:'A {{BLANK}} sleeps.'}]},partial:false,was:false},18000);rows.push({actualPlay:601+i,stored:ctx.paceRead().length,meta:ctx.paceMeta().n,bubble:el('#sumBubble').innerHTML});}
fs.writeFileSync(path.join(resultDir,'pace-rollover.json'),JSON.stringify(rows,null,2));console.log(JSON.stringify(rows));
