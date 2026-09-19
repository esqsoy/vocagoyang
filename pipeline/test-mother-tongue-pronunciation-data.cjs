const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../vocagoyangksat2027.html'),'utf8');
const source=JSON.parse(fs.readFileSync(path.join(__dirname,'mother-tongue-pronunciations.json'),'utf8'));
const data=JSON.parse(html.match(/^const DATA = (.*);\r?$/m)[1]);
const actual=JSON.parse(html.match(/^const MT_PRONUNCIATIONS = (.*);\r?$/m)[1]);
assert(html.indexOf('const MT_PRONUNCIATIONS')>html.indexOf('/*==== WORDSET DATA END ====*/'),'Keep pronunciation outside the replaceable original wordset block');
const cards=data.flatMap(l=>l.exercises.flatMap(e=>e.words));
const meanings=new Map();
for(const card of cards){if(!meanings.has(card.en))meanings.set(card.en,new Set());meanings.get(card.en).add(card.ko);}
assert.equal(data.length,17);assert.equal(cards.length,6498);assert.equal(meanings.size,4028);
assert.deepEqual(Object.keys(actual).sort(),[...meanings.keys()].sort());
assert.deepEqual(Object.keys(source.entries).sort(),Object.keys(actual).sort());
function runtime(e){
  const result=Object.fromEntries(['ipa','speech','label'].filter(k=>k in e).map(k=>[k,e[k]]));
  if(e.alternatives)result.alternatives=e.alternatives.map(runtime);
  if(e.meanings)result.meanings=Object.fromEntries(Object.entries(e.meanings).map(([m,v])=>[m,runtime(v)]));
  return result;
}
function check(term,entry,alternative=false){
  assert.equal(typeof entry.ipa,'string',term);assert(entry.ipa.length>0,term);
  assert(!/[0-9<>\[\]=]|undefined|NaN/.test(entry.ipa),term+' malformed IPA');
  if(!alternative){assert.equal(typeof entry.speech,'string',term);assert(entry.speech.length>0,term);assert(!/[()\[\]=/<>]/.test(entry.speech),term+' unspoken editorial notation');}
  for(const alt of entry.alternatives??[]){assert(alt.label,term);check(term,alt,true);}
  for(const [meaning,specific] of Object.entries(entry.meanings??{})){assert(meanings.get(term).has(meaning),term+' unknown meaning');check(term,specific);}
}
for(const [term,entry] of Object.entries(actual)){
  check(term,entry);assert.deepEqual(entry,runtime(source.entries[term]));
  assert(source.entries[term].basis&&source.entries[term].sources.length,term+' missing provenance');
}
assert.equal(actual.wound.ipa,'wund');
assert.equal(actual.arise.ipa,'əˈraɪz');
assert.equal(actual.accountability.ipa,'əˌkaʊntəˈbɪləti');
assert.equal(actual.house.meanings['소장하다, 보관하다'].ipa,'haʊz');
assert.equal(actual.conduct.meanings['수행하다, 실시하다'].ipa,'kənˈdʌkt');
assert.equal(actual.conduct.meanings['(특정한 장소나 상황에서의) 행동'].ipa,'ˈkɑndʌkt');
assert(actual.associate.ipa.endsWith('eɪt'));assert(actual.subject.ipa.startsWith('ˈsʌb'));
assert(actual['wind turbine'].ipa.startsWith('wɪnd'));
assert(actual['read between the lines'].ipa.startsWith('ri'));
assert.equal(actual['make/take a decision'].speech,'make a decision');
assert.equal(actual['without[beyond] doubt'].speech,'without doubt');
assert.equal(actual['finding(s)'].speech,'findings');
assert(!actual['faux pas'].ipa.includes('ks'));
assert(html.includes('Copyright (C) 1993-2015 Carnegie Mellon University. All rights reserved.'));
assert(html.includes('END CMUDICT PRONUNCIATION DATA LICENSE */'));
console.log('PASS pronunciation coverage: 17 lessons, 6,498 unchanged cards, 4,028 expressions; semantic IPA, clean speech, provenance and embedded-data parity.');
