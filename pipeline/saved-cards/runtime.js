/* Personal cards refer to the current course content; they never enter DATA or progress. */
var savedStoreKey=STORAGE+'-saved-cards-v1';
var savedCatalog=new Map(),savedRecords=[];
var savedSearchIndex=null,savedSearchQuery='',savedSearchUI=null,savedSearchTimer=null;
function savedRead(){
  try{const rows=JSON.parse(localStorage.getItem(savedStoreKey)||'[]');
    if(!Array.isArray(rows))return [];
    const seen=new Set();return rows.filter(r=>r&&typeof r.id==='string'&&!seen.has(r.id)&&seen.add(r.id)).map(r=>({id:r.id,addedAt:Number(r.addedAt)||0}));
  }catch{return [];}
}
function savedInit(){
  savedSearchIndex=null;
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
    }else scheduleNext(1500); // 교재의 정상 공개 대기(1500)와 같아야 발음 끝까지 기다린다(26.10.08 복원)
  }else focusAnswerInput();
  return true;
}
function savedRenderHome(){
  savedRenderSearch();
  const b=document.createElement('button');b.type='button';b.className='lessonbtn saved-home';
  const count=savedItems().length;
  b.innerHTML='<span class="lh"><b class="lid">★ 모아둔 카드</b></span>';
  const meta=document.createElement('span');meta.className='lmeta';meta.textContent=count+'카드 · 다시 학습';b.appendChild(meta);savedSearchUI.homeCount=meta;
  b.onclick=savedOpen;$('#lessonGrid').appendChild(b);
}
function savedCardDetails(item,originalMeaning=false){
  const details=document.createElement('details'),summary=document.createElement('summary'),word=item.word;
  summary.textContent=word.term+' · '+word.meaning;details.appendChild(summary);
  const source=document.createElement('p');source.className='saved-source';source.textContent=item.source;details.appendChild(source);
  const original=originalMeaning&&word.originalMeaning&&word.originalMeaning!==word.meaning?'원래 뜻: '+word.originalMeaning:'';
  for(const text of [original,word.context?.example||(word.ex||'').split('{{BLANK}}').join(word.term),word.context?.translation||word.tr,word.context?.note||word.c]){
    if(!text)continue;const p=document.createElement('p');p.textContent=text;details.appendChild(p);
  }
  return details;
}
function savedSearchKey(value){return String(value||'').normalize('NFKC').toLowerCase().replace(/[’‘`´]/g,"'").replace(/[‐‑‒–—−]/g,'-').replace(/\s+/g,' ').trim();}
function savedSearchFind(value){
  const query=savedSearchKey(value);if(!/[\p{L}\p{N}]/u.test(query))return [];
  // Index the already loaded course lazily. Examples and notes are deliberately
  // excluded: a word merely mentioned in an explanation is not its headword.
  if(!savedSearchIndex)savedSearchIndex=Array.from(savedCatalog.values(),(item,order)=>{
    const heads=[...new Set([item.word.word,item.word.term].filter(Boolean).map(savedSearchKey))];
    return {item,order,heads,compact:heads.map(s=>s.replace(/[\s'-]/g,'')),meanings:[item.word.meaning,item.word.originalMeaning].filter(Boolean).map(savedSearchKey)};
  });
  const compact=query.replace(/[\s'-]/g,''),matches=[];
  for(const row of savedSearchIndex){
    const rank=row.heads.some(h=>h===query)?0:row.heads.some(h=>h.startsWith(query))?1:row.heads.some(h=>h.includes(query))?2:
      compact&&row.compact.includes(compact)?3:row.meanings.some(m=>m.includes(query))?4:-1;
    if(rank>=0)matches.push({item:row.item,rank,order:row.order});
  }
  return matches.sort((a,b)=>a.rank-b.rank||a.order-b.order).map(row=>row.item);
}
function savedSearchRefresh(){
  const ui=savedSearchUI;if(!ui)return;
  const count=savedItems().length;
  if(ui.homeCount)ui.homeCount.textContent=count+'카드 · 다시 학습';
  ui.collection.textContent='모아둔 카드 · '+count;
  for(const {item,button} of ui.buttons){
    const on=savedHas(item.id);button.textContent=on?'★ 담김':'☆ 담기';
    button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',item.word.term+(on?' 카드 빼기':' 카드 담기'));
  }
}
function savedSearchMore(){
  const ui=savedSearchUI;if(!ui)return;
  const next=ui.matches.slice(ui.shown,ui.shown+24);
  for(const item of next){
    const row=document.createElement('div');row.className='saved-row';row.appendChild(savedCardDetails(item,true));
    const button=document.createElement('button');button.type='button';button.className='saved-remove';
    button.onclick=()=>{if(savedSet(item.id,!savedHas(item.id)))savedSearchRefresh();};
    row.appendChild(button);ui.cards.appendChild(row);ui.buttons.push({item,button});
  }
  ui.shown+=next.length;ui.more.hidden=ui.shown>=ui.matches.length;
  ui.more.textContent='더 보기 ('+ui.shown+'/'+ui.matches.length+')';savedSearchRefresh();
}
function savedSearchRun(){
  clearTimeout(savedSearchTimer);savedSearchTimer=null;
  const ui=savedSearchUI;if(!ui||ui.composing)return;
  savedSearchQuery=ui.input.value;const active=!!savedSearchQuery.trim();
  $('#lessonGrid').classList.toggle('saved-search-active',active);ui.clear.hidden=!active;ui.results.hidden=!active;
  ui.cards.innerHTML='';ui.buttons=[];ui.shown=0;ui.matches=active?savedSearchFind(savedSearchQuery):[];
  ui.status.textContent=ui.matches.length?SAVED_COURSE+' 전체 · '+ui.matches.length+'카드':'찾은 카드가 없어.';
  if(active)savedSearchMore();
}
function savedRenderSearch(){
  clearTimeout(savedSearchTimer);savedSearchTimer=null;
  const wrap=document.createElement('div');wrap.className='saved-search';
  const form=document.createElement('form');form.className='saved-search-form';form.setAttribute('role','search');
  const input=document.createElement('input');input.type='search';input.placeholder='단어·뜻 검색';input.value=savedSearchQuery;
  input.setAttribute('aria-label','단어·뜻 검색');input.setAttribute('autocomplete','off');input.setAttribute('autocapitalize','none');input.setAttribute('spellcheck','false');input.setAttribute('enterkeyhint','search');
  const clear=document.createElement('button');clear.type='button';clear.className='saved-remove';clear.textContent='닫기';clear.setAttribute('aria-label','검색 닫기');
  form.appendChild(input);form.appendChild(clear);wrap.appendChild(form);
  const results=document.createElement('div');results.className='saved-search-results';
  const tools=document.createElement('div');tools.className='saved-search-tools';
  const status=document.createElement('span');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const collection=document.createElement('button');collection.type='button';collection.className='saved-remove';collection.onclick=savedOpen;
  tools.appendChild(status);tools.appendChild(collection);results.appendChild(tools);
  const cards=document.createElement('div');cards.className='saved-search-list';results.appendChild(cards);
  const more=document.createElement('button');more.type='button';more.className='saved-remove saved-search-more';more.onclick=savedSearchMore;results.appendChild(more);wrap.appendChild(results);
  savedSearchUI={input,clear,results,status,collection,cards,more,buttons:[],matches:[],shown:0,composing:false};$('#lessonGrid').appendChild(wrap);
  input.oninput=()=>{clearTimeout(savedSearchTimer);if(!savedSearchUI.composing)savedSearchTimer=setTimeout(savedSearchRun,120);};
  input.addEventListener('compositionstart',()=>{savedSearchUI.composing=true;clearTimeout(savedSearchTimer);});
  input.addEventListener('compositionend',()=>{savedSearchUI.composing=false;savedSearchRun();});
  clear.onclick=()=>{input.value='';savedSearchRun();input.focus();};
  input.addEventListener('keydown',event=>{if(event.key==='Escape'&&!event.isComposing&&!savedSearchUI.composing){event.preventDefault();clear.onclick();}});
  form.onsubmit=event=>{event.preventDefault();savedSearchRun();};
  savedSearchRun();savedSearchRefresh();
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
    const details=savedCardDetails(item),word=item.word;
    const remove=document.createElement('button');remove.type='button';remove.className='saved-remove';remove.textContent='빼기';remove.setAttribute('aria-label',word.term+' 카드 빼기');
    remove.onclick=()=>{if(savedSet(item.id,false)){state.session=null;savedRenderList();}};
    row.appendChild(details);row.appendChild(remove);cards.appendChild(row);
  });
  list.appendChild(cards);return true;
}
window.addEventListener('storage',event=>{
  if(event.key!==savedStoreKey&&event.key!==null)return;
  savedRecords=savedRead();savedSyncCat();
  if(screens.home.classList.contains('active'))savedSearchRefresh();
  if(state.savedLesson&&screens.lesson.classList.contains('active')){state.session=null;savedRenderList();}
});
