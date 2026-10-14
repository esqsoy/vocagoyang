/* 진행 속도 예측(26.10.13 영신 제안). 판마다 실제로 푼 시간과 날짜·시각을 적어 두고, 연습 10개를 푼 뒤부터
   결과 화면에서 '이 기세면 며칠 뒤 어디까지'를 보수값~긍정값 범위로 알려 준다. 특이사항(오랜만·느려짐·하루가 짧음)에는
   예측 대신 갈굼을 날린다. 함수와 결정 경위는 pipeline/pace/README.md. 기록은 이 브라우저에만 남는다. */
var paceKey='goyang-pace-'+PACE_COURSE+'-v1',paceMetaKey='goyang-pace-meta-'+PACE_COURSE+'-v1';
var paceMinPlays=10,paceIdleCap=60000,paceKeep=600,paceLowDaily=30,paceHourBasis=60;
var paceLast=0,paceActive=0;

/* ── 시간 재기: 손이 움직인 사이의 시간만 더한다. 한 번에 최대 60초라 자리를 비운 시간은 빠지고, 화면을 가리면 멈춘다. */
function paceTick(){const now=Date.now();if(state.session&&paceLast)paceActive+=Math.min(Math.max(0,now-paceLast),paceIdleCap);paceLast=state.session?now:0;}
function paceRead(){try{const v=JSON.parse(localStorage.getItem(paceKey)||'[]');return Array.isArray(v)?v.filter(r=>r&&r.at>0&&r.ms>0&&r.u>0):[];}catch{return [];}}
function paceMeta(){try{const v=JSON.parse(localStorage.getItem(paceMetaKey)||'{}');return v&&typeof v==='object'?v:{};}catch{return {};}}
function paceSave(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}

/* ── 일의 양: 카드 하나를 읽고 치는 데 드는 '표준 초'. 철자 글자 수와 예문·해석·해설 길이로 잰다(읽기량 식은 PRINCIPLES 2-2).
   뒤 세트일수록 단어가 길고 예문이 길어, 카드 수로만 세면 남은 시간을 얕잡아 본다. 학생마다의 실제 속도는 비율로 따로 잰다. */
function paceUnit(w){
  const term=String(w.word||w.term||w.en||'').replace(/[^A-Za-z]/g,''),ctx=w.context||{};
  const ex=String(w.ex||ctx.example||''),tr=String(w.tr||ctx.translation||''),c=String(w.c||ctx.note||'');
  return 3+0.4*term.length+0.25*(ex.trim()?ex.trim().split(/\s+/).length:0)+0.11*(tr.length+c.length);
}
function paceUnits(words){return (words||[]).reduce((a,w)=>a+paceUnit(w),0);}

/* ── 목표: FABLE은 25세트 끝(3000급) → 45세트 끝(C1) → 전부. 앞 목표를 돌파해야 다음 목표를 말한다(영신: "5000단어는 3000단어 돌파하고 알려주겠다고양").
   B1까지만 보는 학생은 25세트까지만. 마더텅·EBS는 지금 범위 전부. */
function paceTargets(){
  const lessons=state.lessons.filter(L=>L.kind!=='saved'&&(typeof inScope!=='function'||inScope(L)));
  const label=n=>{const L=state.lessons.find(x=>x.lesson===n),m=L&&String(L.name||'').match(/(\d+)\s*~\s*(\d+)/);return m?Number(m[2]).toLocaleString('en-US')+'단어':(L?L.id+'까지':'');};
  const ends=PACE_COURSE==='fable'?[25,45,Infinity].filter(n=>n===25||!state.levelB1):[Infinity];
  const name=n=>n===Infinity?(PACE_COURSE==='fable'?'FABLE 완주':PACE_COURSE==='ksat'?'마더텅 완주':'EBS 완주'):label(n);
  const out=ends.map(n=>{let u=0,ex=0;lessons.filter(L=>L.lesson<=n).forEach(L=>visEx(L).forEach(e=>{if(!getRec(L.id,e.title)?.completed){u+=paceUnits(e.words);ex++;}}));return {end:n,label:name(n),u,ex};});
  const i=out.findIndex(t=>t.ex>0);if(i<0)return null;
  return {...out[i],next:out[i+1]?.label||null,passed:i>0?out[i-1].label:null};
}

