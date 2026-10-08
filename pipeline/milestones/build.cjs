'use strict';
// 외운 단어 돌파 축하(runtime.js·style.css)를 세 교재 HTML에 넣는다. --check는 HTML이 원본과 같은지만 본다.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),check=process.argv.includes('--check');
const style=fs.readFileSync(path.join(__dirname,'style.css'),'utf8').trim(),runtime=fs.readFileSync(path.join(__dirname,'runtime.js'),'utf8').trim();
for(const [file,course] of [['vocagoyangfable.html','fable'],['vocagoyangksat2027.html','ksat'],['vocagoyangebs2027.html','ebs']]){
 const target=path.join(root,file),before=fs.readFileSync(target,'utf8').replace(/\r\n/g,'\n');let html=before;
 const css='<style id="milestones-style">\n'+style+'\n</style>';
 if(html.includes('<style id="milestones-style">'))html=html.replace(/<style id="milestones-style">[\s\S]*?<\/style>/,()=>css);
 else html=html.replace('</head>',css+'\n</head>');
 const js='/* MILESTONES_START */\nconst MS_COURSE='+JSON.stringify(course)+';\n'+runtime+'\nmsInit();\n/* MILESTONES_END */';
 if(html.includes('/* MILESTONES_START */'))html=html.replace(/\/\* MILESTONES_START \*\/[\s\S]*?\/\* MILESTONES_END \*\//,()=>js);
 else {const at=html.lastIndexOf('\nrenderHome();');assert(at>=0,file);html=html.slice(0,at)+'\n'+js+html.slice(at);}
 if(check)assert.equal(before,html,file+' has stale milestone runtime or styles');else fs.writeFileSync(target,html);
 console.log((check?'Verified ':'Updated ')+file);
}
