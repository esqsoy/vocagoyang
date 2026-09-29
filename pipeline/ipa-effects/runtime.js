/* The revealed spelling is the replay control; the typing overlay stays intact. */
function enableAnswerReplay(blank,term){
  blank.classList.add('answer-replay');blank.setAttribute('role','button');
  blank.setAttribute('tabindex','0');blank.setAttribute('aria-label',term+' 발음 다시 듣기');
}
function replayAnswerFromEvent(e){
  if(!e.target?.closest?.('.answer-replay'))return;
  if(e.type==='keydown'&&(e.isComposing||e.repeat||!['Enter',' ','Spacebar'].includes(e.key)))return;
  const s=state.session;if(!s||s.currentId===null||!s.answered||s.copyMode||!screens.game.classList.contains('active'))return;
  e.preventDefault();e.stopPropagation();
  const w=s.words[s.currentId];
  if(typeof speakPronunciation==='function')speakPronunciation(w.term,w.meaning);else speak(w.term);
}
/* Browser TTS drives the start/end. Internal beats are estimates, never audio timestamps. */
let ipaEffectRun=null,ipaEffectGeneration=0,ipaEffectGate=null;
const ipaEffectDurations=new Map(),ipaEffectVoices=new Map();
const ipaEffectClamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const ipaEffectMedian=xs=>{const a=[...xs].sort((x,y)=>x-y),i=Math.floor(a.length/2);return a.length%2?a[i]:(a[i-1]+a[i])/2;};
function ipaEffectClearVisual(run){
  if(!run)return;
  (run.visualTimers||[]).forEach(clearTimeout);run.visualTimers=[];
  (run.touched||[]).forEach(el=>el.classList.remove('ipa-under','ipa-silent'));run.touched=[];
  if(run.layer){run.layer.remove();run.layer=null;}run.nodes=[];
}
function ipaEffectCancel(){
  ipaEffectGeneration++;
  const run=ipaEffectRun;ipaEffectRun=null;
  if(run){run.cancelled=true;clearTimeout(run.watchdog);ipaEffectClearVisual(run);}
}
function ipaEffectCurrent(run){return !!(run&&ipaEffectRun===run&&!run.cancelled&&run.generation===ipaEffectGeneration&&run.valid());}
function ipaEffectLater(run,fn,ms){const id=setTimeout(()=>{if(ipaEffectCurrent(run))fn();},ms);run.visualTimers.push(id);return id;}
function ipaEffectRequest(info,valid){
  ipaEffectCancel();if(!info||!info.ipa||!valid())return null;
  const now=performance.now();
  const run={info,valid,generation:ipaEffectGeneration,created:now,started:null,finished:false,cancelled:false,visualTimers:[],touched:[],nodes:[]};
  ipaEffectRun=run;return run;
}
function ipaEffectKey(u){const v=u.voice;return JSON.stringify([v?.voiceURI||'',v?.name||'',v?.lang||u.lang||'',v?.localService??null,u.rate||1,u.pitch??1]);}
function ipaEffectMap(info){
  const raw=!info.forceWhole&&IPA_EFFECT_MAPS[info.term+'\t'+info.ipa];
  if(!raw)return {mode:'whole',parts:[]};
  return {mode:'aligned',parts:raw.map(p=>({start:p[0],end:p[1],ipa:p[2],stress:p[3]===1,secondary:p[3]===2,silent:p[3]===3,beat:p[4],weight:p[5]||1}))};
}
function ipaEffectTiming(run,u){
  const beats=new Map();for(const p of run.map.parts){if(!p.silent)beats.set(p.beat,Math.max(beats.get(p.beat)||0,p.weight));}
  const estimatedSyllables=(run.info.ipa.replace(/eɪ|aɪ|ɔɪ|aʊ|oʊ/g,'a').match(/[aeiouæɑɔəɛɪʊʌɚɝ]/g)||[]).length||1;
  const total=beats.size?[...beats.values()].reduce((a,b)=>a+b,0):estimatedSyllables;
  const base=ipaEffectClamp((600+total*240)*(.88/(u.rate||1)),350,6000),voiceKey=ipaEffectKey(u),wordKey=JSON.stringify([run.info.term,run.info.ipa,run.info.speech||run.info.term]);
  const key=voiceKey+'|'+wordKey,previous=ipaEffectDurations.get(key),voice=ipaEffectVoices.get(voiceKey);
  const ratio=voice?.size>=2?ipaEffectClamp(ipaEffectMedian([...voice.values()]),.6,1.7):1;
  return {beats,total,base,voiceKey,wordKey,key,duration:previous?ipaEffectMedian(previous):ipaEffectClamp(base*ratio,350,6000)};
}
function ipaEffectRemember(run){
  const ms=performance.now()-run.started,t=run.timing;
  if(!t||run.unreliable||document.hidden||ms<250||ms>6000||ms<t.base*.4||ms>t.base*2.2)return;
  const samples=[...(ipaEffectDurations.get(t.key)||[]),ms].slice(-3);
  ipaEffectDurations.delete(t.key);ipaEffectDurations.set(t.key,samples);
  if(ipaEffectDurations.size>96)ipaEffectDurations.delete(ipaEffectDurations.keys().next().value);
  const voice=ipaEffectVoices.get(t.voiceKey)||new Map();voice.delete(t.wordKey);voice.set(t.wordKey,ipaEffectMedian(samples)/t.base);
  if(voice.size>7)voice.delete(voice.keys().next().value);
  ipaEffectVoices.delete(t.voiceKey);ipaEffectVoices.set(t.voiceKey,voice);
  if(ipaEffectVoices.size>8)ipaEffectVoices.delete(ipaEffectVoices.keys().next().value);
}
function ipaEffectBounds(slots){
  const rs=slots.map(s=>s.getBoundingClientRect());if(!rs.length)return null;
  const left=Math.min(...rs.map(r=>r.left)),right=Math.max(...rs.map(r=>r.right)),top=Math.min(...rs.map(r=>r.top)),bottom=Math.max(...rs.map(r=>r.bottom??r.top+r.height));
  return {left,right,top,bottom,width:right-left,height:bottom-top,wrapped:rs.some(r=>Math.abs(r.top-top)>Math.max(5,r.height*.5))};
}
function ipaEffectPosition(run){
  if(!ipaEffectCurrent(run)||!run.nodes.length)return;
  const rows=[];
  for(const node of run.nodes){
    const r=ipaEffectBounds(node.slots);if(!r)continue;
    const left=Math.max(8,r.left),right=Math.min(window.innerWidth-8,r.right),width=Math.max(20,right-left);
    Object.assign(node.el.style,{left:left+'px',top:(r.top-5)+'px',width:width+'px',height:(r.height+10)+'px'});
    node.el.style.fontSize='';
    if(node.whole||node.part.silent)continue;
    if(r.wrapped){ipaEffectBuild(run,true);return;}
    let row=rows.find(x=>Math.abs(x.top-r.top)<5);
    if(!row){row={top:r.top,left,right,items:[]};rows.push(row);}
    row.left=Math.min(row.left,left);row.right=Math.max(row.right,right);
    // offsetWidth is unaffected by the pop animation. Reserve its peak width.
    const natural=node.text.offsetWidth*1.06;
    row.items.push({node,center:(left+right)/2,natural,base:parseFloat(getComputedStyle(node.el).fontSize)||25});
  }
  // Share spare space across the word, then use ONE scale for every segment.
  // Independently fitting a dense stressed segment made it smaller than its neighbours.
  const gap=3;
  let scale=1;
  for(const row of rows){
    const sum=row.items.reduce((s,x)=>s+x.natural,0);
    scale=Math.min(scale,(row.right-row.left-gap*(row.items.length-1))/Math.max(1,sum));
  }
  if(scale<.86){ipaEffectBuild(run,true);return;}
  for(const row of rows){
    let cursor=row.left,remaining=row.items.reduce((s,x)=>s+x.natural*scale,0)+gap*(row.items.length-1);
    for(const item of row.items){
      const width=item.natural*scale;
      const left=ipaEffectClamp(item.center-width/2,cursor,row.right-remaining);
      Object.assign(item.node.el.style,{left:left+'px',width:width+'px',fontSize:item.base*scale+'px'});
      cursor=left+width+gap;remaining-=width+gap;
    }
  }
}
function ipaEffectBuild(run,forceWhole=false){
  const slots=[...document.querySelectorAll('#hoeCtx .slot')];
  if(!slots.length)return false;
  // A resize may require a whole-IPA fallback. Keep speech and advance timers intact.
  const lit=run.nodes.some(n=>n.el.classList.contains('lit'));
  const finishing=run.nodes.some(n=>n.el.classList.contains('finishing'));
  if(run.layer)run.layer.remove();
  (run.touched||[]).forEach(el=>el.classList.remove('ipa-under','ipa-silent'));run.touched=[];run.nodes=[];
  const letters=run.info.term.replace(/[^A-Za-z]/g,'').length;
  let whole=forceWhole||run.map.mode==='whole'||slots.length!==letters;
  if(!whole)whole=run.map.parts.some(p=>p.end>slots.length||p.end<=p.start||ipaEffectBounds(slots.slice(p.start,p.end))?.wrapped);
  const layer=document.createElement('div');layer.className='ipa-effect-layer';layer.setAttribute('aria-hidden','true');document.body.appendChild(layer);run.layer=layer;
  const parts=whole?[{ipa:run.info.displayIpa||run.info.ipa,start:0,end:slots.length,beat:0,weight:1}]:run.map.parts;
  for(const part of parts){
    const el=document.createElement('span');el.className='ipa-trace'+(whole?' ipa-whole':'')+(part.stress?' strong':part.secondary?' secondary':'')+(part.silent?' silent':'');
    const text=document.createElement('span');text.className='ipa-sound';
    if(whole)text.innerHTML=ipaEffectStressMarkup(part.ipa);else text.textContent=part.silent?'묵음':part.ipa;
    el.appendChild(text);layer.appendChild(el);run.nodes.push({el,text,part,whole,slots:slots.slice(part.start,part.end)});
  }
  ipaEffectPosition(run);
  if(lit)ipaEffectLight(run,0,true);
  if(finishing)run.nodes.forEach(n=>n.el.classList.add('finishing'));
  return true;
}
function ipaEffectLight(run,beat,all=false){
  if(!ipaEffectCurrent(run))return;
  for(const n of run.nodes)if(!n.part.silent&&n.el.classList.contains('lit'))n.el.classList.add('past');
  for(const n of run.nodes){if(!all&&!n.part.silent&&n.part.beat!==beat)continue;
    n.el.classList.add('lit');n.el.classList.remove('past');
    for(const slot of n.slots){slot.classList.add(n.part.silent?'ipa-silent':'ipa-under');run.touched.push(slot);}
  }
}
function ipaEffectStart(run,u){
  if(!ipaEffectCurrent(run)||run.finished||run.started!==null||document.hidden)return;
  run.started=performance.now();run.map=ipaEffectMap(run.info);run.timing=ipaEffectTiming(run,u);
  if(!ipaEffectBuild(run))return;
  if(run.nodes[0]?.whole){ipaEffectLight(run,0);return;}
  const {duration,total,beats}=run.timing,active=duration-Math.min(140,duration*.12);let offset=0;
  for(const [beat,weight] of [...beats].sort((a,b)=>a[0]-b[0])){const at=offset;if(!at)ipaEffectLight(run,beat);else ipaEffectLater(run,()=>ipaEffectLight(run,beat),at);offset+=active*weight/total;}
}
function ipaEffectFinish(run,error=false){
  if(!ipaEffectCurrent(run)||run.finished)return;
  run.finished=true;clearTimeout(run.watchdog);
  if(!error&&run.started!==null)ipaEffectRemember(run);
  (run.visualTimers||[]).forEach(clearTimeout);run.visualTimers=[];
  if(error){ipaEffectClearVisual(run);return;}
  run.nodes.forEach(n=>n.el.classList.add('finishing'));
  ipaEffectLater(run,()=>ipaEffectClearVisual(run),250);
}
function ipaEffectAttach(u,run){
  if(!run)return;
  const start=u.onstart,end=u.onend,error=u.onerror,pause=u.onpause;
  u.onstart=e=>{if(!ipaEffectCurrent(run)||run.finished)return;start?.(e);ipaEffectStart(run,u);};
  u.onend=e=>{end?.(e);ipaEffectFinish(run);};
  u.onerror=e=>{error?.(e);ipaEffectFinish(run,true);};
  u.onpause=e=>{pause?.(e);if(ipaEffectCurrent(run)){run.unreliable=true;ipaEffectFinish(run,true);}};
  run.watchdog=setTimeout(()=>{if(ipaEffectCurrent(run)&&!run.finished){run.unreliable=true;ipaEffectFinish(run,true);}},7500);
}
function ipaEffectSilent(info,valid){
  const run=ipaEffectRequest(info,valid);if(!run)return;
  run.finished=true;run.map=ipaEffectMap(info);
  if(ipaEffectBuild(run)){ipaEffectLight(run,0,true);ipaEffectLater(run,()=>ipaEffectClearVisual(run),1200);}
}
function ipaEffectCancelAdvance(){if(ipaEffectGate)clearTimeout(ipaEffectGate.timer);ipaEffectGate=null;}
function ipaEffectAdvance(next,valid){
  ipaEffectCancelAdvance();if(!valid())return;
  const first=ipaEffectRun,now=performance.now();
  const gate={next,valid,deadline:Math.max(now,first?.created||now)+6000,timer:null};ipaEffectGate=gate;
  function poll(){
    if(ipaEffectGate!==gate)return;
    if(!valid()){ipaEffectCancelAdvance();return;}
    const run=ipaEffectRun;
    if(!ipaEffectCurrent(run)||run.finished){ipaEffectCancelAdvance();next();return;}
    const deadline=Math.min(gate.deadline,run.started===null?run.created+2500:Math.min(run.created+7500,run.started+6000));
    if(document.hidden||performance.now()>=deadline){
      run.unreliable=true;ipaEffectFinish(run,true);
      try{window.speechSynthesis?.cancel();}catch(e){}
      ipaEffectCancelAdvance();next();return;
    }
    gate.timer=setTimeout(poll,60);
  }
  poll();
}
window.addEventListener('resize',()=>{if(ipaEffectRun)ipaEffectPosition(ipaEffectRun);});
window.addEventListener('scroll',()=>{if(ipaEffectRun)ipaEffectPosition(ipaEffectRun);},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&ipaEffectRun){ipaEffectRun.unreliable=true;ipaEffectFinish(ipaEffectRun,true);ipaEffectClearVisual(ipaEffectRun);}});
if(typeof ResizeObserver!=='undefined'&&document.querySelector('#quizCard'))new ResizeObserver(()=>{if(ipaEffectRun)ipaEffectPosition(ipaEffectRun);}).observe(document.querySelector('#quizCard'));

