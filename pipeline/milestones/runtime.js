/* 외운 단어 1,000개 단위 돌파 축하(26.10.08 영신).
   세 교재는 같은 사이트 저장소를 쓴다. 교재마다 클리어한 연습의 표제어를 적어 두고, 합집합으로 센다(겹치는 단어는 한 번).
   연출: 외운 단어가 유성우처럼 쏟아지며 1부터 세어 올라가고 → 문턱에서 빛 폭발(주기율표 게임의 광원 효과) → 단어 불꽃놀이. */
var msLearnedKey='goyang-learned-words-v1',msSeenKey='goyang-milestone-v1',msStep=1000;
var msBusy=false,msPendingEnding=false,msRaf=0,msNode=null,msOpenedAt=0;
var msColors=['255,211,77','255,79,163','92,230,255','195,153,255','124,255,178','255,255,255'];
function msHead(w){const t=w&&(w.word??w.en??w.term);return typeof t==='string'?t.normalize('NFC').trim().replace(/\s+/gu,' ').toLowerCase():'';}
function msRead(){
  try{const o=JSON.parse(localStorage.getItem(msLearnedKey)||'{}');return o&&typeof o==='object'&&!Array.isArray(o)?o:{};}
  catch{return {};}
}
function msUnion(all){const u=new Set();Object.values(all).forEach(a=>Array.isArray(a)&&a.forEach(k=>typeof k==='string'&&k&&u.add(k)));return u;}
function msCourseWords(){
  const set=new Set();
  state.lessons.forEach(L=>L.exercises.forEach(e=>{if(getRec(L.id,e.title)?.completed)e.words.forEach(w=>{const k=msHead(w);if(k)set.add(k);});}));
  return [...set].sort();
}
/* 이 교재의 몫만 다시 적는다. 바뀐 게 없으면 쓰지 않는다. */
function msSync(){
  const all=msRead(),mine=msCourseWords(),old=Array.isArray(all[MS_COURSE])?all[MS_COURSE]:[];
  if(mine.length!==old.length||mine.some((k,i)=>k!==old[i])){
    if(mine.length)all[MS_COURSE]=mine;else delete all[MS_COURSE];
    try{localStorage.setItem(msLearnedKey,JSON.stringify(all));}catch{}
  }
  return msUnion(all);
}
function msSeen(){try{return Math.max(0,Number(JSON.parse(localStorage.getItem(msSeenKey)||'{}').seen)||0);}catch{return 0;}}
function msMarkSeen(m){try{localStorage.setItem(msSeenKey,JSON.stringify({seen:m}));}catch{}}
/* 클리어 직후: 지금까지 넘은 문턱 중 가장 큰 것을 아직 축하하지 않았으면 한 번 띄운다.
   업데이트 전에 이미 넘은 학생은 첫 클리어 때 그 문턱 하나만(retro). */
