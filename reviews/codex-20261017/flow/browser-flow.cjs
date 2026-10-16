'use strict';
// Diagnostic review only; serves a fresh isolated browser profile and never edits app sources.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),outDir=__dirname;
const git=process.env.GIT_BIN||'C:/Users/Young/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/mingw64/bin/git.exe';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/Young/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const baseline=cp.execFileSync(git,['show','5b4ffee:vocagoyangfable.html'],{cwd:root,maxBuffer:20*1024*1024});
const current=fs.readFileSync(path.join(root,'vocagoyangfable.html'));
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(req.url.startsWith('/baseline')?baseline:current);});
const result={errors:[]};
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,executablePath:process.env.PW_CHROMIUM||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 async function fresh(version='current',reduce=true){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:reduce?'reduce':'no-preference'});
  await context.route('**/*',route=>route.request().url().startsWith(base)?route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:version==='baseline'?baseline:current}):route.abort());
  const page=await context.newPage();page.on('pageerror',e=>result.errors.push({version,message:e.message}));
  await page.goto(base+'/'+version);await page.waitForSelector('.lessonbtn');await page.evaluate(()=>{state.muted=true;});return {context,page};
 }
 async function gameSnapshot(page){return page.evaluate(()=>({screen:document.querySelector('.screen.active')?.id,errors:state.session.errors,answered:state.session.answered,remaining:remain(),time:Date.now()-state.session.totalStart,ticker:!!state.ticker,overlay:!!document.querySelector('#fEnd,#stFx,#msFx'),storage:Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]))}));}
 result.livePreview=[];
 for(const version of (process.env.QUICK?['current']:['baseline','current']))for(const hash of (process.env.QUICK?['#ending=b1']:['#ending=b1','#stamp=12','#milestone=2000'])){
  const {context,page}=await fresh(version);
  await page.evaluate(()=>{openLesson(0);openExercise(0);});await page.waitForTimeout(2800);
  const before=await gameSnapshot(page);
  await page.evaluate(hash=>{location.hash=hash;},hash);await page.waitForTimeout(1800);
  const after=await gameSnapshot(page);let timeout=null;
  if(version==='current'&&hash==='#ending=b1'){
   await page.waitForTimeout(14500);timeout=await gameSnapshot(page);
   await page.screenshot({path:path.join(outDir,'live-ending-hidden-timeout.png')});
   await page.keyboard.press('Escape');timeout.afterClose=await gameSnapshot(page);await page.screenshot({path:path.join(outDir,'live-ending-after-close.png')});
  }
  result.livePreview.push({version,hash,before,after,timeout});await context.close();
 }
 {
  const {context,page}=await fresh();
  await page.evaluate(()=>{location.hash='#stamp=12';});await page.waitForTimeout(120);
  await page.evaluate(()=>{location.hash='#stamp=13';});await page.waitForTimeout(950);
  result.multipleStamps=await page.evaluate(()=>({count:document.querySelectorAll('#stFx').length,labels:[...document.querySelectorAll('#stFx')].map(e=>e.getAttribute('aria-label'))}));
  await page.waitForTimeout(800);await page.keyboard.press('Escape');result.multipleStamps.afterEscape=await page.locator('#stFx').count();await context.close();
 }
 {
  const {context,page}=await fresh();
  const before=await page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])));
  await page.evaluate(()=>{location.hash='#ENDING=B1';});await page.waitForTimeout(1000);
  result.b1Preview=await page.evaluate(()=>({mode:feState.mode,building:feState.building,step:feState.step,parts:feState.fxStat(),hash:location.hash}));
  await page.evaluate(()=>{while(feState.step<FE_LINES.b1.length-1)feNext();});
  result.b1Preview.final=await page.evaluate(()=>({badge:document.querySelector('.fe-badge').innerText,c1:!!document.querySelector('#feC1'),storage:Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]))}));
  result.b1Preview.sameStorage=JSON.stringify(before)===JSON.stringify(result.b1Preview.final.storage);
  await page.keyboard.press('Escape');await page.waitForTimeout(500);
  result.b1Preview.closed=await page.evaluate(()=>!feState&&!document.querySelector('#fEnd'));await context.close();
 }
 {
  const {context,page}=await fresh('current',false);
  await page.evaluate(()=>{feOpen('full');feState.skip=true;});await page.waitForTimeout(100);
  await page.evaluate(()=>{while(feState.step<9)feNext();feClose();feOpen('b1');});await page.waitForTimeout(1100);
  result.reopen=await page.evaluate(()=>({count:document.querySelectorAll('#fEnd').length,mode:feState.mode,step:feState.step,building:feState.building,typing:!!feState.typing}));
  await page.evaluate(()=>feClose());await context.close();
 }
 await browser.close();server.close();fs.writeFileSync(path.join(outDir,process.env.QUICK?'browser-flow-countercheck.json':'browser-flow.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);server.close();process.exit(1);});
