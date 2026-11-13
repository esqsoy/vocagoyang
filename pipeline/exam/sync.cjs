#!/usr/bin/env node
'use strict';
/* 시험 단어장 HTML 맞추기. 엔진 원본은 토익 HTML(vocagoyangtoeic.html)이다.
   pipeline/exam/<id>/config.json이 있는 시험마다:
     - 설정 블록(EXAM_CONFIG)·<title>·첫 화면 제목을 config.json으로 다시 쓴다.
     - 토익이 아닌 시험은 토익 엔진을 그대로 복제하고, 그 시험의 DATA·발음 효과 표(IPA_EFFECT_MAPS·PRONUNCIATION_AUDIO_MAP)만 지킨다.
       처음 만들 때는 DATA가 비어 있다. 다음에 assemble.py와 ipa-effects/build.cjs를 돌린다.
   사용: node pipeline/exam/sync.cjs [--check]
     --check: 쓰지 않고, 시험마다 설정 블록이 config.json과 같은지·엔진 부분이 토익 엔진과 같은지·FABLE 저장 키가 없는지 본다. */
const fs=require('node:fs'),path=require('node:path');
const C=require('./courses.cjs');
const check=process.argv.includes('--check');
const readText=f=>fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');
const escHtml=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function once(html,re,what,file){const m=html.match(new RegExp(re.source,re.flags.replace('g','')+'g'));if(!m||m.length!==1)throw new Error(`${file}: ${what}가 ${m?m.length:0}개(하나여야 한다)`);}
const RE={
  config:/\/\* EXAM_CONFIG:START \*\/[\s\S]*?\/\* EXAM_CONFIG:END \*\//,
  title:/<title>[^<]*<\/title>/,
  heading:/<h2 id="homeTitle">[^<]*<\/h2>/,
  data:/^const DATA = [^\n]*;$/m,
  maps:/^const IPA_EFFECT_MAPS = [^\n]*;$/m,
  audio:/^const PRONUNCIATION_AUDIO_MAP = [^\n]*;$/m,
};
function shape(html,file){for(const [k,re] of Object.entries(RE))once(html,re,k,file);}
/* 시험마다 다른 부분을 지운 나머지 = 엔진 부분 */
function engineOf(html){let s=html;for(const re of Object.values(RE))s=s.replace(re,'<<'+re.source.slice(0,12)+'>>');return s;}
function withConfig(html,c){
  return html.replace(RE.config,()=>C.configBlock(c))
    .replace(RE.title,()=>`<title>${escHtml(c.title)}</title>`)
    .replace(RE.heading,()=>`<h2 id="homeTitle">${escHtml(c.heading)}</h2>`);
}
function foreignKeys(html){return C.FOREIGN_KEYS.filter(k=>html.includes(k));}

const engineFile=path.join(C.ROOT,C.fileOf(C.ENGINE_ID));
if(!fs.existsSync(engineFile)){console.error(`엔진 원본 ${C.fileOf(C.ENGINE_ID)}가 없다`);process.exit(1);}
const engine=readText(engineFile);shape(engine,C.fileOf(C.ENGINE_ID));
if(!C.isFableEngine(engine)){console.error('엔진 원본이 FABLE 엔진이 아니다(splitExercises 없음)');process.exit(1);}
const problems=[];
for(const c of C.examCourses()){
  const target=path.join(C.ROOT,c.file),exists=fs.existsSync(target),before=exists?readText(target):null;
  let out=withConfig(engine,c);
  if(c.id!==C.ENGINE_ID){
    // 이 시험의 DATA·발음 표는 지킨다(없으면 빈 것으로 시작).
    const keep=before?Object.fromEntries(['data','maps','audio'].map(k=>[k,before.match(RE[k])?.[0]])):{};
    out=out.replace(RE.data,()=>keep.data||'const DATA = [];')
      .replace(RE.maps,()=>keep.maps||'const IPA_EFFECT_MAPS = {};')
      .replace(RE.audio,()=>keep.audio||'const PRONUNCIATION_AUDIO_MAP = {};');
  }
  const bad=foreignKeys(out);
  if(bad.length)problems.push(`${c.file}: FABLE 저장 키 글자 ${bad.join(', ')}가 남았다(엔진에서 지운다)`);
  if(check){
    if(!exists){problems.push(`${c.file}: 없다(node pipeline/exam/sync.cjs로 만든다)`);continue;}
    try{shape(before,c.file);}catch(e){problems.push(e.message);continue;}
    if(engineOf(before)!==engineOf(engine))problems.push(`${c.file}: 엔진 부분이 ${C.fileOf(C.ENGINE_ID)}와 다르다(node pipeline/exam/sync.cjs)`);
    else if(before!==out)problems.push(`${c.file}: 설정 블록·제목이 pipeline/exam/${c.id}/config.json과 다르다(node pipeline/exam/sync.cjs)`);
    const leftover=foreignKeys(before);if(leftover.length&&!bad.length)problems.push(`${c.file}: FABLE 저장 키 글자 ${leftover.join(', ')}`);
    if(!problems.some(p=>p.startsWith(c.file)))console.log('Verified '+c.file);
  }else{
    if(before!==out){fs.writeFileSync(target,out);console.log((exists?'Updated ':'Created ')+c.file+(exists||c.id===C.ENGINE_ID?'':' (DATA 비어 있음: assemble.py → ipa-effects/build.cjs)'));}
    else console.log('Unchanged '+c.file);
  }
}
if(problems.length){console.error(problems.join('\n'));process.exit(1);}
