'use strict';
// Review diagnostics, fresh profiles. Only records in the isolated profile are seeded.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/Young/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const html=fs.readFileSync(path.resolve(__dirname,'../../../vocagoyangfable.html'));
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results=[];
 for(const mode of ['b1','full']){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  await context.route('**/*',r=>r.request().url().startsWith('http://review.local/')?r.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html}):r.abort());
  page.on('pageerror',e=>errors.push(e.message));await page.goto('http://review.local/');await page.waitForSelector('.lessonbtn');
  const before=await page.evaluate(mode=>{
   state.muted=true;state.levelB1=mode==='b1';state.unlockAll=true;msMarkSeen(10000);
   const last=mode==='b1'?25:50,sets=state.lessons.filter(L=>L.kind!=='saved'&&L.lesson<=last);
   for(const L of sets){const es=visEx(L);es.forEach((e,i)=>{if(!(L.lesson===last&&i===es.length-1))setRec(L.id,e.title,{});});if(L.lesson!==last)stGive(L,1);}
   const L=sets.at(-1);state.li=state.lessons.indexOf(L);openExercise(visEx(L).length-1);const s=state.session;
   s.words.forEach(w=>w.passed=true);s.words[0].wrongEver=true;s.firstSeen=s.words.length;s.firstCorrect=s.words.length-1;s.errors=1;finishExercise();
   return {review:stReview?.where,count:stReview?.total,ending:!!feState,ticker:!!state.ticker,screen:document.querySelector('.screen.active').id};
  },mode);
  await page.waitForTimeout(800);await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('Enter');await page.waitForSelector('#stFx');await page.waitForTimeout(1000);
  const stamp=await page.evaluate(()=>({ending:!!feState,stamp:document.querySelector('#stFx')?.getAttribute('aria-label'),ticker:!!state.ticker}));
  await page.keyboard.press('Enter');await page.waitForSelector('#fEnd');await page.waitForTimeout(800);
  const opened=await page.evaluate(()=>({mode:feState.mode,step:feState.step,building:feState.building,ticker:!!state.ticker,stamp:!!document.querySelector('#stFx')}));
  // The first Enter can skip the building/labels frame. Let that RAF commit
  // before sending the next distinct key, as in ordinary keyboard input.
  for(let i=0;i<20&&!await page.evaluate(()=>!document.querySelector('.fe-badge').hidden);i++){
   await page.keyboard.press('Enter');await page.waitForTimeout(60);
  }
  const final=await page.evaluate(()=>({mode:feState.mode,step:feState.step,badge:!document.querySelector('.fe-badge').hidden,c1:!!document.querySelector('#feC1'),ticker:!!state.ticker}));
  await page.keyboard.press('Escape');const closed=await page.evaluate(()=>({ending:!!feState,ticker:!!state.ticker,screen:document.querySelector('.screen.active').id}));
  if(!final.badge||final.c1!==(mode==='b1')||before.ticker||stamp.ticker||opened.ticker||errors.length)throw new Error('Normal path verification failed: '+JSON.stringify({mode,before,stamp,opened,final,errors}));
  results.push({mode,before,stamp,opened,final,closed,errors});await context.close();
 }
 await browser.close();fs.writeFileSync(path.join(__dirname,'normal-paths.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exit(1);});
