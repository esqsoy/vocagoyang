'use strict';
// Exercise the three complete applications: search refers to real course cards
// and saving a result must preserve the existing learning and collection paths.
const assert=require('node:assert/strict'),path=require('node:path');
const {harness,root}=require('./helpers/mother-tongue-harness.cjs');
const files=['vocagoyangfable.html','vocagoyangksat2027.html','vocagoyangebs2027.html'];
const ui=h=>h.run('savedSearchUI');
const catalog=h=>[...h.ctx.savedCatalog.values()];
const find=(h,q)=>[...h.ctx.savedSearchFind(q)];
const search=(h,q)=>{ui(h).input.value=q;h.ctx.savedSearchRun();return ui(h);};
const includes=(rows,item)=>rows.some(row=>row.id===item.id);
const textNodes=el=>[el,...(el.children||[]).flatMap(textNodes)];
const learning=h=>JSON.stringify({progress:h.state.progress,session:h.state.session,li:h.state.li,ei:h.state.ei,
 perfectStreak:h.state.perfectStreak,lessons:h.state.lessons.map(L=>[L.id,L.exercises.map(e=>[e.title,e.words.length])]),
 storage:Object.fromEntries(['STORAGE','LASTKEY','UNIKEY'].map(name=>{const key=h.run(name);return [key,h.storage.get(key)??null];}))});
const reports=[];

