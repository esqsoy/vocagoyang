# 동의어 안내의 의미 명시 · 2026-09-29

사용자 후속 요청에 따라 지난 전수 검수에서 다룬 동의어 안내와 인접한 관련 해설을 재검토했다. 원본 해설 220개와 46세트 figure 참조 복습 1개, 총 **221개 해설**을 수정했다. 이번 후속은 6,876카드를 다시 전수 검수한 작업이 아니라 동의어 안내의 표현과 정확성을 확인한 작업이다.

## 학습 원칙

단어장은 모르는 단어와 덜 쓰는 표제어를 직접 익히는 것을 목표로 한다. 익숙한 동의어로 뜻을 맞혔다는 것과 해당 표제어를 학습했다는 것은 별개다. 언어적으로 맞는 대체어가 있으면 해설에서 인정하되, 이번 작업으로 새 정답을 추가하지 않는다. 이 원칙을 WORK_PLAN.md에 기록했으며 매 카드마다 게임 목적을 반복 설명하지 않는다.

같은 뜻으로 바꿔 쓸 수 있는 경우에는 그 사실을 명시한다. 필요한 경우 의미·결합 범위를 짧게 붙여 단어의 모든 뜻이 같다는 오해를 막는다. 뜻이 다른 경우에는 차이를 직접 설명한다. 기존 ALT·acceptedAnswers와 철자 변형 처리는 그대로 유지한다.

## 예시

- test: “학교 시험을 뜻할 때 exam과 같은 말. test는 성능·건강 검사에도 써.”
- set: “set/fix a date는 모두 날짜를 정하다. set a goal은 목표를 세우다.”
- fulfill: “fulfill/realize a dream은 같은 뜻: 꿈을 이루다.”
- conduct: “conduct/perform a test는 모두 검사를 실시하다. 이 결합에서는 뜻이 같아.”
- figure: “수치라는 뜻에서는 number와 같은 말. a six-figure salary는 여섯 자리 액수의 연봉.”
- secret: “secret은 남에게 알려지지 않은, hidden은 눈에 보이지 않게 숨겨진.”
- cope: “cope with/deal with는 모두 ~에 대처하다. cope는 어려움을 견디며 감당하는 데 초점.” 빈칸 뒤 with가 있으므로 완성 구문으로 비교한다.

서로 읽은 수정안을 대조하면서 reject a plan을 refuse a plan으로 그대로 바꾸라는 안내도 교정했다. 계획을 거절하는 reject a plan과 행동을 거부하는 refuse to do로 구문을 명시했다. [Oxford reject](https://www.oxfordlearnersdictionaries.com/us/definition/english/reject_1), [BBC 학습자료](https://downloads.bbc.co.uk/learningenglish/features/qanda/bbc_qanda_deny_reject_refuse.pdf).

within과 in은 동일어로 처리하지 않고 시간 상한과 소요 시간의 차이를 설명했다. [Cambridge within](https://dictionary.cambridge.org/grammar/british-grammar/within).

## 검증과 보존

- 변경 해설은 모두 70자 이하이며 old 값과 실제 카드의 일치를 확인했다.
- 예문·번역·표제어·뜻·IPA·정답·카드 순서·게임·UI·진도 키는 동일하다.
- 51세트·612연습·6,876카드 유지. 교재 두 과정의 파일도 동일하다.
- 이번 check, 이전 synonym-review check, IPA conservation, session, reading-core, morphology-content, connections-content, connections-input, pool-expansion, keyboard, spacing의 11개 검사 명령 통과.
- 7,344회 모의 플레이, 1,336개 결합 입력 경로, 과거 완료·이어하기 승계와 원본/HTML 동기화를 검사했다.
- 이전 검수 파일·해시는 변경하지 않았다. 새 restore.cjs가 이번 해설 수정만 되돌린 뒤 이전 검수의 복원과 검증을 수행한다.

배포 전 기준은 `de20aad`다. part-*.json은 원본 해설 제안 220개, findings.json은 참조 복습을 포함한 실제 생성 DATA 변경 221개다. apply.cjs는 해당 기준에서만 한 번 적용한다.
