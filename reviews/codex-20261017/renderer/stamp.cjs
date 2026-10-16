'use strict';
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/Young/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../../..');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
await page.goto('file:///'+path.join(root,'vocagoyangfable.html').replaceAll('\\','/'),{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);await page.addStyleTag({content:'.fe{transition:none!important}.fe.show{opacity:1!important}'});
await page.evaluate(()=>{window.__q=[];window.requestAnimationFrame=f=>(__q.push(f),__q.length);window.cancelAnimationFrame=()=>{};window.__frame=()=>{const q=__q.splice(0);q.forEach(f=>f(performance.now()));};});
const cases=[];
for(const viewport of [{width:320,height:568},{width:390,height:844},{width:1280,height:720}]){await page.setViewportSize(viewport);
const result=await page.evaluate(()=>{feClose(true);__q=[];feOpen('b1');__frame();while(feState.step<5)feNext();const rect=sel=>{const e=document.querySelector(sel),r=e.getBoundingClientRect(),c=getComputedStyle(e);return {x:r.x,y:r.y,w:r.width,h:r.height,padding:c.padding,animation:c.animationName,transform:c.transform}};return {viewport:{w:innerWidth,h:innerHeight},badge:rect('.fe-badge'),wrapper:rect('.fe-bigstamp'),card:rect('.fe-bigstamp .st-card'),ink:rect('.fe-bigstamp .st-ink'),svg:rect('.fe-bigstamp .st-svg'),parts:feState.fxStat(),reduced:matchMedia('(prefers-reduced-motion:reduce)').matches};});cases.push(result);
await page.waitForTimeout(800);if(viewport.width===390)await page.screenshot({path:path.join(__dirname,'b1-stamp-reduced.png')});}
fs.writeFileSync(path.join(__dirname,'stamp-results.json'),JSON.stringify(cases,null,2)+'\n');console.log(JSON.stringify(cases,null,2));await browser.close();})().catch(e=>{console.error(e);process.exitCode=1});
