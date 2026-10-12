const fs=require('fs'),path=require('path'),http=require('http');
const out=process.env.REVIEW_OUT||path.join(require('os').tmpdir(),'vocagoyang-review-20261013');fs.mkdirSync(out,{recursive:true});
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..');
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end();}res.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream');fs.createReadStream(f).pipe(res);});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{channel:'chrome'}),headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}/vocagoyangfable.html`);await p.waitForSelector('.lessonbtn');
 const words=['life','latin','muslim','irish','protestant','olympics','christian','african','english','buddhism','christianity'];
 const capitalization=await p.evaluate(words=>{
  const results=[];state.muted=true;
  for(const L of state.lessons)for(const e of L.exercises)for(const w of e.words)if(words.includes(w.word?.toLowerCase())&&w.ex){results.push({set:L.lesson,title:e.title,word:w.word,si:w.si,term:w.term,ex:w.ex,answer:answerInSentence(w.ex,w.term),filled:fillBlank(w.ex,w.term).replace(/<[^>]+>/g,'')});}
  return results;
 },words);
 const life=await p.evaluate(()=>{
  const li=state.lessons.findIndex(L=>L.lesson===1),ei=state.lessons[li].exercises.findIndex(e=>e.words.some(w=>w.word==='life'&&w.si===2));
  openLesson(li);openExercise(ei);const s=state.session,wi=s.words.findIndex(w=>w.word==='life'&&w.si===2);s.queue=[wi];nextCard();const w=s.words[wi];
  document.querySelector('#ainput').value='life';mirrorTyped();clearInterval(state.ticker);return {word:w.word,si:w.si,meaning:w.meaning,term:w.term,fill:fillBlank(w.ex,w.term),visible:document.querySelector('#hoeCtx').innerText};
 });
 await p.waitForTimeout(1500);await p.screenshot({path:path.join(out,'life-reveal.png')});
 await p.reload();await p.waitForSelector('.lessonbtn');
 const prepared=await p.evaluate(()=>{state.muted=true;const heads=new Set();for(const L of state.lessons)for(const e of L.exercises)if(heads.size<1100){setRec(L.id,e.title,{timeMs:1});e.words.forEach(w=>heads.add(msHead(w)));}msSync();localStorage.removeItem(msSeenKey);openLesson(10);openExercise(0);state.session.errors=1;state.session.firstSeen=1;state.session.firstCorrect=0;finishExercise();const info={heads:msUnion(msRead()).size,busy:msBusy};document.getElementById('nextEx').click();return info;});
 await p.waitForTimeout(900);
 const race1=await p.evaluate(()=>({activeScreen:document.querySelector('.screen.active')?.id,overlay:!!document.getElementById('msFx'),timerRunning:!!state.ticker,remaining:remain(),busy:msBusy}));
 await p.waitForTimeout(900);
 const race2=await p.evaluate(()=>({activeScreen:document.querySelector('.screen.active')?.id,overlay:!!document.getElementById('msFx'),timerRunning:!!state.ticker,remaining:remain(),busy:msBusy}));
 const savedVersions=[];
 for(const f of JSON.parse(fs.readFileSync(path.join(__dirname,'../evidence/browser-seeds.json')))){
  const c=await browser.newContext({viewport:{width:390,height:844}});await c.addInitScript(seed=>{for(const [k,v] of Object.entries(seed))localStorage.setItem(k,v);},f.storage);const q=await c.newPage();
  await q.goto(`http://127.0.0.1:${server.address().port}/vocagoyangfable.html`);await q.waitForSelector('.lessonbtn');
  const actual=await q.evaluate(()=>{const r=resumeTarget();return {resume:{li:r.li,ei:r.ei},savedCards:savedItems().length,seen:msSeen(),learned:msUnion(msRead()).size,cleared:clearedExercises(),autoCelebration:!!document.getElementById('msFx'),movedFavorites:savedItems().filter(x=>/^(14|17|21|25)세트/.test(x.source)).length};});
  savedVersions.push({rev:f.rev,expected:f.expected,actual,pass:Object.entries(f.expected).every(([k,v])=>JSON.stringify(actual[k])===JSON.stringify(v))});await c.close();
 }
 const result={head:'921e8ff',browser:'Chrome headless',viewport:390,capitalization,life,milestoneRace:{prepared,at900ms:race1,at1800ms:race2},savedVersions,errors};
 fs.writeFileSync(path.join(out,'browser-audit.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exit(1)});