for(const file of files){
 const filename=path.join(root,file),h=harness(filename),all=catalog(h),first=all[0];
 const initialUI=ui(h);
 assert(initialUI.input&&initialUI.results,'Home contains the compact search control');
 assert(initialUI.results.hidden,'No result panel appears before a query');
 assert.equal(h.run('savedSearchIndex'),null,'Loading the home need not build the search index');
 assert.equal(initialUI.input.getAttribute('aria-label'),'단어·뜻 검색');
 assert.equal(initialUI.input.getAttribute('autocapitalize'),'none');
 assert.equal(initialUI.input.getAttribute('spellcheck'),'false');

 for(const query of ['', '   ', '---', "'", '!?.,', '☆'])assert.equal(find(h,query).length,0,'Empty or punctuation-only queries must not return the whole course');
 const key=first.word.term;
 assert(includes(find(h,key),first),'A full English headword finds its source card');
 assert(includes(find(h,'  '+key.toUpperCase()+'  '),first),'Headword search ignores case and surrounding spaces');
 const korean=all.find(item=>/[가-힣]{2,}/.test(item.word.meaning));
 const meaningQuery=korean.word.meaning.match(/[가-힣]{2,}/)[0];
 assert(includes(find(h,meaningQuery),korean),'Korean meaning search finds the source card');
 const phrase=all.find(item=>/\s/.test(item.word.term)),hyphen=all.find(item=>/-/.test(item.word.term));
 assert(phrase&&hyphen,'Real data supplies both spaced and hyphenated expressions');
 assert(includes(find(h,phrase.word.term.replace(/\s/g,'')),phrase),'An expression can be found without its spaces');
 assert(includes(find(h,hyphen.word.term.replace(/-/g,'')),hyphen),'A hyphenated headword can be found without hyphens');
 assert(includes(find(h,hyphen.word.term.replace(/-/g,'—')),hyphen),'A typographic dash finds the same expression');

 // Select a real short headword that is also part of another headword, so the
 // result order checks useful disambiguation rather than arbitrary fixtures.
 const prefixItem=all.find(item=>item.word.term.length>=2&&all.some(other=>other.word.term.length>item.word.term.length&&other.word.term.toLowerCase().startsWith(item.word.term.toLowerCase())));
 assert(prefixItem);
 const exactQuery=prefixItem.word.term.toLowerCase(),ranked=find(h,exactQuery);
 const exact=item=>[item.word.word,item.word.term].filter(Boolean).some(head=>head.toLowerCase()===exactQuery);
 assert(exact(ranked[0]),'Exact matches appear first');
 const firstPartial=ranked.findIndex(item=>!exact(item));
 assert(firstPartial>0);assert(ranked.slice(firstPartial).every(item=>!exact(item)),'No exact headword is hidden behind partial matches');

 let currentUI=search(h,'a');
 assert(currentUI.matches.length>48,'A broad real query exercises incremental results');
 assert.equal(currentUI.shown,24);assert.equal(currentUI.buttons.length,24);assert(!currentUI.more.hidden);
 currentUI.more.click();assert.equal(currentUI.shown,48);assert.equal(currentUI.buttons.length,48);
 assert.equal(new Set(currentUI.buttons.map(({item})=>item.id)).size,48,'More results do not duplicate cards');
 while(!currentUI.more.hidden)currentUI.more.click();
 assert.equal(currentUI.buttons.length,currentUI.matches.length,'Every match remains reachable');
 assert.equal(new Set(currentUI.buttons.map(({item})=>item.id)).size,currentUI.matches.length);
 currentUI=search(h,'zzzxnotawordxxx');assert.equal(currentUI.buttons.length,0);assert.equal(currentUI.status.textContent,'찾은 카드가 없어.');
 assert(currentUI.more.hidden);

 const before=learning(h);currentUI=search(h,key);
 const selected=currentUI.buttons.find(({item})=>item.id===first.id);assert(selected);
 const details=currentUI.cards.children.at(-currentUI.buttons.length).children[0];
 details.open=true;currentUI.input.focus();
 selected.button.click();assert(h.ctx.savedHas(first.id));assert.equal(selected.button.getAttribute('aria-pressed'),'true');
 assert.equal(currentUI.homeCount.textContent,'1카드 · 다시 학습');
 assert.equal(learning(h),before,'Searching and saving cannot change learning records or begin a session');
 assert.equal(ui(h),currentUI,'Saving does not recreate the search UI');assert(details.open,'Saving leaves expanded content open');
 assert.equal(currentUI.input.value,key);
 const savedKey=h.run('savedStoreKey'),seed=Object.fromEntries(h.storage);
 const reloaded=harness(filename,seed);assert(reloaded.ctx.savedHas(first.id),'Saved search result survives reload');
 assert.equal(reloaded.ctx.savedItems().length,1);
 const stored=JSON.parse(h.storage.get(savedKey));assert.deepEqual(Object.keys(stored[0]).sort(),['addedAt','id']);
 selected.button.click();assert(!h.ctx.savedHas(first.id));assert.equal(selected.button.getAttribute('aria-pressed'),'false');
 selected.button.click();assert.equal(h.ctx.savedItems().length,1,'Toggle save cannot create duplicate references');

 const oldSet=h.ctx.localStorage.setItem;
 h.ctx.localStorage.setItem=()=>{throw Error('QuotaExceededError');};
 selected.button.click();assert(h.ctx.savedHas(first.id),'Failed removal leaves the saved card present');
 assert.equal(selected.button.getAttribute('aria-pressed'),'true');
 h.ctx.localStorage.setItem=oldSet;selected.button.click();assert(!h.ctx.savedHas(first.id));
 h.ctx.localStorage.setItem=()=>{throw Error('QuotaExceededError');};
 selected.button.click();assert(!h.ctx.savedHas(first.id),'Failed save is not represented as successful');
 assert.equal(selected.button.getAttribute('aria-pressed'),'false');h.ctx.localStorage.setItem=oldSet;

 // Storage changes from another tab update result buttons without destroying
 // the query or open card. Existing learning keys remain untouched.
 h.storage.set(savedKey,JSON.stringify([{id:first.id,addedAt:1}]));
 for(const listener of h.events['win:storage']||[])listener({key:savedKey});
 assert.equal(ui(h),currentUI);assert.equal(currentUI.input.value,key);assert(details.open);
 assert.equal(selected.button.getAttribute('aria-pressed'),'true');assert.equal(learning(h),before);

 // Pending text input has a short debounce. Composition must not render
 // half-written Korean syllables or consume the IME confirmation key.
 currentUI.clear.click();assert(currentUI.results.hidden);assert.equal(currentUI.input.value,'');
 assert(!h.els.get('lessonGrid').classList.contains('saved-search-active'));
 currentUI.input.value=key;h.fire(currentUI.input,'input');h.advance(119);assert(currentUI.results.hidden);
 h.advance(1);assert(!currentUI.results.hidden);assert(includes(currentUI.matches,first));
 const priorIds=currentUI.matches.map(item=>item.id);
 h.fire(currentUI.input,'compositionstart');currentUI.input.value=meaningQuery;h.fire(currentUI.input,'input');h.advance(500);
 assert.deepEqual(currentUI.matches.map(item=>item.id),priorIds,'IME intermediate input does not rerender search');
 let prevented=false;h.fire(currentUI.input,'keydown',{key:'Escape',isComposing:true,preventDefault(){prevented=true;}});
 assert(!prevented);assert.equal(currentUI.input.value,meaningQuery);
 h.fire(currentUI.input,'compositionend');assert(includes(currentUI.matches,korean));
 h.fire(currentUI.input,'keydown',{key:'Escape',isComposing:false});assert(currentUI.results.hidden);assert.equal(currentUI.input.value,'');

 // A search result is still the original reference when a game session exists.
 // These hooks must never act as submission/next-card controls.
 h.start();const sessionBefore=learning(h);
 currentUI=search(h,key);currentUI.buttons.find(({item})=>item.id===first.id).button.click();
 assert.equal(learning(h),sessionBefore,'Search saving cannot grade or advance an existing session');

 // Result content is plain text; neither user input nor a future card edit is
 // allowed to turn the dictionary view into executable markup.
 const literal='<img src=x onerror="throw 1">';first.word.c=literal;
 const nodes=textNodes(h.ctx.savedCardDetails(first,true));
 assert(nodes.some(node=>node.textContent.includes(literal)));
 assert(nodes.every(node=>!node.innerHTML.includes(literal)));
 assert.doesNotThrow(()=>search(h,literal));
 reports.push({file,cards:all.length,englishAndKorean:true,pagination:24,saveReloadAndFailure:true,learningUnchanged:true,composition:true});
}