/* ── 예측. recs는 시간순 [{at,ms,u,k}] (k: n 새 연습, a 다시 푼 연습, w 틀린 것만), target은 {u,ex}.
   속도 r = 걸린 시간 ÷ 일의 양. 새 연습이 5판 이상이면 새 연습만으로 잰다(다시 푼 판은 이미 알아서 빠르다).
   - 지금 속도: 최근 판에 무게를 더 준 평균(한 판 앞설 때마다 0.85배).
   - 변화율: 학습 곡선 ln r = a + b·ln(누적 일의 양)을 같은 무게로 맞춘 기울기 b(-0.4~0으로 묶음).
   - 긍정값: 지금 속도에서 그 곡선대로 더 빨라진다고 보고 적분하되, 지금의 70%보다 빨라지지는 않는다.
   - 보수값: 지금 속도와 전체 중앙값 중 느린 쪽으로, 더 빨라지지 않는다고 본다. 다시 풀기·틀린 것만에 든 시간 비율(최대 1.5배)도 더한다.
   - 하루 시간: 최근 14일(처음 기록부터가 더 짧으면 그만큼)의 하루 평균. 기록이 3일에 못 미치면 하루 1시간으로 계산한다.
     하루 30분이 안 되면 갈구면서 하루 1시간 기준으로 준다(영신). */
