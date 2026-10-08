# Fable 데이터와 검증 파이프라인

전체 작업을 이어갈 때는 [최신 인수인계](../HANDOFF.md)를 먼저 확인한다. 과정 공통의 예문형·단어형 배치와 발음 재생은 [UI 표준](../UI_STANDARD.md)을 따른다. 의미 있는 변경은 [작업 기록](../WORK_LOG.md)에 남긴다. 이 문서는 FABLE의 데이터 원본과 조립 방법을 다룬다. 마더텅 원문 발췌는 [별도 파이프라인](mother-tongue-excerpts/README.md)에 있다.

현재 구성과 교육적 합의는 [WORK_PLAN.md](../WORK_PLAN.md), 최신 카드·연습 수와 배포 상태는 [HANDOFF.md](../HANDOFF.md)를 기준으로 한다. 원본의 주제 묶음을 표제어가 갈라지지 않는 11카드 중심의 연습으로 나눈다. 일부 기초 주제는 exercise-topics.json의 경계를 우선한다. 카드 수·표제어 수·word family 수는 서로 다른 집계다.

## 개인 복습 카드

세 과정의 ‘모아둔 카드’ 원본은 `saved-cards/runtime.js`·`style.css`이며 `node pipeline/saved-cards/build.cjs`로 삽입한다. 검사 명령은 `node pipeline/saved-cards/build.cjs --check`와 `node pipeline/tests/saved-cards.test.cjs`다. 각 게임의 DATA·집계·정규 진도에는 넣지 않는다. [저장 범위·ID·게임 연결·검증](saved-cards/README.md)을 참고한다.

## 익힌 단어 돌파 축하

세 과정 공통 연출의 원본은 `milestones/runtime.js`·`style.css`다. `node pipeline/milestones/build.cjs`로 넣고, `--check`와 `node pipeline/tests/milestones.test.cjs`로 검사한다. 생성 구간은 `MILESTONES_START`~`MILESTONES_END`와 `<style id="milestones-style">`다. [안내](milestones/README.md)

## 학습 위치 조정 · 2026-10-03

`lesson-placement-20261003.json`은 0세트의 독해 핵심 보강 6묶음(77카드)을 화면상 45세트 뒤로 옮긴다. 조립 마지막 단계에서 적용하며, 단어 원본은 계속 `out/lesson00.json`이다. 46세트 등의 `ref.set=0`은 저작 원본 주소이므로 화면 위치에 맞춰 바꾸지 않는다. 표시 번호는 45세트 Exercise 9~14, 저장 키는 기존 0세트의 키를 유지한다. 원본을 직접 45세트에 중복 추가하지 않는다.

`restore-lesson-placement.cjs`는 기록된 이동만 역변환해 과거 검수의 고정 해시를 보존한다. `node pipeline/tests/lesson-placement.test.cjs`로 전체 카드 보존·완료 키와 이전/현재 이어하기를 확인한다.

후속 승인 배치는 `placement-review-20261003/placement.json`과 `placement_regrouping.py`가 적용한다. 기초 보강 36카드는 0→4, 서수 30카드는 1, 방위 10카드는 3으로 이동하고 a/an·left-wing/right-wing을 결합한다. 45의 잔여 5+5카드는 한 연습으로 합친다. 저작 원본은 이동하지 않으며 각 `cards` 참조는 `[원본 세트, 원본 exercise, 카드 인덱스]`다. 배치 변경 카드에는 원래 저장 ID를 남긴다. 원본 묶음·순서·카드 수를 바꾸려면 이 원장도 검토해야 한다.

`placementHistory`는 영향을 받은 이전 연습의 표제어·뜻 번호·기록 메타데이터만 보관한다. 표시 DATA를 다시 분할해 카드별 과거 완료 범위를 이행하고, 새 연습의 모든 카드가 완료됐을 때만 클리어를 상속한다. `node pipeline/tests/placement-regrouping.test.cjs`로 7,067개 ID·카드 내용, 부분 완료, 과거/현재 이어하기를 검사한다. `restore-lesson-placement.cjs`는 후속 배치를 먼저 역변환한 뒤 선행 0→45 이동을 복원한다. 역사적 해시를 새 값으로 덮어쓰지 않는다.

