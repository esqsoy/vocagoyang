'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),check=process.argv.includes('--check');
const style=fs.readFileSync(path.join(__dirname,'style.css'),'utf8').trim(),runtime=fs.readFileSync(path.join(__dirname,'runtime.js'),'utf8').trim();
for(const [file,course] of [['vocagoyangfable.html','FABLE'],['vocagoyangksat2027.html','마더텅'],['vocagoyangebs2027.html','EBS']]){
 const target=path.join(root,file),before=fs.readFileSync(target,'utf8').replace(/\r\n/g,'\n');let html=before;
 const css='<style id="saved-cards-style">\n'+style+'\n</style>';
 if(html.includes('<style id="saved-cards-style">'))html=html.replace(/<style id="saved-cards-style">[\s\S]*?<\/style>/,()=>css);
 else html=html.replace('</head>',css+'\n</head>');
 const js='/* SAVED_CARDS_START */\nconst SAVED_COURSE='+JSON.stringify(course)+';\n'+runtime+'\nsavedInit();\n/* SAVED_CARDS_END */';
 if(html.includes('/* SAVED_CARDS_START */'))html=html.replace(/\/\* SAVED_CARDS_START \*\/[\s\S]*?\/\* SAVED_CARDS_END \*\//,()=>js);
 else {const at=html.lastIndexOf('\nrenderHome();');assert(at>=0,file);html=html.slice(0,at)+'\n'+js+html.slice(at);}
 if(check)assert.equal(before,html,file+' has stale saved-card runtime or styles');else fs.writeFileSync(target,html);
 console.log((check?'Verified ':'Updated ')+file);
}
