'use strict';
// 진행 속도 예측(pipeline/pace/runtime.js, 26.10.13 영신): 시간 재기·일의 양·예측 범위·하루 기준·대사 고르기를 본다.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const src=fs.readFileSync(path.join(root,'pipeline/pace/runtime.js'),'utf8');
const DAY=864e5,NOW=new Date(2026,9,13,21,0,0).getTime();
function load(course='fable',opt={}){
 let clock=opt.now||NOW;const store=new Map(),done=new Set(opt.done||[]),els={};
 const el=id=>els[id]??={id,textContent:'',innerHTML:'',hidden:false,parentNode:{insertBefore(){}}};
 const lessons=opt.lessons||[25,26,45,46].map(n=>({id:n+'세트',lesson:n,name:`${n*100+1}~${n*100+100}`,exercises:[{title:'E1',words:[{word:'abc',ex:'a b c {{BLANK}}',tr:'가나다',c:''}]}]}));
 const ctx={PACE_COURSE:course,console,Math,JSON,Number,String,Array,Object,
  Date:class extends Date{constructor(...a){super(...(a.length?a:[clock]));}static now(){return clock;}},
  localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v))},
  state:{session:null,lessons,levelB1:!!opt.b1},visEx:L=>L.exercises,getRec:(lid,t)=>done.has(lid+'|'+t)?{completed:true}:null,
  inScope:course==='fable'?(L=>!opt.b1||L.lesson<=25):undefined,esc:s=>String(s),$:q=>el(q.slice(1)),
  document:{addEventListener(){},createElement:()=>el('paceNote')},startExercise(){},finishExercise(){}};
 if(course!=='fable')delete ctx.inScope;
 vm.createContext(ctx);vm.runInContext(src,ctx);
 ctx.tick=ms=>{clock+=ms;};ctx.store=store;ctx.els=els;return ctx;
}
const plays=(n,o={})=>Array.from({length:n},(_,i)=>({at:NOW-(o.days?o.days(i,n):Math.floor((n-1-i)/(o.perDay||4)))*DAY-(n-i)*60000,ms:Math.round((o.ms||420000)*(o.rate?o.rate(i,n):1)),u:o.u||120,k:o.k||'n'}));

// 1. 일의 양: 긴 단어·긴 예문일수록 무겁다. 마더텅 카드(예문이 context에 있다)도 잰다.
{const c=load();
 assert(c.paceUnit({word:'reconciliation',ex:'They hoped for a quick {{BLANK}} after the long war.'})>c.paceUnit({word:'cat',ex:'A {{BLANK}} sat.'}));
 assert(c.paceUnit({term:'deliberate',context:{example:'It was a deliberate choice made by them.',translation:'일부러 한 선택이었다.'}})>c.paceUnit({term:'deliberate'}));}

// 2. 연습 10판 전에는 예측하지 않는다(그전엔 갈구기만, 영신). 틀린 것만 다시 푼 판은 세지 않는다.
{const c=load(),t={u:12000,ex:100};
 assert.equal(c.paceForecast(plays(9),t,NOW),null);
 assert.equal(c.paceForecast([...plays(9),...plays(3,{k:'w'})],t,NOW),null);
 assert(c.paceForecast(plays(10),t,NOW));}

// 3. 같은 속도면 긍정값과 보수값이 같고 '속도 × 남은 양'이다. 기록이 사흘에 못 미치면 하루 1시간으로 센다.
{const c=load(),t={u:12000,ex:100},f=c.paceForecast(plays(12,{perDay:12}),t,NOW);
 const expect=420000/120*12000/60000;
 assert(Math.abs(f.optMin-expect)/expect<0.01&&Math.abs(f.consMin-expect)/expect<0.01,JSON.stringify(f));
 assert.equal(f.mode,'hour');assert.deepEqual([...f.days],[Math.ceil(expect/60),Math.ceil(expect/60)]);}

// 4. 하루 기준: 최근 14일 하루 평균 30분 이상이면 그 시간으로, 30분 미만이면 1시간으로(갈굼은 대사가 맡는다).
{const c=load(),t={u:12000,ex:100};
 const busy=c.paceForecast(plays(30,{perDay:6}),t,NOW);assert.equal(busy.mode,'daily');assert(busy.daily>=30);
 assert.equal(busy.days[1],Math.ceil(busy.consMin/busy.daily));
 const lazy=c.paceForecast(plays(20,{perDay:1}),t,NOW);assert.equal(lazy.mode,'low');assert.equal(lazy.perDay,60);assert(lazy.daily<30);}

// 5. 빨라지는 학생: 긍정값이 보수값보다 짧고, 지금 속도의 70%보다 빨라지지는 않는다.
{const c=load(),t={u:12000,ex:100},recs=plays(20,{perDay:5,rate:i=>Math.pow(1+i,-0.25)}),f=c.paceForecast(recs,t,NOW);
 assert(f.b<0&&f.optMin<f.consMin,JSON.stringify(f));assert(f.optMin>=0.7*f.rNow*t.u/60000-1e-6);assert(f.trend<0);}

// 6. 시간 재기: 손이 움직인 사이만 더하고, 한 번에 60초까지만 센다.
{const c=load();c.state.session={};c.paceLast=0;c.paceActive=0;
 c.paceTick();c.tick(5000);c.paceTick();c.tick(10*60000);c.paceTick();
 assert.equal(c.paceActive,65000);}

