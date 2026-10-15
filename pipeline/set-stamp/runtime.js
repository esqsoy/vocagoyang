/* ===== 세트 완주 도장 · FABLE 엔딩 (26.10.14 영신) =====
   세트를 다 클리어하면 결과 화면에 그 세트에서 틀렸던 단어를 모두 모은다. 하나씩 누르면 발음이 나오고 줄이 사라진다.
   다 누르면 도장이 쾅 찍히고(고양누리길 완주 스탬프에서 착안), 다음 세트 문이 열린다. 틀린 단어가 없으면 바로 찍는다.
   마지막 세트 도장 뒤에 FABLE 엔딩: 네가 쌓은 산 → 계약 → 한뫼 → 고양이 정체(ㅇㅅㅊ…) → 완주 배지.
   B1 범위는 25세트에서 1부 완결(산 절반 + C1 권유). 원리는 PRINCIPLES 15절. */
var stKey='goyang-fable-stamps-v1',stReview=null,stSheetOpen=false,stFxAt=0,stPendingEnding=false;
function stRead(){try{const o=JSON.parse(localStorage.getItem(stKey)||'null');return o&&typeof o==='object'&&!Array.isArray(o)?o:null;}catch(e){return null;}}
function stAll(){return stRead()||{};}
function stWrite(o){try{localStorage.setItem(stKey,JSON.stringify(o));}catch(e){}}
/* 처음 열 때 이미 다 끝낸 세트는 도장을 받은 것으로 친다(날짜 0). 이미 하던 것은 빼앗지 않는다(PRINCIPLES 14). */
function stInit(){if(stRead())return;const o={};state.lessons.forEach(L=>{if(L.kind!=='saved'&&setCleared(L))o[L.id]=0;});stWrite(o);}
function stHas(L){return !!L&&Object.prototype.hasOwnProperty.call(stAll(),L.id);}
function stAt(L){return Number(stAll()[L.id])||0;}
function stGive(L,at){const o=stAll();o[L.id]=at;stWrite(o);}
function stPendingSets(){return state.lessons.filter(L=>L.kind!=='saved'&&inScope(L)&&setCleared(L)&&!stHas(L));}

/* --- 그림 --- */
var stCatCache=null,stUid=0;
function stCatRects(){   // 고양이 픽셀(CAT.win)에서 윤곽·눈·코·방울만 잉크로 남기고(ink), 몸 전체는 종이색 바탕(body)으로 깐다
  if(stCatCache)return stCatCache;
  let svg='';try{svg=atob(String(CAT.win).split(',')[1]);}catch(e){return stCatCache={ink:'',body:''};}
  const keep={'#211b1b':1,'#141414':1,'#ff7eb0':1,'#f49bbf':1,'#c98a00':1},rects=svg.match(/<rect [^>]*\/>/g)||[],bare=r=>r.replace(/ fill="#[0-9a-fA-F]{6}"/,'');
  return stCatCache={ink:rects.filter(r=>keep[(/fill="(#[0-9a-fA-F]{6})"/.exec(r)||[])[1]?.toLowerCase()]).map(bare).join(''),body:rects.map(bare).join('')};
}
function stInk(L,light){return light?(L.lesson>=46?'#5fe0c8':L.lesson>B1_LAST?'#ff8ac6':'#c3aefc'):(L.lesson>=46?'#16806b':L.lesson>B1_LAST?'#c0347c':'#6646c2');}
function stDate(at){if(!at)return '';const d=new Date(at);return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`;}
function stFlower(x,y,r){let p='';for(let i=0;i<5;i++){const a=i*72*Math.PI/180;p+=`<circle cx="${(x+Math.sin(a)*r).toFixed(1)}" cy="${(y-Math.cos(a)*r).toFixed(1)}" r="${(r*.62).toFixed(1)}"/>`;}return p+`<circle cx="${x}" cy="${y}" r="${(r*.42).toFixed(1)}" fill="currentColor"/>`;}
function stampSVG(L,at,mini){
  const ink=stInk(L,mini),id='stg'+(++stUid),date=stDate(at);
  const grain=`<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="${mini?.5:.75}" numOctaves="2" seed="${(L.lesson*7)%50}" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -7 0 0 0 4.9" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in" result="g"/><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="${L.lesson%9}" result="w"/><feDisplacementMap in="g" in2="w" scale="2.4" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  if(mini)return `<svg class="st-svg" viewBox="0 0 200 200" aria-hidden="true" style="color:${ink}"><defs>${grain}</defs><g filter="url(#${id})" fill="currentColor"><rect x="9" y="9" width="182" height="182" rx="10" fill="none" stroke="currentColor" stroke-width="12"/><g transform="translate(37,30) scale(4.2)">${stCatRects().ink}</g></g></svg>`;
  const top=`${esc(L.id)} 완주!`;
  return `<svg class="st-svg" viewBox="0 0 200 200" role="img" aria-label="${top} ${date}" style="color:${ink}"><defs>${grain}<path id="${id}a" d="M36 80 A64 50 0 0 1 164 80"/></defs>
<g filter="url(#${id})" fill="currentColor" stroke="none">
<rect x="6" y="6" width="188" height="188" rx="7" fill="none" stroke="currentColor" stroke-width="5"/>
<rect x="14" y="14" width="172" height="172" rx="4" fill="none" stroke="currentColor" stroke-width="1.6"/>
<text font-size="19" font-weight="900" letter-spacing="1" text-anchor="middle" font-family="'Noto Sans KR',sans-serif"><textPath href="#${id}a" startOffset="50%">${top}</textPath></text>
<path d="M18 150 L44 112 L68 140 M132 140 L156 108 L182 150" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
<g fill="none" stroke="currentColor" stroke-width="1.6">${stFlower(32,140,4.4)}${stFlower(168,138,4.8)}${stFlower(46,154,3.2)}${stFlower(154,154,3)}</g>
<g transform="translate(65.5,62) scale(2.3)"><g fill="var(--st-paper,#fffaf0)">${stCatRects().body}</g>${stCatRects().ink}</g>
<rect x="58" y="128" width="84" height="24" rx="4" fill="var(--st-paper,#fffaf0)" stroke="currentColor" stroke-width="2.4"/>
<text x="100" y="145.5" font-size="13.5" font-weight="900" text-anchor="middle" font-family="'Noto Sans KR',sans-serif">FABLE</text>
<line x1="14" y1="162" x2="186" y2="162" stroke="currentColor" stroke-width="1.4"/>
<text x="100" y="179" font-size="12.5" font-weight="700" text-anchor="middle" font-family="'Noto Sans KR',sans-serif">${date||'FABLE 완주'}</text>
</g></svg>`;
}

