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
function stampSVG(L,at,mini,o){   // o: {top, sign} — 1부 완결 큰 도장처럼 글자만 바꿀 때
  const ink=stInk(L,mini),id='stg'+(++stUid),date=stDate(at);
  const grain=`<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="${mini?.5:.75}" numOctaves="2" seed="${(L.lesson*7)%50}" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -7 0 0 0 4.9" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in" result="g"/><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="${L.lesson%9}" result="w"/><feDisplacementMap in="g" in2="w" scale="2.4" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  if(mini)return `<svg class="st-svg" viewBox="0 0 200 200" aria-hidden="true" style="color:${ink}"><defs>${grain}</defs><g filter="url(#${id})" fill="currentColor"><rect x="9" y="9" width="182" height="182" rx="10" fill="none" stroke="currentColor" stroke-width="12"/><g transform="translate(37,30) scale(4.2)">${stCatRects().ink}</g></g></svg>`;
  const top=o&&o.top?esc(o.top):`${esc(L.id)} 완주!`;
  return `<svg class="st-svg" viewBox="0 0 200 200" role="img" aria-label="${top} ${date}" style="color:${ink}"><defs>${grain}<path id="${id}a" d="M36 80 A64 50 0 0 1 164 80"/></defs>
<g filter="url(#${id})" fill="currentColor" stroke="none">
<rect x="6" y="6" width="188" height="188" rx="7" fill="none" stroke="currentColor" stroke-width="5"/>
<rect x="14" y="14" width="172" height="172" rx="4" fill="none" stroke="currentColor" stroke-width="1.6"/>
<text font-size="19" font-weight="900" letter-spacing="1" text-anchor="middle" font-family="'Noto Sans KR',sans-serif"><textPath href="#${id}a" startOffset="50%">${top}</textPath></text>
<path d="M18 150 L44 112 L68 140 M132 140 L156 108 L182 150" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
<g fill="none" stroke="currentColor" stroke-width="1.6">${stFlower(32,140,4.4)}${stFlower(168,138,4.8)}${stFlower(46,154,3.2)}${stFlower(154,154,3)}</g>
<g transform="translate(65.5,62) scale(2.3)"><g fill="var(--st-paper,#fffaf0)">${stCatRects().body}</g>${stCatRects().ink}</g>
<rect x="58" y="128" width="84" height="24" rx="4" fill="var(--st-paper,#fffaf0)" stroke="currentColor" stroke-width="2.4"/>
<text x="100" y="145.5" font-size="13.5" font-weight="900" text-anchor="middle" font-family="'Noto Sans KR',sans-serif">${o&&o.sign?esc(o.sign):'FABLE'}</text>
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
    ['win','티끌 모아 태산이라고양. 한 단어 한 단어가 쌓여서 이 산이 됐다고양.'],
    ['win','반짝이는 건 틀렸다가 끝내 잡은 단어라고양. 제일 빛나는 게 걔들이라고양.'],
    ['normal','처음 만났을 때 계약했지? 단어를 전부 익히면 이 도시에서 내보내 주겠다고양.'],
    ['win','약속은 약속이라고양. 계약 끝이라고양. 이제 어디든 가도 된다고양 ✦'],
    ['wicked','…근데 있잖냐고양. 네가 오른 BIG MOUNTAIN, 사실은 일산이었다고양.','BIG MOUNTAIN',null,'up'],
    ['normal',"일산의 옛 이름은 한뫼, '큰 산'이라고양. 한자로 옮겨 적으니 一山이 된 거라고양.",'한뫼 → 큰 산 → 一山 → 일산',null,'bigmt'],
    ['win','넌 일산을 떠난 게 아니라, 원래 크기의 일산에 올라온 거라고양 🌳','한뫼 → 큰 산 → 一山 → 일산',null,'ilsan'],
    ['normal',"그리고 하나 더. 0세트에서 내가 말했지? '나는 고양이다. 이름은 아직 없다.'",null,null,'cat:normal'],
    ['sour','…그거 거짓말이라고양. 이름 있다고양.',null,null,'cat:sour'],
    ['blank','내 정체는… ㅇㅅㅊ…',null,'slow','ieung'],
    ['wicked','…아니다고양. 못 들은 걸로 하라고양.',null,null,'panic'],
    ['win','이건 완주 배지라고양. 잃어버려도 다시 안 준다고양. 잘 가라고양 🐾',null,'badge','study1']],
  b1:[
    ['win','티끌 모아 반 태산이라고양 ㅋ 한 단어 한 단어가 쌓여서 여기까지 왔다고양.'],
    ['win','반짝이는 건 틀렸다가 끝내 잡은 단어라고양. 제일 빛나는 게 걔들이라고양.'],
    ['normal','B1까지, 1부 끝이라고양. 솔직히… 잘했다고양. 딱 한 번만 말한다고양.'],
    ['wicked','근데 위쪽 점선 보이냐고양? 아직 아무도 안 쌓은 곳이라고양.',null,null,'outline'],
    ['evil','내 정체가 궁금하면 꼭대기까지 오라고양. C1을 누르면 산이 열린다고양 😼',null,null,'question'],
    ['win','1부 도장 쾅이라고양. 배지는 꼭대기까지 와야 준다고양.',null,'badge','study1']]
};
/* 메시지 단어(26.10.16 영신: "공부한 글자중에 carry on이나 study reading good practice dream 이런 단어들은 확 크게 해주는거 어때 메세지를 줄 수 있는것들").
   배운 순서대로 지나가다 이 단어 차례가 오면 화면 위쪽에 아주 크게 1.1초 멈췄다가 제자리로 날아간다. 앞쪽 단어가 몰려 있어 1.3초 간격으로 줄 세운다.
   순서(배운 차례): reading·good·study·practice·dream·progress·courage·challenge·champion(여기까지 B1에도 나옴)·overcome·strive·persist·carry on·pay off.
   빼거나 더하려면 이 목록만 고친다. 산에 없는 단어는 그냥 지나간다. */
