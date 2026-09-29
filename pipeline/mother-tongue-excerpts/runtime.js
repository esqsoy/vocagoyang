/* Passage excerpts preserve original headword grading and exercise IDs. */
function mtAttachContexts(lessons){for(const l of lessons)for(const e of l.exercises)e.words.forEach((w,index)=>{const c=MT_CONTEXTS[[l.lesson,e.scope,e.ex,index].join('/')];w.originalMeaning=w.meaning;if(c){w.context=c;if(c.contextMeaning)w.meaning=c.contextMeaning;}});}
function mtCurrentWord(){const s=state.session;return s&&s.currentId!==null?s.words[s.currentId]:null;}
function mtRevealDelay(w){const c=w?.context;if(!c)return 1200;const chars=(c.translation||'').length+(c.note||'').length;return Math.min(state.session?.round>=2?3500:6500,Math.max(1200,500+chars*45));}
function mtEscapeRegex(v){return String(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function mtRanges(context,term=''){
 const text=context.example,ranges=[];
 const addAll=value=>{
  if(!value)return;
  const re=new RegExp('(^|[^A-Za-zÀ-ɏ])('+mtEscapeRegex(value)+')(?=$|[^A-Za-zÀ-ɏ])','gi');
  let m;while((m=re.exec(text))){const a=m.index+m[1].length,b=a+m[2].length;if(!ranges.some(r=>a<r[1]&&b>r[0]))ranges.push([a,b]);}
 };
 if(context.surfaceParts?.length){
  let after=0;for(const value of context.surfaceParts){const i=text.toLowerCase().indexOf(value.toLowerCase(),after);if(i<0)return [];ranges.push([i,i+value.length]);after=i+value.length;}
 }else addAll(context.surface);
 if(term&&/^[A-Za-z -]+$/.test(term))addAll(term);
 for(const surface of context.maskSurfaces||[])addAll(surface);
 return ranges.sort((a,b)=>a[0]-b[0]);
}
function mtSourceText(w,revealed=false){
 const c=w?.context;if(!c||!c.example)return '';
 const ranges=mtRanges(c,w.term);if(!ranges.length)return '';
 let text='',last=0;
 for(const [a,b] of ranges){text+=esc(c.example.slice(last,a));text+=revealed?'<strong class="mt-source-word">'+esc(c.example.slice(a,b))+'</strong>':'<span class="mt-gap" aria-label="학습 단어">[…]</span>';last=b;}
 text+=esc(c.example.slice(last));
 return text;
}
// A single input stays inside the excerpt. For the three separated phrases,
// conceal the intervening modifiers too, then restore the complete original span.
function mtInlineRanges(w){
 const c=w.context,ranges=mtRanges(c,w.term);
 if(!c.surfaceParts?.length)return ranges;
 let after=0;const parts=c.surfaceParts.map(part=>{const a=c.example.toLowerCase().indexOf(part.toLowerCase(),after);after=a+part.length;return [a,after];});
 const group=[parts[0][0],parts.at(-1)[1]];
 return [group,...ranges.filter(([a,b])=>b<=group[0]||a>=group[1])].sort((a,b)=>a[0]-b[0]);
}
function mtAnswerSlots(w){
 const c=w.context,[a,b]=mtInlineRanges(w)[0];
 if(!c.surfaceParts?.length)return blankSlots(c.example.slice(a,b),c.example.slice(a,b));
 let html='',last=a;
 for(const [start,end] of mtRanges(c,w.term).filter(([start,end])=>start>=a&&end<=b)){
  html+=esc(c.example.slice(last,start))+blankSlots(c.example.slice(start,end),c.example.slice(start,end));last=end;
 }
 return html+esc(c.example.slice(last,b));
}
function mtInlineSource(w,mode='question'){
 const c=w.context,ranges=mtInlineRanges(w);let text='',last=0;
 ranges.forEach(([a,b],i)=>{
  text+=esc(c.example.slice(last,a));
  if(i===0)text+='<span class="blanks'+(mode==='answer'?' revealed':'')+'">'+(mode==='answer'?mtAnswerSlots(w):blankSlots(w.term))+'</span>';
  else text+=mode==='question'?'<span class="mt-gap" aria-label="같은 학습 단어">[…]</span>':'<strong class="mt-source-word">'+esc(c.example.slice(a,b))+'</strong>';
  last=b;
 });
 return text+esc(c.example.slice(last));
}
function mtQuestionHtml(w,copy=false){
 if(!w.context)return '<div class="ex">'+slots(w.term)+'</div>';
 const c=w.context,kind=c.sourceKind==='choice'?'선택지':c.sourceKind==='footnote'?'주석':'';
 return (kind?'<div class="mt-source-kind">'+kind+'</div>':'')+'<div class="ex mt-source" title="원문 '+c.page+'쪽">'+mtInlineSource(w,copy?'copy':'question')+'</div>';
}
function mtNeedsWholePronunciation(w){
 if(!w?.context)return false;
 const c=w.context,[a,b]=mtInlineRanges(w)[0];
 return !!c.surfaceParts?.length||c.example.slice(a,b).toLowerCase()!==w.term.toLowerCase();
}
function mtRevealHtml(term,meaning){
 const c=mtCurrentWord()?.context;
 return c?.translation?'<div class="ov-tr mt-translation">'+esc(c.translation)+'</div>':'';
}
function mtSetCatSpeech(line){const speech=document.querySelector('#catSpeech');speech.textContent=mtCurrentWord()?.context?.note||line||'';speech.hidden=!speech.textContent;}
function mtRevealSource(){
 const w=mtCurrentWord(),source=document.querySelector('#hoeCtx .mt-source');
 if(!source||!w?.context)return false;
 source.innerHTML=mtInlineSource(w,'answer');
 const wrap=document.querySelector('#hoeCtx .blanks');
 if(wrap){wrap.innerHTML=mtAnswerSlots(w);wrap.classList.add('revealed');enableAnswerReplay(wrap,w.term);wrap.querySelectorAll('.slot-punctuation').forEach(el=>el.classList.add('shown'));}
 source.querySelectorAll('.mt-source-word').forEach(el=>enableAnswerReplay(el,w.term));
 return true;
}
