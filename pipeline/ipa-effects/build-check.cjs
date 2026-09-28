'use strict';
const assert=require('node:assert/strict');
const {collect,buildPage}=require('./build.cjs');
const data=[{exercises:[{words:[
 {en:'record',ko:'기록',ipa:'unused'},
 {en:'record',ko:'기록하다',ipa:'unused'},
 {en:'address',ko:'주소',ipa:'unused'},
 {en:'quack',ko:'꽥꽥',ipa:'unused',ex:'A semicolon; must remain inside the JSON string.'}
]}]}];
const dict={record:{ipa:'ˈrɛkɚd',meanings:{'기록하다':{ipa:'rɪˈkɔrd'}}},address:{ipa:'ˈædrɛs',speech:'my address'},quack:{ipa:'kwæk'}};
const source='<html><style>body{color:red}</style><script>\nconst DATA = '+JSON.stringify(data)+';\nconst MT_PRONUNCIATIONS = '+JSON.stringify(dict)+';\n</script></html>';
const assets={runtime:'function sample(){return IPA_EFFECT_MAPS;}',styles:'.ipa-effect{color:gold}'};
const found=collect(source);
assert(found.maps['record\tˈrɛkɚd']);assert(found.maps['record\trɪˈkɔrd']);
assert(!found.maps['address\tˈædrɛs']);assert.equal(found.stats.contextSpeechCards,1);
assert.equal(found.stats.cards,4);assert.equal(found.stats.alignedCards,3);
assert.equal(found.maps['quack\tkwæk'][0][3],0);
const first=buildPage(source,assets),second=buildPage(first.html,assets);
assert.equal(first.html,second.html);assert.equal((second.html.match(/IPA_EFFECT_RUNTIME_START/g)||[]).length,1);
assert(first.html.indexOf('IPA_EFFECT_RUNTIME_START')<first.html.indexOf('const DATA ='));
assert(second.html.includes('const DATA = '+JSON.stringify(data)+';'));
const updated=buildPage(first.html,{...assets,styles:'.ipa-effect{color:yellow}'});
assert(updated.html.includes('color:yellow'));assert(!updated.html.includes('color:gold'));
const template=source.replace('</script>',"const printTemplate='<style>body{color:blue}</style>';\n</script>");
assert(buildPage(template,assets).html.includes("const printTemplate='<style>body{color:blue}</style>';"));
const fable='<style></style><script>\nconst DATA = '+JSON.stringify([{exercises:[{words:[{en:'doubt',ipa:'daʊt'}]}]}])+';\n</script>';
const compact=collect(fable).maps['doubt\tdaʊt'];assert.equal(compact[2][3],3);assert.equal(compact[2][5],0);
assert.throws(()=>collect(fable.replace('daʊt','')),/Missing IPA/);
const controls=[{en:'zero',ko:'영'},{en:'list',ko:'목록'},{en:'knot',ko:'매듭'},{en:'cat',ko:'고양이'},{en:'record',ko:'기록하다'}];
const controlsDict={
 zero:{ipa:'ˈzɪroʊ',speech:'Zero'},
 list:{ipa:'lɪst',label:'명사'},
 knot:{ipa:'nɑt',alternatives:[{ipa:'nɒt'}]},
 cat:{ipa:'kæt',speech:'cat',alternatives:[{label:'not an IPA alternative'}]},
 record:{ipa:'ˈrɛkɚd',label:'명사',alternatives:[{ipa:'rɪˈkɔrd'}],meanings:{'기록하다':{ipa:'rɪˈkɔrd'}}}
};
const controlled=collect('<script>\nconst DATA = '+JSON.stringify([{exercises:[{words:controls}]}])+';\nconst MT_PRONUNCIATIONS = '+JSON.stringify(controlsDict)+';\n</script>');
assert.equal(controlled.stats.forcedWholeCards,3);assert.equal(controlled.stats.alignedCards,2);
assert.equal(controlled.stats.labeledCards,1);assert.equal(controlled.stats.alternativeCards,1);assert.equal(controlled.stats.contextSpeechCards,1);
assert(!controlled.maps['zero\tˈzɪroʊ']);assert(!controlled.maps['list\tlɪst']);assert(!controlled.maps['knot\tnɑt']);
assert(controlled.maps['cat\tkæt']);assert(controlled.maps['record\trɪˈkɔrd']);
console.log('IPA builder: meaning variants, contextual speech fallback, compact flags, source conservation, replacement and idempotence passed.');
