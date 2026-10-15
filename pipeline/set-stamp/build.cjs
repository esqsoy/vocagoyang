'use strict';
// 세트 완주 도장·FABLE 엔딩(runtime.js·style.css)을 FABLE HTML에만 넣는다. --check는 HTML이 원본과 같은지만 본다.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),check=process.argv.includes('--check');
// Git may check sources out as CRLF; generated HTML and checks use LF on every OS.
const readText=file=>fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
const style=readText(path.join(__dirname,'style.css')).trim(),runtime=readText(path.join(__dirname,'runtime.js')).trim();
const target=path.join(root,'vocagoyangfable.html'),before=readText(target);let html=before;
const css='<style id="set-stamp-style">\n'+style+'\n</style>';
if(html.includes('<style id="set-stamp-style">'))html=html.replace(/<style id="set-stamp-style">[\s\S]*?<\/style>/,()=>css);
else html=html.replace('</head>',css+'\n</head>');
const js='/* SET_STAMP_START */\n'+runtime+'\nstInit();\n/* SET_STAMP_END */';
if(html.includes('/* SET_STAMP_START */'))html=html.replace(/\/\* SET_STAMP_START \*\/[\s\S]*?\/\* SET_STAMP_END \*\//,()=>js);
else {const at=html.lastIndexOf('\nrenderHome();');assert(at>=0&&at>html.indexOf('/* PACE_END */'),'set-stamp goes after pace');html=html.slice(0,at)+'\n'+js+html.slice(at);}
if(check)assert.equal(before,html,'vocagoyangfable.html has stale set-stamp runtime or styles');else fs.writeFileSync(target,html);
console.log((check?'Verified ':'Updated ')+'vocagoyangfable.html');