/* --- 그 세트에서 틀렸던 단어 ---
   틀렸던 단어 기록(goyang-missed-words-v1, 돌파 축하의 금빛 단어와 같은 기록)에서 이 세트 표제어를 고르고, 방금 판에서 틀린 단어를 더한다.
   표제어 하나에 뜻 카드가 여럿이면 한 줄로 묶는다. 세트 안의 카드 순서대로. */
function stMissList(L,s){
  const miss=msMissed(),now=new Set((s&&Array.isArray(s.words)?s.words:[]).filter(w=>w&&w.wrongEver).map(msHead)),rows=new Map();
  visEx(L).forEach(e=>e.words.forEach(w=>{const k=msHead(w);if(!k||!(miss[k]||now.has(k)))return;
    const r=rows.get(k)||{term:w.term??w.word??w.en,mean:[],ipas:new Set(),n:Math.max(1,Number(miss[k])||0)};
    const m=String(w.meaning??w.ko??'').trim();if(m&&!r.mean.includes(m))r.mean.push(m);
    // One row may combine noun/verb senses. Use a recording only when every
    // included card agrees; a missing IPA is also unresolved, not a guess.
    r.ipas.add(String(w.ipa||'').trim());rows.set(k,r);}));
  return [...rows.values()].map(({ipas,...r})=>({...r,ipa:ipas.size===1?[...ipas][0]:''}));
}
function stRows(rows){return rows.map(r=>`<button type="button" class="wrow st-row" data-t="${esc(r.term)}" data-ipa="${esc(r.ipa||'')}"><b>${esc(r.term)}</b><span>${esc(r.mean.join(' / '))}</span><i>${r.n}회</i></button>`).join('');}
function stHead(L,n){return n?`<div class="wh st-wh">${esc(L.id)}에서 틀렸던 단어 ${n}개 · 다 누르면 도장 쾅 🐾</div>`:`<div class="wh ok">${esc(L.id)}에서 틀린 단어 없음 ✦ 도장 바로 찍는다</div>`;}
function stLeft(box){return box?[...box.querySelectorAll('.st-row:not(.gone)')]:[];}
function stNextLabel(){if(!stReview||stReview.where!=='sum')return;const n=stLeft($('#sumWrong')).length,b=$('#nextEx');if(!b)return;
  if(n){b.disabled=false;b.textContent=`도장까지 ${n}개`;}}

