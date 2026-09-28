const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.resolve(__dirname,'../runtime.js'),'utf8');
function fixture(widths,spans){
  let slots=[];const layers=[];
  function element(){
    const e={style:{},children:[],className:'',setAttribute(){},appendChild(x){this.children.push(x);},remove(){this.removed=true;}};
    e.classList={contains:x=>e.className.split(' ').includes(x),add(...xs){e.className=[...new Set([...e.className.split(' '),...xs])].join(' ');},remove(...xs){e.className=e.className.split(' ').filter(x=>!xs.includes(x)).join(' ');}};
    return e;
  }
  const ctx=vm.createContext({performance:{now:()=>0},window:{innerWidth:390,addEventListener(){}},document:{addEventListener(){},querySelector:()=>null,querySelectorAll:()=>slots,createElement:element,body:{appendChild:e=>layers.push(e)}},getComputedStyle:e=>({fontSize:e.style.fontSize||'25.5px'}),setTimeout,clearTimeout});
  vm.runInContext(source,ctx);
  let start=0;
  const parts=spans.map((span,i)=>{const p={start,end:start+span,ipa:'a',stress:i===0,secondary:i===2,beat:i,weight:1};start+=span;return p;});
  slots=Array.from({length:start},(_,i)=>Object.assign(element(),{getBoundingClientRect:()=>({left:40+i*24,right:64+i*24,top:100,bottom:130,height:30})}));
  const run=ctx.ipaEffectRequest({term:'a'.repeat(start),ipa:'ˌsuːpərˈhjuːmən'},()=>true);
  run.map={mode:'aligned',parts};run.layer=element();run.nodes=parts.map((part,i)=>({part,slots:slots.slice(part.start,part.end),el:element(),text:{offsetWidth:widths[i]}}));
  return {ctx,run,slots,layers};
}
function verifyPacked(run,left,right){
  let previous=left-3;
  const scales=run.nodes.map(n=>parseFloat(n.el.style.fontSize));
  assert(scales.every(n=>Math.abs(n-scales[0])<.0001),'One shared size must preserve relative stress sizing');
  for(const n of run.nodes){const x=parseFloat(n.el.style.left),w=parseFloat(n.el.style.width);assert(x>=previous+3-.01,'Segments must not overlap');assert(x+w<=right+.01,'Segments must stay inside the answer');previous=x+w;}
}
// A long stressed transcription over two spelling cells can borrow free space
// from its neighbour, rather than shrinking to the old ~18 px giant rendering.
{
  const {ctx,run}=fixture([69,40],[2,3]);ctx.ipaEffectPosition(run);
  assert.equal(run.nodes.length,2);assert.equal(parseFloat(run.nodes[0].el.style.fontSize),25.5);
  verifyPacked(run,40,160);
  const positions=run.nodes.map(n=>n.el.style.left);ctx.ipaEffectPosition(run);
  assert.deepEqual(run.nodes.map(n=>n.el.style.left),positions,'Repeated layout must not drift');
}
// Primary and secondary stress receive exactly the same shared scaling even
// when one is much denser. Widths include their CSS stress enlargement.
{
  const {ctx,run}=fixture([53,42,69,56],[2,3,2,3]);ctx.ipaEffectPosition(run);
  verifyPacked(run,40,280);assert(parseFloat(run.nodes[0].el.style.fontSize)<25.5);
}
// Crowded layout falls back once; speech/advance timers survive and stale
// spelling classes are cleared before highlighting the complete answer.
{
  const {ctx,run,slots,layers}=fixture([100,100],[2,2]);
  run.nodes[0].el.classList.add('lit');slots[0].classList.add('ipa-under');run.touched=[slots[0]];
  const timers=run.visualTimers=[123];const old=run.layer;
  ctx.ipaEffectPosition(run);
  assert.equal(run.nodes.length,1);assert(run.nodes[0].whole);assert(old.removed);
  assert.equal(run.visualTimers,timers);assert(run.nodes[0].el.classList.contains('lit'));
  assert(slots.every(s=>s.classList.contains('ipa-under')));assert.equal(layers.length,1);
  ctx.ipaEffectPosition(run);assert.equal(layers.length,1,'Whole fallback must not rebuild recursively');
}
// A resize that clips the answer's right edge uses the same safe fallback.
{
  const {ctx,run}=fixture([69,40],[2,3]);ctx.ipaEffectPosition(run);
  ctx.window.innerWidth=120;ctx.ipaEffectPosition(run);assert(run.nodes[0].whole);
}
console.log('PASS IPA layout: dense stress, shared scaling, stable packing, crowding/resize fallback and timer preservation.');
