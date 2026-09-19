const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../../..');
function harness(filename=path.join(root,'vocagoyangksat2027.html'),seed={}){
 const html=fs.readFileSync(filename,'utf8'),els=new Map(),events={},timeouts=new Map(),intervals=new Map();
 const storage=new Map(Object.entries(seed)),spoken=[];let timer=0,clock=1000000,cancels=0;
 const fakeDate=class extends Date{constructor(...args){super(...(args.length?args:[clock]));}static now(){return clock;}};
 let doc;
 function element(id='',className=''){
  const e={id,className,tagName:'DIV',value:'',textContent:'',innerHTML:'',hidden:false,disabled:false,children:[],events:{},dataset:{},attributes:{},isConnected:true,
   style:{setProperty(k,v){this[k]=v;},getPropertyValue(k){return this[k]||'';},removeProperty(k){delete this[k];}},
   addEventListener(n,f){(this.events[n]??=[]).push(f);},removeEventListener(n,f){this.events[n]=(this.events[n]||[]).filter(v=>v!==f);},
   appendChild(c){this.children.push(c);c.parentNode=this;return c;},append(...children){children.forEach(c=>this.appendChild(c));},
   removeChild(c){this.children=this.children.filter(x=>x!==c);c.parentNode=null;},remove(){this.parentNode?.removeChild(this);this.isConnected=false;},
   setAttribute(k,v){this.attributes[k]=String(v);},getAttribute(k){return this.attributes[k]??null;},removeAttribute(k){delete this.attributes[k];},
   focus(){if(!this.disabled){doc.activeElement=this;this.events.focus?.forEach(f=>f({target:this}));}},blur(){if(doc.activeElement===this)doc.activeElement=null;},
   click(){fire(this,'click',{target:this,preventDefault(){},stopPropagation(){}});this.onclick?.({target:this,preventDefault(){},stopPropagation(){}});},
   getBoundingClientRect(){return {x:50,y:50,left:50,top:50,width:600,height:260,bottom:310,right:650};},scrollIntoView(){},offsetWidth:600,offsetHeight:260,
   querySelector(q){return query(q,this);},querySelectorAll(){return [];},closest(q){return q.split(',').map(x=>x.trim()).some(x=>x==='#'+this.id||x.toUpperCase()===this.tagName||x.startsWith('.')&&this.classList.contains(x.slice(1)))?this:null;},
   insertAdjacentHTML(where,text){this.innerHTML+=text;}}
  e.classList={contains:c=>e.className.split(/\s+/).includes(c),add:(...c)=>{e.className=[...new Set([...e.className.split(/\s+/),...c])].filter(Boolean).join(' ');},remove:(...c)=>{e.className=e.className.split(/\s+/).filter(x=>!c.includes(x)).join(' ');},toggle(c,force){const yes=force??!this.contains(c);yes?this.add(c):this.remove(c);return yes;}};
  return e;
 }
 for(const m of html.slice(0,html.indexOf('<script>')).matchAll(/<([\w-]+)\b[^>]*\bid="([^"]+)"[^>]*>/g)){
  const e=element(m[2],m[0].match(/\bclass="([^"]*)"/)?.[1]||'');e.tagName=m[1].toUpperCase();e.hidden=/\bhidden(?:[\s>])/.test(m[0]);els.set(m[2],e);
 }
 const body=element('',''),maproute=element('','maproute'),blank=element('','blanks');
 function query(q,within){
  if(q==='.maproute')return maproute;
  if(q==='#hoeCtx .blanks'||q==='.blanks')return els.get('hoeCtx')?.innerHTML.includes('blanks')?blank:null;
  if(q==='#hoeCtx .fill'||q==='.fill')return null;
  if(/^#[\w-]+$/.test(q))return els.get(q.slice(1))??null;
  if(q==='.rv-w')return null;
  if(q==='body')return body;
  throw Error('Harness needs selector: '+q);
 }
 doc={activeElement:null,hidden:false,body,documentElement:element('html'),hasFocus:()=>true,querySelector:query,
  getElementById:id=>els.get(id)||null,querySelectorAll:()=>[],createElement:tag=>{const e=element();e.tagName=tag.toUpperCase();return e;},
  addEventListener:(n,f)=>(events['doc:'+n]??=[]).push(f),removeEventListener:(n,f)=>{events['doc:'+n]=(events['doc:'+n]||[]).filter(v=>v!==f);}};
 const voice={name:'Google US English',lang:'en-US',localService:true};
 const window={document:doc,innerWidth:1200,innerHeight:900,devicePixelRatio:1,location:{hash:''},matchMedia:()=>({matches:true,addEventListener(){}}),
  addEventListener:(n,f)=>(events['win:'+n]??=[]).push(f),removeEventListener(){},scrollTo(){},
  speechSynthesis:{getVoices:()=>[voice],cancel:()=>cancels++,speak:u=>spoken.push(u)},SpeechSynthesisUtterance:function(text){this.text=text;}};
 const sandbox={console,document:doc,window,navigator:{},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},
  location:window.location,SpeechSynthesisUtterance:window.SpeechSynthesisUtterance,speechSynthesis:window.speechSynthesis,Date:fakeDate,performance:{now:()=>clock},
  setTimeout:(f,ms=0)=>{const id=++timer;timeouts.set(id,{f,ms,at:clock+ms});return id;},clearTimeout:id=>timeouts.delete(id),
  setInterval:(f,ms)=>{const id=++timer;intervals.set(id,{f,ms});return id;},clearInterval:id=>intervals.delete(id),
  requestAnimationFrame:f=>{f();return 0;},cancelAnimationFrame(){},getComputedStyle:()=>({getPropertyValue:()=>''}),confirm:()=>{throw Error('Unexpected destructive confirmation');}};
 const ctx=vm.createContext(sandbox);
 for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(m[1],ctx,{timeout:10000});
 // Effect visuals are inspected in the real browser; these tests isolate input/learning state.
 ctx.fx=()=>{};ctx.beep=()=>{};
 function fire(el,name,event={}){if(typeof el==='string')el=els.get(el);if(!el)throw Error('Missing event target');event.target??=el;event.preventDefault??=()=>{};event.stopPropagation??=()=>{};el.events[name]?.forEach(f=>f(event));if(name==='input')el.oninput?.(event);}
 function advance(ms){const target=clock+ms;let guard=0;while(true){const next=[...timeouts].filter(([id,t])=>t.at<=target).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;if(++guard>10000)throw Error('Timer loop');clock=next[1].at;timeouts.delete(next[0]);next[1].f();}clock=target;}
 return {html,ctx,els,doc,storage,spoken,events,timeouts,intervals,blank,fire,advance,get cancels(){return cancels;},run:s=>vm.runInContext(s,ctx),get state(){return vm.runInContext('state',ctx);},type(v){els.get('ainput').value=v;fire('ainput','input');},start(li=0,ei=0){ctx.openLesson(li);ctx.startExercise(ei);}};
}
module.exports={harness,root};
if(require.main===module){const h=harness(process.argv[2]);console.log({lessons:h.state.lessons.length,home:h.els.get('homeMeta').textContent,ids:h.els.size,storageKeys:[...h.storage.keys()]});}