// 7. 목표: 25세트(3000급) → 45세트 → 전부. B1 범위는 25세트까지만. 앞 목표를 돌파하면 다음 목표와 돌파한 목표를 함께 준다.
{let c=load();let t=c.paceTargets();assert.equal(t.label,'2,600단어');assert.equal(t.next,'4,600단어');
 c=load('fable',{done:['25세트|E1']});t=c.paceTargets();assert.equal(t.label,'4,600단어');assert.equal(t.passed,'2,600단어');
 c=load('fable',{b1:true});t=c.paceTargets();assert.equal(t.label,'2,600단어');assert.equal(t.next,null);
 c=load('fable',{b1:true,done:['25세트|E1']});assert.equal(c.paceTargets(),null);
 c=load('ksat',{lessons:[{id:'01강',lesson:1,name:'글의 목적',exercises:[{title:'E1',words:[{term:'goal'}]}]}]});assert.equal(c.paceTargets().label,'마더텅 완주');}

// 8. 무엇을 말할지: 처음(10판째) > 오랜만(3일+) > 하루가 짧음(하루 한 번) > 앞 목표 돌파 > 느려짐 > 빨라짐 > 다섯 판마다. 나머지는 원래 대사.
{const c=load(),T={label:'2,600단어',next:'4,600단어',passed:null},t={u:12000,ex:100};
 const kind=(recs,meta,tt=T)=>c.paceKind(recs,c.paceForecast(recs,t,NOW),tt,meta,NOW);
 assert.equal(kind(plays(10),{}),'intro');
 const gap=plays(20,{perDay:6,days:(i,n)=>i===n-1?0:4+Math.floor((n-1-i)/6)});assert.equal(kind(gap,{intro:true,n:19}),'absent');
 const lazy=plays(20,{perDay:1});assert.equal(kind(lazy,{intro:true,n:19}),'low');assert.equal(kind(lazy,{intro:true,n:19,lowDay:c.paceDay(NOW)}),null);
 const busy=plays(30,{perDay:6});
 assert.equal(kind(busy,{intro:true,n:29,target:'2,600단어'},{...T,label:'4,600단어',passed:'2,600단어'}),'next');
 assert.equal(kind(plays(30,{perDay:6,rate:(i,n)=>i>=n-5?1.5:1}),{intro:true,n:29}),'slow');
 assert.equal(kind(plays(30,{perDay:6,rate:(i,n)=>i>=n-5?0.7:1}),{intro:true,n:26}),'fast');
 assert.equal(kind(busy,{intro:true,n:25,later:true}),'regular');assert.equal(kind(busy,{intro:true,n:25}),'later');
 assert.equal(kind(busy,{intro:true,n:27}),null);}

// 9. 대사: 모든 틀이 빈칸 없이 채워진다.
{const c=load();const all=[];const walk=o=>Array.isArray(o)?all.push(...o):Object.values(o).forEach(walk);walk(c.PACE_LINES);
 for(const tpl of all){const s=c.paceFill(tpl,{T:'2,600단어',N:'4,600단어',P:'2,600단어',R:'40~55일',RB:'55일',m:20,p:25,g:4});assert(!/[{}]/.test(s),s);assert(/고양/.test(s),s);}}

// 10. 끝낸 판을 기록하고(날짜·시각·걸린 시간·일의 양·종류), 10판째에 결과 화면 말풍선과 한 줄을 채운다.
{const c=load();c.store.set(c.paceKey,JSON.stringify(plays(9)));
 c.els.sumTitle={textContent:'연습 클리어 ✦'};
 c.paceShow({e:{words:[{word:'abc',ex:'a b c'}]},partial:false,was:false,words:[]},360000);
 const recs=JSON.parse(c.store.get(c.paceKey));assert.equal(recs.length,10);assert.equal(recs[9].at,NOW);assert.equal(recs[9].k,'n');assert.equal(recs[9].ms,360000);
 assert(/속도 쟀다고양/.test(c.els.sumBubble.innerHTML),c.els.sumBubble.innerHTML);assert(/2,600단어까지/.test(c.els.paceNote.textContent));assert.equal(c.els.paceNote.hidden,false);
 // 5초 안 되는 판은 적지 않는다. 틀린 것만 다시 푼 판은 적되 예측 대사는 하지 않는다.
 c.paceShow({e:{words:[]},partial:false,was:true,words:[]},3000);assert.equal(JSON.parse(c.store.get(c.paceKey)).length,10);
 c.paceShow({e:{words:[]},partial:true,was:true,words:[{word:'abc'}]},60000);const r2=JSON.parse(c.store.get(c.paceKey));assert.equal(r2.at(-1).k,'w');assert.equal(c.els.paceNote.hidden,true);}

// 11. 보관 상한(600판)을 넘어도 다섯 판마다 대사가 이어진다(26.10.15 아스트라 리뷰 T05: 배열 길이로 세어 600에서 멈췄다).
{const c=load();c.store.set(c.paceKey,JSON.stringify(plays(600,{perDay:6})));c.store.set(c.paceMetaKey,JSON.stringify({intro:true,n:600,target:'2,600단어'}));
 c.els.sumTitle={textContent:'연습 클리어 ✦'};let said=0;
 const bub=c.$('#sumBubble');
 for(let i=0;i<12;i++){c.tick(60000);bub.innerHTML='';c.paceShow({e:{words:[{word:'abc',ex:'a b c'}]},partial:false,was:false,words:[]},360000);if(bub.innerHTML)said++;}
 assert.equal(JSON.parse(c.store.get(c.paceKey)).length,600,'History stays capped');assert.equal(JSON.parse(c.store.get(c.paceMetaKey)).total,612);
 assert(said>=2,'Regular lines continue every five plays past the cap: '+said);}

console.log('PASS pace: 일의 양, 10판 문턱, 범위(긍정·보수), 하루 기준(평균·30분 미만·사흘 미만), 학습 곡선 하한, 60초 상한, 목표 단계, 대사 고르기·채우기, 기록, 600판 넘어서도 주기 유지');