function ipaEffectEscape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function ipaEffectStressMarkup(ipa){return String(ipa||'').split(/([\s/·;(),]+)/).map(s=>/[ˈˌ]/.test(s)?ipaEffectStressWord(s):ipaEffectEscape(s)).join('');}
function ipaEffectStressWord(ipa){if(!ipa)return"";if(ipa.indexOf(".")>=0)return ipa.split(".").map(sy=>ipaEffectStressWord(sy)).join(".");/* 음절 점 없는 IPA: ˈ(주강세)→<b>, ˌ(부강세)→<i>. 핵모음(이중모음 포함)+최대 두음 원리로 코다 결정 */var V="aeiouæɑɒɔəɛɪʊʌɚɝɜ",DIP={"eɪ":1,"aɪ":1,"ɔɪ":1,"aʊ":1,"oʊ":1,"əʊ":1,"ɪə":1,"eə":1,"ʊə":1},ON2={"pr":1,"pl":1,"pj":1,"br":1,"bl":1,"bj":1,"tr":1,"tw":1,"tj":1,"dr":1,"dw":1,"dj":1,"kr":1,"kl":1,"kw":1,"kj":1,"ɡr":1,"ɡl":1,"ɡw":1,"ɡj":1,"fr":1,"fl":1,"fj":1,"θr":1,"θw":1,"ʃr":1,"sp":1,"st":1,"sk":1,"sm":1,"sn":1,"sl":1,"sw":1,"sf":1,"sj":1,"vj":1,"mj":1,"nj":1,"hj":1,"lj":1,"hw":1,"tʃ":1,"dʒ":1},ON3={"spr":1,"spl":1,"str":1,"skr":1,"skw":1,"spj":1,"stj":1,"skj":1};function isV(c){return V.indexOf(c)>=0;}function onsetLen(cl){for(var n=Math.min(3,cl.length);n>0;n--){var s=cl.slice(-n);if(n==1&&s!="ŋ"||n==2&&ON2[s]||n==3&&ON3[s])return n;}return 0;}var out="",i=0,n=ipa.length;while(i<n){var ch=ipa[i];if(ch!=="ˈ"&&ch!=="ˌ"){out+=ipaEffectEscape(ch);i++;continue;}var tag=ch==="ˈ"?"b":"i",j=i+1;while(j<n&&!isV(ipa[j])&&ipa[j]!=="ˈ"&&ipa[j]!=="ˌ")j++;var k=j;if(k<n&&isV(ipa[k])){k++;if(k<n&&DIP[ipa[k-1]+ipa[k]])k++;while(k<n&&/[ːˑ\u0300-\u036f]/.test(ipa[k]))k++;}var m=k;while(m<n&&!isV(ipa[m])&&ipa[m]!=="ˈ"&&ipa[m]!=="ˌ")m++;var end=(m>=n||ipa[m]==="ˈ"||ipa[m]==="ˌ")?m:m-onsetLen(ipa.slice(k,m));if(end<k)end=k;out+="<"+tag+">"+ipaEffectEscape(ipa.slice(i,end))+"</"+tag+">";i=end;}return out;}
