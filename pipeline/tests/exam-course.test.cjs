'use strict';
// 시험 단어장(pipeline/exam, 26.11.14): "FABLE에 있는 뜻 빼기" 단추(기본 켬), 진도 키 안정, 이어하기·개수가 보이는 연습(visEx)을 따름,
// FABLE 저장 키 글자 없음, 엔진 복제 검사(sync --check), 조립기가 잘못된 원본을 거부하고 남의 HTML에 쓰지 않음.
// 실제 원본이 들어와도 그대로 돌도록, 화면 검사는 HTML의 DATA를 읽고 조립기 검사는 임시 폴더의 fixture 사본으로 한다.
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const {harness,root}=require('./helpers/mother-tongue-harness.cjs');
const {EXAMS}=require('./helpers/courses.cjs');
const exam=require('../exam/courses.cjs');
const FIXTURE=path.join(root,'pipeline/exam/tests/fixture');
assert(EXAMS.includes('vocagoyangtoeic.html'),'토익 HTML이 시험 목록에 있다');
const plain=v=>JSON.parse(JSON.stringify(v));
const reports=[];

for(const file of EXAMS){
  const html=fs.readFileSync(path.join(root,file),'utf8'),id=file.replace(/^vocagoyang|\.html$/g,'');
  // 1) 저장 키: 이 시험 키만 있고 FABLE 키 글자는 없다.
  for(const bad of exam.FOREIGN_KEYS)assert(!html.includes(bad),`${file}: '${bad}' 글자가 남았다`);
  const keys=exam.keysOf(id);
  for(const [name,value] of Object.entries(keys))assert(html.includes(`const ${name}=${JSON.stringify(value)};`),`${file}: ${name}=${value}`);
  for(const gone of ['levelBtn','prevBtn','SET_STAMP_START','UNLOCKKEY','LEVELKEY','READING_CORE','MORPHOLOGY','CONNECTIONS'])assert(!html.includes(gone),file+': FABLE 전용 '+gone+'가 남았다');

  // 2) 단추 기본 켬: scope fable 연습은 숨고, 끄면 보인다. 제목·진도 키는 단추와 상관없다.
  let h=harness(path.join(root,file));
  assert.equal(h.run('state.fableOff'),true,'기본 켬');
  assert.equal(h.els.get('fableBtn').getAttribute('aria-pressed'),'true');assert.match(h.els.get('fableBtn').innerHTML,/빼는 중/);
  const all=h.state.lessons.flatMap(L=>L.exercises.map(e=>({L,e})));
  const fableEx=all.filter(x=>x.e.scope==='fable'),mainEx=all.filter(x=>x.e.scope!=='fable');
  assert(mainEx.length,file+': 원본에 새 뜻 연습이 있다');
  if(!fableEx.length){
    // FABLE 같은 뜻이 없는 책(GRE): 단추를 숨기고, 모든 연습이 보인다. 아래 2~4(단추·숨은 연습)는 해당 없다.
    assert.equal(h.els.get('fableBtn').style.display,'none','FABLE 같은 뜻 연습이 없으면 단추를 숨긴다');
    assert.equal(h.ctx.totalExercises(),all.length,'모든 연습이 보인다');
  }
  if(fableEx.length){
  assert(fableEx.every(x=>/^FABLE 뜻 \d+(-\d+)? · /.test(x.e.title)),'FABLE 뜻 연습 제목: '+fableEx.map(x=>x.e.title));
  assert(mainEx.every(x=>/^Exercise \d+(-\d+)? · /.test(x.e.title)),'새 뜻 연습 제목');
  assert(fableEx.every(x=>x.e.words.every(w=>w.term&&w.si)));
  const visible=()=>h.state.lessons.flatMap(L=>h.ctx.visEx(L).map(e=>L.id+' | '+e.title));
  const keyOf=x=>JSON.stringify(h.ctx.recordKey(x.L.id,x.e.title));
  const titlesOn=all.map(x=>x.e.title),recordOn=all.map(keyOf);
  assert.deepEqual(visible(),mainEx.map(x=>x.L.id+' | '+x.e.title),'켬: 새 뜻 연습만 보인다');
  const cards=xs=>xs.reduce((a,x)=>a+x.e.words.length,0);
  assert.equal(h.ctx.totalExercises(),mainEx.length,'켬: 연습 수는 보이는 것만');
  assert.equal(h.els.get('homeMeta').textContent,`${h.state.lessons.length}세트 · ${cards(mainEx).toLocaleString()}카드 · 클리어 0/${mainEx.length} 연습`);
  h.fire('fableBtn','click');
  assert.equal(h.run('state.fableOff'),false);assert.equal(h.storage.get(keys.MODEKEY),'0','끔을 MODEKEY에 적는다');
  assert.equal(h.els.get('fableBtn').getAttribute('aria-pressed'),'false');
  assert.deepEqual(visible(),all.map(x=>x.L.id+' | '+x.e.title),'끔: 전부 보인다');
  assert.equal(h.ctx.totalExercises(),all.length);
  assert.equal(h.els.get('homeMeta').textContent,`${h.state.lessons.length}세트 · ${cards(all).toLocaleString()}카드 · 클리어 0/${all.length} 연습`);
  assert.deepEqual(all.map(x=>x.e.title),titlesOn,'단추를 바꿔도 연습 제목이 같다');
  assert.deepEqual(all.map(keyOf),recordOn,'단추를 바꿔도 진도 키(progressId·제목)가 같다');
  h.fire('fableBtn','click');assert.equal(h.storage.get(keys.MODEKEY),'1');assert.equal(h.run('state.fableOff'),true);
  // 긴 연습은 게임이 둘로 나눈다(16장부터). 나눈 제목도 "FABLE 뜻 1-1"처럼 앞머리를 지킨다(partTitle 정규식).
  {
    const card=i=>({en:'w'+i,ko:'① 뜻',ex:'A {{BLANK}}.',tr:'',c:'',ipa:'wʌn',pos:'n.',word:'w'+i,si:1,sn:1});
    const split=h.ctx.splitExercises(h.ctx.buildLessons([{lesson:1,label:'1세트',name:'시험',exercises:[
      {ex:1,name:'새 뜻',words:Array.from({length:22},(_,i)=>card(i))},{ex:1,name:'사무',scope:'fable',words:Array.from({length:22},(_,i)=>card(100+i))}]}]))[0].exercises;
    assert.deepEqual(split.map(e=>e.title),['Exercise 1-1 · 새 뜻','Exercise 1-2 · 새 뜻','FABLE 뜻 1-1 · 사무','FABLE 뜻 1-2 · 사무']);
    assert.equal(new Set(split.map(e=>JSON.stringify([e.progressId,e.progressTitle||e.title]))).size,4,'나눈 연습마다 진도 키가 다르다');
  }
  // 저장한 '끔'으로 다시 열면 끔, 이상한 값이면 켬(기본).
  assert.equal(harness(path.join(root,file),{[keys.MODEKEY]:'0'}).run('state.fableOff'),false);
  assert.equal(harness(path.join(root,file),{[keys.MODEKEY]:'x'}).run('state.fableOff'),true);

  // 3) 진도: 끄고 FABLE 뜻 연습을 끝낸 기록은 켜도 지워지지 않고, 다시 끄면 그대로 완료다. 개수는 보이는 것만 센다.
  h=harness(path.join(root,file),{[keys.MODEKEY]:'0'});
  const f0=fableEx[0],m0=mainEx[0];
  h.ctx.setRec(f0.L.id,f0.e.title,{});h.ctx.setRec(m0.L.id,m0.e.title,{});
  assert.equal(h.ctx.clearedExercises(),2);
  const progress=JSON.parse(h.storage.get(keys.STORAGE));
  h.fire('fableBtn','click');
  assert.equal(h.ctx.clearedExercises(),1,'켬: 숨은 연습의 완료는 세지 않는다');assert.equal(h.ctx.totalExercises(),mainEx.length);
  assert.deepEqual(JSON.parse(h.storage.get(keys.STORAGE)),progress,'단추는 진도를 바꾸지 않는다');
  h.fire('fableBtn','click');assert.equal(h.ctx.getRec(f0.L.id,f0.e.title)?.completed,true,'다시 끄면 FABLE 뜻 연습 완료 그대로');

  // 4) 이어하기: 켬이면 숨은 FABLE 뜻 연습으로 가지 않는다. 끄면 마지막 연습 다음의 안 끝낸 연습으로 간다.
  const seed={[keys.LASTKEY]:JSON.stringify({lid:f0.L.id,title:f0.e.title,layout:'placement-v1',prune:'20261013'}),[keys.STORAGE]:JSON.stringify({[m0.L.id]:{[m0.e.title]:{completed:true}}})};
  h=harness(path.join(root,file),seed);
  let rt=h.ctx.resumeTarget();assert(rt&&rt.e.scope!=='fable','켬: 이어하기가 보이는 연습으로 간다');
  assert(!h.els.get('resumeBtn').hidden);assert(!/FABLE 뜻/.test(h.els.get('resumeSub').textContent),h.els.get('resumeSub').textContent);
  h=harness(path.join(root,file),{...seed,[keys.MODEKEY]:'0'});
  rt=h.ctx.resumeTarget();assert.equal(rt.e.title,f0.e.title,'끔: 마지막에 하던 FABLE 뜻 연습으로 이어 간다');
  assert.equal(h.els.get('resumeSub').textContent,`${f0.L.id} · ${f0.e.title.split(' · ')[0]}`);
  // 판을 시작하면 이 시험의 마지막 연습 키에 적는다.
  h=harness(path.join(root,file));h.start();
  assert.equal(JSON.parse(h.storage.get(keys.LASTKEY)).title,h.state.session.exercise.title);
  // 다음 세트: 켬이면 마지막 보이는 연습 다음은 다음 세트 첫 새 뜻 연습이다.
  if(h.state.lessons.length>1){
    const L=h.state.lessons[0],ev=h.ctx.visEx(L);h.ctx.openLesson(0);h.ctx.openExercise(ev.length-1);
    assert.equal(h.ctx.nextLessonIndex(0),1);
  }

  }

  // 5) 저장: 한 판을 끝까지 풀어도 이 시험 키와 같이 쓰는 키만 쓴다(FABLE·마더텅 키를 건드리지 않는다).
  h=harness(path.join(root,file));h.start();
  const s=h.state.session;let guard=0;
  while(h.els.get('gameScreen').classList.contains('active')&&guard++<200){const w=s.words[s.currentId];h.type(w.term);if(!s.answered)h.ctx.submit();h.ctx.nextCard();}
  assert(h.els.get('sumScreen').classList.contains('active'),'한 판이 끝난다');
  const shared=new Set(['goyang-learned-words-v1','goyang-missed-words-v1','goyang-milestone-v1']);
  for(const k of h.storage.keys())assert(k.startsWith(`goyang-${id}-`)||k.startsWith(`goyang-pace-${id}-`)||k.startsWith(`goyang-pace-meta-${id}-`)||shared.has(k),file+': 남의 키 '+k);
  assert(h.storage.has(keys.STORAGE)&&h.storage.has(keys.LASTKEY));
  assert(JSON.parse(h.storage.get('goyang-learned-words-v1'))[id],'익힌 단어는 이 시험 칸에');

  // 6) 완주: 보이는 연습을 다 끝내면 짧은 완주 화면. 숨은 FABLE 뜻 연습은 남아도 된다.
  h=harness(path.join(root,file));
  const vis=h.state.lessons.flatMap(L=>h.ctx.visEx(L).map(e=>[L.id,e.title]));
  vis.slice(0,-1).forEach(([lid,t])=>h.ctx.setRec(lid,t,{}));
  const lastL=h.state.lessons.findIndex(L=>L.id===vis.at(-1)[0]);
  h.ctx.openLesson(lastL);h.ctx.openExercise(h.ctx.visEx(h.state.lessons[lastL]).length-1);
  const s2=h.state.session;guard=0;
  while(h.els.get('gameScreen').classList.contains('active')&&guard++<200){const w=s2.words[s2.currentId];h.type(w.term);if(!s2.answered)h.ctx.submit();h.ctx.nextCard();}
  assert.match(h.els.get('sumTitle').textContent,new RegExp(h.run('EXAM.name')+' 단어장 완주'));
  h.advance(1000);
  // 새 뜻이 1,000장을 넘는 책(토플)은 마지막 판에서 돌파 축하가 먼저 뜬다. 완주 화면은 축하를 닫으면 뜬다(milestones: msPendingEnding).
  if(h.run('msBusy')){assert(h.els.get('examEnd').hidden,'축하가 떠 있는 동안 완주 화면은 기다린다');h.run('msClose()');h.advance(1000);}
  assert(h.els.get('examEnd').classList.contains('show')&&!h.els.get('examEnd').hidden,'완주 화면이 뜬다');
  assert.match(h.els.get('examEndTitle').textContent,/단어장 완주/);
  h.fire('examEndClose','click');assert(h.els.get('examEnd').hidden);
  reports.push({file,exercises:all.length,fableExercises:fableEx.length,hiddenCards:fableEx.reduce((a,x)=>a+x.e.words.length,0)});
}

