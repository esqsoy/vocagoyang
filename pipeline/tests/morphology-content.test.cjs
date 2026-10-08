const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {restorePlayerFeedbackSource20261007}=require('../restore-player-feedback-20261007.cjs');
const root=path.resolve(__dirname,'../..');
const h=fs.readFileSync(path.join(root,'vocagoyangfable.html'),'utf8');
const data=JSON.parse(h.match(/const DATA = (\[.*?\]);\r?\n/s)[1]);
const morph=JSON.parse(fs.readFileSync(path.join(root,'pipeline/morphology.json'),'utf8'));
assert.deepEqual(JSON.parse(h.match(/const MORPHOLOGY = (\{.*?\});\r?\n/s)[1]),morph);
const ids=new Set(),stats={units:0,cards:0,greekUnits:0,sources:0};
for(const u of morph.units){
 assert(!ids.has(u.id),u.id);ids.add(u.id);stats.units++;
 assert(u.title&&u.rule&&u.limits&&u.history.origin&&u.history.route&&u.sources.length,u.id);
 for(const url of u.sources)assert(/^https:\/\//.test(url),url);
 stats.sources+=u.sources.length;
 if(u.kind==='greek')stats.greekUnits++;
 if(u.kind==='greek'||u.kind==='mixed'||u.history.greek){assert(/[\u0370-\u03ff\u1f00-\u1fff]/.test(u.history.greek),u.id);assert(u.history.romanization&&u.history.reading,u.id);}
 for(const w of u.cards){
   stats.cards++;
   assert.equal((w.ex.match(/\{\{BLANK\}\}/g)||[]).length,1,w.word);
   assert(w.ex.replace('{{BLANK}}',w.en).trim().split(/\s+/).length<=10,w.word);
   assert(w.c.length<=70,w.word);assert(w.ipa&&!w.ipa.includes('/'),w.word);
   assert(w.en&&w.ko&&w.tr&&w.pos,w.word);
 }
}
// The topic manifest validates its additions before restoring the authored pool.
for(const L of require('./helpers/editorial-review.cjs').restoreTopicGrouping(data)){
 const file=L.lesson<5?`lesson${String(L.lesson).padStart(2,'0')}.json`:`set${String(L.lesson).padStart(2,'0')}.json`;
 // Compare both sides before the later, recorded example edits.
 const canonical=restorePlayerFeedbackSource20261007(JSON.parse(fs.readFileSync(path.join(root,'pipeline/out',file),'utf8')),`pipeline/out/${file}`);
 assert.deepEqual(L.exercises,Array.isArray(canonical)?canonical:canonical.exercises,file);
}
// 26.10.08 그림 법칙 사촌 쌍(단위 5·카드 14) 추가: 141→146 단위, 358→372 카드. 이전 단계는 claude-review-20261008 원장으로 되돌려 검사한다.
assert.equal(stats.units,146);assert.equal(stats.cards,372);assert.equal(stats.greekUnits,24);
console.log(JSON.stringify({...stats,sourceHtmlSync:true,scope:'46–48 course content; 0–45 remains separate'}));
