/* Small, exact term+IPA exceptions. All other pronunciation stays browser TTS. */
let exceptionAudioOwner=null,exceptionAudioGeneration=0,exceptionAudioWarm=null;
function exceptionAudioEntry(info){
  if(!info||typeof info.term!=='string'||typeof info.ipa!=='string'||typeof PRONUNCIATION_AUDIO_MAP==='undefined')return null;
  const entry=PRONUNCIATION_AUDIO_MAP[info.term+'\t'+info.ipa];
  return entry&&typeof entry.src==='string'&&entry.src?entry:null;
}
function exceptionAudioConstructor(){
  if(typeof window!=='undefined'&&typeof window.Audio==='function')return window.Audio;
  return typeof Audio==='function'?Audio:null;
}
function exceptionAudioDispose(audio){
  if(!audio)return;
  // pause/load can dispatch events or reject an outstanding play promise.
  // Detach first, so cancelling is never mistaken for a failed pronunciation.
  audio.onplaying=audio.onended=audio.onerror=audio.onpause=null;
  try{audio.pause();}catch(e){}
  try{audio.removeAttribute('src');audio.load();}catch(e){}
}
function exceptionAudioCancel(){
  exceptionAudioGeneration++;
  const owner=exceptionAudioOwner;exceptionAudioOwner=null;
  if(!owner)return;
  owner.done=true;clearTimeout(owner.loadTimer);clearTimeout(owner.endTimer);
  exceptionAudioDispose(owner.audio);
}
function exceptionAudioPreload(info){
  const entry=exceptionAudioEntry(info),AudioType=exceptionAudioConstructor();
  const key=entry?info.term+'\t'+info.ipa:null;
  if(exceptionAudioWarm?.key===key)return;
  if(exceptionAudioWarm){exceptionAudioDispose(exceptionAudioWarm.audio);exceptionAudioWarm=null;}
  if(!entry||!AudioType||exceptionAudioOwner?.key===key)return;
  try{
    // Only the current card's one clip is warmed. Native media/HTTP caching
    // avoids fetch->Blob duplication and never retains decoded Web Audio data.
    const audio=new AudioType();audio.preload='auto';audio.src=entry.src;
    exceptionAudioWarm={key,audio};audio.load();
  }catch(e){if(exceptionAudioWarm){exceptionAudioDispose(exceptionAudioWarm.audio);exceptionAudioWarm=null;}}
}
function exceptionAudioPlay(info,run,valid,fallback){
  const entry=exceptionAudioEntry(info),AudioType=exceptionAudioConstructor();
  if(!entry||!AudioType)return false;
  exceptionAudioCancel();
  const key=info.term+'\t'+info.ipa;
  const owner={key,run,valid,generation:exceptionAudioGeneration,audio:null,done:false,started:false,loadTimer:null,endTimer:null};
  exceptionAudioOwner=owner;
  const current=()=>exceptionAudioOwner===owner&&!owner.done&&owner.generation===exceptionAudioGeneration&&valid()&&(!run||typeof ipaEffectCurrent!=='function'||ipaEffectCurrent(run));
  const finishOwner=()=>{
    owner.done=true;clearTimeout(owner.loadTimer);clearTimeout(owner.endTimer);
    if(exceptionAudioOwner===owner)exceptionAudioOwner=null;
    exceptionAudioDispose(owner.audio);
  };
  const fail=()=>{
    if(!current()){if(exceptionAudioOwner===owner)finishOwner();return;}
    finishOwner();
    if(run){
      // Re-arm the SAME effect run for native TTS without resetting the card's
      // advance deadline. The host restores TTS context/whole-word info first.
      if(typeof ipaEffectClearVisual==='function')ipaEffectClearVisual(run);
      clearTimeout(run.watchdog);run.watchdog=null;run.started=null;run.finished=false;
      run.timing=null;run.unreliable=false;delete run.visualUntil;
    }
    try{fallback?.();}catch(e){if(run&&typeof ipaEffectFinish==='function')ipaEffectFinish(run,true);}
  };
  if(!current()){finishOwner();return true;}
  try{
    if(exceptionAudioWarm?.key===key){owner.audio=exceptionAudioWarm.audio;exceptionAudioWarm=null;}
    else{owner.audio=new AudioType();owner.audio.preload='auto';owner.audio.src=entry.src;}
    const audio=owner.audio;
    audio.onplaying=()=>{
      if(!current()){if(exceptionAudioOwner===owner)finishOwner();return;}
      if(owner.started)return;
      owner.started=true;clearTimeout(owner.loadTimer);
      const seconds=Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:Number(entry.duration);
      const durationMs=Number.isFinite(seconds)&&seconds>0?seconds*1000:undefined;
      if(run&&typeof ipaEffectStart==='function')ipaEffectStart(run,{rate:1,lang:'en-US',durationMs,voice:{voiceURI:'recording:'+entry.src,name:'Pronunciation exception',lang:'en-US',localService:true}});
      owner.endTimer=setTimeout(fail,Math.min(6500,Math.max(2000,(durationMs||4500)+1500)));
    };
    audio.onended=()=>{
      if(!current()){if(exceptionAudioOwner===owner)finishOwner();return;}
      finishOwner();if(run&&typeof ipaEffectFinish==='function')ipaEffectFinish(run);
    };
    audio.onerror=fail;audio.onpause=()=>{if(!audio.ended)fail();};
    // A rejected play(), a 404, and a request that never starts all converge on
    // one fallback. Late callbacks lose ownership after next/replay/mute.
    owner.loadTimer=setTimeout(fail,1800);
    const playing=audio.play();
    if(playing&&typeof playing.catch==='function')playing.catch(fail);
  }catch(e){fail();}
  return true;
}