/* 결과 화면에서 시작: finishExercise가 이 세트를 막 다 클리어했을 때 */
function stBegin(L,s,all){
  const rows=stMissList(L,s),box=$('#sumWrong');
  stReview={L,where:'sum',all,total:rows.length};
  box.innerHTML=stHead(L,rows.length)+stRows(rows);
  $('#retryWrong').hidden=true;   // 이 판의 틀린 단어도 위 목록에 들어 있다. 판 다시 하기는 도장 뒤에
  if(rows.length)stNextLabel();else stQueueStamp();
}
/* 홈에서 이어서: 도장을 못 받고 나간 세트 */
function stOpenSheet(L){
  if(stSheetOpen)stCloseSheet();
  const rows=stMissList(L,null),r={L,where:'sheet',all:false,total:rows.length};stReview=r;
  let ov=$('#stSheet');if(!ov){ov=document.createElement('div');ov.id='stSheet';ov.className='st-sheet';document.body.appendChild(ov);}
  ov.innerHTML=`<div class="st-panel" role="dialog" aria-label="${esc(L.id)} 도장 받기"><div class="catrow"><div class="catimg"><img id="stSheetCat" alt="고양고양이"></div><div class="bubble"><span><span class="nm">고양고양이</span> ${rows.length?'틀렸던 단어를 하나씩 다시 들어 보라고양. 다 들으면 도장 찍어 준다고양.':'틀린 단어가 없다고양. 도장 바로 찍어 준다고양.'}</span></div></div>
<div class="wrongs" id="stSheetList">${stHead(L,rows.length)+stRows(rows)}</div><button class="ghost" type="button" id="stSheetClose">나중에</button></div>`;
  setCat('stSheetCat',rows.length?'normal':'win');ov.classList.add('show');stSheetOpen=true;
  $('#stSheetClose').onclick=stCloseSheet;
  if(!rows.length)setTimeout(()=>{if(stReview===r&&stSheetOpen)stReviewDone();},600);
}
function stCloseSheet(keepSpeech=false){
  const wasOpen=stSheetOpen,ov=$('#stSheet');if(ov)ov.classList.remove('show');stSheetOpen=false;
  if(stReview&&stReview.where==='sheet')stReview=null;
  if(wasOpen&&keepSpeech!==true&&typeof stopFablePronunciation==='function')stopFablePronunciation();
}
function stTap(b){
  const r=stReview;if(!r||!b||b.classList.contains('gone'))return;
  speak(b.dataset.t,b.dataset.ipa||'');fxHeart(b);b.classList.add('gone');
  const box=b.parentNode;
  setTimeout(()=>{b.remove();if(stReview!==r)return;stNextLabel();if(!stLeft(box).length)stReviewDone();},260);
}
function stReviewDone(){
  const r=stReview;if(!r||r.done)return;r.done=true;
  // Closing manually or starting a new game invalidates this delayed action.
  // The normal stamp transition keeps the last word audible while it finishes.
  if(r.where==='sheet')setTimeout(()=>{if(stReview!==r||!stSheetOpen||document.body.classList.contains('playing'))return;stCloseSheet(true);stShow(r.L,r);},250);
  else stQueueStamp();
}
/* 포효·돌파 축하가 떠 있으면 끝날 때까지 기다렸다가 찍는다(PRINCIPLES 11: 포효 → 돌파 축하 → 도장 → 엔딩). */
function stQueueStamp(){
  const r=stReview;if(!r)return;r.done=true;
  const go=()=>{if(stReview!==r)return;
    if($('#roar')?.classList.contains('show')||$('#msFx')||(typeof msBusy!=='undefined'&&msBusy)){setTimeout(go,250);return;}
    if(document.body.classList.contains('playing')){if(stReview===r)stReview=null;return;}   // 새 판이 돌면 도장은 홈에서 이어서 받는다
    stShow(r.L,r);};
  setTimeout(go,r.total?250:900);
}

/* --- 도장 화면 --- */
function stShow(L,r,preview){
  if(!preview&&stHas(L)&&stAt(L)){stAfter(r);return;}
  const before=new Set(openSets()),at=Date.now();if(!preview)stGive(L,at);
  const open=openSets(),i=state.lessons.indexOf(L),nx=state.lessons.slice(i+1).find(x=>x.kind!=='saved'&&inScope(x));
  const opened=nx&&(preview||open.has(nx))?nx:null,fresh=opened&&(preview||!before.has(opened));
  const ov=document.createElement('div');ov.className='st-fx';ov.id='stFx';ov.setAttribute('role','dialog');ov.setAttribute('aria-label',`${L.id} 완주 도장`);
  const chip=x=>`<span class="st-chip${x.lesson>=46?' morph':x.lesson>B1_LAST?' upper':''}"><i class="st-lock">🔒</i>${esc(x.id)}</span>`;
  ov.innerHTML=`<div class="st-card" style="--st-paper:#fbf5e6"><div class="st-ink">${stampSVG(L,at)}</div></div>
<div class="st-label"><span class="st-pill" style="background:${stInk(L)}">${esc(L.id)}</span><span>${esc(L.name||'')}</span></div>
<div class="st-open">${opened?`${chip(opened)}<b>${fresh?'문이 열렸다':'다음 세트로'}</b>`:`<b>${r&&r.all?'마지막 도장이다':'여기가 끝이다'}</b>`}</div>
<div class="st-hint">누르면 닫혀</div>`;
  document.body.appendChild(ov);stFxAt=Date.now();
  requestAnimationFrame(()=>ov.classList.add('show'));
  setTimeout(()=>{ov.classList.add('hit');stThump();},420);
  if(opened)setTimeout(()=>{ov.classList.add('unlock');const l=ov.querySelector('.st-lock');if(l)l.textContent='🔓';beep('ok',3);},1150);
  const close=()=>{if(Date.now()-stFxAt<900)return;ov.remove();if(!preview)stAfter(r);};
  ov.addEventListener('click',close);ov._close=close;
}
function stAfter(r){
  if(stReview===r)stReview=null;
  if($('#sumScreen')?.classList.contains('active')){if(typeof setSumNext==='function')setSumNext();$('#retryWrong').hidden=!(state.lastWrong&&state.lastWrong.size);}
  renderHome();
  // 마지막 세트 도장이면 엔딩. 홈에서 이어 받은 도장이 마지막 남은 도장이어도 연다(그사이 새로고침했어도).
  if(r&&r.all||stPendingEnding||(r&&r.where==='sheet'&&feMode()&&!stPendingSets().length)){stPendingEnding=false;setTimeout(()=>stOrigEnding(),300);}
}
function stThump(){if(state.muted)return;try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();const n=actx.currentTime;
  const o=actx.createOscillator(),g=actx.createGain();o.connect(g);g.connect(actx.destination);o.type='sine';
  o.frequency.setValueAtTime(150,n);o.frequency.exponentialRampToValueAtTime(48,n+.18);g.gain.setValueAtTime(.32,n);g.gain.exponentialRampToValueAtTime(.001,n+.26);o.start(n);o.stop(n+.28);
  const len=Math.floor(actx.sampleRate*.08),buf=actx.createBuffer(1,len,actx.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
  const src=actx.createBufferSource(),g2=actx.createGain();src.buffer=buf;src.connect(g2);g2.connect(actx.destination);g2.gain.setValueAtTime(.12,n);src.start(n);}catch(e){}}

