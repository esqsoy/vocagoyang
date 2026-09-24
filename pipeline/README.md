# Fable 데이터와 검증 파이프라인

현재 구성과 교육적 합의는 [WORK_PLAN.md](../WORK_PLAN.md)를 기준으로 한다. 현재 0세트 포함 51세트, 613연습, 6,886카드다. 원본은 520개 주제 묶음이며 각 묶음을 표제어가 갈라지지 않는 11카드 중심의 연습으로 나눈다. 평균 11.2카드, 약 94%가 8~15카드다. 카드 수·표제어 수·어족 수는 서로 다른 집계다.

## 원본

- 0~4세트: out/lesson00.json ~ lesson04.json의 exercises.
- 5~45세트: out/set05.json ~ set45.json.
- 46세트: reading-core.json의 기존 카드 참조 목록.
- 47~48세트: morphology.json의 접사·어근 선정과 대표 카드.
- 49~50세트: connections.json의 전치사·동사 결합 카드.
- 후속 선정·전수 재독해 근거: connection-review/. selection-before-reread.json은 수정 이전의 역사적 선정안이다.
- 앱 코드와 스타일: ../vocagoyangfable.html.

out/set46~50.json은 조립 과정에서 생성된다. 이를 직접 수정하지 말고 해당 원본 JSON을 수정한다. assemble.py는 DATA와 READING_CORE, MORPHOLOGY, CONNECTIONS 메타데이터를 HTML에 함께 반영한다. HTML을 잃으면 Git에서 복원하고, 원본 JSON이 없거나 손상된 경우에만 disassemble.py로 HTML에서 복원한다.

DATA와 JSON의 exercises는 편집용 주제 묶음이다. 실제 연습은 HTML의 splitExercises(buildLessons())에서 구성한다. headwordRanges()는 같은 표제어의 첫 등장부터 마지막 등장 사이를 자르지 않는 경계만 허용한다. 그 경계 중에서 11카드에 가까운 분량과 여러 표제어의 혼합을 선호한다. 다의어를 한곳에 모으는 조건이 장수보다 우선하며 고정 상한은 없다. 현재 최대 15카드다. 원래 짧은 주제나 표제어 경계 때문에 일부 4~7카드 연습도 유지한다. 원본 순서·카드 내용·과정 참조는 유지한다.

긴 연습은 `Exercise 1-1`, `1-2`처럼 표시하며 각 부분에 독립된 완료 키를 둔다. 새 분할의 키는 heads-v3와 원본 카드 범위를 사용한다. 원래 묶음의 클리어는 모든 부분에 적용한다. short-v1과 heads-v2의 완료는 카드 범위로 합쳐 판단하며, 새 연습의 모든 카드가 포함돼야 클리어로 상속한다. 기록 조회는 저장된 데이터를 수정하지 않는다. saveLast는 layout을 함께 저장하며 버전별 이어하기를 카드가 겹치는 위치로 연결한다. heads-v2는 headwordRanges(words,8)로 복원하며 배포 당시 경계를 tests/headword-parts-v2.fixture.json과 대조한다. 이 복원 규칙은 후속 편집에서 임의로 바꾸지 않는다. 별도 주제에서 의도한 재학습은 그대로 둔다.

## 실행

저장소 루트에서:

```sh
python pipeline/assemble.py
node pipeline/tests/reading-core.test.cjs
node pipeline/tests/keyboard.test.cjs
node pipeline/tests/spacing.test.cjs
node pipeline/tests/session.test.cjs
node pipeline/tests/morphology-content.test.cjs
node pipeline/tests/connections-content.test.cjs
node pipeline/tests/connections-input.test.cjs
```

스크립트는 자신의 위치를 기준으로 경로를 해석한다. HTML에서 원본을 복원해야 할 때는 python pipeline/disassemble.py를 사용한다. 수정 후 조립하고 관련 검사를 실행한다.

## 유지할 조건

카드에는 표제어·정답·뜻·예문·번역·해설·발음·품사·뜻 번호가 들어간다. 예문은 하나의 {{BLANK}}를 사용하고 실제 뜻과 문맥이 일치해야 한다. 새 동사 결합의 대체 정답은 해당 카드의 acceptedAnswers로 관리하며 기존 일반 어휘 ALT와 섞지 않는다. 허용 답을 타이핑하는 중간에 자동으로 잘라 오답 처리하지 않는다.

채점에서 시간 종료 자체를 오답 조건으로 삼지 않는다. 강제 오답과 시간 종료는 구분한다. 한글 IME 조합 중에는 자동 제출하지 않는다. 공백을 입력 표시에 반영하되 정답 비교에서는 공백을 생략해도 인정한다. 기존 진도 키와 historical morphology progress/resume 연결은 가능한 범위에서 보존한다. 운영자는 대규모 개편에 필요한 기록 초기화도 허용했으며, 실제 적용 시 배포 안내에 초기화 범위를 명시한다. 학습 구성과 적절한 연습 분량을 우선한다.

같은 표제어는 다른 후보가 있을 때 연속 출제하지 않고, 마지막 한 단어만 남았을 때는 연속을 허용한다. 게임 방식의 추가 변경은 먼저 논의한다. 간격 복습은 현재 보류하며 별도로 연구·설계한다.

옛 audit.py/deepcheck.py 등은 생산 당시 규칙과 어휘 목록을 사용하므로 최신 과정의 뜻별 재학습·복수 단어 정답을 검토할 때는 tests/의 검사와 해당 과정 원본을 함께 확인한다. 과거 선정 자료에 표시된 상대 작업 경로는 당시 연구 기록이며 빌드 경로가 아니다.
