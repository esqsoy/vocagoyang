'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {align,REVIEWED}=require('./alignment.cjs');
const repo=path.resolve(__dirname,'../..');
function flatten(data){return data.flatMap(s=>s.exercises.flatMap(e=>e.words));}
function htmlData(file){const text=fs.readFileSync(path.join(repo,file),'utf8');return JSON.parse(text.match(/^const DATA = (.*);$/m)[1]);}
function clean(ipa){return ipa.replace(/[.\s]/g,'');}
function verify(term,ipa){
 const out=align(term,ipa),letters=(term.match(/[a-z]/gi)||[]).length;
 assert(['whole','aligned'].includes(out.mode));assert(out.parts.length,term+' no parts');
 let next=0,lastBeat=0;
 for(const p of out.parts){
  assert(Number.isInteger(p.start)&&Number.isInteger(p.end),term+' fractional slot');
  assert.equal(p.start,next,term+' gap or overlap');assert(p.end>p.start&&p.end<=letters,term+' range');next=p.end;
  assert(Number.isInteger(p.beat)&&p.beat>=lastBeat,term+' beats backwards');lastBeat=p.beat;
  assert.equal(p.silent,!p.ipa,term+' silent label');assert.equal(p.stress,p.ipa.includes('ˈ'),term+' primary');
  assert.equal(p.secondary,p.ipa.includes('ˌ'),term+' secondary');
  assert(p.silent?p.weight===0:p.weight>0,term+' timing weight');
 }
 assert.equal(next,letters,term+' missing final letters');
 assert.equal(clean(out.parts.map(p=>p.ipa).join('')),clean(ipa),term+' changed supplied IPA');
 assert.deepEqual(align(term,ipa),out,term+' non-deterministic');
 return out;
}
for(const [key,rows]of Object.entries(REVIEWED)){
 const [term,ipa]=key.split('|'),got=verify(term,ipa);assert.equal(got.basis,'reviewed');
 assert.deepEqual(got.parts.map(p=>[p.start,p.end,p.ipa,p.beat]),rows);
}
for(const word of ['list','doubt','knot']){
 const key=Object.keys(REVIEWED).find(k=>k.startsWith(word+'|'));
 assert(verify(word,key.split('|')[1]).parts.every(p=>p.beat===0));
}
assert.equal(verify('receipt','rɪˈsit').parts.at(-1).beat,1);
assert.equal(verify('photographic','ˌfoʊtəˈɡræfɪk').parts[2].ipa,'ˈɡræf');
assert.equal(verify('quack','kwæk').mode,'aligned');
assert.equal(verify('quack','ziˈbɑ').mode,'whole');
assert.equal(verify('through','θru').parts.length,1);
assert.equal(verify('cat','kæt / kɑt').mode,'whole');
assert.equal(verify('old-fashioned','oʊldˈfæʃənd').mode,'whole');
assert.equal(verify('look up','lʊk ʌp').mode,'aligned');
assert.equal(verify('look up','lʊkʌp').mode,'whole');
assert.equal(verify('experience','ɪkˈspɪriəns').mode,'whole');
assert.equal(verify('examine','ɪgˈzæmɪn').mode,'whole');
assert.deepEqual(verify('direction','dəˈrɛkʃən').parts.map(p=>p.ipa),['də','ˈrɛk','ʃən']);
assert.deepEqual(verify('adoption','əˈdɑpʃən').parts.map(p=>p.ipa),['ə','ˈdɑp','ʃən']);
assert.deepEqual(verify('rabbit','ˈræb.ɪt').parts.map(p=>p.ipa),['ˈræb','ɪt']);
assert.equal(verify('taxi','ˈtæk.si').mode,'whole');
assert.deepEqual(align('', '').parts,[]);

const sources={
 fable:flatten(htmlData('vocagoyangfable.html')).map(w=>[w.en,w.ipa]),
 motherTongue:Object.entries(JSON.parse(fs.readFileSync(path.join(repo,'pipeline/mother-tongue-pronunciations.json'),'utf8')).entries).map(([term,p])=>[term,p.ipa])
};
const ebsFile=path.join(repo,'pipeline/ebs-pronunciations.json');
if(fs.existsSync(ebsFile))sources.ebs=Object.entries(JSON.parse(fs.readFileSync(ebsFile,'utf8')).entries).map(([term,p])=>[term,p.ipa]);
const summary={},unique=new Map(),fallback=[],aligned=[];
for(const [source,pairs]of Object.entries(sources)){
 const counts={entries:0,aligned:0,whole:0,reasons:{}};
 for(const [term,ipa]of pairs){
  if(!ipa)continue;
  const result=verify(term,ipa);counts.entries++;counts[result.mode]++;
  if(result.reason)counts.reasons[result.reason]=(counts.reasons[result.reason]||0)+1;
  unique.set(term+'|'+ipa,{term,ipa,result});
 }
 summary[source]=counts;
}
for(const {term,ipa,result}of unique.values()){
 if(result.mode==='whole')fallback.push({term,ipa,reason:result.reason});
 else aligned.push({term,ipa,parts:result.parts.map(p=>({spelling:term.replace(/[^a-z]/gi,'').slice(p.start,p.end),ipa:p.ipa,beat:p.beat}))});
}
const report={
 schemaVersion:1,
 principles:['Existing IPA and word lists are unchanged.','No proportional letter-count split is used.','Only complete grapheme-to-supplied-IPA matches receive alignment.','Whole mode preserves the full IPA without claiming a local correspondence.','Syllable groups and internal times are approximate visual cues, not audio measurements.','Punctuation-bearing terms conservatively use whole mode.'],
 summary,uniquePairs:unique.size,alignedPairs:aligned.length,wholePairs:fallback.length,
 inspection:aligned.filter((_,i)=>i%67===0),fallback
};
if(process.argv.includes('--write-report'))fs.writeFileSync(path.join(__dirname,'alignment-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({summary,uniquePairs:unique.size,alignedPairs:aligned.length,wholePairs:fallback.length,assertions:'All spellings, IPA conservation, beat/range invariants, reviewed overrides and fallback checks passed.'},null,2));
