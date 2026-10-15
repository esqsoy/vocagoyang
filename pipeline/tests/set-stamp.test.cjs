'use strict';
// 세트 완주 도장·FABLE 엔딩(26.10.14 영신, pipeline/set-stamp): 도장이 다음 세트를 연다, 처음엔 이미 끝낸 세트를 도장으로 친다,
// 그 세트에서 틀렸던 단어 목록, 세트를 막 다 끝낸 판에서만 복습을 연다, 엔딩은 도장 뒤로 미룬다, B1은 1부 완결, 세트 대사.
const assert=require('node:assert/strict'),path=require('node:path');
const {harness,root}=require('./helpers/mother-tongue-harness.cjs');
const FILE=path.join(root,'vocagoyangfable.html'),KEY='goyang-fable-stamps-v1',MISS='goyang-missed-words-v1';
const set=(h,n)=>h.state.lessons.find(L=>L.lesson===n);
const clear=(h,n,skipLast)=>{const L=set(h,n),ev=h.ctx.visEx(L);ev.forEach((e,i)=>{if(!(skipLast&&i===ev.length-1))h.ctx.setRec(L.id,e.title,{});});};
const opened=h=>[...h.ctx.openSets()].map(L=>L.lesson);

// 1. 처음 열 때: 이미 다 끝낸 세트는 도장을 받은 것으로 친다(날짜 0). 기록이 이미 있으면 덮지 않는다.
{const seed={'test-progress':'{}'};let h=harness(FILE);clear(h,0);clear(h,1);
 const progress=h.storage.get(h.run('STORAGE'));h=harness(FILE,{[h.run('STORAGE')]:progress});
 assert.deepEqual(JSON.parse(h.storage.get(KEY)),{'0세트':0,'1세트':0},'Sets cleared before the update count as stamped');
 assert.deepEqual(opened(h),[0,1,2],'…so nobody loses an open set');
 h=harness(FILE,{[h.run('STORAGE')]:progress,[KEY]:'{"0세트":5}'});assert.deepEqual(JSON.parse(h.storage.get(KEY)),{'0세트':5},'Existing stamps are kept');}

// 2. 도장이 다음 세트 문을 연다: 다 클리어해도 도장 전에는 잠금, 도장 뒤 열림.
{const h=harness(FILE);clear(h,0);
 assert.deepEqual(opened(h),[0]);assert.equal(h.ctx.setPassed(set(h,0)),false);assert.deepEqual([...h.ctx.stPendingSets()].map(L=>L.lesson),[0]);
 h.ctx.stGive(set(h,0),Date.now());assert.deepEqual(opened(h),[0,1]);assert.equal(h.ctx.stPendingSets().length,0);}

// 3. 그 세트에서 틀렸던 단어: 틀린 단어 기록 중 이 세트 표제어 + 방금 판에서 틀린 단어. 표제어 하나는 한 줄, 세트 카드 순서.
{const h=harness(FILE,{[MISS]:JSON.stringify({hello:2,it:1,'not-in-set-0':3})});const L=set(h,0),ws=h.ctx.visEx(L).flatMap(e=>e.words);
 const extra=ws.find(w=>!['hello','it'].includes(w.term.toLowerCase())&&w.term!=='I');
 const rows=[...h.ctx.stMissList(L,{words:[{...extra,wrongEver:true}]})];
 assert.deepEqual(rows.map(r=>r.term.toLowerCase()).sort(),['hello','it',extra.term.toLowerCase()].sort());
 const order=ws.map(w=>w.term);assert.deepEqual(rows.map(r=>r.term),[...rows.map(r=>r.term)].sort((a,b)=>order.indexOf(a)-order.indexOf(b)),'Set card order');
 const it=rows.find(r=>r.term==='it');assert(it.mean.length>=1&&it.n===1);}
{const h0=harness(FILE),L=set(h0,0),ws=h0.ctx.visEx(L).flatMap(e=>e.words),cnt={};ws.forEach(w=>{cnt[w.term]=(cnt[w.term]||0)+1;});
 const multi=Object.keys(cnt).find(t=>cnt[t]>1);assert(multi,'a headword with several cards in set 0');
 const h=harness(FILE,{[MISS]:JSON.stringify({[multi.toLowerCase()]:1})}),rows=[...h.ctx.stMissList(set(h,0),null)];
 assert.equal(rows.length,1,'Senses of one headword share a row');assert.equal(rows[0].mean.length,new Set(ws.filter(w=>w.term===multi).map(w=>w.meaning)).size);}

