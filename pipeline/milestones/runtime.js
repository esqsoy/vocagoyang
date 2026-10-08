/* 익힌 단어 1,000개 단위 돌파 축하(26.10.08 영신). '익힌 단어' = 클리어한 연습의 표제어(영신: "외운 단어"가 아니라 "익힌").
   세 교재는 같은 사이트 저장소를 쓴다. 교재마다 클리어한 연습의 표제어를 배운 순서대로 적어 두고, 합집합으로 센다(겹치는 단어는 한 번).
   연출: 익힌 단어가 배운 순서대로 저 멀리서 날아와 1부터 세고, 도착할 때마다 화면 가득한 단어 벽에 제자리 불이 켜진다
   → 문턱에서 빛 폭발(주기율표 게임의 광원 효과) → 숫자부터 벽 전체로 반짝임이 번진다. 틀렸던 단어는 금빛.
   2,000부터는 앞선 단어가 천 개씩 폭죽 한 발로 터지며 숫자가 천씩 뛰고, 최근 천 단어만 날아와 벽을 세운다. */
var msLearnedKey='goyang-learned-words-v1',msSeenKey='goyang-milestone-v1',msMissKey='goyang-missed-words-v1',msStep=1000;
var msBusy=false,msPendingEnding=false,msRaf=0,msNode=null,msOpenedAt=0;
var msColors=['255,211,77','255,79,163','92,230,255','195,153,255','124,255,178','255,255,255'];
/* 세는 연출(26.10.08 영신): warp = 외운 단어가 배운 순서대로 저 멀리에서 눈앞으로 날아와 섬광이 된다(확정). rain = 대각선 유성우(첫 후보, 미리 보기로만). */
var msMode='warp';                                                     // 26.10.08 영신: far to near 확정
function msHead(w){const t=w&&(w.word??w.en??w.term);return typeof t==='string'?t.normalize('NFC').trim().replace(/\s+/gu,' ').toLowerCase():'';}
function msRead(){
  try{const o=JSON.parse(localStorage.getItem(msLearnedKey)||'{}');return o&&typeof o==='object'&&!Array.isArray(o)?o:{};}
  catch{return {};}
}
/* 배운 순서를 지킨다: FABLE → 마더텅 → EBS, 교재 안에서는 세트·연습 순서. */
function msUnion(all){const u=new Set(),order=['fable','ksat','ebs',...Object.keys(all).filter(k=>!['fable','ksat','ebs'].includes(k))];
  order.forEach(c=>Array.isArray(all[c])&&all[c].forEach(k=>typeof k==='string'&&k&&u.add(k)));return u;}
