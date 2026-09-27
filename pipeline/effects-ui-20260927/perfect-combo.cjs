const assert=require('assert/strict');
module.exports=function applyPerfectCombo(html){
  const replace=(old,next)=>{assert.equal(html.split(old).length,2,'Perfect combo anchor: '+old.slice(0,70));html=html.replace(old,()=>next);};
  replace('function startExercise(i,only){',`/* Consecutive perfect exercises live only for the current open page. */
function abandonPerfectRun(){
  const s=state.session;
  if(s&&!s.partial&&!s.perfectRunSettled)state.perfectStreak=0;
}
function completePerfectRun(s,first){
  if(s.perfectRunSettled)return s.perfectRunCount;
  s.perfectRunSettled=true;
  if(s.partial){s.perfectRunCount=0;return 0;}
  const perfect=s.errors===0&&first===100&&s.words.length>0;
  state.perfectStreak=perfect?(state.perfectStreak||0)+1:0;
  s.perfectRunCount=state.perfectStreak;
  return s.perfectRunCount;
}
function startExercise(i,only){
  abandonPerfectRun();`);
  replace('if(allCleared&&!s.partial)setTimeout(showEnding,750);',
    'const perfectRun=completePerfectRun(s,first);\n  if(allCleared&&!s.partial)setTimeout(showEnding,750);');
  replace('else if(!s.partial&&s.errors===0&&first===100&&s.words.length>0)showRoar();',
    'else if(perfectRun>0)showRoar(perfectRun);');
  replace('$("#exitBtn").addEventListener("click",()=>{',
    '$("#exitBtn").addEventListener("click",()=>{abandonPerfectRun();');
  const start=html.indexOf('function showRoar(){'),end=html.indexOf('function showEnding(){',start);
  assert(start>=0&&end>start);
  html=html.slice(0,start)+`var roarTimer=0;
function showRoar(count=1){
  const ov=$("#roar");if(!ov)return;
  clearTimeout(roarTimer);
  const streak=Math.max(1,Math.floor(count));
  const colors=['255,211,77','255,126,196','118,214,255','195,153,255','130,232,184'];
  const color=colors[(streak-1)%colors.length];
  const chant='냐'+'아'.repeat(streak+2)+'옹—!!';
  ov.style.setProperty('--roar-rgb',color);
  ov.style.setProperty('--roar-halo',streak===1?'var(--pink)':'rgb('+color+')');
  ov.style.setProperty('--roar-letters',chant.length);
  ov.querySelector('.roar-txt b').textContent=streak===1?'PERFECT':'PERFECT ×'+streak;
  ov.querySelector('.roar-txt span').textContent=chant;
  setCat('roarCat','win');ov.classList.add('show');ov.setAttribute('aria-hidden','false');
  document.body.classList.add('roaring');fanfare();
  if(navigator.vibrate)try{navigator.vibrate([40,60,120]);}catch(e){}
  const close=()=>{
    clearTimeout(roarTimer);roarTimer=0;ov.classList.remove('show');
    ov.setAttribute('aria-hidden','true');document.body.classList.remove('roaring');ov.onclick=null;
  };
  ov.onclick=close;roarTimer=setTimeout(close,2200);
}
`+html.slice(end);
  html=html.replace('</style>',`/* A new color and one extra 아 for each consecutive perfect exercise. */
.roar{background:radial-gradient(circle at 50% 45%,rgba(var(--roar-rgb,255,211,77),.35),rgba(22,8,38,.92) 70%);}
.roar .rays{background:repeating-conic-gradient(from 0deg,rgba(var(--roar-rgb,255,211,77),.28) 0deg 9deg,transparent 9deg 22deg);}
.roar-cat img{filter:drop-shadow(0 0 14px #fff) drop-shadow(0 0 34px rgb(var(--roar-rgb,255,211,77))) drop-shadow(0 0 60px var(--roar-halo,var(--pink)));}
.roar-inner{width:min(94vw,600px);max-height:94dvh;overflow-y:auto;padding:12px 0;scrollbar-width:none;}
.roar-cat{flex-shrink:0;}
.roar-txt{max-width:100%;}
.roar-txt b{color:rgb(var(--roar-rgb,255,211,77));font-size:clamp(1.8rem,10vw,3.4rem);text-shadow:0 0 14px #fff,0 0 30px rgb(var(--roar-rgb,255,211,77)),3px 3px 0 #4a0a72;}
.roar-txt span{max-width:88vw;overflow-wrap:anywhere;font-size:clamp(1rem,calc(82vw / var(--roar-letters,7)),1.6rem);line-height:1.35;text-shadow:0 0 10px var(--roar-halo,var(--pink));}
</style>`);
  return html;
};
