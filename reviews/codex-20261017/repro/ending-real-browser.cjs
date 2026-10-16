'use strict';
// Review only: isolated browser profile, real-time ending, no app/data changes.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'../../..'),out=path.resolve(__dirname,'../evidence');
fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{const b=fs.readFileSync(file);res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.mp3')?'audio/mpeg':'application/octet-stream'}).end(b);}catch{res.writeHead(404).end();}
});
const report={reviewed:'0d0f516',browser:'Chrome headless; Windows host; not an iPhone/Safari performance claim',viewport:{width:390,height:844},errors:[],samples:[],stages:[]};
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,executablePath:process.env.PW_CHROMIUM});
  try{
    const context=await browser.newContext({viewport:report.viewport,deviceScaleFactor:2});
    const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
    await page.goto('http://127.0.0.1:'+server.address().port+'/vocagoyangfable.html');
    await page.waitForSelector('.lessonbtn');
    await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,7000))]));
    await page.evaluate(()=>{
      window.__review={frames:[],last:0,samples:[]};
      feOpen('full');
      const record=t=>{if(!feState)return;if(__review.last)__review.frames.push(t-__review.last);__review.last=t;requestAnimationFrame(record);};requestAnimationFrame(record);
    });
    const start=Date.now();
    for(let s=0;s<=68;s++){
      const delay=start+s*1000-Date.now();if(delay>0)await new Promise(r=>setTimeout(r,delay));
      report.samples.push(await page.evaluate(()=>({elapsed:performance.now()-feState._t0,building:feState.building,step:feState.step,fx:feState.fxStat(),cap:document.querySelector('.fe-cap').textContent})));
      if([2,25,58,64].includes(s))await page.screenshot({path:path.join(out,'full-'+s+'s.png')});
      if(s%15===0)console.log('ending wall time '+s+'s');
    }
    const snap=async name=>{await page.screenshot({path:path.join(out,name+'.png')});report.stages.push(await page.evaluate(()=>({step:feState.step,cap:document.querySelector('.fe-cap').textContent,talk:document.querySelector('.fe-line').textContent,stage:document.querySelector('.fe-stage').getBoundingClientRect().toJSON(),scrollHeight:feState.ov.scrollHeight,clientHeight:feState.ov.clientHeight})));};
    await page.evaluate(()=>{while(feState.step<5)feNext();});await page.waitForTimeout(2000);await snap('full-big-mountain');
    await page.evaluate(()=>feNext());await page.waitForTimeout(2300);await snap('full-ilsan');
    await page.evaluate(()=>{while(feState.step<9)feNext();});await page.waitForTimeout(2400);await snap('full-identity');
    await page.evaluate(()=>{if(feState.typing)feNext();while(feState.step<11)feNext();});await page.waitForTimeout(2200);await snap('full-badge');
    Object.assign(report,await page.evaluate(()=>{
      const a=__review.frames.slice().sort((a,b)=>a-b),p=x=>a[Math.floor((a.length-1)*x)];
      return {messageLog:feState.msgLog,speed:feState.feSpeed,frameIntervals:{count:a.length,median:p(.5),p95:p(.95),p99:p(.99),max:a.at(-1),over50ms:a.filter(t=>t>50).length,over100ms:a.filter(t=>t>100).length},storageKeys:Object.keys(localStorage)};
    }));
    await page.evaluate(()=>feClose());
    report.afterClose=await page.evaluate(()=>({endings:document.querySelectorAll('.fe').length,feState:!!feState,bodyClass:document.body.classList.contains('fe-on')}));
    await context.close();
    fs.writeFileSync(path.join(out,'ending-real-browser.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({errors:report.errors,speed:report.speed,frameIntervals:report.frameIntervals,afterClose:report.afterClose}));
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