function msAfterClear(before){
  const words=msSync(),total=words.size,m=Math.floor(total/msStep)*msStep;
  if(m<msStep||m<=msSeen())return null;
  msMarkSeen(m);
  const info={m,total,retro:before>=m,words:[...words]};
  msQueue(info);return info;
}
function msQueue(info){
  msBusy=true;
  const go=()=>{const roar=document.getElementById('roar');if(roar&&roar.classList.contains('show')){setTimeout(go,250);return;}msShow(info);};
  setTimeout(go,700);
}
function msShuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function msLine(m,retro){
  const n=m.toLocaleString('en-US');
  if(retro)return pick([`어느새 ${n}단어를 넘었다고양! 말도 없이 넘다니 괘씸하다고양 ✦`,`${n}단어, 몰래 넘었더라고양. 축하는 지금 몰아서 한다고양!`]);
  return {1000:'천 단어 돌파라고양! 일산 출구 표지판이 보이기 시작한다고양 ✦',
    2000:'2,000단어라고양! BIG MOUNTAIN 냄새가 나기 시작한다고양.',
    3000:'3,000단어… 솔직히 좀 놀랐다고양. 티 내는 건 아니고양.',
    4000:'4,000단어라고양! 너 진짜 일산 탈출할 셈이냐고양?'}[m]||`${n}단어라고양…! 이제 내가 너한테 단어를 배워야겠다고양.`;
}
function msSound(kind){
  if(state.muted)return;
  try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();const n=actx.currentTime;
    if(kind==='fanfare'){if(typeof fanfare==='function')fanfare();return;}
    const len=Math.floor(actx.sampleRate*.35),buf=actx.createBuffer(1,len,actx.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);
    const src=actx.createBufferSource(),f=actx.createBiquadFilter(),g=actx.createGain();
    f.type='lowpass';f.frequency.value=900+Math.random()*700;g.gain.value=.07;
    src.buffer=buf;src.connect(f);f.connect(g);g.connect(actx.destination);src.start(n);
  }catch(e){}
}
function msSprite(rgb,size){
  const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d'),h=size/2;
  const g=x.createRadialGradient(h,h,0,h,h,h);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,`rgba(${rgb},.9)`);g.addColorStop(1,`rgba(${rgb},0)`);
  x.fillStyle=g;x.fillRect(0,0,size,size);return c;
}
/* 유성의 꼬리. 모두 같은 각도로 떨어지므로 색마다 한 번만 그려 두고 다시 쓴다. */
function msStreak(rgb,len,ang){
  const w=Math.ceil(Math.abs(Math.cos(ang))*len)+8,h=Math.ceil(Math.abs(Math.sin(ang))*len)+8;
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
  const hx=Math.cos(ang)<0?4:w-4,hy=Math.sin(ang)>0?h-4:4,tx=hx-Math.cos(ang)*len,ty=hy-Math.sin(ang)*len;
  const g=x.createLinearGradient(tx,ty,hx,hy);
  g.addColorStop(0,`rgba(${rgb},0)`);g.addColorStop(.7,`rgba(${rgb},.55)`);g.addColorStop(1,'rgba(255,255,255,.95)');
  x.strokeStyle=g;x.lineCap='round';x.lineWidth=2.4;x.beginPath();x.moveTo(tx,ty);x.lineTo(hx,hy);x.stroke();
  return {c,hx,hy};
}
/* 문턱이 높을수록 길고 화려하게(26.10.08 영신: "갈수록 더 길게 유성우가 쏟아지게", "1000개나 외웠는데 좀 길어도").
   유성은 문턱 수만큼, 곧 지금까지 외운 단어가 하나씩 다 떨어진다. 1,000은 약 5.4초, 한 단계마다 2초씩 길어진다(최대 15초). */
