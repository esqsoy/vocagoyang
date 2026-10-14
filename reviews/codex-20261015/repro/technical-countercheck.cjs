const fs=require('fs'),path=require('path'),vm=require('vm');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'../../..'),out={};
const src=fs.readFileSync(path.join(root,'pipeline/pace/runtime.js'),'utf8');
let now=new Date('2026-10-15T00:00:00Z').getTime();const store=new Map(),els={};
const el=q=>els[q]??={textContent:q==='#sumTitle'?'연습 클리어 ✦':'',innerHTML:'',hidden:false};
const ctx={PACE_COURSE:'fable',Date:class extends Date{constructor(...a){super(...(a.length?a:[now]));}static now(){return now;}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},state:{session:null},startExercise(){},finishExercise(){},$:el,esc:x=>x,document:{addEventListener(){}}};
vm.createContext(ctx);vm.runInContext(src,ctx);ctx.paceTargets=()=>({u:10000,ex:100,label:'5,929단어',next:'FABLE 완주'});ctx.paceNoteEl=()=>el('#paceNote');
const rows=[];for(let i=1;i<=620;i++){now+=120000;el('#sumBubble').innerHTML='original';ctx.paceShow({e:{words:[{word:'cat',ex:'A {{BLANK}} sleeps.'}]},partial:false,was:false},18000);if(i>=585)rows.push({play:i,stored:ctx.paceRead().length,meta:ctx.paceMeta().n,talk:el('#sumBubble').innerHTML!=='original'});}
out.paceFromEmpty=rows;
(async()=>{
 const browser=await chromium.launch({...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{}),headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(require('url').pathToFileURL(path.join(root,'vocagoyangfable.html')).href);await page.waitForSelector('.lessonbtn');
 await page.evaluate(()=>{state.muted=true;state.progress={};state.li=0;msMarkSeen(10000);openExercise(0);const s=state.session;s.words.forEach(w=>w.passed=true);s.words[0].wrongEver=true;s.words[0].errors=1;s.firstSeen=s.words.length;s.firstCorrect=s.words.length-1;finishExercise();});
 await page.locator('#sumWrong .wrow').click();
 await page.waitForTimeout(80);
 await page.locator('#nextEx').click();
 out.realPointerRace={immediate:await page.evaluate(()=>({ei:state.ei,title:state.session.exercise.title}))};
 await page.waitForTimeout(850);
 out.realPointerRace.after=await page.evaluate(()=>({ei:state.ei,title:state.session.exercise.title,screen:document.querySelector('.screen.active').id}));
 await browser.close();
 fs.writeFileSync(path.join(process.env.REVIEW_OUT||fs.mkdtempSync(path.join(require('os').tmpdir(),'fable-counter-')),'technical-countercheck.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out));
})().catch(e=>{console.error(e);process.exitCode=1;});