// 4. 복습은 세트를 막 다 끝낸 판에서만 연다. 마지막 범위 연습이면 all, 엔딩은 도장 뒤로 미룬다.
{const h=harness(FILE);clear(h,0,true);const L=set(h,0),li=h.state.lessons.indexOf(L);
 h.ctx.openLesson(li);h.ctx.openExercise(h.ctx.visEx(L).length-1);const s=h.state.session;s.words.forEach(w=>{w.passed=true;});h.ctx.finishExercise();
 assert(h.run('!!stReview&&stReview.L.lesson===0&&stReview.where==="sum"&&stReview.all===false'),'Review starts on the play that clears the set');
 assert(/도장까지 \d+개|다음/.test(h.els.get('nextEx').textContent));
 h.run('stReview=null');h.ctx.openLesson(li);h.ctx.openExercise(0);h.state.session.words.forEach(w=>{w.passed=true;});h.ctx.finishExercise();
 assert.equal(h.run('stReview'),null,'Replaying a cleared set does not reopen the review');
 h.run('stReview={L:stAll,where:"sum"}');h.ctx.showEnding();assert.equal(h.run('stPendingEnding'),true,'The ending waits for the stamp');assert.equal(h.run('feState'),null);h.run('stReview=null;stPendingEnding=false');}

// 5. 엔딩 종류: 전부 끝내면 full, B1 범위에서 0~25세트만 끝내면 b1(1부 완결), 아니면 없다(아스트라 리뷰 T02).
{const h=harness(FILE);assert.equal(h.ctx.feMode(),null);
 h.state.lessons.forEach(L=>{if(L.kind!=='saved'&&L.lesson<=25)clear(h,L.lesson);});assert.equal(h.ctx.feMode(),null,'C1 scope: B1 sets alone are not an ending');
 h.state.levelB1=true;assert.equal(h.ctx.feMode(),'b1');assert(h.ctx.clearedExercises(true)<h.ctx.totalExercises(true));
 h.state.lessons.forEach(L=>{if(L.kind!=='saved')clear(h,L.lesson);});assert.equal(h.ctx.feMode(),'full');}

// 6. 세트 대사: 0~50세트 모두, 60자 이내, '고양', 옛 수치·단정 없음(PRINCIPLES 11, 아스트라 리뷰 T06). 엔딩 대사도 '고양'(끊기는 정체 대사만 예외).
{const h=harness(FILE),LC=h.run('LESSONCLEAR');
 for(let n=0;n<=50;n++){const v=LC[n];assert(typeof v==='string'&&v.length<=60&&/고양/.test(v),`${n}: ${v}`);
  assert(!/%|COCA|완등|\d,\d{3}|스무 개에 하나|단어 가족/.test(v),`${n}: numeric or stale claim: ${v}`);}
 for(const [mode,lines] of Object.entries(h.run('FE_LINES')))lines.forEach(([e,t,c,k])=>{assert(h.run('CAT')[e],`${mode}: cat face ${e}`);if(k!=='slow')assert(/고양/.test(t),`${mode}: ${t}`);});}
// 7. 홈 진도 막대와 예약된 showEnding도 마지막 도장을 건너뛰지 않는다.
for(const mode of ['full','b1']){
 const h=harness(FILE);h.state.levelB1=mode==='b1';const last=mode==='b1'?25:50;
 h.state.lessons.forEach(L=>{if(L.kind==='saved'||L.lesson>last)return;clear(h,L.lesson);if(L.lesson<last)h.ctx.stGive(L,1);});
 h.ctx.show('home');const endings=[];h.ctx.feOpen=m=>endings.push(m);
 assert.equal(h.ctx.feMode(),mode,'Learning completion and the stamp gate are distinct');
 h.doc.querySelector('.maproute').click();h.ctx.showEnding();
 assert.equal(endings.length,0,'Neither entry point opens an ending before its last stamp');
 assert.equal(h.run('stPendingEnding'),true);
 if(mode==='full'){h.state.levelB1=true;h.doc.querySelector('.maproute').click();assert.equal(endings.length,0,'B1 view cannot hide an unpaid full-ending stamp');}
 h.ctx.stGive(set(h,last),1);h.doc.querySelector('.maproute').click();
 assert.deepEqual(endings,[mode],'The ending is available once all required stamps are present');
 assert.equal(h.run('stPendingEnding'),false);
}

// 8. 업데이트 전 완주 기록(날짜 0 도장)과 저장하지 않는 엔딩 미리보기는 유지한다.
{let h=harness(FILE);h.state.lessons.forEach(L=>{if(L.kind!=='saved')clear(h,L.lesson);});
 const key=h.run('STORAGE'),progress=h.storage.get(key);h=harness(FILE,{[key]:progress});
 assert.equal(h.ctx.stAt(set(h,50)),0);assert(h.ctx.stHas(set(h,50)));
 const endings=[];h.ctx.feOpen=m=>endings.push(m);h.doc.querySelector('.maproute').click();assert.deepEqual(endings,['full']);}
for(const mode of ['full','b1']){
 const h=harness(FILE),endings=[];h.ctx.feOpen=m=>endings.push(m);
 h.ctx.location.hash=mode==='b1'?'#ending=b1':'#ending';h.ctx.stPreview();h.advance(700);
 assert.deepEqual(endings,[mode],'Preview does not require progress or stamps');
 assert.deepEqual(JSON.parse(h.storage.get(KEY)),{},'Preview grants no stamps');
}
console.log('PASS set-stamp: 도장 해금·복습·B1/전체 엔딩·홈 우회 차단·구판 기록·미리보기·세트 대사');
