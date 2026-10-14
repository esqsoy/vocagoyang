// Baseline: 74a6ddc. Diagnostic reproduction; does not edit app files.
const fs=require('fs'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const resultDir=process.env.REVIEW_OUT || fs.mkdtempSync(path.join(require('os').tmpdir(),'fable-review-'));
const root=path.resolve(__dirname,'../../..'),out={errors:[]};
(async()=>{
const browser=await chromium.launch({...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{}),headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
const page=await context.newPage();page.on('pageerror',e=>out.errors.push(e.message));
await page.goto(require('url').pathToFileURL(path.join(root,'vocagoyangfable.html')).href);await page.waitForSelector('.lessonbtn');
out.b1=await page.evaluate(()=>{
 state.muted=true;state.levelB1=true;state.progress={};msMarkSeen(10000);
 for(const L of state.lessons.filter(l=>l.lesson<=25))for(const e of visEx(L))setRec(L.id,e.title,{});
 state.li=state.lessons.findIndex(l=>l.lesson===25);const L=state.lessons[state.li];
 const ei=visEx(L).length-1;openExercise(ei);const s=state.session;
 s.words.forEach(w=>{w.passed=true;});s.firstSeen=s.words.length;s.firstCorrect=0;
 finishExercise();
 return {scopedDone:clearedExercises(),scopedTotal:totalExercises(),allDone:clearedExercises(true),allTotal:totalExercises(true),title:document.querySelector('#sumTitle').textContent};
});
await page.waitForTimeout(1000);out.b1.endingVisible=await page.locator('#ending').evaluate(e=>e.classList.contains('show'));
await page.screenshot({path:path.join(resultDir,'b1-premature-ending.png')});
await page.reload();await page.waitForSelector('.lessonbtn');
out.testament=await page.evaluate(()=>{const L=state.lessons.find(l=>l.lesson===35),ei=L.exercises.findIndex(e=>e.words.some(w=>w.word==='testament'&&w.si===2));state.unlockAll=true;state.li=state.lessons.indexOf(L);state.muted=true;openExercise(ei);const s=state.session,w=s.words.find(w=>w.word==='testament'&&w.si===2);s.queue=[w.id];nextCard();document.querySelector('#ainput').value=w.term;submit();return {term:w.term,example:w.ex,rendered:document.querySelector('#hoeCtx').innerText};});
await page.screenshot({path:path.join(resultDir,'testament-capitalization.png')});
await page.reload();await page.waitForSelector('.lessonbtn');
out.reviewRace=await page.evaluate(()=>{state.muted=true;state.progress={};state.li=0;msMarkSeen(10000);openExercise(0);const s=state.session;s.words.forEach(w=>w.passed=true);s.words[0].wrongEver=true;s.words[0].errors=1;s.firstSeen=s.words.length;s.firstCorrect=s.words.length-1;finishExercise();document.querySelector('#sumWrong .wrow').click();document.querySelector('#nextEx').click();return {immediateExercise:state.ei,immediateTitle:state.session.exercise.title};});
await page.waitForTimeout(850);out.reviewRace.after=await page.evaluate(()=>({exercise:state.ei,title:state.session.exercise.title,screen:document.querySelector('.screen.active')?.id}));
await page.reload();await page.waitForSelector('.lessonbtn');
out.spelling=await page.evaluate(()=>{const L=state.lessons.find(l=>l.exercises.some(e=>e.words.some(w=>w.word==='bus'))),ei=L.exercises.findIndex(e=>e.words.some(w=>w.word==='bus'));state.li=state.lessons.indexOf(L);state.muted=true;state.unlockAll=true;openExercise(ei);const s=state.session,w=s.words.find(w=>w.word==='bus');s.queue=[w.id];nextCard();document.querySelector('#ainput').value='buz';document.querySelector('#ainput').dispatchEvent(new Event('input',{bubbles:true}));return {term:w.term,input:'buz',answered:s.answered,passed:w.passed,errors:s.errors,variant:isSpellingVariant('buz','bus'),speech:document.querySelector('#catSpeech').textContent};});
await page.screenshot({path:path.join(resultDir,'misspelling-accepted.png')});
await page.reload();await page.waitForSelector('.lessonbtn');
out.oldUnlock=await page.evaluate(()=>{state.progress={'26세트':{'Exercise 6 · 2534~2543 :: editorial-20260925 1-12':{completed:true}}};state.unlockAll=false;localStorage.setItem(LASTKEY,JSON.stringify({lid:'26세트',title:'Exercise 6 · 2534~2543',layout:'placement-v1',prune:'20261012'}));renderHome();show('home');const L=state.lessons.find(l=>l.lesson===26);return {completed:L.exercises.filter(e=>getRec(L.id,e.title)?.completed).map(e=>e.title),opened:[...openSets()].map(l=>l.lesson),rawResume:resumeTarget()?.L.lesson,effectiveResume:openResumeTarget()?.L.lesson};});
await browser.close();fs.writeFileSync(path.join(resultDir,'browser-review.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out));
})().catch(e=>{console.error(e);process.exit(1);});