function paceDay(t){const d=new Date(t);return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function paceDayStart(t){const d=new Date(t);d.setHours(0,0,0,0);return d.getTime();}
function paceForecast(recs,target,now){
  const full=recs.filter(r=>r.k!=='w'),news=full.filter(r=>r.k==='n');
  if(full.length<paceMinPlays||!target||!(target.u>0))return null;
  const base=news.length>=5?news:full,N=base.length,rate=r=>r.ms/r.u;
  let sw=0,sr=0;base.forEach((r,i)=>{const w=Math.pow(0.85,N-1-i);sw+=w;sr+=w*rate(r);});
  const rNow=sr/sw;
  let cum=0;const pts=base.map((r,i)=>{const x=Math.log(1+cum+r.u/2);cum+=r.u;return {x,y:Math.log(rate(r)),w:Math.pow(0.85,N-1-i)};});
  let b=0;
  if(N>=5){const W=pts.reduce((a,p)=>a+p.w,0),mx=pts.reduce((a,p)=>a+p.w*p.x,0)/W,my=pts.reduce((a,p)=>a+p.w*p.y,0)/W;
    const vx=pts.reduce((a,p)=>a+p.w*(p.x-mx)**2,0),cxy=pts.reduce((a,p)=>a+p.w*(p.x-mx)*(p.y-my),0);if(vx>1e-6)b=Math.max(-0.4,Math.min(0,cxy/vx));}
  const R=target.u,C=1+cum,steps=40;let opt=0;
  for(let i=0;i<steps;i++){const x=(i+0.5)*R/steps;opt+=Math.max(0.7*rNow,rNow*Math.pow((C+x)/C,b))*R/steps;}
  const sorted=base.map(rate).sort((p,q)=>p-q),med=sorted[Math.floor(sorted.length/2)];
  const sumMs=a=>a.reduce((s,r)=>s+r.ms,0);
  const over=news.length>=5?Math.min(1.5,Math.max(1,sumMs(recs)/sumMs(news))):1;
  const rCons=Math.max(rNow,med)*over;let cons=rCons*R;if(opt>cons)[opt,cons]=[cons,opt];
  const exU=R/Math.max(1,target.ex);
  const recent=base.slice(-5),prev=base.slice(-10,-5),mean=a=>a.reduce((s,r)=>s+rate(r),0)/a.length;
  const trend=recent.length>=3&&prev.length>=3?mean(recent)/mean(prev)-1:0;
  const first=paceDayStart(recs[0].at),today=paceDayStart(now),span=Math.round((today-Math.max(first,today-13*864e5))/864e5)+1;
  const daily=span>=3?sumMs(recs.filter(r=>r.at>=Math.max(first,today-13*864e5)))/60000/span:null;
  const mode=daily===null?'hour':daily<paceLowDaily?'low':'daily',perDay=mode==='daily'?daily:paceHourBasis;
  const optMin=opt/60000,consMin=cons/60000;
  return {optMin,consMin,exMin:[rNow*exU/60000,rCons*exU/60000],trend,daily,mode,perDay,
    days:[Math.max(1,Math.ceil(optMin/perDay)),Math.max(1,Math.ceil(consMin/perDay))],b,rNow};
}

/* ── 대사. 고양고양이는 츤데레다(PRINCIPLES 1). 말풍선은 폰에서 두 줄 안. 예측은 늘 '이 기세면' 가정으로, 범위로만 말한다. */
var PACE_LINES={
  intro:{daily:['네 속도 쟀다고양. 이대로면 {R} 뒤 {T} 돌파라고양!'],
         hour:['속도 쟀다고양. 1시간씩이면 {R}에 {T}라고양!']},
  regular:{daily:['이 기세면 {R} 뒤 {T}라고양. 늦으면 갈군다고양.','{T}까지 {R}이라고양. 딴짓 금지라고양~','{R} 뒤면 {T}라고양. 금방이지 않냐고양?'],
           hour:['하루 1시간씩이면 {R}에 {T} 돌파라고양!','1시간씩만 버티면 {R}에 {T}라고양. 쉽지?']},
  fast:{daily:['빨라졌다고양? 이 기세면 {R} 뒤 {T}라고양!','손이 풀렸냐고양? 이대로면 {R} 뒤 {T}라고양.'],
        hour:['빨라졌다고양! 1시간씩이면 {R}에 {T}라고양.']},
  next:['{P} 돌파라고양! 이제 {T}까지 {R}이라고양.'],
  later:['{T}부터 뚫으라고양. {N}는 그다음에 알려주겠다고양!'],
  slow:['요즘 굼떠졌다고양. 이러다 {T}까지 {RB} 걸린다고양?!','손가락 녹슬었냐고양? 속도가 {p}%나 떨어졌다고양!'],
  absent:['{g}일 만이라고양? 단어들이 짐 싸서 도망갔다고양.','{g}일이나 놀았냐고양? {T}가 멀어진다고양.'],
  low:['하루 {m}분? 매일 하라고양! 1시간씩이면 {R}이라고양.','하루 {m}분? 꿈 깨라고양. 1시간씩이면 {R}이라고양.']
};
function paceRange(a,b){return a===b?a+'일':a+'~'+b+'일';}
function paceFill(t,v){return t.replace(/\{(\w+)\}/g,(m,k)=>v[k]??m);}
function paceNote(f,t){
  const ex=f.exMin.map(x=>Math.max(1,Math.round(x))),exT=ex[0]===ex[1]?ex[0]+'분':ex[0]+'~'+ex[1]+'분';
  const tr=Math.abs(f.trend)>=0.1?` · 최근 ${Math.round(Math.abs(f.trend)*100)}% ${f.trend<0?'빨라짐':'느려짐'}`:'';
  const basis=f.mode==='daily'?`하루 평균 ${Math.round(f.daily)}분 기준`:f.mode==='low'?`하루 평균 ${Math.round(f.daily)}분 → 1시간 기준`:'하루 1시간 기준';
  return `${t.label}까지 ${paceRange(f.days[0],f.days[1])} · 연습 하나 ${exT}${tr} · ${basis}`.replace(/ · /g,'\u00a0· '); // 줄이 바뀌어도 구분점은 앞말에 붙는다
}
/* 무엇을 말할지: 처음(10판째) > 오랜만 > 하루가 짧음(하루 한 번) > 앞 목표 돌파 > 느려짐 > 빨라짐 > 다섯 판마다 예측. 아니면 원래 대사. */
function paceKind(recs,f,t,meta,now){
  const full=recs.filter(r=>r.k!=='w'),last=recs[recs.length-1],before=recs[recs.length-2];
  const plays=Number.isFinite(meta.total)?meta.total:full.length,since=plays-(meta.n||0),gap=before?Math.floor((paceDayStart(last.at)-paceDayStart(before.at))/864e5):0;
  if(!meta.intro)return 'intro';
  if(gap>=3)return 'absent';
  if(f.mode==='low'&&meta.lowDay!==paceDay(now))return 'low';
  if(t.passed&&meta.target&&meta.target!==t.label)return 'next';
  if(f.trend>=0.2&&plays-(meta.slowAt||0)>=5)return 'slow';
  if(f.trend<=-0.15&&since>=3)return 'fast';
  if(since>=5)return t.next&&!meta.later&&PACE_COURSE==='fable'?'later':'regular';
  return null;
}
function paceLine(kind,f,t,recs,now){
  const mode=f.mode==='daily'?'daily':'hour',pool=Array.isArray(PACE_LINES[kind])?PACE_LINES[kind]:PACE_LINES[kind][mode];
  const before=recs[recs.length-2],last=recs[recs.length-1];
  const v={T:t.label,N:t.next||'',P:t.passed||'',R:paceRange(f.days[0],f.days[1]),RB:f.days[1]+'일',m:Math.round(f.daily||0),p:Math.round(Math.abs(f.trend)*100),
    g:before?Math.floor((paceDayStart(last.at)-paceDayStart(before.at))/864e5):0};
  return paceFill(pool[Math.floor(Math.random()*pool.length)],v);
}
function paceShow(info,ms){
  const now=Date.now(),recs=paceRead(),words=info.partial?info.words:info.e.words;
  if(ms>=5000){
    const fullBefore=recs.filter(r=>r.k!=='w').length;
    recs.push({at:now,ms:Math.round(ms),u:Math.round(paceUnits(words)*10)/10,k:info.partial?'w':info.was?'a':'n'});paceSave(paceKey,recs.slice(-paceKeep));
    // 판 수는 보관(최근 600판)과 따로 센다. 배열 길이로 세면 600판에서 멈춰 다섯 판마다 대사가 끊겼다(26.10.15 아스트라 리뷰 T05).
    if(!info.partial){const m=paceMeta();m.total=(Number.isFinite(m.total)?m.total:fullBefore)+1;paceSave(paceMetaKey,m);}
  }
  const note=paceNoteEl();note.hidden=true;
  if(info.partial)return;
  const t=paceTargets(),f=t&&paceForecast(recs,t,now);if(!f)return;
  note.textContent=paceNote(f,t);note.hidden=false;
  if($("#sumTitle").textContent!=="연습 클리어 ✦")return;   // 세트 정복·엔딩 대사는 그대로 둔다
  const meta=paceMeta(),kind=paceKind(recs,f,t,meta,now),plays=Number.isFinite(meta.total)?meta.total:recs.filter(r=>r.k!=='w').length;
  if(kind){
    $("#sumBubble").innerHTML=`<span><span class="nm">고양고양이</span> ${esc(paceLine(kind,f,t,recs,now))}</span>`;
    meta.n=plays;meta.intro=true;
    if(kind==='low')meta.lowDay=paceDay(now);
    if(kind==='slow')meta.slowAt=plays;
    if(kind==='later')meta.later=true;
  }
  meta.target=t.label;paceSave(paceMetaKey,meta);
}
function paceNoteEl(){
  let el=$("#paceNote");
  if(!el){el=document.createElement('p');el.id='paceNote';el.className='pace-note';el.hidden=true;const b=$("#sumBubble");b.parentNode.insertBefore(el,b.nextSibling);}
  return el;
}
var paceOrigStart=startExercise,paceOrigFinish=finishExercise;
startExercise=function(){const r=paceOrigStart.apply(this,arguments);paceActive=0;paceLast=Date.now();return r;};
finishExercise=function(){
  const s=state.session;
  const info=s&&s.lesson&&s.lesson.kind!=='saved'&&s.exercise?{e:s.exercise,partial:!!s.partial,was:!!getRec(s.lesson.id,s.exercise.title)?.completed,words:s.words}:null;
  paceTick();const ms=paceActive;paceActive=0;paceLast=0;
  const r=paceOrigFinish.apply(this,arguments);
  if(info)try{paceShow(info,ms);}catch(e){}
  return r;
};
function paceInit(){
  ['keydown','pointerdown','input'].forEach(n=>document.addEventListener(n,paceTick,true));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){paceTick();paceLast=0;}else if(state.session)paceLast=Date.now();});
}
