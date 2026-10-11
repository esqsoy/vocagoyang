'use strict';
const fs=require('fs'),cp=require('child_process');const root='C:/Users/Young/Documents/Codex/2026-09-18/new-chat/work/opus-review-20261011/repo';const gr='C:/Users/Young/Documents/Codex/2026-09-18/new-chat/work/release-20260919/repo';
const git=(rev,f)=>cp.execFileSync('git',['-c','safe.directory='+gr,'show',rev+':'+f],{cwd:gr,encoding:'utf8',maxBuffer:1<<28});const {runtime,candidates}=require(root+'/pipeline/set0-20261010/carry.cjs');const data=h=>JSON.parse(h.match(/^const DATA = (\[.*\]);\s*$/m)[1]);const h=fs.readFileSync(root+'/vocagoyangfable.html','utf8');const cur=runtime(h,fs.readFileSync(root+'/pipeline/saved-cards/runtime.js','utf8'),data(h));
const oh=git('59aaf81','vocagoyangfable.html'),old=runtime(oh,git('59aaf81','pipeline/saved-cards/runtime.js'),data(oh));let checked=0,known=0;const mismatches=[];
for(const c of candidates(old,old.state.lessons.map(L=>L.lesson))){
 const t=old.pick(c);checked++;if(!t)continue;known++;const a=cur.pick(c);const rest=old.flat.slice(old.flat.findIndex(x=>x.e===t.e&&x.L===t.L)).filter(x=>x.L===t.L).flatMap(x=>x.e.words);const anchor=rest.find(w=>cur.cards.get(w.savedCardId)?.L.lesson===t.L.lesson);const expected=anchor&&cur.cards.get(anchor.savedCardId);
 if(!expected||!a||a.li!==expected.li||a.ei!==expected.ei)mismatches.push({c,old:[t.L.id,t.e.title],actual:a&&[a.L.id,a.e.title],expected:expected&&[expected.L.id,expected.e.title]});
}
console.log(JSON.stringify({checked,known,count:mismatches.length,mismatches}));fs.writeFileSync('C:/Users/Young/Documents/Codex/2026-09-18/new-chat/work/opus-review-20261011/set0-historic-resumes.json',JSON.stringify({checked,known,mismatches},null,2));