/* --- 홈: 도장 대기 줄, 잠금 칸 안내, 완주 칸의 작은 도장 --- */
function stDecorateHome(){
  const pend=stPendingSets()[0],g=$('#lessonGrid');
  let bn=$('#stBanner');
  if(pend){if(!bn){bn=document.createElement('button');bn.type='button';bn.id='stBanner';bn.className='btn resume st-banner';$('#resumeBtn').before(bn);}
    const n=stMissList(pend,null).length;bn.hidden=false;
    bn.innerHTML=`<span class="resume-heading"><span>🐾 ${esc(pend.id)} 도장 받기</span><small>${n?`틀렸던 단어 ${n}개를 다 누르면 쾅`:'바로 찍어 준다'}</small></span>`;
    bn.onclick=()=>stOpenSheet(pend);}
  else if(bn)bn.hidden=true;
  if(!g)return;
  g.querySelectorAll('.lessonbtn[data-lid]').forEach(b=>{const L=state.lessons.find(x=>x.id===b.dataset.lid);if(!L||!setCleared(L))return;
    if(!stHas(L)){const m=b.querySelector('.lmeta b');if(m)m.textContent='도장 대기 🐾';return;}
    const at=stAt(L),s=document.createElement('span');s.className='st-mini';s.innerHTML=stampSVG(L,at,true);
    if(at)b.title=`${L.id} 완주 · ${stDate(at)}`;b.classList.add('stamped');b.appendChild(s);});
}

