const assert=require('assert/strict');
const fs=require('fs'),path=require('path');
module.exports=function applyRoseEffects(html){
  const replace=(old,next)=>{assert.equal(html.split(old).length,2,'Effect anchor: '+old.slice(0,80));html=html.replace(old,next);};
  replace('heartA:1, heartT:1, flowerA:1, flowerT:.72, petal:1.35, heartS:.94,',
    'heartA:1, heartT:.92, flowerA:1, flowerT:.72, petal:1.35, heartS:1.13,');
  const rose=fs.readFileSync(path.join(__dirname,'review-rose.svg'),'utf8');
  const start=html.indexOf('function fxHeart(el){'),end=html.indexOf('/* ===== misc ===== */',start);
  assert(start>=0&&end>start);
  html=html.slice(0,start)+`const REVIEW_ROSE_SVG=${JSON.stringify(rose)};
let reviewRoseTap=0;
function fxHeart(el){
  const layer=$("#fxLayer");if(!layer)return;
  const [x,y]=fxOrigin(el);++fxGen;applyFX(layer);
  // Cycle by tap, independent of exercise size. Each burst owns its cleanup.
  const style=reviewRoseTap++%4;
  const flowers=document.createElement("div");flowers.className="review-roses";
  flowers.dataset.style=String(style+1);
  layer.appendChild(flowers);
  const spray=document.createElement("div");spray.className="review-spray";flowers.appendChild(spray);
  if(style===0)burstV1(spray,x,y,{petals:18,dots:14,loose:10,flash:false,dist:1.6});
  else if(style===1){
    burstV2(spray,x,y,{petals:18,dots:14,trails:7,flash:false,dist:1.45});
    for(const p of spray.querySelectorAll('.v2-p,.v2-d'))p.style.setProperty('--grav','40px');
  }
  else if(style===2)burstV4(spray,x,y,{petals:18,dots:14,tw:8,flash:false,dist:1.75});
  else burstV3(spray,x,y,{petals:16,dots:10,pollen:18,rays:7,waves:0,flash:false,dist:1.5});
  calmFX(spray);
  const core=document.createElement("div");core.className="review-rose-core";
  core.style.setProperty("--x",x+"px");core.style.setProperty("--y",y+"px");
  core.innerHTML=REVIEW_ROSE_SVG;
  flowers.appendChild(core);
  setTimeout(()=>flowers.remove(),1300);
}\n\n`+html.slice(end);
  replace('결과 화면에서 틀린 단어를 지울 때(fxHeart)는 합본 하트로 고정.',
    '결과 화면에서 틀린 단어를 지울 때(fxHeart)는 빨간 장미와 네 가지 꽃비를 순환.');
  html=html.replace('</style>',`/* Review taps: one side-facing rose and four existing sprays. */
.review-roses,.review-spray{position:absolute;inset:0;pointer-events:none;}
.review-spray{opacity:.76;}
.review-roses .v1-fl{filter:drop-shadow(0 0 4px #ffa3c66b);}
.review-roses .v3-fan{width:360px;height:360px;}
.review-roses .v3-ray{max-width:172px;}
.review-rose-core{position:absolute;left:var(--x);top:var(--y);width:104px;height:176px;
  pointer-events:none;filter:drop-shadow(0 0 7px #ff779057);
  animation:reviewRoseBloom .82s cubic-bezier(.16,.8,.3,1) both;}
.review-rose-core svg{display:block;width:100%;height:100%;}
@keyframes reviewRoseBloom{
  0%{opacity:0;transform:translate(-50%,-45%) scale(.38) rotate(-7deg);}
  20%{opacity:.95;transform:translate(-50%,-50%) scale(1) rotate(-2deg);}
  60%{opacity:.86;transform:translate(-50%,-53%) scale(1.04) rotate(2deg);}
  100%{opacity:0;transform:translate(-50%,-58%) scale(1.08) rotate(5deg);}}
@media (prefers-reduced-motion:reduce){
  .review-spray{display:none;}
  .review-rose-core{animation:reviewRoseFade .2s ease-out both;}}
@keyframes reviewRoseFade{from{opacity:.75;transform:translate(-50%,-50%);}to{opacity:0;transform:translate(-50%,-50%);}}
</style>`);
  return html;
};