var FE_MSG=['reading','good','study','practice','dream','progress','courage','challenge','champion','overcome','strive','persist','carry on','pay off'];
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
  if(!document.getElementById('feScript')){const l=document.createElement('link');l.id='feScript';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Great+Vibes&text=Ilsan&display=swap';document.head.appendChild(l);}
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
  if(lines[f.step][4]&&f.drone)f.drone(lines[f.step][4]);
  if(kind==='badge')feBadge();
  f.ov.querySelector('.fe-hint').hidden=f.step>=lines.length-1;
}
function feBadge(){
  const f=feState,b1=f.mode==='b1',n=feHeads(f.filled),last=f.filled[f.filled.length-1],at=(last&&stAt(last))||Date.now(),d=new Date(at);
  const bd=f.ov.querySelector('.fe-badge'),stg=f.ov.querySelector('.fe-stage');
  // 1부(B1)는 배지 대신 큰 도장, 배지는 전체 완주에서만(26.10.15 영신: "1부는 뱃지가 아니라 그냥 큰 도장 찍어주거나 하는식으로 차등을 두자").
  bd.innerHTML=b1?`<div class="fe-bigstamp"><div class="st-card" style="--st-paper:#fbf5e6"><div class="st-ink">${stampSVG({lesson:B1_LAST,id:'1부'},at,false,{top:'FABLE 1부 완주!',sign:n.toLocaleString('en-US')+'단어'})}</div></div></div>`
    :`<div class="fe-pin">${fePinSVG('FABLE 완주',n.toLocaleString('en-US')+'단어')}<img class="fe-pin-cat" src="${CAT.win}" alt=""></div><div class="fe-date">${d.getFullYear()}. ${d.getMonth()+1}. ${d.getDate()}.</div>`;
  stg.hidden=true;bd.hidden=false;
  if(b1)setTimeout(()=>{if(feState===f)stThump();},380);else fanfare();
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
  const need=bands.reduce((a,b)=>a+b.need,0)*LH/0.9,side=Math.ceil(Math.sqrt(2*need)),B=side,Hm=side,top=0,base=Hm,cx=B/2;
  // 산등성이: 왼쪽은 어깨가 하나 있고 오른쪽은 완만하게. 좌우 폭을 따로 잰다.
  // 봉우리는 둥글게(26.10.16 영신: "peak 를 좀 덜 뾰족하게 하고 깃발을 맞추자"). 꼭대기 근처는 √t 항이 폭을 받쳐 둥근 머리가 된다.
  const cap=t=>.22*Math.sqrt(t)*(1-t);
  const hl=y=>{const t=Math.max(0,(y-top)/(base-top));return (B/2)*(Math.pow(t,.98)*(1+.07*Math.sin(t*8.5+.6)+.025*Math.sin(t*29))+cap(t));};
  const hr=y=>{const t=Math.max(0,(y-top)/(base-top));return (B/2)*(Math.pow(t,1.04)*(1+.05*Math.sin(t*6.3+2.1)+.03*Math.sin(t*23+1))+cap(t));};
  const hw=y=>(hl(y)+hr(y))/2;
  // 층 경계: 아래부터 각 세트가 글자량만큼 넓이를 가져간다. 어긋남은 아래 fillBand의 배율이 메운다.
  const minRow=F*6,area=[];let acc=0;for(let y=base;y>=top;y-=1){const w=hl(y)+hr(y)-F*1.2;if(w>=minRow*.6)acc+=w;area.push([y,acc]);}   // 넓이는 실제로 글자를 놓는 폭(양끝 여백 뺀)으로
  const total=acc,tot=bands.reduce((a,b)=>a+b.need,0);let k=0,cum=0;
  bands.forEach(b=>{b.y1=k?bands[k-1].y0:base;cum+=b.need;const target=total*cum/tot;let y=top;for(const [yy,a] of area){if(a>=target){y=yy;break;}}b.y0=Math.min(b.y1-LH,y);k++;});
  // 줄마다 단어를 왼쪽부터 채운다. 층에 맞는 가장 큰 글자 배율을 찾아 층을 꽉 채운다(26.10.16 영신: "산에 검은 틈? 이 좀 있어 위쪽인데").
  // 전에는 배율을 줄이기만 해서, 줄이 좁은 위쪽 층은 남는 줄이 비어 검은 띠가 됐다. 이제 0.6~1.4배에서 맞는 가장 큰 배율을 고른다.
  const fillBand=(b,sq)=>{const lh=LH*sq,rows=[];for(let y=b.y1-lh;y>=b.y0-lh*.3;y-=lh){const a=hl(y+lh/2)-F*.6,c=hr(y+lh/2)-F*.6;if(a+c>=minRow*.6)rows.push({y,x0:cx-a,x1:cx+c});}
    let r=0,x=rows[0]?.x0;const pos=[];
    for(const wd of b.ws){const ww=wd.w*sq;while(r<rows.length&&x+ww>rows[r].x1){r++;x=rows[r]?.x0;}if(r>=rows.length)return null;pos.push({x,y:rows[r].y,s:sq});x+=ww+GAP*sq;}return pos;};
  bands.forEach(b=>{let lo=.6,hi=1.4,best=fillBand(b,lo),bs=lo;if(!best){b.pos=[];b.sq=lo;return;}
    for(let k=0;k<14;k++){const m=(lo+hi)/2,p=fillBand(b,m);if(p){lo=m;best=p;bs=m;}else hi=m;}b.pos=best;b.sq=bs;});
  return {F,font,LH,B,Hm,top,base,cx,hw,hl,hr,bands};
}
/* 단어의 주마등(26.10.15 영신): "한 단어 한 단어 크게 등장하면서 쌓이게 … 주마등처럼 전부 스쳐지나가게", "말그대로 '단어가 쌓이는'걸",
   "초반부 단어들은 쉬운게 많으니까 빨리 보내버리고 점점 속도를 늦춰서 알아볼수 있는 단어는 후반단어로", "b1은 30초정도, 완전클리어는 1분정도".
   - 배운 순서대로 모든 단어가 화면 가운데 크게 떴다가 작아지며 산의 제자리로 날아가 쌓인다. 산 전체가 처음부터 보이고 아래로부터 차오른다.
   - 속도는 지수로 줄인다: 끝 속도 초당 8개(한 단어씩 알아보는 한계 안), 전체 시간(전체 60초·B1 30초)에 모든 단어가 들어가게 처음 속도를 푼다.
     전체는 초당 450개쯤에서 시작해 마지막 수백 단어(46~50세트)는 하나씩 읽힌다.
   - 빛살·섬광은 뺐다("저 서커스 섬광 연출은 자주쓰니까 … 불꽃놀이 … 장미나 호수 꽃 불꽃놀이(축제) … 무엇보다 중요한건 화려해야함").
     층이 찰 때마다 호수(일산 호수공원)에서 불꽃이 올라가 장미·꽃 모양으로 터지고 수면에 비친다. 다 쌓이면 피날레, 대사 동안에도 가끔 터진다.
   - 산 몸통은 어둡게 깔아 산 안에서는 단어만 빛난다(PRINCIPLES 11). '동작 줄이기'에서는 날아오기·불꽃 없이 차오르기만. */