/* ===== FABLE 엔딩 ===== */
var feState=null;
function feMode(){if(totalExercises(true)>0&&clearedExercises(true)>=totalExercises(true))return 'full';if(state.levelB1&&totalExercises()>0&&clearedExercises()>=totalExercises())return 'b1';return null;}
function feShow(){
  const m=feMode();if(!m)return;
  // 홈의 진도 막대도 같은 관문을 거친다. 마지막 복습을 나갔다고 도장 전에 엔딩이 열리면 안 된다.
  // full은 B1 버튼 상태와 무관하게 모든 세트, b1은 0~25세트의 도장을 본다. 날짜 0인 구판 도장도 유효하다.
  const pending=state.lessons.some(L=>L.kind!=='saved'&&(m==='full'||L.lesson<=B1_LAST)&&!stHas(L));
  if(pending||stReview||$('#stFx')){stPendingEnding=true;return;}
  stPendingEnding=false;feOpen(m);
}
var FE_LINES={
  full:[
    ['win','이게 네가 쌓은 산이라고양. 한 칸 한 칸이 다 네가 익힌 단어라고양.'],
    ['win','반짝이는 건 틀렸다가 끝내 잡은 단어라고양. 제일 빛나는 게 걔들이라고양.'],
    ['normal','처음 만났을 때 계약했지? 단어를 전부 익히면 이 도시에서 내보내 주겠다고양.'],
    ['win','약속은 약속이라고양. 계약 끝이라고양. 이제 어디든 가도 된다고양 ✦'],
    ['wicked','…근데 있잖냐고양. 네가 오른 BIG MOUNTAIN, 사실은 일산이었다고양.','BIG MOUNTAIN'],
    ['normal',"일산의 옛 이름은 한뫼, '큰 산'이라고양. 한자로 옮겨 적으니 一山이 된 거라고양.",'한뫼 → 一山 → 일산'],
    ['win','넌 일산을 떠난 게 아니라, 원래 크기의 일산에 올라온 거라고양 🌳','한뫼 → 一山 → 일산'],
    ['normal',"그리고 하나 더. 0세트에서 내가 말했지? '나는 고양이다. 이름은 아직 없다.'"],
    ['sour','…그거 거짓말이라고양. 이름 있다고양.'],
    ['blank','내 정체는… ㅇㅅㅊ…',null,'slow'],
    ['wicked','…아니다고양. 못 들은 걸로 하라고양.'],
    ['win','이건 완주 배지라고양. 잃어버려도 다시 안 준다고양. 잘 가라고양 🐾',null,'badge']],
  b1:[
    ['win','여기까지가 네가 쌓은 산이라고양. 한 칸 한 칸이 다 네가 익힌 단어라고양.'],
    ['win','반짝이는 건 틀렸다가 끝내 잡은 단어라고양. 제일 빛나는 게 걔들이라고양.'],
    ['normal','B1까지, 1부 끝이라고양. 솔직히… 잘했다고양. 딱 한 번만 말한다고양.'],
    ['wicked','근데 위쪽 점선 보이냐고양? 아직 아무도 안 쌓은 곳이라고양.'],
    ['evil','내 정체가 궁금하면 꼭대기까지 오라고양. C1을 누르면 산이 열린다고양 😼'],
    ['win','1부 배지라고양. 진짜 배지는 꼭대기에서 준다고양.',null,'badge']]
};
function feHeads(sets){const u=new Set();sets.forEach(L=>visEx(L).forEach(e=>e.words.forEach(w=>{const k=msHead(w);if(k)u.add(k);})));return u.size;}
function feOpen(mode){
  feClose(true);
  const sets=state.lessons.filter(L=>L.kind!=='saved'),filled=mode==='b1'?sets.filter(L=>L.lesson<=B1_LAST):sets;
  const ov=document.createElement('div');ov.className='fe';ov.id='fEnd';ov.setAttribute('role','dialog');ov.setAttribute('aria-label',mode==='b1'?'FABLE 1부 완결':'FABLE 엔딩');
  ov.innerHTML=`<button class="fe-x" type="button" aria-label="닫기">✕</button>
<div class="fe-stage"><canvas class="fe-mt"></canvas><div class="fe-cap"></div></div>
<div class="fe-badge" hidden></div>
<div class="fe-talk"><div class="catimg"><img id="feCat" alt="고양고양이"></div><div class="bubble"><span><span class="nm">고양고양이</span> <span class="fe-line"></span></span></div></div>
<div class="fe-act" hidden></div>
<div class="fe-hint">눌러서 계속 ▸</div>`;
  document.body.appendChild(ov);document.body.classList.add('fe-on');
  feState={mode,ov,sets,filled,step:-1,building:true,openedAt:Date.now(),raf:0,typing:0};
  setCat('feCat','normal');
  ov.querySelector('.fe-x').onclick=e=>{e.stopPropagation();feClose();};
  ov.addEventListener('click',e=>{if(e.target.closest('.fe-act button'))return;feNext();});
  requestAnimationFrame(()=>ov.classList.add('show'));
  feBuild();
}
function feClose(silent){const f=feState;if(!f)return;cancelAnimationFrame(f.raf);clearInterval(f.typing);f.ov.remove();feState=null;document.body.classList.remove('fe-on');if(!silent)renderHome();}
function feNext(){
  const f=feState;if(!f)return;
  if(f.building){f.skip=true;return;}
  if(f.typing){clearInterval(f.typing);f.typing=0;f.ov.querySelector('.fe-line').textContent=f.full;return;}
  const lines=FE_LINES[f.mode];if(f.step>=lines.length-1)return;
  f.step++;const [expr,text,cap,kind]=lines[f.step];
  setCat('feCat',expr);
  const cp=f.ov.querySelector('.fe-cap');if(cap){cp.textContent=cap;cp.classList.add('big');}else{cp.textContent=f.capBase||'';cp.classList.remove('big');}
  const el=f.ov.querySelector('.fe-line');f.full=text;
  if(kind==='slow'){el.textContent='';let i=0;f.ov.classList.add('glitch');f.typing=setInterval(()=>{el.textContent=text.slice(0,++i);if(i>=text.length){clearInterval(f.typing);f.typing=0;}},170);}
  else{el.textContent=text;f.ov.classList.remove('glitch');}
  if(kind==='badge')feBadge();
  f.ov.querySelector('.fe-hint').hidden=f.step>=lines.length-1;
}
function feBadge(){
  const f=feState,b1=f.mode==='b1',n=feHeads(f.filled),last=f.filled[f.filled.length-1],at=(last&&stAt(last))||Date.now(),d=new Date(at);
  const bd=f.ov.querySelector('.fe-badge'),stg=f.ov.querySelector('.fe-stage');
  bd.innerHTML=`<div class="fe-pin">${fePinSVG(b1?'FABLE 1부 완주':'FABLE 완주',(b1?'B1 · ':'')+n.toLocaleString('en-US')+'단어')}<img class="fe-pin-cat" src="${CAT.win}" alt=""></div><div class="fe-date">${d.getFullYear()}. ${d.getMonth()+1}. ${d.getDate()}.</div>`;
  stg.hidden=true;bd.hidden=false;fanfare();
  const act=f.ov.querySelector('.fe-act');act.hidden=false;
  act.innerHTML=(b1?'<button class="btn" type="button" id="feC1">C1로 계속 ▶</button>':'')+'<button class="ghost" type="button" id="feDone">닫기</button>';
  $('#feDone').onclick=()=>feClose();
  if(b1)$('#feC1').onclick=()=>{feClose(true);state.levelB1=false;try{localStorage.setItem(LEVELKEY,'C1');}catch(e){}syncLevelBtn();renderHome();catSay('C1까지 다 연다고양! 꼭대기에서 보자고양 😼');};
}
function fePinSVG(t1,t2){
  let fl='';[[18,104,5],[34,116,4],[140,100,5],[126,114,4.2],[150,120,3.6],[10,124,3.6]].forEach(([x,y,r])=>{for(let i=0;i<5;i++){const a=i*72*Math.PI/180;fl+=`<circle cx="${(x+Math.sin(a)*r).toFixed(1)}" cy="${(y-Math.cos(a)*r).toFixed(1)}" r="${(r*.62).toFixed(1)}" fill="#f7cde3"/>`;}fl+=`<circle cx="${x}" cy="${y}" r="${(r*.4).toFixed(1)}" fill="#fff"/>`;});
  return `<svg viewBox="0 0 160 160" aria-hidden="true"><defs><clipPath id="fePinC"><rect width="160" height="160" rx="14"/></clipPath></defs><g clip-path="url(#fePinC)">
<rect width="160" height="160" fill="#4aa6e6"/><circle cx="142" cy="14" r="22" fill="#ffad3b"/>
<path d="M14 34c0-6 8-9 13-5 2-6 12-6 14 1 6-1 9 6 4 9H17c-3 0-4-3-3-5z" fill="#fff"/><path d="M96 52c0-5 7-7 11-4 2-5 10-5 12 1 5-1 7 5 3 7H99c-3 0-4-2-3-4z" fill="#fff"/>
<path d="M-6 112 L28 54 L50 80 L78 36 L108 84 L128 62 L168 112 Z" fill="#1e3a2a"/><path d="M78 36 L68 54 L76 50 L82 58 L88 50 Z" fill="#e9f3ec"/>
<path d="M-6 118 Q80 92 168 118 L168 160 L-6 160 Z" fill="#2c5638"/>${fl}
<rect x="12" y="116" width="136" height="36" rx="6" fill="#eef4fb"/>
<text x="80" y="131" font-size="13" font-weight="900" text-anchor="middle" fill="#1b2340" font-family="'Noto Sans KR',sans-serif">${esc(t1)}</text>
<text x="80" y="146" font-size="12" font-weight="700" text-anchor="middle" fill="#1b2340" font-family="'Noto Sans KR',sans-serif">${esc(t2)}</text></g>
<rect x="2.5" y="2.5" width="155" height="155" rx="13" fill="none" stroke="#2a2833" stroke-width="5"/><rect x="5.5" y="5.5" width="149" height="149" rx="11" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.2"/></svg>`;
}
/* 네가 쌓은 산(26.10.14 영신: "산을 단어의 산으로", 꼭대기 고양이는 산이 몸처럼 보여 뺐다).
   산은 진짜 단어 글자로 채운다. 세트 하나가 한 층, 아래(0세트)부터 배운 순서대로. 틀렸던 단어는 금빛.
   6천 단어를 한 화면 산에 넣으면 글자가 1~2px라 읽히지 않는다. 그래서 산을 글자 7px로 크게 만들고
   카메라가 층이 쌓이는 대로 따라 오른다(읽히게). 꼭대기에서 줌아웃해 산 전체를 보이고 깃발을 꽂는다.
   B1 1부 완결은 25세트 층까지 쌓고, 위는 점선으로 남긴다. */
