'use strict';
/* 시험 단어장(토익·토플·GRE) 목록과 시험마다 다른 값. 구조와 명령은 README.md.
   - 시험 하나 = pipeline/exam/<id>/config.json 하나 + 저장소 맨 위 vocagoyang<id>.html 하나.
   - 엔진 원본은 토익 HTML이다. 다른 시험은 sync.cjs가 이 HTML을 복제해 설정 블록·DATA만 바꾼다.
   - 모듈 빌더(saved-cards·milestones·pace·ipa-effects)는 examPages()로 HTML이 있는 시험을 찾아 끼운다. */
const fs=require('node:fs'),path=require('node:path');
const DIR=__dirname,ROOT=path.resolve(DIR,'../..');
const ENGINE_ID='toeic';
const CONFIG_START='/* EXAM_CONFIG:START */',CONFIG_END='/* EXAM_CONFIG:END */';
// 시험 HTML에 남으면 안 되는 남의 저장 키 앞머리(FABLE 키). 시험 엔진은 FABLE에서 복제했다.
const FOREIGN_KEYS=['goyang-hoe-','goyang-fable-'];

function readConfig(file){
  const c=JSON.parse(fs.readFileSync(file,'utf8'));
  for(const k of ['id','name','title','heading'])if(typeof c[k]!=='string'||!c[k].trim())throw new Error(file+': '+k+' 칸이 없다');
  if(!/^[a-z][a-z0-9]*$/.test(c.id))throw new Error(file+': id는 영문 소문자·숫자('+c.id+')');
  if(!Array.isArray(c.sets))throw new Error(file+': sets 목록이 없다');
  return c;
}
/* config.json이 있는 시험. 엔진(토익)이 맨 앞. */
function examCourses(){
  return fs.readdirSync(DIR,{withFileTypes:true})
    .filter(d=>d.isDirectory()&&fs.existsSync(path.join(DIR,d.name,'config.json')))
    .map(d=>{const c=readConfig(path.join(DIR,d.name,'config.json'));
      if(c.id!==d.name)throw new Error(`pipeline/exam/${d.name}/config.json: id(${c.id})가 폴더 이름과 다르다`);
      return {...c,dir:path.join(DIR,d.name),file:fileOf(c.id)};})
    .sort((a,b)=>(a.id===ENGINE_ID?-1:b.id===ENGINE_ID?1:a.id<b.id?-1:1));
}
/* HTML까지 있는 시험(모듈 빌더·검사가 쓰는 목록). */
function examPages(){return examCourses().filter(c=>fs.existsSync(path.join(ROOT,c.file)));}
function fileOf(id){return 'vocagoyang'+id+'.html';}
function keysOf(id){
  return {STORAGE:`goyang-${id}-seoul-v1`,MODEKEY:`goyang-${id}-mode-v1`,LASTKEY:`goyang-${id}-seoul-last-v1`,UNIKEY:`goyang-${id}-uni-v1`};
}
/* HTML 설정 블록. 시험마다 다른 값은 여기 한 곳에만 둔다(제목·첫 화면 제목은 HTML 태그라 sync.cjs가 같이 쓴다). */
function configBlock(c){
  const exam={id:c.id,name:c.name,title:c.title,heading:c.heading,savedCourse:c.name,msCourse:c.id,paceCourse:c.id};
  const keys=keysOf(c.id);
  return [CONFIG_START,
    `/* 이 블록은 pipeline/exam/${c.id}/config.json에서 node pipeline/exam/sync.cjs가 만든다. 손으로 고치지 않는다. */`,
    'const EXAM='+JSON.stringify(exam)+';',
    ...Object.entries(keys).map(([k,v])=>`const ${k}=${JSON.stringify(v)};`),
    CONFIG_END].join('\n');
}
function isExamHtml(html){return html.includes(CONFIG_START);}
function isFableEngine(html){return /\bfunction splitExercises\(/.test(html);}
module.exports={DIR,ROOT,ENGINE_ID,CONFIG_START,CONFIG_END,FOREIGN_KEYS,readConfig,examCourses,examPages,fileOf,keysOf,configBlock,isExamHtml,isFableEngine};