{
 const h=harness(path.join(root,files[0])),all=catalog(h);
 const other=all.find(item=>item.word.word==='other'&&item.word.term==='others');assert(other);
 assert(includes(find(h,'other'),other)&&includes(find(h,'others'),other),'Search accepts the canonical headword and displayed answer form');
 const same=all.filter(item=>item.word.term==='subject');assert(same.length>2&&new Set(same.map(item=>item.word.meaning)).size>1);
 const matches=find(h,'subject');assert(same.every(item=>includes(matches,item)),'Different senses and deliberate review cards remain separate search results');
 assert.equal(new Set(matches.map(item=>item.id)).size,matches.length);
 const uiBefore=search(h,'subject');
 for(const target of same.slice(0,2))uiBefore.buttons.find(({item})=>item.id===target.id).button.click();
 assert.equal(h.ctx.savedItems().length,2,'A learner can choose distinct senses of the same word');
 assert(includes(find(h,'a'),all.find(item=>item.word.term==='a')),'Single-letter headwords can be found');
}

{
 const h=harness(path.join(root,files[1])),all=catalog(h),official=all.find(item=>item.word.term==='official');
 assert(official&&official.word.originalMeaning.includes('공무원')&&!official.word.meaning.includes('공무원'));
 assert(includes(find(h,'공무원'),official),'The original textbook meaning remains searchable after context-specific narrowing');
 const details=textNodes(h.ctx.savedCardDetails(official,true));
 assert(details.some(node=>node.textContent==='원래 뜻: '+official.word.originalMeaning),'A match from the original meaning can be understood in the details');
 assert(details.some(node=>node.textContent===official.word.context.example),'Original passage is displayed verbatim');
 assert(details.some(node=>node.textContent===official.word.context.translation));
 const previous=all.find(item=>item.source.includes('이전기출')&&item.word.context);assert(previous);assert.equal(h.state.prevOn,false);
 const results=search(h,previous.word.term);while(!results.buttons.some(({item})=>item.id===previous.id)&&!results.more.hidden)results.more.click();
 results.buttons.find(({item})=>item.id===previous.id).button.click();
 assert.equal(h.state.prevOn,false,'Searching the full catalog does not change the normal textbook scope');
 h.ctx.savedOpen();h.ctx.startExercise(0);
 const restored=h.state.session.words.find(w=>w.savedCardId===previous.id);assert(restored);
 assert.equal(restored.context.example,previous.word.context.example);assert.equal(restored.originalMeaning,previous.word.originalMeaning);
}

console.log(JSON.stringify({cardSearch:reports,distinctSenses:true,canonicalAndDisplayedHeadword:true,originalMeaningAndPreviousPassages:true}));