function feWorld(f){
  const F=7,GAP=F*.5,LH=F*1.14,font=`700 ${F}px 'Noto Sans KR',-apple-system,sans-serif`;
  const meas=document.createElement('canvas').getContext('2d');meas.font=font;
  const miss=msMissed(),bands=f.sets.map(L=>{const seen=new Set(),ws=[];visEx(L).forEach(e=>e.words.forEach(w=>{const k=msHead(w);if(!k||seen.has(k))return;seen.add(k);
    const t=String(w.term??w.word??w.en);ws.push({t,k,w:meas.measureText(t).width,gold:!!miss[k]});}));return {L,ws,need:ws.reduce((a,x)=>a+x.w+GAP,0)};});
  const need=bands.reduce((a,b)=>a+b.need,0)*LH/0.8,side=Math.ceil(Math.sqrt(2*need)),B=side,Hm=side,top=0,base=Hm,cx=B/2;
  // 산등성이: 왼쪽은 어깨가 하나 있고 오른쪽은 완만하게. 좌우 폭을 따로 잰다.
  const hl=y=>{const t=Math.max(0,(y-top)/(base-top));return (B/2)*Math.pow(t,.98)*(1+.07*Math.sin(t*8.5+.6)+.025*Math.sin(t*29));};
  const hr=y=>{const t=Math.max(0,(y-top)/(base-top));return (B/2)*Math.pow(t,1.04)*(1+.05*Math.sin(t*6.3+2.1)+.03*Math.sin(t*23+1));};
  const hw=y=>(hl(y)+hr(y))/2;
  // 층 경계: 아래부터 각 세트가 글자량만큼 넓이를 가져간다(층마다 글자 크기가 같게).
  const minRow=F*6,area=[];let acc=0;for(let y=base;y>=top;y-=1){const w=2*hw(y);if(w>=minRow)acc+=w;area.push([y,acc]);}
  const total=acc,tot=bands.reduce((a,b)=>a+b.need,0);let k=0,cum=0;
  bands.forEach(b=>{b.y1=k?bands[k-1].y0:base;cum+=b.need;const target=total*cum/tot;let y=top;for(const [yy,a] of area){if(a>=target){y=yy;break;}}b.y0=Math.min(b.y1-LH,y);k++;});
  // 줄마다 단어를 왼쪽부터 채운다. 모자라면 그 층만 조금 촘촘하게.
  bands.forEach(b=>{for(let sq=1;sq>.6;sq*=.95){const lh=LH*sq,rows=[];for(let y=b.y1-lh;y>=b.y0-lh*.3;y-=lh){const a=hl(y+lh/2)-F*.6,c=hr(y+lh/2)-F*.6;if(a+c>=minRow*.6)rows.push({y,x0:cx-a,x1:cx+c});}
    let r=0,x=rows[0]?.x0,ok=true;const pos=[];
    for(const wd of b.ws){const ww=wd.w*sq;while(r<rows.length&&x+ww>rows[r].x1){r++;x=rows[r]?.x0;}if(r>=rows.length){ok=false;break;}pos.push({x,y:rows[r].y,s:sq});x+=ww+GAP*sq;}
    if(ok||sq*.95<=.6){b.pos=pos;b.sq=sq;break;}}});
  return {F,font,LH,B,Hm,top,base,cx,hw,hl,hr,bands};
}
function feBuild(){
  const f=feState,cv=f.ov.querySelector('.fe-mt'),dpr=Math.min(2,window.devicePixelRatio||1);
  const W=Math.min(360,Math.max(260,window.innerWidth-24)),H=Math.round(Math.min(W*1.08,(window.innerHeight||700)*.5));
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px';
  const ctx=cv.getContext('2d');
  const wd=feWorld(f),n=f.mode==='b1'?f.sets.filter(L=>L.lesson<=B1_LAST).length:f.sets.length;
  const rs=Math.min(dpr,4096/Math.max(wd.B,wd.Hm)),world=document.createElement('canvas');world.width=Math.ceil(wd.B*rs);world.height=Math.ceil(wd.Hm*rs);
  const wc=world.getContext('2d');wc.scale(rs,rs);wc.textBaseline='top';
  const shade=(L,i)=>L.lesson>=46?(i%2?'#6fdcc6':'#45c2aa'):L.lesson>B1_LAST?(i%2?'#f39ccb':'#dc68a6'):(i%2?'#bba9ff':'#9b85f2');
  const paint=i=>{const b=wd.bands[i];b.ws.forEach((w,j)=>{const p=b.pos[j];if(!p)return;wc.font=`700 ${(wd.F*p.s).toFixed(2)}px 'Noto Sans KR',-apple-system,sans-serif`;
    if(w.gold){wc.fillStyle='#ffd34d';wc.shadowColor='rgba(255,211,77,.9)';wc.shadowBlur=4;}else{wc.fillStyle=shade(b.L,i);wc.shadowBlur=0;}wc.fillText(w.t,p.x,p.y);});wc.shadowBlur=0;};
  if(f.mode==='b1'){wc.save();wc.setLineDash([10,10]);wc.strokeStyle='rgba(255,255,255,.45)';wc.lineWidth=3;const yB=wd.bands[n-1].y0;
    wc.beginPath();wc.moveTo(wd.cx-wd.hl(yB),yB);for(let y=yB;y>=wd.top;y-=4)wc.lineTo(wd.cx-wd.hl(y),y);for(let y=wd.top;y<=yB;y+=4)wc.lineTo(wd.cx+wd.hr(y),y);wc.stroke();wc.restore();}
  const fit=Math.min(W/wd.B,(H-34)/wd.Hm)*.96,fitCy=wd.Hm/2-12/fit;   // 전경: 위에 깃발 자리
  const cap=f.ov.querySelector('.fe-cap'),gap=f.mode==='b1'?110:85,climbEnd=n*gap+300,zoom=1500,t0=performance.now()+300;
  let painted=0;const seen=new Set();const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const draw=(k,cxw,cyw,reveal,fade)=>{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);
    ctx.setTransform(dpr*k,0,0,dpr*k,dpr*(W/2-cxw*k),dpr*(H/2-cyw*k));
    ctx.save();ctx.beginPath();ctx.rect(0,reveal,wd.B,wd.Hm-reveal+2);ctx.clip();ctx.drawImage(world,0,0,wd.B,wd.Hm);ctx.restore();
    if(fade&&fade.a<1){ctx.save();ctx.globalAlpha=fade.a;ctx.beginPath();ctx.rect(0,fade.y0,wd.B,fade.y1-fade.y0);ctx.clip();ctx.drawImage(world,0,0,wd.B,wd.Hm);ctx.restore();}};
  const toScreen=(x,y)=>[W/2+(x-wd.cx)*fit,H/2+(y-fitCy)*fit];
  const finish=()=>{   // 전경 + 깃발 + 금빛 단어 몇 개를 읽히게
    draw(fit,wd.cx,fitCy,wd.top-1);ctx.setTransform(dpr,0,0,dpr,0,0);
    const topY=f.mode==='b1'?wd.bands[n-1].y0:wd.top,[fx,fy]=toScreen(wd.cx,topY);
    ctx.strokeStyle='#f6f1ff';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(fx,fy+2);ctx.lineTo(fx,fy-24);ctx.stroke();
    ctx.fillStyle='#ffd34d';ctx.shadowColor='rgba(255,211,77,.8)';ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(fx,fy-24);ctx.lineTo(fx+17,fy-19);ctx.lineTo(fx,fy-14);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
    const golds=[];wd.bands.slice(0,n).forEach(b=>b.ws.forEach((w,j)=>{if(w.gold&&b.pos[j])golds.push({t:w.t,x:b.pos[j].x+w.w*b.pos[j].s/2,y:b.pos[j].y+wd.F/2});}));
    const pick=[],boxes=[],step=Math.max(1,Math.floor(golds.length/55));ctx.font="800 9px 'Noto Sans KR',-apple-system,sans-serif";ctx.textAlign='center';ctx.textBaseline='middle';
    for(let i=0;i<golds.length&&pick.length<45;i+=step){const g=golds[i],[x,y]=toScreen(g.x,g.y),w=ctx.measureText(g.t).width+4,bx={x0:x-w/2,x1:x+w/2,y0:y-6,y1:y+6};
      if(boxes.some(o=>o.x0<bx.x1&&bx.x0<o.x1&&o.y0<bx.y1&&bx.y0<o.y1))continue;boxes.push(bx);pick.push([g.t,x,y]);}
    pick.forEach(([t,x,y])=>{ctx.lineWidth=3;ctx.strokeStyle='rgba(22,8,38,.85)';ctx.strokeText(t,x,y);ctx.fillStyle='#ffd34d';ctx.fillText(t,x,y);});
    ctx.textAlign='start';};
  const frame=now=>{
    if(!feState||feState!==f)return;
    const el=f.skip?climbEnd+zoom:now-t0;
    while(painted<n&&(f.skip||el>=painted*gap)){paint(painted);wd.bands[painted].ws.forEach(w=>seen.add(w.k));painted++;}const words=seen.size;
    const cur=wd.bands[Math.max(0,painted-1)];
    if(el<climbEnd){   // 오르기: 글자 7px, 새 층이 화면 위쪽 1/3에 오게
      const p=Math.min(1,Math.max(0,(el-(painted-1)*gap)/gap)),reveal=cur.y0,cy=Math.min(wd.Hm-H/2+16,reveal+H*.34);
      draw(1,wd.cx,cy,cur.y1,{a:p,y0:cur.y0,y1:cur.y1});
      cap.textContent=`${cur.L.id} · ${cur.L.name||''}  ·  익힌 단어 ${words.toLocaleString('en-US')}`;f.raf=requestAnimationFrame(frame);return;}
    if(el<climbEnd+zoom){   // 줌아웃
      const p=ease((el-climbEnd)/zoom),k=Math.exp(Math.log(1)*(1-p)+Math.log(fit)*p),top=wd.bands[n-1].y0,cy0=Math.min(wd.Hm-H/2+16,top+H*.34),cy=cy0+(fitCy-cy0)*p;
      draw(k,wd.cx,cy,top-1);f.raf=requestAnimationFrame(frame);return;}
    finish();cap.textContent=f.capBase=`익힌 단어 ${words.toLocaleString('en-US')}`;
    f.building=false;feNext();};
  f.ov.querySelector('.fe-line').textContent='0세트부터 네가 익힌 순서대로 쌓아 보자고양. 끝까지 보라고양.';
  f.raf=requestAnimationFrame(frame);
}