// 7) 엔진 복제 검사: 설정 블록이 config.json과 같고, 엔진 부분이 토익 엔진과 같다.
cp.execFileSync(process.execPath,[path.join(root,'pipeline/exam/sync.cjs'),'--check'],{stdio:'pipe'});

// 8) 조립기: fixture는 통과하고 IPA를 FABLE에 맞춘다. 잘못된 원본은 거부하고 쓰지 않는다. 시험 HTML이 아니면 쓰지 않는다.
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'exam-assemble-'));
try{
  const target=path.join(tmp,'vocagoyangtoeic.html');fs.copyFileSync(path.join(root,'vocagoyangtoeic.html'),target);
  const run=(src,html=target)=>cp.spawnSync('python3',[path.join(root,'pipeline/exam/assemble.py'),'toeic','--src',src,'--html',html],{encoding:'utf8'});
  const good=run(FIXTURE);assert.equal(good.status,0,good.stderr);
  const summary=JSON.parse(good.stdout.trim().split('\n').pop());
  assert(summary.ipaFromFableLink>=1&&summary.ipaFromFableSameWordPos>=1,'fixture의 영국식 IPA 두 장을 FABLE IPA로 덮어쓴다: '+good.stdout);
  const built=JSON.parse(fs.readFileSync(target,'utf8').match(/^const DATA = (.*);$/m)[1]);
  const byWord=(w,si)=>built.flatMap(L=>L.exercises.flatMap(e=>e.words)).find(c=>c.word===w&&c.si===si);
  assert.equal(byWord('colleague',1).ipa,'ˈkɑliɡ','연결 카드는 FABLE IPA');assert.equal(byWord('party',2).ipa,'ˈpɑrti','같은 철자·품사 IPA가 하나면 FABLE IPA');
  assert.deepEqual(byWord('luggage',1).acceptedAnswers,['baggage']);assert.deepEqual(byWord('book',1).fable,{set:2,si:2});
  const sets=['set01.json','set02.json'].map(f=>JSON.parse(fs.readFileSync(path.join(FIXTURE,f),'utf8')));
  const cases={
    '빈칸 둘':S=>{S[0][0].words[0].ex='{{BLANK}} and {{BLANK}}.';},
    '빈칸 없음':S=>{S[0][0].words[0].ex='No blank here.';},
    '필수 칸 없음':S=>{delete S[0][0].words[0].tr;},
    '모르는 칸':S=>{S[0][0].words[0].note='x';},
    'ko 번호와 si 다름':S=>{S[0][0].words[0].ko='② 회의록';},
    'sn>1인데 번호 없음':S=>{const w=S[0][0].words[1];w.ko=w.ko.replace(/^② /,'');},
    'word+si 겹침':S=>{S[0][1].words.push({...S[0][0].words[0]});},
    'si 빠짐':S=>{S[0][0].words[0].sn=2;S[0][0].words[0].ko='① 회의록';},
    'FABLE에 없는 연결':S=>{S[0][2].words[0].fable={set:2,si:9};},
    '연결 꼴':S=>{S[0][2].words[0].fable={set:'2',si:1};},
    '연결 카드가 새 뜻 연습에':S=>{S[0][0].words.push(S[0][2].words.pop());},
    '연결 없는 카드가 FABLE 뜻 연습에':S=>{S[0][2].words.push(S[0][1].words.pop());},
    'FABLE 뜻 연습이 앞에':S=>{S[0].unshift(S[0].pop());},
    '연습 번호 겹침':S=>{S[0][1].ex=1;},
    'scope 오타':S=>{S[0][2].scope='Fable';},
  };
  for(const [name,mutate] of Object.entries(cases)){
    const dir=path.join(tmp,'case');fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir);
    fs.copyFileSync(path.join(FIXTURE,'config.json'),path.join(dir,'config.json'));
    const S=plain(sets);mutate(S);S.forEach((s,i)=>fs.writeFileSync(path.join(dir,`set0${i+1}.json`),JSON.stringify(s)));
    const before=fs.readFileSync(target,'utf8'),r=run(dir);
    assert.equal(r.status,1,name+': 거부해야 한다\n'+r.stdout+r.stderr);assert(/문제:/.test(r.stderr),name+': 문제를 알린다');
    assert.equal(fs.readFileSync(target,'utf8'),before,name+': 거부하면 HTML을 쓰지 않는다');
  }
  { // 세트 파일·설정 짝
    const dir=path.join(tmp,'case');fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir);
    fs.copyFileSync(path.join(FIXTURE,'config.json'),path.join(dir,'config.json'));fs.copyFileSync(path.join(FIXTURE,'set01.json'),path.join(dir,'set01.json'));
    assert.equal(run(dir).status,1,'config.json에 있는 세트 파일이 없으면 거부');
  }
  { // FABLE HTML(설정 블록 없음)에는 쓰지 않는다.
    const fable=path.join(tmp,'vocagoyangfable.html');fs.copyFileSync(path.join(root,'vocagoyangfable.html'),fable);
    const before=fs.readFileSync(fable,'utf8'),r=run(FIXTURE,fable);
    assert.notEqual(r.status,0,'FABLE HTML에 쓰지 않는다');assert.equal(fs.readFileSync(fable,'utf8'),before);
  }
}finally{fs.rmSync(tmp,{recursive:true,force:true});}

console.log('PASS exam-course: '+JSON.stringify(reports)+' · 단추 기본 켬·끄면 보임·진도 키 안정·이어하기/개수 visEx·키 글자·sync --check·조립기 거부 15가지');
