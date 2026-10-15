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
  state.unlockAll=true;state.levelB1=false;state.prevOn=true;state.muted=false;state.savedLesson=null;
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
  // FABLE의 nextCard는 같은 표제어를 연달아 내지 않는다(lastWordKey). 새 판이 마침 이 카드로 시작했는데 다시 nextCard를 부르면
  // 다른 단어로 넘어가 버려, 그 칸에 표제어를 치면 오답·따라쓰기가 되어 음원을 기다리다 멈췄다(26.10.15, 10번 중 4번).
  // 이미 이 카드면 그대로 쓰고, 아니면 맨 앞에 두고 직전 표제어 기억을 지운 뒤 넘긴다.
  const s=state.session,w=s.words.find(matches);
  if(s.currentId!==w.id){s.queue=[w.id,...s.queue.filter(id=>id!==w.id)];s.lastWordKey=null;nextCard();}
  return {term:w.term,meaning:w.meaning,ipa:fable?w.ipa:pronunciationAudioInfo(w.term,w.meaning).ipa};
 },{file,term,ipa});
}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=(process.env.PRONUNCIATION_BASE_URL||('http://127.0.0.1:'+server.address().port)).replace(/\/$/,'');
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
    window.Audio=function(...args){const a=new NativeAudio(...args);for(const type of ['playing','ended','error','pause'])a.addEventListener(type,()=>audioTrace.push({type,src:a.currentSrc,time:performance.now()}));const play=a.play.bind(a);a.play=()=>{const p=play();p?.catch(e=>audioTrace.push({type:'playRejected',name:e.name,message:e.message,src:a.currentSrc}));return p;};return a;};
    const say=window.speechSynthesis.speak.bind(window.speechSynthesis);
    window.speechSynthesis.speak=u=>{if(u.text.trim())nativeTrace.push(u.text);return say(u);};
   });
   await page.goto(base+'/'+file);await page.waitForSelector('.lessonbtn');
   assert.equal(requests.length,0,'Home must not download the library');
   // A real learner clicks into a lesson. fill() alone is not a trusted
   // activation on a public HTTPS origin, so it can test autoplay denial
   // instead of the game's normal typing path.
   await page.locator('.lessonbtn').first().click();
   const card=await select(page,file,file.includes('fable')?'contract':'conduct');
   await page.locator('#ainput').pressSequentially(card.term,{delay:5});
   await page.waitForFunction(()=>audioTrace.some(e=>e.type==='playing'));
   const begun=await page.evaluate(()=>({term:ipaEffectRun?.info.term,started:ipaEffectRun?.started,recorded:ipaEffectRun?.timing?.recorded,native:nativeTrace.slice()}));
   assert.equal(begun.term,card.term);assert(begun.started!==null);assert.equal(begun.recorded,true);assert.equal(begun.native.length,0);
   try{await page.waitForFunction(()=>audioTrace.some(e=>e.type==='ended'));}
   catch(error){
    console.error(file,JSON.stringify(await page.evaluate(()=>({audioTrace,nativeTrace,owner:exceptionAudioOwner&&{started:exceptionAudioOwner.started,done:exceptionAudioOwner.done},effect:ipaEffectRun&&{started:ipaEffectRun.started,finished:ipaEffectRun.finished,timing:ipaEffectRun.timing},answered:state.session?.answered})),null,2));
    throw error;
   }
   const first=await page.evaluate(()=>audioTrace.find(e=>e.type==='playing').src);
   // Repeated answer replay is interruptible; the score is unchanged.
   await select(page,file,card.term,card.ipa);await page.locator('#ainput').pressSequentially(card.term,{delay:5});
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
   await page.locator('.lessonbtn').first().click();
   const failed=await select(page,file,card.term,card.ipa);await page.locator('#ainput').pressSequentially(failed.term,{delay:5});
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
