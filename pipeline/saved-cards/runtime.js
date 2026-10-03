/* Personal cards refer to the current course content; they never enter DATA or progress. */
var savedStoreKey=STORAGE+'-saved-cards-v1';
var savedCatalog=new Map(),savedRecords=[];
function savedRead(){
  try{const rows=JSON.parse(localStorage.getItem(savedStoreKey)||'[]');
    if(!Array.isArray(rows))return [];
    const seen=new Set();return rows.filter(r=>r&&typeof r.id==='string'&&!seen.has(r.id)&&seen.add(r.id)).map(r=>({id:r.id,addedAt:Number(r.addedAt)||0}));
  }catch{return [];}
}
function savedInit(){
  savedCatalog.clear();
  state.lessons.forEach(L=>L.exercises.forEach(e=>e.words.forEach((w,index)=>{
    const id=w.savedId||(SAVED_COURSE==='FABLE'
      ?JSON.stringify([e.progressId||L.progressId||L.id,e.parentRecord?.title||e.progressTitle||e.sourceTitle||e.title,w.word||w.term,w.si||1,w.unitId||w.constructionId||''])
      :JSON.stringify([L.lesson,e.scope,e.ex,index]));
    w.savedCardId=id;
    savedCatalog.set(id,{id,word:w,source:L.id+' · '+e.title});
  })));
  savedRecords=savedRead();savedSyncCat();
}
function savedItems(){return savedRecords.map(r=>savedCatalog.get(r.id)).filter(Boolean);}
function savedHas(id){return savedRecords.some(r=>r.id===id);}
function savedSet(id,on){
  if(!savedCatalog.has(id))return false;
  const records=savedRead().filter(r=>r.id!==id);
  if(on)records.push({id,addedAt:Date.now()});
  try{localStorage.setItem(savedStoreKey,JSON.stringify(records));}
  catch{toast('카드를 저장하지 못했어. 브라우저 저장 공간을 확인해줘.');return false;}
  savedRecords=records;savedSyncCat();return true;
}
function savedCurrentWord(){const s=state.session;return s&&s.currentId!==null?s.words[s.currentId]:null;}
function savedSyncCat(){
  const button=$('#catSubmit'),word=savedCurrentWord();if(!button)return;
  const active=!!word?.savedCardId,on=active&&savedHas(word.savedCardId);
  button.disabled=!active;button.setAttribute('aria-pressed',String(!!on));
  button.setAttribute('aria-label',on?'모아둔 카드에서 빼기':'이 카드 담기');
  button.title=on?'모아둔 카드에서 빼기':'이 카드 담기';
}
function savedToggleCurrent(){
  const w=savedCurrentWord();if(!w?.savedCardId)return false;
  const on=!savedHas(w.savedCardId);if(!savedSet(w.savedCardId,on))return false;
  toast(on?'모아뒀다고양!':'모아둔 카드에서 뺐다고양.');
  const s=state.session;
  // Give the save action its own feedback time; a tap must not also advance.
  if(s.answered&&!s.copyMode){
    if(typeof armReveal==='function'){
      if(s.revealTimer)clearTimeout(s.revealTimer);
      ipaEffectCancelAdvance();armReveal(w);
    }else scheduleNext(1200);
  }else focusAnswerInput();
  return true;
}
function savedRenderHome(){
  const b=document.createElement('button');b.type='button';b.className='lessonbtn saved-home';
  const count=savedItems().length;
  b.innerHTML='<span class="lh"><b class="lid">★ 모아둔 카드</b></span><span class="lmeta">'+count+'카드 · 다시 학습</span>';
  b.onclick=savedOpen;$('#lessonGrid').appendChild(b);
}
function savedGroups(items){
  const groups=new Map();for(const item of items){
    const head=(item.word.word||item.word.term).toLowerCase();
    if(!groups.has(head))groups.set(head,[]);groups.get(head).push(item.word);
  }
  const parts=[];let words=[];
  for(const group of groups.values()){
    if(words.length&&words.length+group.length>12){parts.push(words);words=[];}
    words.push(...group);
  }
  if(words.length)parts.push(words);
  return parts.map((words,i)=>({title:'복습 '+(i+1),scope:'2026',words}));
}
function savedOpen(){
  stopTicker();state.session=null;savedRecords=savedRead();
  state.savedLesson={id:'모아둔 카드',kind:'saved',name:'',exercises:savedGroups(savedItems())};
  state.ei=0;
  $('#lessonTitle').textContent='모아둔 카드';
  savedRenderList();show('lesson');
}
function savedCopyText(){
  return [SAVED_COURSE+' · 모아둔 카드',...savedItems().map((item,i)=>{
    const w=item.word,example=w.context?.example||(w.ex||'').split('{{BLANK}}').join(w.term);
    return [(i+1)+'. '+w.term+' — '+w.meaning,item.source,example,w.context?.translation||w.tr,w.context?.note||w.c].filter(Boolean).join('\n');
  })].join('\n\n');
}
async function savedCopy(){
  const text=savedCopyText();
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);toast('목록을 복사했어.');return;}}catch{}
  // The selectable fallback also works in browsers without Clipboard API access.
  let box=$('#savedCopyBox');
  if(!box){box=document.createElement('textarea');box.id='savedCopyBox';box.className='saved-copy-box';box.readOnly=true;box.setAttribute('aria-label','모아둔 카드 목록');$('#exList').appendChild(box);}
  box.value=text;box.focus();box.select();
  try{if(document.execCommand?.('copy')){toast('목록을 복사했어.');return;}}catch{}
  toast('목록을 선택해 복사해줘.');
}
function savedRenderList(){
  const L=state.savedLesson;
  if(!L){$('#exList').classList.remove('saved-mode');return false;}
  // Only rebuild after leaving play. Removing a saved card never mutates a live queue.
  if(!state.session){savedRecords=savedRead();L.exercises=savedGroups(savedItems());}
  const items=savedItems(),list=$('#exList');list.innerHTML='';list.classList.add('saved-mode');
  $('#lessonMeta').textContent=items.length+'개 카드 · 이 브라우저에 저장';
  if(!items.length){const p=document.createElement('p');p.className='saved-empty';p.textContent='다시 보고 싶은 카드에서 고양이를 눌러줘.';list.appendChild(p);return true;}
  const tools=document.createElement('div');tools.className='saved-tools';
  const copy=document.createElement('button');copy.type='button';copy.className='saved-remove';copy.textContent='목록 복사';copy.onclick=savedCopy;tools.appendChild(copy);list.appendChild(tools);
  L.exercises.forEach((ex,i)=>{
    const button=document.createElement('button');button.type='button';button.className='exbtn';
    button.innerHTML='<span class="t">'+esc(ex.title)+'</span><span class="meta">'+ex.words.length+'개 · 다시 학습 ▶</span>';
    button.onclick=()=>startExercise(i);list.appendChild(button);
  });
  const cards=document.createElement('div');cards.className='saved-list';
  items.forEach(item=>{
    const row=document.createElement('div');row.className='saved-row';
    const details=document.createElement('details'),summary=document.createElement('summary');
    const word=item.word;summary.textContent=word.term+' · '+word.meaning;details.appendChild(summary);
    const source=document.createElement('p');source.className='saved-source';source.textContent=item.source;details.appendChild(source);
    for(const text of [word.context?.example||(word.ex||'').split('{{BLANK}}').join(word.term),word.context?.translation||word.tr,word.context?.note||word.c]){
      if(!text)continue;const p=document.createElement('p');p.textContent=text;details.appendChild(p);
    }
    const remove=document.createElement('button');remove.type='button';remove.className='saved-remove';remove.textContent='빼기';remove.setAttribute('aria-label',word.term+' 카드 빼기');
    remove.onclick=()=>{if(savedSet(item.id,false)){state.session=null;savedRenderList();}};
    row.appendChild(details);row.appendChild(remove);cards.appendChild(row);
  });
  list.appendChild(cards);return true;
}
window.addEventListener('storage',event=>{
  if(event.key!==savedStoreKey&&event.key!==null)return;
  savedRecords=savedRead();savedSyncCat();
  if(screens.home.classList.contains('active'))renderHome();
  if(state.savedLesson&&screens.lesson.classList.contains('active')){state.session=null;savedRenderList();}
});