/* --- 끼우기 --- */
var stOrigFinish=finishExercise,stOrigEnding=showEnding,stOrigRenderHome=renderHome;
finishExercise=function(){
  const s=state.session,L=s&&s.lesson,ok=!!s&&!s.partial&&!!L&&L.kind!=='saved';
  const was=ok&&setCleared(L),wasAll=ok&&clearedExercises()>=totalExercises();
  const r=stOrigFinish.apply(this,arguments);
  if(ok&&!was&&setCleared(L)&&!stHas(L))try{stBegin(L,s,!wasAll&&clearedExercises()>=totalExercises());}catch(e){}
  return r;
};
/* 엔딩은 마지막 세트 도장을 찍은 뒤에 연다. */
showEnding=function(){if(stReview||$('#stFx')){stPendingEnding=true;return;}return stOrigEnding.apply(this,arguments);};
try{stPreview();}catch(e){}
renderHome=function(){const r=stOrigRenderHome.apply(this,arguments);try{stDecorateHome();}catch(e){}return r;};
var stOrigShow=show;
show=function(n){if(n==='game'&&stSheetOpen)stCloseSheet();if(n!=='sum'&&stReview&&stReview.where==='sum'&&!stReview.done)stReview=null;return stOrigShow.apply(this,arguments);};
$('#sumWrong').addEventListener('click',e=>{   // 세트 복습 줄은 여기서 처리한다(연습 결과의 '다 누르면 다음 연습'으로 넘어가지 않게)
  const b=e.target.closest('.st-row');if(!b)return;e.stopPropagation();stTap(b);},true);
