const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
function replaceOne(html,oldText,newText){assert.equal(html.split(oldText).length,2,'Expected one textbook hook: '+oldText.slice(0,75));return html.replace(oldText,newText);}
function patchCopyCompletion(html){
  html=html.replace('Normal correct answers use the IPA effect; copy and review keep their effects.','Completed answers use the IPA effect; review effects stay intact.');
  if(html.includes('const w=s.words[s.currentId];s.revealedAt=Date.now();'))return html;
  const oldReveal='const wrap=$("#hoeCtx .blanks");if(wrap){wrap.innerHTML=blankSlots(term,term);wrap.classList.add("revealed");wrap.querySelectorAll(".slot-punctuation").forEach(el=>el.classList.add("shown"));}';
  html=replaceOne(html,'function showReveal(type,term,meaning,line){','function revealInPlace(term){\n  '+oldReveal+'\n}\nfunction showReveal(type,term,meaning,line){');
  html=replaceOne(html,'    '+oldReveal,'    revealInPlace(term);');
  html=replaceOne(html,'  fx(true);beep("ok");scheduleNext(650);','  const w=s.words[s.currentId];s.revealedAt=Date.now();\n  revealInPlace(w.term);beep("ok");speakPronunciation(w.term,w.meaning);scheduleNext(1200);');
  html=html.replace('// Only the normal correct-answer delay waits for speech. Copy remains 650ms.','// Every completed answer, including corrected copies, waits for its pronunciation.');
  return html;
}
function patchCombinedEffects(html){
  return html.replace('  if(good&&combo)return; // Completed answers use the IPA effect; review effects stay intact.\n','')
    .replace('revealInPlace(w.term);fx(true);beep("ok");speakPronunciation(w.term,w.meaning);','revealInPlace(w.term);beep("ok");speakPronunciation(w.term,w.meaning);');
}
function patch(html){
  html=html.replace(/\r\n/g,'\n');
  if(html.includes('function pronunciationEffectInfo('))return patchCombinedEffects(patchCopyCompletion(html));
  html=replaceOne(html,'function cancelPendingAdvance(){const s=state.session;', 'function cancelPendingAdvance(){ipaEffectCancelAdvance();const s=state.session;');
  html=replaceOne(html,`function scheduleNext(ms){
  cancelPendingAdvance();const s=state.session,id=s&&s.currentId;if(!s)return;
  s.nextTimer=setTimeout(()=>{s.nextTimer=null;if(state.session===s&&s.currentId===id&&s.answered&&screens.game.classList.contains("active"))nextCard();},ms);
}`,`function scheduleNext(ms){
  cancelPendingAdvance();const s=state.session,id=s&&s.currentId;if(!s)return;
  const current=()=>state.session===s&&s.currentId===id&&s.answered&&!s.copyMode&&screens.game.classList.contains("active");
  s.nextTimer=setTimeout(()=>{s.nextTimer=null;if(!current())return;
    // Every completed answer, including corrected copies, waits for its pronunciation.
    if(ms===1200)ipaEffectAdvance(nextCard,current);else nextCard();
  },ms);
}`);
  html=replaceOne(html,'function stopPronunciation(cancelSpeech=true){\n  pronunciationSeq++;','function stopPronunciation(cancelSpeech=true){\n  ipaEffectCancel();\n  pronunciationSeq++;');
  const start=html.indexOf('function speakPronunciation(term,meaning){'),end=html.indexOf('\nfunction spkSvg(',start);
  assert(start>=0&&end>start,'Speech function boundaries');
  html=html.slice(0,start)+`function pronunciationEffectInfo(term,meaning){
  const entry=pronunciationEntry(term,meaning);if(!entry.ipa)return null;
  const alternatives=Array.isArray(entry.alternatives)?entry.alternatives.filter(p=>p.ipa):[];
  return {term,ipa:entry.ipa,speech:entry.speech||term,
    forceWhole:!!entry.label||alternatives.length>0||!!entry.speech&&entry.speech!==term,
    displayIpa:[entry,...alternatives].map(p=>p.ipa).join(' · ')};
}
function speakPronunciation(term,meaning){
  const session=state.session,id=session&&session.currentId;
  if(!session||id===null||!session.answered||session.words[id]?.term!==term||!screens.game.classList.contains("active"))return;
  stopPronunciation();const seq=pronunciationSeq;
  const current=()=>seq===pronunciationSeq&&state.session===session&&session.currentId===id&&session.answered&&screens.game.classList.contains("active");
  const effectCurrent=()=>current()&&!session.copyMode;
  const info=session.copyMode?null:pronunciationEffectInfo(term,meaning);
  if(state.muted||!pronunciationSupported()){ipaEffectSilent(info,effectCurrent);return;}
  const stillRevealed=()=>current()&&!state.muted;
  const effect=ipaEffectRequest(info,()=>effectCurrent()&&!state.muted);
  const text=pronunciationEntry(term,meaning).speech||term;
  const say=()=>{if(!stillRevealed())return;try{
    const utterance=new window.SpeechSynthesisUtterance(text);
    utterance.lang=pronunciationVoice?.lang||"en-US";utterance.rate=.88;
    if(pronunciationVoice)utterance.voice=pronunciationVoice;
    ipaEffectAttach(utterance,effect);
    window.speechSynthesis.speak(utterance);
  }catch(e){ipaEffectCancel();}};
  pronunciationVoice=pickPronunciationVoice();
  if(pronunciationVoice){say();return;}
  // A late voice list cannot revive speech after the learner changes cards.
  try{const prime=new window.SpeechSynthesisUtterance(" ");prime.lang="en-US";prime.volume=0;window.speechSynthesis.speak(prime);}catch(e){}
  let tries=0;pronunciationWait=setInterval(()=>{
    if(!stillRevealed()){clearInterval(pronunciationWait);pronunciationWait=null;return;}
    pronunciationVoice=pickPronunciationVoice();
    if(pronunciationVoice||++tries>=12){clearInterval(pronunciationWait);pronunciationWait=null;say();}
  },100);
}
`+html.slice(end);
  html=replaceOne(html,'// 이미 시작한 긴 발음은 마치게 두고, 아직 시작하지 않은 재생 예약만 취소한다.\n  stopPronunciation(false);cancelPendingAdvance();','// Manual navigation cancels speech and its overlay immediately.\n  stopPronunciation();cancelPendingAdvance();');
  html=replaceOne(html,'layer.innerHTML="";const gen=++fxGen;','layer.innerHTML="";const gen=++fxGen;\n  if(good&&combo)return; // Completed answers use the IPA effect; review effects stay intact.');
  html=replaceOne(html,'scheduleNext(1500);','scheduleNext(1200);');
  return patchCombinedEffects(patchCopyCompletion(html));
}
module.exports={patch};
if(require.main===module){const root=path.resolve(__dirname,'../..');for(const name of ['vocagoyangksat2027.html','vocagoyangebs2027.html']){const file=path.join(root,name);fs.writeFileSync(file,patch(fs.readFileSync(file,'utf8')));console.log('Updated IPA speech/navigation hooks: '+name);}}
