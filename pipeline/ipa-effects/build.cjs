'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {align}=require('./alignment.cjs');
const ROOT=path.resolve(__dirname,'../..');
const PAGES=['vocagoyangfable.html','vocagoyangksat2027.html','vocagoyangebs2027.html'];
const RUNTIME_START='/* IPA_EFFECT_RUNTIME_START */',RUNTIME_END='/* IPA_EFFECT_RUNTIME_END */';
const STYLES_START='/* IPA_EFFECT_STYLES_START */',STYLES_END='/* IPA_EFFECT_STYLES_END */';
function assignment(source,name,required=true){
 const pattern=new RegExp('^const '+name+'\\s*=\\s*([^\\r\\n]*)$','m'),match=source.match(pattern);
 if(!match){assert(!required,'Missing '+name+' assignment');return null;}
 const value=match[1].replace(/;[ \t]*(?:\/\/.*)?$/,'');
 assert.notEqual(value,match[1],'Missing assignment terminator for '+name);
 return {line:match[0],data:JSON.parse(value)};
}
function pronunciationEntry(dictionary,term,meaning){
 const entry=dictionary[term]||{},specific=entry.meanings&&entry.meanings[meaning];
 return specific?{...entry,label:undefined,alternatives:undefined,...specific}:entry;
}
function collect(source){
 const data=assignment(source,'DATA'),dictionary=assignment(source,'MT_PRONUNCIATIONS',false);
 const cards=data.data.flatMap(s=>s.exercises.flatMap(e=>e.words));
 const maps=new Map(),allPairs=new Set(),stats={cards:cards.length,alignedCards:0,wholeCards:0,forcedWholeCards:0,labeledCards:0,alternativeCards:0,contextSpeechCards:0,uniquePairs:0,mapEntries:0,mapBytes:0,reasons:{}};
 for(const card of cards){
  const term=card.en,entry=dictionary?pronunciationEntry(dictionary.data,term,card.ko):card;
  assert(entry&&typeof entry.ipa==='string'&&entry.ipa.trim(),'Missing IPA for '+term+' / '+card.ko);
  const ipa=entry.ipa,key=term+'\t'+ipa;
  allPairs.add(key);
  // Exactly mirror pronunciationEffectInfo, including punctuation/case changes
  // in speech and only alternatives that actually contain an IPA string.
  const labeled=!!dictionary&&!!entry.label;
  const alternatives=!!dictionary&&Array.isArray(entry.alternatives)&&entry.alternatives.some(p=>p.ipa);
  const differentSpeech=!!dictionary&&!!entry.speech&&entry.speech!==term;
  if(labeled||alternatives||differentSpeech){
   stats.wholeCards++;stats.forcedWholeCards++;
   if(labeled)stats.labeledCards++;
   if(alternatives)stats.alternativeCards++;
   if(differentSpeech)stats.contextSpeechCards++;
   const reason=labeled?'labeled pronunciation':alternatives?'alternative pronunciations':'different speech text';
   stats.reasons[reason]=(stats.reasons[reason]||0)+1;continue;
  }
  const aligned=align(term,ipa);
  if(aligned.mode!=='aligned'){
   stats.wholeCards++;stats.reasons[aligned.reason]=(stats.reasons[aligned.reason]||0)+1;continue;
  }
  stats.alignedCards++;
  const compact=aligned.parts.map(p=>[p.start,p.end,p.ipa,p.silent?3:p.stress?1:p.secondary?2:0,p.beat,p.weight]);
  if(maps.has(key))assert.deepEqual(maps.get(key),compact,'Meaning-dependent map collision: '+term);
  else maps.set(key,compact);
 }
 const sorted=Object.fromEntries([...maps].sort(([a],[b])=>a<b?-1:a>b?1:0));
 const encoded=JSON.stringify(sorted).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 stats.uniquePairs=allPairs.size;stats.mapEntries=maps.size;stats.mapBytes=Buffer.byteLength(encoded,'utf8');
 return {data,dictionary,maps:sorted,encoded,stats};
}
function insertBlock(source,start,end,payload,closingTag){
 const first=source.indexOf(start),last=source.indexOf(end),block=start+'\n'+payload.trim().replace(/\r\n/g,'\n')+'\n'+end;
 assert((first===-1)===(last===-1),'Incomplete generated block '+start);
 if(first!==-1){
  assert(last>first&&source.indexOf(start,first+start.length)===-1&&source.indexOf(end,last+end.length)===-1,'Duplicate generated block '+start);
  return source.slice(0,first)+block+source.slice(last+end.length);
 }
 if(closingTag==='main-script-start'){
  const mains=[...source.matchAll(/(<script(?:\s[^>]*)?>)([\s\S]*?)<\/script>/g)].filter(m=>/^const DATA\s*=/m.test(m[2]));
  assert.equal(mains.length,1,'Expected one main script containing DATA');
  const index=mains[0].index+mains[0][1].length;
  return source.slice(0,index)+'\n'+block+'\n'+source.slice(index);
 }
 // The game contains a printable HTML template with '</style>' inside a
 // JavaScript string. Locate real page style tags outside script bodies.
 const outer=source.replace(/<script(?:\s[^>]*)?>[\s\S]*?<\/script>/g,m=>' '.repeat(m.length));
 const index=outer.lastIndexOf(closingTag);assert(index!==-1,'Missing '+closingTag);
 return source.slice(0,index)+block+'\n'+source.slice(index);
}
function buildPage(source,{runtime,styles}){
 source=source.replace(/\r\n/g,'\n');
 assert(typeof runtime==='string'&&typeof styles==='string','Runtime and styles must be supplied');
 const built=collect(source);
 let output=insertBlock(source,STYLES_START,STYLES_END,styles,'</style>');
 output=insertBlock(output,RUNTIME_START,RUNTIME_END,'const IPA_EFFECT_MAPS = '+built.encoded+';\n'+runtime,'main-script-start');
 assert.equal(assignment(output,'DATA').line,built.data.line,'DATA changed while embedding effects');
 if(built.dictionary)assert.equal(assignment(output,'MT_PRONUNCIATIONS').line,built.dictionary.line,'Pronunciation dictionary changed while embedding effects');
 for(const match of output.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
 return {html:output,stats:built.stats};
}
function main(args=process.argv.slice(2)){
 assert(args.every(a=>['--check','--dry-run'].includes(a)),'Usage: node pipeline/ipa-effects/build.cjs [--check|--dry-run]');
 assert(!(args.includes('--check')&&args.includes('--dry-run')),'Choose either --check or --dry-run');
 const check=args.includes('--check'),dry=args.includes('--dry-run');
 const assets={runtime:fs.readFileSync(path.join(__dirname,'runtime.js'),'utf8'),styles:fs.readFileSync(path.join(__dirname,'styles.css'),'utf8')};
 // Validate all three pages before writing any page.
 const built=PAGES.map(file=>{const source=fs.readFileSync(path.join(ROOT,file),'utf8').replace(/\r\n/g,'\n');return {file,source,...buildPage(source,assets)};});
 for(const page of built){
  assert.equal(buildPage(page.html,assets).html,page.html,page.file+' effect builder is not idempotent');
  if(check)assert.equal(page.html,page.source,page.file+' generated effects are stale; run the IPA effect builder');
 }
 if(!check&&!dry)for(const page of built)fs.writeFileSync(path.join(ROOT,page.file),page.html);
 for(const page of built)console.log(JSON.stringify({file:page.file,action:check?'verified':dry?'previewed':'embedded',...page.stats}));
}
if(require.main===module)main();
module.exports={collect,buildPage,pronunciationEntry,insertBlock,main};
