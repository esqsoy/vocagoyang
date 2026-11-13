'use strict';
// 검사가 도는 교재 HTML 목록과 엔진 판별. 시험 단어장(pipeline/exam)은 HTML이 있는 것만 더한다.
// 파일 이름('fable' 포함)으로 FABLE 엔진을 가리지 않는다: 시험 단어장도 FABLE 엔진이다.
const fs=require('node:fs'),path=require('node:path');
const exam=require('../../exam/courses.cjs');
const root=path.resolve(__dirname,'../../..');
const BASE=['vocagoyangfable.html','vocagoyangksat2027.html','vocagoyangebs2027.html'];
const EXAMS=exam.examPages().map(p=>p.file);
const ALL=[...BASE,...EXAMS];
const cache=new Map();
const html=file=>{if(!cache.has(file))cache.set(file,fs.readFileSync(path.join(root,path.basename(file)),'utf8'));return cache.get(file);};
/* FABLE 엔진(예문 빈칸 문장·읽을 시간 예산·연습 나누기): FABLE과 시험 단어장 */
const isFableEngine=file=>exam.isFableEngine(html(file));
/* FABLE 교재 그 자체(FABLE 내용·FABLE 저장 키) */
const isFableCourse=file=>path.basename(file)==='vocagoyangfable.html';
const isExam=file=>exam.isExamHtml(html(file));
module.exports={root,BASE,EXAMS,ALL,isFableEngine,isFableCourse,isExam,html};