function msPlan(m){
  const L=Math.max(1,Math.round(m/msStep)),k=Math.min(4,L);
  return {level:L,T:Math.min(15000,3400+2000*L),ease:Math.max(1.4,1.9-.15*(L-1)),
    shells:Math.min(18,5+2*L),rings:2+k,rays:8+4*k,rain:L>=2?Math.min(8,1.5*L):0};
}
function msLight(layer,x,y,plan){
  const at=el=>{el.style.setProperty('--x',x+'px');el.style.setProperty('--y',y+'px');layer.appendChild(el);return el;};
  const mk=cls=>{const el=document.createElement('div');el.className=cls;return at(el);};
  mk('ms-flash');for(let i=1;i<=plan.rings;i++)mk('ms-ring'+(i>1?' r'+i:''));mk('ms-shock');
  const rays=mk('ms-rays');
  for(let i=0;i<plan.rays;i++){const r=document.createElement('div');r.className='ms-ray';r.style.transform=`rotate(${i*360/plan.rays}deg) translateX(-50%)`;rays.appendChild(r);}
}
function msShow(info){
  msClose(true);msBusy=true;
  const m=info.m,label=m.toLocaleString('en-US'),still=!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const mk=(tag,cls,parent,html)=>{const el=document.createElement(tag);el.className=cls;if(html!=null)el.innerHTML=html;parent.appendChild(el);return el;};
  const ov=document.createElement('div');ov.className='ms-fx';ov.id='msFx';
  ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label',label+'단어 돌파 축하');
  const canvas=mk('canvas','ms-canvas',ov);canvas.setAttribute('aria-hidden','true');
  mk('div','ms-glory',ov).setAttribute('aria-hidden','true');
  const light=mk('div','ms-light',ov);light.setAttribute('aria-hidden','true');
  const inner=mk('div','ms-inner',ov);
  mk('div','ms-kicker',inner,'외운 단어');
  const numBox=mk('div','ms-num',inner),num=mk('b','',numBox);num.textContent=still?label:'0';
  mk('div','ms-title',inner,'단어 돌파!');
  mk('div','ms-cat',inner,'<img id="msCat" alt="고양고양이">');
  mk('div','ms-line',inner,'<span class="nm">고양고양이</span> '+esc(msLine(m,info.retro))).setAttribute('aria-live','polite');
  mk('div','ms-sub',inner,info.preview?'미리 보기':'세 교재를 합쳐 겹치는 단어는 한 번만 셌다고양 · 지금 '+info.total.toLocaleString('en-US')+'단어');
  const btn=mk('button','ms-close',inner,'계속하기 ▶');btn.type='button';
  document.body.appendChild(ov);msNode=ov;msOpenedAt=Date.now();
  if(typeof setCat==='function')setCat('msCat','win');
  ov.addEventListener('click',()=>{if(ov._skip&&ov._skip())return;if(Date.now()-msOpenedAt>1200)msClose();});
  btn.addEventListener('click',e=>{e.stopPropagation();msClose();});
  if(still){ov.classList.add('popped','still');msSound('fanfare');return;}
  const cx=canvas.getContext&&canvas.getContext('2d');
  if(!cx){num.textContent=label;ov.classList.add('popped');msSound('fanfare');return;}
  msRun(ov,canvas,cx,info,num,light);
}
function msRun(ov,canvas,cx,info,num,light){
  const dpr=Math.min(2,window.devicePixelRatio||1);let W=0,H=0;
  const size=()=>{W=ov.clientWidth||innerWidth;H=ov.clientHeight||innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);};
  size();window.addEventListener('resize',size);ov._unsize=()=>window.removeEventListener('resize',size);
  const m=info.m,pool=msShuffle(info.words),word=i=>pool[i%pool.length];
  const ang=Math.PI*0.64,dirx=Math.cos(ang),diry=Math.sin(ang),drift=-dirx/diry;   // 오른쪽 위 → 왼쪽 아래
  const glow=msColors.map(c=>msSprite(c,48)),streak=msColors.map(c=>msStreak(c,150,ang));
  const FONT='"Apple SD Gothic Neo","Noto Sans KR",system-ui,sans-serif',SIZES=[10,12,14,17];
  const rnd=a=>a[Math.floor(Math.random()*a.length)];
  const meteors=[],sparks=[],flashes=[],rains=[];
  const plan=msPlan(m),T=plan.T;                                          // 1부터 m까지 세는 시간. 처음엔 천천히, 갈수록 빠르게
  let t0=performance.now(),spawned=0,popped=false,popAt=0,shells=[],slow=0,low=false,last=t0,shownCount=0,nextAmbient=0,wi=m,rush=false;
  ov._skip=()=>{if(popped)return false;rush=true;return true;};          // 세는 중에 누르면 바로 문턱으로
  const spawnMeteor=i=>{
    const sp=(H+W)*(.010+Math.random()*.007);                              // 글자가 읽히는 속도(26.10.08 영신: "너무 빠르게 하지 않아도")
    meteors.push({x:Math.random()*(W+H*drift),y:-20-Math.random()*80,vx:dirx*sp,vy:diry*sp,t:word(i),k:Math.floor(Math.random()*msColors.length),s:rnd(SIZES),scale:.55+Math.random()*.7,i});
  };
  /* 불꽃은 가운데 글자(숫자·고양이)를 피해 위·아래·양옆에서 터진다 */
  const SPOTS=[[.2,.15],[.8,.15],[.14,.52],[.86,.52],[.25,.85],[.75,.85],[.5,.93],[.5,.07],[.35,.1],[.65,.1]];
  const shell=(x,y,k,n)=>({at:0,x:W*x+(Math.random()-.5)*W*.08,y:H*y+(Math.random()-.5)*H*.05,k,n,fired:false});
  const planShells=()=>{const n=plan.shells,out=[];
    for(let i=0;i<n;i++){const [x,y]=SPOTS[i%SPOTS.length],sh=shell(x,y,i%msColors.length,Math.round(34+Math.random()*14));sh.at=250+i*(430-12*Math.min(4,plan.level))+Math.random()*120;out.push(sh);}
    return out;};
  const burst=sh=>{
    flashes.push({x:sh.x,y:sh.y,k:sh.k,life:0});msSound('pop');
    const R=Math.min(W,H)*(.38+Math.random()*.08);
    for(let i=0;i<sh.n;i++){
      const a=Math.random()*Math.PI*2,sp=(.45+Math.random()*.55)*R*.05;
      sparks.push({x:sh.x,y:sh.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:word(wi++),k:Math.random()<.75?sh.k:Math.floor(Math.random()*msColors.length),s:rnd(SIZES.slice(0,3)),life:0,max:44+Math.random()*24});
    }
    for(let i=0;i<56;i++){const a=Math.random()*Math.PI*2,sp=(.3+Math.random()*.7)*R*.058;sparks.push({x:sh.x,y:sh.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,dot:true,k:sh.k,life:0,max:40+Math.random()*40});}
  };
  const pop=now=>{
    popped=true;popAt=now;num.textContent=m.toLocaleString('en-US');
    const r=num.getBoundingClientRect(),o=ov.getBoundingClientRect();
    msLight(light,r.left-o.left+r.width/2,r.top-o.top+r.height/2,plan);
    ov.classList.add('popped');num.parentNode.classList.add('pop');
    msSound('fanfare');if(navigator.vibrate)try{navigator.vibrate([60,50,140]);}catch(e){}
    shells=planShells();nextAmbient=shells[shells.length-1].at+1400;
  };
  const alphaOf=p=>p.life<p.max*.5?1:Math.max(0,1-(p.life-p.max*.5)/(p.max*.5));
  const frame=now=>{
    const dt=now-last;last=now;const f=Math.min(3,Math.max(.5,dt/16.7));                  // 프레임이 느려도 같은 속도로
    if(dt>34)slow++;else if(slow>0)slow-=.25;if(slow>24)low=true;          // 느린 기기는 빛 번짐과 일부 글자를 줄인다
    cx.clearRect(0,0,W,H);cx.globalCompositeOperation='lighter';
    if(!popped){
      const want=rush?m:Math.min(m,Math.ceil(m*Math.pow(Math.min(1,(now-t0)/T),plan.ease)));
      if(rush)spawned=Math.max(spawned,want-24);                          // 건너뛸 때 남은 유성을 한꺼번에 띄우지 않는다
      while(spawned<want){spawnMeteor(spawned);spawned++;}
      if(spawned!==shownCount){shownCount=spawned;num.textContent=spawned.toLocaleString('en-US');}
      if(spawned>=m)pop(now);
    }
    for(let i=meteors.length-1;i>=0;i--){
      const p=meteors[i];p.x+=p.vx*f;p.y+=p.vy*f;
      if(p.x<-220||p.y>H+60){meteors.splice(i,1);continue;}
      const st=streak[p.k];cx.globalAlpha=.85;cx.drawImage(st.c,p.x-st.hx*p.scale,p.y-st.hy*p.scale,st.c.width*p.scale,st.c.height*p.scale);
      if(!low){cx.globalAlpha=.5;cx.drawImage(glow[p.k],p.x-13,p.y-13,26,26);}
    }
    if(popped){
      const since=now-popAt;
      for(const sh of shells)if(!sh.fired&&since>=sh.at){sh.fired=true;burst(sh);}
      if(plan.rain&&!low&&since<2800)for(let n=0;n<plan.rain*f;n++)rains.push({x:Math.random()*W,y:-10-Math.random()*40,vx:(Math.random()-.5)*.5,vy:3+Math.random()*4,k:Math.random()<.8?0:5,r:1.5+Math.random()*2.5});   // 2,000부터 금빛 비
      if(since>nextAmbient){const [x,y]=rnd(SPOTS);burst(shell(x,y,Math.floor(Math.random()*msColors.length),26));nextAmbient=since+1500+Math.random()*700;}
      for(let i=flashes.length-1;i>=0;i--){const fl=flashes[i];fl.life+=f;const a=1-fl.life/14;if(a<=0){flashes.splice(i,1);continue;}
        const r=50+fl.life*9;cx.globalAlpha=a;cx.drawImage(glow[fl.k],fl.x-r,fl.y-r,r*2,r*2);}
      for(let i=sparks.length-1;i>=0;i--){const p=sparks[i];p.life+=f;if(p.life>p.max){sparks.splice(i,1);continue;}
        const d=Math.pow(.955,f);p.vx*=d;p.vy=p.vy*d+.05*f;p.x+=p.vx*f;p.y+=p.vy*f;}
      for(let i=rains.length-1;i>=0;i--){const p=rains[i];p.x+=p.vx*f;p.y+=p.vy*f;if(p.y>H+10){rains.splice(i,1);continue;}
        cx.globalAlpha=Math.random()<.9?.85:.3;cx.drawImage(glow[p.k],p.x-p.r*2,p.y-p.r*2,p.r*4,p.r*4);}
      cx.lineWidth=1.4;
      for(const p of sparks){const a=alphaOf(p);
        if(p.dot){const r=2.5+Math.random()*3;cx.globalAlpha=a*(Math.random()<.85?1:.25);cx.drawImage(glow[p.k],p.x-r,p.y-r,r*2,r*2);continue;}
        if(!low){cx.globalAlpha=a*.45;cx.drawImage(glow[p.k],p.x-11,p.y-11,22,22);
          cx.globalAlpha=a*.5;cx.strokeStyle=`rgb(${msColors[p.k]})`;cx.beginPath();cx.moveTo(p.x-p.vx*5,p.y-p.vy*5);cx.lineTo(p.x,p.y);cx.stroke();}}
    }
    cx.globalCompositeOperation='source-over';cx.textAlign='center';cx.textBaseline='middle';
    for(const s of SIZES){
      cx.font=`800 ${s}px ${FONT}`;
      for(const p of meteors)if(p.s===s&&!(low&&p.i%2)){cx.globalAlpha=.95;cx.fillStyle=`rgb(${msColors[p.k]})`;cx.fillText(p.t,p.x,p.y);}
      if(popped)for(const p of sparks)if(!p.dot&&p.s===s){cx.globalAlpha=alphaOf(p);cx.fillStyle=`rgb(${msColors[p.k]})`;cx.fillText(p.t,p.x,p.y);}
    }
    cx.globalAlpha=1;
    msRaf=requestAnimationFrame(frame);
  };
  msRaf=requestAnimationFrame(frame);
}
function msClose(silent){
  if(msRaf)cancelAnimationFrame(msRaf);msRaf=0;
  if(msNode){msNode._unsize?.();msNode.remove();msNode=null;}
  if(silent)return;
  msBusy=false;
  if(msPendingEnding){msPendingEnding=false;msOrigEnding();}
}
function msPreviewWords(n){
  const u=new Set(msUnion(msRead()));
  if(u.size<n)msShuffle(state.lessons.flatMap(L=>L.exercises.flatMap(e=>e.words.map(msHead)))).forEach(k=>{if(k&&u.size<n)u.add(k);});
  return [...u];
}
/* 주소 끝 #milestone 또는 #milestone=2000 → 저장하지 않고 연출만 미리 본다(영신 확인용). */
function msPreview(){
  const m=/^#milestone(?:=(\d{4,5}))?$/.exec(location.hash||'');if(!m)return false;
  const n=Math.max(msStep,Math.floor((Number(m[1])||msStep)/msStep)*msStep);
  setTimeout(()=>msShow({m:n,total:n,retro:false,words:msPreviewWords(n),preview:true}),600);return true;
}
var msOrigFinish=finishExercise,msOrigEnding=showEnding;
finishExercise=function(){
  const s=state.session,ok=!!s&&!s.partial&&s.lesson?.kind!=='saved';
  const before=ok?msUnion(msRead()).size:0;
  const r=msOrigFinish.apply(this,arguments);
  if(ok)try{msAfterClear(before);}catch(e){}
  return r;
};
showEnding=function(){if(msBusy){msPendingEnding=true;return;}return msOrigEnding.apply(this,arguments);};
function msInit(){try{msSync();msPreview();}catch(e){}}
