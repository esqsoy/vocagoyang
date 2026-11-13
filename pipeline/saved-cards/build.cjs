'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),check=process.argv.includes('--check');
// Git may check sources out as CRLF; generated HTML and checks use LF on every OS.
const readText=file=>fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
const style=readText(path.join(__dirname,'style.css')).trim(),runtime=readText(path.join(__dirname,'runtime.js')).trim();
// 시험 단어장(pipeline/exam)은 설정 블록의 교재 이름을 쓰고, 카드 ID는 [표제어, 뜻 번호]다(README '카드 ID').
const exams=require('../exam/courses.cjs').examPages().map(p=>[p.file,'EXAM.savedCourse,SAVED_ID_KIND="word-si"']);
for(const [file,course] of [['vocagoyangfable.html','FABLE'],['vocagoyangksat2027.html','마더텅'],['vocagoyangebs2027.html','EBS'],...exams]){
 const target=path.join(root,file),before=readText(target);let html=before;
 const css='<style id="saved-cards-style">\n'+style+'\n</style>';
 if(html.includes('<style id="saved-cards-style">'))html=html.replace(/<style id="saved-cards-style">[\s\S]*?<\/style>/,()=>css);
 else html=html.replace('</head>',css+'\n</head>');
 const js='/* SAVED_CARDS_START */\nconst SAVED_COURSE='+(course.startsWith('EXAM.')?course:JSON.stringify(course))+';\n'+runtime+'\nsavedInit();\n/* SAVED_CARDS_END */';
 if(html.includes('/* SAVED_CARDS_START */'))html=html.replace(/\/\* SAVED_CARDS_START \*\/[\s\S]*?\/\* SAVED_CARDS_END \*\//,()=>js);
 else {const at=html.lastIndexOf('\nrenderHome();');assert(at>=0,file);html=html.slice(0,at)+'\n'+js+html.slice(at);}
 if(check)assert.equal(before,html,file+' has stale saved-card runtime or styles');else fs.writeFileSync(target,html);
 console.log((check?'Verified ':'Updated ')+file);
}
