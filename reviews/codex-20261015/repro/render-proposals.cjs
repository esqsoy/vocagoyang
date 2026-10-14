'use strict';
// Render the review's proposals in an isolated browser only. App files/storage are untouched.
const fs=require('fs'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'../../..');
const report=JSON.parse(fs.readFileSync(path.join(__dirname,'../review.json'),'utf8'));
const edits=report.content.flatMap(f=>f.edits.map(e=>({...e,finding:f.id})));
(async()=>{
  const browser=await chromium.launch({...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{}),headless:true});
  const results=[];
  for(const width of [390,360]){
    const context=await browser.newContext({viewport:{width,height:800},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'ko-KR'});
    const page=await context.newPage();
    await page.goto(require('url').pathToFileURL(path.join(root,'vocagoyangfable.html')).href);
    await page.waitForSelector('.lessonbtn');await page.evaluate(()=>{state.muted=true;openLesson(0);openExercise(0);});
    await page.waitForFunction(()=>state.session&&document.querySelector('#hoeCtx'));
    const rows=await page.evaluate(edits=>{
      const box=document.querySelector('#hoeCtx');
      const lines=el=>{
        const lh=parseFloat(getComputedStyle(el).lineHeight)||24,cs=[];
        const r=document.createRange();r.selectNodeContents(el);
        for(const rc of r.getClientRects())if(rc.width>0&&rc.height>0)cs.push((rc.top+rc.bottom)/2);
        for(const sl of el.querySelectorAll('.slot')){const b=sl.getBoundingClientRect();if(b.height>0)cs.push((b.top+b.bottom)/2);}
        cs.sort((a,b)=>a-b);let n=0,last=-1e9;for(const c of cs)if(c-last>lh*.5){n++;last=c;}return n;
      };
      return edits.map(e=>{
        const original=state.lessons.find(l=>l.lesson===e.set).exercises.flatMap(x=>x.words).find(w=>w.savedCardId===e.savedCardId);
        if(!original||original.ex!==e.current.ex)throw Error('Baseline mismatch: '+e.finding);
        const w={...original,...e.proposed};
        box.innerHTML=hoeCtxHtml(w);const ex=box.querySelector('.ex'),quiz=lines(ex);
        ex.innerHTML=fillBlank(w.ex,w.term);
        return {finding:e.finding,set:e.set,word:e.word,si:e.si,quizLines:quiz,sentenceLines:lines(ex)};
      });
    },edits);
    results.push({width,rows,overLimit:rows.filter(r=>r.sentenceLines>3||r.quizLines>4)});
    await context.close();
  }
  await browser.close();
  const dir=process.env.REVIEW_OUT||fs.mkdtempSync(path.join(require('os').tmpdir(),'fable-proposals-'));
  fs.writeFileSync(path.join(dir,'proposed-render.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({result:path.join(dir,'proposed-render.json'),summary:results.map(r=>({width:r.width,cards:r.rows.length,overLimit:r.overLimit}))}));
})().catch(e=>{console.error(e);process.exitCode=1;});