function feBuild(){
  const f=feState,cv=f.ov.querySelector('.fe-mt'),dpr=Math.min(2,window.devicePixelRatio||1),FONT="'Noto Sans KR',-apple-system,sans-serif";
  const W=Math.min(480,Math.max(260,f.ov.clientWidth||window.innerWidth)),H=Math.round(Math.min(W*1.3,(window.innerHeight||700)*.58));
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px';
  const ctx=cv.getContext('2d');
  const wd=feWorld(f),n=f.mode==='b1'?f.sets.filter(L=>L.lesson<=B1_LAST).length:f.sets.length;
  const rs=Math.min(dpr,4096/Math.max(wd.B,wd.Hm)),world=document.createElement('canvas');world.width=Math.ceil(wd.B*rs);world.height=Math.ceil(wd.Hm*rs);
  const wc=world.getContext('2d');wc.scale(rs,rs);wc.textBaseline='top';
  const shade=(L,i)=>L.lesson>=46?(i%2?'#6fdcc6':'#45c2aa'):L.lesson>B1_LAST?(i%2?'#f39ccb':'#dc68a6'):(i%2?'#bba9ff':'#9b85f2');
  const tint=L=>L.lesson>=46?'111,220,198':L.lesson>B1_LAST?'243,156,203':'187,169,255';
  if(f.mode==='b1'){wc.save();wc.setLineDash([10,10]);wc.strokeStyle='rgba(255,255,255,.45)';wc.lineWidth=3;const yB=wd.bands[n-1].y0;
    wc.beginPath();wc.moveTo(wd.cx-wd.hl(yB),yB);for(let y=yB;y>=wd.top;y-=4)wc.lineTo(wd.cx-wd.hl(y),y);for(let y=wd.top;y<=yB;y+=4)wc.lineTo(wd.cx+wd.hr(y),y);wc.stroke();wc.restore();}
  // 무대: 아래는 호수(일산 호수공원), 그 위에 산 전체. 카메라는 움직이지 않고 산이 아래부터 차오른다.
  const lakeY=H-Math.round(H*.17),fit=Math.min(W/wd.B,(lakeY-34)/wd.Hm)*.97;
  const toS=(x,y)=>[W/2+(x-wd.cx)*fit,lakeY-2-(wd.base-y)*fit];
  const body=new Path2D();body.moveTo(wd.cx-wd.hl(wd.base),wd.base);for(let y=wd.base;y>=wd.top;y-=6)body.lineTo(wd.cx-wd.hl(y)-8,y);for(let y=wd.top;y<=wd.base;y+=6)body.lineTo(wd.cx+wd.hr(y)+8,y);body.closePath();
  // 모든 단어를 익힌 순서대로 한 줄로 세우고, 뜨는 시각을 정한다.
  // 속도 r(t)=r0·e^(-t/τ): 끝 속도 rEnd(초당 8개)와 전체 시간 T가 주어지면 rEnd·τ·(e^(T/τ)-1)=단어 수가 되는 τ를 찾는다.
  const seq=[],need=[];
  for(let i=0;i<n;i++){const b=wd.bands[i];let c=0;b.ws.forEach((w,j)=>{if(b.pos[j]){seq.push({i,w,p:b.pos[j]});c++;}});need.push(c);}
  const N=seq.length,T=f.mode==='b1'?30000:60000,rEnd=.008;
  let lo=300,hi=1e7;for(let k=0;k<80;k++){const m=(lo+hi)/2;if(rEnd*m*Math.expm1(T/m)>N)lo=m;else hi=m;}
  const tau=(lo+hi)/2,r0=rEnd*Math.exp(T/tau),rate=t=>r0*Math.exp(-t/tau)*1000;
  seq.forEach((q,k)=>{q.t=Math.min(T,-tau*Math.log(Math.max(1e-9,1-k/(r0*tau))));});
  f.feSpeed={N,T,tau,r0:r0*1000};f.fxStat=()=>({parts:parts.length,Q:+Q.toFixed(2)});f.fxLock=q=>{Q=q;qLock=true;};f.fxFire=(k,p)=>launch(k,p||'fan',true,OW*.5);   // 검사용(헤드리스는 느려 Q가 내려가므로 폰 화질을 보려면 고정)
  const calm=(()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}})();
  // 불꽃은 화면 전체 두 장: 뒤(하늘, 산과 대사 뒤)와 앞(금빛 반짝임만). 산 안에서는 단어가 가장 밝다.
  const FXR=Math.min(dpr,1.25),mk=c=>{const el=document.createElement('canvas');el.className=c;f.ov.prepend(el);return el;},bg=mk('fe-bg'),fg=mk('fe-fx'),bctx=bg.getContext('2d'),fctx=fg.getContext('2d');
  let OW=0,OH=0,offX=0,offY=0,hid=false;
  const place=()=>{hid=f.ov.querySelector('.fe-stage').hidden;const r=f.ov.getBoundingClientRect(),c=cv.getBoundingClientRect(),w=Math.max(1,f.ov.clientWidth),h=Math.max(1,f.ov.clientHeight);if(!hid){offX=c.left-r.left;offY=c.top-r.top+f.ov.scrollTop;}
    if(w!==OW||h!==OH){OW=w;OH=h;[bg,fg].forEach(el=>{el.width=Math.round(w*FXR);el.height=Math.round(h*FXR);el.style.width=w+'px';el.style.height=h+'px';});}};
  place();
  // 불꽃(26.10.16 영신: "화면 밖까지 나가도 좋으니 더 크고 화려하게 하자 불꽃놀이는 모름지기 돈을 아낌없이 터뜨려줘야지").
  // 큰 불꽃은 반지름이 화면 폭을 넘는다. 기기가 버거우면(프레임이 늘어지면) 알갱이 수를 스스로 줄인다(Q).
  const PAL={rose:['255,79,139','255,150,196','255,214,90'],lav:['187,169,255','150,120,255','255,150,196'],teal:['111,220,198','90,200,255','255,214,90'],
    gold:['255,214,90','255,170,60','255,110,150'],sky:['120,200,255','190,140,255','255,150,196'],fan:['255,79,139','150,120,255','90,200,255','111,220,198','255,214,90'],
    trad:['255,80,80','90,240,130','90,150,255','255,214,90','235,235,255','200,110,255']};
  // 26.10.16 영신: "전통적? 불꽃비중을 늘리고 더 겹겹이", "데이지 모양 불꽃은 전체 구도를 좀 깨는면이 있으니 적게 쓰자 … 이런 전통 형태를 기존 불꽃축제 국룰? 바탕으로 하자".
  // 뽑는 비율(가중치): 모란·국화·변화국이 중심, 겹국화·버드나무·깜빡이는 별, 갈라지는 별, 드물게 오중심·장미(고양시 꽃), 아주 드물게 꽃(데이지)·고리.
  const KW={botan:14,kiku:14,henka:14,yae:9,willow:9,strobe:9,crossette:6,goju:3,rose:3,flower:1,ring:1},
    pick=a=>a[(Math.random()*a.length)|0],pickW=w=>{let r=Math.random()*Object.values(w).reduce((a,b)=>a+b,0);for(const k in w){r-=w[k];if(r<=0)return k;}return 'botan';},
    TRAD=['botan','kiku','henka'],SMW={botan:5,kiku:4,henka:4,strobe:3,crossette:2},
    PALS=['trad','trad','trad','fan','gold','rose','lav','teal','sky'];
  const shells=[],parts=[],front=[],later=[];let lastFx=performance.now(),lastFw=-1e9,Q=1,ema=16,fgDirty=false,qLock=false,lastSM=0,smOpen=false;
  // 호수에서 쏘아 올려 하늘에서 터진다. 여러 발을 나란히(일제 사격)도 쏜다.
  // sm: 스타마인용 작은 불꽃(낮게, 로켓이 짧다)
  const launch=(kind,pal,big,x,sm)=>{if(calm)return;x=x??OW*(.06+Math.random()*.88);const top=dLogo?OH*.26:OH*.04,low=Math.max(top+40,offY+lakeY*.55),
      y=sm?Math.max(top,offY+lakeY*(.22+Math.random()*.38)):top+Math.random()*(low-top);
    shells.push({x0:x+(Math.random()-.5)*(sm?20:50),y0:hid?OH:offY+lakeY,x,y,t:performance.now(),dur:sm?300+Math.random()*140:560+Math.random()*300,kind,pal,big,sm,dbl:!sm&&TRAD.includes(kind)&&Math.random()<.45});};
  const salvo=(k,kind,pal,big)=>{for(let i=0;i<k;i++)launch(kind||pickW(KW),pal||pick(PALS),big,OW*((i+.5+(Math.random()-.5)*.5)/k));};
  const show=big=>{if(Math.random()<.45)salvo(2+((Math.random()*3)|0),null,null,big);else launch(pickW(KW),pick(PALS),big);};
  const later2=(ms,fn)=>setTimeout(()=>{if(feState===f)fn();},ms);
  // 혜성(彗星): 터지지 않고 긴 꼬리로 솟는 별. 부채꼴(扇面)·교차(交叉对射)로 쏜다.
  const comet=(x,ang,rgb='255,214,150')=>{if(calm||parts.length>9000)return;const v=.36+Math.random()*.08,y=hid?OH:offY+lakeY;P(x,y,Math.cos(ang)*v,Math.sin(ang)*v,rgb,2.3,1300+Math.random()*300,.00022,{tl:8,dr:.994,trgb:'255,190,110'});};
  const fanC=(xc,k=9,sp=1.1,ms=360)=>{for(let i=0;i<k;i++)later2(i*ms/k,()=>comet(xc,-Math.PI/2-sp/2+sp*i/(k-1)));};
  const crossC=(k=6,ms=700)=>{for(let i=0;i<k;i++)later2(i*ms/k,()=>{comet(OW*.04,-Math.PI/2+.62,'190,220,255');comet(OW*.96,-Math.PI/2-.62,'255,190,230');});};
  // 스타마인(速射連発): 짧은 간격으로 작은 불꽃을 쏟아붓는다. 개막·막간·피날레의 국룰.
  const starmine=(ms,rate,big)=>{if(calm)return;const k=Math.round(ms/1000*rate),B=[.18,.5,.82];
    for(let i=0;i<k;i++)later2(i*1000/rate+Math.random()*40,()=>{const bx=OW*(pick(B)+(Math.random()-.5)*.14);launch(pickW(SMW),pick(PALS),big&&Math.random()<.3,bx,true);if(Math.random()<.25)comet(bx,-Math.PI/2+(Math.random()-.5)*.7);});
    if(ms>1200){later2(ms*.3,()=>fanC(OW*.5));later2(ms*.65,()=>{fanC(OW*.22,7,.9);fanC(OW*.78,7,.9);});}};
  // 나이아가라(황금 폭포): 화면 꼭대기 줄에서 금빛 불똥이 쏟아져 내린다. 피날레의 국룰.
  let niaUntil=0;const niagara=ms=>{if(!calm)niaUntil=performance.now()+ms;};
  // 구 모양(3차원 공을 화면에 비춘 것): 가장자리가 촘촘한 꽉 찬 원. 전통 불꽃은 이렇게 터진다.
  const ring=(k,fn)=>{const o=Math.random()*6.283;for(let i=0;i<k;i++){const a=o+i/k*6.283;fn(Math.cos(a),Math.sin(a),i);}};   // 芯: 또렷한 동심원
  const sph=(k,fn)=>{for(let i=0;i<k;i++){const z=1-2*(i+.5)/k,r=Math.sqrt(1-z*z),t=i*2.39996;fn(Math.cos(t)*r,Math.sin(t)*r,i);}};
  // 불꽃 알갱이: 색마다 빛 방울 그림을 한 번 만들어 두고 찍는다. 꼬리는 색·밝기별로 묶어 한 번에 긋는다.
  const SPR={},spr=rgb=>{if(SPR[rgb])return SPR[rgb];const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),gr=g.createRadialGradient(16,16,0,16,16,16);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.18,`rgba(${rgb},.95)`);gr.addColorStop(.45,`rgba(${rgb},.28)`);gr.addColorStop(1,`rgba(${rgb},0)`);g.fillStyle=gr;g.fillRect(0,0,32,32);return SPR[rgb]=c;};
  const P=(x,y,vx,vy,rgb,r,max,g,o)=>parts.push(Object.assign({x,y,px:x,py:y,vx,vy,life:0,max,r,rgb,g,dr:.985,tl:2.2},o));
  // 모양: 전통 셋(위), 장미(꽃잎 다섯 장 세 겹, 고양시 꽃), 꽃(꽃잎 여덟 장, 꽃박람회), 국화(공, 반쯤 가서 색이 바뀜), 황금 버드나무(길게 늘어짐),
  // 고리(기울어진 토성 고리), 갈라지는 별(중간에 넷으로). 반짝이(깜빡이는 알갱이)를 섞는다.
  const burst=sh=>{let big=sh.big,V=(big?.3:.2)*(.88+Math.random()*.24),pal=PAL[sh.pal]||PAL.rose,pc=i=>pal[i%pal.length],rot=Math.random()*6.283,
      M=()=>1700+Math.random()*700,R=big?2.6:2.1,n=k=>Math.max(10,Math.round(k*Q)),X=sh.x,Y=sh.y;
    if(parts.length>9000)return;
    if(sh.sm){V*=.62;}const n2=k=>n(sh.sm?k*.5:k);
    // 전통: 모란(꼬리 없이 점), 국화(금빛 꼬리를 끌며), 변화국(퍼지다가 색이 두 번 바뀜), 깜빡이는 별, 겹국화(공 + 동심원 芯 둘)
    if(sh.kind==='kiku'){const k=n2(big?240:150);sph(k,(x,y,i)=>P(X,Y,x*V,y*V,i%3?'255,214,150':pc(i),R,M(),.00009,{tl:3.6,trgb:'255,170,80'}));}
    else if(sh.kind==='henka'){const k=n2(big?230:150),c=(Math.random()*pal.length)|0;sph(k,(x,y)=>P(X,Y,x*V,y*V,pc(c),R*1.05,M(),.00009,{c2:pc(c+1),ct:.35,c3:pc(c+2),ct3:.68,tl:1.8,trgb:'255,190,110'}));}
    else if(sh.kind==='strobe'){const k=n2(big?190:120);sph(k,(x,y,i)=>P(X,Y,x*V*.85,y*V*.85,i%4?'235,240,255':'255,236,170',R*.95,2300+Math.random()*700,.00005,{strobe:1,tl:.6,dr:.982}));}
    else if(sh.kind==='botan'){const k=n2(big?200:130);sph(k,(x,y,i)=>P(X,Y,x*V,y*V,pc(i),R*1.15,M(),.00009,{c2:pc(i+2),ct:.55,tl:.9}));}
    else if(sh.kind==='yae'){const k=n(big?220:140),c=(Math.random()*pal.length)|0;
      sph(k,(x,y)=>P(X,Y,x*V,y*V,pc(c),R,M(),.00009,{c2:pc(c+1),ct:.5,tl:3}));
      ring(n(big?80:56),(x,y)=>P(X,Y,x*V*.6,y*V*.6,pc(c+2),R*1.1,M()*.95,.00009,{tl:.9}));
      ring(n(big?44:30),(x,y)=>P(X,Y,x*V*.3,y*V*.3,pc(c+3),R*1.05,M()*.9,.00009,{strobe:1,tl:.9}));}
    // 오중심(五重芯)급: 바깥 국화 + 안쪽 芯 넷, 동심원 다섯 겹. 겹마다 색이 다르다(26.10.16 영신: "동심원 수가 더 많은 불꽃").
    else if(sh.kind==='goju'){const k=n(240),c=(Math.random()*pal.length)|0;
      sph(k,(x,y)=>P(X,Y,x*V*1.05,y*V*1.05,pc(c),R,M()*1.05,.00008,{c2:pc(c+1),ct:.55,tl:2.6}));
      [[.8,110],[.6,84],[.41,60],[.22,36]].forEach(([f,m],j)=>ring(n(m),(x,y)=>P(X,Y,x*V*f,y*V*f,pc(c+2+j),R*1.1,M()*(1-j*.05),.00008,{tl:.8,strobe:j===3?1:0})));}
    else if(sh.kind==='rose'){const k=n(big?220:140);
      for(let i=0;i<k;i++){const th=i/k*Math.PI,r=Math.cos(5*th),a=th+rot;P(X,Y,Math.cos(a)*r*V,Math.sin(a)*r*V,i%4?'255,79,139':'255,150,196',R,M(),.00007);}
      const k2=Math.round(k*.6);for(let i=0;i<k2;i++){const th=i/k2*Math.PI,r=Math.cos(5*th)*.6,a=th+rot+.63;P(X,Y,Math.cos(a)*r*V,Math.sin(a)*r*V,i%3?'255,186,214':'255,120,170',R*.9,M(),.00007);}
      const k3=Math.round(k*.35);for(let i=0;i<k3;i++){const th=i/k3*Math.PI,r=Math.cos(5*th)*.3,a=th+rot;P(X,Y,Math.cos(a)*r*V,Math.sin(a)*r*V,'255,214,90',R*.85,M(),.00007,{strobe:1});}}
    else if(sh.kind==='flower'){const k=n(big?230:150);
      for(let i=0;i<k;i++){const th=i/k*6.283,r=.22+.78*Math.abs(Math.cos(4*th)),a=th+rot;P(X,Y,Math.cos(a)*r*V,Math.sin(a)*r*V,pc(i>>1),R,M(),.00008);}
      const m=n(36);for(let i=0;i<m;i++){const a=i/m*6.283;P(X,Y,Math.cos(a)*V*.17,Math.sin(a)*V*.17,'255,214,90',R,1500,.00004,{strobe:1});}}
    else if(sh.kind==='willow'){const k=n(big?140:90);
      for(let i=0;i<k;i++){const a=i/k*6.283+rot,v=V*.85*(.9+Math.random()*.2);P(X,Y,Math.cos(a)*v,Math.sin(a)*v,i%5?'255,190,90':'255,236,170',R*.9,2800+Math.random()*900,.00013,{dr:.978,tl:7});}}
    else if(sh.kind==='ring'){const k=n(big?160:110),tilt=.35+Math.random()*.4,co=Math.cos(rot),si=Math.sin(rot);
      for(let i=0;i<k;i++){const a=i/k*6.283,x=Math.cos(a)*V,y=Math.sin(a)*V*tilt;P(X,Y,x*co-y*si,x*si+y*co,pc(0),R,M(),.00006);}
      const m=Math.round(k*.6);for(let i=0;i<m;i++){const a=Math.random()*6.283,v=V*.45*(.9+Math.random()*.2);P(X,Y,Math.cos(a)*v,Math.sin(a)*v,pc(1),R*.9,M(),.00008,{c2:pc(2),ct:.45});}}
    else if(sh.kind==='crossette'){const k=n(big?28:20);
      for(let i=0;i<k;i++){const a=i/k*6.283+rot,v=V*.75;P(X,Y,Math.cos(a)*v,Math.sin(a)*v,pc(i),R*1.1,1100,.00006,{split:520+Math.random()*120,tl:3});}}
    else{const k=n(big?220:140);
      for(let i=0;i<k;i++){const a=i/k*6.283+rot,v=V*(.94+Math.random()*.12);P(X,Y,Math.cos(a)*v,Math.sin(a)*v,pc(i),R,M(),.00009,{c2:pc(i+1),ct:.5});}
      const m=Math.round(k*.45);for(let i=0;i<m;i++){const a=Math.random()*6.283,v=V*.55*(.9+Math.random()*.2);P(X,Y,Math.cos(a)*v,Math.sin(a)*v,'255,244,220',R*.8,M()*.85,.00009,{strobe:1});}}
    if(sh.dbl)later.push({t:performance.now()+260+Math.random()*180,sh:{x:X+(Math.random()-.5)*30,y:Y+(Math.random()-.5)*30,kind:pick(TRAD),pal:pick(PALS),big:false,dbl:false}});
    flash.push({x:X,y:Y,t:performance.now(),rgb:sh.kind==='rose'?'255,79,139':sh.kind==='willow'?'255,190,90':pal[0],R:sh.sm?70:big?170:110});};
  const flash=[];
  const sparkle=(x,y,k=10,rgb='255,214,90',sp=1)=>{if(calm)return;for(let i=0;i<k;i++){const a=Math.random()*6.283,v=(.05+Math.random()*.12)*sp;front.push({x,y,px:x,py:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:0,max:600+Math.random()*400,r:1.7,rgb,g:.00005,dr:.985,tl:2.2});}};
  const stepParts=(arr,c,dt,now,refl)=>{const ly=offY+lakeY,lb=offY+H,d0=Math.pow(.985,dt/16),tails=new Map(),rf=refl&&Q>.6;
    for(let i=arr.length-1;i>=0;i--){const q=arr[i];q.life+=dt;if(q.life>=q.max||q.x<-90||q.x>OW+90||q.y>OH+90){arr.splice(i,1);continue;}
      const dr=q.dr===.985?d0:Math.pow(q.dr,dt/16);q.px=q.x;q.py=q.y;q.vx*=dr;q.vy=q.vy*dr+q.g*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;
      if(q.split&&q.life>=q.split){const b=Math.atan2(q.vy,q.vx)+.785;for(let j=0;j<4;j++){const a=b+j*1.571;arr.push({x:q.x,y:q.y,px:q.x,py:q.y,vx:q.vx*.3+Math.cos(a)*.12,vy:q.vy*.3+Math.sin(a)*.12,life:0,max:750+Math.random()*250,r:q.r*.8,rgb:q.rgb,g:.00008,dr:.98,tl:3});}arr.splice(i,1);continue;}
      if(q.c2&&q.life>q.max*q.ct){q.rgb=q.c2;q.c2=0;}else if(q.c3&&!q.c2&&q.life>q.max*q.ct3){q.rgb=q.c3;q.c3=0;}
      const a0=Math.min(1,q.life/180),a=a0*a0*Math.pow(1-q.life/q.max,1.4),tw=q.strobe?((((q.life+i*37)/55)|0)%2?1:.12):.7+.3*Math.sin(q.life*.045+i),key=(q.trgb||q.rgb)+'|'+Math.min(3,Math.floor(a*4));
      let t=tails.get(key);if(!t)tails.set(key,t=[]);t.push(q.x-(q.x-q.px)*q.tl,q.y-(q.y-q.py)*q.tl,q.x,q.y);
      const s=q.r*2.8;c.globalAlpha=a*tw;c.drawImage(spr(q.rgb),q.x-s,q.y-s,s*2,s*2);
      if(rf&&i%2===0&&q.y<ly){const ry=ly+(ly-q.y)*.42;if(ry<lb){c.globalAlpha=a*.45*(1-(ry-ly)/(lb-ly));c.drawImage(spr(q.rgb),q.x-s*1.3+Math.sin(now*.005+q.y*.07)*2.5,ry-s*.4,s*2.6,s*.8);}}}
    c.lineWidth=1.4;tails.forEach((t,key)=>{const [rgb,b]=key.split('|');c.globalAlpha=(+b+1)/4*.55;c.strokeStyle=`rgb(${rgb})`;c.beginPath();for(let j=0;j<t.length;j+=4){c.moveTo(t[j],t[j+1]);c.lineTo(t[j+2],t[j+3]);}c.stroke();});
    c.globalAlpha=1;};
  const fxStep=(now,lake)=>{const dt=Math.min(50,now-lastFx);lastFx=now;
    // 화질 조절: 프레임이 늘어지면 새 불꽃의 알갱이 수를 줄이고, 여유가 생기면 되돌린다.
    ema=ema*.92+dt*.08;if(qLock);else if(ema>21||parts.length>6500)Q=Math.max(.35,Q-.04);else if(ema<17.5)Q=Math.min(1,Q+.004);
    let c=bctx;c.setTransform(FXR,0,0,FXR,0,0);c.clearRect(0,0,OW,OH);c.globalCompositeOperation='lighter';
    for(let i=flash.length-1;i>=0;i--){const fl=flash[i],p=(now-fl.t)/450;if(p>=1){flash.splice(i,1);continue;}const g=c.createRadialGradient(fl.x,fl.y,0,fl.x,fl.y,fl.R*(1+p*.6));g.addColorStop(0,`rgba(${fl.rgb},${.2*(1-p)})`);g.addColorStop(1,`rgba(${fl.rgb},0)`);c.fillStyle=g;c.beginPath();c.arc(fl.x,fl.y,fl.R*(1+p*.6),0,6.283);c.fill();}
    for(let i=shells.length-1;i>=0;i--){const sh=shells[i],p=(now-sh.t)/sh.dur;if(p>=1){shells.splice(i,1);burst(sh);continue;}
      const e=1-Math.pow(1-p,2.2),x=sh.x0+(sh.x-sh.x0)*e,y=sh.y0+(sh.y-sh.y0)*e;
      c.strokeStyle='rgba(255,210,150,.5)';c.lineWidth=1.6;c.beginPath();c.moveTo(x,y);c.lineTo(x-(sh.x-sh.x0)*.04,y+22*(1-p)+6);c.stroke();
      c.drawImage(spr('255,226,180'),x-6,y-6,12,12);
      if(lake){const ly=offY+lakeY;c.globalAlpha=.4;c.drawImage(spr('255,226,180'),x-5,ly+(ly-y)*.42-2,10,4);c.globalAlpha=1;}}
    for(let i=later.length-1;i>=0;i--)if(now>=later[i].t){const l=later.splice(i,1)[0];burst(l.sh);}
    if(now<niaUntil&&parts.length<9000){const k=Math.round(OW/10*Q*Math.min(2,dt/16));for(let i=0;i<k;i++){const x=OW*(.02+.96*Math.random());P(x,OH*.03+Math.random()*4,(Math.random()-.5)*.02,.02+Math.random()*.04,Math.random()<.2?'255,250,230':'255,200,110',1.6,1500+Math.random()*700,.00038,{tl:3,strobe:Math.random()<.15?1:0,dr:.99});}}
    stepParts(parts,c,dt,now,lake);c.globalCompositeOperation='source-over';
    if(front.length||fgDirty||dOn){c=fctx;c.setTransform(FXR,0,0,FXR,0,0);c.clearRect(0,0,OW,OH);stepParts(front,c,dt,now,false);const lit=dStep(c,now);fgDirty=front.length>0||lit;}};
  /* 드론 쇼(26.10.16 영신: "이거 사실 하고 싶었는데 생각만 하고 있었어 !"). 일산호수공원 고양호수예술축제의 불꽃 드론처럼
     호수에 꺼진 채 늘어선 650대(고양이 픽셀 그림 한 칸에 한 대)가 대사에 맞춰 떠올라 모양을 바꾼다.
     전체: 떠오름 → 一山 → 일산 → 고양이 얼굴(표정도 대사를 따라) → ㅇㅅㅊ(지직) → 흩어졌다 시치미 뗀 얼굴 → 착륙.
     B1: 위쪽 점선 윤곽을 따라 늘어섬 → '?' → 착륙. 드론이 떠 있는 동안 작은 불꽃은 쉰다. 좌표는 무대 기준(대사 줄 수가 바뀌어 무대가 움직여도 산과 맞게). */
  const DN=650,drones=[];let dOn=false,dHold=false,dGlitch=false,dHomeSet=false,dSeq=0,dLogo=false;
  const SCRIPT="'Great Vibes','Snell Roundhand','Zapfino','Apple Chancery','Brush Script MT',cursive";
  for(let i=0;i<DN;i++)drones.push({x:0,y:0,sx:0,sy:0,tx:0,ty:0,t0:0,d:0,dur:1,rgb:'255,255,255',nrgb:'255,255,255',a:0,la:0,lit:0});
  const dHome=()=>drones.forEach((d,i)=>{const r=((i*397)%DN)/DN;d.x=d.sx=d.tx=W*(.04+.92*r);d.y=d.sy=d.ty=lakeY+3+(i%3)*2.5;});
  const skyBox=()=>{if(f.mode==='b1'){const [,ty]=toS(wd.cx,wd.top),[,by]=toS(wd.cx,wd.bands[n-1].y0),h=by-ty;return {x0:W*.24,y0:ty+h*.3,x1:W*.76,y1:by-h*.06};}
    const [,py]=toS(wd.cx,wd.top),y1=py-18;let y0=Math.max(-offY+10,y1-170);if(y1-y0<90)y0=y1-90;return {x0:-offX+OW*.05,y0,x1:-offX+OW*.86,y1};};   // 오른쪽 위 ✕ 단추는 비운다
  // 칠한 그림에서 점을 고른다: 칠한 넓이로 간격을 정해 DN개쯤
  const maskPts=(box,draw)=>{const w=Math.max(8,Math.round(box.x1-box.x0)),h=Math.max(8,Math.round(box.y1-box.y0)),c=document.createElement('canvas');c.width=w;c.height=h;
    const g=c.getContext('2d');draw(g,w,h);const im=g.getImageData(0,0,w,h).data;let area=0;for(let i=3;i<im.length;i+=4)if(im[i]>128)area++;
    const st=Math.max(2,Math.sqrt(area/DN)),pts=[];for(let y=st/2;y<h;y+=st)for(let x=st/2;x<w;x+=st){const k=((y|0)*w+(x|0))*4;if(im[k+3]>128)pts.push([box.x0+x,box.y0+y,`${im[k]},${im[k+1]},${im[k+2]}`]);}return pts;};
  // 맨 위 띠(STUDY1): 배지·큰 도장이 가운데를 차지해도 겹치지 않게 화면 꼭대기
  const topBox=()=>({x0:-offX+OW*.06,y0:-offY+14,x1:-offX+OW*.84,y1:-offY+14+Math.min(110,OH*.13)});
  // 여러 줄 글자: [글자, 글꼴, 줄 높이 비율, 세로 자리 비율, 색들]
  const linesPts=(box,L)=>maskPts(box,(g,w,h)=>L.forEach(([txt,fam,hs,yr,cols,wt])=>{let sz=h*hs;g.font=`${wt||900} ${sz}px ${fam}`;const tw=g.measureText(txt).width;if(tw>w*.92){sz*=w*.92/tw;g.font=`${wt||900} ${sz}px ${fam}`;}
    g.textAlign='center';g.textBaseline='middle';const gr=g.createLinearGradient(0,0,w,0);cols.forEach((c,i)=>gr.addColorStop(i/Math.max(1,cols.length-1),c));g.fillStyle=gr;g.fillText(txt,w/2,h*yr);}));
  const textPts=(txt,cols)=>maskPts(skyBox(),(g,w,h)=>{let sz=h*.92;g.font=`900 ${sz}px ${FONT}`;const tw=g.measureText(txt).width;if(tw>w*.9){sz*=w*.9/tw;g.font=`900 ${sz}px ${FONT}`;}
    g.textAlign='center';g.textBaseline='middle';const gr=g.createLinearGradient(0,0,w,0);cols.forEach((c,i)=>gr.addColorStop(i/Math.max(1,cols.length-1),c));g.fillStyle=gr;g.fillText(txt,w/2,h/2);});
  // 고양이 얼굴: 픽셀 그림(SVG 칸) 한 칸이 드론 한 대. 어두운 칸(테두리·눈)은 불을 끈 드론이라 눈이 까맣게 보인다.
  const catPts=expr=>{const box=skyBox(),svg=atob((CAT[expr]||CAT.normal).split(',')[1]),vb=(/viewBox="0 0 (\d+) (\d+)"/.exec(svg)||[0,30,33]),W0=+vb[1],H0=+vb[2];
    const cs=Math.min((box.x1-box.x0)/W0,(box.y1-box.y0)/H0),ox=(box.x0+box.x1)/2-W0*cs/2,oy=(box.y0+box.y1)/2-H0*cs/2,pts=[],re=/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)" fill="#([0-9a-fA-F]{6})"/g;let m;
    while((m=re.exec(svg))){const r=parseInt(m[5].slice(0,2),16),g=parseInt(m[5].slice(2,4),16),b=parseInt(m[5].slice(4),16),dark=r+g+b<160;
      for(let yy=0;yy<+m[4];yy++)for(let xx=0;xx<+m[3];xx++)pts.push([ox+(+m[1]+xx+.5)*cs,oy+(+m[2]+yy+.5)*cs,dark?null:`${r},${g},${b}`]);}return pts;};
  const gridPts=()=>{const b=skyBox(),cols=Math.round(Math.sqrt(DN*(b.x1-b.x0)/(b.y1-b.y0))),rows=Math.ceil(DN/cols),pts=[];
    for(let i=0;i<DN;i++){const cx=i%cols,cy=(i/cols)|0;pts.push([b.x0+(cx+.5)*(b.x1-b.x0)/cols,b.y0+(cy+.5)*(b.y1-b.y0)/rows,cy%2?'170,200,255':'255,255,255']);}return pts;};
  const scatterPts=()=>{const b=skyBox(),C=['255,79,139','120,255,255','255,214,90','190,140,255','255,255,255'];return drones.map(()=>[b.x0+Math.random()*(b.x1-b.x0),b.y0-20+Math.random()*(b.y1-b.y0+40),pick(C)]);};
  const outlinePts=()=>{const yB=wd.bands[n-1].y0,L=[];for(let y=yB;y>=wd.top;y-=2)L.push([wd.cx-wd.hl(y),y]);for(let y=wd.top;y<=yB;y+=2)L.push([wd.cx+wd.hr(y),y]);
    const seg=[0];for(let i=1;i<L.length;i++)seg.push(seg[i-1]+Math.hypot(L[i][0]-L[i-1][0],L[i][1]-L[i-1][1]));const tot=seg[seg.length-1],pts=[];let j=0;
    for(let i=0;i<DN;i++){const dd=tot*i/(DN-1);while(j<seg.length-2&&seg[j+1]<dd)j++;const u=(dd-seg[j])/Math.max(1e-6,seg[j+1]-seg[j]),[x,y]=toS(L[j][0]+(L[j+1][0]-L[j][0])*u,L[j][1]+(L[j+1][1]-L[j][1])*u);pts.push([x,y,i%7?'190,170,255':'255,255,255']);}return pts;};
  const landPts=()=>drones.map((d,i)=>[W*(.04+.92*((i*397)%DN)/DN),lakeY+3+(i%3)*2.5,null]);
  // 짝짓기: 지금 자리와 새 자리를 같은 순서(가로 우선)로 늘어놓고 차례로 잇는다. 같은 점 집합(표정만 바뀜)이면 제자리에서 색만 바뀐다.
  const dForm=(pts,o={})=>{if(calm)return;if(!dHomeSet){dHome();dHomeSet=true;}dOn=true;const now=performance.now();
    let P=pts.slice();if(P.length>DN){const k=P.length/DN;P=Array.from({length:DN},(_,i)=>P[Math.floor(i*k)]);}
    while(P.length<DN){const q=P.length?P[(Math.random()*P.length)|0]:[W/2,0,null];P.push([q[0],q[1],null]);}
    const key=p=>p[0]+p[1]*.37,D=drones.slice().sort((a,b)=>key([a.x,a.y])-key([b.x,b.y]));P.sort((a,b)=>key(a)-key(b));
    D.forEach((d,i)=>{const p=P[i];d.sx=d.x;d.sy=d.y;d.tx=p[0];d.ty=p[1];d.t0=now;d.d=(o.stagger||350)*Math.random();d.dur=o.dur||1500;d.la=d.a;d.lit=p[2]?1:0;if(p[2])d.nrgb=p[2];});
    dGlitch=!!o.glitch;};
  f.drone=cmd=>{if(calm)return;dHold=cmd!=='land'&&cmd!=='study1';dLogo=cmd==='study1';const id=++dSeq,now2=fn=>{if(id===dSeq&&feState===f)fn();};
    if(cmd==='up')dForm(gridPts(),{stagger:900,dur:1900});
    // 한뫼 = 큰 산 = BIG MOUNTAIN(게임이 처음부터 부르던 이름). 일산은 화려한 필기체 Ilsan 아래 BIG MOUNTAIN(26.10.16 영신: "일산은 한자 말구 BIG MOUNT 같이 띄우자", "일산 영어는 화려한 서체로").
    else if(cmd==='bigmt')dForm(linesPts(skyBox(),[['BIG',FONT,.44,.27,['#ffd34d','#fff1b8','#ffb347']],['MOUNTAIN',FONT,.44,.75,['#ffb347','#fff1b8','#ffd34d']]]),{dur:1600});
    else if(cmd==='ilsan'){const go=()=>now2(()=>dForm(linesPts(skyBox(),[['Ilsan',SCRIPT,.8,.4,['#ff9ccb','#ffffff','#6fdcc6'],400],['BIG MOUNTAIN',FONT,.17,.91,['#ffd34d','#fff1b8','#ffd34d']]]),{dur:1700}));
      let done=false;const once=()=>{if(!done){done=true;go();}};try{document.fonts.load("100px 'Great Vibes'",'Ilsan').then(once,once);}catch(e){once();}setTimeout(once,700);}
    else if(cmd==='study1')dForm(linesPts(topBox(),[['STUDY1',FONT,.82,.52,['#ffffff','#bba9ff','#ff9ccb','#ffffff']]]),{stagger:600,dur:1800});
    else if(cmd.startsWith('cat:'))dForm(catPts(cmd.slice(4)),{dur:1700});
    else if(cmd==='ieung')dForm(textPts('ㅇㅅㅊ',['#78ffff','#ff5adc','#78ffff']),{dur:1300,glitch:true});
    else if(cmd==='panic'){dForm(scatterPts(),{stagger:120,dur:520});setTimeout(()=>now2(()=>dForm(catPts('wicked'),{stagger:250,dur:1100})),500);}
    else if(cmd==='outline')dForm(outlinePts(),{stagger:1100,dur:1900});
    else if(cmd==='question')dForm(textPts('?',['#ffd34d','#ff9ccb','#bba9ff']),{dur:1500});
    else if(cmd==='land')dForm(landPts(),{stagger:500,dur:1500});};
  const dStep=(c,now)=>{if(!dOn)return false;let any=false;c.globalCompositeOperation='lighter';
    for(const d of drones){const u=Math.min(1,Math.max(0,(now-d.t0-d.d)/d.dur)),e=u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
      d.x=d.sx+(d.tx-d.sx)*e;d.y=d.sy+(d.ty-d.sy)*e;if(u>.45)d.rgb=d.nrgb;d.a=d.la+(d.lit-d.la)*Math.min(1,u*1.6);
      if(d.a<.02)continue;any=true;let x=d.x+offX,y=d.y+offY,rgb=d.rgb;
      if(dGlitch&&Math.random()<.05){x+=(Math.random()-.5)*12;rgb=Math.random()<.5?'255,90,220':'120,255,255';}
      c.globalAlpha=d.a*(.82+.18*Math.sin(now*.005+d.tx*.3));c.drawImage(spr(rgb),x-2.4,y-2.4,4.8,4.8);}
    c.globalAlpha=1;c.globalCompositeOperation='source-over';if(!any&&!dHold&&!dLogo)dOn=false;return any;};
  // 산 그림: 다 내려앉은 단어(world)를 무대 크기로 줄여 둔다. 호수에는 산이 거꾸로 비친다.
  const mini=document.createElement('canvas');mini.width=cv.width;mini.height=cv.height;const mc=mini.getContext('2d');let miniAt=-1e9,landedTop=wd.base,dr0=null,bodyTop=null;
  const MT=[dpr*fit,0,0,dpr*fit,dpr*(W/2-wd.cx*fit),dpr*(lakeY-2-wd.base*fit)];
  const drawMini=all=>{const d=all?{x0:0,y0:0,x1:wd.B,y1:wd.Hm}:dr0;dr0=null;if(!d)return;mc.setTransform(...MT);
    const x0=Math.max(0,d.x0-2),y0=Math.max(0,d.y0-2),x1=Math.min(wd.B,d.x1+2),y1=Math.min(wd.Hm,d.y1+2);
    mc.clearRect(x0,y0,x1-x0,y1-y0);mc.drawImage(world,x0*rs,y0*rs,(x1-x0)*rs,(y1-y0)*rs,x0,y0,x1-x0,y1-y0);};
  drawMini(true);   // B1 점선처럼 처음부터 있는 것
  const cnt=new Array(n).fill(0);let wFont='';
  const land=q=>{const F=`700 ${(wd.F*q.p.s).toFixed(2)}px ${FONT}`;if(F!==wFont)wc.font=wFont=F;
    if(q.w.gold){wc.fillStyle='#ffd34d';wc.shadowColor='rgba(255,211,77,.9)';wc.shadowBlur=4;}else{wc.fillStyle=shade(wd.bands[q.i].L,q.i);wc.shadowBlur=0;}
    wc.fillText(q.w.t,q.p.x,q.p.y);wc.shadowBlur=0;if(q.p.y<landedTop)landedTop=q.p.y;cnt[q.i]++;seen.add(q.w.k);
    const x1=q.p.x+q.w.w*q.p.s,y1=q.p.y+wd.F*q.p.s*1.3;if(!dr0)dr0={x0:q.p.x,y0:q.p.y,x1,y1};else{dr0.x0=Math.min(dr0.x0,q.p.x);dr0.y0=Math.min(dr0.y0,q.p.y);dr0.x1=Math.max(dr0.x1,x1);dr0.y1=Math.max(dr0.y1,y1);}};
  // 산 몸통(어둡게)과 단어. 호수에는 둘 다 거꾸로 비친다.
  const mount=(alpha)=>{ctx.save();ctx.setTransform(...MT);ctx.beginPath();const bt=bodyTop??landedTop-14;ctx.rect(-20,bt,wd.B+40,wd.Hm-bt+2);ctx.clip();ctx.globalAlpha=alpha;ctx.fillStyle='rgba(18,6,34,.8)';ctx.fill(body);ctx.restore();};
  const scene=now=>{if(dr0&&now-miniAt>60){drawMini(false);miniAt=now;}
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);
    const lg=ctx.createLinearGradient(0,lakeY*dpr,0,H*dpr);lg.addColorStop(0,'rgba(70,48,140,.42)');lg.addColorStop(1,'rgba(12,6,34,.12)');ctx.fillStyle=lg;ctx.fillRect(0,lakeY*dpr,cv.width,(H-lakeY)*dpr);
    ctx.save();ctx.beginPath();ctx.rect(0,lakeY*dpr,cv.width,(H-lakeY)*dpr);ctx.clip();ctx.globalAlpha=.3;ctx.setTransform(1,0,0,-.42,0,lakeY*dpr*1.42);ctx.drawImage(mini,0,0);ctx.restore();
    ctx.fillStyle='rgba(210,190,255,.4)';ctx.fillRect(0,(lakeY-1)*dpr,cv.width,Math.max(1,dpr));
    mount(1);ctx.drawImage(mini,0,0);};
  // 날아오는 단어: 가운데 크게 떴다가(느릴 때는 잠깐 머물러 읽힌다) 작아지며 제자리로 날아가 앉는다.
  const LX=W/2,LY=lakeY*.42,flyers=[],seen=new Set();
  // 메시지 시간표(26.10.16 영신: "시간 간격이 오히려 사이가 점점 줄어드는게 좋을듯 스토리는 좋아!"): 단어는 점점 느려지고 메시지는 점점 잦아져 끝에서 만난다.
  // 첫 메시지 1초, 마지막은 끝 1초 전, 사이 간격은 0.82배씩 줄어든다. 제 차례(배운 순서)보다 앞당기지는 않고, 늦어진 단어는 그만큼 늦게 앉는다.
  const MSGQ=new Map(),MSGW=[];{const want=new Set(FE_MSG.map(t=>t.toLowerCase())),hits=[];
    seq.forEach((q,k)=>{const t=String(q.w.t).toLowerCase();if(want.has(t)){want.delete(t);hits.push(k);}});
    const M=hits.length,R=.82,a0=Math.max(seq[hits[0]]?.t||0,1000),a1=Math.max(seq[hits[M-1]]?.t||0,T-1000),span=Math.max(0,a1-a0),d0=M>1?span*(1-R)/(1-Math.pow(R,M-1)):0;
    let tt=a0,prev=-1e9;hits.forEach((k,i)=>{if(i)tt+=d0*Math.pow(R,i-1);const t=Math.max(tt,seq[k].t,prev+1200);prev=t;MSGQ.set(k,t);});
    hits.forEach((k,i)=>{const t=MSGQ.get(k),nx=i<M-1?MSGQ.get(hits[i+1]):t+1600,hold=Math.max(700,Math.min(1100,nx-t-200));MSGW.push([t,t+hold]);seq[k].mHold=hold;seq[k].mAt=t;});}
  const inMsg=t=>MSGW.some(([a,b])=>t>=a-150&&t<b);
  ctx.font=`800 100px ${FONT}`;
  const spawn=q=>{const r=rate(q.t),gap=1000/r,slow=Math.max(0,Math.min(1,(70-r)/60));
    // 메시지 단어: 위쪽(보통 단어가 뜨는 가운데보다 위) 아주 크게, 시간표(MSGQ)대로. 같은 철자가 뒤에 또 나와도(다른 뜻 카드) 첫 것만.
    if(q.mAt!=null){const w100=ctx.measureText(q.w.t).width||100,t=q.mAt;
      (f.msgLog=f.msgLog||[]).push([q.w.t,Math.round(t)]);flyers.push({q,w100,t,hold:q.mHold,fly:750,big:Math.min(80,W*.86/w100*100),slow:1,msg:true,jx:0,jy:-lakeY*.17});return;}
    const w100=ctx.measureText(q.w.t).width||100,big=Math.min(22+20*slow,W*.84/w100*100)*(inMsg(q.t)?.62:1),spread=Math.max(0,Math.min(1,(r-20)/140));   // 느려지면 한자리에서 하나씩(눈이 따라가지 않아도 읽히게)
    flyers.push({q,w100,t:q.t,hold:Math.min(440,gap*.8),fly:Math.max(300,Math.min(600,4000/r)),big,slow,jx:(Math.random()-.5)*W*.74*spread,jy:(Math.random()-.5)*lakeY*.4*spread});};
  const drawFlyer=(fl,el)=>{if(el<fl.t)return;const q=fl.q,e=el-fl.t,[tx,ty]=toS(q.p.x+q.w.w*q.p.s/2,q.p.y+wd.F*q.p.s/2),sx=LX+fl.jx,sy=LY+fl.jy,end=Math.max(1.2,wd.F*fit*q.p.s);
    const pop=Math.min(1,e/(fl.msg?160:70));let x=sx,y=sy,sz=fl.big*(fl.msg?.4+.6*(1+1.7*Math.pow(pop-1,3)+.7*Math.pow(pop-1,2)):.55+.45*(1-Math.pow(1-pop,3))),a=pop;
    if(fl.msg&&!fl.lit){fl.lit=1;const rgb0=q.w.gold?'255,211,77':tint(wd.bands[q.i].L);sparkle(offX+sx,offY+sy,28,rgb0,2.2);sparkle(offX+sx,offY+sy,14,'255,255,255',1.4);}
    // 떠날 때는 빨리 작아지며 가운데를 비운다. 다음 단어가 겹치지 않게.
    if(e>fl.hold){const pp=Math.min(1,(e-fl.hold)/fl.fly),m=1-Math.pow(1-pp,2.4);x=sx+(tx-sx)*m;y=sy+(ty-sy)*m;sz=sz+(end-sz)*(1-Math.pow(1-pp,4));a=1-.3*pp;}
    // 광원(26.10.16 영신: "날아들어가는 단어들은 광원효과 좀 드가듀 될듯"): 글자 뒤 같은 색 빛 번짐, 날아갈 때는 빛 꼬리. 빛나는 건 단어 자신이다(PRINCIPLES 11).
    const rgb=q.w.gold?'255,211,77':tint(wd.bands[q.i].L),gw=fl.w100*sz/100;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalCompositeOperation='lighter';
    if(e>fl.hold){const dx=tx-sx,dy=ty-sy,dl=Math.hypot(dx,dy)||1,tl=Math.min(60,sz*2),ex=x-dx/dl*tl,ey=y-dy/dl*tl,gr=ctx.createLinearGradient(x,y,ex,ey);   // 머리는 밝고 꼬리로 갈수록 사라지는 혜성 꼬리
      gr.addColorStop(0,`rgba(${rgb},.6)`);gr.addColorStop(1,`rgba(${rgb},0)`);ctx.globalAlpha=a;ctx.strokeStyle=gr;ctx.lineWidth=Math.max(1,sz*.16);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(ex,ey);ctx.stroke();}
    const hh=fl.msg?Math.min(sz*1.4,y-4):sz*1.1;ctx.globalAlpha=a*(fl.msg?.55:fl.slow>.2?.6:.4);ctx.drawImage(spr(rgb),x-gw*(fl.msg?1:.8),y-hh,gw*(fl.msg?2:1.6),hh*2);   // 무대 위끝에서 잘려 네모 자국이 남지 않게ctx.globalCompositeOperation='source-over';
    const k=sz/100;ctx.setTransform(dpr*k,0,0,dpr*k,dpr*x,dpr*y);ctx.globalAlpha=a;
    if(fl.slow>.2&&sz>12){ctx.shadowBlur=0;ctx.lineWidth=16;ctx.strokeStyle='rgba(16,6,30,.85)';ctx.strokeText(q.w.t,0,0);ctx.shadowColor=q.w.gold?'rgba(255,211,77,.8)':`rgba(${tint(wd.bands[q.i].L)},.55)`;ctx.shadowBlur=sz*.22*dpr;}else ctx.shadowBlur=0;
    ctx.fillStyle=q.w.gold?'#ffd34d':shade(wd.bands[q.i].L,q.i);ctx.fillText(q.w.t,0,0);};   // 처음부터 산에 앉을 색(26.10.16 영신: "최종색과 맞춰도 보기 좋을 것 같아")
  const cap=f.ov.querySelector('.fe-cap'),t0=performance.now()+500;f._t0=t0;let next=0,band=0,finaleAt=0,labels=null,shown=0,labelStart=0;
  // 피날레(약 8초): 불꽃축제 국룰을 따른다. 일제 사격(齐射) → 스타마인 → 오중심 한 발 단독(尺玉처럼 감상) → 겹국화 차례 쏘기(段射)
  // → 혜성 교차(交叉对射)·갈라지는 별 → 대(大)스타마인(장미 한 번, 고양시 꽃) → 황금 버드나무 커튼과 나이아가라로 끝.
  const finale=()=>{const at=later2;
    at(0,()=>salvo(6,'kiku','trad',true));
    at(600,()=>starmine(2100,14));
    at(2900,()=>launch('goju','fan',true,OW*.5));
    for(let i=0;i<6;i++)at(3900+i*120,()=>launch('yae',pick(PALS),true,OW*(.1+.8*i/5)));
    at(4600,()=>{crossC(6,700);salvo(3,'crossette','trad',true);});
    at(5100,()=>{starmine(2000,20,true);salvo(3,'rose','rose',true);});
    at(6000,()=>{salvo(4,'henka',pick(PALS),true);salvo(3,'botan','fan',true);});
    at(6900,()=>{salvo(7,'willow','gold',true);niagara(2600);});};
  const pickLabels=()=>{const golds=seq.filter(q=>q.w.gold),pick=[],boxes=[],step=Math.max(1,Math.floor(golds.length/55));
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.font=`800 9px ${FONT}`;
    for(let i=0;i<golds.length&&pick.length<45;i+=step){const q=golds[i],[x,y]=toS(q.p.x+q.w.w*q.p.s/2,q.p.y+wd.F/2),w=ctx.measureText(q.w.t).width+4,bx={x0:x-w/2,x1:x+w/2,y0:y-6,y1:y+6};
      const cx=Math.max(w/2+3,Math.min(W-w/2-3,x));bx.x0=cx-w/2;bx.x1=cx+w/2;
      if(boxes.some(o=>o.x0<bx.x1&&bx.x0<o.x1&&o.y0<bx.y1&&bx.y0<o.y1))continue;boxes.push(bx);pick.push([q.w.t,cx,y]);}ctx.restore();return pick;};
  const label=([t,x,y])=>{ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.font=`800 9px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.lineWidth=3;ctx.strokeStyle='rgba(22,8,38,.85)';ctx.strokeText(t,x,y);ctx.shadowColor='rgba(255,211,77,.9)';ctx.shadowBlur=6;ctx.fillStyle='#ffd34d';ctx.fillText(t,x,y);ctx.restore();};
  const flag=()=>{const [fx,fy0]=toS(wd.cx,bodyTop),fy=fy0+1.5;ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.strokeStyle='#f6f1ff';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(fx,fy+2);ctx.lineTo(fx,fy-24);ctx.stroke();
    ctx.fillStyle='#ffd34d';ctx.shadowColor='rgba(255,211,77,.8)';ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(fx,fy-24);ctx.lineTo(fx+17,fy-19);ctx.lineTo(fx,fy-14);ctx.closePath();ctx.fill();ctx.restore();};
  const idle=now=>{if(dHold)return;if(now-lastSM>9000+Math.random()*4000){lastSM=now;lastFw=now+900;starmine(1200,9);return;}if(now-lastFw>600+Math.random()*400){show(Math.random()<.55);lastFw=now;}};
  const frame=now=>{
    if(!feState||feState!==f)return;
    place();
    // 배지·큰 도장이 나오면 산은 접고 불꽃만 계속 터진다.
    if(f.ov.querySelector('.fe-stage').hidden){idle(now);fxStep(now,false);f.raf=requestAnimationFrame(frame);return;}
    const el=now-t0,skip=f.skip&&f.building;
    while(next<N&&(skip||calm||el>=seq[next].t)){const q=seq[next++];if(skip||calm)land(q);else spawn(q);}
    scene(now);
    ctx.save();ctx.font=`800 100px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
    for(let i=0;i<flyers.length;i++){const fl=flyers[i];
      if(skip||el-fl.t>=fl.hold+fl.fly){land(fl.q);if(!skip&&(fl.msg||fl.q.w.gold&&fl.slow>.2)){const [x,y]=toS(fl.q.p.x,fl.q.p.y);sparkle(offX+x,offY+y,fl.msg?16:7,fl.msg&&!fl.q.w.gold?tint(wd.bands[fl.q.i].L):'255,214,90');}flyers.splice(i--,1);continue;}
      if(!fl.msg&&flyers.length-i<=150)drawFlyer(fl,el);}
    for(const fl of flyers)if(fl.msg)drawFlyer(fl,el);
    ctx.restore();
    // 한 층이 다 차면 호수에서 불꽃 한 발(0.45초에 한 발까지만)
    let up=false;while(band<n&&cnt[band]>=need[band]){band++;up=true;}
    if(up&&!skip&&now-lastFw>450){const L=wd.bands[Math.max(0,band-1)].L;launch(pickW(KW),L.lesson>=46?'teal':L.lesson>B1_LAST?'rose':'lav',band%4===0);lastFw=now;}
    else if(!skip&&(next<N||flyers.length)&&now-lastFw>650+Math.random()*450){show(Math.random()<.45);lastFw=now;}
    if(!skip&&(next<N||flyers.length)){if(!smOpen){smOpen=true;lastSM=now;starmine(2600,12);}else if(now-lastSM>11000+Math.random()*4000){lastSM=now;starmine(1600,10);}}   // 쌓는 동안만: 느린 후반에도 하늘이 비지 않게(다 쌓은 뒤는 idle이 맡는다)
    if(next<N||flyers.length){const L=wd.bands[Math.min(n-1,band)].L;cap.textContent=`${L.id} · ${L.name||''}  ·  익힌 단어 ${seen.size.toLocaleString('en-US')}`;fxStep(now,true);f.raf=requestAnimationFrame(frame);return;}
    // 다 쌓임: 피날레 불꽃, 깃발, 금빛 이름표(틀렸다가 잡은 단어)를 하나씩. 다 붙으면 대사로 넘어가고 불꽃은 가끔 계속 터진다.
    if(!finaleAt){finaleAt=now;bodyTop=f.mode==='b1'?landedTop-14:wd.top;drawMini(true);scene(now);finale();lastFw=now+9600;lastSM=now+9600;labels=pickLabels();labelStart=now+(skip?0:1200);cap.textContent=f.capBase=`익힌 단어 ${seen.size.toLocaleString('en-US')}`;}
    flag();
    const due=(skip||now>=labelStart+2400)?labels.length:Math.max(0,Math.ceil((now-labelStart)/2400*labels.length));
    while(shown<due){const lb=labels[shown++];if(!skip)sparkle(offX+lb[1],offY+lb[2],10);}
    for(let i=0;i<shown;i++)label(labels[i]);
    if(f.building&&shown>=labels.length){f.building=false;f.skip=false;bub.style.visibility='';feNext();}
    if(!f.building)idle(now);
    fxStep(now,true);f.raf=requestAnimationFrame(frame);};
  // 쌓는 동안 말풍선은 비워 둔다(26.10.16 영신: "hello 로 시작하는 엔딩첫대사 빼자 뭔가 안맞더라구"). 고양이는 옆에서 같이 본다. 자리는 그대로 둬 산이 움직이지 않게.
  const bub=f.ov.querySelector('.fe-talk .bubble');bub.style.visibility='hidden';
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
window.addEventListener('hashchange',()=>{try{stPreview();}catch(e){}});
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
/* 열려 있는 페이지 주소창에 #만 붙이면 브라우저가 새로 읽지 않는다(26.10.15 영신: "아래꺼 붙였더니 안돌아감").
   그래서 hashchange에서도 부르고, 띄운 뒤에는 주소의 #을 지워 같은 주소를 다시 붙여도 다시 뜨게 한다. */
function stPreview(){
  const m=/^#(stamp|ending)(?:=(\w+))?$/i.exec(decodeURIComponent(location.hash||''));if(!m)return;   // #ending=B1처럼 대문자로 쳐도 1부 완결(26.10.15 영신 제보)
  try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}
  m[1]=m[1].toLowerCase();m[2]=(m[2]||'').toLowerCase();
  if(m[1]==='stamp'){const L=state.lessons.find(x=>x.kind!=='saved'&&String(x.lesson)===(m[2]||'0'));if(L)setTimeout(()=>stShow(L,{L,all:false},true),700);return;}
  setTimeout(()=>feOpen(m[2]==='b1'?'b1':'full'),700);
}