이 배치가 포함된 HTML은 `disassemble.py`로 원본에 직접 덮어쓸 수 없다. 잘못된 저작 위치 복원과 중복 배치를 막기 위해 실행을 중단한다. 원본 분실 시 Git에서 `pipeline/out`·선정 자료·배치 원장을 함께 복구한다.

## 원본

- 0~4세트: out/lesson00.json ~ lesson04.json의 exercises.
- 5~45세트: out/set05.json ~ set45.json.
- 46세트: reading-core.json의 기존 카드 참조 목록.
- 47~48세트: morphology.json의 접사·어근 선정과 대표 카드.
- 49~50세트: connections.json의 전치사·동사 결합 카드.
- 후속 선정·전수 재독해 근거: connection-review/. selection-before-reread.json은 수정 이전의 역사적 선정안이다.
- 앱 코드와 스타일: ../vocagoyangfable.html.

5~45세트 원본의 묶음 이름은 보통 번호 범위(`2484~2493`)다. 26.10.08 지식 예문 작업으로 16·26·34·42세트 끝에 붙인 '지식 어휘 Ⅰ~Ⅳ'는 범위가 없는 이름이고, 세트 이름의 범위는 범위가 있는 묶음만으로 계산한다([근거](../PRINCIPLES.md#2-6-지식-예문은-지도부터-막히는-어휘는-더한다)).

out/set46~50.json은 조립 과정에서 생성된다. 이를 직접 수정하지 말고 해당 원본 JSON을 수정한다. assemble.py는 DATA와 READING_CORE, MORPHOLOGY, CONNECTIONS 메타데이터를 HTML에 함께 반영한다. HTML을 잃으면 Git에서 복원하고, 원본 JSON이 없거나 손상된 경우에만 disassemble.py로 HTML에서 복원한다.

DATA와 JSON의 exercises는 편집용 주제 묶음이다. 실제 연습은 HTML의 splitExercises(buildLessons())에서 구성한다. headwordRanges()는 같은 표제어의 첫 등장부터 마지막 등장 사이를 자르지 않는 경계만 허용한다. 그 경계 중에서 11카드에 가까운 분량과 여러 표제어의 혼합을 선호한다. 다의어를 한곳에 모으는 조건이 장수보다 우선하며 고정 상한은 없다. 현재 최대 15카드다. 원래 짧은 주제나 표제어 경계 때문에 일부 4~7카드 연습도 유지한다. 원본 순서·카드 내용·과정 참조는 유지한다.

긴 연습은 `Exercise 1-1`, `1-2`처럼 표시하며 각 부분에 독립된 완료 키를 둔다. 일반 분할의 키는 heads-v3와 원본 카드 범위를 사용하고, 이번 주제 경계 변경 부분은 topics-v4 키를 사용한다. 원래 묶음의 클리어는 당시 포함했던 카드에 적용한다. 새로 추가된 March·May를 포함한 월 연습은 이전 묶음 완료만으로 자동 완료되지 않는다. short-v1과 heads-v2의 완료는 카드 범위로 합쳐 판단하며, 새 연습의 모든 카드가 포함돼야 클리어로 상속한다. 기록 조회는 저장된 데이터를 수정하지 않는다. saveLast는 layout을 함께 저장하며 버전별 이어하기를 카드가 겹치는 위치로 연결한다. heads-v2는 headwordRanges(words,8)로 복원하며 배포 당시 경계를 tests/headword-parts-v2.fixture.json과 대조한다. 이 복원 규칙은 후속 편집에서 임의로 바꾸지 않는다. 별도 주제에서 의도한 재학습은 그대로 둔다.

## 실행

저장소 루트에서:

```sh
python pipeline/assemble.py
node pipeline/tests/reading-core.test.cjs
node pipeline/tests/keyboard.test.cjs
node pipeline/tests/spacing.test.cjs
node pipeline/tests/session.test.cjs
node pipeline/tests/morphology-content.test.cjs
node pipeline/tests/morphology-expansion.test.cjs
node pipeline/tests/suffix-expansion.test.cjs
node pipeline/tests/connections-content.test.cjs
node pipeline/tests/connections-input.test.cjs
node pipeline/tests/pool-expansion.test.cjs
```

스크립트는 자신의 위치를 기준으로 경로를 해석한다. HTML에서 원본을 복원해야 할 때는 python pipeline/disassemble.py를 사용한다. 수정 후 조립하고 관련 검사를 실행한다.

## 유지할 조건

세계사·과학사 예문 교체의 현재 검토 자료는 [history-review-20261007](history-review-20261007/README.md)에 있다. 전체 7,067카드의 유지/후보 판정과 72개 사실 목록을 보관한다. 사용자 확인 전의 후보·문장 제안은 조립 입력이 아니며 게임에 자동 반영하지 않는다. 확인된 첫 30장은 시기 보강 후 원본에 적용했고, 적용 원장은 history-review-20261007/application-01.json이다. 실제 반영 단계에서 원본 경로를 찾아 수정하고 해당 변경만 보존 검사의 원장에 추가한다.

2026-10-07 FABLE 1세트 Exercise 11-2 역사 날짜 예문과 공식 확인 출처는 `player-feedback-20261007.json`에 기록한다. 저작 원본은 `out/set40.json`·`out/set43.json`·`out/set44.json`이며 학습 배치에서 1세트로 이동한 것이다. 9카드의 예문·해석 및 관련 해설 3개를 바꿨고, 같은 날 앞선 3카드 초안을 대체한다. `restore-player-feedback-20261007.cjs`가 기록된 21필드만 역변환해 과거 배치·내용 검사의 고정 해시를 유지한다. 실제 최신 카드·학습 결과와 과거 단계 보존 검사를 구분한다.

### 인덱스 단어 수 자동 갱신

`index-stats.cjs`가 세 게임 HTML의 실제 `DATA`를 읽어 `index.html`의 `VOCAB_STATS` 구간만 갱신한다. 브라우저에서 게임 파일을 추가로 내려받거나 계산하지 않는다. 숫자를 손으로 고치지 않는다.

- 표제어는 `word` 우선, 없으면 `en`이다. 대소문자·앞뒤 공백·중복 공백·유니코드 조합 차이를 통일한다. 다의어·복습 카드는 같은 표제어로 한 번만 센다.
- 등록된 구 표현을 포함하고 마더텅은 `prev`를 포함한 전체 기출 기준이다. 현재 플레이어의 범위 선택·완료 기록과 무관하다.
- FABLE → 마더텅 → EBS 순서로 집계한다. **중복 제외**는 앞 과정들에 없는 표제어 수, **누적**은 지금까지의 합집합이다.
- `seam.py`와 같은 등록 표제어 문자열 기준을 따른다. 영미 철자·괄호 주석·선택형·동의어를 임의로 합치거나 자동 원형화하지 않는다. 예를 들어 `recognise(=recognize)`와 `recognize`는 다른 등록 표제어다. 사전적 어휘 수나 word family 수를 산정하는 도구가 아니다. `직독직해선 95%`라는 기존 문구는 이 계산의 산출값이 아니다.
- `python pipeline/assemble.py` 실행 뒤 자동 갱신한다(**Node.js 필요**). 마더텅 발췌 빌더와 세 과정 공통 IPA 빌더에서도 자동 갱신하며, 두 빌더의 `--check`는 인덱스가 오래됐을 때도 실패한다. IPA의 `--dry-run`은 인덱스도 읽기만 한다.
- 원본 JSON을 수정했다면 먼저 해당 데이터 빌드를 실행한다. HTML의 DATA를 직접 바꾼 경우에는 공통 IPA 빌드 또는 아래 명령으로 갱신한다. 배포 전 `--check`로 최신 수치임을 확인한다.

```sh
node pipeline/index-stats.cjs
node pipeline/index-stats.cjs --check
node pipeline/tests/index-stats.test.cjs
```

명령 출력에는 과정별 카드·고유 표제어·앞 과정과의 중복·추가·누적 수가 모두 포함된다. 과정 추가 시 `COURSES` 순서와 인덱스의 대응 구간을 함께 추가한다.

### 내용·게임 유지 기준

2026-09-29 후속 동의어 표현 개선: 같은 뜻으로 바꿔 쓰는 관계를 명시하고 의미 차이는 구별한다. 새 정답은 추가하지 않는다. [학습 목적과 221개 해설 수정](synonym-wording-20260929/REPORT.md). 검사는 `node pipeline/synonym-wording-20260929/check.cjs`로 실행한다.

2026-09-29 유의어·예문 전수 검수는 [검수 기록](synonym-review-20260929/REPORT.md)과 `synonym-review-20260929/findings.json`에 남겼다. 이번에 발견한 대체어는 해설에만 안내하며 새 ALT·acceptedAnswers를 추가하지 않는다. `node pipeline/synonym-review-20260929/check.cjs`로 490필드 이외의 데이터·UI 불변과 참조 복습 동기화를 확인한다. 과거 검사 기준은 `restore.cjs`로 기록된 편집만 역변환해 유지한다.

카드에는 표제어·정답·뜻·예문·번역·해설·발음·품사·뜻 번호가 들어간다. 예문은 하나의 {{BLANK}}를 사용하고 실제 뜻과 문맥이 일치해야 한다. 새 동사 결합의 대체 정답은 해당 카드의 acceptedAnswers로 관리하며 기존 일반 어휘 ALT와 섞지 않는다. 허용 답을 타이핑하는 중간에 자동으로 잘라 오답 처리하지 않는다.

채점에서 시간 종료 자체를 오답 조건으로 삼지 않는다. 강제 오답과 시간 종료는 구분한다. 한글 IME 조합 중에는 자동 제출하지 않는다. 공백을 입력 표시에 반영하되 정답 비교에서는 공백을 생략해도 인정한다. 기존 진도 키와 historical morphology progress/resume 연결은 가능한 범위에서 보존한다. 운영자는 대규모 개편에 필요한 기록 초기화도 허용했으며, 실제 적용 시 배포 안내에 초기화 범위를 명시한다. 학습 구성과 적절한 연습 분량을 우선한다.

같은 표제어는 다른 후보가 있을 때 연속 출제하지 않고, 마지막 한 단어만 남았을 때는 연속을 허용한다. 게임 방식의 추가 변경은 먼저 논의한다. 간격 복습은 현재 보류하며 별도로 연구·설계한다.

옛 audit.py/deepcheck.py 등은 생산 당시 규칙과 어휘 목록을 사용하므로 최신 과정의 뜻별 재학습·복수 단어 정답을 검토할 때는 tests/의 검사와 해당 과정 원본을 함께 확인한다. 과거 선정 자료에 표시된 상대 작업 경로는 당시 연구 기록이며 빌드 경로가 아니다.

## 주제별 연습 경계 (2026-09-27)

`exercise-topics.json`은 기본 11카드 분할을 덮어쓸 소수의 주제 경계를 정의한다. `through`는 해당 표제어의 마지막 뜻까지 포함한다. `assemble.py`가 경계를 검증하고 `practiceParts`와 기존 카드 위치를 생성한다. March·May의 월 의미는 원래 세트의 카드를 참조해 복습용으로 추가하며 원본 단어장에서는 옮기지 않는다. 이전 카드 목록은 진도 보존에 사용하므로 직접 고치지 않는다.

현재 변경 목록과 검증: [주제 경계 검토](topic-review-20260927/report.md). `reading-core.test.cjs`는 요일·월의 완결성, 관련 단어의 경계, 이전 완료·이어하기 기록을 검사한다.

## 승인된 어휘 풀 보완 (2026-09-27)

17카드 추가·중복 2카드 통합으로 6,876카드가 됐다. 구성 변경 원본 16묶음에만 새 progressId를 적용하며 저장된 기록은 삭제하지 않는다. 나머지 완료·이어하기는 그대로다. [변경 전체](pool-expansion-20260927/REPORT.md), [전후 데이터](pool-expansion-20260927/findings.json)를 참고한다. restorePoolExpansion()은 최신 풀을 직전 검수 기준으로 되돌려 과거 참조·검수 해시를 보존한다.
