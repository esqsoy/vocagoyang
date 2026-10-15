'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const stampSource=fs.readFileSync(path.join(__dirname,'../set-stamp/runtime.js'),'utf8');
const audioSource=fs.readFileSync(path.join(__dirname,'runtime.js'),'utf8');
const noun='ˈrɛkɚd',verb='rɪˈkɔrd';
function harness(){
  let time=0,serial=0,seq=0,stops=0,screen='home';
  const timers=new Map(),nodes=new Map(),audios=[],native=[],spoken=[],shows=[],miss={record:3,cat:1};
  function node(id=''){
    const classes=new Set(),el={id,children:[],dataset:{},innerHTML:'',textContent:'',hidden:false,disabled:false,events:{},parentNode:null};
    el.classList={add:(...ns)=>ns.forEach(n=>classes.add(n)),remove:(...ns)=>ns.forEach(n=>classes.delete(n)),contains:n=>classes.has(n)};
    el.addEventListener=(n,fn)=>(el.events[n]??=[]).push(fn);
    el.setAttribute=()=>{};
    el.appendChild=b=>{el.children.push(b);b.parentNode=el;return b;};
    el.remove=()=>{if(el.parentNode)el.parentNode.children=el.parentNode.children.filter(x=>x!==el);};
    el.querySelectorAll=q=>q==='.st-row:not(.gone)'?el.children.filter(x=>!x.classList.contains('gone')):[];
    el.querySelector=()=>null;
    return el;
  }
  const $=q=>{if(!nodes.has(q))nodes.set(q,node(q));return nodes.get(q);};
  const body=node('body');
  class FakeAudio{
    constructor(){this.src='';this.duration=1;this.ended=false;this.playCount=0;this.pauseCount=0;audios.push(this);}
    play(){this.playCount++;return new Promise((resolve,reject)=>{this.resolve=resolve;this.reject=reject;});}
    pause(){this.pauseCount++;this.onpause?.();}
    load(){}
    removeAttribute(n){if(n==='src')this.src='';}
    emit(n){if(n==='ended')this.ended=true;this['on'+n]?.();}
  }
  const ctx=vm.createContext({console,$,state:{lessons:[],muted:false},location:{hash:''},CAT:{},B1_LAST:25,
    window:{Audio:FakeAudio,addEventListener(){}},document:{body,createElement:node,querySelector:$,addEventListener(){}},
    PRONUNCIATION_AUDIO_MAP:{['record\t'+noun]:{src:'record-n.mp3',duration:1},['record\t'+verb]:{src:'record-v.mp3',duration:1}},
    setTimeout(fn,ms){const id=++serial;timers.set(id,{fn,at:time+ms});return id;},clearTimeout:id=>timers.delete(id),
    esc:s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
    msMissed:()=>miss,msHead:w=>String(w.term??w.word??w.en??'').toLowerCase(),visEx:L=>L.exercises,
    finishExercise(){},showEnding(){},renderHome(){},show(n){screen=n;if(n==='game')body.classList.add('playing');else body.classList.remove('playing');},setCat(){},fxHeart(){}});
  vm.runInContext(audioSource,ctx);
  ctx.stopFablePronunciation=()=>{stops++;seq++;ctx.exceptionAudioCancel();};
  // Match FABLE's review contract: an exact optional IPA selects the clip;
  // cancellation invalidates both active playback and any delayed fallback.
  ctx.speak=(term,ipa)=>{
    ctx.stopFablePronunciation();spoken.push({term,ipa});if(ctx.state.muted)return;
    const owner=seq,at=screen,valid=()=>owner===seq&&screen===at&&!ctx.state.muted;
    const fallback=()=>{if(valid())native.push(term);};
    if(!ctx.exceptionAudioPlay({term,ipa},null,valid,fallback))fallback();
  };
  vm.runInContext(stampSource,ctx);
  ctx.stShow=(L,r)=>shows.push({L,r});
  function advance(ms){const end=time+ms;for(;;){const next=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;time=next[1].at;timers.delete(next[0]);next[1].fn();}time=end;}
  function open(L){
    ctx.stOpenSheet(L);const box=$('#stSheetList');box.children=[];
    return ctx.stMissList(L,null).map(r=>{const b=node();b.dataset={t:r.term,ipa:r.ipa};b.classList.add('st-row');box.appendChild(b);return b;});
  }
  return {ctx,miss,nodes,audios,native,spoken,shows,advance,open,get stops(){return stops;}};
}
const lesson=words=>({id:'35세트',lesson:35,exercises:[{words}]});
const nounCard={term:'record',meaning:'기록',ipa:noun},verbCard={term:'record',meaning:'기록하다',ipa:verb};
async function main(){
  {
    const h=harness(),L=lesson([nounCard,{...nounCard,meaning:'기록물'},{...nounCard},{term:'unmissed',meaning:'다른 단어',ipa:'x'}]);
    const rows=h.ctx.stMissList(L,null);assert.equal(rows.length,1);assert.equal(rows[0].ipa,noun);assert.equal(rows[0].mean.join(' / '),'기록 / 기록물');assert.equal(rows[0].n,3);
    const html=h.ctx.stRows(rows);assert(html.includes('data-ipa="'+noun+'"'));assert(html.includes('<span>기록 / 기록물</span>'));
    assert(!Object.hasOwn(rows[0],'ipas'),'Internal aggregation must not leak into display rows');
    assert.equal(h.audios.length,0,'Listing missed words must not preload the whole set');
    const [row]=h.open(L);h.ctx.stTap(row);assert.equal(h.spoken[0].ipa,noun);assert.equal(h.audios.at(-1).src,'record-n.mp3');assert.equal(h.native.length,0);
    h.ctx.stTap(row);assert.equal(h.spoken.length,1,'Dismissed row must not replay');
  }
  for(const words of [[nounCard,verbCard],[nounCard,{term:'record',meaning:'다른 뜻'}],[{term:'record',meaning:'기록'}]]){
    const h=harness(),L=lesson(words),rows=h.ctx.stMissList(L,null);assert.equal(rows.length,1);assert.equal(rows[0].ipa,'','Unresolved combined senses must not guess an IPA');
    const [row]=h.open(L);h.ctx.stTap(row);assert.equal(h.spoken[0].ipa,'');assert.equal(h.audios.length,0);assert.deepEqual(h.native,['record']);
  }
  {
    const h=harness(),L=lesson([{en:'cat',ko:'고양이',ipa:'kæt'},{en:'new',ko:'새로운',ipa:'nu'}]);
    const rows=h.ctx.stMissList(L,{words:[{en:'new',wrongEver:true}]});assert.equal(rows.length,2);assert.equal(rows[0].ipa,'kæt');assert.equal(rows[1].term,'new');
    const html=h.ctx.stRows([{term:'a"b',mean:['<뜻>'],n:1,ipa:'x"y'}]);assert(html.includes('data-ipa="x&quot;y"'));assert(html.includes('&lt;뜻&gt;'));
  }
  for(const action of ['close-button','new-game','replace-sheet']){
    const h=harness(),L=lesson([nounCard]),[row]=h.open(L);h.ctx.stTap(row);
    const a=h.audios.at(-1),lateError=a.onerror,latePlaying=a.onplaying;h.advance(300); // Last-row stamp transition is pending.
    if(action==='close-button')h.nodes.get('#stSheetClose').onclick({type:'click'});
    if(action==='new-game')h.ctx.show('game');
    if(action==='replace-sheet')h.open(lesson([verbCard]));
    assert(a.pauseCount&&a.src==='',action+' must stop the previous audio');
    latePlaying();lateError();a.reject(Error('late'));await Promise.resolve();await Promise.resolve();
    h.advance(1500);assert.equal(h.native.length,0,action+' must not resurrect TTS');assert.equal(h.shows.length,0,action+' must invalidate the old stamp timer');
  }
  {
    const h=harness(),[row]=h.open(lesson([nounCard]));h.ctx.stTap(row);const a=h.audios.at(-1);a.emit('playing');
    h.advance(510);assert.equal(h.shows.length,1,'Normal final tap must still show its stamp');assert.equal(h.ctx.stSheetOpen,false);
    assert.equal(a.pauseCount,0,'Automatic stamp transition must not truncate its last pronunciation');a.emit('ended');assert.equal(h.native.length,0);
  }
  {
    const h=harness(),[old]=h.open(lesson([nounCard]));h.ctx.stTap(old);h.advance(100);
    const [fresh]=h.open(lesson([verbCard]));h.advance(200);
    assert(!h.ctx.stReview.done,'An old row removal must not finish a different review sheet');assert(!fresh.classList.contains('gone'));assert.equal(h.shows.length,0);
  }
  {
    const h=harness();h.open(lesson([]));h.advance(100);h.ctx.stCloseSheet();
    const [fresh]=h.open(lesson([nounCard])),review=h.ctx.stReview;h.advance(1000);
    assert.equal(h.ctx.stReview,review,'An old empty-sheet timer must not close its replacement');
    assert(!review.done,'An old empty-sheet timer must not finish unread rows');assert(!fresh.classList.contains('gone'));assert.equal(h.shows.length,0);
    h.ctx.stCloseSheet();h.open(lesson([]));h.advance(850);assert.equal(h.shows.length,1,'The current empty sheet must still receive its stamp');
  }
  console.log('PASS set-stamp pronunciation: unique IPA aggregation, ambiguous/missing IPA native fallback, unchanged row content, no eager audio, close/new-game/replacement cancellation, and valid final-stamp transition.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
