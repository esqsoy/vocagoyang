'use strict';
// Local HTTP integration. New browser profile: no learner progress is touched.
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'../..');
const server=http.createServer((req,res)=>{
 const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 try{const bytes=fs.readFileSync(target);res.writeHead(200,{'Content-Type':target.endsWith('.mp3')?'audio/mpeg':target.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream','Cache-Control':'public, max-age=3600'});res.end(bytes);}catch{res.writeHead(404);res.end();}
});
const pages=['vocagoyangfable.html','vocagoyangksat2027.html','vocagoyangebs2027.html'];
async function select(page,file,term,ipa){
 return page.evaluate(({file,term,ipa})=>{
  state.unlockAll=true;state.levelB1=false;state.prevOn=true;state.muted=false;
  const fable=file.includes('fable');
  const matches=w=>{
   const t=w.term||w.en||w.word;if(t!==term)return false;
   const info=fable?{term:t,ipa:w.ipa}:pronunciationAudioInfo(t,w.meaning||w.ko,w.originalMeaning);
   return !!exceptionAudioEntry(info)&&(!ipa||info.ipa===ipa);
  };
  const li=state.lessons.findIndex(l=>visEx(l).some(e=>e.words.some(matches)));
  if(li<0)throw new Error('No audio card: '+term);
  state.li=li;const ei=visEx(state.lessons[li]).findIndex(e=>e.words.some(matches));
  if(fable)openExercise(ei);else startExercise(ei);
  const s=state.session,w=s.words.find(matches);s.queue=[w.id,...s.queue.filter(id=>id!==w.id)];nextCard();
  return {term:w.term,meaning:w.meaning,ipa:fable?w.ipa:pronunciationAudioInfo(w.term,w.meaning).ipa};
 },{file,term,ipa});
}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{})});
 const reports=[];
 try{
  for(const file of pages){
   const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
   const page=await context.newPage(),errors=[],requests=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('/assets/pronunciation/'))requests.push(r.url());});
   await page.addInitScript(()=>{
    window.audioTrace=[];window.nativeTrace=[];
    const NativeAudio=window.Audio;
    window.Audio=function(...args){const a=new NativeAudio(...args);for(const type of ['playing','ended','error','pause'])a.addEventListener(type,()=>audioTrace.push({type,src:a.currentSrc,time:performance.now()}));return a;};
    const say=window.speechSynthesis.speak.bind(window.speechSynthesis);
    window.speechSynthesis.speak=u=>{if(u.text.trim())nativeTrace.push(u.text);return say(u);};
   });
   await page.goto(base+'/'+file);await page.waitForSelector('.lessonbtn');
   assert.equal(requests.length,0,'Home must not download the library');
   const card=await select(page,file,file.includes('fable')?'contract':'conduct');
   await page.locator('#ainput').fill(card.term);
   await page.waitForFunction(()=>audioTrace.some(e=>e.type==='playing'));
   const begun=await page.evaluate(()=>({term:ipaEffectRun?.info.term,started:ipaEffectRun?.started,recorded:ipaEffectRun?.timing?.recorded,native:nativeTrace.slice()}));
   assert.equal(begun.term,card.term);assert(begun.started!==null);assert.equal(begun.recorded,true);assert.equal(begun.native.length,0);
   await page.waitForFunction(()=>audioTrace.some(e=>e.type==='ended'));
   const first=await page.evaluate(()=>audioTrace.find(e=>e.type==='playing').src);
   // Repeated answer replay is interruptible; the score is unchanged.
   await select(page,file,card.term,card.ipa);await page.locator('#ainput').fill(card.term);
   await page.waitForFunction(()=>!!exceptionAudioOwner?.started);
   const attempts=await page.evaluate(()=>state.session.attempts);
   await page.locator('.answer-replay').first().click();
   await page.waitForFunction(()=>!!exceptionAudioOwner?.started);
   assert.equal(await page.evaluate(()=>state.session.attempts),attempts);
   await page.evaluate(()=>setMuted(true));
   assert.equal(await page.evaluate(()=>exceptionAudioOwner),null);
   // Failed/blocked media falls back once, without stranding the effect.
   await page.route('**/assets/pronunciation/*.mp3*',route=>route.abort());
   await page.reload();await page.waitForSelector('.lessonbtn');
   const failed=await select(page,file,card.term,card.ipa);await page.locator('#ainput').fill(failed.term);
   await page.waitForFunction(()=>nativeTrace.length>0);
   assert.equal(await page.evaluate(()=>nativeTrace.length),1);
   await page.evaluate(()=>setMuted(true));
   assert.deepEqual(errors,[]);
   reports.push({file,card,played:first,actualMP3:true,overlayStarted:true,replay:true,mute:true,networkFailureFallback:true,errors});
   await context.close();
  }
  console.log(JSON.stringify(reports,null,2));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
