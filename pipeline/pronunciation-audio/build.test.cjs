'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadMedia}=require('./build.cjs');
const {collect,buildPage}=require('../ipa-effects/build.cjs');
const root=path.resolve(__dirname,'../..'),media=loadMedia();
assert(media['contract\tˈkɑntrækt']);assert(media['contract\tkənˈtrækt']);
assert.notEqual(media['contract\tˈkɑntrækt'].src,media['contract\tkənˈtrækt'].src);
assert(!media['contract\tunknown'],'Unknown pronunciations must not guess');
const source='<style></style><script>\nconst DATA = '+JSON.stringify([{exercises:[{words:[
 {en:'contract',ko:'verb'},{en:'contract',ko:'unclear'},{en:'cat',ko:'cat'}
]}]}])+';\nconst MT_PRONUNCIATIONS = '+JSON.stringify({contract:{ipa:'kənˈtrækt',speech:'to contract',meanings:{unclear:{alternatives:[{ipa:'ˈkɑːntrækt'}]}}},cat:{ipa:'kæt'}})+';\n</script>';
const withAudio=collect(source,media),withoutAudio=collect(source);
assert.equal(withAudio.stats.audioCards,1,'Ambiguous alternatives cannot be assigned just one pronunciation');
assert.equal(withAudio.stats.contextSpeechCards,1,'Only the ambiguous card keeps its context phrase');
assert.equal(withoutAudio.stats.contextSpeechCards,2,'Native context keeps its original whole-word behavior');
assert(withAudio.maps['contract\tkənˈtrækt']);assert(!withoutAudio.maps['contract\tkənˈtrækt']);
for(const file of ['vocagoyangfable.html','vocagoyangksat2027.html','vocagoyangebs2027.html']){
 const src=fs.readFileSync(path.join(root,file),'utf8');
 const built=buildPage(src,{runtime:fs.readFileSync(path.join(__dirname,'../ipa-effects/runtime.js'),'utf8'),styles:fs.readFileSync(path.join(__dirname,'../ipa-effects/styles.css'),'utf8')});
 assert(built.stats.audioCards>0,file+' should contain actual exceptions');
 assert.equal(built.html,src.replace(/\r\n/g,'\n'),file+' must be generated');
}
console.log('PASS exact pronunciation assets, alternatives exclusion, contextual fallback, and all three generated hosts.');