function msCourseWords(){
  const set=new Set();
  state.lessons.forEach(L=>L.exercises.forEach(e=>{if(getRec(L.id,e.title)?.completed)e.words.forEach(w=>{const k=msHead(w);if(k)set.add(k);});}));
  return [...set];
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
/* 틀렸던 단어 기록(26.10.08 영신 "틀렸던 단어의 로그가 남나? 그러면 그 단어들은 특히 빛나게"). 전에는 판이 끝나면 사라졌다.
   판이 끝나거나 중간에 나갈 때, 그 판에서 한 번이라도 틀린 단어를 표제어로 센다(판마다 한 번). 세 교재가 함께 쓴다. */
function msMissed(){try{const o=JSON.parse(localStorage.getItem(msMissKey)||'{}');return o&&typeof o==='object'&&!Array.isArray(o)?o:{};}catch{return {};}}
function msLogMisses(s){
  if(!s||!Array.isArray(s.words))return 0;
  const done=s._msMissed||(s._msMissed=new Set()),add=[];
  s.words.forEach(w=>{if(w&&w.wrongEver){const k=msHead(w);if(k&&!done.has(k)){done.add(k);add.push(k);}}});
  if(!add.length)return 0;
  const o=msMissed();add.forEach(k=>{o[k]=(Number(o[k])||0)+1;});
  try{localStorage.setItem(msMissKey,JSON.stringify(o));}catch{}
  return add.length;
}
function msSeen(){try{return Math.max(0,Number(JSON.parse(localStorage.getItem(msSeenKey)||'{}').seen)||0);}catch{return 0;}}
function msMarkSeen(m){try{localStorage.setItem(msSeenKey,JSON.stringify({seen:m}));}catch{}}
/* 클리어 직후: 지금까지 넘은 문턱 중 가장 큰 것을 아직 축하하지 않았으면 한 번 띄운다.
   업데이트 전에 이미 넘은 학생은 첫 클리어 때 그 문턱 하나만(retro). */
function msAfterClear(before){
  const words=msSync(),total=words.size,m=Math.floor(total/msStep)*msStep;
  if(m<msStep||m<=msSeen())return null;
  msMarkSeen(m);
  const info={m,total,retro:before>=m,words:[...words],missed:Object.keys(msMissed())};
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
    const boom=kind==='boom',len=Math.floor(actx.sampleRate*(boom?.7:.35)),buf=actx.createBuffer(1,len,actx.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,boom?2.4:3);
    const src=actx.createBufferSource(),f=actx.createBiquadFilter(),g=actx.createGain();
    f.type='lowpass';f.frequency.value=boom?380+Math.random()*220:900+Math.random()*700;g.gain.value=boom?.14:.07;
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
/* 문턱이 높을수록 길고 화려하게(26.10.08 영신: "갈수록 더 길게", "1000개나 외웠는데 좀 길어도", "쪼끔만 더 느리게").
   날아오는 것은 최근 천 단어다. 첫 6개는 하나씩(0.42초 간격), 나머지는 6초 동안 배운 순서대로 온다.
   2,000부터 앞선 단어는 천 개씩 폭죽 한 발이 된다(26.10.08 영신: "기존 단어들을 천 단어 단위로 폭죽 처리하고 최근 천 단어를 벽에 세우는 건").
   폭죽은 1초 간격(많으면 좁혀 6초 안), 마지막 폭죽이 핀 뒤 0.4초에 첫 단어가 소실점에서 출발한다. 그래서 문턱이 오를수록 폭죽 수만큼 길어진다.
   rainT·rainEase는 첫 후보(rain, 미리 보기)가 문턱의 모든 단어를 세는 시간이다. */
function msChunks(m){const out=[];for(let a=0;a+msStep<m;a+=msStep)out.push([a,a+msStep]);return out;}   // 폭죽 한 발 = 앞선 천 단어
function msPlan(m){
  const L=Math.max(1,Math.round(m/msStep)),k=Math.min(4,L),recap=L-1;
  const recapLead=650,recapGap=recap>1?Math.max(300,Math.min(1000,6000/recap)):0,recapDur=recap?recapLead+(recap-1)*recapGap+400:0;
  const p={level:L,T:6000,ease:1.9,intro:6,introGap:420,recent:Math.min(m,msStep),recap,recapLead,recapGap,recapDur,
    rainT:Math.min(15000,4000+2000*L),rainEase:Math.max(1.4,1.9-.15*(L-1)),
    shells:Math.min(18,5+2*L),rings:2+k,rays:8+4*k,rain:L>=2?Math.min(8,1.5*L):0};
  p.dur=recapDur+p.intro*p.introGap+p.T;return p;
}
function msLight(layer,x,y,plan){
  const at=el=>{el.style.setProperty('--x',x+'px');el.style.setProperty('--y',y+'px');layer.appendChild(el);return el;};
  const mk=cls=>{const el=document.createElement('div');el.className=cls;return at(el);};
  mk('ms-flash');for(let i=1;i<=plan.rings;i++)mk('ms-ring'+(i>1?' r'+i:''));mk('ms-shock');
  const rays=mk('ms-rays');
  for(let i=0;i<plan.rays;i++){const r=document.createElement('div');r.className='ms-ray';r.style.transform=`rotate(${i*360/plan.rays}deg) translateX(-50%)`;rays.appendChild(r);}
}
/* 단어 벽 배치: 배운 순서대로 줄을 맞춰(양끝 정렬, 벽돌처럼) 화면을 채운다. 벽은 최근 천 단어라 약 8px이다. 더 많이 넣으면 작아져 빛의 결이 된다(최소 2.4px). */
function msWallLayout(words,W,H,measure){
  let fs=Math.max(2.4,Math.min(9,8.1*Math.sqrt(1000/Math.max(1,words.length))));
  for(let tries=0;tries<30;tries++){
    const lh=fs*1.19,pad=Math.max(4,fs*.6),gap=fs*.42,maxW=W-pad*2,rows=[];let row=[],w=0;
    words.forEach((t,i)=>{const tw=measure(t,fs);if(row.length&&w+gap+tw>maxW){rows.push(row);row=[];w=0;}row.push({i,tw});w+=(row.length>1?gap:0)+tw;});
    if(row.length)rows.push(row);
    if(rows.length*lh<=H-8||fs<=2.4){
      const top=Math.max(4,(H-rows.length*lh)/2),slots=new Array(words.length);
      rows.forEach((r,ri)=>{const tot=r.reduce((a,b)=>a+b.tw,0),g=ri===rows.length-1||r.length<2?gap:(maxW-tot)/(r.length-1);let x=pad;
        r.forEach(o=>{slots[o.i]={x,y:top+ri*lh+lh/2,w:o.tw};x+=o.tw+g;});});
      return {fs,lh,rows:rows.length,slots};
    }
    fs=Math.max(2.4,fs*.95);
  }
}
function msWallColor(i,gold){return gold?0:1+((i*7)%5);}                  // 금빛은 틀렸던 단어에만
function msWallPaint(w,words,lay,gold,i,alpha){const s=lay.slots[i];if(!s)return;
  if(gold){w.shadowColor='rgba(255,211,77,.9)';w.shadowBlur=6;w.globalAlpha=1;}else{w.shadowBlur=0;w.globalAlpha=alpha;}
  w.fillStyle=`rgb(${msColors[msWallColor(i,gold)]})`;w.fillText(words[i],s.x,s.y);w.shadowBlur=0;}
/* 동작 줄이기: 벽을 한 번에 다 켠 정지 화면 */
function msWallStatic(ov,canvas,words,missed){
  const cx=canvas.getContext&&canvas.getContext('2d');if(!cx)return;
  const dpr=Math.min(2,window.devicePixelRatio||1),W=ov.clientWidth||innerWidth,H=ov.clientHeight||innerHeight;
  canvas.width=W*dpr;canvas.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);
  const FONT='"Apple SD Gothic Neo","Noto Sans KR",system-ui,sans-serif',base={};cx.font=`700 10px ${FONT}`;
  const lay=msWallLayout(words,W,H,(t,fs)=>(base[t]??=cx.measureText(t).width)*fs/10);
  cx.font=`700 ${lay.fs}px ${FONT}`;cx.textBaseline='middle';cx.textAlign='left';
  words.forEach((t,i)=>msWallPaint(cx,words,lay,missed.has(t),i,.6));
}
function msShow(info){
  msClose(true);msBusy=true;
  const m=info.m,label=m.toLocaleString('en-US'),still=!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const mk=(tag,cls,parent,html)=>{const el=document.createElement(tag);el.className=cls;if(html!=null)el.innerHTML=html;parent.appendChild(el);return el;};
  const ov=document.createElement('div');ov.className='ms-fx'+((info.mode||msMode)==='warp'?' warp':'');ov.id='msFx';
  ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label',label+'단어 돌파 축하');
  const canvas=mk('canvas','ms-canvas',ov);canvas.setAttribute('aria-hidden','true');
  mk('div','ms-glory',ov).setAttribute('aria-hidden','true');
  const light=mk('div','ms-light',ov);light.setAttribute('aria-hidden','true');
  const inner=mk('div','ms-inner',ov);
  const numBox=mk('div','ms-num',inner),num=mk('b','',numBox);num.textContent=still?label:'0';
  mk('div','ms-title',inner,'단어 돌파!');
  mk('div','ms-cat',inner,'<img id="msCat" alt="고양고양이">');
  mk('div','ms-line',inner,'<span class="nm">고양고양이</span> '+esc(msLine(m,info.retro))).setAttribute('aria-live','polite');
  const missed=new Set(info.missed||[]),goldN=info.words.slice(0,m).filter(k=>missed.has(k)).length;
  mk('div','ms-sub',inner,(info.preview?'미리 보기':'세 교재를 합쳐 겹치는 단어는 한 번만 셌다고양 · 지금 '+info.total.toLocaleString('en-US')+'단어')+(goldN?'<br><span class="gold">금빛 '+goldN.toLocaleString('en-US')+'개는 한 번 틀렸다가 끝내 익힌 단어라고양</span>':''));
  const btn=mk('button','ms-close',inner,'계속하기 ▶');btn.type='button';
  document.body.appendChild(ov);msNode=ov;msOpenedAt=Date.now();
  if(typeof setCat==='function')setCat('msCat','win');
  ov.addEventListener('click',()=>{if(ov._skip&&ov._skip())return;if(Date.now()-msOpenedAt>1200)msClose();});
  btn.addEventListener('click',e=>{e.stopPropagation();msClose();});
  if(still){ov.classList.add('popped','still');msSound('fanfare');try{msWallStatic(ov,canvas,info.words.slice(Math.max(0,m-msStep),m),missed);}catch(e){}return;}
  const cx=canvas.getContext&&canvas.getContext('2d');
  if(!cx){num.textContent=label;ov.classList.add('popped');msSound('fanfare');return;}
  msRun(ov,canvas,cx,info,num,light);
}
function msRun(ov,canvas,cx,info,num,light){
  const dpr=Math.min(2,window.devicePixelRatio||1);let W=0,H=0;
  const size=()=>{W=ov.clientWidth||innerWidth;H=ov.clientHeight||innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);};
  const onResize=()=>{size();if(wall)buildWall();};
  size();window.addEventListener('resize',onResize);ov._unsize=()=>window.removeEventListener('resize',onResize);
  const m=info.m,mode=info.mode||msMode,warp=mode==='warp',pool=warp?info.words.slice():msShuffle(info.words),word=i=>pool[i%pool.length];   // warp는 배운 순서대로
  const plan=msPlan(m),base=warp?m-plan.recent:0,N=m-base,T=warp?plan.T:plan.rainT,ease=warp?plan.ease:plan.rainEase;   // warp: 최근 N(천) 단어가 날아와 벽이 되고, 앞선 base단어는 폭죽이 된다
  const ang=Math.PI*0.64,dirx=Math.cos(ang),diry=Math.sin(ang),drift=-dirx/diry;   // 오른쪽 위 → 왼쪽 아래
  const glow=msColors.map(c=>msSprite(c,48)),streak=msColors.map(c=>msStreak(c,150,ang));
  const FONT='"Apple SD Gothic Neo","Noto Sans KR",system-ui,sans-serif',SIZES=[10,12,14,17];
  const rnd=a=>a[Math.floor(Math.random()*a.length)];
  const meteors=[],sparks=[],flashes=[],rains=[],warps=[],blasts=[],rockets=[];
  let t0=performance.now(),spawned=0,arrived=0,fired=0,popped=false,popAt=0,shells=[],slow=0,low=false,last=t0,shownCount=0,nextAmbient=0,wi=m,rush=false,wall=null,shimmer=-1,wallA=1,twinkles=[],nextTwinkle=0;
  const t1=t0+(warp?plan.recapDur:0);                                     // 단어가 날아오기 시작하는 때(폭죽 뒤)
  const missed=new Set(info.missed||[]),gold=pool.slice(0,m).map(k=>missed.has(k)),goldIdx=[];
  for(let j=0;j<N;j++)if(gold[base+j])goldIdx.push(j);                    // 벽 안의 금빛 칸
  ov._skip=()=>{if(popped)return false;rush=true;return true;};          // 세는 중에 누르면 바로 문턱으로
  const spawnMeteor=i=>{
    const sp=(H+W)*(.010+Math.random()*.007);                              // 글자가 읽히는 속도(26.10.08 영신: "너무 빠르게 하지 않아도")
    meteors.push({x:Math.random()*(W+H*drift),y:-20-Math.random()*80,vx:dirx*sp,vy:diry*sp,t:word(i),k:Math.floor(Math.random()*msColors.length),s:rnd(SIZES),scale:.55+Math.random()*.7,i});
  };
  /* warp: 소실점(숫자 뒤)에서 태어나 학생 쪽으로 다가온다. 원근 배율 s=ZN/z라 가까울수록 커지고 밝아진다.
     정면 단어(초당 다섯 남짓)는 크게 다가와 눈앞에서 섬광이 되고, 나머지는 작게 화면 밖으로 스쳐 간다. 도착할 때마다 1씩 센다.
     단어 말고는 날아오는 빛이 없다(영신: "오직 단어만이 어둠을 밝히는 식"). 단어에 붙은 꼬리선과 섬광의 불티는 둔다(영신: "좋은 거 같아"). */
  const Z0=8,ZN=.5,minD=Math.min(W,H);
  const nr=num.getBoundingClientRect(),orc=ov.getBoundingClientRect(),VX=nr.left-orc.left+nr.width/2||W/2,VY=nr.top-orc.top+nr.height/2||H*.3;
  const rateNow=t=>ease*N/T*Math.pow(Math.max(.02,Math.min(1,t/T)),ease-1)*1000;   // 초당 도착 수
  const introEnd=plan.intro*plan.introGap;
  const spawnWarp=(j,now,force)=>{const i=base+j;                          // j는 벽 칸(최근 천 단어 안의 순서)
    const r=rateNow(now-t1-introEnd),head=force||(gold[i]&&Math.random()<Math.min(1,10/r))||Math.random()<Math.min(.6,5/r);   // 크게 다가오는 단어는 초당 다섯 남짓, 틀렸던 단어는 되도록 정면으로
    let a=Math.random()*Math.PI*2;if(head&&Math.abs(Math.sin(a))<.5)a=Math.random()<.5?Math.PI*(.25+Math.random()*.5):Math.PI*(1.25+Math.random()*.5);   // 눈앞 섬광은 숫자 위아래로
    const rf=head?minD*(.16+Math.random()*.4):minD*(.62+Math.random()*1.1);
    warps.push({dx:Math.cos(a)*rf,dy:Math.sin(a)*rf,z:Z0,vz:(Z0-ZN)/(60*(1.9+Math.random()*.6)),t:word(i),k:msWallColor(j,gold[i]),big:(head?36+Math.random()*22:16+Math.random()*10)*(gold[i]?1.15:1),head,idx:j,gold:gold[i]});
  };
  const blast=(x,y,k,r)=>{blasts.push({x,y,k,r,life:0});                   // 단어가 제 빛으로 터지며 불티가 튄다
    for(let i=0;i<7;i++){const a=Math.random()*Math.PI*2,sp=1.5+Math.random()*3.5;sparks.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,dot:true,k,life:0,max:22+Math.random()*16,drag:1,g:0});}};
  /* 앞선 단어의 폭죽(2,000부터, 26.10.08 영신): 천 단어 묶음마다 한 발이 아래에서 솟아 터지고, 숫자가 천씩 뛴다.
     한 발의 알갱이 천 개가 곧 그 천 단어다. 백스무 개는 글자로 보이고(틀렸던 단어 먼저, 금빛), 나머지는 빛 알갱이다.
     화면 전체로 터진다(영신: "폭죽 크기만 최대한 키우자 어차피 식별이 중요한 게 아니니까 화면 전체에"). 가운데서 터져 알갱이가 네 귀퉁이 너머까지 간다. */
  const SKY=[[.5,.56],[.44,.6],[.56,.52],[.48,.64],[.54,.58],[.5,.5]];       // 숫자 아래 화면 가운데
  const recap=warp?msChunks(m).map(([a,b],c)=>{const [x,y]=SKY[c%SKY.length];return {a,b,at:c*plan.recapGap,x:W*x+(Math.random()-.5)*W*.06,y:H*y+(Math.random()-.5)*H*.04,k:1+c%5,up:false};}):[];
  const bump=()=>{const b=num.parentNode;b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');};   // 숫자가 뛸 때마다 다시 튄다
  const firework=r=>{
    fired++;bump();flashes.push({x:r.x,y:r.y,k:r.k,life:0,s:2.6});msSound('boom');
    const R=Math.hypot(W,H)*(.5+Math.random()*.08),TXT=low?50:120,gw=[],pw=[];   // 가운데에서 귀퉁이까지가 대각선의 절반
    for(let i=r.a;i<r.b;i++)(gold[i]?gw:pw).push(i);
    const txt=new Set(gw.slice(0,TXT>>1)),need=TXT-txt.size;
    for(let s=0;s<need&&pw.length;s++)txt.add(pw[Math.floor(s*pw.length/need)]);   // 나머지 글자는 묶음 안에서 고르게
    for(let i=r.a;i<r.b;i++){const a=Math.random()*Math.PI*2,k=gold[i]?0:Math.random()<.8?r.k:1+Math.floor(Math.random()*5);   // 금빛은 틀렸던 단어에만
      if(txt.has(i)){const sp=(.2+.8*Math.sqrt(Math.random()))*R*.05;sparks.push({x:r.x,y:r.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:word(i),k,s:rnd(SIZES),life:0,max:72+Math.random()*32,drag:.955,g:.035});}
      else if(!low||i%3===0){const sp=(.15+.85*Math.sqrt(Math.random()))*R*.056;sparks.push({x:r.x,y:r.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,dot:true,r:1.4+Math.random()*1.6,k,life:0,max:56+Math.random()*40,drag:.95,g:.05});}}
  };
  const launch=now=>{const el=now-t0;
    for(const r of recap)if(!r.up&&el>=r.at){r.up=true;rockets.push({r,x0:r.x+(Math.random()-.5)*W*.12,y0:H+12});}};
  /* 단어 벽(26.10.08 영신: "내 무지의 어둠이 단어의 빛으로 가득 차는 컨셉"): 날아올 최근 천 단어를 배운 순서대로 화면 가득 깔아 둔다.
     처음엔 어둠이고, 단어가 도착할 때마다 제자리에 불이 켜진다. 문턱에서 숫자부터 벽 전체로 반짝임이 번진다. */
  const wallWords=pool.slice(base,m);
  const commit=j=>{msWallPaint(wall.w,wallWords,wall,gold[base+j],j,.74);wall.lit[j]=2;};
  const buildWall=()=>{
    const ms={};cx.font=`700 10px ${FONT}`;
    const lay=msWallLayout(wallWords,W,H,(t,fs)=>(ms[t]??=cx.measureText(t).width)*fs/10);
    const c=document.createElement('canvas');c.width=W*dpr;c.height=H*dpr;const w=c.getContext('2d');w.setTransform(dpr,0,0,dpr,0,0);
    w.font=`700 ${lay.fs}px ${FONT}`;w.textBaseline='middle';w.textAlign='left';
    const old=wall;wall={...lay,c,w,lit:old?old.lit:new Uint8Array(N),ign:old?old.ign:[],mask:document.createElement('canvas')};
    wall.mask.width=c.width;wall.mask.height=c.height;
    if(old)for(let j=0;j<N;j++)if(old.lit[j]===2)commit(j);
  };
  const ignite=(j,delay)=>{if(!wall||j>=N||wall.lit[j])return;wall.lit[j]=1;wall.ign.push({i:j,t:-(delay||0)});};
  if(warp)buildWall();
  const drawWall=f=>{
    cx.globalCompositeOperation='source-over';cx.globalAlpha=wallA;cx.drawImage(wall.c,0,0,W,H);
    cx.font=`700 ${wall.fs}px ${FONT}`;cx.textBaseline='middle';cx.textAlign='left';
    for(let j=wall.ign.length-1;j>=0;j--){const g=wall.ign[j];g.t+=f;if(g.t<0)continue;
      if(g.t>=18){wall.ign.splice(j,1);commit(g.i);continue;}
      const s=wall.slots[g.i],q=g.t/18,k=msWallColor(g.i,gold[base+g.i]);if(!s)continue;
      if(!low){const r=wall.fs*2*(1-q*.4);cx.globalCompositeOperation='lighter';cx.globalAlpha=(1-q)*.5;cx.drawImage(glow[k],s.x+s.w/2-r*1.5,s.y-r*.8,r*3,r*1.6);}   // 불이 켜지는 순간
      cx.globalCompositeOperation='source-over';cx.globalAlpha=1;cx.fillStyle=q<.35?'#fff':`rgb(${msColors[k]})`;cx.fillText(wallWords[g.i],s.x,s.y);}
    if(shimmer>=0){shimmer+=f;const maxD=Math.hypot(Math.max(VX,W-VX),Math.max(VY,H-VY)),R=shimmer/75*maxD,band=maxD*.2;   // 문턱: 숫자에서 벽 전체로 번지는 반짝임
      if(R>maxD+band)shimmer=-1;
      else if(!low){const mk=wall.mask.getContext('2d');mk.setTransform(1,0,0,1,0,0);mk.globalCompositeOperation='source-over';mk.clearRect(0,0,wall.mask.width,wall.mask.height);
        const gr=mk.createRadialGradient(VX*dpr,VY*dpr,Math.max(0,R-band)*dpr,VX*dpr,VY*dpr,(R+band*.25)*dpr);
        gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.75,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');
        mk.fillStyle=gr;mk.fillRect(0,0,wall.mask.width,wall.mask.height);mk.globalCompositeOperation='source-in';mk.drawImage(wall.c,0,0);
        cx.globalCompositeOperation='lighter';cx.globalAlpha=1;cx.drawImage(wall.mask,0,0,W,H);cx.drawImage(wall.mask,0,0,W,H);}}
    for(let j=twinkles.length-1;j>=0;j--){const tw=twinkles[j];tw.t+=f;if(tw.t>40){twinkles.splice(j,1);continue;}   // 금빛 벽돌이 가끔 반짝인다
      const s=wall.slots[tw.i],a=Math.sin(Math.PI*tw.t/40);if(!s)continue;cx.globalCompositeOperation='lighter';cx.globalAlpha=a*.7;const r=wall.fs*2.4;cx.drawImage(glow[0],s.x+s.w/2-r*1.6,s.y-r,r*3.2,r*2);}
    cx.textAlign='center';
  };
  /* 불꽃은 가운데 글자(숫자·고양이)를 피해 위·아래·양옆에서 터진다(첫 후보 rain에서만) */
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
      sparks.push({x:sh.x,y:sh.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:word(wi++),k:Math.random()<.75?sh.k:Math.floor(Math.random()*msColors.length),s:rnd(SIZES.slice(0,3)),life:0,max:44+Math.random()*24,drag:.955,g:.05});
    }
    for(let i=0;i<56;i++){const a=Math.random()*Math.PI*2,sp=(.3+Math.random()*.7)*R*.058;sparks.push({x:sh.x,y:sh.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,dot:true,k:sh.k,life:0,max:40+Math.random()*40,drag:.955,g:.05});}
  };
  const pop=now=>{
    popped=true;popAt=now;num.textContent=m.toLocaleString('en-US');
    const r=num.getBoundingClientRect(),o=ov.getBoundingClientRect();
    msLight(light,r.left-o.left+r.width/2,r.top-o.top+r.height/2,plan);
    ov.classList.add('popped');bump();
    msSound('fanfare');if(navigator.vibrate)try{navigator.vibrate([60,50,140]);}catch(e){}
    if(wall){shimmer=0;nextAmbient=Infinity;for(let j=0;j<N;j++)ignite(j,Math.random()*30);}   // 남은 칸은 물결처럼 켠다
    else{shells=planShells();nextAmbient=shells[shells.length-1].at+1400;}
  };
  const alphaOf=p=>p.life<p.max*.5?1:Math.max(0,1-(p.life-p.max*.5)/(p.max*.5));
  const frame=now=>{
    const dt=now-last;last=now;const f=Math.min(3,Math.max(.5,dt/16.7));                  // 프레임이 느려도 같은 속도로
    if(dt>34)slow++;else if(slow>0)slow-=.25;if(slow>24)low=true;          // 느린 기기는 빛 번짐과 일부 글자를 줄인다
    cx.clearRect(0,0,W,H);
    if(wall){if(popped&&now-popAt>2200)wallA=Math.max(.6,wallA-.012*f);   // 고양이가 나오면 벽은 한 걸음 물러나 액자가 된다
      if(popped&&now-popAt>2500&&now>nextTwinkle&&goldIdx.length){twinkles.push({i:goldIdx[Math.floor(Math.random()*goldIdx.length)],t:0});nextTwinkle=now+350;}
      drawWall(f);}
    cx.globalCompositeOperation='lighter';
    if(!popped){
      if(warp){if(!rush)launch(now);const el=now-t1;
        if(!rush&&el>=0&&el<introEnd+1){while(spawned<plan.intro&&spawned*plan.introGap<=el){spawnWarp(spawned,now,true);spawned++;}}   // 처음 몇 단어는 하나씩, 정면으로
        else if(rush||el>=0){const w2=rush?N:Math.min(N,plan.intro+Math.ceil((N-plan.intro)*Math.pow(Math.min(1,(el-introEnd)/T),ease)));
          if(rush)spawned=Math.max(spawned,w2-24);while(spawned<w2){spawnWarp(spawned,now);spawned++;}}   // 건너뛸 때 남은 단어를 한꺼번에 띄우지 않는다
        if(rush){arrived=N;fired=recap.length;}}
      else{const want=rush?m:Math.min(m,Math.ceil(m*Math.pow(Math.min(1,(now-t0)/T),ease)));
        if(rush)spawned=Math.max(spawned,want-24);
        while(spawned<want){spawnMeteor(spawned);spawned++;}arrived=spawned;}
      const count=fired*msStep+arrived;                                     // 폭죽 한 발에 천, 날아온 단어 하나에 하나
      if(count!==shownCount){shownCount=count;num.textContent=count.toLocaleString('en-US');}
      if(count>=m)pop(now);
    }
    for(let i=meteors.length-1;i>=0;i--){
      const p=meteors[i];p.x+=p.vx*f;p.y+=p.vy*f;
      if(p.x<-220||p.y>H+60){meteors.splice(i,1);continue;}
      const st=streak[p.k];cx.globalAlpha=.85;cx.drawImage(st.c,p.x-st.hx*p.scale,p.y-st.hy*p.scale,st.c.width*p.scale,st.c.height*p.scale);
      if(!low){cx.globalAlpha=.5;cx.drawImage(glow[p.k],p.x-13,p.y-13,26,26);}
    }
    for(let i=rockets.length-1;i>=0;i--){const o=rockets[i],q=(now-t0-o.r.at)/plan.recapLead;   // 폭죽이 솟는 줄기
      if(rush||q>=1){rockets.splice(i,1);if(!rush)firework(o.r);continue;}
      const e=t=>1-(1-t)*(1-t),at=t=>[o.x0+(o.r.x-o.x0)*e(t),o.y0+(o.r.y-o.y0)*e(t)],[x,y]=at(q),[px,py]=at(Math.max(0,q-.18));
      cx.globalAlpha=.7;cx.strokeStyle=`rgb(${msColors[o.r.k]})`;cx.lineWidth=2;cx.beginPath();cx.moveTo(px,py);cx.lineTo(x,y);cx.stroke();
      cx.globalAlpha=1;cx.drawImage(glow[5],x-7,y-7,14,14);}
    for(let i=warps.length-1;i>=0;i--){const p=warps[i],z1=p.z;p.z-=p.vz*f;
      const s2=ZN/Math.max(ZN,p.z),x=VX+p.dx*s2,y=VY+p.dy*s2;p.x=x;p.y=y;p.s=s2;
      if(p.z<=ZN){warps.splice(i,1);ignite(p.idx);if(!popped&&!rush)arrived++;if(p.head&&x>-40&&x<W+40&&y>-40&&y<H+40)blast(x,y,p.k,p.big*2);continue;}
      if(x<-300||x>W+300||y<-200||y>H+200){p.off=true;continue;}
      const a=Math.min(1,(Z0-p.z)/1.2)*(p.head?1:.6),s1=ZN/z1;p.a=a;
      cx.globalAlpha=a*.5;cx.strokeStyle=`rgb(${msColors[p.k]})`;cx.lineWidth=Math.max(.8,s2*4);cx.beginPath();cx.moveTo(VX+p.dx*s1*.82,VY+p.dy*s1*.82);cx.lineTo(x,y);cx.stroke();   // 단어 뒤 꼬리선(영신: 좋다)
      if(!low&&p.head&&s2>.3){const r=p.big*s2*(1+s2*.5);cx.globalAlpha=a*(.18+.3*s2);cx.drawImage(glow[p.k],x-r,y-r,r*2,r*2);}}   // 가까워진 단어의 제 빛
    for(let i=blasts.length-1;i>=0;i--){const b=blasts[i];b.life+=f;const q=1-b.life/13;if(q<=0){blasts.splice(i,1);continue;}
      const r=b.r*(.7+b.life*.22);cx.globalAlpha=Math.pow(q,1.4)*.85;cx.drawImage(glow[b.k],b.x-r,b.y-r,r*2,r*2);
      const c=r*.5;cx.globalAlpha=Math.pow(q,2)*.95;cx.drawImage(glow[5],b.x-c,b.y-c,c*2,c*2);
      const fw=r*2.6,fh=r*.2;cx.globalAlpha=Math.pow(q,1.6)*.6;cx.drawImage(glow[5],b.x-fw,b.y-fh,fw*2,fh*2);}   // 가로 섬광
    for(let i=sparks.length-1;i>=0;i--){const p=sparks[i];p.life+=f;if(p.life>p.max){sparks.splice(i,1);continue;}   // 불티와 폭죽 알갱이는 한 물리(제 저항·중력)로 움직인다
      if(p.drag<1){const d=Math.pow(p.drag,f);p.vx*=d;p.vy*=d;}p.vy+=p.g*f;p.x+=p.vx*f;p.y+=p.vy*f;}
    if(popped){
      const since=now-popAt;
      for(const sh of shells)if(!sh.fired&&since>=sh.at){sh.fired=true;burst(sh);}
      if(!wall&&plan.rain&&!low&&since<2800)for(let n=0;n<plan.rain*f;n++)rains.push({x:Math.random()*W,y:-10-Math.random()*40,vx:(Math.random()-.5)*.5,vy:3+Math.random()*4,k:Math.random()<.8?0:5,r:1.5+Math.random()*2.5});   // 2,000부터 금빛 비(rain 후보)
      if(since>nextAmbient){const [x,y]=rnd(SPOTS);burst(shell(x,y,Math.floor(Math.random()*msColors.length),26));nextAmbient=since+1500+Math.random()*700;}
      for(let i=rains.length-1;i>=0;i--){const p=rains[i];p.x+=p.vx*f;p.y+=p.vy*f;if(p.y>H+10){rains.splice(i,1);continue;}
        cx.globalAlpha=Math.random()<.9?.85:.3;cx.drawImage(glow[p.k],p.x-p.r*2,p.y-p.r*2,p.r*4,p.r*4);}
    }
    for(let i=flashes.length-1;i>=0;i--){const fl=flashes[i];fl.life+=f;const a=1-fl.life/14;if(a<=0){flashes.splice(i,1);continue;}
      const r=(50+fl.life*9)*(fl.s||1);cx.globalAlpha=a;cx.drawImage(glow[fl.k],fl.x-r,fl.y-r,r*2,r*2);}
    cx.lineWidth=1.4;
    for(const p of sparks){const a=alphaOf(p);
      if(p.dot){const r=p.r?p.r+Math.random()*1.2:2.5+Math.random()*3;cx.globalAlpha=a*(Math.random()<.85?1:.25);cx.drawImage(glow[p.k],p.x-r,p.y-r,r*2,r*2);continue;}
      if(!low){cx.globalAlpha=a*.45;cx.drawImage(glow[p.k],p.x-11,p.y-11,22,22);
        cx.globalAlpha=a*.5;cx.strokeStyle=`rgb(${msColors[p.k]})`;cx.beginPath();cx.moveTo(p.x-p.vx*5,p.y-p.vy*5);cx.lineTo(p.x,p.y);cx.stroke();}}
    cx.globalCompositeOperation='source-over';cx.textAlign='center';cx.textBaseline='middle';
    if(warps.length){cx.font=`800 40px ${FONT}`;
      for(const p of warps){if(p.off||p.s==null)continue;const sc=p.big/40*p.s;if(sc*40<3)continue;   // 너무 작으면 아직 어둠
        cx.setTransform(dpr*sc,0,0,dpr*sc,dpr*p.x,dpr*p.y);cx.globalAlpha=p.a*Math.min(1,.12+p.s*1.5);cx.fillStyle=`rgb(${msColors[p.k]})`;cx.fillText(p.t,0,0);}
      cx.setTransform(dpr,0,0,dpr,0,0);}
    for(const s of SIZES){
      cx.font=`800 ${s}px ${FONT}`;
      for(const p of meteors)if(p.s===s&&!(low&&p.i%2)){cx.globalAlpha=.95;cx.fillStyle=`rgb(${msColors[p.k]})`;cx.fillText(p.t,p.x,p.y);}
      for(const p of sparks)if(!p.dot&&p.s===s){cx.globalAlpha=alphaOf(p);cx.fillStyle=`rgb(${msColors[p.k]})`;cx.fillText(p.t,p.x,p.y);}
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
  if(u.size<n)state.lessons.flatMap(L=>L.exercises.flatMap(e=>e.words.map(msHead))).forEach(k=>{if(k&&u.size<n)u.add(k);});   // 배운 순서대로 채운다
  return [...u];
}
/* 주소 끝 #milestone 또는 #milestone=2000 → 저장하지 않고 연출만 미리 본다(영신 확인용). &fx=rain이면 첫 후보(대각선 유성우). */
function msPreview(){
  const m=/^#milestone(?:=(\d{4,5}))?(?:&fx=(rain|warp))?$/.exec(location.hash||'');if(!m)return false;
  const n=Math.max(msStep,Math.floor((Number(m[1])||msStep)/msStep)*msStep);
  const words=msPreviewWords(n),miss=Object.keys(msMissed());
  setTimeout(()=>msShow({m:n,total:n,retro:false,words,preview:true,mode:m[2],missed:miss.length?miss:words.filter((_,i)=>i%14===5)}),600);return true;   // 기록이 없으면 금빛 견본을 섞어 보여 준다
}
var msOrigFinish=finishExercise,msOrigEnding=showEnding;
finishExercise=function(){
  const s=state.session,ok=!!s&&!s.partial&&s.lesson?.kind!=='saved';
  try{msLogMisses(s);}catch(e){}
  const before=ok?msUnion(msRead()).size:0;
  const r=msOrigFinish.apply(this,arguments);
  if(ok)try{msAfterClear(before);}catch(e){}
  return r;
};
var msOrigShow=show;
show=function(n){if(n!=='game')try{msLogMisses(state.session);}catch(e){}return msOrigShow.apply(this,arguments);};   // 판 중간에 나가도 틀린 단어는 남긴다
showEnding=function(){if(msBusy){msPendingEnding=true;return;}return msOrigEnding.apply(this,arguments);};
function msInit(){try{msSync();msPreview();}catch(e){}}
