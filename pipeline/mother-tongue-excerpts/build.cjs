const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
assert(process.argv.slice(2).length<=1&&process.argv.slice(2).every(arg=>arg==='--check'),'Usage: node pipeline/mother-tongue-excerpts/build.cjs [--check]');
const dir=__dirname,file=path.join(dir,'../../vocagoyangksat2027.html');
const html=fs.readFileSync(file,'utf8');
const vocabulary=JSON.parse(html.match(/^const DATA = (\[.*\]);\s*$/m)[1]);
const expected=new Map(vocabulary.flatMap(l=>l.exercises.flatMap(e=>e.words.map((w,i)=>[[l.lesson,e.scope||'2026',e.ex,i].join('/'),w.en]))));
const rows=fs.readFileSync(path.join(dir,'records.jsonl'),'utf8').trim().split(/\r?\n/).map(s=>JSON.parse(s));
assert.equal(rows.length,expected.size,'Every original card needs one editorial record');
const runtime=fs.readFileSync(path.join(dir,'runtime.js'),'utf8').trimEnd(),helpers={};vm.runInNewContext(runtime,helpers);
const contexts={},seen=new Set(),stats={cards:rows.length,excerpts:0,holds:0,sourceOnly:0,notes:0,meaningChanges:0};
for(const r of rows){
 const key=[r.lesson,r.scope,r.ex,r.index].join('/');assert(!seen.has(key),'Duplicate '+key);seen.add(key);assert.equal(r.term,expected.get(key),'Changed term or index '+key);
 assert(Number.isInteger(r.page)&&r.page>0&&r.page<=330,'Invalid source page '+key);
 if(r.status==='hold'){assert(r.reason,'Missing hold reason '+key);stats.holds++;continue;}
 assert.equal(r.status,'reviewed');assert(r.example&&r.surface&&r.translation,'Incomplete record '+key);
 assert(['body','choice','footnote'].includes(r.sourceKind),'Invalid source kind '+key);
 assert(r.example.includes(r.surface)||(r.surfaceParts?.length&&r.surfaceParts.every(s=>r.example.includes(s))),'Missing source form '+key);
 const ranges=helpers.mtRanges(r,r.term);assert(ranges.length,'No target range '+key);
 let remainder=r.example;for(const [a,b] of [...ranges].reverse())remainder=remainder.slice(0,a)+remainder.slice(b);
 if(!/[A-Za-zÀ-ɏ]/.test(remainder)){stats.sourceOnly++;continue;}
 for(const extra of r.maskSurfaces||[])assert(r.example.toLowerCase().includes(extra.toLowerCase()),'Missing extra source form '+key);
 contexts[key]={example:r.example,translation:r.translation,surface:r.surface,sourceKind:r.sourceKind,page:r.page,...(r.note?{note:r.note}:{}),...(r.contextMeaning?{contextMeaning:r.contextMeaning}:{}),...(r.surfaceParts?.length?{surfaceParts:r.surfaceParts}:{}),...(r.maskSurfaces?.length?{maskSurfaces:r.maskSurfaces}:{})};
 stats.excerpts++;if(r.note)stats.notes++;if(r.contextMeaning)stats.meaningChanges++;
}
function section(text,start,end,body){const a=text.indexOf(start),b=text.indexOf(end);assert(a>=0&&b>a,'Missing generated markers');return text.slice(0,a+start.length)+'\n'+body+'\n'+text.slice(b);}
let result=section(html,'/* MT_EXCERPTS_RUNTIME_START */','/* MT_EXCERPTS_RUNTIME_END */','const MT_CONTEXTS='+JSON.stringify(contexts).replace(/</g,'\\u003c')+';\n'+runtime);
result=section(result,'/* MT_EXCERPTS_STYLE_START */','/* MT_EXCERPTS_STYLE_END */',fs.readFileSync(path.join(dir,'style.css'),'utf8').trimEnd());
if(process.argv.includes('--check'))assert.equal(result,html,'Run node pipeline/mother-tongue-excerpts/build.cjs to refresh embedded excerpts');
else fs.writeFileSync(file,result,'utf8');
require('../index-stats.cjs').updateIndex({check:process.argv.includes('--check')});
console.log(JSON.stringify(stats));
