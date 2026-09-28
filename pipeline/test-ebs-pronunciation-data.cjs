const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../vocagoyangebs2027.html'),'utf8');
const source=JSON.parse(fs.readFileSync(path.join(__dirname,'ebs-pronunciations.json'),'utf8'));
const data=JSON.parse(html.match(/^const DATA = (.*);\r?$/m)[1]);
const cards=data.flatMap(l=>l.exercises.flatMap(e=>e.words));
const meanings=new Map();
for(const card of cards){if(!meanings.has(card.en))meanings.set(card.en,new Set());meanings.get(card.en).add(card.ko);}
assert.equal(data.length,4);assert.equal(data.reduce((n,l)=>n+l.exercises.length,0),48);
assert.equal(cards.length,597);assert.equal(meanings.size,545);
assert.equal(crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex'),source.dataSha256,'No vocabulary, meaning, example, alternative or ordering changes');
assert.deepEqual(Object.keys(source.entries).sort(),[...meanings.keys()].sort());
function runtime(e){
  const result=Object.fromEntries(['ipa','speech','label'].filter(k=>k in e).map(k=>[k,e[k]]));
  if(e.alternatives)result.alternatives=e.alternatives.map(runtime);
  if(e.meanings)result.meanings=Object.fromEntries(Object.entries(e.meanings).map(([m,v])=>[m,runtime(v)]));
  return result;
}
function check(term,entry,alternative=false){
  assert.equal(typeof entry.ipa,'string',term);assert(entry.ipa.trim(),term);
  assert(!/[0-9<>\[\]=~]|undefined|NaN/.test(entry.ipa),term+' malformed IPA');
  assert(/[aeiouæɑɔəɛɪʊʌɚɝ]/.test(entry.ipa),term+' no vowel');
  if(!alternative){assert.equal(typeof entry.speech,'string',term);assert(entry.speech.trim(),term);assert(!/[()\[\]=/<>~]|\.\.\./.test(entry.speech),term+' unspoken editorial notation');}
  for(const alt of entry.alternatives??[]){assert(alt.label,term);check(term,alt,true);}
  for(const [meaning,specific] of Object.entries(entry.meanings??{})){assert(meanings.get(term).has(meaning),term+' unknown meaning');check(term,specific);}
}
for(const [term,e] of Object.entries(source.entries)){
  check(term,e);assert(e.basis&&e.sources.length,term+' missing provenance');
  assert.deepEqual([...e.reviewedMeanings].sort(),[...meanings.get(term)].sort(),term+' not all EBS senses reviewed');
  if(e.meanings)assert.deepEqual(Object.keys(e.meanings).sort(),[...meanings.get(term)].sort(),term+' missing explicit semantic selection');
}
const actual=Object.fromEntries(Object.entries(source.entries).map(([term,e])=>[term,runtime(e)]));
const functionText=html.match(/function pronunciationEntry\(term,meaning\)\{[\s\S]*?\n\}/)[0];
const context=vm.createContext({MT_PRONUNCIATIONS:actual});vm.runInContext(functionText,context);
const pick=(term,meaning)=>context.pronunciationEntry(term,meaning);
assert.equal(pick('affect','정서').ipa,'ˈæfɛkt');assert.equal(pick('affect','정서').speech,'flat affect');
assert.equal(pick('conduct','행동').ipa,'ˈkɑndʌkt');
assert.equal(pick('contrast','대조').ipa,'ˈkɑntræst');
assert.equal(pick('construct','구성하다').ipa,'kənˈstrʌkt');
assert.equal(pick('construct','개념').ipa,'ˈkɑnstrʌkt');
assert.equal(pick('construct','구성 개념, (이런저런 증거들에 기반을 두고) 모습으로 구성한 생각').ipa,'ˈkɑnstrʌkt');
assert.equal(pick('approximate','어림잡다, 근사치를 계산하다').ipa,'əˈprɑksəˌmeɪt');
assert.equal(pick('approximate','대략적인').ipa,'əˈprɑksəmət');
assert.equal(pick('legitimate','정당화하다; 정당한').ipa,'lɪˈdʒɪtəˌmeɪt');
assert.equal(pick('legitimate','정당화하다; 정당한').alternatives[0].ipa,'lɪˈdʒɪtəmət');
assert.equal(pick('legitimate','정당화하다; 정당한').alternatives[0].label,'형용사');
assert.equal(actual.primer.ipa,'ˈprɪmɚ');assert.equal(actual.vegan.ipa,'ˈviɡən');
assert.equal(actual.attribute.ipa,'ˈætrɪˌbjut');assert.equal(actual.discount.ipa,'dɪsˈkaʊnt');
assert.equal(actual.overshoot.ipa,'ˌoʊvɚˈʃut');assert.equal(actual.decrease.ipa,'dɪˈkris');
assert.equal(actual.derive.ipa,'dɪˈraɪv');assert.equal(actual['derive from'].ipa,'dɪˈraɪv frəm');
assert.equal(actual.circulation.ipa,'ˌsɝkjəˈleɪʃən');
assert.equal(actual.recognizable.ipa,'ˈrɛkəɡˌnaɪzəbəl');
assert.equal(actual.concrete.ipa,'ˈkɑnkrit');
assert.equal(actual.noteworthy.ipa,'ˈnoʊtˌwɝði');
assert.equal(actual.bedridden.ipa,'ˈbɛdˌrɪdən');
assert.equal(actual.redirection.ipa,'ˌridɪˈrɛkʃən');
assert.equal(actual['be derived from'].ipa,'bi dɪˈraɪvd frəm');
assert.equal(actual['conflict with'].ipa,'kənˈflɪkt wɪð');
assert.equal(actual['be subjected to'].ipa,'bi səbˈdʒɛktɪd tə');
assert.equal(actual.maximise.speech,'maximise');assert.equal(actual.minimise.speech,'minimise');
assert.equal(actual['dust ~ down'].speech,'dust down');
assert.equal(actual['take ~ for granted'].speech,'take for granted');
assert.equal(actual['pressure ~ into ...'].speech,'pressure into');
assert.equal(actual['refer to ~ as ...'].speech,'refer to as');
assert.equal(actual['condemn ~ to ...'].speech,'condemn to');
for(const card of cards){const e=pick(card.en,card.ko);assert(e.ipa&&e.speech,card.en);}
if(!process.argv.includes('--source-only')){
  const embedded=JSON.parse(html.match(/^const MT_PRONUNCIATIONS = (.*);\r?$/m)[1]);
  assert.deepEqual(embedded,actual,'Sidecar must be reassembled into EBS HTML');
  assert(html.indexOf('const MT_PRONUNCIATIONS')>html.indexOf('/*==== WORDSET DATA END ====*/'));
  assert(html.includes('Copyright (C) 1993-2015 Carnegie Mellon University. All rights reserved.'));
}
console.log('PASS EBS IPA: 4 lessons, 48 exercises, 597 unchanged cards, 545 expressions; semantic selection, speech cleanup, provenance'+(process.argv.includes('--source-only')?' (source only).':' and embedded parity.'));
