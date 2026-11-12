'use strict';
// 기록 옮기기 보카고양 검사. 합치기 규칙과 설정 공통 검사는 pipeline/record-transfer/test.cjs(같이 쓰는 파일)가 하고,
// 여기서는 보카고양 실제 저장 키가 맞는 종류로 가는지만 본다(26.11.12 나눔, SHARED.md).
const assert=require('node:assert/strict');
require('../record-transfer/test.cjs');
const rt=require('../record-transfer/merge.js');
function fakeStore(obj){const keys=Object.keys(obj);return {length:keys.length,key:i=>keys[i],getItem:k=>obj[k]??null};}

assert.equal(rt.RT_GAME,'보카고양');assert.equal(rt.RT_APP,'vocagoyang-records');
// 모으기: goyang- 키만, 검사용 전체 열기는 뺀다. 같은 주소의 분가·주기율표 키는 건드리지 않는다.
assert.deepEqual(Object.keys(rt.rtCollect(fakeStore({'goyang-hoe-seoul-v1':'{}','goyang-fable-unlock-v1':'1','zerotwo_save_v1':'x','tangogoyang-seoul-v1':'y','palagoyang-sonidos-seoul-v1':'z'}))),['goyang-hoe-seoul-v1']);
// 세 교재의 실제 키 → 종류
const want={
  'goyang-hoe-seoul-v1':'progress','goyang-seoul-v1':'progress','goyang-ebs-seoul-v1':'progress',
  'goyang-hoe-seoul-v1-saved-cards-v1':'saved','goyang-seoul-v1-saved-cards-v1':'saved','goyang-ebs-seoul-v1-saved-cards-v1':'saved',
  'goyang-learned-words-v1':'learned','goyang-missed-words-v1':'missed','goyang-milestone-v1':'milestone','goyang-fable-stamps-v1':'stamps',
  'goyang-pace-fable-v1':'pace','goyang-pace-ksat-v1':'pace','goyang-pace-ebs-v1':'pace',
  'goyang-pace-meta-fable-v1':'paceMeta','goyang-pace-meta-ksat-v1':'paceMeta','goyang-pace-meta-ebs-v1':'paceMeta',
  // 설정·이어하기 자리(이 기기에 없을 때만 가져온다)
  'goyang-hoe-last-v1':'keep','goyang-hoe-mode-v1':'keep','goyang-hoe-uni-v1':'keep','goyang-fable-level-v1':'keep',
  'goyang-seoul-last-v1':'keep','goyang-mode-v1':'keep','goyang-uni-v1':'keep',
  'goyang-ebs-seoul-last-v1':'keep','goyang-ebs-mode-v1':'keep','goyang-ebs-uni-v1':'keep'};
Object.entries(want).forEach(([k,kind])=>assert.equal(rt.rtKind(k),kind,k));
console.log('record-transfer: 보카고양 keys OK');