document.addEventListener('click',e=>{const b=e.target.closest('#stSheet .st-row');if(b)stTap(b);});
$('#nextEx').addEventListener('click',e=>{   // 복습 중에는 '도장까지 n개' 버튼이 다음 단어를 누른다
  if(!stReview||stReview.where!=='sum'||stReview.done)return;const b=stLeft($('#sumWrong'))[0];if(!b)return;
  e.stopImmediatePropagation();e.preventDefault();stTap(b);},true);
window.addEventListener('keydown',e=>{
  const k=e.key,go=k==='Enter'||k===' '||e.code==='Space';
  if(feState){if(k==='Escape'){feClose();e.preventDefault();return;}if(go&&!e.repeat&&!e.target.closest?.('.fe-act')){e.preventDefault();e.stopImmediatePropagation();if(Date.now()-feState.openedAt>700)feNext();}return;}
  const fx=$('#stFx');if(fx){if((go||k==='Escape')&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();fx._close&&fx._close();}return;}
  if(!go||e.repeat||e.isComposing)return;
  if(stSheetOpen){if(k==='Escape')return;e.preventDefault();e.stopImmediatePropagation();const b=stLeft($('#stSheetList'))[0];if(b)stTap(b);return;}
  if(stReview&&stReview.where==='sum'&&!stReview.done&&$('#sumScreen')?.classList.contains('active')){
    if($('#msFx')||$('#roar')?.classList.contains('show'))return;
    const t=e.target;if(t?.closest?.('#sumScreen')&&t.closest('button:not(.st-row),a,input,textarea,select'))return;
    e.preventDefault();e.stopImmediatePropagation();if(Date.now()-sumShownAt<700)return;
    const b=stLeft($('#sumWrong'))[0];if(b)stTap(b);}
},true);
document.querySelector('.maproute')?.addEventListener('click',()=>{if(!feState&&feMode())feShow();});
/* 주소 끝 #stamp=12 · #ending · #ending=b1 → 저장하지 않고 연출만 미리 본다(영신 확인용, 돌파 축하의 #milestone과 같다). */
function stPreview(){
  const m=/^#(stamp|ending)(?:=(\w+))?$/.exec(location.hash||'');if(!m)return;
  if(m[1]==='stamp'){const L=state.lessons.find(x=>x.kind!=='saved'&&String(x.lesson)===(m[2]||'0'));if(L)setTimeout(()=>stShow(L,{L,all:false},true),700);return;}
  setTimeout(()=>feOpen(m[2]==='b1'?'b1':'full'),700);
}
