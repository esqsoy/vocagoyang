'use strict';
// 진행 속도 예측(runtime.js·style.css)을 세 교재 HTML에 넣는다. --check는 HTML이 원본과 같은지만 본다.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),check=process.argv.includes('--check');
// Git may check sources out as CRLF; generated HTML and checks use LF on every OS.
const readText=file=>fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
const style=readText(path.join(__dirname,'style.css')).trim(),runtime=readText(path.join(__dirname,'runtime.js')).trim();
for(const [file,course] of [['vocagoyangfable.html','fable'],['vocagoyangksat2027.html','ksat'],['vocagoyangebs2027.html','ebs']]){
 const target=path.join(root,file),before=readText(target);let html=before;
 const css='<style id="pace-style">\n'+style+'\n</style>';
 if(html.includes('<style id="pace-style">'))html=html.replace(/<style id="pace-style">[\s\S]*?<\/style>/,()=>css);
 else html=html.replace('</head>',css+'\n</head>');
 const js='/* PACE_START */\nconst PACE_COURSE='+JSON.stringify(course)+';\n'+runtime+'\npaceInit();\n/* PACE_END */';
 if(html.includes('/* PACE_START */'))html=html.replace(/\/\* PACE_START \*\/[\s\S]*?\/\* PACE_END \*\//,()=>js);
 else {const at=html.lastIndexOf('\nrenderHome();');assert(at>=0&&at>html.indexOf('/* MILESTONES_END */'),file);html=html.slice(0,at)+'\n'+js+html.slice(at);}
 if(check)assert.equal(before,html,file+' has stale pace runtime or styles');else fs.writeFileSync(target,html);
 console.log((check?'Verified ':'Updated ')+file);
}
