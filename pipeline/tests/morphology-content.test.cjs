const fs=require('fs'),path=require('path'),assert=require('assert/strict');
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
 if(u.kind==='greek'){stats.greekUnits++;assert(/[\u0370-\u03ff\u1f00-\u1fff]/.test(u.history.greek),u.id);assert(u.history.romanization&&u.history.reading,u.id);}
 for(const w of u.cards){
   stats.cards++;
   assert.equal((w.ex.match(/\{\{BLANK\}\}/g)||[]).length,1,w.word);
   assert(w.ex.replace('{{BLANK}}',w.en).trim().split(/\s+/).length<=10,w.word);
   assert(w.c.length<=70,w.word);assert(w.ipa&&!w.ipa.includes('/'),w.word);
   assert(w.en&&w.ko&&w.tr&&w.pos,w.word);
 }
}
for(const L of data){
 const file=L.lesson<5?`lesson${String(L.lesson).padStart(2,'0')}.json`:`set${String(L.lesson).padStart(2,'0')}.json`;
 const canonical=JSON.parse(fs.readFileSync(path.join(root,'pipeline/out',file),'utf8'));
 assert.deepEqual(L.exercises,Array.isArray(canonical)?canonical:canonical.exercises,file);
}
assert.equal(stats.units,71);assert.equal(stats.cards,167);assert.equal(stats.greekUnits,16);
console.log(JSON.stringify({...stats,sourceHtmlSync:true,scope:'46–48 course content; 0–45 remains separate'}));
