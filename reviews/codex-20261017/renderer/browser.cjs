'use strict';
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/Young/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../../..');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--allow-file-access-from-files']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///'+path.join(root,'vocagoyangfable.html').replaceAll('\\','/'),{waitUntil:'load'});
 await page.evaluate(()=>document.fonts.ready);
 await page.addStyleTag({content:'.fe{transition:none!important}.fe.show{opacity:1!important}'});
 await page.evaluate(()=>{
  window.__realRAF=requestAnimationFrame;window.__realNow=performance.now.bind(performance);window.__clock=1000;window.__q=[];window.__text=[];window.__dots=[];
  performance.now=()=>window.__clock;window.requestAnimationFrame=f=>(window.__q.push(f),window.__q.length);window.cancelAnimationFrame=()=>{};
  for(const method of ['fillText','strokeText']){const orig=CanvasRenderingContext2D.prototype[method];CanvasRenderingContext2D.prototype[method]=function(...a){if(this.canvas.classList.contains('fe-mt')){if(window.__fixText)this.globalCompositeOperation='source-over';__text.push({method,text:a[0],composite:this.globalCompositeOperation,color:method==='fillText'?this.fillStyle:this.strokeStyle,transform:Array.from(this.getTransform().toFloat64Array()),font:this.font});}return orig.apply(this,a);};}
  const orig=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(...a){if(this.canvas.classList.contains('fe-fx')&&a.length===5&&a[3]===4.8)__dots.push({x:a[1]+2.4,y:a[2]+2.4});return orig.apply(this,a);};
  window.__frame=t=>{__clock=t;const q=__q.splice(0);q.forEach(f=>f(t));};
 });
 const world=await page.evaluate(()=>{const wd=feWorld({sets:state.lessons.filter(L=>L.kind!=='saved')});return {B:wd.B,Hm:wd.Hm,totalWords:wd.bands.reduce((a,b)=>a+b.ws.length,0),totalPositions:wd.bands.reduce((a,b)=>a+b.pos.length,0),scaleRange:[Math.min(...wd.bands.map(b=>b.sq)),Math.max(...wd.bands.map(b=>b.sq))],missing:wd.bands.filter(b=>b.pos.length!==b.ws.length).map(b=>({set:b.L.id,words:b.ws.length,positions:b.pos.length}))};});
 const glow=await page.evaluate(()=>{__q=[];feOpen('full');__clock=feState._t0+1400;__frame(__clock);return {log:__text.filter(x=>x.text==='reading'),speed:feState.feSpeed};});
 await page.screenshot({path:path.join(__dirname,'message-original.png')});
 await page.evaluate(()=>{window.__fixText=true;__frame(__clock);});
 await page.screenshot({path:path.join(__dirname,'message-source-over-proof.png')});
 await page.evaluate(()=>{window.__fixText=false;});
 const geometries=[];
 for(const vp of [{width:320,height:568},{width:360,height:640},{width:390,height:844},{width:844,height:390},{width:1280,height:720}]){
  await page.setViewportSize(vp);
  const g=await page.evaluate(()=>{feClose(true);__q=[];__clock=1000;feOpen('full');feState.skip=true;__frame(1501);for(let i=0;i<5;i++)feNext();__dots=[];__frame(4001);const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom};};return {step:feState.step,line:feState.full,viewport:{w:innerWidth,h:innerHeight},canvas:rect('.fe-mt'),talk:rect('.fe-talk'),overlay:rect('.fe'),dots:{count:__dots.length,minX:Math.min(...__dots.map(p=>p.x)),maxX:Math.max(...__dots.map(p=>p.x)),minY:Math.min(...__dots.map(p=>p.y)),maxY:Math.max(...__dots.map(p=>p.y)),outsideTop:__dots.filter(p=>p.y<0).length},overflow:document.querySelector('.fe').scrollHeight-document.querySelector('.fe').clientHeight};});
  geometries.push(g);
  if(vp.width===844)await page.screenshot({path:path.join(__dirname,'landscape-bigmountain.png')});
  if(vp.width===320)await page.screenshot({path:path.join(__dirname,'smallphone-bigmountain.png')});
 }
 const resize=await page.evaluate(()=>{feClose(true);__q=[];return null;});
 await page.setViewportSize({width:844,height:390});
 await page.evaluate(()=>{feOpen('full');feState.skip=true;__frame(10000);});
 await page.setViewportSize({width:390,height:844});
 const rotated=await page.evaluate(()=>{__frame(10016);const r=document.querySelector('.fe-mt').getBoundingClientRect();return {viewport:{width:innerWidth,height:innerHeight},canvas:{x:r.x,y:r.y,width:r.width,height:r.height},outsideLeft:-Math.min(0,r.left),outsideRight:Math.max(0,r.right-innerWidth)};});
 await page.screenshot({path:path.join(__dirname,'rotate-landscape-to-portrait.png')});
 const result={errors,world,glow,geometries,rotated};fs.writeFileSync(path.join(__dirname,'browser-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
