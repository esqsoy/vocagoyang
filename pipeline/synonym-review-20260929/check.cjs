const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const html=fs.readFileSync(path.join(root,'vocagoyangfable.html'),'utf8');
const data=JSON.parse(html.match(/const DATA = ([^\n]+);\r?\n/)[1]);
const {review,restoreSynonymReview}=require('./restore.cjs');
const before=restoreSynonymReview(data);
const {restoreExampleTextColor}=require('../tests/helpers/example-text-color.cjs');
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const shell=restoreExampleTextColor(html).replace(/const (DATA|MORPHOLOGY|CONNECTIONS) = [^\n]+;\r?\n/g,'const $1 = CONTENT;\n').replace(/\r\n/g,'\n');
assert.equal(hash(shell),review.appShellSha256,'No gameplay, UI or answer-rule changes');
const identities=d=>d.map(L=>({...L,exercises:L.exercises.map(e=>({...e,words:e.words.map(w=>{const {ex,tr,c,...same}=w;return same;})}))}));
assert.deepEqual(identities(data),identities(before),'Inventory, senses, order, IPA, aliases and progress keys are unchanged');
const counts={cards:0,changedCards:review.changedCards,fields:review.changes.length,examples:0,translations:0,notes:0};
for(const L of data)for(const e of L.exercises)for(const w of e.words){
 counts.cards++;assert.equal((w.ex.match(/\{\{BLANK\}\}/g)||[]).length,1,w.word+' blank');
 if(w.reviewOf){const r=w.reviewOf,origin=data.find(x=>x.lesson===r.set).exercises.flatMap(x=>x.words).find(x=>x.word===r.word&&x.si===r.si);assert(origin);for(const k of ['ex','tr','c'])assert.equal(w[k],origin[k],w.word+' synchronized review');}
}
for(const c of review.changes){
 if(c.field==='ex')counts.examples++;
 if(c.field==='tr')counts.translations++;
 if(c.field==='c')counts.notes++;
 assert.equal(typeof c.new,'string');assert(!/[<>]/.test(c.new),'No raw HTML introduced');
}
assert.equal(counts.cards,6876);assert.equal(data.length,51);
console.log(JSON.stringify({...counts,inventory:'unchanged',answerRules:'unchanged',reviewCopies:'synchronized',gameplayAndUI:'unchanged',oldBaselines:'preserved'}));
